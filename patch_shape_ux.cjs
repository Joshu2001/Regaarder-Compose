const fs = require('fs');
let code = fs.readFileSync('src/App.jsx', 'utf8');

// 1. Style Panel - restore resize handles while interacting and hide style panel
code = code.replace('{isSelected && !isLocked && !isShapeInteracting && (', '{isSelected && !isLocked && (');

const panelRegex = /<div className="style-panel absolute top-0 bg-white\/95 backdrop-blur-md rounded-xl shadow-2xl border border-gray-100 p-3 flex flex-col gap-3 z-\[110\] w-\[260px\] cursor-default max-h-\[320px\] overflow-y-auto thin-scrollbar"(.+?)>/;
code = code.replace(panelRegex, '<div className={`style-panel absolute top-0 bg-white/95 backdrop-blur-md rounded-xl shadow-2xl border border-gray-100 p-3 flex flex-col gap-3 z-[110] w-[260px] cursor-default max-h-[320px] overflow-y-auto thin-scrollbar transition-opacity duration-200 ${isShapeInteracting ? \'opacity-0 pointer-events-none\' : \'opacity-100\'}`}$1>');

// 2. Color picker replacement
// Fill Colors
code = code.replace(
  /{(?:\[|'#ef4444',\s*'#3b82f6',\s*'#22c55e',\s*'#eab308',\s*'#8b5cf6',\s*'#000000',\s*'#ffffff'|\])*}\.map\(c => \(/,
  `{['#ef4444', '#3b82f6', '#22c55e', '#eab308', '#8b5cf6', '#000000'].map(c => (`
);
code = code.replace(
  /<hr className="border-gray-100" \/>/,
  `<label className="w-6 h-6 rounded-full border border-gray-200 cursor-pointer overflow-hidden relative hover:scale-110 transition-transform flex items-center justify-center shrink-0">
                                         <input type="color" className="absolute opacity-0 w-8 h-8 cursor-pointer" value={fillColor} onChange={(e) => updateOverlay({ fillColor: e.target.value, color: e.target.value })} />
                                         <div className="w-full h-full bg-[conic-gradient(red,yellow,green,cyan,blue,magenta,red)]" />
                                       </label>
                                     </div>

                                     <hr className="border-gray-100" />`
);

// Stroke Colors
code = code.replace(
  /{(?:\[|'#000000',\s*'#3b82f6',\s*'#ef4444',\s*'#22c55e'|\])*}\.map\(c => \(/,
  `{['#000000', '#3b82f6', '#ef4444'].map(c => (`
);
code = code.replace(
  /}\)\}\s*<\/div>\s*<\/div>\s*\{\/\* Appearance \*\/\}/,
  `})}
                                         <label className="w-6 h-6 rounded-full border border-gray-200 cursor-pointer overflow-hidden relative hover:scale-110 transition-transform flex items-center justify-center shrink-0">
                                           <input type="color" className="absolute opacity-0 w-8 h-8 cursor-pointer" value={strokeColor} onChange={(e) => updateOverlay({ strokeColor: e.target.value })} />
                                           <div className="w-full h-full bg-[conic-gradient(red,yellow,green,cyan,blue,magenta,red)]" />
                                         </label>
                                       </div>
                                     </div>

                                     {/* Appearance */}`
);

// 3. Grid Cell selection suppression during shape drag
code = code.replace(
  "const isColSelected = selectedSheetRange && sheetSelectionMode === 'col'",
  "const isColSelected = !isShapeInteracting && selectedSheetRange && sheetSelectionMode === 'col'"
);
code = code.replace(
  "const isColActive = sheetSelectionMode === 'cell' && selectedSheetCell && selectedSheetCell.col === colIndex + 1;",
  "const isColActive = !isShapeInteracting && sheetSelectionMode === 'cell' && selectedSheetCell && selectedSheetCell.col === colIndex + 1;"
);
code = code.replace(
  "const isRowSelected = selectedSheetRange && sheetSelectionMode === 'row'",
  "const isRowSelected = !isShapeInteracting && selectedSheetRange && sheetSelectionMode === 'row'"
);
code = code.replace(
  "const isRowActive = sheetSelectionMode === 'cell' && selectedSheetCell && selectedSheetCell.row === rowIndex + 1;",
  "const isRowActive = !isShapeInteracting && sheetSelectionMode === 'cell' && selectedSheetCell && selectedSheetCell.row === rowIndex + 1;"
);
code = code.replace(
  "const isSelected = isExplicitAnchor || isInRange;",
  "const isSelected = !isShapeInteracting && (isExplicitAnchor || isInRange);"
);
code = code.replace(
  "const shadowStyle = shadows.length > 0 ? { boxShadow: shadows.join(', '), zIndex: 11 } : {};",
  "const shadowStyle = shadows.length > 0 && !isShapeInteracting ? { boxShadow: shadows.join(', '), zIndex: 11 } : {};"
);
code = code.replace(
  "const isInColBand = sheetSelectionMode === 'col'",
  "const isInColBand = !isShapeInteracting && sheetSelectionMode === 'col'"
);
code = code.replace(
  "const isInRowBand = sheetSelectionMode === 'row'",
  "const isInRowBand = !isShapeInteracting && sheetSelectionMode === 'row'"
);
code = code.replace(
  "const isAllSelected = sheetSelectionMode === 'all';",
  "const isAllSelected = !isShapeInteracting && sheetSelectionMode === 'all';"
);

fs.writeFileSync('src/App.jsx', code, 'utf8');
console.log('App.jsx patched successfully');
