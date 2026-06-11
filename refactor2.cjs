const fs = require('fs');
const path = 'c:\\Users\\user\\Downloads\\Project MOAT\\Regaarder Compose\\src\\App.jsx';
let content = fs.readFileSync(path, 'utf8');
const lines = content.split(/\r?\n/);

let replayStartIdx = -1;
for (let i = 0; i < lines.length; i++) {
  if (lines[i].includes('{replayPanelOpen && (')) {
    replayStartIdx = i;
    break;
  }
}

let replayEndIdx = -1;
for (let i = replayStartIdx; i < lines.length; i++) {
  if (lines[i] === '        )}' && lines[i+2] && lines[i+2].includes('selectionActionMenuEnabled')) {
    replayEndIdx = i;
    break;
  }
}

if (replayStartIdx !== -1 && replayEndIdx !== -1) {
  const replayLines = lines.slice(replayStartIdx, replayEndIdx + 1);
  const replayContent = replayLines.join('\n');
  
  // Replace the original replay panel with {sharedReplayPanel}
  lines.splice(replayStartIdx, replayEndIdx - replayStartIdx + 1, '      {sharedReplayPanel}');
  
  // Find where to declare it
  let insertIdx = -1;
  for (let i = 0; i < lines.length; i++) {
    if (lines[i].includes("if (productMode === 'dm') {")) {
      insertIdx = i;
      break;
    }
  }
  
  if (insertIdx !== -1) {
    const declaration = `  const sharedReplayPanel = (\n    <React.Fragment>\n${replayContent}\n    </React.Fragment>\n  );\n`;
    lines.splice(insertIdx, 0, declaration);
  }
  
  // Inject into sheets/deck
  let sheetsStartIdx = -1;
  for (let i = 0; i < lines.length; i++) {
    if (lines[i].includes("if (productMode === 'deck' || productMode === 'sheets') {")) {
      sheetsStartIdx = i;
      break;
    }
  }
  if (sheetsStartIdx !== -1) {
    let mainEndIdx = -1;
    for (let i = sheetsStartIdx; i < lines.length; i++) {
      if (lines[i] === '        </main>') {
        mainEndIdx = i;
        break;
      }
    }
    if (mainEndIdx !== -1) {
      lines.splice(mainEndIdx + 1, 0, '\n        {sharedReplayPanel}');
    }
  }

  // Inject into manageen
  let manageenStartIdx = -1;
  for (let i = 0; i < lines.length; i++) {
    if (lines[i].includes("if (productMode === 'manageen') {")) {
      manageenStartIdx = i;
      break;
    }
  }
  if (manageenStartIdx !== -1) {
    let manageenMainEndIdx = -1;
    for (let i = manageenStartIdx; i < lines.length; i++) {
      if (lines[i] === '        </main>') {
        manageenMainEndIdx = i;
        break;
      }
    }
    if (manageenMainEndIdx !== -1) {
      lines.splice(manageenMainEndIdx + 1, 0, '\n        {sharedReplayPanel}');
    }
  }

  // Inject into dm
  let dmStartIdx = -1;
  for (let i = 0; i < lines.length; i++) {
    if (lines[i].includes("if (productMode === 'dm') {")) {
      dmStartIdx = i;
      break;
    }
  }
  if (dmStartIdx !== -1) {
    let dmMainEndIdx = -1;
    for (let i = dmStartIdx; i < lines.length; i++) {
      if (lines[i] === '        </main>') {
        dmMainEndIdx = i;
        break;
      }
    }
    if (dmMainEndIdx !== -1) {
      lines.splice(dmMainEndIdx + 1, 0, '\n        {sharedReplayPanel}');
    }
  }

  fs.writeFileSync(path, lines.join('\n'));
  console.log('Successfully extracted replay panel!');
} else {
  console.log('Could not find replay panel boundaries.');
}
