
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

const BoldImpact: React.FC<TemplateProps> = ({ data, sectionOrder, customization, sectionVisibility, onDataChange }) => {
  const marginValue = { compact: '0.3in', normal: '0.5in', spacious: '0.8in' }[customization.margin] || '0.5in';
  
  const sectionTitleStyle: React.CSSProperties = {
    fontSize: `12pt`,
    color: '#fff',
    textTransform: 'uppercase',
    letterSpacing: '0.1em',
    marginBottom: '12px',
    marginTop: '24px',
    fontWeight: '900',
    backgroundColor: '#000',
    padding: '4px 12px',
    display: 'inline-block',
  };

  const sections: Record<ResumeSectionKey, React.ReactNode> = {
    summary: (
      <section key="summary" className="mb-8">
        <h2 style={sectionTitleStyle}>Profile</h2>
        <EditableField as="p" path="summary" value={data.summary} onChange={onDataChange} className="text-slate-700 leading-relaxed text-sm font-bold mt-4" />
      </section>
    ),
    experience: (
      <section key="experience" className="mb-8">
        <h2 style={sectionTitleStyle}>Experience</h2>
        <EditableList items={data.experience || []} path="experience" onChange={onDataChange} newItem={{ id: '', role: 'Role', company: 'Company', location: 'Location', dates: 'Dates', description: ['Achievement'] }}>
          {(exp, i) => (
            <div key={exp.id} className="mb-8 last:mb-0 border-l-4 border-slate-100 pl-6">
              <div className="flex justify-between items-baseline mb-2">
                <EditableField path={`experience[${i}].role`} value={exp.role} onChange={onDataChange} className="font-black text-black text-xl tracking-tight" />
                <EditableField path={`experience[${i}].dates`} value={exp.dates} onChange={onDataChange} className="font-black text-slate-400 text-xs uppercase tracking-widest" />
              </div>
              <div className="flex justify-between items-baseline mb-4">
                <EditableField path={`experience[${i}].company`} value={exp.company} onChange={onDataChange} className="font-black text-slate-600 text-sm uppercase tracking-widest" />
                <EditableField path={`experience[${i}].location`} value={exp.location} onChange={onDataChange} className="text-slate-400 text-xs font-bold" />
              </div>
              <EditableList items={exp.description} path={`experience[${i}].description`} onChange={onDataChange} newItem="New achievement" className="space-y-3">
                {(desc, di) => (
                    <div className="text-slate-700 text-sm leading-relaxed flex gap-4">
                        <div className="w-2 h-2 bg-black mt-1.5 flex-shrink-0" />
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
      <section key="skills" className="mb-8">
        <h2 style={sectionTitleStyle}>Skills</h2>
        <div className="grid grid-cols-2 gap-8 mt-4">
          {data.skills.map((cat, i) => (
            <div key={cat.id} className="flex flex-col">
              <EditableField path={`skills[${i}].name`} value={cat.name} onChange={onDataChange} className="font-black text-black text-xs uppercase tracking-[0.2em] mb-3 border-b-2 border-black pb-1" />
              <div className="text-slate-600 text-xs font-bold leading-relaxed flex flex-wrap gap-2">
                {cat.skills.map((s, si) => (
                    <span key={si} className="px-3 py-1 bg-slate-100 text-black rounded-full text-[10px] font-black uppercase tracking-widest">
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
        <section key="education" className="mb-8">
          <h2 style={sectionTitleStyle}>Education</h2>
          <EditableList items={data.education || []} path="education" onChange={onDataChange} newItem={{ id: '', degree: 'Degree', institution: 'Institution', location: 'Location', graduationDate: 'Date' }}>
            {(edu, i) => (
              <div key={edu.id} className="mb-4 last:mb-0 mt-4">
                <div className="flex justify-between items-baseline">
                  <EditableField path={`education[${i}].degree`} value={edu.degree} onChange={onDataChange} className="font-black text-black text-base" />
                  <EditableField path={`education[${i}].graduationDate`} value={edu.graduationDate} onChange={onDataChange} className="text-slate-400 text-[10px] font-black tracking-widest" />
                </div>
                <EditableField path={`education[${i}].institution`} value={edu.institution} onChange={onDataChange} className="text-slate-500 text-xs font-bold uppercase tracking-widest mt-1" />
              </div>
            )}
          </EditableList>
        </section>
    ),
    projects: (
        <section key="projects" className="mb-8">
          <h2 style={sectionTitleStyle}>Projects</h2>
          <EditableList items={data.projects || []} path="projects" onChange={onDataChange} newItem={{ id: '', name: 'Project', role: 'Role', description: ['Detail'] }}>
            {(proj, i) => (
              <div key={proj.id} className="mb-6 last:mb-0 mt-4">
                <div className="flex justify-between items-baseline mb-2">
                    <EditableField path={`projects[${i}].name`} value={proj.name} onChange={onDataChange} className="font-black text-black text-sm uppercase tracking-widest" />
                    <EditableField path={`projects[${i}].role`} value={proj.role} onChange={onDataChange} className="text-slate-400 text-[10px] font-black uppercase" />
                </div>
                <div className="text-slate-600 text-xs leading-relaxed font-bold">
                    {proj.description.map((desc, di) => (
                        <div key={di} className="flex gap-3 mb-1">
                            <span className="text-black font-black">/</span>
                            <EditableField as="span" path={`projects[${i}].description[${di}]`} value={desc} onChange={onDataChange} />
                        </div>
                    ))}
                </div>
              </div>
            )}
          </EditableList>
        </section>
    ),
    certifications: <div key="certifications" />,
    awards: <div key="awards" />,
    keywords: (
        <section key="keywords" className="mb-8">
          <h2 style={sectionTitleStyle}>Keywords</h2>
          <div className="text-slate-700 leading-relaxed text-sm font-bold mt-4">
            {data.keywords?.join(' • ')}
          </div>
        </section>
    )
  };

  return (
    <div id="resume-content" style={{ padding: marginValue }} className="bg-white font-sans selection:bg-black selection:text-white">
      <header className="mb-16 border-b-8 border-black pb-12">
        <EditableField as="h1" path="fullName" value={data.fullName} onChange={onDataChange} className="text-8xl font-black leading-none tracking-tighter text-black mb-6" />
        <div className="flex justify-between items-end">
            <EditableField as="p" path="title" value={data.title} onChange={onDataChange} className="text-black font-black text-2xl uppercase tracking-[0.2em]" />
            <div className="text-right text-[10px] font-black text-slate-400 uppercase tracking-widest space-y-1">
                <EditableField path="contactInfo.email" value={data.contactInfo.email} onChange={onDataChange} className="block hover:text-black" />
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

export default BoldImpact;
