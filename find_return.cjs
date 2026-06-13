const fs = require('fs');
const file = 'c:\\Users\\user\\Downloads\\Project MOAT\\Regaarder Compose\\src\\App.jsx';
const lines = fs.readFileSync(file, 'utf8').split('\n');

for (let i = 21650; i < lines.length; i++) {
  if (lines[i].includes('return (')) {
    console.log(`${i + 1}: ${lines[i]}`);
  }
}
