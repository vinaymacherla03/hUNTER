
import { GoogleGenAI, Type, GenerateContentResponse } from "@google/genai";
import { db } from "../services/firebase.ts";
import { doc, getDoc, setDoc, updateDoc, serverTimestamp, runTransaction } from "firebase/firestore";
import crypto from "crypto";
import fs from "fs";
import path from "path";
import dotenv from "dotenv";
import { handleFirestoreError, OperationType } from "../utils/firestoreErrorHelper.ts";

let aiClient: GoogleGenAI | null = null;

function getAI() {
    if (!aiClient) {
        let apiKey = process.env.GEMINI_API_KEY;
        
        // Resilience: Check .env file directly if the env var is a placeholder or missing
        if (!apiKey || apiKey.includes("TODO") || apiKey.includes("YOUR_API_KEY") || apiKey.length < 20) {
            try {
                const envPath = path.resolve(process.cwd(), '.env');
                if (fs.existsSync(envPath)) {
                    const envConfig = dotenv.parse(fs.readFileSync(envPath));
                    if (envConfig.GEMINI_API_KEY && envConfig.GEMINI_API_KEY.length >= 20) {
                        apiKey = envConfig.GEMINI_API_KEY;
                        console.log("[AI Service] Using GEMINI_API_KEY from .env file fallback");
                    }
                }
            } catch (e) {
                // Ignore errors in fallback
            }
        }

        if (!apiKey) {
            throw new Error('GEMINI_API_KEY environment variable is required');
        }
        console.log(`[AI Service] Initializing with key of length: ${apiKey.length}, starts with: ${apiKey.substring(0, 4)}...`);
        if (apiKey.includes("TODO") || apiKey.includes("YOUR_API_KEY") || apiKey.length < 20 || !apiKey.startsWith("AIza")) {
            throw new Error(`GEMINI_API_KEY is invalid (length: ${apiKey.length}, starts with: ${apiKey.substring(0, 4)}). Please set a valid Google API key starting with 'AIza' in the environment.`);
        }
        aiClient = new GoogleGenAI({ apiKey });
    }
    return aiClient;
}

// Global rate limiting using Firestore (distributed across instances)
const GLOBAL_LIMIT_DOC = "system/ai_rate_limit";
const REQUEST_INTERVAL_MS = 100; // Increased throughput: 10 requests per second globally
const BURST_LIMIT = 50; // Allow burst of 50 requests

async function waitForGlobalQuota() {
    if (!db) {
        // Skip global quota check if Firebase is not configured
        return;
    }
    
    let acquired = false;
    let attempts = 0;
    
    // For high concurrency (1k requests), we need to be more efficient.
    // We'll use a simple timestamp-based check with a higher frequency.
    while (!acquired && attempts < 5) {
        attempts++;
        const now = Date.now();
        try {
            const limitRef = doc(db, GLOBAL_LIMIT_DOC);
            await runTransaction(db, async (transaction) => {
                const snap = await transaction.get(limitRef);
                const data = snap.data();
                const lastRequest = data?.lastRequest?.toMillis() || 0;
                const currentBurst = data?.burst || 0;

                // If enough time passed, reset burst
                const timeSinceLast = now - lastRequest;
                const newBurst = timeSinceLast > 1000 ? 0 : currentBurst;

                if (newBurst < BURST_LIMIT || timeSinceLast >= REQUEST_INTERVAL_MS) {
                    transaction.set(limitRef, { 
                        lastRequest: serverTimestamp(),
                        burst: newBurst + 1
                    }, { merge: true });
                    acquired = true;
                }
            });

            if (!acquired) {
                // Wait a shorter time for high concurrency
                await new Promise(resolve => setTimeout(resolve, 50));
            }
        } catch (e) {
            // Under extreme load, Firestore transactions might fail due to contention.
            // For 1k requests, we should fail open to maintain availability.
            console.error("Rate limit contention, failing open:", e);
            acquired = true; 
        }
    }
}

