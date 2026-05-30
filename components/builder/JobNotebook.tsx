
import React, { useState, useRef, useEffect } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { askNotebook, generateAudioBrief, researchCompany, generateInterviewQuestions, evaluateInterviewAnswer, chatWithAI } from '../../services/geminiService';
import SparkleIcon from '../icons/SparkleIcon';
import { decode, decodeAudioData } from '../../utils/audio';
import { Search, Plus, Trash2, Mail, Phone, Linkedin, UserPlus, CheckSquare, Square, Clock, AlertCircle, Calendar as CalendarIcon, Save, Users } from 'lucide-react';
import { JobApplication, JobContact, JobTask, ResumeData, InterviewQuestion, InterviewFeedback } from '../../types';
import { jobService } from '../../services/jobService';
import { auth } from '../../services/firebase';
import { Briefcase, CheckCircle2, XCircle, Sparkles as SparkleIconLucide } from 'lucide-react';
import { toast } from 'sonner';

const STAGES = [
    { id: 'Saved', label: 'Saved', color: 'slate', icon: <Briefcase className="w-3 h-3" /> },
    { id: 'Applied', label: 'Applied', color: 'blue', icon: <CheckCircle2 className="w-3 h-3" /> },
    { id: 'Interviewing', label: 'Interviewing', color: 'violet', icon: <Clock className="w-3 h-3" /> },
    { id: 'Offer', label: 'Offer', color: 'emerald', icon: <SparkleIconLucide className="w-3 h-3" /> },
    { id: 'Rejected', label: 'Rejected', color: 'rose', icon: <XCircle className="w-3 h-3" /> }
] as const;

interface JobNotebookProps {
    job: JobApplication;
    onClose: () => void;
    resumeData: ResumeData;
    onUpdate?: (updates: Partial<JobApplication>) => void;
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
                className="w-1 bg-emerald-400 rounded-full"
                animate={{ height: isPlaying ? [4, 16 + Math.random() * 16, 4] : 4 }}
                transition={{ duration: 0.5, repeat: Infinity, delay: i * 0.1 }}
            />
        ))}
    </div>
);

