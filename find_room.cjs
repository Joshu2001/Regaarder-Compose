const fs = require('fs');
const file = 'c:\\Users\\user\\Downloads\\Project MOAT\\Regaarder Compose\\src\\App.jsx';
const lines = fs.readFileSync(file, 'utf8').split('\n');

let found = false;
for (let i = 22000; i < lines.length; i++) {
  if (lines[i].includes('if (productMode === \'room\') {')) {
    found = true;
    console.log(`Found at ${i + 1}`);
    break;
  }
}
if (!found) console.log('Not found');
