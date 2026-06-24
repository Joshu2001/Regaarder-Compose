const fs = require('fs');
let content = fs.readFileSync('src/App.jsx', 'utf8');

// 1. Radar variants
const findRadar = `{ type: 'radar',           label: 'Radar / Spider', icon: <svg viewBox="0 0 24 24" width="24" height="24" fill="none" stroke="currentColor" strokeWidth="2"><polygon points="12,3 21,8.5 21,15.5 12,21 3,15.5 3,8.5"/><polygon points="12,7 17,9.8 17,14.2 12,17 7,14.2 7,9.8"/><line x1="12" y1="3" x2="12" y2="21"/><line x1="3" y1="8.5" x2="21" y2="15.5"/><line x1="21" y1="8.5" x2="3" y2="15.5"/></svg> },`;
const replaceRadar = `{ type: 'radar',           label: 'Radar', icon: <svg viewBox="0 0 24 24" width="24" height="24" fill="none" stroke="currentColor" strokeWidth="2"><polygon points="12,3 21,8.5 21,15.5 12,21 3,15.5 3,8.5"/><polygon points="12,7 17,9.8 17,14.2 12,17 7,14.2 7,9.8"/><line x1="12" y1="3" x2="12" y2="21"/><line x1="3" y1="8.5" x2="21" y2="15.5"/><line x1="21" y1="8.5" x2="3" y2="15.5"/></svg> },
                    { type: 'radar_markers',   label: 'With Markers', icon: <svg viewBox="0 0 24 24" width="24" height="24" fill="none" stroke="currentColor" strokeWidth="2"><polygon points="12,3 21,8.5 21,15.5 12,21 3,15.5 3,8.5"/><circle cx="12" cy="3" r="2" fill="currentColor"/><circle cx="21" cy="8.5" r="2" fill="currentColor"/><circle cx="21" cy="15.5" r="2" fill="currentColor"/><circle cx="12" cy="21" r="2" fill="currentColor"/><circle cx="3" cy="15.5" r="2" fill="currentColor"/><circle cx="3" cy="8.5" r="2" fill="currentColor"/></svg> },
                    { type: 'radar_filled',    label: 'Filled', icon: <svg viewBox="0 0 24 24" width="24" height="24" fill="none" stroke="currentColor" strokeWidth="2"><polygon points="12,3 21,8.5 21,15.5 12,21 3,15.5 3,8.5"/><polygon points="12,7 17,9.8 17,14.2 12,17 7,14.2 7,9.8" fill="currentColor" fillOpacity="0.5"/></svg> },`;
content = content.replace(findRadar, replaceRadar);

// 2. Stock category
const findAdvancedEnd = `                  ],
                },
                {
                  label: 'Financial & Operations',`;
const replaceStockCat = `                  ],
                },
                {
                  label: 'Stock',
                  accentColor: '#eab308',
                  charts: [
                    { type: 'hlc',             label: 'High-Low-Close', icon: <svg viewBox="0 0 24 24" width="24" height="24" fill="none" stroke="currentColor" strokeWidth="2"><line x1="6" y1="4" x2="6" y2="20"/><line x1="6" y1="16" x2="8" y2="16"/><line x1="12" y1="6" x2="12" y2="18"/><line x1="12" y1="14" x2="14" y2="14"/><line x1="18" y1="2" x2="18" y2="22"/><line x1="18" y1="18" x2="20" y2="18"/></svg> },
                    { type: 'ohlc',            label: 'OHLC',           icon: <svg viewBox="0 0 24 24" width="24" height="24" fill="none" stroke="currentColor" strokeWidth="2"><line x1="6" y1="4" x2="6" y2="20"/><line x1="4" y1="8" x2="6" y2="8"/><line x1="6" y1="16" x2="8" y2="16"/><line x1="12" y1="6" x2="12" y2="18"/><line x1="10" y1="10" x2="12" y2="10"/><line x1="12" y1="14" x2="14" y2="14"/><line x1="18" y1="2" x2="18" y2="22"/><line x1="16" y1="6" x2="18" y2="6"/><line x1="18" y1="18" x2="20" y2="18"/></svg> },
                    { type: 'candlestick',     label: 'Candlestick',    icon: <svg viewBox="0 0 24 24" width="24" height="24" fill="none" stroke="currentColor" strokeWidth="2"><line x1="6" y1="4" x2="6" y2="20"/><rect x="4" y="8" width="4" height="8" fill="currentColor"/><line x1="12" y1="6" x2="12" y2="18"/><rect x="10" y="10" width="4" height="4" fill="none"/><line x1="18" y1="2" x2="18" y2="22"/><rect x="16" y="6" width="4" height="12" fill="currentColor"/></svg> },
                    { type: 'volume',          label: 'Volume + OHLC',  icon: <svg viewBox="0 0 24 24" width="24" height="24" fill="none" stroke="currentColor" strokeWidth="2"><rect x="4" y="14" width="4" height="6" fill="currentColor"/><rect x="10" y="10" width="4" height="10" fill="currentColor"/><rect x="16" y="16" width="4" height="4" fill="currentColor"/></svg> },
                  ],
                },
                {
                  label: 'Financial & Operations',`;
