const fs = require('fs');
const path = require('path');

const appPath = path.join(__dirname, 'src', 'App.jsx');
let content = fs.readFileSync(appPath, 'utf8');

// 1. Add states
if (!content.includes('isUnifiedExportModalOpen')) {
  content = content.replace(
    /const \[exportMenuOpen, setExportMenuOpen\] = useState\(false\);/,
    "const [exportMenuOpen, setExportMenuOpen] = useState(false);\n  const [isUnifiedExportModalOpen, setIsUnifiedExportModalOpen] = useState(false);\n  const [isExporting, setIsExporting] = useState(false);"
  );
}

// 2. Add Modal JSX
const modalJsx = `
      {isUnifiedExportModalOpen && (
        <div className="fixed inset-0 z-[99999] flex items-center justify-center pointer-events-auto">
          <div className="absolute inset-0 bg-black/40 backdrop-blur-sm" onClick={() => !isExporting && setIsUnifiedExportModalOpen(false)}></div>
          <div className="relative bg-white rounded-2xl shadow-2xl w-full max-w-[600px] overflow-hidden flex flex-col border border-gray-200">
            <div className="flex items-center justify-between px-6 py-4 border-b border-gray-100 bg-slate-50">
              <h2 className="text-base font-semibold text-gray-800">Export & Conversion</h2>
              <button 
                onClick={() => !isExporting && setIsUnifiedExportModalOpen(false)}
                className="text-gray-400 hover:text-gray-600 transition-colors disabled:opacity-50"
                disabled={isExporting}
              >
                <X size={20} />
              </button>
            </div>
            <div className="p-6 flex flex-col gap-6">
              <div>
                <h3 className="text-sm font-semibold text-gray-700 mb-3 uppercase tracking-wider">Export as File</h3>
                <div className="grid grid-cols-3 gap-3">
                  {[
                    { format: 'Native', icon: FileText, desc: 'Original format' },
                    { format: 'Excel', icon: FileText, desc: '.xlsx spreadsheet' },
                    { format: 'CSV', icon: FileText, desc: 'Comma-separated' },
                    { format: 'JSON', icon: FileText, desc: 'Structured data' },
                    { format: 'PDF', icon: File, desc: 'Print-ready' },
                    { format: 'Markdown', icon: FileText, desc: 'Plain text format' }
                  ].map(f => (
                    <button 
                      key={f.format}
                      disabled={isExporting}
                      onClick={() => {
                        setIsExporting(true);
                        setTimeout(() => { setIsExporting(false); setIsUnifiedExportModalOpen(false); showToast('Exported as ' + f.format); }, 1500);
                      }}
                      className="flex items-start gap-3 p-3 rounded-xl border border-gray-100 bg-white hover:border-violet-200 hover:bg-violet-50 transition-all text-left group"
                    >
                      <div className="p-2 rounded-lg bg-violet-100 text-violet-600 group-hover:bg-violet-200 transition-colors"><f.icon size={16} /></div>
                      <div className="flex flex-col">
                        <span className="text-sm font-semibold text-gray-800">{f.format}</span>
                        <span className="text-[10px] text-gray-500">{f.desc}</span>
                      </div>
                    </button>
                  ))}
                </div>
              </div>
              <div className="h-px bg-gray-100 w-full"></div>
              <div>
                <h3 className="text-sm font-semibold text-gray-700 mb-3 uppercase tracking-wider">Convert to Workspace</h3>
                <div className="grid grid-cols-3 gap-3">
                  {[
                    { target: 'Compose', icon: FileText, color: 'blue' },
                    { target: 'Deck', icon: LayoutGrid, color: 'emerald' },
                    { target: 'Whiteboard', icon: PenTool, color: 'orange' }
                  ].map(t => (
                    <button 
                      key={t.target}
                      disabled={isExporting}
                      onClick={() => {
                        setIsExporting(true);
                        setTimeout(() => { setIsExporting(false); setIsUnifiedExportModalOpen(false); showToast('Converted to ' + t.target); }, 2000);
                      }}
                      className="flex items-center gap-2 p-3 rounded-xl border border-gray-100 bg-white hover:border-violet-200 hover:shadow-sm transition-all font-medium text-gray-700 text-sm"
                    >
                      <t.icon size={16} className={\`text-\${t.color}-500\`} />
                      {t.target}
                    </button>
                  ))}
                </div>
              </div>
            </div>
            {isExporting && (
              <div className="absolute inset-0 bg-white/80 backdrop-blur-sm flex flex-col items-center justify-center z-10">
                <div className="w-8 h-8 border-4 border-violet-200 border-t-violet-600 rounded-full animate-spin mb-4"></div>
                <span className="text-sm font-medium text-violet-700">Processing...</span>
              </div>
            )}
          </div>
        </div>
      )}
`;

if (!content.includes('isUnifiedExportModalOpen &&')) {
  // Inject right before the closing tag of the main app wrapper
  content = content.replace(
    /\{isSettingsModalOpen && \(/,
    modalJsx + "\n      {isSettingsModalOpen && ("
  );
}

// 3. Update Sheets top navigation Export tab behavior
content = content.replace(
  /onClick=\{\(\) => \{\s*if \(tab === 'Data'\) \{\s*setSheetToolbarTab\(sheetToolbarTab === 'Data' \? null : 'Data'\);\s*\} else \{\s*setSheetToolbarTab\(sheetToolbarTab === tab \? null : tab\);\s*showToast\(\`\$\{tab\} tools ready\`\);\s*\}\s*\}\}/g,
  `onClick={() => {
                            if (tab === 'Export') {
                              setSheetToolbarTab(null);
                              setIsUnifiedExportModalOpen(true);
                            } else if (tab === 'Data') {
                              setSheetToolbarTab(sheetToolbarTab === 'Data' ? null : 'Data');
                            } else {
                              setSheetToolbarTab(sheetToolbarTab === tab ? null : tab);
                              showToast(\`\${tab} tools ready\`);
                            }
                          }}`
);

// We can remove the old Export subtoolbar if we want, but letting it be is fine since it's unreachable now.
// But let's be clean.
content = content.replace(
  /\{sheetToolbarTab === 'Export' \? \([\s\S]*?\) : sheetToolbarTab === 'Templates'/m,
  `{sheetToolbarTab === 'Templates'`
);

// 4. Compose Export dropdown migration
const composeExportDropdownRegex = /<button[\s\S]*?onClick=\{\(\) => \{\s*closeTransientMenus\(\);\s*setExportMenuOpen\(\(prev\) => !prev\);\s*\}\}[\s\S]*?Export <ChevronDown size=\{10\} className="text-gray-400" \/>\s*<\/button>\s*\{exportMenuOpen && \([\s\S]*?<\/div>\s*\)\}/;

const newComposeExportButton = `<button
              onClick={() => {
                closeTransientMenus();
                setIsUnifiedExportModalOpen(true);
              }}
              className="text-xs font-medium px-2 py-1 rounded hover:bg-violet-50 hover:text-violet-700 flex items-center gap-1"
              title="Export options"
            >
              Export
            </button>`;

content = content.replace(composeExportDropdownRegex, newComposeExportButton);

fs.writeFileSync(appPath, content, 'utf8');
console.log('App.jsx patched with UnifiedExportModal successfully');
