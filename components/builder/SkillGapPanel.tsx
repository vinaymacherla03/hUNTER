
import React, { useState, useEffect } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { Target, BookOpen, CheckCircle2, AlertCircle, Loader2, ExternalLink, Sparkles, ArrowRight } from 'lucide-react';
import { ResumeData } from '../../types';
import { analyzeSkillGap } from '../../services/geminiService';

interface SkillGapPanelProps {
    resumeData: ResumeData;
    jobDescription: string;
}

const SkillGapPanel: React.FC<SkillGapPanelProps> = ({ resumeData, jobDescription }) => {
    const [loading, setLoading] = useState(false);
    const [result, setResult] = useState<{
        missingSkills: string[];
        matchingSkills: string[];
        learningResources: { skill: string; resources: { title: string; url: string }[] }[];
    } | null>(null);

    const handleAnalyze = async () => {
        if (!jobDescription.trim()) return;
        setLoading(true);
        try {
            const data = await analyzeSkillGap(resumeData, jobDescription);
            setResult(data);
        } catch (error) {
            console.error(error);
        } finally {
            setLoading(false);
        }
    };

    return (
        <div className="space-y-6 sm:space-y-8">
            <div className="bg-white p-4 sm:p-8 rounded-[2rem] sm:rounded-[2.5rem] border border-slate-100 shadow-sm">
                <div className="flex flex-col md:flex-row md:items-center justify-between gap-6 mb-8">
                    <div>
                        <h3 className="text-xl sm:text-2xl font-black text-slate-900 tracking-tight mb-2">Skill Gap Analysis</h3>
                        <p className="text-sm sm:text-base text-slate-500 font-medium">Compare your resume against a job description to identify missing skills and get learning recommendations.</p>
                    </div>
                    <button
                        onClick={handleAnalyze}
                        disabled={loading || !jobDescription.trim()}
                        className="px-8 py-4 bg-slate-900 text-white rounded-2xl font-black uppercase tracking-widest text-xs hover:bg-emerald-600 transition-all disabled:opacity-50 flex items-center gap-3 shrink-0"
                    >
                        {loading ? <Loader2 className="w-4 h-4 animate-spin" /> : <Sparkles className="w-4 h-4" />}
                        {loading ? 'Analyzing...' : 'Analyze Gaps'}
                    </button>
                </div>

                {!jobDescription.trim() && (
                    <div className="p-12 border-2 border-dashed border-slate-100 rounded-[2rem] flex flex-col items-center justify-center text-center">
                        <div className="w-16 h-16 bg-slate-50 rounded-2xl flex items-center justify-center mb-4">
                            <Target className="w-8 h-8 text-slate-300" />
                        </div>
                        <p className="text-slate-400 font-bold max-w-xs">Please provide a job description in the "Match Analysis" tab first.</p>
                    </div>
                )}

                {result && (
                    <div className="grid grid-cols-1 lg:grid-cols-2 gap-8">
                        {/* Matching Skills */}
                        <div className="space-y-6">
                            <div className="flex items-center gap-3">
                                <div className="w-10 h-10 bg-emerald-50 rounded-xl flex items-center justify-center border border-emerald-100">
                                    <CheckCircle2 className="w-5 h-5 text-emerald-600" />
                                </div>
                                <h4 className="text-lg font-black text-slate-900 tracking-tight">Matching Skills</h4>
                            </div>
                            <div className="flex flex-wrap gap-2">
                                {result.matchingSkills.map((skill, idx) => (
                                    <span key={idx} className="px-4 py-2 bg-emerald-50 text-emerald-700 rounded-xl text-xs font-bold border border-emerald-100">
                                        {skill}
                                    </span>
                                ))}
                                {result.matchingSkills.length === 0 && (
                                    <p className="text-slate-400 text-sm font-medium italic">No direct matches found yet.</p>
                                )}
                            </div>
                        </div>

                        {/* Missing Skills */}
                        <div className="space-y-6">
                            <div className="flex items-center gap-3">
                                <div className="w-10 h-10 bg-rose-50 rounded-xl flex items-center justify-center border border-rose-100">
                                    <AlertCircle className="w-5 h-5 text-rose-600" />
                                </div>
                                <h4 className="text-lg font-black text-slate-900 tracking-tight">Missing Skills</h4>
                            </div>
                            <div className="flex flex-wrap gap-2">
                                {result.missingSkills.map((skill, idx) => (
                                    <span key={idx} className="px-4 py-2 bg-rose-50 text-rose-700 rounded-xl text-xs font-bold border border-rose-100">
                                        {skill}
                                    </span>
                                ))}
                                {result.missingSkills.length === 0 && (
                                    <p className="text-slate-400 text-sm font-medium italic">You match all key skills mentioned!</p>
                                )}
                            </div>
                        </div>

                        {/* Learning Resources */}
                        {result.learningResources.length > 0 && (
                            <div className="lg:col-span-2 space-y-6 pt-8 border-t border-slate-100">
                                <div className="flex items-center gap-3">
                                    <div className="w-10 h-10 bg-blue-50 rounded-xl flex items-center justify-center border border-blue-100">
                                        <BookOpen className="w-5 h-5 text-blue-600" />
                                    </div>
                                    <h4 className="text-lg font-black text-slate-900 tracking-tight">Upskilling Roadmap</h4>
                                </div>
                                <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                                    {result.learningResources.map((item, idx) => (
                                        <div key={idx} className="bg-slate-50 p-6 rounded-[2rem] border border-slate-100">
                                            <h5 className="text-sm font-black text-slate-900 uppercase tracking-widest mb-4 flex items-center gap-2">
                                                <div className="w-2 h-2 rounded-full bg-blue-500" />
                                                {item.skill}
                                            </h5>
                                            <div className="space-y-3">
                                                {item.resources.map((res, rIdx) => (
                                                    <a
                                                        key={rIdx}
                                                        href={res.url}
                                                        target="_blank"
                                                        rel="noopener noreferrer"
                                                        className="flex items-center justify-between p-4 bg-white rounded-xl border border-slate-200 hover:border-blue-400 hover:shadow-md transition-all group"
                                                    >
                                                        <span className="text-xs font-bold text-slate-700 group-hover:text-blue-600 transition-colors">{res.title}</span>
                                                        <ExternalLink className="w-3.5 h-3.5 text-slate-400 group-hover:text-blue-500" />
                                                    </a>
                                                ))}
                                            </div>
                                        </div>
                                    ))}
                                </div>
                            </div>
                        )}
                    </div>
                )}
            </div>
        </div>
    );
};

export default SkillGapPanel;
