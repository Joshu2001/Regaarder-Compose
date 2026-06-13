const fs = require('fs');
const content = fs.readFileSync('c:\\Users\\user\\Downloads\\Project MOAT\\Regaarder Compose\\src\\App.jsx', 'utf8');
const lines = content.split(/\r?\n/);

let sidebarFound = false;
for (let i = 0; i < lines.length; i++) {
  if (lines[i].includes('rightSidebarOpen && (') || lines[i].includes('rightSidebarOpen ?')) {
    console.log(`${i+1}: ${lines[i]}`);
  }
}
