import React, { useCallback, useEffect, useMemo, useRef, useState } from 'react';
import html2canvas from 'html2canvas';
import { jsPDF } from 'jspdf';
import { 
  Menu, Search, Plus, Sparkles, Bell, 
  ChevronLeft, ChevronRight, Cloud, Users, Home, Inbox, Star, 
  FileText, Trash, Settings, MoreHorizontal,
  Mic, ArrowUp, MessageSquare, CheckSquare, Calendar, 
  File, User, PenTool, AlignLeft, AlignCenter, AlignRight, 
  List, ListOrdered, Bold, Italic, Underline, Type, X, ChevronDown,
  LayoutGrid, BookOpen, Scissors, Expand, Check, Wand2, Presentation,
  AlertTriangle, MonitorPlay, MessageCircle, FileQuestion,
  Send, ListTodo, ShieldAlert, ArrowRight, Loader2, Move, Upload, Database, KeyRound, Video, VideoOff, MicOff, PhoneOff,
  UserPlus, Link2 as LinkIcon, Link, Clock, Maximize2, Minimize2, Sidebar, Image as ImageIcon,
  Undo2, Redo2, Save, RefreshCcw, Trash2, ThumbsUp, ThumbsDown, MessageSquarePlus, Play, Pause, Paperclip, Moon, Sun, MoveLeft, MoveRight, Minus, Smile,
  Square, Circle, Diamond, Triangle, Shapes, StickyNote,
  Hand, Eraser, MousePointer2, Bot, Highlighter
} from 'lucide-react';
import './thin-scrollbar.css';
import RegaarderComposeLanding from './RegaarderComposeLanding';

const AI_NATIVE_PLACEHOLDER = 'Type, ask Compose AI, or speak to start';
const UNTITLED_WHITEBOARD_LABEL = 'Untitled whiteboard';
const SAVED_DRAFT_LABEL = 'Saved Drafts';
const ENTERPRISE_PAGE_WIDTH_PX = 794;
const ENTERPRISE_PAGE_HEIGHT_PX = 1123;
const LassoLoopIcon = ({ size = 12, className = '', style = {} }) => (
  <svg
    xmlns="http://www.w3.org/2000/svg"
    width={size}
    height={size}
    viewBox="0 0 24 24"
    fill="none"
    stroke="currentColor"
    strokeWidth="2"
    strokeLinecap="round"
    strokeLinejoin="round"
    className={className}
    style={style}
  >
    <path d="M12 4a8 8 0 1 0 0 16a3 3 0 1 0 3-3" strokeDasharray="2.6 2.6" />
    <circle cx="15" cy="17" r="1.4" />
  </svg>
);

const WHITEBOARD_EMOJI_LIBRARY = [
  '🙂', '🔥', '✨', '🎯', '👍', '👏', '💡', '✅', '❤️', '🚀',
  '📌', '🤝', '😄', '🙌', '⚡', '🧠', '🌟', '🪄', '📝', '📎',
  '🔔', '👀', '💭', '😍', '🤍', '🏷️', '🎉', '🙋', '🔍', '🗂️',
];
const WHITEBOARD_EMOJI_STORAGE_KEY = 'rc.whiteboardEmojiUsage';

const WHITEBOARD_PEN_CURSOR = "url(\"data:image/svg+xml,%3Csvg xmlns='http://www.w3.org/2000/svg' width='28' height='28' viewBox='0 0 24 24' fill='none' stroke='%237c3aed' stroke-width='2' stroke-linecap='round' stroke-linejoin='round'%3E%3Cpath d='M12 20h9'/%3E%3Cpath d='M16.5 3.5a2.1 2.1 0 0 1 3 3L7 19l-4 1 1-4Z'/%3E%3C/svg%3E\") 2 24, crosshair";
const WHITEBOARD_PEN_CURSORS = {
  'felt-pen': "url(\"data:image/svg+xml,%3Csvg xmlns='http://www.w3.org/2000/svg' width='28' height='28' viewBox='0 0 24 24' fill='none' stroke='%234f46e5' stroke-width='2.5' stroke-linecap='round' stroke-linejoin='round'%3E%3Cpath d='M12 20h9'/%3E%3Cpath d='M16.5 3.5a2.1 2.1 0 0 1 3 3L7 19l-4 1 1-4Z'/%3E%3C/svg%3E\") 2 26, crosshair",
  'ballpoint': "url(\"data:image/svg+xml,%3Csvg xmlns='http://www.w3.org/2000/svg' width='20' height='20' viewBox='0 0 24 24' fill='none' stroke='%231f2937' stroke-width='1.4' stroke-linecap='round' stroke-linejoin='round'%3E%3Cpath d='M12 20h9'/%3E%3Cpath d='M16.5 3.5a2.1 2.1 0 0 1 3 3L7 19l-4 1 1-4Z'/%3E%3C/svg%3E\") 2 18, crosshair",
  'pencil': "url(\"data:image/svg+xml,%3Csvg xmlns='http://www.w3.org/2000/svg' width='24' height='24' viewBox='0 0 24 24' fill='none' stroke='%2352525b' stroke-width='2' stroke-linecap='round' stroke-linejoin='round'%3E%3Cpath d='M17 3a2.85 2.83 0 1 1 4 4L7.5 20.5 2 22l1.5-5.5Z'/%3E%3Cpath d='m15 5 4 4'/%3E%3C/svg%3E\") 2 22, crosshair",
  lasso: "url(\"data:image/svg+xml,%3Csvg xmlns='http://www.w3.org/2000/svg' width='28' height='28' viewBox='0 0 24 24' fill='none' stroke='%23334155' stroke-width='2' stroke-linecap='round' stroke-linejoin='round'%3E%3Cpath d='M12 4a8 8 0 1 0 0 16a3 3 0 1 0 3-3' stroke-dasharray='2.6 2.6'/%3E%3Ccircle cx='15' cy='17' r='1.4'/%3E%3C/svg%3E\") 2 24, crosshair",
  'marker': "url(\"data:image/svg+xml,%3Csvg xmlns='http://www.w3.org/2000/svg' width='34' height='34' viewBox='0 0 24 24' fill='none' stroke='%230f766e' stroke-width='3.2' stroke-linecap='round' stroke-linejoin='round'%3E%3Cpath d='M12 20h9'/%3E%3Cpath d='M16.5 3.5a2.1 2.1 0 0 1 3 3L7 19l-4 1 1-4Z'/%3E%3C/svg%3E\") 2 32, crosshair",
  'highlighter': "url(\"data:image/svg+xml,%3Csvg xmlns='http://www.w3.org/2000/svg' width='36' height='22' viewBox='0 0 36 22'%3E%3Crect x='1' y='6' width='26' height='12' rx='3' fill='%23fde047' fill-opacity='0.85' stroke='%23ca8a04' stroke-width='1.5'/%3E%3Cpolygon points='27 6 34 11 34 13 27 18' fill='%23ca8a04'/%3E%3Ccircle cx='34' cy='12' r='1.5' fill='%23fff'/%3E%3C/svg%3E\") 33 12, crosshair",
  'calligraphy': "url(\"data:image/svg+xml,%3Csvg xmlns='http://www.w3.org/2000/svg' width='30' height='30' viewBox='0 0 24 24' fill='none' stroke='%237c2d12' stroke-width='2' stroke-linecap='round' stroke-linejoin='round'%3E%3Cpath d='M2 21L12 3l10 18'/%3E%3Cpath d='M5.5 14.5h13'/%3E%3C/svg%3E\") 2 28, crosshair",
};
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

const WHITEBOARD_TEMPLATE_LIBRARY = [
  {
    key: 'startup-lean-canvas',
    category: 'Startup',
    label: 'Lean Canvas',
    detail: 'Problem, solution, channels, metrics, unfair advantage.',
    preview: ['#fde047', '#a5b4fc', '#93c5fd', '#a3e635', '#fb923c'],
  },
  {
    key: 'startup-roadmap-sprint',
    category: 'Startup',
    label: 'MVP Sprint Roadmap',
    detail: 'Weekly milestones from validation to launch.',
    preview: ['#a78bfa', '#818cf8', '#60a5fa', '#facc15'],
  },
  {
    key: 'enterprise-quarterly-operating-review',
    category: 'Enterprise',
    label: 'Quarterly Operating Review',
    detail: 'OKRs, risks, dependencies, owners, and escalations.',
    preview: ['#c4b5fd', '#93c5fd', '#fcd34d', '#f9a8d4'],
  },
  {
    key: 'enterprise-stakeholder-update',
    category: 'Enterprise',
    label: 'Stakeholder Update Board',
    detail: 'Status rollup for leadership and cross-functional teams.',
    preview: ['#bfdbfe', '#86efac', '#fcd34d', '#c4b5fd'],
  },
  {
    key: 'personal-weekly-planner',
    category: 'Personal',
    label: 'Weekly Planner',
    detail: 'Goals, priorities, routines, and reflections.',
    preview: ['#fde68a', '#bfdbfe', '#bbf7d0', '#fbcfe8'],
  },
  {
    key: 'personal-goals-habit-tracker',
    category: 'Personal',
    label: 'Goals + Habit Tracker',
    detail: 'Monthly outcomes with daily habit checkpoints.',
    preview: ['#fef3c7', '#bfdbfe', '#fbcfe8', '#c4b5fd'],
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
const SCHEDULE_TIMEZONE_OPTIONS = ['GMT+5:30', 'GMT+0:00', 'GMT-8:00', 'GMT+1:00'];

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
  const [dmSearchQuery, setDmSearchQuery] = useState('');
  const [dmComposerValue, setDmComposerValue] = useState('');
  const [dmPendingAttachments, setDmPendingAttachments] = useState([]);
  const [dmEmojiPickerOpen, setDmEmojiPickerOpen] = useState(false);
  const [dmFormatMenuOpen, setDmFormatMenuOpen] = useState(false);
  const [dmComposerQuickMenuOpen, setDmComposerQuickMenuOpen] = useState(false);
  const [dmScheduleMenuOpen, setDmScheduleMenuOpen] = useState(false);
  const [dmConversationTab, setDmConversationTab] = useState('chat');
  const [dmActiveParentMessageId, setDmActiveParentMessageId] = useState(null);
  const [dmThreadComposerValue, setDmThreadComposerValue] = useState('');
  const [dmMemberView, setDmMemberView] = useState('member');
  const [dmJoinedAt, setDmJoinedAt] = useState(null);
  const [dmActiveThreadId, setDmActiveThreadId] = useState('thread-beta-launch');
  const [dmThreads, setDmThreads] = useState([
    { id: 'thread-beta-launch', title: 'Beta Launch', members: 12, unread: 1, pinned: true, description: 'Private project', lastMessageAt: Date.now() - 1000 * 60 * 8 },
    { id: 'thread-mobile-app', title: 'Mobile App', members: 9, unread: 0, pinned: false, description: 'Delivery squad', lastMessageAt: Date.now() - 1000 * 60 * 62 },
    { id: 'thread-compose-ai', title: 'Compose AI', members: 7, unread: 0, pinned: false, description: 'AI systems', lastMessageAt: Date.now() - 1000 * 60 * 120 },
  ]);
  const [dmMessages, setDmMessages] = useState([
    {
      id: 'dm-1',
      threadId: 'thread-beta-launch',
      author: 'Sarah Johnson',
      role: 'product-lead',
      text: 'The landing page is ready for review. Please drop comments before 4 PM.',
      createdAt: Date.now() - 1000 * 60 * 46,
      files: [{ id: 'file-landing-v2', name: 'Landing Page V2', kind: 'doc', updatedAt: Date.now() - 1000 * 60 * 6 }],
      decisions: [],
    },
    {
      id: 'dm-2',
      threadId: 'thread-beta-launch',
      author: 'Joshua David',
      role: 'you',
      text: 'Looks clean. I will share it with the team and gather feedback in this thread.',
      createdAt: Date.now() - 1000 * 60 * 40,
      files: [],
      decisions: [],
    },
    {
      id: 'dm-3',
      threadId: 'thread-beta-launch',
      author: 'Orb (AI Assistant)',
      role: 'assistant',
      text: 'Decision log update: Team agreed to finalize the launch copy tomorrow morning.',
      createdAt: Date.now() - 1000 * 60 * 34,
      files: [],
      decisions: ['Finalize launch copy by tomorrow morning'],
    },
  ]);
  const [dmFiles, setDmFiles] = useState([
    { id: 'dm-file-1', threadId: 'thread-beta-launch', name: 'Launch Plan', kind: 'doc', updatedAt: Date.now() - 1000 * 60 * 120 },
    { id: 'dm-file-2', threadId: 'thread-beta-launch', name: 'Budget Forecast', kind: 'sheet', updatedAt: Date.now() - 1000 * 60 * 65 },
    { id: 'dm-file-3', threadId: 'thread-beta-launch', name: 'Investor Deck', kind: 'deck', updatedAt: Date.now() - 1000 * 60 * 1440 },
  ]);
  const [dmDecisions, setDmDecisions] = useState([
    { id: 'dm-decision-1', threadId: 'thread-beta-launch', summary: 'Launch date held for May 15', createdAt: Date.now() - 1000 * 60 * 80, by: 'Sarah Johnson' },
    { id: 'dm-decision-2', threadId: 'thread-beta-launch', summary: 'Final copy review due tomorrow 10:00 AM', createdAt: Date.now() - 1000 * 60 * 32, by: 'Orb (AI Assistant)' },
  ]);
  const [dmArchive, setDmArchive] = useState([]);
  const [dmThreadReplies, setDmThreadReplies] = useState([
    {
      id: 'dm-thread-reply-1',
      threadId: 'thread-beta-launch',
      parentMessageId: 'dm-2',
      author: 'Alex Morgan',
      role: 'member',
      text: 'Great. I can own collecting design feedback by EOD.',
      createdAt: Date.now() - 1000 * 60 * 36,
    },
    {
      id: 'dm-thread-reply-2',
      threadId: 'thread-beta-launch',
      parentMessageId: 'dm-2',
      author: 'Sarah Johnson',
      role: 'product-lead',
      text: 'Perfect, please also link final comments back here for archive search.',
      createdAt: Date.now() - 1000 * 60 * 31,
    },
  ]);
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
  const [activeRightTab, setActiveRightTab] = useState('room'); // 'chat' | 'assistant' | 'whiteboard' | 'tasks' | 'calendar' | 'room' | 'memory'
  const [whiteboardAssistantTab, setWhiteboardAssistantTab] = useState('ask');
  const [whiteboardTool, setWhiteboardTool] = useState('pen');
  const [whiteboardPenVariant, setWhiteboardPenVariant] = useState('felt-pen');
  const [whiteboardHoverLabel, setWhiteboardHoverLabel] = useState('');
  const [whiteboardHoveredObject, setWhiteboardHoveredObject] = useState(null);
  const [whiteboardReactionTarget, setWhiteboardReactionTarget] = useState(null);
  const [whiteboardReactionMenuOpen, setWhiteboardReactionMenuOpen] = useState(false);
  const [whiteboardEmojiModalOpen, setWhiteboardEmojiModalOpen] = useState(false);
  const [whiteboardEmojiSearch, setWhiteboardEmojiSearch] = useState('');
  const [whiteboardEmojiUsage, setWhiteboardEmojiUsage] = useState([]);
  const [whiteboardAlignmentGuides, setWhiteboardAlignmentGuides] = useState([]);
  const [whiteboardHoveredAnchor, setWhiteboardHoveredAnchor] = useState(null);
  const [whiteboardStrokes, setWhiteboardStrokes] = useState([]);
  const [whiteboardRedoStrokes, setWhiteboardRedoStrokes] = useState([]);
  const [whiteboardCurrentStroke, setWhiteboardCurrentStroke] = useState('');
  const [whiteboardLineAnchor, setWhiteboardLineAnchor] = useState(null);
  const [whiteboardCurrentShape, setWhiteboardCurrentShape] = useState(null);
  const [whiteboardShapes, setWhiteboardShapes] = useState([]);
  const [selectedShapeIndex, setSelectedShapeIndex] = useState(null);
  const [whiteboardShapeVariant, setWhiteboardShapeVariant] = useState('line');
  const [whiteboardShapeMenuOpen, setWhiteboardShapeMenuOpen] = useState(false);
  const [isWhiteboardDrawing, setIsWhiteboardDrawing] = useState(false);
  const [whiteboardWidgets, setWhiteboardWidgets] = useState([]);
  const [whiteboardMoreMenuOpen, setWhiteboardMoreMenuOpen] = useState(false);
  const [whiteboardStickyPaletteOpen, setWhiteboardStickyPaletteOpen] = useState(false);
  const [whiteboardStickyColor, setWhiteboardStickyColor] = useState('#fef08a');
  const [whiteboardStickyDragStart, setWhiteboardStickyDragStart] = useState(null);
  const [whiteboardStickyPreview, setWhiteboardStickyPreview] = useState(null);
  const [whiteboardStickyCursorPosition, setWhiteboardStickyCursorPosition] = useState(null);
  const [whiteboardEditingWidgetId, setWhiteboardEditingWidgetId] = useState(null);
  const [selectedWidgetId, setSelectedWidgetId] = useState(null);
  const [whiteboardComments, setWhiteboardComments] = useState([]);
  const [whiteboardActiveCommentId, setWhiteboardActiveCommentId] = useState(null);
  const [whiteboardAddMenuOpen, setWhiteboardAddMenuOpen] = useState(false);
  const [whiteboardStickyColorMenuFor, setWhiteboardStickyColorMenuFor] = useState(null);
  const [whiteboardMoreTextMenuFor, setWhiteboardMoreTextMenuFor] = useState(null);
  const [whiteboardTextColorMenuFor, setWhiteboardTextColorMenuFor] = useState(null);
  const [whiteboardHighlightColorMenuFor, setWhiteboardHighlightColorMenuFor] = useState(null);
  const [whiteboardPenMenuOpen, setWhiteboardPenMenuOpen] = useState(false);
  const [whiteboardPenWidthOverride, setWhiteboardPenWidthOverride] = useState(null);
  const [whiteboardPenCustomWidth, setWhiteboardPenCustomWidth] = useState(2.6);
  const [whiteboardPenCustomSizeOpen, setWhiteboardPenCustomSizeOpen] = useState(false);
  const [whiteboardEraserMenuOpen, setWhiteboardEraserMenuOpen] = useState(false);
  const [whiteboardEraserSize, setWhiteboardEraserSize] = useState(9);
  const [whiteboardEraserCustomSizeOpen, setWhiteboardEraserCustomSizeOpen] = useState(false);
  const [whiteboardZoomLevel, setWhiteboardZoomLevel] = useState(100);
  const [whiteboardTemplateMenuOpen, setWhiteboardTemplateMenuOpen] = useState(false);
  const [whiteboardTemplatePrompt, setWhiteboardTemplatePrompt] = useState('');
  const [whiteboardTemplateSources, setWhiteboardTemplateSources] = useState([]);
  const [whiteboardCustomTemplates, setWhiteboardCustomTemplates] = useState([]);
  const [whiteboardTaskPreviewOpen, setWhiteboardTaskPreviewOpen] = useState(false);
  const [whiteboardTaskPreview, setWhiteboardTaskPreview] = useState({
    projectName: 'Whiteboard Project',
    summary: '',
    items: [],
    dependencyLinks: [],
  });
  const [isWhiteboardImmersive, setIsWhiteboardImmersive] = useState(false);
  const [whiteboardCollaborationOpen, setWhiteboardCollaborationOpen] = useState(false);
  const [whiteboardShareAccess, setWhiteboardShareAccess] = useState('Editor');
  const [whiteboardCollaborators, setWhiteboardCollaborators] = useState([
    { id: 'collab-you', name: 'You', color: '#7c3aed', access: 'Owner', x: 240, y: 160, online: true },
    { id: 'collab-alex', name: 'Alex', color: '#0ea5e9', access: 'Editor', x: 420, y: 240, online: true },
    { id: 'collab-maya', name: 'Maya', color: '#f97316', access: 'Commenter', x: 620, y: 340, online: true },
  ]);
  const [isWhiteboardPanning, setIsWhiteboardPanning] = useState(false);
  const whiteboardCanvasRef = useRef(null);
  const whiteboardTemplateSourceInputRef = useRef(null);
  const commentDragRef = useRef(null);
  const widgetDragRef = useRef(null);
  const widgetResizeRef = useRef(null);
  const shapeDragRef = useRef(null);
  const shapeResizeRef = useRef(null);
  const panDragRef = useRef(null);
  const eraserActiveRef = useRef(false);
  const eraserLastPointRef = useRef(null);
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

  const whiteboardPenPresets = [
    { key: 'felt-pen', label: 'Felt pen', stroke: '#4f46e5', width: 2.6, icon: PenTool },
    { key: 'ballpoint', label: 'Ballpoint pen', stroke: '#1f2937', width: 1.9, icon: PenTool },
    { key: 'pencil', label: 'Pencil', stroke: '#52525b', width: 1.5, icon: PenTool },
    { key: 'lasso', label: 'Lasso dashed', stroke: '#334155', width: 2.2, dashArray: '8 7', icon: LassoLoopIcon },
    { key: 'marker', label: 'Marker', stroke: '#0f766e', width: 3.8, icon: PenTool },
    { key: 'highlighter', label: 'Highlighter', stroke: '#ca8a04', width: 6.2, opacity: 0.42, icon: Highlighter },
    { key: 'calligraphy', label: 'Calligraphy pen', stroke: '#7c2d12', width: 3.4, icon: PenTool },
  ];
  const whiteboardZoomScale = Math.max(0.3, Math.min(2, whiteboardZoomLevel / 100));
  const whiteboardShapePresets = [
    { key: 'line', label: 'Line', icon: Minus },
    { key: 'arrow', label: 'Arrow', icon: MoveRight },
    { key: 'rectangle', label: 'Rectangle', icon: Square },
    { key: 'ellipse', label: 'Ellipse', icon: Circle },
    { key: 'diamond', label: 'Diamond', icon: Diamond },
    { key: 'triangle', label: 'Triangle', icon: Triangle },
  ];
  const whiteboardStickyColorPresets = [
    { key: 'yellow', label: 'Yellow', value: '#fde047' },
    { key: 'purple', label: 'Purple', value: '#d8b4fe' },
    { key: 'blue', label: 'Blue', value: '#93c5fd' },
    { key: 'green', label: 'Green', value: '#86efac' },
    { key: 'pink', label: 'Pink', value: '#f9a8d4' },
  ];
  const whiteboardFontOptions = [
    'Calibri',
    'Arial',
    'Segoe UI',
    'Times New Roman',
    'Cambria',
    'Georgia',
    'Verdana',
    'Tahoma',
    'Trebuchet MS',
    'Garamond',
    'Courier New',
    'Consolas',
  ];
  const activeWhiteboardPen = whiteboardPenPresets.find((pen) => pen.key === whiteboardPenVariant) || whiteboardPenPresets[0];
  const whiteboardPenSizeOptions = [1.8, 2.6, 4.4, 6.2];
  const whiteboardEraserSizeOptions = [6, 10, 16, 24];
  const whiteboardTextColorPresets = ['#111827', '#1d4ed8', '#7c3aed', '#be123c', '#047857', '#ea580c', '#475569', '#b45309'];
  const whiteboardHighlightColorPresets = ['#ffffff', '#fef08a', '#bfdbfe', '#bbf7d0', '#fecdd3', '#ddd6fe', '#fed7aa', '#e5e7eb'];
  const effectiveWhiteboardPenWidth = whiteboardPenWidthOverride ?? activeWhiteboardPen.width;
  const isWhiteboardFloatingUiOpen = whiteboardTemplateMenuOpen
    || whiteboardAddMenuOpen
    || whiteboardPenMenuOpen
    || whiteboardShapeMenuOpen
    || whiteboardStickyPaletteOpen
    || whiteboardMoreMenuOpen
    || whiteboardEraserMenuOpen;

  const orderedWhiteboardEmojis = useMemo(() => {
    const usageMap = new Map();
    const knownEmojis = [...WHITEBOARD_EMOJI_LIBRARY];
    knownEmojis.forEach((emoji) => {
      usageMap.set(emoji, { emoji, count: 0, lastUsed: 0 });
    });
    whiteboardEmojiUsage.forEach((item) => {
      if (!item || typeof item.emoji !== 'string') {
        return;
      }
      if (!usageMap.has(item.emoji)) {
        knownEmojis.push(item.emoji);
      }
      usageMap.set(item.emoji, {
        emoji: item.emoji,
        count: Number(item.count) || 0,
        lastUsed: Number(item.lastUsed) || 0,
      });
    });
    return knownEmojis.map((emoji) => usageMap.get(emoji) || { emoji, count: 0, lastUsed: 0 }).sort((left, right) => (
      (right.count - left.count)
      || (right.lastUsed - left.lastUsed)
      || left.emoji.localeCompare(right.emoji)
    ));
  }, [whiteboardEmojiUsage]);

  const filteredWhiteboardEmojis = useMemo(() => {
    const query = whiteboardEmojiSearch.trim().toLowerCase();
    if (!query) {
      return orderedWhiteboardEmojis;
    }
    return orderedWhiteboardEmojis.filter((item) => item.emoji.includes(query));
  }, [orderedWhiteboardEmojis, whiteboardEmojiSearch]);

  const getWhiteboardCursor = () => {
    if (whiteboardTool === 'pen') {
      return WHITEBOARD_PEN_CURSORS[whiteboardPenVariant] || WHITEBOARD_PEN_CURSOR;
    }
    if (whiteboardTool === 'sticky') {
      return 'none';
    }
    if (whiteboardTool === 'shapes') {
      return 'crosshair';
    }
    if (whiteboardTool === 'hand') {
      return isWhiteboardPanning ? 'grabbing' : 'grab';
    }
    if (whiteboardTool === 'eraser') {
      return "url(\"data:image/svg+xml,%3Csvg xmlns='http://www.w3.org/2000/svg' width='22' height='22' viewBox='0 0 24 24' fill='none' stroke='%236b7280' stroke-width='2' stroke-linecap='round' stroke-linejoin='round'%3E%3Cpath d='M20 20H7L3 16l9.5-9.5 7.5 7.5-4 4'/%3E%3Cpath d='m6.5 17.5 3-3'/%3E%3C/svg%3E\") 0 20, crosshair";
    }
    if (whiteboardTool === 'comment') {
      return "url(\"data:image/svg+xml,%3Csvg xmlns='http://www.w3.org/2000/svg' width='22' height='22' viewBox='0 0 24 24' fill='none' stroke='%230ea5e9' stroke-width='2' stroke-linecap='round' stroke-linejoin='round'%3E%3Cpath d='M21 15a2 2 0 0 1-2 2H7l-4 4V5a2 2 0 0 1 2-2h14a2 2 0 0 1 2 2z'/%3E%3C/svg%3E\") 2 20, pointer";
    }
    return 'default';
  };

  const getWhiteboardObjectBounds = (object) => {
    if (!object) {
      return { x: 0, y: 0, width: 0, height: 0 };
    }
    return {
      x: object.x ?? 0,
      y: object.y ?? 0,
      width: Math.max(1, object.width || 170),
      height: Math.max(1, object.height || 120),
    };
  };

  const computeWhiteboardAlignmentGuides = useCallback((movingBounds, movingKey) => {
    const candidates = [
      ...whiteboardWidgets.map((widget) => ({ key: widget.id, ...getWhiteboardObjectBounds(widget) })),
      ...whiteboardShapes.map((shape, shapeIndex) => ({ key: `shape-${shapeIndex}`, ...getShapeBounds(shape) })),
    ].filter((candidate) => candidate.key !== movingKey);

    if (!candidates.length) {
      return [];
    }

    const threshold = 8;
    const matches = [];
    const movingEdges = {
      left: movingBounds.x,
      centerX: movingBounds.x + movingBounds.width / 2,
      right: movingBounds.x + movingBounds.width,
      top: movingBounds.y,
      centerY: movingBounds.y + movingBounds.height / 2,
      bottom: movingBounds.y + movingBounds.height,
    };

    const captureMatch = (kind, sourceValue, targetValue, candidate, targetSide) => {
      const delta = Math.abs(sourceValue - targetValue);
      if (delta > threshold) {
        return;
      }
      if (kind === 'vertical') {
        const startY = Math.min(movingBounds.y, candidate.y) - 14;
        const endY = Math.max(movingBounds.y + movingBounds.height, candidate.y + candidate.height) + 14;
        matches.push({
          kind,
          delta,
          x: targetValue,
          y1: startY,
          y2: endY,
          targetSide,
          candidateKey: candidate.key,
        });
        return;
      }
      const startX = Math.min(movingBounds.x, candidate.x) - 14;
      const endX = Math.max(movingBounds.x + movingBounds.width, candidate.x + candidate.width) + 14;
      matches.push({
        kind,
        delta,
        y: targetValue,
        x1: startX,
        x2: endX,
        targetSide,
        candidateKey: candidate.key,
      });
    };

    candidates.forEach((candidate) => {
      const candidateEdges = {
        left: candidate.x,
        centerX: candidate.x + candidate.width / 2,
        right: candidate.x + candidate.width,
        top: candidate.y,
        centerY: candidate.y + candidate.height / 2,
        bottom: candidate.y + candidate.height,
      };
      captureMatch('vertical', movingEdges.left, candidateEdges.left, candidate, 'left');
      captureMatch('vertical', movingEdges.left, candidateEdges.centerX, candidate, 'center');
      captureMatch('vertical', movingEdges.left, candidateEdges.right, candidate, 'right');
      captureMatch('vertical', movingEdges.centerX, candidateEdges.left, candidate, 'left');
      captureMatch('vertical', movingEdges.centerX, candidateEdges.centerX, candidate, 'center');
      captureMatch('vertical', movingEdges.centerX, candidateEdges.right, candidate, 'right');
      captureMatch('vertical', movingEdges.right, candidateEdges.left, candidate, 'left');
      captureMatch('vertical', movingEdges.right, candidateEdges.centerX, candidate, 'center');
      captureMatch('vertical', movingEdges.right, candidateEdges.right, candidate, 'right');

      captureMatch('horizontal', movingEdges.top, candidateEdges.top, candidate, 'top');
      captureMatch('horizontal', movingEdges.top, candidateEdges.centerY, candidate, 'center');
      captureMatch('horizontal', movingEdges.top, candidateEdges.bottom, candidate, 'bottom');
      captureMatch('horizontal', movingEdges.centerY, candidateEdges.top, candidate, 'top');
      captureMatch('horizontal', movingEdges.centerY, candidateEdges.centerY, candidate, 'center');
      captureMatch('horizontal', movingEdges.centerY, candidateEdges.bottom, candidate, 'bottom');
      captureMatch('horizontal', movingEdges.bottom, candidateEdges.top, candidate, 'top');
      captureMatch('horizontal', movingEdges.bottom, candidateEdges.centerY, candidate, 'center');
      captureMatch('horizontal', movingEdges.bottom, candidateEdges.bottom, candidate, 'bottom');
    });

    const pickBest = (kind) => matches
      .filter((match) => match.kind === kind)
      .sort((left, right) => left.delta - right.delta)
      .slice(0, 2);

    return [...pickBest('vertical'), ...pickBest('horizontal')];
  }, [whiteboardShapes, whiteboardWidgets]);

  const getWhiteboardReactionTargetBounds = useCallback((target) => {
    if (!target) {
      return null;
    }
    if (target.kind === 'widget') {
      const widget = whiteboardWidgets.find((item) => item.id === target.id);
      return widget ? getWhiteboardObjectBounds(widget) : null;
    }
    if (target.kind === 'shape') {
      const shape = whiteboardShapes[target.id];
      return shape ? getShapeBounds(shape) : null;
    }
    return null;
  }, [whiteboardShapes, whiteboardWidgets]);

  const setWhiteboardObjectHover = (kind, id) => {
    setWhiteboardHoveredObject({ kind, id });
  };

  const clearWhiteboardObjectHover = (kind, id) => {
    setWhiteboardHoveredObject((prev) => (prev?.kind === kind && prev?.id === id ? null : prev));
  };

  const updateWhiteboardReactionHistory = (emoji) => {
    setWhiteboardEmojiUsage((prev) => {
      const next = [...prev.filter((item) => item && item.emoji !== emoji)];
      const previous = prev.find((item) => item && item.emoji === emoji);
      next.unshift({
        emoji,
        count: (previous?.count || 0) + 1,
        lastUsed: Date.now(),
      });
      return next.slice(0, 48);
    });
  };

  const applyWhiteboardReaction = (emoji) => {
    if (!whiteboardReactionTarget) {
      return;
    }
    if (whiteboardReactionTarget.kind === 'widget') {
      setWhiteboardWidgets((prev) => prev.map((widget) => (
        widget.id === whiteboardReactionTarget.id ? { ...widget, reactionEmoji: emoji } : widget
      )));
    } else if (whiteboardReactionTarget.kind === 'shape') {
      setWhiteboardShapes((prev) => prev.map((shape, shapeIndex) => (
        shapeIndex === whiteboardReactionTarget.id ? { ...shape, reactionEmoji: emoji } : shape
      )));
    }
    updateWhiteboardReactionHistory(emoji);
    setWhiteboardReactionMenuOpen(false);
    setWhiteboardEmojiModalOpen(false);
    setWhiteboardReactionTarget(null);
    showToast(`Reaction set to ${emoji}`);
  };

  useEffect(() => {
    if (activeRightTab !== 'whiteboard') {
      setIsWhiteboardImmersive(false);
      return undefined;
    }
    const timer = window.setInterval(() => {
      setWhiteboardCollaborators((prev) => prev.map((person) => {
        if (person.id === 'collab-you' || !person.online) {
          return person;
        }
        const nextX = Math.max(24, Math.min(980, person.x + (Math.random() * 36 - 18)));
        const nextY = Math.max(24, Math.min(620, person.y + (Math.random() * 36 - 18)));
        return { ...person, x: nextX, y: nextY };
      }));
    }, 2200);
    return () => window.clearInterval(timer);
  }, [activeRightTab]);

  const addWhiteboardWidget = (type, options = {}) => {
    const index = whiteboardWidgets.length;
    const defaultX = 130 + (index % 4) * 188;
    const defaultY = 120 + Math.floor(index / 4) * 132;
    const nextWidget = {
      id: `wb-widget-${Date.now()}-${index}`,
      type,
      x: options.x ?? defaultX,
      y: options.y ?? defaultY,
      width: options.width ?? (type === 'text' ? 260 : 170),
      height: options.height ?? 120,
      color: options.color ?? whiteboardStickyColor,
      text: options.text ?? '',
      fontFamily: options.fontFamily ?? 'Calibri',
      fontSize: options.fontSize ?? 14,
      isBold: options.isBold ?? false,
      isItalic: options.isItalic ?? false,
      isUnderline: options.isUnderline ?? false,
      textAlign: options.textAlign ?? 'left',
      textColor: options.textColor ?? '#111827',
      highlightColor: options.highlightColor ?? '#ffffff',
      opacity: options.opacity ?? 100,
      hasList: options.hasList ?? false,
      listType: options.listType ?? 'bullet',
      linkedUrl: options.linkedUrl ?? '',
      title:
        type === 'sticky' ? 'New sticky note'
        : type === 'text' ? 'Text block'
        : type === 'image' ? 'Image placeholder'
        : 'Connector note',
      body:
        type === 'sticky' ? 'Capture key idea...'
        : type === 'text' ? 'Type your annotation...'
        : type === 'image' ? 'Drop an image here'
        : 'Link to related node',
    };
    setWhiteboardWidgets((prev) => [...prev, nextWidget]);
    if (type === 'sticky' || type === 'text') {
      setWhiteboardEditingWidgetId(nextWidget.id);
      showToast(type === 'text' ? 'Text box ready to edit' : 'Sticky note ready to edit');
      return;
    }
    showToast(`${nextWidget.title} added`);
  };

  const whiteboardTemplateCatalog = useMemo(
    () => [...WHITEBOARD_TEMPLATE_LIBRARY, ...whiteboardCustomTemplates],
    [whiteboardCustomTemplates],
  );

  const cloneTemplateWidgets = useCallback((widgets = [], templateKey = 'template') => widgets.map((widget, index) => ({
    ...widget,
    id: `wb-template-${templateKey}-${Date.now()}-${index}`,
  })), []);

  const buildAiTemplateWidgets = useCallback((prompt, sources = []) => {
    const sourceNames = sources.map((item) => item.name).filter(Boolean);
    const chunks = String(prompt || '')
      .split(/\n|,|;|\.|\|/)
      .map((segment) => segment.trim())
      .filter(Boolean);
    const base = chunks.length ? chunks.slice(0, 4) : ['Goals', 'Audience', 'Flow', 'Deliverables'];
    const widgets = [
      {
        type: 'text',
        x: 56,
        y: 36,
        width: 340,
        height: 100,
        text: `AI Template\n${prompt.trim() || 'Generated from attached sources'}`,
        fontFamily: 'Calibri',
        fontSize: 15,
        isBold: true,
        isItalic: false,
        isUnderline: false,
        textAlign: 'left',
        textColor: '#111827',
        highlightColor: '#ffffff',
        opacity: 100,
        hasList: false,
        listType: 'bullet',
        linkedUrl: '',
      },
      {
        type: 'sticky',
        x: 430,
        y: 36,
        width: 280,
        height: 100,
        color: '#bfdbfe',
        text: sourceNames.length ? `Sources\n${sourceNames.slice(0, 5).join('\n')}` : 'Sources\nCustomer input',
        fontFamily: 'Calibri',
        fontSize: 13,
        isBold: false,
        isItalic: false,
        isUnderline: false,
        textAlign: 'left',
        textColor: '#111827',
        highlightColor: '#ffffff',
        opacity: 100,
        hasList: false,
        listType: 'bullet',
        linkedUrl: '',
      },
      ...base.map((item, index) => ({
        type: 'sticky',
        x: 56 + index * 220,
        y: 170,
        width: 200,
        height: 120,
        color: ['#fde68a', '#bbf7d0', '#fbcfe8', '#c4b5fd'][index % 4],
        text: `${item}\nAction items\nOwner\nTimeline`,
        fontFamily: 'Calibri',
        fontSize: 13,
        isBold: false,
        isItalic: false,
        isUnderline: false,
        textAlign: 'left',
        textColor: '#111827',
        highlightColor: '#ffffff',
        opacity: 100,
        hasList: false,
        listType: 'bullet',
        linkedUrl: '',
      })),
    ];
    return cloneTemplateWidgets(widgets, 'ai-generated');
  }, [cloneTemplateWidgets]);

  const handleWhiteboardTemplateSourceUpload = (event) => {
    const files = Array.from(event.target.files || []);
    if (!files.length) {
      return;
    }
    const uploaded = files.map((file, index) => ({
      id: `wb-template-source-${Date.now()}-${index}`,
      name: file.name,
      kind: file.type || 'file',
    }));
    setWhiteboardTemplateSources((prev) => [...prev, ...uploaded].slice(-8));
    showToast(`${uploaded.length} source file${uploaded.length > 1 ? 's' : ''} attached`);
    event.target.value = '';
  };

  const generateAiWhiteboardTemplate = () => {
    const prompt = whiteboardTemplatePrompt.trim();
    if (!prompt && !whiteboardTemplateSources.length) {
      showToast('Add customer input or attach source files first');
      return;
    }
    const templateKey = `ai-template-${Date.now()}`;
    const normalizedSignal = `${prompt} ${whiteboardTemplateSources.map((source) => source.name).join(' ')}`.toLowerCase();
    const category = /personal|habit|routine|journal|self/.test(normalizedSignal)
      ? 'Personal'
      : /enterprise|stakeholder|department|okr|team|company/.test(normalizedSignal)
        ? 'Enterprise'
        : 'Startup';
    const labelCore = (prompt || whiteboardTemplateSources[0]?.name || 'Custom board')
      .replace(/\.[a-z0-9]+$/i, '')
      .slice(0, 28)
      .trim();
    const widgets = buildAiTemplateWidgets(prompt, whiteboardTemplateSources);
    const nextTemplate = {
      key: templateKey,
      category,
      label: `AI ${labelCore || 'Template'}`,
      detail: `Generated from customer input${whiteboardTemplateSources.length ? ' + files' : ''}`,
      preview: ['#bfdbfe', '#fde68a', '#bbf7d0', '#fbcfe8'],
      widgets,
      sourceSummary: {
        prompt,
        files: whiteboardTemplateSources.map((source) => source.name),
      },
    };
    setWhiteboardCustomTemplates((prev) => [nextTemplate, ...prev].slice(0, 24));
    setWhiteboardWidgets(widgets);
    setWhiteboardStrokes([]);
    setWhiteboardShapes([]);
    setWhiteboardRedoStrokes([]);
    setWhiteboardCurrentStroke('');
    setWhiteboardCurrentShape(null);
    setWhiteboardComments([]);
    setWhiteboardActiveCommentId(null);
    setSelectedWidgetId(null);
    setSelectedShapeIndex(null);
    setWhiteboardTemplatePrompt('');
    setWhiteboardTemplateSources([]);
    setWhiteboardTemplateMenuOpen(false);
    showToast('AI template generated and saved');
  };

  const saveCurrentWhiteboardAsTemplate = () => {
    if (!whiteboardWidgets.length) {
      showToast('Add content before saving a template');
      return;
    }
    const templateName = window.prompt('Template name', 'Saved board template');
    if (!templateName || !templateName.trim()) {
      return;
    }
    const templateKey = `saved-template-${Date.now()}`;
    const preview = whiteboardWidgets
      .filter((widget) => widget.type === 'sticky' && widget.color)
      .slice(0, 4)
      .map((widget) => widget.color);
    const savedTemplate = {
      key: templateKey,
      category: 'Saved',
      label: templateName.trim().slice(0, 36),
      detail: 'Saved from your current board',
      preview: preview.length ? preview : ['#c4b5fd', '#93c5fd', '#fcd34d', '#86efac'],
      widgets: cloneTemplateWidgets(whiteboardWidgets.map((widget) => ({ ...widget })), templateKey),
    };
    setWhiteboardCustomTemplates((prev) => [savedTemplate, ...prev].slice(0, 24));
    showToast('Template saved');
  };

  const summarizeWhiteboardTaskPreview = useCallback((items, dependencyLinks = []) => ({
    tasks: items.filter((item) => item.type === 'task').length,
    milestones: items.filter((item) => item.type === 'milestone').length,
    risks: items.filter((item) => item.type === 'risk').length,
    phases: new Set(items.map((item) => item.phase).filter(Boolean)).size,
    dependencies: items.reduce((count, item) => count + (item.dependencies?.length || 0), 0) || dependencyLinks.length,
  }), []);

  const inferWhiteboardDueLabel = useCallback((text) => {
    const value = String(text || '');
    const weekdayMatch = value.match(/\b(Monday|Tuesday|Wednesday|Thursday|Friday|Saturday|Sunday|today|tomorrow)\b/i);
    if (weekdayMatch) {
      return weekdayMatch[1];
    }
    const dateMatch = value.match(/\b(?:Jan|Feb|Mar|Apr|May|Jun|Jul|Aug|Sep|Oct|Nov|Dec)[a-z]*\s+\d{1,2}(?:,\s*\d{4})?/i);
    return dateMatch ? dateMatch[0] : '';
  }, []);

  const inferWhiteboardAssignee = useCallback((text) => {
    const value = String(text || '');
    const match = value.match(/(?:@|owner\s*:\s*|assignee\s*:\s*|by\s+)([A-Z][a-z]+(?:\s+[A-Z][a-z]+)?)/);
    return match ? match[1] : '';
  }, []);

  const inferWhiteboardPriority = useCallback((text) => {
    const value = String(text || '').toLowerCase();
    if (/critical|urgent|asap|blocker|high priority/.test(value)) return 'high';
    if (/soon|important|follow up|review/.test(value)) return 'medium';
    return 'low';
  }, []);

  const classifyWhiteboardItem = useCallback((text, widgetType = 'sticky') => {
    const value = String(text || '').toLowerCase();
    if (/risk|issue|blocker|concern|dependency risk/.test(value)) return 'risk';
    if (/milestone|launch|deadline|ship|go live|release/.test(value)) return 'milestone';
    if (widgetType === 'task') return 'task';
    return 'task';
  }, []);

  const getWhiteboardItemLabel = useCallback((text, fallback = 'Untitled item') => {
    const lines = String(text || '').split('\n').map((line) => line.trim()).filter(Boolean);
    return lines[0] || fallback;
  }, []);

  const analyzeWhiteboardToTasks = useCallback(() => {
    const boardWidgets = whiteboardWidgets || [];
    const projectName = getWhiteboardItemLabel(
      boardWidgets.find((widget) => widget.type === 'text' && (widget.width || 0) >= 240)?.text
        || boardWidgets[0]?.text
        || 'Whiteboard Project',
      'Whiteboard Project',
    );

    const phaseAnchors = boardWidgets
      .map((widget) => ({
        title: getWhiteboardItemLabel(widget.text || widget.title, ''),
        x: (widget.x || 0) + ((widget.width || 170) / 2),
        y: widget.y || 0,
      }))
      .filter((item) => item.title && item.y <= 180);

    const findPhaseForX = (x) => {
      const nearest = phaseAnchors
        .map((anchor) => ({ ...anchor, distance: Math.abs(anchor.x - x) }))
        .sort((a, b) => a.distance - b.distance)[0];
      if (nearest && nearest.distance < 220) {
        return nearest.title;
      }
      const bucket = Math.max(1, Math.min(4, Math.floor((x || 0) / 260) + 1));
      return `Phase ${bucket}`;
    };

    const widgetCenters = boardWidgets.map((widget) => ({
      id: widget.id,
      label: getWhiteboardItemLabel(widget.text || widget.title || widget.body, widget.title || 'Item'),
      x: (widget.x || 0) + ((widget.width || 170) / 2),
      y: (widget.y || 0) + ((widget.height || 120) / 2),
    }));

    const findNearestWidget = (x, y) => widgetCenters
      .map((widget) => ({ ...widget, distance: Math.hypot(widget.x - x, widget.y - y) }))
      .sort((a, b) => a.distance - b.distance)[0];

    const dependencyLinks = (whiteboardShapes || [])
      .filter((shape) => shape.type === 'arrow' || shape.type === 'line')
      .map((shape) => {
        const from = findNearestWidget(shape.x1 ?? shape.x ?? 0, shape.y1 ?? shape.y ?? 0);
        const to = findNearestWidget(shape.x2 ?? ((shape.x ?? 0) + (shape.width ?? 0)), shape.y2 ?? ((shape.y ?? 0) + (shape.height ?? 0)));
        if (!from || !to || from.id === to.id) {
          return null;
        }
        return { fromId: from.id, from: from.label, toId: to.id, to: to.label };
      })
      .filter(Boolean)
      .filter((item, index, array) => array.findIndex((candidate) => candidate.fromId === item.fromId && candidate.toId === item.toId) === index);

    const previewItems = [
      ...boardWidgets.map((widget, index) => {
        const sourceText = String(widget.text || widget.body || widget.title || '').trim();
        if (!sourceText) {
          return null;
        }
        const label = getWhiteboardItemLabel(sourceText, widget.title || `Item ${index + 1}`);
        const lines = sourceText.split('\n').map((line) => line.trim()).filter(Boolean);
        const subtasks = lines.slice(1).filter((line) => !/^owner\s*:|assignee\s*:|due\s*:|priority\s*:/i.test(line));
        return {
          id: `wb-task-preview-${widget.id}`,
          sourceId: widget.id,
          title: label,
          type: classifyWhiteboardItem(sourceText, widget.type),
          phase: findPhaseForX((widget.x || 0) + ((widget.width || 170) / 2)),
          assignee: inferWhiteboardAssignee(sourceText),
          dueLabel: inferWhiteboardDueLabel(sourceText),
          priority: inferWhiteboardPriority(sourceText),
          notes: sourceText,
          subtasks,
          dependencies: dependencyLinks.filter((link) => link.toId === widget.id).map((link) => link.from),
        };
      }),
      ...whiteboardComments.map((comment) => {
        const sourceText = String(comment.text || '').trim();
        if (!sourceText) {
          return null;
        }
        return {
          id: `wb-task-preview-comment-${comment.id}`,
          sourceId: comment.id,
          title: getWhiteboardItemLabel(sourceText, 'Comment insight'),
          type: classifyWhiteboardItem(sourceText, 'comment'),
          phase: findPhaseForX(comment.x || 0),
          assignee: inferWhiteboardAssignee(sourceText),
          dueLabel: inferWhiteboardDueLabel(sourceText),
          priority: inferWhiteboardPriority(sourceText),
          notes: sourceText,
          subtasks: [],
          dependencies: [],
        };
      }),
    ].filter(Boolean);

    const mergedPreviewItems = previewItems.filter((item, index, array) => array.findIndex((candidate) => candidate.title.toLowerCase() === item.title.toLowerCase() && candidate.type === item.type) === index);
    const stats = summarizeWhiteboardTaskPreview(mergedPreviewItems, dependencyLinks);
    return {
      projectName,
      summary: `${mergedPreviewItems.length} structured items inferred from notes, connectors, and comments.`,
      items: mergedPreviewItems,
      dependencyLinks,
      stats,
    };
  }, [classifyWhiteboardItem, getWhiteboardItemLabel, inferWhiteboardAssignee, inferWhiteboardDueLabel, inferWhiteboardPriority, summarizeWhiteboardTaskPreview, whiteboardComments, whiteboardShapes, whiteboardWidgets]);

  const openWhiteboardTaskPreview = () => {
    const preview = analyzeWhiteboardToTasks();
    if (!preview.items.length) {
      showToast('Add whiteboard content before converting to tasks');
      return;
    }
    setWhiteboardTaskPreview(preview);
    setWhiteboardTaskPreviewOpen(true);
  };

  const updateWhiteboardTaskPreviewItem = (itemId, updates) => {
    setWhiteboardTaskPreview((prev) => ({
      ...prev,
      items: prev.items.map((item) => (item.id === itemId ? { ...item, ...updates } : item)),
    }));
  };

  const removeWhiteboardTaskPreviewItem = (itemId) => {
    setWhiteboardTaskPreview((prev) => {
      const target = prev.items.find((item) => item.id === itemId);
      return {
        ...prev,
        items: prev.items.filter((item) => item.id !== itemId),
        dependencyLinks: prev.dependencyLinks.filter((link) => link.fromId !== target?.sourceId && link.toId !== target?.sourceId),
      };
    });
  };

  const mergeWhiteboardTaskPreviewDuplicates = () => {
    setWhiteboardTaskPreview((prev) => {
      const merged = [];
      prev.items.forEach((item) => {
        const existing = merged.find((candidate) => candidate.title.trim().toLowerCase() === item.title.trim().toLowerCase() && candidate.type === item.type);
        if (!existing) {
          merged.push({ ...item });
          return;
        }
        existing.subtasks = Array.from(new Set([...(existing.subtasks || []), ...(item.subtasks || [])]));
        existing.dependencies = Array.from(new Set([...(existing.dependencies || []), ...(item.dependencies || [])]));
        existing.notes = [existing.notes, item.notes].filter(Boolean).join('\n');
        if (!existing.assignee && item.assignee) existing.assignee = item.assignee;
        if (!existing.dueLabel && item.dueLabel) existing.dueLabel = item.dueLabel;
        if (existing.priority === 'low' && item.priority !== 'low') existing.priority = item.priority;
      });
      return { ...prev, items: merged };
    });
    showToast('Duplicate task ideas merged');
  };

  const importWhiteboardPreviewToTasks = () => {
    const previewItems = whiteboardTaskPreview.items || [];
    if (!previewItems.length) {
      showToast('Nothing to import');
      return;
    }
    setTasks((prev) => {
      const existing = new Set(prev.map((task) => String(task.text || '').toLowerCase()));
      const additions = previewItems
        .map((item, index) => {
          const segments = [
            item.type === 'milestone' ? 'Milestone' : item.type === 'risk' ? 'Risk' : 'Task',
            item.priority ? item.priority.toUpperCase() : '',
            item.phase || '',
          ].filter(Boolean);
          const meta = [
            item.assignee ? `Owner: ${item.assignee}` : '',
            item.dueLabel ? `Due: ${item.dueLabel}` : '',
            item.dependencies?.length ? `Depends on: ${item.dependencies.join(', ')}` : '',
            item.subtasks?.length ? `Subtasks: ${item.subtasks.join(' | ')}` : '',
          ].filter(Boolean).join(' • ');
          const text = `[${segments.join(' • ')}] ${item.title}${meta ? ` — ${meta}` : ''}`;
          return {
            id: Date.now() + index,
            text,
            completed: false,
            owner: item.assignee ? 'user' : 'agent',
          };
        })
        .filter((task) => !existing.has(String(task.text || '').toLowerCase()));
      return additions.length ? [...additions, ...prev] : prev;
    });
    setWhiteboardTaskPreviewOpen(false);
    setActiveRightTab('tasks');
    showToast('Whiteboard plan imported into Tasks');
  };

  const whiteboardTaskPreviewStats = summarizeWhiteboardTaskPreview(
    whiteboardTaskPreview.items || [],
    whiteboardTaskPreview.dependencyLinks || [],
  );

  const activateWhiteboardTool = (toolKey) => {
    setWhiteboardTool(toolKey);
    setWhiteboardPenMenuOpen(false);
    setWhiteboardMoreMenuOpen(false);
    setWhiteboardShapeMenuOpen(false);
    setWhiteboardAddMenuOpen(false);
    setWhiteboardTemplateMenuOpen(false);
    setWhiteboardEraserMenuOpen(toolKey === 'eraser');
    if (toolKey !== 'sticky') {
      setWhiteboardStickyPaletteOpen(false);
      setWhiteboardStickyDragStart(null);
      setWhiteboardStickyPreview(null);
    }
    if (toolKey === 'pen') {
      showToast('Pen tool active');
      return;
    }
    if (toolKey === 'shapes') {
      setWhiteboardShapeMenuOpen(true);
      showToast('Shape tools opened');
      return;
    }
    if (toolKey === 'sticky') {
      setWhiteboardStickyPaletteOpen(true);
      showToast('Sticky note tool active');
      return;
    }
    if (toolKey === 'text' || toolKey === 'image' || toolKey === 'link') {
      addWhiteboardWidget(toolKey);
      return;
    }
    if (toolKey === 'more') {
      setWhiteboardMoreMenuOpen(true);
      showToast('More whiteboard actions opened');
      return;
    }
    if (toolKey === 'select') {
      showToast('Select tool — tap widgets to select, drag to move');
      return;
    }
    if (toolKey === 'hand') {
      showToast('Hand tool — drag to pan canvas');
      return;
    }
    if (toolKey === 'eraser') {
      showToast('Eraser tool — draw over strokes to erase');
      return;
    }
    if (toolKey === 'comment') {
      showToast('Comment tool — click to place a comment');
      return;
    }
    showToast(`${toolKey.charAt(0).toUpperCase()}${toolKey.slice(1)} tool active`);
  };

  const handleWhiteboardUndo = () => {
    setWhiteboardCurrentStroke('');
    setIsWhiteboardDrawing(false);
    setWhiteboardStrokes((prev) => {
      if (!prev.length) {
        showToast('Nothing to undo');
        return prev;
      }
      const next = [...prev];
      const lastStroke = next.pop();
      if (lastStroke) {
        setWhiteboardRedoStrokes((redo) => [...redo, lastStroke]);
      }
      return next;
    });
  };

  const handleWhiteboardRedo = () => {
    setWhiteboardRedoStrokes((prev) => {
      if (!prev.length) {
        showToast('Nothing to redo');
        return prev;
      }
      const next = [...prev];
      const stroke = next.pop();
      if (stroke) {
        setWhiteboardStrokes((existing) => [...existing, stroke]);
      }
      return next;
    });
  };

  const createStickyNote = (x, y, width, height) => {
    addWhiteboardWidget('sticky', {
      x,
      y,
      width,
      height,
      color: whiteboardStickyColor,
      text: '',
    });
  };

  const createLinkedStickyNote = (sourceWidget, anchorKey) => {
    if (!sourceWidget) {
      return;
    }

    const sourceWidth = sourceWidget.width || 170;
    const sourceHeight = sourceWidget.height || 120;
    const sourceAnchor = ({
      top: { x: sourceWidget.x + sourceWidth / 2, y: sourceWidget.y },
      right: { x: sourceWidget.x + sourceWidth, y: sourceWidget.y + sourceHeight / 2 },
      bottom: { x: sourceWidget.x + sourceWidth / 2, y: sourceWidget.y + sourceHeight },
      left: { x: sourceWidget.x, y: sourceWidget.y + sourceHeight / 2 },
    })[anchorKey] || { x: sourceWidget.x + sourceWidth, y: sourceWidget.y + sourceHeight / 2 };

    const noteWidth = 172;
    const noteHeight = 118;
    const noteX = sourceAnchor.x + 132;
    const noteY = sourceAnchor.y - noteHeight / 2;
    const noteId = `wb-widget-${Date.now()}-${Math.round(Math.random() * 1000)}`;
    const linePadding = 14;

    setWhiteboardWidgets((prev) => ([
      ...prev,
      {
        id: noteId,
        type: 'sticky',
        x: noteX,
        y: noteY,
        width: noteWidth,
        height: noteHeight,
        color: whiteboardStickyColor,
        text: '',
      },
    ]));

    setWhiteboardShapes((prev) => ([
      ...prev,
      {
        type: 'line',
        x1: sourceAnchor.x,
        y1: sourceAnchor.y,
        x2: noteX - linePadding,
        y2: noteY + noteHeight / 2,
        stroke: '#2563eb',
        strokeWidth: 2.6,
        fill: 'transparent',
        fillOpacity: 1,
        opacity: 1,
      },
    ]));

    setSelectedWidgetId(noteId);
    setWhiteboardEditingWidgetId(noteId);
    showToast('Connected note added');
  };

  const distanceToSegment = (px, py, ax, ay, bx, by) => {
    const dx = bx - ax;
    const dy = by - ay;
    if (dx === 0 && dy === 0) {
      return Math.hypot(px - ax, py - ay);
    }
    const t = Math.max(0, Math.min(1, ((px - ax) * dx + (py - ay) * dy) / (dx * dx + dy * dy)));
    const cx = ax + t * dx;
    const cy = ay + t * dy;
    return Math.hypot(px - cx, py - cy);
  };

  const getPathPoints = (path = '') => {
    const nums = String(path).match(/-?\d*\.?\d+/g) || [];
    const points = [];
    for (let i = 0; i < nums.length - 1; i += 2) {
      points.push({ x: Number(nums[i]), y: Number(nums[i + 1]) });
    }
    return points;
  };

  const isPointNearStroke = (stroke, x, y, radius) => {
    const path = typeof stroke === 'string' ? stroke : stroke.path;
    const points = getPathPoints(path);
    if (!points.length) {
      return false;
    }
    if (points.length === 1) {
      return Math.hypot(points[0].x - x, points[0].y - y) <= radius;
    }
    for (let i = 0; i < points.length - 1; i += 1) {
      if (distanceToSegment(x, y, points[i].x, points[i].y, points[i + 1].x, points[i + 1].y) <= radius) {
        return true;
      }
    }
    return false;
  };

  const isPointNearShape = (shape, x, y, radius) => {
    if (!shape) {
      return false;
    }
    if (shape.type === 'line' || shape.type === 'arrow') {
      return distanceToSegment(x, y, shape.x1, shape.y1, shape.x2, shape.y2) <= radius;
    }
    const left = shape.x ?? Math.min(shape.x1 ?? 0, shape.x2 ?? 0);
    const top = shape.y ?? Math.min(shape.y1 ?? 0, shape.y2 ?? 0);
    const width = shape.width ?? Math.abs((shape.x2 ?? 0) - (shape.x1 ?? 0));
    const height = shape.height ?? Math.abs((shape.y2 ?? 0) - (shape.y1 ?? 0));
    return x >= left - radius && x <= left + width + radius && y >= top - radius && y <= top + height + radius;
  };

  const isPointNearWidget = (widget, x, y, radius) => (
    x >= widget.x - radius
      && x <= widget.x + (widget.width || 170) + radius
      && y >= widget.y - radius
      && y <= widget.y + (widget.height || 120) + radius
  );

  const getShapeBounds = (shape) => {
    if (!shape) {
      return { x: 0, y: 0, width: 1, height: 1 };
    }
    if (shape.type === 'line' || shape.type === 'arrow') {
      const x = Math.min(shape.x1 ?? 0, shape.x2 ?? 0);
      const y = Math.min(shape.y1 ?? 0, shape.y2 ?? 0);
      const width = Math.max(1, Math.abs((shape.x2 ?? 0) - (shape.x1 ?? 0)));
      const height = Math.max(1, Math.abs((shape.y2 ?? 0) - (shape.y1 ?? 0)));
      return { x, y, width, height };
    }
    return {
      x: shape.x ?? 0,
      y: shape.y ?? 0,
      width: Math.max(1, shape.width ?? 1),
      height: Math.max(1, shape.height ?? 1),
    };
  };

  const moveShapeByDelta = (shape, dx, dy) => {
    if (!shape) {
      return shape;
    }
    if (shape.type === 'line' || shape.type === 'arrow') {
      return {
        ...shape,
        x1: (shape.x1 ?? 0) + dx,
        y1: (shape.y1 ?? 0) + dy,
        x2: (shape.x2 ?? 0) + dx,
        y2: (shape.y2 ?? 0) + dy,
      };
    }
    return {
      ...shape,
      x: (shape.x ?? 0) + dx,
      y: (shape.y ?? 0) + dy,
    };
  };

  const resizeShapeFromBounds = (shape, sourceBounds, targetBounds) => {
    if (!shape) {
      return shape;
    }
    if (shape.type === 'line' || shape.type === 'arrow') {
      const sx = sourceBounds.width || 1;
      const sy = sourceBounds.height || 1;
      const tx = targetBounds.width;
      const ty = targetBounds.height;
      const transformPoint = (px, py) => ({
        x: targetBounds.x + (((px - sourceBounds.x) / sx) * tx),
        y: targetBounds.y + (((py - sourceBounds.y) / sy) * ty),
      });
      const p1 = transformPoint(shape.x1 ?? 0, shape.y1 ?? 0);
      const p2 = transformPoint(shape.x2 ?? 0, shape.y2 ?? 0);
      return {
        ...shape,
        x1: p1.x,
        y1: p1.y,
        x2: p2.x,
        y2: p2.y,
      };
    }
    return {
      ...shape,
      x: targetBounds.x,
      y: targetBounds.y,
      width: targetBounds.width,
      height: targetBounds.height,
    };
  };

  const applyEraserToStroke = (stroke, x, y, radius) => {
    const path = typeof stroke === 'string' ? stroke : stroke.path;
    const points = getPathPoints(path);
    if (!points.length) {
      return [];
    }

    const segments = [];
    let current = [];
    points.forEach((point) => {
      const shouldErase = Math.hypot(point.x - x, point.y - y) <= radius;
      if (shouldErase) {
        if (current.length > 1) {
          segments.push(current);
        }
        current = [];
        return;
      }
      current.push(point);
    });
    if (current.length > 1) {
      segments.push(current);
    }

    const baseStroke = typeof stroke === 'string'
      ? { stroke: '#7c3aed', width: 2.5, opacity: 1 }
      : { stroke: stroke.stroke, width: stroke.width, opacity: stroke.opacity };

    return segments.map((segment) => ({
      ...baseStroke,
      path: `M ${segment[0].x} ${segment[0].y}${segment.slice(1).map((p) => ` L ${p.x} ${p.y}`).join('')}`,
    }));
  };

  const applyEraserToShape = (shape, x, y, amount = 8, radius = 10) => {
    if (!shape || !isPointNearShape(shape, x, y, radius)) {
      return shape;
    }

    if (shape.type === 'line' || shape.type === 'arrow') {
      const dx = (shape.x2 ?? 0) - (shape.x1 ?? 0);
      const dy = (shape.y2 ?? 0) - (shape.y1 ?? 0);
      const len = Math.hypot(dx, dy);
      if (len <= amount + 4) {
        return null;
      }
      const nx = dx / len;
      const ny = dy / len;
      return {
        ...shape,
        x2: (shape.x2 ?? 0) - nx * amount,
        y2: (shape.y2 ?? 0) - ny * amount,
      };
    }

    const width = Math.max(1, (shape.width ?? 0) - amount);
    const height = Math.max(1, (shape.height ?? 0) - amount);
    if (width < 14 || height < 14) {
      return null;
    }

    return {
      ...shape,
      x: (shape.x ?? 0) + amount / 2,
      y: (shape.y ?? 0) + amount / 2,
      width,
      height,
    };
  };

  const applyEraserToWidget = (widget, x, y, amount = 2, radius = 12) => {
    if (!isPointNearWidget(widget, x, y, radius)) {
      return widget;
    }

    if ((widget.type === 'sticky' || widget.type === 'text') && String(widget.text || '').length) {
      const trimmed = String(widget.text || '').slice(0, Math.max(0, String(widget.text || '').length - amount));
      return {
        ...widget,
        text: trimmed,
      };
    }

    const nextOpacity = Math.max(0, Number(widget.opacity ?? 100) - 8);
    if (nextOpacity <= 0) {
      return null;
    }

    return {
      ...widget,
      opacity: nextOpacity,
    };
  };

  const eraseWhiteboardAtPoint = (x, y) => {
    const last = eraserLastPointRef.current;
    const dx = last ? x - last.x : 0;
    const dy = last ? y - last.y : 0;
    const distance = Math.hypot(dx, dy);
    const steps = Math.max(1, Math.ceil(distance / 6));
    const points = Array.from({ length: steps }, (_, index) => {
      const t = (index + 1) / steps;
      return {
        x: (last ? last.x : x) + dx * t,
        y: (last ? last.y : y) + dy * t,
      };
    });

    const eraserRadius = Math.max(4, Number(whiteboardEraserSize) || 9);
    points.forEach((point) => {
      setWhiteboardStrokes((prev) => prev.flatMap((stroke) => applyEraserToStroke(stroke, point.x, point.y, eraserRadius)));
      setWhiteboardShapes((prev) => prev
        .map((shape) => applyEraserToShape(shape, point.x, point.y, Math.max(4, eraserRadius * 0.9), eraserRadius))
        .filter(Boolean));
      setWhiteboardComments((prev) => prev.filter((comment) => Math.hypot(comment.x - point.x, comment.y - point.y) > eraserRadius + 2));
      setWhiteboardWidgets((prev) => prev
        .map((widget) => applyEraserToWidget(widget, point.x, point.y, Math.max(1, Math.round(eraserRadius / 5)), eraserRadius + 3))
        .filter(Boolean));
    });

    eraserLastPointRef.current = { x, y };
  };

  const exportWhiteboardQuick = async (mode = 'png') => {
    const target = whiteboardCanvasRef.current?.parentElement;
    if (!target) {
      showToast('Whiteboard is not ready for export yet');
      return;
    }

    try {
      showToast(mode === 'pdf' ? 'Exporting whiteboard PDF...' : 'Snapping whiteboard...');
      const canvas = await html2canvas(target, {
        scale: 2,
        backgroundColor: '#ffffff',
        useCORS: true,
      });

      const safeStamp = new Date().toISOString().replace(/[:.]/g, '-');
      if (mode === 'pdf') {
        const imageData = canvas.toDataURL('image/png');
        const pdf = new jsPDF({ orientation: 'landscape', unit: 'mm', format: 'a4' });
        const pageWidth = pdf.internal.pageSize.getWidth();
        const pageHeight = pdf.internal.pageSize.getHeight();
        const imageProps = pdf.getImageProperties(imageData);
        const widthRatio = pageWidth / imageProps.width;
        const heightRatio = pageHeight / imageProps.height;
        const ratio = Math.min(widthRatio, heightRatio);
        const drawWidth = imageProps.width * ratio;
        const drawHeight = imageProps.height * ratio;
        const x = (pageWidth - drawWidth) / 2;
        const y = (pageHeight - drawHeight) / 2;
        pdf.addImage(imageData, 'PNG', x, y, drawWidth, drawHeight, undefined, 'FAST');
        pdf.save(`whiteboard-${safeStamp}.pdf`);
      } else {
        canvas.toBlob((blob) => {
          if (!blob) {
            showToast('Unable to create whiteboard snapshot');
            return;
          }
          triggerBlobDownload(`whiteboard-${safeStamp}.png`, blob);
        }, 'image/png', 0.95);
      }

      showToast(mode === 'pdf' ? 'Whiteboard PDF exported' : 'Whiteboard snapshot saved');
    } catch (_error) {
      showToast('Whiteboard export failed');
    }
  };

  const stripListPrefix = (line) => String(line).replace(/^\s*(?:[-*•]\s+|\d+\.\s+)/, '');

  const toggleWidgetList = (widgetId, nextType) => {
    setWhiteboardWidgets((prev) => prev.map((w) => {
      if (w.id !== widgetId) {
        return w;
      }
      const lines = String(w.text || '').split('\n');
      const normalized = lines.map(stripListPrefix);
      if (w.hasList && w.listType === nextType) {
        return { ...w, hasList: false, text: normalized.join('\n') };
      }
      if (nextType === 'numbered') {
        return { ...w, hasList: true, listType: 'numbered', text: normalized.map((line, i) => `${i + 1}. ${line}`).join('\n') };
      }
      return { ...w, hasList: true, listType: 'bullet', text: normalized.map((line) => `• ${line}`).join('\n') };
    }));
  };

  const renderWhiteboardShape = (shape, key) => {
    const sharedProps = {
      key,
      stroke: shape.stroke,
      strokeWidth: shape.strokeWidth,
      fill: shape.fill ?? 'transparent',
      fillOpacity: shape.fillOpacity ?? 1,
      strokeOpacity: shape.opacity ?? 1,
      strokeLinecap: 'round',
      strokeLinejoin: 'round',
    };
    if (shape.type === 'line' || shape.type === 'arrow') {
      return <line {...sharedProps} x1={shape.x1} y1={shape.y1} x2={shape.x2} y2={shape.y2} />;
    }
    if (shape.type === 'rectangle') {
      return <rect {...sharedProps} x={shape.x} y={shape.y} width={shape.width} height={shape.height} rx="10" ry="10" />;
    }
    if (shape.type === 'ellipse') {
      return <ellipse {...sharedProps} cx={shape.x + shape.width / 2} cy={shape.y + shape.height / 2} rx={shape.width / 2} ry={shape.height / 2} />;
    }
    if (shape.type === 'diamond') {
      const cx = shape.x + shape.width / 2;
      const cy = shape.y + shape.height / 2;
      const points = `${cx},${shape.y} ${shape.x + shape.width},${cy} ${cx},${shape.y + shape.height} ${shape.x},${cy}`;
      return <polygon {...sharedProps} points={points} />;
    }
    const trianglePoints = `${shape.x + shape.width / 2},${shape.y} ${shape.x + shape.width},${shape.y + shape.height} ${shape.x},${shape.y + shape.height}`;
    return <polygon {...sharedProps} points={trianglePoints} />;
  };

  useEffect(() => {
    if (selectedWidgetId && !whiteboardWidgets.some((widget) => widget.id === selectedWidgetId)) {
      setSelectedWidgetId(null);
      setWhiteboardEditingWidgetId(null);
      setWhiteboardStickyColorMenuFor(null);
      setWhiteboardMoreTextMenuFor(null);
      setWhiteboardTextColorMenuFor(null);
      setWhiteboardHighlightColorMenuFor(null);
    }
  }, [selectedWidgetId, whiteboardWidgets]);

  useEffect(() => {
    if (whiteboardReactionTarget?.kind === 'widget' && !whiteboardWidgets.some((widget) => widget.id === whiteboardReactionTarget.id)) {
      setWhiteboardReactionTarget(null);
      setWhiteboardReactionMenuOpen(false);
      setWhiteboardEmojiModalOpen(false);
      setWhiteboardEmojiSearch('');
    }
    if (whiteboardReactionTarget?.kind === 'shape' && !whiteboardShapes[whiteboardReactionTarget.id]) {
      setWhiteboardReactionTarget(null);
      setWhiteboardReactionMenuOpen(false);
      setWhiteboardEmojiModalOpen(false);
      setWhiteboardEmojiSearch('');
    }
  }, [whiteboardReactionTarget, whiteboardShapes, whiteboardWidgets]);

  useEffect(() => {
    if (whiteboardPenWidthOverride === null) {
      setWhiteboardPenCustomWidth(activeWhiteboardPen.width);
    }
  }, [activeWhiteboardPen.width, whiteboardPenWidthOverride]);

  useEffect(() => {
    if (selectedShapeIndex !== null && (selectedShapeIndex < 0 || selectedShapeIndex >= whiteboardShapes.length)) {
      setSelectedShapeIndex(null);
    }
  }, [selectedShapeIndex, whiteboardShapes.length]);

  useEffect(() => {
    const handleWhiteboardEscape = (event) => {
      if (event.key !== 'Escape' || activeRightTab !== 'whiteboard') {
        return;
      }
      setWhiteboardTool('select');
      setWhiteboardShapeMenuOpen(false);
      setWhiteboardStickyPaletteOpen(false);
      setWhiteboardPenMenuOpen(false);
      setWhiteboardStickyDragStart(null);
      setWhiteboardStickyPreview(null);
      setIsWhiteboardDrawing(false);
      setWhiteboardLineAnchor(null);
      setWhiteboardCurrentShape(null);
      showToast('Pointer tool active');
    };
    window.addEventListener('keydown', handleWhiteboardEscape);
    return () => window.removeEventListener('keydown', handleWhiteboardEscape);
  }, [activeRightTab]);

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
  const [isRoomFullscreen, setIsRoomFullscreen] = useState(false);
  const [roomStageFrame, setRoomStageFrame] = useState({ x: 56, y: 64, width: 1120, height: 720 });
  const [roomStageInteraction, setRoomStageInteraction] = useState(null);
  const [meetingShareMenuAnchor, setMeetingShareMenuAnchor] = useState(null);
  const [isMeetingLinkInputOpen, setIsMeetingLinkInputOpen] = useState(false);
  const [meetingLinkDraft, setMeetingLinkDraft] = useState('');
  const [isMeetingOverflowParticipantsOpen, setIsMeetingOverflowParticipantsOpen] = useState(false);
  const [meetingConversationTab, setMeetingConversationTab] = useState('chat');
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
  const [meetingOverflowParticipants] = useState([
    { name: 'Kevin', img: 'https://images.unsplash.com/photo-1544005313-94ddf0286df2?auto=format&fit=crop&w=320&q=80' },
    { name: 'Aisha', img: 'https://images.unsplash.com/photo-1506794778202-cad84cf45f1d?auto=format&fit=crop&w=320&q=80' },
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
  const selectionActionMenuEnabled = false;
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
  const activeDocIdRef = useRef(null);
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
  const appShellRef = useRef(null);
  const roomStageRef = useRef(null);
  const promptFileInputRef = useRef(null);
  const dmAnyAttachmentInputRef = useRef(null);
  const dmImageAttachmentInputRef = useRef(null);
  const dmAudioAttachmentInputRef = useRef(null);
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

  const commitEditableTextForActiveDoc = (target, setter) => {
    if (!target || typeof setter !== 'function') {
      return;
    }
    const sourceDocId = Number(target.dataset.docId || 0);
    const currentDocId = Number(activeDocIdRef.current || 0);
    if (sourceDocId && currentDocId && sourceDocId !== currentDocId) {
      return;
    }
    setter(target.textContent || '');
  };

  const commitEditableHtmlForActiveDoc = (target, setter) => {
    if (!target || typeof setter !== 'function') {
      return;
    }
    const sourceDocId = Number(target.dataset.docId || 0);
    const currentDocId = Number(activeDocIdRef.current || 0);
    if (sourceDocId && currentDocId && sourceDocId !== currentDocId) {
      return;
    }
    setter(target.innerHTML || '');
  };

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
  const [activePrimaryNav, setActivePrimaryNav] = useState('my-orb');
  const [documentStats, setDocumentStats] = useState({ words: 0, characters: 0 });
  const [zoomLevel, setZoomLevel] = useState(100);
  const [isFocusMode, setIsFocusMode] = useState(false);
  const [isDocumentImmersive, setIsDocumentImmersive] = useState(false);
  const [workspaceLauncherOpen, setWorkspaceLauncherOpen] = useState(false);
  const [workspaceLauncherIconStyle, setWorkspaceLauncherIconStyle] = useState('solid');
  const [workspaceLauncherIconSize, setWorkspaceLauncherIconSize] = useState('md');
  const [workspaceLauncherIconColor, setWorkspaceLauncherIconColor] = useState('#7c3aed');
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

  const academicStopWords = useMemo(() => new Set([
    'the', 'and', 'for', 'with', 'that', 'this', 'from', 'into', 'about', 'your', 'their', 'there', 'have', 'has', 'had',
    'are', 'was', 'were', 'will', 'would', 'could', 'should', 'can', 'may', 'might', 'not', 'but', 'than', 'then', 'also',
    'such', 'some', 'many', 'more', 'most', 'very', 'over', 'under', 'between', 'across', 'within', 'without', 'toward',
    'through', 'during', 'because', 'while', 'where', 'when', 'what', 'which', 'whose', 'been', 'being', 'each', 'other',
    'into', 'onto', 'these', 'those', 'them', 'they', 'its', 'our', 'out', 'in', 'on', 'at', 'to', 'of', 'a', 'an', 'or',
    'is', 'it', 'as', 'by', 'we', 'you', 'he', 'she', 'do', 'does', 'did', 'if', 'no', 'yes', 'ai', 'document', 'section',
  ]), []);

  const normalizeAcademicSourceText = useCallback((value) => {
    let normalized = String(value || '')
      .replace(/\u00a0/g, ' ')
      .replace(/\r/g, '')
      .trim();

    if (!normalized) {
      return '';
    }

    // Split inline numbered sections into standalone blocks.
    normalized = normalized
      .replace(/([.!?"”'])\s*(\d+)[.)]\s*/g, '$1\n\n$2. ')
      .replace(/([a-zA-Z])\s*(\d+)[.)]\s*/g, '$1\n\n$2. ')
      .replace(/(\d+)\.(\S)/g, '$1. $2')
      .replace(/[ \t]+/g, ' ')
      .replace(/\n{3,}/g, '\n\n')
      .trim();

    return normalized;
  }, []);

  const toAcademicTitleCase = useCallback((value) => String(value || '')
    .split(/\s+/)
    .filter(Boolean)
    .map((word) => {
      // Keep acronyms and mixed-case brand tokens intact.
      if (/^[A-Z0-9]{2,8}$/.test(word) || /[A-Z].*[A-Z]/.test(word.slice(1))) {
        return word;
      }
      return word.charAt(0).toUpperCase() + word.slice(1).toLowerCase();
    })
    .join(' '), []);

  const isInstructionLikeHeading = useCallback((label) => {
    const normalized = String(label || '').toLowerCase();
    return /(analyze|generate|format|return clean|do not include|heading styles|full document context)/i.test(normalized);
  }, []);

  const sanitizeAcademicHeadingLabel = useCallback((label, fallback = 'Section') => {
    const normalized = String(label || '')
      .replace(/\s+/g, ' ')
      .replace(/^[-*\d.\s]+/, '')
      .trim();
    if (!normalized || isInstructionLikeHeading(normalized)) {
      return fallback;
    }
    return normalized.length > 90 ? `${normalized.slice(0, 87).trimEnd()}...` : normalized;
  }, [isInstructionLikeHeading]);

  const deriveAcademicSectionTitle = useCallback((text, fallback) => {
    const tokens = String(text || '')
      .replace(/[^A-Za-z0-9\s-]/g, ' ')
      .split(/\s+/)
      .map((token) => token.trim())
      .filter(Boolean)
      .filter((token) => token.length > 2 && !academicStopWords.has(token.toLowerCase()));

    const uniqueOrdered = [];
    const seen = new Set();
    tokens.forEach((token) => {
      const key = token.toLowerCase();
      if (seen.has(key)) {
        return;
      }
      seen.add(key);
      uniqueOrdered.push(token);
    });

    const candidate = uniqueOrdered.slice(0, 6).join(' ');
    if (!candidate) {
      return sanitizeAcademicHeadingLabel(fallback, 'Section');
    }
    return sanitizeAcademicHeadingLabel(toAcademicTitleCase(candidate), fallback);
  }, [academicStopWords, sanitizeAcademicHeadingLabel, toAcademicTitleCase]);

  const extractStrategicSectionsFromSource = useCallback((sourceText) => {
    const normalized = normalizeAcademicSourceText(sourceText).replace(/\s+/g, ' ').trim();
    if (!normalized) {
      return [];
    }

    const markers = [
      { key: 'what', title: 'Executive Summary (The What)', regex: /Executive\s+Summary\s*\(\s*The\s*["']?What["']?\s*\)/i },
      { key: 'why', title: 'Market Opportunity & Rationale (The Why)', regex: /Market\s+Opportunity\s*&\s*Rationale\s*\(\s*The\s*["']?Why["']?\s*\)/i },
      { key: 'how', title: 'Strategic Execution (The How)', regex: /Strategic\s+Execution\s*\(\s*The\s*["']?How["']?\s*\)/i },
    ];

    const hits = markers
      .map((marker) => {
        const match = normalized.match(marker.regex);
        if (!match) {
          return null;
        }
        return {
          ...marker,
          start: match.index,
          end: match.index + match[0].length,
        };
      })
      .filter(Boolean)
      .sort((a, b) => a.start - b.start);

    if (!hits.length) {
      return [];
    }

    return hits.map((hit, index) => {
      const next = hits[index + 1];
      const contentStart = hit.end;
      const contentEnd = next ? next.start : normalized.length;
      const content = normalized.slice(contentStart, contentEnd).trim();
      return {
        key: hit.key,
        title: hit.title,
        content,
      };
    }).filter((section) => section.content.length > 0);
  }, [normalizeAcademicSourceText]);

  const extractNumberedAcademicItems = useCallback((sectionText) => {
    const text = normalizeAcademicSourceText(sectionText);
    if (!text) {
      return [];
    }

    const items = [];
    const markerRegex = /(^|\n)\s*(\d+)[.)]\s+/g;
    let match;
    const markers = [];
    while ((match = markerRegex.exec(text)) !== null) {
      markers.push({
        num: Number(match[2]),
        start: match.index + match[0].length,
      });
    }

    if (!markers.length) {
      return [];
    }

    markers.forEach((marker, index) => {
      const next = markers[index + 1];
      const segment = text.slice(marker.start, next ? next.start : text.length).trim();
      if (!segment) {
        return;
      }

      const titleFromColon = segment.split(':')[0].trim();
      const title = sanitizeAcademicHeadingLabel(
        titleFromColon && titleFromColon.length <= 80
          ? titleFromColon
          : deriveAcademicSectionTitle(segment, `Section ${marker.num}`),
        `Section ${marker.num}`,
      );
      const body = segment.includes(':')
        ? segment.slice(segment.indexOf(':') + 1).trim()
        : segment;

      items.push({
        number: marker.num,
        title,
        body: body || segment,
      });
    });

    return items;
  }, [deriveAcademicSectionTitle, normalizeAcademicSourceText, sanitizeAcademicHeadingLabel]);

  const buildAcademicDocumentBody = useCallback((sourceText) => {
    const normalized = normalizeAcademicSourceText(sourceText);
    if (!normalized) {
      return '';
    }

    const strategicSections = extractStrategicSectionsFromSource(normalized);
    if (strategicSections.length >= 2) {
      return strategicSections.map((section, chapterIndex) => {
        const chapterNumber = chapterIndex + 1;
        const chapterTitle = sanitizeAcademicHeadingLabel(section.title, `Chapter ${chapterNumber}`);
        const numberedItems = extractNumberedAcademicItems(section.content);

        const subsectionBlocks = numberedItems.length
          ? numberedItems.map((item, itemIndex) => {
            const subNumber = `${chapterNumber}.${itemIndex + 1}`;
            const paragraphHtml = String(item.body || '')
              .split(/(?<=[.!?])\s+(?=[A-Z])/)
              .map((part) => part.trim())
              .filter(Boolean)
              .map((part) => `<p style="font-size:17px;line-height:1.72;color:#334155;margin:0 0 10px;">${escapeHtml(part)}</p>`)
              .join('');

            return `
              <h2 style="font-size:29px;line-height:1.3;font-weight:600;color:#0f172a;margin:12px 0 8px;">${subNumber} ${escapeHtml(item.title)}</h2>
              ${paragraphHtml}
            `;
          }).join('')
          : (() => {
            const sentences = section.content
              .split(/(?<=[.!?])\s+(?=[A-Z])/)
              .map((sentence) => sentence.trim())
              .filter(Boolean);
            const midpoint = Math.max(1, Math.ceil(sentences.length / 2));
            const groups = [
              sentences.slice(0, midpoint).join(' '),
              sentences.slice(midpoint).join(' '),
            ].filter(Boolean);

            return groups.map((group, index) => {
              const subNumber = `${chapterNumber}.${index + 1}`;
              const subTitle = deriveAcademicSectionTitle(group, `Section ${subNumber}`);
              return `
                <h2 style="font-size:29px;line-height:1.3;font-weight:600;color:#0f172a;margin:12px 0 8px;">${subNumber} ${escapeHtml(subTitle)}</h2>
                <p style="font-size:17px;line-height:1.72;color:#334155;margin:0 0 10px;">${escapeHtml(group)}</p>
              `;
            }).join('');
          })();

        return `
          <section data-academic-chapter="true" style="margin:0 0 20px;">
            <h1 style="font-size:42px;line-height:1.12;font-weight:700;color:#0f172a;margin:16px 0 12px;">Chapter ${chapterNumber}. ${escapeHtml(chapterTitle)}</h1>
            ${subsectionBlocks}
          </section>
        `;
      }).join('');
    }

    const rawParagraphs = normalized
      .split(/\n{2,}/)
      .map((paragraph) => paragraph.trim())
      .filter(Boolean);

    const paragraphs = rawParagraphs.length
      ? rawParagraphs
      : normalized
        .split(/(?<=[.!?])\s+(?=[A-Z])/)
        .map((sentence) => sentence.trim())
        .filter(Boolean);

    const chapterChunks = [];
    let currentChunk = [];
    let currentWordCount = 0;

    paragraphs.forEach((paragraph) => {
      const words = paragraph.split(/\s+/).filter(Boolean).length;
      const wouldOverflow = currentWordCount + words > 150 && currentChunk.length > 0;
      if (wouldOverflow) {
        chapterChunks.push(currentChunk.join('\n\n'));
        currentChunk = [paragraph];
        currentWordCount = words;
      } else {
        currentChunk.push(paragraph);
        currentWordCount += words;
      }
    });

    if (currentChunk.length) {
      chapterChunks.push(currentChunk.join('\n\n'));
    }

    const limitedChunks = chapterChunks.slice(0, 8);
    if (!limitedChunks.length) {
      return '';
    }

    return limitedChunks.map((chunk, chapterIndex) => {
      const chapterNumber = chapterIndex + 1;
      const chapterTitle = sanitizeAcademicHeadingLabel(deriveAcademicSectionTitle(chunk, `Core Theme ${chapterNumber}`), `Core Theme ${chapterNumber}`);
      const sentences = chunk
        .split(/(?<=[.!?])\s+(?=[A-Z])/)
        .map((sentence) => sentence.trim())
        .filter(Boolean);

      const subsectionBuckets = [];
      const midpoint = Math.ceil(sentences.length / 2);
      if (sentences.length > 6) {
        subsectionBuckets.push(sentences.slice(0, midpoint).join(' '));
        subsectionBuckets.push(sentences.slice(midpoint).join(' '));
      } else {
        subsectionBuckets.push(chunk);
      }

      const subsectionHtml = subsectionBuckets.map((bucket, bucketIndex) => {
        const subNumber = `${chapterNumber}.${bucketIndex + 1}`;
        const subTitle = sanitizeAcademicHeadingLabel(deriveAcademicSectionTitle(bucket, `Section ${subNumber}`), `Section ${subNumber}`);
        const paragraphHtml = String(bucket || '')
          .split(/\n{2,}/)
          .map((paragraph) => paragraph.trim())
          .filter(Boolean)
          .map((paragraph) => `<p style="font-size:17px;line-height:1.72;color:#334155;margin:0 0 10px;">${escapeHtml(paragraph)}</p>`)
          .join('');

        return `
          <h2 style="font-size:29px;line-height:1.3;font-weight:600;color:#0f172a;margin:12px 0 8px;">${subNumber} ${escapeHtml(subTitle)}</h2>
          ${paragraphHtml}
        `;
      }).join('');

      return `
        <section data-academic-chapter="true" style="margin:0 0 20px;">
          <h1 style="font-size:42px;line-height:1.12;font-weight:700;color:#0f172a;margin:16px 0 12px;">Chapter ${chapterNumber}. ${escapeHtml(chapterTitle)}</h1>
          ${subsectionHtml}
        </section>
      `;
    }).join('');
  }, [deriveAcademicSectionTitle, extractNumberedAcademicItems, extractStrategicSectionsFromSource, normalizeAcademicSourceText, sanitizeAcademicHeadingLabel]);

  const parseHeadingEntriesFromHtml = useCallback((html) => {
    if (typeof document === 'undefined') {
      return [];
    }

    const template = document.createElement('template');
    template.innerHTML = String(html || '');
    return Array.from(template.content.querySelectorAll('h1, h2, h3'))
      .map((node) => {
        const text = sanitizeAcademicHeadingLabel(String(node.textContent || '').replace(/\s+/g, ' ').trim(), '');
        if (!text || isInstructionLikeHeading(text)) {
          return null;
        }
        return {
          level: Number(node.tagName.slice(1)) || 2,
          text,
        };
      })
      .filter(Boolean);
  }, [isInstructionLikeHeading, sanitizeAcademicHeadingLabel]);

  const normalizeHeadingHierarchyForToc = useCallback((html, sourceText = '') => {
    if (typeof document === 'undefined') {
      return String(html || '');
    }

    const template = document.createElement('template');
    template.innerHTML = String(html || '');

    // Remove previously generated TOC blocks before rebuilding.
    Array.from(template.content.querySelectorAll('[data-generated-toc="true"], [data-generated-outline="true"]'))
      .forEach((node) => node.remove());

    Array.from(template.content.querySelectorAll('h1, h2, h3, h4, h5, h6')).forEach((heading) => {
      const text = String(heading.textContent || '').replace(/\s+/g, ' ').trim();
      if (!/^table of contents?$/i.test(text)) {
        return;
      }
      const next = heading.nextElementSibling;
      heading.remove();
      if (next && ['OL', 'UL'].includes(next.tagName)) {
        next.remove();
      }
    });

    let headingNodes = Array.from(template.content.querySelectorAll('h1, h2, h3'));

    if (!headingNodes.length) {
      const fallbackText = String(sourceText || template.content.textContent || '').replace(/\s+/g, ' ').trim();
      const plan = buildHeadingPlanFromText(fallbackText, 3);
      if (!plan.sections.length) {
        return String(html || '');
      }

      return plan.sections.map((section, index) => {
        const level = index === 0 ? 1 : Math.min(3, Math.max(2, Number(section.level) || 2));
        const tag = `h${level}`;
        const headingSize = level === 1 ? 32 : level === 2 ? 24 : 20;
        return `
          <${tag} style="font-size:${headingSize}px;line-height:1.28;font-weight:700;color:#0f172a;margin:18px 0 8px;">${escapeHtml(section.heading || `Section ${index + 1}`)}</${tag}>
          <p style="font-size:16px;line-height:1.75;color:#334155;margin:0 0 12px;">${escapeHtml(section.text)}</p>
        `;
      }).join('');
    }

    const uniqueLevels = Array.from(new Set(headingNodes.map((node) => node.tagName)));
    if (uniqueLevels.length === 1) {
      headingNodes.forEach((node, index) => {
        const label = String(node.textContent || '').trim();
        const numbering = label.match(/^(\d+)(?:\.(\d+))?(?:\.(\d+))?/);
        let targetLevel = 2;
        if (numbering) {
          const depth = numbering.slice(1).filter(Boolean).length;
          targetLevel = Math.min(3, Math.max(1, depth));
        } else if (index === 0) {
          targetLevel = 1;
        }

        const targetTag = `H${targetLevel}`;
        if (node.tagName === targetTag) {
          return;
        }

        const replacement = document.createElement(targetTag.toLowerCase());
        Array.from(node.attributes).forEach((attr) => replacement.setAttribute(attr.name, attr.value));
        replacement.innerHTML = node.innerHTML;
        node.replaceWith(replacement);
      });
    }

    return template.innerHTML;
  }, [buildHeadingPlanFromText]);

  const injectTocAtTopOfDocument = useCallback((html, sourceText = '') => {
    const normalizedHtml = normalizeHeadingHierarchyForToc(html, sourceText);
    const headingEntries = parseHeadingEntriesFromHtml(normalizedHtml);
    if (!headingEntries.length) {
      return normalizedHtml;
    }

    const tocItems = headingEntries.map((entry, index) => {
      const indent = entry.level === 1 ? 0 : entry.level === 2 ? 20 : 38;
      const weight = entry.level === 1 ? 700 : 500;
      const entrySize = entry.level === 1 ? 20 : entry.level === 2 ? 17 : 15;
      const pageNumber = index + 1;
      return `
        <li style="margin:0 0 7px ${indent}px;list-style:none;">
          <div style="display:flex;align-items:flex-end;gap:8px;color:#0f172a;font-size:${entrySize}px;line-height:1.3;font-weight:${weight};">
            <span style="white-space:nowrap;">${escapeHtml(entry.text || `Section ${index + 1}`)}</span>
            <span aria-hidden="true" style="flex:1;align-self:center;height:1em;background-image:radial-gradient(circle at 1px 50%, #334155 1px, transparent 1.2px);background-size:5px 2px;background-repeat:repeat-x;background-position:left center;opacity:0.75;"></span>
            <span style="min-width:18px;text-align:right;white-space:nowrap;">${pageNumber}</span>
          </div>
        </li>
      `;
    }).join('');

    const tocHtml = `
      <section data-generated-toc="true" style="border:1px solid #dbeafe;background:#f8fbff;border-radius:16px;padding:16px 18px;margin:0 0 18px;">
        <h1 style="font-size:42px;line-height:1.1;font-weight:700;color:#0f172a;margin:0 0 12px;">Table of Contents</h1>
        <ol style="margin:0;padding:0;">${tocItems}</ol>
      </section>
    `;

    return `${tocHtml}${normalizedHtml}`;
  }, [normalizeHeadingHierarchyForToc, parseHeadingEntriesFromHtml]);

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

  const applyGeneratedTableOfContents = useCallback(() => {
    const selectedScope = selectedEditorTextRef.current || selectedEditorText;
    const cardText = String(documentCardRef.current?.innerText || '').trim();
    const sourceText = selectedScope || cardText || getPlainText(docBodyHtml);

    if (!sourceText.trim()) {
      showToast('Add some content first, then generate a table of contents.');
      return;
    }

    const baseHtml = String(docBodyHtml || '');
    const existingHeadingEntries = parseHeadingEntriesFromHtml(baseHtml)
      .filter((entry) => !/^table of contents?$/i.test(entry.text || ''));
    const needsAcademicStructure = existingHeadingEntries.length < 3;
    const bodyWithAcademicHierarchy = needsAcademicStructure
      ? buildAcademicDocumentBody(sourceText)
      : baseHtml;
    const normalizedBodyHtml = normalizeHeadingHierarchyForToc(bodyWithAcademicHierarchy, sourceText);
    const tocHtml = injectTocAtTopOfDocument(normalizedBodyHtml, sourceText);
    const plan = buildHeadingPlanFromText(sourceText, 3);

    if (!docTitle?.trim() || docTitle === AI_NATIVE_PLACEHOLDER || docTitle === defaultTitle) {
      setDocTitle(plan.title || 'Untitled document');
    }
    if (!docSubtitle?.trim() || docSubtitle === AI_NATIVE_PLACEHOLDER || docSubtitle === defaultSubtitle) {
      setDocSubtitle('Structured from your document using Heading 1, Heading 2, and Heading 3 hierarchy.');
    }

    setIsBlankDocument(true);
    setAppendedSections([]);
    setDocBodyHtml(tocHtml);
    setEditorHeading('Heading 1');
    setActiveDocView('document');
    setLeftSidebarOpen(true);
    setTimeout(() => computeDocumentOutline(), 0);
    showToast('Table of contents generated from document headings');
  }, [
    buildAcademicDocumentBody,
    buildHeadingPlanFromText,
    computeDocumentOutline,
    defaultSubtitle,
    defaultTitle,
    docBodyHtml,
    docSubtitle,
    docTitle,
    injectTocAtTopOfDocument,
    normalizeHeadingHierarchyForToc,
    parseHeadingEntriesFromHtml,
    selectedEditorText,
  ]);

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
    activeDocIdRef.current = activeDocId;
  }, [activeDocId]);

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
      const storedWhiteboardEmojiUsage = localStorage.getItem(WHITEBOARD_EMOJI_STORAGE_KEY);
      if (storedWhiteboardEmojiUsage) {
        const parsedWhiteboardEmojiUsage = JSON.parse(storedWhiteboardEmojiUsage);
        if (Array.isArray(parsedWhiteboardEmojiUsage)) {
          setWhiteboardEmojiUsage(parsedWhiteboardEmojiUsage.filter((item) => item && typeof item.emoji === 'string').slice(0, 48));
        }
      }
    } catch (_error) {
      // noop
    }
  }, []);

  useEffect(() => {
    try {
      localStorage.setItem(WHITEBOARD_EMOJI_STORAGE_KEY, JSON.stringify(whiteboardEmojiUsage.slice(0, 48)));
    } catch (_error) {
      // noop
    }
  }, [whiteboardEmojiUsage]);

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
    whiteboardTool,
    whiteboardPenVariant,
    whiteboardShapeVariant,
    whiteboardStrokes,
    whiteboardShapes,
    whiteboardWidgets,
    whiteboardComments,
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
    if (typeof snapshot.whiteboardTool === 'string') {
      setWhiteboardTool(snapshot.whiteboardTool);
    }
    if (typeof snapshot.whiteboardPenVariant === 'string') {
      setWhiteboardPenVariant(snapshot.whiteboardPenVariant);
    }
    if (typeof snapshot.whiteboardShapeVariant === 'string') {
      setWhiteboardShapeVariant(snapshot.whiteboardShapeVariant);
    }
    setWhiteboardStrokes(Array.isArray(snapshot.whiteboardStrokes) ? snapshot.whiteboardStrokes : []);
    setWhiteboardShapes(Array.isArray(snapshot.whiteboardShapes) ? snapshot.whiteboardShapes : []);
    setWhiteboardWidgets(Array.isArray(snapshot.whiteboardWidgets) ? snapshot.whiteboardWidgets : []);
    setWhiteboardComments(Array.isArray(snapshot.whiteboardComments) ? snapshot.whiteboardComments : []);
    setSelectedWidgetId(null);
    setSelectedShapeIndex(null);
    setWhiteboardEditingWidgetId(null);
    setWhiteboardHoveredObject(null);
    setWhiteboardHoveredAnchor(null);
    setWhiteboardReactionTarget(null);
    setWhiteboardReactionMenuOpen(false);
    setWhiteboardEmojiModalOpen(false);
    setWhiteboardEmojiSearch('');
    setWhiteboardAlignmentGuides([]);

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
  }, [
    docTitle,
    docSubtitle,
    initiatives,
    appendedSections,
    docBodyHtml,
    isBlankDocument,
    whiteboardTool,
    whiteboardPenVariant,
    whiteboardShapeVariant,
    whiteboardStrokes,
    whiteboardShapes,
    whiteboardWidgets,
    whiteboardComments,
  ]);

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

      if (clickedOutsideFormatting && clickedOutsideCalendar) {
        setOpenDropdown(null);
        setTextStyleMenuOpen(false);
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
      if (!event.target.closest('[data-meeting-share-root]')) {
        setMeetingShareMenuAnchor(null);
      }
      if (!event.target.closest('[data-meeting-link-input-root]')) {
        setIsMeetingLinkInputOpen(false);
      }
      if (!event.target.closest('[data-meeting-overflow-root]')) {
        setIsMeetingOverflowParticipantsOpen(false);
      }
    };

    window.addEventListener('pointerdown', handleClickOutside);
    return () => window.removeEventListener('pointerdown', handleClickOutside);
  }, [openDropdown]);

  const clampRoomStageFrame = useCallback((nextFrame) => {
    const viewportWidth = window.innerWidth;
    const viewportHeight = window.innerHeight;
    const horizontalGutter = 88;
    const verticalGutter = 16;
    const minWidth = 860;
    const minHeight = 520;
    const maxWidth = Math.max(minWidth, viewportWidth - (horizontalGutter * 2));
    const maxHeight = Math.max(minHeight, viewportHeight - 90);
    const width = Math.min(maxWidth, Math.max(minWidth, nextFrame.width));
    const height = Math.min(maxHeight, Math.max(minHeight, nextFrame.height));
    const x = Math.min(Math.max(horizontalGutter, nextFrame.x), Math.max(horizontalGutter, viewportWidth - width - horizontalGutter));
    const y = Math.min(Math.max(verticalGutter, nextFrame.y), Math.max(verticalGutter, viewportHeight - height - verticalGutter));
    return { x, y, width, height };
  }, []);

  useEffect(() => {
    const handleFullscreenChange = () => {
      setIsRoomFullscreen(Boolean(document.fullscreenElement === roomStageRef.current));
    };

    document.addEventListener('fullscreenchange', handleFullscreenChange);
    return () => document.removeEventListener('fullscreenchange', handleFullscreenChange);
  }, []);

  useEffect(() => {
    const handleDocumentImmersiveFullscreen = () => {
      const immersiveActive = document.fullscreenElement === appShellRef.current;
      if (immersiveActive && !isDocumentImmersive) {
        setIsDocumentImmersive(true);
      }
      if (!immersiveActive && isDocumentImmersive) {
        setIsDocumentImmersive(false);
        setIsFocusMode(false);
      }
    };

    document.addEventListener('fullscreenchange', handleDocumentImmersiveFullscreen);
    return () => document.removeEventListener('fullscreenchange', handleDocumentImmersiveFullscreen);
  }, [isDocumentImmersive]);

  useEffect(() => {
    setRoomStageFrame((prev) => {
      const width = Math.min(980, Math.max(860, window.innerWidth - 460));
      const height = Math.min(700, Math.max(520, window.innerHeight - 170));
      return clampRoomStageFrame({
        x: Math.round((window.innerWidth - width) / 2),
        y: 72,
        width,
        height,
      });
    });
  }, [clampRoomStageFrame]);

  useEffect(() => {
    if (!roomStageInteraction) {
      return undefined;
    }

    const handlePointerMove = (event) => {
      const deltaX = event.clientX - roomStageInteraction.startX;
      const deltaY = event.clientY - roomStageInteraction.startY;

      if (roomStageInteraction.mode === 'drag') {
        setRoomStageFrame(clampRoomStageFrame({
          ...roomStageInteraction.origin,
          x: roomStageInteraction.origin.x + deltaX,
          y: roomStageInteraction.origin.y + deltaY,
        }));
        return;
      }

      setRoomStageFrame(clampRoomStageFrame({
        ...roomStageInteraction.origin,
        width: roomStageInteraction.origin.width + deltaX,
        height: roomStageInteraction.origin.height + deltaY,
      }));
    };

    const handlePointerUp = () => {
      setRoomStageInteraction(null);
    };

    window.addEventListener('pointermove', handlePointerMove);
    window.addEventListener('pointerup', handlePointerUp);
    return () => {
      window.removeEventListener('pointermove', handlePointerMove);
      window.removeEventListener('pointerup', handlePointerUp);
    };
  }, [roomStageInteraction, clampRoomStageFrame]);

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

  const scheduleDateOptions = useMemo(() => {
    const anchor = selectedCalendarDate instanceof Date && !Number.isNaN(selectedCalendarDate.getTime())
      ? new Date(selectedCalendarDate)
      : new Date();
    return Array.from({ length: 21 }, (_, index) => {
      const dayOffset = index - 10;
      const valueDate = new Date(anchor.getFullYear(), anchor.getMonth(), anchor.getDate() + dayOffset);
      const value = `${valueDate.getFullYear()}-${String(valueDate.getMonth() + 1).padStart(2, '0')}-${String(valueDate.getDate()).padStart(2, '0')}`;
      const label = valueDate.toLocaleDateString(undefined, { month: '2-digit', day: '2-digit', year: 'numeric' });
      return { value, label };
    });
  }, [selectedCalendarDate]);

  const scheduleTimeOptions = useMemo(() => {
    return Array.from({ length: 48 }, (_, index) => {
      const hours = Math.floor(index / 2);
      const minutes = index % 2 === 0 ? '00' : '30';
      const value = `${String(hours).padStart(2, '0')}:${minutes}`;
      const label = new Date(`2000-01-01T${value}:00`).toLocaleTimeString(undefined, {
        hour: 'numeric',
        minute: '2-digit',
      });
      return { value, label };
    });
  }, []);

  const getQuickAddSourceIcon = (sourceId) => {
    if (sourceId === 'image') return <ImageIcon size={12} />;
    if (sourceId === 'file') return <File size={12} />;
    if (sourceId === 'audio') return <Mic size={12} />;
    if (sourceId === 'note') return <AlignLeft size={12} />;
    if (sourceId === 'link') return <Link size={12} />;
    return <Plus size={12} />;
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
    if (!selectionActionMenuEnabled) {
      setSelectionActionMenu({ open: false, left: 0, top: 0 });
      return;
    }

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
    setActiveDocView('document');
    setLeftSidebarOpen(true);
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

  const handleWhiteboardAssistantAction = (action) => {
    if (!action?.prompt) {
      return;
    }

    if (action.key === 'breakdown-tasks') {
      const seedTasks = [
        'Finalize social campaign and influencer shortlist',
        'Publish onboarding flow improvements before launch week',
        'Prepare retention webinar series onboarding script',
      ];
      setTasks((prev) => {
        const existing = new Set(prev.map((task) => task.text));
        const additions = seedTasks
          .filter((taskText) => !existing.has(taskText))
          .map((taskText, index) => ({
            id: Date.now() + index,
            text: taskText,
            completed: false,
            owner: 'agent',
          }));
        return additions.length ? [...additions, ...prev] : prev;
      });
      setActiveRightTab('tasks');
      showToast('Launch tasks added to checklist');
      return;
    }

    if (action.key === 'create-timeline') {
      setActiveRightTab('calendar');
      setScheduleInput('Q2 launch timeline: Awareness -> Activation -> Conversion -> Retention milestones with weekly checkpoints.');
      showToast('Timeline draft sent to Schedule');
      return;
    }

    setActiveRightTab('assistant');
    setAssistantQuickPrompt(action.prompt);
    showToast(`${action.label} ready in AI Assistant`);
  };

  const handleWhiteboardConnectionAction = (connectionKey) => {
    if (connectionKey === 'orb-brief') {
      setActivePrimaryNav('my-orb');
      showToast('Opened Orb connection');
      return;
    }
    if (connectionKey === 'tasks') {
      openWhiteboardTaskPreview();
      return;
    }
    if (connectionKey === 'compose') {
      setActiveRightTab('assistant');
      setAssistantQuickPrompt('Create a go-to-market launch draft based on the whiteboard strategy.');
      showToast('Opened Compose connection');
      return;
    }
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
    setMeetingShareMenuAnchor(null);
    setIsMeetingLinkInputOpen(false);
    setIsMeetingOverflowParticipantsOpen(false);
    setWorkspaceLauncherOpen(false);
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
    if (/table of contents?|toc/.test(normalizedPrompt)) {
      return 'Table of Contents';
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
      if (/table of contents?/i.test(requestedAction)) {
        return `${sourceTitle} Table of Contents`;
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
    if (/table of contents?|\btoc\b/i.test(String(promptText || ''))) {
      return 'Structured around an AI-generated table of contents.';
    }
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
        setAiBackendStatus({ state: 'error', message: payload.reason || 'Backend is running, but GEMINI_API_KEY or VITE_GEMINI_DEMO_API_KEY is missing.' });
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
    if (shouldBuildDocument && activeDocIdRef.current) {
      setLastComposeRun({
        prompt: promptText,
        options: {
          ...options,
          source,
          forceDocBuild: shouldBuildDocument,
          composeFormat: requestedFormat,
          tone: requestedTone,
          lengthMode: requestedLengthMode,
          lengthValue: requestedLengthValue,
          selectionScoped,
        },
        documentId: activeDocIdRef.current,
        preSnapshot: buildSnapshot(),
        createdAt: Date.now(),
      });
    }
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

    try {

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
      const failureReason = liveModelError || lastAiError || 'Check Vercel server env GEMINI_API_KEY or VITE_GEMINI_DEMO_API_KEY, billing, and model access.';
      aiResponseText = composeFallbackAction.paragraph || `Live AI request failed. ${failureReason}`;
      trackMemoryAction('ai', 'Live AI request failed', {
        reason: failureReason,
      });
    }

    if (looksGenericResponse(aiResponseText) && shouldBuildDocument) {
      docAction = composeFallbackAction;
      aiResponseText = composeFallbackAction.paragraph || aiResponseText;
    }

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
          const tocFirstPageHtml = smartActionKey === 'toc' && !selectionScoped
            ? injectTocAtTopOfDocument(renderedHtml, targetedText)
            : renderedHtml;
          setIsBlankDocument(true);
          setAppendedSections([]);
          setDocBodyHtml(tocFirstPageHtml);
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
          if (shouldRenderOutlineHtml || smartActionKey === 'toc') {
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
    } catch (_fatalError) {
      const reason = 'AI request failed unexpectedly. Please retry.';
      setLastAiError(reason);
      showToast(reason);
    } finally {
      setIsComposing(false);
    }
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
    const liveDocumentText = String(documentCardRef.current?.innerText || '')
      .replace(/\r/g, '')
      .replace(/\u00a0/g, ' ')
      .trim();
    const aiReadyDocumentContext = liveDocumentText
      .split(/\n+/)
      .map((line) => line.trim())
      .filter(Boolean)
      .filter((line) => !/^(@font-face|@list|mso-|p\.msonormal|h1\{|h3\{|span\.mso|@page|div\.section|font-family:|margin-|text-align:|layout-grid:|size:|#?1111microsoftinternetexplorer)/i.test(line))
      .slice(0, 140)
      .join('\n')
      .slice(0, 7000);
    const documentContextBlock = aiReadyDocumentContext
      ? `\n\nCurrent document content:\n"""${aiReadyDocumentContext}"""`
      : '';

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
        : `${instruction}\n\nCreate a structured outline from the current document with concise headings and nested bullets where useful. Keep headings short and clear. Target up to ${requestedOutlineLevels} heading levels.${documentContextBlock}`;

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

    if (productMode === 'compose' && (actionKey === 'generate-toc' || actionKey === 'toc' || actionKey === 'table-of-content')) {
      setRightSidebarOpen(false);
      setActiveRightTab('assistant');
      applyGeneratedTableOfContents();
      return;
    }

    const selectedScope = selectedEditorTextRef.current || selectedEditorText;
    const hasSelection = requestedSelectionScope !== undefined ? requestedSelectionScope : Boolean(selectedScope);
    const scopedPrompt = hasSelection
      ? `${instruction}\n\nRefine ONLY this selected excerpt and preserve intent:\n"""${selectedScope}"""\n\nIf you are producing an outline, return clear section headings with bullets under each heading.`
      : `${instruction}\n\nUse the current document context and provide a directly usable rewrite.`;

    if (productMode === 'compose') {
      setRightSidebarOpen(false);
      setActiveRightTab('assistant');
      showToast('Smart Assist is running...');

      handleAISubmit(scopedPrompt, {
        source: 'compose',
        forceDocBuild: true,
        suppressChatEcho: false,
        composeFormat: 'Plain Text',
        selectionScoped: hasSelection,
        smartActionKey: actionKey,
        tone: promptTone,
        lengthMode: promptLengthMode,
        lengthValue: promptLengthValue,
      });
      return;
    }

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
    setWorkspaceLauncherOpen(false);
    if (tabKey === 'dm') {
      createDmExperience();
      return;
    }
    // If panel was maximized, un-maximize when switching
    if (rightPanelMaximized) setRightPanelMaximized(false);
    if (rightSidebarOpen && activeRightTab === tabKey) {
      setRightSidebarOpen(false);
    } else {
      setRightSidebarOpen(true);
      setActiveRightTab(tabKey);
    }
  };

  const launchWorkspaceFromMiniPlus = (workspaceKey) => {
    setWorkspaceLauncherOpen(false);
    if (workspaceKey === 'compose') {
      createComposeExperience();
      return;
    }
    if (workspaceKey === 'deck') {
      createDeckExperience();
      return;
    }
    if (workspaceKey === 'sheets') {
      createSheetsExperience();
      return;
    }
    if (workspaceKey === 'dms') {
      createDmExperience();
      return;
    }
    if (workspaceKey === 'whiteboard') {
      setProductMode('compose');
      setLeftSidebarOpen(true);
      setRightSidebarOpen(true);
      setActiveRightTab('whiteboard');
      showToast('Whiteboard opened');
      return;
    }
    if (workspaceKey === 'dashboard') {
      setProductMode('landing');
      setActivePrimaryNav('home');
      showToast('Dashboard opened');
      return;
    }
    handleMiniSidebarClick('chat');
  };

  const toggleDocumentImmersiveMode = async () => {
    const entering = !isDocumentImmersive;
    try {
      if (entering) {
        setIsFocusMode(true);
        if (appShellRef.current?.requestFullscreen && document.fullscreenElement !== appShellRef.current) {
          await appShellRef.current.requestFullscreen();
        }
        setIsDocumentImmersive(true);
        showToast('Immersive mode enabled');
        return;
      }

      if (document.fullscreenElement && document.exitFullscreen) {
        await document.exitFullscreen();
      }
      setIsDocumentImmersive(false);
      setIsFocusMode(false);
      showToast('Immersive mode disabled');
    } catch (_error) {
      if (entering) {
        setIsFocusMode(false);
      }
      showToast('Fullscreen is unavailable in this browser context');
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

  const beginRoomStageDrag = (event) => {
    if (isRoomFullscreen) {
      return;
    }
    if (event.target.closest('button')) {
      return;
    }
    event.preventDefault();
    setRoomStageInteraction({
      mode: 'drag',
      startX: event.clientX,
      startY: event.clientY,
      origin: roomStageFrame,
    });
  };

  const beginRoomStageResize = (event) => {
    if (isRoomFullscreen) {
      return;
    }
    event.preventDefault();
    event.stopPropagation();
    setRoomStageInteraction({
      mode: 'resize',
      startX: event.clientX,
      startY: event.clientY,
      origin: roomStageFrame,
    });
  };

  const toggleRoomStageFullscreen = async () => {
    try {
      if (document.fullscreenElement) {
        await document.exitFullscreen();
      } else if (roomStageRef.current?.requestFullscreen) {
        await roomStageRef.current.requestFullscreen();
      }
    } catch (_error) {
      // noop
    }
  };

  const handleMeetingShareOption = (option) => {
    setMeetingShareMenuAnchor(null);

    if (option === 'link') {
      setMeetingLinkDraft(`https://compose.ai/room/${roomId || 'live-room'}`);
      setIsMeetingLinkInputOpen(true);
      return;
    }

    if (!meetingShareFileInputRef.current) {
      return;
    }

    setActiveMeetingStageTab('files');

    if (option === 'document') {
      meetingShareFileInputRef.current.accept = '.pdf,.doc,.docx,.ppt,.pptx,.txt,.md';
    } else if (option === 'image') {
      meetingShareFileInputRef.current.accept = 'image/*';
    } else if (option === 'audio') {
      meetingShareFileInputRef.current.accept = 'audio/*';
    } else {
      meetingShareFileInputRef.current.accept = '*/*';
    }

    meetingShareFileInputRef.current.click();
  };

  const saveMeetingSharedLink = () => {
    const link = String(meetingLinkDraft || '').trim();
    if (!link) {
      showToast('Enter a link to share');
      return;
    }

    const item = {
      id: `link-${Date.now()}`,
      name: link,
      baseName: 'Shared link',
      sharedBy: 'Joshua',
      size: 0,
      pages: 1,
      type: 'link',
      uploadedAt: new Date().toISOString(),
    };

    setSharedMeetingFiles((prev) => [item, ...prev]);
    setActiveSharedMeetingFileId(item.id);
    setActiveMeetingStageTab('files');
    setIsMeetingLinkInputOpen(false);
    showToast('Link added to meeting share list');
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
    const tabOrder = ['chat', 'assistant', 'whiteboard', 'tasks', 'calendar', 'room', 'people', 'memory', 'orb'];
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

  const resetWhiteboardCanvas = ({ toastMessage = 'Whiteboard cleared' } = {}) => {
    setWhiteboardStrokes([]);
    setWhiteboardShapes([]);
    setWhiteboardRedoStrokes([]);
    setWhiteboardCurrentStroke('');
    setWhiteboardCurrentShape(null);
    setWhiteboardWidgets([]);
    setWhiteboardComments([]);
    setWhiteboardActiveCommentId(null);
    setIsWhiteboardDrawing(false);
    setWhiteboardLineAnchor(null);
    setWhiteboardStickyDragStart(null);
    setWhiteboardStickyPreview(null);
    setSelectedWidgetId(null);
    setSelectedShapeIndex(null);
    setWhiteboardHoveredObject(null);
    setWhiteboardHoveredAnchor(null);
    setWhiteboardReactionTarget(null);
    setWhiteboardReactionMenuOpen(false);
    setWhiteboardEmojiModalOpen(false);
    setWhiteboardEmojiSearch('');
    setWhiteboardAlignmentGuides([]);
    if (toastMessage) {
      showToast(toastMessage);
    }
  };

  const applyWhiteboardTemplate = (templateKey) => {
    const buildWidget = ({
      index,
      type = 'sticky',
      x,
      y,
      width = 180,
      height = 120,
      text = '',
      title = '',
      body = '',
      color = '#fde047',
    }) => ({
      id: `wb-template-${templateKey}-${Date.now()}-${index}`,
      type,
      x,
      y,
      width,
      height,
      color,
      text,
      title,
      body,
      fontFamily: 'Calibri',
      fontSize: 14,
      isBold: false,
      isItalic: false,
      isUnderline: false,
      textAlign: 'left',
      textColor: '#111827',
      highlightColor: '#ffffff',
      opacity: 100,
      hasList: false,
      listType: 'bullet',
      linkedUrl: '',
    });

    const templates = {
      'startup-lean-canvas': [
        buildWidget({ index: 1, type: 'text', x: 48, y: 38, width: 260, height: 96, text: 'Lean Startup Canvas\nCustomer segment\nCore problem' }),
        buildWidget({ index: 2, x: 342, y: 38, width: 220, height: 120, color: '#fde68a', text: 'Solution\n- MVP scope\n- Differentiator' }),
        buildWidget({ index: 3, x: 590, y: 38, width: 220, height: 120, color: '#bfdbfe', text: 'Channels\n- Community\n- Partner\n- Paid tests' }),
        buildWidget({ index: 4, x: 342, y: 184, width: 220, height: 120, color: '#86efac', text: 'North-star metric\nActivation rate\nRetention D30' }),
        buildWidget({ index: 5, x: 590, y: 184, width: 220, height: 120, color: '#f9a8d4', text: 'Unfair advantage\nDistribution moat\nData feedback loop' }),
      ],
      'startup-roadmap-sprint': [
        buildWidget({ index: 1, type: 'text', x: 56, y: 36, width: 300, height: 90, text: 'MVP Sprint Roadmap\nWeek 1 to Week 6 execution board' }),
        buildWidget({ index: 2, x: 64, y: 154, width: 180, height: 110, color: '#fde68a', text: 'Week 1\nUser interviews\nProblem validation' }),
        buildWidget({ index: 3, x: 270, y: 154, width: 180, height: 110, color: '#bfdbfe', text: 'Week 2-3\nPrototype\nCore UX flow' }),
        buildWidget({ index: 4, x: 476, y: 154, width: 180, height: 110, color: '#bbf7d0', text: 'Week 4-5\nBuild\nIntegrations\nQA' }),
        buildWidget({ index: 5, x: 682, y: 154, width: 180, height: 110, color: '#fbcfe8', text: 'Week 6\nLaunch test\nCollect signal\nIterate' }),
      ],
      'enterprise-quarterly-operating-review': [
        buildWidget({ index: 1, type: 'text', x: 46, y: 34, width: 340, height: 96, text: 'Quarterly Operating Review\nObjectives, execution, risk and decisions' }),
        buildWidget({ index: 2, type: 'task', x: 420, y: 34, width: 260, height: 112, title: 'Top 3 KPIs', body: 'Revenue growth\nGross margin\nNet retention' }),
        buildWidget({ index: 3, x: 46, y: 164, width: 230, height: 120, color: '#bfdbfe', text: 'Objective A\nOwner\nStatus\nBlockers' }),
        buildWidget({ index: 4, x: 300, y: 164, width: 230, height: 120, color: '#bbf7d0', text: 'Objective B\nOwner\nStatus\nDependencies' }),
        buildWidget({ index: 5, x: 554, y: 164, width: 230, height: 120, color: '#fef3c7', text: 'Objective C\nOwner\nStatus\nRisks' }),
        buildWidget({ index: 6, type: 'task', x: 808, y: 164, width: 230, height: 120, title: 'Escalations', body: 'Cross-team blockers\nDecision needed\nDue date' }),
      ],
      'enterprise-stakeholder-update': [
        buildWidget({ index: 1, type: 'text', x: 56, y: 36, width: 312, height: 88, text: 'Stakeholder Update\nWhat changed, what is next, what needs support' }),
        buildWidget({ index: 2, type: 'task', x: 396, y: 36, width: 260, height: 104, title: 'Highlights', body: 'Shipped this week\nCustomer wins\nImpact' }),
        buildWidget({ index: 3, x: 56, y: 160, width: 260, height: 120, color: '#bfdbfe', text: 'In progress\nMilestones\nConfidence level' }),
        buildWidget({ index: 4, x: 342, y: 160, width: 260, height: 120, color: '#fde68a', text: 'Upcoming\nNext 2 weeks\nOwners' }),
        buildWidget({ index: 5, x: 628, y: 160, width: 260, height: 120, color: '#fbcfe8', text: 'Risks and asks\nSupport needed\nDecision date' }),
      ],
      'personal-weekly-planner': [
        buildWidget({ index: 1, type: 'text', x: 58, y: 36, width: 300, height: 88, text: 'Weekly Planner\nTop priorities, routines, and review' }),
        buildWidget({ index: 2, x: 58, y: 150, width: 200, height: 120, color: '#fde68a', text: 'Must-do\n1.\n2.\n3.' }),
        buildWidget({ index: 3, x: 284, y: 150, width: 200, height: 120, color: '#bfdbfe', text: 'Should-do\n1.\n2.\n3.' }),
        buildWidget({ index: 4, x: 510, y: 150, width: 200, height: 120, color: '#bbf7d0', text: 'Could-do\nIdeas\nBacklog' }),
        buildWidget({ index: 5, type: 'task', x: 736, y: 150, width: 220, height: 120, title: 'Reflection', body: 'Wins\nLessons\nNext focus' }),
      ],
      'personal-goals-habit-tracker': [
        buildWidget({ index: 1, type: 'text', x: 58, y: 36, width: 320, height: 92, text: 'Goals + Habit Tracker\nMonthly outcomes and daily consistency' }),
        buildWidget({ index: 2, x: 58, y: 156, width: 220, height: 120, color: '#fef3c7', text: 'Goal 1\nOutcome\nMilestone' }),
        buildWidget({ index: 3, x: 304, y: 156, width: 220, height: 120, color: '#bfdbfe', text: 'Goal 2\nOutcome\nMilestone' }),
        buildWidget({ index: 4, x: 550, y: 156, width: 220, height: 120, color: '#fbcfe8', text: 'Goal 3\nOutcome\nMilestone' }),
        buildWidget({ index: 5, type: 'task', x: 796, y: 156, width: 220, height: 120, title: 'Habit streaks', body: 'Sleep\nWorkout\nDeep work\nReading' }),
      ],
    };

    const customTemplate = whiteboardCustomTemplates.find((template) => template.key === templateKey);
    const selected = customTemplate?.widgets?.length
      ? cloneTemplateWidgets(customTemplate.widgets, customTemplate.key)
      : (templates[templateKey] || templates['startup-lean-canvas']);
    const selectedMeta = whiteboardTemplateCatalog.find((template) => template.key === templateKey);

    setWhiteboardStrokes([]);
    setWhiteboardShapes([]);
    setWhiteboardRedoStrokes([]);
    setWhiteboardCurrentStroke('');
    setWhiteboardCurrentShape(null);
    setWhiteboardComments([]);
    setWhiteboardActiveCommentId(null);
    setWhiteboardWidgets(selected);
    setIsWhiteboardDrawing(false);
    setWhiteboardLineAnchor(null);
    setWhiteboardStickyDragStart(null);
    setWhiteboardStickyPreview(null);
    setSelectedWidgetId(null);
    setSelectedShapeIndex(null);
    setWhiteboardHoveredObject(null);
    setWhiteboardHoveredAnchor(null);
    setWhiteboardReactionTarget(null);
    setWhiteboardReactionMenuOpen(false);
    setWhiteboardEmojiModalOpen(false);
    setWhiteboardEmojiSearch('');
    setWhiteboardAlignmentGuides([]);
    setWhiteboardTool('select');
    setWhiteboardTemplateMenuOpen(false);
    showToast(`${selectedMeta?.label || 'Template'} loaded`);
  };

  const createWhiteboardExperience = () => {
    setCreationPickerOpen(false);
    setProductMode('compose');
    setLeftSidebarOpen(true);
    setRightSidebarOpen(false);
    setActiveRightTab('whiteboard');
    resetWhiteboardCanvas({ toastMessage: 'New whiteboard created' });
  };

  const createItemForCurrentContext = () => {
    if (activeRightTab === 'whiteboard') {
      createWhiteboardExperience();
      return;
    }
    if (productMode === 'compose') {
      createNewComposition();
      return;
    }
    if (productMode === 'deck') {
      createDeckExperience();
      return;
    }
    if (productMode === 'sheets') {
      createSheetsExperience();
      return;
    }
    if (productMode === 'dm') {
      createDmExperience();
      return;
    }
    openCreationPicker();
  };

  const createDmExperience = () => {
    setCreationPickerOpen(false);
    setProductMode('dm');
    setRightSidebarOpen(false);
    setLeftSidebarOpen(false);
    setDmSearchQuery('');
    setDmConversationTab('chat');
    setDmComposerValue('');
    setDmPendingAttachments([]);
    setDmEmojiPickerOpen(false);
    setDmFormatMenuOpen(false);
    setDmComposerQuickMenuOpen(false);
    setDmScheduleMenuOpen(false);
    setDmThreadComposerValue('');
    setDmActiveParentMessageId(null);
    setDmActiveThreadId((prev) => prev || 'thread-beta-launch');
    showToast('DM workspace ready');
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

    if (destination === 'dm') {
      setActivePrimaryNav('home');
      createDmExperience();
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
    || (selectionActionMenuEnabled && selectionActionMenu.open)
    || pageContextMenu.open
    || docSearchPanelOpen
    || creationPickerOpen
    || workspaceModalOpen
    || shareModalOpen
    || isScheduleSessionModalOpen;
  const shouldHideScrollbarsForPrompt = shouldShowPromptBackdrop;
  const savedStatusLabel = formatRelativeSavedLabel(lastSavedAt);
  const activeDraftDisplayTitle = (() => {
    const rawTitle = (documents.find((doc) => doc.id === activeDocId)?.title || docTitle || '').trim();
    return rawTitle || (lastSavedAt ? SAVED_DRAFT_LABEL : 'Unsaved draft');
  })();

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
        { key: 'generate-toc', label: 'Generate table of content', detail: 'Build TOC and align headings', icon: BookOpen, color: 'text-cyan-500', prompt: 'Generate a table of contents for this document and align headings/content to it.' },
        { key: 'title-headers', label: 'Generate title/headers', detail: 'Auto-structure with strong headings', icon: Type, color: 'text-emerald-500', prompt: 'Generate a strong title and section headers for this document.' },
      ];

  const whiteboardAssistantActions = {
    ask: [
      { key: 'launch-plan', label: 'Generate launch plan', prompt: 'Generate a launch plan for Q2 Product Launch Strategy whiteboard.' },
      { key: 'breakdown-tasks', label: 'Break down into tasks', prompt: 'Break this whiteboard strategy into clear execution tasks with owners.' },
      { key: 'identify-risks', label: 'Identify risks', prompt: 'Identify the main launch risks in this whiteboard and suggest mitigations.' },
      { key: 'create-timeline', label: 'Create timeline', prompt: 'Create a timeline for this whiteboard strategy from May 1 to Jun 30.' },
    ],
    generate: [
      { key: 'summary', label: 'Generate board summary', prompt: 'Write a concise executive summary from this whiteboard board.' },
      { key: 'meeting-brief', label: 'Create meeting brief', prompt: 'Create a meeting brief from this whiteboard with goals and next steps.' },
      { key: 'sync-update', label: 'Draft status update', prompt: 'Draft a weekly status update from this whiteboard progress.' },
      { key: 'stakeholder-email', label: 'Compose stakeholder email', prompt: 'Compose a stakeholder-ready launch update email from this whiteboard.' },
    ],
    insights: [
      { key: 'conversion-gaps', label: 'Review conversion gaps', prompt: 'Analyze this whiteboard and report likely conversion bottlenecks.' },
      { key: 'goal-coverage', label: 'Check goal coverage', prompt: 'Check whether this whiteboard fully covers awareness, activation, conversion, and retention.' },
      { key: 'resource-risks', label: 'Evaluate dependencies', prompt: 'Evaluate key dependencies and resource risks in this whiteboard plan.' },
      { key: 'cadence-health', label: 'Assess launch cadence', prompt: 'Assess whether this whiteboard timeline cadence is realistic and balanced.' },
    ],
  };

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

  useEffect(() => {
    try {
      const savedThreads = JSON.parse(localStorage.getItem('rc.dm.threads') || 'null');
      const savedMessages = JSON.parse(localStorage.getItem('rc.dm.messages') || 'null');
      const savedFiles = JSON.parse(localStorage.getItem('rc.dm.files') || 'null');
      const savedDecisions = JSON.parse(localStorage.getItem('rc.dm.decisions') || 'null');
      const savedArchive = JSON.parse(localStorage.getItem('rc.dm.archive') || 'null');
      const savedThreadReplies = JSON.parse(localStorage.getItem('rc.dm.threadReplies') || 'null');
      if (Array.isArray(savedThreads) && savedThreads.length) {
        setDmThreads(savedThreads);
      }
      if (Array.isArray(savedMessages) && savedMessages.length) {
        setDmMessages(savedMessages);
      }
      if (Array.isArray(savedFiles)) {
        setDmFiles(savedFiles);
      }
      if (Array.isArray(savedDecisions)) {
        setDmDecisions(savedDecisions);
      }
      if (Array.isArray(savedArchive)) {
        setDmArchive(savedArchive);
      }
      if (Array.isArray(savedThreadReplies)) {
        setDmThreadReplies(savedThreadReplies);
      }
    } catch (_error) {
      // noop
    }
  }, []);

  useEffect(() => {
    localStorage.setItem('rc.dm.threads', JSON.stringify(dmThreads));
  }, [dmThreads]);

  useEffect(() => {
    localStorage.setItem('rc.dm.messages', JSON.stringify(dmMessages));
  }, [dmMessages]);

  useEffect(() => {
    localStorage.setItem('rc.dm.files', JSON.stringify(dmFiles));
  }, [dmFiles]);

  useEffect(() => {
    localStorage.setItem('rc.dm.decisions', JSON.stringify(dmDecisions));
  }, [dmDecisions]);

  useEffect(() => {
    localStorage.setItem('rc.dm.archive', JSON.stringify(dmArchive));
  }, [dmArchive]);

  useEffect(() => {
    localStorage.setItem('rc.dm.threadReplies', JSON.stringify(dmThreadReplies));
  }, [dmThreadReplies]);

  useEffect(() => {
    if (dmArchive.length) {
      return;
    }
    const seeded = [
      ...dmMessages.map((message) => ({
        id: `seed-msg-${message.id}`,
        type: 'message',
        threadId: message.threadId,
        threadTitle: dmThreads.find((thread) => thread.id === message.threadId)?.title || 'Thread',
        author: message.author,
        text: message.text,
        createdAt: message.createdAt,
      })),
      ...dmFiles.map((file) => ({
        id: `seed-file-${file.id}`,
        type: 'file',
        threadId: file.threadId,
        threadTitle: dmThreads.find((thread) => thread.id === file.threadId)?.title || 'Thread',
        author: 'system',
        fileName: file.name,
        createdAt: file.updatedAt,
      })),
      ...dmDecisions.map((decision) => ({
        id: `seed-decision-${decision.id}`,
        type: 'decision',
        threadId: decision.threadId,
        threadTitle: dmThreads.find((thread) => thread.id === decision.threadId)?.title || 'Thread',
        author: decision.by,
        decision: decision.summary,
        createdAt: decision.createdAt,
      })),
    ];
    setDmArchive(seeded.sort((a, b) => (b.createdAt || 0) - (a.createdAt || 0)).slice(0, 1200));
  }, [dmArchive.length, dmMessages, dmFiles, dmDecisions, dmThreads]);

  const formatDmRelative = (timestamp) => {
    const diff = Date.now() - Number(timestamp || Date.now());
    const mins = Math.max(0, Math.floor(diff / 60000));
    if (mins < 1) {
      return 'just now';
    }
    if (mins < 60) {
      return `${mins}m ago`;
    }
    const hours = Math.floor(mins / 60);
    if (hours < 24) {
      return `${hours}h ago`;
    }
    return `${Math.floor(hours / 24)}d ago`;
  };

  const activeDmThread = dmThreads.find((thread) => thread.id === dmActiveThreadId) || dmThreads[0] || null;
  const activeDmMessages = useMemo(() => dmMessages
    .filter((message) => message.threadId === (activeDmThread?.id || ''))
    .sort((a, b) => (a.createdAt || 0) - (b.createdAt || 0)), [dmMessages, activeDmThread?.id]);
  const activeDmThreadReplyMap = useMemo(() => {
    const map = new Map();
    dmThreadReplies
      .filter((reply) => reply.threadId === (activeDmThread?.id || ''))
      .forEach((reply) => {
        map.set(reply.parentMessageId, (map.get(reply.parentMessageId) || 0) + 1);
      });
    return map;
  }, [dmThreadReplies, activeDmThread?.id]);
  const activeDmParentMessage = useMemo(
    () => activeDmMessages.find((message) => message.id === dmActiveParentMessageId) || null,
    [activeDmMessages, dmActiveParentMessageId],
  );
  const activeDmThreadPanelReplies = useMemo(
    () => dmThreadReplies
      .filter((reply) => reply.parentMessageId === dmActiveParentMessageId)
      .sort((a, b) => (a.createdAt || 0) - (b.createdAt || 0)),
    [dmThreadReplies, dmActiveParentMessageId],
  );

  const dmSearchResults = useMemo(() => {
    const needle = String(dmSearchQuery || '').trim().toLowerCase();
    if (!needle) {
      return dmArchive.slice().sort((a, b) => (b.createdAt || 0) - (a.createdAt || 0)).slice(0, 40);
    }
    return dmArchive
      .filter((entry) => {
        const textBlob = `${entry.type || ''} ${entry.threadTitle || ''} ${entry.author || ''} ${entry.text || ''} ${entry.fileName || ''} ${entry.decision || ''}`.toLowerCase();
        return textBlob.includes(needle);
      })
      .sort((a, b) => (b.createdAt || 0) - (a.createdAt || 0));
  }, [dmArchive, dmSearchQuery]);

  const effectiveDmJoinedAt = dmJoinedAt || null;
  const visibleDmMessages = useMemo(() => {
    if (dmMemberView !== 'new-member' || !effectiveDmJoinedAt) {
      return activeDmMessages;
    }
    return activeDmMessages.filter((message) => (message.createdAt || 0) >= effectiveDmJoinedAt);
  }, [activeDmMessages, dmMemberView, effectiveDmJoinedAt]);

  const visibleDmSearchResults = useMemo(() => {
    if (dmMemberView !== 'new-member' || !effectiveDmJoinedAt) {
      return dmSearchResults;
    }
    return dmSearchResults.filter((entry) => (entry.createdAt || 0) >= effectiveDmJoinedAt);
  }, [dmSearchResults, dmMemberView, effectiveDmJoinedAt]);

  const dmThreadSummaries = useMemo(() => {
    return activeDmMessages
      .filter((message) => (activeDmThreadReplyMap.get(message.id) || 0) > 0)
      .map((message) => ({
        ...message,
        replyCount: activeDmThreadReplyMap.get(message.id) || 0,
      }))
      .sort((a, b) => (b.createdAt || 0) - (a.createdAt || 0));
  }, [activeDmMessages, activeDmThreadReplyMap]);

  const appendDmArchive = (entries) => {
    const list = Array.isArray(entries) ? entries : [entries];
    setDmArchive((prev) => [...list, ...prev].slice(0, 1200));
  };

  const openDmMessageThread = (messageId) => {
    setDmActiveParentMessageId(messageId);
    setDmThreadComposerValue('');
  };

  const sendDmThreadReply = () => {
    const text = String(dmThreadComposerValue || '').trim();
    if (!text || !activeDmThread || !activeDmParentMessage) {
      return;
    }
    const now = Date.now();
    const reply = {
      id: `dm-thread-reply-${now}`,
      threadId: activeDmThread.id,
      parentMessageId: activeDmParentMessage.id,
      author: 'You',
      role: 'you',
      text,
      createdAt: now,
    };

    setDmThreadReplies((prev) => [...prev, reply]);
    appendDmArchive({
      id: `arc-thread-${now}`,
      type: 'thread-reply',
      threadId: activeDmThread.id,
      threadTitle: activeDmThread.title,
      author: 'You',
      text,
      parentMessageId: activeDmParentMessage.id,
      parentMessageText: activeDmParentMessage.text,
      createdAt: now,
    });
    setDmThreadComposerValue('');
  };

  const classifyDmAttachmentKind = (file) => {
    const mime = String(file?.type || '').toLowerCase();
    const name = String(file?.name || '').toLowerCase();
    if (mime.startsWith('image/')) return 'image';
    if (mime.startsWith('audio/')) return 'audio';
    if (mime.includes('sheet') || /\.csv$|\.xlsx?$/.test(name)) return 'sheet';
    if (mime.includes('presentation') || /\.pptx?$/.test(name)) return 'deck';
    return 'doc';
  };

  const addDmAttachments = (fileList) => {
    const files = Array.from(fileList || []);
    if (!files.length) {
      return;
    }
    const nextItems = files.map((file) => ({
      id: `dm-attach-${Date.now()}-${Math.random().toString(16).slice(2, 8)}`,
      name: file.name,
      type: file.type,
      size: file.size,
      kind: classifyDmAttachmentKind(file),
      file,
    }));
    setDmPendingAttachments((prev) => [...prev, ...nextItems].slice(0, 20));
    showToast(`${files.length} attachment${files.length > 1 ? 's' : ''} added`);
  };

  const handleDmAttachmentInputChange = (event) => {
    addDmAttachments(event.target.files);
    event.target.value = '';
  };

  const sendDmMessage = () => {
    const text = String(dmComposerValue || '').trim();
    if ((!text && !dmPendingAttachments.length) || !activeDmThread) {
      return;
    }
    const now = Date.now();
    const attachedFiles = dmPendingAttachments.map((attachment, index) => ({
      id: `dm-file-${now}-${index}`,
      threadId: activeDmThread.id,
      name: attachment.name,
      kind: attachment.kind,
      updatedAt: now,
      size: attachment.size,
      mimeType: attachment.type,
    }));
    const messageText = text || `Shared ${attachedFiles.length} attachment${attachedFiles.length > 1 ? 's' : ''}`;
    const message = {
      id: `dm-${now}-${Math.floor(Math.random() * 1000)}`,
      threadId: activeDmThread.id,
      author: 'You',
      role: 'you',
      text: messageText,
      createdAt: now,
      files: attachedFiles,
      decisions: [],
    };
    const decisionSignals = ['decision', 'decided', 'approved', 'ship', 'finalized'];
    const hasDecisionSignal = decisionSignals.some((signal) => messageText.toLowerCase().includes(signal));

    setDmMessages((prev) => [...prev, message]);
    if (attachedFiles.length) {
      setDmFiles((prev) => [...attachedFiles, ...prev].slice(0, 300));
    }
    setDmThreads((prev) => prev.map((thread) => (
      thread.id === activeDmThread.id
        ? { ...thread, lastMessageAt: now }
        : thread
    )));

    const archiveEntries = [{
      id: `arc-msg-${now}`,
      type: 'message',
      threadId: activeDmThread.id,
      threadTitle: activeDmThread.title,
      author: 'You',
      text: messageText,
      createdAt: now,
    }];

    attachedFiles.forEach((file) => {
      archiveEntries.push({
        id: `arc-file-${file.id}`,
        type: 'file',
        threadId: activeDmThread.id,
        threadTitle: activeDmThread.title,
        author: 'You',
        fileName: file.name,
        createdAt: now,
      });
    });

    if (hasDecisionSignal) {
      const decision = {
        id: `dm-decision-${now}`,
        threadId: activeDmThread.id,
        summary: messageText,
        createdAt: now,
        by: 'You',
      };
      setDmDecisions((prev) => [decision, ...prev].slice(0, 200));
      archiveEntries.push({
        id: `arc-decision-${now}`,
        type: 'decision',
        threadId: activeDmThread.id,
        threadTitle: activeDmThread.title,
        author: 'You',
        decision: messageText,
        createdAt: now,
      });
    }

    appendDmArchive(archiveEntries);
    setDmComposerValue('');
    setDmPendingAttachments([]);
    setDmEmojiPickerOpen(false);
    setDmFormatMenuOpen(false);
    setDmComposerQuickMenuOpen(false);
    setDmScheduleMenuOpen(false);
  };

  const quickAttachDmFile = () => {
    if (!activeDmThread) {
      return;
    }
    const now = Date.now();
    const nextFile = {
      id: `dm-file-${now}`,
      threadId: activeDmThread.id,
      name: `Decision Notes ${new Date(now).toLocaleTimeString()}`,
      kind: 'doc',
      updatedAt: now,
    };
    setDmFiles((prev) => [nextFile, ...prev].slice(0, 300));
    appendDmArchive({
      id: `arc-file-${now}`,
      type: 'file',
      threadId: activeDmThread.id,
      threadTitle: activeDmThread.title,
      author: 'You',
      fileName: nextFile.name,
      createdAt: now,
    });
    showToast('File archived in conversation log');
  };

  if (productMode === 'dm') {
    const directMessages = ['Sarah Johnson', 'Alex Morgan', 'Michael Chen'];
    const teamChannels = ['Marketing', 'Engineering', 'Design', 'General'];
    const aiConversations = ['Orb (AI Assistant)', 'Marketing Agent', 'Research Agent'];
    const activeThreadFiles = dmFiles.filter((file) => file.threadId === activeDmThread?.id).slice(0, 3);
    const activeThreadDecisions = dmDecisions.filter((item) => item.threadId === activeDmThread?.id).slice(0, 3);
    const currentUserShort = 'J';
    const openDmWorkspaceTab = (tabKey, options = {}) => {
      if (tabKey === 'dm') {
        createDmExperience();
        return;
      }

      setProductMode('compose');
      setLeftSidebarOpen(true);
      if (rightPanelMaximized) {
        setRightPanelMaximized(false);
      }
      setRightSidebarOpen(true);
      setActiveRightTab(tabKey);
      if (tabKey === 'room') {
        setRoomState((prev) => prev || 'lobby');
      }
      if (options.meetingStageTab) {
        setActiveMeetingStageTab(options.meetingStageTab);
      }
    };
    const handleDmStartNewMessage = () => {
      setDmConversationTab('chat');
      setDmComposerValue('');
      setDmSearchQuery('');
      setDmActiveParentMessageId(null);
      showToast('Start a new channel message');
    };
    const handleDmQuickJump = (label) => {
      if (label === 'Threads') {
        setDmConversationTab('threads');
      } else if (label === 'AI Summary') {
        setDmConversationTab('ai-summary');
      } else if (label === 'Mentions' || label === 'Saved') {
        setDmSearchQuery(label.toLowerCase());
      } else {
        setDmConversationTab('chat');
      }
      showToast(`${label} opened`);
    };
    const handleDmComposerAction = (action) => {
      if (action === 'attach') {
        dmAnyAttachmentInputRef.current?.click();
        return;
      }
      if (action === 'emoji') {
        setDmEmojiPickerOpen((prev) => !prev);
        setDmFormatMenuOpen(false);
        setDmComposerQuickMenuOpen(false);
        setDmScheduleMenuOpen(false);
        return;
      }
      if (action === 'schedule') {
        setDmScheduleMenuOpen((prev) => !prev);
        setDmEmojiPickerOpen(false);
        setDmFormatMenuOpen(false);
        setDmComposerQuickMenuOpen(false);
        return;
      }
      if (action === 'format') {
        setDmFormatMenuOpen((prev) => !prev);
        setDmEmojiPickerOpen(false);
        setDmComposerQuickMenuOpen(false);
        setDmScheduleMenuOpen(false);
        return;
      }
      if (action === 'plus') {
        setDmComposerQuickMenuOpen((prev) => !prev);
        setDmEmojiPickerOpen(false);
        setDmFormatMenuOpen(false);
        setDmScheduleMenuOpen(false);
      }
    };

    return (
      <div className={`flex h-screen bg-[#f5f6fb] text-slate-800 overflow-hidden relative ${isDarkMode ? 'app-dark' : ''}`} style={{ fontFamily: resolveFontFamily(editorFont) }}>
        {toastMessage && (
          <div className="absolute top-5 right-6 max-w-[380px] bg-white/95 backdrop-blur border border-violet-100 text-slate-700 text-xs font-medium px-4 py-2.5 rounded-xl shadow-[0_12px_35px_-18px_rgba(91,33,182,0.45)] z-[420] flex items-center gap-2 transition-all duration-300">
            <span className="inline-block w-2 h-2 rounded-full bg-violet-500"></span>
            <span>{toastMessage}</span>
          </div>
        )}

        <aside className="w-[250px] shrink-0 border-r border-gray-200 bg-[#f1f2f6] flex flex-col">
          <div className="px-4 py-3 border-b border-gray-100">
            <div className="flex items-center justify-between">
              <div className="text-[19px] font-semibold text-slate-900">Regaarder</div>
              <button type="button" onClick={() => showToast('Workspace switcher coming next')} className="text-gray-400 hover:text-gray-600">
                <ChevronDown size={16} />
              </button>
            </div>
          </div>

          <div className="px-4 pt-4 pb-3">
            <button type="button" onClick={handleDmStartNewMessage} className="w-full h-9 rounded-xl bg-violet-600 hover:bg-violet-700 text-white text-sm font-medium flex items-center justify-between px-3">
              <span>New message</span>
              <KeyRound size={14} />
            </button>
          </div>

          <div className="px-3 space-y-1 text-[14px]">
            {[
              { label: 'Inbox', count: 6 },
              { label: 'Threads', count: dmThreadSummaries.length },
              { label: 'Mentions', count: 2 },
              { label: 'Saved', count: 0 },
              { label: 'AI Summary', count: visibleDmSearchResults.filter((entry) => entry.type === 'decision').length },
            ].map((item) => (
              <button
                key={item.label}
                type="button"
                onClick={() => handleDmQuickJump(item.label)}
                className="w-full h-8 px-2 rounded-lg text-slate-600 hover:bg-slate-50 flex items-center justify-between"
              >
                <span className="flex items-center gap-2">
                  <span className="w-4 h-4 rounded border border-slate-300" />
                  {item.label}
                </span>
                {item.count > 0 ? <span className="text-[11px] font-semibold text-slate-400">{item.count}</span> : <span />}
              </button>
            ))}
          </div>

          <div className="px-3 pt-3 pb-2 border-t border-slate-200 mt-2">
            <div className="text-[10px] font-semibold uppercase tracking-wide text-slate-500 mb-2">History Scope</div>
            <div className="grid grid-cols-2 gap-1.5">
              <button
                type="button"
                onClick={() => setDmMemberView('member')}
                className={`h-7 rounded-md text-[11px] font-medium border ${dmMemberView === 'member' ? 'border-violet-300 bg-violet-50 text-violet-700' : 'border-slate-200 bg-white text-slate-600 hover:bg-slate-50'}`}
              >
                Full Log
              </button>
              <button
                type="button"
                onClick={() => {
                  setDmMemberView('new-member');
                  setDmJoinedAt((prev) => prev || Date.now() - (1000 * 60 * 15));
                }}
                className={`h-7 rounded-md text-[11px] font-medium border ${dmMemberView === 'new-member' ? 'border-violet-300 bg-violet-50 text-violet-700' : 'border-slate-200 bg-white text-slate-600 hover:bg-slate-50'}`}
              >
                New Member
              </button>
            </div>
          </div>

          <div className="flex-1 overflow-y-auto thin-scrollbar px-3 pt-4 pb-3 space-y-4">
            <div>
              <div className="px-2 pb-1 text-[11px] font-semibold uppercase tracking-wide text-slate-400 flex items-center justify-between">
                <span>Direct Messages</span>
                <button type="button" onClick={() => showToast('Invite teammate flow coming next')} className="text-slate-400 hover:text-slate-600"><Plus size={14} /></button>
              </div>
              <div className="space-y-1">
                {directMessages.map((name) => (
                  <button key={name} type="button" onClick={() => showToast(`${name} conversation opened`)} className="w-full h-8 px-2 rounded-lg text-slate-700 hover:bg-slate-50 flex items-center gap-2 text-left">
                    <span className="w-2 h-2 rounded-full bg-emerald-500" />
                    <span className="truncate">{name}</span>
                  </button>
                ))}
              </div>
            </div>

            <div>
              <div className="px-2 pb-1 text-[11px] font-semibold uppercase tracking-wide text-slate-400 flex items-center justify-between">
                <span>Teams</span>
                <button type="button" onClick={() => showToast('Create team flow coming next')} className="text-slate-400 hover:text-slate-600"><Plus size={14} /></button>
              </div>
              <div className="space-y-1">
                {teamChannels.map((team, index) => (
                  <button key={team} type="button" onClick={() => showToast(`${team} team opened`)} className="w-full h-8 px-2 rounded-lg text-slate-700 hover:bg-slate-50 flex items-center gap-2 text-left">
                    <span className={`w-4 h-4 rounded text-white text-[9px] font-bold flex items-center justify-center ${index === 0 ? 'bg-violet-500' : index === 1 ? 'bg-sky-500' : index === 2 ? 'bg-fuchsia-500' : 'bg-emerald-500'}`}>{team.charAt(0)}</span>
                    <span className="truncate">{team}</span>
                  </button>
                ))}
              </div>
            </div>

            <div>
              <div className="px-2 pb-1 text-[11px] font-semibold uppercase tracking-wide text-slate-400 flex items-center justify-between">
                <span>Channels</span>
                <button type="button" onClick={() => showToast('Create channel flow coming next')} className="text-slate-400 hover:text-slate-600"><Plus size={14} /></button>
              </div>
              <div className="space-y-1">
                {dmThreads.map((thread) => {
                  const active = activeDmThread?.id === thread.id;
                  return (
                    <button
                      key={thread.id}
                      type="button"
                      onClick={() => setDmActiveThreadId(thread.id)}
                      className={`w-full h-8 px-2 rounded-lg flex items-center justify-between text-left ${active ? 'bg-violet-50 text-violet-700' : 'text-slate-700 hover:bg-slate-50'}`}
                    >
                      <span className="truncate"># {thread.title.replace(/\s+/g, '-').toLowerCase()}</span>
                      {thread.unread > 0 ? <span className="w-1.5 h-1.5 rounded-full bg-violet-500" /> : <span />}
                    </button>
                  );
                })}
              </div>
            </div>

            <div>
              <div className="px-2 pb-1 text-[11px] font-semibold uppercase tracking-wide text-slate-400 flex items-center justify-between">
                <span>AI Conversations</span>
                <button type="button" onClick={() => showToast('New AI conversation flow coming next')} className="text-slate-400 hover:text-slate-600"><Plus size={14} /></button>
              </div>
              <div className="space-y-1">
                {aiConversations.map((item, index) => (
                  <button key={item} type="button" onClick={() => showToast(`${item} opened`)} className="w-full h-8 px-2 rounded-lg text-slate-700 hover:bg-slate-50 flex items-center justify-between text-left">
                    <span className="truncate">{item}</span>
                    {index === 0 ? <span className="w-1.5 h-1.5 rounded-full bg-emerald-500" /> : <span className="w-1.5 h-1.5 rounded-full bg-violet-500" />}
                  </button>
                ))}
              </div>
            </div>
          </div>

          <div className="border-t border-gray-100 p-3 flex items-center justify-between">
            <div className="w-8 h-8 rounded-full bg-slate-200 text-slate-700 text-sm font-semibold flex items-center justify-center">{currentUserShort}</div>
            <div className="flex items-center gap-2 text-slate-400">
              <Clock size={15} />
              <Settings size={15} />
            </div>
          </div>
        </aside>

        <main className="flex-1 min-w-0 flex bg-white">
          <section className="flex-1 min-w-0 flex flex-col border-r border-gray-200 bg-white">
            <div className="h-[74px] bg-white border-b border-gray-200 px-6 flex items-center justify-between gap-4">
              <div>
                <div className="text-[29px] leading-none">🚀 <span className="text-2xl font-semibold text-slate-900">{activeDmThread?.title || 'Beta Launch'}</span></div>
                <div className="text-sm text-slate-400 mt-1">{activeDmThread?.members || 12} members | Add a description</div>
              </div>
              <div className="flex items-center gap-3 w-[440px] max-w-[48%]">
                <div className="relative flex-1">
                  <Search size={15} className="absolute left-3 top-1/2 -translate-y-1/2 text-slate-400" />
                  <input
                    value={dmSearchQuery}
                    onChange={(event) => setDmSearchQuery(event.target.value)}
                    placeholder={`Search in ${activeDmThread?.title || 'Beta Launch'}`}
                    className="w-full h-10 rounded-xl border border-slate-200 bg-slate-50 pl-9 pr-3 text-sm text-slate-700 outline-none focus:border-violet-300"
                  />
                </div>
                <button type="button" onClick={() => showToast('Huddle starting flow coming next')} className="text-slate-400 hover:text-slate-600"><Video size={16} /></button>
                <button type="button" onClick={() => showToast('Member list opened')} className="text-slate-400 hover:text-slate-600"><Users size={16} /></button>
                <button type="button" onClick={() => showToast('Channel actions opened')} className="text-slate-400 hover:text-slate-600"><MoreHorizontal size={16} /></button>
              </div>
            </div>

            <div className="h-11 bg-white border-b border-gray-200 px-6 flex items-center gap-7 text-[14px]">
              {[
                { key: 'chat', label: 'Chat' },
                { key: 'threads', label: 'Threads' },
                { key: 'highlights', label: 'Highlights' },
                { key: 'ai-summary', label: 'AI Summary' },
              ].map((tab) => (
                <button
                  key={tab.key}
                  type="button"
                  onClick={() => setDmConversationTab(tab.key)}
                  className={`h-full border-b-2 transition-colors ${dmConversationTab === tab.key ? 'border-violet-500 text-violet-600 font-semibold' : 'border-transparent text-slate-500 hover:text-slate-700'}`}
                >
                  {tab.label}
                </button>
              ))}
            </div>

            <div className="px-6 pt-3 pb-2 border-b border-gray-200 bg-white">
              <div className="rounded-xl border border-slate-200 bg-slate-50 px-4 py-3 flex items-center justify-between gap-3">
                <div className="flex items-center gap-3">
                  <Sparkles size={14} className="text-violet-500" />
                  <div>
                    <div className="text-xs text-slate-500">Pinned by Sarah</div>
                    <div className="text-sm text-slate-700">Product Hunt launch is scheduled for May 15! Let&apos;s make it amazing 🚀</div>
                  </div>
                </div>
                <button type="button" onClick={() => setDmConversationTab('highlights')} className="h-8 px-3 rounded-lg border border-violet-200 text-violet-600 text-xs font-semibold bg-violet-50">View details</button>
              </div>
            </div>

            <div className="flex-1 overflow-y-auto thin-scrollbar px-6 pt-4 pb-5 space-y-4 bg-white">
              {dmMemberView === 'new-member' && effectiveDmJoinedAt && (
                <div className="rounded-lg border border-amber-200 bg-amber-50 px-3 py-2 text-xs text-amber-800">
                  New-member mode: viewing history since {new Date(effectiveDmJoinedAt).toLocaleString()}.
                </div>
              )}

              {dmConversationTab === 'chat' && (
                <>
                  <div className="w-fit mx-auto rounded-full bg-white border border-slate-200 px-3 py-1 text-xs text-slate-500">Today</div>
                  {visibleDmMessages.length === 0 && (
                    <div className="rounded-lg border border-slate-200 bg-slate-50 px-4 py-6 text-center">
                      <div className="text-sm font-semibold text-slate-700">No messages yet in this channel</div>
                      <div className="text-xs text-slate-500 mt-1">Start the conversation or attach a file to create searchable context.</div>
                      <button
                        type="button"
                        onClick={handleDmStartNewMessage}
                        className="mt-3 h-8 px-3 rounded-lg bg-violet-600 text-white text-xs font-semibold hover:bg-violet-700"
                      >
                        Send first message
                      </button>
                    </div>
                  )}
                  {visibleDmMessages.map((message, index) => {
                    const isAssistant = message.role === 'assistant';
                    const initials = message.author.split(' ').map((part) => part.charAt(0)).join('').slice(0, 2).toUpperCase();
                    const bubbleColor = message.role === 'you'
                      ? 'bg-[#eef2ff] border-violet-200'
                      : isAssistant
                        ? 'bg-[#f3f0ff] border-violet-200'
                        : 'bg-white border-slate-200';
                    const replyCount = activeDmThreadReplyMap.get(message.id) || 0;

                    return (
                      <article key={message.id} className="flex items-start gap-3">
                        <div className={`w-8 h-8 rounded-full flex items-center justify-center text-[11px] font-semibold ${isAssistant ? 'bg-violet-100 text-violet-700' : 'bg-slate-200 text-slate-700'}`}>
                          {isAssistant ? 'Orb' : initials}
                        </div>
                        <div className="flex-1 min-w-0">
                          <div className="flex items-center gap-2 text-sm">
                            <span className="font-semibold text-slate-900">{message.author}</span>
                            {isAssistant ? <span className="text-[10px] px-1.5 py-0.5 rounded bg-violet-100 text-violet-600 font-semibold">APP</span> : null}
                            <span className="text-xs text-slate-400">{formatDmRelative(message.createdAt)}</span>
                          </div>
                          <div className={`mt-1 rounded-xl border px-3 py-2.5 text-[15px] text-slate-700 ${bubbleColor}`}>
                            {message.text}

                            {Array.isArray(message.files) && message.files.length > 0 && (
                              <div className="mt-3 rounded-lg border border-slate-200 bg-white px-3 py-2 max-w-[290px] flex items-center justify-between">
                                <div className="flex items-center gap-2">
                                  <FileText size={15} className="text-violet-600" />
                                  <div>
                                    <div className="text-sm font-medium text-slate-700">{message.files[0].name}</div>
                                    <div className="text-[11px] text-slate-400">Updated recently</div>
                                  </div>
                                </div>
                                <button type="button" onClick={() => showToast(`Opened ${message.files[0].name}`)} className="text-xs text-violet-600 font-semibold">Open</button>
                              </div>
                            )}

                            {isAssistant && (
                              <div className="mt-3 rounded-lg border border-violet-200 bg-violet-50 px-3 py-2.5 text-sm text-slate-700">
                                <div className="font-semibold mb-1">Summary</div>
                                <ul className="list-disc pl-5 space-y-0.5 text-sm text-slate-700">
                                  <li>Landing page v2 is ready for review.</li>
                                  <li>Team feedback is in the document.</li>
                                  <li>Next step: Final approval from design team.</li>
                                </ul>
                              </div>
                            )}
                          </div>
                          <div className="mt-1.5 flex items-center gap-2 text-xs text-slate-400">
                            <button type="button" onClick={() => showToast('Reaction added')} className="rounded-full border border-slate-200 bg-white px-1.5 py-0.5">🔥 {index === 0 ? 3 : 2}</button>
                            <button type="button" onClick={() => showToast('Reaction added')} className="rounded-full border border-slate-200 bg-white px-1.5 py-0.5">🙌 {index === 0 ? 2 : 0}</button>
                            <button type="button" onClick={() => showToast('Reaction picker coming next')} className="rounded-full border border-slate-200 bg-white px-1.5 py-0.5">☺</button>
                            <button
                              type="button"
                              onClick={() => openDmMessageThread(message.id)}
                              className="rounded-full border border-violet-200 bg-violet-50 px-2 py-0.5 text-violet-700 hover:bg-violet-100"
                            >
                              {replyCount > 0 ? `${replyCount} replies` : 'Reply in thread'}
                            </button>
                          </div>
                        </div>
                      </article>
                    );
                  })}
                </>
              )}

              {dmConversationTab === 'threads' && (
                <div className="space-y-2">
                  {dmThreadSummaries.length === 0 && (
                    <div className="rounded-lg border border-slate-200 bg-slate-50 px-3 py-2 text-sm text-slate-500">No threaded conversations yet.</div>
                  )}
                  {dmThreadSummaries.map((item) => (
                    <button
                      key={item.id}
                      type="button"
                      onClick={() => openDmMessageThread(item.id)}
                      className="w-full text-left rounded-lg border border-slate-200 bg-white px-3 py-2 hover:border-violet-300"
                    >
                      <div className="text-sm font-semibold text-slate-800">{item.author}</div>
                      <div className="text-sm text-slate-600 mt-0.5 line-clamp-2">{item.text}</div>
                      <div className="text-xs text-violet-600 mt-1">{item.replyCount} replies • Open thread</div>
                    </button>
                  ))}
                </div>
              )}

              {dmConversationTab === 'highlights' && (
                <div className="space-y-2">
                  {activeThreadDecisions.length === 0 && (
                    <div className="rounded-lg border border-slate-200 bg-slate-50 px-3 py-2 text-sm text-slate-500">No highlights yet. Decisions and notable updates will appear here.</div>
                  )}
                  {activeThreadDecisions.map((decision) => (
                    <div key={decision.id} className="rounded-lg border border-amber-200 bg-amber-50 px-3 py-2">
                      <div className="text-sm font-semibold text-amber-900">Decision</div>
                      <div className="text-sm text-amber-800 mt-0.5">{decision.summary}</div>
                      <div className="text-xs text-amber-700 mt-1">{decision.by} • {formatDmRelative(decision.createdAt)}</div>
                    </div>
                  ))}
                </div>
              )}

              {dmConversationTab === 'ai-summary' && (
                <div className="space-y-2">
                  {visibleDmSearchResults.length === 0 && (
                    <div className="rounded-lg border border-slate-200 bg-slate-50 px-3 py-2 text-sm text-slate-500">No searchable results yet for this scope.</div>
                  )}
                  {visibleDmSearchResults.slice(0, 30).map((entry) => (
                    <div key={entry.id} className="rounded-lg border border-slate-200 bg-white px-3 py-2">
                      <div className="text-[10px] uppercase tracking-wide text-slate-400">{entry.type || 'record'}</div>
                      <div className="text-sm font-semibold text-slate-700">{entry.threadTitle || activeDmThread?.title}</div>
                      <div className="text-sm text-slate-600 mt-0.5">{entry.text || entry.fileName || entry.decision || 'Archived record'}</div>
                    </div>
                  ))}
                </div>
              )}
            </div>

            <div className="p-5 border-t border-gray-200 bg-white">
              <div className="rounded-xl border border-slate-200 bg-white px-3 py-2.5">
                <input
                  ref={dmAnyAttachmentInputRef}
                  type="file"
                  multiple
                  className="hidden"
                  onChange={handleDmAttachmentInputChange}
                />
                <input
                  ref={dmImageAttachmentInputRef}
                  type="file"
                  multiple
                  accept="image/*"
                  className="hidden"
                  onChange={handleDmAttachmentInputChange}
                />
                <input
                  ref={dmAudioAttachmentInputRef}
                  type="file"
                  multiple
                  accept="audio/*"
                  className="hidden"
                  onChange={handleDmAttachmentInputChange}
                />

                <textarea
                  value={dmComposerValue}
                  onChange={(event) => setDmComposerValue(event.target.value)}
                  placeholder={`Message #${(activeDmThread?.title || 'beta-launch').replace(/\s+/g, '-').toLowerCase()}`}
                  rows={2}
                  className="w-full resize-none bg-transparent outline-none border-none text-sm text-slate-700 placeholder:text-slate-400"
                />

                {dmPendingAttachments.length > 0 && (
                  <div className="mt-2 flex flex-wrap gap-1.5">
                    {dmPendingAttachments.map((attachment) => (
                      <button
                        key={attachment.id}
                        type="button"
                        onClick={() => setDmPendingAttachments((prev) => prev.filter((item) => item.id !== attachment.id))}
                        className="inline-flex items-center gap-1.5 rounded-full border border-slate-200 bg-slate-50 px-2 py-1 text-[11px] text-slate-600"
                        title="Click to remove"
                      >
                        <Paperclip size={11} />
                        <span className="truncate max-w-[140px]">{attachment.name}</span>
                        <X size={11} className="text-slate-400" />
                      </button>
                    ))}
                  </div>
                )}

                {dmComposerQuickMenuOpen && (
                  <div className="mt-2 rounded-lg border border-slate-200 bg-slate-50 p-2 flex flex-wrap gap-1.5 text-xs">
                    <button type="button" onClick={() => dmAnyAttachmentInputRef.current?.click()} className="px-2 py-1 rounded border border-slate-200 bg-white text-slate-700 hover:border-violet-300">Upload file</button>
                    <button type="button" onClick={() => dmImageAttachmentInputRef.current?.click()} className="px-2 py-1 rounded border border-slate-200 bg-white text-slate-700 hover:border-violet-300">Upload image</button>
                    <button type="button" onClick={() => dmAudioAttachmentInputRef.current?.click()} className="px-2 py-1 rounded border border-slate-200 bg-white text-slate-700 hover:border-violet-300">Upload audio</button>
                    <button type="button" onClick={() => setDmComposerValue((prev) => `${prev}${prev ? ' ' : ''}https://`)} className="px-2 py-1 rounded border border-slate-200 bg-white text-slate-700 hover:border-violet-300">Add link</button>
                  </div>
                )}

                {dmFormatMenuOpen && (
                  <div className="mt-2 rounded-lg border border-slate-200 bg-slate-50 p-2 flex flex-wrap gap-1.5 text-xs">
                    <button type="button" onClick={() => setDmComposerValue((prev) => `${prev}${prev ? ' ' : ''}**bold**`)} className="px-2 py-1 rounded border border-slate-200 bg-white text-slate-700">Bold</button>
                    <button type="button" onClick={() => setDmComposerValue((prev) => `${prev}${prev ? ' ' : ''}_italic_`)} className="px-2 py-1 rounded border border-slate-200 bg-white text-slate-700">Italic</button>
                    <button type="button" onClick={() => setDmComposerValue((prev) => `${prev}${prev ? '\n' : ''}> quote`)} className="px-2 py-1 rounded border border-slate-200 bg-white text-slate-700">Quote</button>
                    <button type="button" onClick={() => setDmComposerValue((prev) => `${prev}${prev ? '\n' : ''}- item`)} className="px-2 py-1 rounded border border-slate-200 bg-white text-slate-700">Bullets</button>
                  </div>
                )}

                {dmEmojiPickerOpen && (
                  <div className="mt-2 rounded-lg border border-slate-200 bg-slate-50 p-2 flex flex-wrap gap-1.5 text-lg">
                    {['🙂', '🔥', '✅', '🎯', '🚀', '👏', '🎉', '💡', '📌', '🤝', '❤️', '😄'].map((emoji) => (
                      <button
                        key={emoji}
                        type="button"
                        onClick={() => setDmComposerValue((prev) => `${prev}${prev ? ' ' : ''}${emoji}`)}
                        className="w-8 h-8 rounded-md border border-slate-200 bg-white hover:bg-violet-50"
                      >
                        {emoji}
                      </button>
                    ))}
                  </div>
                )}

                {dmScheduleMenuOpen && (
                  <div className="mt-2 rounded-lg border border-slate-200 bg-slate-50 p-2 flex flex-wrap gap-1.5 text-xs">
                    {['in 10 minutes', 'in 1 hour', 'tomorrow 9:00 AM', 'next Monday 9:00 AM'].map((slot) => (
                      <button
                        key={slot}
                        type="button"
                        onClick={() => {
                          setDmComposerValue((prev) => `${prev}${prev ? ' ' : ''}[scheduled ${slot}]`);
                          setDmScheduleMenuOpen(false);
                          showToast(`Scheduled for ${slot}`);
                        }}
                        className="px-2 py-1 rounded border border-slate-200 bg-white text-slate-700 hover:border-violet-300"
                      >
                        {slot}
                      </button>
                    ))}
                  </div>
                )}

                <div className="mt-2 flex items-center justify-between">
                  <div className="flex items-center gap-3 text-slate-400">
                    <button type="button" onClick={() => handleDmComposerAction('plus')} className="hover:text-violet-600"><Plus size={16} /></button>
                    <button type="button" onClick={() => handleDmComposerAction('format')} className="hover:text-violet-600"><AlignLeft size={15} /></button>
                    <button type="button" onClick={() => handleDmComposerAction('emoji')} className="hover:text-violet-600"><Smile size={15} /></button>
                    <button type="button" onClick={() => handleDmComposerAction('attach')} className="hover:text-violet-600"><Paperclip size={15} /></button>
                    <button type="button" onClick={() => handleDmComposerAction('schedule')} className="hover:text-violet-600"><Clock size={15} /></button>
                  </div>
                  <button
                    type="button"
                    onClick={sendDmMessage}
                    disabled={!String(dmComposerValue || '').trim()}
                    className={`w-8 h-8 rounded-full text-white flex items-center justify-center ${String(dmComposerValue || '').trim() ? 'bg-violet-600 hover:bg-violet-700' : 'bg-violet-300 cursor-not-allowed'}`}
                  >
                    <Send size={14} />
                  </button>
                </div>
              </div>
            </div>
          </section>

          {activeDmParentMessage && (
            <aside className="w-[320px] shrink-0 border-r border-gray-200 bg-white flex flex-col">
              <div className="h-12 px-3 border-b border-gray-200 flex items-center justify-between">
                <div className="text-sm font-semibold text-slate-800">Thread</div>
                <button
                  type="button"
                  onClick={() => {
                    setDmActiveParentMessageId(null);
                    setDmThreadComposerValue('');
                  }}
                  className="text-slate-400 hover:text-slate-700"
                >
                  <X size={14} />
                </button>
              </div>

              <div className="flex-1 overflow-y-auto thin-scrollbar p-3 space-y-3">
                <div className="rounded-lg border border-slate-200 bg-slate-50 px-3 py-2">
                  <div className="text-sm font-semibold text-slate-800">{activeDmParentMessage.author}</div>
                  <div className="text-sm text-slate-700 mt-0.5">{activeDmParentMessage.text}</div>
                </div>

                {activeDmThreadPanelReplies.length === 0 && (
                  <div className="rounded-lg border border-slate-200 bg-white px-3 py-2 text-sm text-slate-500">
                    No replies in this thread yet. Be the first to reply.
                  </div>
                )}

                {activeDmThreadPanelReplies.map((reply) => (
                  <div key={reply.id} className="rounded-lg border border-slate-200 bg-white px-3 py-2">
                    <div className="text-sm font-semibold text-slate-800">{reply.author}</div>
                    <div className="text-sm text-slate-700 mt-0.5">{reply.text}</div>
                    <div className="text-xs text-slate-400 mt-1">{formatDmRelative(reply.createdAt)}</div>
                  </div>
                ))}
              </div>

              <div className="border-t border-gray-200 p-3">
                <textarea
                  value={dmThreadComposerValue}
                  onChange={(event) => setDmThreadComposerValue(event.target.value)}
                  rows={2}
                  placeholder="Reply in thread..."
                  className="w-full resize-none rounded-lg border border-slate-200 px-2 py-1.5 text-sm outline-none focus:border-violet-300"
                />
                <div className="mt-2 flex justify-end">
                  <button
                    type="button"
                    onClick={sendDmThreadReply}
                    className="h-8 px-3 rounded-lg bg-violet-600 text-white text-xs font-semibold hover:bg-violet-700"
                  >
                    Reply
                  </button>
                </div>
              </div>
            </aside>
          )}

          <aside className="w-[360px] shrink-0 bg-white p-4 overflow-y-auto thin-scrollbar">
            <div className="rounded-2xl border border-slate-200 bg-white p-4 mb-3">
              <div className="flex items-start justify-between">
                <div>
                  <div className="text-2xl">🚀 <span className="text-3xl font-semibold text-slate-900">{activeDmThread?.title || 'Beta Launch'}</span></div>
                  <div className="text-xs text-slate-400 mt-1">Private project</div>
                </div>
                <button type="button" onClick={() => showToast('Project panel collapsed')} className="text-slate-400 hover:text-slate-600"><X size={14} /></button>
              </div>

              <div className="mt-3 grid grid-cols-6 gap-2 text-[10px] text-slate-500">
                {['Overview', 'Tasks', 'Files', 'Meetings', 'Docs', 'People'].map((tab, index) => (
                  <div key={tab} className={`text-center pb-1 border-b-2 ${index === 0 ? 'border-violet-500 text-violet-600 font-semibold' : 'border-transparent'}`}>{tab}</div>
                ))}
              </div>

              <div className="mt-3 rounded-xl border border-slate-200 bg-slate-50 p-3">
                <div className="text-sm font-semibold text-slate-800">About this project</div>
                <p className="text-sm text-slate-500 mt-1">Coordinating everything for our beta launch on May 15.</p>
                <p className="text-xs text-slate-400 mt-1">Workspace-managed identity and searchable team history are retained for onboarding continuity.</p>
                <button type="button" onClick={() => showToast('Full project brief opened')} className="mt-2 text-xs text-violet-600 font-medium">Show more</button>
              </div>
            </div>

            <div className="rounded-2xl border border-slate-200 bg-white p-4 mb-3">
              <div className="flex items-center justify-between">
                <div className="text-sm font-semibold text-slate-800">Tasks</div>
                <button type="button" onClick={() => openDmWorkspaceTab('tasks')} className="text-xs text-violet-600 font-medium">View all</button>
              </div>
              <div className="mt-3 space-y-2.5 text-sm text-slate-700">
                {[
                  { name: 'Review landing page', tag: 'High', when: 'Today' },
                  { name: 'Finalize Product Hunt copy', tag: 'Medium', when: 'Tomorrow' },
                  { name: 'Create launch video', tag: 'Medium', when: 'May 14' },
                ].map((task) => (
                  <div key={task.name} className="flex items-center justify-between gap-2">
                    <div className="flex items-center gap-2 min-w-0">
                      <span className="w-4 h-4 rounded border border-slate-300" />
                      <span className="truncate">{task.name}</span>
                      <span className="text-[10px] px-1.5 py-0.5 rounded-full bg-violet-50 text-violet-600">{task.tag}</span>
                    </div>
                    <span className="text-xs text-slate-400">{task.when}</span>
                  </div>
                ))}
              </div>
              <button type="button" onClick={() => showToast('Task creation flow coming next')} className="mt-2 text-xs text-violet-600">+ Add task</button>
            </div>

            <div className="rounded-2xl border border-slate-200 bg-white p-4 mb-3">
              <div className="flex items-center justify-between">
                <div className="text-sm font-semibold text-slate-800">Files</div>
                <button type="button" onClick={() => openDmWorkspaceTab('room', { meetingStageTab: 'files' })} className="text-xs text-violet-600 font-medium">View all</button>
              </div>
              <div className="mt-3 space-y-2">
                {activeThreadFiles.length === 0 && (
                  <div className="rounded-lg border border-slate-200 bg-slate-50 px-3 py-2 text-sm text-slate-500">No files shared in this channel yet.</div>
                )}
                {activeThreadFiles.map((fileItem) => (
                  <div key={fileItem.id} className="flex items-start justify-between gap-2">
                    <div className="flex items-start gap-2 min-w-0">
                      <FileText size={15} className="text-violet-600 mt-0.5" />
                      <div className="min-w-0">
                        <div className="text-sm text-slate-700 truncate">{fileItem.name}</div>
                        <div className="text-xs text-slate-400">Updated {formatDmRelative(fileItem.updatedAt)}</div>
                      </div>
                    </div>
                    <button type="button" onClick={() => showToast(`Actions for ${fileItem.name}`)} className="text-slate-400 hover:text-slate-600"><MoreHorizontal size={14} /></button>
                  </div>
                ))}
              </div>
            </div>

            <div className="rounded-2xl border border-slate-200 bg-white p-4 mb-3">
              <div className="flex items-center justify-between">
                <div className="text-sm font-semibold text-slate-800">Upcoming Meetings</div>
                <button type="button" onClick={() => openDmWorkspaceTab('calendar')} className="text-xs text-violet-600 font-medium">View all</button>
              </div>
              <div className="mt-3 rounded-xl border border-slate-200 p-3 flex items-center justify-between">
                <div>
                  <div className="text-sm text-slate-700">Launch Planning Meeting</div>
                  <div className="text-xs text-slate-400">Tomorrow, 10:00 AM</div>
                </div>
                <div className="text-xs text-violet-600 font-semibold">+3</div>
              </div>
            </div>

            <div className="rounded-2xl border border-slate-200 bg-white p-4">
              <div className="flex items-center justify-between">
                <div className="text-sm font-semibold text-slate-800">People</div>
                <button type="button" onClick={() => openDmWorkspaceTab('people')} className="text-xs text-violet-600 font-medium">View all</button>
              </div>
              <div className="mt-3 flex items-center gap-2 flex-wrap">
                {['SJ', 'JD', 'AM', 'MC', 'OR'].map((name) => (
                  <div key={name} className="w-8 h-8 rounded-full bg-slate-200 text-slate-700 text-[11px] font-semibold flex items-center justify-center">{name}</div>
                ))}
                <div className="w-8 h-8 rounded-full bg-slate-100 text-slate-500 text-[11px] font-semibold flex items-center justify-center">+7</div>
              </div>
              {activeThreadDecisions.length > 0 && (
                <div className="mt-3 rounded-xl border border-violet-100 bg-violet-50 p-2.5">
                  <div className="text-[11px] font-semibold text-violet-700 uppercase tracking-wide mb-1">Recent Decision</div>
                  <div className="text-xs text-violet-800">{activeThreadDecisions[0].summary}</div>
                </div>
              )}
              {activeThreadDecisions.length === 0 && (
                <div className="mt-3 rounded-xl border border-slate-200 bg-slate-50 p-2.5 text-xs text-slate-500">
                  No decisions logged yet for this channel.
                </div>
              )}
            </div>
          </aside>
        </main>

        <div className="w-[74px] border-l border-gray-100 bg-[#FAFAFC] flex flex-col items-center py-4 gap-6 shrink-0 select-none overflow-y-auto overflow-x-visible thin-scrollbar">
          <div
            onClick={() => openDmWorkspaceTab('chat')}
            className="flex flex-col items-center gap-1 cursor-pointer transition-colors text-gray-400 hover:text-violet-600"
          >
            <div className="p-2 rounded-xl transition-all"><MessageCircle size={20} /></div>
            <span className="text-[9px] font-semibold">Chat</span>
          </div>

          <div
            onClick={() => openDmWorkspaceTab('dm')}
            className={`flex flex-col items-center gap-1 cursor-pointer transition-colors ${productMode === 'dm' ? 'text-violet-600' : 'text-gray-400 hover:text-violet-600'}`}
          >
            <div className={`p-2 rounded-xl transition-all ${productMode === 'dm' ? 'bg-violet-100' : ''}`}><MessageSquare size={20} /></div>
            <span className="text-[9px] font-semibold">DMs</span>
          </div>

          <div
            onClick={() => openDmWorkspaceTab('assistant')}
            className="flex flex-col items-center gap-1 cursor-pointer transition-colors text-gray-400 hover:text-violet-600"
          >
            <div className="p-2 rounded-xl transition-all"><PenTool size={20} /></div>
            <span className="text-[9px] font-semibold">Assist</span>
          </div>

          <div
            onClick={() => openDmWorkspaceTab('whiteboard')}
            className="flex flex-col items-center gap-1 cursor-pointer transition-colors text-gray-400 hover:text-violet-600"
          >
            <div className="p-2 rounded-xl transition-all"><LayoutGrid size={20} /></div>
            <span className="text-[9px] font-semibold">Whiteboard</span>
          </div>

          <div
            onClick={() => openDmWorkspaceTab('tasks')}
            className="flex flex-col items-center gap-1 cursor-pointer transition-colors text-gray-400 hover:text-violet-600"
          >
            <div className="p-2 rounded-xl transition-all"><CheckSquare size={20} /></div>
            <span className="text-[9px] font-semibold">Tasks</span>
          </div>

          <div
            onClick={() => openDmWorkspaceTab('calendar')}
            className="flex flex-col items-center gap-1 cursor-pointer transition-colors text-gray-400 hover:text-violet-600"
          >
            <div className="p-2 rounded-xl transition-all"><Calendar size={20} /></div>
            <span className="text-[9px] font-semibold">Schedule</span>
          </div>

          <div
            onClick={() => openDmWorkspaceTab('people')}
            className="flex flex-col items-center gap-1 cursor-pointer transition-colors text-gray-400 hover:text-violet-600"
          >
            <div className="p-2 rounded-xl transition-all"><Users size={20} /></div>
            <span className="text-[9px] font-semibold">People</span>
          </div>

          <div
            onClick={() => openDmWorkspaceTab('memory')}
            className="flex flex-col items-center gap-1 cursor-pointer transition-colors text-gray-400 hover:text-violet-600"
          >
            <div className="p-2 rounded-xl transition-all"><Database size={20} /></div>
            <span className="text-[9px] font-semibold">Memory</span>
          </div>

          <div
            onClick={() => openDmWorkspaceTab('orb')}
            className="flex flex-col items-center gap-1 cursor-pointer transition-colors text-gray-400 hover:text-violet-600"
          >
            <div className="p-2 rounded-xl transition-all"><Cloud size={20} /></div>
            <span className="text-[9px] font-semibold">Orb</span>
          </div>

          <div
            onClick={() => openDmWorkspaceTab('room')}
            className="flex flex-col items-center gap-1 cursor-pointer transition-colors text-gray-400 hover:text-violet-600"
          >
            <div className="p-2 rounded-xl transition-all"><MonitorPlay size={20} /></div>
            <span className="text-[9px] font-semibold">Room</span>
          </div>

          <div
            onClick={() => {
              openDmWorkspaceTab('room', { meetingStageTab: 'files' });
            }}
            className="flex flex-col items-center gap-1 text-gray-400 hover:text-violet-600 cursor-pointer"
          >
            <div className="p-2"><File size={20} /></div>
            <span className="text-[9px] font-semibold">Files</span>
          </div>

          <div
            onClick={() => openDmWorkspaceTab('assistant')}
            className="flex flex-col items-center gap-1 text-gray-400 hover:text-gray-600 cursor-pointer mt-auto"
          >
            <div className="p-2"><MoreHorizontal size={20} /></div>
            <span className="text-[9px] font-semibold">More</span>
          </div>
        </div>

        <button
          type="button"
          onClick={createComposeExperience}
          className="absolute bottom-4 left-[270px] text-xs text-slate-500 hover:text-slate-700"
        >
          Back to Compose
        </button>
      </div>
    );
  }

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

              <div className="grid grid-cols-1 md:grid-cols-4 gap-3">
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

                <button
                  type="button"
                  onClick={createDmExperience}
                  className="group text-left rounded-xl border border-indigo-200 bg-indigo-50/50 p-4 hover:bg-indigo-50 transition-colors"
                >
                  <div className="w-9 h-9 rounded-lg bg-indigo-600 text-white flex items-center justify-center mb-3">
                    <MessageCircle size={18} />
                  </div>
                  <div className="text-sm font-semibold text-gray-900 mb-1">DMs</div>
                  <p className="text-xs text-gray-600">Dedicated team chat workspace with searchable conversation intelligence.</p>
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
                    <span className="absolute top-1 right-1.5 w-2 h-2 rounded-full bg-violet-500 ring-2 ring-white"></span>
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
          <div className="relative">
            <div
              onClick={() => setWorkspaceLauncherOpen((prev) => !prev)}
              className={`flex flex-col items-center gap-1 cursor-pointer transition-colors ${workspaceLauncherOpen ? 'text-violet-600' : 'text-gray-400 hover:text-violet-600'}`}
            >
                <Plus
                  className="transition-all"
                  size={workspaceLauncherIconSize === 'sm' ? 16 : workspaceLauncherIconSize === 'lg' ? 24 : 20}
                  strokeWidth={workspaceLauncherIconStyle === 'solid' ? 2.5 : workspaceLauncherIconStyle === 'soft' ? 1.7 : 2}
                  style={{ color: workspaceLauncherIconColor, opacity: workspaceLauncherIconStyle === 'soft' ? 0.78 : 1 }}
                />
              <span className="text-[9px] font-semibold">New</span>
            </div>

            {workspaceLauncherOpen && (
              <div className="absolute top-[calc(100%+8px)] left-1/2 -translate-x-[70%] z-[700] w-[254px] rounded-xl border border-gray-200 bg-white shadow-[0_24px_50px_-30px_rgba(15,23,42,0.65)] p-2.5">
                <div className="text-[11px] font-semibold text-gray-700 px-1 pb-1.5">Choose Workspace</div>
                <div className="grid grid-cols-2 gap-1.5">
                  {[
                    { key: 'whiteboard', label: 'Whiteboard', icon: LayoutGrid },
                    { key: 'compose', label: 'Compose', icon: FileText },
                    { key: 'deck', label: 'Deck', icon: Presentation },
                    { key: 'sheets', label: 'Sheets', icon: ListOrdered },
                    { key: 'dms', label: 'DMs', icon: MessageSquare },
                    { key: 'dashboard', label: 'Dashboard', icon: Home },
                  ].map(({ key, label, icon: Icon }) => (
                    <button
                      key={key}
                      type="button"
                      onClick={() => launchWorkspaceFromMiniPlus(key)}
                      className="rounded-lg border border-gray-200 bg-white px-2 py-1.5 text-[11px] text-gray-700 hover:bg-violet-50 hover:border-violet-200 inline-flex items-center gap-1.5"
                    >
                      <Icon size={12} />
                      {label}
                    </button>
                  ))}
                </div>

                <div className="mt-2 border-t border-gray-100 pt-2">
                  <div className="text-[10px] uppercase tracking-wide text-gray-400 px-1">Icon style</div>
                  <div className="mt-1 flex items-center gap-1">
                    {['solid', 'soft', 'outline'].map((styleKey) => (
                      <button
                        key={styleKey}
                        type="button"
                        onClick={() => setWorkspaceLauncherIconStyle(styleKey)}
                        className={`px-2 py-1 rounded text-[10px] border ${workspaceLauncherIconStyle === styleKey ? 'border-violet-300 bg-violet-50 text-violet-700' : 'border-gray-200 text-gray-500 hover:bg-gray-50'}`}
                      >
                        {styleKey}
                      </button>
                    ))}
                  </div>

                  <div className="mt-2 text-[10px] uppercase tracking-wide text-gray-400 px-1">Icon size</div>
                  <div className="mt-1 flex items-center gap-1">
                    {['sm', 'md', 'lg'].map((sizeKey) => (
                      <button
                        key={sizeKey}
                        type="button"
                        onClick={() => setWorkspaceLauncherIconSize(sizeKey)}
                        className={`px-2 py-1 rounded text-[10px] border ${workspaceLauncherIconSize === sizeKey ? 'border-violet-300 bg-violet-50 text-violet-700' : 'border-gray-200 text-gray-500 hover:bg-gray-50'}`}
                      >
                        {sizeKey.toUpperCase()}
                      </button>
                    ))}
                  </div>

                  <div className="mt-2 text-[10px] uppercase tracking-wide text-gray-400 px-1">Icon color</div>
                  <div className="mt-1 px-1">
                    <input
                      type="color"
                      value={workspaceLauncherIconColor}
                      onChange={(event) => setWorkspaceLauncherIconColor(event.target.value)}
                      className="h-8 w-full rounded-md border border-gray-200 bg-white cursor-pointer"
                    />
                  </div>
                </div>
              </div>
            )}
          </div>

          <div
            onClick={() => handleMiniSidebarClick('chat')}
            className={`flex flex-col items-center gap-1 cursor-pointer transition-colors ${activeRightTab === 'chat' && rightSidebarOpen ? 'text-violet-600' : 'text-gray-400 hover:text-violet-600'}`}
          >
            <div className={`p-2 rounded-xl transition-all ${activeRightTab === 'chat' && rightSidebarOpen ? 'bg-violet-100' : ''}`}><MessageCircle size={20} /></div>
            <span className="text-[9px] font-semibold">Chat</span>
          </div>

          <div
            onClick={() => handleMiniSidebarClick('dm')}
            className={`flex flex-col items-center gap-1 cursor-pointer transition-colors ${productMode === 'dm' ? 'text-violet-600' : 'text-gray-400 hover:text-violet-600'}`}
          >
            <div className={`p-2 rounded-xl transition-all ${productMode === 'dm' ? 'bg-violet-100' : ''}`}><MessageSquare size={20} /></div>
            <span className="text-[9px] font-semibold">DMs</span>
          </div>

          <div
            onClick={() => handleMiniSidebarClick('assistant')}
            className={`flex flex-col items-center gap-1 cursor-pointer transition-colors ${activeRightTab === 'assistant' && rightSidebarOpen ? 'text-violet-600' : 'text-gray-400 hover:text-violet-600'}`}
          >
            <div className={`p-2 rounded-xl transition-all ${activeRightTab === 'assistant' && rightSidebarOpen ? 'bg-violet-100' : ''}`}><PenTool size={20} /></div>
            <span className="text-[9px] font-semibold">Assist</span>
          </div>

          <div
            onClick={() => handleMiniSidebarClick('whiteboard')}
            className={`flex flex-col items-center gap-1 cursor-pointer transition-colors ${activeRightTab === 'whiteboard' && rightSidebarOpen ? 'text-violet-600' : 'text-gray-400 hover:text-violet-600'}`}
          >
            <div className={`p-2 rounded-xl transition-all ${activeRightTab === 'whiteboard' && rightSidebarOpen ? 'bg-violet-100' : ''}`}><LayoutGrid size={20} /></div>
            <span className="text-[9px] font-semibold">Whiteboard</span>
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
            onClick={() => handleMiniSidebarClick('orb')}
            className={`flex flex-col items-center gap-1 cursor-pointer transition-colors ${activeRightTab === 'orb' && rightSidebarOpen ? 'text-violet-600' : 'text-gray-400 hover:text-violet-600'}`}
          >
            <div className={`p-2 rounded-xl transition-all ${activeRightTab === 'orb' && rightSidebarOpen ? 'bg-violet-100' : ''}`}><Cloud size={20} /></div>
            <span className="text-[9px] font-semibold">Orb</span>
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
    <div ref={appShellRef} className={`flex h-screen bg-[#FDFDFD] text-gray-800 overflow-hidden relative ${isDarkMode ? 'app-dark' : ''} ${shouldHideScrollbarsForPrompt ? 'hide-side-scrollbar' : ''}`} style={{ fontFamily: resolveFontFamily(editorFont) }}>
      
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

            <div className="grid grid-cols-1 md:grid-cols-4 gap-3">
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

              <button
                type="button"
                onClick={createDmExperience}
                className="group text-left rounded-xl border border-gray-200 p-4 hover:border-indigo-300 hover:bg-indigo-50/40 transition-colors"
              >
                <div className="w-9 h-9 rounded-lg bg-indigo-100 text-indigo-700 flex items-center justify-center mb-3">
                  <MessageCircle size={18} />
                </div>
                <div className="text-sm font-semibold text-gray-900 mb-1">DMs</div>
                <p className="text-xs text-gray-600">Dedicated team chat workspace with searchable conversation intelligence.</p>
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
            <div className="h-16 flex items-center justify-between px-4">
              <div className="flex items-center gap-2.5">
                <div className="w-9 h-9 rounded-xl bg-gradient-to-br from-violet-500 via-purple-500 to-indigo-500 text-white flex items-center justify-center shadow-[0_12px_24px_-14px_rgba(139,92,246,0.95)]">
                  <Sparkles size={16} />
                </div>
                <div className="leading-tight">
                  <div className="text-[17px] font-semibold tracking-tight text-gray-900">Orb</div>
                  <div className="text-[11px] text-gray-500">by Regaarder</div>
                </div>
              </div>
              <button
                onClick={openCreationPicker}
                className="px-3 py-1.5 rounded-lg bg-violet-600 hover:bg-violet-700 text-white text-xs font-semibold flex items-center gap-1.5 transition-colors"
              >
                <Upload size={13} />
                Upload
              </button>
            </div>

            <div className="px-4 pb-3">
              <div
                className="relative"
                onMouseEnter={() => setIsFormattingDropdownHovered(true)}
                onMouseLeave={() => setIsFormattingDropdownHovered(false)}
              >
                <Search size={14} className="absolute left-2.5 top-2 text-gray-400" />
                <input 
                  type="text" 
                  placeholder="Search Orb..." 
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
          <div className="flex-1 overflow-y-auto px-3 space-y-4 thin-scrollbar">
            <div className="space-y-0.5">
              <button
                onClick={() => setActivePrimaryNav('my-orb')}
                className={`w-full flex items-center gap-3 px-2.5 py-2 text-sm rounded-lg transition-colors ${activePrimaryNav === 'my-orb' ? 'bg-violet-50 text-violet-700 font-semibold' : 'text-gray-700 hover:bg-gray-100'}`}
              >
                <Database size={15} /> My Orb
              </button>
              <button
                onClick={() => setActivePrimaryNav('shared')}
                className={`w-full flex items-center gap-3 px-2.5 py-2 text-sm rounded-lg transition-colors ${activePrimaryNav === 'shared' ? 'bg-violet-50 text-violet-700 font-semibold' : 'text-gray-700 hover:bg-gray-100'}`}
              >
                <Users size={15} /> Shared with me
              </button>
              <button
                onClick={() => setActivePrimaryNav('favorites')}
                className={`w-full flex items-center gap-3 px-2.5 py-2 text-sm rounded-lg transition-colors ${activePrimaryNav === 'favorites' ? 'bg-violet-50 text-violet-700 font-semibold' : 'text-gray-700 hover:bg-gray-100'}`}
              >
                <Star size={15} /> Favorites
              </button>
              <button
                onClick={() => setActivePrimaryNav('recent')}
                className={`w-full flex items-center gap-3 px-2.5 py-2 text-sm rounded-lg transition-colors ${activePrimaryNav === 'recent' ? 'bg-violet-50 text-violet-700 font-semibold' : 'text-gray-700 hover:bg-gray-100'}`}
              >
                <Clock size={15} /> Recent
              </button>
              <button
                onClick={() => setActivePrimaryNav('trash')}
                className={`w-full flex items-center gap-3 px-2.5 py-2 text-sm rounded-lg transition-colors ${activePrimaryNav === 'trash' ? 'bg-violet-50 text-violet-700 font-semibold' : 'text-gray-700 hover:bg-gray-100'}`}
              >
                <Trash size={15} /> Trash
              </button>
            </div>

            <div>
              <div className="px-2.5 text-[10px] uppercase tracking-[0.11em] font-semibold text-gray-400 mb-1.5">Workspace Intelligence</div>
              <div className="space-y-0.5">
                <button className="w-full flex items-center justify-between px-2.5 py-2 text-sm text-gray-700 hover:bg-gray-100 rounded-lg transition-colors">
                  <span className="flex items-center gap-3"><Sparkles size={15} /> AI Suggested</span>
                  <span className="text-[10px] font-semibold bg-violet-100 text-violet-700 px-1.5 py-0.5 rounded-full">12</span>
                </button>
                <button className="w-full flex items-center justify-between px-2.5 py-2 text-sm text-gray-700 hover:bg-gray-100 rounded-lg transition-colors">
                  <span className="flex items-center gap-3"><LinkIcon size={15} /> Related to me</span>
                  <span className="text-[10px] font-semibold bg-violet-100 text-violet-700 px-1.5 py-0.5 rounded-full">8</span>
                </button>
                <button className="w-full flex items-center gap-3 px-2.5 py-2 text-sm text-gray-700 hover:bg-gray-100 rounded-lg transition-colors">
                  <BookOpen size={15} /> Recently referenced
                </button>
                <button className="w-full flex items-center gap-3 px-2.5 py-2 text-sm text-gray-700 hover:bg-gray-100 rounded-lg transition-colors">
                  <ArrowUp size={15} /> Trending in team
                </button>
              </div>
            </div>

            <div>
              <div className="px-2.5 text-[10px] uppercase tracking-[0.11em] font-semibold text-gray-400 mb-1.5">Spaces</div>
              <div className="space-y-1">
                {workspaces.map((workspace) => (
                  <button key={workspace.id} className="w-full flex items-center justify-between px-2.5 py-2 text-sm text-gray-700 hover:bg-gray-100 rounded-lg transition-colors">
                    <div className="flex items-center gap-2.5">
                      <WorkspaceIcon letter={workspace.letter} colorClass={workspace.colorClass} />
                      <span>{workspace.name}</span>
                    </div>
                    <ChevronRight size={13} className="text-gray-300" />
                  </button>
                ))}
              </div>
            </div>

            <div className="rounded-xl border border-gray-200 bg-white p-3 mb-3">
              <div className="text-xs font-semibold text-gray-700 mb-2">Orb Storage</div>
              <div className="h-1.5 rounded-full bg-gray-100 overflow-hidden mb-1.5">
                <div className="h-full w-[26%] rounded-full bg-violet-500" />
              </div>
              <div className="text-[11px] text-gray-500">256 GB of 1 TB used</div>
            </div>

            <div className="pb-2">
              <button className="w-full rounded-lg border border-gray-200 bg-white px-3 py-2 text-xs font-medium text-gray-600 hover:bg-gray-50 transition-colors">
                Manage storage
              </button>
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
                    title={activeDraftDisplayTitle}
                  >
                    {(() => {
                      if (isTopDraftTitleExpanded || activeDraftDisplayTitle.length <= 20) {
                        return activeDraftDisplayTitle;
                      }
                      return `${activeDraftDisplayTitle.slice(0, 20)}...`;
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
                  <span className="absolute top-1 right-1.5 w-2 h-2 rounded-full bg-violet-500 ring-2 ring-white"></span>
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

        {selectionActionMenuEnabled && selectionActionMenu.open && !isComposing && (
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
          {orderedDocuments.map((doc, docIndex) => {
            const label = activeRightTab === 'whiteboard' && activeDocId === doc.id
              ? UNTITLED_WHITEBOARD_LABEL
              : (doc.title?.trim() ? doc.title : `Tab ${docIndex + 1}`);
            const isActive = activeDocId === doc.id;

            return (
              <div
                key={doc.id}
                onClick={() => switchDocument(doc.id)}
                className={`relative shrink-0 px-2 py-1 rounded-md text-xs font-medium border transition-colors flex items-center gap-1.5 cursor-pointer ${isActive ? 'bg-white border-violet-200 text-violet-700' : 'bg-transparent border-transparent text-gray-500 hover:bg-white hover:border-gray-200'}`}
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
            onClick={createItemForCurrentContext}
            className="shrink-0 inline-flex h-7 w-7 items-center justify-center rounded-full text-violet-600 hover:bg-violet-50 hover:text-violet-700 transition-colors"
            title="Create new item"
            aria-label="Create new item"
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
          className={`h-12 border-b border-gray-100 flex items-center px-6 gap-4 text-sm text-gray-600 shrink-0 overflow-visible no-scrollbar select-none relative z-[130] ${activeRightTab === 'whiteboard' && isWhiteboardImmersive ? 'hidden' : ''}`}
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
          <button
            type="button"
            onClick={toggleDocumentImmersiveMode}
            className={`p-1.5 rounded-md transition-colors ${isDocumentImmersive ? 'bg-violet-100 text-violet-700' : 'text-gray-500 hover:text-gray-900 hover:bg-gray-100'}`}
            title={isDocumentImmersive ? 'Exit immersive mode' : 'Enter immersive mode'}
          >
            {isDocumentImmersive ? <Minimize2 size={14} /> : <Expand size={14} />}
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
          {activeRightTab === 'whiteboard' && (
            <div className={`absolute inset-0 ${isWhiteboardImmersive ? 'z-[340] p-0 bg-white' : isWhiteboardFloatingUiOpen ? 'z-[320] p-6 md:p-8 bg-[#F7F7F9]' : 'z-30 p-6 md:p-8 bg-[#F7F7F9]'}`}>
              <div className={`h-full w-full bg-white overflow-hidden flex flex-col ${isWhiteboardImmersive ? 'rounded-none border-0 shadow-none' : 'rounded-[24px] border border-violet-100 shadow-[0_20px_60px_-30px_rgba(124,58,237,0.45)]'}`}>
                <div className="h-14 border-b border-gray-100 px-5 flex items-center justify-between">
                  <div className="flex items-center gap-2">
                    <div className="h-8 w-8 rounded-lg bg-violet-100 text-violet-700 flex items-center justify-center">
                      <PenTool size={15} />
                    </div>
                    <div>
                      <p className="text-sm font-semibold text-gray-900">Whiteboard</p>
                      <p className="text-[11px] text-gray-500">Brainstorm & map ideas</p>
                    </div>
                  </div>
                  <div className="flex items-center gap-2">
                    <button
                      type="button"
                      onClick={() => setIsWhiteboardImmersive((prev) => !prev)}
                      className={`h-8 w-8 rounded-lg border flex items-center justify-center ${isWhiteboardImmersive ? 'border-violet-200 bg-violet-50 text-violet-700' : 'border-gray-200 text-gray-600 hover:bg-gray-50'}`}
                      title={isWhiteboardImmersive ? 'Collapse whiteboard' : 'Expand whiteboard'}
                    >
                      {isWhiteboardImmersive ? <Minimize2 size={14} /> : <Expand size={14} />}
                    </button>
                    <button
                      onClick={() => {
                        setWhiteboardTool('sticky');
                        setWhiteboardStickyPaletteOpen(true);
                        showToast('Sticky note tool active');
                      }}
                      className="px-2.5 py-1.5 text-xs rounded-lg border border-gray-200 text-gray-700 hover:bg-gray-50 inline-flex items-center gap-1.5"
                    >
                      <StickyNote size={13} />
                      Sticky notes
                    </button>
                    <button onClick={openWhiteboardTaskPreview} className="px-2.5 py-1.5 text-xs rounded-lg bg-violet-600 text-white hover:bg-violet-700">Convert to Tasks</button>
                  </div>
                </div>
                <div className="flex-1 relative bg-[radial-gradient(circle_at_1px_1px,#ececf6_1px,transparent_0)] bg-[size:24px_24px]" style={{ zoom: whiteboardZoomScale }}>
                  <div className="absolute left-4 top-1/2 -translate-y-1/2 z-20 rounded-2xl border border-gray-200 bg-white/95 shadow-sm p-2 flex flex-col gap-1.5">
                    {[
                      { key: 'select', label: 'Select', icon: MousePointer2 },
                      { key: 'hand', label: 'Hand (pan)', icon: Hand },
                      { key: 'pen', label: 'Pen', icon: PenTool },
                      { key: 'shapes', label: 'Shapes', icon: Shapes },
                      { key: 'text', label: 'Text', icon: Type },
                      { key: 'link', label: 'Connector', icon: LinkIcon },
                      { key: 'sticky', label: 'Sticky note', icon: StickyNote },
                      { key: 'comment', label: 'Comment', icon: MessageCircle },
                      { key: 'more', label: 'More', icon: MoreHorizontal },
                    ].map((tool) => {
                      const ToolIcon = tool.key === 'pen' ? activeWhiteboardPen.icon : tool.icon;
                      const toolIconStyle = tool.key === 'pen'
                        ? { color: activeWhiteboardPen.stroke, opacity: activeWhiteboardPen.opacity ?? 1 }
                        : undefined;

                      return (
                        <button
                          key={tool.key}
                          type="button"
                          onMouseEnter={() => setWhiteboardHoverLabel(tool.label)}
                          onMouseLeave={() => setWhiteboardHoverLabel('')}
                          onClick={() => {
                            if (tool.key === 'pen') {
                              setWhiteboardTool('pen');
                              setWhiteboardPenMenuOpen((prev) => !prev);
                              setWhiteboardMoreMenuOpen(false);
                              setWhiteboardShapeMenuOpen(false);
                              setWhiteboardAddMenuOpen(false);
                              setWhiteboardTemplateMenuOpen(false);
                              setWhiteboardEraserMenuOpen(false);
                              showToast('Pen tool active');
                              return;
                            }
                            activateWhiteboardTool(tool.key);
                            if (tool.key === 'eraser') {
                              setWhiteboardEraserMenuOpen(true);
                            }
                          }}
                          className={`h-9 w-9 rounded-lg flex items-center justify-center transition-colors ${whiteboardTool === tool.key ? 'bg-violet-100 text-violet-700' : 'text-gray-500 hover:bg-gray-100 hover:text-gray-700'}`}
                          title={tool.label}
                        >
                          <ToolIcon size={15} style={toolIconStyle} />
                        </button>
                      );
                    })}
                  </div>
                  {whiteboardTool === 'eraser' && whiteboardEraserMenuOpen && (
                    <div className="absolute left-20 top-[74%] -translate-y-1/2 z-20 rounded-2xl border border-gray-200 bg-white/95 shadow-sm p-2.5 w-[172px]">
                      <p className="text-[10px] font-semibold text-gray-500">Eraser size</p>
                      <div className="mt-2 flex items-end justify-between gap-2">
                        {whiteboardEraserSizeOptions.map((sizeValue) => (
                          <button
                            key={`eraser-size-${sizeValue}`}
                            type="button"
                            onClick={() => setWhiteboardEraserSize(sizeValue)}
                            className={`flex flex-col items-center gap-1 rounded-lg px-1.5 py-1 ${whiteboardEraserSize === sizeValue ? 'bg-violet-50 text-violet-700' : 'text-gray-500 hover:bg-gray-100'}`}
                            title={`${sizeValue}px eraser`}
                          >
                            <span className="rounded-full border border-gray-300 bg-white" style={{ width: `${Math.max(8, sizeValue)}px`, height: `${Math.max(8, sizeValue)}px` }} />
                          </button>
                        ))}
                      </div>
                      <button
                        type="button"
                        onClick={() => setWhiteboardEraserCustomSizeOpen((prev) => !prev)}
                        className={`mt-2 w-full rounded-lg border px-2 py-1.5 text-[11px] font-medium ${whiteboardEraserCustomSizeOpen ? 'border-violet-300 bg-violet-50 text-violet-700' : 'border-gray-200 text-gray-600 hover:bg-gray-50'}`}
                      >
                        Custom size
                      </button>
                      {whiteboardEraserCustomSizeOpen && (
                        <div className="mt-2 flex items-center gap-2">
                          <input
                            type="range"
                            min="4"
                            max="32"
                            value={whiteboardEraserSize}
                            onChange={(event) => setWhiteboardEraserSize(Number.parseInt(event.target.value, 10) || 9)}
                            className="whiteboard-range-slider w-full"
                          />
                          <span className="text-[11px] text-gray-600 w-8 text-right">{whiteboardEraserSize}</span>
                        </div>
                      )}
                    </div>
                  )}
                  {Boolean(whiteboardHoverLabel) && (
                    <div className={`absolute top-1/2 -translate-y-1/2 z-40 px-2 py-1 rounded-md bg-slate-900 text-white text-[11px] font-medium shadow-lg whitespace-nowrap ${whiteboardTool === 'pen' ? 'left-[204px]' : 'left-16'}`}>
                      {whiteboardHoverLabel}
                    </div>
                  )}
                  {whiteboardTool === 'pen' && whiteboardPenMenuOpen && (
                    <div className="absolute left-20 top-1/2 -translate-y-1/2 z-20 rounded-2xl border border-gray-200 bg-white/95 shadow-sm p-2.5 flex flex-col gap-1.5 w-[172px]">
                      <p className="text-[10px] font-semibold text-gray-500 px-1">Pen styles</p>
                      {whiteboardPenPresets.map((penPreset, penIndex) => (
                        <button
                          key={penPreset.key}
                          type="button"
                          onMouseEnter={() => setWhiteboardHoverLabel(penPreset.label)}
                          onMouseLeave={() => setWhiteboardHoverLabel('')}
                          onClick={() => {
                            setWhiteboardPenVariant(penPreset.key);
                            setWhiteboardPenMenuOpen(false);
                            showToast(`${penPreset.label} selected`);
                          }}
                          className={`h-8 rounded-lg px-2 flex items-center gap-2 transition-colors ${whiteboardPenVariant === penPreset.key ? 'bg-violet-100 text-violet-700' : 'text-gray-600 hover:bg-gray-100'}`}
                          title={penPreset.label}
                        >
                          <span className="h-5 w-5 rounded-md bg-gray-100 border border-gray-200 flex items-center justify-center">
                            <penPreset.icon size={12} style={{ color: penPreset.stroke, opacity: penPreset.opacity ?? 1 }} />
                          </span>
                          <span className="text-[11px] font-medium truncate">{penPreset.label}</span>
                          {penIndex < 2 && <span className="ml-auto text-[9px] text-gray-400">Popular</span>}
                        </button>
                      ))}
                      <div className="mt-1 rounded-xl border border-gray-200 bg-gray-50 px-2 py-2">
                        <div className="text-[10px] font-semibold text-gray-500">Tip size</div>
                        <div className="mt-2 flex items-end justify-between gap-1">
                          {whiteboardPenSizeOptions.map((sizeValue) => {
                            const isActive = Math.abs(effectiveWhiteboardPenWidth - sizeValue) < 0.01;
                            return (
                              <button
                                key={`pen-size-${sizeValue}`}
                                type="button"
                                onClick={() => {
                                  setWhiteboardPenWidthOverride(sizeValue);
                                  setWhiteboardPenCustomWidth(sizeValue);
                                }}
                                className={`flex flex-col items-center justify-end rounded-lg px-1.5 py-1 ${isActive ? 'bg-violet-100 text-violet-700' : 'text-gray-500 hover:bg-white'}`}
                                title={`${sizeValue}px stroke`}
                              >
                                <span className="rounded-full bg-current" style={{ width: `${Math.max(4, sizeValue * 2.8)}px`, height: `${Math.max(4, sizeValue * 2.8)}px`, opacity: 0.9 }} />
                              </button>
                            );
                          })}
                        </div>
                        <div className="mt-2 flex items-center gap-1.5">
                          <button
                            type="button"
                            onClick={() => setWhiteboardPenWidthOverride(null)}
                            className={`flex-1 rounded-md border px-2 py-1 text-[10px] font-medium ${whiteboardPenWidthOverride === null ? 'border-violet-300 bg-violet-50 text-violet-700' : 'border-gray-200 bg-white text-gray-600 hover:bg-gray-50'}`}
                          >
                            Auto
                          </button>
                          <button
                            type="button"
                            onClick={() => setWhiteboardPenCustomSizeOpen((prev) => !prev)}
                            className={`flex-1 rounded-md border px-2 py-1 text-[10px] font-medium ${whiteboardPenCustomSizeOpen ? 'border-violet-300 bg-violet-50 text-violet-700' : 'border-gray-200 bg-white text-gray-600 hover:bg-gray-50'}`}
                          >
                            Custom
                          </button>
                        </div>
                        {whiteboardPenCustomSizeOpen && (
                          <div className="mt-2 flex items-center gap-2">
                            <input
                              type="range"
                              min="1"
                              max="12"
                              step="0.2"
                              value={whiteboardPenCustomWidth}
                              onChange={(event) => {
                                const nextWidth = Number.parseFloat(event.target.value) || activeWhiteboardPen.width;
                                setWhiteboardPenCustomWidth(nextWidth);
                                setWhiteboardPenWidthOverride(nextWidth);
                              }}
                              className="whiteboard-range-slider w-full"
                            />
                            <span className="w-8 text-right text-[11px] text-gray-600">{effectiveWhiteboardPenWidth.toFixed(1)}</span>
                          </div>
                        )}
                      </div>
                    </div>
                  )}
                  {whiteboardShapeMenuOpen && (
                    <div className="absolute left-20 top-[44%] -translate-y-1/2 z-20 rounded-2xl border border-gray-200 bg-white/95 shadow-sm p-2 flex flex-col gap-1.5 w-[172px]">
                      <p className="text-[10px] font-semibold text-gray-500 px-1">Shapes</p>
                      {whiteboardShapePresets.map((shapePreset) => (
                        <button
                          key={shapePreset.key}
                          type="button"
                          onMouseEnter={() => setWhiteboardHoverLabel(shapePreset.label)}
                          onMouseLeave={() => setWhiteboardHoverLabel('')}
                          onClick={() => {
                            setWhiteboardShapeVariant(shapePreset.key);
                            setWhiteboardTool('shapes');
                            showToast(`${shapePreset.label} selected`);
                          }}
                          className={`h-8 rounded-lg px-2 flex items-center gap-2 transition-colors ${whiteboardShapeVariant === shapePreset.key ? 'bg-violet-100 text-violet-700' : 'text-gray-600 hover:bg-gray-100'}`}
                          title={shapePreset.label}
                        >
                          <shapePreset.icon size={13} />
                          <span className="text-[11px] font-medium truncate">{shapePreset.label}</span>
                        </button>
                      ))}
                    </div>
                  )}
                  {whiteboardStickyPaletteOpen && (
                    <div className="absolute left-20 top-[62%] -translate-y-1/2 z-20 rounded-2xl border border-gray-200 bg-white/95 shadow-sm p-2 flex flex-col gap-1.5 w-[172px]">
                      <p className="text-[10px] font-semibold text-gray-500 px-1">Sticky note colors</p>
                      {whiteboardStickyColorPresets.map((colorPreset) => (
                        <button
                          key={colorPreset.key}
                          type="button"
                          onClick={() => {
                            setWhiteboardStickyColor(colorPreset.value);
                            setWhiteboardTool('sticky');
                            showToast(`${colorPreset.label} sticky selected`);
                          }}
                          className={`h-8 rounded-lg px-2 flex items-center gap-2 transition-colors ${whiteboardStickyColor === colorPreset.value ? 'bg-violet-100 text-violet-700' : 'text-gray-600 hover:bg-gray-100'}`}
                          title={colorPreset.label}
                        >
                          <span className="h-4 w-4 rounded-md border border-gray-200" style={{ backgroundColor: colorPreset.value }} />
                          <span className="text-[11px] font-medium truncate">{colorPreset.label}</span>
                        </button>
                      ))}
                      <div className="px-2 pb-1">
                        <label className="text-[10px] font-medium text-gray-500">Custom color</label>
                        <input
                          type="color"
                          value={whiteboardStickyColor}
                          onChange={(event) => setWhiteboardStickyColor(event.target.value)}
                          className="mt-1 h-8 w-full rounded-lg border border-gray-200 bg-white cursor-pointer"
                          title="Custom color"
                        />
                      </div>
                    </div>
                  )}
                  {whiteboardMoreMenuOpen && (
                    <div className="absolute left-20 top-[72%] -translate-y-1/2 z-20 rounded-xl border border-gray-200 bg-white shadow-lg p-1.5 w-40">
                      <button
                        type="button"
                        onClick={() => {
                          setWhiteboardStrokes([]);
                          setWhiteboardShapes([]);
                          setWhiteboardRedoStrokes([]);
                          setWhiteboardCurrentStroke('');
                          setWhiteboardCurrentShape(null);
                          setWhiteboardWidgets([]);
                          setSelectedShapeIndex(null);
                          setWhiteboardStickyDragStart(null);
                          setWhiteboardStickyPreview(null);
                          setWhiteboardActiveCommentId(null);
                          setWhiteboardMoreMenuOpen(false);
                          showToast('Whiteboard reset');
                        }}
                        className="w-full text-left text-xs px-2 py-1.5 rounded-md hover:bg-gray-50 inline-flex items-center gap-1.5"
                      >
                        <RefreshCcw size={12} />
                        Reset whiteboard
                      </button>
                      <button
                        type="button"
                        onClick={() => {
                          exportWhiteboardQuick('png');
                          setWhiteboardMoreMenuOpen(false);
                        }}
                        className="w-full text-left text-xs px-2 py-1.5 rounded-md hover:bg-gray-50 inline-flex items-center gap-1.5"
                      >
                        <ImageIcon size={12} />
                        Quick snapshot (PNG)
                      </button>
                      <button
                        type="button"
                        onClick={() => {
                          exportWhiteboardQuick('pdf');
                          setWhiteboardMoreMenuOpen(false);
                        }}
                        className="w-full text-left text-xs px-2 py-1.5 rounded-md hover:bg-gray-50 inline-flex items-center gap-1.5"
                      >
                        <File size={12} />
                        Quick export (single PDF)
                      </button>
                      <button
                        type="button"
                        onClick={() => {
                          setActiveRightTab('assistant');
                          setWhiteboardMoreMenuOpen(false);
                          showToast('Assistant opened');
                        }}
                        className="w-full text-left text-xs px-2 py-1.5 rounded-md hover:bg-gray-50 inline-flex items-center gap-1.5"
                      >
                        <Sparkles size={12} />
                        Open assistant
                      </button>
                      <button
                        type="button"
                        onClick={() => {
                          openWhiteboardTaskPreview();
                          setWhiteboardMoreMenuOpen(false);
                        }}
                        className="w-full text-left text-xs px-2 py-1.5 rounded-md hover:bg-gray-50 inline-flex items-center gap-1.5"
                      >
                        <CheckSquare size={12} />
                        Convert to tasks
                      </button>
                    </div>
                  )}
                  <div
                    ref={whiteboardCanvasRef}
                    className="absolute inset-0"
                    style={{
                      cursor: getWhiteboardCursor(),
                    }}
                    onPointerDown={(event) => {
                      setWhiteboardReactionMenuOpen(false);
                      setWhiteboardReactionTarget(null);
                      const rect = event.currentTarget.getBoundingClientRect();
                      const startX = event.clientX - rect.left;
                      const startY = event.clientY - rect.top;
                      if (whiteboardTool === 'sticky') {
                        setWhiteboardStickyDragStart({ x: startX, y: startY });
                        setWhiteboardStickyPreview({ x: startX, y: startY, width: 0, height: 0 });
                        return;
                      }
                      if (whiteboardTool === 'select') {
                        setSelectedWidgetId(null);
                        setSelectedShapeIndex(null);
                        return;
                      }
                      if (whiteboardTool === 'hand') {
                        setIsWhiteboardPanning(true);
                        panDragRef.current = { startX, startY };
                        event.currentTarget.setPointerCapture(event.pointerId);
                        return;
                      }
                      if (whiteboardTool === 'comment') {
                        const newComment = {
                          id: `comment-${Date.now()}`,
                          x: startX,
                          y: startY,
                          text: '',
                          resolved: false,
                          expanded: true,
                          width: 180,
                          height: 86,
                        };
                        setWhiteboardComments((prev) => [...prev, newComment]);
                        setWhiteboardActiveCommentId(newComment.id);
                        showToast('Comment placed');
                        return;
                      }
                      if (whiteboardTool === 'eraser') {
                        eraserActiveRef.current = true;
                        eraserLastPointRef.current = { x: startX, y: startY };
                        eraseWhiteboardAtPoint(startX, startY);
                        event.currentTarget.setPointerCapture(event.pointerId);
                        return;
                      }
                      if (whiteboardTool !== 'pen' && whiteboardTool !== 'shapes') return;
                      setIsWhiteboardDrawing(true);
                      if (whiteboardTool === 'shapes') {
                        setWhiteboardLineAnchor({ x: startX, y: startY });
                        setWhiteboardCurrentShape({
                          type: whiteboardShapeVariant,
                          x: startX,
                          y: startY,
                          width: 0,
                          height: 0,
                          x1: startX,
                          y1: startY,
                          x2: startX,
                          y2: startY,
                          stroke: activeWhiteboardPen.stroke,
                          strokeWidth: Math.max(effectiveWhiteboardPenWidth, 2.2),
                          fill: whiteboardShapeVariant === 'line' || whiteboardShapeVariant === 'arrow' ? 'transparent' : `${activeWhiteboardPen.stroke}22`,
                          fillOpacity: 1,
                          opacity: activeWhiteboardPen.opacity ?? 1,
                        });
                        return;
                      }
                      setWhiteboardCurrentStroke(`M ${startX} ${startY}`);
                    }}
                    onPointerMove={(event) => {
                      const rect = event.currentTarget.getBoundingClientRect();
                      const x = event.clientX - rect.left;
                      const y = event.clientY - rect.top;
                      setWhiteboardStickyCursorPosition({ x, y });
                      if (whiteboardTool === 'sticky' && whiteboardStickyDragStart) {
                        const deltaX = x - whiteboardStickyDragStart.x;
                        const deltaY = y - whiteboardStickyDragStart.y;
                        setWhiteboardStickyPreview({
                          x: Math.min(whiteboardStickyDragStart.x, x),
                          y: Math.min(whiteboardStickyDragStart.y, y),
                          width: Math.abs(deltaX),
                          height: Math.abs(deltaY),
                        });
                        return;
                      }
                      if (whiteboardTool === 'eraser' && eraserActiveRef.current) {
                        eraseWhiteboardAtPoint(x, y);
                        return;
                      }
                      if (!isWhiteboardDrawing || (whiteboardTool !== 'pen' && whiteboardTool !== 'shapes')) return;
                      if (whiteboardTool === 'shapes' && whiteboardLineAnchor) {
                        const nextShape = {
                          type: whiteboardShapeVariant,
                          x: Math.min(whiteboardLineAnchor.x, x),
                          y: Math.min(whiteboardLineAnchor.y, y),
                          width: Math.abs(x - whiteboardLineAnchor.x),
                          height: Math.abs(y - whiteboardLineAnchor.y),
                          x1: whiteboardLineAnchor.x,
                          y1: whiteboardLineAnchor.y,
                          x2: x,
                          y2: y,
                          stroke: activeWhiteboardPen.stroke,
                          strokeWidth: Math.max(effectiveWhiteboardPenWidth, 2.2),
                          fill: whiteboardShapeVariant === 'line' || whiteboardShapeVariant === 'arrow' ? 'transparent' : `${activeWhiteboardPen.stroke}22`,
                          fillOpacity: 1,
                          opacity: activeWhiteboardPen.opacity ?? 1,
                        };
                        setWhiteboardCurrentShape(nextShape);
                        return;
                      }
                      setWhiteboardCurrentStroke((prev) => `${prev} L ${x} ${y}`);
                    }}
                    onPointerUp={(event) => {
                      const rect = event.currentTarget.getBoundingClientRect();
                      const x = event.clientX - rect.left;
                      const y = event.clientY - rect.top;
                      if (whiteboardTool === 'hand') {
                        setIsWhiteboardPanning(false);
                        panDragRef.current = null;
                        return;
                      }
                      if (whiteboardTool === 'eraser') {
                        eraserActiveRef.current = false;
                        eraserLastPointRef.current = null;
                        return;
                      }
                      if (whiteboardTool === 'sticky' && whiteboardStickyDragStart) {
                        const deltaX = x - whiteboardStickyDragStart.x;
                        const deltaY = y - whiteboardStickyDragStart.y;
                        const dragged = Math.abs(deltaX) > 5 || Math.abs(deltaY) > 5;
                        if (!dragged) {
                          createStickyNote(whiteboardStickyDragStart.x - 80, whiteboardStickyDragStart.y - 55, 160, 110);
                        } else {
                          createStickyNote(
                            Math.min(whiteboardStickyDragStart.x, x),
                            Math.min(whiteboardStickyDragStart.y, y),
                            Math.max(Math.abs(deltaX), 120),
                            Math.max(Math.abs(deltaY), 90),
                          );
                        }
                        setWhiteboardStickyDragStart(null);
                        setWhiteboardStickyPreview(null);
                        return;
                      }
                      if (whiteboardTool === 'shapes' && isWhiteboardDrawing && whiteboardCurrentShape) {
                        setWhiteboardShapes((prev) => [...prev, whiteboardCurrentShape]);
                        setWhiteboardCurrentShape(null);
                        setIsWhiteboardDrawing(false);
                        setWhiteboardLineAnchor(null);
                        setWhiteboardRedoStrokes([]);
                        return;
                      }
                      if (!isWhiteboardDrawing || !whiteboardCurrentStroke) return;
                      setWhiteboardStrokes((prev) => [
                        ...prev,
                        {
                          path: whiteboardCurrentStroke,
                          stroke: activeWhiteboardPen.stroke,
                          width: effectiveWhiteboardPenWidth,
                          opacity: activeWhiteboardPen.opacity ?? 1,
                          dashArray: activeWhiteboardPen.dashArray || '',
                        },
                      ]);
                      setWhiteboardRedoStrokes([]);
                      setWhiteboardCurrentStroke('');
                      setIsWhiteboardDrawing(false);
                      setWhiteboardLineAnchor(null);
                    }}
                    onPointerLeave={() => {
                      if (whiteboardTool === 'hand') {
                        setIsWhiteboardPanning(false);
                        panDragRef.current = null;
                        return;
                      }
                      if (whiteboardTool === 'eraser') {
                        eraserActiveRef.current = false;
                        eraserLastPointRef.current = null;
                        return;
                      }
                      if (whiteboardTool === 'sticky') {
                        setWhiteboardStickyCursorPosition(null);
                        if (whiteboardStickyDragStart && whiteboardStickyPreview) {
                          createStickyNote(
                            whiteboardStickyPreview.x,
                            whiteboardStickyPreview.y,
                            Math.max(whiteboardStickyPreview.width, 120),
                            Math.max(whiteboardStickyPreview.height, 90),
                          );
                          setWhiteboardStickyDragStart(null);
                          setWhiteboardStickyPreview(null);
                        }
                        return;
                      }
                      if (whiteboardTool === 'shapes') {
                        if (whiteboardCurrentShape) {
                          setWhiteboardShapes((prev) => [...prev, whiteboardCurrentShape]);
                        }
                        setWhiteboardCurrentShape(null);
                        setIsWhiteboardDrawing(false);
                        setWhiteboardLineAnchor(null);
                        return;
                      }
                      if (!isWhiteboardDrawing || !whiteboardCurrentStroke) return;
                      setWhiteboardStrokes((prev) => [
                        ...prev,
                        {
                          path: whiteboardCurrentStroke,
                          stroke: activeWhiteboardPen.stroke,
                          width: effectiveWhiteboardPenWidth,
                          opacity: activeWhiteboardPen.opacity ?? 1,
                          dashArray: activeWhiteboardPen.dashArray || '',
                        },
                      ]);
                      setWhiteboardRedoStrokes([]);
                      setWhiteboardCurrentStroke('');
                      setIsWhiteboardDrawing(false);
                      setWhiteboardLineAnchor(null);
                    }}
                  />
                  {whiteboardTool === 'sticky' && whiteboardStickyCursorPosition && (
                    <div
                      className="absolute pointer-events-none z-20"
                      style={{ left: `${whiteboardStickyCursorPosition.x + 8}px`, top: `${whiteboardStickyCursorPosition.y + 8}px` }}
                    >
                      <div className="h-7 w-7 rounded-md border border-amber-300 shadow-sm flex items-center justify-center" style={{ backgroundColor: whiteboardStickyColor }}>
                        <StickyNote size={13} className="text-amber-900" />
                      </div>
                    </div>
                  )}
                  {whiteboardStickyPreview && (
                    <div
                      className="absolute z-10 border-2 border-dashed border-violet-400 bg-violet-200/25 rounded-lg pointer-events-none"
                      style={{
                        left: `${whiteboardStickyPreview.x}px`,
                        top: `${whiteboardStickyPreview.y}px`,
                        width: `${Math.max(whiteboardStickyPreview.width, 1)}px`,
                        height: `${Math.max(whiteboardStickyPreview.height, 1)}px`,
                      }}
                    />
                  )}
                  {whiteboardWidgets.map((widget) => {
                    const isSelected = selectedWidgetId === widget.id;
                    const isWidgetEditing = whiteboardEditingWidgetId === widget.id;
                    const isWidgetHovered = whiteboardHoveredObject?.kind === 'widget' && whiteboardHoveredObject?.id === widget.id;
                    const isWidgetReactionMenuOpen = whiteboardReactionMenuOpen && whiteboardReactionTarget?.kind === 'widget' && whiteboardReactionTarget?.id === widget.id;
                    const showWidgetReactionControls = (isWidgetHovered || isSelected || isWidgetReactionMenuOpen) && !isWidgetEditing && !['hand', 'eraser'].includes(whiteboardTool);
                    const showWidgetAnchorDots = (isWidgetHovered || isSelected) && !['hand', 'eraser'].includes(whiteboardTool);
                    const widgetAnchorPoints = [
                      { key: 'top', x: (widget.width || 170) / 2, y: -8, cursor: 'ns-resize', icon: '↑', kind: 'resize' },
                      { key: 'right', x: (widget.width || 170) + 8, y: (widget.height || 120) / 2, cursor: 'pointer', icon: '→', kind: 'connect' },
                      { key: 'bottom', x: (widget.width || 170) / 2, y: (widget.height || 120) + 8, cursor: 'ns-resize', icon: '↓', kind: 'resize' },
                      { key: 'left', x: -8, y: (widget.height || 120) / 2, cursor: 'ew-resize', icon: '←', kind: 'resize' },
                    ];
                    return (
                    <div
                      key={widget.id}
                      className={`absolute rounded-xl px-3 py-2 shadow-sm border ${
                        widget.type === 'sticky'
                          ? 'bg-amber-100 border-amber-200'
                          : widget.type === 'text'
                            ? 'bg-violet-100 border-violet-200'
                            : widget.type === 'image'
                              ? 'bg-emerald-100 border-emerald-200'
                              : 'bg-blue-100 border-blue-200'
                      } ${isSelected ? 'ring-2 ring-violet-500' : ''}`}
                      style={{
                        left: `${widget.x}px`,
                        top: `${widget.y}px`,
                        width: `${widget.width || 170}px`,
                        height: `${widget.height || 120}px`,
                        backgroundColor: widget.type === 'sticky' ? widget.color || '#fde047' : undefined,
                        cursor: whiteboardTool === 'pen'
                          ? getWhiteboardCursor()
                          : ['eraser', 'hand'].includes(whiteboardTool)
                            ? undefined
                            : (isSelected ? 'move' : 'pointer'),
                        userSelect: 'none',
                        touchAction: 'none',
                      }}
                      onMouseEnter={() => setWhiteboardObjectHover('widget', widget.id)}
                      onMouseLeave={() => clearWhiteboardObjectHover('widget', widget.id)}
                      onDoubleClick={(e) => {
                        if (widget.type !== 'sticky' && widget.type !== 'text') {
                          return;
                        }
                        e.stopPropagation();
                        setSelectedWidgetId(widget.id);
                        setSelectedShapeIndex(null);
                        setWhiteboardEditingWidgetId(widget.id);
                      }}
                      onPointerDown={(e) => {
                        if (['eraser', 'hand'].includes(whiteboardTool)) return;
                        if (e.target.closest('[data-widget-interactive="true"]')) return;
                        e.stopPropagation();
                        setSelectedWidgetId(widget.id);
                        setSelectedShapeIndex(null);
                        setWhiteboardEditingWidgetId(null);
                        const startX = e.clientX;
                        const startY = e.clientY;
                        const origX = widget.x;
                        const origY = widget.y;
                        widgetDragRef.current = { widgetId: widget.id, startX, startY, origX, origY };
                        e.currentTarget.setPointerCapture(e.pointerId);
                      }}
                      onPointerMove={(e) => {
                        if (!widgetDragRef.current || widgetDragRef.current.widgetId !== widget.id) return;
                        const dx = e.clientX - widgetDragRef.current.startX;
                        const dy = e.clientY - widgetDragRef.current.startY;
                        const nextBounds = {
                          x: widgetDragRef.current.origX + dx,
                          y: widgetDragRef.current.origY + dy,
                          width: widget.width || 170,
                          height: widget.height || 120,
                        };
                        setWhiteboardWidgets((prev) => prev.map((w) => (
                          w.id === widget.id ? { ...w, x: nextBounds.x, y: nextBounds.y } : w
                        )));
                        setWhiteboardAlignmentGuides(computeWhiteboardAlignmentGuides(nextBounds, widget.id));
                      }}
                      onPointerUp={() => {
                        widgetDragRef.current = null;
                        setWhiteboardAlignmentGuides([]);
                      }}
                      onPointerCancel={() => {
                        widgetDragRef.current = null;
                        setWhiteboardAlignmentGuides([]);
                      }}
                    >
                      {showWidgetReactionControls && (
                        <div className="absolute bottom-1.5 left-1.5 z-40">
                          <button
                            type="button"
                            onClick={(event) => {
                              event.stopPropagation();
                              if (isWidgetReactionMenuOpen) {
                                setWhiteboardReactionMenuOpen(false);
                                setWhiteboardReactionTarget(null);
                                return;
                              }
                              setWhiteboardReactionTarget({ kind: 'widget', id: widget.id });
                              setWhiteboardEmojiModalOpen(false);
                              setWhiteboardEmojiSearch('');
                              setWhiteboardReactionMenuOpen(true);
                            }}
                            className="relative h-7 w-7 rounded-xl border border-slate-200 bg-white text-slate-600 shadow-sm hover:bg-slate-50 inline-flex items-center justify-center"
                            title="Quick reactions"
                          >
                            <span className="text-[14px] leading-none">☺</span>
                            <span className="absolute -top-1 -right-1 text-[9px] text-slate-500">+</span>
                          </button>
                          {isWidgetReactionMenuOpen && (
                            <div className="absolute left-0 top-9 z-50 flex items-center gap-1.5 px-1 py-0.5" onPointerDown={(event) => event.stopPropagation()}>
                              <button
                                type="button"
                                onClick={() => {
                                  setWhiteboardReactionTarget({ kind: 'widget', id: widget.id });
                                  setWhiteboardReactionMenuOpen(false);
                                  setWhiteboardEmojiModalOpen(true);
                                  setWhiteboardEmojiSearch('');
                                }}
                                className="h-8 w-8 rounded-lg text-slate-700 hover:bg-slate-100 text-[22px] leading-none"
                                title="All emojis"
                              >
                                +
                              </button>
                              {orderedWhiteboardEmojis.slice(0, 8).map((emojiItem) => (
                                  <button
                                    key={`${widget.id}-${emojiItem.emoji}`}
                                    type="button"
                                    onClick={() => applyWhiteboardReaction(emojiItem.emoji)}
                                    className="h-8 w-8 rounded-lg text-lg hover:bg-slate-100"
                                    title={`React with ${emojiItem.emoji}`}
                                  >
                                    {emojiItem.emoji}
                                  </button>
                                ))}
                              <button
                                type="button"
                                onClick={() => {
                                  setWhiteboardReactionTarget({ kind: 'widget', id: widget.id });
                                  setWhiteboardReactionMenuOpen(false);
                                  setWhiteboardEmojiModalOpen(true);
                                  setWhiteboardEmojiSearch('');
                                }}
                                className="h-8 w-8 rounded-lg text-slate-500 hover:bg-slate-100 text-[18px]"
                                title="More"
                              >
                                ˅
                              </button>
                            </div>
                          )}
                        </div>
                      )}
                      {showWidgetAnchorDots && widgetAnchorPoints.map((anchor) => (
                        <div
                          key={`${widget.id}-anchor-${anchor.key}`}
                          className="absolute z-40"
                          style={{ left: `${anchor.x}px`, top: `${anchor.y}px`, transform: 'translate(-50%, -50%)' }}
                          onPointerDown={(event) => {
                            event.stopPropagation();
                            event.preventDefault();
                            if (anchor.kind === 'connect') {
                              createLinkedStickyNote(widget, anchor.key);
                              setWhiteboardHoveredAnchor(null);
                              return;
                            }
                            setSelectedWidgetId(widget.id);
                            setWhiteboardHoveredAnchor({ objectId: widget.id, anchorKey: anchor.key });
                            widgetDragRef.current = {
                              widgetId: widget.id,
                              startX: event.clientX,
                              startY: event.clientY,
                              origX: widget.x,
                              origY: widget.y,
                            };
                            event.currentTarget.setPointerCapture(event.pointerId);
                          }}
                          onPointerMove={(event) => {
                            if (!widgetDragRef.current || widgetDragRef.current.widgetId !== widget.id) {
                              return;
                            }
                            const dx = event.clientX - widgetDragRef.current.startX;
                            const dy = event.clientY - widgetDragRef.current.startY;
                            const nextBounds = {
                              x: widgetDragRef.current.origX + dx,
                              y: widgetDragRef.current.origY + dy,
                              width: widget.width || 170,
                              height: widget.height || 120,
                            };
                            setWhiteboardWidgets((prev) => prev.map((item) => (
                              item.id === widget.id ? { ...item, x: nextBounds.x, y: nextBounds.y } : item
                            )));
                            setWhiteboardAlignmentGuides(computeWhiteboardAlignmentGuides(nextBounds, widget.id));
                          }}
                          onPointerUp={() => {
                            widgetDragRef.current = null;
                            setWhiteboardAlignmentGuides([]);
                            setWhiteboardHoveredAnchor(null);
                          }}
                          onPointerCancel={() => {
                            widgetDragRef.current = null;
                            setWhiteboardAlignmentGuides([]);
                            setWhiteboardHoveredAnchor(null);
                          }}
                          onMouseEnter={() => setWhiteboardHoveredAnchor({ objectId: widget.id, anchorKey: anchor.key })}
                          onMouseLeave={() => setWhiteboardHoveredAnchor((prev) => (prev?.objectId === widget.id && prev?.anchorKey === anchor.key ? null : prev))}
                        >
                          <div
                            className={`relative h-3 w-3 rounded-full border-2 shadow-sm flex items-center justify-center ${whiteboardHoveredAnchor?.objectId === widget.id && whiteboardHoveredAnchor?.anchorKey === anchor.key ? 'border-blue-600 bg-blue-600 text-white' : 'border-blue-600 bg-white'}`}
                            style={{ cursor: anchor.cursor }}
                          >
                            {whiteboardHoveredAnchor?.objectId === widget.id && whiteboardHoveredAnchor?.anchorKey === anchor.key && (
                              <span className="text-[8px] leading-none">{anchor.icon}</span>
                            )}
                            {anchor.kind === 'connect' && (
                              <span className="absolute left-full ml-1 flex items-center gap-1 rounded-full border border-blue-500/20 bg-white px-1.5 py-0.5 text-[9px] font-semibold text-blue-600 shadow-sm">
                                <span className="h-2.5 w-2.5 rounded-full bg-blue-500" />
                                Link
                              </span>
                            )}
                          </div>
                        </div>
                      ))}
                      {widget.type === 'sticky' ? (
                        <textarea
                          value={widget.text || ''}
                          data-widget-interactive="true"
                          readOnly={!isWidgetEditing}
                          autoFocus={isWidgetEditing}
                          onFocus={() => setWhiteboardEditingWidgetId(widget.id)}
                          onBlur={() => setWhiteboardEditingWidgetId(null)}
                          onChange={(event) => {
                            const value = event.target.value;
                            setWhiteboardWidgets((prev) => prev.map((existingWidget) => (
                              existingWidget.id === widget.id ? { ...existingWidget, text: value } : existingWidget
                            )));
                          }}
                          className="w-full h-full bg-transparent resize-none outline-none text-[12px] text-amber-950 placeholder:text-amber-800/60 leading-snug"
                          placeholder="Type sticky note..."
                          style={{
                            cursor: ['eraser', 'hand'].includes(whiteboardTool) ? undefined : (isWidgetEditing ? 'text' : 'move'),
                            pointerEvents: isWidgetEditing ? 'auto' : 'none',
                          }}
                          onPointerDown={(e) => {
                            if (!isWidgetEditing) {
                              return;
                            }
                            e.stopPropagation();
                            setSelectedWidgetId(widget.id);
                            setSelectedShapeIndex(null);
                          }}
                          onKeyDown={(event) => {
                            if (event.key === 'Escape') {
                              event.currentTarget.blur();
                            }
                          }}
                        />
                      ) : widget.type === 'text' ? (
                        <textarea
                          value={widget.text || ''}
                          data-widget-interactive="true"
                          readOnly={!isWidgetEditing}
                          autoFocus={isWidgetEditing}
                          onFocus={() => setWhiteboardEditingWidgetId(widget.id)}
                          onBlur={() => setWhiteboardEditingWidgetId(null)}
                          onChange={(event) => {
                            const value = event.target.value;
                            setWhiteboardWidgets((prev) => prev.map((existingWidget) => (
                              existingWidget.id === widget.id ? { ...existingWidget, text: value } : existingWidget
                            )));
                          }}
                          className="w-full h-full bg-transparent resize-none outline-none placeholder:text-violet-700/60 leading-relaxed"
                          placeholder="Type your text..."
                          style={{
                            cursor: ['eraser', 'hand'].includes(whiteboardTool) ? undefined : (isWidgetEditing ? 'text' : 'move'),
                            fontFamily: widget.fontFamily || 'Calibri',
                            fontSize: `${widget.fontSize || 14}px`,
                            fontWeight: widget.isBold ? 700 : 500,
                            fontStyle: widget.isItalic ? 'italic' : 'normal',
                            textDecoration: widget.isUnderline ? 'underline' : 'none',
                            textAlign: widget.textAlign || 'left',
                            color: widget.textColor || '#111827',
                            backgroundColor: widget.highlightColor && widget.highlightColor !== '#ffffff' ? `${widget.highlightColor}33` : 'transparent',
                            opacity: Math.max(0, Math.min(100, widget.opacity ?? 100)) / 100,
                            pointerEvents: isWidgetEditing ? 'auto' : 'none',
                          }}
                          onPointerDown={(e) => {
                            if (!isWidgetEditing) {
                              return;
                            }
                            e.stopPropagation();
                            setSelectedWidgetId(widget.id);
                            setSelectedShapeIndex(null);
                          }}
                          onKeyDown={(event) => {
                            if (event.key === 'Escape') {
                              event.currentTarget.blur();
                            }
                          }}
                        />
                      ) : (
                        <>
                          <p className="text-[11px] font-semibold text-gray-900">{widget.title}</p>
                          <p className="mt-1 text-[11px] text-gray-700 leading-snug">{widget.body}</p>
                        </>
                      )}
                      {isSelected && !['eraser', 'hand'].includes(whiteboardTool) && (
                        <>
                          {[
                            { corner: 'tl', style: { top: -5, left: -5, cursor: 'nwse-resize' }, dw: -1, dh: -1, ox: 1, oy: 1 },
                            { corner: 'tr', style: { top: -5, right: -5, cursor: 'nesw-resize' }, dw: 1, dh: -1, ox: 0, oy: 1 },
                            { corner: 'bl', style: { bottom: -5, left: -5, cursor: 'nesw-resize' }, dw: -1, dh: 1, ox: 1, oy: 0 },
                            { corner: 'br', style: { bottom: -5, right: -5, cursor: 'nwse-resize' }, dw: 1, dh: 1, ox: 0, oy: 0 },
                          ].map(({ corner, style, dw, dh, ox, oy }) => (
                            <div
                              key={corner}
                              data-widget-interactive="true"
                              className="absolute w-3 h-3 bg-white border-2 border-violet-500 rounded-sm z-30"
                              style={{ ...style, position: 'absolute' }}
                              onPointerDown={(e) => {
                                e.stopPropagation();
                                e.preventDefault();
                                const startX = e.clientX;
                                const startY = e.clientY;
                                const origW = widget.width || 170;
                                const origH = widget.height || 120;
                                const origX = widget.x;
                                const origY = widget.y;
                                widgetResizeRef.current = { widgetId: widget.id, startX, startY, origW, origH, origX, origY, dw, dh, ox, oy };
                                e.currentTarget.setPointerCapture(e.pointerId);
                              }}
                              onPointerMove={(e) => {
                                const r = widgetResizeRef.current;
                                if (!r || r.widgetId !== widget.id) return;
                                const dx = (e.clientX - r.startX) * r.dw;
                                const dy = (e.clientY - r.startY) * r.dh;
                                const newW = Math.max(80, r.origW + dx);
                                const newH = Math.max(60, r.origH + dy);
                                const newX = r.origX - (newW - r.origW) * r.ox;
                                const newY = r.origY - (newH - r.origH) * r.oy;
                                setWhiteboardWidgets((prev) => prev.map((w) =>
                                  w.id === widget.id ? { ...w, width: newW, height: newH, x: newX, y: newY } : w
                                ));
                              }}
                              onPointerUp={() => { widgetResizeRef.current = null; }}
                            />
                          ))}
                        </>
                      )}
                      {isSelected && !['eraser', 'hand'].includes(whiteboardTool) && (
                        <div
                          data-widget-interactive="true"
                          className="absolute left-1/2 -translate-x-1/2 z-30 rounded-xl border border-gray-200 bg-white shadow-sm px-2 py-1.5"
                          style={{ top: `${(widget.height || 120) + 14}px` }}
                          onPointerDown={(e) => e.stopPropagation()}
                        >
                          <div className="flex items-center gap-1">
                            <button type="button" onClick={() => showToast('Drag anywhere on the block to move it. Double-click to edit text.')} className="h-7 w-7 rounded-md text-gray-600 hover:bg-gray-100 flex items-center justify-center cursor-grab" title="Move block"><Move size={13} /></button>
                            {widget.type === 'sticky' && (
                              <div className="relative">
                                <button type="button" onClick={() => setWhiteboardStickyColorMenuFor((prev) => (prev === widget.id ? null : widget.id))} className="h-7 w-7 rounded-md hover:bg-gray-100 flex items-center justify-center" title="Choose color">
                                  <span className="h-4 w-4 rounded-full border border-gray-300" style={{ backgroundColor: widget.color || '#fde047' }} />
                                </button>
                                {whiteboardStickyColorMenuFor === widget.id && (
                                  <div className="absolute left-0 mt-1 w-44 rounded-lg border border-gray-200 bg-white shadow-lg z-40 p-2" onPointerDown={(e) => e.stopPropagation()}>
                                    <div className="grid grid-cols-6 gap-1">
                                      {['#fde047', '#fca5a5', '#fdba74', '#86efac', '#93c5fd', '#d8b4fe', '#f9a8d4', '#67e8f9', '#e5e7eb', '#fef3c7', '#c7d2fe', '#bbf7d0'].map((color) => (
                                        <button key={color} type="button" onClick={() => { setWhiteboardWidgets((prev) => prev.map((w) => (w.id === widget.id ? { ...w, color } : w))); setWhiteboardStickyColorMenuFor(null); }} className={`h-5 w-5 rounded-full border ${widget.color === color ? 'border-violet-500 ring-1 ring-violet-300' : 'border-gray-300'}`} style={{ backgroundColor: color }} title={color} />
                                      ))}
                                    </div>
                                    <div className="mt-2 border-t border-gray-100 pt-2">
                                      <input type="color" value={widget.color || '#fde047'} onChange={(e) => setWhiteboardWidgets((prev) => prev.map((w) => (w.id === widget.id ? { ...w, color: e.target.value } : w)))} className="h-7 w-full rounded border border-gray-300 cursor-pointer" title="Custom color" />
                                    </div>
                                  </div>
                                )}
                              </div>
                            )}
                            <button
                              type="button"
                              onClick={() => {
                                if (widget.type === 'text') {
                                  addWhiteboardWidget('text', {
                                    x: widget.x + 24,
                                    y: widget.y + 24,
                                    width: widget.width,
                                    height: widget.height,
                                    fontFamily: widget.fontFamily,
                                    fontSize: widget.fontSize,
                                    textColor: widget.textColor,
                                  });
                                  const newId = `wb-widget-${Date.now()}-${whiteboardWidgets.length}`;
                                  setSelectedWidgetId(newId);
                                  setWhiteboardEditingWidgetId(newId);
                                  return;
                                }
                                const clone = { ...widget, id: `wb-widget-${Date.now()}-clone`, x: widget.x + 20, y: widget.y + 20 };
                                setWhiteboardWidgets((prev) => [...prev, clone]);
                                setSelectedWidgetId(clone.id);
                              }}
                              className="h-7 w-7 rounded-md text-gray-600 hover:bg-gray-100 flex items-center justify-center"
                              title={widget.type === 'text' ? 'New text block' : 'Duplicate'}
                            >
                              <Plus size={13} />
                            </button>
                            <button type="button" onClick={() => { setWhiteboardWidgets((prev) => prev.filter((w) => w.id !== widget.id)); setSelectedWidgetId((prev) => (prev === widget.id ? null : prev)); }} className="h-7 w-7 rounded-md text-gray-600 hover:bg-gray-100 hover:text-rose-600 flex items-center justify-center" title="Delete"><Trash2 size={13} /></button>
                            {widget.type === 'text' && (
                              <>
                            <select
                              value={widget.fontFamily || 'Calibri'}
                              onChange={(e) => setWhiteboardWidgets((prev) => prev.map((w) => (w.id === widget.id ? { ...w, fontFamily: e.target.value } : w)))}
                              className="h-7 text-xs px-2 border border-gray-300 rounded-md text-gray-700 bg-white shadow-[inset_0_1px_0_rgba(255,255,255,0.7)]"
                              title="Font Family"
                            >
                              {whiteboardFontOptions.map((font) => (
                                <option key={font} value={font}>{font}</option>
                              ))}
                            </select>
                            <input
                              type="number"
                              min="8"
                              max="96"
                              value={widget.fontSize || 14}
                              onChange={(e) => {
                                const nextSize = Number.parseInt(e.target.value, 10);
                                setWhiteboardWidgets((prev) => prev.map((w) => (w.id === widget.id ? { ...w, fontSize: Number.isNaN(nextSize) ? 14 : Math.max(8, Math.min(96, nextSize)) } : w)));
                              }}
                              className="h-7 text-xs w-12 px-1.5 border border-gray-300 rounded-md text-gray-700 bg-white"
                              title="Font Size"
                            />
                            <button type="button" onClick={() => setWhiteboardWidgets((prev) => prev.map((w) => (w.id === widget.id ? { ...w, isBold: !w.isBold } : w)))} className={`h-6 w-6 rounded-md flex items-center justify-center text-xs font-bold ${widget.isBold ? 'bg-violet-100 text-violet-600 border border-violet-300' : 'text-gray-600 hover:bg-gray-100'}`} title="Bold">B</button>
                            <button type="button" onClick={() => setWhiteboardWidgets((prev) => prev.map((w) => (w.id === widget.id ? { ...w, isItalic: !w.isItalic } : w)))} className={`h-6 w-6 rounded-md flex items-center justify-center text-xs italic ${widget.isItalic ? 'bg-violet-100 text-violet-600 border border-violet-300' : 'text-gray-600 hover:bg-gray-100'}`} title="Italic">I</button>
                            <button type="button" onClick={() => setWhiteboardWidgets((prev) => prev.map((w) => (w.id === widget.id ? { ...w, isUnderline: !w.isUnderline } : w)))} className={`h-6 w-6 rounded-md flex items-center justify-center text-xs underline ${widget.isUnderline ? 'bg-violet-100 text-violet-600 border border-violet-300' : 'text-gray-600 hover:bg-gray-100'}`} title="Underline">U</button>
                            <div className="border-l border-gray-200 pl-1 ml-0.5 flex gap-0.5">
                              <button type="button" onClick={() => setWhiteboardWidgets((prev) => prev.map((w) => (w.id === widget.id ? { ...w, textAlign: 'left' } : w)))} className={`h-6 w-6 rounded-md flex items-center justify-center ${widget.textAlign === 'left' ? 'bg-violet-100 text-violet-600 border border-violet-300' : 'text-gray-600 hover:bg-gray-100'}`} title="Align left"><AlignLeft size={13} /></button>
                              <button type="button" onClick={() => setWhiteboardWidgets((prev) => prev.map((w) => (w.id === widget.id ? { ...w, textAlign: 'center' } : w)))} className={`h-6 w-6 rounded-md flex items-center justify-center ${widget.textAlign === 'center' ? 'bg-violet-100 text-violet-600 border border-violet-300' : 'text-gray-600 hover:bg-gray-100'}`} title="Align center"><AlignCenter size={13} /></button>
                              <button type="button" onClick={() => setWhiteboardWidgets((prev) => prev.map((w) => (w.id === widget.id ? { ...w, textAlign: 'right' } : w)))} className={`h-6 w-6 rounded-md flex items-center justify-center ${widget.textAlign === 'right' ? 'bg-violet-100 text-violet-600 border border-violet-300' : 'text-gray-600 hover:bg-gray-100'}`} title="Align right"><AlignRight size={13} /></button>
                            </div>
                            <div className="border-l border-gray-200 pl-1 ml-0.5 flex gap-0.5">
                              <button type="button" onClick={() => toggleWidgetList(widget.id, 'bullet')} className={`h-6 w-6 rounded-md flex items-center justify-center ${widget.hasList && widget.listType === 'bullet' ? 'bg-violet-100 text-violet-600 border border-violet-300' : 'text-gray-600 hover:bg-gray-100'}`} title="Bullet list"><List size={13} /></button>
                              <button type="button" onClick={() => toggleWidgetList(widget.id, 'numbered')} className={`h-6 w-6 rounded-md flex items-center justify-center ${widget.hasList && widget.listType === 'numbered' ? 'bg-violet-100 text-violet-600 border border-violet-300' : 'text-gray-600 hover:bg-gray-100'}`} title="Numbered list"><ListOrdered size={13} /></button>
                            </div>
                            <button
                              type="button"
                              onClick={() => {
                                const nextUrl = window.prompt('Enter link URL', widget.linkedUrl || 'https://');
                                if (nextUrl === null) return;
                                setWhiteboardWidgets((prev) => prev.map((w) => (w.id === widget.id ? { ...w, linkedUrl: nextUrl.trim() } : w)));
                              }}
                              className={`h-6 w-6 rounded-md flex items-center justify-center ${widget.linkedUrl ? 'bg-violet-100 text-violet-600 border border-violet-300' : 'text-gray-600 hover:bg-gray-100'}`}
                              title="Insert link"
                            >
                              <LinkIcon size={13} />
                            </button>
                            <div className="relative">
                              <button
                                type="button"
                                onClick={() => setWhiteboardTextColorMenuFor((prev) => (prev === widget.id ? null : widget.id))}
                                className="h-6 w-6 rounded border border-gray-300 flex items-center justify-center"
                                title="Text color"
                              >
                                <span className="h-3.5 w-3.5 rounded-sm border border-gray-200" style={{ backgroundColor: widget.textColor || '#111827' }} />
                              </button>
                              {whiteboardTextColorMenuFor === widget.id && (
                                <div className="absolute left-0 mt-1 z-40 w-36 rounded-lg border border-gray-200 bg-white shadow-lg p-2" onPointerDown={(e) => e.stopPropagation()}>
                                  <div className="grid grid-cols-4 gap-1.5">
                                    {whiteboardTextColorPresets.map((color) => (
                                      <button
                                        key={`${widget.id}-text-${color}`}
                                        type="button"
                                        onClick={() => {
                                          setWhiteboardWidgets((prev) => prev.map((w) => (w.id === widget.id ? { ...w, textColor: color } : w)));
                                          setWhiteboardTextColorMenuFor(null);
                                        }}
                                        className={`h-6 w-6 rounded-md border ${widget.textColor === color ? 'border-violet-500 ring-1 ring-violet-200' : 'border-gray-200'}`}
                                        style={{ backgroundColor: color }}
                                      />
                                    ))}
                                  </div>
                                  <input
                                    type="color"
                                    value={widget.textColor || '#111827'}
                                    onChange={(e) => setWhiteboardWidgets((prev) => prev.map((w) => (w.id === widget.id ? { ...w, textColor: e.target.value } : w)))}
                                    className="mt-2 h-7 w-full rounded border border-gray-300 cursor-pointer"
                                    title="Custom text color"
                                  />
                                </div>
                              )}
                            </div>
                            <div className="relative">
                              <button
                                type="button"
                                onClick={() => setWhiteboardHighlightColorMenuFor((prev) => (prev === widget.id ? null : widget.id))}
                                className="h-6 w-6 rounded border border-gray-300 flex items-center justify-center"
                                title="Highlight color"
                              >
                                <span className="h-3.5 w-3.5 rounded-sm border border-gray-200" style={{ backgroundColor: widget.highlightColor || '#ffffff' }} />
                              </button>
                              {whiteboardHighlightColorMenuFor === widget.id && (
                                <div className="absolute left-0 mt-1 z-40 w-36 rounded-lg border border-gray-200 bg-white shadow-lg p-2" onPointerDown={(e) => e.stopPropagation()}>
                                  <div className="grid grid-cols-4 gap-1.5">
                                    {whiteboardHighlightColorPresets.map((color) => (
                                      <button
                                        key={`${widget.id}-highlight-${color}`}
                                        type="button"
                                        onClick={() => {
                                          setWhiteboardWidgets((prev) => prev.map((w) => (w.id === widget.id ? { ...w, highlightColor: color } : w)));
                                          setWhiteboardHighlightColorMenuFor(null);
                                        }}
                                        className={`h-6 w-6 rounded-md border ${widget.highlightColor === color ? 'border-violet-500 ring-1 ring-violet-200' : 'border-gray-200'}`}
                                        style={{ backgroundColor: color }}
                                      />
                                    ))}
                                  </div>
                                  <input
                                    type="color"
                                    value={widget.highlightColor || '#ffffff'}
                                    onChange={(e) => setWhiteboardWidgets((prev) => prev.map((w) => (w.id === widget.id ? { ...w, highlightColor: e.target.value } : w)))}
                                    className="mt-2 h-7 w-full rounded border border-gray-300 cursor-pointer"
                                    title="Custom highlight color"
                                  />
                                </div>
                              )}
                            </div>
                            <input type="range" min="10" max="100" value={widget.opacity ?? 100} onChange={(e) => setWhiteboardWidgets((prev) => prev.map((w) => (w.id === widget.id ? { ...w, opacity: Number.parseInt(e.target.value, 10) || 100 } : w)))} className="h-6 w-14 cursor-pointer" title="Opacity" />
                            <button
                              type="button"
                              onClick={() => {
                                setWhiteboardWidgets((prev) => prev.map((w) => (
                                  w.id === widget.id
                                    ? { ...w, text: (w.text && String(w.text).trim()) ? w.text : 'Idea\nKey points\nAction items' }
                                    : w
                                )));
                                showToast('Compose AI suggestion added');
                              }}
                              className="h-6 w-6 rounded-md text-gray-600 hover:bg-gray-100 flex items-center justify-center"
                              title="Compose AI"
                            >
                              <Sparkles size={13} />
                            </button>
                            <div className="relative">
                              <button
                                type="button"
                                onClick={() => setWhiteboardMoreTextMenuFor((prev) => (prev === widget.id ? null : widget.id))}
                                className="h-6 w-6 rounded-md text-gray-600 hover:bg-gray-100 flex items-center justify-center"
                                title="More options"
                              >
                                <MoreHorizontal size={13} />
                              </button>
                              {whiteboardMoreTextMenuFor === widget.id && (
                                <div className="absolute right-0 mt-1 w-40 rounded-lg border border-gray-200 bg-white shadow-lg z-40 py-1 text-xs" onPointerDown={(e) => e.stopPropagation()}>
                                  <button
                                    type="button"
                                    onClick={() => {
                                      if (widget.text) {
                                        navigator.clipboard?.writeText(String(widget.text)).catch(() => {});
                                      }
                                      setWhiteboardMoreTextMenuFor(null);
                                      showToast('Text copied');
                                    }}
                                    className="w-full text-left px-3 py-1.5 hover:bg-gray-50 text-gray-700"
                                  >
                                    Copy text
                                  </button>
                                  <button
                                    type="button"
                                    onClick={() => {
                                      const stylePayload = JSON.stringify({
                                        fontFamily: widget.fontFamily,
                                        fontSize: widget.fontSize,
                                        isBold: widget.isBold,
                                        isItalic: widget.isItalic,
                                        isUnderline: widget.isUnderline,
                                        textAlign: widget.textAlign,
                                        textColor: widget.textColor,
                                        highlightColor: widget.highlightColor,
                                        opacity: widget.opacity,
                                      });
                                      navigator.clipboard?.writeText(stylePayload).catch(() => {});
                                      setWhiteboardMoreTextMenuFor(null);
                                      showToast('Style copied');
                                    }}
                                    className="w-full text-left px-3 py-1.5 hover:bg-gray-50 text-gray-700"
                                  >
                                    Copy style
                                  </button>
                                  <div className="border-t border-gray-100 my-1" />
                                  <button
                                    type="button"
                                    onClick={() => {
                                      setWhiteboardWidgets((prev) => prev.filter((w) => w.id !== widget.id));
                                      setSelectedWidgetId((prev) => (prev === widget.id ? null : prev));
                                      setWhiteboardMoreTextMenuFor(null);
                                    }}
                                    className="w-full text-left px-3 py-1.5 hover:bg-rose-50 text-rose-600"
                                  >
                                    Delete block
                                  </button>
                                </div>
                              )}
                            </div>
                              </>
                            )}
                          </div>
                        </div>
                      )}
                    </div>
                    );
                  })}
                  {!['eraser', 'hand'].includes(whiteboardTool) && whiteboardShapes.map((shape, shapeIndex) => {
                    const bounds = getShapeBounds(shape);
                    const isShapeSelected = selectedShapeIndex === shapeIndex;
                    const isShapeHovered = whiteboardHoveredObject?.kind === 'shape' && whiteboardHoveredObject?.id === shapeIndex;
                    const isShapeReactionMenuOpen = whiteboardReactionMenuOpen && whiteboardReactionTarget?.kind === 'shape' && whiteboardReactionTarget?.id === shapeIndex;
                    const showShapeReactionControls = (isShapeHovered || isShapeSelected || isShapeReactionMenuOpen) && whiteboardTool !== 'hand' && whiteboardTool !== 'eraser';
                    const hitPadding = 8;
                    return (
                      <React.Fragment key={`whiteboard-shape-hit-${shapeIndex}`}>
                        <div
                          className="absolute z-[14]"
                          style={{
                            left: `${bounds.x - hitPadding}px`,
                            top: `${bounds.y - hitPadding}px`,
                            width: `${Math.max(bounds.width + hitPadding * 2, 18)}px`,
                            height: `${Math.max(bounds.height + hitPadding * 2, 18)}px`,
                            cursor: whiteboardTool === 'pen'
                              ? getWhiteboardCursor()
                              : (isShapeSelected ? 'move' : 'pointer'),
                          }}
                          onMouseEnter={() => setWhiteboardObjectHover('shape', shapeIndex)}
                          onMouseLeave={() => clearWhiteboardObjectHover('shape', shapeIndex)}
                          onPointerDown={(event) => {
                            event.stopPropagation();
                            event.preventDefault();
                            setSelectedShapeIndex(shapeIndex);
                            setSelectedWidgetId(null);
                            setWhiteboardEditingWidgetId(null);
                            shapeDragRef.current = {
                              shapeIndex,
                              startX: event.clientX,
                              startY: event.clientY,
                              originalShape: { ...shape },
                            };
                            event.currentTarget.setPointerCapture(event.pointerId);
                          }}
                          onPointerMove={(event) => {
                            const dragState = shapeDragRef.current;
                            if (!dragState || dragState.shapeIndex !== shapeIndex) {
                              return;
                            }
                            const dx = event.clientX - dragState.startX;
                            const dy = event.clientY - dragState.startY;
                            const nextShape = moveShapeByDelta(dragState.originalShape, dx, dy);
                            setWhiteboardShapes((prev) => prev.map((existingShape, existingIndex) => (
                              existingIndex === shapeIndex
                                ? nextShape
                                : existingShape
                            )));
                            setWhiteboardAlignmentGuides(computeWhiteboardAlignmentGuides(getShapeBounds(nextShape), `shape-${shapeIndex}`));
                          }}
                          onPointerUp={() => {
                            shapeDragRef.current = null;
                            setWhiteboardAlignmentGuides([]);
                          }}
                          onPointerCancel={() => {
                            shapeDragRef.current = null;
                            setWhiteboardAlignmentGuides([]);
                          }}
                        />
                        {showShapeReactionControls && (
                          <div
                            className="absolute z-[17]"
                            style={{ left: `${bounds.x + 4}px`, top: `${bounds.y + bounds.height - 20}px` }}
                            onPointerDown={(event) => event.stopPropagation()}
                          >
                            <button
                              type="button"
                              onClick={() => {
                                if (isShapeReactionMenuOpen) {
                                  setWhiteboardReactionMenuOpen(false);
                                  setWhiteboardReactionTarget(null);
                                  return;
                                }
                                setWhiteboardReactionTarget({ kind: 'shape', id: shapeIndex });
                                setWhiteboardEmojiModalOpen(false);
                                setWhiteboardEmojiSearch('');
                                setWhiteboardReactionMenuOpen(true);
                              }}
                              className="relative h-7 w-7 rounded-xl border border-slate-200 bg-white text-slate-600 shadow-sm hover:bg-slate-50 inline-flex items-center justify-center"
                              title="Quick reactions"
                            >
                              <span className="text-[14px] leading-none">☺</span>
                              <span className="absolute -top-1 -right-1 text-[9px] text-slate-500">+</span>
                            </button>
                            {isShapeReactionMenuOpen && (
                              <div className="absolute left-0 top-9 z-50 flex items-center gap-1.5 px-1 py-0.5">
                                <button
                                  type="button"
                                  onClick={() => {
                                    setWhiteboardReactionTarget({ kind: 'shape', id: shapeIndex });
                                    setWhiteboardReactionMenuOpen(false);
                                    setWhiteboardEmojiModalOpen(true);
                                    setWhiteboardEmojiSearch('');
                                  }}
                                  className="h-8 w-8 rounded-lg text-slate-700 hover:bg-slate-100 text-[22px] leading-none"
                                  title="All emojis"
                                >
                                  +
                                </button>
                                  {orderedWhiteboardEmojis.slice(0, 8).map((emojiItem) => (
                                    <button
                                      key={`${shapeIndex}-${emojiItem.emoji}`}
                                      type="button"
                                      onClick={() => applyWhiteboardReaction(emojiItem.emoji)}
                                      className="h-8 w-8 rounded-lg text-lg hover:bg-slate-100"
                                      title={`React with ${emojiItem.emoji}`}
                                    >
                                      {emojiItem.emoji}
                                    </button>
                                  ))}
                                <button
                                  type="button"
                                  onClick={() => {
                                    setWhiteboardReactionTarget({ kind: 'shape', id: shapeIndex });
                                    setWhiteboardReactionMenuOpen(false);
                                    setWhiteboardEmojiModalOpen(true);
                                    setWhiteboardEmojiSearch('');
                                  }}
                                  className="h-8 w-8 rounded-lg text-slate-500 hover:bg-slate-100 text-[18px]"
                                  title="More"
                                >
                                  ˅
                                </button>
                              </div>
                            )}
                          </div>
                        )}
                        {isShapeSelected && (
                          <>
                            <div
                              className="absolute pointer-events-none z-[15] rounded-sm border-2 border-violet-500"
                              style={{
                                left: `${bounds.x}px`,
                                top: `${bounds.y}px`,
                                width: `${Math.max(bounds.width, 1)}px`,
                                height: `${Math.max(bounds.height, 1)}px`,
                              }}
                            />
                            {[
                              { corner: 'tl', style: { top: -5, left: -5, cursor: 'nwse-resize' }, dw: -1, dh: -1, ox: 1, oy: 1 },
                              { corner: 'tr', style: { top: -5, right: -5, cursor: 'nesw-resize' }, dw: 1, dh: -1, ox: 0, oy: 1 },
                              { corner: 'bl', style: { bottom: -5, left: -5, cursor: 'nesw-resize' }, dw: -1, dh: 1, ox: 1, oy: 0 },
                              { corner: 'br', style: { bottom: -5, right: -5, cursor: 'nwse-resize' }, dw: 1, dh: 1, ox: 0, oy: 0 },
                            ].map(({ corner, style, dw, dh, ox, oy }) => (
                              <div
                                key={`${shapeIndex}-${corner}`}
                                className="absolute z-[16]"
                                style={{
                                  left: `${bounds.x}px`,
                                  top: `${bounds.y}px`,
                                  width: `${Math.max(bounds.width, 1)}px`,
                                  height: `${Math.max(bounds.height, 1)}px`,
                                }}
                              >
                                <div
                                  className="absolute w-3 h-3 bg-white border-2 border-violet-500 rounded-sm"
                                  style={style}
                                  onPointerDown={(event) => {
                                    event.stopPropagation();
                                    event.preventDefault();
                                    shapeResizeRef.current = {
                                      shapeIndex,
                                      startX: event.clientX,
                                      startY: event.clientY,
                                      sourceBounds: bounds,
                                      originalShape: { ...shape },
                                      dw,
                                      dh,
                                      ox,
                                      oy,
                                    };
                                    event.currentTarget.setPointerCapture(event.pointerId);
                                  }}
                                  onPointerMove={(event) => {
                                    const resizeState = shapeResizeRef.current;
                                    if (!resizeState || resizeState.shapeIndex !== shapeIndex) {
                                      return;
                                    }
                                    const dx = (event.clientX - resizeState.startX) * resizeState.dw;
                                    const dy = (event.clientY - resizeState.startY) * resizeState.dh;
                                    const nextWidth = Math.max(24, resizeState.sourceBounds.width + dx);
                                    const nextHeight = Math.max(24, resizeState.sourceBounds.height + dy);
                                    const nextX = resizeState.sourceBounds.x - (nextWidth - resizeState.sourceBounds.width) * resizeState.ox;
                                    const nextY = resizeState.sourceBounds.y - (nextHeight - resizeState.sourceBounds.height) * resizeState.oy;
                                    setWhiteboardShapes((prev) => prev.map((existingShape, existingIndex) => (
                                      existingIndex === shapeIndex
                                        ? resizeShapeFromBounds(
                                          resizeState.originalShape,
                                          resizeState.sourceBounds,
                                          { x: nextX, y: nextY, width: nextWidth, height: nextHeight },
                                        )
                                        : existingShape
                                    )));
                                  }}
                                  onPointerUp={() => {
                                    shapeResizeRef.current = null;
                                  }}
                                  onPointerCancel={() => {
                                    shapeResizeRef.current = null;
                                  }}
                                />
                              </div>
                            ))}
                          </>
                        )}
                      </React.Fragment>
                    );
                  })}
                  <svg className="absolute inset-0 w-full h-full pointer-events-none">
                    {whiteboardShapes.map((shape, shapeIndex) => renderWhiteboardShape(shape, `whiteboard-shape-${shapeIndex}`))}
                    {whiteboardStrokes.map((stroke, strokeIndex) => (
                      <path
                        key={`whiteboard-stroke-${strokeIndex}`}
                        d={typeof stroke === 'string' ? stroke : stroke.path}
                        stroke={typeof stroke === 'string' ? '#7c3aed' : stroke.stroke}
                        strokeWidth={typeof stroke === 'string' ? 2.5 : stroke.width}
                        strokeOpacity={typeof stroke === 'string' ? 1 : stroke.opacity}
                        strokeDasharray={typeof stroke === 'string' ? undefined : (stroke.dashArray || undefined)}
                        fill="none"
                        strokeLinecap="round"
                        strokeLinejoin="round"
                      />
                    ))}
                    {whiteboardCurrentStroke && (
                      <path
                        d={whiteboardCurrentStroke}
                        stroke={activeWhiteboardPen.stroke}
                        strokeWidth={effectiveWhiteboardPenWidth}
                        strokeOpacity={activeWhiteboardPen.opacity ?? 1}
                        strokeDasharray={activeWhiteboardPen.dashArray || undefined}
                        fill="none"
                        strokeLinecap="round"
                        strokeLinejoin="round"
                      />
                    )}
                    {whiteboardCurrentShape && renderWhiteboardShape(whiteboardCurrentShape, 'whiteboard-active-shape')}
                  </svg>
                  {whiteboardAlignmentGuides.length > 0 && (
                    <svg className="absolute inset-0 w-full h-full pointer-events-none z-20">
                      {whiteboardAlignmentGuides.map((guide, guideIndex) => (
                        guide.kind === 'vertical'
                          ? (
                            <line
                              key={`whiteboard-guide-v-${guide.candidateKey}-${guideIndex}`}
                              x1={guide.x}
                              y1={guide.y1}
                              x2={guide.x}
                              y2={guide.y2}
                              stroke="rgba(37,99,235,0.85)"
                              strokeWidth="1.6"
                              strokeDasharray="5 5"
                              strokeLinecap="round"
                            />
                          )
                          : (
                            <line
                              key={`whiteboard-guide-h-${guide.candidateKey}-${guideIndex}`}
                              x1={guide.x1}
                              y1={guide.y}
                              x2={guide.x2}
                              y2={guide.y}
                              stroke="rgba(37,99,235,0.85)"
                              strokeWidth="1.6"
                              strokeDasharray="5 5"
                              strokeLinecap="round"
                            />
                          )
                      ))}
                    </svg>
                  )}
                  {whiteboardComments.map((comment) => (
                    <div
                      key={comment.id}
                      className="absolute z-25 pointer-events-auto group"
                      style={{ left: `${comment.x}px`, top: `${comment.y}px`, transform: 'translate(-50%, -100%)' }}
                    >
                      <div className="relative flex flex-col items-center">
                        <div
                          className="bg-sky-500 text-white rounded-lg px-2 py-1 text-[10px] font-medium shadow-md"
                          style={{
                            width: `${comment.expanded ? (comment.width || 180) : 148}px`,
                            minHeight: `${comment.expanded ? (comment.height || 86) : 34}px`,
                            cursor: commentDragRef.current?.commentId === comment.id ? 'grabbing' : 'grab',
                            touchAction: 'none',
                          }}
                          onPointerDown={(event) => {
                            if (event.target.closest('textarea,button')) {
                              return;
                            }
                            event.stopPropagation();
                            setWhiteboardActiveCommentId(comment.id);
                            commentDragRef.current = {
                              commentId: comment.id,
                              startClientX: event.clientX,
                              startClientY: event.clientY,
                              originX: comment.x,
                              originY: comment.y,
                            };
                            event.currentTarget.setPointerCapture(event.pointerId);
                          }}
                          onPointerMove={(event) => {
                            const dragState = commentDragRef.current;
                            if (!dragState || dragState.commentId !== comment.id) {
                              return;
                            }
                            const dx = event.clientX - dragState.startClientX;
                            const dy = event.clientY - dragState.startClientY;
                            setWhiteboardComments((prev) => prev.map((item) => (
                              item.id === comment.id
                                ? { ...item, x: dragState.originX + dx, y: dragState.originY + dy }
                                : item
                            )));
                          }}
                          onPointerUp={() => {
                            commentDragRef.current = null;
                          }}
                          onPointerCancel={() => {
                            commentDragRef.current = null;
                          }}
                        >
                          <div className="flex items-center justify-between gap-1 mb-1">
                            <span className="text-[10px] font-semibold">Comment</span>
                            <button
                              type="button"
                              onPointerDown={(event) => event.stopPropagation()}
                              onClick={() => {
                                setWhiteboardComments((prev) => prev.map((item) => (
                                  item.id === comment.id
                                    ? {
                                      ...item,
                                      expanded: !item.expanded,
                                      width: item.expanded ? 148 : Math.max(180, item.width || 180),
                                      height: item.expanded ? 34 : Math.max(86, item.height || 86),
                                    }
                                    : item
                                )));
                              }}
                              className="h-5 w-5 rounded bg-white/15 hover:bg-white/25 flex items-center justify-center text-[11px]"
                              title={comment.expanded ? 'Collapse' : 'Expand'}
                            >
                              {comment.expanded ? '-' : '+'}
                            </button>
                          </div>
                          {comment.expanded ? (
                            <textarea
                              autoFocus={whiteboardActiveCommentId === comment.id}
                              value={comment.text || ''}
                              onChange={(event) => {
                                const value = event.target.value;
                                const nextWidth = Math.max(180, event.currentTarget.offsetWidth || comment.width || 180);
                                const nextHeight = Math.max(86, event.currentTarget.offsetHeight || comment.height || 86);
                                setWhiteboardComments((prev) => prev.map((item) => (
                                  item.id === comment.id
                                    ? { ...item, text: value, width: nextWidth, height: nextHeight }
                                    : item
                                )));
                              }}
                              className="w-full h-[64px] resize bg-transparent border border-white/30 rounded px-1.5 py-1 outline-none placeholder:text-white/70 text-[11px] leading-snug"
                              placeholder="Type your comment..."
                              onPointerDown={(event) => event.stopPropagation()}
                            />
                          ) : (
                            <p className="text-[11px] leading-snug whitespace-nowrap overflow-hidden text-ellipsis">{comment.text || 'Tap + to expand comment'}</p>
                          )}
                        </div>
                        <div className="w-2 h-2 bg-sky-500 rotate-45 -mt-1 shadow-sm" />
                        <button
                          type="button"
                          onClick={() => {
                            setWhiteboardComments((prev) => prev.filter((c) => c.id !== comment.id));
                            setWhiteboardActiveCommentId((prev) => (prev === comment.id ? null : prev));
                          }}
                          className="absolute -top-1.5 -right-1.5 w-4 h-4 bg-white border border-gray-200 rounded-full text-gray-400 hover:text-red-500 items-center justify-center hidden group-hover:flex"
                          title="Remove comment"
                        >
                          ×
                        </button>
                      </div>
                    </div>
                  ))}
                  {whiteboardEmojiModalOpen && whiteboardReactionTarget && (() => {
                    const targetBounds = getWhiteboardReactionTargetBounds(whiteboardReactionTarget);
                    const modalLeft = Math.max(16, Math.min((targetBounds?.x || 40), 760));
                    const modalTop = Math.max(16, Math.min((targetBounds ? targetBounds.y + targetBounds.height + 16 : 64), 520));
                    return (
                      <div
                        className="absolute inset-0 z-[360]"
                        onPointerDown={() => {
                          setWhiteboardEmojiModalOpen(false);
                          setWhiteboardReactionMenuOpen(false);
                          setWhiteboardReactionTarget(null);
                          setWhiteboardEmojiSearch('');
                        }}
                      >
                        <div
                          className="absolute w-[360px] max-w-[calc(100%-20px)] rounded-[22px] border border-slate-200 bg-white p-3 shadow-[0_18px_48px_-26px_rgba(15,23,42,0.5)]"
                          style={{ left: `${modalLeft}px`, top: `${modalTop}px` }}
                          onPointerDown={(event) => event.stopPropagation()}
                        >
                          <div className="relative">
                            <input
                              type="text"
                              value={whiteboardEmojiSearch}
                              onChange={(event) => setWhiteboardEmojiSearch(event.target.value)}
                              placeholder="Search"
                              className="w-full h-10 rounded-2xl border border-slate-200 px-3 pr-10 text-sm text-slate-700 outline-none focus:border-blue-500"
                            />
                            <button
                              type="button"
                              onClick={() => setWhiteboardEmojiSearch('')}
                              className="absolute right-2 top-1/2 -translate-y-1/2 text-slate-400 hover:text-slate-600"
                              title="Clear"
                            >
                              ×
                            </button>
                          </div>
                          <div className="mt-2 flex items-center gap-2 text-slate-500 overflow-x-auto thin-scrollbar pb-1">
                            <button type="button" className="h-8 w-8 rounded-full border border-slate-200 hover:bg-slate-100" title="Recent">🕘</button>
                            <button type="button" className="h-8 w-8 rounded-full border border-slate-200 hover:bg-slate-100" title="Smileys">🙂</button>
                            <button type="button" className="h-8 w-8 rounded-full border border-slate-200 hover:bg-slate-100" title="Animals">🐻</button>
                            <button type="button" className="h-8 w-8 rounded-full border border-slate-200 hover:bg-slate-100" title="Gestures">👍</button>
                            <button type="button" className="h-8 w-8 rounded-full border border-slate-200 hover:bg-slate-100" title="Ideas">💡</button>
                            <button type="button" className="h-8 w-8 rounded-full border border-slate-200 hover:bg-slate-100" title="Objects">🏷️</button>
                            <button type="button" className="h-8 w-8 rounded-full border border-slate-200 hover:bg-slate-100" title="Stars">✨</button>
                            <button type="button" className="h-8 w-8 rounded-full border border-slate-200 hover:bg-slate-100" title="Hearts">❤️</button>
                            <button type="button" className="h-8 w-8 rounded-full border border-slate-200 hover:bg-slate-100" title="Rocket">🚀</button>
                          </div>
                          <div className="mt-2 text-[11px] font-semibold text-slate-500">Recent</div>
                          <div className="mt-1 grid grid-cols-8 gap-1.5 max-h-[260px] overflow-y-auto thin-scrollbar pr-1">
                            {(filteredWhiteboardEmojis.length ? filteredWhiteboardEmojis : orderedWhiteboardEmojis).map((item) => (
                              <button
                                key={item.emoji}
                                type="button"
                                onClick={() => applyWhiteboardReaction(item.emoji)}
                                className="h-8 rounded-lg border border-slate-100 text-lg hover:bg-slate-100"
                                title={`${item.emoji} · ${item.count || 0} uses`}
                              >
                                {item.emoji}
                              </button>
                            ))}
                          </div>
                        </div>
                      </div>
                    );
                  })()}
                  <div className="absolute left-1/2 bottom-4 -translate-x-1/2 z-20 rounded-2xl border border-gray-200 bg-white/95 shadow-sm px-2.5 py-2 flex items-center gap-1.5">
                    <button type="button" onClick={handleWhiteboardUndo} className="h-9 w-9 rounded-lg text-gray-500 hover:bg-gray-100 hover:text-gray-700 flex items-center justify-center" title="Undo (Ctrl+Z)"><Undo2 size={15} /></button>
                    <button type="button" onClick={handleWhiteboardRedo} className="h-9 w-9 rounded-lg text-gray-500 hover:bg-gray-100 hover:text-gray-700 flex items-center justify-center" title="Redo (Ctrl+Shift+Z)"><Redo2 size={15} /></button>
                    <div className="w-px h-5 bg-gray-200 mx-0.5" />
                    <button type="button" onClick={() => { activateWhiteboardTool('pen'); setWhiteboardPenVariant('highlighter'); showToast('Highlighter active'); }} className={`h-9 w-9 rounded-lg flex items-center justify-center ${whiteboardTool === 'pen' && whiteboardPenVariant === 'highlighter' ? 'bg-yellow-100 text-yellow-700' : 'text-gray-500 hover:bg-gray-100 hover:text-gray-700'}`} title="Highlighter"><Highlighter size={15} /></button>
                    <div className="h-9 rounded-lg border border-gray-200 bg-gray-50 px-1.5 flex items-center gap-1">
                      <button type="button" onClick={() => setWhiteboardZoomLevel((prev) => Math.max(30, prev - 10))} className="h-7 w-7 rounded-md text-gray-600 hover:bg-white hover:text-gray-800 flex items-center justify-center" title="Zoom out">-</button>
                      <span className="min-w-[42px] text-center text-[13px] font-semibold text-gray-700 select-none">{whiteboardZoomLevel}%</span>
                      <button type="button" onClick={() => setWhiteboardZoomLevel((prev) => Math.min(200, prev + 10))} className="h-7 w-7 rounded-md text-gray-600 hover:bg-white hover:text-gray-800 flex items-center justify-center" title="Zoom in">+</button>
                    </div>
                    <div className="w-px h-5 bg-gray-200 mx-0.5" />
                    <button type="button" onClick={() => showToast('Collaboration: invite collaborators from the Rooms panel')} className="h-9 w-9 rounded-lg text-gray-500 hover:bg-gray-100 hover:text-gray-700 flex items-center justify-center" title="Collaboration"><Users size={15} /></button>
                    <div className="relative">
                      <button
                        type="button"
                        onClick={() => setWhiteboardTemplateMenuOpen((prev) => !prev)}
                        className={`h-9 w-9 rounded-lg flex items-center justify-center ${whiteboardTemplateMenuOpen ? 'bg-violet-100 text-violet-700' : 'text-gray-500 hover:bg-gray-100 hover:text-gray-700'}`}
                        title="Templates"
                      >
                        <LayoutGrid size={15} />
                      </button>
                      {whiteboardTemplateMenuOpen && (
                        <div className="absolute bottom-11 right-0 z-[360] rounded-xl border border-gray-200 bg-white shadow-lg p-2 w-[332px] max-h-[420px] overflow-y-auto thin-scrollbar">
                          <div className="rounded-lg border border-violet-100 bg-violet-50/50 p-2 mb-2">
                            <div className="text-[11px] font-semibold text-violet-700 mb-1">AI template generator</div>
                            <textarea
                              value={whiteboardTemplatePrompt}
                              onChange={(event) => setWhiteboardTemplatePrompt(event.target.value)}
                              className="w-full h-16 resize-none rounded-md border border-violet-200 bg-white px-2 py-1 text-[11px] text-gray-700 outline-none focus:border-violet-300"
                              placeholder="Describe customer input, use case, or desired structure..."
                            />
                            <input
                              ref={whiteboardTemplateSourceInputRef}
                              type="file"
                              multiple
                              accept="image/*,.pdf,.doc,.docx,.txt,.md"
                              className="hidden"
                              onChange={handleWhiteboardTemplateSourceUpload}
                            />
                            <div className="mt-1.5 flex items-center gap-1.5">
                              <button
                                type="button"
                                onClick={() => whiteboardTemplateSourceInputRef.current?.click()}
                                className="text-[10px] px-2 py-1 rounded-md border border-gray-200 bg-white text-gray-600 hover:bg-gray-50"
                              >
                                Attach UI/docs
                              </button>
                              <button
                                type="button"
                                onClick={generateAiWhiteboardTemplate}
                                className="text-[10px] px-2 py-1 rounded-md bg-violet-600 text-white hover:bg-violet-700 inline-flex items-center gap-1"
                              >
                                <Sparkles size={10} />
                                Generate
                              </button>
                              <button
                                type="button"
                                onClick={saveCurrentWhiteboardAsTemplate}
                                className="text-[10px] px-2 py-1 rounded-md border border-violet-200 text-violet-700 hover:bg-violet-50"
                              >
                                Save current
                              </button>
                            </div>
                            {whiteboardTemplateSources.length > 0 && (
                              <div className="mt-2 flex flex-wrap gap-1">
                                {whiteboardTemplateSources.map((source) => (
                                  <span key={source.id} className="inline-flex items-center rounded-full bg-white border border-gray-200 px-2 py-0.5 text-[10px] text-gray-600">
                                    {source.name}
                                  </span>
                                ))}
                              </div>
                            )}
                          </div>
                          <div className="px-1 pb-1 text-[11px] font-semibold text-gray-700">Prebuilt templates</div>
                          {Array.from(new Set(['Startup', 'Enterprise', 'Personal', 'Saved', ...whiteboardTemplateCatalog.map((template) => template.category)])).map((category) => (
                            <div key={category} className="mt-1.5">
                              <div className="px-1 py-1 text-[10px] uppercase tracking-wide text-gray-400">{category}</div>
                              <div className="grid grid-cols-2 gap-2">
                                {whiteboardTemplateCatalog
                                  .filter((template) => template.category === category)
                                  .map((template) => (
                                    <button
                                      key={template.key}
                                      type="button"
                                      onClick={() => applyWhiteboardTemplate(template.key)}
                                      className="w-full text-left p-2 rounded-lg border border-gray-200 hover:border-violet-200 hover:bg-violet-50"
                                    >
                                      <div className="mb-2 h-20 rounded-md bg-gray-100 p-2 flex items-end gap-1 overflow-hidden">
                                        {(template.preview || ['#c4b5fd', '#93c5fd', '#fcd34d', '#86efac']).map((swatch, index) => (
                                          <div key={`${template.key}-swatch-${index}`} className="flex-1 rounded-sm" style={{ backgroundColor: swatch, height: `${58 + (index % 3) * 8}px` }} />
                                        ))}
                                      </div>
                                      <div className="text-xs font-semibold text-gray-800">{template.label}</div>
                                      <div className="text-[10px] text-gray-500 mt-0.5">{template.detail}</div>
                                    </button>
                                  ))}
                              </div>
                            </div>
                          ))}
                        </div>
                      )}
                    </div>
                    <div className="relative">
                      <button
                        type="button"
                        onClick={() => setWhiteboardAddMenuOpen((prev) => !prev)}
                        className="h-9 w-9 rounded-lg bg-violet-600 text-white hover:bg-violet-700 flex items-center justify-center shadow-sm"
                        title="Add object"
                      >
                        <Plus size={15} />
                      </button>
                      {whiteboardAddMenuOpen && (
                        <div className="absolute bottom-11 right-0 z-[360] rounded-xl border border-gray-200 bg-white shadow-lg p-1.5 w-44">
                          {[
                            { label: 'Sticky Note', icon: StickyNote, action: () => { activateWhiteboardTool('sticky'); setWhiteboardAddMenuOpen(false); } },
                            { label: 'Text', icon: Type, action: () => { activateWhiteboardTool('text'); setWhiteboardAddMenuOpen(false); } },
                            { label: 'Shape', icon: Shapes, action: () => { activateWhiteboardTool('shapes'); setWhiteboardAddMenuOpen(false); } },
                            { label: 'Image', icon: ImageIcon, action: () => { activateWhiteboardTool('image'); setWhiteboardAddMenuOpen(false); } },
                            { label: 'Connector', icon: LinkIcon, action: () => { activateWhiteboardTool('link'); setWhiteboardAddMenuOpen(false); } },
                            { label: 'Comment', icon: MessageCircle, action: () => { activateWhiteboardTool('comment'); setWhiteboardAddMenuOpen(false); } },
                            { label: 'Task Card', icon: CheckSquare, action: () => { addWhiteboardWidget('task'); setWhiteboardAddMenuOpen(false); showToast('Task card added'); } },
                            { label: 'AI Workflow', icon: Bot, action: () => { showToast('AI Workflow — coming soon'); setWhiteboardAddMenuOpen(false); } },
                          ].map((item) => (
                            <button
                              key={item.label}
                              type="button"
                              onClick={item.action}
                              className="w-full text-left text-xs px-2 py-1.5 rounded-md hover:bg-violet-50 hover:text-violet-700 inline-flex items-center gap-1.5"
                            >
                              <item.icon size={12} />
                              {item.label}
                            </button>
                          ))}
                        </div>
                      )}
                    </div>
                    <button
                      type="button"
                      onClick={() => resetWhiteboardCanvas()}
                      className="h-9 w-9 rounded-lg text-gray-500 hover:bg-gray-100 hover:text-gray-700 flex items-center justify-center"
                      title="Clear board"
                    >
                      <Trash2 size={15} />
                    </button>
                    <div className="w-px h-5 bg-gray-200 mx-0.5" />
                    <button
                      type="button"
                      onClick={() => {
                        activateWhiteboardTool('eraser');
                        setWhiteboardEraserMenuOpen(true);
                      }}
                      className={`h-9 w-9 rounded-lg flex items-center justify-center ${whiteboardTool === 'eraser' ? 'bg-violet-100 text-violet-700' : 'text-gray-500 hover:bg-gray-100 hover:text-gray-700'}`}
                      title="Eraser"
                    >
                      <Eraser size={15} />
                    </button>
                    <button
                      type="button"
                      onClick={() => activateWhiteboardTool('image')}
                      className={`h-9 w-9 rounded-lg flex items-center justify-center ${whiteboardTool === 'image' ? 'bg-violet-100 text-violet-700' : 'text-gray-500 hover:bg-gray-100 hover:text-gray-700'}`}
                      title="Image"
                    >
                      <ImageIcon size={15} />
                    </button>
                    <button
                      type="button"
                      onClick={() => setWhiteboardMoreMenuOpen((prev) => !prev)}
                      className={`h-9 w-9 rounded-lg flex items-center justify-center ${whiteboardMoreMenuOpen ? 'bg-violet-100 text-violet-700' : 'text-gray-500 hover:bg-gray-100 hover:text-gray-700'}`}
                      title="More"
                    >
                      <MoreHorizontal size={15} />
                    </button>
                  </div>

                  {whiteboardTaskPreviewOpen && (
                    <div className="absolute inset-0 z-30 bg-slate-950/28 backdrop-blur-[2px] flex items-center justify-center p-4">
                      <div className="w-[920px] max-w-[96vw] max-h-[88vh] overflow-hidden rounded-[24px] border border-slate-200 bg-white shadow-[0_30px_90px_-40px_rgba(15,23,42,0.55)] flex flex-col">
                        <div className="flex items-start justify-between gap-4 border-b border-slate-100 px-5 py-4">
                          <div>
                            <div className="text-[11px] font-semibold uppercase tracking-[0.12em] text-violet-600">AI Task Conversion Preview</div>
                            <div className="mt-1 text-lg font-semibold text-slate-900">{whiteboardTaskPreview.projectName || 'Whiteboard Project'}</div>
                            <div className="mt-1 text-sm text-slate-500">{whiteboardTaskPreview.summary}</div>
                          </div>
                          <button
                            type="button"
                            onClick={() => setWhiteboardTaskPreviewOpen(false)}
                            className="h-9 w-9 rounded-full text-slate-400 hover:bg-slate-100 hover:text-slate-600 flex items-center justify-center"
                            title="Close preview"
                          >
                            <X size={16} />
                          </button>
                        </div>

                        <div className="grid grid-cols-5 gap-2 border-b border-slate-100 px-5 py-3 bg-slate-50/70">
                          {[
                            { label: 'Tasks', value: whiteboardTaskPreviewStats.tasks },
                            { label: 'Milestones', value: whiteboardTaskPreviewStats.milestones },
                            { label: 'Risks', value: whiteboardTaskPreviewStats.risks },
                            { label: 'Phases', value: whiteboardTaskPreviewStats.phases },
                            { label: 'Dependencies', value: whiteboardTaskPreviewStats.dependencies },
                          ].map((stat) => (
                            <div key={stat.label} className="rounded-2xl border border-slate-200 bg-white px-3 py-2">
                              <div className="text-[11px] font-medium text-slate-500">{stat.label}</div>
                              <div className="mt-1 text-lg font-semibold text-slate-900">{stat.value}</div>
                            </div>
                          ))}
                        </div>

                        <div className="flex items-center justify-between gap-3 px-5 py-3 border-b border-slate-100">
                          <div className="text-sm text-slate-500">Review detected work items before sending them into Tasks.</div>
                          <button
                            type="button"
                            onClick={mergeWhiteboardTaskPreviewDuplicates}
                            className="inline-flex items-center gap-2 rounded-lg border border-violet-200 bg-violet-50 px-3 py-2 text-xs font-semibold text-violet-700 hover:bg-violet-100"
                          >
                            <Sparkles size={13} />
                            Merge duplicates
                          </button>
                        </div>

                        <div className="flex-1 overflow-y-auto thin-scrollbar px-5 py-4 space-y-3 bg-[#fbfbfe]">
                          {whiteboardTaskPreview.items.map((item) => (
                            <div key={item.id} className="rounded-2xl border border-slate-200 bg-white p-3 shadow-sm">
                              <div className="grid grid-cols-[minmax(0,1.6fr)_130px_130px_130px_auto] gap-2 items-start">
                                <div>
                                  <input
                                    value={item.title}
                                    onChange={(event) => updateWhiteboardTaskPreviewItem(item.id, { title: event.target.value })}
                                    className="w-full rounded-lg border border-slate-200 px-3 py-2 text-sm font-semibold text-slate-800 outline-none focus:border-violet-300"
                                  />
                                  <textarea
                                    value={item.notes || ''}
                                    onChange={(event) => updateWhiteboardTaskPreviewItem(item.id, { notes: event.target.value })}
                                    className="mt-2 h-20 w-full resize-none rounded-lg border border-slate-200 px-3 py-2 text-xs text-slate-600 outline-none focus:border-violet-300"
                                  />
                                </div>
                                <select
                                  value={item.type}
                                  onChange={(event) => updateWhiteboardTaskPreviewItem(item.id, { type: event.target.value })}
                                  className="rounded-lg border border-slate-200 px-2 py-2 text-xs text-slate-700 outline-none focus:border-violet-300"
                                >
                                  <option value="task">Task</option>
                                  <option value="milestone">Milestone</option>
                                  <option value="risk">Risk</option>
                                </select>
                                <input
                                  value={item.phase || ''}
                                  onChange={(event) => updateWhiteboardTaskPreviewItem(item.id, { phase: event.target.value })}
                                  placeholder="Phase"
                                  className="rounded-lg border border-slate-200 px-2 py-2 text-xs text-slate-700 outline-none focus:border-violet-300"
                                />
                                <input
                                  value={item.assignee || ''}
                                  onChange={(event) => updateWhiteboardTaskPreviewItem(item.id, { assignee: event.target.value })}
                                  placeholder="Assignee"
                                  className="rounded-lg border border-slate-200 px-2 py-2 text-xs text-slate-700 outline-none focus:border-violet-300"
                                />
                                <button
                                  type="button"
                                  onClick={() => removeWhiteboardTaskPreviewItem(item.id)}
                                  className="h-9 w-9 rounded-lg text-slate-400 hover:bg-rose-50 hover:text-rose-600 flex items-center justify-center"
                                  title="Remove item"
                                >
                                  <Trash2 size={14} />
                                </button>
                              </div>

                              <div className="mt-2 grid grid-cols-[140px_140px_minmax(0,1fr)] gap-2">
                                <select
                                  value={item.priority || 'low'}
                                  onChange={(event) => updateWhiteboardTaskPreviewItem(item.id, { priority: event.target.value })}
                                  className="rounded-lg border border-slate-200 px-2 py-2 text-xs text-slate-700 outline-none focus:border-violet-300"
                                >
                                  <option value="low">Low priority</option>
                                  <option value="medium">Medium priority</option>
                                  <option value="high">High priority</option>
                                </select>
                                <input
                                  value={item.dueLabel || ''}
                                  onChange={(event) => updateWhiteboardTaskPreviewItem(item.id, { dueLabel: event.target.value })}
                                  placeholder="Due date"
                                  className="rounded-lg border border-slate-200 px-2 py-2 text-xs text-slate-700 outline-none focus:border-violet-300"
                                />
                                <input
                                  value={(item.dependencies || []).join(', ')}
                                  onChange={(event) => updateWhiteboardTaskPreviewItem(item.id, { dependencies: event.target.value.split(',').map((value) => value.trim()).filter(Boolean) })}
                                  placeholder="Dependencies"
                                  className="rounded-lg border border-slate-200 px-2 py-2 text-xs text-slate-700 outline-none focus:border-violet-300"
                                />
                              </div>

                              <div className="mt-2 flex flex-wrap gap-1.5">
                                {(item.subtasks || []).map((subtask) => (
                                  <span key={`${item.id}-${subtask}`} className="inline-flex items-center rounded-full border border-slate-200 bg-slate-50 px-2 py-0.5 text-[11px] text-slate-600">
                                    {subtask}
                                  </span>
                                ))}
                                {!item.subtasks?.length && (
                                  <span className="text-[11px] text-slate-400">No subtasks detected</span>
                                )}
                              </div>
                            </div>
                          ))}
                        </div>

                        <div className="flex items-center justify-between gap-3 border-t border-slate-100 px-5 py-4 bg-white">
                          <div className="text-xs text-slate-500">AI considered sticky notes, text blocks, comments, connectors, and board layout before building this plan.</div>
                          <div className="flex items-center gap-2">
                            <button
                              type="button"
                              onClick={() => setWhiteboardTaskPreviewOpen(false)}
                              className="rounded-lg border border-slate-200 px-3 py-2 text-xs font-medium text-slate-600 hover:bg-slate-50"
                            >
                              Cancel
                            </button>
                            <button
                              type="button"
                              onClick={importWhiteboardPreviewToTasks}
                              className="inline-flex items-center gap-2 rounded-lg bg-violet-600 px-4 py-2 text-xs font-semibold text-white hover:bg-violet-700"
                            >
                              <CheckSquare size={13} />
                              Import to Tasks
                            </button>
                          </div>
                        </div>
                      </div>
                    </div>
                  )}
                </div>
              </div>
            </div>
          )}
          <div className={activeRightTab === 'whiteboard' ? 'opacity-0 pointer-events-none select-none' : ''}>
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
              onBlur={(e) => commitEditableTextForActiveDoc(e.currentTarget, setDocTitle)}
              dir="ltr"
              data-doc-id={activeDocId || ''}
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
              onBlur={(e) => commitEditableTextForActiveDoc(e.currentTarget, setDocSubtitle)}
              dir="ltr"
              data-doc-id={activeDocId || ''}
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
                  onBlur={(e) => commitEditableHtmlForActiveDoc(e.currentTarget, setDocBodyHtml)}
                  dir="ltr"
                  data-doc-id={activeDocId || ''}
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
              <div className="absolute inset-0 z-30 bg-white/85 backdrop-blur-[2px] flex items-start justify-center px-6 pt-24 md:pt-28">
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
        {shouldShowPromptBackdrop && activeRightTab !== 'calendar' && activeRightTab !== 'whiteboard' && (
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
        {activeRightTab !== 'calendar' && activeRightTab !== 'whiteboard' && (
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
          </div>

        {!isComposing && !shouldHideDictationOverlay && activeRightTab !== 'calendar' && activeRightTab !== 'whiteboard' && (
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

        {isPromptMinimized && activeRightTab !== 'calendar' && activeRightTab !== 'whiteboard' && !isScheduleSessionModalOpen && (
          <div
            className="pointer-events-none absolute left-6 top-20 z-[140]"
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
        {activeRightTab !== 'whiteboard' && (
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
        )}
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
        {activeRightTab !== 'calendar' && activeRightTab !== 'room' && activeRightTab !== 'orb' && (
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
                { key: 'whiteboard', label: 'Whiteboard' },
                { key: 'tasks', label: `Tasks (${tasks.filter((t) => !t.completed).length})` },
                { key: 'calendar', label: 'Schedule' },
                { key: 'room', label: 'Room' },
                { key: 'memory', label: 'Memory' },
                { key: 'orb', label: 'Orb' },
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
                              onClick={() => {
                                if (productMode === 'compose') {
                                  handleAISubmit(sug.label, {
                                    source: 'compose',
                                    forceDocBuild: true,
                                    composeFormat: 'Plain Text',
                                    tone: promptTone,
                                    lengthMode: promptLengthMode,
                                    lengthValue: promptLengthValue,
                                  });
                                  return;
                                }
                                handleAISubmit(sug.label);
                              }}
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

          {/* C. ACTIVE TAB: WHITEBOARD ASSISTANT */}
          {activeRightTab === 'whiteboard' && (
            <div className="flex-1 overflow-y-auto p-4 space-y-4 bg-[#fcfcff]">
              <div className="rounded-2xl border border-[#ece8ff] bg-white shadow-[0_18px_34px_-28px_rgba(109,40,217,0.45)] overflow-hidden">
                <div className="px-4 pt-4 pb-2 border-b border-gray-100">
                  <div className="text-[14px] font-semibold text-[#1f2537] inline-flex items-center gap-1.5">
                    <Sparkles size={13} className="text-violet-500" />
                    AI Assistant
                  </div>
                </div>
                <div className="px-2 pt-2">
                  <div className="grid grid-cols-3 gap-1 rounded-xl bg-[#f7f5ff] p-1">
                    {['ask', 'generate', 'insights'].map((tabKey) => (
                      <button
                        key={tabKey}
                        type="button"
                        onClick={() => {
                          setWhiteboardAssistantTab(tabKey);
                          showToast(`Whiteboard ${tabKey} mode active`);
                        }}
                        className={`h-8 rounded-lg text-[11px] font-semibold transition-colors ${whiteboardAssistantTab === tabKey ? 'bg-white text-violet-700 shadow-sm' : 'text-slate-500 hover:text-violet-600'}`}
                      >
                        {tabKey.charAt(0).toUpperCase() + tabKey.slice(1)}
                      </button>
                    ))}
                  </div>
                </div>
                <div className="px-4 py-3">
                  <div className="text-[12px] text-slate-600 mb-2">What would you like to do?</div>
                  <div className="flex flex-wrap gap-1.5">
                    {(whiteboardAssistantActions[whiteboardAssistantTab] || []).map((action) => (
                      <button
                        key={action.key}
                        type="button"
                        onClick={() => handleWhiteboardAssistantAction(action)}
                        className="rounded-full border border-violet-200 bg-violet-50 px-3 py-1.5 text-[11px] font-medium text-violet-700 hover:bg-violet-100 hover:border-violet-300 transition-colors"
                      >
                        {action.label}
                      </button>
                    ))}
                  </div>
                </div>
              </div>

              <div className="rounded-2xl border border-gray-200 bg-white p-4">
                <div className="flex items-center justify-between">
                  <div className="text-[12px] font-semibold text-[#1f2537]">Board insights</div>
                  <button
                    type="button"
                    onClick={() => {
                      setWhiteboardAssistantTab('insights');
                      setActiveRightTab('whiteboard');
                      showToast('Insights refreshed');
                    }}
                    className="text-[10px] font-semibold text-violet-600 hover:text-violet-700"
                  >
                    Refresh
                  </button>
                </div>
                <div className="mt-2.5 space-y-2 text-[11px]">
                  {[
                    { key: 'notes', label: '12 sticky notes', icon: FileText },
                    { key: 'links', label: '8 connections', icon: LinkIcon },
                    { key: 'collabs', label: '5 collaborators', icon: Users },
                    { key: 'edited', label: 'Last edited 2m ago', icon: Clock },
                  ].map((item) => {
                    const Icon = item.icon;
                    return (
                      <button
                        key={item.key}
                        type="button"
                        onClick={() => showToast(`${item.label} opened`)}
                        className="w-full rounded-lg border border-gray-100 bg-[#fafaff] px-2.5 py-2 text-left text-slate-600 hover:bg-violet-50 hover:border-violet-200 inline-flex items-center gap-2 transition-colors"
                      >
                        <Icon size={12} className="text-violet-500" />
                        <span>{item.label}</span>
                      </button>
                    );
                  })}
                </div>
              </div>

              <div className="rounded-2xl border border-gray-200 bg-white p-4">
                <div className="text-[12px] font-semibold text-[#1f2537]">Connected to</div>
                <div className="mt-2 space-y-1.5">
                  <button
                    type="button"
                    onClick={() => handleWhiteboardConnectionAction('orb-brief')}
                    className="w-full rounded-lg border border-gray-100 px-2.5 py-2 text-left text-[11px] text-slate-700 hover:bg-violet-50 hover:border-violet-200 inline-flex items-center gap-2"
                  >
                    <FileText size={12} className="text-violet-500" />
                    Q2 Launch Brief (Orb)
                  </button>
                  <button
                    type="button"
                    onClick={() => handleWhiteboardConnectionAction('tasks')}
                    className="w-full rounded-lg border border-gray-100 px-2.5 py-2 text-left text-[11px] text-slate-700 hover:bg-violet-50 hover:border-violet-200 inline-flex items-center gap-2"
                  >
                    <CheckSquare size={12} className="text-violet-500" />
                    Launch Tasks
                  </button>
                  <button
                    type="button"
                    onClick={() => handleWhiteboardConnectionAction('compose')}
                    className="w-full rounded-lg border border-gray-100 px-2.5 py-2 text-left text-[11px] text-slate-700 hover:bg-violet-50 hover:border-violet-200 inline-flex items-center gap-2"
                  >
                    <Sparkles size={12} className="text-violet-500" />
                    Go-to-Market Plan
                  </button>
                </div>
                <button
                  type="button"
                  onClick={() => showToast('Add connection menu opened')}
                  className="mt-2.5 inline-flex items-center gap-1.5 text-[11px] font-medium text-violet-600 hover:text-violet-700"
                >
                  <Plus size={12} />
                  Add connection
                </button>
              </div>

              <div className="rounded-2xl border border-gray-200 bg-white p-4">
                <div className="flex items-center justify-between">
                  <div className="text-[12px] font-semibold text-[#1f2537]">Participants</div>
                  <button
                    type="button"
                    onClick={() => {
                      setActiveRightTab('room');
                      setIsRoomInviteModalOpen(true);
                      showToast('Invite panel opened');
                    }}
                    className="text-[10px] font-semibold text-violet-600 hover:text-violet-700"
                  >
                    Invite
                  </button>
                </div>
                <div className="mt-2 flex items-center -space-x-2">
                  {meetingParticipants.slice(0, 4).map((participant) => (
                    <img
                      key={`whiteboard-participant-${participant.name}`}
                      src={participant.img}
                      alt={participant.name}
                      title={participant.name}
                      className="w-7 h-7 rounded-full border-2 border-white object-cover"
                    />
                  ))}
                  <button
                    type="button"
                    onClick={() => showToast('Participant list opened')}
                    className="ml-2 h-7 px-2 rounded-full border border-violet-200 bg-violet-50 text-[10px] font-semibold text-violet-700 hover:bg-violet-100"
                  >
                    +{meetingOverflowParticipants.length}
                  </button>
                </div>
              </div>
            </div>
          )}

          {/* D. ACTIVE TAB: TASKS WORKLIST */}
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

          {/* E. ACTIVE TAB: INTEGRATED CALENDAR & TIMELINE SCHEDULE */}
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
                      <div className="flex items-center gap-1.5 min-w-0 overflow-hidden">
                        <div className="relative" ref={quickAddSourceMenuRef}>
                          <button
                            type="button"
                            onClick={() => setIsQuickAddSourceMenuOpen((prev) => !prev)}
                            className="inline-flex h-8 items-center gap-1 rounded-lg border border-violet-200 bg-white px-2 text-[10px] font-medium text-violet-700 hover:border-violet-300 hover:bg-violet-50"
                            title="Add context source"
                          >
                            <Plus size={11} />
                            <ChevronDown size={11} />
                          </button>
                          {isQuickAddSourceMenuOpen && (
                            <div className="absolute left-0 top-full z-20 mt-1.5 w-44 rounded-lg border border-[#e5e7f1] bg-white p-1 shadow-[0_12px_28px_-18px_rgba(15,23,42,0.45)]">
                              {QUICK_ADD_SOURCE_OPTIONS.map((source) => (
                                <button
                                  key={source.id}
                                  type="button"
                                  onClick={() => handleQuickAddSourceAction(source.id)}
                                  className="w-full rounded-md px-2.5 py-1.5 text-left text-[11px] text-slate-700 hover:bg-violet-50 inline-flex items-center gap-2"
                                >
                                  <span className="text-slate-500">{getQuickAddSourceIcon(source.id)}</span>
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
                          className="h-8 min-w-0 flex-1 rounded-lg border border-slate-200 bg-[#fcfcff] px-2.5 text-[11px] text-slate-700 placeholder:text-[10px] placeholder:text-slate-400 focus:outline-none focus:border-violet-300"
                        />

                        <button
                          type="button"
                          onClick={convertMessyScheduleToPlan}
                          className="h-8 shrink-0 rounded-lg bg-violet-600 px-2.5 text-[10px] font-semibold text-white hover:bg-violet-700"
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
                        <div className="relative">
                          <select
                            value={scheduleForm.startDate}
                            onChange={(event) => setScheduleForm((prev) => ({ ...prev, startDate: event.target.value }))}
                            className="brand-select h-9 w-full rounded-lg border border-violet-100 bg-violet-50/30 px-2.5 pr-7 text-slate-700 focus:outline-none focus:border-violet-300"
                          >
                            {!scheduleDateOptions.some((option) => option.value === scheduleForm.startDate) && (
                              <option value={scheduleForm.startDate}>{new Date(`${scheduleForm.startDate}T00:00:00`).toLocaleDateString(undefined, { month: '2-digit', day: '2-digit', year: 'numeric' })}</option>
                            )}
                            {scheduleDateOptions.map((option) => (
                              <option key={option.value} value={option.value}>{option.label}</option>
                            ))}
                          </select>
                          <Calendar size={12} className="pointer-events-none absolute right-2 top-1/2 -translate-y-1/2 text-slate-500" />
                        </div>
                        <div className="relative">
                          <select
                            value={scheduleForm.startTime}
                            onChange={(event) => setScheduleForm((prev) => ({ ...prev, startTime: event.target.value }))}
                            className="brand-select h-9 w-full rounded-lg border border-violet-100 bg-violet-50/30 px-2.5 pr-7 text-slate-700 focus:outline-none focus:border-violet-300"
                          >
                            {scheduleTimeOptions.map((option) => (
                              <option key={`start-${option.value}`} value={option.value}>{option.label}</option>
                            ))}
                          </select>
                          <Clock size={12} className="pointer-events-none absolute right-2 top-1/2 -translate-y-1/2 text-slate-500" />
                        </div>
                        <span className="self-center text-slate-500 text-center">to</span>
                        <div className="relative">
                          <select
                            value={scheduleForm.endTime}
                            onChange={(event) => setScheduleForm((prev) => ({ ...prev, endTime: event.target.value }))}
                            className="brand-select h-9 w-full rounded-lg border border-violet-100 bg-violet-50/30 px-2.5 pr-7 text-slate-700 focus:outline-none focus:border-violet-300"
                          >
                            {scheduleTimeOptions.map((option) => (
                              <option key={`end-${option.value}`} value={option.value}>{option.label}</option>
                            ))}
                          </select>
                          <Clock size={12} className="pointer-events-none absolute right-2 top-1/2 -translate-y-1/2 text-slate-500" />
                        </div>
                        <select
                          value={scheduleForm.timezone}
                          onChange={(event) => setScheduleForm((prev) => ({ ...prev, timezone: event.target.value }))}
                          className="brand-select h-9 rounded-lg border border-violet-100 bg-violet-50/30 px-2.5 pr-7 text-slate-700 focus:outline-none focus:border-violet-300"
                        >
                          {SCHEDULE_TIMEZONE_OPTIONS.map((timezone) => (
                            <option key={timezone} value={timezone}>{timezone}</option>
                          ))}
                        </select>
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
                          <select
                            value={scheduleForm.repeat}
                            onChange={(event) => setScheduleForm((prev) => ({ ...prev, repeat: event.target.value }))}
                            className="brand-select h-10 w-full rounded-lg border border-violet-100 bg-violet-50/30 px-3 text-[12px] text-slate-700 focus:outline-none focus:border-violet-300"
                          >
                            {SCHEDULE_REPEAT_OPTIONS.map((option) => (
                              <option key={option} value={option}>{`Repeat - ${option}`}</option>
                            ))}
                          </select>
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
                  Server-managed key expected: set `GEMINI_API_KEY` or `VITE_GEMINI_DEMO_API_KEY` in Vercel project env.
                </div>
                <div className="rounded-lg border border-gray-200 bg-white px-3 py-2 text-xs text-gray-600 leading-relaxed">
                  Keep API keys out of client code. This app now sends prompts to `/api/gemini`, and only that server route reads `GEMINI_API_KEY` or `VITE_GEMINI_DEMO_API_KEY`. The checker validates both presence and provider usability.
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

          {activeRightTab === 'orb' && (
            <div className="flex-1 min-h-0 animate-fade-in flex flex-col bg-white">
              <div className="flex-1 overflow-y-auto thin-scrollbar">

                {/* Header */}
                <div className="flex items-center justify-between px-4 pt-4 pb-3">
                  <div className="flex items-center gap-2">
                    <span className="inline-flex h-6 w-6 items-center justify-center rounded-full bg-violet-600 text-white text-[11px] font-bold">O</span>
                    <span className="text-[22px] leading-none font-bold tracking-tight text-slate-900">Orb</span>
                  </div>
                  <div className="flex items-center gap-1">
                    <button type="button" className="p-1.5 rounded-md text-slate-400 hover:text-slate-600 hover:bg-slate-100"><Search size={14} /></button>
                    <button type="button" className="p-1.5 rounded-full text-violet-600 hover:text-violet-700 hover:bg-violet-50 border border-violet-200"><Plus size={14} /></button>
                    <button type="button" onClick={() => setRightSidebarOpen(false)} className="p-1.5 rounded-md text-slate-400 hover:text-slate-600 hover:bg-slate-100"><X size={14} /></button>
                  </div>
                </div>

                {/* Search */}
                <div className="px-4 pb-3">
                  <div className="relative">
                    <Search size={13} className="absolute left-3 top-2.5 text-gray-400" />
                    <input
                      type="text"
                      placeholder="Search Orb..."
                      className="w-full rounded-xl bg-gray-100 py-2 pl-8 pr-14 text-[13px] text-slate-700 placeholder:text-slate-400 focus:outline-none focus:ring-1 focus:ring-violet-300 border-0"
                    />
                    <span className="absolute right-3 top-[7px] text-[10px] font-semibold text-gray-400 border border-gray-300 rounded px-1.5 py-0.5 bg-white">⌘K</span>
                  </div>
                </div>

                {/* Tabs */}
                <div className="flex items-center gap-5 px-4 text-xs font-semibold border-b border-gray-100">
                  <button className="pb-2.5 border-b-2 border-violet-500 text-violet-600">Context</button>
                  <button className="pb-2.5 border-b-2 border-transparent text-slate-400 hover:text-slate-600">Recent</button>
                  <button className="pb-2.5 border-b-2 border-transparent text-slate-400 hover:text-slate-600">Favorites</button>
                </div>

                {/* Related to this document */}
                <div className="px-4 pt-4 pb-3">
                  <div className="flex items-center justify-between mb-1">
                    <div className="flex items-center gap-2">
                      <Sparkles size={12} className="text-violet-500" />
                      <span className="text-[13px] font-semibold text-slate-900">Related to this document</span>
                      <span className="text-[9px] font-semibold text-violet-600 bg-violet-50 border border-violet-100 rounded-full px-1.5 py-0.5">AI</span>
                    </div>
                    <button className="text-[11px] font-semibold text-violet-600 hover:text-violet-700">View all</button>
                  </div>
                  <p className="text-[10px] text-slate-400 mb-3">Based on content and workspace context</p>
                  <div className="space-y-2">
                    {[
                      { name: 'Competitive Analysis.pdf', ext: 'PDF', iconBg: 'bg-red-100', iconText: 'text-red-600', meta: 'Mentioned: pricing, positioning, bundling', ago: '2h ago' },
                      { name: 'Creator Pricing Model.xlsx', ext: 'XLS', iconBg: 'bg-green-100', iconText: 'text-green-700', meta: 'Related to: monetization strategy', ago: '4h ago' },
                      { name: 'Market Entry Strategy.docx', ext: 'DOC', iconBg: 'bg-blue-100', iconText: 'text-blue-600', meta: 'Related to: go-to-market, verticals', ago: '1d ago' },
                      { name: 'Strategy Call Recording.mp4', ext: '▶', iconBg: 'bg-violet-100', iconText: 'text-violet-600', meta: 'From: Strategy Sync · May 10', ago: '2d ago' },
                    ].map((asset) => (
                      <div key={asset.name} className="rounded-xl border border-gray-100 bg-gray-50 px-3 py-2.5 hover:bg-white hover:border-gray-200 transition-colors cursor-pointer">
                        <div className="flex items-start gap-2.5">
                          <span className={`inline-flex items-center justify-center w-7 h-7 rounded-lg ${asset.iconBg} ${asset.iconText} text-[9px] font-bold flex-shrink-0 mt-0.5`}>{asset.ext}</span>
                          <div className="min-w-0 flex-1">
                            <div className="flex items-start justify-between gap-2">
                              <div className="text-[12px] font-semibold text-slate-800 truncate">{asset.name}</div>
                              <div className="text-[10px] text-slate-400 whitespace-nowrap">{asset.ago}</div>
                            </div>
                            <div className="text-[10px] text-slate-500 mt-0.5">{asset.meta}</div>
                          </div>
                        </div>
                      </div>
                    ))}
                  </div>
                </div>

                <div className="mx-4 border-t border-gray-100" />

                {/* AI Suggestions */}
                <div className="px-4 pt-3 pb-3">
                  <div className="flex items-center justify-between mb-3">
                    <div className="flex items-center gap-2">
                      <Sparkles size={12} className="text-violet-500" />
                      <span className="text-[13px] font-semibold text-slate-900">AI Suggestions</span>
                      <span className="text-[9px] font-semibold text-violet-600 bg-violet-50 border border-violet-100 rounded-full px-1.5 py-0.5">New</span>
                    </div>
                    <button className="text-slate-400 hover:text-slate-600"><RefreshCcw size={12} /></button>
                  </div>
                  <div className="space-y-2">
                    {[
                      { icon: Sparkles, text: 'This document mentions "creator monetization". Found 8 related assets.' },
                      { icon: Sparkles, text: 'Extracted 6 potential tasks from related assets.' },
                      { icon: Sparkles, text: 'Investor deck v5.pdf is often referenced in this context.' },
                    ].map(({ icon: Icon, text }) => (
                      <div key={text} className="flex items-start gap-2.5 py-1">
                        <Icon size={11} className="text-violet-400 mt-0.5 flex-shrink-0" />
                        <span className="text-[11px] text-slate-600 leading-relaxed">{text}</span>
                      </div>
                    ))}
                  </div>
                  <button className="mt-2 text-[11px] font-semibold text-violet-600 hover:text-violet-700">Show more →</button>
                </div>

                <div className="mx-4 border-t border-gray-100" />

                {/* Quick Actions */}
                <div className="px-4 pt-3 pb-3">
                  <span className="text-[13px] font-semibold text-slate-900 block mb-2.5">Quick Actions</span>
                  <div className="grid grid-cols-2 gap-2">
                    {[
                      { label: 'Upload file', Icon: Upload },
                      { label: 'Link from...', Icon: LinkIcon },
                      { label: 'Record meeting', Icon: Mic },
                      { label: 'Create folder', Icon: File },
                    ].map(({ label, Icon }) => (
                      <button key={label} className="rounded-xl border border-gray-100 bg-gray-50 hover:bg-white hover:border-gray-200 px-2.5 py-2 text-[11px] font-semibold text-slate-700 inline-flex items-center gap-1.5 transition-colors">
                        <Icon size={12} className="text-violet-500" />
                        {label}
                      </button>
                    ))}
                  </div>
                </div>

                <div className="mx-4 border-t border-gray-100" />

                {/* Orb Storage */}
                <div className="px-4 pt-3 pb-5">
                  <div className="flex items-center justify-between text-[11px] mb-2">
                    <span className="font-semibold text-slate-700">Orb Storage</span>
                    <span className="text-slate-400">256 GB of 1 TB used</span>
                  </div>
                  <div className="h-2 rounded-full bg-gray-100 overflow-hidden">
                    <div className="h-full w-[25%] rounded-full bg-violet-500" />
                  </div>
                  <div className="mt-1.5 text-right text-[11px] font-semibold text-slate-500">25%</div>
                </div>

              </div>
            </div>
          )}

        </div>
      </div>

      {/* 4. Far Right Mini Sidebar (Icons only / Navigation controller) */}
      <div className="w-[74px] border-l border-gray-100 bg-[#FAFAFC] flex flex-col items-center py-4 gap-6 shrink-0 select-none overflow-y-auto overflow-x-visible thin-scrollbar">
        <div className="relative">
          <div
            onClick={() => setWorkspaceLauncherOpen((prev) => !prev)}
            className={`flex flex-col items-center gap-1 cursor-pointer transition-colors ${workspaceLauncherOpen ? 'text-violet-600' : 'text-gray-400 hover:text-violet-600'}`}
          >
            <Plus
              className="transition-all"
              size={workspaceLauncherIconSize === 'sm' ? 16 : workspaceLauncherIconSize === 'lg' ? 24 : 20}
              strokeWidth={workspaceLauncherIconStyle === 'solid' ? 2.5 : workspaceLauncherIconStyle === 'soft' ? 1.7 : 2}
              style={{ color: workspaceLauncherIconColor, opacity: workspaceLauncherIconStyle === 'soft' ? 0.78 : 1 }}
            />
            <span className="text-[9px] font-semibold">New</span>
          </div>

          {workspaceLauncherOpen && (
            <div className="absolute top-[calc(100%+8px)] left-1/2 -translate-x-[70%] z-[700] w-[254px] rounded-xl border border-gray-200 bg-white shadow-[0_24px_50px_-30px_rgba(15,23,42,0.65)] p-2.5">
              <div className="text-[11px] font-semibold text-gray-700 px-1 pb-1.5">Choose Workspace</div>
              <div className="grid grid-cols-2 gap-1.5">
                {[
                  { key: 'whiteboard', label: 'Whiteboard', icon: LayoutGrid },
                  { key: 'compose', label: 'Compose', icon: FileText },
                  { key: 'deck', label: 'Deck', icon: Presentation },
                  { key: 'sheets', label: 'Sheets', icon: ListOrdered },
                  { key: 'dms', label: 'DMs', icon: MessageSquare },
                  { key: 'dashboard', label: 'Dashboard', icon: Home },
                ].map(({ key, label, icon: Icon }) => (
                  <button
                    key={key}
                    type="button"
                    onClick={() => launchWorkspaceFromMiniPlus(key)}
                    className="rounded-lg border border-gray-200 bg-white px-2 py-1.5 text-[11px] text-gray-700 hover:bg-violet-50 hover:border-violet-200 inline-flex items-center gap-1.5"
                  >
                    <Icon size={12} />
                    {label}
                  </button>
                ))}
              </div>

              <div className="mt-2 border-t border-gray-100 pt-2">
                <div className="text-[10px] uppercase tracking-wide text-gray-400 px-1">Icon style</div>
                <div className="mt-1 flex items-center gap-1">
                  {['solid', 'soft', 'outline'].map((styleKey) => (
                    <button
                      key={styleKey}
                      type="button"
                      onClick={() => setWorkspaceLauncherIconStyle(styleKey)}
                      className={`px-2 py-1 rounded text-[10px] border ${workspaceLauncherIconStyle === styleKey ? 'border-violet-300 bg-violet-50 text-violet-700' : 'border-gray-200 text-gray-500 hover:bg-gray-50'}`}
                    >
                      {styleKey}
                    </button>
                  ))}
                </div>

                <div className="mt-2 text-[10px] uppercase tracking-wide text-gray-400 px-1">Icon size</div>
                <div className="mt-1 flex items-center gap-1">
                  {['sm', 'md', 'lg'].map((sizeKey) => (
                    <button
                      key={sizeKey}
                      type="button"
                      onClick={() => setWorkspaceLauncherIconSize(sizeKey)}
                      className={`px-2 py-1 rounded text-[10px] border ${workspaceLauncherIconSize === sizeKey ? 'border-violet-300 bg-violet-50 text-violet-700' : 'border-gray-200 text-gray-500 hover:bg-gray-50'}`}
                    >
                      {sizeKey.toUpperCase()}
                    </button>
                  ))}
                </div>

                <div className="mt-2 text-[10px] uppercase tracking-wide text-gray-400 px-1">Icon color</div>
                <div className="mt-1 px-1">
                  <input
                    type="color"
                    value={workspaceLauncherIconColor}
                    onChange={(event) => setWorkspaceLauncherIconColor(event.target.value)}
                    className="h-8 w-full rounded-md border border-gray-200 bg-white cursor-pointer"
                  />
                </div>
              </div>
            </div>
          )}
        </div>
        
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
          onClick={() => handleMiniSidebarClick('dm')}
          className={`flex flex-col items-center gap-1 cursor-pointer transition-colors ${
            productMode === 'dm' ? 'text-violet-600' : 'text-gray-400 hover:text-violet-600'
          }`}
        >
          <div className={`p-2 rounded-xl transition-all ${productMode === 'dm' ? 'bg-violet-100' : ''}`}>
            <MessageSquare size={20} />
          </div>
          <span className="text-[9px] font-semibold">DMs</span>
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
          onClick={() => handleMiniSidebarClick('whiteboard')}
          className={`flex flex-col items-center gap-1 cursor-pointer transition-colors ${
            activeRightTab === 'whiteboard' && rightSidebarOpen ? 'text-violet-600' : 'text-gray-400 hover:text-violet-600'
          }`}
        >
          <div className={`p-2 rounded-xl transition-all ${activeRightTab === 'whiteboard' && rightSidebarOpen ? 'bg-violet-100' : ''}`}>
            <LayoutGrid size={20} />
          </div>
          <span className="text-[9px] font-semibold">Whiteboard</span>
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
          onClick={() => handleMiniSidebarClick('orb')}
          className={`flex flex-col items-center gap-1 cursor-pointer transition-colors ${
            activeRightTab === 'orb' && rightSidebarOpen ? 'text-violet-600' : 'text-gray-400 hover:text-violet-600'
          }`}
        >
          <div className={`p-2 rounded-xl transition-all ${activeRightTab === 'orb' && rightSidebarOpen ? 'bg-violet-100' : ''}`}><Cloud size={20} /></div>
          <span className="text-[9px] font-semibold">Orb</span>
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
        <div
          ref={roomStageRef}
          className={`fixed overflow-hidden border border-white/40 shadow-[0_24px_70px_rgba(15,23,42,0.35)] bg-slate-900 z-[320] ${isRoomFullscreen ? 'inset-0 rounded-none' : 'rounded-3xl'}`}
          style={isRoomFullscreen ? undefined : {
            left: `${roomStageFrame.x}px`,
            top: `${roomStageFrame.y}px`,
            width: `${roomStageFrame.width}px`,
            height: `${roomStageFrame.height}px`,
          }}
        >
          <div className="h-12 px-4 bg-black/45 backdrop-blur-md flex items-center justify-between text-white">
            <div className={`flex items-center gap-3 min-w-0 ${isRoomFullscreen ? '' : 'cursor-move'}`} onPointerDown={beginRoomStageDrag}>
              <span className="text-sm font-semibold truncate">{scheduleForm.title || 'Project MOAT Sync'}</span>
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
            <div className="flex items-center gap-2" data-meeting-share-root>
              <div className="relative">
                <button
                  onClick={() => setMeetingShareMenuAnchor((prev) => (prev === 'header' ? null : 'header'))}
                  className="px-2.5 py-1.5 rounded-lg text-xs bg-white/15 hover:bg-white/25 transition inline-flex items-center gap-1.5"
                  title="Share file"
                >
                  <Paperclip size={13} /> Share file
                </button>
                {meetingShareMenuAnchor === 'header' && (
                  <div className="absolute right-0 top-full mt-1.5 z-20 w-44 rounded-xl border border-slate-200 bg-[#0b1225] p-1.5 shadow-[0_18px_40px_-18px_rgba(15,23,42,0.7)]">
                    <button type="button" onClick={() => handleMeetingShareOption('document')} className="w-full rounded-lg px-2.5 py-1.5 text-left text-xs text-slate-100 hover:bg-white/10 inline-flex items-center gap-2"><FileText size={12} />Share document</button>
                    <button type="button" onClick={() => handleMeetingShareOption('image')} className="w-full rounded-lg px-2.5 py-1.5 text-left text-xs text-slate-100 hover:bg-white/10 inline-flex items-center gap-2"><ImageIcon size={12} />Share image</button>
                    <button type="button" onClick={() => handleMeetingShareOption('audio')} className="w-full rounded-lg px-2.5 py-1.5 text-left text-xs text-slate-100 hover:bg-white/10 inline-flex items-center gap-2"><Mic size={12} />Share audio</button>
                    <button type="button" onClick={() => handleMeetingShareOption('link')} className="w-full rounded-lg px-2.5 py-1.5 text-left text-xs text-slate-100 hover:bg-white/10 inline-flex items-center gap-2"><LinkIcon size={12} />Share link</button>
                  </div>
                )}
              </div>
              <button onClick={handleShareMeeting} className="px-2.5 py-1.5 rounded-lg text-xs bg-white/15 hover:bg-white/25 transition">Share</button>
              <button onClick={toggleRoomStageFullscreen} className="p-1.5 rounded-lg bg-white/15 hover:bg-white/25 transition" title={isRoomFullscreen ? 'Exit fullscreen' : 'Open fullscreen'}>
                {isRoomFullscreen ? <Minimize2 size={15} /> : <Maximize2 size={15} />}
              </button>
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
                  <div className="absolute inset-0 flex flex-col items-center justify-center px-6 pb-40 text-center">
                    <div className="w-48 h-48 rounded-full border border-dashed border-white/25 flex flex-col items-center justify-center px-4">
                      <div className="w-10 h-10 rounded-lg border border-violet-300/60 bg-violet-500/20 flex items-center justify-center">
                        <MonitorPlay size={18} className="text-violet-200" />
                      </div>
                      <div className="mt-2.5 text-[16px] font-semibold leading-tight">No one is sharing yet</div>
                      <p className="mt-1 text-[11px] text-slate-300 max-w-[185px]">Share your screen, a window, or share a file to get started.</p>
                      <div className="mt-3 flex items-center gap-1.5" data-meeting-share-root>
                        <button
                          onClick={toggleScreenShare}
                          className="px-3 py-1.5 rounded-xl bg-violet-600 hover:bg-violet-500 text-white text-xs font-semibold inline-flex items-center gap-1.5 whitespace-nowrap"
                        >
                          <MonitorPlay size={12} /> Share screen
                        </button>
                        <div className="relative">
                          <button
                            onClick={() => setMeetingShareMenuAnchor((prev) => (prev === 'center' ? null : 'center'))}
                            className="px-3 py-1.5 rounded-xl border border-white/20 bg-white/10 hover:bg-white/15 text-white text-xs font-semibold inline-flex items-center gap-1.5 whitespace-nowrap"
                          >
                            <Upload size={12} /> Share a file
                          </button>
                          {meetingShareMenuAnchor === 'center' && (
                            <div className="absolute left-1/2 -translate-x-1/2 top-full mt-1.5 z-20 w-44 rounded-xl border border-slate-200 bg-[#0b1225] p-1.5 shadow-[0_18px_40px_-18px_rgba(15,23,42,0.7)]">
                              <button type="button" onClick={() => handleMeetingShareOption('document')} className="w-full rounded-lg px-2.5 py-1.5 text-left text-xs text-slate-100 hover:bg-white/10 inline-flex items-center gap-2"><FileText size={12} />Share document</button>
                              <button type="button" onClick={() => handleMeetingShareOption('image')} className="w-full rounded-lg px-2.5 py-1.5 text-left text-xs text-slate-100 hover:bg-white/10 inline-flex items-center gap-2"><ImageIcon size={12} />Share image</button>
                              <button type="button" onClick={() => handleMeetingShareOption('audio')} className="w-full rounded-lg px-2.5 py-1.5 text-left text-xs text-slate-100 hover:bg-white/10 inline-flex items-center gap-2"><Mic size={12} />Share audio</button>
                              <button type="button" onClick={() => handleMeetingShareOption('link')} className="w-full rounded-lg px-2.5 py-1.5 text-left text-xs text-slate-100 hover:bg-white/10 inline-flex items-center gap-2"><LinkIcon size={12} />Share link</button>
                            </div>
                          )}
                        </div>
                      </div>
                    </div>
                  </div>
                </div>
              )}
              <div className="absolute bottom-[76px] left-4 right-4">
                <div className="flex items-stretch gap-2 overflow-x-auto thin-scrollbar pb-1">
                  <div className="min-w-[86px] rounded-xl border border-white/20 bg-black/45 overflow-hidden">
                    <div className="h-14 bg-slate-900">
                      <RoomStageFeed stream={localStream} placeholder="You" />
                    </div>
                    <div className="px-2 py-1 text-[11px] text-slate-100">You</div>
                  </div>
                  {meetingParticipants.map((participant) => (
                    <div key={`stage-tile-${participant.name}`} className="min-w-[86px] rounded-xl border border-white/20 bg-black/45 overflow-hidden">
                      <img src={participant.img} alt={participant.name} className="w-full h-14 object-cover" />
                      <div className="px-2 py-1 text-[11px] text-slate-100 truncate">{participant.name}</div>
                    </div>
                  ))}
                  <div className="relative" data-meeting-overflow-root>
                    <button
                      type="button"
                      onClick={() => setIsMeetingOverflowParticipantsOpen((prev) => !prev)}
                      className="min-w-[86px] h-full rounded-xl border border-white/20 bg-black/45 flex flex-col items-center justify-center px-2 py-2 text-slate-100 hover:border-violet-300"
                    >
                      <span className="text-2xl font-semibold">+{meetingOverflowParticipants.length}</span>
                      <span className="text-[11px]">Others</span>
                    </button>
                    {isMeetingOverflowParticipantsOpen && (
                      <div className="absolute bottom-full left-1/2 -translate-x-1/2 mb-2 w-48 rounded-xl border border-slate-200 bg-[#0b1225] p-2 shadow-[0_18px_40px_-18px_rgba(15,23,42,0.7)]">
                        {meetingOverflowParticipants.map((participant) => (
                          <div key={`overflow-card-${participant.name}`} className="flex items-center gap-2 rounded-lg px-2 py-1.5 hover:bg-white/10">
                            <img src={participant.img} alt={participant.name} className="w-6 h-6 rounded-full object-cover border border-white/20" />
                            <span className="text-xs text-slate-100">{participant.name}</span>
                          </div>
                        ))}
                      </div>
                    )}
                  </div>
                </div>
              </div>
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
                  onClick={() => setMeetingShareMenuAnchor((prev) => (prev === 'toolbar' ? null : 'toolbar'))}
                  className="p-2 rounded-xl transition bg-white text-slate-800"
                  title="Share files"
                >
                  <File size={16} />
                </button>
                {meetingShareMenuAnchor === 'toolbar' && (
                  <div data-meeting-share-root className="absolute bottom-[54px] right-[82px] z-20 w-44 rounded-xl border border-slate-200 bg-[#0b1225] p-1.5 shadow-[0_18px_40px_-18px_rgba(15,23,42,0.7)]">
                    <button type="button" onClick={() => handleMeetingShareOption('document')} className="w-full rounded-lg px-2.5 py-1.5 text-left text-xs text-slate-100 hover:bg-white/10 inline-flex items-center gap-2"><FileText size={12} />Share document</button>
                    <button type="button" onClick={() => handleMeetingShareOption('image')} className="w-full rounded-lg px-2.5 py-1.5 text-left text-xs text-slate-100 hover:bg-white/10 inline-flex items-center gap-2"><ImageIcon size={12} />Share image</button>
                    <button type="button" onClick={() => handleMeetingShareOption('audio')} className="w-full rounded-lg px-2.5 py-1.5 text-left text-xs text-slate-100 hover:bg-white/10 inline-flex items-center gap-2"><Mic size={12} />Share audio</button>
                    <button type="button" onClick={() => handleMeetingShareOption('link')} className="w-full rounded-lg px-2.5 py-1.5 text-left text-xs text-slate-100 hover:bg-white/10 inline-flex items-center gap-2"><LinkIcon size={12} />Share link</button>
                  </div>
                )}
                {isMeetingLinkInputOpen && (
                  <div data-meeting-link-input-root className="absolute bottom-[54px] right-[20px] z-20 w-72 rounded-xl border border-slate-200 bg-[#0b1225] p-2 shadow-[0_18px_40px_-18px_rgba(15,23,42,0.7)]">
                    <div className="text-[11px] font-semibold text-slate-100 mb-1">Add link</div>
                    <input
                      value={meetingLinkDraft}
                      onChange={(event) => setMeetingLinkDraft(event.target.value)}
                      placeholder="https://"
                      className="w-full rounded-lg border border-slate-500/60 bg-[#111a31] px-2.5 py-1.5 text-xs text-slate-100 placeholder:text-slate-400 focus:outline-none focus:border-violet-400"
                    />
                    <div className="mt-2 flex justify-end gap-1.5">
                      <button
                        type="button"
                        onClick={() => setIsMeetingLinkInputOpen(false)}
                        className="rounded-md px-2.5 py-1 text-xs text-slate-200 hover:bg-white/10"
                      >
                        Cancel
                      </button>
                      <button
                        type="button"
                        onClick={saveMeetingSharedLink}
                        className="rounded-md bg-violet-600 px-2.5 py-1 text-xs font-semibold text-white hover:bg-violet-500"
                      >
                        Add link
                      </button>
                    </div>
                  </div>
                )}
                <button onClick={leaveRoom} className="px-3 py-2 rounded-xl bg-red-500 hover:bg-red-600 text-white text-xs font-semibold" title="Leave meeting">
                  Leave
                </button>
              </div>
            </div>

            <div className="w-[320px] bg-white border-l border-slate-200 p-3 space-y-3 text-slate-800 overflow-y-auto thin-scrollbar">
              <div className="rounded-2xl border border-slate-200 bg-white px-3 py-2.5">
                <div className="flex items-center justify-between gap-2">
                  <div className="text-[13px] font-semibold truncate">{scheduleForm.title || 'Project MOAT Sync'}</div>
                  <span className="text-[10px] px-1.5 py-0.5 rounded-full bg-violet-100 text-violet-700 font-semibold">LIVE</span>
                </div>
                <div className="text-[10px] text-slate-500 mt-1">{meetingDurationLabel}</div>
              </div>

              <div className="rounded-2xl border border-slate-200 bg-white px-3 py-2.5">
                <div className="flex items-center justify-between">
                  <div className="text-[12px] font-semibold">Participants ({meetingParticipants.length + meetingOverflowParticipants.length + 1})</div>
                  <button type="button" className="text-[10px] text-violet-600 font-semibold">Mute all</button>
                </div>
                <div className="mt-2 space-y-2">
                  <div className="flex items-center justify-between text-[11px]">
                    <div className="inline-flex items-center gap-2">
                      <img src="https://images.unsplash.com/photo-1599566150163-29194dcaad36?auto=format&fit=crop&w=120&q=80" alt="Joshua" className="w-5 h-5 rounded-full object-cover border border-slate-200" />
                      <span>Joshua (You)</span>
                    </div>
                    {!isRoomMicOn && <MicOff size={12} className="text-rose-500" />}
                  </div>
                  {meetingParticipants.slice(0, 4).map((participant) => (
                    <div key={`side-${participant.name}`} className="flex items-center justify-between text-[11px] text-slate-700">
                      <div className="inline-flex items-center gap-2">
                        <img src={participant.img} alt={participant.name} className="w-5 h-5 rounded-full object-cover border border-slate-200" />
                        <span>{participant.name}</span>
                      </div>
                      <span className="text-slate-400">Listening</span>
                    </div>
                  ))}
                  {meetingOverflowParticipants.map((participant) => (
                    <div key={`side-overflow-${participant.name}`} className="flex items-center justify-between text-[11px] text-slate-700">
                      <div className="inline-flex items-center gap-2">
                        <img src={participant.img} alt={participant.name} className="w-5 h-5 rounded-full object-cover border border-slate-200" />
                        <span>{participant.name}</span>
                      </div>
                      <span className="text-slate-400">Muted</span>
                    </div>
                  ))}
                </div>
              </div>

              <div className="rounded-2xl border border-violet-100 bg-violet-50/50 px-3 py-2.5">
                <div className="text-[12px] font-semibold inline-flex items-center gap-1.5"><Sparkles size={12} className="text-violet-500" />AI Assistant <span className="text-[10px] text-violet-600">BETA</span></div>
                <div className="mt-2 text-[11px] text-slate-600">I’m listening and will capture key points, decisions, and action items.</div>
                <button type="button" className="mt-2 w-full rounded-lg border border-violet-200 bg-white px-2.5 py-1.5 text-[11px] font-semibold text-violet-700 hover:bg-violet-50">View live summary</button>
              </div>

              <div className="rounded-2xl border border-slate-200 bg-white px-3 py-2.5">
                <div className="grid grid-cols-2 gap-1 rounded-lg border border-slate-200 bg-slate-50 p-1 text-[11px] font-medium">
                  <button type="button" onClick={() => setMeetingConversationTab('chat')} className={`rounded-md py-1 ${meetingConversationTab === 'chat' ? 'bg-white text-slate-700 shadow-sm' : 'text-slate-500'}`}>Chat</button>
                  <button type="button" onClick={() => setMeetingConversationTab('transcript')} className={`rounded-md py-1 ${meetingConversationTab === 'transcript' ? 'bg-white text-slate-700 shadow-sm' : 'text-slate-500'}`}>Transcript</button>
                </div>
                <div className="mt-2 space-y-2 max-h-44 overflow-y-auto thin-scrollbar pr-1">
                  {meetingConversationTab === 'chat' ? (
                    chatMessages.length ? chatMessages.slice(-6).map((message, index) => (
                      <div key={`meeting-chat-${message.id}`} className="text-[11px] rounded-lg border border-slate-200 bg-white px-2.5 py-1.5">
                        <div className="font-semibold text-slate-700">{message.sender === 'user' ? 'Joshua' : 'Priya'} <span className="ml-1 text-[10px] text-slate-400 font-normal">10:{30 + index} AM</span></div>
                        <div className="text-slate-500 line-clamp-2 mt-0.5">{message.text}</div>
                      </div>
                    )) : (
                      <div className="rounded-lg border border-dashed border-slate-300 bg-slate-50 px-3 py-2 text-[11px] text-slate-500 text-center">No chat yet. Messages from the room will appear here.</div>
                    )
                  ) : (
                    chatMessages.length > 1 ? chatMessages.slice(-6).map((message, index) => (
                      <div key={`meeting-transcript-${message.id}`} className="text-[11px] rounded-lg border border-slate-200 bg-white px-2.5 py-1.5">
                        <div className="text-[10px] text-slate-400">10:{35 + index} AM</div>
                        <div className="font-semibold text-slate-700 mt-0.5">{message.sender === 'user' ? 'Joshua' : 'Priya'}</div>
                        <div className="text-slate-500 line-clamp-2 mt-0.5">{message.text}</div>
                      </div>
                    )) : (
                      <div className="rounded-lg border border-dashed border-slate-300 bg-slate-50 px-3 py-2 text-[11px] text-slate-500 text-center">No transcript yet. Live speech will appear here once participants start talking.</div>
                    )
                  )}
                </div>
              </div>
            </div>
          </div>
          {!isRoomFullscreen && (
            <button
              type="button"
              onPointerDown={beginRoomStageResize}
              className="absolute bottom-2 right-2 h-4 w-4 rounded-sm border border-white/30 bg-white/20 hover:bg-white/30 cursor-se-resize"
              title="Resize meeting panel"
            />
          )}
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
