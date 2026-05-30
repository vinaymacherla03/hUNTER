
import { db, auth } from './firebase';
import { doc, getDoc, setDoc, updateDoc, increment, serverTimestamp, Timestamp } from 'firebase/firestore';
import { handleFirestoreError, OperationType } from '../utils/firestoreErrorHelper';

const WINDOW_MS = 60 * 1000; // 1 minute
const MAX_REQUESTS_PER_WINDOW = 30; // Increased per-user limit
const MAX_REQUESTS_PER_DAY = 500; // Increased daily limit
const GLOBAL_MAX_PER_MINUTE = 100; // Increased global limit as requested

export const checkRateLimit = async (): Promise<boolean> => {
    if (!db) return true; // Fallback if Firebase not configured

    const userId = auth.currentUser?.uid || 'anonymous';
    const rateLimitDoc = doc(db, 'rate_limits', userId);
    const globalDoc = doc(db, 'rate_limits', 'global_stats');

    try {
        const now = Date.now();
        
        // 1. Global Rate Limit Check (to protect shared API quota)
        let globalSnap;
        try {
            globalSnap = await getDoc(globalDoc);
        } catch (e) {
            handleFirestoreError(e, OperationType.GET, 'rate_limits/global_stats');
            return true; // Bypass
        }

        if (globalSnap && globalSnap.exists()) {
            const gData = globalSnap.data();
            const gWindowStart = (gData.windowStart as Timestamp)?.toDate()?.getTime() || 0;
            if (now - gWindowStart < WINDOW_MS) {
                if (gData.count >= GLOBAL_MAX_PER_MINUTE) {
                    throw new Error("The system is currently under heavy load. Please try again in a minute.");
                }
                await updateDoc(globalDoc, { count: increment(1) });
            } else {
                await updateDoc(globalDoc, { count: 1, windowStart: serverTimestamp() });
            }
        } else {
            await setDoc(globalDoc, { count: 1, windowStart: serverTimestamp() });
        }

        // 2. Per-User Rate Limit Check
        let snap;
        try {
            snap = await getDoc(rateLimitDoc);
        } catch (e) {
            handleFirestoreError(e, OperationType.GET, `rate_limits/${userId}`);
            return true;
        }

        if (snap && !snap.exists()) {
            await setDoc(rateLimitDoc, {
                count: 1,
                windowStart: serverTimestamp(),
                dailyCount: 1,
                lastDailyReset: serverTimestamp()
            });
            return true;
        }

        const data = snap ? snap.data() : { dailyCount: 0, count: 0 };
        const windowStart = (data.windowStart as Timestamp)?.toDate()?.getTime() || 0;
        const lastDailyReset = (data.lastDailyReset as Timestamp)?.toDate()?.getTime() || 0;

        // Daily reset (24h)
        if (now - lastDailyReset > 24 * 60 * 60 * 1000) {
            await updateDoc(rateLimitDoc, {
                dailyCount: 1,
                lastDailyReset: serverTimestamp(),
                count: 1,
                windowStart: serverTimestamp()
            });
            return true;
        }

        if (data.dailyCount >= MAX_REQUESTS_PER_DAY) {
            throw new Error(`Daily limit reached (${MAX_REQUESTS_PER_DAY} requests). Please try again tomorrow.`);
        }

        // Window reset (1m)
        if (now - windowStart > WINDOW_MS) {
            await updateDoc(rateLimitDoc, {
                count: 1,
                windowStart: serverTimestamp(),
                dailyCount: increment(1)
            });
            return true;
        }

        if (data.count >= MAX_REQUESTS_PER_WINDOW) {
            throw new Error(`Rate limit exceeded. You can make ${MAX_REQUESTS_PER_WINDOW} requests per minute. Please wait.`);
        }

        await updateDoc(rateLimitDoc, {
            count: increment(1),
            dailyCount: increment(1)
        });

        return true;
    } catch (error: any) {
        if (!error.message?.includes('limit') && !error.message?.includes('load')) {
             try {
                handleFirestoreError(error, OperationType.WRITE, `rate_limits/${userId}`);
             } catch (e: any) {
                 if (e.message?.includes('permission-denied') || e.message?.includes('Missing or insufficient')) {
                     return true; // fallback
                 }
                 throw e;
             }
        }
        throw error;
    }
};
