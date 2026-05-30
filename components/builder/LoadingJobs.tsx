import React, { useState, useEffect } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { Briefcase, Search, Sparkles, LayoutPanelTop, LayoutDashboard } from 'lucide-react';

const loadingSteps = [
  { text: "Connecting to database...", icon: <Briefcase className="w-5 h-5" /> },
  { text: "Fetching your job applications...", icon: <Search className="w-5 h-5" /> },
  { text: "Organizing kanban board...", icon: <LayoutPanelTop className="w-5 h-5" /> },
  { text: "Applying UI enhancements...", icon: <Sparkles className="w-5 h-5" /> },
  { text: "Almost ready...", icon: <LayoutDashboard className="w-5 h-5" /> }
];

export const LoadingJobs: React.FC = () => {
    const [step, setStep] = useState(0);

    useEffect(() => {
        const interval = setInterval(() => {
            setStep((prev) => (prev < loadingSteps.length - 1 ? prev + 1 : prev));
        }, 800);
        return () => clearInterval(interval);
    }, []);

    return (
        <div className="absolute inset-0 flex items-center justify-center bg-transparent z-50 overflow-hidden">
             
            <div className="relative flex flex-col items-center z-10 max-w-sm w-full mx-auto" style={{ perspective: '1000px' }}>
                <motion.div 
                    initial={{ opacity: 0, scale: 0.8, rotateX: 20 }}
                    animate={{ opacity: 1, scale: 1, rotateX: 0 }}
                    transition={{ duration: 0.5, ease: "easeOut" }}
                    className="p-8 bg-white/80 backdrop-blur-xl border border-white shadow-[0_20px_40px_rgb(0,0,0,0.08)] rounded-[2rem] w-full flex flex-col items-center relative overflow-hidden"
                >
                    <div className="absolute inset-0 bg-gradient-to-br from-emerald-50/50 via-white/20 to-teal-50/50 pointer-events-none"></div>
                    
                    <div className="w-16 h-16 rounded-2xl bg-gradient-to-br from-emerald-100 to-teal-100 flex items-center justify-center mb-6 shadow-inner relative overflow-hidden">
                        <motion.div 
                            className="absolute inset-0 bg-gradient-to-r from-transparent via-white/50 to-transparent"
                            animate={{ x: ['-100%', '200%'] }}
                            transition={{ repeat: Infinity, duration: 1.5, ease: "linear" }}
                        />
                        <Briefcase className="w-8 h-8 text-emerald-600 relative z-10" />
                    </div>

                    <div className="h-10 w-full relative mb-2">
                        <AnimatePresence mode="wait">
                            <motion.div
                                key={step}
                                initial={{ opacity: 0, y: 15, rotateX: -45 }}
                                animate={{ opacity: 1, y: 0, rotateX: 0 }}
                                exit={{ opacity: 0, y: -15, rotateX: 45 }}
                                transition={{ duration: 0.4 }}
                                className="absolute inset-0 flex items-center justify-center gap-3 text-slate-700 font-semibold"
                            >
                                <span className="text-emerald-500">
                                    {loadingSteps[step].icon}
                                </span>
                                <span className="text-center text-[15px]">{loadingSteps[step].text}</span>
                            </motion.div>
                        </AnimatePresence>
                    </div>

                    <div className="w-48 h-1.5 bg-slate-100 rounded-full overflow-hidden shrink-0 mt-4">
                        <motion.div 
                            className="h-full bg-gradient-to-r from-emerald-400 to-teal-500 rounded-full"
                            initial={{ width: "0%" }}
                            animate={{ width: `${((step + 1) / loadingSteps.length) * 100}%` }}
                            transition={{ duration: 0.5, ease: "easeOut" }}
                        />
                    </div>
                </motion.div>
            </div>
        </div>
    );
};
