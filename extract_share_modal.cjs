const fs = require('fs');

const appPath = 'c:/Users/user/Downloads/Project MOAT/Regaarder Compose/src/App.jsx';
let appCode = fs.readFileSync(appPath, 'utf-8');

// Find the Compose share modal block (the one with Zero-Knowledge)
const composeRegex = /(\{shareModalOpen && \(\s*<div className="fixed inset-0 z-\[520\][^]*?<h3[^>]*>Share from Compose<\/h3>[^]*?Zero-Knowledge[^]*?<\/div>\s*\)\s*\})/;
const composeMatch = appCode.match(composeRegex);

if (!composeMatch) {
  console.log("Could not find Compose ShareModal");
  process.exit(1);
}

const composeModalStr = composeMatch[1];

// Find the other share modal block
const sheetsRegex = /(\{shareModalOpen && \(\s*<div className="fixed inset-0 z-\[520\][^]*?<h3[^>]*>Share from Compose<\/h3>(?![^]*?Zero-Knowledge)[^]*?<\/div>\s*\)\s*\})/;
const sheetsMatch = appCode.match(sheetsRegex);

if (!sheetsMatch) {
  console.log("Could not find Sheets ShareModal");
}

let shareModalComponent = `import React from 'react';
import { X, Check, EyeOff, Eye } from 'lucide-react';

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
  zeroKnowledgeRedactions,
  removeProtection,
  newRedactionKeyword,
  setNewRedactionKeyword,
  protectKeywordInEditor,
  setZeroKnowledgePreviewOpen
}) {
  if (!isOpen) return null;

  return (
${composeModalStr.replace(/^\{shareModalOpen && \(\s*/, '').replace(/\s*\)\s*\}$/, '')}
  );
}
`;

// Replace props in the JSX
shareModalComponent = shareModalComponent.replace(/setShareModalOpen\(false\)/g, 'onClose()');

fs.writeFileSync('c:/Users/user/Downloads/Project MOAT/Regaarder Compose/src/ShareModal.jsx', shareModalComponent);

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

appCode = appCode.replace(composeRegex, propString);
if (sheetsMatch) {
  appCode = appCode.replace(sheetsRegex, propString);
}

// Add import to App.jsx if not present
if (!appCode.includes("import ShareModal from './ShareModal'")) {
  appCode = appCode.replace(/(import React[^;]*;)/, "$1\nimport ShareModal from './ShareModal';");
}

fs.writeFileSync(appPath, appCode);
console.log("Done refactoring ShareModal");
