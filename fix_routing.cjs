const fs = require('fs');
const file = 'c:\\Users\\user\\Downloads\\Project MOAT\\Regaarder Compose\\src\\App.jsx';
let content = fs.readFileSync(file, 'utf8');

const targetStr = `    if (target === 'dm') {
      setActivePrimaryNav('home');
      createDmExperience();
      return;
    }

    // Products that act as Right Sidebar Panels or Overlays:`;

const replacement = `    if (target === 'dm') {
      setActivePrimaryNav('home');
      createDmExperience();
      return;
    }

    if (target === 'room') {
      setActivePrimaryNav('home');
      createRoomExperience();
      return;
    }

    // Products that act as Right Sidebar Panels or Overlays:
    setIsPromptExpanded(false);
    setIsPromptAutoVisible(false);`;

content = content.replace(targetStr, replacement);
fs.writeFileSync(file, content, 'utf8');
console.log('Fixed openLandingWorkspace routing and prompt state');
