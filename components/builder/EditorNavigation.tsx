
import React from 'react';
import { ResumeSectionKey } from '../../types';
import { TargetIcon, StyleIcon, SectionsIcon, TemplatesIcon } from '../icons/ThreeDIcons';

interface EditorNavigationProps {
    activeTab: 'content' | 'design' | 'match' | 'interview';
    setActiveTab: (tab: 'content' | 'design' | 'match' | 'interview') => void;
    activeSection: ResumeSectionKey | 'contact';
    setActiveSection: (section: ResumeSectionKey | 'contact') => void;
    sectionOrder: ResumeSectionKey[];
}

const NavItem: React.FC<{ 
    label: string; 
    active: boolean; 
    onClick: () => void;
    icon?: React.ReactNode;
}> = ({ label, active, onClick, icon }) => (
    <button
        onClick={onClick}
        className={`flex items-center gap-4 px-6 py-4 text-sm font-semibold transition-all duration-200 rounded-r-full mr-4 group shrink-0 ${
            active 
            ? 'bg-slate-800 text-white' 
            : 'text-white/80 hover:bg-white/10 hover:text-white'
        }`}
    >
        <div className="flex items-center gap-4">
            {icon && <span className={`${active ? 'text-emerald-400' : 'text-white/60 group-hover:text-white'} transition-colors`}>{icon}</span>}
            <span className="whitespace-nowrap capitalize">{label}</span>
        </div>
    </button>
);

