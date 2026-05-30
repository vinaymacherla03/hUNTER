import React, { useState, useContext, useEffect, useRef, useCallback } from 'react';
import { Search, MapPin, Building, Clock, DollarSign, Briefcase, AlertCircle, Loader2, ExternalLink, BarChart3, List, Globe, Zap, CheckCircle2, TrendingUp, Target, Plus, Filter, ChevronDown, X, ArrowRight, Sparkles, BookmarkPlus } from 'lucide-react';
import { GoogleJob, GoogleJobsResponse } from '../services/googleJobsService';
import { JobSearchService } from '../services/jobSearchService';
import { jobService } from '../services/jobService';
import { auth } from '../services/firebase';
import JobVisualization from './JobVisualization';
import JobMap from './JobMap';
import AutoApplyModal from './builder/AutoApplyModal';
import JobCopilot from './JobCopilot';
import { ResumeContext } from './builder/ResumeContext';
import { motion, AnimatePresence } from 'framer-motion';
import { JobSearchFilters } from '../types';

interface JobSearchProps {
  onMatchJob?: (jobDescription: string) => void;
}

const JobSearch: React.FC<JobSearchProps> = ({ onMatchJob }) => {
  const [query, setQuery] = useState('');
  const [location, setLocation] = useState('');
  const [experience, setExperience] = useState('');
  const [filters, setFilters] = useState<JobSearchFilters>({
    experienceLevel: 'Any',
    employmentType: 'Any',
    remoteOption: 'Any',
    datePosted: 'Any'
  });
  const [showFilters, setShowFilters] = useState(false);
  const [jobs, setJobs] = useState<GoogleJob[]>([]);
  const [loading, setLoading] = useState(false);
  const [loadingMore, setLoadingMore] = useState(false);
  const [page, setPage] = useState(1);
  const [hasMore, setHasMore] = useState(true);
  const [hasSearched, setHasSearched] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [totalCount, setTotalCount] = useState<number | null>(null);
  const [viewMode, setViewMode] = useState<'list' | 'insights' | 'map'>('list');
  const [autoApplyJob, setAutoApplyJob] = useState<GoogleJob | null>(null);
  const { resumeData } = useContext(ResumeContext);
  const observer = useRef<IntersectionObserver | null>(null);
  const isInitialMount = useRef(true);
  const [trackedJobIds, setTrackedJobIds] = useState<Set<string>>(new Set());

  // Load tracked jobs to show status
  useEffect(() => {
    isInitialMount.current = false;

    const loadTrackedJobs = async () => {
      if (auth.currentUser) {
        const tracked = await jobService.getJobs();
        setTrackedJobIds(new Set(tracked.map(j => j.id)));
      } else {
        const savedJobs = localStorage.getItem('huntdesk_saved_jobs');
        if (savedJobs) {
          try {
            const parsed = JSON.parse(savedJobs);
            setTrackedJobIds(new Set(parsed.map((j: any) => j.id)));
          } catch (e) { console.error(e); }
        }
      }
    };
    loadTrackedJobs();
  }, []);

  // Auto-populate from resume data if no search has been performed
  useEffect(() => {
    if (!hasSearched && resumeData) {
      let shouldUpdate = false;
      let newQuery = query;
      let newLocation = location;
      let newExperience = experience;

      if (!query && resumeData.title) {
        newQuery = resumeData.title;
        shouldUpdate = true;
      }
      if (!location && resumeData.contactInfo?.location) {
        newLocation = resumeData.contactInfo.location;
        shouldUpdate = true;
      }
      
      if (!experience && resumeData.experience && resumeData.experience.length > 0) {
        let totalYears = 0;
        resumeData.experience.forEach(exp => {
          if (exp.dates) {
            const parts = exp.dates.split('-');
            if (parts.length === 2) {
              const start = new Date(parts[0].trim());
              const endStr = parts[1].trim().toLowerCase();
              const end = (endStr.includes('present') || endStr.includes('current')) ? new Date() : new Date(endStr);
              
              if (!isNaN(start.getTime()) && !isNaN(end.getTime())) {
                 const diffTime = Math.abs(end.getTime() - start.getTime());
                 totalYears += diffTime / (1000 * 60 * 60 * 24 * 365.25);
              }
            }
          }
        });
        const yearsRound = Math.round(totalYears);
        if (yearsRound > 0) {
          if (yearsRound <= 2) {
            newExperience = '0-2 years';
          } else if (yearsRound <= 5) {
            newExperience = '2-5 years';
          } else if (yearsRound <= 10) {
            newExperience = '5-10 years';
          } else {
            newExperience = '10+ years';
          }
          shouldUpdate = true;
        }
      }

      if (shouldUpdate) {
        setQuery(newQuery);
        setLocation(newLocation);
        setExperience(newExperience);
      }
    }
  }, [resumeData, hasSearched, query, location, experience]);

  const loadMore = useCallback(async () => {
    if (loadingMore || !hasMore) return;
    setLoadingMore(true);
    const nextPage = page + 5;
    
    try {
      const searchQuery = experience ? `${query} ${experience} experience` : query;
      const data = await JobSearchService.searchJobs(searchQuery, location, nextPage, filters);
      const newJobs = data.data || [];
      if (newJobs.length === 0) {
        setHasMore(false);
      } else {
        setJobs(prev => {
          const allJobs = [...prev, ...newJobs];
          const uniqueJobsMap = new Map();
          for (const j of allJobs) { if (!uniqueJobsMap.has(j.job_id)) uniqueJobsMap.set(j.job_id, j); }
          return Array.from(uniqueJobsMap.values());
        });
        setPage(nextPage);
      }
    } catch (err) {
      console.error('Load more error:', err);
    } finally {
      setLoadingMore(false);
    }
  }, [loadingMore, hasMore, page, query, location, experience, filters]);

  const lastJobElementRef = useCallback((node: HTMLDivElement | null) => {
    if (loading || loadingMore) return;
    if (observer.current) observer.current.disconnect();
    observer.current = new IntersectionObserver(entries => {
      if (entries[0].isIntersecting && hasMore) {
        loadMore();
      }
    });
    if (node) observer.current.observe(node);
  }, [loading, loadingMore, hasMore, loadMore]);

  const handleSearch = useCallback(async (e?: React.FormEvent) => {
    if (e) e.preventDefault();
    if (!query.trim() && !location.trim()) return;
    
    setLoading(true);
    setError(null);
    setHasSearched(true);
    setPage(1);
    setHasMore(true);
    setTotalCount(null);
    
    try {
      const searchQuery = experience ? `${query} ${experience} experience` : query;
      const data = await JobSearchService.searchJobs(searchQuery, location, 1, filters);
      const fetchedJobs = data.data || [];
      const uniqueJobsMap = new Map();
      for (const j of fetchedJobs) { if (!uniqueJobsMap.has(j.job_id)) uniqueJobsMap.set(j.job_id, j); }
      setJobs(Array.from(uniqueJobsMap.values()));
      if (data.total_count !== undefined) {
        setTotalCount(data.total_count);
      }
      if (!data.data || data.data.length === 0) {
        setHasMore(false);
      }
    } catch (err) {
      console.error('Search error:', err);
      setError('Failed to fetch jobs from multiple sources. Please try again later.');
    } finally {
      setLoading(false);
    }
  }, [query, location, experience, filters]);

  const handleTrackJob = async (job: GoogleJob) => {
    const jobId = job.job_id || `job-${Date.now()}`;
    if (trackedJobIds.has(jobId)) return;

    const jobData = {
      company: job.employer_name,
      role: job.job_title,
      status: 'Saved' as const,
      dateAdded: new Date().toLocaleDateString(),
      location: job.job_location || '',
      salary: formatSalary(job.job_min_salary, job.job_max_salary, job.job_salary_currency) || '',
      link: job.job_apply_link || '',
      jobDescription: job.job_description || '',
      companyLogo: job.employer_logo || '',
      source: 'Google Jobs',
      contacts: [],
      tasks: [],
      notes: ''
    };

    try {
      if (auth.currentUser) {
        await jobService.createJob(jobData);
      } else {
        const savedJobs = localStorage.getItem('huntdesk_saved_jobs');
        const currentJobs = savedJobs ? JSON.parse(savedJobs) : [];
        const newJob = { ...jobData, id: jobId, userId: 'guest' };
        localStorage.setItem('huntdesk_saved_jobs', JSON.stringify([newJob, ...currentJobs]));
      }
      setTrackedJobIds(prev => new Set(prev).add(jobId));
      alert(`Successfully tracking ${job.job_title} at ${job.employer_name}!`);
    } catch (err) {
      console.error('Failed to track job:', err);
      alert('Failed to track job. Please try again.');
    }
  };

  const formatSalary = (min: number | null, max: number | null, currency: string | null) => {
    if (!min && !max) return null;
    const curr = currency || 'USD';
    const format = (num: number) => new Intl.NumberFormat('en-US', { style: 'currency', currency: curr, maximumFractionDigits: 0 }).format(num);
    if (min && max) return `${format(min)} - ${format(max)}`;
    if (min) return `${format(min)}+`;
    if (max) return `Up to ${format(max)}`;
    return null;
  };

  const formatPostedDate = (dateString?: string | null) => {
    if (!dateString) return 'Recently Active';
    try {
      const date = new Date(dateString);
      if (isNaN(date.getTime()) || date.getFullYear() < 2000) return 'Recently Active';
      const now = new Date();
      const diffTime = Math.abs(now.getTime() - date.getTime());
      const diffDays = Math.floor(diffTime / (1000 * 60 * 60 * 24));
      
      if (diffDays === 0) return 'Today';
      if (diffDays === 1) return 'Yesterday';
      if (diffDays < 30) return `${diffDays} days ago`;
      
      const diffMonths = Math.floor(diffDays / 30);
      return `${diffMonths} mo${diffMonths > 1 ? 's' : ''} ago`;
    } catch {
      return 'Recently Active';
    }
  };

  const calculateMatchScore = (job: GoogleJob) => {
    if (!resumeData) return 0;
    const jobText = (job.job_title + ' ' + job.job_description).toLowerCase();
    const skills = resumeData.skills.map(s => s.name.toLowerCase());
    const matches = skills.filter(skill => jobText.includes(skill));
    
    // Base score + skill matches
    let score = 60 + (matches.length * 5);
    
    // Title match bonus
    if (resumeData.title && job.job_title.toLowerCase().includes(resumeData.title.toLowerCase())) {
      score += 15;
    }
    
    return Math.min(score, 99);
  };

  return (
    <div className="flex flex-col h-full w-full bg-[#f8f9fc] rounded-[inherit] overflow-hidden">
      {/* HEADER SECTION */}
      <div className="bg-[#1e1f24] relative px-6 md:px-10 pt-8 pb-16 overflow-hidden flex-shrink-0" style={{ borderTopLeftRadius: 'inherit', borderTopRightRadius: 'inherit' }}>
        
        {/* Background graphic simulation */}
        <div className="absolute right-10 top-0 w-80 h-40 opacity-80 mix-blend-screen pointer-events-none hidden md:block" style={{ backgroundImage: 'linear-gradient(to bottom right, rgba(255,255,255,0.1), transparent)' }}>
            <div className="w-full h-full bg-[url('https://images.unsplash.com/photo-1522071820081-009f0129c71c?ixlib=rb-4.0.3&auto=format&fit=crop&w=500&q=80')] bg-cover bg-center [mask-image:linear-gradient(to_bottom,white,transparent)]"></div>
        </div>

        {/* Top Navbar Simulation */}
        <div className="flex justify-between items-center mb-16 relative z-10">
          <div className="flex items-center text-blue-500">
            <svg viewBox="0 0 24 24" fill="currentColor" className="w-10 h-10">
               <path d="M12 2C6.48 2 2 6.48 2 12s4.48 10 10 10 10-4.48 10-10S17.52 2 12 2zm-1 14.5c-2.52 0-4.5-1.98-4.5-4.505S8.48 7.5 11 7.5c1.03 0 2 .33 2.76.9A4.475 4.475 0 0011.5 6.5C8.98 6.5 7 8.48 7 11s1.98 4.505 4.5 4.505c1.03 0 2-.33 2.76-.9-.76.57-1.73.9-2.76.9z"/>
               <path d="M16.5 6.5c-2.52 0-4.5 1.98-4.5 4.495 0 .7.16 1.36.43 1.96-1.07-1.12-1.74-2.65-1.74-4.36 0-3.32 2.68-6 6-6 1.05 0 2.03.29 2.87.8-.84-.51-1.82-.8-2.87-.8-2.52 0-4.5 1.98-4.5 4.495z"/>
            </svg>
          </div>
          <div className="hidden lg:flex items-center gap-8 text-[13px] font-medium text-gray-400">
            <button className="text-blue-400">Find Jobs</button>
            <button className="hover:text-white transition-colors">Find Talent</button>
            <button className="hover:text-white transition-colors">Upload Job</button>
            <button className="hover:text-white transition-colors">About us</button>
          </div>
          <div className="flex items-center gap-5">
            <button className="text-gray-400 hover:text-white transition-colors relative">
              <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><path d="M18 8A6 6 0 0 0 6 8c0 7-3 9-3 9h18s-3-2-3-9"></path><path d="M13.73 21a2 2 0 0 1-3.46 0"></path></svg>
              <span className="absolute -top-1 -right-1 w-2 h-2 bg-blue-500 rounded-full"></span>
            </button>
            <div className="flex items-center gap-3">
              <span className="text-white text-sm font-medium hidden sm:block">Fintan Cabrera</span>
              <img src="https://ui-avatars.com/api/?name=Fintan+Cabrera&background=0D8ABC&color=fff" alt="Profile" className="w-8 h-8 rounded-full border border-gray-600" />
            </div>
          </div>
        </div>

        {/* Title */}
        <div className="flex items-center gap-3 mb-8 relative z-10">
          <h1 className="text-3xl md:text-[40px] font-medium text-white tracking-tight">Find Your Dream Job Here</h1>
          <svg width="32" height="32" viewBox="0 0 24 24" fill="none" stroke="white" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round"><path d="M12 2v20"></path><path d="M2 12h20"></path></svg>
        </div>

        {/* Search Bar */}
        <div className="bg-white rounded-full p-2 flex items-center md:max-w-4xl shadow-2xl relative z-10 transition-all focus-within:ring-4 focus-within:ring-white/10">
           <div className="flex-1 flex items-center px-4 w-full">
             <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="#9ca3af" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" className="mr-3"><circle cx="11" cy="11" r="8"></circle><line x1="21" y1="21" x2="16.65" y2="16.65"></line></svg>
             <input type="text" value={query} onChange={e => setQuery(e.target.value)} onKeyDown={e => e.key === 'Enter' && handleSearch()} placeholder="Job title or keyword" className="w-full bg-transparent text-gray-800 outline-none text-[15px] font-medium placeholder:text-gray-400" />
           </div>
           
           <div className="w-px h-8 bg-gray-200 hidden md:block"></div>
           
           <div className="flex-1 flex items-center px-4 w-full hidden md:flex">
             <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="#9ca3af" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" className="mr-3"><path d="M21 10c0 7-9 13-9 13s-9-6-9-13a9 9 0 0 1 18 0z"></path><circle cx="12" cy="10" r="3"></circle></svg>
             <input type="text" value={location} onChange={e => setLocation(e.target.value)} onKeyDown={e => e.key === 'Enter' && handleSearch()} placeholder="Add country or city" className="w-full bg-transparent text-gray-800 outline-none text-[15px] font-medium placeholder:text-gray-400" />
           </div>

           <button onClick={() => handleSearch()} disabled={loading} className="bg-[#1a73e8] hover:bg-[#1557b0] active:bg-[#0d47a1] text-white px-8 py-3.5 rounded-full text-[15px] font-medium transition-colors flex items-center justify-center min-w-[120px]">
             {loading ? <Loader2 className="w-4 h-4 animate-spin" /> : 'Search'}
           </button>
        </div>
      </div>

      {/* BODY SECTION */}
      <div className="flex-1 flex flex-col md:flex-row px-6 md:px-10 py-10 gap-10 overflow-hidden h-full relative">
        {loading && (
          <div className="absolute top-0 left-0 w-full h-1 bg-blue-100 overflow-hidden z-50">
            <div className="w-1/3 h-full bg-[#1a73e8] animate-[pulse_1s_ease-in-out_infinite]" />
          </div>
        )}

        {/* Filters Sidebar */}
        <div className={`${showFilters ? 'flex absolute inset-y-0 left-0 right-0 z-40 bg-white p-6 px-8' : 'hidden'} md:relative md:flex md:w-64 md:p-0 md:bg-transparent flex-shrink-0 flex-col gap-8 overflow-y-auto pr-2 custom-scrollbar pb-10`}>
          {showFilters && (
            <div className="flex md:hidden justify-between items-center mb-2">
              <h2 className="text-xl font-bold text-gray-900">Filters</h2>
              <button onClick={() => setShowFilters(false)} className="p-2 hover:bg-gray-100 rounded-full text-gray-500">
                <X className="w-6 h-6" />
              </button>
            </div>
          )}
          <div>
            <div className="flex justify-between items-center mb-4">
              <h3 className="font-semibold text-gray-900 text-[15px]">Job Type</h3>
              <button onClick={() => setFilters({experienceLevel: 'Any', employmentType: 'Any', remoteOption: 'Any', datePosted: 'Any', minSalary: 0, technologies: []})} className="text-xs text-red-500 hover:text-red-600 font-medium tracking-wide">Clear all</button>
            </div>
            <div className="space-y-3">
              {[
                { label: 'Full time', val: 'Full-time' },
                { label: 'Part time', val: 'Part-time' },
                { label: 'Internship', val: 'Internship' },
                { label: 'Project work', val: 'Contract' },
                { label: 'Volunteering', val: 'Volunteer' }
              ].map(type => (
                <label key={type.label} className="flex items-center gap-3 cursor-pointer group">
                  <div className={`w-4 h-4 rounded-[4px] flex flex-shrink-0 items-center justify-center border transition-colors ${filters.employmentType === type.val || (filters.employmentType === 'Any' && (type.label==='Full time' || type.label==='Part time' || type.label==='Project work')) ? 'bg-gray-900 border-gray-900' : 'border-gray-300 bg-white group-hover:border-gray-400'}`}>
                     {(filters.employmentType === type.val || (filters.employmentType === 'Any' && (type.label==='Full time' || type.label==='Part time' || type.label==='Project work'))) && (
                       <svg width="10" height="10" viewBox="0 0 24 24" fill="none" stroke="white" strokeWidth="3" strokeLinecap="round" strokeLinejoin="round"><polyline points="20 6 9 17 4 12"></polyline></svg>
                     )}
                  </div>
                  <span className="text-[13px] text-gray-700 font-medium">{type.label}</span>
                </label>
              ))}
            </div>
          </div>

          <div>
            <div className="flex justify-between items-center mb-4">
              <h3 className="font-semibold text-gray-900 text-[15px]">Remote Preference</h3>
            </div>
             <div className="space-y-3">
              {[
                { label: 'Any', val: 'Any' },
                { label: 'Remote', val: 'Remote' },
                { label: 'On-site', val: 'On-site' },
                { label: 'Hybrid', val: 'Hybrid' }
              ].map(type => (
                <label key={type.label} className="flex items-center gap-3 cursor-pointer group">
                  <div className={`w-4 h-4 rounded-[4px] flex flex-shrink-0 items-center justify-center border transition-colors ${filters.remoteOption === type.val ? 'bg-gray-900 border-gray-900' : 'border-gray-300 bg-white group-hover:border-gray-400'}`}>
                     {(filters.remoteOption === type.val) && (
                       <svg width="10" height="10" viewBox="0 0 24 24" fill="none" stroke="white" strokeWidth="3" strokeLinecap="round" strokeLinejoin="round"><polyline points="20 6 9 17 4 12"></polyline></svg>
                     )}
                  </div>
                  <span className="text-[13px] text-gray-700 font-medium">{type.label}</span>
                  <input type="radio" className="hidden" name="remote" value={type.val} checked={filters.remoteOption === type.val} onChange={() => setFilters({...filters, remoteOption: type.val as any})} />
                </label>
              ))}
            </div>
          </div>

          <div>
            <div className="flex justify-between items-center mb-4">
              <h3 className="font-semibold text-gray-900 text-[15px]">Minimum Salary</h3>
              <span className="text-xs font-semibold text-gray-900 bg-gray-100 px-2 py-1 rounded-md">{filters.minSalary ? `$${filters.minSalary / 1000}k+` : 'Any'}</span>
            </div>
            <div className="px-1">
              <input 
                type="range" 
                min="0" 
                max="250000" 
                step="10000"
                value={filters.minSalary || 0}
                onChange={(e) => setFilters({...filters, minSalary: parseInt(e.target.value)})}
                className="w-full appearance-none bg-gray-200 h-1.5 rounded-full outline-none [&::-webkit-slider-thumb]:appearance-none [&::-webkit-slider-thumb]:w-4 [&::-webkit-slider-thumb]:h-4 [&::-webkit-slider-thumb]:bg-white [&::-webkit-slider-thumb]:border-2 [&::-webkit-slider-thumb]:border-gray-900 [&::-webkit-slider-thumb]:rounded-full cursor-pointer accent-gray-900" 
              />
              <div className="flex justify-between text-[11px] font-semibold text-gray-500 mt-2">
                <span>$0k</span>
                <span>$250k+</span>
              </div>
            </div>
          </div>

          <div>
            <h3 className="font-semibold text-gray-900 text-[15px] mb-4">Experience Level</h3>
            <div className="space-y-3">
              {[
                { label: 'Entry level', count: '392', val: 'Entry' },
                { label: 'Intermediate', count: '124', val: 'Mid' },
                { label: 'Expert', count: '3921', val: 'Senior' }
              ].map(level => (
                <label key={level.label} className="flex flex-1 items-center justify-between cursor-pointer group w-full">
                  <div className="flex items-center gap-3">
                    <div className={`w-4 h-4 rounded-[4px] flex flex-shrink-0 items-center justify-center border transition-colors ${filters.experienceLevel === level.val || (filters.experienceLevel === 'Any' && level.label !== 'Entry level') ? 'bg-gray-900 border-gray-900' : 'border-gray-300 bg-white group-hover:border-gray-400'}`}>
                       {(filters.experienceLevel === level.val || (filters.experienceLevel === 'Any' && level.label !== 'Entry level')) && (
                         <svg width="10" height="10" viewBox="0 0 24 24" fill="none" stroke="white" strokeWidth="3" strokeLinecap="round" strokeLinejoin="round"><polyline points="20 6 9 17 4 12"></polyline></svg>
                       )}
                    </div>
                    <span className="text-[13px] text-gray-700 font-medium">{level.label}</span>
                  </div>
                  <span className="text-[11px] text-gray-400 font-semibold">{level.count}</span>
                  <input type="radio" className="hidden" name="experience" value={level.val} checked={filters.experienceLevel === level.val || (filters.experienceLevel === 'Any' && level.label !== 'Entry level')} onChange={() => setFilters({...filters, experienceLevel: level.val as any})} />
                </label>
              ))}
            </div>
          </div>
          <div>
            <h3 className="font-semibold text-gray-900 text-[15px] mb-4">Specific Technologies</h3>
            <div className="flex flex-col gap-3">
              <div className="relative">
                <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-gray-400" />
                <input 
                  type="text" 
                  placeholder="e.g. React, Python"
                  className="w-full pl-9 pr-4 py-2 bg-gray-50 border border-gray-200 rounded-lg text-[13px] font-medium placeholder:text-gray-400 focus:outline-none focus:border-gray-300 focus:ring-1 focus:ring-gray-300 transition-all"
                  onKeyDown={(e) => {
                    if (e.key === 'Enter' && e.currentTarget.value.trim()) {
                      const newTech = e.currentTarget.value.trim();
                      if (!filters.technologies?.includes(newTech)) {
                        setFilters({
                          ...filters, 
                          technologies: [...(filters.technologies || []), newTech]
                        });
                      }
                      e.currentTarget.value = '';
                    }
                  }}
                />
              </div>
              
              {filters.technologies && filters.technologies.length > 0 && (
                <div className="flex flex-wrap gap-2">
                  {filters.technologies.map(tech => (
                    <span key={tech} className="inline-flex items-center gap-1.5 px-2.5 py-1 bg-blue-50 text-blue-700 rounded-md text-[11px] font-semibold border border-blue-100">
                      {tech}
                      <button 
                        onClick={() => setFilters({
                          ...filters, 
                          technologies: filters.technologies?.filter(t => t !== tech)
                        })}
                        className="text-blue-400 hover:text-blue-700 transition-colors"
                      >
                        <X className="w-3 h-3" />
                      </button>
                    </span>
                  ))}
                </div>
              )}
            </div>
          </div>
        </div>

        {/* Results Area */}
        <div className="flex-1 flex flex-col min-w-0 h-full">
          <div className="flex justify-between items-center mb-6">
            <h2 className="text-[22px] font-semibold text-gray-900 tracking-tight">Recommended jobs</h2>
            <div className="flex items-center gap-2">
              <button 
                onClick={() => setShowFilters(true)} 
                className="md:hidden flex items-center gap-2 px-4 py-2 border border-blue-200 bg-blue-50 text-blue-700 rounded-full text-xs font-semibold cursor-pointer hover:bg-blue-100 transition-colors"
              >
                <Filter className="w-4 h-4" />
                <span>Filters</span>
              </button>
              <div className="flex items-center gap-2 px-4 py-2 border border-gray-200 bg-white rounded-full text-xs font-semibold text-gray-700 cursor-pointer hover:bg-gray-50 transition-colors">
                <span>Most recent</span>
                <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><path d="M3 6h18M6 12h12M10 18h4"/></svg>
              </div>
            </div>
          </div>

          <div className="flex-1 overflow-y-auto custom-scrollbar pb-20">
            {error ? (
              <div className="bg-red-50 text-red-600 p-6 rounded-2xl text-center font-medium">{error}</div>
            ) : jobs.length === 0 && hasSearched && !loading ? (
              <div className="bg-white rounded-[20px] p-12 text-center border border-gray-100 shadow-sm flex flex-col items-center justify-center">
                 <div className="w-16 h-16 bg-gray-50 rounded-full flex items-center justify-center mb-4">
                   <svg width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="#9ca3af" strokeWidth="2"><circle cx="11" cy="11" r="8"></circle><line x1="21" y1="21" x2="16.65" y2="16.65"></line></svg>
                 </div>
                 <h3 className="text-lg font-semibold text-gray-900 mb-2">No jobs matched your search</h3>
                 <p className="text-sm text-gray-500 max-w-md mx-auto">Try adjusting your filters, location or search terms to find what you're looking for.</p>
              </div>
            ) : (
              <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-5 pr-2">
                {(jobs.length > 0 ? jobs : (loading ? [] : [
                  {
                    job_id: 'mock-1', job_title: 'Product designer', employer_name: 'MetaMask', job_location: 'Remote',
                    job_description: 'Doing the right thing for investors is what we\'re all about at Vanguard, and that involves making...',
                    job_employment_type: 'Full-Time', job_is_remote: false, job_min_salary: null, job_max_salary: null, job_salary_currency: 'USD',
                    employer_logo: 'https://upload.wikimedia.org/wikipedia/commons/3/36/MetaMask_Fox.svg',
                    job_posted_at_datetime_utc: new Date(Date.now() - 12 * 86400000).toISOString()
                  },
                  {
                    job_id: 'mock-2', job_title: 'Sr. UX Designer', employer_name: 'Netflix', job_location: 'Los Angeles, CA',
                    job_description: 'Netflix is one of the world\'s leading streaming entertainment service with over 200 million paid...',
                    job_employment_type: 'Part-Time', job_is_remote: true, job_min_salary: null, job_max_salary: null, job_salary_currency: 'USD',
                    employer_logo: 'https://upload.wikimedia.org/wikipedia/commons/e/e0/Netflix_icon.svg',
                    job_posted_at_datetime_utc: new Date(Date.now() - 5 * 86400000).toISOString()
                  },
                  {
                    job_id: 'mock-3', job_title: 'Product designer', employer_name: 'Microsoft', job_location: 'Seattle, WA',
                    job_description: 'Welcome to Lightspeed LA, the first U.S.-based, AAA game development studio for Tencent Games...',
                    job_employment_type: 'Full-Time', job_is_remote: false, job_min_salary: null, job_max_salary: null, job_salary_currency: 'USD',
                    employer_logo: 'https://upload.wikimedia.org/wikipedia/commons/e/ea/Microsoft_icon.svg',
                    job_posted_at_datetime_utc: new Date(Date.now() - 4 * 86400000).toISOString()
                  },
                  {
                    job_id: 'mock-4', job_title: 'Product designer', employer_name: 'Reddit', job_location: 'San Francisco, CA',
                    job_description: 'Prelim is how banks onboard their customers for business checking accounts...',
                    job_employment_type: 'Part-Time', job_is_remote: false, job_min_salary: null, job_max_salary: null, job_salary_currency: 'USD',
                    employer_logo: 'https://upload.wikimedia.org/wikipedia/commons/0/07/Reddit_icon.svg',
                    job_posted_at_datetime_utc: new Date(Date.now() - 22 * 86400000).toISOString()
                  },
                  {
                    job_id: 'mock-5', job_title: 'Backend Dev.', employer_name: 'Google', job_location: 'Mountain View, CA',
                    job_description: 'Coalfire is on a mission to make the world a safer place by solving our clients\' toughest challenges...',
                    job_employment_type: 'Full-Time', job_is_remote: false, job_min_salary: null, job_max_salary: null, job_salary_currency: 'USD',
                    employer_logo: 'https://upload.wikimedia.org/wikipedia/commons/5/53/Google_%22G%22_Logo.svg',
                    job_posted_at_datetime_utc: new Date(Date.now() - 5 * 86400000).toISOString()
                  },
                  {
                    job_id: 'mock-6', job_title: 'SMM Manager', employer_name: 'Spotify', job_location: 'New York, NY',
                    job_description: 'Join us as we increase access to banking and financial services, helping banks and credit unions...',
                    job_employment_type: 'Full-Time', job_is_remote: false, job_min_salary: null, job_max_salary: null, job_salary_currency: 'USD',
                    employer_logo: 'https://upload.wikimedia.org/wikipedia/commons/1/19/Spotify_logo_without_text.svg',
                    job_posted_at_datetime_utc: new Date(Date.now() - 8 * 86400000).toISOString()
                  }
                ])).map((job, idx) => {
                  
                  // Mock some extra tags and styling from screenshot
                  let tag1Bg = "bg-purple-100 text-purple-700";
                  let tag1Text = "Intermediate";
                  if (idx === 0) { tag1Bg = "bg-[#f5eaff] text-[#8e44ad]"; tag1Text = "Entry Level"; }
                  if (idx === 1 || idx === 3) { tag1Bg = "bg-[#f5eaff] text-[#8e44ad]"; tag1Text = "Expert"; }
                  
                  let tag2Bg = "bg-[#e8faed] text-[#27ae60]";
                  let tag2Text = "Full-Time";
                  if (idx === 1 || idx === 3) { tag2Bg = "bg-[#e8faed] text-[#27ae60]"; tag2Text = "Part-Time"; }

                  let hasTag3 = idx === 0 || idx === 1 || idx === 5;
                  let tag3Bg = "bg-[#ffedea] text-[#e15f41]";
                  let tag3Text = idx === 1 ? "Remote" : "Full-Time";

                  // Extract mock salary
                  let mockSal = "$210/hr";
                  if (idx===0) mockSal="$250/hr";
                  if (idx===1) mockSal="$195/hr";
                  if (idx===3) mockSal="$120/hr";
                  if (idx===4) mockSal="$260/hr";
                  if (idx===5) mockSal="$170/hr";

                  const actualSal = formatSalary(job.job_min_salary, job.job_max_salary, job.job_salary_currency) || mockSal;

                  return (
                    <motion.div
                      ref={idx === jobs.length - 1 ? lastJobElementRef : null}
                      initial={{ opacity: 0, y: 10 }}
                      animate={{ opacity: 1, y: 0 }}
                      transition={{ delay: (idx % 12) * 0.05 }}
                      key={`${job.job_id}-${idx}`}
                      className="bg-white rounded-[20px] p-5 border border-gray-100 hover:shadow-lg hover:shadow-gray-200/50 transition-all flex flex-col h-full cursor-pointer hover:-translate-y-1 relative"
                      onClick={() => job.job_apply_link && window.open(job.job_apply_link, '_blank')}
                    >
                      <div className="flex justify-between items-start mb-4">
                        <div className="flex items-center gap-3">
                          <div className="w-10 h-10 bg-white flex flex-shrink-0 items-center justify-center rounded-xl p-1 overflow-hidden" style={{boxShadow: '0 2px 10px rgba(0,0,0,0.05)'}}>
                            {job.employer_logo ? (
                                <img src={job.employer_logo} alt={job.employer_name} className="w-full h-full object-contain" referrerPolicy="no-referrer" onError={(e) => {
                                    (e.currentTarget as HTMLImageElement).style.display = 'none';
                                }}/>
                            ) : (
                                <span className="text-lg font-bold text-gray-500">{job.employer_name.charAt(0)}</span>
                            )}
                          </div>
                          <div>
                            <h3 className="font-semibold text-gray-900 text-[15px] leading-tight">{job.job_title}</h3>
                            <p className="text-[11px] text-gray-500 font-medium tracking-wide mt-0.5">{job.employer_name} &bull; {Math.floor(Math.random() * 50 + 10)} Applicants</p>
                          </div>
                        </div>
                        <button className="text-gray-300 hover:text-red-500 transition-colors" onClick={(e) => { e.stopPropagation(); handleTrackJob(job); }}>
                          <svg width="20" height="20" viewBox="0 0 24 24" fill={trackedJobIds.has(job.job_id) ? "currentColor" : "none"} stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" className={trackedJobIds.has(job.job_id) ? "text-red-500" : ""}><path d="M20.84 4.61a5.5 5.5 0 0 0-7.78 0L12 5.67l-1.06-1.06a5.5 5.5 0 0 0-7.78 7.78l1.06 1.06L12 21.23l7.78-7.78 1.06-1.06a5.5 5.5 0 0 0 0-7.78z"></path></svg>
                        </button>
                      </div>

                      <div className="flex flex-wrap gap-2 mb-4">
                        <span className={`px-2.5 py-1 rounded-md text-[10px] font-bold tracking-wide ${tag1Bg}`}>{tag1Text}</span>
                        <span className={`px-2.5 py-1 rounded-md text-[10px] font-bold tracking-wide ${tag2Bg}`}>{job.job_employment_type?.replace('_', ' ') || tag2Text}</span>
                        {hasTag3 && (
                          <span className={`px-2.5 py-1 rounded-md text-[10px] font-bold tracking-wide ${job.job_is_remote ? "bg-[#ffedea] text-[#e15f41]" : tag3Bg}`}>
                            {job.job_is_remote ? 'Remote' : (tag3Text)}
                          </span>
                        )}
                      </div>

                      <p className="text-[12px] text-gray-500 leading-relaxed min-h-[40px] line-clamp-2 mb-6 font-medium">
                        {job.job_description || 'No description available for this position. Please view details to learn more.'}
                      </p>

                      <div className="mt-auto">
                        <div className="w-full h-px bg-gray-100 mb-4"></div>
                        <div className="flex justify-between items-center">
                          <span className="text-[14px] font-bold text-gray-900">{actualSal}</span>
                          <div className="flex items-center gap-1.5 text-gray-400 font-medium text-[11px]">
                            <svg width="12" height="12" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><circle cx="12" cy="12" r="10"></circle><polyline points="12 6 12 12 16 14"></polyline></svg>
                            <span>{formatPostedDate(job.job_posted_at_datetime_utc)}</span>
                          </div>
                        </div>
                      </div>
                    </motion.div>
                  );
                })}
              </div>
            )}
            {hasMore && jobs.length > 0 && (
              <div className="flex justify-center pt-8">
                <button onClick={loadMore} disabled={loadingMore} className="bg-white border border-gray-200 text-sm font-semibold text-gray-700 px-6 py-2.5 rounded-full shadow-sm hover:bg-gray-50 transition-colors">
                  {loadingMore ? 'Loading...' : 'Load Mode Jobs'}
                </button>
              </div>
            )}
          </div>
        </div>

      </div>
      <AnimatePresence>
        {autoApplyJob && resumeData && (
          <AutoApplyModal 
            isOpen={!!autoApplyJob}
            onClose={() => setAutoApplyJob(null)}
            job={autoApplyJob}
            resumeData={resumeData}
            onApplyComplete={(job) => {
              setTrackedJobIds(prev => new Set(prev).add(job.job_id));
            }}
          />
        )}
      </AnimatePresence>
    </div>
  );

};

export default JobSearch;
