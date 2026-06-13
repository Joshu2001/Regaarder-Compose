const fs = require('fs');
const file = 'c:\\Users\\user\\Downloads\\Project MOAT\\Regaarder Compose\\src\\App.jsx';
const lines = fs.readFileSync(file, 'utf8').split('\n');

for (let i = 27500; i >= 0; i--) {
  if (lines[i] === '  return (') {
    console.log(`Found return at line ${i + 1}`);
    break;
  }
}
