
import React, { useState, useEffect } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { ResumeData, JobListing } from '../../types';
import { ensureAbsoluteUrl } from '../../utils/url';
import { findMatchingJobs } from '../../services/geminiService';
import { jobService } from '../../services/jobService';
import { auth } from '../../services/firebase';
import { Search, MapPin, Briefcase, Globe, Filter, Sparkles, ExternalLink, TrendingUp, AlertCircle, BookmarkPlus, CheckCircle2, Zap } from 'lucide-react';
import AIProcessingState from './AIProcessingState';
import { GoogleJob } from '../../services/googleJobsService';
import { toast } from 'sonner';
import { JobSearchLoadingState } from './JobSearchLoadingState';

interface JobFinderPanelProps {
    resumeData: ResumeData;
}

const JobFinderPanel: React.FC<JobFinderPanelProps> = ({ resumeData }) => {
    const [jobs, setJobs] = useState<JobListing[]>([]);
    const [marketSummary, setMarketSummary] = useState('');
    const [loading, setLoading] = useState(false);
    const [location, setLocation] = useState(resumeData.contactInfo.location || 'Remote');
    const [searchQuery, setSearchQuery] = useState(resumeData.title || '');
    const [error, setError] = useState<string | null>(null);
    const [savedJobIds, setSavedJobIds] = useState<Set<string>>(new Set());
    const [showFilters, setShowFilters] = useState(false);
    const [filters, setFilters] = useState({
        experienceLevel: '',
        employmentType: '',
        remoteOption: '',
        datePosted: ''
    });

    const experienceLevels = ['Fresher', 'Junior', 'Mid-Level', 'Senior', 'Lead/Manager'];
    const employmentTypes = ['Full-time', 'Contract', 'Internship'];
    const remoteOptions = ['Fully Remote', 'Hybrid', 'On-site'];
    const dateOptions = [
        { label: 'Last 24 Hours', value: '24h' },
        { label: 'Last 3 Days', value: '3d' },
        { label: 'Last 7 Days', value: '7d' },
        { label: 'Last 30 Days', value: '30d' }
    ];

    // Subscribe to jobs to keep saved state in sync
    useEffect(() => {
        if (!auth.currentUser) return;
        
        const unsubscribe = jobService.subscribeToJobs((existingJobs) => {
            const savedLinks = new Set(existingJobs.map(j => j.link).filter(Boolean) as string[]);
            setSavedJobIds(savedLinks);
        });
        
        return () => unsubscribe();
    }, []);

    const handleSearch = async () => {
        if (!searchQuery.trim()) return;
        
        setLoading(true);
        setError(null);
        try {
            const result = await findMatchingJobs(resumeData, location, searchQuery, filters);
            setJobs(result.jobs);
            setMarketSummary(result.marketSummary);
            if (result.jobs.length === 0) {
                setError("No jobs found matching your criteria. Try broadening your search or location.");
            }
        } catch (err) {
            console.error("Job search failed:", err);
            setError("Something went wrong while searching for jobs. Please try again.");
        } finally {
            setLoading(false);
        }
    };

    const handleSaveJob = async (job: JobListing) => {
        if (!auth.currentUser) {
            toast.error("Please sign in to save jobs to your board.");
            return;
        }

        try {
            await jobService.createJob({
                company: job.company,
                role: job.role,
                status: 'Saved',
                dateAdded: new Date().toLocaleDateString(),
                link: job.link,
                location: job.location,
                salary: job.salary,
                notes: job.summary,
                jobDescription: job.summary,
                source: job.platform || 'AI Search'
            });
            setSavedJobIds(prev => new Set(prev).add(job.link));
            toast.success(`Saved ${job.role} at ${job.company} to your board!`);
        } catch (err) {
            console.error("Failed to save job:", err);
            toast.error("Failed to save job. Please try again.");
        }
    };

    // Initial search
    useEffect(() => {
        if (resumeData.title && jobs.length === 0 && !loading) {
            handleSearch();
        }
    }, []);

    const handleKeyDown = (e: React.KeyboardEvent) => {
        if (e.key === 'Enter') {
            handleSearch();
        }
    };

    return (
        <div className="space-y-6">
            <div className="bg-white p-6 sm:p-8 rounded-3xl border border-slate-200/60 shadow-sm space-y-6">
                <div className="flex items-center gap-3 mb-2">
                    <div className="p-3 bg-gradient-to-br from-indigo-50 to-blue-50 border border-indigo-100/50 rounded-xl text-indigo-600 shadow-sm relative overflow-hidden">
                        <div className="absolute inset-0 bg-blue-400/10 blur-xl"></div>
                        <Search className="w-5 h-5 relative z-10" />
                    </div>
                    <div>
                        <h3 className="text-xl font-bold text-slate-900 tracking-tight">Smart Job Search</h3>
                        <p className="text-[14px] text-slate-500">Find real-time opportunities tailored to your resume.</p>
                    </div>
                </div>

                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                    <div className="space-y-2">
                        <label className="text-[13px] font-semibold text-slate-700 ml-1">Job Title / Keywords</label>
                        <div className="relative group">
                            <Briefcase className="absolute left-4 top-1/2 -translate-y-1/2 w-4 h-4 text-slate-400 group-focus-within:text-indigo-500 transition-colors" />
                            <input 
                                type="text" 
                                value={searchQuery} 
                                onChange={(e) => setSearchQuery(e.target.value)}
                                onKeyDown={handleKeyDown}
                                placeholder="e.g. Senior Product Designer"
                                className="w-full pl-11 pr-4 py-3 bg-slate-50 hover:bg-slate-100/50 border border-slate-200/60 rounded-2xl text-[14px] text-slate-900 focus:bg-white focus:ring-4 focus:ring-indigo-500/10 focus:border-indigo-500 transition-all outline-none"
                            />
                        </div>
                    </div>
                    <div className="space-y-2">
                        <label className="text-[13px] font-semibold text-slate-700 ml-1">Location</label>
                        <div className="relative group">
                            <MapPin className="absolute left-4 top-1/2 -translate-y-1/2 w-4 h-4 text-slate-400 group-focus-within:text-indigo-500 transition-colors" />
                            <input 
                                type="text" 
                                value={location} 
                                onChange={(e) => setLocation(e.target.value)}
                                onKeyDown={handleKeyDown}
                                placeholder="e.g. Remote, San Francisco"
                                className="w-full pl-11 pr-4 py-3 bg-slate-50 hover:bg-slate-100/50 border border-slate-200/60 rounded-2xl text-[14px] text-slate-900 focus:bg-white focus:ring-4 focus:ring-indigo-500/10 focus:border-indigo-500 transition-all outline-none"
                            />
                        </div>
                    </div>
                </div>

                <div className="pt-2">
                    <button 
                        onClick={() => setShowFilters(!showFilters)}
                        className="flex items-center gap-2 text-[13px] font-medium text-slate-500 hover:text-indigo-600 transition-colors"
                    >
                        <Filter className={`w-4 h-4 ${showFilters ? 'text-indigo-600' : ''}`} />
                        {showFilters ? 'Hide Advanced Filters' : 'Show Advanced Filters'}
                    </button>

                    <AnimatePresence>
                        {showFilters && (
                            <motion.div 
                                initial={{ height: 0, opacity: 0 }}
                                animate={{ height: 'auto', opacity: 1 }}
                                exit={{ height: 0, opacity: 0 }}
                                className="overflow-hidden"
                            >
                                <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4 pt-4">
                                    <div className="space-y-1.5">
                                        <label className="text-[12px] font-medium text-slate-600 ml-1">Experience</label>
                                        <select 
                                            value={filters.experienceLevel}
                                            onChange={(e) => setFilters(prev => ({ ...prev, experienceLevel: e.target.value }))}
                                            className="w-full px-4 py-2 bg-slate-50 border border-slate-200/60 rounded-xl text-[13px] text-slate-900 focus:bg-white focus:ring-2 focus:ring-indigo-500/20 outline-none transition-all appearance-none cursor-pointer"
                                        >
                                            <option value="">Any Level</option>
                                            {experienceLevels.map(level => (
                                                <option key={level} value={level}>{level}</option>
                                            ))}
                                        </select>
                                    </div>
                                    <div className="space-y-1.5">
                                        <label className="text-[12px] font-medium text-slate-600 ml-1">Type</label>
                                        <select 
                                            value={filters.employmentType}
                                            onChange={(e) => setFilters(prev => ({ ...prev, employmentType: e.target.value }))}
                                            className="w-full px-4 py-2 bg-slate-50 border border-slate-200/60 rounded-xl text-[13px] text-slate-900 focus:bg-white focus:ring-2 focus:ring-indigo-500/20 outline-none transition-all appearance-none cursor-pointer"
                                        >
                                            <option value="">Any Type</option>
                                            {employmentTypes.map(type => (
                                                <option key={type} value={type}>{type}</option>
                                            ))}
                                        </select>
                                    </div>
                                    <div className="space-y-1.5">
                                        <label className="text-[12px] font-medium text-slate-600 ml-1">Remote</label>
                                        <select 
                                            value={filters.remoteOption}
                                            onChange={(e) => setFilters(prev => ({ ...prev, remoteOption: e.target.value }))}
                                            className="w-full px-4 py-2 bg-slate-50 border border-slate-200/60 rounded-xl text-[13px] text-slate-900 focus:bg-white focus:ring-2 focus:ring-indigo-500/20 outline-none transition-all appearance-none cursor-pointer"
                                        >
                                            <option value="">Any Option</option>
                                            {remoteOptions.map(opt => (
                                                <option key={opt} value={opt}>{opt}</option>
                                            ))}
                                        </select>
                                    </div>
                                    <div className="space-y-1.5">
                                        <label className="text-[12px] font-medium text-slate-600 ml-1">Posted</label>
                                        <select 
                                            value={filters.datePosted}
                                            onChange={(e) => setFilters(prev => ({ ...prev, datePosted: e.target.value }))}
                                            className="w-full px-4 py-2 bg-slate-50 border border-slate-200/60 rounded-xl text-[13px] text-slate-900 focus:bg-white focus:ring-2 focus:ring-indigo-500/20 outline-none transition-all appearance-none cursor-pointer"
                                        >
                                            <option value="">Any Time</option>
                                            {dateOptions.map(opt => (
                                                <option key={opt.value} value={opt.value}>{opt.label}</option>
                                            ))}
                                        </select>
                                    </div>
                                </div>
                            </motion.div>
                        )}
                    </AnimatePresence>
                </div>

                <button 
                    onClick={handleSearch}
                    disabled={loading || !searchQuery.trim()}
                    className="w-full py-3.5 bg-gradient-to-r from-indigo-600 to-blue-600 text-white font-medium text-[15px] rounded-2xl hover:from-indigo-700 hover:to-blue-700 shadow-md shadow-indigo-500/20 transition-all active:scale-[0.98] disabled:opacity-50 flex items-center justify-center gap-2 relative overflow-hidden group"
                >
                    <div className="absolute inset-0 bg-white/20 translate-y-full group-hover:translate-y-0 transition-transform duration-300 ease-out" />
                    {loading ? (
                        <>
                            <div className="w-4 h-4 border-2 border-white/30 border-t-white rounded-full animate-spin relative z-10" />
                            <span className="relative z-10">Searching...</span>
                        </>
                    ) : (
                        <>
                            <span className="relative z-10 flex items-center gap-2">
                                <Sparkles className="w-4 h-4" />
                                Find Matching Jobs
                            </span>
                        </>
                    )}
                </button>
            </div>

            <AnimatePresence mode="wait">
                {loading && <JobSearchLoadingState key="loading" />}
                
                {error ? (
                    <motion.div 
                        initial={{ opacity: 0, y: 10 }}
                        animate={{ opacity: 1, y: 0 }}
                        className="p-6 bg-red-50 rounded-2xl border border-red-100 text-center space-y-3"
                    >
                        <div className="w-10 h-10 bg-red-100 rounded-full flex items-center justify-center mx-auto">
                            <AlertCircle className="w-5 h-5 text-red-500" />
                        </div>
                        <p className="text-[14px] text-red-600 font-medium max-w-xs mx-auto">{error}</p>
                    </motion.div>
                ) : jobs.length > 0 ? (
                    <motion.div 
                        initial={{ opacity: 0 }}
                        animate={{ opacity: 1 }}
                        className="space-y-4"
                    >
                        {marketSummary && (
                            <div className="p-5 bg-gradient-to-r from-blue-50/80 to-indigo-50/80 rounded-2xl border border-blue-100 flex gap-4 items-start relative overflow-hidden backdrop-blur-sm">
                                <div className="absolute top-0 right-0 w-32 h-32 bg-blue-400/10 blur-3xl rounded-full"></div>
                                <div className="p-2.5 bg-white/80 rounded-xl text-blue-600 shadow-sm border border-blue-200/50 backdrop-blur-md relative z-10">
                                    <TrendingUp className="w-4 h-4" />
                                </div>
                                <div className="relative z-10">
                                    <h4 className="text-[13px] font-bold text-slate-800 mb-0.5 tracking-wide uppercase">Market Intelligence</h4>
                                    <p className="text-[14px] text-slate-600 leading-relaxed font-medium">{marketSummary}</p>
                                </div>
                            </div>
                        )}

                        <div className="grid grid-cols-1 gap-4">
                            {jobs.map((job, index) => (
                                <motion.div 
                                    key={job.id}
                                    initial={{ opacity: 0, y: 15 }}
                                    animate={{ opacity: 1, y: 0 }}
                                    transition={{ delay: index * 0.05, ease: "easeOut" }}
                                    className="group bg-white p-5 rounded-2xl border border-slate-200 shadow-sm hover:shadow-xl hover:shadow-indigo-500/5 hover:border-indigo-200 transition-all duration-300 flex flex-col sm:flex-row sm:items-center justify-between gap-5 relative overflow-hidden"
                                >
                                    <div className="absolute inset-0 bg-gradient-to-r from-indigo-500/[0.02] to-transparent opacity-0 group-hover:opacity-100 transition-opacity"></div>
                                    <div className="flex gap-4 items-start relative z-10 w-full sm:w-auto">
                                        <div className="w-12 h-12 bg-gradient-to-br from-slate-50 to-slate-100 rounded-2xl flex items-center justify-center text-slate-600 font-bold text-[18px] border border-slate-200/50 shadow-sm group-hover:scale-105 transition-transform shrink-0">
                                            {job.company.charAt(0)}
                                        </div>
                                        <div className="flex-1 min-w-0">
                                            <div className="flex flex-wrap items-center gap-2 mb-1">
                                                <h4 className="font-bold text-slate-900 text-[16px] truncate max-w-full">{job.role}</h4>
                                                <span className="px-2 py-0.5 bg-indigo-50 border border-indigo-100 text-indigo-700 rounded-md text-[11px] font-bold tracking-wide flex items-center gap-1 shadow-sm shrink-0">
                                                    <Sparkles className="w-3 h-3 text-indigo-500" />
                                                    {job.matchScore}% Match
                                                </span>
                                            </div>
                                            <div className="flex items-center gap-1.5 text-[13px] text-slate-500 mb-2 font-medium bg-slate-50 w-fit px-2.5 py-0.5 rounded-md border border-slate-100">
                                                <Briefcase className="w-3.5 h-3.5 text-slate-400" />
                                                <span className="truncate max-w-[120px] sm:max-w-xs">{job.company}</span>
                                                <span className="text-slate-300">•</span>
                                                <MapPin className="w-3.5 h-3.5 text-slate-400" />
                                                <span className="truncate max-w-[100px] sm:max-w-[150px]">{job.location}</span>
                                            </div>
                                            <p className="text-[13px] text-slate-600 line-clamp-2 max-w-2xl leading-relaxed">{job.summary}</p>
                                        </div>
                                    </div>
                                    <div className="flex items-center gap-2 w-full sm:w-auto mt-2 sm:mt-0 relative z-10 shrink-0">
                                        <button
                                            onClick={() => handleSaveJob(job)}
                                            disabled={savedJobIds.has(job.link)}
                                            className={`flex-1 sm:flex-none px-4 py-2.5 rounded-xl text-[13px] font-bold transition-all flex items-center justify-center gap-2 ${
                                                savedJobIds.has(job.link)
                                                ? 'bg-slate-50 text-slate-400 border border-slate-200/60 cursor-default shadow-inner'
                                                : 'bg-white border border-slate-200 text-slate-700 hover:bg-indigo-50 hover:text-indigo-700 hover:border-indigo-200 shadow-sm hover:shadow'
                                            }`}
                                        >
                                            {savedJobIds.has(job.link) ? (
                                                <>
                                                    <CheckCircle2 className="w-4 h-4" />
                                                    Saved
                                                </>
                                            ) : (
                                                <>
                                                    <BookmarkPlus className="w-4 h-4" />
                                                    Save
                                                </>
                                            )}
                                        </button>
                                        <a 
                                            href={ensureAbsoluteUrl(job.link)} 
                                            target="_blank" 
                                            rel="noopener noreferrer" 
                                            className="flex-1 sm:flex-none px-5 py-2.5 bg-slate-900 hover:bg-indigo-600 text-white rounded-xl text-[13px] font-bold transition-all flex items-center justify-center gap-2 shadow-sm shadow-slate-900/10 hover:shadow-indigo-500/25"
                                        >
                                            Apply
                                            <ExternalLink className="w-3.5 h-3.5" />
                                        </a>
                                    </div>
                                </motion.div>
                            ))}
                        </div>
                    </motion.div>
                ) : (
                    <div className="p-12 bg-white border border-slate-200/60 rounded-3xl text-center shadow-sm relative overflow-hidden flex flex-col items-center">
                        <div className="absolute inset-x-0 -top-24 h-48 bg-gradient-to-b from-indigo-50/50 to-transparent pointer-events-none"></div>
                        <div className="w-20 h-20 bg-gradient-to-br from-slate-50 to-indigo-50/30 rounded-full flex items-center justify-center mb-4 border border-indigo-100/50 relative">
                            <div className="absolute inset-0 bg-indigo-400/5 blur-xl rounded-full"></div>
                            <Globe className="w-8 h-8 text-indigo-300 relative z-10" />
                            <Search className="w-4 h-4 text-slate-600 absolute bottom-4 right-4 z-10" />
                        </div>
                        <h4 className="text-xl font-bold text-slate-900 mb-2">Ready to search?</h4>
                        <p className="text-[14px] text-slate-500 max-w-sm">Tap the button above to scour thousands of listings and find your next opportunity.</p>
                    </div>
                )}
            </AnimatePresence>
        </div>
    );
};

export default JobFinderPanel;
