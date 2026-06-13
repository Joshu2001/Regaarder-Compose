const fs = require('fs');
const content = fs.readFileSync('c:\\Users\\user\\Downloads\\Project MOAT\\Regaarder Compose\\src\\App.jsx', 'utf8');
const lines = content.split(/\r?\n/);

console.log('--- sheetsTitle ---');
for (let i = 980; i < 1000; i++) {
  if (lines[i].includes('sheetsTitle')) console.log(`${i+1}: ${lines[i]}`);
}

console.log('--- sheetsData ---');
for (let i = 985; i < 1000; i++) {
  if (lines[i].includes('sheetsData')) {
    for (let j = i; j < i + 15; j++) {
      console.log(`${j+1}: ${lines[j]}`);
      if (lines[j].includes(']);')) break;
    }
    break;
  }
}

console.log('--- Left Sidebar Text ---');
for (let i = 21850; i < 21880; i++) {
  if (lines[i].includes('Financial models')) {
    for (let j = i - 2; j < i + 2; j++) {
      console.log(`${j+1}: ${lines[j]}`);
    }
  }
}

