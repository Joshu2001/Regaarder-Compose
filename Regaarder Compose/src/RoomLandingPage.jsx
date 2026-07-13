import React, { useState } from "react";
import {
  Video, Calendar, PlayCircle, Search, Keyboard, ChevronRight, Settings, Plus, Users, Hash
} from "lucide-react";

export default function RoomLandingPage({ onLaunch }) {
  const [meetingCode, setMeetingCode] = useState("");

  const handleLaunch = () => {
    onLaunch?.({ type: 'action', name: 'Room' });
  };

  return (
    <div className="flex h-full w-full bg-[#F0F2F5] p-4 text-slate-800 font-sans relative overflow-hidden">
      
      {/* Main Glassmorphic Container matching Image 2 */}
      <div className="flex w-full h-full bg-white rounded-[32px] shadow-[0_8px_30px_rgb(0,0,0,0.04)] overflow-hidden border border-white/40">
        
        {/* Sidebar */}
        <aside className="w-[280px] shrink-0 bg-transparent flex flex-col z-10 p-6 border-r border-slate-100/50">
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

        {/* Main Content Area */}
        <main className="flex-1 flex flex-col relative bg-transparent">
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

                <div className="flex flex-col sm:flex-row w-full gap-4 items-center">
                  <button 
                    onClick={handleLaunch}
                    className="bg-violet-500 hover:bg-violet-600 text-white px-6 py-3.5 rounded-xl font-medium flex items-center justify-center gap-2.5 shadow-[0_4px_14px_0_rgba(139,92,246,0.39)] hover:shadow-[0_6px_20px_rgba(139,92,246,0.23)] hover:-translate-y-0.5 transition-all w-full sm:w-auto shrink-0 text-[15px]"
                  >
                    <Video size={18} />
                    New meeting
                  </button>

                  <div className="relative flex-1 max-w-[300px]">
                    <Keyboard size={18} className="absolute left-4 top-1/2 -translate-y-1/2 text-slate-400" />
                    <input
                      type="text"
                      value={meetingCode}
                      onChange={(e) => setMeetingCode(e.target.value)}
                      placeholder="Enter a code or link"
                      className="w-full pl-11 pr-4 py-3.5 rounded-xl border border-slate-200/80 bg-slate-50/50 text-slate-900 placeholder:text-slate-400 focus:outline-none focus:border-violet-500 focus:ring-2 focus:ring-violet-500/20 transition-all font-medium text-[15px]"
                      onKeyDown={(e) => {
                        if (e.key === 'Enter' && meetingCode.trim().length > 0) {
                           handleLaunch();
                        }
                      }}
                    />
                  </div>

                  {meetingCode.trim().length > 0 && (
                    <button 
                      onClick={handleLaunch}
                      className="text-violet-600 font-semibold hover:text-violet-700 px-2 transition-colors shrink-0 text-[15px]"
                    >
                      Join
                    </button>
                  )}
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

    </div>
  );
}
