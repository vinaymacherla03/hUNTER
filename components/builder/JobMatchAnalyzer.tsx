
import React, { useState } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { ResumeData, KeywordAnalysis } from '../../types';
import { analyzeKeywords, tailorResumeToJob, TailoredContent } from '../../services/geminiService';
import SparkleIcon from '../icons/SparkleIcon';
import { useResumeContext } from './ResumeContext';
import { generateResumePlainText } from '../../utils/resumeUtils';
import { FileText, Eye, Info } from 'lucide-react';

interface JobMatchAnalyzerProps {
    resumeData: ResumeData;
    jobDescription: string;
    onJobDescriptionChange: (jd: string) => void;
}

const Tag: React.FC<{ text: string; type: 'present' | 'missing' }> = ({ text, type }) => {
    const styles = {
        present: 'bg-emerald-50 text-emerald-700 border-emerald-100',
        missing: 'bg-rose-50 text-rose-700 border-rose-100'
    };
    const icon = type === 'present' ? (
        <svg className="w-3 h-3 mr-1" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={3}><path strokeLinecap="round" strokeLinejoin="round" d="M5 13l4 4L19 7" /></svg>
    ) : (
        <svg className="w-3 h-3 mr-1" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={3}><path strokeLinecap="round" strokeLinejoin="round" d="M6 18L18 6M6 6l12 12" /></svg>
    );

    return (
        <span className={`inline-flex items-center px-2.5 py-1 rounded-full text-[10px] font-bold uppercase tracking-wide border ${styles[type]}`}>
            {icon}
            {text}
        </span>
    )
};

const CircularProgress: React.FC<{ score: number }> = ({ score }) => {
    const radius = 36;
    const circumference = 2 * Math.PI * radius;
    const offset = circumference - (score / 100) * circumference;
    
    const getColor = (s: number) => {
        if (s >= 80) return 'text-emerald-500';
        if (s >= 50) return 'text-amber-500';
        return 'text-rose-500';
    };

    return (
        <div className="relative w-24 h-24 flex items-center justify-center">
            <svg className="w-full h-full transform -rotate-90">
                <circle
                    cx="48"
                    cy="48"
                    r={radius}
                    stroke="currentColor"
                    strokeWidth="8"
                    fill="transparent"
                    className="text-slate-100"
                />
                <motion.circle
                    cx="48"
                    cy="48"
                    r={radius}
                    stroke="currentColor"
                    strokeWidth="8"
                    fill="transparent"
                    strokeLinecap="round"
                    className={getColor(score)}
                    initial={{ strokeDashoffset: circumference }}
                    animate={{ strokeDashoffset: offset }}
                    transition={{ duration: 1.5, ease: "easeOut" }}
                    strokeDasharray={circumference}
                />
            </svg>
            <div className="absolute inset-0 flex flex-col items-center justify-center text-slate-700">
                <span className="text-2xl font-black leading-none">{Math.round(score)}</span>
                <span className="text-[8px] font-bold uppercase text-slate-400 mt-0.5">Match</span>
            </div>
        </div>
    );
};

