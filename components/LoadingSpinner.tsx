import React, { useState, useEffect } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { Sparkles, FileText, CheckCircle2, Cpu, Zap, Search, Layout, Wand2 } from 'lucide-react';
import GranularLoadingText from './builder/GranularLoadingText';

const steps = [
  { icon: FileText, text: "Reading your resume...", subtext: "Extracting text and structure" },
  { icon: Search, text: "Analyzing experience & skills...", subtext: "Identifying key strengths" },
  { icon: Zap, text: "Optimizing bullet points...", subtext: "Improving impact and clarity" },
  { icon: Layout, text: "Tailoring for ATS systems...", subtext: "Matching keywords to job description" },
  { icon: Wand2, text: "Enhancing professional summary...", subtext: "Crafting a compelling narrative" },
  { icon: CheckCircle2, text: "Polishing your profile...", subtext: "Final quality checks" },
  { icon: Sparkles, text: "Finalizing enhancements...", subtext: "Preparing your new resume" }
];

const LoadingSpinner: React.FC = () => {
  const [stepIndex, setStepIndex] = useState(0);
  const [progress, setProgress] = useState(0);

  useEffect(() => {
    const interval = setInterval(() => {
      setStepIndex((prev) => {
        if (prev < steps.length - 1) return prev + 1;
        return prev;
      });
    }, 2500);
    
    const progressInterval = setInterval(() => {
      setProgress((prev) => {
        if (prev >= 100) return 100;
        return prev + (100 / (steps.length * 25)); // Smooth progress
      });
    }, 100);

    return () => {
      clearInterval(interval);
      clearInterval(progressInterval);
    };
  }, []);

  return (
    <div className="relative flex flex-col items-center justify-center min-h-screen bg-slate-50 overflow-hidden font-sans">
      {/* Background Elements */}
      <div className="absolute inset-0 overflow-hidden pointer-events-none">
        <div className="absolute top-1/4 left-1/4 w-[600px] h-[600px] bg-emerald-400/10 rounded-full blur-[120px] animate-pulse" />
        <div className="absolute bottom-1/4 right-1/4 w-[600px] h-[600px] bg-emerald-400/10 rounded-full blur-[120px] animate-pulse delay-1000" />
        
        {/* Floating Particles */}
        {[...Array(20)].map((_, i) => (
          <motion.div
            key={i}
            initial={{ 
              x: Math.random() * 1000 - 500, 
              y: Math.random() * 1000 - 500,
              opacity: 0 
            }}
            animate={{ 
              y: [0, -100, 0],
              x: [0, Math.random() * 50 - 25, 0],
              opacity: [0, 0.3, 0],
              scale: [0, 1, 0]
            }}
            transition={{ 
              duration: 5 + Math.random() * 5, 
              repeat: Infinity,
              delay: Math.random() * 5
            }}
            className="absolute w-1 h-1 bg-emerald-400 rounded-full"
            style={{ 
              left: `${Math.random() * 100}%`,
              top: `${Math.random() * 100}%`
            }}
          />
        ))}
      </div>

      <div className="relative z-10 flex flex-col items-center max-w-lg w-full px-6">
        
        {/* Main Spinner Container */}
        <div className="relative w-48 h-48 mb-10 flex items-center justify-center">
            {/* Ambient Glow */}
            <motion.div 
                animate={{ 
                    scale: [1, 1.2, 1],
                    opacity: [0.1, 0.3, 0.1]
                }}
                transition={{ duration: 4, repeat: Infinity }}
                className="absolute inset-0 bg-emerald-400 rounded-full blur-3xl"
            />

          {/* Outer Ring */}
          <motion.div
            animate={{ rotate: 360 }}
            transition={{ duration: 12, repeat: Infinity, ease: "linear" }}
            className="absolute inset-0 border-[1px] border-dashed border-emerald-500/30 rounded-full"
          />
          
          {/* Middle Ring */}
          <motion.div
            animate={{ rotate: -360 }}
            transition={{ duration: 18, repeat: Infinity, ease: "linear" }}
            className="absolute inset-4 border-[1px] border-dashed border-emerald-500/20 rounded-full"
          />

          {/* Animated Spinner Ring */}
          <div className="absolute inset-0 flex items-center justify-center">
            <svg className="w-full h-full transform -rotate-90">
              <circle
                cx="96"
                cy="96"
                r="86"
                stroke="currentColor"
                strokeWidth="1"
                fill="transparent"
                className="text-slate-200"
              />
              <motion.circle
                cx="96"
                cy="96"
                r="86"
                stroke="currentColor"
                strokeWidth="3"
                strokeLinecap="round"
                fill="transparent"
                strokeDasharray="540"
                animate={{ strokeDashoffset: 540 - (540 * progress) / 100 }}
                transition={{ type: "spring", stiffness: 50, damping: 20 }}
                className="text-emerald-500"
              />
            </svg>
          </div>

          {/* Center Card with Adaptive Icon */}
          <div className="absolute inset-0 flex items-center justify-center">
            <motion.div 
              animate={{ 
                scale: [1, 1.05, 1],
                boxShadow: [
                    "0 20px 50px rgba(16, 185, 129, 0.1)",
                    "0 20px 50px rgba(16, 185, 129, 0.2)",
                    "0 20px 50px rgba(16, 185, 129, 0.1)"
                ]
              }}
              transition={{ duration: 3, repeat: Infinity }}
              className="w-20 h-20 bg-white rounded-[2.5rem] flex items-center justify-center border border-slate-100/50 backdrop-blur-xl relative z-20"
            >
                <AnimatePresence mode="wait">
                    <motion.div
                        key={stepIndex}
                        initial={{ opacity: 0, scale: 0.5, rotate: -45 }}
                        animate={{ opacity: 1, scale: 1, rotate: 0 }}
                        exit={{ opacity: 0, scale: 1.5, rotate: 45 }}
                        transition={{ duration: 0.4, ease: [0.16, 1, 0.3, 1] }}
                    >
                        {React.createElement(steps[stepIndex].icon, { className: "w-9 h-9 text-emerald-500" })}
                    </motion.div>
                </AnimatePresence>
                
                {/* Micro-sparkles around icon */}
                <motion.div 
                    animate={{ opacity: [0, 1, 0], scale: [0.5, 1, 0.5] }}
                    transition={{ duration: 2, repeat: Infinity }}
                    className="absolute -top-2 -right-2 text-emerald-400"
                >
                    <Sparkles className="w-5 h-5 fill-emerald-400" />
                </motion.div>
            </motion.div>
          </div>
        </div>

        {/* Text Content */}
        <div className="text-center mb-12 min-h-[140px] flex flex-col items-center justify-center">
          <AnimatePresence mode="wait">
            <motion.div
                key={stepIndex}
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                exit={{ opacity: 0, y: -20 }}
                transition={{ duration: 0.5, ease: [0.16, 1, 0.3, 1] }}
                className="flex flex-col items-center"
            >
                <h2 className="text-3xl font-black text-slate-900 tracking-tight mb-3">
                    {steps[stepIndex].text}
                </h2>
                <p className="text-slate-500 font-medium max-w-[300px] h-10 mb-6">
                    {steps[stepIndex].subtext}
                </p>
            </motion.div>
          </AnimatePresence>
          
          <motion.div 
            initial={{ opacity: 0, scale: 0.9 }}
            animate={{ opacity: 1, scale: 1 }}
            className="flex items-center justify-center bg-emerald-50/50 backdrop-blur-sm px-5 py-2 rounded-2xl border border-emerald-100 shadow-sm"
          >
            <div className="w-2 h-2 rounded-full bg-emerald-500 animate-pulse mr-3" />
            <GranularLoadingText 
                messages={[
                    "Analyzing semantic patterns...",
                    "Identifying impact opportunities...",
                    "Optimizing for ATS algorithms...",
                    "Refining professional narrative...",
                    "Cross-referencing industry standards...",
                    "Enhancing action verbs...",
                    "Structuring data for clarity...",
                    "Validating keyword density..."
                ]}
                intervalMs={1800}
                className="text-[10px] font-black text-emerald-600 uppercase tracking-widest"
            />
          </motion.div>
        </div>

        {/* Custom Progress Bar */}
        <div className="w-full h-1.5 bg-slate-200/50 rounded-full mb-12 overflow-hidden relative">
          <motion.div 
            className="absolute inset-y-0 left-0 bg-gradient-to-r from-emerald-400 via-emerald-500 to-emerald-400"
            animate={{ width: `${progress}%` }}
            transition={{ type: "spring", stiffness: 30, damping: 15 }}
          />
          <motion.div 
            className="absolute inset-y-0 left-0 w-20 bg-gradient-to-r from-transparent via-white/40 to-transparent"
            animate={{ x: [`${progress}%`, `${progress + 10}%`] }}
            transition={{ duration: 1.5, repeat: Infinity }}
          />
        </div>

        {/* Steps List */}
        <div className="w-full bg-white/40 backdrop-blur-md rounded-[2.5rem] p-8 shadow-2xl shadow-slate-200/50 border border-white/80">
          <div className="space-y-5">
            {steps.map((step, index) => {
              const Icon = step.icon;
              const isActive = index === stepIndex;
              const isPast = index < stepIndex;
              
              return (
                <motion.div 
                  key={index}
                  initial={{ opacity: 0, x: -10 }}
                  animate={{ 
                    opacity: isPast || isActive ? 1 : 0.15,
                    x: 0,
                    scale: isActive ? 1.05 : 1
                  }}
                  className={`flex items-center gap-5 p-3 rounded-2xl transition-all duration-700 ${isActive ? 'bg-white shadow-xl shadow-emerald-500/5 ring-1 ring-emerald-50' : ''}`}
                >
                  <div className={`w-10 h-10 rounded-xl flex items-center justify-center shrink-0 transition-all duration-700 ${
                    isPast ? 'bg-emerald-500 text-white shadow-lg shadow-emerald-500/20' : 
                    isActive ? 'bg-emerald-100 text-emerald-600 ring-4 ring-emerald-50' : 
                    'bg-slate-100 text-slate-400'
                  }`}>
                    {isPast ? <CheckCircle2 className="w-5 h-5" /> : <Icon className={`w-5 h-5 ${isActive ? 'animate-bounce' : ''}`} />}
                  </div>
                  <div className="flex flex-col">
                    <span className={`font-black text-[13px] transition-colors duration-700 ${
                      isPast ? 'text-slate-700' : 
                      isActive ? 'text-emerald-950' : 
                      'text-slate-400'
                    }`}>
                      {step.text}
                    </span>
                    {isActive && (
                      <motion.span 
                        initial={{ opacity: 0, x: -5 }}
                        animate={{ opacity: 1, x: 0 }}
                        className="text-[11px] text-emerald-600/70 font-bold uppercase tracking-wider"
                      >
                        Active Processing...
                      </motion.span>
                    )}
                  </div>
                </motion.div>
              );
            })}
          </div>
        </div>

        <div className="mt-10 flex flex-col items-center gap-2">
            <div className="px-3 py-1 bg-slate-950 rounded-lg">
                <p className="text-[9px] text-emerald-400 font-black uppercase tracking-[0.3em]">
                    Neural Engine Active
                </p>
            </div>
            <p className="text-[10px] text-slate-400 font-bold uppercase tracking-widest opacity-50">
                Processing structured datasets • v3.1 PRO
            </p>
        </div>
      </div>
    </div>
  );
};

export default LoadingSpinner;
