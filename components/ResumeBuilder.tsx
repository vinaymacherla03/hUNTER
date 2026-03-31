
import React, { useState, useEffect } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { ResumeData, Customization, ResumeSectionKey, AuditResult, InterviewQuestion, TemplateKey } from '../types';
import { compactResumeContent, runResumeAudit, generateCoverLetter, generateAgentSuggestion, generateInterviewQuestions } from '../services/geminiService';
import { templates as allTemplates } from './templates/templateData';
import { ResumeContext } from './builder/ResumeContext';
import { CalendarService } from '../services/calendarService';
import { generateResumePlainText } from '../utils/resumeUtils';
import { Layout } from 'lucide-react';

import ResumePreview from './ResumePreview';
import JobTracker from './builder/JobTracker';
import AiAuditModal from './builder/AiAuditModal';
import CoverLetterModal from './builder/CoverLetterModal';
import RewriteSuggestionModal from './builder/RewriteSuggestionModal';
import InterviewPrepModal from './builder/InterviewPrepModal';
import EditorNavigation from './builder/EditorNavigation';
import EditorPanel from './builder/EditorPanel';
import DownloadDropdown from './DownloadDropdown';
import TemplateSelectorModal from './builder/TemplateSelectorModal';
import OnboardingTour from './OnboardingTour';
import CareerHub from './builder/CareerHub';

const DRAFT_STORAGE_KEY = 'aiResumeBuilderDraft';
const PREFERENCES_STORAGE_KEY = 'aiResumeBuilderPreferences';
const ONBOARDING_COMPLETED_KEY = 'aiResumeBuilderOnboardingCompleted';
const ALL_SECTIONS: ResumeSectionKey[] = ['summary', 'experience', 'projects', 'education', 'skills', 'certifications', 'awards', 'keywords'];

interface ResumeBuilderProps {
  initialData: ResumeData;
  initialDraft?: any | null;
  onStartOver: () => void;
  initialJobDescription?: string;
}

const defaultCustomization: Customization = {
    color: 'slate', font: 'times-new-roman', margin: 'normal', nameSize: 28, titleSize: 16, sectionTitleSize: 14,
    itemTitleSize: 11.5, bodySize: 10.5, lineHeight: 1.5, sectionTitleColor: '#374151',
    sectionTitleBorderStyle: 'underline', sectionTitleBorderColor: '#d1d5db', sectionTitleUppercase: true,
};

type ViewMode = 'editor' | 'board' | 'hub';
type MobileView = 'panels' | 'preview';

const loadPreferences = () => {
    try { return JSON.parse(localStorage.getItem(PREFERENCES_STORAGE_KEY) || 'null'); } catch { return null; }
};

