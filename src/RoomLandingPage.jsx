import React, { useState, useEffect, useRef } from "react";
import {
  Video, Calendar, PlayCircle, Settings, Plus, Users, Hash, Bell, Shield, ChevronDown,
  MoreHorizontal, Clock, FileText, Layout, Home, X, Keyboard, Send, Sparkles, Edit2, Trash2, Check, Download
} from "lucide-react";

export default function RoomLandingPage({ onLaunch }) {
  const [meetingCode, setMeetingCode] = useState("");
  const [currentTime, setCurrentTime] = useState(new Date());
  const [activeTab, setActiveTab] = useState("Home");
  const [isDropdownOpen, setIsDropdownOpen] = useState(false);
  const [aiPrompt, setAiPrompt] = useState("");
  const [roomAIModal, setRoomAIModal] = useState({ isOpen: false, prompt: '', answer: '' });
  
  // Header Actions States
  const [isInvitesOpen, setIsInvitesOpen] = useState(false);
  const [isDistractionFree, setIsDistractionFree] = useState(false);
  const [isProfileOpen, setIsProfileOpen] = useState(false);

  // Invites state matching meeting workspace (start with one invite, then empty state)
  const [invites, setInvites] = useState([
    { id: 1, sender: "John", title: "Product Sync", date: "Today", time: "4:00 PM" }
  ]);

  // AI Response Interactive States
  const [isEditingPrompt, setIsEditingPrompt] = useState(false);
  const [isEditingAnswer, setIsEditingAnswer] = useState(false);
  const [editedPromptText, setEditedPromptText] = useState("");
  const [editedAnswerText, setEditedAnswerText] = useState("");
  const [isExportMenuOpen, setIsExportMenuOpen] = useState(false);
  const [exportStatus, setExportStatus] = useState("");

  const dropdownRef = useRef(null);
  const invitesRef = useRef(null);
  const profileRef = useRef(null);
  const exportRef = useRef(null);

  useEffect(() => {
    const timer = setInterval(() => setCurrentTime(new Date()), 60000);
    return () => clearInterval(timer);
  }, []);

  // Handle click outside to close dropdowns
  useEffect(() => {
    function handleClickOutside(event) {
      if (dropdownRef.current && !dropdownRef.current.contains(event.target)) {
        setIsDropdownOpen(false);
      }
      if (invitesRef.current && !invitesRef.current.contains(event.target)) {
        setIsInvitesOpen(false);
      }
      if (profileRef.current && !profileRef.current.contains(event.target)) {
        setIsProfileOpen(false);
      }
      if (exportRef.current && !exportRef.current.contains(event.target)) {
        setIsExportMenuOpen(false);
      }
    }
    document.addEventListener("mousedown", handleClickOutside);
    return () => document.removeEventListener("mousedown", handleClickOutside);
  }, []);

  // Dismiss Room AI response dropdown on click outside, but preserve the chat content
  useEffect(() => {
    if (!roomAIModal.isOpen) return;
    const handleOutsideClick = (e) => {
      const form = e.target.closest('form');
      if (!form || !form.querySelector('input[placeholder="Ask Room AI anything..."]')) {
        setRoomAIModal(prev => ({ ...prev, isOpen: false }));
        setIsEditingPrompt(false);
        setIsEditingAnswer(false);
      }
    };
    document.addEventListener('mousedown', handleOutsideClick);
    return () => document.removeEventListener('mousedown', handleOutsideClick);
  }, [roomAIModal.isOpen]);

  const handleLaunch = () => {
    onLaunch?.({ type: 'action', name: 'Room' });
  };

  const handleSchedule = () => {
    onLaunch?.({ type: 'schedule', name: 'Room' });
  };

  const handleAISubmit = (e) => {
    e.preventDefault();
    if (!aiPrompt.trim()) return;
    setRoomAIModal({
      isOpen: true,
      prompt: aiPrompt,
      answer: "AI is currently unavailable. Please ensure the backend is running or try again later."
    });
    setAiPrompt(""); // Clears the input immediately for follow-up questions
  };

  const handleInputFocus = () => {
    if (roomAIModal.prompt || roomAIModal.answer) {
      setRoomAIModal(prev => ({ ...prev, isOpen: true }));
    }
  };

  // Inline Actions for AI modal
  const handleSavePrompt = () => {
    setRoomAIModal(prev => ({ ...prev, prompt: editedPromptText }));
    setIsEditingPrompt(false);
  };

  const handleSaveAnswer = () => {
    setRoomAIModal(prev => ({ ...prev, answer: editedAnswerText }));
    setIsEditingAnswer(false);
  };

  const handleDeletePrompt = () => {
    const nextModal = { ...roomAIModal, prompt: "" };
    if (!nextModal.prompt && !nextModal.answer) {
      setRoomAIModal({ isOpen: false, prompt: '', answer: '' });
    } else {
      setRoomAIModal(nextModal);
    }
    setIsEditingPrompt(false);
  };

  const handleDeleteAnswer = () => {
    const nextModal = { ...roomAIModal, answer: "" };
    if (!nextModal.prompt && !nextModal.answer) {
      setRoomAIModal({ isOpen: false, prompt: '', answer: '' });
    } else {
      setRoomAIModal(nextModal);
    }
    setIsEditingAnswer(false);
  };

  const handleDeleteAI = () => {
    setRoomAIModal({ isOpen: false, prompt: '', answer: '' });
    setIsEditingPrompt(false);
    setIsEditingAnswer(false);
  };

  const handleExport = (destination) => {
    setExportStatus(`Exported to ${destination}!`);
    setIsExportMenuOpen(false);
    setTimeout(() => setExportStatus(""), 3000);
  };

  // Check if response is error (meaning no AI detected)
  const isAIUnavailable = roomAIModal.answer && roomAIModal.answer.startsWith("AI is currently unavailable");

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

            {/* Right: Header Icons with Apple aesthetics */}
            <div className="flex items-center gap-4 relative">
              {/* Bell (Invites) */}
              <div className="relative" ref={invitesRef}>
                <button 
                  onClick={() => setIsInvitesOpen(!isInvitesOpen)}
                  className={`p-2.5 rounded-2xl transition-all duration-300 ${isInvitesOpen ? 'bg-slate-100 text-slate-800 shadow-[0_2px_8px_rgba(0,0,0,0.02)]' : 'text-slate-400 hover:bg-slate-50 hover:text-slate-600'}`}
                >
                  <Bell size={16} />
                  {invites.length > 0 && (
                    <span className="absolute top-2.5 right-2.5 w-1.5 h-1.5 bg-slate-400 rounded-full" />
                  )}
                </button>

                {isInvitesOpen && (
                  <div className="absolute top-full right-0 mt-2 w-[340px] bg-white border border-slate-100/80 shadow-[0_16px_40px_rgba(0,0,0,0.06)] rounded-[24px] p-4.5 z-50 animate-in fade-in slide-in-from-top-2">
                    <h3 className="font-semibold text-slate-800 mb-3 px-1 text-[13px] tracking-tight">Invites</h3>
                    <div className="space-y-2 max-h-64 overflow-y-auto thin-scrollbar pr-1">
                      {invites.length === 0 ? (
                        <div className="bg-slate-50/70 rounded-2xl py-8 flex items-center justify-center text-[13px] text-slate-400/80 font-medium">
                          No new invites
                        </div>
                      ) : (
                        invites.map(notif => (
                          <div key={notif.id} className="p-3.5 bg-slate-50/50 rounded-2xl border border-slate-100">
                             <p className="text-[13px] text-slate-700 leading-snug">
                               {notif.sender} invited you to <span className="font-semibold text-slate-800">{notif.title}</span>
                             </p>
                             <p className="text-[11px] text-slate-400 mt-1 mb-3.5">{notif.date} at {notif.time}</p>
                             <div className="flex gap-2">
                               <button 
                                 onClick={() => {
                                   setInvites(invites.filter(i => i.id !== notif.id));
                                   setIsInvitesOpen(false);
                                   alert('Meeting accepted and added to your calendar!');
                                 }} 
                                 className="flex-1 py-2 bg-slate-900 text-white text-[12px] font-semibold rounded-xl hover:bg-slate-800 transition-colors shadow-[0_2px_6px_rgba(0,0,0,0.05)]"
                               >
                                 Accept
                               </button>
                               <button 
                                 onClick={() => {
                                   setInvites(invites.filter(i => i.id !== notif.id));
                                 }} 
                                 className="flex-1 py-2 bg-white text-slate-600 text-[12px] font-semibold rounded-xl border border-slate-200 hover:bg-slate-50 transition-colors"
                               >
                                 Ignore
                               </button>
                             </div>
                          </div>
                        ))
                      )}
                    </div>
                  </div>
                )}
              </div>

              {/* Shield (Distraction Free Mode / Security) */}
              <button 
                onClick={() => setIsDistractionFree(!isDistractionFree)}
                className={`p-2.5 rounded-2xl transition-colors ${isDistractionFree ? 'bg-slate-100 text-slate-800 shadow-[0_2px_8px_rgba(0,0,0,0.02)]' : 'text-slate-400 hover:bg-slate-50 hover:text-slate-600'}`}
                title="Distraction Free Mode"
              >
                <Shield size={16} />
              </button>
              
              {/* User Dropdown */}
              <div className="flex items-center gap-2 pl-3 border-l border-slate-200 cursor-pointer relative" ref={profileRef} onClick={() => setIsProfileOpen(!isProfileOpen)}>
                <div className="relative">
                  <div className="w-8 h-8 rounded-full bg-[#1e293b] text-white flex items-center justify-center font-semibold text-[14px]">
                    Y
                  </div>
                  <span className="absolute bottom-0 right-0 w-2.5 h-2.5 bg-green-500 border-2 border-white rounded-full" />
                </div>
                <ChevronDown size={14} className="text-slate-400 group-hover:text-slate-600 transition-colors" />

                {isProfileOpen && (
                  <div className="absolute top-full right-0 mt-2 w-48 bg-white border border-slate-100 shadow-[0_12px_32px_rgba(0,0,0,0.06)] rounded-[20px] p-2 z-50 animate-in fade-in slide-in-from-top-2">
                    <button className="w-full text-left px-4 py-2 hover:bg-slate-50 rounded-xl text-slate-700 text-[13px] font-medium transition-colors">
                      Profile Settings
                    </button>
                    <button className="w-full text-left px-4 py-2 hover:bg-slate-50 rounded-xl text-slate-700 text-[13px] font-medium transition-colors">
                      Security & Keys
                    </button>
                    <div className="h-[1px] bg-slate-100 my-1" />
                    <button className="w-full text-left px-4 py-2 hover:bg-red-50 text-red-500 rounded-xl text-[13px] font-medium transition-colors">
                      Sign Out
                    </button>
                  </div>
                )}
              </div>
            </div>
          </header>

          {/* Workspace Body Frame */}
          <div className="flex-1 flex gap-6 px-10 pb-8 overflow-hidden relative">
            
            {/* Left Floating Sidebar Navigation - Templates removed as in Image 2 */}
            <aside className="w-[260px] shrink-0 bg-white border border-slate-100 shadow-[0_16px_48px_rgba(0,0,0,0.03)] rounded-[32px] flex flex-col p-6">
              <nav className="flex-1 space-y-1">
                {[
                  { id: "Home", label: "Home", icon: <Home size={16} /> },
                  { id: "Rooms", label: "Rooms", icon: <Hash size={16} /> },
                  { id: "Recordings", label: "Recordings", icon: <PlayCircle size={16} /> },
                  { id: "Calendar", label: "Calendar", icon: <Calendar size={16} /> },
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
              <div className="mt-6 bg-violet-50/30 border border-violet-100/30 rounded-2xl p-4 flex flex-col gap-2 shrink-0">
                <div className="flex items-center gap-1.5">
                  <span className="text-[10px] uppercase font-bold tracking-wider text-slate-400">Room</span>
                  <span className="text-[10px] uppercase font-bold px-1.5 py-0.5 rounded bg-violet-100/80 text-violet-600">Pro</span>
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

            {/* Middle Column (Main Content - Highly Polished Minimalist Viewport) */}
            <main className="flex-1 flex flex-col gap-8 overflow-y-auto px-4 thin-scrollbar pt-6 items-center">
              
              {/* 1. Hero Greeting Area with Generous Spacing */}
              <div className="text-center flex flex-col items-center max-w-xl mb-4">
                <h1 className="text-[36px] font-semibold text-slate-900 tracking-tight leading-none mb-3">
                  Good afternoon, Joshua
                </h1>
                <p className="text-[16px] text-slate-500 font-medium">
                  Ready to collaborate?
                </p>
                <p className="text-[14px] text-slate-400 font-normal mt-1">
                  Create a room or join one with a code.
                </p>
              </div>

              {/* 2. Focused Action Buttons - Compact widths (200px) */}
              <div className="flex gap-4 items-center justify-center shrink-0 w-full max-w-[420px] relative mb-2">
                <div className="w-[200px] relative" ref={dropdownRef}>
                  <button
                    onClick={() => setIsDropdownOpen(!isDropdownOpen)}
                    className="w-full bg-violet-600 hover:bg-violet-700 text-white font-medium py-3 rounded-2xl flex items-center justify-center gap-2 shadow-[0_4px_12px_rgba(124,58,237,0.15)] hover:shadow-[0_8px_20px_rgba(124,58,237,0.25)] transition-all text-[15px]"
                  >
                    <Plus size={16} /> New Room
                  </button>

                  {isDropdownOpen && (
                    <div className="absolute top-full left-0 mt-2 w-[240px] bg-white border border-slate-100 rounded-2xl shadow-[0_12px_40px_rgba(0,0,0,0.06)] overflow-hidden z-30 p-1.5 animate-in fade-in slide-in-from-top-2">
                      <button
                        onClick={() => { setIsDropdownOpen(false); handleLaunch(); }}
                        className="w-full flex items-center gap-3 px-4 py-3 hover:bg-slate-50 rounded-xl text-left transition-colors group"
                      >
                        <div className="w-8 h-8 rounded-full bg-violet-50 flex items-center justify-center text-violet-600 group-hover:scale-105 transition-transform">
                          <Plus size={16} />
                        </div>
                        <div className="flex flex-col">
                          <span className="text-[14px] font-semibold text-slate-800">Start an instant meeting</span>
                          <span className="text-[11px] text-slate-400">Launch a private Room session immediately</span>
                        </div>
                      </button>
                      <button
                        onClick={() => { setIsDropdownOpen(false); handleSchedule(); }}
                        className="w-full flex items-center gap-3 px-4 py-3 hover:bg-slate-50 rounded-xl text-left transition-colors group mt-1"
                      >
                        <div className="w-8 h-8 rounded-full bg-slate-50 flex items-center justify-center text-slate-500 group-hover:scale-105 group-hover:bg-violet-50 group-hover:text-violet-600 transition-transform">
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

                <div className="w-[200px] relative">
                  <input
                    type="text"
                    value={meetingCode}
                    onChange={(e) => setMeetingCode(e.target.value)}
                    placeholder="Join Room"
                    className="w-full bg-white hover:bg-slate-50/50 border border-slate-200 text-slate-700 placeholder:text-slate-400 font-medium py-3 pl-11 pr-12 rounded-2xl text-[15px] focus:outline-none focus:border-violet-400 focus:ring-4 focus:ring-violet-500/10 transition-all text-center shadow-[0_2px_8px_rgba(0,0,0,0.01)]"
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

              {/* 3. AI Search Prompt Input Bar & Response Card */}
              <form onSubmit={handleAISubmit} className="w-full max-w-[560px] relative flex flex-col items-center mb-6">
                <div className="w-full relative flex items-center">
                  <input
                    type="text"
                    value={aiPrompt}
                    onFocus={handleInputFocus}
                    onClick={handleInputFocus}
                    onChange={(e) => setAiPrompt(e.target.value)}
                    placeholder="Ask Room AI anything..."
                    className="w-full bg-white hover:bg-slate-50/50 border border-slate-100 text-slate-800 placeholder:text-slate-400 font-medium py-3.5 pl-12 pr-14 rounded-full text-[14px] focus:outline-none focus:ring-2 focus:ring-violet-500/10 transition-all shadow-[0_8px_30px_rgba(0,0,0,0.015)]"
                  />
                  <span className="absolute left-5 text-violet-500 text-[15px]">✦</span>
                  <button type="submit" className="absolute right-2.5 w-9 h-9 bg-slate-50 text-violet-600 rounded-full flex items-center justify-center hover:bg-violet-50 transition-colors">
                    <Send size={13} />
                  </button>
                </div>

                {exportStatus && (
                  <div className="absolute top-12 bg-slate-900 text-white text-[12px] font-semibold px-4.5 py-2 rounded-xl shadow-lg z-50 animate-in fade-in zoom-in-95 duration-200">
                    {exportStatus}
                  </div>
                )}

                {roomAIModal.isOpen && (roomAIModal.prompt || roomAIModal.answer) && (
                  <div className="w-full mt-4 bg-white/95 backdrop-blur-3xl rounded-[24px] p-6 shadow-[0_16px_48px_rgba(0,0,0,0.03)] border border-slate-100/80 flex flex-col gap-3 animate-in slide-in-from-top-2 fade-in duration-300 pointer-events-auto relative">
                    
                    {/* Top Action Toolbar */}
                    <div className="flex items-center justify-between">
                      <span className="text-[12px] font-bold text-slate-400 uppercase tracking-wider">Saved Interaction</span>
                      
                      <div className="flex items-center gap-2">
                        {/* Export Button */}
                        <div className="relative" ref={exportRef}>
                          <button 
                            type="button"
                            onClick={() => setIsExportMenuOpen(!isExportMenuOpen)}
                            className="p-1.5 rounded-lg text-slate-400 hover:bg-slate-50 hover:text-slate-700 transition-colors flex items-center gap-1 text-[12px] font-medium"
                            title="Export Response"
                          >
                            <Download size={13} />
                            <span>Export</span>
                          </button>
                          
                          {isExportMenuOpen && (
                            <div className="absolute bottom-full right-0 mb-1 w-44 bg-white border border-slate-100 shadow-[0_12px_24px_rgba(0,0,0,0.08)] rounded-xl p-1 z-50 animate-in fade-in slide-in-from-bottom-1">
                              <button 
                                type="button" 
                                onClick={() => handleExport("Shared Notes")}
                                className="w-full text-left px-3 py-2 hover:bg-slate-50 rounded-lg text-slate-700 text-[12px] font-medium transition-colors"
                              >
                                Export to Shared Notes
                              </button>
                              <button 
                                type="button" 
                                onClick={() => handleExport("Clipboard")}
                                className="w-full text-left px-3 py-2 hover:bg-slate-50 rounded-lg text-slate-700 text-[12px] font-medium transition-colors"
                              >
                                Copy to Clipboard
                              </button>
                            </div>
                          )}
                        </div>

                        {/* Delete All Button */}
                        <button
                          type="button"
                          onClick={handleDeleteAI}
                          className="p-1.5 rounded-lg text-slate-400 hover:bg-slate-50 hover:text-red-500 transition-colors"
                          title="Delete Chat"
                        >
                          <Trash2 size={13} />
                        </button>
                      </div>
                    </div>

                    {/* Prompt Section (Actions only show on hover) */}
                    {roomAIModal.prompt && (
                      <div className="flex flex-col gap-1 group relative">
                        <div className="flex items-center justify-between">
                          <span className="text-[11px] font-semibold text-violet-500 bg-violet-50 px-2 py-0.5 rounded-md">Prompt</span>
                          
                          <div className="flex items-center gap-2 opacity-0 group-hover:opacity-100 transition-opacity">
                            {!isEditingPrompt ? (
                              <>
                                <button
                                  type="button"
                                  onClick={() => { setEditedPromptText(roomAIModal.prompt); setIsEditingPrompt(true); }}
                                  className="text-[11px] font-medium text-slate-400 hover:text-slate-600 flex items-center gap-1"
                                >
                                  <Edit2 size={10} /> Edit
                                </button>
                                <button
                                  type="button"
                                  onClick={handleDeletePrompt}
                                  className="text-[11px] font-medium text-red-400 hover:text-red-600 flex items-center gap-1"
                                >
                                  <Trash2 size={10} /> Delete
                                </button>
                              </>
                            ) : (
                              <button
                                type="button"
                                onClick={handleSavePrompt}
                                className="text-[11px] font-semibold text-green-600 hover:text-green-700 flex items-center gap-1"
                              >
                                <Check size={11} /> Save
                              </button>
                            )}
                          </div>
                        </div>

                        {isEditingPrompt ? (
                          <input
                            type="text"
                            value={editedPromptText}
                            onChange={(e) => setEditedPromptText(e.target.value)}
                            className="w-full bg-slate-50 border border-slate-200 text-slate-800 text-[14px] font-medium py-1.5 px-3 rounded-lg focus:outline-none focus:border-violet-300"
                          />
                        ) : (
                          <p className="text-[14px] text-slate-700 font-medium px-1">{roomAIModal.prompt}</p>
                        )}
                      </div>
                    )}

                    {roomAIModal.prompt && roomAIModal.answer && <div className="h-[1px] w-full bg-slate-100 my-0.5"></div>}

                    {/* Answer Section (Actions only show on hover, and Edit only if AI is detected / no error) */}
                    {roomAIModal.answer && (
                      <div className="flex flex-col gap-1 group relative">
                        <div className="flex items-center justify-between">
                          <div className="flex items-center gap-1.5">
                            <Sparkles size={13} className="text-violet-500" />
                            <span className="text-[11px] font-semibold text-slate-500">Room AI</span>
                          </div>
                          
                          <div className="flex items-center gap-2 opacity-0 group-hover:opacity-100 transition-opacity">
                            {!isEditingAnswer ? (
                              <>
                                {!isAIUnavailable && (
                                  <button
                                    type="button"
                                    onClick={() => { setEditedAnswerText(roomAIModal.answer); setIsEditingAnswer(true); }}
                                    className="text-[11px] font-medium text-slate-400 hover:text-slate-600 flex items-center gap-1"
                                  >
                                    <Edit2 size={10} /> Edit
                                  </button>
                                )}
                                <button
                                  type="button"
                                  onClick={handleDeleteAnswer}
                                  className="text-[11px] font-medium text-red-400 hover:text-red-600 flex items-center gap-1"
                                >
                                  <Trash2 size={10} /> Delete
                                </button>
                              </>
                            ) : (
                              <button
                                type="button"
                                onClick={handleSaveAnswer}
                                className="text-[11px] font-semibold text-green-600 hover:text-green-700 flex items-center gap-1"
                              >
                                <Check size={11} /> Save
                              </button>
                            )}
                          </div>
                        </div>

                        {isEditingAnswer ? (
                          <textarea
                            value={editedAnswerText}
                            onChange={(e) => setEditedAnswerText(e.target.value)}
                            rows={3}
                            className="w-full bg-slate-50 border border-slate-200 text-slate-600 text-[14px] leading-relaxed p-2.5 rounded-lg focus:outline-none focus:border-violet-300 font-sans resize-none"
                          />
                        ) : (
                          <p className="text-[14px] text-slate-600 leading-relaxed px-1 whitespace-pre-wrap">{roomAIModal.answer}</p>
                        )}
                      </div>
                    )}

                  </div>
                )}
              </form>

              {/* 4. Upcoming Section */}
              <section className="w-full max-w-[640px] flex flex-col gap-3 shrink-0">
                <h2 className="text-[14px] font-semibold text-slate-800 tracking-tight px-1">Upcoming Today</h2>
                
                <div className="bg-white border border-slate-100/80 rounded-2xl p-4 flex justify-between items-center shadow-[0_8px_30px_rgba(0,0,0,0.015)]">
                  <div className="flex items-center gap-4 min-w-0">
                    <div className="w-10 h-10 rounded-xl bg-violet-50 text-violet-600 flex items-center justify-center shrink-0 border border-violet-100/30">
                      <Calendar size={18} />
                    </div>
                    <div className="min-w-0">
                      <div className="text-[14px] font-semibold text-slate-800 leading-snug truncate">Marketing Review</div>
                      <div className="text-[12px] text-slate-400 font-medium mt-0.5">3:00 PM • 30 min</div>
                    </div>
                  </div>

                  <div className="flex items-center gap-4 shrink-0">
                    {/* Avatars */}
                    <div className="flex -space-x-1.5">
                      {["J", "S", "M"].map((av, avIdx) => (
                        <div key={avIdx} className="w-6 h-6 rounded-full bg-slate-100 border-2 border-white flex items-center justify-center text-[10px] font-semibold text-slate-600 shadow-sm">
                          {av}
                        </div>
                      ))}
                      <div className="w-6 h-6 rounded-full bg-violet-100 border-2 border-white flex items-center justify-center text-[9px] font-bold text-violet-600 shadow-sm">
                        +3
                      </div>
                    </div>
                    
                    <button
                      onClick={handleLaunch}
                      className="px-5 py-1.5 bg-slate-50 hover:bg-slate-100 border border-slate-200/60 text-[13px] font-semibold text-violet-600 rounded-full transition-all"
                    >
                      Join
                    </button>
                    
                    <button className="p-1 rounded-full text-slate-400 hover:bg-slate-50 hover:text-slate-700 transition-colors">
                      <MoreHorizontal size={14} />
                    </button>
                  </div>
                </div>
              </section>

              {/* 5. Recent Section */}
              <section className="w-full max-w-[640px] flex flex-col gap-3 shrink-0">
                <h2 className="text-[14px] font-semibold text-slate-800 tracking-tight px-1">Recent</h2>

                <div className="flex flex-col bg-white border border-slate-100/80 rounded-2xl overflow-hidden shadow-[0_8px_30px_rgba(0,0,0,0.015)]">
                  {[
                    { name: "Product Sync", time: "Yesterday", users: "8 participants", recording: true, ai: true, color: "bg-emerald-50 text-emerald-500 border-emerald-100" },
                    { name: "Design Review", time: "Today", users: "5 participants", recording: false, ai: true, color: "bg-blue-50 text-blue-500 border-blue-100" }
                  ].map((room, idx) => (
                    <div key={idx} className="flex justify-between items-center p-4 hover:bg-slate-50/50 transition-all cursor-pointer border-b border-slate-50 last:border-none">
                      <div className="flex items-center gap-3 min-w-0">
                        <div className={`w-8 h-8 rounded-xl ${room.color} flex items-center justify-center shrink-0 border`}>
                          <Users size={14} />
                        </div>
                        <div className="min-w-0">
                          <div className="text-[14px] font-semibold text-slate-800 truncate leading-snug">{room.name}</div>
                          <div className="text-[11px] text-slate-400 truncate mt-0.5">{room.time} • {room.users}</div>
                        </div>
                      </div>

                      <div className="flex items-center gap-4 shrink-0">
                        <div className="flex gap-2">
                          {room.recording && (
                            <span className="flex items-center gap-1.5 text-[10px] font-semibold px-2 py-0.5 rounded bg-red-50 text-red-500 border border-red-100">
                              <span className="w-1.5 h-1.5 rounded-full bg-red-500 animate-pulse" />
                              Recording
                            </span>
                          )}
                          {room.ai && (
                            <span className="flex items-center gap-1.5 text-[10px] font-semibold px-2 py-0.5 rounded bg-violet-50 text-violet-500 border border-violet-100">
                              ✦ AI Summary
                            </span>
                          )}
                        </div>

                        <button
                          onClick={handleLaunch}
                          className="text-[13px] font-semibold text-violet-600 hover:text-violet-700"
                        >
                          Resume
                        </button>
                        
                        <button className="p-1 rounded-full text-slate-400 hover:bg-slate-50 hover:text-slate-700 transition-colors">
                          <MoreHorizontal size={14} />
                        </button>
                      </div>
                    </div>
                  ))}
                </div>

                <button className="text-[13px] font-medium text-slate-400 hover:text-violet-600 transition-colors flex items-center justify-center gap-0.5 mt-2">
                  View all rooms →
                </button>
              </section>

            </main>

            {/* Right Floating Panel (Activity Feed) */}
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
                  { text: "AI summary ready", project: "Design Review", time: "3h ago", icon: <span className="text-[12px]">✦</span>, color: "bg-violet-50 text-violet-500" },
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
                      <div className="text-[11px] text-slate-400 font-medium mt-0.5">{activity.project}</div>
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
