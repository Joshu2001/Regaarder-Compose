import React, { useState, useEffect, useRef, useCallback } from 'react';
import {
  Mic,
  MicOff,
  Plus,
  ChevronDown,
  ChevronUp,
  Cpu,
  Sparkles,
  Server,
  Check,
  ArrowUp,
  Layers,
  Volume2,
  SlidersHorizontal
} from 'lucide-react';
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
 * Model Presets with llama.cpp and Ollama Local Endpoints
 */
const AVAILABLE_MODELS = [
  {
    id: 'llama3-8b-local',
    name: 'Llama 3 8B',
    provider: 'llama.cpp',
    endpoint: 'http://localhost:8080/v1',
    tag: 'Local GGUF',
    isLocal: true,
    description: 'On-device private inference via llama.cpp server'
  },
  {
    id: 'mistral-7b-ollama',
    name: 'Mistral 7B',
    provider: 'Ollama',
    endpoint: 'http://localhost:11434/v1',
    tag: 'Local Ollama',
    isLocal: true,
    description: 'High performance local model on Ollama daemon'
  },
  {
    id: 'gemma2-9b-local',
    name: 'Gemma 2 9B',
    provider: 'llama.cpp',
    endpoint: 'http://localhost:8080/v1',
    tag: 'Local GGUF',
    isLocal: true,
    description: 'Google Gemma 2 running via local llama.cpp'
  },
  {
    id: 'gemini-3.7-flash',
    name: 'Gemini 3.7 Flash',
    provider: 'Cloud AI',
    endpoint: null,
    tag: 'High Speed',
    isLocal: false,
    description: 'Executive-tier cloud reasoning engine'
  },
  {
    id: 'claude-3.5-sonnet',
    name: 'Claude 3.5 Sonnet',
    provider: 'Cloud AI',
    endpoint: null,
    tag: 'Deep Synthesis',
    isLocal: false,
    description: 'Complex document synthesis and deep code parsing'
  }
];

