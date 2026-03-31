
import { ResumeData } from '../types';

export const sampleResumeData: ResumeData = {
    fullName: 'Sophia Smith',
    title: '3D Artist',
    contactInfo: {
        email: 'Sophia.Smith@example.com',
        phone: '(555)555-5555',
        linkedin: 'linkedin.com/in/sophiasmith',
        location: 'Chicago, IL 60614',
        github: 'github.com/sophiasmith'
    },
    summary: "Dynamic 3D Artist with 6 years' experience in modeling, rendering, and animation. Proven track record in enhancing project efficiency by up to 40%. Expert in cutting-edge design software and VR/AR environments.",
    experience: [
        {
            id: 'exp1',
            role: '3D Artist',
            company: 'Visionary Media Studios',
            location: 'Chicago, IL',
            dates: '04/2023 – 05/2025',
            description: [
                'Created 150+ models for animation',
                'Enhanced rendering speed by 30%',
                'Worked on 3 award-winning projects'
            ]
        },
        {
            id: 'exp2',
            role: '3D Modeler',
            company: 'Interactive Gaming Creations',
            location: 'Springfield, IL',
            dates: '02/2021 – 03/2023',
            description: [
                'Developed 100+ objects from concepts',
                'Optimized textures by 25% for export',
                'Collaborated on AAA game launch'
            ]
        },
        {
            id: 'exp3',
            role: '3D Visualization Specialist',
            company: 'Creative Design Dynamics',
            location: 'Chicago, IL',
            dates: '01/2019 – 01/2021',
            description: [
                'Produced high-res renders for 20 clients',
                'Reduced project costs by 15% through CAD',
                'Led team workshops for process improvement'
            ]
        }
    ],
    projects: [],
    education: [
        {
            id: 'edu1',
            degree: "Master's, Digital Arts",
            institution: 'University of Southern California',
            location: 'Los Angeles, California',
            graduationDate: '06/2018',
        },
        {
            id: 'edu2',
            degree: "Bachelor's, Graphic Design",
            institution: 'California State University',
            location: 'Long Beach, California',
            graduationDate: '05/2016',
        }
    ],
    skills: [
        {
            id: 'skill_cat_1',
            name: 'Skills',
            skills: [
                { id: 's1', name: '3D modeling', proficiency: 'Expert' },
                { id: 's2', name: 'Texturing', proficiency: 'Advanced' },
                { id: 's3', name: 'Rendering', proficiency: 'Advanced' },
                { id: 's4', name: 'Animation', proficiency: 'Advanced' },
                { id: 's5', name: 'CAD software', proficiency: 'Expert' },
                { id: 's6', name: 'Digital sculpting', proficiency: 'Advanced' },
                { id: 's7', name: 'Shading techniques', proficiency: 'Intermediate' },
                { id: 's8', name: 'VR/AR development', proficiency: 'Intermediate' },
            ]
        }
    ],
    certifications: [
        { id: 'cert1', name: 'Certified 3D Graphics Professional', issuer: 'National Center for Media Technology', date: '' },
        { id: 'cert2', name: 'VR & AR Development Specialist', issuer: 'Immersive Tech Institute', date: '' },
    ],
    awards: []
};
