
import React, { useState } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { Sparkles, Wand2, Copy, Check, RefreshCw, AlertCircle, Target } from 'lucide-react';
import { generateAgentSuggestion } from '../../services/geminiService';
import { toast } from 'sonner';
import Tooltip from '../Tooltip';
import AIProcessingState from './AIProcessingState';

interface BulletOptimizerProps {
    jobDescription?: string;
}

const BulletOptimizer: React.FC<BulletOptimizerProps> = ({ jobDescription: initialJobDescription = '' }) => {
    const [input, setInput] = useState('');
    const [localJobDescription, setLocalJobDescription] = useState(initialJobDescription);
    const [output, setOutput] = useState('');
    const [reason, setReason] = useState('');
    const [isLoading, setIsLoading] = useState(false);
    const [copied, setCopied] = useState(false);
    const [showJdInput, setShowJdInput] = useState(false);

    const handleOptimize = async () => {
        if (!input.trim()) {
            toast.error("Please enter a bullet point to optimize.");
            return;
        }

        setIsLoading(true);
        try {
            const result = await generateAgentSuggestion('REWRITE_EXPERIENCE_BULLET_WITH_REASON', { 
                bulletPoint: input, 
                jobDescription: localJobDescription 
            });
            
            if (result && typeof result === 'object' && 'rewritten' in result) {
                setOutput(result.rewritten);
                setReason(result.reason);
            } else {
                setOutput(result);
            }
        } catch (error) {
            console.error("Optimization failed", error);
            toast.error("Failed to optimize bullet point. Please try again.");
        } finally {
            setIsLoading(false);
        }
    };

    const handleCopy = () => {
        navigator.clipboard.writeText(output);
        setCopied(true);
        toast.success("Copied to clipboard!");
        setTimeout(() => setCopied(false), 2000);
    };

    return (
        <div className="space-y-6">
            <div className="bg-white p-6 rounded-[2rem] border border-slate-200 shadow-sm">
                <div className="flex items-center gap-3 mb-6">
                    <div className="p-2 bg-emerald-50 text-emerald-600 rounded-xl">
                        <Wand2 className="w-5 h-5" />
                    </div>
                    <div>
                        <h3 className="text-lg font-black text-slate-900 tracking-tight">Bullet Point Optimizer</h3>
                        <p className="text-xs text-slate-500 font-medium">Transform weak bullets into high-impact STAR statements.</p>
                    </div>
                </div>

                <div className="space-y-4">
                    <div>
                        <div className="flex items-center justify-between mb-2 ml-1">
                            <label className="block text-[10px] font-black text-slate-400 uppercase tracking-widest">Current Bullet Point</label>
                            <button 
                                onClick={() => setShowJdInput(!showJdInput)}
                                className="text-[10px] font-bold text-emerald-600 hover:text-emerald-700 flex items-center gap-1"
                            >
                                <Target className="w-3 h-3" />
                                {showJdInput ? 'Hide Job Context' : 'Add Job Context'}
                            </button>
                        </div>
                        <textarea 
                            value={input}
                            onChange={(e) => setInput(e.target.value)}
                            placeholder="e.g., Managed a team of developers."
                            className="w-full p-4 bg-slate-50 border border-slate-200 rounded-2xl text-sm font-medium text-slate-900 placeholder:text-slate-400 focus:outline-none focus:border-emerald-500 focus:ring-4 focus:ring-emerald-500/10 transition-all min-h-[100px] resize-none"
                        />
                    </div>

                    <AnimatePresence>
                        {showJdInput && (
                            <motion.div
                                initial={{ opacity: 0, height: 0 }}
                                animate={{ opacity: 1, height: 'auto' }}
                                exit={{ opacity: 0, height: 0 }}
                                className="overflow-hidden"
                            >
                                <label className="block text-[10px] font-black text-slate-400 uppercase tracking-widest mb-2 ml-1">Target Job Description (Optional)</label>
                                <textarea 
                                    value={localJobDescription}
                                    onChange={(e) => setLocalJobDescription(e.target.value)}
                                    placeholder="Paste job description here to tailor the optimization..."
                                    className="w-full p-4 bg-slate-50 border border-slate-200 rounded-2xl text-sm font-medium text-slate-900 placeholder:text-slate-400 focus:outline-none focus:border-emerald-500 focus:ring-4 focus:ring-emerald-500/10 transition-all min-h-[100px] resize-none"
                                />
                            </motion.div>
                        )}
                    </AnimatePresence>

                    <Tooltip content="Use AI to rewrite and enhance your text using strong action verbs and metrics" position="bottom">
                        <button 
                            onClick={handleOptimize}
                            disabled={isLoading || !input.trim()}
                            className="w-full py-4 bg-slate-900 text-white font-black uppercase tracking-widest text-[10px] rounded-2xl hover:bg-emerald-600 transition-all shadow-xl shadow-slate-200 flex items-center justify-center gap-2 active:scale-95 disabled:opacity-50 disabled:hover:bg-slate-900"
                        >
                            {isLoading ? (
                                <RefreshCw className="w-4 h-4 animate-spin" />
                            ) : (
                                <Sparkles className="w-4 h-4" />
                            )}
                            {isLoading ? 'Optimizing...' : localJobDescription.trim() ? 'Tailor & Optimize' : 'Optimize with AI'}
                        </button>
                    </Tooltip>
                </div>
            </div>

            <AnimatePresence mode="wait">
                {isLoading ? (
                    <motion.div
                        key="loading"
                        initial={{ opacity: 0, y: 20 }}
                        animate={{ opacity: 1, y: 0 }}
                        exit={{ opacity: 0, y: 20 }}
                        className="mt-6"
                    >
                        <AIProcessingState
                            title="Optimizing Bullet"
                            messages={[
                                "Analyzing impact...",
                                "Finding stronger action verbs...",
                                "Enhancing metrics formatting..."
                            ]}
                            color="emerald"
                        />
                    </motion.div>
                ) : output ? (
                    <motion.div 
                        key="output"
                        initial={{ opacity: 0, y: 20 }}
                        animate={{ opacity: 1, y: 0 }}
                        exit={{ opacity: 0, y: 20 }}
                        className="bg-emerald-50 border border-emerald-100 p-6 rounded-[2rem] relative group mt-6"
                    >
                        <div className="flex items-center justify-between mb-4">
                            <span className="text-[10px] font-black text-emerald-600 uppercase tracking-widest flex items-center gap-2">
                                <Sparkles className="w-3 h-3" />
                                {localJobDescription.trim() ? 'AI Tailored Version' : 'AI Optimized Version'}
                            </span>
                            <button 
                                onClick={handleCopy}
                                className="p-2 text-emerald-600 hover:bg-emerald-100 rounded-xl transition-all"
                                title="Copy to clipboard"
                            >
                                {copied ? <Check className="w-4 h-4" /> : <Copy className="w-4 h-4" />}
                            </button>
                        </div>
                        <p className="text-sm text-slate-800 font-bold leading-relaxed pr-8 italic">
                            "{output}"
                        </p>
                        
                        {reason && (
                            <div className="mt-4 p-3 bg-white/50 rounded-xl border border-emerald-100/50">
                                <p className="text-[10px] text-emerald-700 font-medium leading-relaxed">
                                    <span className="font-black uppercase mr-1">Rationale:</span>
                                    {reason}
                                </p>
                            </div>
                        )}
                        
                        <div className="mt-6 pt-4 border-t border-emerald-100/50 flex items-center gap-2">
                            <AlertCircle className="w-3.5 h-3.5 text-emerald-500" />
                            <p className="text-[10px] text-emerald-600 font-bold uppercase tracking-wider">
                                Pro Tip: Ensure you can back up these results in an interview.
                            </p>
                        </div>
                    </motion.div>
                ) : null}
            </AnimatePresence>
        </div>
    );
};

export default BulletOptimizer;
