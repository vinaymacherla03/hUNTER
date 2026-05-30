
import React from 'react';
import { render, screen } from '@testing-library/react';
import ResumePreview from './ResumePreview';
import { vi, describe, it, expect } from 'vitest';
import { ResumeData, Customization } from '../types';

// Mock all templates to simplify testing
vi.mock('./templates/templateData', () => ({
    templates: [
        {
            key: 'modern',
            name: 'Modern Template',
            component: ({ data }: any) => <div data-testid="modern-template">{data.fullName}</div>,
            customization: {}
        },
        {
            key: 'minimal',
            name: 'Minimal Template',
            component: ({ data }: any) => <div data-testid="minimal-template">{data.fullName}</div>,
            customization: {}
        }
    ]
}));

describe('ResumePreview Component', () => {
    const mockResumeData: ResumeData = {
        fullName: 'John Doe',
        title: 'Software Engineer',
        contactInfo: {
            email: 'john@example.com',
            phone: '1234567890',
            location: 'New York',
            linkedin: '',
            github: '',
            portfolio: ''
        },
        summary: 'Experienced developer',
        experience: [],
        education: [],
        skills: [],
        projects: [],
        certifications: [],
        awards: [],
        keywords: []
    };

    const mockCustomization: Customization = {
        color: 'slate',
        font: 'inter',
        margin: 'normal',
        nameSize: 24,
        titleSize: 16,
        sectionTitleSize: 14,
        itemTitleSize: 12,
        bodySize: 10,
        lineHeight: 1.5,
        sectionTitleColor: '#000',
        sectionTitleBorderStyle: 'none',
        sectionTitleBorderColor: '#ccc',
        sectionTitleUppercase: true
    };

    const defaultProps = {
        data: mockResumeData,
        customization: mockCustomization,
        sectionOrder: ['summary', 'experience'] as any,
        sectionVisibility: { summary: true, experience: true } as any,
        onDataChange: vi.fn(),
    };

    it('renders the default template if none specified', () => {
        render(<ResumePreview {...defaultProps} />);
        expect(screen.getByTestId('modern-template')).toBeInTheDocument();
        expect(screen.getByText('John Doe')).toBeInTheDocument();
    });

    it('renders the specified template', () => {
        render(<ResumePreview {...defaultProps} templateId="minimal" />);
        expect(screen.getByTestId('minimal-template')).toBeInTheDocument();
        expect(screen.getByText('John Doe')).toBeInTheDocument();
    });

    it('applies font class correctly', () => {
        const { container } = render(
            <ResumePreview 
                {...defaultProps} 
                customization={{ ...mockCustomization, font: 'roboto' }} 
            />
        );
        const previewContainer = container.firstChild as HTMLElement;
        expect(previewContainer.className).toContain('font-roboto');
    });

    it('applies margin correctly', () => {
        render(<ResumePreview {...defaultProps} customization={{ ...mockCustomization, margin: 'compact' }} />);
        const resumeContainer = document.getElementById('resume-container-for-download');
        expect(resumeContainer?.style.padding).toBe('0.4in');
    });
});
