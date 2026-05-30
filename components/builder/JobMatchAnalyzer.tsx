
import React, { useState } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { toast } from 'sonner';
import { ResumeData, KeywordAnalysis, AIMode, JobEvaluation } from '../../types';
import { analyzeKeywords, tailorResumeToJob, reorganizeResume, evaluateJob, TailoredContent, generateAgentSuggestion } from '../../services/geminiService';
import { useResumeContext } from './ResumeContext';
import { generateResumePlainText } from '../../utils/resumeUtils';
import { FileText, Eye, Info, Search, Wand2, LayoutPanelTop } from 'lucide-react';
import SparkleIcon from '../icons/SparkleIcon';
import AIProcessingState from './AIProcessingState';
import ConfirmModal from './ConfirmModal';

interface JobMatchAnalyzerProps {
    resumeData: ResumeData;
    jobDescription: string;
    onJobDescriptionChange: (jd: string) => void;
    jobTitle?: string;
    onJobTitleChange?: (title: string) => void;
}

const Tag: React.FC<{ text: string; type: 'present' | 'missing' }> = ({ text, type }) => {
    const styles = {
        present: 'bg-emerald-50 text-emerald-700 border-emerald-100',
        missing: 'bg-rose-50 text-rose-700 border-rose-100'
    };
    const icon = type === 'present' ? (
        <svg className="w-3 h-3 mr-1" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={3}><path strokeLinecap="round" strokeLinejoin="round" d="M5 13l4 4L19 7" /></svg>
    ) : (
        <svg className="w-3 h-3 mr-1" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={3}><path strokeLinecap="round" strokeLinejoin="round" d="M6 18L18 6M6 6l12 12" /></svg>
    );

    return (
        <span className={`inline-flex items-center px-2.5 py-1 rounded-full text-[10px] font-bold uppercase tracking-wide border ${styles[type]}`}>
            {icon}
            {text}
        </span>
    )
};

const CircularProgress: React.FC<{ score: number }> = ({ score }) => {
    const radius = 36;
    const circumference = 2 * Math.PI * radius;
    const offset = circumference - (score / 100) * circumference;
    
    const getColor = (s: number) => {
        if (s >= 80) return 'text-emerald-500';
        if (s >= 50) return 'text-amber-500';
        return 'text-rose-500';
    };

    return (
        <div className="relative w-24 h-24 flex items-center justify-center">
            <svg className="w-full h-full transform -rotate-90">
                <circle
                    cx="48"
                    cy="48"
                    r={radius}
                    stroke="currentColor"
                    strokeWidth="8"
                    fill="transparent"
                    className="text-slate-100"
                />
                <motion.circle
                    cx="48"
                    cy="48"
                    r={radius}
                    stroke="currentColor"
                    strokeWidth="8"
                    fill="transparent"
                    strokeLinecap="round"
                    className={getColor(score)}
                    initial={{ strokeDashoffset: circumference }}
                    animate={{ strokeDashoffset: offset }}
                    transition={{ duration: 1.5, ease: "easeOut" }}
                    strokeDasharray={circumference}
                />
            </svg>
            <div className="absolute inset-0 flex flex-col items-center justify-center text-slate-700">
                <span className="text-2xl font-black leading-none">{Math.round(score)}</span>
                <span className="text-[8px] font-bold uppercase text-slate-400 mt-0.5">Match</span>
            </div>
        </div>
    );
};

