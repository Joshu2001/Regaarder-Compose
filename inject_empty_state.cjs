const fs = require('fs');
const file = 'c:\\Users\\user\\Downloads\\Project MOAT\\Regaarder Compose\\src\\App.jsx';
let content = fs.readFileSync(file, 'utf8');

const target = `{chatMessages.map((msg) => (`;
const replacement = `{chatMessages.length === 0 && (
                  <div className="flex flex-col items-center justify-center h-full text-center px-4 pt-10">
                    <div className="w-16 h-16 bg-violet-50 rounded-[20px] flex items-center justify-center mb-5 text-violet-600 relative border border-violet-100 shadow-sm">
                      <MessageSquare size={26} strokeWidth={2.5} />
                      <Sparkles size={16} className="absolute -top-1.5 -right-1.5 text-violet-400" fill="currentColor" />
                    </div>
                    <h3 className="text-[16px] font-bold text-gray-900 mb-2.5 tracking-tight">Your AI Co-pilot</h3>
                    <p className="text-[13px] text-gray-500 max-w-[260px] leading-relaxed mb-8">
                      I can help you write, summarize, brainstorm, and more. Start a conversation below.
                    </p>
                    
                    <div className="grid grid-cols-2 gap-2 w-full max-w-[340px]">
                      <button onClick={() => setChatInput('Summarize this document ')} className="px-3 py-3 rounded-[12px] border border-gray-200 bg-white hover:border-violet-300 hover:bg-violet-50 text-[11px] font-semibold text-gray-700 transition-colors flex items-center justify-center gap-2">
                        <FileText size={14} className="text-violet-500" />
                        Summarize doc
                      </button>
                      <button onClick={() => setChatInput('Extract key points from ')} className="px-3 py-3 rounded-[12px] border border-gray-200 bg-white hover:border-violet-300 hover:bg-violet-50 text-[11px] font-semibold text-gray-700 transition-colors flex items-center justify-center gap-2">
                        <Sparkles size={14} className="text-violet-500" />
                        Extract points
                      </button>
                      <button onClick={() => setChatInput('Suggest improvements for ')} className="px-3 py-3 rounded-[12px] border border-gray-200 bg-white hover:border-violet-300 hover:bg-violet-50 text-[11px] font-semibold text-gray-700 transition-colors flex items-center justify-center gap-2">
                        <PenTool size={14} className="text-violet-500" />
                        Improve text
                      </button>
                      <button onClick={() => setChatInput('Generate action items ')} className="px-3 py-3 rounded-[12px] border border-gray-200 bg-white hover:border-violet-300 hover:bg-violet-50 text-[11px] font-semibold text-gray-700 transition-colors flex items-center justify-center gap-2">
                        <CheckSquare size={14} className="text-violet-500" />
                        Action items
                      </button>
                    </div>
                  </div>
                )}
                {chatMessages.map((msg) => (`;

content = content.replace(target, replacement);

fs.writeFileSync(file, content, 'utf8');
console.log('Injected empty state');
