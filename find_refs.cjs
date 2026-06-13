const fs = require('fs');
const file = 'c:\\Users\\user\\Downloads\\Project MOAT\\Regaarder Compose\\src\\App.jsx';
const content = fs.readFileSync(file, 'utf8');

const match = content.match(/useRef[^\n]*/g);
if (match) {
  match.forEach(m => {
    if (m.toLowerCase().includes('video') || m.toLowerCase().includes('local')) {
      console.log(m);
    }
  });
}
