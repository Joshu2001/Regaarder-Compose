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
if (sheetsIdx !== -1) {
  console.log("sheets starts at", sheetsIdx);
  // Find </main> inside sheets block
  let mainEnd = -1;
  for (let i = sheetsIdx; i < lines.length; i++) {
    if (lines[i] === "        </main>") {
      mainEnd = i;
      break;
    }
  }
  console.log("sheets </main> at", mainEnd);
  
  // Print next 20 lines
  for(let i=mainEnd+1; i<mainEnd+21; i++){
     console.log(i + ":", lines[i]);
  }
}
