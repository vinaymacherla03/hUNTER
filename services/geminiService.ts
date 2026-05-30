
import { Type, Modality } from "@google/genai";

// Types for remaining legacy functions
type GenerateContentResponse = any;
const ai: any = null;
import { ResumeData, SkillCategory, SuggestedSkill, Project, KeywordAnalysis, AuditResult, JobListing, InterviewQuestion, InterviewFeedback, ResumeSectionKey, AIMode, JobEvaluation } from '../types';
import { scheduler } from '../utils/scheduler';
import { ensureAbsoluteUrl } from '../utils/url';
import { db } from './firebase';
import { doc, getDoc, setDoc, serverTimestamp } from 'firebase/firestore';
import { handleFirestoreError, OperationType } from '../utils/firestoreErrorHelper';

// ALWAYS use the server-side AI proxy for robustness and scalability
import { callServerAI } from "./aiProxy";

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
                
                if (firstOpen !== -1) {
                    if (lastClose !== -1 && lastClose > firstOpen) {
                        cleanText = cleanText.substring(firstOpen, lastClose + 1);
                    } else {
                        // Try to "repair" truncated JSON by adding closing braces
                        let repaired = cleanText.substring(firstOpen);
                        
                        // Handle truncated strings
                        const quotes = (repaired.match(/"/g) || []).length;
                        if (quotes % 2 !== 0) {
                            repaired += '"';
                        }
                        
                        // Handle truncated objects/arrays
                        const openBraces = (repaired.match(/\{/g) || []).length;
                        const closeBraces = (repaired.match(/\}/g) || []).length;
                        if (openBraces > closeBraces) {
                            repaired += '}'.repeat(openBraces - closeBraces);
                        }
                        
                        const openBrackets = (repaired.match(/\[/g) || []).length;
                        const closeBrackets = (repaired.match(/\]/g) || []).length;
                        if (openBrackets > closeBrackets) {
                            repaired += ']'.repeat(openBrackets - closeBrackets);
                        }
                        
                        cleanText = repaired;
                    }
                }
            }
            return JSON.parse(cleanText);
        } catch (boundaryError) {
            // Final attempt: if it's a list, try to wrap it
            try {
                if (cleanText.startsWith('[') && !cleanText.endsWith(']')) {
                    return JSON.parse(cleanText + ']');
                }
            } catch (e) {}
            
            console.error("Failed to parse JSON from AI response. Raw text snippet:", text.substring(0, 200));
            return null;
        }
    }
};

const handleAiError = (error: any) => {
    const msg = String(error.message || error).toLowerCase();
    if (msg.includes("429") || msg.includes("quota") || msg.includes("resource_exhausted") || msg.includes("global_quota_exceeded")) {
        throw new Error("The AI is currently at maximum capacity due to high traffic. Please wait about 60 seconds and try again.");
    }
    if (msg.includes("api key not valid") || msg.includes("invalid_argument") || msg.includes("400")) {
        throw new Error("The Gemini API key is invalid or not configured correctly. Please check your environment variables.");
    }
    if (msg.includes("parsing") || msg.includes("json") || msg.includes("format")) {
        throw new Error("I had trouble understanding the AI's response format. This can happen with very complex text. Please try simplifying your input or pasting text instead of a file.");
    }
    throw error;
};

