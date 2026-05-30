
import React, { useState } from 'react';
import { motion } from 'framer-motion';
import { ResumeData, ResumeSectionKey } from '../../types';
import { TargetIcon, StyleIcon, SectionsIcon } from '../icons/ThreeDIcons';
import { FileText, Paintbrush, Target, MessageSquare, Clock, Wand2, Search, Sparkles, User, Zap, CheckCircle2, ChevronLeft, LayoutTemplate, History } from 'lucide-react';

interface EditorNavigationProps {
    activeTab: 'content' | 'style' | 'match' | 'interview' | 'versions' | 'analysis';
    setActiveTab: (tab: 'content' | 'style' | 'match' | 'interview' | 'versions' | 'analysis') => void;
    activeSection: ResumeSectionKey | 'contact' | 'finalize';
    setActiveSection: (section: ResumeSectionKey | 'contact' | 'finalize') => void;
    sectionOrder: ResumeSectionKey[];
    resumeData: ResumeData;
    isCollapsed: boolean;
    setIsCollapsed: (collapsed: boolean) => void;
}

const NavTab: React.FC<{
    label: string;
    active: boolean;
    onClick: () => void;
    icon: React.ReactNode;
    isCollapsed: boolean;
}> = ({ label, active, onClick, icon, isCollapsed }) => (
    <button
        onClick={onClick}
        title={isCollapsed ? label : undefined}
        className={`relative flex items-center gap-3 w-full px-3 py-2.5 rounded-xl text-[13px] font-semibold transition-all duration-200 ${
            active 
            ? 'bg-slate-900 text-white shadow-md' 
            : 'text-slate-600 hover:bg-slate-100 hover:text-slate-900'
        } ${isCollapsed ? 'justify-center' : 'justify-start'}`}
    >
        <span className={active ? 'text-emerald-400' : 'text-slate-400'}>{icon}</span>
        {!isCollapsed && <span>{label}</span>}
    </button>
);

const NavSection: React.FC<{
    label: string;
    active: boolean;
    onClick: () => void;
    icon: React.ReactNode;
    isCompleted: boolean;
    isCollapsed: boolean;
}> = ({ label, active, onClick, icon, isCompleted, isCollapsed }) => (
    <button
        onClick={onClick}
        title={isCollapsed ? label : undefined}
        className={`relative group flex items-center gap-3 w-full px-3 py-2 rounded-xl text-[13px] font-medium transition-all duration-200 ${
            active 
            ? 'bg-white text-emerald-700 shadow-sm ring-1 ring-slate-200/50 font-semibold' 
            : 'text-slate-500 hover:bg-white/60 hover:text-slate-800'
        } ${isCollapsed ? 'justify-center' : 'justify-between'}`}
    >
        {active && <div className="absolute left-0 top-1/2 -translate-y-1/2 w-1 h-1/2 bg-emerald-500 rounded-r-full" />}
        <div className={`flex items-center gap-3 ${isCollapsed ? 'justify-center' : ''}`}>
            <span className={active ? 'text-emerald-600' : 'text-slate-400 group-hover:text-slate-500 transition-colors'}>{icon}</span>
            {!isCollapsed && <span className="capitalize">{label}</span>}
        </div>
        {!isCollapsed && isCompleted && (
            <CheckCircle2 className={`w-3.5 h-3.5 ${active ? 'text-emerald-500' : 'text-slate-300'}`} />
        )}
        {isCollapsed && isCompleted && (
            <div className={`absolute top-1.5 right-1.5 w-1.5 h-1.5 rounded-full ${active ? 'bg-emerald-500' : 'bg-slate-300'}`} />
        )}
    </button>
);

