const fs = require('fs');
const content = fs.readFileSync('c:\\Users\\user\\Downloads\\Project MOAT\\Regaarder Compose\\src\\App.jsx', 'utf8');
const lines = content.split(/\r?\n/);

let inSheetsDeck = false;
for (let i = 0; i < lines.length; i++) {
  if (lines[i] === "  if (productMode === 'deck' || productMode === 'sheets') {") {
    inSheetsDeck = true;
  }
  
  if (inSheetsDeck) {
    if (lines[i].includes('Data') && lines[i].includes('Insert') || lines[i].includes('Manrope') || lines[i].includes('+ Row')) {
      console.log(`Line ${i}: ${lines[i].trim()}`);
    }
  }
  
  if (inSheetsDeck && lines[i] === "    );") {
    inSheetsDeck = false;
  }
}
