
import React from 'react';
import { render, screen, fireEvent } from '@testing-library/react';
import ResumeInput from './ResumeInput';

// Fix for missing Jest types in this context
declare const jest: any;
declare const describe: any;
declare const it: any;
declare const beforeEach: any;
declare const expect: any;

describe('ResumeInput Component', () => {
  const mockOnEnhance = jest.fn();
  const mockOnTryDemo = jest.fn();
  const mockOnLoadDraft = jest.fn();

  beforeEach(() => {
    jest.clearAllMocks();
  });

  it('renders initial state correctly', () => {
    render(
      <ResumeInput 
        onEnhance={mockOnEnhance} 
        onTryDemo={mockOnTryDemo} 
        draftExists={false} 
        onLoadDraft={mockOnLoadDraft} 
      />
    );

    expect(screen.getByText('Create Your Resume')).toBeInTheDocument();
    // Check for the Paste Resume tab being active by default
    expect(screen.getByPlaceholderText(/Simply paste your entire resume here/i)).toBeInTheDocument();
  });

  it('switches between Resume and Job tabs', () => {
    render(
      <ResumeInput 
        onEnhance={mockOnEnhance} 
        onTryDemo={mockOnTryDemo} 
        draftExists={false} 
        onLoadDraft={mockOnLoadDraft} 
      />
    );

    const jobTabButton = screen.getByText(/Add Job Description/i);
    fireEvent.click(jobTabButton);

    // Check if job description textarea is visible
    expect(screen.getByPlaceholderText(/For a resume that's 90%\+ tailored/i)).toBeInTheDocument();
    
    const resumeTabButton = screen.getByText(/Paste Your Resume/i);
    fireEvent.click(resumeTabButton);
    
    // Check if resume textarea is visible again
    expect(screen.getByPlaceholderText(/Simply paste your entire resume here/i)).toBeInTheDocument();
  });

  it('displays error when enhancing without resume text', () => {
    render(
      <ResumeInput 
        onEnhance={mockOnEnhance} 
        onTryDemo={mockOnTryDemo} 
        draftExists={false} 
        onLoadDraft={mockOnLoadDraft} 
      />
    );

    const enhanceButton = screen.getByText('Enhance My Resume');
    fireEvent.click(enhanceButton);

    expect(screen.getByText('Please paste your resume text before enhancing.')).toBeInTheDocument();
    expect(mockOnEnhance).not.toHaveBeenCalled();
  });

  it('calls onEnhance with correct data when form is submitted', () => {
    render(
      <ResumeInput 
        onEnhance={mockOnEnhance} 
        onTryDemo={mockOnTryDemo} 
        draftExists={false} 
        onLoadDraft={mockOnLoadDraft} 
      />
    );

    // Fill in Resume Text
    const resumeTextarea = screen.getByPlaceholderText(/Simply paste your entire resume here/i);
    fireEvent.change(resumeTextarea, { target: { value: 'My Resume Content' } });

    // Fill in Job Title
    const jobTitleInput = screen.getByPlaceholderText(/e.g., Senior Software Engineer/i);
    fireEvent.change(jobTitleInput, { target: { value: 'Frontend Dev' } });

    // Switch to Job Description and fill it
    const jobTabButton = screen.getByText(/Add Job Description/i);
    fireEvent.click(jobTabButton);
    
    const jobDescTextarea = screen.getByPlaceholderText(/For a resume that's 90%\+ tailored/i);
    fireEvent.change(jobDescTextarea, { target: { value: 'Job Req Content' } });

    const enhanceButton = screen.getByText('Enhance My Resume');
    fireEvent.click(enhanceButton);

    expect(mockOnEnhance).toHaveBeenCalledWith('My Resume Content', 'Job Req Content', 'Frontend Dev');
  });

  it('calls onTryDemo when demo button is clicked', () => {
    render(
      <ResumeInput 
        onEnhance={mockOnEnhance} 
        onTryDemo={mockOnTryDemo} 
        draftExists={false} 
        onLoadDraft={mockOnLoadDraft} 
      />
    );

    const demoButton = screen.getByText('...or try a demo');
    fireEvent.click(demoButton);

    expect(mockOnTryDemo).toHaveBeenCalled();
  });
});
