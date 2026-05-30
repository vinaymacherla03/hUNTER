
import React, { useState, useRef } from 'react';
import { motion, useSpring, useMotionValue, useTransform, AnimatePresence } from 'framer-motion';

type Module = 'optimizer' | 'pipeline' | 'intelligence';

const GlassCard = ({ children, className, style }: { children?: React.ReactNode; className?: string; style?: any }) => (
    <div 
        className={`bg-slate-900/90 backdrop-blur-2xl border border-slate-700/50 shadow-[0_40px_80px_-20px_rgba(0,0,0,0.5),inset_0_1px_0_rgba(255,255,255,0.1)] rounded-[2.5rem] overflow-hidden ${className}`}
        style={style}
    >
        <div className="absolute inset-0 bg-gradient-to-br from-white/5 to-white/0 pointer-events-none" />
        <div className="relative z-10 h-full flex flex-col">
            {children}
        </div>
    </div>
);

const Hero3D = () => {
    const [activeTab, setActiveTab] = useState<Module>('optimizer');
    const ref = useRef<HTMLDivElement>(null);
    const x = useMotionValue(0);
    const y = useMotionValue(0);

    const isMobile = typeof window !== 'undefined' && window.innerWidth < 1024;

    const rotateX = useSpring(useTransform(y, [-0.5, 0.5], [isMobile ? 5 : 10, isMobile ? -5 : -10]), { stiffness: 100, damping: 30 });
    const rotateY = useSpring(useTransform(x, [-0.5, 0.5], [isMobile ? -5 : -10, isMobile ? 5 : 10]), { stiffness: 100, damping: 30 });

    const handleMouseMove = (e: React.MouseEvent) => {
        const rect = ref.current?.getBoundingClientRect();
        if (!rect) return;
        x.set((e.clientX - rect.left) / rect.width - 0.5);
        y.set((e.clientY - rect.top) / rect.height - 0.5);
    };

    const handleMouseLeave = () => {
        x.set(0);
        y.set(0);
    };

    const tabVariants = {
        initial: { opacity: 0, rotateY: 90, scale: 0.9 },
        animate: { opacity: 1, rotateY: 0, scale: 1 },
        exit: { opacity: 0, rotateY: -90, scale: 0.9 }
    };

    return (
        <div 
            ref={ref}
            onMouseMove={handleMouseMove}
            onMouseLeave={handleMouseLeave}
            className="w-full h-full flex items-center justify-center perspective-2000"
        >
            <motion.div
                style={{ rotateX, rotateY, transformStyle: "preserve-3d" }}
                className="relative w-[300px] sm:w-[480px] h-[480px] sm:h-[580px]"
            >
                {/* 3D Tab Controller */}
                <motion.div 
                    style={{ translateZ: 80 }}
                    className="absolute -top-4 sm:-top-6 left-1/2 -translate-x-1/2 z-30 flex bg-slate-900/95 backdrop-blur-xl p-1 sm:p-1.5 rounded-xl sm:rounded-2xl shadow-2xl border border-white/10 w-[95%] sm:w-[90%]"
                >
                    {(['optimizer', 'pipeline', 'intelligence'] as Module[]).map((tab) => (
                        <button
                            key={tab}
                            onClick={() => setActiveTab(tab)}
                            className={`relative flex-1 py-2 sm:py-2.5 text-[8px] sm:text-[10px] font-black uppercase tracking-widest transition-all duration-300 rounded-lg sm:rounded-xl ${
                                activeTab === tab ? 'text-white' : 'text-slate-500 hover:text-slate-300'
                            }`}
                        >
                            {activeTab === tab && (
                                <motion.div 
                                    layoutId="activeTab" 
                                    className="absolute inset-0 bg-emerald-500 rounded-lg sm:rounded-xl shadow-[0_0_20px_rgba(16,185,129,0.4)]"
                                    transition={{ type: "spring", bounce: 0.2, duration: 0.6 }}
                                />
                            )}
                            <span className="relative z-10">{tab}</span>
                        </button>
                    ))}
                </motion.div>

                {/* Main Dashboard UI */}
                <GlassCard className="absolute inset-0 p-6 sm:p-10 flex flex-col overflow-hidden">
                    <div className="flex-1 mt-6">
                        <AnimatePresence mode="wait">
                            {activeTab === 'optimizer' && (
                                <motion.div key="opt" {...tabVariants} transition={{ duration: 0.5 }} className="h-full flex flex-col">
                                    <div className="flex justify-between items-start mb-6 sm:mb-8">
                                        <div>
                                            <h3 className="text-xl sm:text-3xl font-black text-white tracking-tighter">Career Score</h3>
                                            <p className="text-[10px] sm:text-sm font-bold text-slate-400 uppercase tracking-widest mt-1">Profile Integrity</p>
                                        </div>
                                        <div className="w-12 h-12 sm:w-16 sm:h-16 rounded-xl sm:rounded-2xl bg-emerald-500/10 border border-emerald-500/20 flex items-center justify-center">
                                            <span className="text-xl sm:text-2xl font-black text-emerald-400">92</span>
                                        </div>
                                    </div>
                                    
                                    <div className="space-y-4 sm:space-y-6 flex-1">
                                        <div className="p-4 sm:p-5 bg-slate-800/50 rounded-2xl sm:rounded-3xl border border-slate-700/50 shadow-inner">
                                            <div className="flex justify-between mb-2">
                                                <span className="text-[8px] sm:text-[10px] font-black text-slate-400 uppercase">Impact Quantified</span>
                                                <span className="text-[8px] sm:text-[10px] font-black text-emerald-400">OPTIMAL</span>
                                            </div>
                                            <div className="h-2 w-full bg-slate-900 rounded-full overflow-hidden">
                                                <motion.div initial={{ width: 0 }} animate={{ width: '85%' }} className="h-full bg-emerald-500 shadow-[0_0_10px_rgba(16,185,129,0.5)]" />
                                            </div>
                                        </div>
                                        <div className="grid grid-cols-2 gap-3 sm:gap-4">
                                            <div className="p-3 sm:p-4 bg-slate-800/50 rounded-xl sm:rounded-2xl border border-slate-700/50 shadow-sm text-center sm:text-left">
                                                <p className="text-[8px] sm:text-[9px] font-bold text-slate-400 uppercase mb-1">Keywords</p>
                                                <p className="text-base sm:text-xl font-black text-white tracking-tight">48/50</p>
                                            </div>
                                            <div className="p-3 sm:p-4 bg-slate-800/50 rounded-xl sm:rounded-2xl border border-slate-700/50 shadow-sm text-center sm:text-left">
                                                <p className="text-[8px] sm:text-[9px] font-bold text-slate-400 uppercase mb-1">Readability</p>
                                                <p className="text-base sm:text-xl font-black text-white tracking-tight">Grade 9</p>
                                            </div>
                                        </div>
                                    </div>
                                </motion.div>
                            )}

                            {activeTab === 'pipeline' && (
                                <motion.div key="pipe" {...tabVariants} transition={{ duration: 0.5 }} className="h-full flex flex-col">
                                    <h3 className="text-xl sm:text-2xl font-black text-white tracking-tighter mb-4 sm:mb-6">Active Pipeline</h3>
                                    <div className="space-y-3 sm:space-y-4">
                                        {[
                                            { co: 'Stripe', role: 'Staff Designer', status: 'Final', color: 'blue' },
                                            { co: 'Linear', role: 'Product Architect', status: 'Offer', color: 'emerald' },
                                            { co: 'Airbnb', role: 'Sr. PM', status: 'Tech', color: 'indigo' }
                                        ].map((job, i) => (
                                            <div key={i} className="flex items-center justify-between p-3 sm:p-4 bg-slate-800/50 rounded-xl sm:rounded-2xl border border-slate-700/50 group/item hover:bg-slate-800 transition-all">
                                                <div className="flex items-center gap-2 sm:gap-3">
                                                    <div className={`w-8 h-8 sm:w-10 sm:h-10 rounded-lg sm:rounded-xl bg-slate-900 border border-slate-700 flex items-center justify-center p-1.5`}>
                                                        <img 
                                                            src={`https://logo.clearbit.com/${job.co.toLowerCase()}.com`} 
                                                            className="w-full h-full object-contain grayscale group-hover/item:grayscale-0 transition-all" 
                                                            referrerPolicy="no-referrer"
                                                            onError={(e) => {
                                                                (e.target as HTMLImageElement).src = `https://ui-avatars.com/api/?name=${encodeURIComponent(job.co)}&background=0f172a&color=94a3b8&bold=true`;
                                                            }}
                                                        />
                                                    </div>
                                                    <div>
                                                        <p className="text-[10px] sm:text-xs font-black text-white">{job.co}</p>
                                                        <p className="text-[8px] sm:text-[9px] font-bold text-slate-400 uppercase">{job.role}</p>
                                                    </div>
                                                </div>
                                                <div className={`px-2 py-0.5 sm:py-1 rounded-md sm:rounded-lg text-[7px] sm:text-[8px] font-black uppercase border ${
                                                    job.color === 'emerald' ? 'bg-emerald-500/10 text-emerald-400 border-emerald-500/20' : 'bg-emerald-500/10 text-emerald-400 border-emerald-500/20'
                                                }`}>
                                                    {job.status}
                                                </div>
                                            </div>
                                        ))}
                                    </div>
                                </motion.div>
                            )}

                            {activeTab === 'intelligence' && (
                                <motion.div key="intel" {...tabVariants} transition={{ duration: 0.5 }} className="h-full flex flex-col">
                                    <div className="flex justify-between items-start mb-6 sm:mb-8">
                                        <div>
                                            <h3 className="text-xl sm:text-2xl font-black text-white tracking-tighter mb-1">Market IQ</h3>
                                            <p className="text-[10px] sm:text-xs font-bold text-slate-400 uppercase tracking-widest">Benchmarking</p>
                                        </div>
                                        <div className="w-8 h-8 sm:w-10 sm:h-10 rounded-full bg-emerald-500/10 border border-emerald-500/20 flex items-center justify-center">
                                            <svg className="w-4 h-4 sm:w-5 sm:h-5 text-emerald-400" fill="none" viewBox="0 0 24 24" stroke="currentColor"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M13 7h8m0 0v8m0-8l-8 8-4-4-6 6" /></svg>
                                        </div>
                                    </div>
                                    
                                    <div className="flex-1 flex flex-col items-center justify-center gap-6 sm:gap-8 relative">
                                        {/* Subtle background grid */}
                                        <div className="absolute inset-0 bg-[url('data:image/svg+xml;base64,PHN2ZyB3aWR0aD0iMjAiIGhlaWdodD0iMjAiIHhtbG5zPSJodHRwOi8vd3d3LnczLm9yZy8yMDAwL3N2ZyI+PGNpcmNsZSBjeD0iMSIgY3k9IjEiIHI9IjEiIGZpbGw9IiMzMzQxNTUiLz48L3N2Zz4=')] [mask-image:radial-gradient(ellipse_at_center,black,transparent_70%)] opacity-30 pointer-events-none" />
                                        
                                        <div className="relative w-36 h-36 sm:w-48 sm:h-48 flex items-center justify-center">
                                            <div className="absolute inset-0 rounded-full shadow-[inset_0_0_20px_rgba(0,0,0,0.2)] border border-slate-700/50" />
                                            <svg className="w-full h-full -rotate-90 drop-shadow-xl" viewBox="0 0 100 100">
                                                <defs>
                                                    <linearGradient id="progressGradient" x1="0%" y1="0%" x2="100%" y2="100%">
                                                        <stop offset="0%" stopColor="#34d399" />
                                                        <stop offset="100%" stopColor="#059669" />
                                                    </linearGradient>
                                                    <filter id="glow">
                                                        <feGaussianBlur stdDeviation="2" result="coloredBlur"/>
                                                        <feMerge>
                                                            <feMergeNode in="coloredBlur"/>
                                                            <feMergeNode in="SourceGraphic"/>
                                                        </feMerge>
                                                    </filter>
                                                </defs>
                                                <circle cx="50" cy="50" r="42" fill="none" stroke="#1e293b" strokeWidth="8" />
                                                <motion.circle 
                                                    cx="50" cy="50" r="42" 
                                                    fill="none" 
                                                    stroke="url(#progressGradient)" 
                                                    strokeWidth="8" 
                                                    strokeLinecap="round" 
                                                    strokeDasharray="263.89" 
                                                    initial={{ strokeDashoffset: 263.89 }} 
                                                    animate={{ strokeDashoffset: 263.89 * 0.15 }} 
                                                    transition={{ duration: 2, ease: "easeOut", delay: 0.2 }} 
                                                    filter="url(#glow)"
                                                />
                                            </svg>
                                            <div className="absolute inset-0 flex flex-col items-center justify-center bg-slate-900/50 backdrop-blur-sm rounded-full m-4 shadow-sm border border-white/10">
                                                <span className="text-2xl sm:text-4xl font-black text-white tracking-tighter">$215k</span>
                                                <span className="text-[8px] sm:text-[9px] font-bold text-slate-400 uppercase tracking-widest mt-1">Avg. Salary</span>
                                            </div>
                                        </div>
                                        <div className="w-full grid grid-cols-2 gap-2 sm:gap-3 relative z-10">
                                            {[
                                                { name: 'AI Strategy', icon: '🧠' },
                                                { name: 'Product Growth', icon: '📈' },
                                                { name: 'Systems', icon: '⚙️' },
                                                { name: 'Led Teams', icon: '👥' }
                                            ].map(skill => (
                                                <div key={skill.name} className="flex items-center gap-2 px-3 sm:px-4 py-2.5 sm:py-3 bg-slate-800/80 border border-slate-700 rounded-xl sm:rounded-2xl shadow-sm hover:shadow-md hover:border-emerald-500/50 transition-all group cursor-default">
                                                    <span className="text-xs sm:text-sm grayscale group-hover:grayscale-0 transition-all">{skill.icon}</span>
                                                    <span className="text-[9px] sm:text-[10px] font-bold text-slate-300 uppercase tracking-tight group-hover:text-emerald-400 transition-colors">{skill.name}</span>
                                                </div>
                                            ))}
                                        </div>
                                    </div>
                                </motion.div>
                            )}
                        </AnimatePresence>
                    </div>

                    <div className="pt-6 sm:pt-8 border-t border-slate-100/50 mt-auto relative z-10">
                        <button className="w-full py-3 sm:py-4 bg-gradient-to-b from-slate-800 to-slate-950 text-white rounded-xl sm:rounded-2xl font-black text-[9px] sm:text-[11px] uppercase tracking-[0.2em] shadow-[0_10px_20px_-10px_rgba(15,23,42,0.5),inset_0_1px_0_rgba(255,255,255,0.1)] hover:shadow-[0_15px_25px_-10px_rgba(15,23,42,0.6),inset_0_1px_0_rgba(255,255,255,0.2)] active:scale-[0.98] transition-all flex items-center justify-center gap-2 group">
                            <span>Enter Command Center</span>
                            <svg className="w-3 h-3 sm:w-4 sm:h-4 opacity-50 group-hover:opacity-100 group-hover:translate-x-1 transition-all" fill="none" viewBox="0 0 24 24" stroke="currentColor"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M14 5l7 7m0 0l-7 7m7-7H3" /></svg>
                        </button>
                    </div>
                </GlassCard>

                {/* Floating Micro-UI Decoration - Scaled down for mobile */}
                <motion.div 
                    style={{ translateZ: 120, x: useTransform(x, v => v * (isMobile ? 50 : 150)), y: useTransform(y, v => v * (isMobile ? 50 : 150)) }}
                    className="absolute -right-10 sm:-right-20 top-1/4 sm:top-1/3"
                >
                    <div className="px-4 py-3 sm:px-6 sm:py-4 bg-slate-900/90 backdrop-blur-2xl shadow-[0_30px_60px_-15px_rgba(0,0,0,0.5),inset_0_1px_0_rgba(255,255,255,0.1)] rounded-xl sm:rounded-2xl border border-white/10 flex items-center gap-2 sm:gap-4">
                        <div className="w-6 h-6 sm:w-8 sm:h-8 rounded-lg bg-emerald-500 flex items-center justify-center text-white shadow-inner">
                            <svg className="w-3 h-3 sm:w-4 sm:h-4" fill="none" viewBox="0 0 24 24" stroke="currentColor"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={3} d="M5 13l4 4L19 7" /></svg>
                        </div>
                        <span className="text-[9px] sm:text-xs font-black text-white tracking-tight whitespace-nowrap">ATS-Verified</span>
                    </div>
                </motion.div>
            </motion.div>
        </div>
    );
};

export default Hero3D;
