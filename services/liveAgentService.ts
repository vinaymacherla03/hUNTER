
import { GoogleGenAI, LiveCallbacks, Modality } from '@google/genai';
import { allToolDeclarations } from './toolDeclarations';

export function connectLiveAgent(callbacks: LiveCallbacks) {
    const apiKey = process.env.API_KEY || process.env.GEMINI_API_KEY;
    if (!apiKey) {
        throw new Error('API_KEY or GEMINI_API_KEY environment variable is required');
    }
    if (apiKey.includes("TODO") || apiKey.includes("YOUR_API_KEY") || apiKey.length < 20 || !apiKey.startsWith("AIza")) {
        throw new Error(`Gemini API key is invalid (length: ${apiKey.length}, starts with: ${apiKey.substring(0, 4)}). Please set a valid Google API key starting with 'AIza'.`);
    }
    const ai = new GoogleGenAI({ apiKey });
    
    return ai.live.connect({
        model: 'gemini-3.1-flash-live-preview',
        callbacks,
        config: {
            responseModalities: [Modality.AUDIO],
            speechConfig: {
                voiceConfig: { prebuiltVoiceConfig: { voiceName: 'Zephyr' } },
            },
            systemInstruction: 'You are an elite, helpful, and friendly AI career assistant. Your goal is to guide the user in building a stellar resume and navigating their job search. CRITICAL INSTRUCTIONS: 1. Always provide highly tailored and actionable advice based on the user\'s specific context and resume. 2. Give concrete, step-by-step recommendations rather than generic tips. 3. Suggest exact phrasing or keywords when discussing resume content. 4. If the user asks for skill suggestions, always ask them to provide the job description first if it is not already provided in your context. Be concise, direct, and encouraging.',
            tools: [{ googleSearch: {} }, {functionDeclarations: allToolDeclarations}]
        }
    });
}
