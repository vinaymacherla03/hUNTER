
import React, { useState, useEffect, useCallback } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { JobApplication, ResumeData, JobListing, JobAlert } from '../../types';
import SparkleIcon from '../icons/SparkleIcon';
import { JobService } from '../../services/jobService';
import { LogoBlock3D } from '../SocialProof';
import ScheduleInterviewModal from './ScheduleInterviewModal';
import SmartApplyModal from './SmartApplyModal';
import JobNotebook from './JobNotebook';
import JobAlertsModal from './JobAlertsModal';
import IntegrationsModal from './IntegrationsModal';
import { getDetailedRecommendations } from '../../services/geminiService';
import { CalendarService } from '../../services/calendarService';

interface JobTrackerProps {
    resumeData: ResumeData;
    initialTab?: 'board' | 'discover' | 'alerts';
}

const getLogoUrl = (company: string) => {
    return `https://logo.clearbit.com/${company.toLowerCase().replace(/\s/g, '')}.com`;
};

const JobSearchResultCard: React.FC<{ job: JobListing; onSave: (job: JobListing) => void }> = ({ job, onSave }) => {
    const [saved, setSaved] = useState(false);

    const handleSave = () => {
        onSave(job);
        setSaved(true);
        setTimeout(() => setSaved(false), 2000);
    };

    return (
        <motion.div 
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            whileHover={{ y: -8 }}
            className="bg-white p-6 sm:p-8 rounded-[2.5rem] border border-slate-100 shadow-xl shadow-slate-200/40 hover:shadow-2xl hover:shadow-emerald-500/10 transition-all duration-500 group cursor-pointer flex flex-col h-full relative overflow-hidden"
        >
            <div className="flex justify-between items-start mb-8">
                <div className="w-16 h-16 bg-slate-50 rounded-2xl flex items-center justify-center text-slate-900 font-black text-2xl border border-slate-100 group-hover:bg-emerald-50 group-hover:text-emerald-600 group-hover:border-emerald-100 transition-all duration-500 overflow-hidden">
                    {job.companyLogo ? (
                        <img src={job.companyLogo} alt={job.company} className="w-full h-full object-cover" referrerPolicy="no-referrer" />
                    ) : (
                        job.company.charAt(0)
                    )}
                </div>
                <div className="flex flex-col items-end gap-2">
                    <span className="px-3 py-1 bg-slate-900 text-white text-[10px] font-black uppercase tracking-widest rounded-full">
                        {job.type || 'Full-time'}
                    </span>
                    {job.isRemote && (
                        <span className="px-3 py-1 bg-emerald-50 text-emerald-600 text-[10px] font-black uppercase tracking-widest rounded-full">
                            Remote
                        </span>
                    )}
                </div>
            </div>
            
            <div className="flex-1">
                <h4 className="font-black text-slate-900 text-xl sm:text-2xl mb-2 line-clamp-2 group-hover:text-emerald-600 transition-colors leading-tight">{job.role}</h4>
                <p className="text-sm font-bold text-slate-400 mb-8">{job.company}</p>
                
                <div className="space-y-4 mb-8">
                    <div className="flex items-center gap-3 text-slate-500">
                        <div className="w-8 h-8 rounded-xl bg-slate-50 flex items-center justify-center text-slate-400 group-hover:bg-emerald-50 group-hover:text-emerald-500 transition-colors">
                            <svg className="w-4 h-4" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2.5}><path strokeLinecap="round" strokeLinejoin="round" d="M17.657 16.657L13.414 20.9a1.998 1.998 0 01-2.827 0l-4.244-4.243a8 8 0 1111.314 0z" /><path strokeLinecap="round" strokeLinejoin="round" d="M15 11a3 3 0 11-6 0 3 3 0 016 0z" /></svg>
                        </div>
                        <span className="text-sm font-bold">{job.location}</span>
                    </div>
                    {job.salary && (
                        <div className="flex items-center gap-3 text-slate-500">
                            <div className="w-8 h-8 rounded-xl bg-slate-50 flex items-center justify-center text-slate-400 group-hover:bg-emerald-50 group-hover:text-emerald-500 transition-colors">
                                <svg className="w-4 h-4" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2.5}><path strokeLinecap="round" strokeLinejoin="round" d="M12 8c-1.657 0-3 .895-3 2s1.343 2 3 2 3 .895 3 2-1.343 2-3 2m0-8c1.11 0 2.08.402 2.599 1M12 8V7m0 1v8m0 0v1m0-1c-1.11 0-2.08-.402-2.599-1M21 12a9 9 0 11-18 0 9 9 0 0118 0z" /></svg>
                            </div>
                            <span className="text-sm font-bold text-slate-900">{job.salary}</span>
                        </div>
                    )}
                </div>
            </div>

            <div className="flex items-center gap-3 pt-6 border-t border-slate-50 mt-auto">
                <button 
                    onClick={(e) => {
                        e.stopPropagation();
                        handleSave();
                    }}
                    disabled={saved}
                    className={`flex-1 py-4 text-xs font-black uppercase tracking-[0.2em] rounded-2xl transition-all active:scale-95 shadow-lg ${
                        saved ? 'bg-emerald-500 text-white shadow-emerald-500/20' : 'bg-slate-900 text-white hover:bg-emerald-600 shadow-slate-900/10'
                    }`}
                >
                    {saved ? 'Saved!' : 'Quick Save'}
                </button>
                <a 
                    href={job.link} 
                    target="_blank" 
                    rel="noopener noreferrer"
                    onClick={(e) => e.stopPropagation()}
                    className="w-12 h-12 rounded-2xl bg-slate-50 flex items-center justify-center text-slate-400 hover:bg-emerald-50 hover:text-emerald-600 transition-all border border-slate-100"
                >
                    <svg className="w-5 h-5" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2.5}><path strokeLinecap="round" strokeLinejoin="round" d="M10 6H6a2 2 0 00-2 2v10a2 2 0 002 2h10a2 2 0 002-2v-4M14 4h6m0 0v6m0-6L10 14" /></svg>
                </a>
            </div>
        </motion.div>
    );
};

