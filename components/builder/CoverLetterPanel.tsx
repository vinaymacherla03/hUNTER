
import React, { useState } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { FileText, Sparkles, Loader2, Copy, Check, Download, RefreshCw, Send } from 'lucide-react';
import { ResumeData } from '../../types';
import { generateCoverLetter } from '../../services/geminiService';
import AIProcessingState from './AIProcessingState';

interface CoverLetterPanelProps {
    resumeData: ResumeData;
    jobDescription: string;
}

const CoverLetterPanel: React.FC<CoverLetterPanelProps> = ({ resumeData, jobDescription }) => {
    const [loading, setLoading] = useState(false);
    const [content, setContent] = useState<string | null>(null);
    const [hasCopied, setHasCopied] = useState(false);

    const handleGenerate = async () => {
        if (!jobDescription.trim()) return;
        setLoading(true);
        try {
            const letter = await generateCoverLetter(resumeData, jobDescription);
            setContent(letter);
        } catch (error) {
            console.error(error);
        } finally {
            setLoading(false);
        }
    };

    const handleCopy = () => {
        if (!content) return;
        navigator.clipboard.writeText(content);
        setHasCopied(true);
        setTimeout(() => setHasCopied(false), 2000);
    };

    const handleDownload = () => {
        if (!content) return;
        const blob = new Blob([content], { type: 'text/plain' });
        const url = URL.createObjectURL(blob);
        const link = document.createElement('a');
        link.href = url;
        link.download = `Cover_Letter_${resumeData.fullName.replace(/\s+/g, '_')}.txt`;
        document.body.appendChild(link);
        link.click();
        document.body.removeChild(link);
        URL.revokeObjectURL(url);
    };

    return (
        <div className="space-y-6 sm:space-y-8">
            <div className="bg-white p-4 sm:p-8 rounded-[2rem] sm:rounded-[2.5rem] border border-slate-100 shadow-sm">
                <div className="flex flex-col md:flex-row md:items-center justify-between gap-6 mb-8">
                    <div>
                        <h3 className="text-xl sm:text-2xl font-black text-slate-900 tracking-tight mb-2">AI Cover Letter Generator</h3>
                        <p className="text-sm sm:text-base text-slate-500 font-medium">Create a tailored, high-impact cover letter based on your resume and target job.</p>
                    </div>
                    <button
                        onClick={handleGenerate}
                        disabled={loading || !jobDescription.trim()}
                        className="px-8 py-4 bg-slate-900 text-white rounded-2xl font-black uppercase tracking-widest text-xs hover:bg-emerald-600 transition-all disabled:opacity-50 flex items-center gap-3 shrink-0"
                    >
                        {loading ? <Loader2 className="w-4 h-4 animate-spin" /> : <Sparkles className="w-4 h-4" />}
                        {loading ? 'Generating...' : content ? 'Regenerate' : 'Generate Letter'}
                    </button>
                </div>

                {loading ? (
                    <motion.div
                        initial={{ opacity: 0, y: 20 }}
                        animate={{ opacity: 1, y: 0 }}
                        exit={{ opacity: 0, y: 20 }}
                        className="py-12"
                    >
                        <AIProcessingState
                            title="Drafting Cover Letter"
                            messages={[
                                "Analyzing your resume outline...",
                                "Evaluating job description requirements...",
                                "Writing professional opening...",
                                "Highlighting key experiences...",
                                "Finalizing tone and structure..."
                            ]}
                            color="blue"
                            icon={Send}
                        />
                    </motion.div>
                ) : !jobDescription.trim() ? (
                    <div className="p-12 border-2 border-dashed border-slate-100 rounded-[2rem] flex flex-col items-center justify-center text-center">
                        <div className="w-16 h-16 bg-slate-50 rounded-2xl flex items-center justify-center mb-4">
                            <FileText className="w-8 h-8 text-slate-300" />
                        </div>
                        <p className="text-slate-400 font-bold max-w-xs">Please provide a job description in the "Match Analysis" tab first.</p>
                    </div>
                ) : content ? (
                    <motion.div
                        initial={{ opacity: 0, y: 20 }}
                        animate={{ opacity: 1, y: 0 }}
                        className="space-y-6"
                    >
                        <div className="relative group">
                            <textarea
                                value={content}
                                onChange={(e) => setContent(e.target.value)}
                                className="w-full h-[400px] sm:h-[500px] p-4 sm:p-8 bg-slate-50 border border-slate-200 rounded-[1.5rem] sm:rounded-[2rem] text-slate-700 text-xs sm:text-sm leading-relaxed font-medium focus:ring-4 focus:ring-emerald-500/10 focus:border-emerald-500 outline-none resize-none transition-all shadow-inner"
                            />
                            <div className="absolute top-4 right-4 flex gap-2 opacity-0 group-hover:opacity-100 transition-opacity">
                                <button
                                    onClick={handleCopy}
                                    className="p-2 bg-white border border-slate-200 rounded-lg hover:bg-slate-50 transition-all shadow-sm"
                                    title="Copy to clipboard"
                                >
                                    {hasCopied ? <Check className="w-4 h-4 text-emerald-500" /> : <Copy className="w-4 h-4 text-slate-500" />}
                                </button>
                                <button
                                    onClick={handleDownload}
                                    className="p-2 bg-white border border-slate-200 rounded-lg hover:bg-slate-50 transition-all shadow-sm"
                                    title="Download as .txt"
                                >
                                    <Download className="w-4 h-4 text-slate-500" />
                                </button>
                            </div>
                        </div>

                        <div className="flex flex-wrap items-center justify-between gap-4 p-6 bg-emerald-50 rounded-2xl border border-emerald-100">
                            <div className="flex items-center gap-3">
                                <div className="w-8 h-8 bg-emerald-100 rounded-lg flex items-center justify-center">
                                    <Sparkles className="w-4 h-4 text-emerald-600" />
                                </div>
                                <p className="text-xs font-bold text-emerald-800">Pro Tip: Personalize the bracketed sections for maximum impact.</p>
                            </div>
                            <div className="flex gap-3">
                                <button
                                    onClick={handleCopy}
                                    className="px-6 py-2.5 bg-white text-slate-900 border border-slate-200 rounded-xl text-[10px] font-black uppercase tracking-widest hover:bg-slate-50 transition-all flex items-center gap-2"
                                >
                                    {hasCopied ? <Check className="w-3.5 h-3.5 text-emerald-500" /> : <Copy className="w-3.5 h-3.5" />}
                                    {hasCopied ? 'Copied' : 'Copy Text'}
                                </button>
                                <button
                                    onClick={handleDownload}
                                    className="px-6 py-2.5 bg-emerald-600 text-white rounded-xl text-[10px] font-black uppercase tracking-widest hover:bg-emerald-700 transition-all flex items-center gap-2 shadow-lg shadow-emerald-600/20"
                                >
                                    <Download className="w-3.5 h-3.5" />
                                    Download .txt
                                </button>
                            </div>
                        </div>
                    </motion.div>
                ) : null}
            </div>
        </div>
    );
};

export default CoverLetterPanel;
