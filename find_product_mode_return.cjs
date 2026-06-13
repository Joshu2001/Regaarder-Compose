const fs = require('fs');
const file = 'c:\\Users\\user\\Downloads\\Project MOAT\\Regaarder Compose\\src\\App.jsx';
const lines = fs.readFileSync(file, 'utf8').split('\n');

for (let i = 22971; i < 23100; i++) {
  if (lines[i].includes('{productMode')) {
    console.log(`${i + 1}: ${lines[i]}`);
  }
}
