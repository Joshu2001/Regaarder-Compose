const fs = require('fs');
const path = require('path');

const file = path.join(__dirname, 'src', 'App.jsx');
let content = fs.readFileSync(file, 'utf8');

// 1. Inject states
const stateInjectionPoint = "const [mainView, setMainView] = useState('document');";
if (!content.includes('const [screenShareStream, setScreenShareStream] = useState(null);')) {
  content = content.replace(stateInjectionPoint, `${stateInjectionPoint}\n  const [screenShareStream, setScreenShareStream] = useState(null);\n  const [isRoomRecording, setIsRoomRecording] = useState(false);\n  const [mainRoomFocus, setMainRoomFocus] = useState('host');\n  const roomMediaRecorderRef = useRef(null);`);
}

// 2. Inject startScreenShare and toggleRoomRecording before handleMeetingShareOption
const shareFuncPoint = "const handleMeetingShareOption = (option) => {";
const newFunctions = `  const startScreenShare = async () => {
    try {
      const stream = await navigator.mediaDevices.getDisplayMedia({ video: true, audio: true });
      setScreenShareStream(stream);
      setMainRoomFocus('screenShare');
      stream.getVideoTracks()[0].onended = () => {
        setScreenShareStream(null);
        setMainRoomFocus((prev) => prev === 'screenShare' ? 'host' : prev);
      };
    } catch (err) {
      console.error('Error sharing screen:', err);
    }
  };

  const toggleRoomRecording = async () => {
    if (isRoomRecording) {
      setIsRoomRecording(false);
      if (roomMediaRecorderRef.current && roomMediaRecorderRef.current.state === 'recording') {
        roomMediaRecorderRef.current.stop();
      }
    } else {
      try {
        let streamToRecord = screenShareStream;
        if (!streamToRecord && localStream) {
           streamToRecord = localStream;
        }
        if (streamToRecord) {
           const mediaRecorder = new MediaRecorder(streamToRecord);
           roomMediaRecorderRef.current = mediaRecorder;
           mediaRecorder.start();
        }
        setIsRoomRecording(true);
      } catch (err) {
        console.error('Failed to start recording:', err);
      }
    }
  };

  `;

if (!content.includes('const startScreenShare = async () => {')) {
  content = content.replace(shareFuncPoint, newFunctions + shareFuncPoint);
}

// 3. Update the Present button in renderRoomBottomBar
const oldPresentBtn = `<button onClick={() => handleMeetingShareOption('document')} className="flex items-center gap-2 px-4 h-[48px] rounded-[999px] bg-gray-100 text-gray-700 text-sm font-semibold hover:bg-gray-200 transition-colors">
          <ArrowUp size={18} /> Present <ChevronUp size={14} className="ml-1 opacity-50" />
        </button>`;
const newPresentBtn = `<button onClick={startScreenShare} className="flex items-center gap-2 px-4 h-[48px] rounded-[999px] bg-gray-100 text-gray-700 text-sm font-semibold hover:bg-gray-200 transition-colors">
          <ArrowUp size={18} /> Present <ChevronUp size={14} className="ml-1 opacity-50" />
        </button>`;
content = content.replace(oldPresentBtn, newPresentBtn);

// 4. Update the Record button in renderRoomBottomBar
const oldRecordBtn = `<button className="flex items-center gap-2 px-4 h-[48px] rounded-[999px] border border-gray-200 text-gray-700 text-sm font-semibold hover:bg-gray-50 transition-colors">
          <div className="w-2 h-2 rounded-full border-2 border-gray-500"></div> Record
        </button>`;
const newRecordBtn = `<button onClick={toggleRoomRecording} className="flex items-center gap-2 px-4 h-[48px] rounded-[999px] border border-gray-200 text-gray-700 text-sm font-semibold hover:bg-gray-50 transition-colors">
          <div className={\`w-2 h-2 rounded-full border-2 \${isRoomRecording ? 'bg-red-500 border-red-500 animate-pulse' : 'border-gray-500'}\`}></div> Record
        </button>`;
content = content.replace(oldRecordBtn, newRecordBtn);


// 5. Safely replace renderRoomLeftSidebar
const startToken = "const renderRoomLeftSidebar = () => (";
const endToken = "  const renderRoomRightSidebar = () => (";

const startIndex = content.indexOf(startToken);
const endIndex = content.indexOf(endToken);

