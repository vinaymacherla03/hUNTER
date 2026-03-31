
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

const CanvaInspired: React.FC<TemplateProps> = ({ data, sectionOrder, customization, sectionVisibility, onDataChange }) => {
  const marginValue = { compact: '0.2in', normal: '0.4in', spacious: '0.6in' }[customization.margin] || '0.4in';
  
  const sectionTitleStyle: React.CSSProperties = {
    fontSize: `12pt`,
    color: '#7c3aed', // Violet-600
    textTransform: 'uppercase',
    letterSpacing: '0.2em',
    marginBottom: '16px',
    marginTop: '24px',
    fontWeight: '900',
    textAlign: 'center',
  };

  const sections: Record<ResumeSectionKey, React.ReactNode> = {
    summary: (
      <section key="summary" className="mb-10 text-center max-w-2xl mx-auto">
        <h2 style={sectionTitleStyle}>About Me</h2>
        <EditableField as="p" path="summary" value={data.summary} onChange={onDataChange} className="text-slate-600 leading-relaxed text-sm font-medium italic" />
      </section>
    ),
    experience: (
      <section key="experience" className="mb-10">
        <h2 style={sectionTitleStyle}>Experience</h2>
        <EditableList items={data.experience || []} path="experience" onChange={onDataChange} newItem={{ id: '', role: 'Role', company: 'Company', location: 'Location', dates: 'Dates', description: ['Achievement'] }}>
          {(exp, i) => (
            <div key={exp.id} className="mb-8 last:mb-0 flex gap-8">
              <div className="w-32 flex-shrink-0 text-right">
                <EditableField path={`experience[${i}].dates`} value={exp.dates} onChange={onDataChange} className="font-black text-violet-600 text-[10px] uppercase tracking-widest" />
              </div>
              <div className="flex-1 border-l-2 border-violet-100 pl-8 relative">
                <div className="absolute -left-[5px] top-1 w-2 h-2 rounded-full bg-violet-600" />
                <EditableField path={`experience[${i}].role`} value={exp.role} onChange={onDataChange} className="font-black text-slate-900 text-lg mb-1" />
                <div className="flex gap-2 items-center mb-4">
                    <EditableField path={`experience[${i}].company`} value={exp.company} onChange={onDataChange} className="font-bold text-slate-400 text-xs uppercase tracking-widest" />
                    <span className="text-slate-200">/</span>
                    <EditableField path={`experience[${i}].location`} value={exp.location} onChange={onDataChange} className="text-slate-400 text-xs font-bold" />
                </div>
                <EditableList items={exp.description} path={`experience[${i}].description`} onChange={onDataChange} newItem="New achievement" className="space-y-3">
                    {(desc, di) => (
                        <div className="text-slate-600 text-sm leading-relaxed flex gap-3">
                            <span className="text-violet-400 font-black">→</span>
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
        <h2 style={sectionTitleStyle}>Skills</h2>
        <div className="flex flex-wrap justify-center gap-4">
          {data.skills.flatMap(cat => cat.skills).map((s, si) => (
            <span key={si} className="px-4 py-2 bg-violet-50 text-violet-600 rounded-xl text-xs font-black uppercase tracking-widest border border-violet-100">
                {s.name}
            </span>
          ))}
        </div>
      </section>
    ),
    education: (
        <section key="education" className="mb-10">
          <h2 style={sectionTitleStyle}>Education</h2>
          <div className="grid grid-cols-2 gap-8">
            {data.education.map((edu, i) => (
              <div key={edu.id} className="text-center p-6 bg-slate-50 rounded-3xl border border-slate-100">
                <EditableField path={`education[${i}].degree`} value={edu.degree} onChange={onDataChange} className="font-black text-slate-900 text-sm mb-2" />
                <EditableField path={`education[${i}].institution`} value={edu.institution} onChange={onDataChange} className="text-violet-600 text-[10px] font-black uppercase tracking-widest block mb-1" />
                <EditableField path={`education[${i}].graduationDate`} value={edu.graduationDate} onChange={onDataChange} className="text-slate-400 text-[10px] font-bold block" />
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
              <div key={proj.id} className="p-6 border-2 border-slate-50 rounded-3xl hover:border-violet-100 transition-colors">
                <EditableField path={`projects[${i}].name`} value={proj.name} onChange={onDataChange} className="font-black text-slate-900 text-sm uppercase tracking-widest mb-2" />
                <EditableField path={`projects[${i}].role`} value={proj.role} onChange={onDataChange} className="text-violet-500 text-[10px] font-black uppercase block mb-3" />
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
          <div className="text-slate-600 leading-relaxed text-sm font-medium italic text-center max-w-2xl mx-auto">
            {data.keywords?.join(', ')}
          </div>
        </section>
    )
  };

  return (
    <div id="resume-content" style={{ padding: marginValue }} className="bg-white font-sans selection:bg-violet-600 selection:text-white">
      <header className="mb-16 text-center">
        <div className="inline-block px-12 py-8 bg-violet-600 rounded-[4rem] mb-8">
            <EditableField as="h1" path="fullName" value={data.fullName} onChange={onDataChange} className="text-6xl font-black leading-none tracking-tighter text-white" />
        </div>
        <EditableField as="p" path="title" value={data.title} onChange={onDataChange} className="text-slate-900 font-black text-xl uppercase tracking-[0.4em] mb-8" />
        
        <div className="flex justify-center gap-8 text-[10px] font-black text-slate-400 uppercase tracking-widest">
            <EditableField path="contactInfo.email" value={data.contactInfo.email} onChange={onDataChange} className="hover:text-violet-600 transition-colors" />
            <EditableField path="contactInfo.phone" value={data.contactInfo.phone} onChange={onDataChange} />
            <EditableField path="contactInfo.location" value={data.contactInfo.location} onChange={onDataChange} />
        </div>
      </header>
      
      <main>
        {sectionOrder.filter(k => sectionVisibility[k]).map(k => sections[k])}
      </main>
    </div>
  );
};

export default CanvaInspired;
