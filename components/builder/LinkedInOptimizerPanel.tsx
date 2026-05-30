
import React, { useState } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { Linkedin, Sparkles, Copy, Check, RefreshCw, Loader2, User, FileText, Briefcase, Info } from 'lucide-react';
import { optimizeLinkedInProfile } from '../../services/geminiService';
import { ResumeData } from '../../types';
import AIProcessingState from './AIProcessingState';

interface LinkedInOptimizerPanelProps {
    resumeData: ResumeData;
}

const LinkedInOptimizerPanel: React.FC<LinkedInOptimizerPanelProps> = ({ resumeData }) => {
    const [isLoading, setIsLoading] = useState(false);
    const [data, setData] = useState<{ headline: string; about: string; experience: { company: string; bullets: string[] }[] } | null>(null);
    const [copiedField, setCopiedField] = useState<string | null>(null);

    const handleOptimize = async () => {
        setIsLoading(true);
        try {
            const result = await optimizeLinkedInProfile(resumeData);
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
                <h2 className="text-2xl sm:text-3xl font-black text-slate-900 tracking-tight">LinkedIn Optimizer</h2>
                <p className="text-[10px] sm:text-sm text-slate-500 font-medium italic">Transform your profile into a recruiter magnet with AI-powered optimization.</p>
            </div>

            {!data && !isLoading && (
                <div className="bg-white rounded-[2rem] sm:rounded-[2.5rem] border-2 border-slate-100 p-6 sm:p-12 text-center shadow-sm">
                    <div className="w-16 h-16 sm:w-20 h-20 bg-blue-50 rounded-2xl sm:rounded-3xl flex items-center justify-center mx-auto mb-6">
                        <Linkedin className="w-8 h-8 sm:w-10 h-10 text-blue-600" />
                    </div>
                    <h3 className="text-lg sm:text-xl font-black text-slate-900 uppercase tracking-tight mb-4">Ready to stand out?</h3>
                    <p className="text-sm sm:text-base text-slate-500 max-w-md mx-auto mb-8 font-medium leading-relaxed">
                        We'll analyze your resume to generate a high-impact headline, a compelling "About" section, and optimized experience bullets.
                    </p>
                    <button 
                        onClick={handleOptimize}
                        className="w-full sm:w-auto px-8 py-4 bg-blue-600 text-white rounded-2xl font-black uppercase tracking-widest text-xs hover:bg-blue-700 transition-all flex items-center justify-center gap-3 mx-auto shadow-xl shadow-blue-200"
                    >
                        <Sparkles className="w-4 h-4" />
                        Optimize My Profile
                    </button>
                </div>
            )}

            <AnimatePresence mode="wait">
                {isLoading ? (
                    <AIProcessingState 
                        key="loading"
                        title="Optimizing Profile"
                        messages={[
                            "Analyzing career narrative...",
                            "Extracting high-impact keywords...",
                            "Crafting compelling headline...",
                            "Drafting storyteller 'About' section...",
                            "Polishing experience bullets..."
                        ]}
                        icon={Linkedin}
                        color="blue"
                    />
                ) : data ? (
                    <motion.div 
                        key="results"
                        initial={{ opacity: 0, y: 20 }}
                        animate={{ opacity: 1, y: 0 }}
                        className="space-y-8"
                    >
                        {/* Headline Section */}
                        <div className="bg-white rounded-[2.5rem] border-2 border-slate-100 p-8 shadow-sm group">
                            <div className="flex items-center justify-between mb-6">
                                <div className="flex items-center gap-3">
                                    <div className="p-2 bg-blue-50 text-blue-600 rounded-xl">
                                        <User className="w-5 h-5" />
                                    </div>
                                    <h3 className="text-sm font-black text-slate-900 uppercase tracking-widest">Optimized Headline</h3>
                                </div>
                                <button 
                                    onClick={() => copyToClipboard(data.headline, 'headline')}
                                    className="p-2 hover:bg-slate-50 rounded-xl transition-all text-slate-400 hover:text-blue-600"
                                >
                                    {copiedField === 'headline' ? <Check className="w-4 h-4" /> : <Copy className="w-4 h-4" />}
                                </button>
                            </div>
                            <div className="p-6 bg-slate-50 rounded-2xl border-2 border-transparent group-hover:border-blue-100 transition-all">
                                <p className="text-lg font-bold text-slate-900 leading-relaxed">
                                    {data.headline}
                                </p>
                            </div>
                        </div>

                        {/* About Section */}
                        <div className="bg-white rounded-[2.5rem] border-2 border-slate-100 p-8 shadow-sm group">
                            <div className="flex items-center justify-between mb-6">
                                <div className="flex items-center gap-3">
                                    <div className="p-2 bg-blue-50 text-blue-600 rounded-xl">
                                        <FileText className="w-5 h-5" />
                                    </div>
                                    <h3 className="text-sm font-black text-slate-900 uppercase tracking-widest">Compelling "About" Section</h3>
                                </div>
                                <button 
                                    onClick={() => copyToClipboard(data.about, 'about')}
                                    className="p-2 hover:bg-slate-50 rounded-xl transition-all text-slate-400 hover:text-blue-600"
                                >
                                    {copiedField === 'about' ? <Check className="w-4 h-4" /> : <Copy className="w-4 h-4" />}
                                </button>
                            </div>
                            <div className="p-6 bg-slate-50 rounded-2xl border-2 border-transparent group-hover:border-blue-100 transition-all">
                                <p className="text-sm text-slate-600 leading-loose whitespace-pre-wrap font-medium">
                                    {data.about}
                                </p>
                            </div>
                        </div>

                        {/* Experience Section */}
                        <div className="bg-white rounded-[2.5rem] border-2 border-slate-100 p-8 shadow-sm">
                            <div className="flex items-center gap-3 mb-8">
                                <div className="p-2 bg-blue-50 text-blue-600 rounded-xl">
                                    <Briefcase className="w-5 h-5" />
                                </div>
                                <h3 className="text-sm font-black text-slate-900 uppercase tracking-widest">Optimized Experience Bullets</h3>
                            </div>
                            <div className="space-y-6">
                                {data.experience.map((exp, i) => (
                                    <div key={i} className="p-6 bg-slate-50 rounded-2xl border-2 border-transparent hover:border-blue-100 transition-all">
                                        <h4 className="font-black text-slate-900 mb-4 flex items-center justify-between">
                                            {exp.company}
                                            <button 
                                                onClick={() => copyToClipboard(exp.bullets.join('\n'), `exp-${i}`)}
                                                className="p-2 hover:bg-white rounded-lg transition-all text-slate-400 hover:text-blue-600"
                                            >
                                                {copiedField === `exp-${i}` ? <Check className="w-3 h-3" /> : <Copy className="w-3 h-3" />}
                                            </button>
                                        </h4>
                                        <ul className="space-y-3">
                                            {exp.bullets.map((bullet, j) => (
                                                <li key={j} className="flex gap-3 text-xs text-slate-600 font-medium leading-relaxed">
                                                    <div className="w-1.5 h-1.5 rounded-full bg-blue-400 shrink-0 mt-1.5" />
                                                    {bullet}
                                                </li>
                                            ))}
                                        </ul>
                                    </div>
                                ))}
                            </div>
                        </div>

                        <button 
                            onClick={handleOptimize}
                            className="w-full py-4 bg-slate-900 text-white rounded-2xl font-black uppercase tracking-widest text-xs hover:bg-black transition-all flex items-center justify-center gap-3"
                        >
                            <RefreshCw className="w-4 h-4" />
                            Regenerate Optimization
                        </button>
                    </motion.div>
                ) : null}
            </AnimatePresence>

            {/* Pro Tip */}
            <div className="flex items-start gap-6 p-8 bg-white border-2 border-slate-100 rounded-[2rem]">
                <div className="w-12 h-12 rounded-2xl bg-blue-50 flex items-center justify-center shrink-0">
                    <Info className="w-6 h-6 text-blue-600" />
                </div>
                <div>
                    <h4 className="text-sm font-black text-slate-900 uppercase tracking-widest mb-2">LinkedIn Pro Tip</h4>
                    <p className="text-sm text-slate-600 leading-relaxed font-medium">
                        Your headline is the most important part of your profile. Recruiter searches prioritize keywords in the headline. Use the optimized version above to increase your visibility by up to 40%.
                    </p>
                </div>
            </div>
        </div>
    );
};

export default LinkedInOptimizerPanel;
