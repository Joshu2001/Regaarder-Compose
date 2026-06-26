const fs = require('fs');
let app = fs.readFileSync('src/App.jsx', 'utf8');

const helperSetupOld = `    window.__composeInsertText = (text) => {
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
    };`;
    
const helperSetupNew = `    window.__composeInsertText = (text) => {
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
    window.__composeApplyFormatCommand = applyFormatCommand;
    return () => {
      delete window.__composeInsertHTML;
      delete window.__composeInsertText;
      delete window.__composeApplyFormatCommand;
    };`;
    
app = app.replace(helperSetupOld, helperSetupNew);
if(app.indexOf('window.__composeApplyFormatCommand = applyFormatCommand;') === -1) {
    app = app.replace(helperSetupOld.replace(/\n/g, '\r\n'), helperSetupNew.replace(/\n/g, '\r\n'));
}

const listHandlerOld = `              <button key={idx} onPointerDown={(e) => { 
                e.preventDefault(); 
                window.showToast('Applied ' + item.label);
                setOpen(false); 
                document.execCommand(activeTab === 'bullet' ? 'insertUnorderedList' : 'insertOrderedList');
              }}`;
const listHandlerNew = `              <button key={idx} onPointerDown={(e) => { 
                e.preventDefault(); 
                window.showToast('Applied ' + item.label);
                setOpen(false); 
                if (window.__composeApplyFormatCommand) {
                  window.__composeApplyFormatCommand(activeTab === 'bullet' ? 'insertUnorderedList' : 'insertOrderedList');
                } else {
                  const ed = document.querySelector('[contenteditable="true"]');
                  if (ed) ed.focus();
                  document.execCommand(activeTab === 'bullet' ? 'insertUnorderedList' : 'insertOrderedList');
                }
              }}`;
app = app.replace(listHandlerOld, listHandlerNew);
if(app.indexOf('window.__composeApplyFormatCommand(activeTab') === -1) {
    app = app.replace(listHandlerOld.replace(/\n/g, '\r\n'), listHandlerNew.replace(/\n/g, '\r\n'));
}

fs.writeFileSync('src/App.jsx', app);
console.log('List picker handler updated');
