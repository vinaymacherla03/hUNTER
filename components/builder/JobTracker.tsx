
import React, { useState, useEffect, useCallback, useMemo } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { 
    DndContext, 
    closestCorners, 
    KeyboardSensor, 
    PointerSensor, 
    useSensor, 
    useSensors,
    DragOverlay,
    defaultDropAnimationSideEffects,
    DragStartEvent,
    DragOverEvent,
    DragEndEvent
} from '@dnd-kit/core';
import { 
    arrayMove, 
    SortableContext, 
    sortableKeyboardCoordinates, 
    verticalListSortingStrategy,
    useSortable
} from '@dnd-kit/sortable';
import { CSS } from '@dnd-kit/utilities';
import { JobApplication, ResumeData, JobAlert } from '../../types';
import SparkleIcon from '../icons/SparkleIcon';
import { LogoBlock3D } from '../SocialProof';
import ScheduleInterviewModal from './ScheduleInterviewModal';
import SmartApplyModal from './SmartApplyModal';
import JobNotebook from './JobNotebook';
import JobAlertsModal from './JobAlertsModal';
import IntegrationsModal from './IntegrationsModal';
import { CalendarService } from '../../services/calendarService';
import { jobService } from '../../services/jobService';
import { auth } from '../../services/firebase';
import { Search, Plus, Filter, MoreVertical, Trash2, ExternalLink, MapPin, DollarSign, Calendar, GripVertical, CheckCircle2, Clock, XCircle, Briefcase, Bell, BarChart2, Users, CheckSquare, FileText, TrendingUp, Sparkles, List } from 'lucide-react';

import { LoadingJobs } from './LoadingJobs';

interface JobTrackerProps {
    resumeData: ResumeData;
    initialTab?: 'board' | 'alerts';
}

const STAGES = [
    { id: 'Saved', label: 'Saved', color: 'emerald', icon: <Briefcase className="w-4 h-4" /> },
    { id: 'Applied', label: 'Applied', color: 'blue', icon: <CheckCircle2 className="w-4 h-4" /> },
    { id: 'Interviewing', label: 'Interviewing', color: 'violet', icon: <Clock className="w-4 h-4" /> },
    { id: 'Offer', label: 'Offer', color: 'amber', icon: <SparkleIcon className="w-4 h-4" /> },
    { id: 'Rejected', label: 'Rejected', color: 'rose', icon: <XCircle className="w-4 h-4" /> }
] as const;

type StageId = typeof STAGES[number]['id'];

const getLogoUrl = (company: string) => {
    return `https://logo.clearbit.com/${company.toLowerCase().replace(/\s/g, '')}.com`;
};

import JobFinderPanel from './JobFinderPanel';

// --- Sortable Card Component ---
interface SortableCardProps {
    job: JobApplication;
    onSelect: (job: JobApplication) => void;
    onDelete: (id: string) => void;
    isSelected: boolean;
    onToggleSelect: (id: string) => void;
}

