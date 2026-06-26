const fs = require('fs');
let app = fs.readFileSync('src/App.jsx', 'utf8');

// Find the start of the insertDropdownOpen conditional block (the whole relative div)
// We target from line starting with "          {/* Consolidated Insert Dropdown */}"
const INSERT_DIV_START = '          {/* Consolidated Insert Dropdown */}';
const startIdx = app.indexOf(INSERT_DIV_START);
if (startIdx === -1) { console.error('Cannot find Insert Dropdown div start'); process.exit(1); }

// Find where it ends: the closing </div> of the relative wrapper, followed by the separator div
// The relative wrapper closes with "          </div>" right before "          <div className="w-px h-4"
// We look for that specific pattern after startIdx
const END_PATTERN = '          </div>\r\n          <div className="w-px h-4 bg-gray-200"></div>\r\n          <div className="relative flex items-center gap-3" ref={docSearchPanelRef}>';
const endIdx = app.indexOf(END_PATTERN, startIdx);
if (endIdx === -1) {
  // Try LF only
  const END_LF = '          </div>\n          <div className="w-px h-4 bg-gray-200"></div>\n          <div className="relative flex items-center gap-3" ref={docSearchPanelRef}>';
  const endIdxLF = app.indexOf(END_LF, startIdx);
  if (endIdxLF === -1) { console.error('Cannot find end pattern'); process.exit(1); }
}

// Find which version works
let realEndIdx = app.indexOf(END_PATTERN, startIdx);
let endLen = END_PATTERN.length;
if (realEndIdx === -1) {
  realEndIdx = app.indexOf('          </div>\r\n          <div className="w-px h-4 bg-gray-200', startIdx);
  if (realEndIdx === -1) { console.error('Cannot find end'); process.exit(1); }
  // Advance past </div>\r\n
  realEndIdx += '          </div>\r\n'.length;
  endLen = 0;
} else {
  // We found it — we want to KEEP everything from END_PATTERN onward
  // so the cut point is just before END_PATTERN
}

