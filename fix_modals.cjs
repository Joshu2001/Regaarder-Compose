const fs = require('fs');
const appPath = 'c:/Users/user/Downloads/Project MOAT/Regaarder Compose/src/App.jsx';
let appCode = fs.readFileSync(appPath, 'utf-8');

// 1. Fix hardcoded slash menu positions
// Line 11685: setSheetSlashMenu({ open: true, left: window.innerWidth / 2, top: `${window.innerHeight / 2}px`, ...
appCode = appCode.replace(
  /left:\s*window\.innerWidth\s*\/\s*2,\s*top:\s*`\$\{window\.innerHeight\s*\/\s*2\}px`,/g,
  'left: target ? target.getBoundingClientRect().left : window.innerWidth / 2, top: target ? `${target.getBoundingClientRect().bottom}px` : `${window.innerHeight / 2}px`,'
);
appCode = appCode.replace(
  /left:\s*window\.innerWidth\s*\/\s*2,\s*top:\s*`\$\{window\.innerHeight\s*\/\s*2\}px`/g,
  'left: event.target ? event.target.getBoundingClientRect().left : window.innerWidth / 2, top: event.target ? `${event.target.getBoundingClientRect().bottom}px` : `${window.innerHeight / 2}px`'
);

// We should also find line 26175 which uses the same static positioning.
// It looks like: setSheetSlashMenu({ open: true, left: window.innerWidth / 2, ...
appCode = appCode.replace(
  /setSheetSlashMenu\(\{\s*open:\s*true,\s*left:\s*window\.innerWidth\s*\/\s*2,\s*top:\s*`\$\{window\.innerHeight\s*\/\s*2\}px`/g,
  'setSheetSlashMenu({ open: true, left: event.target ? event.target.getBoundingClientRect().left : window.innerWidth / 2, top: event.target ? `${event.target.getBoundingClientRect().bottom}px` : `${window.innerHeight / 2}px`'
);

// 2. Insert Modals into Sheets/Deck Return Statement
// The return statement for `sheets` and `deck` ends around line 26909:
//       </div>
//     );
//   }
//   if (productMode === 'room' && roomState !== 'active') {

const modalsToInject = `
      {shareModalOpen && (
        <ShareModal
          isOpen={shareModalOpen}
          onClose={() => setShareModalOpen(false)}
          shareTargetDocTitle={shareTargetDocTitle}
          shareDestination={shareDestination}
          setShareDestination={setShareDestination}
          shareAccess={shareAccess}
          setShareAccess={setShareAccess}
          shareFormat={shareFormat}
          setShareFormat={setShareFormat}
          shareLink={shareLink}
          handleShareModalConfirm={handleShareModalConfirm}
          zeroKnowledgeRedactions={zeroKnowledgeRedactions}
          removeProtection={removeProtection}
          newRedactionKeyword={newRedactionKeyword}
          setNewRedactionKeyword={setNewRedactionKeyword}
          protectKeywordInEditor={protectKeywordInEditor}
          setZeroKnowledgePreviewOpen={setZeroKnowledgePreviewOpen}
          sharePasswordProtected={sharePasswordProtected}
          setSharePasswordProtected={setSharePasswordProtected}
          sharePassword={sharePassword}
          setSharePassword={setSharePassword}
          sharePasswordConfirm={sharePasswordConfirm}
          setSharePasswordConfirm={setSharePasswordConfirm}
          showSharePassword={showSharePassword}
          setShowSharePassword={setShowSharePassword}
          isPasswordConfirmed={isPasswordConfirmed}
          setIsPasswordConfirmed={setIsPasswordConfirmed}
          shareExpiringAccess={shareExpiringAccess}
          setShareExpiringAccess={setShareExpiringAccess}
          shareExpirationValue={shareExpirationValue}
          setShareExpirationValue={setShareExpirationValue}
          shareExpirationUnit={shareExpirationUnit}
          setShareExpirationUnit={setShareExpirationUnit}
          shareExpirationDate={shareExpirationDate}
          setShareExpirationDate={setShareExpirationDate}
        />
      )}
      {productMode === 'sheets' && sheetSlashMenu.open && (() => {
        const filtered = SHEET_SLASH_OPTIONS.filter(opt =>
          opt.label.toLowerCase().includes((sheetSlashMenu.filterText || '').toLowerCase())
        );
        return (
          <>
            <div
              ref={sheetSlashMenuContainerRef}
              className="slash-menu-container animate-in fade-in zoom-in-95 duration-100"
              style={{
                position: 'fixed',
                zIndex: 99999,
                left: \`\${sheetSlashMenu.left}px\`,
                top: sheetSlashMenu.top,
                bottom: sheetSlashMenu.bottom,
                minWidth: '260px',
                maxHeight: '360px',
                overflowY: 'auto',
              }}
              onMouseDown={e => e.stopPropagation()}
            >
              {sheetSlashMenu.filterText && (
                <div className="px-3 py-2 border-b border-gray-100 text-[11px] text-gray-500 bg-gray-50">
                  Search: <span className="font-semibold text-gray-700">"{sheetSlashMenu.filterText}"</span>
                </div>
              )}
              {filtered.length === 0 ? (
                <div className="px-3 py-4 text-center text-xs text-gray-400">No matching actions</div>
              ) : (
                filtered.map((opt, idx) => {
                  const isActive = idx === sheetSlashMenu.activeIndex;
                  return (
                    <button
                      key={opt.key}
                      type="button"
                      onMouseDown={e => e.preventDefault()}
                      onClick={() => {
                        executeSheetSlashCommand(opt.key);
                        setSheetSlashMenu(prev => ({ ...prev, open: false }));
                      }}
                      onMouseEnter={() => setSheetSlashMenu(prev => ({ ...prev, activeIndex: idx }))}
                      className={\`slash-menu-option \${isActive ? 'active' : ''}\`}
                    >
                      <span className="slash-menu-option-label">{opt.label}</span>
                      <span className="slash-menu-option-desc">{opt.desc}</span>
                    </button>
                  );
                })
              )}
            </div>
          </>
        );
      })()}
`;

// Also insert into `dm` and `manageen` and `room` and `landing`?
// The user explicitly complained about "sheets or any other then compose".
// Let's inject it into all ends of top-level return statements!

// The pattern is typically:
//       </div>
//     );
//   }
//   if (productMode === ...

// Let's split by lines and insert before `);` for all major `productMode` return statements.
const lines = appCode.split('\\n');
for (let i = 22000; i < lines.length - 1000; i++) {
  if (lines[i].includes('  }') && lines[i-1].includes('    );') && lines[i-2].includes('      </div>')) {
    // We found a return block end!
    lines.splice(i - 2, 0, modalsToInject);
    i += modalsToInject.split('\\n').length;
  }
}

// Write back
fs.writeFileSync(appPath, lines.join('\\n'));
console.log("Successfully injected modals and fixed slash menu position.");
