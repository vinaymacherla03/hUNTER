const fs = require('fs');
const path = require('path');

const dir = 'components/templates';
const files = fs.readdirSync(dir).filter(f => f.endsWith('.tsx'));

for (const file of files) {
  const filePath = path.join(dir, file);
  let content = fs.readFileSync(filePath, 'utf8');
  
  // Find lines before borderBottom: customization...
  content = content.replace(/([^,{])\s*\n\s*borderBottom: customization/g, '$1,\n    borderBottom: customization');
  
  fs.writeFileSync(filePath, content);
}
console.log('Done');
