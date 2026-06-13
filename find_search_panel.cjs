const fs = require('fs');
const content = fs.readFileSync('c:\\Users\\user\\Downloads\\Project MOAT\\Regaarder Compose\\src\\App.jsx', 'utf8');
const lines = content.split(/\r?\n/);

let startIdx = -1;
for (let i = 0; i < lines.length; i++) {
  if (lines[i].includes('{docSearchPanelOpen && (')) {
    startIdx = i;
    break;
  }
}

if (startIdx !== -1) {
  let endIdx = -1;
  let nested = 0;
  for (let i = startIdx; i < lines.length; i++) {
    if (lines[i].includes('<div')) nested++;
    if (lines[i].includes('</div')) nested--;
    if (nested === 0 && i > startIdx + 2) { // just a rough heuristic
       // Actually the block ends with )}
       if (lines[i+1] && lines[i+1].includes(')}')) {
          endIdx = i + 1;
          break;
       }
    }
  }
  
  // Alternative finding logic for React fragment/conditional
  let braceCount = 0;
  let foundEnd = false;
  let text = lines.slice(startIdx).join('\n');
  for(let i=0; i<text.length; i++) {
     if(text[i] === '{') braceCount++;
     if(text[i] === '}') braceCount--;
     if(braceCount === 0 && i > 5) {
         console.log(text.substring(0, i+1));
         foundEnd = true;
         break;
     }
  }
}
