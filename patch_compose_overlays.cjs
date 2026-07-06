const fs = require('fs');

const appPath = 'src/App.jsx';
let appCode = fs.readFileSync(appPath, 'utf8');

console.log("Adding states...");
const stateInjection = `
  const [composeOverlays, setComposeOverlays] = useState([]);
  const [selectedComposeOverlayId, setSelectedComposeOverlayId] = useState(null);
`;
appCode = appCode.replace(/const \[activeSheetGridRaw, setActiveSheetGridRaw\] = useState\(\(\) => [^)]+\);/, (match) => match + '\n' + stateInjection);

console.log("Updating insertChart...");
appCode = appCode.replace(
  /if \(!isSheetsMode\) \{\s*insertInlineChartBoxWithType\(type, sheetChartMenu\.savedRange\);\s*setSheetChartMenu\(\{ open: false, left: 0, top: 0, anchorCell: null \}\);\s*return;\s*\}/,
  `if (!isSheetsMode) {
        const newOverlays = [...(composeOverlays || [])];
        newOverlays.push({
          id: 'compose-overlay-' + Date.now(),
          type: 'chart',
          chartType: type,
          x: 100, y: 100, width: 320, height: 200,
        });
        setComposeOverlays(newOverlays);
        setSelectedComposeOverlayId(newOverlays[newOverlays.length - 1].id);
        setSheetChartMenu({ open: false, left: 0, top: 0, anchorCell: null });
        return;
      }`
);

console.log("Updating insertShape...");
appCode = appCode.replace(
  /if \(!isSheetsMode\) \{\s*insertInlineShapeBoxWithType\(shape\.type, sheetShapeMenu\.savedRange\);\s*setSheetShapeMenu\(\{ open: false, left: 0, top: 0, anchorCell: null \}\);\s*return;\s*\}/,
  `if (!isSheetsMode) {
        const newOverlays = [...(composeOverlays || [])];
        newOverlays.push({
          id: 'compose-overlay-' + Date.now(),
          type: 'shape',
          shapeType: shape.type,
          x: 100, y: 100, width: 100, height: 100,
        });
        setComposeOverlays(newOverlays);
        setSelectedComposeOverlayId(newOverlays[newOverlays.length - 1].id);
        setSheetShapeMenu({ open: false, left: 0, top: 0, anchorCell: null });
        return;
      }`
);

// We also need to find the activeSheetGridRaw.overlays.map loop and adapt it for composeOverlays.
console.log("Extracting overlay mapping logic...");
const startMarker = '{(activeSheetGridRaw.overlays || []).map(overlay => {';
const startIdx = appCode.indexOf(startMarker);
if (startIdx === -1) {
  console.error("Could not find startMarker!");
  process.exit(1);
}

// Simple brace matching to find the end of the map function
let braceCount = 0;
let endIdx = -1;
let started = false;

for (let i = startIdx; i < appCode.length; i++) {
  if (appCode[i] === '{') {
    braceCount++;
    started = true;
  } else if (appCode[i] === '}') {
    braceCount--;
  }
  
  if (started && braceCount === 0) {
    // We expect `})}` at the end
    endIdx = i + 2; // to include '})}'
    break;
  }
}

if (endIdx === -1) {
  console.error("Could not find end of map function!");
  process.exit(1);
}

const overlayMappingRaw = appCode.substring(startIdx, endIdx + 1);

// Adapt the mapping for Compose
let composeOverlayMapping = overlayMappingRaw.replace(/\(activeSheetGridRaw\.overlays \|\| \[\]\)/g, '(composeOverlays || [])');
composeOverlayMapping = composeOverlayMapping.replace(/selectedSheetOverlayId/g, 'selectedComposeOverlayId');
composeOverlayMapping = composeOverlayMapping.replace(/setSelectedSheetOverlayId/g, 'setSelectedComposeOverlayId');

// Replace the updateOverlay implementation inside the mapping
composeOverlayMapping = composeOverlayMapping.replace(
  /const updateOverlay = \(updates\) => \{[\s\S]*?updateSheetSettings\(activeSheetId, \{ overlays: newOverlays \}\);\s*\};/,
  `const updateOverlay = (updates) => {
                             if (isLocked && !updates.isLocked && updates.isLocked !== false) return;
                             const newOverlays = (composeOverlays || []).map(o => o.id === overlay.id ? { ...o, ...updates } : o);
                             setComposeOverlays(newOverlays);
                           };`
);

// Replace zoom level
composeOverlayMapping = composeOverlayMapping.replace(/sheetZoomLevel/g, 'zoomLevel');
// Replace the container selection for rotate:
composeOverlayMapping = composeOverlayMapping.replace(/document\.querySelector\('\.sheets-container'\)/g, "document.querySelector('.compose-editor-surface')");

console.log("Injecting composeOverlayMapping into Compose View...");

const composeSurfaceIdx = appCode.indexOf('className={`compose-editor-surface');
if (composeSurfaceIdx === -1) {
  console.error("Could not find compose-editor-surface!");
  process.exit(1);
}

const surfaceOpenStart = appCode.lastIndexOf('<div', composeSurfaceIdx);
const surfaceOpenEnd = appCode.indexOf('>', composeSurfaceIdx) + 1;

appCode = appCode.slice(0, surfaceOpenEnd) + '\\n' + composeOverlayMapping + '\\n' + appCode.slice(surfaceOpenEnd);

fs.writeFileSync(appPath, appCode);
console.log("Patched App.jsx successfully!");
