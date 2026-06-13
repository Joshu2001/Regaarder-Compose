const fs = require('fs');
const file = 'c:\\Users\\user\\Downloads\\Project MOAT\\Regaarder Compose\\src\\RegaarderComposeLanding.jsx';
const lines = fs.readFileSync(file, 'utf8').split('\n');

for (let i = 0; i < 60; i++) {
  console.log(`${i + 1}: ${lines[i]}`);
}
