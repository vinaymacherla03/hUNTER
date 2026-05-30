
import React from 'react';
import { render, screen, fireEvent, waitFor } from '@testing-library/react';
import TemplateSelector from './TemplateSelector';
import { vi, describe, it, beforeEach, expect } from 'vitest';
import { templates } from './templates/templateData';

// Mock ResumePreview to avoid complex rendering
vi.mock('./ResumePreview', () => ({
    default: ({ templateId }: { templateId: string }) => <div data-testid={`preview-${templateId}`}>Preview {templateId}</div>
}));

// Mock templates data if needed, but we can use the real one if it's just data
// However, to make tests stable, let's mock a subset
vi.mock('./templates/templateData', () => ({
    templates: [
        { key: 'modern', name: 'Modern', categories: ['Professional'], customization: {} },
        { key: 'minimal', name: 'Minimal', categories: ['Minimalist'], customization: {} },
        { key: 'ats', name: 'ATS', categories: ['True ATS'], customization: {} },
    ]
}));

describe('TemplateSelector Component', () => {
    const mockOnTemplateChange = vi.fn();
    const mockResumeData = { fullName: 'John Doe' } as any;

    beforeEach(() => {
        vi.clearAllMocks();
    });

    it('renders categories correctly', () => {
        render(
            <TemplateSelector 
                currentTemplate="modern" 
                onTemplateChange={mockOnTemplateChange} 
                resumeData={mockResumeData} 
            />
        );

        expect(screen.getByRole('button', { name: /^All$/i })).toBeInTheDocument();
        expect(screen.getByRole('button', { name: /^True ATS$/i })).toBeInTheDocument();
        expect(screen.getByRole('button', { name: /^Professional$/i })).toBeInTheDocument();
        expect(screen.getByRole('button', { name: /^Minimalist$/i })).toBeInTheDocument();
    });

    it('filters templates when a category is clicked', async () => {
        render(
            <TemplateSelector 
                currentTemplate="modern" 
                onTemplateChange={mockOnTemplateChange} 
                resumeData={mockResumeData} 
            />
        );

        // Initially shows all
        expect(screen.getByText('Modern')).toBeInTheDocument();
        expect(screen.getByText('Minimal')).toBeInTheDocument();
        expect(screen.getByText('ATS')).toBeInTheDocument();

        // Click Minimalist button exactly
        fireEvent.click(screen.getByRole('button', { name: /^Minimalist$/i }));

        // Wait for exit animations
        await waitFor(() => {
            expect(screen.queryByText('Modern')).not.toBeInTheDocument();
            expect(screen.queryByText('ATS')).not.toBeInTheDocument();
        });
        
        expect(screen.getByText('Minimal')).toBeInTheDocument();
    });

    it('calls onTemplateChange when a template is clicked', () => {
        render(
            <TemplateSelector 
                currentTemplate="modern" 
                onTemplateChange={mockOnTemplateChange} 
                resumeData={mockResumeData} 
            />
        );

        const minimalTemplate = screen.getByText('Minimal').closest('[role="button"]');
        fireEvent.click(minimalTemplate!);

        expect(mockOnTemplateChange).toHaveBeenCalledWith('minimal');
    });

    it('highlights the current template', () => {
        render(
            <TemplateSelector 
                currentTemplate="modern" 
                onTemplateChange={mockOnTemplateChange} 
                resumeData={mockResumeData} 
            />
        );

        // The active template has a checkmark icon (svg)
        const modernCard = screen.getByText('Modern').closest('.group');
        expect(modernCard?.querySelector('svg')).toBeInTheDocument();

        const minimalCard = screen.getByText('Minimal').closest('.group');
        expect(minimalCard?.querySelector('svg')).not.toBeInTheDocument();
    });
});
