
import React, { useState } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { getGhostingRisk } from '../../services/geminiService';
import { Ghost, ShieldAlert, CheckCircle2, RefreshCw, Loader2, AlertTriangle, Search } from 'lucide-react';

const GhostingRiskPanel: React.FC = () => {
    const [isLoading, setIsLoading] = useState(false);
    const [risk, setRisk] = useState<{ riskLevel: 'Low' | 'Medium' | 'High'; reasons: string[]; advice: string } | null>(null);
    const [error, setError] = useState<string | null>(null);
    const [companyName, setCompanyName] = useState('');
    const [jobDescription, setJobDescription] = useState('');

    const fetchRisk = async () => {
        if (!companyName || !jobDescription) {
            setError("Please provide both company name and job description.");
            return;
        }
        setIsLoading(true);
        setError(null);
        try {
            const data = await getGhostingRisk(jobDescription, companyName);
            setRisk(data);
        } catch (err) {
            setError("Failed to assess ghosting risk. Please try again.");
            console.error(err);
        } finally {
            setIsLoading(false);
        }
    };

    const getRiskColor = (level: string) => {
        switch (level) {
            case 'Low': return 'text-emerald-500 bg-emerald-50 border-emerald-500';
            case 'Medium': return 'text-yellow-500 bg-yellow-50 border-yellow-500';
            case 'High': return 'text-rose-500 bg-rose-50 border-rose-500';
            default: return 'text-slate-500 bg-slate-50 border-slate-500';
        }
    };

    return (
        <div className="space-y-12">
            <div className="flex items-center justify-between">
                <div className="space-y-1">
                    <h2 className="text-4xl font-black text-slate-900 uppercase tracking-tighter">Ghosting Risk</h2>
                    <p className="text-sm text-slate-500 font-bold italic">AI-driven analysis of the likelihood that this application is a waste of time.</p>
                </div>
                <Ghost className="w-12 h-12 text-slate-200" />
            </div>

            <div className="grid grid-cols-1 lg:grid-cols-2 gap-8">
                <div className="space-y-6">
                    <div className="space-y-2">
                        <label className="text-xs font-black uppercase tracking-widest text-slate-500">Company Name</label>
                        <input 
                            type="text" 
                            value={companyName}
                            onChange={(e) => setCompanyName(e.target.value)}
                            placeholder="e.g., Google, Meta, Acme Corp"
                            className="w-full p-6 bg-white border-2 border-slate-100 rounded-2xl focus:border-emerald-500 focus:ring-2 focus:ring-emerald-200 outline-none transition-all font-bold"
                        />
                    </div>
                    <div className="space-y-2">
                        <label className="text-xs font-black uppercase tracking-widest text-slate-500">Job Description Snippet</label>
                        <textarea 
                            value={jobDescription}
                            onChange={(e) => setJobDescription(e.target.value)}
                            placeholder="Paste the JD here..."
                            rows={6}
                            className="w-full p-6 bg-white border-2 border-slate-100 rounded-2xl focus:border-emerald-500 focus:ring-2 focus:ring-emerald-200 outline-none transition-all font-bold resize-none"
                        />
                    </div>
                    <button 
                        onClick={fetchRisk}
                        disabled={isLoading}
                        className="w-full py-6 bg-slate-900 text-white rounded-2xl font-black uppercase tracking-widest text-xs hover:bg-black transition-all shadow-2xl shadow-slate-200 flex items-center justify-center gap-3"
                    >
                        {isLoading ? <Loader2 className="w-4 h-4 animate-spin" /> : <Search className="w-4 h-4" />}
                        Assess Risk
                    </button>
                </div>

                <div className="relative min-h-[400px]">
                    <AnimatePresence mode="wait">
                        {isLoading ? (
                            <motion.div 
                                key="loading"
                                initial={{ opacity: 0 }}
                                animate={{ opacity: 1 }}
                                exit={{ opacity: 0 }}
                                className="absolute inset-0 flex flex-col items-center justify-center text-center p-8 bg-slate-50 rounded-[3rem] border-4 border-dashed border-slate-100"
                            >
                                <div className="w-20 h-20 bg-slate-900 rounded-full flex items-center justify-center mb-8 animate-bounce">
                                    <Ghost className="w-10 h-10 text-white" />
                                </div>
                                <h3 className="text-xl font-black text-slate-900 uppercase tracking-widest mb-2">Scanning Market Signals</h3>
                                <p className="text-xs text-slate-500 font-bold uppercase tracking-widest opacity-50">Checking for layoffs, freezes, and fake hiring reports...</p>
                            </motion.div>
                        ) : risk ? (
                            <motion.div 
                                key="results"
                                initial={{ opacity: 0, scale: 0.95 }}
                                animate={{ opacity: 1, scale: 1 }}
                                className="space-y-8"
                            >
                                {/* Risk Level Badge */}
                                <div className={`p-10 rounded-[3rem] border-4 flex flex-col items-center justify-center text-center shadow-2xl shadow-slate-200 ${getRiskColor(risk.riskLevel)}`}>
                                    <span className="text-[10px] font-black uppercase tracking-[0.5em] mb-4 opacity-70">Ghosting Risk Level</span>
                                    <h3 className="text-7xl font-black tracking-tighter italic mb-4">{risk.riskLevel}</h3>
                                    <div className="flex gap-2">
                                        {Array.from({ length: 3 }).map((_, i) => (
                                            <div key={i} className={`w-3 h-3 rounded-full ${i < (risk.riskLevel === 'High' ? 3 : risk.riskLevel === 'Medium' ? 2 : 1) ? 'bg-current' : 'bg-slate-200'}`}></div>
                                        ))}
                                    </div>
                                </div>

                                {/* Reasons */}
                                <div className="space-y-4">
                                    <h4 className="text-xs font-black uppercase tracking-widest text-slate-500 flex items-center gap-2">
                                        <AlertTriangle className="w-4 h-4" />
                                        Key Indicators
                                    </h4>
                                    <div className="grid grid-cols-1 gap-3">
                                        {risk.reasons.map((reason, i) => (
                                            <div key={i} className="p-5 bg-white border-2 border-slate-50 rounded-2xl flex gap-4 items-center">
                                                <div className="w-2 h-2 rounded-full bg-slate-900 shrink-0"></div>
                                                <p className="text-sm font-bold text-slate-700 italic">"{reason}"</p>
                                            </div>
                                        ))}
                                    </div>
                                </div>

                                {/* Advice */}
                                <div className="p-8 bg-slate-900 rounded-[2rem] text-white flex gap-6 items-start shadow-xl">
                                    <ShieldAlert className="w-8 h-8 text-yellow-400 shrink-0" />
                                    <div>
                                        <h4 className="text-xs font-black uppercase tracking-[0.3em] text-slate-400 mb-2">Strategy Advice</h4>
                                        <p className="text-sm font-bold italic leading-relaxed">"{risk.advice}"</p>
                                    </div>
                                </div>
                            </motion.div>
                        ) : (
                            <div className="absolute inset-0 flex flex-col items-center justify-center text-center p-8 bg-slate-50 rounded-[3rem] border-4 border-dashed border-slate-100">
                                <Ghost className="w-16 h-16 text-slate-200 mb-8" />
                                <h3 className="text-xl font-black text-slate-900 uppercase tracking-widest mb-4">Don't Get Ghosted</h3>
                                <p className="text-xs text-slate-500 max-w-xs mx-auto font-bold uppercase tracking-widest opacity-50">Enter company details to see if they are actually hiring or just collecting resumes.</p>
                            </div>
                        )}
                    </AnimatePresence>
                </div>
            </div>

            {error && (
                <div className="p-6 bg-red-50 text-red-600 text-sm font-black rounded-2xl border-2 border-red-100 uppercase tracking-widest text-center">
                    {error}
                </div>
            )}
        </div>
    );
};

export default GhostingRiskPanel;
