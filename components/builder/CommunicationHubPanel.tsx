
import React, { useState } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { MessageSquare, Send, Copy, Check, RefreshCw, Loader2, Mail, Users, Heart, ArrowRight, Info, Sparkles } from 'lucide-react';
import { generateCommunicationTemplate } from '../../services/geminiService';
import { ResumeData } from '../../types';
import AIProcessingState from './AIProcessingState';

interface CommunicationHubPanelProps {
    resumeData: ResumeData;
    jobDescription?: string;
}

type TemplateType = 'referral' | 'thank-you' | 'follow-up' | 'outreach';

const CommunicationHubPanel: React.FC<CommunicationHubPanelProps> = ({ resumeData, jobDescription }) => {
    const [isLoading, setIsLoading] = useState(false);
    const [template, setTemplate] = useState<string | null>(null);
    const [activeType, setActiveType] = useState<TemplateType>('referral');
    const [copied, setCopied] = useState(false);
    
    // Context inputs
    const [company, setCompany] = useState('');
    const [role, setRole] = useState('');
    const [recipientName, setRecipientName] = useState('');
    const [notes, setNotes] = useState('');

    const types = [
        { id: 'referral', label: 'Referral Request', icon: Users, color: 'emerald', description: 'Ask a contact to refer you for a role.' },
        { id: 'thank-you', label: 'Thank You Note', icon: Heart, color: 'rose', description: 'Follow up after an interview.' },
        { id: 'follow-up', label: 'Application Follow-up', icon: Send, color: 'blue', description: 'Check in on your application status.' },
        { id: 'outreach', label: 'Cold Outreach', icon: Mail, color: 'violet', description: 'Connect with a recruiter or peer.' }
    ] as const;

    const handleGenerate = async () => {
        setIsLoading(true);
        try {
            const result = await generateCommunicationTemplate(activeType, resumeData, {
                company,
                role,
                recipientName,
                notes
            });
            setTemplate(result);
        } catch (error) {
            console.error(error);
        } finally {
            setIsLoading(false);
        }
    };

    const copyToClipboard = () => {
        if (!template) return;
        navigator.clipboard.writeText(template);
        setCopied(true);
        setTimeout(() => setCopied(null), 2000);
    };

    return (
        <div className="space-y-6 sm:space-y-8">
            <div className="flex flex-col gap-2 px-2">
                <h2 className="text-2xl sm:text-3xl font-black text-slate-900 tracking-tight">Communication Hub</h2>
                <p className="text-[10px] sm:text-sm text-slate-500 font-medium italic">High-conversion message templates for every step of your job search.</p>
            </div>

            <div className="grid grid-cols-1 lg:grid-cols-3 gap-6 sm:gap-8">
                {/* Left: Type Selection & Inputs */}
                <div className="lg:col-span-1 space-y-6">
                    <div className="bg-white rounded-[2rem] sm:rounded-[2.5rem] border-2 border-slate-100 p-4 sm:p-6 shadow-sm space-y-2">
                        {types.map((type) => (
                            <button
                                key={type.id}
                                onClick={() => { setActiveType(type.id); setTemplate(null); }}
                                className={`w-full flex items-center gap-3 sm:gap-4 p-3 sm:p-4 rounded-xl sm:rounded-2xl transition-all text-left group ${
                                    activeType === type.id 
                                    ? `bg-${type.color}-50 border-2 border-${type.color}-200` 
                                    : 'bg-white border-2 border-transparent hover:bg-slate-50'
                                }`}
                            >
                                <div className={`p-2 sm:p-2.5 rounded-lg sm:rounded-xl transition-all ${
                                    activeType === type.id 
                                    ? `bg-${type.color}-600 text-white shadow-lg shadow-${type.color}-200` 
                                    : 'bg-slate-100 text-slate-400 group-hover:bg-slate-200'
                                }`}>
                                    <type.icon className="w-3.5 h-3.5 sm:w-4 h-4" />
                                </div>
                                <div>
                                    <h4 className={`text-[10px] sm:text-xs font-black uppercase tracking-widest ${activeType === type.id ? `text-${type.color}-900` : 'text-slate-500'}`}>
                                        {type.label}
                                    </h4>
                                    <p className="text-[8px] sm:text-[10px] font-bold text-slate-400 mt-0.5">{type.description}</p>
                                </div>
                            </button>
                        ))}
                    </div>

                    <div className="bg-white rounded-[2rem] sm:rounded-[2.5rem] border-2 border-slate-100 p-6 sm:p-8 shadow-sm space-y-4">
                        <h3 className="text-[10px] font-black text-slate-400 uppercase tracking-[0.2em] mb-2">Context Details</h3>
                        <div className="space-y-3 sm:space-y-4">
                            <input 
                                placeholder="Company Name" 
                                value={company} 
                                onChange={e => setCompany(e.target.value)}
                                className="w-full px-4 py-3 bg-slate-50 border-2 border-transparent focus:border-slate-900 focus:bg-white rounded-xl text-xs font-bold transition-all outline-none"
                            />
                            <input 
                                placeholder="Role Title" 
                                value={role} 
                                onChange={e => setRole(e.target.value)}
                                className="w-full px-4 py-3 bg-slate-50 border-2 border-transparent focus:border-slate-900 focus:bg-white rounded-xl text-xs font-bold transition-all outline-none"
                            />
                            <input 
                                placeholder="Recipient Name" 
                                value={recipientName} 
                                onChange={e => setRecipientName(e.target.value)}
                                className="w-full px-4 py-3 bg-slate-50 border-2 border-transparent focus:border-slate-900 focus:bg-white rounded-xl text-xs font-bold transition-all outline-none"
                            />
                            <textarea 
                                placeholder="Any specific notes or context..." 
                                value={notes} 
                                onChange={e => setNotes(e.target.value)}
                                rows={3}
                                className="w-full px-4 py-3 bg-slate-50 border-2 border-transparent focus:border-slate-900 focus:bg-white rounded-xl text-xs font-bold transition-all outline-none resize-none"
                            />
                        </div>
                        <button 
                            onClick={handleGenerate}
                            disabled={isLoading || !company || !role}
                            className="w-full py-4 bg-slate-900 text-white rounded-2xl font-black uppercase tracking-widest text-[10px] hover:bg-black transition-all disabled:opacity-50 flex items-center justify-center gap-2 shadow-xl shadow-slate-200"
                        >
                            {isLoading ? <Loader2 className="w-4 h-4 animate-spin" /> : <Sparkles className="w-4 h-4" />}
                            Generate Message
                        </button>
                    </div>
                </div>

                {/* Right: Output */}
                <div className="lg:col-span-2">
                    <AnimatePresence mode="wait">
                        {isLoading ? (
                            <AIProcessingState 
                                key="loading"
                                title="Drafting Message"
                                messages={[
                                    "Analyzing context...",
                                    "Personalizing tone...",
                                    "Crafting clear call-to-action...",
                                    "Polishing for impact..."
                                ]}
                                icon={MessageSquare}
                                color="emerald"
                            />
                        ) : template ? (
                            <motion.div 
                                key="result"
                                initial={{ opacity: 0, scale: 0.95 }}
                                animate={{ opacity: 1, scale: 1 }}
                                className="bg-slate-900 rounded-[2rem] sm:rounded-[2.5rem] p-6 sm:p-10 text-white shadow-2xl shadow-slate-200 relative overflow-hidden group h-full flex flex-col"
                            >
                                <div className="absolute top-0 right-0 p-8 opacity-10 group-hover:opacity-20 transition-opacity">
                                    <MessageSquare className="w-16 h-16 sm:w-24 h-24" />
                                </div>
                                
                                <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between mb-8 relative z-10 gap-4">
                                    <span className="text-[10px] font-black uppercase tracking-[0.3em] text-emerald-400">Generated Template</span>
                                    <button 
                                        onClick={copyToClipboard}
                                        className="w-full sm:w-auto flex items-center justify-center gap-2 px-4 py-2 bg-white/10 hover:bg-white/20 rounded-xl transition-all text-[10px] font-black uppercase tracking-widest"
                                    >
                                        {copied ? <Check className="w-3.5 h-3.5" /> : <Copy className="w-3.5 h-3.5" />}
                                        {copied ? 'Copied!' : 'Copy to Clipboard'}
                                    </button>
                                </div>

                                <div className="flex-1 relative z-10">
                                    <p className="text-base sm:text-lg font-medium leading-relaxed italic text-slate-200 whitespace-pre-wrap">
                                        "{template}"
                                    </p>
                                </div>

                                <div className="mt-10 pt-8 border-t border-white/10 flex flex-col sm:flex-row items-center justify-between relative z-10 gap-4">
                                    <div className="flex items-center gap-2 text-[10px] font-bold text-slate-400 uppercase tracking-widest">
                                        <Info className="w-3.5 h-3.5" />
                                        Personalize the bracketed text
                                    </div>
                                    <button 
                                        onClick={handleGenerate}
                                        className="text-emerald-400 hover:text-white transition-colors text-[10px] font-black uppercase tracking-widest flex items-center gap-2"
                                    >
                                        <RefreshCw className="w-3.5 h-3.5" />
                                        Try Another Version
                                    </button>
                                </div>
                            </motion.div>
                        ) : (
                            <div className="h-full flex flex-col items-center justify-center text-center p-8 sm:p-12 bg-white rounded-[2rem] sm:rounded-[2.5rem] border-2 border-dashed border-slate-100">
                                <div className="w-16 h-16 sm:w-20 h-20 bg-slate-50 rounded-full flex items-center justify-center mb-6">
                                    <Send className="w-8 h-8 sm:w-10 h-10 text-slate-200" />
                                </div>
                                <h3 className="text-lg sm:text-xl font-black text-slate-900 uppercase tracking-tight mb-2">Start Communicating</h3>
                                <p className="text-xs sm:text-sm text-slate-500 max-w-xs mx-auto font-medium leading-relaxed">
                                    Select a message type and provide some context to generate a professional outreach template.
                                </p>
                            </div>
                        )}
                    </AnimatePresence>
                </div>
            </div>
        </div>
    );
};

export default CommunicationHubPanel;
