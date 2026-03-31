
import { JobService } from './jobService';
import { findMatchingJobs } from './geminiService';
import { ResumeData } from '../types';

// Fix for missing Jest types in this context
declare const jest: any;
declare const describe: any;
declare const it: any;
declare const beforeEach: any;
declare const expect: any;

// --- MOCKS ---

// Mock Gemini Service
jest.mock('./geminiService', () => ({
    findMatchingJobs: jest.fn()
}));

// Mock Firebase
const mockGetDoc = jest.fn();
const mockSetDoc = jest.fn();
const mockDoc = jest.fn();

jest.mock('firebase/firestore', () => ({
    getFirestore: jest.fn(),
    doc: (...args: any[]) => mockDoc(...args),
    getDoc: (...args: any[]) => mockGetDoc(...args),
    setDoc: (...args: any[]) => mockSetDoc(...args)
}));

jest.mock('./firebase', () => ({
    db: {} // Truthy object to enable cache path
}));

// --- TEST DATA ---

const mockResumeData: ResumeData = {
    fullName: 'Test User',
    title: 'Developer',
    contactInfo: { email: 'test@test.com', location: 'Test City', phone: '123', linkedin: '' },
    summary: 'Summary',
    experience: [],
    education: [],
    skills: []
};

const mockSearchParams = {
    query: 'React Developer',
    location: 'Remote',
    filters: { remote: true, salary: '', experience: '' },
    page: 1
};

const mockGeminiResponse = {
    marketSummary: "Market is hot.",
    jobs: [
        { id: "1", company: "Tech Co", role: "Dev", link: "http://test.com", summary: "Great job" }
    ]
};

const mockCachedResponse = {
    ...mockGeminiResponse,
    source: 'live',
    cachedAt: Date.now()
};

// --- TESTS ---

describe('JobService', () => {
    
    beforeEach(() => {
        jest.clearAllMocks();
        
        // Access private static member for testing isolation (if possible in environment, else relies on public behavior)
        (JobService as any).memoryCache = new Map();
        (JobService as any).inFlightRequests = new Map();

        // Reset console warnings to avoid cluttering test output
        jest.spyOn(console, 'warn').mockImplementation(() => {});
        jest.spyOn(console, 'log').mockImplementation(() => {});
        jest.spyOn(console, 'error').mockImplementation(() => {});
    });

    describe('L2 Caching (Central Database)', () => {
        it('should return cached data if valid (Cache Hit)', async () => {
            // Setup Cache Hit
            mockDoc.mockReturnValue('mock-doc-ref');
            mockGetDoc.mockResolvedValue({
                exists: () => true,
                data: () => mockCachedResponse
            });

            const result = await JobService.search(mockResumeData, mockSearchParams);

            expect(mockGetDoc).toHaveBeenCalled();
            expect(findMatchingJobs).not.toHaveBeenCalled(); // Should NOT hit API
            expect(result.source).toBe('cache');
            expect(result.jobs[0].company).toBe("Tech Co");
        });

        it('should fetch live and update cache if cache missing (Cache Miss)', async () => {
            // Setup Cache Miss
            mockDoc.mockReturnValue('mock-doc-ref');
            mockGetDoc.mockResolvedValue({ exists: () => false });
            (findMatchingJobs as any).mockResolvedValue(mockGeminiResponse);

            const result = await JobService.search(mockResumeData, mockSearchParams);

            expect(findMatchingJobs).toHaveBeenCalled();
            expect(mockSetDoc).toHaveBeenCalled(); // Should save to cache
            expect(result.source).toBe('live');
        });

        it('should fetch live if cache is expired (>21 days)', async () => {
            // Setup Expired Cache (22 days old)
            const oldTimestamp = Date.now() - (22 * 24 * 60 * 60 * 1000); 
            mockDoc.mockReturnValue('mock-doc-ref');
            mockGetDoc.mockResolvedValue({
                exists: () => true,
                data: () => ({ ...mockCachedResponse, cachedAt: oldTimestamp })
            });
            (findMatchingJobs as any).mockResolvedValue(mockGeminiResponse);

            const result = await JobService.search(mockResumeData, mockSearchParams);

            expect(findMatchingJobs).toHaveBeenCalled();
            expect(mockSetDoc).toHaveBeenCalled(); // Should update cache with new data
            expect(result.source).toBe('live');
        });
    });

    describe('Concurrency & Optimization', () => {
        it('should deduplicate simultaneous requests', async () => {
            // Mock a slow API response
            (findMatchingJobs as any).mockImplementation(async () => {
                await new Promise(resolve => setTimeout(resolve, 100));
                return mockGeminiResponse;
            });
            mockGetDoc.mockResolvedValue({ exists: () => false });

            // Fire two identical requests
            const p1 = JobService.search(mockResumeData, mockSearchParams);
            const p2 = JobService.search(mockResumeData, mockSearchParams);

            await Promise.all([p1, p2]);

            // Should only fetch once
            expect(findMatchingJobs).toHaveBeenCalledTimes(1);
        });
    });

    describe('Input Validation', () => {
        it('should reject excessively long queries', async () => {
            const longParams = { ...mockSearchParams, query: 'a'.repeat(201) };
            await expect(JobService.search(mockResumeData, longParams)).rejects.toThrow("Query too long");
        });
    });

    describe('Error Handling', () => {
        it('should fallback to live fetch if Firestore fails', async () => {
            mockGetDoc.mockRejectedValue(new Error("Firestore down"));
            (findMatchingJobs as any).mockResolvedValue(mockGeminiResponse);

            const result = await JobService.search(mockResumeData, mockSearchParams);

            // Should catch Firestore error, log warning, and proceed to Gemini
            expect(findMatchingJobs).toHaveBeenCalled();
            expect(result.source).toBe('live');
        });
    });
});
