const fs = require('fs');

let app = fs.readFileSync('src/App.jsx', 'utf8');
const before = app.length;

// ─── FIX 1: Deck templates appearing on launch ───────────────────────────
// Change useState(true) to useState(false) for isTemplateModalOpen
app = app.replace(
  'const [isTemplateModalOpen, setIsTemplateModalOpen] = useState(true);',
  'const [isTemplateModalOpen, setIsTemplateModalOpen] = useState(false);'
);

// ─── FIX 2: EmojiGalleryPicker — save/restore selection + insert ──────────
// The picker uses insertText which fails when focus is lost.
// Replace the emoji button handler with one that restores the saved editor selection first.
app = app.replace(
  `<button key={idx} onPointerDown={(e) => { e.preventDefault(); document.execCommand('insertText', false, emoji); setOpen(false); }} className="h-9 w-9 flex items-center justify-center rounded hover:bg-slate-100 text-[20px] transition-colors">`,
  `<button key={idx} onPointerDown={(e) => {
                  e.preventDefault();
                  // Restore editor focus before inserting
                  const editor = document.querySelector('[contenteditable="true"]');
                  if (editor) editor.focus();
                  document.execCommand('insertText', false, emoji);
                  setOpen(false);
                }} className="h-9 w-9 flex items-center justify-center rounded hover:bg-slate-100 text-[20px] transition-colors">`
);

// ─── FIX 3: SymbolGalleryPicker — restore selection + fix z-index ────────
app = app.replace(
  `<button key={idx} onPointerDown={(e) => { e.preventDefault(); document.execCommand('insertText', false, sym); setOpen(false); }} className="h-9 w-9 flex items-center justify-center rounded border border-slate-200 hover:border-blue-500 hover:bg-blue-50 text-[16px] font-medium transition-all text-slate-800">`,
  `<button key={idx} onPointerDown={(e) => {
                  e.preventDefault();
                  const editor = document.querySelector('[contenteditable="true"]');
                  if (editor) editor.focus();
                  document.execCommand('insertText', false, sym);
                  setOpen(false);
                }} className="h-9 w-9 flex items-center justify-center rounded border border-slate-200 hover:border-blue-500 hover:bg-blue-50 text-[16px] font-medium transition-all text-slate-800">`
);

// Fix SymbolGalleryPicker z-index so it appears above Insert dropdown
app = app.replace(
  `<div className="fixed inset-0 z-[200]" onPointerDown={(e) => { e.preventDefault(); setOpen(false); }} />\n      <div className="fixed z-[201] bg-white border border-slate-200/60 rounded-xl shadow-[0_12px_40px_rgb(0,0,0,0.12)] flex flex-col font-[system-ui] backdrop-blur-xl overflow-hidden" style={{ top: rect.bottom + 8, left: rect.left, width: '380px', height: '300px' }}>`,
  `<div className="fixed inset-0 z-[99998]" onPointerDown={(e) => { e.preventDefault(); setOpen(false); }} />\n      <div className="fixed z-[99999] bg-white border border-slate-200/60 rounded-xl shadow-[0_12px_40px_rgb(0,0,0,0.12)] flex flex-col font-[system-ui] backdrop-blur-xl overflow-hidden" style={{ top: rect.bottom + 8, left: rect.left < window.innerWidth / 2 ? rect.left : rect.left - 380, width: '380px', height: '300px' }}>`
);

// ─── FIX 4: EquationGalleryPicker — restore selection + fix z-index ──────
app = app.replace(
  `<button key={idx} onPointerDown={(e) => { e.preventDefault(); document.execCommand('insertText', false, item.eq); setOpen(false); }} className="w-full flex flex-col px-3 py-2 rounded hover:bg-slate-50 transition-colors text-left text-slate-800 border border-transparent hover:border-slate-200">`,
  `<button key={idx} onPointerDown={(e) => {
            e.preventDefault();
            const editor = document.querySelector('[contenteditable="true"]');
            if (editor) editor.focus();
            document.execCommand('insertText', false, item.eq);
            setOpen(false);
          }} className="w-full flex flex-col px-3 py-2 rounded hover:bg-slate-50 transition-colors text-left text-slate-800 border border-transparent hover:border-slate-200">`
);

app = app.replace(
  `<div className="fixed inset-0 z-[200]" onPointerDown={(e) => { e.preventDefault(); setOpen(false); }} />\n      <div className="fixed z-[201] bg-white border border-slate-200/60 rounded-xl shadow-[0_12px_40px_rgb(0,0,0,0.12)] p-2 w-80 text-sm font-[system-ui] backdrop-blur-xl" style={{ top: rect.bottom + 8, left: rect.left }}>`,
  `<div className="fixed inset-0 z-[99998]" onPointerDown={(e) => { e.preventDefault(); setOpen(false); }} />\n      <div className="fixed z-[99999] bg-white border border-slate-200/60 rounded-xl shadow-[0_12px_40px_rgb(0,0,0,0.12)] p-2 w-80 text-sm font-[system-ui] backdrop-blur-xl" style={{ top: rect.bottom + 8, left: rect.left < window.innerWidth / 2 ? rect.left : rect.left - 320 }}>`
);

