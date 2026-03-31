import React, { useState, useEffect } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { Sparkles, FileText, CheckCircle2, Cpu, Zap, Search, Layout, Wand2 } from 'lucide-react';

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
        <div className="absolute bottom-1/4 right-1/4 w-[600px] h-[600px] bg-blue-400/10 rounded-full blur-[120px] animate-pulse delay-1000" />
      </div>

      <div className="relative z-10 flex flex-col items-center max-w-lg w-full px-6">
        
        {/* Main Spinner Container */}
        <div className="relative w-40 h-40 mb-10 flex items-center justify-center">
          {/* Outer Ring */}
          <motion.div
            animate={{ rotate: 360 }}
            transition={{ duration: 8, repeat: Infinity, ease: "linear" }}
            className="absolute inset-0 border-[2px] border-dashed border-emerald-500/20 rounded-full"
          />
          
          {/* Middle Ring */}
          <motion.div
            animate={{ rotate: -360 }}
            transition={{ duration: 12, repeat: Infinity, ease: "linear" }}
            className="absolute inset-4 border-[2px] border-dashed border-blue-500/20 rounded-full"
          />

          {/* Animated Spinner */}
          <div className="absolute inset-0 flex items-center justify-center">
            <svg className="w-full h-full transform -rotate-90">
              <circle
                cx="80"
                cy="80"
                r="70"
                stroke="currentColor"
                strokeWidth="4"
                fill="transparent"
                className="text-slate-200"
              />
              <motion.circle
                cx="80"
                cy="80"
                r="70"
                stroke="currentColor"
                strokeWidth="4"
                fill="transparent"
                strokeDasharray="440"
                animate={{ strokeDashoffset: 440 - (440 * progress) / 100 }}
                className="text-emerald-500"
              />
            </svg>
          </div>

          {/* Center Icon */}
          <div className="absolute inset-0 flex items-center justify-center">
            <motion.div 
              animate={{ 
                scale: [1, 1.1, 1],
                rotate: [0, 5, -5, 0]
              }}
              transition={{ duration: 4, repeat: Infinity }}
              className="w-16 h-16 bg-white rounded-2xl shadow-2xl flex items-center justify-center border border-slate-100"
            >
               <Sparkles className="w-8 h-8 text-emerald-500" />
            </motion.div>
          </div>
        </div>

        {/* Text Content */}
        <div className="text-center mb-10">
          <motion.h2 
            key={stepIndex}
            initial={{ opacity: 0, y: 10 }}
            animate={{ opacity: 1, y: 0 }}
            className="text-3xl font-black text-slate-900 tracking-tight mb-3"
          >
            {steps[stepIndex].text}
          </motion.h2>
          <motion.p 
            key={`sub-${stepIndex}`}
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            className="text-slate-500 font-medium"
          >
            {steps[stepIndex].subtext}
          </motion.p>
        </div>

        {/* Progress Bar */}
        <div className="w-full h-2 bg-slate-200 rounded-full mb-10 overflow-hidden">
          <motion.div 
            className="h-full bg-gradient-to-r from-emerald-500 to-blue-500"
            animate={{ width: `${progress}%` }}
          />
        </div>

        {/* Steps List */}
        <div className="w-full bg-white/80 backdrop-blur-sm rounded-3xl p-6 shadow-2xl shadow-slate-200/50 border border-white">
          <div className="space-y-4">
            {steps.map((step, index) => {
              const Icon = step.icon;
              const isActive = index === stepIndex;
              const isPast = index < stepIndex;
              
              return (
                <motion.div 
                  key={index}
                  initial={{ opacity: 0, x: -10 }}
                  animate={{ 
                    opacity: isPast || isActive ? 1 : 0.2,
                    x: 0,
                    scale: isActive ? 1.02 : 1
                  }}
                  className={`flex items-center gap-4 p-2 rounded-xl transition-all duration-500 ${isActive ? 'bg-white shadow-sm' : ''}`}
                >
                  <div className={`w-8 h-8 rounded-lg flex items-center justify-center shrink-0 transition-all duration-500 ${
                    isPast ? 'bg-emerald-100 text-emerald-600' : 
                    isActive ? 'bg-blue-100 text-blue-600' : 
                    'bg-slate-100 text-slate-400'
                  }`}>
                    {isPast ? <CheckCircle2 className="w-4 h-4" /> : <Icon className={`w-4 h-4 ${isActive ? 'animate-pulse' : ''}`} />}
                  </div>
                  <div className="flex flex-col">
                    <span className={`font-bold text-xs transition-colors duration-500 ${
                      isPast ? 'text-slate-700' : 
                      isActive ? 'text-blue-700' : 
                      'text-slate-400'
                    }`}>
                      {step.text}
                    </span>
                    {isActive && (
                      <motion.span 
                        initial={{ opacity: 0, height: 0 }}
                        animate={{ opacity: 1, height: 'auto' }}
                        className="text-[10px] text-slate-400 font-medium"
                      >
                        {step.subtext}
                      </motion.span>
                    )}
                  </div>
                </motion.div>
              );
            })}
          </div>
        </div>

        <p className="mt-8 text-[10px] text-slate-400 font-mono uppercase tracking-widest">
          AI Engine v2.5 • Processing Neural Patterns
        </p>
      </div>
    </div>
  );
};

export default LoadingSpinner;
