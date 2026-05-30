const fs = require('fs');

let code = fs.readFileSync('components/builder/JobTracker.tsx', 'utf8');

// Replace SortableCard implementation
const sortableCardRegex = /const SortableCard: React\.FC<SortableCardProps> = \(\{ job, onSelect, onDelete, isSelected, onToggleSelect \}\) => \{([\s\S]*?)return \([\s\S]*?className={`group relative bg-white([\s\S]*?)onClick=\{\(\) => onSelect\(job\)\}\s*>\s*<div className="flex items-start gap-4">([\s\S]*?)<\/div>\s*<\/div>\s*\);\s*\};/m;

const sortableCardMatch = code.match(sortableCardRegex);

const newSortableCard = `const SortableCard: React.FC<SortableCardProps> = ({ job, onSelect, onDelete, isSelected, onToggleSelect }) => {
    const {
        attributes,
        listeners,
        setNodeRef,
        transform,
        transition,
        isDragging
    } = useSortable({ id: job.id });

    const cardRef = React.useRef<HTMLDivElement>(null);
    const [tilt, setTilt] = useState({ rotateX: 0, rotateY: 0 });

    const handleMouseMove = (e: React.MouseEvent<HTMLDivElement>) => {
        if (!cardRef.current || isDragging) return;
        const rect = cardRef.current.getBoundingClientRect();
        const x = e.clientX - rect.left;
        const y = e.clientY - rect.top;
        const centerX = rect.width / 2;
        const centerY = rect.height / 2;
        
        // Max rotation = 10deg
        const rotateX = ((y - centerY) / centerY) * -10;
        const rotateY = ((x - centerX) / centerX) * 10;
        
        setTilt({ rotateX, rotateY });
    };

    const handleMouseLeave = () => {
        setTilt({ rotateX: 0, rotateY: 0 });
    };

    const style = {
        transform: CSS.Transform.toString(transform),
        transition,
        opacity: isDragging ? 0.3 : 1,
    };

    const daysAgo = useMemo(() => {
        const addedDate = new Date(job.dateAdded);
        const today = new Date();
        const diffTime = Math.abs(today.getTime() - addedDate.getTime());
        return Math.ceil(diffTime / (1000 * 60 * 60 * 24));
    }, [job.dateAdded]);

    return (
        <div
            ref={setNodeRef}
            className={\`group relative cursor-default \${isDragging ? 'z-50' : 'z-0'}\`}
            style={{ perspective: '1000px', ...style }}
            onClick={(e) => {
                // Do not propagate if dragging
                if (isDragging) return;
                onSelect(job);
            }}
        >
            <div
                ref={cardRef}
                onMouseMove={handleMouseMove}
                onMouseLeave={handleMouseLeave}
                className={\`bg-white p-5 rounded-2xl border \${isSelected ? 'border-emerald-500 ring-2 ring-emerald-100' : 'border-slate-200'} shadow-[0_4px_20px_rgba(0,0,0,0.05)] hover:shadow-[0_20px_40px_rgba(0,0,0,0.12)] transition-all duration-300 transform-gpu cursor-default\`}
                style={{
                    transform: isDragging ? 'none' : \`rotateX(\${tilt.rotateX}deg) rotateY(\${tilt.rotateY}deg)\`,
                    transformStyle: 'preserve-3d',
                }}
            >
                <div className="flex items-start gap-4 transition-transform duration-300" style={{ transform: isDragging ? 'none' : 'translateZ(30px)' }}>
                    <div 
                        {...attributes} 
                        {...listeners}
                        className="mt-1.5 -ml-2 text-slate-300 hover:text-emerald-500 cursor-grab active:cursor-grabbing rounded-md hover:bg-emerald-50 transition-colors"
                        onClick={(e) => e.stopPropagation()}
                    >
                        <GripVertical className="w-5 h-5" />
                    </div>
                    
                    <div className="flex-1 min-w-0">
                        <div className="flex justify-between items-start mb-4">
                            <div className="flex items-center gap-3">
                                 <input 
                                    type="checkbox"
                                    checked={isSelected}
                                    onChange={(e) => {
                                        e.stopPropagation();
                                        onToggleSelect(job.id);
                                    }}
                                    className="w-4 h-4 rounded border-slate-300 text-emerald-600 focus:ring-emerald-500"
                                    onClick={(e) => e.stopPropagation()}
                                 />
                                 <div className="w-12 h-12 rounded-xl flex items-center justify-center border border-slate-200 overflow-hidden shadow-sm bg-white" style={{ transform: 'translateZ(20px)' }}>
                                    <img src={getLogoUrl(job.company)} alt={job.company} className="w-full h-full object-cover" onError={(e) => { (e.target as any).style.display = 'none'; (e.target as any).nextSibling.style.display = 'flex'; }} />
                                    <div className="hidden w-full h-full items-center justify-center bg-slate-50 text-slate-500 font-bold text-lg">
                                        {job.company.charAt(0)}
                                    </div>
                                </div>
                            </div>
                            <button 
                                onClick={(e) => {
                                    e.stopPropagation();
                                    onDelete(job.id);
                                }}
                                className="opacity-0 group-hover:opacity-100 p-2 text-slate-400 hover:text-rose-500 hover:bg-rose-50 rounded-lg transition-all"
                                style={{ transform: 'translateZ(20px)' }}
                            >
                                <Trash2 className="w-5 h-5" />
                            </button>
                        </div>
                        
                        <h4 className="font-bold text-slate-900 text-lg mb-1 line-clamp-1 group-hover:text-emerald-700 transition-colors" style={{ transform: 'translateZ(40px)' }}>
                            {job.role}
                        </h4>
                        <p className="text-sm text-slate-500 font-medium mb-4" style={{ transform: 'translateZ(30px)' }}>{job.company}</p>
                        
                        <div className="flex flex-wrap gap-2.5 mb-5" style={{ transform: 'translateZ(25px)' }}>
                            <div className="flex items-center gap-1.5 text-xs font-semibold text-slate-600 bg-slate-100 px-3 py-1 rounded-full">
                                <MapPin className="w-4 h-4 text-slate-400" />
                                {job.location || 'Remote'}
                            </div>
                            <div className="flex items-center gap-1.5 text-xs font-semibold text-amber-700 bg-amber-50 px-3 py-1 rounded-full border border-amber-100">
                                <Sparkles className="w-4 h-4" />
                                78% Match
                            </div>
                        </div>

                        <div className="flex items-center justify-between pt-3 border-t border-slate-100" style={{ transform: 'translateZ(10px)' }}>
                            <span className="text-[10px] font-medium text-slate-400">
                                {daysAgo}d ago
                            </span>
                            
                            <div className="flex gap-1">
                                {job.link && (
                                    <a 
                                        href={job.link} 
                                        target="_blank" 
                                        rel="noopener noreferrer"
                                        onClick={(e) => e.stopPropagation()}
                                        className="p-1.5 text-slate-400 hover:text-emerald-600 hover:bg-emerald-50 rounded-md transition-all"
                                    >
                                        <ExternalLink className="w-3.5 h-3.5" />
                                    </a>
                                )}
                            </div>
                        </div>
                    </div>
                </div>
            </div>
        </div>
    );
};`;

code = code.replace(sortableCardRegex, newSortableCard);

// Also let's give the KanbanColumn a bit of 3D
code = code.replace(/<div className="flex-shrink-0 w-80 flex flex-col rounded-2xl bg-slate-100\/50 border border-slate-200 shadow-sm h-full max-h-full overflow-hidden">/g, 
'<div className="flex-shrink-0 w-80 flex flex-col rounded-[2rem] bg-slate-100/60 border border-slate-200/60 shadow-[0_8px_30px_rgb(0,0,0,0.04)] backdrop-blur-md h-full max-h-full overflow-hidden transition-all duration-500 hover:shadow-[0_20px_40px_rgb(0,0,0,0.08)] hover:-translate-y-1 hover:border-emerald-200/50">');


fs.writeFileSync('components/builder/JobTracker.tsx', code);
