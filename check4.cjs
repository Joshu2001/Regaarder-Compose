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
    const match = block.match(/\{.*?\}/g);
    // Let's just output the first few lines of Section 4
    let section4Idx = -1;
    const blockLines = block.split('\n');
    for (let i = 0; i < blockLines.length; i++) {
      if (blockLines[i].includes('4. Far Right Mini Sidebar')) {
        section4Idx = i;
        break;
      }
    }
    if (section4Idx !== -1) {
      console.log(blockLines.slice(section4Idx, section4Idx + 5).join('\n'));
    }
  }
}
