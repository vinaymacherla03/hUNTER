
import React, { useState, useEffect, useRef } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { Wand2, RefreshCw, AlertCircle } from 'lucide-react';
import { ResumeData, Project } from '../../../types';
import FormField from '../FormField';
import FormSection from '../FormSection';
import { generateProjectImage, generateAgentSuggestion } from '../../../services/geminiService';
import SparkleIcon from '../../icons/SparkleIcon';
import RewriteSuggestionModal from '../RewriteSuggestionModal';

import Tooltip from '../../Tooltip';

interface Props {
  data: ResumeData;
  onDataChange: (path: string, value: any) => void;
  jobDescription: string;
  onSmartTailor?: () => void;
}

const newProjectEntry: Project = {
    id: '',
    name: '',
    role: '',
    description: [''],
    technologies: [],
};

const ProjectsForm: React.FC<Props> = ({ data, onDataChange, jobDescription, onSmartTailor }) => {
    const [generatingImageFor, setGeneratingImageFor] = useState<number | null>(null);
    const [generationError, setGenerationError] = useState<string | null>(null);
    const [modalState, setModalState] = useState<{ isOpen: boolean; originalText: string; suggestion: string; reason: string; path: string; } | null>(null);
    const [isThinking, setIsThinking] = useState<string | null>(null);
    const [popoverOpenFor, setPopoverOpenFor] = useState<string | null>(null);
    const popoverRef = useRef<HTMLDivElement>(null);

     useEffect(() => {
        const handleClickOutside = (event: MouseEvent) => {
            if (popoverRef.current && !popoverRef.current.contains(event.target as Node)) {
                setPopoverOpenFor(null);
            }
        };
        document.addEventListener("mousedown", handleClickOutside);
        return () => {
            document.removeEventListener("mousedown", handleClickOutside);
        };
    }, []);

    const handleAdd = () => {
        const newEntry = { ...newProjectEntry, id: `proj-${Date.now()}-${Math.random().toString(36).substr(2, 9)}` };
        onDataChange('projects', [...(data.projects || []), newEntry]);
    };

    const handleRemove = (index: number) => {
        const newEntries = [...(data.projects || [])];
        newEntries.splice(index, 1);
        onDataChange('projects', newEntries);
    };

    const handleGenerateImage = async (index: number) => {
        if (!data.projects) return;
        setGeneratingImageFor(index);
        setGenerationError(null);
        try {
            const project = data.projects[index];
            if (!project.name || project.description.every(d => !d.trim())) {
                setGenerationError("Please add a project name and description first to generate a relevant image.");
                setGeneratingImageFor(null);
                return;
            }
            const imageUrl = await generateProjectImage(project);
            onDataChange(`projects[${index}].image`, imageUrl);
        } catch (error) {
            console.error(error);
            setGenerationError(error instanceof Error ? error.message : 'Failed to generate image.');
        } finally {
            setGeneratingImageFor(null);
        }
    };
    
    const handleRewrite = async (projIndex: number, descIndex: number, action: 'IMPACT' | 'CONCISE') => {
        if (!data.projects) return;
        setPopoverOpenFor(null);
        const path = `projects[${projIndex}].description[${descIndex}]`;
        const originalText = data.projects[projIndex].description[descIndex];
         if (!originalText.trim()) {
            alert("Please write something in the bullet point first.");
            return;
        }
        setIsThinking(path);
        try {
            const promptType = action === 'IMPACT'
                ? 'REWRITE_EXPERIENCE_BULLET_WITH_REASON'
                : 'COMPACT_EXPERIENCE_BULLET_WITH_REASON';

            const result = await generateAgentSuggestion(promptType, { bulletPoint: originalText, jobDescription });
            if (typeof result === 'object' && 'rewritten' in result) {
                setModalState({
                    isOpen: true,
                    originalText,
                    suggestion: result.rewritten,
                    reason: result.reason,
                    path,
                });
            }
        } catch (error) {
            console.error(error);
            alert(error instanceof Error ? error.message : "Sorry, I couldn't generate a suggestion right now.");
        } finally {
            setIsThinking(null);
        }
    };

    const handleDescriptionChange = (projIndex: number, descIndex: number, value: string) => {
        if (!data.projects) return;
        const newDesc = [...data.projects[projIndex].description];
        newDesc[descIndex] = value;
        onDataChange(`projects[${projIndex}].description`, newDesc);
    };

    const handleAddDescription = (projIndex: number) => {
        if (!data.projects) return;
        const newDesc = [...data.projects[projIndex].description, ''];
        onDataChange(`projects[${projIndex}].description`, newDesc);
    };

    const handleRemoveDescription = (projIndex: number, descIndex: number) => {
        if (!data.projects) return;
        const newDesc = [...data.projects[projIndex].description];
        newDesc.splice(descIndex, 1);
        onDataChange(`projects[${projIndex}].description`, newDesc);
    };

    return (
        <motion.div
            initial={{ opacity: 0, x: 20 }}
            animate={{ opacity: 1, x: 0 }}
            transition={{ duration: 0.5, ease: [0.16, 1, 0.3, 1] }}
        >
            <div className="flex items-center justify-between mb-8">
                <div>
                   <h2 className="text-2xl font-bold font-display text-slate-900 mb-1">Projects</h2>
                   <p className="text-sm text-slate-500">Showcase your best work and technical prowess.</p>
                </div>
                {onSmartTailor && jobDescription.trim() && (
                    <Tooltip content="Automatically rewrite all projects to highlight skills relevant to the job" position="left">
                        <motion.button
                            whileHover={{ scale: 1.05 }}
                            whileTap={{ scale: 0.95 }}
                            type="button"
                            onClick={onSmartTailor}
                            className="flex items-center gap-2 px-4 py-2 bg-emerald-50 text-emerald-600 rounded-xl text-[10px] font-black uppercase tracking-widest hover:bg-emerald-100 transition-all border border-emerald-100 shadow-sm"
                        >
                            <Wand2 className="w-3.5 h-3.5" />
                            AI Optimize
                        </motion.button>
                    </Tooltip>
                )}
            </div>
            <div className="space-y-10 relative before:absolute before:left-[11px] before:top-4 before:bottom-4 before:w-[2px] before:bg-slate-100 before:content-['']">
                <AnimatePresence initial={false}>
                {(data.projects || []).map((proj, index) => {
                    if (!proj) return null;
                    return (
                        <motion.div 
                            key={`${proj.id || 'proj'}-${index}`}
                            initial={{ opacity: 0, x: -20 }}
                            animate={{ opacity: 1, x: 0 }}
                            exit={{ opacity: 0, scale: 0.95 }}
                            transition={{ type: "spring", stiffness: 300, damping: 30, delay: index * 0.05 }}
                            className="relative pl-10 group/proj"
                        >
                            {/* Timeline Anchor */}
                            <div className="absolute left-0 top-6 w-6 h-6 bg-white border-2 border-slate-200 rounded-full z-10 flex items-center justify-center transition-all duration-500 group-hover/proj:border-emerald-500 group-hover/proj:scale-110">
                                <div className="w-2 h-2 bg-slate-400 rounded-full transition-colors duration-500 group-hover/proj:bg-emerald-500" />
                            </div>

                            <FormSection title={proj.name || `Project #${index + 1}`} onRemove={() => handleRemove(index)}>
                                <div className="space-y-6">
                                    <div className="grid grid-cols-1 md:grid-cols-2 gap-x-6 gap-y-4">
                                        <FormField label="Project Name" name={`name-${index}`} value={proj.name} onChange={e => onDataChange(`projects[${index}].name`, e.target.value)} required />
                                        <FormField label="Your Role" name={`role-${index}`} value={proj.role} onChange={e => onDataChange(`projects[${index}].role`, e.target.value)} required />
                                        <FormField label="Start Date" name={`startDate-${index}`} value={proj.startDate || ''} onChange={e => onDataChange(`projects[${index}].startDate`, e.target.value)} />
                                        <FormField label="End Date" name={`endDate-${index}`} value={proj.endDate || ''} onChange={e => onDataChange(`projects[${index}].endDate`, e.target.value)} />
                                    </div>
                                    
                                    <FormField label="Technologies (comma-separated)" name={`tech-${index}`} value={(proj.technologies || []).join(', ')} onChange={e => onDataChange(`projects[${index}].technologies`, e.target.value.split(',').map(s => s.trim()))} />
                                    <FormField label="Project Link" name={`link-${index}`} type="url" value={proj.link || ''} onChange={e => onDataChange(`projects[${index}].link`, e.target.value)} />
                                    
                                    <div className="bg-slate-50/50 p-6 rounded-2xl border border-slate-100">
                                        <label className="block text-[10px] font-black uppercase tracking-widest text-slate-400 mb-3 ml-1">Key Contributions & Achievements</label>
                                        <div className="space-y-3">
                                            <AnimatePresence initial={false}>
                                            {(proj.description || []).map((desc, descIndex) => (
                                                <motion.div 
                                                    key={`proj-desc-${index}-${descIndex}`} 
                                                    initial={{ opacity: 0, y: 10 }}
                                                    animate={{ opacity: 1, y: 0 }}
                                                    exit={{ opacity: 0, scale: 0.95 }}
                                                    className="flex items-start gap-3 group/bullet relative"
                                                >
                                                    <div className="mt-4 w-1.5 h-1.5 rounded-full bg-slate-300 shrink-0 group-hover/bullet:bg-emerald-400 transition-colors" />
                                                    <textarea
                                                        value={desc || ''}
                                                        onChange={e => handleDescriptionChange(index, descIndex, e.target.value)}
                                                        rows={2}
                                                        className="flex-grow text-sm py-2 bg-transparent focus:outline-none focus:ring-0 text-slate-700 resize-none min-h-[40px] border-b border-transparent focus:border-emerald-500/20 transition-all font-medium"
                                                        placeholder="Developed a core module that..."
                                                    />
                                                    <div className="flex items-center gap-1 opacity-0 group-hover/bullet:opacity-100 transition-opacity">
                                                        <div className="relative">
                                                            <button 
                                                                type="button" 
                                                                onClick={() => setPopoverOpenFor(popoverOpenFor === `${index}-${descIndex}` ? null : `${index}-${descIndex}`)} 
                                                                disabled={!!isThinking} 
                                                                className="p-1.5 rounded-lg text-slate-400 hover:bg-emerald-100 hover:text-emerald-600 transition-all"
                                                                title="AI Rewrite"
                                                            >
                                                                {isThinking === `projects[${index}].description[${descIndex}]` ? (
                                                                    <RefreshCw className="w-3.5 h-3.5 animate-spin" />
                                                                ) : (
                                                                    <SparkleIcon className="w-3.5 h-3.5" />
                                                                )}
                                                            </button>
                                                            <AnimatePresence>
                                                                {popoverOpenFor === `${index}-${descIndex}` && (
                                                                    <motion.div
                                                                        ref={popoverRef}
                                                                        initial={{ opacity: 0, y: 10, scale: 0.95 }}
                                                                        animate={{ opacity: 1, y: 0, scale: 1 }}
                                                                        exit={{ opacity: 0, y: 10, scale: 0.95 }}
                                                                        className="absolute right-0 bottom-full mb-2 w-48 bg-white border border-slate-200 rounded-xl shadow-2xl z-[100] p-2 overflow-hidden"
                                                                    >
                                                                        <button onClick={() => handleRewrite(index, descIndex, 'IMPACT')} className="w-full text-left text-[10px] font-black uppercase tracking-widest px-3 py-2.5 rounded-lg hover:bg-slate-50 text-slate-600 hover:text-slate-950 transition-all">Make Impactful</button>
                                                                        <button onClick={() => handleRewrite(index, descIndex, 'CONCISE')} className="w-full text-left text-[10px] font-black uppercase tracking-widest px-3 py-2.5 rounded-lg hover:bg-slate-50 text-slate-600 hover:text-slate-950 transition-all">Make Concise</button>
                                                                    </motion.div>
                                                                )}
                                                            </AnimatePresence>
                                                        </div>
                                                        <button 
                                                            type="button" 
                                                            onClick={() => handleRemoveDescription(index, descIndex)} 
                                                            className="p-1.5 rounded-lg text-slate-400 hover:bg-rose-50 hover:text-rose-500 transition-all"
                                                        >
                                                            <svg xmlns="http://www.w3.org/2000/svg" className="h-3.5 w-3.5" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={3}><path strokeLinecap="round" strokeLinejoin="round" d="M6 18L18 6M6 6l12 12" /></svg>
                                                        </button>
                                                    </div>
                                                </motion.div>
                                            ))}
                                            </AnimatePresence>
                                        </div>
                                        <motion.button 
                                            whileHover={{ scale: 1.01 }}
                                            whileTap={{ scale: 0.99 }}
                                            type="button" 
                                            onClick={() => handleAddDescription(index)} 
                                            className="w-full mt-4 py-2.5 text-[10px] font-black uppercase tracking-widest rounded-xl text-slate-400 border border-dashed border-slate-200 hover:border-emerald-300 hover:text-emerald-600 hover:bg-white transition-all"
                                        >
                                            + Add Project Highlight
                                        </motion.button>
                                    </div>
                
                                    <div className="pt-4 border-t border-slate-100 flex flex-col gap-4">
                                        <label className="block text-[10px] font-black uppercase tracking-widest text-slate-400 ml-1">Project Visual Presence</label>
                                        {proj.image ? (
                                            <div className="relative group/img aspect-video rounded-2xl overflow-hidden border border-slate-200 shadow-sm bg-slate-100">
                                                <img src={proj.image} alt={proj.name} className="w-full h-full object-cover transition-transform duration-700 group-hover/img:scale-105" />
                                                <div className="absolute inset-0 bg-slate-950/60 opacity-0 group-hover/img:opacity-100 flex flex-col items-center justify-center transition-all p-6 text-center">
                                                    <p className="text-white text-xs font-bold mb-4">Would you like to try a different visual for this project?</p>
                                                    <button
                                                        type="button"
                                                        onClick={() => handleGenerateImage(index)}
                                                        disabled={generatingImageFor === index}
                                                        className="flex items-center gap-2 px-5 py-2.5 bg-white text-slate-950 rounded-xl text-[10px] font-black uppercase tracking-widest hover:bg-emerald-400 hover:text-white transition-all shadow-lg active:scale-95"
                                                    >
                                                        {generatingImageFor === index ? <RefreshCw className="w-3.5 h-3.5 animate-spin" /> : <RefreshCw className="w-3.5 h-3.5" />}
                                                        Regenerate Art
                                                    </button>
                                                </div>
                                            </div>
                                        ) : (
                                            <motion.button
                                                whileHover={{ scale: 1.01 }}
                                                whileTap={{ scale: 0.99 }}
                                                type="button"
                                                onClick={() => handleGenerateImage(index)}
                                                disabled={generatingImageFor === index}
                                                className="w-full flex flex-col items-center justify-center p-8 border-2 border-dashed border-slate-200 bg-slate-50/50 rounded-2xl hover:bg-emerald-50/30 hover:border-emerald-200 transition-all group/gen"
                                            >
                                                {generatingImageFor === index ? (
                                                    <>
                                                        <RefreshCw className="w-6 h-6 text-emerald-500 animate-spin mb-3" />
                                                        <span className="text-[10px] font-black uppercase tracking-widest text-emerald-600">AI Artist is Thinking...</span>
                                                    </>
                                                ) : (
                                                    <>
                                                        <div className="w-12 h-12 rounded-xl bg-white shadow-sm flex items-center justify-center text-emerald-500 mb-3 group-hover/gen:scale-110 transition-transform">
                                                            <SparkleIcon className="w-6 h-6" />
                                                        </div>
                                                        <span className="text-[10px] font-black uppercase tracking-widest text-slate-500 group-hover/gen:text-emerald-600">Generate Hero Image with AI</span>
                                                        <span className="text-[9px] font-medium text-slate-400 mt-1">Perfect for public portfolios</span>
                                                    </>
                                                )}
                                            </motion.button>
                                        )}
                                        {generationError && generatingImageFor !== index && (
                                            <div className="p-3 bg-rose-50 rounded-xl flex items-center gap-2 text-rose-600 text-[10px] font-bold uppercase tracking-widest">
                                                <AlertCircle className="w-3.5 h-3.5 flex-shrink-0" />
                                                {generationError}
                                            </div>
                                        )}
                                    </div>
                                </div>
                            </FormSection>
                        </motion.div>
                    )
                })}
                </AnimatePresence>
            </div>
            
            <motion.button
                whileHover={{ scale: 1.01 }}
                whileTap={{ scale: 0.99 }}
                type="button"
                onClick={handleAdd}
                className="w-full mt-10 p-5 bg-slate-950 text-white rounded-[2rem] font-black text-[11px] uppercase tracking-[0.2em] shadow-2xl shadow-slate-950/20 hover:shadow-emerald-500/20 hover:bg-emerald-600 transition-all flex items-center justify-center gap-3 active:scale-[0.98]"
            >
                <div className="w-6 h-6 rounded-full bg-white/20 flex items-center justify-center text-white">+</div>
                Add New Project Showcase
            </motion.button>

            <AnimatePresence>
                {modalState?.isOpen && (
                    <RewriteSuggestionModal
                        originalText={modalState.originalText}
                        suggestion={modalState.suggestion}
                        reason={modalState.reason}
                        onClose={() => setModalState(null)}
                        onApply={() => {
                            onDataChange(modalState.path, modalState.suggestion);
                            setModalState(null);
                        }}
                    />
                )}
            </AnimatePresence>
        </motion.div>
    );
};

export default ProjectsForm;