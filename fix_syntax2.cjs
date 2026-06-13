const fs = require('fs');
const file = 'c:\\Users\\user\\Downloads\\Project MOAT\\Regaarder Compose\\src\\App.jsx';
let content = fs.readFileSync(file, 'utf8');

content = content.replace(
  /const renderRoomStage = \(\) => \{\s*return \(\s*\{roomState === 'active' && roomPanelMode === 'expanded' && mainView === 'room' && \(/,
  "const renderRoomStage = () => {\n  return roomState === 'active' && roomPanelMode === 'expanded' && mainView === 'room' && ("
);

content = content.replace(
  /\s*\)\}\s*<\/div>\s*\)\}\s*\);\s*\};/,
  "\n          )}\n        </div>\n      );\n  };"
);

fs.writeFileSync(file, content, 'utf8');
console.log('Fixed syntax with regex');
