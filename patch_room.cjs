const fs = require('fs');
const file = 'C:/Users/user/.gemini/antigravity/worktrees/Project MOAT/swift-axis-dips-23h46/Regaarder Compose/src/App.jsx';
let content = fs.readFileSync(file, 'utf8');

// 1. Add Maximize import
if (!content.includes('Maximize,')) {
  content = content.replace(/Layers, Maximize,/, "Layers, Maximize,"); // Wait, Maximize is already imported at line 24!
  console.log("Maximize is already in imports.");
}

// 2. Add State and Refs
if (!content.includes('const [isRoomRecording, setIsRoomRecording]')) {
  const stateInjectionStr = `
  const [isRoomRecording, setIsRoomRecording] = useState(false);
  const roomMediaRecorderRef = useRef(null);
  const localVideoRef = useRef(null);
  const mainVideoRef = useRef(null);

  useEffect(() => {
    if (localVideoRef.current && localStream) {
      localVideoRef.current.srcObject = localStream;
    }
  }, [localStream, roomState]);

  useEffect(() => {
    if (mainVideoRef.current && screenShareStream) {
      mainVideoRef.current.srcObject = screenShareStream;
    } else if (mainVideoRef.current && localStream) {
       // if we want to default main video to local stream for testing
       // mainVideoRef.current.srcObject = localStream;
    }
  }, [screenShareStream, localStream, roomState]);

  const startRoomRecording = async () => {
    try {
      let captureStream = null;
      if (screenShareStream) {
        captureStream = screenShareStream;
      } else if (localStream) {
        captureStream = localStream;
      } else {
         const stream = await navigator.mediaDevices.getDisplayMedia({ video: true, audio: true });
         captureStream = stream;
      }
      
      if (!captureStream) return;
      
      const recorder = new MediaRecorder(captureStream);
      const chunks = [];
      recorder.ondataavailable = e => chunks.push(e.data);
      recorder.onstop = () => {
        const blob = new Blob(chunks, { type: 'video/webm' });
        const url = URL.createObjectURL(blob);
        const a = document.createElement('a');
        a.href = url;
        a.download = 'Room-Recording.webm';
        a.click();
        setIsRoomRecording(false);
      };
      recorder.start(1000);
      roomMediaRecorderRef.current = recorder;
      setIsRoomRecording(true);
      showToast('Recording started');
    } catch (e) {
      showToast('Recording failed: ' + e.message);
    }
  };

  const stopRoomRecording = () => {
    if (roomMediaRecorderRef.current && roomMediaRecorderRef.current.state === 'recording') {
      roomMediaRecorderRef.current.stop();
    }
  };
`;
  
  // Inject right after const [isRoomCaptionsEnabled...
  content = content.replace(/const \[isRoomCaptionsEnabled, setIsRoomCaptionsEnabled\] = useState\(false\);/, 
    `const [isRoomCaptionsEnabled, setIsRoomCaptionsEnabled] = useState(false);${stateInjectionStr}`);
}

// 3. Recording Modal logic
content = content.replace(
  /<button\s+onClick=\{onClose\}\s+className="px-5 py-2.5 rounded-xl bg-violet-600 text-white text-sm font-semibold hover:bg-violet-700 transition-colors shadow-sm"\s*>\s*Start Recording\s*<\/button>/g,
  `<button onClick={() => { onClose(); startRoomRecording(); }} className="px-5 py-2.5 rounded-xl bg-violet-600 text-white text-sm font-semibold hover:bg-violet-700 transition-colors shadow-sm">Start Recording</button>`
);

// 4. Recording Pill UI
content = content.replace(
  /<span className="w-1.5 h-1.5 rounded-full bg-\[#EA4335\] animate-pulse"><\/span>/g,
  `{isRoomRecording ? <span className="w-1.5 h-1.5 rounded-full bg-emerald-500 animate-pulse"></span> : <span className="w-1.5 h-1.5 rounded-full bg-slate-300"></span>}`
);
content = content.replace(
  /<div className="flex items-center gap-2 px-2.5 py-1 rounded-full border border-red-100\/50 bg-red-50\/10 shadow-sm">/g,
  `<div className={\`flex items-center gap-2 px-2.5 py-1 rounded-full border shadow-sm \${isRoomRecording ? 'border-emerald-100/50 bg-emerald-50/10' : 'border-slate-200 bg-white'}\`}>`
);

// 5. Expand -> Maximize icon
content = content.replace(
  /\{isVideoExpanded \? <Minimize2 size=\{16\} \/> : <Expand size=\{16\} \/>\}/g,
  `{isVideoExpanded ? <Minimize2 size={16} /> : <Maximize size={16} />}`
);

// 6. Main Video element replacing the img
const mainImgTagRegex = /<img\s+src=\{`\$\{activeVideoSpeaker\.img\}\?w=1200`\}\s+alt=\{activeVideoSpeaker\.name\}\s+className="w-full h-full object-cover object-center"\s+\/>/g;
const newMainVideo = `
  {screenShareStream ? (
    <video ref={mainVideoRef} autoPlay playsInline muted className="w-full h-full object-cover object-center" />
  ) : (
    <img src={\`\${activeVideoSpeaker.img}?w=1200\`} alt={activeVideoSpeaker.name} className="w-full h-full object-cover object-center" />
  )}
`;
content = content.replace(mainImgTagRegex, newMainVideo);

// 7. Local user thumbnail video
// We will replace the first thumbnail in the strip with the local video
const thumbnailStripRegex = /\{videoParticipants\.map\(\(p, i\) => \(/;
const localUserThumbnail = `
  <div className="relative flex-1 aspect-[4/3] max-w-[150px] rounded-[24px] overflow-hidden bg-slate-800 shadow-[0_16px_40px_rgba(0,0,0,0.08)] border border-white/10 group shrink-0 cursor-pointer hover:ring-2 ring-violet-400 ring-offset-2 ring-offset-[#F1F0EE] transition-all">
    <video ref={localVideoRef} autoPlay playsInline muted className="w-full h-full object-cover absolute inset-0" />
    <div className="absolute inset-x-0 bottom-0 h-[30%] bg-gradient-to-t from-black/60 to-transparent flex items-end p-3">
      <div className="flex items-center justify-between w-full relative z-10">
        <span className="text-white/95 text-[12px] font-medium truncate drop-shadow-sm">You</span>
        {!isRoomMicOn && <MicOff size={12} className="text-white/70 shrink-0 drop-shadow-sm" />}
      </div>
    </div>
  </div>
`;
content = content.replace(thumbnailStripRegex, `${localUserThumbnail}\n{videoParticipants.slice(1).map((p, i) => (`);

fs.writeFileSync(file, content);
console.log("Successfully patched App.jsx");
