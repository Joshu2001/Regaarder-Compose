const fs = require('fs');
const file = 'c:\\Users\\user\\Downloads\\Project MOAT\\Regaarder Compose\\src\\App.jsx';
const lines = fs.readFileSync(file, 'utf8').split('\n');

for (let i = 0; i < lines.length; i++) {
  if (lines[i].includes('const handleMiniSidebarClick = ')) {
    const start = i;
    const end = Math.min(lines.length - 1, i + 30);
    let out = [];
    for (let j = start; j <= end; j++) {
      out.push(`${j + 1}: ${lines[j]}`);
    }
    console.log(out.join('\n'));
    break;
  }
}
