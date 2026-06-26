const fs = require('fs');
let app = fs.readFileSync('src/App.jsx', 'utf8');

// ════════════════════════════════════════════════════════════════
// 1. ADD emoji/symbols/equations/table to SLASH_OPTIONS
// ════════════════════════════════════════════════════════════════
app = app.replace(
  `  { key: 'comment', label: 'Comment', desc: 'Insert inline comment box' },
  { key: 'redact', label: 'Redact / Protect', desc: 'Redact selection or current block' }
];`,
  `  { key: 'comment', label: 'Comment', desc: 'Insert inline comment box' },
  { key: 'redact', label: 'Redact / Protect', desc: 'Redact selection or current block' },
  { key: 'emoji', label: 'Emoji', desc: 'Browse and insert emoji' },
  { key: 'symbols', label: 'Symbols', desc: 'Insert special characters & symbols' },
  { key: 'equations', label: 'Equation', desc: 'Insert a math equation' },
  { key: 'insert_table', label: 'Table (manual)', desc: 'Pick table size and insert' },
  { key: 'divider', label: 'Divider', desc: 'Insert a horizontal rule' },
  { key: 'callout', label: 'Callout', desc: 'Insert a styled quote block' },
  { key: 'code_block', label: 'Code Block', desc: 'Insert a code container' }
];`
);

// ════════════════════════════════════════════════════════════════
// 2. ADD handlers for new slash keys in executeSlashCommand
// ════════════════════════════════════════════════════════════════
// We insert new cases just before the final sync block "// Sync DOM back to React state"
app = app.replace(
  `    // Sync DOM back to React state
    if (blankBodyRef.current) {
      setDocBodyHtml(blankBodyRef.current.innerHTML);
    }
  };`,
  `    } else if (key === 'emoji') {
      setComposeEmojiPickerOpen(true);
    } else if (key === 'symbols') {
      setSymbolsPickerOpen(true);
    } else if (key === 'equations') {
      setEquationsPickerOpen(true);
    } else if (key === 'insert_table') {
      setInsertDropdownOpen(true); // opens Insert dropdown so user can pick table size
    } else if (key === 'divider') {
      document.execCommand('insertHTML', false, '<hr style="border:none;border-top:2px solid #e2e8f0;margin:20px 0" /><p><br></p>');
    } else if (key === 'callout') {
      document.execCommand('insertHTML', false, '<div style="border-left:3px solid #8b5cf6;padding:12px 16px;background:#faf5ff;border-radius:0 8px 8px 0;margin:12px 0;color:#4c1d95;font-style:italic">&nbsp;</div><p><br></p>');
    } else if (key === 'code_block') {
      document.execCommand('insertHTML', false, '<div style="background:#1e293b;border-radius:8px;padding:16px;margin:12px 0;font-family:monospace;font-size:13px;color:#e2e8f0;white-space:pre"><span style="color:#94a3b8">// Code block</span>\\n</div><p><br></p>');
    }

    // Sync DOM back to React state
    if (blankBodyRef.current) {
      setDocBodyHtml(blankBodyRef.current.innerHTML);
    }
  };`
);

