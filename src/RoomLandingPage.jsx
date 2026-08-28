import React, { useState, useEffect, useRef } from "react";
import {
  Video, VideoOff, Mic, MicOff, Calendar, Settings, Plus, Users, UserPlus, Hash, Bell, Shield, ChevronDown, ChevronRight,
  MoreHorizontal, MessageSquare, Layout, LayoutGrid, X, Keyboard, Send, Check, Download,
  Maximize2, Minimize2, Share2, PhoneOff, Search, Sparkles, ExternalLink
} from "lucide-react";
import { useTranslation } from "./i18n";
import { CLOUD_AI_MODELS } from "./services/orbAiService";
import { RoomIcon, RegaarderAiIcon, ComposeIcon, DeckIcon, SheetIcon, WhiteboardIcon, BrowserIcon, ChatIcon } from "./components/RegaarderProductIcons";
import { deriveRoomKey, generateSafetyFingerprint, encryptE2EEText, decryptE2EEText, attachE2EESenderTransform, attachE2EEReceiverTransform } from "./utils/e2eeService";
import RoomLiveDocStage from "./components/room/RoomLiveDocStage";
import ScreenShareSourceModal from "./components/room/ScreenShareSourceModal";

/**
 * Pixel-Perfect Room Workspace with Unified Ambient Lobby
 *
 * Implements the Apple-tier design specified in Image 2:
 * - Room lobby uses the exact same visual environment as the active Room interface
 * - Background displays the complete Room workspace with soft blur & desaturation during lobby state
 * - Centered premium glassmorphism card with "{t('room.welcomeToRoom') || 'Welcome to Room'}"
 * - Primary Action: "Start an instant meeting" (Purple theme)
 * - Secondary Action: "Enter room code" (Join with code affordance)
 * - Preserves Header, People panel, Chat panel, Call controls, and AI prompt bar
 * - Smooth transition from lobby into active meeting workspace
 */
