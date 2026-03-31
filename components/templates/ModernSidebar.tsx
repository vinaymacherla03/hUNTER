
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

const ModernSidebar: React.FC<TemplateProps> = ({ data, sectionOrder, customization, sectionVisibility, onDataChange }) => {
  const marginValue = { compact: '0.4in', normal: '0.6in', spacious: '0.8in' }[customization.margin] || '0.6in';
  
  const sectionTitleStyle: React.CSSProperties = {
    fontSize: `${customization.sectionTitleSize}pt`,
    color: customization.sectionTitleColor,
    textTransform: customization.sectionTitleUppercase ? 'uppercase' : 'none',
    fontWeight: 'black',
    marginBottom: '10px',
    marginTop: '20px',
    display: 'flex',
    alignItems: 'center',
    gap: '8px'
  };

  // FIX: Explicitly typed SidebarTitle as React.FC to allow proper children detection in JSX
  const SidebarTitle: React.FC<{ children: React.ReactNode }> = ({ children }) => (
      <h3 className="text-xs font-black uppercase tracking-widest text-slate-400 mb-3 mt-6">{children}</h3>
  );

  return (
    <div id="resume-content" className="flex h-full min-h-[11in]" style={{ padding: marginValue }}>
      <div className="flex-1 pr-8">
        <header className="mb-8">
          <EditableField as="h1" path="fullName" value={data.fullName} onChange={onDataChange} style={{ fontSize: `${customization.nameSize}pt` }} className="font-black leading-none tracking-tighter" />
          <EditableField as="p" path="title" value={data.title} onChange={onDataChange} style={{ fontSize: `${customization.titleSize}pt`, color: 'var(--primary-color)' }} className="font-bold mt-2" />
          <div className="mt-4 border-t-2 border-slate-100 pt-4">
             <EditableField as="p" path="summary" value={data.summary} onChange={onDataChange} className="text-slate-600 leading-relaxed text-sm" />
          </div>
        </header>

        <main>
           {sectionOrder.filter(k => k === 'experience' && sectionVisibility[k]).map(k => (
             <section key={k}>
                <h2 style={sectionTitleStyle}>Experience</h2>
                <EditableList items={data.experience} path="experience" onChange={onDataChange} newItem={{ id: '', role: 'Role', company: 'Company', location: 'Loc', dates: 'Dates', description: ['Achievement'] }}>
                    {(exp, i) => (
                        <div key={exp.id} className="mb-6 relative pl-4 border-l-2 border-slate-100">
                             <div className="absolute -left-[6.5px] top-1.5 w-3 h-3 rounded-full bg-slate-200 border-2 border-white" />
                             <EditableField path={`experience[${i}].role`} value={exp.role} onChange={onDataChange} className="font-bold text-slate-800 block" style={{ fontSize: `${customization.itemTitleSize}pt` }} />
                             <div className="flex gap-2 text-xs font-bold text-slate-400 uppercase tracking-wide mb-2">
                                <EditableField path={`experience[${i}].company`} value={exp.company} onChange={onDataChange} />
                                <span>•</span>
                                <EditableField path={`experience[${i}].dates`} value={exp.dates} onChange={onDataChange} />
                             </div>
                             <EditableList items={exp.description} path={`experience[${i}].description`} onChange={onDataChange} newItem="New point" className="space-y-1.5">
                                {(desc, di) => (
                                    <div className="flex gap-2 text-sm text-slate-600">
                                        <span className="text-[var(--primary-color)] mt-1">•</span>
                                        <EditableField as="div" path={`experience[${i}].description[${di}]`} value={desc} onChange={onDataChange} enableMarkdown />
                                    </div>
                                )}
                             </EditableList>
                        </div>
                    )}
                </EditableList>
             </section>
           ))}
        </main>
      </div>

      <aside className="w-56 shrink-0 border-l border-slate-100 pl-6 bg-slate-50/50">
        <div>
            {/* FIX: Component now correctly recognizes children prop */}
            <SidebarTitle>Contact</SidebarTitle>
            <div className="space-y-2 text-xs font-medium text-slate-600">
                <EditableField path="contactInfo.email" value={data.contactInfo.email} onChange={onDataChange} className="block truncate" />
                <EditableField path="contactInfo.phone" value={data.contactInfo.phone} onChange={onDataChange} className="block" />
                <EditableField path="contactInfo.location" value={data.contactInfo.location} onChange={onDataChange} className="block" />
                <EditableField path="contactInfo.linkedin" value={data.contactInfo.linkedin} onChange={onDataChange} className="block truncate text-blue-600" />
            </div>
        </div>

        <div>
            {/* FIX: Component now correctly recognizes children prop */}
            <SidebarTitle>Skills</SidebarTitle>
            <div className="space-y-4">
                {data.skills.map((cat, i) => (
                    <div key={cat.id}>
                        <EditableField path={`skills[${i}].name`} value={cat.name} onChange={onDataChange} className="text-[10px] font-black uppercase text-slate-400 block mb-1.5" />
                        <div className="flex flex-wrap gap-1.5">
                            {cat.skills.map((s, si) => (
                                <span key={s.id} className="px-2 py-1 bg-white border border-slate-200 rounded-md text-[10px] font-bold text-slate-700">
                                    <EditableField path={`skills[${i}].skills[${si}].name`} value={s.name} onChange={onDataChange} />
                                </span>
                            ))}
                        </div>
                    </div>
                ))}
            </div>
        </div>

        <div>
            {/* FIX: Component now correctly recognizes children prop */}
            <SidebarTitle>Education</SidebarTitle>
            <EditableList items={data.education} path="education" onChange={onDataChange} newItem={{ id: '', degree: 'Deg', institution: 'Inst', location: 'Loc', graduationDate: 'Date' }}>
                {(edu, i) => (
                    <div key={edu.id} className="mb-4">
                        <EditableField path={`education[${i}].degree`} value={edu.degree} onChange={onDataChange} className="text-xs font-bold text-slate-800 block" />
                        <EditableField path={`education[${i}].institution`} value={edu.institution} onChange={onDataChange} className="text-[10px] text-slate-500 block" />
                        <EditableField path={`education[${i}].graduationDate`} value={edu.graduationDate} onChange={onDataChange} className="text-[10px] text-slate-400 block italic" />
                    </div>
                )}
            </EditableList>
        </div>
      </aside>
    </div>
  );
};

export default ModernSidebar;
