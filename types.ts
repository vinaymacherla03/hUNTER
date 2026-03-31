
export type TemplateKey = string;

export type ResumeSectionKey = 'summary' | 'experience' | 'projects' | 'education' | 'certifications' | 'skills' | 'awards' | 'keywords';

export type ColorTheme = 'indigo' | 'blue' | 'emerald' | 'rose' | 'slate' | 'orange' | 'amber';
export type FontTheme = 'times-new-roman' | 'tahoma' | 'verdana' | 'arial' | 'helvetica' | 'calibri' | 'georgia' | 'cambria' | 'gill-sans' | 'garamond' | 'inter' | 'roboto' | 'lato' | 'montserrat' | 'source-sans' | 'lora' | 'roboto-mono' | 'jakarta' | 'playfair' | 'open-sans' | 'poppins' | 'merriweather' | 'nunito' | 'oswald' | 'raleway' | 'crimson-pro' | 'work-sans' | 'jetbrains-mono';
export type MarginTheme = 'compact' | 'normal' | 'spacious';
export type PageFormat = 'A4' | 'LETTER';

export interface Customization {
    color: ColorTheme;
    font: FontTheme;
    margin: MarginTheme;
    pageFormat?: PageFormat;
    // Font sizes in points (pt)
    nameSize: number;
    titleSize: number;
    sectionTitleSize: number;
    itemTitleSize: number;
    bodySize: number;
    // Line height as a multiplier
    lineHeight: number;
    // Section Title Styling
    sectionTitleColor: string;
    sectionTitleBorderStyle: 'none' | 'underline' | 'overline' | 'full';
    sectionTitleBorderColor: string;
    sectionTitleUppercase: boolean;
}

export interface ContactInfo {
    email: string;
    phone: string;
    linkedin: string;
    location: string;
    github?: string;
    portfolio?: string;
}

export interface Experience {
    id: string;
    role: string;
    company: string;
    location: string;
    dates: string;
    description: string[];
}

export interface Education {
    id: string;
    degree: string;
    institution: string;
    location: string;
    graduationDate: string;
    relevantCoursework?: string[];
}

export interface Project {
    id: string;
    name: string;
    role:string;
    startDate?: string;
    endDate?: string;
    description: string[];
    technologies?: string[];
    link?: string;
    image?: string;
}

export interface Certification {
    id: string;
    name: string;
    issuer: string;
    date: string;
    // Adding a field to satisfy TS if needed for new templates, optional
    url?: string;
}

export interface Award {
    id: string;
    name: string;
    issuer: string;
    date: string;
}

export type SkillProficiency = 'Beginner' | 'Intermediate' | 'Advanced' | 'Expert';

export interface Skill {
    id: string;
    name: string;
    proficiency: SkillProficiency;
}

export interface SkillCategory {
    id: string;
    name: string;
    skills: Skill[];
}

export interface SuggestedSkill {
    name: string;
    categorySuggestion: string;
}

export interface KeywordAnalysis {
  presentKeywords: string[];
  missingKeywords: string[];
}

export interface AuditResult {
    overallScore: number;
    feedback: {
        category: 'Impact' | 'Quantification' | 'Conciseness' | 'Skills';
        message: string;
        suggestion?: string;
        contextPath?: string; // e.g., 'experience[1].description[2]'
    }[];
}


export interface ResumeData {
    fullName: string;
    title: string;
    contactInfo: ContactInfo;
    summary: string;
    experience: Experience[];
    education: Education[];
    skills: SkillCategory[];
    projects?: Project[];
    certifications?: Certification[];
    awards?: Award[];
    keywords?: string[];
}

export interface JobApplication {
    id: string;
    company: string;
    role: string;
    status: 'Saved' | 'Applied' | 'Interviewing' | 'Offer' | 'Rejected';
    dateAdded: string;
    jobDescription?: string;
    link?: string;
    location?: string;
    salary?: string;
    source?: string;
}

export interface JobListing {
    id: string;
    company: string;
    role: string;
    location: string;
    salary?: string;
    link: string;
    summary: string;
    matchScore?: number;
    missingSkills?: string[];
    postedAt?: string;
    companyUrl?: string;
    companyLogo?: string;
    platform?: string; // e.g., LinkedIn, Indeed, Glassdoor
    // Enhanced fields
    jobType?: string; // e.g., Full-time, Contract
    type?: string;    // Alias for jobType
    isRemote?: boolean;
    benefits?: string[];
    qualifications?: string[];
    responsibilities?: string[];
    experienceLevel?: string;
    industry?: string;
    // Insights
    hiringManagerTraits?: string[];
    cultureNotes?: string[];
    commonInterviewQuestions?: string[];
}

export interface JobAlert {
    id: string;
    role: string;
    location: string;
    frequency: 'daily' | 'weekly';
    filters: {
        remote: boolean;
        salary: string;
    };
    createdAt: string;
}

export interface InterviewQuestion {
    id: string;
    type: 'Behavioral' | 'Technical' | 'General' | 'Situational';
    question: string;
    tip: string;
    sampleAnswer?: string;
}

export interface InterviewFeedback {
    score: number; // 1-10
    strengths: string[];
    improvements: string[];
    refinedAnswer: string;
}
