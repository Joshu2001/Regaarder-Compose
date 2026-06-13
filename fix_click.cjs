const fs = require('fs');
const file = 'c:\\Users\\user\\Downloads\\Project MOAT\\Regaarder Compose\\src\\App.jsx';
let content = fs.readFileSync(file, 'utf8');

const target = `    if (tabKey === 'dm') {
      createDmExperience();
      return;
    }`;

const replacement = `    if (tabKey === 'dm') {
      createDmExperience();
      return;
    }
    if (tabKey === 'room') {
      createRoomExperience();
      return;
    }`;

content = content.replace(target, replacement);

fs.writeFileSync(file, content, 'utf8');
console.log('Fixed handleMiniSidebarClick');