// ════════════════════════════════════════════════════════════════
// 3. EXPOSE window.__composeInsert helpers from inside App
//    These let picker components (which live outside App) reliably
//    restore the editor selection before calling execCommand.
//    Insert after restoreSavedSelection definition.
// ════════════════════════════════════════════════════════════════
app = app.replace(
  `  const injectIntoSavedSelection = (text, options = {}) => {`,
  `  // Expose global helpers so picker components outside App can use them
  React.useEffect(() => {
    window.__composeInsertHTML = (html) => {
      const ed = blankBodyRef.current;
      if (!ed) return;
      ed.focus();
      const sel = window.getSelection();
      // Restore saved selection if current selection is not inside editor
      if (savedSelectionRef.current && (!sel || !sel.rangeCount || !ed.contains(sel.anchorNode))) {
        sel.removeAllRanges();
        sel.addRange(savedSelectionRef.current);
      }
      // If still no selection in editor, collapse to end
      if (!sel || !sel.rangeCount || !ed.contains(sel.anchorNode)) {
        const range = document.createRange();
        range.selectNodeContents(ed);
        range.collapse(false);
        sel.removeAllRanges();
        sel.addRange(range);
      }
      document.execCommand('insertHTML', false, html);
      setDocBodyHtml(ed.innerHTML);
    };
    window.__composeInsertText = (text) => {
      const ed = blankBodyRef.current;
      if (!ed) return;
      ed.focus();
      const sel = window.getSelection();
      if (savedSelectionRef.current && (!sel || !sel.rangeCount || !ed.contains(sel.anchorNode))) {
        sel.removeAllRanges();
        sel.addRange(savedSelectionRef.current);
      }
      if (!sel || !sel.rangeCount || !ed.contains(sel.anchorNode)) {
        const range = document.createRange();
        range.selectNodeContents(ed);
        range.collapse(false);
        sel.removeAllRanges();
        sel.addRange(range);
      }
      document.execCommand('insertText', false, text);
      setDocBodyHtml(ed.innerHTML);
    };
    return () => {
      delete window.__composeInsertHTML;
      delete window.__composeInsertText;
    };
  }, []);

  const injectIntoSavedSelection = (text, options = {}) => {`
);

// ════════════════════════════════════════════════════════════════
// 4. SAVE selection when Insert or List button is clicked
// ════════════════════════════════════════════════════════════════
app = app.replace(
  `onPointerDown={(e) => { e.preventDefault(); setInsertDropdownOpen(v => !v); setListDropdownOpen(false); }}`,
  `onPointerDown={(e) => { e.preventDefault(); const sel = window.getSelection(); if (sel && sel.rangeCount) { try { const r = sel.getRangeAt(0); if (blankBodyRef.current?.contains(r.commonAncestorContainer)) savedSelectionRef.current = r.cloneRange(); } catch(x){} } setInsertDropdownOpen(v => !v); setListDropdownOpen(false); }}`
);
app = app.replace(
  `onPointerDown={(e) => { e.preventDefault(); setListDropdownOpen(v => !v); setInsertDropdownOpen(false); }}`,
  `onPointerDown={(e) => { e.preventDefault(); const sel = window.getSelection(); if (sel && sel.rangeCount) { try { const r = sel.getRangeAt(0); if (blankBodyRef.current?.contains(r.commonAncestorContainer)) savedSelectionRef.current = r.cloneRange(); } catch(x){} } setListDropdownOpen(v => !v); setInsertDropdownOpen(false); }}`
);

// ════════════════════════════════════════════════════════════════
// 5. FIX EmojiGalleryPicker — use window.__composeInsertText
// ════════════════════════════════════════════════════════════════
app = app.replace(
  `e.preventDefault();
                  // Restore editor focus before inserting
                  const editor = document.querySelector('[contenteditable="true"]');
                  if (editor) editor.focus();
                  document.execCommand('insertText', false, emoji);
                  setOpen(false);`,
  `e.preventDefault();
                  if (window.__composeInsertText) window.__composeInsertText(emoji);
                  else { const ed = document.querySelector('[contenteditable="true"]'); if (ed) ed.focus(); document.execCommand('insertText', false, emoji); }
                  setOpen(false);`
);

// ════════════════════════════════════════════════════════════════
// 6. FIX SymbolGalleryPicker — use window.__composeInsertText
// ════════════════════════════════════════════════════════════════
app = app.replace(
  `e.preventDefault();
                  const editor = document.querySelector('[contenteditable="true"]');
                  if (editor) editor.focus();
                  document.execCommand('insertText', false, sym);
                  setOpen(false);`,
  `e.preventDefault();
                  if (window.__composeInsertText) window.__composeInsertText(sym);
                  else { const ed = document.querySelector('[contenteditable="true"]'); if (ed) ed.focus(); document.execCommand('insertText', false, sym); }
                  setOpen(false);`
);

