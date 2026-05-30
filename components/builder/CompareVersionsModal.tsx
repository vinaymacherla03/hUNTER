import React from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { X, ArrowRight, Save, LayoutTemplate } from 'lucide-react';
import { ResumeData } from '../../types';

interface CompareVersionsModalProps {
    isOpen: boolean;
    onClose: () => void;
    currentData: ResumeData;
    versionData: ResumeData;
    versionName: string;
}

const CompareVersionsModal: React.FC<CompareVersionsModalProps> = ({
    isOpen,
    onClose,
    currentData,
    versionData,
    versionName
}) => {
    if (!isOpen) return null;

    const renderTextDiff = (current: string = '', version: string = '') => {
        if (current === version) return <p className="text-slate-600">{current || <span className="italic text-slate-400">Empty</span>}</p>;
        return (
            <div className="space-y-4">
                <div className="bg-rose-50 p-3 rounded-lg border border-rose-100">
                    <p className="text-xs font-semibold text-rose-500 mb-1 uppercase tracking-wider">Saved Version ({versionName})</p>
                    <p className="text-rose-900">{version || <span className="italic opacity-50">Empty</span>}</p>
                </div>
                <div className="bg-emerald-50 p-3 rounded-lg border border-emerald-100">
                    <p className="text-xs font-semibold text-emerald-600 mb-1 uppercase tracking-wider">Current Working Version</p>
                    <p className="text-emerald-900">{current || <span className="italic opacity-50">Empty</span>}</p>
                </div>
            </div>
        );
    };

    const renderArrayDiff = (current: any[] = [], version: any[] = [], renderItem: (item: any) => React.ReactNode) => {
        return (
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <div className="border border-slate-200 rounded-xl p-4 bg-slate-50/50">
                    <h4 className="text-sm font-bold text-slate-700 mb-4 border-b border-slate-200 pb-2">Saved Version ({versionName})</h4>
                    <div className="space-y-4">
                        {version.length === 0 ? (
                            <p className="text-sm text-slate-400 italic">No items</p>
                        ) : (
                            version.map((item, idx) => (
                                <div key={idx} className="bg-white p-3 rounded-lg border border-slate-200 shadow-sm">
                                    {renderItem(item)}
                                </div>
                            ))
                        )}
                    </div>
                </div>
                <div className="border border-emerald-200 rounded-xl p-4 bg-emerald-50/30">
                    <h4 className="text-sm font-bold text-emerald-700 mb-4 border-b border-emerald-200 pb-2">Current Working Version</h4>
                    <div className="space-y-4">
                        {current.length === 0 ? (
                            <p className="text-sm text-slate-400 italic">No items</p>
                        ) : (
                            current.map((item, idx) => (
                                <div key={idx} className="bg-white p-3 rounded-lg border border-emerald-100 shadow-sm">
                                    {renderItem(item)}
                                </div>
                            ))
                        )}
                    </div>
                </div>
            </div>
        );
    }

    return (
        <AnimatePresence>
            <motion.div 
                initial={{ opacity: 0 }}
                animate={{ opacity: 1 }}
                exit={{ opacity: 0 }}
                className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/50 backdrop-blur-sm"
            >
                <motion.div
                    initial={{ opacity: 0, scale: 0.95, y: 20 }}
                    animate={{ opacity: 1, scale: 1, y: 0 }}
                    exit={{ opacity: 0, scale: 0.95, y: 20 }}
                    className="bg-white rounded-2xl shadow-2xl w-full max-w-5xl overflow-hidden flex flex-col max-h-[90vh]"
                >
                    <div className="p-6 border-b border-slate-100 flex items-center justify-between bg-slate-50">
                        <div className="flex items-center gap-3">
                            <div className="w-10 h-10 rounded-xl bg-blue-100 flex items-center justify-center text-blue-600">
                                <LayoutTemplate className="w-5 h-5" />
                            </div>
                            <div>
                                <h2 className="text-xl font-bold text-slate-900">Compare Versions</h2>
                                <p className="text-sm text-slate-500">Compare your current working version vs <span className="font-semibold text-slate-700">{versionName}</span></p>
                            </div>
                        </div>
                        <button onClick={onClose} className="p-2 hover:bg-slate-200 rounded-full transition-colors text-slate-500">
                            <X className="w-6 h-6" />
                        </button>
                    </div>

                    <div className="flex-1 overflow-y-auto p-6 space-y-8 bg-slate-50/30">
                        {/* Basic Info */}
                        <section className="space-y-4">
                            <h3 className="text-lg font-bold text-slate-800 border-b border-slate-200 pb-2">Basic Info</h3>
                            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                                <div>
                                    <span className="text-sm font-semibold text-slate-500 mb-2 block">Full Name</span>
                                    {renderTextDiff(currentData.fullName, versionData.fullName)}
                                </div>
                                <div>
                                    <span className="text-sm font-semibold text-slate-500 mb-2 block">Job Title</span>
                                    {renderTextDiff(currentData.title, versionData.title)}
                                </div>
                            </div>
                        </section>

                        {/* Summary */}
                        <section className="space-y-4">
                            <h3 className="text-lg font-bold text-slate-800 border-b border-slate-200 pb-2">Professional Summary</h3>
                            {renderTextDiff(currentData.summary, versionData.summary)}
                        </section>

                        {/* Experience */}
                        <section className="space-y-4">
                            <h3 className="text-lg font-bold text-slate-800 border-b border-slate-200 pb-2">Experience</h3>
                            {renderArrayDiff(currentData.experience || [], versionData.experience || [], (exp) => (
                                <div>
                                    <div className="font-bold text-slate-900">{exp.role}</div>
                                    <div className="text-sm text-emerald-600 font-medium mb-1">{exp.company}</div>
                                    <div className="text-xs text-slate-400 mb-3">{exp.startDate} - {exp.endDate} | {exp.location}</div>
                                    <ul className="list-disc pl-4 space-y-1">
                                        {(exp.achievements || []).map((ach: string, i: number) => (
                                            <li key={i} className="text-sm text-slate-600 leading-relaxed">{ach}</li>
                                        ))}
                                    </ul>
                                </div>
                            ))}
                        </section>

                        {/* Education */}
                        <section className="space-y-4">
                            <h3 className="text-lg font-bold text-slate-800 border-b border-slate-200 pb-2">Education</h3>
                            {renderArrayDiff(currentData.education || [], versionData.education || [], (edu) => (
                                <div>
                                    <div className="font-bold text-slate-900">{edu.degree} in {edu.field}</div>
                                    <div className="text-sm text-emerald-600 font-medium mb-1">{edu.school}</div>
                                    <div className="text-xs text-slate-400">{edu.startDate} - {edu.endDate} | {edu.location}</div>
                                </div>
                            ))}
                        </section>

                        {/* Skills */}
                        <section className="space-y-4">
                            <h3 className="text-lg font-bold text-slate-800 border-b border-slate-200 pb-2">Skills</h3>
                            {renderArrayDiff(currentData.skills || [], versionData.skills || [], (skillCat) => (
                                <div>
                                    <div className="font-bold text-slate-900 mb-2">{skillCat.name}</div>
                                    <div className="flex flex-wrap gap-1.5">
                                        {(skillCat.skills || []).map((s: string, i: number) => (
                                            <span key={i} className="px-2 py-1 bg-slate-100 text-slate-600 rounded-md text-[11px] font-medium border border-slate-200">
                                                {s}
                                            </span>
                                        ))}
                                    </div>
                                </div>
                            ))}
                        </section>
                    </div>
                </motion.div>
            </motion.div>
        </AnimatePresence>
    );
};

export default CompareVersionsModal;
