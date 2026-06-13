const fs = require('fs');
const file = 'c:\\Users\\user\\Downloads\\Project MOAT\\Regaarder Compose\\src\\App.jsx';
let lines = fs.readFileSync(file, 'utf8').split('\n');

// 1. Remove `{ key: 'room', label: 'Room' },` from upper tabs
for (let i = 16000; i < 16500; i++) {
  if (lines[i] && lines[i].includes('{ key: \'room\', label: \'Room\' },')) {
    lines.splice(i, 1);
    console.log(`Deleted upper tab at ${i}`);
    break;
  }
}

// 2. Remove the activeRightTab === 'room' block
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
}

// 3. Remove from + menu
for (let i = 17000; i < lines.length; i++) {
  if (lines[i] && lines[i].includes('{ key: \'room\', label: \'Room\', icon: Video },')) {
    lines.splice(i, 1);
    console.log(`Deleted + menu item at ${i}`);
    break;
  }
}

// 4. Remove from mini sidebar
let miniStart = -1;
let miniEnd = -1;
for (let i = 18000; i < lines.length; i++) {
  if (lines[i] && lines[i].includes('onClick={() => handleMiniSidebarClick(\'room\')}')) {
    miniStart = i - 1; // get the <div opening
  }
  if (miniStart !== -1 && i > miniStart && lines[i] && lines[i].includes('</div>')) {
    miniEnd = i;
    break;
  }
}
if (miniStart !== -1 && miniEnd !== -1) {
  lines.splice(miniStart, miniEnd - miniStart + 1);
  console.log(`Deleted mini sidebar item from ${miniStart} to ${miniEnd}`);
}

fs.writeFileSync(file, lines.join('\n'), 'utf8');
