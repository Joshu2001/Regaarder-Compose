import React, { useState, useEffect, useRef } from "react";
import {
  Video, Calendar, PlayCircle, Settings, Plus, Users, Hash, Bell, Shield, ChevronDown,
  MoreHorizontal, Clock, FileText, Layout, Home, X, Keyboard, Send, Sparkles, Edit2, Trash2, Check, Download
} from "lucide-react";

export default function RoomLandingPage({ onLaunch, showToast }) {
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
  const [isActivityOpen, setIsActivityOpen] = useState(true);

  // Invites state matching meeting workspace (start with empty state)
  const [invites, setInvites] = useState([]);

  // AI Response Interactive States
  const [isEditingPrompt, setIsEditingPrompt] = useState(false);
  const [isEditingAnswer, setIsEditingAnswer] = useState(false);
  const [editedPromptText, setEditedPromptText] = useState("");
  const [editedAnswerText, setEditedAnswerText] = useState("");
  const [isExportMenuOpen, setIsExportMenuOpen] = useState(false);
  const [exportStatus, setExportStatus] = useState("");

  // Upcoming & Recent 3-dot dropdown states
  const [isUpcomingMenuOpen, setIsUpcomingMenuOpen] = useState(false);
  const [activeRecentMenuIdx, setActiveRecentMenuIdx] = useState(null);

  // Dynamic Lists for Upcoming and Recent sections
  const [upcomingMeetings, setUpcomingMeetings] = useState([]);
  const [recentRooms, setRecentRooms] = useState([]);
  const [isUpgradeModalOpen, setIsUpgradeModalOpen] = useState(false);

  const dropdownRef = useRef(null);
  const invitesRef = useRef(null);
  const profileRef = useRef(null);
  const exportRef = useRef(null);
  const upcomingMenuRef = useRef(null);
  const recentMenuRef = useRef(null);

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
      if (upcomingMenuRef.current && !upcomingMenuRef.current.contains(event.target)) {
        setIsUpcomingMenuOpen(false);
      }
      if (recentMenuRef.current && !recentMenuRef.current.contains(event.target)) {
        setActiveRecentMenuIdx(null);
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

  // TAB RENDERING FUNCTIONS
  const renderRoomsTab = () => {
    const roomsList = [
      { id: "room-1", name: "Product Design Sync", owner: "Joshua", status: "Active", participants: 4, label: "PD" },
      { id: "room-2", name: "Engineering Handover", owner: "Lisa", status: "Inactive", participants: 0, label: "EH" },
      { id: "room-3", name: "Marketing Strategy", owner: "Mark", status: "Active", participants: 2, label: "MS" }
    ];
    return (
      <div className="w-full max-w-[600px] flex flex-col gap-6 text-left animate-in fade-in slide-in-from-bottom-2 duration-300">
        <div className="flex items-center justify-between px-1">
          <h2 className="text-[18px] font-semibold text-slate-800 tracking-tight">Active Rooms</h2>
          <button onClick={handleLaunch} className="px-3.5 py-1.5 bg-violet-50 hover:bg-violet-100 text-violet-600 border border-violet-100/50 rounded-xl text-[12px] font-semibold transition-all">
            + Create Room
          </button>
        </div>
        <div className="flex flex-col gap-3">
          {roomsList.map(r => (
            <div key={r.id} className="bg-white border border-slate-100/80 rounded-2xl p-4 flex justify-between items-center shadow-[0_8px_24px_rgba(0,0,0,0.02)] hover:scale-[1.005] hover:shadow-[0_12px_32px_rgba(0,0,0,0.03)] transition-all duration-300">
              <div className="flex items-center gap-4 min-w-0">
                <div className="w-10 h-10 rounded-xl bg-violet-50 text-violet-600 flex items-center justify-center shrink-0 border border-violet-100/30 text-[13px] font-bold">
                  {r.label}
                </div>
                <div className="min-w-0">
                  <div className="text-[14px] font-semibold text-slate-800 leading-snug truncate">{r.name}</div>
                  <div className="text-[12px] text-slate-400 font-medium mt-0.5">Created by {r.owner} • {r.participants} online</div>
                </div>
              </div>
              <div className="flex items-center gap-3 shrink-0">
                <span className={`text-[10px] px-2 py-0.5 rounded-full font-bold border ${r.status === 'Active' ? 'bg-emerald-50 text-emerald-500 border-emerald-100' : 'bg-slate-50 text-slate-400 border-slate-150'}`}>
                  {r.status}
                </span>
                <button onClick={handleLaunch} className="px-4 py-1.5 bg-slate-50 hover:bg-slate-100 border border-slate-200/60 text-[12px] font-semibold text-violet-600 rounded-xl transition-all">
                  Join
                </button>
              </div>
            </div>
          ))}
        </div>
      </div>
    );
  };

  const renderRecordingsTab = () => {
    const recordings = [
      { id: "rec-1", title: "Sprint 4 Kickoff meeting", date: "July 15, 2026", duration: "42:15", size: "185 MB" },
      { id: "rec-2", title: "Q3 Budget Review Session", date: "July 12, 2026", duration: "1:05:40", size: "290 MB" },
      { id: "rec-3", title: "Product Roadmap Sync", date: "July 8, 2026", duration: "25:10", size: "110 MB" }
    ];
    return (
      <div className="w-full max-w-[600px] flex flex-col gap-6 text-left animate-in fade-in slide-in-from-bottom-2 duration-300">
        <div>
          <h2 className="text-[18px] font-semibold text-slate-800 tracking-tight px-1">Meeting Recordings</h2>
          <p className="text-[12px] text-slate-400 px-1 mt-0.5">Play back, share, and review your cloud sessions.</p>
        </div>
        <div className="grid grid-cols-1 gap-3">
          {recordings.map(rec => (
            <div key={rec.id} className="bg-white border border-slate-100/80 rounded-2xl p-4 flex justify-between items-center shadow-[0_8px_24px_rgba(0,0,0,0.02)] hover:scale-[1.005] hover:shadow-[0_12px_32px_rgba(0,0,0,0.03)] transition-all duration-300">
              <div className="flex items-center gap-4 min-w-0">
                <div className="w-10 h-10 rounded-xl bg-blue-50 text-blue-500 flex items-center justify-center shrink-0 border border-blue-100">
                  <PlayCircle size={18} />
                </div>
                <div className="min-w-0">
                  <div className="text-[14px] font-semibold text-slate-800 leading-snug truncate">{rec.title}</div>
                  <div className="text-[12px] text-slate-400 font-medium mt-0.5">{rec.date} • {rec.size}</div>
                </div>
              </div>
              <div className="flex items-center gap-3 shrink-0">
                <span className="text-[11px] font-semibold text-slate-500 bg-slate-50 border border-slate-150 px-2 py-1 rounded-lg">
                  {rec.duration}
                </span>
                <button onClick={() => showToast?.('Starting audio/video recording playback...')} className="p-2 bg-slate-50 hover:bg-slate-100 border border-slate-200/60 rounded-xl text-violet-600 transition-colors">
                  <PlayCircle size={15} />
                </button>
              </div>
            </div>
          ))}
        </div>
      </div>
    );
  };

  const renderCalendarTab = () => {
    const events = [
      { id: "ev-1", title: "Marketing Review", date: "Today", time: "3:00 PM - 3:30 PM", desc: "Weekly marketing design feedback and adjustments" },
      { id: "ev-2", title: "1-on-1 with Lisa", date: "Tomorrow", time: "10:00 AM - 10:30 AM", desc: "Catch up and discuss roadmap tasks" },
      { id: "ev-3", title: "Engineering Sync", date: "July 19, 2026", time: "2:00 PM - 3:00 PM", desc: "Technical layout review and performance polish" }
    ];
    return (
      <div className="w-full max-w-[600px] flex flex-col gap-6 text-left animate-in fade-in slide-in-from-bottom-2 duration-300">
        <div className="flex items-center justify-between px-1">
          <div>
            <h2 className="text-[18px] font-semibold text-slate-800 tracking-tight">Calendar</h2>
            <p className="text-[12px] text-slate-400 mt-0.5">Manage and launch your scheduled call invitations.</p>
          </div>
          <button onClick={handleSchedule} className="px-3.5 py-1.5 bg-violet-50 hover:bg-violet-100 text-violet-600 border border-violet-100/50 rounded-xl text-[12px] font-semibold transition-all">
            + Schedule Event
          </button>
        </div>
        <div className="flex flex-col gap-3">
          {events.map(ev => (
            <div key={ev.id} className="bg-white border border-slate-100/80 rounded-2xl p-4 flex flex-col gap-2.5 shadow-[0_8px_24px_rgba(0,0,0,0.02)] hover:scale-[1.002] transition-all duration-300">
              <div className="flex justify-between items-start">
                <div>
                  <span className="text-[10px] uppercase font-bold px-1.5 py-0.5 rounded bg-violet-50 text-violet-600 border border-violet-100">
                    {ev.date}
                  </span>
                  <h3 className="text-[14px] font-semibold text-slate-800 mt-1.5">{ev.title}</h3>
                </div>
                <span className="text-[11px] font-medium text-slate-400">{ev.time}</span>
              </div>
              <p className="text-[12px] text-slate-500 leading-relaxed bg-slate-50/50 p-2.5 rounded-xl border border-slate-100/50">
                {ev.desc}
              </p>
              <div className="flex justify-end gap-2 mt-1">
                <button onClick={() => showToast?.('Link copied to clipboard!')} className="px-3 py-1.5 bg-white hover:bg-slate-50 border border-slate-200 text-slate-600 rounded-xl text-[11px] font-semibold transition-all">
                  Copy Link
                </button>
                <button onClick={handleLaunch} className="px-4 py-1.5 bg-slate-900 hover:bg-slate-800 text-white rounded-xl text-[11px] font-semibold transition-all">
                  Launch Room
                </button>
              </div>
            </div>
          ))}
        </div>
      </div>
    );
  };

  const [selectedNote, setSelectedNote] = useState(null);

  const renderSharedNotesTab = () => {
    const notes = [
      { id: "note-1", title: "Q3 Strategy Planning Notes", date: "Edited 2h ago", content: "Key Decisions:\n- Focus on minimalist design for the mobile client.\n- Prioritize video layout performance.\n- Increase screen-share aspect constraints.\n\nNext Steps:\n- Complete layout animations.\n- Review with engineering team on Monday." },
      { id: "note-2", title: "Product Sync Action Items", date: "Edited yesterday", content: "Actions:\n- Joshua: Update the leave-room redirection hook.\n- Lisa: Check audio sample rate controls.\n- Mark: Prepare slides for deck review." }
    ];
    return (
      <div className="w-full max-w-[600px] flex flex-col gap-6 text-left animate-in fade-in slide-in-from-bottom-2 duration-300">
        <div>
          <h2 className="text-[18px] font-semibold text-slate-800 tracking-tight px-1">Shared Notes</h2>
          <p className="text-[12px] text-slate-400 px-1 mt-0.5">Collaborative meeting minutes, tasks, and text notes.</p>
        </div>
        <div className="flex flex-col gap-3">
          {notes.map(note => {
            const isExpanded = selectedNote === note.id;
            return (
              <div key={note.id} className="bg-white border border-slate-100/80 rounded-2xl p-4 flex flex-col shadow-[0_8px_24px_rgba(0,0,0,0.02)] hover:scale-[1.002] transition-all duration-350">
                <div className="flex justify-between items-center cursor-pointer" onClick={() => setSelectedNote(isExpanded ? null : note.id)}>
                  <div className="min-w-0">
                    <div className="text-[14px] font-semibold text-slate-800 leading-snug truncate group-hover:text-violet-600 transition-colors">{note.title}</div>
                    <div className="text-[11px] text-slate-400 mt-0.5">{note.date}</div>
                  </div>
                  <button className="px-3 py-1 bg-slate-50 hover:bg-slate-100 border border-slate-200/60 rounded-lg text-[11px] font-semibold text-slate-600 transition-colors">
                    {isExpanded ? "Hide" : "Preview"}
                  </button>
                </div>
                {isExpanded && (
                  <div className="mt-3.5 pt-3.5 border-t border-slate-100/80 text-[12px] text-slate-650 leading-relaxed whitespace-pre-wrap animate-in fade-in duration-200">
                    {note.content}
                  </div>
                )}
              </div>
            );
          })}
        </div>
      </div>
    );
  };

  const renderSettingsTab = () => {
    return (
      <div className="w-full max-w-[600px] flex flex-col gap-6 text-left animate-in fade-in slide-in-from-bottom-2 duration-300">
        <div>
          <h2 className="text-[18px] font-semibold text-slate-800 tracking-tight px-1">Settings</h2>
          <p className="text-[12px] text-slate-400 px-1 mt-0.5">Configure your call devices and system preferences.</p>
        </div>
        <div className="bg-white border border-slate-100/80 rounded-2xl p-6 flex flex-col gap-5 shadow-[0_8px_24px_rgba(0,0,0,0.02)]">
          <div className="flex flex-col gap-1.5">
            <label className="text-[12px] font-semibold text-slate-600">Default Input Microphone</label>
            <select className="w-full bg-slate-50/50 border border-slate-200 text-slate-700 text-[13px] px-3.5 py-2.5 rounded-xl focus:outline-none focus:border-violet-300 font-sans cursor-pointer">
              <option>Default System Microphone (Built-in)</option>
              <option>External Mic (High Definition Audio)</option>
            </select>
          </div>
          <div className="flex flex-col gap-1.5">
            <label className="text-[12px] font-semibold text-slate-600">Camera Resolution</label>
            <select className="w-full bg-slate-50/50 border border-slate-200 text-slate-705 text-[13px] px-3.5 py-2.5 rounded-xl focus:outline-none focus:border-violet-300 font-sans cursor-pointer">
              <option>High Definition (720p)</option>
              <option>Full HD (1080p) - High Bandwidth</option>
              <option>Standard (360p) - Low Bandwidth</option>
            </select>
          </div>
          <div className="h-[1px] bg-slate-100 my-1" />
          <div className="flex justify-between items-center">
            <div className="flex flex-col">
              <span className="text-[13px] font-semibold text-slate-800">Background Noise Cancellation</span>
              <span className="text-[11px] text-slate-400">Reduce ambient office sound from voice.</span>
            </div>
            <input type="checkbox" defaultChecked className="w-4 h-4 text-violet-650 bg-gray-100 border-gray-300 rounded focus:ring-violet-500 cursor-pointer" />
          </div>
          <div className="flex justify-between items-center">
            <div className="flex flex-col">
              <span className="text-[13px] font-semibold text-slate-800">HD Voice Stream</span>
              <span className="text-[11px] text-slate-400">High-fidelity voice audio encoding.</span>
            </div>
            <input type="checkbox" defaultChecked className="w-4 h-4 text-violet-650 bg-gray-100 border-gray-300 rounded focus:ring-violet-500 cursor-pointer" />
          </div>
        </div>
      </div>
    );
  };

  const renderUpgradeModal = () => {
    if (!isUpgradeModalOpen) return null;
    return (
      <div className="fixed inset-0 z-[10000] flex items-center justify-center p-4">
        {/* Glassmorphic Background Backdrop */}
        <div onClick={() => setIsUpgradeModalOpen(false)} className="absolute inset-0 bg-slate-900/25 backdrop-blur-[12px] transition-opacity" />
        
        {/* Premium Apple-style Modal Container */}
        <div className="relative bg-white/95 border border-white/60 shadow-[0_32px_128px_rgba(0,0,0,0.12)] rounded-[32px] max-w-[480px] w-full p-8 text-center flex flex-col items-center animate-in fade-in zoom-in-95 duration-350">
          <button 
            onClick={() => setIsUpgradeModalOpen(false)}
            className="absolute top-5 right-5 p-1.5 rounded-full text-slate-400 hover:bg-slate-100 hover:text-slate-700 transition-colors"
          >
            <X size={16} />
          </button>

          {/* Logo badge */}
          <div className="w-12 h-12 rounded-2xl bg-violet-100 flex items-center justify-center text-violet-600 text-lg font-bold mb-4 shadow-inner">
            ✦
          </div>

          <h2 className="text-[20px] font-semibold text-slate-850 tracking-tight leading-tight mb-2">
            Upgrade to Room Pro
          </h2>
          <p className="text-[13px] text-slate-400 leading-normal max-w-sm mb-6">
            Get professional-grade collaboration features with zero limits and cutting edge productivity assistance.
          </p>

          {/* Key features checklist */}
          <div className="w-full flex flex-col gap-3 text-left mb-7">
            {[
              "Unlimited call duration for group syncs",
              "Studio quality video and high-fidelity audio streams",
              "Dynamic AI Transcription & Summary notes",
              "Custom screensharing resolution & tools"
            ].map((feat, idx) => (
              <div key={idx} className="flex gap-3 items-center">
                <div className="w-4 h-4 rounded-full bg-violet-50 border border-violet-100 flex items-center justify-center shrink-0">
                  <Check size={10} className="text-violet-600" />
                </div>
                <span className="text-[12px] text-slate-600 font-medium">{feat}</span>
              </div>
            ))}
          </div>

          {/* Price Options */}
          <div className="w-full flex gap-3.5 mb-6">
            <button onClick={() => { setIsUpgradeModalOpen(false); showToast?.('Subscribed to Monthly Pro plan!'); }} className="flex-1 p-4 bg-slate-50 hover:bg-slate-100/80 border border-slate-200 rounded-2xl flex flex-col items-center gap-1 group transition-all">
              <span className="text-[11px] font-bold text-slate-400 group-hover:text-slate-500 uppercase tracking-wider">Monthly</span>
              <span className="text-[18px] font-bold text-slate-800">$12<span className="text-[12px] font-medium text-slate-400">/mo</span></span>
            </button>
            <button onClick={() => { setIsUpgradeModalOpen(false); showToast?.('Subscribed to Yearly Pro plan!'); }} className="flex-1 p-4 bg-violet-500 hover:bg-violet-600 border border-violet-400 rounded-2xl flex flex-col items-center gap-1 text-white group transition-all shadow-[0_8px_20px_rgba(124,58,237,0.15)]">
              <span className="text-[11px] font-bold text-violet-200 uppercase tracking-wider">Yearly</span>
              <span className="text-[18px] font-bold">$99<span className="text-[12px] font-medium text-violet-200">/yr</span></span>
            </button>
          </div>

          <button onClick={() => setIsUpgradeModalOpen(false)} className="text-[12px] text-slate-400 hover:text-slate-600 font-semibold transition-colors">
            Maybe later
          </button>
        </div>
      </div>
    );
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
    <div className="w-full h-full relative bg-[#F9F8F6] bg-[radial-gradient(ellipse_at_center,_var(--tw-gradient-stops))] from-[#FFFDFB] via-[#F9F8F6] to-[#F1F0EE] flex flex-col items-center justify-center font-sans overflow-hidden p-2 md:p-4 select-none">
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
                                   showToast?.('Meeting accepted and added to your calendar!');
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

              {/* Layout Sidebar Toggle */}
              <button 
                onClick={() => setIsActivityOpen(!isActivityOpen)}
                className={`p-2.5 rounded-2xl transition-colors ${isActivityOpen ? 'bg-slate-100 text-slate-800 shadow-[0_2px_8px_rgba(0,0,0,0.02)]' : 'text-slate-400 hover:bg-slate-50 hover:text-slate-600'}`}
                title="Toggle Activity panel"
              >
                <Layout size={16} />
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
            
            {/* Left Floating Sidebar Navigation */}
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
                <button 
                  onClick={() => setIsUpgradeModalOpen(true)}
                  className="mt-2 w-full py-2 bg-white hover:bg-slate-50 border border-slate-200 text-violet-600 rounded-xl text-[12px] font-semibold shadow-[0_2px_8px_rgba(0,0,0,0.02)] transition-all"
                >
                  ✦ Upgrade to Pro
                </button>
              </div>
            </aside>
            {/* Middle Column (Main Content - Highly Polished Minimalist Viewport) */}
            <main className="flex-1 flex flex-col gap-10 overflow-y-auto px-4 thin-scrollbar pt-8 items-center transition-all duration-300">
              
              {activeTab === "Home" && (
                <>
                  {/* Unified Hero Group Header containing Greeting, CTAs, and integrated AI Input Box */}
                  <div className="w-full max-w-[600px] flex flex-col items-center shrink-0">
                    
                    {/* Subtle Hero Element: Elegant Abstract Illustration */}
                    <div className="mb-6 relative flex items-center justify-center pointer-events-none">
                      {/* Ambient background glow */}
                      <div className="absolute w-20 h-20 bg-violet-200/30 rounded-full blur-2xl -z-10" />
                      <svg width="100" height="100" viewBox="0 0 120 120" fill="none" xmlns="http://www.w3.org/2000/svg" className="opacity-90">
                        <circle cx="60" cy="60" r="32" stroke="url(#paint0_linear)" strokeWidth="1.5" strokeDasharray="3 3" />
                        <circle cx="60" cy="60" r="48" stroke="url(#paint1_linear)" strokeWidth="1" strokeOpacity="0.5" />
                        <circle cx="60" cy="60" r="20" stroke="url(#paint2_linear)" strokeWidth="1.8" />
                        <circle cx="60" cy="12" r="4" fill="#C084FC" />
                        <circle cx="108" cy="60" r="3.5" fill="#818CF8" />
                        <circle cx="28" cy="92" r="4.5" fill="#A78BFA" />
                        <circle cx="60" cy="60" r="2.5" fill="#A78BFA" />
                        <defs>
                          <linearGradient id="paint0_linear" x1="28" y1="28" x2="92" y2="92" gradientUnits="userSpaceOnUse">
                            <stop stopColor="#C084FC" />
                            <stop offset="1" stopColor="#818CF8" />
                          </linearGradient>
                          <linearGradient id="paint1_linear" x1="12" y1="12" x2="108" y2="108" gradientUnits="userSpaceOnUse">
                            <stop stopColor="#818CF8" stopOpacity="0.1" />
                            <stop offset="1" stopColor="#C084FC" stopOpacity="0.6" />
                          </linearGradient>
                          <linearGradient id="paint2_linear" x1="40" y1="40" x2="80" y2="80" gradientUnits="userSpaceOnUse">
                            <stop stopColor="#A78BFA" />
                            <stop offset="1" stopColor="#C084FC" />
                          </linearGradient>
                        </defs>
                      </svg>
                    </div>

                    {/* 1. Hero Greeting Area */}
                    <div className="text-center flex flex-col items-center max-w-xl mb-7">
                      <h1 className="text-[31px] font-semibold text-slate-800 tracking-tight leading-none mb-3">
                        Good afternoon, Joshua
                      </h1>
                      <p className="text-[17px] text-slate-700 font-semibold leading-snug">
                        Ready to collaborate?
                      </p>
                      <p className="text-[13px] text-slate-400 font-normal mt-1">
                        Create a room or join one with a code.
                      </p>
                    </div>

                    {/* 2. Focused Action Buttons */}
                    <div className="flex gap-4 items-center justify-center w-full max-w-[600px] relative mb-6">
                      <div className="flex-1 relative" ref={dropdownRef}>
                        <button
                          onClick={() => setIsDropdownOpen(!isDropdownOpen)}
                          className="w-full bg-violet-100/60 hover:bg-violet-100 text-violet-600 font-semibold py-3 rounded-xl flex items-center justify-center gap-2 border border-violet-200/20 shadow-[0_2px_8px_rgba(124,58,237,0.03)] hover:-translate-y-0.5 active:scale-[0.98] transition-all text-[14px]"
                        >
                          <Plus size={15} /> New Room
                        </button>

                        {isDropdownOpen && (
                          <div className="absolute top-full left-0 mt-3 w-[260px] bg-white/95 backdrop-blur-xl border border-slate-100 shadow-[0_20px_48px_rgba(0,0,0,0.06)] rounded-3xl overflow-hidden z-30 p-2 animate-in fade-in slide-in-from-top-2">
                            <button
                              onClick={() => { setIsDropdownOpen(false); handleLaunch(); }}
                              className="w-full flex items-center gap-3 px-3 py-2.5 hover:bg-slate-50/80 rounded-2xl text-left transition-colors group"
                            >
                              <div className="w-8 h-8 rounded-xl bg-violet-50 flex items-center justify-center text-violet-600 group-hover:scale-105 transition-transform shrink-0">
                                <Plus size={15} />
                              </div>
                              <div className="flex flex-col min-w-0">
                                <span className="text-[13px] font-semibold text-slate-800 tracking-tight leading-snug">Start instant meeting</span>
                                <span className="text-[10px] text-slate-400 mt-0.5 leading-normal truncate">Launch session immediately</span>
                              </div>
                            </button>
                            <button
                              onClick={() => { setIsDropdownOpen(false); handleSchedule(); }}
                              className="w-full flex items-center gap-3 px-3 py-2.5 hover:bg-slate-50/80 rounded-2xl text-left transition-colors group mt-1"
                            >
                              <div className="w-8 h-8 rounded-xl bg-slate-50 flex items-center justify-center text-slate-500 group-hover:scale-105 group-hover:bg-violet-50 group-hover:text-violet-600 transition-transform shrink-0">
                                <Calendar size={15} />
                              </div>
                              <div className="flex flex-col min-w-0">
                                <span className="text-[13px] font-semibold text-slate-800 tracking-tight leading-snug">Schedule for later</span>
                                <span className="text-[10px] text-slate-400 mt-0.5 leading-normal truncate">Create invite calendar link</span>
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
                          className="w-full bg-slate-50/20 hover:bg-slate-50/40 border border-slate-200/50 text-slate-500 placeholder:text-slate-400 font-semibold py-3 pl-11 pr-12 rounded-xl text-[14px] focus:outline-none focus:border-slate-300 focus:ring-4 focus:ring-slate-500/5 hover:-translate-y-0.5 active:scale-[0.99] transition-all text-center shadow-[0_2px_8px_rgba(0,0,0,0.01)]"
                          onKeyDown={(e) => {
                            if (e.key === 'Enter' && meetingCode.trim().length > 0) {
                              handleLaunch();
                            }
                          }}
                        />
                        <Keyboard size={15} className="absolute left-4 top-1/2 -translate-y-1/2 text-slate-400" />
                        {meetingCode.trim().length > 0 && (
                          <button
                            onClick={handleLaunch}
                            className="absolute right-2 top-1/2 -translate-y-1/2 text-violet-600 font-semibold hover:text-violet-700 hover:bg-violet-50/60 px-2.5 py-1 rounded-lg transition-colors text-[12px]"
                          >
                            Join
                          </button>
                        )}
                      </div>
                    </div>

                    {/* 3. Room AI Prompt Box inside Hero Area */}
                    <form onSubmit={handleAISubmit} className="w-full max-w-[600px] relative shrink-0">
                      <div className="relative flex items-center">
                        <input
                          type="text"
                          value={aiPrompt}
                          onChange={(e) => setAiPrompt(e.target.value)}
                          onFocus={handleInputFocus}
                          placeholder="Ask Room AI anything..."
                          className="w-full bg-[#FCFDFE]/90 hover:bg-white border border-slate-250/60 text-slate-700 placeholder:text-slate-400 font-medium py-3 pl-12 pr-16 rounded-2xl text-[13px] focus:outline-none focus:border-violet-300 focus:ring-4 focus:ring-violet-500/5 shadow-[0_4px_16px_rgba(0,0,0,0.02)] transition-all"
                        />
                        <div className="absolute left-4 w-5 h-5 rounded-lg bg-violet-50 flex items-center justify-center text-[11px] font-bold text-violet-500 pointer-events-none">
                          ✦
                        </div>
                        
                        <div className="absolute right-3 flex items-center gap-1.5">
                          <button
                            type="button"
                            onClick={() => showToast?.('AI Transcriptions voice recognition active.')}
                            className="p-1 rounded-full text-slate-400 hover:bg-slate-50 hover:text-slate-700 transition-colors"
                          >
                            <span className="text-[12px]">🎙️</span>
                          </button>
                          <button
                            type="submit"
                            className="p-1.5 bg-violet-50 hover:bg-violet-100 text-violet-600 rounded-lg transition-colors flex items-center justify-center"
                          >
                            <Send size={12} />
                          </button>
                        </div>
                      </div>

                      {/* Floating Absolute Room AI Response Modal Dropdown */}
                      {roomAIModal.isOpen && (
                        <div className="absolute top-full left-0 right-0 mt-3 bg-white/95 backdrop-blur-xl border border-slate-100 shadow-[0_24px_56px_rgba(0,0,0,0.08)] rounded-3xl p-5 z-40 flex flex-col gap-4 text-left animate-in fade-in slide-in-from-top-3 max-h-[380px] overflow-y-auto thin-scrollbar">
                          
                          {/* Modal Actions Header */}
                          <div className="flex items-center justify-between pb-1.5">
                            <div className="flex items-center gap-2">
                              <span className="w-5 h-5 rounded-lg bg-violet-50 text-violet-600 flex items-center justify-center text-[10px] font-bold">✦</span>
                              <span className="text-[12px] font-bold text-slate-500 uppercase tracking-wider">Room AI Summary</span>
                            </div>
                            
                            <div className="flex items-center gap-1 relative" ref={exportRef}>
                              <button 
                                type="button"
                                onClick={() => setIsEditingPrompt(!isEditingPrompt)}
                                className={`p-1.5 rounded-lg text-slate-400 hover:bg-slate-50 hover:text-slate-600 transition-all ${isEditingPrompt ? 'bg-violet-50 text-violet-600' : ''}`}
                              >
                                <Edit2 size={13} />
                              </button>
                              <button 
                                type="button"
                                onClick={() => setIsExportMenuOpen(!isExportMenuOpen)}
                                className="p-1.5 rounded-lg text-slate-400 hover:bg-slate-50 hover:text-slate-600 transition-all"
                              >
                                <Download size={13} />
                              </button>
                              
                              {isExportMenuOpen && (
                                <div className="absolute right-0 top-full mt-1.5 w-36 bg-white border border-slate-100 shadow-lg rounded-xl p-1 z-50">
                                  <button
                                    type="button"
                                    onClick={() => handleExport("Google Docs")}
                                    className="w-full text-left px-3 py-2 hover:bg-slate-50 text-slate-700 text-[11px] font-medium rounded-lg transition-colors"
                                  >
                                    To Google Docs
                                  </button>
                                  <button
                                    type="button"
                                    onClick={() => handleExport("Email")}
                                    className="w-full text-left px-3 py-2 hover:bg-slate-50 text-slate-700 text-[11px] font-medium rounded-lg transition-colors"
                                  >
                                    Share via Email
                                  </button>
                                </div>
                              )}
                              
                              <button
                                type="button"
                                onClick={() => setRoomAIModal(prev => ({ ...prev, isOpen: false }))}
                                className="p-1.5 rounded-lg text-slate-400 hover:bg-slate-50 hover:text-slate-600 transition-all"
                              >
                                <X size={13} />
                              </button>
                            </div>
                          </div>

                          {/* Editable Prompt Header */}
                          <div className="bg-slate-50/50 border border-slate-100 rounded-xl p-3.5 flex flex-col gap-1.5">
                            <span className="text-[10px] font-bold text-slate-400 uppercase tracking-wider">Asked Prompt</span>
                            {isEditingPrompt ? (
                              <div className="flex gap-2">
                                <input
                                  type="text"
                                  value={editedPromptText}
                                  onChange={(e) => setEditedPromptText(e.target.value)}
                                  className="flex-1 bg-white border border-slate-200 text-slate-700 text-[13px] px-2.5 py-1.5 rounded-lg focus:outline-none focus:border-violet-300 font-sans"
                                />
                                <button
                                  type="button"
                                  onClick={savePromptEdit}
                                  className="p-1.5 bg-slate-900 text-white rounded-lg hover:bg-slate-800 transition-colors"
                                >
                                  <Check size={14} />
                                </button>
                              </div>
                            ) : (
                              <h3 className="text-[13.5px] font-semibold text-slate-800 leading-snug">{roomAIModal.prompt}</h3>
                            )}
                          </div>

                          {/* AI Answer Content with edit capabilities */}
                          <div className="flex flex-col gap-2 px-1">
                            <div className="flex justify-between items-center">
                              <span className="text-[10px] font-bold text-slate-400 uppercase tracking-wider">AI response</span>
                              <button
                                type="button"
                                onClick={() => {
                                  if (isEditingAnswer) {
                                    saveAnswerEdit();
                                  } else {
                                    setIsEditingAnswer(true);
                                  }
                                }}
                                className="text-[11px] font-semibold text-violet-600 hover:text-violet-700 transition-colors"
                              >
                                {isEditingAnswer ? "Save response" : "Edit response"}
                              </button>
                            </div>
                            
                            {isEditingAnswer ? (
                              <textarea
                                value={editedAnswerText}
                                onChange={(e) => setEditedAnswerText(e.target.value)}
                                rows={3}
                                className="w-full bg-slate-50 border border-slate-200 text-slate-600 text-[13px] leading-relaxed p-2.5 rounded-lg focus:outline-none focus:border-violet-300 font-sans resize-none"
                              />
                            ) : (
                              <p className="text-[13px] text-slate-600 leading-relaxed px-1 whitespace-pre-wrap">{roomAIModal.answer}</p>
                            )}
                          </div>
                        </div>
                      )}
                    </form>

                  </div>

                  {/* Spacing Divider - generously padded */}
                  <div className="w-full max-w-[600px] h-[1px] bg-slate-100/50 shrink-0 my-4" />

                  {/* 4. Upcoming Section */}
                  <section className="w-full max-w-[600px] flex flex-col gap-3 shrink-0 text-left">
                    <h2 className="text-[13px] font-semibold text-slate-800 tracking-tight px-1">Upcoming Today</h2>
                    
                    {upcomingMeetings.length > 0 ? (
                      upcomingMeetings.map((meeting) => (
                        <div key={meeting.id} className="bg-white border border-slate-100/80 rounded-2xl p-4 flex justify-between items-center shadow-[0_8px_24px_rgba(0,0,0,0.02)] hover:scale-[1.005] hover:shadow-[0_12px_32px_rgba(0,0,0,0.03)] transition-all duration-300">
                          <div className="flex items-center gap-4 min-w-0">
                            <div className="w-10 h-10 rounded-xl bg-violet-50 text-violet-600 flex items-center justify-center shrink-0 border border-violet-100/30">
                              <Calendar size={18} />
                            </div>
                            <div className="min-w-0">
                              <div className="text-[14px] font-semibold text-slate-800 leading-snug truncate">{meeting.name}</div>
                              <div className="text-[12px] text-slate-400 font-medium mt-0.5">{meeting.time}</div>
                            </div>
                          </div>

                          <div className="flex items-center gap-4 shrink-0">
                            {/* Avatars */}
                            <div className="flex -space-x-1.5">
                              {meeting.avatars.map((av, avIdx) => (
                                <div key={avIdx} className="w-6 h-6 rounded-full bg-slate-100 border-2 border-white flex items-center justify-center text-[10px] font-semibold text-slate-600 shadow-sm">
                                  {av}
                                </div>
                              ))}
                              {meeting.extraCount > 0 && (
                                <div className="w-6 h-6 rounded-full bg-violet-100 border-2 border-white flex items-center justify-center text-[9px] font-bold text-violet-600 shadow-sm">
                                  +{meeting.extraCount}
                                </div>
                              )}
                            </div>
                            
                            <button
                              onClick={handleLaunch}
                              className="px-5 py-1.5 bg-slate-50 hover:bg-slate-100 border border-slate-200/60 text-[13px] font-semibold text-violet-600 rounded-full hover:scale-105 active:scale-95 transition-all"
                            >
                              Join
                            </button>
                            
                            <div className="relative" ref={upcomingMenuRef}>
                              <button 
                                onClick={() => setIsUpcomingMenuOpen(!isUpcomingMenuOpen)}
                                className="p-1 rounded-full text-slate-400 hover:bg-slate-50 hover:text-slate-700 transition-colors"
                              >
                                <MoreHorizontal size={14} />
                              </button>
                              
                              {isUpcomingMenuOpen && (
                                <div className="absolute top-full right-0 mt-1 w-44 bg-white border border-slate-100 shadow-[0_12px_24px_rgba(0,0,0,0.08)] rounded-xl p-1 z-50 animate-in fade-in slide-in-from-top-1">
                                  <button 
                                    onClick={() => { setIsUpcomingMenuOpen(false); handleLaunch(); }}
                                    className="w-full text-left px-3 py-2 hover:bg-slate-50 rounded-lg text-slate-700 text-[11px] font-medium transition-colors"
                                  >
                                    Join Room
                                  </button>
                                  <button 
                                    onClick={() => { setIsUpcomingMenuOpen(false); showToast?.('Link copied to clipboard!'); }}
                                    className="w-full text-left px-3 py-2 hover:bg-slate-50 rounded-lg text-slate-700 text-[11px] font-medium transition-colors"
                                  >
                                    Copy Link
                                  </button>
                                  <button 
                                    onClick={() => { 
                                      setIsUpcomingMenuOpen(false); 
                                      setUpcomingMeetings(upcomingMeetings.filter(m => m.id !== meeting.id));
                                      showToast?.('Meeting has been cancelled.'); 
                                    }}
                                    className="w-full text-left px-3 py-2 hover:bg-rose-50 text-rose-600 rounded-lg text-[11px] font-medium transition-colors"
                                  >
                                    Cancel Meeting
                                  </button>
                                </div>
                              )}
                            </div>
                          </div>
                        </div>
                      ))
                    ) : (
                      <div className="w-full border border-dashed border-slate-200/80 rounded-2xl py-8 px-4 flex flex-col items-center justify-center text-center bg-slate-50/30">
                        <Calendar size={20} className="text-slate-400 mb-2" />
                        <span className="text-[13px] font-semibold text-slate-500">No meetings scheduled for today</span>
                        <span className="text-[11px] text-slate-400 mt-0.5">Your calendar is completely clear.</span>
                      </div>
                    )}
                  </section>

                  {/* 5. Recent Section - structured for breathing room and simplified metadata */}
                  <section className="w-full max-w-[600px] flex flex-col gap-3 shrink-0 text-left mt-6">
                    <h2 className="text-[13px] font-semibold text-slate-800 tracking-tight px-1">Recent</h2>

                    {recentRooms.length > 0 ? (
                      <div className="flex flex-col bg-white border border-slate-100/80 rounded-2xl overflow-hidden shadow-[0_8px_24px_rgba(0,0,0,0.02)]">
                        {recentRooms.map((room, idx) => (
                          <div key={room.id} className="flex justify-between items-center py-2.5 px-4 hover:bg-slate-50/50 transition-all cursor-pointer border-b border-slate-50 last:border-none group">
                            <div className="flex items-center gap-3 min-w-0">
                              <div className={`w-8 h-8 rounded-xl ${room.color} flex items-center justify-center shrink-0 border`}>
                                <Users size={14} />
                              </div>
                              <div className="min-w-0">
                                <div className="text-[13.5px] font-semibold text-slate-800 truncate leading-snug group-hover:text-violet-600 transition-colors">{room.name}</div>
                                <div className="text-[11px] text-slate-400 truncate mt-0.5">{room.time}</div>
                              </div>
                            </div>

                            <div className="flex items-center gap-4 shrink-0">
                              <div className="flex gap-2">
                                {room.recording && (
                                  <span className="flex items-center gap-1 text-[9px] font-bold px-1.5 py-0.5 rounded bg-red-50 text-red-500 border border-red-100">
                                    <span className="w-1.5 h-1.5 rounded-full bg-red-500 animate-pulse" />
                                    REC
                                  </span>
                                )}
                                {room.ai && (
                                  <span className="flex items-center gap-1 text-[9px] font-bold px-1.5 py-0.5 rounded bg-violet-50 text-violet-500 border border-violet-100">
                                    ✦ AI
                                  </span>
                                )}
                              </div>

                              <button
                                onClick={handleLaunch}
                                className="text-[12px] font-semibold text-violet-600 hover:text-violet-700 hover:scale-105 transition-transform"
                              >
                                Resume
                              </button>
                              
                              <div className="relative" ref={idx === activeRecentMenuIdx ? recentMenuRef : null}>
                                <button 
                                  onClick={(e) => { 
                                    e.stopPropagation(); 
                                    setActiveRecentMenuIdx(activeRecentMenuIdx === idx ? null : idx); 
                                  }}
                                  className="p-1.5 rounded-full text-slate-400 hover:bg-slate-50 hover:text-slate-700 transition-colors"
                                >
                                  <MoreHorizontal size={14} />
                                </button>
                                
                                {activeRecentMenuIdx === idx && (
                                  <div className="absolute top-full right-0 mt-1 w-48 bg-white border border-slate-100 shadow-[0_12px_24px_rgba(0,0,0,0.08)] rounded-xl p-1 z-50 animate-in fade-in slide-in-from-top-1" onClick={(e) => e.stopPropagation()}>
                                    <button 
                                      onClick={() => { setActiveRecentMenuIdx(null); handleLaunch(); }}
                                      className="w-full text-left px-3 py-2 hover:bg-slate-50 rounded-lg text-slate-700 text-[11px] font-medium transition-colors"
                                    >
                                      Resume Session
                                    </button>
                                    <button 
                                      onClick={() => { setActiveRecentMenuIdx(null); showToast?.('Showing summary of decisions and action items.'); }}
                                      className="w-full text-left px-3 py-2 hover:bg-slate-50 rounded-lg text-slate-700 text-[11px] font-medium transition-colors"
                                    >
                                      View Summary
                                    </button>
                                    <button 
                                      onClick={() => { 
                                        setActiveRecentMenuIdx(null); 
                                        setRecentRooms(recentRooms.filter(r => r.id !== room.id));
                                        showToast?.('Room has been deleted.'); 
                                      }}
                                      className="w-full text-left px-3 py-2 hover:bg-rose-50 text-rose-600 rounded-lg text-[11px] font-medium transition-colors"
                                    >
                                      Delete Room
                                    </button>
                                  </div>
                                )}
                              </div>
                            </div>
                          </div>
                        ))}
                      </div>
                    ) : (
                      <div className="w-full border border-dashed border-slate-200/80 rounded-2xl py-8 px-4 flex flex-col items-center justify-center text-center bg-slate-50/30">
                        <Users size={20} className="text-slate-400 mb-2" />
                        <span className="text-[13px] font-semibold text-slate-500">No recent sessions</span>
                        <span className="text-[11px] text-slate-400 mt-0.5">Your recently visited rooms will appear here.</span>
                      </div>
                    )}

                    <button className="text-[12px] font-semibold text-slate-400 hover:text-violet-600 transition-colors flex items-center justify-center gap-0.5 mt-2">
                      View all rooms →
                    </button>
                  </section>
                </>
              )}

              {activeTab === "Rooms" && renderRoomsTab()}
              {activeTab === "Recordings" && renderRecordingsTab()}
              {activeTab === "Calendar" && renderCalendarTab()}
              {activeTab === "SharedNotes" && renderSharedNotesTab()}
              {activeTab === "Settings" && renderSettingsTab()}
            </main>

            {/* Right Floating Panel (Activity Feed) */}
            <aside className={`shrink-0 bg-white border border-slate-100 shadow-[0_16px_48px_rgba(0,0,0,0.03)] rounded-[32px] flex flex-col p-6 transition-all duration-300 ${
              isActivityOpen 
                ? 'w-[280px] opacity-100 visible' 
                : 'w-0 opacity-0 invisible overflow-hidden p-0 border-none shadow-none'
            }`}>
              <div className="flex items-center justify-between mb-5">
                <h2 className="text-[16px] font-semibold text-slate-800 tracking-tight">Activity</h2>
                <button 
                  onClick={() => setIsActivityOpen(false)}
                  className="p-1 rounded-full text-slate-400 hover:bg-slate-100 hover:text-slate-700 transition-colors"
                >
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

          {renderUpgradeModal()}
        </div>
      </div>
    </div>
  );
}
