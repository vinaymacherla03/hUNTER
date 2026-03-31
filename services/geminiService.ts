
import { GoogleGenAI, Type, Modality, GenerateContentResponse } from "@google/genai";
import { ResumeData, SkillCategory, SuggestedSkill, Project, KeywordAnalysis, AuditResult, JobListing, InterviewQuestion, InterviewFeedback } from '../types';
import { scheduler } from '../utils/scheduler';
import { db } from './firebase';
import { doc, getDoc, setDoc } from 'firebase/firestore';

// ALWAYS use the pre-configured API_KEY from environment
const ai = new GoogleGenAI({ apiKey: process.env.API_KEY });

// --- Cache Utilities ---

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

// --- End Cache Utilities ---

export const parseJsonResult = (text: string | undefined): any => {
    if (!text || !text.trim()) return {};
    
    let cleanText = text.trim();
    
    // 1. Try direct parse first
    try {
        return JSON.parse(cleanText);
    } catch (directError) {
        // 2. If direct parse fails, try to extract JSON from Markdown blocks or find boundaries
        try {
            const jsonBlockMatch = cleanText.match(/```(?:json)?\s*([\s\S]*?)\s*```/i);
            if (jsonBlockMatch) {
                cleanText = jsonBlockMatch[1].trim();
            } else {
                const firstOpen = cleanText.indexOf('{');
                const lastClose = cleanText.lastIndexOf('}');
                if (firstOpen !== -1 && lastClose !== -1) {
                    cleanText = cleanText.substring(firstOpen, lastClose + 1);
                }
            }
            return JSON.parse(cleanText);
        } catch (boundaryError) {
            console.error("Failed to parse JSON from AI response. Raw text snippet:", text.substring(0, 100));
            return null;
        }
    }
};

const handleAiError = (error: any) => {
    const msg = String(error.message || error).toLowerCase();
    if (msg.includes("429") || msg.includes("quota") || msg.includes("resource_exhausted")) {
        throw new Error("The AI is currently at maximum capacity. Please wait about 60 seconds and try again.");
    }
    if (msg.includes("parsing") || msg.includes("json") || msg.includes("format")) {
        throw new Error("I had trouble understanding the AI's response format. This can happen with very complex text. Please try simplifying your input or pasting text instead of a file.");
    }
    throw error;
};

export const validateGrammar = async (text: string): Promise<{ corrected: string; issues: any[] } | null> => {
    if (!text || text.trim().length < 15) return null;
    const prompt = `Act as a professional editor. Check for grammar and spelling. Return corrected text and issues in JSON format. Text: "${text}"`;
    try {
        const response = await scheduler.add<GenerateContentResponse>(() => ai.models.generateContent({
            model: "gemini-3-flash-preview",
            contents: prompt,
            config: { responseMimeType: "application/json" },
        }));
        return parseJsonResult(response.text);
    } catch (error) { return null; }
};

