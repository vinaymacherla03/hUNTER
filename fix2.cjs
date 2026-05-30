const fs = require('fs');

let code = fs.readFileSync('services/geminiService.ts', 'utf8');

// The exact string to find in getResumeScorecard
const regex = /const prompt = `Act as a brutal, high-end executive recruiter[\s\S]*?const response = await scheduler\.add<any>\(\(\) => callServerAI\(prompt, "gemini-3-flash-preview", \{\s*responseMimeType: "application\/json",\s*temperature: 0\.7\s*\}\)\);/m;

const replacement = code.match(regex)[0].replace(/\{[\s\n]*responseMimeType: "application\/json",[\s\n]*temperature: 0\.7[\s\n]*\}/, 
`{ 
            responseMimeType: "application/json", 
            responseSchema: {
                type: "OBJECT",
                properties: {
                    score: { type: "INTEGER" },
                    grade: { type: "STRING" },
                    hardTruths: { type: "ARRAY", items: { type: "STRING" } },
                    quickFixes: { type: "ARRAY", items: { type: "STRING" } }
                },
                required: ["score", "grade", "hardTruths", "quickFixes"]
            },
            temperature: 0.7 
        }`);

code = code.replace(regex, replacement);
fs.writeFileSync('services/geminiService.ts', code);
console.log("Updated getResumeScorecard properly this time.");
