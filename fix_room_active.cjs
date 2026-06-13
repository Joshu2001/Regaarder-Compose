const fs = require('fs');
let code = fs.readFileSync('src/App.jsx', 'utf8');

const startStr = "  if (productMode === 'room') {\n    if (roomState === 'active') {";
const endStr = "          )}\n        </div>\n      );\n    }\n\n    return (";

const startIndex = code.indexOf(startStr);
const endIndex = code.indexOf(endStr);

if (startIndex !== -1 && endIndex !== -1) {
  const replacement = "  if (productMode === 'room' && roomState !== 'active') {\n    return (";
  const newCode = code.substring(0, startIndex) + replacement + code.substring(endIndex + endStr.length);
  fs.writeFileSync('src/App.jsx', newCode);
  console.log('Successfully removed early active room return in App.jsx');
} else {
  console.log('Could not find start or end strings.');
  console.log('startIndex:', startIndex);
  console.log('endIndex:', endIndex);
}