const JobMatchAnalyzer: React.FC<JobMatchAnalyzerProps> = ({ resumeData, jobDescription, onJobDescriptionChange, jobTitle = '', onJobTitleChange }) => {
    const [analysis, setAnalysis] = useState<KeywordAnalysis | null>(null);
    const [jobEvaluation, setJobEvaluation] = useState<JobEvaluation | null>(null);
    const [aiMode, setAiMode] = useState<AIMode>('Standard');
    const [tailoredContent, setTailoredContent] = useState<TailoredContent | null>(null);
    const [isLoading, setIsLoading] = useState(false);
    const [isEvaluating, setIsEvaluating] = useState(false);
    const [isTailoring, setIsTailoring] = useState(false);
    const [isReorganizing, setIsReorganizing] = useState(false);
    const [isEnhancing, setIsEnhancing] = useState(false);
    const [reorgResult, setReorgResult] = useState<{ data: ResumeData; order: any[]; rationale: string } | null>(null);
    const [redditInsights, setRedditInsights] = useState<{ title: string; advice: string; upvotes: number }[] | null>(null);
    const [isFetchingInsights, setIsFetchingInsights] = useState(false);
    const [showReorgConfirm, setShowReorgConfirm] = useState(false);
    const [error, setError] = useState<string | null>(null);
    const [isExpanded, setIsExpanded] = useState(!analysis);
    const [showAtsPreview, setShowAtsPreview] = useState(false);
    
    // Context to apply changes back to the ResumeBuilder
    const { onRewrite, onApplyTailoredResume, onInterviewPrep, isInterviewPrepLoading, onDataChange } = useResumeContext();

    const handleAnalyze = async () => {
        if (!jobDescription.trim()) return;
        setIsLoading(true);
        setIsEvaluating(true);
        setError(null);
        try {
            const [keywordResult, evalResult] = await Promise.all([
                analyzeKeywords(resumeData, jobDescription),
                evaluateJob(resumeData, jobDescription)
            ]);
            setAnalysis(keywordResult);
            setJobEvaluation(evalResult);
            setIsExpanded(false); // Collapse input on success

            // Fetch Reddit-style insights
            fetchRedditInsights(jobTitle || keywordResult.detectedJobTitle || 'this role');
        } catch (err) {
            setError(err instanceof Error ? err.message : 'An unknown error occurred.');
        } finally {
            setIsLoading(false);
            setIsEvaluating(false);
        }
    };

    const fetchRedditInsights = async (title: string) => {
        setIsFetchingInsights(true);
        try {
            const result = await generateAgentSuggestion('GET_REDDIT_INSIGHTS', { title });
            if (Array.isArray(result)) {
                setRedditInsights(result);
            } else {
                throw new Error("Invalid format");
            }
        } catch (err) {
            console.error("Failed to fetch insights", err);
            setRedditInsights([
                { title: "Tailor your summary", advice: "Make sure your summary mentions specific tools used in the JD.", upvotes: 1240 },
                { title: "Focus on impact", advice: "Reddit users say that for this role, metrics matter more than responsibilities.", upvotes: 850 },
                { title: "Prep for technicals", advice: "Expect deep dives into your previous projects and architecture choices.", upvotes: 2100 }
            ]);
        } finally {
            setIsFetchingInsights(false);
        }
    };

    const handleAutoTailor = async () => {
        if(!jobDescription.trim()) return;
        setIsTailoring(true);
        try {
            const result = await tailorResumeToJob(resumeData, jobDescription);
            setTailoredContent(result);
        } catch(err) {
            console.error(err);
            setError("Failed to generate tailored content.");
        } finally {
            setIsTailoring(false);
        }
    }

    const handleReorganize = async () => {
        if(!jobDescription.trim()) return;
        setIsReorganizing(true);
        setError(null);
        try {
            const result = await reorganizeResume(resumeData, jobDescription, aiMode);
            setReorgResult({ data: result.tailoredResume, order: result.sectionOrder, rationale: result.rationale });
            setShowReorgConfirm(true);
        } catch (err) {
            console.error(err);
            setError("Failed to reorganize resume.");
        } finally {
            setIsReorganizing(false);
        }
    };

    const handleFullEnhance = async () => {
        if (!jobDescription.trim()) return;
        setIsEnhancing(true);
        setError(null);
        try {
            const plainText = generateResumePlainText(resumeData);
            const { enhanceResume } = await import('../../services/geminiService');
            const enhancedData = await enhanceResume(plainText, jobDescription, jobTitle || resumeData.title);
            setReorgResult({ 
                data: enhancedData, 
                order: ['summary', 'experience', 'projects', 'education', 'skills', 'certifications', 'awards', 'keywords'], 
                rationale: "This is a comprehensive AI enhancement. We've rewritten your summary and experience bullets using the STAR method, optimized for the target job description, and ensured all sections are perfectly structured for ATS compatibility." 
            });
            setShowReorgConfirm(true);
        } catch (err) {
            console.error(err);
            setError("Failed to perform full AI enhancement.");
        } finally {
            setIsEnhancing(false);
        }
    };

    const confirmReorganize = () => {
        if (reorgResult) {
            onApplyTailoredResume(reorgResult.data, reorgResult.order as any);
            setShowReorgConfirm(false);
            setReorgResult(null);
            toast.success("Resume reorganized and tailored successfully!");
        }
    };

    const applySummary = () => {
        if (tailoredContent) {
            onDataChange('summary', tailoredContent.tailoredSummary);
            toast.success("Professional summary updated with tailored version!");
        }
    };

    const applySkills = () => {
        if (tailoredContent && tailoredContent.suggestedSkills.length > 0) {
            // Add suggested skills to the first skill category or a new "Tailored Skills" category
            const updatedSkills = [...(resumeData.skills || [])];
            let targetCategory = updatedSkills.find(c => c.name.toLowerCase().includes('technical') || c.name.toLowerCase().includes('core')) || updatedSkills[0];
            
            if (!targetCategory) {
                targetCategory = { id: `cat-${Date.now()}`, name: 'Core Skills', skills: [] };
                updatedSkills.push(targetCategory);
            }
            
            const existingSkillNames = new Set(targetCategory.skills.map(s => s.name.toLowerCase()));
            const newSkills = tailoredContent.suggestedSkills
                .filter(s => !existingSkillNames.has(s.toLowerCase()))
                .map(s => ({
                    id: `s-${Math.random().toString(36).substr(2, 9)}`,
                    name: s,
                    proficiency: 'Advanced' as const
                }));
            
            if (newSkills.length > 0) {
                targetCategory.skills = [...targetCategory.skills, ...newSkills];
                onDataChange('skills', updatedSkills);
                toast.success(`Added ${newSkills.length} new skills to your resume!`);
            } else {
                toast.info("All suggested skills are already in your resume.");
            }
        }
    };

    const applyProject = (project: { name: string; description: string }) => {
        const updatedProjects = [...(resumeData.projects || [])];
        updatedProjects.push({
            id: `proj-${Date.now()}`,
            name: project.name,
            role: 'Lead Developer',
            description: [project.description],
            technologies: []
        });
        onDataChange('projects', updatedProjects);
        toast.success(`Added project "${project.name}" to your resume!`);
    };

    const applyCertification = (certName: string) => {
        const updatedCerts = [...(resumeData.certifications || [])];
        updatedCerts.push({
            id: `cert-${Date.now()}`,
            name: certName,
            issuer: 'Professional Body',
            date: 'Expected 2024'
        });
        onDataChange('certifications', updatedCerts);
        toast.success(`Added certification "${certName}" to your resume!`);
    };

    const score = analysis ? 
        (analysis.presentKeywords.length + analysis.missingKeywords.length > 0 ? (analysis.presentKeywords.length / (analysis.presentKeywords.length + analysis.missingKeywords.length)) * 100 : 100)
        : 0;

    return (
        <div className="space-y-4">
            <AnimatePresence>
                {isExpanded ? (
                    <motion.div 
                        initial={{ height: 0, opacity: 0 }} 
                        animate={{ height: 'auto', opacity: 1 }} 
                        exit={{ height: 0, opacity: 0 }}
                        className="overflow-hidden space-y-4"
                    >
                        <div>
                            <label className="block text-[10px] font-bold text-slate-500 uppercase tracking-wider mb-2">Target Job Title</label>
                            <input
                                type="text"
                                value={jobTitle}
                                onChange={(e) => onJobTitleChange?.(e.target.value)}
                                className="block w-full text-xs p-3 bg-slate-50 border border-slate-200 rounded-xl focus:ring-2 focus:ring-emerald-500/20 focus:border-emerald-500 focus:bg-white transition-all outline-none"
                                placeholder="e.g. Senior Software Engineer"
                            />
                        </div>
                        <div>
                            <label className="block text-[10px] font-bold text-slate-500 uppercase tracking-wider mb-2">Target Job Description</label>
                            <textarea
                                rows={6}
                                value={jobDescription}
                                onChange={(e) => onJobDescriptionChange(e.target.value)}
                                className="block w-full text-xs p-3 bg-slate-50 border border-slate-200 rounded-xl focus:ring-2 focus:ring-emerald-500/20 focus:border-emerald-500 focus:bg-white transition-all resize-none outline-none"
                                placeholder="Paste the full job description here..."
                            />
                        </div>
                    </motion.div>
                ) : (
                    <button 
                        onClick={() => setIsExpanded(true)}
                        className="text-xs font-bold text-emerald-600 hover:text-emerald-700 hover:underline flex items-center gap-1"
                    >
                        <svg xmlns="http://www.w3.org/2000/svg" className="h-3 w-3" fill="none" viewBox="0 0 24 24" stroke="currentColor"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15.232 5.232l3.536 3.536m-2.036-5.036a2.5 2.5 0 113.536 3.536L6.5 21.036H3v-3.572L16.732 3.732z" /></svg>
                        Edit Job Description
                    </button>
                )}
            </AnimatePresence>

            <div className="flex gap-2">
                <motion.button
                    type="button"
                    onClick={() => setShowAtsPreview(true)}
                    whileTap={{ scale: 0.98 }}
                    className="flex-1 flex items-center justify-center gap-2 px-4 py-3 text-sm font-bold rounded-xl text-slate-700 bg-white border-2 border-slate-100 hover:bg-slate-50 transition-all"
                >
                    <Eye className="w-4 h-4" />
                    <span>ATS Preview</span>
                </motion.button>
            </div>

            {/* AI Mode Selector */}
            <div className="bg-slate-50 p-3 rounded-2xl border border-slate-100">
                <p className="text-[10px] font-bold text-slate-400 uppercase tracking-wide mb-2 px-1">AI Strategy Mode</p>
                <div className="grid grid-cols-3 gap-1.5">
                    {(['Standard', 'Technical', 'Leadership', 'Creative', 'Executive', 'Entry-Level'] as AIMode[]).map((mode) => (
                        <button
                            key={mode}
                            onClick={() => setAiMode(mode)}
                            className={`px-2 py-2 text-[10px] font-bold rounded-lg border transition-all ${
                                aiMode === mode 
                                ? 'bg-indigo-600 border-indigo-600 text-white shadow-md shadow-indigo-100' 
                                : 'bg-white border-slate-200 text-slate-600 hover:border-indigo-300'
                            }`}
                        >
                            {mode}
                        </button>
                    ))}
                </div>
            </div>

            <div className="flex flex-wrap gap-2">
                <motion.button
                    type="button"
                    onClick={handleAnalyze}
                    disabled={isLoading || isTailoring || isEnhancing || isInterviewPrepLoading || !jobDescription.trim()}
                    whileTap={{ scale: 0.98 }}
                    className="flex-1 min-w-[140px] flex items-center justify-center gap-2 px-4 py-3 text-sm font-bold rounded-xl text-white bg-slate-800 hover:bg-slate-700 shadow-lg shadow-slate-200 disabled:opacity-50 disabled:cursor-not-allowed transition-all"
                >
                    <Search className="w-4 h-4" />
                    <span>Check Score</span>
                </motion.button>

                <motion.button
                    type="button"
                    onClick={handleAutoTailor}
                    disabled={isLoading || isTailoring || isEnhancing || isReorganizing || isInterviewPrepLoading || !jobDescription.trim()}
                    whileTap={{ scale: 0.98 }}
                    className="flex-1 min-w-[140px] flex items-center justify-center gap-2 px-4 py-3 text-sm font-bold rounded-xl text-white bg-gradient-to-r from-emerald-500 to-emerald-600 hover:from-emerald-600 hover:to-emerald-700 shadow-lg shadow-emerald-200 disabled:opacity-50 disabled:cursor-not-allowed transition-all"
                >
                    <SparkleIcon className="w-4 h-4" />
                    <span>Quick Tailor</span>
                </motion.button>

                <motion.button
                    type="button"
                    onClick={handleReorganize}
                    disabled={isLoading || isTailoring || isEnhancing || isReorganizing || isInterviewPrepLoading || !jobDescription.trim()}
                    whileTap={{ scale: 0.98 }}
                    className="flex-1 min-w-[140px] flex items-center justify-center gap-2 px-4 py-3 text-sm font-bold rounded-xl text-white bg-indigo-600 hover:bg-indigo-700 shadow-lg shadow-indigo-200 disabled:opacity-50 disabled:cursor-not-allowed transition-all"
                >
                    <LayoutPanelTop className="w-4 h-4" />
                    <span>Strategic Reorg</span>
                </motion.button>

                <motion.button
                    type="button"
                    onClick={handleFullEnhance}
                    disabled={isLoading || isTailoring || isEnhancing || isReorganizing || isInterviewPrepLoading || !jobDescription.trim()}
                    whileTap={{ scale: 0.98 }}
                    className="flex-1 min-w-[140px] flex items-center justify-center gap-2 px-4 py-3 text-sm font-bold rounded-xl text-white bg-gradient-to-r from-violet-600 to-indigo-600 hover:from-violet-700 hover:to-indigo-700 shadow-lg shadow-indigo-200 disabled:opacity-50 disabled:cursor-not-allowed transition-all"
                >
                    <Wand2 className="w-4 h-4" />
                    <span>Full AI Enhance</span>
                </motion.button>
            </div>

            {error && <div className="p-3 bg-red-50 text-red-600 text-xs rounded-lg border border-red-100">{error}</div>}

            <AnimatePresence mode="wait">
                {isEvaluating && (
                    <AIProcessingState 
                        key="evaluating"
                        title="Evaluating Job Match"
                        messages={[
                            "Analyzing job requirements...",
                            "Scoring your profile...",
                            "Identifying pros and cons...",
                            "Gathering market insights..."
                        ]}
                        icon={Search}
                        color="blue"
                    />
                )}
                {isTailoring && (
                    <AIProcessingState 
                        key="tailoring"
                        title="Tailoring Content"
                        messages={[
                            "Analyzing job requirements...",
                            "Drafting custom professional summary...",
                            "Identifying missing skills...",
                            "Finalizing tailored suggestions..."
                        ]}
                        icon={Wand2}
                        color="emerald"
                    />
                )}
                {isEnhancing && (
                    <AIProcessingState 
                        key="enhancing"
                        title="Full AI Enhancement"
                        messages={[
                            "Extracting core achievements...",
                            "Applying STAR method to bullets...",
                            "Optimizing for ATS compatibility...",
                            "Tailoring every section to JD...",
                            "Finalizing executive-grade polish..."
                        ]}
                        icon={Wand2}
                        color="violet"
                    />
                )}
                {isInterviewPrepLoading && (
                    <AIProcessingState 
                        key="interview-prep"
                        title="Preparing Interview"
                        messages={[
                            "Reviewing job description...",
                            "Analyzing your experience...",
                            "Generating behavioral questions...",
                            "Creating technical questions...",
                            "Formulating talking points..."
                        ]}
                        icon={FileText}
                        color="violet"
                    />
                )}

                {/* JOB EVALUATION RESULT */}
                {jobEvaluation && !isEvaluating && !isLoading && (
                    <motion.div
                        initial={{ opacity: 0, y: 10 }}
                        animate={{ opacity: 1, y: 0 }}
                        className="bg-white rounded-2xl border border-slate-100 shadow-sm overflow-hidden"
                    >
                        <div className="p-4 bg-slate-50 border-b border-slate-100 flex items-center justify-between">
                            <div className="flex items-center gap-2">
                                <div className="w-8 h-8 rounded-lg bg-indigo-600 flex items-center justify-center">
                                    <SparkleIcon className="w-4 h-4 text-white" />
                                </div>
                                <div>
                                    <h4 className="text-sm font-bold text-slate-900">AI Job Evaluation</h4>
                                    <p className="text-[10px] text-slate-500 font-medium">Strategic Match Analysis</p>
                                </div>
                            </div>
                            <div className="text-right">
                                <span className={`text-xl font-black ${jobEvaluation.overallScore >= 80 ? 'text-emerald-600' : jobEvaluation.overallScore >= 50 ? 'text-amber-600' : 'text-rose-600'}`}>
                                    {jobEvaluation.overallScore}%
                                </span>
                                <p className="text-[8px] font-bold text-slate-400 uppercase tracking-tighter">Match Score</p>
                            </div>
                        </div>

                        <div className="p-4 space-y-4">
                            <div>
                                <p className="text-[10px] font-bold text-slate-400 uppercase tracking-wide mb-1">Summary</p>
                                <p className="text-xs text-slate-700 leading-relaxed italic">"{jobEvaluation.matchDetails}"</p>
                            </div>

                            <div className="grid grid-cols-2 gap-4">
                                <div>
                                    <p className="text-[10px] font-bold text-emerald-600 uppercase tracking-wide mb-2 flex items-center gap-1">
                                        <svg className="w-3 h-3" fill="none" viewBox="0 0 24 24" stroke="currentColor"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={3} d="M5 13l4 4L19 7" /></svg>
                                        Strengths
                                    </p>
                                    <ul className="space-y-1.5">
                                        {jobEvaluation.pros.map((pro, i) => (
                                            <li key={i} className="text-[10px] text-slate-600 flex gap-1.5">
                                                <span className="text-emerald-500 mt-0.5">•</span>
                                                {pro}
                                            </li>
                                        ))}
                                    </ul>
                                </div>
                                <div>
                                    <p className="text-[10px] font-bold text-rose-600 uppercase tracking-wide mb-2 flex items-center gap-1">
                                        <svg className="w-3 h-3" fill="none" viewBox="0 0 24 24" stroke="currentColor"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={3} d="M6 18L18 6M6 6l12 12" /></svg>
                                        Gaps
                                    </p>
                                    <ul className="space-y-1.5">
                                        {jobEvaluation.cons.map((con, i) => (
                                            <li key={i} className="text-[10px] text-slate-600 flex gap-1.5">
                                                <span className="text-rose-500 mt-0.5">•</span>
                                                {con}
                                            </li>
                                        ))}
                                    </ul>
                                </div>
                            </div>

                            <div className="p-3 bg-indigo-50 rounded-xl border border-indigo-100">
                                <p className="text-[10px] font-bold text-indigo-700 uppercase tracking-wide mb-1 flex items-center gap-1">
                                    <Search className="w-3 h-3" />
                                    Market Intelligence
                                </p>
                                <p className="text-[10px] text-indigo-900 leading-relaxed">{jobEvaluation.marketInsights}</p>
                            </div>
                        </div>
                    </motion.div>
                )}
                {tailoredContent && !isTailoring && !isLoading && !isInterviewPrepLoading && (
                    <motion.div
                        initial={{ opacity: 0, y: 10 }} 
                        animate={{ opacity: 1, y: 0 }}
                        className="bg-emerald-50 rounded-2xl border border-emerald-100 shadow-sm p-4 space-y-4"
                    >
                        <div className="flex items-center gap-2">
                            <SparkleIcon className="w-4 h-4 text-emerald-600" />
                            <h4 className="text-sm font-bold text-emerald-900">Tailored Suggestions</h4>
                        </div>
                        
                        <div className="bg-white p-3 rounded-xl border border-emerald-100">
                            <p className="text-[10px] font-bold text-slate-400 uppercase tracking-wide mb-2">New Summary</p>
                            <p className="text-xs text-slate-700 leading-relaxed">{tailoredContent.tailoredSummary}</p>
                            <div className="flex gap-2 mt-3">
                                <button 
                                    onClick={() => {navigator.clipboard.writeText(tailoredContent.tailoredSummary); toast.success("Summary copied to clipboard!");}}
                                    className="flex-1 py-1.5 text-xs font-bold text-slate-600 bg-slate-50 hover:bg-slate-100 rounded-lg transition-colors"
                                >
                                    Copy
                                </button>
                                <button 
                                    onClick={applySummary}
                                    className="flex-[2] py-1.5 text-xs font-bold text-white bg-emerald-600 hover:bg-emerald-700 rounded-lg transition-colors shadow-sm"
                                >
                                    Apply to Resume
                                </button>
                            </div>
                        </div>

                        <div className="bg-white p-3 rounded-xl border border-emerald-100">
                            <p className="text-[10px] font-bold text-slate-400 uppercase tracking-wide mb-2">Skills to Add</p>
                            <div className="flex flex-wrap gap-1.5 mb-3">
                                {tailoredContent.suggestedSkills.map((skill, i) => (
                                    <span key={`suggested-${i}-${skill}`} className="text-[10px] bg-emerald-50 text-emerald-700 px-2 py-1 rounded-md border border-emerald-100 font-medium">{skill}</span>
                                ))}
                            </div>
                            <button 
                                onClick={applySkills}
                                className="w-full py-1.5 text-xs font-bold text-emerald-600 bg-emerald-50 hover:bg-emerald-100 rounded-lg transition-colors"
                            >
                                Add All to Skills Section
                            </button>
                        </div>

                        {tailoredContent.suggestedProjects && tailoredContent.suggestedProjects.length > 0 && (
                            <div className="bg-white p-3 rounded-xl border border-emerald-100">
                                <p className="text-[10px] font-bold text-slate-400 uppercase tracking-wide mb-2">Suggested Projects</p>
                                <div className="space-y-3">
                                    {tailoredContent.suggestedProjects.map((proj, i) => (
                                        <div key={`proj-${i}`} className="p-2 bg-slate-50 rounded-lg border border-slate-100">
                                            <p className="text-xs font-bold text-slate-900 mb-1">{proj.name}</p>
                                            <p className="text-[10px] text-slate-600 leading-relaxed mb-2">{proj.description}</p>
                                            <button 
                                                onClick={() => applyProject(proj)}
                                                className="text-[10px] font-bold text-emerald-600 hover:text-emerald-700"
                                            >
                                                + Add to Projects
                                            </button>
                                        </div>
                                    ))}
                                </div>
                            </div>
                        )}

                        {tailoredContent.suggestedCertifications && tailoredContent.suggestedCertifications.length > 0 && (
                            <div className="bg-white p-3 rounded-xl border border-emerald-100">
                                <p className="text-[10px] font-bold text-slate-400 uppercase tracking-wide mb-2">Recommended Certifications</p>
                                <div className="flex flex-wrap gap-2">
                                    {tailoredContent.suggestedCertifications.map((cert, i) => (
                                        <button 
                                            key={`cert-${i}`}
                                            onClick={() => applyCertification(cert)}
                                            className="text-[10px] bg-indigo-50 text-indigo-700 px-2 py-1 rounded-md border border-indigo-100 font-medium hover:bg-indigo-100 transition-colors"
                                        >
                                            + {cert}
                                        </button>
                                    ))}
                                </div>
                            </div>
                        )}
                    </motion.div>
                )}

                {/* ANALYSIS RESULT */}
                {analysis && !isLoading && (
                    <motion.div 
                        initial={{ opacity: 0, y: 10 }} 
                        animate={{ opacity: 1, y: 0 }}
                        className="bg-white rounded-2xl border border-slate-100 shadow-sm p-4 space-y-6"
                    >
                        <div className="flex items-center justify-between">
                            <div className="flex-1 pr-4">
                                <h4 className="text-sm font-bold text-slate-900 mb-1">Match Report</h4>
                                <p className="text-xs text-slate-500">
                                    {score >= 80 ? 'Great job! Your resume is well-optimized.' : 'Add missing keywords to improve your score.'}
                                </p>
                            </div>
                            <CircularProgress score={score} />
                        </div>

                        <div className="space-y-4">
                            {analysis.missingKeywords.length > 0 && (
                                <div>
                                    <p className="text-[10px] font-bold text-rose-500 uppercase tracking-wider mb-2">Missing Keywords</p>
                                    <motion.div 
                                        initial="hidden"
                                        animate="visible"
                                        variants={{
                                            hidden: { opacity: 0 },
                                            visible: { opacity: 1, transition: { staggerChildren: 0.05 } }
                                        }}
                                        className="flex flex-wrap gap-1.5"
                                    >
                                        {analysis.missingKeywords.map((k, i) => (
                                            <motion.div key={`missing-${k}-${i}`} variants={{ hidden: { opacity: 0, scale: 0.8 }, visible: { opacity: 1, scale: 1 } }}>
                                                <Tag text={k} type="missing" />
                                            </motion.div>
                                        ))}
                                    </motion.div>
                                </div>
                            )}
                            
                            {analysis.presentKeywords.length > 0 && (
                                <div>
                                    <p className="text-[10px] font-bold text-emerald-500 uppercase tracking-wider mb-2">Matches Found</p>
                                    <motion.div 
                                        initial="hidden"
                                        animate="visible"
                                        variants={{
                                            hidden: { opacity: 0 },
                                            visible: { opacity: 1, transition: { staggerChildren: 0.05 } }
                                        }}
                                        className="flex flex-wrap gap-1.5"
                                    >
                                        {analysis.presentKeywords.map((k, i) => (
                                            <motion.div key={`present-${k}-${i}`} variants={{ hidden: { opacity: 0, scale: 0.8 }, visible: { opacity: 1, scale: 1 } }}>
                                                <Tag text={k} type="present" />
                                            </motion.div>
                                        ))}
                                    </motion.div>
                                </div>
                            )}
                        </div>
                    </motion.div>
                )}
            </AnimatePresence>

            {/* ATS PREVIEW MODAL */}
            <AnimatePresence>
                {showReorgConfirm && reorgResult && (
                    <ConfirmModal 
                        isOpen={showReorgConfirm}
                        onCancel={() => setShowReorgConfirm(false)}
                        onConfirm={confirmReorganize}
                        title="Apply Strategic Reorganization?"
                        message={reorgResult.rationale}
                        confirmText="Apply Changes"
                        variant="primary"
                    />
                )}
                {showAtsPreview && (
                    <motion.div 
                        initial={{ opacity: 0 }}
                        animate={{ opacity: 1 }}
                        exit={{ opacity: 0 }}
                        className="fixed inset-0 z-[100] flex items-center justify-center p-4 sm:p-6"
                    >
                        <motion.div 
                            initial={{ opacity: 0 }}
                            animate={{ opacity: 1 }}
                            exit={{ opacity: 0 }}
                            onClick={() => setShowAtsPreview(false)}
                            className="absolute inset-0 bg-black/60 backdrop-blur-sm"
                        />
                        <motion.div 
                            initial={{ opacity: 0, scale: 0.95, y: 20 }}
                            animate={{ opacity: 1, scale: 1, y: 0 }}
                            exit={{ opacity: 0, scale: 0.95, y: 20 }}
                            className="relative w-full max-w-2xl bg-white rounded-3xl shadow-2xl overflow-hidden flex flex-col max-h-[90vh]"
                        >
                            <div className="p-6 border-b border-slate-100 flex items-center justify-between bg-slate-50">
                                <div className="flex items-center gap-3">
                                    <div className="w-10 h-10 rounded-xl bg-emerald-600 flex items-center justify-center">
                                        <FileText className="w-6 h-6 text-white" />
                                    </div>
                                    <div>
                                        <h3 className="text-lg font-black text-slate-900">ATS Text Preview</h3>
                                        <p className="text-xs text-slate-500 font-medium">This is how OpenCATS and other ATS engines "see" your resume.</p>
                                    </div>
                                </div>
                                <button 
                                    onClick={() => setShowAtsPreview(false)}
                                    className="p-2 hover:bg-slate-200 rounded-full transition-colors"
                                >
                                    <svg className="w-6 h-6 text-slate-400" fill="none" viewBox="0 0 24 24" stroke="currentColor"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" /></svg>
                                </button>
                            </div>

                            <div className="p-6 bg-emerald-50 border-b border-emerald-100 flex gap-4">
                                <div className="w-8 h-8 rounded-full bg-emerald-100 flex items-center justify-center flex-shrink-0">
                                    <Info className="w-4 h-4 text-emerald-600" />
                                </div>
                                <p className="text-xs text-emerald-800 leading-relaxed">
                                    ATS systems like OpenCATS strip away all formatting, colors, and images. They rely entirely on raw text, standard headers (like "WORK EXPERIENCE"), and keyword density. 
                                    Ensure your sections are clearly labeled and your keywords are present in this view.
                                </p>
                            </div>

                            <div className="flex-1 overflow-y-auto p-8 bg-slate-50 font-mono text-sm text-slate-800 whitespace-pre-wrap selection:bg-emerald-200">
                                {generateResumePlainText(resumeData)}
                            </div>

                            <div className="p-6 border-t border-slate-100 bg-white flex justify-end gap-3">
                                <button 
                                    onClick={() => setShowAtsPreview(false)}
                                    className="px-6 py-2.5 rounded-xl border-2 border-slate-100 text-slate-600 font-bold text-sm hover:bg-slate-50 transition-colors"
                                >
                                    Close
                                </button>
                                <button 
                                    onClick={() => {
                                        const text = generateResumePlainText(resumeData);
                                        navigator.clipboard.writeText(text);
                                        toast.success("ATS text copied to clipboard!");
                                    }}
                                    className="px-6 py-2.5 rounded-xl bg-black text-white font-bold text-sm hover:bg-slate-800 transition-colors"
                                >
                                    Copy Text
                                </button>
                            </div>
                        </motion.div>
                    </motion.div>
                )}
            </AnimatePresence>
        </div>
    );
};

export default JobMatchAnalyzer;
