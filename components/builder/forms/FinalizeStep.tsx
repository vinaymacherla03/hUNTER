import React, { useState } from 'react';
import { ResumeData, TemplateKey, Customization, ResumeSectionKey } from '../../../types';

// FIX: Removed import for TemplateSelector as the component is obsolete and not a module.
// import TemplateSelector from '../../TemplateSelector';
import CustomizationPanel from '../../CustomizationPanel';
import SectionReorder from '../../SectionReorder';
import JobMatchAnalyzer from '../JobMatchAnalyzer';
import AccordionItem from '../../AccordionItem';
import AICompactor from '../AICompactor';

interface FinalizeStepProps {
    template: TemplateKey;
    setTemplate: (template: TemplateKey) => void;
    customization: Customization;
    setCustomization: (customization: Customization) => void;
    sectionOrder: ResumeSectionKey[];
    setSectionOrder: (order: ResumeSectionKey[]) => void;
    sectionVisibility: Record<ResumeSectionKey, boolean>;
    onSectionVisibilityChange: (section: ResumeSectionKey, isVisible: boolean) => void;
    resumeData: ResumeData;
    onCompactResume: () => Promise<void>;
    jobDescription: string;
    onJobDescriptionChange: (jd: string) => void;
}

const FinalizeStep: React.FC<FinalizeStepProps> = ({
    template,
    setTemplate,
    customization,
    setCustomization,
    sectionOrder,
    setSectionOrder,
    sectionVisibility,
    onSectionVisibilityChange,
    resumeData,
    onCompactResume,
    jobDescription,
    onJobDescriptionChange
}) => {
    
    const [openAccordion, setOpenAccordion] = useState<string | null>('ai-assistants');

    const toggleAccordion = (id: string) => {
        setOpenAccordion(openAccordion === id ? null : id);
    };


    return (
        <div>
            <h2 className="text-2xl font-bold font-display text-[var(--dark-text-primary)] mb-6">Final Touches</h2>
            
            <div className="space-y-2">
                 <AccordionItem
                    title="AI Assistants"
                    defaultOpen={true}
                >
                    <div className="space-y-6">
                        <div>
                            <h4 className="text-sm font-semibold text-slate-300 mb-3">Job Match Analyzer</h4>
                            <JobMatchAnalyzer 
                                resumeData={resumeData} 
                                jobDescription={jobDescription} 
                                onJobDescriptionChange={onJobDescriptionChange}
                            />
                        </div>
                        <div className="border-t border-[var(--dark-border)]" />
                        <div>
                             <h4 className="text-sm font-semibold text-slate-300 mb-3">AI Compactor</h4>
                            <AICompactor onCompact={onCompactResume} />
                        </div>
                    </div>
                </AccordionItem>

                {/* FIX: Removed obsolete TemplateSelector component which is no longer used in the application.
                <AccordionItem
                    id="template"
                    title="Template"
                    isOpen={openAccordion === 'template'}
                    toggleAccordion={toggleAccordion}
                >
                    <TemplateSelector 
                        currentTemplate={template} 
                        onTemplateChange={setTemplate} 
                        resumeData={resumeData} 
                    />
                </AccordionItem>
                */}

                 <AccordionItem
                    title="Style & Formatting"
                    defaultOpen={false}
                 >
                    <CustomizationPanel customization={customization} onCustomizationChange={(updates) => setCustomization({ ...customization, ...updates })} />
                </AccordionItem>

                 <AccordionItem
                    title="Manage Sections"
                    defaultOpen={false}
                 >
                     <p className="text-xs text-[var(--dark-text-secondary)] mb-3">Drag to reorder sections, or toggle visibility.</p>
                    <SectionReorder 
                        sectionOrder={sectionOrder} 
                        onOrderChange={setSectionOrder} 
                        sectionVisibility={sectionVisibility}
                        onVisibilityChange={onSectionVisibilityChange}
                    />
                </AccordionItem>
            </div>
        </div>
    );
};

export default FinalizeStep;