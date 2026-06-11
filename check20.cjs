const fs = require('fs');
const content = fs.readFileSync('c:\\Users\\user\\Downloads\\Project MOAT\\Regaarder Compose\\src\\App.jsx', 'utf8');
const lines = content.split(/\r?\n/);

let hookEndLine = 1200; // rough estimate of where main hooks end
for (let i = 1200; i < lines.length; i++) {
  if (lines[i].match(/^\s*(const|let|var)\s+(\[[^\]]+\]|\w+)\s*=\s*use[A-Z]\w*\b/)) {
    console.log(`Line ${i}: ${lines[i].trim()}`);
  }
}
