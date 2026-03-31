import React, { useState } from 'react';
import { ResumeData } from '../../../types';
import { Plus, X, Tag, Info } from 'lucide-react';

interface KeywordsFormProps {
    data: ResumeData;
    onDataChange: (path: string, value: any) => void;
}

const KeywordsForm: React.FC<KeywordsFormProps> = ({ data, onDataChange }) => {
    const [newKeyword, setNewKeyword] = useState('');
    const keywords = data.keywords || [];

    const addKeyword = () => {
        if (newKeyword.trim()) {
            onDataChange('keywords', [...keywords, newKeyword.trim()]);
            setNewKeyword('');
        }
    };

    const removeKeyword = (index: number) => {
        const updated = keywords.filter((_, i) => i !== index);
        onDataChange('keywords', updated);
    };

    return (
        <div className="space-y-8">
            <div>
                <h2 className="text-3xl font-black text-slate-900 tracking-tight mb-2">Keywords</h2>
                <p className="text-sm text-slate-500 mb-8 font-medium">Add industry-specific keywords to help your resume pass through ATS filters.</p>
                
                <div className="bg-emerald-50 border border-emerald-100 rounded-2xl p-6 mb-8 flex gap-4">
                    <div className="w-10 h-10 rounded-full bg-emerald-100 flex items-center justify-center flex-shrink-0">
                        <Info className="w-5 h-5 text-emerald-600" />
                    </div>
                    <div>
                        <h4 className="font-bold text-emerald-900 mb-1">ATS Tip</h4>
                        <p className="text-sm text-emerald-800 leading-relaxed">
                            Look for common nouns and phrases in job descriptions (e.g., "Project Management", "Python", "Strategic Planning") and include them here.
                        </p>
                    </div>
                </div>

                <div className="flex gap-2 mb-6">
                    <div className="relative flex-1">
                        <Tag className="absolute left-4 top-1/2 -translate-y-1/2 w-5 h-5 text-slate-400" />
                        <input
                            type="text"
                            value={newKeyword}
                            onChange={(e) => setNewKeyword(e.target.value)}
                            onKeyPress={(e) => e.key === 'Enter' && addKeyword()}
                            placeholder="e.g. Project Management"
                            className="w-full pl-12 pr-4 py-4 rounded-2xl border-2 border-slate-100 focus:border-emerald-500 focus:ring-4 focus:ring-emerald-500/10 transition-all outline-none font-medium"
                        />
                    </div>
                    <button
                        onClick={addKeyword}
                        className="px-6 rounded-2xl bg-black text-white hover:bg-slate-800 transition-colors flex items-center justify-center"
                    >
                        <Plus className="w-6 h-6" />
                    </button>
                </div>

                <div className="flex flex-wrap gap-2">
                    {keywords.map((keyword, index) => (
                        <div 
                            key={index}
                            className="flex items-center gap-2 px-4 py-2 bg-slate-100 rounded-full text-slate-700 font-bold text-sm group hover:bg-slate-200 transition-colors"
                        >
                            <span>{keyword}</span>
                            <button 
                                onClick={() => removeKeyword(index)}
                                className="text-slate-400 hover:text-red-500 transition-colors"
                            >
                                <X className="w-4 h-4" />
                            </button>
                        </div>
                    ))}
                    {keywords.length === 0 && (
                        <div className="w-full py-12 border-2 border-dashed border-slate-100 rounded-3xl flex flex-col items-center justify-center text-slate-400">
                            <Tag className="w-12 h-12 mb-4 opacity-20" />
                            <p className="font-bold">No keywords added yet</p>
                        </div>
                    )}
                </div>
            </div>
        </div>
    );
};

export default KeywordsForm;