export const enhanceResume = async (resumeText: string, jobDesc: string, jobTitle: string): Promise<ResumeData> => {
    const prompt = `Act as an expert career coach and executive resume writer. 
    Analyze the following raw text and structure it into a professional, polished resume in JSON format.
    
    Target Job Title: ${jobTitle}
    Job Description: ${jobDesc}
    
    RAW TEXT TO ANALYZE:
    "${resumeText}"
    
    INSTRUCTIONS:
    1. EXTRACT and ENHANCE the content.
    2. Write IMPACTFUL achievement-oriented bullet points for work experience using the STAR method where possible.
    3. Ensure every field in the provided schema is populated with logical data derived from the input.
    4. If a field like 'fullName' is missing, use 'Valued Professional'.
    5. RETURN ONLY RAW JSON matching the schema precisely. NO MARKDOWN WRAPPERS.`;

    const resumeSchema = {
        type: Type.OBJECT,
        properties: {
            fullName: { type: Type.STRING },
            title: { type: Type.STRING },
            contactInfo: { 
                type: Type.OBJECT, 
                properties: { 
                    email: { type: Type.STRING }, 
                    phone: { type: Type.STRING }, 
                    linkedin: { type: Type.STRING }, 
                    location: { type: Type.STRING }, 
                    github: { type: Type.STRING }, 
                    portfolio: { type: Type.STRING } 
                },
                required: ["email", "phone", "location"]
            },
            summary: { type: Type.STRING },
            experience: { 
                type: Type.ARRAY, 
                items: { 
                    type: Type.OBJECT, 
                    properties: { 
                        id: { type: Type.STRING }, 
                        role: { type: Type.STRING }, 
                        company: { type: Type.STRING }, 
                        location: { type: Type.STRING }, 
                        dates: { type: Type.STRING }, 
                        description: { type: Type.ARRAY, items: { type: Type.STRING } } 
                    },
                    required: ["role", "company", "description"]
                } 
            },
            education: { 
                type: Type.ARRAY, 
                items: { 
                    type: Type.OBJECT, 
                    properties: { 
                        id: { type: Type.STRING }, 
                        degree: { type: Type.STRING }, 
                        institution: { type: Type.STRING }, 
                        location: { type: Type.STRING }, 
                        graduationDate: { type: Type.STRING }, 
                        relevantCoursework: { type: Type.ARRAY, items: { type: Type.STRING } } 
                    },
                    required: ["degree", "institution"]
                } 
            },
            skills: { 
                type: Type.ARRAY, 
                items: { 
                    type: Type.OBJECT, 
                    properties: { 
                        id: { type: Type.STRING }, 
                        name: { type: Type.STRING }, 
                        skills: { 
                            type: Type.ARRAY, 
                            items: { 
                                type: Type.OBJECT, 
                                properties: { 
                                    id: { type: Type.STRING }, 
                                    name: { type: Type.STRING }, 
                                    proficiency: { type: Type.STRING } 
                                },
                                required: ["name"]
                            } 
                        } 
                    },
                    required: ["name", "skills"]
                } 
            }
        },
        required: ["fullName", "title", "contactInfo", "summary", "experience", "education", "skills"]
    };

    try {
        const response = await scheduler.add<GenerateContentResponse>(() => ai.models.generateContent({
            model: "gemini-3-flash-preview", 
            contents: prompt,
            config: { 
                responseMimeType: "application/json", 
                responseSchema: resumeSchema, 
                temperature: 0.1 
            },
        }));

        const parsed = parseJsonResult(response.text);
        
        if (!parsed || typeof parsed !== 'object') {
            throw new Error("The AI provided an empty or invalid structure.");
        }
        
        const sanitizedData: ResumeData = {
            fullName: parsed.fullName || "Valued Professional",
            title: parsed.title || jobTitle || "Professional",
            contactInfo: {
                email: parsed.contactInfo?.email || "",
                phone: parsed.contactInfo?.phone || "",
                linkedin: parsed.contactInfo?.linkedin || "",
                location: parsed.contactInfo?.location || "",
                github: parsed.contactInfo?.github || "",
                portfolio: parsed.contactInfo?.portfolio || "",
            },
            summary: parsed.summary || "",
            experience: Array.isArray(parsed.experience) ? parsed.experience.map((exp: any) => ({
                ...exp,
                id: exp.id || `exp-${Math.random().toString(36).substr(2, 9)}`,
                description: Array.isArray(exp.description) ? exp.description : []
            })) : [],
            education: Array.isArray(parsed.education) ? parsed.education.map((edu: any) => ({
                ...edu,
                id: edu.id || `edu-${Math.random().toString(36).substr(2, 9)}`,
                relevantCoursework: Array.isArray(edu.relevantCoursework) ? edu.relevantCoursework : []
            })) : [],
            skills: Array.isArray(parsed.skills) ? parsed.skills.map((cat: any) => ({
                ...cat,
                id: cat.id || `cat-${Math.random().toString(36).substr(2, 9)}`,
                skills: Array.isArray(cat.skills) ? cat.skills.map((s: any) => ({
                    ...s,
                    id: s.id || `s-${Math.random().toString(36).substr(2, 9)}`,
                    proficiency: s.proficiency || "Intermediate"
                })) : []
            })) : []
        };

        return sanitizedData;
    } catch (error) { 
        console.error("[geminiService] enhanceResume failed:", error);
        return handleAiError(error); 
    }
};

/**
 * Enhanced search that fetches from TheirStack then uses Gemini for "Market Intelligence".
 * This result is shared globally via JobService's cloud cache.
 */
export const findMatchingJobs = async (resumeData: ResumeData, location: string, query: string, filters: any): Promise<{ marketSummary: string; jobs: JobListing[] }> => {
    try {
        const searchPrompt = `
            Act as an elite headhunter. Search for current job openings for a professional with this title: "${resumeData.title}".
            Search Query: "${query}"
            Location: "${location || 'Remote'}"
            Filters: ${JSON.stringify(filters)}
            
            Use the Google Search tool to find 5-10 real, current job postings from various job boards (e.g., LinkedIn, Indeed, Glassdoor, ZipRecruiter, company career pages) that match this criteria.
            
            Deliver:
            1. A 2-sentence "Executive Market Intelligence" briefing summarizing current trends for these roles in ${location || 'the current market'}.
            2. A list of the jobs found, including company, role, location, a short summary, the link to the job posting, the platform it was found on (e.g., "LinkedIn", "Indeed", "Glassdoor", "Company Website"), and a match score (0-100) based strictly on professional compatibility with the resume.
            
            Return JSON strictly matching this schema:
            {
                "marketSummary": "string",
                "jobs": [
                    {
                        "company": "string",
                        "role": "string",
                        "location": "string",
                        "summary": "string",
                        "link": "string",
                        "platform": "string",
                        "matchScore": number
                    }
                ]
            }
        `;

        const response = await scheduler.add<GenerateContentResponse>(() => ai.models.generateContent({
            model: "gemini-3-flash-preview",
            contents: searchPrompt,
            config: { 
                responseMimeType: "application/json", 
                temperature: 0.2,
                tools: [{ googleSearch: {} }]
            },
        }));

        const enriched = parseJsonResult(response.text);
        if (!enriched || !Array.isArray(enriched.jobs)) {
             return { marketSummary: "Could not retrieve market signals.", jobs: [] };
        }

        const enrichedJobs: JobListing[] = enriched.jobs.map((job: any) => ({
            id: `job_${cyrb53(job.company + job.role)}`,
            company: job.company || "Confidential",
            role: job.role || "Professional Role",
            location: job.location || location || "Remote",
            link: job.link || "#",
            summary: job.summary || "No description provided.",
            postedAt: "Recently",
            platform: job.platform || "Web",
            matchScore: job.matchScore || 75
        }));

        return { 
            marketSummary: enriched.marketSummary || "Found several opportunities matching your profile.", 
            jobs: enrichedJobs.sort((a, b) => (b.matchScore || 0) - (a.matchScore || 0))
        };
    } catch (error) { 
        console.warn("[geminiService] Market intelligence enrichment failed:", error);
        return { marketSummary: "Retrieving real-time market signals failed.", jobs: [] }; 
    }
};

