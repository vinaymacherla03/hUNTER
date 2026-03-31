
import React, { useState, useEffect } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { getResumeScorecard } from '../../services/geminiService';
import { ResumeData } from '../../types';
import { AlertTriangle, CheckCircle2, RefreshCw, Zap, ShieldAlert, Loader2, Award } from 'lucide-react';

interface ScorecardPanelProps {
    resumeData: ResumeData;
}

const ScorecardPanel: React.FC<ScorecardPanelProps> = ({ resumeData }) => {
    const [isLoading, setIsLoading] = useState(false);
    const [scorecard, setScorecard] = useState<{ score: number; grade: string; hardTruths: string[]; quickFixes: string[] } | null>(null);
    const [error, setError] = useState<string | null>(null);

    const fetchScorecard = async () => {
        setIsLoading(true);
        setError(null);
        try {
            const data = await getResumeScorecard(resumeData);
            setScorecard(data);
        } catch (err) {
            setError("Failed to generate scorecard. Please try again.");
            console.error(err);
        } finally {
            setIsLoading(false);
        }
    };

    useEffect(() => {
        if (!scorecard && !isLoading) {
            fetchScorecard();
        }
    }, [resumeData]);

    return (
        <div className="space-y-12">
            <div className="flex items-center justify-between">
                <div className="space-y-1">
                    <h2 className="text-4xl font-black text-slate-900 uppercase tracking-tighter">The Scorecard</h2>
                    <p className="text-sm text-slate-500 font-bold italic">A brutal, honest analysis of your resume's market value.</p>
                </div>
                <button 
                    onClick={fetchScorecard}
                    disabled={isLoading}
                    className="p-4 bg-slate-900 text-white rounded-2xl hover:bg-black transition-all disabled:opacity-50 shadow-xl shadow-slate-200"
                >
                    <RefreshCw className={`w-6 h-6 ${isLoading ? 'animate-spin' : ''}`} />
                </button>
            </div>

            <AnimatePresence mode="wait">
                {isLoading ? (
                    <motion.div 
                        key="loading"
                        initial={{ opacity: 0 }}
                        animate={{ opacity: 1 }}
                        exit={{ opacity: 0 }}
                        className="py-32 flex flex-col items-center justify-center text-center"
                    >
                        <div className="w-24 h-24 bg-slate-900 rounded-full flex items-center justify-center mb-8 animate-bounce">
                            <Zap className="w-12 h-12 text-emerald-400" />
                        </div>
                        <h3 className="text-2xl font-black text-slate-900 uppercase tracking-widest mb-2">Auditing Your Career</h3>
                        <p className="text-sm text-slate-500 max-w-xs mx-auto font-bold uppercase tracking-widest opacity-50">Scanning for weaknesses...</p>
                    </motion.div>
                ) : scorecard ? (
                    <motion.div 
                        key="results"
                        initial={{ opacity: 0, scale: 0.95 }}
                        animate={{ opacity: 1, scale: 1 }}
                        className="grid grid-cols-1 lg:grid-cols-12 gap-8"
                    >
                        {/* Big Grade Card */}
                        <div className="lg:col-span-4 bg-slate-900 text-white p-12 rounded-[3rem] flex flex-col items-center justify-center text-center relative overflow-hidden shadow-2xl shadow-slate-300">
                            <div className="absolute top-0 left-0 w-full h-1 bg-emerald-400"></div>
                            <span className="text-[10px] font-black uppercase tracking-[0.5em] text-slate-400 mb-8">Executive Grade</span>
                            <div className="relative">
                                <h3 className="text-[12rem] font-black leading-none tracking-tighter mb-4 italic">
                                    {scorecard.grade}
                                </h3>
                                <div className="absolute -top-4 -right-4 w-12 h-12 bg-emerald-400 rounded-full flex items-center justify-center text-black font-black text-xl rotate-12">
                                    {scorecard.score}
                                </div>
                            </div>
                            <p className="text-xs font-black uppercase tracking-widest text-slate-400 mt-8">Based on 50+ Recruiter Metrics</p>
                        </div>

                        <div className="lg:col-span-8 space-y-8">
                            {/* Hard Truths */}
                            <div className="space-y-6">
                                <div className="flex items-center gap-3">
                                    <ShieldAlert className="w-6 h-6 text-red-600" />
                                    <h3 className="text-xl font-black text-slate-900 uppercase tracking-widest">The Hard Truths</h3>
                                </div>
                                <div className="grid grid-cols-1 gap-4">
                                    {scorecard.hardTruths.map((truth, i) => (
                                        <div key={i} className="p-8 bg-red-50 border-l-8 border-red-600 rounded-2xl flex gap-6 items-start">
                                            <div className="text-3xl font-black text-red-200 shrink-0">0{i + 1}</div>
                                            <p className="text-sm font-bold text-red-900 leading-relaxed italic">"{truth}"</p>
                                        </div>
                                    ))}
                                </div>
                            </div>

                            {/* Quick Fixes */}
                            <div className="space-y-6">
                                <div className="flex items-center gap-3">
                                    <Zap className="w-6 h-6 text-emerald-500" />
                                    <h3 className="text-xl font-black text-slate-900 uppercase tracking-widest">Immediate Fixes</h3>
                                </div>
                                <div className="grid grid-cols-1 gap-4">
                                    {scorecard.quickFixes.map((fix, i) => (
                                        <div key={i} className="p-8 bg-white border-2 border-slate-100 rounded-2xl flex gap-6 items-center group hover:border-slate-900 transition-all">
                                            <div className="w-12 h-12 rounded-xl bg-slate-50 flex items-center justify-center group-hover:bg-slate-900 transition-colors shrink-0">
                                                <CheckCircle2 className="w-6 h-6 text-slate-300 group-hover:text-emerald-400" />
                                            </div>
                                            <p className="text-sm font-black text-slate-800 uppercase tracking-tight">{fix}</p>
                                        </div>
                                    ))}
                                </div>
                            </div>
                        </div>
                    </motion.div>
                ) : (
                    <div className="py-32 text-center border-4 border-dashed border-slate-100 rounded-[3rem]">
                        <Award className="w-20 h-20 text-slate-100 mx-auto mb-8" />
                        <h3 className="text-2xl font-black text-slate-900 uppercase tracking-widest mb-4">Ready for the Truth?</h3>
                        <p className="text-sm text-slate-500 max-w-xs mx-auto font-bold uppercase tracking-widest opacity-50 mb-12">Get a raw analysis of your resume's impact.</p>
                        <button 
                            onClick={fetchScorecard}
                            className="px-12 py-5 bg-slate-900 text-white rounded-2xl font-black uppercase tracking-widest text-xs hover:bg-black transition-all shadow-2xl shadow-slate-200"
                        >
                            Generate Scorecard
                        </button>
                    </div>
                )}
            </AnimatePresence>

            {error && (
                <div className="p-6 bg-red-50 text-red-600 text-sm font-black rounded-2xl border-2 border-red-100 uppercase tracking-widest text-center">
                    {error}
                </div>
            )}
        </div>
    );
};

export default ScorecardPanel;
