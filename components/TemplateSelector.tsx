
import React, { useState, useMemo } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { templates } from './templates/templateData';
import { TemplateKey, ResumeData } from '../types';
import ResumePreview from './ResumePreview';

interface TemplateSelectorProps {
    currentTemplate: TemplateKey;
    onTemplateChange: (template: TemplateKey) => void;
    resumeData: ResumeData;
}

const TemplateSelector: React.FC<TemplateSelectorProps> = ({ currentTemplate, onTemplateChange, resumeData }) => {
    const [activeCategory, setActiveCategory] = useState<string>('All');
    
    const categories = useMemo(() => {
        const cats = new Set<string>(['All', 'True ATS']);
        templates.forEach(t => t.categories.forEach(c => cats.add(c)));
        return Array.from(cats);
    }, []);

    const filteredTemplates = useMemo(() => {
        if (activeCategory === 'All') return templates;
        return templates.filter(t => t.categories.includes(activeCategory));
    }, [activeCategory]);

    return (
        <div className="space-y-8">
            <div className="flex flex-wrap gap-2 pb-4 border-b border-slate-100">
                {categories.map(cat => (
                    <button
                        key={cat}
                        onClick={() => setActiveCategory(cat)}
                        className={`px-5 py-2 rounded-full text-[11px] font-black uppercase tracking-widest transition-all ${
                            activeCategory === cat 
                            ? 'bg-emerald-600 text-white shadow-lg shadow-emerald-200 scale-105' 
                            : 'bg-white text-slate-500 hover:text-emerald-600 hover:border-emerald-200 border border-slate-200'
                        }`}
                    >
                        {cat}
                    </button>
                ))}
            </div>

            <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-8">
                <AnimatePresence mode="popLayout">
                    {filteredTemplates.map((template) => {
                        const isActive = currentTemplate === template.key;
                        return (
                            <motion.div
                                layout
                                initial={{ opacity: 0, scale: 0.9 }}
                                animate={{ opacity: 1, scale: 1 }}
                                exit={{ opacity: 0, scale: 0.9 }}
                                key={template.key}
                                role="button"
                                tabIndex={0}
                                onClick={() => onTemplateChange(template.key)}
                                onKeyDown={(e) => { if (e.key === 'Enter' || e.key === ' ') onTemplateChange(template.key); }}
                                className={`group relative rounded-2xl overflow-hidden border-2 transition-all cursor-pointer ${
                                    isActive ? 'border-emerald-600 shadow-xl ring-4 ring-emerald-50' : 'border-slate-100 hover:border-slate-300 hover:shadow-lg'
                                }`}
                                whileHover={{ y: -4 }}
                                whileTap={{ scale: 0.98 }}
                            >
                                <div className="aspect-[1/1.414] bg-white relative pointer-events-none overflow-hidden preview-mode">
                                    <div className="absolute inset-0" style={{ transform: 'scale(0.25)', transformOrigin: 'top left', width: '400%', height: '400%' }}>
                                        <ResumePreview 
                                            data={resumeData} 
                                            templateId={template.key} 
                                            customization={{
                                                color: 'indigo', font: 'inter', margin: 'normal', nameSize: 28, titleSize: 16, sectionTitleSize: 14,
                                                itemTitleSize: 11.5, bodySize: 10.5, lineHeight: 1.5, sectionTitleColor: '#1e1b4b',
                                                sectionTitleBorderStyle: 'none', sectionTitleBorderColor: '#e0e7ff', sectionTitleUppercase: true,
                                                ...template.customization
                                            }} 
                                            sectionOrder={['summary', 'experience', 'education', 'skills', 'projects', 'certifications', 'awards', 'keywords']} 
                                            sectionVisibility={{ summary: true, experience: true, education: true, skills: true, projects: true, certifications: true, awards: true, keywords: true }} 
                                            onDataChange={() => {}} 
                                        />
                                    </div>
                                    <div className="absolute inset-0 bg-gradient-to-t from-black/40 via-transparent to-transparent opacity-0 group-hover:opacity-100 transition-opacity flex items-end justify-center pb-8">
                                        <div className="px-4 py-2 bg-white text-slate-900 rounded-full text-[10px] font-black uppercase tracking-widest shadow-xl transform translate-y-4 group-hover:translate-y-0 transition-transform">
                                            Select Template
                                        </div>
                                    </div>
                                </div>
                                <div className="p-4 bg-white border-t border-slate-50 flex items-center justify-between">
                                    <div className="flex flex-col gap-0.5">
                                        <span className="text-xs font-black text-slate-900 uppercase tracking-wider">{template.name}</span>
                                        <span className="text-[9px] font-bold text-slate-400 uppercase tracking-widest">{template.categories[0]}</span>
                                    </div>
                                    {isActive && (
                                        <div className="w-6 h-6 rounded-full bg-emerald-600 flex items-center justify-center shadow-lg shadow-emerald-200">
                                            <svg className="w-4 h-4 text-white" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={3}><path strokeLinecap="round" strokeLinejoin="round" d="M5 13l4 4L19 7" /></svg>
                                        </div>
                                    )}
                                </div>
                            </motion.div>
                        );
                    })}
                </AnimatePresence>
            </div>
        </div>
    );
};

export default TemplateSelector;
