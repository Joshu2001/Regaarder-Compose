const fs = require('fs');
let content = fs.readFileSync('src/App.jsx', 'utf8');

// 1. Stock category
const financialCatStr = `label: 'Financial & Operations',`;
const stockCatInsert = `              {
                label: 'Stock',
                accentColor: '#eab308',
                charts: [
                  { type: 'hlc',             label: 'High-Low-Close', icon: <svg viewBox="0 0 24 24" width="24" height="24" fill="none" stroke="currentColor" strokeWidth="2"><line x1="6" y1="4" x2="6" y2="20"/><line x1="6" y1="16" x2="8" y2="16"/><line x1="12" y1="6" x2="12" y2="18"/><line x1="12" y1="14" x2="14" y2="14"/><line x1="18" y1="2" x2="18" y2="22"/><line x1="18" y1="18" x2="20" y2="18"/></svg> },
                  { type: 'ohlc',            label: 'OHLC',           icon: <svg viewBox="0 0 24 24" width="24" height="24" fill="none" stroke="currentColor" strokeWidth="2"><line x1="6" y1="4" x2="6" y2="20"/><line x1="4" y1="8" x2="6" y2="8"/><line x1="6" y1="16" x2="8" y2="16"/><line x1="12" y1="6" x2="12" y2="18"/><line x1="10" y1="10" x2="12" y2="10"/><line x1="12" y1="14" x2="14" y2="14"/><line x1="18" y1="2" x2="18" y2="22"/><line x1="16" y1="6" x2="18" y2="6"/><line x1="18" y1="18" x2="20" y2="18"/></svg> },
                  { type: 'candlestick',     label: 'Candlestick',    icon: <svg viewBox="0 0 24 24" width="24" height="24" fill="none" stroke="currentColor" strokeWidth="2"><line x1="6" y1="4" x2="6" y2="20"/><rect x="4" y="8" width="4" height="8" fill="currentColor"/><line x1="12" y1="6" x2="12" y2="18"/><rect x="10" y="10" width="4" height="4" fill="none"/><line x1="18" y1="2" x2="18" y2="22"/><rect x="16" y="6" width="4" height="12" fill="currentColor"/></svg> },
                  { type: 'volume',          label: 'Volume + OHLC',  icon: <svg viewBox="0 0 24 24" width="24" height="24" fill="none" stroke="currentColor" strokeWidth="2"><rect x="4" y="14" width="4" height="6" fill="currentColor"/><rect x="10" y="10" width="4" height="10" fill="currentColor"/><rect x="16" y="16" width="4" height="4" fill="currentColor"/></svg> },
                ],
              },
`;

if (content.indexOf(stockCatInsert) === -1) {
  content = content.replace(financialCatStr, stockCatInsert + '              {\n                ' + financialCatStr);
}


// 2. Radar variants
if (content.indexOf("type: 'radar_markers'") === -1) {
  content = content.replace(/{ type: 'radar',[\s\S]*?},/, `{ type: 'radar',           label: 'Radar', icon: <svg viewBox="0 0 24 24" width="24" height="24" fill="none" stroke="currentColor" strokeWidth="2"><polygon points="12,3 21,8.5 21,15.5 12,21 3,15.5 3,8.5"/><polygon points="12,7 17,9.8 17,14.2 12,17 7,14.2 7,9.8"/><line x1="12" y1="3" x2="12" y2="21"/><line x1="3" y1="8.5" x2="21" y2="15.5"/><line x1="21" y1="8.5" x2="3" y2="15.5"/></svg> },
                  { type: 'radar_markers',   label: 'With Markers', icon: <svg viewBox="0 0 24 24" width="24" height="24" fill="none" stroke="currentColor" strokeWidth="2"><polygon points="12,3 21,8.5 21,15.5 12,21 3,15.5 3,8.5"/><circle cx="12" cy="3" r="2" fill="currentColor"/><circle cx="21" cy="8.5" r="2" fill="currentColor"/><circle cx="21" cy="15.5" r="2" fill="currentColor"/><circle cx="12" cy="21" r="2" fill="currentColor"/><circle cx="3" cy="15.5" r="2" fill="currentColor"/><circle cx="3" cy="8.5" r="2" fill="currentColor"/></svg> },
                  { type: 'radar_filled',    label: 'Filled', icon: <svg viewBox="0 0 24 24" width="24" height="24" fill="none" stroke="currentColor" strokeWidth="2"><polygon points="12,3 21,8.5 21,15.5 12,21 3,15.5 3,8.5"/><polygon points="12,7 17,9.8 17,14.2 12,17 7,14.2 7,9.8" fill="currentColor" fillOpacity="0.5"/></svg> },`);
}


