
import React from 'react';
import { motion } from 'framer-motion';
import { TemplateKey, ResumeData } from '../../types';
import TemplateSelector from '../TemplateSelector';
import { X } from 'lucide-react';

interface TemplateSelectorModalProps {
    currentTemplate: TemplateKey;
    resumeData: ResumeData;
    onTemplateChange: (template: TemplateKey) => void;
    onClose: () => void;
}

const TemplateSelectorModal: React.FC<TemplateSelectorModalProps> = ({ currentTemplate, resumeData, onTemplateChange, onClose }) => {
    return (
        <div className="fixed inset-0 z-[60] flex items-center justify-center p-4 bg-slate-900/40 backdrop-blur-sm">
            <motion.div
                initial={{ opacity: 0, scale: 0.95, y: 20 }}
                animate={{ opacity: 1, scale: 1, y: 0 }}
                exit={{ opacity: 0, scale: 0.95, y: 20 }}
                className="relative w-full max-w-5xl h-[85vh] bg-white rounded-3xl shadow-2xl overflow-hidden flex flex-col"
                onClick={e => e.stopPropagation()}
            >
                <header className="p-6 sm:p-8 border-b border-slate-100 flex items-center justify-between shrink-0">
                    <div>
                        <h2 className="text-2xl sm:text-3xl font-black text-slate-900 tracking-tight">Choose a Template</h2>
                        <p className="text-sm text-slate-500 mt-2 font-medium">Select the style that best represents your career journey.</p>
                    </div>
                    <button 
                        onClick={onClose}
                        className="p-2.5 hover:bg-slate-100 rounded-xl transition-colors text-slate-400 hover:text-slate-600 focus:outline-none focus:ring-2 focus:ring-slate-200"
                    >
                        <X className="w-6 h-6" />
                    </button>
                </header>

                <main className="flex-1 overflow-y-auto custom-scrollbar p-6 sm:p-8 bg-slate-50/50">
                    <TemplateSelector 
                        currentTemplate={currentTemplate} 
                        resumeData={resumeData} 
                        onTemplateChange={onTemplateChange} 
                    />
                </main>
                
                <footer className="p-6 border-t border-slate-100 bg-white flex justify-end shrink-0">
                    <button 
                        onClick={onClose}
                        className="px-8 py-3 text-sm font-bold text-slate-600 hover:text-slate-900 bg-slate-100 hover:bg-slate-200 rounded-xl transition-colors focus:outline-none focus:ring-2 focus:ring-slate-200"
                    >
                        Cancel
                    </button>
                </footer>
            </motion.div>
        </div>
    );
};

export default TemplateSelectorModal;
