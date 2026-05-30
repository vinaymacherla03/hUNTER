
import React, { useState, useEffect, useCallback } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { toast } from 'sonner';
import { ResumeData, Customization, ResumeSectionKey, AuditResult, InterviewQuestion, TemplateKey } from '../types';
import { compactResumeContent, runResumeAudit, generateCoverLetter, generateAgentSuggestion, generateInterviewQuestions } from '../services/geminiService';
import { templates as allTemplates } from './templates/templateData';
import { ResumeContext } from './builder/ResumeContext';
import { CalendarService } from '../services/calendarService';
import { generateResumePlainText } from '../utils/resumeUtils';
import { useResumeVersions } from '../hooks/useResumeVersions';
import { auth } from '../services/firebase';
import { saveDownloadedResume } from '../services/resumeStorage';
import { jobService } from '../services/jobService';
import { Layout, Clock, Save, CheckCircle, Zap, Sparkles } from 'lucide-react';
import { pdf } from '@react-pdf/renderer';
import { PdfTemplate } from './PdfTemplate';
import { saveAs } from 'file-saver';

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
import VersionManagerModal from './builder/VersionManagerModal';
import OnboardingTour from './OnboardingTour';
import CareerHub from './builder/CareerHub';
import VoiceAgent from './builder/VoiceAgent';
import AgentChat from './builder/AgentChat';
import Tooltip from './Tooltip';

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
    sectionTitleBorderStyle: 'none', sectionTitleBorderColor: '#d1d5db', sectionTitleUppercase: true,
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
    const [targetJobTitle, setTargetJobTitle] = useState<string>(initialDraft?.targetJobTitle || initialData.title || '');
    
    // UI State
    const [activeMode, setActiveMode] = useState<ViewMode>('editor');
    const [activeTab, setActiveTab] = useState<'content' | 'style' | 'match' | 'interview' | 'versions' | 'analysis'>('content');
    const [activeSection, setActiveSection] = useState<ResumeSectionKey | 'contact' | 'finalize'>('contact');
    const [mobileView, setMobileView] = useState<MobileView>('panels');
    const [zoom, setZoom] = useState(0.8); 
    const [saveStatus, setSaveStatus] = useState<'idle' | 'saving' | 'saved'>('idle');
    const [isTemplateModalOpen, setIsTemplateModalOpen] = useState(false);
    const [isVersionModalOpen, setIsVersionModalOpen] = useState(false);
    const [isCalendarConnected, setIsCalendarConnected] = useState(false);

    useEffect(() => {
        CalendarService.isConnected().then(setIsCalendarConnected);
    }, []);
    
    const [isNavCollapsed, setIsNavCollapsed] = useState(false);
    const [lastSaved, setLastSaved] = useState<Date | null>(() => {
        const draft = localStorage.getItem(DRAFT_STORAGE_KEY);
        return draft ? new Date() : null;
    });
    
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
    const [aiSuggestions, setAiSuggestions] = useState<Record<string, { suggestion: string, reason: string }>>({});
    const [isAiAgentOpen, setIsAiAgentOpen] = useState(false);
    const [runTour, setRunTour] = useState(false);
    const [isDownloading, setIsDownloading] = useState(false);
    const { versions, saveVersion } = useResumeVersions();

    // Auto-save versions every 15 minutes if changes are made
    useEffect(() => {
        if (!auth.currentUser) return;

        const interval = setInterval(() => {
            const name = `Auto-save ${new Date().toLocaleString()}`;
            saveVersion(name, resumeData, customization, template, jobDescription);
        }, 15 * 60 * 1000); // 15 minutes

        return () => clearInterval(interval);
    }, [auth.currentUser, resumeData, customization, template, jobDescription, saveVersion]);
    const currentTemplateName = allTemplates.find(t => t.key === template)?.name || 'Template';

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
    const saveDraft = useCallback((isManual = false) => {
        if (isManual) setSaveStatus('saving');
        
        try {
            const draft = { 
                resumeData, 
                template, 
                customization, 
                sectionOrder, 
                sectionVisibility, 
                jobDescription,
                targetJobTitle,
                updatedAt: new Date().toISOString()
            };
            localStorage.setItem(DRAFT_STORAGE_KEY, JSON.stringify(draft));
            localStorage.setItem(PREFERENCES_STORAGE_KEY, JSON.stringify({ template, customization }));
            
            // If manual save, also save a version to Firestore
            if (isManual) {
                const versionName = `Draft ${new Date().toLocaleString()}`;
                saveVersion(versionName, resumeData, customization, template, jobDescription);
            }

            setSaveStatus('saved');
            setLastSaved(new Date());
            
            // Keep "Saved" status for 2 seconds
            setTimeout(() => setSaveStatus('idle'), 2000);
        } catch (error) {
            console.error("Failed to save draft:", error);
            setSaveStatus('idle');
        }
    }, [resumeData, template, customization, sectionOrder, sectionVisibility, jobDescription]);

    useEffect(() => {
        // Auto-save with 2s debounce
        const timer = setTimeout(() => {
            setSaveStatus('saving');
            saveDraft();
        }, 2000);
        
        return () => clearTimeout(timer);
    }, [saveDraft]);

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

    const handleApplyTailoredResume = (data: ResumeData, newSectionOrder?: ResumeSectionKey[]) => {
        setResumeData(data);
        if (newSectionOrder) {
            setSectionOrder(newSectionOrder);
        }
        setSaveStatus('saving');
        saveDraft();
    };

    const handleDownloadPdf = async () => {
        setIsDownloading(true);
        try {
            // Save to Firestore first
            await saveDownloadedResume(resumeData, 'pdf', template);

            // Use @react-pdf/renderer to generate a professional PDF blob
            // This is much more reliable than capturing the screen as an image
            const blob = await pdf(
                <PdfTemplate 
                    data={resumeData} 
                    customization={customization} 
                    sectionVisibility={sectionVisibility} 
                    template={template}
                />
            ).toBlob();
            saveAs(blob, `${resumeData.fullName.replace(/\s+/g, '_')}_Resume.pdf`);
        } catch (error) {
            console.error("PDF Generation Error:", error);
            // Fallback to print if generation fails
            window.print();
        } finally {
            setIsDownloading(false);
        }
    };

    const handleExportJson = () => {
        saveDownloadedResume(resumeData, 'json', template);
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
                    toast.success("Resume data imported successfully!");
                } else {
                    toast.error("Invalid resume JSON format.");
                }
            } catch (error) {
                console.error("Error parsing JSON", error);
                toast.error("Failed to parse JSON file.");
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
                setAiSuggestions(prev => ({ ...prev, [path]: { suggestion: result.rewritten, reason: result.reason } }));
                setRewriteModalState({ isOpen: true, originalText, suggestion: result.rewritten, reason: result.reason, path });
            }
        } catch (error) { console.error(error); } finally { setIsThinkingPath(null); }
    };

    const handleClearSuggestion = (path: string) => {
        setAiSuggestions(prev => {
            const next = { ...prev };
            delete next[path];
            return next;
        });
        if (rewriteModalState?.path === path) {
            setRewriteModalState(null);
        }
    };

    const handleApplySuggestion = (path: string, suggestion: string) => {
        handleDataChange(path, suggestion);
        handleClearSuggestion(path);
    };

    const handleSaveToTracker = async () => {
        const company = prompt("Enter the company name:");
        const role = prompt("Enter the job role:");
        
        if (!company || !role) {
            toast.error("Company name and role are required.");
            return;
        }

        try {
            const newJobData = {
                company,
                role,
                status: 'Saved' as const,
                dateAdded: new Date().toLocaleDateString(),
                contacts: [],
                tasks: [],
                notes: ''
            };

            await jobService.createJob(newJobData);
            toast.success(`Added ${role} at ${company} to tracker!`);
            setActiveMode('board');
        } catch (error) {
            console.error(error);
            toast.error("Failed to add job to tracker.");
        }
    };

    const handleDownloadTxt = () => {
        saveDownloadedResume(resumeData, 'txt', template);
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
                    const tabMap: Record<string, any> = {
                        'content': 'content',
                        'design': 'style',
                        'style': 'style',
                        'match': 'match',
                        'interview': 'interview',
                        'versions': 'versions'
                    };
                    if (tabMap[args.section]) setActiveTab(tabMap[args.section]);
                    else if (ALL_SECTIONS.includes(args.section) || args.section === 'contact') { setActiveTab('content'); setActiveSection(args.section); }
                    return `Navigated to ${args.section}.`;
                case 'setSectionVisibility':
                    setSectionVisibility(prev => ({ ...prev, [args.section]: args.visible }));
                    return `Set ${args.section} section to ${args.visible ? 'visible' : 'hidden'}.`;
                default: return `Unknown function: ${name}`;
            }
        } catch (error) { return `Error: ${error instanceof Error ? error.message : String(error)}`; }
    };

    const handleLoadVersion = (version: any) => {
        const data = version.resumeData;
        
        // Extract metadata we stored with underscores
        const customization = data._customization;
        const template = data._template;
        const jobDescription = data._jobDescription;
        
        // Clean up the data object (remove metadata fields)
        const cleanData = { ...data };
        delete cleanData._customization;
        delete cleanData._template;
        delete cleanData._jobDescription;

        setResumeData(cleanData);
        if (customization) setCustomization(customization);
        if (template) setTemplate(template);
        if (jobDescription) setJobDescription(jobDescription);
        
        toast.success(`Loaded version: ${version.name}`);
    };

    return (
        <ResumeContext.Provider value={{ 
            resumeData, 
            jobDescription, 
            onRewrite: handleRewrite, 
            onDataChange: handleDataChange,
            onApplyTailoredResume: handleApplyTailoredResume,
            onInterviewPrep: handleGenerateInterviewPrep,
            isInterviewPrepLoading,
            isThinkingPath,
            aiSuggestions,
            onApplySuggestion: handleApplySuggestion,
            onClearSuggestion: handleClearSuggestion
        }}>
            <div className="flex flex-col h-screen w-full bg-slate-50 overflow-hidden">
                <OnboardingTour run={runTour} onFinish={handleTourFinish} />
                
                {/* Header / Editor Navbar */}
                <header className="h-16 bg-white/80 backdrop-blur-md border-b border-slate-200/60 flex items-center justify-between px-6 shrink-0 z-30 shadow-[0_1px_2px_rgba(0,0,0,0.02)]">
                    <div className="flex items-center gap-6">
                        <div className="flex items-center gap-2.5">
                            <div className="w-8 h-8 rounded-xl bg-gradient-to-tr from-emerald-600 to-emerald-400 flex items-center justify-center shadow-sm">
                                <Zap className="w-4 h-4 text-white fill-white" />
                            </div>
                            <div className="hidden md:flex flex-col text-slate-900 leading-none">
                                <h1 className="text-[15px] font-black tracking-tight">HuntDesk</h1>
                                <span className="text-[9px] uppercase tracking-[0.15em] text-emerald-600 font-bold mt-0.5">Builder</span>
                            </div>
                        </div>
                        
                        <div className="flex bg-slate-100/60 p-1 rounded-xl border border-slate-200/50 shadow-inner">
                            <Tooltip content="Build and edit your resume" position="bottom">
                                <button
                                    onClick={() => setActiveMode('editor')}
                                    className={`px-5 py-1.5 rounded-lg text-xs font-bold transition-all duration-200 ${activeMode === 'editor' ? 'bg-white text-emerald-700 shadow-sm ring-1 ring-slate-200/50' : 'text-slate-500 hover:text-slate-700'}`}
                                >
                                    Editor
                                </button>
                            </Tooltip>
                            <Tooltip content="Manage job tracking, cover letters, and interviews" position="bottom">
                                <button
                                    onClick={() => setActiveMode('hub')}
                                    className={`px-5 py-1.5 rounded-lg text-xs font-bold transition-all duration-200 ${activeMode === 'hub' ? 'bg-white text-emerald-700 shadow-sm ring-1 ring-slate-200/50' : 'text-slate-500 hover:text-slate-700'}`}
                                >
                                    Hub
                                </button>
                            </Tooltip>
                        </div>
                    </div>

                    <div className="flex items-center gap-3">
                        <div className="hidden xl:flex border-r border-slate-200 pr-4 mr-1">
                            <Tooltip content="Manually save your progress (auto-saves locally)" position="bottom">
                                <button
                                    onClick={() => saveDraft(true)}
                                    disabled={saveStatus === 'saving'}
                                    className="flex items-center gap-2 hover:opacity-80 transition-opacity"
                                >
                                    <Save className={`w-4 h-4 ${saveStatus === 'saving' ? 'text-emerald-500 animate-pulse' : 'text-slate-400'}`} />
                                    <div className="flex flex-col text-left">
                                        <span className="text-[11px] font-bold text-slate-700 leading-none">
                                            {saveStatus === 'saving' ? 'Saving...' : 'Save Draft'}
                                        </span>
                                        {lastSaved && (
                                            <span className="text-[9px] text-slate-400 font-medium mt-0.5">
                                                Last saved {lastSaved.toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })}
                                            </span>
                                        )}
                                    </div>
                                </button>
                            </Tooltip>
                        </div>

                        {/* Mobile active mode switcher */}
                        <div className="hidden md:flex items-center bg-slate-100/60 p-1 rounded-xl shadow-inner border border-slate-200/50">
                            <Tooltip content="Edit your content" position="bottom">
                                <button 
                                    onClick={() => setMobileView('panels')}
                                    className={`px-4 py-1.5 rounded-lg text-xs font-bold transition-all duration-200 ${mobileView === 'panels' ? 'bg-white text-emerald-700 shadow-sm ring-1 ring-slate-200/50' : 'text-slate-500 hover:text-slate-700'}`}
                                >
                                    Build
                                </button>
                            </Tooltip>
                            <Tooltip content="Preview resume layout" position="bottom">
                                <button 
                                    onClick={() => setMobileView('preview')}
                                    className={`px-4 py-1.5 rounded-lg text-xs font-bold transition-all duration-200 ${mobileView === 'preview' ? 'bg-white text-emerald-700 shadow-sm ring-1 ring-slate-200/50' : 'text-slate-500 hover:text-slate-700'}`}
                                >
                                    Preview
                                </button>
                            </Tooltip>
                        </div>

                        <Tooltip content="Change resume template" position="bottom">
                            <button 
                                onClick={() => setIsTemplateModalOpen(true)}
                                className="hidden sm:flex items-center gap-2 px-4 h-9 bg-white border border-slate-200/80 text-slate-700 rounded-xl text-xs font-bold hover:border-emerald-500 hover:text-emerald-600 transition-all shadow-[0_2px_4px_rgba(0,0,0,0.02)]"
                            >
                                <Layout className="w-3.5 h-3.5" />
                                {currentTemplateName}
                            </button>
                        </Tooltip>

                        <div className="relative">
                            <DownloadDropdown 
                                onDownloadPdf={handleDownloadPdf} 
                                onDownloadTxt={handleDownloadTxt}
                                onExportJson={handleExportJson}
                                onImportJson={handleImportJson}
                                onSaveToTracker={handleSaveToTracker}
                                isDownloading={isDownloading}
                            />
                        </div>
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
                                <div className="hidden md:block h-full">
                                    <EditorNavigation 
                                        activeTab={activeTab} 
                                        setActiveTab={setActiveTab} 
                                        activeSection={activeSection} 
                                        setActiveSection={setActiveSection} 
                                        sectionOrder={sectionOrder} 
                                        resumeData={resumeData}
                                        isCollapsed={isNavCollapsed}
                                        setIsCollapsed={setIsNavCollapsed}
                                    />
                                </div>

                                {/* Main Interaction Area */}
                                <div className={`flex-1 flex overflow-hidden ${mobileView === 'panels' ? 'flex' : 'hidden lg:flex'}`}>
                                    <EditorPanel 
                                        activeTab={activeTab} 
                                        setActiveTab={setActiveTab}
                                        activeSection={activeSection} 
                                        resumeData={resumeData} 
                                        onDataChange={handleDataChange} 
                                        jobDescription={jobDescription} 
                                        onJobDescriptionChange={setJobDescription} 
                                        jobTitle={targetJobTitle}
                                        onJobTitleChange={setTargetJobTitle}
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
                                        onDownloadPdf={handleDownloadPdf}
                                        onDownloadTxt={handleDownloadTxt}
                                        onExportJson={handleExportJson}
                                        isDownloading={isDownloading}
                                        onLoadVersion={handleLoadVersion}
                                    />
                                </div>

                                 {/* Preview Area */}
                                <div className={`flex-1 bg-slate-100/50 overflow-auto flex flex-col items-center p-4 sm:p-12 custom-scrollbar relative ${mobileView === 'preview' ? 'flex' : 'hidden lg:flex'}`}>
                                    
                                    <div className="absolute top-6 right-8 z-10 flex items-center gap-1 bg-white/90 backdrop-blur shadow-sm border border-slate-200/60 p-1 rounded-lg">
                                        <button onClick={() => setZoom(z => Math.max(z - 0.1, 0.2))} className="w-7 h-7 flex items-center justify-center rounded hover:bg-slate-100 transition-colors text-slate-600" aria-label="Zoom out">
                                            <svg className="w-4 h-4" fill="none" viewBox="0 0 24 24" stroke="currentColor"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M20 12H4" /></svg>
                                        </button>
                                        <div className="px-2 text-xs font-medium text-slate-600 min-w-[3.5rem] text-center select-none">
                                            {Math.round(zoom * 100)}%
                                        </div>
                                        <button onClick={() => setZoom(z => Math.min(z + 0.1, 2))} className="w-7 h-7 flex items-center justify-center rounded hover:bg-slate-100 transition-colors text-slate-600" aria-label="Zoom in">
                                            <svg className="w-4 h-4" fill="none" viewBox="0 0 24 24" stroke="currentColor"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 4v16m8-8H4" /></svg>
                                        </button>
                                    </div>

                                    <div 
                                        className="transition-transform duration-200 ease-out origin-top shadow-xl ring-1 ring-slate-900/5 mb-10"
                                        style={{ transform: `scale(${zoom})` }}
                                    >
                                        <ResumePreview 
                                            data={resumeData} 
                                            customization={customization} 
                                            sectionOrder={sectionOrder} 
                                            sectionVisibility={sectionVisibility}
                                            onDataChange={handleDataChange}
                                            templateId={template}
                                            activeSection={activeSection}
                                        />
                                    </div>
                                </div>

                {/* Mobile Toggle Navbar */}
                <div className="lg:hidden fixed bottom-0 left-0 right-0 h-16 bg-white border-t border-slate-200 flex items-center justify-around px-2 z-40 shadow-[0_-4px_20px_rgba(0,0,0,0.05)]">
                    <button 
                        onClick={() => { setActiveMode('editor'); setMobileView('panels'); setActiveTab('content'); }}
                        className={`flex flex-col items-center gap-1 flex-1 ${activeMode === 'editor' && mobileView === 'panels' && activeTab === 'content' ? 'text-emerald-600' : 'text-slate-400'}`}
                    >
                        <svg className="w-5 h-5" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2.5}><path d="M11 5H6a2 2 0 00-2 2v11a2 2 0 002 2h11a2 2 0 002-2v-5m-1.414-9.414a2 2 0 112.828 2.828L11.828 15H9v-2.828l8.586-8.586z" /></svg>
                        <span className="text-[9px] font-black uppercase tracking-wider">Content</span>
                    </button>
                    <button 
                        onClick={() => { setActiveMode('editor'); setMobileView('panels'); setActiveTab('style'); }}
                        className={`flex flex-col items-center gap-1 flex-1 ${activeMode === 'editor' && mobileView === 'panels' && activeTab === 'style' ? 'text-emerald-600' : 'text-slate-400'}`}
                    >
                        <svg className="w-5 h-5" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2.5}><path d="M7 21a4 4 0 01-4-4V5a2 2 0 012-2h4a2 2 0 012 2v12a4 4 0 01-4 4zm0 0h12a2 2 0 002-2v-4a2 2 0 00-2-2h-2.343M11 7.343l1.657-1.657a2 2 0 012.828 0l2.829 2.829a2 2 0 010 2.828l-8.486 8.485M7 17h.01" /></svg>
                        <span className="text-[9px] font-black uppercase tracking-wider">Style</span>
                    </button>
                    <button 
                        onClick={() => { setActiveMode('editor'); setMobileView('panels'); setActiveTab('match'); }}
                        className={`flex flex-col items-center gap-1 flex-1 ${activeMode === 'editor' && mobileView === 'panels' && activeTab === 'match' ? 'text-emerald-600' : 'text-slate-400'}`}
                    >
                        <svg className="w-5 h-5" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2.5}><path strokeLinecap="round" strokeLinejoin="round" d="M9 12l2 2 4-4m6 2a9 9 0 11-18 0 9 9 0 0118 0z" /></svg>
                        <span className="text-[9px] font-black uppercase tracking-wider">Match</span>
                    </button>
                    <button 
                        onClick={() => { setActiveMode('editor'); setMobileView('panels'); setActiveTab('interview'); }}
                        className={`flex flex-col items-center gap-1 flex-1 ${activeMode === 'editor' && mobileView === 'panels' && activeTab === 'interview' ? 'text-emerald-600' : 'text-slate-400'}`}
                    >
                        <svg className="w-5 h-5" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2.5}><path strokeLinecap="round" strokeLinejoin="round" d="M8 10h.01M12 10h.01M16 10h.01M9 16H5a2 2 0 01-2-2V6a2 2 0 012-2h14a2 2 0 012 2v8a2 2 0 01-2 2h-5l-5 5v-5z" /></svg>
                        <span className="text-[9px] font-black uppercase tracking-wider">Interview Prep</span>
                    </button>
                    <button 
                        onClick={() => { setActiveMode('editor'); setMobileView('panels'); setActiveTab('versions'); }}
                        className={`flex flex-col items-center gap-1 flex-1 ${activeMode === 'editor' && mobileView === 'panels' && activeTab === 'versions' ? 'text-emerald-600' : 'text-slate-400'}`}
                    >
                        <Clock className="w-5 h-5" />
                        <span className="text-[9px] font-black uppercase tracking-wider">Versions</span>
                    </button>
                    <button 
                        onClick={() => { setActiveMode('editor'); setMobileView('preview'); }}
                        className={`flex flex-col items-center gap-1 flex-1 ${activeMode === 'editor' && mobileView === 'preview' ? 'text-emerald-600' : 'text-slate-400'}`}
                    >
                        <svg className="w-5 h-5" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2.5}><path d="M15 12a3 3 0 11-6 0 3 3 0 016 0z" /><path d="M2.458 12C3.732 7.943 7.523 5 12 5c4.478 0 8.268 2.943 9.542 7-1.274 4.057-5.064 7-9.542 7-4.477 0-8.268-2.943-9.542-7z" /></svg>
                        <span className="text-[9px] font-black uppercase tracking-wider">Preview</span>
                    </button>
                </div>
                            </motion.div>
                        ) : activeMode === 'board' ? (
                            <motion.div 
                                key="board"
                                initial={{ opacity: 0 }} animate={{ opacity: 1 }} exit={{ opacity: 0 }}
                                className="h-full"
                            >
                                <JobTracker 
                                    resumeData={resumeData} 
                                />
                            </motion.div>
                        ) : (
                            <motion.div 
                                key="hub"
                                initial={{ opacity: 0 }} animate={{ opacity: 1 }} exit={{ opacity: 0 }}
                                className="h-full overflow-y-auto p-4 sm:p-8 md:p-12 bg-slate-50/50"
                            >
                                <div className="w-full max-w-[1600px] mx-auto">
                                    <CareerHub 
                                        resumeData={resumeData} 
                                        jobDescription={jobDescription} 
                                        onJobDescriptionChange={setJobDescription}
                                    />
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
                    {isVersionModalOpen && (
                        <VersionManagerModal 
                            isOpen={isVersionModalOpen}
                            onClose={() => setIsVersionModalOpen(false)}
                            currentData={resumeData}
                            currentCustomization={customization}
                            currentTemplate={template}
                            currentJobDescription={jobDescription}
                            onLoadVersion={handleLoadVersion}
                        />
                    )}
                    {auditResult && <AiAuditModal result={auditResult} onClose={() => setAuditResult(null)} onRewrite={handleRewrite} />}
                    {coverLetterContent && <CoverLetterModal content={coverLetterContent} onClose={() => setCoverLetterContent(null)} />}
                    {rewriteModalState?.isOpen && (
                        <RewriteSuggestionModal 
                            {...rewriteModalState} 
                            onClose={() => setRewriteModalState(null)} 
                            onApply={() => handleApplySuggestion(rewriteModalState.path, rewriteModalState.suggestion)} 
                        />
                    )}
                    <VoiceAgent 
                        key="voice-agent"
                        isOpen={isAiAgentOpen} 
                        onClose={() => setIsAiAgentOpen(false)} 
                        currentStepKey={activeTab} 
                        onApplySuggestion={handleDataChange} 
                        onFunctionCall={handleVoiceAgentFunctionCall}
                    />
                    <AgentChat 
                        key="agent-chat"
                        resumeData={resumeData}
                        onNavigate={(section) => handleVoiceAgentFunctionCall('navigate', { section })}
                        onUpdateData={handleDataChange}
                    />
                </AnimatePresence>
            </div>
        </ResumeContext.Provider>
    );
};

export default ResumeBuilder;