const SortableCard: React.FC<SortableCardProps> = ({ job, onSelect, onDelete, isSelected, onToggleSelect }) => {
    const {
        attributes,
        listeners,
        setNodeRef,
        transform,
        transition,
        isDragging
    } = useSortable({ id: job.id });

    const cardRef = React.useRef<HTMLDivElement>(null);
    const [tilt, setTilt] = useState({ rotateX: 0, rotateY: 0 });

    const handleMouseMove = (e: React.MouseEvent<HTMLDivElement>) => {
        if (!cardRef.current || isDragging) return;
        const rect = cardRef.current.getBoundingClientRect();
        const x = e.clientX - rect.left;
        const y = e.clientY - rect.top;
        const centerX = rect.width / 2;
        const centerY = rect.height / 2;
        
        // Max rotation = 10deg
        const rotateX = ((y - centerY) / centerY) * -15;
        const rotateY = ((x - centerX) / centerX) * 15;
        
        setTilt({ rotateX, rotateY });
    };

    const handleMouseLeave = () => {
        setTilt({ rotateX: 0, rotateY: 0 });
    };

    const style = {
        transform: CSS.Transform.toString(transform),
        transition,
        opacity: isDragging ? 0.3 : 1,
    };

    const daysAgo = useMemo(() => {
        const addedDate = new Date(job.dateAdded);
        const today = new Date();
        const diffTime = Math.abs(today.getTime() - addedDate.getTime());
        return Math.ceil(diffTime / (1000 * 60 * 60 * 24));
    }, [job.dateAdded]);

    return (
        <div
            ref={setNodeRef}
            className={`group relative cursor-default ${isDragging ? 'z-50' : 'z-0'}`}
            style={{ perspective: '1000px', ...style }}
            onClick={(e) => {
                // Do not propagate if dragging
                if (isDragging) return;
                onSelect(job);
            }}
        >
            <div
                ref={cardRef}
                onMouseMove={handleMouseMove}
                onMouseLeave={handleMouseLeave}
                className={`group/card bg-white p-5 rounded-2xl border ${isSelected ? 'border-emerald-500 ring-2 ring-emerald-100' : 'border-slate-100'} shadow-[0_4px_20px_rgba(0,0,0,0.03)] hover:shadow-[0_20px_40px_rgba(0,0,0,0.12)] transition-all duration-300 transform-gpu cursor-default relative overflow-hidden`}
                style={{
                    transform: isDragging ? 'none' : `rotateX(${tilt.rotateX}deg) rotateY(${tilt.rotateY}deg)`,
                    transformStyle: 'preserve-3d',
                }}
            >
                <div className="absolute inset-0 bg-gradient-to-br from-white/60 to-transparent pointer-events-none z-10 transition-opacity duration-300 opacity-0 group-hover/card:opacity-100"></div>
                
                <div className="flex items-start gap-4 transition-transform duration-300 relative z-20" style={{ transform: isDragging ? 'none' : 'translateZ(30px)' }}>
                    <div 
                        {...attributes} 
                        {...listeners}
                        className="mt-1.5 -ml-2 text-slate-300 hover:text-emerald-500 cursor-grab active:cursor-grabbing rounded-md hover:bg-emerald-50 transition-colors"
                        onClick={(e) => e.stopPropagation()}
                    >
                        <GripVertical className="w-5 h-5" />
                    </div>
                    
                    <div className="flex-1 min-w-0">
                        <div className="flex justify-between items-start mb-4">
                            <div className="flex items-center gap-3">
                                 <input 
                                    type="checkbox"
                                    checked={isSelected}
                                    onChange={(e) => {
                                        e.stopPropagation();
                                        onToggleSelect(job.id);
                                    }}
                                    className="w-4 h-4 rounded border-slate-300 text-emerald-600 focus:ring-emerald-500"
                                    onClick={(e) => e.stopPropagation()}
                                 />
                                 <div className="w-12 h-12 rounded-xl flex items-center justify-center border border-slate-200 overflow-hidden shadow-sm bg-white" style={{ transform: 'translateZ(20px)' }}>
                                    <img src={getLogoUrl(job.company)} alt={job.company} className="w-full h-full object-cover" onError={(e) => { (e.target as any).style.display = 'none'; (e.target as any).nextSibling.style.display = 'flex'; }} />
                                    <div className="hidden w-full h-full items-center justify-center bg-slate-50 text-slate-500 font-bold text-lg">
                                        {job.company.charAt(0)}
                                    </div>
                                </div>
                            </div>
                            <button 
                                onClick={(e) => {
                                    e.stopPropagation();
                                    onDelete(job.id);
                                }}
                                className="opacity-0 group-hover:opacity-100 p-2 text-slate-400 hover:text-rose-500 hover:bg-rose-50 rounded-lg transition-all"
                                style={{ transform: 'translateZ(20px)' }}
                            >
                                <Trash2 className="w-5 h-5" />
                            </button>
                        </div>
                        
                        <h4 className="font-bold text-slate-900 text-lg mb-1 line-clamp-1 group-hover:text-emerald-700 transition-colors" style={{ transform: 'translateZ(40px)' }}>
                            {job.role}
                        </h4>
                        <p className="text-sm text-slate-500 font-medium mb-4" style={{ transform: 'translateZ(30px)' }}>{job.company}</p>
                        
                        <div className="flex flex-wrap gap-2.5 mb-5" style={{ transform: 'translateZ(25px)' }}>
                            <div className="flex items-center gap-1.5 text-xs font-semibold text-slate-600 bg-slate-100 px-3 py-1 rounded-full">
                                <MapPin className="w-4 h-4 text-slate-400" />
                                {job.location || 'Remote'}
                            </div>
                            <div className="flex items-center gap-1.5 text-xs font-semibold text-amber-700 bg-amber-50 px-3 py-1 rounded-full border border-amber-100">
                                <Sparkles className="w-4 h-4" />
                                78% Match
                            </div>
                        </div>

                        <div className="flex items-center justify-between pt-3 border-t border-slate-100" style={{ transform: 'translateZ(10px)' }}>
                            <span className="text-[10px] font-medium text-slate-400">
                                {daysAgo}d ago
                            </span>
                            
                            <div className="flex gap-1">
                                {job.link && (
                                    <a 
                                        href={job.link} 
                                        target="_blank" 
                                        rel="noopener noreferrer"
                                        onClick={(e) => e.stopPropagation()}
                                        className="p-1.5 text-slate-400 hover:text-emerald-600 hover:bg-emerald-50 rounded-md transition-all"
                                    >
                                        <ExternalLink className="w-3.5 h-3.5" />
                                    </a>
                                )}
                            </div>
                        </div>
                    </div>
                </div>
            </div>
        </div>
    );
};

// --- Column Component ---
interface KanbanColumnProps {
    stage: typeof STAGES[number];
    jobs: JobApplication[];
    onSelect: (job: JobApplication) => void;
    onDelete: (id: string) => void;
    onQuickAdd: (stage: StageId) => void;
    selectedJobIds: string[];
    toggleJobSelection: (id: string) => void;
    index?: number;
}

