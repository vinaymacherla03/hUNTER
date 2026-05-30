
import React, { useMemo, useState } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { ResumeData, AuditResult } from '../../types';
import { runResumeAudit } from '../../services/geminiService';
import { CheckCircle2, AlertCircle, Info, Sparkles, User, Mail, Phone, Linkedin, MapPin, FileText, Briefcase, GraduationCap, Award, Search, Loader2 } from 'lucide-react';

interface ResumeHealthCheckProps {
    data: ResumeData;
}

const ResumeHealthCheck: React.FC<ResumeHealthCheckProps> = ({ data }) => {
    const [aiAudit, setAiAudit] = useState<AuditResult | null>(null);
    const [isAuditing, setIsAuditing] = useState(false);

    const handleRunAiAudit = async () => {
        setIsAuditing(true);
        try {
            const result = await runResumeAudit(data);
            setAiAudit(result);
        } catch (error) {
            console.error("AI Audit failed:", error);
        } finally {
            setIsAuditing(false);
        }
    };

    const analysis = useMemo(() => {
        const checks = [
            {
                id: 'contact-email',
                label: 'Email Address',
                status: !!data.contactInfo?.email ? 'pass' : 'fail',
                desc: 'Essential for recruiters to contact you.',
                icon: Mail
            },
            {
                id: 'contact-phone',
                label: 'Phone Number',
                status: !!data.contactInfo?.phone ? 'pass' : 'fail',
                desc: 'Important for interview scheduling.',
                icon: Phone
            },
            {
                id: 'contact-linkedin',
                label: 'LinkedIn Profile',
                status: !!data.contactInfo?.linkedin ? 'pass' : 'warning',
                desc: 'Recruiters often check your professional social presence.',
                icon: Linkedin
            },
            {
                id: 'contact-location',
                label: 'Location',
                status: !!data.contactInfo?.location ? 'pass' : 'warning',
                desc: 'Helps recruiters know if you are local or need relocation.',
                icon: MapPin
            },
            {
                id: 'summary-presence',
                label: 'Professional Summary',
                status: !!data.summary ? 'pass' : 'fail',
                desc: 'A strong summary hooks the recruiter in 6 seconds.',
                icon: FileText
            },
            {
                id: 'experience-count',
                label: 'Work Experience',
                status: (data.experience?.length || 0) > 0 ? 'pass' : 'fail',
                desc: 'The core of your resume.',
                icon: Briefcase
            },
            {
                id: 'education-presence',
                label: 'Education',
                status: (data.education?.length || 0) > 0 ? 'pass' : 'fail',
                desc: 'Showcases your academic background.',
                icon: GraduationCap
            },
            {
                id: 'skills-count',
                label: 'Skills Section',
                status: (data.skills?.length || 0) > 0 ? 'pass' : 'fail',
                desc: 'Crucial for ATS keyword matching.',
                icon: Award
            }
        ];

        // Advanced checks
        const experienceBullets = data.experience?.flatMap(e => e.description) || [];
        const hasMetrics = experienceBullets.some(b => /[\d%]+/.test(b));
        checks.push({
            id: 'experience-metrics',
            label: 'Quantifiable Results',
            status: hasMetrics ? 'pass' : 'warning',
            desc: 'Use numbers, percentages, or dollar amounts to show impact.',
            icon: Sparkles
        });

        const actionVerbs = ['managed', 'led', 'developed', 'created', 'increased', 'decreased', 'optimized', 'implemented', 'designed', 'coordinated'];
        const hasActionVerbs = experienceBullets.some(b => actionVerbs.some(v => b.toLowerCase().includes(v)));
        checks.push({
            id: 'action-verbs',
            label: 'Strong Action Verbs',
            status: hasActionVerbs ? 'pass' : 'warning',
            desc: 'Start bullet points with strong verbs like "Optimized" or "Led".',
            icon: Sparkles
        });

        const score = Math.round((checks.filter(c => c.status === 'pass').length / checks.length) * 100);

        return { checks, score };
    }, [data]);

    return (
        <div className="space-y-8">
            <div className="bg-white p-8 rounded-[2.5rem] border border-slate-200 shadow-sm overflow-hidden relative">
                <div className="absolute top-0 right-0 w-32 h-32 bg-emerald-500/5 rounded-full blur-3xl -mr-16 -mt-16" />
                
                <div className="flex flex-col sm:flex-row items-center gap-8 relative z-10">
                    <div className="relative w-32 h-32 flex items-center justify-center">
                        <svg className="w-full h-full -rotate-90" viewBox="0 0 100 100">
                            <circle className="text-slate-100" strokeWidth="8" stroke="currentColor" fill="transparent" r="45" cx="50" cy="50" />
                            <motion.circle
                                className="text-emerald-500"
                                strokeWidth="8"
                                strokeLinecap="round"
                                stroke="currentColor"
                                fill="transparent"
                                r="45"
                                cx="50"
                                cy="50"
                                strokeDasharray={2 * Math.PI * 45}
                                initial={{ strokeDashoffset: 2 * Math.PI * 45 }}
                                animate={{ strokeDashoffset: (2 * Math.PI * 45) - ((aiAudit ? aiAudit.overallScore : analysis.score) / 100) * (2 * Math.PI * 45) }}
                                transition={{ duration: 1.5, ease: 'circOut' }}
                            />
                        </svg>
                        <div className="absolute inset-0 flex flex-col items-center justify-center">
                            <span className="text-4xl font-black text-slate-900 tracking-tighter">
                                {aiAudit ? aiAudit.overallScore : analysis.score}
                            </span>
                            <span className="text-[8px] font-black uppercase tracking-widest text-slate-400">
                                {aiAudit ? 'AI Match Score' : 'Health Score'}
                            </span>
                        </div>
                    </div>

                    <div className="flex-1 text-center sm:text-left">
                        <h3 className="text-xl font-black text-slate-900 mb-2 tracking-tight">
                            {aiAudit ? 'Deep AI Analysis Complete' : 'Essential Health Check'}
                        </h3>
                        <p className="text-sm text-slate-500 font-medium leading-relaxed max-w-md mb-6">
                            {aiAudit 
                                ? "Our Gemini 3.1 Pro model has completed a deep audit of your resume's impact, quantification, and ATS compatibility."
                                : "We analyzed your resume against industry standards and basic ATS best practices. Run a deep audit for more insights."
                            }
                        </p>
                        <button 
                            onClick={handleRunAiAudit}
                            disabled={isAuditing}
                            className={`flex items-center gap-2 px-6 py-2.5 rounded-xl text-[10px] font-black uppercase tracking-widest transition-all ${
                                aiAudit 
                                ? 'bg-slate-100 text-slate-600 hover:bg-slate-200' 
                                : 'bg-slate-950 text-white hover:bg-slate-900 shadow-lg shadow-slate-950/20'
                            }`}
                        >
                            {isAuditing ? (
                                <>
                                    <Loader2 className="w-3.5 h-3.5 animate-spin" />
                                    <span>Auditing...</span>
                                </>
                            ) : (
                                <>
                                    <Sparkles className="w-3.5 h-3.5" />
                                    <span>{aiAudit ? 'Re-run Deep Audit' : 'Run Deep AI Audit'}</span>
                                </>
                            )}
                        </button>
                    </div>
                </div>
            </div>

            <AnimatePresence>
                {aiAudit && (
                    <motion.div 
                        initial={{ opacity: 0, height: 0 }}
                        animate={{ opacity: 1, height: 'auto' }}
                        className="space-y-4 mb-8"
                    >
                        <div className="flex items-center gap-3 mb-4">
                            <div className="h-px flex-1 bg-slate-200" />
                            <span className="text-[10px] font-black text-slate-400 uppercase tracking-widest">AI Audit Insights</span>
                            <div className="h-px flex-1 bg-slate-200" />
                        </div>
                        <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                            {aiAudit.feedback.map((f, idx) => (
                                <motion.div 
                                    key={idx}
                                    initial={{ opacity: 0, x: -10 }}
                                    animate={{ opacity: 1, x: 0 }}
                                    transition={{ delay: idx * 0.1 }}
                                    className="p-5 bg-white border border-slate-200 rounded-2xl shadow-sm hover:border-emerald-200 transition-all group"
                                >
                                    <div className="flex items-center gap-2 mb-2">
                                        <div className="w-1.5 h-1.5 rounded-full bg-emerald-500" />
                                        <span className="text-[10px] font-black text-emerald-600 uppercase tracking-widest">{f.category}</span>
                                    </div>
                                    <p className="text-sm font-bold text-slate-900 mb-1 leading-tight">{f.message}</p>
                                    <p className="text-xs text-slate-500 font-medium leading-relaxed">{f.suggestion}</p>
                                </motion.div>
                            ))}
                        </div>
                    </motion.div>
                )}
            </AnimatePresence>

            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                {analysis.checks.map((check, idx) => {
                    const Icon = check.icon;
                    return (
                        <motion.div 
                            key={check.id}
                            initial={{ opacity: 0, y: 10 }}
                            animate={{ opacity: 1, y: 0 }}
                            transition={{ delay: idx * 0.05 }}
                            className="p-5 bg-white rounded-2xl border border-slate-200 shadow-sm hover:shadow-md transition-all group"
                        >
                            <div className="flex items-start gap-4">
                                <div className={`p-2.5 rounded-xl shrink-0 ${
                                    check.status === 'pass' ? 'bg-emerald-50 text-emerald-600' : 
                                    check.status === 'warning' ? 'bg-amber-50 text-amber-600' : 
                                    'bg-rose-50 text-rose-600'
                                }`}>
                                    <Icon className="w-5 h-5" />
                                </div>
                                <div className="flex-1 min-w-0">
                                    <div className="flex items-center justify-between mb-1">
                                        <h4 className="text-sm font-black text-slate-900 tracking-tight">{check.label}</h4>
                                        {check.status === 'pass' ? (
                                            <CheckCircle2 className="w-4 h-4 text-emerald-500" />
                                        ) : check.status === 'warning' ? (
                                            <AlertCircle className="w-4 h-4 text-amber-500" />
                                        ) : (
                                            <AlertCircle className="w-4 h-4 text-rose-500" />
                                        )}
                                    </div>
                                    <p className="text-xs text-slate-500 font-medium leading-relaxed">{check.desc}</p>
                                </div>
                            </div>
                        </motion.div>
                    );
                })}
            </div>

            <div className="p-6 bg-slate-900 rounded-[2rem] text-white overflow-hidden relative">
                <div className="absolute top-0 right-0 w-32 h-32 bg-emerald-500/20 rounded-full blur-3xl -mr-16 -mt-16" />
                <div className="relative z-10">
                    <div className="flex items-center gap-3 mb-4">
                        <Sparkles className="w-5 h-5 text-emerald-400" />
                        <h4 className="text-sm font-black uppercase tracking-widest">Pro Tip: STAR Method</h4>
                    </div>
                    <p className="text-sm text-slate-300 font-medium leading-relaxed mb-4">
                        Recruiters love the STAR method (Situation, Task, Action, Result). 
                        Instead of "Managed a team," try "Led a team of 5 to increase sales by 20% over 6 months."
                    </p>
                    <div className="flex gap-2">
                        <div className="px-3 py-1 bg-white/10 rounded-full text-[10px] font-bold uppercase tracking-wider">Situation</div>
                        <div className="px-3 py-1 bg-white/10 rounded-full text-[10px] font-bold uppercase tracking-wider">Task</div>
                        <div className="px-3 py-1 bg-white/10 rounded-full text-[10px] font-bold uppercase tracking-wider">Action</div>
                        <div className="px-3 py-1 bg-white/10 rounded-full text-[10px] font-bold uppercase tracking-wider">Result</div>
                    </div>
                </div>
            </div>
        </div>
    );
};

export default ResumeHealthCheck;
