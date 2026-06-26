const fs = require('fs');
let app = fs.readFileSync('src/App.jsx', 'utf8');

const htmlOld = `    window.__composeInsertHTML = (html) => {
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
    };`;

const htmlNew = `    window.__composeInsertHTML = (html) => {
      const ed = blankBodyRef.current;
      if (!ed) return;
      const sel = window.getSelection();
      // Unconditionally restore saved selection to avoid focus race conditions
      if (savedSelectionRef.current) {
        sel.removeAllRanges();
        sel.addRange(savedSelectionRef.current);
      }
      ed.focus();
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
    };`;

app = app.replace(htmlOld, htmlNew);

const textOld = `    window.__composeInsertText = (text) => {
      const ed = blankBodyRef.current;
      if (!ed) return;
      ed.focus();
      const sel = window.getSelection();
      // Restore saved selection if current selection is not inside editor
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
    };`;

const textNew = `    window.__composeInsertText = (text) => {
      const ed = blankBodyRef.current;
      if (!ed) return;
      const sel = window.getSelection();
      // Unconditionally restore saved selection
      if (savedSelectionRef.current) {
        sel.removeAllRanges();
        sel.addRange(savedSelectionRef.current);
      }
      ed.focus();
      if (!sel || !sel.rangeCount || !ed.contains(sel.anchorNode)) {
        const range = document.createRange();
        range.selectNodeContents(ed);
        range.collapse(false);
        sel.removeAllRanges();
        sel.addRange(range);
      }
      document.execCommand('insertText', false, text);
      setDocBodyHtml(ed.innerHTML);
    };`;

app = app.replace(textOld, textNew);

fs.writeFileSync('src/App.jsx', app);
console.log('Fixed selection restoration functions.');
