
import React, { useState, useEffect, useRef } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { ResumeData, Project } from '../../../types';
import FormField from '../FormField';
import FormSection from '../FormSection';
import { generateProjectImage, generateAgentSuggestion } from '../../../services/geminiService';
import SparkleIcon from '../../icons/SparkleIcon';
import RewriteSuggestionModal from '../RewriteSuggestionModal';

interface Props {
  data: ResumeData;
  onDataChange: (path: string, value: any) => void;
  jobDescription: string;
}

const newProjectEntry: Project = {
    id: '',
    name: '',
    role: '',
    description: [''],
    technologies: [],
};

const ProjectsForm: React.FC<Props> = ({ data, onDataChange, jobDescription }) => {
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
        const newEntry = { ...newProjectEntry, id: `proj-${Date.now()}` };
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
        <div>
            <h2 className="text-2xl font-bold font-display text-slate-900 mb-6">Projects</h2>
            {(data.projects || []).map((proj, index) => {
                if (!proj) return null;
                return (
                    <FormSection key={proj.id || index} title={proj.name || `Project #${index + 1}`} onRemove={() => handleRemove(index)}>
                        <FormField label="Project Name" name={`name-${index}`} value={proj.name} onChange={e => onDataChange(`projects[${index}].name`, e.target.value)} required />
                        <FormField label="Your Role" name={`role-${index}`} value={proj.role} onChange={e => onDataChange(`projects[${index}].role`, e.target.value)} required />
                        <div className="grid grid-cols-1 md:grid-cols-2 gap-x-4">
                            <FormField label="Start Date" name={`startDate-${index}`} value={proj.startDate || ''} onChange={e => onDataChange(`projects[${index}].startDate`, e.target.value)} />
                            <FormField label="End Date" name={`endDate-${index}`} value={proj.endDate || ''} onChange={e => onDataChange(`projects[${index}].endDate`, e.target.value)} />
                        </div>
                         <FormField label="Technologies (comma-separated)" name={`tech-${index}`} value={(proj.technologies || []).join(', ')} onChange={e => onDataChange(`projects[${index}].technologies`, e.target.value.split(',').map(s => s.trim()))} />
                         <FormField label="Project Link" name={`link-${index}`} type="url" value={proj.link || ''} onChange={e => onDataChange(`projects[${index}].link`, e.target.value)} />
                        
                        <div className="mb-4">
                            <label className="block text-sm font-medium text-slate-600 mb-1.5">Description</label>
                            {(proj.description || []).map((desc, descIndex) => (
                                 <div key={descIndex} className="flex items-start gap-2 group mb-1.5">
                                    <textarea
                                        value={desc || ''}
                                        onChange={e => handleDescriptionChange(index, descIndex, e.target.value)}
                                        rows={2}
                                        className="flex-grow text-sm p-2 border border-slate-300 rounded-md shadow-sm focus:outline-none focus:ring-2 focus:ring-primary bg-white text-slate-900 resize-y min-h-[40px]"
                                        placeholder="e.g., Developed a new feature which..."
                                    />
                                    <div className="flex flex-col gap-1.5 pt-1.5">
                                        <div className="relative">
                                            <button type="button" onClick={() => setPopoverOpenFor(popoverOpenFor === `${index}-${descIndex}` ? null : `${index}-${descIndex}`)} disabled={!!isThinking} className="p-1.5 rounded-full text-slate-400 hover:bg-primary-100 hover:text-primary transition-colors disabled:opacity-50" title="Improve with AI">
                                                {isThinking === `projects[${index}].description[${descIndex}]` ? (
                                                    <svg className="animate-spin h-4 w-4 text-primary" xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24"><circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4"></circle><path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4z"></path></svg>
                                                ) : (
                                                    <SparkleIcon className="w-4 h-4" />
                                                )}
                                            </button>
                                            <AnimatePresence>
                                                {popoverOpenFor === `${index}-${descIndex}` && (
                                                    <motion.div
                                                        ref={popoverRef}
                                                        initial={{ opacity: 0, y: -10 }}
                                                        animate={{ opacity: 1, y: 0 }}
                                                        exit={{ opacity: 0, y: -10 }}
                                                        className="absolute top-full right-0 mt-2 w-48 bg-white border border-slate-200 rounded-lg shadow-xl z-10 p-2 space-y-1"
                                                    >
                                                        <button onClick={() => handleRewrite(index, descIndex, 'IMPACT')} className="w-full text-left text-sm px-3 py-1.5 rounded-md hover:bg-slate-100 flex items-center gap-2">Make More Impactful</button>
                                                        <button onClick={() => handleRewrite(index, descIndex, 'CONCISE')} className="w-full text-left text-sm px-3 py-1.5 rounded-md hover:bg-slate-100 flex items-center gap-2">Make More Concise</button>
                                                    </motion.div>
                                                )}
                                            </AnimatePresence>
                                        </div>
                                        <button type="button" onClick={() => handleRemoveDescription(index, descIndex)} className="p-1.5 rounded-full text-slate-400 hover:bg-red-100 hover:text-red-500 transition-colors" title="Remove bullet point">
                                            <svg xmlns="http://www.w3.org/2000/svg" className="h-4 w-4" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}><path strokeLinecap="round" strokeLinejoin="round" d="M6 18L18 6M6 6l12 12" /></svg>
                                        </button>
                                    </div>
                                 </div>
                            ))}
                             <button type="button" onClick={() => handleAddDescription(index)} className="w-full mt-1 px-4 py-1.5 text-xs font-semibold rounded-lg text-slate-500 border border-dashed border-slate-300 hover:border-slate-400 hover:text-slate-600 transition-colors">
                                + Add Bullet Point
                            </button>
                        </div>
    
                        <div className="mt-3">
                            <label className="block text-sm font-medium text-slate-600 mb-1.5">Project Image</label>
                            {proj.image && (
                                <div className="mb-2 relative group aspect-video">
                                    <img src={proj.image} alt={`${proj.name} placeholder`} className="w-full h-full object-cover rounded-md border border-slate-200" />
                                    <div className="absolute inset-0 bg-black/60 opacity-0 group-hover:opacity-100 flex items-center justify-center transition-opacity rounded-md">
                                        <button
                                            type="button"
                                            onClick={() => handleGenerateImage(index)}
                                            disabled={generatingImageFor === index}
                                            className="flex items-center gap-2 px-3 py-1.5 text-xs font-semibold rounded-full text-white bg-white/10 hover:bg-white/20 backdrop-blur-sm transition-colors"
                                        >
                                            {generatingImageFor === index ? (
                                                'Regenerating...'
                                            ) : (
                                                <>
                                                    <svg xmlns="http://www.w3.org/2000/svg" className="h-4 w-4" viewBox="0 0 20 20" fill="currentColor"><path fillRule="evenodd" d="M4 2a1 1 0 011 1v2.101a7.002 7.002 0 0111.601 2.566 1 1 0 11-1.885.666A5.002 5.002 0 005.999 7H9a1 1 0 110 2H4a1 1 0 01-1-1V3a1 1 0 011-1zm.008 9.057a1 1 0 011.276.61A5.002 5.002 0 0014.001 13H11a1 1 0 110-2h5a1 1 0 011 1v5a1 1 0 11-2 0v-2.101a7.002 7.002 0 01-11.601-2.566 1 1 0 01.61-1.276z" clipRule="evenodd" /></svg>
                                                    Regenerate
                                                </>
                                            )}
                                        </button>
                                    </div>
                                </div>
                            )}
                             {!proj.image && (
                                <button
                                    type="button"
                                    onClick={() => handleGenerateImage(index)}
                                    disabled={generatingImageFor === index}
                                    className="w-full flex items-center justify-center gap-2 px-4 py-2 text-sm font-semibold rounded-lg text-slate-600 border border-slate-300 bg-slate-50 hover:bg-slate-100 hover:text-slate-800 transition-colors disabled:opacity-50"
                                >
                                    {generatingImageFor === index ? (
                                        <>
                                            <svg className="animate-spin h-5 w-5" xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24"><circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4"></circle><path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4z"></path></svg>
                                            <span>Generating...</span>
                                        </>
                                    ) : (
                                        <>
                                            <SparkleIcon className="h-5 w-5 text-primary" />
                                            <span>Generate Placeholder Image</span>
                                        </>
                                    )}
                                </button>
                            )}
                            {generationError && generatingImageFor !== index && <p className="text-xs text-red-500 mt-1">{generationError}</p>}
                        </div>
                    </FormSection>
                )
            })}
            <button
                type="button"
                onClick={handleAdd}
                className="w-full mt-2 px-4 py-2 text-sm font-semibold rounded-lg text-slate-500 border-2 border-dashed border-slate-300 hover:border-primary hover:text-primary hover:bg-primary-50 transition-colors"
            >
                + Add Project
            </button>
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
        </div>
    );
};

export default ProjectsForm;