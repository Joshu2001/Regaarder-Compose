const fs = require('fs');
let app = fs.readFileSync('src/App.jsx', 'utf8');

// 1. Fix handleBlockHover
const hoverIndex = app.indexOf('const handleBlockHover = (e) => {');
if (hoverIndex !== -1) {
  const hoverEndIndex = app.indexOf('document.addEventListener(\'mousemove\', handleBlockHover);');
  if (hoverEndIndex !== -1) {
    const oldHover = app.substring(hoverIndex, hoverEndIndex);
    const newHover = `const handleBlockHover = (e) => {
      let targetBlock = e.target.closest?.('.callout-block, .code-block, .divider-block, .table-block');
      const menu = e.target.closest?.('#block-hover-menu');
      
      if (targetBlock) {
        let type = 'unknown';
        if (targetBlock.classList.contains('callout-block')) type = 'callout';
        else if (targetBlock.classList.contains('code-block')) type = 'code_block';
        else if (targetBlock.classList.contains('divider-block')) type = 'divider';
        else if (targetBlock.classList.contains('table-block')) type = 'table';
        
        setHoveredBlockMenu({
          element: targetBlock,
          type: type,
          rect: targetBlock.getBoundingClientRect()
        });
      } else if (!menu) {
        setHoveredBlockMenu(null);
      }
    };
    `;
    app = app.replace(oldHover, newHover);
  }
}

// 2. Add handlers for emoji, symbol, equation to executeSlashCommand
// and fix the range selection
const execIdx = app.indexOf('const executeSlashCommand = (key) => {');
if (execIdx !== -1) {
  const execEndIdx = app.indexOf('// CRITICAL: Focus the editor FIRST so all DOM commands work');
  if (execEndIdx !== -1) {
    const oldExecStart = app.substring(execIdx, execEndIdx);
    const newExecStart = `const executeSlashCommand = (key) => {
    const savedRange = slashMenuRef.current?.range || savedSelectionRef.current;
    
    setSlashMenu({ open: false, left: 0, top: 0, bottom: 'auto', filterText: '', activeIndex: 0, range: null });
    
    if (key === 'emoji') { setComposeEmojiPickerOpen(true); return; }
    if (key === 'symbol') { setSymbolsPickerOpen(true); return; }
    if (key === 'equation') { setEquationsPickerOpen(true); return; }
    
    `;
    app = app.replace(oldExecStart, newExecStart);
  }
}

// 3. Add numbered lists to executeSlashCommand
const bulletIdx = app.indexOf("} else if (key === 'bullets') {");
if (bulletIdx !== -1 && app.indexOf("key === 'numbered'") === -1) {
  const oldBullet = `} else if (key === 'bullets') {
      applyFormatCommand('insertUnorderedList');
    } else if (key === 'icon') {`;
  const newBullet = `} else if (key === 'bullets') {
      applyFormatCommand('insertUnorderedList');
    } else if (key === 'numbered') {
      applyFormatCommand('insertOrderedList');
    } else if (key === 'icon') {`;
  app = app.replace(oldBullet, newBullet);
}

// 4. Update Insert Menu and List Menu to use executeSlashCommand
// We use regex but on a per-line basis if possible to avoid CRLF issues, or simple exact splits
app = app.replace(/setMediaPickerOpen\(true\);\s*setInsertDropdownOpen\(false\);/g, "executeSlashCommand('image'); setInsertDropdownOpen(false);");
app = app.replace(/setComposeEmojiPickerOpen\(true\);\s*setInsertDropdownOpen\(false\);/g, "executeSlashCommand('emoji'); setInsertDropdownOpen(false);");
app = app.replace(/setSymbolsPickerOpen\(true\);\s*setInsertDropdownOpen\(false\);/g, "executeSlashCommand('symbol'); setInsertDropdownOpen(false);");
app = app.replace(/setEquationsPickerOpen\(true\);\s*setInsertDropdownOpen\(false\);/g, "executeSlashCommand('equation'); setInsertDropdownOpen(false);");

// Callout code in insert dropdown
const calloutInsertStr = "const calloutHtml = '<div class=\"callout-block\" data-block-type=\"callout\" style=\"border-left:3px solid #8b5cf6;padding:12px 16px;background:#faf5ff;border-radius:0 8px 8px 0;margin:12px 0;color:#4c1d95;font-style:italic; transition:background 0.3s ease;\">&nbsp;</div><p><br></p>'; if (window.__composeInsertHTML) window.__composeInsertHTML(calloutHtml); else document.execCommand('insertHTML', false, calloutHtml); setInsertDropdownOpen(false);";
app = app.replace(calloutInsertStr, "executeSlashCommand('callout'); setInsertDropdownOpen(false);");

// Code Block code in insert dropdown
const codeInsertStr = "const codeHtml = '<div class=\"code-block\" data-block-type=\"code_block\" style=\"background:#1e293b;border-radius:8px;padding:16px;margin:12px 0;font-family:monospace;font-size:13px;color:#e2e8f0;white-space:pre; transition:background 0.3s ease;\"><span style=\"color:#94a3b8\">// Code block</span>\\n</div><p><br></p>'; if (window.__composeInsertHTML) window.__composeInsertHTML(codeHtml); else document.execCommand('insertHTML', false, codeHtml); setInsertDropdownOpen(false);";
app = app.replace(codeInsertStr, "executeSlashCommand('code_block'); setInsertDropdownOpen(false);");

// Divider code in insert dropdown
const dividerInsertStr = "const divHtml = '<div class=\"divider-block\" data-block-type=\"divider\" style=\"padding:10px 0; margin:10px 0; border-radius:6px; transition:background 0.3s ease;\"><hr style=\"border:none;border-top:2px solid #e2e8f0;margin:0\" /></div><p><br></p>'; if (window.__composeInsertHTML) window.__composeInsertHTML(divHtml); else document.execCommand('insertHTML', false, divHtml); setInsertDropdownOpen(false);";
app = app.replace(dividerInsertStr, "executeSlashCommand('divider'); setInsertDropdownOpen(false);");


fs.writeFileSync('src/App.jsx', app);
console.log('Synchronized executeSlashCommand, updated Insert menus, and fixed Hover selector.');
