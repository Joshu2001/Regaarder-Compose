const fs = require('fs');
const file = 'C:/Users/user/.gemini/antigravity/worktrees/Project MOAT/swift-axis-dips-23h46/Regaarder Compose/src/App.jsx';
let content = fs.readFileSync(file, 'utf8');

// 1. Fix 3-dot menu Present button
content = content.replace(
  /onClick=\{\(\) => \{ setShareModalOpen\(true\); setIsMoreMenuOpen\(false\); \}\}\s+className="w-full flex items-center gap-3 px-3 py-2 text-sm text-slate-600 hover:text-violet-600 hover:bg-violet-50 rounded-\[16px\] transition-colors"\s*>\s*<MonitorPlay size=\{16\} \/> Present\s*<\/button>/g,
  `onClick={() => { toggleScreenShare(); setIsMoreMenuOpen(false); }}\n                className="w-full flex items-center gap-3 px-3 py-2 text-sm text-slate-600 hover:text-violet-600 hover:bg-violet-50 rounded-[16px] transition-colors"\n              >\n                <MonitorPlay size={16} /> Present\n              </button>`
);

// 2. Fix Toolbar Present button
content = content.replace(
  /onClick=\{\(\) => handleMeetingShareOption\?\.\('document'\)\}\s+className="w-\[44px\] h-\[44px\] rounded-full text-violet-500 hover:bg-violet-50 flex items-center justify-center transition-all"\s+title="Share screen"\s*>\s*<MonitorPlay size=\{18\} strokeWidth=\{1\.5\} \/>\s*<\/button>/g,
  `onClick={toggleScreenShare}\n                          className="w-[44px] h-[44px] rounded-full text-violet-500 hover:bg-violet-50 flex items-center justify-center transition-all"\n                          title="Share screen"\n                        >\n                          <MonitorPlay size={18} strokeWidth={1.5} />\n                        </button>`
);

// 3. Fix useEffect for mainVideoRef to correctly clear screen share
const oldUseEffect = `  useEffect(() => {
    if (mainVideoRef.current && screenShareStream) {
      mainVideoRef.current.srcObject = screenShareStream;
    } else if (mainVideoRef.current && localStream) {
       // if we want to default main video to local stream for testing
       // mainVideoRef.current.srcObject = localStream;
    }
  }, [screenShareStream, localStream, roomState]);`;

const newUseEffect = `  useEffect(() => {
    if (mainVideoRef.current) {
      if (screenShareStream) {
        mainVideoRef.current.srcObject = screenShareStream;
      } else {
        mainVideoRef.current.srcObject = null;
      }
    }
  }, [screenShareStream, roomState]);`;

content = content.replace(oldUseEffect, newUseEffect);

// 4. Hide local video when camera is off
content = content.replace(
  /<video ref=\{localVideoRef\} autoPlay playsInline muted className="w-full h-full object-cover absolute inset-0" \/>/g,
  `<video ref={localVideoRef} autoPlay playsInline muted className={\`w-full h-full object-cover absolute inset-0 \${isRoomCameraOn ? '' : 'hidden'}\`} />`
);

// 5. Update toggleRoomCamera and toggleRoomMic to explicitly stop tracks when turning off
// Actually, disabling the track is correct WebRTC behavior for muting, because stopping it requires re-prompting for permissions when turning back on!
// So hiding the video tag with 'hidden' is the correct fix for the camera. For audio, track.enabled = false is exactly correct for mute.

fs.writeFileSync(file, content);
console.log('Successfully patched bugs');