const ResumeBuilder: React.FC<ResumeBuilderProps> = ({ initialData, initialDraft, onStartOver, initialJobDescription }) => {
    // Data State
    const [resumeData, setResumeData] = useState<ResumeData>(initialData);
    const [jobDescription, setJobDescription] = useState<string>(initialDraft?.jobDescription || initialJobDescription || '');
    
    // UI State
    const [activeMode, setActiveMode] = useState<ViewMode>('editor');
    const [activeTab, setActiveTab] = useState<'content' | 'design' | 'match' | 'interview'>('content');
    const [activeSection, setActiveSection] = useState<ResumeSectionKey | 'contact'>('contact');
    const [mobileView, setMobileView] = useState<MobileView>('panels');
    const [zoom, setZoom] = useState(0.8); 
    const [saveStatus, setSaveStatus] = useState<'idle' | 'saving' | 'saved'>('idle');
    const [isTemplateModalOpen, setIsTemplateModalOpen] = useState(false);
    const [isCalendarConnected, setIsCalendarConnected] = useState(false);

    useEffect(() => {
        CalendarService.isConnected().then(setIsCalendarConnected);
    }, []);
    
    // Preferences
    const initialTemplateKey = initialDraft?.template || (allTemplates.length > 0 ? allTemplates[0].key : '');
    const [template, setTemplate] = useState<TemplateKey>(initialTemplateKey);
    const [customization, setCustomization] = useState<Customization>(() => {
        const prefs = loadPreferences();
        const foundTemplate = allTemplates.find(t => t.key === template);
        const defaultTemplateCustomization = foundTemplate?.customization || {};
        return { ...defaultCustomization, ...defaultTemplateCustomization, ...(prefs?.customization || {}) };
    });
    const [sectionOrder, setSectionOrder] = useState<ResumeSectionKey[]>(initialDraft?.sectionOrder || ALL_SECTIONS);
    const [sectionVisibility, setSectionVisibility] = useState<Record<ResumeSectionKey, boolean>>(initialDraft?.sectionVisibility || { summary: true, experience: true, education: true, skills: true, projects: true, certifications: true, awards: true, keywords: true });
    
    // Feature States
    const [isCompacting, setIsCompacting] = useState(false);
    const [isAuditLoading, setIsAuditLoading] = useState(false);
    const [isCoverLetterLoading, setIsCoverLetterLoading] = useState(false);
    const [isInterviewPrepLoading, setIsInterviewPrepLoading] = useState(false);
    const [auditResult, setAuditResult] = useState<AuditResult | null>(null);
    const [coverLetterContent, setCoverLetterContent] = useState<string | null>(null);
    const [interviewQuestions, setInterviewQuestions] = useState<InterviewQuestion[] | null>(null);
    const [rewriteModalState, setRewriteModalState] = useState<any | null>(null);
    const [isThinkingPath, setIsThinkingPath] = useState<string | null>(null);
    const [isAiAgentOpen, setIsAiAgentOpen] = useState(false);
    const [runTour, setRunTour] = useState(false);

    useEffect(() => {
        const onboardingCompleted = localStorage.getItem(ONBOARDING_COMPLETED_KEY);
        if (!onboardingCompleted) {
            setRunTour(true);
        }
    }, []);

    const handleTourFinish = () => {
        setRunTour(false);
        localStorage.setItem(ONBOARDING_COMPLETED_KEY, 'true');
    };

    // Dynamic Zoom for mobile
    useEffect(() => {
        const updateZoom = () => {
            if (window.innerWidth < 640) setZoom(0.42);
            else if (window.innerWidth < 1024) setZoom(0.65);
            else setZoom(0.8);
        };
        updateZoom();
        window.addEventListener('resize', updateZoom);
        return () => window.removeEventListener('resize', updateZoom);
    }, []);

    // Persistence
    useEffect(() => {
        setSaveStatus('saving');
        const timer = setTimeout(() => {
            localStorage.setItem(DRAFT_STORAGE_KEY, JSON.stringify({ resumeData, template, customization, sectionOrder, sectionVisibility, jobDescription }));
            localStorage.setItem(PREFERENCES_STORAGE_KEY, JSON.stringify({ template, customization }));
            setSaveStatus('saved');
            setTimeout(() => setSaveStatus('idle'), 2000);
        }, 1000);
        return () => clearTimeout(timer);
    }, [resumeData, template, customization, sectionOrder, sectionVisibility, jobDescription]);

    const handleDataChange = (path: string, value: any) => {
        setResumeData(prevData => {
            const newData = JSON.parse(JSON.stringify(prevData));
            const keys = path.replace(/\[(\d+)\]/g, '.$1').split('.');
            let current: any = newData;
            for (let i = 0; i < keys.length - 1; i++) { current = current[keys[i]]; }
            current[keys[keys.length - 1]] = value;
            return newData;
        });
    };

    const handleCompactResume = async () => {
        setIsCompacting(true);
        try { setResumeData(await compactResumeContent(resumeData)); } catch (e) { console.error(e); } finally { setIsCompacting(false); }
    };
    const handleRunAudit = async () => {
        setIsAuditLoading(true);
        try { setAuditResult(await runResumeAudit(resumeData)); } catch (e) { console.error(e); } finally { setIsAuditLoading(false); }
    };
    const handleGenerateCoverLetter = async () => {
        setIsCoverLetterLoading(true);
        try { setCoverLetterContent(await generateCoverLetter(resumeData, jobDescription)); } catch (e) { console.error(e); } finally { setIsCoverLetterLoading(false); }
    };
    const handleGenerateInterviewPrep = async () => {
        setIsInterviewPrepLoading(true);
        try { 
            const questions = await generateInterviewQuestions(resumeData, jobDescription);
            setInterviewQuestions(questions);
            setActiveTab('interview');
        } catch (e) { 
            console.error(e); 
        } finally { 
            setIsInterviewPrepLoading(false); 
        }
    };

    const handleExportJson = () => {
        const dataStr = JSON.stringify(resumeData, null, 2);
        const dataUri = 'data:application/json;charset=utf-8,'+ encodeURIComponent(dataStr);
        const exportFileDefaultName = `${resumeData.fullName.replace(/\s+/g, '_')}_resume.json`;
        const linkElement = document.createElement('a');
        linkElement.setAttribute('href', dataUri);
        linkElement.setAttribute('download', exportFileDefaultName);
        linkElement.click();
    };

    const handleImportJson = (file: File) => {
        const reader = new FileReader();
        reader.onload = (e) => {
            try {
                const json = JSON.parse(e.target?.result as string);
                // Basic validation
                if (json && typeof json === 'object' && 'fullName' in json) {
                    setResumeData(json as ResumeData);
                } else {
                    alert("Invalid resume JSON format.");
                }
            } catch (error) {
                console.error("Error parsing JSON", error);
                alert("Failed to parse JSON file.");
            }
        };
        reader.readAsText(file);
    };

    const handleRewrite = async (path: string, originalText: string, type: 'summary' | 'bullet', mode: 'IMPACT' | 'CONCISE' = 'IMPACT') => {
        if (!originalText.trim()) return;
        setIsThinkingPath(path);
        try {
            let result;
            if (type === 'summary') {
                 result = await generateAgentSuggestion('WRITE_SUMMARY', { resume: resumeData, jobDescription, currentSummary: originalText });
            } else {
                const promptType = mode === 'IMPACT' ? 'REWRITE_EXPERIENCE_BULLET_WITH_REASON' : 'COMPACT_EXPERIENCE_BULLET_WITH_REASON';
                result = await generateAgentSuggestion(promptType, { bulletPoint: originalText, jobDescription });
            }
            if (typeof result === 'object' && 'rewritten' in result) {
                setRewriteModalState({ isOpen: true, originalText, suggestion: result.rewritten, reason: result.reason, path });
            }
        } catch (error) { console.error(error); } finally { setIsThinkingPath(null); }
    };

    const handleDownloadTxt = () => {
        const text = generateResumePlainText(resumeData);
        const blob = new Blob([text], { type: 'text/plain' });
        const url = URL.createObjectURL(blob);
        const link = document.createElement('a');
        link.href = url;
        link.download = `${resumeData.fullName.replace(/\s+/g, '_')}_Resume.txt`;
        document.body.appendChild(link);
        link.click();
        document.body.removeChild(link);
        URL.revokeObjectURL(url);
    };

    const handleVoiceAgentFunctionCall = async (name: string, args: any): Promise<string> => {
        try {
            switch (name) {
                case 'changeStyle':
                    const parsedValue = args.property.includes('Size') || args.property.includes('lineHeight') ? parseFloat(args.value) : args.value;
                    setCustomization(prev => ({ ...prev, [args.property]: parsedValue }));
                    return `Changed ${args.property} to ${args.value}.`;
                case 'getSkillSuggestions':
                    if (!args.jobDescription) return "Please tell me the job description so I can suggest skills.";
                    const suggestions = await generateAgentSuggestion('GET_SKILL_SUGGESTIONS', { jobDescription: args.jobDescription });
                    return `Here are some skill suggestions: ${suggestions}`;
                case 'navigate':
                    if (['content', 'design', 'match'].includes(args.section)) setActiveTab(args.section);
                    else if (ALL_SECTIONS.includes(args.section) || args.section === 'contact') { setActiveTab('content'); setActiveSection(args.section); }
                    return `Navigated to ${args.section}.`;
                case 'setSectionVisibility':
                    setSectionVisibility(prev => ({ ...prev, [args.section]: args.visible }));
                    return `Set ${args.section} section to ${args.visible ? 'visible' : 'hidden'}.`;
                default: return `Unknown function: ${name}`;
            }
        } catch (error) { return `Error: ${error instanceof Error ? error.message : String(error)}`; }
    };

    return (
        <ResumeContext.Provider value={{ 
            resumeData, 
            jobDescription, 
            onRewrite: handleRewrite, 
            onInterviewPrep: handleGenerateInterviewPrep,
            isInterviewPrepLoading,
            isThinkingPath 
        }}>
            <div className="flex flex-col h-screen w-screen bg-slate-50 overflow-hidden">
                <OnboardingTour run={runTour} onFinish={handleTourFinish} />
                
                {/* Header / Editor Navbar */}
                <header className="h-16 bg-white border-b border-slate-200 flex items-center justify-between px-4 sm:px-8 shrink-0 z-20">
                    <div className="flex items-center gap-6">
                        <div className="flex-shrink-0 lg:hidden">
                            <div className="w-8 h-8 rounded-lg bg-black flex items-center justify-center text-white">
                                <svg className="w-4 h-4" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="3"><path d="M13 10V3L4 14h7v7l9-11h-7z" /></svg>
                            </div>
                        </div>
                        
                        <div className="flex bg-slate-100 p-1 rounded-xl">
                            <button
                                id="tour-editor-btn"
                                onClick={() => setActiveMode('editor')}
                                className={`px-4 sm:px-6 py-2 rounded-lg text-[10px] sm:text-xs font-black uppercase tracking-widest transition-all ${activeMode === 'editor' ? 'bg-white text-black shadow-md' : 'text-slate-500 hover:text-slate-700'}`}
                            >
                                Editor
                            </button>
                            <button
                                id="tour-tracker-btn"
                                onClick={() => setActiveMode('board')}
                                className={`px-4 sm:px-6 py-2 rounded-lg text-[10px] sm:text-xs font-black uppercase tracking-widest transition-all ${activeMode === 'board' ? 'bg-white text-black shadow-md' : 'text-slate-500 hover:text-slate-700'}`}
                            >
                                Tracker
                            </button>
                            <button
                                id="tour-hub-mode-btn"
                                onClick={() => setActiveMode('hub')}
                                className={`px-4 sm:px-6 py-2 rounded-lg text-[10px] sm:text-xs font-black uppercase tracking-widest transition-all ${activeMode === 'hub' ? 'bg-white text-black shadow-md' : 'text-slate-500 hover:text-slate-700'}`}
                            >
                                Hub
                            </button>
                        </div>

                        <AnimatePresence>
                            {saveStatus !== 'idle' && (
                                <motion.div 
                                    initial={{ opacity: 0, x: -10 }}
                                    animate={{ opacity: 1, x: 0 }}
                                    exit={{ opacity: 0, x: -10 }}
                                    className="hidden sm:flex items-center gap-2 text-[10px] font-black uppercase tracking-widest text-slate-400"
                                >
                                    <div className={`w-1.5 h-1.5 rounded-full ${saveStatus === 'saving' ? 'bg-emerald-500 animate-pulse' : 'bg-teal-500'}`} />
                                    {saveStatus === 'saving' ? 'Saving...' : 'Saved'}
                                </motion.div>
                            )}
                        </AnimatePresence>
                    </div>

                    <div className="flex items-center gap-3">
                        <button 
                            onClick={() => setIsTemplateModalOpen(true)}
                            className="hidden sm:flex items-center gap-2 px-5 py-2 bg-white border-2 border-slate-100 text-slate-700 rounded-full text-xs font-black uppercase tracking-widest hover:border-emerald-600 hover:text-emerald-600 hover:shadow-lg hover:shadow-emerald-100 transition-all group"
                        >
                            <Layout className="w-3.5 h-3.5 group-hover:scale-110 transition-transform" />
                            Template
                        </button>
                        <DownloadDropdown 
                            onDownloadPdf={() => window.print()} 
                            onDownloadTxt={handleDownloadTxt}
                            onExportJson={handleExportJson}
                            onImportJson={handleImportJson}
                        />
                    </div>
                </header>

                <main className="flex-1 overflow-hidden relative">
                    <AnimatePresence mode="wait">
                        {activeMode === 'editor' ? (
                            <motion.div 
                                key="editor"
                                initial={{ opacity: 0 }} animate={{ opacity: 1 }} exit={{ opacity: 0 }}
                                className="flex flex-col lg:flex-row h-full"
                            >
                                {/* Sidebar Navigation - Hidden on small mobile in favor of bottom nav */}
                                <div className="hidden md:block">
                                    <EditorNavigation 
                                        activeTab={activeTab} 
                                        setActiveTab={setActiveTab} 
                                        activeSection={activeSection} 
                                        setActiveSection={setActiveSection} 
                                        sectionOrder={sectionOrder} 
                                    />
                                </div>

                                {/* Main Interaction Area */}
                                <div className={`flex-1 flex overflow-hidden ${mobileView === 'panels' ? 'flex' : 'hidden lg:flex'}`}>
                                    <EditorPanel 
                                        activeTab={activeTab} 
                                        activeSection={activeSection} 
                                        resumeData={resumeData} 
                                        onDataChange={handleDataChange} 
                                        jobDescription={jobDescription} 
                                        onJobDescriptionChange={setJobDescription} 
                                        template={template} 
                                        onTemplateChange={setTemplate} 
                                        customization={customization} 
                                        setCustomization={setCustomization} 
                                        sectionOrder={sectionOrder} 
                                        setSectionOrder={setSectionOrder} 
                                        sectionVisibility={sectionVisibility} 
                                        onSectionVisibilityChange={(s, v) => setSectionVisibility(prev => ({ ...prev, [s]: v }))} 
                                        onCompactResume={handleCompactResume} 
                                        setActiveSection={setActiveSection}
                                        onInterviewPrep={handleGenerateInterviewPrep}
                                        isInterviewPrepLoading={isInterviewPrepLoading}
                                        interviewQuestions={interviewQuestions}
                                        onGenerateCoverLetter={handleGenerateCoverLetter}
                                        isCoverLetterLoading={isCoverLetterLoading}
                                    />
                                </div>

                                {/* Preview Area */}
                                <div className={`flex-1 bg-[#f4f6f8] overflow-auto flex flex-col items-center p-4 sm:p-8 custom-scrollbar relative ${mobileView === 'preview' ? 'flex' : 'hidden lg:flex'}`}>
                                    
                                    <div className="fixed bottom-24 lg:bottom-8 left-1/2 -translate-x-1/2 z-10 flex items-center gap-2 bg-white/80 backdrop-blur shadow-lg border border-slate-200 p-1.5 rounded-full">
                                        <button onClick={() => setZoom(z => Math.max(z - 0.05, 0.2))} className="w-8 h-8 flex items-center justify-center rounded-full hover:bg-slate-100 transition-colors text-slate-600 font-bold" aria-label="Zoom out">－</button>
                                        <span className="text-[9px] font-black text-slate-400 w-8 text-center">{Math.round(zoom * 100)}%</span>
                                        <button onClick={() => setZoom(z => Math.min(z + 0.05, 1.5))} className="w-8 h-8 flex items-center justify-center rounded-full hover:bg-slate-100 transition-colors text-slate-600 font-bold" aria-label="Zoom in">＋</button>
                                    </div>
                                    <div style={{ transform: `scale(${zoom})`, transformOrigin: 'top center' }} className="shadow-2xl relative">
                                        <ResumePreview 
                                            data={resumeData} 
                                            templateId={template} 
                                            customization={customization} 
                                            sectionOrder={sectionOrder} 
                                            sectionVisibility={sectionVisibility} 
                                            onDataChange={handleDataChange} 
                                        />
                                    </div>
                                </div>

                {/* Mobile Toggle Navbar */}
                <div className="lg:hidden fixed bottom-0 left-0 right-0 h-16 bg-white border-t border-slate-200 flex items-center justify-around px-4 z-40 shadow-[0_-4px_20px_rgba(0,0,0,0.05)]">
                    <button 
                        onClick={() => { setActiveMode('editor'); setMobileView('panels'); setActiveTab('content'); }}
                        className={`flex flex-col items-center gap-1 ${activeMode === 'editor' && mobileView === 'panels' && activeTab === 'content' ? 'text-emerald-600' : 'text-slate-400'}`}
                    >
                        <svg className="w-5 h-5" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2.5}><path d="M11 5H6a2 2 0 00-2 2v11a2 2 0 002 2h11a2 2 0 002-2v-5m-1.414-9.414a2 2 0 112.828 2.828L11.828 15H9v-2.828l8.586-8.586z" /></svg>
                        <span className="text-[10px] font-black uppercase tracking-widest">Edit</span>
                    </button>
                    <button 
                        onClick={() => { setActiveMode('editor'); setMobileView('panels'); setActiveTab('design'); }}
                        className={`flex flex-col items-center gap-1 ${activeMode === 'editor' && mobileView === 'panels' && activeTab === 'design' ? 'text-emerald-600' : 'text-slate-400'}`}
                    >
                        <svg className="w-5 h-5" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2.5}><path d="M7 21a4 4 0 01-4-4V5a2 2 0 012-2h4a2 2 0 012 2v12a4 4 0 01-4 4zm0 0h12a2 2 0 002-2v-4a2 2 0 00-2-2h-2.343M11 7.343l1.657-1.657a2 2 0 012.828 0l2.829 2.829a2 2 0 010 2.828l-8.486 8.485M7 17h.01" /></svg>
                        <span className="text-[10px] font-black uppercase tracking-widest">Style</span>
                    </button>
                    <button 
                        onClick={() => { setActiveMode('editor'); setMobileView('preview'); }}
                        className={`flex flex-col items-center gap-1 ${activeMode === 'editor' && mobileView === 'preview' ? 'text-emerald-600' : 'text-slate-400'}`}
                    >
                        <svg className="w-5 h-5" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2.5}><path d="M15 12a3 3 0 11-6 0 3 3 0 016 0z" /><path d="M2.458 12C3.732 7.943 7.523 5 12 5c4.478 0 8.268 2.943 9.542 7-1.274 4.057-5.064 7-9.542 7-4.477 0-8.268-2.943-9.542-7z" /></svg>
                        <span className="text-[10px] font-black uppercase tracking-widest">Preview</span>
                    </button>
                </div>
                            </motion.div>
                        ) : activeMode === 'board' ? (
                            <motion.div 
                                key="board"
                                initial={{ opacity: 0 }} animate={{ opacity: 1 }} exit={{ opacity: 0 }}
                                className="h-full"
                            >
                                <JobTracker resumeData={resumeData} />
                            </motion.div>
                        ) : (
                            <motion.div 
                                key="hub"
                                initial={{ opacity: 0 }} animate={{ opacity: 1 }} exit={{ opacity: 0 }}
                                className="h-full overflow-y-auto p-6 sm:p-8 md:p-12 bg-slate-50/50"
                            >
                                <div className="w-full max-w-[1600px] mx-auto">
                                    <CareerHub resumeData={resumeData} />
                                </div>
                            </motion.div>
                        )}
                    </AnimatePresence>
                </main>

                {/* Modals & Overlays */}
                <AnimatePresence>
                    {isTemplateModalOpen && (
                        <TemplateSelectorModal 
                            currentTemplate={template}
                            resumeData={resumeData}
                            onTemplateChange={(t) => { setTemplate(t); setIsTemplateModalOpen(false); }}
                            onClose={() => setIsTemplateModalOpen(false)}
                        />
                    )}
                    {auditResult && <AiAuditModal result={auditResult} onClose={() => setAuditResult(null)} onRewrite={handleRewrite} />}
                    {coverLetterContent && <CoverLetterModal content={coverLetterContent} onClose={() => setCoverLetterContent(null)} />}
                    {rewriteModalState?.isOpen && (
                        <RewriteSuggestionModal 
                            {...rewriteModalState} 
                            onClose={() => setRewriteModalState(null)} 
                            onApply={() => { handleDataChange(rewriteModalState.path, rewriteModalState.suggestion); setRewriteModalState(null); }} 
                        />
                    )}
                </AnimatePresence>
            </div>
        </ResumeContext.Provider>
    );
};

export default ResumeBuilder;