const KanbanColumn: React.FC<KanbanColumnProps> = ({ stage, jobs, onSelect, onDelete, onQuickAdd, selectedJobIds, toggleJobSelection, index }) => {
    return (
        <div className="flex-shrink-0 w-[340px] flex flex-col rounded-[2rem] bg-white/60 border border-white shadow-[0_8px_30px_rgb(0,0,0,0.04)] backdrop-blur-xl h-full max-h-full overflow-hidden transition-all duration-500 hover:-translate-y-4 hover:shadow-[0_40px_80px_rgb(0,0,0,0.12)] hover:border-emerald-200 hover:bg-white/90 group/col relative" style={{ transform: index !== undefined ? `rotateY(${(index - 2) * -5}deg) translateZ(${Math.abs(index - 2) * -30}px)` : 'none', transformStyle: 'preserve-3d' }}>
            {/* Inner Glare */}
            <div className="absolute inset-0 bg-gradient-to-b from-white/80 via-white/20 to-white/60 pointer-events-none rounded-[2rem] opacity-50 z-0"></div>
            
            <div className="p-4 border-b border-slate-200/50 bg-white/50 backdrop-blur-md flex items-center justify-between sticky top-0 z-10">
                <div className="flex items-center gap-3">
                    <div className={`p-1.5 rounded-lg bg-${stage.color}-100 text-${stage.color}-600`}>
                        {stage.icon}
                    </div>
                    <div className="flex items-baseline gap-2">
                        <h3 className="text-[13px] font-bold text-slate-800">{stage.label}</h3>
                        <span className="text-[11px] font-medium text-slate-500 bg-slate-200 px-1.5 py-0.5 rounded-full">{jobs.length}</span>
                    </div>
                </div>
                <button 
                    onClick={() => onQuickAdd(stage.id)}
                    className="p-1.5 text-slate-400 hover:text-emerald-600 hover:bg-emerald-50 rounded-md transition-colors"
                >
                    <Plus className="w-4 h-4" />
                </button>
            </div>
            
            <div className="flex-1 overflow-y-auto p-3 space-y-3 custom-scrollbar min-h-[200px] relative z-20">
                <SortableContext items={jobs.map(j => j.id)} strategy={verticalListSortingStrategy}>
                    {jobs.map(job => (
                        <SortableCard 
                            key={job.id} 
                            job={job} 
                            onSelect={onSelect} 
                            onDelete={onDelete}
                            isSelected={selectedJobIds.includes(job.id)}
                            onToggleSelect={toggleJobSelection}
                        />
                    ))}
                </SortableContext>
                
                {jobs.length === 0 && (
                    <div className="h-28 border-2 border-dashed border-slate-200 rounded-2xl flex flex-col items-center justify-center p-4 text-center cursor-default group hover:border-emerald-300 hover:bg-emerald-50/50 transition-colors">
                        <div className="w-10 h-10 bg-slate-100 rounded-full flex items-center justify-center mb-3 group-hover:bg-emerald-100 transition-colors">
                            <Plus className="w-5 h-5 text-slate-400 group-hover:text-emerald-500" />
                        </div>
                        <p className="text-xs font-semibold text-slate-500">Drop here to move</p>
                        <p className="text-[10px] text-slate-400">or click + to add</p>
                    </div>
                )}
            </div>
        </div>
    );
};

