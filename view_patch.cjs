const { execSync } = require('child_process');
const output = execSync('git show 7d564c3 -- src/App.jsx').toString().split('\n');
for (let i = 0; i < 40; i++) {
  console.log(output[i]);
}
