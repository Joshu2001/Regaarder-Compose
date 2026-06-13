const fs = require('fs');
const file = 'c:\\Users\\user\\Downloads\\Project MOAT\\Regaarder Compose\\src\\App.jsx';
const lines = fs.readFileSync(file, 'utf8').split('\n');

for (let i = 24474; i >= 0; i--) {
  if (lines[i].includes('const ') && (lines[i].includes(' = () => {') || lines[i].includes(' = () => ('))) {
    console.log(`${i + 1}: ${lines[i]}`);
    break;
  }
}
