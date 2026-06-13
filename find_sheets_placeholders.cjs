const fs = require('fs');
const content = fs.readFileSync('c:\\Users\\user\\Downloads\\Project MOAT\\Regaarder Compose\\src\\App.jsx', 'utf8');
const lines = content.split(/\r?\n/);

let inSheetsDeck = false;
for (let i = 0; i < lines.length; i++) {
  if (lines[i] === "  if (productMode === 'deck' || productMode === 'sheets') {") {
    inSheetsDeck = true;
  }
  
  if (inSheetsDeck) {
    if (lines[i].includes('Q2 Financial Overview') || lines[i].includes('Financial models') || lines[i].includes('Revenue Break')) {
      console.log(`Line ${i}: ${lines[i].trim()}`);
    }
  }
  
  if (inSheetsDeck && lines[i] === "    );") {
    inSheetsDeck = false;
  }
}
