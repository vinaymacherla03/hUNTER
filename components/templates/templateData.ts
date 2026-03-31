
import React from 'react';
import { TemplateKey, Customization } from '../../types';
import SidebarModern from './SidebarModern';
import MinimalistClean from './MinimalistClean';
import ElegantSerif from './ElegantSerif';
import TechFocused from './TechFocused';
import BoldImpact from './BoldImpact';
import GoogleStyle from './GoogleStyle';
import CanvaInspired from './CanvaInspired';
import GridProfessional from './GridProfessional';
import TimelineModern from './TimelineModern';
import FunctionalSkillsPro from './FunctionalSkillsPro';
import ModernSidebarRight from './ModernSidebarRight';
import CreativeGradient from './CreativeGradient';
import ExecutivePremium from './ExecutivePremium';
import AtsStandard from './AtsStandard';
import AtsExecutive from './AtsExecutive';
import AtsMinimalist from './AtsMinimalist';
import EnhancvModern from './EnhancvModern';
import EnhancvProfessional from './EnhancvProfessional';
import EnhancvCreative from './EnhancvCreative';
import EnhancvMinimal from './EnhancvMinimal';
import EnhancvClassic from './EnhancvClassic';
import FlowModern from './FlowModern';
import FlowSidebar from './FlowSidebar';
import FlowMinimal from './FlowMinimal';

export interface TemplateInfo {
    key: TemplateKey;
    name: string;
    description: string;
    component: React.FC<any>; 
    categories: string[];
    customization: Partial<Customization>;
}

