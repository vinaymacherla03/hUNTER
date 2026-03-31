
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
import AICompactor from './AICompactor';
import TemplateSelector from '../TemplateSelector';

import InterviewPrepContent from './InterviewPrepContent';

interface EditorPanelProps {
    activeTab: 'content' | 'design' | 'match' | 'interview';
    activeSection: ResumeSectionKey | 'contact';
    resumeData: ResumeData;
    onDataChange: (path: string, value: any) => void;
    jobDescription: string;
    onJobDescriptionChange: (jd: string) => void;
    template: TemplateKey;
    onTemplateChange: (template: TemplateKey) => void;
    customization: Customization;
    setCustomization: (c: Customization) => void;
    sectionOrder: ResumeSectionKey[];
    setSectionOrder: (o: ResumeSectionKey[]) => void;
    sectionVisibility: Record<ResumeSectionKey, boolean>;
    onSectionVisibilityChange: (section: ResumeSectionKey, isVisible: boolean) => void;
    onCompactResume: () => Promise<void>;
    setActiveSection: (section: ResumeSectionKey | 'contact') => void;
    onInterviewPrep: () => Promise<void>;
    isInterviewPrepLoading: boolean;
    interviewQuestions: InterviewQuestion[] | null;
    onGenerateCoverLetter: () => Promise<void>;
    isCoverLetterLoading: boolean;
}

