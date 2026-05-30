
import React from 'react';
import { Document, Page, Text, View, StyleSheet, Font, Link } from '@react-pdf/renderer';
import { ResumeData, Customization, FontTheme, ResumeSectionKey, ColorTheme } from '../types';

const COLOR_MAP: Record<ColorTheme, string> = {
  indigo: '#4f46e5',
  blue: '#2563eb',
  emerald: '#10b981',
  rose: '#f43f5e',
  slate: '#475569',
  orange: '#f97316',
  amber: '#f59e0b',
  violet: '#8b5cf6',
  fuchsia: '#d946ef',
  pink: '#ec4899',
  cyan: '#06b6d4',
  teal: '#14b8a6',
  lime: '#84cc16',
  yellow: '#eab308',
  red: '#ef4444',
  black: '#000000',
};

// Standard PDF fonts are built-in and don't require registration with URLs
// We can use them directly by name: Helvetica, Times-Roman, etc.

const styles = StyleSheet.create({
  page: {
    backgroundColor: '#fff',
    color: '#000',
  },
  container: {
    flexDirection: 'column',
  },
  header: {
    marginBottom: 15,
    textAlign: 'center',
  },
  name: {
    fontWeight: 700,
    marginBottom: 2,
    textTransform: 'uppercase',
    letterSpacing: 1,
  },
  title: {
    fontWeight: 600,
    color: '#444',
    marginBottom: 6,
    textTransform: 'uppercase',
    letterSpacing: 1.5,
  },
  contactRow: {
    flexDirection: 'row',
    justifyContent: 'center',
    flexWrap: 'wrap',
    fontSize: 9,
    color: '#333',
  },
  contactItem: {
    marginHorizontal: 4,
  },
  section: {
    marginBottom: 12,
  },
  sectionTitle: {
    fontWeight: 700,
    paddingBottom: 2,
    marginBottom: 6,
    letterSpacing: 0.5,
  },
  summary: {
    lineHeight: 1.4,
    textAlign: 'left',
  },
  experienceItem: {
    marginBottom: 10,
  },
  experienceHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    marginBottom: 1,
  },
  role: {
    fontWeight: 700,
  },
  company: {
    fontWeight: 700,
  },
  experienceSubHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    marginBottom: 3,
    fontSize: 9,
    color: '#555',
    fontStyle: 'italic',
  },
  bulletPointContainer: {
    marginTop: 2,
  },
  bulletPoint: {
    flexDirection: 'row',
    marginBottom: 2,
    paddingLeft: 8,
  },
  bullet: {
    width: 8,
    fontSize: 9,
  },
  bulletText: {
    flex: 1,
    lineHeight: 1.3,
  },
  skillCategory: {
    marginBottom: 3,
    flexDirection: 'row',
  },
  skillCategoryName: {
    fontWeight: 700,
    width: 100,
    textTransform: 'uppercase',
  },
  skillList: {
    flex: 1,
  },
  educationItem: {
    marginBottom: 6,
  },
  educationHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    marginBottom: 1,
  },
  institution: {
    fontWeight: 700,
  },
  degree: {
    fontStyle: 'italic',
  },
  date: {
    fontWeight: 700,
  },
  link: {
    color: '#0000EE',
    textDecoration: 'underline',
  },
  pageNumber: {
    position: 'absolute',
    fontSize: 8,
    bottom: 20,
    left: 0,
    right: 0,
    textAlign: 'center',
    color: 'grey',
  },
});

interface PdfTemplateProps {
  data: ResumeData;
  customization: Customization;
  sectionVisibility: Record<ResumeSectionKey, boolean>;
  template: string;
}

const SERIF_FONTS: FontTheme[] = ['times-new-roman', 'georgia', 'garamond', 'playfair', 'merriweather', 'lora', 'crimson-pro'];

