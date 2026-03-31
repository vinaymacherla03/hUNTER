import React, { useState, useRef, useEffect } from 'react';
import { motion, AnimatePresence } from 'framer-motion';

interface DownloadDropdownProps {
  onDownloadPdf: () => void;
  onDownloadDocx?: () => void;
  onDownloadTxt?: () => void;
  onExportJson?: () => void;
  onImportJson?: (file: File) => void;
  isDownloading?: boolean;
}

const DownloadDropdown: React.FC<DownloadDropdownProps> = ({
  onDownloadPdf,
  onDownloadDocx,
  onDownloadTxt,
  onExportJson,
  onImportJson,
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
        onClick={() => setIsOpen(!isOpen)}
        disabled={isDownloading}
        className="flex items-center gap-2 px-4 py-2 bg-primary text-white font-medium rounded-lg hover:bg-primary-600 transition-colors disabled:opacity-70"
      >
        {isDownloading ? (
          <>
            <svg className="animate-spin h-4 w-4 text-white" xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24">
              <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4"></circle>
              <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"></path>
            </svg>
            <span>Processing...</span>
          </>
        ) : (
          <>
            <svg className="w-4 h-4" fill="none" viewBox="0 0 24 24" stroke="currentColor">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M4 16v1a3 3 0 003 3h10a3 3 0 003-3v-1m-4-4l-4 4m0 0l-4-4m4 4V4" />
            </svg>
            <span>Download</span>
          </>
        )}
      </button>

      <AnimatePresence>
        {isOpen && (
          <motion.div
            initial={{ opacity: 0, y: 10 }}
            animate={{ opacity: 1, y: 0 }}
            exit={{ opacity: 0, y: 10 }}
            className="absolute right-0 mt-2 w-48 bg-white rounded-lg shadow-xl border border-slate-100 py-1 z-50"
          >
            <button
              onClick={() => { onDownloadPdf(); setIsOpen(false); }}
              className="w-full text-left px-4 py-2 text-sm text-slate-700 hover:bg-slate-50 flex items-center gap-2"
            >
              <span className="font-medium">PDF Document</span>
              <span className="text-xs text-slate-400 ml-auto">.pdf</span>
            </button>
            {onDownloadDocx && (
              <button
                onClick={() => { onDownloadDocx(); setIsOpen(false); }}
                className="w-full text-left px-4 py-2 text-sm text-slate-700 hover:bg-slate-50 flex items-center gap-2"
              >
                <span className="font-medium">Word Document</span>
                <span className="text-xs text-slate-400 ml-auto">.docx</span>
              </button>
            )}
            {onDownloadTxt && (
              <button
                onClick={() => { onDownloadTxt(); setIsOpen(false); }}
                className="w-full text-left px-4 py-2 text-sm text-slate-700 hover:bg-slate-50 flex items-center gap-2"
              >
                <span className="font-medium">Plain Text</span>
                <span className="text-xs text-slate-400 ml-auto">.txt</span>
              </button>
            )}
            {onExportJson && (
              <button
                onClick={() => { onExportJson(); setIsOpen(false); }}
                className="w-full text-left px-4 py-2 text-sm text-slate-700 hover:bg-slate-50 flex items-center gap-2 border-t border-slate-100 mt-1 pt-2"
              >
                <span className="font-medium">Export JSON</span>
                <span className="text-xs text-slate-400 ml-auto">.json</span>
              </button>
            )}
            {onImportJson && (
              <button
                onClick={() => { fileInputRef.current?.click(); setIsOpen(false); }}
                className="w-full text-left px-4 py-2 text-sm text-slate-700 hover:bg-slate-50 flex items-center gap-2"
              >
                <span className="font-medium">Import JSON</span>
                <span className="text-xs text-slate-400 ml-auto">.json</span>
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
