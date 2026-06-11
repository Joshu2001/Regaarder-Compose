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

let duplicateStart = -1;
for (let i = manageenIdx; i < lines.length; i++) {
  if (lines[i].includes('<div className="w-[64px] border-l border-gray-100 bg-[#fbfafc] flex flex-col items-center py-4 gap-5 shrink-0 select-none overflow-y-auto overflow-x-visible thin-scrollbar">')) {
    duplicateStart = i;
    break;
  }
}

if (duplicateStart !== -1) {
  let duplicateEnd = -1;
  for (let i = duplicateStart; i < lines.length; i++) {
    if (lines[i] === "      </div>") { // End of the manageen shell div
      if (lines[i-1] === "        </div>") {
        duplicateEnd = i - 1;
        break;
      }
    }
  }
  console.log("Manageen Duplicate starts at", duplicateStart, "ends at", duplicateEnd);
}
