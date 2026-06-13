const fs = require('fs');
const file = 'c:\\Users\\user\\Downloads\\Project MOAT\\Regaarder Compose\\src\\App.jsx';
let content = fs.readFileSync(file, 'utf8');

const targetFunc = `  const createDmExperience = () => {
    setProductMode('dm');
    setRightSidebarOpen(false);
    setActiveDmTab('home');
  };`;

const newFunc = `  const createRoomExperience = () => {
    setProductMode('room');
    setRightSidebarOpen(false);
    setActivePrimaryNav('home');
  };

  const createDmExperience = () => {
    setProductMode('dm');
    setRightSidebarOpen(false);
    setActiveDmTab('home');
  };`;

content = content.replace(targetFunc, newFunc);

const targetOpen = `    // Products that act as Right Sidebar Panels or Overlays:
    setProductMode('compose');
    setRightSidebarOpen(true);
    if (target === 'room') {
      setActiveRightTab('room');
      setRightPanelMaximized(true);
    }`;

const newOpen = `    if (target === 'room') {
      setActivePrimaryNav('home');
      createRoomExperience();
      return;
    }

    // Products that act as Right Sidebar Panels or Overlays:
    setProductMode('compose');
    setRightSidebarOpen(true);`;

content = content.replace(targetOpen, newOpen);

fs.writeFileSync(file, content, 'utf8');
console.log('Added createRoomExperience and updated openLandingWorkspace');
