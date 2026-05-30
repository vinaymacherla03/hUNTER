
import React, { useState } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { ArrowRight, Layout } from 'lucide-react';
import { sampleResumeData } from './sampleData';
import { ResumeContext } from './builder/ResumeContext';
import { templates as availableTemplates } from './templates/templateData';

const TemplateIcon: React.FC<{ fallback: any; isActive: boolean }> = ({ fallback: FallbackIcon, isActive }) => {
    return <FallbackIcon className={`w-6 h-6 ${isActive ? 'text-white' : 'text-slate-500'}`} />;
};

const InteractiveTemplateShowcase: React.FC = () => {
    // Take the first 5 templates from our defined ATS templates
    const showcaseTemplates = availableTemplates.slice(0, 5);
    const [activeTemplate, setActiveTemplate] = useState(showcaseTemplates[0]);

    return (
        <section className="py-32 lg:py-48 px-6 lg:px-12 bg-white relative overflow-hidden" id="templates">
            <div className="max-w-7xl mx-auto relative z-10">
                <div className="text-center mb-16 lg:mb-24">
                    <motion.div
                        initial={{ opacity: 0, y: 20 }}
                        whileInView={{ opacity: 1, y: 0 }}
                        viewport={{ once: true }}
                        className="inline-flex items-center gap-2 px-4 py-1.5 rounded-full bg-slate-100 border border-slate-200 text-slate-600 text-[13px] font-medium mb-6"
                    >
                        <Layout className="w-4 h-4" />
                        Template Gallery
                    </motion.div>
                    <motion.h2 
                        initial={{ opacity: 0, y: 20 }}
                        whileInView={{ opacity: 1, y: 0 }}
                        viewport={{ once: true }}
                        transition={{ delay: 0.1 }}
                        className="text-5xl sm:text-6xl lg:text-7xl font-extrabold text-slate-900 leading-[1] tracking-tighter mb-6"
                    >
                        Designed for the <br />
                        <span className="text-transparent bg-clip-text bg-gradient-to-r from-emerald-600 to-teal-500">Top 1%.</span>
                    </motion.h2>
                    <motion.p 
                        initial={{ opacity: 0, y: 20 }}
                        whileInView={{ opacity: 1, y: 0 }}
                        viewport={{ once: true }}
                        transition={{ delay: 0.2 }}
                        className="text-lg text-slate-500 font-normal leading-relaxed max-w-2xl mx-auto"
                    >
                        Every template is engineered to balance aesthetic excellence with technical ATS compatibility. Choose your narrative style.
                    </motion.p>
                </div>

                <div className="grid grid-cols-1 lg:grid-cols-12 gap-12 lg:gap-16 items-start">
                    {/* Template Selector */}
                    <div className="lg:col-span-4 space-y-4">
                        {showcaseTemplates.map((template) => (
                            <motion.button
                                key={template.key}
                                onClick={() => setActiveTemplate(template)}
                                whileHover={{ scale: 1.01, y: -2 }}
                                whileTap={{ scale: 0.99 }}
                                className={`w-full text-left p-6 rounded-2xl transition-all duration-300 relative overflow-hidden ${
                                    activeTemplate.key === template.key 
                                    ? 'bg-slate-900 border-transparent shadow-lg' 
                                    : 'bg-white border-slate-200 hover:border-slate-300 shadow-sm hover:shadow-md'
                                } border`}
                            >
                                <div className="relative z-10">
                                    <div className={`w-12 h-12 rounded-xl flex items-center justify-center mb-4 transition-all duration-300 ${
                                        activeTemplate.key === template.key ? 'bg-white/10 backdrop-blur-md shadow-sm' : 'bg-slate-50 border border-slate-100 group-hover:bg-slate-100'
                                    }`}>
                                        <TemplateIcon 
                                            fallback={Layout} 
                                            isActive={activeTemplate.key === template.key} 
                                        />
                                    </div>
                                    <h3 className={`text-xl font-semibold tracking-tight mb-2 transition-colors ${
                                        activeTemplate.key === template.key ? 'text-white' : 'text-slate-900'
                                    }`}>
                                        {template.name}
                                    </h3>
                                    <p className={`text-[14px] leading-relaxed transition-colors ${
                                        activeTemplate.key === template.key ? 'text-slate-300' : 'text-slate-500'
                                    }`}>
                                        {template.description}
                                    </p>
                                </div>
                            </motion.button>
                        ))}
                        
                        <div className="pt-6">
                            <button className="w-full py-4 bg-white border border-slate-200 outline-none text-slate-800 rounded-xl font-medium text-[15px] shadow-sm hover:shadow-md hover:border-slate-300 active:scale-95 transition-all flex items-center justify-center gap-2">
                                Explore All Templates
                                <ArrowRight className="w-4 h-4" />
                            </button>
                        </div>
                    </div>

                    {/* Template Preview */}
                    <motion.div 
                        initial={{ opacity: 0, x: 20 }}
                        whileInView={{ opacity: 1, x: 0 }}
                        viewport={{ once: true }}
                        className="lg:col-span-8 relative group"
                    >
                        <div className="bg-white rounded-3xl shadow-xl shadow-slate-200/50 border border-slate-200 overflow-hidden relative aspect-[4/5] lg:aspect-auto lg:h-[800px]">
                            <div className="absolute inset-x-0 top-0 h-12 bg-slate-50 border-b border-slate-200 flex items-center px-4 gap-2 z-20 backdrop-blur-md">
                                <div className="w-3 h-3 rounded-full bg-rose-400 border border-rose-500/20" />
                                <div className="w-3 h-3 rounded-full bg-amber-400 border border-amber-500/20" />
                                <div className="w-3 h-3 rounded-full bg-emerald-400 border border-emerald-500/20" />
                                <div className="ml-4 px-3 py-1 bg-white border border-slate-200 rounded-md text-[11px] font-medium text-slate-500 flex items-center shadow-sm">
                                    Preview Mode: {activeTemplate.name}
                                </div>
                            </div>
                            
                            <div className="h-full pt-12 overflow-y-auto custom-scrollbar">
                                <AnimatePresence mode="wait">
                                    <motion.div
                                        key={activeTemplate.key}
                                        initial={{ opacity: 0, y: 20, scale: 0.98 }}
                                        animate={{ opacity: 1, y: 0, scale: 1 }}
                                        exit={{ opacity: 0, y: -20, scale: 0.98 }}
                                        transition={{ duration: 0.5, ease: [0.16, 1, 0.3, 1] }}
                                        className="p-8 lg:p-12 w-full mx-auto"
                                    >
                                        <ResumeContext.Provider value={{
                                            resumeData: sampleResumeData,
                                            jobDescription: '',
                                            onRewrite: () => {},
                                            onDataChange: () => {},
                                            onApplyTailoredResume: () => {},
                                            onInterviewPrep: () => {},
                                            isInterviewPrepLoading: false,
                                            isThinkingPath: null,
                                            aiSuggestions: {},
                                            onApplySuggestion: () => {},
                                            onClearSuggestion: () => {},
                                            readOnly: true
                                        }}>
                                            <activeTemplate.component 
                                                data={sampleResumeData} 
                                                sectionOrder={['summary', 'experience', 'education', 'skills']}
                                                sectionVisibility={{
                                                    summary: true,
                                                    experience: true,
                                                    education: true,
                                                    skills: true,
                                                    projects: true,
                                                    certifications: true,
                                                    awards: true,
                                                    keywords: true
                                                }}
                                                onDataChange={() => {}}
                                                customization={{
                                                    color: 'slate',
                                                    font: activeTemplate.customization.font || 'inter',
                                                    margin: activeTemplate.customization.margin || 'normal',
                                                    nameSize: 24,
                                                    titleSize: 14,
                                                    sectionTitleSize: 12,
                                                    itemTitleSize: 11,
                                                    bodySize: 10,
                                                    lineHeight: 1.5,
                                                    sectionTitleColor: '#0f172a',
                                                    sectionTitleBorderStyle: activeTemplate.customization.sectionTitleBorderStyle || 'underline',
                                                    sectionTitleBorderColor: '#0f172a',
                                                    sectionTitleUppercase: true
                                                }}
                                            />
                                        </ResumeContext.Provider>
                                    </motion.div>
                                </AnimatePresence>
                            </div>
                            
                            {/* Overlay Gradient */}
                            <div className="absolute inset-x-0 bottom-0 h-32 bg-gradient-to-t from-white via-white/80 to-transparent z-10 pointer-events-none" />
                        </div>
                    </motion.div>
                </div>
            </div>
        </section>
    );
};

export default InteractiveTemplateShowcase;
