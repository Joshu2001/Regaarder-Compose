const fs = require('fs');
const content = fs.readFileSync('c:\\Users\\user\\Downloads\\Project MOAT\\Regaarder Compose\\src\\App.jsx', 'utf8');
const lines = content.split(/\r?\n/);

let inSheets = false;
for (let i = 0; i < lines.length; i++) {
  if (lines[i].includes('productMode === \'sheets\'') || lines[i].includes('isSheetsMode')) {
    inSheets = true;
  }
  if (inSheets && lines[i].includes('A')) {
    // try to find where columns A B C D are rendered
  }
}

for (let i = 0; i < lines.length; i++) {
  if (lines[i].includes('className') && lines[i].includes('border-') && lines[i].includes('cell')) {
    console.log(`${i+1}: ${lines[i]}`);
  }
}
