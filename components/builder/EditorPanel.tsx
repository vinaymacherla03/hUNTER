
import React from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { ResumeData, Customization, ResumeSectionKey, TemplateKey, InterviewQuestion } from '../../types';
import ContactForm from './forms/ContactForm';
import ExperienceForm from './forms/ExperienceForm';
import EducationForm from './forms/EducationForm';
import SkillsForm from './forms/SkillsForm';
import ProjectsForm from './forms/ProjectsForm';
import SummaryForm from './forms/SummaryForm';
import CertificationsForm from './forms/CertificationsForm';
import AwardsForm from './forms/AwardsForm';
import KeywordsForm from './forms/KeywordsForm';
import CustomizationPanel from '../CustomizationPanel';
import SectionReorder from '../SectionReorder';
import JobMatchAnalyzer from './JobMatchAnalyzer';
import ResumeHealthCheck from './ResumeHealthCheck';
import BulletOptimizer from './BulletOptimizer';
import AICompactor from './AICompactor';
import FinalizeSection from './FinalizeSection';
import SmartTailorPanel from '../SmartTailorPanel';
import SmartTailorModal from './SmartTailorModal';

import InterviewPrepContent from './InterviewPrepContent';

import VersionManagerPanel from './VersionManagerPanel';
import { FileText, Paintbrush, Target, MessageSquare, ChevronRight, ChevronLeft, Download, Clock, Wand2, Sparkles, Zap } from 'lucide-react';

import SectionAdvice from './SectionAdvice';
import Tooltip from '../Tooltip';

interface EditorPanelProps {
    activeTab: 'content' | 'style' | 'match' | 'interview' | 'versions' | 'analysis';
    setActiveTab: (tab: 'content' | 'style' | 'match' | 'interview' | 'versions' | 'analysis') => void;
    activeSection: ResumeSectionKey | 'contact' | 'finalize';
    resumeData: ResumeData;
    onDataChange: (path: string, value: any) => void;
    jobDescription: string;
    onJobDescriptionChange: (jd: string) => void;
    jobTitle: string;
    onJobTitleChange: (title: string) => void;
    template: TemplateKey;
    onTemplateChange: (template: TemplateKey) => void;
    customization: Customization;
    setCustomization: (c: Customization) => void;
    sectionOrder: ResumeSectionKey[];
    setSectionOrder: (o: ResumeSectionKey[]) => void;
    sectionVisibility: Record<ResumeSectionKey, boolean>;
    onSectionVisibilityChange: (section: ResumeSectionKey, isVisible: boolean) => void;
    onCompactResume: () => Promise<void>;
    setActiveSection: (section: ResumeSectionKey | 'contact' | 'finalize') => void;
    onInterviewPrep: () => Promise<void>;
    isInterviewPrepLoading: boolean;
    interviewQuestions: InterviewQuestion[] | null;
    onGenerateCoverLetter: () => Promise<void>;
    isCoverLetterLoading: boolean;
    onDownloadPdf: () => void;
    onDownloadTxt: () => void;
    onExportJson: () => void;
    isDownloading: boolean;
    onLoadVersion: (version: any) => void;
}

