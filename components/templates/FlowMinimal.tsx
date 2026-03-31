
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

const FlowMinimal: React.FC<TemplateProps> = ({ data, sectionOrder, customization, sectionVisibility, onDataChange }) => {
  const marginValue = { compact: '0.3in', normal: '0.5in', spacious: '0.7in' }[customization.margin] || '0.5in';
  
  const sectionTitleStyle: React.CSSProperties = {
    fontSize: `10pt`,
    color: '#111827',
    textTransform: 'uppercase',
    letterSpacing: '0.15em',
    marginBottom: '16px',
    marginTop: '24px',
    fontWeight: '800',
    textAlign: 'center',
  };

  const sections: Record<ResumeSectionKey, React.ReactNode> = {
    summary: (
      <section key="summary" className="mb-8">
        <h2 style={sectionTitleStyle}>Profile</h2>
        <EditableField as="p" path="summary" value={data.summary} onChange={onDataChange} className="text-slate-600 leading-relaxed text-sm text-center max-w-2xl mx-auto" />
      </section>
    ),
    experience: (
      <section key="experience" className="mb-8">
        <h2 style={sectionTitleStyle}>Experience</h2>
        <EditableList items={data.experience || []} path="experience" onChange={onDataChange} newItem={{ id: '', role: 'Role', company: 'Company', location: 'Location', dates: 'Dates', description: ['Achievement'] }}>
          {(exp, i) => (
            <div key={exp.id} className="mb-6 last:mb-0">
              <div className="flex justify-between items-baseline mb-1">
                <EditableField path={`experience[${i}].role`} value={exp.role} onChange={onDataChange} className="font-bold text-slate-900 text-sm uppercase tracking-tight" />
                <EditableField path={`experience[${i}].dates`} value={exp.dates} onChange={onDataChange} className="text-slate-400 text-[10px] font-bold" />
              </div>
              <div className="mb-3 flex justify-between items-center text-[11px]">
                <EditableField path={`experience[${i}].company`} value={exp.company} onChange={onDataChange} className="font-semibold text-slate-700" />
                <EditableField path={`experience[${i}].location`} value={exp.location} onChange={onDataChange} className="text-slate-400 italic" />
              </div>
              <EditableList items={exp.description} path={`experience[${i}].description`} onChange={onDataChange} newItem="New achievement" className="space-y-1">
                {(desc, di) => (
                    <div className="text-slate-600 text-[11px] leading-relaxed flex gap-3">
                        <span className="text-slate-300">—</span>
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
          <h2 style={sectionTitleStyle}>Projects</h2>
          <div className="grid grid-cols-2 gap-8">
            {data.projects.map((proj, i) => (
              <div key={proj.id} className="mb-4 last:mb-0">
                <div className="flex justify-between items-baseline mb-1">
                    <EditableField path={`projects[${i}].name`} value={proj.name} onChange={onDataChange} className="font-bold text-slate-900 text-xs" />
                    <EditableField path={`projects[${i}].role`} value={proj.role} onChange={onDataChange} className="text-slate-400 text-[9px] italic" />
                </div>
                <div className="text-slate-600 text-[10px] leading-relaxed space-y-1">
                    {proj.description.map((desc, di) => (
                        <EditableField key={di} as="p" path={`projects[${i}].description[${di}]`} value={desc} onChange={onDataChange} />
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
          <div className="grid grid-cols-2 gap-8">
            {data.education.map((edu, i) => (
              <div key={edu.id} className="mb-4 last:mb-0">
                <div className="flex justify-between items-baseline">
                    <EditableField path={`education[${i}].degree`} value={edu.degree} onChange={onDataChange} className="font-bold text-slate-900 text-xs" />
                    <EditableField path={`education[${i}].graduationDate`} value={edu.graduationDate} onChange={onDataChange} className="text-slate-400 text-[9px] font-bold" />
                </div>
                <div className="flex justify-between text-[10px] mt-1">
                    <EditableField path={`education[${i}].institution`} value={edu.institution} onChange={onDataChange} className="text-slate-700 font-semibold" />
                    <EditableField path={`education[${i}].location`} value={edu.location} onChange={onDataChange} className="text-slate-400 italic" />
                </div>
              </div>
            ))}
          </div>
        </section>
    ),
    skills: (
      <section key="skills" className="mb-8">
        <h2 style={sectionTitleStyle}>Skills</h2>
        <div className="flex flex-wrap justify-center gap-x-8 gap-y-4">
          {data.skills.map((cat, i) => (
            <div key={cat.id} className="flex flex-col items-center">
              <EditableField path={`skills[${i}].name`} value={cat.name} onChange={onDataChange} className="font-bold text-slate-900 text-[10px] uppercase tracking-widest mb-2" />
              <div className="flex flex-wrap justify-center gap-2">
                {cat.skills.map((s, si) => (
                    <span key={si} className="text-slate-500 text-[10px] font-medium">
                        {s.name}{si < cat.skills.length - 1 ? ' •' : ''}
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
          <h2 style={sectionTitleStyle}>Certifications</h2>
          <div className="grid grid-cols-3 gap-4">
            {data.certifications?.map((cert, i) => (
              <div key={cert.id} className="text-center">
                <EditableField path={`certifications[${i}].name`} value={cert.name} onChange={onDataChange} className="font-bold text-slate-900 text-[10px]" />
                <div className="text-[9px] text-slate-400 mt-0.5">
                    <EditableField path={`certifications[${i}].issuer`} value={cert.issuer} onChange={onDataChange} />
                </div>
              </div>
            ))}
          </div>
        </section>
    ),
    awards: (
        <section key="awards" className="mb-8">
          <h2 style={sectionTitleStyle}>Awards</h2>
          <div className="grid grid-cols-3 gap-4">
            {data.awards?.map((award, i) => (
              <div key={award.id} className="text-center">
                <EditableField path={`awards[${i}].name`} value={award.name} onChange={onDataChange} className="font-bold text-slate-900 text-[10px]" />
                <div className="text-[9px] text-slate-400 mt-0.5">
                    <EditableField path={`awards[${i}].issuer`} value={award.issuer} onChange={onDataChange} />
                </div>
              </div>
            ))}
          </div>
        </section>
    ),
    keywords: (
        <section key="keywords" className="mb-8">
          <h2 style={sectionTitleStyle}>Keywords</h2>
          <div className="flex flex-wrap justify-center gap-x-4 gap-y-2">
            {data.keywords?.map((kw, i) => (
              <span key={i} className="text-slate-400 text-[9px] font-bold uppercase tracking-widest">
                {kw}
              </span>
            ))}
          </div>
        </section>
    )
  };

  return (
    <div id="resume-content" style={{ padding: marginValue }} className="bg-white font-sans text-slate-900">
      <header className="mb-12 text-center">
        <EditableField as="h1" path="fullName" value={data.fullName} onChange={onDataChange} className="text-4xl font-light leading-tight tracking-widest text-slate-900 mb-2 uppercase" />
        <EditableField as="p" path="title" value={data.title} onChange={onDataChange} className="text-slate-400 font-bold text-[11px] uppercase tracking-[0.3em] mb-8" />
        
        <div className="flex justify-center gap-8 text-[10px] font-medium text-slate-400 border-t border-slate-50 pt-6">
            <EditableField path="contactInfo.email" value={data.contactInfo.email} onChange={onDataChange} className="hover:text-slate-900 transition-colors" />
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

export default FlowMinimal;