export async function generateAIContent(model: string, prompt: string, config: any) {
    // 1. Check Cache (only if db is available)
    const cacheKey = crypto.createHash('md5').update(JSON.stringify({ model, prompt, config })).digest('hex');
    const cacheRef = db ? doc(db, `ai_cache/${cacheKey}`) : null;
    
    if (cacheRef) {
        try {
            const cacheSnap = await getDoc(cacheRef);
            if (cacheSnap.exists()) {
                const data = cacheSnap.data();
                // Cache for 24 hours
                if (data.timestamp && Date.now() - (data.timestamp.toMillis ? data.timestamp.toMillis() : Date.parse(data.timestamp)) < 24 * 60 * 60 * 1000) {
                    return data.result;
                }
            }
        } catch (e) {
            try {
                handleFirestoreError(e, OperationType.GET, `ai_cache/${cacheKey}`);
            } catch (err) {
                console.error("Cache read error:", err);
            }
        }
    }

    // 2. Wait for Quota
    await waitForGlobalQuota();

    // 3. Call AI
    try {
        // Extract tools from config if present
        const tools = config.tools;
        const generationConfig = { ...config };
        delete generationConfig.tools;

        const ai = getAI();
        const result = await ai.models.generateContent({
            model,
            contents: [{ role: 'user', parts: [{ text: prompt }] }],
            config: {
                ...generationConfig,
                tools: tools as any
            } as any
        });
        
        // The result in @google/genai has a text property (getter)
        const text = (result as any).text || "";
        
        const responseData = {
            text,
            candidates: result.candidates,
        };

        // 4. Save to Cache
        if (cacheRef) {
            try {
                await setDoc(cacheRef, {
                    result: responseData,
                    timestamp: serverTimestamp()
                });
            } catch (e) {
                try {
                    handleFirestoreError(e, OperationType.CREATE, `ai_cache/${cacheKey}`);
                } catch (err) {
                    console.error("Cache write error:", err);
                }
            }
        }

        return responseData;
    } catch (error: any) {
        console.error("AI Generation Error Details:", {
            message: error.message,
            stack: error.stack,
            details: error.details,
            status: error.status,
            code: error.code
        });
        // Special handling for quota errors
        if (error.message?.includes("429") || error.message?.includes("quota")) {
            throw new Error("GLOBAL_QUOTA_EXCEEDED");
        }
        throw error;
    }
}

export async function createAIJob(type: string, payload: any) {
    const jobId = crypto.randomUUID();
    const jobRef = doc(db, `ai_jobs/${jobId}`);
    
    await setDoc(jobRef, {
        type,
        payload,
        status: 'pending',
        createdAt: serverTimestamp()
    });

    // Process in background (don't await)
    processJob(jobId, type, payload).catch(console.error);

    return jobId;
}

async function processJob(jobId: string, type: string, payload: any) {
    const jobRef = doc(db, `ai_jobs/${jobId}`);
    
    try {
        await updateDoc(jobRef, { status: 'processing' });
        
        let result;
        switch (type) {
            case 'ENHANCE_RESUME':
                // Implementation logic...
                break;
            // Add other types...
        }

        await updateDoc(jobRef, { 
            status: 'completed', 
            result, 
            completedAt: serverTimestamp() 
        });
    } catch (error: any) {
        await updateDoc(jobRef, { 
            status: 'failed', 
            error: error.message,
            failedAt: serverTimestamp() 
        });
    }
}

export async function generateTTS(text: string, voiceName: string = 'Kore'): Promise<string | null> {
    const ai = getAI();
    try {
        const response = await ai.models.generateContent({
            model: "gemini-3.1-flash-tts-preview",
            contents: [{ parts: [{ text }] }],
            config: {
                responseModalities: ["AUDIO"] as any,
                speechConfig: {
                    voiceConfig: {
                        prebuiltVoiceConfig: { voiceName },
                    },
                },
            },
        });
        const base64Audio = (response as any).candidates?.[0]?.content?.parts?.[0]?.inlineData?.data;
        if (!base64Audio) return null;

        // The model returns raw PCM 16-bit 24kHz single channel
        const pcmBuffer = Buffer.from(base64Audio, 'base64');
        const numChannels = 1;
        const sampleRate = 24000;
        const blockAlign = numChannels * 2;
        const byteRate = sampleRate * blockAlign;

        const header = Buffer.alloc(44);
        header.write("RIFF", 0);
        header.writeUInt32LE(36 + pcmBuffer.length, 4);
        header.write("WAVE", 8);
        header.write("fmt ", 12);
        header.writeUInt32LE(16, 16); // Subchunk1Size
        header.writeUInt16LE(1, 20); // AudioFormat: PCM
        header.writeUInt16LE(numChannels, 22);
        header.writeUInt32LE(sampleRate, 24);
        header.writeUInt32LE(byteRate, 28);
        header.writeUInt16LE(blockAlign, 32);
        header.writeUInt16LE(16, 34); // BitsPerSample
        header.write("data", 36);
        header.writeUInt32LE(pcmBuffer.length, 40);

        const wavBuffer = Buffer.concat([header, pcmBuffer]);
        return wavBuffer.toString('base64');
    } catch (error) {
        console.error("TTS Generation Error:", error);
        throw error;
    }
}
