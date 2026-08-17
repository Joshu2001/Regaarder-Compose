const fs = require('fs');
const babel = require('@babel/parser');

let content = fs.readFileSync('src/components/browser/BrowserResearchPanel.jsx', 'utf8');

// 1. Update imports
const importTarget = `import {
  Mic,`;
const importReplacement = `import {
  Settings,
  KeyRound,
  EyeOff,
  Loader2,
  Mic,`;

content = content.replace(importTarget, importReplacement);

// 2. Add AI key states
const stateTarget = `  const [isModelPickerOpen, setIsModelPickerOpen] = useState(false);`;
const stateReplacement = `  const [isModelPickerOpen, setIsModelPickerOpen] = useState(false);
  const [isAiSettingsOpen, setIsAiSettingsOpen] = useState(false);
  const [aiConfig, setAiConfig] = useState(() => {
    try {
      const saved = localStorage.getItem('regaarder_ai_config');
      if (saved) return JSON.parse(saved);
    } catch (_) {}
    return {
      provider: 'gemini',
      geminiApiKey: '',
      claudeApiKey: '',
      geminiModel: 'gemini-2.5-flash',
      claudeModel: 'claude-3-7-sonnet-20250219',
    };
  });
  const [keyTestState, setKeyTestState] = useState({ testing: false, message: '', usable: null });
  const [showGeminiKey, setShowGeminiKey] = useState(false);
  const [showClaudeKey, setShowClaudeKey] = useState(false);

  const saveAiConfig = (updates) => {
    setAiConfig((prev) => {
      const next = { ...prev, ...updates };
      try {
        localStorage.setItem('regaarder_ai_config', JSON.stringify(next));
      } catch (_) {}
      return next;
    });
  };

  const testKeyConnection = async (providerName, keyVal) => {
    const prov = providerName || aiConfig.provider || 'gemini';
    const key = keyVal !== undefined ? keyVal : (prov === 'claude' ? aiConfig.claudeApiKey : aiConfig.geminiApiKey);
    setKeyTestState({ testing: true, message: \`Connecting to \${prov === 'claude' ? 'Claude' : 'Gemini'}...\`, usable: null });
    try {
      const res = await fetch(\`/api/ai-status?provider=\${encodeURIComponent(prov)}\`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ provider: prov, apiKey: key || undefined })
      });
      const data = await res.json().catch(() => ({}));
      if (res.ok && data?.ok) {
        setKeyTestState({ testing: false, message: data.reason || 'Connected successfully!', usable: Boolean(data.usable) });
      } else {
        setKeyTestState({ testing: false, message: data?.error || 'Connection failed', usable: false });
      }
    } catch (e) {
      setKeyTestState({ testing: false, message: 'Could not contact status endpoint', usable: false });
    }
  };`;

content = content.replace(stateTarget, stateReplacement);

// 3. Add Settings button to header
const headerTarget = `          <button
            type="button"
            onPointerDown={(e) => {
              e.preventDefault();
              setShowHistoryDrawer((prev) => !prev);
            }}
            className={\`p-1.5 rounded-md transition-all cursor-pointer \${
              showHistoryDrawer
                ? 'bg-violet-500/20 text-violet-300 ring-1 ring-violet-500/30'
                : 'text-slate-400 hover:text-slate-200 hover:bg-white/[0.06]'
            }\`}
            title="Chat History & Past Research Sessions"
          >
            <History size={13} />
          </button>`;

const headerReplacement = `          {/* API Keys & AI Settings Button */}
          <button
            type="button"
            onPointerDown={(e) => {
              e.preventDefault();
              setIsAiSettingsOpen((prev) => !prev);
            }}
            className={\`p-1.5 rounded-md transition-all cursor-pointer \${
              isAiSettingsOpen
                ? 'bg-violet-500/20 text-violet-300 ring-1 ring-violet-500/30'
                : 'text-slate-400 hover:text-slate-200 hover:bg-white/[0.06]'
            }\`}
            title="AI & API Keys (Gemini, Claude Settings)"
          >
            <Settings size={13} />
          </button>

          <button
            type="button"
            onPointerDown={(e) => {
              e.preventDefault();
              setShowHistoryDrawer((prev) => !prev);
            }}
            className={\`p-1.5 rounded-md transition-all cursor-pointer \${
              showHistoryDrawer
                ? 'bg-violet-500/20 text-violet-300 ring-1 ring-violet-500/30'
                : 'text-slate-400 hover:text-slate-200 hover:bg-white/[0.06]'
            }\`}
            title="Chat History & Past Research Sessions"
          >
            <History size={13} />
          </button>`;

content = content.replace(headerTarget, headerReplacement);

