const fs = require('fs');
let app = fs.readFileSync('src/App.jsx', 'utf8');

// Update ListGalleryPicker style
app = app.replace(
  /style=\{\{\s*top:\s*rect\.bottom \+ 8,\s*left:\s*rect\.left,\s*width:\s*'520px',\s*minHeight:\s*'340px'\s*\}\}/,
  "style={{ top: rect.bottom + 8, left: Math.max(8, Math.min(rect.left, window.innerWidth - 880)), width: '520px', minHeight: '340px' }}"
);

// Update EmojiGalleryPicker style
app = app.replace(
  /style=\{\{\s*top:\s*rect\.bottom \+ 8,\s*left:\s*rect\.left,\s*width:\s*'420px',\s*height:\s*'360px'\s*\}\}/,
  "style={{ top: rect.bottom + 8, left: Math.max(8, Math.min(rect.left, window.innerWidth - 780)), width: '420px', height: '360px' }}"
);

// Update SymbolGalleryPicker style
app = app.replace(
  /style=\{\{\s*top:\s*rect\.bottom \+ 8,\s*left:\s*rect\.left,\s*width:\s*'380px',\s*height:\s*'300px'\s*\}\}/,
  "style={{ top: rect.bottom + 8, left: Math.max(8, Math.min(rect.left, window.innerWidth - 740)), width: '380px', height: '300px' }}"
);

// Update EquationGalleryPicker style
app = app.replace(
  /style=\{\{\s*top:\s*rect\.bottom \+ 8,\s*left:\s*rect\.left\s*\}\}/,
  "style={{ top: rect.bottom + 8, left: Math.max(8, Math.min(rect.left, window.innerWidth - 680)) }}"
);

fs.writeFileSync('src/App.jsx', app);
console.log('Pickers layout fix applied');
