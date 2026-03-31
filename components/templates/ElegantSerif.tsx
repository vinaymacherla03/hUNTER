
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

const ElegantSerif: React.FC<TemplateProps> = ({ data, sectionOrder, customization, sectionVisibility, onDataChange }) => {
  const marginValue = { compact: '0.5in', normal: '0.8in', spacious: '1.2in' }[customization.margin] || '0.8in';
  
  const sectionTitleStyle: React.CSSProperties = {
    fontSize: `14pt`,
    color: '#334155',
    textTransform: 'capitalize',
    fontFamily: 'serif',
    marginBottom: '12px',
    marginTop: '24px',
    fontWeight: 'normal',
    borderBottom: '1px solid #cbd5e1',
    paddingBottom: '4px',
    fontStyle: 'italic',
  };

  const sections: Record<ResumeSectionKey, React.ReactNode> = {
    summary: (
      <section key="summary" className="mb-6">
        <h2 style={sectionTitleStyle}>Professional Summary</h2>
        <EditableField as="p" path="summary" value={data.summary} onChange={onDataChange} className="text-slate-700 leading-relaxed text-sm font-serif italic" />
      </section>
    ),
    experience: (
      <section key="experience" className="mb-6">
        <h2 style={sectionTitleStyle}>Professional Experience</h2>
        <EditableList items={data.experience || []} path="experience" onChange={onDataChange} newItem={{ id: '', role: 'Role', company: 'Company', location: 'Location', dates: 'Dates', description: ['Achievement'] }}>
          {(exp, i) => (
            <div key={exp.id} className="mb-6 last:mb-0">
              <div className="flex justify-between items-baseline mb-1">
                <EditableField path={`experience[${i}].role`} value={exp.role} onChange={onDataChange} className="font-bold text-slate-900 text-base font-serif" />
                <EditableField path={`experience[${i}].dates`} value={exp.dates} onChange={onDataChange} className="text-slate-500 text-xs italic" />
              </div>
              <div className="flex justify-between items-baseline mb-3">
                <EditableField path={`experience[${i}].company`} value={exp.company} onChange={onDataChange} className="text-slate-600 text-sm italic font-serif" />
                <EditableField path={`experience[${i}].location`} value={exp.location} onChange={onDataChange} className="text-slate-400 text-xs" />
              </div>
              <EditableList items={exp.description} path={`experience[${i}].description`} onChange={onDataChange} newItem="New achievement" className="list-disc pl-5 space-y-1">
                {(desc, di) => (
                    <div className="text-slate-700 text-sm leading-relaxed font-serif">
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
        <h2 style={sectionTitleStyle}>Expertise & Skills</h2>
        <div className="grid grid-cols-3 gap-4">
          {data.skills.map((cat, i) => (
            <div key={cat.id} className="flex flex-col">
              <EditableField path={`skills[${i}].name`} value={cat.name} onChange={onDataChange} className="font-bold text-slate-900 text-xs mb-1 font-serif" />
              <div className="text-slate-600 text-xs leading-relaxed italic">
                <EditableField 
                    path={`skills[${i}].skills`} 
                    value={cat.skills.map(s => s.name).join(', ')} 
                    onChange={(p, v) => onDataChange(p, v.split(',').map(s => ({ name: s.trim(), proficiency: 'Intermediate' })))} 
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
              <div key={edu.id} className="mb-3 last:mb-0">
                <div className="flex justify-between items-baseline">
                  <EditableField path={`education[${i}].degree`} value={edu.degree} onChange={onDataChange} className="font-bold text-slate-900 text-sm font-serif" />
                  <EditableField path={`education[${i}].graduationDate`} value={edu.graduationDate} onChange={onDataChange} className="text-slate-500 text-xs italic" />
                </div>
                <EditableField path={`education[${i}].institution`} value={edu.institution} onChange={onDataChange} className="text-slate-600 text-xs italic font-serif" />
              </div>
            )}
          </EditableList>
        </section>
    ),
    projects: (
        <section key="projects" className="mb-6">
          <h2 style={sectionTitleStyle}>Notable Projects</h2>
          <EditableList items={data.projects || []} path="projects" onChange={onDataChange} newItem={{ id: '', name: 'Project', role: 'Role', description: ['Detail'] }}>
            {(proj, i) => (
              <div key={proj.id} className="mb-4 last:mb-0">
                <div className="flex justify-between items-baseline mb-1">
                    <EditableField path={`projects[${i}].name`} value={proj.name} onChange={onDataChange} className="font-bold text-slate-900 text-sm font-serif" />
                    <EditableField path={`projects[${i}].role`} value={proj.role} onChange={onDataChange} className="text-slate-500 text-xs italic" />
                </div>
                <div className="text-slate-700 text-xs leading-relaxed font-serif italic">
                    {proj.description.join(' • ')}
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
          <h2 style={sectionTitleStyle}>Keywords</h2>
          <div className="text-slate-700 leading-relaxed text-sm font-serif italic mt-2">
            {data.keywords?.join(', ')}
          </div>
        </section>
    )
  };

  return (
    <div id="resume-content" style={{ padding: marginValue }} className="bg-white font-serif">
      <header className="text-center mb-12 border-b border-slate-200 pb-8">
        <EditableField as="h1" path="fullName" value={data.fullName} onChange={onDataChange} className="text-4xl font-normal leading-none text-slate-900 font-serif italic mb-2" />
        <EditableField as="p" path="title" value={data.title} onChange={onDataChange} className="text-slate-500 font-normal text-lg uppercase tracking-[0.2em] font-serif" />
        
        <div className="flex justify-center flex-wrap gap-x-6 text-xs mt-6 text-slate-400 font-serif italic">
          <EditableField path="contactInfo.location" value={data.contactInfo.location} onChange={onDataChange} />
          <EditableField path="contactInfo.phone" value={data.contactInfo.phone} onChange={onDataChange} />
          <EditableField path="contactInfo.email" value={data.contactInfo.email} onChange={onDataChange} className="text-slate-600 underline decoration-slate-200 underline-offset-4" />
          {data.contactInfo.linkedin && <EditableField path="contactInfo.linkedin" value={data.contactInfo.linkedin} onChange={onDataChange} />}
        </div>
      </header>
      
      <main>
        {sectionOrder.filter(k => sectionVisibility[k]).map(k => sections[k])}
      </main>
    </div>
  );
};

export default ElegantSerif;