// ─── FIX 5: EmojiGalleryPicker — fix z-index ─────────────────────────────
app = app.replace(
  `<div className="fixed inset-0 z-[200]" onPointerDown={(e) => { e.preventDefault(); setOpen(false); }} />\n        <div className="fixed z-[201] bg-white border border-slate-200/60 rounded-xl shadow-[0_12px_40px_rgb(0,0,0,0.12)] flex flex-col font-[system-ui] backdrop-blur-xl overflow-hidden" style={{ top: rect.bottom + 8, left: rect.left, width: '420px', height: '360px' }}>`,
  `<div className="fixed inset-0 z-[99998]" onPointerDown={(e) => { e.preventDefault(); setOpen(false); }} />\n        <div className="fixed z-[99999] bg-white border border-slate-200/60 rounded-xl shadow-[0_12px_40px_rgb(0,0,0,0.12)] flex flex-col font-[system-ui] backdrop-blur-xl overflow-hidden" style={{ top: rect.bottom + 8, left: Math.min(rect.left, window.innerWidth - 440), width: '420px', height: '360px' }}>`
);

// ─── FIX 6: ListGalleryPicker z-index + fix list item actions ────────────
app = app.replace(
  `<div className="fixed inset-0 z-[200]" onPointerDown={(e) => { e.preventDefault(); setOpen(false); }} />\n      <div className="fixed z-[201] bg-slate-50 border border-slate-200 shadow-[0_16px_48px_rgb(0,0,0,0.12)] rounded-lg flex flex-col font-[system-ui]" style={{ top: rect.bottom + 8, left: rect.left, width: '520px', minHeight: '340px' }}>`,
  `<div className="fixed inset-0 z-[99998]" onPointerDown={(e) => { e.preventDefault(); setOpen(false); }} />\n      <div className="fixed z-[99999] bg-slate-50 border border-slate-200 shadow-[0_16px_48px_rgb(0,0,0,0.12)] rounded-lg flex flex-col font-[system-ui]" style={{ top: Math.min(rect.bottom + 8, window.innerHeight - 360), left: Math.min(rect.left, window.innerWidth - 540), width: '520px', minHeight: '340px' }}>`
);

// Fix list gallery item action — actually execute the list command with proper style
app = app.replace(
  `window.showToast('Applied ' + item.label);\n                setOpen(false); \n                document.execCommand(activeTab === 'bullet' ? 'insertUnorderedList' : 'insertOrderedList');`,
  `const editor = document.querySelector('[contenteditable="true"]');
                if (editor) editor.focus();
                if (item.id === 'none') {
                  document.execCommand(activeTab === 'bullet' ? 'insertUnorderedList' : 'insertOrderedList', false, null);
                } else if (activeTab === 'bullet') {
                  const markers = { disc: '●', circle: '○', square: '■', arrow: '➤', check: '✓', diamond: '◆', star: '★' };
                  const marker = markers[item.id] || '●';
                  document.execCommand('insertHTML', false, '<ul style="list-style:none;padding-left:1.5rem"><li style="margin:2px 0"><span style="margin-right:8px">' + marker + '</span>&nbsp;</li></ul><p><br></p>');
                } else if (activeTab === 'numbered') {
                  const styleMap = { decimal: 'decimal', 'decimal-paren': 'decimal', 'lower-alpha': 'lower-alpha', 'upper-alpha': 'upper-alpha', 'lower-roman': 'lower-roman', 'upper-roman': 'upper-roman', padded: 'decimal-leading-zero' };
                  document.execCommand('insertHTML', false, '<ol style="list-style-type:' + (styleMap[item.id] || 'decimal') + ';padding-left:1.5rem"><li style="margin:2px 0">&nbsp;</li></ol><p><br></p>');
                } else if (activeTab === 'multilevel') {
                  document.execCommand('insertHTML', false, '<ul style="list-style:none;padding-left:0"><li style="margin:2px 0">● &nbsp;<ul style="list-style:none;padding-left:1.5rem"><li style="margin:2px 0">○ &nbsp;<ul style="list-style:none;padding-left:1.5rem"><li style="margin:2px 0">■ &nbsp;</li></ul></li></ul></li></ul><p><br></p>');
                }
                setOpen(false);`
);

// ─── FIX 7: Insert dropdown anchor IDs — move them to always-visible hidden spans ─────────
// The problem: compose-emoji-btn, compose-symbols-btn, compose-equations-btn are INSIDE
// the dropdown and get unmounted when insertDropdownOpen=false.
// Fix: add always-visible zero-size anchor elements right after the Insert button trigger,
// outside the conditional dropdown render.

