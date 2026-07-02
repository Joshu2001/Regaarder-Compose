const fs = require('fs');
const path = require('path');
const appPath = path.join(__dirname, 'src', 'App.jsx');
let content = fs.readFileSync(appPath, 'utf8');

// 1. Update activeOutlineMenuId rendering logic
const oldMenuLogic = `{activeOutlineMenuId && (
        <div 
          className="fixed z-[9999] bg-white rounded-xl shadow-xl border border-slate-100 py-1.5 w-48"
          style={{ top: outlineMenuCoords.top, left: outlineMenuCoords.left, fontFamily: editorFont }}
        >
          <button type="button" className="w-full text-left px-3 py-1.5 text-xs font-medium text-slate-700 hover:bg-slate-50 hover:text-violet-600 flex items-center gap-2 transition-colors" onClick={() => { setEditingOutlineId(activeOutlineMenuId); const section = outlineTreeData.find(s => s.id === activeOutlineMenuId); setEditingOutlineText(section ? section.title : ''); setActiveOutlineMenuId(null); }}><FileEdit size={14} /> Rename Section</button>
          <button type="button" className="w-full text-left px-3 py-1.5 text-xs font-medium text-slate-700 hover:bg-slate-50 hover:text-violet-600 flex items-center gap-2 transition-colors" onClick={() => { setActiveOutlineMenuId(null); setOutlineTreeData(prev => prev.map(s => s.id === activeOutlineMenuId ? { ...s, completed: !s.completed } : s)); }}><CheckCircle2 size={14} /> Toggle Status</button>
          <div className="h-px bg-slate-100 my-1"></div>
          <button type="button" className="w-full text-left px-3 py-1.5 text-xs font-medium text-rose-600 hover:bg-rose-50 flex items-center gap-2 transition-colors" onClick={() => { setOutlineTreeData(prev => prev.filter(s => s.id !== activeOutlineMenuId)); setActiveOutlineMenuId(null); }}><Trash size={14} /> Delete Section</button>
        </div>
      )}`;

const newMenuLogic = `{activeOutlineMenuId && (
        <div 
          className="fixed z-[9999] bg-white/80 backdrop-blur-md rounded-xl shadow-[0_12px_30px_rgba(0,0,0,0.06)] border border-white/40 py-1.5 w-48"
          style={{ top: outlineMenuCoords.top, left: outlineMenuCoords.left, fontFamily: editorFont }}
        >
          {activeOutlineMenuId === 'add-section' ? (
            <>
              <button type="button" className="w-full text-left px-3 py-1.5 text-xs font-medium text-slate-700 hover:bg-slate-100/60 hover:text-violet-700 flex items-center gap-2 transition-colors rounded-md mx-1 w-[calc(100%-8px)]" onClick={() => {
                const newId = \`sec-\${Date.now()}\`;
                setOutlineTreeData(prev => [...prev, { id: newId, title: 'Untitled Section', progress: 0, completed: false, subsections: [], expanded: false, readTime: '1 min read', preview: 'Start typing to build this section...' }]);
                setEditingOutlineId(newId);
                setEditingOutlineText('Untitled Section');
                setActiveOutlineMenuId(null);
              }}><Plus size={14} /> New Section</button>
              <button type="button" className="w-full text-left px-3 py-1.5 text-xs font-medium text-slate-700 hover:bg-slate-100/60 hover:text-violet-700 flex items-center gap-2 transition-colors rounded-md mx-1 w-[calc(100%-8px)]" onClick={() => {
                showToast('Generating AI Section...');
                setTimeout(() => {
                  const newId = \`sec-ai-\${Date.now()}\`;
                  setOutlineTreeData(prev => [...prev, { id: newId, title: 'AI Generated Insights', progress: 0, completed: false, subsections: [], expanded: false, readTime: '2 min read', preview: 'AI summary of the current context.' }]);
                  setEditingOutlineId(newId);
                  setEditingOutlineText('AI Generated Insights');
                  showToast('AI Section Generated');
                  setActiveOutlineMenuId(null);
                }, 1000);
              }}><Sparkles size={14} /> Generate with AI</button>
              <button type="button" className="w-full text-left px-3 py-1.5 text-xs font-medium text-slate-700 hover:bg-slate-100/60 flex items-center gap-2 transition-colors rounded-md mx-1 w-[calc(100%-8px)]" onClick={() => {
                showToast('Import Outline feature coming soon');
                setActiveOutlineMenuId(null);
              }}><Download size={14} /> Import Outline</button>
              <div className="h-px bg-slate-200/50 my-1 mx-2"></div>
              <button type="button" className="w-full text-left px-3 py-1.5 text-xs font-medium text-slate-700 hover:bg-slate-100/60 flex items-center gap-2 transition-colors rounded-md mx-1 w-[calc(100%-8px)]" onClick={() => {
                showToast('Duplicate Section feature coming soon');
                setActiveOutlineMenuId(null);
              }}><Copy size={14} /> Duplicate Section</button>
            </>
          ) : (
            <>
              <button type="button" className="w-full text-left px-3 py-1.5 text-xs font-medium text-slate-700 hover:bg-slate-100/60 hover:text-violet-700 flex items-center gap-2 transition-colors rounded-md mx-1 w-[calc(100%-8px)]" onClick={() => { setEditingOutlineId(activeOutlineMenuId); const section = outlineTreeData.find(s => s.id === activeOutlineMenuId); setEditingOutlineText(section ? section.title : ''); setActiveOutlineMenuId(null); }}><FileEdit size={14} /> Rename Section</button>
              <button type="button" className="w-full text-left px-3 py-1.5 text-xs font-medium text-slate-700 hover:bg-slate-100/60 hover:text-violet-700 flex items-center gap-2 transition-colors rounded-md mx-1 w-[calc(100%-8px)]" onClick={() => { setActiveOutlineMenuId(null); setOutlineTreeData(prev => prev.map(s => s.id === activeOutlineMenuId ? { ...s, completed: !s.completed } : s)); }}><CheckCircle2 size={14} /> Toggle Status</button>
              <div className="h-px bg-slate-200/50 my-1 mx-2"></div>
              <button type="button" className="w-full text-left px-3 py-1.5 text-xs font-medium text-rose-600 hover:bg-rose-50 flex items-center gap-2 transition-colors rounded-md mx-1 w-[calc(100%-8px)]" onClick={() => { setOutlineTreeData(prev => prev.filter(s => s.id !== activeOutlineMenuId)); setActiveOutlineMenuId(null); }}><Trash size={14} /> Delete Section</button>
            </>
          )}
        </div>
      )}`;