const EditorNavigation: React.FC<EditorNavigationProps> = ({ 
    activeTab, 
    setActiveTab, 
    activeSection, 
    setActiveSection, 
    sectionOrder,
    resumeData,
    isCollapsed,
    setIsCollapsed
}) => {
    const isSectionCompleted = (section: ResumeSectionKey | 'contact' | 'finalize') => {
        if (section === 'contact') return !!(resumeData.fullName && resumeData.contactInfo?.email);
        if (section === 'summary') return !!(resumeData.summary && resumeData.summary.length > 10);
        if (section === 'finalize') return sectionOrder.every(s => isSectionCompleted(s)) && isSectionCompleted('contact');
        const data = resumeData[section as keyof ResumeData];
        return Array.isArray(data) && data.length > 0;
    };

    return (
        <div className={`h-full ${isCollapsed ? 'w-[72px]' : 'w-[260px]'} bg-slate-50/80 border-r border-slate-200/60 flex flex-col transition-all duration-300 relative z-20 backdrop-blur-xl`}>
            {/* Collapse Button */}
            <button 
                onClick={() => setIsCollapsed(!isCollapsed)}
                className="absolute -right-3 top-6 w-6 h-6 bg-white border border-slate-200 rounded-full flex items-center justify-center text-slate-400 hover:text-slate-600 hover:shadow-sm transition-all z-30 ring-4 ring-slate-50"
            >
                <ChevronLeft className={`w-3.5 h-3.5 transition-transform duration-300 ${isCollapsed ? 'rotate-180' : ''}`} />
            </button>

            <div className="flex-1 overflow-y-auto no-scrollbar py-6 px-3 space-y-8">
                {/* Primary Tabs */}
                <div className="space-y-1">
                    {!isCollapsed && <h3 className="px-3 text-[10px] font-bold tracking-[0.15em] text-slate-400 uppercase mb-3">Tools</h3>}
                    <NavTab label="Content Edit" active={activeTab === 'content'} onClick={() => setActiveTab('content')} icon={<FileText className="w-[18px] h-[18px]" />} isCollapsed={isCollapsed} />
                    <NavTab label="Styling" active={activeTab === 'style'} onClick={() => setActiveTab('style')} icon={<Paintbrush className="w-[18px] h-[18px]" />} isCollapsed={isCollapsed} />
                    <NavTab label="Tailoring" active={activeTab === 'match'} onClick={() => setActiveTab('match')} icon={<Target className="w-[18px] h-[18px]" />} isCollapsed={isCollapsed} />
                    <NavTab label="History" active={activeTab === 'versions'} onClick={() => setActiveTab('versions')} icon={<History className="w-[18px] h-[18px]" />} isCollapsed={isCollapsed} />
                </div>

                {/* Sub-navigation based on active header */}
                {activeTab === 'content' && (
                    <div className="space-y-1">
                        {!isCollapsed && <h3 className="px-3 text-[10px] font-bold tracking-[0.15em] text-slate-400 uppercase mb-3 mt-4">Sections</h3>}
                        <NavSection label="Contact" active={activeSection === 'contact'} onClick={() => setActiveSection('contact')} icon={<User className="w-[16px] h-[16px]" />} isCompleted={isSectionCompleted('contact')} isCollapsed={isCollapsed} />
                        {sectionOrder.map(section => (
                            <NavSection key={section} label={section} active={activeSection === section} onClick={() => setActiveSection(section)} icon={getSectionIcon(section)} isCompleted={isSectionCompleted(section)} isCollapsed={isCollapsed} />
                        ))}
                        <NavSection label="Finalize" active={activeSection === 'finalize'} onClick={() => setActiveSection('finalize')} icon={<CheckCircle2 className="w-[16px] h-[16px]" />} isCompleted={isSectionCompleted('finalize')} isCollapsed={isCollapsed} />
                    </div>
                )}
            </div>
        </div>
    );
};

function getSectionIcon(section: string) {
    const props = { className: "w-[18px] h-[18px]", strokeWidth: 2 };
    switch(section) {
        case 'summary': return <FileText {...props} />;
        case 'experience': return <Clock {...props} />;
        case 'education': return <Wand2 {...props} />;
        case 'skills': return <Sparkles {...props} />;
        case 'projects': return <LayoutTemplate {...props} />;
        case 'certifications': return <CheckCircle2 {...props} />;
        case 'awards': return <Zap {...props} />;
        case 'keywords': return <Target {...props} />;
        default: return <FileText {...props} />;
    }
}

export default EditorNavigation;

