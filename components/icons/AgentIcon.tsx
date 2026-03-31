import React from 'react';

const AgentIcon: React.FC<{className?: string}> = ({className}) => {
  return (
    <svg 
        xmlns="http://www.w3.org/2000/svg" 
        className={className} 
        viewBox="0 0 24 24" 
        fill="none" 
        stroke="currentColor" 
        strokeWidth="1.5" 
        strokeLinecap="round" 
        strokeLinejoin="round"
        aria-hidden="true"
    >
        <path d="M17.5 19H9.5C7 19 5 17 5 14.5V9.5C5 7 7 5 9.5 5H14.5C17 5 19 7 19 9.5V17.5L17.5 19Z" />
        <path d="M12 14.5L11 13L12 11.5L13 13L12 14.5Z" />
        <path d="M8.5 10.5L8 10L8.5 9.5L9 10L8.5 10.5Z" />
        <path d="M15.5 10.5L15 10L15.5 9.5L16 10L15.5 10.5Z" />
    </svg>
  );
};

export default AgentIcon;