// --- Main Component ---
const JobTracker: React.FC<JobTrackerProps> = ({ resumeData, initialTab = 'board' }) => {
    const [activeTab, setActiveTab] = useState(initialTab);
    const [viewMode, setViewMode] = useState<'board' | 'list'>('board');
    const [jobs, setJobs] = useState<JobApplication[]>([]);
    const [selectedJob, setSelectedJob] = useState<JobApplication | null>(null);
    const [jobAlerts, setJobAlerts] = useState<JobAlert[]>([]);
    const [isSyncing, setIsSyncing] = useState(false);
    const [showAlertModal, setShowAlertModal] = useState(false);
    const [showIntegrationsModal, setShowIntegrationsModal] = useState(false);
    const [boardSearch, setBoardSearch] = useState('');
    const [selectedJobIds, setSelectedJobIds] = useState<string[]>([]);
    const [activeId, setActiveId] = useState<string | null>(null);
    const [isLoadingJobs, setIsLoadingJobs] = useState(true);

    const toggleJobSelection = (id: string) => {
        setSelectedJobIds(prev => 
            prev.includes(id) ? prev.filter(i => i !== id) : [...prev, id]
        );
    };

    const handleBulkUpdateStatus = async (status: StageId) => {
        for (const id of selectedJobIds) {
            await handleUpdateJob(id, { status });
        }
        setSelectedJobIds([]);
    };

    const handleBulkDelete = async () => {
        for (const id of selectedJobIds) {
            await handleDeleteJob(id);
        }
        setSelectedJobIds([]);
    };

    // DnD Sensors
    const sensors = useSensors(
        useSensor(PointerSensor, { activationConstraint: { distance: 8 } }),
        useSensor(KeyboardSensor, { coordinateGetter: sortableKeyboardCoordinates })
    );

    useEffect(() => {
        setIsLoadingJobs(true);
        const savedAlerts = localStorage.getItem('huntdesk_job_alerts');
        if (savedAlerts) {
            try { setJobAlerts(JSON.parse(savedAlerts)); } catch (e) { console.error(e); }
        }

        let unsubscribe: () => void;
        
        const finishLoading = () => {
            // Guarantee loading screen shows for at least a few seconds to let animations run
            setTimeout(() => setIsLoadingJobs(false), 3500);
        };

        // Use Firestore if logged in
        if (auth.currentUser) {
            unsubscribe = jobService.subscribeToJobs((syncedJobs) => {
                // Deduplicate jobs by ID to prevent key collisions
                const uniqueJobs = Array.from(new Map(syncedJobs.map(j => [j.id, j])).values()) as JobApplication[];
                setJobs(uniqueJobs);
                finishLoading();
            });
        } else {
            // Fallback to localStorage for guest users
            const savedJobs = localStorage.getItem('huntdesk_saved_jobs');
            if (savedJobs) {
                try { 
                    const parsed = JSON.parse(savedJobs);
                    const uniqueJobs = Array.from(new Map(parsed.map((j: any) => [j.id, j])).values()) as JobApplication[];
                    setJobs(uniqueJobs); 
                } catch (e) { console.error(e); }
            }
            finishLoading();
        }
        
        return () => {
            if (unsubscribe) unsubscribe();
        };
    }, []);

    const saveAlerts = (newAlerts: JobAlert[]) => {
        setJobAlerts(newAlerts);
        localStorage.setItem('huntdesk_job_alerts', JSON.stringify(newAlerts));
    };

    const saveJobs = async (newJobs: JobApplication[]) => {
        if (auth.currentUser) {
            // In Firestore mode, we don't need to set state manually as subscribeToJobs handles it
            // But we need to handle the update/create logic
            // For DnD, we'll just update the specific job that moved
        } else {
            setJobs(newJobs);
            localStorage.setItem('huntdesk_saved_jobs', JSON.stringify(newJobs));
        }
    };

    const handleDeleteJob = async (id: string) => {
        if (auth.currentUser) {
            await jobService.deleteJob(id);
        } else {
            const newJobs = jobs.filter(j => j.id !== id);
            saveJobs(newJobs);
        }
    };

    const handleQuickAdd = async (stage: StageId) => {
        const newJobData: Omit<JobApplication, 'id' | 'userId'> = {
            company: 'New Company',
            role: 'New Role',
            status: stage,
            dateAdded: new Date().toLocaleDateString(),
            contacts: [],
            tasks: [],
            notes: ''
        };

        if (auth.currentUser) {
            const id = await jobService.createJob(newJobData);
            // subscribeToJobs will update the list
        } else {
            const newJob: JobApplication = {
                ...newJobData,
                id: `manual-${Date.now()}`,
                userId: 'guest'
            };
            saveJobs([newJob, ...jobs]);
            setSelectedJob(newJob);
        }
    };

    const handleDragStart = (event: DragStartEvent) => {
        setActiveId(event.active.id as string);
    };

    const handleDragOver = async (event: DragOverEvent) => {
        const { active, over } = event;
        if (!over) return;

        const activeId = active.id as string;
        const overId = over.id as string;

        const activeJob = jobs.find(j => j.id === activeId);
        if (!activeJob) return;

        // If dragging over a column
        const isOverAColumn = STAGES.some(s => s.id === overId);
        if (isOverAColumn) {
            if (activeJob.status !== overId) {
                if (auth.currentUser) {
                    await jobService.updateJob(activeId, { status: overId as StageId });
                } else {
                    const newJobs = jobs.map(j => 
                        j.id === activeId ? { ...j, status: overId as StageId } : j
                    );
                    setJobs(newJobs);
                }
            }
            return;
        }

        // If dragging over another card
        const overJob = jobs.find(j => j.id === overId);
        if (overJob && activeJob.status !== overJob.status) {
            if (auth.currentUser) {
                await jobService.updateJob(activeId, { status: overJob.status });
            } else {
                const newJobs = jobs.map(j => 
                    j.id === activeId ? { ...j, status: overJob.status } : j
                );
                setJobs(newJobs);
            }
        }
    };

    const handleDragEnd = async (event: DragEndEvent) => {
        const { active, over } = event;
        setActiveId(null);

        if (!over) return;

        const activeId = active.id as string;
        const overId = over.id as string;

        if (activeId !== overId) {
            const activeIndex = jobs.findIndex(j => j.id === activeId);
            const overIndex = jobs.findIndex(j => j.id === overId);
            
            if (overIndex !== -1) {
                const newJobs = arrayMove(jobs, activeIndex, overIndex);
                if (!auth.currentUser) {
                    saveJobs(newJobs);
                }
            }
        }
    };

    const filteredJobs = useMemo(() => {
        if (!boardSearch) return jobs;
        const s = boardSearch.toLowerCase();
        return jobs.filter(j => 
            j.company.toLowerCase().includes(s) || 
            j.role.toLowerCase().includes(s) ||
            j.location?.toLowerCase().includes(s)
        );
    }, [jobs, boardSearch]);

    const handleUpdateJob = async (jobId: string, updates: Partial<JobApplication>) => {
        if (auth.currentUser) {
            await jobService.updateJob(jobId, updates);
        } else {
            const newJobs = jobs.map(j => j.id === jobId ? { ...j, ...updates } : j);
            setJobs(newJobs);
            saveJobs(newJobs);
            if (selectedJob?.id === jobId) {
                setSelectedJob({ ...selectedJob, ...updates });
            }
        }
    };

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
                const existingKeys = new Set(jobs.map(j => `${j.company.toLowerCase()}-${j.role.toLowerCase()}`));
                const newJobsData = syncedJobs.filter((j: any) => !existingKeys.has(`${j.company.toLowerCase()}-${j.role.toLowerCase()}`)).map((j: any) => ({
                    company: j.company,
                    role: j.role,
                    status: j.status as StageId,
                    dateAdded: j.dateAdded,
                    source: j.source,
                    contacts: [],
                    tasks: [],
                    notes: ''
                }));

                if (newJobsData.length > 0) {
                    if (auth.currentUser) {
                        for (const job of newJobsData) {
                            await jobService.createJob(job);
                        }
                    } else {
                        const newJobs = newJobsData.map((j, idx) => ({
                            ...j,
                            id: `google-${Date.now()}-${idx}`,
                            userId: 'guest'
                        }));
                        saveJobs([...newJobs, ...jobs]);
                    }
                }
            }
        } catch (e) {
            console.error("Sync failed", e);
        } finally {
            setIsSyncing(false);
        }
    };

    const handleAddAlert = (alert: JobAlert) => {
        saveAlerts([...jobAlerts, alert]);
    };

    const handleDeleteAlert = (id: string) => {
        const newAlerts = jobAlerts.filter(a => a.id !== id);
        saveAlerts(newAlerts);
    };

    const activeJob = activeId ? jobs.find(j => j.id === activeId) : null;

    return (
        <div className="h-full flex flex-col font-sans bg-slate-50 relative">
            <AnimatePresence>
                {isLoadingJobs && <LoadingJobs />}
            </AnimatePresence>
            
            <div className={`flex flex-col h-full transition-opacity duration-500 ${isLoadingJobs ? 'opacity-0 pointer-events-none' : 'opacity-100'}`}>
                <div className="px-6 py-3 bg-white border-b border-slate-200 flex flex-col sm:flex-row justify-between items-center gap-4 shrink-0 shadow-sm z-10">
                <div className="flex gap-1.5 p-1 bg-slate-100 rounded-lg w-full sm:w-auto">
                    <button 
                        onClick={() => setActiveTab('board')} 
                        className={`flex-1 sm:flex-none px-6 py-1.5 rounded-md text-sm font-medium transition-all ${
                            activeTab === 'board' 
                            ? 'bg-white text-slate-800 shadow-sm' 
                            : 'text-slate-500 hover:text-slate-700 hover:bg-slate-200/50'
                        }`}
                    >
                        Pipeline
                    </button>
                    <button 
                        onClick={() => setActiveTab('alerts')} 
                        className={`flex-1 sm:flex-none px-6 py-1.5 rounded-md text-sm font-medium transition-all ${
                            activeTab === 'alerts' 
                            ? 'bg-white text-slate-800 shadow-sm' 
                            : 'text-slate-500 hover:text-slate-700 hover:bg-slate-200/50'
                        }`}
                    >
                        Alerts
                    </button>
                </div>
                <div className="flex items-center gap-3 w-full sm:w-auto">
                    {activeTab === 'board' && (
                        <>
                            <div className="hidden sm:flex bg-slate-100 p-1 rounded-lg">
                                <button 
                                    onClick={() => setViewMode('board')}
                                    className={`p-1.5 rounded-md transition-all ${viewMode === 'board' ? 'bg-white text-emerald-600 shadow-sm' : 'text-slate-400 hover:text-slate-600'}`}
                                >
                                    <GripVertical className="w-4 h-4" />
                                </button>
                                <button 
                                    onClick={() => setViewMode('list')}
                                    className={`p-1.5 rounded-md transition-all ${viewMode === 'list' ? 'bg-white text-emerald-600 shadow-sm' : 'text-slate-400 hover:text-slate-600'}`}
                                >
                                    <List className="w-4 h-4" />
                                </button>
                            </div>
                            <div className="relative flex-1 sm:w-64">
                                <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-slate-400" />
                                <input 
                                    type="text"
                                    placeholder="Search pipeline..."
                                    value={boardSearch}
                                    onChange={(e) => setBoardSearch(e.target.value)}
                                    className="w-full pl-9 pr-4 py-1.5 bg-slate-50 border border-slate-200 rounded-lg text-sm text-slate-900 placeholder:text-slate-400 focus:outline-none focus:border-emerald-500 focus:ring-2 focus:ring-emerald-500/20 transition-all font-medium"
                                />
                            </div>
                        </>
                    )}
                    <button 
                        onClick={() => setShowIntegrationsModal(true)}
                        className="px-4 py-1.5 bg-white border border-slate-200 text-slate-600 font-medium text-sm rounded-lg hover:border-slate-300 hover:bg-slate-50 transition-all flex items-center gap-2 shadow-sm"
                    >
                        <Filter className="w-4 h-4 text-slate-400" />
                        <span className="hidden sm:inline">Integrations</span>
                    </button>
                </div>
            </div>

            <div className="flex-1 overflow-hidden relative">
                <AnimatePresence mode="wait">
                    {activeTab === 'alerts' ? (
                        <motion.div key="alerts" initial={{ opacity: 0 }} animate={{ opacity: 1 }} exit={{ opacity: 0 }} className="flex flex-col h-full bg-slate-50/50 overflow-y-auto custom-scrollbar">
                            <div className="max-w-4xl mx-auto w-full p-4 sm:p-8">
                                <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4 mb-8">
                                    <div>
                                        <h2 className="text-2xl font-bold text-slate-900 tracking-tight">Job Alerts</h2>
                                        <p className="text-sm font-medium text-slate-500 mt-1">Get notified about new opportunities</p>
                                    </div>
                                    <button 
                                        onClick={() => setShowAlertModal(true)}
                                        className="w-full sm:w-auto px-5 py-2.5 bg-emerald-600 text-white font-semibold text-sm rounded-lg hover:bg-emerald-700 transition-all shadow-sm flex items-center justify-center gap-2"
                                    >
                                        <Plus className="w-4 h-4" />
                                        Create New Alert
                                    </button>
                                </div>
                                
                                {jobAlerts.length === 0 ? (
                                    <div className="bg-white border-2 border-dashed border-slate-200 rounded-2xl p-12 sm:p-20 flex flex-col items-center justify-center text-center group hover:border-emerald-300 transition-colors">
                                        <div className="w-16 h-16 bg-slate-50 rounded-full flex items-center justify-center mb-6 group-hover:bg-emerald-50 transition-colors">
                                            <Bell className="w-8 h-8 text-slate-400 group-hover:text-emerald-500" />
                                        </div>
                                        <h3 className="text-lg font-bold text-slate-900 mb-2">No active alerts</h3>
                                        <p className="text-sm font-medium text-slate-500 max-w-sm mx-auto mb-6">We'll scan the web for jobs matching your criteria and notify you instantly.</p>
                                        <button 
                                            onClick={() => setShowAlertModal(true)}
                                            className="text-emerald-600 text-sm font-semibold hover:text-emerald-700"
                                        >
                                            Set up your first alert &rarr;
                                        </button>
                                    </div>
                                ) : (
                                    <div className="grid gap-4">
                                        {jobAlerts.map(alert => (
                                            <motion.div 
                                                key={alert.id} 
                                                initial={{ opacity: 0, y: 10 }}
                                                animate={{ opacity: 1, y: 0 }}
                                                className="bg-white p-5 rounded-xl border border-slate-200 shadow-sm flex flex-col sm:flex-row justify-between items-start sm:items-center gap-6 hover:shadow-md hover:border-emerald-200 transition-all group"
                                            >
                                                <div className="flex gap-4 items-center">
                                                    <div className="w-12 h-12 bg-emerald-50 rounded-lg flex items-center justify-center text-emerald-600 group-hover:bg-emerald-600 group-hover:text-white transition-colors duration-200">
                                                        <Bell className="w-6 h-6" />
                                                    </div>
                                                    <div>
                                                        <div className="flex items-center gap-3 mb-1.5">
                                                            <h3 className="font-bold text-slate-900 text-lg tracking-tight">{alert.role}</h3>
                                                            <span className={`px-2 py-0.5 rounded text-[11px] font-medium border ${
                                                                alert.frequency === 'daily' ? 'bg-emerald-50 text-emerald-700 border-emerald-100' : 
                                                                alert.frequency === 'weekly' ? 'bg-blue-50 text-blue-700 border-blue-100' : 
                                                                'bg-slate-50 text-slate-700 border-slate-200'
                                                            }`}>
                                                                <span className="capitalize">{alert.frequency}</span>
                                                            </span>
                                                        </div>
                                                        <div className="flex flex-wrap gap-3 text-[13px] font-medium text-slate-500">
                                                            {alert.location && (
                                                                <span className="flex items-center gap-1">
                                                                    <MapPin className="w-3.5 h-3.5 text-slate-400" />
                                                                    {alert.location}
                                                                </span>
                                                            )}
                                                            {alert.filters?.salary && (
                                                                <span className="flex items-center gap-1">
                                                                    <DollarSign className="w-3.5 h-3.5 text-slate-400" />
                                                                    ${alert.filters.salary}
                                                                </span>
                                                            )}
                                                            {alert.filters?.remote && (
                                                                <span className="flex items-center gap-1 text-emerald-600">
                                                                    <Briefcase className="w-3.5 h-3.5" />
                                                                    Remote
                                                                </span>
                                                            )}
                                                        </div>
                                                    </div>
                                                </div>
                                                <div className="flex items-center gap-3 w-full sm:w-auto border-t sm:border-t-0 pt-4 sm:pt-0 border-slate-100">
                                                    <button 
                                                        onClick={() => handleDeleteAlert(alert.id)}
                                                        className="flex-1 sm:flex-none p-2 text-slate-400 hover:text-rose-500 hover:bg-rose-50 rounded-md transition-all flex items-center justify-center gap-2"
                                                        title="Delete Alert"
                                                    >
                                                        <Trash2 className="w-4 h-4" />
                                                        <span className="sm:hidden text-sm font-medium">Delete</span>
                                                    </button>
                                                </div>
                                            </motion.div>
                                        ))}
                                    </div>
                                )}
                            </div>
                        </motion.div>
                    ) : activeTab === 'board' ? (
                        <div className="flex flex-col h-full">
                            <div className="px-4 sm:px-8 pt-6">
                                <div className="bg-white p-6 rounded-2xl border border-slate-200 shadow-sm flex items-center justify-between">
                                    <div className="flex items-center gap-6">
                                        <div>
                                            <p className="text-xs font-semibold text-slate-500 mb-1">Pipeline Health</p>
                                            <p className="text-2xl font-bold text-slate-900">Good</p>
                                        </div>
                                        <div className="h-10 w-px bg-slate-100" />
                                        <div>
                                            <p className="text-xs font-semibold text-slate-500 mb-1">Interview Rate</p>
                                            <p className="text-2xl font-bold text-emerald-600">12%</p>
                                        </div>
                                    </div>
                                    <div className="flex gap-2">
                                        {STAGES.map(stage => (
                                            <div key={stage.id} className="flex flex-col items-center px-3">
                                                <span className="text-xs font-semibold text-slate-500 mb-1">{stage.label}</span>
                                                <span className="text-lg font-bold text-slate-800">{jobs.filter(j => j.status === stage.id).length}</span>
                                            </div>
                                        ))}
                                    </div>
                                </div>
                            </div>

                            <div className="flex items-center justify-between px-4 sm:px-8 pt-6 pb-2">
                                <div>
                                    <h2 className="text-2xl font-extrabold text-slate-900 tracking-tight">Application Pipeline</h2>
                                    <p className="text-base text-slate-500 mt-1.5 flex items-center gap-2">
                                        Track and manage your application journey
                                        <span className="w-1.5 h-1.5 rounded-full bg-slate-300"></span>
                                        <span className="font-semibold text-emerald-600">{jobs.length} Active Jobs</span>
                                    </p>
                                </div>
                                <div className="flex items-center gap-3">
                                    <button 
                                        onClick={handleSyncGoogle}
                                        disabled={isSyncing}
                                        className="hidden sm:flex items-center gap-2 px-4 py-2 bg-white border border-slate-200 text-slate-700 text-sm font-semibold rounded-lg hover:border-slate-300 hover:bg-slate-50 transition-all shadow-sm disabled:opacity-50 disabled:cursor-not-allowed group"
                                    >
                                        {isSyncing ? (
                                            <div className="w-4 h-4 border-2 border-slate-400 border-t-transparent rounded-full animate-spin" />
                                        ) : (
                                            <svg className="w-4 h-4 text-emerald-500 group-hover:scale-105 transition-transform" viewBox="0 0 24 24" fill="currentColor"><path d="M22.56 12.25c0-.78-.07-1.53-.2-2.25H12v4.26h5.92c-.26 1.37-1.04 2.53-2.21 3.31v2.77h3.57c2.08-1.92 3.28-4.74 3.28-8.09z" /><path fill="#34A853" d="M12 23c2.97 0 5.46-.98 7.28-2.66l-3.57-2.77c-.98.66-2.23 1.06-3.71 1.06-2.86 0-5.29-1.93-6.16-4.53H2.18v2.84C3.99 20.53 7.7 23 12 23z" /><path fill="#FBBC05" d="M5.84 14.09c-.22-.66-.35-1.36-.35-2.09s.13-1.43.35-2.09V7.07H2.18C1.43 8.55 1 10.22 1 12s.43 3.45 1.18 4.93l2.85-2.22.81-.62z" /><path fill="#EA4335" d="M12 5.38c1.62 0 3.06.56 4.21 1.64l3.15-3.15C17.45 2.09 14.97 1 12 1 7.7 1 3.99 3.47 2.18 7.07l3.66 2.84c.87-2.6 3.3-4.53 6.16-4.53z" /></svg>
                                        )}
                                        {isSyncing ? 'Syncing...' : 'Sync Gmail'}
                                    </button>
                                    <button 
                                        onClick={() => handleQuickAdd('Saved')}
                                        className="flex items-center gap-2 px-4 py-2 bg-emerald-600 text-white text-sm font-semibold rounded-lg hover:bg-emerald-700 transition-all shadow-sm"
                                    >
                                        <Plus className="w-4 h-4" />
                                        Add Job
                                    </button>
                                </div>
                            </div>
                            
                            
                            {selectedJobIds.length > 0 && (
                                <div className="fixed bottom-6 left-1/2 -translate-x-1/2 bg-white px-6 py-3 rounded-full shadow-2xl border border-slate-200 flex items-center gap-4 z-50">
                                    <span className="text-sm font-semibold text-slate-700">{selectedJobIds.length} selected</span>
                                    <button onClick={() => handleBulkUpdateStatus('Applied')} className="text-sm font-medium text-emerald-600 hover:text-emerald-700 flex items-center gap-1">
                                        <CheckSquare className="w-4 h-4" /> Mark Applied
                                    </button>
                                    <button onClick={handleBulkDelete} className="text-sm font-medium text-rose-600 hover:text-rose-700 flex items-center gap-1">
                                        <Trash2 className="w-4 h-4" /> Delete
                                    </button>
                                    <button onClick={() => setSelectedJobIds([])} className="text-sm font-medium text-slate-500 hover:text-slate-700">Cancel</button>
                                </div>
                            )}

                            <div className="flex-1 overflow-x-auto custom-scrollbar p-4 sm:p-8 pb-32 sm:pb-8 bg-gradient-to-br from-slate-50 via-slate-100/50 to-slate-200/50 relative">
                                {/* Grid background */}
                                <div className="absolute inset-0 bg-[linear-gradient(to_right,#80808012_1px,transparent_1px),linear-gradient(to_bottom,#80808012_1px,transparent_1px)] bg-[size:24px_24px] [mask-image:radial-gradient(ellipse_60%_50%_at_50%_0%,#000_70%,transparent_100%)] pointer-events-none"></div>
                                {viewMode === 'board' ? (
                                    <DndContext
                                        sensors={sensors}
                                        collisionDetection={closestCorners}
                                        onDragStart={handleDragStart}
                                        onDragOver={handleDragOver}
                                        onDragEnd={handleDragEnd}
                                    >
                                        <div className="flex gap-8 h-full min-h-[700px] items-center mx-auto w-max" style={{ perspective: '2000px', transformStyle: 'preserve-3d' }}>
                                            {STAGES.map((stage, idx) => (
                                                <KanbanColumn index={idx} 
                                                    key={stage.id} 
                                                    stage={stage} 
                                                    jobs={filteredJobs.filter(j => j.status === stage.id)}
                                                    onSelect={setSelectedJob}
                                                    onDelete={handleDeleteJob}
                                                    onQuickAdd={handleQuickAdd}
                                                    selectedJobIds={selectedJobIds}
                                                    toggleJobSelection={toggleJobSelection}
                                                />
                                            ))}
                                        </div>

                                        <DragOverlay dropAnimation={{
                                            sideEffects: defaultDropAnimationSideEffects({
                                                styles: {
                                                    active: {
                                                        opacity: '0.5',
                                                    },
                                                },
                                            }),
                                        }}>
                                            {activeJob ? (
                                                <div className="bg-white p-4 rounded-xl border-2 border-emerald-500 shadow-xl w-80 rotate-2 scale-105 cursor-grabbing">
                                                    <div className="flex justify-between items-start mb-3">
                                                        <div className="w-10 h-10 bg-emerald-50 rounded-lg flex items-center justify-center text-emerald-700 font-bold text-sm border border-emerald-100">
                                                            {activeJob.company.charAt(0)}
                                                        </div>
                                                        <span className="px-2 py-0.5 rounded text-[10px] font-medium bg-emerald-50 text-emerald-700">
                                                            {activeJob.status}
                                                        </span>
                                                    </div>
                                                    <h4 className="font-semibold text-slate-900 text-[13px] mb-0.5">{activeJob.role}</h4>
                                                    <p className="text-xs text-slate-500 font-medium">{activeJob.company}</p>
                                                </div>
                                            ) : null}
                                        </DragOverlay>
                                    </DndContext>
                                ) : (
                                    <div className="max-w-5xl mx-auto space-y-4">
                                        {STAGES.map(stage => {
                                            const stageJobs = filteredJobs.filter(j => j.status === stage.id);
                                            if (stageJobs.length === 0) return null;
                                            return (
                                                <div key={stage.id} className="space-y-3">
                                                    <div className="flex items-center gap-2 px-1">
                                                        <div className={`p-1 rounded-md bg-${stage.color}-50 text-${stage.color}-600`}>
                                                            {stage.icon}
                                                        </div>
                                                        <h3 className="text-[13px] font-bold text-slate-800">{stage.label}</h3>
                                                        <span className="text-[11px] font-medium text-slate-500 bg-slate-200 px-1.5 py-0.5 rounded-full">{stageJobs.length}</span>
                                                    </div>
                                                    <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 gap-3">
                                                        {stageJobs.map(job => (
                                                            <SortableCard 
                                                                key={job.id} 
                                                                job={job} 
                                                                onSelect={setSelectedJob} 
                                                                onDelete={handleDeleteJob}
                                                                isSelected={selectedJobIds.includes(job.id)}
                                                                onToggleSelect={toggleJobSelection}
                                                            />
                                                        ))}
                                                    </div>
                                                </div>
                                            );
                                        })}
                                        {filteredJobs.length === 0 && (
                                            <div className="py-20 text-center">
                                                <p className="text-slate-500 font-medium">No applications found matching your search.</p>
                                            </div>
                                        )}
                                    </div>
                                )}
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
                        initialQuery={resumeData.title || ''}
                        initialLocation={resumeData.contactInfo.location || ''}
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
                        onUpdate={(updates) => handleUpdateJob(selectedJob.id, updates)}
                    />
                )}
            </AnimatePresence>
            </div>
        </div>
    );
};

export default JobTracker;