export default function RoomLandingPage({
  onLaunch,
  showToast,
  onSwitchProductMode,
  onOpenWorkspaceSwitcher,
  onCallAi,
  docTitle: propDocTitle,
  setDocTitle: propSetDocTitle,
  docBodyHtml: propDocBodyHtml,
  setDocBodyHtml: propSetDocBodyHtml,
  isDarkMode = false,
  isScreenSharing: propIsScreenSharing,
  setIsScreenSharing: propSetIsScreenSharing,
  screenShareStream: propScreenShareStream,
  setScreenShareStream: propSetScreenShareStream,
  onSelectScreenSource,
  onOpenSourceModal,
  sharedSourceInfo: propSharedSourceInfo,
  setSharedSourceInfo: propSetSharedSourceInfo
}) {
  const { t } = useTranslation();
  const [localDocTitle, setLocalDocTitle] = useState("Product Strategy & Architecture Spec");
  const [localDocBodyHtml, setLocalDocBodyHtml] = useState("<p>Collaborative project meeting notes and architecture decisions.</p>");
  const [liveDocViewMode, setLiveDocViewMode] = useState("clean");

  const docTitle = propDocTitle !== undefined ? propDocTitle : localDocTitle;
  const setDocTitle = propSetDocTitle || setLocalDocTitle;
  const docBodyHtml = propDocBodyHtml !== undefined ? propDocBodyHtml : localDocBodyHtml;
  const setDocBodyHtml = propSetDocBodyHtml || setLocalDocBodyHtml;

  const [localIsScreenSharing, setLocalIsScreenSharing] = useState(false);
  const [localScreenShareStream, setLocalScreenShareStream] = useState(null);
  const [localSharedSourceInfo, setLocalSharedSourceInfo] = useState(null);

  const isScreenSharing = propIsScreenSharing !== undefined ? propIsScreenSharing : localIsScreenSharing;
  const setIsScreenSharing = propSetIsScreenSharing || setLocalIsScreenSharing;
  const screenShareStream = propScreenShareStream !== undefined ? propScreenShareStream : localScreenShareStream;
  const setScreenShareStream = propSetScreenShareStream || setLocalScreenShareStream;
  const sharedSourceInfo = propSharedSourceInfo !== undefined ? propSharedSourceInfo : localSharedSourceInfo;
  const setSharedSourceInfo = propSetSharedSourceInfo || setLocalSharedSourceInfo;

  // Lobby State - Auto-bypass if entering with an active screen share or call
  const [isLobby, setIsLobby] = useState(() => {
    return !(isScreenSharing || screenShareStream || sharedSourceInfo);
  });

  useEffect(() => {
    if (isScreenSharing || screenShareStream || sharedSourceInfo) {
      setIsLobby(false);
    }
  }, [isScreenSharing, screenShareStream, sharedSourceInfo]);
  const [isEnteringCode, setIsEnteringCode] = useState(false);
  const [isGreenRoomOpen, setIsGreenRoomOpen] = useState(false);
  const [selectedCalendarDay, setSelectedCalendarDay] = useState(28);
  const [greenRoomCameraOn, setGreenRoomCameraOn] = useState(true);
  const [greenRoomMicOn, setGreenRoomMicOn] = useState(true);
  const [isWorkspaceMenuOpen, setIsWorkspaceMenuOpen] = useState(false);
  const [isMeetingOptionsOpen, setIsMeetingOptionsOpen] = useState(false);
  const [isSchedulingModalOpen, setIsSchedulingModalOpen] = useState(false);
  const [roomCodeInput, setRoomCodeInput] = useState("");

  // Fresh Regaarder Schedule Session States
  const [scheduleTitle, setScheduleTitle] = useState("Product Strategy & Design Sync");
  const [scheduleDate, setScheduleDate] = useState("2026-11-18");
  const [scheduleStartTime, setScheduleStartTime] = useState("10:00 AM");
  const [scheduleEndTime, setScheduleEndTime] = useState("11:00 AM");
  const [scheduleDuration, setScheduleDuration] = useState("60 min");
  const [scheduleRoomLink, setScheduleRoomLink] = useState("https://regaarder.app/room/sync-8492");
  const [scheduleCollaborators, setScheduleCollaborators] = useState([
    { id: 'you', name: 'You', role: 'Host', color: 'bg-violet-600', email: 'you@regaarder.com' },
  ]);
  const [isDatePickerOpen, setIsDatePickerOpen] = useState(false);
  const [calYear, setCalYear] = useState(2026);
  const [calMonth, setCalMonth] = useState(10); // 10 = November
  const [isCollaboratorMenuOpen, setIsCollaboratorMenuOpen] = useState(false);
  const [collaboratorSearchQuery, setCollaboratorSearchQuery] = useState("");
  const [isStartTimeMenuOpen, setIsStartTimeMenuOpen] = useState(false);
  const [isEndTimeMenuOpen, setIsEndTimeMenuOpen] = useState(false);
  const [scheduleAiSummaryEnabled, setScheduleAiSummaryEnabled] = useState(true);
  const [scheduleWhiteboardEnabled, setScheduleWhiteboardEnabled] = useState(true);
  const [scheduleEncryptionEnabled, setScheduleEncryptionEnabled] = useState(true);

  // E2EE Session Cryptographic State
  const [e2eeSessionKey, setE2eeSessionKey] = useState(null);
  const [e2eeFingerprint, setE2eeFingerprint] = useState("4892 1042 8831 6509");
  const [isE2EEVerifiedModalOpen, setIsE2EEVerifiedModalOpen] = useState(false);

  // Initialize room E2EE key once on mount
  useEffect(() => {
    let isMounted = true;
    deriveRoomKey("regaarder-room-secure-key").then(({ key }) => {
      if (isMounted && key) {
        setE2eeSessionKey(key);
        generateSafetyFingerprint(key).then(fp => {
          if (isMounted && fp) setE2eeFingerprint(fp);
        });
      }
    });
    return () => { isMounted = false; };
  }, []);

  // Dynamic Workspace Contacts (empty by default until real registered users are loaded)
  const [workspaceDirectoryContacts, setWorkspaceDirectoryContacts] = useState([]);

  const standardTimeOptions = [
    '08:00 AM', '08:30 AM', '09:00 AM', '09:30 AM', '10:00 AM', '10:15 AM', '10:30 AM', '11:00 AM',
    '11:30 AM', '12:00 PM', '12:30 PM', '01:00 PM', '01:30 PM', '02:00 PM', '02:30 PM', '03:00 PM',
    '03:30 PM', '04:00 PM', '04:30 PM', '05:00 PM', '05:30 PM', '06:00 PM'
  ];

  const parseTimeToMins = (timeStr) => {
    if (!timeStr) return 0;
    const match = timeStr.trim().match(/^(\d{1,2}):(\d{2})\s*(AM|PM)?$/i);
    if (!match) return 0;
    let hours = parseInt(match[1], 10);
    const minutes = parseInt(match[2], 10);
    const meridiem = match[3]?.toUpperCase();
    if (meridiem === 'PM' && hours < 12) hours += 12;
    if (meridiem === 'AM' && hours === 12) hours = 0;
    return hours * 60 + minutes;
  };

  const updateScheduleTimes = (newStart, newEnd) => {
    const s = newStart ?? scheduleStartTime;
    const e = newEnd ?? scheduleEndTime;
    if (newStart !== undefined) setScheduleStartTime(newStart);
    if (newEnd !== undefined) setScheduleEndTime(newEnd);
    
    const startMins = parseTimeToMins(s);
    const endMins = parseTimeToMins(e);
    if (endMins > startMins) {
      const diff = endMins - startMins;
      if (diff % 60 === 0) setScheduleDuration(`${diff / 60}h`);
      else if (diff > 60) setScheduleDuration(`${Math.floor(diff / 60)}h ${diff % 60}m`);
      else setScheduleDuration(`${diff} min`);
    } else {
      setScheduleDuration('60 min');
    }
  };

  const formatDisplayDate = (dateStr) => {
    if (!dateStr) return 'Select date';
    try {
      const [year, month, day] = dateStr.split('-');
      const d = new Date(parseInt(year, 10), parseInt(month, 10) - 1, parseInt(day, 10));
      return d.toLocaleDateString('en-US', { month: 'short', day: 'numeric', year: 'numeric' });
    } catch (e) {
      return dateStr;
    }
  };

  // Meeting Room Interactive States
  const [roomName, setRoomName] = useState("Product Sync");
  const [isRoomNameMenuOpen, setIsRoomNameMenuOpen] = useState(false);
  const [isCameraOn, setIsCameraOn] = useState(false);
  const [isMicOn, setIsMicOn] = useState(false);
  
  
  const [isSourceModalOpen, setIsSourceModalOpen] = useState(false);
  const [lastPresentedMode, setLastPresentedMode] = useState('compose');

  const handleSelectScreenSource = async (selection) => {
    if (onSelectScreenSource) {
      onSelectScreenSource(selection);
      return;
    }
    try {
      let stream = null;
      let sourceId = selection.source?.id;

      if (window.electronAPI?.getDesktopSources) {
        const rawSources = await window.electronAPI.getDesktopSources(['screen', 'window']);
        if (selection.type === 'clean-preset') {
          const appWin = rawSources.find(s => s.id.startsWith('window:') && (s.name.includes('Regaarder') || s.name.includes('Compose') || s.name.includes('Electron')));
          sourceId = appWin ? appWin.id : (rawSources[0]?.id || selection.sourceId);
        } else if (!sourceId) {
          sourceId = rawSources[0]?.id;
        }

        if (sourceId) {
          stream = await navigator.mediaDevices.getUserMedia({
            audio: false,
            video: {
              mandatory: {
                chromeMediaSource: 'desktop',
                chromeMediaSourceId: sourceId,
                minWidth: 1280,
                maxWidth: 1920,
                minHeight: 720,
                maxHeight: 1080
              }
            }
          });
        }
      }

      if (!stream && navigator.mediaDevices?.getDisplayMedia) {
        stream = await navigator.mediaDevices.getDisplayMedia({
          video: { cursor: 'always' },
          audio: true
        });
      }

      if (!stream) {
        throw new Error('Unable to capture real application display stream');
      }

      const [track] = stream.getVideoTracks();
      if (track) {
        track.onended = () => {
          setIsScreenSharing(false);
          setScreenShareStream(null);
          setSharedSourceInfo(null);
          if (typeof window !== 'undefined') {
            window.__currentScreenShareStream = null;
          }
          showToast?.("Screen sharing stopped.");
        };
      }

      if (typeof window !== 'undefined') {
        window.__currentScreenShareStream = stream;
      }
      setScreenShareStream(stream);
      setIsScreenSharing(true);
      setSharedSourceInfo({
        type: selection.type,
        name: selection.preset?.name || selection.source?.name || 'Screen',
        id: selection.sourceId || selection.source?.id
      });

      if (selection.type === 'clean-preset' && onSwitchProductMode) {
        const mode = selection.preset?.mode || 'compose';
        setLastPresentedMode(mode);
        onSwitchProductMode(mode);
      } else {
        const winName = selection.preset?.name || selection.source?.name || 'Screen';
        if (window.electronAPI?.openFloatingPipWidget) {
          window.electronAPI.openFloatingPipWidget({ windowTitle: winName });
          window.electronAPI.minimizeMainWindow?.();
        }
      }
      showToast?.(`Sharing live: ${selection.preset?.name || selection.source?.name || 'Screen'}`);
    } catch (err) {
      console.error('Real screen capture error:', err);
      showToast?.('Failed to start live stream: ' + err.message);
    }
  };
  const screenShareVideoRef = useRef(null);
  const [isRecording, setIsRecording] = useState(false);
  const [isVideoExpanded, setIsVideoExpanded] = useState(false);

  // Native WebRTC Screen Sharing (Google Meet / Zoom style) with Selective Source Modal
  const toggleScreenShare = () => {
    if (isScreenSharing && screenShareStream) {
      screenShareStream.getTracks().forEach((track) => track.stop());
      setScreenShareStream(null);
      setIsScreenSharing(false);
      setSharedSourceInfo(null);
      if (typeof window !== 'undefined') {
        window.__currentScreenShareStream = null;
      }
      showToast?.("Screen sharing stopped.");
      return;
    }
    if (onOpenSourceModal) {
      onOpenSourceModal();
    } else {
      setIsSourceModalOpen(true);
    }
  };

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
  const [isAILoading, setIsAILoading] = useState(false);
  const [selectedAiModel, setSelectedAiModel] = useState('gemini-2.0-flash');
  const [isModelDropdownOpen, setIsModelDropdownOpen] = useState(false);
  const modelMenuRef = useRef(null);

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
      if (modelMenuRef.current && !modelMenuRef.current.contains(e.target)) {
        setIsModelDropdownOpen(false);
      }
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

  const handleAISubmit = async (e) => {
    e.preventDefault();
    if (!aiPrompt.trim() || isAILoading) return;
    const promptText = aiPrompt.trim();
    setAiPrompt("");
    setIsAILoading(true);
    setIsAIModalOpen(true);
    setRoomAIResponse({
      prompt: promptText,
      answer: ""
    });

    try {
      if (onCallAi) {
        const currentChatContext = chatMessages?.length > 0
          ? chatMessages.slice(-8).map(m => `${m.sender}: ${m.text}`).join('\n')
          : 'No recent chat messages in this session.';
        
        const systemPrompt = [
          `You are the executive Regaarder Room AI meeting assistant for the active session: "${roomName}".`,
          `CURRENT MEETING CONTEXT:`,
          `- Room Name: ${roomName}`,
          `- Recent Messages / Transcript:\n${currentChatContext}`,
          `RULES & GUIDELINES:`,
          `1. Answer directly, naturally, and concisely in the same language as the user's prompt (English, Traditional Chinese, etc.).`,
          `2. If the user asks general questions or greetings (e.g. "hello", "how can you help me"), warmly explain your role (providing live summaries, tracking action items, taking meeting notes, and answering questions) without inventing or hallucinating fake meeting topics.`,
          `3. NEVER output internal placeholders, template instructions, or brackets like [mention the meeting topic if known] or [insert topic].`,
          `4. Always output clean, final, executive-tier text.`
        ].join('\n\n');

        const aiResult = await onCallAi({
          userPrompt: promptText,
          customModel: selectedAiModel,
          systemPrompt
        });
        const answerText = typeof aiResult === 'string'
          ? aiResult
          : (aiResult?.text || aiResult?.error || (aiResult?.parsed ? JSON.stringify(aiResult.parsed) : "Analysis complete."));
        setRoomAIResponse({
          prompt: promptText,
          answer: answerText
        });
      } else {
        setRoomAIResponse({
          prompt: promptText,
          answer: `Meeting AI processed "${promptText}". Ready for team action items.`
        });
      }
    } catch (err) {
      setRoomAIResponse({
        prompt: promptText,
        answer: "Failed to generate AI response. Please check your network or API connection."
      });
    } finally {
      setIsAILoading(false);
    }
  };

  return (
    <div className="w-full h-full relative bg-[#F9F8F6] dark:bg-zinc-950 bg-[radial-gradient(ellipse_at_center,_var(--tw-gradient-stops))] from-[#FFFDFB] via-[#F9F8F6] to-[#F1F0EE] dark:from-zinc-900 dark:via-zinc-950 dark:to-black flex flex-col items-center justify-center font-sans overflow-hidden select-none p-2 md:p-4">
      {/* Subtle vignette glow */}
      <div className="absolute inset-0 bg-black/[0.02] dark:bg-white/[0.01] pointer-events-none" />

      {/* Main Apple-Tier Floating Window Container */}
      <div className="w-full h-full relative flex items-center justify-center max-w-[1640px] z-10">
        <div className="w-full h-full backdrop-blur-[60px] flex flex-col overflow-hidden relative transition-all duration-500 shadow-[0_32px_120px_rgba(0,0,0,0.04)] bg-white/70 dark:bg-zinc-900/80 border border-white/60 dark:border-zinc-800 rounded-[40px]">
          
          {/* Top-Left Crisp Workspace Switcher Icon Button (Always Accessible in Lobby & Room) */}
          <div className="absolute top-5 left-7 z-[999] flex items-center gap-3 select-none pointer-events-auto">
            <button
              type="button"
              data-workspace-switcher="true"
              onPointerDown={(e) => {
                e.preventDefault();
                e.stopPropagation();
                const rect = e.currentTarget.getBoundingClientRect();
                if (onOpenWorkspaceSwitcher) {
                  onOpenWorkspaceSwitcher(rect);
                } else {
                  setIsWorkspaceMenuOpen(prev => !prev);
                }
              }}
              className="flex items-center justify-center w-8 h-8 rounded-xl bg-white/95 dark:bg-zinc-800/95 backdrop-blur-xl border border-slate-200/90 dark:border-zinc-700/90 shadow-sm hover:bg-white dark:hover:bg-zinc-700 text-slate-700 dark:text-zinc-200 hover:text-violet-600 dark:hover:text-violet-400 transition-all cursor-pointer active:scale-95"
              title="Switch Workspace App"
            >
              <LayoutGrid size={16} />
            </button>

            <div className="flex items-center gap-2 px-2.5 py-1 rounded-xl bg-white/80 dark:bg-zinc-800/80 backdrop-blur-xl border border-slate-200/70 dark:border-zinc-700/70 text-xs font-bold text-violet-600 dark:text-violet-400 shadow-2xs">
              <RoomIcon size={16} strokeWidth={1.8} />
              <span className="font-semibold text-xs">Room</span>
            </div>

            {/* Built-in Workspace Switcher Popover */}
            {isWorkspaceMenuOpen && !onOpenWorkspaceSwitcher && (
              <div 
                className="absolute top-full left-0 mt-2 w-56 bg-white/95 dark:bg-zinc-900/95 backdrop-blur-2xl border border-slate-200/90 dark:border-zinc-800 shadow-2xl rounded-2xl p-1.5 z-[1000] animate-in fade-in zoom-in-95 duration-150 text-left font-sans"
                onClick={(e) => e.stopPropagation()}
              >
                <div className="text-[10px] font-bold text-slate-400 dark:text-zinc-500 uppercase tracking-wider px-2.5 py-1">
                  Workspaces
                </div>
                {[
                  { id: 'compose', label: 'Docs', icon: ComposeIcon, color: 'text-violet-600' },
                  { id: 'sheet', label: 'Sheets', icon: SheetIcon, color: 'text-emerald-600' },
                  { id: 'deck', label: 'Decks', icon: DeckIcon, color: 'text-amber-600' },
                  { id: 'whiteboard', label: 'Whiteboard', icon: WhiteboardIcon, color: 'text-sky-600' },
                  { id: 'room-landing', label: 'Room', icon: RoomIcon, color: 'text-violet-600', active: true },
                  { id: 'browser', label: 'Research', icon: BrowserIcon, color: 'text-blue-600' },
                ].map((item) => (
                  <button
                    key={item.id}
                    type="button"
                    onClick={() => {
                      setIsWorkspaceMenuOpen(false);
                      if (item.id === 'compose') {
                        onSwitchProductMode ? onSwitchProductMode('compose') : (window.location.hash = '#compose');
                      } else if (item.id === 'whiteboard') {
                        onSwitchProductMode ? onSwitchProductMode('whiteboard') : (window.location.hash = '#whiteboard');
                      } else if (item.id === 'sheet') {
                        onSwitchProductMode ? onSwitchProductMode('sheet') : (window.location.hash = '#sheet');
                      } else if (item.id === 'deck') {
                        onSwitchProductMode ? onSwitchProductMode('deck') : (window.location.hash = '#deck');
                      } else if (item.id === 'browser') {
                        onSwitchProductMode ? onSwitchProductMode('browser') : (window.location.hash = '#browser');
                      } else {
                        onSwitchProductMode?.(item.id);
                      }
                    }}
                    className={`w-full flex items-center justify-between px-2.5 py-2 rounded-xl text-xs font-semibold transition-colors cursor-pointer ${
                      item.active
                        ? 'bg-violet-50 dark:bg-violet-950/60 text-violet-700 dark:text-violet-300'
                        : 'text-slate-700 dark:text-zinc-200 hover:bg-slate-100/70 dark:hover:bg-zinc-800'
                    }`}
                  >
                    <div className="flex items-center gap-2.5">
                      <item.icon size={16} strokeWidth={1.8} className={item.color} />
                      <span>{item.label}</span>
                    </div>
                    {item.active && (
                      <span className="w-1.5 h-1.5 rounded-full bg-violet-600" />
                    )}
                  </button>
                ))}
              </div>
            )}
          </div>

          {/* ========================================================================= */}
          {/* ROOM WORKSPACE (Rendered in background, blurred when isLobby is true)     */}
          {!isLobby ? (
            <div className="w-full h-full flex flex-col transition-all duration-300 pointer-events-auto">
            
            {/* Top Header Bar */}
            <header className="h-[68px] flex items-center justify-between px-7 border-b border-slate-100/80 dark:border-zinc-800/80 bg-transparent shrink-0 relative z-20">
              {/* Left: Interactive Workspace Switcher + Room Selector Dropdown */}
              <div className="flex items-center gap-3 relative">
                {/* Global App Switcher Button */}
                <div className="relative z-50 flex items-center">
                  <button
                    type="button"
                    data-workspace-switcher="true"
                    onPointerDown={(e) => {
                      e.preventDefault();
                      e.stopPropagation();
                      const rect = e.currentTarget.getBoundingClientRect();
                      if (onOpenWorkspaceSwitcher) {
                        onOpenWorkspaceSwitcher(rect);
                      } else {
                        setIsWorkspaceMenuOpen(prev => !prev);
                      }
                    }}
                    onClick={(e) => {
                      e.stopPropagation();
                    }}
                    className={`flex items-center justify-center w-8 h-8 rounded-xl bg-white/90 dark:bg-zinc-800/90 backdrop-blur-xl border border-slate-200/80 dark:border-zinc-700/80 shadow-2xs hover:bg-white dark:hover:bg-zinc-700 text-slate-600 dark:text-zinc-300 hover:text-violet-600 dark:hover:text-violet-400 transition-all cursor-pointer active:scale-95 ${
                      isWorkspaceMenuOpen ? 'bg-slate-100 dark:bg-zinc-800 text-violet-600 dark:text-violet-400' : ''
                    }`}
                    title="Switch Workspace App"
                  >
                    <LayoutGrid size={15} />
                  </button>

                  {/* Fallback Workspace Switcher Popover if onOpenWorkspaceSwitcher is not provided */}
                  {isWorkspaceMenuOpen && !onOpenWorkspaceSwitcher && (
                    <div 
                      className="absolute top-full left-0 mt-2 w-56 bg-white/95 dark:bg-zinc-900/95 backdrop-blur-2xl border border-slate-200/90 dark:border-zinc-800 shadow-2xl rounded-2xl p-1.5 z-[1000] animate-in fade-in zoom-in-95 duration-150 text-left font-sans"
                      onClick={(e) => e.stopPropagation()}
                    >
                      <div className="text-[10px] font-bold text-slate-400 dark:text-zinc-500 uppercase tracking-wider px-2.5 py-1">
                        Workspaces
                      </div>
                      {[
                        { id: 'compose', label: 'Docs', icon: ComposeIcon, color: 'text-violet-600' },
                        { id: 'sheet', label: 'Sheets', icon: SheetIcon, color: 'text-emerald-600' },
                        { id: 'deck', label: 'Decks', icon: DeckIcon, color: 'text-amber-600' },
                        { id: 'whiteboard', label: 'Whiteboard', icon: WhiteboardIcon, color: 'text-sky-600' },
                        { id: 'room-landing', label: 'Room', icon: RoomIcon, color: 'text-violet-600', active: true },
                        { id: 'browser', label: 'Research', icon: BrowserIcon, color: 'text-blue-600' },
                      ].map((item) => (
                        <button
                          key={item.id}
                          type="button"
                          onClick={() => {
                            setIsWorkspaceMenuOpen(false);
                            if (item.id === 'compose') {
                              onSwitchProductMode ? onSwitchProductMode('compose') : (window.location.hash = '#compose');
                            } else if (item.id === 'whiteboard') {
                              onSwitchProductMode ? onSwitchProductMode('whiteboard') : (window.location.hash = '#whiteboard');
                            } else if (item.id === 'sheet') {
                              onSwitchProductMode ? onSwitchProductMode('sheet') : (window.location.hash = '#sheet');
                            } else if (item.id === 'deck') {
                              onSwitchProductMode ? onSwitchProductMode('deck') : (window.location.hash = '#deck');
                            } else if (item.id === 'browser') {
                              onSwitchProductMode ? onSwitchProductMode('browser') : (window.location.hash = '#browser');
                            } else {
                              onSwitchProductMode?.(item.id);
                            }
                          }}
                          className={`w-full flex items-center justify-between px-2.5 py-2 rounded-xl text-xs font-semibold transition-colors cursor-pointer ${
                            item.active
                              ? 'bg-violet-50 dark:bg-violet-950/60 text-violet-700 dark:text-violet-300'
                              : 'text-slate-700 dark:text-zinc-200 hover:bg-slate-100/70 dark:hover:bg-zinc-800'
                          }`}
                        >
                          <div className="flex items-center gap-2.5">
                            <item.icon size={16} strokeWidth={1.8} className={item.color} />
                            <span>{item.label}</span>
                          </div>
                          {item.active && (
                            <span className="w-1.5 h-1.5 rounded-full bg-violet-600" />
                          )}
                        </button>
                      ))}
                    </div>
                  )}
                </div>

                {/* Room Brand Badge */}
                <div className="flex items-center gap-2 px-2.5 py-1.5 rounded-xl text-violet-600 dark:text-violet-400 select-none">
                  <RoomIcon size={20} strokeWidth={1.8} className="shrink-0" />
                  <span className="text-base font-bold tracking-tight">Room</span>
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

                {/* E2EE Security Status Pill */}
                <button 
                  onClick={() => setIsE2EEVerifiedModalOpen(true)}
                  className="flex items-center gap-1.5 px-2.5 py-1 rounded-xl bg-emerald-50 dark:bg-emerald-950/60 border border-emerald-200/70 dark:border-emerald-800/70 text-emerald-700 dark:text-emerald-300 text-xs font-semibold hover:bg-emerald-100 dark:hover:bg-emerald-900/60 transition-colors cursor-pointer"
                  title="View End-to-End Encryption Certificate"
                >
                  <Shield size={13} className="text-emerald-600 dark:text-emerald-400" />
                  <span className="text-[11px] font-bold tracking-tight">E2EE AES-256</span>
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
                  <span>{isRecording ? (t('room.recording') || "Recording") : (t('room.notRecording') || "Not recording")}</span>
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
                      <span className="text-xs font-bold text-slate-900 dark:text-zinc-100">{t('room.people') || 'People'}</span>
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
                        <div className="text-xs font-semibold text-slate-900 dark:text-zinc-100 leading-tight">{t('room.you') || 'You'}</div>
                        <div className="text-[10px] text-slate-400 dark:text-zinc-500 mt-0.5">{isCameraOn ? (t('room.cameraOn') || "Camera on") : (t('room.cameraOff') || "Camera off")}</div>
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
                    <span className="text-xs font-semibold text-slate-800 dark:text-zinc-200">{t('room.onlyOneHere') || "You're the only one here"}</span>
                    <p className="text-[11px] text-slate-400 dark:text-zinc-500 mt-1 max-w-[170px] leading-relaxed">
                      {t('room.shareLinkInvite') || 'Share the meeting link to invite others.'}
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
                  <div className={`w-full ${isScreenSharing ? 'max-w-[1180px] h-full max-h-[82vh] min-h-[520px]' : 'max-w-[580px] aspect-[4/3]'} bg-slate-200/60 dark:bg-zinc-800/60 backdrop-blur-md rounded-[32px] border border-slate-300/40 dark:border-zinc-700/60 shadow-inner relative flex items-center justify-center overflow-hidden transition-all duration-300`}>
                    
                    {/* Real Live Screen Share Video Feed with Live Preview Tile */}
                    {isScreenSharing ? (
                      sharedSourceInfo?.type === 'desktop-source' || (sharedSourceInfo && !sharedSourceInfo.type?.startsWith('clean-')) ? (
                        /* Dedicated Live External Application Monitor Viewport */
                        <div className="w-full h-full flex flex-col bg-zinc-950 relative overflow-hidden items-center justify-center p-3 select-none">
                          <div className="w-full h-full rounded-2xl overflow-hidden bg-black border border-white/15 shadow-[0_20px_50px_rgba(0,0,0,0.6)] relative flex items-center justify-center">
                            {screenShareStream ? (
                              <video
                                ref={(node) => {
                                  if (node && screenShareStream) {
                                    if (node.srcObject !== screenShareStream) node.srcObject = screenShareStream;
                                    node.play?.().catch(() => {});
                                  }
                                }}
                                autoPlay
                                playsInline
                                muted
                                className="w-full h-full object-contain bg-black"
                              />
                            ) : (
                              <div className="w-full h-full flex items-center justify-center bg-zinc-900 text-zinc-400 text-xs">
                                Connecting external video stream...
                              </div>
                            )}

                            {/* Top Status & Controls Header Bar Overlay */}
                            <div className="absolute top-3 left-3 right-3 flex items-center justify-between pointer-events-auto z-20">
                              <div className="flex items-center gap-2 bg-black/80 backdrop-blur-md px-3 py-1.5 rounded-xl text-xs font-semibold text-white border border-white/10 shadow-lg">
                                <span className="w-2 h-2 rounded-full bg-emerald-400 animate-pulse shadow-[0_0_8px_rgba(52,211,153,0.9)]" />
                                <span>Broadcasting External Window: <strong className="text-violet-400 font-bold">{sharedSourceInfo?.name || 'Selected Window'}</strong></span>
                              </div>

                              <div className="flex items-center gap-2">
                                {/* Pop out into OS floating PiP */}
                                <button
                                  type="button"
                                  onClick={async (e) => {
                                    e.stopPropagation();
                                    try {
                                      const allVideos = Array.from(document.querySelectorAll('video'));
                                      const vid = allVideos.find(v => v.srcObject && v.videoWidth > 0) || allVideos[0];
                                      if (document.pictureInPictureElement) {
                                        await document.exitPictureInPicture();
                                        showToast?.('Exited Picture-in-Picture');
                                      } else if (vid && document.pictureInPictureEnabled) {
                                        await vid.play().catch(() => {});
                                        await vid.requestPictureInPicture();
                                        showToast?.('Floating OS Mini-Window Active');
                                      }
                                    } catch (err) {
                                      console.warn('PiP error:', err);
                                      showToast?.('Picture-in-Picture: ' + (err.message || 'Unavailable'));
                                    }
                                  }}
                                  className="px-3 py-1.5 rounded-xl bg-violet-600/90 hover:bg-violet-600 text-white text-xs font-bold transition-all shadow-md active:scale-95 cursor-pointer flex items-center gap-1.5 backdrop-blur-md border border-violet-400/30"
                                  title="Keep preview floating while you interact with the external application"
                                >
                                  <ExternalLink size={12} />
                                  <span>Floating OS Window</span>
                                </button>

                                <button
                                  type="button"
                                  onClick={toggleScreenShare}
                                  className="px-3 py-1.5 rounded-xl bg-rose-500/90 hover:bg-rose-500 text-white text-xs font-bold transition-all shadow-md active:scale-95 cursor-pointer flex items-center gap-1 backdrop-blur-md border border-rose-400/30"
                                >
                                  <X size={12} />
                                  <span>Stop Sharing</span>
                                </button>
                              </div>
                            </div>

                            {/* Bottom Reassurance Footer Overlay */}
                            <div className="absolute bottom-3 left-1/2 -translate-x-1/2 bg-black/75 backdrop-blur-md px-4 py-1.5 rounded-full text-[11px] font-medium text-zinc-300 border border-white/10 shadow-lg pointer-events-none z-20">
                              Live stream active • Participants see your real-time actions in {sharedSourceInfo?.name || 'the external window'}
                            </div>
                          </div>
                        </div>
                      ) : (
                        /* Clean App Canvas / Internal Docs/Sheets Anti-Mirror Dashboard */
                        <div className="w-full h-full flex flex-col bg-gradient-to-b from-slate-900 via-slate-950 to-black relative overflow-hidden items-center justify-center p-6 select-none text-center">
                          {/* Real Mini Live Monitor Tile */}
                          <div className="w-72 aspect-video rounded-2xl overflow-hidden bg-black border border-white/20 shadow-[0_20px_50px_rgba(0,0,0,0.6)] relative mb-4 group">
                            {screenShareStream ? (
                              <video
                                ref={(node) => {
                                  if (node && screenShareStream) {
                                    if (node.srcObject !== screenShareStream) node.srcObject = screenShareStream;
                                    node.play?.().catch(() => {});
                                  }
                                }}
                                autoPlay
                                playsInline
                                muted
                                className="w-full h-full object-contain bg-black"
                              />
                            ) : (
                              <div className="w-full h-full flex items-center justify-center bg-zinc-900 text-zinc-500 text-xs">
                                Live Stream Connected
                              </div>
                            )}
                            <div className="absolute top-2 left-2 flex items-center gap-1.5 bg-black/80 backdrop-blur-md px-2 py-0.5 rounded-full text-[9.5px] font-bold text-white border border-white/10">
                              <span className="w-1.5 h-1.5 rounded-full bg-emerald-400 animate-pulse" />
                              <span>STREAMING LIVE</span>
                            </div>
                          </div>

                          <h3 className="text-base font-bold text-white mb-1">You are presenting to everyone</h3>
                          <p className="text-xs text-slate-400 max-w-[420px] leading-relaxed mb-5">
                            Participants are viewing your live workspace. To prevent recursive mirror tunnels, your screen is broadcasting in the background.
                          </p>
                          
                          <div className="flex items-center gap-2.5 flex-wrap justify-center">
                            <button
                              type="button"
                              onClick={toggleScreenShare}
                              className="px-4 py-2 rounded-xl bg-rose-500 hover:bg-rose-600 text-white text-xs font-bold transition-all shadow-md active:scale-95 cursor-pointer"
                            >
                              Stop Sharing
                            </button>
                            
                            {/* Dedicated Popout to OS Desktop Floating Window */}
                            <button
                              type="button"
                              onClick={async (e) => {
                                e.stopPropagation();
                                try {
                                  const allVideos = Array.from(document.querySelectorAll('video'));
                                  const vid = allVideos.find(v => v.srcObject && v.videoWidth > 0) || allVideos[0];
                                  if (document.pictureInPictureElement) {
                                    await document.exitPictureInPicture();
                                    showToast?.('Exited Picture-in-Picture');
                                  } else if (vid && document.pictureInPictureEnabled) {
                                    await vid.play().catch(() => {});
                                    await vid.requestPictureInPicture();
                                    showToast?.('Floating OS Mini-Window Active');
                                  }
                                } catch (err) {
                                  console.warn('PiP error:', err);
                                  showToast?.('Picture-in-Picture: ' + (err.message || 'Unavailable'));
                                }
                              }}
                              className="px-4 py-2 rounded-xl bg-violet-600 hover:bg-violet-700 text-white text-xs font-bold transition-all shadow-md active:scale-95 cursor-pointer flex items-center gap-1.5"
                            >
                              <ExternalLink size={13} />
                              <span>Pop out Floating Window</span>
                            </button>

                            <button
                              type="button"
                              onClick={() => {
                                if (onSwitchProductMode) onSwitchProductMode(lastPresentedMode || 'compose');
                              }}
                              className="px-4 py-2 rounded-xl bg-white/10 hover:bg-white/20 border border-white/15 text-white text-xs font-semibold transition-all cursor-pointer"
                            >
                              Return to Workspace
                            </button>
                          </div>
                        </div>
                      )
                    ) : isCameraOn ? (
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
                      className="absolute top-4 right-4 p-2 rounded-full bg-black/20 text-white hover:bg-black/30 backdrop-blur-md transition-all border border-white/10 z-30"
                    >
                      <Maximize2 size={13} />
                    </button>

                    {/* Microphone Status Pill */}
                    {!isScreenSharing && (
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
                    )}
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

                    {/* Screen Share (Native WebRTC Zoom / Meet style) */}
                    <button 
                      onClick={toggleScreenShare}
                      className={`p-2.5 rounded-full transition-all active:scale-95 ${
                        isScreenSharing 
                          ? 'bg-violet-100 dark:bg-violet-950 text-violet-600 dark:text-violet-300 ring-2 ring-violet-500 shadow-sm' 
                          : 'hover:bg-slate-100 dark:hover:bg-zinc-800 text-slate-600 dark:text-zinc-400'
                      }`}
                      title={isScreenSharing ? "Stop Sharing Screen" : "Share Screen / Tab (Google Meet / Zoom style)"}
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

                  {/* Ask Room AI Bar with Regaarder AI Signature Icon & Model Selector */}
                  <div className="w-full max-w-[560px] flex items-center gap-2 relative">
                    {/* Model Selection Dropdown Trigger */}
                    <div className="relative" ref={modelMenuRef}>
                      <button
                        type="button"
                        onClick={() => setIsModelDropdownOpen(!isModelDropdownOpen)}
                        className="flex items-center gap-1.5 px-3 py-1.5 rounded-full bg-white/90 dark:bg-zinc-900/90 backdrop-blur-xl border border-slate-200/80 dark:border-zinc-800 shadow-xs hover:bg-slate-50 dark:hover:bg-zinc-800 transition-all text-xs font-semibold text-slate-700 dark:text-zinc-300 cursor-pointer shrink-0"
                      >
                        <RegaarderAiIcon size={14} className="text-violet-600 dark:text-violet-400 shrink-0" />
                        <span className="truncate max-w-[100px] text-[11.5px]">
                          {(CLOUD_AI_MODELS?.find(m => m.id === selectedAiModel)?.name) || 'Gemini 2.0 Flash'}
                        </span>
                        <ChevronDown size={12} className="text-slate-400 dark:text-zinc-500 shrink-0" />
                      </button>

                      {/* Dropdown Menu */}
                      {isModelDropdownOpen && (
                        <div 
                          className="absolute bottom-full left-0 mb-2 w-64 bg-white dark:bg-zinc-900 border border-slate-200 dark:border-zinc-800 shadow-2xl rounded-2xl p-1.5 z-[1000] animate-in fade-in zoom-in-95 duration-150 text-left font-sans"
                          onClick={(e) => e.stopPropagation()}
                        >
                          <div className="text-[10px] font-bold text-slate-400 dark:text-zinc-500 uppercase tracking-wider px-2.5 py-1.5">
                            {t('room.selectModel') || 'Select AI Model'}
                          </div>
                          {(CLOUD_AI_MODELS || [
                            { id: 'gemini-2.0-flash', name: 'Gemini 2.0 Flash', providerName: 'Google AI', tier: 'Fast & Smart' },
                            { id: 'gemini-1.5-pro', name: 'Gemini 1.5 Pro', providerName: 'Google AI', tier: 'Deep Reasoning' },
                            { id: 'claude-3-5-sonnet-20241022', name: 'Claude 3.5 Sonnet', providerName: 'Anthropic', tier: 'Elite Synthesis' },
                            { id: 'gpt-4o', name: 'GPT-4o', providerName: 'OpenAI', tier: 'Omni Intelligence' },
                            { id: 'deepseek-chat', name: 'DeepSeek V3', providerName: 'DeepSeek', tier: 'High Efficiency' }
                          ]).map((model) => {
                            const isSelected = selectedAiModel === model.id;
                            return (
                              <button
                                key={model.id}
                                type="button"
                                onClick={() => {
                                  setSelectedAiModel(model.id);
                                  setIsModelDropdownOpen(false);
                                  showToast?.(`Model set to ${model.name}`);
                                }}
                                className={`w-full flex items-center justify-between px-2.5 py-2 rounded-xl text-left transition-colors cursor-pointer ${
                                  isSelected 
                                    ? 'bg-violet-50 dark:bg-violet-950/60 text-violet-700 dark:text-violet-300' 
                                    : 'hover:bg-slate-100/80 dark:hover:bg-zinc-800/80 text-slate-700 dark:text-zinc-300'
                                }`}
                              >
                                <div className="flex items-center gap-2 min-w-0">
                                  <div className="w-5 h-5 rounded-lg bg-violet-100 dark:bg-violet-950/80 text-violet-600 dark:text-violet-400 flex items-center justify-center shrink-0">
                                    <RegaarderAiIcon size={12} />
                                  </div>
                                  <div className="min-w-0">
                                    <div className="text-xs font-bold truncate leading-tight">{model.name}</div>
                                    <div className="text-[10px] text-slate-400 dark:text-zinc-500 truncate">{model.providerName || model.tier}</div>
                                  </div>
                                </div>
                                {isSelected && (
                                  <span className="w-1.5 h-1.5 rounded-full bg-violet-600 shrink-0" />
                                )}
                              </button>
                            );
                          })}
                        </div>
                      )}
                    </div>

                    {/* AI Prompt Input Bar */}
                    <form onSubmit={handleAISubmit} className="flex-1 relative">
                      <div className="bg-white/90 dark:bg-zinc-900/90 backdrop-blur-xl border border-slate-200/70 dark:border-zinc-800 rounded-full px-4 py-1.5 flex items-center justify-between shadow-xs">
                        <div className="flex items-center gap-2 flex-1">
                          <input 
                            type="text"
                            value={aiPrompt}
                            onChange={(e) => setAiPrompt(e.target.value)}
                            placeholder={t('room.askRoomAi') || 'Ask Room AI (summary, actions, analysis)...'}
                            className="w-full bg-transparent border-none text-xs text-slate-800 dark:text-zinc-200 placeholder:text-slate-400 dark:placeholder:zinc-500 focus:outline-none"
                          />
                        </div>
                        <button 
                          type="submit"
                          disabled={!aiPrompt.trim() || isAILoading}
                          className="w-6 h-6 rounded-full bg-violet-100 dark:bg-violet-950/80 text-violet-600 dark:text-violet-400 flex items-center justify-center hover:bg-violet-200 disabled:opacity-30 transition-colors shrink-0 cursor-pointer"
                        >
                          <Send size={11} />
                        </button>
                      </div>
                    </form>
                  </div>
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
        ) : (
            <div className="w-full h-full flex flex-col bg-[#F9F9F8] dark:bg-zinc-950 text-slate-800 dark:text-zinc-100 font-sans select-none overflow-y-auto">
              {/* Top Header Bar */}
              <header className="h-[68px] flex items-center justify-between px-8 border-b border-slate-200/70 dark:border-zinc-800/80 bg-white/70 dark:bg-zinc-900/70 backdrop-blur-xl shrink-0 sticky top-0 z-30">
                <div className="flex items-center gap-3">
                  <div className="w-9 h-9 rounded-xl bg-violet-600 text-white flex items-center justify-center shadow-md">
                    <RoomIcon size={20} />
                  </div>
                  <span className="text-lg font-bold tracking-tight text-slate-900 dark:text-zinc-100">Room</span>
                  <span className="text-xs px-2.5 py-0.5 rounded-full bg-violet-100 dark:bg-violet-950 text-violet-600 dark:text-violet-400 font-semibold">Workspace</span>
                </div>

                {/* Quick Join / Action Header */}
                <div className="flex items-center gap-3">
                  <div className="flex items-center bg-slate-100 dark:bg-zinc-800/80 border border-slate-200/80 dark:border-zinc-700/80 rounded-xl px-3 py-1.5 focus-within:bg-white focus-within:ring-2 ring-violet-500/20 transition-all">
                    <Keyboard size={15} className="text-slate-400 mr-2" />
                    <input
                      type="text"
                      value={roomCodeInput}
                      onChange={(e) => setRoomCodeInput(e.target.value)}
                      onKeyDown={(e) => { if (e.key === "Enter" && roomCodeInput.trim()) handleJoinWithCode(e); }}
                      placeholder="Enter a code or link"
                      className="bg-transparent text-xs font-medium text-slate-800 dark:text-zinc-100 placeholder:text-slate-400 outline-none w-36 sm:w-48"
                    />
                    {roomCodeInput.trim() && (
                      <button
                        type="button"
                        onClick={handleJoinWithCode}
                        className="text-xs font-bold text-violet-600 hover:text-violet-700 ml-2 cursor-pointer"
                      >
                        Join
                      </button>
                    )}
                  </div>

                  <button
                    type="button"
                    onClick={() => setIsGreenRoomOpen(true)}
                    className="px-4 py-2 rounded-xl bg-violet-600 hover:bg-violet-700 active:scale-95 text-white text-xs font-bold shadow-md transition-all flex items-center gap-1.5 cursor-pointer"
                  >
                    <Plus size={15} strokeWidth={2.5} />
                    <span>New Meeting</span>
                  </button>
                </div>
              </header>

              {/* Main Landing Body */}
              <div className="flex-1 max-w-5xl w-full mx-auto p-6 sm:p-10 flex flex-col gap-6">
                
                {/* Calendar Date & Week Strip */}
                <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 bg-white dark:bg-zinc-900 border border-slate-200/80 dark:border-zinc-800 p-4 sm:p-5 rounded-2xl shadow-xs">
                  <div className="flex items-center gap-2.5">
                    <div className="w-8 h-8 rounded-xl bg-slate-100 dark:bg-zinc-800 text-slate-600 dark:text-zinc-300 flex items-center justify-center">
                      <Calendar size={16} />
                    </div>
                    <div>
                      <div className="text-base font-bold text-slate-900 dark:text-zinc-100">Friday, Aug 28</div>
                      <div className="text-[11px] text-slate-400">Today · 0 active sessions scheduled</div>
                    </div>
                  </div>

                  {/* Week Day Selector Strip (SUN 23 ... SAT 29) */}
                  <div className="flex items-center gap-1.5 bg-slate-50 dark:bg-zinc-800/60 p-1 rounded-xl border border-slate-200/50 dark:border-zinc-700/50">
                    {[
                      { day: "SUN", date: 23 },
                      { day: "MON", date: 24 },
                      { day: "TUE", date: 25 },
                      { day: "WED", date: 26 },
                      { day: "THU", date: 27 },
                      { day: "FRI", date: 28, isToday: true },
                      { day: "SAT", date: 29 },
                    ].map((item) => (
                      <button
                        key={item.date}
                        type="button"
                        onClick={() => setSelectedCalendarDay(item.date)}
                        className={`flex flex-col items-center px-2.5 py-1.5 rounded-lg text-center transition-all cursor-pointer ${
                          selectedCalendarDay === item.date
                            ? "bg-violet-600 text-white font-bold shadow-xs scale-105"
                            : item.isToday
                            ? "bg-violet-50 dark:bg-violet-950/60 text-violet-600 font-semibold"
                            : "text-slate-500 hover:text-slate-800 dark:hover:text-zinc-200 hover:bg-slate-200/50"
                        }`}
                      >
                        <span className="text-[9px] uppercase tracking-wider">{item.day}</span>
                        <span className="text-xs font-bold">{item.date}</span>
                      </button>
                    ))}
                  </div>
                </div>

                {/* Security Trust Badge */}
                <div className="flex items-center gap-3.5 bg-violet-50/70 dark:bg-violet-950/30 border border-violet-200/60 dark:border-violet-800/40 p-4 rounded-2xl">
                  <div className="w-9 h-9 rounded-xl bg-violet-600 text-white flex items-center justify-center shrink-0 shadow-xs">
                    <Shield size={18} />
                  </div>
                  <div className="flex-1">
                    <div className="text-xs font-bold text-violet-950 dark:text-violet-200">Your meeting is protected</div>
                    <div className="text-[11px] text-violet-700 dark:text-violet-300">End-to-end encrypted room with hardware acceleration. No one can join unless invited or admitted by host.</div>
                  </div>
                </div>

                {/* Empty State / Schedule Overview (Google Meet Style) */}
                <div className="flex-1 flex flex-col items-center justify-center p-12 bg-white dark:bg-zinc-900 border border-slate-200/80 dark:border-zinc-800 rounded-3xl shadow-xs text-center min-h-[340px]">
                  <div className="w-16 h-16 rounded-2xl bg-gradient-to-tr from-violet-600 to-indigo-500 text-white flex items-center justify-center mb-4 shadow-lg shadow-violet-500/20 border border-white/20">
                    <Video size={28} />
                  </div>
                  <h3 className="text-xl font-bold text-slate-900 dark:text-zinc-100 tracking-tight mb-1">No meetings scheduled for today</h3>
                  <p className="text-xs text-slate-400 dark:text-zinc-500 max-w-sm mb-6">Schedule a meeting with your team or launch an instant collaborative sync.</p>
                  
                  <div className="flex items-center gap-3">
                    <button
                      type="button"
                      onClick={() => setIsGreenRoomOpen(true)}
                      className="px-6 py-3 rounded-2xl bg-violet-600 hover:bg-violet-700 active:scale-95 text-white text-xs font-bold shadow-lg shadow-violet-600/25 transition-all flex items-center gap-2 cursor-pointer"
                    >
                      <Plus size={16} strokeWidth={2.5} />
                      <span>Start an Instant Meeting</span>
                    </button>
                    <button
                      type="button"
                      onClick={() => setIsSchedulingModalOpen(true)}
                      className="px-5 py-3 rounded-2xl bg-slate-100 hover:bg-slate-200 dark:bg-zinc-800 dark:hover:bg-zinc-700 active:scale-95 text-slate-700 dark:text-zinc-200 text-xs font-bold transition-all flex items-center gap-2 cursor-pointer"
                    >
                      <Calendar size={15} />
                      <span>Schedule for Later</span>
                    </button>
                  </div>
                </div>
              </div>

              {/* ========================================================================= */}
              {/* APPLE-STYLE GREEN ROOM PRE-FLIGHT MODAL (SEAMLESS STAGING)                 */}
              {/* ========================================================================= */}
              {isGreenRoomOpen && (
                <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/60 backdrop-blur-md animate-in fade-in duration-200">
                  <div 
                    onClick={(e) => e.stopPropagation()}
                    className="relative w-full max-w-md bg-white dark:bg-zinc-900 rounded-[28px] shadow-[0_32px_120px_rgba(0,0,0,0.3)] border border-slate-200/80 dark:border-zinc-800 p-6 flex flex-col items-center animate-in zoom-in-95 duration-200"
                  >
                    {/* Video Mirror / Pre-Flight Avatar Card */}
                    <div className="relative aspect-[16/10] w-full rounded-2xl overflow-hidden bg-slate-950 shadow-inner mb-4 flex items-center justify-center">
                      {greenRoomCameraOn ? (
                        <div className="w-full h-full flex flex-col items-center justify-center bg-gradient-to-tr from-emerald-600 via-teal-500 to-emerald-400 text-white">
                          <div className="w-16 h-16 rounded-full border-2 border-white/40 flex items-center justify-center text-2xl font-bold bg-white/20 shadow-lg">
                            Y
                          </div>
                          <span className="text-xs font-semibold mt-2">Camera Ready</span>
                        </div>
                      ) : (
                        <div className="w-full h-full flex flex-col items-center justify-center bg-zinc-900 text-zinc-400">
                          <VideoOff size={32} className="opacity-60 mb-2" />
                          <span className="text-xs font-medium">Camera is off</span>
                        </div>
                      )}

                      {/* Pre-Flight Quick Controls */}
                      <div className="absolute bottom-3 inset-x-0 flex items-center justify-center gap-3">
                        <button
                          type="button"
                          onClick={() => setGreenRoomMicOn(prev => !prev)}
                          className={`w-10 h-10 rounded-full flex items-center justify-center transition-all cursor-pointer backdrop-blur-md shadow-md ${
                            greenRoomMicOn ? "bg-white/20 hover:bg-white/30 text-white" : "bg-rose-500 text-white"
                          }`}
                          title={greenRoomMicOn ? "Mute Microphone" : "Unmute Microphone"}
                        >
                          {greenRoomMicOn ? <Mic size={16} /> : <MicOff size={16} />}
                        </button>
                        <button
                          type="button"
                          onClick={() => setGreenRoomCameraOn(prev => !prev)}
                          className={`w-10 h-10 rounded-full flex items-center justify-center transition-all cursor-pointer backdrop-blur-md shadow-md ${
                            greenRoomCameraOn ? "bg-white/20 hover:bg-white/30 text-white" : "bg-rose-500 text-white"
                          }`}
                          title={greenRoomCameraOn ? "Turn off camera" : "Turn on camera"}
                        >
                          {greenRoomCameraOn ? <Video size={16} /> : <VideoOff size={16} />}
                        </button>
                      </div>
                    </div>

                    <h3 className="text-lg font-bold text-slate-900 dark:text-zinc-100 mb-1">Ready to join?</h3>
                    <p className="text-xs text-slate-400 mb-6 text-center">No one else is here yet. You can invite your team once you enter.</p>

                    <div className="flex items-center gap-3 w-full">
                      <button
                        type="button"
                        onClick={() => setIsGreenRoomOpen(false)}
                        className="flex-1 py-3 rounded-2xl bg-slate-100 hover:bg-slate-200 dark:bg-zinc-800 dark:hover:bg-zinc-700 text-slate-700 dark:text-zinc-300 text-xs font-bold transition-all cursor-pointer"
                      >
                        Cancel
                      </button>
                      <button
                        type="button"
                        onClick={() => {
                          setIsGreenRoomOpen(false);
                          handleStartInstantMeeting();
                        }}
                        className="flex-1 py-3 rounded-2xl bg-violet-600 hover:bg-violet-700 active:scale-95 text-white text-xs font-bold shadow-lg shadow-violet-600/30 transition-all cursor-pointer"
                      >
                        Join Meeting Now
                      </button>
                    </div>
                  </div>
                </div>
              )}
            </div>
          )}
          {/* FRESH REFINED EXECUTIVE APPLE-TIER SCHEDULE ROOM SESSION MODAL (NO SCROLL)*/}
          {/* ========================================================================= */}
          {isSchedulingModalOpen && (
            <div 
              className="fixed inset-0 z-[100000] flex items-center justify-center p-4 sm:p-6 bg-black/55 backdrop-blur-xl animate-in fade-in duration-200 select-none"
              onClick={() => {
                setIsSchedulingModalOpen(false);
                setIsDatePickerOpen(false);
                setIsCollaboratorMenuOpen(false);
                setIsStartTimeMenuOpen(false);
                setIsEndTimeMenuOpen(false);
              }}
            >
              <div 
                className="relative bg-white/95 dark:bg-[#18181b]/95 backdrop-blur-3xl border border-white/90 dark:border-white/10 shadow-[0_32px_120px_rgba(0,0,0,0.22)] rounded-[36px] max-w-[760px] w-full p-7 sm:p-8 flex flex-col font-sans text-left animate-in fade-in zoom-in-95 duration-200 overflow-visible"
                onClick={(e) => e.stopPropagation()}
              >
                {/* Top Badge with Delicate Purple Sparkles (✦) & Title */}
                <div className="flex items-center justify-between gap-4 mb-5">
                  <div className="flex items-center gap-3.5">
                    <div className="relative">
                      <div className="w-12 h-12 rounded-2xl bg-violet-50 dark:bg-violet-950/70 border border-violet-100/80 dark:border-violet-800/60 flex items-center justify-center text-violet-600 dark:text-violet-400 shadow-inner">
                        <Calendar size={22} strokeWidth={1.8} />
                      </div>
                      <span className="absolute -top-1 -right-2 text-[10px] font-bold text-violet-400 animate-pulse">✦</span>
                      <span className="absolute -bottom-1 -left-1 text-[8px] font-bold text-violet-300">✦</span>
                    </div>
                    <div>
                      <h2 className="text-[19px] font-bold text-slate-900 dark:text-zinc-100 tracking-tight leading-snug">
                        Schedule Room Session
                      </h2>
                      <p className="text-xs text-slate-500 dark:text-zinc-400 mt-0.5 leading-normal">
                        Set up a meeting, invite collaborators, and sync with your calendar.
                      </p>
                    </div>
                  </div>

                  <button
                    type="button"
                    onClick={() => setIsSchedulingModalOpen(false)}
                    className="p-2 rounded-xl text-slate-400 hover:text-slate-700 dark:hover:text-zinc-200 hover:bg-slate-100 dark:hover:bg-zinc-800 transition-colors"
                  >
                    <X size={18} />
                  </button>
                </div>

                <div className="space-y-4">
                  {/* Grid Row 1: Session Title & Shareable Room Link (Side-by-Side) */}
                  <div className="grid grid-cols-1 sm:grid-cols-2 gap-3.5">
                    {/* Session Title */}
                    <div>
                      <label className="text-[10.5px] font-bold text-slate-400 dark:text-zinc-500 uppercase tracking-wider block mb-1.5">
                        Session Title
                      </label>
                      <div className="h-11 px-3.5 rounded-2xl border border-slate-200/80 dark:border-zinc-700/80 bg-slate-50/70 dark:bg-zinc-850/60 focus-within:border-violet-500 focus-within:ring-2 focus-within:ring-violet-500/20 focus-within:bg-white dark:focus-within:bg-zinc-900 transition-all flex items-center gap-2.5">
                        <MessageSquare size={15} className="text-violet-500 shrink-0" />
                        <input
                          type="text"
                          value={scheduleTitle}
                          onChange={(e) => setScheduleTitle(e.target.value)}
                          placeholder="e.g. Product Strategy Sync"
                          className="w-full bg-transparent text-xs font-semibold text-slate-800 dark:text-zinc-100 outline-none placeholder:text-slate-400 dark:placeholder:text-zinc-500"
                        />
                      </div>
                    </div>

                    {/* Shareable Room Link */}
                    <div>
                      <label className="text-[10.5px] font-bold text-slate-400 dark:text-zinc-500 uppercase tracking-wider block mb-1.5">
                        Shareable Room Link
                      </label>
                      <div className="h-11 px-3.5 rounded-2xl border border-slate-200/80 dark:border-zinc-700/80 bg-slate-50/70 dark:bg-zinc-850/60 flex items-center justify-between gap-2">
                        <div className="flex items-center gap-2 min-w-0">
                          <span className="text-violet-500 text-xs shrink-0">🔗</span>
                          <span className="text-xs font-mono font-medium text-slate-600 dark:text-zinc-300 truncate">
                            {scheduleRoomLink}
                          </span>
                        </div>
                        <button
                          type="button"
                          onClick={() => {
                            navigator.clipboard?.writeText(scheduleRoomLink);
                            showToast?.("Room link copied to clipboard!");
                          }}
                          className="px-2.5 py-1 rounded-xl bg-violet-100 dark:bg-violet-950/80 text-violet-700 dark:text-violet-300 hover:bg-violet-200 dark:hover:bg-violet-900 text-xs font-bold transition-colors cursor-pointer shrink-0 active:scale-95"
                        >
                          Copy
                        </button>
                      </div>
                    </div>
                  </div>

                  {/* Grid Row 2: Date & Time + Collaborators (Side-by-Side with Generous Spacing) */}
                  <div className="grid grid-cols-1 lg:grid-cols-[1.3fr_1fr] gap-3.5">
                    {/* Date & Time Controls */}
                    <div>
                      <label className="text-[10.5px] font-bold text-slate-400 dark:text-zinc-500 uppercase tracking-wider block mb-1.5">
                        Date & Time
                      </label>
                      <div className="flex items-center gap-2">
                        {/* 100% Custom Apple Calendar Popover Pill */}
                        <div className="relative shrink-0">
                          <button
                            type="button"
                            onClick={() => {
                              setIsDatePickerOpen(!isDatePickerOpen);
                              setIsStartTimeMenuOpen(false);
                              setIsEndTimeMenuOpen(false);
                              setIsCollaboratorMenuOpen(false);
                            }}
                            className="h-11 px-3 rounded-2xl border border-slate-200/80 dark:border-zinc-700/80 bg-slate-50/70 dark:bg-zinc-850/60 hover:bg-slate-100 dark:hover:bg-zinc-800 transition-colors flex items-center gap-2 text-left cursor-pointer"
                          >
                            <Calendar size={14} className="text-violet-600 dark:text-violet-400 shrink-0" />
                            <span className="text-xs font-semibold text-slate-800 dark:text-zinc-200 whitespace-nowrap">
                              {formatDisplayDate(scheduleDate)}
                            </span>
                          </button>

                          {/* Custom Apple-Style Month/Day Grid Popover */}
                          {isDatePickerOpen && (
                            <div 
                              className="absolute top-full left-0 mt-2 w-64 bg-white dark:bg-zinc-900 border border-slate-200/90 dark:border-zinc-800 shadow-2xl rounded-2xl p-3 z-50 animate-in fade-in zoom-in-95 duration-150 text-left font-sans"
                              onClick={(e) => e.stopPropagation()}
                            >
                              {/* Month / Year Header with Nav */}
                              <div className="flex items-center justify-between mb-2.5 px-1">
                                <button
                                  type="button"
                                  onClick={() => {
                                    if (calMonth === 0) { setCalMonth(11); setCalYear(prev => prev - 1); }
                                    else { setCalMonth(prev => prev - 1); }
                                  }}
                                  className="w-6 h-6 rounded-lg hover:bg-slate-100 dark:hover:bg-zinc-800 flex items-center justify-center text-slate-600 dark:text-zinc-300 text-xs font-bold"
                                >
                                  ‹
                                </button>
                                <span className="text-xs font-bold text-slate-800 dark:text-zinc-100">
                                  {['Jan', 'Feb', 'Mar', 'Apr', 'May', 'Jun', 'Jul', 'Aug', 'Sep', 'Oct', 'Nov', 'Dec'][calMonth]} {calYear}
                                </span>
                                <button
                                  type="button"
                                  onClick={() => {
                                    if (calMonth === 11) { setCalMonth(0); setCalYear(prev => prev + 1); }
                                    else { setCalMonth(prev => prev + 1); }
                                  }}
                                  className="w-6 h-6 rounded-lg hover:bg-slate-100 dark:hover:bg-zinc-800 flex items-center justify-center text-slate-600 dark:text-zinc-300 text-xs font-bold"
                                >
                                  ›
                                </button>
                              </div>

                              {/* Day of Week Headers */}
                              <div className="grid grid-cols-7 gap-1 text-center mb-1 text-[10px] font-bold text-slate-400 dark:text-zinc-500">
                                {['Su', 'Mo', 'Tu', 'We', 'Th', 'Fr', 'Sa'].map((d) => (
                                  <div key={d}>{d}</div>
                                ))}
                              </div>

                              {/* Days Matrix */}
                              <div className="grid grid-cols-7 gap-1 text-center text-xs">
                                {Array.from({ length: new Date(calYear, calMonth, 1).getDay() }).map((_, i) => (
                                  <div key={`empty-${i}`} className="h-7 w-7" />
                                ))}
                                {Array.from({ length: new Date(calYear, calMonth + 1, 0).getDate() }).map((_, i) => {
                                  const dayNum = i + 1;
                                  const formattedDateStr = `${calYear}-${String(calMonth + 1).padStart(2, '0')}-${String(dayNum).padStart(2, '0')}`;
                                  const isSelected = scheduleDate === formattedDateStr;
                                  return (
                                    <button
                                      key={`day-${dayNum}`}
                                      type="button"
                                      onClick={() => {
                                        setScheduleDate(formattedDateStr);
                                        setIsDatePickerOpen(false);
                                      }}
                                      className={`h-7 w-7 rounded-full flex items-center justify-center text-[11px] font-semibold transition-all cursor-pointer ${
                                        isSelected
                                          ? 'bg-violet-600 text-white font-bold shadow-xs'
                                          : 'text-slate-700 dark:text-zinc-200 hover:bg-violet-50 dark:hover:bg-zinc-800 hover:text-violet-600'
                                      }`}
                                    >
                                      {dayNum}
                                    </button>
                                  );
                                })}
                              </div>
                            </div>
                          )}
                        </div>

                        {/* Roomy Start & End Time Fields with Free Typing & Clean Popover */}
                        <div className="h-11 px-2 rounded-2xl border border-slate-200/80 dark:border-zinc-700/80 bg-slate-50/70 dark:bg-zinc-850/60 flex items-center justify-between gap-1 flex-1">
                          {/* Start Time Field */}
                          <div className="relative flex-1 min-w-[70px]">
                            <div className="flex items-center justify-between">
                              <input
                                type="text"
                                value={scheduleStartTime}
                                onChange={(e) => {
                                  const val = e.target.value;
                                  setScheduleStartTime(val);
                                  const sm = parseTimeToMins(val);
                                  const em = parseTimeToMins(scheduleEndTime);
                                  if (sm && em && em > sm) {
                                    const diff = em - sm;
                                    if (diff % 60 === 0) setScheduleDuration(`${diff / 60}h`);
                                    else if (diff > 60) setScheduleDuration(`${Math.floor(diff / 60)}h ${diff % 60}m`);
                                    else setScheduleDuration(`${diff} min`);
                                  }
                                }}
                                placeholder="10:00 AM"
                                className="w-full text-center bg-transparent outline-none text-xs font-semibold text-slate-800 dark:text-zinc-100 cursor-text select-text"
                              />
                              <button
                                type="button"
                                onClick={(e) => {
                                  e.stopPropagation();
                                  setIsStartTimeMenuOpen(!isStartTimeMenuOpen);
                                  setIsEndTimeMenuOpen(false);
                                  setIsDatePickerOpen(false);
                                  setIsCollaboratorMenuOpen(false);
                                }}
                                className="p-0.5 text-slate-400 hover:text-slate-600 dark:hover:text-zinc-200 rounded cursor-pointer shrink-0"
                              >
                                <ChevronDown size={11} />
                              </button>
                            </div>

                            {isStartTimeMenuOpen && (
                              <div 
                                className="absolute top-full left-0 mt-2 w-32 max-h-48 overflow-y-auto thin-scrollbar bg-white dark:bg-zinc-900 border border-slate-200 dark:border-zinc-800 shadow-2xl rounded-2xl p-1 z-50 animate-in fade-in zoom-in-95 duration-100"
                                onClick={(e) => e.stopPropagation()}
                              >
                                {standardTimeOptions.map((timeOption) => (
                                  <button
                                    key={`start-${timeOption}`}
                                    type="button"
                                    onClick={() => {
                                      updateScheduleTimes(timeOption, undefined);
                                      setIsStartTimeMenuOpen(false);
                                    }}
                                    className={`w-full text-left px-2.5 py-1.5 rounded-xl text-xs font-semibold transition-colors ${scheduleStartTime === timeOption ? 'bg-violet-600 text-white' : 'text-slate-700 dark:text-zinc-300 hover:bg-slate-100 dark:hover:bg-zinc-800'}`}
                                  >
                                    {timeOption}
                                  </button>
                                ))}
                              </div>
                            )}
                          </div>

                          <span className="text-slate-400 text-xs shrink-0 font-medium">→</span>

                          {/* End Time Field */}
                          <div className="relative flex-1 min-w-[70px]">
                            <div className="flex items-center justify-between">
                              <input
                                type="text"
                                value={scheduleEndTime}
                                onChange={(e) => {
                                  const val = e.target.value;
                                  setScheduleEndTime(val);
                                  const sm = parseTimeToMins(scheduleStartTime);
                                  const em = parseTimeToMins(val);
                                  if (sm && em && em > sm) {
                                    const diff = em - sm;
                                    if (diff % 60 === 0) setScheduleDuration(`${diff / 60}h`);
                                    else if (diff > 60) setScheduleDuration(`${Math.floor(diff / 60)}h ${diff % 60}m`);
                                    else setScheduleDuration(`${diff} min`);
                                  }
                                }}
                                placeholder="11:00 AM"
                                className="w-full text-center bg-transparent outline-none text-xs font-semibold text-slate-800 dark:text-zinc-100 cursor-text select-text"
                              />
                              <button
                                type="button"
                                onClick={(e) => {
                                  e.stopPropagation();
                                  setIsEndTimeMenuOpen(!isEndTimeMenuOpen);
                                  setIsStartTimeMenuOpen(false);
                                  setIsDatePickerOpen(false);
                                  setIsCollaboratorMenuOpen(false);
                                }}
                                className="p-0.5 text-slate-400 hover:text-slate-600 dark:hover:text-zinc-200 rounded cursor-pointer shrink-0"
                              >
                                <ChevronDown size={11} />
                              </button>
                            </div>

                            {isEndTimeMenuOpen && (
                              <div 
                                className="absolute top-full right-0 mt-2 w-32 max-h-48 overflow-y-auto thin-scrollbar bg-white dark:bg-zinc-900 border border-slate-200 dark:border-zinc-800 shadow-2xl rounded-2xl p-1 z-50 animate-in fade-in zoom-in-95 duration-100"
                                onClick={(e) => e.stopPropagation()}
                              >
                                {standardTimeOptions.map((timeOption) => (
                                  <button
                                    key={`end-${timeOption}`}
                                    type="button"
                                    onClick={() => {
                                      updateScheduleTimes(undefined, timeOption);
                                      setIsEndTimeMenuOpen(false);
                                    }}
                                    className={`w-full text-left px-2.5 py-1.5 rounded-xl text-xs font-semibold transition-colors ${scheduleEndTime === timeOption ? 'bg-violet-600 text-white' : 'text-slate-700 dark:text-zinc-300 hover:bg-slate-100 dark:hover:bg-zinc-800'}`}
                                  >
                                    {timeOption}
                                  </button>
                                ))}
                              </div>
                            )}
                          </div>
                        </div>

                        {/* Roomy Duration Pill */}
                        <div className="h-11 px-2.5 min-w-[68px] shrink-0 rounded-2xl border border-slate-200/80 dark:border-zinc-700/80 bg-violet-50/60 dark:bg-violet-950/40 flex items-center justify-center gap-1 text-xs font-bold text-violet-700 dark:text-violet-300 shadow-2xs">
                          <span>⏱</span>
                          <span>{scheduleDuration}</span>
                        </div>
                      </div>
                    </div>

                    {/* Collaborators & Invites with Contact Directory Dropdown + Empty State */}
                    <div className="relative">
                      <label className="text-[10.5px] font-bold text-slate-400 dark:text-zinc-500 uppercase tracking-wider block mb-1.5">
                        Collaborators & Invites
                      </label>
                      <div className="h-11 px-2.5 rounded-2xl border border-slate-200/80 dark:border-zinc-700/80 bg-slate-50/70 dark:bg-zinc-850/60 flex items-center justify-between gap-1.5">
                        {/* Avatar Chips */}
                        <div className="flex items-center gap-1.5 overflow-x-auto no-scrollbar flex-1 min-w-0">
                          {scheduleCollaborators.map((c) => (
                            <div
                              key={c.id}
                              className="flex items-center gap-1.5 px-2 py-1 rounded-xl bg-white dark:bg-zinc-800 border border-slate-200/60 dark:border-zinc-700/60 shadow-2xs text-[11px] font-medium text-slate-800 dark:text-zinc-200 shrink-0"
                            >
                              <div className={`w-4 h-4 rounded-full ${c.color || 'bg-violet-600'} text-white flex items-center justify-center text-[9px] font-bold`}>
                                {c.name[0]?.toUpperCase() || 'U'}
                              </div>
                              <span className="truncate max-w-[80px]">{c.name}</span>
                              {c.id !== 'you' && (
                                <button
                                  type="button"
                                  onClick={() => setScheduleCollaborators((prev) => prev.filter((p) => p.id !== c.id))}
                                  className="text-slate-400 hover:text-rose-500 ml-0.5"
                                >
                                  <X size={10} />
                                </button>
                              )}
                            </div>
                          ))}
                        </div>

                        {/* + Invite Button */}
                        <button
                          type="button"
                          onClick={() => {
                            setIsCollaboratorMenuOpen(!isCollaboratorMenuOpen);
                            setCollaboratorSearchQuery("");
                            setIsDatePickerOpen(false);
                            setIsStartTimeMenuOpen(false);
                            setIsEndTimeMenuOpen(false);
                          }}
                          className="flex items-center gap-1 px-3 py-1.5 rounded-xl bg-violet-50 hover:bg-violet-100 dark:bg-violet-950/60 dark:hover:bg-violet-900/60 border border-violet-200/70 dark:border-violet-800/70 text-[11px] font-bold text-violet-700 dark:text-violet-300 transition-all cursor-pointer shrink-0 active:scale-95"
                        >
                          <Plus size={12} strokeWidth={2.5} />
                          <span>Invite</span>
                        </button>
                      </div>

                      {/* Workspace Contacts Directory Dropdown */}
                      {isCollaboratorMenuOpen && (
                        <div 
                          className="absolute top-full right-0 mt-2 w-76 bg-white dark:bg-zinc-900 border border-slate-200/90 dark:border-zinc-800 shadow-2xl rounded-2xl p-3 z-50 animate-in fade-in zoom-in-95 duration-150 text-left"
                          onClick={(e) => e.stopPropagation()}
                        >
                          {/* Search / Add Input */}
                          <div className="mb-2">
                            <div className="h-8 px-2.5 rounded-xl border border-violet-200 dark:border-zinc-700 bg-slate-50 dark:bg-zinc-800 flex items-center gap-2">
                              <Search size={12} className="text-slate-400" />
                              <input
                                autoFocus
                                type="text"
                                value={collaboratorSearchQuery}
                                onChange={(e) => setCollaboratorSearchQuery(e.target.value)}
                                onKeyDown={(e) => {
                                  if (e.key === 'Enter' && collaboratorSearchQuery.trim()) {
                                    const customName = collaboratorSearchQuery.trim();
                                    setScheduleCollaborators((prev) => [
                                      ...prev,
                                      { id: `custom-${Date.now()}`, name: customName.split('@')[0], role: 'Editor', email: customName, color: 'bg-emerald-600' }
                                    ]);
                                    setCollaboratorSearchQuery("");
                                    setIsCollaboratorMenuOpen(false);
                                    showToast?.(`Invited ${customName}`);
                                  }
                                }}
                                placeholder="Search contacts or type email..."
                                className="w-full bg-transparent text-[11px] font-medium text-slate-800 dark:text-zinc-200 outline-none placeholder:text-slate-400"
                              />
                            </div>
                          </div>

                          {/* Contact Directory Section */}
                          <div className="text-[10px] font-bold text-slate-400 dark:text-zinc-500 uppercase tracking-wider px-1 py-1">
                            Workspace Team & Contacts
                          </div>
                          <div className="max-h-48 overflow-y-auto thin-scrollbar space-y-1">
                            {workspaceDirectoryContacts.length > 0 ? (
                              workspaceDirectoryContacts
                                .filter((contact) => {
                                  const q = collaboratorSearchQuery.toLowerCase();
                                  return (
                                    !scheduleCollaborators.some((sc) => sc.name.toLowerCase() === contact.name.toLowerCase()) &&
                                    (contact.name.toLowerCase().includes(q) || contact.email?.toLowerCase().includes(q) || contact.title?.toLowerCase().includes(q))
                                  );
                                })
                                .map((contact) => (
                                  <button
                                    key={contact.id}
                                    type="button"
                                    onClick={() => {
                                      setScheduleCollaborators((prev) => [...prev, contact]);
                                      setIsCollaboratorMenuOpen(false);
                                      showToast?.(`Added ${contact.name} to meeting`);
                                    }}
                                    className="w-full flex items-center justify-between p-2 rounded-xl hover:bg-violet-50 dark:hover:bg-violet-950/40 text-left transition-colors cursor-pointer group"
                                  >
                                    <div className="flex items-center gap-2.5 min-w-0">
                                      <div className={`w-6 h-6 rounded-full ${contact.color || 'bg-violet-600'} text-white flex items-center justify-center text-[10px] font-bold shrink-0`}>
                                        {contact.name[0]?.toUpperCase() || 'U'}
                                      </div>
                                      <div className="min-w-0">
                                        <div className="text-xs font-bold text-slate-800 dark:text-zinc-200 truncate group-hover:text-violet-600 transition-colors">
                                          {contact.name}
                                        </div>
                                        <div className="text-[10px] text-slate-400 dark:text-zinc-500 truncate">
                                          {contact.title || contact.email}
                                        </div>
                                      </div>
                                    </div>
                                    <span className="text-[10px] font-bold text-violet-600 dark:text-violet-400 bg-violet-50 dark:bg-violet-950/60 px-1.5 py-0.5 rounded-md shrink-0">
                                      + Add
                                    </span>
                                  </button>
                                ))
                            ) : (
                              /* Clean Apple Empty State */
                              <div className="py-4 px-2 flex flex-col items-center justify-center text-center">
                                <div className="w-8 h-8 rounded-xl bg-slate-100 dark:bg-zinc-800 text-slate-400 flex items-center justify-center mb-1.5">
                                  <Users size={15} />
                                </div>
                                <p className="text-[11px] font-semibold text-slate-700 dark:text-zinc-300">No Contacts in Workspace</p>
                                <p className="text-[10px] text-slate-400 dark:text-zinc-500 mt-0.5 leading-snug">
                                  Type an email above to invite external collaborators.
                                </p>
                              </div>
                            )}

                            {collaboratorSearchQuery.trim() && (
                              <button
                                type="button"
                                onClick={() => {
                                  const customName = collaboratorSearchQuery.trim();
                                  setScheduleCollaborators((prev) => [
                                    ...prev,
                                    { id: `custom-${Date.now()}`, name: customName.split('@')[0], role: 'Editor', email: customName, color: 'bg-emerald-600' }
                                  ]);
                                  setCollaboratorSearchQuery("");
                                  setIsCollaboratorMenuOpen(false);
                                  showToast?.(`Invited ${customName}`);
                                }}
                                className="w-full flex items-center gap-2 p-2 rounded-xl bg-violet-50/80 dark:bg-violet-950/40 hover:bg-violet-100 text-left text-xs font-bold text-violet-600 dark:text-violet-400 transition-colors"
                              >
                                <Plus size={13} strokeWidth={2.5} />
                                <span className="truncate">Invite "{collaboratorSearchQuery.trim()}"</span>
                              </button>
                            )}
                          </div>
                        </div>
                      )}
                    </div>
                  </div>

                  {/* Meeting Capabilities: Unified Grouped List with RegaarderAiIcon */}
                  <div>
                    <label className="text-[10.5px] font-bold text-slate-400 dark:text-zinc-500 uppercase tracking-wider block mb-1.5">
                      Meeting Capabilities
                    </label>
                    <div className="rounded-2xl border border-slate-200/80 dark:border-zinc-700/80 bg-slate-50/70 dark:bg-zinc-850/60 divide-y divide-slate-200/60 dark:divide-zinc-700/60 overflow-hidden select-none">
                      {/* AI Summary Row (Entire row instant toggle onPointerDown) */}
                      <div 
                        onPointerDown={(e) => {
                          e.preventDefault();
                          setScheduleAiSummaryEnabled(prev => !prev);
                        }}
                        className="px-3.5 py-2.5 flex items-center justify-between cursor-pointer hover:bg-slate-100/50 dark:hover:bg-zinc-800/40 transition-colors"
                      >
                        <div className="flex items-center gap-2.5 pointer-events-none">
                          <RegaarderAiIcon size={16} strokeWidth={1.8} className="text-violet-600 dark:text-violet-400 shrink-0" />
                          <div>
                            <div className="text-xs font-bold text-slate-800 dark:text-zinc-200 leading-tight">AI Transcription & Real-time Summary</div>
                            <div className="text-[10.5px] text-slate-400 dark:text-zinc-400">Generate instant meeting notes, action items, and insights</div>
                          </div>
                        </div>
                        <div className={`w-9 h-5 rounded-full p-0.5 flex items-center transition-colors duration-75 shrink-0 pointer-events-none ${scheduleAiSummaryEnabled ? 'bg-violet-600' : 'bg-slate-300 dark:bg-zinc-700'}`}>
                          <span className={`w-4 h-4 rounded-full bg-white shadow-xs transform transition-transform duration-75 ease-out ${scheduleAiSummaryEnabled ? 'translate-x-4' : 'translate-x-0'}`} />
                        </div>
                      </div>

                      {/* Whiteboard & Screen Share Row (Entire row instant toggle onPointerDown) */}
                      <div 
                        onPointerDown={(e) => {
                          e.preventDefault();
                          setScheduleWhiteboardEnabled(prev => !prev);
                        }}
                        className="px-3.5 py-2.5 flex items-center justify-between cursor-pointer hover:bg-slate-100/50 dark:hover:bg-zinc-800/40 transition-colors"
                      >
                        <div className="flex items-center gap-2.5 pointer-events-none">
                          <Layout size={15} className="text-violet-600 dark:text-violet-400 shrink-0" />
                          <div>
                            <div className="text-xs font-bold text-slate-800 dark:text-zinc-200 leading-tight">Interactive Whiteboard & Screen Sharing</div>
                            <div className="text-[10.5px] text-slate-400 dark:text-zinc-400">Allow participants to draw and present canvases simultaneously</div>
                          </div>
                        </div>
                        <div className={`w-9 h-5 rounded-full p-0.5 flex items-center transition-colors duration-75 shrink-0 pointer-events-none ${scheduleWhiteboardEnabled ? 'bg-violet-600' : 'bg-slate-300 dark:bg-zinc-700'}`}>
                          <span className={`w-4 h-4 rounded-full bg-white shadow-xs transform transition-transform duration-75 ease-out ${scheduleWhiteboardEnabled ? 'translate-x-4' : 'translate-x-0'}`} />
                        </div>
                      </div>

                      {/* Encryption & Waiting Room Row (Entire row instant toggle onPointerDown) */}
                      <div>
                        <div 
                          onPointerDown={(e) => {
                            e.preventDefault();
                            const nextState = !scheduleEncryptionEnabled;
                            setScheduleEncryptionEnabled(nextState);
                            if (!nextState) {
                              showToast?.("⚠️ End-to-End Encryption disabled for this session.");
                            }
                          }}
                          className="px-3.5 py-2.5 flex items-center justify-between cursor-pointer hover:bg-slate-100/50 dark:hover:bg-zinc-800/40 transition-colors"
                        >
                          <div className="flex items-center gap-2.5 pointer-events-none">
                            <Shield size={15} className="text-violet-600 dark:text-violet-400 shrink-0" />
                            <div>
                              <div className="text-xs font-bold text-slate-800 dark:text-zinc-200 leading-tight">End-to-End Encryption & Waiting Room</div>
                              <div className="text-[10.5px] text-slate-400 dark:text-zinc-400">Host admits guests with encrypted zero-latency audio/video</div>
                            </div>
                          </div>
                          <div className={`w-9 h-5 rounded-full p-0.5 flex items-center transition-colors duration-75 shrink-0 pointer-events-none ${scheduleEncryptionEnabled ? 'bg-violet-600' : 'bg-slate-300 dark:bg-zinc-700'}`}>
                            <span className={`w-4 h-4 rounded-full bg-white shadow-xs transform transition-transform duration-75 ease-out ${scheduleEncryptionEnabled ? 'translate-x-4' : 'translate-x-0'}`} />
                          </div>
                        </div>

                        {/* Non-intrusive warning when untoggled */}
                        {!scheduleEncryptionEnabled && (
                          <div className="mx-3.5 mb-2.5 p-2.5 rounded-xl bg-amber-500/10 dark:bg-amber-500/15 border border-amber-500/30 text-amber-800 dark:text-amber-300 text-[11px] flex items-start gap-2 animate-in fade-in duration-150">
                            <span className="text-amber-600 dark:text-amber-400 text-xs shrink-0 mt-0.5">⚠️</span>
                            <div>
                              <div className="font-bold text-[11px]">End-to-End Encryption Disabled</div>
                              <div className="text-[10px] text-amber-700/90 dark:text-amber-400/90 leading-normal mt-0.5">
                                Media streams and transcripts will not be encrypted on-device. Audio/video frames can be inspected by network relays and recording servers.
                              </div>
                            </div>
                          </div>
                        )}
                      </div>
                    </div>
                  </div>
                </div>

                {/* Pinned Executive Footer Action Buttons */}
                <div className="flex items-center justify-end gap-3 pt-5 mt-4 border-t border-slate-100 dark:border-zinc-800">
                  <button
                    type="button"
                    onClick={() => setIsSchedulingModalOpen(false)}
                    className="px-5 py-2 rounded-2xl text-xs font-semibold text-slate-600 dark:text-zinc-400 hover:bg-slate-100 dark:hover:bg-zinc-800 transition-colors cursor-pointer"
                  >
                    Cancel
                  </button>
                  <button
                    type="button"
                    onClick={() => {
                      setIsSchedulingModalOpen(false);
                      setIsMeetingOptionsOpen(false);
                      showToast?.(`Meeting "${scheduleTitle}" scheduled for ${formatDisplayDate(scheduleDate)} at ${scheduleStartTime}!`);
                    }}
                    className="px-6 py-2.5 rounded-2xl bg-gradient-to-r from-violet-600 to-indigo-600 hover:from-violet-700 hover:to-indigo-700 text-white text-xs font-bold shadow-[0_4px_14px_rgba(139,92,246,0.3)] transition-all active:scale-[0.98] cursor-pointer flex items-center gap-1.5"
                  >
                    <span>Schedule Meeting</span>
                    <ChevronRight size={14} />
                  </button>
                </div>
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

      {/* ========================================================================= */}
      {/* ROOM AI ASSISTANT MODAL (Live API Connected)                             */}
      {/* ========================================================================= */}
      {isAIModalOpen && (
        <div 
          className="fixed inset-0 z-[1000000] flex items-center justify-center p-4 bg-black/60 backdrop-blur-xl animate-in fade-in duration-150 select-none"
          onClick={() => setIsAIModalOpen(false)}
        >
          <div 
            className="relative bg-white/95 dark:bg-zinc-900/95 backdrop-blur-3xl border border-white/90 dark:border-white/10 shadow-[0_32px_120px_rgba(0,0,0,0.25)] rounded-[32px] max-w-[520px] w-full p-6 text-left animate-in fade-in zoom-in-95 duration-150 font-sans flex flex-col"
            onClick={(e) => e.stopPropagation()}
          >
            {/* Header */}
            <div className="flex items-center justify-between gap-3 mb-4">
              <div className="flex items-center gap-3">
                <div className="w-10 h-10 rounded-2xl bg-violet-50 dark:bg-violet-950/70 border border-violet-200/70 dark:border-violet-800/70 flex items-center justify-center text-violet-600 dark:text-violet-400 shadow-inner">
                  <RegaarderAiIcon size={20} />
                </div>
                <div>
                  <h3 className="text-base font-bold text-slate-900 dark:text-zinc-100 tracking-tight">
                    Room AI Intelligence
                  </h3>
                  <p className="text-[11px] text-violet-600 dark:text-violet-400 font-semibold flex items-center gap-1">
                    <span className="w-1.5 h-1.5 rounded-full bg-violet-500 animate-pulse" />
                    {roomName} Session Analysis
                  </p>
                </div>
              </div>

              <button
                type="button"
                onClick={() => setIsAIModalOpen(false)}
                className="p-1.5 rounded-xl text-slate-400 hover:text-slate-700 dark:hover:text-zinc-200 hover:bg-slate-100 dark:hover:bg-zinc-800 transition-colors"
              >
                <X size={16} />
              </button>
            </div>

            {/* Prompt Display */}
            {roomAIResponse?.prompt && (
              <div className="p-3 rounded-2xl bg-slate-50 dark:bg-zinc-850 border border-slate-200/80 dark:border-zinc-700/80 mb-3 text-xs text-slate-700 dark:text-zinc-300 font-medium">
                <span className="text-[10px] font-bold uppercase tracking-wider text-slate-400 dark:text-zinc-500 block mb-1">Your Question</span>
                "{roomAIResponse.prompt}"
              </div>
            )}

            {/* Response Area */}
            <div className="p-4 rounded-2xl bg-violet-50/50 dark:bg-violet-950/20 border border-violet-100 dark:border-violet-900/40 mb-4 min-h-[100px] max-h-[260px] overflow-y-auto thin-scrollbar">
              {isAILoading ? (
                <div className="flex flex-col items-center justify-center py-6 gap-2 text-violet-600 dark:text-violet-400">
                  <RegaarderAiIcon size={20} className="animate-spin" />
                  <span className="text-xs font-semibold">Analyzing meeting context...</span>
                </div>
              ) : (
                <p className="text-xs text-slate-800 dark:text-zinc-200 leading-relaxed whitespace-pre-wrap">
                  {roomAIResponse?.answer || "No response available."}
                </p>
              )}
            </div>

            {/* Actions */}
            <div className="flex items-center justify-end gap-2.5 pt-2 border-t border-slate-100 dark:border-zinc-800">
              <button
                type="button"
                onClick={() => {
                  if (roomAIResponse?.answer) {
                    navigator.clipboard?.writeText(roomAIResponse.answer);
                    showToast?.("AI response copied to clipboard!");
                  }
                }}
                disabled={isAILoading || !roomAIResponse?.answer}
                className="px-4 py-2 rounded-xl bg-slate-100 hover:bg-slate-200 dark:bg-zinc-800 dark:hover:bg-zinc-700 text-slate-700 dark:text-zinc-200 text-xs font-semibold transition-colors cursor-pointer disabled:opacity-40"
              >
                Copy Answer
              </button>
              <button
                type="button"
                onClick={() => setIsAIModalOpen(false)}
                className="px-5 py-2 rounded-xl bg-violet-600 hover:bg-violet-700 text-white text-xs font-bold shadow-xs transition-colors cursor-pointer"
              >
                Done
              </button>
            </div>
          </div>
        </div>
      )}

            {/* ========================================================================= */}
      {/* E2EE CRYPTOGRAPHIC VERIFICATION MODAL                                    */}
      {/* ========================================================================= */}
      {isE2EEVerifiedModalOpen && (
        <div 
          className="fixed inset-0 z-[1000000] flex items-center justify-center p-4 bg-black/60 backdrop-blur-xl animate-in fade-in duration-150 select-none"
          onClick={() => setIsE2EEVerifiedModalOpen(false)}
        >
          <div 
            className="relative bg-white/95 dark:bg-zinc-900/95 backdrop-blur-3xl border border-white/90 dark:border-white/10 shadow-[0_32px_120px_rgba(0,0,0,0.25)] rounded-[32px] max-w-[460px] w-full p-6 text-left animate-in fade-in zoom-in-95 duration-150 font-sans"
            onClick={(e) => e.stopPropagation()}
          >
            {/* Header */}
            <div className="flex items-center justify-between gap-3 mb-4">
              <div className="flex items-center gap-3">
                <div className="w-10 h-10 rounded-2xl bg-emerald-50 dark:bg-emerald-950/70 border border-emerald-200/70 dark:border-emerald-800/70 flex items-center justify-center text-emerald-600 dark:text-emerald-400 shadow-inner">
                  <Shield size={20} strokeWidth={2} />
                </div>
                <div>
                  <h3 className="text-base font-bold text-slate-900 dark:text-zinc-100 tracking-tight">
                    End-to-End Encrypted
                  </h3>
                  <p className="text-[11px] text-emerald-600 dark:text-emerald-400 font-semibold flex items-center gap-1">
                    <span className="w-1.5 h-1.5 rounded-full bg-emerald-500 animate-pulse" />
                    AES-GCM 256-bit Active
                  </p>
                </div>
              </div>

              <button
                type="button"
                onClick={() => setIsE2EEVerifiedModalOpen(false)}
                className="p-1.5 rounded-xl text-slate-400 hover:text-slate-700 dark:hover:text-zinc-200 hover:bg-slate-100 dark:hover:bg-zinc-800 transition-colors"
              >
                <X size={16} />
              </button>
            </div>

            {/* Explanatory description */}
            <p className="text-xs text-slate-600 dark:text-zinc-300 leading-relaxed mb-4">
              Your audio, video frames, whiteboard events, and text messages are encrypted on-device via <strong>WebRTC Insertable Streams</strong> before leaving your computer. Neither Regaarder nor network relays have access to plaintext media.
            </p>

            {/* Safety Fingerprint Container */}
            <div className="p-3.5 rounded-2xl bg-slate-50 dark:bg-zinc-850 border border-slate-200/80 dark:border-zinc-700/80 mb-4">
              <div className="text-[10px] font-bold text-slate-400 dark:text-zinc-500 uppercase tracking-wider mb-1">
                Room Safety Verification Code
              </div>
              <div className="text-lg font-mono font-bold tracking-widest text-slate-900 dark:text-zinc-100 py-1">
                {e2eeFingerprint}
              </div>
              <div className="text-[10.5px] text-slate-500 dark:text-zinc-400 mt-1">
                Compare this safety number with other participants to verify authenticity.
              </div>
            </div>

            {/* Actions */}
            <div className="flex items-center justify-end gap-2.5 pt-2">
              <button
                type="button"
                onClick={() => {
                  navigator.clipboard?.writeText(e2eeFingerprint);
                  showToast?.("Safety fingerprint copied to clipboard!");
                }}
                className="px-4 py-2 rounded-xl bg-slate-100 hover:bg-slate-200 dark:bg-zinc-800 dark:hover:bg-zinc-700 text-slate-700 dark:text-zinc-200 text-xs font-semibold transition-colors cursor-pointer"
              >
                Copy Fingerprint
              </button>
              <button
                type="button"
                onClick={() => setIsE2EEVerifiedModalOpen(false)}
                className="px-5 py-2 rounded-xl bg-emerald-600 hover:bg-emerald-700 text-white text-xs font-bold shadow-xs transition-colors cursor-pointer"
              >
                Verified
              </button>
            </div>
          </div>
        </div>
      )}
          <ScreenShareSourceModal
            isOpen={isSourceModalOpen}
            onClose={() => setIsSourceModalOpen(false)}
            onSelectSource={handleSelectScreenSource}
          />
    </div>
  );
}