export const getRecommendedRoles = async (resumeData: ResumeData): Promise<string[]> => {
    const prompt = `Based on: ${resumeData.title}, summary: ${resumeData.summary}. Suggest 4 job titles. Return JSON array of 4 strings.`;
    try {
        const response = await scheduler.add<GenerateContentResponse>(() => ai.models.generateContent({
            model: "gemini-3-flash-preview",
            contents: prompt,
            config: { responseMimeType: "application/json", temperature: 0.7 },
        }));
        const roles = parseJsonResult(response.text);
        return Array.isArray(roles) ? roles : [resumeData.title || "Software Engineer"];
    } catch (error) { return [resumeData.title || "Software Engineer"]; }
};

export const getDetailedRecommendations = async (resumeData: ResumeData): Promise<{ role: string; why: string }[]> => {
    const prompt = `Act as an elite career strategist. Analyze this resume to suggest 3 high-impact career paths.
    
    Title: ${resumeData.title}
    Summary: ${resumeData.summary}
    Recent Experience: ${resumeData.experience.slice(0, 2).map(e => `${e.role} at ${e.company}`).join(', ')}
    
    Return a JSON array of 3 recommendations. Each recommendation must have a "role" and "why" (one sentence).`;

    const schema = {
        type: Type.ARRAY,
        items: {
            type: Type.OBJECT,
            properties: {
                role: { type: Type.STRING },
                why: { type: Type.STRING }
            },
            required: ["role", "why"]
        }
    };

    try {
        const response = await scheduler.add<GenerateContentResponse>(() => ai.models.generateContent({
            model: "gemini-3-flash-preview",
            contents: prompt,
            config: { 
                responseMimeType: "application/json", 
                responseSchema: schema,
                temperature: 0.8 
            },
        }));
        const result = parseJsonResult(response.text);
        return Array.isArray(result) ? result : [];
    } catch (error) { 
        return [{ role: resumeData.title || "Senior Professional", why: "Strategic fit based on your expertise." }]; 
    }
};

export const runResumeAudit = async (resumeData: ResumeData): Promise<AuditResult> => {
    const prompt = `Audit resume. Provide score 1-100 and feedback array. JSON: ${JSON.stringify(resumeData)}`;
    try {
        const response = await scheduler.add<GenerateContentResponse>(() => ai.models.generateContent({
            model: "gemini-3-flash-preview", contents: prompt, config: { responseMimeType: "application/json", temperature: 0.7 },
        }));
        const result = parseJsonResult(response.text);
        if (!result) return { overallScore: 0, feedback: [] };
        return { overallScore: result.overallScore || 0, feedback: Array.isArray(result.feedback) ? result.feedback : [] };
    } catch (e) { return { overallScore: 0, feedback: [] }; }
};

export const generateCoverLetter = async (resumeData: ResumeData, jobDescription: string): Promise<string> => {
    const prompt = `Write professional cover letter. Resume: ${JSON.stringify(resumeData)}. Job: ${jobDescription}`;
    try {
        const response = await scheduler.add<GenerateContentResponse>(() => ai.models.generateContent({
            model: "gemini-3-flash-preview", contents: prompt, config: { temperature: 0.8 },
        }));
        return response.text || "Could not generate cover letter.";
    } catch (e) { return "An error occurred."; }
};

export const analyzeKeywords = async (resumeData: ResumeData, jobDescription: string): Promise<KeywordAnalysis> => {
    const prompt = `Compare resume keywords to JD. Return JSON with 'presentKeywords' and 'missingKeywords'. Data: ${JSON.stringify(resumeData)} JD: ${jobDescription}`;
    try {
        const response = await scheduler.add<GenerateContentResponse>(() => ai.models.generateContent({
            model: "gemini-3-flash-preview", contents: prompt, config: { responseMimeType: "application/json", temperature: 0.3 },
        }));
        const result = parseJsonResult(response.text);
        if (!result) return { presentKeywords: [], missingKeywords: [] };
        return { presentKeywords: Array.isArray(result.presentKeywords) ? result.presentKeywords : [], missingKeywords: Array.isArray(result.missingKeywords) ? result.missingKeywords : [] };
    } catch (e) { return { presentKeywords: [], missingKeywords: [] }; }
};

