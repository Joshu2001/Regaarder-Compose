const fs = require('fs');
const file = 'c:\\Users\\user\\Downloads\\Project MOAT\\Regaarder Compose\\src\\App.jsx';
let content = fs.readFileSync(file, 'utf8');

// 1. Root Flex Container
content = content.replace(
  '<div ref={appShellRef} className={`flex bg-[#FDFDFD] text-gray-800 overflow-hidden relative ${isDarkMode ? \'app-dark\' : \'\'} ${shouldHideScrollbarsForPrompt ? \'hide-side-scrollbar\' : \'\'} ${isDocumentImmersive ? \'fixed inset-0 z-[9999] h-screen w-screen\' : \'h-screen\'}`} style={{ fontFamily: resolveFontFamily(editorFont) }}>',
  `<div ref={appShellRef} className={\`flex bg-[#FDFDFD] text-gray-800 overflow-hidden relative \${isDarkMode ? 'app-dark' : ''} \${shouldHideScrollbarsForPrompt ? 'hide-side-scrollbar' : ''} \${isDocumentImmersive ? 'fixed inset-0 z-[9999] h-screen w-screen' : 'h-screen'} \${roomState === 'active' && roomPanelMode === 'expanded' ? 'pt-[72px] pb-[80px] bg-[#f3f5fb]' : ''}\`} style={{ fontFamily: resolveFontFamily(editorFont) }}>
      {roomState === 'active' && roomPanelMode === 'expanded' && renderRoomTopHeader()}
      {roomState === 'active' && roomPanelMode === 'expanded' && renderRoomBottomBar()}`
);

// 2. Left Navigation Sidebar
content = content.replace(
  'className="border-r border-gray-100 flex flex-col bg-[#FAFAFC] shrink-0 select-none overflow-hidden transition-[width] duration-200"\n        style={{ width: leftSidebarOpen ? `${leftSidebarWidth}px` : \'0px\' }}',
  `className={\`border-r border-gray-100 flex flex-col bg-[#FAFAFC] shrink-0 select-none overflow-hidden transition-[width] duration-200 \${roomState === 'active' && roomPanelMode === 'expanded' ? 'border-none' : ''}\`}\n        style={{ width: (roomState === 'active' && roomPanelMode === 'expanded') ? '280px' : (leftSidebarOpen ? \`\${leftSidebarWidth}px\` : '0px') }}`
);

// Inject renderRoomLeftSidebar BEFORE showDocumentOutlineView
content = content.replace(
  '{showDocumentOutlineView ? (',
  `{roomState === 'active' && roomPanelMode === 'expanded' ? renderRoomLeftSidebar() : showDocumentOutlineView ? (`
);

// Wait, if I do this, it will leave a stray text `)}` when the condition is NOT true?
// No! The original code was `{showDocumentOutlineView ? ( ... ) : ( ... )}`.
// If I replace `{showDocumentOutlineView ? (` with `{roomState === 'active' && roomPanelMode === 'expanded' ? renderRoomLeftSidebar() : showDocumentOutlineView ? (`, 
// The resulting JSX will be:
// `{roomState === 'active' && roomPanelMode === 'expanded' ? renderRoomLeftSidebar() : showDocumentOutlineView ? ( ... ) : ( ... )}`
// This is perfectly valid nested ternary! `A ? B : C ? D : E`!
// IT DOES NOT NEED AN EXTRA CLOSING BRACE!
// My previous error was BECAUSE I added an extra `)}` at the end of the Left Sidebar!
// So I don't need to replace the end of the Left Sidebar at all!

// 3. Main Editor Area
content = content.replace(
  '<div className="flex-1 flex flex-col min-w-0 bg-white relative">',
  '<div className={`flex-1 flex flex-col min-w-0 bg-white relative ${roomState === \'active\' && roomPanelMode === \'expanded\' ? \'m-4 rounded-2xl shadow-sm border border-gray-200 overflow-hidden\' : \'\'}`}>'
);
// Replace the second occurrence too (one for landing, one for editor)
content = content.replace(
  '<div className="flex-1 flex flex-col min-w-0 bg-white relative">',
  '<div className={`flex-1 flex flex-col min-w-0 bg-white relative ${roomState === \'active\' && roomPanelMode === \'expanded\' ? \'m-4 rounded-2xl shadow-sm border border-gray-200 overflow-hidden\' : \'\'}`}>'
);

// 4. Right Sidebar Container
content = content.replace(
  'className="flex-shrink-0 flex flex-col bg-[#FAFAFC] border-l border-gray-100 shrink-0 select-none overflow-hidden transition-[width] duration-200 relative"\n        style={{ width: rightSidebarOpen ? `${rightSidebarWidth}px` : \'0px\' }}',
  `className={\`flex-shrink-0 flex flex-col bg-[#FAFAFC] border-l border-gray-100 shrink-0 select-none overflow-hidden transition-[width] duration-200 relative \${roomState === 'active' && roomPanelMode === 'expanded' ? 'border-none' : ''}\`}\n        style={{ width: (roomState === 'active' && roomPanelMode === 'expanded') ? '340px' : (rightSidebarOpen ? \`\${rightSidebarWidth}px\` : '0px') }}`
);

// Inject renderRoomRightSidebar BEFORE Right Sidebar content
// What is the first line of the Right Sidebar content?
// In the previous step, I replaced the Right Sidebar content start:
const rightSidebarContentStr = `      {/* 3. Right Sidebar */}\n      <div\n        className={\`flex-shrink-0 flex flex-col bg-[#FAFAFC] border-l border-gray-100 shrink-0 select-none overflow-hidden transition-[width] duration-200 relative \${roomState === 'active' && roomPanelMode === 'expanded' ? 'border-none' : ''}\`}\n        style={{ width: (roomState === 'active' && roomPanelMode === 'expanded') ? '340px' : (rightSidebarOpen ? \`\${rightSidebarWidth}px\` : '0px') }}\n      >\n`;

// Since the Right Sidebar does NOT have a top-level conditional `{condition ? ( ... ) : ( ... )}`, I have to wrap the entire contents of Right Sidebar!
content = content.replace(
  rightSidebarContentStr,
  rightSidebarContentStr + "        {roomState === 'active' && roomPanelMode === 'expanded' ? renderRoomRightSidebar() : (\n        <>\n"
);

// Close Right Sidebar branch
// The end of Right Sidebar is just before the last closing `</div>\n  );\n}`
content = content.replace(
  `            </div>\n          </>\n        )}\n      </div>\n\n    </div>\n  );\n}`,
  `            </div>\n          </>\n        )}\n        </>\n        )}\n      </div>\n\n    </div>\n  );\n}`
);

fs.writeFileSync(file, content, 'utf8');
console.log('Layout updated');
