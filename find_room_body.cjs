const fs = require('fs');
const content = fs.readFileSync('c:\\Users\\user\\Downloads\\Project MOAT\\Regaarder Compose\\src\\App.jsx', 'utf8');
const lines = content.split(/\r?\n/);

let startIdx = -1;
let endIdx = -1;

for (let i = 17680; i < 17950; i++) {
  if (lines[i].includes('className="flex-1 overflow-y-auto thin-scrollbar px-3 py-3 space-y-3"')) {
    startIdx = i;
  }
  if (startIdx !== -1 && lines[i].includes('{/* STATE: MEETING SETUP */}')) {
    endIdx = i - 1;
    break;
  }
}

console.log(`Start: ${startIdx+1}`);
console.log(`End: ${endIdx+1}`);

for (let j = startIdx; j < startIdx + 2; j++) {
  console.log(lines[j]);
}
for (let j = endIdx - 2; j <= endIdx; j++) {
  console.log(lines[j]);
}

