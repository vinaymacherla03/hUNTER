
import React from 'react';
import { motion } from 'framer-motion';
import { X } from 'lucide-react';
import SparkleIcon from '../icons/SparkleIcon';

interface RewriteSuggestionModalProps {
    originalText: string;
    suggestion: string;
    reason: string;
    onClose: () => void;
    onApply: () => void;
}

const RewriteSuggestionModal = React.forwardRef<HTMLDivElement, RewriteSuggestionModalProps>(({ originalText, suggestion, reason, onClose, onApply }, ref) => {
    return (
        <motion.div 
            ref={ref}
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            className="fixed inset-0 z-[70] flex items-center justify-center p-4 bg-slate-900/40 backdrop-blur-sm" 
            role="dialog" 
            aria-modal="true"
        >
            <div
                className="absolute inset-0 bg-black/60 backdrop-blur-sm"
                onClick={onClose}
            />
            <motion.div
                initial={{ opacity: 0, scale: 0.95, y: 20 }}
                animate={{ opacity: 1, scale: 1, y: 0 }}
                exit={{ opacity: 0, scale: 0.95, y: 20 }}
                transition={{ duration: 0.3, ease: 'easeOut' }}
                className="relative z-10 w-full max-w-2xl bg-white rounded-3xl shadow-2xl overflow-hidden flex flex-col"
            >
                {/* Header with Gradient */}
                <div className="bg-gradient-to-r from-slate-900 to-slate-800 p-8 text-white relative overflow-hidden">
                    <div className="absolute inset-0 bg-[url('https://grainy-gradients.vercel.app/noise.svg')] opacity-10" />
                    <div className="relative z-10 flex items-center justify-between">
                        <div className="flex items-center gap-5">
                            <div className="w-14 h-14 bg-white/10 rounded-2xl flex items-center justify-center backdrop-blur-md border border-white/10">
                                <SparkleIcon className="w-8 h-8" />
                            </div>
                            <div>
                                <h2 className="text-2xl font-black tracking-tight uppercase">AI Smart Rewrite</h2>
                                <p className="text-slate-400 text-sm font-medium mt-1">Enhancing your impact with proprietary AI.</p>
                            </div>
                        </div>
                        <button 
                            onClick={onClose} 
                            className="p-2.5 rounded-xl text-white/50 hover:text-white hover:bg-white/10 transition-colors focus:outline-none focus:ring-2 focus:ring-white/20" 
                            aria-label="Close modal"
                        >
                            <X className="w-6 h-6" />
                        </button>
                    </div>
                </div>

                <div className="p-6 sm:p-8 space-y-8 bg-slate-50/50 overflow-y-auto custom-scrollbar">
                    <div className="space-y-3">
                        <div className="flex items-center gap-2">
                            <span className="text-[10px] font-black text-slate-400 uppercase tracking-[0.2em]">Your Original</span>
                            <div className="h-px flex-grow bg-slate-200" />
                        </div>
                        <div className="p-5 bg-white rounded-2xl border border-slate-200 shadow-sm">
                            <p className="text-sm text-slate-600 leading-relaxed font-medium">{originalText}</p>
                        </div>
                    </div>

                    <div className="space-y-3">
                        <div className="flex items-center gap-2">
                            <span className="text-[10px] font-black text-emerald-600 uppercase tracking-[0.2em]">AI-Powered Suggestion</span>
                            <div className="h-px flex-grow bg-emerald-100" />
                        </div>
                        <div className="p-5 bg-emerald-50/50 rounded-2xl border border-emerald-100 shadow-sm ring-1 ring-emerald-500/10">
                            <p className="text-sm text-slate-900 leading-relaxed font-bold">{suggestion}</p>
                        </div>
                    </div>

                    <div className="space-y-3">
                        <div className="flex items-center gap-2">
                            <span className="text-[10px] font-black text-emerald-600 uppercase tracking-[0.2em]">Strategic Rationale</span>
                            <div className="h-px flex-grow bg-emerald-100" />
                        </div>
                        <div className="p-5 bg-emerald-50/50 rounded-2xl border border-emerald-100 shadow-sm">
                            <p className="text-sm text-emerald-900 leading-relaxed font-medium italic">"{reason}"</p>
                        </div>
                    </div>
                </div>

                <footer className="flex justify-end gap-4 p-6 sm:p-8 bg-white border-t border-slate-100 shrink-0">
                    <button 
                        onClick={onClose} 
                        className="px-6 py-3 text-xs font-black uppercase tracking-widest rounded-xl text-slate-500 hover:bg-slate-50 transition-all active:scale-95"
                    >
                        Discard
                    </button>
                    <button 
                        onClick={onApply} 
                        className="px-8 py-3 text-xs font-black uppercase tracking-widest rounded-xl text-white bg-emerald-600 hover:bg-emerald-500 shadow-lg shadow-emerald-600/20 transition-all active:scale-95"
                    >
                        Apply Suggestion
                    </button>
                </footer>
            </motion.div>
        </motion.div>
    );
});

RewriteSuggestionModal.displayName = 'RewriteSuggestionModal';

export default RewriteSuggestionModal;
