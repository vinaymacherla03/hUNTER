import React, { useState, useEffect } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { Globe, Search, Database, Sparkles, Navigation, Network, Briefcase } from 'lucide-react';

const loadingSteps = [
  { text: "Connecting to global job network...", icon: <Network className="w-5 h-5 text-blue-500" /> },
  { text: "Scouring LinkedIn & Indeed...", icon: <Globe className="w-5 h-5 text-indigo-500" /> },
  { text: "Matching with your resume...", icon: <Database className="w-5 h-5 text-emerald-500" /> },
  { text: "Filtering out irrelevant roles...", icon: <Search className="w-5 h-5 text-amber-500" /> },
  { text: "Curating top opportunities...", icon: <Sparkles className="w-5 h-5 text-violet-500" /> }
];

export const JobSearchLoadingState: React.FC = () => {
    const [step, setStep] = useState(0);

    useEffect(() => {
        const interval = setInterval(() => {
            setStep((prev) => (prev < loadingSteps.length - 1 ? prev + 1 : prev));
        }, 1500);
        return () => clearInterval(interval);
    }, []);

    return (
        <div className="fixed inset-0 flex items-center justify-center bg-slate-50/80 backdrop-blur-md z-[100] overflow-hidden">
             
            <div className="relative flex flex-col items-center z-10 max-w-sm w-full mx-auto" style={{ perspective: '1000px' }}>
                <motion.div 
                    initial={{ opacity: 0, scale: 0.9, y: 20 }}
                    animate={{ opacity: 1, scale: 1, y: 0 }}
                    exit={{ opacity: 0, scale: 0.9, y: -20 }}
                    transition={{ duration: 0.5, ease: [0.23, 1, 0.32, 1] }}
                    className="p-8 bg-white/90 backdrop-blur-2xl border border-white/50 shadow-[0_40px_80px_rgba(0,0,0,0.1)] rounded-[2.5rem] w-full flex flex-col items-center relative overflow-hidden"
                >
                    <div className="absolute inset-0 bg-gradient-to-br from-blue-50/50 via-slate-50/30 to-indigo-50/50 pointer-events-none"></div>
                    
                    {/* Pulsing rings */}
                    <div className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 w-48 h-48 bg-blue-400/10 rounded-full blur-3xl animate-pulse" />
                    
                    <div className="w-16 h-16 rounded-2xl bg-gradient-to-br from-indigo-500 to-blue-600 flex items-center justify-center mb-6 shadow-xl shadow-blue-500/20 relative overflow-hidden">
                        <motion.div 
                            className="absolute inset-0 bg-gradient-to-r from-transparent via-white/30 to-transparent"
                            animate={{ x: ['-100%', '200%'] }}
                            transition={{ repeat: Infinity, duration: 2, ease: "linear" }}
                        />
                        <Briefcase className="w-8 h-8 text-white relative z-10" />
                        
                        {/* Orbiting element */}
                        <motion.div 
                            animate={{ rotate: 360 }}
                            transition={{ duration: 3, repeat: Infinity, ease: "linear" }}
                            className="absolute inset-0 border border-white/20 rounded-2xl"
                        />
                    </div>

                    <h3 className="text-[17px] font-bold text-slate-900 mb-6 font-display tracking-tight text-center">
                        Finding Perfect Matches
                    </h3>

                    <div className="h-10 w-full relative mb-4">
                        <AnimatePresence mode="wait">
                            <motion.div
                                key={step}
                                initial={{ opacity: 0, y: 10, filter: "blur(4px)" }}
                                animate={{ opacity: 1, y: 0, filter: "blur(0px)" }}
                                exit={{ opacity: 0, y: -10, filter: "blur(4px)" }}
                                transition={{ duration: 0.4 }}
                                className="absolute inset-0 flex items-center justify-center gap-3 text-slate-600"
                            >
                                <motion.div
                                    animate={{ scale: [1, 1.2, 1] }}
                                    transition={{ duration: 2, repeat: Infinity }}
                                >
                                    {loadingSteps[step].icon}
                                </motion.div>
                                <span className="text-center text-[14px] font-medium">{loadingSteps[step].text}</span>
                            </motion.div>
                        </AnimatePresence>
                    </div>

                    <div className="w-full h-1.5 bg-slate-100 rounded-full overflow-hidden mt-2">
                        <motion.div 
                            className="h-full bg-gradient-to-r from-indigo-500 via-blue-500 to-indigo-500 rounded-full"
                            initial={{ width: "0%" }}
                            animate={{ width: `${((step + 1) / loadingSteps.length) * 100}%` }}
                            transition={{ duration: 1.5, ease: "easeInOut" }}
                        />
                    </div>
                </motion.div>
            </div>
        </div>
    );
};
