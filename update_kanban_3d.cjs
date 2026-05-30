const fs = require('fs');

let code = fs.readFileSync('components/builder/JobTracker.tsx', 'utf8');

// Replace the board wrap
const boardWrapRegex = /<div className="flex-1 overflow-x-auto overflow-y-hidden p-6 custom-scrollbar bg-slate-50\/50">([\s\S]*?)<div className="flex gap-6 h-full min-h-\[600px\]">/m;

code = code.replace(
  boardWrapRegex, 
  `<div className="flex-1 overflow-x-auto overflow-y-hidden p-8 custom-scrollbar bg-gradient-to-br from-slate-50 via-slate-100/50 to-slate-200/50 relative">
                                {/* Grid background */}
                                <div className="absolute inset-0 bg-[linear-gradient(to_right,#80808012_1px,transparent_1px),linear-gradient(to_bottom,#80808012_1px,transparent_1px)] bg-[size:24px_24px] [mask-image:radial-gradient(ellipse_60%_50%_at_50%_0%,#000_70%,transparent_100%)] pointer-events-none"></div>
                                $1<div className="flex gap-8 h-full min-h-[600px] items-center pb-12 pt-6 w-max mx-auto" style={{ perspective: '2000px', transformStyle: 'preserve-3d' }}>`
);

code = code.replace(
    `const rotateX = ((y - centerY) / centerY) * -10;
        const rotateY = ((x - centerX) / centerX) * 10;`,
    `const rotateX = ((y - centerY) / centerY) * -15;
        const rotateY = ((x - centerX) / centerX) * 15;`
);

code = code.replace(
    `<div className="flex-shrink-0 w-80 flex flex-col rounded-[2rem] bg-slate-100/60 border border-slate-200/60 shadow-[0_8px_30px_rgb(0,0,0,0.04)] backdrop-blur-md h-full max-h-full overflow-hidden transition-all duration-500 hover:-translate-y-2 hover:shadow-[0_30px_60px_rgb(0,0,0,0.12)] hover:border-emerald-300" style={{ transform: index !== undefined ? \`perspective(1200px) rotateY(\${(index - 2) * -3}deg) translateZ(\${Math.abs(index - 2) * -10}px)\` : 'none', transformStyle: 'preserve-3d' }}>`,
    `<div className="flex-shrink-0 w-[340px] flex flex-col rounded-[2rem] bg-white/60 border border-white shadow-[0_8px_30px_rgb(0,0,0,0.04)] backdrop-blur-xl h-full max-h-full overflow-hidden transition-all duration-500 hover:-translate-y-4 hover:shadow-[0_40px_80px_rgb(0,0,0,0.12)] hover:border-emerald-200 hover:bg-white/90 group/col relative" style={{ transform: index !== undefined ? \`rotateY(\${(index - 2) * -5}deg) translateZ(\${Math.abs(index - 2) * -30}px)\` : 'none', transformStyle: 'preserve-3d' }}>
        <div className="absolute inset-0 bg-gradient-to-b from-transparent via-white/10 to-white/30 pointer-events-none rounded-[2rem]"></div>
`
)

fs.writeFileSync('components/builder/JobTracker.tsx', code);
console.log("Updated Kanban 3D styles");
