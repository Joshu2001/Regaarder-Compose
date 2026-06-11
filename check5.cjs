const fs = require('fs');
const content = fs.readFileSync('c:\\Users\\user\\Downloads\\Project MOAT\\Regaarder Compose\\src\\App.jsx', 'utf8');
const lines = content.split(/\r?\n/);

for (let i = 0; i < lines.length; i++) {
  if (lines[i].includes('className="w-[64px] border-l border-gray-100 bg-[#fbfafc]')) {
    console.log("Found at line", i);
    // Print the previous 5 lines
    for (let j = Math.max(0, i - 5); j < i; j++) {
      console.log(j + ':', lines[j]);
    }
  }
}
