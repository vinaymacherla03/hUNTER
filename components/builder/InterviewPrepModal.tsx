
import React, { useState } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { InterviewQuestion, InterviewFeedback } from '../../types';
import { evaluateInterviewAnswer } from '../../services/geminiService';
import PremiumButton from './PremiumButton';
import SparkleIcon from '../icons/SparkleIcon';
import { Play, RotateCcw, CheckCircle2, AlertCircle, Lightbulb, MessageSquare, ChevronRight, ChevronDown, X } from 'lucide-react';

interface InterviewPrepModalProps {
    questions: InterviewQuestion[];
    role: string;
    onClose: () => void;
}

const InterviewPrepModal: React.FC<InterviewPrepModalProps> = ({ questions, role, onClose }) => {
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

    const handleNext = () => {
        if (activeIndex < questions.length - 1) {
            setActiveIndex(activeIndex + 1);
            resetState();
        }
    };

    const handlePrev = () => {
        if (activeIndex > 0) {
            setActiveIndex(activeIndex - 1);
            resetState();
        }
    };

    const resetState = () => {
        setUserAnswer('');
        setIsEvaluated(false);
        setFeedback(null);
        setShowTip(false);
    };

    return (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 sm:p-6" role="dialog" aria-modal="true">
            <motion.div 
                initial={{ opacity: 0 }} 
                animate={{ opacity: 1 }} 
                exit={{ opacity: 0 }} 
                className="absolute inset-0 bg-slate-900/40 backdrop-blur-sm" 
                onClick={onClose}
            />
            <motion.div
                initial={{ opacity: 0, scale: 0.95, y: 20 }}
                animate={{ opacity: 1, scale: 1, y: 0 }}
                exit={{ opacity: 0, scale: 0.95, y: 20 }}
                className="relative z-10 w-full max-w-6xl h-[90vh] bg-white rounded-[2rem] shadow-2xl overflow-hidden flex flex-col md:flex-row border border-slate-200/50"
            >
                {/* Sidebar: Question List */}
                <aside className="w-full md:w-80 lg:w-96 bg-slate-50 border-b md:border-b-0 md:border-r border-slate-200 flex flex-col shrink-0">
                    <div className="p-6 border-b border-slate-200 bg-white">
                        <div className="flex items-center gap-3 mb-2">
                            <div className="w-10 h-10 bg-indigo-50 rounded-xl flex items-center justify-center border border-indigo-100/50">
                                <MessageSquare className="w-5 h-5 text-indigo-600" />
                            </div>
                            <div>
                                <h2 className="text-lg font-black text-slate-900 tracking-tight">Interview Prep</h2>
                                <p className="text-[10px] font-bold text-slate-400 uppercase tracking-widest">Practice Session</p>
                            </div>
                        </div>
                        <div className="mt-4 inline-flex items-center gap-2 px-3 py-1.5 bg-slate-100 rounded-lg border border-slate-200">
                            <span className="text-[10px] font-bold text-slate-500 uppercase tracking-widest">Role</span>
                            <span className="text-xs font-bold text-slate-900 truncate max-w-[180px]">{role}</span>
                        </div>
                    </div>
                    <div className="flex-1 overflow-y-auto custom-scrollbar p-4 space-y-2">
                        {questions.map((q, idx) => (
                            <button
                                key={q.id}
                                onClick={() => { setActiveIndex(idx); resetState(); }}
                                className={`w-full text-left p-4 rounded-2xl border transition-all duration-200 group ${
                                    activeIndex === idx 
                                    ? 'bg-white border-indigo-500 ring-2 ring-indigo-500/20 shadow-md' 
                                    : 'bg-white border-slate-200 hover:border-indigo-300 hover:shadow-sm text-slate-600'
                                }`}
                            >
                                <div className="flex justify-between items-center mb-2">
                                    <span className={`text-[10px] font-black uppercase tracking-widest px-2.5 py-1 rounded-lg border ${
                                        q.type === 'Behavioral' ? 'bg-blue-50 text-blue-600 border-blue-100' :
                                        q.type === 'Technical' ? 'bg-amber-50 text-amber-600 border-amber-100' :
                                        'bg-emerald-50 text-emerald-600 border-emerald-100'
                                    }`}>
                                        {q.type}
                                    </span>
                                    <span className={`text-[10px] font-black ${activeIndex === idx ? 'text-indigo-400' : 'text-slate-300 group-hover:text-slate-400'}`}>#{idx + 1}</span>
                                </div>
                                <p className={`text-sm font-bold line-clamp-2 leading-snug ${activeIndex === idx ? 'text-slate-900' : 'text-slate-500 group-hover:text-slate-700'}`}>
                                    {q.question}
                                </p>
                            </button>
                        ))}
                    </div>
                </aside>

                {/* Main Content: Practice Area */}
                <main className="flex-1 flex flex-col h-full overflow-hidden relative bg-white">
                    <div className="flex-1 overflow-y-auto custom-scrollbar p-6 sm:p-10 pb-32">
                        
                        <div className="max-w-3xl mx-auto">
                            {/* Question Header */}
                            <div className="mb-8">
                                <div className="flex items-center gap-3 mb-4">
                                    <span className="text-[10px] font-black text-indigo-600 uppercase tracking-widest px-3 py-1.5 bg-indigo-50 rounded-lg border border-indigo-100/50">
                                        Question {activeIndex + 1} of {questions.length}
                                    </span>
                                </div>
                                <h1 className="text-3xl font-black text-slate-900 leading-tight tracking-tight">
                                    {currentQuestion.question}
                                </h1>
                            </div>

                            {/* Tip Accordion */}
                            <div className="mb-8">
                                <button 
                                    onClick={() => setShowTip(!showTip)}
                                    className="flex items-center gap-2 text-sm font-bold text-indigo-600 hover:text-indigo-700 transition-colors mb-3 group"
                                >
                                    <div className="w-8 h-8 rounded-full bg-indigo-50 flex items-center justify-center group-hover:bg-indigo-100 transition-colors">
                                        <Lightbulb className="w-4 h-4" />
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
                                            <div className="p-5 bg-indigo-50/50 border border-indigo-100 rounded-2xl text-sm text-indigo-900/80 leading-relaxed font-medium shadow-inner">
                                                {currentQuestion.tip}
                                            </div>
                                        </motion.div>
                                    )}
                                </AnimatePresence>
                            </div>

                            {/* Answer Input */}
                            <div className="mb-8">
                                <label className="flex items-center justify-between text-xs font-black text-slate-400 uppercase tracking-widest mb-3">
                                    <span>Your Answer</span>
                                    <span className="text-slate-300 font-medium normal-case tracking-normal">{userAnswer.length} chars</span>
                                </label>
                                <textarea 
                                    value={userAnswer}
                                    onChange={(e) => setUserAnswer(e.target.value)}
                                    disabled={isEvaluated || isAnalyzing}
                                    className="w-full h-48 p-5 bg-slate-50 border border-slate-200 rounded-2xl focus:ring-4 focus:ring-indigo-500/10 focus:border-indigo-500 outline-none resize-none text-slate-700 text-base leading-relaxed disabled:bg-slate-100 disabled:text-slate-500 transition-all shadow-inner"
                                    placeholder="Draft your response here as if you were speaking to the interviewer (STAR method recommended)..."
                                />
                                
                                {!isEvaluated && (
                                    <div className="mt-4">
                                        <motion.button
                                            whileTap={{ scale: 0.98 }}
                                            onClick={handleAnalyze}
                                            disabled={!userAnswer.trim() || isAnalyzing}
                                            className="w-full sm:w-auto px-8 py-4 bg-slate-900 text-white font-bold rounded-2xl hover:bg-slate-800 transition-all shadow-xl shadow-slate-900/20 disabled:opacity-50 disabled:shadow-none flex items-center justify-center gap-3 text-sm ml-auto"
                                        >
                                            {isAnalyzing ? (
                                                <div className="w-5 h-5 border-2 border-white/30 border-t-white rounded-full animate-spin" />
                                            ) : (
                                                <Play className="w-5 h-5 fill-white" />
                                            )}
                                            {isAnalyzing ? 'Analyzing Response...' : 'Get AI Feedback'}
                                        </motion.button>
                                    </div>
                                )}
                            </div>

                            {/* AI Feedback Result */}
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
                                            <button 
                                                onClick={resetState} 
                                                className="hidden sm:flex items-center gap-2 px-4 py-2 bg-slate-100 hover:bg-slate-200 text-slate-600 font-bold rounded-xl transition-colors text-sm"
                                            >
                                                <RotateCcw className="w-4 h-4" />
                                                Try Again
                                            </button>
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

                                        <div className="bg-gradient-to-br from-indigo-50 to-blue-50 p-6 sm:p-8 rounded-3xl border border-indigo-100/50 shadow-sm relative overflow-hidden">
                                            <SparkleIcon className="absolute top-4 right-4 w-24 h-24 text-indigo-500/5" />
                                            <h4 className="text-xs font-black text-indigo-600 uppercase tracking-widest mb-4 flex items-center gap-2 relative z-10">
                                                <SparkleIcon className="w-4 h-4" /> Refined Answer Example
                                            </h4>
                                            <p className="text-base text-indigo-950 leading-relaxed font-medium relative z-10">"{feedback.refinedAnswer}"</p>
                                        </div>

                                        <div className="sm:hidden flex justify-center mt-4">
                                            <button 
                                                onClick={resetState} 
                                                className="w-full flex items-center justify-center gap-2 px-4 py-3 bg-slate-100 hover:bg-slate-200 text-slate-600 font-bold rounded-xl transition-colors text-sm"
                                            >
                                                <RotateCcw className="w-4 h-4" />
                                                Try Again
                                            </button>
                                        </div>
                                    </motion.div>
                                )}
                            </AnimatePresence>
                        </div>
                    </div>

                    {/* Footer Navigation */}
                    <div className="absolute bottom-0 left-0 right-0 p-4 sm:p-6 bg-white/80 backdrop-blur-md border-t border-slate-200 flex justify-between items-center z-20">
                        <button 
                            onClick={handlePrev} 
                            disabled={activeIndex === 0}
                            className="px-6 py-3 text-sm font-bold text-slate-600 hover:bg-slate-100 rounded-xl disabled:opacity-50 disabled:cursor-not-allowed transition-colors"
                        >
                            Previous
                        </button>
                        
                        <div className="hidden sm:flex gap-1">
                            {questions.map((_, idx) => (
                                <div key={idx} className={`w-2 h-2 rounded-full ${activeIndex === idx ? 'bg-indigo-600' : 'bg-slate-200'}`} />
                            ))}
                        </div>

                        <button 
                            onClick={handleNext} 
                            disabled={activeIndex === questions.length - 1}
                            className="px-6 py-3 text-sm font-bold text-white bg-slate-900 hover:bg-slate-800 rounded-xl disabled:opacity-50 disabled:cursor-not-allowed transition-colors shadow-lg shadow-slate-900/20 flex items-center gap-2"
                        >
                            Next <ChevronRight className="w-4 h-4" />
                        </button>
                    </div>
                </main>

                <button 
                    onClick={onClose} 
                    className="absolute top-4 right-4 p-2 bg-white/80 hover:bg-slate-100 text-slate-400 hover:text-slate-600 rounded-full backdrop-blur-sm transition-colors z-30 border border-slate-200 shadow-sm"
                >
                    <X className="w-5 h-5" />
                </button>
            </motion.div>
        </div>
    );
};

export default InterviewPrepModal;