// 4. Update Cloud Engines header in model picker dropdown
const cloudEnginesTarget = `                          {/* Cloud Models Section */}
                          <div className="space-y-1 pt-1.5 border-t border-white/[0.06]">
                            <span className="text-[9px] font-semibold uppercase tracking-wider text-slate-400 px-1 block">
                              Cloud Engines
                            </span>`;

const cloudEnginesReplacement = `                          {/* Cloud Models Section */}
                          <div className="space-y-1 pt-1.5 border-t border-white/[0.06]">
                            <div className="flex items-center justify-between px-1">
                              <span className="text-[9px] font-semibold uppercase tracking-wider text-slate-400">
                                Cloud Engines
                              </span>
                              <button
                                type="button"
                                onPointerDown={(e) => {
                                  e.preventDefault();
                                  setIsModelPickerOpen(false);
                                  setIsAiSettingsOpen(true);
                                }}
                                className="text-[9px] text-violet-400 hover:text-violet-300 flex items-center gap-1 font-semibold cursor-pointer"
                              >
                                <KeyRound size={10} />
                                <span>API Keys</span>
                              </button>
                            </div>`;

content = content.replace(cloudEnginesTarget, cloudEnginesReplacement);

// 5. Connect Cloud Model execution to real API proxy instead of fake setTimeout
const cloudExecTarget = `    // Cloud Model Execution with Intelligent Grounding & Actions
    setTimeout(() => {`;

const cloudExecReplacement = `    // Cloud Model Execution with Intelligent Grounding & Real API Keys
    if (!isLocal) {
      (async () => {
        try {
          abortControllerRef.current = new AbortController();
          const isClaude = selectedModel.provider === 'Anthropic' || selectedModel.id.includes('claude');
          const endpoint = isClaude ? '/api/claude' : '/api/gemini';
          const apiKey = isClaude ? aiConfig.claudeApiKey : aiConfig.geminiApiKey;
          const model = isClaude ? (aiConfig.claudeModel || selectedModel.id) : (aiConfig.geminiModel || selectedModel.id);
          const systemPrompt = buildSystemPrompt(currentSchema, summary?.fullContext, updatedMessages, deepArticleSummaries);

          setChatMessages((prev) => [
            ...prev,
            {
              sender: 'agent',
              text: '',
              modelTag: \`\${selectedModel.name} (\${selectedModel.provider})\`,
              isStreaming: true
            }
          ]);

          const headers = { 'Content-Type': 'application/json' };
          if (apiKey) {
            if (isClaude) headers['x-anthropic-api-key'] = apiKey;
            else headers['x-gemini-api-key'] = apiKey;
          }

          const response = await fetch(endpoint, {
            method: 'POST',
            headers,
            body: JSON.stringify({
              userPrompt: promptWithAttachments,
              systemPrompt,
              model: model || undefined,
              apiKey: apiKey || undefined,
            }),
            signal: abortControllerRef.current.signal
          });

          const data = await response.json().catch(() => ({}));
          if (!response.ok || !data?.ok) {
            throw new Error(data?.error || \`HTTP \${response.status}: Failed to generate response\`);
          }

          const replyText = String(data?.text || '').trim();
          setChatMessages((prev) => {
            const copy = [...prev];
            const lastIdx = copy.length - 1;
            if (lastIdx >= 0 && copy[lastIdx].sender === 'agent') {
              copy[lastIdx] = {
                ...copy[lastIdx],
                text: replyText,
                isStreaming: false,
                sources: pageSources
              };
            }
            persistCurrentChatSession(copy);
            return copy;
          });
          setIsGenerating(false);
        } catch (err) {
          setChatMessages((prev) => [
            ...prev,
            {
              sender: 'agent',
              text: '',
              isError: true,
              modelTag: selectedModel.name,
              errorMessage: err.message || \`Unable to reach \${selectedModel.name}. Make sure your API key is configured in Settings.\`,
            }
          ]);
          setIsGenerating(false);
        }
      })();
      return;
    }

    // Fallback simulation for offline testing
    setTimeout(() => {`;

content = content.replace(cloudExecTarget, cloudExecReplacement);