export const generateTailoredResume = async (resumeData: ResumeData, jobDescription: string): Promise<{ tailoredResume: ResumeData; rationale: string }> => {
    const prompt = `Tailor resume for job: ${jobDescription}. Return JSON with 'tailoredResume' and 'rationale'. Data: ${JSON.stringify(resumeData)}`;
    try {
        const response = await scheduler.add<GenerateContentResponse>(() => ai.models.generateContent({
            model: "gemini-3-flash-preview", contents: prompt, config: { responseMimeType: "application/json", temperature: 0.5 },
        }));
        const result = parseJsonResult(response.text);
        if (!result) return { tailoredResume: resumeData, rationale: "AI tailoring performed." };
        return { tailoredResume: result.tailoredResume || resumeData, rationale: result.rationale || "AI tailoring performed." };
    } catch (e) { return { tailoredResume: resumeData, rationale: "Error during tailoring." }; }
};

export const evaluateInterviewAnswer = async (question: string, answer: string, role: string): Promise<InterviewFeedback> => {
    try {
        const response = await scheduler.add<GenerateContentResponse>(() => ai.models.generateContent({
            model: 'gemini-3-flash-preview',
            contents: `You are an expert technical recruiter and hiring manager for a ${role} role.
            Evaluate the candidate's answer to the following interview question.
            
            Question: ${question}
            Candidate Answer: ${answer}
            
            Provide constructive feedback. Score the answer from 1 to 10. List 2-3 strengths and 2-3 areas for improvement. Finally, provide a refined, professional example answer that uses the STAR method if applicable.`,
            config: { 
                responseMimeType: "application/json", 
                temperature: 0.5,
                responseSchema: {
                    type: Type.OBJECT,
                    properties: {
                        score: { type: Type.NUMBER, description: "Score from 1 to 10" },
                        strengths: { type: Type.ARRAY, items: { type: Type.STRING } },
                        improvements: { type: Type.ARRAY, items: { type: Type.STRING } },
                        refinedAnswer: { type: Type.STRING }
                    },
                    required: ["score", "strengths", "improvements", "refinedAnswer"]
                }
            }
        }));
        const result = parseJsonResult(response.text);
        if (!result) throw new Error("Empty feedback");
        return { 
            score: result.score || 0, 
            strengths: Array.isArray(result.strengths) ? result.strengths : [], 
            improvements: Array.isArray(result.improvements) ? result.improvements : [], 
            refinedAnswer: result.refinedAnswer || "" 
        };
    } catch (e) { throw handleAiError(e); }
};

export const compactResumeContent = async (resumeData: ResumeData): Promise<ResumeData> => {
    const prompt = `Compact resume JSON to 1 page. Return full modified JSON. Data: ${JSON.stringify(resumeData)}`;
    try {
        const response = await scheduler.add<GenerateContentResponse>(() => ai.models.generateContent({
            model: "gemini-3-flash-preview",
            contents: prompt,
            config: { responseMimeType: "application/json", temperature: 0.4 },
        }));
        const parsed = parseJsonResult(response.text);
        return (parsed && parsed.fullName) ? parsed : resumeData;
    } catch (error) { return resumeData; }
};

export const tailorResumeToJob = async (resumeData: ResumeData, jobDescription: string): Promise<TailoredContent> => {
    const prompt = `Tailor summary and suggest skills for: ${jobDescription}. Return JSON: { "tailoredSummary": "string", "suggestedSkills": [] }`;
    try {
        const response = await scheduler.add<GenerateContentResponse>(() => ai.models.generateContent({
            model: "gemini-3-flash-preview",
            contents: prompt,
            config: { responseMimeType: "application/json", temperature: 0.6 },
        }));
        const result = parseJsonResult(response.text);
        if (!result) throw new Error("Tailoring failed");
        return { tailoredSummary: typeof result.tailoredSummary === 'string' ? result.tailoredSummary : '', suggestedSkills: Array.isArray(result.suggestedSkills) ? result.suggestedSkills : [] };
    } catch (e) { throw handleAiError(e); }
};

export const generateAgentSuggestion = async (type: string, context: any): Promise<any> => {
    let prompt = "";
    let useJson = true;
    switch (type) {
        case 'WRITE_SUMMARY':
            prompt = `Write professional summary for resume context. Return text.`;
            useJson = false;
            break;
        case 'REWRITE_EXPERIENCE_BULLET_WITH_REASON':
            prompt = `Improve impact: "${context.bulletPoint}". Return JSON: { "rewritten": "string", "reason": "string" }`;
            break;
        case 'COMPACT_EXPERIENCE_BULLET_WITH_REASON':
            prompt = `Shorten: "${context.bulletPoint}". Return JSON: { "rewritten": "string", "reason": "string" }`;
            break;
        case 'GET_SKILL_SUGGESTIONS':
            prompt = `Keywords for JD: "${context.jobDescription}". Return comma-separated string.`;
            useJson = false;
            break;
        default: throw new Error(`Unknown type: ${type}`);
    }
    try {
        const response = await scheduler.add<GenerateContentResponse>(() => ai.models.generateContent({
            model: "gemini-3-flash-preview", contents: prompt, config: useJson ? { responseMimeType: "application/json" } : { temperature: 0.7 },
        }));
        return useJson ? parseJsonResult(response.text) : (response.text || '').trim();
    } catch (error) { return handleAiError(error); }
};

