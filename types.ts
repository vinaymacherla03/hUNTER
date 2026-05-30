
export type TemplateKey = string;

export type ResumeSectionKey = 'summary' | 'experience' | 'projects' | 'education' | 'certifications' | 'skills' | 'awards' | 'keywords';

export type ColorTheme = 'indigo' | 'blue' | 'emerald' | 'rose' | 'slate' | 'orange' | 'amber' | 'violet' | 'fuchsia' | 'pink' | 'cyan' | 'teal' | 'lime' | 'yellow' | 'red' | 'black';
export type FontTheme = 'times-new-roman' | 'tahoma' | 'verdana' | 'arial' | 'helvetica' | 'calibri' | 'georgia' | 'cambria' | 'gill-sans' | 'garamond' | 'inter' | 'roboto' | 'lato' | 'montserrat' | 'source-sans' | 'lora' | 'roboto-mono' | 'jakarta' | 'playfair' | 'open-sans' | 'poppins' | 'merriweather' | 'nunito' | 'oswald' | 'raleway' | 'crimson-pro' | 'work-sans' | 'jetbrains-mono' | 'dm-sans' | 'outfit' | 'space-grotesk' | 'quicksand' | 'cabin' | 'pt-sans' | 'pt-serif' | 'bitter' | 'libre-baserville' | 'noto-sans' | 'noto-serif';
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
    fitToOnePage?: boolean;
}

export interface ContactInfo {
    email: string;
    phone: string;
    linkedin: string;
    location: string;
    github?: string;
    portfolio?: string;
    website?: string;
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
  detectedJobTitle?: string;
}

export interface AuditResult {
    overallScore: number;
    atsScore?: number; // Specific score for ATS parsability (e.g., OpenCATS)
    feedback: {
        category: 'Impact' | 'Quantification' | 'Conciseness' | 'Skills' | 'ATS Parsability' | 'OpenCATS Compatibility';
        message: string;
        suggestion?: string;
        contextPath?: string; // e.g., 'experience[1].description[2]'
    }[];
}


export type AIMode = 'Standard' | 'Technical' | 'Leadership' | 'Creative' | 'Executive' | 'Entry-Level';

export interface JobEvaluation {
    overallScore: number;
    matchDetails: string;
    pros: string[];
    cons: string[];
    marketInsights: string;
}

export interface ResumeVersion {
    id: string;
    userId?: string;
    name: string;
    timestamp: any; // Can be number (localStorage) or Firestore Timestamp
    resumeData: ResumeData;
    isAutoSave?: boolean;
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

export interface JobContact {
    id: string;
    name: string;
    role: string;
    email?: string;
    phone?: string;
    linkedin?: string;
    notes?: string;
}

export interface JobTask {
    id: string;
    title: string;
    dueDate?: string;
    completed: boolean;
    priority: 'low' | 'medium' | 'high';
}

export interface JobApplication {
    id: string;
    userId: string;
    company: string;
    role: string;
    status: 'Saved' | 'Applied' | 'Interviewing' | 'Offer' | 'Rejected';
    dateAdded: string;
    jobDescription?: string;
    link?: string;
    location?: string;
    salary?: string;
    source?: string;
    contacts?: JobContact[];
    tasks?: JobTask[];
    notes?: string;
    lastInteraction?: string;
    companyUrl?: string;
    companyLogo?: string;
}

export interface JobSearchFilters {
    experienceLevel?: 'Entry' | 'Mid' | 'Senior' | 'Executive' | 'Any' | '0-2 years' | '2-5 years' | '5-10 years' | '10+ years';
    employmentType?: 'Full-time' | 'Part-time' | 'Contract' | 'Internship' | 'Any' | 'Temporary' | 'Volunteer';
    remoteOption?: 'Remote' | 'On-site' | 'Hybrid' | 'Any';
    datePosted?: 'Past 24h' | 'Past 3 days' | 'Past week' | 'Past month' | 'Any';
    minSalary?: number;
    technologies?: string[];
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
