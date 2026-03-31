
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

const GoogleStyle: React.FC<TemplateProps> = ({ data, sectionOrder, customization, sectionVisibility, onDataChange }) => {
  const marginValue = { compact: '0.4in', normal: '0.6in', spacious: '0.8in' }[customization.margin] || '0.6in';
  
  const sectionTitleStyle: React.CSSProperties = {
    fontSize: `11pt`,
    color: '#000',
    textTransform: 'uppercase',
    letterSpacing: '0.05em',
    marginBottom: '8px',
    marginTop: '16px',
    fontWeight: 'bold',
    borderBottom: '1px solid #e5e7eb',
    paddingBottom: '2px',
  };

  const sections: Record<ResumeSectionKey, React.ReactNode> = {
    summary: (
      <section key="summary" className="mb-4">
        <h2 style={sectionTitleStyle}>Summary</h2>
        <EditableField as="p" path="summary" value={data.summary} onChange={onDataChange} className="text-slate-700 leading-normal text-[10pt]" />
      </section>
    ),
    experience: (
      <section key="experience" className="mb-4">
        <h2 style={sectionTitleStyle}>Experience</h2>
        <EditableList items={data.experience || []} path="experience" onChange={onDataChange} newItem={{ id: '', role: 'Role', company: 'Company', location: 'Location', dates: 'Dates', description: ['Achievement'] }}>
          {(exp, i) => (
            <div key={exp.id} className="mb-4 last:mb-0" style={{ pageBreakInside: 'avoid' }}>
              <div className="flex justify-between items-baseline mb-0.5">
                <div className="flex gap-2 items-baseline">
                    <EditableField path={`experience[${i}].role`} value={exp.role} onChange={onDataChange} className="font-bold text-black text-[11pt]" />
                    <span className="text-slate-400 text-xs">|</span>
                    <EditableField path={`experience[${i}].company`} value={exp.company} onChange={onDataChange} className="font-bold text-slate-700 text-[10pt]" />
                </div>
                <EditableField path={`experience[${i}].dates`} value={exp.dates} onChange={onDataChange} className="text-slate-500 text-[9pt]" />
              </div>
              <div className="mb-2">
                <EditableField path={`experience[${i}].location`} value={exp.location} onChange={onDataChange} className="text-slate-400 text-[9pt] italic" />
              </div>
              <EditableList items={exp.description} path={`experience[${i}].description`} onChange={onDataChange} newItem="New achievement" className="list-disc pl-5 space-y-0.5">
                {(desc, di) => (
                    <div className="text-slate-700 text-[10pt] leading-snug">
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
      <section key="skills" className="mb-4">
        <h2 style={sectionTitleStyle}>Skills</h2>
        <div className="space-y-1">
          {data.skills?.map((cat, i) => (
            <div key={cat.id} className="flex gap-2">
              <EditableField path={`skills[${i}].name`} value={cat.name} onChange={onDataChange} className="font-bold text-black text-[10pt] min-w-[120px]" />
              <div className="flex-1 text-slate-700 text-[10pt]">
                <EditableField 
                    path={`skills[${i}].skills`} 
                    value={cat.skills?.map(s => s.name).join(', ')} 
                    onChange={(p, v) => onDataChange(p, v.split(',').map(s => ({ name: s.trim(), proficiency: 'Intermediate' })))} 
                />
              </div>
            </div>
          ))}
        </div>
      </section>
    ),
    education: (
        <section key="education" className="mb-4">
          <h2 style={sectionTitleStyle}>Education</h2>
          <EditableList items={data.education || []} path="education" onChange={onDataChange} newItem={{ id: '', degree: 'Degree', institution: 'Institution', location: 'Location', graduationDate: 'Date' }}>
            {(edu, i) => (
              <div key={edu.id} className="mb-2 last:mb-0">
                <div className="flex justify-between items-baseline">
                  <div className="flex gap-2 items-baseline">
                    <EditableField path={`education[${i}].degree`} value={edu.degree} onChange={onDataChange} className="font-bold text-black text-[10pt]" />
                    <span className="text-slate-400 text-xs">|</span>
                    <EditableField path={`education[${i}].institution`} value={edu.institution} onChange={onDataChange} className="font-bold text-slate-700 text-[9pt]" />
                  </div>
                  <EditableField path={`education[${i}].graduationDate`} value={edu.graduationDate} onChange={onDataChange} className="text-slate-500 text-[9pt]" />
                </div>
                <EditableField path={`education[${i}].location`} value={edu.location} onChange={onDataChange} className="text-slate-400 text-[9pt] italic" />
              </div>
            )}
          </EditableList>
        </section>
    ),
    projects: data.projects?.length ? (
        <section key="projects" className="mb-4" style={{ pageBreakInside: 'avoid' }}>
          <h2 style={sectionTitleStyle}>Projects</h2>
          <EditableList items={data.projects || []} path="projects" onChange={onDataChange} newItem={{ id: '', name: 'Project', role: 'Role', description: ['Detail'] }}>
            {(proj, i) => (
              <div key={proj.id} className="mb-2 last:mb-0">
                <div className="flex justify-between items-baseline mb-1">
                    <EditableField path={`projects[${i}].name`} value={proj.name} onChange={onDataChange} className="font-bold text-black text-[10pt]" />
                    <EditableField path={`projects[${i}].role`} value={proj.role} onChange={onDataChange} className="text-slate-500 text-[9pt] italic" />
                </div>
                <div className="text-slate-700 text-[9pt] leading-snug">
                    {proj.description?.join(' • ')}
                </div>
              </div>
            )}
          </EditableList>
        </section>
    ) : null,
    certifications: data.certifications?.length ? (
        <section key="certifications" className="mb-4" style={{ pageBreakInside: 'avoid' }}>
          <h2 style={sectionTitleStyle}>Certifications</h2>
          <div className="space-y-2">
            {data.certifications?.map((cert, i) => (
              <div key={cert.id} className="flex justify-between items-baseline">
                <div>
                    <span className="font-bold text-black text-[10pt]">{cert.name}</span>
                    {cert.issuer && <span className="text-slate-700 text-[9pt]"> - {cert.issuer}</span>}
                </div>
                {cert.date && <div className="text-slate-500 text-[9pt]">{cert.date}</div>}
              </div>
            ))}
          </div>
        </section>
    ) : null,
    awards: data.awards?.length ? (
        <section key="awards" className="mb-4" style={{ pageBreakInside: 'avoid' }}>
          <h2 style={sectionTitleStyle}>Awards</h2>
          <div className="space-y-2">
            {data.awards?.map((award, i) => (
              <div key={award.id} className="flex justify-between items-baseline">
                <div>
                    <span className="font-bold text-black text-[10pt]">{award.name}</span>
                    {award.issuer && <span className="text-slate-700 text-[9pt]"> - {award.issuer}</span>}
                </div>
                {award.date && <div className="text-slate-500 text-[9pt]">{award.date}</div>}
              </div>
            ))}
          </div>
        </section>
    ) : null,
    keywords: data.keywords?.length ? (
        <section key="keywords" className="mb-4">
          <h2 style={sectionTitleStyle}>Keywords</h2>
          <div className="text-slate-700 text-[10pt] leading-normal mt-1">
            {data.keywords?.join(', ')}
          </div>
        </section>
    ) : null
  };

  return (
    <div id="resume-content" className="bg-white font-sans">
      <header className="text-center mb-6">
        <EditableField as="h1" path="fullName" value={data.fullName} onChange={onDataChange} className="text-[24pt] font-normal leading-none text-black mb-2" />
        <div className="flex justify-center flex-wrap gap-x-3 text-[10pt] text-slate-600">
          <EditableField path="contactInfo.location" value={data.contactInfo?.location} onChange={onDataChange} />
          <span>|</span>
          <EditableField path="contactInfo.phone" value={data.contactInfo?.phone} onChange={onDataChange} />
          <span>|</span>
          <EditableField path="contactInfo.email" value={data.contactInfo?.email} onChange={onDataChange} className="text-blue-600" />
          {data.contactInfo?.linkedin && (
              <>
                <span>|</span>
                <EditableField path="contactInfo.linkedin" value={data.contactInfo?.linkedin} onChange={onDataChange} className="text-blue-600" />
              </>
          )}
        </div>
      </header>
      
      <main>
        {sectionOrder.filter(k => sectionVisibility[k]).map(k => sections[k])}
      </main>
    </div>
  );
};

export default GoogleStyle;