const newDropdown = `          {/* Consolidated Insert Dropdown */}
          <div className="relative">
            <button
              id="compose-insert-btn"
              onPointerDown={(e) => { e.preventDefault(); setInsertDropdownOpen(v => !v); setListDropdownOpen(false); }}
              className={\`flex items-center gap-1 px-2 py-1 rounded-md text-[13px] font-medium transition-colors \${insertDropdownOpen ? 'bg-violet-50 text-violet-700' : 'text-slate-600 hover:bg-slate-100 hover:text-slate-900'}\`}
              title="Insert"
            >
              <Plus size={15} />
              <span className="text-[12px]">Insert</span>
              <ChevronDown size={11} className={\`text-slate-400 transition-transform duration-200 \${insertDropdownOpen ? 'rotate-180' : ''}\`} />
            </button>
            {insertDropdownOpen && (
              <>
                <div className="fixed inset-0 z-[99997]" onPointerDown={(e) => { e.preventDefault(); setInsertDropdownOpen(false); }} />
                <div className="absolute top-full left-0 mt-1.5 z-[99998] bg-white border border-slate-200/70 rounded-xl shadow-[0_8px_24px_rgba(0,0,0,0.10)] p-1.5 w-64 flex flex-col gap-0.5">
                  <div className="px-2 py-1 text-[10px] font-bold uppercase tracking-widest text-slate-400">Media</div>
                  <button id="compose-media-btn" onPointerDown={(e) => { e.preventDefault(); setMediaPickerOpen(true); setInsertDropdownOpen(false); }} className="w-full flex items-center gap-3 px-2.5 py-2 rounded-lg hover:bg-slate-100 transition-colors text-left">
                    <ImageIcon size={14} className="text-slate-500" />
                    <div>
                      <div className="text-[13px] font-medium text-slate-800 leading-tight">Images / Videos / Files</div>
                      <div className="text-[11px] text-slate-400 leading-tight">Upload, AI, Stock, URL</div>
                    </div>
                  </button>
                  <div className="h-px bg-slate-100 my-1" />
                  <div className="px-2 py-1 text-[10px] font-bold uppercase tracking-widest text-slate-400">Special Characters</div>
                  <button id="compose-emoji-btn" onPointerDown={(e) => { e.preventDefault(); setComposeEmojiPickerOpen(true); setInsertDropdownOpen(false); }} className="w-full flex items-center gap-3 px-2.5 py-2 rounded-lg hover:bg-slate-100 transition-colors text-left">
                    <SmilePlus size={14} className="text-slate-500" />
                    <div>
                      <div className="text-[13px] font-medium text-slate-800 leading-tight">Emoji</div>
                      <div className="text-[11px] text-slate-400 leading-tight">Browse emoji categories</div>
                    </div>
                  </button>
                  <button id="compose-symbols-btn" onPointerDown={(e) => { e.preventDefault(); setSymbolsPickerOpen(true); setInsertDropdownOpen(false); }} className="w-full flex items-center gap-3 px-2.5 py-2 rounded-lg hover:bg-slate-100 transition-colors text-left">
                    <Pi size={14} className="text-slate-500" />
                    <div>
                      <div className="text-[13px] font-medium text-slate-800 leading-tight">Symbols</div>
                      <div className="text-[11px] text-slate-400 leading-tight">Math, currency, arrows\u2026</div>
                    </div>
                  </button>
                  <button id="compose-equations-btn" onPointerDown={(e) => { e.preventDefault(); setEquationsPickerOpen(true); setInsertDropdownOpen(false); }} className="w-full flex items-center gap-3 px-2.5 py-2 rounded-lg hover:bg-slate-100 transition-colors text-left">
                    <SigmaIcon size={14} className="text-slate-500" />
                    <div>
                      <div className="text-[13px] font-medium text-slate-800 leading-tight">Equations</div>
                      <div className="text-[11px] text-slate-400 leading-tight">Common math formulas</div>
                    </div>
                  </button>
                  <div className="h-px bg-slate-100 my-1" />
                  <div className="px-2 py-1 text-[10px] font-bold uppercase tracking-widest text-slate-400">Blocks</div>
                  <TableGridPicker setInsertDropdownOpen={setInsertDropdownOpen} />
                  <button onPointerDown={(e) => { e.preventDefault(); const ed = document.querySelector('[contenteditable="true"]'); if (ed) ed.focus(); document.execCommand('insertHTML', false, '<div style="border-left:3px solid #8b5cf6;padding:12px 16px;background:#faf5ff;border-radius:0 8px 8px 0;margin:12px 0;color:#4c1d95;font-style:italic">&nbsp;</div><p><br></p>'); setInsertDropdownOpen(false); }} className="w-full flex items-center gap-3 px-2.5 py-2 rounded-lg hover:bg-slate-100 transition-colors text-left">
                    <span className="text-slate-500 text-base leading-none font-bold">\u275d</span>
                    <div>
                      <div className="text-[13px] font-medium text-slate-800 leading-tight">Callout / Quote</div>
                      <div className="text-[11px] text-slate-400 leading-tight">Styled block quote</div>
                    </div>
                  </button>
                  <button onPointerDown={(e) => { e.preventDefault(); const ed = document.querySelector('[contenteditable="true"]'); if (ed) ed.focus(); document.execCommand('insertHTML', false, '<div style="background:#1e293b;border-radius:8px;padding:16px;margin:12px 0;font-family:monospace;font-size:13px;color:#e2e8f0;white-space:pre"><span style="color:#94a3b8">// Code block</span>\\n</div><p><br></p>'); setInsertDropdownOpen(false); }} className="w-full flex items-center gap-3 px-2.5 py-2 rounded-lg hover:bg-slate-100 transition-colors text-left">
                    <FileText size={14} className="text-slate-500" />
                    <div>
                      <div className="text-[13px] font-medium text-slate-800 leading-tight">Code Block</div>
                      <div className="text-[11px] text-slate-400 leading-tight">Monospaced code area</div>
                    </div>
                  </button>
                  <button onPointerDown={(e) => { e.preventDefault(); const ed = document.querySelector('[contenteditable="true"]'); if (ed) ed.focus(); document.execCommand('insertHTML', false, '<hr style="border:none;border-top:2px solid #e2e8f0;margin:20px 0" /><p><br></p>'); setInsertDropdownOpen(false); }} className="w-full flex items-center gap-3 px-2.5 py-2 rounded-lg hover:bg-slate-100 transition-colors text-left">
                    <Minus size={14} className="text-slate-500" />
                    <div>
                      <div className="text-[13px] font-medium text-slate-800 leading-tight">Divider</div>
                      <div className="text-[11px] text-slate-400 leading-tight">Horizontal rule</div>
                    </div>
                  </button>
                </div>
              </>
            )}
          </div>\r\n          <div className="w-px h-4 bg-gray-200"></div>\r\n          <div className="relative flex items-center gap-3" ref={docSearchPanelRef}>`;

// Find end: look for AFTER MARKER
const afterMarker = '<div className="relative flex items-center gap-3" ref={docSearchPanelRef}>';
const afterIdx = app.indexOf(afterMarker, startIdx);
if (afterIdx === -1) { console.error('Cannot find afterMarker'); process.exit(1); }

// The full block we're replacing runs from startIdx to just before afterMarker's actual start
// We need to include everything up to and including the first line of afterMarker
const newApp = app.slice(0, startIdx) + newDropdown + app.slice(afterIdx + afterMarker.length);

fs.writeFileSync('src/App.jsx', newApp);
console.log('Done. Original size:', app.length, 'New size:', newApp.length);
