const fs = require('fs');
const path = require('path');

const filePath = path.join(__dirname, '../src/App.jsx');
let content = fs.readFileSync(filePath, 'utf8');

// 1. Add preventImmersiveExitRef
const refTarget = "  const isFilePickerActiveRef = useRef(false);";
const refReplacement = "  const isFilePickerActiveRef = useRef(false);\n  const preventImmersiveExitRef = useRef(false);";
content = content.replace(refTarget, refReplacement);

// 2. Modify handleFullscreenChange
const changeTarget = `      if (!document.fullscreenElement && isDocumentImmersive) {
        setIsDocumentImmersive(false);`;
const changeReplacement = `      if (!document.fullscreenElement && isDocumentImmersive) {
        if (preventImmersiveExitRef.current) {
          preventImmersiveExitRef.current = false;
          return;
        }
        setIsDocumentImmersive(false);`;
content = content.replace(changeTarget, changeReplacement);

// 3. Update the exitFullscreen calls in the toggle buttons
// Since there are two buttons that have this exact onClick, we can replace all occurrences of it
const btnTarget = `if (document.exitFullscreen) { document.exitFullscreen(); }`;
const btnReplacement = `if (document.exitFullscreen) { preventImmersiveExitRef.current = true; document.exitFullscreen(); }`;
content = content.split(btnTarget).join(btnReplacement);

fs.writeFileSync(filePath, content);
console.log("Successfully applied fix to App.jsx");
