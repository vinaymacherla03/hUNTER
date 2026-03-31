
import React from 'react';
import { render, screen, fireEvent } from '@testing-library/react';
import FormField from './FormField';
import { useGrammarCheck } from '../../hooks/useGrammarCheck';

// Fix for missing Jest types in this context
declare const jest: any;
declare const describe: any;
declare const it: any;
declare const beforeEach: any;
declare const expect: any;

// Mock the hook
jest.mock('../../hooks/useGrammarCheck');

const mockUseGrammarCheck = useGrammarCheck as any;

describe('FormField Component', () => {
  beforeEach(() => {
    mockUseGrammarCheck.mockReturnValue({
      isChecking: false,
      result: null,
      clearParams: jest.fn(),
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
    const handleChange = jest.fn();
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

  it('displays grammar checking styles when result is present', () => {
    mockUseGrammarCheck.mockReturnValue({
        isChecking: false,
        result: { corrected: "Fixed", issues: [{ original: "Error", suggestion: "Fix", reason: "Test" }] },
        clearParams: jest.fn()
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
    // Simulate focus to ensure hook logic triggers if dependent on focus
    fireEvent.focus(textarea);
    
    // Check for the class that indicates grammar check results (amber styling)
    expect(textarea.className).toContain('ring-amber-200');
  });
});
