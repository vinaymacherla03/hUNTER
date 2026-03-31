
import React from 'react';
import { motion } from 'framer-motion';
import { FileText, Download, Share2, CheckCircle2, Sparkles, Printer, FileJson, Type } from 'lucide-react';
import { ResumeData } from '../../types';

interface FinalizeSectionProps {
    resumeData: ResumeData;
    onDownloadPdf: () => void;
    onDownloadTxt: () => void;
    onExportJson: () => void;
    isDownloading: boolean;
}

const FinalizeSection: React.FC<FinalizeSectionProps> = ({
    resumeData,
    onDownloadPdf,
    onDownloadTxt,
    onExportJson,
    isDownloading
}) => {
    return (
        <div className="space-y-12">
            <div className="text-center">
                <div className="w-20 h-20 bg-emerald-100 rounded-3xl flex items-center justify-center mx-auto mb-6 shadow-xl shadow-emerald-100/50">
                    <CheckCircle2 className="w-10 h-10 text-emerald-600" />
                </div>
                <h2 className="text-3xl font-black text-slate-900 tracking-tight mb-3">Ready for the World!</h2>
                <p className="text-slate-500 font-medium max-w-md mx-auto">
                    Your resume is polished, optimized, and ready to land you that dream job. Choose your preferred format below.
                </p>
            </div>

            <div className="grid grid-cols-1 sm:grid-cols-2 gap-6">
                {/* PDF Download - Primary */}
                <button
                    onClick={onDownloadPdf}
                    disabled={isDownloading}
                    className="relative group overflow-hidden bg-slate-900 text-white p-8 rounded-3xl shadow-2xl hover:shadow-emerald-500/20 transition-all text-left flex flex-col justify-between h-64 disabled:opacity-70"
                >
                    <div className="absolute top-0 right-0 p-8 opacity-10 group-hover:opacity-20 transition-opacity">
                        <FileText className="w-32 h-32" />
                    </div>
                    
                    <div className="relative z-10">
                        <div className="w-12 h-12 bg-white/10 rounded-2xl flex items-center justify-center mb-4">
                            <Download className="w-6 h-6 text-emerald-400" />
                        </div>
                        <h3 className="text-2xl font-black tracking-tight">PDF Document</h3>
                        <p className="text-slate-400 text-sm font-medium mt-2">Best for most applications. ATS-friendly and preserves formatting.</p>
                    </div>

                    <div className="relative z-10 flex items-center gap-2 font-black uppercase tracking-widest text-[10px]">
                        {isDownloading ? (
                            <span className="flex items-center gap-2">
                                <div className="w-3 h-3 border-2 border-emerald-400 border-t-transparent rounded-full animate-spin" />
                                Processing...
                            </span>
                        ) : (
                            <span>Download Now</span>
                        )}
                        <div className="w-4 h-0.5 bg-emerald-400 group-hover:w-12 transition-all" />
                    </div>
                </button>

                {/* Other Formats */}
                <div className="space-y-4">
                    <button
                        onClick={onDownloadTxt}
                        className="w-full bg-white border-2 border-slate-100 p-6 rounded-3xl hover:border-emerald-500 transition-all text-left flex items-center gap-4 group"
                    >
                        <div className="w-12 h-12 bg-slate-50 rounded-2xl flex items-center justify-center group-hover:bg-emerald-50 transition-colors">
                            <Type className="w-6 h-6 text-slate-400 group-hover:text-emerald-500" />
                        </div>
                        <div>
                            <h4 className="font-black text-slate-900 tracking-tight">Plain Text (.txt)</h4>
                            <p className="text-slate-400 text-xs font-medium">For simple copy-pasting into portals.</p>
                        </div>
                    </button>

                    <button
                        onClick={onExportJson}
                        className="w-full bg-white border-2 border-slate-100 p-6 rounded-3xl hover:border-emerald-500 transition-all text-left flex items-center gap-4 group"
                    >
                        <div className="w-12 h-12 bg-slate-50 rounded-2xl flex items-center justify-center group-hover:bg-emerald-50 transition-colors">
                            <FileJson className="w-6 h-6 text-slate-400 group-hover:text-emerald-500" />
                        </div>
                        <div>
                            <h4 className="font-black text-slate-900 tracking-tight">Export JSON</h4>
                            <p className="text-slate-400 text-xs font-medium">Backup your data for future use.</p>
                        </div>
                    </button>

                    <button
                        onClick={() => window.print()}
                        className="w-full bg-white border-2 border-slate-100 p-6 rounded-3xl hover:border-emerald-500 transition-all text-left flex items-center gap-4 group"
                    >
                        <div className="w-12 h-12 bg-slate-50 rounded-2xl flex items-center justify-center group-hover:bg-emerald-50 transition-colors">
                            <Printer className="w-6 h-6 text-slate-400 group-hover:text-emerald-500" />
                        </div>
                        <div>
                            <h4 className="font-black text-slate-900 tracking-tight">Print Directly</h4>
                            <p className="text-slate-400 text-xs font-medium">Send to your local printer.</p>
                        </div>
                    </button>
                </div>
            </div>

            <div className="bg-emerald-50 p-8 rounded-[40px] border border-emerald-100 flex flex-col sm:flex-row items-center gap-6">
                <div className="w-16 h-16 bg-white rounded-2xl shadow-lg flex items-center justify-center shrink-0">
                    <Sparkles className="w-8 h-8 text-emerald-500" />
                </div>
                <div>
                    <h4 className="text-lg font-black text-slate-900 tracking-tight">Pro Tip: ATS Optimization</h4>
                    <p className="text-slate-600 text-sm font-medium mt-1">
                        Always use the PDF format for online job portals. Our templates are specifically engineered to pass through modern ATS filters without issues.
                    </p>
                </div>
            </div>
        </div>
    );
};

export default FinalizeSection;
