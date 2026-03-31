
import React, { useState } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { InterviewQuestion, InterviewFeedback } from '../../types';
import { evaluateInterviewAnswer } from '../../services/geminiService';
import SparkleIcon from '../icons/SparkleIcon';
import { Play, RotateCcw, CheckCircle2, AlertCircle, Lightbulb, MessageSquare, ChevronRight, ChevronDown } from 'lucide-react';

interface InterviewPrepContentProps {
    questions: InterviewQuestion[];
    role: string;
    isLoading: boolean;
    onGenerate: () => void;
}

const InterviewPrepContent: React.FC<InterviewPrepContentProps> = ({ questions, role, isLoading, onGenerate }) => {
    const [activeIndex, setActiveIndex] = useState(0);
    const [userAnswer, setUserAnswer] = useState('');
    const [isEvaluated, setIsEvaluated] = useState(false);
    const [isAnalyzing, setIsAnalyzing] = useState(false);
    const [feedback, setFeedback] = useState<InterviewFeedback | null>(null);
    const [showTip, setShowTip] = useState(false);

    const currentQuestion = questions[activeIndex];

    const handleAnalyze = async () => {
        if (!userAnswer.trim()) return;
        setIsAnalyzing(true);
        try {
            const result = await evaluateInterviewAnswer(currentQuestion.question, userAnswer, role);
            setFeedback(result);
            setIsEvaluated(true);
        } catch (e) {
            console.error(e);
            alert("Failed to analyze answer. Please try again.");
        } finally {
            setIsAnalyzing(false);
        }
    };

    const resetState = () => {
        setUserAnswer('');
        setIsEvaluated(false);
        setFeedback(null);
        setShowTip(false);
    };

    if (questions.length === 0) {
        return (
            <div className="py-16 flex flex-col items-center justify-center text-center bg-white rounded-3xl border border-slate-100 shadow-sm">
                <div className="w-24 h-24 bg-emerald-50 border border-emerald-100/50 rounded-full flex items-center justify-center mb-8 shadow-inner relative">
                    <div className="absolute inset-0 bg-emerald-400/20 rounded-full blur-xl animate-pulse" />
                    <MessageSquare className="w-10 h-10 text-emerald-600 relative z-10" strokeWidth={1.5} />
                </div>
                <h2 className="text-3xl font-black text-slate-900 tracking-tight mb-4">Interview Preparation</h2>
                <p className="text-slate-500 max-w-md mx-auto mb-10 text-base leading-relaxed font-medium">
                    Generate likely interview questions based on your resume and the target job description. 
                    Practice your answers and get AI-powered feedback.
                </p>
                <motion.button
                    whileHover={{ scale: 1.02 }}
                    whileTap={{ scale: 0.98 }}
                    onClick={onGenerate}
                    disabled={isLoading}
                    className="px-8 py-4 bg-slate-900 text-white font-bold rounded-2xl hover:bg-slate-800 transition-all shadow-xl shadow-slate-900/20 disabled:opacity-50 flex items-center gap-3 text-sm"
                >
                    {isLoading ? (
                        <div className="w-5 h-5 border-2 border-white/30 border-t-white rounded-full animate-spin" />
                    ) : (
                        <SparkleIcon className="w-5 h-5" />
                    )}
                    {isLoading ? 'Generating Questions...' : 'Generate Questions'}
                </motion.button>
            </div>
        );
    }

    return (
        <div className="space-y-8">
            <div className="flex flex-col sm:flex-row sm:items-end justify-between gap-4 bg-white p-6 rounded-3xl border border-slate-100 shadow-sm">
                <div>
                    <h2 className="text-2xl font-black text-slate-900 tracking-tight mb-1">Practice Session</h2>
                    <div className="flex items-center gap-2">
                        <span className="text-[10px] font-black text-slate-400 uppercase tracking-widest">Target Role</span>
                        <span className="text-xs font-bold text-emerald-600 bg-emerald-50 px-2 py-1 rounded-md">{role}</span>
                    </div>
                </div>
                <button 
                    onClick={onGenerate}
                    className="text-xs font-bold text-slate-600 hover:text-slate-900 bg-slate-100 hover:bg-slate-200 px-4 py-2 rounded-xl transition-all flex items-center gap-2"
                >
                    <RotateCcw className="w-3.5 h-3.5" />
                    Regenerate
                </button>
            </div>

            <div className="flex gap-2 overflow-x-auto no-scrollbar pb-2 px-1">
                {questions.map((_, idx) => (
                    <button
                        key={idx}
                        onClick={() => { setActiveIndex(idx); resetState(); }}
                        className={`flex-shrink-0 w-12 h-12 rounded-2xl font-black text-sm transition-all flex items-center justify-center border ${
                            activeIndex === idx 
                            ? 'bg-slate-900 text-white border-slate-900 shadow-lg shadow-slate-900/20 scale-110 z-10' 
                            : 'bg-white text-slate-400 border-slate-200 hover:border-slate-300 hover:text-slate-600 hover:bg-slate-50'
                        }`}
                    >
                        {idx + 1}
                    </button>
                ))}
            </div>

            <div className="bg-white rounded-3xl p-6 sm:p-8 border border-slate-200 shadow-sm relative overflow-hidden">
                <div className="absolute top-0 left-0 w-full h-1 bg-gradient-to-r from-emerald-500 to-teal-500" />
                
                <div className="mb-8">
                    <div className="flex items-center gap-3 mb-4">
                        <span className="text-[10px] font-black text-emerald-600 uppercase tracking-widest px-3 py-1.5 bg-emerald-50 rounded-lg border border-emerald-100/50">
                            {currentQuestion.type} Question
                        </span>
                        <span className="text-xs font-bold text-slate-400">Question {activeIndex + 1} of {questions.length}</span>
                    </div>
                    <h3 className="text-2xl font-black text-slate-900 leading-tight tracking-tight">
                        {currentQuestion.question}
                    </h3>
                </div>

                <div className="mb-8">
                    <button 
                        onClick={() => setShowTip(!showTip)}
                        className="flex items-center gap-2 text-sm font-bold text-emerald-600 hover:text-emerald-700 transition-colors mb-3 group"
                    >
                        <div className="w-6 h-6 rounded-full bg-emerald-50 flex items-center justify-center group-hover:bg-emerald-100 transition-colors">
                            <Lightbulb className="w-3.5 h-3.5" />
                        </div>
                        {showTip ? 'Hide Interviewer Tip' : 'Reveal Interviewer Tip'}
                        {showTip ? <ChevronDown className="w-4 h-4 ml-auto" /> : <ChevronRight className="w-4 h-4 ml-auto" />}
                    </button>
                    <AnimatePresence>
                        {showTip && (
                            <motion.div 
                                initial={{ height: 0, opacity: 0 }} 
                                animate={{ height: 'auto', opacity: 1 }} 
                                exit={{ height: 0, opacity: 0 }}
                                className="overflow-hidden"
                            >
                                <div className="p-5 bg-emerald-50/50 border border-emerald-100 rounded-2xl text-sm text-emerald-900/80 leading-relaxed font-medium shadow-inner">
                                    {currentQuestion.tip}
                                </div>
                            </motion.div>
                        )}
                    </AnimatePresence>
                </div>

                <div className="space-y-4">
                    <label className="flex items-center justify-between text-xs font-black text-slate-400 uppercase tracking-widest">
                        <span>Your Answer</span>
                        <span className="text-slate-300 font-medium normal-case tracking-normal">{userAnswer.length} chars</span>
                    </label>
                    <textarea 
                        value={userAnswer}
                        onChange={(e) => setUserAnswer(e.target.value)}
                        disabled={isEvaluated || isAnalyzing}
                        className="w-full h-48 p-5 bg-slate-50 border border-slate-200 rounded-2xl focus:ring-4 focus:ring-emerald-500/10 focus:border-emerald-500 outline-none resize-none text-slate-700 text-base leading-relaxed disabled:bg-slate-100 disabled:text-slate-500 transition-all shadow-inner"
                        placeholder="Type your answer here as if you were speaking to the interviewer..."
                    />
                    
                    <div className="pt-2">
                        {!isEvaluated ? (
                            <motion.button
                                whileTap={{ scale: 0.98 }}
                                onClick={handleAnalyze}
                                disabled={!userAnswer.trim() || isAnalyzing}
                                className="w-full py-4 bg-slate-900 text-white font-bold rounded-2xl hover:bg-slate-800 transition-all shadow-xl shadow-slate-900/20 disabled:opacity-50 disabled:shadow-none flex items-center justify-center gap-3 text-sm"
                            >
                                {isAnalyzing ? (
                                    <div className="w-5 h-5 border-2 border-white/30 border-t-white rounded-full animate-spin" />
                                ) : (
                                    <Play className="w-5 h-5 fill-white" />
                                )}
                                {isAnalyzing ? 'Analyzing Response...' : 'Get AI Feedback'}
                            </motion.button>
                        ) : (
                            <motion.button
                                whileTap={{ scale: 0.98 }}
                                onClick={resetState}
                                className="w-full py-4 bg-white border-2 border-slate-200 text-slate-700 font-bold rounded-2xl hover:bg-slate-50 hover:border-slate-300 transition-all flex items-center justify-center gap-2 text-sm"
                            >
                                <RotateCcw className="w-4 h-4" />
                                Try Again
                            </motion.button>
                        )}
                    </div>
                </div>
            </div>

            <AnimatePresence>
                {feedback && isEvaluated && (
                    <motion.div 
                        initial={{ opacity: 0, y: 20 }} 
                        animate={{ opacity: 1, y: 0 }} 
                        className="space-y-6"
                    >
                        <div className="flex items-center justify-between bg-white p-6 rounded-3xl border border-slate-200 shadow-sm">
                            <div className="flex items-center gap-4">
                                <div className={`w-16 h-16 rounded-2xl flex items-center justify-center font-black text-2xl shadow-inner ${
                                    feedback.score >= 8 ? 'bg-emerald-100 text-emerald-700 border border-emerald-200' : 
                                    feedback.score >= 5 ? 'bg-amber-100 text-amber-700 border border-amber-200' : 
                                    'bg-rose-100 text-rose-700 border border-rose-200'
                                }`}>
                                    {feedback.score}
                                    <span className="text-sm font-bold opacity-50 ml-0.5">/10</span>
                                </div>
                                <div>
                                    <p className="text-[10px] font-black text-slate-400 uppercase tracking-widest mb-1">AI Evaluation</p>
                                    <p className="text-lg font-black text-slate-900 tracking-tight">
                                        {feedback.score >= 8 ? 'Excellent Answer! 🌟' : feedback.score >= 5 ? 'Good Start 👍' : 'Needs Work 💡'}
                                    </p>
                                </div>
                            </div>
                        </div>

                        <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                            <div className="bg-emerald-50/50 p-6 sm:p-8 rounded-3xl border border-emerald-100">
                                <h4 className="text-xs font-black text-emerald-600 uppercase tracking-widest mb-6 flex items-center gap-2">
                                    <CheckCircle2 className="w-4 h-4" /> Strengths
                                </h4>
                                <ul className="space-y-4">
                                    {feedback.strengths.map((s, i) => (
                                        <li key={i} className="text-sm text-emerald-900/80 font-medium flex items-start gap-3 leading-relaxed">
                                            <div className="w-1.5 h-1.5 rounded-full bg-emerald-400 mt-2 shrink-0" />
                                            {s}
                                        </li>
                                    ))}
                                </ul>
                            </div>
                            <div className="bg-rose-50/50 p-6 sm:p-8 rounded-3xl border border-rose-100">
                                <h4 className="text-xs font-black text-rose-600 uppercase tracking-widest mb-6 flex items-center gap-2">
                                    <AlertCircle className="w-4 h-4" /> Areas to Improve
                                </h4>
                                <ul className="space-y-4">
                                    {feedback.improvements.map((s, i) => (
                                        <li key={i} className="text-sm text-rose-900/80 font-medium flex items-start gap-3 leading-relaxed">
                                            <div className="w-1.5 h-1.5 rounded-full bg-rose-400 mt-2 shrink-0" />
                                            {s}
                                        </li>
                                    ))}
                                </ul>
                            </div>
                        </div>

                        <div className="bg-gradient-to-br from-emerald-50 to-teal-50 p-6 sm:p-8 rounded-3xl border border-emerald-100/50 shadow-sm relative overflow-hidden">
                            <SparkleIcon className="absolute top-4 right-4 w-24 h-24 text-emerald-500/5" />
                            <h4 className="text-xs font-black text-emerald-600 uppercase tracking-widest mb-4 flex items-center gap-2 relative z-10">
                                <SparkleIcon className="w-4 h-4" /> Refined Answer Example
                            </h4>
                            <p className="text-base text-emerald-950 leading-relaxed font-medium relative z-10">"{feedback.refinedAnswer}"</p>
                        </div>
                    </motion.div>
                )}
            </AnimatePresence>
        </div>
    );
};

export default InterviewPrepContent;
