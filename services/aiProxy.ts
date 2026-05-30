
export const callServerAI = async (prompt: string, model: string = "gemini-3-flash-preview", config: any = {}) => {
    const response = await fetch('/api/ai/generate', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ prompt, model, config })
    });
    
    if (!response.ok) {
        let errorMessage = "AI request failed";
        try {
            const error = await response.json();
            errorMessage = error.error || errorMessage;
        } catch (e) {
            errorMessage = `HTTP error ${response.status}: ${response.statusText}`;
        }
        throw new Error(errorMessage);
    }
    
    let data;
    try {
        const text = await response.text();
        try {
            data = JSON.parse(text);
        } catch (e) {
            const preview = text.substring(0, 150).replace(/\n/g, ' ');
            console.error(`Failed to parse JSON. Status: ${response.status}. Raw response preview: ${preview}...`);
            const isHtml = text.toLowerCase().includes('<!doctype html>') || text.toLowerCase().includes('<html');
            throw new Error(`${isHtml ? 'server_loading_html' : 'invalid_json_response'} from server (Status ${response.status}). Data preview: ${preview}...`);
        }
    } catch (e) {
        if (e instanceof Error) {
            throw e;
        }
        throw new Error(`Network or parsing error: ${String(e)}`);
    }
    const result = data.result;
    
    // If result is a string, normalize it into a structure that text() can handle
    const normalizedResult = typeof result === 'string' 
        ? { candidates: [{ content: { parts: [{ text: result }] } }] } 
        : result;
    
    return {
        ...normalizedResult,
        text: () => {
            const part = normalizedResult.candidates?.[0]?.content?.parts?.[0];
            if (part?.inlineData) {
                return part.inlineData.data;
            }
            return part?.text || (typeof result === 'string' ? result : (result?.text || ""));
        }
    };
};
