const fs = require('fs');
const file = 'c:\\Users\\user\\Downloads\\Project MOAT\\Regaarder Compose\\src\\App.jsx';
const content = fs.readFileSync(file, 'utf8');

const idx = content.indexOf('{/* 1. Left Sidebar');
if (idx !== -1) {
  console.log(content.slice(idx, idx + 500));
} else {
  console.log("Not found");
}
