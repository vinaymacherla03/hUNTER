
import React, { useState } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { Wand2, Target, Sparkles, RefreshCw, AlertCircle, Check, ChevronRight } from 'lucide-react';
import { ResumeData } from '../types';
import { enhanceResume } from '../services/geminiService';
import { generateResumePlainText } from '../utils/resumeUtils';
import { useResumeContext } from './builder/ResumeContext';
import { toast } from 'sonner';
import ConfirmModal from './builder/ConfirmModal';

interface SmartTailorPanelProps {
    resumeData: ResumeData;
    jobDescription: string;
    jobTitle: string;
}

const SmartTailorPanel: React.FC<SmartTailorPanelProps> = ({ resumeData, jobDescription, jobTitle }) => {
    const [isEnhancing, setIsEnhancing] = useState(false);
    const [showConfirm, setShowConfirm] = useState(false);
    const [enhancedData, setEnhancedData] = useState<ResumeData | null>(null);
    const { onApplyTailoredResume } = useResumeContext();

    const handleEnhance = async () => {
        if (!jobDescription.trim()) {
            toast.error("Please provide a job description to tailor your resume.");
            return;
        }

        setIsEnhancing(true);
        try {
            const plainText = generateResumePlainText(resumeData);
            const result = await enhanceResume(plainText, jobDescription, jobTitle || resumeData.title);
            setEnhancedData(result);
            setShowConfirm(true);
        } catch (error) {
            console.error(error);
            toast.error("Failed to tailor resume. Please try again.");
        } finally {
            setIsEnhancing(false);
        }
    };

    const confirmApply = () => {
        if (enhancedData) {
            onApplyTailoredResume(enhancedData, ['summary', 'experience', 'projects', 'education', 'skills', 'certifications', 'awards', 'keywords']);
            setShowConfirm(false);
            setEnhancedData(null);
            toast.success("Resume tailored and updated successfully!");
        }
    };

    return (
        <div className="bg-gradient-to-br from-violet-50 to-indigo-50 p-6 sm:p-8 rounded-[2.5rem] border border-violet-100 shadow-sm relative overflow-hidden">
            {/* Background decorative elements */}
            <div className="absolute top-0 right-0 -translate-y-1/2 translate-x-1/2 w-64 h-64 bg-violet-200/20 rounded-full blur-3xl" />
            <div className="absolute bottom-0 left-0 translate-y-1/2 -translate-x-1/2 w-64 h-64 bg-indigo-200/20 rounded-full blur-3xl" />

            <div className="relative z-10">
                <div className="flex items-center gap-4 mb-6">
                    <div className="p-3 bg-violet-600 text-white rounded-2xl shadow-lg shadow-violet-200">
                        <Wand2 className="w-6 h-6" />
                    </div>
                    <div>
                        <h3 className="text-xl font-black text-slate-900 tracking-tight">Smart AI Tailoring</h3>
                        <p className="text-xs text-slate-500 font-medium">Rewrite your entire resume to perfectly match a specific job.</p>
                    </div>
                </div>

                <div className="space-y-6">
                    <div className="bg-white/60 backdrop-blur-sm p-4 rounded-2xl border border-white/80 space-y-3">
                        <div className="flex items-center gap-2 text-violet-700">
                            <Target className="w-4 h-4" />
                            <span className="text-[10px] font-black uppercase tracking-widest">Target Context</span>
                        </div>
                        
                        {jobDescription.trim() ? (
                            <div className="space-y-2">
                                <p className="text-xs font-bold text-slate-900">
                                    {jobTitle || resumeData.title || 'Target Role'}
                                </p>
                                <p className="text-[10px] text-slate-500 line-clamp-2 italic leading-relaxed">
                                    "{jobDescription}"
                                </p>
                            </div>
                        ) : (
                            <p className="text-[10px] text-slate-400 font-medium">
                                No job description provided. Go to the "Job Matching" tab to add one.
                            </p>
                        )}
                    </div>

                    <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                        <div className="flex items-start gap-3 p-3 bg-white/40 rounded-xl">
                            <div className="w-5 h-5 rounded-full bg-emerald-100 flex items-center justify-center shrink-0 mt-0.5">
                                <Check className="w-3 h-3 text-emerald-600" />
                            </div>
                            <p className="text-[10px] text-slate-600 font-medium">STAR method optimization for all experience bullets.</p>
                        </div>
                        <div className="flex items-start gap-3 p-3 bg-white/40 rounded-xl">
                            <div className="w-5 h-5 rounded-full bg-emerald-100 flex items-center justify-center shrink-0 mt-0.5">
                                <Check className="w-3 h-3 text-emerald-600" />
                            </div>
                            <p className="text-[10px] text-slate-600 font-medium">Keyword injection for ATS compatibility.</p>
                        </div>
                    </div>

                    <button 
                        onClick={handleEnhance}
                        disabled={isEnhancing || !jobDescription.trim()}
                        className="w-full py-4 bg-violet-600 text-white font-black uppercase tracking-widest text-[10px] rounded-2xl hover:bg-violet-700 transition-all shadow-xl shadow-violet-200 flex items-center justify-center gap-2 active:scale-95 disabled:opacity-50 disabled:hover:bg-violet-600"
                    >
                        {isEnhancing ? (
                            <RefreshCw className="w-4 h-4 animate-spin" />
                        ) : (
                            <Sparkles className="w-4 h-4" />
                        )}
                        {isEnhancing ? 'Tailoring Resume...' : 'Tailor Entire Resume'}
                    </button>

                    <div className="flex items-center gap-2 justify-center">
                        <AlertCircle className="w-3 h-3 text-violet-400" />
                        <p className="text-[9px] text-violet-500 font-bold uppercase tracking-wider">
                            Note: This will replace your current content. A new version will be saved automatically.
                        </p>
                    </div>
                </div>
            </div>

            <ConfirmModal 
                isOpen={showConfirm}
                onCancel={() => setShowConfirm(false)}
                onConfirm={confirmApply}
                title="Apply AI Tailoring?"
                message="We've completely rewritten your resume to match the target job description. This includes a new professional summary and optimized experience bullets. Would you like to apply these changes?"
                confirmText="Apply & Save Version"
                variant="primary"
            />
        </div>
    );
};

export default SmartTailorPanel;
