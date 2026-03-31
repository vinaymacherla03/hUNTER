
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

const MinimalistClean: React.FC<TemplateProps> = ({ data, sectionOrder, customization, sectionVisibility, onDataChange }) => {
  const marginValue = { compact: '0.4in', normal: '0.7in', spacious: '1.2in' }[customization.margin] || '0.7in';
  
  const sectionTitleStyle: React.CSSProperties = {
    fontSize: `${customization.sectionTitleSize}pt`,
    color: '#000',
    textTransform: 'uppercase',
    letterSpacing: '0.2em',
    marginBottom: '12px',
    marginTop: '24px',
    fontWeight: '900',
    borderLeft: '4px solid #000',
    paddingLeft: '12px',
  };

  const sections: Record<ResumeSectionKey, React.ReactNode> = {
    summary: (
      <section key="summary" className="mb-6">
        <h2 style={sectionTitleStyle}>About</h2>
        <EditableField as="p" path="summary" value={data.summary} onChange={onDataChange} className="text-slate-600 leading-relaxed text-sm font-medium" />
      </section>
    ),
    experience: (
      <section key="experience" className="mb-6">
        <h2 style={sectionTitleStyle}>History</h2>
        <EditableList items={data.experience || []} path="experience" onChange={onDataChange} newItem={{ id: '', role: 'Role', company: 'Company', location: 'Location', dates: 'Dates', description: ['Achievement'] }}>
          {(exp, i) => (
            <div key={exp.id} className="mb-6 last:mb-0" style={{ pageBreakInside: 'avoid' }}>
              <div className="flex justify-between items-baseline mb-1">
                <EditableField path={`experience[${i}].role`} value={exp.role} onChange={onDataChange} className="font-black text-black text-lg" />
                <EditableField path={`experience[${i}].dates`} value={exp.dates} onChange={onDataChange} className="font-black text-slate-300 text-xs tracking-widest" />
              </div>
              <div className="mb-3">
                <EditableField path={`experience[${i}].company`} value={exp.company} onChange={onDataChange} className="font-bold text-slate-400 text-xs uppercase tracking-widest" />
              </div>
              <EditableList items={exp.description} path={`experience[${i}].description`} onChange={onDataChange} newItem="New achievement" className="space-y-2">
                {(desc, di) => (
                    <div className="text-slate-600 text-sm leading-relaxed flex gap-3">
                        <span className="text-black font-black">•</span>
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
        <h2 style={sectionTitleStyle}>Expertise</h2>
        <div className="flex flex-wrap gap-x-12 gap-y-4">
          {data.skills?.map((cat, i) => (
            <div key={cat.id} className="flex flex-col">
              <EditableField path={`skills[${i}].name`} value={cat.name} onChange={onDataChange} className="font-black text-black text-[10px] uppercase tracking-[0.2em] mb-2" />
              <div className="text-slate-500 text-xs font-medium">
                <EditableField 
                    path={`skills[${i}].skills`} 
                    value={cat.skills?.map(s => s.name).join(' / ')} 
                    onChange={(p, v) => onDataChange(p, v.split('/').map(s => ({ name: s.trim(), proficiency: 'Intermediate' })))} 
                />
              </div>
            </div>
          ))}
        </div>
      </section>
    ),
    education: (
        <section key="education" className="mb-6">
          <h2 style={sectionTitleStyle}>Education</h2>
          <EditableList items={data.education || []} path="education" onChange={onDataChange} newItem={{ id: '', degree: 'Degree', institution: 'Institution', location: 'Location', graduationDate: 'Date' }}>
            {(edu, i) => (
              <div key={edu.id} className="mb-4 last:mb-0">
                <div className="flex justify-between items-baseline">
                  <EditableField path={`education[${i}].degree`} value={edu.degree} onChange={onDataChange} className="font-black text-black text-sm" />
                  <EditableField path={`education[${i}].graduationDate`} value={edu.graduationDate} onChange={onDataChange} className="text-slate-300 text-[10px] font-black tracking-widest" />
                </div>
                <EditableField path={`education[${i}].institution`} value={edu.institution} onChange={onDataChange} className="text-slate-400 text-xs font-bold uppercase tracking-widest mt-1" />
              </div>
            )}
          </EditableList>
        </section>
    ),
    projects: data.projects?.length ? (
        <section key="projects" className="mb-6" style={{ pageBreakInside: 'avoid' }}>
          <h2 style={sectionTitleStyle}>Projects</h2>
          <EditableList items={data.projects || []} path="projects" onChange={onDataChange} newItem={{ id: '', name: 'Project', role: 'Role', description: ['Detail'] }}>
            {(proj, i) => (
              <div key={proj.id} className="mb-4 last:mb-0">
                <div className="flex justify-between items-baseline mb-1">
                    <EditableField path={`projects[${i}].name`} value={proj.name} onChange={onDataChange} className="font-black text-black text-sm uppercase tracking-widest" />
                    <EditableField path={`projects[${i}].role`} value={proj.role} onChange={onDataChange} className="text-slate-300 text-[10px] font-black" />
                </div>
                <div className="text-slate-600 text-xs leading-relaxed">
                    {proj.description?.map((desc, di) => (
                        <EditableField key={di} as="p" path={`projects[${i}].description[${di}]`} value={desc} onChange={onDataChange} className="mb-1" />
                    ))}
                </div>
              </div>
            )}
          </EditableList>
        </section>
    ) : null,
    certifications: data.certifications?.length ? (
        <section key="certifications" className="mb-6" style={{ pageBreakInside: 'avoid' }}>
          <h2 style={sectionTitleStyle}>Certifications</h2>
          <div className="space-y-4">
            {data.certifications?.map((cert, i) => (
              <div key={cert.id} className="flex justify-between items-baseline">
                <div>
                    <span className="font-black text-black text-sm uppercase tracking-widest">{cert.name}</span>
                    {cert.issuer && <div className="text-slate-400 text-[10px] font-bold uppercase tracking-widest mt-1">{cert.issuer}</div>}
                </div>
                {cert.date && <div className="text-slate-300 text-[10px] font-black tracking-widest">{cert.date}</div>}
              </div>
            ))}
          </div>
        </section>
    ) : null,
    awards: data.awards?.length ? (
        <section key="awards" className="mb-6" style={{ pageBreakInside: 'avoid' }}>
          <h2 style={sectionTitleStyle}>Awards</h2>
          <div className="space-y-4">
            {data.awards?.map((award, i) => (
              <div key={award.id} className="flex justify-between items-baseline">
                <div>
                    <span className="font-black text-black text-sm uppercase tracking-widest">{award.name}</span>
                    {award.issuer && <div className="text-slate-400 text-[10px] font-bold uppercase tracking-widest mt-1">{award.issuer}</div>}
                </div>
                {award.date && <div className="text-slate-300 text-[10px] font-black tracking-widest">{award.date}</div>}
              </div>
            ))}
          </div>
        </section>
    ) : null,
    keywords: data.keywords?.length ? (
        <section key="keywords" className="mb-6" style={{ pageBreakInside: 'avoid' }}>
          <h2 style={sectionTitleStyle}>Keywords</h2>
          <div className="text-slate-600 text-sm font-medium leading-relaxed mt-2">
            {data.keywords?.join(', ')}
          </div>
        </section>
    ) : null
  };

  return (
    <div id="resume-content" className="bg-white font-sans selection:bg-black selection:text-white">
      <header className="mb-16">
        <EditableField as="h1" path="fullName" value={data.fullName} onChange={onDataChange} className="text-7xl font-black leading-none tracking-tighter text-black mb-4" />
        <div className="flex justify-between items-center border-t-2 border-black pt-4">
            <EditableField as="p" path="title" value={data.title} onChange={onDataChange} className="text-black font-black text-xs uppercase tracking-[0.4em]" />
            <div className="flex gap-6 text-[9px] font-black text-slate-400 uppercase tracking-widest">
                <EditableField path="contactInfo.email" value={data.contactInfo?.email} onChange={onDataChange} className="hover:text-black transition-colors" />
                <EditableField path="contactInfo.phone" value={data.contactInfo?.phone} onChange={onDataChange} />
                <EditableField path="contactInfo.location" value={data.contactInfo?.location} onChange={onDataChange} />
            </div>
        </div>
      </header>
      
      <main>
        {sectionOrder.filter(k => sectionVisibility[k]).map(k => sections[k])}
      </main>
    </div>
  );
};

export default MinimalistClean;
