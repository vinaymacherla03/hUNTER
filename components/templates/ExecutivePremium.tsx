
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

const ExecutivePremium: React.FC<TemplateProps> = ({ data, sectionOrder, customization, sectionVisibility, onDataChange }) => {
  const marginValue = { compact: '0.4in', normal: '0.7in', spacious: '1in' }[customization.margin] || '0.7in';
  
  const sectionTitleStyle: React.CSSProperties = {
    fontSize: `13pt`,
    color: '#1e293b',
    textTransform: 'uppercase',
    letterSpacing: '0.25em',
    marginBottom: '16px',
    marginTop: '32px',
    fontWeight: '300',
    borderBottom: '1px solid #e2e8f0',
    paddingBottom: '8px',
    textAlign: 'center',
  };

  const sections: Record<ResumeSectionKey, React.ReactNode> = {
    summary: (
      <section key="summary" className="mb-12 max-w-3xl mx-auto text-center">
        <h2 style={sectionTitleStyle}>Executive Profile</h2>
        <EditableField as="p" path="summary" value={data.summary} onChange={onDataChange} className="text-slate-600 leading-relaxed text-sm font-light italic" />
      </section>
    ),
    experience: (
      <section key="experience" className="mb-12">
        <h2 style={sectionTitleStyle}>Professional Trajectory</h2>
        <EditableList items={data.experience || []} path="experience" onChange={onDataChange} newItem={{ id: '', role: 'Role', company: 'Company', location: 'Location', dates: 'Dates', description: ['Achievement'] }}>
          {(exp, i) => (
            <div key={exp.id} className="mb-10 last:mb-0" style={{ pageBreakInside: 'avoid' }}>
              <div className="flex justify-between items-baseline mb-2">
                <EditableField path={`experience[${i}].role`} value={exp.role} onChange={onDataChange} className="font-light text-slate-900 text-2xl tracking-tight italic" />
                <EditableField path={`experience[${i}].dates`} value={exp.dates} onChange={onDataChange} className="text-slate-400 text-[10px] uppercase tracking-widest font-bold" />
              </div>
              <div className="flex justify-between items-baseline mb-6 border-l-2 border-slate-900 pl-4">
                <EditableField path={`experience[${i}].company`} value={exp.company} onChange={onDataChange} className="font-black text-slate-900 text-xs uppercase tracking-[0.2em]" />
                <EditableField path={`experience[${i}].location`} value={exp.location} onChange={onDataChange} className="text-slate-300 text-[10px] font-black uppercase tracking-widest" />
              </div>
              <EditableList items={exp.description} path={`experience[${i}].description`} onChange={onDataChange} newItem="New achievement" className="space-y-4">
                {(desc, di) => (
                    <div className="text-slate-600 text-sm leading-relaxed flex gap-6">
                        <span className="text-slate-200 font-light text-2xl leading-none">/</span>
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
      <section key="skills" className="mb-12">
        <h2 style={sectionTitleStyle}>Strategic Expertise</h2>
        <div className="grid grid-cols-3 gap-12 mt-8">
          {data.skills?.map((cat, i) => (
            <div key={cat.id} className="flex flex-col text-center">
              <EditableField path={`skills[${i}].name`} value={cat.name} onChange={onDataChange} className="font-black text-slate-900 text-[10px] uppercase tracking-[0.3em] mb-4" />
              <div className="text-slate-500 text-[10px] font-bold leading-loose uppercase tracking-widest space-y-1">
                {cat.skills?.map((s, si) => (
                    <div key={si} className="hover:text-slate-900 transition-colors">
                        {s.name}
                    </div>
                ))}
              </div>
            </div>
          ))}
        </div>
      </section>
    ),
    education: (
        <section key="education" className="mb-12">
          <h2 style={sectionTitleStyle}>Academic Foundation</h2>
          <div className="grid grid-cols-2 gap-16 mt-8">
            {data.education?.map((edu, i) => (
              <div key={edu.id} className="text-center">
                <EditableField path={`education[${i}].degree`} value={edu.degree} onChange={onDataChange} className="font-light text-slate-900 text-lg italic mb-2" />
                <EditableField path={`education[${i}].institution`} value={edu.institution} onChange={onDataChange} className="text-slate-400 text-[10px] font-black uppercase tracking-[0.2em] block mb-1" />
                <EditableField path={`education[${i}].graduationDate`} value={edu.graduationDate} onChange={onDataChange} className="text-slate-200 text-[9px] font-black tracking-widest block" />
              </div>
            ))}
          </div>
        </section>
    ),
    projects: data.projects?.length ? (
        <section key="projects" className="mb-12" style={{ pageBreakInside: 'avoid' }}>
          <h2 style={sectionTitleStyle}>Notable Initiatives</h2>
          <div className="grid grid-cols-2 gap-12 mt-8">
            {data.projects?.map((proj, i) => (
              <div key={proj.id} className="text-center p-10 border border-slate-100 rounded-[4rem] hover:bg-slate-50 transition-colors">
                <EditableField path={`projects[${i}].name`} value={proj.name} onChange={onDataChange} className="font-black text-slate-900 text-xs uppercase tracking-[0.3em] mb-3" />
                <EditableField path={`projects[${i}].role`} value={proj.role} onChange={onDataChange} className="text-slate-400 text-[10px] font-black uppercase block mb-4" />
                <div className="text-slate-600 text-xs leading-relaxed font-light italic">
                    {proj.description?.join(' • ')}
                </div>
              </div>
            ))}
          </div>
        </section>
    ) : null,
    certifications: data.certifications?.length ? (
        <section key="certifications" className="mb-12" style={{ pageBreakInside: 'avoid' }}>
          <h2 style={sectionTitleStyle}>Certifications</h2>
          <div className="grid grid-cols-2 gap-12 mt-8">
            {data.certifications?.map((cert, i) => (
              <div key={cert.id} className="text-center">
                <span className="font-bold text-slate-900 text-sm uppercase tracking-widest">{cert.name}</span>
                {cert.issuer && <div className="text-slate-400 text-[10px] font-black uppercase tracking-widest mt-1">{cert.issuer}</div>}
                {cert.date && <div className="text-slate-200 text-[9px] font-black tracking-widest mt-1">{cert.date}</div>}
              </div>
            ))}
          </div>
        </section>
    ) : null,
    awards: data.awards?.length ? (
        <section key="awards" className="mb-12" style={{ pageBreakInside: 'avoid' }}>
          <h2 style={sectionTitleStyle}>Awards</h2>
          <div className="grid grid-cols-2 gap-12 mt-8">
            {data.awards?.map((award, i) => (
              <div key={award.id} className="text-center">
                <span className="font-bold text-slate-900 text-sm uppercase tracking-widest">{award.name}</span>
                {award.issuer && <div className="text-slate-400 text-[10px] font-black uppercase tracking-widest mt-1">{award.issuer}</div>}
                {award.date && <div className="text-slate-200 text-[9px] font-black tracking-widest mt-1">{award.date}</div>}
              </div>
            ))}
          </div>
        </section>
    ) : null,
    keywords: data.keywords?.length ? (
        <section key="keywords" className="mb-12 max-w-3xl mx-auto text-center">
          <h2 style={sectionTitleStyle}>Strategic Keywords</h2>
          <div className="text-slate-600 leading-relaxed text-sm font-light italic mt-4">
            {data.keywords?.join(' • ')}
          </div>
        </section>
    ) : null
  };

  return (
    <div id="resume-content" className="bg-white font-sans selection:bg-slate-900 selection:text-white">
      <header className="mb-24 text-center">
        <EditableField as="h1" path="fullName" value={data.fullName} onChange={onDataChange} className="text-7xl font-light leading-none tracking-tighter text-slate-900 mb-6 italic" />
        <EditableField as="p" path="title" value={data.title} onChange={onDataChange} className="text-slate-400 font-black text-xs uppercase tracking-[0.6em] mb-12" />
        
        <div className="flex justify-center gap-12 text-[9px] font-black text-slate-300 uppercase tracking-[0.3em] border-y border-slate-50 py-6">
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

export default ExecutivePremium;
