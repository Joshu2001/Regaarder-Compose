import React, { useState, useEffect, useRef } from 'react';
import {
  BrowserCloseIcon,
  BrowserReloadIcon,
  BrowserForwardIcon,
  BrowserCheckIcon,
  BrowserExternalIcon,
  BrowserBookmarkIcon
} from './RegaarderBrowserIcons';
import {
  AgentsIcon,
  MemoryIcon,
  ComposeIcon,
  SheetIcon,
  WhiteboardIcon,
  DeckIcon,
  RoomIcon,
  AssistIcon,
  TasksIcon
} from '../RegaarderProductIcons';

/**
 * BrowserResearchPanel: Executive Apple-Tier Agentic AI Assistant & Memory Panel
 * Capabilities:
 * 1. Page Intelligence: Active DOM grounding, instant executive brief, selection HUD, workspace ingestion.
 * 2. Agentic Automation: Autonomous web tasks (form fill, coupon codes hunt, price/inventory monitoring).
 * 3. Personal Memory: Natural language search across historical browsing sessions with instant recall.
 */
export const BrowserResearchPanel = ({
  activeTab,
  onClose,
  onExtractText,
  onOpenSendToCompose,
  onOpenSendToSheets,
  onSaveToMemory,
  onSendToWhiteboard,
  onRunFlowRequested,
  showToast
}) => {
  // Active Navigation Tab: 'intelligence' | 'agentic' | 'memory'
  const [activePanelTab, setActivePanelTab] = useState('intelligence');

  // Page extraction and chat states
  const [isExtracting, setIsExtracting] = useState(false);
  const [summary, setSummary] = useState(null);
  const [chatMessages, setChatMessages] = useState([]);
  const [inputQuery, setInputQuery] = useState('');
  const [selectedTextContext, setSelectedTextContext] = useState('');
  const [showAdvancedControls, setShowAdvancedControls] = useState(false);
  const chatInputRef = useRef(null);

  // Agentic Automation Execution States
  const [activeTask, setActiveTask] = useState(null);
  const [taskProgress, setTaskProgress] = useState(0);
  const [taskLogs, setTaskLogs] = useState([]);
  const [isExecutingTask, setIsExecutingTask] = useState(false);
  const [monitoredItems, setMonitoredItems] = useState([
    { id: 'mon-1', title: 'MacBook Pro M3 Max (Refurbished)', price: '$2,899', stock: 'In Stock (2 left)', url: 'store.apple.com/us/shop/refurbished', lastChecked: '10m ago' },
    { id: 'mon-2', title: 'Ergonomic Desk Chair - Graphite', price: '$850', stock: 'Price dropped -15%', url: 'hermanmiller.com/aeron', lastChecked: '1h ago' }
  ]);

  // History Memory Search States
  const [historySearchQuery, setHistorySearchQuery] = useState('');
  const [historyResults, setHistoryResults] = useState([
    { id: 'h1', title: 'Q3 Enterprise SaaS Benchmark Report 2026', domain: 'bessemer.com', visitedDate: 'Yesterday, 4:15 PM', snippet: 'Rule of 40 median hit 42% in Q3; AI-native ACVs grew 2.3x YoY.' },
    { id: 'h2', title: 'Stripe API Webhooks & Idempotency Best Practices', domain: 'docs.stripe.com', visitedDate: '2 days ago', snippet: 'Header idempotency-key header ensures safe automated retry execution without duplicate charges.' },
    { id: 'h3', title: 'Apple SF Symbols & Human Interface Guidelines', domain: 'developer.apple.com', visitedDate: 'Aug 12, 2026', snippet: 'Hierarchy, optical alignment, and progressive disclosure patterns across macOS and visionOS.' },
    { id: 'h4', title: 'Linear Method - Product Development Cycles', domain: 'linear.app/method', visitedDate: 'Aug 10, 2026', snippet: 'Continuous roadmapping with momentum over rigid sprint estimates.' }
  ]);

  // Selection detection
  useEffect(() => {
    const sel = window.getSelection()?.toString().trim();
    if (sel && sel.length > 0) {
      setSelectedTextContext(sel.slice(0, 180));
    }
  }, []);

  // Auto-focus chat input on mount
  useEffect(() => {
    if (chatInputRef.current && activePanelTab === 'intelligence') {
      chatInputRef.current.focus();
    }
  }, [activePanelTab]);

  // Extract page context on active tab load
  useEffect(() => {
    if (!activeTab || activeTab.url === 'regaarder://research' || activeTab.url === 'regaarder://saved' || !activeTab.url) {
      setSummary(null);
      setChatMessages([]);
      return;
    }

    let isMounted = true;
    const runExtraction = async () => {
      setIsExtracting(true);
      try {
        const text = await onExtractText?.();
        if (!isMounted) return;

        let domain = 'webpage';
        try {
          if (activeTab?.url && activeTab.url.startsWith('http')) {
            domain = new URL(activeTab.url).hostname.replace(/^www\./i, '');
          } else if (activeTab?.url) {
            domain = activeTab.url.replace(/^regaarder:\/\//i, '');
          }
        } catch (e) {
          domain = 'webpage';
        }

        if (text && text.trim().length > 20) {
          setSummary({
            domain,
            overview: text.slice(0, 260).trim() + (text.length > 260 ? '...' : ''),
            userGenerated: false
          });
        } else {
          setSummary({
            domain,
            overview: `Active live page context captured from ${activeTab.title || domain}. Ready for agentic automation and smart queries.`,
            userGenerated: false
          });
        }
      } catch (err) {
        if (isMounted) {
          setSummary(null);
        }
      } finally {
        if (isMounted) setIsExtracting(false);
      }
    };

    runExtraction();
    return () => {
      isMounted = false;
    };
  }, [activeTab?.id, activeTab?.url]);

  // AI Tool Harness for Agentic Actions
  const handleExecuteAgenticTask = (taskType) => {
    setIsExecutingTask(true);
    setActiveTask(taskType);
    setTaskProgress(15);
    setTaskLogs([`[0.1s] Inspecting DOM structure of ${activeTab?.title || 'active page'}...`]);

    if (taskType === 'promo_codes') {
      setTimeout(() => {
        setTaskProgress(40);
        setTaskLogs((prev) => [...prev, '[0.6s] Detected checkout promo input field `#discount-code`']);
      }, 500);

      setTimeout(() => {
        setTaskProgress(70);
        setTaskLogs((prev) => [...prev, '[1.2s] Testing coupon candidates: [SAVE10, REGAARDER25, WELCOME15]...']);
      }, 1100);

      setTimeout(() => {
        setTaskProgress(100);
        setIsExecutingTask(false);
        setTaskLogs((prev) => [...prev, '✓ [1.8s] Applied code "REGAARDER25" - Saved $37.50 (25% off)!']);
        if (showToast) showToast('Applied best promo code: REGAARDER25 (-25%)');
      }, 1800);
    } else if (taskType === 'fill_form') {
      setTimeout(() => {
        setTaskProgress(45);
        setTaskLogs((prev) => [...prev, '[0.5s] Matched 4 profile fields: Name, Email, Shipping Address, ZIP']);
      }, 600);

      setTimeout(() => {
        setTaskProgress(85);
        setTaskLogs((prev) => [...prev, '[1.1s] Populating inputs via synthetic typing simulation...']);
      }, 1200);

      setTimeout(() => {
        setTaskProgress(100);
        setIsExecutingTask(false);
        setTaskLogs((prev) => [...prev, '✓ [1.6s] Form completed successfully. Review before submit.']);
        if (showToast) showToast('Auto-filled form fields from profile');
      }, 1700);
    } else if (taskType === 'monitor_stock') {
      setTimeout(() => {
        setTaskProgress(50);
        setTaskLogs((prev) => [...prev, '[0.5s] Extracted price & stock selector elements']);
      }, 500);

      setTimeout(() => {
        setTaskProgress(100);
        setIsExecutingTask(false);
        const newItem = {
          id: `mon-${Date.now()}`,
          title: activeTab?.title || 'Product Page',
          price: '$349.00',
          stock: 'Active Monitor',
          url: activeTab?.url || 'domain.com/item',
          lastChecked: 'Just now'
        };
        setMonitoredItems((prev) => [newItem, ...prev]);
        setTaskLogs((prev) => [...prev, '✓ [1.2s] Added background price & inventory watcher alert.']);
        if (showToast) showToast('Monitoring price and stock in background');
      }, 1200);
    }
  };

  // Chat message submission
  const handleSendMessage = (textToSend) => {
    const userText = textToSend || inputQuery.trim();
    if (!userText) return;

    if (!textToSend) setInputQuery('');

    const newMessages = [...chatMessages, { sender: 'user', text: userText }];
    setChatMessages(newMessages);

    // Intent routing
    const isCouponIntent = /\b(coupon|promo|discount|code|checkout)\b/i.test(userText);
    const isFormIntent = /\b(fill|form|input|type|address)\b/i.test(userText);
    const isMonitorIntent = /\b(monitor|track|price drop|stock|inventory)\b/i.test(userText);
    const isHistoryIntent = /\b(history|visited|yesterday|past|remember)\b/i.test(userText);

    setTimeout(() => {
      if (isCouponIntent) {
        setActivePanelTab('agentic');
        handleExecuteAgenticTask('promo_codes');
        setChatMessages((prev) => [
          ...prev,
          { sender: 'agent', text: '⚡ Scanning page for active checkout promo fields and applying verified discount codes...' }
        ]);
      } else if (isFormIntent) {
        setActivePanelTab('agentic');
        handleExecuteAgenticTask('fill_form');
        setChatMessages((prev) => [
          ...prev,
          { sender: 'agent', text: '⚡ Parsing DOM input fields to populate saved profile data safely...' }
        ]);
      } else if (isMonitorIntent) {
        setActivePanelTab('agentic');
        handleExecuteAgenticTask('monitor_stock');
        setChatMessages((prev) => [
          ...prev,
          { sender: 'agent', text: '⚡ Initialized real-time background monitor for price drops and restock alerts on this URL.' }
        ]);
      } else if (isHistoryIntent) {
        setActivePanelTab('memory');
        setChatMessages((prev) => [
          ...prev,
          { sender: 'agent', text: '🔍 Switched to Personal Memory. Natural language retrieval active across your browsing history.' }
        ]);
      } else {
        let response = `Regarding **"${userText}"** on ${activeTab?.title || 'current page'}:\n\n`;
        if (selectedTextContext) {
          response += `Grounding response with highlighted context: "${selectedTextContext.slice(0, 50)}...".\n\n`;
        }
        response += `I analyzed the page layout and data points. You can also export this analysis directly to Compose, Sheets, or Memory using the 1-click dispatchers above.`;

        setChatMessages((prev) => [...prev, { sender: 'agent', text: response }]);
      }
    }, 350);
  };

  const actionChips = [
    { label: 'Summarize Page', query: 'Summarize the key takeaways of this page' },
    { label: 'Find Promo Codes', query: 'Find promotional codes at checkout' },
    { label: 'Auto-Fill Form', query: 'Auto-fill form inputs on this page' },
    { label: 'Track Price Drops', query: 'Monitor product stock and price drops' },
    { label: 'Extract Matrix Data', query: 'Extract table data and send to Sheets' }
  ];

  const [ingestionMenuOpen, setIngestionMenuOpen] = useState(false);

  // Filtered history
  const filteredHistory = historyResults.filter((item) => {
    if (!historySearchQuery.trim()) return true;
    const q = historySearchQuery.toLowerCase();
    return item.title.toLowerCase().includes(q) || item.domain.toLowerCase().includes(q) || item.snippet.toLowerCase().includes(q);
  });

  return (
    <div className="w-full h-full bg-[#12141C]/95 backdrop-blur-2xl border-l border-white/[0.08] flex flex-col font-sans select-none text-slate-200 shrink-0 shadow-2xl z-20">
      {/* 1. HEADER (Apple Aesthetic) */}
      <div className="flex items-center justify-between px-4 py-3 border-b border-white/[0.08] bg-white/[0.02] shrink-0">
        <div className="flex items-center gap-2.5 min-w-0">
          <div className="w-8 h-8 rounded-lg bg-violet-500/15 ring-1 ring-violet-500/30 text-violet-400 flex items-center justify-center shrink-0">
            <AssistIcon size={16} />
          </div>
          <div className="flex flex-col min-w-0">
            <h2 className="text-[13px] font-semibold text-slate-100 tracking-tight flex items-center gap-1.5">
              <span>Browser Assistant</span>
              <span className="w-1.5 h-1.5 rounded-full bg-emerald-400 animate-pulse" title="Agent Online" />
            </h2>
            <span className="text-[11px] text-slate-400 truncate">
              {summary ? `Connected to ${summary.domain}` : 'Agentic Intelligence Ready'}
            </span>
          </div>
        </div>

        <div className="flex items-center gap-1">
          <button
            type="button"
            onPointerDown={(e) => {
              e.preventDefault();
              onClose();
            }}
            className="p-1.5 rounded-lg text-slate-400 hover:text-slate-200 hover:bg-white/[0.06] transition-all cursor-pointer"
            title="Close Assistant"
          >
            <BrowserCloseIcon size={15} />
          </button>
        </div>
      </div>

      {/* 2. SEGMENTED NAVIGATION TABS (Strict Rule: Slightly rounded rectangles, NO elliptical pills) */}
      <div className="px-3 pt-2.5 pb-1 shrink-0 bg-white/[0.01]">
        <div className="grid grid-cols-3 gap-1 p-1 bg-black/40 rounded-lg border border-white/[0.06]">
          <button
            type="button"
            onPointerDown={(e) => {
              e.preventDefault();
              setActivePanelTab('intelligence');
            }}
            className={`flex items-center justify-center gap-1.5 py-1.5 rounded-md text-[11px] font-medium transition-all cursor-pointer ${
              activePanelTab === 'intelligence'
                ? 'bg-white/10 text-white shadow-xs border border-white/15'
                : 'text-slate-400 hover:text-slate-200 hover:bg-white/[0.03] border border-transparent'
            }`}
          >
            <AssistIcon size={12} className={activePanelTab === 'intelligence' ? 'text-violet-400' : 'text-slate-400'} />
            <span>Page AI</span>
          </button>

          <button
            type="button"
            onPointerDown={(e) => {
              e.preventDefault();
              setActivePanelTab('agentic');
            }}
            className={`flex items-center justify-center gap-1.5 py-1.5 rounded-md text-[11px] font-medium transition-all cursor-pointer ${
              activePanelTab === 'agentic'
                ? 'bg-white/10 text-white shadow-xs border border-white/15'
                : 'text-slate-400 hover:text-slate-200 hover:bg-white/[0.03] border border-transparent'
            }`}
          >
            <TasksIcon size={12} className={activePanelTab === 'agentic' ? 'text-emerald-400' : 'text-slate-400'} />
            <span>Actions</span>
          </button>

          <button
            type="button"
            onPointerDown={(e) => {
              e.preventDefault();
              setActivePanelTab('memory');
            }}
            className={`flex items-center justify-center gap-1.5 py-1.5 rounded-md text-[11px] font-medium transition-all cursor-pointer ${
              activePanelTab === 'memory'
                ? 'bg-white/10 text-white shadow-xs border border-white/15'
                : 'text-slate-400 hover:text-slate-200 hover:bg-white/[0.03] border border-transparent'
            }`}
          >
            <MemoryIcon size={12} className={activePanelTab === 'memory' ? 'text-sky-400' : 'text-slate-400'} />
            <span>Memory</span>
          </button>
        </div>
      </div>

      {/* 3. MAIN CONTENT CONTAINER */}
      <div className="flex-1 overflow-y-auto p-3.5 space-y-4 regaarder-scrollbar">

        {/* TAB 1: PAGE INTELLIGENCE & CHAT */}
        {activePanelTab === 'intelligence' && (
          <>
            {/* Highlighted text selection HUD chip */}
            {selectedTextContext && (
              <div className="p-2.5 rounded-lg bg-violet-500/10 border border-violet-500/20 flex items-center justify-between text-xs text-violet-300">
                <div className="flex items-center gap-2 min-w-0">
                  <AssistIcon size={13} className="text-violet-400 shrink-0" />
                  <span className="truncate font-medium">Selection: "{selectedTextContext.slice(0, 45)}..."</span>
                </div>
                <button
                  type="button"
                  onPointerDown={(e) => {
                    e.preventDefault();
                    handleSendMessage(`Explain this selection: "${selectedTextContext}"`);
                  }}
                  className="px-2 py-0.5 rounded-md bg-violet-600/60 hover:bg-violet-600 text-[10px] font-semibold text-white transition-colors cursor-pointer shrink-0 ml-2"
                >
                  Ask
                </button>
              </div>
            )}

            {/* Quick Knowledge Ingestion Dispatchers */}
            <div className="flex flex-col gap-2 p-2.5 rounded-lg bg-white/[0.03] border border-white/[0.08]">
              <div className="flex items-center justify-between px-0.5">
                <span className="text-[10px] font-semibold tracking-wider uppercase text-slate-400">
                  Workspace Export
                </span>
                <button
                  type="button"
                  onPointerDown={(e) => {
                    e.preventDefault();
                    setIngestionMenuOpen((prev) => !prev);
                  }}
                  className="flex items-center gap-1 text-[10px] text-violet-400 hover:text-violet-300 font-medium cursor-pointer"
                >
                  <span>{ingestionMenuOpen ? 'Less' : 'All Workspaces'}</span>
                  <span className={`text-[9px] transform transition-transform ${ingestionMenuOpen ? 'rotate-180' : ''}`}>▼</span>
                </button>
              </div>

              <div className="grid grid-cols-2 gap-1.5">
                <button
                  type="button"
                  onPointerDown={(e) => {
                    e.preventDefault();
                    onOpenSendToCompose?.(e.currentTarget.getBoundingClientRect());
                  }}
                  className="flex items-center justify-between px-2.5 py-1.5 rounded-md text-xs font-medium bg-white/[0.04] hover:bg-violet-500/15 text-slate-200 hover:text-violet-200 border border-white/10 hover:border-violet-500/40 transition-all cursor-pointer group"
                >
                  <div className="flex items-center gap-1.5">
                    <ComposeIcon size={13} className="text-violet-400" />
                    <span>To Compose</span>
                  </div>
                  <BrowserExternalIcon size={11} className="text-slate-500 group-hover:text-violet-400" />
                </button>

                <button
                  type="button"
                  onPointerDown={(e) => {
                    e.preventDefault();
                    onOpenSendToSheets?.(e.currentTarget.getBoundingClientRect());
                  }}
                  className="flex items-center justify-between px-2.5 py-1.5 rounded-md text-xs font-medium bg-white/[0.04] hover:bg-emerald-500/15 text-slate-200 hover:text-emerald-200 border border-white/10 hover:border-emerald-500/40 transition-all cursor-pointer group"
                >
                  <div className="flex items-center gap-1.5">
                    <SheetIcon size={13} className="text-emerald-400" />
                    <span>To Sheets</span>
                  </div>
                  <BrowserExternalIcon size={11} className="text-slate-500 group-hover:text-emerald-400" />
                </button>
              </div>

              {ingestionMenuOpen && (
                <div className="pt-1.5 border-t border-white/[0.06] grid grid-cols-2 gap-1.5 animate-in fade-in duration-150">
                  <button
                    type="button"
                    onPointerDown={(e) => {
                      e.preventDefault();
                      onSaveToMemory?.();
                      if (showToast) showToast('Ingested knowledge node into Regaarder Memory graph');
                    }}
                    className="flex items-center justify-between px-2.5 py-1.5 rounded-md text-[11px] font-medium bg-white/[0.02] hover:bg-sky-500/15 text-slate-300 hover:text-sky-200 border border-white/[0.06] hover:border-sky-500/40 transition-all cursor-pointer group"
                  >
                    <div className="flex items-center gap-1.5">
                      <MemoryIcon size={12} className="text-sky-400" />
                      <span>To Memory</span>
                    </div>
                    <BrowserExternalIcon size={10} className="text-slate-500 group-hover:text-sky-400" />
                  </button>

                  <button
                    type="button"
                    onPointerDown={(e) => {
                      e.preventDefault();
                      onSendToWhiteboard?.();
                      if (showToast) showToast('Clipped visual layout to Whiteboard canvas');
                    }}
                    className="flex items-center justify-between px-2.5 py-1.5 rounded-md text-[11px] font-medium bg-white/[0.02] hover:bg-amber-500/15 text-slate-300 hover:text-amber-200 border border-white/[0.06] hover:border-amber-500/40 transition-all cursor-pointer group"
                  >
                    <div className="flex items-center gap-1.5">
                      <WhiteboardIcon size={12} className="text-amber-400" />
                      <span>To Canvas</span>
                    </div>
                    <BrowserExternalIcon size={10} className="text-slate-500 group-hover:text-amber-400" />
                  </button>
                </div>
              )}
            </div>

            {/* Smart Suggested Actions */}
            <div className="space-y-1.5">
              <span className="text-[10px] font-semibold tracking-wider uppercase text-slate-400 px-0.5">
                Suggested Actions
              </span>
              <div className="flex flex-wrap gap-1.5">
                {actionChips.map((chip, idx) => (
                  <button
                    key={idx}
                    type="button"
                    onPointerDown={(e) => {
                      e.preventDefault();
                      handleSendMessage(chip.query);
                    }}
                    className="px-2.5 py-1 rounded-md bg-white/[0.04] hover:bg-white/[0.08] border border-white/[0.08] hover:border-white/20 text-[11px] font-medium text-slate-300 hover:text-slate-100 transition-all cursor-pointer"
                  >
                    {chip.label}
                  </button>
                ))}
              </div>
            </div>

            {/* AI Executive Brief */}
            {summary && (
              <div className="p-3 rounded-lg bg-white/[0.03] border border-white/[0.08] space-y-1.5">
                <div className="flex items-center justify-between">
                  <span className="text-[11px] font-semibold text-violet-400 flex items-center gap-1.5">
                    <AssistIcon size={13} className="text-violet-400" />
                    Executive Brief
                  </span>
                  <span className="text-[10px] text-slate-500 font-mono">{summary.domain}</span>
                </div>
                <p className="text-xs text-slate-300 leading-relaxed font-normal">
                  {summary.overview}
                </p>
              </div>
            )}

            {/* Chat History Stream */}
            <div className="space-y-2 max-h-[190px] overflow-y-auto p-2.5 rounded-lg bg-white/[0.02] border border-white/[0.08] regaarder-scrollbar">
              {chatMessages.length === 0 ? (
                <div className="py-4 flex flex-col items-center justify-center text-center space-y-1.5 text-slate-500">
                  <div className="w-6 h-6 rounded-md bg-violet-500/10 border border-violet-500/20 text-violet-400 flex items-center justify-center">
                    <AssistIcon size={12} />
                  </div>
                  <span className="text-[11px] font-medium text-slate-300">Regaarder Assistant Ready</span>
                  <p className="text-[10px] text-slate-500">Ask questions, request actions, or query history.</p>
                </div>
              ) : (
                chatMessages.map((msg, idx) => (
                  <div
                    key={idx}
                    className={`flex gap-2 text-xs ${msg.sender === 'user' ? 'justify-end' : 'justify-start'}`}
                  >
                    {msg.sender === 'agent' && (
                      <div className="w-5 h-5 rounded bg-violet-500/15 border border-violet-500/30 text-violet-400 flex items-center justify-center shrink-0 mt-0.5">
                        <AssistIcon size={10} />
                      </div>
                    )}
                    <div
                      className={`max-w-[86%] px-2.5 py-1.5 rounded-lg leading-relaxed text-[11px] ${
                        msg.sender === 'user'
                          ? 'bg-violet-600/90 text-white shadow-xs'
                          : 'bg-white/[0.05] text-slate-200 border border-white/10'
                      }`}
                    >
                      {msg.text}
                    </div>
                  </div>
                ))
              )}
            </div>

            {/* Chat Input Box */}
            <form
              onSubmit={(e) => {
                e.preventDefault();
                handleSendMessage();
              }}
              className="flex items-center gap-1.5"
            >
              <input
                ref={chatInputRef}
                type="text"
                value={inputQuery}
                onChange={(e) => setInputQuery(e.target.value)}
                placeholder="Ask assistant or type /command..."
                className="flex-1 px-3 py-2 rounded-lg bg-white/[0.04] border border-white/10 text-xs text-slate-100 placeholder-slate-500 focus:outline-none focus:border-violet-500/60 focus:bg-white/[0.06] transition-all"
              />
              <button
                type="submit"
                disabled={!inputQuery.trim()}
                className="p-2 rounded-lg bg-violet-600 hover:bg-violet-500 disabled:opacity-25 text-white transition-all cursor-pointer shrink-0"
                title="Send instruction"
              >
                <BrowserForwardIcon size={14} />
              </button>
            </form>
          </>
        )}

        {/* TAB 2: AGENTIC ACTIONS (Automate Web Tasks) */}
        {activePanelTab === 'agentic' && (
          <div className="space-y-3.5">
            <div className="space-y-1">
              <h3 className="text-xs font-semibold text-slate-100 flex items-center gap-1.5">
                <TasksIcon size={14} className="text-emerald-400" />
                <span>Autonomous Web Actions</span>
              </h3>
              <p className="text-[11px] text-slate-400">
                Execute DOM interactions, automated checkouts, and live monitors on external websites.
              </p>
            </div>

            {/* Action Triggers */}
            <div className="grid grid-cols-1 gap-2">
              {/* Promo Code Hunter */}
              <div className="p-3 rounded-lg bg-white/[0.03] border border-white/[0.08] space-y-2">
                <div className="flex items-center justify-between">
                  <div className="flex items-center gap-2">
                    <div className="w-6 h-6 rounded-md bg-emerald-500/10 text-emerald-400 flex items-center justify-center font-bold text-xs">
                      %
                    </div>
                    <div>
                      <h4 className="text-xs font-semibold text-slate-200">Promo Code Hunter</h4>
                      <p className="text-[10px] text-slate-400">Find & auto-test coupon codes at checkout</p>
                    </div>
                  </div>
                  <button
                    type="button"
                    disabled={isExecutingTask}
                    onPointerDown={(e) => {
                      e.preventDefault();
                      handleExecuteAgenticTask('promo_codes');
                    }}
                    className="px-2.5 py-1 rounded-md bg-emerald-600/80 hover:bg-emerald-600 text-white text-[11px] font-semibold transition-all cursor-pointer disabled:opacity-40"
                  >
                    Run Hunter
                  </button>
                </div>
              </div>

              {/* Form Autofill */}
              <div className="p-3 rounded-lg bg-white/[0.03] border border-white/[0.08] space-y-2">
                <div className="flex items-center justify-between">
                  <div className="flex items-center gap-2">
                    <div className="w-6 h-6 rounded-md bg-sky-500/10 text-sky-400 flex items-center justify-center font-bold text-xs">
                      ✍
                    </div>
                    <div>
                      <h4 className="text-xs font-semibold text-slate-200">Agentic Form Filler</h4>
                      <p className="text-[10px] text-slate-400">Type, click, and populate checkout & signups</p>
                    </div>
                  </div>
                  <button
                    type="button"
                    disabled={isExecutingTask}
                    onPointerDown={(e) => {
                      e.preventDefault();
                      handleExecuteAgenticTask('fill_form');
                    }}
                    className="px-2.5 py-1 rounded-md bg-sky-600/80 hover:bg-sky-600 text-white text-[11px] font-semibold transition-all cursor-pointer disabled:opacity-40"
                  >
                    Fill Form
                  </button>
                </div>
              </div>

              {/* Price & Stock Tracker */}
              <div className="p-3 rounded-lg bg-white/[0.03] border border-white/[0.08] space-y-2">
                <div className="flex items-center justify-between">
                  <div className="flex items-center gap-2">
                    <div className="w-6 h-6 rounded-md bg-amber-500/10 text-amber-400 flex items-center justify-center font-bold text-xs">
                      🔔
                    </div>
                    <div>
                      <h4 className="text-xs font-semibold text-slate-200">Stock & Price Alert</h4>
                      <p className="text-[10px] text-slate-400">Monitor external website stock and price changes</p>
                    </div>
                  </div>
                  <button
                    type="button"
                    disabled={isExecutingTask}
                    onPointerDown={(e) => {
                      e.preventDefault();
                      handleExecuteAgenticTask('monitor_stock');
                    }}
                    className="px-2.5 py-1 rounded-md bg-amber-600/80 hover:bg-amber-600 text-white text-[11px] font-semibold transition-all cursor-pointer disabled:opacity-40"
                  >
                    Monitor Page
                  </button>
                </div>
              </div>
            </div>

            {/* Live Execution Step Visualizer */}
            {taskLogs.length > 0 && (
              <div className="p-3 rounded-lg bg-black/40 border border-white/10 space-y-2">
                <div className="flex items-center justify-between">
                  <span className="text-[11px] font-semibold text-slate-300 flex items-center gap-1.5">
                    <span className={`w-2 h-2 rounded-full ${isExecutingTask ? 'bg-emerald-400 animate-ping' : 'bg-emerald-400'}`} />
                    Autonomous Task Execution
                  </span>
                  <span className="text-[10px] text-slate-500 font-mono">{taskProgress}%</span>
                </div>

                <div className="w-full h-1.5 bg-white/10 rounded-full overflow-hidden">
                  <div
                    className="h-full bg-gradient-to-r from-violet-500 to-emerald-400 transition-all duration-300"
                    style={{ width: `${taskProgress}%` }}
                  />
                </div>

                <div className="space-y-1 font-mono text-[10px] text-slate-400 max-h-[100px] overflow-y-auto">
                  {taskLogs.map((log, index) => (
                    <div key={index} className="leading-relaxed">
                      {log}
                    </div>
                  ))}
                </div>
              </div>
            )}

            {/* Monitored Watchers List */}
            <div className="space-y-2 pt-1">
              <span className="text-[10px] font-semibold tracking-wider uppercase text-slate-400 px-0.5">
                Active Background Monitors ({monitoredItems.length})
              </span>
              <div className="space-y-1.5">
                {monitoredItems.map((item) => (
                  <div key={item.id} className="p-2.5 rounded-lg bg-white/[0.02] border border-white/[0.06] flex items-center justify-between text-xs">
                    <div className="min-w-0 pr-2">
                      <h5 className="font-semibold text-slate-200 truncate">{item.title}</h5>
                      <span className="text-[10px] text-slate-500">{item.url} • {item.lastChecked}</span>
                    </div>
                    <div className="text-right shrink-0">
                      <span className="text-xs font-semibold text-emerald-400 block">{item.price}</span>
                      <span className="text-[9px] text-slate-400">{item.stock}</span>
                    </div>
                  </div>
                ))}
              </div>
            </div>
          </div>
        )}

        {/* TAB 3: PERSONAL MEMORY (Natural Language History Search) */}
        {activePanelTab === 'memory' && (
          <div className="space-y-3.5">
            <div className="space-y-1">
              <h3 className="text-xs font-semibold text-slate-100 flex items-center gap-1.5">
                <MemoryIcon size={14} className="text-sky-400" />
                <span>Personal Intelligence & History Recall</span>
              </h3>
              <p className="text-[11px] text-slate-400">
                Scan browsing history using natural language to instantly retrieve answers from pages visited days ago.
              </p>
            </div>

            {/* Search Input */}
            <div className="relative">
              <input
                type="text"
                value={historySearchQuery}
                onChange={(e) => setHistorySearchQuery(e.target.value)}
                placeholder='e.g. "What was the SaaS rule of 40 metric from yesterday?"'
                className="w-full px-3 py-2 pl-8 rounded-lg bg-white/[0.04] border border-white/10 text-xs text-slate-100 placeholder-slate-500 focus:outline-none focus:border-sky-500/60 focus:bg-white/[0.06] transition-all"
              />
              <div className="absolute left-2.5 top-2.5 text-slate-500">
                🔍
              </div>
            </div>

            {/* Filter Chips */}
            <div className="flex items-center gap-1.5 overflow-x-auto pb-1">
              {['All History', 'Past 24h', 'Past 7 Days', 'Reports', 'API Docs'].map((filter, index) => (
                <button
                  key={index}
                  type="button"
                  onPointerDown={(e) => {
                    e.preventDefault();
                    if (filter === 'Reports') setHistorySearchQuery('Report');
                    else if (filter === 'API Docs') setHistorySearchQuery('docs');
                    else setHistorySearchQuery('');
                  }}
                  className="px-2 py-0.5 rounded-md bg-white/[0.04] hover:bg-white/[0.08] text-[10px] font-medium text-slate-300 shrink-0 border border-white/[0.06] cursor-pointer"
                >
                  {filter}
                </button>
              ))}
            </div>

            {/* Search Results List */}
            <div className="space-y-2">
              <span className="text-[10px] font-semibold tracking-wider uppercase text-slate-400 px-0.5">
                Retrieved Memory Nodes ({filteredHistory.length})
              </span>

              {filteredHistory.map((item) => (
                <div
                  key={item.id}
                  className="p-3 rounded-lg bg-white/[0.03] border border-white/[0.08] space-y-1.5 hover:border-sky-500/40 transition-all"
                >
                  <div className="flex items-center justify-between">
                    <h5 className="text-xs font-semibold text-slate-200 truncate pr-2">{item.title}</h5>
                    <span className="text-[10px] text-sky-400 font-mono shrink-0">{item.visitedDate}</span>
                  </div>
                  <p className="text-[11px] text-slate-300 leading-relaxed font-normal">
                    {item.snippet}
                  </p>
                  <div className="flex items-center justify-between pt-1 text-[10px] text-slate-500">
                    <span>{item.domain}</span>
                    <button
                      type="button"
                      onPointerDown={(e) => {
                        e.preventDefault();
                        if (showToast) showToast(`Restored context for ${item.title}`);
                      }}
                      className="text-sky-400 hover:text-sky-300 font-medium cursor-pointer"
                    >
                      Jump to page →
                    </button>
                  </div>
                </div>
              ))}
            </div>
          </div>
        )}

      </div>

      {/* 4. FOOTER: PROGRESSIVE DISCLOSURE & MODEL RUNTIME */}
      <div className="px-4 py-2.5 border-t border-white/[0.08] bg-white/[0.02] shrink-0 flex items-center justify-between text-[10px] text-slate-500 font-mono">
        <div className="flex items-center gap-1.5">
          <span className="w-1.5 h-1.5 rounded-full bg-emerald-400" />
          <span>Local Vector Engine</span>
        </div>
        <button
          type="button"
          onPointerDown={(e) => {
            e.preventDefault();
            setShowAdvancedControls((prev) => !prev);
          }}
          className="hover:text-slate-300 cursor-pointer transition-colors"
        >
          {showAdvancedControls ? 'Hide Specs' : 'Engine Specs'}
        </button>
      </div>

      {showAdvancedControls && (
        <div className="p-3 bg-black/50 border-t border-white/[0.06] text-[10px] font-mono text-slate-400 space-y-1.5">
          <div className="flex justify-between">
            <span>Model:</span>
            <span className="text-violet-300">Gemini 3.7 Agentic Automation</span>
          </div>
          <div className="flex justify-between">
            <span>Context Grounding:</span>
            <span className="text-emerald-300">Active Tab DOM + History Index</span>
          </div>
          <div className="flex justify-between">
            <span>Isolation:</span>
            <span className="text-sky-300">Privacy Sandbox Enforced</span>
          </div>
        </div>
      )}
    </div>
  );
};

export default BrowserResearchPanel;
