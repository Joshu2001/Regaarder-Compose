const fs = require('fs');
const file = 'c:\\Users\\user\\Downloads\\Project MOAT\\Regaarder Compose\\src\\App.jsx';
let content = fs.readFileSync(file, 'utf8');

const targetStr = "      </div>\n    );\n  }\n\n  return (";
const targetStrCRLF = "      </div>\r\n    );\r\n  }\r\n\r\n  return (";

if (content.includes(targetStr)) {
  content = content.replace(targetStr, "      {renderRoomStage()}\n" + targetStr);
} else if (content.includes(targetStrCRLF)) {
  content = content.replace(targetStrCRLF, "      {renderRoomStage()}\r\n" + targetStrCRLF);
} else {
  console.log("Not found target string");
}

fs.writeFileSync(file, content, 'utf8');
console.log("Injected");