// ════════════════════════════════════════════════════════════════
// 7. FIX EquationGalleryPicker — use window.__composeInsertText
// ════════════════════════════════════════════════════════════════
app = app.replace(
  `e.preventDefault();
            const editor = document.querySelector('[contenteditable="true"]');
            if (editor) editor.focus();
            document.execCommand('insertText', false, item.eq);
            setOpen(false);`,
  `e.preventDefault();
            if (window.__composeInsertText) window.__composeInsertText(item.eq);
            else { const ed = document.querySelector('[contenteditable="true"]'); if (ed) ed.focus(); document.execCommand('insertText', false, item.eq); }
            setOpen(false);`
);

// ════════════════════════════════════════════════════════════════
// 8. FIX TableGridPicker — use window.__composeInsertHTML
// ════════════════════════════════════════════════════════════════
app = app.replace(
  `e.preventDefault(); const ed = document.querySelector('[contenteditable="true"]'); if (ed) ed.focus(); document.execCommand('insertHTML', false, buildTable(r + 1, c + 1)); setInsertDropdownOpen(false);`,
  `e.preventDefault(); if (window.__composeInsertHTML) window.__composeInsertHTML(buildTable(r + 1, c + 1)); else { const ed = document.querySelector('[contenteditable="true"]'); if (ed) ed.focus(); document.execCommand('insertHTML', false, buildTable(r + 1, c + 1)); } setInsertDropdownOpen(false);`
);

// ════════════════════════════════════════════════════════════════
// 9. FIX all Insert dropdown block items to use window.__composeInsertHTML
// ════════════════════════════════════════════════════════════════
// Callout
app = app.replace(
  `e.preventDefault(); const ed = document.querySelector('[contenteditable="true"]'); if (ed) ed.focus(); document.execCommand('insertHTML', false, '<div style="border-left:3px solid #8b5cf6;padding:12px 16px;background:#faf5ff;border-radius:0 8px 8px 0;margin:12px 0;color:#4c1d95;font-style:italic">&nbsp;</div><p><br></p>'); setInsertDropdownOpen(false);`,
  `e.preventDefault(); const calloutHtml = '<div style="border-left:3px solid #8b5cf6;padding:12px 16px;background:#faf5ff;border-radius:0 8px 8px 0;margin:12px 0;color:#4c1d95;font-style:italic">&nbsp;</div><p><br></p>'; if (window.__composeInsertHTML) window.__composeInsertHTML(calloutHtml); else document.execCommand('insertHTML', false, calloutHtml); setInsertDropdownOpen(false);`
);
// Code block
app = app.replace(
  `e.preventDefault(); const ed = document.querySelector('[contenteditable="true"]'); if (ed) ed.focus(); document.execCommand('insertHTML', false, '<div style="background:#1e293b;border-radius:8px;padding:16px;margin:12px 0;font-family:monospace;font-size:13px;color:#e2e8f0;white-space:pre"><span style="color:#94a3b8">// Code block</span>\\n</div><p><br></p>'); setInsertDropdownOpen(false);`,
  `e.preventDefault(); const codeHtml = '<div style="background:#1e293b;border-radius:8px;padding:16px;margin:12px 0;font-family:monospace;font-size:13px;color:#e2e8f0;white-space:pre"><span style="color:#94a3b8">// Code block</span>\\n</div><p><br></p>'; if (window.__composeInsertHTML) window.__composeInsertHTML(codeHtml); else document.execCommand('insertHTML', false, codeHtml); setInsertDropdownOpen(false);`
);
// Divider
app = app.replace(
  `e.preventDefault(); const ed = document.querySelector('[contenteditable="true"]'); if (ed) ed.focus(); document.execCommand('insertHTML', false, '<hr style="border:none;border-top:2px solid #e2e8f0;margin:20px 0" /><p><br></p>'); setInsertDropdownOpen(false);`,
  `e.preventDefault(); const divHtml = '<hr style="border:none;border-top:2px solid #e2e8f0;margin:20px 0" /><p><br></p>'; if (window.__composeInsertHTML) window.__composeInsertHTML(divHtml); else document.execCommand('insertHTML', false, divHtml); setInsertDropdownOpen(false);`
);
// Checklist
app = app.replace(
  `const ed = document.querySelector('[contenteditable="true"]'); if (ed) ed.focus(); const html = '<ul style="list-style:none;padding-left:0"><li style="display:flex;align-items:center;gap:8px;margin:4px 0"><input type="checkbox" style="width:15px;height:15px;cursor:pointer" /><span>&nbsp;</span></li></ul><p><br></p>';`,
  `const checkHtml = '<ul style="list-style:none;padding-left:0"><li style="display:flex;align-items:center;gap:8px;margin:4px 0"><input type="checkbox" style="width:15px;height:15px;cursor:pointer" /><span>&nbsp;</span></li></ul><p><br></p>'; const html = checkHtml;`
);
app = app.replace(
  `document.execCommand('insertHTML', false, html); setListDropdownOpen(false); } }`,
  `if (window.__composeInsertHTML) window.__composeInsertHTML(html); else document.execCommand('insertHTML', false, html); setListDropdownOpen(false); } }`
);

