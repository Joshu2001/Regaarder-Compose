const fs = require('fs');
const file = 'c:\\Users\\user\\Downloads\\Project MOAT\\Regaarder Compose\\src\\App.jsx';
let content = fs.readFileSync(file, 'utf8');

if (!content.includes('PhoneOff')) {
  content = content.replace('MicOff,', 'MicOff, PhoneOff, Smile, MoreVertical,');
}

const newRenderRoomStage = fs.readFileSync('c:\\Users\\user\\Downloads\\Project MOAT\\Regaarder Compose\\newRenderRoomStage.txt', 'utf8');

const startIndex = content.indexOf('const renderRoomStage = () => {');
const endStr = '          )}\n        </div>\n      );\n  };';
let endIndex = content.indexOf(endStr, startIndex);

if (endIndex === -1) {
  endIndex = content.indexOf('          )}\r\n        </div>\r\n      );\r\n  };', startIndex);
  if (endIndex !== -1) endIndex += 46;
} else {
  endIndex += 42;
}

if (startIndex !== -1 && endIndex !== -1) {
  content = content.slice(0, startIndex) + newRenderRoomStage + content.slice(endIndex);
  fs.writeFileSync(file, content, 'utf8');
  console.log('Successfully replaced renderRoomStage');
} else {
  console.log('Failed to find bounds:', startIndex, endIndex);
}
