const fs = require('fs');
const content = fs.readFileSync('c:\\Users\\user\\Downloads\\Project MOAT\\Regaarder Compose\\src\\App.jsx', 'utf8');
const lines = content.split(/\r?\n/);

for (let i = 22180; i < 22250; i++) {
  console.log(`${i+1}: ${lines[i]}`);
}
