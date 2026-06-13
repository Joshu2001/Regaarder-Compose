const fs = require('fs');
const content = fs.readFileSync('c:\\Users\\user\\Downloads\\Project MOAT\\Regaarder Compose\\src\\App.jsx', 'utf8');
const lines = content.split(/\r?\n/);

console.log('--- Right Sidebar ---');
for (let i = 0; i < lines.length; i++) {
  if (lines[i].includes('rightSidebarOpen')) {
    if (lines[i].includes('scrollbar')) console.log(`${i+1}: ${lines[i]}`);
  }
}

let inSheets = false;
for (let i = 0; i < lines.length; i++) {
  if (lines[i].includes('productMode === \'sheets\'')) inSheets = true;
  if (inSheets && lines[i].includes('thin-scrollbar')) {
    console.log(`${i+1}: ${lines[i].trim()}`);
  }
}

