
import React, { useState, useEffect } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { Sparkles, AlertCircle, Info, ChevronRight, RefreshCw } from 'lucide-react';
import { getSectionAdvice } from '../../services/geminiService';
import { ResumeData, ResumeSectionKey } from '../../types';

interface SectionAdviceProps {
    section: ResumeSectionKey | 'contact';
    resumeData: ResumeData;
    jobDescription: string;
}

const SectionAdvice: React.FC<SectionAdviceProps> = ({ section, resumeData, jobDescription }) => {
    const [advice, setAdvice] = useState<{ tip: string; priority: 'low' | 'medium' | 'high' } | null>(null);
    const [isLoading, setIsLoading] = useState(false);

    const fetchAdvice = async () => {
        if (!jobDescription) return;
        setIsLoading(true);
        try {
            const result = await getSectionAdvice(section, resumeData, jobDescription);
            setAdvice(result);
        } catch (error) {
            console.error("Failed to fetch section advice:", error);
        } finally {
            setIsLoading(false);
        }
    };

    useEffect(() => {
        fetchAdvice();
    }, [section, jobDescription]);

    if (!jobDescription) return null;

    return (
        <motion.div 
            initial={{ opacity: 0, y: -10 }}
            animate={{ opacity: 1, y: 0 }}
            className="mb-8"
        >
            <div className={`p-5 rounded-2xl border transition-all duration-500 overflow-hidden relative group ${
                advice?.priority === 'high' 
                ? 'bg-rose-50/50 border-rose-100 shadow-sm' 
                : advice?.priority === 'medium'
                ? 'bg-slate-50 border-slate-200 shadow-sm'
                : 'bg-emerald-50/50 border-emerald-100 shadow-sm'
            }`}>
                <div className="absolute top-0 right-0 p-2 opacity-0 group-hover:opacity-100 transition-opacity">
                    <button 
                        onClick={fetchAdvice}
                        disabled={isLoading}
                        className="p-1.5 rounded-lg hover:bg-white/50 text-slate-400 transition-colors"
                        title="Refresh Advice"
                    >
                        <RefreshCw className={`w-3.5 h-3.5 ${isLoading ? 'animate-spin' : ''}`} />
                    </button>
                </div>

                <div className="flex gap-4">
                    <div className={`shrink-0 w-10 h-10 rounded-xl flex items-center justify-center ${
                        advice?.priority === 'high' 
                        ? 'bg-rose-100 text-rose-600' 
                        : advice?.priority === 'medium'
                        ? 'bg-slate-200 text-slate-600'
                        : 'bg-emerald-100 text-emerald-600'
                    }`}>
                        {isLoading ? (
                            <RefreshCw className="w-5 h-5 animate-spin" />
                        ) : advice?.priority === 'high' ? (
                            <AlertCircle className="w-5 h-5" />
                        ) : (
                            <Sparkles className="w-5 h-5" />
                        )}
                    </div>

                    <div className="flex-1 min-w-0">
                        <div className="flex items-center gap-2 mb-1">
                            <span className={`text-[10px] font-black uppercase tracking-widest ${
                                advice?.priority === 'high' 
                                ? 'text-rose-600' 
                                : advice?.priority === 'medium'
                                ? 'text-slate-500'
                                : 'text-emerald-600'
                            }`}>
                                AI Career Advice {advice?.priority && `• ${advice.priority} Priority`}
                            </span>
                        </div>
                        {isLoading ? (
                            <div className="space-y-2">
                                <div className="h-3 bg-slate-200/50 rounded-full w-full animate-pulse" />
                                <div className="h-3 bg-slate-200/50 rounded-full w-2/3 animate-pulse" />
                            </div>
                        ) : (
                            <p className="text-sm font-medium text-slate-700 leading-relaxed">
                                {advice?.tip || "Loading specialized advice for your target role..."}
                            </p>
                        )}
                    </div>
                </div>
            </div>
        </motion.div>
    );
};

export default SectionAdvice;
