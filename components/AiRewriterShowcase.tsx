
import React, { useState, useEffect } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import SparkleIcon from './icons/SparkleIcon';

const AiRewriterShowcase: React.FC = () => {
    const [state, setState] = useState<'original' | 'scanning' | 'rewritten'>('original');

    useEffect(() => {
        const sequence = async () => {
            while(true) {
                setState('original');
                await new Promise(r => setTimeout(r, 3000));
                setState('scanning');
                await new Promise(r => setTimeout(r, 2000));
                setState('rewritten');
                await new Promise(r => setTimeout(r, 5000));
            }
        };
        sequence();
    }, []);

    return (
        <div className="w-full h-full bg-white flex flex-col font-sans">
            {/* Editor Toolbar */}
            <div className="h-10 border-b border-slate-100 flex items-center px-4 justify-between bg-white shrink-0">
                <div className="flex gap-4 text-slate-300">
                    <div className="flex gap-1">
                        <div className="w-4 h-4 rounded bg-slate-100" />
                        <div className="w-4 h-4 rounded bg-slate-100" />
                        <div className="w-4 h-4 rounded bg-slate-100" />
                    </div>
                    <div className="w-px h-4 bg-slate-100" />
                    <div className="flex gap-1">
                        <div className="w-16 h-4 rounded bg-slate-100" />
                    </div>
                </div>
                <div className="flex items-center gap-2">
                    <span className="text-[10px] font-bold text-slate-300 uppercase tracking-wider">AI Assistant</span>
                    <div className={`w-2 h-2 rounded-full ${state === 'original' ? 'bg-slate-200' : 'bg-emerald-400 animate-pulse'}`} />
                </div>
            </div>

            {/* Document Body */}
            <div className="flex-1 p-8 relative overflow-hidden">
                <div className="max-w-md mx-auto">
                    <div className="h-4 w-1/3 bg-slate-200 rounded mb-6" />
                    
                    <div className="relative">
                        <AnimatePresence mode="wait">
                            {state === 'original' && (
                                <motion.div 
                                    key="original"
                                    initial={{ opacity: 0 }} animate={{ opacity: 1 }} exit={{ opacity: 0 }}
                                    className="space-y-3"
                                >
                                    <div className="flex gap-2 items-start">
                                        <div className="mt-1.5 w-1.5 h-1.5 rounded-full bg-slate-300 shrink-0" />
                                        <p className="text-sm text-slate-500 font-medium leading-relaxed">
                                            Managed a sales team of 5 people. We did good sales numbers last year.
                                        </p>
                                    </div>
                                    <div className="flex gap-2 items-start">
                                        <div className="mt-1.5 w-1.5 h-1.5 rounded-full bg-slate-300 shrink-0" />
                                        <p className="text-sm text-slate-500 font-medium leading-relaxed">
                                            Hired new employees and trained them on how to do the job.
                                        </p>
                                    </div>
                                </motion.div>
                            )}

                            {state === 'scanning' && (
                                <motion.div 
                                    key="scanning"
                                    initial={{ opacity: 0 }} animate={{ opacity: 1 }} exit={{ opacity: 0 }}
                                    className="space-y-3 relative"
                                >
                                    {/* Scanning Overlay */}
                                    <motion.div 
                                        className="absolute -left-4 -right-4 top-0 h-8 bg-blue-500/10 border-y border-blue-500/30 z-10 backdrop-blur-[1px]"
                                        animate={{ top: ['0%', '100%'] }}
                                        transition={{ duration: 1.5, ease: "linear" }}
                                    />
                                    
                                    <div className="flex gap-2 items-start opacity-50">
                                        <div className="mt-1.5 w-1.5 h-1.5 rounded-full bg-slate-300 shrink-0" />
                                        <p className="text-sm text-slate-500 font-medium leading-relaxed">
                                            Managed a sales team of 5 people. We did good sales numbers last year.
                                        </p>
                                    </div>
                                    <div className="flex gap-2 items-start opacity-50">
                                        <div className="mt-1.5 w-1.5 h-1.5 rounded-full bg-slate-300 shrink-0" />
                                        <p className="text-sm text-slate-500 font-medium leading-relaxed">
                                            Hired new employees and trained them on how to do the job.
                                        </p>
                                    </div>

                                    <motion.div 
                                        initial={{ opacity: 0, y: 10 }}
                                        animate={{ opacity: 1, y: 0 }}
                                        className="absolute bottom-0 left-0 right-0 flex justify-center"
                                    >
                                        <div className="bg-slate-900 text-white text-xs font-bold px-3 py-1.5 rounded-full flex items-center gap-2 shadow-lg">
                                            <SparkleIcon className="w-3 h-3" />
                                            Enhancing...
                                        </div>
                                    </motion.div>
                                </motion.div>
                            )}

                            {state === 'rewritten' && (
                                <motion.div 
                                    key="rewritten"
                                    initial={{ opacity: 0, scale: 0.98 }} 
                                    animate={{ opacity: 1, scale: 1 }}
                                    className="space-y-4"
                                >
                                    <div className="bg-blue-50/50 p-3 -m-3 rounded-lg border border-blue-100 transition-all">
                                        <div className="flex gap-2 items-start">
                                            <div className="mt-1.5 w-1.5 h-1.5 rounded-full bg-blue-500 shrink-0" />
                                            <p className="text-sm text-slate-800 leading-relaxed">
                                                <span className="bg-blue-100 text-blue-800 font-semibold px-1 rounded">Spearheaded</span> a high-performance sales team of 5, driving a <span className="bg-emerald-100 text-emerald-800 font-semibold px-1 rounded">45% revenue increase</span> YoY to exceed $2M targets.
                                            </p>
                                        </div>
                                    </div>
                                    <div className="bg-blue-50/50 p-3 -m-3 rounded-lg border border-blue-100 transition-all">
                                        <div className="flex gap-2 items-start">
                                            <div className="mt-1.5 w-1.5 h-1.5 rounded-full bg-blue-500 shrink-0" />
                                            <p className="text-sm text-slate-800 leading-relaxed">
                                                Recruited and onboarded 8 new hires, implementing a standardized training program that reduced ramp-up time by <span className="bg-emerald-100 text-emerald-800 font-semibold px-1 rounded">30%</span>.
                                            </p>
                                        </div>
                                    </div>

                                    <motion.div 
                                        initial={{ scale: 0, rotate: -10 }}
                                        animate={{ scale: 1, rotate: 0 }}
                                        transition={{ delay: 0.3, type: "spring" }}
                                        className="absolute -right-2 -bottom-2"
                                    >
                                        <div className="bg-white border-2 border-emerald-500 text-emerald-600 px-3 py-1 rounded-lg shadow-lg font-bold text-xs flex items-center gap-1">
                                            <svg xmlns="http://www.w3.org/2000/svg" className="h-4 w-4" viewBox="0 0 20 20" fill="currentColor"><path fillRule="evenodd" d="M10 18a8 8 0 100-16 8 8 0 000 16zm3.707-9.293a1 1 0 00-1.414-1.414L9 10.586 7.707 9.293a1 1 0 00-1.414 1.414l2 2a1 1 0 001.414 0l4-4z" clipRule="evenodd" /></svg>
                                            Impact Optimized
                                        </div>
                                    </motion.div>
                                </motion.div>
                            )}
                        </AnimatePresence>
                    </div>
                </div>
            </div>
        </div>
    );
};

export default AiRewriterShowcase;
