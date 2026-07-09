import fs from 'fs';
const content = fs.readFileSync('src/App.jsx', 'utf8');
const lines = content.split('\n');

for (let i = 570; i < lines.length; i++) {
  const line = lines[i];
  if (line.trim().startsWith('return (') && !lines[i-1].includes('=>') && !line.includes('=>')) {
    console.log(`Line ${i + 1}: ${line.trim()} (previous: ${lines[i-1].trim()})`);
  }
}