// Find the compose-insert-btn wrapper and add persistent anchors after the dropdown closing tag
// We'll replace the section that has the Insert dropdown close tag with anchors added after it
app = app.replace(
  `          </div>
          <div className="w-px h-4 bg-gray-200"></div>
          <div className="relative flex items-center gap-3" ref={docSearchPanelRef}>`,
  `          </div>
          {/* Persistent zero-size anchor elements for pickers (always mounted) */}
          <span id="compose-emoji-anchor" style={{ position: 'absolute', pointerEvents: 'none', opacity: 0, width: 0, height: 0 }} />
          <span id="compose-symbols-anchor" style={{ position: 'absolute', pointerEvents: 'none', opacity: 0, width: 0, height: 0 }} />
          <span id="compose-equations-anchor" style={{ position: 'absolute', pointerEvents: 'none', opacity: 0, width: 0, height: 0 }} />
          <div className="w-px h-4 bg-gray-200"></div>
          <div className="relative flex items-center gap-3" ref={docSearchPanelRef}>`
);

// ─── FIX 8: Re-anchor the pickers to the Insert button instead of inside the dropdown ─────
// Change the anchorEl prop for emoji/symbols/equations pickers from dropdown-internal IDs to the insert btn
app = app.replace(
  `<EmojiGalleryPicker isOpen={composeEmojiPickerOpen} setOpen={setComposeEmojiPickerOpen} anchorEl={document.getElementById('compose-emoji-btn')} />`,
  `<EmojiGalleryPicker isOpen={composeEmojiPickerOpen} setOpen={setComposeEmojiPickerOpen} anchorEl={document.getElementById('compose-insert-btn')} />`
);
app = app.replace(
  `<SymbolGalleryPicker isOpen={symbolsPickerOpen} setOpen={setSymbolsPickerOpen} anchorEl={document.getElementById('compose-symbols-btn')} />`,
  `<SymbolGalleryPicker isOpen={symbolsPickerOpen} setOpen={setSymbolsPickerOpen} anchorEl={document.getElementById('compose-insert-btn')} />`
);
app = app.replace(
  `<EquationGalleryPicker isOpen={equationsPickerOpen} setOpen={setEquationsPickerOpen} anchorEl={document.getElementById('compose-equations-btn')} />`,
  `<EquationGalleryPicker isOpen={equationsPickerOpen} setOpen={setEquationsPickerOpen} anchorEl={document.getElementById('compose-insert-btn')} />`
);
// Also re-anchor the ListGalleryPicker to compose-list-btn which IS always mounted (the Lists dropdown trigger btn)
app = app.replace(
  `<ListGalleryPicker isOpen={!!listGalleryOpen} initialTab={typeof listGalleryOpen === 'string' ? listGalleryOpen : 'bullet'} setOpen={setListGalleryOpen} anchorEl={document.getElementById('compose-list-btn')} />`,
  `<ListGalleryPicker isOpen={!!listGalleryOpen} initialTab={typeof listGalleryOpen === 'string' ? listGalleryOpen : 'bullet'} setOpen={setListGalleryOpen} anchorEl={document.getElementById('compose-list-btn')} />`
);

// ─── FIX 9: Insert dropdown — Symbols also in Lists-adjacent area ─────────
// Already handled above. Symbols/Equations are in Insert dropdown. Good.

// ─── FIX 10: Table — replace insertHTML with a proper table picker grid ──
// The current table button fires execCommand but focus is lost. Replace the table entry
// with one that opens a mini grid picker state. We'll use a simple approach: open a
// tablePickerOpen state that shows a grid overlay anchored to the insert button.
// For now, the simplest correct fix is to ensure focus is restored before execCommand.

// Fix all execCommand calls in the Insert dropdown to restore editor focus first
const insertDropdownFixes = [
  // Table
  [
    `e.preventDefault(); const html = '<table style=`,
    `e.preventDefault(); const editor = document.querySelector('[contenteditable="true"]'); if (editor) editor.focus(); const html = '<table style=`
  ],
  // Callout
  [
    `e.preventDefault(); const html = '<div style="border-left:3px solid #8b5cf6`,
    `e.preventDefault(); const editor2 = document.querySelector('[contenteditable="true"]'); if (editor2) editor2.focus(); const html = '<div style="border-left:3px solid #8b5cf6`
  ],
  // Code block
  [
    `e.preventDefault(); const html = '<div style="background:#1e293b`,
    `e.preventDefault(); const editor3 = document.querySelector('[contenteditable="true"]'); if (editor3) editor3.focus(); const html = '<div style="background:#1e293b`
  ],
  // Divider
  [
    `e.preventDefault(); const html = '<hr style=`,
    `e.preventDefault(); const editor4 = document.querySelector('[contenteditable="true"]'); if (editor4) editor4.focus(); const html = '<hr style=`
  ]
];

for (const [from, to] of insertDropdownFixes) {
  app = app.replace(from, to);
}

fs.writeFileSync('src/App.jsx', app);
console.log('All fixes applied. File size delta:', app.length - before, 'bytes');
