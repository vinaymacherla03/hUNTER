import React, { useState, useEffect } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { Sparkles, FileText, CheckCircle2, Cpu } from 'lucide-react';

const steps = [
  { icon: FileText, text: "Reading your resume..." },
  { icon: Cpu, text: "Analyzing experience & skills..." },
  { icon: Sparkles, text: "Optimizing bullet points..." },
  { icon: CheckCircle2, text: "Tailoring for ATS systems..." },
  { icon: Sparkles, text: "Enhancing professional summary..." },
  { icon: CheckCircle2, text: "Polishing your profile..." },
  { icon: Sparkles, text: "Finalizing enhancements..." }
];

const LoadingSpinner: React.FC = () => {
  const [stepIndex, setStepIndex] = useState(0);

  useEffect(() => {
    const interval = setInterval(() => {
      setStepIndex((prev) => Math.min(prev + 1, steps.length - 1));
    }, 2500);
    return () => clearInterval(interval);
  }, []);

  return (
    <div className="relative flex flex-col items-center justify-center min-h-screen bg-slate-50 overflow-hidden font-sans">
      {/* Background Elements */}
      <div className="absolute inset-0 overflow-hidden pointer-events-none">
        <div className="absolute top-1/4 left-1/4 w-[500px] h-[500px] bg-emerald-400/20 rounded-full blur-[120px] animate-pulse" />
        <div className="absolute bottom-1/4 right-1/4 w-[500px] h-[500px] bg-blue-400/20 rounded-full blur-[120px] animate-pulse delay-1000" />
      </div>

      <div className="relative z-10 flex flex-col items-center max-w-md w-full px-6">
        
        {/* Main Spinner */}
        <div className="relative w-32 h-32 mb-12 flex items-center justify-center">
          <motion.div
            animate={{ rotate: 360 }}
            transition={{ duration: 3, repeat: Infinity, ease: "linear" }}
            className="absolute inset-0 border-[3px] border-emerald-500/30 border-t-emerald-500 rounded-full"
          />
          <motion.div
            animate={{ rotate: -360 }}
            transition={{ duration: 4, repeat: Infinity, ease: "linear" }}
            className="absolute inset-3 border-[3px] border-blue-500/30 border-b-blue-500 rounded-full"
          />
          <div className="absolute inset-0 flex items-center justify-center">
            <div className="w-12 h-12 bg-white rounded-full shadow-lg flex items-center justify-center border border-slate-100">
               <Sparkles className="w-6 h-6 text-emerald-500 animate-pulse" />
            </div>
          </div>
        </div>

        {/* Text Content */}
        <div className="text-center mb-12">
          <h2 className="text-3xl font-black text-slate-900 tracking-tight mb-3">
            Enhancing Your Resume
          </h2>
          <p className="text-slate-500 font-medium">
            Our AI is working its magic. This usually takes about 10-15 seconds.
          </p>
        </div>

        {/* Steps List */}
        <div className="w-full bg-white rounded-3xl p-6 shadow-xl shadow-slate-200/50 border border-slate-100">
          <div className="space-y-4">
            {steps.map((step, index) => {
              const Icon = step.icon;
              const isActive = index === stepIndex;
              const isPast = index < stepIndex;
              
              return (
                <motion.div 
                  key={index}
                  initial={{ opacity: 0, x: -20 }}
                  animate={{ 
                    opacity: isPast || isActive ? 1 : 0.3,
                    x: 0,
                    scale: isActive ? 1.02 : 1
                  }}
                  className={`flex items-center gap-4 p-3 rounded-2xl transition-colors duration-500 ${isActive ? 'bg-slate-50' : ''}`}
                >
                  <div className={`w-10 h-10 rounded-xl flex items-center justify-center shrink-0 transition-colors duration-500 ${
                    isPast ? 'bg-emerald-100 text-emerald-600' : 
                    isActive ? 'bg-blue-100 text-blue-600' : 
                    'bg-slate-100 text-slate-400'
                  }`}>
                    {isPast ? <CheckCircle2 className="w-5 h-5" /> : <Icon className={`w-5 h-5 ${isActive ? 'animate-pulse' : ''}`} />}
                  </div>
                  <span className={`font-semibold text-sm transition-colors duration-500 ${
                    isPast ? 'text-slate-700' : 
                    isActive ? 'text-blue-700' : 
                    'text-slate-400'
                  }`}>
                    {step.text}
                  </span>
                </motion.div>
              );
            })}
          </div>
        </div>

      </div>
    </div>
  );
};

export default LoadingSpinner;
