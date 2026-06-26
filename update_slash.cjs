const fs = require('fs');
let app = fs.readFileSync('src/App.jsx', 'utf8');

const targetStr = `const SLASH_OPTIONS = [
  { key: 'table', label: 'Table', desc: 'Insert an AI table' },
  { key: 'bullets', label: 'Bullet points', desc: 'Insert bullet list' },
  { key: 'graph', label: 'Chart / Graph', desc: 'Insert an interactive SVG chart & grid' },
  { key: 'media', label: 'Media', desc: 'Insert media, files, or AI generation' },
  { key: 'proofread', label: 'Proofread', desc: 'Improve spelling & style' },
  { key: 'translate', label: 'Translate', desc: 'Translate text' },
  { key: 'schedule', label: 'Schedule', desc: 'Create timeline or checklist' },
  { key: 'hyperlink', label: 'Hyperlink', desc: 'Add a link to selected text' },
  { key: 'bookmark', label: 'Bookmark', desc: 'Add a bookmark/anchor' },
  { key: 'shapes', label: 'Shapes', desc: 'Insert interactive shapes' },
  { key: 'icon', label: 'Icon', desc: 'Insert an emoji or icon' },
  { key: 'watermark', label: 'Watermark', desc: 'Add text or image watermark' },
  { key: 'comment', label: 'Comment', desc: 'Insert inline comment box' },
  { key: 'redact', label: 'Redact / Protect', desc: 'Redact selection or current block' }
];`;

const replacementStr = `const SLASH_OPTIONS = [
  { key: 'table', label: 'Table', desc: 'Insert an AI table' },
  { key: 'bullets', label: 'Bullet points', desc: 'Insert bullet list' },
  { key: 'graph', label: 'Chart / Graph', desc: 'Insert an interactive SVG chart & grid' },
  { key: 'media', label: 'Media', desc: 'Insert media, files, or AI generation' },
  { key: 'proofread', label: 'Proofread', desc: 'Improve spelling & style' },
  { key: 'translate', label: 'Translate', desc: 'Translate text' },
  { key: 'schedule', label: 'Schedule', desc: 'Create timeline or checklist' },
  { key: 'hyperlink', label: 'Hyperlink', desc: 'Add a link to selected text' },
  { key: 'bookmark', label: 'Bookmark', desc: 'Add a bookmark/anchor' },
  { key: 'shapes', label: 'Shapes', desc: 'Insert interactive shapes' },
  { key: 'icon', label: 'Icon', desc: 'Insert an emoji or icon' },
  { key: 'watermark', label: 'Watermark', desc: 'Add text or image watermark' },
  { key: 'comment', label: 'Comment', desc: 'Insert inline comment box' },
  { key: 'redact', label: 'Redact / Protect', desc: 'Redact selection or current block' },
  { key: 'emoji', label: 'Emoji', desc: 'Browse and insert emoji' },
  { key: 'symbols', label: 'Symbols', desc: 'Insert special characters & symbols' },
  { key: 'equations', label: 'Equation', desc: 'Insert a math equation' },
  { key: 'insert_table', label: 'Table (manual)', desc: 'Pick table size and insert' },
  { key: 'divider', label: 'Divider', desc: 'Insert a horizontal rule' },
  { key: 'callout', label: 'Callout', desc: 'Insert a styled quote block' },
  { key: 'code_block', label: 'Code Block', desc: 'Insert a code container' }
];`;

if (app.includes(targetStr)) {
  app = app.replace(targetStr, replacementStr);
  fs.writeFileSync('src/App.jsx', app);
  console.log('SLASH_OPTIONS updated successfully.');
} else {
  // Let's try with \r\n instead of \n
  const targetStrCRLF = targetStr.replace(/\n/g, '\r\n');
  const replacementStrCRLF = replacementStr.replace(/\n/g, '\r\n');
  if (app.includes(targetStrCRLF)) {
    app = app.replace(targetStrCRLF, replacementStrCRLF);
    fs.writeFileSync('src/App.jsx', app);
    console.log('SLASH_OPTIONS updated successfully (CRLF).');
  } else {
    console.error('Could not find SLASH_OPTIONS to replace.');
  }
}
