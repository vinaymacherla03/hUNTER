
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

const ProfessionalBlock: React.FC<TemplateProps> = ({ data, sectionOrder, customization, sectionVisibility, onDataChange }) => {
  const marginValue = { compact: '0.4in', normal: '0.6in', spacious: '0.8in' }[customization.margin] || '0.6in';
  
  const sectionTitleStyle: React.CSSProperties = {
    fontSize: `${customization.sectionTitleSize}pt`,
    color: '#fff',
    backgroundColor: customization.sectionTitleColor,
    padding: '8px 16px',
    fontWeight: 'black',
    textTransform: 'uppercase',
    letterSpacing: '0.1em',
    marginBottom: '1px',
  };

  // FIX: Typed Block as React.FC to support implicit children prop and standard attributes like key
  const Block: React.FC<{ children: React.ReactNode }> = ({ children }) => (
      <div className="border-2 border-slate-100 p-6 mb-6 rounded-br-3xl">
          {children}
      </div>
  );

  return (
    <div id="resume-content" style={{ padding: marginValue }} className="bg-white">
      <header className="flex flex-col md:flex-row justify-between items-start md:items-end mb-10 gap-6">
        <div>
            <EditableField as="h1" path="fullName" value={data.fullName} onChange={onDataChange} style={{ fontSize: `${customization.nameSize}pt` }} className="font-black leading-none tracking-tighter text-slate-900" />
            <EditableField as="p" path="title" value={data.title} onChange={onDataChange} style={{ fontSize: `${customization.titleSize}pt` }} className="text-[var(--primary-color)] font-bold uppercase mt-2 tracking-widest" />
        </div>
        <div className="flex flex-col gap-1 text-[10px] font-black uppercase text-slate-400">
             <div className="flex gap-2"><span>E:</span> <EditableField path="contactInfo.email" value={data.contactInfo.email} onChange={onDataChange} /></div>
             <div className="flex gap-2"><span>P:</span> <EditableField path="contactInfo.phone" value={data.contactInfo.phone} onChange={onDataChange} /></div>
             <div className="flex gap-2"><span>L:</span> <EditableField path="contactInfo.linkedin" value={data.contactInfo.linkedin} onChange={onDataChange} /></div>
        </div>
      </header>

      <main>
          {sectionOrder.filter(k => sectionVisibility[k]).map(key => {
              if (key === 'summary') return (
                  <section key={key}>
                      <h2 style={sectionTitleStyle}>Executive Overview</h2>
                      {/* FIX: Component now correctly recognizes children prop */}
                      <Block>
                          <EditableField as="p" path="summary" value={data.summary} onChange={onDataChange} className="text-sm text-slate-600 leading-relaxed font-medium" />
                      </Block>
                  </section>
              );

              if (key === 'experience') return (
                  <section key={key}>
                      <h2 style={sectionTitleStyle}>Work Record</h2>
                      <EditableList items={data.experience} path="experience" onChange={onDataChange} newItem={{ id: '', role: 'Role', company: 'Co', location: 'Loc', dates: 'Dates', description: ['Achievement'] }}>
                          {(exp, i) => (
                              /* FIX: Component now correctly accepts key attribute via iteration */
                              <Block key={exp.id}>
                                  <div className="flex justify-between items-center mb-4">
                                      <EditableField path={`experience[${i}].role`} value={exp.role} onChange={onDataChange} className="text-lg font-black text-slate-800" />
                                      <EditableField path={`experience[${i}].dates`} value={exp.dates} onChange={onDataChange} className="text-xs font-bold text-slate-400 uppercase tracking-widest" />
                                  </div>
                                  <EditableField path={`experience[${i}].company`} value={exp.company} onChange={onDataChange} className="text-xs font-black text-slate-300 uppercase tracking-widest block mb-4" />
                                  <EditableList items={exp.description} path={`experience[${i}].description`} onChange={onDataChange} newItem="Achievement" className="space-y-3">
                                      {(desc, di) => (
                                          <div className="flex gap-3 text-sm text-slate-500 leading-relaxed font-medium">
                                              <div className="w-1.5 h-1.5 rounded-full bg-slate-200 mt-1.5 shrink-0" />
                                              <EditableField as="div" path={`experience[${i}].description[${di}]`} value={desc} onChange={onDataChange} enableMarkdown />
                                          </div>
                                      )}
                                  </EditableList>
                              </Block>
                          )}
                      </EditableList>
                  </section>
              );

              return null;
          })}
      </main>
    </div>
  );
};

export default ProfessionalBlock;
