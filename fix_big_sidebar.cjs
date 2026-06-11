const fs = require('fs');
const content = fs.readFileSync('c:\\Users\\user\\Downloads\\Project MOAT\\Regaarder Compose\\src\\App.jsx', 'utf8');
const lines = content.split(/\r?\n/);

let startIdx = -1;
for (let i = 0; i < lines.length; i++) {
  // Find the aside in sheets/deck mode
  if (lines[i] === "  if (productMode === 'deck' || productMode === 'sheets') {") {
    for (let j = i; j < lines.length; j++) {
      if (lines[j].includes('className={`shrink-0 rounded-2xl border border-gray-200 bg-white flex flex-col min-h-0 relative transition-[width] duration-300')) {
        startIdx = j - 1; // get the `<aside` line
        break;
      }
    }
    break;
  }
}

if (startIdx !== -1) {
  let endIdx = -1;
  let nested = 0;
  for (let i = startIdx; i < lines.length; i++) {
    if (lines[i].includes('<aside')) nested++;
    if (lines[i].includes('</aside>')) {
      nested--;
      if (nested === 0) {
        endIdx = i;
        break;
      }
    }
  }
  if (endIdx !== -1) {
    console.log(`Removing duplicated big sidebar in sheets/deck from ${startIdx} to ${endIdx}`);
    lines.splice(startIdx, endIdx - startIdx + 1);
    fs.writeFileSync('c:\\Users\\user\\Downloads\\Project MOAT\\Regaarder Compose\\src\\App.jsx', lines.join('\n'));
  }
}
