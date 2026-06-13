const fs = require('fs');
const file = 'c:\\Users\\user\\Downloads\\Project MOAT\\Regaarder Compose\\src\\App.jsx';
let lines = fs.readFileSync(file, 'utf8').split('\n');

// 3. Remove from + menu
for (let i = 16000; i < lines.length; i++) {
  if (lines[i] && lines[i].includes('{ key: \'room\', label: \'Room\', icon: Video },')) {
    lines.splice(i, 1);
    console.log(`Deleted + menu item`);
    break;
  }
}

// 4. Remove from mini sidebar
let miniStart = -1;
let miniEnd = -1;
for (let i = 16000; i < lines.length; i++) {
  if (lines[i] && lines[i].includes('handleMiniSidebarClick(\'room\')')) {
    miniStart = i - 1; // get the <div opening
  }
  if (miniStart !== -1 && i > miniStart && lines[i] && lines[i].includes('</div>')) {
    miniEnd = i;
    break;
  }
}
if (miniStart !== -1 && miniEnd !== -1) {
  lines.splice(miniStart, miniEnd - miniStart + 1);
  console.log(`Deleted mini sidebar item`);
}

fs.writeFileSync(file, lines.join('\n'), 'utf8');
