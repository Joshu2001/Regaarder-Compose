const fs = require('fs');
const file = 'c:\\Users\\user\\Downloads\\Project MOAT\\Regaarder Compose\\src\\App.jsx';
let content = fs.readFileSync(file, 'utf8');

// Completely remove renderRoomStage
const startIndex = content.indexOf('const renderRoomStage = () => {');
const deckIndex = content.indexOf("if (productMode === 'deck' || productMode === 'sheets') {");
if (startIndex !== -1 && deckIndex !== -1) {
  content = content.slice(0, startIndex) + fs.readFileSync('c:\\Users\\user\\Downloads\\Project MOAT\\Regaarder Compose\\room_ui_components.txt', 'utf8') + "\n\n" + content.slice(deckIndex);
}

// Remove stray `{renderRoomStage()}` from Compose block
content = content.replace("      {renderRoomStage()}\n      </div>\n    );\n  }\n\n  return (\n    <div ref={appShellRef}", "      </div>\n    );\n  }\n\n  return (\n    <div ref={appShellRef}");
content = content.replace("      {renderRoomStage()}\r\n      </div>\r\n    );\r\n  }\r\n\r\n  return (\r\n    <div ref={appShellRef}", "      </div>\r\n    );\r\n  }\r\n\r\n  return (\r\n    <div ref={appShellRef}");

fs.writeFileSync(file, content, 'utf8');
console.log('Injected Room UI components successfully');
