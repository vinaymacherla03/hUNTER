
import React from 'react';
import { ResumeData, ResumeSectionKey, Customization, Experience, Project, Education, Certification, Award, SkillCategory } from '../../types';
import ContactIcon from '../ContactIcon';
import EditableField from '../EditableField';
import { EditableList } from '../EditableList';

interface TemplateProps {
  data: ResumeData;
  sectionOrder: ResumeSectionKey[];
  customization: Customization;
  sectionVisibility: Record<ResumeSectionKey, boolean>;
  onDataChange: (path: string, value: any) => void;
}

const marginMap: Record<Customization['margin'], string> = {
  compact: '0.5in',
  normal: '0.75in',
  spacious: '1in',
};

const newExperienceEntry: Experience = { id: '', role: 'Position', company: 'Company', location: 'Location', dates: 'Date', description: ['Detail'] };
const newProjectEntry: Project = { id: '', name: 'Project', role: 'Role', description: ['Detail'], technologies: [] };
const newEducationEntry: Education = { id: '', degree: 'Degree', institution: 'Institution', location: 'Location', graduationDate: 'Date' };
const newCertificationEntry: Certification = { id: '', name: 'Name', issuer: 'Issuer', date: 'Date' };
const newAwardEntry: Award = { id: '', name: 'Award', issuer: 'Issuer', date: 'Date' };
const newSkillCategory: SkillCategory = { id: '', name: 'Category', skills: [{id: '', name: 'Skill', proficiency: 'Intermediate'}] };