const EditorPanel: React.FC<EditorPanelProps> = ({
    activeTab,
    activeSection,
    resumeData,
    onDataChange,
    jobDescription,
    onJobDescriptionChange,
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
    isCoverLetterLoading
}) => {
    
    const animationProps = {
        initial: { opacity: 0, x: -10 },
        animate: { opacity: 1, x: 0 },
        exit: { opacity: 0, x: 10 },
        transition: { duration: 0.2, ease: [0.23, 1, 0.32, 1] as const }
    };

    const allSections = ['contact', ...sectionOrder] as (ResumeSectionKey | 'contact')[];
    const currentIndex = allSections.indexOf(activeSection);
    const hasNext = currentIndex < allSections.length - 1;
    const hasPrev = currentIndex > 0;

    const handleNext = () => {
        if (hasNext) setActiveSection(allSections[currentIndex + 1]);
    };

    const handlePrev = () => {
        if (hasPrev) setActiveSection(allSections[currentIndex - 1]);
    };

    const renderContentForm = () => {
        switch (activeSection) {
            case 'contact': return <ContactForm data={resumeData} onDataChange={onDataChange} />;
            case 'summary': return <SummaryForm data={resumeData} onDataChange={onDataChange} jobDescription={jobDescription} />;
            case 'experience': return <ExperienceForm data={resumeData} onDataChange={onDataChange} jobDescription={jobDescription} />;
            case 'education': return <EducationForm data={resumeData} onDataChange={onDataChange} />;
            case 'skills': return <SkillsForm data={resumeData} onDataChange={onDataChange} />;
            case 'projects': return <ProjectsForm data={resumeData} onDataChange={onDataChange} jobDescription={jobDescription} />;
            case 'certifications': return <CertificationsForm data={resumeData} onDataChange={onDataChange} />;
            case 'awards': return <AwardsForm data={resumeData} onDataChange={onDataChange} />;
            case 'keywords': return <KeywordsForm data={resumeData} onDataChange={onDataChange} />;
            default: return <div>Select a section to edit</div>;
        }
    };

    return (
        <div className="flex-1 bg-white h-full overflow-y-auto custom-scrollbar border-r border-slate-100 shadow-inner">
            <div className="max-w-3xl mx-auto p-6 sm:p-12 pb-32 sm:pb-40">
                <AnimatePresence mode="wait">
                    {activeTab === 'content' && (
                        <motion.div key={activeSection} {...animationProps}>
                            {/* Mobile inline header */}
                            <div className="md:hidden mb-8">
                                <h3 className="text-xs font-black uppercase tracking-[0.2em] text-emerald-600 mb-2">Editor</h3>
                                <p className="text-xl font-bold text-slate-900 capitalize">{activeSection}</p>
                            </div>
                            {renderContentForm()}
                            <div className="mt-12 pt-8 border-t border-slate-100 flex items-center justify-between">
                                {hasPrev ? (
                                    <button 
                                        onClick={handlePrev}
                                        className="px-8 py-3 rounded-full border-2 border-black bg-white text-black font-bold text-sm hover:bg-slate-50 transition-colors"
                                    >
                                        Back
                                    </button>
                                ) : <div />}
                                {hasNext ? (
                                    <button 
                                        onClick={handleNext}
                                        className="px-8 py-3 rounded-full bg-emerald-500 text-white font-bold text-sm hover:bg-emerald-600 transition-colors"
                                    >
                                        Continue
                                    </button>
                                ) : <div />}
                            </div>
                        </motion.div>
                    )}

                    {activeTab === 'design' && (
                        <motion.div key="design" {...animationProps} className="space-y-12 sm:space-y-16">
                            <div className="pt-8 sm:pt-12">
                                <h2 className="text-2xl sm:text-3xl font-black text-slate-900 tracking-tight mb-2">Templates</h2>
                                <p className="text-xs sm:text-sm text-slate-500 mb-6 sm:mb-8 font-medium">Select a pre-designed template for your resume.</p>
                                <TemplateSelector 
                                    currentTemplate={template} 
                                    onTemplateChange={onTemplateChange} 
                                    resumeData={resumeData} 
                                />
                            </div>

                            <div className="pt-8 sm:pt-12 border-t border-slate-100">
                                <h2 className="text-2xl sm:text-3xl font-black text-slate-900 tracking-tight mb-2">Typography & Color</h2>
                                <p className="text-xs sm:text-sm text-slate-500 mb-6 sm:mb-8 font-medium">Fine-tune the aesthetic of your document.</p>
                                <CustomizationPanel customization={customization} onCustomizationChange={(updates) => setCustomization({ ...customization, ...updates })} />
                            </div>
                            
                            <div className="pt-8 sm:pt-12 border-t border-slate-100">
                                <h2 className="text-2xl sm:text-3xl font-black text-slate-900 tracking-tight mb-2">Order & Visibility</h2>
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
                        <motion.div key="match" {...animationProps} className="space-y-8 sm:space-y-12">
                            <div>
                                <h2 className="text-2xl sm:text-3xl font-black text-slate-900 tracking-tight mb-2">ATS Match Score</h2>
                                <p className="text-xs sm:text-sm text-slate-500 mb-6 sm:mb-8 font-medium">Paste the job description you are targeting to see how you rank.</p>
                                <JobMatchAnalyzer resumeData={resumeData} jobDescription={jobDescription} onJobDescriptionChange={onJobDescriptionChange} />
                            </div>
                            
                            <div className="pt-8 sm:pt-12 border-t border-slate-100">
                                <h2 className="text-2xl sm:text-3xl font-black text-slate-900 tracking-tight mb-2">Cover Letter</h2>
                                <p className="text-xs sm:text-sm text-slate-500 mb-6 sm:mb-8 font-medium">Generate a tailored cover letter based on your resume and job description.</p>
                                <button 
                                    onClick={onGenerateCoverLetter}
                                    disabled={isCoverLetterLoading}
                                    className="px-8 py-3 rounded-full bg-emerald-600 text-white font-bold text-sm hover:bg-emerald-700 transition-colors disabled:opacity-50"
                                >
                                    {isCoverLetterLoading ? 'Generating...' : 'Generate Cover Letter'}
                                </button>
                            </div>
                        </motion.div>
                    )}
                    {activeTab === 'interview' && (
                        <motion.div key="interview" {...animationProps}>
                            <InterviewPrepContent 
                                questions={interviewQuestions || []} 
                                role={resumeData.title} 
                                isLoading={isInterviewPrepLoading}
                                onGenerate={onInterviewPrep}
                            />
                        </motion.div>
                    )}
                </AnimatePresence>
            </div>
        </div>
    );
};

export default EditorPanel;
