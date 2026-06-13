const fs = require('fs');
const file = 'c:\\Users\\user\\Downloads\\Project MOAT\\Regaarder Compose\\src\\App.jsx';
let content = fs.readFileSync(file, 'utf8');

content = content.replace(/\s*\{renderRoomStage\(\)\}/g, '');

fs.writeFileSync(file, content, 'utf8');
console.log('Removed all calls to renderRoomStage');
