const fs = require('fs');
const code = fs.readFileSync('src/App.jsx', 'utf8');

let parenDepth = 0;
let braceDepth = 0;

const lines = code.split('\n');
for (let i = 0; i < lines.length; i++) {
  const line = lines[i];
  for (let j = 0; j < line.length; j++) {
    const c = line[j];
    if (c === '(') parenDepth++;
    if (c === ')') parenDepth--;
    if (c === '{') braceDepth++;
    if (c === '}') braceDepth--;
  }
}

console.log('Parens:', parenDepth, 'Braces:', braceDepth);