const TEMPLATE_CONFIGS: Record<string, {
  titles?: Record<string, string>;
  styles?: {
    page?: any;
    header?: any;
    name?: any;
    title?: any;
    sectionTitle?: any;
    body?: any;
    contactItem?: any;
    contactRow?: any;
    sidebar?: any;
    main?: any;
  };
  isDark?: boolean;
}> = {
  'minimalist-clean': {
    titles: { summary: 'About', experience: 'History', skills: 'Expertise' },
    styles: {
      name: { fontSize: 48, fontWeight: 900, letterSpacing: -2, borderBottomWidth: 2, borderBottomColor: '#000', paddingBottom: 10, marginBottom: 10 },
      title: { fontSize: 10, letterSpacing: 4, fontWeight: 900, color: '#000' },
      sectionTitle: { borderLeftWidth: 4, borderLeftColor: '#000', paddingLeft: 12, fontWeight: 900, letterSpacing: 2, borderBottomWidth: 0 },
      header: { paddingTop: 15, marginBottom: 30 }
    }
  },
  'bold-impact': {
    titles: { summary: 'Profile' },
    styles: {
      name: { fontSize: 56, fontWeight: 900, letterSpacing: -3 },
      title: { fontSize: 18, letterSpacing: 2, fontWeight: 900, color: '#000' },
      sectionTitle: { backgroundColor: '#000', color: '#fff', padding: '4 12', fontWeight: 900, borderBottomWidth: 0 },
      header: { borderBottomWidth: 8, borderBottomColor: '#000', paddingBottom: 20, marginBottom: 40 }
    }
  },
  'tech-focused': {
    isDark: true,
    titles: { summary: '// Profile', experience: '// Experience', skills: '// Stack', education: '// Education', projects: '// Projects', keywords: '// Keywords' },
    styles: {
      page: { backgroundColor: '#0f172a', color: '#cbd5e1' },
      name: { color: '#fff', fontSize: 36, fontWeight: 700 },
      title: { color: '#0ea5e9', fontSize: 14, fontWeight: 700 },
      sectionTitle: { color: '#0ea5e9', borderLeftWidth: 4, borderLeftColor: '#0ea5e9', paddingLeft: 10, fontWeight: 700, borderBottomWidth: 0 },
      body: { color: '#94a3b8' },
      contactItem: { color: '#94a3b8' }
    }
  },
  'sidebar-modern': {
    titles: { summary: 'Profile' },
    styles: {
      sidebar: { backgroundColor: '#0f172a', color: '#fff' },
      sectionTitle: { paddingBottom: 4, fontWeight: 900, borderBottomWidth: 0 }
    }
  },
  'magic-modern': {
    styles: {
      sidebar: { backgroundColor: '#4f46e5', color: '#fff' },
      sectionTitle: { color: '#4f46e5', fontWeight: 700, borderBottomWidth: 0 }
    }
  },
  'google-style': {
    styles: {
      name: { fontSize: 18, fontWeight: 700, textAlign: 'center' },
      sectionTitle: { borderBottomWidth: 0.5, borderBottomColor: '#000', textAlign: 'center', fontWeight: 700 }
    }
  },
  'canva-inspired': {
    styles: {
      sidebar: { backgroundColor: '#fdf2f8', color: '#000' },
      name: { fontSize: 32, fontWeight: 900, color: '#be185d' },
      sectionTitle: { color: '#be185d', fontWeight: 700, borderBottomWidth: 2, borderBottomColor: '#be185d' }
    }
  },
  'ats-standard': {
    styles: {
      name: { fontSize: 16, fontWeight: 700, textAlign: 'center' },
      sectionTitle: { borderBottomWidth: 0.5, borderBottomColor: '#000', fontWeight: 700, textTransform: 'uppercase' }
    }
  },
  'ats-executive': {
    styles: {
      name: { fontSize: 24, fontWeight: 700, textAlign: 'center', marginBottom: 2 },
      title: { fontSize: 11, fontWeight: 700, textAlign: 'center', marginBottom: 8, color: '#475569', letterSpacing: 1 },
      header: { marginBottom: 15 }
    }
  },
  'finance-ats': {
    styles: {
      name: { fontSize: 24, fontWeight: 700, textAlign: 'center', textTransform: 'uppercase', marginBottom: 2 },
      header: { borderBottomWidth: 2, borderBottomColor: '#4b5563', paddingBottom: 10, marginBottom: 15 },
      sectionTitle: { borderBottomWidth: 1, borderBottomColor: '#000', fontWeight: 700, marginTop: 12 }
    }
  },
  'tech-ats': {
    styles: {
      name: { fontSize: 26, fontWeight: 700, textAlign: 'left', marginBottom: 4, color: '#0f172a' },
      contactRow: { justifyContent: 'flex-start' },
      header: { borderBottomWidth: 2, borderBottomColor: '#0f172a', paddingBottom: 6, marginBottom: 15, textAlign: 'left' },
      sectionTitle: { color: '#334155', fontWeight: 700, marginTop: 10 }
    }
  },
  'healthcare-ats': {
    styles: {
      name: { fontSize: 24, fontWeight: 700, textAlign: 'center', marginBottom: 4 },
      sectionTitle: { backgroundColor: '#e2e8f0', padding: '4 8', fontWeight: 700, marginTop: 10 }
    }
  },
  'federal-ats': {
    styles: {
      name: { fontSize: 20, fontWeight: 700, textAlign: 'center', textTransform: 'uppercase', marginBottom: 10 },
      header: { borderBottomWidth: 2, borderBottomColor: '#000', paddingBottom: 10, marginBottom: 15 },
      sectionTitle: { borderTopWidth: 1, borderTopColor: '#000', borderBottomWidth: 1, borderBottomColor: '#000', backgroundColor: '#fafafa', textAlign: 'center', padding: '4 0', fontWeight: 700, marginTop: 12 }
    }
  },
  'sales-ats': {
    styles: {
      name: { fontSize: 26, fontWeight: 700, textAlign: 'center', color: '#0c4a6e', marginBottom: 6 },
      sectionTitle: { color: '#0369a1', borderBottomWidth: 1, borderBottomColor: '#0369a1', fontWeight: 700, marginTop: 12 }
    }
  },
  'product-ats': {
    styles: {
      name: { fontSize: 30, fontWeight: 700, textAlign: 'left', marginBottom: 8, color: '#0f172a' },
      contactRow: { justifyContent: 'flex-start', flexDirection: 'column' },
      contactItem: { marginHorizontal: 0, marginBottom: 2, color: '#64748b' },
      header: { marginBottom: 20, textAlign: 'left' },
      sectionTitle: { color: '#64748b', fontWeight: 700, letterSpacing: 1, marginTop: 15 }
    }
  },
  'operations-ats': {
    styles: {
      name: { fontSize: 24, fontWeight: 700, textAlign: 'left', color: '#fff' },
      header: { backgroundColor: '#1f2937', padding: 15, marginBottom: 15, flexDirection: 'row' },
      contactRow: { flexDirection: 'column', alignItems: 'flex-end', flex: 1 },
      contactItem: { color: '#d1d5db', marginHorizontal: 0, marginBottom: 2 },
      sectionTitle: { borderBottomWidth: 1, borderBottomColor: '#d1d5db', fontWeight: 700, marginTop: 12 }
    }
  },
  'executive-premium': {
    styles: {
      name: { fontSize: 28, fontWeight: 700, textAlign: 'center', letterSpacing: 1 },
      sectionTitle: { borderBottomWidth: 1, borderBottomColor: '#000', textAlign: 'center', fontWeight: 700, textTransform: 'uppercase', letterSpacing: 2 }
    }
  },
  'classic-standard': {
    styles: {
      name: { fontSize: 24, fontWeight: 700, textAlign: 'center' },
      sectionTitle: { borderBottomWidth: 0.5, borderBottomColor: '#000', textAlign: 'center', fontWeight: 700, fontStyle: 'italic' }
    }
  },
  'elegant-serif': {
    styles: {
      name: { fontSize: 32, fontWeight: 700, textAlign: 'center', fontStyle: 'italic' },
      sectionTitle: { borderBottomWidth: 1, borderBottomColor: '#ccc', textAlign: 'center', letterSpacing: 2 }
    }
  },
  'creative-gradient': {
    styles: {
      name: { fontSize: 40, fontWeight: 900, color: '#f43f5e' },
      sectionTitle: { color: '#f43f5e', fontWeight: 700, borderBottomWidth: 2, borderBottomColor: '#f43f5e' }
    }
  }
};

