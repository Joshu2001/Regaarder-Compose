const fs = require('fs');
const content = fs.readFileSync('c:\\Users\\user\\Downloads\\Project MOAT\\Regaarder Compose\\src\\App.jsx', 'utf8');
const lines = content.split(/\r?\n/);

let manageenIdx = -1;
for (let i = 0; i < lines.length; i++) {
  if (lines[i] === "  if (productMode === 'manageen') {") {
    manageenIdx = i;
    break;
  }
}

if (manageenIdx !== -1) {
  for (let i = manageenIdx; i < lines.length; i++) {
    if (lines[i] === "    );") {
      console.log("manageen ends at", i);
      break;
    }
  }
}

let dmIdx = -1;
for (let i = 0; i < lines.length; i++) {
  if (lines[i] === "  if (productMode === 'dm') {") {
    dmIdx = i;
    break;
  }
}
if (dmIdx !== -1) {
  console.log("dm starts at", dmIdx);
}
