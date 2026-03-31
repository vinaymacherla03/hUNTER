
import React, { useState } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { getPivotAnalysis } from '../../services/geminiService';
import { ResumeData } from '../../types';
import { Target, Zap, ShieldAlert, RefreshCw, Loader2, Compass, ArrowRight, CheckCircle2 } from 'lucide-react';

interface PivotSimulatorProps {
    resumeData: ResumeData;
}

const PivotSimulator: React.FC<PivotSimulatorProps> = ({ resumeData }) => {
    const [isLoading, setIsLoading] = useState(false);
    const [pivot, setPivot] = useState<{ feasibility: number; transferableSkills: string[]; gaps: string[]; strategy: string } | null>(null);
    const [error, setError] = useState<string | null>(null);
    const [targetPivot, setTargetPivot] = useState('');

    const fetchPivot = async () => {
        if (!targetPivot) {
            setError("Please provide a target role for the pivot.");
            return;
        }
        setIsLoading(true);
        setError(null);
        try {
            const data = await getPivotAnalysis(resumeData, targetPivot);
            setPivot(data);
        } catch (err) {
            setError("Failed to analyze your pivot. Please try again.");
            console.error(err);
        } finally {
            setIsLoading(false);
        }
    };

    return (
        <div className="space-y-12">
            <div className="flex items-center justify-between">
                <div className="space-y-1">
                    <h2 className="text-4xl font-black text-slate-900 uppercase tracking-tighter">Career Pivot Simulator</h2>
                    <p className="text-sm text-slate-500 font-bold italic">AI-driven analysis of your feasibility to switch roles or industries.</p>
                </div>
                <Compass className="w-12 h-12 text-slate-200" />
            </div>

            <div className="grid grid-cols-1 lg:grid-cols-2 gap-8">
                <div className="space-y-6">
                    <div className="p-8 bg-slate-50 rounded-[2rem] border-2 border-slate-100 space-y-6">
                        <div className="flex items-center gap-4">
                            <div className="w-12 h-12 bg-white rounded-xl flex items-center justify-center shadow-sm">
                                <Target className="w-6 h-6 text-slate-900" />
                            </div>
                            <h3 className="text-lg font-black text-slate-900 uppercase tracking-widest">Target Pivot</h3>
                        </div>
                        <div className="space-y-2">
                            <label className="text-xs font-black uppercase tracking-widest text-slate-500">What role are you aiming for?</label>
                            <input 
                                type="text" 
                                value={targetPivot}
                                onChange={(e) => setTargetPivot(e.target.value)}
                                placeholder="e.g., Product Manager, Data Scientist, UX Designer"
                                className="w-full p-6 bg-white border-2 border-slate-100 rounded-2xl focus:border-slate-900 transition-all font-bold"
                            />
                        </div>
                        <button 
                            onClick={fetchPivot}
                            disabled={isLoading}
                            className="w-full py-6 bg-slate-900 text-white rounded-2xl font-black uppercase tracking-widest text-xs hover:bg-black transition-all shadow-2xl shadow-slate-200 flex items-center justify-center gap-3"
                        >
                            {isLoading ? <Loader2 className="w-4 h-4 animate-spin" /> : <Zap className="w-4 h-4" />}
                            Simulate Pivot
                        </button>
                    </div>

                    <div className="p-8 bg-emerald-50 rounded-[2rem] border-2 border-emerald-100 space-y-4">
                        <div className="flex items-center gap-3">
                            <ShieldAlert className="w-5 h-5 text-emerald-600" />
                            <h4 className="text-xs font-black uppercase tracking-widest text-emerald-900">Why Pivot?</h4>
                        </div>
                        <p className="text-sm font-bold text-emerald-800 italic leading-relaxed">
                            Pivoting is about bridging the gap between your current expertise and your future goal. We analyze your transferable skills to see how much of a "leap" you're taking.
                        </p>
                    </div>
                </div>

                <div className="relative min-h-[500px]">
                    <AnimatePresence mode="wait">
                        {isLoading ? (
                            <motion.div 
                                key="loading"
                                initial={{ opacity: 0 }}
                                animate={{ opacity: 1 }}
                                exit={{ opacity: 0 }}
                                className="absolute inset-0 flex flex-col items-center justify-center text-center p-8 bg-slate-50 rounded-[3rem] border-4 border-dashed border-slate-100"
                            >
                                <div className="w-24 h-24 bg-emerald-600 rounded-full flex items-center justify-center mb-8 animate-pulse shadow-2xl shadow-emerald-200">
                                    <Zap className="w-12 h-12 text-white" />
                                </div>
                                <h3 className="text-2xl font-black text-slate-900 uppercase tracking-widest mb-2">Calculating Trajectory</h3>
                                <p className="text-sm text-slate-500 max-w-xs mx-auto font-bold uppercase tracking-widest opacity-50">Mapping transferable skills and identifying gaps...</p>
                            </motion.div>
                        ) : pivot ? (
                            <motion.div 
                                key="results"
                                initial={{ opacity: 0, y: 20 }}
                                animate={{ opacity: 1, y: 0 }}
                                className="space-y-8"
                            >
                                {/* Feasibility Score */}
                                <div className="p-10 bg-slate-900 rounded-[3rem] text-white flex flex-col items-center justify-center text-center shadow-2xl shadow-slate-300 relative overflow-hidden">
                                    <div className="absolute top-0 left-0 w-full h-2 bg-emerald-500"></div>
                                    <span className="text-[10px] font-black uppercase tracking-[0.5em] text-slate-400 mb-6">Pivot Feasibility Score</span>
                                    <div className="relative">
                                        <h3 className="text-9xl font-black tracking-tighter italic mb-4">{pivot.feasibility}%</h3>
                                        <div className="w-full h-2 bg-slate-800 rounded-full overflow-hidden">
                                            <motion.div 
                                                initial={{ width: 0 }}
                                                animate={{ width: `${pivot.feasibility}%` }}
                                                className="h-full bg-emerald-500"
                                            />
                                        </div>
                                    </div>
                                </div>

                                <div className="grid grid-cols-1 gap-6">
                                    {/* Transferable Skills */}
                                    <div className="space-y-4">
                                        <h4 className="text-xs font-black uppercase tracking-widest text-slate-500 flex items-center gap-2">
                                            <CheckCircle2 className="w-4 h-4 text-emerald-500" />
                                            Transferable Skills
                                        </h4>
                                        <div className="flex flex-wrap gap-2">
                                            {pivot.transferableSkills.map((s, i) => (
                                                <div key={i} className="px-4 py-2 bg-emerald-50 text-emerald-700 rounded-xl text-xs font-black uppercase tracking-tight border border-emerald-100">
                                                    {s}
                                                </div>
                                            ))}
                                        </div>
                                    </div>

                                    {/* Gaps */}
                                    <div className="space-y-4">
                                        <h4 className="text-xs font-black uppercase tracking-widest text-slate-500 flex items-center gap-2">
                                            <ShieldAlert className="w-4 h-4 text-rose-500" />
                                            Critical Gaps
                                        </h4>
                                        <div className="flex flex-wrap gap-2">
                                            {pivot.gaps.map((g, i) => (
                                                <div key={i} className="px-4 py-2 bg-rose-50 text-rose-700 rounded-xl text-xs font-black uppercase tracking-tight border border-rose-100">
                                                    {g}
                                                </div>
                                            ))}
                                        </div>
                                    </div>

                                    {/* Strategy */}
                                    <div className="p-8 bg-white border-2 border-slate-100 rounded-[2rem] flex gap-6 items-start shadow-xl">
                                        <div className="w-12 h-12 bg-slate-900 rounded-2xl flex items-center justify-center shrink-0">
                                            <ArrowRight className="w-6 h-6 text-white" />
                                        </div>
                                        <div>
                                            <h4 className="text-xs font-black uppercase tracking-[0.3em] text-slate-400 mb-2">Pivot Strategy</h4>
                                            <p className="text-sm font-bold italic leading-relaxed">"{pivot.strategy}"</p>
                                        </div>
                                    </div>
                                </div>
                            </motion.div>
                        ) : (
                            <div className="absolute inset-0 flex flex-col items-center justify-center text-center p-8 bg-slate-50 rounded-[3rem] border-4 border-dashed border-slate-100">
                                <Target className="w-16 h-16 text-slate-200 mb-8" />
                                <h3 className="text-xl font-black text-slate-900 uppercase tracking-widest mb-4">Ready to Leap?</h3>
                                <p className="text-xs text-slate-500 max-w-xs mx-auto font-bold uppercase tracking-widest opacity-50">Enter your target role to see how your current skills map to a new career path.</p>
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

export default PivotSimulator;