content = content.replace(findAdvancedEnd, replaceStockCat);

// Remove the duplicates from Financial & Ops
content = content.replace(`{ type: 'ohlc',            label: 'OHLC',           icon: <svg viewBox="0 0 24 24" width="24" height="24" fill="none" stroke="currentColor" strokeWidth="2"><line x1="6" y1="4" x2="6" y2="20"/><line x1="4" y1="8" x2="6" y2="8"/><line x1="6" y1="16" x2="8" y2="16"/><line x1="12" y1="6" x2="12" y2="18"/><line x1="10" y1="10" x2="12" y2="10"/><line x1="12" y1="14" x2="14" y2="14"/><line x1="18" y1="2" x2="18" y2="22"/><line x1="16" y1="6" x2="18" y2="6"/><line x1="18" y1="18" x2="20" y2="18"/></svg> },`, '');
content = content.replace(`{ type: 'candlestick',     label: 'Candlestick',    icon: <svg viewBox="0 0 24 24" width="24" height="24" fill="none" stroke="currentColor" strokeWidth="2"><line x1="6" y1="4" x2="6" y2="20"/><rect x="4" y="8" width="4" height="8" fill="currentColor"/><line x1="12" y1="6" x2="12" y2="18"/><rect x="10" y="10" width="4" height="4" fill="none"/><line x1="18" y1="2" x2="18" y2="22"/><rect x="16" y="6" width="4" height="12" fill="currentColor"/></svg> },`, '');
content = content.replace(`{ type: 'volume',          label: 'Volume',         icon: <svg viewBox="0 0 24 24" width="24" height="24" fill="none" stroke="currentColor" strokeWidth="2"><rect x="4" y="14" width="4" height="6" fill="currentColor"/><rect x="10" y="10" width="4" height="10" fill="currentColor"/><rect x="16" y="16" width="4" height="4" fill="currentColor"/></svg> },`, '');

// 3. Remove percentage placeholders added previously
content = content.replace(/<text[^>]*>65<\/text>/, '');
content = content.replace(/<text[^>]*>85<\/text>/, '');
content = content.replace(/<text[^>]*>40<\/text>/, '');
content = content.replace(/<text[^>]*>60%<\/text>/, '');
content = content.replace(/<text[^>]*>80%<\/text>/, '');
content = content.replace(/<text[^>]*>40%<\/text>/, '');
content = content.replace(/<text[^>]*>25%<\/text>/g, '');
content = content.replace(/<text[^>]*>75%<\/text>/g, '');
content = content.replace(/<text[^>]*>55%<\/text>/, '');
content = content.replace(/<text[^>]*>30%<\/text>/, '');

