
import React from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import SparkleIcon from '../icons/SparkleIcon';

interface RewriteSuggestionModalProps {
    originalText: string;
    suggestion: string;
    reason: string;
    onClose: () => void;
    onApply: () => void;
}

const RewriteSuggestionModal: React.FC<RewriteSuggestionModalProps> = ({ originalText, suggestion, reason, onClose, onApply }) => {
    return (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4" role="dialog" aria-modal="true">
            <motion.div
                initial={{ opacity: 0 }}
                animate={{ opacity: 1 }}
                exit={{ opacity: 0 }}
                className="absolute inset-0 bg-black/60 backdrop-blur-sm"
                onClick={onClose}
            />
            <motion.div
                initial={{ opacity: 0, scale: 0.95, y: 20 }}
                animate={{ opacity: 1, scale: 1, y: 0 }}
                exit={{ opacity: 0, scale: 0.95, y: 20 }}
                transition={{ duration: 0.3, ease: 'easeOut' }}
                className="relative z-10 w-full max-w-2xl bg-white rounded-xl shadow-2xl flex flex-col"
            >
                <header className="flex items-center justify-between p-4 border-b border-slate-200">
                    <div className="flex items-center gap-3">
                        <div className="w-8 h-8 flex items-center justify-center rounded-lg bg-primary-100 text-primary">
                            <SparkleIcon className="w-5 h-5" />
                        </div>
                        <h2 className="text-lg font-semibold text-slate-800">AI Suggestion</h2>
                    </div>
                    <button onClick={onClose} className="p-1.5 rounded-full text-slate-500 hover:bg-slate-100" aria-label="Close modal">
                        <svg xmlns="http://www.w3.org/2000/svg" className="h-5 w-5" viewBox="0 0 20 20" fill="currentColor"><path fillRule="evenodd" d="M4.293 4.293a1 1 0 011.414 0L10 8.586l4.293-4.293a1 1 0 111.414 1.414L11.414 10l4.293 4.293a1 1 0 01-1.414 1.414L10 11.414l-4.293 4.293a1 1 0 01-1.414-1.414L8.586 10 4.293 5.707a1 1 0 010-1.414z" clipRule="evenodd" /></svg>
                    </button>
                </header>

                <div className="p-6 space-y-6">
                    <div>
                        <p className="text-xs font-semibold text-slate-500 mb-2 uppercase tracking-wider">Your Original</p>
                        <p className="text-sm text-slate-600 bg-slate-50 p-3 rounded-md border border-slate-200">{originalText}</p>
                    </div>

                    <div>
                        <p className="text-xs font-semibold text-primary mb-2 uppercase tracking-wider">AI-Powered Suggestion</p>
                        <p className="text-sm text-slate-800 bg-primary-50 p-3 rounded-md border border-primary-200">{suggestion}</p>
                    </div>

                    <div>
                        <p className="text-xs font-semibold text-emerald-600 mb-2 uppercase tracking-wider">Why it's better</p>
                        <p className="text-sm text-emerald-800 bg-emerald-50 p-3 rounded-md border border-emerald-200">{reason}</p>
                    </div>
                </div>

                <footer className="flex justify-end gap-3 p-4 bg-slate-50 border-t border-slate-200 rounded-b-xl">
                    <button onClick={onClose} className="px-4 py-2 text-sm font-semibold rounded-lg text-slate-600 bg-white border border-slate-300 hover:bg-slate-100">Cancel</button>
                    <button onClick={onApply} className="px-4 py-2 text-sm font-semibold rounded-lg text-white bg-primary hover:bg-primary-700">Use Suggestion</button>
                </footer>
            </motion.div>
        </div>
    );
};

export default RewriteSuggestionModal;
