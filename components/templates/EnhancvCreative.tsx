
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

const EnhancvCreative: React.FC<TemplateProps> = ({ data, sectionOrder, customization, sectionVisibility, onDataChange }) => {
  const marginValue = { compact: '0.2in', normal: '0.4in', spacious: '0.6in' }[customization.margin] || '0.4in';
  
  const sectionTitleStyle: React.CSSProperties = {
    fontSize: `12pt`,
    color: '#111827',
    textTransform: 'uppercase',
    letterSpacing: '0.1em',
    marginBottom: '16px',
    marginTop: '24px',
    fontWeight: '900',
    display: 'flex',
    alignItems: 'center',
    gap: '12px'
  };

  const sidebarSectionTitleStyle: React.CSSProperties = {
    fontSize: `10pt`,
    color: '#111827',
    textTransform: 'uppercase',
    letterSpacing: '0.1em',
    marginBottom: '12px',
    marginTop: '20px',
    fontWeight: '900',
  };

  const mainSections: Record<ResumeSectionKey, React.ReactNode> = {
    summary: (
      <section key="summary" className="mb-10">
        <h2 style={sectionTitleStyle}>
          <div className="w-8 h-1 bg-rose-500 rounded-full" />
          Profile
        </h2>
        <EditableField as="p" path="summary" value={data.summary} onChange={onDataChange} className="text-slate-600 leading-relaxed text-sm font-medium" />
      </section>
    ),
    experience: (
      <section key="experience" className="mb-10">
        <h2 style={sectionTitleStyle}>
          <div className="w-8 h-1 bg-rose-500 rounded-full" />
          Experience
        </h2>
        <EditableList items={data.experience || []} path="experience" onChange={onDataChange} newItem={{ id: '', role: 'Role', company: 'Company', location: 'Location', dates: 'Dates', description: ['Achievement'] }}>
          {(exp, i) => (
            <div key={exp.id} className="mb-8 last:mb-0">
              <div className="flex justify-between items-baseline mb-2">
                <EditableField path={`experience[${i}].role`} value={exp.role} onChange={onDataChange} className="font-black text-slate-900 text-lg tracking-tight" />
                <EditableField path={`experience[${i}].dates`} value={exp.dates} onChange={onDataChange} className="text-rose-500 text-[10px] font-black uppercase tracking-[0.2em]" />
              </div>
              <div className="mb-4 flex gap-3 items-center text-xs font-bold uppercase tracking-widest text-slate-400">
                <EditableField path={`experience[${i}].company`} value={exp.company} onChange={onDataChange} className="text-slate-900" />
                <span className="text-slate-200">|</span>
                <EditableField path={`experience[${i}].location`} value={exp.location} onChange={onDataChange} />
              </div>
              <EditableList items={exp.description} path={`experience[${i}].description`} onChange={onDataChange} newItem="New achievement" className="space-y-3">
                {(desc, di) => (
                    <div className="text-slate-600 text-sm leading-relaxed flex gap-4">
                        <div className="w-1.5 h-1.5 rounded-full bg-rose-500 mt-2 flex-shrink-0" />
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
        <section key="projects" className="mb-10">
          <h2 style={sectionTitleStyle}>
            <div className="w-8 h-1 bg-rose-500 rounded-full" />
            Projects
          </h2>
          <div className="grid grid-cols-1 gap-6">
            <EditableList items={data.projects || []} path="projects" onChange={onDataChange} newItem={{ id: '', name: 'Project', role: 'Role', description: ['Detail'] }}>
              {(proj, i) => (
                <div key={proj.id} className="p-5 bg-slate-50 rounded-2xl border border-slate-100">
                  <div className="flex justify-between items-baseline mb-2">
                      <EditableField path={`projects[${i}].name`} value={proj.name} onChange={onDataChange} className="font-black text-slate-900 text-sm uppercase tracking-widest" />
                      <EditableField path={`projects[${i}].role`} value={proj.role} onChange={onDataChange} className="text-rose-500 text-[10px] font-black" />
                  </div>
                  <div className="text-slate-600 text-xs leading-relaxed space-y-2">
                      {proj.description.map((desc, di) => (
                          <EditableField key={di} as="p" path={`projects[${i}].description[${di}]`} value={desc} onChange={onDataChange} />
                      ))}
                  </div>
                </div>
              )}
            </EditableList>
          </div>
        </section>
    ),
    education: <div key="education" />,
    skills: <div key="skills" />,
    certifications: <div key="certifications" />,
    awards: <div key="awards" />,
    keywords: (
        <section key="keywords" className="mb-10">
          <h2 style={sectionTitleStyle}>
            <div className="w-8 h-1 bg-rose-500 rounded-full" />
            Keywords
          </h2>
          <div className="flex flex-wrap gap-2">
            {data.keywords?.map((kw, i) => (
              <span key={i} className="px-3 py-1 bg-rose-50 text-rose-600 rounded-full text-[10px] font-black uppercase tracking-widest">
                {kw}
              </span>
            ))}
          </div>
        </section>
    )
  };

  const sidebarSections: Record<ResumeSectionKey, React.ReactNode> = {
    education: (
        <section key="education" className="mb-10">
          <h2 style={sidebarSectionTitleStyle}>Education</h2>
          <EditableList items={data.education || []} path="education" onChange={onDataChange} newItem={{ id: '', degree: 'Degree', institution: 'Institution', location: 'Location', graduationDate: 'Date' }}>
            {(edu, i) => (
              <div key={edu.id} className="mb-6 last:mb-0">
                <EditableField path={`education[${i}].degree`} value={edu.degree} onChange={onDataChange} className="font-black text-slate-900 text-sm leading-tight mb-1" />
                <EditableField path={`education[${i}].institution`} value={edu.institution} onChange={onDataChange} className="text-rose-500 text-[10px] font-black uppercase tracking-widest block" />
                <EditableField path={`education[${i}].graduationDate`} value={edu.graduationDate} onChange={onDataChange} className="text-slate-400 text-[9px] font-black tracking-[0.2em] mt-2 block" />
              </div>
            )}
          </EditableList>
        </section>
    ),
    skills: (
      <section key="skills" className="mb-10">
        <h2 style={sidebarSectionTitleStyle}>Skills</h2>
        <div className="space-y-8">
          {data.skills.map((cat, i) => (
            <div key={cat.id} className="flex flex-col">
              <EditableField path={`skills[${i}].name`} value={cat.name} onChange={onDataChange} className="font-black text-slate-900 text-[10px] uppercase tracking-[0.2em] mb-4" />
              <div className="flex flex-wrap gap-2">
                {cat.skills.map((s, si) => (
                    <span key={si} className="px-3 py-1.5 bg-slate-900 text-white rounded-lg text-[10px] font-black uppercase tracking-widest">
                        {s.name}
                    </span>
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
        <section key="certifications" className="mb-10">
          <h2 style={sidebarSectionTitleStyle}>Certifications</h2>
          <EditableList items={data.certifications || []} path="certifications" onChange={onDataChange} newItem={{ id: '', name: 'Cert', issuer: 'Issuer', date: 'Date' }}>
            {(cert, i) => (
              <div key={cert.id} className="mb-4 last:mb-0">
                <EditableField path={`certifications[${i}].name`} value={cert.name} onChange={onDataChange} className="font-black text-slate-900 text-xs leading-tight" />
                <div className="flex justify-between text-[9px] font-black uppercase tracking-widest text-slate-400 mt-2">
                    <EditableField path={`certifications[${i}].issuer`} value={cert.issuer} onChange={onDataChange} />
                    <EditableField path={`certifications[${i}].date`} value={cert.date} onChange={onDataChange} />
                </div>
              </div>
            )}
          </EditableList>
        </section>
    ),
    awards: (
        <section key="awards" className="mb-10">
          <h2 style={sidebarSectionTitleStyle}>Awards</h2>
          <EditableList items={data.awards || []} path="awards" onChange={onDataChange} newItem={{ id: '', name: 'Award', issuer: 'Issuer', date: 'Date' }}>
            {(award, i) => (
              <div key={award.id} className="mb-4 last:mb-0">
                <EditableField path={`awards[${i}].name`} value={award.name} onChange={onDataChange} className="font-black text-slate-900 text-xs leading-tight" />
                <div className="flex justify-between text-[9px] font-black uppercase tracking-widest text-slate-400 mt-2">
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
      {/* Main Content */}
      <main className="flex-1 p-12 bg-white">
        <header className="mb-16">
            <EditableField as="h1" path="fullName" value={data.fullName} onChange={onDataChange} className="text-6xl font-black leading-[0.9] tracking-tighter text-slate-900 mb-4" />
            <div className="flex items-center gap-4">
                <div className="h-1 w-12 bg-rose-500 rounded-full" />
                <EditableField as="p" path="title" value={data.title} onChange={onDataChange} className="text-slate-400 font-black text-xs uppercase tracking-[0.3em]" />
            </div>
        </header>

        {sectionOrder.filter(k => !['skills', 'education', 'certifications', 'awards'].includes(k) && sectionVisibility[k]).map(k => mainSections[k])}
      </main>

      {/* Sidebar */}
      <aside className="w-[320px] bg-white p-12 border-l border-slate-100 flex flex-col">
        <div className="space-y-6 mb-16">
            <div className="flex flex-col gap-2">
                <span className="text-[10px] font-black uppercase tracking-[0.2em] text-rose-500">Email</span>
                <EditableField path="contactInfo.email" value={data.contactInfo.email} onChange={onDataChange} className="text-xs font-bold text-slate-900 truncate" />
            </div>
            <div className="flex flex-col gap-2">
                <span className="text-[10px] font-black uppercase tracking-[0.2em] text-rose-500">Phone</span>
                <EditableField path="contactInfo.phone" value={data.contactInfo.phone} onChange={onDataChange} className="text-xs font-bold text-slate-900" />
            </div>
            <div className="flex flex-col gap-2">
                <span className="text-[10px] font-black uppercase tracking-[0.2em] text-rose-500">Location</span>
                <EditableField path="contactInfo.location" value={data.contactInfo.location} onChange={onDataChange} className="text-xs font-bold text-slate-900" />
            </div>
            {data.contactInfo.linkedin && (
                <div className="flex flex-col gap-2">
                    <span className="text-[10px] font-black uppercase tracking-[0.2em] text-rose-500">LinkedIn</span>
                    <EditableField path="contactInfo.linkedin" value={data.contactInfo.linkedin} onChange={onDataChange} className="text-xs font-bold text-slate-900 truncate" />
                </div>
            )}
        </div>

        <div className="flex-1">
            {['skills', 'education', 'certifications', 'awards'].map(k => sidebarSections[k as ResumeSectionKey])}
        </div>
      </aside>
    </div>
  );
};

export default EnhancvCreative;
