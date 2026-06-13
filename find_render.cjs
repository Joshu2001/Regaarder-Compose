const fs = require('fs');
const file = 'c:\\Users\\user\\Downloads\\Project MOAT\\Regaarder Compose\\src\\App.jsx';
const lines = fs.readFileSync(file, 'utf8').split('\n');

lines.forEach((line, index) => {
  if (line.includes('import ') && line.includes('renderRoomStage')) {
    console.log(`${index + 1}: ${line}`);
  }
});
