const fs = require('fs');
const content = fs.readFileSync('c:\\Users\\user\\Downloads\\Project MOAT\\Regaarder Compose\\src\\App.jsx', 'utf8');
const lines = content.split(/\r?\n/);

let callLine = -1;
let copilotLine = -1;
for (let i = 0; i < lines.length; i++) {
  if (lines[i].includes('const callRecognitionRef = useRef(null);')) callLine = i;
  if (lines[i].includes('const coPilotRecognitionRef = useRef(null);')) copilotLine = i;
}
console.log(`Call line: ${callLine}`);
console.log(`Copilot line: ${copilotLine}`);
