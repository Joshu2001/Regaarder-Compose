const fs = require('fs');
const lines = fs.readFileSync('src/App.jsx', 'utf8').split('\n');
const idx = lines.findIndex(l => l.includes("l.includes('20')"));
if (idx > -1) {
  console.log(lines.slice(idx - 5, idx + 5).join('\n'));
} else {
  console.log('not found');
}
