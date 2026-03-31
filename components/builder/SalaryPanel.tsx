
import React, { useState } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { DollarSign, Search, TrendingUp, MessageSquare, Info, RefreshCw, MapPin, Briefcase, Award, Loader2 } from 'lucide-react';
import { getSalaryIntelligence } from '../../services/geminiService';

interface SalaryPanelProps {
    defaultRole: string;
}

const SalaryPanel: React.FC<SalaryPanelProps> = ({ defaultRole }) => {
    const [role, setRole] = useState(defaultRole || '');
    const [location, setLocation] = useState('');
    const [experience, setExperience] = useState('Mid-Level');
    const [isLoading, setIsLoading] = useState(false);
    const [data, setData] = useState<{ range: string; factors: string[]; negotiationStrategy: string; script: string } | null>(null);
    const [error, setError] = useState<string | null>(null);

    const fetchSalaryData = async () => {
        if (!role.trim()) return;
        setIsLoading(true);
        setError(null);
        try {
            const result = await getSalaryIntelligence(role, location, experience);
            setData(result);
        } catch (err) {
            setError("Failed to fetch salary intelligence. Please try again.");
            console.error(err);
        } finally {
            setIsLoading(false);
        }
    };

    return (
        <div className="space-y-8">
            <div className="flex flex-col gap-2">
                <h2 className="text-2xl sm:text-3xl font-black text-slate-900 tracking-tight">Salary Intelligence</h2>
                <p className="text-xs sm:text-sm text-slate-500 font-medium italic">Real-time salary data and negotiation scripts powered by Google Search.</p>
            </div>

            <div className="bg-white rounded-[2.5rem] border-2 border-slate-100 p-8 shadow-sm">
                <div className="grid grid-cols-1 md:grid-cols-3 gap-4 mb-8">
                    <div className="relative">
                        <Briefcase className="absolute left-4 top-1/2 -translate-y-1/2 w-4 h-4 text-slate-400" />
                        <input 
                            type="text"
                            value={role}
                            onChange={(e) => setRole(e.target.value)}
                            placeholder="Role (e.g. Senior Dev)"
                            className="w-full pl-12 pr-4 py-4 bg-slate-50 border-2 border-transparent focus:border-emerald-500 focus:bg-white rounded-2xl text-sm font-bold transition-all outline-none"
                        />
                    </div>
                    <div className="relative">
                        <MapPin className="absolute left-4 top-1/2 -translate-y-1/2 w-4 h-4 text-slate-400" />
                        <input 
                            type="text"
                            value={location}
                            onChange={(e) => setLocation(e.target.value)}
                            placeholder="Location (e.g. SF, Remote)"
                            className="w-full pl-12 pr-4 py-4 bg-slate-50 border-2 border-transparent focus:border-emerald-500 focus:bg-white rounded-2xl text-sm font-bold transition-all outline-none"
                        />
                    </div>
                    <div className="relative">
                        <Award className="absolute left-4 top-1/2 -translate-y-1/2 w-4 h-4 text-slate-400" />
                        <select 
                            value={experience}
                            onChange={(e) => setExperience(e.target.value)}
                            className="w-full pl-12 pr-4 py-4 bg-slate-50 border-2 border-transparent focus:border-emerald-500 focus:bg-white rounded-2xl text-sm font-bold transition-all outline-none appearance-none"
                        >
                            <option>Junior</option>
                            <option>Mid-Level</option>
                            <option>Senior</option>
                            <option>Lead/Manager</option>
                            <option>Executive</option>
                        </select>
                    </div>
                </div>

                <button 
                    onClick={fetchSalaryData}
                    disabled={isLoading || !role.trim()}
                    className="w-full py-4 bg-slate-900 text-white rounded-2xl font-black uppercase tracking-widest text-xs hover:bg-black transition-all disabled:opacity-50 flex items-center justify-center gap-3 shadow-xl shadow-slate-200"
                >
                    {isLoading ? <Loader2 className="w-4 h-4 animate-spin" /> : <DollarSign className="w-4 h-4" />}
                    {isLoading ? 'Analyzing Market Rates...' : 'Get Salary Intelligence'}
                </button>

                <AnimatePresence mode="wait">
                    {isLoading ? (
                        <motion.div 
                            key="loading"
                            initial={{ opacity: 0 }}
                            animate={{ opacity: 1 }}
                            exit={{ opacity: 0 }}
                            className="py-20 flex flex-col items-center justify-center text-center"
                        >
                            <div className="w-20 h-20 bg-emerald-50 rounded-full flex items-center justify-center mb-6 animate-pulse">
                                <DollarSign className="w-10 h-10 text-emerald-600" />
                            </div>
                            <h3 className="text-xl font-black text-slate-900 uppercase tracking-widest mb-2">Calculating Value</h3>
                            <p className="text-sm text-slate-500 max-w-xs mx-auto font-medium">Scanning current job boards and salary reports for the most accurate data...</p>
                        </motion.div>
                    ) : data ? (
                        <motion.div 
                            key="results"
                            initial={{ opacity: 0, y: 20 }}
                            animate={{ opacity: 1, y: 0 }}
                            className="mt-12 space-y-8"
                        >
                            {/* Salary Range Card */}
                            <div className="p-10 bg-gradient-to-br from-emerald-600 to-teal-700 rounded-[2.5rem] text-white shadow-2xl shadow-emerald-200 relative overflow-hidden">
                                <div className="absolute top-0 right-0 w-64 h-64 bg-white/10 rounded-full -translate-y-1/2 translate-x-1/2 blur-3xl"></div>
                                <div className="relative z-10 flex flex-col items-center text-center">
                                    <span className="text-xs font-black uppercase tracking-[0.3em] text-emerald-200 mb-4">Estimated Market Range</span>
                                    <h3 className="text-4xl sm:text-6xl font-black tracking-tighter mb-6">
                                        {data.range}
                                    </h3>
                                    <div className="flex items-center gap-2 px-4 py-2 bg-white/10 rounded-full text-[10px] font-black uppercase tracking-widest">
                                        <TrendingUp className="w-3 h-3" />
                                        Updated Real-time
                                    </div>
                                </div>
                            </div>

                            <div className="grid grid-cols-1 lg:grid-cols-2 gap-8">
                                {/* Negotiation Strategy */}
                                <div className="space-y-6">
                                    <div className="flex items-center gap-3">
                                        <TrendingUp className="w-6 h-6 text-emerald-600" />
                                        <h3 className="text-lg font-black text-slate-900 uppercase tracking-widest">Negotiation Strategy</h3>
                                    </div>
                                    <div className="p-8 bg-emerald-50 border-2 border-emerald-100 rounded-[2rem] space-y-4">
                                        <p className="text-sm text-emerald-900 font-bold leading-relaxed italic">
                                            "{data.negotiationStrategy}"
                                        </p>
                                        <div className="pt-4 border-t border-emerald-200">
                                            <h4 className="text-[10px] font-black text-emerald-600 uppercase tracking-widest mb-4">Key Leverage Factors:</h4>
                                            <div className="space-y-2">
                                                {data.factors.map((factor, i) => (
                                                    <div key={i} className="flex items-center gap-3 text-xs font-bold text-emerald-800">
                                                        <div className="w-1.5 h-1.5 rounded-full bg-emerald-500"></div>
                                                        {factor}
                                                    </div>
                                                ))}
                                            </div>
                                        </div>
                                    </div>
                                </div>

                                {/* Negotiation Script */}
                                <div className="space-y-6">
                                    <div className="flex items-center gap-3">
                                        <MessageSquare className="w-6 h-6 text-teal-600" />
                                        <h3 className="text-lg font-black text-slate-900 uppercase tracking-widest">The Script</h3>
                                    </div>
                                    <div className="p-8 bg-slate-900 rounded-[2rem] text-white relative overflow-hidden group">
                                        <div className="absolute top-0 right-0 p-6 opacity-20 group-hover:opacity-40 transition-opacity">
                                            <MessageSquare className="w-12 h-12" />
                                        </div>
                                        <p className="text-xs font-black text-teal-400 uppercase tracking-widest mb-4">What to say:</p>
                                        <p className="text-lg font-medium leading-relaxed italic text-slate-200">
                                            "{data.script}"
                                        </p>
                                        <div className="mt-8 pt-6 border-t border-white/10 flex justify-end">
                                            <button 
                                                onClick={() => navigator.clipboard.writeText(data.script)}
                                                className="flex items-center gap-2 text-emerald-400 text-[10px] font-black uppercase tracking-widest hover:text-white transition-colors"
                                            >
                                                Copy Script
                                            </button>
                                        </div>
                                    </div>
                                </div>
                            </div>
                        </motion.div>
                    ) : (
                        <div className="py-20 text-center border-2 border-dashed border-slate-100 rounded-[2rem] mt-8">
                            <DollarSign className="w-16 h-16 text-slate-200 mx-auto mb-6" />
                            <h3 className="text-lg font-black text-slate-900 uppercase tracking-widest mb-2">Know Your Worth</h3>
                            <p className="text-sm text-slate-500 max-w-xs mx-auto font-medium">Enter your role and location above to see what the market is paying and how to negotiate for it.</p>
                        </div>
                    )}
                </AnimatePresence>
            </div>

            {/* Pro Tip */}
            <div className="flex items-start gap-6 p-8 bg-white border-2 border-slate-100 rounded-[2rem]">
                <div className="w-12 h-12 rounded-2xl bg-emerald-50 flex items-center justify-center shrink-0">
                    <Info className="w-6 h-6 text-emerald-600" />
                </div>
                <div>
                    <h4 className="text-sm font-black text-slate-900 uppercase tracking-widest mb-2">Pro Tip</h4>
                    <p className="text-sm text-slate-600 leading-relaxed font-medium">
                        Always wait for the employer to make the first offer if possible. If they ask for your range, use the data provided here to anchor the conversation high while remaining professional.
                    </p>
                </div>
            </div>

            {error && (
                <div className="p-4 bg-red-50 text-red-600 text-xs font-bold rounded-xl border border-red-100">
                    {error}
                </div>
            )}
        </div>
    );
};

export default SalaryPanel;
