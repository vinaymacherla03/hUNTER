
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

const FunctionalSkillsPro: React.FC<TemplateProps> = ({ data, sectionOrder, customization, sectionVisibility, onDataChange }) => {
  const marginValue = { compact: '0.3in', normal: '0.5in', spacious: '0.8in' }[customization.margin] || '0.5in';
  
  const sectionTitleStyle: React.CSSProperties = {
    fontSize: `11pt`,
    color: '#000',
    textTransform: 'uppercase',
    letterSpacing: '0.1em',
    marginBottom: '12px',
    marginTop: '24px',
    fontWeight: '900',
    borderBottom: '2px solid #000',
    paddingBottom: '2px',
  };

  const sections: Record<ResumeSectionKey, React.ReactNode> = {
    skills: (
      <section key="skills" className="mb-10">
        <h2 style={sectionTitleStyle}>Core Competencies & Expertise</h2>
        <div className="grid grid-cols-2 gap-x-12 gap-y-8 mt-6">
          {data.skills.map((cat, i) => (
            <div key={cat.id} className="flex flex-col bg-slate-50 p-6 rounded-2xl border border-slate-100">
              <EditableField path={`skills[${i}].name`} value={cat.name} onChange={onDataChange} className="font-black text-black text-xs uppercase tracking-[0.2em] mb-4" />
              <div className="text-slate-600 text-sm leading-relaxed font-medium space-y-2">
                {cat.skills.map((s, si) => (
                    <div key={si} className="flex items-center gap-3">
                        <div className="w-1.5 h-1.5 rounded-full bg-black" />
                        <span>{s.name}</span>
                    </div>
                ))}
              </div>
            </div>
          ))}
        </div>
      </section>
    ),
    summary: (
      <section key="summary" className="mb-10">
        <h2 style={sectionTitleStyle}>Professional Profile</h2>
        <EditableField as="p" path="summary" value={data.summary} onChange={onDataChange} className="text-slate-600 leading-relaxed text-sm font-medium" />
      </section>
    ),
    experience: (
      <section key="experience" className="mb-10">
        <h2 style={sectionTitleStyle}>Work History</h2>
        <EditableList items={data.experience || []} path="experience" onChange={onDataChange} newItem={{ id: '', role: 'Role', company: 'Company', location: 'Location', dates: 'Dates', description: ['Achievement'] }}>
          {(exp, i) => (
            <div key={exp.id} className="mb-6 last:mb-0">
              <div className="flex justify-between items-baseline mb-1">
                <EditableField path={`experience[${i}].role`} value={exp.role} onChange={onDataChange} className="font-black text-slate-900 text-base" />
                <EditableField path={`experience[${i}].dates`} value={exp.dates} onChange={onDataChange} className="font-bold text-slate-400 text-[10px] uppercase tracking-widest" />
              </div>
              <div className="mb-2 flex gap-2 items-center">
                <EditableField path={`experience[${i}].company`} value={exp.company} onChange={onDataChange} className="font-black text-slate-500 text-xs uppercase tracking-widest" />
                <span className="text-slate-200">|</span>
                <EditableField path={`experience[${i}].location`} value={exp.location} onChange={onDataChange} className="text-slate-400 text-xs font-bold" />
              </div>
              <div className="text-slate-600 text-xs leading-relaxed italic">
                {exp.description.join(' • ')}
              </div>
            </div>
          )}
        </EditableList>
      </section>
    ),
    education: (
        <section key="education" className="mb-10">
          <h2 style={sectionTitleStyle}>Education</h2>
          <div className="grid grid-cols-2 gap-8">
            {data.education.map((edu, i) => (
              <div key={edu.id} className="mb-4 last:mb-0">
                <EditableField path={`education[${i}].degree`} value={edu.degree} onChange={onDataChange} className="font-black text-slate-900 text-sm mb-1" />
                <EditableField path={`education[${i}].institution`} value={edu.institution} onChange={onDataChange} className="text-slate-400 text-[10px] font-bold uppercase tracking-widest block" />
                <EditableField path={`education[${i}].graduationDate`} value={edu.graduationDate} onChange={onDataChange} className="text-slate-300 text-[9px] font-black tracking-widest mt-1 block" />
              </div>
            ))}
          </div>
        </section>
    ),
    projects: (
        <section key="projects" className="mb-10">
          <h2 style={sectionTitleStyle}>Projects</h2>
          <div className="grid grid-cols-2 gap-6">
            {data.projects.map((proj, i) => (
              <div key={proj.id} className="p-6 bg-slate-50 rounded-2xl border border-slate-100">
                <EditableField path={`projects[${i}].name`} value={proj.name} onChange={onDataChange} className="font-black text-slate-900 text-sm uppercase tracking-widest mb-2" />
                <EditableField path={`projects[${i}].role`} value={proj.role} onChange={onDataChange} className="text-slate-400 text-[10px] font-black uppercase block mb-3" />
                <div className="text-slate-600 text-xs leading-relaxed">
                    {proj.description.join(' • ')}
                </div>
              </div>
            ))}
          </div>
        </section>
    ),
    certifications: <div key="certifications" />,
    awards: <div key="awards" />,
    keywords: (
        <section key="keywords" className="mb-10">
          <h2 style={sectionTitleStyle}>Keywords</h2>
          <div className="text-slate-600 leading-relaxed text-sm font-medium mt-2">
            {data.keywords?.join(', ')}
          </div>
        </section>
    )
  };

  return (
    <div id="resume-content" style={{ padding: marginValue }} className="bg-white font-sans selection:bg-black selection:text-white">
      <header className="mb-16 border-b-8 border-black pb-12">
        <EditableField as="h1" path="fullName" value={data.fullName} onChange={onDataChange} className="text-7xl font-black leading-none tracking-tighter text-black mb-6" />
        <div className="flex justify-between items-end">
            <EditableField as="p" path="title" value={data.title} onChange={onDataChange} className="text-black font-black text-2xl uppercase tracking-[0.2em]" />
            <div className="text-right text-[10px] font-black text-slate-400 uppercase tracking-widest space-y-1">
                <EditableField path="contactInfo.email" value={data.contactInfo.email} onChange={onDataChange} className="block hover:text-black transition-colors" />
                <EditableField path="contactInfo.phone" value={data.contactInfo.phone} onChange={onDataChange} className="block" />
                <EditableField path="contactInfo.location" value={data.contactInfo.location} onChange={onDataChange} className="block" />
            </div>
        </div>
      </header>
      
      <main>
        {/* For Functional template, we might want to prioritize skills */}
        {['summary', 'skills', 'experience', 'education', 'projects'].filter(k => sectionVisibility[k as ResumeSectionKey]).map(k => sections[k as ResumeSectionKey])}
      </main>
    </div>
  );
};

export default FunctionalSkillsPro;
