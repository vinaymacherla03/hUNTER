import React, { useState, useEffect } from 'react';
import { motion } from 'framer-motion';
import { ResumeData } from '../../types';
import { getCareerStrategy } from '../../services/geminiService';

interface CareerRoadmapPanelProps {
    resumeData: ResumeData;
}

const CareerRoadmapPanel: React.FC<CareerRoadmapPanelProps> = ({ resumeData }) => {
    const [roadmap, setRoadmap] = useState<{ step: string; description: string }[]>([]);
    const [skillGaps, setSkillGaps] = useState<string[]>([]);
    const [positioning, setPositioning] = useState<string>('');
    const [loading, setLoading] = useState(true);

    useEffect(() => {
        const fetchStrategy = async () => {
            setLoading(true);
            const strategy = await getCareerStrategy(resumeData);
            setRoadmap(strategy.roadmap);
            setSkillGaps(strategy.skillGaps);
            setPositioning(strategy.positioning);
            setLoading(false);
        };
        fetchStrategy();
    }, [resumeData]);

    if (loading) return <div className="p-8 text-center text-slate-500">Generating your personalized career roadmap...</div>;

    return (
        <div className="space-y-8">
            <div className="bg-white p-6 rounded-2xl border border-slate-100 shadow-sm">
                <h3 className="text-lg font-bold text-slate-900 mb-2">Market Positioning</h3>
                <p className="text-slate-600 leading-relaxed">{positioning}</p>
            </div>

            <div className="grid md:grid-cols-2 gap-8">
                <div className="bg-white p-6 rounded-2xl border border-slate-100 shadow-sm">
                    <h3 className="text-lg font-bold text-slate-900 mb-4">3-Step Roadmap</h3>
                    <div className="space-y-4">
                        {roadmap.map((step, index) => (
                            <div key={index} className="flex gap-4">
                                <div className="w-8 h-8 rounded-full bg-emerald-50 text-emerald-600 flex items-center justify-center font-bold shrink-0 border border-emerald-100">
                                    {index + 1}
                                </div>
                                <div>
                                    <h4 className="font-bold text-slate-900">{step.step}</h4>
                                    <p className="text-sm text-slate-600">{step.description}</p>
                                </div>
                            </div>
                        ))}
                    </div>
                </div>

                <div className="bg-white p-6 rounded-2xl border border-slate-100 shadow-sm">
                    <h3 className="text-lg font-bold text-slate-900 mb-4">Critical Skill Gaps</h3>
                    <ul className="space-y-2">
                        {skillGaps.map((skill, index) => (
                            <li key={index} className="flex items-center gap-3 text-sm text-slate-700 font-medium">
                                <span className="w-2 h-2 rounded-full bg-teal-500 shrink-0" />
                                {skill}
                            </li>
                        ))}
                    </ul>
                </div>
            </div>
        </div>
    );
};

export default CareerRoadmapPanel;
