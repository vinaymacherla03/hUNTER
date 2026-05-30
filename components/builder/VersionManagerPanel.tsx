
import React, { useState } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { Save, Trash2, Edit2, Check, Clock, FileText, ChevronRight, X, Plus } from 'lucide-react';
import { ResumeVersion, ResumeData, Customization, TemplateKey } from '../../types';
import { useResumeVersions } from '../../hooks/useResumeVersions';
import ConfirmModal from './ConfirmModal';

interface VersionManagerPanelProps {
    currentData: ResumeData;
    currentCustomization: Customization;
    currentTemplate: TemplateKey;
    currentJobDescription?: string;
    onLoadVersion: (version: ResumeVersion) => void;
}

const VersionManagerPanel: React.FC<VersionManagerPanelProps> = ({
    currentData,
    currentCustomization,
    currentTemplate,
    currentJobDescription,
    onLoadVersion
}) => {
    const { versions, saveVersion, deleteVersion, renameVersion } = useResumeVersions();
    const [newVersionName, setNewVersionName] = useState('');
    const [editingId, setEditingId] = useState<string | null>(null);
    const [editName, setEditName] = useState('');
    const [isAdding, setIsAdding] = useState(false);
    const [confirmState, setConfirmState] = useState<{
        isOpen: boolean;
        title: string;
        message: string;
        onConfirm: () => void;
        variant: 'danger' | 'primary';
    }>({
        isOpen: false,
        title: '',
        message: '',
        onConfirm: () => {},
        variant: 'primary'
    });

    const handleSave = () => {
        if (!newVersionName.trim()) return;
        saveVersion(newVersionName, currentData, currentCustomization, currentTemplate, currentJobDescription);
        setNewVersionName('');
        setIsAdding(false);
    };

    const handleRename = (id: string) => {
        if (!editName.trim()) return;
        renameVersion(id, editName);
        setEditingId(null);
    };

    return (
        <div className="space-y-8">
            {/* Save New Version Section */}
            <div className="bg-white rounded-3xl border border-slate-100 p-6 shadow-sm">
                {!isAdding ? (
                    <button 
                        onClick={() => setIsAdding(true)}
                        className="w-full py-4 border-2 border-dashed border-slate-200 rounded-2xl flex items-center justify-center gap-3 text-slate-500 hover:border-emerald-500 hover:text-emerald-600 hover:bg-emerald-50/30 transition-all group"
                    >
                        <Plus className="w-5 h-5 group-hover:rotate-90 transition-transform duration-300" />
                        <span className="font-black text-xs uppercase tracking-widest">Save Current as New Version</span>
                    </button>
                ) : (
                    <motion.div 
                        initial={{ opacity: 0, y: 10 }}
                        animate={{ opacity: 1, y: 0 }}
                        className="space-y-4"
                    >
                        <div className="flex items-center justify-between mb-2">
                            <h3 className="text-[10px] font-black uppercase tracking-widest text-slate-400">New Version Name</h3>
                            <button onClick={() => setIsAdding(false)} className="text-slate-400 hover:text-slate-600">
                                <X className="w-4 h-4" />
                            </button>
                        </div>
                        <div className="flex gap-3">
                            <input
                                autoFocus
                                type="text"
                                placeholder="e.g., Software Engineer - Google"
                                value={newVersionName}
                                onChange={(e) => setNewVersionName(e.target.value)}
                                className="flex-1 px-4 py-3 rounded-xl border border-slate-200 focus:ring-2 focus:ring-emerald-500 focus:border-emerald-500 outline-none transition-all text-sm font-medium"
                                onKeyDown={(e) => e.key === 'Enter' && handleSave()}
                            />
                            <button
                                onClick={handleSave}
                                disabled={!newVersionName.trim()}
                                className="px-6 py-3 bg-emerald-600 text-white rounded-xl font-black text-[10px] uppercase tracking-widest hover:bg-emerald-700 disabled:opacity-50 disabled:cursor-not-allowed flex items-center gap-2 transition-all shadow-lg shadow-emerald-200"
                            >
                                <Save className="w-4 h-4" />
                                Save
                            </button>
                        </div>
                    </motion.div>
                )}
            </div>

            {/* Saved Versions List */}
            <div className="space-y-4">
                <div className="flex items-center justify-between px-2">
                    <h3 className="text-[10px] font-black uppercase tracking-widest text-slate-400">Saved Versions ({versions.length})</h3>
                </div>

                {versions.length === 0 ? (
                    <div className="bg-slate-50/50 rounded-3xl border border-dashed border-slate-200 py-16 text-center">
                        <div className="w-16 h-16 bg-white rounded-2xl shadow-sm flex items-center justify-center mx-auto mb-4">
                            <FileText className="w-8 h-8 text-slate-200" />
                        </div>
                        <p className="text-sm text-slate-400 font-medium tracking-tight">No versions saved yet.</p>
                    </div>
                ) : (
                    <div className="grid gap-4">
                        {versions.map((version) => (
                            <motion.div
                                layout
                                key={version.id}
                                className="group bg-white p-5 rounded-3xl border border-slate-100 hover:border-emerald-200 hover:shadow-xl hover:shadow-emerald-500/5 transition-all flex items-center justify-between gap-4"
                            >
                                <div className="flex-1 min-w-0">
                                    {editingId === version.id ? (
                                        <div className="flex items-center gap-2">
                                            <input
                                                autoFocus
                                                type="text"
                                                value={editName}
                                                onChange={(e) => setEditName(e.target.value)}
                                                className="flex-1 px-3 py-2 rounded-xl border border-emerald-300 outline-none focus:ring-2 focus:ring-emerald-500 text-sm font-medium"
                                                onKeyDown={(e) => e.key === 'Enter' && handleRename(version.id)}
                                            />
                                            <button onClick={() => handleRename(version.id)} className="p-2 text-emerald-600 hover:bg-emerald-50 rounded-lg transition-colors">
                                                <Check className="w-4 h-4" />
                                            </button>
                                            <button onClick={() => setEditingId(null)} className="p-2 text-slate-400 hover:bg-slate-50 rounded-lg transition-colors">
                                                <X className="w-4 h-4" />
                                            </button>
                                        </div>
                                    ) : (
                                        <div className="flex items-center gap-4">
                                            <div className="w-12 h-12 bg-slate-50 rounded-2xl flex items-center justify-center text-slate-400 group-hover:bg-emerald-50 group-hover:text-emerald-500 transition-all duration-300">
                                                <FileText className="w-6 h-6" />
                                            </div>
                                            <div className="min-w-0">
                                                <h4 className="font-black text-slate-900 truncate tracking-tight">{version.name}</h4>
                                                <div className="flex items-center gap-3 mt-1">
                                                    <p className="text-[10px] text-slate-400 font-bold flex items-center gap-1 uppercase tracking-wider">
                                                        <Clock className="w-3 h-3" />
                                                        {version.timestamp?.toDate ? version.timestamp.toDate().toLocaleDateString() : new Date(version.timestamp as any).toLocaleDateString()}
                                                    </p>
                                                    <span className="w-1 h-1 rounded-full bg-slate-200" />
                                                    <p className="text-[10px] text-slate-400 font-bold uppercase tracking-wider">
                                                        {version.timestamp?.toDate ? version.timestamp.toDate().toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' }) : new Date(version.timestamp as any).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })}
                                                    </p>
                                                </div>
                                            </div>
                                        </div>
                                    )}
                                </div>

                                <div className="flex items-center gap-2">
                                    <div className="flex items-center gap-1 opacity-0 group-hover:opacity-100 transition-all duration-300 -translate-x-2 group-hover:translate-x-0">
                                        <button
                                            onClick={() => {
                                                setEditingId(version.id);
                                                setEditName(version.name);
                                            }}
                                            className="p-2.5 text-slate-400 hover:text-slate-900 hover:bg-slate-50 rounded-xl transition-all"
                                            title="Rename"
                                        >
                                            <Edit2 className="w-4 h-4" />
                                        </button>
                                         <button
                                            onClick={() => {
                                                setConfirmState({
                                                    isOpen: true,
                                                    title: 'Delete Version',
                                                    message: `Are you sure you want to delete "${version.name}"? This action cannot be undone.`,
                                                    onConfirm: () => deleteVersion(version.id),
                                                    variant: 'danger'
                                                });
                                            }}
                                            className="p-2.5 text-slate-400 hover:text-rose-600 hover:bg-rose-50 rounded-xl transition-all"
                                            title="Delete"
                                        >
                                            <Trash2 className="w-4 h-4" />
                                        </button>
                                    </div>
                                    <button
                                        onClick={() => {
                                            setConfirmState({
                                                isOpen: true,
                                                title: 'Load Version',
                                                message: `Load "${version.name}"? Your current unsaved changes will be replaced.`,
                                                onConfirm: () => onLoadVersion(version),
                                                variant: 'primary'
                                            });
                                        }}
                                        className="px-5 py-2.5 bg-slate-900 text-white rounded-xl font-black text-[10px] uppercase tracking-widest hover:bg-emerald-600 hover:shadow-lg hover:shadow-emerald-500/20 transition-all flex items-center gap-2 active:scale-95"
                                    >
                                        Load
                                        <ChevronRight className="w-3.5 h-3.5" />
                                    </button>
                                </div>
                            </motion.div>
                        ))}
                    </div>
                )}
            </div>

            <ConfirmModal 
                isOpen={confirmState.isOpen}
                title={confirmState.title}
                message={confirmState.message}
                onConfirm={confirmState.onConfirm}
                onCancel={() => setConfirmState(prev => ({ ...prev, isOpen: false }))}
                variant={confirmState.variant}
                confirmText={confirmState.variant === 'danger' ? 'Delete' : 'Load Version'}
            />
        </div>
    );
};

export default VersionManagerPanel;
