const fs = require('fs');
const path = 'c:\\Users\\user\\Downloads\\Project MOAT\\Regaarder Compose\\src\\App.jsx';
let content = fs.readFileSync(path, 'utf8');

// Find the start of the sidebars
const startMarker = "      {productMode !== 'landing' && !shareModalOpen && rightSidebarOpen && (";
const lines = content.split(/\r?\n/);

let sidebarStartIdx = -1;
for (let i = 0; i < lines.length; i++) {
  if (lines[i].includes("productMode !== 'landing' && !shareModalOpen && rightSidebarOpen && (")) {
    sidebarStartIdx = i;
    break;
  }
}

let sidebarEndIdx = -1;
for (let i = sidebarStartIdx; i < lines.length; i++) {
  if (lines[i].includes("roomState === 'active' && roomPanelMode === 'expanded' && mainView === 'room' && (")) {
    // The line BEFORE the empty line before roomState is the end of the sidebar
    sidebarEndIdx = i - 2;
    break;
  }
}

if (sidebarStartIdx !== -1 && sidebarEndIdx !== -1) {
  const sidebarLines = lines.slice(sidebarStartIdx, sidebarEndIdx + 1);
  const sidebarContent = sidebarLines.join('\n');
  
  // Remove sidebar lines from the array and replace with {sharedRightPanels}
  lines.splice(sidebarStartIdx, sidebarEndIdx - sidebarStartIdx + 1, '      {sharedRightPanels}');
  
  // Now we need to insert the declaration before line 16122
  let insertIdx = -1;
  for (let i = 0; i < lines.length; i++) {
    if (lines[i].includes("if (productMode === 'dm') {")) {
      insertIdx = i;
      break;
    }
  }
  
  if (insertIdx !== -1) {
    const declaration = `  const sharedRightPanels = (\n    <React.Fragment>\n${sidebarContent}\n    </React.Fragment>\n  );\n`;
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
      lines.splice(mainEndIdx + 1, 0, '\n        {sharedRightPanels}');
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
      lines.splice(manageenMainEndIdx + 1, 0, '\n        {sharedRightPanels}');
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
      lines.splice(dmMainEndIdx + 1, 0, '\n        {sharedRightPanels}');
    }
  }

  fs.writeFileSync(path, lines.join('\n'));
  console.log('Successfully refactored App.jsx!');
} else {
  console.log('Could not find sidebar boundaries.');
}
