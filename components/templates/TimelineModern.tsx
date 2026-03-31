
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

const TimelineModern: React.FC<TemplateProps> = ({ data, sectionOrder, customization, sectionVisibility, onDataChange }) => {
  const marginValue = { compact: '0.3in', normal: '0.5in', spacious: '0.8in' }[customization.margin] || '0.5in';
  
  const sectionTitleStyle: React.CSSProperties = {
    fontSize: `11pt`,
    color: '#000',
    textTransform: 'uppercase',
    letterSpacing: '0.15em',
    marginBottom: '16px',
    marginTop: '24px',
    fontWeight: '900',
    borderBottom: '4px solid #000',
    paddingBottom: '4px',
    display: 'inline-block',
  };

  const sections: Record<ResumeSectionKey, React.ReactNode> = {
    summary: (
      <section key="summary" className="mb-10">
        <h2 style={sectionTitleStyle}>Profile</h2>
        <EditableField as="p" path="summary" value={data.summary} onChange={onDataChange} className="text-slate-600 leading-relaxed text-sm font-medium" />
      </section>
    ),
    experience: (
      <section key="experience" className="mb-10">
        <h2 style={sectionTitleStyle}>Timeline</h2>
        <EditableList items={data.experience || []} path="experience" onChange={onDataChange} newItem={{ id: '', role: 'Role', company: 'Company', location: 'Location', dates: 'Dates', description: ['Achievement'] }}>
          {(exp, i) => (
            <div key={exp.id} className="mb-10 last:mb-0 flex gap-12">
              <div className="w-32 flex-shrink-0 text-right">
                <EditableField path={`experience[${i}].dates`} value={exp.dates} onChange={onDataChange} className="font-black text-black text-[10px] uppercase tracking-widest" />
              </div>
              <div className="flex-1 border-l-2 border-black pl-12 relative">
                <div className="absolute -left-[9px] top-1 w-4 h-4 rounded-full bg-white border-4 border-black" />
                <EditableField path={`experience[${i}].role`} value={exp.role} onChange={onDataChange} className="font-black text-slate-900 text-xl mb-1" />
                <div className="flex gap-2 items-center mb-4">
                    <EditableField path={`experience[${i}].company`} value={exp.company} onChange={onDataChange} className="font-bold text-slate-400 text-xs uppercase tracking-widest" />
                    <span className="text-slate-200">/</span>
                    <EditableField path={`experience[${i}].location`} value={exp.location} onChange={onDataChange} className="text-slate-400 text-xs font-bold" />
                </div>
                <EditableList items={exp.description} path={`experience[${i}].description`} onChange={onDataChange} newItem="New achievement" className="space-y-3">
                    {(desc, di) => (
                        <div className="text-slate-600 text-sm leading-relaxed flex gap-3">
                            <span className="text-black font-black">→</span>
                            <EditableField as="div" path={`experience[${i}].description[${di}]`} value={desc} onChange={onDataChange} enableMarkdown />
                        </div>
                    )}
                </EditableList>
              </div>
            </div>
          )}
        </EditableList>
      </section>
    ),
    skills: (
      <section key="skills" className="mb-10">
        <h2 style={sectionTitleStyle}>Expertise</h2>
        <div className="grid grid-cols-4 gap-4">
          {data.skills.map((cat, i) => (
            <div key={cat.id} className="flex flex-col">
              <EditableField path={`skills[${i}].name`} value={cat.name} onChange={onDataChange} className="font-black text-black text-[9px] uppercase tracking-[0.2em] mb-2" />
              <div className="text-slate-500 text-[10px] font-bold leading-relaxed flex flex-wrap gap-1">
                {cat.skills.map((s, si) => (
                    <span key={si} className="px-1.5 py-0.5 bg-slate-50 text-slate-400 rounded border border-slate-100">
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
        <section key="education" className="mb-10">
          <h2 style={sectionTitleStyle}>Education</h2>
          <div className="grid grid-cols-2 gap-12">
            {data.education.map((edu, i) => (
              <div key={edu.id} className="flex gap-6">
                <div className="w-24 flex-shrink-0 text-right">
                    <EditableField path={`education[${i}].graduationDate`} value={edu.graduationDate} onChange={onDataChange} className="text-slate-300 text-[10px] font-black tracking-widest" />
                </div>
                <div className="flex-1 border-l-2 border-slate-100 pl-6">
                    <EditableField path={`education[${i}].degree`} value={edu.degree} onChange={onDataChange} className="font-black text-slate-900 text-sm mb-1" />
                    <EditableField path={`education[${i}].institution`} value={edu.institution} onChange={onDataChange} className="text-slate-400 text-[10px] font-bold uppercase tracking-widest block" />
                </div>
              </div>
            ))}
          </div>
        </section>
    ),
    projects: (
        <section key="projects" className="mb-10">
          <h2 style={sectionTitleStyle}>Projects</h2>
          <div className="grid grid-cols-2 gap-8">
            {data.projects.map((proj, i) => (
              <div key={proj.id} className="p-6 border-4 border-slate-50 hover:border-black transition-colors">
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
      <header className="mb-20">
        <div className="flex justify-between items-end border-b-8 border-black pb-8">
            <div>
                <EditableField as="h1" path="fullName" value={data.fullName} onChange={onDataChange} className="text-7xl font-black leading-none tracking-tighter text-black mb-4" />
                <EditableField as="p" path="title" value={data.title} onChange={onDataChange} className="text-black font-black text-xs uppercase tracking-[0.5em]" />
            </div>
            <div className="text-right text-[10px] font-black text-slate-400 uppercase tracking-widest space-y-1">
                <EditableField path="contactInfo.email" value={data.contactInfo.email} onChange={onDataChange} className="block hover:text-black transition-colors" />
                <EditableField path="contactInfo.phone" value={data.contactInfo.phone} onChange={onDataChange} className="block" />
                <EditableField path="contactInfo.location" value={data.contactInfo.location} onChange={onDataChange} className="block" />
            </div>
        </div>
      </header>
      
      <main>
        {sectionOrder.filter(k => sectionVisibility[k]).map(k => sections[k])}
      </main>
    </div>
  );
};

export default TimelineModern;
