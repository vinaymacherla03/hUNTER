
import React, { useState } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { TrendingUp, Compass, Building, Sparkles, Zap, ChevronRight, Users, DollarSign, Award, ScanFace, Ghost, Target, Search, ArrowRightLeft, Briefcase } from 'lucide-react';
import InsightsPanel from './InsightsPanel';
import StrategyPanel from './StrategyPanel';
import CompanyResearchPanel from './CompanyResearchPanel';
import NetworkingPanel from './NetworkingPanel';
import SalaryPanel from './SalaryPanel';
import ScorecardPanel from './ScorecardPanel';
import BrandAuditPanel from './BrandAuditPanel';
import GhostingRiskPanel from './GhostingRiskPanel';
import PivotSimulator from './PivotSimulator';
import CareerRoadmapPanel from './CareerRoadmapPanel';
import InternshipFinderPanel from './InternshipFinderPanel';
import JobSearch from '../JobSearch';
import { ResumeData } from '../../types';

interface CareerHubProps {
    resumeData: ResumeData;
}

type HubTab = 'search' | 'trends' | 'strategy' | 'research' | 'networking' | 'salary' | 'scorecard' | 'vibe' | 'ghost' | 'pivot' | 'roadmap' | 'internships';

const CareerHub: React.FC<CareerHubProps> = ({ resumeData }) => {
    const [activeTab, setActiveTab] = useState<HubTab>('search');

    const tabs = [
        { id: 'search', label: 'Job Search', icon: Search, color: 'text-white', bg: 'bg-gradient-to-b from-blue-400 to-blue-600 shadow-[0_4px_10px_rgba(59,130,246,0.4),inset_0_2px_0_rgba(255,255,255,0.3)]' },
        { id: 'strategy', label: 'Strategy', icon: Compass, color: 'text-white', bg: 'bg-gradient-to-b from-purple-400 to-purple-600 shadow-[0_4px_10px_rgba(168,85,247,0.4),inset_0_2px_0_rgba(255,255,255,0.3)]' },
        { id: 'roadmap', label: 'Roadmap', icon: Target, color: 'text-white', bg: 'bg-gradient-to-b from-rose-400 to-rose-600 shadow-[0_4px_10px_rgba(244,63,94,0.4),inset_0_2px_0_rgba(255,255,255,0.3)]' },
        { id: 'internships', label: 'Internships', icon: Briefcase, color: 'text-white', bg: 'bg-gradient-to-b from-amber-400 to-amber-600 shadow-[0_4px_10px_rgba(251,191,36,0.4),inset_0_2px_0_rgba(255,255,255,0.3)]' },
        { id: 'scorecard', label: 'Scorecard', icon: Award, color: 'text-white', bg: 'bg-gradient-to-b from-emerald-400 to-emerald-600 shadow-[0_4px_10px_rgba(52,211,153,0.4),inset_0_2px_0_rgba(255,255,255,0.3)]' },
        { id: 'vibe', label: 'Vibe Check', icon: ScanFace, color: 'text-white', bg: 'bg-gradient-to-b from-cyan-400 to-cyan-600 shadow-[0_4px_10px_rgba(34,211,238,0.4),inset_0_2px_0_rgba(255,255,255,0.3)]' },
        { id: 'pivot', label: 'Pivot', icon: ArrowRightLeft, color: 'text-white', bg: 'bg-gradient-to-b from-indigo-400 to-indigo-600 shadow-[0_4px_10px_rgba(99,102,241,0.4),inset_0_2px_0_rgba(255,255,255,0.3)]' },
        { id: 'trends', label: 'Trends', icon: TrendingUp, color: 'text-white', bg: 'bg-gradient-to-b from-pink-400 to-pink-600 shadow-[0_4px_10px_rgba(244,114,182,0.4),inset_0_2px_0_rgba(255,255,255,0.3)]' },
        { id: 'research', label: 'Research', icon: Building, color: 'text-white', bg: 'bg-gradient-to-b from-sky-400 to-sky-600 shadow-[0_4px_10px_rgba(56,189,248,0.4),inset_0_2px_0_rgba(255,255,255,0.3)]' },
        { id: 'ghost', label: 'Ghosting', icon: Ghost, color: 'text-white', bg: 'bg-gradient-to-b from-slate-500 to-slate-700 shadow-[0_4px_10px_rgba(100,116,139,0.4),inset_0_2px_0_rgba(255,255,255,0.3)]' },
        { id: 'networking', label: 'Networking', icon: Users, color: 'text-white', bg: 'bg-gradient-to-b from-fuchsia-400 to-fuchsia-600 shadow-[0_4px_10px_rgba(232,121,249,0.4),inset_0_2px_0_rgba(255,255,255,0.3)]' },
        { id: 'salary', label: 'Salary', icon: DollarSign, color: 'text-white', bg: 'bg-gradient-to-b from-green-400 to-green-600 shadow-[0_4px_10px_rgba(74,222,128,0.4),inset_0_2px_0_rgba(255,255,255,0.3)]' },
    ];

    return (
        <div className="flex flex-col gap-8">
            {/* Header Section */}
            <div className="relative bg-slate-900 rounded-[2.5rem] p-8 sm:p-10 overflow-hidden shadow-2xl shadow-slate-900/20">
                {/* Decorative background elements */}
                <div className="absolute top-0 right-0 w-96 h-96 bg-emerald-500/20 rounded-full blur-3xl -translate-y-1/2 translate-x-1/3 pointer-events-none"></div>
                <div className="absolute bottom-0 left-0 w-64 h-64 bg-teal-500/20 rounded-full blur-3xl translate-y-1/3 -translate-x-1/3 pointer-events-none"></div>
                
                <div className="relative z-10 flex flex-col md:flex-row md:items-center justify-between gap-6">
                    <div className="flex items-center gap-5 sm:gap-6">
                        <div className="w-14 h-14 sm:w-16 sm:h-16 rounded-[1.5rem] bg-gradient-to-br from-emerald-500 to-teal-600 flex items-center justify-center shadow-xl shadow-emerald-900/50 border border-white/10 shrink-0">
                            <Sparkles className="w-7 h-7 sm:w-8 sm:h-8 text-white" />
                        </div>
                        <div>
                            <div className="flex items-center gap-3 mb-1.5 sm:mb-2">
                                <h2 className="text-2xl sm:text-3xl md:text-4xl font-black text-white tracking-tight">Career Intelligence Hub</h2>
                                <span className="hidden sm:inline-flex px-3 py-1 rounded-full bg-emerald-500/20 border border-emerald-500/30 text-emerald-300 text-[10px] font-black uppercase tracking-widest">AI Powered</span>
                            </div>
                            <p className="text-sm sm:text-base text-slate-400 font-medium max-w-xl">Real-time market search, strategic analysis, and career roadmapping.</p>
                        </div>
                    </div>
                </div>
            </div>

            {/* Sub-navigation */}
            <div className="relative w-full">
                <div className="flex flex-wrap gap-2 pb-4 px-2">
                    {tabs.map((tab) => (
                        <button
                            key={tab.id}
                            onClick={() => setActiveTab(tab.id as HubTab)}
                            className={`relative flex items-center gap-2 px-4 sm:px-5 py-2.5 sm:py-3 rounded-[1rem] text-xs sm:text-sm font-bold uppercase tracking-wider transition-all shrink-0 group ${
                                activeTab === tab.id 
                                ? 'text-slate-900 shadow-sm ring-1 ring-slate-200/60 bg-white' 
                                : 'text-slate-500 hover:text-slate-800 hover:bg-slate-100/80 bg-slate-50/50'
                            }`}
                        >
                            {activeTab === tab.id && (
                                <motion.div
                                    layoutId="activeHubTab"
                                    className="absolute inset-0 bg-white rounded-[1rem]"
                                    transition={{ type: "spring", bounce: 0.2, duration: 0.6 }}
                                    style={{ zIndex: -1 }}
                                />
                            )}
                            <span className="relative z-10 flex items-center gap-2.5">
                                <div className={`p-1.5 rounded-lg transition-all duration-300 ${tab.bg} ${activeTab === tab.id ? 'scale-110 ring-2 ring-offset-2 ring-slate-200' : 'opacity-80 group-hover:opacity-100 group-hover:scale-105'}`}>
                                    <tab.icon className={`w-4 h-4 ${tab.color} drop-shadow-md`} />
                                </div>
                                <span>{tab.label}</span>
                            </span>
                        </button>
                    ))}
                </div>
            </div>

            <AnimatePresence mode="wait">
                <motion.div
                    key={activeTab}
                    initial={{ opacity: 0, y: 10 }}
                    animate={{ opacity: 1, y: 0 }}
                    exit={{ opacity: 0, y: -10 }}
                    transition={{ duration: 0.2 }}
                >
                    {activeTab === 'search' && <JobSearch />}
                    {activeTab === 'strategy' && <StrategyPanel resumeData={resumeData} />}
                    {activeTab === 'roadmap' && <CareerRoadmapPanel resumeData={resumeData} />}
                    {activeTab === 'internships' && <InternshipFinderPanel resumeData={resumeData} />}
                    {activeTab === 'trends' && <InsightsPanel defaultRole={resumeData.title} />}
                    {activeTab === 'research' && <CompanyResearchPanel />}
                    {activeTab === 'networking' && <NetworkingPanel resumeData={resumeData} />}
                    {activeTab === 'salary' && <SalaryPanel defaultRole={resumeData.title} />}
                    {activeTab === 'scorecard' && <ScorecardPanel resumeData={resumeData} />}
                    {activeTab === 'vibe' && <BrandAuditPanel resumeData={resumeData} />}
                    {activeTab === 'ghost' && <GhostingRiskPanel />}
                    {activeTab === 'pivot' && <PivotSimulator resumeData={resumeData} />}
                </motion.div>
            </AnimatePresence>

            {/* Hub Footer / Quick Tips */}
            <div className="pt-12 border-t border-slate-100">
                <div className="bg-slate-900 rounded-[2.5rem] p-8 text-white relative overflow-hidden">
                    <div className="absolute top-0 right-0 w-64 h-64 bg-emerald-500/20 rounded-full -translate-y-1/2 translate-x-1/2 blur-3xl"></div>
                    <div className="relative z-10 flex flex-col md:flex-row items-center justify-between gap-8">
                        <div className="max-w-lg">
                            <div className="flex items-center gap-2 mb-4">
                                <Zap className="w-5 h-5 text-yellow-400 fill-yellow-400" />
                                <span className="text-xs font-black uppercase tracking-[0.2em] text-emerald-400">Pro Insight</span>
                            </div>
                            <h3 className="text-2xl font-bold mb-4">The "Hidden" Job Market</h3>
                            <p className="text-slate-400 font-medium leading-relaxed">
                                Over 70% of jobs are never publicly listed. Use the **Company Intelligence** tool to identify high-growth firms and reach out directly to hiring managers before roles are even posted.
                            </p>
                        </div>
                        <button className="px-8 py-4 bg-white text-slate-900 rounded-2xl font-black uppercase tracking-widest text-xs hover:bg-emerald-50 transition-all flex items-center gap-2 shrink-0">
                            Learn Networking Strategy <ChevronRight className="w-4 h-4" />
                        </button>
                    </div>
                </div>
            </div>
        </div>
    );
};

export default CareerHub;
