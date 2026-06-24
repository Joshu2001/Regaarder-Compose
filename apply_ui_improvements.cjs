const fs = require('fs');

const filePath = 'src/App.jsx';
let content = fs.readFileSync(filePath, 'utf8');

// 1. Add isShapeInteracting state
if (!content.includes('const [isShapeInteracting, setIsShapeInteracting] = useState(false);')) {
  content = content.replace(
    "const [watermarkDragging, setWatermarkDragging] = useState(false);",
    "const [watermarkDragging, setWatermarkDragging] = useState(false);\n  const [isShapeInteracting, setIsShapeInteracting] = useState(false);"
  );
}

// 2. Update Shape Movement Behavior (handleDrag, handleResize, handleRotate)
// In handleDrag:
content = content.replace(
  "const onMouseMove = (moveEvent) => {",
  "setIsShapeInteracting(true);\n                             const onMouseMove = (moveEvent) => {"
);
content = content.replace(
  "const onMouseUp = () => { window.removeEventListener('mousemove', onMouseMove); window.removeEventListener('mouseup', onMouseUp); };",
  "const onMouseUp = () => { setIsShapeInteracting(false); window.removeEventListener('mousemove', onMouseMove); window.removeEventListener('mouseup', onMouseUp); };"
);

// In handleResize:
content = content.replace(
  "const onMouseMoveResize = (moveEvent) => {",
  "setIsShapeInteracting(true);\n                             const onMouseMoveResize = (moveEvent) => {"
);
content = content.replace(
  "const onMouseUpResize = () => { window.removeEventListener('mousemove', onMouseMoveResize); window.removeEventListener('mouseup', onMouseUpResize); };",
  "const onMouseUpResize = () => { setIsShapeInteracting(false); window.removeEventListener('mousemove', onMouseMoveResize); window.removeEventListener('mouseup', onMouseUpResize); };"
);

// In handleRotate:
content = content.replace(
  "const onMouseMoveRotate = (moveEvent) => {",
  "setIsShapeInteracting(true);\n                               const onMouseMoveRotate = (moveEvent) => {"
);
content = content.replace(
  "const onMouseUpRotate = () => { window.removeEventListener('mousemove', onMouseMoveRotate); window.removeEventListener('mouseup', onMouseUpRotate); };",
  "const onMouseUpRotate = () => { setIsShapeInteracting(false); window.removeEventListener('mousemove', onMouseMoveRotate); window.removeEventListener('mouseup', onMouseUpRotate); };"
);


// 3. Update Style Panel Positioning & Hide during Interaction
const oldPanelCheck = "{isSelected && !isLocked && (";
const newPanelCheck = "{isSelected && !isLocked && !isShapeInteracting && (";
content = content.replace(oldPanelCheck, newPanelCheck);

const oldPanelClass = "className=\"style-panel absolute top-full left-0 mt-4 bg-white/95 backdrop-blur-md rounded-xl shadow-2xl border border-gray-100 p-3 flex flex-col gap-3 z-[110] w-[260px] cursor-default\"";
// We want to dynamically position it based on `left`. 
// Wait, `left` is available in scope. 
const newPanelClass = "className=\"style-panel absolute top-0 bg-white/95 backdrop-blur-md rounded-xl shadow-2xl border border-gray-100 p-3 flex flex-col gap-3 z-[110] w-[260px] cursor-default max-h-[320px] overflow-y-auto thin-scrollbar\" style={{ [left > 280 ? 'right' : 'left']: 'calc(100% + 16px)' }}";
content = content.replace(oldPanelClass, newPanelClass);


// 4. Update Insert Shape Panel
// Remove close button
const closeButtonRegex = /<button\s*type="button"\s*className="w-6 h-6 flex items-center justify-center rounded-lg hover:bg-gray-100 text-gray-500 transition-colors"\s*onClick=\{\(\) => setSheetShapeMenu\(\{ open: false, left: 0, top: 0, anchorCell: null \}\)\}\s*>\s*<X size=\{14\} \/>\s*<\/button>/;
content = content.replace(closeButtonRegex, "");

// Change scrollbar
const shapeMenuScrollbarRegex = /className="flex-1 overflow-y-auto p-4 flex flex-col gap-6 custom-scrollbar"/;
content = content.replace(shapeMenuScrollbarRegex, 'className="flex-1 overflow-y-auto p-4 flex flex-col gap-6 thin-scrollbar"');

fs.writeFileSync(filePath, content, 'utf8');
console.log('UI improvements applied successfully!');
