const fs = require('fs');
const file = 'c:\\Users\\user\\Downloads\\Project MOAT\\Regaarder Compose\\src\\App.jsx';
const lines = fs.readFileSync(file, 'utf8').split('\n');

for (let i = 23000; i < 27610; i++) {
  if (lines[i].includes('renderMiniSidebar()')) {
    const start = Math.max(0, i - 10);
    const end = Math.min(lines.length - 1, i + 20);
    let out = [];
    for (let j = start; j <= end; j++) {
      out.push(`${j + 1}: ${lines[j]}`);
    }
    console.log(out.join('\n'));
    break;
  }
}
