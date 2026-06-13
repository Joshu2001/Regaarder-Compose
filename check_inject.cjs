const fs = require('fs');
const file = 'c:\\Users\\user\\Downloads\\Project MOAT\\Regaarder Compose\\inject_room_components.cjs';
const content = fs.readFileSync(file, 'utf8');
console.log(content.slice(0, 1500));
