
import { GoogleGenAI, LiveCallbacks, Modality } from '@google/genai';
import { allToolDeclarations } from './toolDeclarations';

export function connectLiveAgent(callbacks: LiveCallbacks) {
    // FIX: Optimized initialization by removing redundant API_KEY checks as per SDK guidelines
    const ai = new GoogleGenAI({ apiKey: process.env.API_KEY });
    
    return ai.live.connect({
        /* Use gemini-2.5-flash-native-audio-preview-12-2025 as recommended */
        model: 'gemini-2.5-flash-native-audio-preview-12-2025',
        callbacks,
        config: {
            responseModalities: [Modality.AUDIO],
            speechConfig: {
                voiceConfig: { prebuiltVoiceConfig: { voiceName: 'Zephyr' } },
            },
            systemInstruction: 'You are a helpful and friendly AI career assistant. Your goal is to guide the user in building a stellar resume and navigating their job search. If the user asks for skill suggestions, always ask them to provide the job description first if it is not already provided in your context. Be concise and encouraging.',
            tools: [{functionDeclarations: allToolDeclarations}],
        }
    });
}
