const fs = require('fs');
const content = fs.readFileSync('c:\\Users\\user\\Downloads\\Project MOAT\\Regaarder Compose\\src\\App.jsx', 'utf8');
const lines = content.split(/\r?\n/);
let output = [];
for (let i = 22145; i < 22180; i++) {
  output.push(lines[i]);
}
fs.writeFileSync('c:\\Users\\user\\Downloads\\Project MOAT\\Regaarder Compose\\grid_target.txt', output.join('\n'), 'utf8');
