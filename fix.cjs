const fs = require('fs');
let code = fs.readFileSync('src/App.jsx', 'utf8');

code = code.replace(/\{chartType === 'pie' \|\| chartType === 'donut'/g, '{overlay.chartType === \\'pie\\' || overlay.chartType === \\'donut\\'');
code = code.replace(/chartType === 'pie' \|\| chartType === 'donut' \? '82%' :/g, 'overlay.chartType === \\'pie\\' || overlay.chartType === \\'donut\\' ? \\'82%\\' :');
code = code.replace(/if \(chartType === 'pie' \|\| chartType === 'donut'\) {/g, 'if (overlay.chartType === \\'pie\\' || overlay.chartType === \\'donut\\') {');

fs.writeFileSync('src/App.jsx', code);
console.log('done');
