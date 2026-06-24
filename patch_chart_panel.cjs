const fs = require('fs');
let code = fs.readFileSync('src/App.jsx', 'utf8');

const target = `                                   {/* Floating Style Panel */}
                                   <div className={\`style-panel absolute top-0 bg-white/95 backdrop-blur-md rounded-xl shadow-2xl border border-gray-100 p-3 flex flex-col gap-3 z-[110] w-[260px] cursor-default max-h-[320px] overflow-y-auto thin-scrollbar transition-opacity duration-200 \${isShapeInteracting ? 'opacity-0 pointer-events-none' : 'opacity-100'}\`} style={{ [left > 280 ? 'right' : 'left']: 'calc(100% + 16px)' }} onMouseDown={e => e.stopPropagation()} onClick={e => e.stopPropagation()}>`;

const replacement = `                                   {/* Floating Style Panel */}
                                   {overlay.type === 'chart' ? (
                                      <div className={\`style-panel absolute top-0 bg-white/95 backdrop-blur-md rounded-2xl shadow-2xl border border-gray-100 p-4 flex flex-col gap-4 z-[110] w-[280px] cursor-default max-h-[360px] overflow-y-auto thin-scrollbar transition-opacity duration-200 \${isShapeInteracting ? 'opacity-0 pointer-events-none' : 'opacity-100'}\`} style={{ [left > 280 ? 'right' : 'left']: 'calc(100% + 16px)' }} onMouseDown={e => e.stopPropagation()} onClick={e => e.stopPropagation()}>
                                        <div className="flex items-center justify-between mb-1">
                                          <span className="text-[12px] font-semibold text-slate-800">Chart Styles</span>
                                        </div>

                                        <div className="flex flex-col gap-2">
                                          <p className="text-[10px] uppercase tracking-wider font-semibold text-slate-400">Theme</p>
                                          <div className="flex bg-gray-100/50 p-1 rounded-lg">
                                            <button type="button" onClick={() => updateOverlay({ chartTheme: 'light' })} className={\`flex-1 py-1.5 text-[11px] font-medium rounded-md transition-colors \${overlay.chartTheme !== 'dark' ? 'bg-white text-slate-800 shadow-sm' : 'text-slate-500 hover:text-slate-700'}\`}>Light</button>
                                            <button type="button" onClick={() => updateOverlay({ chartTheme: 'dark' })} className={\`flex-1 py-1.5 text-[11px] font-medium rounded-md transition-colors \${overlay.chartTheme === 'dark' ? 'bg-slate-800 text-white shadow-sm' : 'text-slate-500 hover:text-slate-700'}\`}>Dark</button>
                                          </div>
                                        </div>

                                        <hr className="border-gray-100" />

                                        <div className="flex flex-col gap-2">
                                          <p className="text-[10px] uppercase tracking-wider font-semibold text-slate-400">Colors</p>
                                          <div className="flex items-center justify-between">
                                            <span className="text-[12px] text-slate-600">Primary Series</span>
                                            <div className="flex gap-1.5">
                                              {['#ef4444', '#3b82f6', '#22c55e', '#8b5cf6'].map(c => (
                                                <button key={c} className="w-5 h-5 rounded-full border border-gray-200 hover:scale-110 transition-transform shadow-sm" style={{ backgroundColor: c }} onClick={() => updateOverlay({ fillColor: c })} />
                                              ))}
                                              <label className="w-5 h-5 rounded-full border border-gray-200 shadow-sm ring-1 ring-black/5 cursor-pointer overflow-hidden relative hover:scale-110 transition-transform flex items-center justify-center shrink-0">
                                                <input type="color" className="absolute opacity-0 w-8 h-8 cursor-pointer" value={overlay.fillColor || '#3b82f6'} onChange={(e) => updateOverlay({ fillColor: e.target.value })} />
                                                <div className="w-full h-full bg-[conic-gradient(red,yellow,green,cyan,blue,magenta,red)]" />
                                              </label>
                                            </div>
                                          </div>
                                          <div className="flex items-center justify-between mt-1">
                                            <span className="text-[12px] text-slate-600">Secondary Series</span>
                                            <div className="flex gap-1.5">
                                              {['#f87171', '#60a5fa', '#4ade80', '#e2e8f0'].map(c => (
                                                <button key={c} className="w-5 h-5 rounded-full border border-gray-200 hover:scale-110 transition-transform shadow-sm" style={{ backgroundColor: c }} onClick={() => updateOverlay({ strokeColor: c })} />
                                              ))}
                                              <label className="w-5 h-5 rounded-full border border-gray-200 shadow-sm ring-1 ring-black/5 cursor-pointer overflow-hidden relative hover:scale-110 transition-transform flex items-center justify-center shrink-0">
                                                <input type="color" className="absolute opacity-0 w-8 h-8 cursor-pointer" value={overlay.strokeColor || '#e2e8f0'} onChange={(e) => updateOverlay({ strokeColor: e.target.value })} />
                                                <div className="w-full h-full bg-[conic-gradient(red,yellow,green,cyan,blue,magenta,red)]" />
                                              </label>
                                            </div>
                                          </div>
                                        </div>

                                        <hr className="border-gray-100" />

                                        <div className="flex flex-col gap-3">
                                          <p className="text-[10px] uppercase tracking-wider font-semibold text-slate-400">Elements</p>
                                          <label className="flex items-center justify-between cursor-pointer group">
                                            <span className="text-[12px] text-slate-600 group-hover:text-slate-800 transition-colors">Show Axes & Grid</span>
                                            <div className={\`w-8 h-4 rounded-full transition-colors relative \${overlay.showAxes !== false ? 'bg-violet-500' : 'bg-gray-200'}\`}>
                                              <div className={\`absolute top-0.5 left-0.5 w-3 h-3 bg-white rounded-full transition-transform shadow-sm \${overlay.showAxes !== false ? 'translate-x-4' : 'translate-x-0'}\`} />
                                              <input type="checkbox" className="hidden" checked={overlay.showAxes !== false} onChange={(e) => updateOverlay({ showAxes: e.target.checked })} />
                                            </div>
                                          </label>
                                          <label className="flex items-center justify-between cursor-pointer group">
                                            <span className="text-[12px] text-slate-600 group-hover:text-slate-800 transition-colors">Show Legend</span>
                                            <div className={\`w-8 h-4 rounded-full transition-colors relative \${overlay.showLegend !== false ? 'bg-violet-500' : 'bg-gray-200'}\`}>
                                              <div className={\`absolute top-0.5 left-0.5 w-3 h-3 bg-white rounded-full transition-transform shadow-sm \${overlay.showLegend !== false ? 'translate-x-4' : 'translate-x-0'}\`} />
                                              <input type="checkbox" className="hidden" checked={overlay.showLegend !== false} onChange={(e) => updateOverlay({ showLegend: e.target.checked })} />
                                            </div>
                                          </label>
                                        </div>

                                        <div className="flex flex-col gap-2 mt-1">
                                          <div className="flex items-center justify-between">
                                            <p className="text-[10px] uppercase tracking-wider font-semibold text-slate-400">Opacity</p>
                                            <span className="text-[10px] text-slate-400">{opacity}%</span>
                                          </div>
                                          <input type="range" min="0" max="100" value={opacity} onChange={(e) => updateOverlay({ opacity: parseInt(e.target.value) })} className="w-full h-1.5 bg-gray-200 rounded-lg appearance-none cursor-pointer accent-violet-500" />
                                        </div>
                                      </div>
                                   ) : (
                                   <div className={\`style-panel absolute top-0 bg-white/95 backdrop-blur-md rounded-xl shadow-2xl border border-gray-100 p-3 flex flex-col gap-3 z-[110] w-[260px] cursor-default max-h-[320px] overflow-y-auto thin-scrollbar transition-opacity duration-200 \${isShapeInteracting ? 'opacity-0 pointer-events-none' : 'opacity-100'}\`} style={{ [left > 280 ? 'right' : 'left']: 'calc(100% + 16px)' }} onMouseDown={e => e.stopPropagation()} onClick={e => e.stopPropagation()}>`;

const targetEnd = `                                     {/* Layer Controls */}`;

const replacementEnd = `                                     {/* Layer Controls */}`;

code = code.replace(target, replacement);

const finalTarget = `                                         <button type="button" className="p-1 hover:bg-gray-100 rounded text-gray-500" onClick={() => updateOverlay({ isLocked: true })} title="Lock"><Lock size={14} /></button>
                                       </div>
                                     </div>
                                   </div>`;

const finalReplacement = `                                         <button type="button" className="p-1 hover:bg-gray-100 rounded text-gray-500" onClick={() => updateOverlay({ isLocked: true })} title="Lock"><Lock size={14} /></button>
                                       </div>
                                     </div>
                                   </div>
                                   )}`;

code = code.replace(finalTarget, finalReplacement);

fs.writeFileSync('src/App.jsx', code, 'utf8');
console.log('Done');
