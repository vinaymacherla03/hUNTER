const fs = require('fs');

let code = fs.readFileSync('components/builder/JobTracker.tsx', 'utf8');

const columnComponentRegex = /(const KanbanColumn: React\.FC<KanbanColumnProps> = \(\{ stage, jobs, onSelect, onDelete, onQuickAdd, selectedJobIds, toggleJobSelection)( \}\) => \{)/;
code = code.replace(columnComponentRegex, '$1, index$2');

const columnInterfaceRegex = /(interface KanbanColumnProps \{[\s\S]*?)(\})/;
code = code.replace(columnInterfaceRegex, '$1    index?: number;\n$2');

// Inside JobTracker map:
// {STAGES.map(stage => (
//     <KanbanColumn 
//         key={stage.id} 
const stageMapRegex = /STAGES\.map\(stage => \(\s*<KanbanColumn/g;
code = code.replace(/STAGES\.map\((stage) => \(\s*<KanbanColumn/g, 'STAGES.map((stage, idx) => (\n                                                <KanbanColumn index={idx}');

// Update KanbanColumn's root div to have 3D transform based on index
const columnDivRegex = /<div className="flex-shrink-0 w-80 flex flex-col rounded-\[2rem\] bg-slate-100\/60 border border-slate-200\/60 shadow-\[0_8px_30px_rgb\(0,0,0,0\.04\)\] backdrop-blur-md h-full max-h-full overflow-hidden transition-all duration-500 hover:shadow-\[0_20px_40px_rgb\(0,0,0,0\.08\)\] hover:-translate-y-1 hover:border-emerald-200\/50">/;
code = code.replace(columnDivRegex, `<div className="flex-shrink-0 w-80 flex flex-col rounded-[2rem] bg-slate-100/60 border border-slate-200/60 shadow-[0_8px_30px_rgb(0,0,0,0.04)] backdrop-blur-md h-full max-h-full overflow-hidden transition-all duration-500 hover:-translate-y-2 hover:shadow-[0_30px_60px_rgb(0,0,0,0.12)] hover:border-emerald-300" style={{ transform: index !== undefined ? \`perspective(1200px) rotateY(\${(index - 2) * -3}deg) translateZ(\${Math.abs(index - 2) * -10}px)\` : 'none', transformStyle: 'preserve-3d' }}>`);

fs.writeFileSync('components/builder/JobTracker.tsx', code);
console.log("Applied 3D curving trick to columns!");
