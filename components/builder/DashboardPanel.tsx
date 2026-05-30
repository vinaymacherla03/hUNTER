
import React from 'react';
import { motion } from 'framer-motion';
import { 
    Trophy, 
    Target, 
    Zap, 
    TrendingUp, 
    Users, 
    Briefcase, 
    ArrowRight,
    CheckCircle2,
    AlertCircle,
    Sparkles
} from 'lucide-react';
import { ResumeData } from '../../types';

interface DashboardPanelProps {
    resumeData: ResumeData;
    onNavigate: (tab: string) => void;
}

const DashboardPanel: React.FC<DashboardPanelProps> = ({ resumeData, onNavigate }) => {
    // Calculate a basic "Resume Strength" score
    const calculateStrength = () => {
        let score = 0;
        if (resumeData.fullName) score += 10;
        if (resumeData.contactInfo?.email) score += 5;
        if (resumeData.summary && resumeData.summary.length > 50) score += 15;
        if (resumeData.experience && resumeData.experience.length > 0) score += 20;
        if (resumeData.education && resumeData.education.length > 0) score += 15;
        if (resumeData.skills && resumeData.skills.length > 3) score += 15;
        if (resumeData.projects && resumeData.projects.length > 0) score += 10;
        if (resumeData.certifications && resumeData.certifications.length > 0) score += 10;
        return Math.min(score, 100);
    };

    const strength = calculateStrength();

    const stats = [
        { label: 'Jobs Tracked', value: '12', icon: Briefcase, color: 'text-blue-600', bg: 'bg-blue-50' },
        { label: 'Profile Views', value: '48', icon: Users, color: 'text-emerald-600', bg: 'bg-emerald-50' },
        { label: 'Match Rate', value: '82%', icon: Target, color: 'text-emerald-600', bg: 'bg-emerald-50' },
        { label: 'AI Audits', value: '5', icon: Zap, color: 'text-purple-600', bg: 'bg-purple-50' },
    ];

    const recommendations = [
        { 
            title: 'Optimize for ATS', 
            desc: 'Your resume is missing 4 key industry keywords.', 
            action: 'Run Match Analysis',
            tab: 'match',
            icon: Target,
            urgent: true
        },
        { 
            title: 'LinkedIn Refresh', 
            desc: 'Your headline could be 25% more impactful.', 
            action: 'Optimize Profile',
            tab: 'linkedin',
            icon: Sparkles,
            urgent: false
        },
        { 
            title: 'Skill Gap Found', 
            desc: 'Learn "System Design" to unlock 15% more jobs.', 
            action: 'View Skill Gap',
            tab: 'gap',
            icon: Trophy,
            urgent: false
        }
    ];

    return (
        <div className="space-y-8">
            <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
                {/* Resume Strength Card */}
                <motion.div 
                    initial={{ opacity: 0, y: 20 }}
                    animate={{ opacity: 1, y: 0 }}
                    className="lg:col-span-1 bg-white rounded-[2.5rem] p-8 border border-slate-100 shadow-xl shadow-slate-200/50 flex flex-col items-center justify-center text-center"
                >
                    <div className="relative w-48 h-48 mb-6">
                        <svg className="w-full h-full transform -rotate-90">
                            <circle
                                cx="96"
                                cy="96"
                                r="88"
                                stroke="currentColor"
                                strokeWidth="12"
                                fill="transparent"
                                className="text-slate-100"
                            />
                            <motion.circle
                                cx="96"
                                cy="96"
                                r="88"
                                stroke="currentColor"
                                strokeWidth="12"
                                fill="transparent"
                                strokeDasharray="553"
                                initial={{ strokeDashoffset: 553 }}
                                animate={{ strokeDashoffset: 553 - (553 * strength) / 100 }}
                                transition={{ duration: 1.5, ease: "easeOut" }}
                                className="text-emerald-500"
                                strokeLinecap="round"
                            />
                        </svg>
                        <div className="absolute inset-0 flex flex-col items-center justify-center">
                            <span className="text-5xl font-black text-slate-900 tracking-tighter">{strength}%</span>
                            <span className="text-[10px] font-black text-slate-400 uppercase tracking-widest">Strength</span>
                        </div>
                    </div>
                    <h3 className="text-xl font-black text-slate-900 mb-2">Resume Completeness</h3>
                    <p className="text-sm text-slate-500 font-medium mb-6">
                        {strength < 70 ? "Your profile needs more detail to attract top recruiters." : "Great job! Your profile is highly competitive."}
                    </p>
                    <button 
                        onClick={() => onNavigate('scorecard')}
                        className="w-full py-3 bg-slate-900 text-white rounded-2xl text-xs font-black uppercase tracking-widest hover:bg-slate-800 transition-all"
                    >
                        Improve Score
                    </button>
                </motion.div>

                {/* Stats & Recommendations */}
                <div className="lg:col-span-2 space-y-8">
                    {/* Stats Grid */}
                    <div className="grid grid-cols-2 sm:grid-cols-4 gap-4">
                        {stats.map((stat, i) => (
                            <motion.div 
                                key={stat.label}
                                initial={{ opacity: 0, scale: 0.9 }}
                                animate={{ opacity: 1, scale: 1 }}
                                transition={{ delay: i * 0.1 }}
                                className="bg-white p-6 rounded-3xl border border-slate-100 shadow-sm flex flex-col items-center text-center"
                            >
                                <div className={`w-10 h-10 ${stat.bg} ${stat.color} rounded-xl flex items-center justify-center mb-3`}>
                                    <stat.icon className="w-5 h-5" />
                                </div>
                                <span className="text-2xl font-black text-slate-900 tracking-tight">{stat.value}</span>
                                <span className="text-[10px] font-black text-slate-400 uppercase tracking-widest">{stat.label}</span>
                            </motion.div>
                        ))}
                    </div>

                    {/* Recommendations List */}
                    <div className="bg-white rounded-[2.5rem] p-8 border border-slate-100 shadow-sm">
                        <div className="flex items-center justify-between mb-6">
                            <h3 className="text-lg font-black text-slate-900 tracking-tight">Recommended Actions</h3>
                            <div className="flex items-center gap-2 text-[10px] font-black text-emerald-600 uppercase tracking-widest">
                                <TrendingUp className="w-3 h-3" />
                                Boost Your Visibility
                            </div>
                        </div>
                        <div className="space-y-4">
                            {recommendations.map((rec, i) => (
                                <motion.div 
                                    key={rec.title}
                                    initial={{ opacity: 0, x: 20 }}
                                    animate={{ opacity: 1, x: 0 }}
                                    transition={{ delay: 0.3 + (i * 0.1) }}
                                    className="flex items-center justify-between p-4 rounded-2xl border border-slate-50 hover:border-emerald-100 hover:bg-emerald-50/30 transition-all group"
                                >
                                    <div className="flex items-center gap-4">
                                        <div className={`w-12 h-12 rounded-xl flex items-center justify-center shrink-0 ${rec.urgent ? 'bg-rose-50 text-rose-500' : 'bg-slate-50 text-slate-500'}`}>
                                            <rec.icon className="w-6 h-6" />
                                        </div>
                                        <div>
                                            <div className="flex items-center gap-2">
                                                <h4 className="font-bold text-slate-900">{rec.title}</h4>
                                                {rec.urgent && <span className="px-2 py-0.5 rounded-full bg-rose-100 text-rose-600 text-[8px] font-black uppercase tracking-widest">Urgent</span>}
                                            </div>
                                            <p className="text-xs text-slate-500 font-medium">{rec.desc}</p>
                                        </div>
                                    </div>
                                    <button 
                                        onClick={() => onNavigate(rec.tab)}
                                        className="flex items-center gap-2 px-4 py-2 text-[10px] font-black uppercase tracking-widest text-slate-400 group-hover:text-emerald-600 transition-all"
                                    >
                                        {rec.action} <ArrowRight className="w-3 h-3" />
                                    </button>
                                </motion.div>
                            ))}
                        </div>
                    </div>
                </div>
            </div>

            {/* Market Insights Preview */}
            <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
                <div className="bg-gradient-to-br from-slate-900 to-slate-800 rounded-[2.5rem] p-8 text-white relative overflow-hidden">
                    <div className="absolute top-0 right-0 w-32 h-32 bg-emerald-500/10 rounded-full blur-2xl" />
                    <h3 className="text-xl font-black mb-4">Market Demand for {resumeData.title || 'Your Role'}</h3>
                    <div className="flex items-end gap-2 mb-6">
                        <span className="text-4xl font-black text-emerald-400">High</span>
                        <span className="text-xs text-slate-400 font-medium pb-1.5">+12% growth this month</span>
                    </div>
                    <div className="space-y-3">
                        <div className="flex items-center justify-between text-[10px] font-black uppercase tracking-widest text-slate-400">
                            <span>Top Hiring Locations</span>
                            <span>Open Roles</span>
                        </div>
                        {[
                            { loc: 'Bangalore, KA', count: '1,240' },
                            { loc: 'Mumbai, MH', count: '890' },
                            { loc: 'Remote', count: '2,100' }
                        ].map(item => (
                            <div key={item.loc} className="flex items-center justify-between py-2 border-b border-white/5">
                                <span className="text-sm font-bold">{item.loc}</span>
                                <span className="text-sm font-mono text-emerald-400">{item.count}</span>
                            </div>
                        ))}
                    </div>
                </div>

                <div className="bg-white rounded-[2.5rem] p-8 border border-slate-100 shadow-sm">
                    <h3 className="text-xl font-black text-slate-900 mb-4">Recent Recruiter Activity</h3>
                    <div className="space-y-6">
                        {[
                            { company: 'Google', time: '2h ago', action: 'Viewed your resume', logo: 'https://www.google.com/favicon.ico' },
                            { company: 'Meta', time: '5h ago', action: 'Saved to shortlist', logo: 'https://www.facebook.com/favicon.ico' },
                            { company: 'Amazon', time: '1d ago', action: 'Appeared in search', logo: 'https://www.amazon.com/favicon.ico' }
                        ].map((activity, i) => (
                            <div key={i} className="flex items-center gap-4">
                                <div className="w-10 h-10 rounded-full bg-slate-50 flex items-center justify-center border border-slate-100 overflow-hidden">
                                    <img src={activity.logo} alt={activity.company} className="w-5 h-5" referrerPolicy="no-referrer" />
                                </div>
                                <div className="flex-1">
                                    <div className="flex items-center justify-between">
                                        <h4 className="font-bold text-slate-900 text-sm">{activity.company}</h4>
                                        <span className="text-[10px] text-slate-400 font-medium">{activity.time}</span>
                                    </div>
                                    <p className="text-xs text-slate-500 font-medium">{activity.action}</p>
                                </div>
                            </div>
                        ))}
                    </div>
                    <button 
                        onClick={() => onNavigate('search')}
                        className="w-full mt-8 py-3 border border-slate-200 rounded-2xl text-[10px] font-black uppercase tracking-widest text-slate-600 hover:bg-slate-50 transition-all"
                    >
                        View All Activity
                    </button>
                </div>
            </div>
        </div>
    );
};

export default DashboardPanel;
