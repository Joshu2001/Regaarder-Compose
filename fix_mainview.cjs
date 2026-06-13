const fs = require('fs');
let code = fs.readFileSync('src/App.jsx', 'utf8');
code = code.replace(/setMainView\('room'\)/g, "setMainView('document')");
fs.writeFileSync('src/App.jsx', code);
console.log('Replaced setMainView(room) globally');
