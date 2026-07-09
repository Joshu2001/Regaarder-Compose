const React = require("react");
const DeckMode = () => (
                   <div className="flex-1 flex overflow-hidden bg-[#F7F8FB] relative select-none">
                    {/* Workspace background vignette effect overlay */}
                    <div className="absolute inset-0 pointer-events-none bg-[radial-gradient(circle_at_center,transparent_0%,rgba(240,242,247,0.8)_100%)] z-0" />

                    <div className="flex-1 flex flex-col min-w-0 overflow-hidden relative z-10">
                      {/* Sub-header Toolbar */}
                      <div className="h-14 border-b border-gray-200 bg-white flex items-center justify-between px-6 shrink-0 shadow-sm z-20">
                        <div className="flex items-center gap-3">
                          {/* Active Presentation Selector */}
                          <div className="relative">
                            <button
                              type="button"
                              onClick={() => showToast('Opening document list')}
                              className="flex items-center gap-2 px-3 py-1.5 hover:bg-gray-50 rounded-xl border border-gray-150 text-sm font-bold text-gray-800 transition-colors"
                            >
                              <span>Product Roadmap 2025</span>
                              <ChevronDown size={14} className="text-gray-400" />
                            </button>
                          </div>
                          <button
                            type="button"
                            onClick={addDeckSlide}
                            className="w-8 h-8 flex items-center justify-center border border-gray-200 rounded-lg hover:bg-gray-50 text-[#7C4DFF] transition-colors"
                            title="Add slide"
                          >
                            <Plus size={16} />
                          </button>

                          <div className="w-px h-5 bg-gray-200 mx-2"></div>

                          {/* Toolbar Options */}
                          <div className="flex items-center gap-1">
                            {[
                              { label: 'Theme', icon: Sparkles },
                              { label: 'Layouts', icon: LayoutGrid },
                              { label: 'Transition', icon: Layers },
                              { label: 'Animation', icon: Wand2 },
                              { label: 'Insert', icon: Plus },
                              { label: 'AI', icon: Bot }
                            ].map((btn) => (
                              <button
                                key={btn.label}
                                type="button"
                                onClick={() => {
                                  if (btn.label === 'Theme' || btn.label === 'Layouts') {
                                    setDeckContextRailTab(btn.label);
                                  } else {
                                    showToast(`${btn.label} tools ready`);
                                  }
                                }}
                                className="flex items-center gap-1.5 px-3 py-1.5 text-xs font-semibold text-gray-600 hover:text-gray-900 hover:bg-gray-50 rounded-lg transition-colors"
                              >
                                <btn.icon size={13} className="text-gray-400" />
                                <span>{btn.label}</span>
                                <ChevronDown size={10} className="text-gray-400" />
                              </button>
                            ))}
                          </div>
                        </div>
                      </div>

                      {/* Presentation Editor Main Workspace Canvas */}
                      <div className="flex-1 overflow-y-auto p-8 flex flex-col justify-between items-center gap-6 min-h-0 relative">
                        
                        {/* Centered Presentation Canvas */}
                        <div className="w-full flex-1 flex items-center justify-center relative min-h-0">
                          {/* 16:9 Canvas Slide with 32-40px rounded corners and ambient shadow */}
                          <div 
                            ref={deckCanvasPreviewRef}
                            className="w-full aspect-[16/9] bg-white rounded-[32px] md:rounded-[40px] shadow-[0_24px_70px_-15px_rgba(15,23,42,0.12)] border border-gray-150 relative overflow-hidden flex flex-col justify-between p-[80px] md:p-[100px] select-text"
                            style={{ 
                              maxWidth: 'min(100%, calc(52vh * 16 / 9))', 
                              transform: `scale(${deckZoomLevel / 100})`, 
                              transformOrigin: 'center center', 
                              transition: 'transform 140ms ease' 
                            }}
                          >
                            {/* Layered mathematical vector spline wave */}
                            <div className="absolute inset-0 pointer-events-none select-none z-0">
                              <svg className="absolute bottom-0 right-0 w-[65%] h-[90%] overflow-visible" viewBox="0 0 900 650" fill="none" xmlns="http://www.w3.org/2000/svg">
                                <defs>
                                  <linearGradient id="waveGrad" x1="0%" y1="100%" x2="100%" y2="0%">
                                    <stop offset="0%" stopColor="#C4B5FD" stopOpacity="0.01" />
                                    <stop offset="30%" stopColor="#A78BFA" stopOpacity="0.08" />
                                    <stop offset="70%" stopColor="#7C3AED" stopOpacity="0.18" />
                                    <stop offset="100%" stopColor="#4C1D95" stopOpacity="0.32" />
                                  </linearGradient>
                                  <filter id="bloom" x="-20%" y="-20%" width="140%" height="140%">
                                    <feGaussianBlur stdDeviation="12" result="blur" />
                                    <feMerge>
                                      <feMergeNode in="blur" />
                                      <feMergeNode in="SourceGraphic" />
                                    </feMerge>
                                  </filter>
                                </defs>
                                {/* Hundreds of ultra-thin overlapping Bézier curves */}
                                {Array.from({ length: 140 }).map((_, i) => {
                                  const ratio = i / 140;
                                  const offset = ratio * 160;
                                  const opacity = 0.012 + (1 - ratio) * 0.11;
                                  const thickness = 0.35 + ratio * 1.1;
                                  
                                  const startX = 220 + offset * 1.4;
                                  const startY = 650;
                                  const cp1x = 380 + Math.sin(ratio * Math.PI) * 80;
                                  const cp1y = 520 - ratio * 180;
                                  const cp2x = 600 + Math.cos(ratio * Math.PI) * 100;
                                  const cp2y = 280 - ratio * 110;
                                  const endX = 950;
                                  const endY = 300 + ratio * 210;
                                  
                                  const d = `M ${startX} ${startY} C ${cp1x} ${cp1y}, ${cp2x} ${cp2y}, ${endX} ${endY}`;
                                  
                                  return (
                                    <path
                                      key={i}
                                      d={d}
                                      stroke="url(#waveGrad)"
                                      strokeWidth={thickness}
                                      opacity={opacity}
                                      fill="none"
                                    />
                                  );
                                })}
                                {/* Luminous crest highlight line */}
                                <path
                                  d="M 250 650 C 420 420, 630 230, 950 330"
                                  stroke="#FFFFFF"
                                  strokeWidth="2.5"
                                  opacity="0.9"
                                  fill="none"
                                  filter="url(#bloom)"
                                />
                                <path
                                  d="M 250 650 C 420 420, 630 230, 950 330"
                                  stroke="#E9D5FF"
                                  strokeWidth="0.8"
                                  opacity="0.95"
                                  fill="none"
                                />
                              </svg>
                            </div>

                            {/* Slide Content Layout - Asymmetric Balance */}
                            <div className="flex flex-col h-full justify-between relative z-10 pointer-events-none">
                              {/* Logo / Brand Lockup */}
                              <div className="flex items-center gap-2">
                                <svg className="w-5 h-5 text-[#7C4DFF]" viewBox="0 0 24 24" fill="currentColor">
                                  <rect x="4" y="4" width="16" height="16" rx="4" transform="rotate(45 12 12)" />
                                  <path d="M12 8v8M8 12h8" stroke="white" strokeWidth="2" strokeLinecap="round" />
                                </svg>
                                <span className="font-bold text-[18px] text-gray-900 tracking-tight">Acme Inc.</span>
                              </div>

                              {/* Title / Body */}
                              <div className="flex-1 flex flex-col justify-center max-w-[55%] py-6">
                                <h1
                                  contentEditable={currentAccessLevel !== 'viewer' && currentAccessLevel !== 'commenter'}
                                  suppressContentEditableWarning
                                  onKeyDown={handleDeckKeyDown}
                                  onBlur={(event) => updateDeckSlideField(activeDeckSlide.id, 'headline', event.currentTarget.textContent || '')}
                                  className="text-[52px] leading-[1.15] font-extrabold text-gray-900 tracking-tight outline-none cursor-text pointer-events-auto"
                                >
                                  {resolvedDeckSlideDesign.headline}
                                </h1>
                                <p
                                  contentEditable={currentAccessLevel !== 'viewer' && currentAccessLevel !== 'commenter'}
                                  suppressContentEditableWarning
                                  onKeyDown={handleDeckKeyDown}
                                  onBlur={(event) => updateDeckSlideField(activeDeckSlide.id, 'blurb', event.currentTarget.textContent || '')}
                                  className="mt-4 text-gray-500 text-[18px] leading-relaxed font-normal outline-none cursor-text pointer-events-auto"
                                >
                                  {resolvedDeckSlideDesign.blurb}
                                </p>
                              </div>

                              {/* Date & Divider Lockup */}
                              <div className="flex flex-col gap-3">
                                <div className="w-10 h-0.5 bg-[#7C4DFF] rounded" />
                                <span className="text-xs font-semibold text-gray-400 tracking-wider uppercase">
                                  May 20, 2025
                                </span>
                              </div>
                            </div>

                            {/* Floating bottom-right "Ask AI" pill inside the canvas bounds */}
                            <button
                              type="button"
                              onClick={() => { setActiveRightTab('chat'); setRightSidebarOpen(true); }}
                              className="absolute bottom-6 right-6 px-4 py-2 rounded-full border border-violet-100 bg-white/80 backdrop-blur-md shadow-sm flex items-center gap-1.5 text-xs font-semibold text-[#7C4DFF] hover:bg-white transition-all z-20 pointer-events-auto"
                            >
                              <Sparkles size={13} />
                              <span>Ask AI</span>
                            </button>
                          </div>
                        </div>

                        {/* Floating bottom actions (outside canvas) */}
                        <div className="w-full flex items-center justify-between px-4 shrink-0 relative mt-2">
                          {/* Circular magical purple button on the bottom left */}
                          <button
                            type="button"
                            onClick={() => { setActiveRightTab('assistant'); setRightSidebarOpen(true); }}
                            className="w-10 h-10 rounded-full bg-[#7C4DFF] text-white flex items-center justify-center shadow-lg hover:bg-[#6C3DF0] hover:scale-105 active:scale-95 transition-all z-20"
                          >
                            <Sparkles size={18} />
                          </button>

                          {/* Horizontal mini carousel slider in the bottom center */}
                          <div className="absolute left-1/2 -translate-x-1/2 bottom-0 flex items-center gap-2 p-1.5 bg-white/60 backdrop-blur-md rounded-2xl border border-gray-150/40 shadow-sm max-w-[80%] overflow-x-auto no-scrollbar z-15">
                            {deckSlides.map((slide, idx) => {
                              const isSlideActive = slide.id === activeDeckSlideId;
                              return (
                                <button
                                  key={slide.id}
                                  type="button"
                                  onClick={() => setActiveDeckSlideId(slide.id)}
                                  className={`h-11 aspect-[16/9] rounded-lg border overflow-hidden bg-white shrink-0 transition-all ${
                                    isSlideActive ? 'border-[#7C4DFF] ring-2 ring-[#7C4DFF]/15' : 'border-gray-200 hover:border-gray-300'
                                  }`}
                                >
                                  <div className="w-full h-full relative p-1 bg-[#FAFAFC] flex flex-col justify-between">
                                    <span className="text-[7px] font-bold text-gray-400">{idx + 1}</span>
                                    <div className="w-full h-1.5 bg-gray-200 rounded-sm" />
                                  </div>
                                </button>
                              );
                            })}
                            <button
                              type="button"
                              onClick={addDeckSlide}
                              className="h-11 aspect-[16/9] rounded-lg border border-dashed border-gray-300 hover:border-[#7C4DFF] flex items-center justify-center shrink-0 text-gray-400 hover:text-[#7C4DFF] transition-colors"
                            >
                              <Plus size={14} />
                            </button>
                          </div>
                        </div>

                      </div>
                    </div>

                    {/* Right Inspector Panel */}
                    <div className="w-[320px] border-l border-gray-200 bg-white flex flex-col shrink-0 z-30">
                      {/* Tabs Header - Slightly rounded rectangles, NOT pill-shaped (as per custom rules) */}
                      <div className="h-16 border-b border-gray-100 flex items-center px-4 shrink-0 bg-[#FAFAFC]">
                        <div className="flex gap-1 bg-gray-100 p-1 rounded-xl w-full">
                          {['Design', 'Animate', 'Notes'].map((tab) => {
                            const isTabActive = deckContextRailTab === tab;
                            return (
                              <button
                                key={tab}
                                type="button"
                                onClick={() => setDeckContextRailTab(tab)}
                                className={`flex-1 py-2 text-xs font-semibold rounded-lg text-center transition-all ${
                                  isTabActive 
                                    ? 'bg-white text-gray-900 shadow-sm border border-gray-200/50' 
                                    : 'text-gray-500 hover:text-gray-800'
                                }`}
                              >
                                {tab}
                              </button>
                            );
                          })}
                        </div>
                      </div>

                      {/* Inspector Content */}
                      <div className="flex-1 overflow-y-auto p-4 space-y-4 thin-scrollbar">
                        {deckContextRailTab === 'Design' && (
                          <>
                            {/* Theme section */}
                            <div className="space-y-1.5">
                              <span className="text-[11px] font-bold uppercase tracking-wider text-slate-400">Theme</span>
                              <button type="button" className="w-full flex items-center justify-between p-3 border border-gray-200 rounded-xl bg-white hover:bg-gray-50 transition-colors shadow-sm text-left">
                                <div className="flex items-center gap-2">
                                  <div className="w-8 h-5 rounded bg-gradient-to-r from-violet-300 via-indigo-400 to-purple-500" />
                                  <span className="text-xs font-semibold text-gray-700">Aurora</span>
                                </div>
                                <ChevronDown size={14} className="text-gray-400" />
                              </button>
                            </div>

                            {/* Layouts section */}
                            <div className="space-y-1.5">
                              <span className="text-[11px] font-bold uppercase tracking-wider text-slate-400">Layouts</span>
                              <button type="button" className="w-full flex items-center justify-between p-3 border border-gray-200 rounded-xl bg-white hover:bg-gray-50 transition-colors shadow-sm text-left">
                                <div className="flex items-center gap-2">
                                  <div className="w-8 h-5 rounded border border-gray-200 bg-white flex flex-col p-0.5 justify-between">
                                    <div className="w-1/2 h-1 bg-gray-300 rounded-sm" />
                                    <div className="w-1/3 h-0.5 bg-gray-200 rounded-sm" />
                                  </div>
                                  <span className="text-xs font-semibold text-gray-700">Title Slide</span>
                                </div>
                                <ChevronDown size={14} className="text-gray-400" />
                              </button>
                            </div>

                            {/* Background section */}
                            <div className="space-y-1.5">
                              <span className="text-[11px] font-bold uppercase tracking-wider text-slate-400">Background</span>
                              <div className="flex items-center gap-2 p-3 border border-gray-200 rounded-xl bg-white shadow-sm">
                                <div className="w-5 h-5 rounded border border-gray-200 bg-white" />
                                <input
                                  type="text"
                                  value="#FFFFFF"
                                  readOnly
                                  className="text-xs font-semibold text-gray-700 outline-none w-full"
                                />
                              </div>
                            </div>

                            {/* Brand Kit section */}
                            <div className="space-y-1.5">
                              <span className="text-[11px] font-bold uppercase tracking-wider text-slate-400">Brand Kit</span>
                              <div className="flex items-center justify-between p-3 border border-gray-200 rounded-xl bg-white shadow-sm">
                                <button className="px-2.5 py-1 bg-gray-50 hover:bg-gray-100 rounded-lg border border-gray-200 text-xs font-semibold text-gray-700">
                                  Aa
                                </button>
                                <div className="flex items-center gap-1.5">
                                  <div className="w-5 h-5 rounded-full bg-[#7C4DFF]" />
                                  <div className="w-5 h-5 rounded-full bg-[#B085FF]" />
                                  <div className="w-5 h-5 rounded-full bg-[#E8D5FF]" />
                                  <ChevronDown size={12} className="text-gray-400 ml-1" />
                                </div>
                              </div>
                            </div>

                            {/* AI Suggestions section */}
                            <div className="space-y-2 pt-2 border-t border-gray-100">
                              <div className="flex items-center justify-between">
                                <span className="text-[11px] font-bold uppercase tracking-wider text-slate-400">AI Suggestions</span>
                                <span className="bg-violet-50 text-[#7C4DFF] text-[9px] font-bold px-1.5 py-0.5 rounded uppercase tracking-wider">New</span>
                              </div>
                              <div className="space-y-2">
                                {[
                                  { title: 'Improve this slide', desc: 'Enhance layout and visual hierarchy' },
                                  { title: 'Shorten text', desc: 'Make it more concise' },
                                  { title: 'Generate image', desc: 'Add relevant image to this slide' }
                                ].map((sug) => (
                                  <button
                                    key={sug.title}
                                    type="button"
                                    onClick={() => showToast(`Executing: ${sug.title}`)}
                                    className="w-full p-3.5 border border-gray-150 rounded-2xl bg-white hover:border-[#7C4DFF] hover:bg-violet-50/10 text-left transition-all group"
                                  >
                                    <div className="text-xs font-bold text-gray-800 group-hover:text-[#7C4DFF]">{sug.title}</div>
                                    <div className="text-[11px] text-gray-500 mt-1">{sug.desc}</div>
                                  </button>
                                ))}
                              </div>
                              <button type="button" className="w-full text-center text-xs font-bold text-[#7C4DFF] hover:text-[#6C3DF0] py-2">
                                View more
                              </button>
                            </div>
                          </>
                        )}

                        {deckContextRailTab === 'Animate' && (
                          <div className="flex flex-col items-center justify-center py-12 text-center">
                            <Wand2 size={36} className="text-gray-300 mb-3" />
                            <span className="text-xs font-semibold text-gray-700">Slide Animations</span>
                            <span className="text-[11px] text-gray-500 mt-1">Configure entrance effects and timings.</span>
                          </div>
                        )}

                        {deckContextRailTab === 'Notes' && (
                          <div className="space-y-2">
                            <span className="text-[11px] font-bold uppercase tracking-wider text-slate-400">Presenter Notes</span>
                            <textarea
                              placeholder="Add speaker notes for this slide..."
                              value={activeDeckSlide?.speakerNotes || ''}
                              onChange={(e) => updateDeckSlideField(activeDeckSlide.id, 'speakerNotes', e.target.value)}
                              className="w-full min-h-[200px] p-3 border border-gray-200 rounded-xl text-xs font-medium text-gray-700 outline-none focus:border-[#7C4DFF] resize-none"
                            />
                          </div>
                        )}
                          
                          <button onClick={handlePresentDeck} className="p-1 hover:bg-gray-100 rounded-lg text-gray-500 hover:text-gray-900 transition-colors" title="Fullscreen">
                            <Expand size={18} strokeWidth={2} />
                          </button>
                        </div>
                      </div>

                      <div className="w-full max-w-[1100px] flex flex-col gap-2">
                      {showDeckNotes && (
                        <div className="mt-4 border border-gray-200 rounded-xl bg-white p-3 flex items-start gap-2 relative shadow-sm">
                          <textarea
                            placeholder="Add speaker notes..."
                            className="w-full resize-none outline-none text-sm text-gray-600 bg-transparent min-h-[60px]"
                            rows={3}
                          />
                        </div>
                      )}
                    </div>

{showResizeModal && (
  <div className="fixed inset-0 z-[200] flex items-center justify-center bg-black/40 backdrop-blur-sm">
    <div className="bg-white rounded-2xl shadow-xl w-full max-w-md overflow-hidden flex flex-col">
      <div className="flex items-center justify-between px-6 py-4 border-b border-gray-100">
        <h3 className="text-lg font-semibold text-gray-900">Resize Presentation</h3>
        <button onClick={() => setShowResizeModal(false)} className="p-1 hover:bg-gray-100 rounded-lg text-gray-500 transition-colors">
          <X size={18} />
        </button>
      </div>
      
      <div className="p-6 space-y-6">
        <div>
          <h4 className="text-sm font-semibold text-gray-500 mb-3 uppercase tracking-wider">Presets</h4>
          <div className="grid grid-cols-2 gap-4">
            <button className="flex flex-col items-start p-4 border border-gray-200 rounded-xl hover:border-violet-500 hover:bg-violet-50 transition-colors text-left group">
              <div className="w-12 h-8 bg-gray-100 group-hover:bg-violet-100 rounded mb-3 flex items-center justify-center">
                <MonitorPlay size={16} className="text-gray-500 group-hover:text-violet-600" />
              </div>
              <span className="text-sm font-semibold text-gray-900">Presentation</span>
              <span className="text-xs text-gray-500 mt-1">1920 × 1080 px</span>
            </button>
            <button className="flex flex-col items-start p-4 border border-gray-200 rounded-xl hover:border-violet-500 hover:bg-violet-50 transition-colors text-left group">
              <div className="w-10 h-8 bg-gray-100 group-hover:bg-violet-100 rounded mb-3 flex items-center justify-center">
                <Presentation size={16} className="text-gray-500 group-hover:text-violet-600" />
              </div>
              <span className="text-sm font-semibold text-gray-900">Presentation (4:3)</span>
              <span className="text-xs text-gray-500 mt-1">1024 × 768 px</span>
            </button>
          </div>
        </div>

        <div>
          <h4 className="text-sm font-semibold text-gray-500 mb-3 uppercase tracking-wider">Custom size</h4>
          <div className="flex items-end gap-3">
            <div className="flex-1">
              <label className="block text-xs font-medium text-gray-600 mb-1.5">Width</label>
              <input 
                type="number" 
                value={resizeWidth}
                onChange={(e) => setResizeWidth(e.target.value)}
                className="w-full px-3 py-2 bg-white border border-gray-200 rounded-xl text-sm outline-none focus:border-violet-500 focus:ring-2 focus:ring-violet-500/20 transition-all"
              />
            </div>
            <div className="flex-1">
              <label className="block text-xs font-medium text-gray-600 mb-1.5">Height</label>
              <input 
                type="number" 
                value={resizeHeight}
                onChange={(e) => setResizeHeight(e.target.value)}
                className="w-full px-3 py-2 bg-white border border-gray-200 rounded-xl text-sm outline-none focus:border-violet-500 focus:ring-2 focus:ring-violet-500/20 transition-all"
              />
            </div>
            <div className="w-24 relative">
              <label className="block text-xs font-medium text-gray-600 mb-1.5">Units</label>
              <div className="relative">
                <select 
                  value={resizeUnit}
                  onChange={(e) => setResizeUnit(e.target.value)}
                  className="w-full pl-3 pr-8 py-2 bg-white border border-gray-200 rounded-xl text-sm outline-none appearance-none cursor-pointer focus:border-violet-500 focus:ring-2 focus:ring-violet-500/20 transition-all"
                >
                  <option value="px">px</option>
                  <option value="in">in</option>
                  <option value="mm">mm</option>
                  <option value="cm">cm</option>
                </select>
                <ChevronDown size={14} className="absolute right-3 top-1/2 -translate-y-1/2 text-gray-400 pointer-events-none" />
              </div>
            </div>
            <button className="p-2.5 text-gray-400 hover:text-gray-900 transition-colors mb-[1px]">
              <Lock size={16} />
            </button>
          </div>
        </div>
      </div>
      
      <div className="px-6 py-4 border-t border-gray-100 bg-gray-50 flex justify-end gap-3">
        <button onClick={() => setShowResizeModal(false)} className="px-4 py-2 text-sm font-semibold text-gray-600 hover:text-gray-900 transition-colors">
          Cancel
        </button>
        <button onClick={() => setShowResizeModal(false)} className="px-4 py-2 bg-violet-600 hover:bg-violet-700 text-white text-sm font-semibold rounded-xl transition-colors shadow-sm">
          Apply Resize
        </button>
      </div>
    </div>
  </div>
)}
);