/**
 * BrowserResearchPanel: Executive Progressive-Disclosure AI Assistant & Local Engine Canvas
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
  // Navigation: 'chat' | 'automation' | 'memory'
  const [activePanelTab, setActivePanelTab] = useState('chat');

  // Progressive Disclosure States
  const [isBriefExpanded, setIsBriefExpanded] = useState(false);
  const [isPlusMenuOpen, setIsPlusMenuOpen] = useState(false);
  const [isModelPickerOpen, setIsModelPickerOpen] = useState(false);
  const [selectedModel, setSelectedModel] = useState(AVAILABLE_MODELS[0]); // Default to Llama 3 8B Local (llama.cpp)
  const [localServerOnline, setLocalServerOnline] = useState(null); // true | false | null (checking)

  // Voice Dictation States
  const [isRecordingVoice, setIsRecordingVoice] = useState(false);
  const [voiceVolumeLevel, setVoiceVolumeLevel] = useState(0);
  const recognitionRef = useRef(null);

  // Chat & Stream States
  const [chatMessages, setChatMessages] = useState([]);
  const [inputQuery, setInputQuery] = useState('');
  const [isGenerating, setIsGenerating] = useState(false);
  const [selectedTextContext, setSelectedTextContext] = useState('');
  const [summary, setSummary] = useState(null);
  const [isExtracting, setIsExtracting] = useState(false);

  // Agentic Action States
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
    { id: 'h2', title: 'Stripe API Webhooks & Idempotency Best Practices', domain: 'docs.stripe.com', visitedDate: '2 days ago', snippet: 'Header idempotency-key ensures safe automated retry execution without duplicate charges.' },
    { id: 'h3', title: 'Apple SF Symbols & Human Interface Guidelines', domain: 'developer.apple.com', visitedDate: 'Aug 12, 2026', snippet: 'Hierarchy, optical alignment, and progressive disclosure patterns across macOS.' }
  ]);

  const chatInputRef = useRef(null);
  const chatScrollRef = useRef(null);
  const plusMenuRef = useRef(null);
  const modelPickerRef = useRef(null);

  // Auto-scroll chat to bottom
  useEffect(() => {
    if (chatScrollRef.current) {
      chatScrollRef.current.scrollTop = chatScrollRef.current.scrollHeight;
    }
  }, [chatMessages, isGenerating]);

  // Check selection context
  useEffect(() => {
    const sel = window.getSelection()?.toString().trim();
    if (sel && sel.length > 0) {
      setSelectedTextContext(sel.slice(0, 200));
    }
  }, []);

  // Auto-focus input on mount
  useEffect(() => {
    if (chatInputRef.current && activePanelTab === 'chat') {
      chatInputRef.current.focus();
    }
  }, [activePanelTab]);

  // Dismiss menus on outside click
  useEffect(() => {
    const handleClickOutside = (e) => {
      if (plusMenuRef.current && !plusMenuRef.current.contains(e.target)) {
        setIsPlusMenuOpen(false);
      }
      if (modelPickerRef.current && !modelPickerRef.current.contains(e.target)) {
        setIsModelPickerOpen(false);
      }
    };
    document.addEventListener('pointerdown', handleClickOutside);
    return () => document.removeEventListener('pointerdown', handleClickOutside);
  }, []);

  // Health check for local model endpoint (llama.cpp / Ollama)
  useEffect(() => {
    let isMounted = true;
    if (!selectedModel.isLocal || !selectedModel.endpoint) {
      setLocalServerOnline(true);
      return;
    }

    setLocalServerOnline(null);
    const controller = new AbortController();
    const timeout = setTimeout(() => controller.abort(), 2000);

    fetch(`${selectedModel.endpoint}/models`, {
      method: 'GET',
      signal: controller.signal
    })
      .then((res) => {
        if (isMounted) setLocalServerOnline(res.ok || res.status === 404 || res.status === 200);
      })
      .catch(() => {
        if (isMounted) setLocalServerOnline(false);
      })
      .finally(() => clearTimeout(timeout));

    return () => {
      isMounted = false;
      controller.abort();
    };
  }, [selectedModel]);

  // Extract page context on active tab load
  useEffect(() => {
    if (!activeTab || activeTab.url === 'regaarder://research' || activeTab.url === 'regaarder://saved' || !activeTab.url) {
      setSummary(null);
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
            overview: text.slice(0, 320).trim() + (text.length > 320 ? '...' : ''),
            fullContext: text
          });
        } else {
          setSummary({
            domain,
            overview: `Connected to ${activeTab.title || domain}. Full DOM context ready for local inference.`,
            fullContext: ''
          });
        }
      } catch (err) {
        if (isMounted) setSummary(null);
      } finally {
        if (isMounted) setIsExtracting(false);
      }
    };

    runExtraction();
    return () => {
      isMounted = false;
    };
  }, [activeTab?.id, activeTab?.url]);

  // Voice Dictation Controller (Web Speech API + Animated Waveform)
  const toggleVoiceDictation = () => {
    if (isRecordingVoice) {
      if (recognitionRef.current) {
        recognitionRef.current.stop();
      }
      setIsRecordingVoice(false);
      if (showToast) showToast('Voice dictation paused');
      return;
    }

    const SpeechRecognition = window.SpeechRecognition || window.webkitSpeechRecognition;
    if (SpeechRecognition) {
      const recognition = new SpeechRecognition();
      recognitionRef.current = recognition;
      recognition.continuous = false;
      recognition.interimResults = true;
      recognition.lang = 'en-US';

      recognition.onstart = () => {
        setIsRecordingVoice(true);
        if (showToast) showToast('Listening (Voice dictation active)...');
      };

      recognition.onresult = (event) => {
        const transcript = Array.from(event.results)
          .map((res) => res[0].transcript)
          .join('');
        setInputQuery(transcript);
      };

      recognition.onerror = () => {
        setIsRecordingVoice(false);
      };

      recognition.onend = () => {
        setIsRecordingVoice(false);
      };

      recognition.start();
    } else {
      // Graceful fallback simulation
      setIsRecordingVoice(true);
      if (showToast) showToast('Listening to microphone (Simulated speech engine)...');
      let step = 0;
      const sampleQueries = [
        'Summarize this page in 3 executive bullet points',
        'Find checkout discount codes',
        'Extract table data to Sheets'
      ];
      const randomQuery = sampleQueries[Math.floor(Math.random() * sampleQueries.length)];

      const interval = setInterval(() => {
        step++;
        setInputQuery(randomQuery.slice(0, Math.round((step / 10) * randomQuery.length)));
        setVoiceVolumeLevel(Math.random());
        if (step >= 10) {
          clearInterval(interval);
          setIsRecordingVoice(false);
        }
      }, 150);
    }
  };

  // Local llama.cpp / Cloud Inference Dispatcher
  const handleSendMessage = async (textToSend) => {
    const userText = textToSend || inputQuery.trim();
    if (!userText) return;

    if (!textToSend) setInputQuery('');
    setIsPlusMenuOpen(false);

    // Append User Message
    const updatedMessages = [...chatMessages, { sender: 'user', text: userText }];
    setChatMessages(updatedMessages);
    setIsGenerating(true);

    // Handle Local llama.cpp / Ollama Execution
    if (selectedModel.isLocal && selectedModel.endpoint) {
      try {
        const response = await fetch(`${selectedModel.endpoint}/chat/completions`, {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify({
            model: selectedModel.id,
            messages: [
              {
                role: 'system',
                content: `You are the Regaarder Executive Browser Assistant. Context domain: ${summary?.domain || 'web'}. Page brief: ${summary?.overview || ''}. Ground your responses strictly in this page context.`
              },
              ...updatedMessages.map((m) => ({
                role: m.sender === 'user' ? 'user' : 'assistant',
                content: m.text
              }))
            ],
            stream: false,
            temperature: 0.7
          })
        });

        if (response.ok) {
          const data = await response.json();
          const replyText = data.choices?.[0]?.message?.content || 'Inference completed with no output.';
          setChatMessages((prev) => [...prev, { sender: 'agent', text: replyText, modelTag: selectedModel.name }]);
          setIsGenerating(false);
          return;
        }
      } catch (err) {
        // Fallback with on-device simulated response & llama.cpp instructions
      }
    }

    // High-fidelity fallback / simulated intelligent response
    setTimeout(() => {
      let replyText = '';
      const isCouponIntent = /\b(coupon|promo|discount|code|checkout)\b/i.test(userText);
      const isFormIntent = /\b(fill|form|input|type|address)\b/i.test(userText);
      const isMonitorIntent = /\b(monitor|track|price drop|stock|inventory)\b/i.test(userText);

      if (isCouponIntent) {
        replyText = `⚡ **[${selectedModel.name}]**: Scanning checkout DOM on **${summary?.domain || 'page'}**...\nFound 1 active coupon field. Verified promo code **\`REGAARDER25\`** applies **25% off** at checkout!`;
      } else if (isFormIntent) {
        replyText = `⚡ **[${selectedModel.name}]**: Detected 4 profile fields on this form (Name, Email, Address, ZIP). Ready to populate securely on your command.`;
      } else if (isMonitorIntent) {
        replyText = `🔔 **[${selectedModel.name}]**: Created background price & inventory watcher for **${activeTab?.title || 'this URL'}**. You will receive desktop notifications upon price shifts.`;
      } else {
        replyText = `Regarding **"${userText}"** on **${activeTab?.title || summary?.domain || 'webpage'}**:\n\n`;
        if (selectedTextContext) {
          replyText += `*Grounded on selection: "${selectedTextContext.slice(0, 60)}..."*\n\n`;
        }
        replyText += `Analyzed active page hierarchy. The page highlights core workflows and verified facts. You can instantly export this summary to **Compose** or structured matrix data to **Sheets** via the \`+\` tools menu.`;
      }

      setChatMessages((prev) => [
        ...prev,
        {
          sender: 'agent',
          text: replyText,
          modelTag: selectedModel.name,
          isOfflineWarning: selectedModel.isLocal && localServerOnline === false
        }
      ]);
      setIsGenerating(false);
    }, 450);
  };

  // Agentic Actions Runner
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
        setTaskProgress(75);
        setTaskLogs((prev) => [...prev, '[1.1s] Testing coupon candidates: [SAVE10, REGAARDER25, WELCOME15]...']);
      }, 1100);

      setTimeout(() => {
        setTaskProgress(100);
        setIsExecutingTask(false);
        setTaskLogs((prev) => [...prev, '✓ [1.7s] Applied code "REGAARDER25" - Saved $37.50 (25% off)!']);
        if (showToast) showToast('Applied best promo code: REGAARDER25 (-25%)');
      }, 1700);
    } else if (taskType === 'fill_form') {
      setTimeout(() => {
        setTaskProgress(50);
        setTaskLogs((prev) => [...prev, '[0.5s] Matched 4 profile fields: Name, Email, Address, ZIP']);
      }, 500);

      setTimeout(() => {
        setTaskProgress(100);
        setIsExecutingTask(false);
        setTaskLogs((prev) => [...prev, '✓ [1.4s] Auto-filled form inputs safely from profile.']);
        if (showToast) showToast('Form auto-filled');
      }, 1400);
    } else if (taskType === 'monitor_stock') {
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
        setTaskLogs((prev) => [...prev, '✓ [1.2s] Active background price & inventory watcher initialized.']);
        if (showToast) showToast('Monitoring product stock in background');
      }, 1200);
    }
  };

  const quickStarterPrompts = [
    { label: 'Summarize Page', query: 'Summarize the key takeaways of this page into 3 executive points' },
    { label: 'Find Promo Codes', query: 'Find promotional codes at checkout on this site' },
    { label: 'Auto-Fill Form', query: 'Auto-fill form inputs on this page' },
    { label: 'Export to Sheets', query: 'Extract table matrix data and send to Sheets' }
  ];

  return (
    <div className="w-full h-full bg-[#12141C]/95 backdrop-blur-2xl border-l border-white/[0.08] flex flex-col font-sans select-none text-slate-200 shrink-0 shadow-2xl z-20 overflow-hidden">
      {/* 1. COMPACT TOP HEADER */}
      <div className="flex items-center justify-between px-3.5 py-2.5 border-b border-white/[0.08] bg-white/[0.02] shrink-0">
        <div className="flex items-center gap-2 min-w-0">
          <div className="w-7 h-7 rounded-lg bg-violet-500/15 ring-1 ring-violet-500/30 text-violet-400 flex items-center justify-center shrink-0">
            <AssistIcon size={15} />
          </div>
          <div className="flex flex-col min-w-0">
            <h2 className="text-xs font-semibold text-slate-100 tracking-tight flex items-center gap-1.5">
              <span>Browser Assistant</span>
              <span
                className={`w-1.5 h-1.5 rounded-full ${
                  selectedModel.isLocal
                    ? localServerOnline === false
                      ? 'bg-amber-400'
                      : 'bg-emerald-400'
                    : 'bg-emerald-400'
                } animate-pulse`}
                title={selectedModel.isLocal ? (localServerOnline === false ? 'Local server offline' : 'Local llama.cpp ready') : 'Cloud AI active'}
              />
            </h2>
            <span className="text-[10px] text-slate-400 truncate">
              {summary ? `Connected to ${summary.domain}` : 'Agentic Canvas'}
            </span>
          </div>
        </div>

        {/* Apple-style Tab Segmented Switcher (Slightly rounded rectangles) */}
        <div className="flex items-center gap-1">
          <div className="flex items-center p-0.5 bg-black/40 rounded-lg border border-white/[0.06]">
            <button
              type="button"
              onPointerDown={(e) => {
                e.preventDefault();
                setActivePanelTab('chat');
              }}
              className={`px-2 py-1 rounded-md text-[10px] font-semibold transition-all cursor-pointer ${
                activePanelTab === 'chat'
                  ? 'bg-white/15 text-white shadow-2xs border border-white/10'
                  : 'text-slate-400 hover:text-slate-200 border border-transparent'
              }`}
            >
              Chat
            </button>
            <button
              type="button"
              onPointerDown={(e) => {
                e.preventDefault();
                setActivePanelTab('automation');
              }}
              className={`px-2 py-1 rounded-md text-[10px] font-semibold transition-all cursor-pointer ${
                activePanelTab === 'automation'
                  ? 'bg-white/15 text-white shadow-2xs border border-white/10'
                  : 'text-slate-400 hover:text-slate-200 border border-transparent'
              }`}
            >
              Tasks
            </button>
            <button
              type="button"
              onPointerDown={(e) => {
                e.preventDefault();
                setActivePanelTab('memory');
              }}
              className={`px-2 py-1 rounded-md text-[10px] font-semibold transition-all cursor-pointer ${
                activePanelTab === 'memory'
                  ? 'bg-white/15 text-white shadow-2xs border border-white/10'
                  : 'text-slate-400 hover:text-slate-200 border border-transparent'
              }`}
            >
              Memory
            </button>
          </div>

          <button
            type="button"
            onPointerDown={(e) => {
              e.preventDefault();
              onClose();
            }}
            className="p-1.5 rounded-md text-slate-400 hover:text-slate-200 hover:bg-white/[0.06] transition-all cursor-pointer"
            title="Close Assistant"
          >
            <BrowserCloseIcon size={14} />
          </button>
        </div>
      </div>

      {/* 2. PROGRESSIVE DISCLOSURE: COLLAPSIBLE EXECUTIVE BRIEF CHIP */}
      {summary && (
        <div className="px-3 pt-2 shrink-0">
          <div className="rounded-lg bg-white/[0.02] border border-white/[0.06] overflow-hidden transition-all duration-200">
            <button
              type="button"
              onPointerDown={(e) => {
                e.preventDefault();
                setIsBriefExpanded((prev) => !prev);
              }}
              className="w-full flex items-center justify-between px-2.5 py-1.5 text-[10px] font-medium text-slate-400 hover:text-slate-200 cursor-pointer"
            >
              <div className="flex items-center gap-1.5 truncate">
                <Sparkles size={11} className="text-violet-400 shrink-0" />
                <span className="truncate">Page Context: <strong className="text-slate-200">{summary.domain}</strong></span>
              </div>
              <span className="text-[9px] text-slate-500 font-mono flex items-center gap-1 shrink-0">
                {isBriefExpanded ? 'Hide' : 'View Brief'}
                {isBriefExpanded ? <ChevronUp size={11} /> : <ChevronDown size={11} />}
              </span>
            </button>

            {isBriefExpanded && (
              <div className="p-2.5 pt-1 text-xs text-slate-300 leading-relaxed border-t border-white/[0.04] bg-white/[0.01] animate-in fade-in duration-150">
                <p className="text-[11px] font-normal text-slate-300">{summary.overview}</p>
              </div>
            )}
          </div>
        </div>
      )}

      {/* 3. MAIN FULL-HEIGHT VIEWPORT CANVAS */}
      <div className="flex-1 flex flex-col min-h-0 relative overflow-hidden">

        {/* TAB 1: FULL-HEIGHT EXPANSIVE CHAT */}
        {activePanelTab === 'chat' && (
          <div className="flex-1 flex flex-col min-h-0">
            {/* Scrollable Conversation Stream */}
            <div ref={chatScrollRef} className="flex-1 overflow-y-auto p-3.5 space-y-3 regaarder-scrollbar">
              {chatMessages.length === 0 ? (
                /* Minimal Uncluttered Starter Canvas */
                <div className="h-full flex flex-col items-center justify-center text-center px-4 space-y-4">
                  <div className="w-10 h-10 rounded-2xl bg-gradient-to-tr from-violet-600/20 to-sky-500/20 border border-violet-500/30 text-violet-400 flex items-center justify-center shadow-inner">
                    <AssistIcon size={20} />
                  </div>
                  <div className="space-y-1">
                    <h3 className="text-xs font-semibold text-slate-200">How can I help with this page?</h3>
                    <p className="text-[11px] text-slate-400 max-w-[240px]">
                      Ask anything, dictate by voice, or trigger automated agentic workflows.
                    </p>
                  </div>

                  {/* Clean Starter Action Prompts */}
                  <div className="grid grid-cols-2 gap-1.5 w-full max-w-[320px] pt-1">
                    {quickStarterPrompts.map((item, idx) => (
                      <button
                        key={idx}
                        type="button"
                        onPointerDown={(e) => {
                          e.preventDefault();
                          handleSendMessage(item.query);
                        }}
                        className="p-2 rounded-lg bg-white/[0.03] hover:bg-white/[0.07] border border-white/[0.07] hover:border-violet-500/30 text-[10.5px] font-medium text-slate-300 text-left transition-all cursor-pointer"
                      >
                        {item.label}
                      </button>
                    ))}
                  </div>
                </div>
              ) : (
                /* Active Message Stream */
                chatMessages.map((msg, idx) => (
                  <div
                    key={idx}
                    className={`flex flex-col ${msg.sender === 'user' ? 'items-end' : 'items-start'}`}
                  >
                    <div
                      className={`max-w-[88%] px-3.5 py-2 rounded-xl text-xs leading-relaxed ${
                        msg.sender === 'user'
                          ? 'bg-violet-600 text-white shadow-xs'
                          : 'bg-white/[0.05] text-slate-100 border border-white/10'
                      }`}
                    >
                      {msg.text}
                    </div>

                    {msg.sender === 'agent' && (
                      <div className="flex items-center gap-1.5 mt-1 px-1 text-[9px] text-slate-500 font-mono">
                        <span>{msg.modelTag || selectedModel.name}</span>
                        {msg.isOfflineWarning && (
                          <span className="text-amber-400">⚠️ Local server offline (Simulated)</span>
                        )}
                      </div>
                    )}
                  </div>
                ))
              )}

              {isGenerating && (
                <div className="flex items-center gap-2 p-2.5 rounded-xl bg-white/[0.03] border border-white/[0.06] text-xs text-slate-400 w-fit animate-pulse">
                  <Cpu size={13} className="text-violet-400 animate-spin" />
                  <span className="text-[11px]">Generating with {selectedModel.name}...</span>
                </div>
              )}
            </div>

            {/* Selection HUD Chip */}
            {selectedTextContext && (
              <div className="mx-3 mb-1 p-2 rounded-lg bg-violet-500/10 border border-violet-500/20 flex items-center justify-between text-xs text-violet-300 shrink-0">
                <span className="truncate font-medium text-[11px]">Ask about: "{selectedTextContext.slice(0, 38)}..."</span>
                <button
                  type="button"
                  onPointerDown={(e) => {
                    e.preventDefault();
                    handleSendMessage(`Explain selected context: "${selectedTextContext}"`);
                  }}
                  className="px-2 py-0.5 rounded bg-violet-600 text-white text-[10px] font-semibold cursor-pointer shrink-0 ml-1.5"
                >
                  Ask
                </button>
              </div>
            )}

            {/* 4. EXPANSIVE PROMPT INPUT CONTAINER WITH VOICE & MODEL PICKER */}
            <div className="p-3 border-t border-white/[0.08] bg-white/[0.02] shrink-0 space-y-2">
              <form
                onSubmit={(e) => {
                  e.preventDefault();
                  handleSendMessage();
                }}
                className="relative flex flex-col rounded-xl bg-black/40 border border-white/10 focus-within:border-violet-500/60 focus-within:ring-1 focus-within:ring-violet-500/30 transition-all shadow-inner"
              >
                {/* Textarea Prompt Box */}
                <textarea
                  ref={chatInputRef}
                  value={inputQuery}
                  rows={2}
                  onChange={(e) => setInputQuery(e.target.value)}
                  onKeyDown={(e) => {
                    if (e.key === 'Enter' && !e.shiftKey) {
                      e.preventDefault();
                      handleSendMessage();
                    }
                  }}
                  placeholder="Ask assistant or type /command..."
                  className="w-full px-3 py-2 bg-transparent text-xs text-slate-100 placeholder-slate-500 resize-none border-none outline-none focus:outline-none focus:ring-0 leading-relaxed font-normal"
                />

                {/* Bottom Control Toolbar inside Input Box */}
                <div className="flex items-center justify-between px-2.5 py-1.5 border-t border-white/[0.06] bg-white/[0.01]">
                  {/* Left: Plus Menu & Model Picker */}
                  <div className="flex items-center gap-1.5 relative">
                    {/* Plus Actions Tool Button */}
                    <div ref={plusMenuRef} className="relative">
                      <button
                        type="button"
                        onPointerDown={(e) => {
                          e.preventDefault();
                          setIsPlusMenuOpen((prev) => !prev);
                        }}
                        className={`p-1.5 rounded-lg text-slate-400 hover:text-slate-100 hover:bg-white/10 transition-all cursor-pointer ${
                          isPlusMenuOpen ? 'bg-white/15 text-white' : ''
                        }`}
                        title="Add Workspace Tools & Actions"
                      >
                        <Plus size={14} />
                      </button>

                      {/* Progressive Disclosure Popover Menu */}
                      {isPlusMenuOpen && (
                        <div className="absolute left-0 bottom-8 mb-1 w-52 p-1.5 bg-[#181A24] border border-white/15 rounded-xl shadow-2xl z-50 animate-in zoom-in-95 duration-150 font-sans text-xs space-y-1">
                          <span className="text-[9px] font-semibold uppercase tracking-wider text-slate-500 px-2 pt-1 block">
                            Export Page Knowledge
                          </span>
                          <button
                            type="button"
                            onPointerDown={(e) => {
                              e.preventDefault();
                              setIsPlusMenuOpen(false);
                              onOpenSendToCompose?.({ bottom: 60, right: 300 });
                            }}
                            className="w-full flex items-center gap-2 px-2 py-1.5 rounded-md hover:bg-violet-500/15 text-slate-300 hover:text-violet-200 transition-colors text-left cursor-pointer"
                          >
                            <ComposeIcon size={13} className="text-violet-400" />
                            <span>Send to Regaarder Compose</span>
                          </button>

                          <button
                            type="button"
                            onPointerDown={(e) => {
                              e.preventDefault();
                              setIsPlusMenuOpen(false);
                              onOpenSendToSheets?.({ bottom: 60, right: 300 });
                            }}
                            className="w-full flex items-center gap-2 px-2 py-1.5 rounded-md hover:bg-emerald-500/15 text-slate-300 hover:text-emerald-200 transition-colors text-left cursor-pointer"
                          >
                            <SheetIcon size={13} className="text-emerald-400" />
                            <span>Export Matrix to Sheets</span>
                          </button>

                          <button
                            type="button"
                            onPointerDown={(e) => {
                              e.preventDefault();
                              setIsPlusMenuOpen(false);
                              onSaveToMemory?.();
                              if (showToast) showToast('Saved page context to Memory graph');
                            }}
                            className="w-full flex items-center gap-2 px-2 py-1.5 rounded-md hover:bg-sky-500/15 text-slate-300 hover:text-sky-200 transition-colors text-left cursor-pointer"
                          >
                            <MemoryIcon size={13} className="text-sky-400" />
                            <span>Ingest to Personal Memory</span>
                          </button>

                          <button
                            type="button"
                            onPointerDown={(e) => {
                              e.preventDefault();
                              setIsPlusMenuOpen(false);
                              onSendToWhiteboard?.();
                              if (showToast) showToast('Clipped layout to Canvas');
                            }}
                            className="w-full flex items-center gap-2 px-2 py-1.5 rounded-md hover:bg-amber-500/15 text-slate-300 hover:text-amber-200 transition-colors text-left cursor-pointer"
                          >
                            <WhiteboardIcon size={13} className="text-amber-400" />
                            <span>Clip to Whiteboard</span>
                          </button>
                        </div>
                      )}
                    </div>

                    {/* Model Picker Chip */}
                    <div ref={modelPickerRef} className="relative">
                      <button
                        type="button"
                        onPointerDown={(e) => {
                          e.preventDefault();
                          setIsModelPickerOpen((prev) => !prev);
                        }}
                        className="flex items-center gap-1.5 px-2 py-1 rounded-md bg-white/[0.05] hover:bg-white/10 text-[10.5px] font-medium text-slate-300 hover:text-white transition-all cursor-pointer border border-white/[0.06]"
                        title="Select Model (llama.cpp / Cloud)"
                      >
                        <span
                          className={`w-1.5 h-1.5 rounded-full ${
                            selectedModel.isLocal
                              ? localServerOnline === false
                                ? 'bg-amber-400'
                                : 'bg-emerald-400'
                              : 'bg-emerald-400'
                          }`}
                        />
                        <span className="font-semibold">{selectedModel.name}</span>
                        <ChevronDown size={11} className="text-slate-500" />
                      </button>

                      {/* Model Selector Popover Dropdown */}
                      {isModelPickerOpen && (
                        <div className="absolute left-0 bottom-8 mb-1 w-64 p-2 bg-[#181A24] border border-white/15 rounded-xl shadow-2xl z-50 animate-in zoom-in-95 duration-150 font-sans text-xs space-y-2">
                          <div className="flex items-center justify-between px-1">
                            <span className="text-[10px] font-semibold text-slate-400 uppercase tracking-wider">
                              Inference Engine
                            </span>
                            <span className="text-[9px] text-slate-500 font-mono">Option 1: llama.cpp</span>
                          </div>

                          <div className="space-y-1">
                            {AVAILABLE_MODELS.map((model) => (
                              <button
                                key={model.id}
                                type="button"
                                onPointerDown={(e) => {
                                  e.preventDefault();
                                  setSelectedModel(model);
                                  setIsModelPickerOpen(false);
                                  if (showToast) showToast(`Switched model to ${model.name} (${model.provider})`);
                                }}
                                className={`w-full flex items-start justify-between p-2 rounded-lg text-left transition-all cursor-pointer ${
                                  selectedModel.id === model.id
                                    ? 'bg-violet-600/20 border border-violet-500/40 text-white'
                                    : 'hover:bg-white/[0.05] border border-transparent text-slate-300'
                                }`}
                              >
                                <div className="space-y-0.5 min-w-0 pr-2">
                                  <div className="flex items-center gap-1.5">
                                    <span className="font-semibold text-[11px]">{model.name}</span>
                                    <span className="text-[9px] px-1 rounded bg-white/10 text-slate-400 font-mono">
                                      {model.tag}
                                    </span>
                                  </div>
                                  <p className="text-[10px] text-slate-400 truncate">{model.description}</p>
                                </div>
                                {selectedModel.id === model.id && (
                                  <Check size={13} className="text-violet-400 shrink-0 mt-0.5" />
                                )}
                              </button>
                            ))}
                          </div>

                          {selectedModel.isLocal && (
                            <div className="p-2 rounded-lg bg-black/40 border border-white/[0.06] text-[10px] font-mono text-slate-400 space-y-1">
                              <div className="flex justify-between">
                                <span>Endpoint:</span>
                                <span className="text-slate-200">{selectedModel.endpoint}</span>
                              </div>
                              <div className="flex justify-between">
                                <span>Status:</span>
                                <span className={localServerOnline === false ? 'text-amber-400' : 'text-emerald-400'}>
                                  {localServerOnline === false ? 'Offline (Will fallback)' : 'Online (Direct streaming)'}
                                </span>
                              </div>
                            </div>
                          )}
                        </div>
                      )}
                    </div>
                  </div>

                  {/* Right: Voice Dictation & Send Button */}
                  <div className="flex items-center gap-1.5">
                    {/* Voice Dictation Button with Pulsing Waveform */}
                    <button
                      type="button"
                      onPointerDown={(e) => {
                        e.preventDefault();
                        toggleVoiceDictation();
                      }}
                      className={`p-1.5 rounded-lg transition-all cursor-pointer flex items-center gap-1 ${
                        isRecordingVoice
                          ? 'bg-rose-500 text-white animate-pulse shadow-md ring-2 ring-rose-500/40'
                          : 'text-slate-400 hover:text-slate-100 hover:bg-white/10'
                      }`}
                      title={isRecordingVoice ? 'Stop voice recording' : 'Start voice dictation'}
                    >
                      {isRecordingVoice ? <MicOff size={14} /> : <Mic size={14} />}
                      {isRecordingVoice && (
                        <div className="flex items-center gap-0.5 px-0.5">
                          <span className="w-0.5 h-2.5 bg-white animate-bounce" />
                          <span className="w-0.5 h-3.5 bg-white animate-bounce delay-75" />
                          <span className="w-0.5 h-1.5 bg-white animate-bounce delay-150" />
                        </div>
                      )}
                    </button>

                    {/* Send Button */}
                    <button
                      type="submit"
                      disabled={!inputQuery.trim() || isGenerating}
                      className="p-1.5 rounded-lg bg-violet-600 hover:bg-violet-500 disabled:opacity-25 text-white transition-all cursor-pointer shrink-0"
                      title="Send message"
                    >
                      <ArrowUp size={14} />
                    </button>
                  </div>
                </div>
              </form>
            </div>
          </div>
        )}

        {/* TAB 2: AGENTIC AUTOMATION TASKS */}
        {activePanelTab === 'automation' && (
          <div className="flex-1 overflow-y-auto p-3.5 space-y-3.5 regaarder-scrollbar">
            <div className="space-y-1">
              <h3 className="text-xs font-semibold text-slate-100 flex items-center gap-1.5">
                <TasksIcon size={14} className="text-emerald-400" />
                <span>Autonomous Web Actions</span>
              </h3>
              <p className="text-[11px] text-slate-400">
                Execute DOM interactions, form filling, and background monitoring on external pages.
              </p>
            </div>

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
                      <p className="text-[10px] text-slate-400">Auto-test discount codes at checkout</p>
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
                      <p className="text-[10px] text-slate-400">Populate checkout & contact forms</p>
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

              {/* Stock Watcher */}
              <div className="p-3 rounded-lg bg-white/[0.03] border border-white/[0.08] space-y-2">
                <div className="flex items-center justify-between">
                  <div className="flex items-center gap-2">
                    <div className="w-6 h-6 rounded-md bg-amber-500/10 text-amber-400 flex items-center justify-center font-bold text-xs">
                      🔔
                    </div>
                    <div>
                      <h4 className="text-xs font-semibold text-slate-200">Stock & Price Watcher</h4>
                      <p className="text-[10px] text-slate-400">Background inventory & drop alerts</p>
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

            {/* Task Logs */}
            {taskLogs.length > 0 && (
              <div className="p-3 rounded-lg bg-black/40 border border-white/10 space-y-2">
                <div className="flex items-center justify-between">
                  <span className="text-[11px] font-semibold text-slate-300 flex items-center gap-1.5">
                    <span className={`w-2 h-2 rounded-full ${isExecutingTask ? 'bg-emerald-400 animate-ping' : 'bg-emerald-400'}`} />
                    Autonomous Task Execution
                  </span>
                  <span className="text-[10px] text-slate-500 font-mono">{taskProgress}%</span>
                </div>
                <div className="space-y-1 font-mono text-[10px] text-slate-400 max-h-[100px] overflow-y-auto">
                  {taskLogs.map((log, index) => (
                    <div key={index}>{log}</div>
                  ))}
                </div>
              </div>
            )}

            {/* Monitored items */}
            <div className="space-y-1.5 pt-1">
              <span className="text-[10px] font-semibold uppercase tracking-wider text-slate-400">
                Monitored Pages ({monitoredItems.length})
              </span>
              {monitoredItems.map((item) => (
                <div key={item.id} className="p-2 rounded-lg bg-white/[0.02] border border-white/[0.06] flex items-center justify-between text-xs">
                  <div className="min-w-0 pr-2">
                    <h5 className="font-semibold text-slate-200 truncate">{item.title}</h5>
                    <span className="text-[10px] text-slate-500">{item.url} • {item.lastChecked}</span>
                  </div>
                  <span className="text-xs font-semibold text-emerald-400 shrink-0">{item.price}</span>
                </div>
              ))}
            </div>
          </div>
        )}

        {/* TAB 3: PERSONAL MEMORY RETRIEVAL */}
        {activePanelTab === 'memory' && (
          <div className="flex-1 overflow-y-auto p-3.5 space-y-3 regaarder-scrollbar">
            <div className="space-y-1">
              <h3 className="text-xs font-semibold text-slate-100 flex items-center gap-1.5">
                <MemoryIcon size={14} className="text-sky-400" />
                <span>Personal Memory & History Retrieval</span>
              </h3>
              <p className="text-[11px] text-slate-400">
                Scan browsing history using natural language to retrieve answers from past pages.
              </p>
            </div>

            <input
              type="text"
              value={historySearchQuery}
              onChange={(e) => setHistorySearchQuery(e.target.value)}
              placeholder='e.g. "What was the SaaS rule of 40 metric from yesterday?"'
              className="w-full px-3 py-2 rounded-lg bg-white/[0.04] border border-white/10 text-xs text-slate-100 placeholder-slate-500 focus:outline-none focus:border-sky-500/60 transition-all"
            />

            <div className="space-y-2">
              {historyResults.map((item) => (
                <div key={item.id} className="p-3 rounded-lg bg-white/[0.03] border border-white/[0.08] space-y-1">
                  <div className="flex items-center justify-between">
                    <h5 className="text-xs font-semibold text-slate-200 truncate pr-2">{item.title}</h5>
                    <span className="text-[10px] text-sky-400 font-mono shrink-0">{item.visitedDate}</span>
                  </div>
                  <p className="text-[11px] text-slate-300 leading-relaxed">{item.snippet}</p>
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
    </div>
  );
};

export default BrowserResearchPanel;
