const fs = require('fs');
const file = 'C:/Users/user/.gemini/antigravity/worktrees/Project MOAT/swift-axis-dips-23h46/Regaarder Compose/src/App.jsx';
let content = fs.readFileSync(file, 'utf8');

const injectedBlockRegex = /\s*const \[isRoomRecording, setIsRoomRecording\] = useState\(false\);[\s\S]*?const stopRoomRecording = \(\) => \{\s*if \(roomMediaRecorderRef\.current && roomMediaRecorderRef\.current\.state === 'recording'\) \{\s*roomMediaRecorderRef\.current\.stop\(\);\s*\}\s*\};\n/m;

const match = content.match(injectedBlockRegex);
if (match) {
  const block = match[0];
  content = content.replace(block, ''); // remove it from the top
  
  // Find where screenShareStream is defined
  const injectionPoint = 'const [screenShareStream, setScreenShareStream] = useState(null);';
  
  content = content.replace(injectionPoint, `${injectionPoint}\n${block}\n`);
  fs.writeFileSync(file, content);
  console.log('Successfully moved the block to avoid ReferenceError');
} else {
  console.log('Could not find the injected block.');
}
