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
  let end = -1;
  for (let i = start; i < lines.length; i++) {
    if (lines[i] === "    );" && lines[i-1] === "      </div>" && lines[i-2] === "        </div>") {
      end = i - 2;
      break;
    }
  }
  if (end !== -1) {
    console.log(`Removing manageen duplicate: ${start} to ${end}`);
    lines.splice(start, end - start + 1);
    fs.writeFileSync('c:\\Users\\user\\Downloads\\Project MOAT\\Regaarder Compose\\src\\App.jsx', lines.join('\n'));
    console.log('Saved!');
  } else {
    console.log("Could not find end");
  }
} else {
  console.log("Could not find start");
}
