
import React, { useState, useRef, useEffect } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { MessageSquare, Play, RotateCcw, CheckCircle2, AlertCircle, Lightbulb, ChevronRight, Loader2, Sparkles, Volume2, Mic, MicOff, Square } from 'lucide-react';
import { ResumeData, InterviewQuestion, InterviewFeedback } from '../../types';
import { generateInterviewQuestions, evaluateInterviewAnswer } from '../../services/geminiService';

interface MockInterviewPanelProps {
    resumeData: ResumeData;
    jobDescription: string;
}

const MockInterviewPanel: React.FC<MockInterviewPanelProps> = ({ resumeData, jobDescription }) => {
    const [loading, setLoading] = useState(false);
    const [questions, setQuestions] = useState<InterviewQuestion[] | null>(null);
    const [activeIndex, setActiveIndex] = useState(0);
    const [userAnswer, setUserAnswer] = useState('');
    const [isEvaluated, setIsEvaluated] = useState(false);
    const [isAnalyzing, setIsAnalyzing] = useState(false);
    const [feedback, setFeedback] = useState<InterviewFeedback | null>(null);
    const [showTip, setShowTip] = useState(false);

    // Audio & Dictation States
    const [isPlaying, setIsPlaying] = useState(false);
    const [isRecording, setIsRecording] = useState(false);
    const audioRef = useRef<HTMLAudioElement | null>(null);
    const recognitionRef = useRef<any>(null);

    useEffect(() => {
        const SpeechRecognition = (window as any).SpeechRecognition || (window as any).webkitSpeechRecognition;
        if (SpeechRecognition) {
            recognitionRef.current = new SpeechRecognition();
            recognitionRef.current.continuous = true;
            recognitionRef.current.interimResults = true;
            
            recognitionRef.current.onresult = (event: any) => {
                let currentTranscript = '';
                for (let i = event.resultIndex; i < event.results.length; i++) {
                    currentTranscript += event.results[i][0].transcript;
                }
                if (currentTranscript) {
                    // Overwrite if it's new transcription part, but typical dictation appends or updates.
                    // For simplicity, we just append to userAnswer when done, or keep updating.
                    // A better UX is to update the state with the combined finalized and interim.
                    setUserAnswer((prev) => prev + " " + currentTranscript);
                }
            };
            
            recognitionRef.current.onerror = (event: any) => {
                console.error("Speech recognition error", event);
                setIsRecording(false);
            };

            recognitionRef.current.onend = () => {
                setIsRecording(false);
            };
        }
        return () => {
            if (audioRef.current) {
                audioRef.current.pause();
            }
            if (recognitionRef.current) {
                recognitionRef.current.stop();
            }
        };
    }, []);

    const toggleRecording = () => {
        if (isRecording) {
            recognitionRef.current?.stop();
            setIsRecording(false);
        } else {
            recognitionRef.current?.start();
            setIsRecording(true);
        }
    };

    const playTTS = async (text: string, voiceName: string = 'Kore') => {
        if (isPlaying && audioRef.current) {
            audioRef.current.pause();
            setIsPlaying(false);
            return;
        }

        try {
            setIsPlaying(true);
            const response = await fetch('/api/ai/tts', {
                method: 'POST',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify({ text, voiceName })
            });

            if (!response.ok) {
                console.error("TTS API returned an error:", response.status);
                setIsPlaying(false);
                return;
            }

            const data = await response.json();
            if (data.audio) {
                const audioUrl = `data:audio/wav;base64,${data.audio}`;
                if (audioRef.current) {
                    audioRef.current.pause();
                }
                const audio = new Audio(audioUrl);
                audioRef.current = audio;
                
                audio.onended = () => setIsPlaying(false);
                audio.onerror = () => setIsPlaying(false);
                
                await audio.play();
            } else {
                setIsPlaying(false);
            }
        } catch (e) {
            console.error("TTS Error:", e);
            setIsPlaying(false);
        }
    };

    const handleStart = async () => {
        if (!jobDescription.trim()) return;
        setLoading(true);
        try {
            const data = await generateInterviewQuestions(resumeData, jobDescription);
            setQuestions(data);
            setActiveIndex(0);
            resetState();
        } catch (error) {
            console.error(error);
        } finally {
            setLoading(false);
        }
    };

    const handleAnalyze = async () => {
        if (!userAnswer.trim() || !questions) return;
        setIsAnalyzing(true);
        try {
            const result = await evaluateInterviewAnswer(questions[activeIndex].question, userAnswer, resumeData.title);
            setFeedback(result);
            setIsEvaluated(true);
        } catch (e) {
            console.error(e);
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

    const handleNext = () => {
        if (questions && activeIndex < questions.length - 1) {
            setActiveIndex(activeIndex + 1);
            resetState();
        }
    };

    return (
        <div className="space-y-6 sm:space-y-8">
            <div className="bg-white p-4 sm:p-8 rounded-[2rem] sm:rounded-[2.5rem] border border-slate-100 shadow-sm">
                <div className="flex flex-col md:flex-row md:items-center justify-between gap-6 mb-8">
                    <div>
                        <h3 className="text-xl sm:text-2xl font-black text-slate-900 tracking-tight mb-2">AI Mock Interview</h3>
                        <p className="text-sm sm:text-base text-slate-500 font-medium">Practice with AI-generated questions tailored to your resume and the target role.</p>
                    </div>
                    {!questions ? (
                        <button
                            onClick={handleStart}
                            disabled={loading || !jobDescription.trim()}
                            className="px-8 py-4 bg-slate-900 text-white rounded-2xl font-black uppercase tracking-widest text-xs hover:bg-emerald-600 transition-all disabled:opacity-50 flex items-center gap-3 shrink-0"
                        >
                            {loading ? <Loader2 className="w-4 h-4 animate-spin" /> : <Play className="w-4 h-4 fill-white" />}
                            {loading ? 'Preparing...' : 'Start Session'}
                        </button>
                    ) : (
                        <button
                            onClick={handleStart}
                            className="px-6 py-3 bg-slate-100 text-slate-600 rounded-xl font-bold text-xs hover:bg-slate-200 transition-all flex items-center gap-2 shrink-0"
                        >
                            <RotateCcw className="w-4 h-4" />
                            New Session
                        </button>
                    )}
                </div>

                {!jobDescription.trim() && !questions && (
                    <div className="p-12 border-2 border-dashed border-slate-100 rounded-[2rem] flex flex-col items-center justify-center text-center">
                        <div className="w-16 h-16 bg-slate-50 rounded-2xl flex items-center justify-center mb-4">
                            <MessageSquare className="w-8 h-8 text-slate-300" />
                        </div>
                        <p className="text-slate-400 font-bold max-w-xs">Please provide a job description in the "Match Analysis" tab first.</p>
                    </div>
                )}

                {questions && (
                    <div className="grid grid-cols-1 lg:grid-cols-12 gap-8">
                        {/* Sidebar: Question List */}
                        <div className="lg:col-span-4 space-y-3">
                            {questions.map((q, idx) => (
                                <button
                                    key={q.id}
                                    onClick={() => { setActiveIndex(idx); resetState(); }}
                                    className={`w-full text-left p-4 rounded-2xl border transition-all duration-200 group ${
                                        activeIndex === idx 
                                        ? 'bg-white border-emerald-500 ring-2 ring-emerald-500/20 shadow-md' 
                                        : 'bg-slate-50 border-slate-100 hover:border-emerald-300 hover:bg-white text-slate-600'
                                    }`}
                                >
                                    <div className="flex justify-between items-center mb-2">
                                        <span className={`text-[9px] font-black uppercase tracking-widest px-2 py-1 rounded-lg border ${
                                            q.type === 'Behavioral' ? 'bg-emerald-50 text-emerald-600 border-emerald-100' :
                                            'bg-amber-50 text-amber-600 border-amber-100'
                                        }`}>
                                            {q.type}
                                        </span>
                                        <span className={`text-[10px] font-black ${activeIndex === idx ? 'text-emerald-400' : 'text-slate-300'}`}>#{idx + 1}</span>
                                    </div>
                                    <p className={`text-xs font-bold line-clamp-2 ${activeIndex === idx ? 'text-slate-900' : 'text-slate-500'}`}>
                                        {q.question}
                                    </p>
                                </button>
                            ))}
                        </div>

                        {/* Main Content: Practice Area */}
                        <div className="lg:col-span-8 space-y-8">
                            <div className="space-y-6">
                                <div className="flex items-center gap-3">
                                    <span className="text-[10px] font-black text-emerald-600 uppercase tracking-widest px-3 py-1.5 bg-emerald-50 rounded-lg border border-emerald-100/50">
                                        Question {activeIndex + 1} of {questions.length}
                                    </span>
                                </div>
                                <div className="flex items-start justify-between gap-4">
                                    <h4 className="text-2xl font-black text-slate-900 leading-tight tracking-tight flex-1">
                                        {questions[activeIndex].question}
                                    </h4>
                                    <button 
                                        onClick={() => playTTS(questions[activeIndex].question)}
                                        className={`shrink-0 p-3 rounded-xl transition-colors ${isPlaying ? 'bg-emerald-100 text-emerald-600' : 'bg-slate-100 text-slate-400 hover:bg-slate-200 hover:text-slate-600'}`}
                                        title={isPlaying ? "Stop Audio" : "Play Question"}
                                    >
                                        {isPlaying ? <Square className="w-5 h-5 fill-emerald-600" /> : <Volume2 className="w-5 h-5" />}
                                    </button>
                                </div>

                                <div className="space-y-3">
                                    <button 
                                        onClick={() => setShowTip(!showTip)}
                                        className="flex items-center gap-2 text-xs font-bold text-emerald-600 hover:text-emerald-700 transition-colors group"
                                    >
                                        <div className="w-6 h-6 rounded-full bg-emerald-50 flex items-center justify-center group-hover:bg-emerald-100 transition-colors">
                                            <Lightbulb className="w-3.5 h-3.5" />
                                        </div>
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
                                                <div className="p-4 bg-emerald-50/50 border border-emerald-100 rounded-xl text-xs text-emerald-900/80 leading-relaxed font-medium">
                                                    {questions[activeIndex].tip}
                                                </div>
                                            </motion.div>
                                        )}
                                    </AnimatePresence>
                                </div>

                                <div className="space-y-3">
                                    <div className="relative">
                                        <textarea 
                                            value={userAnswer}
                                            onChange={(e) => setUserAnswer(e.target.value)}
                                            disabled={isEvaluated || isAnalyzing}
                                            className="w-full h-40 p-5 bg-slate-50 border border-slate-200 rounded-2xl focus:ring-4 focus:ring-emerald-500/10 focus:border-emerald-500 outline-none resize-none text-slate-700 text-sm leading-relaxed disabled:bg-slate-100 disabled:text-slate-500 transition-all shadow-inner placeholder:text-slate-400"
                                            placeholder="Type your answer here, or click the mic to dictate..."
                                        />
                                        {!isEvaluated && !isAnalyzing && (
                                            <button 
                                                onClick={toggleRecording}
                                                className={`absolute bottom-4 right-4 p-3 rounded-full shadow-md transition-all ${isRecording ? 'bg-rose-500 text-white animate-pulse shadow-rose-500/30' : 'bg-white text-slate-400 hover:text-emerald-600 hover:bg-emerald-50 border border-slate-100'}`}
                                                title={isRecording ? "Stop Dictation" : "Start Dictation"}
                                            >
                                                {isRecording ? <MicOff className="w-5 h-5" /> : <Mic className="w-5 h-5" />}
                                            </button>
                                        )}
                                    </div>
                                    
                                    {!isEvaluated && (
                                        <button
                                            onClick={handleAnalyze}
                                            disabled={!userAnswer.trim() || isAnalyzing}
                                            className="px-8 py-3 bg-slate-900 text-white font-bold rounded-xl hover:bg-slate-800 transition-all disabled:opacity-50 flex items-center gap-2 text-xs ml-auto"
                                        >
                                            {isAnalyzing ? <Loader2 className="w-4 h-4 animate-spin" /> : <Sparkles className="w-4 h-4" />}
                                            {isAnalyzing ? 'Analyzing...' : 'Get AI Feedback'}
                                        </button>
                                    )}
                                </div>

                                <AnimatePresence>
                                    {feedback && isEvaluated && (
                                        <motion.div 
                                            initial={{ opacity: 0, y: 20 }} 
                                            animate={{ opacity: 1, y: 0 }} 
                                            className="space-y-6 pt-6 border-t border-slate-100"
                                        >
                                            <div className="flex items-center justify-between">
                                                <div className="flex items-center gap-4">
                                                    <div className={`w-12 h-12 rounded-xl flex items-center justify-center font-black text-lg ${
                                                        feedback.score >= 8 ? 'bg-emerald-100 text-emerald-700' : 
                                                        feedback.score >= 5 ? 'bg-amber-100 text-amber-700' : 
                                                        'bg-rose-100 text-rose-700'
                                                    }`}>
                                                        {feedback.score}/10
                                                    </div>
                                                    <p className="text-sm font-black text-slate-900">AI Evaluation Result</p>
                                                    <button 
                                                        onClick={() => playTTS(`You scored ${feedback.score} out of 10. Here is a refined answer: ${feedback.refinedAnswer}`)}
                                                        className={`p-2 rounded-xl transition-colors ${isPlaying ? 'bg-emerald-100 text-emerald-600' : 'bg-slate-100 text-slate-400 hover:bg-slate-200 hover:text-slate-600'}`}
                                                        title="Read Evaluation"
                                                    >
                                                        {isPlaying ? <Square className="w-4 h-4 fill-emerald-600" /> : <Volume2 className="w-4 h-4" />}
                                                    </button>
                                                </div>
                                                <button onClick={resetState} className="text-xs font-bold text-slate-400 hover:text-slate-600 flex items-center gap-1">
                                                    <RotateCcw className="w-3.5 h-3.5" /> Retry
                                                </button>
                                            </div>

                                            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                                                <div className="bg-emerald-50/50 p-5 rounded-2xl border border-emerald-100">
                                                    <h5 className="text-[10px] font-black text-emerald-600 uppercase tracking-widest mb-3 flex items-center gap-2">
                                                        <CheckCircle2 className="w-3.5 h-3.5" /> Strengths
                                                    </h5>
                                                    <ul className="space-y-2">
                                                        {feedback.strengths.map((s, i) => (
                                                            <li key={i} className="text-xs text-emerald-900/80 font-medium flex items-start gap-2">
                                                                <div className="w-1 h-1 rounded-full bg-emerald-400 mt-1.5 shrink-0" />
                                                                {s}
                                                            </li>
                                                        ))}
                                                    </ul>
                                                </div>
                                                <div className="bg-rose-50/50 p-5 rounded-2xl border border-rose-100">
                                                    <h5 className="text-[10px] font-black text-rose-600 uppercase tracking-widest mb-3 flex items-center gap-2">
                                                        <AlertCircle className="w-3.5 h-3.5" /> Improvements
                                                    </h5>
                                                    <ul className="space-y-2">
                                                        {feedback.improvements.map((s, i) => (
                                                            <li key={i} className="text-xs text-rose-900/80 font-medium flex items-start gap-2">
                                                                <div className="w-1 h-1 rounded-full bg-rose-400 mt-1.5 shrink-0" />
                                                                {s}
                                                            </li>
                                                        ))}
                                                    </ul>
                                                </div>
                                            </div>

                                            <div className="bg-slate-50 p-5 rounded-2xl border border-slate-100">
                                                <h5 className="text-[10px] font-black text-slate-400 uppercase tracking-widest mb-3 flex items-center gap-2">
                                                    <Sparkles className="w-3.5 h-3.5" /> Refined Answer
                                                </h5>
                                                <p className="text-xs text-slate-700 leading-relaxed font-medium italic">"{feedback.refinedAnswer}"</p>
                                            </div>

                                            {activeIndex < questions.length - 1 && (
                                                <button
                                                    onClick={handleNext}
                                                    className="w-full py-4 bg-emerald-600 text-white font-black uppercase tracking-widest text-xs rounded-xl hover:bg-emerald-700 transition-all flex items-center justify-center gap-2"
                                                >
                                                    Next Question <ChevronRight className="w-4 h-4" />
                                                </button>
                                            )}
                                        </motion.div>
                                    )}
                                </AnimatePresence>
                            </div>
                        </div>
                    </div>
                )}
            </div>
        </div>
    );
};

export default MockInterviewPanel;
