const fs = require('fs');

const path = 'src/App.jsx';
let content = fs.readFileSync(path, 'utf8');

// First, remove all existing injected modals
const startMarker = "{/* Equation Import Modal */}";
const endMarker = "        </div>\n      )}\n";

let startIndex = content.indexOf(startMarker);
while (startIndex !== -1) {
  const endIndex = content.indexOf(endMarker, startIndex) + endMarker.length;
  content = content.slice(0, startIndex) + content.slice(endIndex);
  startIndex = content.indexOf(startMarker);
}

// Ensure clean slate by removing stray newlines caused by cleanup if necessary

const modalJSX = `      {/* Equation Import Modal */}
      {equationModalOpen && (
        <div className="fixed inset-0 bg-black/60 z-[99999] flex items-center justify-center p-4">
          <div className="bg-white rounded-xl shadow-2xl max-w-lg w-full flex flex-col overflow-hidden relative">
            <div className="flex items-center justify-between p-4 border-b">
              <h2 className="font-semibold text-lg flex items-center gap-2"><SigmaIcon size={20} className="text-purple-600"/> Import Equation</h2>
              <button 
                onClick={() => {
                  setEquationModalOpen(false);
                  setEquationFile(null);
                  setEquationFilePreview(null);
                }} 
                className="p-1 hover:bg-gray-100 rounded-lg text-gray-500"
              >
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
                <div 
                  className="border-2 border-dashed rounded-lg p-4 flex flex-col items-center justify-center gap-2 bg-gray-50 hover:bg-gray-100 transition-colors relative cursor-pointer min-h-[120px]"
                  onDragOver={(e) => { e.preventDefault(); e.stopPropagation(); }}
                  onDragEnter={(e) => { e.preventDefault(); e.stopPropagation(); }}
                  onDrop={(e) => {
                    e.preventDefault();
                    e.stopPropagation();
                    if (e.dataTransfer.files && e.dataTransfer.files[0]) {
                      const file = e.dataTransfer.files[0];
                      if (file.type.startsWith('image/')) {
                        setEquationFile(file);
                        const reader = new FileReader();
                        reader.onloadend = () => setEquationFilePreview(reader.result);
                        reader.readAsDataURL(file);
                      }
                    }
                  }}
                  onClick={() => document.getElementById('equation-file-input').click()}
                >
                  <input 
                    type="file" 
                    id="equation-file-input" 
                    className="hidden" 
                    accept="image/*"
                    onChange={(e) => {
                      if (e.target.files && e.target.files[0]) {
                        const file = e.target.files[0];
                        setEquationFile(file);
                        const reader = new FileReader();
                        reader.onloadend = () => setEquationFilePreview(reader.result);
                        reader.readAsDataURL(file);
                      }
                    }}
                  />
                  {equationFilePreview ? (
                    <div className="flex flex-col items-center w-full">
                      <img src={equationFilePreview} alt="Preview" className="max-h-32 object-contain rounded border border-gray-200 shadow-sm" />
                      <span className="text-xs text-purple-600 mt-2 font-medium">Click or drag to replace image</span>
                    </div>
                  ) : (
                    <>
                      <ImageIcon size={24} className="text-gray-400" />
                      <span className="text-sm text-gray-500 text-center">Click or Drag & drop formula image here</span>
                    </>
                  )}
                </div>
              </div>
            </div>
            
            <div className="p-4 border-t bg-gray-50 flex justify-end gap-2">
              <button 
                onClick={() => {
                  setEquationModalOpen(false);
                  setEquationFile(null);
                  setEquationFilePreview(null);
                }} 
                className="px-4 py-2 text-sm font-medium hover:bg-gray-200 rounded-lg"
              >
                Cancel
              </button>
              <button 
                className="px-4 py-2 bg-purple-600 hover:bg-purple-700 text-white text-sm font-medium rounded-lg flex items-center gap-2 shadow-sm"
                disabled={false}
                onClick={async (e) => {
                  const btn = e.currentTarget;
                  const prompt = document.getElementById('equation-prompt-input').value;
                  
                  if (!prompt && !equationFilePreview) {
                    alert('Please provide a description or an image.');
                    return;
                  }
                  
                  const originalText = btn.innerText;
                  btn.innerText = 'Generating...';
                  btn.disabled = true;
                  
                  try {
                    let attachments = [];
                    if (equationFilePreview && equationFile) {
                       const base64Data = equationFilePreview.split(',')[1];
                       attachments.push({ mimeType: equationFile.type, data: base64Data, name: equationFile.name });
                    }
                    
                    const res = await fetch('/api/math', {
                      method: 'POST',
                      headers: {'Content-Type': 'application/json'},
                      body: JSON.stringify({ prompt, attachments })
                    });
                    const data = await res.json();
                    
                    if (data.ok && data.latex) {
                      const rendered = katex.renderToString(data.latex, { throwOnError: false, displayMode: true });
                      const htmlStr = \`<span class="equation-node" contenteditable="false" style="display:inline-block; margin: 8px 0; padding: 8px; border-radius: 8px; background: #f8fafc; border: 1px solid #e2e8f0; cursor: pointer;" title="LaTeX: \${data.latex}">\${rendered}</span>&nbsp;\`;
                      
                      setEquationModalOpen(false);
                      setEquationFile(null);
                      setEquationFilePreview(null);
                      
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
      )}\n`;

content = content.replace(
  /\{shareModalOpen && \(/g,
  modalJSX + "      {shareModalOpen && ("
);

fs.writeFileSync(path, content, 'utf8');
console.log('Successfully updated modal with proper drag and drop logic.');
