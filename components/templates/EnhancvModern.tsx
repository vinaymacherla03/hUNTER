
import React from 'react';
import { ResumeData, ResumeSectionKey, Customization, SkillProficiency } from '../../types';
import EditableField from '../EditableField';
import { EditableList } from '../EditableList';

interface TemplateProps {
  data: ResumeData;
  sectionOrder: ResumeSectionKey[];
  customization: Customization;
  sectionVisibility: Record<ResumeSectionKey, boolean>;
  onDataChange: (path: string, value: any) => void;
}

const proficiencyMap: Record<SkillProficiency, string> = {
  'Beginner': '25%',
  'Intermediate': '50%',
  'Advanced': '75%',
  'Expert': '100%'
};

const EnhancvModern: React.FC<TemplateProps> = ({ data, sectionOrder, customization, sectionVisibility, onDataChange }) => {
  const marginValue = { compact: '0.2in', normal: '0.4in', spacious: '0.6in' }[customization.margin] || '0.4in';
  
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
    gap: '8px'
  };

  const sidebarSectionTitleStyle: React.CSSProperties = {
    fontSize: `10pt`,
    color: '#111827',
    textTransform: 'uppercase',
    letterSpacing: '0.05em',
    marginBottom: '12px',
    marginTop: '20px',
    fontWeight: '800',
  };

  const mainSections: Record<ResumeSectionKey, React.ReactNode> = {
    summary: (
      <section key="summary" className="mb-8">
        <h2 style={sectionTitleStyle}>
          <span className="w-2 h-2 rounded-full bg-blue-600" />
          Summary
        </h2>
        <EditableField as="p" path="summary" value={data.summary} onChange={onDataChange} className="text-slate-600 leading-relaxed text-sm" />
      </section>
    ),
    experience: (
      <section key="experience" className="mb-8">
        <h2 style={sectionTitleStyle}>
          <span className="w-2 h-2 rounded-full bg-blue-600" />
          Experience
        </h2>
        <EditableList items={data.experience || []} path="experience" onChange={onDataChange} newItem={{ id: '', role: 'Role', company: 'Company', location: 'Location', dates: 'Dates', description: ['Achievement'] }}>
          {(exp, i) => (
            <div key={exp.id} className="mb-6 last:mb-0 relative pl-4 border-l border-slate-200">
              <div className="absolute -left-[4.5px] top-1.5 w-2 h-2 rounded-full bg-blue-600" />
              <div className="flex justify-between items-baseline mb-1">
                <EditableField path={`experience[${i}].role`} value={exp.role} onChange={onDataChange} className="font-bold text-slate-900 text-base" />
                <EditableField path={`experience[${i}].dates`} value={exp.dates} onChange={onDataChange} className="text-slate-500 text-xs font-semibold" />
              </div>
              <div className="mb-2 flex gap-2 items-center text-sm">
                <EditableField path={`experience[${i}].company`} value={exp.company} onChange={onDataChange} className="font-bold text-blue-600" />
                <span className="text-slate-300">•</span>
                <EditableField path={`experience[${i}].location`} value={exp.location} onChange={onDataChange} className="text-slate-500" />
              </div>
              <EditableList items={exp.description} path={`experience[${i}].description`} onChange={onDataChange} newItem="New achievement" className="space-y-1.5">
                {(desc, di) => (
                    <div className="text-slate-600 text-sm leading-relaxed flex gap-2">
                        <span className="text-blue-600 font-bold">•</span>
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
            <span className="w-2 h-2 rounded-full bg-blue-600" />
            Projects
          </h2>
          <EditableList items={data.projects || []} path="projects" onChange={onDataChange} newItem={{ id: '', name: 'Project', role: 'Role', description: ['Detail'] }}>
            {(proj, i) => (
              <div key={proj.id} className="mb-4 last:mb-0">
                <div className="flex justify-between items-baseline mb-1">
                    <EditableField path={`projects[${i}].name`} value={proj.name} onChange={onDataChange} className="font-bold text-slate-900 text-sm" />
                    <EditableField path={`projects[${i}].role`} value={proj.role} onChange={onDataChange} className="text-blue-600 text-xs font-semibold" />
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
    education: <div key="education" />,
    skills: <div key="skills" />,
    certifications: <div key="certifications" />,
    awards: <div key="awards" />,
    keywords: (
        <section key="keywords" className="mb-8">
          <h2 style={sectionTitleStyle}>
            <span className="w-2 h-2 rounded-full bg-blue-600" />
            Keywords
          </h2>
          <div className="flex flex-wrap gap-2 mt-2">
            {data.keywords?.map((kw, i) => (
              <span key={i} className="px-2 py-1 bg-slate-100 text-slate-600 rounded text-xs font-semibold">
                {kw}
              </span>
            ))}
          </div>
        </section>
    )
  };

  const sidebarSections: Record<ResumeSectionKey, React.ReactNode> = {
    education: (
        <section key="education" className="mb-8">
          <h2 style={sidebarSectionTitleStyle}>Education</h2>
          <EditableList items={data.education || []} path="education" onChange={onDataChange} newItem={{ id: '', degree: 'Degree', institution: 'Institution', location: 'Location', graduationDate: 'Date' }}>
            {(edu, i) => (
              <div key={edu.id} className="mb-4 last:mb-0">
                <EditableField path={`education[${i}].degree`} value={edu.degree} onChange={onDataChange} className="font-bold text-slate-900 text-sm leading-tight mb-1" />
                <EditableField path={`education[${i}].institution`} value={edu.institution} onChange={onDataChange} className="text-blue-600 text-xs font-bold block" />
                <EditableField path={`education[${i}].graduationDate`} value={edu.graduationDate} onChange={onDataChange} className="text-slate-400 text-[10px] font-semibold mt-1 block" />
              </div>
            )}
          </EditableList>
        </section>
    ),
    skills: (
      <section key="skills" className="mb-8">
        <h2 style={sidebarSectionTitleStyle}>Skills</h2>
        <div className="space-y-4">
          {data.skills.map((cat, i) => (
            <div key={cat.id} className="flex flex-col">
              <EditableField path={`skills[${i}].name`} value={cat.name} onChange={onDataChange} className="font-bold text-slate-900 text-xs mb-2" />
              <div className="space-y-2">
                {cat.skills.map((s, si) => (
                    <div key={si} className="flex flex-col gap-1">
                        <div className="flex justify-between text-[10px] font-semibold text-slate-600">
                            <EditableField path={`skills[${i}].skills[${si}].name`} value={s.name} onChange={onDataChange} />
                            <span>{s.proficiency}</span>
                        </div>
                        <div className="h-1.5 w-full bg-slate-100 rounded-full overflow-hidden">
                            <div 
                                className="h-full bg-blue-600 rounded-full transition-all duration-500" 
                                style={{ width: proficiencyMap[s.proficiency] || '50%' }}
                            />
                        </div>
                    </div>
                ))}
              </div>
            </div>
          ))}
        </div>
      </section>
    ),
    summary: <div key="summary" />,
    experience: <div key="experience" />,
    projects: <div key="projects" />,
    certifications: (
        <section key="certifications" className="mb-8">
          <h2 style={sidebarSectionTitleStyle}>Certifications</h2>
          <EditableList items={data.certifications || []} path="certifications" onChange={onDataChange} newItem={{ id: '', name: 'Cert', issuer: 'Issuer', date: 'Date' }}>
            {(cert, i) => (
              <div key={cert.id} className="mb-3 last:mb-0">
                <EditableField path={`certifications[${i}].name`} value={cert.name} onChange={onDataChange} className="font-bold text-slate-900 text-xs leading-tight" />
                <div className="flex justify-between text-[10px] text-slate-500 mt-0.5">
                    <EditableField path={`certifications[${i}].issuer`} value={cert.issuer} onChange={onDataChange} />
                    <EditableField path={`certifications[${i}].date`} value={cert.date} onChange={onDataChange} />
                </div>
              </div>
            )}
          </EditableList>
        </section>
    ),
    awards: (
        <section key="awards" className="mb-8">
          <h2 style={sidebarSectionTitleStyle}>Awards</h2>
          <EditableList items={data.awards || []} path="awards" onChange={onDataChange} newItem={{ id: '', name: 'Award', issuer: 'Issuer', date: 'Date' }}>
            {(award, i) => (
              <div key={award.id} className="mb-3 last:mb-0">
                <EditableField path={`awards[${i}].name`} value={award.name} onChange={onDataChange} className="font-bold text-slate-900 text-xs leading-tight" />
                <div className="flex justify-between text-[10px] text-slate-500 mt-0.5">
                    <EditableField path={`awards[${i}].issuer`} value={award.issuer} onChange={onDataChange} />
                    <EditableField path={`awards[${i}].date`} value={award.date} onChange={onDataChange} />
                </div>
              </div>
            )}
          </EditableList>
        </section>
    ),
    keywords: <div key="keywords" />
  };

  return (
    <div id="resume-content" className="bg-white font-sans flex min-h-[11in] w-full overflow-hidden">
      {/* Sidebar */}
      <aside className="w-[280px] bg-slate-50 p-8 border-r border-slate-200 flex flex-col">
        <header className="mb-10">
            <EditableField as="h1" path="fullName" value={data.fullName} onChange={onDataChange} className="text-3xl font-black leading-tight tracking-tight text-slate-900 mb-2" />
            <EditableField as="p" path="title" value={data.title} onChange={onDataChange} className="text-blue-600 font-bold text-xs uppercase tracking-wider" />
        </header>

        <div className="space-y-4 mb-10">
            <div className="flex flex-col gap-1">
                <span className="text-[9px] font-bold uppercase tracking-widest text-slate-400">Email</span>
                <EditableField path="contactInfo.email" value={data.contactInfo.email} onChange={onDataChange} className="text-xs font-semibold text-slate-700 truncate" />
            </div>
            <div className="flex flex-col gap-1">
                <span className="text-[9px] font-bold uppercase tracking-widest text-slate-400">Phone</span>
                <EditableField path="contactInfo.phone" value={data.contactInfo.phone} onChange={onDataChange} className="text-xs font-semibold text-slate-700" />
            </div>
            <div className="flex flex-col gap-1">
                <span className="text-[9px] font-bold uppercase tracking-widest text-slate-400">Location</span>
                <EditableField path="contactInfo.location" value={data.contactInfo.location} onChange={onDataChange} className="text-xs font-semibold text-slate-700" />
            </div>
        </div>

        <div className="flex-1">
            {['skills', 'education', 'certifications', 'awards'].map(k => sidebarSections[k as ResumeSectionKey])}
        </div>
      </aside>

      {/* Main Content */}
      <main className="flex-1 p-10 bg-white">
        {sectionOrder.filter(k => !['skills', 'education', 'certifications', 'awards'].includes(k) && sectionVisibility[k]).map(k => mainSections[k])}
      </main>
    </div>
  );
};

export default EnhancvModern;
