
import React from 'react';
import { motion } from 'framer-motion';
import { ResumeData, Customization, ResumeSectionKey, ColorTheme, FontTheme } from '../types';
import { TemplateInfo } from './templates/templateData';

interface TemplatePreviewModalProps {
    template: TemplateInfo;
    resumeData: ResumeData;
    onClose: () => void;
    onSelect: () => void;
}

const fontClassMap: Record<FontTheme, string> = {
  jakarta: 'font-sans',
  inter: 'font-sans', 
  roboto: 'font-roboto', 
  lato: 'font-lato', 
  montserrat: 'font-montserrat', 
  'source-sans': 'font-source-sans', 
  lora: 'font-lora', 
  playfair: 'font-serif',
  'roboto-mono': 'font-roboto-mono',
  'open-sans': 'font-open-sans',
  'poppins': 'font-poppins',
  'merriweather': 'font-merriweather',
  'nunito': 'font-nunito',
  'oswald': 'font-oswald',
  'raleway': 'font-raleway',
  'crimson-pro': 'font-crimson-pro',
  'work-sans': 'font-work-sans',
  'jetbrains-mono': 'font-jetbrains-mono',
  'times-new-roman': 'font-times-new-roman',
  'tahoma': 'font-tahoma',
  'verdana': 'font-verdana',
  'arial': 'font-arial',
  'helvetica': 'font-helvetica',
  'calibri': 'font-calibri',
  'georgia': 'font-georgia',
  'cambria': 'font-cambria',
  'gill-sans': 'font-gill-sans',
  'garamond': 'font-garamond',
};

const colorVarMap: Record<ColorTheme, React.CSSProperties> = {
  blue: { '--primary-color': '#2563eb', '--primary-color-light': '#dbeafe', '--primary-color-dark': '#1d4ed8', '--text-on-primary': '#ffffff' } as React.CSSProperties,
  indigo: { '--primary-color': '#4f46e5', '--primary-color-light': '#e0e7ff', '--primary-color-dark': '#3730a3', '--text-on-primary': '#ffffff' } as React.CSSProperties,
  emerald: { '--primary-color': '#059669', '--primary-color-light': '#d1fae5', '--primary-color-dark': '#047857', '--text-on-primary': '#ffffff' } as React.CSSProperties,
  rose: { '--primary-color': '#e11d48', '--primary-color-light': '#ffe4e6', '--primary-color-dark': '#be123c', '--text-on-primary': '#ffffff' } as React.CSSProperties,
  slate: { '--primary-color': '#475569', '--primary-color-light': '#f1f5f9', '--primary-color-dark': '#334155', '--text-on-primary': '#ffffff' } as React.CSSProperties,
  orange: { '--primary-color': '#f97316', '--primary-color-light': '#ffedd5', '--primary-color-dark': '#ea580c', '--text-on-primary': '#ffffff' } as React.CSSProperties,
  amber: { '--primary-color': '#f59e0b', '--primary-color-light': '#fef3c7', '--primary-color-dark': '#d97706', '--text-on-primary': '#ffffff' } as React.CSSProperties,
};

const defaultCustomization: Customization = {
    color: 'slate', font: 'times-new-roman', margin: 'normal', nameSize: 28, titleSize: 16,
    sectionTitleSize: 14, itemTitleSize: 11.5, bodySize: 10.5, lineHeight: 1.5,
    sectionTitleColor: '#374151', sectionTitleBorderStyle: 'underline',
    sectionTitleBorderColor: '#d1d5db', sectionTitleUppercase: true,
};

const ALL_SECTIONS: ResumeSectionKey[] = ['summary', 'experience', 'projects', 'education', 'skills', 'certifications', 'awards'];

const TemplatePreviewModal: React.FC<TemplatePreviewModalProps> = ({ template, resumeData, onClose, onSelect }) => {
    const TemplateComponent = template.component;
    const sectionVisibility = ALL_SECTIONS.reduce((acc, section) => ({...acc, [section]: true }), {} as Record<ResumeSectionKey, boolean>);
    const customization = { ...defaultCustomization, ...template.customization };
    const colorVars = colorVarMap[customization.color] || colorVarMap.slate;
    const fontClass = fontClassMap[customization.font] || 'font-sans';
    
    const dynamicStyles: React.CSSProperties = {
        ...colorVars,
        fontSize: `${customization.bodySize}pt`,
        lineHeight: customization.lineHeight,
    };

    return (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-slate-900/70 backdrop-blur-sm" onClick={onClose}>
            <motion.div
                initial={{ opacity: 0, scale: 0.9 }}
                animate={{ opacity: 1, scale: 1 }}
                exit={{ opacity: 0, scale: 0.9 }}
                className="w-full max-w-4xl h-[90vh] bg-slate-50 rounded-xl shadow-2xl flex flex-col overflow-hidden"
                onClick={e => e.stopPropagation()}
            >
                <header className="flex-shrink-0 p-4 bg-white border-b border-slate-200 flex justify-between items-center">
                    <div>
                        <h3 className="text-lg font-bold text-slate-800">{template.name}</h3>
                        <p className="text-sm text-slate-500">{template.description}</p>
                    </div>
                    <div className="flex items-center gap-3">
                        <button onClick={onClose} className="text-sm font-medium text-slate-600 hover:text-slate-900">Cancel</button>
                        <button onClick={onSelect} className="px-5 py-2 text-sm font-bold text-white bg-primary rounded-lg hover:bg-primary-700 shadow-sm">
                            Select Template
                        </button>
                    </div>
                </header>
                <main className="flex-grow overflow-auto custom-scrollbar p-8">
                    <div 
                        className="w-[8.5in] min-h-[11in] mx-auto bg-white shadow-xl ring-1 ring-slate-900/5"
                    >
                         <div className={`resume-preview-container ${fontClass}`} style={dynamicStyles}>
                             <TemplateComponent 
                                data={resumeData} 
                                customization={customization} 
                                sectionOrder={ALL_SECTIONS} 
                                sectionVisibility={sectionVisibility} 
                                onDataChange={() => {}} // No-op
                            />
                        </div>
                    </div>
                </main>
            </motion.div>
        </div>
    );
};

export default TemplatePreviewModal;
