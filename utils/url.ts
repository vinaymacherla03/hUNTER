
/**
 * Ensures a URL is absolute and has a protocol.
 * If it's missing a protocol, it defaults to https://.
 * If it's not a valid URL, it returns a search query on Google.
 */
export const ensureAbsoluteUrl = (url: string): string => {
    if (!url) return '#';
    
    const trimmed = url.trim();
    
    // Check if it's already an absolute URL
    if (/^(?:f|ht)tps?:\/\//i.test(trimmed)) {
        return trimmed;
    }
    
    // Check if it's a relative path or just a domain
    if (trimmed.startsWith('//')) {
        return `https:${trimmed}`;
    }
    
    // If it looks like a domain (e.g., google.com), add https://
    if (/^[a-z0-9]+([\-\.]{1}[a-z0-9]+)*\.[a-z]{2,5}(:[0-9]{1,5})?(\/.*)?$/i.test(trimmed)) {
        return `https://${trimmed}`;
    }
    
    // If it's just text, treat it as a search query
    if (!trimmed.includes('.') && !trimmed.includes('/')) {
        return `https://www.google.com/search?q=${encodeURIComponent(trimmed)}`;
    }

    return trimmed;
};

/**
 * Validates if a string is a valid URL.
 */
export const isValidUrl = (url: string): boolean => {
    try {
        new URL(ensureAbsoluteUrl(url));
        return true;
    } catch (e) {
        return false;
    }
};
