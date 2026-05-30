
import React, { useState } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { FileText, Sparkles, Copy, Check, RefreshCw, Loader2, Target, HelpCircle, AlertTriangle, Building, Info } from 'lucide-react';
import { generateInterviewCheatSheet } from '../../services/geminiService';
import { ResumeData } from '../../types';
import AIProcessingState from './AIProcessingState';

interface InterviewCheatSheetPanelProps {
    resumeData: ResumeData;
    jobDescription?: string;
}

const InterviewCheatSheetPanel: React.FC<InterviewCheatSheetPanelProps> = ({ resumeData, jobDescription }) => {
    const [isLoading, setIsLoading] = useState(false);
    const [data, setData] = useState<{ mission: string; talkingPoints: string[]; questionsToAsk: string[]; redFlags: string[] } | null>(null);
    const [companyName, setCompanyName] = useState('');
    const [copiedField, setCopiedField] = useState<string | null>(null);

    const handleGenerate = async () => {
        if (!companyName || !jobDescription) return;
        setIsLoading(true);
        try {
            const result = await generateInterviewCheatSheet(resumeData, jobDescription, companyName);
            setData(result);
        } catch (error) {
            console.error(error);
        } finally {
            setIsLoading(false);
        }
    };

    const copyToClipboard = (text: string, field: string) => {
        navigator.clipboard.writeText(text);
        setCopiedField(field);
        setTimeout(() => setCopiedField(null), 2000);
    };

    return (
        <div className="space-y-6 sm:space-y-8">
            <div className="flex flex-col gap-2 px-2">
                <h2 className="text-2xl sm:text-3xl font-black text-slate-900 tracking-tight">Interview Cheat Sheet</h2>
                <p className="text-[10px] sm:text-sm text-slate-500 font-medium italic">Your secret weapon for acing the interview. Strategic insights tailored to you and the role.</p>
            </div>

            <div className="bg-white rounded-[2rem] sm:rounded-[2.5rem] border-2 border-slate-100 p-4 sm:p-8 shadow-sm">
                <div className="flex flex-col md:flex-row gap-4 mb-8">
                    <div className="flex-1 relative">
                        <Building className="absolute left-4 top-1/2 -translate-y-1/2 w-4 h-4 text-slate-400" />
                        <input 
                            type="text"
                            value={companyName}
                            onChange={(e) => setCompanyName(e.target.value)}
                            placeholder="Company Name (e.g. Google, Stripe)"
                            className="w-full pl-12 pr-4 py-4 bg-slate-50 border-2 border-transparent focus:border-emerald-500 focus:bg-white rounded-2xl text-sm font-bold transition-all outline-none"
                        />
                    </div>
                    <button 
                        onClick={handleGenerate}
                        disabled={isLoading || !companyName || !jobDescription}
                        className="w-full md:w-auto px-8 py-4 bg-slate-900 text-white rounded-2xl font-black uppercase tracking-widest text-xs hover:bg-black transition-all disabled:opacity-50 flex items-center justify-center gap-3 shadow-xl shadow-slate-200"
                    >
                        {isLoading ? <Loader2 className="w-4 h-4 animate-spin" /> : <Sparkles className="w-4 h-4" />}
                        Generate Cheat Sheet
                    </button>
                </div>

                {!jobDescription && (
                    <div className="p-4 bg-amber-50 border border-amber-100 rounded-xl flex items-center gap-3 text-amber-700 text-xs font-bold">
                        <Info className="w-4 h-4" />
                        Please provide a Job Description in the Match Analysis tab first.
                    </div>
                )}

                <AnimatePresence mode="wait">
                    {isLoading ? (
                        <AIProcessingState 
                            key="loading"
                            title="Preparing Cheat Sheet"
                            messages={[
                                "Researching company culture...",
                                "Mapping your experience to role needs...",
                                "Formulating strategic questions...",
                                "Identifying potential red flags...",
                                "Finalizing your game plan..."
                            ]}
                            icon={FileText}
                            color="emerald"
                        />
                    ) : data ? (
                        <motion.div 
                            key="results"
                            initial={{ opacity: 0, y: 20 }}
                            animate={{ opacity: 1, y: 0 }}
                            className="mt-12 space-y-8"
                        >
                            {/* Mission & Values */}
                            <div className="p-8 bg-slate-900 rounded-[2rem] text-white relative overflow-hidden group">
                                <div className="absolute top-0 right-0 p-8 opacity-10 group-hover:opacity-20 transition-opacity">
                                    <Building className="w-20 h-20" />
                                </div>
                                <h3 className="text-[10px] font-black uppercase tracking-[0.3em] text-emerald-400 mb-4">Company Mission & Values</h3>
                                <p className="text-lg font-medium leading-relaxed italic text-slate-200 relative z-10">
                                    "{data.mission}"
                                </p>
                            </div>

                            <div className="grid grid-cols-1 lg:grid-cols-2 gap-8">
                                {/* Talking Points */}
                                <div className="space-y-6">
                                    <div className="flex items-center gap-3">
                                        <Target className="w-6 h-6 text-emerald-600" />
                                        <h3 className="text-lg font-black text-slate-900 uppercase tracking-widest">Key Talking Points</h3>
                                    </div>
                                    <div className="space-y-4">
                                        {data.talkingPoints.map((point, i) => (
                                            <div key={i} className="p-6 bg-emerald-50 border-2 border-emerald-100 rounded-2xl text-sm font-bold text-emerald-900 leading-relaxed">
                                                {point}
                                            </div>
                                        ))}
                                    </div>
                                </div>

                                {/* Questions to Ask */}
                                <div className="space-y-6">
                                    <div className="flex items-center gap-3">
                                        <HelpCircle className="w-6 h-6 text-blue-600" />
                                        <h3 className="text-lg font-black text-slate-900 uppercase tracking-widest">Questions to Ask</h3>
                                    </div>
                                    <div className="space-y-4">
                                        {data.questionsToAsk.map((q, i) => (
                                            <div key={i} className="p-6 bg-blue-50 border-2 border-blue-100 rounded-2xl text-sm font-bold text-blue-900 leading-relaxed flex justify-between items-start gap-4">
                                                <span>{q}</span>
                                                <button 
                                                    onClick={() => copyToClipboard(q, `q-${i}`)}
                                                    className="p-1.5 hover:bg-white rounded-lg transition-all text-blue-400 hover:text-blue-600 shrink-0"
                                                >
                                                    {copiedField === `q-${i}` ? <Check className="w-3.5 h-3.5" /> : <Copy className="w-3.5 h-3.5" />}
                                                </button>
                                            </div>
                                        ))}
                                    </div>
                                </div>
                            </div>

                            {/* Red Flags */}
                            <div className="p-8 bg-rose-50 border-2 border-rose-100 rounded-[2rem]">
                                <div className="flex items-center gap-3 mb-6">
                                    <AlertTriangle className="w-6 h-6 text-rose-600" />
                                    <h3 className="text-lg font-black text-slate-900 uppercase tracking-widest">Red Flags to Watch</h3>
                                </div>
                                <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                                    {data.redFlags.map((flag, i) => (
                                        <div key={i} className="p-4 bg-white border border-rose-200 rounded-xl text-xs font-bold text-rose-700 leading-relaxed">
                                            {flag}
                                        </div>
                                    ))}
                                </div>
                            </div>
                        </motion.div>
                    ) : null}
                </AnimatePresence>
            </div>
        </div>
    );
};

export default InterviewCheatSheetPanel;
