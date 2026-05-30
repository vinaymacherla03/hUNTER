import React, { useState, useRef, useEffect } from 'react';
import { motion, AnimatePresence } from 'framer-motion';

interface DownloadDropdownProps {
  onDownloadPdf: () => void;
  onDownloadDocx?: () => void;
  onDownloadTxt?: () => void;
  onExportJson?: () => void;
  onImportJson?: (file: File) => void;
  onSaveToTracker?: () => void;
  isDownloading?: boolean;
}

const DownloadDropdown: React.FC<DownloadDropdownProps> = ({
  onDownloadPdf,
  onDownloadDocx,
  onDownloadTxt,
  onExportJson,
  onImportJson,
  onSaveToTracker,
  isDownloading = false
}) => {
  const [isOpen, setIsOpen] = useState(false);
  const dropdownRef = useRef<HTMLDivElement>(null);
  const fileInputRef = useRef<HTMLInputElement>(null);

  useEffect(() => {
    const handleClickOutside = (event: MouseEvent) => {
      if (dropdownRef.current && !dropdownRef.current.contains(event.target as Node)) {
        setIsOpen(false);
      }
    };
    document.addEventListener('mousedown', handleClickOutside);
    return () => document.removeEventListener('mousedown', handleClickOutside);
  }, []);

  return (
    <div className="relative" ref={dropdownRef}>
      <button
        id="tour-download-btn"
        onClick={() => setIsOpen(!isOpen)}
        disabled={isDownloading}
        className="h-9 px-5 bg-emerald-600 hover:bg-emerald-700 text-white rounded-lg flex items-center gap-2 transition-colors relative shadow-sm"
      >
        {isDownloading ? (
          <>
            <svg className="animate-spin h-4 w-4 text-white relative z-10" xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24">
              <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4"></circle>
              <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"></path>
            </svg>
            <span className="text-sm font-semibold relative z-10">Processing...</span>
          </>
        ) : (
          <>
            <svg className="w-4 h-4 text-white relative z-10" fill="none" viewBox="0 0 24 24" stroke="currentColor">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M4 16v1a3 3 0 003 3h10a3 3 0 003-3v-1m-4-4l-4 4m0 0l-4-4m4 4V4" />
            </svg>
            <span className="text-sm font-semibold relative z-10">Download</span>
          </>
        )}
      </button>

      <AnimatePresence>
        {isOpen && (
          <motion.div
            initial={{ opacity: 0, y: 10, scale: 0.95 }}
            animate={{ opacity: 1, y: 0, scale: 1 }}
            exit={{ opacity: 0, y: 10, scale: 0.95 }}
            className="absolute right-0 mt-3 w-56 bg-white rounded-2xl shadow-2xl border border-slate-100 py-2 z-50 overflow-hidden"
          >
            <button
              onClick={() => { onDownloadPdf(); setIsOpen(false); }}
              className="w-full text-left px-5 py-3 text-sm text-slate-700 hover:bg-emerald-50 hover:text-emerald-700 transition-colors flex items-center gap-3 group"
            >
              <div className="w-8 h-8 rounded-lg bg-rose-50 text-rose-500 flex items-center justify-center group-hover:scale-110 transition-transform">
                <svg className="w-4 h-4" fill="none" viewBox="0 0 24 24" stroke="currentColor"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M7 21h10a2 2 0 002-2V9.414a1 1 0 00-.293-.707l-5.414-5.414A1 1 0 0012.586 3H7a2 2 0 00-2 2v14a2 2 0 002 2z" /></svg>
              </div>
              <div>
                <p className="font-bold">PDF Document</p>
                <p className="text-[10px] text-slate-400">Best for printing</p>
              </div>
            </button>
            {onDownloadTxt && (
              <button
                onClick={() => { onDownloadTxt(); setIsOpen(false); }}
                className="w-full text-left px-5 py-3 text-sm text-slate-700 hover:bg-emerald-50 hover:text-emerald-700 transition-colors flex items-center gap-3 group"
                title="Best format for OpenCATS and older ATS systems"
              >
                <div className="w-8 h-8 rounded-lg bg-emerald-50 text-emerald-500 flex items-center justify-center group-hover:scale-110 transition-transform">
                  <svg className="w-4 h-4" fill="none" viewBox="0 0 24 24" stroke="currentColor"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 12h6m-6 4h6m2 5H7a2 2 0 01-2-2V5a2 2 0 012-2h5.586a1 1 0 01.707.293l5.414 5.414a1 1 0 01.293.707V19a2 2 0 01-2 2z" /></svg>
                </div>
                <div>
                  <p className="font-bold">ATS-Optimized Text</p>
                  <p className="text-[10px] text-slate-400">Maximum compatibility</p>
                </div>
              </button>
            )}
            {onSaveToTracker && (
              <button
                onClick={() => { onSaveToTracker(); setIsOpen(false); }}
                className="w-full text-left px-5 py-3 text-sm text-slate-700 hover:bg-emerald-50 hover:text-emerald-700 transition-colors flex items-center gap-3 group border-t border-slate-50 mt-1 pt-3"
              >
                <div className="w-8 h-8 rounded-lg bg-indigo-50 text-indigo-500 flex items-center justify-center group-hover:scale-110 transition-transform">
                  <svg className="w-4 h-4" fill="none" viewBox="0 0 24 24" stroke="currentColor"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M21 13.255A23.931 23.931 0 0112 15c-3.183 0-6.22-.62-9-1.745M16 6V4a2 2 0 00-2-2h-4a2 2 0 00-2 2v2m4 6h.01M5 20h14a2 2 0 002-2V8a2 2 0 00-2-2H5a2 2 0 00-2 2v10a2 2 0 002 2z" /></svg>
                </div>
                <div>
                  <p className="font-bold">Add to Tracker</p>
                  <p className="text-[10px] text-slate-400">Track this application</p>
                </div>
              </button>
            )}
            {onExportJson && (
              <button
                onClick={() => { onExportJson(); setIsOpen(false); }}
                className="w-full text-left px-5 py-3 text-sm text-slate-700 hover:bg-emerald-50 hover:text-emerald-700 transition-colors flex items-center gap-3 group border-t border-slate-50 mt-1 pt-3"
              >
                <div className="w-8 h-8 rounded-lg bg-slate-50 text-slate-500 flex items-center justify-center group-hover:scale-110 transition-transform">
                  <svg className="w-4 h-4" fill="none" viewBox="0 0 24 24" stroke="currentColor"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M8 9l3 3-3 3m5 0h3M5 20h14a2 2 0 002-2V6a2 2 0 00-2-2H5a2 2 0 00-2 2v12a2 2 0 002 2z" /></svg>
                </div>
                <div>
                  <p className="font-bold">Backup Data</p>
                  <p className="text-[10px] text-slate-400">JSON format</p>
                </div>
              </button>
            )}
            {onImportJson && (
              <button
                onClick={() => { fileInputRef.current?.click(); setIsOpen(false); }}
                className="w-full text-left px-5 py-3 text-sm text-slate-700 hover:bg-emerald-50 hover:text-emerald-700 transition-colors flex items-center gap-3 group"
              >
                <div className="w-8 h-8 rounded-lg bg-slate-50 text-slate-500 flex items-center justify-center group-hover:scale-110 transition-transform">
                  <svg className="w-4 h-4" fill="none" viewBox="0 0 24 24" stroke="currentColor"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M4 16v1a3 3 0 003 3h10a3 3 0 003-3v-1m-4-8l-4-4m0 0L8 8m4-4v12" /></svg>
                </div>
                <div>
                  <p className="font-bold">Restore Backup</p>
                  <p className="text-[10px] text-slate-400">From JSON file</p>
                </div>
              </button>
            )}
          </motion.div>
        )}
      </AnimatePresence>
      {onImportJson && (
        <input 
          type="file" 
          accept=".json" 
          className="hidden" 
          ref={fileInputRef} 
          onChange={(e) => {
            const file = e.target.files?.[0];
            if (file) {
              onImportJson(file);
              e.target.value = ''; // Reset input
            }
          }} 
        />
      )}
    </div>
  );
};

export default DownloadDropdown;
