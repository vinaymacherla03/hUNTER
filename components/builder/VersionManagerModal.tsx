
import React, { useState } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { X, Save, Trash2, Edit2, Check, Clock, FileText, ChevronRight, GitCompare } from 'lucide-react';
import { ResumeVersion, ResumeData, Customization, TemplateKey } from '../../types';
import { useResumeVersions } from '../../hooks/useResumeVersions';
import ConfirmModal from './ConfirmModal';
import CompareVersionsModal from './CompareVersionsModal';

interface VersionManagerModalProps {
    isOpen: boolean;
    onClose: () => void;
    currentData: ResumeData;
    currentCustomization: Customization;
    currentTemplate: TemplateKey;
    currentJobDescription?: string;
    onLoadVersion: (version: ResumeVersion) => void;
}

const VersionManagerModal = React.forwardRef<HTMLDivElement, VersionManagerModalProps>(({
    isOpen,
    onClose,
    currentData,
    currentCustomization,
    currentTemplate,
    currentJobDescription,
    onLoadVersion
}, ref) => {
    const { versions, saveVersion, deleteVersion, renameVersion } = useResumeVersions();
    const [newVersionName, setNewVersionName] = useState('');
    const [editingId, setEditingId] = useState<string | null>(null);
    const [editName, setEditName] = useState('');
    const [compareState, setCompareState] = useState<{ isOpen: boolean; versionData: ResumeData | null; versionName: string }>({
        isOpen: false,
        versionData: null,
        versionName: ''
    });
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
    };

    const handleRename = (id: string) => {
        if (!editName.trim()) return;
        renameVersion(id, editName);
        setEditingId(null);
    };

    return (
        <motion.div 
            ref={ref}
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/50 backdrop-blur-sm"
        >
                    <motion.div
                        initial={{ opacity: 0, scale: 0.95 }}
                        animate={{ opacity: 1, scale: 1 }}
                        exit={{ opacity: 0, scale: 0.95 }}
                        className="bg-white rounded-2xl shadow-2xl w-full max-w-2xl overflow-hidden flex flex-col max-h-[80vh]"
                    >
                    <div className="p-6 border-b border-slate-100 flex items-center justify-between bg-slate-50/50">
                        <div>
                            <h2 className="text-xl font-bold text-slate-900 flex items-center gap-2">
                                <Clock className="w-5 h-5 text-emerald-500" />
                                Resume Versions
                            </h2>
                            <p className="text-sm text-slate-500">Save and manage multiple versions of your resume.</p>
                        </div>
                        <button onClick={onClose} className="p-2 hover:bg-slate-100 rounded-full transition-colors">
                            <X className="w-5 h-5 text-slate-400" />
                        </button>
                    </div>

                    <div className="p-6 border-b border-slate-100">
                        <div className="flex gap-3">
                            <input
                                type="text"
                                placeholder="Version name (e.g., Software Engineer - Google)"
                                value={newVersionName}
                                onChange={(e) => setNewVersionName(e.target.value)}
                                className="flex-1 px-4 py-2 rounded-xl border border-slate-200 focus:ring-2 focus:ring-emerald-500 focus:border-emerald-500 outline-none transition-all"
                                onKeyDown={(e) => e.key === 'Enter' && handleSave()}
                            />
                            <button
                                onClick={handleSave}
                                disabled={!newVersionName.trim()}
                                className="px-6 py-2 bg-emerald-600 text-white rounded-xl font-semibold hover:bg-emerald-700 disabled:opacity-50 disabled:cursor-not-allowed flex items-center gap-2 transition-all shadow-lg shadow-emerald-200"
                            >
                                <Save className="w-4 h-4" />
                                Save Current
                            </button>
                        </div>
                    </div>

                    <div className="flex-1 overflow-y-auto p-6 space-y-4">
                        {versions.length === 0 ? (
                            <div className="text-center py-12">
                                <div className="w-16 h-16 bg-slate-50 rounded-full flex items-center justify-center mx-auto mb-4">
                                    <FileText className="w-8 h-8 text-slate-300" />
                                </div>
                                <p className="text-slate-500">No versions saved yet.</p>
                            </div>
                        ) : (
                            versions.map((version) => (
                                <div
                                    key={version.id}
                                    className="group p-4 rounded-2xl border border-slate-100 hover:border-emerald-200 hover:bg-emerald-50/30 transition-all flex items-center justify-between gap-4"
                                >
                                    <div className="flex-1 min-w-0">
                                        {editingId === version.id ? (
                                            <div className="flex items-center gap-2">
                                                <input
                                                    autoFocus
                                                    type="text"
                                                    value={editName}
                                                    onChange={(e) => setEditName(e.target.value)}
                                                    className="flex-1 px-3 py-1 rounded-lg border border-emerald-300 outline-none focus:ring-2 focus:ring-emerald-500"
                                                    onKeyDown={(e) => e.key === 'Enter' && handleRename(version.id)}
                                                />
                                                <button onClick={() => handleRename(version.id)} className="p-1 text-emerald-600 hover:bg-emerald-100 rounded">
                                                    <Check className="w-4 h-4" />
                                                </button>
                                                <button onClick={() => setEditingId(null)} className="p-1 text-slate-400 hover:bg-slate-100 rounded">
                                                    <X className="w-4 h-4" />
                                                </button>
                                            </div>
                                        ) : (
                                            <div className="flex items-center gap-3">
                                                <div className="w-10 h-10 bg-white rounded-xl border border-slate-100 flex items-center justify-center text-slate-400 group-hover:text-emerald-500 transition-colors">
                                                    <FileText className="w-5 h-5" />
                                                </div>
                                                <div>
                                                    <h3 className="font-bold text-slate-900 truncate">{version.name}</h3>
                                                    <p className="text-xs text-slate-400 flex items-center gap-1">
                                                        <Clock className="w-3 h-3" />
                                                        {version.timestamp?.toDate ? version.timestamp.toDate().toLocaleString() : new Date(version.timestamp as any).toLocaleString()}
                                                    </p>
                                                </div>
                                            </div>
                                        )}
                                    </div>

                                    <div className="flex items-center gap-2 opacity-0 group-hover:opacity-100 transition-opacity">
                                        <button
                                            onClick={() => {
                                                setCompareState({
                                                    isOpen: true,
                                                    versionData: version.resumeData,
                                                    versionName: version.name
                                                });
                                            }}
                                            className="p-2 text-slate-400 hover:text-blue-600 hover:bg-blue-50 rounded-lg transition-all"
                                            title="Compare"
                                        >
                                            <GitCompare className="w-4 h-4" />
                                        </button>
                                        <button
                                            onClick={() => {
                                                setEditingId(version.id);
                                                setEditName(version.name);
                                            }}
                                            className="p-2 text-slate-400 hover:text-slate-600 hover:bg-slate-100 rounded-lg transition-all"
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
                                            className="p-2.5 text-slate-400 hover:text-rose-600 hover:bg-rose-50 rounded-lg transition-all"
                                            title="Delete"
                                        >
                                            <Trash2 className="w-4 h-4" />
                                        </button>
                                        <button
                                            onClick={() => {
                                                setConfirmState({
                                                    isOpen: true,
                                                    title: 'Load Version',
                                                    message: `Load "${version.name}"? Your current unsaved changes will be replaced.`,
                                                    onConfirm: () => {
                                                        onLoadVersion(version);
                                                        onClose();
                                                    },
                                                    variant: 'primary'
                                                });
                                            }}
                                            className="px-4 py-2 bg-white text-emerald-600 border border-emerald-200 rounded-xl font-bold hover:bg-emerald-600 hover:text-white transition-all flex items-center gap-2"
                                        >
                                            Load
                                            <ChevronRight className="w-4 h-4" />
                                        </button>
                                    </div>
                                </div>
                            ))
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
                </motion.div>

                {compareState.isOpen && compareState.versionData && (
                    <CompareVersionsModal
                        isOpen={compareState.isOpen}
                        onClose={() => setCompareState(prev => ({ ...prev, isOpen: false }))}
                        currentData={currentData}
                        versionData={compareState.versionData}
                        versionName={compareState.versionName}
                    />
                )}
        </motion.div>
    );
});

VersionManagerModal.displayName = 'VersionManagerModal';

export default VersionManagerModal;