// Since the old menu logic might not match exactly due to whitespace, let's use a regex or string replacement on the parts.
if (content.includes('{activeOutlineMenuId && (')) {
  // We'll replace the block manually using substring
  const startIndex = content.indexOf('{activeOutlineMenuId && (');
  const endIndex = content.indexOf(')}', content.indexOf('<Trash size={14} /> Delete Section</button>')) + 2;
  if (startIndex !== -1 && endIndex !== -1) {
    content = content.substring(0, startIndex) + newMenuLogic + content.substring(endIndex);
  }
}

// Update the outline sections to include previews and reading time.
// Search for rendering of section.title and add a preview below it
const oldTitleRender = `<span 
                                onClick={() => {
                                  setEditingOutlineId(section.id);
                                  setEditingOutlineText(section.title);
                                }}
                                className="text-[12.5px] font-bold text-slate-800 truncate cursor-text hover:text-slate-955 whitespace-nowrap overflow-hidden text-ellipsis block min-w-0 flex-1"
                              >
                                {section.title}
                              </span>`;

const newTitleRender = `<div className="flex flex-col min-w-0 flex-1 cursor-text" onClick={() => {
                                  setEditingOutlineId(section.id);
                                  setEditingOutlineText(section.title);
                                }}>
                                <span className="text-[12.5px] font-bold text-slate-800 truncate hover:text-slate-955 whitespace-nowrap overflow-hidden text-ellipsis block min-w-0 w-full transition-all">
                                  {section.title}
                                </span>
                                {(section.preview || section.readTime) && (
                                  <div className="flex items-center gap-1.5 mt-0.5 opacity-60 hover:opacity-100 transition-opacity">
                                    {section.readTime && <span className="text-[9px] font-semibold text-violet-600 shrink-0">{section.readTime}</span>}
                                    {section.readTime && section.preview && <span className="w-1 h-1 rounded-full bg-slate-300 shrink-0"></span>}
                                    {section.preview && <span className="text-[10px] text-slate-500 truncate whitespace-nowrap overflow-hidden text-ellipsis block min-w-0 flex-1">{section.preview}</span>}
                                  </div>
                                )}
                              </div>`;

content = content.replace(oldTitleRender, newTitleRender);

// To ensure existing elements have preview and readTime, we can just let them be undefined or add default ones.
// It will look great. 
// Finally, visual polish on the outline rendering: replace border radii and spacing
// The outline container:
// `<div className="rounded-2xl border border-violet-100 bg-white/90 p-3 shadow-[0_18px_40px_-28px_rgba(109,40,217,0.25)] space-y-3">`
// Let's refine it.
content = content.replace(
  `className="rounded-2xl border border-violet-100 bg-white/90 p-3 shadow-[0_18px_40px_-28px_rgba(109,40,217,0.25)] space-y-3"`,
  `className="rounded-[18px] border border-slate-100 bg-white/80 backdrop-blur-md p-4 shadow-[0_4px_24px_rgba(0,0,0,0.02)] space-y-4"`
);

// We should also replace the plus icon import if needed. We have Plus, Sparkles, Download, Copy, Trash, FileEdit, CheckCircle2.
// Let's ensure these are imported.
const imports = ['Plus', 'Sparkles', 'Download', 'Copy'];
let importLine = content.match(/import\s+{([^}]+)}\s+from\s+'lucide-react'/);
if (importLine) {
  let existingImports = importLine[1];
  imports.forEach(imp => {
    if (!existingImports.includes(imp)) {
      existingImports += `, ${imp}`;
    }
  });
  content = content.replace(importLine[0], `import {${existingImports}} from 'lucide-react'`);
}

fs.writeFileSync(appPath, content);
console.log('App.jsx dropdown menu updated');
