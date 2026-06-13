const fs = require('fs');
const file = 'c:\\Users\\user\\Downloads\\Project MOAT\\Regaarder Compose\\src\\App.jsx';
let lines = fs.readFileSync(file, 'utf8').split('\n');

// 1. Remove `{ key: 'room', label: 'Room' },` from upper tabs
for (let i = 16140; i < 16180; i++) {
  if (lines[i] && lines[i].includes('{ key: \'room\', label: \'Room\' },')) {
    lines.splice(i, 1);
    console.log(`Deleted upper tab at ${i + 1}`);
    break;
  }
}

// 2. Remove the activeRightTab === 'room' block
let startIdx = -1;
let endIdx = -1;
for (let i = 17650; i < 18200; i++) {
  if (lines[i] && lines[i].includes('          {/* REGAARDER ROOM TAB */}')) {
    startIdx = i;
  }
  if (startIdx !== -1 && i > startIdx && lines[i] && lines[i].includes('          {activeRightTab === \'memory\' && (')) {
    // Found the start of the next tab, so the end of room tab is right before this
    endIdx = i - 1;
    break;
  }
}

if (startIdx !== -1 && endIdx !== -1) {
  lines.splice(startIdx, endIdx - startIdx + 1);
  console.log(`Deleted room right tab content from ${startIdx + 1} to ${endIdx + 1}`);
} else {
  console.log('Could not find room right tab block boundaries');
}

fs.writeFileSync(file, lines.join('\n'), 'utf8');
