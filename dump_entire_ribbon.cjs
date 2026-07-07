const fs = require('fs');
const path = require('path');

const appJsxPath = path.join(__dirname, 'src', 'App.jsx');
const content = fs.readFileSync(appJsxPath, 'utf8');
const lines = content.split('\n');

const start = 35495;
const end = 36150;

for (let i = start; i <= end; i++) {
  console.log(`${i}: ${lines[i - 1]}`);
}