export const askNotebook = async (context: string, query: string): Promise<string> => {
    const response = await scheduler.add<GenerateContentResponse>(() => ai.models.generateContent({
        model: 'gemini-3-flash-preview',
        contents: `Career Assistant. Context:\n${context}\n\nQuery: ${query}`,
        config: { temperature: 0.3 }
    }));
    return response.text || "I don't have enough information.";
};

export const researchCompany = async (companyName: string): Promise<string> => {
    const prompt = `Intelligence report for: "${companyName}" using Search. Include Mission, News, Stack.`;
    try {
        const response = await scheduler.add<GenerateContentResponse>(() => ai.models.generateContent({
            model: 'gemini-3-flash-preview',
            contents: prompt,
            config: { tools: [{ googleSearch: {} }], temperature: 0.4 }
        }));
        return response.text || "No data found.";
    } catch (e) { return "Research failed."; }
};

export const generateAudioBrief = async (context: string): Promise<string> => {
    const prompt = `Podcast summary of: ${context}. High energy, 1 min.`;
    try {
        const response = await scheduler.add<GenerateContentResponse>(() => ai.models.generateContent({
            model: "gemini-2.5-flash-preview-tts",
            contents: [{ parts: [{ text: prompt }] }],
            config: {
                responseModalities: [Modality.AUDIO],
                speechConfig: { voiceConfig: { prebuiltVoiceConfig: { voiceName: 'Kore' } } },
            },
        }));
        return response.candidates?.[0]?.content?.parts?.[0]?.inlineData?.data || '';
    } catch (e) { return ''; }
};

export const generateInterviewQuestions = async (resumeData: ResumeData, jobDescription: string): Promise<InterviewQuestion[]> => {
    const prompt = `Generate 5 highly relevant interview questions for a candidate applying to the following job description, based on their resume.
    
    Job Description:
    ${jobDescription}
    
    Candidate Resume:
    ${JSON.stringify(resumeData)}
    
    Return a JSON array of objects. Each object must have:
    - id: a unique string ID
    - type: one of 'Behavioral', 'Technical', 'General', 'Situational'
    - question: the interview question
    - tip: a tip for the candidate on how to answer it effectively using the STAR method
    - sampleAnswer: a brief sample answer outline`;

    try {
        const response = await scheduler.add<GenerateContentResponse>(() => ai.models.generateContent({
            model: 'gemini-3-flash-preview',
            contents: prompt,
            config: { 
                responseMimeType: "application/json", 
                temperature: 0.7,
                responseSchema: {
                    type: Type.ARRAY,
                    items: {
                        type: Type.OBJECT,
                        properties: {
                            id: { type: Type.STRING },
                            type: { type: Type.STRING, enum: ['Behavioral', 'Technical', 'General', 'Situational'] },
                            question: { type: Type.STRING },
                            tip: { type: Type.STRING },
                            sampleAnswer: { type: Type.STRING }
                        },
                        required: ["id", "type", "question", "tip"]
                    }
                }
            }
        }));
        const result = parseJsonResult(response.text);
        return Array.isArray(result) ? result : [];
    } catch (e) { 
        console.error("Failed to generate interview questions:", e);
        return []; 
    }
};

export const generateProjectImage = async (project: Project): Promise<string> => {
    try {
        const response = await scheduler.add<GenerateContentResponse>(() => ai.models.generateContent({
            model: 'gemini-2.5-flash-image',
            contents: { parts: [{ text: `Professional 3D icon for project: ${project.name}` }] }
        }));
        for (const part of response.candidates[0].content.parts) {
            if (part.inlineData) return `data:image/png;base64,${part.inlineData.data}`;
        }
        return '';
    } catch (e) { return ''; }
};

export const getCareerStrategy = async (resumeData: ResumeData): Promise<{ roadmap: { step: string; description: string }[]; skillGaps: string[]; positioning: string }> => {
    const prompt = `Act as a high-end executive career strategist. Analyze this resume and provide a long-term career strategy.
    
    Resume Data: ${JSON.stringify(resumeData)}
    
    Return a JSON object with:
    - roadmap: A 3-step career roadmap (each step has a 'step' title and 'description').
    - skillGaps: A list of 5 critical skills or certifications the user should acquire to reach the next level.
    - positioning: A 2-sentence summary of how the user should position themselves in the current market.
    
    Return JSON strictly matching this schema:
    {
        "roadmap": [{"step": "string", "description": "string"}],
        "skillGaps": ["string"],
        "positioning": "string"
    }`;

    try {
        const response = await scheduler.add<GenerateContentResponse>(() => ai.models.generateContent({
            model: "gemini-3-flash-preview",
            contents: prompt,
            config: { 
                responseMimeType: "application/json", 
                temperature: 0.6 
            },
        }));

        const result = parseJsonResult(response.text);
        return {
            roadmap: Array.isArray(result?.roadmap) ? result.roadmap : [],
            skillGaps: Array.isArray(result?.skillGaps) ? result.skillGaps : [],
            positioning: result?.positioning || "Position yourself as a versatile professional with a focus on impact."
        };
    } catch (error) {
        console.error("Failed to fetch career strategy:", error);
        return { roadmap: [], skillGaps: [], positioning: "Failed to generate a personalized strategy." };
    }
};

