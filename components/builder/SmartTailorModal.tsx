
import React, { useState } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { Wand2, Target, Sparkles, RefreshCw, AlertCircle, Check, X } from 'lucide-react';
import { ResumeData } from '../../types';
import { enhanceResume } from '../../services/geminiService';
import { generateResumePlainText } from '../../utils/resumeUtils';
import { useResumeContext } from './ResumeContext';
import { toast } from 'sonner';
import AIProcessingState from './AIProcessingState';
import ConfirmModal from './ConfirmModal';

interface SmartTailorModalProps {
    isOpen: boolean;
    onClose: () => void;
    resumeData: ResumeData;
    jobDescription: string;
    jobTitle: string;
}

const SmartTailorModal: React.FC<SmartTailorModalProps> = ({ isOpen, onClose, resumeData, jobDescription, jobTitle }) => {
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
            onClose();
            toast.success("Resume tailored and updated successfully!");
        }
    };

    if (!isOpen) return null;

    return (
        <div className="fixed inset-0 z-[100] flex items-center justify-center p-4 sm:p-6">
            <motion.div 
                initial={{ opacity: 0 }}
                animate={{ opacity: 1 }}
                exit={{ opacity: 0 }}
                onClick={onClose}
                className="absolute inset-0 bg-slate-900/60 backdrop-blur-sm"
            />
            
            <motion.div
                initial={{ opacity: 0, scale: 0.9, y: 20 }}
                animate={{ opacity: 1, scale: 1, y: 0 }}
                exit={{ opacity: 0, scale: 0.9, y: 20 }}
                className="relative w-full max-w-2xl bg-white rounded-[2.5rem] shadow-2xl overflow-hidden"
            >
                <div className="p-8 sm:p-10">
                    <div className="flex items-center justify-between mb-8">
                        <div className="flex items-center gap-4">
                            <div className="p-3 bg-violet-600 text-white rounded-2xl shadow-lg shadow-violet-200">
                                <Wand2 className="w-6 h-6" />
                            </div>
                            <div>
                                <h2 className="text-2xl font-black text-slate-900 tracking-tight">Smart AI Tailoring</h2>
                                <p className="text-xs text-slate-500 font-medium">Rewrite your entire resume to perfectly match a specific job.</p>
                            </div>
                        </div>
                        <button onClick={onClose} className="p-2 hover:bg-slate-50 rounded-full transition-colors">
                            <X className="w-5 h-5 text-slate-400" />
                        </button>
                    </div>

                    <div className="space-y-8">
                        {isEnhancing ? (
                            <div className="py-8">
                                <AIProcessingState
                                    title="Tailoring Resume"
                                    messages={[
                                        "Analyzing job description...",
                                        "Optimizing experience context...",
                                        "Aligning keywords...",
                                        "Finalizing tailored resume..."
                                    ]}
                                    color="violet"
                                    icon={Wand2}
                                />
                            </div>
                        ) : (
                            <>
                                <div className="bg-slate-50 rounded-3xl p-6 border border-slate-100 space-y-4">
                                    <div className="flex items-center gap-2 text-violet-700">
                                        <Target className="w-4 h-4" />
                                        <span className="text-[10px] font-black uppercase tracking-widest">Target Context</span>
                                    </div>
                                    
                                    {jobDescription.trim() ? (
                                        <div className="space-y-2">
                                            <p className="text-sm font-black text-slate-900">
                                                {jobTitle || resumeData.title || 'Target Role'}
                                            </p>
                                            <p className="text-xs text-slate-500 line-clamp-3 italic leading-relaxed">
                                                "{jobDescription}"
                                            </p>
                                        </div>
                                    ) : (
                                        <p className="text-xs text-slate-400 font-medium italic">
                                            No job description provided. Please provide one in the "Job Matching" tab first.
                                        </p>
                                    )}
                                </div>

                                <div className="grid grid-cols-1 sm:grid-cols-2 gap-6">
                                    <div className="flex items-start gap-4 p-4 bg-emerald-50/50 rounded-2xl border border-emerald-100">
                                        <div className="w-6 h-6 rounded-full bg-emerald-100 flex items-center justify-center shrink-0 mt-0.5">
                                            <Check className="w-4 h-4 text-emerald-600" />
                                        </div>
                                        <div>
                                            <p className="text-xs font-black text-slate-900 mb-1">STAR Method Optimization</p>
                                            <p className="text-[10px] text-slate-500 font-medium">Rewrites all experience bullets to highlight results and impact.</p>
                                        </div>
                                    </div>
                                    <div className="flex items-start gap-4 p-4 bg-emerald-50/50 rounded-2xl border border-emerald-100">
                                        <div className="w-6 h-6 rounded-full bg-emerald-100 flex items-center justify-center shrink-0 mt-0.5">
                                            <Check className="w-4 h-4 text-emerald-600" />
                                        </div>
                                        <div>
                                            <p className="text-xs font-black text-slate-900 mb-1">ATS Keyword Injection</p>
                                            <p className="text-[10px] text-slate-500 font-medium">Seamlessly integrates relevant keywords from the job description.</p>
                                        </div>
                                    </div>
                                </div>

                                <div className="pt-4">
                                    <button 
                                        onClick={handleEnhance}
                                        disabled={isEnhancing || !jobDescription.trim()}
                                        className="w-full py-5 bg-violet-600 text-white font-black uppercase tracking-widest text-xs rounded-2xl hover:bg-violet-700 transition-all shadow-xl shadow-violet-200 flex items-center justify-center gap-3 active:scale-95 disabled:opacity-50 disabled:hover:bg-violet-600"
                                    >
                                        <Sparkles className="w-5 h-5" />
                                        Tailor Entire Resume
                                    </button>

                                    <div className="flex items-center gap-2 justify-center mt-6">
                                        <AlertCircle className="w-4 h-4 text-violet-400" />
                                        <p className="text-[10px] text-violet-500 font-bold uppercase tracking-wider">
                                            Note: This will replace your current content. A new version will be saved automatically.
                                        </p>
                                    </div>
                                </div>
                            </>
                        )}
                    </div>
                </div>
            </motion.div>

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

export default SmartTailorModal;
