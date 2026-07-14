import React, { useState, useEffect, useRef } from "react";
import {
  Video, Calendar, PlayCircle, Settings, Plus, Users, Hash, Bell, Shield, ChevronDown,
  MoreHorizontal, Clock, FileText, Layout, Home, X, Keyboard
} from "lucide-react";

export default function RoomLandingPage({ onLaunch }) {
  const [meetingCode, setMeetingCode] = useState("");
  const [currentTime, setCurrentTime] = useState(new Date());
  const [activeTab, setActiveTab] = useState("Home");
  const [isDropdownOpen, setIsDropdownOpen] = useState(false);
  const dropdownRef = useRef(null);

  useEffect(() => {
    const timer = setInterval(() => setCurrentTime(new Date()), 60000);
    return () => clearInterval(timer);
  }, []);

  // Handle click outside to close dropdown
  useEffect(() => {
    function handleClickOutside(event) {
      if (dropdownRef.current && !dropdownRef.current.contains(event.target)) {
        setIsDropdownOpen(false);
      }
    }
    document.addEventListener("mousedown", handleClickOutside);
    return () => document.removeEventListener("mousedown", handleClickOutside);
  }, []);

  const handleLaunch = () => {
    onLaunch?.({ type: 'action', name: 'Room' });
  };

  const handleSchedule = () => {
    onLaunch?.({ type: 'schedule', name: 'Room' });
  };

  return (
    <div className="fixed inset-0 z-[9999] bg-[#F9F8F6] bg-[radial-gradient(ellipse_at_center,_var(--tw-gradient-stops))] from-[#FFFDFB] via-[#F9F8F6] to-[#F1F0EE] flex flex-col items-center justify-center font-sans overflow-hidden p-2 md:p-4 select-none">
      {/* Subtle vignette/radial glow overlay */}
      <div className="absolute inset-0 bg-black/[0.025] pointer-events-none z-0" />

      {/* Main Floating Tablet Container */}
      <div className="w-full h-full relative flex items-center justify-center max-w-[1640px] z-10">
        <div className="w-full h-full backdrop-blur-[60px] flex flex-col overflow-hidden relative transition-all duration-500 shadow-[0_32px_120px_rgba(0,0,0,0.04)] bg-white/70 border border-white/60 rounded-[40px]">
          
          {/* Top Header Bar */}
          <header className="h-[90px] flex items-center justify-between px-10 bg-transparent shrink-0 relative z-20">
            {/* Left: Brand Logo & Title */}
            <div className="flex items-center gap-2.5 select-none cursor-default">
              <svg width="22" height="22" viewBox="0 0 24 24" fill="none" xmlns="http://www.w3.org/2000/svg">
                <circle cx="12" cy="12" r="3.5" fill="#A78BFA" />
                <circle cx="12" cy="5.5" r="2.5" fill="#A78BFA" />
                <circle cx="17.63" cy="8.75" r="2.5" fill="#A78BFA" />
                <circle cx="17.63" cy="15.25" r="2.5" fill="#A78BFA" />
                <circle cx="12" cy="18.5" r="2.5" fill="#A78BFA" />
                <circle cx="6.37" cy="15.25" r="2.5" fill="#A78BFA" />
                <circle cx="6.37" cy="8.75" r="2.5" fill="#A78BFA" />
              </svg>
              <span className="text-[18px] font-medium text-violet-400 tracking-tight font-sans">Room</span>
            </div>

            {/* Right: Actions & User Info */}
            <div className="flex items-center gap-4">
              <button className="p-2.5 rounded-2xl text-slate-400 hover:bg-slate-50 hover:text-slate-600 transition-all">
                <Bell size={16} />
              </button>
              <button className="p-2.5 rounded-2xl text-slate-400 hover:bg-slate-50 hover:text-slate-600 transition-all">
                <Shield size={16} />
              </button>
              
              <div className="flex items-center gap-2 pl-3 border-l border-slate-200 cursor-pointer group">
                <div className="relative">
                  <div className="w-8 h-8 rounded-full bg-[#1e293b] text-white flex items-center justify-center font-semibold text-[14px]">
                    Y
                  </div>
                  <span className="absolute bottom-0 right-0 w-2.5 h-2.5 bg-green-500 border-2 border-white rounded-full" />
                </div>
                <ChevronDown size={14} className="text-slate-400 group-hover:text-slate-600 transition-colors" />
              </div>
            </div>
          </header>

          {/* Workspace Body Frame */}
          <div className="flex-1 flex gap-6 px-10 pb-8 overflow-hidden relative">
            
            {/* Left Floating Sidebar Navigation - Clean solid white design matching active room panels */}
            <aside className="w-[260px] shrink-0 bg-white border border-slate-100 shadow-[0_16px_48px_rgba(0,0,0,0.03)] rounded-[32px] flex flex-col p-6">
              <nav className="flex-1 space-y-1">
                {[
                  { id: "Home", label: "Home", icon: <Home size={16} /> },
                  { id: "Rooms", label: "Rooms", icon: <Hash size={16} /> },
                  { id: "Recordings", label: "Recordings", icon: <PlayCircle size={16} /> },
                  { id: "Calendar", label: "Calendar", icon: <Calendar size={16} /> },
                  { id: "Templates", label: "Templates", icon: <Layout size={16} /> },
                  { id: "SharedNotes", label: "Shared Notes", icon: <FileText size={16} /> },
                  { id: "Settings", label: "Settings", icon: <Settings size={16} /> }
                ].map((tab) => {
                  const isActive = activeTab === tab.id;
                  return (
                    <button
                      key={tab.id}
                      onClick={() => setActiveTab(tab.id)}
                      className={`w-full flex items-center gap-3 px-3 py-2.5 text-[14px] font-medium transition-all ${
                        isActive
                          ? "border border-violet-500/30 text-violet-600 bg-violet-500/5 rounded-xl outline-active"
                          : "text-slate-500 hover:text-slate-800 hover:bg-slate-50/50 rounded-xl"
                      }`}
                      style={{
                        borderRadius: "12px"
                      }}
                    >
                      {tab.icon}
                      <span>{tab.label}</span>
                    </button>
                  );
                })}
              </nav>

              {/* ROOM PRO promo card */}
              <div className="mt-auto bg-violet-50/50 border border-violet-100/50 rounded-2xl p-4 flex flex-col gap-2">
                <div className="flex items-center gap-1.5">
                  <span className="text-[10px] uppercase font-bold tracking-wider text-slate-400">Room</span>
                  <span className="text-[10px] uppercase font-bold px-1.5 py-0.5 rounded bg-violet-100 text-violet-600">Pro</span>
                </div>
                <div className="text-[14px] font-semibold text-slate-800 leading-tight">
                  More power for your meetings
                </div>
                <div className="text-[12px] text-slate-400 leading-normal">
                  Unlock advanced AI features, transcripts, and more.
                </div>
                <button className="mt-2 w-full py-2 bg-white hover:bg-slate-50 border border-slate-200 text-violet-600 rounded-xl text-[12px] font-semibold shadow-[0_2px_8px_rgba(0,0,0,0.02)] transition-all">
                  ✦ Upgrade to Pro
                </button>
              </div>
            </aside>

            {/* Middle Column (Main Content) */}
            <main className="flex-1 flex flex-col gap-6 overflow-y-auto pr-2 thin-scrollbar pt-2">
              
              {/* Quick Action Buttons */}
              <div className="flex gap-4 items-center shrink-0 relative">
                <div className="flex-1 relative" ref={dropdownRef}>
                  <button
                    onClick={() => setIsDropdownOpen(!isDropdownOpen)}
                    className="w-full bg-violet-600 hover:bg-violet-700 text-white font-medium py-3 rounded-2xl flex items-center justify-center gap-2 shadow-[0_8px_20px_rgba(124,58,237,0.25)] hover:shadow-[0_12px_24px_rgba(124,58,237,0.35)] transition-all text-[15px]"
                  >
                    <Plus size={16} /> New Room
                  </button>

                  {isDropdownOpen && (
                    <div className="absolute top-full left-0 mt-2 w-full bg-white border border-slate-100 rounded-2xl shadow-[0_12px_40px_rgba(0,0,0,0.12)] overflow-hidden z-30 p-1.5 animate-in fade-in slide-in-from-top-2">
                      <button
                        onClick={() => { setIsDropdownOpen(false); handleLaunch(); }}
                        className="w-full flex items-center gap-3 px-4 py-3 hover:bg-violet-50/50 rounded-xl text-left transition-colors group"
                      >
                        <div className="w-8 h-8 rounded-full bg-violet-100 flex items-center justify-center text-violet-600 group-hover:scale-105 transition-transform">
                          <Plus size={16} />
                        </div>
                        <div className="flex flex-col">
                          <span className="text-[14px] font-semibold text-slate-800">Start an instant meeting</span>
                          <span className="text-[11px] text-slate-400">Launch a private Room session immediately</span>
                        </div>
                      </button>
                      <button
                        onClick={() => { setIsDropdownOpen(false); handleSchedule(); }}
                        className="w-full flex items-center gap-3 px-4 py-3 hover:bg-violet-50/50 rounded-xl text-left transition-colors group mt-1"
                      >
                        <div className="w-8 h-8 rounded-full bg-slate-100 flex items-center justify-center text-slate-600 group-hover:scale-105 group-hover:bg-violet-100 group-hover:text-violet-600 transition-transform">
                          <Calendar size={16} />
                        </div>
                        <div className="flex flex-col">
                          <span className="text-[14px] font-semibold text-slate-800">Schedule for later</span>
                          <span className="text-[11px] text-slate-400">Create a future invite calendar link</span>
                        </div>
                      </button>
                    </div>
                  )}
                </div>

                <div className="flex-1 relative">
                  <input
                    type="text"
                    value={meetingCode}
                    onChange={(e) => setMeetingCode(e.target.value)}
                    placeholder="Join Room"
                    className="w-full bg-white hover:bg-slate-50 border border-slate-200 text-slate-700 placeholder:text-slate-400 font-medium py-3 pl-11 pr-12 rounded-2xl text-[15px] focus:outline-none focus:border-violet-400 focus:ring-4 focus:ring-violet-500/10 transition-all text-center shadow-[0_2px_8px_rgba(0,0,0,0.02)]"
                    onKeyDown={(e) => {
                      if (e.key === 'Enter' && meetingCode.trim().length > 0) {
                        handleLaunch();
                      }
                    }}
                  />
                  <Keyboard size={16} className="absolute left-4 top-1/2 -translate-y-1/2 text-slate-400" />
                  {meetingCode.trim().length > 0 && (
                    <button
                      onClick={handleLaunch}
                      className="absolute right-2 top-1/2 -translate-y-1/2 text-violet-600 font-semibold hover:text-violet-700 hover:bg-violet-50 px-2.5 py-1 rounded-lg transition-colors text-[13px]"
                    >
                      Join
                    </button>
                  )}
                </div>
              </div>

              {/* Recent Rooms */}
              <section className="flex flex-col gap-3 shrink-0">
                <div className="flex items-center justify-between">
                  <h2 className="text-[16px] font-semibold text-slate-800 tracking-tight">Recent Rooms</h2>
                  <button className="text-[12px] font-medium text-slate-400 hover:text-violet-600 transition-colors flex items-center gap-0.5">
                    View all <ChevronDown size={14} className="-rotate-90" />
                  </button>
                </div>

                <div className="grid grid-cols-3 gap-4">
                  {[
                    { name: "Product Sync", time: "Yesterday", users: "8 participants", recording: true, ai: true, color: "bg-blue-600" },
                    { name: "Design Review", time: "Today", users: "5 participants", recording: false, ai: true, color: "bg-emerald-600" },
                    { name: "Marketing Sync", time: "Jul 11", users: "6 participants", recording: true, ai: false, color: "bg-blue-600" }
                  ].map((room, idx) => (
                    <div key={idx} className="bg-white border border-slate-100 rounded-2xl p-4 flex flex-col gap-3 hover:shadow-lg hover:border-slate-200 transition-all cursor-pointer relative group">
                      <div className="flex justify-between items-start">
                        <div className="flex items-center gap-3">
                          <div className={`w-8 h-8 rounded-xl ${room.color} text-white flex items-center justify-center`}>
                            <Users size={14} />
                          </div>
                          <div>
                            <div className="text-[14px] font-semibold text-slate-800">{room.name}</div>
                            <div className="text-[11px] text-slate-400">{room.time} • {room.users}</div>
                          </div>
                        </div>
                        <button className="p-1 rounded-full text-slate-400 hover:bg-slate-50 hover:text-slate-700 transition-colors">
                          <MoreHorizontal size={14} />
                        </button>
                      </div>

                      <div className="flex gap-2">
                        {room.recording && (
                          <span className="flex items-center gap-1 text-[10px] font-semibold px-2 py-0.5 rounded bg-red-50 text-red-500">
                            <span className="w-1.5 h-1.5 rounded-full bg-red-500 animate-pulse" />
                            Recording
                          </span>
                        )}
                        {room.ai && (
                          <span className="flex items-center gap-1 text-[10px] font-semibold px-2 py-0.5 rounded bg-violet-50 text-violet-500">
                            ✦ AI Summary
                          </span>
                        )}
                      </div>
                    </div>
                  ))}
                </div>
              </section>

              {/* Upcoming */}
              <section className="flex flex-col gap-3 shrink-0">
                <div className="flex items-center justify-between">
                  <h2 className="text-[16px] font-semibold text-slate-800 tracking-tight">Upcoming</h2>
                  <button onClick={handleSchedule} className="text-[12px] font-medium text-slate-400 hover:text-violet-600 transition-colors flex items-center gap-0.5">
                    View calendar <ChevronDown size={14} className="-rotate-90" />
                  </button>
                </div>

                <div className="grid grid-cols-2 gap-4">
                  {[
                    { title: "Marketing Review", time: "Today • 3:00 PM", duration: "30 min", avatars: ["J", "S", "M"], count: "+3" },
                    { title: "Sprint Planning", time: "Tomorrow • 10:00 AM", duration: "1 hr", avatars: ["R", "L", "T"], count: "+5" }
                  ].map((mtg, idx) => (
                    <div key={idx} className="bg-white border border-slate-100 rounded-2xl p-4 flex justify-between items-center hover:shadow-lg hover:border-slate-200 transition-all cursor-pointer">
                      <div className="flex items-center gap-4">
                        <div className="w-10 h-10 rounded-xl bg-violet-50 text-violet-600 flex items-center justify-center">
                          <Calendar size={18} />
                        </div>
                        <div>
                          <div className="text-[12px] text-slate-400 font-medium">{mtg.time}</div>
                          <div className="text-[14px] font-semibold text-slate-800 leading-snug">{mtg.title}</div>
                          <div className="text-[11px] text-slate-400 font-medium">{mtg.duration}</div>
                        </div>
                      </div>

                      <div className="flex items-center gap-3">
                        {/* Avatars */}
                        <div className="flex -space-x-2">
                          {mtg.avatars.map((av, avIdx) => (
                            <div key={avIdx} className="w-6 h-6 rounded-full bg-slate-100 border-2 border-white flex items-center justify-center text-[10px] font-semibold text-slate-600 shadow-sm">
                              {av}
                            </div>
                          ))}
                          <div className="w-6 h-6 rounded-full bg-violet-100 border-2 border-white flex items-center justify-center text-[9px] font-bold text-violet-600 shadow-sm">
                            {mtg.count}
                          </div>
                        </div>
                        
                        <button className="p-1 rounded-full text-slate-400 hover:bg-slate-50 hover:text-slate-700 transition-colors">
                          <MoreHorizontal size={14} />
                        </button>
                      </div>
                    </div>
                  ))}
                </div>
              </section>

            </main>

            {/* Right Floating Panel (Activity Feed) - Clean solid white design matching active room panels */}
            <aside className="w-[280px] shrink-0 bg-white border border-slate-100 shadow-[0_16px_48px_rgba(0,0,0,0.03)] rounded-[32px] flex flex-col p-6">
              <div className="flex items-center justify-between mb-5">
                <h2 className="text-[16px] font-semibold text-slate-800 tracking-tight">Activity</h2>
                <button className="p-1 rounded-full text-slate-400 hover:bg-slate-100 hover:text-slate-700 transition-colors">
                  <X size={16} />
                </button>
              </div>

              {/* Activity items list */}
              <div className="flex-1 flex flex-col gap-4 overflow-y-auto pr-1 thin-scrollbar">
                {[
                  { text: "John shared a recording", project: "Product Sync", time: "2h ago", icon: <PlayCircle size={14} />, color: "bg-blue-50 text-blue-500" },
                  { text: "AI summary ready", project: "Design Review", time: "3h ago", icon: <span>✦</span>, color: "bg-violet-50 text-violet-500" },
                  { text: "Meeting starts in 15 min", project: "Marketing Review", time: "2:45 PM", icon: <Calendar size={14} />, color: "bg-amber-50 text-amber-500" },
                  { text: "Transcript completed", project: "Product Sync", time: "Yesterday", icon: <Clock size={14} />, color: "bg-emerald-50 text-emerald-500" },
                  { text: "Lisa shared meeting notes", project: "Sprint Planning", time: "Yesterday", icon: <FileText size={14} />, color: "bg-indigo-50 text-indigo-500" }
                ].map((activity, idx) => (
                  <div key={idx} className="flex gap-3 items-start hover:bg-slate-50/50 p-1.5 rounded-lg transition-colors cursor-pointer">
                    <div className={`w-8 h-8 rounded-xl ${activity.color} flex items-center justify-center shrink-0`}>
                      {activity.icon}
                    </div>
                    <div className="flex-1 min-w-0">
                      <div className="text-[12px] font-semibold text-slate-800 truncate leading-snug">{activity.text}</div>
                      <div className="text-[11px] text-slate-400 font-medium">{activity.project}</div>
                    </div>
                    <div className="text-[10px] text-slate-400 font-medium shrink-0 whitespace-nowrap pt-0.5">{activity.time}</div>
                  </div>
                ))}
              </div>

              <button className="mt-4 w-full py-2.5 bg-slate-50 hover:bg-slate-100 text-slate-600 font-semibold rounded-xl text-[12px] border border-slate-200/50 shadow-[0_2px_8px_rgba(0,0,0,0.01)] transition-all flex items-center justify-center gap-1">
                View all activity <ChevronDown size={14} className="-rotate-90" />
              </button>
            </aside>

          </div>

        </div>
      </div>
    </div>
  );
}
