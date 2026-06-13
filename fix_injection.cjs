const fs = require('fs');
const file = 'c:\\Users\\user\\Downloads\\Project MOAT\\Regaarder Compose\\src\\App.jsx';
let content = fs.readFileSync(file, 'utf8');

// Remove from LocalVideoFeed
content = content.replace(
  "        <div className=\"w-16 h-16 rounded-full bg-gray-700 flex items-center justify-center text-gray-400 text-xl font-bold\">\n          You\n        </div>\n      {renderRoomStage()}\n      </div>\n    );\n  }\n\n  return (",
  "        <div className=\"w-16 h-16 rounded-full bg-gray-700 flex items-center justify-center text-gray-400 text-xl font-bold\">\n          You\n        </div>\n      </div>\n    );\n  }\n\n  return ("
);
content = content.replace(
  "        <div className=\"w-16 h-16 rounded-full bg-gray-700 flex items-center justify-center text-gray-400 text-xl font-bold\">\r\n          You\r\n        </div>\r\n      {renderRoomStage()}\r\n      </div>\r\n    );\r\n  }\r\n\r\n  return (",
  "        <div className=\"w-16 h-16 rounded-full bg-gray-700 flex items-center justify-center text-gray-400 text-xl font-bold\">\r\n          You\r\n        </div>\r\n      </div>\r\n    );\r\n  }\r\n\r\n  return ("
);

// Inject into DeckOrSheetsView properly
const deckReturnIndex = content.lastIndexOf("      </div>\n    );\n  }\n\n  return (\n    <div ref={appShellRef}");
if (deckReturnIndex !== -1) {
  content = content.slice(0, deckReturnIndex) + "      {renderRoomStage()}\n" + content.slice(deckReturnIndex);
} else {
  const deckReturnIndexCRLF = content.lastIndexOf("      </div>\r\n    );\r\n  }\r\n\r\n  return (\r\n    <div ref={appShellRef}");
  if (deckReturnIndexCRLF !== -1) {
    content = content.slice(0, deckReturnIndexCRLF) + "      {renderRoomStage()}\r\n" + content.slice(deckReturnIndexCRLF);
  }
}

fs.writeFileSync(file, content, 'utf8');
console.log('Fixed renderRoomStage locations');
