import React, { useCallback, useEffect, useMemo, useRef, useState } from 'react';
import html2canvas from 'html2canvas';
import { jsPDF } from 'jspdf';
import { 
  Menu, Search, Plus, Sparkles, Bell, 
  ChevronLeft, ChevronRight, Cloud, Users, Home, Inbox, Star, 
  FileText, Trash, Settings, MoreHorizontal,
  Mic, ArrowUp, MessageSquare, CheckSquare, Calendar, 
  File, User, PenTool, AlignLeft, AlignCenter, AlignRight, 
  List, Bold, Italic, Underline, Type, X, ChevronDown,
  LayoutGrid, BookOpen, Scissors, Expand, Check, Wand2, Presentation,
  AlertTriangle, MonitorPlay, MessageCircle, FileQuestion,
  Send, ListTodo, ShieldAlert, ArrowRight, Loader2, Move, Upload, Database, KeyRound, Video, VideoOff, MicOff, PhoneOff,
  UserPlus, Link2 as LinkIcon, Link, Clock, Maximize2, Minimize2, Sidebar,
  Undo2, Redo2, Save, RefreshCcw, Trash2, ThumbsUp, ThumbsDown, MessageSquarePlus, Play, Pause, Paperclip, Moon, Sun, MoveLeft, MoveRight
} from 'lucide-react';
import './thin-scrollbar.css';
import RegaarderComposeLanding from './RegaarderComposeLanding';

const AI_NATIVE_PLACEHOLDER = 'Type, ask Compose AI, or speak to start';
const UNTITLED_COMPOSITION_LABEL = 'Untitled composition';
const ENTERPRISE_PAGE_WIDTH_PX = 794;
const ENTERPRISE_PAGE_HEIGHT_PX = 1123;
const DECK_DESIGN_PRESETS = [
  {
    key: 'aurora-split',
    background: 'bg-[radial-gradient(circle_at_85%_80%,rgba(56,189,248,0.34)_0%,rgba(17,24,39,0)_38%),radial-gradient(circle_at_15%_20%,rgba(139,92,246,0.42)_0%,rgba(30,41,59,0)_42%),linear-gradient(140deg,#090d2f_0%,#101a45_52%,#1f245f_100%)]',
    badge: 'Aurora Storyline',
  },
  {
    key: 'sunset-grid',
    background: 'bg-[radial-gradient(circle_at_80%_20%,rgba(251,146,60,0.34)_0%,rgba(31,41,55,0)_35%),radial-gradient(circle_at_22%_78%,rgba(236,72,153,0.30)_0%,rgba(30,41,59,0)_40%),linear-gradient(145deg,#111827_0%,#1e1b4b_50%,#312e81_100%)]',
    badge: 'Sunset Grid',
  },
  {
    key: 'mint-depth',
    background: 'bg-[radial-gradient(circle_at_75%_75%,rgba(20,184,166,0.30)_0%,rgba(15,23,42,0)_38%),radial-gradient(circle_at_25%_20%,rgba(16,185,129,0.28)_0%,rgba(2,6,23,0)_44%),linear-gradient(150deg,#020617_0%,#0f172a_50%,#134e4a_100%)]',
    badge: 'Mint Depth',
  },
];

const DECK_TEMPLATE_LIBRARY = [
  {
    key: 'investor-clarity',
    label: 'Investor Clarity',
    detail: 'For fundraising and strategic persuasion',
    presetKey: 'aurora-split',
    visualType: 'data-backed narrative',
    layoutStyle: 'cinematic split',
    motionCue: 'Progressive metric reveal',
  },
  {
    key: 'keynote-cinematic',
    label: 'Keynote Cinematic',
    detail: 'Hero storytelling with atmospheric transitions',
    presetKey: 'sunset-grid',
    visualType: 'hero statement',
    layoutStyle: 'full-bleed visual stage',
    motionCue: 'Slow fade and scale-in',
  },
  {
    key: 'arc-calm',
    label: 'Arc Calm',
    detail: 'Calm and focused narrative with soft rhythm',
    presetKey: 'mint-depth',
    visualType: 'minimal signal',
    layoutStyle: 'calm left narrative',
    motionCue: 'Gentle crossfade',
  },
  {
    key: 'linear-briefing',
    label: 'Linear Briefing',
    detail: 'Fast, structured, executive communication',
    presetKey: 'aurora-split',
    visualType: 'operator briefing',
    layoutStyle: 'grid briefing',
    motionCue: 'Sequential block reveal',
  },
  {
    key: 'figma-fluid',
    label: 'Figma Fluid',
    detail: 'Fluid composition for product and design reviews',
    presetKey: 'sunset-grid',
    visualType: 'product walkthrough',
    layoutStyle: 'modular canvas',
    motionCue: 'Staggered component entry',
  },
  {
    key: 'minimal-luxury',
    label: 'Minimal Luxury',
    detail: 'Sparse text and premium visual hierarchy',
    presetKey: 'mint-depth',
    visualType: 'premium minimal',
    layoutStyle: 'high whitespace emphasis',
    motionCue: 'Elegant dissolve',
  },
];

const DECK_STORY_SECTIONS = ['Opening', 'Problem', 'Opportunity', 'Product', 'Market', 'Strategy', 'Financials', 'Closing'];
const SCHEDULE_NOTIFICATION_OPTIONS = ['5 minutes before', '15 minutes before', '30 minutes before', '1 hour before'];
const SCHEDULE_JOIN_OPTIONS = ['Only invited people', 'Anyone with link', 'Workspace members'];
const SCHEDULE_REPEAT_OPTIONS = ['Does not repeat', 'Daily', 'Weekly', 'Monthly'];
const QUICK_ADD_SOURCE_OPTIONS = [
  { id: 'image', label: 'Upload image', accept: 'image/*' },
  { id: 'file', label: 'Upload file', accept: '*/*' },
  { id: 'audio', label: 'Upload audio', accept: 'audio/*' },
  { id: 'note', label: 'Add note' },
  { id: 'link', label: 'Add link' },
];

const FONT_FAMILY_MAP = {
  Manrope: "Manrope, 'Plus Jakarta Sans', 'DM Sans', Inter, system-ui, -apple-system, 'Segoe UI', Roboto, sans-serif",
  Satoshi: "Satoshi, 'General Sans', Manrope, 'DM Sans', Inter, system-ui, sans-serif",
  'General Sans': "'General Sans', Satoshi, Manrope, Inter, system-ui, sans-serif",
  'Plus Jakarta Sans': "'Plus Jakarta Sans', Manrope, 'DM Sans', Inter, system-ui, sans-serif",
  'IBM Plex Sans': "'IBM Plex Sans', 'Public Sans', Inter, system-ui, sans-serif",
  'DM Sans': "'DM Sans', Manrope, 'Plus Jakarta Sans', Inter, system-ui, sans-serif",
  'Public Sans': "'Public Sans', 'IBM Plex Sans', Inter, system-ui, sans-serif",
  'SF Pro Display': "'SF Pro Display', -apple-system, BlinkMacSystemFont, 'Segoe UI', Roboto, sans-serif",
  'Helvetica Now': "'Helvetica Now', 'Helvetica Neue', Helvetica, Arial, sans-serif",
  Aptos: "Aptos, 'Segoe UI', Calibri, sans-serif",
  Merriweather: "Merriweather, 'Source Serif 4', Georgia, serif",
  'Libre Baskerville': "'Libre Baskerville', Merriweather, Georgia, serif",
  'Playfair Display': "'Playfair Display', 'Libre Baskerville', Georgia, serif",
  'Source Serif 4': "'Source Serif 4', Merriweather, Georgia, serif",
  Charter: "Charter, 'Source Serif 4', Georgia, serif",
  Lora: "Lora, 'Source Serif 4', Georgia, serif",
  Spectral: "Spectral, 'Source Serif 4', Georgia, serif",
  Poppins: "Poppins, Manrope, 'Plus Jakarta Sans', sans-serif",
  Montserrat: "Montserrat, Poppins, Manrope, sans-serif",
  Outfit: "Outfit, 'Space Grotesk', Manrope, sans-serif",
  'Space Grotesk': "'Space Grotesk', Outfit, Manrope, sans-serif",
  'Clash Display': "'Clash Display', 'Neue Haas Grotesk', Montserrat, sans-serif",
  'Neue Haas Grotesk': "'Neue Haas Grotesk', 'Helvetica Neue', Helvetica, Arial, sans-serif",
  'Circular Std': "'Circular Std', 'Avenir Next', 'Helvetica Neue', Arial, sans-serif",
  'Avenir Next': "'Avenir Next', 'Helvetica Neue', Helvetica, Arial, sans-serif",
  'JetBrains Mono': "'JetBrains Mono', 'IBM Plex Mono', 'Fira Code', 'Source Code Pro', monospace",
  'IBM Plex Mono': "'IBM Plex Mono', 'JetBrains Mono', 'Fira Code', 'Source Code Pro', monospace",
  'Fira Code': "'Fira Code', 'JetBrains Mono', 'IBM Plex Mono', 'Source Code Pro', monospace",
  'Source Code Pro': "'Source Code Pro', 'JetBrains Mono', 'IBM Plex Mono', 'Fira Code', monospace",
};

const inferDeckStorySection = (slide, index, totalSlides) => {
  const signal = `${slide?.title || ''} ${slide?.subtitle || ''} ${slide?.headline || ''}`.toLowerCase();
  const keywordMap = [
    { key: 'Problem', patterns: ['problem', 'pain', 'challenge', 'friction', 'gap'] },
    { key: 'Opportunity', patterns: ['opportunity', 'timing', 'why now', 'trend'] },
    { key: 'Product', patterns: ['product', 'solution', 'platform', 'workflow', 'demo'] },
    { key: 'Market', patterns: ['market', 'tam', 'sam', 'som', 'segment', 'customer'] },
    { key: 'Strategy', patterns: ['strategy', 'go to market', 'distribution', 'growth', 'roadmap'] },
    { key: 'Financials', patterns: ['financial', 'revenue', 'cac', 'ltv', 'unit economics', 'forecast'] },
    { key: 'Closing', patterns: ['close', 'closing', 'ask', 'next step', 'thank you'] },
  ];
  const matched = keywordMap.find((item) => item.patterns.some((pattern) => signal.includes(pattern)));
  if (matched) {
    return matched.key;
  }
  if (totalSlides <= 1) {
    return 'Opening';
  }
  const normalized = index / Math.max(1, totalSlides - 1);
  const bucket = Math.min(DECK_STORY_SECTIONS.length - 1, Math.floor(normalized * DECK_STORY_SECTIONS.length));
  return DECK_STORY_SECTIONS[bucket];
};

const createBlankDeckSlide = (id = 1) => ({
  id,
  title: `Slide ${id}`,
  subtitle: '',
  accent: 'from-indigo-500 to-violet-500',
  designPresetKey: DECK_DESIGN_PRESETS[(Math.max(0, id - 1)) % DECK_DESIGN_PRESETS.length]?.key || DECK_DESIGN_PRESETS[0].key,
  headline: '',
  blurb: '',
  visualType: 'hero statement',
  layoutStyle: 'cinematic split',
  motionCue: 'Soft fade and stagger reveal',
  keyMetric: '',
  speakerNotes: '',
  section: '',
  footer: 'Original design 繚 Editable',
});

// Sub-component to cleanly handle the local video stream without cluttering the main render
const LocalVideoFeed = ({ stream, isCameraOn }) => {
  const videoRef = useRef(null);

  useEffect(() => {
    if (videoRef.current && stream) {
      videoRef.current.srcObject = stream;
    }
  }, [stream]);

  if (!isCameraOn || !stream) {
    return (
      <div className="w-full h-full bg-gray-800 flex items-center justify-center">
        <div className="w-16 h-16 rounded-full bg-gray-700 flex items-center justify-center text-gray-400 text-xl font-bold">
          You
        </div>
      </div>
    );
  }

  return (
    <video
      ref={videoRef}
      autoPlay
      muted
      playsInline
      className="w-full h-full object-cover transform scale-x-[-1]"
    />
  );
};

const RoomStageFeed = ({ stream, placeholder }) => {
  const videoRef = useRef(null);

  useEffect(() => {
    if (videoRef.current) {
      videoRef.current.srcObject = stream || null;
    }
  }, [stream]);

  if (!stream) {
    return (
      <div className="w-full h-full flex items-center justify-center bg-gradient-to-br from-slate-900 via-slate-800 to-slate-700 text-slate-200">
        <div className="text-center">
          <div className="text-sm font-semibold">{placeholder}</div>
          <div className="text-xs text-slate-300 mt-1">Waiting for media input</div>
        </div>
      </div>
    );
  }

  return <video ref={videoRef} autoPlay muted playsInline className="w-full h-full object-cover" />;
};

export default function App() {
  const defaultTitle = 'Product Launch Plan';
  const defaultSubtitle = 'A strategic plan to successfully launch Regaarder Compose and drive adoption, engagement, and growth.';
  const defaultInitiatives = [
    { id: 1, name: 'Beta Launch', owner: 'Alex R.', timeline: 'May 15 - May 30', status: 'In Progress' },
    { id: 2, name: 'Creator Outreach', owner: 'Maya K.', timeline: 'May 20 - Jun 10', status: 'Planned' },
    { id: 3, name: 'Product Hunt Launch', owner: 'Jordan T.', timeline: 'Jun 15', status: 'Planned' },
    { id: 4, name: 'Paid Campaigns', owner: 'Sam K.', timeline: 'Jun 20 - Jul 10', status: 'Planned' },
  ];
  const defaultWorkspaces = [
    { id: 1, name: 'Regaarder', letter: 'R', colorClass: 'bg-indigo-500', hasDocuments: false },
    { id: 2, name: 'Product', letter: 'P', colorClass: 'bg-orange-500', hasDocuments: true },
    { id: 3, name: 'Marketing', letter: 'M', colorClass: 'bg-emerald-500', hasDocuments: false },
    { id: 4, name: 'Finance', letter: 'F', colorClass: 'bg-blue-500', hasDocuments: false },
    { id: 5, name: 'Personal', letter: 'P', colorClass: 'bg-fuchsia-500', hasDocuments: false },
  ];

  // Sidebar states
  const [leftSidebarOpen, setLeftSidebarOpen] = useState(false);
  const [leftSidebarWidth, setLeftSidebarWidth] = useState(256);
  const [rightSidebarOpen, setRightSidebarOpen] = useState(true);
  const [rightSidebarWidth, setRightSidebarWidth] = useState(340);
  const [rightPanelMaximized, setRightPanelMaximized] = useState(false);
  const [productMode, setProductMode] = useState('landing');
  const [creationPickerOpen, setCreationPickerOpen] = useState(false);
  const [activeDeckSlideId, setActiveDeckSlideId] = useState(1);
  const [deckTitle, setDeckTitle] = useState('Untitled deck');
  const [sheetsTitle, setSheetsTitle] = useState('Q2 Financial Overview');
  const [activeSheetId, setActiveSheetId] = useState(1);
  const [sheetsData, setSheetsData] = useState([
    { id: 1, title: 'Q2 Financial Overview', subtitle: 'Finance' },
    { id: 2, title: 'Revenue Breakdown', subtitle: 'Finance' },
    { id: 3, title: 'Profit & Loss', subtitle: 'Finance' },
    { id: 4, title: 'Cash Flow Statement', subtitle: 'Finance' },
    { id: 5, title: 'Product Metrics', subtitle: 'Operations' },
    { id: 6, title: 'Team OKRs', subtitle: 'Operations' },
    { id: 7, title: 'Market Research', subtitle: 'Analysis' },
  ]);
  const [deckPromptInput, setDeckPromptInput] = useState('');
  const [deckPromptMinimized, setDeckPromptMinimized] = useState(false);
  const [deckPromptOffset, setDeckPromptOffset] = useState({ x: 0, y: 0 });
  const [deckPromptChips, setDeckPromptChips] = useState(['Timeline', 'Checklist', 'Risk Analysis', 'Article', 'Presentation Draft']);
  const [deckCustomChip, setDeckCustomChip] = useState('');
  const [deckSlidesPanelOpen, setDeckSlidesPanelOpen] = useState(true);
  const [deckZoomLevel, setDeckZoomLevel] = useState(100);
  const [deckToolbarFont, setDeckToolbarFont] = useState('Manrope');
  const [deckToolbarMenuOpen, setDeckToolbarMenuOpen] = useState(false);
  const [deckContextRailTab, setDeckContextRailTab] = useState('Design');
  const [deckSlidesData, setDeckSlidesData] = useState([createBlankDeckSlide(1)]);
  const [activeRightTab, setActiveRightTab] = useState('room'); // 'chat' | 'assistant' | 'tasks' | 'calendar' | 'room' | 'memory'
  const [dragTarget, setDragTarget] = useState(null);
  const [promptOffset, setPromptOffset] = useState({ x: 0, y: -14 });
  const [isPromptExpanded, setIsPromptExpanded] = useState(true);
  const [promptWidth, setPromptWidth] = useState(620);
  const [isPromptMenuOpen, setIsPromptMenuOpen] = useState(false);
  const [isPromptAutoVisible, setIsPromptAutoVisible] = useState(false);
  const [isPromptDismissed, setIsPromptDismissed] = useState(false);
  const [isDarkMode, setIsDarkMode] = useState(false);
  const [hasVoiceInteraction, setHasVoiceInteraction] = useState(false);
  const [miniPromptOffset, setMiniPromptOffset] = useState({ x: 0, y: 0 });
  const [dictationOffset, setDictationOffset] = useState({ x: 0, y: 0 });
  const [dictationAnchor, setDictationAnchor] = useState({ left: 0, top: 0 });
  const [promptCollapsed, setPromptCollapsed] = useState(false);
  const [rotatingExampleSetIndex, setRotatingExampleSetIndex] = useState(0);

  // Example sets that rotate every minute
  const EXAMPLE_SETS = [
    [
      { text: 'Write an article based on my notes and audio files', Icon: PenTool },
      { text: 'Transform this document into a presentation deck', Icon: Presentation },
      { text: 'Create a project timeline from these documents', Icon: Calendar },
      { text: 'Summarize this document into key takeaways', Icon: FileText },
      { text: 'Extract action items from this meeting recording', Icon: ListTodo },
      { text: 'Build a report using data from these files', Icon: Database },
    ],
    [
      { text: 'Generate a summary from my research notes', Icon: FileText },
      { text: 'Create meeting minutes from this recording', Icon: ListTodo },
      { text: 'Build a marketing strategy from these insights', Icon: Presentation },
      { text: 'Extract key metrics from this dataset', Icon: Database },
      { text: 'Write a proposal based on these requirements', Icon: PenTool },
      { text: 'Organize notes into a structured outline', Icon: Calendar },
    ],
    [
      { text: 'Design a project plan from these goals', Icon: Calendar },
      { text: 'Create a presentation from my findings', Icon: Presentation },
      { text: 'Write documentation from these files', Icon: FileText },
      { text: 'Extract tasks from this project brief', Icon: ListTodo },
      { text: 'Analyze data and create visualizations', Icon: Database },
      { text: 'Compose a technical article from notes', Icon: PenTool },
    ],
  ];

  // Rotate example sets every 60 seconds
  useEffect(() => {
    const exampleRotationTimer = setInterval(() => {
      setRotatingExampleSetIndex((prevIndex) => (prevIndex + 1) % EXAMPLE_SETS.length);
    }, 60000);
    return () => clearInterval(exampleRotationTimer);
  }, [EXAMPLE_SETS.length]);
  
  // Interactive inputs
  const [chatInput, setChatInput] = useState('');
  const [floatingPrompt, setFloatingPrompt] = useState('');
  const [newTaskInput, setNewTaskInput] = useState('');
  const [newTaskOwner, setNewTaskOwner] = useState('user');
  const [editingTaskId, setEditingTaskId] = useState(null);
  const [editingTaskText, setEditingTaskText] = useState('');
  const [chatAttachments, setChatAttachments] = useState([]);
  const [scheduleAttachments, setScheduleAttachments] = useState([]);
  const [voiceTarget, setVoiceTarget] = useState('compose');
  const [scheduleInput, setScheduleInput] = useState('');
  const [scheduleOutput, setScheduleOutput] = useState([]);
  const [upcomingEvents, setUpcomingEvents] = useState([
    { id: 1, title: 'Beta Launch Kickoff', slotLabel: 'May 15 - 10:00 AM' },
    { id: 2, title: 'Product Hunt Checklist Finalization', slotLabel: 'June 14 - 2:30 PM' },
  ]);
  const [scheduleForm, setScheduleForm] = useState({
    startDate: '2026-05-29',
    startTime: '10:00',
    endTime: '11:00',
    timezone: 'GMT+5:30',
    title: 'Project MOAT Sync',
    roomLink: 'https://compose.ai/room/moat-sync',
    notification: '30 minutes before',
    whoCanJoin: 'Only invited people',
    addToCalendar: "Joshua's Calendar",
    repeat: 'Does not repeat',
    allowRecording: true,
  });
  const [scheduleOptionsState, setScheduleOptionsState] = useState({
    aiNotes: true,
    screenSharing: false,
    whiteboard: false,
    waitingRoom: false,
  });
  const [scheduleParticipants, setScheduleParticipants] = useState([
    { id: 'self', name: 'Joshua (You)', img: 'https://images.unsplash.com/photo-1599566150163-29194dcaad36?auto=format&fit=crop&w=320&q=80' },
    { id: 'mike', name: 'Mike', img: 'https://images.unsplash.com/photo-1500648767791-00dcc994a43e?auto=format&fit=crop&w=320&q=80' },
    { id: 'ana', name: 'Ana', img: 'https://images.unsplash.com/photo-1487412720507-e7ab37603c6f?auto=format&fit=crop&w=320&q=80' },
  ]);
  const [participantSchedules, setParticipantSchedules] = useState({});
  const [calendarMonth, setCalendarMonth] = useState(4); // 0=Jan, 4=May
  const [calendarYear, setCalendarYear] = useState(2026);
  const [selectedCalendarDate, setSelectedCalendarDate] = useState(new Date(2026, 4, 15));
  const [isScheduleCalendarExpanded, setIsScheduleCalendarExpanded] = useState(false);
  const [isScheduleSessionModalOpen, setIsScheduleSessionModalOpen] = useState(false);
  const [isSchedulePeopleMenuOpen, setIsSchedulePeopleMenuOpen] = useState(false);
  const [isQuickAddSourceMenuOpen, setIsQuickAddSourceMenuOpen] = useState(false);
  
  // AI State machine
  const [isComposing, setIsComposing] = useState(false);
  const [isVoiceActive, setIsVoiceActive] = useState(false);
  const [isMicMuted, setIsMicMuted] = useState(false);
  const [mainView, setMainView] = useState('document');
  const [roomState, setRoomState] = useState('lobby');
  const [roomMode, setRoomMode] = useState('meetings');
  const [roomId, setRoomId] = useState('');
  const [joinCode, setJoinCode] = useState('');
  const [isRoomStartMenuOpen, setIsRoomStartMenuOpen] = useState(false);
  const [isRoomInviteModalOpen, setIsRoomInviteModalOpen] = useState(false);
  const [isRoomMicOn, setIsRoomMicOn] = useState(true);
  const [isRoomCameraOn, setIsRoomCameraOn] = useState(true);
  const [isScreenSharing, setIsScreenSharing] = useState(false);
  const [localStream, setLocalStream] = useState(null);
  const [screenShareStream, setScreenShareStream] = useState(null);
  const [roomPanelMode, setRoomPanelMode] = useState('expanded');
  const [meetingStartedAt, setMeetingStartedAt] = useState(null);
  const [meetingDurationLabel, setMeetingDurationLabel] = useState('00:00');
  const [meetingSummary, setMeetingSummary] = useState(null);
  const [activeMeetingStageTab, setActiveMeetingStageTab] = useState('room');
  const [sharedMeetingFiles, setSharedMeetingFiles] = useState([]);
  const [activeSharedMeetingFileId, setActiveSharedMeetingFileId] = useState(null);
  const [collaboratorInvite, setCollaboratorInvite] = useState('');
  const [meetingParticipants] = useState([
    { name: 'Sarah', img: 'https://images.unsplash.com/photo-1534528741775-53994a69daeb?auto=format&fit=crop&w=320&q=80' },
    { name: 'Mike', img: 'https://images.unsplash.com/photo-1500648767791-00dcc994a43e?auto=format&fit=crop&w=320&q=80' },
    { name: 'Ana', img: 'https://images.unsplash.com/photo-1487412720507-e7ab37603c6f?auto=format&fit=crop&w=320&q=80' },
  ]);
  const [mediaError, setMediaError] = useState(false);
  const [platformContacts, setPlatformContacts] = useState([
    { id: 1, name: 'Sarah Lang', title: 'Product Lead', status: 'active', lastSeen: 'In call now' },
    { id: 2, name: 'Mike Cohen', title: 'Growth Lead', status: 'active', lastSeen: 'Online' },
    { id: 3, name: 'Maya Patel', title: 'Design Director', status: 'active', lastSeen: 'Online' },
    { id: 4, name: 'Jordan Kim', title: 'Operations', status: 'away', lastSeen: '5m ago' },
  ]);
  const [speechSupported, setSpeechSupported] = useState(false);
  const [toastMessage, setToastMessage] = useState('');
  const [workspaces, setWorkspaces] = useState(defaultWorkspaces);
  const [workspaceModalOpen, setWorkspaceModalOpen] = useState(false);
  const [workspaceModalMode, setWorkspaceModalMode] = useState('create');
  const [workspaceNameInput, setWorkspaceNameInput] = useState('');
  const [editingWorkspaceId, setEditingWorkspaceId] = useState(null);
  const [openWorkspaceMenuId, setOpenWorkspaceMenuId] = useState(null);
  const [shareModalOpen, setShareModalOpen] = useState(false);
  const [shareTargetDocId, setShareTargetDocId] = useState(null);
  const [shareTargetDocTitle, setShareTargetDocTitle] = useState('');
  const [shareDestination, setShareDestination] = useState('friends');
  const [shareFormat, setShareFormat] = useState('Compose (.cmp)');
  const [shareAccess, setShareAccess] = useState('Viewer');
  const [shareLink, setShareLink] = useState('');
  const [composeOutputFormat, setComposeOutputFormat] = useState('Auto (Compose decides)');
  const [customComposeFormat, setCustomComposeFormat] = useState('');
  const [promptTone, setPromptTone] = useState('normal');
  const [promptLengthMode, setPromptLengthMode] = useState('words');
  const [promptLengthValue, setPromptLengthValue] = useState(220);
  const [promptTuneMenuOpen, setPromptTuneMenuOpen] = useState(false);
  const [promptFormatMenuOpen, setPromptFormatMenuOpen] = useState(false);
  const [promptLibraryOpen, setPromptLibraryOpen] = useState(false);
  const [promptHistory, setPromptHistory] = useState([]);
  const [promptHistorySearch, setPromptHistorySearch] = useState('');
  const [promptHistoryFilter, setPromptHistoryFilter] = useState('all');
  const [promptHistoryFilterMenuOpen, setPromptHistoryFilterMenuOpen] = useState(false);
  const [editingPromptId, setEditingPromptId] = useState(null);
  const [editingPromptValue, setEditingPromptValue] = useState('');
  const [assistantQuickPrompt, setAssistantQuickPrompt] = useState('');
  const [selectionMenuPrompt, setSelectionMenuPrompt] = useState('');
  const [isPromptMinimized, setIsPromptMinimized] = useState(false);
  const [selectedEditorText, setSelectedEditorText] = useState('');
  const [selectionActionMenu, setSelectionActionMenu] = useState({ open: false, left: 0, top: 0 });
  const [documentOutlineItems, setDocumentOutlineItems] = useState([]);
  const [promptAttachments, setPromptAttachments] = useState([]);
  const [previewAttachment, setPreviewAttachment] = useState(null);
  const [lastComposeRun, setLastComposeRun] = useState(null);
  const [liveSpeechInterimText, setLiveSpeechInterimText] = useState('');
  const [memoryCaptureEnabled, setMemoryCaptureEnabled] = useState(true);
  const [memoryRetentionDays, setMemoryRetentionDays] = useState(90);
  const [memoryEntries, setMemoryEntries] = useState([]);
  const [memoryFilter, setMemoryFilter] = useState('all');
  const [memorySearch, setMemorySearch] = useState('');
  const [lastAiError, setLastAiError] = useState('');
  const [aiBackendStatus, setAiBackendStatus] = useState({ state: 'idle', message: 'Not checked yet' });
  const [chatFeedbackDrafts, setChatFeedbackDrafts] = useState({});
  const [deckSnapshotPreviews, setDeckSnapshotPreviews] = useState({});
  const [sheetSnapshotPreviews, setSheetSnapshotPreviews] = useState({});
  const [sheetToolbarFont, setSheetToolbarFont] = useState('Manrope');
  const [sheetToolbarSize, setSheetToolbarSize] = useState(10);
  const [sheetToolbarBold, setSheetToolbarBold] = useState(false);
  const [sheetToolbarItalic, setSheetToolbarItalic] = useState(false);
  const [sheetToolbarUnderline, setSheetToolbarUnderline] = useState(false);
  const [sheetToolbarTab, setSheetToolbarTab] = useState('AI');
  const [replayPanelOpen, setReplayPanelOpen] = useState(false);
  const [isReplayPlaying, setIsReplayPlaying] = useState(false);
  const [replayIndex, setReplayIndex] = useState(null);
  const [replayDirection, setReplayDirection] = useState(-1);
  const [replaySpeed, setReplaySpeed] = useState(1);
  const [replaySpeedMenuOpen, setReplaySpeedMenuOpen] = useState(false);
  const [replayTimeline, setReplayTimeline] = useState([]);
  const [replaySharing, setReplaySharing] = useState(false);
  const [lastSavedAt, setLastSavedAt] = useState(null);
  const [relativeNow, setRelativeNow] = useState(Date.now());
  const [notificationsOpen, setNotificationsOpen] = useState(false);
  const [notifications, setNotifications] = useState([
    { id: 1, title: 'Replay link ready to share', detail: 'Copy and send to collaborators', unread: true },
    { id: 2, title: 'Document saved locally', detail: 'Your latest draft is persisted', unread: false },
    { id: 3, title: 'AI assistant is active', detail: 'Ask about selected text anytime', unread: false },
  ]);
  const [sheetToolbarMenuOpen, setSheetToolbarMenuOpen] = useState(null);
  const [selectedSheetCell, setSelectedSheetCell] = useState({ row: 1, col: 1 });
  const [pageContextMenu, setPageContextMenu] = useState({ open: false, x: 0, y: 0, itemId: null, isSheets: false });
  const [sheetGrids, setSheetGrids] = useState(() => {
    const makeCells = (rows, cols) => Array.from({ length: rows }, () => Array.from({ length: cols }, () => ''));
    const result = {};
    [
      { id: 1 }, { id: 2 }, { id: 3 }, { id: 4 }, { id: 5 }, { id: 6 }, { id: 7 },
    ].forEach((item) => {
      result[item.id] = { rows: 22, cols: 7, cells: makeCells(22, 7) };
    });
    return result;
  });

  // Auto-scroll ref for chat
  const chatEndRef = useRef(null);
  const documentCardRef = useRef(null);
  const blankBodyRef = useRef(null);
  const titleEditableRef = useRef(null);
  const subtitleEditableRef = useRef(null);
  const formattingMenuRef = useRef(null);
  const savedSelectionRef = useRef(null);
  const speechRecognitionRef = useRef(null);
  const promptAudioInputRef = useRef(null);
  const floatingPromptRef = useRef(null);
  const chatInputRef = useRef(null);
  const scheduleInputRef = useRef(null);
  const promptMenuRef = useRef(null);
  const promptRootRef = useRef(null);
  const promptTuneRef = useRef(null);
  const promptFormatRef = useRef(null);
  const promptLibraryRef = useRef(null);
  const promptHistoryFilterRef = useRef(null);
  const docSearchPanelRef = useRef(null);
  const replaySpeedMenuRef = useRef(null);
  const notificationsPanelRef = useRef(null);
  const promptFileInputRef = useRef(null);
  const chatFileInputRef = useRef(null);
  const scheduleFileInputRef = useRef(null);
  const schedulePeopleMenuRef = useRef(null);
  const quickAddSourceMenuRef = useRef(null);
  const voiceTargetRef = useRef('compose');
  const isMicMutedRef = useRef(false);
  const isVoiceActiveRef = useRef(false);
  const insertTranscriptIntoDocumentRef = useRef(null);
  const pendingInterimTranscriptRef = useRef('');
  const interimCommitTimerRef = useRef(null);
  const selectedEditorTextRef = useRef('');
  const pointerDownInPromptRef = useRef(false);
  const pointerDownInDocumentRef = useRef(false);
  const calendarMenuRef = useRef(null);
  const scheduleRepeatMenuRef = useRef(null);
  const formattingDropdownCloseTimerRef = useRef(null);
  const textStyleMenuCloseTimerRef = useRef(null);
  const didAutoJoinRoomRef = useRef(false);
  const dragStateRef = useRef({
    startX: 0,
    startY: 0,
    leftWidth: 256,
    rightWidth: 340,
    promptX: 0,
    promptY: -14,
    miniPromptX: 0,
    miniPromptY: 0,
    dictationX: 0,
    dictationY: 0,
    deckPromptX: 0,
    deckPromptY: 0,
  });
  const wholeDocSelectionRef = useRef(false);
  const replayLoadedFromUrlRef = useRef(false);
  const micPermissionGrantedRef = useRef(false);
  const mockDictationTimeoutRef = useRef(null);
  const mockIntervalRef = useRef(null);
  const interimTranscriptRef = useRef('');
  const lastDocumentTranscriptRef = useRef({ text: '', source: '', at: 0 });
  const toastTimerRef = useRef(null);
  const promptRevealTimerRef = useRef(null);
  const deckCanvasPreviewRef = useRef(null);
  const sheetCanvasPreviewRef = useRef(null);
  const pageContextMenuRef = useRef(null);
  const sheetToolbarMenuRef = useRef(null);
  const deckToolbarMenuRef = useRef(null);
  const selectionActionMenuRef = useRef(null);
  const selectionMenuInputRef = useRef(null);
  const pointerDownInSelectionMenuRef = useRef(false);
  const docSearchMarksRef = useRef([]);
  const docSearchAutoPlayTimerRef = useRef(null);
  const roomJoinInputRef = useRef(null);
  const meetingShareFileInputRef = useRef(null);

  // Stateful document content
  const [docTitle, setDocTitle] = useState('');
  const [docSubtitle, setDocSubtitle] = useState('');
  const [isTopDraftTitleExpanded, setIsTopDraftTitleExpanded] = useState(false);
  const [initiatives, setInitiatives] = useState(defaultInitiatives);
  const [isBlankDocument, setIsBlankDocument] = useState(true);
  const [documents, setDocuments] = useState([
    {
      id: Date.now(),
      title: '',
      subtitle: '',
      initiatives: defaultInitiatives,
      appendedSections: [],
      isBlank: true,
      bodyHtml: '',
    },
  ]);
  const [activeDocId, setActiveDocId] = useState(null);
  const [docBodyHtml, setDocBodyHtml] = useState('');
  const [closeConfirmDocId, setCloseConfirmDocId] = useState(null);
  const [openDropdown, setOpenDropdown] = useState(null);
  const [headingSearch, setHeadingSearch] = useState('');
  const [fontSearch, setFontSearch] = useState('');
  const [sizeSearch, setSizeSearch] = useState('');
  const [openDocMenuId, setOpenDocMenuId] = useState(null);
  const [renamingDocId, setRenamingDocId] = useState(null);
  const [renameDocValue, setRenameDocValue] = useState('');
  const [languageMenuOpen, setLanguageMenuOpen] = useState(false);
  const [currentLanguage, setCurrentLanguage] = useState('Auto detect');
  const [isUnsavedDraftVisible, setIsUnsavedDraftVisible] = useState(true);
  const [isEditingUnsavedDraftName, setIsEditingUnsavedDraftName] = useState(false);
  const [unsavedDraftNameInput, setUnsavedDraftNameInput] = useState('');
  const [activePrimaryNav, setActivePrimaryNav] = useState('home');
  const [documentStats, setDocumentStats] = useState({ words: 0, characters: 0 });
  const [zoomLevel, setZoomLevel] = useState(100);
  const [isFocusMode, setIsFocusMode] = useState(false);
  const [textStyleMenuOpen, setTextStyleMenuOpen] = useState(false);
  const [activeDocView, setActiveDocView] = useState('document');
  const [isFormattingDropdownHovered, setIsFormattingDropdownHovered] = useState(false);
  const [isTextStyleMenuHovered, setIsTextStyleMenuHovered] = useState(false);

  const [editorHeading, setEditorHeading] = useState('Heading 1');
  const [editorFont, setEditorFont] = useState('Manrope');
  const [editorSize, setEditorSize] = useState(36);
  const [isBoldActive, setIsBoldActive] = useState(false);
  const [isItalicActive, setIsItalicActive] = useState(false);
  const [isUnderlineActive, setIsUnderlineActive] = useState(false);
  const [isStrikeActive, setIsStrikeActive] = useState(false);
  const [alignMode, setAlignMode] = useState('left');
  const [isListActive, setIsListActive] = useState(false);
  const [showPageNumbers, setShowPageNumbers] = useState(true);
  const [showPageNumberOnFirstPage, setShowPageNumberOnFirstPage] = useState(true);
  const [pageNumberPosition, setPageNumberPosition] = useState('center');
  const [docSearchPanelOpen, setDocSearchPanelOpen] = useState(false);
  const [docSearchMode, setDocSearchMode] = useState('find');
  const [docSearchQuery, setDocSearchQuery] = useState('');
  const [docReplaceValue, setDocReplaceValue] = useState('');
  const [docGoToValue, setDocGoToValue] = useState('1');
  const [docSearchAiEnabled, setDocSearchAiEnabled] = useState(false);
  const [docSearchActiveIndex, setDocSearchActiveIndex] = useState(0);
  const [docSearchMatchCount, setDocSearchMatchCount] = useState(0);
  const [docSearchAutoPlay, setDocSearchAutoPlay] = useState(false);
  const [docSearchSummary, setDocSearchSummary] = useState('');
  const [outlineLevelMenuOpen, setOutlineLevelMenuOpen] = useState(false);
  const [outlineLevels, setOutlineLevels] = useState(3);

  const headingOptions = ['Heading 1', 'Heading 2', 'Heading 3', 'Paragraph'];
  const headingMeta = {
    'Heading 1': { tag: 'H1', size: 42, previewClass: 'text-base font-bold' },
    'Heading 2': { tag: 'H2', size: 34, previewClass: 'text-sm font-semibold' },
    'Heading 3': { tag: 'H3', size: 26, previewClass: 'text-xs font-semibold' },
    Paragraph: { tag: 'P', size: 16, previewClass: 'text-xs font-normal' },
  };
  const fontOptions = [
    'Manrope',
    'Satoshi',
    'General Sans',
    'Plus Jakarta Sans',
    'IBM Plex Sans',
    'DM Sans',
    'Public Sans',
    'SF Pro Display',
    'Helvetica Now',
    'Aptos',
    'Merriweather',
    'Libre Baskerville',
    'Playfair Display',
    'Source Serif 4',
    'Charter',
    'Lora',
    'Spectral',
    'Poppins',
    'Montserrat',
    'Outfit',
    'Space Grotesk',
    'Clash Display',
    'Neue Haas Grotesk',
    'Circular Std',
    'Avenir Next',
    'JetBrains Mono',
    'IBM Plex Mono',
    'Fira Code',
    'Source Code Pro',
    'Inter',
    'Georgia',
    'Verdana',
    'Courier New',
    'Times New Roman',
    'Trebuchet MS',
  ];
  const sizeOptions = [12, 14, 16, 18, 20, 24, 28, 32, 36, 40, 48, 56, 64];
  const composeFormatOptions = ['Auto (Compose decides)', 'Timeline', 'Checklist', 'Risk Analysis', 'Article', 'Presentation Draft', 'Proposal', 'Plain Text', 'Custom...'];
  const promptToneOptions = [
    { key: 'formal', label: 'Formal' },
    { key: 'normal', label: 'Normal' },
    { key: 'geeky', label: 'Geeky' },
    { key: 'naive', label: 'Naive' },
    { key: 'concise', label: 'Concise' },
  ];

  const escapeHtml = (value) => String(value || '')
    .replace(/&/g, '&amp;')
    .replace(/</g, '&lt;')
    .replace(/>/g, '&gt;')
    .replace(/\"/g, '&quot;')
    .replace(/'/g, '&#39;');

  const getPlainText = (value) => String(value || '')
    .replace(/<[^>]*>/g, ' ')
    .replace(/\s+/g, ' ')
    .trim();

  const detectBrowserLocale = () => {
    if (typeof navigator === 'undefined') {
      return 'en-US';
    }
    const preferred = Array.isArray(navigator.languages) && navigator.languages.length
      ? navigator.languages[0]
      : navigator.language;
    return String(preferred || 'en-US');
  };

  const resolveSpeechLocale = (languageLabel = currentLanguage) => {
    const map = {
      'English (US)': 'en-US',
      'English (UK)': 'en-GB',
      Spanish: 'es-ES',
      French: 'fr-FR',
      German: 'de-DE',
      Chinese: 'zh-CN',
    };
    if (languageLabel === 'Auto detect') {
      return detectBrowserLocale();
    }
    return map[languageLabel] || detectBrowserLocale();
  };

  const getDisplayLanguageLabel = () => {
    if (currentLanguage !== 'Auto detect') {
      return currentLanguage;
    }
    const locale = resolveSpeechLocale('Auto detect');
    return `Auto detect (${locale})`;
  };

  const computeDocumentStats = useCallback(() => {
    const rawText = String(documentCardRef.current?.innerText || '')
      .replace(/\u00a0/g, ' ')
      .replace(/\s+/g, ' ')
      .trim();
    const words = rawText ? rawText.split(' ').filter(Boolean).length : 0;
    const characters = rawText.length;
    setDocumentStats({ words, characters });
  }, []);

  const computeDocumentOutline = useCallback(() => {
    if (!documentCardRef.current) {
      setDocumentOutlineItems([]);
      return;
    }

    const headingNodes = Array.from(documentCardRef.current.querySelectorAll('h1, h2, h3'));
    const outline = [];
    const titleText = String(docTitle || '').trim();
    if (titleText) {
      outline.push({ id: 'doc-title-anchor', level: 1, label: titleText, isTitle: true });
    }

    headingNodes.forEach((node, index) => {
      const label = String(node.textContent || '').replace(/\s+/g, ' ').trim();
      if (!label) {
        return;
      }

      if (!node.dataset.outlineId) {
        node.dataset.outlineId = `outline-${index + 1}-${Math.floor(Math.random() * 100000)}`;
      }
      if (!node.id) {
        node.id = node.dataset.outlineId;
      }

      const level = Number.parseInt(node.tagName.replace('H', ''), 10);
      outline.push({
        id: node.id,
        level: Number.isNaN(level) ? 2 : level,
        label,
        isTitle: false,
      });
    });

    setDocumentOutlineItems(outline);
  }, [docTitle]);

  const jumpToOutlineItem = (item) => {
    if (!item) {
      return;
    }

    if (item.isTitle) {
      titleEditableRef.current?.scrollIntoView({ behavior: 'smooth', block: 'center' });
      return;
    }

    const target = document.getElementById(item.id);
    if (target) {
      target.scrollIntoView({ behavior: 'smooth', block: 'center' });
    }
  };

  const clearDocumentSearchHighlights = useCallback(() => {
    if (!documentCardRef.current) {
      return;
    }

    const marks = Array.from(documentCardRef.current.querySelectorAll('mark[data-doc-search-hit="true"]'));
    marks.forEach((mark) => {
      const parent = mark.parentNode;
      if (!parent) {
        return;
      }
      while (mark.firstChild) {
        parent.insertBefore(mark.firstChild, mark);
      }
      parent.removeChild(mark);
      parent.normalize();
    });

    docSearchMarksRef.current = [];
    setDocSearchActiveIndex(0);
    setDocSearchMatchCount(0);
  }, []);

  const collectDocumentSearchTerms = useCallback((rawQuery, aiEnabled) => {
    const query = String(rawQuery || '').trim();
    if (!query) {
      return [];
    }

    if (!aiEnabled) {
      return query.split(',').map((item) => item.trim()).filter(Boolean);
    }

    const text = String(documentCardRef.current?.innerText || '');
    if (/companies?|organizations?|orgs?/i.test(query)) {
      const strictMatches = text.match(/\b([A-Z][A-Za-z0-9&.-]*(?:\s+[A-Z][A-Za-z0-9&.-]*){0,3}\s+(?:Inc|LLC|Ltd|Corporation|Corp|Company|Group|Technologies|Systems|Labs|Holdings))\b/g) || [];
      const fallbackMatches = strictMatches.length
        ? []
        : (text.match(/\b[A-Z][a-zA-Z]+(?:\s+[A-Z][a-zA-Z]+){1,2}\b/g) || []);
      return Array.from(new Set([...strictMatches, ...fallbackMatches].map((item) => item.trim()).filter(Boolean))).slice(0, 40);
    }

    const directChunks = query.split(',').map((item) => item.trim()).filter(Boolean);
    return directChunks.length ? directChunks : [query];
  }, []);

  const focusSearchMatchAtIndex = useCallback((index) => {
    const marks = docSearchMarksRef.current;
    if (!marks.length) {
      return;
    }

    const safeIndex = ((index % marks.length) + marks.length) % marks.length;
    marks.forEach((mark, markIndex) => {
      if (!mark) {
        return;
      }
      mark.style.background = markIndex === safeIndex ? '#fde68a' : '#fef3c7';
      mark.style.outline = markIndex === safeIndex ? '2px solid #f59e0b' : 'none';
      mark.style.borderRadius = '4px';
    });

    const target = marks[safeIndex];
    target?.scrollIntoView({ behavior: 'smooth', block: 'center' });
    setDocSearchActiveIndex(safeIndex);
  }, []);

  const highlightDocumentSearchTerms = useCallback((rawQuery = docSearchQuery, aiEnabled = docSearchAiEnabled) => {
    clearDocumentSearchHighlights();

    if (!documentCardRef.current) {
      return;
    }

    const terms = collectDocumentSearchTerms(rawQuery, aiEnabled)
      .map((term) => term.trim())
      .filter(Boolean)
      .sort((a, b) => b.length - a.length);
    if (!terms.length) {
      setDocSearchSummary('No query entered.');
      return;
    }

    const escapedTerms = terms.map((term) => term.replace(/[.*+?^${}()|[\]\\]/g, '\\$&'));
    const matcher = new RegExp(`(${escapedTerms.join('|')})`, 'gi');
    const walker = document.createTreeWalker(documentCardRef.current, NodeFilter.SHOW_TEXT, {
      acceptNode: (node) => {
        if (!node?.nodeValue?.trim()) {
          return NodeFilter.FILTER_REJECT;
        }
        const parentTag = node.parentElement?.tagName;
        if (parentTag === 'SCRIPT' || parentTag === 'STYLE' || parentTag === 'MARK') {
          return NodeFilter.FILTER_REJECT;
        }
        return NodeFilter.FILTER_ACCEPT;
      },
    });

    const textNodes = [];
    let currentNode = walker.nextNode();
    while (currentNode) {
      textNodes.push(currentNode);
      currentNode = walker.nextNode();
    }

    const marks = [];
    textNodes.forEach((textNode) => {
      const source = textNode.nodeValue || '';
      matcher.lastIndex = 0;
      if (!matcher.test(source)) {
        return;
      }
      matcher.lastIndex = 0;

      const fragment = document.createDocumentFragment();
      let cursor = 0;
      let match = matcher.exec(source);
      while (match) {
        const start = match.index;
        const end = start + match[0].length;
        if (start > cursor) {
          fragment.appendChild(document.createTextNode(source.slice(cursor, start)));
        }
        const mark = document.createElement('mark');
        mark.setAttribute('data-doc-search-hit', 'true');
        mark.style.background = '#fef3c7';
        mark.style.padding = '0 1px';
        mark.style.borderRadius = '4px';
        mark.textContent = source.slice(start, end);
        fragment.appendChild(mark);
        marks.push(mark);
        cursor = end;
        match = matcher.exec(source);
      }
      if (cursor < source.length) {
        fragment.appendChild(document.createTextNode(source.slice(cursor)));
      }
      textNode.parentNode?.replaceChild(fragment, textNode);
    });

    docSearchMarksRef.current = marks;
    setDocSearchMatchCount(marks.length);
    if (marks.length) {
      focusSearchMatchAtIndex(0);
      if (aiEnabled && /companies?|organizations?|orgs?/i.test(String(rawQuery || ''))) {
        setDocSearchSummary(`AI found ${marks.length} likely company references.`);
      } else {
        setDocSearchSummary(`Found ${marks.length} matches.`);
      }
      return;
    }

    setDocSearchSummary('No matches found.');
  }, [clearDocumentSearchHighlights, collectDocumentSearchTerms, docSearchAiEnabled, docSearchQuery, focusSearchMatchAtIndex]);

  const replaceHighlightedSearchMatches = useCallback(() => {
    const marks = docSearchMarksRef.current;
    if (!marks.length) {
      showToast('No highlighted matches to replace');
      return;
    }

    const nextValue = String(docReplaceValue || '');
    marks.forEach((mark) => {
      const replacementNode = document.createTextNode(nextValue);
      mark.parentNode?.replaceChild(replacementNode, mark);
    });

    if (documentCardRef.current) {
      documentCardRef.current.normalize();
    }

    docSearchMarksRef.current = [];
    setDocSearchMatchCount(0);
    setDocSearchActiveIndex(0);
    setDocSearchSummary(nextValue ? 'Replaced highlighted matches.' : 'Removed highlighted matches.');

    if (blankBodyRef.current) {
      setDocBodyHtml(blankBodyRef.current.innerHTML);
    }
    computeDocumentStats();
    computeDocumentOutline();
  }, [computeDocumentOutline, computeDocumentStats, docReplaceValue]);

  const goToDocumentPage = useCallback(() => {
    const card = documentCardRef.current;
    if (!card) {
      return;
    }

    const requested = Math.max(1, Number.parseInt(String(docGoToValue || '1'), 10) || 1);
    const scroller = card.closest('.overflow-y-auto');
    if (!scroller) {
      return;
    }

    const pageTop = Math.max(0, (requested - 1) * ENTERPRISE_PAGE_HEIGHT_PX);
    scroller.scrollTo({ top: pageTop, behavior: 'smooth' });
    setDocSearchSummary(`Moved to page ${requested}.`);
  }, [docGoToValue]);

  const shouldInsertNewPageOnEnter = useCallback(() => {
    const selection = window.getSelection();
    if (!selection || !selection.rangeCount) {
      return false;
    }

    const range = selection.getRangeAt(0);
    const rect = range.getBoundingClientRect();
    const anchorNode = selection.anchorNode;
    const anchorElement = anchorNode?.nodeType === Node.TEXT_NODE ? anchorNode.parentElement : anchorNode;
    const pageHost = anchorElement?.closest?.('[data-enterprise-page="true"]');

    if (pageHost) {
      const pageRect = pageHost.getBoundingClientRect();
      return rect.bottom >= pageRect.bottom - 100;
    }

    if (!documentCardRef.current) {
      return false;
    }
    const cardRect = documentCardRef.current.getBoundingClientRect();
    const firstPageBottom = cardRect.top + ENTERPRISE_PAGE_HEIGHT_PX;
    return rect.bottom >= firstPageBottom - 100;
  }, []);

  const insertEnterprisePage = useCallback(() => {
    const selection = window.getSelection();
    if (!selection || !selection.rangeCount || !blankBodyRef.current) {
      return;
    }

    const existingPages = blankBodyRef.current.querySelectorAll('[data-enterprise-page="true"]').length;
    const pageNumber = existingPages + 2;
    const range = selection.getRangeAt(0);
    const pageWrapper = document.createElement('div');
    pageWrapper.setAttribute('data-enterprise-page', 'true');
    pageWrapper.style.position = 'relative';
    pageWrapper.style.minHeight = `${ENTERPRISE_PAGE_HEIGHT_PX}px`;
    pageWrapper.style.marginTop = '24px';
    pageWrapper.style.padding = '64px 0 78px';
    pageWrapper.style.background = '#ffffff';
    pageWrapper.style.border = '1px solid rgba(148,163,184,0.22)';
    pageWrapper.style.borderRadius = '20px';
    pageWrapper.style.boxShadow = '0 10px 22px -18px rgba(15,23,42,0.22)';

    const paragraph = document.createElement('p');
    paragraph.innerHTML = '<br/>';
    pageWrapper.appendChild(paragraph);

    const pageNumberEl = document.createElement('div');
    pageNumberEl.setAttribute('contenteditable', 'false');
    pageNumberEl.style.position = 'absolute';
    pageNumberEl.style.left = '50%';
    pageNumberEl.style.bottom = '38px';
    pageNumberEl.style.transform = 'translateX(-50%)';
    pageNumberEl.style.fontSize = '11px';
    pageNumberEl.style.fontWeight = '500';
    pageNumberEl.style.color = '#94a3b8';
    pageNumberEl.textContent = String(pageNumber);
    pageWrapper.appendChild(pageNumberEl);

    range.insertNode(pageWrapper);

    const nextRange = document.createRange();
    nextRange.selectNodeContents(paragraph);
    nextRange.collapse(true);
    selection.removeAllRanges();
    selection.addRange(nextRange);

    requestAnimationFrame(() => {
      pageWrapper.scrollIntoView({ behavior: 'smooth', block: 'start' });
      setDocBodyHtml(blankBodyRef.current?.innerHTML || '');
      computeDocumentStats();
      computeDocumentOutline();
    });
  }, [computeDocumentOutline, computeDocumentStats]);

  const buildHeadingPlanFromText = useCallback((sourceText, maxLevels = 3) => {
    const normalized = String(sourceText || '').replace(/\r/g, '').trim();
    if (!normalized) {
      return { title: 'Untitled document', sections: [] };
    }

    const lines = normalized
      .split(/\n+/)
      .map((line) => line.trim())
      .filter(Boolean);
    const chunks = lines.length > 2 ? lines : normalized.split(/(?<=[.!?])\s+(?=[A-Z])/).map((line) => line.trim()).filter(Boolean);
    const titleSeed = (chunks[0] || 'Untitled document').replace(/^[-*\d.\s]+/, '').slice(0, 96);

    const sections = chunks.slice(0, 8).map((chunk, index) => {
      const cleaned = chunk.replace(/^[-*\d.\s]+/, '').trim();
      const words = cleaned.split(/\s+/).filter(Boolean);
      const heading = words.slice(0, Math.min(7, words.length)).join(' ').replace(/[,:;]+$/, '');
      const level = maxLevels <= 2 ? 2 : (index % maxLevels) + 2 > 4 ? 4 : (index % maxLevels) + 2;
      return {
        heading: heading || `Section ${index + 1}`,
        text: cleaned,
        level,
      };
    });

    return {
      title: titleSeed || 'Untitled document',
      sections,
    };
  }, []);

  const applyGeneratedTitleAndHeadings = useCallback(() => {
    const selectedScope = selectedEditorTextRef.current || selectedEditorText;
    const sourceText = selectedScope || String(documentCardRef.current?.innerText || '').trim();
    const plan = buildHeadingPlanFromText(sourceText, 3);
    if (!plan.sections.length) {
      showToast('Add some text first, then generate headings.');
      return;
    }

    const html = plan.sections.map((section, index) => `
      <h2 style="font-size:30px;line-height:1.25;font-weight:700;color:#0f172a;margin:22px 0 10px;">${escapeHtml(section.heading || `Section ${index + 1}`)}</h2>
      <p style="font-size:17px;line-height:1.75;color:#334155;margin:0 0 14px;">${escapeHtml(section.text)}</p>
    `).join('');

    setDocTitle(plan.title);
    if (!docSubtitle?.trim() || docSubtitle === AI_NATIVE_PLACEHOLDER || docSubtitle === defaultSubtitle) {
      setDocSubtitle('Auto-structured from your current document content.');
    }
    setIsBlankDocument(true);
    setAppendedSections([]);
    setDocBodyHtml(html);
    setLeftSidebarOpen(true);
    setTimeout(() => computeDocumentOutline(), 0);
    showToast('Generated clean title and section headings');
  }, [buildHeadingPlanFromText, computeDocumentOutline, defaultSubtitle, docSubtitle, selectedEditorText]);

  const applyGeneratedOutline = useCallback((levels = 3) => {
    const selectedScope = selectedEditorTextRef.current || selectedEditorText;
    const sourceText = selectedScope || String(documentCardRef.current?.innerText || '').trim();
    const plan = buildHeadingPlanFromText(sourceText, Math.max(2, Math.min(4, Number(levels) || 3)));
    if (!plan.sections.length) {
      showToast('Add some text first, then generate an outline.');
      return;
    }

    const tocItems = plan.sections.map((section, index) => {
      const indent = section.level === 2 ? 0 : section.level === 3 ? 18 : 34;
      return `<li style="margin:0 0 6px ${indent}px;color:#475569;">${escapeHtml(section.heading || `Section ${index + 1}`)}</li>`;
    }).join('');

    const bodySections = plan.sections.map((section, index) => {
      const tag = section.level === 2 ? 'h2' : section.level === 3 ? 'h3' : 'h4';
      const headingSize = section.level === 2 ? 30 : section.level === 3 ? 24 : 20;
      return `
        <${tag} style="font-size:${headingSize}px;line-height:1.3;font-weight:700;color:#0f172a;margin:20px 0 8px;">${escapeHtml(section.heading || `Section ${index + 1}`)}</${tag}>
        <p style="font-size:16px;line-height:1.75;color:#334155;margin:0 0 12px;">${escapeHtml(section.text)}</p>
      `;
    }).join('');

    const html = `
      <div data-generated-outline="true" style="border:1px solid #e2e8f0;background:#f8fafc;border-radius:14px;padding:14px 16px;margin:4px 0 16px;">
        <div style="font-size:12px;font-weight:700;letter-spacing:0.08em;text-transform:uppercase;color:#64748b;margin-bottom:8px;">Table of Contents</div>
        <ol style="margin:0;padding-left:16px;line-height:1.6;">${tocItems}</ol>
      </div>
      ${bodySections}
    `;

    setDocTitle(plan.title);
    setIsBlankDocument(true);
    setAppendedSections([]);
    setDocBodyHtml(html);
    setLeftSidebarOpen(true);
    setTimeout(() => computeDocumentOutline(), 0);
    showToast(`Generated outline with ${Math.max(2, Math.min(4, Number(levels) || 3))} heading levels`);
  }, [buildHeadingPlanFromText, computeDocumentOutline, selectedEditorText]);

  // Dynamically appended sections from the AI Chat
  const [appendedSections, setAppendedSections] = useState([]);
  const historyMuteRef = useRef(false);
  const historyPastRef = useRef([]);
  const historyFutureRef = useRef([]);
  const lastSnapshotHashRef = useRef('');
  const replayTimerRef = useRef(null);

  const syncReplayTimeline = () => {
    setReplayTimeline([...historyPastRef.current]);
  };

  const formatReplayDuration = (durationMs) => {
    const safeDuration = Math.max(0, Math.floor(durationMs || 0));
    const totalSeconds = Math.floor(safeDuration / 1000);
    const hours = Math.floor(totalSeconds / 3600);
    const minutes = Math.floor((totalSeconds % 3600) / 60);
    const seconds = totalSeconds % 60;

    if (hours > 0) {
      return `${hours}:${String(minutes).padStart(2, '0')}:${String(seconds).padStart(2, '0')}`;
    }

    return `${minutes}:${String(seconds).padStart(2, '0')}`;
  };

  const formatRelativeSavedLabel = (savedAt) => {
    if (!savedAt) {
      return 'Not saved yet';
    }

    const diffMs = Math.max(0, relativeNow - savedAt);
    const minutes = Math.floor(diffMs / 60000);
    if (minutes < 1) {
      return 'Saved just now';
    }
    if (minutes < 60) {
      return `Saved ${minutes} minute${minutes === 1 ? '' : 's'} ago`;
    }
    const hours = Math.floor(minutes / 60);
    if (hours < 24) {
      return `Saved ${hours} hour${hours === 1 ? '' : 's'} ago`;
    }
    const days = Math.floor(hours / 24);
    return `Saved ${days} day${days === 1 ? '' : 's'} ago`;
  };

  const resolveFontFamily = (fontName) => FONT_FAMILY_MAP[fontName] || `${fontName}, Inter, system-ui, -apple-system, 'Segoe UI', Roboto, sans-serif`;

  const encodeReplayPayload = (payload) => {
    try {
      return btoa(unescape(encodeURIComponent(JSON.stringify(payload))));
    } catch (_error) {
      return '';
    }
  };

  const decodeReplayPayload = (encodedPayload) => {
    try {
      const decoded = decodeURIComponent(escape(atob(encodedPayload)));
      return JSON.parse(decoded);
    } catch (_error) {
      return null;
    }
  };

  useEffect(() => {
    // Ensure document outline rail starts closed on first load.
    setLeftSidebarOpen(false);
  }, []);

  useEffect(() => {
    voiceTargetRef.current = voiceTarget;
  }, [voiceTarget]);

  useEffect(() => {
    if (replayLoadedFromUrlRef.current) {
      return;
    }

    const query = new URLSearchParams(window.location.search);
    const replayParam = query.get('replay');
    if (!replayParam) {
      return;
    }

    const parsed = decodeReplayPayload(replayParam);
    const importedTimeline = Array.isArray(parsed?.timeline)
      ? parsed.timeline.filter((entry) => entry && entry.snapshot && typeof entry.timestamp === 'number')
      : [];

    if (!importedTimeline.length) {
      return;
    }

    replayLoadedFromUrlRef.current = true;

    const sharedMode = ['compose', 'deck', 'sheets'].includes(String(parsed?.productMode || ''))
      ? String(parsed.productMode)
      : null;
    if (sharedMode) {
      setProductMode(sharedMode);
    }

    if (parsed?.activeDocView && ['document', 'deck', 'sheet'].includes(parsed.activeDocView)) {
      setActiveDocView(parsed.activeDocView);
    }

    if (parsed?.activeDocId) {
      const sharedDoc = documents.find((doc) => doc.id === parsed.activeDocId);
      if (sharedDoc) {
        switchDocument(sharedDoc.id);
      }
    }

    historyPastRef.current = importedTimeline.slice(-80);
    historyFutureRef.current = [];
    setReplayTimeline([...historyPastRef.current]);
    const startIndex = Math.max(0, Math.min(Number(parsed?.startIndex ?? historyPastRef.current.length - 1), historyPastRef.current.length - 1));
    setReplayIndex(startIndex);
    setReplayPanelOpen(true);
    setIsReplayPlaying(false);
    applySnapshot(historyPastRef.current[startIndex].snapshot);
    showToast('Shared replay loaded');
  }, [documents]);

  useEffect(() => {
    setIsTopDraftTitleExpanded(false);
  }, [activeDocId]);

  useEffect(() => {
    isMicMutedRef.current = isMicMuted;
  }, [isMicMuted]);

  useEffect(() => {
    isVoiceActiveRef.current = isVoiceActive;
  }, [isVoiceActive]);

  useEffect(() => {
    if (isPromptDismissed) {
      if (promptRevealTimerRef.current) {
        clearTimeout(promptRevealTimerRef.current);
        promptRevealTimerRef.current = null;
      }
      setIsPromptAutoVisible(false);
      return;
    }

    if (hasVoiceInteraction) {
      setIsPromptAutoVisible(true);
      if (promptRevealTimerRef.current) {
        clearTimeout(promptRevealTimerRef.current);
        promptRevealTimerRef.current = null;
      }
      return;
    }

    if (promptRevealTimerRef.current) {
      clearTimeout(promptRevealTimerRef.current);
    }
    promptRevealTimerRef.current = setTimeout(() => {
      setIsPromptAutoVisible(true);
      promptRevealTimerRef.current = null;
    }, 7000);

    return () => {
      if (promptRevealTimerRef.current) {
        clearTimeout(promptRevealTimerRef.current);
        promptRevealTimerRef.current = null;
      }
    };
  }, [hasVoiceInteraction, isPromptDismissed]);

  useEffect(() => {
    const onPointerDown = (event) => {
      if (replaySpeedMenuRef.current && !replaySpeedMenuRef.current.contains(event.target)) {
        setReplaySpeedMenuOpen(false);
      }
      if (notificationsPanelRef.current && !notificationsPanelRef.current.contains(event.target)) {
        setNotificationsOpen(false);
      }
      if (
        isPromptExpanded
        && isPromptAutoVisible
        && !isPromptDismissed
        && promptRootRef.current
        && !promptRootRef.current.contains(event.target)
      ) {
        setIsPromptExpanded(false);
        setIsPromptMinimized(true);
        setIsPromptDismissed(true);
        setIsPromptAutoVisible(false);
      }
    };

    document.addEventListener('pointerdown', onPointerDown);
    return () => document.removeEventListener('pointerdown', onPointerDown);
  }, [isPromptExpanded, isPromptAutoVisible, isPromptDismissed]);

  useEffect(() => {
    if (!activeDocId && documents.length) {
      setActiveDocId(documents[0].id);
    }
  }, [documents, activeDocId]);

  useEffect(() => {
    try {
      const storedCapture = localStorage.getItem('rc.memoryCapture');
      const storedRetention = localStorage.getItem('rc.memoryRetentionDays');
      const storedEntries = localStorage.getItem('rc.memoryEntries');
      const storedPromptHistory = localStorage.getItem('rc.promptHistory');
      const storedPromptTone = localStorage.getItem('rc.promptTone');
      const storedPromptLengthMode = localStorage.getItem('rc.promptLengthMode');
      const storedPromptLengthValue = localStorage.getItem('rc.promptLengthValue');
      const storedEditorPrefs = localStorage.getItem('rc.editorPrefs');
      const storedDarkMode = localStorage.getItem('rc.darkMode');
      if (storedCapture === 'true' || storedCapture === 'false') {
        setMemoryCaptureEnabled(storedCapture === 'true');
      }
      if (storedDarkMode === 'true' || storedDarkMode === 'false') {
        setIsDarkMode(storedDarkMode === 'true');
      }
      if (storedRetention) {
        const parsedRetention = Number(storedRetention);
        if (!Number.isNaN(parsedRetention) && parsedRetention >= 1 && parsedRetention <= 3650) {
          setMemoryRetentionDays(parsedRetention);
        }
      }
      if (storedEntries) {
        const parsedEntries = JSON.parse(storedEntries);
        if (Array.isArray(parsedEntries)) {
          setMemoryEntries(parsedEntries.slice(0, 300));
        }
      }
      if (storedPromptHistory) {
        const parsedPromptHistory = JSON.parse(storedPromptHistory);
        if (Array.isArray(parsedPromptHistory)) {
          setPromptHistory(parsedPromptHistory.slice(0, 120));
        }
      }
      if (storedPromptTone && ['formal', 'normal', 'geeky', 'naive', 'concise'].includes(storedPromptTone)) {
        setPromptTone(storedPromptTone);
      }
      if (storedPromptLengthMode && ['words', 'characters'].includes(storedPromptLengthMode)) {
        setPromptLengthMode(storedPromptLengthMode);
      }
      if (storedPromptLengthValue) {
        const parsedLength = Number(storedPromptLengthValue);
        if (!Number.isNaN(parsedLength) && parsedLength >= 40 && parsedLength <= 3000) {
          setPromptLengthValue(parsedLength);
        }
      }
      if (storedEditorPrefs) {
        const parsedPrefs = JSON.parse(storedEditorPrefs);
        if (parsedPrefs && typeof parsedPrefs === 'object') {
          if (typeof parsedPrefs.editorHeading === 'string' && headingOptions.includes(parsedPrefs.editorHeading)) {
            setEditorHeading(parsedPrefs.editorHeading);
          }
          if (typeof parsedPrefs.editorFont === 'string' && parsedPrefs.editorFont.trim()) {
            setEditorFont(parsedPrefs.editorFont);
          }
          const parsedSize = Number(parsedPrefs.editorSize);
          if (!Number.isNaN(parsedSize) && parsedSize >= 10 && parsedSize <= 72) {
            setEditorSize(parsedSize);
          }
          if (typeof parsedPrefs.alignMode === 'string' && ['left', 'center', 'right'].includes(parsedPrefs.alignMode)) {
            setAlignMode(parsedPrefs.alignMode);
          }
          setIsBoldActive(Boolean(parsedPrefs.isBoldActive));
          setIsItalicActive(Boolean(parsedPrefs.isItalicActive));
          setIsUnderlineActive(Boolean(parsedPrefs.isUnderlineActive));
          setIsStrikeActive(Boolean(parsedPrefs.isStrikeActive));
          setIsListActive(Boolean(parsedPrefs.isListActive));
          setShowPageNumbers(parsedPrefs.showPageNumbers !== false);
          setShowPageNumberOnFirstPage(parsedPrefs.showPageNumberOnFirstPage !== false);
          if (typeof parsedPrefs.pageNumberPosition === 'string' && ['left', 'center', 'right'].includes(parsedPrefs.pageNumberPosition)) {
            setPageNumberPosition(parsedPrefs.pageNumberPosition);
          }
          if (typeof parsedPrefs.currentLanguage === 'string' && parsedPrefs.currentLanguage.trim()) {
            setCurrentLanguage(parsedPrefs.currentLanguage);
          }
          const parsedZoom = Number(parsedPrefs.zoomLevel);
          if (!Number.isNaN(parsedZoom) && parsedZoom >= 50 && parsedZoom <= 200) {
            setZoomLevel(parsedZoom);
          }
        }
      }
    } catch (_error) {
      // noop
    }
  }, []);

  useEffect(() => {
    localStorage.setItem('rc.darkMode', String(isDarkMode));
  }, [isDarkMode]);

  useEffect(() => {
    const interval = window.setInterval(() => {
      setRelativeNow(Date.now());
    }, 60000);
    return () => window.clearInterval(interval);
  }, []);

  useEffect(() => {
    setRelativeNow(Date.now());
  }, [lastSavedAt]);

  useEffect(() => {
    if (!activeDocId) {
      setLastSavedAt(null);
      return;
    }

    try {
      const raw = localStorage.getItem(`rc.savedDoc.${activeDocId}`);
      if (!raw) {
        setLastSavedAt(null);
        return;
      }

      const parsed = JSON.parse(raw);
      const savedAt = Number(parsed?.savedAt);
      setLastSavedAt(Number.isFinite(savedAt) ? savedAt : null);
    } catch (_error) {
      setLastSavedAt(null);
    }
  }, [activeDocId]);

  useEffect(() => {
    localStorage.setItem('rc.memoryCapture', String(memoryCaptureEnabled));
  }, [memoryCaptureEnabled]);

  useEffect(() => {
    localStorage.setItem('rc.memoryRetentionDays', String(memoryRetentionDays));
  }, [memoryRetentionDays]);

  useEffect(() => {
    localStorage.setItem('rc.memoryEntries', JSON.stringify(memoryEntries.slice(0, 300)));
  }, [memoryEntries]);

  useEffect(() => {
    localStorage.setItem('rc.promptHistory', JSON.stringify(promptHistory.slice(0, 120)));
  }, [promptHistory]);

  useEffect(() => {
    localStorage.setItem('rc.promptTone', promptTone);
  }, [promptTone]);

  useEffect(() => {
    localStorage.setItem('rc.promptLengthMode', promptLengthMode);
  }, [promptLengthMode]);

  useEffect(() => {
    localStorage.setItem('rc.promptLengthValue', String(promptLengthValue));
  }, [promptLengthValue]);

  useEffect(() => {
    localStorage.setItem('rc.editorPrefs', JSON.stringify({
      editorHeading,
      editorFont,
      editorSize,
      alignMode,
      isBoldActive,
      isItalicActive,
      isUnderlineActive,
      isStrikeActive,
      isListActive,
      showPageNumbers,
      showPageNumberOnFirstPage,
      pageNumberPosition,
      currentLanguage,
      zoomLevel,
    }));
  }, [
    editorHeading,
    editorFont,
    editorSize,
    alignMode,
    isBoldActive,
    isItalicActive,
    isUnderlineActive,
    isStrikeActive,
    isListActive,
    showPageNumbers,
    showPageNumberOnFirstPage,
    pageNumberPosition,
    currentLanguage,
    zoomLevel,
  ]);

  const buildSnapshot = () => ({
    docTitle,
    docSubtitle,
    initiatives,
    appendedSections,
    docBodyHtml,
    isBlankDocument,
  });

  const applySnapshot = (snapshot) => {
    if (!snapshot) {
      return;
    }

    historyMuteRef.current = true;
    setDocTitle(snapshot.docTitle || '');
    setDocSubtitle(snapshot.docSubtitle || '');
    setInitiatives(Array.isArray(snapshot.initiatives) ? snapshot.initiatives : []);
    setAppendedSections(Array.isArray(snapshot.appendedSections) ? snapshot.appendedSections : []);
    setDocBodyHtml(snapshot.docBodyHtml || '');
    setIsBlankDocument(Boolean(snapshot.isBlankDocument));

    setTimeout(() => {
      historyMuteRef.current = false;
    }, 0);
  };

  useEffect(() => {
    if (historyMuteRef.current) {
      return;
    }

    const snapshot = buildSnapshot();
    const nextHash = JSON.stringify(snapshot);
    if (nextHash === lastSnapshotHashRef.current) {
      return;
    }

    lastSnapshotHashRef.current = nextHash;
    const record = {
      snapshot,
      timestamp: Date.now(),
    };
    historyPastRef.current = [...historyPastRef.current.slice(-79), record];
    historyFutureRef.current = [];
    syncReplayTimeline();
    if (replayIndex === null) {
      setReplayIndex(historyPastRef.current.length - 1);
    }
  }, [docTitle, docSubtitle, initiatives, appendedSections, docBodyHtml, isBlankDocument]);

  useEffect(() => {
    if (!isReplayPlaying || replayIndex === null || !replayTimeline.length) {
      return undefined;
    }

    replayTimerRef.current = setTimeout(() => {
      setReplayIndex((currentIndex) => {
        if (currentIndex === null) {
          return currentIndex;
        }

        const nextIndex = currentIndex + replayDirection;
        if (nextIndex < 0 || nextIndex >= replayTimeline.length) {
          setIsReplayPlaying(false);
          return currentIndex;
        }

        const nextEntry = replayTimeline[nextIndex];
        if (nextEntry?.snapshot) {
          applySnapshot(nextEntry.snapshot);
        }

        return nextIndex;
      });
    }, Math.max(160, Math.round(650 / Math.max(0.25, replaySpeed))));

    return () => {
      if (replayTimerRef.current) {
        clearTimeout(replayTimerRef.current);
        replayTimerRef.current = null;
      }
    };
  }, [isReplayPlaying, replayIndex, replayTimeline, replayDirection, replaySpeed]);

  const saveDocumentLocally = ({ silent = false, trackAction = true } = {}) => {
    if (!activeDocId) {
      return;
    }

    const payload = getDocumentPayload(activeDocId);
    const savedAt = Date.now();
    localStorage.setItem(`rc.savedDoc.${activeDocId}`, JSON.stringify({
      ...payload,
      savedAt,
    }));
    setLastSavedAt(savedAt);
    if (trackAction) {
      trackMemoryAction('document', 'Saved document locally', {
        documentId: String(activeDocId),
      });
    }
    if (!silent) {
      showToast('Document saved locally');
    }
  };

  useEffect(() => {
    if (!activeDocId || !docTitle.trim()) {
      return undefined;
    }

    const timer = window.setTimeout(() => {
      saveDocumentLocally({ silent: true, trackAction: false });
    }, 1200);

    return () => window.clearTimeout(timer);
  }, [activeDocId, docTitle, docSubtitle, initiatives, appendedSections, docBodyHtml, isBlankDocument]);

  const undoDocumentChange = () => {
    if (historyPastRef.current.length < 2) {
      showToast('Nothing to undo');
      return;
    }

    const current = historyPastRef.current[historyPastRef.current.length - 1];
    const previous = historyPastRef.current[historyPastRef.current.length - 2];
    historyPastRef.current = historyPastRef.current.slice(0, -1);
    historyFutureRef.current = [current, ...historyFutureRef.current].slice(0, 80);
    syncReplayTimeline();
    setReplayIndex(historyPastRef.current.length - 1);
    applySnapshot(previous.snapshot);
    trackMemoryAction('document', 'Undo document change');
    showToast('Undid last change');
  };

  const redoDocumentChange = () => {
    if (!historyFutureRef.current.length) {
      showToast('Nothing to redo');
      return;
    }

    const next = historyFutureRef.current[0];
    historyFutureRef.current = historyFutureRef.current.slice(1);
    historyPastRef.current = [...historyPastRef.current, next].slice(-80);
    syncReplayTimeline();
    setReplayIndex(historyPastRef.current.length - 1);
    applySnapshot(next.snapshot);
    trackMemoryAction('document', 'Redo document change');
    showToast('Redid change');
  };

  const openReplayPanel = () => {
    syncReplayTimeline();
    setReplayIndex(Math.max(0, historyPastRef.current.length - 1));
    setReplayPanelOpen(true);
    setIsReplayPlaying(false);
  };

  const applyReplayIndex = (nextIndex) => {
    if (!replayTimeline.length) {
      showToast('No edit history yet');
      return;
    }

    const clampedIndex = Math.max(0, Math.min(nextIndex, replayTimeline.length - 1));
    const entry = replayTimeline[clampedIndex];
    setIsReplayPlaying(false);
    setReplayIndex(clampedIndex);
    if (entry?.snapshot) {
      applySnapshot(entry.snapshot);
    }
  };

  const startReplayPlayback = (direction) => {
    if (!replayTimeline.length) {
      showToast('No edit history yet');
      return;
    }

    setReplayDirection(direction);
    setReplayPanelOpen(true);
    setIsReplayPlaying(true);
    if (replayIndex === null) {
      const startIndex = direction < 0 ? replayTimeline.length - 1 : 0;
      setReplayIndex(startIndex);
      const entry = replayTimeline[startIndex];
      if (entry?.snapshot) {
        applySnapshot(entry.snapshot);
      }
    }
  };

  const getSmartReplayDirection = () => {
    if (!replayTimeline.length) {
      return -1;
    }
    const current = Math.max(0, Math.min(replayIndex ?? replayTimeline.length - 1, replayTimeline.length - 1));
    const last = replayTimeline.length - 1;
    const distanceToStart = current;
    const distanceToEnd = Math.max(0, last - current);
    return distanceToEnd <= distanceToStart ? -1 : 1;
  };

  const toggleSmartReplayPlayback = () => {
    const direction = getSmartReplayDirection();
    if (isReplayPlaying && replayDirection === direction) {
      setIsReplayPlaying(false);
      return;
    }

    startReplayPlayback(direction);
  };

  const shareReplayTimeline = async () => {
    if (!replayTimeline.length) {
      showToast('No replay history to share yet');
      return;
    }

    const payload = {
      version: 1,
      productMode,
      activeDocId,
      activeDocView,
      startIndex: Math.max(0, replayIndex ?? replayTimeline.length - 1),
      timeline: replayTimeline,
    };

    const encoded = encodeReplayPayload(payload);
    if (!encoded) {
      showToast('Could not prepare replay link');
      return;
    }

    const shareUrl = new URL(window.location.href);
    shareUrl.searchParams.set('replay', encoded);

    setReplaySharing(true);
    try {
      await navigator.clipboard.writeText(shareUrl.toString());
      showToast('Replay link copied');
    } catch (_error) {
      window.prompt('Copy replay link', shareUrl.toString());
    } finally {
      setReplaySharing(false);
    }
  };

  useEffect(() => {
    const onKeyDown = (event) => {
      const activeElement = document.activeElement;
      const insideEditor = Boolean(activeElement && documentCardRef.current?.contains(activeElement));

      if (!(event.ctrlKey || event.metaKey) && wholeDocSelectionRef.current && insideEditor && (event.key === 'Backspace' || event.key === 'Delete')) {
        event.preventDefault();
        clearEntireCompositionText();
        wholeDocSelectionRef.current = false;
        return;
      }

      if (!(event.ctrlKey || event.metaKey)) {
        return;
      }

      const key = event.key.toLowerCase();
      if (key === 's') {
        event.preventDefault();
        saveDocumentLocally();
        return;
      }

      if (key === 'a') {
        if (insideEditor) {
          event.preventDefault();
          selectEntireComposition();
        }
        return;
      }

      if (key === 'z' && !event.shiftKey) {
        event.preventDefault();
        undoDocumentChange();
        return;
      }

      if (key === 'y' || (key === 'z' && event.shiftKey)) {
        event.preventDefault();
        redoDocumentChange();
      }
    };

    window.addEventListener('keydown', onKeyDown);
    return () => window.removeEventListener('keydown', onKeyDown);
  }, [activeDocId, docTitle, docSubtitle, initiatives, appendedSections, docBodyHtml, isBlankDocument]);

  useEffect(() => {
    const handlePaste = (event) => {
      if (!wholeDocSelectionRef.current) {
        return;
      }

      const target = event.target;
      if (!documentCardRef.current || !documentCardRef.current.contains(target)) {
        return;
      }

      event.preventDefault();
      const pasted = event.clipboardData?.getData('text/plain') || '';
      replaceEntireCompositionText(pasted);
      wholeDocSelectionRef.current = false;
    };

    window.addEventListener('paste', handlePaste, true);
    return () => window.removeEventListener('paste', handlePaste, true);
  }, []);

  useEffect(() => {
    if (!docSearchAutoPlay || docSearchMatchCount <= 1) {
      if (docSearchAutoPlayTimerRef.current) {
        clearInterval(docSearchAutoPlayTimerRef.current);
        docSearchAutoPlayTimerRef.current = null;
      }
      return;
    }

    docSearchAutoPlayTimerRef.current = setInterval(() => {
      setDocSearchActiveIndex((prev) => {
        const next = (prev + 1) % Math.max(1, docSearchMatchCount);
        focusSearchMatchAtIndex(next);
        return next;
      });
    }, 1400);

    return () => {
      if (docSearchAutoPlayTimerRef.current) {
        clearInterval(docSearchAutoPlayTimerRef.current);
        docSearchAutoPlayTimerRef.current = null;
      }
    };
  }, [docSearchAutoPlay, docSearchMatchCount, focusSearchMatchAtIndex]);

  useEffect(() => () => {
    if (docSearchAutoPlayTimerRef.current) {
      clearInterval(docSearchAutoPlayTimerRef.current);
      docSearchAutoPlayTimerRef.current = null;
    }
    clearDocumentSearchHighlights();
  }, [clearDocumentSearchHighlights]);

  useEffect(() => {
    if (docSearchPanelOpen) {
      return;
    }
    setDocSearchAutoPlay(false);
    clearDocumentSearchHighlights();
  }, [docSearchPanelOpen, clearDocumentSearchHighlights]);

  useEffect(() => {
    if (!openDropdown) {
      if (formattingDropdownCloseTimerRef.current) {
        clearTimeout(formattingDropdownCloseTimerRef.current);
      }
      return;
    }

    if (isFormattingDropdownHovered) {
      if (formattingDropdownCloseTimerRef.current) {
        clearTimeout(formattingDropdownCloseTimerRef.current);
      }
      return;
    }

    formattingDropdownCloseTimerRef.current = setTimeout(() => {
      setOpenDropdown(null);
    }, 2000);

    return () => {
      if (formattingDropdownCloseTimerRef.current) {
        clearTimeout(formattingDropdownCloseTimerRef.current);
      }
    };
  }, [openDropdown, isFormattingDropdownHovered]);

  useEffect(() => {
    if (!textStyleMenuOpen) {
      if (textStyleMenuCloseTimerRef.current) {
        clearTimeout(textStyleMenuCloseTimerRef.current);
      }
      return;
    }

    if (isTextStyleMenuHovered) {
      if (textStyleMenuCloseTimerRef.current) {
        clearTimeout(textStyleMenuCloseTimerRef.current);
      }
      return;
    }

    textStyleMenuCloseTimerRef.current = setTimeout(() => {
      setTextStyleMenuOpen(false);
    }, 2000);

    return () => {
      if (textStyleMenuCloseTimerRef.current) {
        clearTimeout(textStyleMenuCloseTimerRef.current);
      }
    };
  }, [textStyleMenuOpen, isTextStyleMenuHovered]);

  useEffect(() => {
    const now = Date.now();
    const maxAge = memoryRetentionDays * 24 * 60 * 60 * 1000;
    setMemoryEntries((prev) => prev.filter((entry) => now - entry.timestamp <= maxAge));
  }, [memoryRetentionDays]);

  useEffect(() => {
    if (!activeDocId) {
      return;
    }

    setDocuments((prev) =>
      prev.map((doc) =>
        doc.id === activeDocId
          ? {
              ...doc,
              title: docTitle,
              subtitle: docSubtitle,
              initiatives,
              appendedSections,
              isBlank: isBlankDocument,
              bodyHtml: docBodyHtml,
            }
          : doc,
      ),
    );
  }, [activeDocId, appendedSections, docSubtitle, docTitle, initiatives, isBlankDocument, docBodyHtml]);

  useEffect(() => {
    if (!documentCardRef.current || typeof ResizeObserver === 'undefined') {
      return;
    }

    const observer = new ResizeObserver((entries) => {
      for (const entry of entries) {
        const width = Math.max(320, Math.floor(entry.contentRect.width * 0.9));
        setPromptWidth(width);
      }
    });

    observer.observe(documentCardRef.current);
    return () => observer.disconnect();
  }, []);

  useEffect(() => {
    if (!documentCardRef.current) {
      return;
    }

    const handleDocumentInput = () => {
      if (activeDocView !== 'document') {
        setActiveDocView('document');
      }
      if (deckSlidesPanelOpen) {
        setDeckSlidesPanelOpen(false);
      }
    };

    documentCardRef.current.addEventListener('input', handleDocumentInput, true);
    return () => {
      documentCardRef.current?.removeEventListener('input', handleDocumentInput, true);
    };
  }, [activeDocView, deckSlidesPanelOpen]);

  useEffect(() => {
    computeDocumentStats();
    computeDocumentOutline();
    if (!documentCardRef.current || typeof MutationObserver === 'undefined') {
      return;
    }

    const observer = new MutationObserver(() => {
      computeDocumentStats();
      computeDocumentOutline();
    });

    observer.observe(documentCardRef.current, {
      childList: true,
      subtree: true,
      characterData: true,
    });

    return () => observer.disconnect();
  }, [
    computeDocumentStats,
    computeDocumentOutline,
    activeDocId,
    isBlankDocument,
    docBodyHtml,
    docTitle,
    docSubtitle,
    initiatives,
    appendedSections,
  ]);

  useEffect(() => {
    if (!shareTargetDocId) {
      return;
    }

    const base = `${window.location.origin}${window.location.pathname}`;
    setShareLink(`${base}?doc=${shareTargetDocId}&access=${shareAccess.toLowerCase()}`);
  }, [shareAccess, shareTargetDocId]);

  useEffect(() => {
    const handleClickOutside = (event) => {
      const clickedOutsideFormatting = formattingMenuRef.current && !formattingMenuRef.current.contains(event.target);
      const clickedOutsideCalendar = calendarMenuRef.current && !calendarMenuRef.current.contains(event.target);
      const clickedOutsideScheduleRepeat = scheduleRepeatMenuRef.current && !scheduleRepeatMenuRef.current.contains(event.target);

      if (clickedOutsideFormatting && clickedOutsideCalendar) {
        setOpenDropdown(null);
        setTextStyleMenuOpen(false);
      }
      if (clickedOutsideScheduleRepeat && openDropdown === 'schedule-repeat') {
        setOpenDropdown(null);
      }
      if (!event.target.closest('[data-doc-menu-root]')) {
        setOpenDocMenuId(null);
      }
      if (promptMenuRef.current && !promptMenuRef.current.contains(event.target)) {
        setIsPromptMenuOpen(false);
      }
      if (promptTuneRef.current && !promptTuneRef.current.contains(event.target)) {
        setPromptTuneMenuOpen(false);
      }
      if (promptFormatRef.current && !promptFormatRef.current.contains(event.target)) {
        setPromptFormatMenuOpen(false);
      }
      if (promptLibraryRef.current && !promptLibraryRef.current.contains(event.target)) {
        setPromptLibraryOpen(false);
      }
      if (promptHistoryFilterRef.current && !promptHistoryFilterRef.current.contains(event.target)) {
        setPromptHistoryFilterMenuOpen(false);
      }
      if (docSearchPanelRef.current && !docSearchPanelRef.current.contains(event.target)) {
        setDocSearchPanelOpen(false);
      }
      if (!event.target.closest('[data-workspace-menu-root]')) {
        setOpenWorkspaceMenuId(null);
      }
      if (!event.target.closest('[data-language-menu-root]')) {
        setLanguageMenuOpen(false);
      }
      if (sheetToolbarMenuRef.current && !sheetToolbarMenuRef.current.contains(event.target)) {
        setSheetToolbarMenuOpen(null);
      }
      if (deckToolbarMenuRef.current && !deckToolbarMenuRef.current.contains(event.target)) {
        setDeckToolbarMenuOpen(false);
      }
      if (selectionActionMenuRef.current && !selectionActionMenuRef.current.contains(event.target)) {
        setSelectionActionMenu((prev) => ({ ...prev, open: false }));
      }
      if (schedulePeopleMenuRef.current && !schedulePeopleMenuRef.current.contains(event.target)) {
        setIsSchedulePeopleMenuOpen(false);
      }
      if (quickAddSourceMenuRef.current && !quickAddSourceMenuRef.current.contains(event.target)) {
        setIsQuickAddSourceMenuOpen(false);
      }
    };

    window.addEventListener('pointerdown', handleClickOutside);
    return () => window.removeEventListener('pointerdown', handleClickOutside);
  }, [openDropdown]);

  const handleQuickAddSourceAction = async (sourceId) => {
    setIsQuickAddSourceMenuOpen(false);

    if (sourceId === 'note') {
      const noteText = window.prompt('Add a quick note');
      const normalized = String(noteText || '').trim();
      if (!normalized) {
        return;
      }
      setScheduleInput((prev) => `${prev}${prev ? '\n' : ''}Note: ${normalized}`);
      showToast('Note added to quick add context');
      return;
    }

    if (sourceId === 'link') {
      const linkText = window.prompt('Paste a link');
      const normalized = String(linkText || '').trim();
      if (!normalized) {
        return;
      }
      setScheduleInput((prev) => `${prev}${prev ? '\n' : ''}Link: ${normalized}`);
      showToast('Link added to quick add context');
      return;
    }

    const source = QUICK_ADD_SOURCE_OPTIONS.find((item) => item.id === sourceId);
    if (!source || !scheduleFileInputRef.current) {
      return;
    }

    scheduleFileInputRef.current.accept = source.accept || '*/*';
    scheduleFileInputRef.current.click();
  };

  const isRangeInsideEditor = (range) => {
    if (!range || !documentCardRef.current) {
      return false;
    }

    const ancestor = range.commonAncestorContainer;
    const targetNode = ancestor.nodeType === Node.TEXT_NODE ? ancestor.parentNode : ancestor;
    return !!targetNode && documentCardRef.current.contains(targetNode);
  };

  const getEditorSelectionRange = () => {
    const selection = window.getSelection();
    if (!selection || !selection.rangeCount) {
      return null;
    }

    const range = selection.getRangeAt(0);
    return isRangeInsideEditor(range) ? range : null;
  };

  const toOutlineHtml = (value) => {
    const normalized = String(value || '').replace(/\r/g, '').trim();
    if (!normalized) {
      return toParagraphHtml(value);
    }

    let lines = normalized
      .split(/\n+/)
      .map((line) => line.trim())
      .filter(Boolean);

    if (lines.length <= 2) {
      lines = normalized
        .split(/(?<=[.!?])\s+(?=[A-Z])/)
        .map((line) => line.trim())
        .filter(Boolean);
    }

    if (!lines.length) {
      return toParagraphHtml(value);
    }

    const html = [];
    let listOpen = false;
    const closeList = () => {
      if (listOpen) {
        html.push('</ul>');
        listOpen = false;
      }
    };

    lines.forEach((line, index) => {
      const bulletMatch = line.match(/^(?:[-*?兡|\d+[.)])\s+(.+)$/);
      if (bulletMatch) {
        if (!listOpen) {
          html.push('<ul style="margin:0 0 10px 18px;padding:0;list-style:disc;color:#334155;line-height:1.7;">');
          listOpen = true;
        }
        html.push(`<li style="margin-bottom:6px;">${escapeHtml(bulletMatch[1])}</li>`);
        return;
      }

      const headingMatch = line.match(/^(?:[IVXLC]+[.)]\s+|\d+[.)]\s+)?(.+?)(?::)?$/i);
      const headingText = headingMatch ? headingMatch[1].trim() : line;
      const compactHeading = headingText.split(/\s+/).slice(0, 7).join(' ').replace(/[,:;]+$/, '').trim();
      const isVeryLongSentence = headingText.split(/\s+/).length > 12;
      const shouldRenderHeading = index === 0 || /:\s*$/.test(line) || /^[A-Z][\w\s&'/-]{8,}$/.test(headingText);

      closeList();

      if (shouldRenderHeading) {
        html.push(`<h3 style="font-size:22px;line-height:1.35;font-weight:700;color:#0f172a;margin:16px 0 8px;">${escapeHtml(compactHeading || `Section ${index + 1}`)}</h3>`);
        if (isVeryLongSentence) {
          html.push(`<p style="font-size:16px;color:#334155;line-height:1.75;margin:0 0 10px;">${escapeHtml(line)}</p>`);
        }
      } else {
        html.push(`<p style="font-size:16px;color:#334155;line-height:1.75;margin:0 0 10px;">${escapeHtml(line)}</p>`);
      }
    });

    closeList();
    return html.join('');
  };

  const updateSelectionActionMenuPosition = (range) => {
    if (!range || !documentCardRef.current) {
      setSelectionActionMenu({ open: false, left: 0, top: 0 });
      return;
    }

    const selectedText = range.toString().trim();
    if (!selectedText) {
      setSelectionActionMenu({ open: false, left: 0, top: 0 });
      return;
    }

    const rangeRect = range.getBoundingClientRect();
    const menuWidth = 344;
    const estimatedMenuHeight = Math.max(420, Math.floor(window.innerHeight * 0.72));
    const horizontalPadding = 16;
    const verticalGap = 22;
    const centeredLeft = rangeRect.left + (rangeRect.width / 2) - (menuWidth / 2);
    const maxLeft = Math.max(horizontalPadding, window.innerWidth - menuWidth - horizontalPadding);
    const preferredBelow = rangeRect.bottom + verticalGap;
    const maxTop = Math.max(12, window.innerHeight - estimatedMenuHeight - 12);
    const rawTop = Math.min(Math.max(12, preferredBelow), maxTop);

    setSelectionActionMenu({
      open: true,
      left: Math.min(maxLeft, Math.max(horizontalPadding, centeredLeft)),
      top: rawTop,
    });
  };

  const syncEditorSelection = () => {
    const range = getEditorSelectionRange();
    if (!range) {
      if (selectionActionMenuRef.current && selectionActionMenuRef.current.contains(document.activeElement)) {
        return true;
      }
      setSelectionActionMenu({ open: false, left: 0, top: 0 });
      return false;
    }

    savedSelectionRef.current = range.cloneRange();
    const selectedText = range.toString().trim();
    const next = truncateText(selectedText, 180);
    setSelectedEditorText(next);
    selectedEditorTextRef.current = selectedText;
    wholeDocSelectionRef.current = isWholeDocumentSelection(range);
    if (selectedText) {
      updateSelectionActionMenuPosition(range);
    } else {
      setSelectionActionMenu({ open: false, left: 0, top: 0 });
    }

    try {
      setIsBoldActive(Boolean(document.queryCommandState('bold')));
      setIsItalicActive(Boolean(document.queryCommandState('italic')));
      setIsUnderlineActive(Boolean(document.queryCommandState('underline')));
      setIsStrikeActive(Boolean(document.queryCommandState('strikeThrough')));
      setIsListActive(Boolean(document.queryCommandState('insertUnorderedList')));
    } catch (_error) {
      // noop
    }

    return true;
  };

  const restoreSavedSelection = () => {
    if (!savedSelectionRef.current) {
      return false;
    }

    const selection = window.getSelection();
    if (!selection) {
      return false;
    }

    selection.removeAllRanges();
    selection.addRange(savedSelectionRef.current);
    return true;
  };

  const injectIntoSavedSelection = (text, options = {}) => {
    const nextText = String(text || '').trim();
    if (!nextText) {
      return false;
    }

    const injectAsHtml = Boolean(options.injectAsHtml);

    const restored = restoreSavedSelection();
    if (!restored) {
      return false;
    }

    const selection = window.getSelection();
    if (!selection || !selection.rangeCount) {
      return false;
    }

    const range = selection.getRangeAt(0);
    if (!isRangeInsideEditor(range)) {
      return false;
    }

    range.deleteContents();
    if (injectAsHtml) {
      const template = document.createElement('template');
      template.innerHTML = nextText;
      const fragment = template.content.cloneNode(true);
      const lastNode = fragment.lastChild;
      range.insertNode(fragment);
      if (lastNode) {
        range.setStartAfter(lastNode);
      }
    } else {
      range.insertNode(document.createTextNode(nextText));
    }
    range.collapse(false);
    selection.removeAllRanges();
    selection.addRange(range);
    return true;
  };

  const selectEntireComposition = () => {
    if (!documentCardRef.current) {
      return;
    }

    const selection = window.getSelection();
    if (!selection) {
      return;
    }

    const range = document.createRange();
    range.selectNodeContents(documentCardRef.current);
    selection.removeAllRanges();
    selection.addRange(range);
    savedSelectionRef.current = range.cloneRange();
    wholeDocSelectionRef.current = true;
  };

  const isWholeDocumentSelection = (range) => {
    if (!range || !documentCardRef.current) {
      return false;
    }
    const selected = range.toString().replace(/\s+/g, ' ').trim();
    const allText = (documentCardRef.current.textContent || '').replace(/\s+/g, ' ').trim();
    if (!selected || !allText) {
      return false;
    }
    return selected.length >= Math.max(1, Math.floor(allText.length * 0.85));
  };

  const clearEntireCompositionText = () => {
    setDocTitle('');
    setDocSubtitle('');
    setDocBodyHtml('');
    setIsBlankDocument(true);
    setAppendedSections([]);
    setLastComposeRun(null);
    setTimeout(() => {
      blankBodyRef.current?.focus();
    }, 0);
  };

  const replaceEntireCompositionText = (value) => {
    const raw = String(value || '').replace(/\r/g, '').trim();
    setDocTitle('');
    setDocSubtitle('');
    setIsBlankDocument(true);
    setAppendedSections([]);
    if (!raw) {
      setDocBodyHtml('');
      return;
    }
    const html = raw
      .split(/\n{2,}/)
      .map((block) => block.trim())
      .filter(Boolean)
      .map((block) => `<p>${escapeHtml(block).replace(/\n/g, '<br/>')}</p>`)
      .join('');
    setDocBodyHtml(html);
    setTimeout(() => {
      blankBodyRef.current?.focus();
    }, 0);
  };

  const normalizeEditableDirection = (element) => {
    if (!element) {
      return;
    }

    element.setAttribute('dir', 'ltr');
    element.style.direction = 'ltr';
    element.style.unicodeBidi = 'plaintext';
  };

  const clearPlaceholderOnFocus = (event, placeholder) => {
    const currentValue = event.currentTarget.textContent?.trim() || '';
    if (currentValue === placeholder) {
      event.currentTarget.textContent = '';
    }
  };

  const handleEditablePaste = (event, placeholder, afterPaste) => {
    const target = event.currentTarget;
    const plainText = event.clipboardData?.getData('text/plain') || '';
    const currentValue = target.textContent?.trim() || '';

    if (currentValue === placeholder || currentValue === AI_NATIVE_PLACEHOLDER) {
      target.textContent = '';
    }

    event.preventDefault();
    if (plainText) {
      document.execCommand('insertText', false, plainText);
    }
    normalizeEditableDirection(target);
    if (afterPaste) {
      afterPaste(target);
    }
  };

  const insertTranscriptIntoDocument = (spokenText, options = {}) => {
    const normalized = String(spokenText || '').trim();
    if (!normalized) {
      return;
    }
    const forceAppendToEnd = Boolean(options.forceAppendToEnd);

    const getFallbackDocumentTarget = () => {
      if (blankBodyRef.current) {
        return blankBodyRef.current;
      }

      if (!documentCardRef.current) {
        return null;
      }

      const editableNodes = Array.from(documentCardRef.current.querySelectorAll('[contenteditable="true"]'));
      if (!editableNodes.length) {
        return null;
      }

      const nonHeaderNode = editableNodes.find((node) => node !== titleEditableRef.current && node !== subtitleEditableRef.current);
      return nonHeaderNode || editableNodes[editableNodes.length - 1] || null;
    };

    const active = document.activeElement;
    const activeEditable = active?.isContentEditable && documentCardRef.current?.contains(active)
      ? active
      : null;

    let target = activeEditable;
    if (!target) {
      if (!docTitle.trim() || docTitle === AI_NATIVE_PLACEHOLDER) {
        target = titleEditableRef.current;
      } else if (!docSubtitle.trim() || docSubtitle === AI_NATIVE_PLACEHOLDER) {
        target = subtitleEditableRef.current;
      } else {
        target = getFallbackDocumentTarget();
      }
    }

    if (!target) {
      return;
    }

    target.focus();
    if ((target.textContent || '').trim() === AI_NATIVE_PLACEHOLDER) {
      target.textContent = '';
    }

    const selection = window.getSelection();
    let shouldResetToEnd = forceAppendToEnd;
    if (selection && selection.rangeCount) {
      if (!forceAppendToEnd) {
        const currentRange = selection.getRangeAt(0);
        const anchorNode = selection.anchorNode;
        const anchorElement = anchorNode?.nodeType === Node.TEXT_NODE ? anchorNode.parentNode : anchorNode;
        shouldResetToEnd = !anchorElement || !target.contains(anchorElement);
        if (!shouldResetToEnd && !isRangeInsideEditor(currentRange)) {
          shouldResetToEnd = true;
        }
      }
    } else if (!forceAppendToEnd) {
      shouldResetToEnd = true;
    }

    if (selection && shouldResetToEnd) {
      const endRange = document.createRange();
      endRange.selectNodeContents(target);
      endRange.collapse(false);
      selection.removeAllRanges();
      selection.addRange(endRange);
    }

    const insertedViaCommand = document.execCommand('insertText', false, `${normalized} `);
    if (!insertedViaCommand) {
      const fallbackSelection = window.getSelection();
      if (fallbackSelection && fallbackSelection.rangeCount) {
        const fallbackRange = fallbackSelection.getRangeAt(0);
        fallbackRange.deleteContents();
        fallbackRange.insertNode(document.createTextNode(`${normalized} `));
        fallbackRange.collapse(false);
        fallbackSelection.removeAllRanges();
        fallbackSelection.addRange(fallbackRange);
      }
    }

    const finalSelection = window.getSelection();
    if (finalSelection) {
      const endRange = document.createRange();
      endRange.selectNodeContents(target);
      endRange.collapse(false);
      finalSelection.removeAllRanges();
      finalSelection.addRange(endRange);
    }
    normalizeEditableDirection(target);

    if (target === titleEditableRef.current) {
      setDocTitle(target.textContent || '');
    } else if (target === subtitleEditableRef.current) {
      setDocSubtitle(target.textContent || '');
    } else if (target === blankBodyRef.current) {
      setIsBlankDocument(true);
      setDocBodyHtml(target.innerHTML);
    }
  };

  useEffect(() => {
    insertTranscriptIntoDocumentRef.current = insertTranscriptIntoDocument;
  }, [insertTranscriptIntoDocument]);

  const createAttachmentItems = (files, source = 'chat') => Array.from(files || []).map((file, index) => ({
    id: `${source}-${Date.now()}-${index}-${Math.floor(Math.random() * 1000)}`,
    name: file.name || 'attachment',
    type: file.type || 'application/octet-stream',
    size: file.size || 0,
    file,
  }));

  const ingestScheduleAttachments = async (files) => {
    const list = Array.from(files || []);
    if (!list.length) {
      return;
    }

    const nextAttachments = createAttachmentItems(list, 'schedule');
    setScheduleAttachments((prev) => [...prev, ...nextAttachments].slice(0, 20));

    // Pull plain text from text-like files to help schedule cleanup.
    const textPayloads = await Promise.all(list.map(async (file) => {
      const isTextLike = (file.type || '').startsWith('text/') || /\.(txt|md|csv|json)$/i.test(file.name || '');
      if (!isTextLike) {
        return '';
      }
      try {
        const content = await file.text();
        return content.trim();
      } catch (_error) {
        return '';
      }
    }));

    const mergedText = textPayloads.filter(Boolean).join('\n');
    if (mergedText) {
      setScheduleInput((prev) => `${prev}${prev ? '\n' : ''}${mergedText}`.trim());
    }
  };

  const ingestChatAttachments = async (files) => {
    const list = Array.from(files || []);
    if (!list.length) {
      return;
    }

    const nextAttachments = createAttachmentItems(list, 'chat');
    setChatAttachments((prev) => [...prev, ...nextAttachments].slice(0, 20));
  };

  const handleSchedulePaste = async (event) => {
    const clipboardFiles = Array.from(event.clipboardData?.files || []);
    if (!clipboardFiles.length) {
      return;
    }

    event.preventDefault();
    await ingestScheduleAttachments(clipboardFiles);
    showToast('Attachment added to schedule input');
  };

  const handleChatPaste = async (event) => {
    const clipboardFiles = Array.from(event.clipboardData?.files || []);
    if (!clipboardFiles.length) {
      return;
    }

    event.preventDefault();
    await ingestChatAttachments(clipboardFiles);
    showToast('Attachment added to chat input');
  };

  const autoResizeTextarea = (element, maxHeight = 140) => {
    if (!element) {
      return;
    }

    element.style.height = '0px';
    const nextHeight = Math.min(element.scrollHeight, maxHeight);
    element.style.height = `${nextHeight}px`;
    element.style.overflowY = element.scrollHeight > maxHeight ? 'auto' : 'hidden';
  };

  useEffect(() => {
    autoResizeTextarea(chatInputRef.current, 120);
  }, [chatInput]);

  useEffect(() => {
    autoResizeTextarea(scheduleInputRef.current, 120);
  }, [scheduleInput]);

  useEffect(() => {
    if (isPromptExpanded) {
      autoResizeTextarea(floatingPromptRef.current, 160);
    }
  }, [floatingPrompt, isPromptExpanded]);

  useEffect(() => {
    if (selectionActionMenu.open) {
      setSelectionMenuPrompt('');
    }
  }, [selectionActionMenu.open]);

  useEffect(() => {
    if (!selectionActionMenu.open) {
      return undefined;
    }

    const syncSelectionOverlay = () => {
      if (savedSelectionRef.current) {
        updateSelectionActionMenuPosition(savedSelectionRef.current);
      }
    };

    window.addEventListener('resize', syncSelectionOverlay);
    window.addEventListener('scroll', syncSelectionOverlay, true);
    return () => {
      window.removeEventListener('resize', syncSelectionOverlay);
      window.removeEventListener('scroll', syncSelectionOverlay, true);
    };
  }, [selectionActionMenu.open, zoomLevel]);

  useEffect(() => {
    const trackPointerOrigin = (event) => {
      pointerDownInPromptRef.current = Boolean(promptRootRef.current && promptRootRef.current.contains(event.target));
      pointerDownInDocumentRef.current = Boolean(documentCardRef.current && documentCardRef.current.contains(event.target));
    };

    window.addEventListener('pointerdown', trackPointerOrigin, true);
    return () => window.removeEventListener('pointerdown', trackPointerOrigin, true);
  }, []);

  useEffect(() => {
    const handleSelectionChange = () => {
      const range = getEditorSelectionRange();
      if (!range) {
        if (selectionMenuInputRef.current && document.activeElement === selectionMenuInputRef.current) {
          return;
        }
        if (selectionActionMenuRef.current && selectionActionMenuRef.current.contains(document.activeElement)) {
          return;
        }
        if (pointerDownInPromptRef.current) {
          pointerDownInDocumentRef.current = false;
          return;
        }
        if (pointerDownInSelectionMenuRef.current) {
          return;
        }
        if (!pointerDownInDocumentRef.current) {
          return;
        }
        setSelectedEditorText('');
        selectedEditorTextRef.current = '';
        setIsBoldActive(false);
        setIsItalicActive(false);
        setIsUnderlineActive(false);
        setIsStrikeActive(false);
        setIsListActive(false);
        wholeDocSelectionRef.current = false;
        setSelectionActionMenu({ open: false, left: 0, top: 0 });
        pointerDownInDocumentRef.current = false;
        return;
      }

      if (pointerDownInDocumentRef.current) {
        return;
      }

      syncEditorSelection();
      pointerDownInDocumentRef.current = false;
    };

    document.addEventListener('selectionchange', handleSelectionChange);
    document.addEventListener('pointerup', syncEditorSelection, true);
    document.addEventListener('mouseup', syncEditorSelection, true);
    return () => {
      document.removeEventListener('selectionchange', handleSelectionChange);
      document.removeEventListener('pointerup', syncEditorSelection, true);
      document.removeEventListener('mouseup', syncEditorSelection, true);
    };
  }, []);

  useEffect(() => {
    if (!isFocusMode) {
      return;
    }
    setLeftSidebarOpen(false);
    setRightSidebarOpen(false);
  }, [isFocusMode]);

  useEffect(() => {
    const RecognitionCtor = window.SpeechRecognition || window.webkitSpeechRecognition;
    if (!RecognitionCtor) {
      setSpeechSupported(false);
      return;
    }

    setSpeechSupported(true);
    const recognition = new RecognitionCtor();
    recognition.continuous = true;
    recognition.interimResults = true;
    recognition.lang = resolveSpeechLocale(currentLanguage);

    recognition.onresult = (event) => {
      if (isMicMutedRef.current) {
        return;
      }

      if (mockDictationTimeoutRef.current) {
        clearTimeout(mockDictationTimeoutRef.current);
        mockDictationTimeoutRef.current = null;
      }
      if (mockIntervalRef.current) {
        clearInterval(mockIntervalRef.current);
        mockIntervalRef.current = null;
      }

      const routeTranscriptToTarget = (text, source = 'final') => {
        const normalizedText = String(text || '').trim();
        if (!normalizedText) {
          return;
        }

        const activeVoiceTarget = voiceTargetRef.current;
        if (activeVoiceTarget === 'schedule') {
          setScheduleInput((prev) => `${prev}${prev ? ' ' : ''}${normalizedText}`);
        } else if (activeVoiceTarget === 'document') {
          const previous = lastDocumentTranscriptRef.current;
          let textToInsert = normalizedText;
          const shouldCompareWithInterim = previous.text
            && previous.source === 'interim'
            && source !== 'interim'
            && Date.now() - previous.at < 3500;

          if (shouldCompareWithInterim) {
            const previousLower = previous.text.toLowerCase();
            const normalizedLower = normalizedText.toLowerCase();
            if (normalizedLower === previousLower) {
              return;
            }
            if (normalizedLower.startsWith(previousLower)) {
              textToInsert = normalizedText.slice(previous.text.length).trim();
              if (!textToInsert) {
                return;
              }
            }
          }

          insertTranscriptIntoDocumentRef.current?.(textToInsert, { forceAppendToEnd: true });
          lastDocumentTranscriptRef.current = { text: normalizedText, source, at: Date.now() };
        } else {
          setFloatingPrompt((prev) => `${prev}${prev ? ' ' : ''}${normalizedText}`);
          requestAnimationFrame(() => {
            const promptEl = floatingPromptRef.current;
            if (promptEl && typeof promptEl.setSelectionRange === 'function') {
              const end = promptEl.value.length;
              promptEl.focus();
              promptEl.setSelectionRange(end, end);
            }
          });
        }
      };

      let finalTranscript = '';
      let interimTranscript = '';
      for (let i = event.resultIndex; i < event.results.length; i += 1) {
        const transcript = event.results[i][0]?.transcript || '';
        if (event.results[i].isFinal) {
          finalTranscript += transcript;
        } else {
          interimTranscript += transcript;
        }
      }

      if (finalTranscript.trim()) {
        routeTranscriptToTarget(finalTranscript.trim(), 'final');
        interimTranscriptRef.current = '';
        pendingInterimTranscriptRef.current = '';
        if (interimCommitTimerRef.current) {
          clearTimeout(interimCommitTimerRef.current);
          interimCommitTimerRef.current = null;
        }
        setLiveSpeechInterimText('');
      } else {
        const normalizedInterim = interimTranscript.trim();
        const activeVoiceTarget = voiceTargetRef.current;
        interimTranscriptRef.current = normalizedInterim;
        setLiveSpeechInterimText(normalizedInterim);

        if (activeVoiceTarget === 'document' && normalizedInterim) {
          pendingInterimTranscriptRef.current = normalizedInterim;
          if (interimCommitTimerRef.current) {
            clearTimeout(interimCommitTimerRef.current);
          }
          interimCommitTimerRef.current = setTimeout(() => {
            const buffered = pendingInterimTranscriptRef.current.trim();
            if (buffered) {
              routeTranscriptToTarget(buffered, 'interim');
              pendingInterimTranscriptRef.current = '';
            }
            interimCommitTimerRef.current = null;
          }, 850);
        }
      }
    };

    recognition.onstart = () => {
      setIsVoiceActive(true);
    };

    recognition.onerror = (event) => {
      const errorCode = String(event?.error || 'unknown');
      console.warn('Speech recognition error:', errorCode);

      // Match attached behavior: do not hard-stop on recognizer errors.
      const recoverableErrors = ['not-allowed', 'service-not-allowed', 'audio-capture', 'aborted', 'network'];
      if (voiceTargetRef.current === 'document' && isVoiceActiveRef.current && recoverableErrors.includes(errorCode) && !mockIntervalRef.current) {
        showToast('Microphone stream interrupted. Switching to fallback dictation.');
        const phrases = [''];
        const fullText = phrases.join('');
        let currentIndex = 0;
        try {
          recognition.stop();
        } catch (_error) {
          // noop
        }
        mockIntervalRef.current = setInterval(() => {
          if (!isVoiceActiveRef.current || isMicMutedRef.current) {
            clearInterval(mockIntervalRef.current);
            mockIntervalRef.current = null;
            return;
          }
          currentIndex += Math.floor(Math.random() * 3) + 2;
          if (currentIndex > fullText.length) {
            currentIndex = fullText.length;
          }
          const chunk = fullText.substring(0, currentIndex).trim();
          interimTranscriptRef.current = chunk;
          setLiveSpeechInterimText(chunk);

          if (currentIndex === fullText.length) {
            clearInterval(mockIntervalRef.current);
            mockIntervalRef.current = null;
            setTimeout(() => {
              if (isVoiceActiveRef.current && chunk) {
                insertTranscriptIntoDocumentRef.current?.(chunk, { forceAppendToEnd: true });
              }
              interimTranscriptRef.current = '';
              setLiveSpeechInterimText('');
              setIsVoiceActive(false);
            }, 1000);
          }
        }, 40);
      }
    };

    recognition.onend = () => {
      const buffered = pendingInterimTranscriptRef.current.trim();
      if (buffered) {
        if (voiceTargetRef.current === 'schedule') {
          setScheduleInput((prev) => `${prev}${prev ? ' ' : ''}${buffered}`);
        } else if (voiceTargetRef.current === 'document') {
          insertTranscriptIntoDocumentRef.current?.(buffered, { forceAppendToEnd: true });
          lastDocumentTranscriptRef.current = { text: buffered, source: 'onend', at: Date.now() };
        } else {
          setFloatingPrompt((prev) => `${prev}${prev ? ' ' : ''}${buffered}`);
        }
        pendingInterimTranscriptRef.current = '';
        if (voiceTargetRef.current !== 'document') {
          setLiveSpeechInterimText('');
        }
      }

      if (isVoiceActiveRef.current && !isMicMutedRef.current && !mockIntervalRef.current) {
        try {
          recognition.start();
        } catch (_error) {
          setIsVoiceActive(false);
          setLiveSpeechInterimText('');
        }
      }
    };

    speechRecognitionRef.current = recognition;
    return () => {
      if (mockDictationTimeoutRef.current) {
        clearTimeout(mockDictationTimeoutRef.current);
        mockDictationTimeoutRef.current = null;
      }
      if (mockIntervalRef.current) {
        clearInterval(mockIntervalRef.current);
        mockIntervalRef.current = null;
      }
      if (interimCommitTimerRef.current) {
        clearTimeout(interimCommitTimerRef.current);
        interimCommitTimerRef.current = null;
      }
      try {
        recognition.stop();
      } catch (_error) {
        // noop
      }
      speechRecognitionRef.current = null;
    };
  }, [currentLanguage]);

  // Integrated Tasks checklist state
  const [tasks, setTasks] = useState([
    { id: 1, text: 'Confirm final beta signup workflow with design team', completed: false, owner: 'user' },
    { id: 2, text: 'Draft launch announcements for Twitter and LinkedIn', completed: true, owner: 'agent' },
    { id: 3, text: 'Coordinate with marketing for Creator pricing model tier', completed: false, owner: 'user' },
    { id: 4, text: 'Check analytics dashboard integration is live', completed: false, owner: 'agent' },
  ]);
  const [taskOwnerFilter, setTaskOwnerFilter] = useState('all');

  const visibleTasks = useMemo(() => {
    if (taskOwnerFilter === 'all') {
      return tasks;
    }
    return tasks.filter((task) => task.owner === taskOwnerFilter);
  }, [tasks, taskOwnerFilter]);

  // Conversational state with pre-loaded AI response cards
  const [chatMessages, setChatMessages] = useState([
    {
      id: 1,
      sender: 'ai',
      text: 'Compose AI is ready. Ask, summarize, or instruct to update your document.',
      type: 'welcome',
    },
  ]);

  // Handle status cycle on initiatives
  const toggleStatus = (id) => {
    setInitiatives(prev => prev.map(item => {
      if (item.id === id) {
        const nextStatus = item.status === 'Planned' ? 'In Progress' : item.status === 'In Progress' ? 'Completed' : 'Planned';
        return { ...item, status: nextStatus };
      }
      return item;
    }));
    showToast("Status updated");
  };

  // Toast notifier helper
  const showToast = (msg) => {
    if (toastTimerRef.current) {
      clearTimeout(toastTimerRef.current);
    }
    setToastMessage(msg);
    toastTimerRef.current = setTimeout(() => {
      setToastMessage('');
      toastTimerRef.current = null;
    }, 2800);
  };

  const closeScheduleSessionModal = () => {
    setIsScheduleCalendarExpanded(false);
    setIsSchedulePeopleMenuOpen(false);
    setIsScheduleSessionModalOpen(false);
  };

  const handleScheduleSessionSave = () => {
    const title = String(scheduleForm.title || '').trim() || 'Untitled session';
    const startDate = String(scheduleForm.startDate || '').trim();
    const startTime = String(scheduleForm.startTime || '').trim() || '10:00';
    const eventDate = new Date(`${startDate}T${startTime}:00`);
    const hasValidDate = !Number.isNaN(eventDate.getTime());
    const slotLabel = hasValidDate
      ? `${eventDate.toLocaleDateString(undefined, { month: 'short', day: 'numeric', year: 'numeric' })} - ${scheduleForm.startTime}`
      : `${scheduleForm.startDate} - ${scheduleForm.startTime}`;
    const event = {
      id: Date.now(),
      title,
      slot: scheduleForm.startTime,
      slotLabel,
      dueDate: hasValidDate ? eventDate.toISOString() : null,
      participants: scheduleParticipants.map((person) => person.name),
      source: 'room-schedule-session',
    };

    setUpcomingEvents((prev) => [event, ...prev]);
    if (hasValidDate) {
      setSelectedCalendarDate(eventDate);
    }
    setParticipantSchedules((prev) => {
      const next = { ...prev };
      scheduleParticipants.forEach((person) => {
        const key = person.name;
        next[key] = [...(next[key] || []), event];
      });
      return next;
    });
    showToast(`Saved to schedule for ${scheduleParticipants.map((person) => person.name.split(' ')[0]).join(', ')}`);
    closeScheduleSessionModal();
  };

  useEffect(() => () => {
    if (toastTimerRef.current) {
      clearTimeout(toastTimerRef.current);
      toastTimerRef.current = null;
    }
  }, []);

  const truncateText = (value, max = 120) => {
    const raw = String(value || '').trim();
    if (raw.length <= max) {
      return raw;
    }
    return `${raw.slice(0, max)}...`;
  };

  const truncateUiTitle = (value, max = 20) => {
    const raw = String(value || '').trim();
    if (raw.length <= max) {
      return raw;
    }
    return `${raw.slice(0, Math.max(1, max - 3)).trimEnd()}...`;
  };

  const removePromptAttachment = (attachmentId) => {
    setPromptAttachments((prev) => {
      const target = prev.find((attachment) => attachment.id === attachmentId);
      if (target?.url) {
        try {
          URL.revokeObjectURL(target.url);
        } catch (_error) {
          // noop
        }
      }
      const next = prev.filter((attachment) => attachment.id !== attachmentId);
      return next;
    });
  };

  const attachFilesToPrompt = async (files) => {
    if (!files || !files.length) {
      return;
    }

    const attachments = await Promise.all(Array.from(files).map(async (file, index) => {
      const baseAttachment = {
        id: Date.now() + index + Math.floor(Math.random() * 1000),
        name: file.name,
        type: file.type || 'application/octet-stream',
        size: file.size || 0,
        file,
        url: URL.createObjectURL(file),
        isImage: (file.type || '').startsWith('image/'),
      };

      const extractedText = await extractAttachmentText(baseAttachment);
      return {
        ...baseAttachment,
        extractedText,
        previewText: extractedText ? truncateText(extractedText, 180) : '',
      };
    }));

    setPromptAttachments((prev) => [...attachments, ...prev].slice(0, 24));

    trackMemoryAction('upload', 'Attached files to prompt', {
      count: attachments.length,
      types: attachments.map((attachment) => attachment.type).join(', '),
    });
  };

  const beginPromptEdit = (entry) => {
    setEditingPromptId(entry.id);
    setEditingPromptValue(entry.text || '');
  };

  const cancelPromptEdit = () => {
    setEditingPromptId(null);
    setEditingPromptValue('');
  };

  const savePromptEdit = (entryId) => {
    const nextValue = editingPromptValue.trim();
    if (!nextValue) {
      showToast('Prompt cannot be empty');
      return;
    }
    setPromptHistory((prev) => prev.map((entry) => (entry.id === entryId ? { ...entry, text: nextValue } : entry)));
    cancelPromptEdit();
    showToast('Prompt updated');
  };

  const handleComposeUndo = () => {
    if (lastComposeRun?.preSnapshot) {
      applySnapshot(lastComposeRun.preSnapshot);
      showToast('Reverted generated changes');
    } else {
      undoDocumentChange();
    }
    setLastComposeRun(null);
  };

  const handleComposeRetry = () => {
    if (!lastComposeRun?.prompt) {
      showToast('No prompt to retry');
      return;
    }
    handleAISubmit(lastComposeRun.prompt, {
      ...(lastComposeRun.options || {}),
      source: 'compose',
      forceDocBuild: true,
      suppressChatEcho: true,
    });
  };

  const handleComposeDelete = () => {
    setDocBodyHtml('');
    setAppendedSections([]);
    setIsBlankDocument(true);
    setDocTitle('');
    setDocSubtitle('');
    setLastComposeRun(null);
    showToast('Removed generated output');
  };

  const handleComposeAccept = () => {
    setLastComposeRun(null);
    showToast('Changes accepted');
  };

  const docTitleDisplay = truncateText(docTitle || 'Untitled document', 20);

  const selectedTextActionOptions = [
    { key: 'ask', label: 'Ask AI about this selection', detail: 'Selection-aware assistant', icon: Sparkles, prompt: 'Analyze this selected text and explain what it means, including the strongest insight.', keepOpen: true, hintStyle: true },
    { key: 'rewrite', label: 'Rewrite', detail: 'Improve clarity and tone', icon: PenTool, prompt: 'Rewrite the selected text to be clearer, tighter, and more readable.' },
    { key: 'summary', label: 'Summarize', detail: 'Shorten this text', icon: Scissors, prompt: 'Summarize the selected text in fewer words while preserving core meaning.' },
    { key: 'expand', label: 'Expand', detail: 'Add more detail', icon: Expand, prompt: 'Expand the selected text with more detail and useful context.' },
    { key: 'tone', label: 'Change tone', detail: 'Make it more formal', icon: Type, prompt: 'Rewrite the selected text in a more formal and professional tone.' },
    { key: 'keypoints', label: 'Extract key points', detail: 'Create a bullet list', icon: ListTodo, prompt: 'Extract key points from the selected text as a concise bullet list.' },
    { key: 'outline', label: 'Create outline', detail: 'Structure into sections', icon: MessageSquarePlus, prompt: 'Turn the selected text into a structured outline with clear section headings and bullets.' },
  ];

  const runSelectedTextAction = (action) => {
    const selectedScope = selectedEditorTextRef.current || String(savedSelectionRef.current?.toString?.() || '').trim();
    if (!selectedScope) {
      return;
    }
    selectedEditorTextRef.current = selectedScope;

    const instruction = String(action?.prompt || selectionMenuPrompt || '').trim();
    if (!instruction.trim()) {
      return;
    }

    if (action?.key === 'ask') {
      setSelectionMenuPrompt(instruction);
    } else {
      setAssistantQuickPrompt(instruction);
    }
    setSelectionActionMenu({ open: false, left: 0, top: 0 });
    runSmartAssistAction(instruction, {
      actionKey: action?.key || '',
      selectionScoped: true,
    });
  };

  const closeTransientMenus = () => {
    setOpenDropdown(null);
    setTextStyleMenuOpen(false);
    setOpenDocMenuId(null);
    setIsPromptMenuOpen(false);
    setPromptTuneMenuOpen(false);
    setPromptFormatMenuOpen(false);
    setPromptLibraryOpen(false);
    setPromptHistoryFilterMenuOpen(false);
    setOpenWorkspaceMenuId(null);
    setLanguageMenuOpen(false);
    setDocSearchPanelOpen(false);
    setOutlineLevelMenuOpen(false);
    setIsSchedulePeopleMenuOpen(false);
    setIsQuickAddSourceMenuOpen(false);
  };

  const trackMemoryAction = (type, summary, details = {}) => {
    if (!memoryCaptureEnabled) {
      return;
    }

    const entry = {
      id: Date.now() + Math.floor(Math.random() * 1000),
      type,
      summary,
      details,
      timestamp: Date.now(),
    };

    setMemoryEntries((prev) => [entry, ...prev].slice(0, 300));
  };

  const registerPromptHistory = ({ text, source = 'compose', format = 'Auto', tone = 'normal', lengthMode = 'words', lengthValue = 220 }) => {
    const normalizedText = String(text || '').trim();
    if (!normalizedText) {
      return;
    }

    const nextEntry = {
      id: Date.now() + Math.floor(Math.random() * 1000),
      text: normalizedText,
      source,
      format,
      tone,
      lengthMode,
      lengthValue,
      timestamp: Date.now(),
    };

    setPromptHistory((prev) => {
      const withoutDuplicate = prev.filter(
        (entry) => String(entry.text || '').trim().toLowerCase() !== normalizedText.toLowerCase(),
      );
      return [nextEntry, ...withoutDuplicate].slice(0, 120);
    });
  };

  const toParagraphHtml = (value) => {
    const normalized = String(value || '').replace(/\r/g, '').trim();
    if (!normalized) {
      return '<p style="font-size:16px;color:#334155;line-height:1.8;margin-bottom:12px;"></p>';
    }

    const applyInlineFormatting = (text) => String(text || '')
      .replace(/\*\*(.+?)\*\*/g, '<strong>$1</strong>')
      .replace(/__(.+?)__/g, '<strong>$1</strong>')
      .replace(/\*(.+?)\*/g, '<em>$1</em>');

    return normalized
      .split(/\n{2,}/)
      .map((block) => block.trim())
      .filter(Boolean)
      .map((block) => `<p style="font-size:16px;color:#334155;line-height:1.8;margin-bottom:12px;">${applyInlineFormatting(escapeHtml(block).replace(/\n/g, '<br/>'))}</p>`)
      .join('');
  };

  const paginateGeneratedHtml = (html, { targetWordsPerPage = 260 } = {}) => {
    const normalized = String(html || '').trim();
    if (!normalized || typeof document === 'undefined') {
      return normalized;
    }

    const wrapper = document.createElement('div');
    wrapper.innerHTML = normalized;
    const nodes = Array.from(wrapper.children);
    if (nodes.length <= 1) {
      return normalized;
    }

    const pages = [];
    let currentNodes = [];
    let currentWordCount = 0;

    const flushPage = () => {
      if (!currentNodes.length) {
        return;
      }
      pages.push(currentNodes.map((node) => node.outerHTML).join(''));
      currentNodes = [];
      currentWordCount = 0;
    };

    nodes.forEach((node) => {
      const nodeHtml = node.outerHTML;
      const nodeWords = Math.max(1, getPlainText(nodeHtml).split(/\s+/).filter(Boolean).length);
      if (currentNodes.length && currentWordCount + nodeWords > targetWordsPerPage) {
        flushPage();
      }
      currentNodes.push(node);
      currentWordCount += nodeWords;
    });

    flushPage();

    if (pages.length <= 1) {
      return normalized;
    }

    return pages.map((pageHtml, index) => `
      <div class="compose-generated-page" style="${index > 0 ? 'margin-top:36px;' : ''}padding-bottom:36px;${index < pages.length - 1 ? 'border-bottom:1px dashed #e5e7eb;' : ''}">
        ${pageHtml}
      </div>
    `).join('');
  };

  const buildDeckSlidesFallback = ({ promptText, aiText, sourceSlides = [] }) => {
    const slideCountMatch = String(promptText || '').match(/(\d{1,2})\s*[- ]?\s*(?:slide|slides|page|pages)\b/i);
    const requestedSlideCount = Math.max(1, Math.min(20, Number(slideCountMatch?.[1] || 10)));
    const cleanedPrompt = String(promptText || '')
      .replace(/attached files?:[\s\S]*$/i, '')
      .replace(/^format:\s*/i, '')
      .trim();
    const cleanedAiText = String(aiText || '')
      .replace(/```json|```/gi, '')
      .trim();
    const looksLikeStructuredPayload = /^\{[\s\S]*\}$/.test(cleanedAiText)
      && /hasAction|docAction|deckSlides|aiResponseText/i.test(cleanedAiText);
    const basis = (looksLikeStructuredPayload ? '' : cleanedAiText) || cleanedPrompt || 'Presentation direction';
    const lines = basis.split(/\n+/).map((line) => line.trim()).filter(Boolean);
    const headlineSeed = lines[0] || 'Presentation direction';
    const detailSeed = lines.slice(1).join(' ') || 'Designed from your prompt and source files.';
    const sectionTitles = {
      Opening: 'Opening: Core Narrative',
      Problem: 'Problem: Current Friction',
      Opportunity: 'Opportunity: Why Now',
      Product: 'Product: Solution Overview',
      Market: 'Market: Landscape and Demand',
      Strategy: 'Strategy: Go-To-Market',
      Financials: 'Financials: Metrics and Forecast',
      Closing: 'Closing: Ask and Next Steps',
    };

    const makeGeneratedSlide = (index, total) => {
      const section = inferDeckStorySection({ title: '', subtitle: '', headline: '' }, index, total);
      const preset = DECK_DESIGN_PRESETS[index % DECK_DESIGN_PRESETS.length] || DECK_DESIGN_PRESETS[0];
      return {
        id: index + 1,
        title: sectionTitles[section] || `Slide ${index + 1}`,
        subtitle: cleanedPrompt || 'AI-generated deck structure',
        accent: 'from-violet-500 to-indigo-600',
        designPresetKey: preset.key,
        headline: index === 0 ? headlineSeed : `${section} focus`,
        blurb: index === 0 ? detailSeed : `Advance the ${section.toLowerCase()} narrative with clear hierarchy and visual evidence.`,
        visualType: index % 3 === 0 ? 'hero statement' : index % 3 === 1 ? 'data-backed narrative' : 'comparison visual',
        layoutStyle: index % 2 === 0 ? 'cinematic split' : 'modular canvas',
        motionCue: index % 2 === 0 ? 'Soft fade and stagger reveal' : 'Progressive reveal sequence',
        keyMetric: '',
        speakerNotes: `Frame this ${section.toLowerCase()} point clearly, then transition to the next narrative beat.`,
        section,
        footer: 'Original design 繚 Editable',
      };
    };

    if (Array.isArray(sourceSlides) && sourceSlides.length) {
      const mapped = sourceSlides
        .slice(0, 20)
        .map((slide, index) => {
          const preset = DECK_DESIGN_PRESETS[index % DECK_DESIGN_PRESETS.length] || DECK_DESIGN_PRESETS[0];
          return {
            id: index + 1,
            title: String(slide.title || `Slide ${index + 1}`),
            subtitle: String(slide.subtitle || ''),
            accent: 'from-violet-500 to-indigo-600',
            designPresetKey: preset.key,
            headline: String(slide.headline || slide.title || `Slide ${index + 1}`),
            blurb: String(slide.blurb || slide.subtitle || detailSeed),
            visualType: String(slide.visualType || 'hero statement'),
            layoutStyle: String(slide.layoutStyle || 'cinematic split'),
            motionCue: String(slide.motionCue || 'Soft fade and stagger reveal'),
            keyMetric: String(slide.keyMetric || ''),
            speakerNotes: String(slide.speakerNotes || ''),
            section: String(slide.section || inferDeckStorySection(slide, index, sourceSlides.length)),
            footer: 'Original design 繚 Editable',
          };
        });

      if (mapped.length >= requestedSlideCount) {
        return mapped.slice(0, requestedSlideCount);
      }

      const completed = [...mapped];
      for (let i = mapped.length; i < requestedSlideCount; i += 1) {
        completed.push(makeGeneratedSlide(i, requestedSlideCount));
      }
      return completed;
    }

    return Array.from({ length: requestedSlideCount }, (_, index) => makeGeneratedSlide(index, requestedSlideCount));
  };

  const buildComposeFallbackAction = ({ promptText, requestedFormat, preferredDocType, attachmentContext = '', requestedTone = 'normal', requestedLengthValue = 220, requestedLengthMode = 'words' }) => {
    const topic = String(promptText || 'the requested topic')
      .replace(/\s+/g, ' ')
      .trim()
      .replace(/^user request:\s*/i, '')
      .slice(0, 180);
    const sourceSummary = summarizeAttachmentContext(attachmentContext, promptText);
    const titleBase = preferredDocType === 'timeline'
      ? 'Compose Timeline'
      : preferredDocType === 'tasks'
        ? 'Compose Checklist'
        : preferredDocType === 'risks'
          ? 'Compose Risk Review'
          : requestedFormat === 'Article'
            ? 'Compose Article'
            : requestedFormat === 'Proposal'
              ? 'Compose Proposal'
              : 'Compose Draft';

    const sourceSentence = sourceSummary.sentences.length
      ? `The uploaded material shows that ${sourceSummary.sentences.join(' ')}`
      : attachmentContext
      ? `The document is grounded in the uploaded source materials${sourceSummary.fileNames.length ? `, including ${sourceSummary.fileNames.join(', ')}` : ''}.`
      : 'The document is grounded in the user request and current document context.';

    if (preferredDocType === 'timeline') {
      return {
        title: titleBase,
        type: 'timeline',
        content: [
          {
            dates: 'Start',
            phase: 'Topic intake',
            detail: `Clarify the scope of ${topic}.`,
          },
          {
            dates: 'Middle',
            phase: 'Source review',
            detail: sourceSentence,
          },
          {
            dates: 'Next',
            phase: 'Draft development',
            detail: `Write in a ${requestedTone} tone with a target length of about ${requestedLengthValue} ${requestedLengthMode}.`,
          },
          {
            dates: 'Final',
            phase: 'Finalize',
            detail: 'Refine structure, transitions, and call to action before publishing.',
          },
        ],
      };
    }

    if (preferredDocType === 'tasks') {
      return {
        title: titleBase,
        type: 'tasks',
        content: [
          `Review the uploaded material for key facts about ${topic}.`,
          `Draft the first version in a ${requestedTone} tone.`,
          'Use the source material to keep the wording specific and grounded.',
          'Polish the output so it matches the requested format and length.',
        ],
      };
    }

    if (preferredDocType === 'risks') {
      return {
        title: titleBase,
        type: 'risks',
        content: [
          {
            threat: `Generic output that ignores ${topic}`,
            impact: 'The document feels unhelpful and detached from the uploaded source.',
            fix: 'Force the draft to reference the attachment context and named source files.',
          },
          {
            threat: 'Attachment-only uploads without extracted cues',
            impact: 'The AI may stay vague when the source material is not summarized.',
            fix: 'Summarize key details from the files before generating the final draft.',
          },
          {
            threat: 'Overly generic article framing',
            impact: 'The output becomes a placeholder instead of a usable article.',
            fix: 'Use the topic, source context, and requested format to produce structured paragraphs.',
          },
        ],
      };
    }

    const body = [
      requestedFormat === 'Article'
        ? `This article examines ${topic}.`
        : `This document is written for ${topic}.`,
      sourceSentence,
      ...(sourceSummary.sentences.length > 1
        ? [`Key takeaways from the attached material include ${sourceSummary.sentences.slice(0, 2).join(' ')}`]
        : []),
      `It is drafted in a ${requestedTone} tone and targeted to about ${requestedLengthValue} ${requestedLengthMode}.`,
    ].join('\n\n');

    return {
      title: titleBase,
      type: 'text',
      paragraph: body,
    };
  };

  const renderDocActionHtml = (action) => {
    if (!action) {
      return '';
    }

    const title = escapeHtml(action.title || 'Compose AI Output');
    if (action.type === 'timeline' && Array.isArray(action.content)) {
      const rows = action.content.map((item) => `
        <div style="padding:10px 12px;border:1px solid #e5e7eb;border-radius:10px;margin-bottom:8px;background:#f8fafc;">
          <div style="font-size:12px;font-weight:700;color:#6d28d9;">${escapeHtml(item.dates)}</div>
          <div style="font-size:14px;font-weight:600;color:#0f172a;margin-top:3px;">${escapeHtml(item.phase)}</div>
          <div style="font-size:13px;color:#475569;margin-top:2px;">${escapeHtml(item.detail)}</div>
        </div>
      `).join('');
      return `<h2 style="font-size:28px;line-height:1.2;margin-bottom:16px;">${title}</h2>${rows}`;
    }

    if (action.type === 'tasks' && Array.isArray(action.content)) {
      const items = action.content.map((task) => `<li style="margin-bottom:8px;">${escapeHtml(task)}</li>`).join('');
      return `<h2 style="font-size:28px;line-height:1.2;margin-bottom:16px;">${title}</h2><ul style="padding-left:20px;color:#334155;line-height:1.7;">${items}</ul>`;
    }

    if (action.type === 'risks' && Array.isArray(action.content)) {
      const items = action.content.map((risk) => `
        <div style="padding:10px 12px;border:1px solid #fecdd3;border-radius:10px;margin-bottom:8px;background:#fff1f2;">
          <div style="font-size:13px;font-weight:700;color:#be123c;">${escapeHtml(risk.threat)}</div>
          <div style="font-size:12px;color:#9f1239;margin-top:3px;">Impact: ${escapeHtml(risk.impact)}</div>
          <div style="font-size:12px;color:#475569;margin-top:4px;">Mitigation: ${escapeHtml(risk.fix)}</div>
        </div>
      `).join('');
      return `<h2 style="font-size:28px;line-height:1.2;margin-bottom:16px;">${title}</h2>${items}`;
    }

    return `<h2 style="font-size:28px;line-height:1.2;margin-bottom:16px;">${title}</h2>${toParagraphHtml(action.paragraph || '')}`;
  };

  const parseJsonSafely = (rawText) => {
    if (!rawText) {
      return null;
    }

    try {
      return JSON.parse(rawText);
    } catch (_error) {
      const first = rawText.indexOf('{');
      const last = rawText.lastIndexOf('}');
      if (first >= 0 && last > first) {
        try {
          return JSON.parse(rawText.slice(first, last + 1));
        } catch (_nestedError) {
          return null;
        }
      }
      return null;
    }
  };

  const toBase64 = (file) => new Promise((resolve, reject) => {
    const reader = new FileReader();
    reader.onload = () => {
      const value = String(reader.result || '');
      const marker = 'base64,';
      const index = value.indexOf(marker);
      resolve(index >= 0 ? value.slice(index + marker.length) : value);
    };
    reader.onerror = () => reject(new Error('Failed to read file'));
    reader.readAsDataURL(file);
  });

  const encodePromptAttachments = async (attachments = []) => {
    const maxAttachmentBytes = 12 * 1024 * 1024;
    const encoded = [];
    for (const item of attachments) {
      const file = item?.file;
      if (!file) {
        continue;
      }
      if ((file.size || 0) > maxAttachmentBytes) {
        continue;
      }
      try {
        const data = await toBase64(file);
        if (!data) {
          continue;
        }
        encoded.push({
          name: item?.name || file.name || 'attachment',
          mimeType: item?.type || file.type || 'application/octet-stream',
          data,
        });
      } catch (_error) {
        // Skip unreadable files.
      }
    }
    return encoded.slice(0, 8);
  };

  const isPdfAttachment = (attachment) => {
    const mimeType = String(attachment?.mimeType || attachment?.type || '').toLowerCase();
    const name = String(attachment?.name || '').toLowerCase();
    return mimeType.includes('pdf') || name.endsWith('.pdf');
  };

  const isTextLikeAttachment = (attachment) => {
    const mimeType = String(attachment?.mimeType || attachment?.type || '').toLowerCase();
    const name = String(attachment?.name || '').toLowerCase();
    return (
      mimeType.startsWith('text/')
      || mimeType.includes('json')
      || mimeType.includes('xml')
      || mimeType.includes('csv')
      || mimeType.includes('markdown')
      || name.endsWith('.txt')
      || name.endsWith('.md')
      || name.endsWith('.csv')
      || name.endsWith('.json')
      || name.endsWith('.html')
      || name.endsWith('.htm')
    );
  };

  const normalizeSourceText = (value) => String(value || '')
    .replace(/\u0000/g, ' ')
    .replace(/\s+/g, ' ')
    .trim();

  const extractPdfText = async (file) => {
    if (!file) {
      return '';
    }

    try {
      const pdfjs = await import('pdfjs-dist/legacy/build/pdf.mjs');
      const buffer = await file.arrayBuffer();
      const loadingTask = pdfjs.getDocument({ data: buffer, disableWorker: true });
      const pdf = await loadingTask.promise;
      const pages = [];
      const maxPages = Math.min(pdf.numPages || 0, 6);

      for (let pageNumber = 1; pageNumber <= maxPages; pageNumber += 1) {
        const page = await pdf.getPage(pageNumber);
        const textContent = await page.getTextContent();
        const pageText = textContent.items
          .map((item) => ('str' in item ? item.str : ''))
          .join(' ');
        const normalizedPageText = normalizeSourceText(pageText);
        if (normalizedPageText) {
          pages.push(normalizedPageText);
        }
      }

      return pages.join('\n\n');
    } catch (_error) {
      return '';
    }
  };

  const pickRelevantSentences = (text, promptText = '', limit = 3) => {
    const normalized = normalizeSourceText(text);
    if (!normalized) {
      return [];
    }

    const sentences = normalized
      .split(/(?<=[.!?])\s+/)
      .map((sentence) => sentence.trim())
      .filter((sentence) => sentence.length > 40);

    if (!sentences.length) {
      return normalized ? [normalized.slice(0, 320)] : [];
    }

    const requestedFindings = /finding|result|conclusion|discover|insight|research/i.test(promptText);
    const scoreSentence = (sentence) => {
      let score = 0;
      if (requestedFindings && /(finding|result|conclusion|conclude|show|demonstrate|suggest|evidence|abstract)/i.test(sentence)) {
        score += 3;
      }
      if (/(abstract|introduction|method|result|discussion|conclusion)/i.test(sentence)) {
        score += 1;
      }
      return score;
    };

    return [...sentences]
      .sort((left, right) => scoreSentence(right) - scoreSentence(left))
      .slice(0, limit);
  };

  const summarizeAttachmentContext = (attachmentContext = '', promptText = '') => {
    const blocks = String(attachmentContext || '')
      .replace(/^Source materials to ground the response in:\n/i, '')
      .split(/\n\n(?=File: )/)
      .map((block) => block.trim())
      .filter(Boolean);

    const fileNames = [];
    const summarySentences = [];

    for (const block of blocks) {
      const lines = block.split('\n');
      const fileLine = lines[0] || '';
      const fileMatch = fileLine.match(/^File:\s+(.+?)\s+\(/i);
      if (fileMatch?.[1]) {
        fileNames.push(fileMatch[1]);
      }

      const excerptIndex = lines.findIndex((line) => /^Excerpt:/i.test(line));
      if (excerptIndex >= 0) {
        const excerpt = lines.slice(excerptIndex + 1).join(' ');
        summarySentences.push(...pickRelevantSentences(excerpt, promptText, 2));
      }
    }

    return {
      fileNames: [...new Set(fileNames)].slice(0, 3),
      sentences: [...new Set(summarySentences)].slice(0, 3),
    };
  };

  const extractAttachmentText = async (attachment) => {
    const file = attachment?.file;
    if (!file) {
      return '';
    }

    if (attachment?.extractedText) {
      return normalizeSourceText(attachment.extractedText);
    }

    if (isTextLikeAttachment(attachment)) {
      try {
        return normalizeSourceText(await file.text());
      } catch (_error) {
        return '';
      }
    }

    if (isPdfAttachment(attachment)) {
      try {
        return normalizeSourceText(await extractPdfText(file));
      } catch (_error) {
        return '';
      }
    }

    return '';
  };

  const stripFileExtension = (value) => String(value || '').replace(/\.[a-z0-9]+$/i, '').trim();

  const toTitleCase = (value) => String(value || '')
    .toLowerCase()
    .replace(/\b\w/g, (match) => match.toUpperCase())
    .trim();

  const compactDisplayTitle = (value, maxChars = 20) => {
    const text = String(value || '').replace(/\s+/g, ' ').trim();
    if (!text || text.length <= maxChars) {
      return text;
    }
    if (maxChars <= 3) {
      return text.slice(0, maxChars);
    }
    return `${text.slice(0, maxChars - 3).trimEnd()}...`;
  };

  const cleanSourceLabel = (value) => String(value || '')
    .replace(/\.[a-z0-9]+$/i, '')
    .replace(/[_-]+/g, ' ')
    .replace(/\b(?:final|draft|copy|version|v\d+|scan|scanned|uploaded|attachment|document|file)\b/gi, ' ')
    .replace(/\s+/g, ' ')
    .trim();

  const extractPromptSubject = (promptText = '') => {
    const normalized = String(promptText || '')
      .replace(/\s+/g, ' ')
      .trim()
      .replace(/^user request:\s*/i, '')
      .replace(/^(write|create|generate|draft|compose|make|summarize|turn)\s+/i, '')
      .replace(/^(an?|the)\s+/i, '');

    const match = normalized.match(/\b(?:about|on|from|for|based on)\s+(.+)/i);
    const subject = (match?.[1] || normalized)
      .replace(/\b(attached|this|these)\s+(paper|document|file|files|screenshots?|images?)\b/gi, '')
      .replace(/\b(article|poem|summary|proposal|timeline|checklist|draft|document)\b/gi, '')
      .replace(/\bit'?s\b/gi, 'its')
      .replace(/\bof\s+and\b/gi, 'and')
      .replace(/\s+/g, ' ')
      .replace(/^(the|a|an)\s+/i, '')
      .replace(/\b(of|on|for|to|about|from|and)\s*$/i, '')
      .replace(/\s+/g, ' ')
      .trim();

    return subject.slice(0, 90);
  };

  const deriveCompactPromptTopic = (promptText = '') => {
    const subject = extractPromptSubject(promptText);
    if (!subject) {
      return '';
    }

    const cleaned = subject
      .replace(/\b(like you were writing|as if you were writing|like a|as a)\b.*$/i, '')
      .replace(/[,;:?]/g, ' ')
      .replace(/\s+/g, ' ')
      .trim();

    const words = cleaned.split(' ').filter(Boolean);
    if (!words.length) {
      return '';
    }

    return toTitleCase(words.slice(0, 6).join(' '));
  };

  const detectRequestedAction = ({ promptText = '', requestedFormat = '' }) => {
    const normalizedPrompt = String(promptText || '').toLowerCase();
    const normalizedFormat = String(requestedFormat || '').toLowerCase();

    if (/summari[sz]e|summary|condense|tl;dr/.test(normalizedPrompt)) {
      return 'Summary';
    }
    if (/poem|haiku|sonnet|verse/.test(normalizedPrompt)) {
      return 'Poem';
    }
    if (/article|essay|write up|writeup/.test(normalizedPrompt)) {
      return 'Article';
    }
    if (/outline|key points|bullet/.test(normalizedPrompt)) {
      return 'Outline';
    }
    if (/article/.test(normalizedFormat)) {
      return 'Article';
    }
    if (/proposal/.test(normalizedFormat)) {
      return 'Proposal';
    }
    if (/timeline/.test(normalizedFormat)) {
      return 'Timeline';
    }
    if (/checklist/.test(normalizedFormat)) {
      return 'Checklist';
    }
    if (/risk/.test(normalizedFormat)) {
      return 'Risk Review';
    }

    return 'Draft';
  };

  const isGenericGeneratedTitle = (value) => /^(compose draft|compose article|compose proposal|compose checklist|compose timeline|compose risk review|ai composed section|compose article)$/i.test(String(value || '').trim());

  const getDisplayDocTitle = (value) => compactDisplayTitle(value, 20) || 'Untitled draft';

  const deriveGeneratedDocumentTitle = ({ actionTitle = '', promptText = '', requestedFormat = '', attachmentContext = '' }) => {
    const currentTitle = String(actionTitle || '').trim();
    if (currentTitle && !isGenericGeneratedTitle(currentTitle) && currentTitle.length <= 28) {
      return currentTitle;
    }

    const sourceSummary = summarizeAttachmentContext(attachmentContext, promptText);
    const subject = extractPromptSubject(promptText);
  const compactTopic = deriveCompactPromptTopic(promptText);
    const sourceName = stripFileExtension(sourceSummary.fileNames[0] || '');
    const sourceTitle = toTitleCase(cleanSourceLabel(sourceName) || '');
    const requestedAction = detectRequestedAction({ promptText, requestedFormat });

    if (sourceTitle) {
      if (/summary/i.test(requestedAction)) {
        return `${sourceTitle} Summary`;
      }
      if (/outline/i.test(requestedAction)) {
        return `${sourceTitle} Outline`;
      }
      if (/checklist/i.test(requestedAction)) {
        return `${sourceTitle} Checklist`;
      }
      if (/timeline/i.test(requestedAction)) {
        return `${sourceTitle} Timeline`;
      }
      if (/proposal/i.test(requestedAction)) {
        return `${sourceTitle} Proposal`;
      }
      if (/findings?/i.test(subject)) {
        return `${sourceTitle} Findings`;
      }
      if (/implications?/i.test(subject)) {
        return `${sourceTitle} Implications`;
      }
      if (/analysis/i.test(subject)) {
        return `${sourceTitle} Analysis`;
      }
      if (/article/i.test(requestedAction)) {
        return `${sourceTitle} Article`;
      }
      return `${sourceTitle} ${requestedAction}`.trim();
    }

    const baseSubject = compactTopic || toTitleCase(subject || sourceName || 'Document');
    const baseTitle = `${baseSubject} ${requestedAction}`.trim();

    if (/summary/i.test(requestedAction) && sourceName) {
      return `${toTitleCase(stripFileExtension(sourceName))} Paper Summary`;
    }

    if (/article/i.test(requestedFormat)) {
      return baseTitle;
    }
    if (/proposal/i.test(requestedFormat)) {
      return baseTitle;
    }
    if (/timeline/i.test(requestedFormat)) {
      return baseTitle;
    }
    if (/checklist/i.test(requestedFormat)) {
      return baseTitle;
    }
    if (/risk/i.test(requestedFormat)) {
      return baseTitle;
    }

    return baseTitle;
  };

  const deriveGeneratedDocumentSubtitle = ({ promptText = '', requestedTone = 'normal', requestedLengthValue = 220, requestedLengthMode = 'words', attachmentContext = '' }) => {
    const sourceSummary = summarizeAttachmentContext(attachmentContext, promptText);
    if (sourceSummary.fileNames.length) {
      const sourceLabel = cleanSourceLabel(sourceSummary.fileNames[0] || sourceSummary.fileNames.join(', '));
      return `Based on ${sourceLabel || sourceSummary.fileNames.join(', ')} in a ${requestedTone} tone.`;
    }
    if (promptText.trim()) {
      return `Generated in ${requestedTone} tone with ~${requestedLengthValue} ${requestedLengthMode}.`;
    }
    return '';
  };

  const getPromptAttachmentBadge = (attachment) => {
    if (attachment?.isImage) {
      return 'IMG';
    }
    if ((attachment?.type || '').startsWith('audio/')) {
      return 'AUDIO';
    }
    if (isPdfAttachment(attachment)) {
      return 'PDF';
    }
    if (isTextLikeAttachment(attachment)) {
      return 'DOC';
    }
    return 'FILE';
  };

  const buildAttachmentContext = async (attachments = []) => {
    const limit = 6000;
    const blocks = [];

    for (const attachment of attachments.slice(0, 8)) {
      const name = String(attachment?.name || 'attachment');
      const mimeType = String(attachment?.mimeType || attachment?.type || 'application/octet-stream');
      const snippet = await extractAttachmentText(attachment);

      if (snippet) {
        blocks.push(`File: ${name} (${mimeType})\nExcerpt:\n${snippet.slice(0, limit)}`);
      } else {
        blocks.push(`File: ${name} (${mimeType})`);
      }
    }

    if (!blocks.length) {
      return '';
    }

    return `Source materials to ground the response in:\n${blocks.join('\n\n')}`;
  };

  const callGemini = async ({ userPrompt, systemPrompt, schema, attachments = [] }) => {
    try {
      setLastAiError('');
      const encodedAttachments = await encodePromptAttachments(attachments);
      const response = await fetch('/api/gemini', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          userPrompt,
          systemPrompt,
          schema,
          attachments: encodedAttachments,
        }),
      });

      const payload = await response.json().catch(() => ({}));
      if (!response.ok || !payload?.ok) {
        const reason = payload?.error || `HTTP ${response.status}`;
        setLastAiError(reason);
        return { error: reason };
      }

      const text = String(payload?.text || '').trim();
      if (!text) {
        const reason = 'Gemini returned an empty response.';
        setLastAiError(reason);
        return { error: reason };
      }

      if (!schema) {
        return { text, modelName: payload?.modelName || 'server-proxy' };
      }

      const parsed = payload?.parsed || parseJsonSafely(text);
      if (!parsed) {
        const reason = 'Gemini returned invalid JSON for the requested schema.';
        setLastAiError(reason);
        return { error: reason };
      }

      return {
        text,
        parsed,
        modelName: payload?.modelName || 'server-proxy',
      };
    } catch (_error) {
      const reason = 'Failed to reach /api/gemini. In local development, run via `vercel dev` or deploy to Vercel.';
      setLastAiError(reason);
      return { error: reason };
    }
  };

  const checkAiBackendStatus = async () => {
    try {
      setAiBackendStatus({ state: 'checking', message: 'Checking backend status...' });
      const response = await fetch('/api/ai-status');
      const payload = await response.json().catch(() => ({}));
      if (!response.ok || !payload?.ok) {
        const reason = payload?.error || `HTTP ${response.status}`;
        setAiBackendStatus({ state: 'error', message: reason });
        return;
      }

      if (payload.configured && payload.usable) {
        setAiBackendStatus({ state: 'ok', message: payload.reason || 'Backend key is configured and usable.' });
      } else if (payload.configured) {
        setAiBackendStatus({ state: 'error', message: payload.reason || 'Backend key is present but not usable.' });
      } else {
        setAiBackendStatus({ state: 'error', message: payload.reason || 'Backend is running, but GEMINI_API_KEY is missing.' });
      }
    } catch (_error) {
      setAiBackendStatus({ state: 'error', message: 'Could not reach /api/ai-status. Use `vercel dev` locally or deploy to Vercel.' });
    }
  };

  const memoryStats = useMemo(() => {
    const uploads = memoryEntries.filter((entry) => entry.type === 'upload').length;
    const exports = memoryEntries.filter((entry) => entry.type === 'export').length;
    const aiCalls = memoryEntries.filter((entry) => entry.type === 'ai').length;
    const automations = memoryEntries.filter((entry) => entry.type === 'automation').length;

    return {
      total: memoryEntries.length,
      uploads,
      exports,
      aiCalls,
      automations,
    };
  }, [memoryEntries]);

  const filteredMemoryEntries = useMemo(() => {
    const query = memorySearch.trim().toLowerCase();

    return memoryEntries.filter((entry) => {
      if (memoryFilter !== 'all' && entry.type !== memoryFilter) {
        return false;
      }

      if (!query) {
        return true;
      }

      const detailsText = Object.values(entry.details || {}).join(' ').toLowerCase();
      return entry.summary.toLowerCase().includes(query) || detailsText.includes(query);
    });
  }, [memoryEntries, memoryFilter, memorySearch]);

  const filteredPromptHistory = useMemo(() => {
    const query = promptHistorySearch.trim().toLowerCase();
    return promptHistory.filter((entry) => {
      if (promptHistoryFilter !== 'all' && entry.source !== promptHistoryFilter) {
        return false;
      }
      if (!query) {
        return true;
      }
      const metadata = `${entry.format || ''} ${entry.tone || ''}`.toLowerCase();
      return String(entry.text || '').toLowerCase().includes(query) || metadata.includes(query);
    });
  }, [promptHistory, promptHistoryFilter, promptHistorySearch]);

  const resolveDocTypeFromComposeFormat = (formatLabel) => {
    const normalized = String(formatLabel || '').toLowerCase();
    if (normalized.includes('timeline')) {
      return 'timeline';
    }
    if (normalized.includes('checklist') || normalized.includes('task')) {
      return 'tasks';
    }
    if (normalized.includes('risk')) {
      return 'risks';
    }
    return 'text';
  };

  const shouldStartNewComposition = ({ promptText, source, actionType }) => {
    const normalizedPrompt = String(promptText || '').toLowerCase();
    const explicitNewDoc = /(new\s+(composition|document|doc|page)|separate\s+(composition|document|doc|page)|another\s+(composition|document|doc|page)|start\s+fresh)/i.test(normalizedPrompt);
    const explicitSameDoc = /(same\s+(document|doc|page)|current\s+(document|doc|page)|this\s+(document|doc|page)|keep\s+here)/i.test(normalizedPrompt);

    if (explicitNewDoc) {
      return true;
    }

    if (explicitSameDoc) {
      return false;
    }

    const docHasMeaningfulContent = getPlainText(docBodyHtml).length > 120;
    const taskLikeAction = ['tasks', 'timeline', 'risks'].includes(String(actionType || '').toLowerCase());

    return source === 'chat' && taskLikeAction && docHasMeaningfulContent;
  };

  // Function to process AI prompt and generate structured output
  const handleAISubmit = async (promptText, options = {}) => {
    if (!promptText.trim()) return;

    const source = options.source || 'chat';
    const forceDocBuild = Boolean(options.forceDocBuild);
    const suppressChatEcho = Boolean(options.suppressChatEcho);
    const requestedFormat = options.composeFormat || 'Auto (Compose decides)';
    const shouldBuildDocument = forceDocBuild || source === 'compose';
    const selectionScoped = Boolean(options.selectionScoped);
    const smartActionKey = String(options.smartActionKey || '').toLowerCase();
    const preferredDocType = resolveDocTypeFromComposeFormat(requestedFormat);
    const requestedTone = String(options.tone || 'normal');
    const requestedLengthMode = String(options.lengthMode || 'words');
    const requestedLengthValue = Number(options.lengthValue || 220);
    const explicitLengthRequested = /(\b\d+\s*(?:words?|characters?|pages?|slides?)\b|\blimit\b|\blength\b|\bshort\b|\blong\b|\bconcise\b|\bbrief\b|\bexpand\b|\btune\b|\babout\b|\bapproximately\b|\broughly\b|\btarget\b)/i.test(String(promptText || ''));
    const lengthGuidance = explicitLengthRequested
      ? `Target ${requestedTone} tone and around ${requestedLengthValue} ${requestedLengthMode}.`
      : 'No explicit length limit was requested. Choose the natural length needed to complete the idea fully, and continue onto additional pages if necessary.';
    const requestAttachments = Array.isArray(options.attachments) ? options.attachments : [];
    const isDeckGeneration = productMode === 'deck' && source === 'chat';
    const requestedDeckSlideCount = (() => {
      const match = String(promptText || '').match(/(\d{1,2})\s*[- ]?\s*(?:slide|slides|page|pages)\b/i);
      return Math.max(1, Math.min(20, Number(match?.[1] || 10)));
    })();

    registerPromptHistory({
      text: promptText,
      source,
      format: requestedFormat,
      tone: requestedTone,
      lengthMode: requestedLengthMode,
      lengthValue: requestedLengthValue,
    });

    setIsComposing(true);
    trackMemoryAction('ai', 'Prompt sent to AI', {
      length: promptText.trim().length,
      mode: 'server',
      source,
      requestedFormat,
      tone: requestedTone,
      [`${requestedLengthMode}`]: requestedLengthValue,
    });

    if (!suppressChatEcho) {
      const userMsgId = Date.now();
      setChatMessages((prev) => [...prev, {
        id: userMsgId,
        sender: 'user',
        text: promptText,
      }]);
      setTimeout(() => chatEndRef.current?.scrollIntoView({ behavior: 'smooth' }), 50);
    }

    let aiResponseText = '';
    let docAction = null;
    let usedLiveModel = false;
    let liveModelError = '';
    let didGenerateDeckSlides = false;

    const actionSchema = {
      type: 'OBJECT',
      properties: {
        aiResponseText: { type: 'STRING' },
        hasAction: { type: 'BOOLEAN' },
        docAction: {
          type: 'OBJECT',
          properties: {
            title: { type: 'STRING' },
            type: { type: 'STRING' },
            deckSlides: {
              type: 'ARRAY',
              items: {
                type: 'OBJECT',
                properties: {
                  title: { type: 'STRING' },
                  subtitle: { type: 'STRING' },
                  headline: { type: 'STRING' },
                  blurb: { type: 'STRING' },
                  visualType: { type: 'STRING' },
                  layoutStyle: { type: 'STRING' },
                  motionCue: { type: 'STRING' },
                  keyMetric: { type: 'STRING' },
                  speakerNotes: { type: 'STRING' },
                  section: { type: 'STRING' },
                },
              },
            },
            timelineItems: {
              type: 'ARRAY',
              items: {
                type: 'OBJECT',
                properties: {
                  phase: { type: 'STRING' },
                  dates: { type: 'STRING' },
                  detail: { type: 'STRING' },
                },
              },
            },
            taskItems: {
              type: 'ARRAY',
              items: { type: 'STRING' },
            },
            riskItems: {
              type: 'ARRAY',
              items: {
                type: 'OBJECT',
                properties: {
                  threat: { type: 'STRING' },
                  impact: { type: 'STRING' },
                  fix: { type: 'STRING' },
                },
              },
            },
            textParagraph: { type: 'STRING' },
          },
        },
      },
    };

    const attachmentContext = requestAttachments.length
      ? await buildAttachmentContext(requestAttachments)
      : '';
    const groundedPrompt = attachmentContext
      ? `${promptText}\n\n${attachmentContext}`
      : promptText;
    const composeFallbackAction = buildComposeFallbackAction({
      promptText,
      requestedFormat,
      preferredDocType,
      attachmentContext,
      requestedTone,
      requestedLengthValue,
      requestedLengthMode,
    });

    const looksGenericResponse = (value) => {
      const normalized = String(value || '').trim().toLowerCase();
      return !normalized || normalized === 'composed with live ai.' || normalized === 'composed with live ai' || normalized === 'ai response' || normalized === 'generated in normal tone with ~220 words.';
    };

    const systemPrompt = isDeckGeneration
      ? `You are Compose AI generating a full presentation deck. Return JSON only.
Context title: ${deckTitle || 'Untitled deck'}.
Requested output format: ${requestedFormat}.
Tone style: ${requestedTone}.
Length target: around ${requestedLengthValue} ${requestedLengthMode}.
Required slide count: ${requestedDeckSlideCount}.
Rules:
- Always set hasAction=true.
- Set docAction.type="deck".
- Provide docAction.title and docAction.deckSlides with exactly ${requestedDeckSlideCount} slides.
- Each slide must include: title, subtitle, headline, blurb, visualType, layoutStyle, motionCue.
- Add keyMetric when data exists and speakerNotes when persuasion context is needed.
- Include section labels aligned to this narrative flow: Opening, Problem, Opportunity, Product, Market, Strategy, Financials, Closing.
- Headline should be punchy and brief. Blurb should be 1-3 concise sentences.
- If attachments contain source material, inspect them first and transform their specific details into slide content.
- Never respond with generic filler when source material exists.
- Prioritize visual outputs over dense text. Do not return plain paragraphs as the primary output.
Process you MUST follow before creating slides:
1) Ingest uploaded materials and user prompt.
2) Extract goals, themes, hierarchy, key metrics, key arguments, and audience context.
3) Create presentation strategy with slide sequence, pacing, narrative arc, and information hierarchy.
4) Generate slides with titles, summaries, layouts, charts/timelines/diagrams/visuals.
5) Apply adaptive design system (typography, spacing, branding, colors, visual hierarchy).
6) Assign motion/animation cues (fade/reveal/stagger/progressive/cinematic transitions).`
      : `You are Compose AI. Return JSON only.
Context title: ${docTitle || 'Untitled'}.
Context subtitle: ${docSubtitle || 'No subtitle'}.
Requested output format: ${requestedFormat}.
Preferred doc action type: ${preferredDocType}.
Tone style: ${requestedTone}.
    Length guidance: ${lengthGuidance}
Rules:
- If the input comes from Compose canvas prompt, always set hasAction=true and provide docAction that can be inserted into the main document immediately.
- docAction.type must be one of: timeline, tasks, risks, text.
- Prefer using the requested output format and preferred doc action type.
- If attachments are present, ground the document in the attachment details and do not ignore them.
- Use the attachment context to write a real document, not a placeholder or generic acknowledgment.
- Never return "Composed with live AI" or any other filler when source material exists.
- For chat-only questions, hasAction can be false and provide aiResponseText only.
- Preserve paragraph structure for text outputs using meaningful line breaks.
- Keep aiResponseText concise, actionable, and specific.
- Do not simulate placeholders. Produce useful output.`;

    try {
      const modelResponse = await callGemini({
        userPrompt: groundedPrompt,
        systemPrompt,
        schema: actionSchema,
        attachments: requestAttachments,
      });

      liveModelError = String(modelResponse?.error || '');

      if (modelResponse?.parsed) {
        usedLiveModel = true;
        const result = modelResponse.parsed;
        aiResponseText = result.aiResponseText?.trim() || (result.docAction?.textParagraph ? String(result.docAction.textParagraph).trim() : (isDeckGeneration ? 'Deck AI is designing your slides.' : ''));

        if (result.hasAction && result.docAction) {
          const rawType = String(result.docAction.type || '').toLowerCase();
          if (rawType === 'deck' && Array.isArray(result.docAction.deckSlides) && result.docAction.deckSlides.length) {
            const generatedSlides = result.docAction.deckSlides
              .map((slide, index) => {
                const nextId = index + 1;
                const preset = DECK_DESIGN_PRESETS[index % DECK_DESIGN_PRESETS.length] || DECK_DESIGN_PRESETS[0];
                return {
                  id: nextId,
                  title: String(slide?.title || `Slide ${nextId}`),
                  subtitle: String(slide?.subtitle || ''),
                  accent: 'from-violet-500 to-indigo-600',
                  designPresetKey: preset.key,
                  headline: String(slide?.headline || slide?.title || `Slide ${nextId}`),
                  blurb: String(slide?.blurb || slide?.subtitle || ''),
                  visualType: String(slide?.visualType || 'hero statement'),
                  layoutStyle: String(slide?.layoutStyle || 'cinematic split'),
                  motionCue: String(slide?.motionCue || 'Soft fade and stagger reveal'),
                  keyMetric: String(slide?.keyMetric || ''),
                  speakerNotes: String(slide?.speakerNotes || ''),
                  section: String(slide?.section || ''),
                  footer: 'Original design 繚 Editable',
                };
              })
              .slice(0, 20);
            const normalizedSlides = buildDeckSlidesFallback({
              promptText,
              aiText: result.aiResponseText || '',
              sourceSlides: generatedSlides,
            });

            if (normalizedSlides.length) {
              setDeckSlidesData(normalizedSlides);
              setActiveDeckSlideId(normalizedSlides[0].id);
              didGenerateDeckSlides = true;
              aiResponseText = result.aiResponseText?.trim() || `Created ${normalizedSlides.length} slides from your request.`;
              showToast(`Generated ${normalizedSlides.length} slides`);
            }
          } else if (rawType === 'timeline' && Array.isArray(result.docAction.timelineItems) && result.docAction.timelineItems.length) {
            docAction = {
              title: result.docAction.title || 'AI Timeline',
              type: 'timeline',
              content: result.docAction.timelineItems,
            };
          } else if (rawType === 'tasks' && Array.isArray(result.docAction.taskItems) && result.docAction.taskItems.length) {
            const sanitizedTasks = result.docAction.taskItems.filter(Boolean).map((item) => String(item));
            docAction = {
              title: result.docAction.title || 'AI Checklist',
              type: 'tasks',
              content: sanitizedTasks,
            };
            const syncedTasks = sanitizedTasks.map((task, index) => ({
              id: Date.now() + index,
              text: task,
              completed: false,
              owner: 'agent',
            }));
            setTasks((prev) => [...prev, ...syncedTasks]);
          } else if (rawType === 'risks' && Array.isArray(result.docAction.riskItems) && result.docAction.riskItems.length) {
            docAction = {
              title: result.docAction.title || 'AI Risk Matrix',
              type: 'risks',
              content: result.docAction.riskItems,
            };
          } else if (rawType === 'text' && result.docAction.textParagraph) {
            docAction = {
              title: result.docAction.title || 'AI Composed Section',
              type: 'text',
              paragraph: result.docAction.textParagraph,
            };
          }
        }

        if (isDeckGeneration && !didGenerateDeckSlides) {
          const parsedFromAiResponse = parseJsonSafely(result.aiResponseText || '');
          const recoveredSlides = Array.isArray(parsedFromAiResponse?.docAction?.deckSlides)
            ? parsedFromAiResponse.docAction.deckSlides
            : [];
          const fallbackSlides = buildDeckSlidesFallback({
            promptText,
            aiText: result.aiResponseText || result.docAction?.textParagraph || modelResponse?.text,
            sourceSlides: Array.isArray(result?.docAction?.deckSlides) && result.docAction.deckSlides.length
              ? result.docAction.deckSlides
              : recoveredSlides,
          });
          if (fallbackSlides.length) {
            setDeckSlidesData(fallbackSlides);
            setActiveDeckSlideId(fallbackSlides[0].id);
            didGenerateDeckSlides = true;
            aiResponseText = `Deck AI designed ${fallbackSlides.length} slide${fallbackSlides.length > 1 ? 's' : ''} from your request.`;
            showToast(`Designed ${fallbackSlides.length} slide${fallbackSlides.length > 1 ? 's' : ''}`);
          }
        }

        if (shouldBuildDocument && !docAction) {
          docAction = composeFallbackAction;
        }
      }
    } catch (_error) {
      usedLiveModel = false;
    }

    const needsAttachmentRescue = shouldBuildDocument
      && requestAttachments.length > 0
      && (
        looksGenericResponse(aiResponseText)
        || !docAction
        || (docAction?.type === 'text' && looksGenericResponse(docAction?.paragraph || ''))
      );

    if (needsAttachmentRescue) {
      const rescueResponse = await callGemini({
        userPrompt: `${promptText}\n\nUse attached files as the primary source. Write the final document content only.`,
        systemPrompt: `You are Compose AI in fallback mode.\n- Read uploaded files first.\n- Produce plain text only (no JSON, no markdown fences).\n- Be specific to the source material.\n- Avoid generic placeholders.\n- ${lengthGuidance}`,
        attachments: requestAttachments,
      });

      const rescueText = String(rescueResponse?.text || '').trim();
      if (rescueText && !looksGenericResponse(rescueText)) {
        aiResponseText = rescueText;
        docAction = {
          title: deriveGeneratedDocumentTitle({
            actionTitle: '',
            promptText,
            requestedFormat,
            attachmentContext,
          }),
          type: 'text',
          paragraph: rescueText,
        };
        usedLiveModel = true;
      }
    }

    if (!usedLiveModel) {
      const failureReason = liveModelError || lastAiError || 'Check Vercel server env GEMINI_API_KEY, billing, and model access.';
      aiResponseText = composeFallbackAction.paragraph || `Live AI request failed. ${failureReason}`;
      trackMemoryAction('ai', 'Live AI request failed', {
        reason: failureReason,
      });
    }

    if (looksGenericResponse(aiResponseText) && shouldBuildDocument) {
      docAction = composeFallbackAction;
      aiResponseText = composeFallbackAction.paragraph || aiResponseText;
    }

    setIsComposing(false);

    const actionSectionId = docAction
      ? `sec_${Date.now()}_${Math.floor(Math.random() * 1000)}`
      : null;

    if (!suppressChatEcho || !docAction) {
      setChatMessages((prev) => [...prev, {
        id: Date.now() + 1,
        sender: 'ai',
        text: aiResponseText,
        type: docAction ? 'action_completed' : 'standard',
        actionTitle: docAction?.title,
        actionSectionId,
      }]);
    }

    if (docAction) {
      const derivedTitle = deriveGeneratedDocumentTitle({
        actionTitle: docAction.title,
        promptText,
        requestedFormat,
        attachmentContext,
      });
      const derivedSubtitle = deriveGeneratedDocumentSubtitle({
        promptText,
        requestedTone,
        requestedLengthValue,
        requestedLengthMode,
        attachmentContext,
      });
      const finalizedAction = { ...docAction, title: derivedTitle, sectionId: actionSectionId };
      if (shouldBuildDocument) {
        const targetedText = finalizedAction.type === 'text'
          ? String(finalizedAction.paragraph || '').replace(/\n{2,}/g, '\n\n')
          : aiResponseText;
        const shouldRenderOutlineHtml = finalizedAction.type === 'text'
          && (smartActionKey === 'outline' || /\boutline\b/i.test(promptText));
        const shouldInjectOutlineHtml = selectionScoped && shouldRenderOutlineHtml;
        const selectionPayload = shouldInjectOutlineHtml
          ? toOutlineHtml(targetedText)
          : targetedText;
        const injectedToSelection = selectionScoped && injectIntoSavedSelection(selectionPayload, {
          injectAsHtml: shouldInjectOutlineHtml,
        });

        if (injectedToSelection && shouldInjectOutlineHtml) {
          setLeftSidebarOpen(true);
          setTimeout(() => {
            computeDocumentOutline();
          }, 0);
        }

        if (!injectedToSelection) {
          const spawnNewComposition = shouldStartNewComposition({
            promptText,
            source,
            actionType: finalizedAction.type,
          });

          if (spawnNewComposition) {
            createNewComposition({ silent: true });
          }

          const shouldReplaceDocumentChrome = source === 'compose' && !selectionScoped && finalizedAction.type === 'text';
          const composedHtml = shouldRenderOutlineHtml
            ? toOutlineHtml(targetedText)
            : shouldReplaceDocumentChrome
              ? toParagraphHtml(finalizedAction.paragraph || '')
              : renderDocActionHtml(finalizedAction);
          const renderedHtml = !selectionScoped && finalizedAction.type === 'text'
            ? paginateGeneratedHtml(composedHtml)
            : composedHtml;
          setIsBlankDocument(true);
          setAppendedSections([]);
          setDocBodyHtml(renderedHtml);
          setDictationOffset({ x: 0, y: 0 });
          if (shouldReplaceDocumentChrome || !docTitle?.trim() || docTitle === AI_NATIVE_PLACEHOLDER || docTitle === defaultTitle) {
            setDocTitle(finalizedAction.title?.replace(/^[\\s\\?]+/, '') || 'Compose Draft');
          }
          if (shouldReplaceDocumentChrome) {
            setDocSubtitle(derivedSubtitle || '');
          } else if (!docSubtitle?.trim() || docSubtitle === AI_NATIVE_PLACEHOLDER || docSubtitle === defaultSubtitle) {
            setDocSubtitle(derivedSubtitle || `Generated in ${requestedTone} tone with ~${requestedLengthValue} ${requestedLengthMode}.`);
          }
          if (spawnNewComposition) {
            showToast(`Opened a new composition for ${finalizedAction.type} output`);
          }
          if (shouldRenderOutlineHtml) {
            setLeftSidebarOpen(true);
            setTimeout(() => {
              computeDocumentOutline();
            }, 0);
          }
        }
      } else {
        setIsBlankDocument(false);
        setAppendedSections((prev) => [...prev, finalizedAction]);
      }
      showToast(`Composed: ${docAction.title} injected into document!`);
      trackMemoryAction('automation', 'AI injected section', {
        section: docAction.title,
        sectionId: actionSectionId,
      });
    }

    trackMemoryAction('ai', 'AI response generated', {
      usedLiveModel,
    });

    setTimeout(() => chatEndRef.current?.scrollIntoView({ behavior: 'smooth' }), 50);
  };

  const handleSidebarSend = (e) => {
    e.preventDefault();
    if (!chatInput.trim() && !chatAttachments.length) return;
    const prompt = chatInput.trim() || 'Use attached files as context and answer the request.';
    handleAISubmit(prompt, { source: 'chat', attachments: chatAttachments });
    setChatInput('');
    setChatAttachments([]);
  };

  const handleAssistantQuickPromptSend = (event) => {
    event.preventDefault();
    const prompt = assistantQuickPrompt.trim();
    if (!prompt || isComposing) {
      return;
    }
    if (productMode === 'deck') {
      const deckPrompt = `${prompt}\n\nDeck Assistant mode: produce visual-first slide output with narrative pacing, clear hierarchy, and speaker notes where useful.`;
      handleAISubmit(deckPrompt, {
        source: 'chat',
        tone: promptTone,
        lengthMode: promptLengthMode,
        lengthValue: promptLengthValue,
        attachments: promptAttachments,
      });
      setRightSidebarOpen(true);
      setActiveRightTab('assistant');
    } else {
      handleAISubmit(prompt, { source: 'chat' });
    }
    setAssistantQuickPrompt('');
  };

  const runSmartAssistAction = (instruction, actionMeta = {}) => {
    const requestedSelectionScope = actionMeta.selectionScoped !== undefined
      ? Boolean(actionMeta.selectionScoped)
      : undefined;
    const actionKey = String(actionMeta.actionKey || '').toLowerCase();
    const requestedOutlineLevels = Math.max(2, Math.min(4, Number(actionMeta.outlineLevels || outlineLevels || 3) || 3));

    if (productMode === 'deck') {
      const deckPrompt = `${instruction}\n\nCreate or refine a cinematic deck structure with stronger visual hierarchy, audience fit, and pacing. Include clear visual direction per slide.`;
      setRightSidebarOpen(true);
      setActiveRightTab('assistant');
      showToast('Deck Assistant is generating visual output...');
      handleAISubmit(deckPrompt, {
        source: 'chat',
        tone: promptTone,
        lengthMode: promptLengthMode,
        lengthValue: promptLengthValue,
        attachments: promptAttachments,
      });
      return;
    }

    if (productMode === 'compose' && actionKey === 'title-headers') {
      applyGeneratedTitleAndHeadings();
      return;
    }

    if (productMode === 'compose' && (actionKey === 'create-outline' || actionKey === 'outline')) {
      const selectedScope = selectedEditorTextRef.current || selectedEditorText;
      const hasSelection = requestedSelectionScope !== undefined ? requestedSelectionScope : Boolean(selectedScope);
      const outlinePrompt = hasSelection
        ? `Create a structured outline from this selected text. Use concise headings and nested bullets where useful. Keep headings short and clear. Target up to ${requestedOutlineLevels} heading levels.\n\nSelected text:\n"""${selectedScope}"""`
        : `${instruction}\n\nCreate a structured outline from the current document with concise headings and nested bullets where useful. Keep headings short and clear. Target up to ${requestedOutlineLevels} heading levels.`;

      setRightSidebarOpen(false);
      setActiveRightTab('assistant');
      showToast('Compose AI is generating an outline...');
      handleAISubmit(outlinePrompt, {
        source: hasSelection ? 'compose' : 'chat',
        forceDocBuild: true,
        suppressChatEcho: true,
        composeFormat: 'Plain Text',
        selectionScoped: hasSelection,
        smartActionKey: 'outline',
        tone: promptTone,
        lengthMode: promptLengthMode,
        lengthValue: promptLengthValue,
      });
      return;
    }

    const selectedScope = selectedEditorTextRef.current || selectedEditorText;
    const hasSelection = requestedSelectionScope !== undefined ? requestedSelectionScope : Boolean(selectedScope);
    const scopedPrompt = hasSelection
      ? `${instruction}\n\nRefine ONLY this selected excerpt and preserve intent:\n"""${selectedScope}"""\n\nIf you are producing an outline, return clear section headings with bullets under each heading.`
      : `${instruction}\n\nUse the current document context and provide a directly usable rewrite.`;

    setRightSidebarOpen(false);
    setActiveRightTab('assistant');
    showToast('Smart Assist is running...');

    handleAISubmit(scopedPrompt, {
      source: hasSelection ? 'compose' : 'chat',
      forceDocBuild: hasSelection,
      suppressChatEcho: false,
      composeFormat: hasSelection ? 'Plain Text' : 'Auto (Compose decides)',
      selectionScoped: hasSelection,
      smartActionKey: actionKey,
      tone: promptTone,
      lengthMode: promptLengthMode,
      lengthValue: promptLengthValue,
    });
  };

  const handleFloatingSend = (e) => {
    e.preventDefault();
    if (isComposing) return;
    if (!floatingPrompt.trim() && !promptAttachments.length) return;
    const formatLabel = composeOutputFormat === 'Custom...'
      ? (customComposeFormat.trim() || 'Custom Document')
      : composeOutputFormat;
    const selectedScope = selectedEditorTextRef.current || selectedEditorText;
    const fallbackPrompt = promptAttachments.length
      ? `Use attached files as source context and generate the requested output.`
      : '';
    const scopedInstruction = selectedScope
      ? `Modify ONLY the selected excerpt below. Do not rewrite unrelated sections.\nSelected excerpt:\n"""${selectedScope}"""\n\nUser request: ${floatingPrompt.trim() || fallbackPrompt}`
      : (floatingPrompt.trim() || fallbackPrompt);
    const composeOptions = {
      source: 'compose',
      forceDocBuild: true,
      suppressChatEcho: true,
      composeFormat: formatLabel,
      tone: promptTone,
      lengthMode: promptLengthMode,
      lengthValue: promptLengthValue,
      selectionScoped: Boolean(selectedScope),
      attachments: promptAttachments,
    };
    handleAISubmit(scopedInstruction, composeOptions);
    setLastComposeRun({
      prompt: scopedInstruction,
      options: composeOptions,
      documentId: activeDocId,
      preSnapshot: buildSnapshot(),
      createdAt: Date.now(),
    });
    setFloatingPrompt('');
    setSelectedEditorText('');
    selectedEditorTextRef.current = '';
  };

  const handleFloatingPaste = (event) => {
    const clipboard = event.clipboardData;
    if (!clipboard) {
      return;
    }

    const items = Array.from(clipboard.items || []);
    const files = items
      .filter((item) => item.kind === 'file')
      .map((item) => item.getAsFile())
      .filter(Boolean);

    if (files.length) {
      event.preventDefault();
      attachFilesToPrompt(files);
      showToast(`Attached ${files.length} item${files.length > 1 ? 's' : ''} from clipboard`);
      return;
    }

    const pastedText = clipboard.getData('text');
    if (pastedText) {
      setFloatingPrompt((prev) => `${prev}${prev ? ' ' : ''}${pastedText}`.trimStart());
      trackMemoryAction('upload', 'Pasted text into compose prompt', {
        length: pastedText.length,
      });
    }
  };

  const recordChatFeedback = (message, feedbackType, comment = '') => {
    trackMemoryAction('feedback', 'Chat feedback submitted', {
      messageId: String(message.id),
      feedbackType,
      comment,
    });
  };

  const retryMessageAction = (message) => {
    if (!message) {
      return;
    }

    if (message.sender === 'user') {
      handleAISubmit(message.text);
      recordChatFeedback(message, 'retry');
      return;
    }

    const index = chatMessages.findIndex((msg) => msg.id === message.id);
    const previousUser = [...chatMessages.slice(0, index)].reverse().find((msg) => msg.sender === 'user');
    if (previousUser) {
      handleAISubmit(previousUser.text);
      recordChatFeedback(message, 'retry_previous_prompt');
    }
  };

  const undoMessageAction = (message) => {
    if (!message?.actionSectionId) {
      showToast('No linked action to undo');
      return;
    }

    setAppendedSections((prev) => prev.filter((section) => section.sectionId !== message.actionSectionId));
    recordChatFeedback(message, 'undo_action');
    showToast('Undid AI section injection');
  };

  const deleteMessageAction = (message) => {
    setChatMessages((prev) => prev.filter((msg) => msg.id !== message.id));
    recordChatFeedback(message, 'delete_message');
  };

  const ensureMicrophonePermission = async () => {
    if (micPermissionGrantedRef.current) {
      return true;
    }

    if (!navigator.mediaDevices?.getUserMedia) {
      throw new Error('media-devices-unsupported');
    }

    if (navigator.permissions?.query) {
      try {
        const permissionStatus = await navigator.permissions.query({ name: 'microphone' });
        if (permissionStatus.state === 'granted') {
          micPermissionGrantedRef.current = true;
          return true;
        }
        if (permissionStatus.state === 'denied') {
          throw new Error('microphone-denied');
        }
      } catch (_error) {
        if (String(_error?.message || '').includes('microphone-denied')) {
          throw _error;
        }
        // Some browsers do not support querying microphone permissions.
      }
    }

    const stream = await navigator.mediaDevices.getUserMedia({ audio: true });
    stream.getTracks().forEach((track) => track.stop());
    micPermissionGrantedRef.current = true;
    return true;
  };

  const toggleVoiceRecording = async (targetMode = voiceTarget) => {
    if (!speechSupported) {
      showToast('Speech recognition is not supported in this browser');
      return;
    }

    const nextTarget = targetMode || 'compose';
    setVoiceTarget(nextTarget);
    voiceTargetRef.current = nextTarget;
    setHasVoiceInteraction(true);
    if (nextTarget === 'compose') {
      setIsPromptDismissed(false);
      setIsPromptExpanded(true);
      setIsPromptAutoVisible(true);
    }

    if (isVoiceActive) {
      // If a different voice surface is requested, restart with the new target.
      if (voiceTarget !== nextTarget) {
        try {
          speechRecognitionRef.current?.stop();
        } catch (_error) {
          // noop
        }
        setIsVoiceActive(false);
      } else {
        try {
          speechRecognitionRef.current?.stop();
        } catch (_error) {
          // noop
        }
        if (mockDictationTimeoutRef.current) {
          clearTimeout(mockDictationTimeoutRef.current);
          mockDictationTimeoutRef.current = null;
        }
        if (mockIntervalRef.current) {
          clearInterval(mockIntervalRef.current);
          mockIntervalRef.current = null;
        }
        interimTranscriptRef.current = '';
        setIsVoiceActive(false);
        showToast('Voice transcription stopped');
        return;
      }
    }

    if (isMicMuted) {
      setIsMicMuted(false);
    }

    try {
      await ensureMicrophonePermission();
      const recognition = speechRecognitionRef.current;
      if (!recognition) {
        showToast('Voice engine is initializing. Please tap mic again in a moment.');
        return;
      }

      recognition.lang = resolveSpeechLocale(currentLanguage);
      try {
        recognition.start();
      } catch (startError) {
        const startName = String(startError?.name || '').toLowerCase();
        if (startName.includes('invalidstate')) {
          try {
            recognition.stop();
          } catch (_stopError) {
            // noop
          }
          setTimeout(() => {
            try {
              recognition.start();
            } catch (_retryError) {
              setIsVoiceActive(false);
              showToast('Microphone could not restart. Please tap once more.');
            }
          }, 120);
        } else {
          throw startError;
        }
      }
      showToast('Voice transcription started');

      if (mockDictationTimeoutRef.current) {
        clearTimeout(mockDictationTimeoutRef.current);
      }
      // Match attached behavior: fallback simulate if sandbox blocks real mic input.
      mockDictationTimeoutRef.current = setTimeout(() => {
        const noRealTranscript = !interimTranscriptRef.current.trim() && !pendingInterimTranscriptRef.current.trim();
        if (isVoiceActiveRef.current && voiceTargetRef.current === 'document' && noRealTranscript && !mockIntervalRef.current) {
          showToast('No live mic input yet. Switching to fallback dictation.');
          const phrases = [''];
          const fullText = phrases.join('');
          let currentIndex = 0;
          mockIntervalRef.current = setInterval(() => {
            if (!isVoiceActiveRef.current || isMicMutedRef.current) {
              clearInterval(mockIntervalRef.current);
              mockIntervalRef.current = null;
              return;
            }
            currentIndex += Math.floor(Math.random() * 3) + 2;
            if (currentIndex > fullText.length) {
              currentIndex = fullText.length;
            }
            const chunk = fullText.substring(0, currentIndex).trim();
            interimTranscriptRef.current = chunk;
            setLiveSpeechInterimText(chunk);
            if (currentIndex === fullText.length) {
              clearInterval(mockIntervalRef.current);
              mockIntervalRef.current = null;
              setTimeout(() => {
                if (isVoiceActiveRef.current && chunk) {
                  insertTranscriptIntoDocumentRef.current?.(chunk, { forceAppendToEnd: true });
                }
                interimTranscriptRef.current = '';
                setLiveSpeechInterimText('');
                setIsVoiceActive(false);
              }, 1000);
            }
          }, 40);
        }
      }, 2500);
    } catch (_error) {
      setIsVoiceActive(false);
      const errorName = String(_error?.name || '').toLowerCase();
      const errorMessage = String(_error?.message || '').toLowerCase();
      const isPermissionIssue = errorName.includes('notallowed')
        || errorName.includes('permission')
        || errorMessage.includes('microphone-denied');
      if (isPermissionIssue) {
        showToast('Microphone access is blocked. Please allow access in browser settings.');
      } else {
        showToast('Microphone could not start right now. Please tap mic again.');
      }
    }
  };

  const toggleMicMute = () => {
    setIsMicMuted((prev) => {
      const next = !prev;
      if (next && isVoiceActive) {
        try {
          speechRecognitionRef.current?.stop();
        } catch (_error) {
          // noop
        }
        if (mockDictationTimeoutRef.current) {
          clearTimeout(mockDictationTimeoutRef.current);
          mockDictationTimeoutRef.current = null;
        }
        if (mockIntervalRef.current) {
          clearInterval(mockIntervalRef.current);
          mockIntervalRef.current = null;
        }
        interimTranscriptRef.current = '';
        setIsVoiceActive(false);
      }
      showToast(next ? 'Microphone muted' : 'Microphone unmuted');
      return next;
    });
  };

  const handlePromptAudioUpload = (event) => {
    const file = event.target.files?.[0];
    if (!file) {
      return;
    }

    attachFilesToPrompt([file]);
    trackMemoryAction('upload', 'Uploaded prompt audio', {
      name: file.name,
      size: file.size,
      mimeType: file.type,
    });
    showToast(`Audio attached: ${file.name}`);
  };

  // Click handler for Right Mini Sidebar
  const handleMiniSidebarClick = (tabKey) => {
    // If panel was maximized, un-maximize when switching
    if (rightPanelMaximized) setRightPanelMaximized(false);
    if (rightSidebarOpen && activeRightTab === tabKey) {
      setRightSidebarOpen(false);
    } else {
      setRightSidebarOpen(true);
      setActiveRightTab(tabKey);
    }
  };

  // Ensure only one of the left or right side panels is open at a time.
  useEffect(() => {
    if (leftSidebarOpen && rightSidebarOpen) {
      setRightSidebarOpen(false);
    }
  }, [leftSidebarOpen]);

  useEffect(() => {
    if (rightSidebarOpen && leftSidebarOpen) {
      setLeftSidebarOpen(false);
    }
  }, [rightSidebarOpen]);

  const formatMeetingElapsed = useCallback((startedAt) => {
    if (!startedAt) {
      return '00:00';
    }
    const seconds = Math.max(0, Math.floor((Date.now() - startedAt) / 1000));
    const mins = Math.floor(seconds / 60);
    const remaining = seconds % 60;
    return `${String(mins).padStart(2, '0')}:${String(remaining).padStart(2, '0')}`;
  }, []);

  const normalizeRoomCode = useCallback((value) => {
    const input = String(value || '').trim();
    if (!input) {
      return '';
    }
    if (/^https?:\/\//i.test(input)) {
      try {
        const parsed = new URL(input);
        const roomFromQuery = parsed.searchParams.get('room');
        if (roomFromQuery) {
          return roomFromQuery.trim().toLowerCase();
        }
        const cleanPath = parsed.pathname.split('/').filter(Boolean);
        if (cleanPath.length > 0) {
          return cleanPath[cleanPath.length - 1].trim().toLowerCase();
        }
      } catch (_error) {
        return input.toLowerCase();
      }
    }
    return input.replace(/\s+/g, '-').toLowerCase();
  }, []);

  const getMeetingLink = useCallback((code) => {
    const normalized = normalizeRoomCode(code || roomId || generateRoomCode());
    return `${window.location.origin}${window.location.pathname}?room=${normalized}`;
  }, [normalizeRoomCode, roomId]);

  const formatMeetingFileSize = useCallback((bytes) => {
    const value = Number(bytes) || 0;
    if (value <= 0) {
      return '0 KB';
    }
    if (value >= 1024 * 1024) {
      return `${(value / (1024 * 1024)).toFixed(1)} MB`;
    }
    return `${Math.max(1, Math.round(value / 1024))} KB`;
  }, []);

  const requestMediaPermissions = async () => {
    if (!navigator?.mediaDevices?.getUserMedia) {
      setMediaError(true);
      setIsRoomCameraOn(false);
      setIsRoomMicOn(false);
      showToast('Camera/Mic is not supported in this browser.');
      return false;
    }

    try {
      const stream = await navigator.mediaDevices.getUserMedia({
        video: true,
        audio: true,
      });
      setLocalStream(stream);
      setMediaError(false);
      setIsRoomCameraOn(true);
      setIsRoomMicOn(true);
      return true;
    } catch (err) {
      console.warn('Media access denied or unavailable', err);
      setMediaError(true);
      setIsRoomCameraOn(false);
      setIsRoomMicOn(false);
      showToast('Camera/Mic access denied. Please check browser permissions.');
      return false;
    }
  };

  const openMeetingSetup = async (code) => {
    const normalizedCode = normalizeRoomCode(code) || generateRoomCode();
    setRoomId(normalizedCode);
    setJoinCode(normalizedCode);
    setRoomState('ready');
    setMainView('document');
    setRoomPanelMode('docked');
    setActiveMeetingStageTab('room');
    setMeetingSummary(null);
    setMeetingStartedAt(null);
    setMeetingDurationLabel('00:00');
    await requestMediaPermissions();
    showToast(`Meeting ready: ${normalizedCode}`);
  };

  const startMeetingNow = (providedCode) => {
    const code = normalizeRoomCode(providedCode || roomId) || generateRoomCode();
    setRoomId(code);
    setJoinCode(code);
    setRoomState('active');
    setActiveMeetingStageTab('room');
    setMainView('room');
    setRoomPanelMode('expanded');
    setMeetingSummary(null);
    setMeetingStartedAt(Date.now());
    setMeetingDurationLabel('00:00');
    requestMediaPermissions();
    showToast(`Joined meeting: ${code}`);
  };

  const stopMediaStream = () => {
    if (localStream) {
      localStream.getTracks().forEach((track) => track.stop());
      setLocalStream(null);
    }
    if (screenShareStream) {
      screenShareStream.getTracks().forEach((track) => track.stop());
      setScreenShareStream(null);
    }
    setIsScreenSharing(false);
  };

  const generateRoomCode = () => {
    const chars = 'abcdefghijklmnopqrstuvwxyz';
    const getStr = (len) => Array.from({ length: len }, () => chars[Math.floor(Math.random() * chars.length)]).join('');
    return `${getStr(3)}-${getStr(4)}-${getStr(3)}`;
  };

  const joinRoom = async (code) => {
    await openMeetingSetup(code);
  };

  const leaveRoom = () => {
    const completedDuration = formatMeetingElapsed(meetingStartedAt);
    setMeetingSummary({
      roomCode: roomId,
      durationLabel: completedDuration,
      participantsCount: 4,
      decisions: [
        'Beta launch officially locked for May 15th.',
        'Marketing budget increased by 15% for initial push.',
      ],
      actionItems: [
        'Sarah to upload final assets by Friday.',
        'Alex to update Compose AI prompts.',
      ],
    });
    setMeetingDurationLabel(completedDuration);
    setRoomState('summary');
    setActiveMeetingStageTab('room');
    setMainView('document');
    setRoomPanelMode('docked');
    stopMediaStream();
    showToast('Left the meeting. AI generating summary...');
  };

  const handleCopyLink = async () => {
    const normalizedCode = normalizeRoomCode(roomId) || generateRoomCode();
    if (!roomId) {
      setRoomId(normalizedCode);
      setJoinCode(normalizedCode);
    }
    const link = getMeetingLink(normalizedCode);
    try {
      if (navigator.clipboard?.writeText) {
        await navigator.clipboard.writeText(link);
      } else {
        const textArea = document.createElement('textarea');
        textArea.value = link;
        document.body.appendChild(textArea);
        textArea.select();
        document.execCommand('copy');
        document.body.removeChild(textArea);
      }
      showToast(`Meeting link copied: ${link}`);
    } catch (_err) {
      showToast('Could not copy link automatically. Please copy from the invite bar.');
    }
  };

  const handleShareMeeting = async () => {
    const normalizedCode = normalizeRoomCode(roomId) || generateRoomCode();
    if (!roomId) {
      setRoomId(normalizedCode);
      setJoinCode(normalizedCode);
    }
    const link = getMeetingLink(normalizedCode);
    const title = 'Join my Regaarder meeting';
    if (navigator.share) {
      try {
        await navigator.share({ title, text: 'Join the call with this link', url: link });
        showToast('Meeting invitation shared');
        return;
      } catch (_error) {
        // Fall through to clipboard behavior.
      }
    }
    await handleCopyLink();
  };

  const inviteCollaborator = async () => {
    const invite = collaboratorInvite.trim();
    if (!invite) {
      showToast('Enter an email or collaborator name first.');
      return;
    }
    await handleShareMeeting();
    setCollaboratorInvite('');
    showToast(`Invitation prepared for ${invite}`);
  };

  const handleMeetingFileSelection = useCallback((files) => {
    const list = Array.from(files || []);
    if (!list.length) {
      return;
    }

    const entries = list.map((file, index) => {
      const baseName = (file?.name || `Shared File ${index + 1}`).replace(/\.[^.]+$/, '');
      const slideCount = Math.min(18, Math.max(6, Math.round((file?.size || 300000) / 90000)));
      return {
        id: `shared-${Date.now()}-${index}`,
        name: file?.name || `Shared File ${index + 1}`,
        baseName,
        type: file?.type || 'application/octet-stream',
        size: file?.size || 0,
        pages: slideCount,
        sharedBy: 'Joshua',
        sharedAt: new Date().toISOString(),
      };
    });

    setSharedMeetingFiles((prev) => [...entries, ...prev]);
    setActiveSharedMeetingFileId(entries[0].id);
    setActiveMeetingStageTab('files');
    showToast(`${entries.length} file${entries.length > 1 ? 's' : ''} shared in meeting`);
  }, []);

  const toggleRoomCamera = async () => {
    if (localStream && !mediaError) {
      const videoTrack = localStream.getVideoTracks()[0];
      if (videoTrack) {
        const nextEnabled = !videoTrack.enabled;
        videoTrack.enabled = nextEnabled;
        setIsRoomCameraOn(nextEnabled);
      }
    } else {
      const granted = await requestMediaPermissions();
      if (!granted) {
        return;
      }
    }
  };

  const toggleRoomMic = async () => {
    if (localStream && !mediaError) {
      const audioTrack = localStream.getAudioTracks()[0];
      if (audioTrack) {
        const nextEnabled = !audioTrack.enabled;
        audioTrack.enabled = nextEnabled;
        setIsRoomMicOn(nextEnabled);
      }
    } else {
      const granted = await requestMediaPermissions();
      if (!granted) {
        return;
      }
    }
  };

  const toggleScreenShare = async () => {
    if (isScreenSharing && screenShareStream) {
      screenShareStream.getTracks().forEach((track) => track.stop());
      setScreenShareStream(null);
      setIsScreenSharing(false);
      showToast('Screen sharing stopped');
      return;
    }

    try {
      const stream = await navigator.mediaDevices.getDisplayMedia({
        video: true,
        audio: false,
      });
      const [track] = stream.getVideoTracks();
      if (track) {
        track.onended = () => {
          setIsScreenSharing(false);
          setScreenShareStream(null);
          showToast('Screen sharing stopped');
        };
      }
      setScreenShareStream(stream);
      setIsScreenSharing(true);
      showToast('Screen sharing started');
    } catch (_err) {
      showToast('Screen share permission denied or unavailable.');
    }
  };

  useEffect(() => {
    if (roomState !== 'active' || !meetingStartedAt) {
      return undefined;
    }
    const interval = setInterval(() => {
      setMeetingDurationLabel(formatMeetingElapsed(meetingStartedAt));
    }, 1000);
    return () => clearInterval(interval);
  }, [roomState, meetingStartedAt, formatMeetingElapsed]);

  const activeSharedMeetingFile = useMemo(() => {
    if (!sharedMeetingFiles.length) {
      return null;
    }
    return sharedMeetingFiles.find((file) => file.id === activeSharedMeetingFileId) || sharedMeetingFiles[0];
  }, [sharedMeetingFiles, activeSharedMeetingFileId]);

  const handleRightSidebarTabsKeyDown = (event) => {
    if (event.key !== 'ArrowLeft' && event.key !== 'ArrowRight') {
      return;
    }

    event.preventDefault();
    const tabOrder = ['chat', 'assistant', 'tasks', 'calendar', 'room', 'people', 'memory'];
    const currentIndex = tabOrder.indexOf(activeRightTab);
    const safeIndex = currentIndex >= 0 ? currentIndex : 0;
    const nextIndex = event.key === 'ArrowRight'
      ? (safeIndex + 1) % tabOrder.length
      : (safeIndex - 1 + tabOrder.length) % tabOrder.length;

    setActiveRightTab(tabOrder[nextIndex]);
    setRightSidebarOpen(true);
  };

  useEffect(() => {
    if (didAutoJoinRoomRef.current) {
      return;
    }
    const meetingCode = new URLSearchParams(window.location.search).get('room');
    if (!meetingCode) {
      return;
    }
    didAutoJoinRoomRef.current = true;
    setActiveRightTab('room');
    joinRoom(meetingCode);
  }, []);

  const switchDocument = (docId) => {
    const targetDoc = documents.find((doc) => doc.id === docId);
    if (!targetDoc) {
      return;
    }

    setActiveDocId(docId);
    setDocTitle(targetDoc.title);
    setDocSubtitle(targetDoc.subtitle);
    setInitiatives(targetDoc.initiatives);
    setAppendedSections(targetDoc.appendedSections);
    setIsBlankDocument(targetDoc.isBlank);
    setDocBodyHtml(targetDoc.bodyHtml || '');
  };

  const createNewComposition = ({ silent = false } = {}) => {
    const newDoc = {
      id: Date.now() + Math.floor(Math.random() * 1000),
      title: '',
      subtitle: '',
      initiatives: [],
      appendedSections: [],
      isBlank: true,
      bodyHtml: '',
      pinned: false,
    };

    setDocuments((prev) => [...prev, newDoc]);
    setActiveDocId(newDoc.id);
    setDocTitle('');
    setDocSubtitle('');
    setIsBlankDocument(true);
    setAppendedSections([]);
    setInitiatives([]);
    setDocBodyHtml('');
    setLastComposeRun(null);
    setLeftSidebarOpen(true);
    trackMemoryAction('document', silent ? 'Created new blank composition (auto)' : 'Created new blank composition', {
      documentId: String(newDoc.id),
    });
    if (!silent) {
      showToast('Blank composition created');
    }
    return newDoc.id;
  };

  const openCreationPicker = () => {
    setCreationPickerOpen(true);
  };

  const createComposeExperience = () => {
    setCreationPickerOpen(false);
    setProductMode('compose');
    setLeftSidebarOpen(true);
    setActiveDocView('document');
    createNewComposition();
  };

  const createDeckExperience = () => {
    setCreationPickerOpen(false);
    setProductMode('deck');
    setDeckTitle('Untitled deck');
    setDeckSlidesData([createBlankDeckSlide(1)]);
    setActiveDeckSlideId(1);
    setDeckZoomLevel(100);
    setDeckToolbarFont('Inter');
    setDeckToolbarMenuOpen(false);
    setDeckContextRailTab('Design');
    setDeckPromptInput('');
    setDeckPromptMinimized(false);
    setDeckPromptChips(['Turn this into investor tone', 'Generate competitor comparison slide', 'Make this more visual', 'Reduce to 8 slides', 'Simplify for students']);
    setDeckCustomChip('');
    setDeckSlidesPanelOpen(true);
    setRightSidebarOpen(true);
    setActiveRightTab('assistant');
    showToast('Deck workspace ready');
  };

  const createSheetsExperience = () => {
    setCreationPickerOpen(false);
    setProductMode('sheets');
    setSheetsTitle('Q2 Financial Overview');
    setActiveSheetId(1);
    setDeckPromptInput('');
    setDeckPromptMinimized(false);
    setDeckPromptChips(['Analyze this data', 'Create pivot table', 'Forecast next quarter', 'Find anomalies', 'Compare to last year']);
    setDeckCustomChip('');
    setDeckSlidesPanelOpen(true);
    setRightSidebarOpen(true);
    setActiveRightTab('assistant');
    showToast('Sheets workspace ready');
  };

  const openLandingWorkspace = (destination) => {
    setCreationPickerOpen(false);

    if (destination === 'compose') {
      setActivePrimaryNav('drafts');
      createComposeExperience();
      return;
    }

    if (destination === 'deck') {
      setActivePrimaryNav('library');
      createDeckExperience();
      return;
    }

    if (destination === 'sheets') {
      setActivePrimaryNav('home');
      createSheetsExperience();
      return;
    }

    setProductMode('compose');
    setRightSidebarOpen(true);

    switch (destination) {
      case 'room':
        setActivePrimaryNav('home');
        setRoomState('lobby');
        setActiveRightTab('room');
        break;
      case 'tasks':
        setActivePrimaryNav('home');
        setActiveRightTab('tasks');
        break;
      case 'calendar':
        setActivePrimaryNav('home');
        setActiveRightTab('calendar');
        break;
      case 'people':
        setActivePrimaryNav('home');
        setActiveRightTab('people');
        break;
      case 'memory':
        setActivePrimaryNav('home');
        setActiveRightTab('memory');
        break;
      case 'chat':
        setActivePrimaryNav('inbox');
        setActiveRightTab('chat');
        break;
      case 'assistant':
      case 'more':
        setActivePrimaryNav('inbox');
        setActiveRightTab('assistant');
        break;
      default:
        setActiveRightTab('chat');
        break;
    }
  };

  const requestCloseDocument = (docId) => {
    setCloseConfirmDocId(docId);
    setOpenDocMenuId(null);
  };

  const confirmCloseDocument = () => {
    if (!closeConfirmDocId) {
      return;
    }

    const remaining = documents.filter((doc) => doc.id !== closeConfirmDocId);
    if (!remaining.length) {
      setCloseConfirmDocId(null);
      createNewComposition();
      return;
    }

    setDocuments(remaining);
    const nextActive = remaining[0];
    setCloseConfirmDocId(null);
    switchDocument(nextActive.id);
  };

  const openCreateWorkspaceModal = () => {
    setWorkspaceModalMode('create');
    setWorkspaceNameInput('');
    setEditingWorkspaceId(null);
    setWorkspaceModalOpen(true);
    setOpenWorkspaceMenuId(null);
  };

  const openRenameWorkspaceModal = (workspace) => {
    setWorkspaceModalMode('rename');
    setWorkspaceNameInput(workspace.name);
    setEditingWorkspaceId(workspace.id);
    setWorkspaceModalOpen(true);
    setOpenWorkspaceMenuId(null);
  };

  const submitWorkspaceModal = () => {
    const trimmed = workspaceNameInput.trim();
    if (!trimmed) {
      return;
    }

    if (workspaceModalMode === 'create') {
      const letter = trimmed.charAt(0).toUpperCase();
      setWorkspaces((prev) => [
        ...prev,
        {
          id: Date.now(),
          name: trimmed,
          letter,
          colorClass: 'bg-slate-500',
          hasDocuments: false,
        },
      ]);
      showToast(`Workspace ${trimmed} created`);
    } else if (editingWorkspaceId) {
      setWorkspaces((prev) =>
        prev.map((ws) =>
          ws.id === editingWorkspaceId
            ? { ...ws, name: trimmed, letter: trimmed.charAt(0).toUpperCase() }
            : ws,
        ),
      );
      showToast(`Workspace renamed to ${trimmed}`);
    }

    setWorkspaceModalOpen(false);
    setWorkspaceNameInput('');
    setEditingWorkspaceId(null);
  };

  const startRenameDocument = (doc) => {
    setRenamingDocId(doc.id);
    setRenameDocValue(doc.title?.trim() ? doc.title : '');
    setOpenDocMenuId(null);
  };

  const commitRenameDocument = (docId) => {
    const nextTitle = renameDocValue.trim();
    setDocuments((prev) => prev.map((doc) => (doc.id === docId ? { ...doc, title: nextTitle } : doc)));
    if (activeDocId === docId) {
      setDocTitle(nextTitle);
    }
    setRenamingDocId(null);
    setRenameDocValue('');
    showToast('Document renamed');
  };

  const beginUnsavedDraftRename = () => {
    const activeDoc = documents.find((doc) => doc.id === activeDocId);
    const currentName = (activeDoc?.title || docTitle || 'Unsaved draft').trim() || 'Unsaved draft';
    setUnsavedDraftNameInput(currentName);
    setIsEditingUnsavedDraftName(true);
  };

  const commitUnsavedDraftRename = () => {
    const nextTitle = unsavedDraftNameInput.trim();
    if (!nextTitle) {
      setIsEditingUnsavedDraftName(false);
      setUnsavedDraftNameInput('');
      return;
    }

    if (activeDocId) {
      setDocuments((prev) => prev.map((doc) => (doc.id === activeDocId ? { ...doc, title: nextTitle } : doc)));
    }
    setDocTitle(nextTitle);
    setIsEditingUnsavedDraftName(false);
    setUnsavedDraftNameInput('');
    showToast('Document renamed');
  };

  const getDocumentPayload = (docId = activeDocId) => {
    const fallback = {
      title: docTitle,
      subtitle: docSubtitle,
      initiatives,
      bodyHtml: docBodyHtml,
      appendedSections,
      isBlank: isBlankDocument,
    };

    if (!docId) {
      return fallback;
    }

    const target = documents.find((doc) => doc.id === docId);
    return target || fallback;
  };

  const sanitizeFileName = (value) => {
    const trimmed = (value || '').trim();
    const safe = trimmed.replace(/[<>:"/\\|?*]+/g, '-');
    return safe || 'composition';
  };

  const triggerBlobDownload = (filename, blob) => {
    const url = URL.createObjectURL(blob);
    const anchor = document.createElement('a');
    anchor.href = url;
    anchor.download = filename;
    document.body.appendChild(anchor);
    anchor.click();
    anchor.remove();
    URL.revokeObjectURL(url);
  };

  const exportCurrentDocumentAsPdf = async (forcedFileName) => {
    if (!documentCardRef.current) {
      showToast('Document is not ready for export yet');
      return false;
    }

    let printContainer = null;

    try {
      showToast('Generating PDF...');

      printContainer = document.createElement('div');
      printContainer.style.position = 'fixed';
      printContainer.style.left = '-99999px';
      printContainer.style.top = '0';
      printContainer.style.width = '850px';
      printContainer.style.background = '#ffffff';
      printContainer.style.padding = '24px';

      const clonedCard = documentCardRef.current.cloneNode(true);
      printContainer.appendChild(clonedCard);
      document.body.appendChild(printContainer);

      const canvas = await html2canvas(printContainer, {
        scale: 2,
        backgroundColor: '#ffffff',
        useCORS: true,
      });

      const imageData = canvas.toDataURL('image/png');
      const pdf = new jsPDF({ orientation: 'portrait', unit: 'mm', format: 'a4' });
      const pageWidth = pdf.internal.pageSize.getWidth();
      const pageHeight = pdf.internal.pageSize.getHeight();
      const imageProps = pdf.getImageProperties(imageData);
      const imageWidth = pageWidth;
      const imageHeight = (imageProps.height * imageWidth) / imageProps.width;

      let heightLeft = imageHeight;
      let position = 0;

      pdf.addImage(imageData, 'PNG', 0, position, imageWidth, imageHeight, undefined, 'FAST');
      heightLeft -= pageHeight;

      while (heightLeft > 0) {
        position = heightLeft - imageHeight;
        pdf.addPage();
        pdf.addImage(imageData, 'PNG', 0, position, imageWidth, imageHeight, undefined, 'FAST');
        heightLeft -= pageHeight;
      }

      const fileName = forcedFileName || `${sanitizeFileName(docTitle)}.pdf`;
      pdf.save(fileName);
      trackMemoryAction('export', 'Exported document', {
        format: 'PDF',
        fileName,
      });
      showToast('PDF exported successfully');
      return true;
    } catch (_error) {
      showToast('Unable to export PDF right now');
      return false;
    } finally {
      if (printContainer && printContainer.parentNode) {
        printContainer.parentNode.removeChild(printContainer);
      }
    }
  };

  const downloadDocumentInFormat = async (format, docId = activeDocId) => {
    const payload = getDocumentPayload(docId);
    const fileBase = sanitizeFileName(payload.title);

    if (format === 'PDF') {
      return exportCurrentDocumentAsPdf(`${fileBase}.pdf`);
    }

    if (format === 'Compose (.cmp)') {
      const blob = new Blob([JSON.stringify(payload, null, 2)], { type: 'application/json' });
      triggerBlobDownload(`${fileBase}.cmp`, blob);
      trackMemoryAction('export', 'Exported document', { format: 'Compose (.cmp)' });
      return true;
    }

    if (format === 'Markdown') {
      const markdown = `# ${payload.title || 'Untitled'}\n\n${payload.subtitle || ''}\n\n${(payload.initiatives || []).map((item) => `- ${item.name} (${item.timeline})`).join('\n')}\n`;
      triggerBlobDownload(`${fileBase}.md`, new Blob([markdown], { type: 'text/markdown' }));
      trackMemoryAction('export', 'Exported document', { format: 'Markdown' });
      return true;
    }

    if (format === 'Plain Text') {
      const plain = `${payload.title || 'Untitled'}\n\n${payload.subtitle || ''}`;
      triggerBlobDownload(`${fileBase}.txt`, new Blob([plain], { type: 'text/plain' }));
      trackMemoryAction('export', 'Exported document', { format: 'Plain Text' });
      return true;
    }

    if (format === 'DOC (Word-compatible)') {
      const docMarkup = `<html><head><meta charset="utf-8"/></head><body><h1>${payload.title || 'Untitled'}</h1><p>${payload.subtitle || ''}</p></body></html>`;
      triggerBlobDownload(`${fileBase}.doc`, new Blob([docMarkup], { type: 'application/msword' }));
      trackMemoryAction('export', 'Exported document', { format: 'DOC (Word-compatible)' });
      return true;
    }

    if (format === 'HTML') {
      const html = `<!doctype html><html><head><meta charset="utf-8"/></head><body>${payload.bodyHtml || ''}</body></html>`;
      triggerBlobDownload(`${fileBase}.html`, new Blob([html], { type: 'text/html' }));
      trackMemoryAction('export', 'Exported document', { format: 'HTML' });
      return true;
    }

    return false;
  };

  const openShareModal = (docId) => {
    const target = getDocumentPayload(docId);
    const base = `${window.location.origin}${window.location.pathname}`;
    setShareTargetDocId(docId);
    setShareTargetDocTitle(target.title?.trim() || 'Untitled composition');
    setShareDestination('friends');
    setShareFormat('Compose (.cmp)');
    setShareAccess('Viewer');
    setShareLink(`${base}?doc=${docId}&access=viewer`);
    closeTransientMenus();
    setRightSidebarOpen(false);
    setShareModalOpen(true);
    trackMemoryAction('share', 'Opened share modal', {
      documentId: String(docId),
    });
  };

  const handleShareModalConfirm = async () => {
    if (shareDestination === 'downloads') {
      const ok = await downloadDocumentInFormat(shareFormat, shareTargetDocId || activeDocId);
      if (ok) {
        trackMemoryAction('share', 'Shared to downloads', {
          format: shareFormat,
          access: shareAccess,
        });
        setShareModalOpen(false);
      }
      return;
    }

    if (shareDestination === 'apps') {
      try {
        if (navigator.share) {
          await navigator.share({
            title: shareTargetDocTitle,
            text: `Shared from Regaarder Compose (${shareAccess})`,
            url: shareLink,
          });
          trackMemoryAction('share', 'Shared via native app sheet', {
            access: shareAccess,
            format: shareFormat,
          });
          showToast('Shared to app successfully');
        } else {
          await navigator.clipboard.writeText(shareLink);
          showToast('Native app sharing not supported. Link copied instead.');
        }
      } catch (_error) {
        showToast('Sharing to app was cancelled or unavailable');
      }
      setShareModalOpen(false);
      return;
    }

    try {
      await navigator.clipboard.writeText(shareLink);
      trackMemoryAction('share', 'Copied share link', {
        access: shareAccess,
      });
      showToast(`Share link copied (${shareAccess})`);
    } catch (_error) {
      showToast('Could not copy link automatically');
    }
    setShareModalOpen(false);
  };

  const handleDocumentAction = (action, docId) => {
    if (action === 'rename') {
      const target = documents.find((doc) => doc.id === docId);
      if (target) {
        startRenameDocument(target);
      }
      return;
    }

    if (action === 'save') {
      saveDocumentLocally();
      setOpenDocMenuId(null);
      return;
    }

    if (action === 'share') {
      openShareModal(docId);
      setOpenDocMenuId(null);
      return;
    }

    if (action === 'pin') {
      setDocuments((prev) =>
        prev.map((doc) =>
          doc.id === docId
            ? {
                ...doc,
                pinned: !doc.pinned,
              }
            : doc,
        ),
      );
      setOpenDocMenuId(null);
      showToast('Pin state updated');
      return;
    }

    if (action === 'close') {
      requestCloseDocument(docId);
    }
  };

  const applyFormatCommand = (command, value) => {
    let range = getEditorSelectionRange();

    if (!range && restoreSavedSelection()) {
      range = getEditorSelectionRange();
    }

    if (!range) {
      blankBodyRef.current?.focus();
      return;
    }

    if (command === 'fontSize') {
      const parsedSize = Number(value);
      const safeSize = Number.isFinite(parsedSize) ? Math.min(72, Math.max(10, parsedSize)) : editorSize;
      document.execCommand('styleWithCSS', false, true);
      document.execCommand('fontSize', false, '7');
      if (blankBodyRef.current) {
        const fontNodes = blankBodyRef.current.querySelectorAll('font[size="7"]');
        fontNodes.forEach((node) => {
          node.removeAttribute('size');
          node.style.fontSize = `${safeSize}px`;
        });
      }
      const selectionAfterSize = window.getSelection();
      if (selectionAfterSize && selectionAfterSize.rangeCount) {
        savedSelectionRef.current = selectionAfterSize.getRangeAt(0).cloneRange();
      }
      if (blankBodyRef.current) {
        setDocBodyHtml(blankBodyRef.current.innerHTML);
      }
      return;
    }

    document.execCommand(command, false, value);

    const selection = window.getSelection();
    if (selection && selection.rangeCount) {
      savedSelectionRef.current = selection.getRangeAt(0).cloneRange();
    }

    if (blankBodyRef.current) {
      setDocBodyHtml(blankBodyRef.current.innerHTML);
    }

    try {
      setIsBoldActive(Boolean(document.queryCommandState('bold')));
      setIsItalicActive(Boolean(document.queryCommandState('italic')));
      setIsUnderlineActive(Boolean(document.queryCommandState('underline')));
      setIsStrikeActive(Boolean(document.queryCommandState('strikeThrough')));
      setIsListActive(Boolean(document.queryCommandState('insertUnorderedList')));
    } catch (_error) {
      // noop
    }
  };

  const addTaskFromInput = () => {
    const trimmed = newTaskInput.trim();
    if (!trimmed) {
      return;
    }

    setTasks((prev) => [...prev, { id: Date.now(), text: trimmed, completed: false, owner: newTaskOwner }]);
    setNewTaskInput('');
    trackMemoryAction('task', 'Added task', {
      textLength: trimmed.length,
    });
    showToast('Task added');
  };

  const removeTask = (taskId) => {
    setTasks((prev) => prev.filter((task) => task.id !== taskId));
    showToast('Task removed');
  };

  const beginTaskEdit = (task) => {
    setEditingTaskId(task.id);
    setEditingTaskText(task.text || '');
  };

  const commitTaskEdit = (taskId) => {
    const next = editingTaskText.trim();
    if (!next) {
      setEditingTaskId(null);
      setEditingTaskText('');
      return;
    }
    setTasks((prev) => prev.map((task) => (task.id === taskId ? { ...task, text: next } : task)));
    setEditingTaskId(null);
    setEditingTaskText('');
    showToast('Task updated');
  };

  const formatTimeSlot = (hours24, minutes = 0) => `${String(hours24).padStart(2, '0')}:${String(minutes).padStart(2, '0')}`;

  const parseTimeSlot = (slot) => {
    const match = String(slot || '').match(/(\d{1,2}):(\d{2})/);
    if (!match) {
      return { hours: 9, minutes: 0 };
    }
    return {
      hours: Math.min(23, Math.max(0, Number(match[1] || 9))),
      minutes: Math.min(59, Math.max(0, Number(match[2] || 0))),
    };
  };

  const inferCategory = (text) => {
    const value = String(text || '').toLowerCase();
    if (/meeting|call|sync|interview|standup/.test(value)) return 'Meeting';
    if (/review|report|draft|write|document|plan/.test(value)) return 'Work';
    if (/doctor|gym|pay|bill|buy|pickup|family/.test(value)) return 'Personal';
    return 'General';
  };

  const inferUrgency = (text, targetDate) => {
    const value = String(text || '').toLowerCase();
    if (/urgent|asap|immediately|today/.test(value)) return 'high';
    if (/tomorrow|soon|next/.test(value)) return 'medium';
    if (targetDate) {
      const now = new Date();
      const diffDays = Math.ceil((targetDate.getTime() - now.getTime()) / (24 * 60 * 60 * 1000));
      if (diffDays <= 1) return 'high';
      if (diffDays <= 3) return 'medium';
    }
    return 'low';
  };

  const parseScheduleItem = (rawItem, index = 0) => {
    const cleaned = String(rawItem || '').trim();
    const normalized = cleaned.replace(/\bshhedule\b|\bshedule\b/gi, 'schedule').replace(/\bppm\b/gi, 'pm');

    const explicitTimeMatch = normalized.match(/\bat\s*(\d{1,2})(?::(\d{2}))?\s*(am|pm|a\.m\.|p\.m\.)?/i);
    const timeWithMarkerMatch = normalized.match(/(\d{1,2})(?::(\d{2}))?\s*(am|pm|a\.m\.|p\.m\.)\b/i);
    const timeMatch = explicitTimeMatch || timeWithMarkerMatch;
    let hours = 9 + (index % 10);
    let minutes = 0;
    const hasExplicitTime = Boolean(timeMatch);
    if (timeMatch) {
      hours = Number(timeMatch[1] || hours);
      minutes = Number(timeMatch[2] || 0);
      const marker = String(timeMatch[3] || '').toLowerCase().replace(/\./g, '');
      if (marker === 'pm' && hours < 12) hours += 12;
      if (marker === 'am' && hours === 12) hours = 0;
      if (!marker && hours <= 7 && explicitTimeMatch) {
        hours += 12;
      }
      hours = Math.min(23, Math.max(0, hours));
    }

    const durationMatch = normalized.match(/(\d{1,3})\s*(m|min|mins|minute|minutes|h|hr|hrs|hour|hours)\b/i);
    let durationMinutes = 60;
    if (durationMatch) {
      const amount = Number(durationMatch[1] || 60);
      const unit = String(durationMatch[2] || 'm').toLowerCase();
      durationMinutes = /h|hr|hrs|hour/.test(unit) ? amount * 60 : amount;
    }

    const monthRegex = /(january|february|march|april|may|june|july|august|september|october|november|december)(?:\s+[a-z]+)?\s+(\d{1,2})(?:[^\d]+(\d{4}))?/i;
    const dateMatch = normalized.match(monthRegex);
    let dueDate = null;
    if (dateMatch) {
      const monthNamesLookup = {
        january: 0, february: 1, march: 2, april: 3, may: 4, june: 5,
        july: 6, august: 7, september: 8, october: 9, november: 10, december: 11,
      };
      const monthIndex = monthNamesLookup[String(dateMatch[1] || '').toLowerCase()];
      const day = Number(dateMatch[2] || selectedCalendarDate.getDate());
      const year = Number(dateMatch[3] || selectedCalendarDate.getFullYear());
      if (!Number.isNaN(monthIndex) && !Number.isNaN(day)) {
        dueDate = new Date(year, monthIndex, day, hours, minutes);
      }
    } else {
      dueDate = new Date(selectedCalendarDate.getFullYear(), selectedCalendarDate.getMonth(), selectedCalendarDate.getDate(), hours, minutes);
    }

    const titleSource = normalized
      .replace(/\b(schedule|create|add|set|plan)\b/gi, '')
      .replace(/\bon\b.+$/i, '')
      .replace(/\bat\b.+$/i, '')
      .trim();

    let title = titleSource;
    if (/meeting|call|sync/i.test(normalized)) {
      title = 'Meeting';
    } else if (!title) {
      title = `Task ${index + 1}`;
    }

    const category = inferCategory(normalized);
    const urgency = inferUrgency(normalized, dueDate);

    const slot = formatTimeSlot(hours, minutes);

    const parsed = {
      id: Date.now() + index + Math.floor(Math.random() * 1000),
      slot,
      timeExplicit: hasExplicitTime,
      title,
      summary: '',
      steps: [],
      category,
      urgency,
      durationMinutes,
      dueDate: dueDate ? dueDate.toISOString() : null,
      approved: false,
      rawInput: cleaned,
    };

    return {
      ...parsed,
      original: {
        slot: parsed.slot,
        title: parsed.title,
        summary: parsed.summary,
        steps: parsed.steps,
        category: parsed.category,
        urgency: parsed.urgency,
        durationMinutes: parsed.durationMinutes,
        dueDate: parsed.dueDate,
      },
    };
  };

  const findBestAvailableSlot = (targetDate) => {
    const pool = ['09:00', '11:00', '13:00', '15:00', '17:00', '19:00'];
    const isSameDay = (iso) => {
      if (!iso) return false;
      const d = new Date(iso);
      return d.getFullYear() === targetDate.getFullYear() && d.getMonth() === targetDate.getMonth() && d.getDate() === targetDate.getDate();
    };
    const busy = new Set([
      ...scheduleOutput.filter((item) => isSameDay(item.dueDate)).map((item) => item.slot),
      ...upcomingEvents.filter((item) => isSameDay(item.dueDate)).map((item) => item.slot),
    ]);
    return pool.find((slot) => !busy.has(slot)) || pool[0];
  };

  const enrichScheduleItemsWithAI = async (rawItems, fallbackItems) => {
    const schema = {
      type: 'OBJECT',
      properties: {
        items: {
          type: 'ARRAY',
          items: {
            type: 'OBJECT',
            properties: {
              title: { type: 'STRING' },
              slot: { type: 'STRING' },
              dueDateISO: { type: 'STRING' },
              durationMinutes: { type: 'NUMBER' },
              category: { type: 'STRING' },
              urgency: { type: 'STRING' },
              summary: { type: 'STRING' },
              steps: { type: 'ARRAY', items: { type: 'STRING' } },
            },
          },
        },
      },
    };

    try {
      const response = await callGemini({
        userPrompt: rawItems.join('\n'),
        systemPrompt: `Convert the schedule lines into structured JSON.\nRules:\n- Extract title, date/time, duration in minutes.\n- slot must be HH:MM 24-hour.\n- dueDateISO must be valid ISO datetime.\n- infer category as Meeting/Work/Personal/General.\n- urgency must be high/medium/low.\n- Keep summary concise.\n- Add useful step checklist when obvious.`,
        schema,
        attachments: scheduleAttachments,
      });

      const aiItems = response?.parsed?.items;
      if (!Array.isArray(aiItems) || !aiItems.length) {
        return fallbackItems;
      }

      return fallbackItems.map((base, index) => {
        const ai = aiItems[index] || {};
        const mergedDate = ai.dueDateISO ? new Date(ai.dueDateISO) : (base.dueDate ? new Date(base.dueDate) : null);
        const nextDate = mergedDate && !Number.isNaN(mergedDate.getTime()) ? mergedDate : null;
        const nextSlot = /\d{1,2}:\d{2}/.test(String(ai.slot || '')) ? String(ai.slot) : base.slot;
        const next = {
          ...base,
          title: String(ai.title || base.title || '').trim() || base.title,
          slot: nextSlot,
          dueDate: nextDate ? nextDate.toISOString() : base.dueDate,
          timeExplicit: /\d{1,2}:\d{2}/.test(String(ai.slot || '')) || base.timeExplicit,
          durationMinutes: Number(ai.durationMinutes || base.durationMinutes || 60),
          category: String(ai.category || base.category || 'General'),
          urgency: ['high', 'medium', 'low'].includes(String(ai.urgency || '').toLowerCase()) ? String(ai.urgency).toLowerCase() : base.urgency,
          summary: String(ai.summary || base.summary || ''),
          steps: Array.isArray(ai.steps) ? ai.steps.filter(Boolean).map((step) => String(step)) : base.steps,
        };

        return {
          ...next,
          original: {
            slot: next.slot,
            title: next.title,
            summary: next.summary,
            steps: next.steps,
            category: next.category,
            urgency: next.urgency,
            durationMinutes: next.durationMinutes,
            dueDate: next.dueDate,
          },
        };
      });
    } catch (_error) {
      return fallbackItems;
    }
  };

  const formatEventSlotLabel = (event) => {
    if (!event?.dueDate) {
      return event?.slot ? `${event.slot}` : (event?.slotLabel || 'No time set');
    }

    const dateValue = new Date(event.dueDate);
    const today = new Date();
    const tomorrow = new Date(today);
    tomorrow.setDate(today.getDate() + 1);

    const isSameDay = (a, b) => a.getFullYear() === b.getFullYear() && a.getMonth() === b.getMonth() && a.getDate() === b.getDate();
    const slotLabel = event.slot || formatTimeSlot(dateValue.getHours(), dateValue.getMinutes());

    if (isSameDay(dateValue, today)) {
      return `Today - ${slotLabel}`;
    }
    if (isSameDay(dateValue, tomorrow)) {
      return `Tomorrow - ${slotLabel}`;
    }
    return `${dateValue.toLocaleDateString(undefined, { month: 'short', day: 'numeric', year: 'numeric' })} - ${slotLabel}`;
  };

  const formatUpcomingHeaderDate = (dateValue) => {
    const safeDate = dateValue instanceof Date ? dateValue : new Date();
    const weekday = safeDate.toLocaleDateString(undefined, { weekday: 'short' }).toUpperCase();
    const month = safeDate.toLocaleDateString(undefined, { month: 'short' }).toUpperCase();
    return `${weekday} ${month} ${safeDate.getDate()}`;
  };

  const scheduleAgendaItems = useMemo(() => {
    const parseSlotMinutes = (slot) => {
      const raw = String(slot || '').trim();
      if (!raw) {
        return null;
      }
      let match = raw.match(/^(\d{1,2}):(\d{2})$/);
      if (match) {
        return Number(match[1]) * 60 + Number(match[2]);
      }
      match = raw.match(/^(\d{1,2}):(\d{2})\s*(AM|PM)$/i);
      if (match) {
        const meridian = String(match[3] || '').toUpperCase();
        let hour = Number(match[1]) % 12;
        if (meridian === 'PM') {
          hour += 12;
        }
        return hour * 60 + Number(match[2]);
      }
      return null;
    };

    const normalized = [...(upcomingEvents || []), ...(scheduleOutput || [])]
      .map((event, index) => {
        const dueDate = event?.dueDate ? new Date(event.dueDate) : null;
        const hasDate = dueDate instanceof Date && !Number.isNaN(dueDate.getTime());
        const slotMinutes = parseSlotMinutes(event?.slot);
        const fallback = new Date(selectedCalendarDate || new Date());
        if (slotMinutes !== null) {
          fallback.setHours(Math.floor(slotMinutes / 60), slotMinutes % 60, 0, 0);
        } else {
          fallback.setHours(9 + index, 0, 0, 0);
        }

        return {
          ...event,
          _sortDate: hasDate ? dueDate : fallback,
        };
      })
      .sort((a, b) => a._sortDate - b._sortDate)
      .slice(0, 6);

    return normalized;
  }, [scheduleOutput, selectedCalendarDate, upcomingEvents]);

  const scheduleAiInsights = useMemo(() => {
    const insights = [];
    const agenda = scheduleAgendaItems;
    if (!agenda.length) {
      return ['No upcoming events yet. Paste tasks below and Compose AI will build a focused schedule.'];
    }

    const todaysEvents = agenda.filter((event) => {
      if (!event?._sortDate) {
        return false;
      }
      const now = new Date();
      return event._sortDate.getFullYear() === now.getFullYear()
        && event._sortDate.getMonth() === now.getMonth()
        && event._sortDate.getDate() === now.getDate();
    });

    const todayDuration = todaysEvents.reduce((sum, event) => sum + Math.max(15, Number(event.durationMinutes || 60)), 0);
    if (todayDuration >= 300) {
      insights.push('Today is packed. Consider a 15-minute recovery buffer between deep-work blocks.');
    }

    const adjacentHighUrgency = agenda.filter((event) => String(event.urgency || '').toLowerCase() === 'high').length;
    if (adjacentHighUrgency >= 3) {
      insights.push('Three high-urgency items are competing. Reorder by impact to avoid context switching.');
    }

    const titleSignal = String(docTitle || '').trim().toLowerCase();
    if (titleSignal) {
      const hasLinkedEvent = agenda.some((event) => String(event.title || '').toLowerCase().includes(titleSignal.split(' ')[0] || ''));
      if (hasLinkedEvent) {
        insights.push('A scheduled item aligns with your active document. Keep it near your writing sprint.');
      }
    }

    if (!insights.length) {
      insights.push('Schedule balance looks healthy. Keep one flexible slot open for AI-assisted revisions.');
    }

    return insights.slice(0, 3);
  }, [docTitle, scheduleAgendaItems]);

  useEffect(() => {
    // Expand schedule rail when full calendar panel is open; otherwise keep compact width.
    if (activeRightTab === 'calendar' && rightSidebarOpen) {
      const targetWidth = isScheduleCalendarExpanded ? 440 : 320;
      if (rightSidebarWidth !== targetWidth) {
        setRightSidebarWidth(targetWidth);
      }
    }
  }, [activeRightTab, rightSidebarOpen, rightSidebarWidth, isScheduleCalendarExpanded]);

  const convertTaskToSchedule = async (taskValue) => {
    const taskText = typeof taskValue === 'string' ? taskValue : String(taskValue?.text || '');
    const trimmed = taskText.trim();
    if (!trimmed) {
      return;
    }

    let scheduleItem = parseScheduleItem(trimmed, scheduleOutput.length);
    const targetDate = scheduleItem.dueDate ? new Date(scheduleItem.dueDate) : selectedCalendarDate;
    if (!scheduleItem.timeExplicit) {
      scheduleItem.slot = findBestAvailableSlot(targetDate);
    }

    const aiEnriched = await enrichScheduleItemsWithAI([trimmed], [scheduleItem]);
    scheduleItem = aiEnriched[0] || scheduleItem;
    if (typeof taskValue === 'object' && taskValue?.owner) {
      scheduleItem.category = taskValue.owner === 'agent' ? 'Agent Task' : scheduleItem.category;
    }

    setScheduleOutput((prev) => [...prev, scheduleItem]);
    setActiveRightTab('calendar');
    setRightSidebarOpen(true);
    trackMemoryAction('automation', 'Converted task to schedule', {
      title: scheduleItem.title,
    });
    showToast('Task converted to schedule');
  };

  const convertMessyScheduleToPlan = async () => {
    const rawItems = scheduleInput
      .split(/\n|;/)
      .map((item) => item.trim())
      .filter(Boolean);

    if (!rawItems.length) {
      return;
    }

    let cleanItems = rawItems.map((item, index) => {
      const parsed = parseScheduleItem(item, index);
      if (!parsed.timeExplicit) {
        const targetDate = parsed.dueDate ? new Date(parsed.dueDate) : selectedCalendarDate;
        parsed.slot = findBestAvailableSlot(targetDate);
      }
      return parsed;
    });

    cleanItems = await enrichScheduleItemsWithAI(rawItems, cleanItems);

    setScheduleOutput(cleanItems);
    trackMemoryAction('automation', 'Converted raw schedule input', {
      items: cleanItems.length,
    });
    showToast('Messy schedule converted to clean timeline');
  };

  const updateScheduleItem = (id, field, value) => {
    setScheduleOutput((prev) => prev.map((item) => (
      item.id === id ? { ...item, [field]: value } : item
    )));
  };

  const undoScheduleItem = (id) => {
    setScheduleOutput((prev) => prev.filter((item) => item.id !== id));
    showToast('Removed from processed list');
  };

  const addScheduleStep = (id) => {
    setScheduleOutput((prev) => prev.map((item) => (
      item.id === id ? { ...item, steps: [...(item.steps || []), ''] } : item
    )));
  };

  const updateScheduleStep = (id, stepIndex, value) => {
    setScheduleOutput((prev) => prev.map((item) => {
      if (item.id !== id) return item;
      const nextSteps = [...(item.steps || [])];
      nextSteps[stepIndex] = value;
      return { ...item, steps: nextSteps };
    }));
  };

  const removeScheduleStep = (id, stepIndex) => {
    setScheduleOutput((prev) => prev.map((item) => {
      if (item.id !== id) return item;
      return { ...item, steps: (item.steps || []).filter((_, idx) => idx !== stepIndex) };
    }));
  };

  const approveScheduleItem = (id) => {
    setScheduleOutput((prev) => {
      const target = prev.find((item) => item.id === id);
      if (!target) return prev;

      setUpcomingEvents((existing) => [
        {
          id: Date.now() + Math.floor(Math.random() * 1000),
          title: target.title,
          slot: target.slot,
          dueDate: target.dueDate || selectedCalendarDate.toISOString(),
          category: target.category,
          urgency: target.urgency,
          durationMinutes: target.durationMinutes || 60,
          slotLabel: formatEventSlotLabel(target),
        },
        ...existing,
      ]);

      showToast('Schedule item approved and added to upcoming events');
      return prev.filter((item) => item.id !== id);
    });
  };

  const beginPanelResize = (target, event) => {
    event.preventDefault();
    event.stopPropagation();
    const point = event.touches?.[0] || event;
    if (!event.touches && event.button !== 0) {
      return;
    }
    dragStateRef.current = {
      startX: point.clientX,
      startY: point.clientY,
      leftWidth: leftSidebarWidth,
      rightWidth: rightSidebarWidth,
      promptX: promptOffset.x,
      promptY: promptOffset.y,
      miniPromptX: miniPromptOffset.x,
      miniPromptY: miniPromptOffset.y,
      dictationX: dictationOffset.x,
      dictationY: dictationOffset.y,
      deckPromptX: deckPromptOffset.x,
      deckPromptY: deckPromptOffset.y,
    };
    setDragTarget(target);
  };

  useEffect(() => {
    if (!dragTarget) {
      return;
    }

    const handlePointerMove = (event) => {
      const deltaX = event.clientX - dragStateRef.current.startX;

      if (dragTarget === 'left') {
        const nextLeftWidth = Math.min(380, Math.max(220, dragStateRef.current.leftWidth + deltaX));
        setLeftSidebarWidth(nextLeftWidth);
      }

      if (dragTarget === 'right') {
        const nextRightWidth = Math.min(520, Math.max(280, dragStateRef.current.rightWidth - deltaX));
        setRightSidebarWidth(nextRightWidth);
      }

      if (dragTarget === 'prompt') {
        const nextX = Math.min(620, Math.max(-620, dragStateRef.current.promptX + deltaX));
        const deltaY = event.clientY - dragStateRef.current.startY;
        const nextY = Math.min(320, Math.max(-540, dragStateRef.current.promptY - deltaY));
        setPromptOffset({ x: nextX, y: nextY });
      }

      if (dragTarget === 'miniPrompt') {
        const nextX = Math.min(840, Math.max(-20, dragStateRef.current.miniPromptX + deltaX));
        const deltaY = event.clientY - dragStateRef.current.startY;
        const nextY = Math.min(560, Math.max(-40, dragStateRef.current.miniPromptY + deltaY));
        setMiniPromptOffset({ x: nextX, y: nextY });
      }

      if (dragTarget === 'dictation') {
        const nextX = Math.min(840, Math.max(-20, dragStateRef.current.dictationX + deltaX));
        const deltaY = event.clientY - dragStateRef.current.startY;
        const nextY = Math.min(520, Math.max(-280, dragStateRef.current.dictationY + deltaY));
        setDictationOffset({ x: nextX, y: nextY });
      }

      if (dragTarget === 'deckPrompt') {
        const nextX = Math.min(220, Math.max(-220, dragStateRef.current.deckPromptX + deltaX));
        const deltaY = event.clientY - dragStateRef.current.startY;
        const nextY = Math.min(200, Math.max(-220, dragStateRef.current.deckPromptY + deltaY));
        setDeckPromptOffset({ x: nextX, y: nextY });
      }
    };

    const handlePointerUp = () => {
      setDragTarget(null);
    };

    document.body.style.cursor = ['prompt', 'miniPrompt', 'dictation', 'deckPrompt'].includes(dragTarget) ? 'grabbing' : 'col-resize';
    document.body.style.userSelect = 'none';
    window.addEventListener('pointermove', handlePointerMove);
    window.addEventListener('pointerup', handlePointerUp);

    return () => {
      document.body.style.cursor = '';
      document.body.style.userSelect = '';
      window.removeEventListener('pointermove', handlePointerMove);
      window.removeEventListener('pointerup', handlePointerUp);
    };
  }, [dragTarget, deckPromptOffset.x, deckPromptOffset.y, dictationOffset.x, dictationOffset.y, leftSidebarWidth, miniPromptOffset.x, miniPromptOffset.y, promptOffset.x, promptOffset.y, rightSidebarWidth]);

  // Helper function to generate calendar days
  const generateCalendarDays = (month, year) => {
    const firstDay = new Date(year, month, 1).getDay();
    const daysInMonth = new Date(year, month + 1, 0).getDate();
    const daysInPrevMonth = new Date(year, month, 0).getDate();
    
    const days = [];
    
    // Previous month's trailing days
    for (let i = firstDay - 1; i >= 0; i--) {
      days.push({ day: daysInPrevMonth - i, isCurrentMonth: false });
    }
    
    // Current month's days
    for (let i = 1; i <= daysInMonth; i++) {
      const isToday = new Date(year, month, i).toDateString() === new Date().toDateString();
      days.push({ day: i, isCurrentMonth: true, isToday });
    }
    
    // Next month's leading days
    const remainingDays = 42 - days.length;
    for (let i = 1; i <= remainingDays; i++) {
      days.push({ day: i, isCurrentMonth: false });
    }
    
    return days;
  };

  const monthNames = ['January', 'February', 'March', 'April', 'May', 'June', 'July', 'August', 'September', 'October', 'November', 'December'];

  const setCalendarView = (nextMonth, nextYear) => {
    const boundedYear = Math.min(2029, Math.max(2026, nextYear));
    const boundedMonth = Math.min(11, Math.max(0, nextMonth));
    const preferredDay = selectedCalendarDate?.getDate?.() || 1;
    const maxDay = new Date(boundedYear, boundedMonth + 1, 0).getDate();

    setCalendarMonth(boundedMonth);
    setCalendarYear(boundedYear);
    setSelectedCalendarDate(new Date(boundedYear, boundedMonth, Math.min(preferredDay, maxDay)));
  };

  // Helper component for the Workspace icons in the sidebar
  const WorkspaceIcon = ({ letter, colorClass }) => (
    <div className={`w-6 h-6 rounded flex items-center justify-center text-xs font-bold text-white ${colorClass}`}>
      {letter}
    </div>
  );

  const orderedDocuments = [...documents].sort((a, b) => {
    if (!!a.pinned === !!b.pinned) {
      return 0;
    }
    return a.pinned ? -1 : 1;
  });

  const canShowComposeActions = Boolean(
    lastComposeRun
    && lastComposeRun.documentId === activeDocId
    && getPlainText(docBodyHtml).length
  );
  const deckSlides = deckSlidesData;
  const activeDeckSlide = deckSlides.find((slide) => slide.id === activeDeckSlideId) || deckSlides[0];
  const resolvedDeckSlideDesign = useMemo(() => {
    const fallback = DECK_DESIGN_PRESETS[0];
    if (!activeDeckSlide) {
      return {
        preset: fallback,
        headline: 'The future of work is human + AI.',
        blurb: 'An adaptive workspace that thinks with you, so you can create without limits.',
        visualType: 'hero statement',
        layoutStyle: 'cinematic split',
        motionCue: 'Soft fade and stagger reveal',
        keyMetric: '',
        speakerNotes: '',
        section: 'Opening',
        footer: 'May 15, 2026',
      };
    }
    const preset = DECK_DESIGN_PRESETS.find((item) => item.key === activeDeckSlide.designPresetKey)
      || DECK_DESIGN_PRESETS[(Math.max(0, activeDeckSlide.id - 1)) % DECK_DESIGN_PRESETS.length]
      || fallback;

    return {
      preset,
      headline: activeDeckSlide.headline || `${activeDeckSlide.title || 'Original concept'} that earns attention`,
      blurb: activeDeckSlide.blurb || `${activeDeckSlide.subtitle || 'Built for modern teams'} and crafted to be edited live.`,
      visualType: activeDeckSlide.visualType || 'hero statement',
      layoutStyle: activeDeckSlide.layoutStyle || 'cinematic split',
      motionCue: activeDeckSlide.motionCue || 'Soft fade and stagger reveal',
      keyMetric: activeDeckSlide.keyMetric || '',
      speakerNotes: activeDeckSlide.speakerNotes || '',
      section: activeDeckSlide.section || inferDeckStorySection(activeDeckSlide, Math.max(0, activeDeckSlide.id - 1), Math.max(1, deckSlides.length)),
      footer: activeDeckSlide.footer || 'Original design 繚 Editable',
    };
  }, [activeDeckSlide, deckSlides.length]);

  const deckIntelligence = useMemo(() => {
    if (!deckSlides.length) {
      return {
        narrativeQuality: 'No slides yet',
        pacingQuality: 'No pacing yet',
        weakSlides: [],
        audienceFit: 'Audience fit not available',
        presentationSummary: 'Generate slides to see AI narrative diagnostics.',
        suggestions: ['Generate a deck from your goal and source materials.'],
        suggestedAdditions: ['Add market signal slide', 'Add proof/traction slide'],
        relatedSources: [],
        speakerNotes: 'Speaker notes will appear after deck generation.',
      };
    }

    const withSections = deckSlides.map((slide, index) => ({
      ...slide,
      section: slide.section || inferDeckStorySection(slide, index, deckSlides.length),
    }));
    const uniqueSections = [...new Set(withSections.map((slide) => slide.section))];
    const avgWords = withSections.reduce((acc, slide) => acc + String(slide.blurb || '').split(/\s+/).filter(Boolean).length, 0) / Math.max(1, withSections.length);
    const weakSlides = withSections
      .filter((slide) => String(slide.blurb || '').trim().length < 55 || String(slide.headline || '').trim().length < 12)
      .slice(0, 4)
      .map((slide) => `${slide.title}: strengthen emotional hook and proof.`);

    const hasFinancialSignal = withSections.some((slide) => /revenue|cac|ltv|forecast|unit/i.test(`${slide.title} ${slide.headline} ${slide.blurb}`));
    const narrativeQuality = `${Math.min(99, Math.round((uniqueSections.length / DECK_STORY_SECTIONS.length) * 100 + 15))}% coherent narrative flow`;
    const pacingQuality = `${Math.max(62, 100 - Math.abs(withSections.length - 10) * 6)}% pacing balance`;
    const suggestions = [];
    if (weakSlides.length) suggestions.push('Strengthen weak slides with stronger hooks and concrete proof points.');
    if (withSections.length > 12) suggestions.push('Compress to 8-10 slides for tighter executive pacing.');
    if (!hasFinancialSignal) suggestions.push('Add one concise financial confidence slide for investor readiness.');
    if (!suggestions.length) suggestions.push('Narrative quality is strong. Add a differentiator visual to increase memorability.');

    const relatedSources = [...new Map([...promptAttachments, ...chatAttachments].map((item) => [item.id || item.name, item])).values()]
      .slice(0, 5)
      .map((item) => `${item.name} (${item.type || 'file'})`);

    const activeNotes = activeDeckSlide?.speakerNotes?.trim();

    return {
      narrativeQuality,
      pacingQuality,
      weakSlides,
      audienceFit: hasFinancialSignal ? 'Strong investor-fit narrative with quant signals.' : 'General audience fit detected. Add financial proof for investors.',
      presentationSummary: `${deckSlides.length} slides across ${uniqueSections.length} narrative sections: ${uniqueSections.join(', ')}.`,
      suggestions,
      suggestedAdditions: ['Competitor comparison visual', 'Go-to-market timeline', 'Risk and mitigation slide'],
      relatedSources,
      speakerNotes: activeNotes || 'No speaker notes yet on this slide. Ask AI Assistant to create presenter notes.',
    };
  }, [activeDeckSlide?.speakerNotes, chatAttachments, deckSlides, promptAttachments]);

  const activeSheet = sheetsData.find((sheet) => sheet.id === activeSheetId) || sheetsData[0];
  const activeSheetGrid = sheetGrids[activeSheetId] || { rows: 22, cols: 7, cells: Array.from({ length: 22 }, () => Array.from({ length: 7 }, () => '')) };
  const isSheetsMode = productMode === 'sheets';
  const updateDeckSlideField = (slideId, field, value) => {
    setDeckSlidesData((prev) => prev.map((slide) => (slide.id === slideId ? { ...slide, [field]: value } : slide)));
  };

  const generateOriginalDeckDesign = () => {
    if (!activeDeckSlide?.id) {
      return;
    }
    const randomPreset = DECK_DESIGN_PRESETS[Math.floor(Math.random() * DECK_DESIGN_PRESETS.length)] || DECK_DESIGN_PRESETS[0];
    const conceptSeed = deckPromptInput.trim() || activeDeckSlide.title || 'New original concept';
    const headline = `${conceptSeed.replace(/\.$/, '')}: a bold narrative direction`;
    const blurb = `${activeDeckSlide.subtitle || 'Story-first slide'} with original visuals and editable layers for your team.`;

    setDeckSlidesData((prev) => prev.map((slide) => {
      if (slide.id !== activeDeckSlide.id) {
        return slide;
      }
      return {
        ...slide,
        designPresetKey: randomPreset.key,
        headline,
        blurb,
        footer: `Original concept 繚 ${new Date().toLocaleDateString()}`,
      };
    }));
    showToast('Generated original slide design. You can edit headline and body directly.');
  };

  const applyDeckTemplate = (template, scope = 'slide') => {
    if (!template) {
      return;
    }

    const applyToSlide = (slide, index = 0, total = 1) => ({
      ...slide,
      designPresetKey: template.presetKey,
      visualType: template.visualType,
      layoutStyle: template.layoutStyle,
      motionCue: template.motionCue,
      section: slide.section || inferDeckStorySection(slide, index, total),
      footer: `${template.label} 繚 Editable`,
    });

    if (scope === 'deck') {
      setDeckSlidesData((prev) => prev.map((slide, index) => applyToSlide(slide, index, prev.length)));
      showToast(`Applied ${template.label} to full deck`);
      return;
    }

    if (!activeDeckSlide?.id) {
      return;
    }
    setDeckSlidesData((prev) => prev.map((slide, index) => (
      slide.id === activeDeckSlide.id ? applyToSlide(slide, index, prev.length) : slide
    )));
    showToast(`Applied ${template.label} to current slide`);
  };

  const addDeckSlide = () => {
    const nextId = (deckSlides[deckSlides.length - 1]?.id || 0) + 1;
    const preset = DECK_DESIGN_PRESETS[(nextId - 1) % DECK_DESIGN_PRESETS.length] || DECK_DESIGN_PRESETS[0];
    const newSlide = {
      id: nextId,
      title: `Slide ${nextId}`,
      subtitle: 'New talking point',
      accent: 'from-violet-500 to-indigo-600',
      designPresetKey: preset.key,
      headline: `Original concept for Slide ${nextId}`,
      blurb: 'Click and edit this text to shape your message.',
      visualType: 'hero statement',
      layoutStyle: 'cinematic split',
      motionCue: 'Soft fade and stagger reveal',
      keyMetric: '',
      speakerNotes: '',
      section: inferDeckStorySection({ title: `Slide ${nextId}` }, nextId - 1, Math.max(deckSlides.length + 1, 1)),
      footer: 'Original design 繚 Editable',
    };
    setDeckSlidesData((prev) => [...prev, newSlide]);
    setActiveDeckSlideId(nextId);
    showToast(`Slide ${nextId} created`);
  };
  const addWorksheet = () => {
    const nextId = (sheetsData[sheetsData.length - 1]?.id || 0) + 1;
    const worksheet = {
      id: nextId,
      title: `Worksheet ${nextId}`,
      subtitle: 'Custom',
    };
    setSheetsData((prev) => [...prev, worksheet]);
    setSheetGrids((prev) => ({
      ...prev,
      [nextId]: { rows: 22, cols: 7, cells: Array.from({ length: 22 }, () => Array.from({ length: 7 }, () => '')) },
    }));
    setActiveSheetId(nextId);
    setSheetsTitle(worksheet.title);
    showToast(`${worksheet.title} created`);
  };
  const toColumnLabel = (index) => {
    let current = index + 1;
    let label = '';
    while (current > 0) {
      const rem = (current - 1) % 26;
      label = String.fromCharCode(65 + rem) + label;
      current = Math.floor((current - 1) / 26);
    }
    return label;
  };
  const updateSheetCell = (sheetId, rowIndex, colIndex, value) => {
    setSheetGrids((prev) => {
      const target = prev[sheetId];
      if (!target) return prev;
      const nextCells = target.cells.map((row) => [...row]);
      if (!nextCells[rowIndex]) return prev;
      nextCells[rowIndex][colIndex] = value;
      return {
        ...prev,
        [sheetId]: {
          ...target,
          cells: nextCells,
        },
      };
    });
  };
  const addSheetRow = () => {
    setSheetGrids((prev) => {
      const target = prev[activeSheetId];
      if (!target) return prev;
      const nextCols = target.cols;
      return {
        ...prev,
        [activeSheetId]: {
          ...target,
          rows: target.rows + 1,
          cells: [...target.cells.map((row) => [...row]), Array.from({ length: nextCols }, () => '')],
        },
      };
    });
  };
  const removeSheetRow = () => {
    setSheetGrids((prev) => {
      const target = prev[activeSheetId];
      if (!target || target.rows <= 1) return prev;
      const nextCells = target.cells.slice(0, -1).map((row) => [...row]);
      return {
        ...prev,
        [activeSheetId]: {
          ...target,
          rows: target.rows - 1,
          cells: nextCells,
        },
      };
    });
    showToast('Last row removed');
  };
  const addSheetColumn = () => {
    setSheetGrids((prev) => {
      const target = prev[activeSheetId];
      if (!target) return prev;
      const nextCells = target.cells.map((row) => [...row, '']);
      return {
        ...prev,
        [activeSheetId]: {
          ...target,
          cols: target.cols + 1,
          cells: nextCells,
        },
      };
    });
  };
  const removeSheetColumn = () => {
    setSheetGrids((prev) => {
      const target = prev[activeSheetId];
      if (!target || target.cols <= 1) return prev;
      const nextCells = target.cells.map((row) => row.slice(0, -1));
      return {
        ...prev,
        [activeSheetId]: {
          ...target,
          cols: target.cols - 1,
          cells: nextCells,
        },
      };
    });
    showToast('Last column removed');
  };
  const handlePageContextAction = (action) => {
    const targetId = pageContextMenu.itemId;
    const isTargetSheets = pageContextMenu.isSheets;
    if (!targetId) {
      setPageContextMenu((prev) => ({ ...prev, open: false }));
      return;
    }

    if (action === 'add') {
      if (isTargetSheets) {
        addWorksheet();
      } else {
        addDeckSlide();
      }
    }

    if (action === 'duplicate') {
      if (isTargetSheets) {
        const source = sheetsData.find((item) => item.id === targetId);
        if (source) {
          const nextId = (sheetsData[sheetsData.length - 1]?.id || 0) + 1;
          const clone = { ...source, id: nextId, title: `${source.title} Copy` };
          setSheetsData((prev) => [...prev, clone]);
          const sourceGrid = sheetGrids[targetId] || { rows: 22, cols: 7, cells: Array.from({ length: 22 }, () => Array.from({ length: 7 }, () => '')) };
          setSheetGrids((prev) => ({
            ...prev,
            [nextId]: {
              rows: sourceGrid.rows,
              cols: sourceGrid.cols,
              cells: sourceGrid.cells.map((row) => [...row]),
            },
          }));
          setActiveSheetId(nextId);
          setSheetsTitle(clone.title);
          showToast('Worksheet duplicated');
        }
      } else {
        const source = deckSlides.find((item) => item.id === targetId);
        if (source) {
          const nextId = (deckSlides[deckSlides.length - 1]?.id || 0) + 1;
          const clone = { ...source, id: nextId, title: `${source.title} Copy` };
          setDeckSlidesData((prev) => [...prev, clone]);
          setActiveDeckSlideId(nextId);
          showToast('Slide duplicated');
        }
      }
    }

    if (action === 'delete') {
      if (isTargetSheets) {
        setSheetsData((prev) => {
          if (prev.length <= 1) {
            showToast('At least one worksheet is required');
            return prev;
          }
          const next = prev.filter((item) => item.id !== targetId);
          if (activeSheetId === targetId && next[0]) {
            setActiveSheetId(next[0].id);
            setSheetsTitle(next[0].title);
          }
          return next;
        });
        setSheetGrids((prev) => {
          const next = { ...prev };
          delete next[targetId];
          return next;
        });
      } else {
        setDeckSlidesData((prev) => {
          if (prev.length <= 1) {
            showToast('At least one slide is required');
            return prev;
          }
          const next = prev.filter((item) => item.id !== targetId);
          if (activeDeckSlideId === targetId && next[0]) {
            setActiveDeckSlideId(next[0].id);
          }
          return next;
        });
      }
      showToast('Page deleted');
    }

    if (['copy', 'copyStyle', 'paste', 'hide', 'transition', 'lock', 'download', 'copyLink', 'notes', 'resize', 'editVideo'].includes(action)) {
      const actionLabels = {
        copy: 'Copied',
        copyStyle: 'Style copied',
        paste: 'Pasted',
        hide: 'Page hidden',
        transition: 'Transition added',
        lock: 'Page locked',
        download: 'Page download started',
        copyLink: 'Page link copied',
        notes: 'Notes opened',
        resize: 'Resize options opened',
        editVideo: 'Video editor opened',
      };
      showToast(actionLabels[action] || 'Done');
    }

    setPageContextMenu((prev) => ({ ...prev, open: false }));
  };
  const escapeSvgText = (value) => String(value || '')
    .replace(/&/g, '&amp;')
    .replace(/</g, '&lt;')
    .replace(/>/g, '&gt;')
    .replace(/"/g, '&quot;')
    .replace(/'/g, '&#39;');

  const buildDeckPreviewDataUri = (slide) => {
    const title = escapeSvgText(slide?.title || 'Untitled Slide');
    const subtitle = escapeSvgText(slide?.subtitle || '');
    const gradientMap = {
      'from-indigo-500 to-violet-500': ['#6366f1', '#8b5cf6'],
      'from-sky-500 to-indigo-500': ['#0ea5e9', '#6366f1'],
      'from-cyan-500 to-blue-500': ['#06b6d4', '#3b82f6'],
      'from-amber-500 to-orange-500': ['#f59e0b', '#f97316'],
      'from-violet-500 to-fuchsia-500': ['#8b5cf6', '#d946ef'],
      'from-emerald-500 to-teal-500': ['#10b981', '#14b8a6'],
      'from-blue-500 to-violet-500': ['#3b82f6', '#8b5cf6'],
      'from-fuchsia-500 to-pink-500': ['#d946ef', '#ec4899'],
      'from-indigo-600 to-slate-600': ['#4f46e5', '#475569'],
      'from-violet-600 to-indigo-700': ['#7c3aed', '#4338ca'],
    };
    const [c1, c2] = gradientMap[slide?.accent] || ['#6366f1', '#8b5cf6'];
    const svg = `<svg xmlns="http://www.w3.org/2000/svg" width="320" height="192" viewBox="0 0 320 192">
      <defs><linearGradient id="g" x1="0" y1="0" x2="1" y2="1"><stop offset="0%" stop-color="${c1}"/><stop offset="100%" stop-color="${c2}"/></linearGradient></defs>
      <rect width="320" height="192" rx="14" fill="url(#g)"/>
      <rect x="10" y="10" width="64" height="10" rx="5" fill="rgba(255,255,255,0.35)"/>
      <rect x="10" y="31" width="220" height="12" rx="6" fill="rgba(255,255,255,0.28)"/>
      <rect x="10" y="49" width="180" height="10" rx="5" fill="rgba(255,255,255,0.22)"/>
      <text x="12" y="110" font-size="20" font-family="Inter, Arial, sans-serif" fill="white" font-weight="600">${title}</text>
      <text x="12" y="134" font-size="11" font-family="Inter, Arial, sans-serif" fill="rgba(255,255,255,0.85)">${subtitle}</text>
      <rect x="12" y="154" width="170" height="6" rx="3" fill="rgba(255,255,255,0.5)"/>
      <rect x="12" y="166" width="136" height="6" rx="3" fill="rgba(255,255,255,0.38)"/>
    </svg>`;
    return `data:image/svg+xml;charset=utf-8,${encodeURIComponent(svg)}`;
  };

  const buildSheetPreviewDataUri = (sheet) => {
    const title = escapeSvgText(sheet?.title || 'Untitled Sheet');
    const subtitle = escapeSvgText(sheet?.subtitle || '');
    const svg = `<svg xmlns="http://www.w3.org/2000/svg" width="320" height="192" viewBox="0 0 320 192">
      <rect width="320" height="192" rx="14" fill="#ffffff"/>
      <rect x="0" y="0" width="320" height="24" fill="#f8f9fd"/>
      <rect x="0" y="24" width="320" height="1" fill="#e5e7eb"/>
      <rect x="0" y="24" width="34" height="168" fill="#f8f9fd"/>
      <rect x="34" y="24" width="1" height="168" fill="#e5e7eb"/>
      <text x="42" y="16" font-size="10" font-family="Inter, Arial, sans-serif" fill="#6b7280">${title}</text>
      <text x="260" y="16" font-size="9" font-family="Inter, Arial, sans-serif" fill="#9ca3af">${subtitle}</text>
      <g stroke="#e5e7eb" stroke-width="1">
        <line x1="34" y1="48" x2="320" y2="48"/>
        <line x1="34" y1="72" x2="320" y2="72"/>
        <line x1="34" y1="96" x2="320" y2="96"/>
        <line x1="34" y1="120" x2="320" y2="120"/>
        <line x1="34" y1="144" x2="320" y2="144"/>
        <line x1="34" y1="168" x2="320" y2="168"/>
        <line x1="75" y1="24" x2="75" y2="192"/>
        <line x1="116" y1="24" x2="116" y2="192"/>
        <line x1="157" y1="24" x2="157" y2="192"/>
        <line x1="198" y1="24" x2="198" y2="192"/>
        <line x1="239" y1="24" x2="239" y2="192"/>
        <line x1="280" y1="24" x2="280" y2="192"/>
      </g>
      <rect x="75" y="48" width="41" height="24" fill="#ede9fe"/>
      <rect x="116" y="72" width="41" height="24" fill="#f5f3ff"/>
    </svg>`;
    return `data:image/svg+xml;charset=utf-8,${encodeURIComponent(svg)}`;
  };
  const handleGenerateSheetFilePrompt = () => {
    if (!isSheetsMode) {
      return;
    }
    addWorksheet();
    setDeckPromptInput('Generate a new Sheets file with starter tabs: Summary, Revenue, Expenses, and Forecast. Fill each tab with clean table headers and starter formulas.');
    setDeckPromptMinimized(false);
  };
  const pageNumberPositionClass = pageNumberPosition === 'left'
    ? 'left-12 text-left'
    : pageNumberPosition === 'right'
      ? 'right-12 text-right'
      : 'left-1/2 -translate-x-1/2 text-center';

  const showDocumentOutlineView = isFocusMode || activeDocView === 'document';
  const rightMiniRailWidth = 0;
  const blurEdgeGuard = 0;
  const blurLeftInset = leftSidebarOpen ? leftSidebarWidth : 0;
  const blurRightInset = (rightSidebarOpen ? rightSidebarWidth : 0) + rightMiniRailWidth + blurEdgeGuard;
  const shouldShowPromptBackdrop =
    isPromptExpanded &&
    isPromptAutoVisible &&
    !isPromptDismissed &&
    !isPromptMinimized &&
    !isComposing &&
    !(isVoiceActive && voiceTarget === 'document');
  const shouldHideDictationOverlay =
    openDropdown !== null
    || textStyleMenuOpen
    || languageMenuOpen
    || Boolean(openDocMenuId)
    || Boolean(openWorkspaceMenuId)
    || isPromptMenuOpen
    || promptTuneMenuOpen
    || promptFormatMenuOpen
    || promptLibraryOpen
    || promptHistoryFilterMenuOpen
    || Boolean(sheetToolbarMenuOpen)
    || deckToolbarMenuOpen
    || notificationsOpen
    || replayPanelOpen
    || replaySpeedMenuOpen
    || selectionActionMenu.open
    || pageContextMenu.open
    || docSearchPanelOpen
    || creationPickerOpen
    || workspaceModalOpen
    || shareModalOpen;
  const shouldHideScrollbarsForPrompt = shouldShowPromptBackdrop;
  const savedStatusLabel = formatRelativeSavedLabel(lastSavedAt);

  useEffect(() => {
    if (productMode !== 'compose') {
      return undefined;
    }

    const updateDictationAnchor = () => {
      const card = documentCardRef.current;
      if (!card) {
        setDictationAnchor({ left: window.innerWidth - 100, top: window.innerHeight / 2 });
        return;
      }

      const rect = card.getBoundingClientRect();
      const visibleLeft = Math.max(rect.left, 0);
      const visibleRight = Math.min(rect.right, window.innerWidth);
      const visibleTop = Math.max(rect.top, 0);
      const visibleBottom = Math.min(rect.bottom, window.innerHeight);

      const hasVisibleWidth = visibleRight > visibleLeft;
      const hasVisibleHeight = visibleBottom > visibleTop;

      const rightX = hasVisibleWidth ? visibleRight - 80 : window.innerWidth - 100;
      const centerY = hasVisibleHeight ? visibleTop + (visibleBottom - visibleTop) / 2 : window.innerHeight / 2;

      setDictationAnchor({ left: rightX, top: centerY });
    };

    updateDictationAnchor();
    window.addEventListener('resize', updateDictationAnchor);
    window.addEventListener('scroll', updateDictationAnchor, true);

    return () => {
      window.removeEventListener('resize', updateDictationAnchor);
      window.removeEventListener('scroll', updateDictationAnchor, true);
    };
  }, [
    productMode,
    activeDocId,
    zoomLevel,
    leftSidebarOpen,
    rightSidebarOpen,
    leftSidebarWidth,
    rightSidebarWidth,
  ]);

  useEffect(() => {
    if (productMode !== 'compose') {
      return;
    }
    // Keep dictation centered when layout panels change.
    setDictationOffset({ x: 0, y: 0 });
  }, [
    productMode,
    activeDocId,
    leftSidebarOpen,
    rightSidebarOpen,
    leftSidebarWidth,
    rightSidebarWidth,
    showDocumentOutlineView,
    isPromptExpanded,
  ]);

  const smartAssistMode = productMode === 'sheets' ? 'sheets' : productMode === 'deck' ? 'deck' : 'compose';
  const smartAssistIntro = smartAssistMode === 'sheets'
    ? 'Use AI to transform data quickly: clean, model, summarize, and detect issues.'
    : smartAssistMode === 'deck'
      ? 'Use AI to improve slide clarity, structure, and storytelling flow.'
      : 'Use AI to shape writing structure, tone, and section hierarchy.';
  const smartAssistOptions = smartAssistMode === 'sheets'
    ? [
      { key: 'fill-pattern', label: 'Fill down this pattern', detail: 'Auto-detect and extend sequences', icon: RefreshCcw, color: 'text-violet-500', prompt: 'Fill down this pattern across adjacent rows and keep sequence logic consistent.' },
      { key: 'clean-data', label: 'Clean this data', detail: 'Remove duplicates and standardize formats', icon: ShieldAlert, color: 'text-indigo-500', prompt: 'Clean this data by removing duplicates, fixing inconsistent formats, and normalizing values.' },
      { key: 'suggest-formula', label: 'Suggest a formula', detail: 'Natural language to formula', icon: Type, color: 'text-emerald-500', prompt: 'Suggest the best spreadsheet formula for the selected cells and explain assumptions briefly.' },
      { key: 'anomalies', label: 'Find anomalies', detail: 'Flag unusual values or outliers', icon: AlertTriangle, color: 'text-amber-500', prompt: 'Find anomalies and outliers in this sheet and suggest likely reasons.' },
      { key: 'pivot-summary', label: 'Create a pivot summary', detail: 'Aggregate by key dimensions', icon: Database, color: 'text-cyan-500', prompt: 'Create a pivot-style summary grouped by key dimensions with totals and highlights.' },
      { key: 'split-column', label: 'Split this column', detail: 'Parse mixed text into separate columns', icon: Scissors, color: 'text-fuchsia-500', prompt: 'Split this mixed column into clean separate columns based on detected delimiters and patterns.' },
    ]
    : smartAssistMode === 'deck'
      ? [
        { key: 'investor-tone', label: 'Investor Tone', detail: 'Sharper fundraise narrative', icon: LayoutGrid, color: 'text-violet-500', prompt: 'Turn this deck into investor tone with stronger proof points, risks, and ask clarity.' },
        { key: 'comparison-slide', label: 'Comparison Slide', detail: 'Add competitive framing visual', icon: Sparkles, color: 'text-indigo-500', prompt: 'Generate a competitor comparison slide with clear positioning and defensibility.' },
        { key: 'visual-first', label: 'Make More Visual', detail: 'Less text, stronger visuals', icon: PenTool, color: 'text-emerald-500', prompt: 'Make the deck more visual by reducing text density and introducing chart/diagram-ready layouts.' },
        { key: 'compress-flow', label: 'Reduce To 8 Slides', detail: 'Tighter executive pacing', icon: ListTodo, color: 'text-fuchsia-500', prompt: 'Reduce this presentation to 8 slides while preserving the strongest narrative arc.' },
        { key: 'speaker-notes', label: 'Speaker Notes', detail: 'Create persuasive talking tracks', icon: FileText, color: 'text-cyan-500', prompt: 'Generate speaker notes for each slide with transitions and anticipated audience questions.' },
      ]
      : [
        { key: 'adjust-tone', label: 'Adjust tone', detail: 'Make voice match audience and intent', icon: PenTool, color: 'text-violet-500', prompt: 'Adjust the tone of this content to be more professional while preserving meaning.' },
        { key: 'create-outline', label: 'Create outline', detail: 'Structure messy notes into sections', icon: ListTodo, color: 'text-indigo-500', prompt: 'Create a clear outline from this content with logical section flow.' },
        { key: 'title-headers', label: 'Generate title/headers', detail: 'Auto-structure with strong headings', icon: Type, color: 'text-emerald-500', prompt: 'Generate a strong title and section headers for this document.' },
      ];

  useEffect(() => {
    setSheetGrids((prev) => {
      const next = { ...prev };
      sheetsData.forEach((sheet) => {
        if (!next[sheet.id]) {
          next[sheet.id] = { rows: 22, cols: 7, cells: Array.from({ length: 22 }, () => Array.from({ length: 7 }, () => '')) };
        }
      });
      Object.keys(next).forEach((key) => {
        const id = Number(key);
        if (!sheetsData.some((sheet) => sheet.id === id)) {
          delete next[id];
        }
      });
      return next;
    });
  }, [sheetsData]);

  useEffect(() => {
    if (!pageContextMenu.open) {
      return undefined;
    }
    const onPointerDown = (event) => {
      if (pageContextMenuRef.current && !pageContextMenuRef.current.contains(event.target)) {
        setPageContextMenu((prev) => ({ ...prev, open: false }));
      }
    };
    window.addEventListener('pointerdown', onPointerDown);
    return () => window.removeEventListener('pointerdown', onPointerDown);
  }, [pageContextMenu.open]);

  useEffect(() => {
    let cancelled = false;

    const capturePreview = async () => {
      try {
        if (isSheetsMode) {
          const target = sheetCanvasPreviewRef.current;
          if (!target || !activeSheet?.id) {
            return;
          }
          const canvas = await html2canvas(target, {
            scale: 0.45,
            backgroundColor: '#ffffff',
            useCORS: true,
            logging: false,
          });
          if (cancelled) {
            return;
          }
          const dataUrl = canvas.toDataURL('image/png', 0.82);
          setSheetSnapshotPreviews((prev) => ({ ...prev, [activeSheet.id]: dataUrl }));
          return;
        }

        const target = deckCanvasPreviewRef.current;
        if (!target || !activeDeckSlide?.id) {
          return;
        }
        const canvas = await html2canvas(target, {
          scale: 0.45,
          backgroundColor: '#ffffff',
          useCORS: true,
          logging: false,
        });
        if (cancelled) {
          return;
        }
        const dataUrl = canvas.toDataURL('image/png', 0.82);
        setDeckSnapshotPreviews((prev) => ({ ...prev, [activeDeckSlide.id]: dataUrl }));
      } catch (_error) {
        // Ignore preview capture failures and keep SVG fallback thumbnails.
      }
    };

    const timer = setTimeout(capturePreview, 220);
    return () => {
      cancelled = true;
      clearTimeout(timer);
    };
  }, [
    isSheetsMode,
    productMode,
    activeDeckSlide?.id,
    activeDeckSlide?.title,
    activeDeckSlide?.subtitle,
    activeSheet?.id,
    activeSheet?.title,
    activeSheet?.subtitle,
    sheetsTitle,
  ]);

  if (productMode === 'landing') {
    return (
      <RegaarderComposeLanding
        onExit={createComposeExperience}
        onLaunch={openLandingWorkspace}
      />
    );
  }

  if (productMode === 'deck' || productMode === 'sheets') {
    return (
      <div className={`flex h-screen bg-[#f3f5fb] text-gray-800 overflow-hidden relative ${isDarkMode ? 'app-dark' : ''} ${shouldHideScrollbarsForPrompt ? 'hide-side-scrollbar' : ''}`} style={{ fontFamily: resolveFontFamily(editorFont) }}>
        {toastMessage && (
          <div className="absolute top-16 right-6 max-w-[380px] bg-white/95 backdrop-blur border border-violet-100 text-slate-700 text-xs font-medium px-4 py-2.5 rounded-xl shadow-[0_12px_35px_-18px_rgba(91,33,182,0.45)] z-[420] flex items-center gap-2 transition-all duration-300">
            <span className="inline-block w-2 h-2 rounded-full bg-violet-500"></span>
            <span>{toastMessage}</span>
          </div>
        )}

        {creationPickerOpen && (
          <div className="absolute inset-0 z-[620] bg-slate-950/45 backdrop-blur-sm flex items-center justify-center p-4">
            <div className="w-[680px] max-w-[95vw] rounded-2xl bg-white border border-gray-200 shadow-[0_30px_80px_-45px_rgba(15,23,42,0.8)] p-6">
              <div className="flex items-start justify-between gap-4 mb-5">
                <div>
                  <h3 className="text-lg font-semibold text-gray-900">Create New Project</h3>
                  <p className="text-sm text-gray-500 mt-1">Choose your workspace type to start with the right canvas.</p>
                </div>
                <button
                  type="button"
                  onClick={() => setCreationPickerOpen(false)}
                  className="p-2 rounded-full text-gray-400 hover:text-gray-700 hover:bg-gray-100"
                  title="Close"
                >
                  <X size={16} />
                </button>
              </div>

              <div className="grid grid-cols-1 md:grid-cols-3 gap-3">
                <button
                  type="button"
                  onClick={createComposeExperience}
                  className="group text-left rounded-xl border border-gray-200 p-4 hover:border-violet-300 hover:bg-violet-50/40 transition-colors"
                >
                  <div className="w-9 h-9 rounded-lg bg-violet-100 text-violet-700 flex items-center justify-center mb-3">
                    <FileText size={18} />
                  </div>
                  <div className="text-sm font-semibold text-gray-900 mb-1">Compose</div>
                  <p className="text-xs text-gray-600">Our document workspace for writing, planning, and AI-assisted editing.</p>
                </button>

                <button
                  type="button"
                  onClick={createDeckExperience}
                  className="group text-left rounded-xl border border-violet-300 bg-violet-50/50 p-4 hover:bg-violet-50 transition-colors"
                >
                  <div className="w-9 h-9 rounded-lg bg-violet-600 text-white flex items-center justify-center mb-3">
                    <LayoutGrid size={18} />
                  </div>
                  <div className="text-sm font-semibold text-gray-900 mb-1">Deck</div>
                  <p className="text-xs text-gray-600">Our presentation workspace for slide-first storytelling and AI deck intelligence.</p>
                </button>

                <button
                  type="button"
                  onClick={createSheetsExperience}
                  className="group text-left rounded-xl border border-emerald-200 bg-emerald-50/50 p-4 hover:bg-emerald-50 transition-colors"
                >
                  <div className="w-9 h-9 rounded-lg bg-emerald-600 text-white flex items-center justify-center mb-3">
                    <Database size={18} />
                  </div>
                  <div className="text-sm font-semibold text-gray-900 mb-1">Sheets</div>
                  <p className="text-xs text-gray-600">Our spreadsheet workspace for AI-native analysis, modeling, and planning.</p>
                </button>
              </div>
            </div>
          </div>
        )}

        {shareModalOpen && (
          <div className="absolute inset-0 z-[520] bg-slate-900/30 backdrop-blur-sm flex items-center justify-center p-4">
            <div className="w-[640px] max-w-[95vw] rounded-2xl bg-white border border-slate-200 shadow-[0_30px_90px_-45px_rgba(15,23,42,0.65)] p-6">
              <div className="flex items-start justify-between gap-4 mb-5">
                <div>
                  <h3 className="text-lg font-semibold text-slate-900">Share from Compose</h3>
                  <p className="text-xs text-slate-500 mt-1">{shareTargetDocTitle}</p>
                </div>
                <button
                  type="button"
                  onClick={() => setShareModalOpen(false)}
                  className="p-2 rounded-full text-slate-400 hover:text-slate-700 hover:bg-slate-100"
                  title="Close"
                >
                  <X size={16} />
                </button>
              </div>

              <div className="grid grid-cols-1 md:grid-cols-3 gap-2 mb-5">
                {[
                  { key: 'friends', label: 'Copy link', sub: 'Share instantly' },
                  { key: 'apps', label: 'Native apps', sub: 'Use system sheet' },
                  { key: 'downloads', label: 'Download', sub: 'Export file' },
                ].map((destination) => (
                  <button
                    key={destination.key}
                    type="button"
                    onClick={() => setShareDestination(destination.key)}
                    className={`text-left rounded-xl border px-3 py-2.5 transition-colors ${shareDestination === destination.key ? 'border-violet-300 bg-violet-50/70 text-violet-700' : 'border-slate-200 bg-white text-slate-700 hover:bg-slate-50'}`}
                  >
                    <div className="text-sm font-semibold">{destination.label}</div>
                    <div className="text-[11px] text-slate-500">{destination.sub}</div>
                  </button>
                ))}
              </div>

              <div className="mb-4">
                <label className="text-[11px] font-semibold text-slate-500 uppercase tracking-wide block mb-2">Access level</label>
                <div className="flex flex-wrap items-center gap-2">
                  {['Viewer', 'Commenter', 'Editor'].map((level) => (
                    <button
                      key={level}
                      type="button"
                      onClick={() => setShareAccess(level)}
                      className={`px-3 py-1.5 rounded-full text-xs border transition-colors ${shareAccess === level ? 'bg-violet-50 border-violet-300 text-violet-700' : 'border-slate-200 text-slate-600 hover:bg-slate-50'}`}
                    >
                      {level}
                    </button>
                  ))}
                </div>
              </div>

              <div className="mb-5">
                <label className="text-[11px] font-semibold text-slate-500 uppercase tracking-wide block mb-2">File format</label>
                <div className="flex flex-wrap gap-2">
                  {['Compose (.cmp)', 'PDF', 'DOC (Word-compatible)', 'Markdown', 'Plain Text', 'HTML'].map((format) => (
                    <button
                      key={format}
                      type="button"
                      onClick={() => setShareFormat(format)}
                      className={`px-2.5 py-1.5 rounded-lg text-xs border transition-colors ${shareFormat === format ? 'border-violet-300 bg-violet-50 text-violet-700' : 'border-slate-200 text-slate-600 hover:bg-slate-50'}`}
                    >
                      {format}
                    </button>
                  ))}
                </div>
              </div>

              {shareDestination === 'friends' && (
                <div className="mb-5 rounded-xl border border-slate-200 bg-slate-50 p-3">
                  <div className="text-[11px] font-semibold text-slate-500 uppercase tracking-wide mb-1">Share link</div>
                  <div className="text-xs text-slate-600 break-all">{shareLink}</div>
                </div>
              )}

              <div className="flex items-center justify-end gap-2">
                <button
                  onClick={() => setShareModalOpen(false)}
                  className="px-3 py-2 rounded-lg text-xs border border-slate-200 text-slate-600 hover:bg-slate-50"
                >
                  Cancel
                </button>
                <button
                  onClick={handleShareModalConfirm}
                  className="px-4 py-2 rounded-lg text-xs font-semibold bg-violet-600 text-white hover:bg-violet-700"
                >
                  {shareDestination === 'downloads' ? `Export ${shareFormat}` : shareDestination === 'apps' ? 'Share to Apps' : 'Copy Link'}
                </button>
              </div>
            </div>
          </div>
        )}

        <aside
          className="border-r border-gray-100 flex flex-col bg-[#FAFAFC] shrink-0 select-none overflow-hidden transition-[width] duration-200"
          style={{ width: leftSidebarOpen ? `${leftSidebarWidth}px` : '0px' }}
        >
          <div className="h-14 flex items-center justify-between px-4">
            <div className="flex items-center gap-2 font-bold text-gray-900 text-lg">
              <svg viewBox="0 0 24 24" fill="none" xmlns="http://www.w3.org/2000/svg" className="w-6 h-6 text-violet-600">
                <path d="M12 2C6.477 2 2 6.477 2 12s4.477 10 12 10c3.1 0 5.89-1.41 1.77-5.5L12 13.5L8.5 17H6.5L12 11.5L17.5 17H15.5L12 13.5L15.5 10H19.5C21.1 12 22 14.4 22 12c0-5.523-4.477-10-10-10z" fill="currentColor" />
              </svg>
              <span className="tracking-tight text-gray-900">Regaarder Compose</span>
            </div>
          </div>

          <div className="px-4 py-3">
            <button
              onClick={openCreationPicker}
              className="w-full bg-violet-600 hover:bg-violet-700 text-white rounded-lg py-2 flex items-center justify-center gap-2 font-medium text-sm transition-colors active:scale-95"
            >
              <Plus size={16} />
              New Composition
            </button>
          </div>

          <div className="px-4 pb-2">
            <div className="relative">
              <Search size={14} className="absolute left-2.5 top-2 text-gray-400" />
              <input
                type="text"
                placeholder="Search compositions..."
                className="w-full bg-white border border-gray-200 rounded-md py-1.5 pl-8 pr-2 text-sm focus:outline-none focus:border-violet-300"
              />
              <span className="absolute right-2.5 top-1.5 text-xs text-gray-400 border border-gray-200 rounded px-1">K</span>
            </div>
          </div>

          <div className="px-3 pb-2">
            <div className="rounded-xl border border-violet-100 bg-white/80 p-2.5">
              <div className="flex items-center justify-between mb-2">
                <span className="text-[10px] font-semibold tracking-[0.12em] text-violet-700 uppercase">Document Outline</span>
                <span className="text-[10px] font-semibold text-violet-600 bg-violet-50 border border-violet-100 rounded-full px-2 py-0.5">{Math.max(0, documentOutlineItems.length - 1)} Sections</span>
              </div>
              {documentOutlineItems.length > 1 ? (
                <div className="max-h-40 overflow-y-auto pr-1 space-y-0.5 thin-scrollbar">
                  {documentOutlineItems.map((item, index) => (
                    <button
                      key={`${item.id}-${index}`}
                      type="button"
                      onClick={() => jumpToOutlineItem(item)}
                      className={`w-full text-left rounded-md py-1 text-xs transition-colors ${item.isTitle ? 'font-semibold text-gray-800 hover:bg-violet-50 px-2' : 'text-gray-600 hover:bg-gray-100'}`}
                      style={item.isTitle ? undefined : { paddingLeft: `${10 + Math.max(0, item.level - 1) * 12}px`, paddingRight: '6px' }}
                      title={item.label}
                    >
                      <span className="block truncate">{item.label}</span>
                    </button>
                  ))}
                </div>
              ) : (
                <div className="text-[11px] text-gray-500 px-1.5 py-2">Generate or format headings to populate the outline.</div>
              )}
            </div>
          </div>

          <div className="flex-1 overflow-y-auto px-2 space-y-0.5">
            <button className="w-full flex items-center gap-3 px-2 py-1.5 text-sm text-gray-600 hover:bg-gray-100 rounded-md transition-colors"><Home size={16} /> Home</button>
            <button className="w-full flex items-center gap-3 px-2 py-1.5 text-sm text-gray-600 hover:bg-gray-100 rounded-md transition-colors"><BookOpen size={16} /> Library</button>
            <button className="w-full flex items-center gap-3 px-2 py-1.5 text-sm bg-violet-50 text-violet-700 rounded-md transition-colors"><LayoutGrid size={16} /> Deck</button>
            <button className="w-full flex items-center justify-between px-2 py-1.5 text-sm text-gray-600 hover:bg-gray-100 rounded-md transition-colors"><div className="flex items-center gap-3"><Inbox size={16} /> Inbox</div><span className="bg-gray-100 text-gray-500 text-xs px-1.5 py-0.5 rounded-full font-medium">12</span></button>
            <button className="w-full flex items-center gap-3 px-2 py-1.5 text-sm text-gray-600 hover:bg-gray-100 rounded-md transition-colors"><Star size={16} /> Starred</button>
            <button className="w-full flex items-center gap-3 px-2 py-1.5 text-sm text-gray-600 hover:bg-gray-100 rounded-md transition-colors"><Users size={16} /> Shared</button>
            <button className="w-full flex items-center gap-3 px-2 py-1.5 text-sm text-gray-600 hover:bg-gray-100 rounded-md transition-colors"><Database size={16} /> Memory</button>
            <button className="w-full flex items-center gap-3 px-2 py-1.5 text-sm text-gray-600 hover:bg-gray-100 rounded-md transition-colors mb-4"><Trash size={16} /> Trash</button>

            <div className="flex items-center justify-between px-2 py-2 mt-4">
              <span className="text-xs font-semibold text-gray-500 uppercase tracking-wider">Workspaces</span>
              <button onClick={openCreateWorkspaceModal} className="text-gray-400 hover:text-gray-600"><Plus size={14} /></button>
            </div>

            <div className="space-y-1 pb-3">
              {workspaces.map((workspace) => (
                <button key={workspace.id} className="w-full flex items-center justify-between px-2 py-1.5 text-sm text-gray-700 hover:bg-gray-100 rounded-md font-medium transition-colors">
                  <div className="flex items-center gap-3"><WorkspaceIcon letter={workspace.letter} colorClass={workspace.colorClass} /> {workspace.name}</div>
                  <MoreHorizontal size={14} className="text-gray-400" />
                </button>
              ))}
            </div>
          </div>

          <div className="p-4 border-t border-gray-100 bg-[#FAFAFC]">
            <button className="flex items-center gap-3 text-sm text-gray-600 hover:text-gray-900 w-full transition-colors"><Settings size={16} /> Settings</button>
          </div>
        </aside>

        {deckSlidesPanelOpen && (
        <aside className="w-[220px] border-r border-gray-200 bg-[#f8f9fd] flex flex-col">
          <div className="px-4 py-4 border-b border-gray-200">
            <div className="flex items-start justify-between gap-2">
              <div>
                <div className="text-sm font-semibold text-gray-800">{isSheetsMode ? 'Sheets' : 'Narrative'}</div>
                <div className="text-[11px] text-gray-500 mt-1">{isSheetsMode ? 'Financial models' : 'Investor Pitch'}</div>
              </div>
              <button
                type="button"
                onClick={() => setDeckSlidesPanelOpen(false)}
                className="w-6 h-6 rounded-md border border-gray-200 bg-white text-gray-500 hover:text-gray-700 hover:bg-gray-100 flex items-center justify-center"
                title="Close panel"
                aria-label="Close panel"
              >
                <X size={12} />
              </button>
            </div>
          </div>
          <div className="flex-1 overflow-y-auto p-3 space-y-2">
            {(isSheetsMode ? sheetsData : deckSlides).length === 0 && (
              <div className="rounded-xl border border-dashed border-gray-300 bg-white p-3 text-xs text-gray-500">
                {isSheetsMode ? 'No worksheets yet. Create one to see a live preview.' : 'No slides yet. Create one to see a live preview.'}
              </div>
            )}
            {(isSheetsMode ? sheetsData : deckSlides).map((item, index, collection) => {
              const isActive = isSheetsMode ? item.id === activeSheetId : item.id === activeDeckSlideId;
              const currentSection = !isSheetsMode ? (item.section || inferDeckStorySection(item, index, collection.length)) : '';
              const previousSection = !isSheetsMode && index > 0
                ? (collection[index - 1].section || inferDeckStorySection(collection[index - 1], index - 1, collection.length))
                : '';
              const shouldShowSectionHeader = !isSheetsMode && (index === 0 || currentSection !== previousSection);
              return (
                <React.Fragment key={item.id}>
                  {shouldShowSectionHeader && (
                    <div className="pt-1 pb-0.5 px-1">
                      <div className="inline-flex items-center rounded-full border border-violet-100 bg-violet-50/70 px-2 py-0.5 text-[10px] font-semibold tracking-wide text-violet-700">
                        {currentSection}
                      </div>
                    </div>
                  )}
                  <button
                    type="button"
                    onContextMenu={(event) => {
                      event.preventDefault();
                      setPageContextMenu({
                        open: true,
                        x: event.clientX,
                        y: event.clientY,
                        itemId: item.id,
                        isSheets: isSheetsMode,
                      });
                    }}
                    onClick={() => {
                      if (isSheetsMode) {
                        setActiveSheetId(item.id);
                        setSheetsTitle(item.title);
                      } else {
                        setActiveDeckSlideId(item.id);
                      }
                    }}
                    className={`w-full rounded-xl border p-2 text-left transition-colors ${isActive ? 'border-violet-300 bg-violet-50/70' : 'border-gray-200 bg-white hover:bg-gray-50'}`}
                  >
                    <div className="flex items-start gap-2">
                      <div className="w-20 h-12 rounded-md shrink-0 relative overflow-hidden border border-gray-200 bg-white">
                        <img
                          src={isSheetsMode
                            ? (sheetSnapshotPreviews[item.id] || buildSheetPreviewDataUri(item))
                            : (deckSnapshotPreviews[item.id] || buildDeckPreviewDataUri(item))}
                          alt={isSheetsMode ? `Sheet preview ${item.title}` : `Slide preview ${item.title}`}
                          className="w-full h-full object-cover"
                          loading="lazy"
                        />
                      </div>
                      <div className="min-w-0">
                        <div className="text-[10px] text-gray-400">{String(item.id).padStart(2, '0')}</div>
                        <div className="text-xs font-semibold text-gray-800 truncate">{item.title}</div>
                        <div className="text-[11px] text-gray-500 truncate">{item.subtitle}</div>
                      </div>
                    </div>
                  </button>
                </React.Fragment>
              );
            })}
            <button
              type="button"
              onClick={isSheetsMode ? addWorksheet : addDeckSlide}
              className="w-full rounded-xl border border-dashed border-gray-300 py-2 text-xs font-medium text-gray-500 hover:border-violet-300 hover:text-violet-700"
            >
              {isSheetsMode ? '+ Add worksheet' : '+ New slide'}
            </button>
          </div>
        </aside>
        )}

        <main className="flex-1 min-w-0 flex flex-col bg-[#f5f7fc]">
          <header className="h-14 px-5 border-b border-gray-200 bg-white flex items-center justify-between">
            <div className="flex items-center gap-4 min-w-0">
              <button
                type="button"
                onClick={() => setLeftSidebarOpen((prev) => !prev)}
                className={`p-1.5 rounded-md border transition-colors ${leftSidebarOpen ? 'text-violet-700 border-violet-200 bg-violet-50 hover:bg-violet-100' : 'text-gray-400 border-gray-200 hover:text-gray-700 hover:bg-gray-100'}`}
                title={leftSidebarOpen ? 'Hide Regaarder panel' : 'Show Regaarder panel'}
                aria-label={leftSidebarOpen ? 'Hide Regaarder panel' : 'Show Regaarder panel'}
              >
                <Sidebar size={16} />
              </button>
              <button
                type="button"
                onClick={() => setDeckSlidesPanelOpen((prev) => !prev)}
                className="p-1.5 rounded-md text-gray-400 hover:text-gray-700 hover:bg-gray-100"
                title={deckSlidesPanelOpen ? 'Hide slides panel' : 'Show slides panel'}
              >
                {deckSlidesPanelOpen ? <ChevronLeft size={16} /> : <ChevronRight size={16} />}
              </button>
              <div className="text-sm font-semibold text-gray-900 truncate">{isSheetsMode ? 'Regaarder Sheets' : 'Regaarder Deck'}</div>
              <input
                type="text"
                value={isSheetsMode ? sheetsTitle : deckTitle}
                onChange={(event) => isSheetsMode ? setSheetsTitle(event.target.value) : setDeckTitle(event.target.value)}
                className="text-sm text-gray-500 truncate bg-transparent border border-transparent hover:border-gray-200 focus:border-violet-300 rounded px-2 py-0.5 outline-none"
                placeholder={isSheetsMode ? 'Untitled sheetbook' : 'Untitled deck'}
              />
              <div className="text-xs text-gray-400">{savedStatusLabel}</div>
            </div>
            <div className="flex items-center gap-3">
              <button
                type="button"
                onClick={() => setIsDarkMode((prev) => !prev)}
                className="w-7 h-7 flex items-center justify-center rounded-md text-gray-400 hover:text-gray-700 hover:bg-gray-100 transition-colors"
                title={isDarkMode ? 'Switch to light mode' : 'Switch to dark mode'}
              >
                {isDarkMode ? <Sun size={14} /> : <Moon size={14} />}
              </button>
              <button
                type="button"
                onClick={() => openShareModal(activeDocId || documents[0]?.id)}
                className="bg-violet-600 hover:bg-violet-700 text-white text-sm px-4 py-1.5 rounded-lg flex items-center gap-2"
              >
                <Users size={14} /> Share
              </button>
              <div className="flex -space-x-2">
                <img className="w-7 h-7 rounded-full border-2 border-white" src="https://images.unsplash.com/photo-1534528741775-53994a69daeb?auto=format&fit=crop&w=80&q=80" alt="Sarah" />
                <img className="w-7 h-7 rounded-full border-2 border-white" src="https://images.unsplash.com/photo-1500648767791-00dcc994a43e?auto=format&fit=crop&w=80&q=80" alt="Mike" />
                <img className="w-7 h-7 rounded-full border-2 border-white" src="https://images.unsplash.com/photo-1494790108377-be9c29b29330?auto=format&fit=crop&w=80&q=80" alt="Maya" />
              </div>
              <div className="relative" ref={notificationsPanelRef}>
                <button
                  type="button"
                  onClick={() => {
                    setReplaySpeedMenuOpen(false);
                    setNotificationsOpen((prev) => !prev);
                    setNotifications((prev) => prev.map((item) => ({ ...item, unread: false })));
                  }}
                  className="text-gray-400 hover:text-gray-600 relative"
                  title="Notifications"
                >
                  <Bell size={18} />
                  {notifications.length > 0 && (
                    <span className="absolute top-[1px] right-[6px] w-1.5 h-1.5 bg-violet-500 rounded-full"></span>
                  )}
                </button>
                {notificationsOpen && (
                  <div className="absolute right-0 top-8 z-[450] w-[300px] rounded-2xl border border-violet-100 bg-white shadow-[0_24px_60px_-28px_rgba(15,23,42,0.45)] p-2">
                    <div className="px-2 py-1.5 text-[11px] font-semibold tracking-[0.08em] uppercase text-violet-600">Notifications</div>
                    <div className="max-h-[260px] overflow-y-auto thin-scrollbar space-y-1 px-1 pb-1">
                      {notifications.map((item) => (
                        <div key={item.id} className="rounded-xl border border-slate-100 px-3 py-2.5 hover:bg-violet-50/50">
                          <div className="flex items-start justify-between gap-2">
                            <div className="text-[12px] font-medium text-slate-800">{item.title}</div>
                            {item.unread && <span className="mt-1 h-2 w-2 rounded-full bg-violet-500" />}
                          </div>
                          <div className="mt-0.5 text-[11px] text-slate-500">{item.detail}</div>
                        </div>
                      ))}
                    </div>
                  </div>
                )}
              </div>
            </div>
          </header>

          <div className="flex-1 min-h-0 p-4 flex gap-4">
            <section className="flex-1 min-w-0 rounded-2xl border border-gray-200 bg-white p-4 flex flex-col overflow-y-auto thin-scrollbar">
              <div className="mx-auto w-full max-w-[980px] pb-4">
                {isSheetsMode ? (
                  <div ref={sheetCanvasPreviewRef} className="rounded-2xl overflow-hidden border border-gray-200 bg-white shadow-[0_25px_55px_-40px_rgba(15,23,42,0.45)]">
                    <div className="px-4 py-3 border-b border-gray-100 bg-[#FAFAFC] flex items-center gap-3 text-xs text-gray-600">
                      {['Data', 'Insert', 'Analyze', 'Automate', 'AI'].map((tab) => (
                        <button
                          key={tab}
                          type="button"
                          onClick={() => {
                            setSheetToolbarTab(tab);
                            showToast(`${tab} tools ready`);
                          }}
                          className={`px-2 py-1 rounded border ${sheetToolbarTab === tab ? 'bg-violet-50 border-violet-200 text-violet-700' : 'bg-white border-gray-200'}`}
                        >
                          {tab}
                        </button>
                      ))}
                    </div>
                    <div className="px-4 py-2 border-b border-gray-100 bg-white flex items-center gap-3 text-[11px] text-gray-500">
                      <Search size={12} />
                      <button type="button" onClick={() => showToast('Undo not available in demo')}><Undo2 size={12} /></button>
                      <button type="button" onClick={() => showToast('Redo not available in demo')}><Redo2 size={12} /></button>
                      <div className="relative flex items-center gap-1" ref={sheetToolbarMenuRef}>
                        <div className="relative">
                          <button
                            type="button"
                            onClick={() => setSheetToolbarMenuOpen((prev) => prev === 'font' ? null : 'font')}
                            className="inline-flex items-center gap-1 border border-gray-200 rounded px-1.5 py-0.5 bg-white text-[11px] hover:bg-gray-50"
                          >
                            <span>{sheetToolbarFont}</span>
                            <ChevronDown size={11} />
                          </button>
                          {sheetToolbarMenuOpen === 'font' && (
                            <div className="absolute z-[420] top-full mt-1 left-0 w-32 rounded-lg border border-gray-200 bg-white shadow-lg p-1">
                              {['Inter', 'Arial', 'Roboto', 'Lato', 'Georgia'].map((font) => (
                                <button
                                  key={font}
                                  type="button"
                                  onClick={() => {
                                    setSheetToolbarFont(font);
                                    setSheetToolbarMenuOpen(null);
                                  }}
                                  className={`w-full text-left px-2 py-1 rounded text-[11px] ${sheetToolbarFont === font ? 'bg-violet-50 text-violet-700' : 'text-gray-600 hover:bg-gray-50'}`}
                                >
                                  {font}
                                </button>
                              ))}
                            </div>
                          )}
                        </div>
                        <div className="relative">
                          <button
                            type="button"
                            onClick={() => setSheetToolbarMenuOpen((prev) => prev === 'size' ? null : 'size')}
                            className="inline-flex items-center gap-1 border border-gray-200 rounded px-1 py-0.5 bg-white text-[11px] hover:bg-gray-50"
                          >
                            <span>{sheetToolbarSize}</span>
                            <ChevronDown size={11} />
                          </button>
                          {sheetToolbarMenuOpen === 'size' && (
                            <div className="absolute z-[420] top-full mt-1 left-0 w-16 rounded-lg border border-gray-200 bg-white shadow-lg p-1">
                              {[8, 9, 10, 11, 12, 14, 16, 18].map((size) => (
                                <button
                                  key={size}
                                  type="button"
                                  onClick={() => {
                                    setSheetToolbarSize(size);
                                    setSheetToolbarMenuOpen(null);
                                  }}
                                  className={`w-full text-left px-2 py-1 rounded text-[11px] ${sheetToolbarSize === size ? 'bg-violet-50 text-violet-700' : 'text-gray-600 hover:bg-gray-50'}`}
                                >
                                  {size}
                                </button>
                              ))}
                            </div>
                          )}
                        </div>
                      </div>
                      <button type="button" onClick={() => setSheetToolbarBold((prev) => !prev)} className={`px-1 ${sheetToolbarBold ? 'font-bold text-gray-800' : ''}`}>B</button>
                      <button type="button" onClick={() => setSheetToolbarItalic((prev) => !prev)} className={`px-1 ${sheetToolbarItalic ? 'italic text-gray-800' : ''}`}>I</button>
                      <button type="button" onClick={() => setSheetToolbarUnderline((prev) => !prev)} className={`px-1 ${sheetToolbarUnderline ? 'underline text-gray-800' : ''}`}>U</button>
                      <span className="mx-1">-</span>
                      <span className="mx-1">=</span>
                      <span className="mx-1">...</span>
                      <span className="mx-1">$</span>
                      <span className="mx-1">%</span>
                      <span className="mx-1">.0</span>
                      <button type="button" onClick={addSheetRow} className="px-1.5 py-0.5 border border-gray-200 rounded bg-gray-50">+ Row</button>
                      <button type="button" onClick={removeSheetRow} className="px-1.5 py-0.5 border border-gray-200 rounded bg-gray-50">- Row</button>
                      <button type="button" onClick={addSheetColumn} className="px-1.5 py-0.5 border border-gray-200 rounded bg-gray-50">+ Col</button>
                      <button type="button" onClick={removeSheetColumn} className="px-1.5 py-0.5 border border-gray-200 rounded bg-gray-50">- Col</button>
                      <span className="ml-auto">More</span>
                    </div>
                    <div className="px-4 py-1.5 border-b border-gray-100 bg-white flex items-center gap-3 text-[11px] text-gray-600">
                      <div className="w-12 text-center border border-gray-200 rounded bg-[#FAFAFC]">{toColumnLabel(Math.max(0, selectedSheetCell.col - 1))}{selectedSheetCell.row}</div>
                      <span className="text-gray-400">fx</span>
                      <input
                        type="text"
                        value={activeSheetGrid.cells?.[selectedSheetCell.row - 1]?.[selectedSheetCell.col - 1] || ''}
                        onChange={(event) => updateSheetCell(activeSheetId, selectedSheetCell.row - 1, selectedSheetCell.col - 1, event.target.value)}
                        className="flex-1 border border-gray-200 rounded bg-[#FAFAFC] px-2 py-1"
                        placeholder="Enter value or formula"
                      />
                    </div>
                    <div
                      className="grid border-b border-gray-100 bg-[#FAFAFC] text-[11px] text-gray-500"
                      style={{ gridTemplateColumns: `48px repeat(${activeSheetGrid.cols}, minmax(100px, 1fr))` }}
                    >
                      <div className="h-8 border-r border-gray-100" />
                      {Array.from({ length: activeSheetGrid.cols }, (_, colIndex) => toColumnLabel(colIndex)).map((col) => (
                        <div key={col} className="h-8 flex items-center justify-center border-r border-gray-100 last:border-r-0">{col}</div>
                      ))}
                    </div>
                    <div className="max-h-[440px] overflow-y-auto thin-scrollbar">
                      <div className="grid grid-cols-[48px_1fr]">
                        <div className="border-r border-gray-100 bg-[#FAFAFC]">
                          {Array.from({ length: activeSheetGrid.rows }, (_, idx) => idx + 1).map((num) => (
                            <div key={num} className="h-9 border-b border-gray-100 text-[11px] text-gray-500 flex items-center justify-center">{num}</div>
                          ))}
                        </div>
                        <div
                          className="grid"
                          style={{ gridTemplateColumns: `repeat(${activeSheetGrid.cols}, minmax(100px, 1fr))` }}
                        >
                          {Array.from({ length: activeSheetGrid.rows }).flatMap((_, rowIndex) => (
                            Array.from({ length: activeSheetGrid.cols }).map((__, colIndex) => {
                              const isSelected = selectedSheetCell.row === rowIndex + 1 && selectedSheetCell.col === colIndex + 1;
                              return (
                                <input
                                  key={`${rowIndex + 1}-${colIndex + 1}`}
                                  value={activeSheetGrid.cells?.[rowIndex]?.[colIndex] || ''}
                                  onFocus={() => setSelectedSheetCell({ row: rowIndex + 1, col: colIndex + 1 })}
                                  onChange={(event) => updateSheetCell(activeSheetId, rowIndex, colIndex, event.target.value)}
                                  className={`h-9 border-b border-r border-gray-100 px-2 text-xs bg-white focus:outline-none ${isSelected ? 'ring-1 ring-violet-300' : ''}`}
                                  style={{
                                    fontFamily: sheetToolbarFont,
                                    fontSize: `${sheetToolbarSize}px`,
                                    fontWeight: sheetToolbarBold ? 700 : 400,
                                    fontStyle: sheetToolbarItalic ? 'italic' : 'normal',
                                    textDecoration: sheetToolbarUnderline ? 'underline' : 'none',
                                  }}
                                />
                              );
                            })
                          ))}
                        </div>
                      </div>
                    </div>
                    <div className="px-4 py-2 border-t border-gray-100 bg-white flex items-center gap-2 text-[11px]">
                      {['Summary', 'Revenue', 'Expenses', 'Profit & Loss', 'Cash Flow', '+'].map((tab) => (
                        <button key={tab} className={`px-2.5 py-1 rounded ${tab === 'Summary' ? 'bg-violet-50 text-violet-700 border border-violet-200' : 'text-gray-500 hover:bg-gray-50'}`}>{tab}</button>
                      ))}
                    </div>
                    <div className="px-4 py-3 border-t border-gray-100 bg-[#FAFAFC]">
                      <div className="rounded-2xl border border-gray-200 bg-white px-3 py-2.5 text-xs text-gray-500 flex items-center gap-2">
                        <button
                          type="button"
                          onClick={() => promptFileInputRef.current?.click()}
                          className="w-5 h-5 rounded-full text-gray-400 hover:bg-gray-100 flex items-center justify-center"
                          title="Attach files"
                        >
                          +
                        </button>
                        <span className="truncate flex-1">Ask anything about your data or tell Sheets what to do...</span>
                        {['Analyze this data', 'Create plot table', 'Forecast next quarter', 'Find anomalies', 'Compare to last year'].map((chip) => (
                          <button
                            key={chip}
                            type="button"
                            onClick={() => {
                              setDeckPromptInput(chip);
                              setDeckPromptMinimized(false);
                            }}
                            className="hidden md:inline-flex px-2 py-1 rounded-full border border-gray-200 text-[10px] text-gray-500 hover:border-violet-300 hover:text-violet-700"
                          >
                            {chip}
                          </button>
                        ))}
                        <button
                          type="button"
                          onClick={async () => {
                            await toggleVoiceRecording('chat');
                          }}
                          className="w-5 h-5 rounded-full text-violet-500 hover:bg-violet-50 flex items-center justify-center"
                          title="Voice prompt"
                        >
                          <Mic size={12} />
                        </button>
                        <button
                          type="button"
                          onClick={() => {
                            const basePrompt = deckPromptInput.trim() || 'Analyze this sheet and propose insights.';
                            handleAISubmit(basePrompt, { source: 'chat', attachments: promptAttachments });
                            setActiveRightTab(productMode === 'deck' ? 'assistant' : 'chat');
                            setRightSidebarOpen(true);
                          }}
                          className="w-6 h-6 rounded-full bg-violet-600 text-white flex items-center justify-center"
                          title="Send to AI"
                        >
                          <ArrowUp size={12} />
                        </button>
                      </div>
                    </div>
                  </div>
                ) : (
                  <div className="space-y-3">
                    <div className="rounded-xl border border-gray-200 bg-white overflow-hidden">
                      <div className="h-10 px-3 border-b border-gray-100 flex items-center gap-2 text-xs text-gray-600">
                        <button className="p-1 rounded hover:bg-gray-100"><Home size={12} /></button>
                        <ChevronRight size={11} className="text-gray-400" />
                        <button className="px-2.5 py-1 rounded-lg border border-gray-200 bg-white text-gray-700 inline-flex items-center gap-1">
                          <span>Untitled presentation</span>
                          <ChevronDown size={11} />
                        </button>
                        <button type="button" onClick={addDeckSlide} className="w-6 h-6 rounded-full border border-gray-200 text-gray-500 hover:bg-gray-50 inline-flex items-center justify-center">
                          <Plus size={12} />
                        </button>
                        <div className="ml-auto flex items-center gap-2">
                          <button
                            type="button"
                            onClick={generateOriginalDeckDesign}
                            className="px-2.5 py-1 rounded-lg border border-violet-200 bg-violet-50 text-violet-700 hover:bg-violet-100"
                          >
                            Original Design
                          </button>
                          <button type="button" onClick={() => showToast('Undo not available in demo')} className="p-1 rounded hover:bg-gray-100"><Undo2 size={12} /></button>
                          <button type="button" onClick={() => showToast('Redo not available in demo')} className="p-1 rounded hover:bg-gray-100"><Redo2 size={12} /></button>
                          <button type="button" onClick={() => showToast('Present mode coming soon')} className="px-2.5 py-1 rounded-lg border border-gray-200 bg-white text-gray-700 inline-flex items-center gap-1">
                            <MonitorPlay size={12} />
                            <span>Present</span>
                            <ChevronDown size={11} />
                          </button>
                        </div>
                      </div>
                      <div className="h-10 px-3 flex items-center gap-2 text-[11px] text-gray-600">
                        {['Theme', 'Layout', 'Background'].map((option) => (
                          <button key={option} type="button" onClick={() => showToast(`${option} panel opened`)} className="px-2 py-1 rounded border border-gray-200 bg-white hover:bg-gray-50">{option}</button>
                        ))}
                        <div className="relative" ref={deckToolbarMenuRef}>
                          <button
                            type="button"
                            onClick={() => setDeckToolbarMenuOpen((prev) => !prev)}
                            className="inline-flex items-center gap-1 border border-gray-200 rounded px-2 py-1 bg-white hover:bg-gray-50"
                          >
                            <span>{deckToolbarFont}</span>
                            <ChevronDown size={11} />
                          </button>
                          {deckToolbarMenuOpen && (
                            <div className="absolute z-[420] top-full mt-1 left-0 w-28 rounded-lg border border-gray-200 bg-white shadow-lg p-1">
                              {['Inter', 'Arial', 'Roboto', 'Lato', 'Georgia'].map((font) => (
                                <button
                                  key={font}
                                  type="button"
                                  onClick={() => {
                                    setDeckToolbarFont(font);
                                    setDeckToolbarMenuOpen(false);
                                  }}
                                  className={`w-full text-left px-2 py-1 rounded text-[11px] ${deckToolbarFont === font ? 'bg-violet-50 text-violet-700' : 'text-gray-600 hover:bg-gray-50'}`}
                                >
                                  {font}
                                </button>
                              ))}
                            </div>
                          )}
                        </div>
                        <button type="button" className="px-1.5 font-semibold">B</button>
                        <button type="button" className="px-1.5 italic">I</button>
                        <button type="button" className="px-1.5 underline">U</button>
                        <button type="button" className="px-1.5">S</button>
                        <span className="mx-1">|</span>
                        <button type="button" onClick={() => showToast('Animate panel opened')} className="px-2 py-1 rounded border border-gray-200 bg-white hover:bg-gray-50">Animate</button>
                        <button type="button" onClick={() => showToast('More tools opened')} className="px-2 py-1 rounded border border-gray-200 bg-white hover:bg-gray-50">More</button>
                      </div>
                    </div>

                    {deckContextRailTab === 'Template' && (
                      <div className="mt-3 rounded-2xl border border-violet-100 bg-gradient-to-br from-white via-violet-50/40 to-white p-3 shadow-[0_16px_30px_-24px_rgba(109,40,217,0.45)]">
                        <div className="flex items-center justify-between mb-2">
                          <div>
                            <div className="text-xs font-semibold text-gray-900">Available Templates</div>
                            <div className="text-[11px] text-gray-500">Apply to current slide or the whole deck.</div>
                          </div>
                          <button
                            type="button"
                            onClick={() => setDeckContextRailTab('Design')}
                            className="text-[11px] px-2 py-1 rounded-lg border border-gray-200 bg-white text-gray-600 hover:border-violet-300 hover:text-violet-700"
                          >
                            Back to Design
                          </button>
                        </div>
                        <div className="grid grid-cols-1 md:grid-cols-2 gap-2">
                          {DECK_TEMPLATE_LIBRARY.map((template) => {
                            const preset = DECK_DESIGN_PRESETS.find((item) => item.key === template.presetKey) || DECK_DESIGN_PRESETS[0];
                            const selected = activeDeckSlide?.designPresetKey === template.presetKey
                              && activeDeckSlide?.layoutStyle === template.layoutStyle;
                            return (
                              <div key={template.key} className={`rounded-xl border p-2.5 ${selected ? 'border-violet-300 bg-violet-50/60' : 'border-gray-200 bg-white'}`}>
                                <div className={`h-16 rounded-lg ${preset.background} border border-white/20`} />
                                <div className="mt-2 text-xs font-semibold text-gray-900">{template.label}</div>
                                <div className="text-[11px] text-gray-500">{template.detail}</div>
                                <div className="mt-1 text-[10px] text-gray-500">{template.layoutStyle} 繚 {template.motionCue}</div>
                                <div className="mt-2 flex items-center gap-1.5">
                                  <button
                                    type="button"
                                    onClick={() => applyDeckTemplate(template, 'slide')}
                                    className="px-2 py-1 rounded-lg text-[11px] border border-violet-200 bg-white text-violet-700 hover:bg-violet-50"
                                  >
                                    Apply Slide
                                  </button>
                                  <button
                                    type="button"
                                    onClick={() => applyDeckTemplate(template, 'deck')}
                                    className="px-2 py-1 rounded-lg text-[11px] border border-gray-200 bg-white text-gray-700 hover:border-violet-300 hover:text-violet-700"
                                  >
                                    Apply Deck
                                  </button>
                                </div>
                              </div>
                            );
                          })}
                        </div>
                      </div>
                    )}

                    <div ref={deckCanvasPreviewRef} className="rounded-2xl overflow-hidden border border-indigo-950/20 bg-[#10162f] shadow-[0_35px_70px_-45px_rgba(21,24,52,0.8)]">
                      <div className={`relative p-8 md:p-12 ${resolvedDeckSlideDesign.preset.background} min-h-[430px] flex flex-col justify-between`} style={{ transform: `scale(${deckZoomLevel / 100})`, transformOrigin: 'center top', transition: 'transform 140ms ease' }}>
                        <div className="flex items-center justify-between text-[13px] text-indigo-100/90" style={{ fontFamily: deckToolbarFont }}>
                          <span className="font-medium">Regaarder</span>
                          <span>{resolvedDeckSlideDesign.preset.badge}</span>
                        </div>
                        <div>
                          <h1
                            contentEditable
                            suppressContentEditableWarning
                            onBlur={(event) => updateDeckSlideField(activeDeckSlide.id, 'headline', event.currentTarget.textContent || '')}
                            className="text-5xl leading-[1.1] font-medium text-white max-w-[620px] outline-none rounded-md focus:ring-2 focus:ring-white/40"
                            style={{ fontFamily: deckToolbarFont }}
                          >
                            {resolvedDeckSlideDesign.headline}
                          </h1>
                          <p
                            contentEditable
                            suppressContentEditableWarning
                            onBlur={(event) => updateDeckSlideField(activeDeckSlide.id, 'blurb', event.currentTarget.textContent || '')}
                            className="mt-5 text-indigo-100/85 text-2xl max-w-[540px] outline-none rounded-md focus:ring-2 focus:ring-white/30"
                            style={{ fontFamily: deckToolbarFont }}
                          >
                            {resolvedDeckSlideDesign.blurb}
                          </p>
                        </div>
                        <div className="absolute top-6 right-6 w-14 h-14 rounded-xl border border-dashed border-white/40 bg-white/5 flex items-center justify-center text-[10px] text-white/70">Logo</div>
                        <div className="absolute right-6 top-24 w-[210px] rounded-2xl border border-white/20 bg-white/10 backdrop-blur px-3 py-2.5 text-white/90">
                          <div className="text-[10px] uppercase tracking-wide text-indigo-100/80">Visual Direction</div>
                          <div className="mt-1 text-xs font-semibold">{resolvedDeckSlideDesign.visualType}</div>
                          <div className="mt-1 text-[11px] text-indigo-100/80">{resolvedDeckSlideDesign.layoutStyle}</div>
                          <div className="mt-2 text-[10px] uppercase tracking-wide text-indigo-100/75">Motion</div>
                          <div className="text-[11px]">{resolvedDeckSlideDesign.motionCue}</div>
                          {resolvedDeckSlideDesign.keyMetric && (
                            <div className="mt-2 rounded-lg bg-white/10 px-2 py-1 text-[11px]">
                              Key metric: {resolvedDeckSlideDesign.keyMetric}
                            </div>
                          )}
                        </div>
                        <div className="absolute left-6 top-6 inline-flex items-center rounded-full border border-white/30 bg-white/10 px-3 py-1 text-[10px] uppercase tracking-wide text-indigo-50">
                          {resolvedDeckSlideDesign.section}
                        </div>
                        <div
                          contentEditable
                          suppressContentEditableWarning
                          onBlur={(event) => updateDeckSlideField(activeDeckSlide.id, 'footer', event.currentTarget.textContent || '')}
                          className="text-sm text-indigo-100/80 outline-none rounded-md focus:ring-2 focus:ring-white/20"
                        >
                          {resolvedDeckSlideDesign.footer} 繚 Slide {activeDeckSlide.id}: {activeDeckSlide.title}
                        </div>
                      </div>
                    </div>

                    <div className="flex items-center justify-center">
                      <div className="h-10 rounded-full border border-gray-200 bg-white px-3 flex items-center gap-2 text-xs text-gray-600">
                        <button type="button" onClick={() => {
                          const currentIndex = deckSlides.findIndex((slide) => slide.id === activeDeckSlide.id);
                          if (currentIndex > 0) setActiveDeckSlideId(deckSlides[currentIndex - 1].id);
                        }} className="p-1 rounded hover:bg-gray-100" title="Previous slide"><ChevronLeft size={14} /></button>
                        <button type="button" onClick={() => showToast('Presentation mode coming soon')} className="p-1 rounded hover:bg-gray-100" title="Play"><MonitorPlay size={14} /></button>
                        <button type="button" onClick={() => {
                          const currentIndex = deckSlides.findIndex((slide) => slide.id === activeDeckSlide.id);
                          if (currentIndex < deckSlides.length - 1) setActiveDeckSlideId(deckSlides[currentIndex + 1].id);
                        }} className="p-1 rounded hover:bg-gray-100" title="Next slide"><ChevronRight size={14} /></button>
                        <span className="mx-1 text-gray-300">|</span>
                        <button type="button" onClick={() => setDeckZoomLevel((prev) => Math.max(50, prev - 10))} className="p-1 rounded hover:bg-gray-100" title="Zoom out">-</button>
                        <span className="min-w-[42px] text-center">{deckZoomLevel}%</span>
                        <button type="button" onClick={() => setDeckZoomLevel((prev) => Math.min(160, prev + 10))} className="p-1 rounded hover:bg-gray-100" title="Zoom in">+</button>
                        <button type="button" onClick={() => setDeckZoomLevel(100)} className="p-1 rounded hover:bg-gray-100" title="Reset zoom"><Expand size={13} /></button>
                      </div>
                    </div>
                  </div>
                )}
                {!deckPromptMinimized && !isComposing && (
                  <form
                    className="mt-4 rounded-[24px] border border-violet-100 bg-gradient-to-br from-white via-violet-50/30 to-white p-3 shadow-[0_18px_40px_-28px_rgba(76,29,149,0.45)] cursor-grab active:cursor-grabbing"
                    style={{ transform: `translate(${deckPromptOffset.x}px, ${deckPromptOffset.y}px)` }}
                    onPointerDown={(event) => beginPanelResize('deckPrompt', event)}
                    onSubmit={(event) => {
                      event.preventDefault();
                      const prompt = deckPromptInput.trim();
                      if ((!prompt && !promptAttachments.length) || isComposing) {
                        return;
                      }
                      const finalPrompt = prompt || (isSheetsMode ? 'Analyze this sheet and produce insights.' : 'Generate content for this deck slide.');
                      setActiveRightTab(productMode === 'deck' ? 'assistant' : 'chat');
                      setRightSidebarOpen(true);
                      handleAISubmit(finalPrompt, { source: 'chat', attachments: promptAttachments });
                      setDeckPromptInput('');
                    }}
                  >
                    <div className="flex items-center justify-end mb-1.5">
                      <button
                        type="button"
                        onClick={() => setDeckPromptMinimized(true)}
                        className="p-1 rounded-md text-gray-400 hover:text-gray-700 hover:bg-gray-100"
                        title="Minimize prompt"
                      >
                        <X size={14} />
                      </button>
                    </div>
                    <div className="mb-2 flex flex-wrap items-center gap-1.5">
                      {[
                        'Turn this into investor tone',
                        'Generate competitor comparison slide',
                        'Make more visual',
                        'Reduce to 8 slides',
                        'Simplify for students',
                      ].map((command) => (
                        <button
                          key={command}
                          type="button"
                          onClick={(event) => {
                            event.stopPropagation();
                            setDeckPromptInput(command);
                          }}
                          className="px-2.5 py-1 rounded-full text-[10px] border border-violet-200 bg-white text-violet-700 hover:bg-violet-50"
                        >
                          {command}
                        </button>
                      ))}
                    </div>
                    <div className="rounded-full border border-gray-200 bg-[#fcfcfe] px-2 py-1.5 flex items-center gap-2">
                      <input
                        ref={promptFileInputRef}
                        type="file"
                        multiple
                        className="hidden"
                        onChange={(event) => {
                          attachFilesToPrompt(event.target.files);
                          event.target.value = '';
                        }}
                      />
                      <button
                        type="button"
                        onPointerDown={(event) => event.stopPropagation()}
                        onClick={() => promptFileInputRef.current?.click()}
                        className="w-7 h-7 rounded-full text-gray-500 hover:bg-gray-100 flex items-center justify-center"
                        title="Attach images, docs, audio, or files"
                      >
                        <Plus size={14} />
                      </button>
                      <textarea
                        value={deckPromptInput}
                        onChange={(event) => setDeckPromptInput(event.target.value)}
                        onPointerDown={(event) => event.stopPropagation()}
                        rows={1}
                        placeholder={isSheetsMode ? 'Ask Sheets AI to analyze, model, or forecast...' : 'Ask AI to generate or refine this slide...'}
                        className="flex-1 resize-none bg-transparent border-none text-sm outline-none px-1 py-1.5 min-h-[26px] max-h-[110px]"
                      />
                      <button
                        type="button"
                        onPointerDown={(event) => event.stopPropagation()}
                        onClick={async () => {
                          await toggleVoiceRecording('chat');
                        }}
                        className="w-7 h-7 rounded-full text-violet-500 hover:bg-violet-50 flex items-center justify-center"
                        title="Voice prompt"
                      >
                        <Mic size={13} />
                      </button>
                      <button
                        type="submit"
                        disabled={isComposing || (!deckPromptInput.trim() && !promptAttachments.length)}
                        className={`w-7 h-7 rounded-full text-white flex items-center justify-center ${isComposing || (!deckPromptInput.trim() && !promptAttachments.length) ? 'bg-violet-300 cursor-not-allowed' : 'bg-violet-600 hover:bg-violet-700'}`}
                        title="Send to AI"
                      >
                        {isComposing ? <Loader2 size={13} className="animate-spin" /> : <ArrowUp size={13} />}
                      </button>
                    </div>
                    {promptAttachments.length > 0 && (
                      <div className="mt-2 flex flex-wrap gap-1.5">
                        {promptAttachments.slice(0, 8).map((attachment) => (
                          <button
                            key={attachment.id}
                            type="button"
                            onPointerDown={(event) => event.stopPropagation()}
                            onClick={() => removePromptAttachment(attachment.id)}
                            className="inline-flex items-center gap-1.5 rounded-full border border-gray-200 bg-white px-2 py-1 text-[11px] text-gray-600"
                            title="Click to remove"
                          >
                            <File size={11} />
                            <span className="truncate max-w-[130px]">{attachment.name}</span>
                            <X size={11} className="text-gray-400" />
                          </button>
                        ))}
                      </div>
                    )}
                    <div className="mt-2 flex items-center gap-2 flex-wrap">
                      {deckPromptChips.map((chip) => (
                        <button
                          key={chip}
                          type="button"
                          onClick={() => {
                            if (isSheetsMode) {
                              const formatPrompt = `Format: ${chip}.\n\n${deckPromptInput.trim() || 'Analyze this sheet and produce insights.'}`;
                              setDeckPromptInput(formatPrompt);
                              return;
                            }
                            setDeckPromptInput(chip);
                          }}
                          className="px-2.5 py-1.5 rounded-full text-xs border border-gray-200 text-gray-600 hover:border-violet-300 hover:text-violet-700"
                        >
                          {chip}
                        </button>
                      ))}
                      {isSheetsMode && (
                        <button
                          type="button"
                          onClick={(event) => {
                            event.stopPropagation();
                            handleGenerateSheetFilePrompt();
                          }}
                          className="px-2.5 py-1.5 rounded-full text-xs border border-emerald-200 bg-emerald-50 text-emerald-700 hover:bg-emerald-100"
                        >
                          Generate new sheet file
                        </button>
                      )}
                      <div className="ml-auto flex items-center gap-1.5">
                        <input
                          type="text"
                          value={deckCustomChip}
                          onPointerDown={(event) => event.stopPropagation()}
                          onChange={(event) => setDeckCustomChip(event.target.value)}
                          placeholder="Custom chip"
                          className="h-8 w-28 px-2 text-xs border border-gray-200 rounded-lg focus:outline-none focus:border-violet-300"
                        />
                        <button
                          type="button"
                          onClick={(event) => {
                            event.stopPropagation();
                            const chip = deckCustomChip.trim();
                            if (!chip) return;
                            if (!deckPromptChips.includes(chip)) {
                              setDeckPromptChips((prev) => [...prev, chip]);
                            }
                            setDeckCustomChip('');
                          }}
                          className="h-8 px-2 rounded-lg text-xs border border-gray-200 text-gray-600 hover:border-violet-300 hover:text-violet-700"
                        >
                          Add
                        </button>
                      </div>
                    </div>
                  </form>
                )}
              </div>
            </section>

            <aside
              className={`shrink-0 rounded-2xl border border-gray-200 bg-white flex flex-col min-h-0 relative transition-[width] duration-300 ${rightSidebarOpen ? '' : 'w-0 overflow-hidden border-0'}`}
              style={rightSidebarOpen ? { width: `${rightSidebarWidth}px` } : { width: '0px' }}
            >
              <div className="flex border-b border-gray-100 text-xs font-semibold select-none bg-[#FAFAFC] rounded-t-2xl">
                <div className="flex-1 min-w-0 overflow-x-auto no-scrollbar">
                  <div className="inline-flex min-w-max">
                    {[
                      { key: 'chat', label: 'AI Chat' },
                      { key: 'assistant', label: 'AI Assistant' },
                      { key: 'tasks', label: `Tasks (${tasks.filter((t) => !t.completed).length})` },
                      { key: 'calendar', label: 'Schedule' },
                      { key: 'room', label: 'Room' },
                      { key: 'people', label: 'People' },
                      { key: 'memory', label: 'Memory' },
                    ].map((tab) => (
                      <button
                        key={tab.key}
                        className={`shrink-0 px-3 py-3 transition-all border-b-2 ${activeRightTab === tab.key ? 'text-violet-600 border-violet-600 bg-white' : 'text-gray-500 border-transparent hover:text-gray-700 hover:bg-gray-50'}`}
                        onClick={() => setActiveRightTab(tab.key)}
                      >
                        {tab.label}
                      </button>
                    ))}
                  </div>
                </div>
                <div className="w-10 shrink-0 flex items-center justify-center border-l border-gray-100">
                  <button
                    type="button"
                    onClick={() => setRightSidebarOpen(false)}
                    className="p-1 rounded-md text-gray-400 hover:text-gray-700 hover:bg-gray-100"
                    title="Close panel"
                  >
                    <X size={14} />
                  </button>
                </div>
              </div>

              <div className="flex-1 flex flex-col min-h-0 bg-white">
                {activeRightTab === 'chat' && (
                  <div className="flex-1 flex flex-col min-h-0">
                    <div className="px-4 py-2 bg-violet-50/40 border-b border-violet-100/30 flex items-center gap-2 text-xs text-violet-700">
                      <FileText size={12} />
                      <span className="font-medium truncate" title={isSheetsMode ? (sheetsTitle || activeSheet?.title || docTitle) : (deckTitle || docTitle)}>Context Linked: {isSheetsMode ? (truncateText(sheetsTitle || activeSheet?.title || docTitle, 20)) : (truncateText(deckTitle || docTitle, 20))}</span>
                    </div>
                    <div className="flex-1 overflow-y-auto p-4 space-y-4">
                      {chatMessages.map((msg) => (
                        <div key={msg.id} className={`group flex flex-col max-w-[85%] ${msg.sender === 'user' ? 'ml-auto items-end' : 'mr-auto items-start'}`}>
                          <span className="text-[10px] text-gray-400 mb-1 px-1">{msg.sender === 'user' ? 'Alex R.' : 'Compose AI'}</span>
                          <div className={`p-3 rounded-2xl text-sm leading-relaxed ${msg.sender === 'user' ? 'bg-violet-600 text-white rounded-tr-xs shadow-sm' : 'bg-[#FAFAFC] text-gray-700 border border-gray-100 rounded-tl-xs shadow-xs'}`}>{msg.text}</div>
                        </div>
                      ))}
                      {isComposing && <div className="flex items-center gap-2 text-xs text-gray-400 p-2 animate-pulse"><Loader2 className="animate-spin text-violet-500" size={14} /><span>{productMode === 'deck' ? 'Deck AI is designing your slides...' : 'Compose AI is writing...'}</span></div>}
                      <div ref={chatEndRef} />
                    </div>
                    <form onSubmit={handleSidebarSend} className="p-3 border-t border-gray-100 bg-[#FAFAFC]">
                      <div className="relative flex items-end bg-white border border-gray-200 rounded-xl focus-within:border-violet-400 transition-colors">
                        <textarea value={chatInput} onChange={(e) => setChatInput(e.target.value)} onInput={(e) => autoResizeTextarea(e.currentTarget, 120)} placeholder="Ask, summarize, or instruct..." rows={1} className="w-full bg-transparent border-none focus:outline-none text-sm py-2.5 pl-3 pr-10 text-gray-700 placeholder-gray-400 resize-none" />
                        <button type="submit" className="absolute right-1.5 bottom-1.5 p-1.5 rounded-lg bg-violet-50 hover:bg-violet-100 text-violet-600 transition-colors"><Send size={14} /></button>
                      </div>
                    </form>
                  </div>
                )}

                {activeRightTab === 'assistant' && (
                  <div className="flex-1 overflow-y-auto p-5 space-y-6">
                    {productMode === 'deck' ? (
                      <>
                        <div className="rounded-2xl border border-violet-100 bg-gradient-to-br from-violet-50 via-white to-white p-4 shadow-[0_18px_35px_-25px_rgba(124,58,237,0.45)]">
                          <h3 className="text-sm font-bold text-gray-900">Deck Intelligence</h3>
                          <p className="text-xs text-gray-500 mt-1">Strategic analysis across narrative quality, pacing, and audience fit.</p>
                          <div className="mt-3 grid grid-cols-2 gap-2">
                            <div className="rounded-xl border border-gray-200 bg-white px-3 py-2">
                              <div className="text-[10px] uppercase tracking-wide text-gray-400">Narrative Quality</div>
                              <div className="text-xs font-semibold text-gray-800 mt-1">{deckIntelligence.narrativeQuality}</div>
                            </div>
                            <div className="rounded-xl border border-gray-200 bg-white px-3 py-2">
                              <div className="text-[10px] uppercase tracking-wide text-gray-400">Pacing</div>
                              <div className="text-xs font-semibold text-gray-800 mt-1">{deckIntelligence.pacingQuality}</div>
                            </div>
                          </div>
                        </div>

                        <div className="space-y-2">
                          <div className="text-[11px] font-bold text-gray-400 uppercase tracking-wider">AI Suggestions</div>
                          {deckIntelligence.suggestions.map((suggestion) => (
                            <div key={suggestion} className="rounded-xl border border-gray-200 bg-white px-3 py-2 text-xs text-gray-700">
                              {suggestion}
                            </div>
                          ))}
                        </div>

                        <div className="space-y-2">
                          <div className="text-[11px] font-bold text-gray-400 uppercase tracking-wider">Weak Slides</div>
                          {deckIntelligence.weakSlides.length ? deckIntelligence.weakSlides.map((item) => (
                            <div key={item} className="rounded-xl border border-amber-200 bg-amber-50/60 px-3 py-2 text-xs text-amber-900">
                              {item}
                            </div>
                          )) : (
                            <div className="rounded-xl border border-emerald-200 bg-emerald-50/60 px-3 py-2 text-xs text-emerald-800">No weak slides detected in current narrative.</div>
                          )}
                        </div>

                        <div className="rounded-xl border border-gray-200 bg-white px-3 py-2 text-xs text-gray-700">
                          <div className="text-[10px] uppercase tracking-wide text-gray-400 mb-1">Audience Fit</div>
                          {deckIntelligence.audienceFit}
                        </div>

                        <div className="space-y-2">
                          <div className="text-[11px] font-bold text-gray-400 uppercase tracking-wider">Related Sources</div>
                          {deckIntelligence.relatedSources.length ? deckIntelligence.relatedSources.map((source) => (
                            <div key={source} className="rounded-xl border border-gray-200 bg-white px-3 py-2 text-xs text-gray-700">{source}</div>
                          )) : (
                            <div className="rounded-xl border border-dashed border-gray-300 bg-gray-50 px-3 py-2 text-xs text-gray-500">Attach docs, PDFs, sheets, images, or transcripts to strengthen source grounding.</div>
                          )}
                        </div>

                        <div className="rounded-xl border border-gray-200 bg-white px-3 py-2 text-xs text-gray-700">
                          <div className="text-[10px] uppercase tracking-wide text-gray-400 mb-1">Speaker Notes</div>
                          {deckIntelligence.speakerNotes}
                        </div>

                        <div className="rounded-xl border border-gray-200 bg-white px-3 py-2 text-xs text-gray-700">
                          <div className="text-[10px] uppercase tracking-wide text-gray-400 mb-1">Presentation Summary</div>
                          {deckIntelligence.presentationSummary}
                        </div>

                        <div className="space-y-2">
                          <div className="text-[11px] font-bold text-gray-400 uppercase tracking-wider">Suggested Additions</div>
                          {deckIntelligence.suggestedAdditions.map((item) => (
                            <button
                              key={item}
                              type="button"
                              onClick={() => runSmartAssistAction(`Add a new slide for: ${item}. Keep it visual, concise, and presentation-ready.`)}
                              className="w-full rounded-xl border border-gray-200 bg-white px-3 py-2 text-left text-xs text-gray-700 hover:border-violet-200 hover:bg-violet-50"
                            >
                              {item}
                            </button>
                          ))}
                        </div>

                        <div>
                          <h4 className="text-[11px] font-bold text-gray-400 uppercase tracking-wider mb-2">Universal AI Command</h4>
                          <form onSubmit={handleAssistantQuickPromptSend} className="rounded-xl p-3 border border-violet-100/70 bg-gradient-to-br from-violet-50/60 via-white to-white space-y-2 shadow-[0_10px_25px_-20px_rgba(109,40,217,0.55)]">
                            <textarea value={assistantQuickPrompt} onChange={(e) => setAssistantQuickPrompt(e.target.value)} placeholder="E.g. Make this deck more visual and investor-ready" rows={2} className="w-full bg-white/95 border border-violet-100 rounded-lg px-2.5 py-2 text-xs text-gray-700 outline-none focus:border-violet-400 resize-y min-h-[64px]" />
                            <div className="flex items-center justify-end">
                              <button type="submit" disabled={isComposing || !assistantQuickPrompt.trim()} className={`px-3 py-1.5 rounded-lg text-xs font-semibold transition-all ${isComposing || !assistantQuickPrompt.trim() ? 'bg-violet-200 text-white cursor-not-allowed' : 'bg-violet-600 text-white hover:bg-violet-700 shadow-[0_8px_16px_-10px_rgba(124,58,237,0.7)]'}`}>Run AI Command</button>
                            </div>
                          </form>
                        </div>
                      </>
                    ) : (
                      <>
                        <div>
                          <h3 className="text-sm font-bold text-gray-900 mb-2">Smart Assist Options</h3>
                          <p className="text-xs text-gray-500">{smartAssistIntro}</p>
                        </div>
                        <div className="space-y-2">
                          {smartAssistOptions.map((option) => {
                            const Icon = option.icon;
                            return (
                              <div key={option.key} className="space-y-1">
                                <button
                                  onClick={() => {
                                    if (option.key === 'create-outline') {
                                      setOutlineLevelMenuOpen((prev) => !prev);
                                      return;
                                    }
                                    runSmartAssistAction(option.prompt, { actionKey: option.key });
                                  }}
                                  className="w-full flex items-center gap-3 px-4 py-3 border rounded-lg text-sm text-gray-700 hover:border-violet-200 hover:bg-violet-50 transition-colors text-left border-gray-100"
                                >
                                  <Icon size={16} className={option.color} />
                                  <div>
                                    <div className="font-semibold text-xs">{option.label}</div>
                                    <p className="text-[10px] text-gray-400">{option.detail}</p>
                                  </div>
                                </button>
                                {option.key === 'create-outline' && outlineLevelMenuOpen && (
                                  <div className="ml-7 rounded-lg border border-violet-100 bg-violet-50/40 p-2">
                                    <div className="text-[10px] font-semibold text-violet-700 mb-1">Choose depth</div>
                                    <div className="flex items-center gap-1.5">
                                      {[2, 3, 4].map((level) => (
                                        <button
                                          key={level}
                                          type="button"
                                          onClick={() => {
                                            setOutlineLevels(level);
                                            setOutlineLevelMenuOpen(false);
                                            runSmartAssistAction(option.prompt, { actionKey: option.key, outlineLevels: level });
                                          }}
                                          className={`px-2 py-1 rounded text-[10px] border ${outlineLevels === level ? 'bg-violet-600 text-white border-violet-600' : 'bg-white text-gray-600 border-gray-200 hover:border-violet-300'}`}
                                        >
                                          {level} levels
                                        </button>
                                      ))}
                                    </div>
                                  </div>
                                )}
                              </div>
                            );
                          })}
                        </div>
                        <div>
                          <h4 className="text-[11px] font-bold text-gray-400 uppercase tracking-wider mb-2">AI Prompt Box</h4>
                          <form onSubmit={handleAssistantQuickPromptSend} className="rounded-xl p-3 border border-violet-100/70 bg-gradient-to-br from-violet-50/60 via-white to-white space-y-2 shadow-[0_10px_25px_-20px_rgba(109,40,217,0.55)]">
                            <textarea value={assistantQuickPrompt} onChange={(e) => setAssistantQuickPrompt(e.target.value)} placeholder="Ask AI Assistant from here..." rows={2} className="w-full bg-white/95 border border-violet-100 rounded-lg px-2.5 py-2 text-xs text-gray-700 outline-none focus:border-violet-400 resize-y min-h-[64px]" />
                            <div className="flex items-center justify-end">
                              <button type="submit" disabled={isComposing || !assistantQuickPrompt.trim()} className={`px-3 py-1.5 rounded-lg text-xs font-semibold transition-all ${isComposing || !assistantQuickPrompt.trim() ? 'bg-violet-200 text-white cursor-not-allowed' : 'bg-violet-600 text-white hover:bg-violet-700 shadow-[0_8px_16px_-10px_rgba(124,58,237,0.7)]'}`}>Send to AI</button>
                            </div>
                          </form>
                        </div>
                      </>
                    )}
                  </div>
                )}

                {activeRightTab === 'calendar' && (
                  <div className="flex-1 min-h-0 flex flex-col">
                    <div className="flex-1 overflow-y-auto p-5 space-y-4">
                      <h3 className="text-sm font-bold text-gray-900">Launch Timeline</h3>
                      <p className="text-xs text-gray-500">Consolidated product rollouts aligned with team calendar events.</p>
                      {upcomingEvents.map((event) => (
                        <div key={event.id} className="p-3 rounded-xl border border-gray-200 bg-white">
                          <div className="text-xs font-semibold text-gray-800">{event.title}</div>
                          <div className="text-[11px] text-gray-500 mt-1">{event.slotLabel}</div>
                        </div>
                      ))}
                    </div>
                  </div>
                )}

                {activeRightTab !== 'chat' && activeRightTab !== 'assistant' && activeRightTab !== 'calendar' && (
                  <div className="flex-1 overflow-y-auto p-4">
                    <div className="rounded-xl border border-gray-200 p-3 text-xs text-gray-600">This panel follows the same tab position and controls as Compose. Select AI Chat, AI Assistant, or Schedule for full parity content.</div>
                  </div>
                )}
              </div>

              {deckPromptMinimized && (
                <button
                  type="button"
                  onClick={() => setDeckPromptMinimized(false)}
                  className="absolute bottom-4 right-4 w-10 h-10 rounded-full bg-violet-600 text-white flex items-center justify-center hover:bg-violet-700 shadow-lg"
                  title="Open prompt box"
                >
                  <PenTool size={16} />
                </button>
              )}
            </aside>
          </div>
        </main>

        {pageContextMenu.open && (
          <div
            ref={pageContextMenuRef}
            className="fixed z-[700] w-[260px] rounded-xl border border-gray-200 bg-white shadow-[0_18px_45px_-24px_rgba(15,23,42,0.65)] p-2"
            style={{ left: Math.max(12, pageContextMenu.x - 20), top: Math.max(12, pageContextMenu.y - 12) }}
          >
            <div className="px-2 py-2 border-b border-gray-100">
              <div className="text-[13px] font-semibold text-gray-900">{pageContextMenu.isSheets ? 'Add worksheet title' : 'Add page title'}</div>
            </div>
            {[
              { key: 'copy', label: 'Copy', shortcut: 'Ctrl+C' },
              { key: 'copyStyle', label: 'Copy page style', shortcut: '' },
              { key: 'paste', label: 'Paste', shortcut: 'Ctrl+V' },
              { key: 'duplicate', label: 'Duplicate page', shortcut: 'Ctrl+D' },
              { key: 'delete', label: 'Delete page', shortcut: 'Delete' },
              { key: 'add', label: 'Add page', shortcut: 'Ctrl+Enter' },
              { key: 'hide', label: 'Hide page', shortcut: '' },
              { key: 'transition', label: 'Add transition', shortcut: '' },
              { key: 'lock', label: 'Lock page', shortcut: 'Alt+Shift+L' },
              { key: 'download', label: 'Download page', shortcut: '' },
              { key: 'copyLink', label: 'Copy link to this page', shortcut: '' },
              { key: 'notes', label: 'Notes', shortcut: '' },
              { key: 'resize', label: 'Resize page', shortcut: '' },
              { key: 'editVideo', label: 'Edit as video', shortcut: '' },
            ].map((item) => (
              <button
                key={item.key}
                type="button"
                onClick={() => handlePageContextAction(item.key)}
                className="w-full flex items-center justify-between px-2 py-2 rounded-lg text-sm text-gray-700 hover:bg-gray-50"
              >
                <span>{item.label}</span>
                {item.shortcut ? <span className="text-[11px] text-gray-400">{item.shortcut}</span> : <span />}
              </button>
            ))}
          </div>
        )}

        <div className="w-[74px] border-l border-gray-100 bg-[#FAFAFC] flex flex-col items-center py-4 gap-6 shrink-0 select-none overflow-y-auto overflow-x-visible thin-scrollbar">
          <div
            onClick={() => handleMiniSidebarClick('chat')}
            className={`flex flex-col items-center gap-1 cursor-pointer transition-colors ${activeRightTab === 'chat' && rightSidebarOpen ? 'text-violet-600' : 'text-gray-400 hover:text-violet-600'}`}
          >
            <div className={`p-2 rounded-xl transition-all ${activeRightTab === 'chat' && rightSidebarOpen ? 'bg-violet-100' : ''}`}><MessageCircle size={20} /></div>
            <span className="text-[9px] font-semibold">Chat</span>
          </div>

          <div
            onClick={() => handleMiniSidebarClick('assistant')}
            className={`flex flex-col items-center gap-1 cursor-pointer transition-colors ${activeRightTab === 'assistant' && rightSidebarOpen ? 'text-violet-600' : 'text-gray-400 hover:text-violet-600'}`}
          >
            <div className={`p-2 rounded-xl transition-all ${activeRightTab === 'assistant' && rightSidebarOpen ? 'bg-violet-100' : ''}`}><PenTool size={20} /></div>
            <span className="text-[9px] font-semibold">Assist</span>
          </div>

          <div
            onClick={() => handleMiniSidebarClick('tasks')}
            className={`flex flex-col items-center gap-1 cursor-pointer transition-colors ${activeRightTab === 'tasks' && rightSidebarOpen ? 'text-violet-600' : 'text-gray-400 hover:text-violet-600'}`}
          >
            <div className={`p-2 rounded-xl transition-all ${activeRightTab === 'tasks' && rightSidebarOpen ? 'bg-violet-100' : ''}`}><CheckSquare size={20} /></div>
            <span className="text-[9px] font-semibold">Tasks</span>
          </div>

          <div
            onClick={() => handleMiniSidebarClick('calendar')}
            className={`flex flex-col items-center gap-1 cursor-pointer transition-colors ${activeRightTab === 'calendar' && rightSidebarOpen ? 'text-violet-600' : 'text-gray-400 hover:text-violet-600'}`}
          >
            <div className={`p-2 rounded-xl transition-all ${activeRightTab === 'calendar' && rightSidebarOpen ? 'bg-violet-100' : ''}`}><Calendar size={20} /></div>
            <span className="text-[9px] font-semibold">Schedule</span>
          </div>

          <div
            onClick={() => handleMiniSidebarClick('people')}
            className={`flex flex-col items-center gap-1 cursor-pointer transition-colors ${activeRightTab === 'people' && rightSidebarOpen ? 'text-violet-600' : 'text-gray-400 hover:text-violet-600'}`}
          >
            <div className={`p-2 rounded-xl transition-all ${activeRightTab === 'people' && rightSidebarOpen ? 'bg-violet-100' : ''}`}><Users size={20} /></div>
            <span className="text-[9px] font-semibold">People</span>
          </div>

          <div
            onClick={() => handleMiniSidebarClick('memory')}
            className={`flex flex-col items-center gap-1 cursor-pointer transition-colors ${activeRightTab === 'memory' && rightSidebarOpen ? 'text-violet-600' : 'text-gray-400 hover:text-violet-600'}`}
          >
            <div className={`p-2 rounded-xl transition-all ${activeRightTab === 'memory' && rightSidebarOpen ? 'bg-violet-100' : ''}`}><Database size={20} /></div>
            <span className="text-[9px] font-semibold">Memory</span>
          </div>

          <div
            onClick={() => handleMiniSidebarClick('room')}
            className={`flex flex-col items-center gap-1 cursor-pointer transition-colors ${activeRightTab === 'room' && rightSidebarOpen ? 'text-violet-600' : 'text-gray-400 hover:text-violet-600'}`}
          >
            <div className={`p-2 rounded-xl transition-all ${activeRightTab === 'room' && rightSidebarOpen ? 'bg-violet-100' : ''}`}><MonitorPlay size={20} /></div>
            <span className="text-[9px] font-semibold">Room</span>
          </div>

          <div
            onClick={() => {
              handleMiniSidebarClick('room');
              setActiveMeetingStageTab('files');
            }}
            className="flex flex-col items-center gap-1 text-gray-400 hover:text-violet-600 cursor-pointer"
          >
            <div className="p-2"><File size={20} /></div>
            <span className="text-[9px] font-semibold">Files</span>
          </div>

          <div className="flex flex-col items-center gap-1 text-gray-400 hover:text-gray-600 cursor-pointer mt-auto">
            <div className="p-2"><MoreHorizontal size={20} /></div>
            <span className="text-[9px] font-semibold">More</span>
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className={`flex h-screen bg-[#FDFDFD] text-gray-800 overflow-hidden relative ${isDarkMode ? 'app-dark' : ''} ${shouldHideScrollbarsForPrompt ? 'hide-side-scrollbar' : ''}`} style={{ fontFamily: resolveFontFamily(editorFont) }}>
      
      {/* Dynamic Toast System */}
      {toastMessage && (
        <div className="absolute top-16 right-6 max-w-[380px] bg-white/95 backdrop-blur border border-violet-100 text-slate-700 text-xs font-medium px-4 py-2.5 rounded-xl shadow-[0_12px_35px_-18px_rgba(91,33,182,0.45)] z-[420] flex items-center gap-2 transition-all duration-300">
          <span className="inline-block w-2 h-2 rounded-full bg-violet-500"></span>
          <span>{toastMessage}</span>
        </div>
      )}

      {creationPickerOpen && (
        <div className="absolute inset-0 z-[620] bg-slate-950/45 backdrop-blur-sm flex items-center justify-center p-4">
          <div className="w-[680px] max-w-[95vw] rounded-2xl bg-white border border-gray-200 shadow-[0_30px_80px_-45px_rgba(15,23,42,0.8)] p-6">
            <div className="flex items-start justify-between gap-4 mb-5">
              <div>
                <h3 className="text-lg font-semibold text-gray-900">Create New Project</h3>
                <p className="text-sm text-gray-500 mt-1">Choose your workspace type to start with the right canvas.</p>
              </div>
              <button
                type="button"
                onClick={() => setCreationPickerOpen(false)}
                className="p-2 rounded-full text-gray-400 hover:text-gray-700 hover:bg-gray-100"
                title="Close"
              >
                <X size={16} />
              </button>
            </div>

            <div className="grid grid-cols-1 md:grid-cols-3 gap-3">
              <button
                type="button"
                onClick={createComposeExperience}
                className="group text-left rounded-xl border border-violet-300 bg-violet-50/50 p-4 hover:bg-violet-50 transition-colors"
              >
                <div className="w-9 h-9 rounded-lg bg-violet-600 text-white flex items-center justify-center mb-3">
                  <FileText size={18} />
                </div>
                <div className="text-sm font-semibold text-gray-900 mb-1">Compose</div>
                <p className="text-xs text-gray-600">Our document workspace for writing, planning, and AI-assisted editing.</p>
              </button>

              <button
                type="button"
                onClick={createDeckExperience}
                className="group text-left rounded-xl border border-gray-200 p-4 hover:border-violet-300 hover:bg-violet-50/40 transition-colors"
              >
                <div className="w-9 h-9 rounded-lg bg-violet-100 text-violet-700 flex items-center justify-center mb-3">
                  <LayoutGrid size={18} />
                </div>
                <div className="text-sm font-semibold text-gray-900 mb-1">Deck</div>
                <p className="text-xs text-gray-600">Our presentation workspace for slide-first storytelling and AI deck intelligence.</p>
              </button>

              <button
                type="button"
                onClick={createSheetsExperience}
                className="group text-left rounded-xl border border-gray-200 p-4 hover:border-emerald-300 hover:bg-emerald-50/40 transition-colors"
              >
                <div className="w-9 h-9 rounded-lg bg-emerald-100 text-emerald-700 flex items-center justify-center mb-3">
                  <Database size={18} />
                </div>
                <div className="text-sm font-semibold text-gray-900 mb-1">Sheets</div>
                <p className="text-xs text-gray-600">Our spreadsheet workspace for AI-native analysis, modeling, and planning.</p>
              </button>
            </div>
          </div>
        </div>
      )}

      {closeConfirmDocId && (
        <div className="absolute inset-0 z-50 bg-black/20 backdrop-blur-[1px] flex items-center justify-center">
          <div className="w-[420px] max-w-[90vw] rounded-xl bg-white border border-gray-100 shadow-xl p-5">
            <h3 className="text-sm font-semibold text-gray-900 mb-2">Close this document?</h3>
            <p className="text-xs text-gray-500 mb-4">You can still create a new one after closing. This action will remove the selected tab.</p>
            <div className="flex items-center justify-end gap-2">
              <button
                onClick={() => setCloseConfirmDocId(null)}
                className="px-3 py-1.5 rounded-lg text-xs border border-gray-200 text-gray-600 hover:bg-gray-50"
              >
                Cancel
              </button>
              <button
                onClick={confirmCloseDocument}
                className="px-3 py-1.5 rounded-lg text-xs bg-violet-600 text-white hover:bg-violet-700"
              >
                Close Document
              </button>
            </div>
          </div>
        </div>
      )}

      {workspaceModalOpen && (
        <div className="absolute inset-0 z-50 bg-black/20 backdrop-blur-[1px] flex items-center justify-center">
          <div className="w-[420px] max-w-[90vw] rounded-xl bg-white border border-gray-100 shadow-xl p-5">
            <h3 className="text-sm font-semibold text-gray-900 mb-2">
              {workspaceModalMode === 'create' ? 'Create workspace' : 'Rename workspace'}
            </h3>
            <p className="text-xs text-gray-500 mb-4">
              {workspaceModalMode === 'create'
                ? 'Give your new workspace a clear name.'
                : 'Update the workspace name.'}
            </p>
            <input
              value={workspaceNameInput}
              onChange={(e) => setWorkspaceNameInput(e.target.value)}
              onKeyDown={(e) => {
                if (e.key === 'Enter') {
                  e.preventDefault();
                  submitWorkspaceModal();
                }
              }}
              autoFocus
              placeholder="Workspace name"
              className="w-full border border-gray-200 rounded-lg px-3 py-2 text-sm text-gray-700 mb-4 outline-none focus:border-violet-400"
            />
            <div className="flex items-center justify-end gap-2">
              <button
                onClick={() => setWorkspaceModalOpen(false)}
                className="px-3 py-1.5 rounded-lg text-xs border border-gray-200 text-gray-600 hover:bg-gray-50"
              >
                Cancel
              </button>
              <button
                onClick={submitWorkspaceModal}
                className="px-3 py-1.5 rounded-lg text-xs bg-violet-600 text-white hover:bg-violet-700"
              >
                {workspaceModalMode === 'create' ? 'Create' : 'Save'}
              </button>
            </div>
          </div>
        </div>
      )}

      {shareModalOpen && (
        <div className="absolute inset-0 z-[520] bg-slate-900/30 backdrop-blur-sm flex items-center justify-center p-4">
          <div className="w-[640px] max-w-[95vw] rounded-2xl bg-white border border-slate-200 shadow-[0_30px_90px_-45px_rgba(15,23,42,0.65)] p-6">
            <div className="flex items-start justify-between gap-4 mb-5">
              <div>
                <h3 className="text-lg font-semibold text-slate-900">Share from Compose</h3>
                <p className="text-xs text-slate-500 mt-1">{shareTargetDocTitle}</p>
              </div>
              <button
                type="button"
                onClick={() => setShareModalOpen(false)}
                className="p-2 rounded-full text-slate-400 hover:text-slate-700 hover:bg-slate-100"
                title="Close"
              >
                <X size={16} />
              </button>
            </div>

            <div className="grid grid-cols-1 md:grid-cols-3 gap-2 mb-5">
              {[
                { key: 'friends', label: 'Copy link', sub: 'Share instantly' },
                { key: 'apps', label: 'Native apps', sub: 'Use system sheet' },
                { key: 'downloads', label: 'Download', sub: 'Export file' },
              ].map((destination) => (
                <button
                  key={destination.key}
                  type="button"
                  onClick={() => setShareDestination(destination.key)}
                  className={`text-left rounded-xl border px-3 py-2.5 transition-colors ${shareDestination === destination.key ? 'border-violet-300 bg-violet-50/70 text-violet-700' : 'border-slate-200 bg-white text-slate-700 hover:bg-slate-50'}`}
                >
                  <div className="text-sm font-semibold">{destination.label}</div>
                  <div className="text-[11px] text-slate-500">{destination.sub}</div>
                </button>
              ))}
            </div>

            <div className="mb-4">
              <label className="text-[11px] font-semibold text-slate-500 uppercase tracking-wide block mb-2">Access level</label>
              <div className="flex flex-wrap items-center gap-2">
                {['Viewer', 'Commenter', 'Editor'].map((level) => (
                  <button
                    key={level}
                    type="button"
                    onClick={() => setShareAccess(level)}
                    className={`px-3 py-1.5 rounded-full text-xs border transition-colors ${shareAccess === level ? 'bg-violet-50 border-violet-300 text-violet-700' : 'border-slate-200 text-slate-600 hover:bg-slate-50'}`}
                  >
                    {level}
                  </button>
                ))}
              </div>
            </div>

            <div className="mb-5">
              <label className="text-[11px] font-semibold text-slate-500 uppercase tracking-wide block mb-2">File format</label>
              <div className="flex flex-wrap gap-2">
                {['Compose (.cmp)', 'PDF', 'DOC (Word-compatible)', 'Markdown', 'Plain Text', 'HTML'].map((format) => (
                  <button
                    key={format}
                    type="button"
                    onClick={() => setShareFormat(format)}
                    className={`px-2.5 py-1.5 rounded-lg text-xs border transition-colors ${shareFormat === format ? 'border-violet-300 bg-violet-50 text-violet-700' : 'border-slate-200 text-slate-600 hover:bg-slate-50'}`}
                  >
                    {format}
                  </button>
                ))}
              </div>
            </div>

            {shareDestination === 'friends' && (
              <div className="mb-5 rounded-xl border border-slate-200 bg-slate-50 p-3">
                <div className="text-[11px] font-semibold text-slate-500 uppercase tracking-wide mb-1">Share link</div>
                <div className="text-xs text-slate-600 break-all">{shareLink}</div>
              </div>
            )}

            <div className="flex items-center justify-end gap-2">
              <button
                onClick={() => setShareModalOpen(false)}
                className="px-3 py-2 rounded-lg text-xs border border-slate-200 text-slate-600 hover:bg-slate-50"
              >
                Cancel
              </button>
              <button
                onClick={handleShareModalConfirm}
                className="px-4 py-2 rounded-lg text-xs font-semibold bg-violet-600 text-white hover:bg-violet-700"
              >
                {shareDestination === 'downloads' ? `Export ${shareFormat}` : shareDestination === 'apps' ? 'Share to Apps' : 'Copy Link'}
              </button>
            </div>
          </div>
        </div>
      )}

      {previewAttachment && (
        <div className="absolute inset-0 z-[130] bg-black/40 backdrop-blur-sm flex items-center justify-center p-4">
          <div className="w-[640px] max-w-[95vw] max-h-[90vh] overflow-auto rounded-2xl bg-white border border-gray-200 shadow-2xl p-4">
            <div className="flex items-center justify-between gap-2 mb-3">
              <div className="min-w-0">
                <div className="text-sm font-semibold text-gray-900 truncate">{previewAttachment.name}</div>
                <div className="text-[11px] text-gray-500">{previewAttachment.type || 'Unknown type'} - {Math.round((previewAttachment.size || 0) / 1024)} KB</div>
              </div>
              <button
                type="button"
                onClick={() => setPreviewAttachment(null)}
                className="p-1.5 rounded-md text-gray-400 hover:text-gray-700 hover:bg-gray-100"
              >
                <X size={14} />
              </button>
            </div>
            {previewAttachment.isImage ? (
              <img src={previewAttachment.url} alt={previewAttachment.name} className="w-full h-auto rounded-xl border border-gray-200" />
            ) : previewAttachment.type?.startsWith('audio/') ? (
              <audio controls src={previewAttachment.url} className="w-full" />
            ) : previewAttachment.previewText ? (
              <div className="rounded-xl border border-gray-200 bg-gray-50 p-4 text-xs text-gray-700 leading-5 whitespace-pre-wrap">
                {previewAttachment.previewText}
              </div>
            ) : (
              <div className="rounded-xl border border-gray-200 bg-gray-50 p-4 text-xs text-gray-600">
                Preview is not available for this file type. It is still attached to your prompt context.
              </div>
            )}
          </div>
        </div>
      )}

      {/* 1. Left Navigation Sidebar */}
      <div
        className="border-r border-gray-100 flex flex-col bg-[#FAFAFC] shrink-0 select-none overflow-hidden transition-[width] duration-200"
        style={{ width: leftSidebarOpen ? `${leftSidebarWidth}px` : '0px' }}
      >
        {showDocumentOutlineView ? (
          <div className="px-4 py-4 border-b border-gray-100 bg-white/80">
            <div className="flex items-center gap-2 text-gray-900 font-semibold">
              <FileText size={16} className="text-violet-600" />
              <span>Document Outline</span>
            </div>
            <div className="mt-2 text-[11px] text-gray-500 truncate" title={docTitle}>{docTitleDisplay}</div>
          </div>
        ) : (
          <>
            {/* Logo Area */}
            <div className="h-14 flex items-center justify-between px-4">
              <div className="flex items-center gap-2 font-bold text-gray-900 text-lg">
                {/* Custom Logo SVG - Elegant, minimalist "C" and "R" intersection */}
                <svg viewBox="0 0 24 24" fill="none" xmlns="http://www.w3.org/2000/svg" className="w-6 h-6 text-violet-600">
                  <path d="M12 2C6.477 2 2 6.477 2 12s4.477 10 12 10c3.1 0 5.89-1.41 1.77-5.5L12 13.5L8.5 17H6.5L12 11.5L17.5 17H15.5L12 13.5L15.5 10H19.5C21.1 12 22 14.4 22 12c0-5.523-4.477-10-10-10z" fill="currentColor" />
                </svg>
                <span className="tracking-tight text-gray-900">Regaarder Compose</span>
              </div>
            </div>

            <div className="px-4 py-3">
              <button 
                onClick={openCreationPicker}
                className="w-full bg-violet-600 hover:bg-violet-700 text-white rounded-lg py-2 flex items-center justify-center gap-2 font-medium text-sm transition-colors active:scale-95"
              >
                <Plus size={16} />
                New Composition
              </button>
            </div>

            <div className="px-4 pb-2">
              <div
                className="relative"
                onMouseEnter={() => setIsFormattingDropdownHovered(true)}
                onMouseLeave={() => setIsFormattingDropdownHovered(false)}
              >
                <Search size={14} className="absolute left-2.5 top-2 text-gray-400" />
                <input 
                  type="text" 
                  placeholder="Search compositions..." 
                  className="w-full bg-white border border-gray-200 rounded-md py-1.5 pl-8 pr-2 text-sm focus:outline-none focus:border-violet-300"
                />
                <span className="absolute right-2.5 top-1.5 text-xs text-gray-400 border border-gray-200 rounded px-1">Ctrl K</span>
              </div>
            </div>
          </>
        )}

        {/* Main Nav Links */}
        {showDocumentOutlineView ? (
          <div className="flex-1 overflow-y-auto px-3 py-3">
            <div className="rounded-2xl border border-violet-100 bg-white/90 p-3 shadow-[0_18px_40px_-28px_rgba(109,40,217,0.25)]">
              <div className="flex items-center justify-between mb-2">
                <span className="text-[10px] font-semibold tracking-[0.12em] text-violet-700 uppercase">Document Outline</span>
                <span className="text-[10px] font-semibold text-violet-600 bg-violet-50 border border-violet-100 rounded-full px-2 py-0.5">{Math.max(0, documentOutlineItems.length - 1)} Sections</span>
              </div>
              <div className="mb-3 rounded-xl bg-[#FAFAFC] border border-gray-100 px-3 py-2">
                <div className="text-[11px] font-semibold text-gray-500 uppercase tracking-wide">Focused document</div>
                <div className="text-sm font-semibold text-gray-900 truncate mt-1" title={docTitle}>{docTitleDisplay}</div>
              </div>
              {documentOutlineItems.length > 1 ? (
                <div className="max-h-[52vh] overflow-y-auto pr-1 space-y-0.5 thin-scrollbar">
                  {documentOutlineItems.map((item, index) => (
                    <button
                      key={`${item.id}-${index}`}
                      type="button"
                      onClick={() => jumpToOutlineItem(item)}
                      className={`w-full text-left rounded-lg py-1.5 text-xs transition-colors ${item.isTitle ? 'font-semibold text-gray-900 hover:bg-violet-50 px-2' : 'text-gray-600 hover:bg-gray-100'}`}
                      style={item.isTitle ? undefined : { paddingLeft: `${10 + Math.max(0, item.level - 1) * 12}px`, paddingRight: '6px' }}
                      title={item.label}
                    >
                      <span className="block truncate">{item.label}</span>
                    </button>
                  ))}
                </div>
              ) : (
                <div className="text-[11px] text-gray-500 px-1.5 py-2">Generate or format headings to populate the outline.</div>
              )}
            </div>
          </div>
        ) : (
          <div className="flex-1 overflow-y-auto px-2 space-y-0.5">
            <button
              onClick={() => setActivePrimaryNav('home')}
              className={`w-full flex items-center gap-3 px-2 py-1.5 text-sm rounded-md transition-colors ${activePrimaryNav === 'home' ? 'bg-violet-50 text-violet-700 font-medium' : 'text-gray-600 hover:bg-gray-100'}`}
            >
              <Home size={16} /> Home
            </button>
            <button
              onClick={() => setActivePrimaryNav('library')}
              className={`w-full flex items-center justify-between px-2 py-1.5 text-sm rounded-md transition-colors ${activePrimaryNav === 'library' ? 'bg-violet-50 text-violet-700 font-medium' : 'text-gray-600 hover:bg-gray-100'}`}
            >
              <div className="flex items-center gap-3">
                <BookOpen size={16} className={activePrimaryNav === 'library' ? 'text-violet-600' : ''} /> Library
              </div>
            </button>
            <button
              onClick={() => setActivePrimaryNav('drafts')}
              className={`w-full flex items-center justify-between px-2 py-1.5 text-sm rounded-md transition-colors ${activePrimaryNav === 'drafts' ? 'bg-violet-50 text-violet-700 font-medium' : 'text-gray-600 hover:bg-gray-100'}`}
            >
              <div className="flex items-center gap-3">
                <FileText size={16} className={activePrimaryNav === 'drafts' ? 'text-violet-600' : ''} /> Drafts
              </div>
            </button>
            <button
              onClick={() => setActivePrimaryNav('inbox')}
              className={`w-full flex items-center justify-between px-2 py-1.5 text-sm rounded-md transition-colors ${activePrimaryNav === 'inbox' ? 'bg-violet-50 text-violet-700 font-medium' : 'text-gray-600 hover:bg-gray-100'}`}
            >
              <div className="flex items-center gap-3">
                <Inbox size={16} /> Inbox
              </div>
              <span className="bg-gray-100 text-gray-500 text-xs px-1.5 py-0.5 rounded-full font-medium">12</span>
            </button>
            <button className="w-full flex items-center gap-3 px-2 py-1.5 text-sm text-gray-600 hover:bg-gray-100 rounded-md transition-colors">
              <Star size={16} /> Starred
            </button>
            <button className="w-full flex items-center gap-3 px-2 py-1.5 text-sm text-gray-600 hover:bg-gray-100 rounded-md transition-colors">
              <Users size={16} /> Shared
            </button>
            <button
              onClick={() => {
                setActiveRightTab('memory');
                setRightSidebarOpen(true);
              }}
              className="w-full flex items-center gap-3 px-2 py-1.5 text-sm text-gray-600 hover:bg-gray-100 rounded-md transition-colors"
            >
              <Database size={16} /> Memory
            </button>
            <button className="w-full flex items-center gap-3 px-2 py-1.5 text-sm text-gray-600 hover:bg-gray-100 rounded-md transition-colors mb-4">
              <Trash size={16} /> Trash
            </button>

            {/* Workspaces Section */}
            <div className="flex items-center justify-between px-2 py-2 mt-4">
              <span className="text-xs font-semibold text-gray-500 uppercase tracking-wider">Workspaces</span>
              <button onClick={openCreateWorkspaceModal} className="text-gray-400 hover:text-gray-600">
                <Plus size={14} className="cursor-pointer" />
              </button>
            </div>

            <div className="space-y-1">
              {workspaces.map((workspace) => (
                <div key={workspace.id} className="relative">
                  <button className="w-full flex items-center justify-between px-2 py-1.5 text-sm text-gray-700 hover:bg-gray-100 rounded-md font-medium transition-colors">
                    <div className="flex items-center gap-3">
                      <WorkspaceIcon letter={workspace.letter} colorClass={workspace.colorClass} /> {workspace.name}
                    </div>
                    <MoreHorizontal
                      size={14}
                      data-workspace-menu-root
                      className="text-gray-400"
                      onClick={(event) => {
                        event.stopPropagation();
                        closeTransientMenus();
                        setOpenWorkspaceMenuId((prev) => (prev === workspace.id ? null : workspace.id));
                      }}
                    />
                  </button>

                  {openWorkspaceMenuId === workspace.id && (
                    <div className="absolute right-2 top-9 z-30 w-28 bg-white border border-gray-200 rounded-lg shadow-lg p-1" data-workspace-menu-root>
                      <button
                        onClick={() => openRenameWorkspaceModal(workspace)}
                        className="w-full text-left px-2 py-1 text-xs rounded hover:bg-violet-50"
                      >
                        Rename
                      </button>
                    </div>
                  )}

                  {workspace.hasDocuments && (
                    <div className="ml-7 mt-1 space-y-0.5 border-l border-gray-200 pl-1">
                      {orderedDocuments.map((doc) => {
                        const label = doc.title?.trim() ? doc.title : UNTITLED_COMPOSITION_LABEL;
                        const isActive = activeDocId === doc.id;

                        return (
                          <button
                            key={doc.id}
                            onClick={() => switchDocument(doc.id)}
                            className={`w-full flex items-center justify-between pl-3 pr-2 py-1 text-sm rounded-r-md transition-colors ${isActive ? 'bg-violet-50 text-violet-700' : 'text-gray-600 hover:bg-gray-100'}`}
                          >
                            <div className="flex items-center gap-2 truncate">
                              <FileText size={14} className={isActive ? 'text-violet-500' : 'text-gray-400'} />
                              <span className="truncate">{doc.pinned ? 'Pinned: ' : ''}{label}</span>
                            </div>
                            <MoreHorizontal size={14} className={isActive ? 'text-violet-400' : 'text-gray-300'} />
                          </button>
                        );
                      })}
                    </div>
                  )}
                </div>
              ))}
            </div>
          </div>
        )}

        {/* Footer Settings */}
        <div className="p-4 border-t border-gray-100 bg-[#FAFAFC]">
          <button className="flex items-center gap-3 text-sm text-gray-600 hover:text-gray-900 w-full transition-colors">
            <Settings size={16} /> Settings
          </button>
        </div>
      </div>

      {leftSidebarOpen && (
        <div
          onMouseDown={(event) => beginPanelResize('left', event)}
          className="w-1 shrink-0 cursor-col-resize bg-transparent hover:bg-violet-100 active:bg-violet-200 transition-colors opacity-0 hover:opacity-100"
          aria-label="Resize left sidebar"
        />
      )}

      {/* 2. Main Editor Area */}
      <div className="flex-1 flex flex-col min-w-0 bg-white relative">
        
        {/* Top Header */}
        <div className="h-14 flex items-center justify-between px-6 border-b border-gray-100 shrink-0 select-none">
          <div className="flex items-center gap-3">
            <button
              onClick={() => setLeftSidebarOpen((prev) => !prev)}
              className="text-gray-400 hover:text-gray-600"
            >
              {leftSidebarOpen ? <ChevronLeft size={18} /> : <ChevronRight size={18} />}
            </button>
            {isUnsavedDraftVisible && (
              <>
                {isEditingUnsavedDraftName ? (
                  <input
                    autoFocus
                    type="text"
                    value={unsavedDraftNameInput}
                    onChange={(e) => setUnsavedDraftNameInput(e.target.value)}
                    onBlur={commitUnsavedDraftRename}
                    onKeyDown={(e) => {
                      if (e.key === 'Enter') {
                        e.preventDefault();
                        commitUnsavedDraftRename();
                      }
                      if (e.key === 'Escape') {
                        setIsEditingUnsavedDraftName(false);
                        setUnsavedDraftNameInput('');
                      }
                    }}
                    className="text-sm text-gray-500 font-medium italic bg-white border border-violet-200 rounded px-2 py-0.5 min-w-[180px] outline-none focus:border-violet-400"
                    placeholder="Rename draft"
                  />
                ) : (
                  <button
                    type="button"
                    onClick={() => setIsTopDraftTitleExpanded((prev) => !prev)}
                    onDoubleClick={beginUnsavedDraftRename}
                    className="text-sm text-gray-400 font-medium italic hover:text-gray-600 px-1 py-0.5 rounded min-w-[110px] text-left"
                    title={(documents.find((doc) => doc.id === activeDocId)?.title || docTitle || 'Unsaved draft').trim() || 'Unsaved draft'}
                  >
                    {(() => {
                      const rawTitle = (documents.find((doc) => doc.id === activeDocId)?.title || docTitle || 'Unsaved draft').trim() || 'Unsaved draft';
                      if (isTopDraftTitleExpanded || rawTitle.length <= 20) {
                        return rawTitle;
                      }
                      return `${rawTitle.slice(0, 20)}...`;
                    })()}
                  </button>
                )}
                <div className="flex items-center gap-1.5 text-xs text-gray-400 ml-2">
                  <Cloud size={14} /> {savedStatusLabel}
                </div>
              </>
            )}
          </div>

          <div className="flex items-center gap-4">
            <div className="flex items-center gap-1">
              <button
                onClick={undoDocumentChange}
                className="p-1.5 rounded-md text-gray-500 hover:text-gray-700 hover:bg-gray-100"
                title="Undo (Ctrl+Z)"
              >
                <Undo2 size={15} />
              </button>
              <button
                onClick={redoDocumentChange}
                className="p-1.5 rounded-md text-gray-500 hover:text-gray-700 hover:bg-gray-100"
                title="Redo (Ctrl+Y)"
              >
                <Redo2 size={15} />
              </button>
              <button
                onClick={openReplayPanel}
                className={`p-1.5 rounded-md transition-colors ${replayPanelOpen ? 'text-violet-700 bg-violet-50' : 'text-gray-500 hover:text-gray-700 hover:bg-gray-100'}`}
                title="Open edit replay"
              >
                <Clock size={15} />
              </button>
              <button
                onClick={saveDocumentLocally}
                className="p-1.5 rounded-md text-gray-500 hover:text-gray-700 hover:bg-gray-100"
                title="Save locally (Ctrl+S)"
              >
                <Save size={15} />
              </button>
            </div>
            <button
              onClick={() => openShareModal(activeDocId || documents[0]?.id)}
              className="bg-violet-600 hover:bg-violet-700 text-white text-sm font-medium px-4 py-1.5 rounded-md flex items-center gap-2 transition-all active:scale-95"
            >
              <Users size={16} /> Share
            </button>
            
            {/* Avatars */}
            <div className="flex -space-x-2">
              <img className="w-7 h-7 rounded-full border-2 border-white" src="https://images.unsplash.com/photo-1534528741775-53994a69daeb?auto=format&fit=crop&w=100&q=80" alt="Sarah" />
              <img className="w-7 h-7 rounded-full border-2 border-white" src="https://images.unsplash.com/photo-1507003211169-0a1dd7228f2d?auto=format&fit=crop&w=100&q=80" alt="Alex" />
              <img className="w-7 h-7 rounded-full border-2 border-white" src="https://images.unsplash.com/photo-1494790108377-be9c29b29330?auto=format&fit=crop&w=100&q=80" alt="Maya" />
            </div>

            <button
              type="button"
              onClick={() => setIsDarkMode((prev) => !prev)}
              className="w-7 h-7 flex items-center justify-center rounded-md text-gray-400 hover:text-gray-700 hover:bg-gray-100 transition-colors"
              title={isDarkMode ? 'Switch to light mode' : 'Switch to dark mode'}
            >
              {isDarkMode ? <Sun size={14} /> : <Moon size={14} />}
            </button>

            <div className="relative" ref={notificationsPanelRef}>
              <button
                type="button"
                onClick={() => {
                    setReplaySpeedMenuOpen(false);
                  setNotificationsOpen((prev) => !prev);
                  setNotifications((prev) => prev.map((item) => ({ ...item, unread: false })));
                }}
                className="w-7 h-7 flex items-center justify-center rounded-md text-gray-400 hover:text-gray-600 hover:bg-gray-100 relative transition-colors"
                title="Notifications"
              >
                <Bell size={18} />
                {notifications.length > 0 && (
                  <span className="absolute top-[1px] right-[6px] w-1.5 h-1.5 bg-violet-500 rounded-full"></span>
                )}
              </button>
              {notificationsOpen && (
                <div className="absolute right-0 top-8 z-[450] w-[300px] rounded-2xl border border-violet-100 bg-white shadow-[0_24px_60px_-28px_rgba(15,23,42,0.45)] p-2">
                  <div className="px-2 py-1.5 text-[11px] font-semibold tracking-[0.08em] uppercase text-violet-600">Notifications</div>
                  <div className="max-h-[260px] overflow-y-auto thin-scrollbar space-y-1 px-1 pb-1">
                    {notifications.map((item) => (
                      <div key={item.id} className="rounded-xl border border-slate-100 px-3 py-2.5 hover:bg-violet-50/50">
                        <div className="flex items-start justify-between gap-2">
                          <div className="text-[12px] font-medium text-slate-800">{item.title}</div>
                          {item.unread && <span className="mt-1 h-2 w-2 rounded-full bg-violet-500" />}
                        </div>
                        <div className="mt-0.5 text-[11px] text-slate-500">{item.detail}</div>
                      </div>
                    ))}
                  </div>
                </div>
              )}
            </div>
            <button 
              onClick={() => handleMiniSidebarClick('assistant')}
              className={`w-7 h-7 flex items-center justify-center rounded-md transition-colors ${activeRightTab === 'assistant' && rightSidebarOpen ? 'bg-violet-100 text-violet-700' : 'bg-violet-50 text-violet-600 hover:bg-violet-100'}`}
            >
              <Sparkles size={14} />
            </button>
          </div>
        </div>

        {replayPanelOpen && (
          <div className="absolute right-6 top-16 z-[260] w-[430px] overflow-visible rounded-[22px] border border-[#e8e6f2] bg-white shadow-[0_30px_70px_-34px_rgba(15,23,42,0.42)]">
            <div className="flex items-start justify-between gap-3 border-b border-[#efedf6] px-5 py-4">
              <div>
                <div className="text-[13px] font-semibold text-slate-900">Edit replay</div>
                <div className="mt-1 text-[12px] text-slate-500">
                  {replayTimeline.length
                    ? `${replayIndex === null ? replayTimeline.length : replayIndex + 1} of ${replayTimeline.length} steps 繚 ${formatReplayDuration((replayTimeline[replayTimeline.length - 1]?.timestamp || 0) - (replayTimeline[0]?.timestamp || 0))} worked`
                    : 'Start typing or editing to build a replay history'}
                </div>
              </div>
              <button
                type="button"
                onClick={() => {
                  setReplayPanelOpen(false);
                  setIsReplayPlaying(false);
                }}
                className="rounded-full p-1.5 text-slate-400 hover:bg-slate-100 hover:text-slate-600"
                title="Close replay"
              >
                <X size={14} />
              </button>
            </div>

            <div className="space-y-4 px-5 py-4">
              <input
                type="range"
                min="0"
                max={Math.max(0, replayTimeline.length - 1)}
                value={Math.max(0, replayIndex ?? Math.max(0, replayTimeline.length - 1))}
                onChange={(event) => applyReplayIndex(Number(event.target.value))}
                disabled={!replayTimeline.length}
                className="w-full accent-violet-600"
                title="Scrub through edit steps"
              />

              <div className="flex items-center justify-between text-[12px] text-slate-500">
                <span>
                  {replayTimeline.length && replayTimeline[0]?.timestamp && replayTimeline[Math.max(0, replayIndex ?? replayTimeline.length - 1)]?.timestamp
                    ? formatReplayDuration(replayTimeline[Math.max(0, replayIndex ?? replayTimeline.length - 1)].timestamp - replayTimeline[0].timestamp)
                    : '0:00'}
                </span>
                <span>{replayTimeline.length ? `Step ${Math.max(0, replayIndex ?? replayTimeline.length - 1) + 1}` : 'No steps yet'}</span>
              </div>

              <div className="flex items-center gap-2">
                <button
                  type="button"
                  onClick={() => applyReplayIndex((replayIndex ?? replayTimeline.length - 1) - 1)}
                  disabled={!replayTimeline.length || (replayIndex ?? replayTimeline.length - 1) <= 0}
                  className="flex-1 inline-flex items-center justify-center gap-2 whitespace-nowrap rounded-xl border border-[#e5e7eb] bg-white px-3 py-3 text-[13px] font-medium text-slate-700 hover:bg-slate-50 disabled:cursor-not-allowed disabled:opacity-50"
                  title="Move one step backward"
                >
                  <Undo2 size={13} />
                  Step Back
                </button>
                <button
                  type="button"
                  onClick={toggleSmartReplayPlayback}
                  disabled={!replayTimeline.length}
                  className={`flex-1 inline-flex items-center justify-center gap-2 whitespace-nowrap rounded-xl px-4 py-3 text-[13px] font-medium text-white disabled:cursor-not-allowed disabled:opacity-50 ${isReplayPlaying ? 'bg-[#5b21b6] hover:bg-[#4c1d95]' : 'bg-violet-600 hover:bg-violet-700'}`}
                  title={isReplayPlaying ? 'Pause replay' : (getSmartReplayDirection() < 0 ? 'Play backward toward earlier edits' : 'Play forward toward latest edits')}
                >
                  {isReplayPlaying ? <Pause size={13} /> : <Play size={13} />}
                  Rewind
                </button>
                <button
                  type="button"
                  onClick={() => applyReplayIndex((replayIndex ?? 0) + 1)}
                  disabled={!replayTimeline.length || (replayIndex ?? 0) >= replayTimeline.length - 1}
                  className="flex-1 inline-flex items-center justify-center gap-2 whitespace-nowrap rounded-xl border border-[#e5e7eb] bg-white px-3 py-3 text-[13px] font-medium text-slate-700 hover:bg-slate-50 disabled:cursor-not-allowed disabled:opacity-50"
                  title="Move one step forward"
                >
                  <Redo2 size={13} />
                  Step Forward
                </button>
              </div>

              <div className="flex items-center justify-between gap-2 pt-1" ref={replaySpeedMenuRef}>
                <label className="text-[12px] font-medium text-slate-500">Speed</label>
                <div className="relative">
                  <button
                    type="button"
                    onClick={() => {
                      setNotificationsOpen(false);
                      setReplaySpeedMenuOpen((prev) => !prev);
                    }}
                    className="inline-flex items-center gap-2 rounded-xl border border-violet-200 bg-violet-50 px-3 py-2 text-[12px] font-semibold text-violet-700 hover:bg-violet-100"
                    title="Playback speed"
                  >
                    <span>{replaySpeed}x</span>
                    <ChevronDown size={13} className={`transition-transform ${replaySpeedMenuOpen ? 'rotate-180' : ''}`} />
                  </button>
                  {replaySpeedMenuOpen && (
                    <div className="absolute right-0 top-[42px] z-[320] w-[110px] rounded-xl border border-violet-100 bg-white shadow-[0_18px_40px_-22px_rgba(76,29,149,0.45)] p-1">
                      {[0.25, 0.5, 1, 1.5, 2].map((speedOption) => (
                        <button
                          key={speedOption}
                          type="button"
                          onClick={() => {
                            setReplaySpeed(speedOption);
                            setReplaySpeedMenuOpen(false);
                          }}
                          className={`w-full flex items-center justify-between rounded-lg px-2.5 py-1.5 text-[12px] ${replaySpeed === speedOption ? 'bg-violet-50 text-violet-700 font-semibold' : 'text-slate-600 hover:bg-slate-50'}`}
                        >
                          <span>{speedOption}x</span>
                          {replaySpeed === speedOption && <Check size={12} className="text-violet-600" />}
                        </button>
                      ))}
                    </div>
                  )}
                </div>
              </div>

              <button
                type="button"
                onClick={shareReplayTimeline}
                disabled={!replayTimeline.length || replaySharing}
                className="w-full inline-flex items-center justify-center gap-2 rounded-xl border border-violet-200 bg-violet-50 px-3 py-2.5 text-[13px] font-medium text-violet-700 hover:bg-violet-100 disabled:cursor-not-allowed disabled:opacity-50"
                title="Copy a replay link that other users can open and play"
              >
                <LinkIcon size={14} />
                {replaySharing ? 'Preparing Link...' : 'Share Replay'}
              </button>
            </div>
          </div>
        )}

        {selectionActionMenu.open && !isComposing && (
          <div
            ref={selectionActionMenuRef}
            onPointerDownCapture={() => {
              pointerDownInSelectionMenuRef.current = true;
            }}
            onPointerUpCapture={() => {
              pointerDownInSelectionMenuRef.current = false;
            }}
            className="fixed z-[280] w-[344px] max-h-[72vh] overflow-y-hidden hover:overflow-y-auto thin-scrollbar rounded-[24px] border border-[#e6e3fb] bg-white shadow-[0_24px_80px_-32px_rgba(76,29,149,0.45)] backdrop-blur-sm"
            style={{ left: `${selectionActionMenu.left}px`, top: `${selectionActionMenu.top}px` }}
          >
            <div className="border-b border-[#f0eefc] bg-[linear-gradient(180deg,#fbfaff_0%,#ffffff_100%)] px-4 py-3">
              <div className="mb-2 flex items-center justify-between gap-3">
                <div className="text-[11px] font-semibold uppercase tracking-[0.18em] text-violet-500">Selection tools</div>
              </div>
              <div className="flex items-center gap-2 rounded-2xl border border-[#e9e6f8] bg-white px-3 py-2 shadow-[inset_0_1px_0_rgba(255,255,255,0.8)]">
                <Sparkles size={16} className="shrink-0 text-violet-500" />
                <input
                  ref={selectionMenuInputRef}
                  type="text"
                  placeholder="Ask AI about this selection"
                  className="w-full bg-transparent text-sm text-slate-700 outline-none placeholder:text-slate-400"
                  value={selectionMenuPrompt}
                  onChange={(event) => setSelectionMenuPrompt(event.target.value)}
                  onKeyDown={(event) => {
                    if (event.key === 'Enter') {
                      event.preventDefault();
                      const prompt = selectionMenuPrompt.trim() || 'Analyze this selected text and explain what it means, including the strongest insight.';
                      runSelectedTextAction({ key: 'ask', prompt });
                    }
                  }}
                />
              </div>
            </div>

            <div className="grid grid-cols-2 gap-2 p-3">
              {[
                {
                  key: 'rewrite',
                  icon: <Wand2 size={16} />,
                  title: 'Rewrite',
                  subtitle: 'Clearer wording',
                  prompt: 'Rewrite the selected text to be clearer, tighter, and more readable.',
                },
                {
                  key: 'summary',
                  icon: <FileText size={16} />,
                  title: 'Summarize',
                  subtitle: 'Shorten it',
                  prompt: 'Summarize the selected text in fewer words while preserving core meaning.',
                },
                {
                  key: 'expand',
                  icon: <Expand size={16} />,
                  title: 'Expand',
                  subtitle: 'Add detail',
                  prompt: 'Expand the selected text with more detail and useful context.',
                },
                {
                  key: 'tone',
                  icon: <Sparkles size={16} />,
                  title: 'Change tone',
                  subtitle: 'More formal',
                  prompt: 'Rewrite the selected text in a more formal and professional tone.',
                },
                {
                  key: 'slide',
                  icon: <Presentation size={16} />,
                  title: 'Create slide',
                  subtitle: 'Presentation format',
                  prompt: 'Turn the selected text into one presentation slide with title, headline, and concise bullets.',
                },
                {
                  key: 'keypoints',
                  icon: <ListTodo size={16} />,
                  title: 'Key points',
                  subtitle: 'Bullet list',
                  prompt: 'Extract key points from the selected text as a concise bullet list.',
                },
              ].map((item) => (
                <button
                  key={item.key}
                  type="button"
                  onMouseDown={(event) => {
                    event.preventDefault();
                    event.stopPropagation();
                  }}
                  onClick={() => runSelectedTextAction({ key: item.key, prompt: item.prompt })}
                  className="rounded-2xl border border-slate-200 bg-white px-3 py-3 text-left transition-all duration-150 hover:-translate-y-[1px] hover:border-violet-200 hover:bg-violet-50/50 hover:shadow-[0_10px_24px_-18px_rgba(109,40,217,0.7)]"
                >
                  <div className="mb-2 inline-flex h-8 w-8 items-center justify-center rounded-full bg-violet-50 text-violet-600">
                    {item.icon}
                  </div>
                  <div className="text-[13px] font-semibold text-slate-800">{item.title}</div>
                  <div className="mt-0.5 text-[11px] text-slate-500">{item.subtitle}</div>
                </button>
              ))}
            </div>

            <div className="border-t border-[#f0eefc] px-3 py-3">
              <button
                type="button"
                onMouseDown={(event) => {
                  event.preventDefault();
                  event.stopPropagation();
                }}
                onClick={() => {
                  setRightSidebarOpen(true);
                  setActiveRightTab('assistant');
                  setSelectionActionMenu({ open: false, left: 0, top: 0 });
                }}
                className="flex w-full items-center justify-between rounded-2xl border border-slate-200 bg-slate-50 px-3 py-3 text-left transition-colors hover:border-violet-200 hover:bg-violet-50/70"
              >
                <div className="flex items-center gap-3">
                  <div className="inline-flex h-8 w-8 items-center justify-center rounded-full bg-white text-violet-600 ring-1 ring-slate-200">
                    <Sparkles size={16} />
                  </div>
                  <div>
                    <div className="text-[13px] font-semibold text-slate-800">More actions</div>
                    <div className="text-[11px] text-slate-500">Open the full assistant panel</div>
                  </div>
                </div>
                <ChevronRight size={16} className="text-slate-400" />
              </button>
            </div>
          </div>
        )}

        <div className="h-10 border-b border-gray-100 px-4 flex items-center gap-2 overflow-visible no-scrollbar bg-[#FAFAFC] relative z-[140]">
          {orderedDocuments.map((doc) => {
            const label = doc.title?.trim() ? doc.title : UNTITLED_COMPOSITION_LABEL;
            const isActive = activeDocId === doc.id;

            return (
              <div
                key={doc.id}
                onClick={() => switchDocument(doc.id)}
                className={`relative shrink-0 px-2 py-1 rounded-md text-xs font-medium border transition-colors flex items-center gap-1.5 ${isActive ? 'bg-white border-violet-200 text-violet-700' : 'bg-transparent border-transparent text-gray-500 hover:bg-white hover:border-gray-200'}`}
              >
                {renamingDocId === doc.id ? (
                  <input
                    autoFocus
                    value={renameDocValue}
                    onChange={(e) => setRenameDocValue(e.target.value)}
                    onClick={(event) => event.stopPropagation()}
                    onKeyDown={(event) => {
                      if (event.key === 'Enter') {
                        event.preventDefault();
                        commitRenameDocument(doc.id);
                      }
                      if (event.key === 'Escape') {
                        setRenamingDocId(null);
                        setRenameDocValue('');
                      }
                    }}
                    onBlur={() => commitRenameDocument(doc.id)}
                    className="w-[160px] bg-white border border-violet-200 rounded px-1 py-0.5 text-xs outline-none"
                  />
                ) : (
                  <span className="max-w-[160px] truncate">{doc.pinned ? 'Pinned: ' : ''}{label}</span>
                )}
                <button
                  data-doc-menu-root
                  onClick={(event) => {
                    event.stopPropagation();
                    closeTransientMenus();
                    setOpenDocMenuId((prev) => (prev === doc.id ? null : doc.id));
                  }}
                  className="p-0.5 rounded hover:bg-gray-100 shrink-0"
                  title="Document actions"
                >
                  <MoreHorizontal size={12} />
                </button>
                <button
                  onClick={(event) => {
                    event.stopPropagation();
                    requestCloseDocument(doc.id);
                  }}
                  className="p-0.5 rounded hover:bg-rose-50 text-gray-400 hover:text-rose-600 shrink-0"
                  title="Close document"
                >
                  <X size={12} />
                </button>
                {openDocMenuId === doc.id && (
                  <div className="absolute right-0 top-full mt-1 z-[230] w-36 bg-white isolate border border-gray-200 rounded-lg shadow-2xl ring-1 ring-black/5 p-1" data-doc-menu-root>
                    <button onClick={(e) => { e.stopPropagation(); handleDocumentAction('rename', doc.id); }} className="w-full text-left px-2 py-1.5 text-xs rounded hover:bg-violet-50">Rename</button>
                    <button onClick={(e) => { e.stopPropagation(); handleDocumentAction('save', doc.id); }} className="w-full text-left px-2 py-1.5 text-xs rounded hover:bg-violet-50">Save</button>
                    <button onClick={(e) => { e.stopPropagation(); handleDocumentAction('share', doc.id); }} className="w-full text-left px-2 py-1.5 text-xs rounded hover:bg-violet-50">Share</button>
                    <button onClick={(e) => { e.stopPropagation(); handleDocumentAction('pin', doc.id); }} className="w-full text-left px-2 py-1.5 text-xs rounded hover:bg-violet-50">{doc.pinned ? 'Unpin' : 'Pin'}</button>
                    <div className="border-t border-gray-100 my-1"></div>
                    <button onClick={(e) => { e.stopPropagation(); handleDocumentAction('close', doc.id); }} className="w-full text-left px-2 py-1.5 text-xs rounded hover:bg-rose-50 text-rose-600">Close</button>
                  </div>
                )}
              </div>
            );
          })}
          <button
            type="button"
            onClick={() => createNewComposition()}
            className="shrink-0 inline-flex h-7 w-7 items-center justify-center rounded-full text-violet-600 hover:bg-violet-50 hover:text-violet-700 transition-colors"
            title="Create new composition"
            aria-label="Create new composition"
          >
            <Plus size={18} strokeWidth={2.4} />
          </button>
        </div>

        {/* Formatting Ribbon */}
        <div
          ref={formattingMenuRef}
          onMouseDown={(event) => {
            if (event.target.closest('button')) {
              event.preventDefault();
            }
          }}
          className="h-12 border-b border-gray-100 flex items-center px-6 gap-4 text-sm text-gray-600 shrink-0 overflow-visible no-scrollbar select-none relative z-[130]"
        >
          <div
            className="relative"
            onMouseEnter={() => setIsFormattingDropdownHovered(true)}
            onMouseLeave={() => setIsFormattingDropdownHovered(false)}
          >
            <button
              onClick={() => {
                closeTransientMenus();
                setOpenDropdown((prev) => (prev === 'heading' ? null : 'heading'));
              }}
              className="flex items-center gap-1 hover:bg-gray-50 px-2 py-1 rounded whitespace-nowrap shrink-0"
            >
              {editorHeading} <ChevronDown size={14} className="text-gray-400" />
            </button>
            {openDropdown === 'heading' && (
              <div className="absolute top-9 left-0 z-[230] w-44 bg-white isolate border border-gray-200 rounded-lg shadow-2xl ring-1 ring-black/5 p-2">
                <input
                  value={headingSearch}
                  onChange={(e) => setHeadingSearch(e.target.value)}
                  placeholder="Search heading"
                  className="w-full border border-gray-200 rounded px-2 py-1 text-xs mb-2 outline-none focus:border-violet-400"
                />
                <div className="max-h-40 overflow-y-auto">
                  {headingOptions
                    .filter((option) => option.toLowerCase().includes(headingSearch.toLowerCase()))
                    .map((option) => (
                      <button
                        key={option}
                        onClick={() => {
                          const nextHeading = headingMeta[option] || headingMeta.Paragraph;
                          setEditorHeading(option);
                          setEditorSize(nextHeading.size);
                          applyFormatCommand('formatBlock', nextHeading.tag);
                          applyFormatCommand('fontSize', String(nextHeading.size));
                          setOpenDropdown(null);
                        }}
                        className="w-full text-left px-2 py-1 rounded text-xs hover:bg-violet-50"
                      >
                        <span className={headingMeta[option]?.previewClass || 'text-xs'}>{option}</span>
                      </button>
                    ))}
                </div>
              </div>
            )}
          </div>
          <button
            onClick={openCreationPicker}
            className="h-7 w-7 rounded-full border border-gray-200 hover:border-violet-300 hover:bg-violet-50 text-gray-600 hover:text-violet-700 flex items-center justify-center"
            title="Create new composition"
            aria-label="Create new composition"
          >
            <Plus size={14} />
          </button>
          <div
            className="relative"
            onMouseEnter={() => setIsFormattingDropdownHovered(true)}
            onMouseLeave={() => setIsFormattingDropdownHovered(false)}
          >
            <button
              type="button"
              onClick={() => {
                closeTransientMenus();
                setOpenDropdown((prev) => (prev === 'page-number' ? null : 'page-number'));
              }}
              className="flex items-center gap-1 hover:bg-gray-50 px-2 py-1 rounded text-xs"
              title="Page numbering"
            >
              Page # <ChevronDown size={13} className="text-gray-400" />
            </button>
            {openDropdown === 'page-number' && (
              <div className="absolute top-9 left-0 z-[230] w-52 bg-white isolate border border-gray-200 rounded-lg shadow-2xl ring-1 ring-black/5 p-2 space-y-2">
                <button
                  type="button"
                  onClick={() => setShowPageNumbers((prev) => !prev)}
                  className="w-full text-left px-2 py-1.5 text-xs rounded hover:bg-violet-50"
                >
                  {showPageNumbers ? 'Hide page numbers' : 'Show page numbers'}
                </button>
                <button
                  type="button"
                  onClick={() => setShowPageNumberOnFirstPage((prev) => !prev)}
                  className="w-full text-left px-2 py-1.5 text-xs rounded hover:bg-violet-50"
                >
                  {showPageNumberOnFirstPage ? 'Hide on first page' : 'Show on first page'}
                </button>
                <div className="border-t border-gray-100 pt-1">
                  <div className="px-2 py-1 text-[10px] uppercase tracking-wide text-gray-400">Position</div>
                  <div className="grid grid-cols-3 gap-1 px-1 pb-1">
                    {['left', 'center', 'right'].map((position) => (
                      <button
                        key={position}
                        type="button"
                        onClick={() => setPageNumberPosition(position)}
                        className={`text-[11px] rounded px-2 py-1 border ${pageNumberPosition === position ? 'bg-violet-50 border-violet-200 text-violet-700' : 'border-gray-200 text-gray-600 hover:bg-gray-50'}`}
                      >
                        {position}
                      </button>
                    ))}
                  </div>
                </div>
              </div>
            )}
          </div>
          <div className="w-px h-4 bg-gray-200"></div>
          <div
            className="relative"
            onMouseEnter={() => setIsFormattingDropdownHovered(true)}
            onMouseLeave={() => setIsFormattingDropdownHovered(false)}
          >
            <button
              onClick={() => {
                closeTransientMenus();
                setOpenDropdown((prev) => (prev === 'font' ? null : 'font'));
              }}
              className="flex items-center gap-1 hover:bg-gray-50 px-2 py-1 rounded"
            >
              {editorFont} <ChevronDown size={14} className="text-gray-400" />
            </button>
            {openDropdown === 'font' && (
              <div className="absolute top-9 left-0 z-[230] w-48 bg-white isolate border border-gray-200 rounded-lg shadow-2xl ring-1 ring-black/5 p-2">
                <input
                  value={fontSearch}
                  onChange={(e) => setFontSearch(e.target.value)}
                  placeholder="Search font"
                  className="w-full border border-gray-200 rounded px-2 py-1 text-xs mb-2 outline-none focus:border-violet-400"
                />
                <div className="max-h-40 overflow-y-auto">
                  {fontOptions
                    .filter((option) => option.toLowerCase().includes(fontSearch.toLowerCase()))
                    .sort((a, b) => a.localeCompare(b))
                    .map((option) => (
                      <button
                        key={option}
                        onClick={() => {
                          setEditorFont(option);
                          applyFormatCommand('fontName', option);
                          setOpenDropdown(null);
                        }}
                        className="w-full text-left px-2 py-1 rounded text-xs hover:bg-violet-50"
                        style={{ fontFamily: resolveFontFamily(option) }}
                      >
                        {option}
                      </button>
                    ))}
                </div>
              </div>
            )}
          </div>
          <div className="w-px h-4 bg-gray-200"></div>
          <div
            className="relative flex items-center gap-1"
            onMouseEnter={() => setIsFormattingDropdownHovered(true)}
            onMouseLeave={() => setIsFormattingDropdownHovered(false)}
          >
            <input
              type="number"
              min={10}
              max={72}
              value={editorSize}
              onChange={(e) => {
                const nextSize = Number(e.target.value) || 32;
                setEditorSize(nextSize);
                applyFormatCommand('fontSize', String(nextSize));
              }}
              className="w-14 bg-transparent border border-transparent hover:border-gray-200 rounded px-1 py-0.5 focus:outline-none"
            />
            <button
              onClick={() => {
                closeTransientMenus();
                setOpenDropdown((prev) => (prev === 'size' ? null : 'size'));
              }}
            >
              <ChevronDown size={14} className="text-gray-400" />
            </button>
            {openDropdown === 'size' && (
              <div className="absolute top-9 left-0 z-[230] w-32 bg-white isolate border border-gray-200 rounded-lg shadow-2xl ring-1 ring-black/5 p-2">
                <input
                  value={sizeSearch}
                  onChange={(e) => setSizeSearch(e.target.value)}
                  placeholder="Search"
                  className="w-full border border-gray-200 rounded px-2 py-1 text-xs mb-2 outline-none focus:border-violet-400"
                />
                <div className="max-h-40 overflow-y-auto">
                  {sizeOptions
                    .filter((option) => String(option).includes(sizeSearch.trim()))
                    .map((option) => (
                      <button
                        key={option}
                        onClick={() => {
                          setEditorSize(option);
                          applyFormatCommand('fontSize', String(option));
                          setOpenDropdown(null);
                        }}
                        className="w-full text-left px-2 py-1 rounded text-xs hover:bg-violet-50"
                      >
                        {option}
                      </button>
                    ))}
                </div>
              </div>
            )}
          </div>
          <div className="w-px h-4 bg-gray-200"></div>
          <div className="flex items-center gap-4">
            <button onClick={() => applyFormatCommand('bold')} className={`font-bold hover:text-gray-900 ${isBoldActive ? 'text-violet-600' : ''}`}>B</button>
            <button onClick={() => applyFormatCommand('italic')} className={`italic font-serif hover:text-gray-900 ${isItalicActive ? 'text-violet-600' : ''}`}>I</button>
            <button onClick={() => applyFormatCommand('underline')} className={`underline hover:text-gray-900 ${isUnderlineActive ? 'text-violet-600' : ''}`}>U</button>
            <button onClick={() => applyFormatCommand('strikeThrough')} className={`line-through hover:text-gray-900 ${isStrikeActive ? 'text-violet-600' : ''}`}>S</button>
            <div
              className="relative"
              onMouseEnter={() => setIsTextStyleMenuHovered(true)}
              onMouseLeave={() => setIsTextStyleMenuHovered(false)}
            >
              <button
                onClick={() => setTextStyleMenuOpen((prev) => !prev)}
                className="flex items-center gap-1.5 hover:text-gray-900 cursor-pointer pl-0.5"
              >
                <Type size={14} /> <ChevronDown size={12} className="text-gray-400" />
              </button>
              {textStyleMenuOpen && (
                <div className="absolute top-8 left-0 z-[230] w-32 bg-white isolate border border-gray-200 rounded-lg shadow-2xl ring-1 ring-black/5 p-1">
                  <button onClick={() => { applyFormatCommand('formatBlock', 'P'); setTextStyleMenuOpen(false); }} className="w-full text-left px-2 py-1.5 text-xs rounded hover:bg-violet-50">Body</button>
                  <button onClick={() => { applyFormatCommand('formatBlock', 'BLOCKQUOTE'); setTextStyleMenuOpen(false); }} className="w-full text-left px-2 py-1.5 text-xs rounded hover:bg-violet-50">Quote</button>
                  <button onClick={() => { applyFormatCommand('formatBlock', 'PRE'); setTextStyleMenuOpen(false); }} className="w-full text-left px-2 py-1.5 text-xs rounded hover:bg-violet-50">Code</button>
                </div>
              )}
            </div>
          </div>
          <div className="w-px h-4 bg-gray-200"></div>
          <button
            onClick={exportCurrentDocumentAsPdf}
            className="text-xs font-medium px-2 py-1 rounded hover:bg-violet-50 hover:text-violet-700"
            title="Convert current document to PDF"
          >
            PDF
          </button>
          <div className="w-px h-4 bg-gray-200"></div>
          <div className="flex items-center gap-3">
            <AlignLeft onClick={() => { setAlignMode('left'); applyFormatCommand('justifyLeft'); }} size={16} className={`${alignMode === 'left' ? 'text-violet-600' : 'hover:text-gray-900'} cursor-pointer`} />
            <AlignCenter onClick={() => { setAlignMode('center'); applyFormatCommand('justifyCenter'); }} size={16} className={`${alignMode === 'center' ? 'text-violet-600' : 'hover:text-gray-900'} cursor-pointer`} />
            <AlignRight onClick={() => { setAlignMode('right'); applyFormatCommand('justifyRight'); }} size={16} className={`${alignMode === 'right' ? 'text-violet-600' : 'hover:text-gray-900'} cursor-pointer`} />
            <List onClick={() => applyFormatCommand('insertUnorderedList')} size={16} className={`${isListActive ? 'text-violet-600' : 'hover:text-gray-900'} cursor-pointer`} />
          </div>
          <div className="w-px h-4 bg-gray-200"></div>
          <div className="relative flex items-center gap-3" ref={docSearchPanelRef}>
            <span className="font-serif italic font-bold hover:text-gray-900 cursor-pointer">I</span>
            <button
              type="button"
              onClick={() => {
                closeTransientMenus();
                setDocSearchPanelOpen((prev) => !prev);
                setDocSearchAutoPlay(false);
              }}
              className={`p-1.5 rounded-md transition-colors ${docSearchPanelOpen ? 'text-violet-700 bg-violet-50' : 'text-gray-500 hover:text-gray-900 hover:bg-gray-100'}`}
              title="Find, replace, and go to"
            >
              <Search size={15} />
            </button>
            {docSearchPanelOpen && (
              <div className="absolute right-0 top-9 z-[280] w-[360px] rounded-xl border border-gray-200 bg-white p-3 shadow-2xl ring-1 ring-black/5">
                <div className="flex items-center justify-between gap-2 mb-2">
                  <div className="flex items-center gap-1 rounded-lg border border-gray-200 p-1 text-[11px]">
                    {[
                      { key: 'find', label: 'Find' },
                      { key: 'replace', label: 'Replace' },
                      { key: 'goTo', label: 'Go To' },
                    ].map((item) => (
                      <button
                        key={item.key}
                        type="button"
                        onClick={() => setDocSearchMode(item.key)}
                        className={`px-2 py-1 rounded-md transition-colors ${docSearchMode === item.key ? 'bg-violet-100 text-violet-700' : 'text-gray-600 hover:bg-gray-100'}`}
                      >
                        {item.label}
                      </button>
                    ))}
                  </div>
                  <button
                    type="button"
                    onClick={() => setDocSearchAiEnabled((prev) => !prev)}
                    className={`text-[11px] px-2 py-1 rounded-full border transition-colors ${docSearchAiEnabled ? 'border-violet-300 bg-violet-50 text-violet-700' : 'border-gray-200 text-gray-500 hover:bg-gray-50'}`}
                    title="Enable AI-assisted search"
                  >
                    AI {docSearchAiEnabled ? 'On' : 'Off'}
                  </button>
                </div>

                {(docSearchMode === 'find' || docSearchMode === 'replace') && (
                  <>
                    <input
                      value={docSearchQuery}
                      onChange={(event) => setDocSearchQuery(event.target.value)}
                      placeholder={docSearchAiEnabled ? 'Try: find all companies mentioned in the docs' : 'Search text'}
                      className="w-full rounded-lg border border-gray-200 px-3 py-2 text-xs outline-none focus:border-violet-400"
                    />
                    {docSearchMode === 'replace' && (
                      <input
                        value={docReplaceValue}
                        onChange={(event) => setDocReplaceValue(event.target.value)}
                        placeholder="Replace with (leave empty to remove)"
                        className="mt-2 w-full rounded-lg border border-gray-200 px-3 py-2 text-xs outline-none focus:border-violet-400"
                      />
                    )}
                    <div className="mt-2 flex items-center gap-1.5">
                      <button
                        type="button"
                        onClick={() => highlightDocumentSearchTerms(docSearchQuery, docSearchAiEnabled)}
                        className="px-2.5 py-1.5 text-[11px] rounded-md bg-violet-600 text-white hover:bg-violet-700"
                      >
                        {docSearchMode === 'replace' ? 'Find Matches' : 'Find'}
                      </button>
                      {docSearchMode === 'replace' && (
                        <button
                          type="button"
                          onClick={replaceHighlightedSearchMatches}
                          className="px-2.5 py-1.5 text-[11px] rounded-md border border-violet-200 text-violet-700 hover:bg-violet-50"
                        >
                          Replace
                        </button>
                      )}
                      <button
                        type="button"
                        onClick={() => {
                          setDocSearchAutoPlay((prev) => !prev);
                          if (docSearchMatchCount <= 1) {
                            setDocSearchAutoPlay(false);
                          }
                        }}
                        className={`px-2.5 py-1.5 text-[11px] rounded-md border transition-colors ${docSearchAutoPlay ? 'border-violet-300 bg-violet-50 text-violet-700' : 'border-gray-200 text-gray-600 hover:bg-gray-50'}`}
                      >
                        {docSearchAutoPlay ? 'Pause' : 'Auto'}
                      </button>
                      <button
                        type="button"
                        onClick={() => focusSearchMatchAtIndex(docSearchActiveIndex - 1)}
                        disabled={!docSearchMatchCount}
                        className="px-2 py-1.5 text-[11px] rounded-md border border-gray-200 text-gray-600 hover:bg-gray-50 disabled:opacity-40"
                      >
                        Prev
                      </button>
                      <button
                        type="button"
                        onClick={() => focusSearchMatchAtIndex(docSearchActiveIndex + 1)}
                        disabled={!docSearchMatchCount}
                        className="px-2 py-1.5 text-[11px] rounded-md border border-gray-200 text-gray-600 hover:bg-gray-50 disabled:opacity-40"
                      >
                        Next
                      </button>
                    </div>
                    <div className="mt-2 text-[11px] text-gray-500">
                      {docSearchMatchCount ? `${docSearchActiveIndex + 1}/${docSearchMatchCount} selected` : '0 matches'}
                      {docSearchSummary ? ` - ${docSearchSummary}` : ''}
                    </div>
                  </>
                )}

                {docSearchMode === 'goTo' && (
                  <>
                    <input
                      value={docGoToValue}
                      onChange={(event) => setDocGoToValue(event.target.value)}
                      placeholder="Page number"
                      className="w-full rounded-lg border border-gray-200 px-3 py-2 text-xs outline-none focus:border-violet-400"
                    />
                    <div className="mt-2 flex items-center gap-2">
                      <button
                        type="button"
                        onClick={goToDocumentPage}
                        className="px-2.5 py-1.5 text-[11px] rounded-md bg-violet-600 text-white hover:bg-violet-700"
                      >
                        Go To Page
                      </button>
                    </div>
                  </>
                )}
              </div>
            )}
          </div>
        </div>

        {/* Document Editor Content (Beautifully separated page area) */}
        <div className="flex-1 overflow-y-auto thin-scrollbar relative bg-[#F7F7F9] p-6 md:p-8 transition-opacity duration-300 opacity-100">
          <div
            className="mx-auto"
            style={{
              width: '100%',
              maxWidth: `${ENTERPRISE_PAGE_WIDTH_PX}px`,
              transform: `scale(${zoomLevel / 100})`,
              transformOrigin: 'top center',
              transition: 'transform 180ms ease-out',
            }}
          >
          <div
            ref={documentCardRef}
            onKeyDownCapture={(event) => {
              if (event.key !== 'Enter' || event.shiftKey) {
                return;
              }
              const target = event.target;
              const isBodyTarget = Boolean(blankBodyRef.current && (target === blankBodyRef.current || blankBodyRef.current.contains(target)));
              if (!isBodyTarget) {
                return;
              }
              if (!shouldInsertNewPageOnEnter()) {
                return;
              }
              event.preventDefault();
              insertEnterprisePage();
            }}
            className="compose-editor-surface mx-auto bg-white rounded-[24px] shadow-[0_2px_24px_-4px_rgba(0,0,0,0.04)] border border-gray-100/70 px-12 md:px-16 pt-16 pb-36 relative"
            style={{ width: `${ENTERPRISE_PAGE_WIDTH_PX}px`, minHeight: `${ENTERPRISE_PAGE_HEIGHT_PX}px` }}
          >
            
            {/* Title & Subtitle */}
            <div
              ref={titleEditableRef}
              contentEditable
              suppressContentEditableWarning
              onFocus={(e) => clearPlaceholderOnFocus(e, AI_NATIVE_PLACEHOLDER)}
              onInput={(e) => normalizeEditableDirection(e.currentTarget)}
              onPaste={(e) => handleEditablePaste(e, AI_NATIVE_PLACEHOLDER, (target) => setDocTitle(target.textContent || ''))}
              onBlur={(e) => setDocTitle(e.currentTarget.textContent || '')}
              dir="ltr"
              className="w-full text-gray-900 leading-tight mb-2 tracking-tight border-none outline-none focus:ring-0 bg-transparent font-semibold"
              style={{ fontSize: `${editorSize}px`, fontFamily: editorFont, textAlign: alignMode, direction: 'ltr', unicodeBidi: 'plaintext', opacity: docTitle?.trim() ? 1 : 0.28 }}
              data-placeholder={AI_NATIVE_PLACEHOLDER}
            >
              {docTitle || AI_NATIVE_PLACEHOLDER}
            </div>
            
            <div
              ref={subtitleEditableRef}
              contentEditable
              suppressContentEditableWarning
              onFocus={(e) => clearPlaceholderOnFocus(e, AI_NATIVE_PLACEHOLDER)}
              onInput={(e) => normalizeEditableDirection(e.currentTarget)}
              onPaste={(e) => handleEditablePaste(e, AI_NATIVE_PLACEHOLDER, (target) => setDocSubtitle(target.textContent || ''))}
              onBlur={(e) => setDocSubtitle(e.currentTarget.textContent || '')}
              dir="ltr"
              className="w-full text-[17px] text-gray-500 mb-10 leading-relaxed max-w-2xl border-none outline-none resize-none focus:ring-0 bg-transparent min-h-14"
              style={{ fontFamily: editorFont, textAlign: alignMode, direction: 'ltr', unicodeBidi: 'plaintext', opacity: docSubtitle?.trim() ? 1 : 0.32 }}
            >
              {docSubtitle || AI_NATIVE_PLACEHOLDER}
            </div>

            {isBlankDocument && (
              <>
                <div
                  ref={blankBodyRef}
                  contentEditable
                  suppressContentEditableWarning
                  onInput={(e) => normalizeEditableDirection(e.currentTarget)}
                  onPaste={(e) => handleEditablePaste(e, AI_NATIVE_PLACEHOLDER, (target) => setDocBodyHtml(target.innerHTML))}
                  onBlur={(e) => setDocBodyHtml(e.currentTarget.innerHTML)}
                  dir="ltr"
                  className="mb-4 min-h-[220px] outline-none text-sm text-gray-700 leading-relaxed relative"
                  style={{ fontFamily: editorFont, textAlign: alignMode, direction: 'ltr', unicodeBidi: 'plaintext' }}
                  dangerouslySetInnerHTML={{ __html: docBodyHtml }}
                />
                {canShowComposeActions && (
                  <div className="mb-8 flex items-center justify-end gap-2 relative z-20 pointer-events-auto">
                    <button type="button" onMouseDown={(e) => { e.preventDefault(); e.stopPropagation(); }} onClick={handleComposeAccept} className="px-2.5 py-1.5 text-[11px] rounded-lg border border-emerald-200 text-emerald-700 hover:bg-emerald-50">Accept</button>
                    <button type="button" onMouseDown={(e) => { e.preventDefault(); e.stopPropagation(); }} onClick={handleComposeRetry} className="px-2.5 py-1.5 text-[11px] rounded-lg border border-gray-200 text-gray-700 hover:bg-gray-50">Retry</button>
                    <button type="button" onMouseDown={(e) => { e.preventDefault(); e.stopPropagation(); }} onClick={handleComposeUndo} className="px-2.5 py-1.5 text-[11px] rounded-lg border border-gray-200 text-gray-700 hover:bg-gray-50">Undo</button>
                    <button type="button" onMouseDown={(e) => { e.preventDefault(); e.stopPropagation(); }} onClick={handleComposeDelete} className="px-2.5 py-1.5 text-[11px] rounded-lg border border-rose-200 text-rose-600 hover:bg-rose-50">Delete</button>
                    <button type="button" onMouseDown={(e) => { e.preventDefault(); e.stopPropagation(); }} onClick={() => setLastComposeRun(null)} className="p-1.5 rounded-md text-gray-400 hover:text-gray-700 hover:bg-gray-100" title="Dismiss actions">
                      <X size={12} />
                    </button>
                  </div>
                )}
              </>
            )}

            {!isBlankDocument && (
              <>
                {/* 1. Objective */}
                <div className="mb-10 group relative">
                  <h2 contentEditable suppressContentEditableWarning className="text-xl font-bold text-gray-900 flex items-center gap-3 mb-4 outline-none">
                    <span className="text-2xl">1.</span> Objective
                  </h2>
                  <p contentEditable suppressContentEditableWarning className="text-gray-600 text-base leading-relaxed outline-none">
                    Launch Regaarder Compose to establish it as the most intuitive AI-native productivity workspace for modern teams and individuals.
                  </p>
                </div>

                {/* 2. Key Initiatives Table */}
                <div className="mb-10 group relative">
                  <h2 contentEditable suppressContentEditableWarning className="text-xl font-bold text-gray-900 flex items-center gap-3 mb-4 outline-none">
                    <span className="text-2xl">2.</span> Key Initiatives
                    <span className="text-[10px] font-normal text-gray-400 bg-gray-50 px-2 py-0.5 rounded-full border border-gray-100">Click Status to Cycle</span>
                  </h2>
                  
                  <div className="border border-gray-100 rounded-lg overflow-hidden mt-6 bg-[#FAFAFC]/30">
                    <table className="w-full text-left text-sm">
                      <thead className="bg-[#FAFAFC] text-gray-500 font-medium border-b border-gray-100">
                        <tr>
                          <th className="py-3 px-4 w-[40%] font-medium">Initiative</th>
                          <th className="py-3 px-4 font-medium">Owner</th>
                          <th className="py-3 px-4 font-medium">Timeline</th>
                          <th className="py-3 px-4 font-medium">Status</th>
                        </tr>
                      </thead>
                      <tbody className="divide-y divide-gray-50 text-gray-700">
                        {initiatives.map((row) => (
                          <tr key={row.id} className="hover:bg-white/60 transition-colors">
                            <td contentEditable suppressContentEditableWarning className="py-3 px-4 font-medium outline-none">{row.name}</td>
                            <td contentEditable suppressContentEditableWarning className="py-3 px-4 text-gray-500 outline-none">{row.owner}</td>
                            <td contentEditable suppressContentEditableWarning className="py-3 px-4 text-gray-500 text-xs outline-none">{row.timeline}</td>
                            <td className="py-3 px-4">
                              <button 
                                onClick={() => toggleStatus(row.id)}
                                className={`text-xs px-2.5 py-1 rounded-full font-medium transition-all ${
                                  row.status === 'Completed' ? 'bg-emerald-50 text-emerald-600 border border-emerald-100' :
                                  row.status === 'In Progress' ? 'bg-blue-50 text-blue-600 border border-blue-100' :
                                  'bg-violet-50 text-violet-600 border border-violet-100'
                                }`}
                              >
                                {row.status}
                              </button>
                            </td>
                          </tr>
                        ))}
                      </tbody>
                    </table>
                  </div>
                </div>

                {/* 3. Target Audience */}
                <div className="mb-10">
                  <h2 contentEditable suppressContentEditableWarning className="text-xl font-bold text-gray-900 flex items-center gap-3 mb-4 outline-none">
                    <span className="text-2xl">3.</span> Target Audience
                  </h2>
                  <p contentEditable suppressContentEditableWarning className="text-gray-600 text-base leading-relaxed outline-none">
                    Knowledge workers, founders, creators, marketers, and teams who want a smarter, calmer, and more connected workspace.
                  </p>
                </div>
              </>
            )}

            {/* Dynamic AI Appended Sections */}
            {!isBlankDocument && appendedSections.map((sec, idx) => (
              <div 
                key={idx} 
                className="mb-10 border-t border-dashed border-violet-100 pt-8 animate-fade-in group relative"
              >
                <div className="absolute -top-3 left-4 bg-violet-600 text-[10px] text-white px-2 py-0.5 rounded-full flex items-center gap-1 shadow-sm">
                  <Sparkles size={8} /> AI Composed
                </div>
                
                <h2 className="text-xl font-bold text-gray-900 flex items-center gap-3 mb-4">
                  {sec.title}
                </h2>

                {sec.type === 'timeline' && (
                  <div className="space-y-3 mt-4">
                    {sec.content.map((item, i) => (
                      <div key={i} className="flex gap-4 p-3 bg-violet-50/20 border border-violet-100/50 rounded-lg">
                        <div className="text-xs font-semibold text-violet-600 bg-white px-2 py-1 rounded h-fit shadow-xs">
                          {item.dates}
                        </div>
                        <div>
                          <div className="text-sm font-semibold text-gray-800">{item.phase}</div>
                          <div className="text-xs text-gray-500 mt-0.5">{item.detail}</div>
                        </div>
                      </div>
                    ))}
                  </div>
                )}

                {sec.type === 'tasks' && (
                  <div className="bg-[#FAFAFC] p-4 rounded-lg border border-gray-100 space-y-2.5">
                    {sec.content.map((taskStr, i) => (
                      <div key={i} className="flex items-center gap-2.5 text-sm text-gray-600">
                        <div className="w-4 h-4 rounded-full border border-violet-400 flex items-center justify-center bg-white text-white">
                          <Check size={10} className="stroke-[3]" />
                        </div>
                        <span>{taskStr}</span>
                      </div>
                    ))}
                  </div>
                )}

                {sec.type === 'risks' && (
                  <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                    {sec.content.map((riskObj, i) => (
                      <div key={i} className="p-4 rounded-xl border border-rose-100 bg-rose-50/10 flex flex-col gap-2">
                        <div className="flex items-center justify-between">
                          <span className="text-xs font-bold text-rose-600 flex items-center gap-1 uppercase tracking-wide">
                            <ShieldAlert size={12} /> Risk Factor
                          </span>
                          <span className="bg-rose-50 text-rose-700 text-[10px] font-bold px-2 py-0.5 rounded">
                            Impact: {riskObj.impact}
                          </span>
                        </div>
                        <h4 className="text-sm font-semibold text-gray-800">{riskObj.threat}</h4>
                        <p className="text-xs text-gray-500 bg-white p-2 rounded border border-gray-100 mt-1">
                          <span className="font-semibold text-gray-700">Mitigation:</span> {riskObj.fix}
                        </p>
                      </div>
                    ))}
                  </div>
                )}

                {sec.type === 'text' && (
                  <p className="text-gray-600 text-base leading-relaxed bg-violet-50/10 p-4 rounded-lg border border-violet-100/30">
                    {sec.paragraph}
                  </p>
                )}
              </div>
            ))}

            {showPageNumbers && showPageNumberOnFirstPage && (
              <div className={`absolute bottom-10 ${pageNumberPositionClass} text-[11px] font-medium text-gray-400`}>
                1
              </div>
            )}

            {/* Composing / Analyzing State Glow */}
            {isComposing && (
              <div className="absolute inset-0 z-30 bg-white/85 backdrop-blur-[2px] flex items-center justify-center px-6">
                <div className="w-full max-w-xl rounded-2xl border border-violet-100 bg-white shadow-[0_20px_50px_-20px_rgba(109,40,217,0.35)] p-5">
                  <div className="flex items-center gap-2 text-violet-700 mb-3">
                    <Loader2 className="animate-spin" size={16} />
                    <span className="text-xs font-semibold tracking-wide">Provisioning your composition</span>
                  </div>
                  <div className="space-y-2">
                    <div className="h-3 rounded bg-violet-100/70 animate-pulse w-4/5"></div>
                    <div className="h-3 rounded bg-violet-100/70 animate-pulse w-full"></div>
                    <div className="h-3 rounded bg-violet-100/70 animate-pulse w-3/4"></div>
                    <div className="h-3 rounded bg-violet-100/70 animate-pulse w-5/6"></div>
                  </div>
                  <p className="mt-3 text-[11px] text-gray-500">Structuring headings, sections, and action-ready blocks.</p>
                </div>
              </div>
            )}

          </div>
          </div>
        </div>

        {/* Persistent Floating AI Prompt Bar */}
        {/* Center blur overlay: only while prompt is open and only across workspace center */}
        {shouldShowPromptBackdrop && activeRightTab !== 'calendar' && (
          <div
            aria-hidden
            style={{
              left: `${blurLeftInset}px`,
              right: `${blurRightInset}px`,
            }}
            className="pointer-events-none fixed top-0 bottom-0 z-[300] hidden md:block"
          >
            <div
              style={{ width: '100%', height: '100%' }}
              className="backdrop-blur-[6px] bg-white/10 w-full h-full"
            />
          </div>
        )}
        {activeRightTab !== 'calendar' && (
        <div
          className={`pointer-events-none absolute inset-x-0 bottom-14 z-[320] transition-all duration-500 ease-out ${(!isPromptAutoVisible || isPromptDismissed || isPromptMinimized || isComposing || (isVoiceActive && voiceTarget === 'document')) ? 'opacity-0 translate-y-6' : 'opacity-100 translate-y-0'}`}
          style={{ transform: `translateY(${promptOffset.y}px)` }}
        >
          <div className={`max-w-[1600px] mx-auto px-6 md:px-10 flex ${alignMode === 'left' ? 'justify-start' : alignMode === 'right' ? 'justify-end' : 'justify-center'}`} style={{ transform: `translateX(${promptOffset.x}px)` }}>
            <form
              ref={promptRootRef}
              onSubmit={handleFloatingSend}
              onDragOver={(event) => {
                event.preventDefault();
              }}
              onDrop={(event) => {
                event.preventDefault();
                attachFilesToPrompt(event.dataTransfer?.files);
              }}
              className={`relative transition-all duration-500 ${isVoiceActive && voiceTarget === 'document' ? 'pointer-events-none' : 'pointer-events-auto'}`}
              style={{ width: isPromptExpanded ? `min(1360px, calc(100vw - ${(rightSidebarOpen ? rightSidebarWidth + 140 : 360)}px))` : `${Math.max(320, Math.min(promptWidth, 980))}px`, maxWidth: '100%' }}
            >
              <input
                ref={promptAudioInputRef}
                type="file"
                accept="audio/*"
                className="hidden"
                onChange={handlePromptAudioUpload}
              />
              <input
                ref={promptFileInputRef}
                type="file"
                multiple
                className="hidden"
                onChange={(event) => {
                  attachFilesToPrompt(event.target.files);
                  event.target.value = '';
                }}
              />

              {isPromptExpanded ? (
                <div className="rounded-[34px] border border-[#ebe7f8] bg-white/95 shadow-[0_30px_80px_-34px_rgba(91,33,182,0.45)] px-6 py-6 md:px-7 md:py-7">
                  <div className="text-center px-2">
                    <Sparkles size={18} className="mx-auto text-violet-500" />
                    <h3 className="mt-3 text-[38px] leading-[1.06] font-semibold text-slate-900">What would you like to create?</h3>
                    <p className="mt-2 text-[14px] text-slate-500">Drop files, notes, recordings, or describe your goal.</p>
                  </div>

                  <div className="mt-5 grid grid-cols-1 md:grid-cols-3 gap-3" style={{ gridTemplateColumns: 'repeat(3, minmax(0, 1fr))' }}>
                    {EXAMPLE_SETS[rotatingExampleSetIndex].map(({ text: exampleText, Icon }) => (
                      <button
                        key={exampleText}
                        type="button"
                        onClick={() => setFloatingPrompt(exampleText)}
                        className="flex items-center gap-3 text-left rounded-2xl border border-[#e8e6f1] px-4 py-3 text-[13px] text-slate-600 hover:border-violet-200 hover:bg-violet-50/40 transition-all"
                      >
                        <Icon size={20} className="flex-shrink-0 text-violet-500" />
                        <span className="leading-[1.1]">{exampleText}</span>
                      </button>
                    ))}
                  </div>

                  <div className="my-4 border-t border-[#efedf7]" />

                  <div className="mt-4 flex items-center justify-between px-1">
                    <button
                      type="button"
                      onClick={() => setRotatingExampleSetIndex((prevIndex) => (prevIndex - 1 + EXAMPLE_SETS.length) % EXAMPLE_SETS.length)}
                      className="inline-flex items-center gap-1 rounded-full border border-[#e8e6f1] bg-white px-2.5 py-1 text-[11px] font-medium text-slate-500 hover:border-violet-200 hover:text-violet-700"
                      title="Previous suggestions"
                    >
                      <MoveLeft size={12} />
                      More
                    </button>
                    <button
                      type="button"
                      onClick={() => setRotatingExampleSetIndex((prevIndex) => (prevIndex + 1) % EXAMPLE_SETS.length)}
                      className="inline-flex items-center gap-1 rounded-full border border-[#e8e6f1] bg-white px-2.5 py-1 text-[11px] font-medium text-slate-500 hover:border-violet-200 hover:text-violet-700"
                      title="Next suggestions"
                    >
                      More
                      <MoveRight size={12} />
                    </button>
                  </div>

                  <div className="flex flex-wrap items-center gap-2">
                    {promptAttachments.map((attachment) => (
                      <button
                        key={attachment.id}
                        type="button"
                        onClick={() => setPreviewAttachment(attachment)}
                        className="max-w-[220px] inline-flex items-center gap-2 rounded-xl border border-[#e8e6f1] bg-[#faf9fd] px-3 py-2 text-left hover:border-violet-200"
                        title="Preview attachment"
                      >
                        <span className="text-[9px] font-semibold uppercase tracking-wide text-violet-600">{getPromptAttachmentBadge(attachment)}</span>
                        <span className="truncate text-[12px] text-slate-600">{attachment.name}</span>
                        <span
                          onClick={(event) => {
                            event.stopPropagation();
                            removePromptAttachment(attachment.id);
                          }}
                          className="text-gray-400 hover:text-gray-700"
                          title="Remove"
                        >
                          <X size={12} />
                        </span>
                      </button>
                    ))}
                    <button
                      type="button"
                      onClick={() => promptFileInputRef.current?.click()}
                      className="inline-flex items-center gap-2 rounded-xl border border-dashed border-[#d8d5e8] bg-white px-3 py-2 text-[12px] text-slate-500 hover:border-violet-300 hover:text-violet-700"
                    >
                      <Plus size={14} />
                      Add more
                    </button>
                  </div>

                  <div className="mt-4 flex items-center gap-2 rounded-2xl border border-[#e9e6f5] bg-white px-3 py-2.5 shadow-[inset_0_1px_0_rgba(255,255,255,0.85)]">
                    <textarea
                      ref={floatingPromptRef}
                      value={floatingPrompt}
                      onChange={(e) => setFloatingPrompt(e.target.value)}
                      onPaste={handleFloatingPaste}
                      onInput={(e) => autoResizeTextarea(e.currentTarget, 180)}
                      onKeyDown={(e) => {
                        if (e.key === 'Enter' && !e.shiftKey) {
                          e.preventDefault();
                          handleFloatingSend(e);
                        }
                      }}
                      placeholder="Or type your goal here..."
                      rows={1}
                      className="flex-1 bg-transparent border-none focus:outline-none text-sm text-slate-700 placeholder:text-slate-400 resize-none overflow-hidden min-h-[36px]"
                    />
                    <div className="relative" ref={promptMenuRef}>
                      <button
                        type="button"
                        onClick={() => {
                          closeTransientMenus();
                          setIsPromptMenuOpen((prev) => !prev);
                        }}
                        className={`relative p-2.5 rounded-full transition-colors ${isPromptMenuOpen ? 'bg-violet-50 text-violet-600' : 'text-gray-400 hover:text-gray-600 hover:bg-gray-100'}`}
                        title="Attach files or audio"
                      >
                        <Paperclip size={16} />
                      </button>
                      {isPromptMenuOpen && (
                        <div className="absolute right-0 bottom-[54px] bg-white isolate border border-gray-200 rounded-xl shadow-2xl ring-1 ring-black/5 p-1 w-[210px] z-[9999]">
                          <button
                            type="button"
                            onClick={() => {
                              promptAudioInputRef.current?.click();
                              setIsPromptMenuOpen(false);
                            }}
                            className="w-full flex items-center gap-2 px-3 py-2 text-sm text-gray-700 hover:bg-gray-100 rounded transition-colors"
                          >
                            <Upload size={14} />
                            <span>Audio</span>
                          </button>
                          <button
                            type="button"
                            onClick={() => {
                              promptFileInputRef.current?.click();
                              setIsPromptMenuOpen(false);
                            }}
                            className="w-full flex items-center gap-2 px-3 py-2 text-sm text-gray-700 hover:bg-gray-100 rounded transition-colors"
                          >
                            <File size={14} />
                            <span>Files</span>
                          </button>
                          <button
                            type="button"
                            onClick={() => {
                              promptFileInputRef.current?.click();
                              setIsPromptMenuOpen(false);
                            }}
                            className="w-full flex items-center gap-2 px-3 py-2 text-sm text-gray-700 hover:bg-gray-100 rounded transition-colors"
                          >
                            <FileText size={14} />
                            <span>Images</span>
                          </button>
                        </div>
                      )}
                    </div>
                    <button
                      type="button"
                      onClick={async () => {
                        await toggleVoiceRecording('compose');
                      }}
                      className={`relative p-2.5 rounded-full transition-all ${isVoiceActive && voiceTarget === 'compose' ? 'text-violet-600 bg-violet-50 shadow-[0_0_0_2px_rgba(139,92,246,0.22),0_0_18px_rgba(139,92,246,0.55)]' : 'text-gray-400 hover:text-gray-600 hover:bg-gray-100'}`}
                      title={isVoiceActive && voiceTarget === 'compose' ? 'Stop live transcription' : 'Start live transcription'}
                    >
                      <Mic size={16} className={isVoiceActive && voiceTarget === 'compose' ? 'animate-pulse' : ''} />
                      {isVoiceActive && voiceTarget === 'compose' && (
                        <>
                          <span className="absolute inset-0 rounded-full border border-violet-400/70 animate-ping"></span>
                          <span className="absolute -inset-1 rounded-full border border-violet-300/60 animate-pulse"></span>
                        </>
                      )}
                    </button>
                    <button
                      type="submit"
                      disabled={isComposing}
                      className={`text-white rounded-full transition-colors flex items-center justify-center h-11 w-11 active:scale-90 ${isComposing ? 'bg-violet-300 cursor-not-allowed' : 'bg-violet-600 hover:bg-violet-700'}`}
                    >
                      {isComposing ? <Loader2 size={18} className="animate-spin" /> : <ArrowUp size={18} />}
                    </button>
                  </div>

                </div>
              ) : (
                <div className="relative bg-white border border-gray-100 shadow-[0_10px_40px_-10px_rgba(0,0,0,0.08)] rounded-2xl px-3 py-2 flex items-end gap-2">
                  <button
                    type="button"
                    onPointerDown={(event) => beginPanelResize('prompt', event)}
                    className="p-2 rounded-lg bg-violet-50/70 text-violet-400 hover:bg-violet-100 hover:text-violet-600 cursor-move touch-none shrink-0"
                    title="Move prompt bar"
                  >
                    <Move size={14} />
                  </button>
                  <textarea
                    value={floatingPrompt}
                    onChange={(e) => setFloatingPrompt(e.target.value)}
                    onInput={(e) => autoResizeTextarea(e.currentTarget, 120)}
                    placeholder="Ask Compose AI..."
                    rows={1}
                    style={{ textAlign: alignMode }}
                    className="flex-1 bg-transparent border-none focus:outline-none text-sm text-gray-700 placeholder-gray-300 py-2 resize-none overflow-hidden min-h-[38px]"
                  />
                  <button
                    type="button"
                    onClick={() => {
                      setIsPromptDismissed(false);
                      setIsPromptExpanded(true);
                      setIsPromptMinimized(false);
                    }}
                    className="p-2 rounded-full transition-colors text-gray-400 hover:text-gray-600 hover:bg-gray-100"
                    title="Open intent capture"
                  >
                    <Expand size={16} />
                  </button>
                </div>
              )}
            </form>
          </div>
        </div>
        )}

        {!isComposing && !shouldHideDictationOverlay && activeRightTab !== 'calendar' && (
          <div 
            className="pointer-events-none fixed z-[300] flex items-center justify-center"
            style={{
              left: `${dictationAnchor.left}px`,
              top: `${dictationAnchor.top}px`,
              transform: `translate(calc(-50% + ${dictationOffset.x}px), calc(-50% + ${dictationOffset.y}px))`
            }}
          >
            <div className="pointer-events-auto flex flex-col items-center gap-3 rounded-3xl bg-white/70 backdrop-blur-sm px-4 py-3 shadow-[0_12px_40px_-20px_rgba(91,33,182,0.35)] border border-white/70">
              <button
                type="button"
                onPointerDown={(event) => {
                  event.preventDefault();
                  event.stopPropagation();
                  beginPanelResize('dictation', event);
                }}
                className="inline-flex items-center gap-2 text-[11px] text-gray-500 bg-white/95 border border-gray-200 rounded-full px-3 py-1 cursor-move touch-none hover:border-violet-300 hover:text-violet-700"
                title="Drag dictation"
              >
                <Move size={12} />
                Drag dictation
              </button>
              <button
                type="button"
                onClick={async () => {
                  await toggleVoiceRecording('document');
                }}
                className={`relative w-24 h-24 rounded-full border transition-all cursor-move touch-none ${isVoiceActive && voiceTarget === 'document' ? 'border-violet-400 bg-violet-50 shadow-[0_0_0_6px_rgba(139,92,246,0.18),0_0_35px_rgba(139,92,246,0.55)]' : 'border-gray-200 bg-white/95 hover:border-violet-300 hover:bg-violet-50/70'}`}
                title={isVoiceActive && voiceTarget === 'document' ? 'Stop document voice transcription' : 'Start document voice transcription'}
              >
                <Mic size={34} className={`mx-auto ${isVoiceActive && voiceTarget === 'document' ? 'text-violet-600 animate-pulse' : 'text-gray-500'}`} />
                {isVoiceActive && voiceTarget === 'document' && (
                  <>
                    <span className="absolute inset-0 rounded-full border-2 border-violet-300 animate-ping"></span>
                    <span className="absolute -inset-2 rounded-full border border-violet-200/80 animate-pulse"></span>
                  </>
                )}
              </button>
              <div className="text-[11px] text-gray-500 bg-white/95 border border-gray-200 rounded-full px-3 py-1">
                {isVoiceActive && voiceTarget === 'document' ? (liveSpeechInterimText || 'Listening... start speaking') : 'Voice dictation'}
              </div>
              {isVoiceActive && voiceTarget === 'document' && (
                <button
                  type="button"
                  onClick={() => {
                    try {
                      speechRecognitionRef.current?.stop();
                    } catch (_error) {
                      // noop
                    }
                    setIsVoiceActive(false);
                    setLiveSpeechInterimText('');
                  }}
                  onPointerDown={(event) => {
                    event.preventDefault();
                    event.stopPropagation();
                    try {
                      speechRecognitionRef.current?.stop();
                    } catch (_error) {
                      // noop
                    }
                    setIsVoiceActive(false);
                    setLiveSpeechInterimText('');
                  }}
                  className="text-[11px] text-violet-700 bg-white/95 border border-violet-200 rounded-full px-3 py-1 hover:bg-violet-50"
                >
                  Dismiss
                </button>
              )}
            </div>
          </div>
        )}

        {isPromptMinimized && activeRightTab !== 'calendar' && !isScheduleSessionModalOpen && (
          <div
            className="pointer-events-none absolute left-6 top-20 z-[340]"
            style={{ transform: `translate(${miniPromptOffset.x}px, ${miniPromptOffset.y}px)` }}
          >
            <div className="pointer-events-auto flex items-center gap-2 group">
              <button
                type="button"
                onClick={() => {
                  setIsPromptDismissed(false);
                  setIsPromptExpanded(true);
                  setIsPromptMinimized(false);
                  setIsPromptAutoVisible(true);
                }}
                className="h-12 w-12 rounded-full bg-violet-600 text-white shadow-[0_12px_30px_-10px_rgba(124,58,237,0.7)] hover:bg-violet-700 transition-all"
                title="Open AI prompt"
              >
                <PenTool size={18} className="mx-auto" />
              </button>
              <button
                type="button"
                onPointerDown={(event) => {
                  event.preventDefault();
                  event.stopPropagation();
                  beginPanelResize('miniPrompt', event);
                }}
                className="opacity-0 group-hover:opacity-100 transition-opacity p-2 rounded-full border border-violet-200 bg-white text-violet-600 cursor-move touch-none"
                title="Drag prompt button"
              >
                <Move size={12} />
              </button>
            </div>
          </div>
        )}

        {/* Bottom Status Bar */}
        <div className="h-10 border-t border-gray-100 flex items-center justify-between px-6 text-xs text-gray-500 bg-white shrink-0 select-none">
          <div className="flex items-center gap-6">
            <span title="Real-time document stats">{documentStats.words} words - {documentStats.characters} characters</span>
            <div className="relative">
              <button
                data-language-menu-root
                onClick={() => {
                  closeTransientMenus();
                  setLanguageMenuOpen((prev) => !prev);
                }}
                className="flex items-center gap-1 cursor-pointer hover:text-gray-800 px-2 py-1 rounded hover:bg-gray-50"
              >
                {getDisplayLanguageLabel()} <ChevronDown size={12} />
              </button>
              {languageMenuOpen && (
                <div className="absolute left-0 bottom-full mb-1 z-40 w-40 bg-white border border-gray-200 rounded-lg shadow-lg p-1" data-language-menu-root>
                  {['Auto detect', 'English (US)', 'English (UK)', 'Spanish', 'French', 'German', 'Chinese'].map((lang) => (
                    <button
                      key={lang}
                      onClick={() => {
                        setCurrentLanguage(lang);
                        setLanguageMenuOpen(false);
                        showToast(`Language set to ${lang}`);
                      }}
                      className={`w-full text-left px-2 py-1.5 text-xs rounded transition-colors ${currentLanguage === lang ? 'bg-violet-50 text-violet-700' : 'hover:bg-gray-50'}`}
                    >
                      {lang}
                    </button>
                  ))}
                </div>
              )}
            </div>
            <button
              onClick={() => setIsFocusMode((prev) => !prev)}
              className={`px-2 py-1 rounded transition-colors ${isFocusMode ? 'bg-violet-100 text-violet-700' : 'hover:bg-gray-50 hover:text-gray-700'}`}
              title="Toggle focus mode"
            >
              {isFocusMode ? 'Exit Focus Mode' : 'Focus Mode'}
            </button>
          </div>
          <div className="flex items-center gap-4">
            <div className="flex items-center gap-3 text-gray-400">
              <button onClick={() => { setActiveDocView('document'); showToast('Document view active'); }} className={`p-1 rounded ${activeDocView === 'document' ? 'text-violet-600 bg-violet-50' : 'hover:text-gray-600'}`} title="Document view"><FileText size={14} /></button>
              <button onClick={() => setTextStyleMenuOpen((prev) => !prev)} className="p-1 rounded hover:text-gray-600" title="Text style options"><Type size={14} /></button>
              <button onClick={() => { setRightSidebarOpen((prev) => !prev); }} className="p-1 rounded hover:text-gray-600" title="Toggle right panel"><LayoutGrid size={14} /></button>
              <button onClick={() => showToast('Quality review complete: no critical formatting issues')} className="p-1 rounded hover:text-gray-600" title="Run quick quality check"><AlertTriangle size={14} /></button>
            </div>
            <div className="relative flex items-center gap-2">
              <button onClick={() => setZoomLevel(Math.max(50, zoomLevel - 10))} className="text-gray-400 hover:text-gray-600 px-1.5 py-1 hover:bg-gray-50 rounded" title="Zoom out">-</button>
              <span className="w-8 text-center cursor-default">{zoomLevel}%</span>
              <button onClick={() => setZoomLevel(Math.min(200, zoomLevel + 10))} className="text-gray-400 hover:text-gray-600 px-1.5 py-1 hover:bg-gray-50 rounded" title="Zoom in">+</button>
              <ChevronDown size={12} className="cursor-pointer text-gray-400" />
            </div>
          </div>
        </div>
      </div>

      {!shareModalOpen && rightSidebarOpen && (
        <div
          onMouseDown={(event) => beginPanelResize('right', event)}
          className="w-1 shrink-0 cursor-col-resize bg-transparent hover:bg-violet-100 active:bg-violet-200 transition-colors opacity-0 hover:opacity-100"
          aria-label="Resize right sidebar"
        />
      )}

      {/* 3. Right Sidebar (AI Assistant / Smart Chat / Tools) */}
      <div 
        className={`border-l border-gray-100 flex flex-col bg-white shrink-0 transition-[width] duration-300 relative z-[260] ${
          rightSidebarOpen && !shareModalOpen ? '' : 'w-0 overflow-hidden border-l-0'
        }`}
        style={ rightSidebarOpen && !shareModalOpen ? ( rightPanelMaximized ? { width: '100vw', position: 'fixed', top: 0, right: 0, height: '100vh', zIndex: 1200 } : { width: `${rightSidebarWidth}px` } ) : { width: '0px' } }
      >
        {/* Sidebar Header Tabs */}
        {activeRightTab !== 'calendar' && activeRightTab !== 'room' && (
        <div className="flex border-b border-gray-100 text-xs font-semibold select-none bg-[#FAFAFC]">
          <div
            className="flex-1 min-w-0 overflow-x-auto no-scrollbar"
            tabIndex={0}
            onKeyDown={handleRightSidebarTabsKeyDown}
            aria-label="Right panel tabs"
          >
            <div className="inline-flex min-w-max">
              {[
                { key: 'chat', label: 'AI Chat' },
                { key: 'assistant', label: 'AI Assistant' },
                { key: 'tasks', label: `Tasks (${tasks.filter((t) => !t.completed).length})` },
                { key: 'calendar', label: 'Schedule' },
                { key: 'room', label: 'Room' },
                { key: 'memory', label: 'Memory' },
              ].map((tab) => (
                <button
                  key={tab.key}
                  className={`shrink-0 px-3 py-4 transition-all border-b-2 ${activeRightTab === tab.key ? 'text-violet-600 border-violet-600 bg-white' : 'text-gray-500 border-transparent hover:text-gray-700 hover:bg-gray-50'}`}
                  onClick={() => setActiveRightTab(tab.key)}
                >
                  {tab.label}
                </button>
              ))}
            </div>
          </div>
          <div className="w-14 shrink-0 flex items-center justify-center border-l border-gray-100 gap-2 px-2">
            <button
              type="button"
              title={rightPanelMaximized ? 'Restore panel' : 'Expand panel'}
              onClick={() => { setRightPanelMaximized((p) => !p); if (!rightSidebarOpen) setRightSidebarOpen(true); }}
              className="p-1.5 rounded-md text-gray-400 hover:bg-violet-50 hover:text-gray-700 transition-colors"
            >
              {rightPanelMaximized ? <Minimize2 size={14} /> : <Maximize2 size={14} />}
            </button>
            <X 
              size={14} 
              className="text-gray-400 cursor-pointer hover:text-gray-600" 
              onClick={() => { setRightSidebarOpen(false); setRightPanelMaximized(false); }}
            />
          </div>
        </div>
        )}

        {/* Dynamic Sidebar Content */}
        <div className="flex-1 flex flex-col min-h-0 bg-white">
          
          {/* A. ACTIVE TAB: AI CHAT */}
          {activeRightTab === 'chat' && (
            <div className="flex-1 flex flex-col min-h-0">
              {/* Context Indicator */}
              <div className="px-4 py-2 bg-violet-50/40 border-b border-violet-100/30 flex items-center gap-2 text-xs text-violet-700">
                <FileText size={12} />
                <span className="font-medium truncate" title={docTitle}>Context Linked: {docTitleDisplay}</span>
              </div>

              {/* Chat Stream */}
              <div className="flex-1 overflow-y-auto p-4 space-y-4">
                {chatMessages.map((msg) => (
                  <div 
                    key={msg.id} 
                    className={`group flex flex-col max-w-[85%] ${msg.sender === 'user' ? 'ml-auto items-end' : 'mr-auto items-start'}`}
                  >
                    {/* Speaker Header */}
                    <span className="text-[10px] text-gray-400 mb-1 px-1">
                      {msg.sender === 'user' ? 'Alex R.' : 'Compose AI'}
                    </span>

                    {/* Chat Bubble / Cards */}
                    <div className={`p-3 rounded-2xl text-sm leading-relaxed ${
                      msg.sender === 'user' 
                        ? 'bg-violet-600 text-white rounded-tr-xs shadow-sm' 
                        : 'bg-[#FAFAFC] text-gray-700 border border-gray-100 rounded-tl-xs shadow-xs'
                    }`}>
                      {msg.text}

                      {/* Render suggestions block inline */}
                      {msg.type === 'suggestions' && (
                        <div className="mt-3 flex flex-col gap-1.5">
                          {msg.suggestions.map((sug, sIdx) => (
                            <button
                              key={sIdx}
                              onClick={() => handleAISubmit(sug.label)}
                              className="w-full text-left bg-white hover:bg-violet-50 text-xs font-medium text-gray-700 hover:text-violet-700 p-2.5 rounded-lg border border-gray-200/60 hover:border-violet-200 transition-all flex items-center justify-between group/sug"
                            >
                              <span>{sug.label}</span>
                              <ArrowRight size={12} className="text-gray-400 group-hover/sug:translate-x-1 transition-transform" />
                            </button>
                          ))}
                        </div>
                      )}

                      {/* Action confirmation pill */}
                      {msg.type === 'action_completed' && (
                        <div className="mt-2.5 flex items-center gap-1 text-[11px] font-semibold text-emerald-600 bg-emerald-50 px-2 py-1 rounded border border-emerald-100">
                          <Check size={12} />
                          <span>Successfully injected into document</span>
                        </div>
                      )}
                    </div>

                    <div className="mt-1.5 flex items-center gap-1.5 opacity-0 group-hover:opacity-100 transition-opacity">
                      <button
                        type="button"
                        onClick={() => retryMessageAction(msg)}
                        className="p-1 rounded-md text-gray-400 hover:text-violet-600 hover:bg-violet-50"
                        title="Retry"
                      >
                        <RefreshCcw size={12} />
                      </button>
                      <button
                        type="button"
                        onClick={() => undoMessageAction(msg)}
                        className="p-1 rounded-md text-gray-400 hover:text-violet-600 hover:bg-violet-50"
                        title="Undo AI action"
                      >
                        <Undo2 size={12} />
                      </button>
                      <button
                        type="button"
                        onClick={() => deleteMessageAction(msg)}
                        className="p-1 rounded-md text-gray-400 hover:text-rose-600 hover:bg-rose-50"
                        title="Delete message"
                      >
                        <Trash2 size={12} />
                      </button>
                      <button
                        type="button"
                        onClick={() => recordChatFeedback(msg, 'thumbs_up')}
                        className="p-1 rounded-md text-gray-400 hover:text-emerald-600 hover:bg-emerald-50"
                        title="Helpful"
                      >
                        <ThumbsUp size={12} />
                      </button>
                      <button
                        type="button"
                        onClick={() => recordChatFeedback(msg, 'thumbs_down')}
                        className="p-1 rounded-md text-gray-400 hover:text-amber-600 hover:bg-amber-50"
                        title="Needs improvement"
                      >
                        <ThumbsDown size={12} />
                      </button>
                      <button
                        type="button"
                        onClick={() => {
                          setChatFeedbackDrafts((prev) => ({
                            ...prev,
                            [msg.id]: {
                              ...(prev[msg.id] || { text: '' }),
                              open: !(prev[msg.id]?.open),
                            },
                          }));
                        }}
                        className="p-1 rounded-md text-gray-400 hover:text-sky-600 hover:bg-sky-50"
                        title="Add feedback comment"
                      >
                        <MessageSquarePlus size={12} />
                      </button>
                    </div>

                    {chatFeedbackDrafts[msg.id]?.open && (
                      <div className="mt-1.5 w-full">
                        <div className="relative flex items-center bg-white border border-gray-200 rounded-full px-2 py-1 hover:border-violet-200 focus-within:border-violet-400 transition-colors">
                          <input
                            type="text"
                            value={chatFeedbackDrafts[msg.id]?.text || ''}
                            onChange={(event) => {
                              const value = event.target.value;
                              setChatFeedbackDrafts((prev) => ({
                                ...prev,
                                [msg.id]: {
                                  ...(prev[msg.id] || { open: true }),
                                  open: true,
                                  text: value,
                                },
                              }));
                            }}
                            placeholder="Tell AI how to improve this response..."
                            className="w-full min-w-0 bg-transparent border-none focus:outline-none text-[11px] text-gray-700 py-1 pl-1 pr-14"
                          />
                          <button
                            type="button"
                            onClick={() => {
                              const comment = chatFeedbackDrafts[msg.id]?.text?.trim() || '';
                              if (!comment) {
                                return;
                              }
                              recordChatFeedback(msg, 'comment', comment);
                              setChatFeedbackDrafts((prev) => ({
                                ...prev,
                                [msg.id]: { open: false, text: '' },
                              }));
                              showToast('Feedback saved to memory');
                            }}
                            className="absolute right-1 top-1/2 -translate-y-1/2 px-2.5 py-1 rounded-full text-[11px] bg-violet-600 text-white hover:bg-violet-700"
                          >
                            Save
                          </button>
                        </div>
                      </div>
                    )}
                  </div>
                ))}
                
                {/* Loader animation when AI is processing */}
                {isComposing && (
                  <div className="flex items-center gap-2 text-xs text-gray-400 p-2 animate-pulse">
                    <Loader2 className="animate-spin text-violet-500" size={14} />
                    <span>{productMode === 'deck' ? 'Deck AI is designing your slides...' : 'Compose AI is writing...'}</span>
                  </div>
                )}
                <div ref={chatEndRef} />
              </div>

              {/* Chat Input Bar */}
              <form onSubmit={handleSidebarSend} className="p-3 border-t border-gray-100 bg-[#FAFAFC]">
                {chatAttachments.length > 0 && (
                  <div className="mb-2 flex flex-wrap gap-1.5">
                    {chatAttachments.map((attachment) => (
                      <span key={attachment.id} className="text-[10px] px-2 py-0.5 rounded-full border border-gray-200 bg-white text-gray-600">
                        {attachment.name}
                      </span>
                    ))}
                  </div>
                )}
                <div className="relative flex items-end bg-white border border-gray-200 rounded-xl focus-within:border-violet-400 transition-colors">
                  <input
                    ref={chatFileInputRef}
                    type="file"
                    multiple
                    className="hidden"
                    onChange={async (event) => {
                      await ingestChatAttachments(event.target.files);
                      event.target.value = '';
                    }}
                  />
                  <textarea
                    ref={chatInputRef}
                    value={chatInput}
                    onChange={(e) => setChatInput(e.target.value)}
                    onInput={(e) => autoResizeTextarea(e.currentTarget, 120)}
                    onPaste={handleChatPaste}
                    onKeyDown={(e) => {
                      if (e.key === 'Enter' && !e.shiftKey) {
                        e.preventDefault();
                        handleSidebarSend(e);
                      }
                    }}
                    placeholder="Ask, summarize, or instruct..."
                    rows={1}
                    className="w-full bg-transparent border-none focus:outline-none text-sm py-2.5 pl-10 pr-10 text-gray-700 placeholder-gray-400 resize-none"
                  />
                  <button
                    type="button"
                    onClick={() => chatFileInputRef.current?.click()}
                    className="absolute left-1.5 bottom-1.5 p-1.5 rounded-lg bg-gray-50 hover:bg-gray-100 text-gray-500 transition-colors"
                    title="Attach files"
                  >
                    <Upload size={14} />
                  </button>
                  <button 
                    type="submit" 
                    className="absolute right-1.5 bottom-1.5 p-1.5 rounded-lg bg-violet-50 hover:bg-violet-100 text-violet-600 transition-colors"
                  >
                    <Send size={14} />
                  </button>
                </div>
              </form>
            </div>
          )}

          {/* B. ACTIVE TAB: AI ASSISTANT CO-WRITER */}
          {activeRightTab === 'assistant' && (
            <div className="flex-1 overflow-y-auto p-5 space-y-6">
              <div>
                <h3 className="text-sm font-bold text-gray-900 mb-2">Smart Assist Options</h3>
                <p className="text-xs text-gray-500">{smartAssistIntro}</p>
              </div>

              {/* Action Buttons Grid */}
              <div className="space-y-2">
                {smartAssistOptions.map((option) => {
                  const Icon = option.icon;
                  return (
                    <div key={option.key} className="space-y-1">
                      <button
                        onClick={() => {
                          if (option.key === 'create-outline') {
                            setOutlineLevelMenuOpen((prev) => !prev);
                            return;
                          }
                          runSmartAssistAction(option.prompt, { actionKey: option.key });
                        }}
                        className={`w-full flex items-center gap-3 px-4 py-3 border rounded-lg text-sm text-gray-700 hover:border-violet-200 hover:bg-violet-50 transition-colors text-left ${selectedEditorText ? 'assist-option-snake border-transparent' : 'border-gray-100'}`}
                      >
                        <Icon size={16} className={option.color} />
                        <div>
                          <div className="font-semibold text-xs">{option.label}</div>
                          <p className="text-[10px] text-gray-400">{option.detail}</p>
                        </div>
                      </button>
                      {option.key === 'create-outline' && outlineLevelMenuOpen && (
                        <div className="ml-7 rounded-lg border border-violet-100 bg-violet-50/40 p-2">
                          <div className="text-[10px] font-semibold text-violet-700 mb-1">Choose depth</div>
                          <div className="flex items-center gap-1.5">
                            {[2, 3, 4].map((level) => (
                              <button
                                key={level}
                                type="button"
                                onClick={() => {
                                  setOutlineLevels(level);
                                  setOutlineLevelMenuOpen(false);
                                  runSmartAssistAction(option.prompt, { actionKey: option.key, outlineLevels: level });
                                }}
                                className={`px-2 py-1 rounded text-[10px] border ${outlineLevels === level ? 'bg-violet-600 text-white border-violet-600' : 'bg-white text-gray-600 border-gray-200 hover:border-violet-300'}`}
                              >
                                {level} levels
                              </button>
                            ))}
                          </div>
                        </div>
                      )}
                    </div>
                  );
                })}
              </div>

              <div>
                <h4 className="text-[11px] font-bold text-gray-400 uppercase tracking-wider mb-2">AI Prompt Box</h4>
                <form onSubmit={handleAssistantQuickPromptSend} className="rounded-xl p-3 border border-violet-100/70 bg-gradient-to-br from-violet-50/60 via-white to-white space-y-2 shadow-[0_10px_25px_-20px_rgba(109,40,217,0.55)]">
                  <textarea
                    value={assistantQuickPrompt}
                    onChange={(e) => setAssistantQuickPrompt(e.target.value)}
                    placeholder="Ask AI Assistant from here..."
                    rows={2}
                    className="w-full bg-white/95 border border-violet-100 rounded-lg px-2.5 py-2 text-xs text-gray-700 outline-none focus:border-violet-400 resize-y min-h-[64px]"
                  />
                  <div className="flex items-center justify-end">
                    <button
                      type="submit"
                      disabled={isComposing || !assistantQuickPrompt.trim()}
                      className={`px-3 py-1.5 rounded-lg text-xs font-semibold transition-all ${isComposing || !assistantQuickPrompt.trim() ? 'bg-violet-200 text-white cursor-not-allowed' : 'bg-violet-600 text-white hover:bg-violet-700 shadow-[0_8px_16px_-10px_rgba(124,58,237,0.7)]'}`}
                    >
                      Send to AI
                    </button>
                  </div>
                </form>
              </div>
            </div>
          )}

          {/* C. ACTIVE TAB: TASKS WORKLIST */}
          {activeRightTab === 'tasks' && (
            <div className="flex-1 overflow-y-auto p-5 flex flex-col">
              <div className="flex items-center justify-between mb-4">
                <h3 className="text-sm font-bold text-gray-900">Workspace Checklist</h3>
                <button 
                  onClick={addTaskFromInput}
                  className="text-xs font-medium text-violet-600 hover:text-violet-700 flex items-center gap-1"
                >
                  <Plus size={14} /> Add Task
                </button>
              </div>

              <div className="mb-3 rounded-xl border border-gray-100 bg-[#FAFAFC] p-2.5">
                <div className="flex items-center gap-2 mb-2">
                  <button
                    type="button"
                    onClick={() => {
                      setNewTaskOwner('user');
                      setTaskOwnerFilter('user');
                    }}
                    className={`px-2 py-1 rounded-full text-[10px] border ${taskOwnerFilter === 'user' ? 'bg-violet-50 border-violet-200 text-violet-700' : 'bg-white border-gray-200 text-gray-500'}`}
                  >
                    User Task
                  </button>
                  <button
                    type="button"
                    onClick={() => {
                      setNewTaskOwner('agent');
                      setTaskOwnerFilter('agent');
                    }}
                    className={`px-2 py-1 rounded-full text-[10px] border ${taskOwnerFilter === 'agent' ? 'bg-sky-50 border-sky-200 text-sky-700' : 'bg-white border-gray-200 text-gray-500'}`}
                  >
                    Agent Task
                  </button>
                  <button
                    type="button"
                    onClick={() => setTaskOwnerFilter('all')}
                    className={`px-2 py-1 rounded-full text-[10px] border ${taskOwnerFilter === 'all' ? 'bg-gray-100 border-gray-300 text-gray-700' : 'bg-white border-gray-200 text-gray-500'}`}
                  >
                    All
                  </button>
                </div>
                <div className="flex items-center gap-2">
                  <input
                    type="text"
                    value={newTaskInput}
                    onChange={(e) => setNewTaskInput(e.target.value)}
                    onKeyDown={(e) => {
                      if (e.key === 'Enter') {
                        e.preventDefault();
                        addTaskFromInput();
                      }
                    }}
                    placeholder="Add a new action item..."
                    className="flex-1 bg-white border border-gray-200 rounded-lg px-3 py-2 text-xs text-gray-700 focus:outline-none focus:border-violet-400"
                  />
                  <button
                    onClick={addTaskFromInput}
                    className="px-3 py-2 rounded-lg text-xs font-medium bg-violet-600 text-white hover:bg-violet-700"
                  >
                    Save
                  </button>
                </div>
              </div>

              <div className="space-y-2">
                {visibleTasks.map(task => (
                  <div 
                    key={task.id} 
                    onClick={() => {
                      setTasks(prev => prev.map(t => t.id === task.id ? { ...t, completed: !t.completed } : t));
                      showToast(task.completed ? "Task uncompleted" : "Task marked completed");
                    }}
                    className={`flex items-start gap-3 p-3 rounded-lg border cursor-pointer transition-all ${
                      task.completed 
                        ? 'bg-gray-50/50 border-gray-100 text-gray-400 line-through' 
                        : 'bg-white border-gray-100 text-gray-700 hover:border-violet-100 hover:bg-violet-50/20'
                    }`}
                  >
                    <div className={`mt-0.5 w-4.5 h-4.5 rounded border flex items-center justify-center transition-all ${
                      task.completed ? 'bg-violet-600 border-violet-600 text-white' : 'border-gray-300 bg-white'
                    }`}>
                      {task.completed && <Check size={12} className="stroke-[3]" />}
                    </div>
                    <div className="flex-1 min-w-0">
                      <div className="flex items-start justify-between gap-2">
                        <div className="min-w-0 flex-1">
                          <span className={`inline-flex items-center px-1.5 py-0.5 rounded-full text-[9px] font-semibold border mb-1 ${task.owner === 'agent' ? 'bg-sky-50 text-sky-700 border-sky-200' : 'bg-violet-50 text-violet-700 border-violet-200'}`}>
                            {task.owner === 'agent' ? 'Agent' : 'User'}
                          </span>
                          {editingTaskId === task.id ? (
                            <input
                              autoFocus
                              value={editingTaskText}
                              onChange={(event) => setEditingTaskText(event.target.value)}
                              onClick={(event) => event.stopPropagation()}
                              onBlur={() => commitTaskEdit(task.id)}
                              onKeyDown={(event) => {
                                if (event.key === 'Enter') {
                                  event.preventDefault();
                                  commitTaskEdit(task.id);
                                }
                                if (event.key === 'Escape') {
                                  setEditingTaskId(null);
                                  setEditingTaskText('');
                                }
                              }}
                              className="w-full bg-white border border-violet-200 rounded px-2 py-1 text-xs text-gray-700 focus:outline-none"
                            />
                          ) : (
                            <span
                              onDoubleClick={(event) => {
                                event.stopPropagation();
                                beginTaskEdit(task);
                              }}
                              className="text-xs font-medium leading-relaxed block"
                            >
                              {task.text}
                            </span>
                          )}
                        </div>
                        <button
                          type="button"
                          onClick={(event) => {
                            event.stopPropagation();
                            removeTask(task.id);
                          }}
                          className="p-1 rounded-md text-gray-400 hover:text-rose-600 hover:bg-rose-50"
                          title="Delete task"
                        >
                          <Trash2 size={12} />
                        </button>
                      </div>
                      <button
                        type="button"
                        onClick={(event) => {
                          event.stopPropagation();
                          convertTaskToSchedule(task);
                        }}
                        className="mt-2 text-[11px] text-violet-600 hover:text-violet-700 font-medium"
                      >
                        Convert to Schedule
                      </button>
                    </div>
                  </div>
                ))}
                {visibleTasks.length === 0 && (
                  <div className="rounded-lg border border-dashed border-gray-200 p-3 text-[11px] text-gray-500 bg-white">
                    No tasks in this view yet.
                  </div>
                )}
              </div>
            </div>
          )}

          {/* D. ACTIVE TAB: INTEGRATED CALENDAR & TIMELINE SCHEDULE */}
          {activeRightTab === 'calendar' && (
            <div className="flex-1 min-h-0 flex flex-col relative">
              <div className="flex-1 overflow-y-auto thin-scrollbar px-4 pt-1 pb-3 bg-[linear-gradient(180deg,#f6f7fb_0%,#f4f5f9_100%)]">
                <div className="rounded-2xl border border-[#e8eaf2] bg-[#f5f6fa] p-3 space-y-3">
                  <div className="rounded-2xl border border-[#ececf5] bg-white px-3.5 py-3 shadow-[0_14px_32px_-28px_rgba(15,23,42,0.35)]">
                    <div className="flex items-center justify-between text-[12px]">
                      <div className="text-slate-800 font-medium inline-flex items-center gap-1.5">
                        <Calendar size={12} className="text-violet-500" />
                        Today <span className="text-violet-600 font-semibold">- {selectedCalendarDate.toLocaleDateString(undefined, { month: 'short', day: 'numeric', year: 'numeric' })}</span>
                      </div>
                      <div className="inline-flex items-center gap-1.5">
                        <button
                          type="button"
                          onClick={() => {
                            closeTransientMenus();
                            setIsScheduleCalendarExpanded(true);
                          }}
                          className="text-slate-400 hover:text-slate-600"
                          title="Toggle calendar"
                        >
                          <ChevronDown size={14} />
                        </button>
                      </div>
                    </div>

                    <div className="mt-3 border-t border-[#ececf5] pt-2.5">
                      <div className="flex items-center justify-between">
                        <div className="text-[11px] font-medium text-slate-600">Upcoming</div>
                        <button
                          type="button"
                          onClick={() => {
                            closeTransientMenus();
                            setIsScheduleCalendarExpanded(true);
                          }}
                          className="text-[10px] font-medium text-violet-600 hover:text-violet-700"
                        >
                          See full calendar
                        </button>
                      </div>
                      <div className="relative mt-2 space-y-0">
                        <div className="absolute left-[6px] top-[12px] bottom-[16px] w-px bg-[#d1d5db]" />
                        {scheduleAgendaItems.slice(0, 2).map((event, index) => (
                          <div key={`timeline-${event.id}`} className={`relative grid grid-cols-[62px_1fr] gap-3 ${index > 0 ? 'border-t border-[#ececf5]' : ''}`}>
                            <div className="relative pl-3 text-[11.5px] leading-4 text-slate-700 pt-[8px] pb-[8px]">
                              <span className="absolute left-[0px] top-[13px] h-1.5 w-1.5 rounded-full bg-violet-500 ring-2 ring-white" />
                              <div className="whitespace-nowrap">{event.slot || '10:00 AM'}</div>
                              <div className="text-[10px] text-slate-400">{Math.max(15, Number(event.durationMinutes || 60))}m</div>
                            </div>
                            <div className="relative rounded-lg px-2 py-[8px]">
                              <div className="text-[12.5px] font-medium text-slate-800 leading-snug">{event.title}</div>
                              <span className="mt-0.5 inline-flex rounded-full border border-violet-100 bg-violet-50 px-1.5 py-[1px] text-[10px] text-violet-500">{event.category || 'General'}</span>
                            </div>
                          </div>
                        ))}
                      </div>
                    </div>
                    <div className="mt-3 rounded-2xl border border-[#e9e0ff] bg-[#f6f1ff] px-3.5 py-3">
                      <div className="text-[12px] font-medium text-slate-800 inline-flex items-center gap-1.5">
                        <Sparkles size={12} className="text-violet-500" /> AI Schedule Insight
                      </div>
                      <div className="mt-2 text-[12px] text-slate-700 leading-relaxed">{scheduleAiInsights[0] || 'Schedule balance looks healthy. Keep one flexible slot open for AI-assisted revisions.'}</div>
                      <button
                        type="button"
                        onClick={() => {
                          setRightSidebarOpen(true);
                          setActiveRightTab('assistant');
                          setAssistantQuickPrompt('Optimize my next three schedule blocks for focus and momentum.');
                        }}
                        className="mt-3 w-full rounded-lg border border-violet-200 bg-violet-100 px-3 py-1.5 text-[12px] font-medium text-violet-700 hover:bg-violet-200/70"
                      >
                        Optimize Schedule
                      </button>
                    </div>

                    <div className="mt-3 rounded-2xl border border-[#ede7ff] bg-[#faf7ff] px-3.5 py-3">
                      <div className="text-[12px] font-medium text-slate-700 mb-2">Quick Add</div>
                      <div className="flex items-center gap-2">
                        <div className="relative" ref={quickAddSourceMenuRef}>
                          <button
                            type="button"
                            onClick={() => setIsQuickAddSourceMenuOpen((prev) => !prev)}
                            className="inline-flex h-9 items-center gap-1.5 rounded-lg border border-violet-200 bg-white px-2.5 text-[11px] font-medium text-violet-700 hover:border-violet-300 hover:bg-violet-50"
                            title="Add context source"
                          >
                            <Plus size={12} />
                            <ChevronDown size={12} />
                          </button>
                          {isQuickAddSourceMenuOpen && (
                            <div className="absolute left-0 top-full z-20 mt-1.5 w-40 rounded-lg border border-[#e5e7f1] bg-white p-1 shadow-[0_12px_28px_-18px_rgba(15,23,42,0.45)]">
                              {QUICK_ADD_SOURCE_OPTIONS.map((source) => (
                                <button
                                  key={source.id}
                                  type="button"
                                  onClick={() => handleQuickAddSourceAction(source.id)}
                                  className="w-full rounded-md px-2.5 py-1.5 text-left text-[11px] text-slate-700 hover:bg-violet-50"
                                >
                                  {source.label}
                                </button>
                              ))}
                            </div>
                          )}
                        </div>

                        <input
                          value={scheduleInput}
                          onChange={(event) => setScheduleInput(event.target.value)}
                          onPaste={handleSchedulePaste}
                          onKeyDown={(event) => {
                            if (event.key === 'Enter') {
                              event.preventDefault();
                              convertMessyScheduleToPlan();
                            }
                          }}
                          placeholder="What do you want to schedule?"
                          className="h-9 flex-1 rounded-lg border border-slate-200 bg-[#fcfcff] px-3 text-[12px] text-slate-700 placeholder:text-[10px] placeholder:text-slate-400 focus:outline-none focus:border-violet-300"
                        />

                        <button
                          type="button"
                          onClick={convertMessyScheduleToPlan}
                          className="h-9 rounded-lg bg-violet-600 px-3.5 text-[11px] font-semibold text-white hover:bg-violet-700"
                        >
                          Add
                        </button>
                      </div>
                      <input
                        ref={scheduleFileInputRef}
                        type="file"
                        className="hidden"
                        onChange={async (event) => {
                          await ingestScheduleAttachments(event.target.files);
                          event.target.value = '';
                          showToast('Attachment added to schedule input');
                        }}
                      />
                    </div>

                    <div className="mt-3 rounded-2xl border border-[#e9ebf2] bg-[#f8f9fc] px-3.5 py-3">
                      <div className="text-[12px] font-medium text-slate-700 mb-2 inline-flex items-center gap-1.5"><Link size={11} className="text-slate-500" />Related to this document</div>
                      <div className="flex items-start justify-between gap-2">
                        <div className="min-w-0">
                          <div className="flex items-center gap-1.5 text-[12px] font-medium text-slate-800">
                            <span className="inline-flex h-4.5 w-4.5 items-center justify-center rounded bg-amber-100 text-amber-600">
                              <Calendar size={10} />
                            </span>
                            <span className="truncate">Product Hunt Launch Plan</span>
                          </div>
                          <div className="mt-1 text-[11px] text-slate-500">Milestone - Due {selectedCalendarDate.toLocaleDateString(undefined, { month: 'short', day: 'numeric' })}</div>
                        </div>
                        <span className="shrink-0 rounded-full border border-emerald-200 bg-emerald-50 px-2 py-0.5 text-[10px] font-medium text-emerald-700">On Track</span>
                      </div>
                    </div>
                  </div>

                {isScheduleCalendarExpanded && (
                  <div className="absolute inset-0 z-20 bg-[#f4f5fa] p-3" ref={calendarMenuRef}>
                    <div className="h-full rounded-2xl border border-[#dfe3ef] bg-white p-3 shadow-[0_18px_36px_-24px_rgba(15,23,42,0.35)] overflow-y-auto thin-scrollbar">
                    <div className="flex items-center justify-between">
                      <div>
                        <div className="text-[20px] font-semibold text-slate-900 leading-none">Launch Timeline</div>
                        <div className="text-[11px] text-slate-500 mt-1">Intelligent schedule optimized around your work</div>
                      </div>
                      <button
                        type="button"
                        onClick={() => setIsScheduleCalendarExpanded(false)}
                        className="rounded-md p-1 text-slate-400 hover:text-slate-600 hover:bg-slate-100"
                        aria-label="Close full calendar"
                      >
                        <X size={14} />
                      </button>
                    </div>

                    <div className="mt-3 rounded-xl border border-violet-100 bg-violet-50/70 px-2.5 py-2 flex items-center justify-between gap-2">
                      <div className="min-w-0">
                        <div className="text-[11px] font-medium text-violet-700">AI Planning Insight</div>
                        <div className="text-[10px] text-violet-600 truncate">You have two focus blocks back-to-back today.</div>
                      </div>
                      <button className="shrink-0 rounded-md border border-violet-200 bg-white px-2 py-1 text-[10px] font-medium text-violet-700">Optimize Day</button>
                    </div>

                    <div className="mt-3 rounded-xl border border-[#ececf5] bg-white px-2.5 py-2">
                      <div className="flex items-center justify-between text-[11px] font-semibold text-slate-600 mb-2">
                        <button
                          type="button"
                          onClick={() => {
                            if (calendarYear === 2026 && calendarMonth === 0) return;
                            if (calendarMonth === 0) {
                              setCalendarView(11, calendarYear - 1);
                            } else {
                              setCalendarView(calendarMonth - 1, calendarYear);
                            }
                          }}
                          className="rounded p-1 hover:bg-slate-100"
                          disabled={calendarYear === 2026 && calendarMonth === 0}
                        >
                          <ChevronLeft size={13} />
                        </button>
                        <span>{monthNames[calendarMonth]} {calendarYear}</span>
                        <button
                          type="button"
                          onClick={() => {
                            if (calendarMonth === 11) {
                              setCalendarView(0, calendarYear + 1);
                            } else {
                              setCalendarView(calendarMonth + 1, calendarYear);
                            }
                          }}
                          className="rounded p-1 hover:bg-slate-100"
                          disabled={calendarYear === 2029 && calendarMonth === 11}
                        >
                          <ChevronRight size={13} />
                        </button>
                      </div>
                      <div className="grid grid-cols-7 gap-1 text-center text-[10px] text-slate-400 mb-1">
                        <span>S</span><span>M</span><span>T</span><span>W</span><span>T</span><span>F</span><span>S</span>
                      </div>
                      <div className="grid grid-cols-7 gap-1 text-center text-[11px] font-medium text-slate-700">
                        {generateCalendarDays(calendarMonth, calendarYear).map((dayObj, idx) => (
                          <button
                            key={idx}
                            type="button"
                            onClick={() => {
                              if (!dayObj.isCurrentMonth) return;
                              setSelectedCalendarDate(new Date(calendarYear, calendarMonth, dayObj.day));
                            }}
                            className={`py-1.5 rounded ${dayObj.isCurrentMonth ? ((selectedCalendarDate && selectedCalendarDate.getFullYear() === calendarYear && selectedCalendarDate.getMonth() === calendarMonth && selectedCalendarDate.getDate() === dayObj.day) ? 'bg-violet-600 text-white' : dayObj.isToday ? 'bg-violet-100 text-violet-700' : 'hover:bg-slate-100') : 'text-slate-300'}`}
                            disabled={!dayObj.isCurrentMonth}
                          >
                            {dayObj.day}
                          </button>
                        ))}
                      </div>
                    </div>

                    <div className="mt-3">
                      <div className="flex items-center justify-between mb-2">
                        <span className="text-[11px] font-medium text-slate-700">{selectedCalendarDate.toLocaleDateString(undefined, { weekday: 'long', month: 'short', day: 'numeric' })}</span>
                        <button
                          type="button"
                          onClick={() => setIsScheduleCalendarExpanded(false)}
                          className="rounded-md border border-violet-200 bg-violet-50 px-2 py-1 text-[10px] font-medium text-violet-700 hover:bg-violet-100"
                        >
                          View Day
                        </button>
                      </div>
                      <div className="space-y-2">
                        {scheduleAgendaItems.slice(0, 2).map((event) => (
                          <div key={`expanded-${event.id}`} className="rounded-xl border border-[#ececf5] bg-[#fbfbff] px-2.5 py-2">
                            <div className="grid grid-cols-[56px_1fr] gap-2">
                              <div>
                                <div className="text-[10px] font-medium text-slate-700">{event.slot || '10:00 AM'}</div>
                                <div className="text-[10px] text-slate-400">{Math.max(15, Number(event.durationMinutes || 60))}m</div>
                              </div>
                              <div>
                                <div className="text-[11.5px] font-medium text-slate-800 leading-snug">{event.title}</div>
                                <span className="mt-1 inline-flex rounded-full border border-violet-100 bg-violet-50 px-1.5 py-[1px] text-[9px] text-violet-500">{event.category || 'General'}</span>
                              </div>
                            </div>
                          </div>
                        ))}
                      </div>
                    </div>
                    </div>
                  </div>
                )}

                </div>
              </div>
            </div>
          )}

          {isScheduleSessionModalOpen && (
            <div
              className="fixed inset-0 z-[1350] bg-black/70 flex items-center justify-center p-4"
              onClick={closeScheduleSessionModal}
            >
              <div
                className="w-[min(90vw,1100px)] h-[min(90vh,860px)] rounded-xl border border-[#ececf7] bg-white shadow-[0_24px_80px_-32px_rgba(15,23,42,0.45)] overflow-hidden flex flex-col"
                onClick={(event) => event.stopPropagation()}
              >
                <div className="h-16 px-5 border-b border-[#ececf5] bg-white flex items-center justify-between">
                  <div>
                    <div className="text-[24px] font-semibold text-slate-900 leading-tight">Schedule a session</div>
                    <div className="text-[11px] text-slate-500 mt-1">Plan ahead and invite others to collaborate.</div>
                  </div>
                  <div className="flex items-center">
                    <button
                      type="button"
                      onClick={handleScheduleSessionSave}
                      className="h-10 px-5 rounded-xl bg-violet-600 text-white text-sm font-semibold hover:bg-violet-700"
                    >
                      Save
                    </button>
                  </div>
                </div>
                <div className="flex-1 grid grid-cols-[2fr_1fr] gap-0 overflow-hidden">
                  <div className="p-5 overflow-hidden">
                    <div className="h-full overflow-y-auto thin-scrollbar rounded-lg border border-[#ececf5] bg-white p-4 flex flex-col">
                      <div className="grid grid-cols-[1fr_1fr_auto_1fr_auto] gap-2 text-[12px]">
                        <input
                          type="date"
                          value={scheduleForm.startDate}
                          onChange={(event) => setScheduleForm((prev) => ({ ...prev, startDate: event.target.value }))}
                          className="h-9 rounded-lg border border-violet-100 bg-violet-50/30 text-slate-700 px-2 focus:outline-none focus:border-violet-300"
                        />
                        <input
                          type="time"
                          value={scheduleForm.startTime}
                          onChange={(event) => setScheduleForm((prev) => ({ ...prev, startTime: event.target.value }))}
                          className="h-9 rounded-lg border border-violet-100 bg-violet-50/30 text-slate-700 px-2 focus:outline-none focus:border-violet-300"
                        />
                        <span className="self-center text-slate-500 text-center">to</span>
                        <input
                          type="time"
                          value={scheduleForm.endTime}
                          onChange={(event) => setScheduleForm((prev) => ({ ...prev, endTime: event.target.value }))}
                          className="h-9 rounded-lg border border-violet-100 bg-violet-50/30 text-slate-700 px-2 focus:outline-none focus:border-violet-300"
                        />
                        <div className="h-9 rounded-lg border border-violet-100 bg-violet-50/30 text-slate-700 inline-flex items-center justify-center gap-1 px-2">
                          <Clock size={12} />
                          <span>{scheduleForm.timezone}</span>
                        </div>
                      </div>

                      <div className="mt-3">
                        <label className="text-[11px] font-semibold text-slate-600">Title</label>
                        <div className="mt-1 h-10 rounded-lg border border-[#e8eaf2] bg-white px-3 flex items-center justify-between">
                          <input
                            value={scheduleForm.title}
                            onChange={(event) => setScheduleForm((prev) => ({ ...prev, title: event.target.value.slice(0, 200) }))}
                            className="w-full bg-transparent text-[14px] text-slate-800 focus:outline-none"
                          />
                          <span className="text-[11px] text-slate-400">{scheduleForm.title.length}/200</span>
                        </div>
                      </div>

                      <div className="mt-3">
                        <label className="text-[11px] font-semibold text-slate-600">Room link</label>
                        <div className="mt-1 h-10 rounded-lg border border-[#e8eaf2] bg-[#f8f9fd] px-3 flex items-center justify-between">
                          <input
                            value={scheduleForm.roomLink}
                            onChange={(event) => setScheduleForm((prev) => ({ ...prev, roomLink: event.target.value }))}
                            className="w-full bg-transparent text-[12px] text-slate-600 focus:outline-none"
                          />
                          <div className="flex items-center gap-2 text-slate-400">
                            <button
                              type="button"
                              onClick={() => {
                                if (scheduleForm.roomLink) {
                                  navigator.clipboard?.writeText(scheduleForm.roomLink);
                                  showToast('Room link copied');
                                }
                              }}
                            >
                              <File size={14} />
                            </button>
                            <button type="button" onClick={() => showToast('Room link settings opened')}>
                              <Settings size={14} />
                            </button>
                          </div>
                        </div>
                      </div>

                      <div className="mt-3">
                        <label className="text-[11px] font-semibold text-slate-600">Description (optional)</label>
                        <div className="mt-1 rounded-lg border border-[#e8eaf2] bg-white min-h-[150px] flex flex-col">
                          <textarea
                            ref={scheduleInputRef}
                            value={scheduleInput}
                            onChange={(e) => setScheduleInput(e.target.value)}
                            onPaste={handleSchedulePaste}
                            placeholder="Strategic review of distribution moat, go-to-market plan, and launch milestones."
                            className="w-full min-h-[110px] resize-y rounded-t-lg px-3 py-2 text-[12px] leading-5 text-slate-700 focus:outline-none"
                          />
                          <div className="h-9 border-t border-[#ececf5] px-3 flex items-center gap-3 text-slate-500">
                            <Bold size={13} />
                            <Italic size={13} />
                            <Underline size={13} />
                            <List size={13} />
                            <Link size={13} />
                          </div>
                        </div>
                      </div>

                      <div className="mt-3 grid grid-cols-2 gap-3">
                        <div className="space-y-2">
                          <select
                            value={scheduleForm.notification}
                            onChange={(event) => setScheduleForm((prev) => ({ ...prev, notification: event.target.value }))}
                            className="brand-select h-10 w-full rounded-lg border border-violet-100 bg-violet-50/30 px-3 text-[12px] text-slate-700 focus:outline-none focus:border-violet-300"
                          >
                            {SCHEDULE_NOTIFICATION_OPTIONS.map((option) => (
                              <option key={option} value={option}>{`Notification - ${option}`}</option>
                            ))}
                          </select>
                          <select
                            value={scheduleForm.addToCalendar}
                            onChange={(event) => setScheduleForm((prev) => ({ ...prev, addToCalendar: event.target.value }))}
                            className="brand-select h-10 w-full rounded-lg border border-violet-100 bg-violet-50/30 px-3 text-[12px] text-slate-700 focus:outline-none focus:border-violet-300"
                          >
                            <option value="Joshua's Calendar">Add to calendar - Joshua&apos;s Calendar</option>
                            <option value="Team Calendar">Add to calendar - Team Calendar</option>
                          </select>
                          <div className="relative" ref={scheduleRepeatMenuRef}>
                            <button
                              type="button"
                              onClick={() => setOpenDropdown((prev) => (prev === 'schedule-repeat' ? null : 'schedule-repeat'))}
                              className="h-10 w-full rounded-lg border border-violet-100 bg-violet-50/30 px-3 text-[12px] text-slate-700 focus:outline-none focus:border-violet-300 inline-flex items-center justify-between"
                            >
                              <span>{`Repeat - ${scheduleForm.repeat}`}</span>
                              <ChevronDown size={12} className="text-slate-500" />
                            </button>
                            {openDropdown === 'schedule-repeat' && (
                              <div className="absolute left-0 right-0 top-full z-10 mt-1 rounded-lg border border-[#e6e8f1] bg-white p-1 shadow-[0_12px_28px_-20px_rgba(15,23,42,0.45)]">
                                {SCHEDULE_REPEAT_OPTIONS.map((option) => (
                                  <button
                                    key={option}
                                    type="button"
                                    onClick={() => {
                                      setScheduleForm((prev) => ({ ...prev, repeat: option }));
                                      setOpenDropdown(null);
                                    }}
                                    className={`w-full rounded-md px-2.5 py-1.5 text-left text-[11px] ${scheduleForm.repeat === option ? 'bg-violet-50 text-violet-700' : 'text-slate-700 hover:bg-slate-50'}`}
                                  >
                                    {`Repeat - ${option}`}
                                  </button>
                                ))}
                              </div>
                            )}
                          </div>
                        </div>
                        <div className="space-y-2">
                          <select
                            value={scheduleForm.whoCanJoin}
                            onChange={(event) => setScheduleForm((prev) => ({ ...prev, whoCanJoin: event.target.value }))}
                            className="brand-select h-10 w-full rounded-lg border border-violet-100 bg-violet-50/30 px-3 text-[12px] text-slate-700 focus:outline-none focus:border-violet-300"
                          >
                            {SCHEDULE_JOIN_OPTIONS.map((option) => (
                              <option key={option} value={option}>{`Who can join - ${option}`}</option>
                            ))}
                          </select>
                          <div className="h-10 rounded-lg border border-[#e8eaf2] px-3 flex items-center justify-between text-[12px] text-slate-700">
                            <span>Allow recording</span>
                            <button
                              type="button"
                              onClick={() => setScheduleForm((prev) => ({ ...prev, allowRecording: !prev.allowRecording }))}
                              className={`w-9 h-5 rounded-full relative transition-colors ${scheduleForm.allowRecording ? 'bg-violet-600' : 'bg-slate-300'}`}
                            >
                              <span className={`absolute top-0.5 w-4 h-4 rounded-full bg-white transition-all ${scheduleForm.allowRecording ? 'right-0.5' : 'left-0.5'}`} />
                            </button>
                          </div>
                        </div>
                      </div>
                    </div>
                  </div>
                  <div className="border-l border-[#ececf5] p-5 overflow-hidden">
                    <div className="h-full overflow-y-auto thin-scrollbar flex flex-col gap-3 pr-1">
                      <div className="rounded-lg border border-[#ececf5] bg-white p-3">
                        <div className="flex items-center justify-between mb-2">
                          <div className="text-[14px] font-semibold text-slate-900">Participants</div>
                          <div className="relative" ref={schedulePeopleMenuRef}>
                            <button
                              className="text-[12px] text-violet-600 font-semibold"
                              type="button"
                              onClick={() => setIsSchedulePeopleMenuOpen((prev) => !prev)}
                            >
                              + Add people
                            </button>
                            {isSchedulePeopleMenuOpen && (
                              <div className="absolute right-0 top-full z-10 mt-1 w-52 rounded-lg border border-[#e6e8f1] bg-white p-1 shadow-[0_12px_28px_-20px_rgba(15,23,42,0.45)]">
                                {platformContacts
                                  .filter((person) => !scheduleParticipants.some((participant) => participant.name === person.name))
                                  .map((person) => (
                                    <button
                                      key={`participant-option-${person.id}`}
                                      type="button"
                                      onClick={() => {
                                        setScheduleParticipants((prev) => [
                                          ...prev,
                                          { id: `contact-${person.id}`, name: person.name, img: `https://i.pravatar.cc/80?u=${person.id}` },
                                        ]);
                                        setIsSchedulePeopleMenuOpen(false);
                                      }}
                                      className="w-full rounded-md px-2.5 py-1.5 text-left text-[11px] text-slate-700 hover:bg-violet-50"
                                    >
                                      <div className="font-medium">{person.name}</div>
                                      <div className="text-[10px] text-slate-500">{person.title}</div>
                                    </button>
                                  ))}
                                {platformContacts.filter((person) => !scheduleParticipants.some((participant) => participant.name === person.name)).length === 0 && (
                                  <div className="px-2.5 py-2 text-[11px] text-slate-500">No more contacts to add.</div>
                                )}
                              </div>
                            )}
                          </div>
                        </div>
                        <div className="space-y-2">
                          {scheduleParticipants.map((participant) => (
                            <div key={`modal-participant-${participant.name}`} className="h-10 rounded-lg border border-[#ececf5] px-2.5 flex items-center justify-between">
                              <div className="flex items-center gap-2 min-w-0">
                                <img src={participant.img} alt={participant.name} className="w-6 h-6 rounded-full object-cover" />
                                <span className="text-[12px] text-slate-700 truncate">{participant.name}</span>
                              </div>
                              <button
                                type="button"
                                onClick={() => setScheduleParticipants((prev) => prev.filter((person) => person.id !== participant.id))}
                              >
                                <X size={13} className="text-slate-400" />
                              </button>
                            </div>
                          ))}
                        </div>
                      </div>

                      <div className="rounded-lg border border-[#ececf5] bg-white p-3">
                        <div className="text-[14px] font-semibold text-slate-900 mb-2">Options</div>
                        <div className="space-y-2 text-[12px] text-slate-700">
                          <label className="flex items-start gap-2"><input type="checkbox" checked={scheduleOptionsState.aiNotes} onChange={(event) => setScheduleOptionsState((prev) => ({ ...prev, aiNotes: event.target.checked }))} className="mt-0.5 accent-violet-600" /><span>Enable AI notes &amp; summary</span></label>
                          <label className="flex items-start gap-2"><input type="checkbox" checked={scheduleOptionsState.screenSharing} onChange={(event) => setScheduleOptionsState((prev) => ({ ...prev, screenSharing: event.target.checked }))} className="mt-0.5 accent-violet-600" /><span>Allow screen sharing</span></label>
                          <label className="flex items-start gap-2"><input type="checkbox" checked={scheduleOptionsState.whiteboard} onChange={(event) => setScheduleOptionsState((prev) => ({ ...prev, whiteboard: event.target.checked }))} className="mt-0.5 accent-violet-600" /><span>Allow whiteboard</span></label>
                          <label className="flex items-start gap-2"><input type="checkbox" checked={scheduleOptionsState.waitingRoom} onChange={(event) => setScheduleOptionsState((prev) => ({ ...prev, waitingRoom: event.target.checked }))} className="mt-0.5 accent-violet-600" /><span>Enable waiting room</span></label>
                        </div>
                      </div>

                      <div className="rounded-lg border border-violet-100 bg-violet-50/50 p-3 mt-auto">
                        <div className="text-[14px] font-semibold text-slate-900">AI Assistant <span className="text-[10px] text-violet-600 font-semibold ml-1">BETA</span></div>
                        <div className="text-[12px] text-slate-600 mt-1">I can help prepare for this session.</div>
                        <div className="mt-2 text-[12px] text-violet-700 space-y-1">
                          <div>- Create an agenda</div>
                          <div>- Add discussion topics</div>
                          <div>- Share relevant docs</div>
                        </div>
                        <button
                          type="button"
                          onClick={() => {
                            setRightSidebarOpen(true);
                            setActiveRightTab('assistant');
                            setAssistantQuickPrompt('Generate agenda');
                          }}
                          className="mt-3 h-9 px-3 rounded-lg border border-violet-200 bg-white text-violet-700 text-[12px] font-medium hover:bg-violet-50"
                        >
                          Generate agenda
                        </button>
                      </div>
                    </div>
                  </div>
                </div>
              </div>
            </div>
          )}

          {/* REGAARDER ROOM TAB */}
          {activeRightTab === 'room' && (
            <div className="flex-1 flex flex-col min-h-0 bg-white animate-fade-in min-w-[340px] relative">

              {/* STATE: LOBBY */}
              {roomState === 'lobby' && (
                <div className="flex-1 min-h-0 bg-[#f7f8fd] animate-fade-in flex flex-col relative">
                  <div className="h-12 px-4 border-b border-gray-200 bg-white flex items-center justify-between">
                    <div className="flex items-center gap-2 text-slate-900">
                      <span className="w-5 h-5 rounded-md bg-violet-100 text-violet-600 flex items-center justify-center">
                        <MonitorPlay size={12} />
                      </span>
                      <span className="text-[16px] font-semibold leading-none">Room</span>
                    </div>
                    <div className="flex items-center gap-2">
                      <button
                        type="button"
                        title={rightPanelMaximized ? 'Restore panel' : 'Expand panel'}
                        onClick={() => { setRightPanelMaximized((p) => !p); if (!rightSidebarOpen) setRightSidebarOpen(true); }}
                        className="p-1 rounded-md text-slate-400 hover:text-slate-600 hover:bg-slate-100"
                      >
                        {rightPanelMaximized ? <Minimize2 size={14} /> : <Maximize2 size={14} />}
                      </button>
                      <button
                        type="button"
                        onClick={() => { setRightSidebarOpen(false); setRightPanelMaximized(false); }}
                        className="p-1 rounded-md text-slate-400 hover:text-slate-600 hover:bg-slate-100"
                        aria-label="Close Room panel"
                      >
                        <X size={14} />
                      </button>
                    </div>
                  </div>

                  <div className="flex-1 overflow-y-auto thin-scrollbar px-3 py-3 space-y-3">
                    <div className="rounded-2xl border border-[#eceef7] bg-white px-4 py-5 text-center">
                      <h3 className="text-[12px] font-semibold text-[#1a1f36] tracking-tight">No active sharing</h3>
                      <p className="text-[11px] text-[#6b7280] mt-1.5">Start a call or invite others to collaborate.</p>
                      <div className="mt-4 w-[110px] h-[110px] rounded-full border border-dashed border-violet-200 mx-auto flex items-center justify-center">
                        <div className="w-14 h-14 rounded-2xl bg-violet-50 border border-violet-200 text-violet-500 flex items-center justify-center">
                          <MonitorPlay size={24} />
                        </div>
                      </div>
                      <div className="mt-4 space-y-2 text-left">
                        <div className="grid grid-cols-2 gap-2">
                          <div className="relative">
                            <button
                              type="button"
                              onClick={() => setIsRoomStartMenuOpen((prev) => !prev)}
                              className="w-full rounded-xl border border-violet-200 bg-violet-50 text-violet-700 py-2 px-1 text-[10px] font-semibold inline-flex items-center justify-center gap-1 whitespace-nowrap leading-none hover:bg-violet-100"
                            >
                              <Plus size={13} /> Start room <ChevronDown size={11} />
                            </button>
                            {isRoomStartMenuOpen && (
                              <div className="absolute z-30 left-0 mt-1 w-[220px] rounded-xl border border-gray-200 bg-white shadow-[0_18px_40px_-20px_rgba(15,23,42,0.45)] p-2 text-left">
                                <div className="text-[9px] uppercase tracking-wide text-gray-400 font-semibold px-2 py-1">Quick start</div>
                                <button
                                  type="button"
                                  onClick={() => {
                                    setIsRoomStartMenuOpen(false);
                                    startMeetingNow(generateRoomCode());
                                  }}
                                  className="w-full rounded-lg px-2 py-1.5 hover:bg-violet-50 inline-flex items-start gap-2.5"
                                >
                                  <Sparkles size={12} className="text-violet-500 mt-0.5 shrink-0" />
                                  <div className="min-w-0 text-left">
                                    <div className="text-[10px] font-semibold leading-none text-slate-800">Start instant room</div>
                                    <div className="mt-1 text-[9px] leading-tight text-slate-500">Start collaborating immediately</div>
                                  </div>
                                </button>
                                <button
                                  type="button"
                                  onClick={() => {
                                    setIsRoomStartMenuOpen(false);
                                    setIsScheduleSessionModalOpen(true);
                                  }}
                                  className="w-full rounded-lg px-2 py-1.5 hover:bg-violet-50 inline-flex items-start gap-2.5"
                                >
                                  <Calendar size={12} className="text-slate-500 mt-0.5 shrink-0" />
                                  <div className="min-w-0 text-left">
                                    <div className="text-[10px] font-semibold leading-none text-slate-800">Schedule session</div>
                                    <div className="mt-1 text-[9px] leading-tight text-slate-500">Plan with Google Calendar</div>
                                  </div>
                                </button>
                                <button
                                  type="button"
                                  onClick={() => {
                                    setIsRoomStartMenuOpen(false);
                                    roomJoinInputRef.current?.focus();
                                  }}
                                  className="w-full rounded-lg px-2 py-1.5 hover:bg-violet-50 inline-flex items-start gap-2.5"
                                >
                                  <LinkIcon size={12} className="text-slate-500 mt-0.5 shrink-0" />
                                  <div className="min-w-0 text-left">
                                    <div className="text-[10px] font-semibold leading-none text-slate-800">Join with code or link</div>
                                    <div className="mt-1 text-[9px] leading-tight text-slate-500">Enter a code to join instantly</div>
                                  </div>
                                </button>
                              </div>
                            )}
                          </div>
                          <button
                            onClick={() => {
                              setIsRoomInviteModalOpen(true);
                              setIsRoomStartMenuOpen(false);
                            }}
                            className="rounded-xl border border-gray-200 bg-white text-slate-700 py-2 px-1 text-[10px] font-semibold inline-flex items-center justify-center gap-1 whitespace-nowrap leading-none hover:bg-slate-50"
                          >
                            <UserPlus size={12} /> Invite people
                          </button>
                        </div>

                        <input
                          ref={roomJoinInputRef}
                          type="text"
                          value={joinCode}
                          onChange={(e) => setJoinCode(e.target.value)}
                          onFocus={() => setIsRoomStartMenuOpen(false)}
                          placeholder="Join with code"
                          className="w-full rounded-xl border border-gray-200 bg-white py-2 px-3 text-[10px] text-slate-700 placeholder:text-slate-400 focus:outline-none focus:border-violet-300"
                        />
                        <button
                          onClick={() => {
                            if (joinCode.trim()) {
                              openMeetingSetup(joinCode.trim());
                            } else {
                              showToast('Please enter a room code');
                            }
                          }}
                          className="w-full rounded-xl border border-gray-200 bg-white text-slate-700 py-2 px-1 text-[10px] font-semibold inline-flex items-center justify-center gap-1 whitespace-nowrap leading-none hover:bg-slate-50"
                        >
                          <LinkIcon size={12} /> Join
                        </button>
                      </div>
                    </div>

                    <div className="rounded-2xl border border-[#eceef7] bg-white px-4 py-3 text-left">
                      <div className="flex items-center justify-between mb-2.5">
                        <span className="text-[12px] font-semibold text-[#23283b] tracking-tight">Upcoming</span>
                        <button type="button" className="text-[10px] font-semibold text-violet-600 hover:text-violet-700">View calendar</button>
                      </div>
                      {upcomingEvents.slice(0, 1).map((event) => {
                        const eventDate = event?.dueDate ? new Date(event.dueDate) : null;
                        const hasDate = eventDate && !Number.isNaN(eventDate.getTime());
                        const dateLabel = hasDate
                          ? eventDate.toLocaleDateString(undefined, { month: 'short', day: 'numeric' })
                          : 'Upcoming';
                        return (
                          <button
                            key={`room-upcoming-${event.id}`}
                            onClick={() => openMeetingSetup(normalizeRoomCode(event.title) || generateRoomCode())}
                            className="w-full rounded-xl border border-gray-200 bg-white p-3 hover:border-violet-200 hover:bg-violet-50/20 transition-colors text-left"
                          >
                            <div className="flex items-start gap-2.5">
                              <div className="w-7 h-7 rounded-lg bg-violet-50 text-violet-600 flex items-center justify-center shrink-0">
                                <Calendar size={14} />
                              </div>
                              <div className="min-w-0 flex-1">
                                <div className="text-[12px] font-semibold text-slate-800">{dateLabel}</div>
                                <div className="text-[10px] font-semibold text-slate-900 mt-1 leading-tight">{event.title}</div>
                                <div className="text-[10px] text-slate-500 mt-1">{event.slotLabel || `${scheduleForm.startDate} - ${event.slot || scheduleForm.startTime}`}</div>
                                <div className="mt-2 flex items-center justify-between">
                                  <div className="flex items-center -space-x-1.5">
                                    {meetingParticipants.slice(0, 3).map((participant) => (
                                      <img key={`upcoming-${event.id}-${participant.name}`} src={participant.img} alt={participant.name} className="w-5 h-5 rounded-full border border-white object-cover" />
                                    ))}
                                    <span className="ml-2 text-[10px] font-semibold text-slate-500">+{Math.max(1, (event.participants || []).length)}</span>
                                  </div>
                                  <span className="px-2 py-1 rounded-lg border border-violet-200 text-violet-600 text-[10px] font-semibold">Join</span>
                                </div>
                              </div>
                            </div>
                          </button>
                        );
                      })}
                      {upcomingEvents.length === 0 && (
                        <div className="rounded-xl border border-dashed border-gray-200 bg-white p-3 text-[11px] text-slate-500">
                          No upcoming meetings yet. Use Schedule session to add one.
                        </div>
                      )}
                    </div>

                    <div className="rounded-2xl border border-[#eceef7] bg-white px-4 py-3 text-left">
                      <div className="flex items-center justify-between mb-2.5">
                        <span className="text-[12px] font-semibold text-[#23283b] tracking-tight">Recent rooms</span>
                        <button type="button" className="text-[10px] font-semibold text-violet-600 hover:text-violet-700">See all</button>
                      </div>
                      <div className="space-y-1">
                        <button onClick={() => openMeetingSetup('q2-launch')} className="w-full flex items-center justify-between gap-2 p-2.5 rounded-xl hover:bg-violet-50/30 transition-colors text-left">
                          <div className="flex items-center gap-2.5 min-w-0">
                            <div className="w-6 h-6 rounded-md bg-violet-50 text-violet-600 flex items-center justify-center shrink-0"><Clock size={13} /></div>
                            <div className="min-w-0">
                              <div className="text-[10px] font-semibold text-slate-800 truncate">Q2 Launch Strategy</div>
                              <div className="text-[10px] text-slate-500">Active yesterday</div>
                            </div>
                          </div>
                          <div className="flex items-center -space-x-1.5">
                            {meetingParticipants.slice(0, 3).map((participant) => (
                              <img key={`recent-a-${participant.name}`} src={participant.img} alt={participant.name} className="w-5 h-5 rounded-full border border-white object-cover" />
                            ))}
                            <span className="ml-2 text-[10px] font-semibold text-slate-500">+3</span>
                          </div>
                        </button>
                        <button onClick={() => openMeetingSetup('product-hunt-planning')} className="w-full flex items-center justify-between gap-2 p-2.5 rounded-xl hover:bg-violet-50/30 transition-colors text-left">
                          <div className="flex items-center gap-2.5 min-w-0">
                            <div className="w-6 h-6 rounded-md bg-violet-50 text-violet-600 flex items-center justify-center shrink-0"><Clock size={13} /></div>
                            <div className="min-w-0">
                              <div className="text-[10px] font-semibold text-slate-800 truncate">Product Hunt Planning</div>
                              <div className="text-[10px] text-slate-500">Active May 12</div>
                            </div>
                          </div>
                          <div className="flex items-center -space-x-1.5">
                            {meetingParticipants.slice(1, 3).map((participant) => (
                              <img key={`recent-b-${participant.name}`} src={participant.img} alt={participant.name} className="w-5 h-5 rounded-full border border-white object-cover" />
                            ))}
                            <span className="ml-2 text-[10px] font-semibold text-slate-500">+2</span>
                          </div>
                        </button>
                        <button onClick={() => openMeetingSetup('design-review-room')} className="w-full flex items-center justify-between gap-2 p-2.5 rounded-xl hover:bg-violet-50/30 transition-colors text-left">
                          <div className="flex items-center gap-2.5 min-w-0">
                            <div className="w-6 h-6 rounded-md bg-violet-50 text-violet-600 flex items-center justify-center shrink-0"><Clock size={13} /></div>
                            <div className="min-w-0">
                              <div className="text-[10px] font-semibold text-slate-800 truncate">Design Review Room</div>
                              <div className="text-[10px] text-slate-500">Active May 8</div>
                            </div>
                          </div>
                          <div className="flex items-center -space-x-1.5">
                            {meetingParticipants.slice(0, 3).map((participant) => (
                              <img key={`recent-c-${participant.name}`} src={participant.img} alt={participant.name} className="w-5 h-5 rounded-full border border-white object-cover" />
                            ))}
                            <span className="ml-2 text-[10px] font-semibold text-slate-500">+4</span>
                          </div>
                        </button>
                      </div>
                    </div>

                    <div className="rounded-2xl border border-violet-100 bg-[#f6f2ff] px-4 py-3 text-left flex items-start justify-between gap-3">
                      <div>
                        <div className="flex items-center gap-2">
                          <span className="text-[12px] font-semibold text-[#1f2537]">AI Assistant</span>
                          <span className="px-1.5 py-0.5 rounded-full bg-violet-200 text-violet-700 text-[9px] font-semibold">BETA</span>
                        </div>
                        <p className="text-[10px] text-slate-600 mt-2">I can capture key points, decisions, and action items during your call.</p>
                        <button type="button" className="mt-3 text-[10px] font-semibold text-violet-600 hover:text-violet-700 inline-flex items-center gap-1">
                          View how it works <ArrowRight size={12} />
                        </button>
                      </div>
                      <div className="w-10 h-10 rounded-xl bg-white/70 border border-violet-200 text-violet-500 flex items-center justify-center shrink-0">
                        <Sparkles size={16} />
                      </div>
                    </div>
                  </div>
                </div>
              )}
              {roomState === 'lobby' && isRoomInviteModalOpen && (
                <div className="absolute z-40 top-[182px] left-4 right-4 flex justify-center">
                  <div className="w-full max-w-[280px] rounded-2xl border border-gray-200 bg-white shadow-[0_24px_48px_-24px_rgba(15,23,42,0.5)] p-3">
                    <div className="flex items-center justify-between mb-2">
                      <div className="text-[10px] font-semibold text-slate-900">People in the room</div>
                      <button type="button" className="text-[10px] font-semibold text-violet-600 hover:text-violet-700">View all</button>
                    </div>
                    <div className="space-y-2.5">
                      <div className="flex items-center justify-between">
                        <div className="flex items-center gap-2">
                          <img src={meetingParticipants[0]?.img} alt="You" className="w-6 h-6 rounded-full object-cover border border-white" />
                          <div>
                            <div className="text-[10px] font-semibold text-slate-800">You (Joshua)</div>
                          </div>
                        </div>
                        <Mic size={12} className="text-violet-500" />
                      </div>
                      {meetingParticipants.slice(1).map((participant, index) => (
                        <div key={`invite-${participant.name}`} className="flex items-center justify-between">
                          <div className="flex items-center gap-2">
                            <img src={participant.img} alt={participant.name} className="w-6 h-6 rounded-full object-cover border border-white" />
                            <div>
                              <div className="text-[10px] font-semibold text-slate-800">{participant.name}</div>
                              <div className="text-[9px] text-slate-400">{index === 0 ? '1m ago' : 'Active'}</div>
                            </div>
                          </div>
                        </div>
                      ))}
                    </div>
                    <button
                      type="button"
                      onClick={async () => {
                        await handleShareMeeting();
                        setIsRoomInviteModalOpen(false);
                      }}
                      className="mt-3 w-full rounded-lg border border-violet-200 bg-violet-50 text-violet-700 text-[10px] font-semibold py-2 inline-flex items-center justify-center gap-1.5 hover:bg-violet-100"
                    >
                      <Sparkles size={12} /> Invite from team
                    </button>
                    <button
                      type="button"
                      onClick={() => setIsRoomInviteModalOpen(false)}
                      className="mt-2 w-full rounded-lg border border-gray-200 bg-white text-slate-600 text-[10px] font-semibold py-2 hover:bg-slate-50"
                    >
                      Close
                    </button>
                  </div>
                </div>
              )}

              {roomState === 'ready' && (
                <div className="flex-1 flex flex-col p-4 gap-4 animate-fade-in">
                  <div className="rounded-2xl border border-gray-200 bg-white p-3 flex items-center justify-between gap-3">
                    <div className="min-w-0">
                      <div className="text-[10px] font-semibold uppercase tracking-wide text-violet-600">Ready to join</div>
                      <div className="text-xs text-gray-700 font-mono truncate">{roomId}</div>
                    </div>
                    <button
                      onClick={handleShareMeeting}
                      className="px-2.5 py-1.5 rounded-lg text-xs border border-violet-200 text-violet-700 hover:bg-violet-50"
                    >
                      Share Link
                    </button>
                  </div>

                  {mediaError && (
                    <div className="bg-amber-50 border border-amber-200 rounded-xl p-3 text-xs text-amber-800 flex items-center justify-between gap-3">
                      <span>Camera or microphone access is blocked. Allow permissions to join with media.</span>
                      <button onClick={requestMediaPermissions} className="shrink-0 px-2.5 py-1.5 rounded-lg bg-amber-100 hover:bg-amber-200 text-amber-900 font-semibold">Allow</button>
                    </div>
                  )}

                  <div className="rounded-2xl overflow-hidden border border-gray-200 bg-slate-900 h-[220px] relative">
                    <RoomStageFeed stream={localStream} placeholder="Camera preview" />
                    <div className="absolute bottom-3 left-3 px-2 py-1 rounded-lg bg-black/45 text-white text-[11px]">You</div>
                  </div>

                  <div className="rounded-2xl border border-gray-200 bg-white p-3">
                    <div className="text-[11px] font-semibold uppercase tracking-wide text-gray-500 mb-2">Participants</div>
                    <div className="flex items-center gap-2 overflow-x-auto no-scrollbar">
                      <div className="relative w-14 h-14 rounded-[10px] overflow-hidden border border-violet-200 shadow-sm flex-shrink-0 bg-gray-900">
                        <LocalVideoFeed stream={localStream} isCameraOn={isRoomCameraOn} />
                        {!isRoomMicOn && <div className="absolute bottom-1 right-1 bg-black/60 p-0.5 rounded-full"><MicOff size={8} className="text-red-400" /></div>}
                      </div>
                      {meetingParticipants.map((participant) => (
                        <div key={participant.name} className="relative w-14 h-14 rounded-[10px] overflow-hidden border border-gray-200 shadow-sm flex-shrink-0">
                          <img src={participant.img} alt={participant.name} className="object-cover w-full h-full" />
                        </div>
                      ))}
                    </div>
                  </div>

                  <div className="mt-auto rounded-2xl border border-gray-200 bg-white/90 backdrop-blur-xl px-3 py-2 flex items-center justify-between gap-2">
                    <div className="flex items-center gap-1.5">
                      <button onClick={toggleRoomMic} className={`p-2 rounded-xl transition-all ${isRoomMicOn ? 'bg-white text-gray-700 hover:bg-gray-100 shadow-sm border border-gray-100' : 'bg-red-50 text-red-600 border border-red-100'}`} title="Toggle microphone">
                        {isRoomMicOn ? <Mic size={16} /> : <MicOff size={16} />}
                      </button>
                      <button onClick={toggleRoomCamera} className={`p-2 rounded-xl transition-all ${isRoomCameraOn ? 'bg-white text-gray-700 hover:bg-gray-100 shadow-sm border border-gray-100' : 'bg-red-50 text-red-600 border border-red-100'}`} title="Toggle camera">
                        {isRoomCameraOn ? <Video size={16} /> : <VideoOff size={16} />}
                      </button>
                      <button onClick={toggleScreenShare} className={`p-2 rounded-xl transition-all ${isScreenSharing ? 'bg-emerald-500 text-white' : 'bg-white text-gray-700 hover:bg-gray-100 shadow-sm border border-gray-100'}`} title="Toggle screen share">
                        <MonitorPlay size={16} />
                      </button>
                    </div>
                    <div className="flex items-center gap-2">
                      <button
                        onClick={() => setRoomState('lobby')}
                        className="px-2.5 py-1.5 rounded-lg text-[11px] border border-gray-200 text-gray-700 hover:bg-gray-50"
                      >
                        Cancel
                      </button>
                      <button
                        onClick={startMeetingNow}
                        className="px-3 py-1.5 rounded-lg text-[11px] font-semibold bg-violet-600 text-white hover:bg-violet-700"
                      >
                        Join Now
                      </button>
                    </div>
                  </div>
                </div>
              )}

              {/* STATE: ACTIVE ROOM (Sidebar Panel View) */}
              {roomState === 'active' && (
                <div className="flex-1 flex flex-col h-full animate-fade-in relative">

                  {mediaError && (
                    <div className="mx-4 mt-4 mb-1 bg-amber-50 border border-amber-200 rounded-xl p-3 text-xs text-amber-800 flex items-center justify-between gap-3">
                      <span>Camera and microphone are blocked. Allow permissions to fully join.</span>
                      <button onClick={requestMediaPermissions} className="shrink-0 px-2.5 py-1.5 rounded-lg bg-amber-100 hover:bg-amber-200 text-amber-900 font-semibold">Allow</button>
                    </div>
                  )}

                  <div className="mx-4 mt-4 rounded-xl border border-gray-200 bg-white px-3 py-2 flex items-center gap-2">
                    <span className="text-[10px] font-semibold uppercase tracking-wide text-emerald-600">Live</span>
                    <span className="text-xs text-gray-600 font-mono">{meetingDurationLabel}</span>
                    <div className="w-px h-4 bg-gray-200"></div>
                    <input
                      value={collaboratorInvite}
                      onChange={(e) => setCollaboratorInvite(e.target.value)}
                      placeholder="Invite collaborator"
                      className="flex-1 min-w-0 text-xs text-gray-700 border-none focus:outline-none"
                    />
                    <button onClick={inviteCollaborator} className="px-2 py-1 text-[11px] rounded bg-violet-600 text-white hover:bg-violet-700">Invite</button>
                    <button onClick={handleCopyLink} className="px-2 py-1 text-[11px] rounded border border-gray-200 text-gray-700 hover:bg-gray-50">Copy Link</button>
                  </div>

                  {mainView === 'document' && (
                    <div className="flex flex-col border-b border-gray-100 bg-white">
                      <div className="p-3 pb-2 flex justify-between items-center">
                        <div>
                          <div className="text-xs font-bold text-gray-900 truncate">Q2 Launch Strategy</div>
                          <div className="text-[10px] text-gray-400 font-mono mt-0.5">{roomId}</div>
                        </div>
                        <button onClick={() => { setMainView('room'); setRoomPanelMode('expanded'); }} className="p-1.5 bg-violet-50 text-violet-600 rounded hover:bg-violet-100 transition-colors" title="Expand to Main View">
                          <Maximize2 size={14} />
                        </button>
                      </div>
                      <div className="flex items-center gap-2 px-3 pb-3 overflow-x-auto no-scrollbar shrink-0">
                        <div className="relative w-14 h-14 rounded-[10px] overflow-hidden border border-gray-200 shadow-sm flex-shrink-0 bg-gray-900">
                          <LocalVideoFeed stream={localStream} isCameraOn={isRoomCameraOn} />
                          {!isRoomMicOn && <div className="absolute bottom-1 right-1 bg-black/60 p-0.5 rounded-full"><MicOff size={8} className="text-red-400" /></div>}
                        </div>
                        <div className="relative w-14 h-14 rounded-[10px] overflow-hidden ring-2 ring-emerald-500 shadow-sm flex-shrink-0">
                          <img src="https://images.unsplash.com/photo-1534528741775-53994a69daeb?auto=format&fit=crop&w=100&q=80" alt="Sarah" className="object-cover w-full h-full" />
                        </div>
                        <div className="relative w-14 h-14 rounded-[10px] overflow-hidden border border-gray-200 shadow-sm flex-shrink-0">
                          <img src="https://images.unsplash.com/photo-1500648767791-00dcc994a43e?auto=format&fit=crop&w=100&q=80" alt="Mike" className="object-cover w-full h-full grayscale-[20%]" />
                        </div>
                      </div>
                    </div>
                  )}

                  <div className="flex-1 overflow-y-auto pb-24 space-y-5 px-4 pt-4 relative z-0">

                    {mainView === 'room' && (
                      <div className="bg-violet-50 text-violet-700 text-xs px-3 py-2 rounded-lg flex items-center justify-between border border-violet-100 mb-2">
                        <span>Room is expanded</span>
                        <Maximize2 size={12} className="opacity-50" />
                      </div>
                    )}

                    <div className="space-y-2">
                      <div className="flex items-center gap-1.5 text-[10px] font-bold text-violet-600 uppercase tracking-wider">
                        <Sparkles size={10} /> Live Context
                      </div>
                      <div className="bg-white border border-gray-100 rounded-xl p-3 text-xs text-gray-700 leading-relaxed shadow-sm">
                        Discussing the Q2 launch timelines. Sarah is presenting the new branding assets for final review before deployment.
                      </div>
                    </div>

                    <div className="space-y-2">
                      <div className="text-[10px] font-bold text-gray-400 uppercase tracking-wider">Decisions</div>
                      <div className="bg-white border border-gray-100 rounded-xl p-2.5 shadow-sm flex items-start gap-2.5 hover:border-violet-200 transition-colors cursor-default">
                        <div className="mt-0.5 bg-emerald-100 p-0.5 rounded text-emerald-600"><Check size={10} strokeWidth={3} /></div>
                        <span className="text-xs text-gray-700">Beta launch officially locked for May 15th.</span>
                      </div>
                    </div>

                    <div className="space-y-2">
                      <div className="text-[10px] font-bold text-gray-400 uppercase tracking-wider flex items-center justify-between">
                        Action Items <button className="text-violet-600 hover:text-violet-700 normal-case tracking-normal">Add</button>
                      </div>
                      <div className="bg-white border border-gray-100 rounded-xl p-2.5 shadow-sm flex items-start gap-2.5 hover:border-violet-200 transition-colors cursor-pointer group">
                        <div className="mt-0.5 border border-gray-300 w-3.5 h-3.5 rounded flex items-center justify-center group-hover:border-violet-400 transition-colors"></div>
                        <span className="text-xs text-gray-700 group-hover:text-violet-800 transition-colors">Sarah to upload final assets to the shared drive by Friday.</span>
                      </div>
                      <div className="bg-white border border-gray-100 rounded-xl p-2.5 shadow-sm flex items-start gap-2.5 hover:border-violet-200 transition-colors cursor-pointer group">
                        <div className="mt-0.5 border border-gray-300 w-3.5 h-3.5 rounded flex items-center justify-center group-hover:border-violet-400 transition-colors"></div>
                        <span className="text-xs text-gray-700 group-hover:text-violet-800 transition-colors">Alex to update the Compose AI prompt templates.</span>
                      </div>
                    </div>
                  </div>

                  {mainView === 'document' && (
                    <div className="absolute bottom-6 left-1/2 transform -translate-x-1/2 flex items-center gap-1.5 p-1.5 bg-white/80 backdrop-blur-xl border border-gray-200/60 rounded-2xl shadow-[0_8px_30px_rgba(0,0,0,0.12)] z-10 w-max">
                      <button onClick={toggleRoomMic} className={`p-2 rounded-xl transition-all ${isRoomMicOn ? 'bg-white text-gray-700 hover:bg-gray-100 shadow-sm border border-gray-100' : 'bg-red-50 text-red-600 border border-red-100'}`}>
                        {isRoomMicOn ? <Mic size={16} /> : <MicOff size={16} />}
                      </button>
                      <button onClick={toggleRoomCamera} className={`p-2 rounded-xl transition-all ${isRoomCameraOn ? 'bg-white text-gray-700 hover:bg-gray-100 shadow-sm border border-gray-100' : 'bg-red-50 text-red-600 border border-red-100'}`}>
                        {isRoomCameraOn ? <Video size={16} /> : <VideoOff size={16} />}
                      </button>
                      <button onClick={toggleScreenShare} className={`p-2 rounded-xl transition-all ${isScreenSharing ? 'bg-emerald-500 text-white' : 'bg-white text-gray-700 hover:bg-gray-100 shadow-sm border border-gray-100'}`}>
                        <MonitorPlay size={16} />
                      </button>
                      <div className="w-px h-5 bg-gray-200 mx-1"></div>
                      <button onClick={leaveRoom} className="px-2.5 py-1.5 rounded-xl bg-red-500 hover:bg-red-600 text-white transition-all shadow-sm flex items-center gap-1.5 font-medium text-[11px] border border-red-600 active:scale-95">
                        <PhoneOff size={14} /> Leave
                      </button>
                    </div>
                  )}
                </div>
              )}

              {/* STATE: MEETING SUMMARY */}
              {roomState === 'summary' && (
                <div className="flex-1 overflow-y-auto p-6 space-y-6 bg-white animate-fade-in relative">
                  <div className="text-center pb-6 border-b border-gray-100">
                    <div className="w-12 h-12 bg-gray-50 border border-gray-100 rounded-full flex items-center justify-center mx-auto mb-3 text-gray-400">
                      <PhoneOff size={20} />
                    </div>
                    <h3 className="text-lg font-bold text-gray-900 tracking-tight">Room Ended</h3>
                    <p className="text-xs text-gray-500 mt-1">{meetingSummary?.roomCode || 'q2-launch'} - {meetingSummary?.durationLabel || meetingDurationLabel} duration</p>
                  </div>

                  <div className="space-y-4">
                    <div className="flex items-center gap-2 text-[10px] font-bold text-violet-600 uppercase tracking-wider">
                      <Sparkles size={14} /> AI Session Recap
                    </div>

                    <div className="bg-[#FAFAFC] border border-gray-100 rounded-2xl p-4 space-y-4">
                      <div>
                        <h4 className="text-xs font-bold text-gray-800 mb-1">Key Decisions</h4>
                        <ul className="text-xs text-gray-600 space-y-1.5 pl-4 list-disc marker:text-emerald-500">
                          {(meetingSummary?.decisions || ['Beta launch officially locked for May 15th.', 'Marketing budget increased by 15% for initial push.']).map((decision) => (
                            <li key={decision}>{decision}</li>
                          ))}
                        </ul>
                      </div>
                      <div className="h-px w-full bg-gray-200/60"></div>
                      <div>
                        <h4 className="text-xs font-bold text-gray-800 mb-1">Action Items</h4>
                        <ul className="text-xs text-gray-600 space-y-1.5 pl-4 list-disc marker:text-violet-400">
                          {(meetingSummary?.actionItems || ['Sarah to upload final assets by Friday.', 'Alex to update Compose AI prompts.']).map((actionItem) => (
                            <li key={actionItem}>{actionItem}</li>
                          ))}
                        </ul>
                      </div>
                    </div>
                  </div>

                  <div className="pt-4">
                    <button
                      onClick={() => setRoomState('lobby')}
                      className="w-full bg-gray-100 text-gray-700 border border-gray-200 rounded-xl py-3 text-sm font-bold hover:bg-gray-200 transition-all active:scale-[0.98]"
                    >
                      Back to Lobby
                    </button>
                  </div>
                </div>
              )}

            </div>
          )}

          {activeRightTab === 'people' && (
            <div className="flex-1 overflow-y-auto p-5 space-y-4 bg-white animate-fade-in">
              <div className="rounded-2xl border border-violet-100 bg-gradient-to-br from-violet-50 to-white p-4">
                <h3 className="text-sm font-bold text-gray-900">Platform Contacts</h3>
                <p className="text-xs text-gray-500 mt-1">Everyone currently available to collaborate in Regaarder Compose.</p>
              </div>

              <div className="space-y-3">
                {platformContacts.map((person) => (
                  <div key={person.id} className="rounded-xl border border-gray-100 bg-white p-3 flex items-center justify-between gap-3 hover:border-violet-200 hover:shadow-sm transition-all">
                    <div className="flex items-center gap-3 min-w-0">
                      <div className="w-10 h-10 rounded-full bg-violet-100 text-violet-700 text-xs font-bold flex items-center justify-center shrink-0">
                        {person.name.split(' ').map((token) => token[0]).join('').slice(0, 2)}
                      </div>
                      <div className="min-w-0">
                        <div className="text-sm font-semibold text-gray-800 truncate">{person.name}</div>
                        <div className="text-xs text-gray-500 truncate">{person.title}</div>
                        <div className={`inline-flex items-center gap-1 mt-1 text-[10px] font-semibold rounded-full px-2 py-0.5 ${person.status === 'active' ? 'text-emerald-700 bg-emerald-50 border border-emerald-200' : 'text-amber-700 bg-amber-50 border border-amber-200'}`}>
                          <span className={`h-1.5 w-1.5 rounded-full ${person.status === 'active' ? 'bg-emerald-500 animate-pulse' : 'bg-amber-500'}`}></span>
                          {person.status === 'active' ? 'Active' : 'Away'}
                        </div>
                      </div>
                    </div>
                    <div className="flex items-center gap-2 shrink-0">
                      <button
                        onClick={() => {
                          setRoomMode('calls');
                          openMeetingSetup(`call-${person.name.toLowerCase().replace(/\s+/g, '-')}`);
                          setActiveRightTab('room');
                        }}
                        className="px-2.5 py-1.5 rounded-lg bg-violet-600 text-white text-[11px] font-semibold hover:bg-violet-700 transition-colors"
                      >
                        Call
                      </button>
                      <button
                        onClick={() => {
                          setRoomMode('meetings');
                          setActiveRightTab('room');
                        }}
                        className="px-2.5 py-1.5 rounded-lg border border-gray-200 text-[11px] font-semibold text-gray-700 hover:bg-gray-50 transition-colors"
                      >
                        Invite
                      </button>
                    </div>
                  </div>
                ))}
              </div>
            </div>
          )}

          {activeRightTab === 'memory' && (
            <div className="flex-1 overflow-y-auto p-5 space-y-5">
              <div>
                <h3 className="text-sm font-bold text-gray-900 mb-1">AI Access + Memory</h3>
                <p className="text-xs text-gray-500">Secure mode: AI calls run through your Vercel server function.</p>
              </div>

              <div className="rounded-xl border border-gray-100 bg-[#FAFAFC] p-3 space-y-3">
                <div className="text-[11px] font-semibold text-gray-500 uppercase tracking-wide">API Security</div>
                <div className="text-[11px] text-gray-500 flex items-center gap-2">
                  <KeyRound size={12} />
                  Server-managed key expected: set `GEMINI_API_KEY` in Vercel project env.
                </div>
                <div className="rounded-lg border border-gray-200 bg-white px-3 py-2 text-xs text-gray-600 leading-relaxed">
                  Keep API keys out of client code. This app now sends prompts to `/api/gemini`, and only that server route reads `GEMINI_API_KEY`. The checker validates both presence and provider usability.
                </div>
                <div className="flex items-center gap-2">
                  <button
                    onClick={checkAiBackendStatus}
                    className="inline-flex items-center gap-2 rounded-lg border border-gray-200 bg-white px-3 py-1.5 text-xs font-medium text-gray-700 hover:bg-gray-50"
                  >
                    <RefreshCcw size={12} className={aiBackendStatus.state === 'checking' ? 'animate-spin' : ''} />
                    Check AI Backend
                  </button>
                  <div className={`text-[11px] ${aiBackendStatus.state === 'ok' ? 'text-emerald-600' : aiBackendStatus.state === 'error' ? 'text-rose-600' : 'text-gray-500'}`}>
                    {aiBackendStatus.message}
                  </div>
                </div>
              </div>

              <div className="rounded-xl border border-gray-100 bg-[#FAFAFC] p-3 space-y-3">
                <div className="flex items-center justify-between">
                  <div className="text-[11px] font-semibold text-gray-500 uppercase tracking-wide">Memory Controls</div>
                  <label className="text-xs text-gray-600 flex items-center gap-2">
                    <input
                      type="checkbox"
                      checked={memoryCaptureEnabled}
                      onChange={(e) => setMemoryCaptureEnabled(e.target.checked)}
                    />
                    Capture events
                  </label>
                </div>

                <div className="grid grid-cols-2 gap-2 text-xs text-gray-600">
                  <div className="rounded-lg border border-gray-200 bg-white p-2">Total: <span className="font-semibold">{memoryStats.total}</span></div>
                  <div className="rounded-lg border border-gray-200 bg-white p-2">AI: <span className="font-semibold">{memoryStats.aiCalls}</span></div>
                  <div className="rounded-lg border border-gray-200 bg-white p-2">Uploads: <span className="font-semibold">{memoryStats.uploads}</span></div>
                  <div className="rounded-lg border border-gray-200 bg-white p-2">Exports: <span className="font-semibold">{memoryStats.exports}</span></div>
                </div>

                <div className="flex items-center gap-2 flex-wrap">
                  <label className="text-xs text-gray-600">Retention days</label>
                  <input
                    type="number"
                    min={1}
                    max={3650}
                    value={memoryRetentionDays}
                    onChange={(e) => setMemoryRetentionDays(Math.min(3650, Math.max(1, Number(e.target.value) || 90)))}
                    className="w-24 bg-white border border-gray-200 rounded-lg px-2 py-1.5 text-xs text-gray-700 focus:outline-none focus:border-violet-400"
                  />
                  <button
                    onClick={() => setMemoryEntries([])}
                    className="ml-auto shrink-0 px-2.5 py-1.5 rounded-lg text-xs border border-rose-200 text-rose-600 hover:bg-rose-50"
                  >
                    Clear all
                  </button>
                </div>
              </div>

              <div className="rounded-xl border border-gray-100 bg-[#FAFAFC] p-3 space-y-2">
                <div className="text-[11px] font-semibold text-gray-500 uppercase tracking-wide">Memory Browser</div>
                <div className="flex gap-2 min-w-0">
                  <input
                    type="text"
                    value={memorySearch}
                    onChange={(e) => setMemorySearch(e.target.value)}
                    placeholder="Search memory entries..."
                    className="flex-1 min-w-0 bg-white border border-gray-200 rounded-lg px-3 py-2 text-xs text-gray-700 focus:outline-none focus:border-violet-400"
                  />
                  <select
                    value={memoryFilter}
                    onChange={(e) => setMemoryFilter(e.target.value)}
                    className="shrink-0 bg-white border border-gray-200 rounded-lg px-2 py-2 text-xs text-gray-700"
                  >
                    <option value="all">All</option>
                    <option value="ai">AI</option>
                    <option value="upload">Uploads</option>
                    <option value="export">Exports</option>
                    <option value="automation">Automation</option>
                    <option value="task">Tasks</option>
                    <option value="share">Sharing</option>
                    <option value="feedback">Feedback</option>
                    <option value="document">Documents</option>
                  </select>
                </div>

                <div className="max-h-72 overflow-y-auto space-y-2 pr-1">
                  {filteredMemoryEntries.length === 0 && (
                    <div className="text-xs text-gray-500 py-3 text-center">No memory entries yet.</div>
                  )}
                  {filteredMemoryEntries.map((entry) => (
                    <div key={entry.id} className="rounded-lg border border-gray-200 bg-white p-2.5 text-xs">
                      <div className="flex items-center justify-between gap-2">
                        <span className="font-semibold text-gray-800">{entry.summary}</span>
                        <span className="text-[10px] uppercase text-violet-600 font-semibold">{entry.type}</span>
                      </div>
                      <div className="text-[10px] text-gray-500 mt-1">{new Date(entry.timestamp).toLocaleString()}</div>
                      {Object.keys(entry.details || {}).length > 0 && (
                        <div className="mt-1.5 text-[10px] text-gray-600 break-all">{Object.entries(entry.details).map(([key, value]) => `${key}: ${value}`).join(' | ')}</div>
                      )}
                    </div>
                  ))}
                </div>
              </div>
            </div>
          )}

        </div>
      </div>

      {/* 4. Far Right Mini Sidebar (Icons only / Navigation controller) */}
      <div className="w-[74px] border-l border-gray-100 bg-[#FAFAFC] flex flex-col items-center py-4 gap-6 shrink-0 select-none overflow-y-auto overflow-x-visible thin-scrollbar">
        
        <div 
          onClick={() => handleMiniSidebarClick('chat')}
          className={`flex flex-col items-center gap-1 cursor-pointer transition-colors ${
            activeRightTab === 'chat' && rightSidebarOpen ? 'text-violet-600' : 'text-gray-400 hover:text-violet-600'
          }`}
        >
          <div className={`p-2 rounded-xl transition-all ${activeRightTab === 'chat' && rightSidebarOpen ? 'bg-violet-100' : ''}`}>
            <MessageCircle size={20} />
          </div>
          <span className="text-[9px] font-semibold">Chat</span>
        </div>

        <div 
          onClick={() => handleMiniSidebarClick('assistant')}
          className={`flex flex-col items-center gap-1 cursor-pointer transition-colors ${
            activeRightTab === 'assistant' && rightSidebarOpen ? 'text-violet-600' : 'text-gray-400 hover:text-violet-600'
          }`}
        >
          <div className={`p-2 rounded-xl transition-all relative ${activeRightTab === 'assistant' && rightSidebarOpen ? 'bg-violet-100' : ''} ${selectedEditorText ? 'ring-2 ring-violet-300 ring-offset-2 ring-offset-[#FAFAFC]' : ''}`}>
            <PenTool size={20} />
            {selectedEditorText && <span className="absolute -top-1 -right-1 w-2.5 h-2.5 rounded-full bg-violet-500 animate-pulse" />}
          </div>
          <span className="text-[9px] font-semibold">Assist</span>
        </div>

        <div 
          onClick={() => handleMiniSidebarClick('tasks')}
          className={`flex flex-col items-center gap-1 cursor-pointer transition-colors ${
            activeRightTab === 'tasks' && rightSidebarOpen ? 'text-violet-600' : 'text-gray-400 hover:text-violet-600'
          }`}
        >
          <div className={`p-2 rounded-xl transition-all ${activeRightTab === 'tasks' && rightSidebarOpen ? 'bg-violet-100' : ''}`}>
            <CheckSquare size={20} />
          </div>
          <span className="text-[9px] font-semibold">Tasks</span>
        </div>

        <div 
          onClick={() => handleMiniSidebarClick('calendar')}
          className={`flex flex-col items-center gap-1 cursor-pointer transition-colors ${
            activeRightTab === 'calendar' && rightSidebarOpen ? 'text-violet-600' : 'text-gray-400 hover:text-violet-600'
          }`}
        >
          <div className={`p-2 rounded-xl transition-all ${activeRightTab === 'calendar' && rightSidebarOpen ? 'bg-violet-100' : ''}`}>
            <Calendar size={20} />
          </div>
          <span className="text-[9px] font-semibold">Schedule</span>
        </div>

        <div
          onClick={() => handleMiniSidebarClick('people')}
          className={`flex flex-col items-center gap-1 cursor-pointer transition-colors ${
            activeRightTab === 'people' && rightSidebarOpen ? 'text-violet-600' : 'text-gray-400 hover:text-violet-600'
          }`}
        >
          <div className={`p-2 rounded-xl transition-all ${activeRightTab === 'people' && rightSidebarOpen ? 'bg-violet-100' : ''}`}>
            <Users size={20} />
          </div>
          <span className="text-[9px] font-semibold">People</span>
        </div>

        <div
          onClick={() => handleMiniSidebarClick('memory')}
          className={`flex flex-col items-center gap-1 cursor-pointer transition-colors ${
            activeRightTab === 'memory' && rightSidebarOpen ? 'text-violet-600' : 'text-gray-400 hover:text-violet-600'
          }`}
        >
          <div className={`p-2 rounded-xl transition-all ${activeRightTab === 'memory' && rightSidebarOpen ? 'bg-violet-100' : ''}`}>
            <Database size={20} />
          </div>
          <span className="text-[9px] font-semibold">Memory</span>
        </div>

        <div
          onClick={() => handleMiniSidebarClick('room')}
          className={`flex flex-col items-center gap-1 cursor-pointer transition-colors ${
            activeRightTab === 'room' && rightSidebarOpen ? 'text-violet-600' : 'text-gray-400 hover:text-violet-600'
          }`}
        >
          <div className={`p-2 rounded-xl transition-all ${activeRightTab === 'room' && rightSidebarOpen ? 'bg-violet-100' : ''}`}>
            <MonitorPlay size={20} />
          </div>
          <span className="text-[9px] font-semibold">Room</span>
        </div>

        <div
          onClick={() => {
            handleMiniSidebarClick('room');
            setActiveMeetingStageTab('files');
          }}
          className="flex flex-col items-center gap-1 text-gray-400 hover:text-violet-600 cursor-pointer"
        >
          <div className="p-2">
            <File size={20} />
          </div>
          <span className="text-[9px] font-semibold">Files</span>
        </div>

        <div className="flex flex-col items-center gap-1 text-gray-400 hover:text-gray-600 cursor-pointer mt-auto">
          <div className="p-2">
            <MoreHorizontal size={20} />
          </div>
          <span className="text-[9px] font-semibold">More</span>
        </div>
      </div>

      {roomState === 'active' && roomPanelMode === 'expanded' && mainView === 'room' && (
        <div className="fixed bottom-5 right-24 w-[min(76vw,980px)] h-[min(74vh,560px)] rounded-3xl overflow-hidden border border-white/40 shadow-[0_24px_70px_rgba(15,23,42,0.35)] bg-slate-900 z-[320]">
          <div className="h-12 px-4 bg-black/45 backdrop-blur-md flex items-center justify-between text-white">
            <div className="flex items-center gap-3 min-w-0">
              <span className="text-sm font-semibold truncate">Meeting: {roomId || 'live-room'}</span>
              <span className="text-[10px] px-2 py-0.5 rounded-full bg-emerald-500/20 text-emerald-300 border border-emerald-400/40">LIVE {meetingDurationLabel}</span>
              <div className="hidden md:flex items-center gap-1 rounded-lg border border-white/20 bg-white/5 p-1">
                {[
                  { key: 'room', label: 'Room' },
                  { key: 'call', label: 'Call' },
                  { key: 'files', label: 'Files' },
                ].map((tab) => (
                  <button
                    key={tab.key}
                    type="button"
                    onClick={() => setActiveMeetingStageTab(tab.key)}
                    className={`px-2.5 py-1 rounded-md text-[11px] font-medium transition ${activeMeetingStageTab === tab.key ? 'bg-white text-slate-900' : 'text-slate-200 hover:bg-white/10'}`}
                  >
                    {tab.label}
                  </button>
                ))}
              </div>
            </div>
            <div className="flex items-center gap-2">
              <button
                onClick={() => meetingShareFileInputRef.current?.click()}
                className="px-2.5 py-1.5 rounded-lg text-xs bg-white/15 hover:bg-white/25 transition inline-flex items-center gap-1.5"
                title="Share file"
              >
                <Paperclip size={13} /> Share file
              </button>
              <button onClick={handleShareMeeting} className="px-2.5 py-1.5 rounded-lg text-xs bg-white/15 hover:bg-white/25 transition">Share</button>
              <button onClick={() => { setRoomPanelMode('docked'); setMainView('document'); }} className="p-1.5 rounded-lg bg-white/15 hover:bg-white/25 transition" title="Minimize meeting"><Minimize2 size={15} /></button>
            </div>
          </div>

          <div className="h-[calc(100%-3rem)] flex">
            <div className="flex-1 relative bg-black">
              {activeMeetingStageTab === 'files' && activeSharedMeetingFile ? (
                <div className="absolute inset-0 bg-[radial-gradient(circle_at_82%_18%,rgba(196,181,253,0.3),rgba(30,41,59,0)_36%),radial-gradient(circle_at_14%_84%,rgba(59,130,246,0.22),rgba(15,23,42,0)_38%),linear-gradient(150deg,#f8fafc_0%,#eef2ff_48%,#f1f5f9_100%)]">
                  <div className="h-full p-4 flex gap-3">
                    <div className="w-24 rounded-2xl border border-slate-200 bg-white/90 backdrop-blur-sm p-2 space-y-2 overflow-y-auto thin-scrollbar">
                      {Array.from({ length: Math.min(6, activeSharedMeetingFile.pages) }).map((_, index) => (
                        <button
                          key={`thumb-${activeSharedMeetingFile.id}-${index}`}
                          type="button"
                          className={`w-full rounded-lg border p-1.5 text-left transition ${index === 0 ? 'border-violet-300 bg-violet-50 shadow-sm' : 'border-slate-200 bg-white hover:border-violet-200'}`}
                        >
                          <div className="h-8 rounded bg-gradient-to-br from-slate-100 to-slate-200" />
                          <div className="mt-1 text-[9px] font-semibold text-slate-600">{index + 1}</div>
                        </button>
                      ))}
                    </div>
                    <div className="flex-1 rounded-2xl border border-slate-200 bg-white/88 backdrop-blur-sm shadow-[0_18px_45px_-26px_rgba(15,23,42,0.4)] p-5 flex flex-col min-h-0">
                      <div className="flex items-center justify-between gap-3 pb-3 border-b border-slate-200">
                        <div className="min-w-0">
                          <div className="text-[11px] uppercase tracking-[0.12em] text-violet-600 font-semibold">Presentation</div>
                          <div className="text-[15px] font-semibold text-slate-900 truncate">{activeSharedMeetingFile.name}</div>
                          <div className="text-[11px] text-slate-500 mt-0.5">Shared by {activeSharedMeetingFile.sharedBy} - {formatMeetingFileSize(activeSharedMeetingFile.size)}</div>
                        </div>
                        <div className="text-[11px] text-slate-600 rounded-lg border border-slate-200 bg-white px-2 py-1">1 / {activeSharedMeetingFile.pages}</div>
                      </div>
                      <div className="flex-1 min-h-0 py-4">
                        <div className="h-full rounded-2xl border border-slate-200 bg-white p-6 relative overflow-hidden">
                          <div className="absolute -top-12 -right-12 w-44 h-44 rounded-full bg-violet-200/50 blur-3xl" />
                          <div className="absolute -bottom-14 left-[-20px] w-44 h-44 rounded-full bg-blue-200/50 blur-3xl" />
                          <div className="relative z-10 max-w-[520px]">
                            <div className="text-[10px] font-semibold uppercase tracking-[0.12em] text-violet-600">Project MOAT</div>
                            <h2 className="mt-2 text-[28px] leading-[1.1] font-semibold text-slate-900">{activeSharedMeetingFile.baseName || 'Strategic Disruption Through AI-Native Bundling'}</h2>
                            <p className="mt-2 text-[13px] text-slate-600">Shared deck is now visible to all participants in the meeting workspace.</p>
                            <div className="mt-5 grid grid-cols-3 gap-3 text-[11px]">
                              <div className="rounded-xl border border-slate-200 bg-violet-50/60 p-3">
                                <div className="font-semibold text-slate-900">The Problem</div>
                                <div className="mt-1 text-slate-600">Incumbents win by bundling and distribution leverage.</div>
                              </div>
                              <div className="rounded-xl border border-slate-200 bg-emerald-50/50 p-3">
                                <div className="font-semibold text-slate-900">Our Approach</div>
                                <div className="mt-1 text-slate-600">Build a superior suite and distribute as a unified ecosystem.</div>
                              </div>
                              <div className="rounded-xl border border-slate-200 bg-amber-50/60 p-3">
                                <div className="font-semibold text-slate-900">Our Advantage</div>
                                <div className="mt-1 text-slate-600">AI-native tools, speed, and deep workflow integration.</div>
                              </div>
                            </div>
                          </div>
                        </div>
                      </div>
                    </div>
                  </div>
                </div>
              ) : isScreenSharing ? (
                <>
                  <RoomStageFeed stream={screenShareStream} placeholder="Screen share preview" />
                  <div className="absolute top-3 left-3 px-2 py-1 rounded-lg bg-black/45 text-white text-xs">
                    Presenting Screen
                  </div>
                </>
              ) : (
                <div className="absolute inset-0 bg-[radial-gradient(circle_at_32%_24%,rgba(99,102,241,0.32),rgba(15,23,42,0)_45%),radial-gradient(circle_at_72%_74%,rgba(56,189,248,0.24),rgba(2,6,23,0)_42%),linear-gradient(145deg,#020617_0%,#0b1120_55%,#111827_100%)] text-white">
                  <div className="absolute inset-0 flex flex-col items-center justify-center px-6 text-center">
                    <div className="w-48 h-48 rounded-full border border-dashed border-white/25 flex items-center justify-center">
                      <div className="w-14 h-14 rounded-xl border border-violet-300/60 bg-violet-500/20 flex items-center justify-center">
                        <MonitorPlay size={24} className="text-violet-200" />
                      </div>
                    </div>
                    <div className="mt-5 text-xl font-semibold">No one is sharing yet</div>
                    <p className="mt-2 text-sm text-slate-300 max-w-sm">Share your screen, a window, or upload a file to get started.</p>
                    <div className="mt-6 flex items-center gap-3">
                      <button
                        onClick={toggleScreenShare}
                        className="px-4 py-2 rounded-xl bg-violet-600 hover:bg-violet-500 text-white text-sm font-semibold inline-flex items-center gap-2"
                      >
                        <MonitorPlay size={14} /> Share screen
                      </button>
                      <button
                        onClick={() => {
                          setActiveMeetingStageTab('files');
                          meetingShareFileInputRef.current?.click();
                        }}
                        className="px-4 py-2 rounded-xl border border-white/20 bg-white/10 hover:bg-white/15 text-white text-sm font-semibold inline-flex items-center gap-2"
                      >
                        <Upload size={14} /> Upload file
                      </button>
                    </div>
                  </div>
                </div>
              )}
              <div className="absolute bottom-4 left-1/2 -translate-x-1/2 flex items-center gap-2 px-3 py-2 rounded-2xl bg-black/40 backdrop-blur-md border border-white/20">
                <button onClick={toggleRoomMic} className={`p-2 rounded-xl transition ${isRoomMicOn ? 'bg-white text-slate-800' : 'bg-red-500 text-white'}`} title="Microphone">
                  {isRoomMicOn ? <Mic size={16} /> : <MicOff size={16} />}
                </button>
                <button onClick={toggleRoomCamera} className={`p-2 rounded-xl transition ${isRoomCameraOn ? 'bg-white text-slate-800' : 'bg-red-500 text-white'}`} title="Camera">
                  {isRoomCameraOn ? <Video size={16} /> : <VideoOff size={16} />}
                </button>
                <button onClick={toggleScreenShare} className={`p-2 rounded-xl transition ${isScreenSharing ? 'bg-emerald-500 text-white' : 'bg-white text-slate-800'}`} title="Share screen">
                  <MonitorPlay size={16} />
                </button>
                <button
                  onClick={() => {
                    setActiveMeetingStageTab('files');
                    meetingShareFileInputRef.current?.click();
                  }}
                  className="p-2 rounded-xl transition bg-white text-slate-800"
                  title="Share files"
                >
                  <File size={16} />
                </button>
                <button onClick={leaveRoom} className="px-3 py-2 rounded-xl bg-red-500 hover:bg-red-600 text-white text-xs font-semibold" title="Leave meeting">
                  Leave
                </button>
              </div>
            </div>

            <div className="w-52 bg-slate-950/90 border-l border-white/10 p-3 space-y-3">
              <div className="text-[11px] uppercase tracking-wider text-slate-300 font-semibold">{activeMeetingStageTab === 'files' ? `Files (${sharedMeetingFiles.length})` : 'Participants'}</div>
              <div className="space-y-2">
                {activeMeetingStageTab === 'files' && sharedMeetingFiles.length > 0 ? (
                  sharedMeetingFiles.map((item) => (
                    <button
                      key={item.id}
                      type="button"
                      onClick={() => {
                        setActiveSharedMeetingFileId(item.id);
                        setActiveMeetingStageTab('files');
                      }}
                      className={`w-full rounded-xl border text-left px-2 py-2 transition ${activeSharedMeetingFile?.id === item.id ? 'border-violet-300 bg-violet-100/20' : 'border-white/10 bg-slate-800 hover:border-violet-300/40'}`}
                    >
                      <div className="text-[11px] text-slate-100 font-medium truncate">{item.name}</div>
                      <div className="text-[10px] text-slate-400 mt-1">{formatMeetingFileSize(item.size)} - {item.pages} pages</div>
                    </button>
                  ))
                ) : (
                  <>
                    <div className="rounded-xl overflow-hidden border border-emerald-300/30 bg-slate-800">
                      <div className="h-24 bg-slate-900">
                        <RoomStageFeed stream={localStream} placeholder="You" />
                      </div>
                      <div className="px-2 py-1 text-[11px] text-slate-100 flex items-center justify-between"><span>You</span>{!isRoomMicOn && <MicOff size={12} className="text-red-400" />}</div>
                    </div>
                    {meetingParticipants.map((participant) => (
                      <div key={participant.name} className="rounded-xl overflow-hidden border border-white/10 bg-slate-800">
                        <img src={participant.img} alt={participant.name} className="w-full h-20 object-cover" />
                        <div className="px-2 py-1 text-[11px] text-slate-100">{participant.name}</div>
                      </div>
                    ))}
                  </>
                )}
                {activeMeetingStageTab === 'files' && sharedMeetingFiles.length === 0 && (
                  <div className="rounded-xl border border-dashed border-white/20 bg-slate-900/60 px-3 py-4 text-center">
                    <div className="text-[11px] text-slate-200 font-medium">No files shared yet</div>
                    <button
                      type="button"
                      onClick={() => meetingShareFileInputRef.current?.click()}
                      className="mt-2 px-2.5 py-1.5 rounded-lg bg-violet-600 text-white text-[11px] font-semibold hover:bg-violet-500"
                    >
                      Share first file
                    </button>
                  </div>
                )}
              </div>
            </div>
          </div>
        </div>
      )}

      {roomState === 'active' && mainView === 'document' && (
        <div className="fixed bottom-5 right-24 z-[320] rounded-2xl border border-violet-200 bg-white/95 backdrop-blur-md shadow-[0_18px_45px_rgba(76,29,149,0.25)] px-3 py-2 flex items-center gap-2">
          <span className="w-2 h-2 rounded-full bg-emerald-500 animate-pulse"></span>
          <span className="text-xs font-semibold text-gray-700">Meeting live - {meetingDurationLabel}</span>
          <button onClick={() => { setMainView('room'); setRoomPanelMode('docked'); }} className="px-2 py-1 text-[11px] rounded bg-violet-600 text-white hover:bg-violet-700">Return</button>
          <button onClick={leaveRoom} className="px-2 py-1 text-[11px] rounded border border-red-200 text-red-600 hover:bg-red-50">Leave</button>
        </div>
      )}

      <input
        ref={meetingShareFileInputRef}
        type="file"
        multiple
        className="hidden"
        onChange={(event) => {
          handleMeetingFileSelection(event.target.files);
          event.target.value = '';
        }}
      />

    </div>
  );
}
