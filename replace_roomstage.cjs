const fs = require('fs');
const file = 'c:\\Users\\user\\Downloads\\Project MOAT\\Regaarder Compose\\src\\App.jsx';
let content = fs.readFileSync(file, 'utf8');

// First, inject PhoneOff into imports.
if (!content.includes('PhoneOff')) {
  content = content.replace('MicOff,', 'MicOff, PhoneOff, Smile, MoreVertical,');
}

// Next, replace renderRoomStage.
const newRenderRoomStage = `    const renderRoomStage = () => {
  return roomState === 'active' && roomPanelMode === 'expanded' && mainView === 'room' && (
    <div className="fixed inset-0 z-[320] bg-[#1a1b1e] flex flex-col font-sans">
      
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
          <button onClick={() => { setMainView('document'); setRoomPanelMode('docked'); }} className="px-3 py-1.5 rounded-lg text-xs font-medium bg-white/10 hover:bg-white/20 transition-colors text-white border border-white/10">
            Dock to Sidebar
          </button>
        </div>
      </div>

      {/* Main Content Area */}
      <div className="flex-1 min-h-0 p-4 pb-0 flex gap-4">
        {activeSharedMeetingFile ? (
          <>
            {/* Screen Share / File View */}
            <div className="flex-[3] relative bg-white rounded-2xl overflow-hidden shadow-2xl flex flex-col border border-white/10">
              <div className="px-4 py-3 border-b border-gray-100 flex items-center justify-between bg-white shrink-0">
                <div className="flex items-center gap-2 text-sm font-semibold text-gray-900">
                  <Presentation size={16} className="text-violet-600" />
                  {activeSharedMeetingFile.name}
                </div>
                <div className="text-xs text-gray-500">Shared by {activeSharedMeetingFile.sharedBy}</div>
              </div>
              <div className="flex-1 bg-[#f8fafc] overflow-y-auto thin-scrollbar p-8">
                {/* Simulated slide/document content */}
                <div className="max-w-2xl mx-auto bg-white border border-gray-200 shadow-sm rounded-xl p-8 min-h-[500px]">
                  <h1 className="text-2xl font-bold text-gray-900 mb-6">{activeSharedMeetingFile.baseName || 'Strategic Disruption Through AI-Native Bundling'}</h1>
                  <p className="text-gray-600 leading-relaxed mb-6">
                    Incumbents win by bundling and distribution leverage. Our approach is to build a superior suite and distribute as a unified ecosystem.
                  </p>
                  <div className="h-64 bg-violet-50 rounded-lg border border-violet-100 flex items-center justify-center">
                    <Presentation size={48} className="text-violet-200" />
                  </div>
                </div>
              </div>
            </div>
            
            {/* Sidebar Participants */}
            <div className="flex-1 flex flex-col gap-3 min-w-[280px] max-w-[320px]">
              <div className="h-1/3 rounded-2xl bg-[#282a2f] overflow-hidden relative border border-white/10">
                <LocalVideoFeed stream={localStream} isCameraOn={isRoomCameraOn} />
                <div className="absolute bottom-3 left-3 text-xs font-medium text-white px-2 py-1 bg-black/50 rounded-md backdrop-blur-md">
                  You
                </div>
              </div>
              <div className="flex-1 rounded-2xl bg-[#282a2f] overflow-hidden relative border border-white/10 flex items-center justify-center">
                <div className="w-20 h-20 rounded-full bg-indigo-500 flex items-center justify-center text-white text-2xl font-bold shadow-lg">
                  M
                </div>
                <div className="absolute bottom-3 left-3 text-xs font-medium text-white px-2 py-1 bg-black/50 rounded-md backdrop-blur-md">
                  Michelle Tran
                </div>
              </div>
            </div>
          </>
        ) : (
          /* Empty State / Grid View */
          <div className="flex-1 rounded-3xl bg-[#222428] border border-white/5 relative overflow-hidden flex items-center justify-center">
            {meetingParticipants.length > 0 ? (
              <div className="grid grid-cols-2 gap-4 w-full h-full p-4">
                <div className="rounded-2xl overflow-hidden relative bg-[#2a2c32]">
                  <LocalVideoFeed stream={localStream} isCameraOn={isRoomCameraOn} />
                  <div className="absolute bottom-4 left-4 text-sm font-medium text-white px-2.5 py-1 bg-black/40 rounded-lg backdrop-blur-sm">You</div>
                </div>
                {meetingParticipants.map((participant, i) => (
                  <div key={i} className="rounded-2xl overflow-hidden relative bg-[#2a2c32]">
                    {/* Placeholder for remote stream */}
                    <div className="absolute inset-0 flex items-center justify-center">
                      <div className="w-24 h-24 rounded-full bg-emerald-500 flex items-center justify-center text-white text-3xl font-bold overflow-hidden"><img src={participant.img} className="w-full h-full object-cover" alt="" /></div>
                    </div>
                    <div className="absolute bottom-4 left-4 text-sm font-medium text-white px-2.5 py-1 bg-black/40 rounded-lg backdrop-blur-sm">{participant.name}</div>
                  </div>
                ))}
              </div>
            ) : (
              /* Single User Large View (Empty State) */
              <div className="w-full h-full relative group">
                <LocalVideoFeed stream={localStream} isCameraOn={isRoomCameraOn} />
                <div className="absolute bottom-6 left-6 text-sm font-medium text-white px-3 py-1.5 bg-black/40 rounded-lg backdrop-blur-md">
                  You (Joshua Carl Hans Bergson Sajous)
                </div>
                
                {/* Translation Tooltip (Google Meet Style) */}
                <div className="absolute bottom-6 right-6 max-w-xs bg-[#0b57d0] text-white p-4 rounded-2xl shadow-xl flex flex-col gap-2 transform translate-y-2 opacity-0 group-hover:translate-y-0 group-hover:opacity-100 transition-all duration-300 pointer-events-none group-hover:pointer-events-auto">
                  <div className="flex items-center gap-2 font-semibold text-sm">
                    <MessageSquare size={16} /> Try speech translation
                  </div>
                  <div className="text-xs text-blue-100 leading-relaxed">
                    Translate for people who don't speak the same language.
                  </div>
                  <div className="flex justify-end gap-2 mt-2">
                    <button className="px-3 py-1.5 text-xs font-medium hover:bg-white/10 rounded-full transition">Not now</button>
                    <button className="px-4 py-1.5 text-xs font-semibold bg-white text-[#0b57d0] rounded-full hover:bg-blue-50 transition shadow-sm">Try it</button>
                  </div>
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
            className={`w-12 h-12 rounded-full flex items-center justify-center transition-all ${isRoomMicOn ? 'bg-[#3c4043] hover:bg-[#4d5156] text-white' : 'bg-[#ea4335] hover:bg-[#d93025] text-white'}`}
          >
            {isRoomMicOn ? <Mic size={20} /> : <MicOff size={20} />}
          </button>
          
          <button 
            onClick={toggleRoomCamera}
            className={`w-12 h-12 rounded-full flex items-center justify-center transition-all ${isRoomCameraOn ? 'bg-[#3c4043] hover:bg-[#4d5156] text-white' : 'bg-[#ea4335] hover:bg-[#d93025] text-white'}`}
          >
            {isRoomCameraOn ? <Video size={20} /> : <VideoOff size={20} />}
          </button>
          
          <div className="w-px h-8 bg-white/10 mx-1" />
          
          <button 
            onClick={() => handleMeetingShareOption('document')}
            className="w-12 h-12 rounded-full flex items-center justify-center bg-[#3c4043] hover:bg-[#4d5156] text-white transition-all"
            title="Present now"
          >
            <MonitorPlay size={20} />
          </button>

          <button 
            className="w-12 h-12 rounded-full flex items-center justify-center bg-[#3c4043] hover:bg-[#4d5156] text-white transition-all"
            title="React"
          >
            <Smile size={20} />
          </button>

          <button 
            className="w-12 h-12 rounded-full flex items-center justify-center bg-[#3c4043] hover:bg-[#4d5156] text-white transition-all"
            title="Raise hand"
          >
            <Hand size={20} />
          </button>

          <button 
            className="w-12 h-12 rounded-full flex items-center justify-center bg-[#3c4043] hover:bg-[#4d5156] text-white transition-all"
            title="More options"
          >
            <MoreVertical size={20} />
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
            <AlertTriangle size={18} />
          </button>
          <button className="w-10 h-10 rounded-full flex items-center justify-center bg-transparent hover:bg-white/10 text-white transition">
            <Users size={18} />
          </button>
          <button className="w-10 h-10 rounded-full flex items-center justify-center bg-transparent hover:bg-white/10 text-white transition">
            <MessageSquare size={18} />
          </button>
          <button className="w-10 h-10 rounded-full flex items-center justify-center bg-transparent hover:bg-white/10 text-white transition">
            <LayoutGrid size={18} />
          </button>
        </div>
      </div>
    </div>
  );
};`;

// We must replace the old renderRoomStage block using regex carefully!
const startIndex = content.indexOf('const renderRoomStage = () => {');
const endStr = '          )}\n        </div>\n      );\n  };';
let endIndex = content.indexOf(endStr, startIndex);

if (endIndex === -1) {
  // Try CRLF
  endIndex = content.indexOf('          )}\r\n        </div>\r\n      );\r\n  };', startIndex);
  if (endIndex !== -1) endIndex += 46;
} else {
  endIndex += 42; // length of endStr
}

if (startIndex !== -1 && endIndex !== -1) {
  content = content.slice(0, startIndex) + newRenderRoomStage + content.slice(endIndex);
  fs.writeFileSync(file, content, 'utf8');
  console.log('Successfully replaced renderRoomStage');
} else {
  console.log('Failed to find renderRoomStage block bounds', startIndex, endIndex);
}

