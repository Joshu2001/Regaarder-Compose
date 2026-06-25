const fs = require('fs');
const path = require('path');

const appPath = path.join(__dirname, 'src', 'App.jsx');

// Read as buffer to check BOM
const buffer = fs.readFileSync(appPath);
let content = '';
if (buffer[0] === 0xFF && buffer[1] === 0xFE) {
  console.log('UTF-16 LE BOM detected. Converting to UTF-8.');
  content = buffer.toString('utf16le');
} else if (buffer[0] === 0xFE && buffer[1] === 0xFF) {
  content = buffer.toString('utf16be');
} else {
  // Wait, if it was corrupted by my previous script, it might be mixed.
  // Let's restore from git first.
  console.log('Reading as utf8');
  content = buffer.toString('utf8');
}

// Just in case it's double-encoded or has null bytes, strip null bytes if it's supposed to be UTF8
if (content.includes('\x00')) {
  console.log('Stripping null bytes (was probably utf16 read as utf8)');
  content = content.replace(/\x00/g, '');
}

// Fix the \n` if it exists at the top
if (content.startsWith('\\n`\n') || content.startsWith('\n`\n')) {
    content = content.replace(/^\\?n`\n/, '');
}

fs.writeFileSync(appPath, content, 'utf8');
console.log('Converted App.jsx to UTF-8.');
