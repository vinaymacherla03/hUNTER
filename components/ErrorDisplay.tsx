import React from 'react';
import { motion } from 'framer-motion';

interface ErrorDisplayProps {
  message: string;
  onRetry: () => void;
  onStartOver: () => void;
}

const ErrorDisplay: React.FC<ErrorDisplayProps> = ({ message, onRetry, onStartOver }) => {
  return (
    <div className="flex flex-col items-center justify-center min-h-screen bg-red-600 p-6">
      <motion.div
        initial={{ opacity: 0, scale: 0.9 }}
        animate={{ opacity: 1, scale: 1 }}
        className="bg-white p-12 rounded-[40px] shadow-2xl max-w-xl w-full text-center relative overflow-hidden"
      >
        {/* Decorative background element */}
        <div className="absolute -top-10 -right-10 w-40 h-40 bg-red-50 rounded-full blur-3xl" />
        
        <div className="relative z-10">
          <div className="w-20 h-20 bg-red-100 text-red-600 rounded-full flex items-center justify-center mx-auto mb-8 shadow-inner">
            <svg className="w-10 h-10" fill="none" viewBox="0 0 24 24" stroke="currentColor">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={3} d="M12 9v2m0 4h.01m-6.938 4h13.856c1.54 0 2.502-1.667 1.732-3L13.732 4c-.77-1.333-2.694-1.333-3.464 0L3.34 16c-.77 1.333.192 3 1.732 3z" />
            </svg>
          </div>
          
          <h2 className="text-4xl font-black text-black leading-tight mb-4">
            System <span className="text-red-600 underline underline-offset-8 decoration-4">Interrupt.</span>
          </h2>
          
          <p className="text-xl text-gray-600 font-medium mb-12 leading-relaxed">
            {message}
          </p>
          
          <div className="flex flex-col sm:flex-row gap-4">
            <button
              onClick={onRetry}
              className="flex-1 py-5 px-8 bg-black text-white font-black uppercase tracking-widest rounded-full hover:bg-red-600 transition-all shadow-xl shadow-black/10 active:scale-95"
            >
              Try Again
            </button>
            <button
              onClick={onStartOver}
              className="flex-1 py-5 px-8 bg-gray-100 text-black font-black uppercase tracking-widest rounded-full hover:bg-gray-200 transition-all active:scale-95"
            >
              Start Over
            </button>
          </div>
        </div>
      </motion.div>
      
      <motion.p
        initial={{ opacity: 0 }}
        animate={{ opacity: 1 }}
        transition={{ delay: 0.8 }}
        className="mt-12 text-white/60 font-mono text-xs uppercase tracking-[0.3em]"
      >
        Error Code: 0x404_RESUME_FAILURE
      </motion.p>
    </div>
  );
};

export default ErrorDisplay;
