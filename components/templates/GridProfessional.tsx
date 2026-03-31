
import React from 'react';
import { ResumeData, ResumeSectionKey, Customization } from '../../types';
import EditableField from '../EditableField';
import { EditableList } from '../EditableList';

interface TemplateProps {
  data: ResumeData;
  sectionOrder: ResumeSectionKey[];
  customization: Customization;
  sectionVisibility: Record<ResumeSectionKey, boolean>;
  onDataChange: (path: string, value: any) => void;
}

const GridProfessional: React.FC<TemplateProps> = ({ data, sectionOrder, customization, sectionVisibility, onDataChange }) => {
  const marginValue = { compact: '0.3in', normal: '0.5in', spacious: '0.8in' }[customization.margin] || '0.5in';
  
  const sectionTitleStyle: React.CSSProperties = {
    fontSize: `11pt`,
    color: '#0f172a',
    textTransform: 'uppercase',
    letterSpacing: '0.1em',
    marginBottom: '12px',
    marginTop: '20px',
    fontWeight: '900',
    borderBottom: '3px solid #0f172a',
    paddingBottom: '2px',
  };

  const sections: Record<ResumeSectionKey, React.ReactNode> = {
    summary: (
      <section key="summary" className="col-span-2 mb-6">
        <h2 style={sectionTitleStyle}>Executive Summary</h2>
        <EditableField as="p" path="summary" value={data.summary} onChange={onDataChange} className="text-slate-600 leading-relaxed text-sm font-medium" />
      </section>
    ),
    experience: (
      <section key="experience" className="col-span-2 mb-6">
        <h2 style={sectionTitleStyle}>Professional Experience</h2>
        <EditableList items={data.experience || []} path="experience" onChange={onDataChange} newItem={{ id: '', role: 'Role', company: 'Company', location: 'Location', dates: 'Dates', description: ['Achievement'] }}>
          {(exp, i) => (
            <div key={exp.id} className="mb-6 last:mb-0">
              <div className="flex justify-between items-baseline mb-1">
                <EditableField path={`experience[${i}].role`} value={exp.role} onChange={onDataChange} className="font-black text-slate-900 text-lg" />
                <EditableField path={`experience[${i}].dates`} value={exp.dates} onChange={onDataChange} className="font-bold text-slate-400 text-xs uppercase tracking-widest" />
              </div>
              <div className="mb-3 flex justify-between items-center">
                <EditableField path={`experience[${i}].company`} value={exp.company} onChange={onDataChange} className="font-black text-blue-600 text-xs uppercase tracking-widest" />
                <EditableField path={`experience[${i}].location`} value={exp.location} onChange={onDataChange} className="text-slate-400 text-xs font-bold" />
              </div>
              <EditableList items={exp.description} path={`experience[${i}].description`} onChange={onDataChange} newItem="New achievement" className="grid grid-cols-2 gap-x-8 gap-y-2">
                {(desc, di) => (
                    <div className="text-slate-600 text-xs leading-relaxed flex gap-2">
                        <span className="text-blue-600 font-black">•</span>
                        <EditableField as="div" path={`experience[${i}].description[${di}]`} value={desc} onChange={onDataChange} enableMarkdown />
                    </div>
                )}
              </EditableList>
            </div>
          )}
        </EditableList>
      </section>
    ),
    skills: (
      <section key="skills" className="col-span-1 mb-6 pr-4">
        <h2 style={sectionTitleStyle}>Core Skills</h2>
        <div className="space-y-4">
          {data.skills.map((cat, i) => (
            <div key={cat.id} className="flex flex-col">
              <EditableField path={`skills[${i}].name`} value={cat.name} onChange={onDataChange} className="font-black text-slate-900 text-[10px] uppercase tracking-[0.2em] mb-2" />
              <div className="flex flex-wrap gap-1.5">
                {cat.skills.map((s, si) => (
                    <span key={si} className="px-2 py-1 bg-slate-100 text-slate-600 rounded text-[9px] font-bold uppercase tracking-widest">
                        {s.name}
                    </span>
                ))}
              </div>
            </div>
          ))}
        </div>
      </section>
    ),
    education: (
        <section key="education" className="col-span-1 mb-6 pl-4 border-l border-slate-100">
          <h2 style={sectionTitleStyle}>Education</h2>
          <EditableList items={data.education || []} path="education" onChange={onDataChange} newItem={{ id: '', degree: 'Degree', institution: 'Institution', location: 'Location', graduationDate: 'Date' }}>
            {(edu, i) => (
              <div key={edu.id} className="mb-4 last:mb-0">
                <EditableField path={`education[${i}].degree`} value={edu.degree} onChange={onDataChange} className="font-black text-slate-900 text-sm leading-tight mb-1" />
                <EditableField path={`education[${i}].institution`} value={edu.institution} onChange={onDataChange} className="text-slate-400 text-[10px] font-bold uppercase tracking-widest block" />
                <EditableField path={`education[${i}].graduationDate`} value={edu.graduationDate} onChange={onDataChange} className="text-slate-300 text-[9px] font-black tracking-widest mt-1 block" />
              </div>
            )}
          </EditableList>
        </section>
    ),
    projects: (
        <section key="projects" className="col-span-2 mb-6">
          <h2 style={sectionTitleStyle}>Key Projects</h2>
          <div className="grid grid-cols-3 gap-6">
            {data.projects.map((proj, i) => (
              <div key={proj.id} className="p-4 bg-slate-50 rounded-lg border border-slate-100">
                <EditableField path={`projects[${i}].name`} value={proj.name} onChange={onDataChange} className="font-black text-slate-900 text-[10px] uppercase tracking-widest mb-1" />
                <EditableField path={`projects[${i}].role`} value={proj.role} onChange={onDataChange} className="text-blue-500 text-[9px] font-black uppercase block mb-2" />
                <div className="text-slate-500 text-[9px] leading-tight line-clamp-3">
                    {proj.description.join(' ')}
                </div>
              </div>
            ))}
          </div>
        </section>
    ),
    certifications: <div key="certifications" />,
    awards: <div key="awards" />,
    keywords: (
        <section key="keywords" className="col-span-2 mb-6">
          <h2 style={sectionTitleStyle}>Keywords</h2>
          <div className="text-slate-600 leading-relaxed text-sm font-medium mt-2">
            {data.keywords?.join(', ')}
          </div>
        </section>
    )
  };

  return (
    <div id="resume-content" style={{ padding: marginValue }} className="bg-white font-sans">
      <header className="mb-12 flex justify-between items-center bg-[#0f172a] p-10 rounded-2xl text-white">
        <div>
            <EditableField as="h1" path="fullName" value={data.fullName} onChange={onDataChange} className="text-5xl font-black leading-none tracking-tighter text-white mb-2" />
            <EditableField as="p" path="title" value={data.title} onChange={onDataChange} className="text-blue-400 font-black text-sm uppercase tracking-[0.4em]" />
        </div>
        <div className="text-right text-[10px] font-black text-white/40 uppercase tracking-widest space-y-1">
            <EditableField path="contactInfo.email" value={data.contactInfo.email} onChange={onDataChange} className="block text-white/80" />
            <EditableField path="contactInfo.phone" value={data.contactInfo.phone} onChange={onDataChange} className="block" />
            <EditableField path="contactInfo.location" value={data.contactInfo.location} onChange={onDataChange} className="block" />
        </div>
      </header>
      
      <div className="grid grid-cols-2 gap-x-0">
        {sectionOrder.filter(k => sectionVisibility[k]).map(k => sections[k])}
      </div>
    </div>
  );
};

export default GridProfessional;