const EditorPanel: React.FC<EditorPanelProps> = ({
    activeTab,
    setActiveTab,
    activeSection,
    resumeData,
    onDataChange,
    jobDescription,
    onJobDescriptionChange,
    jobTitle,
    onJobTitleChange,
    template,
    onTemplateChange,
    customization,
    setCustomization,
    sectionOrder,
    setSectionOrder,
    sectionVisibility,
    onSectionVisibilityChange,
    onCompactResume,
    setActiveSection,
    onInterviewPrep,
    isInterviewPrepLoading,
    interviewQuestions,
    onGenerateCoverLetter,
    isCoverLetterLoading,
    onDownloadPdf,
    onDownloadTxt,
    onExportJson,
    isDownloading,
    onLoadVersion
}) => {
    const [isSmartTailorOpen, setIsSmartTailorOpen] = React.useState(false);
    const [direction, setDirection] = React.useState(0);
    
    const variants = {
        enter: (direction: number) => ({
            x: direction > 0 ? 100 : -100,
            opacity: 0,
            scale: 0.95,
            filter: "blur(10px)"
        }),
        center: {
            zIndex: 1,
            x: 0,
            opacity: 1,
            scale: 1,
            filter: "blur(0px)"
        },
        exit: (direction: number) => ({
            zIndex: 0,
            x: direction < 0 ? 100 : -100,
            opacity: 0,
            scale: 0.95,
            filter: "blur(10px)"
        })
    };

    const transition = {
        x: { type: "spring", stiffness: 200, damping: 25 },
        opacity: { duration: 0.4, ease: "easeInOut" },
        scale: { duration: 0.4, ease: "easeOut" },
        filter: { duration: 0.3 }
    };

    const allSections = ['contact', ...sectionOrder, 'finalize'] as (ResumeSectionKey | 'contact' | 'finalize')[];
    const currentIndex = allSections.indexOf(activeSection);
    const hasNext = currentIndex < allSections.length - 1;
    const hasPrev = currentIndex > 0;

    const handleNext = () => {
        if (hasNext) {
            setDirection(1);
            setActiveSection(allSections[currentIndex + 1]);
        }
    };

    const handlePrev = () => {
        if (hasPrev) {
            setDirection(-1);
            setActiveSection(allSections[currentIndex - 1]);
        }
    };

    const renderStepper = () => (
        <div className="px-6 py-4 border-b border-slate-100 bg-white/80 backdrop-blur-md sticky top-0 z-20 flex items-center justify-between">
            <div className="flex items-center gap-4">
                <div className="flex flex-col">
                    <div className="flex items-center gap-2 mb-1">
                        <span className="text-xs font-semibold text-emerald-600 uppercase tracking-widest">
                            Step {currentIndex + 1} of {allSections.length}
                        </span>
                    </div>
                    <h2 className="text-lg font-bold text-slate-900 capitalize font-display">
                        {activeSection === 'contact' ? 'Contact Details' : activeSection === 'finalize' ? 'Finalize Resume' : `${activeSection}`}
                    </h2>
                </div>
            </div>
            
            <div className="flex items-center gap-4">
                <div className="hidden sm:flex items-center gap-1.5 mr-2">
                    {allSections.map((s, idx) => (
                        <div 
                            key={s}
                            className={`h-1.5 rounded-full transition-all duration-300 ${
                                idx === currentIndex 
                                ? 'w-6 bg-emerald-500' 
                                : idx < currentIndex 
                                ? 'w-2 bg-emerald-200' 
                                : 'w-2 bg-slate-200'
                            }`}
                        />
                    ))}
                </div>
                <div className="flex items-center gap-2">
                    <button 
                        onClick={handlePrev}
                        disabled={!hasPrev}
                        className="p-2 text-slate-400 hover:text-slate-800 hover:bg-slate-100 rounded-lg disabled:opacity-30 transition-all"
                        title="Previous Section"
                    >
                        <ChevronLeft className="w-5 h-5" />
                    </button>
                    <button 
                        onClick={handleNext}
                        disabled={!hasNext}
                        className="flex items-center gap-2 px-4 py-2 bg-slate-900 text-white text-sm font-semibold rounded-lg hover:bg-slate-800 disabled:opacity-30 transition-all shadow-sm"
                    >
                        Next
                        <ChevronRight className="w-4 h-4" />
                    </button>
                </div>
            </div>
        </div>
    );

    const renderContentForm = () => {
        switch (activeSection) {
            case 'contact': return <ContactForm data={resumeData} onDataChange={onDataChange} />;
            case 'summary': return <SummaryForm data={resumeData} onDataChange={onDataChange} jobDescription={jobDescription} onSmartTailor={() => setIsSmartTailorOpen(true)} />;
            case 'experience': return <ExperienceForm data={resumeData} onDataChange={onDataChange} jobDescription={jobDescription} onSmartTailor={() => setIsSmartTailorOpen(true)} />;
            case 'education': return <EducationForm data={resumeData} onDataChange={onDataChange} />;
            case 'skills': return <SkillsForm data={resumeData} onDataChange={onDataChange} jobDescription={jobDescription} onSmartTailor={() => setIsSmartTailorOpen(true)} />;
            case 'projects': return <ProjectsForm data={resumeData} onDataChange={onDataChange} jobDescription={jobDescription} onSmartTailor={() => setIsSmartTailorOpen(true)} />;
            case 'certifications': return <CertificationsForm data={resumeData} onDataChange={onDataChange} />;
            case 'awards': return <AwardsForm data={resumeData} onDataChange={onDataChange} />;
            case 'keywords': return <KeywordsForm data={resumeData} onDataChange={onDataChange} />;
            case 'finalize': return (
                <FinalizeSection 
                    resumeData={resumeData} 
                    onDownloadPdf={onDownloadPdf} 
                    onDownloadTxt={onDownloadTxt} 
                    onExportJson={onExportJson} 
                    isDownloading={isDownloading} 
                />
            );
            default: return <div>Select a section to edit</div>;
        }
    };

    const tabs = [
        { id: 'content', label: 'Editor', icon: FileText },
        { id: 'analysis', label: 'Stats', icon: Target },
        { id: 'match', label: 'Match', icon: Zap },
        { id: 'interview', label: 'Prep', icon: MessageSquare },
        { id: 'versions', label: 'History', icon: Clock },
    ] as const;

    return (
        <div className="flex-1 bg-slate-50/30 h-full overflow-y-auto custom-scrollbar border-r border-slate-200/50 shadow-inner flex flex-col relative">
            {/* Precision Grid Background */}
            <div className="absolute inset-0 opacity-[0.4] pointer-events-none select-none bg-[radial-gradient(#e2e8f0_1px,transparent_1px)] [background-size:24px_24px]" />
            
            {/* Sticky Tab Navigation */}
            <div className="sticky top-0 z-30 bg-white/80 backdrop-blur-xl border-b border-slate-200/50 px-4 sm:px-8 py-3 hidden lg:block shadow-[0_4px_20px_-10px_rgba(0,0,0,0.05)]">
                <div className="flex items-center justify-between gap-4 max-w-7xl mx-auto">
                    <h2 className="text-[11px] font-black text-slate-700 uppercase tracking-[0.15em] flex items-center gap-2">
                        {activeTab === 'content' && <><FileText className="w-5 h-5 text-emerald-500" /> Content Editor</>}
                        {activeTab === 'analysis' && <><Target className="w-5 h-5 text-emerald-500" /> Stats & Insights</>}
                        {activeTab === 'match' && <><Zap className="w-5 h-5 text-emerald-500" /> ATS Match</>}
                        {activeTab === 'interview' && <><MessageSquare className="w-5 h-5 text-emerald-500" /> Interview Prep</>}
                        {activeTab === 'versions' && <><Clock className="w-5 h-5 text-emerald-500" /> Version History</>}
                        {activeTab === 'style' && <><Paintbrush className="w-5 h-5 text-emerald-500" /> Design & Theme</>}
                    </h2>

                    {jobDescription.trim() && activeTab !== 'match' && (
                        <div className="flex items-center gap-3">
                            <Tooltip content="Automatically edit specific sections using AI" position="bottom">
                                <motion.button
                                    initial={{ opacity: 0, x: 10 }}
                                    animate={{ opacity: 1, x: 0 }}
                                    whileHover={{ scale: 1.02, y: -1 }}
                                    whileTap={{ scale: 0.98 }}
                                    onClick={() => setIsSmartTailorOpen(true)}
                                    className="flex items-center gap-2 px-5 py-2.5 rounded-xl bg-violet-600 text-white text-[10px] font-bold uppercase tracking-widest hover:bg-violet-700 shadow-[0_8px_20px_-8px_rgba(124,58,237,0.5)] transition-all whitespace-nowrap"
                                >
                                    <Wand2 className="w-4 h-4" />
                                    <span>Optimize</span>
                                </motion.button>
                            </Tooltip>
                            <Tooltip content="Analyze match and tailor entire resume to the selected job" position="bottom">
                                <motion.button
                                    initial={{ opacity: 0, x: 10 }}
                                    animate={{ opacity: 1, x: 0 }}
                                    whileHover={{ scale: 1.02, y: -1 }}
                                    whileTap={{ scale: 0.98 }}
                                    onClick={() => setActiveTab('match')}
                                    className="flex items-center gap-2 px-5 py-2.5 rounded-xl bg-emerald-600 text-white text-[10px] font-bold uppercase tracking-widest hover:bg-emerald-700 shadow-[0_8px_20px_-8px_rgba(16,185,129,0.5)] transition-all whitespace-nowrap"
                                >
                                    <Target className="w-4 h-4" />
                                    <span>Tailor to Job</span>
                                </motion.button>
                            </Tooltip>
                        </div>
                    )}
                </div>
            </div>

            <div className="flex-1 max-w-3xl mx-auto w-full p-6 sm:p-12 pb-32 sm:pb-40">
                <AnimatePresence mode="wait" custom={direction}>
                    {activeTab === 'content' && (
                        <motion.div 
                            key={activeSection} 
                            custom={direction}
                            variants={variants}
                            initial="enter"
                            animate="center"
                            exit="exit"
                            transition={transition}
                        >
                            {/* Mobile inline header */}
                            <div className="mb-8">
                                <h3 className="text-[10px] font-black uppercase tracking-[0.25em] text-emerald-600 mb-2">Editor</h3>
                                <div className="flex items-center gap-3">
                                    <p className="text-2xl font-black text-slate-900 capitalize tracking-tight">{activeSection}</p>
                                    <div className="h-px flex-1 bg-slate-100" />
                                </div>
                            </div>
                            
                            <SectionAdvice 
                                section={activeSection as any} 
                                resumeData={resumeData} 
                                jobDescription={jobDescription} 
                            />

                            {renderContentForm()}
                            <div className="mt-12 pt-8 border-t border-slate-100 flex items-center justify-between">
                                {hasPrev ? (
                                    <button 
                                        onClick={handlePrev}
                                        className="group flex items-center gap-2 px-8 py-3.5 rounded-2xl border-2 border-slate-100 bg-white text-slate-600 font-black text-[10px] uppercase tracking-widest hover:border-slate-900 hover:text-slate-900 transition-all active:scale-95 shadow-sm"
                                    >
                                        <ChevronLeft className="w-4 h-4 group-hover:-translate-x-1 transition-transform" />
                                        Back
                                    </button>
                                ) : <div />}
                                {hasNext ? (
                                    <button 
                                        onClick={handleNext}
                                        className="group flex items-center gap-2 px-12 py-3.5 rounded-2xl bg-slate-900 text-white font-black text-[10px] uppercase tracking-[0.2em] hover:bg-emerald-600 hover:shadow-2xl hover:shadow-emerald-500/30 transition-all active:scale-95 border border-transparent"
                                    >
                                        Continue
                                        <ChevronRight className="w-4 h-4 group-hover:translate-x-1 transition-transform" />
                                    </button>
                                ) : activeSection === 'finalize' ? (
                                    <button 
                                        onClick={onDownloadPdf}
                                        disabled={isDownloading}
                                        className="group flex items-center gap-3 px-12 py-3.5 rounded-2xl bg-emerald-600 text-white font-black text-[11px] uppercase tracking-[0.2em] hover:bg-emerald-700 hover:shadow-2xl hover:shadow-emerald-500/40 transition-all active:scale-95 disabled:opacity-70"
                                    >
                                        {isDownloading ? (
                                            <div className="w-5 h-5 border-2 border-white border-t-transparent rounded-full animate-spin" />
                                        ) : (
                                            <Download className="w-4 h-4" />
                                        )}
                                        Download PDF
                                    </button>
                                ) : <div />}
                            </div>
                            
                            {jobDescription.trim() && (
                                <motion.div 
                                    initial={{ opacity: 0, y: 20 }}
                                    animate={{ opacity: 1, y: 0 }}
                                    className="mt-8 p-4 bg-violet-600 rounded-2xl flex items-center justify-between shadow-lg shadow-violet-200"
                                >
                                    <div className="flex items-center gap-3">
                                        <div className="w-8 h-8 rounded-lg bg-white/20 flex items-center justify-center">
                                            <Sparkles className="w-4 h-4 text-white" />
                                        </div>
                                        <div className="flex flex-col">
                                            <span className="text-[9px] font-black text-violet-200 uppercase tracking-[0.2em]">Next Best AI Action</span>
                                            <span className="text-xs font-bold text-white tracking-tight">Optimize for "{jobTitle || 'Target Role'}" skills gap</span>
                                        </div>
                                    </div>
                                    <button 
                                        onClick={() => setActiveTab('analysis')}
                                        className="px-4 py-2 bg-white text-violet-600 text-[10px] font-black uppercase tracking-widest rounded-lg hover:bg-violet-50 transition-all active:scale-95"
                                    >
                                        Optimize Now
                                    </button>
                                </motion.div>
                            )}
                        </motion.div>
                    )}

                    {activeTab === 'analysis' && (
                        <motion.div key="analysis" custom={direction} variants={variants} initial="enter" animate="center" exit="exit" transition={transition} className="space-y-12">
                            <div id="smart-tailor-section">
                                <h2 className="text-2xl sm:text-3xl font-black text-slate-900 tracking-tight mb-2 font-display">Smart Tailoring</h2>
                                <p className="text-xs sm:text-sm text-slate-500 mb-6 sm:mb-8 font-medium">Instantly adapt your resume to any job description.</p>
                                <SmartTailorPanel 
                                    resumeData={resumeData} 
                                    jobDescription={jobDescription} 
                                    jobTitle={jobTitle} 
                                />
                            </div>

                            <div id="health-check-section" className="pt-8 sm:pt-12 border-t border-slate-100">
                                <h2 className="text-2xl sm:text-3xl font-black text-slate-900 tracking-tight mb-2 font-display">Resume Health</h2>
                                <p className="text-xs sm:text-sm text-slate-500 mb-6 sm:mb-8 font-medium">A comprehensive check of your resume's effectiveness.</p>
                                <ResumeHealthCheck data={resumeData} />
                            </div>
                            
                            <div id="bullet-optimizer-section" className="pt-8 sm:pt-12 border-t border-slate-100">
                                <h2 className="text-2xl sm:text-3xl font-black text-slate-900 tracking-tight mb-2 font-display">Bullet Optimizer</h2>
                                <p className="text-xs sm:text-sm text-slate-500 mb-6 sm:mb-8 font-medium">Use AI to rewrite your experience for maximum impact.</p>
                                <BulletOptimizer jobDescription={jobDescription} />
                            </div>
                        </motion.div>
                    )}

                    {activeTab === 'style' && (
                        <motion.div key="style" custom={direction} variants={variants} initial="enter" animate="center" exit="exit" transition={transition} className="space-y-12 sm:space-y-16">
                            <div id="typography-section" className="pt-8 sm:pt-12">
                                <h2 className="text-2xl sm:text-3xl font-black text-slate-900 tracking-tight mb-2 font-display">Typography & Color</h2>
                                <p className="text-xs sm:text-sm text-slate-500 mb-6 sm:mb-8 font-medium">Fine-tune the aesthetic of your document.</p>
                                <CustomizationPanel customization={customization} onCustomizationChange={(updates) => setCustomization({ ...customization, ...updates })} />
                            </div>
                            
                            <div id="order-section" className="pt-8 sm:pt-12 border-t border-slate-100">
                                <h2 className="text-2xl sm:text-3xl font-black text-slate-900 tracking-tight mb-2 font-display">Order & Visibility</h2>
                                <p className="text-xs sm:text-sm text-slate-500 mb-6 sm:mb-8 font-medium">Rearrange resume sections or hide irrelevant ones.</p>
                                <SectionReorder 
                                    sectionOrder={sectionOrder} 
                                    onOrderChange={setSectionOrder} 
                                    sectionVisibility={sectionVisibility} 
                                    onVisibilityChange={onSectionVisibilityChange} 
                                />
                            </div>
                        </motion.div>
                    )}

                    {activeTab === 'match' && (
                        <motion.div key="match" custom={direction} variants={variants} initial="enter" animate="center" exit="exit" transition={transition} className="space-y-8 sm:space-y-12">
                            <div id="match-analyzer-section">
                                <h2 className="text-2xl sm:text-3xl font-black text-slate-900 tracking-tight mb-2 font-display">Job Matching</h2>
                                <p className="text-xs sm:text-sm text-slate-500 mb-6 sm:mb-8 font-medium">Paste the job description you are targeting to see how you rank.</p>
                                <JobMatchAnalyzer 
                                    resumeData={resumeData} 
                                    jobDescription={jobDescription} 
                                    onJobDescriptionChange={onJobDescriptionChange} 
                                    jobTitle={jobTitle}
                                    onJobTitleChange={onJobTitleChange}
                                />
                            </div>
                            
                            <div id="cover-letter-section" className="pt-8 sm:pt-12 border-t border-slate-100">
                                <h2 className="text-2xl sm:text-3xl font-black text-slate-900 tracking-tight mb-2 font-display">Cover Letter</h2>
                                <p className="text-xs sm:text-sm text-slate-500 mb-6 sm:mb-8 font-medium">Generate a tailored cover letter based on your resume and job description.</p>
                                <button 
                                    onClick={onGenerateCoverLetter}
                                    disabled={isCoverLetterLoading}
                                    className="px-8 py-3 rounded-full bg-emerald-600 text-white font-black text-[10px] uppercase tracking-widest hover:bg-emerald-700 transition-all active:scale-95 disabled:opacity-50"
                                >
                                    {isCoverLetterLoading ? 'Generating...' : 'Generate Cover Letter'}
                                </button>
                            </div>
                        </motion.div>
                    )}
                    {activeTab === 'interview' && (
                        <motion.div key="interview" custom={direction} variants={variants} initial="enter" animate="center" exit="exit" transition={transition}>
                            <div id="interview-prep-section" className="mb-12">
                                <h2 className="text-2xl sm:text-3xl font-black text-slate-900 tracking-tight mb-2 font-display">Interview Preparation</h2>
                                <p className="text-xs sm:text-sm text-slate-500 font-medium">Get ready for your next interview with AI-generated questions tailored to your profile.</p>
                            </div>
                            <InterviewPrepContent 
                                questions={interviewQuestions || []} 
                                role={resumeData.title} 
                                isLoading={isInterviewPrepLoading}
                                onGenerate={onInterviewPrep}
                            />
                        </motion.div>
                    )}
                    {activeTab === 'versions' && (
                        <motion.div key="versions" custom={direction} variants={variants} initial="enter" animate="center" exit="exit" transition={transition}>
                            <div id="version-manager-section" className="mb-12">
                                <h2 className="text-2xl sm:text-3xl font-black text-slate-900 tracking-tight mb-2 font-display">Version Management</h2>
                                <p className="text-xs sm:text-sm text-slate-500 font-medium">Save, load, and manage multiple versions of your resume for different job applications.</p>
                            </div>
                            <VersionManagerPanel 
                                currentData={resumeData}
                                currentCustomization={customization}
                                currentTemplate={template}
                                currentJobDescription={jobDescription}
                                onLoadVersion={onLoadVersion}
                            />
                        </motion.div>
                    )}
                </AnimatePresence>
            </div>

            <SmartTailorModal 
                isOpen={isSmartTailorOpen}
                onClose={() => setIsSmartTailorOpen(false)}
                resumeData={resumeData}
                jobDescription={jobDescription}
                jobTitle={jobTitle}
            />
        </div>
    );
};

export default EditorPanel;
