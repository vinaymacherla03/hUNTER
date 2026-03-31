
import React from 'react';
import { ResumeData, ResumeSectionKey, Customization, Experience, Education, Project, SkillCategory } from '../../types';
import EditableField from '../EditableField';
import { EditableList } from '../EditableList';

interface TemplateProps {
  data: ResumeData;
  sectionOrder: ResumeSectionKey[];
  customization: Customization;
  sectionVisibility: Record<ResumeSectionKey, boolean>;
  onDataChange: (path: string, value: any) => void;
}

const ClassicResume: React.FC<TemplateProps> = ({ data, sectionOrder, customization, sectionVisibility, onDataChange }) => {
  const marginValue = { compact: '0.4in', normal: '0.6in', spacious: '0.8in' }[customization.margin] || '0.6in';
  
  const sectionTitleStyle: React.CSSProperties = {
    fontSize: `${customization.sectionTitleSize}pt`,
    color: customization.sectionTitleColor,
    textTransform: customization.sectionTitleUppercase ? 'uppercase' : 'none',
    fontWeight: 'bold',
    borderBottom: `1px solid ${customization.sectionTitleBorderColor || '#000'}`,
    marginBottom: '8px',
    marginTop: '16px',
    paddingBottom: '2px',
  };

  const sections: Record<ResumeSectionKey, React.ReactNode> = {
    education: (
      <section key="education">
        <h2 style={sectionTitleStyle}>Education</h2>
        <EditableList items={data.education || []} path="education" onChange={onDataChange} newItem={{ id: '', degree: 'Degree', institution: 'Institution', location: 'Location', graduationDate: 'Date', relevantCoursework: [] }}>
          {(edu, i) => (
            <div key={edu.id || i} className="mb-4">
              <div className="flex justify-between items-baseline font-bold">
                <EditableField path={`education[${i}].institution`} value={edu.institution} onChange={onDataChange} style={{ fontSize: `${customization.itemTitleSize}pt` }} />
                <EditableField path={`education[${i}].location`} value={edu.location} onChange={onDataChange} />
              </div>
              <div className="flex justify-between items-baseline italic">
                <EditableField path={`education[${i}].degree`} value={edu.degree} onChange={onDataChange} />
                <EditableField path={`education[${i}].graduationDate`} value={edu.graduationDate} onChange={onDataChange} />
              </div>
              {edu.relevantCoursework && edu.relevantCoursework.length > 0 && (
                <div className="text-sm mt-1">
                  <span className="font-semibold">Relevant Coursework: </span>
                  <EditableField path={`education[${i}].relevantCoursework`} value={edu.relevantCoursework.join(', ')} onChange={(p, v) => onDataChange(p, v.split(',').map(s => s.trim()))} />
                </div>
              )}
            </div>
          )}
        </EditableList>
      </section>
    ),
    experience: (
      <section key="experience">
        <h2 style={sectionTitleStyle}>Experience</h2>
        <EditableList items={data.experience || []} path="experience" onChange={onDataChange} newItem={{ id: '', role: 'Job Title', company: 'Company Name', location: 'Location', dates: 'Dates', description: ['Achievement'] }}>
          {(exp, i) => (
            <div key={exp.id || i} className="mb-4">
              <div className="flex justify-between items-baseline font-bold">
                <EditableField path={`experience[${i}].role`} value={exp.role} onChange={onDataChange} style={{ fontSize: `${customization.itemTitleSize}pt` }} className="uppercase" />
                <EditableField path={`experience[${i}].location`} value={exp.location} onChange={onDataChange} />
              </div>
              <div className="flex justify-between items-baseline italic mb-1">
                <EditableField path={`experience[${i}].company`} value={exp.company} onChange={onDataChange} />
                <EditableField path={`experience[${i}].dates`} value={exp.dates} onChange={onDataChange} />
              </div>
              <EditableList items={exp.description} path={`experience[${i}].description`} onChange={onDataChange} newItem="New achievement" className="list-disc pl-5 space-y-0.5">
                {(desc, di) => <EditableField as="div" path={`experience[${i}].description[${di}]`} value={desc} onChange={onDataChange} className="text-sm" enableMarkdown />}
              </EditableList>
            </div>
          )}
        </EditableList>
      </section>
    ),
    projects: (
      <section key="projects">
        <h2 style={sectionTitleStyle}>University Projects</h2>
        <EditableList items={data.projects || []} path="projects" onChange={onDataChange} newItem={{ id: '', name: 'Project Title', role: 'Your Role', description: ['Detail'], startDate: 'Date' }}>
          {(proj, i) => (
            <div key={proj.id || i} className="mb-4">
              <div className="flex justify-between items-baseline font-bold">
                <EditableField path={`projects[${i}].name`} value={proj.name} onChange={onDataChange} style={{ fontSize: `${customization.itemTitleSize}pt` }} className="uppercase" />
                <EditableField path={`projects[${i}].startDate`} value={proj.startDate || ''} onChange={onDataChange} />
              </div>
              <EditableList items={proj.description} path={`projects[${i}].description`} onChange={onDataChange} newItem="Project detail" className="list-disc pl-5 mt-1 space-y-0.5">
                {(desc, di) => (
                  <div className="text-sm">
                    <EditableField path={`projects[${i}].description[${di}]`} value={desc} onChange={onDataChange} />
                  </div>
                )}
              </EditableList>
            </div>
          )}
        </EditableList>
      </section>
    ),
    awards: (
      <section key="awards">
        <h2 style={sectionTitleStyle}>Activities</h2>
        <EditableList items={data.awards || []} path="awards" onChange={onDataChange} newItem={{ id: '', name: 'Activity Name', issuer: 'Role/Org', date: 'Date' }}>
          {(award, i) => (
            <div key={award.id || i} className="mb-3">
              <div className="flex justify-between items-baseline">
                <div className="font-bold">
                  <EditableField path={`awards[${i}].name`} value={award.name} onChange={onDataChange} style={{ fontSize: `${customization.itemTitleSize}pt` }} className="uppercase" />
                </div>
                <EditableField path={`awards[${i}].date`} value={award.date} onChange={onDataChange} className="text-sm" />
              </div>
              <div className="text-sm italic text-slate-600">
                <EditableField path={`awards[${i}].issuer`} value={award.issuer} onChange={onDataChange} />
              </div>
            </div>
          )}
        </EditableList>
      </section>
    ),
    skills: (
      <section key="skills">
        <h2 style={sectionTitleStyle}>Additional</h2>
        <div className="space-y-1 text-sm">
          {data.skills.map((cat, i) => (
            <div key={cat.id || i} className="flex gap-2">
              <span className="font-bold min-w-[120px]">
                <EditableField path={`skills[${i}].name`} value={cat.name} onChange={onDataChange} />:
              </span>
              <EditableField 
                path={`skills[${i}].skills`} 
                value={cat.skills.map(s => s.name).join(', ')} 
                onChange={(p, v) => onDataChange(p, v.split(',').map(s => ({ name: s.trim(), proficiency: 'Intermediate' })))} 
                className="flex-1"
              />
            </div>
          ))}
        </div>
      </section>
    ),
    summary: <div key="summary" />, // Classic template doesn't explicitly use a summary block in the provided text
    certifications: <div key="certifications" />,
    keywords: (
      <section key="keywords">
        <h2 style={sectionTitleStyle}>Keywords</h2>
        <div className="text-sm italic text-slate-600 mt-2">
          {data.keywords?.join(' • ')}
        </div>
      </section>
    ),
  };

  return (
    <div id="resume-content" style={{ padding: marginValue }} className="text-slate-900 leading-relaxed font-serif">
      <header className="text-center mb-8">
        <EditableField as="h1" path="fullName" value={data.fullName} onChange={onDataChange} style={{ fontSize: `${customization.nameSize}pt` }} className="font-bold" />
        <div className="flex justify-center flex-wrap gap-x-2 text-sm mt-2 text-slate-700">
          <EditableField path="contactInfo.location" value={data.contactInfo.location} onChange={onDataChange} />
          <span>•</span>
          <EditableField path="contactInfo.phone" value={data.contactInfo.phone} onChange={onDataChange} />
          <span>•</span>
          <EditableField path="contactInfo.email" value={data.contactInfo.email} onChange={onDataChange} />
        </div>
      </header>
      <main>
        {sectionOrder.filter(k => sectionVisibility[k]).map(k => sections[k])}
      </main>
    </div>
  );
};

export default ClassicResume;