export const getMarketInsights = async (role: string, location: string): Promise<{ trends: string[]; news: { title: string; url: string }[]; summary: string }> => {
    const prompt = `Research current job market trends and recent news for the role of "${role}" in "${location || 'the global market'}". 
    Use the Google Search tool to find the most up-to-date information.
    
    Return a JSON object with:
    - trends: A list of 3-5 key market trends (e.g., in-demand skills, salary shifts, remote work changes).
    - news: A list of 3-5 recent news articles or company updates related to this field (include title and url).
    - summary: A brief (2-3 sentence) executive summary of the current landscape.
    
    Return JSON strictly matching this schema:
    {
        "trends": ["string"],
        "news": [{"title": "string", "url": "string"}],
        "summary": "string"
    }`;

    try {
        const response = await scheduler.add<GenerateContentResponse>(() => ai.models.generateContent({
            model: "gemini-3-flash-preview",
            contents: prompt,
            config: { 
                responseMimeType: "application/json", 
                temperature: 0.4,
                tools: [{ googleSearch: {} }]
            },
        }));

        const result = parseJsonResult(response.text);
        return {
            trends: Array.isArray(result?.trends) ? result.trends : [],
            news: Array.isArray(result?.news) ? result.news : [],
            summary: result?.summary || "No market summary available at this time."
        };
    } catch (error) {
        console.error("Failed to fetch market insights:", error);
        return { trends: [], news: [], summary: "Failed to retrieve real-time market insights." };
    }
};

export const askCoachWithGoogleSearch = async (query: string): Promise<{ text: string; sources: { uri: string; title: string }[] }> => {
    try {
        const response = await scheduler.add<GenerateContentResponse>(() => ai.models.generateContent({
            model: 'gemini-3-flash-preview',
            contents: query,
            config: { tools: [{ googleSearch: {} }] }
        }));
        const sources = response.candidates?.[0]?.groundingMetadata?.groundingChunks?.filter(chunk => chunk.web)?.map(chunk => ({ uri: chunk.web!.uri, title: chunk.web!.title })) || [];
        return { text: response.text || '', sources };
    } catch (e) { return { text: "I'm having trouble searching right now.", sources: [] }; }
};

export const getSalaryIntelligence = async (role: string, location: string, experienceLevel: string): Promise<{ range: string; factors: string[]; negotiationStrategy: string; script: string }> => {
    const prompt = `Research salary intelligence for the role of "${role}" in "${location}". 
    Experience Level: ${experienceLevel}.
    Use Google Search to find current, real-world salary data.
    
    Return a JSON object with:
    - range: A realistic salary range (e.g., "$120k - $150k + Bonus").
    - factors: 3-5 factors influencing salary for this role (e.g., specific certifications, industry, company size).
    - negotiationStrategy: A 3-sentence high-level strategy for negotiating this specific role.
    - script: A short (2-3 sentence) script the user can use during the salary conversation.
    
    Return JSON strictly matching this schema:
    {
        "range": "string",
        "factors": ["string"],
        "negotiationStrategy": "string",
        "script": "string"
    }`;

    try {
        const response = await scheduler.add<GenerateContentResponse>(() => ai.models.generateContent({
            model: "gemini-3-flash-preview",
            contents: prompt,
            config: { 
                responseMimeType: "application/json", 
                temperature: 0.4,
                tools: [{ googleSearch: {} }]
            },
        }));

        const result = parseJsonResult(response.text);
        return {
            range: result?.range || "Data unavailable",
            factors: Array.isArray(result?.factors) ? result.factors : [],
            negotiationStrategy: result?.negotiationStrategy || "Focus on your unique value and market data.",
            script: result?.script || "I'm excited about the role and based on my research and experience, I'm looking for a range of..."
        };
    } catch (error) {
        console.error("Failed to fetch salary intelligence:", error);
        return { range: "Error fetching data", factors: [], negotiationStrategy: "Research market rates on Glassdoor/LinkedIn.", script: "" };
    }
};

export const getSkillResources = async (skill: string): Promise<{ title: string; provider: string; url: string; type: 'Course' | 'Certification' | 'Article' }[]> => {
    const prompt = `Find the top 3 high-quality learning resources for the skill: "${skill}".
    Use Google Search to find current courses, certifications, or deep-dive articles.
    
    Return a JSON array of objects with:
    - title: Name of the resource.
    - provider: e.g., Coursera, Udemy, Microsoft, Official Docs.
    - url: Direct link to the resource.
    - type: One of ['Course', 'Certification', 'Article'].
    
    Return JSON strictly matching this schema:
    [{"title": "string", "provider": "string", "url": "string", "type": "string"}]`;

    try {
        const response = await scheduler.add<GenerateContentResponse>(() => ai.models.generateContent({
            model: "gemini-3-flash-preview",
            contents: prompt,
            config: { 
                responseMimeType: "application/json", 
                temperature: 0.3,
                tools: [{ googleSearch: {} }]
            },
        }));

        const result = parseJsonResult(response.text);
        return Array.isArray(result) ? result : [];
    } catch (error) {
        console.error("Failed to fetch skill resources:", error);
        return [];
    }
};

