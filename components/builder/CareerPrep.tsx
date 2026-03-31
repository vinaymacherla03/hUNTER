import React from 'react';
import { ResumeData } from '../../types';

interface CareerPrepProps {
    resumeData: ResumeData;
}

const CareerPrep: React.FC<CareerPrepProps> = ({ resumeData }) => {
    return (
        <div className="p-6">
            <h1 className="text-2xl font-bold mb-4">Career Prep</h1>
            <p>Interview preparation and career resources for {resumeData.fullName}.</p>
            {/* Add prep content here */}
        </div>
    );
};

export default CareerPrep;
