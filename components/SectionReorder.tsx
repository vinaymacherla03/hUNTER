import React, { useState } from 'react';
import { ResumeSectionKey } from '../types';
import { motion, Reorder, AnimatePresence, useDragControls } from 'framer-motion';
import { GripVertical, Eye, EyeOff, RotateCcw, Info } from 'lucide-react';

interface SectionReorderProps {
  sectionOrder: ResumeSectionKey[];
  sectionVisibility: Record<ResumeSectionKey, boolean>;
  onOrderChange: (newOrder: ResumeSectionKey[]) => void;
  onVisibilityChange: (section: ResumeSectionKey, isVisible: boolean) => void;
}

const ALL_SECTIONS: ResumeSectionKey[] = ['summary', 'experience', 'projects', 'education', 'skills', 'certifications', 'awards', 'keywords'];

const sectionLabels: Record<ResumeSectionKey, string> = {
  summary: 'Professional Summary',
  experience: 'Work Experience',
  education: 'Education',
  skills: 'Skills',
  projects: 'Projects',
  certifications: 'Licenses & Certifications',
  awards: 'Awards & Honours',
  keywords: 'Industry Keywords'
};

const SortableItem = ({ 
  section, 
  isVisible, 
  onToggle 
}: { 
  section: ResumeSectionKey; 
  isVisible: boolean; 
  onToggle: () => void;
}) => {
  const controls = useDragControls();

  return (
    <Reorder.Item 
      value={section} 
      initial={{ opacity: 0, y: 10 }}
      animate={{ opacity: 1, y: 0 }}
      exit={{ opacity: 0, scale: 0.95 }}
      dragListener={false}
      dragControls={controls}
      whileDrag={{ 
        scale: 1.02, 
        boxShadow: "0px 20px 40px rgba(0,0,0,0.12)", 
        zIndex: 50,
        backgroundColor: "#ffffff",
        borderColor: "#cbd5e1"
      }}
      className={`flex items-center justify-between p-3.5 bg-white border rounded-2xl transition-all duration-200 group relative ${
        isVisible 
        ? 'border-slate-200 shadow-sm hover:border-violet-300' 
        : 'border-slate-100 bg-slate-50 opacity-75'
      }`}
    >
      <div className="flex items-center gap-3">
        <div 
          className="cursor-grab active:cursor-grabbing p-1.5 hover:bg-slate-100 rounded-lg transition-colors flex items-center justify-center touch-none"
          onPointerDown={(e) => {
            e.preventDefault();
            controls.start(e);
          }}
          title="Drag to reorder"
        >
          <GripVertical className={`w-4 h-4 ${isVisible ? 'text-slate-400 group-hover:text-violet-500' : 'text-slate-300'}`} />
        </div>
        <div className="flex flex-col">
          <span className={`text-sm font-bold tracking-tight transition-colors ${isVisible ? 'text-slate-800' : 'text-slate-400 line-through'}`}>
            {sectionLabels[section]}
          </span>
          <span className="text-[10px] font-semibold uppercase tracking-widest text-slate-400 mt-0.5">
            {isVisible ? 'Visible' : 'Hidden'}
          </span>
        </div>
      </div>

      <button
        onClick={onToggle}
        className={`w-9 h-9 flex items-center justify-center rounded-xl transition-all ${
          isVisible 
          ? 'text-violet-600 bg-violet-50 hover:bg-violet-100 hover:scale-105' 
          : 'text-slate-400 bg-white border border-slate-200 hover:bg-slate-100 hover:text-slate-600'
        }`}
        title={isVisible ? 'Hide from resume' : 'Show on resume'}
      >
        <motion.div initial={false} animate={{ opacity: 1, scale: 1 }} transition={{ duration: 0.2 }}>
          {isVisible ? <Eye className="w-4 h-4" /> : <EyeOff className="w-4 h-4" />}
        </motion.div>
      </button>
    </Reorder.Item>
  );
};

const SectionReorder: React.FC<SectionReorderProps> = ({
  sectionOrder,
  sectionVisibility,
  onOrderChange,
  onVisibilityChange
}) => {
  const handleReset = () => {
    onOrderChange(ALL_SECTIONS);
  };

  const visibleCount = sectionOrder.filter(s => sectionVisibility[s]).length;

  return (
    <div className="space-y-4">
      <div className="flex items-center justify-between px-1">
        <p className="text-xs text-slate-500 font-medium">{visibleCount} of {sectionOrder.length} sections visible</p>
        <button 
          onClick={handleReset}
          className="flex items-center gap-1.5 px-3 py-1.5 rounded-lg text-[10px] font-bold text-slate-500 uppercase tracking-widest hover:text-violet-600 hover:bg-violet-50 transition-all border border-transparent hover:border-violet-100"
        >
          <RotateCcw className="w-3.5 h-3.5" />
          Reset Default
        </button>
      </div>

      <div className="p-3 bg-slate-50/50 rounded-2xl border border-slate-100/60">
        <Reorder.Group axis="y" values={sectionOrder} onReorder={onOrderChange} className="space-y-2">
          <AnimatePresence mode="popLayout">
            {sectionOrder.map((section) => (
              <SortableItem 
                key={section} 
                section={section} 
                isVisible={sectionVisibility[section]} 
                onToggle={() => onVisibilityChange(section, !sectionVisibility[section])} 
              />
            ))}
          </AnimatePresence>
        </Reorder.Group>
      </div>

      <div className="flex items-start gap-3 p-3.5 bg-violet-50 rounded-xl border border-violet-100/50">
        <div className="mt-0.5 w-6 h-6 rounded-full bg-violet-100 flex items-center justify-center shrink-0">
          <Info className="w-3.5 h-3.5 text-violet-600" />
        </div>
        <div>
          <p className="text-xs text-violet-800 font-medium leading-relaxed">
            Drag the handle to reorder sections. Use the eye icon to show or hide sections from your generated resume. Removals are saved automatically.
          </p>
        </div>
      </div>
    </div>
  );
};

export default SectionReorder;
