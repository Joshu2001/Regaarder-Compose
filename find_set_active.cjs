const fs = require('fs');
const file = 'c:\\Users\\user\\Downloads\\Project MOAT\\Regaarder Compose\\src\\App.jsx';
const lines = fs.readFileSync(file, 'utf8').split('\n');

console.log('--- 13260 ---');
for(let i=13255; i<=13265; i++) console.log(`${i+1}: ${lines[i]}`);
console.log('--- 13631 ---');
for(let i=13626; i<=13636; i++) console.log(`${i+1}: ${lines[i]}`);
console.log('--- 16719 ---');
for(let i=16714; i<=16724; i++) console.log(`${i+1}: ${lines[i]}`);
