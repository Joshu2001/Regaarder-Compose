const fs = require('fs');
const babel = require('@babel/parser');

let content = fs.readFileSync('src/components/browser/BrowserResearchPanel.jsx', 'utf8');

// The closing JSX tags at the end of the component
const closingTarget = `        )}

      </div>
    </div>
  );
};`;

const drawerCode = `        )}

      {/* 5. DEDICATED IN-SIDEBAR AI & API KEYS SETTINGS VIEW */}
      {isAiSettingsOpen && (
        <div className="absolute inset-0 z-[9999] bg-[#12141C] flex flex-col p-4 overflow-y-auto regaarder-scrollbar animate-in fade-in duration-150 text-slate-100 font-sans">
          {/* Header */}
          <div className="flex items-center justify-between pb-3 border-b border-white/[0.08] shrink-0 mb-4">
            <div className="flex items-center gap-2">
              <div className="w-7 h-7 rounded-xl bg-violet-600/20 border border-violet-500/30 flex items-center justify-center text-violet-400">
                <KeyRound size={15} />
              </div>
              <div>
                <h3 className="text-xs font-bold text-white tracking-tight">AI & API Keys</h3>
                <p className="text-[10px] text-slate-400">Saved in browser local storage</p>
              </div>
            </div>
            <button
              type="button"
              onPointerDown={(e) => {
                e.preventDefault();
                setIsAiSettingsOpen(false);
              }}
              className="p-1.5 rounded-lg text-slate-400 hover:text-white hover:bg-white/10 transition-colors cursor-pointer"
              title="Close Settings"
            >
              <X size={15} />
            </button>
          </div>

          <div className="space-y-4 flex-1">
            <p className="text-[11px] text-slate-300 leading-relaxed">
              Enter your Gemini or Claude API key below to run AI models directly in your research browser.
            </p>

            {/* Google Gemini Card */}
            <div className="p-3.5 rounded-2xl bg-white/[0.03] border border-white/10 space-y-2.5">
              <div className="flex items-center justify-between">
                <div className="flex items-center gap-1.5">
                  <Sparkles size={13} className="text-violet-400" />
                  <span className="text-xs font-bold text-white">Google Gemini API Key</span>
                </div>
                {aiConfig.geminiApiKey ? (
                  <span className="text-[9.5px] text-emerald-400 font-semibold flex items-center gap-1">
                    <CheckCircle2 size={11} /> Saved
                  </span>
                ) : (
                  <span className="text-[9.5px] text-slate-500">Optional</span>
                )}
              </div>

              <div className="relative">
                <input
                  type={showGeminiKey ? 'text' : 'password'}
                  value={aiConfig.geminiApiKey || ''}
                  onChange={(e) => saveAiConfig({ geminiApiKey: e.target.value.trim() })}
                  placeholder="Paste Gemini key (AIzaSy...)"
                  className="w-full px-3 py-2 pr-16 rounded-xl bg-black/60 border border-white/15 text-[11px] text-white font-mono placeholder-slate-500 outline-none focus:border-violet-500 transition-all"
                />
                <div className="absolute right-2 top-1/2 -translate-y-1/2 flex items-center gap-1">
                  <button
                    type="button"
                    onPointerDown={(e) => {
                      e.preventDefault();
                      setShowGeminiKey(!showGeminiKey);
                    }}
                    className="p-1 text-slate-400 hover:text-white cursor-pointer"
                    title={showGeminiKey ? 'Hide key' : 'Show key'}
                  >
                    {showGeminiKey ? <EyeOff size={12} /> : <Eye size={12} />}
                  </button>
                  {aiConfig.geminiApiKey && (
                    <button
                      type="button"
                      onPointerDown={(e) => {
                        e.preventDefault();
                        saveAiConfig({ geminiApiKey: '' });
                      }}
                      className="p-1 text-slate-400 hover:text-red-400 cursor-pointer"
                      title="Clear Key"
                    >
                      <X size={12} />
                    </button>
                  )}
                </div>
              </div>

              <div className="flex items-center justify-between pt-1">
                <span className="text-[10.5px] text-slate-400">Model:</span>
                <select
                  value={aiConfig.geminiModel || 'gemini-2.5-flash'}
                  onChange={(e) => saveAiConfig({ geminiModel: e.target.value })}
                  className="bg-black/80 border border-white/15 rounded-lg px-2 py-1 text-[11px] text-slate-200 outline-none focus:border-violet-500"
                >
                  <option value="gemini-2.5-flash">gemini-2.5-flash (Fast)</option>
                  <option value="gemini-2.5-pro">gemini-2.5-pro (Reasoning)</option>
                  <option value="gemini-1.5-flash">gemini-1.5-flash</option>
                  <option value="gemini-1.5-pro">gemini-1.5-pro</option>
                </select>
              </div>
            </div>

            {/* Anthropic Claude Card */}
            <div className="p-3.5 rounded-2xl bg-white/[0.03] border border-white/10 space-y-2.5">
              <div className="flex items-center justify-between">
                <div className="flex items-center gap-1.5">
                  <Cpu size={13} className="text-amber-400" />
                  <span className="text-xs font-bold text-white">Anthropic Claude API Key</span>
                </div>
                {aiConfig.claudeApiKey ? (
                  <span className="text-[9.5px] text-emerald-400 font-semibold flex items-center gap-1">
                    <CheckCircle2 size={11} /> Saved
                  </span>
                ) : (
                  <span className="text-[9.5px] text-slate-500">Optional</span>
                )}
              </div>

              <div className="relative">
                <input
                  type={showClaudeKey ? 'text' : 'password'}
                  value={aiConfig.claudeApiKey || ''}
                  onChange={(e) => saveAiConfig({ claudeApiKey: e.target.value.trim() })}
                  placeholder="Paste Claude key (sk-ant-api03-...)"
                  className="w-full px-3 py-2 pr-16 rounded-xl bg-black/60 border border-white/15 text-[11px] text-white font-mono placeholder-slate-500 outline-none focus:border-amber-500 transition-all"
                />
                <div className="absolute right-2 top-1/2 -translate-y-1/2 flex items-center gap-1">
                  <button
                    type="button"
                    onPointerDown={(e) => {
                      e.preventDefault();
                      setShowClaudeKey(!showClaudeKey);
                    }}
                    className="p-1 text-slate-400 hover:text-white cursor-pointer"
                    title={showClaudeKey ? 'Hide key' : 'Show key'}
                  >
                    {showClaudeKey ? <EyeOff size={12} /> : <Eye size={12} />}
                  </button>
                  {aiConfig.claudeApiKey && (
                    <button
                      type="button"
                      onPointerDown={(e) => {
                        e.preventDefault();
                        saveAiConfig({ claudeApiKey: '' });
                      }}
                      className="p-1 text-slate-400 hover:text-red-400 cursor-pointer"
                      title="Clear Key"
                    >
                      <X size={12} />
                    </button>
                  )}
                </div>
              </div>

              <div className="flex items-center justify-between pt-1">
                <span className="text-[10.5px] text-slate-400">Model:</span>
                <select
                  value={aiConfig.claudeModel || 'claude-3-7-sonnet-20250219'}
                  onChange={(e) => saveAiConfig({ claudeModel: e.target.value })}
                  className="bg-black/80 border border-white/15 rounded-lg px-2 py-1 text-[11px] text-slate-200 outline-none focus:border-amber-500"
                >
                  <option value="claude-3-7-sonnet-20250219">claude-3-7-sonnet</option>
                  <option value="claude-3-5-sonnet-20241022">claude-3-5-sonnet</option>
                  <option value="claude-3-5-haiku-20241022">claude-3-5-haiku</option>
                </select>
              </div>
            </div>

            {/* Test Connection Buttons */}
            <div className="p-3 rounded-2xl bg-black/40 border border-white/10 space-y-2">
              <div className="flex items-center justify-between">
                <span className="text-[10.5px] text-slate-400 font-medium">Verify Connection</span>
                <div className="flex items-center gap-1.5">
                  <button
                    type="button"
                    disabled={keyTestState.testing}
                    onPointerDown={(e) => {
                      e.preventDefault();
                      testKeyConnection('gemini');
                    }}
                    className="px-2.5 py-1 rounded-lg bg-violet-600/30 hover:bg-violet-600/50 border border-violet-500/40 text-[10.5px] font-semibold text-violet-300 transition-all flex items-center gap-1 cursor-pointer"
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
                    className="px-2.5 py-1 rounded-lg bg-amber-600/30 hover:bg-amber-600/50 border border-amber-500/40 text-[10.5px] font-semibold text-amber-300 transition-all flex items-center gap-1 cursor-pointer"
                  >
                    {keyTestState.testing ? <Loader2 size={11} className="animate-spin" /> : <RefreshCw size={11} />}
                    <span>Test Claude</span>
                  </button>
                </div>
              </div>
              {keyTestState.message && (
                <div className={\`text-[10.5px] p-2 rounded-xl flex items-center gap-1.5 \${
                  keyTestState.usable === true
                    ? 'bg-emerald-500/15 text-emerald-300 border border-emerald-500/30'
                    : keyTestState.usable === false
                    ? 'bg-rose-500/15 text-rose-300 border border-rose-500/30'
                    : 'bg-white/5 text-slate-300'
                }\`}>
                  {keyTestState.usable === true ? <CheckCircle2 size={12} className="shrink-0" /> : <AlertCircle size={12} className="shrink-0" />}
                  <span>{keyTestState.message}</span>
                </div>
              )}
            </div>

            <button
              type="button"
              onPointerDown={(e) => {
                e.preventDefault();
                setIsAiSettingsOpen(false);
                if (showToast) showToast('AI API Keys saved in browser');
              }}
              className="w-full py-2.5 rounded-xl bg-violet-600 hover:bg-violet-500 text-white font-bold text-xs transition-all shadow-lg cursor-pointer shrink-0 mt-2"
            >
              Done & Save Keys
            </button>
          </div>
        </div>
      )}

      </div>
    </div>
  );
};`;

if (content.includes(closingTarget)) {
  content = content.replace(closingTarget, drawerCode);
  console.log("Inserted AI settings drawer successfully!");
} else {
  console.error("closingTarget not found!");
  process.exit(1);
}

// Verify with Babel
try {
  babel.parse(content, { sourceType: 'module', plugins: ['jsx'] });
  console.log("Babel Parse: SUCCESS!");
  fs.writeFileSync('src/components/browser/BrowserResearchPanel.jsx', content, 'utf8');
  console.log("Saved BrowserResearchPanel.jsx successfully!");
} catch (err) {
  console.error("Babel Parse Error:", err);
  process.exit(1);
}
