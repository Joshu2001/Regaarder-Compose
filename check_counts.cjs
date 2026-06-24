const fs = require('fs');
const content = fs.readFileSync('src/App.jsx', 'utf8');

const countMatches = (str) => content.split(str).length - 1;

console.log('CHART_CATEGORIES count:', countMatches('CHART_CATEGORIES ='));
console.log('overlay.type === chart count:', countMatches("overlay.type === 'chart'"));
console.log('SHEET_SLASH_OPTIONS count:', countMatches('SHEET_SLASH_OPTIONS ='));
