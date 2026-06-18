const fs = require('fs');
const path = require('path');

const appPath = path.join(__dirname, 'src', 'App.jsx');
let code = fs.readFileSync(appPath, 'utf8');

const yjsStateCode = `
  // Yjs state for Real-Time Collaboration
  const yDocRef = useRef(null);
  const providerRef = useRef(null);
  const yTextRef = useRef(null);
  const isLocalUpdateRef = useRef(false);
  const [awarenessUsers, setAwarenessUsers] = useState(new Map());
  const dmpRef = useRef(new DiffMatchPatch());
  
  useEffect(() => {
    yDocRef.current = new Y.Doc();
    yTextRef.current = yDocRef.current.getText('docBodyHtml');

    const wsUrl = 'ws://localhost:3001/yjs';
    const roomName = \`compose-room-\${activeDocId || 'default'}\`;
    providerRef.current = new WebsocketProvider(wsUrl, roomName, yDocRef.current);

    const awareness = providerRef.current.awareness;
    awareness.setLocalStateField('user', {
      name: \`User \${Math.floor(Math.random() * 1000)}\`,
      color: randomColor({ luminosity: 'dark' })
    });

    awareness.on('change', () => {
      const states = awareness.getStates();
      const newUsers = new Map();
      states.forEach((state, clientID) => {
        if (clientID !== awareness.clientID && state.user) {
          newUsers.set(clientID, state);
        }
      });
      setAwarenessUsers(newUsers);
    });

    yTextRef.current.observe((event, transaction) => {
      if (transaction.local) return;
      
      const newHtml = yTextRef.current.toString();
      
      const sel = window.getSelection();
      let anchorNode = null, anchorOffset = 0, focusNode = null, focusOffset = 0;
      if (sel.rangeCount > 0 && blankBodyRef.current && blankBodyRef.current.contains(sel.anchorNode)) {
          anchorNode = sel.anchorNode;
          anchorOffset = sel.anchorOffset;
          focusNode = sel.focusNode;
          focusOffset = sel.focusOffset;
      }

      setDocBodyHtml(newHtml);
      if (blankBodyRef.current) {
         blankBodyRef.current.innerHTML = newHtml;
      }
      
      // Simple attempt to restore selection if possible
      try {
         if (anchorNode && document.body.contains(anchorNode)) {
            const range = document.createRange();
            range.setStart(anchorNode, anchorOffset);
            range.setEnd(focusNode, focusOffset);
            sel.removeAllRanges();
            sel.addRange(range);
         }
      } catch (e) {
         // Silently fail if nodes were completely replaced
      }
    });

    return () => {
      providerRef.current?.destroy();
      yDocRef.current?.destroy();
    };
  }, [activeDocId]);

  useEffect(() => {
    if (!yTextRef.current || isLocalUpdateRef.current) return;
    
    const currentYText = yTextRef.current.toString();
    if (docBodyHtml !== currentYText) {
      isLocalUpdateRef.current = true;
      const dmp = dmpRef.current;
      const diffs = dmp.diff_main(currentYText, docBodyHtml);
      dmp.diff_cleanupSemantic(diffs);
      
      yDocRef.current.transact(() => {
        let index = 0;
        diffs.forEach(([op, text]) => {
          if (op === 0) {
            index += text.length;
          } else if (op === -1) {
            yTextRef.current.delete(index, text.length);
          } else if (op === 1) {
            yTextRef.current.insert(index, text);
            index += text.length;
          }
        });
      }, 'local');
      isLocalUpdateRef.current = false;
    }
  }, [docBodyHtml]);
`;

// Insert Yjs logic after setDocBodyHtml
const stateRegex = /const \[docBodyHtml, setDocBodyHtml\] = useState\(''\);/;
code = code.replace(stateRegex, "const [docBodyHtml, setDocBodyHtml] = useState('');\n" + yjsStateCode);

// Insert wrapper and awareness cursors around blankBodyRef
const divStartRegex = /<div\\s+ref=\\{blankBodyRef\\}/;
const cursorOverlayCode = \`
<div style={{ position: 'relative' }}>
  {Array.from(awarenessUsers.values()).map((userState, idx) => (
    <div key={idx} style={{
      position: 'absolute',
      top: '10px',
      right: \`\${idx * 30}px\`,
      backgroundColor: userState.user.color,
      color: 'white',
      padding: '2px 8px',
      borderRadius: '12px',
      fontSize: '12px',
      zIndex: 100,
      opacity: 0.8,
      pointerEvents: 'none'
    }}>
      {userState.user.name} is editing...
    </div>
  ))}
  <div
    ref={blankBodyRef}\`;

code = code.replace(divStartRegex, cursorOverlayCode);

// Close the relative div wrapper properly.
// The blankBodyRef div has an end tag </div>. We must find the closing tag for the isBlankDocument fragment.
// It's tricky to parse HTML with regex, so we'll look for `/>` or `</div>` that closes it.
// Let's just find the exact closing structure and append `</div>`.
// A better way is to replace `</>\n            )}` with `</div>\n              </>\n            )}` for `isBlankDocument`.
const endFragRegex = /<\\/div>\\s+<\\/>\\s+\\)\\}|\\{isBlockMode/g;

// Instead of regex, let's find the closing of `isBlankDocument` and wrap the div.
// Looking at App.jsx:
//             {isBlankDocument && (
//               <>
//                 <div ...> ... </div>
//               </>
//             )}

const isBlankDocRegex = /\{isBlankDocument && \(\\s*<>\\s*<div\\s*ref=\{blankBodyRef\}/;
if (code.match(isBlankDocRegex)) {
   code = code.replace(
     /\{isBlankDocument && \(\\s*<>/,
     '{isBlankDocument && (<><div style={{position:"relative"}}>'
   );
   // And then we add the </div> before the closing </>
   // We will just find the corresponding closing </> for isBlankDocument
   // Since the div ends right before `</>`, we can replace `</div>\n              </>\n            )}` 
   // Note: this relies on exact formatting.
   code = code.replace(
     /<\/div>\s*<\/>\s*\)\}/,
     '</div></div></>)}'
   );
} else {
   // Fallback simple replace
   code = code.replace(divStartRegex, cursorOverlayCode);
   // Hope that we don't need the closing tag or we add it manually later.
   // Wait, if we use the first replace, we must close the div.
   code = code.replace(/<\/div>\s*<\/>\s*\)\}/, '</div></div></>)}');
}

fs.writeFileSync(appPath, code);
console.log('App.jsx patched successfully.');
