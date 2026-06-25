const fs = require('fs');

const content = fs.readFileSync('src/App.jsx', 'utf8');
const lines = content.split(/\r?\n/);

const normalStartIdx = lines.findIndex(l => l.includes('// Trigger Vercel Build Safely'));
if (normalStartIdx === -1) {
    console.error('Could not find start of normal file');
    process.exit(1);
}

const popoverLines = lines.slice(0, normalStartIdx);
let restOfFile = lines.slice(normalStartIdx).join('\n');

const cleanPopover = popoverLines.join('\n').replace(/^\\?n`\n/, '');

// Find the last </div>\n  );\n}
const match = restOfFile.match(/<\/div>\s*\);\s*\}/);
if (!match) {
    console.error('Could not find end of App component');
    process.exit(1);
}

const insertIdx = restOfFile.lastIndexOf('</div>');
// actually let's just find the last `);` and insert before the </div> before it
const splitPos = restOfFile.lastIndexOf('</div>\n  );\n}');
let actualPos = splitPos;
if (splitPos === -1) {
    actualPos = restOfFile.lastIndexOf('</div>\r\n  );\r\n}');
}
if (actualPos === -1) {
    // just replace the first match from the end
    const matches = [...restOfFile.matchAll(/<\/div>\s*\);\s*\}/g)];
    const lastMatch = matches[matches.length - 1];
    if (lastMatch) {
        actualPos = lastMatch.index;
    }
}

if (actualPos === -1) {
    console.error('STILL could not find end');
    process.exit(1);
}

restOfFile = restOfFile.substring(0, actualPos) + '\n' + cleanPopover + '\n' + restOfFile.substring(actualPos);

const imports = `import React, { useCallback, useEffect, useMemo, useRef, useState } from 'react';\n`;

fs.writeFileSync('src/App.jsx', imports + restOfFile, 'utf8');
console.log('App.jsx repaired successfully again!');
