import React from 'react';
import { Customization, ColorTheme } from '../types';
import { Type, MoveHorizontal, AlignLeft, Bold, Underline as UnderlineIcon, Minus, Square, Maximize2, Layout, Sliders, Palette, FileText } from 'lucide-react';

interface CustomizationPanelProps {
  customization: Customization;
  onCustomizationChange: (updates: Partial<Customization>) => void;
}

const colors: ColorTheme[] = ['indigo', 'blue', 'emerald', 'rose', 'slate', 'orange', 'amber', 'violet', 'fuchsia', 'pink', 'cyan', 'teal', 'lime', 'yellow', 'red', 'black'];

const CustomizationPanel: React.FC<CustomizationPanelProps> = ({ customization, onCustomizationChange }) => {
  return (
    <div className="space-y-10 p-6 custom-scrollbar overflow-y-auto max-h-full pb-24">
      {/* Theme Color */}
      <section className="bg-white rounded-2xl border border-slate-100 p-5 shadow-sm">
        <div className="flex items-center gap-3 mb-5">
          <div className="w-8 h-8 rounded-lg bg-emerald-50 flex items-center justify-center">
            <Palette className="w-4 h-4 text-emerald-600" />
          </div>
          <h3 className="text-xs font-black text-slate-900 uppercase tracking-widest">Theme Color</h3>
        </div>
        <div className="grid grid-cols-8 gap-3">
          {colors.map(color => (
            <button
              key={color}
              onClick={() => onCustomizationChange({ color })}
              className={`group relative w-full aspect-square rounded-xl border-2 transition-all duration-300 ${
                customization.color === color 
                  ? 'border-slate-900 scale-110 shadow-lg' 
                  : 'border-transparent hover:scale-105 hover:border-slate-200'
              }`}
              aria-label={`Select color ${color}`}
            >
              <div className={`absolute inset-1 rounded-lg bg-${color === 'black' ? 'slate-900' : `${color}-500`} shadow-sm`} />
              {customization.color === color && (
                <div className="absolute inset-0 flex items-center justify-center">
                  <div className="w-1.5 h-1.5 rounded-full bg-white shadow-sm" />
                </div>
              )}
            </button>
          ))}
        </div>
      </section>

      {/* Typography */}
      <section className="bg-white rounded-2xl border border-slate-100 p-5 shadow-sm">
        <div className="flex items-center gap-3 mb-6">
          <div className="w-8 h-8 rounded-lg bg-emerald-50 flex items-center justify-center">
            <Type className="w-4 h-4 text-emerald-600" />
          </div>
          <h3 className="text-xs font-black text-slate-900 uppercase tracking-widest">Typography</h3>
        </div>
        
        <div className="space-y-6">
          <div>
            <label className="text-[10px] font-black text-slate-400 uppercase tracking-widest mb-3 block">Font Family</label>
            <select
              value={customization.font}
              onChange={(e) => onCustomizationChange({ font: e.target.value as any })}
              className="w-full p-3.5 bg-slate-50 border-2 border-slate-100 rounded-xl text-sm font-bold text-slate-700 focus:ring-2 focus:ring-emerald-500 focus:border-emerald-500 transition-all outline-none cursor-pointer hover:bg-slate-100"
            >
              <optgroup label="ATS Safe (Standard)">
                <option value="times-new-roman">Times New Roman</option>
                <option value="arial">Arial</option>
                <option value="helvetica">Helvetica</option>
                <option value="calibri">Calibri</option>
                <option value="georgia">Georgia</option>
                <option value="garamond">Garamond</option>
              </optgroup>
              <optgroup label="Modern Sans">
                <option value="inter">Inter</option>
                <option value="jakarta">Plus Jakarta Sans</option>
                <option value="roboto">Roboto</option>
                <option value="lato">Lato</option>
                <option value="montserrat">Montserrat</option>
                <option value="poppins">Poppins</option>
                <option value="outfit">Outfit</option>
                <option value="dm-sans">DM Sans</option>
              </optgroup>
              <optgroup label="Elegant Serif">
                <option value="lora">Lora</option>
                <option value="playfair">Playfair Display</option>
                <option value="merriweather">Merriweather</option>
                <option value="crimson-pro">Crimson Pro</option>
                <option value="libre-baserville">Libre Baskerville</option>
              </optgroup>
              <optgroup label="Technical / Mono">
                <option value="jetbrains-mono">JetBrains Mono</option>
                <option value="roboto-mono">Roboto Mono</option>
                <option value="space-grotesk">Space Grotesk</option>
              </optgroup>
            </select>
          </div>

          <div className="grid grid-cols-1 sm:grid-cols-2 gap-6">
            <div className="space-y-3">
              <div className="flex justify-between items-center">
                <label className="text-[10px] font-black text-slate-400 uppercase tracking-widest">Body Size</label>
                <span className="text-[10px] font-black text-emerald-600">{customization.bodySize}pt</span>
              </div>
              <input 
                type="range" min="8" max="14" step="0.5"
                value={customization.bodySize}
                onChange={(e) => onCustomizationChange({ bodySize: parseFloat(e.target.value) })}
                className="w-full h-1.5 bg-slate-100 rounded-lg appearance-none cursor-pointer accent-emerald-500"
              />
            </div>
            <div className="space-y-3">
              <div className="flex justify-between items-center">
                <label className="text-[10px] font-black text-slate-400 uppercase tracking-widest">Line Height</label>
                <span className="text-[10px] font-black text-emerald-600">{customization.lineHeight}</span>
              </div>
              <input 
                type="range" min="1" max="2" step="0.05"
                value={customization.lineHeight}
                onChange={(e) => onCustomizationChange({ lineHeight: parseFloat(e.target.value) })}
                className="w-full h-1.5 bg-slate-100 rounded-lg appearance-none cursor-pointer accent-emerald-500"
              />
            </div>
          </div>
        </div>
      </section>

      {/* Layout & Spacing */}
      <section className="bg-white rounded-2xl border border-slate-100 p-5 shadow-sm">
        <div className="flex items-center gap-3 mb-6">
          <div className="w-8 h-8 rounded-lg bg-emerald-50 flex items-center justify-center">
            <Layout className="w-4 h-4 text-emerald-600" />
          </div>
          <h3 className="text-xs font-black text-slate-900 uppercase tracking-widest">Layout & Spacing</h3>
        </div>

        <div className="space-y-8">
          <div>
            <label className="text-[10px] font-black text-slate-400 uppercase tracking-widest mb-3 block">Page Format</label>
            <div className="flex bg-slate-100/80 p-1.5 rounded-2xl border border-slate-200/40 shadow-[inset_0_2px_4px_rgba(0,0,0,0.02)]">
              {(['A4', 'LETTER'] as const).map(format => (
                <button
                  key={format}
                  onClick={() => onCustomizationChange({ pageFormat: format })}
                  className={`flex-1 py-2.5 text-[10px] font-black uppercase tracking-widest rounded-xl transition-all duration-300 active:scale-95 ${
                    customization.pageFormat === format 
                      ? 'bg-white text-slate-900 shadow-lg shadow-slate-200/50 ring-1 ring-slate-200/50' 
                      : 'text-slate-400 hover:text-slate-600'
                  }`}
                >
                  {format}
                </button>
              ))}
            </div>
          </div>

          <div>
            <label className="text-[10px] font-black text-slate-400 uppercase tracking-widest mb-3 block">Page Margins</label>
            <div className="flex bg-slate-100/80 p-1.5 rounded-2xl border border-slate-200/40 shadow-[inset_0_2px_4px_rgba(0,0,0,0.02)]">
              {['compact', 'normal', 'spacious'].map(margin => (
                <button
                  key={margin}
                  onClick={() => onCustomizationChange({ margin: margin as any })}
                  className={`flex-1 py-2.5 text-[10px] font-black uppercase tracking-widest rounded-xl transition-all duration-300 active:scale-95 ${
                    customization.margin === margin 
                      ? 'bg-white text-slate-900 shadow-lg shadow-slate-200/50 ring-1 ring-slate-200/50' 
                      : 'text-slate-400 hover:text-slate-600'
                  }`}
                >
                  {margin}
                </button>
              ))}
            </div>
          </div>

          <div className="flex items-center justify-between p-4 bg-emerald-50/30 rounded-2xl border border-emerald-100/50">
            <div className="flex items-center gap-3">
              <div className="w-8 h-8 rounded-lg bg-white flex items-center justify-center shadow-sm">
                <Maximize2 className="w-4 h-4 text-emerald-600" />
              </div>
              <div>
                <h4 className="text-[11px] font-black text-slate-900 uppercase tracking-widest">Auto Fit to Page</h4>
                <p className="text-[9px] text-slate-500 font-bold uppercase tracking-tighter mt-0.5">One-page optimization</p>
              </div>
            </div>
            <button
              onClick={() => onCustomizationChange({ fitToOnePage: !customization.fitToOnePage })}
              className={`relative inline-flex h-6 w-11 items-center rounded-full transition-colors focus:outline-none ${
                customization.fitToOnePage ? 'bg-emerald-500' : 'bg-slate-300'
              }`}
            >
              <span className={`inline-block h-4 w-4 transform rounded-full bg-white transition-transform ${
                customization.fitToOnePage ? 'translate-x-6' : 'translate-x-1'
              }`} />
            </button>
          </div>
        </div>
      </section>

      {/* Advanced Section Styling */}
      <section className="bg-white rounded-2xl border border-slate-100 p-5 shadow-sm">
        <div className="flex items-center gap-3 mb-6">
          <div className="w-8 h-8 rounded-lg bg-emerald-50 flex items-center justify-center">
            <Sliders className="w-4 h-4 text-emerald-600" />
          </div>
          <h3 className="text-xs font-black text-slate-900 uppercase tracking-widest">Section Styling</h3>
        </div>

        <div className="space-y-6">
          <div className="flex items-center justify-between p-3 bg-slate-50 rounded-xl">
            <label className="text-[10px] font-black text-slate-600 uppercase tracking-widest">Uppercase Headers</label>
            <button
              onClick={() => onCustomizationChange({ sectionTitleUppercase: !customization.sectionTitleUppercase })}
              className={`relative inline-flex h-5 w-9 items-center rounded-full transition-colors ${
                customization.sectionTitleUppercase ? 'bg-emerald-500' : 'bg-slate-300'
              }`}
            >
              <span className={`inline-block h-3 w-3 transform rounded-full bg-white transition-transform ${
                customization.sectionTitleUppercase ? 'translate-x-5' : 'translate-x-1'
              }`} />
            </button>
          </div>

          <div>
            <label className="text-[10px] font-black text-slate-400 uppercase tracking-widest mb-3 block">Section Title Border</label>
            <div className="grid grid-cols-4 gap-2">
              {(['none', 'underline', 'overline', 'full'] as const).map(style => (
                <button
                  key={style}
                  onClick={() => onCustomizationChange({ sectionTitleBorderStyle: style })}
                  className={`py-3 flex flex-col items-center gap-2 rounded-xl border-2 transition-all ${
                    customization.sectionTitleBorderStyle === style 
                      ? 'border-emerald-500 bg-emerald-50 text-emerald-600 shadow-sm' 
                      : 'border-slate-50 bg-slate-50/50 text-slate-400 hover:border-slate-200 hover:bg-white'
                  }`}
                >
                  {style === 'none' && <Square className="w-4 h-4" />}
                  {style === 'underline' && <UnderlineIcon className="w-4 h-4" />}
                  {style === 'overline' && <Minus className="w-4 h-4 rotate-180" />}
                  {style === 'full' && <Maximize2 className="w-4 h-4" />}
                  <span className="text-[8px] font-black uppercase tracking-tighter">{style}</span>
                </button>
              ))}
            </div>
          </div>
        </div>
      </section>
    </div>
  );
};

export default CustomizationPanel;
