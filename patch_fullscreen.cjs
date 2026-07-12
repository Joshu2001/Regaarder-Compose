const fs = require('fs');
const file = 'C:/Users/user/.gemini/antigravity/worktrees/Project MOAT/swift-axis-dips-23h46/Regaarder Compose/src/App.jsx';
let content = fs.readFileSync(file, 'utf8');

const toggleFunc = `
  const toggleImmersiveFullscreen = () => {
    const nextExpanded = !isVideoExpanded;
    setIsVideoExpanded(nextExpanded);
    setIsDistractionFreeMode(nextExpanded);
    if (nextExpanded) {
      if (document.documentElement.requestFullscreen && !document.fullscreenElement) {
        document.documentElement.requestFullscreen().catch(()=>{});
      }
    } else {
      if (document.exitFullscreen && document.fullscreenElement) {
        document.exitFullscreen().catch(()=>{});
      }
    }
  };
`;

// Inject toggleFunc
if (!content.includes('const toggleImmersiveFullscreen')) {
  content = content.replace(
    /const \[isVideoExpanded, setIsVideoExpanded\] = useState\(false\);/,
    `const [isVideoExpanded, setIsVideoExpanded] = useState(false);\n${toggleFunc}`
  );
}

// Add onDoubleClick to main container
const containerRegex = /<div className=\{`w-full relative overflow-hidden bg-gray-900 shadow-\[0_32px_100px_rgba\(0,0,0,0\.12\)\] pointer-events-auto transition-all duration-500 border border-black\/10 shrink flex-1 \$\{isVideoExpanded \? '!absolute !inset-4 !max-w-none !max-h-none z-0 rounded-\[32px\]' : 'max-w-\[580px\] max-h-\[480px\] min-h-\[20vh\] aspect-\[4\/3\] z-10 rounded-\[24px\]'\}\`}>/g;

content = content.replace(
  containerRegex,
  `<div onDoubleClick={toggleImmersiveFullscreen} className={\`w-full relative overflow-hidden bg-gray-900 shadow-[0_32px_100px_rgba(0,0,0,0.12)] pointer-events-auto transition-all duration-500 border border-black/10 shrink flex-1 \${isVideoExpanded ? '!absolute !inset-0 !max-w-none !max-h-none z-0 rounded-none' : 'max-w-[580px] max-h-[480px] min-h-[20vh] aspect-[4/3] z-10 rounded-[24px]'}\`}>`
);

// Note: I also changed '!inset-4' and 'rounded-[32px]' to '!inset-0' and 'rounded-none' for true fullscreen to remove the white padding when immersive fullscreen is active.

// Update onClick of the Maximize button
const buttonRegex = /onClick=\{\(\) => setIsVideoExpanded\(!isVideoExpanded\)\}\s*className="absolute top-5 right-5/g;
content = content.replace(
  buttonRegex,
  `onClick={toggleImmersiveFullscreen}\n                    className="absolute top-5 right-5`
);

fs.writeFileSync(file, content);
console.log('Successfully patched fullscreen logic');
