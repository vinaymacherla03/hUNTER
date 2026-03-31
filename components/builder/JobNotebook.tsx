
import React, { useState, useRef, useEffect } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { askNotebook, generateAudioBrief, researchCompany, generateInterviewQuestions, evaluateInterviewAnswer } from '../../services/geminiService';
import SparkleIcon from '../icons/SparkleIcon';
import { decode, decodeAudioData } from '../../utils/audio';
import { ResumeData, InterviewQuestion, InterviewFeedback } from '../../types';

interface JobNotebookProps {
    job: any;
    onClose: () => void;
    resumeData: ResumeData;
}

interface Source {
    id: string;
    title: string;
    content: string;
    type: 'JD' | 'Resume' | 'Research' | 'User';
}

const Visualizer: React.FC<{ isPlaying: boolean }> = ({ isPlaying }) => (
    <div className="flex items-center gap-1 h-8">
        {[1, 2, 3, 4, 5, 6, 7, 8].map((i) => (
            <motion.div
                key={i}
                className="w-1 bg-violet-400 rounded-full"
                animate={{ height: isPlaying ? [4, 16 + Math.random() * 16, 4] : 4 }}
                transition={{ duration: 0.5, repeat: Infinity, delay: i * 0.1 }}
            />
        ))}
    </div>
);

