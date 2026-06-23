const fs = require('fs');
const appPath = 'c:/Users/user/Downloads/Project MOAT/Regaarder Compose/src/App.jsx';
let appCode = fs.readFileSync(appPath, 'utf-8');

// The remaining shareModalOpen is the sheets one. Let's find it.
const sheetsRegex = /(\{shareModalOpen && \(\s*<div className="fixed inset-0 z-\[520\][^]*?<h3[^>]*>Share from Compose<\/h3>.*?<\/div>\s*\)\s*\})/s;

// wait, the problem is [^]*? is too greedy or it goes all the way to the end?
// Let's use string indexOf to be safer.
const searchStr = '{shareModalOpen && (\n        <div className="fixed inset-0 z-[520]';
const startIdx = appCode.lastIndexOf(searchStr);

if (startIdx !== -1) {
  // We need to find the matching ')}' for this block.
  // Actually, we can just replace the whole block if we can isolate it.
  // Let's use a simple stack to find the matching closing parenthesis.
  let stack = [];
  let endIdx = -1;
  for (let i = startIdx + 19; i < appCode.length; i++) {
    if (appCode[i] === '(') stack.push('(');
    if (appCode[i] === ')') {
      stack.pop();
      if (stack.length === 0) {
        // the end of the block
        endIdx = appCode.indexOf('}', i);
        break;
      }
    }
  }

  if (endIdx !== -1) {
    const propString = `<ShareModal
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
      />`;

    const before = appCode.substring(0, startIdx);
    const after = appCode.substring(endIdx + 1);
    fs.writeFileSync(appPath, before + propString + after);
    console.log("Successfully replaced Sheets modal");
  } else {
    console.log("Could not find end of Sheets modal");
  }
} else {
  console.log("Could not find Sheets modal start");
}