const JobNotebook: React.FC<JobNotebookProps> = ({ job, onClose, resumeData, onUpdate }) => {
    const [activeTab, setActiveTab] = useState<'notes' | 'chat' | 'audio' | 'interview' | 'contacts' | 'tasks' | 'checklist'>('notes');
    const [localJob, setLocalJob] = useState<JobApplication>(job);
    const [sources, setSources] = useState<Source[]>([
        { id: 'jd', title: 'Job Description', content: job.jobDescription || '', type: 'JD' },
        { id: 'resume', title: 'My Resume', content: JSON.stringify(resumeData), type: 'Resume' }
    ]);
    const [selectedSourceId, setSelectedSourceId] = useState<string>('jd');

    // CRM State
    const [isSaving, setIsSaving] = useState(false);
    const [showAddContact, setShowAddContact] = useState(false);
    const [showAddTask, setShowAddTask] = useState(false);
    const [newContact, setNewContact] = useState<Partial<JobContact>>({});
    const [newTask, setNewTask] = useState<Partial<JobTask>>({ priority: 'medium', completed: false });

    useEffect(() => {
        setLocalJob(job);
    }, [job]);

    const handleSaveCRM = async (updates: Partial<JobApplication>) => {
        setIsSaving(true);
        try {
            const updatedJob = { ...localJob, ...updates };
            if (auth.currentUser) {
                // Only send the updates to Firestore
                await jobService.updateJob(updatedJob.id, updates);
            }
            setLocalJob(updatedJob);
            onUpdate?.(updates);
        } catch (err) {
            console.error(err);
        } finally {
            setIsSaving(false);
        }
    };

    const handleAddContact = () => {
        if (!newContact.name || !newContact.role) return;
        const contact: JobContact = {
            id: `contact-${Date.now()}`,
            name: newContact.name,
            role: newContact.role,
            email: newContact.email,
            phone: newContact.phone,
            linkedin: newContact.linkedin,
            notes: newContact.notes
        };
        handleSaveCRM({ contacts: [...(localJob.contacts || []), contact] });
        setNewContact({});
        setShowAddContact(false);
    };

    const handleAddTask = () => {
        if (!newTask.title) return;
        const task: JobTask = {
            id: `task-${Date.now()}`,
            title: newTask.title,
            dueDate: newTask.dueDate,
            completed: false,
            priority: newTask.priority as any
        };
        handleSaveCRM({ tasks: [...(localJob.tasks || []), task] });
        setNewTask({ priority: 'medium', completed: false });
        setShowAddTask(false);
    };

    const toggleTask = (taskId: string) => {
        const updatedTasks = (localJob.tasks || []).map(t => 
            t.id === taskId ? { ...t, completed: !t.completed } : t
        );
        handleSaveCRM({ tasks: updatedTasks });
    };

    const deleteTask = (taskId: string) => {
        const updatedTasks = (localJob.tasks || []).filter(t => t.id !== taskId);
        handleSaveCRM({ tasks: updatedTasks });
    };

    const deleteContact = (contactId: string) => {
        const updatedContacts = (localJob.contacts || []).filter(c => c.id !== contactId);
        handleSaveCRM({ contacts: updatedContacts });
    };
    
    // Chat State
    const [messages, setMessages] = useState<{role: 'user' | 'ai', content: string}[]>([]);
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
        
        const userMsg = { role: 'user' as const, content: input };
        const newMessages = [...messages, userMsg];
        setMessages(newMessages);
        setInput('');
        setIsThinking(true);
        
        try {
            // Include context in the first message or system prompt implicitly
            const contextMsg = { role: 'user', content: `Context:\n${getFullContext()}` };
            const messagesToSent = [contextMsg, ...newMessages];
            
            const response = await chatWithAI(messagesToSent, resumeData, auth.currentUser?.uid);
            setMessages(prev => [...prev, { role: 'ai', content: response }]);
        } catch (err) {
            setMessages(prev => [...prev, { role: 'ai', content: "Sorry, I couldn't process that." }]);
        } finally {
            setIsThinking(false);
        }
    };

    const handleResearch = async () => {
        setIsResearching(true);
        try {
            const result = await researchCompany(job.company);
            const contentString = result.sources && result.sources.length > 0 
              ? `${result.text}\n\nSources:\n${result.sources.map((s: any) => `- [${s.title}](${s.uri})`).join('\n')}`
              : result.text;
            const newSource: Source = {
                id: `res-${Date.now()}`,
                title: `${job.company} Intelligence`,
                content: contentString,
                type: 'Research'
            };
            setSources(prev => [...prev, newSource]);
            setSelectedSourceId(newSource.id);
            setActiveTab('notes');
        } catch (err) {
            toast.error("Failed to fetch research. Try again.");
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
            const questions = await generateInterviewQuestions(resumeData, job.jobDescription || job.role);
            setInterviewQuestions(questions);
            setActiveQuestionIndex(0);
            resetInterviewState();
        } catch (err) {
            toast.error("Failed to generate questions.");
        } finally {
            setIsGeneratingQuestions(false);
        }
    };

    const handleEvaluateAnswer = async () => {
        if (!interviewAnswer.trim() || interviewQuestions.length === 0) return;
        setIsEvaluatingAnswer(true);
        try {
            const currentQuestion = interviewQuestions[activeQuestionIndex];
            const feedback = await evaluateInterviewAnswer(currentQuestion.question, interviewAnswer, job.role);
            setInterviewFeedback(feedback);
        } catch (err) {
            toast.error("Failed to evaluate answer.");
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
        <motion.div 
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/60 backdrop-blur-sm" 
            onClick={onClose}
        >
            <motion.div 
                initial={{ scale: 0.95, opacity: 0, y: 20 }} 
                animate={{ scale: 1, opacity: 1, y: 0 }}
                exit={{ scale: 0.95, opacity: 0, y: 20 }}
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
                            className="w-full py-2 bg-white border border-emerald-200 rounded-xl text-[10px] font-bold text-emerald-600 hover:bg-emerald-50 hover:scale-105 focus:outline-none focus:ring-4 focus:ring-emerald-500/20 transition-all flex items-center justify-center gap-2"
                        >
                            {isResearching ? <div className="w-3 h-3 border-2 border-emerald-600/30 border-t-emerald-600 rounded-full animate-spin" /> : <SparkleIcon className="w-3 h-3" />}
                            AI Research Company
                        </button>
                    </div>
                    <motion.div 
                        initial="hidden"
                        animate="visible"
                        variants={{ visible: { transition: { staggerChildren: 0.05 } } }}
                        className="flex-1 overflow-y-auto p-3 space-y-2 custom-scrollbar"
                    >
                        <p className="px-2 text-[9px] font-bold text-slate-400 uppercase tracking-widest mb-1">Context Documents</p>
                        {sources.map(s => (
                            <motion.button 
                                variants={{ hidden: { opacity: 0, x: -10 }, visible: { opacity: 1, x: 0 } }}
                                key={s.id} 
                                onClick={() => { setSelectedSourceId(s.id); setActiveTab('notes'); }}
                                className={`w-full text-left p-2.5 rounded-xl text-xs transition-all flex items-center gap-2 border focus:outline-none focus:ring-2 focus:ring-slate-400/50 ${selectedSourceId === s.id ? 'bg-white border-slate-200 shadow-sm font-bold text-slate-900' : 'border-transparent text-slate-500 hover:text-slate-700 hover:bg-slate-200/50'}`}
                            >
                                <div className={`w-1.5 h-1.5 rounded-full ${s.type === 'JD' ? 'bg-slate-400' : s.type === 'Research' ? 'bg-emerald-400' : 'bg-emerald-400'}`} />
                                <span className="truncate">{s.title}</span>
                            </motion.button>
                        ))}
                    </motion.div>
                </div>

                {/* Main Area */}
                <div className="flex-1 flex flex-col min-w-0">
                    <header className="h-16 border-b border-slate-200 flex items-center justify-between px-6 bg-white shrink-0">
                        <div className="flex items-center gap-6">
                            <div className="flex items-center gap-3 pr-6 border-r border-slate-100">
                                <div className="w-8 h-8 bg-slate-50 rounded-lg flex items-center justify-center text-slate-900 font-black text-xs border border-slate-100">
                                    {localJob.company.charAt(0)}
                                </div>
                                <div>
                                    <h4 className="text-xs font-black text-slate-900 leading-none mb-1">{localJob.role}</h4>
                                    <p className="text-[10px] font-bold text-slate-400 uppercase tracking-widest leading-none">{localJob.company}</p>
                                </div>
                            </div>

                            <div className="flex items-center gap-2">
                                <p className="text-[9px] font-black text-slate-400 uppercase tracking-widest">Status:</p>
                                <div className="flex bg-slate-50 p-1 rounded-xl border border-slate-100">
                                    {STAGES.map(stage => (
                                        <button
                                            key={stage.id}
                                            onClick={() => handleSaveCRM({ status: stage.id as any })}
                                            className={`px-3 py-1 rounded-lg text-[9px] font-black uppercase tracking-widest transition-all flex items-center gap-1.5 ${
                                                localJob.status === stage.id 
                                                ? `bg-white text-${stage.color}-600 shadow-sm ring-1 ring-slate-200` 
                                                : 'text-slate-400 hover:text-slate-600'
                                            }`}
                                        >
                                            {stage.icon}
                                            <span className="hidden lg:inline">{stage.label}</span>
                                        </button>
                                    ))}
                                </div>
                            </div>

                            <div className="h-6 w-px bg-slate-100 mx-2" />

                            <div className="flex bg-slate-100 p-1 rounded-xl overflow-x-auto custom-scrollbar no-scrollbar">
                                {(['notes', 'chat', 'audio', 'interview', 'contacts', 'tasks', 'checklist'] as const).map(tab => (
                                    <button 
                                        key={tab} 
                                        onClick={() => setActiveTab(tab)}
                                        className={`px-4 py-1.5 rounded-lg text-[10px] font-black uppercase tracking-widest transition-all focus:outline-none focus:ring-2 focus:ring-slate-400/50 whitespace-nowrap ${activeTab === tab ? 'bg-white text-slate-900 shadow-sm' : 'text-slate-500 hover:text-slate-700 hover:bg-slate-200/50'}`}
                                    >
                                        {tab === 'interview' ? 'Interview' : tab}
                                    </button>
                                ))}
                            </div>
                        </div>
                        <button onClick={onClose} className="p-2 hover:bg-slate-100 rounded-full text-slate-400 transition-colors focus:outline-none focus:ring-2 focus:ring-slate-400/50">
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
                                            <motion.div 
                                                key={i} 
                                                initial={{ opacity: 0, y: 10 }}
                                                animate={{ opacity: 1, y: 0 }}
                                                className={`flex ${msg.role === 'user' ? 'justify-end' : 'justify-start'}`}
                                            >
                                                <div className={`max-w-[85%] px-4 py-3 rounded-2xl text-sm ${msg.role === 'user' ? 'bg-slate-900 text-white rounded-tr-none' : 'bg-white border border-slate-200 text-slate-700 shadow-sm rounded-tl-none'}`}>
                                                    {msg.content}
                                                </div>
                                            </motion.div>
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
                                        <div className="w-24 h-24 bg-gradient-to-tr from-emerald-500 to-emerald-500 rounded-full flex items-center justify-center mx-auto shadow-2xl shadow-emerald-200 ring-8 ring-emerald-50">
                                            {audioState === 'generating' ? <div className="w-10 h-10 border-4 border-white/30 border-t-white rounded-full animate-spin" /> : <svg className="w-12 h-12 text-white" fill="none" viewBox="0 0 24 24" stroke="currentColor"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 11a7 7 0 01-7 7m0 0a7 7 0 01-7-7m7 7v4m0 0H8m4 0h4m-4-8a3 3 0 01-3-3V5a3 3 0 116 0v6a3 3 0 01-3 3z" /></svg>}
                                        </div>
                                        <div>
                                            <h2 className="text-2xl font-black text-slate-900 tracking-tight">Audio Deep Dive</h2>
                                            <p className="text-slate-500 mt-2 text-sm leading-relaxed">Let AI create a custom briefing podcast about this role, company news, and your potential fit. Perfect for listening during your commute.</p>
                                        </div>

                                        {audioState === 'idle' ? (
                                            <button onClick={handleGenerateAudio} className="px-8 py-3 bg-slate-900 text-white font-bold rounded-2xl hover:bg-slate-800 hover:scale-105 focus:outline-none focus:ring-4 focus:ring-slate-900/20 active:scale-95 transition-all shadow-lg flex items-center justify-center gap-2 mx-auto">
                                                <SparkleIcon className="w-4 h-4" />
                                                Generate Briefing
                                            </button>
                                        ) : (
                                            <div className="space-y-6 flex flex-col items-center">
                                                <Visualizer isPlaying={audioState === 'playing'} />
                                                <button 
                                                    onClick={toggleAudio}
                                                    className={`w-16 h-16 rounded-full flex items-center justify-center hover:scale-105 focus:outline-none focus:ring-4 active:scale-95 transition-all ${audioState === 'playing' ? 'bg-red-50 text-red-500 focus:ring-red-500/20' : 'bg-emerald-50 text-emerald-600 focus:ring-emerald-500/20'}`}
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
                                    {/* ... existing interview content ... */}
                                </motion.div>
                            )}

                            {activeTab === 'contacts' && (
                                <motion.div key="contacts" initial={{ opacity: 0 }} animate={{ opacity: 1 }} exit={{ opacity: 0 }} className="h-full flex flex-col bg-slate-50 p-6 overflow-y-auto custom-scrollbar">
                                    <div className="max-w-4xl mx-auto w-full space-y-6">
                                        <div className="flex justify-between items-center">
                                            <div>
                                                <h2 className="text-xl font-black text-slate-900 tracking-tight uppercase">Networking CRM</h2>
                                                <p className="text-[10px] font-bold text-slate-400 uppercase tracking-widest mt-1">Manage key stakeholders and referrals</p>
                                            </div>
                                            <button 
                                                onClick={() => setShowAddContact(true)}
                                                className="px-4 py-2 bg-slate-900 text-white font-black uppercase tracking-widest text-[10px] rounded-xl hover:bg-slate-800 hover:scale-105 transition-all flex items-center gap-2"
                                            >
                                                <UserPlus className="w-3.5 h-3.5" />
                                                Add Contact
                                            </button>
                                        </div>

                                        {showAddContact && (
                                            <motion.div initial={{ height: 0, opacity: 0 }} animate={{ height: 'auto', opacity: 1 }} className="bg-white p-6 rounded-3xl border border-slate-200 shadow-xl space-y-4">
                                                <div className="grid grid-cols-2 gap-4">
                                                    <input placeholder="Name" value={newContact.name || ''} onChange={e => setNewContact({...newContact, name: e.target.value})} className="px-4 py-2 bg-slate-50 border border-slate-200 rounded-xl text-xs font-bold focus:outline-none focus:border-emerald-500" />
                                                    <input placeholder="Role (e.g. Hiring Manager)" value={newContact.role || ''} onChange={e => setNewContact({...newContact, role: e.target.value})} className="px-4 py-2 bg-slate-50 border border-slate-200 rounded-xl text-xs font-bold focus:outline-none focus:border-emerald-500" />
                                                    <input placeholder="Email" value={newContact.email || ''} onChange={e => setNewContact({...newContact, email: e.target.value})} className="px-4 py-2 bg-slate-50 border border-slate-200 rounded-xl text-xs font-bold focus:outline-none focus:border-emerald-500" />
                                                    <input placeholder="LinkedIn URL" value={newContact.linkedin || ''} onChange={e => setNewContact({...newContact, linkedin: e.target.value})} className="px-4 py-2 bg-slate-50 border border-slate-200 rounded-xl text-xs font-bold focus:outline-none focus:border-emerald-500" />
                                                </div>
                                                <div className="flex justify-end gap-2">
                                                    <button onClick={() => setShowAddContact(false)} className="px-4 py-2 text-slate-500 font-bold text-[10px] uppercase">Cancel</button>
                                                    <button onClick={handleAddContact} className="px-6 py-2 bg-emerald-600 text-white font-black text-[10px] uppercase rounded-xl">Save Contact</button>
                                                </div>
                                            </motion.div>
                                        )}

                                        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                                            {localJob.contacts?.map(contact => (
                                                <div key={contact.id} className="bg-white p-5 rounded-3xl border border-slate-200 shadow-sm hover:shadow-md transition-all group">
                                                    <div className="flex justify-between items-start mb-3">
                                                        <div>
                                                            <h4 className="font-black text-slate-900 text-sm">{contact.name}</h4>
                                                            <p className="text-[10px] font-bold text-slate-400 uppercase tracking-widest">{contact.role}</p>
                                                        </div>
                                                        <button onClick={() => deleteContact(contact.id)} className="p-2 text-slate-300 hover:text-red-500 transition-colors opacity-0 group-hover:opacity-100">
                                                            <Trash2 className="w-3.5 h-3.5" />
                                                        </button>
                                                    </div>
                                                    <div className="flex gap-2">
                                                        {contact.email && <a href={`mailto:${contact.email}`} className="p-2 bg-slate-50 rounded-lg text-slate-500 hover:text-emerald-600 hover:bg-emerald-50 transition-all"><Mail className="w-3.5 h-3.5" /></a>}
                                                        {contact.phone && <a href={`tel:${contact.phone}`} className="p-2 bg-slate-50 rounded-lg text-slate-500 hover:text-emerald-600 hover:bg-emerald-50 transition-all"><Phone className="w-3.5 h-3.5" /></a>}
                                                        {contact.linkedin && <a href={contact.linkedin} target="_blank" className="p-2 bg-slate-50 rounded-lg text-slate-500 hover:text-emerald-600 hover:bg-emerald-50 transition-all"><Linkedin className="w-3.5 h-3.5" /></a>}
                                                    </div>
                                                </div>
                                            ))}
                                            {(!localJob.contacts || localJob.contacts.length === 0) && !showAddContact && (
                                                <div className="col-span-full py-12 text-center bg-white rounded-3xl border border-dashed border-slate-200">
                                                    <Users className="w-8 h-8 text-slate-300 mx-auto mb-3" />
                                                    <p className="text-[10px] font-bold text-slate-400 uppercase tracking-widest">No contacts added yet</p>
                                                </div>
                                            )}
                                        </div>
                                    </div>
                                </motion.div>
                            )}

                            {activeTab === 'tasks' && (
                                <motion.div key="tasks" initial={{ opacity: 0 }} animate={{ opacity: 1 }} exit={{ opacity: 0 }} className="h-full flex flex-col bg-slate-50 p-6 overflow-y-auto custom-scrollbar">
                                    <div className="max-w-4xl mx-auto w-full space-y-6">
                                        <div className="flex justify-between items-center">
                                            <div>
                                                <h2 className="text-xl font-black text-slate-900 tracking-tight uppercase">Action Items</h2>
                                                <p className="text-[10px] font-bold text-slate-400 uppercase tracking-widest mt-1">Track follow-ups and deadlines</p>
                                            </div>
                                            <button 
                                                onClick={() => setShowAddTask(true)}
                                                className="px-4 py-2 bg-slate-900 text-white font-black uppercase tracking-widest text-[10px] rounded-xl hover:bg-slate-800 hover:scale-105 transition-all flex items-center gap-2"
                                            >
                                                <Plus className="w-3.5 h-3.5" />
                                                Add Task
                                            </button>
                                        </div>

                                        {showAddTask && (
                                            <motion.div initial={{ height: 0, opacity: 0 }} animate={{ height: 'auto', opacity: 1 }} className="bg-white p-6 rounded-3xl border border-slate-200 shadow-xl space-y-4">
                                                <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                                                    <input placeholder="Task title (e.g. Follow up email)" value={newTask.title || ''} onChange={e => setNewTask({...newTask, title: e.target.value})} className="md:col-span-2 px-4 py-2 bg-slate-50 border border-slate-200 rounded-xl text-xs font-bold focus:outline-none focus:border-emerald-500" />
                                                    <input type="date" value={newTask.dueDate || ''} onChange={e => setNewTask({...newTask, dueDate: e.target.value})} className="px-4 py-2 bg-slate-50 border border-slate-200 rounded-xl text-xs font-bold focus:outline-none focus:border-emerald-500" />
                                                </div>
                                                <div className="flex justify-between items-center">
                                                    <div className="flex gap-2">
                                                        {(['low', 'medium', 'high'] as const).map(p => (
                                                            <button key={p} onClick={() => setNewTask({...newTask, priority: p})} className={`px-3 py-1 rounded-lg text-[9px] font-black uppercase tracking-widest transition-all ${newTask.priority === p ? 'bg-slate-900 text-white' : 'bg-slate-100 text-slate-400'}`}>{p}</button>
                                                        ))}
                                                    </div>
                                                    <div className="flex gap-2">
                                                        <button onClick={() => setShowAddTask(false)} className="px-4 py-2 text-slate-500 font-bold text-[10px] uppercase">Cancel</button>
                                                        <button onClick={handleAddTask} className="px-6 py-2 bg-emerald-600 text-white font-black text-[10px] uppercase rounded-xl">Add Task</button>
                                                    </div>
                                                </div>
                                            </motion.div>
                                        )}

                                        <div className="space-y-3">
                                            {localJob.tasks?.map(task => (
                                                <div key={task.id} className={`bg-white p-4 rounded-2xl border border-slate-200 shadow-sm flex items-center gap-4 transition-all ${task.completed ? 'opacity-60 grayscale' : ''}`}>
                                                    <button onClick={() => toggleTask(task.id)} className={`w-6 h-6 rounded-lg border-2 flex items-center justify-center transition-all ${task.completed ? 'bg-emerald-500 border-emerald-500 text-white' : 'border-slate-200 hover:border-emerald-400'}`}>
                                                        {task.completed && <CheckSquare className="w-4 h-4" />}
                                                    </button>
                                                    <div className="flex-1">
                                                        <h4 className={`text-sm font-black text-slate-900 ${task.completed ? 'line-through' : ''}`}>{task.title}</h4>
                                                        <div className="flex items-center gap-3 mt-1">
                                                            {task.dueDate && <div className="flex items-center gap-1 text-[9px] font-bold text-slate-400 uppercase tracking-widest"><Clock className="w-3 h-3" /> {task.dueDate}</div>}
                                                            <div className={`text-[9px] font-black uppercase tracking-widest px-2 py-0.5 rounded-full ${
                                                                task.priority === 'high' ? 'bg-red-50 text-red-600' : 
                                                                task.priority === 'medium' ? 'bg-amber-50 text-amber-600' : 'bg-emerald-50 text-emerald-600'
                                                            }`}>{task.priority}</div>
                                                        </div>
                                                    </div>
                                                    <button onClick={() => deleteTask(task.id)} className="p-2 text-slate-300 hover:text-red-500 transition-colors">
                                                        <Trash2 className="w-4 h-4" />
                                                    </button>
                                                </div>
                                            ))}
                                            {(!localJob.tasks || localJob.tasks.length === 0) && !showAddTask && (
                                                <div className="py-12 text-center bg-white rounded-3xl border border-dashed border-slate-200">
                                                    <CheckSquare className="w-8 h-8 text-slate-300 mx-auto mb-3" />
                                                    <p className="text-[10px] font-bold text-slate-400 uppercase tracking-widest">No tasks added yet</p>
                                                </div>
                                            )}
                                        </div>
                                    </div>
                                </motion.div>
                            )}
                            {activeTab === 'checklist' && (
                                <motion.div key="checklist" initial={{ opacity: 0 }} animate={{ opacity: 1 }} exit={{ opacity: 0 }} className="h-full flex flex-col bg-slate-50 p-6 overflow-y-auto custom-scrollbar">
                                    <div className="max-w-2xl mx-auto w-full space-y-8">
                                        <div className="text-center">
                                            <h2 className="text-2xl font-black text-slate-900 tracking-tight uppercase">Application Checklist</h2>
                                            <p className="text-[10px] font-bold text-slate-400 uppercase tracking-widest mt-1">Teal-inspired workflow for maximum success</p>
                                        </div>

                                        <div className="bg-white rounded-[2.5rem] border border-slate-200 shadow-sm overflow-hidden">
                                            {[
                                                { id: 'tailor', label: 'Tailor Resume to Job Description', desc: 'Use the Job Matcher to align your skills.' },
                                                { id: 'cover', label: 'Generate & Refine Cover Letter', desc: 'Personalize it for the hiring manager.' },
                                                { id: 'research', label: 'Research Company & Culture', desc: 'Use AI Research to find talking points.' },
                                                { id: 'contacts', label: 'Identify 2-3 Key Contacts', desc: 'Find hiring managers or peers on LinkedIn.' },
                                                { id: 'apply', label: 'Submit Application', desc: 'Apply through the official portal or referral.' },
                                                { id: 'followup', label: 'Send Follow-up Email', desc: 'Wait 5-7 days after applying.' },
                                                { id: 'interview_prep', label: 'Prepare for Interview', desc: 'Practice with the AI Interviewer.' },
                                                { id: 'thank_you', label: 'Send Thank You Note', desc: 'Within 24 hours of the interview.' }
                                            ].map((item, idx) => {
                                                const isCompleted = localJob.tasks?.some(t => t.title.includes(item.label) && t.completed);
                                                return (
                                                    <div 
                                                        key={item.id}
                                                        className={`p-6 flex items-start gap-4 border-b border-slate-100 last:border-0 transition-all ${isCompleted ? 'bg-slate-50/50' : 'hover:bg-slate-50/30'}`}
                                                    >
                                                        <button 
                                                            onClick={() => {
                                                                const existingTask = localJob.tasks?.find(t => t.title.includes(item.label));
                                                                if (existingTask) {
                                                                    toggleTask(existingTask.id);
                                                                } else {
                                                                    const newTask: JobTask = {
                                                                        id: `task-${Date.now()}-${idx}`,
                                                                        title: `[Checklist] ${item.label}`,
                                                                        completed: true,
                                                                        priority: 'medium'
                                                                    };
                                                                    handleSaveCRM({ tasks: [...(localJob.tasks || []), newTask] });
                                                                }
                                                            }}
                                                            className={`w-6 h-6 rounded-lg border-2 flex items-center justify-center shrink-0 transition-all ${isCompleted ? 'bg-emerald-500 border-emerald-500 text-white' : 'border-slate-200 hover:border-emerald-400'}`}
                                                        >
                                                            {isCompleted && <CheckSquare className="w-4 h-4" />}
                                                        </button>
                                                        <div className="flex-1 min-w-0">
                                                            <h4 className={`text-sm font-black text-slate-900 ${isCompleted ? 'line-through text-slate-400' : ''}`}>{item.label}</h4>
                                                            <p className="text-xs text-slate-500 font-medium mt-0.5">{item.desc}</p>
                                                        </div>
                                                    </div>
                                                );
                                            })}
                                        </div>

                                        <div className="p-6 bg-emerald-600 rounded-[2rem] text-white relative overflow-hidden">
                                            <div className="absolute top-0 right-0 w-32 h-32 bg-white/10 rounded-full blur-3xl -mr-16 -mt-16" />
                                            <div className="relative z-10">
                                                <div className="flex items-center gap-3 mb-3">
                                                    <SparkleIconLucide className="w-5 h-5 text-emerald-200" />
                                                    <h4 className="text-sm font-black uppercase tracking-widest">Pro Tip</h4>
                                                </div>
                                                <p className="text-sm text-emerald-50 font-medium leading-relaxed">
                                                    Candidates who follow up within 24 hours of an interview are 3x more likely to get an offer. 
                                                    Use the Chat tab to draft a perfect thank-you note!
                                                </p>
                                            </div>
                                        </div>
                                    </div>
                                </motion.div>
                            )}
                        </AnimatePresence>
                    </div>
                </div>
            </motion.div>
        </motion.div>
    );
};

export default JobNotebook;
