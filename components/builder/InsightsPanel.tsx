
import React, { useState, useEffect } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { getMarketInsights } from '../../services/geminiService';
import { Search, TrendingUp, Newspaper, Info, ExternalLink, RefreshCw, MapPin, Briefcase, AlertCircle } from 'lucide-react';

interface InsightsPanelProps {
    defaultRole: string;
}

const InsightsPanel: React.FC<InsightsPanelProps> = ({ defaultRole }) => {
    const [role, setRole] = useState(defaultRole || '');
    const [location, setLocation] = useState('');
    const [isLoading, setIsLoading] = useState(false);
    const [insights, setInsights] = useState<{ trends: string[]; news: { title: string; url: string }[]; summary: string } | null>(null);
    const [error, setError] = useState<string | null>(null);

    const fetchInsights = async () => {
        if (!role.trim()) return;
        setIsLoading(true);
        setError(null);
        try {
            const data = await getMarketInsights(role, location);
            setInsights(data);
        } catch (err) {
            setError("Failed to fetch real-time insights. Please try again.");
            console.error(err);
        } finally {
            setIsLoading(false);
        }
    };

    useEffect(() => {
        if (defaultRole && !insights && !isLoading) {
            fetchInsights();
        }
    }, [defaultRole]);

    return (
        <div className="space-y-8">
            <div className="bg-white rounded-[2rem] border border-slate-200/50 p-6 sm:p-8 shadow-sm">
                <div className="flex flex-col sm:flex-row gap-4 mb-8">
                    <div className="flex-1 relative group">
                        <Briefcase className="absolute left-4 top-1/2 -translate-y-1/2 w-5 h-5 text-slate-400 group-focus-within:text-emerald-500 transition-colors" />
                        <input 
                            type="text"
                            value={role}
                            onChange={(e) => setRole(e.target.value)}
                            placeholder="Target Role (e.g. Software Engineer)"
                            className="w-full pl-12 pr-4 py-4 bg-slate-50 border border-slate-200 focus:border-emerald-500 focus:bg-white focus:ring-4 focus:ring-emerald-500/10 rounded-2xl text-base font-medium text-slate-900 placeholder:text-slate-400 transition-all outline-none"
                        />
                    </div>
                    <div className="flex-1 relative group">
                        <MapPin className="absolute left-4 top-1/2 -translate-y-1/2 w-5 h-5 text-slate-400 group-focus-within:text-emerald-500 transition-colors" />
                        <input 
                            type="text"
                            value={location}
                            onChange={(e) => setLocation(e.target.value)}
                            placeholder="Location (e.g. Remote, New York)"
                            className="w-full pl-12 pr-4 py-4 bg-slate-50 border border-slate-200 focus:border-emerald-500 focus:bg-white focus:ring-4 focus:ring-emerald-500/10 rounded-2xl text-base font-medium text-slate-900 placeholder:text-slate-400 transition-all outline-none"
                        />
                    </div>
                    <motion.button 
                        whileHover={{ scale: 1.02 }}
                        whileTap={{ scale: 0.98 }}
                        onClick={fetchInsights}
                        disabled={isLoading || !role.trim()}
                        className="px-8 py-4 bg-emerald-600 text-white rounded-2xl text-base font-bold hover:bg-emerald-700 disabled:opacity-50 disabled:cursor-not-allowed transition-all flex items-center justify-center gap-2 shadow-sm hover:shadow-md"
                    >
                        {isLoading ? <RefreshCw className="w-5 h-5 animate-spin" /> : <Search className="w-5 h-5" />}
                        {isLoading ? 'Searching...' : 'Search'}
                    </motion.button>
                </div>

                <AnimatePresence mode="wait">
                    {isLoading ? (
                        <motion.div 
                            key="loading"
                            initial={{ opacity: 0, y: 20 }}
                            animate={{ opacity: 1, y: 0 }}
                            exit={{ opacity: 0, y: -20 }}
                            className="py-24 flex flex-col items-center justify-center text-center bg-slate-50/50 rounded-3xl border border-slate-100"
                        >
                            <div className="relative w-24 h-24 mb-8">
                                <Search className="w-full h-full text-emerald-600 animate-[pulse_2s_ease-in-out_infinite]" />
                                <div className="absolute inset-0 border-[6px] border-emerald-100 rounded-full"></div>
                                <div className="absolute inset-0 border-[6px] border-emerald-600 rounded-full border-t-transparent animate-spin"></div>
                            </div>
                            <h3 className="text-xl font-black text-slate-900 tracking-tight mb-3">Analyzing Market Data</h3>
                            <p className="text-base text-slate-500 max-w-sm mx-auto font-medium leading-relaxed">Fetching real-time trends and news via Google Search...</p>
                        </motion.div>
                    ) : insights ? (
                        <motion.div 
                            key="results"
                            initial={{ opacity: 0, y: 20 }}
                            animate={{ opacity: 1, y: 0 }}
                            className="space-y-8"
                        >
                            {/* Executive Summary */}
                            <div className="p-8 bg-gradient-to-br from-emerald-50 to-teal-50 rounded-[2rem] border border-emerald-100 shadow-sm relative overflow-hidden">
                                <div className="absolute top-0 right-0 w-64 h-64 bg-white/40 rounded-full -translate-y-1/2 translate-x-1/2 blur-3xl"></div>
                                <div className="relative z-10">
                                    <div className="flex items-center gap-3 mb-4">
                                        <div className="p-2 bg-emerald-100 rounded-xl text-emerald-600">
                                            <Info className="w-6 h-6" />
                                        </div>
                                        <h3 className="text-lg font-black text-slate-900 tracking-tight">Market Summary</h3>
                                    </div>
                                    <p className="text-base text-slate-700 leading-relaxed font-medium">
                                        {insights.summary}
                                    </p>
                                </div>
                            </div>

                            <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
                                {/* Trends */}
                                <div className="space-y-6">
                                    <div className="flex items-center gap-3">
                                        <div className="p-2 bg-emerald-50 rounded-xl text-emerald-600 border border-emerald-100">
                                            <TrendingUp className="w-6 h-6" />
                                        </div>
                                        <h3 className="text-lg font-black text-slate-900 tracking-tight">Key Trends</h3>
                                    </div>
                                    <div className="space-y-4">
                                        {insights.trends.map((trend, i) => (
                                            <div key={i} className="p-5 bg-white rounded-2xl border border-slate-200 shadow-sm text-sm text-slate-700 font-medium flex items-start gap-4 hover:border-emerald-200 hover:shadow-md transition-all">
                                                <span className="w-8 h-8 bg-emerald-50 text-emerald-600 rounded-full flex items-center justify-center text-sm font-bold shrink-0">{i + 1}</span>
                                                <span className="pt-1 leading-relaxed">{trend}</span>
                                            </div>
                                        ))}
                                    </div>
                                </div>

                                {/* News */}
                                <div className="space-y-6">
                                    <div className="flex items-center gap-3">
                                        <div className="p-2 bg-teal-50 rounded-xl text-teal-600 border border-teal-100">
                                            <Newspaper className="w-6 h-6" />
                                        </div>
                                        <h3 className="text-lg font-black text-slate-900 tracking-tight">Recent News</h3>
                                    </div>
                                    <div className="space-y-4">
                                        {insights.news.map((item, i) => (
                                                <a 
                                                key={i} 
                                                href={item.url} 
                                                target="_blank" 
                                                rel="noopener noreferrer"
                                                className="block p-5 bg-white border border-slate-200 rounded-2xl hover:border-teal-300 hover:shadow-md transition-all group"
                                            >
                                                <div className="flex items-start justify-between gap-4">
                                                    <p className="text-sm font-bold text-slate-800 group-hover:text-teal-700 leading-relaxed transition-colors">
                                                        {item.title}
                                                    </p>
                                                    <div className="p-2 bg-slate-50 rounded-lg group-hover:bg-teal-50 transition-colors shrink-0 border border-transparent group-hover:border-teal-100">
                                                        <ExternalLink className="w-4 h-4 text-slate-400 group-hover:text-teal-600 transition-colors" />
                                                    </div>
                                                </div>
                                            </a>
                                        ))}
                                    </div>
                                </div>
                            </div>
                        </motion.div>
                    ) : (
                        <div className="py-24 text-center bg-slate-50/50 rounded-3xl border border-slate-100">
                            <div className="w-24 h-24 bg-white rounded-full flex items-center justify-center mx-auto mb-6 border border-slate-200 shadow-sm">
                                <Search className="w-10 h-10 text-slate-300" />
                            </div>
                            <h3 className="text-xl font-black text-slate-900 tracking-tight mb-3">No Insights Yet</h3>
                            <p className="text-base text-slate-500 max-w-sm mx-auto font-medium leading-relaxed">Search for a role and location to see real-time market trends and news.</p>
                        </div>
                    )}
                </AnimatePresence>

                {error && (
                    <div className="mt-8 p-6 bg-rose-50 text-rose-700 text-sm font-bold rounded-[2rem] border border-rose-100 flex items-center gap-3">
                        <AlertCircle className="w-5 h-5" />
                        {error}
                    </div>
                )}
            </div>

            <div className="p-8 bg-slate-900 rounded-[2rem] text-white shadow-xl relative overflow-hidden">
                <div className="absolute top-0 right-0 w-64 h-64 bg-emerald-500/10 rounded-full -translate-y-1/2 translate-x-1/2 blur-3xl"></div>
                <div className="relative z-10">
                    <div className="flex items-center gap-4 mb-4">
                        <div className="w-12 h-12 rounded-2xl bg-emerald-500/20 flex items-center justify-center border border-emerald-500/30">
                            <svg className="w-6 h-6 text-emerald-400" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round"><path d="M13 10V3L4 14h7v7l9-11h-7z" /></svg>
                        </div>
                        <div>
                            <h4 className="text-lg font-black tracking-tight text-white">AI Market Analyst</h4>
                            <p className="text-xs text-emerald-300 font-bold uppercase tracking-widest mt-1">Powered by Google Search</p>
                        </div>
                    </div>
                    <p className="text-base text-slate-300 leading-relaxed font-medium max-w-3xl">
                        Our AI analyst scans thousands of real-time sources across the web to provide you with the most current market intelligence. Use these insights to tailor your resume and prepare for interviews based on what employers are looking for right now.
                    </p>
                </div>
            </div>
        </div>
    );
};

export default InsightsPanel;
