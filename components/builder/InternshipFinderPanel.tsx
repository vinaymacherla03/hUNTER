import React, { useState } from 'react';
import { motion } from 'framer-motion';
import { ResumeData } from '../../types';
import { findMatchingJobs } from '../../services/geminiService';

interface InternshipFinderPanelProps {
    resumeData: ResumeData;
}

const InternshipFinderPanel: React.FC<InternshipFinderPanelProps> = ({ resumeData }) => {
    const [jobs, setJobs] = useState<any[]>([]);
    const [loading, setLoading] = useState(false);
    const [location, setLocation] = useState('Remote');

    const handleSearch = async () => {
        setLoading(true);
        const result = await findMatchingJobs(resumeData, location, 'internship', {});
        setJobs(result.jobs.filter(j => j.role.toLowerCase().includes('intern')));
        setLoading(false);
    };

    return (
        <div className="space-y-8">
            <div className="bg-white p-6 rounded-2xl border border-slate-100 shadow-sm">
                <h3 className="text-lg font-bold text-slate-900 mb-4">Find Internships</h3>
                <div className="flex gap-4">
                    <input 
                        type="text" 
                        value={location} 
                        onChange={(e) => setLocation(e.target.value)} 
                        placeholder="Location (e.g. Remote, New York)"
                        className="flex-1 px-4 py-2 border border-slate-300 rounded-lg"
                    />
                    <button 
                        onClick={handleSearch}
                        disabled={loading}
                        className="px-6 py-2 bg-emerald-600 text-white font-bold rounded-lg hover:bg-emerald-700 disabled:opacity-50"
                    >
                        {loading ? 'Searching...' : 'Find Internships'}
                    </button>
                </div>
            </div>

            {jobs.length > 0 && (
                <div className="space-y-4">
                    {jobs.map((job, index) => (
                        <div key={index} className="bg-white p-6 rounded-2xl border border-slate-100 shadow-sm flex justify-between items-center">
                            <div>
                                <h4 className="font-bold text-slate-900">{job.role}</h4>
                                <p className="text-sm text-slate-600">{job.company} • {job.location}</p>
                            </div>
                            <a href={job.link} target="_blank" rel="noopener noreferrer" className="px-4 py-2 bg-slate-900 text-white rounded-lg text-sm font-bold">
                                Apply
                            </a>
                        </div>
                    ))}
                </div>
            )}
        </div>
    );
};

export default InternshipFinderPanel;
