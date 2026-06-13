const fs = require('fs');
const file = 'c:\\Users\\user\\Downloads\\Project MOAT\\Regaarder Compose\\src\\App.jsx';
let lines = fs.readFileSync(file, 'utf8').split('\n');

let startIdx = -1;
let endIdx = -1;
for (let i = 17500; i < 18500; i++) {
  if (lines[i] && lines[i].includes('{/* REGAARDER ROOM TAB */}')) {
    startIdx = i;
  }
  if (startIdx !== -1 && i > startIdx && lines[i] && lines[i].includes('{activeRightTab === \'memory\' && (')) {
    endIdx = i - 1;
    break;
  }
}
if (startIdx !== -1 && endIdx !== -1) {
  lines.splice(startIdx, endIdx - startIdx + 1);
  console.log(`Deleted room right tab content from ${startIdx} to ${endIdx}`);
} else {
  console.log('Could not find room tab content');
}

fs.writeFileSync(file, lines.join('\n'), 'utf8');
