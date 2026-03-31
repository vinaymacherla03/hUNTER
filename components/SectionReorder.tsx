import React from 'react';
import { ResumeSectionKey } from '../types';
import { motion, Reorder } from 'framer-motion';

interface SectionReorderProps {
  sectionOrder: ResumeSectionKey[];
  sectionVisibility: Record<ResumeSectionKey, boolean>;
  onOrderChange: (newOrder: ResumeSectionKey[]) => void;
  onVisibilityChange: (section: ResumeSectionKey, isVisible: boolean) => void;
}

const SectionReorder: React.FC<SectionReorderProps> = ({
  sectionOrder,
  sectionVisibility,
  onOrderChange,
  onVisibilityChange
}) => {
  const sectionLabels: Record<ResumeSectionKey, string> = {
    summary: 'Professional Summary',
    experience: 'Work Experience',
    education: 'Education',
    skills: 'Skills',
    projects: 'Projects',
    certifications: 'Certifications',
    awards: 'Awards & Honors',
    keywords: 'Keywords'
  };

  return (
    <div className="p-4">
      <h3 className="text-sm font-semibold text-slate-900 mb-4">Reorder Sections</h3>
      <Reorder.Group axis="y" values={sectionOrder} onReorder={onOrderChange} className="space-y-2">
        {sectionOrder.map((section) => (
          <Reorder.Item key={section} value={section} className="flex items-center justify-between p-3 bg-white border border-slate-200 rounded-lg shadow-sm cursor-grab active:cursor-grabbing">
            <div className="flex items-center gap-3">
              <svg className="w-4 h-4 text-slate-400" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M4 8h16M4 16h16" />
              </svg>
              <span className="text-sm font-medium text-slate-700">{sectionLabels[section]}</span>
            </div>
            <button
              onClick={() => onVisibilityChange(section, !sectionVisibility[section])}
              className={`p-1.5 rounded-md transition-colors ${sectionVisibility[section] ? 'text-primary hover:bg-primary-50' : 'text-slate-400 hover:bg-slate-100'}`}
              title={sectionVisibility[section] ? 'Hide section' : 'Show section'}
            >
              <svg className="w-4 h-4" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                {sectionVisibility[section] ? (
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 12a3 3 0 11-6 0 3 3 0 016 0z M2.458 12C3.732 7.943 7.523 5 12 5c4.478 0 8.268 2.943 9.542 7-1.274 4.057-5.064 7-9.542 7-4.477 0-8.268-2.943-9.542-7z" />
                ) : (
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M13.875 18.825A10.05 10.05 0 0112 19c-4.478 0-8.268-2.943-9.543-7a9.97 9.97 0 011.563-3.029m5.858.908a3 3 0 114.243 4.243M9.878 9.878l4.242 4.242M9.88 9.88l-3.29-3.29m7.532 7.532l3.29 3.29M3 3l3.59 3.59m0 0A9.953 9.953 0 0112 5c4.478 0 8.268 2.943 9.543 7a10.025 10.025 0 01-4.132 5.411m0 0L21 21" />
                )}
              </svg>
            </button>
          </Reorder.Item>
        ))}
      </Reorder.Group>
    </div>
  );
};

export default SectionReorder;
