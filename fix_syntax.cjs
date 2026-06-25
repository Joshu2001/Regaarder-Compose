const fs = require('fs');
const path = require('path');

const appPath = path.join(__dirname, 'src', 'App.jsx');
let content = fs.readFileSync(appPath, 'utf8');

// Fix the syntax errors caused by previous patch
content = content.replace(/\) : \{sheetToolbarTab === 'Data' \? \(/g, ") : sheetToolbarTab === 'Data' ? (");
content = content.replace(/\) : \{sheetToolbarTab === 'Analyze' \? \(/g, ") : sheetToolbarTab === 'Analyze' ? (");

fs.writeFileSync(appPath, content, 'utf8');
console.log('Syntax errors fixed');
