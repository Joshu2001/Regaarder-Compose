const fs = require('fs');
const file = 'c:\\Users\\user\\Downloads\\Project MOAT\\Regaarder Compose\\src\\App.jsx';
let content = fs.readFileSync(file, 'utf8');

const oldGridStart = `                    <div
                      className="grid border-b border-gray-300 bg-slate-50 text-[11px] font-semibold text-slate-700"
                      style={{ gridTemplateColumns: \`48px repeat(\${activeSheetGrid.cols}, minmax(100px, 1fr))\` }}
                    >
                      <div className="h-8 border-r border-gray-300" />
                      {Array.from({ length: activeSheetGrid.cols }, (_, colIndex) => toColumnLabel(colIndex)).map((col) => (
                        <div key={col} className="h-8 flex items-center justify-center border-r border-gray-300 last:border-r-0">{col}</div>
                      ))}
                    </div>
                    <div className="flex-1 overflow-y-auto thin-scrollbar relative bg-white">
                      <div className="grid grid-cols-[48px_1fr] origin-top-left" style={{ zoom: \`\${sheetZoomLevel}%\` }}>
                        <div className="border-r border-gray-300 bg-slate-50">
                          {Array.from({ length: activeSheetGrid.rows }, (_, idx) => idx + 1).map((num) => (
                            <div key={num} className="h-9 border-b border-gray-300 text-[11px] font-semibold text-slate-700 flex items-center justify-center">{num}</div>
                          ))}
                        </div>
                        <div
                          className="grid"
                          style={{ gridTemplateColumns: \`repeat(\${activeSheetGrid.cols}, minmax(100px, 1fr))\` }}
                        >
                          {Array.from({ length: activeSheetGrid.rows }).flatMap((_, rowIndex) => (
                            Array.from({ length: activeSheetGrid.cols }).map((__, colIndex) => {
                              const isSelected = selectedSheetCell.row === rowIndex + 1 && selectedSheetCell.col === colIndex + 1;
                              return (
                                <input
                                  key={\`\${rowIndex + 1}-\${colIndex + 1}\`}
                                  value={activeSheetGrid.cells?.[rowIndex]?.[colIndex] || ''}
                                  onFocus={() => setSelectedSheetCell({ row: rowIndex + 1, col: colIndex + 1 })}
                                  onChange={(event) => updateSheetCell(activeSheetId, rowIndex, colIndex, event.target.value)}
                                  className={\`h-9 border-b border-r border-gray-200 px-2 text-xs bg-white focus:outline-none \${isSelected ? 'ring-2 ring-violet-500 z-10' : ''}\`}
                                  style={{
                                    fontFamily: sheetToolbarFont,
                                    fontSize: \`\${sheetToolbarSize}px\`,
                                    fontWeight: sheetToolbarBold ? 700 : 400,
                                    fontStyle: sheetToolbarItalic ? 'italic' : 'normal',
                                    textDecoration: sheetToolbarUnderline ? 'underline' : 'none',
                                  }}
                                />
                              );
                            })
                          ))}
                        </div>
                      </div>
                    </div>`;

const newGridStart = `                    <div
                      className="grid border-b border-gray-300 bg-slate-50 text-[11px] font-semibold text-slate-700"
                      style={{ gridTemplateColumns: \`48px repeat(\${activeSheetGrid.cols}, minmax(100px, 1fr))\`, minWidth: 'max-content' }}
                    >
                      <div className="h-8 border-r border-gray-300" />
                      {Array.from({ length: activeSheetGrid.cols }, (_, colIndex) => toColumnLabel(colIndex)).map((col, colIndex) => (
                        <div key={col} className={\`h-8 flex items-center justify-center border-r border-gray-300 last:border-r-0 \${selectedSheetCell.col === colIndex + 1 ? 'bg-violet-100 text-violet-800' : ''}\`}>{col}</div>
                      ))}
                    </div>
                    <div className="flex-1 overflow-auto thin-scrollbar relative bg-white">
                      <div className="grid grid-cols-[48px_1fr] origin-top-left" style={{ zoom: \`\${sheetZoomLevel}%\`, minWidth: 'max-content' }}>
                        <div className="border-r border-gray-300 bg-slate-50">
                          {Array.from({ length: activeSheetGrid.rows }, (_, idx) => idx + 1).map((num) => (
                            <div key={num} className={\`h-9 border-b border-gray-300 text-[11px] font-semibold flex items-center justify-center \${selectedSheetCell.row === num ? 'bg-violet-100 text-violet-800' : 'text-slate-700'}\`}>{num}</div>
                          ))}
                        </div>
                        <div
                          className="grid"
                          style={{ gridTemplateColumns: \`repeat(\${activeSheetGrid.cols}, minmax(100px, 1fr))\` }}
                        >
                          {Array.from({ length: activeSheetGrid.rows }).flatMap((_, rowIndex) => (
                            Array.from({ length: activeSheetGrid.cols }).map((__, colIndex) => {
                              const isSelected = selectedSheetCell.row === rowIndex + 1 && selectedSheetCell.col === colIndex + 1;
                              return (
                                <div key={\`\${rowIndex + 1}-\${colIndex + 1}\`} className={\`relative h-9 border-b border-r border-gray-200 \${isSelected ? 'ring-2 ring-violet-600 z-10' : ''}\`}>
                                  <input
                                    value={activeSheetGrid.cells?.[rowIndex]?.[colIndex] || ''}
                                    onFocus={() => setSelectedSheetCell({ row: rowIndex + 1, col: colIndex + 1 })}
                                    onChange={(event) => updateSheetCell(activeSheetId, rowIndex, colIndex, event.target.value)}
                                    className="w-full h-full px-2 text-xs bg-transparent focus:outline-none"
                                    style={{
                                      fontFamily: sheetToolbarFont,
                                      fontSize: \`\${sheetToolbarSize}px\`,
                                      fontWeight: sheetToolbarBold ? 700 : 400,
                                      fontStyle: sheetToolbarItalic ? 'italic' : 'normal',
                                      textDecoration: sheetToolbarUnderline ? 'underline' : 'none',
                                    }}
                                  />
                                  {isSelected && (
                                    <div className="absolute -bottom-1 -right-1 w-[7px] h-[7px] rounded-full bg-violet-600 z-20 cursor-crosshair border border-white" />
                                  )}
                                </div>
                              );
                            })
                          ))}
                        </div>
                      </div>
                    </div>`;

if (content.includes(oldGridStart)) {
  content = content.replace(oldGridStart, newGridStart);
  fs.writeFileSync(file, content, 'utf8');
  console.log('Replacement successful');
} else {
  console.log('Old grid block not found exactly as expected.');
}
