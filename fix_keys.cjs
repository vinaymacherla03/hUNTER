const fs = require('fs');
const path = require('path');

const dir = 'components/templates';
const files = fs.readdirSync(dir).filter(f => f.endsWith('.tsx'));

for (const file of files) {
  const filePath = path.join(dir, file);
  let content = fs.readFileSync(filePath, 'utf8');
  
  content = content.replace(/key=\{skill\.id\}/g, 'key={`${skill.id || \'skill\'}-${si}`}');
  content = content.replace(/key=\{s\.id\}/g, 'key={`${s.id || \'s\'}-${si}`}');
  
  fs.writeFileSync(filePath, content);
}
console.log('Done');
