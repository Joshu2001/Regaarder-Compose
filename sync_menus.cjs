const fs = require('fs');
let app = fs.readFileSync('src/App.jsx', 'utf8');

// 1. Update executeSlashCommand range definition
const executeOld = `  const executeSlashCommand = (key) => {
    const savedRange = slashMenuRef.current?.range;
    
    setSlashMenu({ open: false, left: 0, top: 0, bottom: 'auto', filterText: '', activeIndex: 0, range: null });`;

const executeNew = `  const executeSlashCommand = (key) => {
    const savedRange = slashMenuRef.current?.range || savedSelectionRef.current;
    
    setSlashMenu({ open: false, left: 0, top: 0, bottom: 'auto', filterText: '', activeIndex: 0, range: null });`;

app = app.replace(executeOld, executeNew);

// 2. Add 'numbered' command to executeSlashCommand
const cmdOld = `    } else if (key === 'bullets') {
      applyFormatCommand('insertUnorderedList');
    } else if (key === 'icon') {`;

const cmdNew = `    } else if (key === 'bullets') {
      applyFormatCommand('insertUnorderedList');
    } else if (key === 'numbered') {
      applyFormatCommand('insertOrderedList');
    } else if (key === 'icon') {`;

if (!app.includes(`key === 'numbered'`)) {
  app = app.replace(cmdOld, cmdNew);
}

// 3. Update Insert Menu buttons
// Callout
const calloutInsertOld = `const calloutHtml = '<div class="callout-block" data-block-type="callout" style="border-left:3px solid #8b5cf6;padding:12px 16px;background:#faf5ff;border-radius:0 8px 8px 0;margin:12px 0;color:#4c1d95;font-style:italic; transition:background 0.3s ease;">&nbsp;</div><p><br></p>'; if (window.__composeInsertHTML) window.__composeInsertHTML(calloutHtml); else document.execCommand('insertHTML', false, calloutHtml); setInsertDropdownOpen(false);`;
const calloutInsertNew = `executeSlashCommand('callout'); setInsertDropdownOpen(false);`;
app = app.replace(calloutInsertOld, calloutInsertNew);

// Code Block
const codeInsertOld = `const codeHtml = '<div class="code-block" data-block-type="code_block" style="background:#1e293b;border-radius:8px;padding:16px;margin:12px 0;font-family:monospace;font-size:13px;color:#e2e8f0;white-space:pre; transition:background 0.3s ease;"><span style="color:#94a3b8">// Code block</span>\\n</div><p><br></p>'; if (window.__composeInsertHTML) window.__composeInsertHTML(codeHtml); else document.execCommand('insertHTML', false, codeHtml); setInsertDropdownOpen(false);`;
const codeInsertNew = `executeSlashCommand('code_block'); setInsertDropdownOpen(false);`;
app = app.replace(codeInsertOld, codeInsertNew);

// Divider
const divInsertOld = `const divHtml = '<div class="divider-block" data-block-type="divider" style="padding:10px 0; margin:10px 0; border-radius:6px; transition:background 0.3s ease;"><hr style="border:none;border-top:2px solid #e2e8f0;margin:0" /></div><p><br></p>'; if (window.__composeInsertHTML) window.__composeInsertHTML(divHtml); else document.execCommand('insertHTML', false, divHtml); setInsertDropdownOpen(false);`;
const divInsertNew = `executeSlashCommand('divider'); setInsertDropdownOpen(false);`;
app = app.replace(divInsertOld, divInsertNew);

// Image / Media
const mediaOld = `setMediaPickerOpen(true); setInsertDropdownOpen(false);`;
const mediaNew = `executeSlashCommand('image'); setInsertDropdownOpen(false);`;
app = app.replace(mediaOld, mediaNew);

// 4. Update List Gallery item actions
// ListGalleryPicker currently uses document.execCommand or __composeApplyFormatCommand. 
// We will update it so it correctly uses __composeApplyFormatCommand.
const listOld = `                if (window.__composeApplyFormatCommand) {
                  window.__composeApplyFormatCommand(activeTab === 'bullet' ? 'insertUnorderedList' : 'insertOrderedList');
                } else {`;
const listNew = `                if (window.__composeApplyFormatCommand) {
                  const ed = document.querySelector('[contenteditable="true"]');
                  if (ed) ed.focus(); // focus editor first
                  window.__composeApplyFormatCommand(activeTab === 'bullet' ? 'insertUnorderedList' : 'insertOrderedList');
                } else {`;
if (!app.includes(`ed.focus(); // focus editor first`)) {
  app = app.replace(listOld, listNew);
}

fs.writeFileSync('src/App.jsx', app);
console.log('Fixed executeSlashCommand and synced menus.');
