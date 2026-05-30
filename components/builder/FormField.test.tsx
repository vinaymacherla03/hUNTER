
import React from 'react';
import { render, screen, fireEvent } from '@testing-library/react';
import FormField from './FormField';
import { useGrammarCheck } from '../../hooks/useGrammarCheck';
import { vi, describe, it, beforeEach, expect } from 'vitest';

// Mock the hook
vi.mock('../../hooks/useGrammarCheck');

const mockUseGrammarCheck = useGrammarCheck as any;

describe('FormField Component', () => {
  beforeEach(() => {
    mockUseGrammarCheck.mockReturnValue({
      isChecking: false,
      result: null,
      clearParams: vi.fn(),
    });
  });

  it('renders label and input correctly', () => {
    render(
      <FormField 
        label="Test Label" 
        name="testName" 
        value="" 
        onChange={() => {}} 
      />
    );
    
    // Check for label text
    expect(screen.getByText('Test Label')).toBeInTheDocument();
    // Check for input with correct name
    const input = document.querySelector('input[name="testName"]');
    expect(input).toBeInTheDocument();
  });

  it('renders textarea when specified', () => {
    render(
      <FormField 
        label="Test Area" 
        name="testArea" 
        value="" 
        onChange={() => {}} 
        as="textarea" 
      />
    );
    
    const textarea = document.querySelector('textarea[name="testArea"]');
    expect(textarea).toBeInTheDocument();
  });

  it('calls onChange handler when input value changes', () => {
    const handleChange = vi.fn();
    render(
      <FormField 
        label="Test Input" 
        name="testInput" 
        value="" 
        onChange={handleChange} 
      />
    );

    const input = document.querySelector('input[name="testInput"]') as HTMLInputElement;
    fireEvent.change(input, { target: { value: 'New Value' } });
    
    expect(handleChange).toHaveBeenCalled();
  });

  it('displays grammar indicator when result is present', () => {
    mockUseGrammarCheck.mockReturnValue({
        isChecking: false,
        result: { corrected: "Fixed", issues: [{ original: "Error", suggestion: "Fix", reason: "Test" }] },
        clearParams: vi.fn()
    });

    render(
        <FormField 
          label="Grammar Test" 
          name="grammarTest" 
          value="Error" 
          onChange={() => {}} 
          as="textarea"
        />
    );
    
    const textarea = document.querySelector('textarea[name="grammarTest"]') as HTMLTextAreaElement;
    fireEvent.focus(textarea);
    
    // Check for the indicator button (it has a title with the number of improvements)
    expect(screen.getByTitle(/1 improvement\(s\) available/i)).toBeInTheDocument();
  });
});
