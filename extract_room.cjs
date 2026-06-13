const fs = require('fs');
const file = 'c:\\Users\\user\\Downloads\\Project MOAT\\Regaarder Compose\\src\\App.jsx';
let content = fs.readFileSync(file, 'utf8');
const lines = content.split('\n');

// The room stage starts exactly at line 27263 (index 27262) and ends at 27618 (index 27617)
const startIdx = 27262;
const endIdx = 27617; // This includes line 27618 which has "      )}"

const roomStageLines = lines.slice(startIdx, endIdx + 1);
const roomStageBlock = roomStageLines.join('\n');

// We replace the original block with a call to the helper function
lines.splice(startIdx, endIdx - startIdx + 1, '      {renderRoomStage()}');

// Now we need to insert the helper function before DeckOrSheetsView
// DeckOrSheetsView starts at `if (productMode === 'deck' || productMode === 'sheets') {`
const newContentStr = lines.join('\n');
const insertPoint = newContentStr.indexOf("if (productMode === 'deck' || productMode === 'sheets') {");

const helperFn = `  const renderRoomStage = () => {\n    return (\n${roomStageBlock}\n    );\n  };\n\n`;
let finalContent = newContentStr.slice(0, insertPoint) + helperFn + newContentStr.slice(insertPoint);

// Now insert `{renderRoomStage()}` right before the end of DeckOrSheetsView return statement.
// DeckOrSheetsView ends at `    );\n  }\n\n  return (`
// Let's find it.
const deckEndPoint = finalContent.indexOf("    );\n  }\n\n  return (");
if (deckEndPoint !== -1) {
  finalContent = finalContent.slice(0, deckEndPoint) + "      {renderRoomStage()}\n" + finalContent.slice(deckEndPoint);
} else {
  console.log("Could not find deckEndPoint");
}

fs.writeFileSync(file, finalContent, 'utf8');
console.log("Successfully injected renderRoomStage");
