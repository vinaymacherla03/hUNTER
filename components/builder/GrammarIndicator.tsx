

import React, { useState, useRef, useEffect } from 'react';
import { motion, AnimatePresence } from 'framer-motion';

interface GrammarIndicatorProps {
    isChecking: boolean;
    result: { corrected: string; issues: any[] } | null;
    onApply: (corrected: string) => void;
    onDismiss: () => void;
    // Add className prop
    className?: string;
}

const GrammarIndicator: React.FC<GrammarIndicatorProps> = ({ isChecking, result, onApply, onDismiss, className }) => {
    const [isOpen, setIsOpen] = useState(false);
    const containerRef = useRef<HTMLDivElement>(null);

    useEffect(() => {
        const handleClickOutside = (event: MouseEvent) => {
            if (containerRef.current && !containerRef.current.contains(event.target as Node)) {
                setIsOpen(false);
            }
        };
        document.addEventListener('mousedown', handleClickOutside);
        return () => document.removeEventListener('mousedown', handleClickOutside);
    }, []);

    if (isChecking) {
        return (
            <div className={`absolute p-1 ${className || 'top-2 right-2'}`} title="Checking grammar...">
                <div className="w-2 h-2 bg-slate-300 rounded-full animate-ping" />
            </div>
        );
    }

    if (!result || result.issues.length === 0) return null;

    return (
        <div className={`absolute z-20 ${className || 'top-1 right-1'}`} ref={containerRef}>
            <button
                type="button"
                onClick={() => setIsOpen(!isOpen)}
                className="p-1.5 rounded-full bg-amber-50 text-amber-500 hover:bg-amber-100 transition-colors shadow-sm border border-amber-200/50"
                title={`${result.issues.length} improvement(s) available`}
            >
                <div className="relative">
                    <svg xmlns="http://www.w3.org/2000/svg" className="h-4 w-4" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}>
                        <path strokeLinecap="round" strokeLinejoin="round" d="M13 10V3L4 14h7v7l9-11h-7z" />
                    </svg>
                    <span className="absolute -top-1 -right-1 flex h-2 w-2">
                      <span className="animate-ping absolute inline-flex h-full w-full rounded-full bg-amber-400 opacity-75"></span>
                      <span className="relative inline-flex rounded-full h-2 w-2 bg-amber-500"></span>
                    </span>
                </div>
            </button>

            <AnimatePresence>
                {isOpen && (
                    <motion.div
                        initial={{ opacity: 0, y: 10, scale: 0.95 }}
                        animate={{ opacity: 1, y: 0, scale: 1 }}
                        exit={{ opacity: 0, y: 10, scale: 0.95 }}
                        className="absolute right-0 top-full mt-2 w-72 bg-white rounded-lg shadow-xl border border-slate-200 overflow-hidden"
                    >
                        <div className="p-3 bg-amber-50 border-b border-amber-100 flex justify-between items-center">
                            <h4 className="text-xs font-bold text-amber-800 uppercase tracking-wide">Suggestions</h4>
                            <button onClick={() => setIsOpen(false)} className="text-slate-400 hover:text-slate-600">
                                <svg xmlns="http://www.w3.org/2000/svg" className="h-3 w-3" viewBox="0 0 20 20" fill="currentColor"><path fillRule="evenodd" d="M4.293 4.293a1 1 0 011.414 0L10 8.586l4.293-4.293a1 1 0 111.414 1.414L11.414 10l4.293 4.293a1 1 0 01-1.414 1.414L10 11.414l-4.293 4.293a1 1 0 01-1.414-1.414L8.586 10 4.293 5.707a1 1 0 010-1.414z" clipRule="evenodd" /></svg>
                            </button>
                        </div>
                        <div className="p-4 max-h-64 overflow-y-auto custom-scrollbar">
                            <ul className="space-y-3">
                                {result.issues.map((issue, i) => (
                                    <li key={i} className="text-xs">
                                        <div className="flex gap-2 items-start">
                                             <span className="text-red-500 bg-red-50 px-1 rounded line-through opacity-60 decoration-2 decoration-red-400">{issue.original}</span>
                                             <span className="text-emerald-600 font-medium bg-emerald-50 px-1 rounded">{issue.suggestion}</span>
                                        </div>
                                        <p className="text-[10px] text-slate-400 mt-0.5">{issue.reason}</p>
                                    </li>
                                ))}
                            </ul>
                        </div>
                        <div className="p-3 bg-slate-50 border-t border-slate-200 flex gap-2">
                            <button 
                                onClick={() => { onDismiss(); setIsOpen(false); }}
                                className="flex-1 px-3 py-1.5 text-xs font-medium text-slate-600 bg-white border border-slate-300 rounded hover:bg-slate-50"
                            >
                                Ignore
                            </button>
                            <button 
                                onClick={() => { onApply(result.corrected); setIsOpen(false); }}
                                className="flex-1 px-3 py-1.5 text-xs font-medium text-white bg-emerald-600 rounded hover:bg-emerald-700 shadow-sm"
                            >
                                Fix All
                            </button>
                        </div>
                    </motion.div>
                )}
            </AnimatePresence>
        </div>
    );
};

export default GrammarIndicator;