import React, { useState, useContext } from 'react';
import { Search, MapPin, Building, Clock, DollarSign, Briefcase, AlertCircle, Loader2, ExternalLink, Send } from 'lucide-react';
import { JSearchService, JSearchJob } from '../services/jsearchService';
import ApplyModal from './ApplyModal';
import { ResumeContext } from './builder/ResumeContext';
import { motion } from 'framer-motion';

const JobSearch: React.FC = () => {
  const [query, setQuery] = useState('');
  const [location, setLocation] = useState('');
  const [jobs, setJobs] = useState<JSearchJob[]>([]);
  const [loading, setLoading] = useState(false);
  const [loadingMore, setLoadingMore] = useState(false);
  const [page, setPage] = useState(1);
  const [hasMore, setHasMore] = useState(true);
  const [hasSearched, setHasSearched] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [selectedJob, setSelectedJob] = useState<JSearchJob | null>(null);
  const { resumeData } = useContext(ResumeContext);

  const handleSearch = async (e?: React.FormEvent) => {
    if (e) e.preventDefault();
    if (!query.trim()) return;
    
    setLoading(true);
    setError(null);
    setHasSearched(true);
    setPage(1);
    setHasMore(true);
    
    try {
      const data = await JSearchService.searchJobs(query, location, 1, 1);
      setJobs(data.data || []);
      if (!data.data || data.data.length === 0) {
        setHasMore(false);
      }
    } catch (err) {
      console.error('Search error:', err);
      setError('Failed to fetch jobs. Please try again later.');
    } finally {
      setLoading(false);
    }
  };

  const loadMore = async () => {
    if (loadingMore || !hasMore) return;
    setLoadingMore(true);
    const nextPage = page + 1;
    
    try {
      const data = await JSearchService.searchJobs(query, location, nextPage, 1);
      const newJobs = data.data || [];
      if (newJobs.length === 0) {
        setHasMore(false);
      } else {
        setJobs(prev => [...prev, ...newJobs]);
        setPage(nextPage);
      }
    } catch (err) {
      console.error('Load more error:', err);
    } finally {
      setLoadingMore(false);
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

  const formatPostedDate = (dateString: string) => {
    try {
      const date = new Date(dateString);
      const now = new Date();
      const diffTime = Math.abs(now.getTime() - date.getTime());
      const diffDays = Math.floor(diffTime / (1000 * 60 * 60 * 24));
      
      if (diffDays === 0) return 'Today';
      if (diffDays === 1) return 'Yesterday';
      if (diffDays < 30) return `${diffDays} days ago`;
      return date.toLocaleDateString();
    } catch {
      return 'Recently';
    }
  };

  return (
    <div className="flex flex-col h-full space-y-8">
      <div className="bg-white p-8 rounded-[2rem] shadow-sm border border-slate-200/50">
        <div className="mb-6">
            <h3 className="text-xl font-black text-slate-900 tracking-tight">Find Your Next Role</h3>
            <p className="text-sm font-medium text-slate-500 mt-1">Search thousands of job listings tailored to your skills.</p>
        </div>
        <form onSubmit={handleSearch} className="flex flex-col sm:flex-row gap-4">
          <div className="relative flex-grow">
            <div className="absolute inset-y-0 left-0 pl-5 flex items-center pointer-events-none">
              <Search className="h-5 w-5 text-slate-400" />
            </div>
            <input
              type="text"
              placeholder="Job Title, Keywords, or Company"
              value={query}
              onChange={(e) => setQuery(e.target.value)}
              className="w-full pl-12 pr-5 py-4 bg-slate-50 border border-slate-200 rounded-2xl focus:ring-4 focus:ring-emerald-500/10 focus:border-emerald-500 outline-none transition-all text-sm font-medium text-slate-900 shadow-inner"
            />
          </div>
          <div className="relative sm:w-72">
            <div className="absolute inset-y-0 left-0 pl-5 flex items-center pointer-events-none">
              <MapPin className="h-5 w-5 text-slate-400" />
            </div>
            <input
              type="text"
              placeholder="City, State, or Remote"
              value={location}
              onChange={(e) => setLocation(e.target.value)}
              className="w-full pl-12 pr-5 py-4 bg-slate-50 border border-slate-200 rounded-2xl focus:ring-4 focus:ring-emerald-500/10 focus:border-emerald-500 outline-none transition-all text-sm font-medium text-slate-900 shadow-inner"
            />
          </div>
          <motion.button 
            whileTap={{ scale: 0.98 }}
            type="submit" 
            disabled={loading || !query.trim()}
            className="px-8 py-4 bg-slate-900 text-white rounded-2xl font-bold tracking-wide hover:bg-slate-800 transition-all disabled:opacity-50 disabled:cursor-not-allowed flex items-center justify-center gap-3 shrink-0 shadow-xl shadow-slate-900/20 disabled:shadow-none"
          >
            {loading ? <Loader2 className="w-5 h-5 animate-spin" /> : <Search className="w-5 h-5" />}
            {loading ? 'Searching...' : 'Search Jobs'}
          </motion.button>
        </form>
      </div>

      <div className="flex-1 overflow-y-auto custom-scrollbar pr-2 space-y-4 pb-12">
        {loading ? (
          // Skeleton Loader
          Array.from({ length: 4 }).map((_, i) => (
            <div key={i} className="bg-white p-6 rounded-3xl border border-slate-200 animate-pulse flex flex-col gap-4">
              <div className="flex gap-4 items-start">
                <div className="w-14 h-14 bg-slate-100 rounded-2xl shrink-0"></div>
                <div className="space-y-3 flex-1 py-1">
                  <div className="h-5 bg-slate-100 rounded-md w-1/3"></div>
                  <div className="h-4 bg-slate-100 rounded-md w-1/4"></div>
                </div>
              </div>
              <div className="flex gap-2 mt-2">
                <div className="h-7 bg-slate-100 rounded-lg w-20"></div>
                <div className="h-7 bg-slate-100 rounded-lg w-24"></div>
                <div className="h-7 bg-slate-100 rounded-lg w-28"></div>
              </div>
            </div>
          ))
        ) : error ? (
          <div className="bg-rose-50 border border-rose-100 rounded-[2rem] p-12 flex flex-col items-center justify-center text-center">
            <div className="w-20 h-20 bg-white rounded-full flex items-center justify-center shadow-sm border border-rose-100 mb-6">
                <AlertCircle className="w-10 h-10 text-rose-500" />
            </div>
            <h3 className="text-xl font-black text-rose-900 mb-2 tracking-tight">Oops! Something went wrong</h3>
            <p className="text-rose-600 font-medium">{error}</p>
          </div>
        ) : !hasSearched ? (
          <div className="bg-white border border-slate-200/50 rounded-[2rem] p-16 flex flex-col items-center justify-center text-center h-full min-h-[400px] shadow-sm">
            <div className="w-24 h-24 bg-slate-50 rounded-full flex items-center justify-center shadow-inner border border-slate-100 mb-8">
              <Briefcase className="w-10 h-10 text-slate-400" />
            </div>
            <h3 className="text-2xl font-black text-slate-900 mb-3 tracking-tight">Ready to find your next role?</h3>
            <p className="text-slate-500 font-medium max-w-md text-lg leading-relaxed">Enter a job title or keyword above to start searching through thousands of listings tailored to your skills.</p>
          </div>
        ) : jobs.length === 0 ? (
          <div className="bg-white border border-slate-200/50 rounded-[2rem] p-16 flex flex-col items-center justify-center text-center h-full min-h-[400px] shadow-sm">
            <div className="w-24 h-24 bg-slate-50 rounded-full flex items-center justify-center shadow-inner border border-slate-100 mb-8">
              <Search className="w-10 h-10 text-slate-400" />
            </div>
            <h3 className="text-2xl font-black text-slate-900 mb-3 tracking-tight">No jobs found</h3>
            <p className="text-slate-500 font-medium max-w-md text-lg leading-relaxed">We couldn't find any matches for <span className="text-slate-900 font-bold">"{query}"</span> in {location || 'any location'}. Try adjusting your search terms.</p>
          </div>
        ) : (
          <div className="space-y-4">
              <div className="flex items-center justify-between px-2 mb-2">
                  <h4 className="text-sm font-bold text-slate-900">Found {jobs.length} jobs</h4>
                  <span className="text-xs font-bold text-slate-400 uppercase tracking-widest">Sorted by relevance</span>
              </div>
              {jobs.map((job) => {
                const salary = formatSalary(job.job_min_salary, job.job_max_salary, job.job_salary_currency);
                return (
                  <div key={job.job_id} className="bg-white p-6 sm:p-8 rounded-[2rem] border border-slate-200/60 hover:border-emerald-300 hover:shadow-lg hover:shadow-emerald-500/5 transition-all duration-300 group flex flex-col sm:flex-row gap-6 items-start sm:items-center relative overflow-hidden">
                    <div className="absolute top-0 left-0 w-1 h-full bg-transparent group-hover:bg-emerald-500 transition-colors" />
                    
                    <div className="w-16 h-16 bg-white border border-slate-100 rounded-2xl flex items-center justify-center shrink-0 overflow-hidden shadow-sm">
                      {job.employer_logo ? (
                        <img src={job.employer_logo} alt={job.employer_name} className="w-full h-full object-contain p-2" referrerPolicy="no-referrer" />
                      ) : (
                        <Building className="w-8 h-8 text-slate-300" />
                      )}
                    </div>
                    
                    <div className="flex-1 min-w-0">
                      <h3 className="font-black text-xl text-slate-900 truncate group-hover:text-emerald-600 transition-colors tracking-tight">{job.job_title}</h3>
                      <div className="flex items-center gap-3 text-sm text-slate-500 mt-1.5 font-medium">
                        <span className="text-slate-700 font-bold">{job.employer_name}</span>
                        <span className="w-1 h-1 rounded-full bg-slate-300" />
                        <span className="flex items-center gap-1.5"><MapPin className="w-4 h-4 text-slate-400" /> {job.job_location}</span>
                      </div>
                      
                      <div className="flex flex-wrap gap-2 mt-5">
                        {job.job_is_remote && (
                          <span className="px-3 py-1.5 bg-emerald-50 text-emerald-700 border border-emerald-100 rounded-lg text-[10px] font-black tracking-widest uppercase">Remote</span>
                        )}
                        {job.job_employment_type && (
                          <span className="px-3 py-1.5 bg-slate-100 text-slate-600 border border-slate-200 rounded-lg text-[10px] font-black tracking-widest uppercase">{job.job_employment_type.replace('_', ' ')}</span>
                        )}
                        {salary && (
                          <span className="px-3 py-1.5 bg-green-50 text-green-700 border border-green-100 rounded-lg text-[10px] font-black tracking-widest uppercase flex items-center gap-1">
                            <DollarSign className="w-3 h-3" /> {salary} {job.job_salary_period ? `/ ${job.job_salary_period.toLowerCase()}` : ''}
                          </span>
                        )}
                        <span className="px-3 py-1.5 bg-slate-50 text-slate-500 border border-slate-100 rounded-lg text-[10px] font-black tracking-widest uppercase flex items-center gap-1.5 ml-auto sm:ml-0">
                          <Clock className="w-3 h-3" /> {formatPostedDate(job.job_posted_at_datetime_utc)}
                        </span>
                      </div>
                    </div>

                    <div className="w-full sm:w-auto shrink-0 flex flex-col sm:flex-row lg:flex-col gap-3">
                      {job.job_apply_link && (
                        <a 
                          href={job.job_apply_link} 
                          target="_blank" 
                          rel="noreferrer" 
                          className="w-full sm:w-auto px-6 py-3 bg-emerald-600 hover:bg-emerald-700 text-white rounded-xl font-bold transition-colors text-sm text-center flex items-center justify-center gap-2 shadow-md shadow-emerald-600/20"
                        >
                          <ExternalLink className="w-4 h-4" />
                          Apply Now
                        </a>
                      )}
                      <button 
                        onClick={() => setSelectedJob(job)}
                        className="w-full sm:w-auto px-6 py-3 bg-slate-100 text-slate-700 hover:bg-slate-200 hover:text-slate-900 rounded-xl font-bold transition-colors text-sm text-center flex items-center justify-center gap-2"
                      >
                        <Send className="w-4 h-4" />
                        Quick Apply
                      </button>
                    </div>
                  </div>
                );
              })}
              
              {hasMore && jobs.length > 0 && (
                <div className="flex justify-center pt-8 pb-4">
                  <button
                    onClick={loadMore}
                    disabled={loadingMore}
                    className="px-8 py-4 bg-white border-2 border-slate-200 text-slate-700 hover:border-slate-300 hover:bg-slate-50 rounded-2xl font-bold transition-all disabled:opacity-50 disabled:cursor-not-allowed flex items-center gap-3 shadow-sm"
                  >
                    {loadingMore ? <Loader2 className="w-5 h-5 animate-spin" /> : <Briefcase className="w-5 h-5" />}
                    {loadingMore ? 'Loading more jobs...' : 'Load More Jobs'}
                  </button>
                </div>
              )}
          </div>
        )}
      </div>

      {selectedJob && (
        <ApplyModal 
          isOpen={!!selectedJob} 
          onClose={() => setSelectedJob(null)} 
          job={selectedJob} 
          resumeData={resumeData}
        />
      )}
    </div>
  );
};

export default JobSearch;
