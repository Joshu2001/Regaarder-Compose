const fs = require('fs');
const file = 'c:\\Users\\user\\Downloads\\Project MOAT\\Regaarder Compose\\src\\App.jsx';
const content = fs.readFileSync(file, 'utf8');

// Check if mainView === 'room' causes an early return
const match = content.match(/if\s*\(\s*mainView\s*===\s*'room'/);
if (match) {
  const idx = match.index;
  console.log("Found mainView === 'room' check at:", content.slice(idx, idx + 300));
} else {
  console.log("No early return for mainView === 'room'");
}
