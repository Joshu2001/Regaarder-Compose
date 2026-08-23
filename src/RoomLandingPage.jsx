import React, { useState, useEffect, useRef } from "react";
import {
  Video, VideoOff, Mic, MicOff, Calendar, Settings, Plus, Users, UserPlus, Hash, Bell, Shield, ChevronDown, ChevronRight,
  MoreHorizontal, MessageSquare, Layout, X, Keyboard, Send, Check, Download,
  Maximize2, Minimize2, Share2, PhoneOff, Search, Sparkles
} from "lucide-react";
import { RoomIcon, RegaarderAiIcon } from "./components/RegaarderProductIcons";

/**
 * Pixel-Perfect Room Workspace with Unified Ambient Lobby
 *
 * Implements the Apple-tier design specified in Image 2:
 * - Room lobby uses the exact same visual environment as the active Room interface
 * - Background displays the complete Room workspace with soft blur & desaturation during lobby state
 * - Centered premium glassmorphism card with "Welcome to Room"
 * - Primary Action: "Start an instant meeting" (Purple theme)
 * - Secondary Action: "Enter room code" (Join with code affordance)
 * - Preserves Header, People panel, Chat panel, Call controls, and AI prompt bar
 * - Smooth transition from lobby into active meeting workspace
 */
export default function RoomLandingPage({ onLaunch, showToast }) {
  // Lobby State
  const [isLobby, setIsLobby] = useState(true);
  const [isEnteringCode, setIsEnteringCode] = useState(false);
  const [isMeetingOptionsOpen, setIsMeetingOptionsOpen] = useState(false);
  const [roomCodeInput, setRoomCodeInput] = useState("");

  // Meeting Room Interactive States
  const [roomName, setRoomName] = useState("Product Sync");
  const [isRoomNameMenuOpen, setIsRoomNameMenuOpen] = useState(false);
  const [isCameraOn, setIsCameraOn] = useState(false);
  const [isMicOn, setIsMicOn] = useState(false);
  const [isScreenSharing, setIsScreenSharing] = useState(false);
  const [isRecording, setIsRecording] = useState(false);
  const [isVideoExpanded, setIsVideoExpanded] = useState(false);

  // Panels
  const [isPeopleOpen, setIsPeopleOpen] = useState(true);
  const [isChatOpen, setIsChatOpen] = useState(true);
  const [chatTab, setChatTab] = useState("everyone"); // 'everyone' | 'direct'
  const [chatMessage, setChatMessage] = useState("");
  const [chatMessages, setChatMessages] = useState([]);
  const [searchPeopleQuery, setSearchPeopleQuery] = useState("");

  // AI Prompt bar
  const [aiPrompt, setAiPrompt] = useState("");
  const [roomAIResponse, setRoomAIResponse] = useState(null);
  const [isAIModalOpen, setIsAIModalOpen] = useState(false);

  // Modals & Popovers
  const [isInviteModalOpen, setIsInviteModalOpen] = useState(false);
  const [isInvitesListOpen, setIsInvitesListOpen] = useState(false);
  const [isMoreMenuOpen, setIsMoreMenuOpen] = useState(false);

  const roomNameRef = useRef(null);
  const invitesRef = useRef(null);
  const moreMenuRef = useRef(null);
  const codeInputRef = useRef(null);

  // Handle outside clicks
  useEffect(() => {
    function handleClickOutside(e) {
      if (roomNameRef.current && !roomNameRef.current.contains(e.target)) {
        setIsRoomNameMenuOpen(false);
      }
      if (invitesRef.current && !invitesRef.current.contains(e.target)) {
        setIsInvitesListOpen(false);
      }
      if (moreMenuRef.current && !moreMenuRef.current.contains(e.target)) {
        setIsMoreMenuOpen(false);
      }
    }
    document.addEventListener("mousedown", handleClickOutside);
    return () => document.removeEventListener("mousedown", handleClickOutside);
  }, []);

  // Auto focus code input when expanding
  useEffect(() => {
    if (isEnteringCode && codeInputRef.current) {
      codeInputRef.current.focus();
    }
  }, [isEnteringCode]);

  // Actions
  const handleStartInstantMeeting = () => {
    setIsLobby(false);
    showToast?.("Started instant meeting in Product Sync!");
    onLaunch?.({ type: 'action', name: 'Room' });
  };

  const handleJoinWithCode = (e) => {
    e?.preventDefault();
    if (!roomCodeInput.trim()) return;
    const cleanCode = roomCodeInput.trim().toUpperCase();
    setRoomName(`Room ${cleanCode}`);
    setIsLobby(false);
    setIsEnteringCode(false);
    showToast?.(`Joined Room ${cleanCode}!`);
    onLaunch?.({ type: 'action', name: 'Room', code: cleanCode });
  };

  const handleEndCall = () => {
    setIsLobby(true);
    setIsEnteringCode(false);
    setRoomCodeInput("");
    showToast?.("Left the room. Returned to lobby.");
  };

  const handleSendMessage = (e) => {
    e.preventDefault();
    if (!chatMessage.trim()) return;
    setChatMessages(prev => [
      ...prev,
      { id: Date.now(), sender: "You", text: chatMessage.trim(), time: new Date().toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' }) }
    ]);
    setChatMessage("");
  };

  const handleAISubmit = (e) => {
    e.preventDefault();
    if (!aiPrompt.trim()) return;
    setRoomAIResponse({
      prompt: aiPrompt,
      answer: "Meeting AI analysis synchronized. Audio stream transcribed with zero latency."
    });
    setIsAIModalOpen(true);
    setAiPrompt("");
  };

  return (
    <div className="w-full h-full relative bg-[#F9F8F6] dark:bg-zinc-950 bg-[radial-gradient(ellipse_at_center,_var(--tw-gradient-stops))] from-[#FFFDFB] via-[#F9F8F6] to-[#F1F0EE] dark:from-zinc-900 dark:via-zinc-950 dark:to-black flex flex-col items-center justify-center font-sans overflow-hidden select-none p-2 md:p-4">
      {/* Subtle vignette glow */}
      <div className="absolute inset-0 bg-black/[0.02] dark:bg-white/[0.01] pointer-events-none" />

      {/* Main Apple-Tier Floating Window Container */}
      <div className="w-full h-full relative flex items-center justify-center max-w-[1640px] z-10">
        <div className="w-full h-full backdrop-blur-[60px] flex flex-col overflow-hidden relative transition-all duration-500 shadow-[0_32px_120px_rgba(0,0,0,0.04)] bg-white/70 dark:bg-zinc-900/80 border border-white/60 dark:border-zinc-800 rounded-[40px]">
          
          {/* ========================================================================= */}
          {/* ROOM WORKSPACE (Rendered in background, blurred when isLobby is true)     */}
          {/* ========================================================================= */}
          <div className={`w-full h-full flex flex-col transition-all duration-500 ${
            isLobby 
              ? 'filter blur-[7px] grayscale-[25%] opacity-75 scale-[0.995] pointer-events-none' 
              : 'filter blur-0 grayscale-0 opacity-100 scale-100 pointer-events-auto'
          }`}>
            
            {/* Top Header Bar */}
            <header className="h-[68px] flex items-center justify-between px-7 border-b border-slate-100/80 dark:border-zinc-800/80 bg-transparent shrink-0 relative z-20">
              {/* Left: Brand + Room Selector Dropdown + Participant Count Badge */}
              <div className="flex items-center gap-3">
                <div className="flex items-center gap-2 select-none cursor-default">
                  <RoomIcon size={20} strokeWidth={1.8} className="text-violet-600 dark:text-violet-400" />
                  <span className="text-base font-semibold text-violet-600 dark:text-violet-400 tracking-tight">Room</span>
                </div>

                <div className="relative" ref={roomNameRef}>
                  <button 
                    onClick={() => setIsRoomNameMenuOpen(!isRoomNameMenuOpen)}
                    className="flex items-center gap-1.5 px-2.5 py-1 rounded-xl text-xs font-semibold text-slate-800 dark:text-zinc-200 hover:bg-slate-100/80 dark:hover:bg-zinc-800 transition-colors"
                  >
                    <span>{roomName}</span>
                    <ChevronDown size={13} className="text-slate-400 dark:text-zinc-500" />
                  </button>

                  {isRoomNameMenuOpen && (
                    <div className="absolute top-full left-0 mt-1.5 w-48 bg-white dark:bg-zinc-900 border border-slate-200 dark:border-zinc-800 shadow-xl rounded-2xl p-1.5 z-50 animate-in fade-in zoom-in-95 duration-150">
                      <button 
                        onClick={() => { setRoomName("Product Sync"); setIsRoomNameMenuOpen(false); }}
                        className="w-full text-left px-3 py-1.5 hover:bg-slate-50 dark:hover:bg-zinc-800 rounded-xl text-xs font-medium text-slate-700 dark:text-zinc-300 transition-colors"
                      >
                        Product Sync
                      </button>
                      <button 
                        onClick={() => { setRoomName("Design Review"); setIsRoomNameMenuOpen(false); }}
                        className="w-full text-left px-3 py-1.5 hover:bg-slate-50 dark:hover:bg-zinc-800 rounded-xl text-xs font-medium text-slate-700 dark:text-zinc-300 transition-colors"
                      >
                        Design Review
                      </button>
                      <button 
                        onClick={() => { setRoomName("Sprint Planning"); setIsRoomNameMenuOpen(false); }}
                        className="w-full text-left px-3 py-1.5 hover:bg-slate-50 dark:hover:bg-zinc-800 rounded-xl text-xs font-medium text-slate-700 dark:text-zinc-300 transition-colors"
                      >
                        Sprint Planning
                      </button>
                    </div>
                  )}
                </div>

                <div className="flex items-center gap-1 px-2.5 py-0.5 bg-slate-100/80 dark:bg-zinc-800/80 border border-slate-200/50 dark:border-zinc-700/60 rounded-full text-xs font-semibold text-slate-600 dark:text-zinc-300">
                  <Users size={12} className="text-slate-400 dark:text-zinc-400" />
                  <span>1</span>
                </div>
              </div>

              {/* Right Header Actions */}
              <div className="flex items-center gap-2.5">
                {/* Bell / Invites */}
                <div className="relative" ref={invitesRef}>
                  <button 
                    onClick={() => setIsInvitesListOpen(!isInvitesListOpen)}
                    className="p-2 rounded-xl text-slate-400 hover:text-slate-600 dark:hover:text-zinc-200 hover:bg-slate-100/70 dark:hover:bg-zinc-800 transition-colors"
                    title="Notifications"
                  >
                    <Bell size={15} />
                  </button>

                  {isInvitesListOpen && (
                    <div className="absolute top-full right-0 mt-2 w-72 bg-white dark:bg-zinc-900 border border-slate-200 dark:border-zinc-800 shadow-xl rounded-2xl p-3 z-50 animate-in fade-in zoom-in-95 duration-150 text-left">
                      <h4 className="text-xs font-semibold text-slate-800 dark:text-zinc-200 mb-2">Notifications</h4>
                      <p className="text-[11px] text-slate-400 dark:text-zinc-500 py-3 text-center">No new meeting notifications</p>
                    </div>
                  )}
                </div>

                {/* Shield */}
                <button 
                  onClick={() => showToast?.("End-to-end encrypted room session.")}
                  className="p-2 rounded-xl text-slate-400 hover:text-slate-600 dark:hover:text-zinc-200 hover:bg-slate-100/70 dark:hover:bg-zinc-800 transition-colors"
                  title="Encryption Status"
                >
                  <Shield size={15} />
                </button>

                {/* Recording Status Pill */}
                <button 
                  onClick={() => {
                    setIsRecording(!isRecording);
                    showToast?.(isRecording ? "Recording stopped." : "Cloud recording started.");
                  }}
                  className="flex items-center gap-1.5 px-3 py-1 bg-slate-100/80 dark:bg-zinc-800/80 hover:bg-slate-200/80 dark:hover:bg-zinc-700 border border-slate-200/60 dark:border-zinc-700/80 rounded-full text-xs text-slate-600 dark:text-zinc-300 font-medium transition-colors"
                >
                  <span className={`w-2 h-2 rounded-full ${isRecording ? 'bg-red-500 animate-pulse' : 'bg-slate-400 dark:bg-zinc-500'}`} />
                  <span>{isRecording ? "Recording" : "Not recording"}</span>
                </button>

                {/* Fullscreen / Expand Button */}
                <button 
                  onClick={() => setIsVideoExpanded(!isVideoExpanded)}
                  className="w-7 h-7 rounded-full bg-violet-100 dark:bg-violet-950/80 text-violet-600 dark:text-violet-300 flex items-center justify-center hover:bg-violet-200 dark:hover:bg-violet-900 transition-colors shadow-2xs"
                  title="Toggle Layout"
                >
                  <Maximize2 size={13} />
                </button>

                {/* More Options */}
                <div className="relative" ref={moreMenuRef}>
                  <button 
                    onClick={() => setIsMoreMenuOpen(!isMoreMenuOpen)}
                    className="p-1.5 rounded-xl text-slate-400 hover:text-slate-600 dark:hover:text-zinc-200 hover:bg-slate-100/70 dark:hover:bg-zinc-800 transition-colors"
                  >
                    <MoreHorizontal size={16} />
                  </button>

                  {isMoreMenuOpen && (
                    <div className="absolute top-full right-0 mt-2 w-48 bg-white dark:bg-zinc-900 border border-slate-200 dark:border-zinc-800 shadow-xl rounded-2xl p-1.5 z-50 animate-in fade-in zoom-in-95 duration-150 text-left">
                      <button 
                        onClick={() => { setIsMoreMenuOpen(false); showToast?.("Meeting link copied to clipboard!"); }}
                        className="w-full text-left px-3 py-1.5 hover:bg-slate-50 dark:hover:bg-zinc-800 rounded-xl text-xs font-medium text-slate-700 dark:text-zinc-300 transition-colors"
                      >
                        Copy Meeting Link
                      </button>
                      <button 
                        onClick={() => { setIsMoreMenuOpen(false); setIsInviteModalOpen(true); }}
                        className="w-full text-left px-3 py-1.5 hover:bg-slate-50 dark:hover:bg-zinc-800 rounded-xl text-xs font-medium text-slate-700 dark:text-zinc-300 transition-colors"
                      >
                        Invite Collaborators
                      </button>
                      <div className="h-[1px] bg-slate-100 dark:bg-zinc-800 my-1" />
                      <button 
                        onClick={() => { setIsMoreMenuOpen(false); handleEndCall(); }}
                        className="w-full text-left px-3 py-1.5 hover:bg-rose-50 dark:hover:bg-rose-950/50 text-rose-600 dark:text-rose-400 rounded-xl text-xs font-medium transition-colors"
                      >
                        Leave Room
                      </button>
                    </div>
                  )}
                </div>
              </div>
            </header>

            {/* Workspace Main Body Frame */}
            <div className="flex-1 flex gap-5 p-6 overflow-hidden relative items-stretch">
              
              {/* 1. Left Sidebar: People Panel */}
              {isPeopleOpen && (
                <aside className="w-[250px] shrink-0 bg-white/80 dark:bg-zinc-900/80 backdrop-blur-xl border border-slate-200/70 dark:border-zinc-800 rounded-[28px] p-4 flex flex-col shadow-xs transition-all animate-in fade-in duration-200 text-left">
                  <div className="flex items-center justify-between mb-3 px-1">
                    <div className="flex items-center gap-2">
                      <span className="text-xs font-bold text-slate-900 dark:text-zinc-100">People</span>
                      <span className="px-1.5 py-0.2 rounded-full bg-slate-100 dark:bg-zinc-800 text-[10px] font-semibold text-slate-500">1</span>
                    </div>
                    <button 
                      onClick={() => setIsPeopleOpen(false)}
                      className="p-1 rounded-lg text-slate-400 hover:text-slate-600 dark:hover:text-zinc-200 transition-colors"
                    >
                      <X size={13} />
                    </button>
                  </div>

                  {/* Search People */}
                  <div className="relative mb-3">
                    <Search size={13} className="absolute left-3 top-1/2 -translate-y-1/2 text-slate-400" />
                    <input 
                      type="text"
                      value={searchPeopleQuery}
                      onChange={(e) => setSearchPeopleQuery(e.target.value)}
                      placeholder="Search people"
                      className="w-full pl-8 pr-3 py-1.5 bg-slate-100/70 dark:bg-zinc-800/70 text-xs rounded-xl border-none placeholder-slate-400 dark:placeholder-zinc-500 focus:outline-none focus:ring-1 focus:ring-slate-300"
                    />
                  </div>

                  {/* Self User Item */}
                  <div className="flex items-center justify-between p-2 rounded-2xl bg-slate-50/80 dark:bg-zinc-800/50 mb-2">
                    <div className="flex items-center gap-2.5 min-w-0">
                      <div className="w-7 h-7 rounded-full bg-violet-600 text-white flex items-center justify-center text-xs font-bold shrink-0">
                        Y
                      </div>
                      <div className="min-w-0">
                        <div className="text-xs font-semibold text-slate-900 dark:text-zinc-100 leading-tight">You</div>
                        <div className="text-[10px] text-slate-400 dark:text-zinc-500 mt-0.5">{isCameraOn ? "Camera on" : "Camera off"}</div>
                      </div>
                    </div>
                    {isMicOn ? (
                      <Mic size={13} className="text-emerald-500 shrink-0" />
                    ) : (
                      <MicOff size={13} className="text-violet-500 dark:text-violet-400 shrink-0" />
                    )}
                  </div>

                  {/* Empty State */}
                  <div className="flex-1 flex flex-col items-center justify-center text-center px-2 py-4">
                    <div className="w-10 h-10 rounded-2xl bg-slate-100/80 dark:bg-zinc-800 flex items-center justify-center text-slate-400 dark:text-zinc-500 mb-2">
                      <Users size={18} strokeWidth={1.5} />
                    </div>
                    <span className="text-xs font-semibold text-slate-800 dark:text-zinc-200">You're the only one here</span>
                    <p className="text-[11px] text-slate-400 dark:text-zinc-500 mt-1 max-w-[170px] leading-relaxed">
                      Share the meeting link to invite others.
                    </p>
                    <button 
                      onClick={() => setIsInviteModalOpen(true)}
                      className="mt-2.5 text-xs font-semibold text-slate-600 dark:text-zinc-400 hover:text-violet-600 dark:hover:text-violet-400 flex items-center gap-1 transition-colors"
                    >
                      <UserPlus size={12} />
                      <span>Invite people</span>
                    </button>
                  </div>

                  {/* Bottom Invite CTA */}
                  <button 
                    onClick={() => setIsInviteModalOpen(true)}
                    className="w-full py-2 bg-violet-50/80 dark:bg-violet-950/40 hover:bg-violet-100 text-violet-600 dark:text-violet-400 rounded-2xl text-xs font-semibold flex items-center justify-center gap-1.5 transition-colors shadow-2xs active:scale-95"
                  >
                    <UserPlus size={13} />
                    <span>Invite people</span>
                  </button>
                </aside>
              )}

              {/* 2. Middle Column: Meeting Stage Viewport & Controls */}
              <main className="flex-1 flex flex-col items-center justify-between min-w-0 relative">
                
                {/* Main Video Canvas Stage */}
                <div className="w-full flex-1 flex items-center justify-center relative min-h-[300px]">
                  <div className="w-full max-w-[580px] aspect-[4/3] bg-slate-200/60 dark:bg-zinc-800/60 backdrop-blur-md rounded-[32px] border border-slate-300/40 dark:border-zinc-700/60 shadow-inner relative flex items-center justify-center overflow-hidden transition-all duration-300">
                    
                    {/* User Avatar Presentation Tile */}
                    {isCameraOn ? (
                      <div className="w-full h-full bg-slate-900 flex items-center justify-center text-white text-xs font-mono">
                        [Active Camera Video Feed]
                      </div>
                    ) : (
                      <div className="w-28 h-28 rounded-full bg-gradient-to-tr from-slate-900 to-slate-800 text-white flex items-center justify-center text-4xl font-bold shadow-xl border-2 border-white/20 select-none">
                        Y
                      </div>
                    )}

                    {/* Stage Overlay Expand / Maximize Button */}
                    <button 
                      onClick={() => setIsVideoExpanded(!isVideoExpanded)}
                      className="absolute top-4 right-4 p-2 rounded-full bg-black/20 text-white hover:bg-black/30 backdrop-blur-md transition-all border border-white/10"
                    >
                      <Maximize2 size={13} />
                    </button>

                    {/* Microphone Status Pill */}
                    <div className="absolute bottom-4 left-4 flex items-center gap-2 bg-black/20 backdrop-blur-md px-3 py-1.5 rounded-full text-white text-xs border border-white/10">
                      {isMicOn ? (
                        <div className="flex items-baseline gap-0.5 h-3">
                          <span className="w-1 bg-emerald-400 rounded-full h-3 animate-pulse" />
                          <span className="w-1 bg-emerald-400 rounded-full h-2 animate-pulse delay-75" />
                          <span className="w-1 bg-emerald-400 rounded-full h-3 animate-pulse delay-150" />
                        </div>
                      ) : (
                        <MicOff size={12} className="text-red-400" />
                      )}
                      <span className="text-[11px] font-medium">Joshua (You)</span>
                    </div>
                  </div>
                </div>

                {/* Floating Bottom Call Control Pill Bar */}
                <div className="flex flex-col items-center gap-3 w-full shrink-0">
                  <div className="bg-white/95 dark:bg-zinc-900/95 backdrop-blur-2xl border border-white/80 dark:border-zinc-800 shadow-xl rounded-full px-5 py-2.5 flex items-center gap-3.5">
                    {/* Mic Toggle */}
                    <button 
                      onClick={() => {
                        setIsMicOn(!isMicOn);
                        showToast?.(isMicOn ? "Microphone muted." : "Microphone unmuted.");
                      }}
                      className={`p-2.5 rounded-full transition-all active:scale-95 ${
                        isMicOn 
                          ? 'bg-slate-100 dark:bg-zinc-800 text-slate-800 dark:text-zinc-200' 
                          : 'bg-slate-100/70 dark:bg-zinc-800/70 text-slate-600 dark:text-zinc-400 hover:bg-slate-200'
                      }`}
                      title={isMicOn ? "Mute Microphone" : "Unmute Microphone"}
                    >
                      {isMicOn ? <Mic size={16} /> : <MicOff size={16} />}
                    </button>

                    {/* Camera Toggle */}
                    <button 
                      onClick={() => {
                        setIsCameraOn(!isCameraOn);
                        showToast?.(isCameraOn ? "Camera turned off." : "Camera turned on.");
                      }}
                      className={`p-2.5 rounded-full transition-all active:scale-95 ${
                        isCameraOn 
                          ? 'bg-slate-100 dark:bg-zinc-800 text-slate-800 dark:text-zinc-200' 
                          : 'bg-rose-50 dark:bg-rose-950/50 text-rose-500 hover:bg-rose-100'
                      }`}
                      title={isCameraOn ? "Turn off Camera" : "Turn on Camera"}
                    >
                      {isCameraOn ? <Video size={16} /> : <VideoOff size={16} />}
                    </button>

                    {/* Screen Share */}
                    <button 
                      onClick={() => {
                        setIsScreenSharing(!isScreenSharing);
                        showToast?.(isScreenSharing ? "Screen sharing ended." : "Screen share active.");
                      }}
                      className={`p-2.5 rounded-full transition-all active:scale-95 ${
                        isScreenSharing 
                          ? 'bg-violet-100 dark:bg-violet-950 text-violet-600 dark:text-violet-300' 
                          : 'hover:bg-slate-100 dark:hover:bg-zinc-800 text-slate-600 dark:text-zinc-400'
                      }`}
                      title="Share Screen"
                    >
                      <Share2 size={16} />
                    </button>

                    {/* Layout Toggles */}
                    <button 
                      onClick={() => setIsPeopleOpen(!isPeopleOpen)}
                      className={`p-2.5 rounded-full transition-all active:scale-95 ${
                        isPeopleOpen 
                          ? 'bg-slate-100 dark:bg-zinc-800 text-slate-800 dark:text-zinc-200' 
                          : 'hover:bg-slate-100 dark:hover:bg-zinc-800 text-slate-400'
                      }`}
                      title="Toggle People Panel"
                    >
                      <Users size={16} />
                    </button>

                    <button 
                      onClick={() => setIsChatOpen(!isChatOpen)}
                      className={`p-2.5 rounded-full transition-all active:scale-95 ${
                        isChatOpen 
                          ? 'bg-slate-100 dark:bg-zinc-800 text-slate-800 dark:text-zinc-200' 
                          : 'hover:bg-slate-100 dark:hover:bg-zinc-800 text-slate-400'
                      }`}
                      title="Toggle Chat Panel"
                    >
                      <MessageSquare size={16} />
                    </button>

                    {/* End Call Button */}
                    <button 
                      onClick={handleEndCall}
                      className="p-2.5 rounded-full bg-rose-500 hover:bg-rose-600 text-white shadow-md transition-all active:scale-90"
                      title="Leave Room"
                    >
                      <PhoneOff size={16} />
                    </button>
                  </div>

                  {/* Ask Room AI Bar */}
                  <form onSubmit={handleAISubmit} className="w-full max-w-[480px] relative">
                    <div className="bg-white/90 dark:bg-zinc-900/90 backdrop-blur-xl border border-slate-200/70 dark:border-zinc-800 rounded-full px-4 py-1.5 flex items-center justify-between shadow-xs">
                      <div className="flex items-center gap-2 flex-1">
                        <RegaarderAiIcon size={15} strokeWidth={1.8} className="text-slate-400 dark:text-zinc-500 shrink-0" />
                        <input 
                          type="text"
                          value={aiPrompt}
                          onChange={(e) => setAiPrompt(e.target.value)}
                          placeholder="Ask Room AI..."
                          className="w-full bg-transparent border-none text-xs text-slate-800 dark:text-zinc-200 placeholder:text-slate-400 dark:placeholder:zinc-500 focus:outline-none"
                        />
                      </div>
                      <button 
                        type="submit"
                        className="w-6 h-6 rounded-full bg-violet-100 dark:bg-violet-950/80 text-violet-600 dark:text-violet-400 flex items-center justify-center hover:bg-violet-200 transition-colors shrink-0"
                      >
                        <Send size={11} />
                      </button>
                    </div>
                  </form>
                </div>
              </main>

              {/* 3. Right Sidebar: Chat Panel */}
              {isChatOpen && (
                <aside className="w-[270px] shrink-0 bg-white/80 dark:bg-zinc-900/80 backdrop-blur-xl border border-slate-200/70 dark:border-zinc-800 rounded-[28px] p-4 flex flex-col shadow-xs transition-all animate-in fade-in duration-200 text-left">
                  <div className="flex items-center justify-between mb-3 px-1">
                    <h3 className="text-xs font-bold text-slate-900 dark:text-zinc-100">Chat</h3>
                    <button 
                      onClick={() => setIsChatOpen(false)}
                      className="p-1 rounded-lg text-slate-400 hover:text-slate-600 dark:hover:text-zinc-200 transition-colors"
                    >
                      <X size={13} />
                    </button>
                  </div>

                  {/* Chat Tabs: Everyone | Direct messages */}
                  <div className="flex items-center border-b border-slate-100 dark:border-zinc-800 pb-2 mb-3">
                    <button 
                      onClick={() => setChatTab("everyone")}
                      className={`text-xs font-semibold transition-colors relative pb-1 mr-4 ${
                        chatTab === "everyone" 
                          ? "text-slate-900 dark:text-zinc-100 after:absolute after:bottom-0 after:left-0 after:right-0 after:h-[2px] after:bg-slate-900 dark:after:bg-zinc-100" 
                          : "text-slate-400 dark:text-zinc-500 hover:text-slate-700"
                      }`}
                    >
                      Everyone
                    </button>
                    <button 
                      onClick={() => setChatTab("direct")}
                      className={`text-xs font-semibold transition-colors relative pb-1 ${
                        chatTab === "direct" 
                          ? "text-slate-900 dark:text-zinc-100 after:absolute after:bottom-0 after:left-0 after:right-0 after:h-[2px] after:bg-slate-900 dark:after:bg-zinc-100" 
                          : "text-slate-400 dark:text-zinc-500 hover:text-slate-700"
                      }`}
                    >
                      Direct messages
                    </button>
                  </div>

                  {/* Chat Messages List / Empty State */}
                  <div className="flex-1 flex flex-col justify-center overflow-y-auto thin-scrollbar pr-1">
                    {chatMessages.length === 0 ? (
                      <div className="flex flex-col items-center justify-center text-center py-6">
                        <div className="w-10 h-10 rounded-2xl bg-slate-100/80 dark:bg-zinc-800 flex items-center justify-center text-slate-400 dark:text-zinc-500 mb-2">
                          <MessageSquare size={18} strokeWidth={1.5} />
                        </div>
                        <span className="text-xs font-semibold text-slate-800 dark:text-zinc-200">No messages yet</span>
                        <p className="text-[11px] text-slate-400 dark:text-zinc-500 mt-1 max-w-[170px] leading-relaxed">
                          Start the conversation by sending a message.
                        </p>
                      </div>
                    ) : (
                      <div className="space-y-2.5">
                        {chatMessages.map(msg => (
                          <div key={msg.id} className="p-2.5 bg-slate-50 dark:bg-zinc-800/60 rounded-xl">
                            <div className="flex justify-between items-center mb-1">
                              <span className="text-xs font-semibold text-slate-800 dark:text-zinc-200">{msg.sender}</span>
                              <span className="text-[10px] text-slate-400">{msg.time}</span>
                            </div>
                            <p className="text-xs text-slate-600 dark:text-zinc-300 leading-relaxed">{msg.text}</p>
                          </div>
                        ))}
                      </div>
                    )}
                  </div>

                  {/* Message Composer */}
                  <form onSubmit={handleSendMessage} className="mt-3 relative">
                    <input 
                      type="text"
                      value={chatMessage}
                      onChange={(e) => setChatMessage(e.target.value)}
                      placeholder="Message everyone..."
                      className="w-full bg-slate-100/70 dark:bg-zinc-800/70 text-xs text-slate-800 dark:text-zinc-200 placeholder:text-slate-400 pl-3.5 pr-8 py-2 rounded-2xl border-none focus:outline-none focus:ring-1 focus:ring-slate-300"
                    />
                    <button 
                      type="submit"
                      className="absolute right-2.5 top-1/2 -translate-y-1/2 text-slate-400 hover:text-slate-700 dark:hover:text-zinc-200 transition-colors"
                    >
                      <Send size={12} />
                    </button>
                  </form>
                </aside>
              )}
            </div>

          </div>

          {/* ========================================================================= */}
          {/* LOBBY MODAL OVERLAY (Pixel-Perfect Layer as in Image 2)                    */}
          {/* ========================================================================= */}
          {isLobby && (
            <div className="absolute inset-0 z-50 flex items-center justify-center p-4 bg-black/[0.04] dark:bg-black/30 backdrop-blur-[6px] animate-in fade-in duration-300">
              <div 
                className="relative bg-white/95 dark:bg-zinc-900/95 backdrop-blur-2xl border border-white/80 dark:border-white/10 shadow-[0_24px_70px_rgba(0,0,0,0.1)] rounded-[32px] max-w-[420px] w-full p-7 flex flex-col items-center text-center animate-in fade-in zoom-in-95 duration-200 select-none"
                onClick={(e) => e.stopPropagation()}
              >
                {isMeetingOptionsOpen ? (
                  /* ========================================================= */
                  /* PROGRESSIVE DISCLOSURE: INSTANT VS SCHEDULE OPTIONS       */
                  /* ========================================================= */
                  <div className="w-full flex flex-col items-center animate-in fade-in zoom-in-95 duration-150">
                    {/* Top Badge with Delicate Purple Sparkles (✦) */}
                    <div className="relative mb-3">
                      <div className="w-[52px] h-[52px] rounded-2xl bg-violet-50/90 dark:bg-violet-950/60 border border-violet-100/80 dark:border-violet-800/60 flex items-center justify-center text-violet-600 dark:text-violet-400 shadow-inner">
                        <Video size={22} strokeWidth={1.75} />
                      </div>
                      <span className="absolute -top-1 -right-2 text-[10px] font-bold text-violet-400 animate-pulse">✦</span>
                      <span className="absolute -top-1 -left-2 text-[9px] font-bold text-violet-300">✦</span>
                    </div>

                    {/* Typography Header */}
                    <h2 className="text-[19px] font-bold text-slate-900 dark:text-zinc-100 tracking-tight leading-snug">
                      Create a Meeting
                    </h2>
                    <p className="text-xs text-slate-500 dark:text-zinc-400 mt-1 mb-5 leading-normal">
                      Choose whether to start right now or schedule for later.
                    </p>

                    {/* Option 1: Start Meeting Now */}
                    <button
                      type="button"
                      onClick={handleStartInstantMeeting}
                      className="w-full p-3.5 bg-violet-50/80 hover:bg-violet-100/90 dark:bg-violet-950/40 dark:hover:bg-violet-900/60 border border-violet-200/70 dark:border-violet-800/60 rounded-2xl flex items-center justify-between text-left transition-all active:scale-[0.99] group shadow-2xs cursor-pointer mb-3"
                    >
                      <div className="flex items-center gap-3">
                        <div className="w-8 h-8 rounded-xl bg-violet-600 text-white flex items-center justify-center shrink-0 shadow-xs group-hover:scale-105 transition-transform">
                          <Video size={16} strokeWidth={2.2} />
                        </div>
                        <div>
                          <div className="text-xs font-bold text-slate-900 dark:text-zinc-100">Start meeting now</div>
                          <div className="text-[11px] text-slate-500 dark:text-zinc-400 mt-0.5 font-normal">Launch room and invite others immediately</div>
                        </div>
                      </div>
                      <ChevronRight size={15} className="text-violet-600 dark:text-violet-400 group-hover:translate-x-0.5 transition-transform shrink-0" />
                    </button>

                    {/* Option 2: Schedule for Later */}
                    <button
                      type="button"
                      onClick={() => {
                        onLaunch?.({ type: 'schedule', name: 'Room' });
                        showToast?.("Opening scheduling calendar...");
                      }}
                      className="w-full p-3.5 bg-slate-50/80 hover:bg-slate-100/90 dark:bg-zinc-850/60 dark:hover:bg-zinc-800 border border-slate-200/80 dark:border-zinc-700/80 rounded-2xl flex items-center justify-between text-left transition-all active:scale-[0.99] group shadow-2xs cursor-pointer mb-4"
                    >
                      <div className="flex items-center gap-3">
                        <div className="w-8 h-8 rounded-xl bg-violet-100/80 dark:bg-zinc-800 text-violet-600 dark:text-violet-300 flex items-center justify-center shrink-0 shadow-xs group-hover:scale-105 transition-transform">
                          <Calendar size={15} strokeWidth={2.2} />
                        </div>
                        <div>
                          <div className="text-xs font-bold text-slate-900 dark:text-zinc-100">Schedule for later</div>
                          <div className="text-[11px] text-slate-500 dark:text-zinc-400 mt-0.5 font-normal">Pick a date, time, and invite teammates</div>
                        </div>
                      </div>
                      <ChevronRight size={15} className="text-slate-400 dark:text-zinc-500 group-hover:translate-x-0.5 transition-transform shrink-0" />
                    </button>

                    {/* Back Button */}
                    <button
                      type="button"
                      onClick={() => setIsMeetingOptionsOpen(false)}
                      className="text-xs font-semibold text-slate-400 hover:text-slate-700 dark:hover:text-zinc-200 transition-colors py-1 cursor-pointer"
                    >
                      ‹ Back to options
                    </button>
                  </div>
                ) : (
                  /* ========================================================= */
                  /* DEFAULT WELCOME TO ROOM LOBBY SCREEN                      */
                  /* ========================================================= */
                  <>
                    {/* Top Badge with Delicate Purple Sparkles (✦) */}
                    <div className="relative mb-3">
                      <div className="w-13 h-13 w-[52px] h-[52px] rounded-2xl bg-violet-50/90 dark:bg-violet-950/60 border border-violet-100/80 dark:border-violet-800/60 flex items-center justify-center text-violet-600 dark:text-violet-400 shadow-inner">
                        <Users size={22} strokeWidth={1.75} />
                      </div>
                      {/* Floating sparkles */}
                      <span className="absolute -top-1 -right-2 text-[10px] font-bold text-violet-400 animate-pulse">✦</span>
                      <span className="absolute -top-1 -left-2 text-[9px] font-bold text-violet-300">✦</span>
                      <span className="absolute -bottom-1 -right-1 text-[8px] font-bold text-violet-400">✦</span>
                    </div>

                    {/* Typography Header */}
                    <h2 className="text-[19px] font-bold text-slate-900 dark:text-zinc-100 tracking-tight leading-snug">
                      Welcome to Room
                    </h2>
                    <p className="text-xs text-slate-500 dark:text-zinc-400 mt-1 mb-5 leading-normal">
                      Start an instant meeting or join with a code.
                    </p>

                    {/* Action 1: Start an instant meeting (Opens Options) */}
                    <button
                      type="button"
                      onClick={() => setIsMeetingOptionsOpen(true)}
                      className="w-full p-3.5 bg-violet-50/80 hover:bg-violet-100/90 dark:bg-violet-950/40 dark:hover:bg-violet-900/60 border border-violet-200/70 dark:border-violet-800/60 rounded-2xl flex items-center justify-between text-left transition-all active:scale-[0.99] group shadow-2xs cursor-pointer"
                    >
                      <div className="flex items-center gap-3">
                        <div className="w-8 h-8 rounded-xl bg-violet-600 text-white flex items-center justify-center shrink-0 shadow-xs group-hover:scale-105 transition-transform">
                          <Plus size={16} strokeWidth={2.5} />
                        </div>
                        <div>
                          <div className="text-xs font-bold text-slate-900 dark:text-zinc-100">Start an instant meeting</div>
                          <div className="text-[11px] text-slate-500 dark:text-zinc-400 mt-0.5 font-normal">Create a room and invite others</div>
                        </div>
                      </div>
                      <ChevronRight size={15} className="text-violet-600 dark:text-violet-400 group-hover:translate-x-0.5 transition-transform shrink-0" />
                    </button>

                    {/* Subtle Divider */}
                    <div className="flex items-center gap-3 w-full my-3.5">
                      <div className="h-[1px] bg-slate-200/70 dark:bg-zinc-800 flex-1" />
                      <span className="text-[11px] text-slate-400 dark:text-zinc-500 font-medium">or</span>
                      <div className="h-[1px] bg-slate-200/70 dark:bg-zinc-800 flex-1" />
                    </div>

                    {/* Action 2: Enter room code (Secondary Action with Code Input Affordance) */}
                    {!isEnteringCode ? (
                      <button
                        type="button"
                        onClick={() => setIsEnteringCode(true)}
                        className="w-full p-3.5 bg-slate-50/80 hover:bg-slate-100/90 dark:bg-zinc-850/60 dark:hover:bg-zinc-800 border border-slate-200/80 dark:border-zinc-700/80 rounded-2xl flex items-center justify-between text-left transition-all active:scale-[0.99] group shadow-2xs cursor-pointer"
                      >
                        <div className="flex items-center gap-3">
                          <div className="w-8 h-8 rounded-xl bg-violet-100/80 dark:bg-zinc-800 text-violet-600 dark:text-violet-300 flex items-center justify-center shrink-0 font-bold text-sm group-hover:scale-105 transition-transform">
                            <Hash size={15} strokeWidth={2.2} />
                          </div>
                          <div>
                            <div className="text-xs font-bold text-slate-900 dark:text-zinc-100">Enter room code</div>
                            <div className="text-[11px] text-slate-500 dark:text-zinc-400 mt-0.5 font-normal">Join an existing room</div>
                          </div>
                        </div>
                        <ChevronRight size={15} className="text-slate-400 dark:text-zinc-500 group-hover:translate-x-0.5 transition-transform shrink-0" />
                      </button>
                    ) : (
                      <form onSubmit={handleJoinWithCode} className="w-full bg-slate-50/90 dark:bg-zinc-850/80 border border-slate-200 dark:border-zinc-700 rounded-2xl p-3 flex flex-col gap-2.5 animate-in fade-in duration-150">
                        <div className="flex items-center gap-2">
                          <input
                            ref={codeInputRef}
                            type="text"
                            value={roomCodeInput}
                            onChange={(e) => setRoomCodeInput(e.target.value)}
                            placeholder="e.g. ABC-123"
                            className="flex-1 bg-white dark:bg-zinc-900 border border-slate-200 dark:border-zinc-700 text-xs font-semibold text-slate-900 dark:text-zinc-100 px-3 py-2 rounded-xl focus:outline-none focus:ring-1 focus:ring-slate-400 uppercase text-center"
                          />
                          <button
                            type="submit"
                            disabled={!roomCodeInput.trim()}
                            className="px-4 py-2 bg-slate-900 dark:bg-zinc-100 text-white dark:text-zinc-900 text-xs font-semibold rounded-xl hover:bg-slate-800 disabled:opacity-40 transition-all active:scale-95"
                          >
                            Join
                          </button>
                        </div>
                        <div className="flex justify-between items-center px-1">
                          <span className="text-[10px] text-slate-400">Enter 6-letter room code</span>
                          <button 
                            type="button" 
                            onClick={() => setIsEnteringCode(false)}
                            className="text-[11px] font-semibold text-slate-500 hover:text-slate-800 dark:hover:text-zinc-200"
                          >
                            Cancel
                          </button>
                        </div>
                      </form>
                    )}
                  </>
                )}

              </div>
            </div>
          )}

          {/* ========================================================================= */}
          {/* INVITE PEOPLE MODAL                                                       */}
          {/* ========================================================================= */}
          {isInviteModalOpen && (
            <div className="fixed inset-0 z-[10000] flex items-center justify-center p-4 bg-black/30 backdrop-blur-xs animate-in fade-in">
              <div 
                className="bg-white dark:bg-zinc-900 border border-slate-200 dark:border-zinc-800 rounded-3xl max-w-sm w-full p-6 shadow-2xl text-left"
                onClick={(e) => e.stopPropagation()}
              >
                <div className="flex items-center justify-between mb-4">
                  <h3 className="text-sm font-semibold text-slate-900 dark:text-zinc-100">Invite Collaborators</h3>
                  <button onClick={() => setIsInviteModalOpen(false)} className="p-1 rounded-lg text-slate-400 hover:text-slate-600">
                    <X size={15} />
                  </button>
                </div>
                <p className="text-xs text-slate-500 dark:text-zinc-400 mb-4 leading-relaxed">
                  Anyone with this link can join your active Room meeting directly.
                </p>
                <div className="p-2.5 bg-slate-50 dark:bg-zinc-800/80 border border-slate-200 dark:border-zinc-700 rounded-xl flex items-center justify-between mb-4">
                  <span className="text-xs font-mono text-slate-700 dark:text-zinc-300 truncate mr-2">https://regaarder.app/room/{roomName.toLowerCase().replace(/\s+/g, '-')}</span>
                  <button 
                    onClick={() => {
                      showToast?.("Invite link copied to clipboard!");
                      setIsInviteModalOpen(false);
                    }}
                    className="px-2.5 py-1 bg-slate-900 dark:bg-zinc-100 text-white dark:text-zinc-900 text-xs font-semibold rounded-lg shrink-0"
                  >
                    Copy
                  </button>
                </div>
              </div>
            </div>
          )}

        </div>
      </div>
    </div>
  );
}
