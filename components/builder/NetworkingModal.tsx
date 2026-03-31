
import React, { useState, useEffect } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import SparkleIcon from '../icons/SparkleIcon';
import { GmailService } from '../../services/gmailService';

interface NetworkingModalProps {
    email: { subject: string; body: string };
    onClose: () => void;
    company: string;
}

const NetworkingModal: React.FC<NetworkingModalProps> = ({ email, onClose, company }) => {
    const [copied, setCopied] = useState(false);
    const [recipient, setRecipient] = useState('');
    const [isGmailConnected, setIsGmailConnected] = useState(GmailService.isConnected());
    const [isConnecting, setIsConnecting] = useState(false);
    const [sendingStatus, setSendingStatus] = useState<'idle' | 'sending' | 'sent' | 'error'>('idle');

    useEffect(() => {
        // Guess a recipient email based on company name for convenience
        const domain = company.replace(/[\s,]+/g, '').replace(/\./g, '').toLowerCase() + '.com';
        setRecipient(`hiring@${domain}`);
    }, [company]);

    const handleCopy = () => {
        const text = `Subject: ${email.subject}\n\n${email.body}`;
        navigator.clipboard.writeText(text);
        setCopied(true);
        setTimeout(() => setCopied(false), 2000);
    };
    
    const handleOpenGmailLink = () => {
        const subject = encodeURIComponent(email.subject);
        const body = encodeURIComponent(email.body);
        window.open(`https://mail.google.com/mail/?view=cm&fs=1&to=${recipient}&su=${subject}&body=${body}`, '_blank');
    };

    const handleConnectGmail = async () => {
        setIsConnecting(true);
        try {
            await GmailService.connect();
            setIsGmailConnected(true);
        } catch (error) {
            console.error("Failed to connect Gmail", error);
        } finally {
            setIsConnecting(false);
        }
    };

    const handleSendWithGmail = async () => {
        if (!recipient) {
            alert("Please enter a recipient email address.");
            return;
        }
        setSendingStatus('sending');
        try {
            await GmailService.sendEmail(recipient, email.subject, email.body);
            setSendingStatus('sent');
            setTimeout(() => {
                onClose();
            }, 2000);
        } catch (error) {
            console.error(error);
            setSendingStatus('error');
            setTimeout(() => setSendingStatus('idle'), 3000);
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
                className="relative z-10 w-full max-w-2xl flex flex-col bg-white rounded-2xl shadow-2xl overflow-hidden"
            >
                {/* Header */}
                <div className="bg-gradient-to-r from-emerald-600 via-teal-600 to-cyan-600 p-6 text-white">
                    <div className="flex justify-between items-start">
                        <div>
                            <div className="flex items-center gap-3 mb-1">
                                <div className="bg-white/20 p-2 rounded-lg backdrop-blur-md shadow-inner">
                                     <SparkleIcon className="w-6 h-6 text-white" />
                                </div>
                                <div>
                                    <h2 className="text-xl font-bold tracking-tight">Networking Assistant</h2>
                                    <p className="text-emerald-50 text-xs font-medium opacity-90">Drafting email for <strong>{company}</strong></p>
                                </div>
                            </div>
                        </div>
                        <div className="flex items-center gap-3">
                            {!isGmailConnected && (
                                <button 
                                    onClick={handleConnectGmail}
                                    disabled={isConnecting}
                                    className="px-3 py-1.5 bg-white/10 hover:bg-white/20 rounded-lg text-xs font-bold backdrop-blur-md transition-colors border border-white/20 flex items-center gap-2"
                                >
                                    {isConnecting ? (
                                        <span className="w-3 h-3 border-2 border-white/50 border-t-white rounded-full animate-spin" />
                                    ) : (
                                        <svg className="w-3.5 h-3.5" viewBox="0 0 24 24"><path fill="currentColor" d="M22.56 12.25c0-.78-.07-1.53-.2-2.25H12v4.26h5.92c-.26 1.37-1.04 2.53-2.21 3.31v2.77h3.57c2.08-1.92 3.28-4.74 3.28-8.09z" /><path fill="currentColor" d="M12 23c2.97 0 5.46-.98 7.28-2.66l-3.57-2.77c-.98.66-2.23 1.06-3.71 1.06-2.86 0-5.29-1.93-6.16-4.53H2.18v2.84C3.99 20.53 7.7 23 12 23z" /><path fill="currentColor" d="M5.84 14.09c-.22-.66-.35-1.36-.35-2.09s.13-1.43.35-2.09V7.07H2.18C1.43 8.55 1 10.22 1 12s.43 3.45 1.18 4.93l2.85-2.22.81-.62z" /><path fill="currentColor" d="M12 5.38c1.62 0 3.06.56 4.21 1.64l3.15-3.15C17.45 2.09 14.97 1 12 1 7.7 1 3.99 3.47 2.18 7.07l3.66 2.84c.87-2.6 3.3-4.53 6.16-4.53z" /></svg>
                                    )}
                                    Connect Gmail
                                </button>
                            )}
                            <button onClick={onClose} className="p-1.5 rounded-full bg-white/20 hover:bg-white/30 transition-colors">
                                <svg xmlns="http://www.w3.org/2000/svg" className="h-5 w-5" viewBox="0 0 20 20" fill="currentColor"><path fillRule="evenodd" d="M4.293 4.293a1 1 0 011.414 0L10 8.586l4.293-4.293a1 1 0 111.414 1.414L11.414 10l4.293 4.293a1 1 0 01-1.414 1.414L10 11.414l-4.293 4.293a1 1 0 01-1.414-1.414L8.586 10 4.293 5.707a1 1 0 010-1.414z" clipRule="evenodd" /></svg>
                            </button>
                        </div>
                    </div>
                </div>
                
                <div className="p-6 bg-slate-50 flex-grow overflow-y-auto custom-scrollbar">
                    <div className="bg-white border border-slate-200 rounded-xl shadow-sm overflow-hidden">
                         <div className="p-4 border-b border-slate-100 bg-slate-50/50 grid gap-4">
                            <div>
                                <label className="block text-[10px] font-bold text-slate-400 uppercase tracking-wide mb-1.5">Recipient (To)</label>
                                <input 
                                    type="email" 
                                    value={recipient} 
                                    onChange={(e) => setRecipient(e.target.value)}
                                    className="w-full text-sm p-2 border border-slate-300 rounded-lg focus:ring-2 focus:ring-teal-500 focus:border-teal-500 outline-none"
                                    placeholder="recruiter@company.com"
                                />
                            </div>
                            <div>
                                <p className="text-[10px] font-bold text-slate-400 uppercase tracking-wide mb-1">Subject Line</p>
                                <p className="text-sm font-semibold text-slate-900 p-2 bg-slate-50 rounded-lg border border-transparent">{email.subject}</p>
                            </div>
                         </div>
                         <div className="p-4">
                             <p className="text-[10px] font-bold text-slate-400 uppercase tracking-wide mb-2">Email Body</p>
                             <div className="text-sm text-slate-600 whitespace-pre-wrap leading-relaxed font-medium p-2 bg-slate-50 rounded-lg border border-transparent">
                                 {email.body}
                             </div>
                         </div>
                    </div>
                </div>

                <div className="p-4 border-t border-slate-200 bg-white flex justify-between items-center">
                    <div className="flex items-center gap-2">
                        <button onClick={handleCopy} className="px-3 py-2 bg-white border border-slate-200 hover:bg-slate-50 text-slate-600 rounded-lg font-bold text-xs transition-colors flex items-center gap-2">
                            {copied ? (
                                <>
                                    <svg xmlns="http://www.w3.org/2000/svg" className="h-4 w-4 text-emerald-500" viewBox="0 0 20 20" fill="currentColor"><path fillRule="evenodd" d="M16.707 5.293a1 1 0 010 1.414l-8 8a1 1 0 01-1.414 0l-4-4a1 1 0 011.414-1.414L8 12.586l7.293-7.293a1 1 0 011.414 0z" clipRule="evenodd" /></svg>
                                    Copied
                                </>
                            ) : (
                                <>
                                    <svg xmlns="http://www.w3.org/2000/svg" className="h-4 w-4" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}><path strokeLinecap="round" strokeLinejoin="round" d="M8 5H6a2 2 0 00-2 2v12a2 2 0 002 2h10a2 2 0 002-2v-1M8 5a2 2 0 002 2h2a2 2 0 002-2M8 5a2 2 0 012-2h2a2 2 0 012 2m0 0h2a2 2 0 012 2v3m2 4H10m0 0l3-3m-3 3l3 3" /></svg>
                                    Copy
                                </>
                            )}
                        </button>
                        <button onClick={handleOpenGmailLink} className="px-3 py-2 text-xs font-bold text-slate-500 hover:text-red-500 flex items-center gap-1.5 transition-colors rounded hover:bg-red-50">
                            <svg xmlns="http://www.w3.org/2000/svg" className="h-4 w-4" fill="currentColor" viewBox="0 0 24 24"><path d="M24 5.457v13.909c0 .904-.732 1.636-1.636 1.636h-3.819V11.73L12 16.64l-6.545-4.91v9.273H1.636A1.636 1.636 0 0 1 0 19.366V5.457c0-2.023 2.309-3.178 3.927-1.964L5.455 4.64 12 9.548l6.545-4.91 1.528-1.145C21.69 2.28 24 3.434 24 5.457z"/></svg>
                            Draft in Gmail
                        </button>
                    </div>

                    <div className="flex gap-3">
                        <button onClick={onClose} className="px-4 py-2 text-slate-500 hover:text-slate-700 font-bold text-xs transition-colors">
                            Cancel
                        </button>
                        {isGmailConnected ? (
                            <button 
                                onClick={handleSendWithGmail}
                                disabled={sendingStatus !== 'idle'}
                                className={`px-6 py-2.5 text-white rounded-lg font-bold text-xs transition-all shadow-md flex items-center gap-2 ${
                                    sendingStatus === 'sent' ? 'bg-emerald-500' :
                                    sendingStatus === 'error' ? 'bg-red-500' :
                                    'bg-gradient-to-r from-emerald-600 to-teal-600 hover:from-emerald-700 hover:to-teal-700'
                                }`}
                            >
                                {sendingStatus === 'sending' ? (
                                    <>
                                        <svg className="animate-spin h-4 w-4 text-white" xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24"><circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4"></circle><path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"></path></svg>
                                        Sending...
                                    </>
                                ) : sendingStatus === 'sent' ? (
                                    <>
                                        <svg xmlns="http://www.w3.org/2000/svg" className="h-4 w-4" viewBox="0 0 20 20" fill="currentColor"><path fillRule="evenodd" d="M16.707 5.293a1 1 0 010 1.414l-8 8a1 1 0 01-1.414 0l-4-4a1 1 0 011.414-1.414L8 12.586l7.293-7.293a1 1 0 011.414 0z" clipRule="evenodd" /></svg>
                                        Email Sent!
                                    </>
                                ) : sendingStatus === 'error' ? (
                                    'Error. Try Again'
                                ) : (
                                    <>
                                        Send Now
                                        <svg xmlns="http://www.w3.org/2000/svg" className="h-4 w-4" viewBox="0 0 20 20" fill="currentColor"><path d="M10.894 2.553a1 1 0 00-1.788 0l-7 14a1 1 0 001.169 1.409l5-1.429A1 1 0 009 15.571V11a1 1 0 112 0v4.571a1 1 0 00.725.962l5 1.428a1 1 0 001.17-1.408l-7-14z" /></svg>
                                    </>
                                )}
                            </button>
                        ) : (
                            <button 
                                onClick={handleConnectGmail}
                                disabled={isConnecting}
                                className="px-6 py-2.5 bg-slate-900 text-white rounded-lg font-bold text-xs hover:bg-slate-800 transition-all shadow-md"
                            >
                                {isConnecting ? 'Connecting...' : 'Connect & Send'}
                            </button>
                        )}
                    </div>
                </div>
            </motion.div>
        </div>
    );
};

export default NetworkingModal;
