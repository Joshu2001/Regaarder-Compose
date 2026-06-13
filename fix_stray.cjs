const fs = require('fs');
const file = 'c:\\Users\\user\\Downloads\\Project MOAT\\Regaarder Compose\\src\\App.jsx';
let content = fs.readFileSync(file, 'utf8');

content = content.replace(
  "      {renderRoomStage()}\n        )}",
  "      {renderRoomStage()}"
);
content = content.replace(
  "      {renderRoomStage()}\r\n        )}",
  "      {renderRoomStage()}"
);

fs.writeFileSync(file, content, 'utf8');
console.log('Fixed stray )}');
