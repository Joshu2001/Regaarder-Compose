const fs = require('fs');
const content = fs.readFileSync('c:\\Users\\user\\Downloads\\Project MOAT\\Regaarder Compose\\src\\App.jsx', 'utf8');
const lines = content.split(/\r?\n/);

let sheetsIdx = -1;
for (let i = 0; i < lines.length; i++) {
  if (lines[i] === "  if (productMode === 'deck' || productMode === 'sheets') {") {
    sheetsIdx = i;
    break;
  }
}

let duplicateStart = -1;
for (let i = sheetsIdx; i < lines.length; i++) {
  if (lines[i].includes('<div className="w-[74px] border-l border-gray-100 bg-[#FAFAFC] flex flex-col items-center py-4 gap-6 shrink-0 select-none overflow-y-auto overflow-x-visible thin-scrollbar">')) {
    duplicateStart = i;
    break;
  }
}

if (duplicateStart !== -1) {
  let duplicateEnd = -1;
  // We know it ends before the final </div> of the sheets block.
  for (let i = duplicateStart; i < lines.length; i++) {
    if (lines[i] === "      </div>") { // End of the sheets/deck shell div
      // Let's verify what's right before it
      if (lines[i-1] === "        </div>") {
        duplicateEnd = i - 1;
        break;
      }
    }
  }
  console.log("Duplicate starts at", duplicateStart, "ends at", duplicateEnd);
}
