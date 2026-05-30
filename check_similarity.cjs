const fs = require('fs');
const path = require('path');

const dir = './components/templates';
const files = fs.readdirSync(dir).filter(f => f.endsWith('.tsx'));
const contents = files.map(f => ({ name: f, content: fs.readFileSync(path.join(dir, f), 'utf-8') }));

function similarity(s1, s2) {
  let longer = s1;
  let shorter = s2;
  if (s1.length < s2.length) {
    longer = s2;
    shorter = s1;
  }
  let longerLength = longer.length;
  if (longerLength == 0) {
    return 1.0;
  }
  return (longerLength - editDistance(longer, shorter)) / parseFloat(longerLength);
}

function editDistance(s1, s2) {
  s1 = s1.toLowerCase();
  s2 = s2.toLowerCase();
  let costs = new Array();
  for (let i = 0; i <= s1.length; i++) {
    let lastValue = i;
    for (let j = 0; j <= s2.length; j++) {
      if (i == 0)
        costs[j] = j;
      else {
        if (j > 0) {
          let newValue = costs[j - 1];
          if (s1.charAt(i - 1) != s2.charAt(j - 1))
            newValue = Math.min(Math.min(newValue, lastValue),
              costs[j]) + 1;
          costs[j - 1] = lastValue;
          lastValue = newValue;
        }
      }
    }
    if (i > 0)
      costs[s2.length] = lastValue;
  }
  return costs[s2.length];
}

for (let i = 0; i < contents.length; i++) {
  for (let j = i + 1; j < contents.length; j++) {
    const sim = similarity(contents[i].content, contents[j].content);
    if (sim >= 0.9) {
      console.log(contents[i].name, 'and', contents[j].name, 'are', (sim * 100).toFixed(2) + '% similar');
    }
  }
}
