
import React, { useState } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import SparkleIcon from '../icons/SparkleIcon';
import { evaluateInterviewAnswer } from '../../services/geminiService';

interface InterviewModalProps {
    questions: { question: string; tip: string }[];
    onClose: () => void;
    company: string;
    role: string;
}

const InterviewModal: React.FC<InterviewModalProps> = ({ questions, onClose, company, role }) => {
    const [practiceMode, setPracticeMode] = useState<{ questionIdx: number; answer: string; feedback: any | null; loading: boolean } | null>(null);

    const handlePractice = (idx: number) => {
        setPracticeMode({ questionIdx: idx, answer: '', feedback: null, loading: false });
    };

    const handleSubmitAnswer = async () => {
        if (!practiceMode || !practiceMode.answer.trim()) return;
        
        setPracticeMode(prev => ({ ...prev!, loading: true }));
        try {
            const currentQuestion = questions[practiceMode.questionIdx].question;
            const result = await evaluateInterviewAnswer(currentQuestion, practiceMode.answer, role);
            setPracticeMode(prev => ({ ...prev!, feedback: result, loading: false }));
        } catch (error) {
            console.error(error);
            setPracticeMode(prev => ({ ...prev!, loading: false }));
            alert("Could not evaluate answer. Please try again.");
        }
    };

    return (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4" role="dialog" aria-modal="true">
             <motion.div
                initial={{ opacity: 0 }}
                animate={{ opacity: 1 }}
                exit={{ opacity: 0 }}
                className="absolute inset-0 bg-black/60 backdrop-blur-sm"
                onClick={onClose}
            />
            <motion.div
                initial={{ opacity: 0, scale: 0.95, y: 20 }}
                animate={{ opacity: 1, scale: 1, y: 0 }}
                exit={{ opacity: 0, scale: 0.95, y: 20 }}
                transition={{ duration: 0.3, ease: 'easeOut' }}
                className="relative z-10 w-full max-w-4xl h-[85vh] flex flex-col bg-white rounded-2xl shadow-2xl overflow-hidden"
            >
                <div className="bg-gradient-to-r from-violet-600 to-indigo-600 p-6 text-white flex-shrink-0">
                    <div className="flex justify-between items-start">
                        <div>
                            <div className="flex items-center gap-2 mb-1">
                                <div className="p-1.5 bg-white/20 rounded-lg backdrop-blur-sm">
                                    <SparkleIcon className="w-5 h-5 text-yellow-300" />
                                </div>
                                <h2 className="text-xl font-bold">AI Interview Coach</h2>
                            </div>
                            <p className="text-violet-100 text-sm">Prep for <strong>{role}</strong> at <strong>{company}</strong></p>
                        </div>
                        <button onClick={onClose} className="p-1.5 rounded-full bg-white/20 hover:bg-white/30 transition-colors">
                             <svg xmlns="http://www.w3.org/2000/svg" className="h-5 w-5" viewBox="0 0 20 20" fill="currentColor"><path fillRule="evenodd" d="M4.293 4.293a1 1 0 011.414 0L10 8.586l4.293-4.293a1 1 0 111.414 1.414L11.414 10l4.293 4.293a1 1 0 01-1.414 1.414L10 11.414l-4.293 4.293a1 1 0 01-1.414-1.414L8.586 10 4.293 5.707a1 1 0 010-1.414z" clipRule="evenodd" /></svg>
                        </button>
                    </div>
                </div>
                
                <div className="flex-grow flex overflow-hidden bg-slate-50">
                    {/* Questions List (Left) */}
                    <div className={`w-1/3 border-r border-slate-200 overflow-y-auto custom-scrollbar p-4 ${practiceMode ? 'hidden md:block' : 'w-full'}`}>
                        <h3 className="text-xs font-bold text-slate-500 uppercase tracking-wider mb-3">Likely Questions</h3>
                        <div className="space-y-3">
                            {questions.map((q, idx) => (
                                <button 
                                    key={idx}
                                    onClick={() => handlePractice(idx)}
                                    className={`w-full text-left p-3 rounded-xl border transition-all ${practiceMode?.questionIdx === idx ? 'bg-violet-50 border-violet-200 shadow-sm ring-1 ring-violet-200' : 'bg-white border-slate-200 hover:border-violet-200 hover:shadow-sm'}`}
                                >
                                    <p className={`text-sm font-semibold mb-1 ${practiceMode?.questionIdx === idx ? 'text-violet-700' : 'text-slate-700'}`}>Question {idx + 1}</p>
                                    <p className="text-xs text-slate-500 line-clamp-2">{q.question}</p>
                                </button>
                            ))}
                        </div>
                    </div>

                    {/* Practice Area (Right) */}
                    <AnimatePresence mode="wait">
                        {practiceMode ? (
                            <motion.div 
                                key="practice"
                                initial={{ opacity: 0, x: 20 }}
                                animate={{ opacity: 1, x: 0 }}
                                exit={{ opacity: 0, x: 20 }}
                                className="flex-1 flex flex-col p-6 overflow-y-auto custom-scrollbar bg-white"
                            >
                                <div className="mb-6">
                                    <div className="flex items-center justify-between mb-3">
                                        <span className="inline-block px-2 py-1 bg-violet-100 text-violet-700 text-[10px] font-bold uppercase rounded-md">Question {practiceMode.questionIdx + 1}</span>
                                        <button onClick={() => setPracticeMode(null)} className="text-xs font-bold text-slate-400 hover:text-slate-600 md:hidden">Back to List</button>
                                    </div>
                                    <h3 className="text-lg font-bold text-slate-900 mb-3">{questions[practiceMode.questionIdx].question}</h3>
                                    <div className="bg-amber-50 border border-amber-100 p-3 rounded-lg flex gap-3">
                                        <span className="text-xl">💡</span>
                                        <p className="text-sm text-amber-800">{questions[practiceMode.questionIdx].tip}</p>
                                    </div>
                                </div>

                                <div className="flex-grow flex flex-col gap-4">
                                    {/* Chat-like interface for practice */}
                                    <div className="flex-grow overflow-y-auto space-y-4 mb-2">
                                        <div className="flex justify-end">
                                            <div className="bg-slate-100 text-slate-700 rounded-2xl rounded-tr-none p-4 max-w-[90%] relative">
                                                <textarea
                                                    value={practiceMode.answer}
                                                    onChange={(e) => !practiceMode.feedback && setPracticeMode(prev => ({ ...prev!, answer: e.target.value }))}
                                                    placeholder="Type your answer here..."
                                                    className="w-full bg-transparent border-none focus:ring-0 outline-none resize-none text-sm leading-relaxed min-h-[100px]"
                                                    disabled={!!practiceMode.feedback || practiceMode.loading}
                                                />
                                                {!practiceMode.feedback && !practiceMode.loading && (
                                                    <p className="text-[10px] text-slate-400 mt-2 text-right">Press 'Get Feedback' when ready</p>
                                                )}
                                            </div>
                                        </div>

                                        {practiceMode.loading && (
                                            <div className="flex justify-start">
                                                <div className="bg-violet-50 border border-violet-100 rounded-2xl rounded-tl-none p-4 flex items-center gap-3">
                                                    <div className="w-5 h-5 border-2 border-violet-500 border-t-transparent rounded-full animate-spin" />
                                                    <span className="text-sm font-bold text-violet-700">Analyzing your answer...</span>
                                                </div>
                                            </div>
                                        )}

                                        {practiceMode.feedback && (
                                            <motion.div 
                                                initial={{ opacity: 0, y: 10 }}
                                                animate={{ opacity: 1, y: 0 }}
                                                className="flex justify-start w-full"
                                            >
                                                <div className="bg-white border border-slate-200 shadow-lg rounded-2xl rounded-tl-none p-0 overflow-hidden max-w-full w-full">
                                                    <div className="bg-slate-50 p-3 border-b border-slate-200 flex justify-between items-center">
                                                        <h4 className="font-bold text-slate-700 text-sm">AI Feedback</h4>
                                                        <div className={`flex items-center gap-1.5 px-2 py-0.5 rounded-full text-xs font-bold ${
                                                            practiceMode.feedback.score >= 8 ? 'bg-emerald-100 text-emerald-700' :
                                                            practiceMode.feedback.score >= 6 ? 'bg-amber-100 text-amber-700' :
                                                            'bg-red-100 text-red-700'
                                                        }`}>
                                                            Score: {practiceMode.feedback.score}/10
                                                        </div>
                                                    </div>
                                                    <div className="p-4 space-y-4">
                                                        <div>
                                                            <p className="text-sm text-slate-700 leading-relaxed">{practiceMode.feedback.feedback}</p>
                                                        </div>
                                                        <div className="bg-emerald-50 border border-emerald-100 rounded-lg p-3">
                                                            <p className="text-xs font-bold text-emerald-700 uppercase mb-1">Better Answer Example</p>
                                                            <p className="text-sm text-emerald-900">{practiceMode.feedback.improvement}</p>
                                                        </div>
                                                        <div className="flex justify-end pt-2">
                                                            <button 
                                                                onClick={() => setPracticeMode(prev => ({ ...prev!, feedback: null, answer: '' }))} 
                                                                className="text-xs font-bold text-violet-600 hover:text-violet-800 hover:underline"
                                                            >
                                                                Try Another Answer
                                                            </button>
                                                        </div>
                                                    </div>
                                                </div>
                                            </motion.div>
                                        )}
                                    </div>
                                    
                                    {!practiceMode.feedback && !practiceMode.loading && (
                                        <div className="flex justify-end pt-2 border-t border-slate-100">
                                            <button 
                                                onClick={handleSubmitAnswer}
                                                disabled={!practiceMode.answer.trim()}
                                                className="px-6 py-2.5 bg-violet-600 text-white font-semibold rounded-full hover:bg-violet-700 disabled:opacity-70 transition-all shadow-lg shadow-violet-200 flex items-center gap-2 transform hover:scale-105 active:scale-95"
                                            >
                                                <SparkleIcon className="w-4 h-4" />
                                                Get AI Feedback
                                            </button>
                                        </div>
                                    )}
                                </div>
                            </motion.div>
                        ) : (
                            <div className="flex-1 flex flex-col items-center justify-center text-center p-8 text-slate-400">
                                <div className="w-20 h-20 bg-slate-100 rounded-full flex items-center justify-center mb-6">
                                    <svg xmlns="http://www.w3.org/2000/svg" className="h-10 w-10" fill="none" viewBox="0 0 24 24" stroke="currentColor"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.5} d="M8 10h.01M12 10h.01M16 10h.01M9 16H5a2 2 0 01-2-2V6a2 2 0 012-2h14a2 2 0 012 2v8a2 2 0 01-2 2h-5l-5 5v-5z" /></svg>
                                </div>
                                <h3 className="text-xl font-bold text-slate-700 mb-2">Ready to Practice?</h3>
                                <p className="text-sm max-w-xs leading-relaxed">Select a question from the left to simulate a real interview response. Our AI will analyze your answer and help you improve.</p>
                            </div>
                        )}
                    </AnimatePresence>
                </div>
            </motion.div>
        </div>
    );
};

export default InterviewModal;
