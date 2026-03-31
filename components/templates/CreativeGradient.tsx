
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

const CreativeGradient: React.FC<TemplateProps> = ({ data, sectionOrder, customization, sectionVisibility, onDataChange }) => {
  const marginValue = { compact: '0.2in', normal: '0.4in', spacious: '0.6in' }[customization.margin] || '0.4in';
  
  const sectionTitleStyle: React.CSSProperties = {
    fontSize: `12pt`,
    color: '#000',
    textTransform: 'uppercase',
    letterSpacing: '0.2em',
    marginBottom: '16px',
    marginTop: '24px',
    fontWeight: '900',
    textAlign: 'center',
    background: 'linear-gradient(to right, #f472b6, #fb923c)',
    WebkitBackgroundClip: 'text',
    WebkitTextFillColor: 'transparent',
  };

  const sections: Record<ResumeSectionKey, React.ReactNode> = {
    summary: (
      <section key="summary" className="mb-10 text-center max-w-2xl mx-auto">
        <h2 style={sectionTitleStyle}>The Narrative</h2>
        <EditableField as="p" path="summary" value={data.summary} onChange={onDataChange} className="text-slate-600 leading-relaxed text-sm font-medium italic" />
      </section>
    ),
    experience: (
      <section key="experience" className="mb-10">
        <h2 style={sectionTitleStyle}>Journey</h2>
        <EditableList items={data.experience || []} path="experience" onChange={onDataChange} newItem={{ id: '', role: 'Role', company: 'Company', location: 'Location', dates: 'Dates', description: ['Achievement'] }}>
          {(exp, i) => (
            <div key={exp.id} className="mb-12 last:mb-0 flex gap-12">
              <div className="w-32 flex-shrink-0 text-right">
                <EditableField path={`experience[${i}].dates`} value={exp.dates} onChange={onDataChange} className="font-black text-pink-500 text-[10px] uppercase tracking-widest" />
              </div>
              <div className="flex-1 border-l-4 border-orange-100 pl-12 relative">
                <div className="absolute -left-[10px] top-1 w-4 h-4 rounded-full bg-gradient-to-br from-pink-400 to-orange-400 border-4 border-white shadow-lg" />
                <EditableField path={`experience[${i}].role`} value={exp.role} onChange={onDataChange} className="font-black text-slate-900 text-2xl mb-1 tracking-tight" />
                <div className="flex gap-3 items-center mb-6">
                    <EditableField path={`experience[${i}].company`} value={exp.company} onChange={onDataChange} className="font-black text-slate-400 text-xs uppercase tracking-widest" />
                    <span className="text-slate-200">/</span>
                    <EditableField path={`experience[${i}].location`} value={exp.location} onChange={onDataChange} className="text-slate-400 text-xs font-bold" />
                </div>
                <EditableList items={exp.description} path={`experience[${i}].description`} onChange={onDataChange} newItem="New achievement" className="space-y-4">
                    {(desc, di) => (
                        <div className="text-slate-600 text-sm leading-relaxed flex gap-4">
                            <span className="text-pink-400 font-black">✦</span>
                            <EditableField as="div" path={`experience[${i}].description[${di}]`} value={desc} onChange={onDataChange} enableMarkdown />
                        </div>
                    )}
                </EditableList>
              </div>
            </div>
          )}
        </EditableList>
      </section>
    ),
    skills: (
      <section key="skills" className="mb-10">
        <h2 style={sectionTitleStyle}>Toolkit</h2>
        <div className="flex flex-wrap justify-center gap-3">
          {data.skills.flatMap(cat => cat.skills).map((s, si) => (
            <span key={si} className="px-5 py-2 bg-gradient-to-br from-pink-50 to-orange-50 text-pink-600 rounded-2xl text-[10px] font-black uppercase tracking-widest border border-pink-100 shadow-sm">
                {s.name}
            </span>
          ))}
        </div>
      </section>
    ),
    education: (
        <section key="education" className="mb-10">
          <h2 style={sectionTitleStyle}>Foundation</h2>
          <div className="grid grid-cols-2 gap-8">
            {data.education.map((edu, i) => (
              <div key={edu.id} className="text-center p-8 bg-gradient-to-br from-slate-50 to-white rounded-[3rem] border border-slate-100 shadow-sm">
                <EditableField path={`education[${i}].degree`} value={edu.degree} onChange={onDataChange} className="font-black text-slate-900 text-base mb-2" />
                <EditableField path={`education[${i}].institution`} value={edu.institution} onChange={onDataChange} className="text-orange-500 text-[10px] font-black uppercase tracking-widest block mb-1" />
                <EditableField path={`education[${i}].graduationDate`} value={edu.graduationDate} onChange={onDataChange} className="text-slate-300 text-[10px] font-bold block" />
              </div>
            ))}
          </div>
        </section>
    ),
    projects: (
        <section key="projects" className="mb-10">
          <h2 style={sectionTitleStyle}>Creations</h2>
          <div className="grid grid-cols-2 gap-8">
            {data.projects.map((proj, i) => (
              <div key={proj.id} className="p-8 border-2 border-slate-50 rounded-[3rem] hover:border-pink-100 transition-all group bg-white shadow-sm hover:shadow-xl">
                <EditableField path={`projects[${i}].name`} value={proj.name} onChange={onDataChange} className="font-black text-slate-900 text-sm uppercase tracking-widest mb-2" />
                <EditableField path={`projects[${i}].role`} value={proj.role} onChange={onDataChange} className="text-pink-500 text-[10px] font-black uppercase block mb-4" />
                <div className="text-slate-600 text-xs leading-relaxed">
                    {proj.description.join(' • ')}
                </div>
              </div>
            ))}
          </div>
        </section>
    ),
    certifications: <div key="certifications" />,
    awards: <div key="awards" />,
    keywords: (
        <section key="keywords" className="mb-10 text-center max-w-2xl mx-auto">
          <h2 style={sectionTitleStyle}>Keywords</h2>
          <div className="text-slate-600 leading-relaxed text-sm font-medium italic mt-2">
            {data.keywords?.join(', ')}
          </div>
        </section>
    )
  };

  return (
    <div id="resume-content" style={{ padding: marginValue }} className="bg-white font-sans selection:bg-pink-500 selection:text-white">
      <header className="mb-20 text-center relative">
        <div className="absolute top-0 left-1/2 -translate-x-1/2 w-64 h-64 bg-gradient-to-br from-pink-200 to-orange-200 rounded-full blur-[100px] opacity-30 -z-10" />
        <div className="inline-block px-16 py-12 bg-black rounded-[5rem] mb-10 shadow-2xl">
            <EditableField as="h1" path="fullName" value={data.fullName} onChange={onDataChange} className="text-7xl font-black leading-none tracking-tighter text-white" />
        </div>
        <EditableField as="p" path="title" value={data.title} onChange={onDataChange} className="text-slate-900 font-black text-2xl uppercase tracking-[0.5em] mb-10" />
        
        <div className="flex justify-center gap-10 text-[10px] font-black text-slate-400 uppercase tracking-widest">
            <EditableField path="contactInfo.email" value={data.contactInfo.email} onChange={onDataChange} className="hover:text-pink-500 transition-colors" />
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

export default CreativeGradient;
