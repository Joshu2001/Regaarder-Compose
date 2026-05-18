import React, { useEffect, useRef, useState } from 'react';
import { 
  Menu, Search, Plus, Sparkles, Bell, 
  ChevronLeft, Cloud, Users, Home, Inbox, Star, 
  FileText, Trash, Settings, MoreHorizontal,
  Mic, ArrowUp, MessageSquare, CheckSquare, Calendar, 
  File, User, PenTool, AlignLeft, AlignCenter, AlignRight, 
  List, Bold, Italic, Underline, Type, X, ChevronDown,
  LayoutGrid, BookOpen, Scissors, Expand, Check,
  AlertTriangle, MonitorPlay, MessageCircle, FileQuestion,
  Send, ListTodo, ShieldAlert, ArrowRight, Loader2, Move
} from 'lucide-react';

export default function App() {
  const defaultTitle = 'Product Launch Plan';
  const defaultSubtitle = 'A strategic plan to successfully launch Regaarder Compose and drive adoption, engagement, and growth.';
  const defaultInitiatives = [
    { id: 1, name: 'Beta Launch', owner: 'Alex R.', timeline: 'May 15 - May 30', status: 'In Progress' },
    { id: 2, name: 'Creator Outreach', owner: 'Maya K.', timeline: 'May 20 - Jun 10', status: 'Planned' },
    { id: 3, name: 'Product Hunt Launch', owner: 'Jordan T.', timeline: 'Jun 15', status: 'Planned' },
    { id: 4, name: 'Paid Campaigns', owner: 'Sam K.', timeline: 'Jun 20 - Jul 10', status: 'Planned' },
  ];

  // Sidebar states
  const [leftSidebarOpen, setLeftSidebarOpen] = useState(true);
  const [leftSidebarWidth, setLeftSidebarWidth] = useState(256);
  const [rightSidebarOpen, setRightSidebarOpen] = useState(true);
  const [rightSidebarWidth, setRightSidebarWidth] = useState(340);
  const [activeRightTab, setActiveRightTab] = useState('chat'); // 'chat' | 'assistant' | 'tasks' | 'calendar'
  const [dragTarget, setDragTarget] = useState(null);
  const [promptOffset, setPromptOffset] = useState({ x: 0, y: -14 });
  const [isPromptExpanded, setIsPromptExpanded] = useState(false);
  const [promptWidth, setPromptWidth] = useState(620);
  
  // Interactive inputs
  const [chatInput, setChatInput] = useState('');
  const [floatingPrompt, setFloatingPrompt] = useState('');
  const [newTaskInput, setNewTaskInput] = useState('');
  const [scheduleInput, setScheduleInput] = useState('');
  const [scheduleOutput, setScheduleOutput] = useState([]);
  
  // AI State machine
  const [isComposing, setIsComposing] = useState(false);
  const [isVoiceActive, setIsVoiceActive] = useState(false);
  const [toastMessage, setToastMessage] = useState('');

  // Auto-scroll ref for chat
  const chatEndRef = useRef(null);
  const documentCardRef = useRef(null);
  const blankBodyRef = useRef(null);
  const formattingMenuRef = useRef(null);
  const dragStateRef = useRef({
    startX: 0,
    startY: 0,
    leftWidth: 256,
    rightWidth: 340,
    promptX: 0,
    promptY: -14,
  });

  // Stateful document content
  const [docTitle, setDocTitle] = useState(defaultTitle);
  const [docSubtitle, setDocSubtitle] = useState(defaultSubtitle);
  const [initiatives, setInitiatives] = useState(defaultInitiatives);
  const [isBlankDocument, setIsBlankDocument] = useState(false);
  const [documents, setDocuments] = useState([
    {
      id: Date.now(),
      title: defaultTitle,
      subtitle: defaultSubtitle,
      initiatives: defaultInitiatives,
      appendedSections: [],
      isBlank: false,
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

  const [editorHeading, setEditorHeading] = useState('Heading 1');
  const [editorFont, setEditorFont] = useState('Inter');
  const [editorSize, setEditorSize] = useState(32);
  const [isBoldActive, setIsBoldActive] = useState(false);
  const [isItalicActive, setIsItalicActive] = useState(false);
  const [isUnderlineActive, setIsUnderlineActive] = useState(false);
  const [isStrikeActive, setIsStrikeActive] = useState(false);
  const [alignMode, setAlignMode] = useState('left');
  const [isListActive, setIsListActive] = useState(false);

  const headingOptions = ['Heading 1', 'Heading 2', 'Heading 3', 'Paragraph'];
  const fontOptions = ['Inter', 'Georgia', 'Verdana', 'Courier New', 'Times New Roman', 'Trebuchet MS'];
  const sizeOptions = [12, 14, 16, 18, 20, 24, 28, 32, 36, 40, 48, 56, 64];

  // Dynamically appended sections from the AI Chat
  const [appendedSections, setAppendedSections] = useState([]);

  useEffect(() => {
    if (!activeDocId && documents.length) {
      setActiveDocId(documents[0].id);
    }
  }, [documents, activeDocId]);

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
    const handleClickOutside = (event) => {
      if (!formattingMenuRef.current) {
        return;
      }
      if (!formattingMenuRef.current.contains(event.target)) {
        setOpenDropdown(null);
      }
    };

    window.addEventListener('pointerdown', handleClickOutside);
    return () => window.removeEventListener('pointerdown', handleClickOutside);
  }, []);

  // Integrated Tasks checklist state
  const [tasks, setTasks] = useState([
    { id: 1, text: 'Confirm final beta signup workflow with design team', completed: false },
    { id: 2, text: 'Draft launch announcements for Twitter and LinkedIn', completed: true },
    { id: 3, text: 'Coordinate with marketing for Creator pricing model tier', completed: false },
    { id: 4, text: 'Check analytics dashboard integration is live', completed: false },
  ]);

  // Conversational state with pre-loaded AI response cards
  const [chatMessages, setChatMessages] = useState([
    { 
      id: 1, 
      sender: 'ai', 
      text: "Good morning Alex! I've fully parsed the **Product Launch Plan**. I'm here as your active workspace companion.",
      type: 'welcome'
    },
    {
      id: 2,
      sender: 'ai',
      text: "I analyzed the document and noticed you might want to structure your execution. Would you like me to instantly compose any of these into the document?",
      type: 'suggestions',
      suggestions: [
        { label: '📅 Create a launch timeline', action: 'timeline' },
        { label: '📋 Extract key task checklist', action: 'tasks' },
        { label: '🛡️ Generate marketing risk items', action: 'risks' }
      ]
    }
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
    setToastMessage(msg);
    setTimeout(() => setToastMessage(''), 3000);
  };

  // Function to process AI prompt and generate structured output
  const handleAISubmit = (promptText) => {
    if (!promptText.trim()) return;

    setIsComposing(true);
    
    // Add user message to chat feed
    const userMsgId = Date.now();
    setChatMessages(prev => [...prev, {
      id: userMsgId,
      sender: 'user',
      text: promptText
    }]);

    // Scroll to bottom
    setTimeout(() => chatEndRef.current?.scrollIntoView({ behavior: 'smooth' }), 50);

    // Simulate natural AI computation latency
    setTimeout(() => {
      setIsComposing(false);
      const lowerPrompt = promptText.toLowerCase();
      let aiResponseText = "";
      let docAction = null;

      if (lowerPrompt.includes('timeline') || lowerPrompt.includes('date') || lowerPrompt.includes('schedule')) {
        aiResponseText = "Composed a high-level visual launch timeline and linked it directly to your Key Initiatives.";
        docAction = {
          title: "🗓️ 4. Timeline Breakdown",
          type: 'timeline',
          content: [
            { phase: "Phase 1: Internal QA & Warmups", dates: "May 1 - May 14", detail: "Internal regression tests, QA checklists, design audits" },
            { phase: "Phase 2: Closed Beta Sandbox", dates: "May 15 - May 30", detail: "Invite-only rollout to 500 hand-picked early adopters" },
            { phase: "Phase 3: Public Expansion", dates: "June 1 - June 14", detail: "Press kits distributed, major public marketing launch" },
          ]
        };
      } else if (lowerPrompt.includes('task') || lowerPrompt.includes('checklist') || lowerPrompt.includes('extract')) {
        aiResponseText = "Extracted 3 critical new action items from your plan and synchronized them with your Workspace Tasks.";
        // Update app task state
        setTasks(prev => [
          ...prev,
          { id: Date.now() + 1, text: 'Refine Beta Launch user feedback channels', completed: false },
          { id: Date.now() + 2, text: 'Prepare Product Hunt media graphic kit', completed: false },
        ]);
        docAction = {
          title: "📋 5. Core Operational Checklists",
          type: 'tasks',
          content: [
            "Setup feedback surveys and analytics metrics",
            "Send confirmation emails to internal stakeholders",
            "Coordinate with community leads for creator outreach channels"
          ]
        };
      } else if (lowerPrompt.includes('risk') || lowerPrompt.includes('danger') || lowerPrompt.includes('threat')) {
        aiResponseText = "Generated a proactive Risk Mitigation Matrix outlining resource and audience bottlenecks.";
        docAction = {
          title: "🛡️ 6. Risk Mitigation Matrix",
          type: 'risks',
          content: [
            { threat: "Severe Server Latency under peak launch loads", impact: "High", fix: "Deploy multi-zone automatic scaling protocols on Cloud clusters prior to Product Hunt day." },
            { threat: "Lower-than-expected Creator response rate", impact: "Medium", fix: "Leverage direct personalized outreach and introduce referral incentive program." }
          ]
        };
      } else {
        // Fallback natural language composition
        aiResponseText = `Understood your directive: "${promptText}". I have analyzed and composed this smart contextual paragraph for you.`;
        docAction = {
          title: "✨ AI Composed Appendix",
          type: 'text',
          paragraph: `Regarding your request to "${promptText}": We recommend structuring milestones aggressively to meet current team bandwidth constraints. Ensuring standard UI elements stay intuitive is critical to reducing cognitive friction during the initial user onboarding wave.`
        };
      }

      // Append new messages to chat
      setChatMessages(prev => [...prev, {
        id: Date.now() + 1,
        sender: 'ai',
        text: aiResponseText,
        type: docAction ? 'action_completed' : 'standard',
        actionTitle: docAction?.title
      }]);

      // Automatically inject structured element directly into active document representation
      if (docAction) {
        setIsBlankDocument(false);
        setAppendedSections(prev => [...prev, docAction]);
        showToast(`Composed: ${docAction.title} injected into main document!`);
      }

      setTimeout(() => chatEndRef.current?.scrollIntoView({ behavior: 'smooth' }), 50);
    }, 1800);
  };

  const handleSidebarSend = (e) => {
    e.preventDefault();
    if (!chatInput.trim()) return;
    handleAISubmit(chatInput);
    setChatInput('');
  };

  const handleFloatingSend = (e) => {
    e.preventDefault();
    if (!floatingPrompt.trim()) return;
    handleAISubmit(floatingPrompt);
    setFloatingPrompt('');
  };

  // Click handler for Right Mini Sidebar
  const handleMiniSidebarClick = (tabKey) => {
    if (rightSidebarOpen && activeRightTab === tabKey) {
      setRightSidebarOpen(false);
    } else {
      setRightSidebarOpen(true);
      setActiveRightTab(tabKey);
    }
  };

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

  const createNewComposition = () => {
    const newDoc = {
      id: Date.now() + Math.floor(Math.random() * 1000),
      title: '',
      subtitle: '',
      initiatives: [],
      appendedSections: [],
      isBlank: true,
      bodyHtml: '',
    };

    setDocuments((prev) => [...prev, newDoc]);
    setActiveDocId(newDoc.id);
    setDocTitle('');
    setDocSubtitle('');
    setIsBlankDocument(true);
    setAppendedSections([]);
    setInitiatives([]);
    setDocBodyHtml('');
    showToast('Blank composition created');
  };

  const requestCloseDocument = (docId) => {
    setCloseConfirmDocId(docId);
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

  const applyFormatCommand = (command, value) => {
    document.execCommand(command, false, value);
    if (blankBodyRef.current) {
      setDocBodyHtml(blankBodyRef.current.innerHTML);
    }
  };

  const addTaskFromInput = () => {
    const trimmed = newTaskInput.trim();
    if (!trimmed) {
      return;
    }

    setTasks((prev) => [...prev, { id: Date.now(), text: trimmed, completed: false }]);
    setNewTaskInput('');
    showToast('Task added');
  };

  const convertMessyScheduleToPlan = () => {
    const rawItems = scheduleInput
      .split(/\n|,|;/)
      .map((item) => item.trim())
      .filter(Boolean);

    if (!rawItems.length) {
      return;
    }

    const cleanItems = rawItems.map((item, index) => ({
      id: Date.now() + index,
      slot: `${String(9 + index).padStart(2, '0')}:00`,
      title: item.charAt(0).toUpperCase() + item.slice(1),
      summary: `Action-ready block created from raw input item #${index + 1}.`,
    }));

    setScheduleOutput(cleanItems);
    showToast('Messy schedule converted to clean timeline');
  };

  const beginPanelResize = (target, event) => {
    const point = event.touches?.[0] || event;
    dragStateRef.current = {
      startX: point.clientX,
      startY: point.clientY,
      leftWidth: leftSidebarWidth,
      rightWidth: rightSidebarWidth,
      promptX: promptOffset.x,
      promptY: promptOffset.y,
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
        const deltaY = event.clientY - dragStateRef.current.startY;
        const nextX = Math.min(280, Math.max(-280, dragStateRef.current.promptX + deltaX));
        const nextY = Math.min(40, Math.max(-180, dragStateRef.current.promptY - deltaY));
        setPromptOffset({ x: nextX, y: nextY });
      }
    };

    const handlePointerUp = () => {
      setDragTarget(null);
    };

    document.body.style.cursor = dragTarget === 'prompt' ? 'grabbing' : 'col-resize';
    document.body.style.userSelect = 'none';
    window.addEventListener('pointermove', handlePointerMove);
    window.addEventListener('pointerup', handlePointerUp);

    return () => {
      document.body.style.cursor = '';
      document.body.style.userSelect = '';
      window.removeEventListener('pointermove', handlePointerMove);
      window.removeEventListener('pointerup', handlePointerUp);
    };
  }, [dragTarget]);

  // Helper component for the Workspace icons in the sidebar
  const WorkspaceIcon = ({ letter, colorClass }) => (
    <div className={`w-6 h-6 rounded flex items-center justify-center text-xs font-bold text-white ${colorClass}`}>
      {letter}
    </div>
  );

  return (
    <div className="flex h-screen bg-[#FDFDFD] font-sans text-gray-800 overflow-hidden relative">
      
      {/* Dynamic Toast System */}
      {toastMessage && (
        <div className="absolute top-4 left-1/2 transform -translate-x-1/2 bg-gray-900 text-white text-xs font-medium px-4 py-2.5 rounded-lg shadow-xl z-50 flex items-center gap-2 animate-fade-in transition-all">
          <Sparkles size={14} className="text-violet-400" />
          {toastMessage}
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

      {/* 1. Left Navigation Sidebar */}
      <div
        className="border-r border-gray-100 flex flex-col bg-[#FAFAFC] shrink-0 select-none overflow-hidden transition-[width] duration-200"
        style={{ width: leftSidebarOpen ? `${leftSidebarWidth}px` : '0px' }}
      >
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
            onClick={createNewComposition}
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
            <span className="absolute right-2.5 top-1.5 text-xs text-gray-400 border border-gray-200 rounded px-1">⌘ K</span>
          </div>
        </div>

        {/* Main Nav Links */}
        <div className="flex-1 overflow-y-auto px-2 space-y-0.5">
          <button className="w-full flex items-center gap-3 px-2 py-1.5 text-sm text-gray-600 hover:bg-gray-100 rounded-md transition-colors">
            <Home size={16} /> Home
          </button>
          <button className="w-full flex items-center justify-between px-2 py-1.5 text-sm bg-violet-50 text-violet-700 rounded-md font-medium">
            <div className="flex items-center gap-3">
              <BookOpen size={16} className="text-violet-600" /> Library
            </div>
          </button>
          <button className="w-full flex items-center justify-between px-2 py-1.5 text-sm text-gray-600 hover:bg-gray-100 rounded-md transition-colors">
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
          <button className="w-full flex items-center gap-3 px-2 py-1.5 text-sm text-gray-600 hover:bg-gray-100 rounded-md transition-colors mb-4">
            <Trash size={16} /> Trash
          </button>

          {/* Workspaces Section */}
          <div className="flex items-center justify-between px-2 py-2 mt-4">
            <span className="text-xs font-semibold text-gray-500 uppercase tracking-wider">Workspaces</span>
            <Plus size={14} className="text-gray-400 cursor-pointer hover:text-gray-600" />
          </div>
          
          <div className="space-y-1">
            <button className="w-full flex items-center gap-3 px-2 py-1.5 text-sm text-gray-700 hover:bg-gray-100 rounded-md font-medium transition-colors">
              <WorkspaceIcon letter="R" colorClass="bg-indigo-500" /> Regaarder
            </button>
            
            {/* Expanded Product Workspace */}
            <div>
              <button className="w-full flex items-center justify-between px-2 py-1.5 text-sm text-gray-700 hover:bg-gray-100 rounded-md font-medium transition-colors">
                <div className="flex items-center gap-3">
                  <WorkspaceIcon letter="P" colorClass="bg-orange-500" /> Product
                </div>
                <MoreHorizontal size={14} className="text-gray-400" />
              </button>
              
              <div className="ml-7 mt-1 space-y-0.5 border-l border-gray-200 pl-1">
                {documents.map((doc) => {
                  const label = doc.title?.trim() ? doc.title : 'Tap your text here';
                  const isActive = activeDocId === doc.id;

                  return (
                    <button
                      key={doc.id}
                      onClick={() => switchDocument(doc.id)}
                      className={`w-full flex items-center justify-between pl-3 pr-2 py-1 text-sm rounded-r-md transition-colors ${isActive ? 'bg-violet-50 text-violet-700' : 'text-gray-600 hover:bg-gray-100'}`}
                    >
                      <div className="flex items-center gap-2 truncate">
                        <FileText size={14} className={isActive ? 'text-violet-500' : 'text-gray-400'} />
                        <span className="truncate">{label}</span>
                      </div>
                      <MoreHorizontal size={14} className={isActive ? 'text-violet-400' : 'text-gray-300'} />
                    </button>
                  );
                })}
                <button className="w-full text-left pl-3 pr-2 py-1 text-sm text-gray-600 hover:text-gray-900 transition-colors">
                  PRD - Compose v1.0
                </button>
                <button className="w-full text-left pl-3 pr-2 py-1 text-sm text-gray-600 hover:text-gray-900 transition-colors">
                  Roadmap
                </button>
                <button className="w-full text-left pl-3 pr-2 py-1 text-sm text-gray-600 hover:text-gray-900 transition-colors">
                  Meeting Notes 05/12
                </button>
              </div>
            </div>

            <button className="w-full flex items-center gap-3 px-2 py-1.5 text-sm text-gray-700 hover:bg-gray-100 rounded-md font-medium transition-colors">
              <WorkspaceIcon letter="M" colorClass="bg-emerald-500" /> Marketing
            </button>
            <button className="w-full flex items-center gap-3 px-2 py-1.5 text-sm text-gray-700 hover:bg-gray-100 rounded-md font-medium transition-colors">
              <WorkspaceIcon letter="F" colorClass="bg-blue-500" /> Finance
            </button>
            <button className="w-full flex items-center gap-3 px-2 py-1.5 text-sm text-gray-700 hover:bg-gray-100 rounded-md font-medium transition-colors">
              <WorkspaceIcon letter="P" colorClass="bg-fuchsia-500" /> Personal
            </button>
          </div>
        </div>

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
          className="w-1 shrink-0 cursor-col-resize bg-transparent hover:bg-violet-100 active:bg-violet-200 transition-colors"
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
              <ChevronLeft size={18} />
            </button>
            <div className="flex items-center gap-2 text-sm text-gray-700 font-medium">
              <FileText size={16} className="text-gray-400" />
              {docTitle?.trim() ? docTitle : 'Tap your text here'}
            </div>
            <div className="flex items-center gap-1.5 text-xs text-gray-400 ml-4">
              <Cloud size={14} /> Saved Just now
            </div>
          </div>

          <div className="flex items-center gap-4">
            <button className="bg-violet-600 hover:bg-violet-700 text-white text-sm font-medium px-4 py-1.5 rounded-md flex items-center gap-2 transition-all active:scale-95">
              <Users size={16} /> Share
            </button>
            
            {/* Avatars */}
            <div className="flex -space-x-2">
              <img className="w-7 h-7 rounded-full border-2 border-white" src="https://images.unsplash.com/photo-1534528741775-53994a69daeb?auto=format&fit=crop&w=100&q=80" alt="Sarah" />
              <img className="w-7 h-7 rounded-full border-2 border-white" src="https://images.unsplash.com/photo-1507003211169-0a1dd7228f2d?auto=format&fit=crop&w=100&q=80" alt="Alex" />
              <img className="w-7 h-7 rounded-full border-2 border-white" src="https://images.unsplash.com/photo-1494790108377-be9c29b29330?auto=format&fit=crop&w=100&q=80" alt="Maya" />
            </div>

            <button className="text-gray-400 hover:text-gray-600 relative">
              <Bell size={18} />
              <span className="absolute -top-1 right-1 w-1.5 h-1.5 bg-violet-500 rounded-full"></span>
            </button>
            <button 
              onClick={() => handleMiniSidebarClick('assistant')}
              className={`w-7 h-7 flex items-center justify-center rounded-md transition-colors ${activeRightTab === 'assistant' && rightSidebarOpen ? 'bg-violet-100 text-violet-700' : 'bg-violet-50 text-violet-600 hover:bg-violet-100'}`}
            >
              <Sparkles size={14} />
            </button>
          </div>
        </div>

        <div className="h-10 border-b border-gray-100 px-4 flex items-center gap-2 overflow-x-auto no-scrollbar bg-[#FAFAFC]">
          {documents.map((doc) => {
            const label = doc.title?.trim() ? doc.title : 'Tap your text here';
            const isActive = activeDocId === doc.id;

            return (
              <div
                key={doc.id}
                onClick={() => switchDocument(doc.id)}
                className={`shrink-0 px-2 py-1 rounded-md text-xs font-medium border transition-colors flex items-center gap-1.5 ${isActive ? 'bg-white border-violet-200 text-violet-700' : 'bg-transparent border-transparent text-gray-500 hover:bg-white hover:border-gray-200'}`}
              >
                <span className="max-w-[160px] truncate">{label}</span>
                <button
                  onClick={(event) => {
                    event.stopPropagation();
                    requestCloseDocument(doc.id);
                  }}
                  className="p-0.5 rounded hover:bg-gray-100"
                  title="Close document"
                >
                  <X size={12} />
                </button>
              </div>
            );
          })}
        </div>

        {/* Formatting Ribbon */}
        <div ref={formattingMenuRef} className="h-12 border-b border-gray-100 flex items-center px-6 gap-6 text-sm text-gray-600 shrink-0 overflow-x-auto no-scrollbar select-none">
          <div className="relative">
            <button
              onClick={() => setOpenDropdown((prev) => (prev === 'heading' ? null : 'heading'))}
              className="flex items-center gap-1 hover:bg-gray-50 px-2 py-1 rounded"
            >
              {editorHeading} <ChevronDown size={14} className="text-gray-400" />
            </button>
            {openDropdown === 'heading' && (
              <div className="absolute top-9 left-0 z-30 w-44 bg-white border border-gray-200 rounded-lg shadow-lg p-2">
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
                          setEditorHeading(option);
                          const tag = option === 'Heading 1' ? 'H1' : option === 'Heading 2' ? 'H2' : option === 'Heading 3' ? 'H3' : 'P';
                          applyFormatCommand('formatBlock', tag);
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
          <div className="relative">
            <button
              onClick={() => setOpenDropdown((prev) => (prev === 'font' ? null : 'font'))}
              className="flex items-center gap-1 hover:bg-gray-50 px-2 py-1 rounded"
            >
              {editorFont} <ChevronDown size={14} className="text-gray-400" />
            </button>
            {openDropdown === 'font' && (
              <div className="absolute top-9 left-0 z-30 w-48 bg-white border border-gray-200 rounded-lg shadow-lg p-2">
                <input
                  value={fontSearch}
                  onChange={(e) => setFontSearch(e.target.value)}
                  placeholder="Search font"
                  className="w-full border border-gray-200 rounded px-2 py-1 text-xs mb-2 outline-none focus:border-violet-400"
                />
                <div className="max-h-40 overflow-y-auto">
                  {fontOptions
                    .filter((option) => option.toLowerCase().includes(fontSearch.toLowerCase()))
                    .map((option) => (
                      <button
                        key={option}
                        onClick={() => {
                          setEditorFont(option);
                          applyFormatCommand('fontName', option);
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
          <div className="relative flex items-center gap-1">
            <input
              type="number"
              min={10}
              max={72}
              value={editorSize}
              onChange={(e) => setEditorSize(Number(e.target.value) || 32)}
              className="w-14 bg-transparent border border-transparent hover:border-gray-200 rounded px-1 py-0.5 focus:outline-none"
            />
            <button onClick={() => setOpenDropdown((prev) => (prev === 'size' ? null : 'size'))}>
              <ChevronDown size={14} className="text-gray-400" />
            </button>
            {openDropdown === 'size' && (
              <div className="absolute top-9 left-0 z-30 w-32 bg-white border border-gray-200 rounded-lg shadow-lg p-2">
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
          <div className="flex items-center gap-3">
            <button onClick={() => { setIsBoldActive((prev) => !prev); applyFormatCommand('bold'); }} className={`font-bold hover:text-gray-900 ${isBoldActive ? 'text-violet-600' : ''}`}>B</button>
            <button onClick={() => { setIsItalicActive((prev) => !prev); applyFormatCommand('italic'); }} className={`italic font-serif hover:text-gray-900 ${isItalicActive ? 'text-violet-600' : ''}`}>I</button>
            <button onClick={() => { setIsUnderlineActive((prev) => !prev); applyFormatCommand('underline'); }} className={`underline hover:text-gray-900 ${isUnderlineActive ? 'text-violet-600' : ''}`}>U</button>
            <button onClick={() => { setIsStrikeActive((prev) => !prev); applyFormatCommand('strikeThrough'); }} className={`line-through hover:text-gray-900 ${isStrikeActive ? 'text-violet-600' : ''}`}>S</button>
            <div className="flex items-center gap-0.5 hover:text-gray-900 cursor-pointer">
              <Type size={14} /> <ChevronDown size={12} className="text-gray-400" />
            </div>
          </div>
          <div className="w-px h-4 bg-gray-200"></div>
          <div className="flex items-center gap-3">
            <AlignLeft onClick={() => { setAlignMode('left'); applyFormatCommand('justifyLeft'); }} size={16} className={`${alignMode === 'left' ? 'text-violet-600' : 'hover:text-gray-900'} cursor-pointer`} />
            <AlignCenter onClick={() => { setAlignMode('center'); applyFormatCommand('justifyCenter'); }} size={16} className={`${alignMode === 'center' ? 'text-violet-600' : 'hover:text-gray-900'} cursor-pointer`} />
            <AlignRight onClick={() => { setAlignMode('right'); applyFormatCommand('justifyRight'); }} size={16} className={`${alignMode === 'right' ? 'text-violet-600' : 'hover:text-gray-900'} cursor-pointer`} />
            <List onClick={() => { setIsListActive((prev) => !prev); applyFormatCommand('insertUnorderedList'); }} size={16} className={`${isListActive ? 'text-violet-600' : 'hover:text-gray-900'} cursor-pointer`} />
          </div>
          <div className="w-px h-4 bg-gray-200"></div>
          <div className="flex items-center gap-3">
            <span className="font-serif italic font-bold hover:text-gray-900 cursor-pointer">∑</span>
          </div>
        </div>

        {/* Document Editor Content (Beautifully separated page area) */}
        <div className="flex-1 overflow-y-auto relative bg-[#F7F7F9] p-6 md:p-8">
          <div ref={documentCardRef} className="max-w-[850px] mx-auto bg-white rounded-[24px] shadow-[0_2px_24px_-4px_rgba(0,0,0,0.04)] border border-gray-100/70 px-12 md:px-16 pt-16 pb-36 min-h-[calc(100vh-13rem)] relative">
            
            {/* Title & Subtitle */}
            <input 
              value={docTitle} 
              onChange={(e) => setDocTitle(e.target.value)}
              placeholder="Tap your text here"
              style={{ fontSize: `${editorSize}px`, fontFamily: editorFont, textAlign: alignMode }}
              className={`w-full text-gray-900 leading-tight mb-2 tracking-tight border-none outline-none focus:ring-0 bg-transparent ${isBoldActive ? 'font-bold' : 'font-semibold'} ${isItalicActive ? 'italic' : ''} ${isUnderlineActive ? 'underline' : ''} ${isStrikeActive ? 'line-through' : ''}`}
            />
            
            <textarea 
              value={docSubtitle} 
              onChange={(e) => setDocSubtitle(e.target.value)}
              placeholder="Tap your text here"
              style={{ fontFamily: editorFont, textAlign: alignMode }}
              className="w-full text-[17px] text-gray-500 mb-10 leading-relaxed max-w-2xl border-none outline-none resize-none focus:ring-0 bg-transparent h-14"
            />

            {isBlankDocument && (
              <div className="mb-10 min-h-[220px] relative">
                {docBodyHtml.trim() === '' && <div className="text-sm text-gray-400 pointer-events-none">Tap your text here</div>}
                <div
                  ref={blankBodyRef}
                  contentEditable
                  suppressContentEditableWarning
                  onInput={(e) => setDocBodyHtml(e.currentTarget.innerHTML)}
                  className="min-h-[220px] outline-none text-sm text-gray-700 leading-relaxed"
                  style={{ fontFamily: editorFont, textAlign: alignMode }}
                  dangerouslySetInnerHTML={{ __html: docBodyHtml }}
                />
              </div>
            )}

            {!isBlankDocument && (
              <>
                {/* 1. Objective */}
                <div className="mb-10 group relative">
                  <h2 contentEditable suppressContentEditableWarning className="text-xl font-bold text-gray-900 flex items-center gap-3 mb-4 outline-none">
                    <span className="text-2xl">🎯</span> 1. Objective
                  </h2>
                  <p contentEditable suppressContentEditableWarning className="text-gray-600 text-base leading-relaxed outline-none">
                    Launch Regaarder Compose to establish it as the most intuitive AI-native productivity workspace for modern teams and individuals.
                  </p>
                </div>

                {/* 2. Key Initiatives Table */}
                <div className="mb-10 group relative">
                  <h2 contentEditable suppressContentEditableWarning className="text-xl font-bold text-gray-900 flex items-center gap-3 mb-4 outline-none">
                    <span className="text-2xl">🚀</span> 2. Key Initiatives
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
                    <span className="text-2xl">👥</span> 3. Target Audience
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

            {/* Simulated Voice Waveform Indicator */}
            {isVoiceActive && (
              <div className="absolute inset-x-0 bottom-24 flex flex-col items-center justify-center bg-white/95 backdrop-blur-xs py-8 z-30 animate-fade-in">
                <div className="flex items-end gap-1 mb-3">
                  <div className="w-1.5 h-6 bg-violet-600 rounded-full animate-pulse"></div>
                  <div className="w-1.5 h-12 bg-violet-500 rounded-full animate-pulse delay-75"></div>
                  <div className="w-1.5 h-8 bg-indigo-500 rounded-full animate-pulse delay-150"></div>
                  <div className="w-1.5 h-14 bg-violet-600 rounded-full animate-pulse delay-300"></div>
                  <div className="w-1.5 h-6 bg-purple-500 rounded-full animate-pulse delay-200"></div>
                </div>
                <p className="text-xs font-medium text-violet-700 animate-pulse">Listening... Speak naturally to compose into document.</p>
                <button 
                  onClick={() => setIsVoiceActive(false)}
                  className="mt-3 text-[10px] text-gray-500 hover:text-gray-900 border border-gray-200 px-3 py-1 rounded-full transition-colors"
                >
                  Cancel
                </button>
              </div>
            )}

            {/* Composing / Analyzing State Glow */}
            {isComposing && (
              <div className="absolute inset-x-0 bottom-24 flex items-center justify-center bg-white/80 backdrop-blur-xs py-8 z-30 animate-pulse">
                <div className="flex items-center gap-3 bg-gray-900 text-white px-5 py-3 rounded-full shadow-lg">
                  <Loader2 className="animate-spin text-violet-400" size={16} />
                  <span className="text-xs font-semibold tracking-wide">Composing & structuring document details...</span>
                </div>
              </div>
            )}

          </div>
        </div>

        {/* Persistent Floating AI Prompt Bar */}
        <div
          className="pointer-events-none absolute inset-x-0 bottom-14 z-20 flex justify-center"
          style={{ transform: `translate(${promptOffset.x}px, ${promptOffset.y}px)` }}
        >
          <form
            onSubmit={handleFloatingSend}
            className={`pointer-events-auto bg-white border border-gray-100 shadow-[0_10px_40px_-10px_rgba(0,0,0,0.08)] flex items-center px-2 py-1.5 hover:border-violet-200 focus-within:border-violet-400 focus-within:ring-2 focus-within:ring-violet-100 transition-all ${isPromptExpanded ? 'rounded-2xl' : 'rounded-full'}`}
            style={{ width: `${Math.max(320, Math.min(promptWidth, isPromptExpanded ? 980 : 760))}px`, maxWidth: 'calc(100% - 16px)' }}
          >
            <button
              type="button"
              onPointerDown={(event) => beginPanelResize('prompt', event)}
              className="p-2 text-gray-300 hover:text-gray-500 cursor-move touch-none"
              title="Move prompt bar"
            >
              <Move size={14} />
            </button>
            <div className="flex items-center gap-3 px-2 flex-1">
              <Sparkles size={18} className="text-violet-500 shrink-0" />
              <textarea
                value={floatingPrompt}
                onChange={(e) => setFloatingPrompt(e.target.value)}
                placeholder="Type an instruction (e.g. 'add timeline' or 'extract risks')..."
                rows={isPromptExpanded ? 4 : 1}
                className="w-full bg-transparent border-none focus:outline-none text-sm text-gray-700 placeholder-gray-400 py-2 resize-none"
              />
            </div>
            <div className="flex items-center gap-2 pr-1 shrink-0">
              <button
                type="button"
                onClick={() => setIsPromptExpanded((prev) => !prev)}
                className={`p-2 rounded-full transition-colors ${isPromptExpanded ? 'bg-violet-50 text-violet-600' : 'text-gray-400 hover:text-gray-600 hover:bg-gray-100'}`}
                title="Expand prompt input"
              >
                <Expand size={16} />
              </button>
              <button
                type="button"
                onClick={() => setIsVoiceActive(!isVoiceActive)}
                className={`p-2 rounded-full transition-colors ${isVoiceActive ? 'bg-red-50 text-red-600' : 'text-gray-400 hover:text-gray-600 hover:bg-gray-100'}`}
              >
                <Mic size={18} />
              </button>
              <button
                type="submit"
                className="bg-violet-600 hover:bg-violet-700 text-white p-2 rounded-full transition-colors flex items-center justify-center h-8 w-8 active:scale-90"
              >
                <ArrowUp size={16} />
              </button>
            </div>
          </form>
        </div>

        {/* Bottom Status Bar */}
        <div className="h-10 border-t border-gray-100 flex items-center justify-between px-6 text-xs text-gray-500 bg-white shrink-0 select-none">
          <div className="flex items-center gap-6">
            <span>{1234 + appendedSections.length * 120} words</span>
            <div className="flex items-center gap-1 cursor-pointer hover:text-gray-800">
              English (US) <ChevronDown size={12} />
            </div>
            <span>Focus Mode</span>
          </div>
          <div className="flex items-center gap-4">
            <div className="flex items-center gap-3 text-gray-400">
              <FileText size={14} className="cursor-pointer hover:text-gray-600" />
              <Type size={14} className="cursor-pointer hover:text-gray-600" />
              <LayoutGrid size={14} className="cursor-pointer hover:text-gray-600" />
              <AlertTriangle size={14} className="cursor-pointer hover:text-gray-600" />
            </div>
            <span>100%</span>
            <ChevronDown size={12} className="cursor-pointer" />
          </div>
        </div>
      </div>

      {rightSidebarOpen && (
        <div
          onMouseDown={(event) => beginPanelResize('right', event)}
          className="w-1 shrink-0 cursor-col-resize bg-transparent hover:bg-violet-100 active:bg-violet-200 transition-colors"
          aria-label="Resize right sidebar"
        />
      )}

      {/* 3. Right Sidebar (AI Assistant / Smart Chat / Tools) */}
      <div 
        className={`border-l border-gray-100 flex flex-col bg-white shrink-0 transition-[width] duration-300 ${
          rightSidebarOpen ? '' : 'w-0 overflow-hidden border-l-0'
        }`}
        style={{ width: rightSidebarOpen ? `${rightSidebarWidth}px` : '0px' }}
      >
        {/* Sidebar Header Tabs */}
        <div className="flex border-b border-gray-100 text-xs font-semibold select-none bg-[#FAFAFC]">
          <button 
            className={`flex-1 text-center py-4 transition-all ${activeRightTab === 'chat' ? 'text-violet-600 border-b-2 border-violet-600 bg-white' : 'text-gray-500 hover:text-gray-700 hover:bg-gray-50'}`}
            onClick={() => setActiveRightTab('chat')}
          >
            AI Chat
          </button>
          <button 
            className={`flex-1 text-center py-4 transition-all ${activeRightTab === 'assistant' ? 'text-violet-600 border-b-2 border-violet-600 bg-white' : 'text-gray-500 hover:text-gray-700 hover:bg-gray-50'}`}
            onClick={() => setActiveRightTab('assistant')}
          >
            AI Assistant
          </button>
          <button 
            className={`flex-1 text-center py-4 transition-all ${activeRightTab === 'tasks' ? 'text-violet-600 border-b-2 border-violet-600 bg-white' : 'text-gray-500 hover:text-gray-700 hover:bg-gray-50'}`}
            onClick={() => setActiveRightTab('tasks')}
          >
            Tasks ({tasks.filter(t => !t.completed).length})
          </button>
          <button 
            className={`flex-1 text-center py-4 transition-all ${activeRightTab === 'calendar' ? 'text-violet-600 border-b-2 border-violet-600 bg-white' : 'text-gray-500 hover:text-gray-700 hover:bg-gray-50'}`}
            onClick={() => setActiveRightTab('calendar')}
          >
            Schedule
          </button>
          <div className="w-10 flex items-center justify-center border-l border-gray-100">
            <X 
              size={14} 
              className="text-gray-400 cursor-pointer hover:text-gray-600" 
              onClick={() => setRightSidebarOpen(false)}
            />
          </div>
        </div>

        {/* Dynamic Sidebar Content */}
        <div className="flex-1 flex flex-col min-h-0 bg-white">
          
          {/* A. ACTIVE TAB: AI CHAT */}
          {activeRightTab === 'chat' && (
            <div className="flex-1 flex flex-col min-h-0">
              {/* Context Indicator */}
              <div className="px-4 py-2 bg-violet-50/40 border-b border-violet-100/30 flex items-center gap-2 text-xs text-violet-700">
                <FileText size={12} />
                <span className="font-medium truncate">Context Linked: {docTitle}</span>
              </div>

              {/* Chat Stream */}
              <div className="flex-1 overflow-y-auto p-4 space-y-4">
                {chatMessages.map((msg) => (
                  <div 
                    key={msg.id} 
                    className={`flex flex-col max-w-[85%] ${msg.sender === 'user' ? 'ml-auto items-end' : 'mr-auto items-start'}`}
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
                  </div>
                ))}
                
                {/* Loader animation when AI is processing */}
                {isComposing && (
                  <div className="flex items-center gap-2 text-xs text-gray-400 p-2 animate-pulse">
                    <Loader2 className="animate-spin text-violet-500" size={14} />
                    <span>Compose AI is writing...</span>
                  </div>
                )}
                <div ref={chatEndRef} />
              </div>

              {/* Chat Input Bar */}
              <form onSubmit={handleSidebarSend} className="p-3 border-t border-gray-100 bg-[#FAFAFC]">
                <div className="relative flex items-center bg-white border border-gray-200 rounded-xl focus-within:border-violet-400 transition-colors">
                  <input 
                    type="text" 
                    value={chatInput}
                    onChange={(e) => setChatInput(e.target.value)}
                    placeholder="Ask, summarize, or instruct..." 
                    className="w-full bg-transparent border-none focus:outline-none text-sm py-2.5 pl-3.5 pr-10 text-gray-700 placeholder-gray-400"
                  />
                  <button 
                    type="submit" 
                    className="absolute right-1.5 p-1.5 rounded-lg bg-violet-50 hover:bg-violet-100 text-violet-600 transition-colors"
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
                <p className="text-xs text-gray-500">Highlight text in the page or use these global actions to refine current paragraphs.</p>
              </div>

              {/* Action Buttons Grid */}
              <div className="space-y-2">
                <button 
                  onClick={() => handleAISubmit("Improve the writing tone and professional clarity")}
                  className="w-full flex items-center gap-3 px-4 py-3 border border-gray-100 rounded-lg text-sm text-gray-700 hover:border-violet-200 hover:bg-violet-50 transition-colors text-left"
                >
                  <PenTool size={16} className="text-violet-500" />
                  <div>
                    <div className="font-semibold text-xs">Improve writing</div>
                    <p className="text-[10px] text-gray-400">Enhance vocabulary and structure</p>
                  </div>
                </button>

                <button 
                  onClick={() => handleAISubmit("Summarize the launch plan concisely")}
                  className="w-full flex items-center gap-3 px-4 py-3 border border-gray-100 rounded-lg text-sm text-gray-700 hover:border-violet-200 hover:bg-violet-50 transition-colors text-left"
                >
                  <FileText size={16} className="text-indigo-500" />
                  <div>
                    <div className="font-semibold text-xs">Summarize document</div>
                    <p className="text-[10px] text-gray-400">Condense overall strategy into bullets</p>
                  </div>
                </button>

                <button 
                  onClick={() => handleAISubmit("Make the plan shorter and more direct")}
                  className="w-full flex items-center gap-3 px-4 py-3 border border-gray-100 rounded-lg text-sm text-gray-700 hover:border-violet-200 hover:bg-violet-50 transition-colors text-left"
                >
                  <Scissors size={16} className="text-violet-400" />
                  <div>
                    <div className="font-semibold text-xs">Make shorter</div>
                    <p className="text-[10px] text-gray-400">Prune unnecessary wording</p>
                  </div>
                </button>

                <button 
                  onClick={() => handleAISubmit("Analyze risks and mitigation strategies")}
                  className="w-full flex items-center gap-3 px-4 py-3 border border-gray-100 rounded-lg text-sm text-gray-700 hover:border-violet-200 hover:bg-violet-50 transition-colors text-left"
                >
                  <AlertTriangle size={16} className="text-amber-500" />
                  <div>
                    <div className="font-semibold text-xs">Check for gaps & risks</div>
                    <p className="text-[10px] text-gray-400">Locate potential launch bottle necks</p>
                  </div>
                </button>
              </div>

              <div>
                <h4 className="text-[11px] font-bold text-gray-400 uppercase tracking-wider mb-2">Workspace Quicklinks</h4>
                <div className="bg-[#FAFAFC] rounded-lg p-3 cursor-pointer hover:bg-gray-100 transition-all border border-gray-100">
                  <div className="text-xs font-semibold text-gray-800">PRD - Compose v1.0</div>
                  <p className="text-[10px] text-gray-400 mt-0.5">Linked project scope files</p>
                </div>
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
                {tasks.map(task => (
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
                    <span className="text-xs font-medium leading-relaxed">{task.text}</span>
                  </div>
                ))}
              </div>
            </div>
          )}

          {/* D. ACTIVE TAB: INTEGRATED CALENDAR & TIMELINE SCHEDULE */}
          {activeRightTab === 'calendar' && (
            <div className="flex-1 overflow-y-auto p-5 space-y-4">
              <h3 className="text-sm font-bold text-gray-900">Launch Timeline</h3>
              <p className="text-xs text-gray-500">Consolidated product rollouts aligned with team calendar events.</p>

              <div className="rounded-xl border border-violet-100 bg-violet-50/20 p-3">
                <div className="text-xs font-semibold text-violet-700 mb-2">Schedule AI Cleaner</div>
                <p className="text-[11px] text-gray-500 mb-2">Paste messy tasks, shorthand notes, or random lines. Compose will convert them into a clean sequence.</p>
                <textarea
                  value={scheduleInput}
                  onChange={(e) => setScheduleInput(e.target.value)}
                  placeholder="eg: call dev team, fix landing page copy tomorrow, record demo 2pm, prepare launch tweet"
                  rows={3}
                  className="w-full rounded-lg border border-gray-200 bg-white p-2.5 text-xs text-gray-700 outline-none focus:border-violet-400 resize-none"
                />
                <button
                  onClick={convertMessyScheduleToPlan}
                  className="mt-2 w-full rounded-lg bg-violet-600 text-white text-xs font-semibold py-2 hover:bg-violet-700"
                >
                  Clean Into Schedule
                </button>
              </div>

              {scheduleOutput.length > 0 && (
                <div className="space-y-2">
                  <span className="text-[10px] font-bold text-violet-500 uppercase tracking-wider block">Clean Output</span>
                  {scheduleOutput.map((item) => (
                    <div key={item.id} className="p-3 rounded-lg border border-violet-100 bg-white">
                      <div className="flex items-center justify-between mb-1">
                        <div className="text-xs font-semibold text-gray-800">{item.title}</div>
                        <div className="text-[10px] font-semibold text-violet-700 bg-violet-50 px-2 py-0.5 rounded-full">{item.slot}</div>
                      </div>
                      <div className="text-[11px] text-gray-500">{item.summary}</div>
                    </div>
                  ))}
                </div>
              )}

              {/* Minimalist interactive calendar widget */}
              <div className="border border-gray-100 rounded-xl p-4 bg-[#FAFAFC]">
                <div className="flex items-center justify-between text-xs font-bold text-gray-700 mb-3">
                  <span>MAY 2026</span>
                  <div className="flex gap-2 text-gray-400">
                    <span className="cursor-pointer hover:text-gray-900">←</span>
                    <span className="cursor-pointer hover:text-gray-900">→</span>
                  </div>
                </div>
                <div className="grid grid-cols-7 gap-1 text-center text-[10px] text-gray-400 mb-2">
                  <span>S</span><span>M</span><span>T</span><span>W</span><span>T</span><span>F</span><span>S</span>
                </div>
                <div className="grid grid-cols-7 gap-1 text-center text-xs font-medium text-gray-700">
                  <span className="text-gray-300">26</span><span className="text-gray-300">27</span><span className="text-gray-300">28</span><span className="text-gray-300">29</span><span className="text-gray-300">30</span><span>1</span><span>2</span>
                  <span>3</span><span>4</span><span>5</span><span>6</span><span>7</span><span>8</span><span>9</span>
                  <span>10</span><span>11</span><span>12</span><span>13</span><span>14</span><span className="bg-violet-600 text-white font-bold rounded-full w-5 h-5 flex items-center justify-center mx-auto">15</span><span>16</span>
                  <span>17</span><span>18</span><span>19</span><span>20</span><span>21</span><span>22</span><span>23</span>
                  <span>24</span><span>25</span><span>26</span><span>27</span><span>28</span><span>29</span><span>30</span>
                </div>
              </div>

              <div className="space-y-2">
                <span className="text-[10px] font-bold text-gray-400 uppercase tracking-wider block">Upcoming Events</span>
                <div className="p-3 rounded-lg border border-violet-100 bg-violet-50/20 text-xs">
                  <div className="font-bold text-violet-700">Beta Launch Kickoff</div>
                  <div className="text-gray-500 mt-0.5">May 15 • 10:00 AM</div>
                </div>
                <div className="p-3 rounded-lg border border-gray-100 text-xs">
                  <div className="font-bold text-gray-700">Product Hunt Checklist Finalization</div>
                  <div className="text-gray-500 mt-0.5">June 14 • 2:30 PM</div>
                </div>
              </div>
            </div>
          )}

        </div>
      </div>

      {/* 4. Far Right Mini Sidebar (Icons only / Navigation controller) */}
      <div className="w-16 border-l border-gray-100 bg-[#FAFAFC] flex flex-col items-center py-4 gap-6 shrink-0 select-none">
        
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
          <div className={`p-2 rounded-xl transition-all ${activeRightTab === 'assistant' && rightSidebarOpen ? 'bg-violet-100' : ''}`}>
            <PenTool size={20} />
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

        <div className="flex flex-col items-center gap-1 text-gray-400 hover:text-violet-600 cursor-pointer">
          <div className="p-2">
            <File size={20} />
          </div>
          <span className="text-[9px] font-semibold">Files</span>
        </div>

        <div className="flex flex-col items-center gap-1 text-gray-400 hover:text-violet-600 cursor-pointer">
          <div className="p-2">
            <Users size={20} />
          </div>
          <span className="text-[9px] font-semibold">People</span>
        </div>

        <div className="flex flex-col items-center gap-1 text-gray-400 hover:text-gray-600 cursor-pointer mt-auto">
          <div className="p-2">
            <MoreHorizontal size={20} />
          </div>
          <span className="text-[9px] font-semibold">More</span>
        </div>
      </div>

    </div>
  );
}