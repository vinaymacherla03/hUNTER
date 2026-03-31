import { ResumeData } from '../types';

export const generateResumePlainText = (resumeData: ResumeData): string => {
    let text = `${resumeData.fullName}\n`;
    if (resumeData.title) text += `${resumeData.title}\n`;
    text += `\nCONTACT INFO\n`;
    text += `Location: ${resumeData.contactInfo.location}\n`;
    text += `Phone: ${resumeData.contactInfo.phone}\n`;
    text += `Email: ${resumeData.contactInfo.email}\n`;
    if (resumeData.contactInfo.linkedin) text += `LinkedIn: ${resumeData.contactInfo.linkedin}\n`;
    if (resumeData.contactInfo.github) text += `GitHub: ${resumeData.contactInfo.github}\n`;
    if (resumeData.contactInfo.portfolio) text += `Portfolio: ${resumeData.contactInfo.portfolio}\n`;
    
    if (resumeData.summary) {
        text += `\nSUMMARY\n${resumeData.summary}\n`;
    }
    
    if (resumeData.experience && resumeData.experience.length > 0) {
        text += `\nEXPERIENCE\n`;
        resumeData.experience.forEach(exp => {
            text += `\n${exp.role} | ${exp.company} | ${exp.location} | ${exp.dates}\n`;
            exp.description.forEach(desc => {
                text += `- ${desc}\n`;
            });
        });
    }
    
    if (resumeData.education && resumeData.education.length > 0) {
        text += `\nEDUCATION\n`;
        resumeData.education.forEach(edu => {
            text += `\n${edu.degree} | ${edu.institution} | ${edu.location} | ${edu.graduationDate}\n`;
        });
    }
    
    if (resumeData.skills && resumeData.skills.length > 0) {
        text += `\nSKILLS\n`;
        resumeData.skills.forEach(cat => {
            text += `${cat.name}: ${cat.skills.map(s => s.name).join(', ')}\n`;
        });
    }
    
    if (resumeData.projects && resumeData.projects.length > 0) {
        text += `\nPROJECTS\n`;
        resumeData.projects.forEach(proj => {
            text += `\n${proj.name} | ${proj.role}\n`;
            proj.description.forEach(desc => {
                text += `- ${desc}\n`;
            });
        });
    }

    if (resumeData.certifications && resumeData.certifications.length > 0) {
        text += `\nCERTIFICATIONS\n`;
        resumeData.certifications.forEach(cert => {
            text += `${cert.name} | ${cert.issuer} | ${cert.date}\n`;
        });
    }

    if (resumeData.awards && resumeData.awards.length > 0) {
        text += `\nAWARDS\n`;
        resumeData.awards.forEach(award => {
            text += `${award.name} | ${award.issuer} | ${award.date}\n`;
        });
    }

    if (resumeData.keywords && resumeData.keywords.length > 0) {
        text += `\nKEYWORDS\n`;
        text += resumeData.keywords.join(', ') + '\n';
    }
    
    return text;
};
