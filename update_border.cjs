const fs = require('fs');
const path = require('path');

const dir = 'components/templates';
const files = fs.readdirSync(dir).filter(f => f.endsWith('.tsx'));

for (const file of files) {
  const filePath = path.join(dir, file);
  let content = fs.readFileSync(filePath, 'utf8');
  
  const regex = /const sectionTitleStyle: React\.CSSProperties = \{([\s\S]*?)\};/;
  const match = content.match(regex);
  
  if (match) {
    let styleBody = match[1];
    
    // Remove existing borderBottom, borderTop, paddingBottom, paddingTop
    styleBody = styleBody.replace(/borderBottom:.*?,/g, '');
    styleBody = styleBody.replace(/borderTop:.*?,/g, '');
    styleBody = styleBody.replace(/paddingBottom:.*?,/g, '');
    styleBody = styleBody.replace(/paddingTop:.*?,/g, '');
    
    const newStyles = `
    borderBottom: customization.sectionTitleBorderStyle === 'underline' || customization.sectionTitleBorderStyle === 'full' ? '1px solid currentColor' : 'none',
    borderTop: customization.sectionTitleBorderStyle === 'overline' || customization.sectionTitleBorderStyle === 'full' ? '1px solid currentColor' : 'none',
    paddingBottom: customization.sectionTitleBorderStyle === 'underline' || customization.sectionTitleBorderStyle === 'full' ? '4px' : '0',
    paddingTop: customization.sectionTitleBorderStyle === 'overline' || customization.sectionTitleBorderStyle === 'full' ? '4px' : '0',`;
    
    const newStyleBlock = `const sectionTitleStyle: React.CSSProperties = {${styleBody}${newStyles}\n  };`;
    
    content = content.replace(regex, newStyleBlock);
    fs.writeFileSync(filePath, content);
  }
}
console.log('Done');
