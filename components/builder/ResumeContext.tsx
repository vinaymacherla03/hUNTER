
import React, { createContext, useContext } from 'react';
import { ResumeData, ResumeSectionKey } from '../../types';

interface ResumeContextType {
    resumeData: ResumeData;
    jobDescription: string;
    onRewrite: (path: string, originalText: string, type: 'summary' | 'bullet', mode?: 'IMPACT' | 'CONCISE') => void;
    onDataChange: (path: string, value: any) => void;
    onApplyTailoredResume: (data: ResumeData, sectionOrder?: ResumeSectionKey[]) => void;
    onInterviewPrep: () => void;
    isInterviewPrepLoading: boolean;
    isThinkingPath: string | null;
    aiSuggestions: Record<string, { suggestion: string, reason: string }>;
    onApplySuggestion: (path: string, suggestion: string) => void;
    onClearSuggestion: (path: string) => void;
    readOnly?: boolean;
}

// Create the context with default values
export const ResumeContext = createContext<ResumeContextType>({
    resumeData: {} as ResumeData,
    jobDescription: '',
    onRewrite: () => {},
    onDataChange: () => {},
    onApplyTailoredResume: () => {},
    onInterviewPrep: () => {},
    isInterviewPrepLoading: false,
    isThinkingPath: null,
    aiSuggestions: {},
    onApplySuggestion: () => {},
    onClearSuggestion: () => {},
    readOnly: false
});

// Custom hook to use the context
export const useResumeContext = () => useContext(ResumeContext);
