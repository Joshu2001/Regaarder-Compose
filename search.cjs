const fs = require('fs');
const lines = fs.readFileSync('src/App.jsx', 'utf8').split('\n');
lines.forEach((l, i) => {
  if (l.includes("hr className=\"border-gray-100\"") && i > 27500) {
    console.log(i, l);
  }
});