const EditorNavigation: React.FC<EditorNavigationProps> = ({ 
    activeTab, 
    setActiveTab, 
    activeSection, 
    setActiveSection, 
    sectionOrder 
}) => {
    
    const renderContentNav = () => (
        <div className="flex md:flex-col gap-1 mt-6 overflow-x-auto md:overflow-x-visible no-scrollbar">
            <NavItem 
                label="Header" 
                active={activeSection === 'contact'} 
                onClick={() => setActiveSection('contact')} 
                icon={<svg className="w-6 h-6" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}><path strokeLinecap="round" strokeLinejoin="round" d="M5.121 17.804A13.937 13.937 0 0112 16c2.5 0 4.847.655 6.879 1.804M15 10a3 3 0 11-6 0 3 3 0 016 0zm6 2a9 9 0 11-18 0 9 9 0 0118 0z" /></svg>}
            />
            {sectionOrder.map(section => (
                <NavItem 
                    key={section}
                    label={section}
                    active={activeSection === section}
                    onClick={() => setActiveSection(section)}
                    icon={getSectionIcon(section)}
                />
            ))}
        </div>
    );

    return (
        <div className="w-full md:w-72 bg-slate-900 text-white flex flex-col md:h-full flex-shrink-0 relative">
            {/* Logo Area */}
            <div className="p-6 hidden md:flex items-center gap-2">
                <div className="flex flex-col gap-1">
                    <div className="w-4 h-1.5 bg-emerald-400 rounded-full"></div>
                    <div className="w-6 h-1.5 bg-teal-500 rounded-full"></div>
                    <div className="w-8 h-1.5 bg-emerald-600 rounded-full"></div>
                </div>
                <span className="text-2xl font-bold tracking-tight">HuntDesk</span>
            </div>

            {/* Collapse Button */}
            <button className="hidden md:flex absolute -right-4 top-6 w-8 h-8 bg-emerald-600 rounded-full items-center justify-center text-white shadow-lg z-10 hover:bg-emerald-700 transition-colors">
                <svg className="w-5 h-5" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2.5}><path strokeLinecap="round" strokeLinejoin="round" d="M15 19l-7-7 7-7" /></svg>
            </button>

            {/* Main Tabs - Hidden on Mobile because they are now in the Bottom Nav */}
            <div className="hidden md:block px-4 pb-2">
                <div className="flex p-1 bg-black/20 rounded-xl mb-4">
                    <button 
                        id="tour-edit-tab"
                        onClick={() => setActiveTab('content')}
                        className={`flex-1 py-2 text-xs font-bold uppercase tracking-wider rounded-lg transition-all ${activeTab === 'content' ? 'bg-white text-slate-900 shadow-md' : 'text-white/70 hover:text-white'}`}
                    >
                        Edit
                    </button>
                    <button 
                        id="tour-style-tab"
                        onClick={() => setActiveTab('design')}
                        className={`flex-1 py-2 text-xs font-bold uppercase tracking-wider rounded-lg transition-all ${activeTab === 'design' ? 'bg-white text-slate-900 shadow-md' : 'text-white/70 hover:text-white'}`}
                    >
                        Style
                    </button>
                    <button 
                        id="tour-match-tab"
                        onClick={() => setActiveTab('match')}
                        className={`flex-1 py-2 text-[10px] font-bold uppercase tracking-wider rounded-lg transition-all ${activeTab === 'match' ? 'bg-white text-slate-900 shadow-md' : 'text-white/70 hover:text-white'}`}
                    >
                        Match
                    </button>
                    <button 
                        id="tour-prep-tab"
                        onClick={() => setActiveTab('interview')}
                        className={`flex-1 py-2 text-[10px] font-bold uppercase tracking-wider rounded-lg transition-all ${activeTab === 'interview' ? 'bg-white text-slate-900 shadow-md' : 'text-white/70 hover:text-white'}`}
                    >
                        Prep
                    </button>
                </div>
            </div>

            {/* Section List */}
            <div className="flex-1 overflow-x-auto md:overflow-y-auto no-scrollbar py-2">
                {activeTab === 'content' && renderContentNav()}
                
                {activeTab === 'design' && (
                    <div className="mt-6 px-4 flex md:flex-col gap-3 overflow-x-auto md:overflow-x-visible no-scrollbar">
                        <div className="p-4 bg-white/5 rounded-2xl border border-white/10 hover:border-white/30 transition-colors cursor-pointer group shrink-0 md:shrink">
                            <StyleIcon className="w-8 h-8 mx-auto mb-2 opacity-70 group-hover:opacity-100 text-white" />
                            <p className="text-xs font-bold text-white uppercase tracking-widest text-center">Format</p>
                        </div>
                        <div className="p-4 bg-white/5 rounded-2xl border border-white/10 hover:border-white/30 transition-colors cursor-pointer group shrink-0 md:shrink">
                            <TemplatesIcon className="w-8 h-8 mx-auto mb-2 opacity-70 group-hover:opacity-100 text-white" />
                            <p className="text-xs font-bold text-white uppercase tracking-widest text-center">Layout</p>
                        </div>
                    </div>
                )}

                {activeTab === 'match' && (
                    <div className="mt-8 px-4 flex flex-col items-center">
                        <TargetIcon className="scale-90 opacity-60 text-white" />
                        <p className="mt-6 text-xs font-bold text-white/70 uppercase tracking-widest text-center leading-relaxed">
                            Optimize Profile
                        </p>
                    </div>
                )}
            </div>
            
            {/* Support Footer */}
            <div className="hidden md:block p-6 border-t border-white/10">
                <div className="flex items-center gap-4 text-xs font-semibold text-white/90 mb-4">
                    <a href="#" className="hover:underline">Terms</a>
                    <div className="w-px h-3 bg-white/30"></div>
                    <a href="#" className="hover:underline">Privacy policy</a>
                    <div className="w-px h-3 bg-white/30"></div>
                    <a href="#" className="hover:underline">Contact us</a>
                </div>
                <p className="text-[10px] text-white/50">© 2026, Bold Limited. All rights reserved.</p>
            </div>
        </div>
    );
};

