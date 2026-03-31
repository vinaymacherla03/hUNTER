
import React, { useState } from 'react';
import { Joyride, Step, EventData, STATUS } from 'react-joyride';

interface OnboardingTourProps {
  run: boolean;
  onFinish: () => void;
}

const OnboardingTour: React.FC<OnboardingTourProps> = ({ run, onFinish }) => {
  const [steps] = useState<Step[]>([
    {
      target: 'body',
      content: (
        <div className="text-left">
          <h3 className="text-lg font-bold mb-2">Welcome to ResumeStudio! 🚀</h3>
          <p>Let's take a quick tour of your new career command center.</p>
        </div>
      ),
      placement: 'center',
    },
    {
      target: '#tour-editor-btn',
      content: (
        <div className="text-left">
          <h3 className="text-md font-bold mb-1">AI Resume Builder</h3>
          <p>This is where the magic happens. Edit your content, apply AI enhancements, and see real-time previews.</p>
        </div>
      ),
    },
    {
      target: '#tour-content-tab',
      content: (
        <div className="text-left">
          <h3 className="text-md font-bold mb-1">Content Editor</h3>
          <p>Fill in your details section by section. Our AI helps you write impactful bullet points.</p>
        </div>
      ),
    },
    {
      target: '#tour-style-tab',
      content: (
        <div className="text-left">
          <h3 className="text-md font-bold mb-1">Design & Style</h3>
          <p>Customize fonts, colors, and layouts to make your resume stand out.</p>
        </div>
      ),
    },
    {
      target: '#tour-match-tab',
      content: (
        <div className="text-left">
          <h3 className="text-md font-bold mb-1">ATS Match</h3>
          <p>Paste a job description to see how well your resume matches and get optimization tips.</p>
        </div>
      ),
    },
    {
      target: '#tour-interview-tab',
      content: (
        <div className="text-left">
          <h3 className="text-md font-bold mb-1">Interview Prep</h3>
          <p>Generate tailored interview questions based on your resume and the target job.</p>
        </div>
      ),
    },
    {
      target: '#tour-hub-tab',
      content: (
        <div className="text-left">
          <h3 className="text-md font-bold mb-1">Career Intelligence Hub</h3>
          <p>Your command center for strategy, real-time market trends, salary data, and a brutal resume scorecard.</p>
        </div>
      ),
    },
    {
      target: '#tour-tracker-btn',
      content: (
        <div className="text-left">
          <h3 className="text-md font-bold mb-1">Application Tracker</h3>
          <p>Switch to the Tracker to manage your job applications, interviews, and offers in one place.</p>
        </div>
      ),
    },
    {
      target: 'body',
      content: (
        <div className="text-left">
          <h3 className="text-lg font-bold mb-2">You're all set! 🎯</h3>
          <p>Start building your dream career today. If you need help, our AI agent is always here for you.</p>
        </div>
      ),
      placement: 'center',
    },
  ]);

  const handleJoyrideCallback = (data: EventData) => {
    const { status } = data;
    if ([STATUS.FINISHED, STATUS.SKIPPED].includes(status as any)) {
      onFinish();
    }
  };

  return (
    <Joyride
      steps={steps}
      run={run}
      continuous
      onEvent={handleJoyrideCallback}
      options={{
        primaryColor: '#001489',
        zIndex: 10000,
        showProgress: true,
        buttons: ['back', 'primary', 'skip'],
      }}
      styles={{
        tooltipContainer: {
          textAlign: 'left',
        },
        buttonPrimary: {
          borderRadius: '8px',
          fontWeight: 'bold',
          textTransform: 'uppercase',
          fontSize: '12px',
          letterSpacing: '1px',
          padding: '10px 20px',
        },
        buttonBack: {
          marginRight: '10px',
          fontWeight: 'bold',
          textTransform: 'uppercase',
          fontSize: '12px',
          letterSpacing: '1px',
          color: '#64748b',
        },
        buttonSkip: {
          fontWeight: 'bold',
          textTransform: 'uppercase',
          fontSize: '12px',
          letterSpacing: '1px',
          color: '#94a3b8',
        }
      }}
    />
  );
};

export default OnboardingTour;
