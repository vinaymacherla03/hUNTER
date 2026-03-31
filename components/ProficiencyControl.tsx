import React from 'react';
import { SkillProficiency } from '../types';

interface ProficiencyControlProps {
    path: string;
    value: SkillProficiency;
    onChange: (path: string, value: SkillProficiency) => void;
}

const levels: SkillProficiency[] = ['Beginner', 'Intermediate', 'Advanced', 'Expert'];
const levelValues: Record<SkillProficiency, number> = {
    'Beginner': 1,
    'Intermediate': 2,
    'Advanced': 3,
    'Expert': 4,
};

const ProficiencyControl: React.FC<ProficiencyControlProps> = ({ path, value, onChange }) => {
    const currentValue = levelValues[value] || 2; // Default to intermediate

    return (
        <div className="flex items-center gap-0.5" title={`Proficiency: ${value}`}>
            {levels.map((level, index) => (
                <button
                    key={level}
                    type="button"
                    onClick={() => onChange(path, level)}
                    className={`h-2.5 w-2.5 rounded-full transition-colors duration-150 ${
                        index < currentValue ? 'bg-[var(--primary-color-dark)]' : 'bg-[var(--primary-color-dark)]/30'
                    } hover:scale-125`}
                    aria-label={`Set proficiency to ${level}`}
                />
            ))}
        </div>
    );
};

export default ProficiencyControl;