// 4. Implement draggable Title and Legend
const titleWrapperFind = `<div className="w-full flex justify-center pointer-events-auto shrink-0 mb-1 z-10">`;
const titleWrapperReplace = `
                                        <div 
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

const legendWrapperFind = `{showLegend && (
                                          <div className="w-full flex justify-center gap-4 pointer-events-auto shrink-0 mb-2 z-10">`;
const legendWrapperReplace = `{showLegend && (
                                          <div 
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

content = content.replace(titleWrapperFind, titleWrapperReplace);
content = content.replace(legendWrapperFind, legendWrapperReplace);

// Remove the flex-col logic which constrained the svg to min-h-0 since we are absolute now
// The chart is inside `<div className="flex-1 w-full relative min-h-0">` which is okay.
// We just need to make sure the root container is still `flex-col` but title and legend are `absolute`.
// The Title and Legend elements are absolute, so they won't participate in flex flow, so the chart takes 100% space!

// Add extra Stock renderer for `hlc`
content = content.replace(`} else if (chartType === 'ohlc') {`, `} else if (chartType === 'hlc') {
                                        chartContent = (
                                          <g stroke={fillColor} strokeWidth="2">
                                            <line x1="20" y1="20" x2="20" y2="80" />
                                            <line x1="20" y1="70" x2="30" y2="70" />
                                            
                                            <line x1="50" y1="40" x2="50" y2="90" />
                                            <line x1="50" y1="80" x2="60" y2="80" />
                                            
                                            <line x1="80" y1="10" x2="80" y2="60" stroke={strokeColor} />
                                            <line x1="80" y1="20" x2="90" y2="20" stroke={strokeColor} />
                                          </g>
                                        );
                                    } else if (chartType === 'ohlc') {`);

// Add extra Radar renderers
content = content.replace(`} else if (chartType === 'radar') {
                                        chartContent = (`, `} else if (chartType === 'radar' || chartType === 'radar_markers' || chartType === 'radar_filled') {
                                        chartContent = (`);
content = content.replace(`</g>
                                        );
                                    } else if (chartType === 'treemap') {`, `{chartType === 'radar_markers' && (
                                              <>
                                                <circle cx="50" cy="15" r="2" fill={fillColor} />
                                                <circle cx="85" cy="35" r="2" fill={fillColor} />
                                                <circle cx="85" cy="70" r="2" fill={fillColor} />
                                                <circle cx="50" cy="85" r="2" fill={fillColor} />
                                                <circle cx="15" cy="70" r="2" fill={fillColor} />
                                                <circle cx="15" cy="35" r="2" fill={fillColor} />
                                                
                                                <circle cx="50" cy="35" r="2" fill={strokeColor} />
                                                <circle cx="65" cy="45" r="2" fill={strokeColor} />
                                                <circle cx="65" cy="60" r="2" fill={strokeColor} />
                                                <circle cx="50" cy="70" r="2" fill={strokeColor} />
                                                <circle cx="35" cy="60" r="2" fill={strokeColor} />
                                                <circle cx="35" cy="45" r="2" fill={strokeColor} />
                                              </>
                                            )}
                                            {chartType === 'radar_filled' && (
                                              <>
                                                <polygon points="50,15 85,35 85,70 50,85 15,70 15,35" fill={fillColor} opacity="0.3" />
                                                <polygon points="50,35 65,45 65,60 50,70 35,60 35,45" fill={strokeColor} opacity="0.4" />
                                              </>
                                            )}
                                            </g>
                                        );
                                    } else if (chartType === 'treemap') {`);


// Add Dropdown items to SHEET_SLASH_OPTIONS
const slashOptsFind = `{ key: 'clear_format', label: 'Clear Formatting', desc: 'Reset all cell styles' },`;
const slashOptsReplace = `{ key: 'clear_format', label: 'Clear Formatting', desc: 'Reset all cell styles' },
  { key: 'schedule', label: 'Schedule', desc: 'Add a scheduled event' },
  { key: 'translate', label: 'Translate', desc: 'Translate selected content' },
  { key: 'bookmark', label: 'Bookmark', desc: 'Add a bookmark' },
  // hyperlink is already there`;
content = content.replace(slashOptsFind, slashOptsReplace);

fs.writeFileSync('src/App.jsx', content);
console.log('Patch complete.');
