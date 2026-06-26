const fs = require('fs');
let app = fs.readFileSync('src/App.jsx', 'utf8');

// Problem: The EmojiGalleryPicker's function declaration was eaten.
// After line containing "};\n\n  const categories = ['Recent'..." 
// it should actually be: 
// "const EmojiGalleryPicker = ({ isOpen, setOpen, anchorEl }) => {\n  const [search, setSearch] = useState('');\n  const [activeTab, setActiveTab] = useState('Smileys');\n  if (!isOpen || !anchorEl) return null;\n  const rect = anchorEl.getBoundingClientRect();\n  \n  const categories = ..."

// Find the orphaned categories line
const ORPHAN = "  const categories = ['Recent', 'Smileys', 'Animals', 'Food', 'Activity', 'Travel', 'Objects', 'Symbols'];";
const orphanIdx = app.indexOf(ORPHAN);
if (orphanIdx === -1) {
  console.error('Could not find orphaned categories line');
  process.exit(1);
}

// Find the blank line before it (should be \r\n\r\n or \n\n)
// Go backward to find the preceding "};":
const beforeOrphan = app.slice(0, orphanIdx);
const closingBrace = beforeOrphan.lastIndexOf('};');
// The gap between "};" and "const categories" should be replaced with the function declaration
const gapStart = closingBrace + 2; // after "};"
const gapContent = app.slice(gapStart, orphanIdx);
console.log('Gap content:', JSON.stringify(gapContent));

// Replace the gap with TableGridPicker + EmojiGalleryPicker declaration
const INJECTION = `\r\n\r\nconst TableGridPicker = ({ setInsertDropdownOpen }) => {\r\n  const ROWS = 6, COLS = 8;\r\n  const [hovered, setHovered] = React.useState({ r: 0, c: 0 });\r\n  const buildTable = (rows, cols) => {\r\n    const ths = Array.from({ length: cols }, (_, i) =>\r\n      \`<th style="border:1px solid #e2e8f0;padding:8px 12px;background:#f8fafc;font-weight:600;text-align:left;color:#334155">Col \${i + 1}</th>\`\r\n    ).join('');\r\n    const tds = Array.from({ length: cols }, () =>\r\n      '<td style="border:1px solid #e2e8f0;padding:8px 12px">&nbsp;</td>'\r\n    ).join('');\r\n    const bodyRows = Array.from({ length: rows - 1 }, () => \`<tr>\${tds}</tr>\`).join('');\r\n    return \`<table style="border-collapse:collapse;width:100%;margin:12px 0"><thead><tr>\${ths}</tr></thead><tbody>\${bodyRows}</tbody></table><p><br></p>\`;\r\n  };\r\n  return (\r\n    <div className="px-2.5 py-2">\r\n      <div className="flex items-center justify-between mb-1.5">\r\n        <div className="flex items-center gap-2">\r\n          <LayoutGrid size={14} className="text-slate-500" />\r\n          <span className="text-[13px] font-medium text-slate-800">Table</span>\r\n        </div>\r\n        <span className="text-[11px] text-slate-400">{hovered.r > 0 ? \`\${hovered.r} \u00d7 \${hovered.c}\` : 'Hover to pick size'}</span>\r\n      </div>\r\n      <div className="inline-grid gap-0.5" style={{ gridTemplateColumns: \`repeat(\${COLS}, 18px)\` }} onPointerLeave={() => setHovered({ r: 0, c: 0 })}>\r\n        {Array.from({ length: ROWS }, (_, r) => Array.from({ length: COLS }, (_, c) => (\r\n          <div key={\`\${r}-\${c}\`} onPointerEnter={() => setHovered({ r: r + 1, c: c + 1 })} onPointerDown={(e) => { e.preventDefault(); const ed = document.querySelector('[contenteditable="true"]'); if (ed) ed.focus(); document.execCommand('insertHTML', false, buildTable(r + 1, c + 1)); setInsertDropdownOpen(false); }} className={\`w-[18px] h-[18px] rounded-sm border cursor-pointer transition-colors \${r < hovered.r && c < hovered.c ? 'bg-violet-200 border-violet-400' : 'bg-slate-100 border-slate-200 hover:border-slate-300'}\`} />\r\n        )))}\r\n      </div>\r\n    </div>\r\n  );\r\n};\r\n\r\nconst EmojiGalleryPicker = ({ isOpen, setOpen, anchorEl }) => {\r\n  const [search, setSearch] = useState('');\r\n  const [activeTab, setActiveTab] = useState('Smileys');\r\n  if (!isOpen || !anchorEl) return null;\r\n  const rect = anchorEl.getBoundingClientRect();\r\n  `;

app = app.slice(0, gapStart) + INJECTION + app.slice(orphanIdx);

fs.writeFileSync('src/App.jsx', app);
console.log('Fixed EmojiGalleryPicker + added TableGridPicker. File size:', app.length);
