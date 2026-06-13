const fs = require('fs');
const file = 'c:\\Users\\user\\Downloads\\Project MOAT\\Regaarder Compose\\src\\App.jsx';
const lines = fs.readFileSync(file, 'utf8').split('\n');

let balance = 0;
let started = false;
for (let i = 17704; i < lines.length; i++) {
  if (lines[i].includes('{activeRightTab === \'room\' && (')) {
    started = true;
  }
  if (started) {
    if (lines[i].includes('}')) {
      // rough heuristic
    }
  }
}
// Actually, I'll just use a regex to replace it or just find the end manually.
