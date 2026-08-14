import React, { useState, useEffect, useRef } from 'react';
import {
  BrowserCloseIcon,
  BrowserReloadIcon,
  BrowserForwardIcon,
  BrowserCheckIcon
} from './RegaarderBrowserIcons';
import {
  AgentsIcon,
  MemoryIcon,
  ComposeIcon,
  SheetIcon,
  WhiteboardIcon,
  DeckIcon,
  RoomIcon,
  AssistIcon
} from '../RegaarderProductIcons';

/**
 * BrowserResearchPanel: Regaarder AI Research Assistant Sidebar
 * Implements context auto-attachment ("I'm looking at this page with you"), selection detection,
 * suggested action chips, and progressive disclosure for advanced model controls.
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
  const [isExtracting, setIsExtracting] = useState(false);
  const [extractedText, setExtractedText] = useState('');
  const [summary, setSummary] = useState(null);
  const [chatMessages, setChatMessages] = useState([]);
  const [inputQuery, setInputQuery] = useState('');
  const [selectedTextContext, setSelectedTextContext] = useState('');
  const [showAdvancedControls, setShowAdvancedControls] = useState(false);
  const chatInputRef = useRef(null);

  // Check selection and automatically attach context
  useEffect(() => {
    const sel = window.getSelection()?.toString().trim();
    if (sel && sel.length > 0) {
      setSelectedTextContext(sel.slice(0, 160));
    }
  }, []);

  // Auto-focus input on mount
  useEffect(() => {
    if (chatInputRef.current) {
      chatInputRef.current.focus();
    }
  }, []);

  // Extract page context on active tab load
  useEffect(() => {
    if (!activeTab || activeTab.url === 'regaarder://research' || activeTab.url === 'regaarder://saved') return;

    let isMounted = true;
    const runExtraction = async () => {
      setIsExtracting(true);
      try {
        const text = await onExtractText();
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

        setSummary({
          domain,
          overview: `Analyzing ${activeTab?.title || domain}. Document contains key specifications, structural architecture, and live data metrics.`,
          keyFacts: [
            'Core infrastructure designed with Apple-style progressive disclosure.',
            'Direct single-click execution for all primary interaction workflows.',
            'Automatic context detection for text selections and 2D grid matrix tables.'
          ]
        });

        setChatMessages([
          {
            sender: 'agent',
            text: `I'm looking at this page with you (**${activeTab?.title || domain}**). Ask me any question, or ask me to run one of your saved **Flows**.`
          }
        ]);
      } catch (err) {
        console.error('Error during AI page extraction:', err);
      } finally {
        if (isMounted) setIsExtracting(false);
      }
    };

    runExtraction();

    return () => {
      isMounted = false;
    };
  }, [activeTab?.id, activeTab?.url]);

  const handleSendMessage = (textToSend) => {
    const userText = textToSend || inputQuery.trim();
    if (!userText) return;

    if (!textToSend) setInputQuery('');

    const newMessages = [...chatMessages, { sender: 'user', text: userText }];
    setChatMessages(newMessages);

    // Check for Flow execution intent
    const isFlowRequest = /\b(run|execute|repeat)\b.*\b(flow|pricing|competitor|market|lead|grant)\b/i.test(userText);

    setTimeout(() => {
      if (isFlowRequest && onRunFlowRequested) {
        // Extract parameters if provided
        const forMatch = userText.match(/\bfor\s+(.+)$/i);
        const companies = forMatch ? forMatch[1].trim() : 'Notion, Asana, Monday, ClickUp';
        
        setChatMessages((prev) => [
          ...prev,
          {
            sender: 'agent',
            text: `⚡ Recognized saved Flow request: **Competitor Pricing Research** with inputs: \`${companies}\`. Launching adaptive execution...`
          }
        ]);

        onRunFlowRequested({
          name: 'Competitor Pricing Research',
          id: 'flow-competitor-pricing',
          inputs: [{ name: 'companies', defaultValue: companies.split(',').map((s) => s.trim()) }]
        }, { companies });
      } else {
        let responseText = `Regarding "${userText}" on **${activeTab?.title || 'Webpage'}**: `;
        if (selectedTextContext) {
          responseText += `Analyzing selection context ("${selectedTextContext.slice(0, 40)}..."). `;
        }
        responseText += 'The page structure confirms operational parameters with zero superficial popups and full deterministic execution.';

        setChatMessages((prev) => [
          ...prev,
          { sender: 'agent', text: responseText }
        ]);
      }
    }, 450);
  };

  const actionChips = [
    'Run Competitor Flow',
    'Summarize',
    'Explain',
    'Extract key facts',
    'Analyze',
    'Compare'
  ];

  const [ingestionMenuOpen, setIngestionMenuOpen] = useState(false);
  const [selectedDestination, setSelectedDestination] = useState('Compose');

  const destinations = [
    { id: 'Compose', name: 'Compose', icon: ComposeIcon, color: 'text-indigo-400', action: onOpenSendToCompose },
    { id: 'Sheets', name: 'Sheets', icon: SheetIcon, color: 'text-emerald-400', action: onOpenSendToSheets },
    { id: 'Whiteboard', name: 'Whiteboard', icon: WhiteboardIcon, color: 'text-amber-400', action: onSendToWhiteboard },
    { id: 'Memory', name: 'Memory', icon: MemoryIcon, color: 'text-sky-400', action: onSaveToMemory }
  ];

  return (
    <div className="w-[350px] h-full bg-[#12141C]/90 backdrop-blur-2xl border-l border-white/[0.08] flex flex-col font-sans select-none text-slate-200 shrink-0 shadow-2xl z-20">
      {/* Header */}
      <div className="flex items-center justify-between px-4 py-3.5 border-b border-white/[0.08] bg-white/[0.02] shrink-0">
        <div className="flex items-center gap-2.5 min-w-0">
          <div className="p-1.5 rounded-lg bg-indigo-500/10 border border-indigo-500/20 text-indigo-400 shrink-0">
            <AgentsIcon size={15} />
          </div>
          <div className="flex flex-col min-w-0">
            <h2 className="text-[13px] font-medium text-slate-100 tracking-tight">
              Regaarder AI Assistant
            </h2>
            <span className="text-[11px] text-slate-400 truncate">
              I'm looking at this page with you
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
            className="p-1.5 rounded-md text-slate-400 hover:text-slate-200 hover:bg-white/[0.06] transition-all cursor-pointer"
            title="Close AI Assistant"
          >
            <BrowserCloseIcon size={15} />
          </button>
        </div>
      </div>

      {/* Main Content Area with Custom Apple-Style Contextual Scrollbar */}
      <div className="flex-1 overflow-y-auto p-4 space-y-5 regaarder-scrollbar">
        {/* Selection Context Indicator */}
        {selectedTextContext && (
          <div className="p-2.5 rounded-lg bg-indigo-500/10 border border-indigo-500/20 flex items-center justify-between text-xs text-indigo-300">
            <span className="truncate font-medium">Using selection context</span>
            <BrowserCheckIcon size={14} className="text-indigo-400 shrink-0" />
          </div>
        )}

        {/* Quick Knowledge Ingestion Section with Workspace Arrow Dispatcher */}
        <div className="flex flex-col gap-2 p-3 rounded-xl bg-white/[0.03] border border-white/[0.08]">
          <div className="flex items-center justify-between px-0.5">
            <span className="text-[10px] font-medium tracking-wider uppercase text-slate-400">
              Knowledge Ingestion
            </span>
            <button
              type="button"
              onPointerDown={(e) => {
                e.preventDefault();
                setIngestionMenuOpen((prev) => !prev);
              }}
              className="flex items-center gap-1 text-[10px] text-indigo-400 hover:text-indigo-300 font-medium cursor-pointer transition-all"
            >
              <span>{ingestionMenuOpen ? 'Hide Workspaces' : 'All Workspaces'}</span>
              <span className={`text-[9px] transform transition-transform ${ingestionMenuOpen ? 'rotate-180' : ''}`}>▼</span>
            </button>
          </div>

          {/* Primary Quick Ingestion Options */}
          <div className="grid grid-cols-2 gap-2">
            <button
              type="button"
              onPointerDown={(e) => {
                e.preventDefault();
                onOpenSendToCompose?.(e.currentTarget.getBoundingClientRect());
              }}
              className="flex items-center justify-between px-3 py-2 rounded-lg text-xs font-medium bg-white/[0.04] hover:bg-indigo-500/15 text-slate-200 hover:text-indigo-200 border border-white/10 hover:border-indigo-500/40 transition-all cursor-pointer group"
            >
              <div className="flex items-center gap-2">
                <ComposeIcon size={14} className="text-indigo-400" />
                <span>To Compose</span>
              </div>
              <span className="text-[10px] text-slate-500 group-hover:text-indigo-400">↗</span>
            </button>

            <button
              type="button"
              onPointerDown={(e) => {
                e.preventDefault();
                onOpenSendToSheets?.(e.currentTarget.getBoundingClientRect());
              }}
              className="flex items-center justify-between px-3 py-2 rounded-lg text-xs font-medium bg-white/[0.04] hover:bg-emerald-500/15 text-slate-200 hover:text-emerald-200 border border-white/10 hover:border-emerald-500/40 transition-all cursor-pointer group"
            >
              <div className="flex items-center gap-2">
                <SheetIcon size={14} className="text-emerald-400" />
                <span>To Sheets</span>
              </div>
              <span className="text-[10px] text-slate-500 group-hover:text-emerald-400">↗</span>
            </button>
          </div>

          {/* Expanded Full Workspace Navigation & Ingestion Grid */}
          {ingestionMenuOpen && (
            <div className="pt-2 border-t border-white/[0.06] grid grid-cols-2 gap-2 animate-in fade-in zoom-in-95 duration-150">
              <button
                type="button"
                onPointerDown={(e) => {
                  e.preventDefault();
                  onSendToWhiteboard?.();
                }}
                className="flex items-center justify-between px-3 py-1.5 rounded-lg text-[11px] font-medium bg-white/[0.02] hover:bg-amber-500/15 text-slate-300 hover:text-amber-200 border border-white/[0.06] hover:border-amber-500/40 transition-all cursor-pointer group"
              >
                <div className="flex items-center gap-2">
                  <WhiteboardIcon size={13} className="text-amber-400" />
                  <span>To Canvas</span>
                </div>
                <span className="text-[9px] text-slate-500 group-hover:text-amber-400">↗</span>
              </button>

              <button
                type="button"
                onPointerDown={(e) => {
                  e.preventDefault();
                  onSaveToMemory?.();
                }}
                className="flex items-center justify-between px-3 py-1.5 rounded-lg text-[11px] font-medium bg-white/[0.02] hover:bg-sky-500/15 text-slate-300 hover:text-sky-200 border border-white/[0.06] hover:border-sky-500/40 transition-all cursor-pointer group"
              >
                <div className="flex items-center gap-2">
                  <MemoryIcon size={13} className="text-sky-400" />
                  <span>To Memory</span>
                </div>
                <span className="text-[9px] text-slate-500 group-hover:text-sky-400">↗</span>
              </button>

              <button
                type="button"
                onPointerDown={(e) => {
                  e.preventDefault();
                  showToast?.('Exported summary to Deck presentation slides');
                }}
                className="flex items-center justify-between px-3 py-1.5 rounded-lg text-[11px] font-medium bg-white/[0.02] hover:bg-rose-500/15 text-slate-300 hover:text-rose-200 border border-white/[0.06] hover:border-rose-500/40 transition-all cursor-pointer group"
              >
                <div className="flex items-center gap-2">
                  <DeckIcon size={13} className="text-rose-400" />
                  <span>To Deck</span>
                </div>
                <span className="text-[9px] text-slate-500 group-hover:text-rose-400">↗</span>
              </button>

              <button
                type="button"
                onPointerDown={(e) => {
                  e.preventDefault();
                  showToast?.('Shared research brief to Room meeting canvas');
                }}
                className="flex items-center justify-between px-3 py-1.5 rounded-lg text-[11px] font-medium bg-white/[0.02] hover:bg-purple-500/15 text-slate-300 hover:text-purple-200 border border-white/[0.06] hover:border-purple-500/40 transition-all cursor-pointer group"
              >
                <div className="flex items-center gap-2">
                  <RoomIcon size={13} className="text-purple-400" />
                  <span>To Room</span>
                </div>
                <span className="text-[9px] text-slate-500 group-hover:text-purple-400">↗</span>
              </button>
            </div>
          )}
        </div>

        {/* Action Suggestion Chips */}
        <div className="space-y-2">
          <span className="text-[10px] font-medium tracking-wider uppercase text-slate-400 px-0.5">
            Suggested Actions
          </span>
          <div className="flex flex-wrap gap-1.5">
            {actionChips.map((chip) => (
              <button
                key={chip}
                type="button"
                onPointerDown={(e) => {
                  e.preventDefault();
                  handleSendMessage(`${chip} the current page content`);
                }}
                className="px-2.5 py-1.5 rounded-lg bg-white/[0.04] hover:bg-white/[0.08] border border-white/[0.08] hover:border-white/20 text-[11px] font-medium text-slate-300 hover:text-slate-100 transition-all cursor-pointer"
              >
                {chip}
              </button>
            ))}
          </div>
        </div>

        {/* AI Page Overview & Key Takeaways */}
        {isExtracting ? (
          <div className="flex flex-col items-center justify-center p-6 bg-white/[0.02] rounded-xl border border-white/[0.08] text-slate-400 text-xs">
            <BrowserReloadIcon size={16} className="text-indigo-400 animate-spin mb-2" />
            <span>Analyzing webpage structure...</span>
          </div>
        ) : summary ? (
          <div className="space-y-3">
            <div className="p-3.5 rounded-xl bg-white/[0.03] border border-white/[0.08] space-y-2">
              <div className="flex items-center justify-between">
                <span className="text-[11px] font-medium text-indigo-400 flex items-center gap-1.5">
                  <AssistIcon size={14} className="text-indigo-400" />
                  AI Executive Summary
                </span>
                <span className="text-[10px] text-slate-500 font-mono">{summary.domain}</span>
              </div>
              <p className="text-xs text-slate-300 leading-relaxed font-normal">
                {summary.overview}
              </p>
            </div>
          </div>
        ) : (
          /* Summary Empty State */
          <div className="p-4 rounded-xl bg-white/[0.02] border border-white/[0.06] flex flex-col items-center text-center text-slate-400 space-y-1.5">
            <AssistIcon size={18} className="text-slate-500 opacity-60" />
            <span className="text-xs font-medium text-slate-300">Ready for Page Intelligence</span>
            <p className="text-[11px] text-slate-500 leading-normal">
              Select any text or click a suggested action above to generate a brief.
            </p>
          </div>
        )}

        {/* Interactive Chat Stream */}
        <div className="space-y-2.5 pt-1">
          <div className="flex items-center justify-between px-0.5">
            <span className="text-[11px] font-medium text-slate-400 uppercase tracking-wider flex items-center gap-1.5">
              <AgentsIcon size={13} className="text-indigo-400" />
              Ask Regaarder Agent
            </span>
          </div>

          <div className="space-y-2 max-h-[220px] overflow-y-auto p-3 rounded-xl bg-white/[0.02] border border-white/[0.08] regaarder-scrollbar">
            {chatMessages.length === 0 ? (
              /* Chat Empty State */
              <div className="py-6 flex flex-col items-center justify-center text-center space-y-2 text-slate-500">
                <div className="w-7 h-7 rounded-lg bg-indigo-500/10 border border-indigo-500/20 text-indigo-400 flex items-center justify-center">
                  <AgentsIcon size={14} />
                </div>
                <div className="space-y-0.5">
                  <span className="text-xs font-medium text-slate-300 block">No Active Messages</span>
                  <p className="text-[10px] text-slate-500">Ask a question about this page to start.</p>
                </div>
              </div>
            ) : (
              chatMessages.map((msg, idx) => (
                <div
                  key={idx}
                  className={`flex gap-2 text-xs ${
                    msg.sender === 'user' ? 'justify-end' : 'justify-start'
                  }`}
                >
                  {msg.sender === 'agent' && (
                    <div className="w-5 h-5 rounded-md bg-indigo-500/10 border border-indigo-500/20 text-indigo-400 flex items-center justify-center shrink-0 mt-0.5">
                      <AgentsIcon size={11} />
                    </div>
                  )}
                  <div
                    className={`max-w-[85%] px-3 py-2 rounded-lg leading-relaxed text-[11px] ${
                      msg.sender === 'user'
                        ? 'bg-indigo-600/90 text-white shadow-xs'
                        : 'bg-white/[0.05] text-slate-200 border border-white/10'
                    }`}
                  >
                    {msg.text}
                  </div>
                </div>
              ))
            )}
          </div>

          {/* Chat Input Form */}
          <form
            onSubmit={(e) => {
              e.preventDefault();
              handleSendMessage();
            }}
            className="flex items-center gap-2"
          >
            <input
              ref={chatInputRef}
              type="text"
              value={inputQuery}
              onChange={(e) => setInputQuery(e.target.value)}
              placeholder="Ask about this webpage..."
              className="flex-1 px-3 py-2 rounded-lg bg-white/[0.04] border border-white/10 text-xs text-slate-100 placeholder-slate-500 focus:outline-none focus:border-indigo-500/60 focus:bg-white/[0.06] transition-all"
            />
            <button
              type="submit"
              disabled={!inputQuery.trim()}
              className="p-2 rounded-lg bg-indigo-600 hover:bg-indigo-500 disabled:opacity-25 text-white transition-all cursor-pointer shrink-0"
              title="Send message"
            >
              <BrowserForwardIcon size={14} />
            </button>
          </form>
        </div>

        {/* Progressive Disclosure: Advanced Controls */}
        <div className="pt-2 border-t border-white/[0.08]">
          <button
            type="button"
            onPointerDown={(e) => {
              e.preventDefault();
              setShowAdvancedControls((prev) => !prev);
            }}
            className="text-[10px] text-slate-500 hover:text-slate-400 font-mono tracking-tight flex items-center justify-between w-full cursor-pointer py-1"
          >
            <span>{showAdvancedControls ? '▼ Hide Advanced Controls' : '▶ Show Advanced Controls'}</span>
          </button>

          {showAdvancedControls && (
            <div className="mt-2 p-2.5 rounded-lg bg-white/[0.02] border border-white/[0.06] space-y-2 text-[10px] text-slate-400 font-mono">
              <div className="flex justify-between">
                <span>Model Engine:</span>
                <span className="text-indigo-300">Gemini 3.6 Flash (Auto)</span>
              </div>
              <div className="flex justify-between">
                <span>Extraction Mode:</span>
                <span className="text-emerald-300">Intelligent DOM Vector</span>
              </div>
              <div className="flex justify-between">
                <span>Memory Persistence:</span>
                <span className="text-sky-300">Active</span>
              </div>
            </div>
          )}
        </div>
      </div>
    </div>
  );
};

export default BrowserResearchPanel;
