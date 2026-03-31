
import React, { useState, useEffect } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { getPersonalBrandAudit } from '../../services/geminiService';
import { ResumeData } from '../../types';
import { Sparkles, Target, ShieldAlert, Zap, RefreshCw, ScanFace, Quote } from 'lucide-react';

interface BrandAuditPanelProps {
    resumeData: ResumeData;
}

const BrandAuditPanel: React.FC<BrandAuditPanelProps> = ({ resumeData }) => {
    const [isLoading, setIsLoading] = useState(false);
    const [audit, setAudit] = useState<{ archetype: string; vibe: string; strengths: string[]; weaknesses: string[]; marketMatch: string } | null>(null);
    const [error, setError] = useState<string | null>(null);

    const fetchAudit = async () => {
        setIsLoading(true);
        setError(null);
        try {
            const data = await getPersonalBrandAudit(resumeData);
            setAudit(data);
        } catch (err) {
            setError("Failed to analyze your brand. Please try again.");
            console.error(err);
        } finally {
            setIsLoading(false);
        }
    };

    useEffect(() => {
        if (!audit && !isLoading) {
            fetchAudit();
        }
    }, [resumeData]);

    return (
        <div className="space-y-12">
            <div className="flex items-center justify-between">
                <div className="space-y-1">
                    <h2 className="text-4xl font-black text-slate-900 uppercase tracking-tighter">The Vibe Check</h2>
                    <p className="text-sm text-slate-500 font-bold italic">AI-driven analysis of the professional persona you project.</p>
                </div>
                <button 
                    onClick={fetchAudit}
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
                        <div className="w-24 h-24 bg-emerald-600 rounded-full flex items-center justify-center mb-8 animate-pulse shadow-2xl shadow-emerald-200">
                            <ScanFace className="w-12 h-12 text-white" />
                        </div>
                        <h3 className="text-2xl font-black text-slate-900 uppercase tracking-widest mb-2">Decoding Your DNA</h3>
                        <p className="text-sm text-slate-500 max-w-xs mx-auto font-bold uppercase tracking-widest opacity-50">Analyzing voice, tone, and impact...</p>
                    </motion.div>
                ) : audit ? (
                    <motion.div 
                        key="results"
                        initial={{ opacity: 0, y: 20 }}
                        animate={{ opacity: 1, y: 0 }}
                        className="grid grid-cols-1 lg:grid-cols-12 gap-8"
                    >
                        {/* Archetype Card */}
                        <div className="lg:col-span-12 bg-gradient-to-br from-emerald-600 to-teal-700 p-12 rounded-[3rem] text-white relative overflow-hidden shadow-2xl shadow-emerald-200">
                            <div className="absolute top-0 right-0 w-64 h-64 bg-white/10 rounded-full -mr-32 -mt-32 blur-3xl"></div>
                            <div className="relative z-10">
                                <span className="text-[10px] font-black uppercase tracking-[0.5em] text-emerald-200 mb-6 block">Your Professional Archetype</span>
                                <h3 className="text-6xl font-black tracking-tighter mb-6 italic">
                                    {audit.archetype}
                                </h3>
                                <div className="flex gap-4 items-start max-w-2xl">
                                    <Quote className="w-8 h-8 text-emerald-300 shrink-0 opacity-50" />
                                    <p className="text-xl font-medium text-emerald-50 leading-relaxed italic">
                                        {audit.vibe}
                                    </p>
                                </div>
                            </div>
                        </div>

                        {/* Strengths & Weaknesses */}
                        <div className="lg:col-span-6 space-y-6">
                            <div className="flex items-center gap-3">
                                <Zap className="w-6 h-6 text-yellow-500" />
                                <h3 className="text-xl font-black text-slate-900 uppercase tracking-widest">Brand Strengths</h3>
                            </div>
                            <div className="grid grid-cols-1 gap-4">
                                {audit.strengths.map((s, i) => (
                                    <div key={i} className="p-6 bg-emerald-50 border-l-4 border-emerald-500 rounded-2xl">
                                        <p className="text-sm font-black text-emerald-900 uppercase tracking-tight">{s}</p>
                                    </div>
                                ))}
                            </div>
                        </div>

                        <div className="lg:col-span-6 space-y-6">
                            <div className="flex items-center gap-3">
                                <ShieldAlert className="w-6 h-6 text-rose-500" />
                                <h3 className="text-xl font-black text-slate-900 uppercase tracking-widest">Blind Spots</h3>
                            </div>
                            <div className="grid grid-cols-1 gap-4">
                                {audit.weaknesses.map((w, i) => (
                                    <div key={i} className="p-6 bg-rose-50 border-l-4 border-rose-500 rounded-2xl">
                                        <p className="text-sm font-black text-rose-900 uppercase tracking-tight">{w}</p>
                                    </div>
                                ))}
                            </div>
                        </div>

                        {/* Market Match */}
                        <div className="lg:col-span-12 p-8 bg-slate-900 rounded-[2rem] text-white flex flex-col md:flex-row items-center gap-8 shadow-xl">
                            <div className="w-16 h-16 bg-emerald-500 rounded-2xl flex items-center justify-center shrink-0">
                                <Target className="w-8 h-8 text-white" />
                            </div>
                            <div>
                                <h4 className="text-xs font-black uppercase tracking-[0.3em] text-emerald-300 mb-2">Market Sentiment</h4>
                                <p className="text-lg font-bold italic">"{audit.marketMatch}"</p>
                            </div>
                        </div>
                    </motion.div>
                ) : null}
            </AnimatePresence>

            {error && (
                <div className="p-6 bg-red-50 text-red-600 text-sm font-black rounded-2xl border-2 border-red-100 uppercase tracking-widest text-center">
                    {error}
                </div>
            )}
        </div>
    );
};

export default BrandAuditPanel;
