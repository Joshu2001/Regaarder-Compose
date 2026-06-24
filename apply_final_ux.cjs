const fs = require('fs');

const filePath = 'src/App.jsx';
let content = fs.readFileSync(filePath, 'utf8');

// 1. Add hoveringOverlayId state
if (!content.includes('const [hoveringOverlayId, setHoveringOverlayId] = useState(null);')) {
  content = content.replace(
    "const [isShapeInteracting, setIsShapeInteracting] = useState(false);",
    "const [isShapeInteracting, setIsShapeInteracting] = useState(false);\n  const [hoveringOverlayId, setHoveringOverlayId] = useState(null);"
  );
}

// 2. Add onMouseEnter and onMouseLeave to the shape overlay div
const overlayDivMarker = "className={`absolute z-[100] flex items-center justify-center text-sm group hover:outline hover:outline-2 hover:outline-blue-400/50 transition-all ${isLocked ? 'cursor-not-allowed' : 'cursor-move'}`}";
if (content.includes(overlayDivMarker)) {
  const newOverlayDivMarker = `${overlayDivMarker}\n                                   onMouseEnter={() => setHoveringOverlayId(overlay.id)}\n                                   onMouseLeave={() => setHoveringOverlayId(null)}`;
  content = content.replace(overlayDivMarker, newOverlayDivMarker);
}

// 3. Update the Insert Shape menu to hide on interaction or hover
const shapeMenuMarker = "className=\"fixed z-[99999] bg-white rounded-2xl shadow-[0_24px_60px_-12px_rgba(15,23,42,0.35)] border border-gray-200 overflow-hidden\"";
if (content.includes(shapeMenuMarker)) {
  const newShapeMenuMarker = "className={`fixed z-[99999] bg-white rounded-2xl shadow-[0_24px_60px_-12px_rgba(15,23,42,0.35)] border border-gray-200 overflow-hidden transition-opacity duration-200 ${isShapeInteracting || (hoveringOverlayId && hoveringOverlayId === sheetShapeMenu.editingOverlayId) ? 'opacity-0 pointer-events-none' : 'opacity-100'}`}";
  content = content.replace(shapeMenuMarker, newShapeMenuMarker);
}

// 4. Fix custom-scrollbar to thin-scrollbar for the Insert Shape menu
content = content.replace("className=\"flex-1 overflow-y-auto p-4 custom-scrollbar bg-slate-50\"", "className=\"flex-1 overflow-y-auto p-4 thin-scrollbar bg-slate-50\"");

// 5. Change default shape style to solid purple with no border
const oldPush = `newOverlays.push({
                              id: 'overlay-' + Date.now(),
                              type: 'rectangle',
                              shapeType: shape.type,
                              row: cellAnchor.startRow,
                              col: cellAnchor.startCol,
                              x: 60, y: 60, width: 120, height: 80,
                              content: '', color: '#7C3AED'
                            });`;
const newPush = `newOverlays.push({
                              id: 'overlay-' + Date.now(),
                              type: 'rectangle',
                              shapeType: shape.type,
                              row: cellAnchor.startRow,
                              col: cellAnchor.startCol,
                              x: 60, y: 60, width: 120, height: 80,
                              content: '', 
                              color: '#8b5cf6',
                              fillColor: '#8b5cf6',
                              strokeType: 'none',
                              fillType: 'solid'
                            });`;
if (content.includes(oldPush)) {
  content = content.replace(oldPush, newPush);
} else {
  // If formatting differs slightly, fallback regex
  content = content.replace(/content:\s*'',\s*color:\s*'#7C3AED'\s*\}\);/g, "content: '', color: '#8b5cf6', fillColor: '#8b5cf6', strokeType: 'none', fillType: 'solid' });");
}

fs.writeFileSync(filePath, content, 'utf8');
console.log('UI enhancements applied successfully!');
