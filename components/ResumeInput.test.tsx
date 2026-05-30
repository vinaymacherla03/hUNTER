
import React from 'react';
import { render, screen, fireEvent } from '@testing-library/react';
import ResumeInput from './ResumeInput';
import { vi, describe, it, beforeEach, expect } from 'vitest';

describe('ResumeInput Component', () => {
  const mockOnEnhance = vi.fn();
  const mockOnTryDemo = vi.fn();
  const mockOnLoadDraft = vi.fn();
  const mockOnStartFromScratch = vi.fn();

  const defaultProps = {
    onEnhance: mockOnEnhance,
    onTryDemo: mockOnTryDemo,
    draftExists: false,
    onLoadDraft: mockOnLoadDraft,
    onStartFromScratch: mockOnStartFromScratch
  };

  beforeEach(() => {
    vi.clearAllMocks();
  });

  it('renders initial state correctly', () => {
    render(<ResumeInput {...defaultProps} />);
    expect(screen.getByText(/How do you want to start\?/i)).toBeInTheDocument();
    expect(screen.getByText(/Match my uploaded resume/i)).toBeInTheDocument();
    expect(screen.getByText(/Start from scratch/i)).toBeInTheDocument();
  });

  it('navigates to input step and calls onEnhance with correct data', async () => {
    render(<ResumeInput {...defaultProps} />);
    
    // Select "Match my uploaded resume"
    const matchOption = screen.getByText(/Match my uploaded resume/i).closest('button');
    fireEvent.click(matchOption!);
    
    // Click Next
    const nextButton = screen.getByText(/Next/i);
    fireEvent.click(nextButton);
    
    // Now we should be in the input step - wait for it
    expect(await screen.findByText(/Upload Resume Content/i)).toBeInTheDocument();

    const jobTitleInput = screen.getByPlaceholderText(/e\.g\. Software Engineer/i);
    const resumeTextArea = screen.getByPlaceholderText(/Paste your existing resume text here\.\.\./i);
    const jobDescTextArea = screen.getByPlaceholderText(/Paste the job description to tailor your narrative\.\.\./i);
    const submitButton = screen.getByText(/Start Transformation/i);

    fireEvent.change(jobTitleInput, { target: { value: 'Software Engineer' } });
    fireEvent.change(resumeTextArea, { target: { value: 'My resume content' } });
    fireEvent.change(jobDescTextArea, { target: { value: 'Job description' } });

    fireEvent.click(submitButton);

    expect(mockOnEnhance).toHaveBeenCalledWith('My resume content', 'Job description', 'Software Engineer');
  });

  it('calls onTryDemo when "Skip for now" is clicked', () => {
    render(<ResumeInput {...defaultProps} />);
    const skipButton = screen.getByText(/Skip for now/i);
    fireEvent.click(skipButton);
    const skipToDemoBtn = screen.getByText(/Yes, Skip to Demo/i);
    fireEvent.click(skipToDemoBtn);
    expect(mockOnTryDemo).toHaveBeenCalled();
  });

  it('calls onStartFromScratch when "Start from scratch" is selected and Next is clicked', () => {
    render(<ResumeInput {...defaultProps} />);
    
    // Select "Start from scratch"
    const scratchOption = screen.getByText(/Start from scratch/i).closest('button');
    fireEvent.click(scratchOption!);
    
    // Click Next
    const nextButton = screen.getByText(/Next/i);
    fireEvent.click(nextButton);
    
    expect(mockOnStartFromScratch).toHaveBeenCalled();
  });
});
