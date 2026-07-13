import React, { useState, useEffect } from "react";
import {
  Video, Calendar, PlayCircle, Search, Keyboard, ChevronRight, Settings, Plus, Users, Hash
} from "lucide-react";

export default function RoomLandingPage({ onLaunch }) {
  const [meetingCode, setMeetingCode] = useState("");
  const [isDropdownOpen, setIsDropdownOpen] = useState(false);
  const [currentTime, setCurrentTime] = useState(new Date());

  useEffect(() => {
    const timer = setInterval(() => setCurrentTime(new Date()), 60000);
    return () => clearInterval(timer);
  }, []);

  const handleLaunch = () => {
    onLaunch?.({ type: 'action', name: 'Room' });
  };

  return (
    <div className="flex h-full w-full bg-[radial-gradient(ellipse_at_center,_var(--tw-gradient-stops))] from-[#FFFDFB] via-[#F9F8F6] to-[#F1F0EE] p-8 gap-6 text-slate-800 font-sans relative overflow-hidden">
      <div className="absolute inset-0 bg-black/[0.025] pointer-events-none z-0"></div>

      {/* Top Right Header Elements */}
      <div className="absolute top-12 right-12 flex items-center gap-4 z-30">
        <div className="text-[15px] font-medium text-slate-600 mr-2 flex items-center gap-2">
          <span>{currentTime.toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })}</span>
          <span className="w-1 h-1 rounded-full bg-slate-300"></span>
          <span>{currentTime.toLocaleDateString([], { weekday: 'short', month: 'short', day: 'numeric' })}</span>
        </div>
        <button className="w-10 h-10 rounded-full border border-white/60 bg-white/70 backdrop-blur-xl flex items-center justify-center text-slate-500 hover:bg-white hover:text-violet-600 transition-all shadow-[0_8px_20px_rgba(0,0,0,0.04)] hover:-translate-y-0.5">
          <Settings size={18} />
        </button>
        <div className="w-10 h-10 rounded-full bg-violet-600 text-white flex items-center justify-center font-semibold text-[15px] shadow-[0_8px_20px_rgba(139,92,246,0.3)] ring-2 ring-white/50 cursor-pointer hover:bg-violet-700 hover:-translate-y-0.5 transition-all">
          J
        </div>
      </div>

      {/* Sidebar - Now a floating glassmorphic panel */}
      <aside className="w-[280px] shrink-0 bg-white/70 backdrop-blur-[60px] border border-white/60 shadow-[0_32px_120px_rgba(0,0,0,0.04)] rounded-[32px] flex flex-col z-10 p-6 relative">
          {/* Header / Logo (Exact match to Room) */}
          <div className="flex items-center gap-2.5 mb-10 select-none cursor-default">
            <svg width="24" height="24" viewBox="0 0 24 24" fill="none" xmlns="http://www.w3.org/2000/svg">
              <circle cx="12" cy="12" r="3.5" fill="#A78BFA" />
              <circle cx="12" cy="5.5" r="2.5" fill="#A78BFA" />
              <circle cx="17.63" cy="8.75" r="2.5" fill="#A78BFA" />
              <circle cx="17.63" cy="15.25" r="2.5" fill="#A78BFA" />
              <circle cx="12" cy="18.5" r="2.5" fill="#A78BFA" />
              <circle cx="6.37" cy="15.25" r="2.5" fill="#A78BFA" />
              <circle cx="6.37" cy="8.75" r="2.5" fill="#A78BFA" />
            </svg>
            <span className="text-[20px] font-semibold text-violet-500 tracking-tight font-sans">Room</span>
          </div>

          {/* Navigation */}
          <nav className="flex-1 space-y-1">
            <div className="px-3 text-[10px] font-bold text-slate-400 mb-2 mt-4 uppercase tracking-wider">Meetings</div>
            <button className="w-full flex items-center gap-3 px-3 py-2.5 bg-violet-50/50 text-violet-600 rounded-xl font-medium transition-colors text-[13px] border border-violet-100/50">
              <Calendar size={16} />
              <span>Upcoming</span>
            </button>
            <button className="w-full flex items-center gap-3 px-3 py-2.5 text-slate-500 hover:bg-slate-50 hover:text-slate-800 rounded-xl font-medium transition-colors text-[13px]">
              <PlayCircle size={16} />
              <span>Recordings</span>
            </button>
            
            <div className="px-3 text-[10px] font-bold text-slate-400 mb-2 mt-8 uppercase tracking-wider">Spaces</div>
            <button className="w-full flex items-center gap-3 px-3 py-2 text-slate-500 hover:bg-slate-50 hover:text-slate-800 rounded-xl font-medium transition-colors text-[13px]">
              <div className="w-6 h-6 rounded-lg bg-orange-50 text-orange-500 flex items-center justify-center shrink-0">
                <Hash size={13} />
              </div>
              <span className="truncate flex-1 text-left">Design Team</span>
            </button>
            <button className="w-full flex items-center gap-3 px-3 py-2 text-slate-500 hover:bg-slate-50 hover:text-slate-800 rounded-xl font-medium transition-colors text-[13px]">
              <div className="w-6 h-6 rounded-lg bg-blue-50 text-blue-500 flex items-center justify-center shrink-0">
                <Hash size={13} />
              </div>
              <span className="truncate flex-1 text-left">Engineering</span>
            </button>
          </nav>

          {/* Footer Settings */}
          <div className="pt-4 mt-4 border-t border-slate-100/50">
            <button className="w-full flex items-center gap-3 px-3 py-2.5 text-slate-500 hover:bg-slate-50 hover:text-slate-800 rounded-xl font-medium transition-colors text-[13px]">
              <Settings size={16} />
              <span>Settings</span>
            </button>
          </div>
        </aside>

      {/* Main Content Area - Now its own floating glassmorphic container */}
      <main className="flex-1 flex flex-col relative bg-white/70 backdrop-blur-[60px] border border-white/60 shadow-[0_32px_120px_rgba(0,0,0,0.04)] rounded-[40px] overflow-hidden z-10">
          <div className="flex-1 flex items-center justify-center p-12">
            <div className="max-w-4xl w-full flex flex-col md:flex-row items-center gap-20">
              
              {/* Left side actions */}
              <div className="flex-1 flex flex-col items-start gap-8">
                <div>
                  <h1 className="text-[42px] font-normal text-slate-900 tracking-tight mb-5 leading-[1.1]">
                    Premium video meetings.<br/>Now free for everyone.
                  </h1>
                  <p className="text-[15px] text-slate-500 font-medium leading-relaxed max-w-md">
                    We re-engineered the service we built for secure business meetings, Room, to make it free and available for all.
                  </p>
                </div>

                <div className="flex flex-col sm:flex-row w-full gap-4 items-center relative z-20">
                  <div className="relative w-full sm:w-auto shrink-0">
                    <button 
                      onClick={() => setIsDropdownOpen(!isDropdownOpen)}
                      className="bg-violet-500/95 backdrop-blur-md hover:bg-violet-600 text-white px-6 py-4 rounded-full font-medium flex items-center justify-center gap-2.5 shadow-[0_8px_20px_rgba(139,92,246,0.25)] hover:shadow-[0_12px_24px_rgba(139,92,246,0.35)] hover:-translate-y-1 transition-all duration-300 w-full text-[15px]"
                    >
                      <Video size={18} />
                      New meeting
                    </button>

                    {isDropdownOpen && (
                      <>
                        <div className="fixed inset-0 z-10" onClick={() => setIsDropdownOpen(false)} />
                        <div className="absolute top-full left-0 mt-2 w-64 bg-white/90 backdrop-blur-xl border border-white/60 rounded-2xl shadow-[0_12px_40px_rgb(0,0,0,0.12)] overflow-hidden z-20 animate-in fade-in slide-in-from-top-2 p-1.5 ring-1 ring-black/5">
                          <button 
                            onClick={() => { setIsDropdownOpen(false); onLaunch?.({ type: 'action', name: 'Room' }); }}
                            className="w-full flex items-center gap-3 px-3 py-3 hover:bg-violet-50/80 rounded-xl text-left transition-colors group"
                          >
                            <div className="w-8 h-8 rounded-full bg-violet-100 flex items-center justify-center text-violet-600 group-hover:scale-110 transition-transform">
                              <Plus size={16} />
                            </div>
                            <div className="flex flex-col">
                              <span className="text-[14px] font-semibold text-slate-800">Start an instant meeting</span>
                            </div>
                          </button>
                          <button 
                            onClick={() => { setIsDropdownOpen(false); onLaunch?.({ type: 'schedule', name: 'Room' }); }}
                            className="w-full flex items-center gap-3 px-3 py-3 hover:bg-violet-50/80 rounded-xl text-left transition-colors group mt-1"
                          >
                            <div className="w-8 h-8 rounded-full bg-slate-100 flex items-center justify-center text-slate-600 group-hover:scale-110 group-hover:bg-violet-100 group-hover:text-violet-600 transition-transform">
                              <Calendar size={16} />
                            </div>
                            <div className="flex flex-col">
                              <span className="text-[14px] font-semibold text-slate-800">Schedule for later</span>
                            </div>
                          </button>
                        </div>
                      </>
                    )}
                  </div>

                  <div className="relative flex-1 max-w-[300px]">
                    <Keyboard size={18} className="absolute left-4 top-1/2 -translate-y-1/2 text-slate-400" />
                    <input
                      type="text"
                      value={meetingCode}
                      onChange={(e) => setMeetingCode(e.target.value)}
                      placeholder="Enter a code or link"
                      className="w-full pl-11 pr-20 py-4 rounded-full border border-white/60 bg-white/50 backdrop-blur-md shadow-[inset_0_2px_4px_rgba(0,0,0,0.02)] text-slate-900 placeholder:text-slate-400 focus:outline-none focus:border-violet-400 focus:ring-4 focus:ring-violet-500/10 transition-all font-medium text-[15px]"
                      onKeyDown={(e) => {
                        if (e.key === 'Enter' && meetingCode.trim().length > 0) {
                           handleLaunch();
                        }
                      }}
                    />
                    {meetingCode.trim().length > 0 && (
                      <button 
                        onClick={handleLaunch}
                        className="absolute right-2 top-1/2 -translate-y-1/2 text-violet-600 font-semibold hover:text-violet-700 hover:bg-violet-50 px-3 py-1.5 rounded-lg transition-colors text-[14px]"
                      >
                        Join
                      </button>
                    )}
                  </div>

                </div>

                <div className="w-full pt-8 mt-4">
                  <a href="#" className="text-violet-500 font-medium text-[13px] hover:underline">Learn more about Room</a>
                </div>
              </div>

              {/* Right side illustrations */}
              <div className="flex-1 hidden md:flex items-center justify-center">
                <div className="w-[340px] h-[340px] rounded-full border-[3px] border-dashed border-slate-200/50 flex items-center justify-center relative p-10 animate-[spin_60s_linear_infinite]">
                  <div className="w-full h-full bg-white rounded-full shadow-[0_20px_50px_rgba(0,0,0,0.04)] flex flex-col items-center justify-center gap-6 relative overflow-hidden animate-[spin_60s_linear_infinite_reverse]">
                    <div className="absolute inset-0 bg-gradient-to-br from-violet-500/5 to-fuchsia-500/5"></div>
                    <Video size={48} className="text-violet-500/30" />
                    <div className="text-center px-8 relative z-10">
                      <div className="text-[17px] font-semibold text-slate-800 mb-1.5">Get a link you can share</div>
                      <div className="text-[12px] text-slate-500 font-medium leading-relaxed">Click New meeting to get a link you can send to people you want to meet with</div>
                    </div>
                  </div>
                </div>
              </div>

            </div>
          </div>
        </main>

    </div>
  );
}
