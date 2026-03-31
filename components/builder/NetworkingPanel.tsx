
import React, { useState, useEffect } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { Users, Send, MessageSquare, Copy, Check, RefreshCw, Lightbulb, ChevronRight } from 'lucide-react';
import { getNetworkingStrategy } from '../../services/geminiService';
import { ResumeData } from '../../types';

interface NetworkingPanelProps {
    resumeData: ResumeData;
}

const NetworkingPanel: React.FC<NetworkingPanelProps> = ({ resumeData }) => {
    const [isLoading, setIsLoading] = useState(false);
    const [strategy, setStrategy] = useState<{ templates: { type: string; subject: string; body: string }[]; advice: string[] } | null>(null);
    const [copiedIndex, setCopiedIndex] = useState<number | null>(null);
    const [error, setError] = useState<string | null>(null);

    const fetchStrategy = async () => {
        setIsLoading(true);
        setError(null);
        try {
            const data = await getNetworkingStrategy(resumeData, resumeData.title || "Target Role");
            setStrategy(data);
        } catch (err) {
            setError("Failed to generate networking strategy. Please try again.");
            console.error(err);
        } finally {
            setIsLoading(false);
        }
    };

    useEffect(() => {
        if (!strategy && !isLoading) {
            fetchStrategy();
        }
    }, [resumeData]);

    const copyToClipboard = (text: string, index: number) => {
        navigator.clipboard.writeText(text);
        setCopiedIndex(index);
        setTimeout(() => setCopiedIndex(null), 2000);
    };

    return (
        <div className="space-y-8">
            <div className="flex items-center justify-between">
                <div>
                    <h2 className="text-2xl sm:text-3xl font-black text-slate-900 tracking-tight mb-2">Networking Strategy</h2>
                    <p className="text-xs sm:text-sm text-slate-500 font-medium italic">Personalized templates and advice to build your professional network.</p>
                </div>
                <button 
                    onClick={fetchStrategy}
                    disabled={isLoading}
                    className="p-3 bg-white border-2 border-slate-100 rounded-2xl hover:border-black transition-all disabled:opacity-50"
                >
                    <RefreshCw className={`w-5 h-5 ${isLoading ? 'animate-spin' : ''}`} />
                </button>
            </div>

            <AnimatePresence mode="wait">
                {isLoading ? (
                    <motion.div 
                        key="loading"
                        initial={{ opacity: 0 }}
                        animate={{ opacity: 1 }}
                        exit={{ opacity: 0 }}
                        className="py-20 flex flex-col items-center justify-center text-center"
                    >
                        <div className="relative w-24 h-24 mb-8">
                            <div className="absolute inset-0 border-4 border-emerald-100 rounded-full"></div>
                            <div className="absolute inset-0 border-4 border-emerald-600 rounded-full border-t-transparent animate-spin"></div>
                            <Users className="absolute inset-0 m-auto w-10 h-10 text-emerald-600" />
                        </div>
                        <h3 className="text-xl font-black text-slate-900 uppercase tracking-widest mb-2">Crafting Your Outreach</h3>
                        <p className="text-sm text-slate-500 max-w-xs mx-auto font-medium">Our AI is analyzing your profile to create personalized networking templates...</p>
                    </motion.div>
                ) : strategy ? (
                    <motion.div 
                        key="results"
                        initial={{ opacity: 0, y: 20 }}
                        animate={{ opacity: 1, y: 0 }}
                        className="space-y-8"
                    >
                        {/* Templates */}
                        <div className="grid grid-cols-1 lg:grid-cols-2 gap-8">
                            <div className="space-y-6">
                                <div className="flex items-center gap-3">
                                    <MessageSquare className="w-6 h-6 text-emerald-600" />
                                    <h3 className="text-lg font-black text-slate-900 uppercase tracking-widest">Outreach Templates</h3>
                                </div>
                                <div className="space-y-4">
                                    {strategy.templates.map((template, i) => (
                                        <div key={i} className="p-6 bg-white border-2 border-slate-100 rounded-[2rem] hover:border-emerald-500 transition-all group relative">
                                            <div className="flex items-center justify-between mb-4">
                                                <span className="px-3 py-1 bg-emerald-50 text-emerald-600 text-[10px] font-black uppercase tracking-widest rounded-full">
                                                    {template.type}
                                                </span>
                                                <button 
                                                    onClick={() => copyToClipboard(`${template.subject}\n\n${template.body}`, i)}
                                                    className="p-2 text-slate-400 hover:text-emerald-600 transition-colors"
                                                >
                                                    {copiedIndex === i ? <Check className="w-4 h-4 text-emerald-500" /> : <Copy className="w-4 h-4" />}
                                                </button>
                                            </div>
                                            <h4 className="text-sm font-bold text-slate-900 mb-2">Subject: {template.subject}</h4>
                                            <p className="text-sm text-slate-600 font-medium leading-relaxed whitespace-pre-wrap italic">
                                                {template.body}
                                            </p>
                                        </div>
                                    ))}
                                </div>
                            </div>

                            {/* Advice */}
                            <div className="space-y-6">
                                <div className="flex items-center gap-3">
                                    <Lightbulb className="w-6 h-6 text-yellow-500" />
                                    <h3 className="text-lg font-black text-slate-900 uppercase tracking-widest">Networking Advice</h3>
                                </div>
                                <div className="p-8 bg-slate-900 rounded-[2.5rem] text-white space-y-6 relative overflow-hidden">
                                    <div className="absolute top-0 right-0 w-32 h-32 bg-emerald-500/20 rounded-full -translate-y-1/2 translate-x-1/2 blur-2xl"></div>
                                    <div className="space-y-4 relative z-10">
                                        {strategy.advice.map((tip, i) => (
                                            <div key={i} className="flex gap-4">
                                                <div className="w-6 h-6 rounded-full bg-emerald-600 flex items-center justify-center text-[10px] font-black shrink-0">
                                                    {i + 1}
                                                </div>
                                                <p className="text-sm text-slate-300 font-medium leading-relaxed">
                                                    {tip}
                                                </p>
                                            </div>
                                        ))}
                                    </div>
                                    <div className="pt-6 border-t border-white/10 relative z-10">
                                        <button className="flex items-center gap-2 text-emerald-400 text-xs font-black uppercase tracking-widest hover:gap-3 transition-all">
                                            View Networking Guide <ChevronRight className="w-4 h-4" />
                                        </button>
                                    </div>
                                </div>

                                {/* Pro Tip */}
                                <div className="p-6 bg-emerald-50 border-2 border-emerald-100 rounded-3xl">
                                    <div className="flex items-center gap-3 mb-2">
                                        <Send className="w-4 h-4 text-emerald-600" />
                                        <h4 className="text-xs font-black text-emerald-900 uppercase tracking-widest">Pro Tip</h4>
                                    </div>
                                    <p className="text-xs text-emerald-700 font-medium leading-relaxed">
                                        Always personalize your outreach. Mention a specific project or article they've worked on to show genuine interest.
                                    </p>
                                </div>
                            </div>
                        </div>
                    </motion.div>
                ) : (
                    <div className="py-20 text-center">
                        <Users className="w-16 h-16 text-slate-200 mx-auto mb-6" />
                        <h3 className="text-lg font-black text-slate-900 uppercase tracking-widest mb-2">Strategy Not Generated</h3>
                        <p className="text-sm text-slate-500 max-w-xs mx-auto">Click the refresh button to generate your personalized networking strategy.</p>
                    </div>
                )}
            </AnimatePresence>

            {error && (
                <div className="p-4 bg-red-50 text-red-600 text-xs font-bold rounded-xl border border-red-100">
                    {error}
                </div>
            )}
        </div>
    );
};

export default NetworkingPanel;
