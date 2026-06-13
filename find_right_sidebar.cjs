const fs = require('fs');
const content = fs.readFileSync('c:\\Users\\user\\Downloads\\Project MOAT\\Regaarder Compose\\src\\App.jsx', 'utf8');
const lines = content.split(/\r?\n/);

let sidebarFound = false;
for (let i = 0; i < lines.length; i++) {
  if (lines[i].includes('border-l border-gray-100') && lines[i].includes('FAFAFC')) {
    for(let j=i-5; j<i+10; j++) {
       console.log(lines[j]);
    }
  }
}