export const getResumeScorecard = async (resumeData: ResumeData): Promise<{ score: number; grade: string; hardTruths: string[]; quickFixes: string[] }> => {
    const prompt = `Act as a brutal, high-end executive recruiter. Analyze this resume and give it a raw, honest scorecard.
    Resume: ${JSON.stringify(resumeData)}
    
    Return a JSON object with:
    - score: A number from 0-100.
    - grade: A letter grade (A+, A, B, C, D, F).
    - hardTruths: 3 "hard truths" about why this resume might be ignored (be blunt but professional).
    - quickFixes: 3 immediate, high-impact changes to improve the score.
    
    Return JSON strictly matching this schema:
    {
        "score": number,
        "grade": "string",
        "hardTruths": ["string"],
        "quickFixes": ["string"]
    }`;

    try {
        const response = await scheduler.add<GenerateContentResponse>(() => ai.models.generateContent({
            model: "gemini-3-flash-preview",
            contents: prompt,
            config: { 
                responseMimeType: "application/json", 
                temperature: 0.7 
            },
        }));

        const result = parseJsonResult(response.text);
        return {
            score: result?.score || 0,
            grade: result?.grade || "N/A",
            hardTruths: Array.isArray(result?.hardTruths) ? result.hardTruths : [],
            quickFixes: Array.isArray(result?.quickFixes) ? result.quickFixes : []
        };
    } catch (error) {
        console.error("Failed to generate scorecard:", error);
        return { score: 0, grade: "F", hardTruths: ["Analysis failed."], quickFixes: ["Try again."] };
    }
};

export interface TailoredContent {
    tailoredSummary: string;
    suggestedSkills: string[];
}

export const chatWithAI = async (messages: { role: string; content: string }[], resumeData: ResumeData): Promise<string> => {
    const systemInstruction = `You are an elite career coach and AI assistant in the Career Intelligence Hub. 
    You provide low-latency, concise, and highly actionable advice.
    Here is the user's resume context: ${JSON.stringify(resumeData)}
    Answer their questions directly and professionally.`;
    
    try {
        const formattedMessages = messages.map(m => `${m.role === 'user' ? 'User' : 'AI'}: ${m.content}`).join('\n');
        const prompt = `${systemInstruction}\n\nConversation history:\n${formattedMessages}\n\nAI:`;
        
        const response = await scheduler.add<GenerateContentResponse>(() => ai.models.generateContent({
            model: "gemini-3.1-flash-lite-preview",
            contents: prompt,
            config: { 
                temperature: 0.7 
            },
        }));
        return response.text || "I'm sorry, I couldn't generate a response.";
    } catch (error) {
        console.error("Failed to chat with AI:", error);
        return "I'm having trouble connecting right now. Please try again later.";
    }
};

export const getNetworkingStrategy = async (resumeData: ResumeData, targetRole: string): Promise<{ templates: { type: string; subject: string; body: string }[]; advice: string[] }> => {
    const prompt = `Act as a networking expert. Create a networking strategy for a professional with this resume: ${JSON.stringify(resumeData)}
    Target Role: ${targetRole}
    
    Return a JSON object with:
    - templates: 3 networking templates (e.g., LinkedIn connection, Informational interview request, Recruiter follow-up). Each has 'type', 'subject', and 'body'.
    - advice: 3-5 specific networking tips for this user.
    
    Return JSON strictly matching this schema:
    {
        "templates": [{"type": "string", "subject": "string", "body": "string"}],
        "advice": ["string"]
    }`;

    try {
        const response = await scheduler.add<GenerateContentResponse>(() => ai.models.generateContent({
            model: "gemini-3-flash-preview",
            contents: prompt,
            config: { 
                responseMimeType: "application/json", 
                temperature: 0.7 
            },
        }));

        const result = parseJsonResult(response.text);
        return {
            templates: Array.isArray(result?.templates) ? result.templates : [],
            advice: Array.isArray(result?.advice) ? result.advice : []
        };
    } catch (error) {
        console.error("Failed to fetch networking strategy:", error);
        return { templates: [], advice: ["Focus on building genuine relationships in your target industry."] };
    }
};

