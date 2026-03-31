
import React, { useState, useEffect } from 'react';
import { motion } from 'framer-motion';
import { CalendarService } from '../../services/calendarService';
import { JobBoardService } from '../../services/jobBoardService';

interface IntegrationsModalProps {
    onClose: () => void;
}

const IntegrationItem: React.FC<{ 
    icon: React.ReactNode; 
    title: string; 
    description: string; 
    connected?: boolean; 
    onToggle?: () => void;
    actionText?: string;
    isConnecting?: boolean;
}> = ({ icon, title, description, connected = false, onToggle, actionText = "Connect", isConnecting = false }) => (
    <div className="flex items-center justify-between p-4 border border-slate-200 rounded-xl bg-white hover:border-primary-200 hover:shadow-md transition-all duration-200 group">
        <div className="flex items-center gap-4">
            <div className="flex-shrink-0 transition-transform duration-200 group-hover:scale-110">
                {icon}
            </div>
            <div>
                <h4 className="text-sm font-bold text-slate-900">{title}</h4>
                <p className="text-xs text-slate-500 mt-0.5 max-w-[220px] leading-snug">{description}</p>
            </div>
        </div>
        <div className="flex items-center ml-4">
            {onToggle ? (
                 <button 
                    onClick={onToggle}
                    disabled={isConnecting}
                    className={`relative inline-flex h-6 w-11 flex-shrink-0 cursor-pointer rounded-full border-2 border-transparent transition-colors duration-200 ease-in-out focus:outline-none focus:ring-2 focus:ring-primary focus:ring-offset-2 ${connected ? 'bg-emerald-500' : 'bg-slate-200'}`}
                >
                    <span className={`pointer-events-none inline-block h-5 w-5 transform rounded-full bg-white shadow ring-0 transition duration-200 ease-in-out ${connected ? 'translate-x-5' : 'translate-x-0'}`} />
                </button>
            ) : (
                <button className="text-xs font-bold text-primary-700 bg-primary-50 border border-primary-100 px-4 py-2 rounded-lg hover:bg-primary-100 hover:border-primary-200 transition-colors shadow-sm">
                    {actionText}
                </button>
            )}
        </div>
    </div>
  );

// Custom Colorful Icons
const GoogleIcon = () => (
    <div className="w-12 h-12 rounded-xl bg-white border border-slate-100 shadow-sm flex items-center justify-center p-2 overflow-hidden">
        <svg viewBox="0 0 24 24" className="w-full h-full">
             <path fill="#4285F4" d="M22.56 12.25c0-.78-.07-1.53-.2-2.25H12v4.26h5.92c-.26 1.37-1.04 2.53-2.21 3.31v2.77h3.57c2.08-1.92 3.28-4.74 3.28-8.09z" />
             <path fill="#34A853" d="M12 23c2.97 0 5.46-.98 7.28-2.66l-3.57-2.77c-.98.66-2.23 1.06-3.71 1.06-2.86 0-5.29-1.93-6.16-4.53H2.18v2.84C3.99 20.53 7.7 23 12 23z" />
             <path fill="#FBBC05" d="M5.84 14.09c-.22-.66-.35-1.36-.35-2.09s.13-1.43.35-2.09V7.07H2.18C1.43 8.55 1 10.22 1 12s.43 3.45 1.18 4.93l2.85-2.22.81-.62z" />
             <path fill="#EA4335" d="M12 5.38c1.62 0 3.06.56 4.21 1.64l3.15-3.15C17.45 2.09 14.97 1 12 1 7.7 1 3.99 3.47 2.18 7.07l3.66 2.84c.87-2.6 3.3-4.53 6.16-4.53z" />
        </svg>
    </div>
);

const ChromeIcon = () => (
    <div className="w-12 h-12 rounded-xl bg-white border border-slate-100 shadow-sm flex items-center justify-center p-1.5">
        <svg viewBox="0 0 100 100" className="w-full h-full">
            <circle cx="50" cy="50" r="20" fill="white"/>
            <circle cx="50" cy="50" r="16" fill="#3b82f6"/>
            <path d="M50 14 A36 36 0 0 1 81.18 32 L65.59 59 L50 32 L50 14" fill="#ef4444"/>
            <path d="M81.18 32 A36 36 0 0 1 68 81.18 L41 65.59 L56.59 38.59 L81.18 32" fill="#22c55e"/>
            <path d="M68 81.18 A36 36 0 0 1 14 50 L41 50 L56.59 77 L68 81.18" fill="#eab308"/>
        </svg>
    </div>
);

