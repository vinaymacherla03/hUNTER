
import React, { useState } from 'react';
import { motion } from 'framer-motion';

interface CoverLetterModalProps {
    content: string;
    onClose: () => void;
}

const CoverLetterModal: React.FC<CoverLetterModalProps> = ({ content, onClose }) => {
    const [editedContent, setEditedContent] = useState(content);
    const [hasCopied, setHasCopied] = useState(false);
    
    const handleCopy = () => {
        navigator.clipboard.writeText(editedContent);
        setHasCopied(true);
        setTimeout(() => setHasCopied(false), 2000);
    };

    return (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4" role="dialog" aria-modal="true">
            <motion.div initial={{ opacity: 0 }} animate={{ opacity: 1 }} exit={{ opacity: 0 }} className="absolute inset-0 bg-black/60 backdrop-blur-sm" onClick={onClose} />
            <motion.div
                initial={{ opacity: 0, scale: 0.95, y: 20 }}
                animate={{ opacity: 1, scale: 1, y: 0 }}
                exit={{ opacity: 0, scale: 0.95, y: 20 }}
                transition={{ duration: 0.3, ease: 'easeOut' }}
                className="relative z-10 w-full max-w-2xl h-[90vh] flex flex-col bg-white rounded-xl shadow-2xl"
            >
                <header className="flex items-center justify-between p-4 border-b border-slate-200 shrink-0">
                     <h2 className="text-lg font-semibold text-slate-800">AI Generated Cover Letter</h2>
                    <button onClick={onClose} className="p-1.5 rounded-full text-slate-500 hover:bg-slate-100" aria-label="Close modal">
                       <svg xmlns="http://www.w3.org/2000/svg" className="h-5 w-5" viewBox="0 0 20 20" fill="currentColor"><path fillRule="evenodd" d="M4.293 4.293a1 1 0 011.414 0L10 8.586l4.293-4.293a1 1 0 111.414 1.414L11.414 10l4.293 4.293a1 1 0 01-1.414 1.414L10 11.414l-4.293 4.293a1 1 0 01-1.414-1.414L8.586 10 4.293 5.707a1 1 0 010-1.414z" clipRule="evenodd" /></svg>
                    </button>
                </header>

                <div className="flex-grow p-6 overflow-y-auto custom-scrollbar">
                    <textarea
                        value={editedContent}
                        onChange={(e) => setEditedContent(e.target.value)}
                        className="w-full h-full p-4 text-sm leading-relaxed border border-slate-300 rounded-md resize-none focus:outline-none focus:ring-2 focus:ring-primary"
                        aria-label="Editable cover letter content"
                    />
                </div>

                <footer className="flex justify-between items-center gap-3 p-4 bg-slate-50 border-t border-slate-200 rounded-b-xl">
                    <p className="text-xs text-slate-500">
                        Review and edit the letter to ensure it matches your voice and experience.
                    </p>
                    <button
                        onClick={handleCopy}
                        className={`px-4 py-2 text-sm font-semibold rounded-lg transition-colors ${
                            hasCopied
                                ? 'bg-emerald-600 text-white'
                                : 'bg-primary text-white hover:bg-primary-700'
                        }`}
                    >
                        {hasCopied ? 'Copied!' : 'Copy to Clipboard'}
                    </button>
                </footer>
            </motion.div>
        </div>
    );
};

export default CoverLetterModal;