// ════════════════════════════════════════════════════════════════
// 10. FIX POSITIONING — all pickers open to the LEFT/UP of Insert button
//     so they never clip into the right sidebar
// ════════════════════════════════════════════════════════════════
// EmojiGalleryPicker: position right-edge aligned to anchor, clamped from left
app = app.replace(
  `style={{ top: rect.bottom + 8, left: Math.min(rect.left, window.innerWidth - 440), width: '420px', height: '360px' }}`,
  `style={{ top: rect.bottom + 8, left: Math.max(8, Math.min(rect.left, window.innerWidth - 460)), width: '420px', height: '360px', maxHeight: 'calc(100vh - ' + (rect.bottom + 16) + 'px)', overflowY: 'auto' }}`
);

// SymbolGalleryPicker: right-align to anchor
app = app.replace(
  `style={{ top: rect.bottom + 8, left: rect.left < window.innerWidth / 2 ? rect.left : rect.left - 380, width: '380px', height: '300px' }}`,
  `style={{ top: rect.bottom + 8, left: Math.max(8, Math.min(rect.left, window.innerWidth - 400)), width: '380px', height: '300px' }}`
);

// EquationGalleryPicker: right-align to anchor
app = app.replace(
  `style={{ top: rect.bottom + 8, left: rect.left < window.innerWidth / 2 ? rect.left : rect.left - 320 }}`,
  `style={{ top: rect.bottom + 8, left: Math.max(8, Math.min(rect.left, window.innerWidth - 340)) }}`
);

// ListGalleryPicker: clamp to viewport
app = app.replace(
  `style={{ top: Math.min(rect.bottom + 8, window.innerHeight - 360), left: Math.min(rect.left, window.innerWidth - 540), width: '520px', minHeight: '340px' }}`,
  `style={{ top: Math.min(rect.bottom + 8, window.innerHeight - 360), left: Math.max(8, Math.min(rect.left, window.innerWidth - 540)), width: '520px', minHeight: '340px' }}`
);

// ════════════════════════════════════════════════════════════════
// 11. INSERT DROPDOWN — add thin scrollbar, max-height, overflow
// ════════════════════════════════════════════════════════════════
app = app.replace(
  `className="absolute top-full left-0 mt-1.5 z-[99998] bg-white border border-slate-200/70 rounded-xl shadow-[0_8px_24px_rgba(0,0,0,0.10)] p-1.5 w-64 flex flex-col gap-0.5"`,
  `className="absolute top-full left-0 mt-1.5 z-[99998] bg-white border border-slate-200/70 rounded-xl shadow-[0_8px_24px_rgba(0,0,0,0.10)] p-1.5 w-64 flex flex-col gap-0.5 overflow-y-auto" style={{ maxHeight: 'min(480px, calc(100vh - 120px))', scrollbarWidth: 'thin', scrollbarColor: '#c7d2fe transparent' }}`
);

fs.writeFileSync('src/App.jsx', app);
console.log('All fixes applied. File size:', app.length);
