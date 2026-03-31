
import React, { useState, useRef } from 'react';
import { motion, useSpring, useMotionValue, useTransform, AnimatePresence } from 'framer-motion';

type Module = 'optimizer' | 'pipeline' | 'intelligence';

const GlassCard = ({ children, className, style }: { children?: React.ReactNode; className?: string; style?: any }) => (
    <div 
        className={`bg-white/90 backdrop-blur-3xl border border-white shadow-[0_40px_100px_-20px_rgba(0,0,0,0.15)] rounded-[2.5rem] ${className}`}
        style={style}
    >
        {children}
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
                                            <h3 className="text-xl sm:text-3xl font-black text-slate-900 tracking-tighter">Career Score</h3>
                                            <p className="text-[10px] sm:text-sm font-bold text-slate-400 uppercase tracking-widest mt-1">Profile Integrity</p>
                                        </div>
                                        <div className="w-12 h-12 sm:w-16 sm:h-16 rounded-xl sm:rounded-2xl bg-emerald-50 border border-emerald-100 flex items-center justify-center">
                                            <span className="text-xl sm:text-2xl font-black text-emerald-600">92</span>
                                        </div>
                                    </div>
                                    
                                    <div className="space-y-4 sm:space-y-6 flex-1">
                                        <div className="p-4 sm:p-5 bg-slate-50 rounded-2xl sm:rounded-3xl border border-slate-100 shadow-inner">
                                            <div className="flex justify-between mb-2">
                                                <span className="text-[8px] sm:text-[10px] font-black text-slate-400 uppercase">Impact Quantified</span>
                                                <span className="text-[8px] sm:text-[10px] font-black text-emerald-500">OPTIMAL</span>
                                            </div>
                                            <div className="h-2 w-full bg-slate-200 rounded-full overflow-hidden">
                                                <motion.div initial={{ width: 0 }} animate={{ width: '85%' }} className="h-full bg-emerald-500 shadow-[0_0_10px_rgba(16,185,129,0.5)]" />
                                            </div>
                                        </div>
                                        <div className="grid grid-cols-2 gap-3 sm:gap-4">
                                            <div className="p-3 sm:p-4 bg-white rounded-xl sm:rounded-2xl border border-slate-100 shadow-sm text-center sm:text-left">
                                                <p className="text-[8px] sm:text-[9px] font-bold text-slate-400 uppercase mb-1">Keywords</p>
                                                <p className="text-base sm:text-xl font-black text-slate-900 tracking-tight">48/50</p>
                                            </div>
                                            <div className="p-3 sm:p-4 bg-white rounded-xl sm:rounded-2xl border border-slate-100 shadow-sm text-center sm:text-left">
                                                <p className="text-[8px] sm:text-[9px] font-bold text-slate-400 uppercase mb-1">Readability</p>
                                                <p className="text-base sm:text-xl font-black text-slate-900 tracking-tight">Grade 9</p>
                                            </div>
                                        </div>
                                    </div>
                                </motion.div>
                            )}

                            {activeTab === 'pipeline' && (
                                <motion.div key="pipe" {...tabVariants} transition={{ duration: 0.5 }} className="h-full flex flex-col">
                                    <h3 className="text-xl sm:text-2xl font-black text-slate-900 tracking-tighter mb-4 sm:mb-6">Active Pipeline</h3>
                                    <div className="space-y-3 sm:space-y-4">
                                        {[
                                            { co: 'Stripe', role: 'Staff Designer', status: 'Final', color: 'blue' },
                                            { co: 'Linear', role: 'Product Architect', status: 'Offer', color: 'emerald' },
                                            { co: 'Airbnb', role: 'Sr. PM', status: 'Tech', color: 'indigo' }
                                        ].map((job, i) => (
                                            <div key={i} className="flex items-center justify-between p-3 sm:p-4 bg-slate-50 rounded-xl sm:rounded-2xl border border-slate-100 group/item hover:bg-white transition-all">
                                                <div className="flex items-center gap-2 sm:gap-3">
                                                    <div className={`w-8 h-8 sm:w-10 sm:h-10 rounded-lg sm:rounded-xl bg-white border border-slate-100 flex items-center justify-center p-1.5`}>
                                                        <img 
                                                            src={`https://logo.clearbit.com/${job.co.toLowerCase()}.com`} 
                                                            className="w-full h-full object-contain grayscale group-hover/item:grayscale-0 transition-all" 
                                                            referrerPolicy="no-referrer"
                                                            onError={(e) => {
                                                                (e.target as HTMLImageElement).src = `https://ui-avatars.com/api/?name=${encodeURIComponent(job.co)}&background=f8fafc&color=64748b&bold=true`;
                                                            }}
                                                        />
                                                    </div>
                                                    <div>
                                                        <p className="text-[10px] sm:text-xs font-black text-slate-900">{job.co}</p>
                                                        <p className="text-[8px] sm:text-[9px] font-bold text-slate-400 uppercase">{job.role}</p>
                                                    </div>
                                                </div>
                                                <div className={`px-2 py-0.5 sm:py-1 rounded-md sm:rounded-lg text-[7px] sm:text-[8px] font-black uppercase border ${
                                                    job.color === 'emerald' ? 'bg-emerald-50 text-emerald-600 border-emerald-100' : 'bg-teal-50 text-teal-600 border-teal-100'
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
                                    <h3 className="text-xl sm:text-2xl font-black text-slate-900 tracking-tighter mb-1">Market IQ</h3>
                                    <p className="text-[10px] sm:text-xs font-bold text-slate-400 uppercase tracking-widest mb-6 sm:mb-8 text-center sm:text-left">Benchmarking</p>
                                    
                                    <div className="flex-1 flex flex-col items-center justify-center gap-6 sm:gap-8">
                                        <div className="relative w-32 h-32 sm:w-40 sm:h-40">
                                            <svg className="w-full h-full -rotate-90" viewBox="0 0 100 100">
                                                <circle cx="50" cy="50" r="45" fill="none" stroke="#f1f5f9" strokeWidth="8" />
                                                <motion.circle cx="50" cy="50" r="45" fill="none" stroke="#10b981" strokeWidth="8" strokeLinecap="round" strokeDasharray="282.7" initial={{ strokeDashoffset: 282.7 }} animate={{ strokeDashoffset: 282.7 * 0.2 }} transition={{ duration: 1.5, delay: 0.2 }} />
                                            </svg>
                                            <div className="absolute inset-0 flex flex-col items-center justify-center">
                                                <span className="text-lg sm:text-2xl font-black text-slate-900">$215k</span>
                                                <span className="text-[7px] sm:text-[8px] font-bold text-slate-400 uppercase tracking-tighter">Avg. Salary</span>
                                            </div>
                                        </div>
                                        <div className="w-full grid grid-cols-2 gap-2 sm:gap-3">
                                            {['AI Strategy', 'Product Growth', 'Systems', 'Led Teams'].map(skill => (
                                                <div key={skill} className="px-2 sm:px-3 py-2 bg-slate-50 border border-slate-100 rounded-lg sm:rounded-xl text-[8px] sm:text-[9px] font-black text-slate-500 text-center uppercase tracking-tighter hover:text-emerald-600 transition-colors">
                                                    {skill}
                                                </div>
                                            ))}
                                        </div>
                                    </div>
                                </motion.div>
                            )}
                        </AnimatePresence>
                    </div>

                    <div className="pt-6 sm:pt-8 border-t border-slate-100">
                        <button className="w-full py-3 sm:py-4 bg-slate-900 text-white rounded-xl sm:rounded-2xl font-black text-[8px] sm:text-[10px] uppercase tracking-[0.2em] shadow-xl shadow-slate-900/20 active:scale-95 transition-all">
                            Enter Command Center
                        </button>
                    </div>
                </GlassCard>

                {/* Floating Micro-UI Decoration - Scaled down for mobile */}
                <motion.div 
                    style={{ translateZ: 120, x: useTransform(x, v => v * (isMobile ? 50 : 150)), y: useTransform(y, v => v * (isMobile ? 50 : 150)) }}
                    className="absolute -right-10 sm:-right-20 top-1/4 sm:top-1/3"
                >
                    <div className="px-4 py-3 sm:px-6 sm:py-4 bg-white shadow-2xl rounded-xl sm:rounded-2xl border border-slate-100 flex items-center gap-2 sm:gap-4">
                        <div className="w-6 h-6 sm:w-8 sm:h-8 rounded-lg bg-emerald-500 flex items-center justify-center text-white">
                            <svg className="w-3 h-3 sm:w-4 sm:h-4" fill="none" viewBox="0 0 24 24" stroke="currentColor"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={3} d="M5 13l4 4L19 7" /></svg>
                        </div>
                        <span className="text-[9px] sm:text-xs font-black text-slate-900 tracking-tight whitespace-nowrap">ATS-Verified</span>
                    </div>
                </motion.div>
            </motion.div>
        </div>
    );
};

export default Hero3D;
