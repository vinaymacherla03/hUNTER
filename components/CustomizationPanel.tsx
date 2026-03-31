import React from 'react';
import { Customization } from '../types';

interface CustomizationPanelProps {
  customization: Customization;
  onCustomizationChange: (updates: Partial<Customization>) => void;
}

const CustomizationPanel: React.FC<CustomizationPanelProps> = ({ customization, onCustomizationChange }) => {
  return (
    <div className="space-y-6 p-4">
      <div>
        <h3 className="text-sm font-semibold text-slate-900 mb-3">Theme Color</h3>
        <div className="flex gap-2 flex-wrap">
          {['indigo', 'blue', 'emerald', 'rose', 'slate', 'orange', 'amber'].map(color => (
            <button
              key={color}
              onClick={() => onCustomizationChange({ color: color as any })}
              className={`w-8 h-8 rounded-full border-2 ${customization.color === color ? 'border-slate-900 scale-110' : 'border-transparent hover:scale-110'} transition-transform bg-${color}-500`}
              aria-label={`Select color ${color}`}
            />
          ))}
        </div>
      </div>

      <div>
        <h3 className="text-sm font-semibold text-slate-900 mb-3">Font Family</h3>
        <select
          value={customization.font}
          onChange={(e) => onCustomizationChange({ font: e.target.value as any })}
          className="w-full p-2 border border-slate-300 rounded-md text-sm focus:ring-2 focus:ring-primary focus:border-primary"
        >
          <option value="times-new-roman">Times New Roman (ATS Safe)</option>
          <option value="tahoma">Tahoma (ATS Safe)</option>
          <option value="verdana">Verdana (ATS Safe)</option>
          <option value="arial">Arial (ATS Safe)</option>
          <option value="helvetica">Helvetica (ATS Safe)</option>
          <option value="calibri">Calibri (ATS Safe)</option>
          <option value="georgia">Georgia (ATS Safe)</option>
          <option value="cambria">Cambria (ATS Safe)</option>
          <option value="gill-sans">Gill Sans (ATS Safe)</option>
          <option value="garamond">Garamond (ATS Safe)</option>
          <option value="inter">Inter (Modern Sans)</option>
          <option value="merriweather">Merriweather (Classic Serif)</option>
          <option value="roboto">Roboto (Clean Sans)</option>
          <option value="lora">Lora (Elegant Serif)</option>
        </select>
      </div>

      <div>
        <h3 className="text-sm font-semibold text-slate-900 mb-3">Margins</h3>
        <div className="flex bg-slate-100 p-1 rounded-lg">
          {['compact', 'normal', 'spacious'].map(margin => (
            <button
              key={margin}
              onClick={() => onCustomizationChange({ margin: margin as any })}
              className={`flex-1 py-1.5 text-xs font-medium rounded-md capitalize transition-colors ${customization.margin === margin ? 'bg-white text-slate-900 shadow-sm' : 'text-slate-600 hover:text-slate-900'}`}
            >
              {margin}
            </button>
          ))}
        </div>
      </div>

      <div>
        <h3 className="text-sm font-semibold text-slate-900 mb-3">Page Format</h3>
        <div className="flex bg-slate-100 p-1 rounded-lg">
          {['A4', 'LETTER'].map(format => (
            <button
              key={format}
              onClick={() => onCustomizationChange({ pageFormat: format as any })}
              className={`flex-1 py-1.5 text-xs font-medium rounded-md transition-colors ${customization.pageFormat === format || (!customization.pageFormat && format === 'A4') ? 'bg-white text-slate-900 shadow-sm' : 'text-slate-600 hover:text-slate-900'}`}
            >
              {format === 'A4' ? 'A4 (210x297mm)' : 'US Letter (8.5x11in)'}
            </button>
          ))}
        </div>
      </div>
    </div>
  );
};

export default CustomizationPanel;