const JobNotebook: React.FC<JobNotebookProps> = ({ job, onClose, resumeData }) => {
    const [activeTab, setActiveTab] = useState<'notes' | 'chat' | 'audio' | 'interview'>('notes');
    const [sources, setSources] = useState<Source[]>([
        { id: 'jd', title: 'Job Description', content: job.jobDescription || '', type: 'JD' },
        { id: 'resume', title: 'My Resume', content: JSON.stringify(resumeData), type: 'Resume' }
    ]);
    const [selectedSourceId, setSelectedSourceId] = useState<string>('jd');
    
    // Chat State
    const [messages, setMessages] = useState<{role: 'user' | 'ai', text: string}[]>([]);
    const [input, setInput] = useState('');
    const [isThinking, setIsThinking] = useState(false);
    const [isResearching, setIsResearching] = useState(false);
    const chatEndRef = useRef<HTMLDivElement>(null);

    // Audio State
    const [audioState, setAudioState] = useState<'idle' | 'generating' | 'playing' | 'paused'>('idle');
    const [audioBuffer, setAudioBuffer] = useState<AudioBuffer | null>(null);
    const audioContextRef = useRef<AudioContext | null>(null);
    const sourceNodeRef = useRef<AudioBufferSourceNode | null>(null);
    const startTimeRef = useRef<number>(0);
    const pauseTimeRef = useRef<number>(0);

    // Interview State
    const [interviewQuestions, setInterviewQuestions] = useState<InterviewQuestion[]>([]);
    const [isGeneratingQuestions, setIsGeneratingQuestions] = useState(false);
    const [activeQuestionIndex, setActiveQuestionIndex] = useState(0);
    const [interviewAnswer, setInterviewAnswer] = useState('');
    const [isEvaluatingAnswer, setIsEvaluatingAnswer] = useState(false);
    const [interviewFeedback, setInterviewFeedback] = useState<InterviewFeedback | null>(null);
    const [showTip, setShowTip] = useState(false);

    const getFullContext = () => sources.map(s => `SOURCE (${s.title}):\n${s.content}`).join('\n\n---\n\n');

    const handleSendMessage = async (e?: React.FormEvent) => {
        e?.preventDefault();
        if (!input.trim() || isThinking) return;
        
        const userMsg = { role: 'user' as const, text: input };
        setMessages(prev => [...prev, userMsg]);
        setInput('');
        setIsThinking(true);
        
        try {
            const response = await askNotebook(getFullContext(), userMsg.text);
            setMessages(prev => [...prev, { role: 'ai', text: response }]);
        } catch (err) {
            setMessages(prev => [...prev, { role: 'ai', text: "Sorry, I couldn't process that." }]);
        } finally {
            setIsThinking(false);
        }
    };

    const handleResearch = async () => {
        setIsResearching(true);
        try {
            const result = await researchCompany(job.company);
            const newSource: Source = {
                id: `res-${Date.now()}`,
                title: `${job.company} Intelligence`,
                content: result,
                type: 'Research'
            };
            setSources(prev => [...prev, newSource]);
            setSelectedSourceId(newSource.id);
            setActiveTab('notes');
        } catch (err) {
            alert("Failed to fetch research. Try again.");
        } finally {
            setIsResearching(false);
        }
    };

    const handleGenerateAudio = async () => {
        setAudioState('generating');
        try {
            const base64 = await generateAudioBrief(getFullContext());
            const ctx = new (window.AudioContext || (window as any).webkitAudioContext)();
            audioContextRef.current = ctx;
            const buffer = await decodeAudioData(decode(base64), ctx, 24000, 1);
            setAudioBuffer(buffer);
            setAudioState('paused');
        } catch (err) {
            console.error(err);
            setAudioState('idle');
        }
    };

    const handleGenerateInterviewQuestions = async () => {
        setIsGeneratingQuestions(true);
        try {
            const questions = await generateInterviewQuestions(resumeData, job.jobDescription || job.title);
            setInterviewQuestions(questions);
            setActiveQuestionIndex(0);
            resetInterviewState();
        } catch (err) {
            alert("Failed to generate questions.");
        } finally {
            setIsGeneratingQuestions(false);
        }
    };

    const handleEvaluateAnswer = async () => {
        if (!interviewAnswer.trim() || interviewQuestions.length === 0) return;
        setIsEvaluatingAnswer(true);
        try {
            const currentQuestion = interviewQuestions[activeQuestionIndex];
            const feedback = await evaluateInterviewAnswer(currentQuestion.question, interviewAnswer, job.title);
            setInterviewFeedback(feedback);
        } catch (err) {
            alert("Failed to evaluate answer.");
        } finally {
            setIsEvaluatingAnswer(false);
        }
    };

    const resetInterviewState = () => {
        setInterviewAnswer('');
        setInterviewFeedback(null);
        setShowTip(false);
    };

    const toggleAudio = () => {
        if (audioState === 'playing') {
            sourceNodeRef.current?.stop();
            pauseTimeRef.current = audioContextRef.current!.currentTime - startTimeRef.current;
            setAudioState('paused');
        } else if (audioBuffer) {
            const source = audioContextRef.current!.createBufferSource();
            source.buffer = audioBuffer;
            source.connect(audioContextRef.current!.destination);
            const offset = pauseTimeRef.current;
            source.start(0, offset);
            startTimeRef.current = audioContextRef.current!.currentTime - offset;
            sourceNodeRef.current = source;
            source.onended = () => {
                if (audioContextRef.current!.currentTime - startTimeRef.current >= audioBuffer.duration) {
                    setAudioState('paused');
                    pauseTimeRef.current = 0;
                }
            };
            setAudioState('playing');
        }
    };

    const selectedSource = sources.find(s => s.id === selectedSourceId);

    return (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/60 backdrop-blur-sm" onClick={onClose}>
            <motion.div 
                initial={{ scale: 0.95, opacity: 0, y: 20 }} animate={{ scale: 1, opacity: 1, y: 0 }}
                className="w-full max-w-6xl h-[85vh] bg-white rounded-3xl shadow-2xl overflow-hidden flex"
                onClick={e => e.stopPropagation()}
            >
                {/* Sidebar: Sources */}
                <div className="w-64 bg-slate-50 border-r border-slate-200 flex flex-col shrink-0">
                    <div className="p-5 border-b border-slate-200">
                        <div className="flex items-center gap-2 mb-4">
                            <div className="w-8 h-8 bg-slate-900 text-white rounded-lg flex items-center justify-center">
                                <svg className="w-5 h-5" fill="none" viewBox="0 0 24 24" stroke="currentColor"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 6.253v13m0-13C10.832 5.477 9.246 5 7.5 5S4.168 5.477 3 6.253v13" /></svg>
                            </div>
                            <span className="font-bold text-slate-800 tracking-tight">Intelligence</span>
                        </div>
                        <button 
                            onClick={handleResearch}
                            disabled={isResearching}
                            className="w-full py-2 bg-white border border-emerald-200 rounded-xl text-[10px] font-bold text-emerald-600 hover:bg-emerald-50 transition-all flex items-center justify-center gap-2"
                        >
                            {isResearching ? <div className="w-3 h-3 border-2 border-emerald-600/30 border-t-emerald-600 rounded-full animate-spin" /> : <SparkleIcon className="w-3 h-3" />}
                            AI Research Company
                        </button>
                    </div>
                    <div className="flex-1 overflow-y-auto p-3 space-y-2 custom-scrollbar">
                        <p className="px-2 text-[9px] font-bold text-slate-400 uppercase tracking-widest mb-1">Context Documents</p>
                        {sources.map(s => (
                            <button 
                                key={s.id} 
                                onClick={() => { setSelectedSourceId(s.id); setActiveTab('notes'); }}
                                className={`w-full text-left p-2.5 rounded-xl text-xs transition-all flex items-center gap-2 border ${selectedSourceId === s.id ? 'bg-white border-slate-200 shadow-sm font-bold text-slate-900' : 'border-transparent text-slate-500 hover:text-slate-700'}`}
                            >
                                <div className={`w-1.5 h-1.5 rounded-full ${s.type === 'JD' ? 'bg-slate-400' : s.type === 'Research' ? 'bg-teal-400' : 'bg-emerald-400'}`} />
                                <span className="truncate">{s.title}</span>
                            </button>
                        ))}
                    </div>
                </div>

                {/* Main Area */}
                <div className="flex-1 flex flex-col min-w-0">
                    <header className="h-16 border-b border-slate-200 flex items-center justify-between px-6 bg-white shrink-0">
                        <div className="flex items-center gap-4">
                            <div className="flex bg-slate-100 p-1 rounded-xl">
                                {(['notes', 'chat', 'audio', 'interview'] as const).map(tab => (
                                    <button 
                                        key={tab} 
                                        onClick={() => setActiveTab(tab)}
                                        className={`px-6 py-1.5 rounded-lg text-xs font-bold capitalize transition-all ${activeTab === tab ? 'bg-white text-slate-900 shadow-sm' : 'text-slate-500 hover:text-slate-700'}`}
                                    >
                                        {tab === 'interview' ? 'Interview Prep' : tab}
                                    </button>
                                ))}
                            </div>
                        </div>
                        <button onClick={onClose} className="p-2 hover:bg-slate-100 rounded-full text-slate-400 transition-colors">
                            <svg className="w-5 h-5" fill="none" viewBox="0 0 24 24" stroke="currentColor"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" /></svg>
                        </button>
                    </header>

                    <div className="flex-1 overflow-hidden relative bg-slate-50">
                        <AnimatePresence mode="wait">
                            {activeTab === 'notes' && selectedSource && (
                                <motion.div key="notes" initial={{ opacity: 0 }} animate={{ opacity: 1 }} exit={{ opacity: 0 }} className="h-full p-10 overflow-y-auto custom-scrollbar bg-white">
                                    <div className="max-w-2xl mx-auto space-y-6">
                                        <div className="flex items-center justify-between border-b border-slate-100 pb-4">
                                            <h1 className="text-2xl font-bold text-slate-900">{selectedSource.title}</h1>
                                            <span className="text-[10px] font-bold text-slate-400 uppercase bg-slate-50 px-2 py-1 rounded border border-slate-100">{selectedSource.type} Document</span>
                                        </div>
                                        <div className="text-slate-600 text-sm leading-loose whitespace-pre-wrap font-medium">
                                            {selectedSource.content || "Document is empty."}
                                        </div>
                                    </div>
                                </motion.div>
                            )}

                            {activeTab === 'chat' && (
                                <motion.div key="chat" initial={{ opacity: 0 }} animate={{ opacity: 1 }} exit={{ opacity: 0 }} className="h-full flex flex-col">
                                    <div className="flex-1 p-6 overflow-y-auto space-y-4 custom-scrollbar">
                                        {messages.length === 0 && (
                                            <div className="text-center py-20">
                                                <div className="w-16 h-16 bg-white border border-slate-200 rounded-2xl flex items-center justify-center mx-auto mb-4 shadow-sm">
                                                    <SparkleIcon className="w-8 h-8 text-emerald-500" />
                                                </div>
                                                <h3 className="text-lg font-bold text-slate-800">Ask your career notes</h3>
                                                <p className="text-xs text-slate-500 max-w-xs mx-auto mt-2">I have access to your resume, the JD, and research docs. How can I help you prepare?</p>
                                            </div>
                                        )}
                                        {messages.map((msg, i) => (
                                            <div key={i} className={`flex ${msg.role === 'user' ? 'justify-end' : 'justify-start'}`}>
                                                <div className={`max-w-[85%] px-4 py-3 rounded-2xl text-sm ${msg.role === 'user' ? 'bg-slate-900 text-white rounded-tr-none' : 'bg-white border border-slate-200 text-slate-700 shadow-sm rounded-tl-none'}`}>
                                                    {msg.text}
                                                </div>
                                            </div>
                                        ))}
                                        {isThinking && (
                                            <div className="flex justify-start">
                                                <div className="bg-white border border-slate-200 px-4 py-2.5 rounded-2xl rounded-tl-none shadow-sm flex gap-1">
                                                    <div className="w-1.5 h-1.5 bg-slate-300 rounded-full animate-bounce" />
                                                    <div className="w-1.5 h-1.5 bg-slate-300 rounded-full animate-bounce delay-75" />
                                                    <div className="w-1.5 h-1.5 bg-slate-300 rounded-full animate-bounce delay-150" />
                                                </div>
                                            </div>
                                        )}
                                        <div ref={chatEndRef} />
                                    </div>
                                    <form onSubmit={handleSendMessage} className="p-4 bg-white border-t border-slate-200 flex gap-2">
                                        <input 
                                            type="text" value={input} onChange={e => setInput(e.target.value)}
                                            placeholder="Summarize the company's culture..."
                                            className="flex-1 px-4 py-2.5 bg-slate-50 border border-slate-200 rounded-xl outline-none focus:ring-2 focus:ring-emerald-500/20 focus:border-emerald-500 text-sm transition-all"
                                        />
                                        <button type="submit" className="p-2.5 bg-slate-900 text-white rounded-xl hover:bg-slate-800 disabled:opacity-50"><svg className="w-5 h-5" fill="none" viewBox="0 0 24 24" stroke="currentColor"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M5 10l7-7m0 0l7 7m-7-7v18" /></svg></button>
                                    </form>
                                </motion.div>
                            )}

                            {activeTab === 'audio' && (
                                <motion.div key="audio" initial={{ opacity: 0 }} animate={{ opacity: 1 }} exit={{ opacity: 0 }} className="h-full flex flex-col items-center justify-center text-center p-10 bg-white">
                                    <div className="max-w-md w-full space-y-8">
                                        <div className="w-24 h-24 bg-gradient-to-tr from-emerald-500 to-teal-500 rounded-full flex items-center justify-center mx-auto shadow-2xl shadow-emerald-200 ring-8 ring-emerald-50">
                                            {audioState === 'generating' ? <div className="w-10 h-10 border-4 border-white/30 border-t-white rounded-full animate-spin" /> : <svg className="w-12 h-12 text-white" fill="none" viewBox="0 0 24 24" stroke="currentColor"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 11a7 7 0 01-7 7m0 0a7 7 0 01-7-7m7 7v4m0 0H8m4 0h4m-4-8a3 3 0 01-3-3V5a3 3 0 116 0v6a3 3 0 01-3 3z" /></svg>}
                                        </div>
                                        <div>
                                            <h2 className="text-2xl font-black text-slate-900 tracking-tight">Audio Deep Dive</h2>
                                            <p className="text-slate-500 mt-2 text-sm leading-relaxed">Let AI create a custom briefing podcast about this role, company news, and your potential fit. Perfect for listening during your commute.</p>
                                        </div>

                                        {audioState === 'idle' ? (
                                            <button onClick={handleGenerateAudio} className="px-8 py-3 bg-slate-900 text-white font-bold rounded-2xl hover:bg-slate-800 transition-all shadow-lg flex items-center justify-center gap-2 mx-auto">
                                                <SparkleIcon className="w-4 h-4" />
                                                Generate Briefing
                                            </button>
                                        ) : (
                                            <div className="space-y-6 flex flex-col items-center">
                                                <Visualizer isPlaying={audioState === 'playing'} />
                                                <button 
                                                    onClick={toggleAudio}
                                                    className={`w-16 h-16 rounded-full flex items-center justify-center transition-all ${audioState === 'playing' ? 'bg-red-50 text-red-500' : 'bg-emerald-50 text-emerald-600'}`}
                                                >
                                                    {audioState === 'playing' ? <svg className="w-8 h-8" fill="currentColor" viewBox="0 0 20 20"><path fillRule="evenodd" d="M18 10a8 8 0 11-16 0 8 8 0 0116 0zM7 8a1 1 0 012 0v4a1 1 0 11-2 0V8zm5-1a1 1 0 00-1 1v4a1 1 0 102 0V8a1 1 0 00-1-1z" clipRule="evenodd" /></svg> : <svg className="w-8 h-8" fill="currentColor" viewBox="0 0 20 20"><path fillRule="evenodd" d="M10 18a8 8 0 100-16 8 8 0 000 16zM9.555 7.168A1 1 0 008 8v4a1 1 0 001.555.832l3-2a1 1 0 000-1.664l-3-2z" clipRule="evenodd" /></svg>}
                                                </button>
                                            </div>
                                        )}
                                    </div>
                                </motion.div>
                            )}
                            {activeTab === 'interview' && (
                                <motion.div key="interview" initial={{ opacity: 0 }} animate={{ opacity: 1 }} exit={{ opacity: 0 }} className="h-full flex flex-col bg-slate-50 relative">
                                    {interviewQuestions.length === 0 ? (
                                        <div className="flex-1 flex flex-col items-center justify-center text-center p-10">
                                            <div className="w-16 h-16 bg-white border border-slate-200 rounded-2xl flex items-center justify-center mx-auto mb-4 shadow-sm">
                                                <SparkleIcon className="w-8 h-8 text-emerald-500" />
                                            </div>
                                            <h3 className="text-lg font-bold text-slate-800">Interview Preparation</h3>
                                            <p className="text-xs text-slate-500 max-w-xs mx-auto mt-2 mb-6">Generate tailored interview questions based on your resume and this job description.</p>
                                            <button 
                                                onClick={handleGenerateInterviewQuestions}
                                                disabled={isGeneratingQuestions}
                                                className="px-6 py-2.5 bg-slate-900 text-white font-bold rounded-xl hover:bg-slate-800 transition-all shadow-md flex items-center justify-center gap-2 disabled:opacity-50"
                                            >
                                                {isGeneratingQuestions ? <div className="w-4 h-4 border-2 border-white/30 border-t-white rounded-full animate-spin" /> : <SparkleIcon className="w-4 h-4" />}
                                                Generate Questions
                                            </button>
                                        </div>
                                    ) : (
                                        <div className="flex-1 flex overflow-hidden">
                                            {/* Questions List */}
                                            <div className="w-1/3 bg-white border-r border-slate-200 flex flex-col overflow-y-auto custom-scrollbar p-4 space-y-2">
                                                {interviewQuestions.map((q, idx) => (
                                                    <button
                                                        key={q.id}
                                                        onClick={() => { setActiveQuestionIndex(idx); resetInterviewState(); }}
                                                        className={`w-full text-left p-3 rounded-xl border transition-all duration-200 ${
                                                            activeQuestionIndex === idx 
                                                            ? 'bg-emerald-50 border-emerald-200 ring-1 ring-emerald-500 shadow-sm' 
                                                            : 'bg-white border-slate-200 hover:border-emerald-100 hover:shadow-sm text-slate-600'
                                                        }`}
                                                    >
                                                        <div className="flex justify-between items-center mb-1">
                                                            <span className={`text-[9px] font-bold uppercase tracking-wider px-2 py-0.5 rounded-full ${
                                                                q.type === 'Behavioral' ? 'bg-teal-100 text-teal-700' :
                                                                q.type === 'Technical' ? 'bg-amber-100 text-amber-700' :
                                                                'bg-emerald-100 text-emerald-700'
                                                            }`}>
                                                                {q.type}
                                                            </span>
                                                            <span className="text-[10px] font-medium text-slate-400">#{idx + 1}</span>
                                                        </div>
                                                        <p className={`text-xs font-medium line-clamp-2 ${activeQuestionIndex === idx ? 'text-slate-900' : 'text-slate-500'}`}>
                                                            {q.question}
                                                        </p>
                                                    </button>
                                                ))}
                                            </div>
                                            
                                            {/* Practice Area */}
                                            <div className="flex-1 flex flex-col overflow-y-auto custom-scrollbar p-6 bg-slate-50">
                                                <div className="mb-6">
                                                    <span className="text-[10px] font-bold text-slate-400 uppercase tracking-wider mb-2 block">Current Question</span>
                                                    <h2 className="text-xl font-bold text-slate-900 leading-tight">
                                                        {interviewQuestions[activeQuestionIndex].question}
                                                    </h2>
                                                </div>

                                                <div className="mb-6">
                                                    <button 
                                                        onClick={() => setShowTip(!showTip)}
                                                        className="flex items-center gap-2 text-xs font-bold text-emerald-600 hover:text-emerald-700 transition-colors mb-2"
                                                    >
                                                        <SparkleIcon className="w-3 h-3" />
                                                        {showTip ? 'Hide Interviewer Tip' : 'Reveal Interviewer Tip'}
                                                    </button>
                                                    <AnimatePresence>
                                                        {showTip && (
                                                            <motion.div 
                                                                initial={{ height: 0, opacity: 0 }} 
                                                                animate={{ height: 'auto', opacity: 1 }} 
                                                                exit={{ height: 0, opacity: 0 }}
                                                                className="overflow-hidden"
                                                            >
                                                                <div className="p-3 bg-emerald-50 border border-emerald-100 rounded-xl text-xs text-emerald-900 leading-relaxed">
                                                                    {interviewQuestions[activeQuestionIndex].tip}
                                                                </div>
                                                            </motion.div>
                                                        )}
                                                    </AnimatePresence>
                                                </div>

                                                <div className="mb-6 flex-1 flex flex-col">
                                                    <label className="block text-xs font-bold text-slate-700 mb-2">Your Answer</label>
                                                    <textarea 
                                                        value={interviewAnswer}
                                                        onChange={(e) => setInterviewAnswer(e.target.value)}
                                                        disabled={!!interviewFeedback || isEvaluatingAnswer}
                                                        className="w-full flex-1 min-h-[150px] p-4 bg-white border border-slate-300 rounded-xl focus:ring-2 focus:ring-emerald-500 focus:border-transparent outline-none resize-none text-slate-700 text-sm leading-relaxed disabled:bg-slate-100 disabled:text-slate-500 transition-all shadow-sm"
                                                        placeholder="Draft your response here (STAR method recommended)..."
                                                    />
                                                    {!interviewFeedback && (
                                                        <div className="mt-4 flex justify-end">
                                                            <button 
                                                                onClick={handleEvaluateAnswer} 
                                                                disabled={!interviewAnswer.trim() || isEvaluatingAnswer} 
                                                                className="px-6 py-2 bg-emerald-600 text-white text-xs font-bold rounded-xl hover:bg-emerald-700 disabled:opacity-50 transition-all shadow-md flex items-center gap-2"
                                                            >
                                                                {isEvaluatingAnswer ? <div className="w-3 h-3 border-2 border-white/30 border-t-white rounded-full animate-spin" /> : null}
                                                                Get Feedback
                                                            </button>
                                                        </div>
                                                    )}
                                                </div>

                                                {/* Feedback Result */}
                                                <AnimatePresence>
                                                    {interviewFeedback && (
                                                        <motion.div 
                                                            initial={{ opacity: 0, y: 10 }} 
                                                            animate={{ opacity: 1, y: 0 }} 
                                                            className="bg-white border border-slate-200 rounded-2xl shadow-sm overflow-hidden mb-4"
                                                        >
                                                            <div className="bg-slate-900 text-white p-3 flex justify-between items-center">
                                                                <h3 className="font-bold text-xs">AI Analysis Result</h3>
                                                                <div className={`px-2 py-0.5 rounded-full text-[10px] font-bold ${
                                                                    interviewFeedback.score >= 8 ? 'bg-emerald-500 text-white' : 
                                                                    interviewFeedback.score >= 5 ? 'bg-amber-500 text-white' : 
                                                                    'bg-red-500 text-white'
                                                                }`}>
                                                                    Score: {interviewFeedback.score}/10
                                                                </div>
                                                            </div>
                                                            <div className="p-4 space-y-4">
                                                                <div className="grid grid-cols-2 gap-4">
                                                                    <div>
                                                                        <h4 className="text-[10px] font-bold text-emerald-600 uppercase tracking-wider mb-1.5">Strengths</h4>
                                                                        <ul className="space-y-1">
                                                                            {interviewFeedback.strengths.map((s, i) => (
                                                                                <li key={i} className="text-xs text-slate-600 flex items-start gap-1.5">
                                                                                    <svg className="w-3 h-3 text-emerald-500 shrink-0 mt-0.5" fill="none" viewBox="0 0 24 24" stroke="currentColor"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M5 13l4 4L19 7" /></svg>
                                                                                    {s}
                                                                                </li>
                                                                            ))}
                                                                        </ul>
                                                                    </div>
                                                                    <div>
                                                                        <h4 className="text-[10px] font-bold text-amber-600 uppercase tracking-wider mb-1.5">Improvements</h4>
                                                                        <ul className="space-y-1">
                                                                            {interviewFeedback.improvements.map((s, i) => (
                                                                                <li key={i} className="text-xs text-slate-600 flex items-start gap-1.5">
                                                                                    <svg className="w-3 h-3 text-amber-500 shrink-0 mt-0.5" fill="none" viewBox="0 0 24 24" stroke="currentColor"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 9v2m0 4h.01m-6.938 4h13.856c1.54 0 2.502-1.667 1.732-3L13.732 4c-.77-1.333-2.694-1.333-3.464 0L3.34 16c-.77 1.333.192 3 1.732 3z" /></svg>
                                                                                    {s}
                                                                                </li>
                                                                            ))}
                                                                        </ul>
                                                                    </div>
                                                                </div>
                                                                <div className="bg-emerald-50 p-3 rounded-xl border border-emerald-100">
                                                                    <h4 className="text-[10px] font-bold text-emerald-700 uppercase tracking-wider mb-1.5">Refined Answer Example</h4>
                                                                    <p className="text-xs text-emerald-900 leading-relaxed italic">"{interviewFeedback.refinedAnswer}"</p>
                                                                </div>
                                                                <div className="flex justify-end">
                                                                    <button 
                                                                        onClick={resetInterviewState} 
                                                                        className="text-xs font-bold text-slate-500 hover:text-slate-900 underline decoration-slate-300 underline-offset-4 hover:decoration-slate-900 transition-all"
                                                                    >
                                                                        Try Again
                                                                    </button>
                                                                </div>
                                                            </div>
                                                        </motion.div>
                                                    )}
                                                </AnimatePresence>
                                            </div>
                                        </div>
                                    )}
                                </motion.div>
                            )}
                        </AnimatePresence>
                    </div>
                </div>
            </motion.div>
        </div>
    );
};

export default JobNotebook;
