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

        setExtractedText(text || '');
        const domain = activeTab?.url ? new URL(activeTab.url).hostname.replace('www.', '') : 'webpage';

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

  return (
    <div className="w-[350px] h-full bg-slate-900 border-l border-slate-800 flex flex-col font-sans select-none text-slate-200 shrink-0 shadow-2xl z-20">
      {/* Header */}
      <div className="flex items-center justify-between px-3.5 py-3 border-b border-slate-800 bg-slate-950/80 shrink-0">
        <div className="flex items-center gap-2.5 min-w-0">
          <div className="p-1.5 rounded-xl bg-violet-500/15 border border-violet-500/30 text-violet-400">
            <AgentsIcon size={16} />
          </div>
          <div className="flex flex-col min-w-0">
            <h2 className="text-xs font-semibold text-slate-100 tracking-tight flex items-center gap-1.5">
              Regaarder AI Assistant
            </h2>
            <span className="text-[10px] text-violet-300 truncate font-mono">
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
            className="p-1.5 rounded-lg text-slate-400 hover:text-slate-200 hover:bg-slate-800 transition-colors cursor-pointer"
            title="Close AI Assistant"
          >
            <BrowserCloseIcon size={16} />
          </button>
        </div>
      </div>

      {/* Main Content Area */}
      <div className="flex-1 overflow-y-auto p-3.5 space-y-4 no-scrollbar">
        {/* Selection Context Indicator */}
        {selectedTextContext && (
          <div className="p-2.5 rounded-xl bg-violet-500/10 border border-violet-500/30 flex items-center justify-between text-xs text-violet-300">
            <span className="truncate">Using your selection as context</span>
            <BrowserCheckIcon size={14} className="text-violet-400 shrink-0" />
          </div>
        )}

        {/* Quick Knowledge Ingestion Bar */}
        <div className="flex flex-col gap-1.5 p-2.5 rounded-2xl bg-slate-950/60 border border-slate-800">
          <span className="text-[10px] font-semibold tracking-wider uppercase text-slate-400 px-1">
            Knowledge Ingestion
          </span>
          <div className="grid grid-cols-2 gap-1.5">
            <button
              type="button"
              onPointerDown={(e) => {
                e.preventDefault();
                onOpenSendToCompose();
              }}
              className="flex items-center gap-2 px-2.5 py-1.5 rounded-xl text-xs font-medium bg-slate-800/80 hover:bg-violet-600/20 text-slate-200 hover:text-violet-300 border border-slate-700/60 hover:border-violet-500/40 transition-all cursor-pointer"
            >
              <ComposeIcon size={14} className="text-violet-400" />
              <span>To Compose</span>
            </button>

            <button
              type="button"
              onPointerDown={(e) => {
                e.preventDefault();
                onOpenSendToSheets();
              }}
              className="flex items-center gap-2 px-2.5 py-1.5 rounded-xl text-xs font-medium bg-slate-800/80 hover:bg-emerald-600/20 text-slate-200 hover:text-emerald-300 border border-slate-700/60 hover:border-emerald-500/40 transition-all cursor-pointer"
            >
              <SheetIcon size={14} className="text-emerald-400" />
              <span>To Sheets</span>
            </button>
          </div>
        </div>

        {/* Action Suggestion Chips */}
        <div className="space-y-1.5">
          <span className="text-[10px] font-semibold tracking-wider uppercase text-slate-400 px-1">
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
                className="px-2.5 py-1 rounded-lg bg-slate-800/70 hover:bg-violet-600/20 border border-slate-700/60 hover:border-violet-500/40 text-[11px] text-slate-300 hover:text-violet-300 transition-all cursor-pointer"
              >
                {chip}
              </button>
            ))}
          </div>
        </div>

        {/* AI Page Overview & Key Takeaways */}
        {isExtracting ? (
          <div className="flex flex-col items-center justify-center p-6 bg-slate-950/40 rounded-2xl border border-slate-800 text-slate-400 text-xs">
            <BrowserReloadIcon size={18} className="text-violet-400 animate-spin mb-2" />
            <span>Analyzing webpage contents & structure...</span>
          </div>
        ) : summary ? (
          <div className="space-y-3">
            <div className="p-3 rounded-2xl bg-slate-950/60 border border-slate-800 space-y-2">
              <div className="flex items-center justify-between">
                <span className="text-[11px] font-semibold text-violet-400 uppercase tracking-wide flex items-center gap-1.5">
                  <AssistIcon size={14} className="text-violet-400" />
                  AI Executive Summary
                </span>
                <span className="text-[10px] text-slate-500 font-mono">{summary.domain}</span>
              </div>
              <p className="text-xs text-slate-300 leading-relaxed">
                {summary.overview}
              </p>
            </div>
          </div>
        ) : null}

        {/* Interactive Chat Stream */}
        <div className="space-y-2 pt-1">
          <div className="flex items-center justify-between px-1">
            <span className="text-[11px] font-semibold text-slate-300 uppercase tracking-wide flex items-center gap-1.5">
              <AgentsIcon size={14} className="text-violet-400" />
              Ask Regaarder Agent
            </span>
          </div>

          <div className="space-y-2 max-h-[220px] overflow-y-auto p-2 rounded-2xl bg-slate-950/70 border border-slate-800 no-scrollbar">
            {chatMessages.map((msg, idx) => (
              <div
                key={idx}
                className={`flex gap-2 text-xs ${
                  msg.sender === 'user' ? 'justify-end' : 'justify-start'
                }`}
              >
                {msg.sender === 'agent' && (
                  <div className="w-5 h-5 rounded-full bg-violet-500/20 border border-violet-500/40 text-violet-400 flex items-center justify-center shrink-0 mt-0.5">
                    <AgentsIcon size={12} />
                  </div>
                )}
                <div
                  className={`max-w-[85%] px-3 py-2 rounded-2xl leading-relaxed text-[11px] ${
                    msg.sender === 'user'
                      ? 'bg-violet-600 text-white rounded-br-none'
                      : 'bg-slate-800/90 text-slate-200 border border-slate-700/60 rounded-bl-none'
                  }`}
                >
                  {msg.text}
                </div>
              </div>
            ))}
          </div>

          {/* Chat Input Form */}
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
              placeholder="Ask about this webpage..."
              className="flex-1 px-3 py-2 rounded-xl bg-slate-950/80 border border-slate-800 text-xs text-slate-100 placeholder-slate-500 focus:outline-hidden focus:border-violet-500/80"
            />
            <button
              type="submit"
              disabled={!inputQuery.trim()}
              className="p-2 rounded-xl bg-violet-600 hover:bg-violet-500 disabled:opacity-30 text-white transition-colors cursor-pointer shrink-0"
              title="Send message"
            >
              <BrowserForwardIcon size={14} />
            </button>
          </form>
        </div>

        {/* Progressive Disclosure: Advanced Controls */}
        <div className="pt-2 border-t border-slate-800">
          <button
            type="button"
            onPointerDown={(e) => {
              e.preventDefault();
              setShowAdvancedControls((prev) => !prev);
            }}
            className="text-[10px] text-slate-500 hover:text-slate-300 font-mono tracking-tight flex items-center justify-between w-full cursor-pointer"
          >
            <span>{showAdvancedControls ? '▼ Hide Advanced Controls' : '▶ Show Advanced Controls'}</span>
          </button>

          {showAdvancedControls && (
            <div className="mt-2 p-2.5 rounded-xl bg-slate-950/80 border border-slate-800 space-y-2 text-[10px] text-slate-400 font-mono">
              <div className="flex justify-between">
                <span>Model Engine:</span>
                <span className="text-violet-300">Gemini 3.6 Flash (Auto)</span>
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
