

import { FunctionDeclaration, Type } from "@google/genai";

export const changeStyleDeclaration: FunctionDeclaration = {
  name: 'changeStyle',
  parameters: {
    type: Type.OBJECT,
    description: 'Change a visual style property of the resume.',
    properties: {
      property: {
        type: Type.STRING,
        description: "The style property to change. Valid options are 'color', 'font', 'margin', 'nameSize', 'titleSize', 'sectionTitleSize', 'itemTitleSize', 'bodySize', or 'lineHeight'.",
        enum: ['color', 'font', 'margin', 'nameSize', 'titleSize', 'sectionTitleSize', 'itemTitleSize', 'bodySize', 'lineHeight']
      },
      value: {
        type: Type.STRING,
        description: "The new value for the style property. For 'color', valid values are 'indigo', 'blue', 'emerald', 'rose', 'slate'. For 'font', valid values are 'inter', 'roboto', 'lato', 'montserrat', 'source-sans', 'lora', 'roboto-mono'. For 'margin', valid values are 'compact', 'normal', 'spacious'. For size properties, provide a number as a string (e.g., '28'). For 'lineHeight', provide a number as a string (e.g., '1.5')."
      }
    },
    required: ['property', 'value']
  }
};

export const getSkillSuggestionsDeclaration: FunctionDeclaration = {
    name: 'getSkillSuggestions',
    parameters: {
        type: Type.OBJECT,
        description: 'Get AI-powered skill suggestions based on a job description. The agent must ask the user for a job description if one is not provided in the command.',
        properties: {
            jobDescription: {
                type: Type.STRING,
                description: 'The job description to analyze for skill suggestions.'
            }
        },
        required: ['jobDescription']
    }
};

export const navigateDeclaration: FunctionDeclaration = {
    name: 'navigate',
    parameters: {
        type: Type.OBJECT,
        description: 'Navigate to a specific section in the resume builder.',
        properties: {
            section: {
                type: Type.STRING,
                description: 'The section to navigate to.',
                enum: ['contact', 'experience', 'projects', 'education', 'skills', 'certifications', 'awards', 'summary', 'finalize', 'template', 'style', 'layout', 'ai-tools', 'job-match'] // Added new accordion IDs
            }
        },
        required: ['section']
    }
};

export const setVisibilityDeclaration: FunctionDeclaration = {
    name: 'setSectionVisibility',
    parameters: {
        type: Type.OBJECT,
        description: 'Show or hide a section on the resume.',
        properties: {
            section: {
                type: Type.STRING,
                description: 'The section to show or hide.',
                enum: ['summary', 'experience', 'projects', 'education', 'certifications', 'skills', 'awards']
            }
        },
        required: ['section', 'visible']
    }
};

export const googleMapsDeclaration: FunctionDeclaration = {
  name: 'googleMaps',
  parameters: {
    type: Type.OBJECT,
    description: 'Provides information about places and locations using Google Maps. Can be used to find nearby businesses, get directions, or learn about geographical features. Requires user location for `nearby` queries.',
    properties: {
      query: {
        type: Type.STRING,
        description: 'The search query for Google Maps (e.g., "Italian restaurants near me", "Eiffel Tower", "directions to Google NYC").',
      },
      latitude: {
        type: Type.NUMBER,
        description: 'The latitude of the user\'s current location. Required for "near me" type queries.',
      },
      longitude: {
        type: Type.NUMBER,
        description: 'The longitude of the user\'s current location. Required for "near me" type queries.',
      },
    },
    required: ['query'],
  },
};

export const allToolDeclarations = [changeStyleDeclaration, getSkillSuggestionsDeclaration, navigateDeclaration, setVisibilityDeclaration, googleMapsDeclaration];