const fs = require('fs');

const filePath = 'src/App.jsx';
let content = fs.readFileSync(filePath, 'utf8');

const startMarker = '{/* Overlays */}';
const startIndex = content.indexOf(startMarker);

if (startIndex === -1) {
  console.error("Start marker not found!");
  process.exit(1);
}

const endStr = 'className="grid"';
let endIndex = content.indexOf(endStr, startIndex);

if (endIndex === -1) {
  console.error("End marker not found!");
  process.exit(1);
}

// Back up to the `<div` before `className="grid"`
endIndex = content.lastIndexOf('<div', endIndex);

const replacement = `{/* Overlays */}
                        {(activeSheetGridRaw.overlays || []).map(overlay => {
                           const left = overlay.x !== undefined ? overlay.x : (overlay.col * 100);
                           const top = overlay.y !== undefined ? overlay.y : (overlay.row * 36);
                           
                           // Default properties
                           const isSelected = selectedSheetOverlayId === overlay.id;
                           const rotation = overlay.rotation || 0;
                           const fillType = overlay.fillType || 'solid'; // 'solid', 'none', 'linear', 'radial'
                           const fillColor = overlay.fillColor || overlay.color || '#3b82f6';
                           const fillSecondaryColor = overlay.fillSecondaryColor || '#ffffff';
                           const gradientDirection = overlay.gradientDirection || '90deg';
                           const strokeType = overlay.strokeType || 'solid'; // 'solid', 'dashed', 'dotted', 'dash-dot', 'none'
                           const strokeColor = overlay.strokeColor || '#000000';
                           const strokeWidth = overlay.strokeWidth || 0;
                           const effectGlow = overlay.effectGlow || { active: false, intensity: 5, color: '#000000' };
                           const effectShadow = overlay.effectShadow || { active: false, blur: 4, distance: 4, opacity: 0.25, angle: 45 };
                           const effectBlur = overlay.effectBlur || { active: false, radius: 0 };
                           const opacity = overlay.opacity !== undefined ? overlay.opacity : 100;
                           const isLocked = overlay.isLocked || false;
                           
                           // SVG styling
                           let strokeDasharray = 'none';
                           if (strokeType === 'dashed') strokeDasharray = \`\${strokeWidth * 3}, \${strokeWidth * 3}\`;
                           else if (strokeType === 'dotted') strokeDasharray = \`\${strokeWidth}, \${strokeWidth * 2}\`;
                           else if (strokeType === 'dash-dot') strokeDasharray = \`\${strokeWidth * 3}, \${strokeWidth * 2}, \${strokeWidth}, \${strokeWidth * 2}\`;
                           
                           let fillDef = fillColor;
                           if (fillType === 'none') fillDef = 'none';
                           else if (fillType === 'linear' || fillType === 'radial') {
                             fillDef = \`url(#gradient-\${overlay.id})\`;
                           }

                           let filterDef = '';
                           if (effectShadow.active || effectGlow.active || effectBlur.active) {
                             filterDef = \`url(#filter-\${overlay.id})\`;
                           }

                           // Update function wrapper
                           const updateOverlay = (updates) => {
                             if (isLocked && !updates.isLocked && updates.isLocked !== false) return;
                             const newOverlays = (activeSheetGridRaw.overlays || []).map(o => o.id === overlay.id ? { ...o, ...updates } : o);
                             updateSheetSettings(activeSheetId, { overlays: newOverlays });
                           };

                           // Handle resizing setup
                           const handleResize = (e, dirX, dirY) => {
                             if (isLocked) return;
                             e.preventDefault(); e.stopPropagation();
                             const startX = e.clientX; const startY = e.clientY;
                             const startW = overlay.width; const startH = overlay.height;
                             const startL = left; const startT = top;
                             
                             const onMouseMove = (moveEvent) => {
                               let dx = (moveEvent.clientX - startX) / (sheetZoomLevel / 100);
                               let dy = (moveEvent.clientY - startY) / (sheetZoomLevel / 100);
                               let newW = startW; let newH = startH;
                               let newL = startL; let newT = startT;
                               
                               if (dirX === 1) newW = Math.max(20, startW + dx);
                               else if (dirX === -1) { newW = Math.max(20, startW - dx); newL = startL + (startW - newW); }
                               
                               if (dirY === 1) newH = Math.max(20, startH + dy);
                               else if (dirY === -1) { newH = Math.max(20, startH - dy); newT = startT + (startH - newH); }
                               
                               updateOverlay({ width: newW, height: newH, x: newL, y: newT });
                             };
                             const onMouseUp = () => { window.removeEventListener('mousemove', onMouseMove); window.removeEventListener('mouseup', onMouseUp); };
                             window.addEventListener('mousemove', onMouseMove); window.addEventListener('mouseup', onMouseUp);
                           };

                           const handleRotate = (e) => {
                             if (isLocked) return;
                             e.preventDefault(); e.stopPropagation();
                             const cx = left + overlay.width / 2;
                             const cy = top + overlay.height / 2;
                             const sheetEl = document.querySelector('.sheets-container') || document.body;
                             const sheetRect = sheetEl.getBoundingClientRect();
                             
                             const onMouseMove = (moveEvent) => {
                               const ex = moveEvent.clientX - sheetRect.left;
                               const ey = moveEvent.clientY - sheetRect.top;
                               const angle = Math.atan2(ey - cy, ex - cx) * 180 / Math.PI;
                               let newRot = Math.round(angle + 90);
                               if (newRot < 0) newRot += 360;
                               if (moveEvent.shiftKey) newRot = Math.round(newRot / 15) * 15;
                               updateOverlay({ rotation: newRot });
                             };
                             const onMouseUp = () => { window.removeEventListener('mousemove', onMouseMove); window.removeEventListener('mouseup', onMouseUp); };
                             window.addEventListener('mousemove', onMouseMove); window.addEventListener('mouseup', onMouseUp);
                           };

                           // Handle dragging
                           const handleDrag = (e) => {
                             if (isLocked) return;
                             if (!isSelected) {
                               setSelectedSheetOverlayId(overlay.id);
                             }
                             // if clicked on panel or handles, dont drag
                             if (e.target.closest('.resize-handle') || e.target.closest('.style-panel')) return;
                             
                             e.preventDefault(); e.stopPropagation();
                             const startX = e.clientX; const startY = e.clientY;
                             const startL = left; const startT = top;
                             const onMouseMove = (moveEvent) => {
                               const dx = (moveEvent.clientX - startX) / (sheetZoomLevel / 100);
                               const dy = (moveEvent.clientY - startY) / (sheetZoomLevel / 100);
                               updateOverlay({ x: startL + dx, y: startT + dy });
                             };
                             const onMouseUp = () => { window.removeEventListener('mousemove', onMouseMove); window.removeEventListener('mouseup', onMouseUp); };
                             window.addEventListener('mousemove', onMouseMove); window.addEventListener('mouseup', onMouseUp);
                           };

                           return (
                             <div 
                               key={overlay.id}
                               className={\`absolute z-[100] flex items-center justify-center text-sm \${isLocked ? 'cursor-not-allowed' : 'cursor-move'}\`}
                               style={{
                                 left: left,
                                 top: top,
                                 width: overlay.width,
                                 height: overlay.height,
                                 transform: \`rotate(\${rotation}deg)\`,
                                 opacity: opacity / 100,
                                 zIndex: isSelected ? 105 : 100,
                               }}
                               onMouseDown={handleDrag}
                             >
                               {/* The SVG Shape */}
                               {(() => {
                                 if (overlay.type === 'note') {
                                   return (
                                     <textarea
                                       className="w-full h-full bg-yellow-200 p-2 text-xs shadow-md resize-none border-none outline-none"
                                       value={overlay.content || ''}
                                       onChange={(e) => updateOverlay({ content: e.target.value })}
                                       onClick={(e) => { e.stopPropagation(); setSelectedSheetOverlayId(overlay.id); }}
                                       onMouseDown={e => e.stopPropagation()}
                                     />
                                   );
                                 } else if (overlay.type === 'rectangle' && overlay.shapeType) {
                                   const isLine = overlay.shapeType === 'line' || overlay.shapeType === 'arrow';
                                   const cr = overlay.cornerRadius || 0; // 0 to 50
                                   const rx = (cr / 100) * Math.min(overlay.width, overlay.height);
                                   
                                   const renderDefs = () => (
                                      <defs>
                                        {fillType === 'linear' && (
                                          <linearGradient id={\`gradient-\${overlay.id}\`} x1="0%" y1="0%" x2="100%" y2="100%">
                                            <stop offset="0%" stopColor={fillColor} />
                                            <stop offset="100%" stopColor={fillSecondaryColor} />
                                          </linearGradient>
                                        )}
                                        {fillType === 'radial' && (
                                          <radialGradient id={\`gradient-\${overlay.id}\`} cx="50%" cy="50%" r="50%">
                                            <stop offset="0%" stopColor={fillColor} />
                                            <stop offset="100%" stopColor={fillSecondaryColor} />
                                          </radialGradient>
                                        )}
                                        <filter id={\`filter-\${overlay.id}\`}>
                                          {effectShadow.active && (
                                            <feDropShadow dx={effectShadow.distance} dy={effectShadow.distance} stdDeviation={effectShadow.blur} floodOpacity={effectShadow.opacity} />
                                          )}
                                          {effectGlow.active && (
                                            <feDropShadow dx="0" dy="0" stdDeviation={effectGlow.intensity} floodColor={effectGlow.color} floodOpacity="1" />
                                          )}
                                          {effectBlur.active && (
                                            <feGaussianBlur stdDeviation={effectBlur.radius} />
                                          )}
                                        </filter>
                                      </defs>
                                   );

                                   let shapeContent = null;
                                   if (overlay.shapeType === 'rectangle' || overlay.shapeType === 'square') {
                                     shapeContent = <rect x="0" y="0" width="100%" height="100%" rx={rx} fill={fillDef} stroke={strokeType !== 'none' ? strokeColor : 'none'} strokeWidth={strokeWidth} strokeDasharray={strokeDasharray} filter={filterDef !== '' ? filterDef : undefined} />;
                                   } else if (overlay.shapeType === 'ellipse' || overlay.shapeType === 'circle') {
                                     shapeContent = <ellipse cx="50%" cy="50%" rx="50%" ry="50%" fill={fillDef} stroke={strokeType !== 'none' ? strokeColor : 'none'} strokeWidth={strokeWidth} strokeDasharray={strokeDasharray} filter={filterDef !== '' ? filterDef : undefined} />;
                                   } else if (overlay.shapeType === 'triangle') {
                                     shapeContent = <polygon points={\`\${overlay.width/2},0 \${overlay.width},\${overlay.height} 0,\${overlay.height}\`} fill={fillDef} stroke={strokeType !== 'none' ? strokeColor : 'none'} strokeWidth={strokeWidth} strokeDasharray={strokeDasharray} filter={filterDef !== '' ? filterDef : undefined} />;
                                   } else if (overlay.shapeType === 'diamond') {
                                     shapeContent = <polygon points={\`\${overlay.width/2},0 \${overlay.width},\${overlay.height/2} \${overlay.width/2},\${overlay.height} 0,\${overlay.height/2}\`} fill={fillDef} stroke={strokeType !== 'none' ? strokeColor : 'none'} strokeWidth={strokeWidth} strokeDasharray={strokeDasharray} filter={filterDef !== '' ? filterDef : undefined} />;
                                   } else if (isLine) {
                                     shapeContent = <line x1="0" y1="50%" x2="100%" y2="50%" stroke={strokeType !== 'none' ? strokeColor : fillColor} strokeWidth={strokeWidth || 4} strokeDasharray={strokeDasharray} filter={filterDef !== '' ? filterDef : undefined} />;
                                   } else {
                                     // Fallback
                                     shapeContent = <rect x="0" y="0" width="100%" height="100%" fill={fillDef} />;
                                   }

                                   return (
                                     <svg className="absolute inset-0 w-full h-full pointer-events-none drop-shadow-sm" preserveAspectRatio="none">
                                       {renderDefs()}
                                       {shapeContent}
                                     </svg>
                                   );
                                 }
                                 return overlay.content;
                               })()}
                               
                               {/* Smart Selection Frame & Resize Handles */}
                               {isSelected && !isLocked && (
                                 <>
                                   {/* Bounding box outline */}
                                   <div className="absolute inset-0 border border-blue-500 pointer-events-none rounded-[1px]" style={{ left: -1, right: -1, top: -1, bottom: -1 }} />
                                   
                                   {/* Rotation Handle */}
                                   <div className="resize-handle absolute top-[-30px] left-1/2 transform -translate-x-1/2 w-6 h-6 bg-white border border-gray-300 rounded-full shadow flex items-center justify-center cursor-grab hover:bg-gray-50" onMouseDown={handleRotate}>
                                     <RotateCw size={12} className="text-gray-600 pointer-events-none" />
                                   </div>
                                   <div className="absolute top-[-18px] left-1/2 w-px h-[18px] bg-blue-500 pointer-events-none" />

                                   {/* 8 Resize Handles */}
                                   <div className="resize-handle absolute top-0 left-0 w-3 h-3 bg-white border border-blue-500 rounded-full cursor-nwse-resize transform -translate-x-1/2 -translate-y-1/2" onMouseDown={e => handleResize(e, -1, -1)} />
                                   <div className="resize-handle absolute top-0 left-1/2 w-3 h-3 bg-white border border-blue-500 rounded-full cursor-ns-resize transform -translate-x-1/2 -translate-y-1/2" onMouseDown={e => handleResize(e, 0, -1)} />
                                   <div className="resize-handle absolute top-0 right-0 w-3 h-3 bg-white border border-blue-500 rounded-full cursor-nesw-resize transform translate-x-1/2 -translate-y-1/2" onMouseDown={e => handleResize(e, 1, -1)} />
                                   
                                   <div className="resize-handle absolute top-1/2 left-0 w-3 h-3 bg-white border border-blue-500 rounded-full cursor-ew-resize transform -translate-x-1/2 -translate-y-1/2" onMouseDown={e => handleResize(e, -1, 0)} />
                                   <div className="resize-handle absolute top-1/2 right-0 w-3 h-3 bg-white border border-blue-500 rounded-full cursor-ew-resize transform translate-x-1/2 -translate-y-1/2" onMouseDown={e => handleResize(e, 1, 0)} />
                                   
                                   <div className="resize-handle absolute bottom-0 left-0 w-3 h-3 bg-white border border-blue-500 rounded-full cursor-nesw-resize transform -translate-x-1/2 translate-y-1/2" onMouseDown={e => handleResize(e, -1, 1)} />
                                   <div className="resize-handle absolute bottom-0 left-1/2 w-3 h-3 bg-white border border-blue-500 rounded-full cursor-ns-resize transform -translate-x-1/2 translate-y-1/2" onMouseDown={e => handleResize(e, 0, 1)} />
                                   <div className="resize-handle absolute bottom-0 right-0 w-3 h-3 bg-white border border-blue-500 rounded-full cursor-nwse-resize transform translate-x-1/2 translate-y-1/2" onMouseDown={e => handleResize(e, 1, 1)} />

                                   {/* Floating Style Panel */}
                                   <div className="style-panel absolute top-full left-0 mt-4 bg-white/95 backdrop-blur-md rounded-xl shadow-2xl border border-gray-100 p-3 flex flex-col gap-3 z-[110] w-[260px] cursor-default" onMouseDown={e => e.stopPropagation()} onClick={e => e.stopPropagation()}>
                                     {/* Color Swatches */}
                                     <div className="flex gap-1.5 justify-center mb-1">
                                       {['#ef4444', '#3b82f6', '#22c55e', '#eab308', '#8b5cf6', '#000000', '#ffffff'].map(c => (
                                          <button key={c} className="w-6 h-6 rounded-full border border-gray-200 hover:scale-110 transition-transform" style={{ backgroundColor: c }} onClick={() => updateOverlay({ fillColor: c, color: c })} />
                                       ))}
                                     </div>

                                     <hr className="border-gray-100" />

                                     {/* Fill Options */}
                                     <div className="flex flex-col gap-2">
                                       <span className="text-xs font-semibold text-gray-500 uppercase">Fill</span>
                                       <div className="flex bg-gray-50 rounded-lg p-1">
                                         {['solid', 'none', 'linear'].map(t => (
                                            <button key={t} className={\`flex-1 text-[11px] py-1 rounded-md font-medium capitalize \${fillType === t ? 'bg-white shadow-sm text-gray-900' : 'text-gray-500 hover:text-gray-700'}\`} onClick={() => updateOverlay({ fillType: t })}>{t}</button>
                                         ))}
                                       </div>
                                     </div>

                                     {/* Stroke Options */}
                                     <div className="flex flex-col gap-2">
                                       <span className="text-xs font-semibold text-gray-500 uppercase">Stroke</span>
                                       <div className="flex bg-gray-50 rounded-lg p-1">
                                         {['none', 'solid', 'dashed'].map(t => (
                                            <button key={t} className={\`flex-1 text-[11px] py-1 rounded-md font-medium capitalize \${strokeType === t ? 'bg-white shadow-sm text-gray-900' : 'text-gray-500 hover:text-gray-700'}\`} onClick={() => updateOverlay({ strokeType: t })}>{t}</button>
                                         ))}
                                       </div>
                                       {strokeType !== 'none' && (
                                         <div className="flex items-center justify-between px-1 mt-1">
                                           <span className="text-[10px] text-gray-400">Color</span>
                                           <div className="flex gap-1">
                                             {['#000000', '#3b82f6', '#ef4444', '#22c55e'].map(c => (
                                                <button key={c} className="w-4 h-4 rounded-full border border-gray-200" style={{ backgroundColor: c }} onClick={() => updateOverlay({ strokeColor: c })} />
                                             ))}
                                           </div>
                                         </div>
                                       )}
                                       {strokeType !== 'none' && (
                                         <div className="flex items-center justify-between px-1">
                                           <span className="text-[10px] text-gray-400">Weight: {strokeWidth}px</span>
                                           <input type="range" min="1" max="24" value={strokeWidth} onChange={e => updateOverlay({ strokeWidth: parseInt(e.target.value) })} className="w-24 accent-blue-500" />
                                         </div>
                                       )}
                                     </div>

                                     {/* Appearance / Corners */}
                                     <div className="flex flex-col gap-2">
                                        <span className="text-xs font-semibold text-gray-500 uppercase">Appearance</span>
                                        <div className="flex items-center justify-between px-1">
                                           <span className="text-[10px] text-gray-400">Opacity: {opacity}%</span>
                                           <input type="range" min="0" max="100" value={opacity} onChange={e => updateOverlay({ opacity: parseInt(e.target.value) })} className="w-24 accent-blue-500" />
                                        </div>
                                        {overlay.shapeType === 'rectangle' && (
                                          <div className="flex items-center justify-between px-1">
                                             <span className="text-[10px] text-gray-400">Corners: {overlay.cornerRadius || 0}%</span>
                                             <input type="range" min="0" max="50" value={overlay.cornerRadius || 0} onChange={e => updateOverlay({ cornerRadius: parseInt(e.target.value) })} className="w-24 accent-blue-500" />
                                          </div>
                                        )}
                                     </div>

                                     {/* Effects */}
                                     <div className="flex flex-col gap-2">
                                        <span className="text-xs font-semibold text-gray-500 uppercase">Effects</span>
                                        <div className="grid grid-cols-3 gap-1">
                                           <button className={\`text-[10px] py-1.5 rounded border \${effectShadow.active ? 'border-blue-500 bg-blue-50 text-blue-700' : 'border-gray-200 bg-white text-gray-600'}\`} onClick={() => updateOverlay({ effectShadow: { ...effectShadow, active: !effectShadow.active } })}>Shadow</button>
                                           <button className={\`text-[10px] py-1.5 rounded border \${effectGlow.active ? 'border-blue-500 bg-blue-50 text-blue-700' : 'border-gray-200 bg-white text-gray-600'}\`} onClick={() => updateOverlay({ effectGlow: { ...effectGlow, active: !effectGlow.active } })}>Glow</button>
                                           <button className={\`text-[10px] py-1.5 rounded border \${effectBlur.active ? 'border-blue-500 bg-blue-50 text-blue-700' : 'border-gray-200 bg-white text-gray-600'}\`} onClick={() => updateOverlay({ effectBlur: { ...effectBlur, active: !effectBlur.active } })}>Blur</button>
                                        </div>
                                     </div>

                                     <hr className="border-gray-100" />
                                     <div className="flex justify-between px-1 pb-1">
                                       <button className="p-1.5 rounded text-gray-400 hover:text-gray-700 hover:bg-gray-100" onClick={() => updateOverlay({ isLocked: !isLocked })} title="Lock/Unlock">
                                         {isLocked ? <Lock size={14} /> : <Unlock size={14} />}
                                       </button>
                                       <button className="p-1.5 rounded text-red-400 hover:text-red-600 hover:bg-red-50" onClick={() => updateSheetSettings(activeSheetId, { overlays: activeSheetGridRaw.overlays.filter(o => o.id !== overlay.id) })} title="Delete">
                                         <Trash2 size={14} />
                                       </button>
                                     </div>
                                   </div>
                                 </>
                               )}
                             </div>
                           );
                        })}
`;

const newContent = content.substring(0, startIndex) + replacement + content.substring(endIndex);

fs.writeFileSync(filePath, newContent, 'utf8');
console.log('App.jsx updated successfully!');