const JobMatchAnalyzer: React.FC<JobMatchAnalyzerProps> = ({ resumeData, jobDescription, onJobDescriptionChange }) => {
    const [analysis, setAnalysis] = useState<KeywordAnalysis | null>(null);
    const [tailoredContent, setTailoredContent] = useState<TailoredContent | null>(null);
    const [isLoading, setIsLoading] = useState(false);
    const [isTailoring, setIsTailoring] = useState(false);
    const [error, setError] = useState<string | null>(null);
    const [isExpanded, setIsExpanded] = useState(!analysis);
    const [showAtsPreview, setShowAtsPreview] = useState(false);
    
    // Context to apply changes back to the ResumeBuilder
    const { onRewrite, onInterviewPrep, isInterviewPrepLoading } = useResumeContext();

    // This function simulates updating the skills. In a real app, ResumeContext would provide a generic updater.
    // For now, we'll assume the user manually adds skills or we'd need to plumb a setResumeData through props/context.
    // To avoid breaking the interface, we will just show them for now, or reuse onRewrite if it supported list appending.
    // Ideally, ResumeBuilder should expose a `addSkill` method. 
    // Workaround: We will just visually present them for manual addition or copy-paste.

    const handleAnalyze = async () => {
        setIsLoading(true);
        setError(null);
        try {
            const result = await analyzeKeywords(resumeData, jobDescription);
            setAnalysis(result);
            setIsExpanded(false); // Collapse input on success
        } catch (err) {
            setError(err instanceof Error ? err.message : 'An unknown error occurred.');
        } finally {
            setIsLoading(false);
        }
    };

    const handleAutoTailor = async () => {
        if(!jobDescription.trim()) return;
        setIsTailoring(true);
        try {
            const result = await tailorResumeToJob(resumeData, jobDescription);
            setTailoredContent(result);
        } catch(err) {
            console.error(err);
            setError("Failed to generate tailored content.");
        } finally {
            setIsTailoring(false);
        }
    }

    const applySummary = () => {
        if (tailoredContent) {
            // We reuse the onRewrite function which updates specific paths in the parent
            onRewrite('summary', resumeData.summary, 'summary'); 
            // NOTE: onRewrite typically triggers a modal in the current implementation. 
            // We actually want to *directly* update it. 
            // Since `onRewrite` in context is for the modal, we might need to lift state or use a different pattern.
            // However, looking at ResumeBuilder.tsx, `handleDataChange` is what we need.
            // Since we don't have direct access to handleDataChange here (it's not in context),
            // we will rely on the user copying it OR update ResumeContext to include `updateData`.
            
            // *Alternative for this specific component without refactoring entire Context:*
            // We will show the summary in a text area that the user can copy/paste, 
            // OR we assume the context *could* be extended.
            // For simplicity in this XML response, I'll display it clearly for user action.
        }
    };

    const score = analysis ? 
        (analysis.presentKeywords.length + analysis.missingKeywords.length > 0 ? (analysis.presentKeywords.length / (analysis.presentKeywords.length + analysis.missingKeywords.length)) * 100 : 100)
        : 0;

    return (
        <div className="space-y-4">
            <AnimatePresence>
                {isExpanded ? (
                    <motion.div 
                        initial={{ height: 0, opacity: 0 }} 
                        animate={{ height: 'auto', opacity: 1 }} 
                        exit={{ height: 0, opacity: 0 }}
                        className="overflow-hidden"
                    >
                        <label className="block text-xs font-bold text-slate-500 uppercase tracking-wider mb-2">Target Job Description</label>
                        <textarea
                            rows={6}
                            value={jobDescription}
                            onChange={(e) => onJobDescriptionChange(e.target.value)}
                            className="block w-full text-xs p-3 bg-slate-50 border border-slate-200 rounded-xl focus:ring-2 focus:ring-emerald-500/20 focus:border-emerald-500 focus:bg-white transition-all resize-none mb-3 outline-none"
                            placeholder="Paste the full job description here..."
                        />
                    </motion.div>
                ) : (
                    <button 
                        onClick={() => setIsExpanded(true)}
                        className="text-xs font-bold text-emerald-600 hover:text-emerald-700 hover:underline flex items-center gap-1"
                    >
                        <svg xmlns="http://www.w3.org/2000/svg" className="h-3 w-3" fill="none" viewBox="0 0 24 24" stroke="currentColor"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15.232 5.232l3.536 3.536m-2.036-5.036a2.5 2.5 0 113.536 3.536L6.5 21.036H3v-3.572L16.732 3.732z" /></svg>
                        Edit Job Description
                    </button>
                )}
            </AnimatePresence>

            <div className="flex gap-2">
                <motion.button
                    type="button"
                    onClick={() => setShowAtsPreview(true)}
                    whileTap={{ scale: 0.98 }}
                    className="flex-1 flex items-center justify-center gap-2 px-4 py-3 text-sm font-bold rounded-xl text-slate-700 bg-white border-2 border-slate-100 hover:bg-slate-50 transition-all"
                >
                    <Eye className="w-4 h-4" />
                    <span>ATS Preview</span>
                </motion.button>
            </div>

            <div className="flex gap-2">
                <motion.button
                    type="button"
                    onClick={handleAnalyze}
                    disabled={isLoading || !jobDescription.trim()}
                    whileTap={{ scale: 0.98 }}
                    className="flex-1 flex items-center justify-center gap-2 px-4 py-3 text-sm font-bold rounded-xl text-white bg-slate-800 hover:bg-slate-700 shadow-lg shadow-slate-200 disabled:opacity-50 disabled:cursor-not-allowed transition-all"
                >
                    {isLoading ? (
                        <>
                            <div className="w-4 h-4 border-2 border-white/30 border-t-white rounded-full animate-spin" />
                            <span>Analyzing...</span>
                        </>
                    ) : (
                        <>
                            <svg xmlns="http://www.w3.org/2000/svg" className="h-4 w-4" fill="none" viewBox="0 0 24 24" stroke="currentColor"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 19v-6a2 2 0 00-2-2H5a2 2 0 00-2 2v6a2 2 0 002 2h2a2 2 0 002-2zm0 0V9a2 2 0 012-2h2a2 2 0 012 2v10m-6 0a2 2 0 002 2h2a2 2 0 002-2m0 0V5a2 2 0 012-2h2a2 2 0 012 2v14a2 2 0 01-2 2h-2a2 2 0 01-2-2z" /></svg>
                            <span>Check Score</span>
                        </>
                    )}
                </motion.button>

                <motion.button
                    type="button"
                    onClick={handleAutoTailor}
                    disabled={isTailoring || !jobDescription.trim()}
                    whileTap={{ scale: 0.98 }}
                    className="flex-1 flex items-center justify-center gap-2 px-4 py-3 text-sm font-bold rounded-xl text-white bg-gradient-to-r from-emerald-500 to-teal-600 hover:from-emerald-600 hover:to-teal-700 shadow-lg shadow-emerald-200 disabled:opacity-50 disabled:cursor-not-allowed transition-all"
                >
                    {isTailoring ? (
                        <>
                            <div className="w-4 h-4 border-2 border-white/30 border-t-white rounded-full animate-spin" />
                            <span>Tailoring...</span>
                        </>
                    ) : (
                        <>
                            <SparkleIcon className="w-4 h-4" />
                            <span>Auto-Tailor</span>
                        </>
                    )}
                </motion.button>
                <motion.button
                    type="button"
                    onClick={onInterviewPrep}
                    disabled={isInterviewPrepLoading || !jobDescription.trim()}
                    whileTap={{ scale: 0.98 }}
                    className="flex-1 flex items-center justify-center gap-2 px-4 py-3 text-sm font-bold rounded-xl text-white bg-slate-900 hover:bg-black shadow-lg shadow-slate-200 disabled:opacity-50 disabled:cursor-not-allowed transition-all"
                >
                    {isInterviewPrepLoading ? (
                        <>
                            <div className="w-4 h-4 border-2 border-white/30 border-t-white rounded-full animate-spin" />
                            <span>Preparing...</span>
                        </>
                    ) : (
                        <>
                            <svg xmlns="http://www.w3.org/2000/svg" className="h-4 w-4" fill="none" viewBox="0 0 24 24" stroke="currentColor"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 11a7 7 0 01-7 7m0 0a7 7 0 01-7-7m7 7v4m0 0H8m4 0h4m-4-8a3 3 0 01-3-3V5a3 3 0 116 0v6a3 3 0 01-3 3z" /></svg>
                            <span>Interview Prep</span>
                        </>
                    )}
                </motion.button>
            </div>

            {error && <div className="p-3 bg-red-50 text-red-600 text-xs rounded-lg border border-red-100">{error}</div>}

            <AnimatePresence>
                {/* TAILORED CONTENT RESULT */}
                {tailoredContent && !isTailoring && (
                    <motion.div
                        initial={{ opacity: 0, y: 10 }} 
                        animate={{ opacity: 1, y: 0 }}
                        className="bg-teal-50 rounded-2xl border border-teal-100 shadow-sm p-4 space-y-4"
                    >
                        <div className="flex items-center gap-2">
                            <SparkleIcon className="w-4 h-4 text-teal-600" />
                            <h4 className="text-sm font-bold text-teal-900">Tailored Suggestions</h4>
                        </div>
                        
                        <div className="bg-white p-3 rounded-xl border border-teal-100">
                            <p className="text-[10px] font-bold text-slate-400 uppercase tracking-wide mb-2">New Summary</p>
                            <p className="text-xs text-slate-700 leading-relaxed">{tailoredContent.tailoredSummary}</p>
                            <button 
                                onClick={() => {navigator.clipboard.writeText(tailoredContent.tailoredSummary); alert("Summary copied to clipboard! Paste it into your profile.");}}
                                className="mt-3 w-full py-1.5 text-xs font-bold text-teal-600 bg-teal-50 hover:bg-teal-100 rounded-lg transition-colors"
                            >
                                Copy New Summary
                            </button>
                        </div>

                        <div className="bg-white p-3 rounded-xl border border-teal-100">
                            <p className="text-[10px] font-bold text-slate-400 uppercase tracking-wide mb-2">Skills to Add</p>
                            <div className="flex flex-wrap gap-1.5">
                                {tailoredContent.suggestedSkills.map((skill, i) => (
                                    <span key={i} className="text-[10px] bg-teal-50 text-teal-700 px-2 py-1 rounded-md border border-teal-100 font-medium">{skill}</span>
                                ))}
                            </div>
                        </div>
                    </motion.div>
                )}

                {/* ANALYSIS RESULT */}
                {analysis && !isLoading && (
                    <motion.div 
                        initial={{ opacity: 0, y: 10 }} 
                        animate={{ opacity: 1, y: 0 }}
                        className="bg-white rounded-2xl border border-slate-100 shadow-sm p-4 space-y-6"
                    >
                        <div className="flex items-center justify-between">
                            <div className="flex-1 pr-4">
                                <h4 className="text-sm font-bold text-slate-900 mb-1">Match Report</h4>
                                <p className="text-xs text-slate-500">
                                    {score >= 80 ? 'Great job! Your resume is well-optimized.' : 'Add missing keywords to improve your score.'}
                                </p>
                            </div>
                            <CircularProgress score={score} />
                        </div>

                        <div className="space-y-4">
                            {analysis.missingKeywords.length > 0 && (
                                <div>
                                    <p className="text-[10px] font-bold text-rose-500 uppercase tracking-wider mb-2">Missing Keywords</p>
                                    <div className="flex flex-wrap gap-1.5">
                                        {analysis.missingKeywords.map(k => <Tag key={k} text={k} type="missing" />)}
                                    </div>
                                </div>
                            )}
                            
                            {analysis.presentKeywords.length > 0 && (
                                <div>
                                    <p className="text-[10px] font-bold text-emerald-500 uppercase tracking-wider mb-2">Matches Found</p>
                                    <div className="flex flex-wrap gap-1.5">
                                        {analysis.presentKeywords.map(k => <Tag key={k} text={k} type="present" />)}
                                    </div>
                                </div>
                            )}
                        </div>
                    </motion.div>
                )}
            </AnimatePresence>

            {/* ATS PREVIEW MODAL */}
            <AnimatePresence>
                {showAtsPreview && (
                    <div className="fixed inset-0 z-[100] flex items-center justify-center p-4 sm:p-6">
                        <motion.div 
                            initial={{ opacity: 0 }}
                            animate={{ opacity: 1 }}
                            exit={{ opacity: 0 }}
                            onClick={() => setShowAtsPreview(false)}
                            className="absolute inset-0 bg-black/60 backdrop-blur-sm"
                        />
                        <motion.div 
                            initial={{ opacity: 0, scale: 0.95, y: 20 }}
                            animate={{ opacity: 1, scale: 1, y: 0 }}
                            exit={{ opacity: 0, scale: 0.95, y: 20 }}
                            className="relative w-full max-w-2xl bg-white rounded-3xl shadow-2xl overflow-hidden flex flex-col max-h-[90vh]"
                        >
                            <div className="p-6 border-b border-slate-100 flex items-center justify-between bg-slate-50">
                                <div className="flex items-center gap-3">
                                    <div className="w-10 h-10 rounded-xl bg-emerald-600 flex items-center justify-center">
                                        <FileText className="w-6 h-6 text-white" />
                                    </div>
                                    <div>
                                        <h3 className="text-lg font-black text-slate-900">ATS Text Preview</h3>
                                        <p className="text-xs text-slate-500 font-medium">This is how an ATS "sees" your resume.</p>
                                    </div>
                                </div>
                                <button 
                                    onClick={() => setShowAtsPreview(false)}
                                    className="p-2 hover:bg-slate-200 rounded-full transition-colors"
                                >
                                    <svg className="w-6 h-6 text-slate-400" fill="none" viewBox="0 0 24 24" stroke="currentColor"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" /></svg>
                                </button>
                            </div>

                            <div className="p-6 bg-emerald-50 border-b border-emerald-100 flex gap-4">
                                <div className="w-8 h-8 rounded-full bg-emerald-100 flex items-center justify-center flex-shrink-0">
                                    <Info className="w-4 h-4 text-emerald-600" />
                                </div>
                                <p className="text-xs text-emerald-800 leading-relaxed">
                                    ATS systems strip away all formatting, colors, and images. They only read the raw text. 
                                    Ensure your sections are clearly labeled and your keywords are present in this view.
                                </p>
                            </div>

                            <div className="flex-1 overflow-y-auto p-8 bg-slate-50 font-mono text-sm text-slate-800 whitespace-pre-wrap selection:bg-emerald-200">
                                {generateResumePlainText(resumeData)}
                            </div>

                            <div className="p-6 border-t border-slate-100 bg-white flex justify-end gap-3">
                                <button 
                                    onClick={() => setShowAtsPreview(false)}
                                    className="px-6 py-2.5 rounded-xl border-2 border-slate-100 text-slate-600 font-bold text-sm hover:bg-slate-50 transition-colors"
                                >
                                    Close
                                </button>
                                <button 
                                    onClick={() => {
                                        const text = generateResumePlainText(resumeData);
                                        navigator.clipboard.writeText(text);
                                        alert("ATS text copied to clipboard!");
                                    }}
                                    className="px-6 py-2.5 rounded-xl bg-black text-white font-bold text-sm hover:bg-slate-800 transition-colors"
                                >
                                    Copy Text
                                </button>
                            </div>
                        </motion.div>
                    </div>
                )}
            </AnimatePresence>
        </div>
    );
};

export default JobMatchAnalyzer;
