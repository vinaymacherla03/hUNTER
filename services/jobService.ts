
import { ResumeData, JobListing } from '../types';
import { db } from './firebase';
import { doc, getDoc, setDoc } from 'firebase/firestore';
import { findMatchingJobs } from './geminiService';

export interface JobSearchParams {
    query: string;
    location: string;
    filters: {
        remote: boolean;
        salary: string;
        experience: string;
    };
    page?: number;
}

export interface JobSearchResult {
    marketSummary: string;
    jobs: JobListing[];
    source: 'cache' | 'live';
    cachedAt?: number;
}

const CACHE_COLLECTION = 'job_searches_v3';
// Requirement: Cache should last 15 days
const CACHE_DURATION_MS = 15 * 24 * 60 * 60 * 1000;

/**
 * 53-bit hash function (cyrb53) for collision-resistant short keys.
 */
const cyrb53 = (str: string, seed = 0) => {
    let h1 = 0xdeadbeef ^ seed, h2 = 0x41c6ce57 ^ seed;
    for (let i = 0, ch; i < str.length; i++) {
        ch = str.charCodeAt(i);
        h1 = Math.imul(h1 ^ ch, 2654435761);
        h2 = Math.imul(h1 ^ ch, 1597334677);
    }
    h1 = Math.imul(h1 ^ (h1 >>> 16), 2246822507) ^ Math.imul(h2 ^ (h2 >>> 13), 3266489909);
    h2 = Math.imul(h2 ^ (h2 >>> 16), 2246822507) ^ Math.imul(h1 ^ (h1 >>> 13), 3266489909);
    return 4294967296 * (2097151 & h2) + (h1 >>> 0);
};

export class JobService {
    // L1 Memory Cache for session speed
    private static memoryCache = new Map<string, JobSearchResult>();
    
    // Deduplicate identical requests in-flight
    private static inFlightRequests = new Map<string, Promise<JobSearchResult>>();
    
    /**
     * Generates a key that allows different users to share results for the same query/location.
     * We normalize the inputs to ensure cross-user hits.
     */
    private static generateCacheKey(params: JobSearchParams): string {
        const normalized = {
            q: params.query.trim().toLowerCase(),
            l: params.location.trim().toLowerCase(),
            r: params.filters.remote,
            s: params.filters.salary,
            e: params.filters.experience,
            p: params.page || 1
        };
        const hash = cyrb53(JSON.stringify(normalized));
        return `global_search_${hash}`;
    }

    /**
     * Searches for jobs with deep multi-layer global caching.
     * AI Intelligence is performed on cache misses and shared with the entire user base.
     */
    static async search(resumeData: ResumeData, params: JobSearchParams): Promise<JobSearchResult> {
        const page = Math.max(1, Math.floor(Number(params.page) || 1));
        const cacheKey = this.generateCacheKey({ ...params, page });

        // 1. Check L1 Memory Cache (Fastest, session-specific)
        if (this.memoryCache.has(cacheKey)) {
            const cached = this.memoryCache.get(cacheKey)!;
            const age = Date.now() - (cached.cachedAt || 0);
            if (age < CACHE_DURATION_MS) {
                console.log(`[JobService] L1 Global Cache Hit: ${params.query}`);
                return { ...cached, source: 'cache' };
            }
        }

        // 2. Prevent redundant simultaneous fetches for the same query
        if (this.inFlightRequests.has(cacheKey)) {
            console.log(`[JobService] Concurrency Protection: Deduplicating search for ${params.query}`);
            return this.inFlightRequests.get(cacheKey)!;
        }

        const fetchPromise = (async (): Promise<JobSearchResult> => {
            try {
                // 3. Check L2 Persistent Global Cache (Firestore)
                // This allows User B to see results fetched by User A
                if (db) {
                    try {
                        const docRef = doc(db, CACHE_COLLECTION, cacheKey);
                        const docSnap = await getDoc(docRef);

                        if (docSnap.exists()) {
                            const data = docSnap.data() as JobSearchResult;
                            const age = Date.now() - (data.cachedAt || 0);
                            
                            if (age < CACHE_DURATION_MS) {
                                console.log(`[JobService] L2 Global Cloud Cache Hit: ${params.query}`);
                                const result: JobSearchResult = { ...data, source: 'cache' };
                                this.memoryCache.set(cacheKey, result);
                                return result;
                            }
                        }
                    } catch (e) {
                        console.warn("[JobService] Cloud Cache retrieval error", e);
                    }
                }

                // 4. Live Fetch + AI Enrichment (Cache Miss)
                // Use findMatchingJobs which includes TheirStack fetch + Gemini market analysis
                console.log(`[JobService] Live Search + AI Intelligence Dispatch: ${params.query}`);
                const enrichedData = await findMatchingJobs(
                    resumeData, 
                    params.location, 
                    params.query, 
                    params.filters
                );
                
                const finalResult: JobSearchResult = { 
                    ...enrichedData, 
                    source: 'live', 
                    cachedAt: Date.now() 
                };

                // Update Local Memory
                this.memoryCache.set(cacheKey, finalResult);

                // Update Cloud Cache (Share with world)
                if (db) {
                    try {
                        const docRef = doc(db, CACHE_COLLECTION, cacheKey);
                        await setDoc(docRef, {
                            ...finalResult,
                            expiresAt: Date.now() + CACHE_DURATION_MS
                        });
                        console.log("[JobService] Intelligence broadcasted to cloud cache.");
                    } catch (e) {
                        console.warn("[JobService] Cloud Cache sync failed", e);
                    }
                }

                return finalResult;
            } finally {
                this.inFlightRequests.delete(cacheKey);
            }
        })();

        this.inFlightRequests.set(cacheKey, fetchPromise);
        return fetchPromise;
    }
}
