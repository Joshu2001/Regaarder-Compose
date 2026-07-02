const fs = require('fs');
let content = fs.readFileSync('src/App.jsx', 'utf8');
content = content.replace(/Tab \\\$\\{docIndex \\+ 1\\}/g, 'Untitled document \\\$\\{docIndex + 1\\}');
fs.writeFileSync('src/App.jsx', content);
console.log('Fixed');

