const fs = require('fs');
const path = require('path');

const file = path.join(__dirname, 'src', 'App.jsx');
let content = fs.readFileSync(file, 'utf8');

// 1. Strip all existing 'const renderRoomStage = () => {' blocks
while (content.includes('const renderRoomStage = () => {')) {
  const badStart = content.indexOf('  const renderRoomStage = () => {');
  if (badStart !== -1) {
    // Find the end of the function (since we know the structure ends with };)
    const badEnd = content.indexOf('  };\n', badStart);
    if (badEnd !== -1) {
      content = content.slice(0, badStart) + content.slice(badEnd + 5);
    } else {
      break;
    }
  } else {
    break; // in case of different indentation
  }
}

// 2. Prepare the modern room code again
const modernRoom = `  const renderRoomStage = () => {
    return roomState === 'active' && roomPanelMode === 'expanded' && mainView === 'room' && (
      <div className="fixed inset-0 z-[5000] bg-[#1a1b1e] flex flex-col font-sans">
        
        {/* Top Header */}
        <div className="h-16 px-6 flex items-center justify-between text-white shrink-0">
          <div className="flex items-center gap-3">
            <div className="text-sm font-semibold">{scheduleForm.title || 'Project MOAT Sync'}</div>
            <div className="px-2 py-0.5 rounded-full bg-emerald-500/20 text-emerald-400 border border-emerald-500/30 text-[11px] font-medium tracking-wide">
              LIVE {meetingDurationLabel}
            </div>
          </div>
          <div className="flex items-center gap-4">
            <div className="flex -space-x-2">
              {[1, 2, 3].map((i) => (
                <div key={i} className="w-8 h-8 rounded-full border-2 border-[#1a1b1e] bg-slate-700 flex items-center justify-center text-xs font-medium text-slate-300">
                  {String.fromCharCode(64 + i)}
                </div>
              ))}
            </div>
            <button onClick={() => { setMainView('document'); setRoomPanelMode('expanded'); }} className="px-3 py-1.5 rounded-lg text-xs font-medium bg-white/10 hover:bg-white/20 transition-colors text-white border border-white/10">
              Back to Document
            </button>
          </div>
        </div>

        {/* Main Content Area */}
        <div className="flex-1 min-h-0 p-4 pb-0 flex gap-4">
          {screenShareStream || activeSharedMeetingFile ? (
            <>
              {/* Screen Share / File View */}
              <div 
                className="flex-[3] relative rounded-2xl overflow-hidden shadow-2xl flex flex-col border border-white/10 cursor-pointer group"
                onClick={() => setMainRoomFocus(mainRoomFocus === 'screenShare' ? 'host' : 'screenShare')}
              >
                {screenShareStream ? (
                  <video 
                    ref={(v) => { if(v && screenShareStream) v.srcObject = screenShareStream }} 
                    autoPlay playsInline muted={false} 
                    className="w-full h-full object-contain bg-black" 
                  />
                ) : (
                  <div className="flex-1 bg-[#f8fafc] flex flex-col">
                    <div className="px-4 py-3 border-b border-gray-100 flex items-center justify-between bg-white shrink-0">
                      <div className="flex items-center gap-2 text-sm font-semibold text-gray-900">
                        <Presentation size={16} className="text-violet-600" />
                        {activeSharedMeetingFile.name}
                      </div>
                      <div className="text-xs text-gray-500">Shared by {activeSharedMeetingFile.sharedBy}</div>
                    </div>
                    <div className="flex-1 overflow-y-auto thin-scrollbar p-8">
                      <div className="max-w-2xl mx-auto bg-white border border-gray-200 shadow-sm rounded-xl p-8 min-h-[500px]">
                        <h1 className="text-2xl font-bold text-gray-900 mb-6">{activeSharedMeetingFile.baseName || 'Strategic Disruption'}</h1>
                        <p className="text-gray-600 leading-relaxed mb-6">
                          Incumbents win by bundling and distribution leverage.
                        </p>
                        <div className="h-64 bg-violet-50 rounded-lg border border-violet-100 flex items-center justify-center">
                          <Presentation size={48} className="text-violet-200" />
                        </div>
                      </div>
                    </div>
                  </div>
                )}
                {mainRoomFocus === 'screenShare' && (
                  <div className="absolute top-4 left-4 bg-violet-600 text-white text-xs font-bold px-3 py-1 rounded-full shadow-lg">Main View</div>
                )}
              </div>
              
              {/* Sidebar Participants */}
              <div className="flex-1 flex flex-col gap-3 min-w-[280px] max-w-[320px]">
                <div 
                  className={\`h-1/3 rounded-2xl bg-[#282a2f] overflow-hidden relative border \${mainRoomFocus === 'host' ? 'border-violet-500 ring-2 ring-violet-500' : 'border-white/10'} cursor-pointer transition-all\`}
                  onClick={() => setMainRoomFocus('host')}
                >
                  <LocalVideoFeed stream={localStream} isCameraOn={isRoomCameraOn} />
                  <div className="absolute bottom-3 left-3 text-xs font-medium text-white px-2 py-1 bg-black/50 rounded-md backdrop-blur-md">
                    You {mainRoomFocus === 'host' ? '(Main)' : ''}
                  </div>
                </div>
                <div 
                  className={\`flex-1 rounded-2xl bg-[#282a2f] overflow-hidden relative border \${mainRoomFocus === 'participant-1' ? 'border-violet-500 ring-2 ring-violet-500' : 'border-white/10'} flex items-center justify-center cursor-pointer transition-all\`}
                  onClick={() => setMainRoomFocus('participant-1')}
                >
                  <div className="w-20 h-20 rounded-full bg-indigo-500 flex items-center justify-center text-white text-2xl font-bold shadow-lg">
                    M
                  </div>
                  <div className="absolute bottom-3 left-3 text-xs font-medium text-white px-2 py-1 bg-black/50 rounded-md backdrop-blur-md">
                    Michelle Tran {mainRoomFocus === 'participant-1' ? '(Main)' : ''}
                  </div>
                </div>
              </div>
            </>
          ) : (
            <div className="flex-1 rounded-3xl bg-[#222428] border border-white/5 relative overflow-hidden flex items-center justify-center">
              {meetingParticipants.length > 0 ? (
                <div className="grid grid-cols-2 gap-4 w-full h-full p-4">
                  <div 
                    className={\`rounded-2xl overflow-hidden relative bg-[#2a2c32] cursor-pointer \${mainRoomFocus === 'host' ? 'ring-2 ring-violet-500' : ''}\`}
                    onClick={() => setMainRoomFocus('host')}
                  >
                    <LocalVideoFeed stream={localStream} isCameraOn={isRoomCameraOn} />
                    <div className="absolute bottom-4 left-4 text-sm font-medium text-white px-2.5 py-1 bg-black/40 rounded-lg backdrop-blur-sm">You</div>
                  </div>
                  {meetingParticipants.slice(1).map((participant, i) => (
                    <div 
                      key={i} 
                      className={\`rounded-2xl overflow-hidden relative bg-[#2a2c32] cursor-pointer \${mainRoomFocus === \`participant-\${i}\` ? 'ring-2 ring-violet-500' : ''}\`}
                      onClick={() => setMainRoomFocus(\`participant-\${i}\`)}
                    >
                      <div className="absolute inset-0 flex items-center justify-center">
                        <div className="w-24 h-24 rounded-full bg-emerald-500 flex items-center justify-center text-white text-3xl font-bold overflow-hidden"><img src={participant.img} className="w-full h-full object-cover" alt="" /></div>
                      </div>
                      <div className="absolute bottom-4 left-4 text-sm font-medium text-white px-2.5 py-1 bg-black/40 rounded-lg backdrop-blur-sm">{participant.name}</div>
                    </div>
                  ))}
                </div>
              ) : (
                <div className="w-full h-full relative group">
                  <LocalVideoFeed stream={localStream} isCameraOn={isRoomCameraOn} />
                  <div className="absolute bottom-6 left-6 text-sm font-medium text-white px-3 py-1.5 bg-black/40 rounded-lg backdrop-blur-md">
                    You
                  </div>
                </div>
              )}
            </div>
          )}
        </div>

        {/* Bottom Control Bar */}
        <div className="h-24 px-8 flex items-center justify-between shrink-0">
          <div className="text-sm font-medium text-white/90">
            {meetingDurationLabel} | {roomId || 'Meeting'}
          </div>
          
          <div className="flex items-center gap-3">
            <button 
              onClick={toggleRoomMic}
              className={\`w-12 h-12 rounded-full flex items-center justify-center transition-all \${isRoomMicOn ? 'bg-[#3c4043] hover:bg-[#4d5156] text-white' : 'bg-[#ea4335] hover:bg-[#d93025] text-white'}\`}
            >
              {isRoomMicOn ? <Mic size={20} /> : <MicOff size={20} />}
            </button>
            
            <button 
              onClick={toggleRoomCamera}
              className={\`w-12 h-12 rounded-full flex items-center justify-center transition-all \${isRoomCameraOn ? 'bg-[#3c4043] hover:bg-[#4d5156] text-white' : 'bg-[#ea4335] hover:bg-[#d93025] text-white'}\`}
            >
              {isRoomCameraOn ? <Video size={20} /> : <VideoOff size={20} />}
            </button>
            
            <div className="w-px h-8 bg-white/10 mx-1" />
            
            <button 
              onClick={startScreenShare}
              className="w-12 h-12 rounded-full flex items-center justify-center bg-[#3c4043] hover:bg-[#4d5156] text-white transition-all"
              title={screenShareStream ? "Stop Presenting" : "Present now"}
            >
              <MonitorPlay size={20} className={screenShareStream ? "text-violet-400" : ""} />
            </button>

            <button 
              onClick={toggleRoomRecording}
              className="w-12 h-12 rounded-full flex items-center justify-center bg-[#3c4043] hover:bg-[#4d5156] text-white transition-all relative"
              title={isRoomRecording ? "Stop Recording" : "Record"}
            >
              <div className={\`absolute top-0 right-0 w-3 h-3 rounded-full border-2 border-[#1a1b1e] \${isRoomRecording ? 'bg-red-500 animate-pulse' : 'bg-transparent border-transparent'}\`}></div>
              <div className="w-4 h-4 rounded-full border-2 border-current flex items-center justify-center">
                <div className={\`w-1.5 h-1.5 rounded-full \${isRoomRecording ? 'bg-red-500' : 'bg-white'}\`}></div>
              </div>
            </button>

            <button 
              onClick={leaveRoom}
              className="w-16 h-12 rounded-full flex items-center justify-center bg-[#ea4335] hover:bg-[#d93025] text-white ml-2 shadow-[0_4px_14px_rgba(234,67,53,0.4)] transition-all"
              title="Leave call"
            >
              <PhoneOff size={22} />
            </button>
          </div>
          
          <div className="flex items-center gap-3">
            <button className="w-10 h-10 rounded-full flex items-center justify-center bg-transparent hover:bg-white/10 text-white transition">
              <MessageSquare size={18} />
            </button>
          </div>
        </div>
      </div>
    );
  };
`;

// Inject exactly before renderRoomLeftSidebar
const injectionTarget = '  const renderRoomLeftSidebar = () => {';
const insertIndex = content.indexOf(injectionTarget);

if (insertIndex !== -1) {
  content = content.slice(0, insertIndex) + modernRoom + '\n' + content.slice(insertIndex);
  
  // Ensure we didn't add multiple renderRoomStage calls to the toast system
  const toastIndex = content.indexOf('{/* Dynamic Toast System */}');
  if (toastIndex !== -1 && !content.includes('{renderRoomStage()}')) {
    content = content.slice(0, toastIndex) + '{renderRoomStage()}\n      ' + content.slice(toastIndex);
  }

  fs.writeFileSync(file, content, 'utf8');
  console.log('Successfully injected premium Room UI in the correct scope before renderRoomLeftSidebar');
} else {
  console.log('Failed to find renderRoomLeftSidebar to inject renderRoomStage');
}
