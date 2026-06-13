const fs = require('fs');
const file = 'c:\\Users\\user\\Downloads\\Project MOAT\\Regaarder Compose\\src\\RegaarderComposeLanding.jsx';
let content = fs.readFileSync(file, 'utf8');

content = content.replace('  { title: "Room", description: "Host meetings", icon: Video },\n', '');

fs.writeFileSync(file, content, 'utf8');
console.log('Removed Room from Landing Page');