// 6. Add Modal for AI Settings
const modalAnchor = `{/* Export to Sheet / Data Popover */}`;
const aiSettingsModalCode = `{/* Browser AI & API Keys Settings Modal */}
      {isAiSettingsOpen && (
        <div className="fixed inset-0 z-[1000] flex items-center justify-center p-4">
          <div
            className="absolute inset-0 bg-black/60 backdrop-blur-md"
            onPointerDown={(e) => {
              e.preventDefault();
              setIsAiSettingsOpen(false);
            }}
          />
          <div className="relative w-full max-w-[480px] bg-[#141520] border border-white/20 rounded-3xl p-6 shadow-2xl space-y-5 text-slate-100 z-10 animate-in zoom-in-95 duration-150">
            <div className="flex items-center justify-between">
              <div className="flex items-center gap-2.5">
                <div className="w-8 h-8 rounded-xl bg-violet-600/20 border border-violet-500/30 flex items-center justify-center text-violet-400">
                  <KeyRound size={16} />
                </div>
                <div>
                  <h3 className="text-base font-bold text-white tracking-tight">AI & API Keys</h3>
                  <p className="text-[11px] text-slate-400">Configured in browser local storage</p>
                </div>
              </div>
              <button
                type="button"
                onPointerDown={(e) => {
                  e.preventDefault();
                  setIsAiSettingsOpen(false);
                }}
                className="p-1.5 rounded-xl text-slate-400 hover:text-white hover:bg-white/10 transition-colors"
              >
                <X size={16} />
              </button>
            </div>

            <p className="text-[12px] text-slate-300 leading-relaxed">
              Enter your Gemini or Claude API key below to run AI models directly in the research browser sidebar.
            </p>

            {/* Google Gemini Card */}
            <div className="p-4 rounded-2xl bg-white/[0.03] border border-white/10 space-y-3">
              <div className="flex items-center justify-between">
                <div className="flex items-center gap-2">
                  <Sparkles size={14} className="text-violet-400" />
                  <span className="text-xs font-bold text-white">Google Gemini API Key</span>
                </div>
                {aiConfig.geminiApiKey ? (
                  <span className="text-[10px] text-emerald-400 font-semibold flex items-center gap-1">
                    <CheckCircle2 size={11} /> Saved
                  </span>
                ) : (
                  <span className="text-[10px] text-slate-500">Optional</span>
                )}
              </div>

              <div className="relative">
                <input
                  type={showGeminiKey ? 'text' : 'password'}
                  value={aiConfig.geminiApiKey || ''}
                  onChange={(e) => saveAiConfig({ geminiApiKey: e.target.value.trim() })}
                  placeholder="AIzaSy..."
                  className="w-full px-3 py-2 pr-16 rounded-xl bg-black/60 border border-white/15 text-xs text-white font-mono placeholder-slate-500 outline-none focus:border-violet-500 transition-all"
                />
                <div className="absolute right-2 top-1/2 -translate-y-1/2 flex items-center gap-1">
                  <button
                    type="button"
                    onPointerDown={(e) => {
                      e.preventDefault();
                      setShowGeminiKey(!showGeminiKey);
                    }}
                    className="p-1 text-slate-400 hover:text-white"
                  >
                    {showGeminiKey ? <EyeOff size={13} /> : <Eye size={13} />}
                  </button>
                  {aiConfig.geminiApiKey && (
                    <button
                      type="button"
                      onPointerDown={(e) => {
                        e.preventDefault();
                        saveAiConfig({ geminiApiKey: '' });
                      }}
                      className="p-1 text-slate-400 hover:text-red-400"
                    >
                      <X size={13} />
                    </button>
                  )}
                </div>
              </div>

              <div className="flex items-center justify-between pt-1">
                <span className="text-[11px] text-slate-400">Model:</span>
                <select
                  value={aiConfig.geminiModel || 'gemini-2.5-flash'}
                  onChange={(e) => saveAiConfig({ geminiModel: e.target.value })}
                  className="bg-black/80 border border-white/15 rounded-lg px-2 py-1 text-xs text-slate-200 outline-none focus:border-violet-500"
                >
                  <option value="gemini-2.5-flash">gemini-2.5-flash (Fast)</option>
                  <option value="gemini-2.5-pro">gemini-2.5-pro (Reasoning)</option>
                  <option value="gemini-1.5-flash">gemini-1.5-flash</option>
                  <option value="gemini-1.5-pro">gemini-1.5-pro</option>
                </select>
              </div>
            </div>

            {/* Anthropic Claude Card */}
            <div className="p-4 rounded-2xl bg-white/[0.03] border border-white/10 space-y-3">
              <div className="flex items-center justify-between">
                <div className="flex items-center gap-2">
                  <Cpu size={14} className="text-amber-400" />
                  <span className="text-xs font-bold text-white">Anthropic Claude API Key</span>
                </div>
                {aiConfig.claudeApiKey ? (
                  <span className="text-[10px] text-emerald-400 font-semibold flex items-center gap-1">
                    <CheckCircle2 size={11} /> Saved
                  </span>
                ) : (
                  <span className="text-[10px] text-slate-500">Optional</span>
                )}
              </div>

              <div className="relative">
                <input
                  type={showClaudeKey ? 'text' : 'password'}
                  value={aiConfig.claudeApiKey || ''}
                  onChange={(e) => saveAiConfig({ claudeApiKey: e.target.value.trim() })}
                  placeholder="sk-ant-api03-..."
                  className="w-full px-3 py-2 pr-16 rounded-xl bg-black/60 border border-white/15 text-xs text-white font-mono placeholder-slate-500 outline-none focus:border-amber-500 transition-all"
                />
                <div className="absolute right-2 top-1/2 -translate-y-1/2 flex items-center gap-1">
                  <button
                    type="button"
                    onPointerDown={(e) => {
                      e.preventDefault();
                      setShowClaudeKey(!showClaudeKey);
                    }}
                    className="p-1 text-slate-400 hover:text-white"
                  >
                    {showClaudeKey ? <EyeOff size={13} /> : <Eye size={13} />}
                  </button>
                  {aiConfig.claudeApiKey && (
                    <button
                      type="button"
                      onPointerDown={(e) => {
                        e.preventDefault();
                        saveAiConfig({ claudeApiKey: '' });
                      }}
                      className="p-1 text-slate-400 hover:text-red-400"
                    >
                      <X size={13} />
                    </button>
                  )}
                </div>
              </div>

              <div className="flex items-center justify-between pt-1">
                <span className="text-[11px] text-slate-400">Model:</span>
                <select
                  value={aiConfig.claudeModel || 'claude-3-7-sonnet-20250219'}
                  onChange={(e) => saveAiConfig({ claudeModel: e.target.value })}
                  className="bg-black/80 border border-white/15 rounded-lg px-2 py-1 text-xs text-slate-200 outline-none focus:border-amber-500"
                >
                  <option value="claude-3-7-sonnet-20250219">claude-3-7-sonnet</option>
                  <option value="claude-3-5-sonnet-20241022">claude-3-5-sonnet</option>
                  <option value="claude-3-5-haiku-20241022">claude-3-5-haiku</option>
                </select>
              </div>
            </div>

            {/* Test Connection & Feedback */}
            <div className="p-3 rounded-2xl bg-black/40 border border-white/10 space-y-2">
              <div className="flex items-center justify-between">
                <span className="text-[11px] text-slate-400 font-medium">Verify Connection</span>
                <div className="flex items-center gap-2">
                  <button
                    type="button"
                    disabled={keyTestState.testing}
                    onPointerDown={(e) => {
                      e.preventDefault();
                      testKeyConnection('gemini');
                    }}
                    className="px-2.5 py-1 rounded-lg bg-violet-600/30 hover:bg-violet-600/50 border border-violet-500/40 text-[11px] font-semibold text-violet-300 transition-all flex items-center gap-1"
                  >
                    {keyTestState.testing ? <Loader2 size={11} className="animate-spin" /> : <RefreshCw size={11} />}
                    <span>Test Gemini</span>
                  </button>
                  <button
                    type="button"
                    disabled={keyTestState.testing}
                    onPointerDown={(e) => {
                      e.preventDefault();
                      testKeyConnection('claude');
                    }}
                    className="px-2.5 py-1 rounded-lg bg-amber-600/30 hover:bg-amber-600/50 border border-amber-500/40 text-[11px] font-semibold text-amber-300 transition-all flex items-center gap-1"
                  >
                    {keyTestState.testing ? <Loader2 size={11} className="animate-spin" /> : <RefreshCw size={11} />}
                    <span>Test Claude</span>
                  </button>
                </div>
              </div>
              {keyTestState.message && (
                <div className={\`text-[11px] p-2 rounded-xl flex items-center gap-1.5 \${
                  keyTestState.usable === true
                    ? 'bg-emerald-500/15 text-emerald-300 border border-emerald-500/30'
                    : keyTestState.usable === false
                    ? 'bg-rose-500/15 text-rose-300 border border-rose-500/30'
                    : 'bg-white/5 text-slate-300'
                }\`}>
                  {keyTestState.usable === true ? <CheckCircle2 size={13} className="shrink-0" /> : <AlertCircle size={13} className="shrink-0" />}
                  <span>{keyTestState.message}</span>
                </div>
              )}
            </div>

            <button
              type="button"
              onPointerDown={(e) => {
                e.preventDefault();
                setIsAiSettingsOpen(false);
                if (showToast) showToast('AI settings saved in browser');
              }}
              className="w-full py-2.5 rounded-xl bg-violet-600 hover:bg-violet-500 text-white font-bold text-xs transition-all shadow-lg cursor-pointer"
            >
              Done & Save Settings
            </button>
          </div>
        </div>
      )}

      {/* Export to Sheet / Data Popover */}`;

content = content.replace(modalAnchor, aiSettingsModalCode);

// Verify with Babel
try {
  babel.parse(content, { sourceType: 'module', plugins: ['jsx'] });
  console.log("Babel Parse: SUCCESS for BrowserResearchPanel.jsx");
  fs.writeFileSync('src/components/browser/BrowserResearchPanel.jsx', content, 'utf8');
  console.log("BrowserResearchPanel.jsx updated successfully!");
} catch (err) {
  console.error("Babel Parse Error:", err);
  process.exit(1);
}
