const fs = require('fs');
const file = 'c:\\Users\\user\\Downloads\\Project MOAT\\Regaarder Compose\\src\\RegaarderComposeLanding.jsx';
const content = fs.readFileSync(file, 'utf8');
console.log(content.substring(0, 500));
