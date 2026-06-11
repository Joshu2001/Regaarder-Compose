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
    const block = lines.slice(startIdx, endIdx).join('\n');
    console.log("w-16 occurrences:", (block.match(/w-16/g) || []).length);
    console.log("w-[64px] occurrences:", (block.match(/w-\[64px\]/g) || []).length);
    console.log("w-[72px] occurrences:", (block.match(/w-\[72px\]/g) || []).length);
    console.log("w-[60px] occurrences:", (block.match(/w-\[60px\]/g) || []).length);
  }
}
