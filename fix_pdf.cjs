const fs = require('fs');
let code = fs.readFileSync('components/PdfTemplate.tsx', 'utf8');

// Replace standard pageBreakInside definitions adding wrap={false}
code = code.replace(/<View style={{ flexDirection: 'row', gap: 15, marginBottom: 10, pageBreakInside: 'avoid' }}>/g, '<View wrap={false} style={{ flexDirection: \'row\', gap: 15, marginBottom: 10 }}>');
code = code.replace(/<View style={{ marginBottom: 10, pageBreakInside: 'avoid' }}>/g, '<View wrap={false} style={{ marginBottom: 10 }}>');
code = code.replace(/<View style={{ marginBottom: 12, pageBreakInside: 'avoid' }}>/g, '<View wrap={false} style={{ marginBottom: 12 }}>');
code = code.replace(/<View key=\{i\} style={{ marginBottom: 8, pageBreakInside: 'avoid' }}>/g, '<View key={i} wrap={false} style={{ marginBottom: 8 }}>');
code = code.replace(/<View key=\{i\} style={{ marginBottom: 6, pageBreakInside: 'avoid' }}>/g, '<View key={i} wrap={false} style={{ marginBottom: 6 }}>');
code = code.replace(/pageBreakInside: 'avoid'/g, '/* pageBreakInside avoid */'); // Fallback for any leftover

// Also fix `exp.gpa` in template standard fallback 
// "components/PdfTemplate.tsx(615,28): error TS2339: Property 'gpa' does not exist on type 'Education'."
// "components/PdfTemplate.tsx(615,111): error TS2339: Property 'gpa' does not exist on type 'Education'."
code = code.replace(/edu\.gpa/g, '(edu as any).gpa');

fs.writeFileSync('components/PdfTemplate.tsx', code);
console.log('Fixed PdfTemplate.tsx');
