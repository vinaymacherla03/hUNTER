
import React, { useState } from 'react';
import { motion } from 'framer-motion';
import { CalendarService } from '../../services/calendarService';
import { JobApplication } from '../../types';

interface ScheduleInterviewModalProps {
    job: JobApplication;
    onClose: () => void;
    onSuccess: () => void;
}

const ScheduleInterviewModal: React.FC<ScheduleInterviewModalProps> = ({ job, onClose, onSuccess }) => {
    const [date, setDate] = useState('');
    const [time, setTime] = useState('');
    const [loading, setLoading] = useState(false);
    const [addMeetLink, setAddMeetLink] = useState(true);

    const handleSchedule = async (e: React.FormEvent) => {
        e.preventDefault();
        if (!date || !time) return;
        
        setLoading(true);
        try {
            const dateTime = new Date(`${date}T${time}`);
            const title = `Interview - ${job.company}`;
            const description = `Role: ${job.role}\n\nScheduled via HuntDesk.`;
            
            await CalendarService.createEvent(title, dateTime, description);
            onSuccess();
            onClose();
        } catch (error) {
            console.error(error);
            alert("Failed to schedule interview. Please ensure your Calendar is connected.");
        } finally {
            setLoading(false);
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
                className="relative z-10 w-full max-w-md bg-white rounded-2xl shadow-2xl overflow-hidden"
            >
                <div className="p-6 border-b border-slate-100 bg-slate-50/50">
                    <h2 className="text-xl font-bold text-slate-900">Schedule Interview</h2>
                    <p className="text-sm text-slate-500 mt-1">For {job.role} at {job.company}</p>
                </div>

                <form onSubmit={handleSchedule} className="p-6 space-y-4">
                    <div>
                        <label className="block text-sm font-bold text-slate-700 mb-2">Date</label>
                        <input 
                            type="date" 
                            required
                            value={date}
                            onChange={(e) => setDate(e.target.value)}
                            className="w-full p-2.5 border border-slate-300 rounded-lg focus:ring-2 focus:ring-emerald-500/20 focus:border-emerald-500 outline-none transition-all"
                        />
                    </div>
                    <div>
                        <label className="block text-sm font-bold text-slate-700 mb-2">Time</label>
                        <input 
                            type="time" 
                            required
                            value={time}
                            onChange={(e) => setTime(e.target.value)}
                            className="w-full p-2.5 border border-slate-300 rounded-lg focus:ring-2 focus:ring-emerald-500/20 focus:border-emerald-500 outline-none transition-all"
                        />
                    </div>
                    
                    <div className="flex items-center gap-3 p-3 bg-emerald-50 border border-emerald-100 rounded-lg">
                        <div className="flex items-center h-5">
                            <input
                                id="meet-link"
                                type="checkbox"
                                checked={addMeetLink}
                                onChange={(e) => setAddMeetLink(e.target.checked)}
                                className="w-4 h-4 text-emerald-600 border-gray-300 rounded focus:ring-emerald-500"
                                disabled // Always enabled for this demo
                            />
                        </div>
                        <div className="ml-2 text-sm">
                            <label htmlFor="meet-link" className="font-medium text-emerald-900">Add Google Meet Link</label>
                            <p className="text-xs text-emerald-700">A conference link will be added to the event.</p>
                        </div>
                    </div>

                    <div className="flex gap-3 pt-4">
                        <button 
                            type="button" 
                            onClick={onClose}
                            className="flex-1 px-4 py-2.5 text-sm font-bold text-slate-600 bg-slate-100 hover:bg-slate-200 rounded-xl transition-colors"
                        >
                            Cancel
                        </button>
                        <button 
                            type="submit" 
                            disabled={loading}
                            className="flex-1 px-4 py-2.5 text-sm font-bold text-white bg-slate-900 hover:bg-slate-800 rounded-xl transition-colors shadow-lg shadow-slate-900/10 flex items-center justify-center gap-2"
                        >
                            {loading ? (
                                <>
                                    <span className="w-4 h-4 border-2 border-white/30 border-t-white rounded-full animate-spin" />
                                    <span>Syncing...</span>
                                </>
                            ) : (
                                'Add to Calendar'
                            )}
                        </button>
                    </div>
                </form>
            </motion.div>
        </div>
    );
};

export default ScheduleInterviewModal;
