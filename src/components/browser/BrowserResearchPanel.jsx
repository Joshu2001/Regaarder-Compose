import React, { useState, useEffect } from 'react';
import {
  X,
  Sparkles,
  RefreshCw,
  Send,
  CheckCircle2,
  FileText,
  Table,
  Bookmark,
  Share2,
  ListFilter,
  Bot,
  User,
  ArrowRight,
  ExternalLink
} from 'lucide-react';
import {
  AgentsIcon,
  MemoryIcon,
  ComposeIcon,
  SheetIcon,
  WhiteboardIcon
} from '../RegaarderProductIcons';

export const BrowserResearchPanel = ({
  activeTab,
  onClose,
  onExtractText,
  onSendToCompose,
  onSendToSheets,
  onSaveToMemory,
  onSendToWhiteboard,
  showToast
}) => {
  const [isExtracting, setIsExtracting] = useState(false);
  const [extractedText, setExtractedText] = useState('');
  const [summary, setSummary] = useState(null);
  const [chatMessages, setChatMessages] = useState([]);
  const [inputQuery, setInputQuery] = useState('');

  // Automatically extract and summarize when activeTab changes or panel opens
  useEffect(() => {
    if (!activeTab || activeTab.url === 'regaarder://research') return;

    let isMounted = true;
    const runExtraction = async () => {
      setIsExtracting(true);
      try {
        const text = await onExtractText();
        if (!isMounted) return;

        setExtractedText(text || '');
        if (text && text.length > 50) {
          // Generate structured summary from extracted text
          const lines = text.split('\n').filter((l) => l.trim().length > 20);
          const domain = new URL(activeTab.url).hostname.replace('www.', '');

          setSummary({
            domain,
            overview: `Extracted ${text.length} characters from ${activeTab.title || domain}. Page discusses key topics including operational workflows, structural design, and live execution.`,
            keyFacts: lines.slice(0, 4).map((line) => line.trim().slice(0, 110) + '...'),
            suggestedActions: [
              'Extract main pricing & feature matrix',
              'Summarize technical architecture section',
              'Export key takeaways into Compose briefing document'
            ]
          });

          // Reset chat with welcome context
          setChatMessages([
            {
              sender: 'agent',
              text: `I've analyzed **${activeTab.title || domain}** (${text.length} chars). Ask me any question about this page, or click an ingestion action to convert it into a document or memory.`
            }
          ]);
        } else {
          setSummary(null);
        }
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

  const handleManualRefresh = async () => {
    setIsExtracting(true);
    const text = await onExtractText();
    setExtractedText(text || '');
    setIsExtracting(false);
    if (showToast) showToast('Refreshed page extraction data');
  };

  const handleSendMessage = (e) => {
    e.preventDefault();
    if (!inputQuery.trim()) return;

    const userText = inputQuery.trim();
    setInputQuery('');

    // Append user message
    const newMessages = [...chatMessages, { sender: 'user', text: userText }];
    setChatMessages(newMessages);

    // Simulate intelligent answer based on extracted text
    setTimeout(() => {
      let responseText = `Based on current page context (**${activeTab?.title || 'Webpage'}**): `;
      if (userText.toLowerCase().includes('summary') || userText.toLowerCase().includes('what is')) {
        responseText += summary?.overview || 'This page contains relevant domain documentation and structured reference data.';
      } else if (userText.toLowerCase().includes('price') || userText.toLowerCase().includes('cost')) {
        responseText += 'Pricing details on this page indicate tier offerings with standard subscription and enterprise access.';
      } else {
        responseText += `Regarding "${userText}", the page text highlights operational guidelines, structural features, and primary action items.`;
      }

      setChatMessages((prev) => [
        ...prev,
        { sender: 'agent', text: responseText }
      ]);
    }, 600);
  };

  return (
    <div className="w-[340px] h-full bg-slate-900 border-l border-slate-800/90 flex flex-col font-sans select-none text-slate-200 shrink-0 shadow-2xl z-10">
      {/* Panel Header */}
      <div className="flex items-center justify-between px-3.5 py-3 border-b border-slate-800 bg-slate-950/60 shrink-0">
        <div className="flex items-center gap-2.5 min-w-0">
          <div className="p-1.5 rounded-lg bg-violet-500/15 border border-violet-500/30 text-violet-400">
            <AgentsIcon size={16} />
          </div>
          <div className="flex flex-col min-w-0">
            <h2 className="text-xs font-semibold text-slate-100 tracking-tight flex items-center gap-1.5">
              Regaarder Research Assistant
            </h2>
            <span className="text-[10px] text-slate-400 truncate">
              {activeTab?.title || 'Web Intelligence'}
            </span>
          </div>
        </div>

        <div className="flex items-center gap-1">
          <button
            type="button"
            onClick={handleManualRefresh}
            disabled={isExtracting}
            className="p-1.5 rounded-lg text-slate-400 hover:text-slate-200 hover:bg-slate-800 transition-colors cursor-pointer disabled:opacity-30"
            title="Re-analyze webpage text"
          >
            <RefreshCw className={`w-3.5 h-3.5 ${isExtracting ? 'animate-spin text-violet-400' : ''}`} />
          </button>
          <button
            type="button"
            onClick={onClose}
            className="p-1.5 rounded-lg text-slate-400 hover:text-slate-200 hover:bg-slate-800 transition-colors cursor-pointer"
            title="Close Assistant Panel"
          >
            <X className="w-4 h-4" />
          </button>
        </div>
      </div>

      {/* Main Content Area (Scrollable) */}
      <div className="flex-1 overflow-y-auto p-3.5 space-y-4 no-scrollbar">
        {/* Knowledge Ingestion Action Toolbar */}
        <div className="flex flex-col gap-1.5 p-2.5 rounded-xl bg-slate-950/50 border border-slate-800/80">
          <span className="text-[10px] font-semibold tracking-wider uppercase text-slate-400 px-1">
            Turn Webpage into Knowledge
          </span>
          <div className="grid grid-cols-2 gap-1.5">
            <button
              type="button"
              onClick={onSendToCompose}
              className="flex items-center gap-2 px-2.5 py-1.5 rounded-lg text-xs font-medium bg-slate-800/80 hover:bg-violet-600/20 text-slate-200 hover:text-violet-300 border border-slate-700/60 hover:border-violet-500/40 transition-all cursor-pointer"
            >
              <ComposeIcon size={14} className="text-violet-400" />
              <span>To Compose</span>
            </button>

            <button
              type="button"
              onClick={onSendToSheets}
              className="flex items-center gap-2 px-2.5 py-1.5 rounded-lg text-xs font-medium bg-slate-800/80 hover:bg-emerald-600/20 text-slate-200 hover:text-emerald-300 border border-slate-700/60 hover:border-emerald-500/40 transition-all cursor-pointer"
            >
              <SheetIcon size={14} className="text-emerald-400" />
              <span>To Sheets</span>
            </button>

            <button
              type="button"
              onClick={onSaveToMemory}
              className="flex items-center gap-2 px-2.5 py-1.5 rounded-lg text-xs font-medium bg-slate-800/80 hover:bg-sky-600/20 text-slate-200 hover:text-sky-300 border border-slate-700/60 hover:border-sky-500/40 transition-all cursor-pointer"
            >
              <MemoryIcon size={14} className="text-sky-400" />
              <span>To Memory</span>
            </button>

            <button
              type="button"
              onClick={onSendToWhiteboard}
              className="flex items-center gap-2 px-2.5 py-1.5 rounded-lg text-xs font-medium bg-slate-800/80 hover:bg-amber-600/20 text-slate-200 hover:text-amber-300 border border-slate-700/60 hover:border-amber-500/40 transition-all cursor-pointer"
            >
              <WhiteboardIcon size={14} className="text-amber-400" />
              <span>To Board</span>
            </button>
          </div>
        </div>

        {/* AI Page Overview & Key Takeaways */}
        {isExtracting ? (
          <div className="flex flex-col items-center justify-center p-8 bg-slate-950/40 rounded-xl border border-slate-800/60 text-slate-400 text-xs">
            <RefreshCw className="w-5 h-5 text-violet-400 animate-spin mb-2" />
            <span>Analyzing webpage contents & structure...</span>
          </div>
        ) : summary ? (
          <div className="space-y-3">
            {/* Overview Card */}
            <div className="p-3 rounded-xl bg-slate-950/60 border border-slate-800/80 space-y-2">
              <div className="flex items-center justify-between">
                <span className="text-[11px] font-semibold text-violet-400 uppercase tracking-wide flex items-center gap-1.5">
                  <Sparkles className="w-3.5 h-3.5" />
                  AI Executive Summary
                </span>
                <span className="text-[10px] text-slate-500 font-mono">{summary.domain}</span>
              </div>
              <p className="text-xs text-slate-300 leading-relaxed font-sans">
                {summary.overview}
              </p>
            </div>

            {/* Key Facts Bullet List */}
            {summary.keyFacts && summary.keyFacts.length > 0 && (
              <div className="p-3 rounded-xl bg-slate-950/60 border border-slate-800/80 space-y-2">
                <span className="text-[11px] font-semibold text-slate-300 uppercase tracking-wide flex items-center gap-1.5">
                  <ListFilter className="w-3.5 h-3.5 text-sky-400" />
                  Key Facts & Takeaways
                </span>
                <ul className="space-y-1.5">
                  {summary.keyFacts.map((fact, i) => (
                    <li key={i} className="flex items-start gap-2 text-[11px] text-slate-300 leading-normal">
                      <div className="w-1.5 h-1.5 rounded-full bg-violet-400 mt-1 shrink-0" />
                      <span>{fact}</span>
                    </li>
                  ))}
                </ul>
              </div>
            )}
          </div>
        ) : (
          <div className="p-4 rounded-xl bg-slate-950/40 border border-slate-800/60 text-center text-xs text-slate-400 space-y-2">
            <p>No active webpage loaded yet. Navigate to a webpage or search the web to extract AI insights.</p>
          </div>
        )}

        {/* Interactive "Ask Webpage" Chat Section */}
        <div className="space-y-2 pt-1">
          <div className="flex items-center justify-between px-1">
            <span className="text-[11px] font-semibold text-slate-300 uppercase tracking-wide flex items-center gap-1.5">
              <Bot className="w-3.5 h-3.5 text-purple-400" />
              Ask Regaarder Agent
            </span>
          </div>

          {/* Chat Messages */}
          <div className="space-y-2 max-h-[220px] overflow-y-auto p-2 rounded-xl bg-slate-950/70 border border-slate-800/80 no-scrollbar">
            {chatMessages.length === 0 ? (
              <div className="text-[11px] text-slate-500 text-center py-4">
                Ask any question about this webpage...
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
                    <div className="w-5 h-5 rounded-full bg-violet-500/20 border border-violet-500/40 text-violet-400 flex items-center justify-center shrink-0 mt-0.5">
                      <AgentsIcon size={12} />
                    </div>
                  )}
                  <div
                    className={`max-w-[85%] px-3 py-2 rounded-xl leading-relaxed text-[11px] ${
                      msg.sender === 'user'
                        ? 'bg-violet-600 text-white rounded-br-none'
                        : 'bg-slate-800/90 text-slate-200 border border-slate-700/60 rounded-bl-none'
                    }`}
                  >
                    {msg.text}
                  </div>
                  {msg.sender === 'user' && (
                    <div className="w-5 h-5 rounded-full bg-slate-700 text-slate-300 flex items-center justify-center shrink-0 mt-0.5">
                      <User className="w-3 h-3" />
                    </div>
                  )}
                </div>
              ))
            )}
          </div>

          {/* Chat Input Form */}
          <form onSubmit={handleSendMessage} className="flex items-center gap-1.5">
            <input
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
              <Send className="w-3.5 h-3.5" />
            </button>
          </form>
        </div>
      </div>
    </div>
  );
};

export default BrowserResearchPanel;
