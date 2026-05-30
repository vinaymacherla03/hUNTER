
import React, { useEffect, useState } from 'react';
import { MapContainer, TileLayer, Marker, Popup, useMap } from 'react-leaflet';
import L from 'leaflet';
import { GoogleJob } from '../services/googleJobsService';
import { Building, MapPin, DollarSign, ExternalLink, Briefcase, Filter, Calendar, BarChart } from 'lucide-react';
import { motion, AnimatePresence } from 'framer-motion';

// Fix for default marker icon in Leaflet with React
const createCustomIcon = (color: string = '#10b981') => {
  return L.divIcon({
    html: `
      <div style="position: relative; width: 30px; height: 30px;">
        <svg viewBox="0 0 24 24" fill="none" xmlns="http://www.w3.org/2000/svg" style="width: 30px; height: 30px; filter: drop-shadow(0 2px 4px rgba(0,0,0,0.2));">
          <path d="M12 21C16 17.5 19 14.4087 19 11C19 7.13401 15.866 4 12 4C8.13401 4 5 7.13401 5 11C5 14.4087 8 17.5 12 21Z" fill="${color}" stroke="white" stroke-width="2"/>
          <circle cx="12" cy="11" r="3" fill="white"/>
        </svg>
      </div>
    `,
    className: 'custom-marker-icon',
    iconSize: [30, 30],
    iconAnchor: [15, 30],
    popupAnchor: [0, -30],
  });
};

const defaultIcon = createCustomIcon('#10b981'); // emerald-500
const activeIcon = createCustomIcon('#059669'); // emerald-600

interface JobMapProps {
  jobs: GoogleJob[];
  onTrackJob?: (job: GoogleJob) => void;
}

// Component to handle map centering and bounds
const MapController = ({ jobs }: { jobs: GoogleJob[] }) => {
  const map = useMap();

  useEffect(() => {
    const validJobs = jobs.filter(j => j.job_latitude && j.job_longitude);
    if (validJobs.length > 0) {
      const bounds = L.latLngBounds(validJobs.map(j => [j.job_latitude!, j.job_longitude!]));
      map.fitBounds(bounds, { padding: [50, 50] });
    }
  }, [jobs, map]);

  return null;
};

