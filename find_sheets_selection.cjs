const fs = require('fs');
const content = fs.readFileSync('c:\\Users\\user\\Downloads\\Project MOAT\\Regaarder Compose\\src\\App.jsx', 'utf8');
const lines = content.split(/\r?\n/);

for (let i = 0; i < lines.length; i++) {
  if (lines[i].includes('sheetsSelection') && lines[i].includes('setSheetsSelection')) {
    console.log(`${i+1}: ${lines[i]}`);
  }
  if (lines[i].includes('border-b border-r') && lines[i].includes('border-[#e5e7eb]')) {
    // console.log(`${i+1}: ${lines[i]}`);
  }
}