function getSectionIcon(section: string) {
    const props = { className: "w-6 h-6", strokeWidth: 2 };
    switch(section) {
        case 'summary': return <svg {...props} fill="none" viewBox="0 0 24 24" stroke="currentColor"><path strokeLinecap="round" strokeLinejoin="round" d="M10 6H5a2 2 0 00-2 2v9a2 2 0 002 2h14a2 2 0 002-2V8a2 2 0 00-2-2h-5m-4 0V5a2 2 0 114 0v1m-4 0a2 2 0 104 0m-5 8a2 2 0 100-4 2 2 0 000 4zm0 0c1.306 0 2.417.835 2.83 2M9 14a3.001 3.001 0 00-2.83 2M15 11h3m-3 4h2" /></svg>;
        case 'experience': return <svg {...props} fill="none" viewBox="0 0 24 24" stroke="currentColor"><path strokeLinecap="round" strokeLinejoin="round" d="M9 12h6m-6 4h6m2 5H7a2 2 0 01-2-2V5a2 2 0 012-2h5.586a1 1 0 01.707.293l5.414 5.414a1 1 0 01.293.707V19a2 2 0 01-2 2z" /></svg>;
        case 'education': return <svg {...props} fill="none" viewBox="0 0 24 24" stroke="currentColor"><path d="M12 14l9-5-9-5-9 5 9 5z" /><path d="M12 14l6.16-3.422a12.083 12.083 0 01.665 6.479A11.952 11.952 0 0012 20.055a11.952 11.952 0 00-6.824-2.998 12.078 12.078 0 01.665-6.479L12 14z" /></svg>;
        case 'skills': return <svg {...props} fill="none" viewBox="0 0 24 24" stroke="currentColor"><path strokeLinecap="round" strokeLinejoin="round" d="M10.325 4.317c.426-1.756 2.924-1.756 3.35 0a1.724 1.724 0 002.573 1.066c1.543-.94 3.31.826 2.37 2.37a1.724 1.724 0 001.065 2.572c1.756.426 1.756 2.924 0 3.35a1.724 1.724 0 00-1.066 2.573c.94 1.543-.826 3.31-2.37 2.37a1.724 1.724 0 00-2.572 1.065c-.426 1.756-2.924 1.756-3.35 0a1.724 1.724 0 00-2.573-1.066c-1.543.94-3.31-.826-2.37-2.37a1.724 1.724 0 00-1.065-2.572c-1.756-.426-1.756-2.924 0-3.35a1.724 1.724 0 001.066-2.573c-.94-1.543.826-3.31 2.37-2.37.996.608 2.296.07 2.572-1.065z" /><path strokeLinecap="round" strokeLinejoin="round" d="M15 12a3 3 0 11-6 0 3 3 0 016 0z" /></svg>;
        case 'projects': return <svg {...props} fill="none" viewBox="0 0 24 24" stroke="currentColor"><path strokeLinecap="round" strokeLinejoin="round" d="M19 11H5m14 0a2 2 0 012 2v6a2 2 0 01-2 2H5a2 2 0 01-2-2v-6a2 2 0 012-2m14 0V9a2 2 0 00-2-2M5 11V9a2 2 0 012-2" /></svg>;
        case 'certifications': return <svg {...props} fill="none" viewBox="0 0 24 24" stroke="currentColor"><path strokeLinecap="round" strokeLinejoin="round" d="M9 12l2 2 4-4m6 2a9 9 0 11-18 0 9 9 0 0118 0z" /></svg>;
        case 'awards': return <svg {...props} fill="none" viewBox="0 0 24 24" stroke="currentColor"><path strokeLinecap="round" strokeLinejoin="round" d="M5 3v4M3 5h4M6 17v4m-2-2h4m5-16l2.286 6.857L21 12l-5.714 2.143L13 21l-2.286-6.857L5 12l5.714-2.143L13 3z" /></svg>;
        case 'keywords': return <svg {...props} fill="none" viewBox="0 0 24 24" stroke="currentColor"><path strokeLinecap="round" strokeLinejoin="round" d="M7 7h.01M7 3h5c.512 0 1.024.195 1.414.586l7 7a2 2 0 010 2.828l-7 7a2 2 0 01-2.828 0l-7-7A1.994 1.994 0 013 12V7a4 4 0 014-4z" /></svg>;
        default: return <svg {...props} fill="none" viewBox="0 0 24 24" stroke="currentColor"><path strokeLinecap="round" strokeLinejoin="round" d="M4 6h16M4 12h16M4 18h16" /></svg>;
    }
}

export default EditorNavigation;
