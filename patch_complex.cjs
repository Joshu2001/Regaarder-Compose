const fs = require('fs');
const path = require('path');

const appPath = path.join(__dirname, 'src', 'App.jsx');
let content = fs.readFileSync(appPath, 'utf8');

// 1. Add multiSelectedCells state
if (!content.includes('multiSelectedCells')) {
  content = content.replace(
    /const \[selectedSheetCell, setSelectedSheetCell\] = useState\(\{ row: 1, col: 1 \}\);/,
    "const [selectedSheetCell, setSelectedSheetCell] = useState({ row: 1, col: 1 });\n  const [multiSelectedCells, setMultiSelectedCells] = useState([]);"
  );
}

// 2. Fix inline styling for fontSize and fontFamily
content = content.replace(
  /fontFamily: sheetToolbarFont,\s*fontSize: `\$\{sheetToolbarSize\}px`,/g,
  "fontFamily: cellFormat.fontFamily || sheetToolbarFont,\n                                        fontSize: cellFormat.fontSize ? `${cellFormat.fontSize}px` : `${sheetToolbarSize}px`,\n                                        textTransform: cellFormat.capitalization === 'UPPERCASE' ? 'uppercase' : cellFormat.capitalization === 'lowercase' ? 'lowercase' : cellFormat.capitalization === 'Title Case' ? 'capitalize' : undefined,"
);

// 3. Multi-Cell selection logic in onMouseDown
content = content.replace(
  /onMouseDown=\{\(e\) => \{\s*setSelectedSheetOverlayId\(null\);\s*if \(e\.shiftKey\)/,
  `onMouseDown={(e) => {
                                      setSelectedSheetOverlayId(null);
                                      if (e.ctrlKey || e.metaKey) {
                                        e.preventDefault();
                                        setMultiSelectedCells(prev => {
                                          const exists = prev.find(c => c.row === num && c.col === colIndex + 1);
                                          if (exists) return prev.filter(c => c.row !== num || c.col !== colIndex + 1);
                                          return [...prev, { row: num, col: colIndex + 1 }];
                                        });
                                        setSelectedSheetCell({ row: num, col: colIndex + 1 });
                                        setSheetSelectionMode('cell');
                                        return;
                                      } else if (!e.shiftKey) {
                                        setMultiSelectedCells([]);
                                      }
                                      if (e.shiftKey)`
);

// 4. Also clear multiSelectedCells in the standard single click to prevent lingering
content = content.replace(
  /\} else \{\s*setSelectedSheetCell\(\{ row: num, col: colIndex \+ 1 \}\);\s*setSelectedSheetRange\(\{ startRow: num, startCol: colIndex \+ 1, endRow: num, endCol: colIndex \+ 1 \}\);/g,
  `} else {
                                        setMultiSelectedCells([]);
                                        setSelectedSheetCell({ row: num, col: colIndex + 1 });
                                        setSelectedSheetRange({ startRow: num, startCol: colIndex + 1, endRow: num, endCol: colIndex + 1 });`
);

// 5. Add visual highlighting for multiSelectedCells
content = content.replace(
  /let isInRange = false;\s*if \(sheetSelectionMode === 'cell' && selectedSheetRange\)/,
  `let isInRange = false;
                                if (multiSelectedCells && multiSelectedCells.length > 0) {
                                  isInRange = multiSelectedCells.some(c => c.row === num && c.col === colIndex + 1);
                                } else if (sheetSelectionMode === 'cell' && selectedSheetRange)`
);

// 6. Fix updateSheetCellFormat to loop over multiSelectedCells
const oldFormatLoopCheck = `if (formatValue === undefined) {
          for (let r = startRow; r <= endRow; r++) {`;
const newFormatLoopCheck = `if (formatValue === undefined) {
          if (multiSelectedCells && multiSelectedCells.length > 0) {
            for (const cell of multiSelectedCells) {
              const r = cell.row - 1;
              const c = cell.col - 1;
              const cellFmtRaw = nextFormats[r]?.[c];
              const cellFmt = typeof cellFmtRaw === 'object' && cellFmtRaw !== null ? cellFmtRaw : {};
              if (!cellFmt[formatType]) {
                allHaveFormat = false;
                break;
              }
            }
          } else {
            for (let r = startRow; r <= endRow; r++) {`;
content = content.replace(oldFormatLoopCheck, newFormatLoopCheck);
// Close the else block properly after the endRow loops
content = content.replace(
  /break;\s*\}\s*const newValue = formatValue !== undefined \? formatValue : !allHaveFormat;/g,
  "break;\n          }\n        }\n        const newValue = formatValue !== undefined ? formatValue : !allHaveFormat;"
);

// Update application of newValue
const oldFormatApplyLoop = `for (let r = startRow; r <= endRow; r++) {
          if (!nextFormats[r]) nextFormats[r] = [];`;
const newFormatApplyLoop = `if (multiSelectedCells && multiSelectedCells.length > 0) {
          for (const cell of multiSelectedCells) {
            const r = cell.row - 1;
            const c = cell.col - 1;
            if (!nextFormats[r]) nextFormats[r] = [];
            const cellFmtRaw = nextFormats[r][c];
            const currentCellFmt = typeof cellFmtRaw === 'object' && cellFmtRaw !== null ? cellFmtRaw : { type: cellFmtRaw };
            if (currentCellFmt.type === null || currentCellFmt.type === undefined) delete currentCellFmt.type;
            
            if (formatValue === null || (newValue === false && typeof formatValue === 'boolean')) {
              const newFmt = { ...currentCellFmt };
              delete newFmt[formatType];
              nextFormats[r][c] = Object.keys(newFmt).length === 0 ? null : newFmt;
            } else {
              nextFormats[r][c] = { ...currentCellFmt, [formatType]: newValue };
            }
          }
        } else {
          for (let r = startRow; r <= endRow; r++) {
            if (!nextFormats[r]) nextFormats[r] = [];`;
content = content.replace(oldFormatApplyLoop, newFormatApplyLoop);

// Close the else block properly
content = content.replace(
  /nextFormats\[r\]\[c\] = \{ \.\.\.currentCellFmt, \[formatType\]: newValue \};\s*\}\s*\}\s*\}/g,
  "nextFormats[r][c] = { ...currentCellFmt, [formatType]: newValue };\n            }\n          }\n        }\n        }"
);

fs.writeFileSync(appPath, content, 'utf8');
console.log('App.jsx patched successfully');
