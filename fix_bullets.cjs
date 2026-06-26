const fs = require('fs');
let app = fs.readFileSync('src/App.jsx', 'utf8');

const regex = /\} else if \(key === 'bullets'\) \{\s*applyFormatCommand\('insertUnorderedList'\);\s*\} else if \(key === 'icon'\) \{/;

const replacement = `} else if (key === 'bullets') {
      setListGalleryOpen('bullet');
      return;
    } else if (key === 'numbered') {
      setListGalleryOpen('numbered');
      return;
    } else if (key === 'icon') {`;

if (regex.test(app)) {
  app = app.replace(regex, replacement);
  fs.writeFileSync('src/App.jsx', app);
  console.log('Bullets logic fixed via regex.');
} else {
  console.log('Could not match bullets regex.');
}