export const templates: TemplateInfo[] = [
    {
        key: 'ats-standard',
        name: 'True ATS Standard',
        description: 'Strictly follows Resume Worded design principles for 100% ATS compatibility.',
        component: AtsStandard,
        categories: ['True ATS', 'ATS Friendly', 'Professional'],
        customization: { font: 'times-new-roman', margin: 'normal' }
    },
    {
        key: 'ats-executive',
        name: 'True ATS Executive',
        description: 'A high-impact, single-column layout optimized for senior roles and ATS parsers.',
        component: AtsExecutive,
        categories: ['True ATS', 'ATS Friendly', 'Professional'],
        customization: { font: 'times-new-roman', margin: 'normal' }
    },
    {
        key: 'ats-minimalist',
        name: 'True ATS Minimalist',
        description: 'The most reliable ATS-friendly layout. Zero distractions, maximum compatibility.',
        component: AtsMinimalist,
        categories: ['True ATS', 'ATS Friendly', 'Minimalist'],
        customization: { font: 'times-new-roman', margin: 'normal' }
    },
    {
        key: 'minimalist-clean',
        name: 'Minimalist Clean',
        description: 'Ultra-clean design with bold accents and plenty of whitespace.',
        component: MinimalistClean,
        categories: ['Minimalist', 'Modern'],
        customization: { font: 'times-new-roman', color: 'slate' }
    },
    {
        key: 'sidebar-modern',
        name: 'Sidebar Modern',
        description: 'A stylish two-column layout with a dark sidebar for contact and skills.',
        component: SidebarModern,
        categories: ['Modern', 'Creative'],
        customization: { font: 'montserrat', color: 'slate' }
    },
    {
        key: 'elegant-serif',
        name: 'Elegant Serif',
        description: 'Sophisticated design using classic serif fonts for a premium look.',
        component: ElegantSerif,
        categories: ['Professional', 'Classic'],
        customization: { font: 'lora', color: 'slate' }
    },
    {
        key: 'tech-focused',
        name: 'Tech Focused',
        description: 'A developer-centric theme with monospace accents and a dark mode aesthetic.',
        component: TechFocused,
        categories: ['Modern', 'Tech'],
        customization: { font: 'jetbrains-mono', color: 'emerald' }
    },
    {
        key: 'bold-impact',
        name: 'Bold Impact',
        description: 'Strong headers and high contrast for a resume that stands out.',
        component: BoldImpact,
        categories: ['Modern', 'Creative'],
        customization: { font: 'montserrat', color: 'slate' }
    },
    {
        key: 'google-style',
        name: 'Google Style',
        description: 'Inspired by the clean, functional design of Google resume templates.',
        component: GoogleStyle,
        categories: ['ATS Friendly', 'Professional'],
        customization: { font: 'times-new-roman', color: 'slate' }
    },
    {
        key: 'canva-inspired',
        name: 'Canva Inspired',
        description: 'Modern, vibrant design with a focus on visual hierarchy and style.',
        component: CanvaInspired,
        categories: ['Creative', 'Modern'],
        customization: { font: 'poppins', color: 'rose' }
    },
    {
        key: 'grid-professional',
        name: 'Grid Professional',
        description: 'A structured grid-based layout for a balanced and organized look.',
        component: GridProfessional,
        categories: ['Professional', 'Modern'],
        customization: { font: 'jakarta', color: 'slate' }
    },
    {
        key: 'timeline-modern',
        name: 'Timeline Modern',
        description: 'Visualizes your career path with a clean, vertical timeline.',
        component: TimelineModern,
        categories: ['Modern', 'Creative'],
        customization: { font: 'times-new-roman', color: 'slate' }
    },
    {
        key: 'functional-skills',
        name: 'Functional Skills',
        description: 'Prioritizes skills and competencies over chronological experience.',
        component: FunctionalSkillsPro,
        categories: ['Modern', 'Professional'],
        customization: { font: 'times-new-roman', color: 'slate' }
    },
    {
        key: 'sidebar-right',
        name: 'Modern Sidebar Right',
        description: 'A variant of the sidebar layout with the sidebar on the right.',
        component: ModernSidebarRight,
        categories: ['Modern', 'Creative'],
        customization: { font: 'montserrat', color: 'slate' }
    },
    {
        key: 'creative-gradient',
        name: 'Creative Gradient',
        description: 'A vibrant, energetic design with colorful gradients.',
        component: CreativeGradient,
        categories: ['Creative', 'Modern'],
        customization: { font: 'poppins', color: 'rose' }
    },
    {
        key: 'executive-premium',
        name: 'Executive Premium',
        description: 'A high-end, sophisticated design for senior leadership roles.',
        component: ExecutivePremium,
        categories: ['Professional', 'Modern'],
        customization: { font: 'lora', color: 'slate' }
    },
    {
        key: 'enhancv-modern',
        name: 'Enhancv Modern',
        description: 'A high-density, two-column layout inspired by Enhancv for maximum impact.',
        component: EnhancvModern,
        categories: ['Modern', 'Creative', 'Enhancv'],
        customization: { font: 'inter', color: 'blue' }
    },
    {
        key: 'enhancv-professional',
        name: 'Enhancv Professional',
        description: 'A bold, single-column professional layout with strong visual hierarchy.',
        component: EnhancvProfessional,
        categories: ['Professional', 'ATS Friendly', 'Enhancv'],
        customization: { font: 'inter', color: 'blue' }
    },
    {
        key: 'enhancv-creative',
        name: 'Enhancv Creative',
        description: 'A dynamic, colorful design with a right-hand sidebar for a unique look.',
        component: EnhancvCreative,
        categories: ['Creative', 'Modern', 'Enhancv'],
        customization: { font: 'poppins', color: 'rose' }
    },
    {
        key: 'enhancv-minimal',
        name: 'Enhancv Minimal',
        description: 'A clean, high-density minimalist layout with subtle accents.',
        component: EnhancvMinimal,
        categories: ['Minimalist', 'Modern', 'Enhancv'],
        customization: { font: 'inter', color: 'blue' }
    },
    {
        key: 'enhancv-classic',
        name: 'Enhancv Classic',
        description: 'A traditional layout with bold Enhancv-style typography and section dots.',
        component: EnhancvClassic,
        categories: ['Professional', 'Classic', 'Enhancv'],
        customization: { font: 'inter', color: 'slate' }
    },
    {
        key: 'flow-modern',
        name: 'Flow Modern',
        description: 'A clean, modern layout inspired by FlowCV with a centered header and balanced whitespace.',
        component: FlowModern,
        categories: ['Modern', 'Professional', 'FlowCV'],
        customization: { font: 'inter', color: 'blue' }
    },
    {
        key: 'flow-sidebar',
        name: 'Flow Sidebar',
        description: 'A classic two-column design with a distinct sidebar for contact details and skills.',
        component: FlowSidebar,
        categories: ['Modern', 'Creative', 'FlowCV'],
        customization: { font: 'inter', color: 'blue' }
    },
    {
        key: 'flow-minimal',
        name: 'Flow Minimal',
        description: 'An ultra-minimalist, high-density layout for a sleek and professional look.',
        component: FlowMinimal,
        categories: ['Minimalist', 'Modern', 'FlowCV'],
        customization: { font: 'inter', color: 'slate' }
    }
];
