
import React, { useState } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { JobAlert, ResumeData } from '../../types';
import SparkleIcon from '../icons/SparkleIcon';

interface JobAlertsModalProps {
    onClose: () => void;
    onSave: (alert: JobAlert) => void;
    initialQuery: string;
    initialLocation: string;
    userEmail: string;
}

const JobAlertsModal: React.FC<JobAlertsModalProps> = ({ onClose, onSave, initialQuery, initialLocation, userEmail }) => {
    const [role, setRole] = useState(initialQuery);
    const [location, setLocation] = useState(initialLocation);
    const [frequency, setFrequency] = useState<'daily' | 'weekly'>('daily');
    const [remote, setRemote] = useState(false);
    const [minSalary, setMinSalary] = useState('');
    const [isSaving, setIsSaving] = useState(false);

    const handleSave = () => {
        setIsSaving(true);
        const newAlert: JobAlert = {
            id: `alert-${Date.now()}`,
            role,
            location,
            frequency,
            filters: {
                remote,
                salary: minSalary
            },
            createdAt: new Date().toISOString()
        };

        // Simulate API call
        setTimeout(() => {
            onSave(newAlert);
            setIsSaving(false);
            onClose();
        }, 800);
    };

    return (
        <div className="fixed inset-0 z-[70] flex items-center justify-center p-4 bg-slate-900/60 backdrop-blur-sm">
            <motion.div
                initial={{ opacity: 0, scale: 0.95, y: 20 }}
                animate={{ opacity: 1, scale: 1, y: 0 }}
                exit={{ opacity: 0, scale: 0.95, y: 20 }}
                className="relative z-10 w-full max-w-lg bg-white rounded-[2rem] shadow-2xl overflow-hidden flex flex-col border border-slate-200"
                onClick={e => e.stopPropagation()}
            >
                <div className="p-8 pb-6 border-b border-slate-100 bg-slate-50/50">
                    <div className="flex items-center gap-3 mb-2">
                        <div className="w-10 h-10 rounded-xl bg-emerald-600 flex items-center justify-center text-white shadow-lg shadow-emerald-200">
                            <svg className="w-6 h-6" fill="none" viewBox="0 0 24 24" stroke="currentColor"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 17h5l-1.405-1.405A2.032 2.032 0 0118 14.158V11a6.002 6.002 0 00-4-5.659V5a2 2 0 10-4 0v.341C7.67 6.165 6 8.388 6 11v3.159c0 .538-.214 1.055-.595 1.436L4 17h5m6 0v1a3 3 0 11-6 0v-1m6 0H9" /></svg>
                        </div>
                        <div>
                            <h2 className="text-xl font-black text-slate-900 tracking-tight">Market Intelligence Alert</h2>
                            <p className="text-xs font-bold text-slate-500 uppercase tracking-widest">Active Monitoring Service</p>
                        </div>
                    </div>
                </div>

                <div className="p-8 space-y-6">
                    <div className="grid gap-4">
                        <div>
                            <label className="block text-[10px] font-black text-slate-400 uppercase tracking-widest mb-1.5">Target Keywords</label>
                            <input 
                                type="text" 
                                value={role} 
                                onChange={e => setRole(e.target.value)}
                                className="w-full px-4 py-3 bg-slate-50 border border-slate-200 rounded-xl font-bold text-slate-900 focus:outline-none focus:ring-2 focus:ring-emerald-500/20 focus:bg-white transition-all text-sm"
                                placeholder="e.g. Senior Director of Product"
                            />
                        </div>
                        <div>
                            <label className="block text-[10px] font-black text-slate-400 uppercase tracking-widest mb-1.5">Primary Location</label>
                            <input 
                                type="text" 
                                value={location} 
                                onChange={e => setLocation(e.target.value)}
                                className="w-full px-4 py-3 bg-slate-50 border border-slate-200 rounded-xl font-bold text-slate-900 focus:outline-none focus:ring-2 focus:ring-emerald-500/20 focus:bg-white transition-all text-sm"
                                placeholder="e.g. Remote or San Francisco"
                            />
                        </div>
                    </div>

                    <div className="grid grid-cols-2 gap-4">
                        <div>
                            <label className="block text-[10px] font-black text-slate-400 uppercase tracking-widest mb-1.5">Update Frequency</label>
                            <select 
                                value={frequency}
                                onChange={e => setFrequency(e.target.value as any)}
                                className="w-full px-4 py-3 bg-slate-50 border border-slate-200 rounded-xl font-bold text-slate-900 focus:outline-none text-sm appearance-none focus:ring-2 focus:ring-emerald-500/20 focus:bg-white transition-all"
                            >
                                <option value="daily">Daily Briefing</option>
                                <option value="weekly">Weekly Intelligence</option>
                            </select>
                        </div>
                        <div>
                            <label className="block text-[10px] font-black text-slate-400 uppercase tracking-widest mb-1.5">Target Salary ($)</label>
                            <input 
                                type="text" 
                                value={minSalary} 
                                onChange={e => setMinSalary(e.target.value)}
                                className="w-full px-4 py-3 bg-slate-50 border border-slate-200 rounded-xl font-bold text-slate-900 focus:outline-none text-sm focus:ring-2 focus:ring-emerald-500/20 focus:bg-white transition-all"
                                placeholder="Min yearly base"
                            />
                        </div>
                    </div>

                    <div className="flex items-center gap-3 p-4 bg-emerald-50/50 border border-emerald-100 rounded-2xl">
                        <input 
                            type="checkbox" 
                            id="remote-opt"
                            checked={remote}
                            onChange={e => setRemote(e.target.checked)}
                            className="w-5 h-5 rounded-md border-slate-300 text-emerald-600 focus:ring-emerald-500" 
                        />
                        <label htmlFor="remote-opt" className="text-sm font-bold text-slate-700">Prioritize Remote Opportunities</label>
                    </div>

                    <div className="p-4 bg-emerald-50 border border-emerald-100 rounded-2xl flex gap-3 items-start">
                        <div className="mt-0.5"><SparkleIcon className="w-4 h-4 text-emerald-600" /></div>
                        <p className="text-xs font-medium text-emerald-800 leading-relaxed">
                            Verified notifications will be dispatched to <span className="font-bold">{userEmail || 'your profile email'}</span> as soon as matching high-value vacancies are discovered.
                        </p>
                    </div>
                </div>

                <div className="p-8 pt-0 flex gap-3">
                    <button 
                        onClick={onClose}
                        className="flex-1 py-4 text-xs font-black uppercase tracking-widest text-slate-500 hover:text-slate-700 transition-colors"
                    >
                        Dismiss
                    </button>
                    <button 
                        onClick={handleSave}
                        disabled={isSaving || !role.trim()}
                        className="flex-2 px-10 py-4 bg-slate-900 text-white font-black uppercase tracking-widest text-[10px] rounded-2xl hover:bg-slate-800 transition-all shadow-xl shadow-slate-900/20 disabled:opacity-50 flex items-center justify-center gap-2"
                    >
                        {isSaving ? <div className="w-4 h-4 border-2 border-white/30 border-t-white rounded-full animate-spin" /> : 'Activate Monitoring'}
                    </button>
                </div>
            </motion.div>
        </div>
    );
};

export default JobAlertsModal;
