const fs = require('fs');
const content = fs.readFileSync('c:\\Users\\user\\Downloads\\Project MOAT\\Regaarder Compose\\src\\App.jsx', 'utf8');
const lines = content.split(/\r?\n/);

let startIdx = -1;
for (let i = 0; i < lines.length; i++) {
  if (lines[i] === "  if (productMode === 'manageen') {") {
    startIdx = i;
    break;
  }
}

if (startIdx !== -1) {
  let endIdx = -1;
  for (let i = startIdx; i < lines.length; i++) {
    if (lines[i] === "    );") {
      endIdx = i;
      break;
    }
  }
  for (let i = startIdx; i <= endIdx; i++) {
    if (lines[i].includes('<aside')) {
      console.log(`Line ${i}: ${lines[i].trim()}`);
    }
  }
}