const JsonResumeFlatTemplate: React.FC<TemplateProps> = ({ data, sectionOrder, customization, sectionVisibility, onDataChange }) => {
  const marginValue = marginMap[customization.margin] || marginMap.normal;
  
  const { 
    sectionTitleSize, 
    sectionTitleColor, 
    sectionTitleUppercase 
  } = customization;

  const sectionTitleStyles: React.CSSProperties = {
    fontSize: `${sectionTitleSize}pt`,
    color: sectionTitleColor,
    textTransform: sectionTitleUppercase ? 'uppercase' : 'none',
    fontWeight: 'bold',
    letterSpacing: '0.05em',
    marginBottom: '0.4rem',
    marginTop: '1rem',
  };

  const sections: Record<ResumeSectionKey, React.ReactNode> = {
    summary: (
      <section key="summary" className="mb-4">
        <div className="p-4 bg-slate-100 rounded-sm border-l-4 border-[var(--primary-color)]">
             <EditableField as="p" path="summary" value={data.summary} onChange={onDataChange} className="text-slate-700 leading-relaxed" />
        </div>
      </section>
    ),
    experience: (
      <section key="experience" className="mb-4">
        <h3 style={sectionTitleStyles} className="flex items-center gap-2">
            <span className="w-8 h-8 rounded-full bg-[var(--primary-color)] flex items-center justify-center text-white shadow-sm">
                <svg xmlns="http://www.w3.org/2000/svg" className="h-4 w-4" viewBox="0 0 24 24" fill="currentColor">
                    <path d="M22 6H12a2 2 0 00-2-2H4a2 2 0 00-2 2v10a2 2 0 002 2h18a2 2 0 002-2V8a2 2 0 00-2-2zm-2 10H4V8h16v8zm-5-4V8h-2v4h2z"/>
                </svg>
            </span>
            Work Experience
        </h3>
        <EditableList items={(data.experience || [])} path="experience" onChange={onDataChange} newItem={newExperienceEntry}>
          {(exp, index) => {
            if (!exp) return null;
            return (
              <div key={exp.id || index} className="mb-4 pl-4 border-l-2 border-slate-100 ml-4">
                <div className="flex justify-between items-start mb-1">
                  <div>
                      <EditableField as="h4" style={{ fontSize: `${customization.itemTitleSize}pt` }} path={`experience[${index}].role`} value={exp.role} onChange={onDataChange} className="font-bold text-slate-800" />
                      <EditableField as="a" href="#" path={`experience[${index}].company`} value={exp.company} onChange={onDataChange} className="text-[var(--primary-color)] font-medium hover:underline" />
                  </div>
                  <div className="text-right text-sm text-slate-500 font-mono">
                      <EditableField as="span" path={`experience[${index}].dates`} value={exp.dates} onChange={onDataChange} />
                  </div>
                </div>
                <div className="text-xs text-slate-400 mb-2 flex items-center gap-1">
                    <svg xmlns="http://www.w3.org/2000/svg" className="h-3 w-3" viewBox="0 0 20 20" fill="currentColor"><path fillRule="evenodd" d="M5.05 4.05a7 7 0 119.9 9.9L10 18.9l-4.95-4.95a7 7 0 010-9.9zM10 11a2 2 0 100-4 2 2 0 000 4z" clipRule="evenodd" /></svg>
                    <EditableField as="span" path={`experience[${index}].location`} value={exp.location} onChange={onDataChange} />
                </div>
                <EditableList items={(exp.description || [])} path={`experience[${index}].description`} onChange={onDataChange} newItem="New bullet point." className="list-disc list-outside text-slate-700 space-y-1 mt-2 pl-5 leading-relaxed">
                  {(desc, descIndex) => (
                    <EditableField as="div" path={`experience[${index}].description[${descIndex}]`} value={desc} onChange={onDataChange} enableMarkdown />
                  )}
                </EditableList>
              </div>
            )
          }}
        </EditableList>
      </section>
    ),
    projects: (
      <section key="projects" className="mb-4">
        <h3 style={sectionTitleStyles} className="flex items-center gap-2">
             <span className="w-8 h-8 rounded-full bg-[var(--primary-color)] flex items-center justify-center text-white shadow-sm">
                <svg xmlns="http://www.w3.org/2000/svg" className="h-4 w-4" viewBox="0 0 20 20" fill="currentColor"><path fillRule="evenodd" d="M10 2a1 1 0 011 1v1.5a1 1 0 01-.5.866l-2 1A1 1 0 018 6.5V5a1 1 0 00-1-1H4a1 1 0 00-1 1v2.5a1 1 0 01-1 1H.5a1 1 0 01-.866 1.5L2 12a1 1 0 00.5.866l-2 1A1 1 0 010 15.5V17a1 1 0 001 1h3a1 1 0 001-1v-1.5a1 1 0 01.5-.866l2-1A1 1 0 018 13.5V15a1 1 0 001 1h3a1 1 0 001-1v-2.5a1 1 0 011-1h.5a1 1 0 01.866-1.5L18 8a1 1 0 00-.5-.866l2-1A1 1 0 0120 4.5V3a1 1 0 00-1-1h-3a1 1 0 00-1 1v1.5a1 1 0 01-.5.866l-2 1A1 1 0 0112 6.5V5a1 1 0 00-1-1H8a1 1 0 00-1 1v2.5a1 1 0 01-1 1H4a1 1 0 00-1 1v2.5a1 1 0 01-1 1H.5a1 1 0 01-.866 1.5L2 12a1 1 0 00.5.866l-2 1A1 1 0 010 15.5V17a1 1 0 001 1h3a1 1 0 001-1v-1.5a1 1 0 01.5-.866l2-1A1 1 0 018 13.5V15a1 1 0 001 1h3a1 1 0 001-1v-2.5a1 1 0 011-1h.5a1 1 0 01.866-1.5L18 8a1 1 0 00-.5-.866l2-1A1 1 0 0120 4.5V3a1 1 0 00-1-1h-3z" clipRule="evenodd" /></svg>
            </span>
            Projects
        </h3>
        <EditableList items={(data.projects || [])} path="projects" onChange={onDataChange} newItem={newProjectEntry}>
          {(proj, index) => {
            if (!proj) return null;
            return (
              <div key={proj.id || index} className="mb-4 pl-4 border-l-2 border-slate-100 ml-4">
                <div className="flex justify-between items-start mb-1">
                  <div>
                      <EditableField as="h4" style={{ fontSize: `${customization.itemTitleSize}pt` }} path={`projects[${index}].name`} value={proj.name} onChange={onDataChange} className="font-bold text-slate-800" />
                      <EditableField as="p" path={`projects[${index}].role`} value={proj.role} onChange={onDataChange} className="text-[var(--primary-color)] font-medium hover:underline" />
                  </div>
                  {proj.startDate || proj.endDate ? (
                      <div className="text-right text-sm text-slate-500 font-mono">
                          <EditableField as="span" path={`projects[${index}].startDate`} value={proj.startDate} onChange={onDataChange} />
                          {proj.endDate ? ` - ` : ''}
                          <EditableField as="span" path={`projects[${index}].endDate`} value={proj.endDate} onChange={onDataChange} />
                      </div>
                  ) : null}
                </div>
                <div className="text-xs text-slate-400 mb-2">
                    {proj.technologies && proj.technologies.length > 0 && (
                        <span>Technologies: {proj.technologies.join(', ')}</span>
                    )}
                </div>
                <EditableList items={(proj.description || [])} path={`projects[${index}].description`} onChange={onDataChange} newItem="New bullet point." className="list-disc list-outside text-slate-700 space-y-1 mt-2 pl-5 leading-relaxed">
                  {(desc, descIndex) => (
                      <EditableField as="div" path={`projects[${index}].description[${descIndex}]`} value={desc} onChange={onDataChange} />
                  )}
                </EditableList>
              </div>
            )
          }}
        </EditableList>
      </section>
    ),
    education: (
      <section key="education" className="mb-4">
        <h3 style={sectionTitleStyles} className="flex items-center gap-2">
            <span className="w-8 h-8 rounded-full bg-[var(--primary-color)] flex items-center justify-center text-white shadow-sm">
                <svg xmlns="http://www.w3.org/2000/svg" className="h-4 w-4" viewBox="0 0 24 24" fill="currentColor"><path d="M12 3L1 9l11 6 11-6-11-6zm0 8.87c-1.35 0-2.45-1.12-2.45-2.5s1.1-2.5 2.45-2.5 2.45 1.12 2.45 2.5-1.1 2.5-2.45 2.5zm11 3.13l-3 1.68v-2.07c0-2.3-1.87-4.18-4.18-4.18H8.18c-2.3 0-4.18 1.87-4.18 4.18v2.07L1 15l11 6 11-6z"/></svg>
            </span>
            Education
        </h3>
        <EditableList items={(data.education || [])} path="education" onChange={onDataChange} newItem={newEducationEntry}>
          {(edu, index) => {
            if (!edu) return null;
            return (
              <div key={edu.id || index} className="mb-4 pl-4 border-l-2 border-slate-100 ml-4">
                <div className="flex justify-between items-start mb-1">
                  <div>
                      <EditableField as="h4" style={{ fontSize: `${customization.itemTitleSize}pt` }} path={`education[${index}].degree`} value={edu.degree} onChange={onDataChange} className="font-bold text-slate-800" />
                      <EditableField as="p" path={`education[${index}].institution`} value={edu.institution} onChange={onDataChange} className="text-[var(--primary-color)] font-medium hover:underline" />
                  </div>
                  <div className="text-right text-sm text-slate-500 font-mono">
                      <EditableField as="span" path={`education[${index}].graduationDate`} value={edu.graduationDate} onChange={onDataChange} />
                  </div>
                </div>
                <div className="text-xs text-slate-400 mb-2 flex items-center gap-1">
                    <svg xmlns="http://www.w3.org/2000/svg" className="h-3 w-3" viewBox="0 0 20 20" fill="currentColor"><path fillRule="evenodd" d="M5.05 4.05a7 7 0 119.9 9.9L10 18.9l-4.95-4.95a7 7 0 010-9.9zM10 11a2 2 0 100-4 2 2 0 000 4z" clipRule="evenodd" /></svg>
                    <EditableField as="span" path={`education[${index}].location`} value={edu.location} onChange={onDataChange} />
                </div>
                {edu.relevantCoursework && edu.relevantCoursework.length > 0 && (
                      <p className="text-sm text-slate-600 mt-2"><strong>Relevant Coursework:</strong> <EditableField as="span" path={`education[${index}].relevantCoursework`} value={(edu.relevantCoursework || []).join(', ')} onChange={(p,v)=>onDataChange(p, v.split(',').map(s => String.prototype.trim.call(s)))} /></p>
                )}
              </div>
            )
          }}
        </EditableList>
      </section>
    ),
    skills: (
      <section key="skills" className="mb-4">
        <h3 style={sectionTitleStyles} className="flex items-center gap-2">
            <span className="w-8 h-8 rounded-full bg-[var(--primary-color)] flex items-center justify-center text-white shadow-sm">
                <svg xmlns="http://www.w3.org/2000/svg" className="h-4 w-4" viewBox="0 0 24 24" fill="currentColor"><path d="M13.5 2c-3.525 0-6.425 2.5-7.25 5.75L2 14l4.25 6.25c.825 3.25 3.725 5.75 7.25 5.75 3.5 0 6.4-2.5 7.25-5.75L22 10l-4.25-6.25C17.9 2.5 15 2 13.5 2zm-1.125 18.75c-3.1 0-5.675-2.25-6.375-5.375L3.625 11.5l2.375-3.5c.7-3.125 3.275-5.375 6.375-5.375s5.675 2.25 6.375 5.375l2.375 3.5-2.375 3.5c-.7 3.125-3.275 5.375-6.375 5.375z"/></svg>
            </span>
            Skills
        </h3>
        <EditableList items={(data.skills || [])} path="skills" onChange={onDataChange} newItem={newSkillCategory} className="space-y-3">
            {(category, catIndex) => {
              if (!category) return null;
              return (
                  <div key={category.id || catIndex} className="mb-3 pl-4 border-l-2 border-slate-100 ml-4">
                      <EditableField as="h4" style={{ fontSize: `${customization.itemTitleSize * 0.9}pt` }} path={`skills[${catIndex}].name`} value={category.name} onChange={onDataChange} className="font-bold text-slate-800" />
                      <p className="text-slate-700 mt-1">
                        {(category.skills || []).map((s, i) => {
                            if (!s) return null;
                            const validSkills = category.skills.filter(Boolean);
                            const renderedIndex = validSkills.findIndex(vs => vs.id === s.id);
                            return (
                                <React.Fragment key={s.id || i}>
                                    <EditableField as="span" path={`skills[${catIndex}].skills[${i}].name`} value={s.name} onChange={onDataChange} />
                                    {renderedIndex < validSkills.length - 1 ? ', ' : ''}
                                </React.Fragment>
                            );
                        })}
                      </p>
                  </div>
              )
            }}
        </EditableList>
      </section>
    ),
    certifications: (
      <section key="certifications" className="mb-4">
        <h3 style={sectionTitleStyles} className="flex items-center gap-2">
            <span className="w-8 h-8 rounded-full bg-[var(--primary-color)] flex items-center justify-center text-white shadow-sm">
                <svg xmlns="http://www.w3.org/2000/svg" className="h-4 w-4" viewBox="0 0 24 24" fill="currentColor"><path d="M12 2l-5 3v10l5 3 5-3V5l-5-3zm0 15.1l-3-1.8V7.5l3 1.8V17.1zm0-7.3V6.9l3-1.8v8.6l-3-1.8z"/></svg>
            </span>
            Certifications
        </h3>
        <EditableList items={(data.certifications || [])} path="certifications" onChange={onDataChange} newItem={newCertificationEntry}>
          {(cert, index) => {
            if (!cert) return null;
            return (
              <div key={cert.id || index} className="mb-4 pl-4 border-l-2 border-slate-100 ml-4">
                <EditableField as="h4" style={{ fontSize: `${customization.itemTitleSize}pt` }} path={`certifications[${index}].name`} value={cert.name} onChange={onDataChange} className="font-bold text-slate-800" />
                <p className="text-slate-700 mt-1">
                  <EditableField as="span" path={`certifications[${index}].issuer`} value={cert.issuer} onChange={onDataChange} />, {' '}
                  <EditableField as="span" path={`certifications[${index}].date`} value={cert.date} onChange={onDataChange} />
                </p>
              </div>
            )
          }}
        </EditableList>
      </section>
    ),
    awards: (
      <section key="awards" className="mb-4">
        <h3 style={sectionTitleStyles} className="flex items-center gap-2">
            <span className="w-8 h-8 rounded-full bg-[var(--primary-color)] flex items-center justify-center text-white shadow-sm">
                <svg xmlns="http://www.w3.org/2000/svg" className="h-4 w-4" viewBox="0 0 24 24" fill="currentColor"><path d="M12 2l-3.09 6.26L2 9.27l4.5 4.38L4.44 20 12 16.5l7.56 3.5-2.06-6.35L22 9.27l-6.91-.01L12 2z"/></svg>
            </span>
            Awards
        </h3>
        <EditableList items={(data.awards || [])} path="awards" onChange={onDataChange} newItem={newAwardEntry}>
          {(award, index) => {
            if (!award) return null;
            return (
              <div key={award.id || index} className="mb-4 pl-4 border-l-2 border-slate-100 ml-4">
                <EditableField as="h4" style={{ fontSize: `${customization.itemTitleSize}pt` }} path={`awards[${index}].name`} value={award.name} onChange={onDataChange} className="font-bold text-slate-800" />
                <p className="text-slate-700 mt-1">
                  <EditableField as="span" path={`awards[${index}].issuer`} value={award.issuer} onChange={onDataChange} />, {' '}
                  <EditableField as="span" path={`awards[${index}].date`} value={award.date} onChange={onDataChange} />
                </p>
              </div>
            )
          }}
        </EditableList>
      </section>
    ),
    keywords: (
      <section key="keywords" className="mb-4">
        <h3 style={sectionTitleStyles} className="flex items-center gap-2">
            <span className="w-8 h-8 rounded-full bg-[var(--primary-color)] flex items-center justify-center text-white shadow-sm">
                <svg xmlns="http://www.w3.org/2000/svg" className="h-4 w-4" viewBox="0 0 24 24" fill="currentColor"><path d="M12 2L2 7l10 5 10-5-10-5zM2 17l10 5 10-5M2 12l10 5 10-5"/></svg>
            </span>
            Keywords
        </h3>
        <div className="pl-4 border-l-2 border-slate-100 ml-4 text-slate-700 italic">
          {data.keywords?.join(' • ')}
        </div>
      </section>
    ),
  };
  
  const contactItemClass = "flex items-center gap-2 text-slate-700";
  const contactLinkClass = "hover:text-[var(--primary-color)]";

  return (
    <div id="resume-content" style={{ padding: marginValue }}>
      <header className="text-center mb-6 pb-4 border-b border-slate-200">
        <EditableField as="h1" path="fullName" value={data.fullName} onChange={onDataChange} style={{ fontSize: `${customization.nameSize}pt` }} className="font-bold text-slate-900" />
        <EditableField as="h2" path="title" value={data.title} onChange={onDataChange} style={{ fontSize: `${customization.titleSize}pt` }} className="font-medium text-[var(--primary-color)] mt-1" />
        <div className="flex flex-wrap justify-center items-center gap-x-4 gap-y-1 text-sm mt-3">
          <span className={contactItemClass}>
             <ContactIcon type="location" className="h-4 w-4 text-slate-500"/> <EditableField as="span" path="contactInfo.location" value={data.contactInfo.location} onChange={onDataChange} placeholder="City, State" />
          </span>
          <span className={contactItemClass}>
             <ContactIcon type="email" className="h-4 w-4 text-slate-500"/> <EditableField as="a" href={`mailto:${data.contactInfo.email}`} path="contactInfo.email" value={data.contactInfo.email} onChange={onDataChange} placeholder="your.email@provider.com" validation="email" className={contactLinkClass} />
          </span>
          <span className={contactItemClass}>
            <ContactIcon type="phone" className="h-4 w-4 text-slate-500"/> <EditableField as="span" path="contactInfo.phone" value={data.contactInfo.phone} onChange={onDataChange} placeholder="(555) 123-4567" validation="phone" />
          </span>
          <span className={contactItemClass}>
            <ContactIcon type="linkedin" className="h-4 w-4 text-slate-500"/> <EditableField as="a" href={data.contactInfo.linkedin} target="_blank" rel="noopener noreferrer" path="contactInfo.linkedin" value={data.contactInfo.linkedin} onChange={onDataChange} placeholder="linkedin.com/in/yourname" validation="url" className={contactLinkClass} />
          </span>
           {data.contactInfo.github && (
               <span className={contactItemClass}>
                   <ContactIcon type="github" className="h-4 w-4 text-slate-500"/> <EditableField as="a" href={data.contactInfo.github} target="_blank" rel="noopener noreferrer" path="contactInfo.github" value={data.contactInfo.github} onChange={onDataChange} className={contactLinkClass} validation="url" />
               </span>
           )}
           {data.contactInfo.portfolio && (
               <span className={contactItemClass}>
                   <ContactIcon type="portfolio" className="h-4 w-4 text-slate-500"/> <EditableField as="a" href={data.contactInfo.portfolio} target="_blank" rel="noopener noreferrer" path="contactInfo.portfolio" value={data.contactInfo.portfolio} onChange={onDataChange} className={contactLinkClass} validation="url" />
               </span>
           )}
        </div>
      </header>
      <main className="mt-4 space-y-4">
        {sectionOrder.filter(key => sectionVisibility[key]).map(sectionKey => sections[sectionKey])}
      </main>
    </div>
  );
};

export default JsonResumeFlatTemplate;
