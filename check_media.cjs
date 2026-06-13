const fs = require('fs');
const file = 'c:\\Users\\user\\Downloads\\Project MOAT\\Regaarder Compose\\src\\App.jsx';
const content = fs.readFileSync(file, 'utf8');

const match = content.match(/const requestMediaPermissions =.*?catch\s*\([^\)]*\)\s*\{[^}]*\}\s*\}/s);
if (match) {
  console.log(match[0]);
}
