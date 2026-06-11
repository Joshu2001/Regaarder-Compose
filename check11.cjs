const fs = require('fs');
const content = fs.readFileSync('c:\\Users\\user\\Downloads\\Project MOAT\\Regaarder Compose\\src\\App.jsx', 'utf8');
const lines = content.split(/\r?\n/);

let start = -1;
for (let i = 0; i < lines.length; i++) {
  if (lines[i].includes('w-[64px] border-l border-gray-100 bg-[#fbfafc] flex flex-col items-center')) {
    start = i;
    break;
  }
}
if (start !== -1) {
  // output the last 20 lines before the end of the manageen block
  let end = -1;
  for (let i = start; i < lines.length; i++) {
    if (lines[i] === "    );") {
      end = i;
      break;
    }
  }
  if (end !== -1) {
    const block = lines.slice(end - 25, end + 2).join('\n');
    console.log(block);
  }
}
