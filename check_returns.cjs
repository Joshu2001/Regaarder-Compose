const fs = require('fs');
const content = fs.readFileSync('c:\\Users\\user\\Downloads\\Project MOAT\\Regaarder Compose\\src\\App.jsx', 'utf8');
const lines = content.split(/\r?\n/);

for (let i = 0; i < 15925; i++) {
  if (lines[i].match(/^\s*if\s*\([^)]+\)\s*{\s*return\s*\(?/)) {
    console.log(`Line ${i}: ${lines[i].trim()}`);
  }
}
