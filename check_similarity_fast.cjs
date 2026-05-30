const fs = require('fs');
const path = require('path');

const dir = './components/templates';
const files = fs.readdirSync(dir).filter(f => f.endsWith('.tsx'));
const contents = files.map(f => {
  const content = fs.readFileSync(path.join(dir, f), 'utf-8');
  // Tokenize by words
  const words = content.toLowerCase().split(/\W+/).filter(w => w.length > 0);
  return { name: f, words: new Set(words), wordCount: words.length };
});

function jaccardSimilarity(set1, set2) {
  let intersection = 0;
  for (let elem of set1) {
    if (set2.has(elem)) {
      intersection++;
    }
  }
  const union = set1.size + set2.size - intersection;
  return intersection / union;
}

for (let i = 0; i < contents.length; i++) {
  for (let j = i + 1; j < contents.length; j++) {
    const sim = jaccardSimilarity(contents[i].words, contents[j].words);
    if (sim >= 0.85) { // 85% Jaccard is very high, usually means 90%+ identical text
      console.log(contents[i].name, 'and', contents[j].name, 'are', (sim * 100).toFixed(2) + '% similar');
    }
  }
}