export const PdfTemplate: React.FC<PdfTemplateProps> = ({ data, customization, sectionVisibility, template }) => {
  const themeColor = COLOR_MAP[customization.color] || '#000000';
  const config = TEMPLATE_CONFIGS[template] || (template.includes('modern') || template.includes('enhancv') ? {
    styles: {
      sectionTitle: { color: themeColor, fontWeight: 700, borderBottomWidth: 0 }
    }
  } : {});
  
  const isSerif = SERIF_FONTS.includes(customization.font);
  // Using standard PDF fonts: Helvetica for sans-serif, Times-Roman for serif
  const fontStyle = { fontFamily: isSerif ? 'Times-Roman' : 'Helvetica' };
  
  const marginValue = customization.margin === 'compact' ? 30 : customization.margin === 'spacious' ? 60 : 45;
  const pageStyle = { 
    ...styles.page, 
    padding: marginValue, 
    ...fontStyle,
    ...(config.styles?.page || {})
  };

  const isVisible = (key: ResumeSectionKey) => sectionVisibility[key] !== false;

  const isTwoColumn = [
    'magic-modern', 'sidebar-modern', 'canva-inspired', 
    'enhancv-modern', 'enhancv-creative', 'flow-sidebar', 
    'sidebar-light', 'modern-sidebar', 'modern-sidebar-light'
  ].includes(template);

  const isCenteredHeader = [
    'classic-standard', 'google-style', 'ats-standard', 
    'ats-executive', 'ats-minimalist', 'minimalist-clean',
    'timeline-pro', 'functional-skills-standard', 'executive-premium',
    'finance-ats', 'healthcare-ats', 'federal-ats', 'sales-ats'
  ].includes(template) && template !== 'minimalist-clean'; // Minimalist clean is left aligned in UI

  const getTitle = (key: string, defaultTitle: string) => config.titles?.[key] || defaultTitle;

  const sectionTitleStyle = {
    fontSize: customization.sectionTitleSize || 12,
    color: customization.sectionTitleColor || (config.isDark ? '#0ea5e9' : themeColor),
    textTransform: customization.sectionTitleUppercase ? 'uppercase' as const : 'none' as const,
    borderBottomWidth: (customization.sectionTitleBorderStyle === 'underline' || customization.sectionTitleBorderStyle === 'full') ? 1 : 0,
    borderBottomColor: customization.sectionTitleBorderColor || (config.isDark ? '#0ea5e9' : themeColor),
    borderTopWidth: (customization.sectionTitleBorderStyle === 'overline' || customization.sectionTitleBorderStyle === 'full') ? 1 : 0,
    borderTopColor: customization.sectionTitleBorderColor || (config.isDark ? '#0ea5e9' : themeColor),
    ...(config.styles?.sectionTitle || {})
  };

  const bodyStyle = {
    fontSize: customization.bodySize || 10,
    lineHeight: customization.lineHeight || 1.4,
    ...(config.styles?.body || {})
  };

  const itemTitleStyle = {
    fontSize: customization.itemTitleSize || 11,
    color: config.isDark ? '#fff' : '#000',
  };

  const renderSummary = () => isVisible('summary') && data.summary && (
    <View style={styles.section}>
      <Text style={[styles.sectionTitle, sectionTitleStyle]}>{getTitle('summary', 'Profile Summary')}</Text>
      <Text style={[styles.summary, bodyStyle]}>{data.summary}</Text>
    </View>
  );

  const renderExperience = () => isVisible('experience') && data.experience && data.experience.length > 0 && (
    <View style={styles.section}>
      <Text style={[styles.sectionTitle, sectionTitleStyle]}>{getTitle('experience', 'Professional Experience')}</Text>
      {data.experience.map((exp, i) => {
        let content;
        if (template === 'ats-executive' || template === 'ats-standard') {
            content = (
              <View wrap={false} style={{ flexDirection: 'row', gap: 15, marginBottom: 10 }}>
                <View style={{ width: 110 }}>
                  <Text style={[bodyStyle, { fontWeight: 700 }]}>{exp.dates}</Text>
                  <Text style={[bodyStyle, { fontStyle: 'italic', fontSize: bodyStyle.fontSize - 1, color: '#555' }]}>{exp.location}</Text>
                </View>
                <View style={{ flex: 1 }}>
                  <View style={{ flexDirection: 'row', justifyContent: 'space-between', marginBottom: 2 }}>
                    <Text style={[itemTitleStyle, { fontWeight: 700 }]}>{exp.role}</Text>
                    <Text style={[itemTitleStyle, { fontWeight: 700 }]}>{exp.company}</Text>
                  </View>
                  <View style={styles.bulletPointContainer}>
                    {exp.description.map((desc, di) => (
                      <View key={di} style={styles.bulletPoint}>
                        <Text style={[styles.bullet, bodyStyle]}>•</Text>
                        <Text style={[styles.bulletText, bodyStyle]}>{desc}</Text>
                      </View>
                    ))}
                  </View>
                </View>
              </View>
            );
        } else if (template === 'finance-ats' || template === 'sales-ats') {
            content = (
              <View wrap={false} style={{ marginBottom: 10 }}>
                <View style={{ flexDirection: 'row', justifyContent: 'space-between', marginBottom: 2 }}>
                  <Text style={[itemTitleStyle, { fontWeight: 700 }]}>{exp.company}</Text>
                  <Text style={bodyStyle}>{exp.location}</Text>
                </View>
                <View style={{ flexDirection: 'row', justifyContent: 'space-between', marginBottom: 4, borderBottomWidth: template === 'finance-ats' ? 1 : 0, borderBottomColor: '#eee', paddingBottom: template === 'finance-ats' ? 2 : 0 }}>
                  <Text style={[itemTitleStyle, { fontStyle: 'italic', color: '#333' }]}>{exp.role}</Text>
                  <Text style={[bodyStyle, { fontWeight: 700 }]}>{exp.dates}</Text>
                </View>
                <View style={[styles.bulletPointContainer, { marginTop: 2 }]}>
                  {exp.description.map((desc, di) => (
                    <View key={di} style={styles.bulletPoint}>
                      <Text style={[styles.bullet, bodyStyle]}>•</Text>
                      <Text style={[styles.bulletText, bodyStyle]}>{desc}</Text>
                    </View>
                  ))}
                </View>
              </View>
            );
        } else if (template === 'tech-ats' || template === 'product-ats') {
            const separator = template === 'tech-ats' ? '@' : '/';
            content = (
              <View wrap={false} style={{ marginBottom: 10 }}>
                <View style={{ flexDirection: 'row', justifyContent: 'space-between', marginBottom: 4 }}>
                  <View style={{ flexDirection: 'row', flexWrap: 'wrap' }}>
                    <Text style={[itemTitleStyle, { fontWeight: 700 }]}>{exp.role}</Text>
                    <Text style={[itemTitleStyle, { color: '#64748b', marginHorizontal: 4 }]}> {separator} </Text>
                    <Text style={[itemTitleStyle, { fontWeight: 700, color: '#334155' }]}>{exp.company}</Text>
                  </View>
                  <View style={{ flexDirection: 'row' }}>
                    {template === 'tech-ats' && <Text style={[bodyStyle, { color: '#64748b', marginRight: 4 }]}>{exp.location} |</Text>}
                    <Text style={[bodyStyle, { fontWeight: 700, color: '#475569' }]}>{exp.dates}</Text>
                  </View>
                </View>
                <View style={styles.bulletPointContainer}>
                  {exp.description.map((desc, di) => (
                    <View key={di} style={styles.bulletPoint}>
                      <Text style={[styles.bullet, bodyStyle]}>•</Text>
                      <Text style={[styles.bulletText, bodyStyle]}>{desc}</Text>
                    </View>
                  ))}
                </View>
              </View>
            );
        } else if (template === 'healthcare-ats' || template === 'operations-ats') {
            content = (
              <View wrap={false} style={{ marginBottom: 10 }}>
                {template === 'operations-ats' && (
                  <View style={{ flexDirection: 'row', justifyContent: 'space-between', backgroundColor: '#f8fafc', padding: 4, marginBottom: 4 }}>
                    <Text style={[itemTitleStyle, { fontWeight: 700 }]}>{exp.company}</Text>
                    <Text style={bodyStyle}>{exp.location}</Text>
                  </View>
                )}
                <View style={{ flexDirection: 'row', justifyContent: 'space-between', marginBottom: 2 }}>
                  <Text style={[itemTitleStyle, { fontWeight: 700 }]}>{exp.role}</Text>
                  <Text style={[bodyStyle, { fontWeight: 700 }]}>{exp.dates}</Text>
                </View>
                {template === 'healthcare-ats' && (
                  <View style={{ flexDirection: 'row', justifyContent: 'space-between', marginBottom: 4 }}>
                    <Text style={[itemTitleStyle, { fontStyle: 'italic', color: '#333' }]}>{exp.company}</Text>
                    <Text style={bodyStyle}>{exp.location}</Text>
                  </View>
                )}
                <View style={styles.bulletPointContainer}>
                  {exp.description.map((desc, di) => (
                    <View key={di} style={styles.bulletPoint}>
                      <Text style={[styles.bullet, bodyStyle]}>•</Text>
                      <Text style={[styles.bulletText, bodyStyle]}>{desc}</Text>
                    </View>
                  ))}
                </View>
              </View>
            );
        } else if (template === 'federal-ats') {
            content = (
              <View wrap={false} style={{ marginBottom: 12 }}>
                <Text style={[itemTitleStyle, { fontWeight: 700, textTransform: 'uppercase', marginBottom: 2 }]}>{exp.role}</Text>
                <View style={{ paddingLeft: 8, borderLeftWidth: 2, borderLeftColor: '#94a3b8', marginBottom: 4 }}>
                  <Text style={bodyStyle}><Text style={{ fontWeight: 700 }}>Employer: </Text>{exp.company}</Text>
                  <Text style={bodyStyle}><Text style={{ fontWeight: 700 }}>Location: </Text>{exp.location}</Text>
                  <Text style={bodyStyle}><Text style={{ fontWeight: 700 }}>Dates of Employment: </Text>{exp.dates}</Text>
                </View>
                <Text style={[bodyStyle, { fontWeight: 700, textDecoration: 'underline', marginBottom: 2 }]}>Duties, Accomplishments, and Related Skills:</Text>
                <View style={styles.bulletPointContainer}>
                  {exp.description.map((desc, di) => (
                    <View key={di} style={styles.bulletPoint}>
                      <Text style={[styles.bullet, bodyStyle]}>•</Text>
                      <Text style={[styles.bulletText, bodyStyle]}>{desc}</Text>
                    </View>
                  ))}
                </View>
              </View>
            );
        } else {
            content = (
                <View style={styles.experienceItem}>
                  <View style={styles.experienceHeader}>
                    <Text style={[styles.role, itemTitleStyle]}>{exp.role}</Text>
                    <Text style={[styles.company, itemTitleStyle]}>{exp.company}</Text>
                  </View>
                  <View style={styles.experienceSubHeader}>
                    <Text style={{ color: config.isDark ? '#64748b' : '#555' }}>{exp.dates}</Text>
                    <Text style={{ color: config.isDark ? '#64748b' : '#555' }}>{exp.location}</Text>
                  </View>
                  <View style={styles.bulletPointContainer}>
                    {exp.description.map((desc, di) => (
                      <View key={di} style={styles.bulletPoint}>
                        <Text style={[styles.bullet, bodyStyle, { color: config.isDark ? '#0ea5e9' : '#000' }]}>{template === 'tech-focused' ? '>' : '•'}</Text>
                        <Text style={[styles.bulletText, bodyStyle]}>{desc}</Text>
                      </View>
                    ))}
                  </View>
                </View>
            );
        }
        return <React.Fragment key={i}>{content}</React.Fragment>;
      })}
    </View>
  );

  const renderProjects = () => isVisible('projects') && data.projects && data.projects.length > 0 && (
    <View style={styles.section}>
      <Text style={[styles.sectionTitle, sectionTitleStyle]}>{getTitle('projects', 'Projects')}</Text>
      {data.projects.map((proj, i) => {
        if (template.includes('ats')) {
            return (
                <View key={i} wrap={false} style={{ marginBottom: 8 }}>
                    <View style={{ flexDirection: 'row', justifyContent: 'space-between', marginBottom: 2 }}>
                        <Text style={[itemTitleStyle, { fontWeight: 700 }]}>{proj.name}</Text>
                        <Text style={[bodyStyle, { color: '#333' }]}>{proj.startDate} {proj.endDate ? `- ${proj.endDate}` : ''}</Text>
                    </View>
                    <Text style={[bodyStyle, { color: config.isDark ? '#cbd5e1' : '#333', marginBottom: 2 }]}>
                        <Text style={{ fontWeight: 700 }}>Role: </Text> {proj.role} {proj.link ? ` | ${proj.link}` : ''}
                    </Text>
                    <View style={styles.bulletPointContainer}>
                        {proj.description.map((desc, di) => (
                        <View key={di} style={styles.bulletPoint}>
                            <Text style={[styles.bullet, bodyStyle]}>•</Text>
                            <Text style={[styles.bulletText, bodyStyle]}>{desc}</Text>
                        </View>
                        ))}
                    </View>
                </View>
            );
        }
        return (
            <View key={i} style={styles.experienceItem}>
            <View style={styles.experienceHeader}>
                <Text style={[styles.role, itemTitleStyle]}>{proj.name}</Text>
                <Text style={[styles.company, itemTitleStyle]}>{proj.role}</Text>
            </View>
            <View style={styles.experienceSubHeader}>
                <Text style={{ color: config.isDark ? '#64748b' : '#555' }}>{proj.startDate} {proj.endDate ? `- ${proj.endDate}` : ''}</Text>
                <Text style={{ color: config.isDark ? '#64748b' : '#555' }}>{proj.link}</Text>
            </View>
            <View style={styles.bulletPointContainer}>
                {proj.description.map((desc, di) => (
                <View key={di} style={styles.bulletPoint}>
                    <Text style={[styles.bullet, bodyStyle, { color: config.isDark ? '#0ea5e9' : '#000' }]}>{template === 'tech-focused' ? '#' : '•'}</Text>
                    <Text style={[styles.bulletText, bodyStyle]}>{desc}</Text>
                </View>
                ))}
            </View>
            </View>
        );
      })}
    </View>
  );

  const renderEducation = () => isVisible('education') && data.education && data.education.length > 0 && (
    <View style={styles.section}>
      <Text style={[styles.sectionTitle, sectionTitleStyle]}>{getTitle('education', 'Education')}</Text>
      {data.education.map((edu, i) => {
        if (template.includes('ats')) {
           return (
             <View key={i} wrap={false} style={{ marginBottom: 6 }}>
                <View style={{ flexDirection: 'row', justifyContent: 'space-between' }}>
                  <Text style={[itemTitleStyle, { fontWeight: 700 }]}>{edu.degree}</Text>
                  <Text style={[bodyStyle, { fontWeight: 700 }]}>{edu.graduationDate}</Text>
                </View>
                <View style={{ flexDirection: 'row', justifyContent: 'space-between' }}>
                  <Text style={[bodyStyle, { color: '#333' }]}>{edu.institution}</Text>
                  <View style={{ flexDirection: 'row' }}>
                      <Text style={[bodyStyle, { color: config.isDark ? '#64748b' : '#555', marginRight: 8 }]}>{edu.location}</Text>
                      {(edu as any).gpa && <Text style={[bodyStyle, { fontStyle: 'italic', color: '#555' }]}>GPA: {(edu as any).gpa}</Text>}
                  </View>
                </View>
             </View>
           );
        }
        return (
            <View key={i} style={styles.educationItem} wrap={false}>
            <View style={styles.educationHeader}>
                <Text style={[styles.institution, bodyStyle, { fontWeight: 700, color: config.isDark ? '#fff' : '#000' }]}>{edu.institution}</Text>
                <Text style={[styles.date, bodyStyle, { color: config.isDark ? '#0ea5e9' : '#000' }]}>{edu.graduationDate}</Text>
            </View>
            <View style={styles.educationHeader}>
                <Text style={[styles.degree, bodyStyle]}>{edu.degree}</Text>
                <Text style={[bodyStyle, { fontSize: bodyStyle.fontSize - 1, color: config.isDark ? '#64748b' : '#555' }]}>{edu.location}</Text>
            </View>
            </View>
        );
      })}
    </View>
  );

  const renderSkills = () => isVisible('skills') && data.skills && data.skills.length > 0 && (
    <View style={styles.section}>
      <Text style={[styles.sectionTitle, sectionTitleStyle]}>{getTitle('skills', 'Skills')}</Text>
      {data.skills.map((cat, i) => (
        <View key={i} style={styles.skillCategory}>
          <Text style={[styles.skillCategoryName, bodyStyle, { fontWeight: 700, width: isTwoColumn ? '100%' : 100, color: config.isDark ? '#0ea5e9' : '#000' }]}>{cat.name}:</Text>
          <Text style={[styles.skillList, bodyStyle]}>{cat.skills.map(s => s.name).join(', ')}</Text>
        </View>
      ))}
    </View>
  );

  const renderCertifications = () => isVisible('certifications') && data.certifications && data.certifications.length > 0 && (
    <View style={styles.section}>
      <Text style={[styles.sectionTitle, sectionTitleStyle]}>{getTitle('certifications', 'Certifications')}</Text>
      {data.certifications.map((cert, i) => (
        <View key={i} style={{ marginBottom: 2 }}>
          <Text style={bodyStyle}>
            <Text style={{ fontWeight: 700, color: config.isDark ? '#fff' : '#000' }}>{cert.name}</Text>
            {cert.issuer && ` - ${cert.issuer}`}
            {cert.date && ` (${cert.date})`}
          </Text>
        </View>
      ))}
    </View>
  );

  const renderAwards = () => isVisible('awards') && data.awards && data.awards.length > 0 && (
    <View style={styles.section}>
      <Text style={[styles.sectionTitle, sectionTitleStyle]}>{getTitle('awards', 'Awards')}</Text>
      {data.awards.map((award, i) => (
        <View key={i} style={{ marginBottom: 2 }}>
          <Text style={bodyStyle}>
            <Text style={{ fontWeight: 700, color: config.isDark ? '#fff' : '#000' }}>{award.name}</Text>
            {award.issuer && ` - ${award.issuer}`}
            {award.date && ` (${award.date})`}
          </Text>
        </View>
      ))}
    </View>
  );

  const renderKeywords = () => isVisible('keywords') && data.keywords && data.keywords.length > 0 && (
    <View style={styles.section}>
      <Text style={[styles.sectionTitle, sectionTitleStyle]}>{getTitle('keywords', 'Keywords')}</Text>
      <Text style={[bodyStyle, { textAlign: 'left' }]}>{data.keywords.join(', ')}</Text>
    </View>
  );

  return (
    <Document title={`${data.fullName} Resume`}>
      <Page size={customization.pageFormat === 'A4' ? 'A4' : 'LETTER'} style={pageStyle}>
        {isTwoColumn ? (
          <View style={{ flexDirection: 'row', gap: 20 }}>
            {/* Sidebar (Left) */}
            <View style={[{ width: '30%', paddingRight: 10 }, config.styles?.sidebar]}>
              <View style={[styles.header, { textAlign: 'left', marginBottom: 20 }, config.styles?.header]}>
                <Text style={[styles.name, { fontSize: customization.nameSize || 20 }, config.styles?.name]}>{data.fullName}</Text>
                {data.title && <Text style={[styles.title, { fontSize: customization.titleSize || 10 }, config.styles?.title]}>{data.title}</Text>}
              </View>
              
              <View style={[styles.section, { marginBottom: 15 }]}>
                <Text style={[styles.sectionTitle, sectionTitleStyle, { fontSize: 10 }]}>Contact</Text>
                {data.contactInfo.location && <Text style={[bodyStyle, { fontSize: 8 }, config.styles?.contactItem]}>{data.contactInfo.location}</Text>}
                {data.contactInfo.phone && <Text style={[bodyStyle, { fontSize: 8 }, config.styles?.contactItem]}>{data.contactInfo.phone}</Text>}
                {data.contactInfo.email && <Text style={[bodyStyle, { fontSize: 8 }, config.styles?.contactItem]}>{data.contactInfo.email}</Text>}
                {data.contactInfo.linkedin && <Text style={[bodyStyle, { fontSize: 8 }, config.styles?.contactItem]}>LinkedIn</Text>}
              </View>

              {renderSkills()}
              {renderCertifications()}
              {renderAwards()}
            </View>

            {/* Main Content (Right) */}
            <View style={[{ width: '70%' }, config.styles?.main]}>
              {renderSummary()}
              {renderExperience()}
              {renderProjects()}
              {renderEducation()}
              {renderKeywords()}
            </View>
          </View>
        ) : (
          <View style={styles.container}>
            {/* Header */}
            <View style={[styles.header, isCenteredHeader ? { textAlign: 'center' } : { textAlign: 'left' }, config.styles?.header]}>
              <Text style={[styles.name, { fontSize: customization.nameSize || 24 }, config.styles?.name]}>{data.fullName}</Text>
              {data.title && <Text style={[styles.title, { fontSize: customization.titleSize || 12 }, config.styles?.title]}>{data.title}</Text>}
              <View style={[styles.contactRow, isCenteredHeader ? { justifyContent: 'center' } : { justifyContent: 'flex-start' }]}>
                {data.contactInfo.location && <Text style={[styles.contactItem, config.styles?.contactItem]}>{data.contactInfo.location}</Text>}
                {data.contactInfo.phone && <Text style={[styles.contactItem, config.styles?.contactItem]}>• {data.contactInfo.phone}</Text>}
                {data.contactInfo.email && <Text style={[styles.contactItem, config.styles?.contactItem]}>• {data.contactInfo.email}</Text>}
                {data.contactInfo.linkedin && (
                  <Link src={data.contactInfo.linkedin.startsWith('http') ? data.contactInfo.linkedin : `https://${data.contactInfo.linkedin}`} style={[styles.link, styles.contactItem, config.styles?.contactItem]}>
                    • LinkedIn
                  </Link>
                )}
              </View>
            </View>

            {renderSummary()}
            {renderExperience()}
            {renderProjects()}
            {renderEducation()}
            {renderSkills()}
            {renderCertifications()}
            {renderAwards()}
            {renderKeywords()}
          </View>
        )}
        <Text style={[styles.pageNumber, { color: config.isDark ? '#475569' : 'grey' }]} render={({ pageNumber, totalPages }) => (
          `${pageNumber} / ${totalPages}`
        )} fixed />
      </Page>
    </Document>
  );
};
