const fs = require('fs');
const lines = fs.readFileSync('src/App.jsx', 'utf8').split('\n');
const idx = lines.findIndex(l => l.includes('selectedSheetRange') && l.includes('absolute'));
console.log('Search 1:', idx);

const sLines = lines.map((l, i) => l.includes('selectedSheetRange') ? i : -1).filter(i => i > -1);
sLines.forEach(i => {
  if (lines[i].includes('border-') || lines[i].includes('absolute')) {
    console.log(i, lines[i].trim());
  }
});
