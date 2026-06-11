const fs = require('fs');
const content = fs.readFileSync('c:\\Users\\user\\Downloads\\Project MOAT\\Regaarder Compose\\src\\App.jsx', 'utf8');
const lines = content.split(/\r?\n/);

let startIdx = -1;
for (let i = 0; i < lines.length; i++) {
  if (lines[i].includes('const sharedRightPanels = (')) {
    startIdx = i;
    break;
  }
}
if (startIdx !== -1) {
  const block = lines.slice(startIdx + 2400, startIdx + 2650).join('\n');
  fs.writeFileSync('c:\\Users\\user\\Downloads\\Project MOAT\\Regaarder Compose\\shared_end.jsx', block);
}