const JobMap: React.FC<JobMapProps> = ({ jobs, onTrackJob }) => {
  const [selectedJob, setSelectedJob] = useState<GoogleJob | null>(null);
  const [experienceFilter, setExperienceFilter] = useState<string>('all');
  const [employmentTypeFilter, setEmploymentTypeFilter] = useState<string>('all');
  const [datePostedFilter, setDatePostedFilter] = useState<string>('all');
  const [showFilters, setShowFilters] = useState(false);
  
  const filteredJobs = jobs.filter(job => {
    // Experience Filter
    if (experienceFilter !== 'all') {
      const exp = job.job_experience_level?.toLowerCase() || '';
      if (!exp.includes(experienceFilter.toLowerCase())) return false;
    }

    // Employment Type Filter
    if (employmentTypeFilter !== 'all') {
      if (job.job_employment_type !== employmentTypeFilter) return false;
    }

    // Date Posted Filter
    if (datePostedFilter !== 'all') {
      const postedDate = new Date(job.job_posted_at_datetime_utc);
      const now = new Date();
      const diffDays = (now.getTime() - postedDate.getTime()) / (1000 * 3600 * 24);
      
      if (datePostedFilter === '24h' && diffDays > 1) return false;
      if (datePostedFilter === '3d' && diffDays > 3) return false;
      if (datePostedFilter === '7d' && diffDays > 7) return false;
      if (datePostedFilter === '30d' && diffDays > 30) return false;
    }

    return true;
  });

  const validJobs = filteredJobs.filter(j => j.job_latitude && j.job_longitude);

  if (jobs.length === 0) {
    return (
      <div className="flex flex-col items-center justify-center p-12 bg-white rounded-[2rem] border border-slate-100 shadow-sm text-center h-[500px]">
        <div className="w-16 h-16 bg-slate-50 rounded-full flex items-center justify-center mb-4">
          <Briefcase className="w-8 h-8 text-slate-300" />
        </div>
        <h3 className="text-lg font-black text-slate-900 mb-2">No Jobs Found</h3>
        <p className="text-slate-500 text-sm max-w-xs">
          Try adjusting your search query or location to find more opportunities.
        </p>
      </div>
    );
  }

  if (validJobs.length === 0 && jobs.length > 0) {
    return (
      <div className="flex flex-col items-center justify-center p-12 bg-white rounded-[2rem] border border-slate-100 shadow-sm text-center h-[500px]">
        <div className="w-16 h-16 bg-slate-50 rounded-full flex items-center justify-center mb-4">
          <Filter className="w-8 h-8 text-slate-300" />
        </div>
        <h3 className="text-lg font-black text-slate-900 mb-2">No Matches for Filters</h3>
        <p className="text-slate-500 text-sm max-w-xs mb-6">
          None of the {jobs.length} jobs match your current filter criteria.
        </p>
        <button 
          onClick={() => {
            setExperienceFilter('all');
            setEmploymentTypeFilter('all');
            setDatePostedFilter('all');
          }}
          className="px-6 py-3 bg-slate-900 text-white rounded-2xl text-xs font-black uppercase tracking-widest hover:bg-emerald-600 transition-colors"
        >
          Reset All Filters
        </button>
      </div>
    );
  }

  const formatSalary = (min: number | null, max: number | null, currency: string | null) => {
    if (!min && !max) return null;
    const curr = currency || 'USD';
    const format = (num: number) => new Intl.NumberFormat('en-US', { style: 'currency', currency: curr, maximumFractionDigits: 0 }).format(num);
    if (min && max) return `${format(min)} - ${format(max)}`;
    if (min) return `${format(min)}+`;
    if (max) return `Up to ${format(max)}`;
    return null;
  };

  return (
    <div className="relative w-full h-[600px] rounded-[2rem] overflow-hidden border border-slate-100 shadow-xl z-0">
      {/* Filter Controls Overlay */}
      <div className="absolute top-6 left-6 right-6 z-[1000] pointer-events-none">
        <div className="flex flex-wrap gap-3 pointer-events-auto">
          <div className="flex bg-white/90 backdrop-blur-md p-1.5 rounded-2xl border border-white/20 shadow-xl">
            <button 
              onClick={() => setShowFilters(!showFilters)}
              className={`flex items-center gap-2 px-4 py-2 rounded-xl text-[10px] font-black uppercase tracking-widest transition-all ${showFilters ? 'bg-slate-900 text-white' : 'text-slate-600 hover:bg-slate-50'}`}
            >
              <Filter className="w-3.5 h-3.5" />
              Filters
              {(experienceFilter !== 'all' || employmentTypeFilter !== 'all' || datePostedFilter !== 'all') && (
                <span className="w-2 h-2 bg-emerald-500 rounded-full animate-pulse" />
              )}
            </button>
          </div>

          <AnimatePresence>
            {showFilters && (
              <motion.div 
                initial={{ opacity: 0, y: -10, scale: 0.95 }}
                animate={{ opacity: 1, y: 0, scale: 1 }}
                exit={{ opacity: 0, y: -10, scale: 0.95 }}
                className="flex flex-wrap gap-3 bg-white/90 backdrop-blur-md p-1.5 rounded-2xl border border-white/20 shadow-xl"
              >
                {/* Experience Filter */}
                <div className="flex items-center gap-2 px-3 border-r border-slate-100 last:border-0">
                  <BarChart className="w-3.5 h-3.5 text-slate-400" />
                  <select 
                    value={experienceFilter}
                    onChange={(e) => setExperienceFilter(e.target.value)}
                    className="bg-transparent text-[10px] font-black uppercase tracking-widest text-slate-700 focus:outline-none cursor-pointer"
                  >
                    <option value="all">Experience: Any</option>
                    <option value="entry">Entry Level</option>
                    <option value="mid">Mid Level</option>
                    <option value="senior">Senior Level</option>
                    <option value="executive">Executive</option>
                  </select>
                </div>

                {/* Employment Type Filter */}
                <div className="flex items-center gap-2 px-3 border-r border-slate-100 last:border-0">
                  <Briefcase className="w-3.5 h-3.5 text-slate-400" />
                  <select 
                    value={employmentTypeFilter}
                    onChange={(e) => setEmploymentTypeFilter(e.target.value)}
                    className="bg-transparent text-[10px] font-black uppercase tracking-widest text-slate-700 focus:outline-none cursor-pointer"
                  >
                    <option value="all">Type: Any</option>
                    <option value="FULLTIME">Full-time</option>
                    <option value="PARTTIME">Part-time</option>
                    <option value="CONTRACTOR">Contract</option>
                    <option value="INTERN">Internship</option>
                  </select>
                </div>

                {/* Date Posted Filter */}
                <div className="flex items-center gap-2 px-3 border-r border-slate-100 last:border-0">
                  <Calendar className="w-3.5 h-3.5 text-slate-400" />
                  <select 
                    value={datePostedFilter}
                    onChange={(e) => setDatePostedFilter(e.target.value)}
                    className="bg-transparent text-[10px] font-black uppercase tracking-widest text-slate-700 focus:outline-none cursor-pointer"
                  >
                    <option value="all">Posted: Any Time</option>
                    <option value="24h">Past 24 Hours</option>
                    <option value="3d">Past 3 Days</option>
                    <option value="7d">Past Week</option>
                    <option value="30d">Past Month</option>
                  </select>
                </div>

                <button 
                  onClick={() => {
                    setExperienceFilter('all');
                    setEmploymentTypeFilter('all');
                    setDatePostedFilter('all');
                  }}
                  className="px-3 py-2 text-[9px] font-black uppercase tracking-widest text-emerald-600 hover:bg-emerald-50 rounded-xl transition-colors"
                >
                  Reset
                </button>
              </motion.div>
            )}
          </AnimatePresence>
        </div>
      </div>

      <MapContainer 
        center={[validJobs[0].job_latitude!, validJobs[0].job_longitude!]} 
        zoom={10} 
        style={{ height: '100%', width: '100%' }}
        scrollWheelZoom={true}
      >
        <TileLayer
          attribution='&copy; <a href="https://www.openstreetmap.org/copyright">OpenStreetMap</a> contributors'
          url="https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png"
        />
        
        {validJobs.map((job, idx) => (
          <Marker 
            key={`${job.job_id}-${job.job_latitude}-${job.job_longitude}`} 
            position={[job.job_latitude!, job.job_longitude!]}
            icon={selectedJob?.job_id === job.job_id ? activeIcon : defaultIcon}
            eventHandlers={{
              click: () => setSelectedJob(job),
            }}
          >
            <Popup className="job-popup">
              <div className="p-1 min-w-[200px]">
                <div className="flex items-center gap-3 mb-3">
                  <div className="w-10 h-10 bg-slate-50 rounded-lg flex items-center justify-center shrink-0 overflow-hidden border border-slate-100">
                    {job.employer_logo ? (
                      <img 
                        src={job.employer_logo} 
                        alt={job.employer_name} 
                        className="w-full h-full object-contain p-1" 
                        referrerPolicy="no-referrer"
                        onError={(e) => {
                          (e.target as HTMLImageElement).src = `https://ui-avatars.com/api/?name=${encodeURIComponent(job.employer_name)}&background=f8fafc&color=64748b&bold=true`;
                        }}
                      />
                    ) : (
                      <Building className="w-5 h-5 text-slate-300" />
                    )}
                  </div>
                  <div className="min-w-0">
                    <h4 className="font-black text-slate-900 text-sm leading-tight truncate">{job.job_title}</h4>
                    <p className="text-[10px] font-bold text-slate-500 truncate">{job.employer_name}</p>
                  </div>
                </div>

                <div className="space-y-2 mb-4">
                  <div className="flex items-center gap-2 text-[10px] font-bold text-slate-600">
                    <MapPin className="w-3 h-3 text-emerald-500" />
                    <span className="truncate">{job.job_location}</span>
                  </div>
                  {formatSalary(job.job_min_salary, job.job_max_salary, job.job_salary_currency) && (
                    <div className="flex items-center gap-2 text-[10px] font-bold text-emerald-600">
                      <DollarSign className="w-3 h-3" />
                      <span>{formatSalary(job.job_min_salary, job.job_max_salary, job.job_salary_currency)}</span>
                    </div>
                  )}
                  <div className="flex items-center gap-2 text-[10px] font-bold text-slate-500">
                    <Briefcase className="w-3 h-3" />
                    <span>{job.job_employment_type?.replace('_', ' ') || 'Full-time'}</span>
                  </div>
                  {job.job_experience_level && (
                    <div className="flex items-center gap-2 text-[10px] font-bold text-slate-500">
                      <BarChart className="w-3 h-3" />
                      <span>{job.job_experience_level}</span>
                    </div>
                  )}
                </div>

                <div className="flex gap-2">
                  <a 
                    href={job.job_apply_link} 
                    target="_blank" 
                    rel="noreferrer"
                    className="flex-1 px-3 py-2 bg-slate-900 text-white rounded-lg text-[9px] font-black uppercase tracking-widest text-center flex items-center justify-center gap-1 hover:bg-emerald-600 transition-colors"
                  >
                    Apply <ExternalLink className="w-2.5 h-2.5" />
                  </a>
                  {onTrackJob && (
                    <button 
                      onClick={() => onTrackJob(job)}
                      className="px-3 py-2 bg-emerald-50 text-emerald-600 border border-emerald-100 rounded-lg text-[9px] font-black uppercase tracking-widest hover:bg-emerald-100 transition-colors"
                    >
                      Track
                    </button>
                  )}
                </div>
              </div>
            </Popup>
          </Marker>
        ))}
        
        <MapController jobs={validJobs} />
      </MapContainer>

      {/* Map Legend/Overlay */}
      <div className="absolute bottom-6 left-6 z-[1000] bg-white/90 backdrop-blur-md p-4 rounded-2xl border border-white/20 shadow-xl pointer-events-none">
        <div className="flex items-center gap-2">
          <div className="w-3 h-3 rounded-full bg-emerald-500 shadow-[0_0_8px_rgba(16,185,129,0.4)]" />
          <span className="text-[10px] font-black text-slate-900 uppercase tracking-widest">{validJobs.length} Positions Located</span>
        </div>
      </div>
    </div>
  );
};

export default JobMap;
