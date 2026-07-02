const fs = require('fs');
const path = require('path');
const appPath = path.join(__dirname, 'src', 'App.jsx');
let content = fs.readFileSync(appPath, 'utf8');

// 1. Update Document Naming ('Tab ' to 'Untitled document ')
content = content.replace(/Tab `\$\{docIndex \+ 1\}`/g, 'Untitled document `${docIndex + 1}`');
content = content.replace(/'Untitled Document'/g, "'Untitled document'");

// 2. Remove '0 Sections' pill and place it next to Document Outline
const sectionCountPill = `<span className="text-[10px] font-semibold text-violet-600 bg-violet-50 border border-violet-100 rounded-full px-2 py-0.5" style={{ color: brandColor, borderColor: brandColor ? \`\${brandColor}33\` : undefined }}>
                  {outlineTreeData.length} Sections
                </span>`;
const newSectionCountText = `<span className="text-[11px] font-semibold text-slate-400 ml-2">{outlineTreeData.length} Sections</span>`;
content = content.replace(sectionCountPill, newSectionCountText);

// 3. Remove duplicate 'Add Section' bottom buttons
const duplicateAddSectionHtml = `{/* Add New Section Buttons */}
              {currentAccessLevel !== 'viewer' && currentAccessLevel !== 'commenter' && (
                <div className="flex gap-2 w-full mt-2">
                  <button
                    type="button"
                    onClick={() => {
                      const newId = \`sec-\${Date.now()}\`;
                      setOutlineTreeData(prev => [...prev, { id: newId, title: 'Untitled', progress: 0, completed: false, subsections: [], expanded: false }]);
                      setEditingOutlineId(newId);
                      setEditingOutlineText('Untitled');
                    }}
                    className="flex-1 py-2 rounded-xl border border-dashed border-slate-300 hover:border-violet-400 bg-[#FAFAFC] hover:bg-violet-50/20 text-slate-500 hover:text-violet-600 text-xs font-semibold flex items-center justify-center gap-1.5 transition-all cursor-pointer select-none"
                    style={{ fontFamily: editorFont }}
                  >
                    + Add Section
                  </button>
                  <button
                    type="button"
                    onClick={() => {
                      showToast('Generating AI Section...');
                      setTimeout(() => {
                        const newId = \`sec-ai-\${Date.now()}\`;
                        setOutlineTreeData(prev => [...prev, { id: newId, title: 'AI Generated Insights', progress: 0, completed: false, subsections: [], expanded: false }]);
                        setEditingOutlineId(newId);
                        setEditingOutlineText('AI Generated Insights');
                        showToast('AI Section Generated');
                      }, 1000);
                    }}
                    className="flex-1 py-2 rounded-xl border border-dashed border-violet-300 hover:border-violet-500 bg-violet-50/50 hover:bg-violet-100 text-violet-600 text-xs font-semibold flex items-center justify-center gap-1.5 transition-all cursor-pointer select-none"
                    style={{ fontFamily: editorFont }}
                  >
                    <Sparkles size={13} /> AI Section
                  </button>
                </div>
              )}`;
content = content.replace(duplicateAddSectionHtml, '');

// 4. Update the primary Add Section button (when empty) to just a regular style
const oldEmptyAddSection = `<button type="button" onClick={() => {
                    setOutlineTreeData([{ id: \`sec-\${Date.now()}\`, title: 'New Section', progress: 0, completed: false, subsections: [], expanded: false }]);
                  }} className="text-[11.5px] font-semibold text-violet-700 bg-violet-50 border border-violet-100 hover:bg-violet-100 px-5 py-2 rounded-full transition-all shadow-sm">
                    Add Section
                  </button>`;
const newEmptyAddSection = `<button type="button" onClick={(e) => {
                    e.stopPropagation();
                    const rect = e.currentTarget.getBoundingClientRect();
                    setOutlineMenuCoords({ top: rect.bottom + 8, left: rect.left });
                    setActiveOutlineMenuId('add-section');
                  }} className="text-[12px] font-semibold text-slate-700 bg-white border border-slate-200 hover:bg-slate-50 hover:text-slate-900 px-5 py-2 rounded-lg transition-all shadow-sm">
                    Add Section
                  </button>`;
content = content.replace(oldEmptyAddSection, newEmptyAddSection);

// 5. Also replace the empty outline icon logic if necessary
// Add a single "Add Section" button to the header or keep it where it is

fs.writeFileSync(appPath, content);
console.log('App.jsx updated');