export const getPersonalBrandAudit = async (resumeData: ResumeData): Promise<{ archetype: string; vibe: string; strengths: string[]; weaknesses: string[]; marketMatch: string }> => {
    const prompt = `Act as a high-end brand strategist for executives. Analyze this resume and determine the "Personal Brand Archetype" and "Vibe" it projects.
    Resume: ${JSON.stringify(resumeData)}
    
    Return a JSON object with:
    - archetype: A creative name for their professional persona (e.g., "The Visionary Architect", "The Relentless Optimizer", "The Strategic Fixer").
    - vibe: A 2-sentence description of the "energy" the resume gives off to a recruiter.
    - strengths: 3 brand strengths (e.g., "High-velocity execution", "Deep technical empathy").
    - weaknesses: 3 brand weaknesses or "blind spots" (e.g., "Lacks visible leadership scale", "Too focused on tools over outcomes").
    - marketMatch: A 1-sentence assessment of how well this brand matches current market demand for their role.
    
    Return JSON strictly matching this schema:
    {
        "archetype": "string",
        "vibe": "string",
        "strengths": ["string"],
        "weaknesses": ["string"],
        "marketMatch": "string"
    }`;

    try {
        const response = await scheduler.add<GenerateContentResponse>(() => ai.models.generateContent({
            model: "gemini-3-flash-preview",
            contents: prompt,
            config: { 
                responseMimeType: "application/json", 
                temperature: 0.8 
            },
        }));

        const result = parseJsonResult(response.text);
        return {
            archetype: result?.archetype || "The Professional",
            vibe: result?.vibe || "A solid, reliable professional profile.",
            strengths: Array.isArray(result?.strengths) ? result.strengths : [],
            weaknesses: Array.isArray(result?.weaknesses) ? result.weaknesses : [],
            marketMatch: result?.marketMatch || "Matches standard market expectations."
        };
    } catch (error) {
        console.error("Failed to generate personal brand audit:", error);
        return { archetype: "The Professional", vibe: "Analysis failed.", strengths: [], weaknesses: [], marketMatch: "" };
    }
};

export const getGhostingRisk = async (jobDescription: string, companyName: string): Promise<{ riskLevel: 'Low' | 'Medium' | 'High'; reasons: string[]; advice: string }> => {
    const prompt = `Act as a cynical, data-driven recruiter. Analyze this job description and company to assess the "Ghosting Risk" (the likelihood that this is a 'ghost job' or that the company will not follow up).
    Company: ${companyName}
    Job Description: ${jobDescription}
    
    Use Google Search to check for recent news about the company (layoffs, hiring freezes, or "fake hiring" reports).
    
    Return a JSON object with:
    - riskLevel: 'Low', 'Medium', or 'High'.
    - reasons: 3-5 red flags or green flags found (e.g., "Job posted 60+ days ago", "Recent hiring freeze news", "Generic JD with no specific team").
    - advice: A 2-sentence piece of advice on how to approach this application to avoid wasting time.
    
    Return JSON strictly matching this schema:
    {
        "riskLevel": "string",
        "reasons": ["string"],
        "advice": "string"
    }`;

    try {
        const response = await scheduler.add<GenerateContentResponse>(() => ai.models.generateContent({
            model: "gemini-3-flash-preview",
            contents: prompt,
            config: { 
                responseMimeType: "application/json", 
                temperature: 0.4,
                tools: [{ googleSearch: {} }]
            },
        }));

        const result = parseJsonResult(response.text);
        return {
            riskLevel: (result?.riskLevel as any) || 'Medium',
            reasons: Array.isArray(result?.reasons) ? result.reasons : [],
            advice: result?.advice || "Apply but don't hold your breath. Keep your pipeline full."
        };
    } catch (error) {
        console.error("Failed to assess ghosting risk:", error);
        return { riskLevel: 'Medium', reasons: ["Could not verify company data."], advice: "Proceed with caution." };
    }
};

export const getPivotAnalysis = async (resumeData: ResumeData, targetPivot: string): Promise<{ feasibility: number; transferableSkills: string[]; gaps: string[]; strategy: string }> => {
    const prompt = `Act as a career pivot specialist. Analyze the feasibility of this user moving from their current role to: "${targetPivot}".
    Resume: ${JSON.stringify(resumeData)}
    
    Return a JSON object with:
    - feasibility: A number from 0-100.
    - transferableSkills: 3-5 skills they already have that apply to the new role.
    - gaps: 3-5 critical gaps they need to bridge.
    - strategy: A 3-sentence "Pivot Strategy" (e.g., "Focus on project X to show Y", "Get certification Z").
    
    Return JSON strictly matching this schema:
    {
        "feasibility": number,
        "transferableSkills": ["string"],
        "gaps": ["string"],
        "strategy": "string"
    }`;

    try {
        const response = await scheduler.add<GenerateContentResponse>(() => ai.models.generateContent({
            model: "gemini-3-flash-preview",
            contents: prompt,
            config: { 
                responseMimeType: "application/json", 
                temperature: 0.6 
            },
        }));

        const result = parseJsonResult(response.text);
        return {
            feasibility: result?.feasibility || 50,
            transferableSkills: Array.isArray(result?.transferableSkills) ? result.transferableSkills : [],
            gaps: Array.isArray(result?.gaps) ? result.gaps : [],
            strategy: result?.strategy || "Build a bridge between your current experience and the target role."
        };
    } catch (error) {
        console.error("Failed to generate pivot analysis:", error);
        return { feasibility: 0, transferableSkills: [], gaps: [], strategy: "Analysis failed." };
    }
};