// 3. Dropdown items in SHEET_SLASH_OPTIONS
const clearFormatIndex = content.indexOf("{ key: 'clear_format', label: 'Clear Formatting', desc: 'Reset all cell styles' },");
if (clearFormatIndex > -1 && content.indexOf("{ key: 'schedule', label: 'Schedule'") === -1) {
  content = content.replace(
    "{ key: 'clear_format', label: 'Clear Formatting', desc: 'Reset all cell styles' },",
    `{ key: 'clear_format', label: 'Clear Formatting', desc: 'Reset all cell styles' },
  { key: 'schedule', label: 'Schedule', desc: 'Add a scheduled event' },
  { key: 'translate', label: 'Translate', desc: 'Translate selected content' },
  { key: 'bookmark', label: 'Bookmark', desc: 'Add a bookmark' },`
  );
}


// 4. Draggable Title and Legend fix in BOTH chart renders if necessary, but actually there is only ONE chart render inside the overlay mapping, 
// The other one is inside a different mapping? Wait, let's fix the Title and Legend logic if it failed.
const titleFindStr = `<div className="absolute top-2 left-0 w-full flex justify-center pointer-events-auto">`;
const titleRepStr = `<div 
                                          className="absolute pointer-events-auto z-10 cursor-move"
                                          style={{ 
                                            top: overlay.titlePos ? overlay.titlePos.y : '8px', 
                                            left: overlay.titlePos ? overlay.titlePos.x : '50%',
                                            transform: overlay.titlePos ? 'none' : 'translateX(-50%)'
                                          }}
                                          onPointerDown={(e) => {
                                            e.stopPropagation();
                                            const startX = e.clientX;
                                            const startY = e.clientY;
                                            const el = e.currentTarget;
                                            const currentX = overlay.titlePos ? parseInt(overlay.titlePos.x) : el.offsetLeft;
                                            const currentY = overlay.titlePos ? parseInt(overlay.titlePos.y) : el.offsetTop;
                                            
                                            const onMove = (moveEvent) => {
                                              updateOverlay({ titlePos: { x: (currentX + (moveEvent.clientX - startX)) + 'px', y: (currentY + (moveEvent.clientY - startY)) + 'px' } });
                                            };
                                            const onUp = () => {
                                              document.removeEventListener('pointermove', onMove);
                                              document.removeEventListener('pointerup', onUp);
                                            };
                                            document.addEventListener('pointermove', onMove);
                                            document.addEventListener('pointerup', onUp);
                                          }}
                                        >`;

if (content.indexOf(titleFindStr) !== -1) {
    content = content.replace(titleFindStr, titleRepStr);
}

const legendFindStr = `<div className="absolute top-8 left-0 w-full flex justify-center gap-4 pointer-events-auto">`;
const legendRepStr = `<div 
                                            className="absolute flex gap-4 pointer-events-auto z-10 cursor-move"
                                            style={{ 
                                              top: overlay.legendPos ? overlay.legendPos.y : '32px', 
                                              left: overlay.legendPos ? overlay.legendPos.x : '50%',
                                              transform: overlay.legendPos ? 'none' : 'translateX(-50%)'
                                            }}
                                            onPointerDown={(e) => {
                                              e.stopPropagation();
                                              const startX = e.clientX;
                                              const startY = e.clientY;
                                              const el = e.currentTarget;
                                              const currentX = overlay.legendPos ? parseInt(overlay.legendPos.x) : el.offsetLeft;
                                              const currentY = overlay.legendPos ? parseInt(overlay.legendPos.y) : el.offsetTop;
                                              
                                              const onMove = (moveEvent) => {
                                                updateOverlay({ legendPos: { x: (currentX + (moveEvent.clientX - startX)) + 'px', y: (currentY + (moveEvent.clientY - startY)) + 'px' } });
                                              };
                                              const onUp = () => {
                                                document.removeEventListener('pointermove', onMove);
                                                document.removeEventListener('pointerup', onUp);
                                              };
                                              document.addEventListener('pointermove', onMove);
                                              document.addEventListener('pointerup', onUp);
                                            }}
                                          >`;

if (content.indexOf(legendFindStr) !== -1) {
    content = content.replace(legendFindStr, legendRepStr);
}


fs.writeFileSync('src/App.jsx', content);
console.log('Patch complete.');