if (startIndex !== -1 && endIndex !== -1) {
  // We need to keep endToken since it's the start of the next function
  
  const newRenderRoomLeftSidebar = `const renderRoomLeftSidebar = () => {
    // Determine main feed and sidebar feeds based on mainRoomFocus
    const feeds = [];
    
    // 1. Screen Share
    if (screenShareStream) {
      feeds.push({ id: 'screenShare', label: 'Screen Share', isLocal: false, stream: screenShareStream, isScreen: true });
    }
    
    // 2. Host (Local)
    feeds.push({ id: 'host', label: 'You (Host)', isLocal: true, stream: localStream, img: meetingParticipants[0]?.img || "https://images.unsplash.com/photo-1534528741775-53994a69daeb" });
    
    // 3. Participants
    meetingParticipants.slice(1, 4).forEach((p, idx) => {
      feeds.push({ id: \`participant-\${idx}\`, label: p.name, isLocal: false, img: p.img });
    });

    const mainFeed = feeds.find(f => f.id === mainRoomFocus) || feeds[0];
    const sidebarFeeds = feeds.filter(f => f.id !== mainFeed.id);

    return (
      <div className="flex-1 flex flex-col p-4 gap-3 overflow-y-auto thin-scrollbar">
        {/* Main Focus */}
        <div 
          className="relative rounded-[24px] overflow-hidden bg-gray-100 min-h-[300px] border-2 border-violet-500 shadow-[0_8px_30px_rgba(124,58,237,0.15)] flex-shrink-0 cursor-pointer"
          onClick={() => setMainRoomFocus(mainFeed.id)}
        >
          {mainFeed.stream && (mainFeed.isScreen || (mainFeed.isLocal && isRoomCameraOn)) ? (
             mainFeed.isScreen ? (
               <video 
                 ref={(v) => { if(v && mainFeed.stream) v.srcObject = mainFeed.stream }} 
                 autoPlay playsInline muted 
                 className="w-full h-full object-contain bg-black" 
               />
             ) : (
               <LocalVideoFeed stream={mainFeed.stream} isCameraOn={isRoomCameraOn} />
             )
          ) : (
            <img src={mainFeed.img} className="w-full h-full object-cover" alt={mainFeed.label} />
          )}
          
          <div className="absolute top-2 left-2 bg-violet-600 text-white text-[10px] font-bold px-2 py-0.5 rounded-full shadow-md">{mainFeed.label} (Main)</div>
          
          <div className="absolute bottom-0 left-0 right-0 bg-white/95 backdrop-blur px-3 py-2 flex items-center justify-between border-t border-gray-200/50">
            <div>
              <div className="text-xs font-bold text-gray-900">{mainFeed.label}</div>
              <div className="text-[10px] font-semibold text-violet-600">Active</div>
            </div>
            <div className="w-4 h-4 text-violet-600">{mainFeed.isLocal ? <Mic size={14} /> : <MicOff size={14} />}</div>
          </div>
        </div>
        
        {/* Grid for Sidebar Feeds */}
        <div className="grid grid-cols-2 gap-3">
          {sidebarFeeds.map((feed) => (
            <div 
              key={feed.id} 
              className="relative rounded-[16px] overflow-hidden bg-gray-100 h-[100px] border border-[rgba(124,58,237,0.08)] shadow-[0_4px_15px_rgba(0,0,0,0.05)] cursor-pointer hover:ring-2 hover:ring-violet-300 transition-all"
              onClick={() => setMainRoomFocus(feed.id)}
            >
              {feed.stream && (feed.isScreen || (feed.isLocal && isRoomCameraOn)) ? (
                feed.isScreen ? (
                  <video 
                    ref={(v) => { if(v && feed.stream) v.srcObject = feed.stream }} 
                    autoPlay playsInline muted 
                    className="w-full h-full object-cover bg-black" 
                  />
                ) : (
                  <LocalVideoFeed stream={feed.stream} isCameraOn={isRoomCameraOn} />
                )
              ) : (
                <img src={feed.img} className="w-full h-full object-cover" alt={feed.label} />
              )}
              <div className="absolute bottom-1 left-1 bg-black/60 text-white text-[9px] font-medium px-1.5 py-0.5 rounded backdrop-blur-sm truncate max-w-[80%]">{feed.label}</div>
            </div>
          ))}
        </div>
        
        {/* More Participants */}
        <div className="rounded-xl bg-violet-50 border border-violet-100 p-3 flex items-center justify-between cursor-pointer hover:bg-violet-100 transition-colors mt-auto">
          <div>
            <div className="flex -space-x-2 mb-1">
              <div className="w-6 h-6 rounded-full bg-violet-200 border-2 border-white flex items-center justify-center text-[9px] font-bold text-violet-700">+1</div>
            </div>
            <div className="text-[11px] font-semibold text-violet-900">1 more participant</div>
          </div>
          <ChevronRight size={14} className="text-violet-400" />
        </div>
      </div>
    );
  };

`;
  
  content = content.substring(0, startIndex) + newRenderRoomLeftSidebar + content.substring(endIndex);
  fs.writeFileSync(file, content, 'utf8');
  console.log('Successfully applied Room UI fixes with robust slicing');
} else {
  console.error('Failed to find startToken or endToken for renderRoomLeftSidebar');
}
