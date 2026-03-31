import React from 'react';
import { motion } from 'framer-motion';
import { Check } from 'lucide-react';

interface StepNavigatorProps {
  steps: { key: string; name: string }[];
  currentStep: number;
  setCurrentStep: (step: number) => void;
}

const StepNavigator: React.FC<StepNavigatorProps> = ({ steps, currentStep, setCurrentStep }) => {
  return (
    <div className="relative max-w-3xl mx-auto px-4 sm:px-8 py-6">
        <div className="absolute left-8 right-8 top-1/2 -translate-y-1/2 h-1 bg-slate-100 rounded-full overflow-hidden">
            <motion.div 
                className="absolute left-0 top-0 bottom-0 bg-emerald-600 rounded-full"
                style={{ originX: 0 }}
                animate={{ width: `${(currentStep / (steps.length - 1)) * 100}%` }}
                transition={{ duration: 0.5, ease: 'easeInOut' }}
            />
        </div>
        <div className="relative flex justify-between items-center z-10">
        {steps.map((step, index) => {
            const isCompleted = index < currentStep;
            const isActive = index === currentStep;

            return (
                <button 
                    key={step.key} 
                    onClick={() => setCurrentStep(index)}
                    className="flex flex-col items-center gap-3 focus:outline-none group"
                >
                    <motion.div
                        className={`w-10 h-10 rounded-2xl flex items-center justify-center transition-all duration-300 shadow-sm ${
                            isActive 
                                ? 'bg-emerald-600 text-white shadow-emerald-500/30 shadow-lg scale-110' 
                                : isCompleted 
                                    ? 'bg-emerald-50 text-emerald-600 border-2 border-emerald-200 group-hover:border-emerald-400' 
                                    : 'bg-white text-slate-400 border-2 border-slate-200 group-hover:border-slate-300'
                        }`}
                    >
                       {isCompleted ? (
                           <Check className="w-5 h-5" strokeWidth={3} />
                       ) : (
                           <span className="text-sm font-black">{index + 1}</span>
                       )}
                    </motion.div>
                    <span className={`text-xs font-bold uppercase tracking-widest transition-colors ${
                        isActive 
                            ? 'text-emerald-600' 
                            : isCompleted 
                                ? 'text-slate-700' 
                                : 'text-slate-400'
                    }`}>
                        {step.name}
                    </span>
                </button>
            )
        })}
        </div>
    </div>
  );
};

export default StepNavigator;