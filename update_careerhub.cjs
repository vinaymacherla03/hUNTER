const fs = require('fs');
let code = fs.readFileSync('components/builder/CareerHub.tsx', 'utf-8');

const replacement = `
    const tabGroups = [
        {
            title: "Mission Control",
            tabs: [
                { id: 'dashboard', label: 'Dashboard', icon: Layout, color: 'text-white', bg: 'bg-gradient-to-b from-slate-700 to-slate-900 shadow-[0_4px_10px_rgba(15,23,42,0.4),inset_0_2px_0_rgba(255,255,255,0.3)]' },
                { id: 'automation', label: 'Automation', icon: Zap, color: 'text-white', bg: 'bg-gradient-to-b from-amber-400 to-amber-600 shadow-[0_4px_10px_rgba(251,191,36,0.4),inset_0_2px_0_rgba(255,255,255,0.3)]' },
                { id: 'tracker', label: 'Tracker', icon: Briefcase, color: 'text-white', bg: 'bg-gradient-to-b from-indigo-400 to-indigo-600 shadow-[0_4px_10px_rgba(99,102,241,0.4),inset_0_2px_0_rgba(255,255,255,0.3)]' }
            ]
        },
        {
            title: "Search & Apply",
            tabs: [
                { id: 'search', label: 'Find Jobs', icon: Search, color: 'text-white', bg: 'bg-gradient-to-b from-emerald-400 to-emerald-600 shadow-[0_4px_10px_rgba(59,130,246,0.4),inset_0_2px_0_rgba(255,255,255,0.3)]' },
                { id: 'match', label: 'Match Analysis', icon: Target, color: 'text-white', bg: 'bg-gradient-to-b from-emerald-400 to-emerald-600 shadow-[0_4px_10px_rgba(59,130,246,0.4),inset_0_2px_0_rgba(255,255,255,0.3)]' },
                { id: 'cover', label: 'Cover Letter', icon: FileText, color: 'text-white', bg: 'bg-gradient-to-b from-blue-400 to-blue-600 shadow-[0_4px_10px_rgba(59,130,246,0.4),inset_0_2px_0_rgba(255,255,255,0.3)]' },
                { id: 'internships', label: 'Internships', icon: Briefcase, color: 'text-white', bg: 'bg-gradient-to-b from-amber-400 to-amber-600 shadow-[0_4px_10px_rgba(251,191,36,0.4),inset_0_2px_0_rgba(255,255,255,0.3)]' }
            ]
        },
        {
            title: "Preparation",
            tabs: [
                { id: 'gap', label: 'Skill Gap', icon: Award, color: 'text-white', bg: 'bg-gradient-to-b from-rose-400 to-rose-600 shadow-[0_4px_10px_rgba(244,63,94,0.4),inset_0_2px_0_rgba(255,255,255,0.3)]' },
                { id: 'interview', label: 'Interview Prep', icon: MessageSquare, color: 'text-white', bg: 'bg-gradient-to-b from-amber-400 to-amber-600 shadow-[0_4px_10px_rgba(251,191,36,0.4),inset_0_2px_0_rgba(255,255,255,0.3)]' },
                { id: 'cheat', label: 'Cheat Sheet', icon: FileText, color: 'text-white', bg: 'bg-gradient-to-b from-emerald-500 to-emerald-700 shadow-[0_4px_10px_rgba(16,185,129,0.4),inset_0_2px_0_rgba(255,255,255,0.3)]' }
            ]
        },
        {
            title: "Insights & Strategy",
            tabs: [
                { id: 'strategy', label: 'Career Coach', icon: Compass, color: 'text-white', bg: 'bg-gradient-to-b from-purple-500 to-purple-700 shadow-[0_4px_10px_rgba(168,85,247,0.4),inset_0_2px_0_rgba(255,255,255,0.3)]' },
                { id: 'trends', label: 'Market Overview', icon: TrendingUp, color: 'text-white', bg: 'bg-gradient-to-b from-blue-400 to-blue-600 shadow-[0_4px_10px_rgba(59,130,246,0.4),inset_0_2px_0_rgba(255,255,255,0.3)]' },
                { id: 'salary', label: 'Salary Guide', icon: DollarSign, color: 'text-white', bg: 'bg-gradient-to-b from-green-400 to-green-600 shadow-[0_4px_10px_rgba(74,222,128,0.4),inset_0_2px_0_rgba(255,255,255,0.3)]' },
                { id: 'research', label: 'Company Intel', icon: Building, color: 'text-white', bg: 'bg-gradient-to-b from-sky-400 to-sky-600 shadow-[0_4px_10px_rgba(56,189,248,0.4),inset_0_2px_0_rgba(255,255,255,0.3)]' },
                { id: 'scorecard', label: 'Scorecard', icon: Award, color: 'text-white', bg: 'bg-gradient-to-b from-emerald-400 to-emerald-600 shadow-[0_4px_10px_rgba(52,211,153,0.4),inset_0_2px_0_rgba(255,255,255,0.3)]' }
            ]
        },
        {
            title: "Brand & Network",
            tabs: [
                { id: 'linkedin', label: 'LinkedIn Audit', icon: Linkedin, color: 'text-white', bg: 'bg-gradient-to-b from-blue-500 to-blue-700 shadow-[0_4px_10px_rgba(37,99,235,0.4),inset_0_2px_0_rgba(255,255,255,0.3)]' },
                { id: 'comm', label: 'Comm Hub', icon: MessageSquare, color: 'text-white', bg: 'bg-gradient-to-b from-emerald-500 to-emerald-700 shadow-[0_4px_10px_rgba(16,185,129,0.4),inset_0_2px_0_rgba(255,255,255,0.3)]' },
                { id: 'networking', label: 'Networking', icon: Users, color: 'text-white', bg: 'bg-gradient-to-b from-fuchsia-400 to-fuchsia-600 shadow-[0_4px_10px_rgba(232,121,249,0.4),inset_0_2px_0_rgba(255,255,255,0.3)]' },
                { id: 'vibe', label: 'Vibe Check', icon: ScanFace, color: 'text-white', bg: 'bg-gradient-to-b from-emerald-400 to-emerald-600 shadow-[0_4px_10px_rgba(34,211,238,0.4),inset_0_2px_0_rgba(255,255,255,0.3)]' }
            ]
        },
        {
            title: "Advanced",
            tabs: [
                { id: 'roadmap', label: 'Roadmap', icon: Target, color: 'text-white', bg: 'bg-gradient-to-b from-rose-400 to-rose-600 shadow-[0_4px_10px_rgba(244,63,94,0.4),inset_0_2px_0_rgba(255,255,255,0.3)]' },
                { id: 'pivot', label: 'Pivot Simulator', icon: ArrowRightLeft, color: 'text-white', bg: 'bg-gradient-to-b from-emerald-400 to-emerald-600 shadow-[0_4px_10px_rgba(99,102,241,0.4),inset_0_2px_0_rgba(255,255,255,0.3)]' },
                { id: 'ghost', label: 'Ghosting Risk', icon: Ghost, color: 'text-white', bg: 'bg-gradient-to-b from-slate-500 to-slate-700 shadow-[0_4px_10px_rgba(100,116,139,0.4),inset_0_2px_0_rgba(255,255,255,0.3)]' }
            ]
        }
    ];

    return (
        <div className="flex flex-col gap-6 max-w-[1400px] mx-auto w-full">
            {/* Header Section */}
            <div className="relative bg-[#0f172a] rounded-3xl p-8 sm:p-10 overflow-hidden shadow-2xl">
                {/* Visual Interest: Mesh Gradient background */}
                <div className="absolute inset-0 bg-[radial-gradient(ellipse_at_20%_0%,_rgba(16,185,129,0.15),_transparent_40%),radial-gradient(ellipse_at_80%_100%,_rgba(59,130,246,0.15),_transparent_40%)]" />
                <div className="absolute inset-0 opacity-[0.03] pointer-events-none select-none mix-blend-overlay bg-[url('https://www.transparenttextures.com/patterns/carbon-fibre.png')]" />
                
                {/* Decorative background elements with slower animations */}
                <motion.div 
                    animate={{ 
                        scale: [1, 1.1, 1],
                        rotate: [0, 5, 0],
                        opacity: [0.3, 0.4, 0.3],
                    }}
                    transition={{ duration: 15, repeat: Infinity, ease: "linear" }}
                    className="absolute top-0 right-0 w-[400px] h-[400px] bg-emerald-500/20 rounded-full blur-[100px] -translate-y-1/2 translate-x-1/3 pointer-events-none"
                />
                
                <div className="relative z-10 flex flex-col md:flex-row md:items-center justify-between gap-8 h-full">
                    <div className="flex items-center gap-6">
                        <motion.div 
                            whileHover={{ scale: 1.05, rotate: 5 }}
                            className="relative hidden sm:block"
                        >
                            <div className="w-20 h-20 rounded-[1.5rem] bg-gradient-to-br from-slate-800 to-slate-900 flex items-center justify-center shadow-xl ring-1 ring-white/10 relative overflow-hidden">
                                <div className="absolute inset-0 bg-gradient-to-tr from-emerald-500/20 to-transparent" />
                                <Zap className="w-10 h-10 text-emerald-400 fill-emerald-400 relative z-10" />
                            </div>
                        </motion.div>
                        <div>
                            <div className="flex flex-wrap items-center gap-3 mb-2">
                                <h2 className="text-3xl sm:text-4xl font-bold text-white tracking-tight">Command Center</h2>
                                <div className="flex gap-2">
                                    <span className="px-2.5 py-1 rounded-md bg-white/10 border border-white/5 text-emerald-400 text-[10px] font-bold uppercase tracking-wider backdrop-blur-md">V3.1 PRO</span>
                                </div>
                            </div>
                            <p className="text-sm sm:text-base text-slate-400 font-medium max-w-xl">Your professional growth dashboard. Real-time market signals, automated pipelines, and algorithmic career strategy.</p>
                            
                            <div className="flex flex-wrap items-center gap-6 mt-6">
                                <div className="flex flex-col">
                                    <span className="text-xl font-bold text-white leading-none">94.2%</span>
                                    <span className="text-[10px] font-semibold text-slate-500 uppercase tracking-widest mt-1">Market Match</span>
                                </div>
                                <div className="w-px h-6 bg-slate-800 hidden sm:block" />
                                <div className="flex flex-col">
                                    <span className="text-xl font-bold text-white leading-none">12</span>
                                    <span className="text-[10px] font-semibold text-slate-500 uppercase tracking-widest mt-1">Active Leads</span>
                                </div>
                                <div className="w-px h-6 bg-slate-800 hidden sm:block" />
                                <div className="flex flex-col">
                                    <span className="text-xl font-bold text-white leading-none">High</span>
                                    <span className="text-[10px] font-semibold text-slate-500 uppercase tracking-widest mt-1">Growth Vibe</span>
                                </div>
                            </div>
                        </div>
                    </div>
                </div>
            </div>

            <div className="flex flex-col lg:flex-row gap-8">
                {/* Sidebar Navigation */}
                <div className="lg:w-64 flex-shrink-0">
                    <div className="bg-white rounded-3xl p-5 border border-slate-200 shadow-sm sticky top-6 custom-scrollbar max-h-[80vh] overflow-y-auto">
                        {tabGroups.map((group, gIdx) => (
                            <div key={group.title} className={gIdx !== 0 ? 'mt-6' : ''}>
                                <h4 className="text-[10px] font-bold uppercase tracking-widest text-slate-400 mb-3 px-3">{group.title}</h4>
                                <div className="flex flex-col gap-1">
                                    {group.tabs.map((tab) => {
                                        const isActive = activeTab === tab.id;
                                        return (
                                            <button
                                                key={tab.id}
                                                onClick={() => setActiveTab(tab.id as HubTab)}
                                                className={\`flex items-center gap-3 px-3 py-2.5 rounded-xl text-left transition-all group relative \${
                                                    isActive
                                                    ? 'text-slate-900 bg-slate-50 font-semibold'
                                                    : 'text-slate-500 hover:text-slate-900 hover:bg-slate-50 font-medium'
                                                }\`}
                                            >
                                                {isActive && (
                                                    <motion.div
                                                        layoutId="sidebarActiveIndicator"
                                                        className="absolute left-0 top-2 bottom-2 w-1 bg-emerald-500 rounded-r-full"
                                                        initial={false}
                                                        transition={{ type: "spring", stiffness: 300, damping: 30 }}
                                                    />
                                                )}
                                                <div className={\`p-1.5 rounded-md transition-all \${isActive ? tab.bg + ' shadow-sm' : 'bg-slate-100 group-hover:bg-slate-200'}\`}>
                                                    <tab.icon className={\`w-3.5 h-3.5 \${isActive ? tab.color : 'text-slate-500 group-hover:text-slate-700'}\`} />
                                                </div>
                                                <span className="text-[13px]">{tab.label}</span>
                                            </button>
                                        );
                                    })}
                                </div>
                            </div>
                        ))}
                    </div>
                </div>

                {/* Main Content Area */}
                <div className="flex-1 min-w-0 bg-white/50 backdrop-blur-sm rounded-3xl">
                    <AnimatePresence mode="wait">
                        <motion.div
                            key={activeTab}
                            initial={{ opacity: 0, y: 15 }}
                            animate={{ opacity: 1, y: 0 }}
                            exit={{ opacity: 0, y: -15, transition: { duration: 0.15 } }}
                            transition={{ duration: 0.3, ease: [0.25, 0.1, 0.25, 1.0] }}
                            className="bg-white rounded-3xl border border-slate-200 shadow-sm p-6 sm:p-8 min-h-[600px] overflow-hidden"
                        >
                            {activeTab === 'dashboard' && (
                                <DashboardPanel 
                                    resumeData={resumeData} 
                                    onNavigate={(tab) => setActiveTab(tab as HubTab)} 
                                />
                            )}
                            {activeTab === 'search' && (
                                <div className="h-[800px] -m-6 sm:-m-8">
                                    <JobSearch 
                                        onMatchJob={(jd) => {
                                            if (onJobDescriptionChange) onJobDescriptionChange(jd);
                                            setActiveTab('match');
                                        }} 
                                    />
                                </div>
                            )}
                            {activeTab === 'automation' && <AutomationPanel resumeData={resumeData} />}
                            {activeTab === 'tracker' && (
                                <div className="-m-6 sm:-m-8 p-6 sm:p-8 h-[800px]">
                                    <JobTracker resumeData={resumeData} />
                                </div>
                            )}
                            {activeTab === 'match' && (
                                <div className="max-w-4xl mx-auto">
                                    <div className="mb-8">
                                        <h3 className="text-[10px] font-black uppercase tracking-[0.25em] text-emerald-600 mb-2">Match Analysis</h3>
                                        <div className="flex items-center gap-3">
                                            <p className="text-2xl font-black text-slate-900 tracking-tight">Resume vs. Job Description</p>
                                            <div className="h-px flex-1 bg-slate-100" />
                                        </div>
                                    </div>
                                    <JobMatchAnalyzer 
                                        resumeData={resumeData} 
                                        jobDescription={jobDescription || ""} 
                                        onJobDescriptionChange={onJobDescriptionChange}
                                    />
                                </div>
                            )}
`;

const startIndex = code.indexOf('const tabs = [');
const endIndex = code.indexOf('{activeTab === \'gap\' && <SkillGapPanel');

if (startIndex === -1 || endIndex === -1) {
    console.error("Could not find replacement boundaries");
    process.exit(1);
}

const newCode = code.slice(0, startIndex) + replacement + code.slice(endIndex);
fs.writeFileSync('components/builder/CareerHub.tsx', newCode);
console.log("Updated CareerHub.tsx with new layout");
