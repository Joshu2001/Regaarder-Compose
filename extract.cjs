const fs = require('fs');
const content = fs.readFileSync('src/App.jsx', 'utf8');
const lines = content.split('\n');

for (let i = 0; i < lines.length; i++) {
  if (lines[i].includes('key === \'Backspace\'') || lines[i].includes('key === "Backspace"')) {
    console.log(`\n--- Match at line ${i} ---`);
    console.log(lines.slice(Math.max(0, i-2), Math.min(lines.length, i+5)).join('\n'));
  }
}
