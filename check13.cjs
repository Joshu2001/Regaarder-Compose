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
  let endIdx = -1;
  for (let i = startIdx; i < lines.length; i++) {
    if (lines[i].includes('const sharedReplayPanel = (')) {
      endIdx = i;
      break;
    }
  }
  
  if (endIdx !== -1) {
    const block = lines.slice(startIdx, endIdx);
    for (let i = 0; i < block.length; i++) {
      if (block[i].includes('use')) {
        // Log line
        console.log(`Line ${startIdx + i}: ${block[i].trim()}`);
      }
    }
  }
}
