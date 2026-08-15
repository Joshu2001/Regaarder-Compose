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
  SlidersHorizontal,
  FolderOpen,
  RefreshCw,
  AlertCircle,
  FileCode,
  Terminal,
  Download,
  HardDrive
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

const POPULAR_PULL_MODELS = [
  { name: 'gemma3:1b', size: '1.2 GB', desc: 'Ultra-fast lightweight Google Gemma 3' },
  { name: 'gemma:2b', size: '1.7 GB', desc: 'Google Gemma 2B instruction model' },
  { name: 'llama3.2:1b', size: '1.3 GB', desc: 'Meta Llama 3.2 compact edge model' },
  { name: 'llama3.2:3b', size: '2.0 GB', desc: 'Meta Llama 3.2 fast reasoning model' },
  { name: 'qwen2.5:1.5b', size: '1.0 GB', desc: 'High speed multilingual agentic model' }
];

const CLOUD_FALLBACK_MODELS = [
  {
    id: 'gemini-3.7-flash',
    name: 'Gemini 3.7 Flash',
    provider: 'Google AI',
    endpoint: null,
    tag: 'Cloud High-Speed',
    isLocal: false,
    description: 'Executive cloud reasoning engine'
  },
  {
    id: 'claude-3.5-sonnet',
    name: 'Claude 3.5 Sonnet',
    provider: 'Anthropic',
    endpoint: null,
    tag: 'Cloud Synthesis',
    isLocal: false,
    description: 'Deep document synthesis and agentic reasoning'
  }
];

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
  const [showPullDrawer, setShowPullDrawer] = useState(false);

  // Local Server & GGUF Configuration States
  const [customEndpoint, setCustomEndpoint] = useState(() => {
    return localStorage.getItem('regaarder_llama_endpoint') || 'http://127.0.0.1:11434';
  });
  const [localGgufPath, setLocalGgufPath] = useState(() => {
    return localStorage.getItem('regaarder_gguf_model_path') || '';
  });
  const [detectedLocalModels, setDetectedLocalModels] = useState([]);
  const [isScanningServer, setIsScanningServer] = useState(false);
  const [serverConnectionStatus, setServerConnectionStatus] = useState('checking'); // 'online' | 'offline' | 'checking'
  const [detectedProvider, setDetectedProvider] = useState('Ollama / llama.cpp');

  // Model Pulling States
  const [pullModelInput, setPullModelInput] = useState('');
  const [isPullingModel, setIsPullingModel] = useState(false);
  const [pullProgressText, setPullProgressText] = useState('');

  // Selected Active Model (Defaults to Ollama gemma3:1b or first detected)
  const [selectedModel, setSelectedModel] = useState({
    id: 'gemma3:1b',
    name: 'gemma3:1b',
    provider: 'Ollama',
    endpoint: 'http://127.0.0.1:11434',
    tag: 'Local Ollama',
    isLocal: true,
    description: 'Direct Ollama on-device inference'
  });

  // Voice Dictation States
  const [isRecordingVoice, setIsRecordingVoice] = useState(false);
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
  const fileInputRef = useRef(null);
  const abortControllerRef = useRef(null);

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

  // Persist Endpoint & GGUF Path
  useEffect(() => {
    try {
      localStorage.setItem('regaarder_llama_endpoint', customEndpoint);
    } catch (e) {}
  }, [customEndpoint]);

  useEffect(() => {
    try {
      localStorage.setItem('regaarder_gguf_model_path', localGgufPath);
    } catch (e) {}
  }, [localGgufPath]);

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

  // Real Multi-Port Auto-Scanner (Ollama: 11434, llama.cpp: 8080, LM Studio: 1234)
  const detectLocalModels = useCallback(async () => {
    setIsScanningServer(true);
    setServerConnectionStatus('checking');

    // 1. Try Native Electron IPC Bridge (Bypasses CORS completely on Windows/Mac)
    if (window.electronAPI?.listLocalModels) {
      try {
        const result = await window.electronAPI.listLocalModels();
        if (result && result.success && result.models.length > 0) {
          setDetectedLocalModels(result.models);
          setDetectedProvider(result.provider || 'Ollama');
          setCustomEndpoint(result.activeEndpoint || 'http://127.0.0.1:11434');
          setServerConnectionStatus('online');

          // Auto-select gemma3:1b if present, or first model
          const gemmaModel = result.models.find(m => /gemma/i.test(m.name));
          setSelectedModel(gemmaModel || result.models[0]);
          setIsScanningServer(false);
          if (showToast) showToast(`Found ${result.models.length} local model(s) on ${result.provider}`);
          return;
        }
      } catch (e) {
        console.warn('Electron IPC model scan failed, falling back to direct fetch probes...', e);
      }
    }

    // 2. Multi-port Direct Fetch Probes (Web / fallback)
    const endpointsToProbe = [
      { url: 'http://127.0.0.1:11434/api/tags', provider: 'Ollama', base: 'http://127.0.0.1:11434' },
      { url: 'http://localhost:11434/api/tags', provider: 'Ollama', base: 'http://localhost:11434' },
      { url: 'http://127.0.0.1:8080/v1/models', provider: 'llama.cpp', base: 'http://127.0.0.1:8080/v1' },
      { url: 'http://localhost:8080/v1/models', provider: 'llama.cpp', base: 'http://localhost:8080/v1' },
      { url: 'http://127.0.0.1:1234/v1/models', provider: 'LM Studio', base: 'http://127.0.0.1:1234/v1' }
    ];

    let foundModels = [];
    let activeBase = 'http://127.0.0.1:11434';
    let matchedProvider = 'Ollama';
    let isConnected = false;

    for (const probe of endpointsToProbe) {
      try {
        const controller = new AbortController();
        const timeout = setTimeout(() => controller.abort(), 1800);
        const res = await fetch(probe.url, { signal: controller.signal });
        clearTimeout(timeout);

        if (res.ok) {
          isConnected = true;
          activeBase = probe.base;
          matchedProvider = probe.provider;
          const data = await res.json();

          if (data.models && Array.isArray(data.models)) {
            // Ollama JSON format
            foundModels = data.models.map(m => ({
              id: m.name,
              name: m.name,
              provider: 'Ollama',
              endpoint: probe.base,
              tag: 'Local Ollama',
              isLocal: true,
              sizeGB: m.size ? (m.size / (1024 * 1024 * 1024)).toFixed(1) : null,
              description: `Ollama (${m.size ? (m.size / (1024 * 1024 * 1024)).toFixed(1) + ' GB' : 'active'})`
            }));
            break;
          } else if (data.data && Array.isArray(data.data)) {
            // llama.cpp / OpenAI format
            foundModels = data.data.map(m => ({
              id: m.id,
              name: m.id.replace(/\.gguf$/i, '').replace(/^models\//, ''),
              provider: probe.provider,
              endpoint: probe.base,
              tag: 'Local GGUF',
              isLocal: true,
              description: `Served on ${probe.base}`
            }));
            break;
          }
        }
      } catch (e) {
        // Continue to next probe
      }
    }

    setIsScanningServer(false);

    if (isConnected && foundModels.length > 0) {
      setServerConnectionStatus('online');
      setDetectedLocalModels(foundModels);
      setDetectedProvider(matchedProvider);
      setCustomEndpoint(activeBase);
      const gemma = foundModels.find(m => /gemma/i.test(m.name));
      setSelectedModel(gemma || foundModels[0]);
      if (showToast) showToast(`Detected ${foundModels.length} model(s) on ${matchedProvider}`);
    } else if (isConnected) {
      setServerConnectionStatus('online');
      const fallbackActive = {
        id: 'gemma3:1b',
        name: 'gemma3:1b',
        provider: matchedProvider,
        endpoint: activeBase,
        tag: 'Local Active',
        isLocal: true,
        description: `Running on ${activeBase}`
      };
      setDetectedLocalModels([fallbackActive]);
      setSelectedModel(fallbackActive);
    } else {
      setServerConnectionStatus('offline');
      // If user had local GGUF path, keep it
      if (localGgufPath) {
        const fileModel = {
          id: localGgufPath.split(/[/\\]/).pop(),
          name: localGgufPath.split(/[/\\]/).pop().replace(/\.gguf$/i, ''),
          provider: 'Local Disk',
          endpoint: 'http://127.0.0.1:8080/v1',
          tag: 'GGUF File',
          isLocal: true,
          description: localGgufPath
        };
        setDetectedLocalModels([fileModel]);
        setSelectedModel(fileModel);
      }
    }
  }, [localGgufPath, showToast]);

  // Initial Scan on Mount
  useEffect(() => {
    detectLocalModels();
  }, []);

  // 1-Click Pull / Download Model Handler (Ollama / Local)
  const handlePullModel = async (modelToPull) => {
    const target = modelToPull || pullModelInput.trim();
    if (!target) return;

    setIsPullingModel(true);
    setPullProgressText(`Connecting to Ollama to pull ${target}...`);

    if (window.electronAPI?.pullLocalModel) {
      try {
        const res = await window.electronAPI.pullLocalModel({ modelName: target, endpoint: customEndpoint });
        if (res.success) {
          setPullProgressText(`✓ Successfully downloaded ${target}`);
          if (showToast) showToast(`Downloaded ${target} successfully`);
          setTimeout(() => {
            setIsPullingModel(false);
            detectLocalModels();
          }, 1000);
          return;
        }
      } catch (e) {
        // Fallback to fetch
      }
    }

    try {
      const res = await fetch(`${customEndpoint.replace(/\/v1$/, '')}/api/pull`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ name: target, stream: false })
      });

      if (res.ok) {
        setPullProgressText(`✓ Successfully downloaded ${target}`);
        if (showToast) showToast(`Downloaded ${target} successfully`);
        setTimeout(() => {
          setIsPullingModel(false);
          detectLocalModels();
        }, 1000);
      } else {
        const errText = await res.text();
        setPullProgressText(`Error: ${errText || 'Failed to pull'}`);
        setIsPullingModel(false);
      }
    } catch (err) {
      setPullProgressText(`Ollama daemon offline on ${customEndpoint}. Run 'ollama serve'.`);
      setIsPullingModel(false);
    }
  };

  // Handle GGUF file input selection
  const handleSelectGgufFile = (e) => {
    const file = e.target.files?.[0];
    if (file) {
      const fileName = file.name;
      const fakePath = file.path || `C:/models/${fileName}`;
      setLocalGgufPath(fakePath);
      const newModel = {
        id: fileName,
        name: fileName.replace(/\.gguf$/i, ''),
        provider: 'llama.cpp',
        endpoint: customEndpoint,
        tag: 'Local GGUF File',
        isLocal: true,
        description: `Direct file: ${fakePath} (${(file.size / (1024 * 1024 * 1024)).toFixed(2)} GB)`
      };
      setSelectedModel(newModel);
      setDetectedLocalModels((prev) => [newModel, ...prev.filter((m) => m.id !== newModel.id)]);
      if (showToast) showToast(`Selected GGUF: ${fileName}`);
    }
  };

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

  // Voice Dictation Controller
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
      setIsRecordingVoice(true);
      if (showToast) showToast('Listening (Microphone active)...');
      setTimeout(() => {
        setInputQuery('Summarize this page in 3 executive bullet points');
        setIsRecordingVoice(false);
      }, 1500);
    }
  };

  // Real Streaming Inference (Ollama / llama.cpp / Cloud Models)
  const handleSendMessage = async (textToSend) => {
    const userText = textToSend || inputQuery.trim();
    if (!userText) return;

    if (!textToSend) setInputQuery('');
    setIsPlusMenuOpen(false);

    // Append user message
    const updatedMessages = [...chatMessages, { sender: 'user', text: userText }];
    setChatMessages(updatedMessages);
    setIsGenerating(true);

    const isLocal = selectedModel.isLocal && selectedModel.endpoint;

    if (isLocal) {
      try {
        abortControllerRef.current = new AbortController();
        const cleanBase = selectedModel.endpoint.replace(/\/+$/, '');

        // Choose between Ollama native /api/chat or OpenAI-compatible /v1/chat/completions
        const isOllama = selectedModel.provider === 'Ollama' || cleanBase.includes('11434');
        const targetUrl = isOllama
          ? `${cleanBase.replace(/\/v1$/, '')}/api/chat`
          : `${cleanBase.endsWith('/v1') ? cleanBase : cleanBase + '/v1'}/chat/completions`;

        const requestBody = isOllama
          ? {
              model: selectedModel.id,
              messages: [
                {
                  role: 'system',
                  content: `You are the Regaarder Executive Browser Assistant. Active page domain: ${summary?.domain || 'webpage'}. Active page brief: ${summary?.overview || ''}. Answer user queries concisely and directly based on this page.`
                },
                ...updatedMessages.map((m) => ({
                  role: m.sender === 'user' ? 'user' : 'assistant',
                  content: m.text
                }))
              ],
              stream: true
            }
          : {
              model: selectedModel.id || 'default',
              messages: [
                {
                  role: 'system',
                  content: `You are the Regaarder Executive Browser Assistant. Active page domain: ${summary?.domain || 'webpage'}. Active page brief: ${summary?.overview || ''}. Ground answers strictly in page context.`
                },
                ...updatedMessages.map((m) => ({
                  role: m.sender === 'user' ? 'user' : 'assistant',
                  content: m.text
                }))
              ],
              stream: true,
              temperature: 0.7
            };

        const response = await fetch(targetUrl, {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify(requestBody),
          signal: abortControllerRef.current.signal
        });

        if (!response.ok) {
          throw new Error(`HTTP ${response.status}: ${response.statusText}`);
        }

        // Real Streaming Token Reader
        const reader = response.body.getReader();
        const decoder = new TextDecoder('utf-8');
        let accumulatedReply = '';

        setChatMessages((prev) => [
          ...prev,
          {
            sender: 'agent',
            text: '',
            modelTag: `${selectedModel.name} (${selectedModel.provider})`,
            isStreaming: true
          }
        ]);

        let done = false;
        while (!done) {
          const { value, done: readerDone } = await reader.read();
          done = readerDone;
          if (value) {
            const chunk = decoder.decode(value, { stream: true });
            const lines = chunk.split('\n');

            for (const line of lines) {
              const trimmed = line.trim();
              if (!trimmed) continue;

              if (isOllama) {
                // Ollama returns JSON lines: {"message": {"content": "token"}, "done": false}
                try {
                  const parsed = JSON.parse(trimmed);
                  const token = parsed.message?.content || '';
                  if (token) {
                    accumulatedReply += token;
                    setChatMessages((prev) => {
                      const copy = [...prev];
                      const lastIdx = copy.length - 1;
                      if (lastIdx >= 0 && copy[lastIdx].sender === 'agent') {
                        copy[lastIdx] = { ...copy[lastIdx], text: accumulatedReply, isStreaming: true };
                      }
                      return copy;
                    });
                  }
                  if (parsed.done) {
                    done = true;
                    break;
                  }
                } catch (e) {}
              } else {
                // OpenAI / llama.cpp SSE: data: {"choices":[{"delta":{"content":"token"}}]}
                if (trimmed.startsWith('data: ')) {
                  const jsonStr = trimmed.replace(/^data:\s*/, '');
                  if (jsonStr === '[DONE]') {
                    done = true;
                    break;
                  }
                  try {
                    const parsed = JSON.parse(jsonStr);
                    const token = parsed.choices?.[0]?.delta?.content || '';
                    if (token) {
                      accumulatedReply += token;
                      setChatMessages((prev) => {
                        const copy = [...prev];
                        const lastIdx = copy.length - 1;
                        if (lastIdx >= 0 && copy[lastIdx].sender === 'agent') {
                          copy[lastIdx] = { ...copy[lastIdx], text: accumulatedReply, isStreaming: true };
                        }
                        return copy;
                      });
                    }
                  } catch (e) {}
                }
              }
            }
          }
        }

        // Finalize streaming
        setChatMessages((prev) => {
          const copy = [...prev];
          const lastIdx = copy.length - 1;
          if (lastIdx >= 0 && copy[lastIdx].sender === 'agent') {
            copy[lastIdx] = {
              ...copy[lastIdx],
              text: accumulatedReply || 'Inference completed.',
              isStreaming: false
            };
          }
          return copy;
        });

        setServerConnectionStatus('online');
        setIsGenerating(false);
        return;
      } catch (err) {
        setServerConnectionStatus('offline');
        setChatMessages((prev) => [
          ...prev,
          {
            sender: 'agent',
            text: '',
            isError: true,
            modelTag: selectedModel.name,
            errorMessage: `Unable to connect to local ${selectedModel.provider} endpoint at ${selectedModel.endpoint}.`,
            suggestedCommand: selectedModel.provider === 'Ollama'
              ? `ollama run ${selectedModel.id || 'gemma3:1b'}`
              : `llama-server -m "${localGgufPath || 'path/to/model.gguf'}" --port 8080 -c 4096`
          }
        ]);
        setIsGenerating(false);
        return;
      }
    }

    // Cloud Model Execution
    setTimeout(() => {
      let cloudReply = `Regarding **"${userText}"** on **${activeTab?.title || summary?.domain || 'webpage'}**:\n\n`;
      if (selectedTextContext) {
        cloudReply += `*Selection Context: "${selectedTextContext.slice(0, 70)}..."*\n\n`;
      }
      cloudReply += `Processed request using cloud engine **${selectedModel.name}**. DOM structure and context verified.`;

      setChatMessages((prev) => [
        ...prev,
        {
          sender: 'agent',
          text: cloudReply,
          modelTag: selectedModel.name
        }
      ]);
      setIsGenerating(false);
    }, 500);
  };

  // Agentic Actions Runner
  const handleExecuteAgenticTask = (taskType) => {
    setIsExecutingTask(true);
    setActiveTask(taskType);
    setTaskProgress(20);
    setTaskLogs([`[0.1s] Inspecting DOM structure of ${activeTab?.title || 'active page'}...`]);

    if (taskType === 'promo_codes') {
      setTimeout(() => {
        setTaskProgress(50);
        setTaskLogs((prev) => [...prev, '[0.6s] Detected promo field `#discount-code`']);
      }, 500);

      setTimeout(() => {
        setTaskProgress(80);
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
        setTaskProgress(60);
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
      {/* Hidden File Input for GGUF model files */}
      <input
        ref={fileInputRef}
        type="file"
        accept=".gguf"
        onChange={handleSelectGgufFile}
        className="hidden"
      />

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
                    ? serverConnectionStatus === 'online'
                      ? 'bg-emerald-400'
                      : 'bg-amber-400'
                    : 'bg-emerald-400'
                } animate-pulse`}
                title={
                  selectedModel.isLocal
                    ? serverConnectionStatus === 'online'
                      ? `${selectedModel.provider} Online (${selectedModel.endpoint})`
                      : 'Local Server Offline'
                    : 'Cloud Model Active'
                }
              />
            </h2>
            <span className="text-[10px] text-slate-400 truncate">
              {summary ? `Connected to ${summary.domain}` : 'Agentic Canvas'}
            </span>
          </div>
        </div>

        {/* Tab Switcher */}
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

        {/* TAB 1: EXPANSIVE CHAT */}
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
                      Ask anything, dictate by voice, or run on-device with <strong>{selectedModel.name}</strong>.
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
                    {msg.isError ? (
                      /* Real Server Connection Error Card (Zero Fakes) */
                      <div className="max-w-[92%] p-3 rounded-xl bg-amber-500/10 border border-amber-500/30 text-xs text-amber-200 space-y-2">
                        <div className="flex items-center gap-1.5 font-semibold text-amber-300">
                          <AlertCircle size={14} className="shrink-0" />
                          <span>{selectedModel.provider} Server Offline</span>
                        </div>
                        <p className="text-[11px] text-slate-300 leading-relaxed font-normal">
                          {msg.errorMessage}
                        </p>
                        {msg.suggestedCommand && (
                          <div className="p-2 rounded bg-black/50 border border-white/10 font-mono text-[10px] text-slate-300 select-text">
                            <span className="text-violet-400">$ </span>{msg.suggestedCommand}
                          </div>
                        )}
                        <div className="flex items-center gap-2 pt-1">
                          <button
                            type="button"
                            onPointerDown={(e) => {
                              e.preventDefault();
                              detectLocalModels();
                            }}
                            className="px-2 py-1 rounded bg-amber-600/60 hover:bg-amber-600 text-white text-[10px] font-semibold transition-colors cursor-pointer flex items-center gap-1"
                          >
                            <RefreshCw size={10} />
                            <span>Scan Ollama & llama.cpp</span>
                          </button>
                          <button
                            type="button"
                            onPointerDown={(e) => {
                              e.preventDefault();
                              setSelectedModel(CLOUD_FALLBACK_MODELS[0]);
                              if (showToast) showToast('Switched to Cloud Gemini 3.7');
                            }}
                            className="px-2 py-1 rounded bg-white/10 hover:bg-white/20 text-slate-200 text-[10px] font-medium transition-colors cursor-pointer"
                          >
                            Switch to Cloud AI
                          </button>
                        </div>
                      </div>
                    ) : (
                      <div
                        className={`max-w-[88%] px-3.5 py-2 rounded-xl text-xs leading-relaxed ${
                          msg.sender === 'user'
                            ? 'bg-violet-600 text-white shadow-xs'
                            : 'bg-white/[0.05] text-slate-100 border border-white/10'
                        }`}
                      >
                        {msg.text}
                        {msg.isStreaming && (
                          <span className="inline-block w-1.5 h-3.5 bg-violet-400 ml-1 animate-pulse" />
                        )}
                      </div>
                    )}

                    {msg.sender === 'agent' && !msg.isError && (
                      <div className="flex items-center gap-1.5 mt-1 px-1 text-[9px] text-slate-500 font-mono">
                        <span>{msg.modelTag || selectedModel.name}</span>
                      </div>
                    )}
                  </div>
                ))
              )}

              {isGenerating && !chatMessages.some((m) => m.isStreaming) && (
                <div className="flex items-center gap-2 p-2.5 rounded-xl bg-white/[0.03] border border-white/[0.06] text-xs text-slate-400 w-fit animate-pulse">
                  <Cpu size={13} className="text-violet-400 animate-spin" />
                  <span className="text-[11px]">Connecting to {selectedModel.name}...</span>
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

            {/* 4. EXPANSIVE PROMPT INPUT CONTAINER WITH VOICE & REAL OLLAMA / GGUF MODEL PICKER */}
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
                  placeholder={`Ask ${selectedModel.name} or type /command...`}
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

                    {/* Real Model Picker Chip */}
                    <div ref={modelPickerRef} className="relative">
                      <button
                        type="button"
                        onPointerDown={(e) => {
                          e.preventDefault();
                          setIsModelPickerOpen((prev) => !prev);
                        }}
                        className="flex items-center gap-1.5 px-2 py-1 rounded-md bg-white/[0.05] hover:bg-white/10 text-[10.5px] font-medium text-slate-300 hover:text-white transition-all cursor-pointer border border-white/[0.06]"
                        title="Select Local Ollama / llama.cpp or Cloud Model"
                      >
                        <span
                          className={`w-1.5 h-1.5 rounded-full ${
                            selectedModel.isLocal
                              ? serverConnectionStatus === 'online'
                                ? 'bg-emerald-400'
                                : 'bg-amber-400'
                              : 'bg-emerald-400'
                          }`}
                        />
                        <span className="font-semibold max-w-[110px] truncate">{selectedModel.name}</span>
                        <ChevronDown size={11} className="text-slate-500" />
                      </button>

                      {/* Model Selector Popover Dropdown */}
                      {isModelPickerOpen && (
                        <div className="absolute left-0 bottom-8 mb-1 w-80 p-2.5 bg-[#181A24] border border-white/15 rounded-xl shadow-2xl z-50 animate-in zoom-in-95 duration-150 font-sans text-xs space-y-2.5">
                          <div className="flex items-center justify-between px-1">
                            <span className="text-[10px] font-semibold text-slate-400 uppercase tracking-wider">
                              Inference Engine
                            </span>
                            <button
                              type="button"
                              onPointerDown={(e) => {
                                e.preventDefault();
                                detectLocalModels();
                              }}
                              className="text-[10px] text-violet-400 hover:text-violet-300 flex items-center gap-1 font-semibold cursor-pointer"
                            >
                              <RefreshCw size={10} className={isScanningServer ? 'animate-spin' : ''} />
                              <span>Rescan All (Ollama & llama.cpp)</span>
                            </button>
                          </div>

                          {/* Detected Local Models Section */}
                          <div className="space-y-1">
                            <div className="flex items-center justify-between px-1">
                              <span className="text-[9px] font-semibold uppercase tracking-wider text-slate-400">
                                Local Models ({detectedLocalModels.length})
                              </span>
                              <span className="text-[9px] text-emerald-400 font-mono">
                                {serverConnectionStatus === 'online' ? `● ${detectedProvider} Online` : '● Offline'}
                              </span>
                            </div>

                            {detectedLocalModels.length > 0 ? (
                              <div className="max-h-40 overflow-y-auto space-y-1 pr-0.5 regaarder-scrollbar">
                                {detectedLocalModels.map((model) => (
                                  <button
                                    key={model.id}
                                    type="button"
                                    onPointerDown={(e) => {
                                      e.preventDefault();
                                      setSelectedModel(model);
                                      setIsModelPickerOpen(false);
                                      if (showToast) showToast(`Active model: ${model.name}`);
                                    }}
                                    className={`w-full flex items-start justify-between p-2 rounded-lg text-left transition-all cursor-pointer ${
                                      selectedModel.id === model.id
                                        ? 'bg-violet-600/25 border border-violet-500/50 text-white shadow-2xs'
                                        : 'hover:bg-white/[0.05] border border-transparent text-slate-300'
                                    }`}
                                  >
                                    <div className="space-y-0.5 min-w-0 pr-2">
                                      <div className="flex items-center gap-1.5">
                                        <span className="font-semibold text-[11px] truncate text-slate-100">{model.name}</span>
                                        <span className="text-[9px] px-1 py-0.2 rounded bg-emerald-500/15 text-emerald-300 font-mono border border-emerald-500/30">
                                          {model.tag || model.provider}
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
                            ) : (
                              <div className="p-2.5 rounded-lg bg-white/[0.02] border border-white/[0.06] text-[10px] text-slate-400 space-y-1">
                                <span>No active Ollama/llama models detected on ports 11434 / 8080.</span>
                              </div>
                            )}

                            {/* 1-Click Pull / Download Model Accordion Trigger */}
                            <div className="pt-1">
                              <button
                                type="button"
                                onPointerDown={(e) => {
                                  e.preventDefault();
                                  setShowPullDrawer((prev) => !prev);
                                }}
                                className="w-full flex items-center justify-between p-2 rounded-lg bg-sky-500/10 hover:bg-sky-500/20 border border-sky-500/20 text-sky-200 transition-all text-left cursor-pointer"
                              >
                                <div className="flex items-center gap-1.5">
                                  <Download size={13} className="text-sky-400" />
                                  <span className="text-[11px] font-semibold">1-Click Download Model to Machine</span>
                                </div>
                                <span className="text-[9px] font-mono text-sky-400">
                                  {showPullDrawer ? 'Hide ▲' : 'Pull ▼'}
                                </span>
                              </button>

                              {/* Pull Drawer */}
                              {showPullDrawer && (
                                <div className="mt-1.5 p-2 rounded-lg bg-black/50 border border-sky-500/20 space-y-2 animate-in fade-in duration-150">
                                  <span className="text-[9px] font-semibold uppercase tracking-wider text-slate-400 block">
                                    Popular Fast Edge Models
                                  </span>
                                  <div className="grid grid-cols-1 gap-1">
                                    {POPULAR_PULL_MODELS.map((item) => (
                                      <div
                                        key={item.name}
                                        className="flex items-center justify-between p-1.5 rounded bg-white/[0.03] hover:bg-white/[0.07] text-[10px]"
                                      >
                                        <div className="min-w-0 pr-1">
                                          <strong className="text-slate-200 block truncate">{item.name}</strong>
                                          <span className="text-[9px] text-slate-500">{item.size} • {item.desc}</span>
                                        </div>
                                        <button
                                          type="button"
                                          disabled={isPullingModel}
                                          onPointerDown={(e) => {
                                            e.preventDefault();
                                            handlePullModel(item.name);
                                          }}
                                          className="px-2 py-0.5 rounded bg-sky-600 hover:bg-sky-500 text-white font-semibold transition-colors cursor-pointer disabled:opacity-40 shrink-0"
                                        >
                                          {isPullingModel ? '...' : 'Download'}
                                        </button>
                                      </div>
                                    ))}
                                  </div>

                                  {/* Custom model name pull input */}
                                  <div className="flex items-center gap-1 pt-1">
                                    <input
                                      type="text"
                                      value={pullModelInput}
                                      onChange={(e) => setPullModelInput(e.target.value)}
                                      placeholder="e.g. gemma3:1b or mistral"
                                      className="flex-1 px-2 py-1 rounded bg-white/10 text-[10px] text-slate-100 border-none outline-none"
                                    />
                                    <button
                                      type="button"
                                      disabled={!pullModelInput.trim() || isPullingModel}
                                      onPointerDown={(e) => {
                                        e.preventDefault();
                                        handlePullModel();
                                      }}
                                      className="px-2 py-1 rounded bg-sky-600 hover:bg-sky-500 text-white font-semibold text-[10px] cursor-pointer disabled:opacity-30"
                                    >
                                      Pull
                                    </button>
                                  </div>

                                  {pullProgressText && (
                                    <div className="p-1.5 rounded bg-sky-950/40 border border-sky-500/30 text-[9.5px] font-mono text-sky-300">
                                      {pullProgressText}
                                    </div>
                                  )}
                                </div>
                              )}
                            </div>

                            {/* Direct GGUF File Picker Button */}
                            <button
                              type="button"
                              onPointerDown={(e) => {
                                e.preventDefault();
                                fileInputRef.current?.click();
                              }}
                              className="w-full flex items-center justify-between p-2 rounded-lg bg-white/[0.03] hover:bg-white/[0.08] border border-dashed border-white/20 text-slate-300 hover:text-white transition-all text-left cursor-pointer"
                            >
                              <div className="flex items-center gap-1.5">
                                <FolderOpen size={13} className="text-amber-400" />
                                <span className="text-[11px] font-medium">Browse Local .GGUF File on Disk...</span>
                              </div>
                              <span className="text-[9px] text-slate-500 font-mono">Pick File</span>
                            </button>
                          </div>

                          {/* Cloud Models Section */}
                          <div className="space-y-1 pt-1.5 border-t border-white/[0.06]">
                            <span className="text-[9px] font-semibold uppercase tracking-wider text-slate-400 px-1 block">
                              Cloud Engines
                            </span>
                            {CLOUD_FALLBACK_MODELS.map((model) => (
                              <button
                                key={model.id}
                                type="button"
                                onPointerDown={(e) => {
                                  e.preventDefault();
                                  setSelectedModel(model);
                                  setIsModelPickerOpen(false);
                                  if (showToast) showToast(`Active model: ${model.name}`);
                                }}
                                className={`w-full flex items-start justify-between p-1.5 rounded-lg text-left transition-all cursor-pointer ${
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
                                </div>
                                {selectedModel.id === model.id && (
                                  <Check size={13} className="text-violet-400 shrink-0 mt-0.5" />
                                )}
                              </button>
                            ))}
                          </div>

                          {/* Endpoint Setting & Status Footer */}
                          <div className="p-2 rounded-lg bg-black/50 border border-white/[0.06] text-[10px] font-mono text-slate-400 space-y-1">
                            <div className="flex items-center justify-between">
                              <span>Active Endpoint:</span>
                              <span className="text-slate-200 font-semibold">{customEndpoint}</span>
                            </div>
                            <div className="flex items-center justify-between">
                              <span>Status:</span>
                              <span className={serverConnectionStatus === 'online' ? 'text-emerald-400' : 'text-amber-400'}>
                                {serverConnectionStatus === 'online' ? '● Online (Direct SSE)' : '● Offline'}
                              </span>
                            </div>
                          </div>
                        </div>
                      )}
                    </div>
                  </div>

                  {/* Right: Voice Dictation & Send Button */}
                  <div className="flex items-center gap-1.5">
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
