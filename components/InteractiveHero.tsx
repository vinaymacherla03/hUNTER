import React, { useState, useRef } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
// @ts-ignore
import mammoth from 'mammoth';
// @ts-ignore
import * as pdfjsLib from 'pdfjs-dist';

// Set worker for PDF.js
const pdfjs: any = pdfjsLib;
try {
    if (pdfjs.GlobalWorkerOptions) {
        pdfjs.GlobalWorkerOptions.workerSrc = 'https://cdn.jsdelivr.net/npm/pdfjs-dist@3.11.174/build/pdf.worker.min.js';
    }
} catch (e) {
    console.warn("Failed to set PDF worker", e);
}

interface HeroProps {
  onGetStarted: () => void;
  onEnhance: (resumeText: string, jobDescription: string, jobTitle: string) => void;
}

const Hero: React.FC<HeroProps> = ({ onGetStarted, onEnhance }) => {
    const [isDragging, setIsDragging] = useState(false);
    const [error, setError] = useState<string | null>(null);
    const fileInputRef = useRef<HTMLInputElement>(null);
    
    const triggerFileSelect = () => fileInputRef.current?.click();

    const processFile = async (file: File) => {
        setError(null);
        try {
            const reader = new FileReader();
            reader.onload = async (e) => {
                const text = e.target?.result as string;
                onEnhance(text, '', '');
            };
            reader.readAsText(file);
        } catch (err: any) {
             setError("Failed to read file. Please try copy-pasting.");
        }
    };

    const handleDrop = (e: React.DragEvent) => {
      e.preventDefault();
      setIsDragging(false);
      if (e.dataTransfer.files && e.dataTransfer.files[0]) {
          processFile(e.dataTransfer.files[0]);
      }
    };

    return (
        <section className="relative bg-slate-900 pt-32 pb-24 lg:pt-48 lg:pb-40 overflow-hidden">
            {/* Elegant Background Patterns */}
            <div className="absolute inset-0 z-0">
                <div className="absolute top-0 left-1/4 w-[500px] h-[500px] bg-blue-600/10 rounded-full blur-[120px]" />
                <div className="absolute bottom-0 right-1/4 w-[400px] h-[400px] bg-violet-600/10 rounded-full blur-[100px]" />
                <div className="absolute inset-0 bg-[url('https://grainy-gradients.vercel.app/noise.svg')] opacity-[0.03] mix-blend-overlay" />
            </div>

            <div className="container mx-auto px-6 relative z-10">
                <div className="max-w-4xl mx-auto text-center">
                    <motion.div
                        initial={{ opacity: 0, y: 20 }}
                        animate={{ opacity: 1, y: 0 }}
                        transition={{ duration: 0.6 }}
                        className="inline-flex items-center gap-2 px-3 py-1 rounded-full bg-blue-500/10 border border-blue-500/20 text-blue-400 text-xs font-bold uppercase tracking-widest mb-6"
                    >
                        <span className="relative flex h-2 w-2">
                          <span className="animate-ping absolute inline-flex h-full w-full rounded-full bg-blue-400 opacity-75"></span>
                          <span className="relative inline-flex rounded-full h-2 w-2 bg-blue-500"></span>
                        </span>
                        Exclusive Career Intelligence
                    </motion.div>

                    <motion.h1 
                        initial={{ opacity: 0, y: 20 }} 
                        animate={{ opacity: 1, y: 0 }} 
                        transition={{ duration: 0.6, delay: 0.1 }}
                        className="text-5xl md:text-7xl font-display font-black text-white leading-[1.1] tracking-tight"
                    >
                        Access the Hidden <br />
                        <span className="text-transparent bg-clip-text bg-gradient-to-r from-blue-400 to-indigo-300">Job Market.</span>
                    </motion.h1>

                    <motion.p 
                        initial={{ opacity: 0, y: 20 }} 
                        animate={{ opacity: 1, y: 0 }} 
                        transition={{ duration: 0.6, delay: 0.2 }}
                        className="mt-8 max-w-2xl mx-auto text-lg md:text-xl text-slate-400 font-medium leading-relaxed"
                    >
                        HuntDesk combines elite career research with proprietary AI to position you for the top 5% of roles. Stop searching, start being discovered.
                    </motion.p>
                </div>
                
                <motion.div 
                    initial={{ opacity: 0, y: 30 }} 
                    animate={{ opacity: 1, y: 0 }} 
                    transition={{ duration: 0.8, delay: 0.3 }}
                    className="mt-12 max-w-5xl mx-auto"
                >
                    <div className="bg-white/5 backdrop-blur-xl p-2 rounded-2xl border border-white/10 shadow-2xl">
                        <div className="flex flex-col md:flex-row items-center gap-2">
                            <div className="flex-1 w-full relative">
                                <div className="absolute inset-y-0 left-4 flex items-center pointer-events-none text-slate-500">
                                    <svg className="w-5 h-5" fill="none" viewBox="0 0 24 24" stroke="currentColor"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M21 21l-6-6m2-5a7 7 0 11-14 0 7 7 0 0114 0z" /></svg>
                                </div>
                                <input 
                                    type="text" 
                                    placeholder="Search target role (e.g. Director of Engineering)" 
                                    className="w-full pl-12 pr-4 py-5 bg-white rounded-xl text-slate-900 font-bold focus:outline-none focus:ring-4 focus:ring-blue-500/20 transition-all placeholder:text-slate-400"
                                />
                            </div>
                            <div className="w-full md:w-48 relative">
                                <div className="absolute inset-y-0 left-4 flex items-center pointer-events-none text-slate-500">
                                    <span className="font-bold text-sm">$</span>
                                </div>
                                <input 
                                    type="text" 
                                    placeholder="Min Salary" 
                                    className="w-full pl-10 pr-4 py-5 bg-white rounded-xl text-slate-900 font-bold focus:outline-none placeholder:text-slate-400"
                                />
                            </div>
                            <button 
                                onClick={onGetStarted}
                                className="w-full md:w-auto px-10 py-5 bg-blue-600 text-white font-black rounded-xl hover:bg-blue-500 transition-all shadow-xl shadow-blue-600/20 active:scale-95 whitespace-nowrap"
                            >
                                Analyze Market
                            </button>
                        </div>
                    </div>
                    
                    <div className="mt-6 flex flex-wrap justify-center gap-8 text-slate-500">
                        <div className="flex items-center gap-2">
                            <svg className="w-5 h-5 text-emerald-500" fill="none" viewBox="0 0 24 24" stroke="currentColor"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={3} d="M5 13l4 4L19 7" /></svg>
                            <span className="text-sm font-bold tracking-wide">450k+ HIGH-VALUE ROLES</span>
                        </div>
                        <div className="flex items-center gap-2">
                            <svg className="w-5 h-5 text-emerald-500" fill="none" viewBox="0 0 24 24" stroke="currentColor"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={3} d="M5 13l4 4L19 7" /></svg>
                            <span className="text-sm font-bold tracking-wide">98% ATS SUCCESS RATE</span>
                        </div>
                        <div className="flex items-center gap-2">
                            <svg className="w-5 h-5 text-emerald-500" fill="none" viewBox="0 0 24 24" stroke="currentColor"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={3} d="M5 13l4 4L19 7" /></svg>
                            <span className="text-sm font-bold tracking-wide">DIRECT HEADHUNTER ACCESS</span>
                        </div>
                    </div>
                </motion.div>
            </div>
        </section>
    );
};

export default Hero;