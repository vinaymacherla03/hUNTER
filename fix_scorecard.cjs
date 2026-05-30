const fs = require('fs');

let code = fs.readFileSync('services/geminiService.ts', 'utf8');

const regex = /const response = await scheduler\.add<any>\(\(\) => callServerAI\(prompt, "gemini-3-flash-preview", \{\s*responseMimeType: "application\/json",\s*temperature: 0\.7\s*\}\)\);/m;

const replacement = `const response = await scheduler.add<any>(() => callServerAI(prompt, "gemini-3-flash-preview", { 
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
        }));`;

if (code.match(regex)) {
    code = code.replace(regex, replacement);
    fs.writeFileSync('services/geminiService.ts', code);
    console.log("Updated getResumeScorecard");
} else {
    console.log("Not found");
}
