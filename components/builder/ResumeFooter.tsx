
import React from 'react';
import { ResumeData } from '../../types';

interface Props {
  data: ResumeData;
  pageNumber: number;
  totalPages: number;
}

const ResumeFooter: React.FC<Props> = ({ data, pageNumber, totalPages }) => (
  <div className="w-full text-[7pt] text-slate-400 flex justify-between items-center border-t border-slate-100 pt-4 mt-8 select-none print:mt-4">
    <div className="flex items-center gap-3">
        <div className="flex items-center gap-1.5 font-black text-slate-300 uppercase tracking-tighter">
            <svg className="w-3 h-3" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="3"><path d="M13 10V3L4 14h7v7l9-11h-7z" /></svg>
            <span>HuntDesk</span>
        </div>
        <span className="w-px h-3 bg-slate-100" />
        <span className="font-medium">
            {data.fullName} &bull; {data.contactInfo.email}
        </span>
    </div>
    <div className="font-bold uppercase tracking-widest bg-slate-50 px-2 py-0.5 rounded border border-slate-100 text-[6pt]">
      Page {pageNumber} of {totalPages}
    </div>
  </div>
);

export default ResumeFooter;
