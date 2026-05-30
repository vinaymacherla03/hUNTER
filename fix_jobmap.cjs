const fs = require('fs');
let code = fs.readFileSync('components/JobMap.tsx', 'utf8');

code = code.replace(/<Marker \n\s*key=\{job\.job_id\}/g, '<Marker \n            key={`${job.job_id}-${job.job_latitude}-${job.job_longitude}`}');
// Also maybe simpler
code = code.replace(/\{validJobs.map\(\(job\) => \(/g, '{validJobs.map((job, idx) => (');
code = code.replace(/key=\{job\.job_id\}/g, 'key={`${job.job_id}-${idx}`}');

fs.writeFileSync('components/JobMap.tsx', code);
console.log('Fixed JobMap.tsx duplicate key fallback logic');
