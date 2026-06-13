const fs = require('fs');
const file = 'c:\\Users\\user\\Downloads\\Project MOAT\\Regaarder Compose\\src\\App.jsx';
let content = fs.readFileSync(file, 'utf8');

const targetReturn = `  return (
    <div ref={appShellRef}`;

const roomModeCode = `  if (productMode === 'room') {
    return (
      <div ref={appShellRef} className={\`flex bg-[#FAFAFC] text-slate-800 overflow-hidden relative \${isDarkMode ? 'app-dark' : ''} h-screen\`} style={{ fontFamily: resolveFontFamily(editorFont) }}>
        
        {/* Left Sidebar */}
        <aside className="w-[240px] shrink-0 border-r border-slate-200/60 bg-[#FAFAFC] flex flex-col justify-between">
          <div>
            <div className="h-[60px] px-5 flex items-center gap-2">
              <div className="w-8 h-8 rounded-lg bg-violet-100 flex items-center justify-center text-violet-700">
                <MonitorPlay size={18} strokeWidth={2.5} />
              </div>
              <span className="text-[16px] font-bold text-slate-900 tracking-tight">Room</span>
            </div>
            
            <div className="px-3 mt-4 space-y-1">
              <button className="w-full flex items-center gap-3 px-3 py-2 rounded-xl bg-violet-50 text-violet-700 font-semibold text-[13px] transition-colors">
                <Home size={18} />
                <span>Home</span>
              </button>
              <button className="w-full flex items-center gap-3 px-3 py-2 rounded-xl text-slate-500 hover:bg-slate-100 hover:text-slate-900 font-medium text-[13px] transition-colors">
                <Video size={18} />
                <span>Meetings</span>
              </button>
              <button className="w-full flex items-center gap-3 px-3 py-2 rounded-xl text-slate-500 hover:bg-slate-100 hover:text-slate-900 font-medium text-[13px] transition-colors">
                <Calendar size={18} />
                <span>Calendar</span>
              </button>
              <button className="w-full flex items-center gap-3 px-3 py-2 rounded-xl text-slate-500 hover:bg-slate-100 hover:text-slate-900 font-medium text-[13px] transition-colors">
                <MonitorPlay size={18} />
                <span>Recordings</span>
              </button>
              <button className="w-full flex items-center gap-3 px-3 py-2 rounded-xl text-slate-500 hover:bg-slate-100 hover:text-slate-900 font-medium text-[13px] transition-colors">
                <Users size={18} />
                <span>People</span>
              </button>
              <button className="w-full flex items-center gap-3 px-3 py-2 rounded-xl text-slate-500 hover:bg-slate-100 hover:text-slate-900 font-medium text-[13px] transition-colors">
                <Settings size={18} />
                <span>Settings</span>
              </button>
            </div>
          </div>
          
          <div className="px-4 pb-6">
            <div className="bg-white border border-violet-100 rounded-[16px] p-4 mb-4 shadow-sm relative overflow-hidden">
              <div className="absolute top-0 left-0 w-full h-1 bg-gradient-to-r from-violet-400 to-fuchsia-400"></div>
              <div className="w-7 h-7 rounded-full bg-violet-100 flex items-center justify-center text-violet-600 mb-3">
                <Sparkles size={14} />
              </div>
              <h4 className="text-[13px] font-bold text-slate-900 mb-1">Upgrade to Pro</h4>
              <p className="text-[11px] text-slate-500 mb-3 leading-relaxed">Unlock unlimited rooms, cloud recordings, and more.</p>
              <button className="w-full py-2 bg-violet-50 text-violet-700 text-[12px] font-semibold rounded-lg hover:bg-violet-100 transition-colors">
                Upgrade now
              </button>
            </div>
            
            <button className="w-full flex items-center justify-between group">
              <div className="flex items-center gap-2">
                <img src="https://i.pravatar.cc/150?u=joshua" alt="Joshua" className="w-9 h-9 rounded-full object-cover border border-slate-200" />
                <div className="text-left">
                  <div className="text-[13px] font-semibold text-slate-900 group-hover:text-violet-600 transition-colors">Joshua Regaarder</div>
                  <div className="text-[11px] text-slate-500">joshua@regaarder.com</div>
                </div>
              </div>
              <ChevronDown size={14} className="text-slate-400" />
            </button>
          </div>
        </aside>

        {/* Main Dashboard */}
        <main className="flex-1 overflow-y-auto thin-scrollbar relative p-6 md:p-10">
          {/* Header Icons */}
          <div className="absolute top-6 right-8 flex items-center gap-3">
            <button className="w-9 h-9 rounded-full flex items-center justify-center text-slate-500 hover:bg-white hover:shadow-sm border border-transparent hover:border-slate-200 transition-all">
              <Bell size={16} />
            </button>
            <button className="w-9 h-9 rounded-full flex items-center justify-center text-slate-500 hover:bg-white hover:shadow-sm border border-transparent hover:border-slate-200 transition-all">
              <Calendar size={16} />
            </button>
          </div>

          <div className="max-w-[1000px] mx-auto mt-6">
            {/* Hero Banner */}
            <div className="relative w-full rounded-[24px] overflow-hidden bg-white border border-slate-100 shadow-[0_8px_30px_rgba(0,0,0,0.04)] mb-8 p-12 flex items-center justify-between min-h-[300px]">
              {/* Background styling for premium look */}
              <div className="absolute inset-0 bg-gradient-to-br from-[#f8f5ff] via-white to-[#fbfaff]"></div>
              
              <div className="relative z-10 w-1/2 flex items-center justify-center">
                <div className="w-32 h-32 rounded-[32px] bg-white/60 backdrop-blur-xl shadow-[0_20px_40px_rgba(139,92,246,0.15)] border border-white/80 flex items-center justify-center relative">
                  <div className="absolute inset-0 bg-gradient-to-br from-violet-500 to-fuchsia-500 rounded-[32px] opacity-10"></div>
                  <Video size={56} className="text-violet-600 drop-shadow-md" fill="currentColor" />
                </div>
              </div>

              <div className="relative z-10 w-1/2 pl-6">
                <div className="inline-flex items-center gap-1.5 px-3 py-1.5 rounded-full bg-violet-50 text-violet-700 text-[11px] font-bold tracking-wide uppercase mb-4">
                  Good afternoon, Joshua <span className="text-base leading-none">??</span>
                </div>
                <h1 className="text-[40px] font-bold text-slate-900 leading-tight mb-3 tracking-tight">Ready to collaborate?</h1>
                <p className="text-[15px] text-slate-500 mb-8 max-w-[340px] leading-relaxed">Start a room, join a meeting, or continue where you left off.</p>
                
                <div className="flex items-center gap-3">
                  <button onClick={() => startMeetingNow(generateRoomCode())} className="px-6 py-3.5 rounded-xl bg-violet-600 text-white text-[14px] font-semibold hover:bg-violet-700 hover:shadow-lg hover:-translate-y-0.5 transition-all flex items-center gap-2">
                    <MonitorPlay size={18} />
                    Start room
                  </button>
                  <button onClick={() => setIsRoomStartMenuOpen(true)} className="px-6 py-3.5 rounded-xl border border-slate-200 bg-white text-slate-700 text-[14px] font-semibold hover:bg-slate-50 hover:border-slate-300 transition-all flex items-center gap-2">
                    <LinkIcon size={18} />
                    Join room
                  </button>
                </div>
              </div>
            </div>

            {/* Content Grid */}
            <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
              {/* Upcoming Meetings */}
              <div className="bg-white rounded-[20px] border border-slate-100 shadow-sm p-6 flex flex-col h-full">
                <div className="flex items-center justify-between mb-5">
                  <h3 className="text-[15px] font-bold text-slate-900">Upcoming meetings</h3>
                  <button className="text-[13px] font-medium text-violet-600 hover:text-violet-700">View calendar</button>
                </div>
                
                <div className="space-y-3 flex-1">
                  {[
                    { title: 'Beta Launch Kickoff', time: 'Thursday, May 15 ¡E 10:00 AM', color: 'bg-violet-100 text-violet-600' },
                    { title: 'Design System Review', time: 'Friday, May 16 ¡E 2:00 PM', color: 'bg-fuchsia-100 text-fuchsia-600' },
                    { title: 'Marketing Sync', time: 'Monday, May 19 ¡E 11:00 AM', color: 'bg-indigo-100 text-indigo-600' }
                  ].map((mtg, i) => (
                    <div key={i} className="group p-4 rounded-[16px] border border-slate-100 hover:border-violet-200 hover:bg-violet-50/30 transition-all flex items-start justify-between">
                      <div className="flex gap-4">
                        <div className={\`w-10 h-10 rounded-xl \${mtg.color} flex items-center justify-center shrink-0\`}>
                          <Calendar size={18} />
                        </div>
                        <div>
                          <h4 className="text-[14px] font-bold text-slate-900 mb-1">{mtg.title}</h4>
                          <p className="text-[12px] text-slate-500 mb-2">{mtg.time}</p>
                          <div className="flex -space-x-2">
                            <img src="https://i.pravatar.cc/150?u=1" className="w-6 h-6 rounded-full border-2 border-white" />
                            <img src="https://i.pravatar.cc/150?u=2" className="w-6 h-6 rounded-full border-2 border-white" />
                            <img src="https://i.pravatar.cc/150?u=3" className="w-6 h-6 rounded-full border-2 border-white" />
                            <div className="w-6 h-6 rounded-full border-2 border-white bg-slate-100 flex items-center justify-center text-[9px] font-medium text-slate-600">+1</div>
                          </div>
                        </div>
                      </div>
                      <button className="px-4 py-1.5 rounded-lg bg-violet-50 text-violet-700 text-[12px] font-semibold opacity-0 group-hover:opacity-100 transition-opacity">Join</button>
                    </div>
                  ))}
                </div>
                
                <div className="pt-4 mt-4 border-t border-slate-100">
                  <button className="w-full flex items-center justify-between text-[13px] font-medium text-slate-600 hover:text-slate-900 transition-colors">
                    <span>View full calendar</span>
                    <ArrowRight size={14} />
                  </button>
                </div>
              </div>

              {/* Recent Rooms */}
              <div className="bg-white rounded-[20px] border border-slate-100 shadow-sm p-6 flex flex-col h-full">
                <div className="flex items-center justify-between mb-5">
                  <h3 className="text-[15px] font-bold text-slate-900">Recent rooms</h3>
                  <button className="text-[13px] font-medium text-violet-600 hover:text-violet-700">See all</button>
                </div>
                
                <div className="space-y-3 flex-1">
                  {[
                    { title: 'Q2 Launch Strategy', time: 'May 12 ¡E 2:30 PM' },
                    { title: 'Product Review', time: 'May 9 ¡E 11:00 AM' },
                    { title: 'Investor Update', time: 'May 7 ¡E 4:00 PM' },
                    { title: 'Design Critique', time: 'May 5 ¡E 10:30 AM' }
                  ].map((room, i) => (
                    <div key={i} className="group p-3 rounded-[16px] border border-transparent hover:border-slate-200 hover:bg-slate-50 transition-all flex items-center justify-between cursor-pointer">
                      <div className="flex items-center gap-4">
                        <div className="w-10 h-10 rounded-xl bg-violet-50 text-violet-600 flex items-center justify-center shrink-0">
                          <MonitorPlay size={18} />
                        </div>
                        <div>
                          <h4 className="text-[14px] font-bold text-slate-900 mb-0.5 group-hover:text-violet-700 transition-colors">{room.title}</h4>
                          <p className="text-[12px] text-slate-500">{room.time}</p>
                        </div>
                      </div>
                      <div className="flex items-center gap-3">
                        <div className="flex -space-x-2">
                          <img src={\`https://i.pravatar.cc/150?u=\${i+10}\`} className="w-6 h-6 rounded-full border-2 border-white" />
                          <img src={\`https://i.pravatar.cc/150?u=\${i+20}\`} className="w-6 h-6 rounded-full border-2 border-white" />
                          <div className="w-6 h-6 rounded-full border-2 border-white bg-slate-100 flex items-center justify-center text-[9px] font-medium text-slate-600">+\${Math.floor(Math.random() * 3) + 1}</div>
                        </div>
                        <button className="p-1 rounded text-slate-400 hover:bg-slate-200 hover:text-slate-700 transition-colors">
                          <MoreHorizontal size={16} />
                        </button>
                      </div>
                    </div>
                  ))}
                </div>
                
                <div className="pt-4 mt-2 border-t border-slate-100">
                  <button className="w-full flex items-center justify-between text-[13px] font-medium text-slate-600 hover:text-slate-900 transition-colors">
                    <span>View all rooms</span>
                    <ArrowRight size={14} />
                  </button>
                </div>
              </div>
            </div>
          </div>
        </main>
      </div>
    );
  }

  return (
    <div ref={appShellRef}`;

content = content.replace(targetReturn, roomModeCode);
fs.writeFileSync(file, content, 'utf8');
console.log('Injected Room dashboard mode');
