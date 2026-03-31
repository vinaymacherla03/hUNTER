
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

const EnhancvMinimal: React.FC<TemplateProps> = ({ data, sectionOrder, customization, sectionVisibility, onDataChange }) => {
  const marginValue = { compact: '0.4in', normal: '0.6in', spacious: '0.8in' }[customization.margin] || '0.6in';
  
  const sectionTitleStyle: React.CSSProperties = {
    fontSize: `11pt`,
    color: '#111827',
    textTransform: 'uppercase',
    letterSpacing: '0.1em',
    marginBottom: '12px',
    marginTop: '20px',
    fontWeight: '700',
    borderLeft: '4px solid #3b82f6',
    paddingLeft: '12px',
  };

  const sections: Record<ResumeSectionKey, React.ReactNode> = {
    summary: (
      <section key="summary" className="mb-6">
        <h2 style={sectionTitleStyle}>Summary</h2>
        <EditableField as="p" path="summary" value={data.summary} onChange={onDataChange} className="text-slate-600 leading-relaxed text-sm" />
      </section>
    ),
    experience: (
      <section key="experience" className="mb-6">
        <h2 style={sectionTitleStyle}>Experience</h2>
        <EditableList items={data.experience || []} path="experience" onChange={onDataChange} newItem={{ id: '', role: 'Role', company: 'Company', location: 'Location', dates: 'Dates', description: ['Achievement'] }}>
          {(exp, i) => (
            <div key={exp.id} className="mb-6 last:mb-0">
              <div className="flex justify-between items-baseline mb-1">
                <EditableField path={`experience[${i}].role`} value={exp.role} onChange={onDataChange} className="font-bold text-slate-900 text-sm" />
                <EditableField path={`experience[${i}].dates`} value={exp.dates} onChange={onDataChange} className="text-slate-400 text-[10px] font-bold" />
              </div>
              <div className="mb-2 text-xs font-semibold text-blue-600">
                <EditableField path={`experience[${i}].company`} value={exp.company} onChange={onDataChange} />
              </div>
              <EditableList items={exp.description} path={`experience[${i}].description`} onChange={onDataChange} newItem="New achievement" className="space-y-1">
                {(desc, di) => (
                    <div className="text-slate-600 text-sm leading-relaxed flex gap-2">
                        <span className="text-slate-300">•</span>
                        <EditableField as="div" path={`experience[${i}].description[${di}]`} value={desc} onChange={onDataChange} enableMarkdown />
                    </div>
                )}
              </EditableList>
            </div>
          )}
        </EditableList>
      </section>
    ),
    projects: (
        <section key="projects" className="mb-6">
          <h2 style={sectionTitleStyle}>Projects</h2>
          <EditableList items={data.projects || []} path="projects" onChange={onDataChange} newItem={{ id: '', name: 'Project', role: 'Role', description: ['Detail'] }}>
            {(proj, i) => (
              <div key={proj.id} className="mb-4 last:mb-0">
                <div className="flex justify-between items-baseline mb-1">
                    <EditableField path={`projects[${i}].name`} value={proj.name} onChange={onDataChange} className="font-bold text-slate-900 text-sm" />
                    <EditableField path={`projects[${i}].role`} value={proj.role} onChange={onDataChange} className="text-blue-600 text-[10px] font-bold" />
                </div>
                <div className="text-slate-600 text-xs leading-relaxed space-y-1">
                    {proj.description.map((desc, di) => (
                        <EditableField key={di} as="p" path={`projects[${i}].description[${di}]`} value={desc} onChange={onDataChange} />
                    ))}
                </div>
              </div>
            )}
          </EditableList>
        </section>
    ),
    education: (
        <section key="education" className="mb-6">
          <h2 style={sectionTitleStyle}>Education</h2>
          <EditableList items={data.education || []} path="education" onChange={onDataChange} newItem={{ id: '', degree: 'Degree', institution: 'Institution', location: 'Location', graduationDate: 'Date' }}>
            {(edu, i) => (
              <div key={edu.id} className="mb-4 last:mb-0">
                <div className="flex justify-between items-baseline">
                    <EditableField path={`education[${i}].degree`} value={edu.degree} onChange={onDataChange} className="font-bold text-slate-900 text-sm" />
                    <EditableField path={`education[${i}].graduationDate`} value={edu.graduationDate} onChange={onDataChange} className="text-slate-400 text-[10px] font-bold" />
                </div>
                <EditableField path={`education[${i}].institution`} value={edu.institution} onChange={onDataChange} className="text-blue-600 text-xs font-semibold mt-1" />
              </div>
            )}
          </EditableList>
        </section>
    ),
    skills: (
      <section key="skills" className="mb-6">
        <h2 style={sectionTitleStyle}>Skills</h2>
        <div className="grid grid-cols-1 gap-4">
          {data.skills.map((cat, i) => (
            <div key={cat.id} className="flex flex-col">
              <EditableField path={`skills[${i}].name`} value={cat.name} onChange={onDataChange} className="font-bold text-slate-900 text-[10px] uppercase tracking-widest mb-2" />
              <div className="flex flex-wrap gap-x-4 gap-y-1">
                {cat.skills.map((s, si) => (
                    <span key={si} className="text-slate-600 text-xs font-medium">
                        {s.name}
                    </span>
                ))}
              </div>
            </div>
          ))}
        </div>
      </section>
    ),
    certifications: (
        <section key="certifications" className="mb-6">
          <h2 style={sectionTitleStyle}>Certifications</h2>
          <div className="space-y-2">
            {data.certifications?.map((cert, i) => (
              <div key={cert.id} className="flex justify-between items-baseline">
                <EditableField path={`certifications[${i}].name`} value={cert.name} onChange={onDataChange} className="font-bold text-slate-900 text-xs" />
                <EditableField path={`certifications[${i}].date`} value={cert.date} onChange={onDataChange} className="text-slate-400 text-[10px] font-bold" />
              </div>
            ))}
          </div>
        </section>
    ),
    awards: (
        <section key="awards" className="mb-6">
          <h2 style={sectionTitleStyle}>Awards</h2>
          <div className="space-y-2">
            {data.awards?.map((award, i) => (
              <div key={award.id} className="flex justify-between items-baseline">
                <EditableField path={`awards[${i}].name`} value={award.name} onChange={onDataChange} className="font-bold text-slate-900 text-xs" />
                <EditableField path={`awards[${i}].date`} value={award.date} onChange={onDataChange} className="text-slate-400 text-[10px] font-bold" />
              </div>
            ))}
          </div>
        </section>
    ),
    keywords: (
        <section key="keywords" className="mb-6">
          <h2 style={sectionTitleStyle}>Keywords</h2>
          <div className="flex flex-wrap gap-2">
            {data.keywords?.map((kw, i) => (
              <span key={i} className="text-slate-500 text-[10px] font-bold uppercase tracking-widest">
                {kw}
              </span>
            ))}
          </div>
        </section>
    )
  };

  return (
    <div id="resume-content" style={{ padding: marginValue }} className="bg-white font-sans text-slate-900">
      <header className="mb-12">
        <EditableField as="h1" path="fullName" value={data.fullName} onChange={onDataChange} className="text-4xl font-black leading-tight tracking-tighter text-slate-900 mb-2" />
        <EditableField as="p" path="title" value={data.title} onChange={onDataChange} className="text-blue-600 font-bold text-xs uppercase tracking-[0.2em] mb-6" />
        
        <div className="flex flex-wrap gap-x-6 gap-y-2 text-[10px] font-bold uppercase tracking-widest text-slate-400">
            <EditableField path="contactInfo.email" value={data.contactInfo.email} onChange={onDataChange} />
            <EditableField path="contactInfo.phone" value={data.contactInfo.phone} onChange={onDataChange} />
            <EditableField path="contactInfo.location" value={data.contactInfo.location} onChange={onDataChange} />
            {data.contactInfo.linkedin && (
                <EditableField path="contactInfo.linkedin" value={data.contactInfo.linkedin} onChange={onDataChange} />
            )}
        </div>
      </header>
      
      <main className="grid grid-cols-1 gap-2">
        {sectionOrder.filter(k => sectionVisibility[k]).map(k => sections[k])}
      </main>
    </div>
  );
};

export default EnhancvMinimal;
