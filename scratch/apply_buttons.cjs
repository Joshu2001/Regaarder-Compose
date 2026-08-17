const fs = require('fs');
const babel = require('@babel/parser');

let content = fs.readFileSync('src/components/browser/BrowserResearchPanel.jsx', 'utf8');

// 1. Add Settings button right before History in top bar
const topBarTarget = `          <button
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
            title="Chat History & Past Conversations"
          >
            <History size={14} strokeWidth={1.5} />
          </button>`;

const topBarReplacement = `          {/* Dedicated AI & Cloud API Keys Settings Button */}
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
            title="AI & API Keys Settings (Gemini, Claude)"
          >
            <Settings size={14} strokeWidth={1.5} />
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
            title="Chat History & Past Conversations"
          >
            <History size={14} strokeWidth={1.5} />
          </button>`;

if (content.includes(topBarTarget)) {
  content = content.replace(topBarTarget, topBarReplacement);
  console.log("Replaced topBarTarget successfully!");
} else {
  console.error("topBarTarget not found!");
  process.exit(1);
}

// 2. Add Configure Cloud API Keys button to starter prompts canvas
const starterTarget = `                  {/* Clean Starter Action Prompts */}
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
                  </div>`;

const starterReplacement = `                  {/* Clean Starter Action Prompts */}
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

                  {/* Prominent API Key Setup Banner */}
                  <button
                    type="button"
                    onPointerDown={(e) => {
                      e.preventDefault();
                      setIsAiSettingsOpen(true);
                    }}
                    className="w-full max-w-[320px] p-2.5 rounded-xl bg-violet-600/15 hover:bg-violet-600/25 border border-violet-500/30 text-[11px] font-semibold text-violet-300 flex items-center justify-center gap-2 transition-all cursor-pointer shadow-xs"
                  >
                    <KeyRound size={13} className="text-violet-400" />
                    <span>Configure Gemini & Claude API Keys</span>
                  </button>`;

if (content.includes(starterTarget)) {
  content = content.replace(starterTarget, starterReplacement);
  console.log("Replaced starterTarget successfully!");
} else {
  console.error("starterTarget not found!");
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
