const fs = require('fs');
const path = 'c:\\Users\\user\\Downloads\\Project MOAT\\Regaarder Compose\\src\\App.jsx';
let content = fs.readFileSync(path, 'utf8');
const lines = content.split(/\r?\n/);

let panelStartIdx = -1;
for (let i = 0; i < lines.length; i++) {
  if (lines[i] === '  const sharedRightPanels = (') {
    panelStartIdx = i;
    break;
  }
}

let panelEndIdx = -1;
for (let i = panelStartIdx; i < lines.length; i++) {
  if (lines[i] === '  const sharedReplayPanel = (') {
    panelEndIdx = i - 1; // It ends exactly before the next one starts
    break;
  }
}

let replayEndIdx = -1;
for (let i = panelEndIdx + 1; i < lines.length; i++) {
  if (lines[i] === '    if (productMode === \'dm\') {') {
    replayEndIdx = i - 1; // Ends right before the dm block
    break;
  }
}

if (panelStartIdx !== -1 && panelEndIdx !== -1 && replayEndIdx !== -1) {
  // Extract both panels
  const panelsLines = lines.slice(panelStartIdx, replayEndIdx + 1);
  
  // Remove them from current location
  lines.splice(panelStartIdx, replayEndIdx - panelStartIdx + 1);
  
  // Find the root level `if (productMode === 'dm') {`
  // We know the root level one is indented by 2 spaces, not 4 spaces!
  let rootDmIdx = -1;
  for (let i = 0; i < lines.length; i++) {
    if (lines[i] === "  if (productMode === 'dm') {") {
      rootDmIdx = i;
      break;
    }
  }
  
  if (rootDmIdx !== -1) {
    lines.splice(rootDmIdx, 0, ...panelsLines);
    fs.writeFileSync(path, lines.join('\n'));
    console.log('Successfully moved panels to root level!');
  } else {
    console.log('Could not find root level dm mode block.');
  }
} else {
  console.log('Could not find panel boundaries.', panelStartIdx, panelEndIdx, replayEndIdx);
}
