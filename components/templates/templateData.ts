
import React from 'react';
import { TemplateKey, Customization } from '../../types';
import AtsStandard from './AtsStandard';
import AtsExecutive from './AtsExecutive';
import AtsMinimalist from './AtsMinimalist';
import AtsFinance from './AtsFinance';
import AtsTech from './AtsTech';
import AtsHealthcare from './AtsHealthcare';
import AtsFederal from './AtsFederal';
import AtsSales from './AtsSales';
import AtsProduct from './AtsProduct';
import AtsOperations from './AtsOperations';

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
        key: 'finance-ats',
        name: 'Finance ATS',
        description: 'Industry-standard layout for Finance/Banking. Highly dense, classic serif typography.',
        component: AtsFinance,
        categories: ['True ATS', 'Finance', 'Professional'],
        customization: { font: 'times-new-roman', margin: 'compact', sectionTitleBorderStyle: 'underline' }
    },
    {
        key: 'tech-ats',
        name: 'Tech & Engineering ATS',
        description: 'Optimized for parsing technologies and hard skills. Clean sans-serif layout.',
        component: AtsTech,
        categories: ['True ATS', 'Tech', 'Engineering'],
        customization: { font: 'arial', margin: 'normal', sectionTitleBorderStyle: 'none' }
    },
    {
        key: 'healthcare-ats',
        name: 'Healthcare ATS',
        description: 'Traditional and extremely clean, ensuring all certifications and clinical hours are parsed reliably.',
        component: AtsHealthcare,
        categories: ['True ATS', 'Healthcare', 'Medical'],
        customization: { font: 'calibri', margin: 'normal', sectionTitleBorderStyle: 'overline' }
    },
    {
        key: 'federal-ats',
        name: 'Federal Resume ATS',
        description: 'Detailed, highly-structured layout required for USAJOBS and federal applications.',
        component: AtsFederal,
        categories: ['True ATS', 'Federal', 'Government'],
        customization: { font: 'arial', margin: 'normal', sectionTitleBorderStyle: 'full' }
    },
    {
        key: 'sales-ats',
        name: 'Sales & Marketing ATS',
        description: 'Metrics-focused readable layout designed to highlight KPIs and achievements.',
        component: AtsSales,
        categories: ['True ATS', 'Sales', 'Marketing'],
        customization: { font: 'roboto', margin: 'normal', sectionTitleBorderStyle: 'none' }
    },
    {
        key: 'product-ats',
        name: 'Product & Design ATS',
        description: 'A modern, ATS-friendly single column using clean geometric fonts without breaking parsers.',
        component: AtsProduct,
        categories: ['True ATS', 'Product Manager', 'Design'],
        customization: { font: 'inter', margin: 'spacious', sectionTitleBorderStyle: 'none' }
    },
    {
        key: 'operations-ats',
        name: 'Operations & Supply Chain',
        description: 'Crisp layout optimizing readability for strict supply chain and project management systems.',
        component: AtsOperations,
        categories: ['True ATS', 'Operations', 'Supply Chain'],
        customization: { font: 'georgia', margin: 'normal', sectionTitleBorderStyle: 'underline' }
    }
];
