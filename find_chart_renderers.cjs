const fs = require('fs');
const content = fs.readFileSync('src/App.jsx', 'utf8');

const lines = content.split('\n');
const matchLines = lines.map((l, i) => l.includes("overlay.type === 'chart'") ? i : -1).filter(i => i > -1);

console.log('Matches at lines:', matchLines);

matchLines.forEach(lineNum => {
  console.log('\\n--- Line ' + lineNum + ' Context ---');
  console.log(lines.slice(lineNum - 5, lineNum + 5).join('\\n'));
});
