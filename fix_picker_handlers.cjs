const fs = require('fs');
let app = fs.readFileSync('src/App.jsx', 'utf8');

// Replace EmojiGalleryPicker insert logic
const emojiOld = `onPointerDown={(e) => {
                  e.preventDefault();
                  // Restore editor focus before inserting
                  const editor = document.querySelector('[contenteditable="true"]');
                  if (editor) editor.focus();
                  document.execCommand('insertText', false, emoji);
                  setOpen(false);
                }}`;
const emojiNew = `onPointerDown={(e) => {
                  e.preventDefault();
                  if (window.__composeInsertText) window.__composeInsertText(emoji);
                  else { const ed = document.querySelector('[contenteditable="true"]'); if (ed) ed.focus(); document.execCommand('insertText', false, emoji); }
                  setOpen(false);
                }}`;
if (app.includes(emojiOld)) {
  app = app.replace(emojiOld, emojiNew);
} else {
  // Try CRLF
  app = app.replace(emojiOld.replace(/\n/g, '\r\n'), emojiNew.replace(/\n/g, '\r\n'));
}

// Replace SymbolGalleryPicker insert logic
const symbolOld = `onPointerDown={(e) => {
                  e.preventDefault();
                  const editor = document.querySelector('[contenteditable="true"]');
                  if (editor) editor.focus();
                  document.execCommand('insertText', false, sym);
                  setOpen(false);
                }}`;
const symbolNew = `onPointerDown={(e) => {
                  e.preventDefault();
                  if (window.__composeInsertText) window.__composeInsertText(sym);
                  else { const ed = document.querySelector('[contenteditable="true"]'); if (ed) ed.focus(); document.execCommand('insertText', false, sym); }
                  setOpen(false);
                }}`;
if (app.includes(symbolOld)) {
  app = app.replace(symbolOld, symbolNew);
} else {
  app = app.replace(symbolOld.replace(/\n/g, '\r\n'), symbolNew.replace(/\n/g, '\r\n'));
}

// Replace EquationGalleryPicker insert logic
const eqOld = `onPointerDown={(e) => {
            e.preventDefault();
            const editor = document.querySelector('[contenteditable="true"]');
            if (editor) editor.focus();
            document.execCommand('insertText', false, item.eq);
            setOpen(false);
          }}`;
const eqNew = `onPointerDown={(e) => {
            e.preventDefault();
            if (window.__composeInsertText) window.__composeInsertText(item.eq);
            else { const ed = document.querySelector('[contenteditable="true"]'); if (ed) ed.focus(); document.execCommand('insertText', false, item.eq); }
            setOpen(false);
          }}`;
if (app.includes(eqOld)) {
  app = app.replace(eqOld, eqNew);
} else {
  app = app.replace(eqOld.replace(/\n/g, '\r\n'), eqNew.replace(/\n/g, '\r\n'));
}

fs.writeFileSync('src/App.jsx', app);
console.log('Fixed picker handlers.');
