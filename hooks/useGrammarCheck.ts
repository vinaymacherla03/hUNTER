
import { useState, useEffect, useCallback, useRef } from 'react';
import { validateGrammar } from '../services/geminiService';

export const useGrammarCheck = (text: string, enabled: boolean = false) => {
    const [isChecking, setIsChecking] = useState(false);
    const [result, setResult] = useState<{ corrected: string; issues: any[] } | null>(null);
    const [lastCheckedText, setLastCheckedText] = useState('');
    
    const isMounted = useRef(true);

    useEffect(() => {
        isMounted.current = true;
        return () => {
            isMounted.current = false;
        };
    }, []);

    useEffect(() => {
        // Don't check empty, short, or already checked text
        if (!enabled || !text || text.trim().length < 15 || text === lastCheckedText) return;

        // Clear previous results if text changed significantly
        if (result && text !== result.corrected) {
             setResult(null);
        }

        // Increased debounce significantly to 4 seconds to save quota
        const timeoutId = setTimeout(async () => {
            if (!isMounted.current) return;
            
            setIsChecking(true);
            try {
                const data = await validateGrammar(text);
                if (isMounted.current) {
                    setLastCheckedText(text);
                    if (data && data.corrected !== text && data.issues.length > 0) {
                        setResult(data);
                    } else {
                        setResult(null);
                    }
                }
            } catch (e) {
                console.warn("[GrammarCheck] Failed or Rate Limited", e);
            } finally {
                 if (isMounted.current) setIsChecking(false);
            }
        }, 4000); 

        return () => clearTimeout(timeoutId);
    }, [text, lastCheckedText, enabled, result]);

    const clearParams = useCallback(() => {
        setResult(null);
        setLastCheckedText(text);
    }, [text]);

    return { isChecking, result, clearParams };
};
