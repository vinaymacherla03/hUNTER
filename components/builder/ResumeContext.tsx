
import React, { createContext, useContext } from 'react';
import { ResumeData } from '../../types';

interface ResumeContextType {
    resumeData: ResumeData;
    jobDescription: string;
    onRewrite: (path: string, originalText: string, type: 'summary' | 'bullet', mode?: 'IMPACT' | 'CONCISE') => void;
    onInterviewPrep: () => void;
    isInterviewPrepLoading: boolean;
    isThinkingPath: string | null;
}

// Create the context with default values
export const ResumeContext = createContext<ResumeContextType>({
    resumeData: {} as ResumeData,
    jobDescription: '',
    onRewrite: () => {},
    onInterviewPrep: () => {},
    isInterviewPrepLoading: false,
    isThinkingPath: null
});

// Custom hook to use the context
export const useResumeContext = () => useContext(ResumeContext);
