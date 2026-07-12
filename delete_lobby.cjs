const fs = require('fs');
const file = 'C:/Users/user/.gemini/antigravity/worktrees/Project MOAT/swift-axis-dips-23h46/Regaarder Compose/src/App.jsx';
const content = fs.readFileSync(file, 'utf8');
const lines = content.split('\n');

const startIdx = lines.findIndex(l => l.includes("if (productMode === 'room' && roomState !== 'active') {"));
let endIdx = -1;

for (let i = startIdx; i < lines.length; i++) {
  if (lines[i].includes('const renderDocumentOutlineContent = () => {')) {
    endIdx = i - 1;
    while(lines[endIdx].trim() === '') endIdx--;
    endIdx--; // To include the closing brace
    break;
  }
}

if (startIdx >= 0 && endIdx >= startIdx) {
  lines.splice(startIdx, endIdx - startIdx + 2);
  fs.writeFileSync(file, lines.join('\n'));
  console.log('Successfully deleted the lobby block');
} else {
  console.log('Could not find block', startIdx, endIdx);
}
