
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

const EnhancvClassic: React.FC<TemplateProps> = ({ data, sectionOrder, customization, sectionVisibility, onDataChange }) => {
  const marginValue = { compact: '0.4in', normal: '0.6in', spacious: '0.8in' }[customization.margin] || '0.6in';
  
  const sectionTitleStyle: React.CSSProperties = {
    fontSize: `12pt`,
    color: '#111827',
    textTransform: 'uppercase',
    letterSpacing: '0.05em',
    marginBottom: '16px',
    marginTop: '24px',
    fontWeight: '800',
    display: 'flex',
    alignItems: 'center',
    gap: '12px'
  };

  const sections: Record<ResumeSectionKey, React.ReactNode> = {
    summary: (
      <section key="summary" className="mb-8">
        <h2 style={sectionTitleStyle}>
          <div className="w-2 h-2 rounded-full bg-slate-900" />
          Summary
        </h2>
        <EditableField as="p" path="summary" value={data.summary} onChange={onDataChange} className="text-slate-700 leading-relaxed text-sm" />
      </section>
    ),
    experience: (
      <section key="experience" className="mb-8">
        <h2 style={sectionTitleStyle}>
          <div className="w-2 h-2 rounded-full bg-slate-900" />
          Experience
        </h2>
        <EditableList items={data.experience || []} path="experience" onChange={onDataChange} newItem={{ id: '', role: 'Role', company: 'Company', location: 'Location', dates: 'Dates', description: ['Achievement'] }}>
          {(exp, i) => (
            <div key={exp.id} className="mb-6 last:mb-0">
              <div className="flex justify-between items-baseline mb-1">
                <EditableField path={`experience[${i}].role`} value={exp.role} onChange={onDataChange} className="font-bold text-slate-900 text-base" />
                <EditableField path={`experience[${i}].dates`} value={exp.dates} onChange={onDataChange} className="text-slate-500 text-xs font-semibold" />
              </div>
              <div className="mb-3 flex gap-2 items-center text-sm">
                <EditableField path={`experience[${i}].company`} value={exp.company} onChange={onDataChange} className="font-bold text-slate-900" />
                <span className="text-slate-300">•</span>
                <EditableField path={`experience[${i}].location`} value={exp.location} onChange={onDataChange} className="text-slate-500 italic" />
              </div>
              <EditableList items={exp.description} path={`experience[${i}].description`} onChange={onDataChange} newItem="New achievement" className="space-y-1.5">
                {(desc, di) => (
                    <div className="text-slate-700 text-sm leading-relaxed flex gap-3">
                        <span className="text-slate-300 font-bold">•</span>
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
        <section key="projects" className="mb-8">
          <h2 style={sectionTitleStyle}>
            <div className="w-2 h-2 rounded-full bg-slate-900" />
            Projects
          </h2>
          <EditableList items={data.projects || []} path="projects" onChange={onDataChange} newItem={{ id: '', name: 'Project', role: 'Role', description: ['Detail'] }}>
            {(proj, i) => (
              <div key={proj.id} className="mb-4 last:mb-0">
                <div className="flex justify-between items-baseline mb-1">
                    <EditableField path={`projects[${i}].name`} value={proj.name} onChange={onDataChange} className="font-bold text-slate-900 text-sm" />
                    <EditableField path={`projects[${i}].role`} value={proj.role} onChange={onDataChange} className="text-slate-500 text-xs font-semibold" />
                </div>
                <div className="text-slate-700 text-xs leading-relaxed space-y-1">
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
        <section key="education" className="mb-8">
          <h2 style={sectionTitleStyle}>
            <div className="w-2 h-2 rounded-full bg-slate-900" />
            Education
          </h2>
          <EditableList items={data.education || []} path="education" onChange={onDataChange} newItem={{ id: '', degree: 'Degree', institution: 'Institution', location: 'Location', graduationDate: 'Date' }}>
            {(edu, i) => (
              <div key={edu.id} className="mb-4 last:mb-0">
                <div className="flex justify-between items-baseline">
                    <EditableField path={`education[${i}].degree`} value={edu.degree} onChange={onDataChange} className="font-bold text-slate-900 text-sm" />
                    <EditableField path={`education[${i}].graduationDate`} value={edu.graduationDate} onChange={onDataChange} className="text-slate-500 text-xs font-semibold" />
                </div>
                <div className="flex gap-2 text-xs mt-1">
                    <EditableField path={`education[${i}].institution`} value={edu.institution} onChange={onDataChange} className="text-slate-900 font-bold" />
                    <span className="text-slate-300">•</span>
                    <EditableField path={`education[${i}].location`} value={edu.location} onChange={onDataChange} className="text-slate-500 italic" />
                </div>
              </div>
            )}
          </EditableList>
        </section>
    ),
    skills: (
      <section key="skills" className="mb-8">
        <h2 style={sectionTitleStyle}>
          <div className="w-2 h-2 rounded-full bg-slate-900" />
          Skills
        </h2>
        <div className="grid grid-cols-2 gap-x-8 gap-y-4">
          {data.skills.map((cat, i) => (
            <div key={cat.id} className="flex flex-col">
              <EditableField path={`skills[${i}].name`} value={cat.name} onChange={onDataChange} className="font-bold text-slate-900 text-xs mb-2" />
              <div className="flex flex-wrap gap-2">
                {cat.skills.map((s, si) => (
                    <span key={si} className="px-2 py-1 bg-slate-50 text-slate-700 rounded text-[10px] font-semibold">
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
        <section key="certifications" className="mb-8">
          <h2 style={sectionTitleStyle}>
            <div className="w-2 h-2 rounded-full bg-slate-900" />
            Certifications
          </h2>
          <div className="grid grid-cols-2 gap-4">
            {data.certifications?.map((cert, i) => (
              <div key={cert.id} className="flex flex-col">
                <EditableField path={`certifications[${i}].name`} value={cert.name} onChange={onDataChange} className="font-bold text-slate-900 text-xs" />
                <div className="flex justify-between text-[10px] text-slate-500 mt-0.5">
                    <EditableField path={`certifications[${i}].issuer`} value={cert.issuer} onChange={onDataChange} />
                    <EditableField path={`certifications[${i}].date`} value={cert.date} onChange={onDataChange} />
                </div>
              </div>
            ))}
          </div>
        </section>
    ),
    awards: (
        <section key="awards" className="mb-8">
          <h2 style={sectionTitleStyle}>
            <div className="w-2 h-2 rounded-full bg-slate-900" />
            Awards
          </h2>
          <div className="grid grid-cols-2 gap-4">
            {data.awards?.map((award, i) => (
              <div key={award.id} className="flex flex-col">
                <EditableField path={`awards[${i}].name`} value={award.name} onChange={onDataChange} className="font-bold text-slate-900 text-xs" />
                <div className="flex justify-between text-[10px] text-slate-500 mt-0.5">
                    <EditableField path={`awards[${i}].issuer`} value={award.issuer} onChange={onDataChange} />
                    <EditableField path={`awards[${i}].date`} value={award.date} onChange={onDataChange} />
                </div>
              </div>
            ))}
          </div>
        </section>
    ),
    keywords: (
        <section key="keywords" className="mb-8">
          <h2 style={sectionTitleStyle}>
            <div className="w-2 h-2 rounded-full bg-slate-900" />
            Keywords
          </h2>
          <div className="flex flex-wrap gap-2">
            {data.keywords?.map((kw, i) => (
              <span key={i} className="px-2 py-1 border border-slate-200 text-slate-500 rounded text-[10px] font-semibold">
                {kw}
              </span>
            ))}
          </div>
        </section>
    )
  };

  return (
    <div id="resume-content" style={{ padding: marginValue }} className="bg-white font-sans text-slate-900">
      <header className="mb-10 border-b-4 border-slate-900 pb-8">
        <div className="flex justify-between items-end">
            <div>
                <EditableField as="h1" path="fullName" value={data.fullName} onChange={onDataChange} className="text-4xl font-black leading-tight tracking-tight text-slate-900 mb-1" />
                <EditableField as="p" path="title" value={data.title} onChange={onDataChange} className="text-slate-500 font-bold text-sm uppercase tracking-widest" />
            </div>
            <div className="flex flex-col items-end gap-1 text-xs font-semibold text-slate-600">
                <EditableField path="contactInfo.email" value={data.contactInfo.email} onChange={onDataChange} />
                <EditableField path="contactInfo.phone" value={data.contactInfo.phone} onChange={onDataChange} />
                <EditableField path="contactInfo.location" value={data.contactInfo.location} onChange={onDataChange} />
            </div>
        </div>
      </header>
      
      <main>
        {sectionOrder.filter(k => sectionVisibility[k]).map(k => sections[k])}
      </main>
    </div>
  );
};

export default EnhancvClassic;
