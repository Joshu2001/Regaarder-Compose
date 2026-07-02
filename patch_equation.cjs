const fs = require('fs');

const path = 'temp_app.jsx';
let content = fs.readFileSync(path, 'utf8');
let modified = false;

// Normalize line endings for reliable searching
// We'll keep original line endings for writing, but for regex matching, it's easier.

// 1. Add KaTeX imports
if (!content.includes('import katex from')) {
  content = content.replace(
    /import { io } from 'socket\.io-client';/g,
    "import { io } from 'socket.io-client';\nimport katex from 'katex';\nimport 'katex/dist/katex.min.css';"
  );
  modified = true;
}

// 2. Add SLASH_OPTION
if (!content.includes('import_equation')) {
  content = content.replace(
    /\{ key: 'redact', label: 'Redact \/ Protect', desc: 'Redact selection or current block' \}/g,
    "{ key: 'redact', label: 'Redact / Protect', desc: 'Redact selection or current block' },\n  { key: 'import_equation', label: 'Import Equation', desc: 'AI Generate or Upload Math' }"
  );
  modified = true;
}

// 3. Add Equation Modal State
if (!content.includes('equationModalOpen')) {
  content = content.replace(
    /const \[chartsModalOpen, setChartsModalOpen\] = useState\(false\);/g,
    "const [chartsModalOpen, setChartsModalOpen] = useState(false);\n  const [equationModalOpen, setEquationModalOpen] = useState(false);"
  );
  modified = true;
}

// 4. Add slash command execution
if (!content.includes("key === 'import_equation'")) {
  content = content.replace(
    /if \(key === 'table'\) \{/g,
    "if (key === 'import_equation') {\n      setEquationModalOpen(true);\n      return;\n    }\n    if (key === 'table') {"
  );
  modified = true;
}

// 5. Add EquationModal JSX
const modalJSX = `
      {/* Equation Import Modal */}
      {equationModalOpen && (
        <div className="fixed inset-0 bg-black/60 z-50 flex items-center justify-center p-4">
          <div className="bg-white rounded-xl shadow-2xl max-w-lg w-full flex flex-col overflow-hidden">
            <div className="flex items-center justify-between p-4 border-b">
              <h2 className="font-semibold text-lg flex items-center gap-2"><SigmaIcon size={20} className="text-purple-600"/> Import Equation</h2>
              <button onClick={() => setEquationModalOpen(false)} className="p-1 hover:bg-gray-100 rounded-lg text-gray-500">
                <X size={20} />
              </button>
            </div>
            
            <div className="p-4 flex flex-col gap-4">
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">Describe the equation</label>
                <textarea 
                  id="equation-prompt-input"
                  placeholder="e.g. The quadratic formula, or integral of x squared..."
                  className="w-full border rounded-lg p-3 text-sm focus:ring-2 focus:ring-purple-500 min-h-[80px]"
                />
              </div>
              
              <div className="flex items-center gap-4">
                <div className="flex-1 h-px bg-gray-200"></div>
                <span className="text-xs text-gray-400 font-medium uppercase">OR</span>
                <div className="flex-1 h-px bg-gray-200"></div>
              </div>
              
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">Upload Image (Math OCR)</label>
                <div className="border-2 border-dashed rounded-lg p-6 flex flex-col items-center justify-center gap-2 bg-gray-50 hover:bg-gray-100 transition-colors">
                  <ImageIcon size={24} className="text-gray-400" />
                  <span className="text-sm text-gray-500 text-center">Drag & drop formula image here<br/>(Coming soon: hook up to input[type=file])</span>
                </div>
              </div>
            </div>
            
            <div className="p-4 border-t bg-gray-50 flex justify-end gap-2">
              <button onClick={() => setEquationModalOpen(false)} className="px-4 py-2 text-sm font-medium hover:bg-gray-200 rounded-lg">Cancel</button>
              <button 
                className="px-4 py-2 bg-purple-600 hover:bg-purple-700 text-white text-sm font-medium rounded-lg flex items-center gap-2 shadow-sm"
                onClick={async (e) => {
                  const btn = e.currentTarget;
                  const prompt = document.getElementById('equation-prompt-input').value;
                  if (!prompt) return;
                  
                  const originalText = btn.innerText;
                  btn.innerText = 'Generating...';
                  btn.disabled = true;
                  
                  try {
                    const res = await fetch('/api/math', {
                      method: 'POST',
                      headers: {'Content-Type': 'application/json'},
                      body: JSON.stringify({ prompt })
                    });
                    const data = await res.json();
                    
                    if (data.ok && data.latex) {
                      const rendered = katex.renderToString(data.latex, { throwOnError: false, displayMode: true });
                      const htmlStr = \`<span class="equation-node" contenteditable="false" style="display:inline-block; margin: 8px 0; padding: 8px; border-radius: 8px; background: #f8fafc; border: 1px solid #e2e8f0; cursor: pointer;" title="LaTeX: \${data.latex}">\${rendered}</span>&nbsp;\`;
                      
                      setEquationModalOpen(false);
                      setTimeout(() => {
                         blankBodyRef.current?.focus();
                         document.execCommand('insertHTML', false, htmlStr);
                      }, 100);
                    } else {
                      alert('Failed to generate math: ' + (data.error || 'Unknown'));
                    }
                  } catch (err) {
                    alert('Network error');
                  } finally {
                    btn.innerText = originalText;
                    btn.disabled = false;
                  }
                }}
              >
                <Sparkles size={16} /> Generate Math
              </button>
            </div>
          </div>
        </div>
      )}
`;

if (!content.includes('Equation Import Modal')) {
  content = content.replace(
    /\{shareModalOpen && \(/g,
    modalJSX + "\n      {shareModalOpen && ("
  );
  modified = true;
}

if (modified) {
  fs.writeFileSync(path, content, 'utf8');
  console.log('Successfully patched temp_app.jsx for Equation feature.');
} else {
  console.log('No modifications made. Strings not found.');
}
