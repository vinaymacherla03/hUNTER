const fs = require('fs');
let code = fs.readFileSync('components/JobSearch.tsx', 'utf8');

code = code.replace(/setJobs\(prev => \{\s*const existingIds = new Set\(prev\.map\(j => j\.job_id\)\);\s*const uniqueNewJobs = newJobs\.filter\(j => !existingIds\.has\(j\.job_id\)\);\s*return \[\.\.\.prev, \.\.\.uniqueNewJobs\];\s*\}\);/g,
  `setJobs(prev => {\n          const allJobs = [...prev, ...newJobs];\n          const uniqueJobsMap = new Map();\n          for (const j of allJobs) { if (!uniqueJobsMap.has(j.job_id)) uniqueJobsMap.set(j.job_id, j); }\n          return Array.from(uniqueJobsMap.values());\n        });`);

code = code.replace(/setJobs\(data\.data \|\| \[\]\);/g, 
  `const fetchedJobs = data.data || [];\n      const uniqueJobsMap = new Map();\n      for (const j of fetchedJobs) { if (!uniqueJobsMap.has(j.job_id)) uniqueJobsMap.set(j.job_id, j); }\n      setJobs(Array.from(uniqueJobsMap.values()));`);

fs.writeFileSync('components/JobSearch.tsx', code);
console.log('Fixed JobSearch.tsx duplicate keys logic');