const ApiIcon = () => (
    <div className="w-12 h-12 rounded-xl bg-slate-800 text-white shadow-lg shadow-slate-300 flex items-center justify-center font-mono text-xs font-bold tracking-tighter border-2 border-slate-600">
        {`{API}`}
    </div>
)

const IntegrationsModal: React.FC<IntegrationsModalProps> = ({ onClose }) => {
    const [connections, setConnections] = useState({
        google: false,
        jobBoards: false,
        extension: false
    });
    
    const [loading, setLoading] = useState<string | null>('init');

    useEffect(() => {
        const initConnections = async () => {
            try {
                const [indeedConnected, googleConnected] = await Promise.all([
                    JobBoardService.isConnected('indeed'),
                    CalendarService.isConnected()
                ]);
                setConnections(prev => ({
                    ...prev,
                    jobBoards: indeedConnected,
                    google: googleConnected
                }));
            } catch (e) {
                console.error(e);
            } finally {
                setLoading(null);
            }
        };
        initConnections();
    }, []);

    const toggle = async (key: keyof typeof connections) => {
        setLoading(key);
        try {
            if (key === 'google') {
                if (connections.google) {
                    await CalendarService.disconnect();
                } else {
                    await CalendarService.connect();
                }
                setConnections(prev => ({ ...prev, google: !prev.google }));
            } else if (key === 'jobBoards') {
                // Mapping jobBoards UI toggle to Indeed service for this demo
                if (connections.jobBoards) {
                    await JobBoardService.disconnect('indeed');
                } else {
                    await JobBoardService.connect('indeed');
                }
                setConnections(prev => ({ ...prev, jobBoards: !prev.jobBoards }));
            } else {
                // Mock toggle for extension
                setConnections(prev => ({ ...prev, [key]: !prev[key] }));
            }
        } catch (e: any) {
            console.error(e);
            alert(e.message || "Failed to toggle integration.");
        } finally {
            setLoading(null);
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
                className="relative z-10 w-full max-w-lg bg-white rounded-2xl shadow-2xl overflow-hidden border border-slate-100"
            >
                <header className="px-6 py-5 border-b border-slate-200 flex justify-between items-center bg-slate-50/50">
                    <div>
                         <h2 className="text-xl font-bold text-slate-800">Integrations</h2>
                         <p className="text-xs text-slate-500">Connect your favorite tools to streamline your search.</p>
                    </div>
                    <button onClick={onClose} className="p-2 bg-white rounded-full text-slate-400 hover:text-slate-600 border border-slate-200 hover:border-slate-300 transition-colors">
                        <svg xmlns="http://www.w3.org/2000/svg" className="h-5 w-5" viewBox="0 0 20 20" fill="currentColor"><path fillRule="evenodd" d="M4.293 4.293a1 1 0 011.414 0L10 8.586l4.293-4.293a1 1 0 111.414 1.414L11.414 10l4.293 4.293a1 1 0 01-1.414 1.414L10 11.414l-4.293 4.293a1 1 0 01-1.414-1.414L8.586 10 4.293 5.707a1 1 0 010-1.414z" clipRule="evenodd" /></svg>
                    </button>
                </header>
                
                <div className="p-6 space-y-4 max-h-[70vh] overflow-y-auto custom-scrollbar bg-slate-50/30">
                    <IntegrationItem 
                        icon={<GoogleIcon />}
                        title="Google Calendar & Gmail"
                        description="Sync interviews to your calendar and draft emails directly in Gmail."
                        connected={connections.google}
                        onToggle={() => toggle('google')}
                        isConnecting={loading === 'google'}
                    />
                    
                    <IntegrationItem 
                        icon={<ChromeIcon />}
                        title="Chrome Extension"
                        description="Save jobs from any website directly to your tracker with our browser extension."
                        actionText="Install"
                        onToggle={undefined}
                    />
                    
                    <IntegrationItem 
                        icon={<ApiIcon />}
                        title="Indeed Integration"
                        description="Automatically sync application statuses from Indeed."
                        connected={connections.jobBoards}
                        onToggle={() => toggle('jobBoards')}
                        isConnecting={loading === 'jobBoards'}
                    />
                </div>
            </motion.div>
        </div>
    );
};

export default IntegrationsModal;