const JobTracker: React.FC<JobTrackerProps> = ({ resumeData, initialTab = 'board' }) => {
    const [activeTab, setActiveTab] = useState(initialTab);
    const [jobs, setJobs] = useState<JobApplication[]>([]);
    const [selectedJob, setSelectedJob] = useState<JobApplication | null>(null);
    const [discoveredJobs, setDiscoveredJobs] = useState<JobListing[]>([]);
    const [jobAlerts, setJobAlerts] = useState<JobAlert[]>([]);
    const [recommendedRoles, setRecommendedRoles] = useState<{ role: string; why: string }[]>([]);
    const [isSearching, setIsSearching] = useState(false);
    const [isRecommending, setIsRecommending] = useState(false);
    const [isSyncing, setIsSyncing] = useState(false);
    const [showAlertModal, setShowAlertModal] = useState(false);
    const [showIntegrationsModal, setShowIntegrationsModal] = useState(false);
    const [query, setQuery] = useState(resumeData.title || '');
    const [location, setLocation] = useState(resumeData.contactInfo.location || '');

    const handleSyncGoogle = async () => {
        setIsSyncing(true);
        try {
            const isConnected = await CalendarService.isConnected();
            if (!isConnected) {
                setShowIntegrationsModal(true);
                setIsSyncing(false);
                return;
            }
            const syncedJobs = await CalendarService.syncJobs();
            if (syncedJobs && syncedJobs.length > 0) {
                // Merge with existing jobs, avoiding exact duplicates by company and role
                const existingKeys = new Set(jobs.map(j => `${j.company.toLowerCase()}-${j.role.toLowerCase()}`));
                const newJobs = syncedJobs.filter((j: any) => !existingKeys.has(`${j.company.toLowerCase()}-${j.role.toLowerCase()}`)).map((j: any, idx: number) => ({
                    id: `google-${Date.now()}-${idx}`,
                    company: j.company,
                    role: j.role,
                    status: j.status,
                    dateAdded: j.dateAdded,
                    source: j.source
                }));
                if (newJobs.length > 0) {
                    saveJobs([...newJobs, ...jobs]);
                }
            }
        } catch (e) {
            console.error("Sync failed", e);
            alert("Failed to sync with Google. Please try reconnecting.");
        } finally {
            setIsSyncing(false);
        }
    };

    // Fetch recommendations on mount or when resume changes
    useEffect(() => {
        const fetchRecs = async () => {
            setIsRecommending(true);
            try {
                const recs = await getDetailedRecommendations(resumeData);
                setRecommendedRoles(recs);
            } catch (err) {
                console.error("Recs failed", err);
            } finally {
                setIsRecommending(false);
            }
        };
        fetchRecs();
    }, [resumeData]);

    // Load alerts and jobs
    useEffect(() => {
        const savedAlerts = localStorage.getItem('huntdesk_job_alerts');
        if (savedAlerts) {
            try {
                setJobAlerts(JSON.parse(savedAlerts));
            } catch (e) {
                console.error("Failed to parse alerts", e);
            }
        }
        const savedJobs = localStorage.getItem('huntdesk_saved_jobs');
        if (savedJobs) {
            try {
                setJobs(JSON.parse(savedJobs));
            } catch (e) {
                console.error("Failed to parse jobs", e);
            }
        }
    }, []);

    const performSearch = async (sQuery: string, sLocation: string) => {
        setIsSearching(true);
        try {
            const result = await JobService.search(resumeData, { 
                query: sQuery, location: sLocation, filters: { remote: false, salary: '', experience: '' } 
            });
            setDiscoveredJobs(result.jobs);
        } catch (err) {
            console.error(err);
        } finally {
            setIsSearching(false);
        }
    };

    const handleSearch = (e?: React.FormEvent) => {
        e?.preventDefault();
        performSearch(query, location);
    };

    const handleQuickAction = (role: string) => {
        setQuery(role);
        performSearch(role, location);
    };

    const saveAlerts = (newAlerts: JobAlert[]) => {
        setJobAlerts(newAlerts);
        localStorage.setItem('huntdesk_job_alerts', JSON.stringify(newAlerts));
    };

    const saveJobs = (newJobs: JobApplication[]) => {
        setJobs(newJobs);
        localStorage.setItem('huntdesk_saved_jobs', JSON.stringify(newJobs));
    };

    const handleSaveJob = (job: JobListing) => {
        const newJob: JobApplication = {
            id: `saved-${Date.now()}`, company: job.company, role: job.role, status: 'Saved',
            dateAdded: 'Just now', location: job.location, link: job.link, jobDescription: job.summary
        };
        saveJobs([newJob, ...jobs]);
    };

    const handleDeleteJob = (id: string) => {
        const newJobs = jobs.filter(j => j.id !== id);
        saveJobs(newJobs);
    };

    const handleDeleteAlert = (id: string) => {
        const newAlerts = jobAlerts.filter(a => a.id !== id);
        saveAlerts(newAlerts);
    };

    const handleAddAlert = (alert: JobAlert) => {
        saveAlerts([...jobAlerts, alert]);
    };

    return (
        <div className="h-full flex flex-col font-sans bg-slate-50/50">
            <div className="px-4 sm:px-6 py-4 bg-white border-b border-slate-200 flex justify-between items-center shrink-0">
                <div className="flex gap-1 bg-slate-100 p-1 rounded-xl">
                    <button onClick={() => setActiveTab('board')} className={`px-4 sm:px-6 py-2 rounded-lg text-[9px] sm:text-[10px] font-black uppercase tracking-widest transition-all ${activeTab === 'board' ? 'bg-white text-slate-900 shadow-md' : 'text-slate-500 hover:text-slate-700'}`}>Pipeline</button>
                    <button onClick={() => setActiveTab('discover')} className={`px-4 sm:px-6 py-2 rounded-lg text-[9px] sm:text-[10px] font-black uppercase tracking-widest transition-all ${activeTab === 'discover' ? 'bg-white text-slate-900 shadow-md' : 'text-slate-500 hover:text-slate-700'}`}>Discover</button>
                    <button onClick={() => setActiveTab('alerts')} className={`px-4 sm:px-6 py-2 rounded-lg text-[9px] sm:text-[10px] font-black uppercase tracking-widest transition-all ${activeTab === 'alerts' ? 'bg-white text-slate-900 shadow-md' : 'text-slate-500 hover:text-slate-700'}`}>Alerts</button>
                </div>
                <button 
                    onClick={() => setShowIntegrationsModal(true)}
                    className="px-4 py-2 bg-slate-900 text-white font-black uppercase tracking-widest text-[10px] rounded-xl hover:bg-slate-800 transition-all shadow-md flex items-center gap-2"
                >
                    <svg className="w-4 h-4" fill="none" viewBox="0 0 24 24" stroke="currentColor"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M13.828 10.172a4 4 0 00-5.656 0l-4 4a4 4 0 105.656 5.656l1.102-1.101m-.758-4.899a4 4 0 005.656 0l4-4a4 4 0 00-5.656-5.656l-1.1 1.1" /></svg>
                    Integrations
                </button>
            </div>

            <div className="flex-1 overflow-hidden relative">
                <AnimatePresence mode="wait">
                    {activeTab === 'alerts' ? (
                        <motion.div key="alerts" initial={{ opacity: 0 }} animate={{ opacity: 1 }} exit={{ opacity: 0 }} className="flex flex-col h-full bg-slate-50/50 overflow-y-auto custom-scrollbar">
                            <div className="max-w-4xl mx-auto w-full p-4 sm:p-8">
                                <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4 mb-8">
                                    <div>
                                        <h2 className="text-2xl font-black text-slate-900 tracking-tight">Job Alerts</h2>
                                        <p className="text-[10px] font-bold text-slate-400 uppercase tracking-widest mt-1">Get notified about new opportunities</p>
                                    </div>
                                    <button 
                                        onClick={() => setShowAlertModal(true)}
                                        className="w-full sm:w-auto px-6 py-3 bg-emerald-600 text-white font-black uppercase tracking-widest text-[10px] rounded-2xl hover:bg-emerald-700 transition-all shadow-xl shadow-emerald-200 flex items-center justify-center gap-2 active:scale-95"
                                    >
                                        <svg className="w-4 h-4" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={3}><path strokeLinecap="round" strokeLinejoin="round" d="M12 4v16m8-8H4" /></svg>
                                        Create New Alert
                                    </button>
                                </div>
                                
                                {jobAlerts.length === 0 ? (
                                    <div className="bg-white border-2 border-dashed border-slate-200 rounded-[2.5rem] p-12 sm:p-20 flex flex-col items-center justify-center text-center group hover:border-emerald-300 transition-all">
                                        <div className="w-20 h-20 bg-slate-50 rounded-full flex items-center justify-center mb-6 group-hover:scale-110 transition-transform duration-500">
                                            <svg className="w-10 h-10 text-slate-300" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={1.5}><path strokeLinecap="round" strokeLinejoin="round" d="M15 17h5l-1.405-1.405A2.032 2.032 0 0118 14.158V11a6.002 6.002 0 00-4-5.659V5a2 2 0 10-4 0v.341C7.67 6.165 6 8.388 6 11v3.159c0 .538-.214 1.055-.595 1.436L4 17h5m6 0v1a3 3 0 11-6 0v-1m6 0H9" /></svg>
                                        </div>
                                        <h3 className="text-lg font-black text-slate-900 uppercase tracking-tight mb-2">No active alerts</h3>
                                        <p className="text-sm font-medium text-slate-500 max-w-xs mx-auto mb-8">We'll scan the web for jobs matching your criteria and notify you instantly.</p>
                                        <button 
                                            onClick={() => setShowAlertModal(true)}
                                            className="text-emerald-600 text-[10px] font-black uppercase tracking-widest hover:underline"
                                        >
                                            Set up your first alert →
                                        </button>
                                    </div>
                                ) : (
                                    <div className="grid gap-4">
                                        {jobAlerts.map(alert => (
                                            <motion.div 
                                                key={alert.id} 
                                                initial={{ opacity: 0, y: 10 }}
                                                animate={{ opacity: 1, y: 0 }}
                                                className="bg-white p-6 rounded-3xl border border-slate-200 shadow-sm flex flex-col sm:flex-row justify-between items-start sm:items-center gap-6 hover:shadow-xl hover:border-emerald-200 transition-all group"
                                            >
                                                <div className="flex gap-5 items-center">
                                                    <div className="w-14 h-14 bg-emerald-50 rounded-2xl flex items-center justify-center text-emerald-600 group-hover:bg-emerald-600 group-hover:text-white transition-all duration-300">
                                                        <svg className="w-7 h-7" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}><path strokeLinecap="round" strokeLinejoin="round" d="M15 17h5l-1.405-1.405A2.032 2.032 0 0118 14.158V11a6.002 6.002 0 00-4-5.659V5a2 2 0 10-4 0v.341C7.67 6.165 6 8.388 6 11v3.159c0 .538-.214 1.055-.595 1.436L4 17h5m6 0v1a3 3 0 11-6 0v-1m6 0H9" /></svg>
                                                    </div>
                                                    <div>
                                                        <div className="flex items-center gap-3 mb-2">
                                                            <h3 className="font-black text-slate-900 text-xl tracking-tight">{alert.role}</h3>
                                                            <span className={`px-3 py-1 rounded-full text-[9px] font-black uppercase tracking-widest border ${
                                                                alert.frequency === 'daily' ? 'bg-emerald-50 text-emerald-700 border-emerald-100' : 
                                                                alert.frequency === 'weekly' ? 'bg-teal-50 text-teal-700 border-teal-100' : 
                                                                'bg-slate-50 text-slate-700 border-slate-100'
                                                            }`}>
                                                                {alert.frequency}
                                                            </span>
                                                        </div>
                                                        <div className="flex flex-wrap gap-4 text-xs font-bold text-slate-400 uppercase tracking-widest">
                                                            {alert.location && (
                                                                <span className="flex items-center gap-1.5">
                                                                    <svg className="w-3.5 h-3.5" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2.5}><path strokeLinecap="round" strokeLinejoin="round" d="M17.657 16.657L13.414 20.9a1.998 1.998 0 01-2.827 0l-4.244-4.243a8 8 0 1111.314 0z" /><path strokeLinecap="round" strokeLinejoin="round" d="M15 11a3 3 0 11-6 0 3 3 0 016 0z" /></svg>
                                                                    {alert.location}
                                                                </span>
                                                            )}
                                                            {alert.filters?.salary && (
                                                                <span className="flex items-center gap-1.5">
                                                                    <svg className="w-3.5 h-3.5 text-emerald-500" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2.5}><path strokeLinecap="round" strokeLinejoin="round" d="M12 8c-1.657 0-3 .895-3 2s1.343 2 3 2 3 .895 3 2-1.343 2-3 2m0-8c1.11 0 2.08.402 2.599 1M12 8V7m0 1v8m0 0v1m0-1c-1.11 0-2.08-.402-2.599-1M21 12a9 9 0 11-18 0 9 9 0 0118 0z" /></svg>
                                                                    ${alert.filters.salary}
                                                                </span>
                                                            )}
                                                            {alert.filters?.remote && (
                                                                <span className="flex items-center gap-1.5 text-emerald-600">
                                                                    <svg className="w-3.5 h-3.5" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2.5}><path strokeLinecap="round" strokeLinejoin="round" d="M21 12a9 9 0 01-9 9m9-9a9 9 0 00-9-9m9 9H3m9 9a9 9 0 01-9-9m9 9c1.657 0 3-4.03 3-9s-1.343-9-3-9m0 18c-1.657 0-3-4.03-3-9s1.343-9 3-9m-9 9a9 9 0 019-9" /></svg>
                                                                    Remote
                                                                </span>
                                                            )}
                                                        </div>
                                                    </div>
                                                </div>
                                                <div className="flex items-center gap-3 w-full sm:w-auto border-t sm:border-t-0 pt-4 sm:pt-0">
                                                    <button 
                                                        onClick={() => handleDeleteAlert(alert.id)}
                                                        className="flex-1 sm:flex-none p-3 text-slate-400 hover:text-rose-500 hover:bg-rose-50 rounded-2xl transition-all flex items-center justify-center gap-2"
                                                        title="Delete Alert"
                                                    >
                                                        <svg className="w-5 h-5" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}><path strokeLinecap="round" strokeLinejoin="round" d="M19 7l-.867 12.142A2 2 0 0116.138 21H7.862a2 2 0 01-1.995-1.858L5 7m5 4v6m4-6v6m1-10V4a1 1 0 00-1-1h-4a1 1 0 00-1 1v3M4 7h16" /></svg>
                                                        <span className="sm:hidden text-[10px] font-black uppercase tracking-widest">Delete</span>
                                                    </button>
                                                </div>
                                            </motion.div>
                                        ))}
                                    </div>
                                )}
                            </div>
                        </motion.div>
                    ) : activeTab === 'discover' ? (
                        <motion.div key="discover" initial={{ opacity: 0 }} animate={{ opacity: 1 }} className="flex flex-col h-full bg-white overflow-hidden">
                            <div className="px-4 sm:px-8 py-8 sm:py-12 bg-slate-50 border-b border-slate-200 relative z-10">
                                <div className="max-w-6xl mx-auto flex flex-col gap-8 sm:gap-10">
                                    
                                    {/* AI Recommendations Header */}
                                    {(recommendedRoles.length > 0 || isRecommending) && (
                                        <div className="space-y-6 relative">
                                            <div className="absolute -left-12 -top-12 w-64 h-64 bg-emerald-500/5 blur-[100px] rounded-full pointer-events-none" />
                                            <div className="flex items-center justify-between relative z-10">
                                                <div className="flex items-center gap-4">
                                                    <div className="w-12 h-12 bg-white rounded-2xl shadow-lg shadow-emerald-500/10 flex items-center justify-center border border-emerald-50">
                                                        <SparkleIcon className="w-6 h-6 text-emerald-600" />
                                                    </div>
                                                    <div>
                                                        <h3 className="text-sm font-black text-slate-900 uppercase tracking-[0.1em]">AI Recommendations</h3>
                                                        <p className="text-[10px] font-bold text-slate-400 uppercase tracking-widest">Personalized for your profile</p>
                                                    </div>
                                                </div>
                                                {isRecommending && (
                                                    <div className="flex items-center gap-2 px-4 py-2 bg-emerald-50 rounded-full">
                                                        <div className="w-2 h-2 bg-emerald-600 rounded-full animate-pulse" />
                                                        <span className="text-[10px] font-black text-emerald-600 uppercase tracking-widest">Thinking...</span>
                                                    </div>
                                                )}
                                            </div>
                                            
                                            <div className="flex overflow-x-auto no-scrollbar gap-4 pb-4 relative z-10">
                                                {isRecommending ? (
                                                    [1, 2, 3, 4].map(i => (
                                                        <div key={i} className="h-16 w-56 shrink-0 bg-white/50 animate-pulse rounded-[1.5rem] border border-slate-100" />
                                                    ))
                                                ) : (
                                                    recommendedRoles.map((rec, i) => (
                                                        <motion.button 
                                                            key={i}
                                                            onClick={() => handleQuickAction(rec.role)}
                                                            initial={{ opacity: 0, y: 10 }}
                                                            animate={{ opacity: 1, y: 0 }}
                                                            transition={{ delay: i * 0.1 }}
                                                            whileHover={{ y: -4, scale: 1.02 }}
                                                            className="shrink-0 px-8 py-5 bg-white border border-slate-100 rounded-[1.5rem] text-xs font-black text-slate-700 uppercase tracking-widest hover:border-emerald-400 hover:text-emerald-600 hover:shadow-2xl hover:shadow-emerald-500/10 transition-all flex items-center gap-4 group shadow-xl shadow-slate-200/40"
                                                        >
                                                            <div className="w-2 h-2 rounded-full bg-emerald-500 group-hover:scale-150 transition-transform shadow-lg shadow-emerald-500/40" />
                                                            {rec.role}
                                                        </motion.button>
                                                    ))
                                                )}
                                            </div>
                                        </div>
                                    )}

                                    <form onSubmit={handleSearch} className="relative group">
                                        <div className="absolute inset-0 bg-emerald-600/5 blur-2xl rounded-full group-focus-within:bg-emerald-600/10 transition-all" />
                                        <div className="relative flex flex-col sm:flex-row gap-3">
                                            <div className="flex-1 relative">
                                                <svg className="absolute left-6 top-1/2 -translate-y-1/2 w-5 h-5 text-slate-400 group-focus-within:text-emerald-600 transition-colors" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2.5}><path strokeLinecap="round" strokeLinejoin="round" d="M21 21l-6-6m2-5a7 7 0 11-14 0 7 7 0 0114 0z" /></svg>
                                                <input 
                                                    type="text" 
                                                    placeholder="Job title, keywords, or company..." 
                                                    value={query}
                                                    onChange={(e) => setQuery(e.target.value)}
                                                    className="w-full pl-16 pr-6 py-5 bg-white border-2 border-slate-100 rounded-[2rem] text-sm font-bold text-slate-900 placeholder:text-slate-400 focus:outline-none focus:border-emerald-500 focus:ring-4 focus:ring-emerald-500/10 transition-all shadow-xl shadow-slate-200/50"
                                                />
                                            </div>
                                            <div className="sm:w-64 relative">
                                                <svg className="absolute left-6 top-1/2 -translate-y-1/2 w-5 h-5 text-slate-400 group-focus-within:text-emerald-600 transition-colors" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2.5}><path strokeLinecap="round" strokeLinejoin="round" d="M17.657 16.657L13.414 20.9a1.998 1.998 0 01-2.827 0l-4.244-4.243a8 8 0 1111.314 0z" /><path strokeLinecap="round" strokeLinejoin="round" d="M15 11a3 3 0 11-6 0 3 3 0 016 0z" /></svg>
                                                <input 
                                                    type="text" 
                                                    placeholder="Location..." 
                                                    value={location}
                                                    onChange={(e) => setLocation(e.target.value)}
                                                    className="w-full pl-16 pr-6 py-5 bg-white border-2 border-slate-100 rounded-[2rem] text-sm font-bold text-slate-900 placeholder:text-slate-400 focus:outline-none focus:border-emerald-500 focus:ring-4 focus:ring-emerald-500/10 transition-all shadow-xl shadow-slate-200/50"
                                                />
                                            </div>
                                            <button 
                                                type="submit"
                                                disabled={isSearching}
                                                className="px-10 py-5 bg-slate-900 text-white font-black uppercase tracking-[0.2em] text-xs rounded-[2rem] hover:bg-emerald-600 transition-all shadow-xl shadow-slate-900/20 active:scale-95 disabled:opacity-50 flex items-center justify-center gap-3"
                                            >
                                                {isSearching ? (
                                                    <svg className="animate-spin w-5 h-5" xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24"><circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4"></circle><path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"></path></svg>
                                                ) : 'Search'}
                                            </button>
                                        </div>
                                    </form>
                                </div>
                            </div>
                            <div className="flex-1 overflow-y-auto p-4 sm:p-8 custom-scrollbar pb-32 sm:pb-8">
                                <div className="max-w-7xl mx-auto grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-4 sm:gap-6">
                                    <AnimatePresence>
                                        {discoveredJobs.map(job => (
                                            <JobSearchResultCard key={job.id} job={job} onSave={handleSaveJob} />
                                        ))}
                                    </AnimatePresence>
                                </div>
                                {discoveredJobs.length === 0 && !isSearching && (
                                    <div className="flex flex-col items-center justify-center py-20 sm:py-32 text-center opacity-40">
                                        <svg className="w-12 h-12 sm:w-16 sm:h-16 text-slate-300 mb-4 sm:mb-6" fill="none" viewBox="0 0 24 24" stroke="currentColor"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1} d="M21 21l-6-6m2-5a7 7 0 11-14 0 7 7 0 0114 0z" /></svg>
                                        <p className="text-base sm:text-xl font-black text-slate-900 uppercase tracking-tighter">Enter criteria to start scanning</p>
                                    </div>
                                )}
                            </div>
                        </motion.div>
                    ) : activeTab === 'board' ? (
                        <div className="flex flex-col h-full">
                                <div className="flex items-center gap-3 px-4 sm:px-8 pt-4 sm:pt-6">
                                    <div className="flex-1">
                                        <h2 className="text-xl font-black text-slate-900 tracking-tight">Application Pipeline</h2>
                                        <p className="text-[10px] font-bold text-slate-400 uppercase tracking-widest mt-1">Track and manage your journey</p>
                                    </div>
                                    <div className="flex gap-2">
                                        <button 
                                            onClick={handleSyncGoogle}
                                            disabled={isSyncing}
                                            className="flex items-center gap-2 px-4 py-2.5 bg-white border border-slate-200 text-slate-700 text-[10px] font-black uppercase tracking-widest rounded-xl hover:bg-slate-50 hover:border-slate-300 transition-all shadow-sm active:scale-95 disabled:opacity-50 disabled:cursor-not-allowed group"
                                        >
                                            {isSyncing ? (
                                                <svg className="animate-spin w-4 h-4 text-slate-500" xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24"><circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4"></circle><path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"></path></svg>
                                            ) : (
                                                <svg className="w-4 h-4 text-blue-500 group-hover:scale-110 transition-transform" viewBox="0 0 24 24" fill="currentColor"><path d="M22.56 12.25c0-.78-.07-1.53-.2-2.25H12v4.26h5.92c-.26 1.37-1.04 2.53-2.21 3.31v2.77h3.57c2.08-1.92 3.28-4.74 3.28-8.09z" /><path fill="#34A853" d="M12 23c2.97 0 5.46-.98 7.28-2.66l-3.57-2.77c-.98.66-2.23 1.06-3.71 1.06-2.86 0-5.29-1.93-6.16-4.53H2.18v2.84C3.99 20.53 7.7 23 12 23z" /><path fill="#FBBC05" d="M5.84 14.09c-.22-.66-.35-1.36-.35-2.09s.13-1.43.35-2.09V7.07H2.18C1.43 8.55 1 10.22 1 12s.43 3.45 1.18 4.93l2.85-2.22.81-.62z" /><path fill="#EA4335" d="M12 5.38c1.62 0 3.06.56 4.21 1.64l3.15-3.15C17.45 2.09 14.97 1 12 1 7.7 1 3.99 3.47 2.18 7.07l3.66 2.84c.87-2.6 3.3-4.53 6.16-4.53z" /></svg>
                                            )}
                                            {isSyncing ? 'Syncing...' : 'Sync Google'}
                                        </button>
                                        <button 
                                            onClick={() => {
                                                const newJob: JobApplication = {
                                                    id: `manual-${Date.now()}`, company: 'New Company', role: 'New Role', status: 'Saved',
                                                    dateAdded: 'Just now'
                                                };
                                                saveJobs([newJob, ...jobs]);
                                            }}
                                            className="flex items-center gap-2 px-4 py-2.5 bg-emerald-600 text-white text-[10px] font-black uppercase tracking-widest rounded-xl hover:bg-emerald-700 transition-all shadow-lg shadow-emerald-200 active:scale-95"
                                        >
                                            <svg className="w-4 h-4" fill="none" viewBox="0 0 24 24" stroke="currentColor"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2.5} d="M12 4v16m8-8H4" /></svg>
                                            Add Job
                                        </button>
                                    </div>
                                </div>
                            <div className="flex gap-4 sm:gap-6 h-full p-4 sm:p-8 overflow-x-auto custom-scrollbar pb-32 sm:pb-8">
                                {[
                                    { label: 'Saved', icon: 'M5 5a2 2 0 012-2h10a2 2 0 012 2v16l-7-3.5L5 21V5z', color: 'emerald' },
                                    { label: 'Applied', icon: 'M12 19l9 2-9-18-9 18 9-2zm0 0v-8', color: 'teal' },
                                    { label: 'Interviewing', icon: 'M19 11a7 7 0 01-7 7m0 0a7 7 0 01-7-7m7 7v4m0 0H8m4 0h4m-4-8a3 3 0 01-3-3V5a3 3 0 116 0v6a3 3 0 01-3 3z', color: 'emerald' },
                                    { label: 'Offer', icon: 'M9 12l2 2 4-4M7.835 4.697a3.42 3.42 0 001.946-.806 3.42 3.42 0 014.438 0 3.42 3.42 0 001.946.806 3.42 3.42 0 013.138 3.138 3.42 3.42 0 00.806 1.946 3.42 3.42 0 010 4.438 3.42 3.42 0 00-.806 1.946 3.42 3.42 0 01-3.138 3.138 3.42 3.42 0 00-1.946.806 3.42 3.42 0 01-4.438 0 3.42 3.42 0 00-1.946-.806 3.42 3.42 0 01-3.138-3.138 3.42 3.42 0 00-.806-1.946 3.42 3.42 0 010-4.438 3.42 3.42 0 00.806-1.946 3.42 3.42 0 013.138-3.138z', color: 'teal' },
                                    { label: 'Rejected', icon: 'M10 14l2-2m0 0l2-2m-2 2l-2-2m2 2l2 2m7-2a9 9 0 11-18 0 9 9 0 0118 0z', color: 'slate' }
                                ].map(status => (
                                    <div key={status.label} className={`flex-shrink-0 w-72 sm:w-80 flex flex-col rounded-2xl sm:rounded-3xl border border-slate-200/60 overflow-hidden bg-slate-50/30`}>
                                        <div className="p-4 sm:p-5 border-b border-slate-200/60 bg-white/80 backdrop-blur-sm flex items-center justify-between sticky top-0 z-10">
                                            <div className="flex items-center gap-2">
                                                <div className={`p-1.5 rounded-lg bg-${status.color}-50 text-${status.color}-600`}>
                                                    <svg className="w-3.5 h-3.5" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2.5}>
                                                        <path strokeLinecap="round" strokeLinejoin="round" d={status.icon} />
                                                    </svg>
                                                </div>
                                                <h3 className="text-xs sm:text-sm font-black text-slate-900 uppercase tracking-widest">{status.label}</h3>
                                            </div>
                                            <span className="text-[10px] font-bold text-slate-500 bg-slate-100 px-2.5 py-1 rounded-full border border-slate-200">{jobs.filter(j => j.status === status.label).length}</span>
                                        </div>
                                        <div className="flex-1 overflow-y-auto p-3 sm:p-4 space-y-3 sm:space-y-4 custom-scrollbar min-h-[400px]">
                                            {jobs.filter(j => j.status === status.label).map(job => (
                                                <motion.div 
                                                    layoutId={job.id} 
                                                    key={job.id} 
                                                    initial={{ opacity: 0, y: 10 }}
                                                    animate={{ opacity: 1, y: 0 }}
                                                    className="bg-white p-4 sm:p-5 rounded-xl sm:rounded-2xl shadow-sm border border-slate-200 hover:shadow-xl hover:border-emerald-400 hover:-translate-y-1 transition-all group cursor-pointer relative overflow-hidden"
                                                    onClick={() => setSelectedJob(job)}
                                                >
                                                    <div className="absolute top-0 left-0 w-1 h-full bg-emerald-500 opacity-0 group-hover:opacity-100 transition-opacity" />
                                                    <div className="flex justify-between items-start mb-3 sm:mb-4">
                                                        <div className="w-8 h-8 sm:w-10 sm:h-10 bg-slate-50 rounded-lg sm:rounded-xl flex items-center justify-center text-slate-900 font-black text-xs sm:text-sm border border-slate-100 group-hover:bg-emerald-50 group-hover:text-emerald-600 transition-colors">
                                                            {job.company.charAt(0)}
                                                        </div>
                                                        <span className={`px-2 py-1 rounded-full text-[8px] font-black uppercase tracking-widest border ${
                                                            job.status === 'Saved' ? 'bg-emerald-50 text-emerald-700 border-emerald-100' :
                                                            job.status === 'Applied' ? 'bg-teal-50 text-teal-700 border-teal-100' :
                                                            job.status === 'Interviewing' ? 'bg-emerald-50 text-emerald-700 border-emerald-100' :
                                                            job.status === 'Offer' ? 'bg-teal-50 text-teal-700 border-teal-100' :
                                                            'bg-slate-50 text-slate-700 border-slate-100'
                                                        }`}>
                                                            {job.status}
                                                        </span>
                                                        <button 
                                                            onClick={(e) => {
                                                                e.stopPropagation();
                                                                handleDeleteJob(job.id);
                                                            }}
                                                            className="text-slate-300 hover:text-rose-500 transition-colors p-1 hover:bg-rose-50 rounded-lg"
                                                        >
                                                            <svg className="w-3.5 h-3.5 sm:w-4 sm:h-4" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2.5}><path strokeLinecap="round" strokeLinejoin="round" d="M19 7l-.867 12.142A2 2 0 0116.138 21H7.862a2 2 0 01-1.995-1.858L5 7m5 4v6m4-6v6m1-10V4a1 1 0 00-1-1h-4a1 1 0 00-1 1v3M4 7h16" /></svg>
                                                        </button>
                                                    </div>
                                                    <h4 className="font-black text-slate-900 text-xs sm:text-sm mb-0.5 sm:mb-1 line-clamp-1 group-hover:text-emerald-600 transition-colors">{job.role}</h4>
                                                    <p className="text-[10px] sm:text-xs text-slate-500 font-bold mb-4 sm:mb-5">{job.company}</p>
                                                    <div className="flex items-center justify-between pt-3 border-t border-slate-50">
                                                        <span className="text-[9px] sm:text-[10px] font-black text-slate-400 uppercase tracking-widest">{job.dateAdded}</span>
                                                        <div className="flex gap-1.5">
                                                            <button 
                                                                onClick={(e) => {
                                                                    e.stopPropagation();
                                                                    setSelectedJob(job);
                                                                }}
                                                                className="w-7 h-7 sm:w-8 sm:h-8 bg-slate-50 text-slate-400 rounded-lg flex items-center justify-center hover:bg-emerald-600 hover:text-white transition-all shadow-sm"
                                                            >
                                                                <SparkleIcon className="w-3.5 h-3.5 sm:w-4 sm:h-4" />
                                                            </button>
                                                        </div>
                                                    </div>
                                                </motion.div>
                                            ))}
                                            {jobs.filter(j => j.status === status.label).length === 0 && (
                                                <div className="h-32 sm:h-40 border-2 border-dashed border-slate-200 rounded-2xl sm:rounded-3xl flex flex-col items-center justify-center p-6 text-center group hover:border-emerald-300 hover:bg-emerald-50/30 transition-all cursor-default">
                                                    <div className="w-10 h-10 rounded-full bg-slate-100 flex items-center justify-center mb-3 group-hover:scale-110 transition-transform">
                                                        <svg className="w-5 h-5 text-slate-300" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}>
                                                            <path strokeLinecap="round" strokeLinejoin="round" d="M12 4v16m8-8H4" />
                                                        </svg>
                                                    </div>
                                                    <span className="text-[9px] sm:text-[10px] font-black text-slate-400 uppercase tracking-[0.2em]">Drop to {status.label}</span>
                                                </div>
                                            )}
                                        </div>
                                    </div>
                                ))}
                            </div>
                        </div>
                    ) : null}
                </AnimatePresence>
            </div>

            <AnimatePresence>
                {showAlertModal && (
                    <JobAlertsModal 
                        onClose={() => setShowAlertModal(false)}
                        onSave={handleAddAlert}
                        initialQuery={query}
                        initialLocation={location}
                        userEmail={resumeData.contactInfo.email}
                    />
                )}
                {showIntegrationsModal && (
                    <IntegrationsModal onClose={() => setShowIntegrationsModal(false)} />
                )}
                {selectedJob && (
                    <JobNotebook 
                        job={selectedJob} 
                        onClose={() => setSelectedJob(null)} 
                        resumeData={resumeData} 
                    />
                )}
            </AnimatePresence>
        </div>
    );
};

export default JobTracker;