export const validateGrammar = async (text: string): Promise<{ corrected: string; issues: any[] } | null> => {
    if (!text || text.trim().length < 15) return null;
    const prompt = `Act as a professional editor. Check for grammar and spelling. Return corrected text and issues in JSON format. Text: "${text}"`;
    
    const schema = {
        type: Type.OBJECT,
        properties: {
            corrected: { type: Type.STRING },
            issues: {
                type: Type.ARRAY,
                items: {
                    type: Type.OBJECT,
                    properties: {
                        original: { type: Type.STRING },
                        suggestion: { type: Type.STRING },
                        reason: { type: Type.STRING }
                    },
                    required: ["original", "suggestion", "reason"]
                }
            }
        },
        required: ["corrected", "issues"]
    };

    try {
        const response = await scheduler.add<any>(() => callServerAI(prompt, "gemini-3-flash-preview", { 
            responseMimeType: "application/json",
            responseSchema: schema,
            temperature: 0.2
        }));
        return parseJsonResult(response.text());
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
    1. EXTRACT and ENHANCE the content, specifically TAILORING it to the Target Job Title and Job Description.
    2. HIGHLIGHT relevant skills and experience that directly map to the job requirements.
    3. Write IMPACTFUL achievement-oriented bullet points for work experience using the STAR method (Situation, Task, Action, Result).
    4. Ensure every field in the provided schema is populated with logical data derived from the input.
    5. If a field like 'fullName' is missing, use 'Valued Professional'.
    6. RETURN ONLY RAW JSON matching the schema precisely. NO MARKDOWN WRAPPERS.`;

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
        const response = await scheduler.add<any>(() => callServerAI(prompt, "gemini-3-flash-preview", { 
            responseMimeType: "application/json", 
            responseSchema: resumeSchema, 
            temperature: 0.1 
        }));

        const parsed = parseJsonResult(response.text());
        
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

export const parseResume = async (resumeText: string): Promise<ResumeData> => {
    const prompt = `Act as an expert resume parser. 
    Analyze the following raw text and extract the information into a structured JSON format.
    
    RAW TEXT TO PARSE:
    "${resumeText}"
    
    INSTRUCTIONS:
    1. EXTRACT all relevant information: Full Name, Title, Contact Info, Summary, Experience, Education, and Skills.
    2. DO NOT enhance or add information that isn't in the text.
    3. If a field is missing, leave it as an empty string or empty array.
    4. Ensure every field in the provided schema is populated.
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
        const response = await scheduler.add<any>(() => callServerAI(prompt, "gemini-3-flash-preview", { 
            responseMimeType: "application/json", 
            responseSchema: resumeSchema, 
            temperature: 0.1 
        }));

        const parsed = parseJsonResult(response.text());
        
        if (!parsed || typeof parsed !== 'object') {
            throw new Error("The AI provided an empty or invalid structure.");
        }
        
        const sanitizedData: ResumeData = {
            fullName: parsed.fullName || "Valued Professional",
            title: parsed.title || "Professional",
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
        console.error("[geminiService] parseResume failed:", error);
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
            Advanced Filters:
            - Experience Level: ${filters.experienceLevel || 'Any'}
            - Employment Type: ${filters.employmentType || 'Any'}
            - Remote Preference: ${filters.remoteOption || 'Any'}
            - Date Posted: ${filters.datePosted || 'Any'}
            
            Use the Google Search tool to find 10-15 real, current job postings from various job boards (e.g., LinkedIn, Indeed, Glassdoor, ZipRecruiter, Naukri, Monster, company career pages) that match this criteria.
            
            CRITICAL: Respect the filters. If "Fully Remote" is selected, only return remote jobs. If "Senior" is selected, only return senior-level roles. If "Last 24h" is selected, prioritize the most recent postings found.
            
            If the location is in India, prioritize results from Naukri.com and LinkedIn India.
            
            Analyze the user's resume data to ensure high-quality matches:
            Summary: ${resumeData.summary}
            Skills: ${resumeData.skills.map(c => c.skills.map(s => s.name).join(', ')).join(', ')}
            Experience: ${resumeData.experience.map(e => e.role + ' at ' + e.company).join(', ')}

            Deliver:
            1. A 2-3 sentence "Executive Market Intelligence" briefing summarizing current trends, demand levels, and key requirements for these roles in ${location || 'the current market'}.
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

        const response = await scheduler.add<any>(() => callServerAI(searchPrompt, "gemini-3-flash-preview", { 
            responseMimeType: "application/json", 
            temperature: 0.2,
            // Note: Google Search tool might need special handling on server if not supported in generationConfig
            // For now, we assume the server handles it or we pass it through
            tools: [{ googleSearch: {} }] 
        }));

        const enriched = parseJsonResult(response.text());
        if (!enriched || !Array.isArray(enriched.jobs)) {
             return { marketSummary: "Could not retrieve market signals.", jobs: [] };
        }

        const enrichedJobs: JobListing[] = enriched.jobs.map((job: any, idx: number) => ({
            id: `job_${cyrb53(job.company + job.role + job.link)}-${idx}`,
            company: job.company || "Confidential",
            role: job.role || "Professional Role",
            location: job.location || location || "Remote",
            link: ensureAbsoluteUrl(job.link || "#"),
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
        const response = await scheduler.add<any>(() => callServerAI(prompt, "gemini-3-flash-preview", { 
            responseMimeType: "application/json", 
            responseSchema: {
                type: "ARRAY",
                items: { type: "STRING" }
            },
            temperature: 0.7 
        }));
        const roles = parseJsonResult(response.text());
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
        const response = await scheduler.add<any>(() => callServerAI(prompt, "gemini-3-flash-preview", { 
            responseMimeType: "application/json", 
            responseSchema: schema,
            temperature: 0.8 
        }));
        const result = parseJsonResult(response.text());
        return Array.isArray(result) ? result : [];
    } catch (error) { 
        return [{ role: resumeData.title || "Senior Professional", why: "Strategic fit based on your expertise." }]; 
    }
};

export const runResumeAudit = async (resumeData: ResumeData): Promise<AuditResult> => {
    const prompt = `Act as an expert Applicant Tracking System (ATS) parser and recruiter. 
    Analyze this resume data: ${JSON.stringify(resumeData)}
    
    Provide a comprehensive audit. Return a JSON object strictly matching this schema:
    {
        "overallScore": number (0-100),
        "atsScore": number (0-100),
        "feedback": [
            {
                "category": "Impact" | "Quantification" | "Conciseness" | "Skills" | "ATS Parsability" | "OpenCATS Compatibility",
                "message": "string (The issue found)",
                "suggestion": "string (How to fix it)",
                "contextPath": "string (Optional, e.g., 'experience[0].description[1]' or 'summary')"
            }
        ]
    }
    
    Focus heavily on:
    1. ATS Parsability: Are the section headers standard? Is the contact info easily parsable?
    2. Hard Skills: Are there enough hard skills/keywords?
    3. Quantification: Are achievements backed by numbers?
    4. Impact: Do bullet points use strong action verbs?`;

    try {
        const response = await scheduler.add<any>(() => callServerAI(prompt, "gemini-3.1-pro-preview", { 
            responseMimeType: "application/json", 
            temperature: 0.2 
        }));
        const result = parseJsonResult(response.text());
        if (!result) return { overallScore: 0, atsScore: 0, feedback: [] };
        return { 
            overallScore: result.overallScore || 0, 
            atsScore: result.atsScore || 0,
            feedback: Array.isArray(result.feedback) ? result.feedback : [] 
        };
    } catch (e) { 
        console.error("ATS Audit failed:", e);
        return { overallScore: 0, atsScore: 0, feedback: [] }; 
    }
};

export const generateCoverLetter = async (resumeData: ResumeData, jobDescription: string): Promise<string> => {
    const prompt = `Write professional cover letter. Resume: ${JSON.stringify(resumeData)}. Job: ${jobDescription}`;
    try {
        const response = await scheduler.add<any>(() => callServerAI(prompt, "gemini-3-flash-preview", { temperature: 0.8 }));
        return response.text() || "Could not generate cover letter.";
    } catch (e) { return "An error occurred."; }
};

export const analyzeKeywords = async (resumeData: ResumeData, jobDescription: string): Promise<KeywordAnalysis> => {
    const prompt = `Act as an elite Applicant Tracking System (ATS) optimization expert.
    
    TASK:
    1. Extract ALL critical keywords from the provided Job Description (JD). This includes:
       - Hard Skills (e.g., Python, React, Project Management)
       - Soft Skills (e.g., Leadership, Communication)
       - Tools & Technologies (e.g., AWS, Jira, Salesforce)
       - Certifications & Education (e.g., PMP, MBA)
       - Industry-specific terminology
    
    2. Compare these extracted keywords against the provided Resume Data.
    
    3. Categorize every extracted keyword as either 'presentKeywords' (found in the resume) or 'missingKeywords' (not found in the resume).
    
    DATA:
    Resume: ${JSON.stringify(resumeData)}
    Job Description: ${jobDescription}
    
    RETURN FORMAT:
    Return ONLY a JSON object with this structure:
    {
        "presentKeywords": ["string"],
        "missingKeywords": ["string"]
    }`;
    try {
        const response = await scheduler.add<any>(() => callServerAI(prompt, "gemini-3-flash-preview", { 
            responseMimeType: "application/json", 
            temperature: 0.2 
        }));
        const result = parseJsonResult(response.text());
        if (!result) return { presentKeywords: [], missingKeywords: [] };
        return { 
            presentKeywords: Array.isArray(result.presentKeywords) ? result.presentKeywords : [], 
            missingKeywords: Array.isArray(result.missingKeywords) ? result.missingKeywords : [] 
        };
    } catch (e) { 
        console.error("[geminiService] analyzeKeywords failed:", e);
        return { presentKeywords: [], missingKeywords: [] }; 
    }
};

export const reorganizeResume = async (resumeData: ResumeData, jobDescription: string, mode: AIMode = 'Standard'): Promise<{ tailoredResume: ResumeData; sectionOrder: ResumeSectionKey[]; rationale: string }> => {
    const prompt = `Act as an elite executive recruiter. Reorganize and tailor this resume to perfectly match the provided job description.
    
    MODE: ${mode}
    Job Description: ${jobDescription}
    
    Current Resume Data: ${JSON.stringify(resumeData)}
    
    TASK:
    1. TAILOR the content (summary, experience bullets, skills) to prioritize what this specific employer values most.
    2. REORDER the resume sections to put the most relevant information first.
    3. ADAPT the tone and focus based on the selected MODE:
       - Standard: Balanced and professional.
       - Technical: Focus on hard skills, stack, and architectural impact.
       - Leadership: Focus on strategy, management, and business outcomes.
       - Creative: Focus on innovation, portfolio, and unique value.
       - Executive: Focus on high-level vision, P&L, and organizational growth.
       - Entry-Level: Focus on potential, education, and fast learning.
    
    Return JSON strictly matching this schema:
    {
        "tailoredResume": { ...ResumeData },
        "sectionOrder": ["summary", "experience", "projects", "education", "skills", "certifications", "awards", "keywords"],
        "rationale": "string explaining the reorganization"
    }`;

    try {
        const response = await scheduler.add<any>(() => callServerAI(prompt, "gemini-3-flash-preview", { 
            responseMimeType: "application/json", 
            temperature: 0.3 
        }));
        const result = parseJsonResult(response.text());
        if (!result) throw new Error("Reorganization failed");
        
        return {
            tailoredResume: result.tailoredResume || resumeData,
            sectionOrder: Array.isArray(result.sectionOrder) ? result.sectionOrder : ['summary', 'experience', 'projects', 'education', 'skills', 'certifications', 'awards', 'keywords'],
            rationale: result.rationale || "Reorganized for better job match."
        };
    } catch (e) {
        console.error("[geminiService] reorganizeResume failed:", e);
        return { 
            tailoredResume: resumeData, 
            sectionOrder: ['summary', 'experience', 'projects', 'education', 'skills', 'certifications', 'awards', 'keywords'],
            rationale: "Error during reorganization." 
        };
    }
};

export const evaluateJob = async (resumeData: ResumeData, jobDescription: string): Promise<JobEvaluation> => {
    const prompt = `Act as a senior career strategist. Evaluate the match between this resume and the job description.
    
    Resume: ${JSON.stringify(resumeData)}
    Job Description: ${jobDescription}
    
    Provide a detailed evaluation including:
    1. An overall match score (0-100).
    2. Match details (2-3 sentences).
    3. Pros (3-5 points).
    4. Cons/Gaps (3-5 points).
    5. Market Insights (1-2 sentences about this role/industry).
    
    Return JSON strictly matching this schema:
    {
        "overallScore": number,
        "matchDetails": "string",
        "pros": ["string"],
        "cons": ["string"],
        "marketInsights": "string"
    }`;

    try {
        const response = await scheduler.add<any>(() => callServerAI(prompt, "gemini-3.1-pro-preview", { 
            responseMimeType: "application/json", 
            temperature: 0.2 
        }));
        const result = parseJsonResult(response.text());
        return {
            overallScore: result?.overallScore || 0,
            matchDetails: result?.matchDetails || "Evaluation complete.",
            pros: Array.isArray(result?.pros) ? result.pros : [],
            cons: Array.isArray(result?.cons) ? result.cons : [],
            marketInsights: result?.marketInsights || "No specific market insights available."
        };
    } catch (e) {
        console.error("[geminiService] evaluateJob failed:", e);
        return {
            overallScore: 0,
            matchDetails: "Failed to evaluate job match.",
            pros: [],
            cons: [],
            marketInsights: "Error occurred during evaluation."
        };
    }
};

export const getSectionAdvice = async (section: ResumeSectionKey | 'contact', resumeData: ResumeData, jobDescription: string): Promise<{ tip: string; priority: 'low' | 'medium' | 'high' }> => {
    if (!jobDescription) return { tip: "Add a job description to get tailored AI advice for this section.", priority: 'low' };

    const prompt = `Act as an elite recruiter. Provide ONE concise, high-impact piece of advice for the "${section}" section of this resume, specifically to better match the provided job description.
    
    Resume Info: ${JSON.stringify(resumeData[section as keyof ResumeData] || resumeData.contactInfo)}
    Job Description: ${jobDescription.substring(0, 2000)}
    
    Format: JSON { "tip": "string", "priority": "low" | "medium" | "high" }`;

    try {
        const response = await scheduler.add<any>(() => callServerAI(prompt, "gemini-3-flash-preview", { 
            responseMimeType: "application/json",
            temperature: 0.5
        }));
        const result = parseJsonResult(response.text());
        return result || { tip: "Focus on highlighting your most relevant experience first.", priority: 'medium' };
    } catch (e) {
        return { tip: "Keep this section concise and relevant to the target role.", priority: 'low' };
    }
};

export const generateTailoredResume = async (resumeData: ResumeData, jobDescription: string): Promise<{ tailoredResume: ResumeData; rationale: string }> => {
    const prompt = `Tailor resume for job: ${jobDescription}. Return JSON with 'tailoredResume' and 'rationale'. Data: ${JSON.stringify(resumeData)}`;
    try {
        const response = await scheduler.add<any>(() => callServerAI(prompt, "gemini-3-flash-preview", { responseMimeType: "application/json", temperature: 0.5 }));
        const result = parseJsonResult(response.text());
        if (!result) return { tailoredResume: resumeData, rationale: "AI tailoring performed." };
        return { tailoredResume: result.tailoredResume || resumeData, rationale: result.rationale || "AI tailoring performed." };
    } catch (e) { return { tailoredResume: resumeData, rationale: "Error during tailoring." }; }
};

export const evaluateInterviewAnswer = async (question: string, answer: string, role: string): Promise<InterviewFeedback> => {
    try {
        const response = await scheduler.add<any>(() => callServerAI(`You are an expert technical recruiter and hiring manager for a ${role} role.
            Evaluate the candidate's answer to the following interview question.
            
            Question: ${question}
            Candidate Answer: ${answer}
            
            Provide constructive feedback. Score the answer from 1 to 10. List 2-3 strengths and 2-3 areas for improvement. Finally, provide a refined, professional example answer that uses the STAR method if applicable.`, 'gemini-3-flash-preview', { 
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
            }));
        const result = parseJsonResult(response.text());
        if (!result) throw new Error("Empty feedback");
        return result;
    } catch (e) {
        console.error("evaluateInterviewAnswer error", e);
        return {
            score: 0,
            strengths: [],
            improvements: ["An error occurred while evaluating."],
            refinedAnswer: "Please try again."
        };
    }
};

export const askAboutJobs = async (jobs: any[], query: string): Promise<string> => {
    try {
        const contextJobs = jobs.map(j => ({
            title: j.job_title,
            company: j.employer_name,
            location: j.job_location,
            salary: j.job_min_salary ? `${j.job_min_salary} - ${j.job_max_salary}` : 'Not specified',
            description: j.job_description ? j.job_description.substring(0, 500) + '...' : ''
        }));
        
        const prompt = `Act as an expert career advisor and job search assistant.
        The user has performed a job search and found ${jobs.length} jobs.
        Here is a summarized list of the jobs found (limit 50):
        ${JSON.stringify(contextJobs.slice(0, 50))}

        User's Query: ${query}

        Answer the user's query based on the job data provided above.
        Be concise, helpful, and refer to specific jobs if relevant.`;

        const response = await scheduler.add<any>(() => callServerAI(prompt, 'gemini-3-flash-preview', { 
            temperature: 0.5 
        }));
        return response.text();
    } catch (error) {
        console.error("askAboutJobs failed:", error);
        return "Sorry, I encountered an error while trying to answer your question. Please try again.";
    }
};

export const compactResumeContent = async (resumeData: ResumeData): Promise<ResumeData> => {
    const prompt = `Compact resume JSON to 1 page. Return full modified JSON. Data: ${JSON.stringify(resumeData)}`;
    try {
        const response = await scheduler.add<any>(() => callServerAI(prompt, "gemini-3-flash-preview", { responseMimeType: "application/json", temperature: 0.4 }));
        const parsed = parseJsonResult(response.text());
        return (parsed && parsed.fullName) ? parsed : resumeData;
    } catch (error) { return resumeData; }
};

export const tailorResumeToJob = async (resumeData: ResumeData, jobDescription: string): Promise<TailoredContent> => {
    const prompt = `Act as an elite career coach. Analyze the job description and the user's resume.
    
    Job Description: ${jobDescription}
    Resume: ${JSON.stringify(resumeData)}
    
    Deliver:
    1. A tailored professional summary (3-4 sentences).
    2. A list of 5-8 missing skills that are critical for this JD.
    3. 2-3 suggested projects or portfolio items the user could add or highlight (based on their existing experience or common industry projects for this role).
    4. 2-3 relevant certifications that would strengthen the application.
    
    Return JSON strictly matching this schema:
    {
        "tailoredSummary": "string",
        "suggestedSkills": ["string"],
        "suggestedProjects": [{"name": "string", "description": "string"}],
        "suggestedCertifications": ["string"]
    }`;
    try {
        const response = await scheduler.add<any>(() => callServerAI(prompt, "gemini-3-flash-preview", { 
            responseMimeType: "application/json", 
            temperature: 0.6 
        }));
        const result = parseJsonResult(response.text());
        if (!result) throw new Error("Tailoring failed");
        return { 
            tailoredSummary: typeof result.tailoredSummary === 'string' ? result.tailoredSummary : '', 
            suggestedSkills: Array.isArray(result.suggestedSkills) ? result.suggestedSkills : [],
            suggestedProjects: Array.isArray(result.suggestedProjects) ? result.suggestedProjects : [],
            suggestedCertifications: Array.isArray(result.suggestedCertifications) ? result.suggestedCertifications : []
        };
    } catch (e) { throw handleAiError(e); }
};

export const generateAgentSuggestion = async (type: string, context: any): Promise<any> => {
    let prompt = "";
    let useJson = true;
    let schema: any = null;

    switch (type) {
        case 'WRITE_SUMMARY':
            prompt = `Act as an elite career coach. Write a high-impact professional summary for this resume.
            
            Resume Data: ${JSON.stringify(context.resume)}
            ${context.jobDescription ? `Target Job Description: "${context.jobDescription}"` : ''}
            
            Guidelines:
            1. Write a 3-4 sentence pitch.
            2. Highlight the most relevant experience and skills.
            3. ${context.jobDescription ? "Directly address the requirements and keywords in the job description." : "Focus on the user's unique value proposition."}
            4. Use a professional, confident tone.
            5. Avoid cliches like "hard-working professional" or "team player".
            
            Return the summary as a plain string.`;
            useJson = false;
            break;
        case 'REWRITE_RESUME_TEXT':
            prompt = `Act as an expert resume writer. Please professionally rewrite and format the following raw resume content to make it more organized, grammatically correct, and impactful, while preserving all key information.

            Raw Resume Content: "${context.resumeText}"
            
            Guidelines:
            1. Ensure consistent tense and professional tone.
            2. Fix any spelling or grammatical errors.
            3. Make bullet points impactful and concise.
            4. Do not hallucinate or invent new experience.
            5. Return the rewritten plain text.`;
            useJson = false;
            break;
        case 'REWRITE_EXPERIENCE_BULLET_WITH_REASON':
            prompt = `Act as an expert resume writer. Rewrite the following resume bullet point to maximize its impact.
            
            Original Bullet Point: "${context.bulletPoint}"
            ${context.jobDescription ? `Target Job Description: "${context.jobDescription}"` : ''}
            
            Guidelines:
            1. Use strong action verbs (e.g., "Spearheaded", "Orchestrated", "Engineered").
            2. Quantify achievements with metrics (e.g., "Increased revenue by 20%", "Reduced latency by 50ms", "Managed a $1M budget"). If no metrics are provided, intelligently suggest where they could fit or use strong qualitative impact.
            3. ${context.jobDescription ? "Incorporate relevant keywords and skills from the target job description naturally." : "Focus on professional impact and clarity."}
            4. Keep it to a single, powerful sentence.
            5. Use the "Action + Context + Result" framework.
            
            Return JSON strictly matching this schema:
            {
                "rewritten": "The improved bullet point string",
                "reason": "A brief explanation (1-2 sentences) of why this version is better, highlighting the keywords or metrics added."
            }`;
            schema = {
                type: Type.OBJECT,
                properties: {
                    rewritten: { type: Type.STRING },
                    reason: { type: Type.STRING }
                },
                required: ["rewritten", "reason"]
            };
            break;
        case 'COMPACT_EXPERIENCE_BULLET_WITH_REASON':
            prompt = `Act as an expert resume writer. Rewrite the following resume bullet point to be more concise while retaining all key information and impact.
            
            Original Bullet Point: "${context.bulletPoint}"
            ${context.jobDescription ? `Target Job Description: "${context.jobDescription}"` : ''}
            
            Guidelines:
            1. Remove filler words and redundant phrases.
            2. Maintain strong action verbs and quantifiable metrics.
            3. ${context.jobDescription ? "Ensure key terms from the job description are preserved." : ""}
            4. Ensure the sentence is punchy and direct.
            
            Return JSON strictly matching this schema:
            {
                "rewritten": "The more concise bullet point string",
                "reason": "A brief explanation (1-2 sentences) of how it was made more concise without losing impact."
            }`;
            schema = {
                type: Type.OBJECT,
                properties: {
                    rewritten: { type: Type.STRING },
                    reason: { type: Type.STRING }
                },
                required: ["rewritten", "reason"]
            };
            break;
        case 'GET_SKILL_SUGGESTIONS':
            const currentSkillsStr = context.currentSkills ? JSON.stringify(context.currentSkills) : 'None';
            prompt = `Analyze the following job description and the user's current skills.
            Identify relevant hard and soft skills that are mentioned or strongly implied by the job description but are MISSING from the current skills.
            Also, group these missing skills into logical, readable categories (e.g., "Programming Languages", "Soft Skills", "Tools & Frameworks").
            
            Job Description:
            ${context.jobDescription}
            
            Current Skills:
            ${currentSkillsStr}
            
            Return JSON strictly matching this schema:
            {
                "categories": [
                    {
                        "name": "Category Name",
                        "skills": ["Skill 1", "Skill 2"]
                    }
                ]
            }`;
            schema = {
                type: Type.OBJECT,
                properties: {
                    categories: {
                        type: Type.ARRAY,
                        items: {
                            type: Type.OBJECT,
                            properties: {
                                name: { type: Type.STRING },
                                skills: {
                                    type: Type.ARRAY,
                                    items: { type: Type.STRING }
                                }
                            },
                            required: ["name", "skills"]
                        }
                    }
                },
                required: ["categories"]
            };
            useJson = true;
            break;
        case 'GET_REDDIT_INSIGHTS':
            prompt = `Generate 3 realistic "Reddit-style" career advice snippets for someone applying for a "${context.title}" role.
            Each snippet should have a catchy title, a short piece of advice (1-2 sentences), and a simulated upvote count.
            Focus on common pitfalls, interview tips, or resume tricks for this specific role.
            
            Return JSON strictly matching this schema:
            [
                { "title": "Snippet Title", "advice": "The advice text", "upvotes": 1200 }
            ]`;
            schema = {
                type: Type.ARRAY,
                items: {
                    type: Type.OBJECT,
                    properties: {
                        title: { type: Type.STRING },
                        advice: { type: Type.STRING },
                        upvotes: { type: Type.NUMBER }
                    },
                    required: ["title", "advice", "upvotes"]
                }
            };
            break;
        default: throw new Error(`Unknown type: ${type}`);
    }
    try {
        const response = await scheduler.add<any>(() => callServerAI(prompt, "gemini-3-flash-preview", useJson ? { 
            responseMimeType: "application/json",
            responseSchema: schema || undefined,
            temperature: 0.3
        } : { temperature: 0.7 }));
        return useJson ? parseJsonResult(response.text()) : (response.text() || '').trim();
    } catch (error) { return handleAiError(error); }
};

export const askNotebook = async (context: string, query: string): Promise<string> => {
    const response = await scheduler.add<any>(() => callServerAI(`Career Assistant. Context:\n${context}\n\nQuery: ${query}`, 'gemini-3-flash-preview', { temperature: 0.3, tools: [{ googleSearch: {} }] }));
    
    let text = response.text() || "I don't have enough information.";
    const chunks = response.candidates?.[0]?.groundingMetadata?.groundingChunks;
    if (chunks && chunks.length > 0) {
        const links = chunks.filter((c: any) => c.web).map((c: any) => `[${c.web.title}](${c.web.uri})`);
        if (links.length > 0) {
            const uniqueLinks = [...new Map(links.map((v: any) => {
                const urlMatch = v.match(/\]\((.*?)\)/);
                return [urlMatch ? urlMatch[1] : v, v];
            })).values()];
            text += "\n\n**Sources:**\n" + uniqueLinks.map((l: any) => `- ${l}`).join('\n');
        }
    }
    return text;
};

export const researchCompany = async (companyName: string): Promise<{ text: string; sources: { uri: string; title: string }[] }> => {
    const prompt = `Intelligence report for: "${companyName}" using Search. Include Mission, News, Stack.`;
    try {
        const response = await scheduler.add<any>(() => callServerAI(prompt, 'gemini-3-flash-preview', { tools: [{ googleSearch: {} }], temperature: 0.4 }));
        const text = response.text() || "No data found.";
        const chunks = response.candidates?.[0]?.groundingMetadata?.groundingChunks;
        let sources = [];
        if (chunks && Array.isArray(chunks)) {
            sources = chunks.map((c: any) => c.web).filter(Boolean);
        }
        return { text, sources };
    } catch (e) { 
        return { text: "Research failed.", sources: [] }; 
    }
};

export const generateAudioBrief = async (context: string): Promise<string> => {
    const prompt = `Podcast summary of: ${context}. High energy, 1 min.`;
    try {
        const response = await scheduler.add<any>(() => callServerAI(prompt, "gemini-2.5-flash-preview-tts", {
            responseModalities: [Modality.AUDIO],
            speechConfig: { voiceConfig: { prebuiltVoiceConfig: { voiceName: 'Kore' } } },
        }));
        // Note: The server-side proxy needs to handle audio modality correctly.
        // For now, we assume it returns the base64 data in the result field.
        return response.text() || '';
    } catch (e) { return ''; }
};

export const analyzeSkillGap = async (resumeData: ResumeData, jobDescription: string): Promise<{ missingSkills: string[]; matchingSkills: string[]; learningResources: { skill: string; resources: { title: string; url: string }[] }[] }> => {
    const prompt = `Act as a career development expert. Analyze the resume against the job description to identify skill gaps.
    
    Resume Skills: ${resumeData.skills.map(c => c.skills.map(s => s.name).join(', ')).join(', ')}
    Job Description: ${jobDescription}
    
    Return a JSON object with:
    1. "missingSkills": Array of critical skills mentioned in JD but missing from resume.
    2. "matchingSkills": Array of skills found in both.
    3. "learningResources": Array of objects, each with a "skill" (from missingSkills) and "resources" (array of 2-3 real online courses or tutorials with "title" and "url" from platforms like Coursera, Udemy, YouTube, or official docs).
    
    Return JSON strictly matching this schema:
    {
        "missingSkills": ["string"],
        "matchingSkills": ["string"],
        "learningResources": [
            {
                "skill": "string",
                "resources": [
                    { "title": "string", "url": "string" }
                ]
            }
        ]
    }
    `;

    try {
        const response = await scheduler.add<any>(() => callServerAI(prompt, "gemini-3-flash-preview", { 
            responseMimeType: "application/json",
            temperature: 0.3
        }));
        const result = parseJsonResult(response.text());
        return result || { missingSkills: [], matchingSkills: [], learningResources: [] };
    } catch (e) {
        console.error("Skill gap analysis failed:", e);
        return { missingSkills: [], matchingSkills: [], learningResources: [] };
    }
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
        const response = await scheduler.add<any>(() => callServerAI(prompt, 'gemini-3-flash-preview', { 
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
        }));
        const result = parseJsonResult(response.text());
        return Array.isArray(result) ? result : [];
    } catch (e) { 
        console.error("Failed to generate interview questions:", e);
        return []; 
    }
};

export const fetchRedditInterviewTips = async (role: string): Promise<string[]> => {
    const prompt = `Search for Reddit career advice and interview tips specifically for a "${role}" role. 
    Provide 3-4 highly practical, community-sourced tips that real people on Reddit (r/jobs, r/careeradvice, etc.) often share for this specific role.
    Focus on "insider" knowledge or common pitfalls.
    Return as a JSON array of strings.`;
    
    try {
        const response = await scheduler.add<any>(() => callServerAI(prompt, 'gemini-3-flash-preview', { 
            responseMimeType: "application/json", 
            temperature: 0.7,
            tools: [{ googleSearch: {} }],
            responseSchema: {
                type: Type.ARRAY,
                items: { type: Type.STRING }
            }
        }));
        const result = parseJsonResult(response.text());
        return Array.isArray(result) ? result : [];
    } catch (e) {
        console.error("Failed to fetch reddit tips:", e);
        return [
            "Research the company's recent news on Reddit to find common interview questions.",
            "Look for 'day in the life' posts for this role to understand the actual daily tasks.",
            "Check r/recruitinghell for red flags to watch out for during the interview process."
        ];
    }
};

export const generateProjectImage = async (project: Project): Promise<string> => {
    try {
        const response = await scheduler.add<any>(() => callServerAI(`Professional 3D icon for project: ${project.name}`, 'gemini-2.5-flash-image', {}));
        return response.text() || '';
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
        const response = await scheduler.add<any>(() => callServerAI(prompt, "gemini-3-flash-preview", { 
            responseMimeType: "application/json", 
            temperature: 0.6 
        }));

        const result = parseJsonResult(response.text());
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
        const response = await scheduler.add<any>(() => callServerAI(prompt, "gemini-3-flash-preview", { 
            responseMimeType: "application/json", 
            temperature: 0.4,
            tools: [{ googleSearch: {} }]
        }));

        const result = parseJsonResult(response.text());
        
        // Extract news from grounding metadata if available for better reliability
        const groundingSources = response.candidates?.[0]?.groundingMetadata?.groundingChunks
            ?.filter(chunk => chunk.web)
            ?.map(chunk => ({ 
                title: chunk.web!.title || "News Article", 
                url: ensureAbsoluteUrl(chunk.web!.uri) 
            })) || [];

        // Combine AI-generated news with grounding sources, prioritizing grounding sources
        let finalNews = groundingSources.slice(0, 5);
        
        if (finalNews.length < 3 && Array.isArray(result?.news)) {
            const aiNews = result.news
                .filter((n: any) => n.url && n.url.startsWith('http'))
                .map((n: any) => ({ 
                    title: n.title || "News Article", 
                    url: ensureAbsoluteUrl(n.url) 
                }));
            
            // Add AI news that aren't already in finalNews
            for (const item of aiNews) {
                if (finalNews.length >= 5) break;
                if (!finalNews.some(fn => fn.url === item.url)) {
                    finalNews.push(item);
                }
            }
        }

        return {
            trends: Array.isArray(result?.trends) ? result.trends : [],
            news: finalNews,
            summary: result?.summary || "No market summary available at this time."
        };
    } catch (error) {
        console.error("Failed to fetch market insights:", error);
        return { trends: [], news: [], summary: "Failed to retrieve real-time market insights." };
    }
};

export const askCoachWithGoogleSearch = async (query: string): Promise<{ text: string; sources: { uri: string; title: string }[] }> => {
    try {
        const response = await scheduler.add<any>(() => callServerAI(query, 'gemini-3-flash-preview', { tools: [{ googleSearch: {} }] }));
        const sources = response.candidates?.[0]?.groundingMetadata?.groundingChunks?.filter((chunk: any) => chunk.web)?.map((chunk: any) => ({ uri: chunk.web!.uri, title: chunk.web!.title })) || [];
        return { text: response.text() || '', sources };
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
        const response = await scheduler.add<any>(() => callServerAI(prompt, "gemini-3-flash-preview", { 
            responseMimeType: "application/json", 
            temperature: 0.4,
            tools: [{ googleSearch: {} }]
        }));

        const result = parseJsonResult(response.text());
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
        const response = await scheduler.add<any>(() => callServerAI(prompt, "gemini-3-flash-preview", { 
            responseMimeType: "application/json", 
            temperature: 0.3,
            tools: [{ googleSearch: {} }]
        }));

        const result = parseJsonResult(response.text());
        return Array.isArray(result) 
            ? result.map((res: any) => ({
                ...res,
                url: ensureAbsoluteUrl(res.url || "")
            })) 
            : [];
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
        const response = await scheduler.add<any>(() => callServerAI(prompt, "gemini-3-flash-preview", { 
            responseMimeType: "application/json", 
            responseSchema: {
                type: "OBJECT",
                properties: {
                    score: { type: "INTEGER" },
                    grade: { type: "STRING" },
                    hardTruths: { type: "ARRAY", items: { type: "STRING" } },
                    quickFixes: { type: "ARRAY", items: { type: "STRING" } }
                },
                required: ["score", "grade", "hardTruths", "quickFixes"]
            },
            temperature: 0.7 
        }));

        const result = parseJsonResult(response.text());
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
    suggestedProjects?: { name: string; description: string }[];
    suggestedCertifications?: string[];
}

export const chatWithAI = async (messages: { role: string; content: string }[], resumeData: ResumeData, userId?: string): Promise<string> => {
    let memoryContext = "";
    
    // Fetch persistent memory if user is logged in
    if (userId) {
        try {
            const memoryDoc = await getDoc(doc(db, 'user_memories', userId));
            if (memoryDoc.exists()) {
                const memoryData = memoryDoc.data();
                if (memoryData.facts && memoryData.facts.length > 0) {
                    memoryContext = `\n\nPersistent Memory (Facts about the user):\n- ${memoryData.facts.join('\n- ')}`;
                }
                if (memoryData.preferences) {
                    memoryContext += `\n\nUser Preferences:\n${memoryData.preferences}`;
                }
            }
        } catch (error) {
            handleFirestoreError(error, OperationType.GET, `user_memories/${userId}`);
        }
    }

    const systemInstruction = `You are an elite career coach and AI assistant in the Career Intelligence Hub. 
    You provide low-latency, concise, and highly actionable advice.
    Here is the user's resume context: ${JSON.stringify(resumeData)}${memoryContext}
    
    CRITICAL INSTRUCTIONS FOR TAILORED ADVICE:
    1. Always reference specific details from the user's resume context when giving advice. Avoid generic platitudes.
    2. Provide step-by-step, actionable recommendations that the user can implement immediately.
    3. If the user asks about a specific job or industry, tailor your language and advice to that specific domain.
    4. Highlight specific gaps or strengths in their current resume based on their goals.
    5. Suggest exact phrasing or keywords when helping them rewrite bullet points or summaries.
    
    IMPORTANT: If the user tells you a new fact about themselves or a preference (e.g., "I prefer a direct tone", "I am learning Python"), you should acknowledge it.
    Answer their questions directly and professionally.`;
    
    try {
        const formattedMessages = messages.map(m => `${m.role === 'user' ? 'User' : 'AI'}: ${m.content}`).join('\n');
        const prompt = `${systemInstruction}\n\nConversation history:\n${formattedMessages}\n\nAI:`;
        
        const response = await scheduler.add<any>(() => callServerAI(prompt, "gemini-3-flash-preview", { 
            temperature: 0.7,
            tools: [{ googleSearch: {} }]
        }));
        
        let aiResponse = response.text() || "I'm sorry, I couldn't generate a response.";
        
        const chunks = response.candidates?.[0]?.groundingMetadata?.groundingChunks;
        if (chunks && chunks.length > 0) {
            const links = chunks.filter((c: any) => c.web).map((c: any) => `[${c.web.title}](${c.web.uri})`);
            if (links.length > 0) {
                // remove duplicate links based on url
                const uniqueLinks = [...new Map(links.map((v: any) => {
                    const urlMatch = v.match(/\]\((.*?)\)/);
                    return [urlMatch ? urlMatch[1] : v, v];
                })).values()];
                aiResponse += "\n\n**Sources:**\n" + uniqueLinks.map((l: any) => `- ${l}`).join('\n');
            }
        }
        
        // Asynchronously update memory if needed
        if (userId && messages.length > 0) {
            const lastUserMessage = messages[messages.length - 1].content;
            updateUserMemory(userId, lastUserMessage, aiResponse).catch(console.error);
        }
        
        return aiResponse;
    } catch (error) {
        console.error("Failed to chat with AI:", error);
        return "I'm having trouble connecting right now. Please try again later.";
    }
};

/**
 * Analyzes the conversation to extract new facts or preferences and updates the persistent memory.
 */
const updateUserMemory = async (userId: string, userMessage: string, aiResponse: string) => {
    const prompt = `Analyze this recent exchange between a user and an AI career coach.
    User: "${userMessage}"
    AI: "${aiResponse}"
    
    Extract any NEW, persistent facts about the user (e.g., skills they are learning, career goals, personal details relevant to their career) or preferences (e.g., "I like short answers", "I prefer a formal tone").
    Do not extract transient information or things already in their resume.
    
    Return a JSON object with:
    - newFacts: An array of strings representing new facts. Empty array if none.
    - newPreferences: An array of strings representing new preferences. Empty array if none.
    
    Return JSON strictly matching this schema:
    {
        "newFacts": ["string"],
        "newPreferences": ["string"]
    }`;

    try {
        const response = await scheduler.add<any>(() => callServerAI(prompt, "gemini-3-flash-preview", { 
            responseMimeType: "application/json", 
            temperature: 0.1 
        }));

        const result = parseJsonResult(response.text());
        
        if (result && ((result.newFacts && result.newFacts.length > 0) || (result.newPreferences && result.newPreferences.length > 0))) {
            const memoryRef = doc(db, 'user_memories', userId);
            
            let memoryDoc;
            try {
                memoryDoc = await getDoc(memoryRef);
            } catch (err) {
                handleFirestoreError(err, OperationType.GET, `user_memories/${userId}`);
                return; // stop execution if we fail to fetch
            }
            
            let facts: string[] = [];
            let preferences = "";
            
            if (memoryDoc && memoryDoc.exists()) {
                const data = memoryDoc.data();
                facts = data.facts || [];
                preferences = data.preferences || "";
            }
            
            if (result.newFacts && result.newFacts.length > 0) {
                // Add new facts, keeping only the last 50 to avoid bloat
                facts = [...new Set([...facts, ...result.newFacts])].slice(-50);
            }
            
            if (result.newPreferences && result.newPreferences.length > 0) {
                // Simple append for now
                preferences += (preferences ? "\n" : "") + result.newPreferences.join("\n");
                // truncate if too long
                if (preferences.length > 1000) preferences = preferences.substring(preferences.length - 1000);
            }
            
            try {
                await setDoc(memoryRef, {
                    userId,
                    facts,
                    preferences,
                    lastUpdated: serverTimestamp()
                }, { merge: true });
                console.log("Updated user memory for", userId);
            } catch (err) {
                handleFirestoreError(err, OperationType.UPDATE, `user_memories/${userId}`);
            }
        }
    } catch (error) {
        console.error("Failed to generate or update user memory:", error);
    }
};

export const getNetworkingStrategy = async (resumeData: ResumeData, targetRole: string): Promise<{ 
    templates: { type: string; subject: string; body: string }[]; 
    advice: string[];
    interviewQuestions: string[];
}> => {
    const prompt = `Act as a networking expert. Create a networking strategy for a professional with this resume: ${JSON.stringify(resumeData)}
    Target Role: ${targetRole}
    
    Return a JSON object with:
    - templates: 3 networking templates. 
        1. "LinkedIn Connection Request": A short, personalized note (under 300 chars) for a LinkedIn connection.
        2. "Informational Interview Request": A professional email asking for 15-20 minutes of their time.
        3. "Recruiter Follow-up": A polite follow-up after an application or initial contact.
    - advice: 3-5 specific networking tips for this user.
    - interviewQuestions: 5-7 high-impact questions the user should ask during an informational interview to build rapport and gain insights.
    
    Return JSON strictly matching this schema:
    {
        "templates": [{"type": "string", "subject": "string", "body": "string"}],
        "advice": ["string"],
        "interviewQuestions": ["string"]
    }`;

    try {
        const response = await scheduler.add<any>(() => callServerAI(prompt, "gemini-3-flash-preview", { 
            responseMimeType: "application/json", 
            temperature: 0.7 
        }));

        const result = parseJsonResult(response.text());
        return {
            templates: Array.isArray(result?.templates) ? result.templates : [],
            advice: Array.isArray(result?.advice) ? result.advice : [],
            interviewQuestions: Array.isArray(result?.interviewQuestions) ? result.interviewQuestions : []
        };
    } catch (error) {
        console.error("Failed to fetch networking strategy:", error);
        return { 
            templates: [], 
            advice: ["Focus on building genuine relationships in your target industry."],
            interviewQuestions: [
                "What does a typical day look like in your role?",
                "What skills are most valued in your team?",
                "How did you get your start in this industry?"
            ]
        };
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
        const response = await scheduler.add<any>(() => callServerAI(prompt, "gemini-3-flash-preview", { 
            responseMimeType: "application/json", 
            temperature: 0.8 
        }));

        const result = parseJsonResult(response.text());
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
        const response = await scheduler.add<any>(() => callServerAI(prompt, "gemini-3-flash-preview", { 
            responseMimeType: "application/json", 
            temperature: 0.4,
            tools: [{ googleSearch: {} }]
        }));

        const result = parseJsonResult(response.text());
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
        const response = await scheduler.add<any>(() => callServerAI(prompt, "gemini-3-flash-preview", { 
            responseMimeType: "application/json", 
            temperature: 0.6 
        }));

        const result = parseJsonResult(response.text());
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

export const optimizeLinkedInProfile = async (resumeData: ResumeData): Promise<{ headline: string; about: string; experience: { company: string; bullets: string[] }[] }> => {
    const prompt = `As a LinkedIn Profile Expert, optimize this user's profile based on their resume.
    
    Resume: ${JSON.stringify(resumeData)}
    
    Provide:
    1. A high-impact, keyword-rich Headline (max 220 chars).
    2. A compelling "About" section that tells a story, highlights key achievements, and includes a "Specialties" or "Skills" keyword block at the bottom.
    3. Optimized experience descriptions for their top 3 roles, focusing on quantifiable results.
    
    Return JSON strictly matching this schema:
    {
      "headline": "string",
      "about": "string",
      "experience": [
        { "company": "string", "bullets": ["string"] }
      ]
    }
    `;

    try {
        const response = await scheduler.add<any>(() => callServerAI(prompt, "gemini-3-flash-preview", { 
            responseMimeType: "application/json", 
            temperature: 0.7 
        }));
        const result = parseJsonResult(response.text());
        return result || { headline: '', about: '', experience: [] };
    } catch (error) {
        console.error("LinkedIn optimization failed:", error);
        return { headline: '', about: '', experience: [] };
    }
};

export const generateCommunicationTemplate = async (
    type: 'referral' | 'thank-you' | 'follow-up' | 'outreach',
    resumeData: ResumeData,
    context: { company?: string; role?: string; recipientName?: string; notes?: string }
): Promise<string> => {
    const prompt = `Generate a professional and high-conversion ${type} message.
    
    User Info: ${JSON.stringify(resumeData)}
    Context: ${JSON.stringify(context)}
    
    The message should be:
    - Concise and respectful of the recipient's time.
    - Personalized using the provided context.
    - Include a clear call to action.
    - Sound human, not like a generic template.
    
    Return ONLY the message text.
    `;

    try {
        const response = await scheduler.add<any>(() => callServerAI(prompt, "gemini-3-flash-preview", { temperature: 0.7 }));
        return response.text() || "Failed to generate template.";
    } catch (error) {
        console.error("Communication template generation failed:", error);
        return "Failed to generate template.";
    }
};

export const generateInterviewCheatSheet = async (resumeData: ResumeData, jobDescription: string, companyName: string): Promise<{ mission: string; talkingPoints: string[]; questionsToAsk: string[]; redFlags: string[] }> => {
    const prompt = `As an Interview Coach, generate a comprehensive Interview Cheat Sheet for this candidate.
    
    Company: ${companyName}
    Job Description: ${jobDescription}
    Candidate Resume: ${JSON.stringify(resumeData)}
    
    Research the company (if possible) and provide:
    1. Company Mission & Values (summarized).
    2. 3-5 Key Talking Points: How the candidate's specific experience maps to this role's needs.
    3. 5 Strategic Questions to Ask: High-level questions that show deep interest and business acumen.
    4. 3 Red Flags to Watch Out For: Potential concerns based on the industry or role type.
    
    Return JSON strictly matching this schema:
    {
      "mission": "string",
      "talkingPoints": ["string"],
      "questionsToAsk": ["string"],
      "redFlags": ["string"]
    }
    `;

    try {
        const response = await scheduler.add<any>(() => callServerAI(prompt, "gemini-3-flash-preview", { 
            tools: [{ googleSearch: {} }],
            responseMimeType: "application/json", 
            temperature: 0.6 
        }));
        const result = parseJsonResult(response.text());
        return result || { mission: '', talkingPoints: [], questionsToAsk: [], redFlags: [] };
    } catch (error) {
        console.error("Interview cheat sheet generation failed:", error);
        return { mission: '', talkingPoints: [], questionsToAsk: [], redFlags: [] };
    }
};
