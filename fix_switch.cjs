const fs = require('fs');
const file = 'c:\\Users\\user\\Downloads\\Project MOAT\\Regaarder Compose\\src\\App.jsx';
let content = fs.readFileSync(file, 'utf8');

const targetStr = `    switch (target) {
      case 'room':
        setActivePrimaryNav('home');
        setRoomState('lobby');
        setActiveRightTab('room');
        break;`;

const replacement = `    switch (target) {`;

content = content.replace(targetStr, replacement);
fs.writeFileSync(file, content, 'utf8');
console.log('Removed dead switch case for room');
