const fs = require('fs');
const appPath = 'c:/Users/user/Downloads/Project MOAT/Regaarder Compose/src/App.jsx';
const appLines = fs.readFileSync(appPath, 'utf-8').split('\n');

const composeModalContent = appLines.slice(27684, 28025).join('\n');
// Line 27684 is `<div className="fixed inset-0 z-[520] bg-slate-900/30 backdrop-blur-sm flex items-center justify-center p-4">`
// Wait, 27684 is `{shareModalOpen && (`. 27685 is the <div>.
// So 27685 to 28024 inclusive (which is slice(27685-1, 28024)). Let's just use exact lines.

let shareModalComponent = `import React from 'react';
import { X, EyeOff, Eye } from 'lucide-react';

export default function ShareModal({
  isOpen,
  onClose,
  shareTargetDocTitle,
  shareDestination,
  setShareDestination,
  shareAccess,
  setShareAccess,
  shareFormat,
  setShareFormat,
  shareLink,
  handleShareModalConfirm,
  zeroKnowledgeRedactions = [],
  removeProtection,
  newRedactionKeyword,
  setNewRedactionKeyword,
  protectKeywordInEditor,
  setZeroKnowledgePreviewOpen
}) {
  if (!isOpen) return null;

  return (
${appLines.slice(27684, 28025).join('\n').replace(/setShareModalOpen\(false\)/g, 'onClose()')}
  );
}
`;

fs.writeFileSync('c:/Users/user/Downloads/Project MOAT/Regaarder Compose/src/ShareModal.jsx', shareModalComponent);

const propString = `{shareModalOpen && (
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
  />
)}`;

// We need to replace lines 27683 to 28025 (27684 to 28026 1-indexed) with the prop string
// and replace lines 25229 to 25320 (25230 to 25321 1-indexed) with empty string.

// First, build the new array. We process backwards so line numbers don't shift.
let newAppLines = [...appLines];
newAppLines.splice(27683, 28026 - 27684 + 1, propString);
newAppLines.splice(25229, 25321 - 25230 + 1, '');

// Add import
const importString = "import ShareModal from './ShareModal';";
let hasImport = false;
for (let i = 0; i < 50; i++) {
  if (newAppLines[i].includes('ShareModal')) hasImport = true;
}
if (!hasImport) {
  newAppLines.splice(2, 0, importString);
}

fs.writeFileSync(appPath, newAppLines.join('\n'));
console.log("Refactoring complete");
