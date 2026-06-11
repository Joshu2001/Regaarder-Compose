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

let sheetsDuplicateStart = -1;
for (let i = sheetsIdx; i < lines.length; i++) {
  if (lines[i].includes('w-[74px] border-l border-gray-100 bg-[#FAFAFC] flex flex-col items-center')) {
    sheetsDuplicateStart = i;
    break;
  }
}

if (sheetsDuplicateStart !== -1) {
  let sheetsDuplicateEnd = -1;
  for (let i = sheetsDuplicateStart; i < lines.length; i++) {
    if (lines[i] === "    );" && lines[i-1] === "      </div>" && lines[i-2] === "        </div>") {
      sheetsDuplicateEnd = i - 2; // Keep the `</div>` and `);` of the overall `sheets` return
      break;
    }
  }
  if (sheetsDuplicateEnd !== -1) {
    console.log(`Removing sheets duplicate: ${sheetsDuplicateStart} to ${sheetsDuplicateEnd}`);
    lines.splice(sheetsDuplicateStart, sheetsDuplicateEnd - sheetsDuplicateStart + 1);
  } else {
    console.log("Could not find end of sheets duplicate");
  }
}

let manageenIdx = -1;
for (let i = 0; i < lines.length; i++) {
  if (lines[i] === "  if (productMode === 'manageen') {") {
    manageenIdx = i;
    break;
  }
}

let manageenDuplicateStart = -1;
if (manageenIdx !== -1) {
  for (let i = manageenIdx; i < lines.length; i++) {
    if (lines[i].includes('w-[64px] border-l border-gray-100 bg-[#fbfafc] flex flex-col items-center')) {
      manageenDuplicateStart = i;
      break;
    }
  }
}

if (manageenDuplicateStart !== -1) {
  let manageenDuplicateEnd = -1;
  for (let i = manageenDuplicateStart; i < lines.length; i++) {
    if (lines[i] === "    );" && lines[i-1] === "      </div>" && lines[i-2] === "        </div>") {
      manageenDuplicateEnd = i - 2;
      break;
    }
  }
  if (manageenDuplicateEnd !== -1) {
    console.log(`Removing manageen duplicate: ${manageenDuplicateStart} to ${manageenDuplicateEnd}`);
    lines.splice(manageenDuplicateStart, manageenDuplicateEnd - manageenDuplicateStart + 1);
  } else {
    console.log("Could not find end of manageen duplicate");
  }
}

fs.writeFileSync('c:\\Users\\user\\Downloads\\Project MOAT\\Regaarder Compose\\src\\App.jsx', lines.join('\n'));
console.log('Done!');
