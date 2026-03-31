
import React from 'react';
import { ResumeData } from '../../types';

interface Props {
  data: ResumeData;
}

const ResumeHeader: React.FC<Props> = ({ data }) => (
  <div className="w-full text-[8pt] text-slate-500 flex justify-between items-center border-b border-slate-200 pb-3">
    <span>{data.fullName}</span>
    <span>{data.title}</span>
  </div>
);

export default ResumeHeader;
