
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

const TechFocused: React.FC<TemplateProps> = ({ data, sectionOrder, customization, sectionVisibility, onDataChange }) => {
  const marginValue = { compact: '0.3in', normal: '0.5in', spacious: '0.8in' }[customization.margin] || '0.5in';
  
  const sectionTitleStyle: React.CSSProperties = {
    fontSize: `11pt`,
    color: '#0ea5e9', // Sky-500
    textTransform: 'uppercase',
    fontFamily: 'monospace',
    marginBottom: '10px',
    marginTop: '20px',
    fontWeight: 'bold',
    borderLeft: '4px solid #0ea5e9',
    paddingLeft: '10px',
  };

  const sections: Record<ResumeSectionKey, React.ReactNode> = {
    summary: (
      <section key="summary" className="mb-6">
        <h2 style={sectionTitleStyle}>// Profile</h2>
        <EditableField as="p" path="summary" value={data.summary} onChange={onDataChange} className="text-slate-300 leading-relaxed text-sm font-mono" />
      </section>
    ),
    experience: (
      <section key="experience" className="mb-6">
        <h2 style={sectionTitleStyle}>// Experience</h2>
        <EditableList items={data.experience || []} path="experience" onChange={onDataChange} newItem={{ id: '', role: 'Role', company: 'Company', location: 'Location', dates: 'Dates', description: ['Achievement'] }}>
          {(exp, i) => (
            <div key={exp.id} className="mb-6 last:mb-0 border-l border-slate-800 ml-1 pl-6 relative">
              <div className="absolute -left-[5px] top-2 w-2 h-2 rounded-full bg-sky-500" />
              <div className="flex justify-between items-baseline mb-1">
                <EditableField path={`experience[${i}].role`} value={exp.role} onChange={onDataChange} className="font-bold text-white text-base font-mono" />
                <EditableField path={`experience[${i}].dates`} value={exp.dates} onChange={onDataChange} className="text-sky-500 text-xs font-mono" />
              </div>
              <div className="flex justify-between items-baseline mb-3">
                <EditableField path={`experience[${i}].company`} value={exp.company} onChange={onDataChange} className="text-slate-400 text-sm font-mono" />
                <EditableField path={`experience[${i}].location`} value={exp.location} onChange={onDataChange} className="text-slate-500 text-xs font-mono" />
              </div>
              <EditableList items={exp.description} path={`experience[${i}].description`} onChange={onDataChange} newItem="New achievement" className="space-y-1">
                {(desc, di) => (
                    <div className="text-slate-400 text-sm leading-relaxed font-mono flex gap-2">
                        <span className="text-sky-500 opacity-50">{">"}</span>
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
      <section key="skills" className="mb-6">
        <h2 style={sectionTitleStyle}>// Stack</h2>
        <div className="grid grid-cols-2 gap-6">
          {data.skills.map((cat, i) => (
            <div key={cat.id} className="flex flex-col bg-slate-900/50 p-3 rounded border border-slate-800">
              <EditableField path={`skills[${i}].name`} value={cat.name} onChange={onDataChange} className="font-bold text-sky-500 text-xs mb-2 font-mono uppercase tracking-widest" />
              <div className="text-slate-300 text-xs leading-relaxed font-mono flex flex-wrap gap-2">
                {cat.skills.map((s, si) => (
                    <span key={si} className="px-2 py-0.5 bg-sky-500/10 text-sky-400 rounded border border-sky-500/20">
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
        <section key="education" className="mb-6">
          <h2 style={sectionTitleStyle}>// Education</h2>
          <EditableList items={data.education || []} path="education" onChange={onDataChange} newItem={{ id: '', degree: 'Degree', institution: 'Institution', location: 'Location', graduationDate: 'Date' }}>
            {(edu, i) => (
              <div key={edu.id} className="mb-3 last:mb-0 font-mono">
                <div className="flex justify-between items-baseline">
                  <EditableField path={`education[${i}].degree`} value={edu.degree} onChange={onDataChange} className="font-bold text-white text-sm" />
                  <EditableField path={`education[${i}].graduationDate`} value={edu.graduationDate} onChange={onDataChange} className="text-sky-500 text-xs" />
                </div>
                <EditableField path={`education[${i}].institution`} value={edu.institution} onChange={onDataChange} className="text-slate-400 text-xs" />
              </div>
            )}
          </EditableList>
        </section>
    ),
    projects: (
        <section key="projects" className="mb-6">
          <h2 style={sectionTitleStyle}>// Projects</h2>
          <EditableList items={data.projects || []} path="projects" onChange={onDataChange} newItem={{ id: '', name: 'Project', role: 'Role', description: ['Detail'] }}>
            {(proj, i) => (
              <div key={proj.id} className="mb-4 last:mb-0 font-mono">
                <div className="flex justify-between items-baseline mb-1">
                    <EditableField path={`projects[${i}].name`} value={proj.name} onChange={onDataChange} className="font-bold text-white text-sm" />
                    <EditableField path={`projects[${i}].role`} value={proj.role} onChange={onDataChange} className="text-sky-500 text-xs" />
                </div>
                <div className="text-slate-400 text-xs leading-relaxed">
                    {proj.description.map((desc, di) => (
                        <div key={di} className="flex gap-2">
                            <span className="text-sky-500 opacity-50">#</span>
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
        <section key="keywords" className="mb-6">
          <h2 style={sectionTitleStyle}>// Keywords</h2>
          <div className="text-slate-300 leading-relaxed text-sm font-mono mt-2 flex flex-wrap gap-2">
            {data.keywords?.map((k, i) => (
                <span key={i} className="text-sky-400">"{k}"{i < (data.keywords?.length || 0) - 1 ? ',' : ''}</span>
            ))}
          </div>
        </section>
    )
  };

  return (
    <div id="resume-content" style={{ padding: marginValue }} className="bg-[#0f172a] text-slate-300 font-mono min-h-[11in]">
      <header className="mb-12 border-b border-slate-800 pb-8">
        <div className="flex justify-between items-start">
            <div>
                <EditableField as="h1" path="fullName" value={data.fullName} onChange={onDataChange} className="text-5xl font-bold leading-none text-white font-mono tracking-tighter" />
                <EditableField as="p" path="title" value={data.title} onChange={onDataChange} className="text-sky-500 font-bold mt-4 text-lg uppercase tracking-widest font-mono" />
            </div>
            <div className="text-right text-[10px] font-mono text-slate-500 space-y-1">
                <div className="flex items-center justify-end gap-2">
                    <span className="text-sky-500 opacity-50">email:</span>
                    <EditableField path="contactInfo.email" value={data.contactInfo.email} onChange={onDataChange} className="text-slate-300" />
                </div>
                <div className="flex items-center justify-end gap-2">
                    <span className="text-sky-500 opacity-50">phone:</span>
                    <EditableField path="contactInfo.phone" value={data.contactInfo.phone} onChange={onDataChange} className="text-slate-300" />
                </div>
                <div className="flex items-center justify-end gap-2">
                    <span className="text-sky-500 opacity-50">loc:</span>
                    <EditableField path="contactInfo.location" value={data.contactInfo.location} onChange={onDataChange} className="text-slate-300" />
                </div>
                {data.contactInfo.linkedin && (
                    <div className="flex items-center justify-end gap-2">
                        <span className="text-sky-500 opacity-50">in:</span>
                        <EditableField path="contactInfo.linkedin" value={data.contactInfo.linkedin} onChange={onDataChange} className="text-sky-500" />
                    </div>
                )}
            </div>
        </div>
      </header>
      
      <main>
        {sectionOrder.filter(k => sectionVisibility[k]).map(k => sections[k])}
      </main>
    </div>
  );
};

export default TechFocused;
