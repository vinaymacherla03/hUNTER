
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

const SidebarModern: React.FC<TemplateProps> = ({ data, sectionOrder, customization, sectionVisibility, onDataChange }) => {
  const marginValue = { compact: '0.2in', normal: '0.4in', spacious: '0.6in' }[customization.margin] || '0.4in';
  
  const sectionTitleStyle: React.CSSProperties = {
    fontSize: `11pt`,
    color: '#1e293b',
    textTransform: 'uppercase',
    letterSpacing: '0.1em',
    marginBottom: '12px',
    marginTop: '20px',
    fontWeight: '900',
    borderBottom: '2px solid #e2e8f0',
    paddingBottom: '4px',
  };

  const sidebarSectionTitleStyle: React.CSSProperties = {
    fontSize: `10pt`,
    color: '#fff',
    textTransform: 'uppercase',
    letterSpacing: '0.15em',
    marginBottom: '12px',
    marginTop: '24px',
    fontWeight: '900',
    opacity: 0.6,
  };

  const mainSections: Record<ResumeSectionKey, React.ReactNode> = {
    summary: (
      <section key="summary" className="mb-8">
        <h2 style={sectionTitleStyle}>Profile</h2>
        <EditableField as="p" path="summary" value={data.summary} onChange={onDataChange} className="text-slate-600 leading-relaxed text-sm font-medium" />
      </section>
    ),
    experience: (
      <section key="experience" className="mb-8">
        <h2 style={sectionTitleStyle}>Experience</h2>
        <EditableList items={data.experience || []} path="experience" onChange={onDataChange} newItem={{ id: '', role: 'Role', company: 'Company', location: 'Location', dates: 'Dates', description: ['Achievement'] }}>
          {(exp, i) => (
            <div key={exp.id} className="mb-6 last:mb-0" style={{ pageBreakInside: 'avoid' }}>
              <div className="flex justify-between items-baseline mb-1">
                <EditableField path={`experience[${i}].role`} value={exp.role} onChange={onDataChange} className="font-black text-slate-900 text-base" />
                <EditableField path={`experience[${i}].dates`} value={exp.dates} onChange={onDataChange} className="font-bold text-slate-400 text-[10px] uppercase tracking-widest" />
              </div>
              <div className="mb-3 flex gap-2 items-center">
                <EditableField path={`experience[${i}].company`} value={exp.company} onChange={onDataChange} className="font-black text-blue-600 text-xs uppercase tracking-widest" />
                <span className="text-slate-200">|</span>
                <EditableField path={`experience[${i}].location`} value={exp.location} onChange={onDataChange} className="text-slate-400 text-xs font-bold" />
              </div>
              <EditableList items={exp.description} path={`experience[${i}].description`} onChange={onDataChange} newItem="New achievement" className="space-y-2">
                {(desc, di) => (
                    <div className="text-slate-600 text-sm leading-relaxed flex gap-3">
                        <div className="w-1.5 h-1.5 rounded-full bg-blue-600 mt-2 flex-shrink-0" />
                        <EditableField as="div" path={`experience[${i}].description[${di}]`} value={desc} onChange={onDataChange} enableMarkdown />
                    </div>
                )}
              </EditableList>
            </div>
          )}
        </EditableList>
      </section>
    ),
    projects: data.projects?.length ? (
        <section key="projects" className="mb-8" style={{ pageBreakInside: 'avoid' }}>
          <h2 style={sectionTitleStyle}>Projects</h2>
          <EditableList items={data.projects || []} path="projects" onChange={onDataChange} newItem={{ id: '', name: 'Project', role: 'Role', description: ['Detail'] }}>
            {(proj, i) => (
              <div key={proj.id} className="mb-4 last:mb-0">
                <div className="flex justify-between items-baseline mb-1">
                    <EditableField path={`projects[${i}].name`} value={proj.name} onChange={onDataChange} className="font-black text-slate-900 text-sm uppercase tracking-widest" />
                    <EditableField path={`projects[${i}].role`} value={proj.role} onChange={onDataChange} className="text-blue-500 text-[10px] font-black" />
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
    education: <div key="education" />,
    skills: <div key="skills" />,
    certifications: data.certifications?.length ? (
        <section key="certifications" className="mb-8" style={{ pageBreakInside: 'avoid' }}>
          <h2 style={sectionTitleStyle}>Certifications</h2>
          <div className="space-y-4">
            {data.certifications?.map((cert, i) => (
              <div key={cert.id} className="flex flex-col">
                <span className="font-black text-slate-900 text-sm uppercase tracking-widest">{cert.name}</span>
                <div className="flex justify-between items-center mt-1">
                    <span className="text-blue-600 text-[10px] font-black uppercase tracking-widest">{cert.issuer}</span>
                    <span className="text-slate-400 text-[10px] font-bold">{cert.date}</span>
                </div>
              </div>
            ))}
          </div>
        </section>
    ) : null,
    awards: data.awards?.length ? (
        <section key="awards" className="mb-8" style={{ pageBreakInside: 'avoid' }}>
          <h2 style={sectionTitleStyle}>Awards</h2>
          <div className="space-y-4">
            {data.awards?.map((award, i) => (
              <div key={award.id} className="flex flex-col">
                <span className="font-black text-slate-900 text-sm uppercase tracking-widest">{award.name}</span>
                <div className="flex justify-between items-center mt-1">
                    <span className="text-blue-600 text-[10px] font-black uppercase tracking-widest">{award.issuer}</span>
                    <span className="text-slate-400 text-[10px] font-bold">{award.date}</span>
                </div>
              </div>
            ))}
          </div>
        </section>
    ) : null,
    keywords: data.keywords?.length ? (
        <section key="keywords" className="mb-8" style={{ pageBreakInside: 'avoid' }}>
          <h2 style={sectionTitleStyle}>Keywords</h2>
          <div className="text-slate-600 leading-relaxed text-sm font-medium mt-2">
            {data.keywords?.join(', ')}
          </div>
        </section>
    ) : null
  };

  const sidebarSections: Record<ResumeSectionKey, React.ReactNode> = {
    education: (
        <section key="education" className="mb-8">
          <h2 style={sidebarSectionTitleStyle}>Education</h2>
          <EditableList items={data.education || []} path="education" onChange={onDataChange} newItem={{ id: '', degree: 'Degree', institution: 'Institution', location: 'Location', graduationDate: 'Date' }}>
            {(edu, i) => (
              <div key={edu.id} className="mb-4 last:mb-0">
                <EditableField path={`education[${i}].degree`} value={edu.degree} onChange={onDataChange} className="font-black text-white text-sm leading-tight mb-1" />
                <EditableField path={`education[${i}].institution`} value={edu.institution} onChange={onDataChange} className="text-white/60 text-xs font-bold uppercase tracking-widest block" />
                <EditableField path={`education[${i}].graduationDate`} value={edu.graduationDate} onChange={onDataChange} className="text-white/40 text-[10px] font-black tracking-widest mt-1 block" />
              </div>
            )}
          </EditableList>
        </section>
    ),
    skills: (
      <section key="skills" className="mb-8">
        <h2 style={sidebarSectionTitleStyle}>Skills</h2>
        <div className="space-y-6">
          {data.skills?.map((cat, i) => (
            <div key={cat.id} className="flex flex-col">
              <EditableField path={`skills[${i}].name`} value={cat.name} onChange={onDataChange} className="font-black text-white text-[10px] uppercase tracking-[0.2em] mb-3" />
              <div className="flex flex-wrap gap-2">
                {cat.skills?.map((s, si) => (
                    <span key={si} className="px-2 py-1 bg-white/10 rounded text-[10px] font-bold text-white/80 uppercase tracking-widest whitespace-nowrap">
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
    certifications: <div key="certifications" />,
    awards: <div key="awards" />,
    keywords: (
        <section key="keywords" className="mb-8">
          <h2 style={sidebarSectionTitleStyle}>Keywords</h2>
          <div className="text-white/60 text-xs font-bold leading-relaxed mt-2">
            {data.keywords?.join(', ')}
          </div>
        </section>
    )
  };

  return (
    <div id="resume-content" className="bg-white font-sans flex min-h-[11in] w-full overflow-hidden">
      {/* Sidebar */}
      <aside className="w-1/3 bg-[#0f172a] p-8 text-white flex flex-col">
        <header className="mb-12">
            <EditableField as="h1" path="fullName" value={data.fullName} onChange={onDataChange} className="text-4xl font-black leading-tight tracking-tighter text-white mb-2" />
            <EditableField as="p" path="title" value={data.title} onChange={onDataChange} className="text-blue-400 font-black text-[10px] uppercase tracking-[0.3em]" />
        </header>

        <div className="space-y-4 mb-12">
            <div className="flex flex-col gap-1">
                <span className="text-[9px] font-black uppercase tracking-widest text-white/40">Email</span>
                <EditableField path="contactInfo.email" value={data.contactInfo?.email} onChange={onDataChange} className="text-xs font-bold text-white/90 truncate" />
            </div>
            <div className="flex flex-col gap-1">
                <span className="text-[9px] font-black uppercase tracking-widest text-white/40">Phone</span>
                <EditableField path="contactInfo.phone" value={data.contactInfo?.phone} onChange={onDataChange} className="text-xs font-bold text-white/90" />
            </div>
            <div className="flex flex-col gap-1">
                <span className="text-[9px] font-black uppercase tracking-widest text-white/40">Location</span>
                <EditableField path="contactInfo.location" value={data.contactInfo?.location} onChange={onDataChange} className="text-xs font-bold text-white/90" />
            </div>
        </div>

        <div className="flex-1">
            {['skills', 'education'].map(k => sidebarSections[k as ResumeSectionKey])}
        </div>
      </aside>

      {/* Main Content */}
      <main className="flex-1 p-12 bg-white">
        {sectionOrder.filter(k => !['skills', 'education'].includes(k) && sectionVisibility[k]).map(k => mainSections[k])}
      </main>
    </div>
  );
};

export default SidebarModern;
