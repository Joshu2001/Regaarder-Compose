const fs = require('fs');
const file = 'c:\\Users\\user\\Downloads\\Project MOAT\\Regaarder Compose\\src\\App.jsx';
const lines = fs.readFileSync(file, 'utf8').split('\n');

for (let i = 16300; i < 16450; i++) {
  if (lines[i].includes('chatMessages.length === 0') || lines[i].includes('empty')) {
    const start = Math.max(0, i - 5);
    const end = Math.min(lines.length - 1, i + 15);
    let out = [];
    for (let j = start; j <= end; j++) {
      out.push(`${j + 1}: ${lines[j]}`);
    }
    console.log(out.join('\n'));
    console.log('---');
  }
}
