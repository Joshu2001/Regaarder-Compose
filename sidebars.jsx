      {productMode !== 'landing' && !shareModalOpen && rightSidebarOpen && (
        <div
          onMouseDown={(event) => beginPanelResize('right', event)}
          className="w-1 shrink-0 cursor-col-resize bg-transparent hover:bg-violet-100 active:bg-violet-200 transition-colors opacity-0 hover:opacity-100"
          aria-label="Resize right sidebar"
        />
      )}

      {/* 3. Right Sidebar (AI Assistant / Smart Chat / Tools) */}
      <div 
        className={`border-l border-gray-100 flex flex-col bg-white shrink-0 transition-[width] duration-300 relative z-[260] ${
          productMode !== 'landing' && rightSidebarOpen && !shareModalOpen ? '' : 'w-0 overflow-hidden border-l-0'
        }`}
        style={ productMode !== 'landing' && rightSidebarOpen && !shareModalOpen ? ( rightPanelMaximized ? { width: '100vw', position: 'fixed', top: 0, right: 0, height: '100vh', zIndex: 1200 } : { width: `${rightSidebarWidth}px` } ) : { width: '0px' } }
      >
        {/* Sidebar Header Tabs */}
        {activeRightTab !== 'calendar' && activeRightTab !== 'room' && activeRightTab !== 'orb' && (
        <div className="flex border-b border-gray-100 text-xs font-semibold select-none bg-[#FAFAFC]">
          <div
            className="flex-1 min-w-0 overflow-x-auto no-scrollbar"
            tabIndex={0}
            onKeyDown={handleRightSidebarTabsKeyDown}
            aria-label="Right panel tabs"
          >
            <div className="inline-flex min-w-max">
              {[
                { key: 'chat', label: 'AI Chat' },
                { key: 'assistant', label: 'AI Assistant' },
                { key: 'whiteboard', label: 'Whiteboard' },
                { key: 'tasks', label: 'Tasks' },
                { key: 'manageen', label: 'Manageen' },
                { key: 'calendar', label: 'Schedule' },
                { key: 'room', label: 'Room' },
                { key: 'memory', label: 'Memory' },
                { key: 'orb', label: 'Orb' },
              ].map((tab) => (
                <button
                  key={tab.key}
                  className={`shrink-0 px-3 py-4 transition-all border-b-2 ${activeRightTab === tab.key ? 'text-violet-600 border-violet-600 bg-white' : 'text-gray-500 border-transparent hover:text-gray-700 hover:bg-gray-50'}`}
                  onClick={() => {
                    if (tab.key === 'manageen') {
                      createManageenExperience();
                      return;
                    }
                    setActiveRightTab(tab.key);
                  }}
                >
                  {tab.label}
                </button>
              ))}
            </div>
          </div>
          <div className="w-14 shrink-0 flex items-center justify-center border-l border-gray-100 gap-2 px-2">
            <button
              type="button"
              title={rightPanelMaximized ? 'Restore panel' : 'Expand panel'}
              onClick={() => { setRightPanelMaximized((p) => !p); if (!rightSidebarOpen) setRightSidebarOpen(true); }}
              className="p-1.5 rounded-md text-gray-400 hover:bg-violet-50 hover:text-gray-700 transition-colors"
            >
              {rightPanelMaximized ? <Minimize2 size={14} /> : <Maximize2 size={14} />}
            </button>
            <X 
              size={14} 
              className="text-gray-400 cursor-pointer hover:text-gray-600" 
              onClick={() => { setRightSidebarOpen(false); setRightPanelMaximized(false); }}
            />
          </div>
        </div>
        )}

        {/* Dynamic Sidebar Content */}
        <div className="flex-1 flex flex-col min-h-0 bg-white">
          
          {/* A. ACTIVE TAB: AI CHAT */}
          {activeRightTab === 'chat' && (
            <div className="flex-1 flex flex-col min-h-0">
              {/* Context Indicator */}
              <div className="px-4 py-2 bg-violet-50/40 border-b border-violet-100/30 flex items-center gap-2 text-xs text-violet-700">
                <FileText size={12} />
                <span className="font-medium truncate" title={docTitle}>Context Linked: {docTitleDisplay}</span>
              </div>

              {/* Chat Stream */}
              <div className="flex-1 overflow-y-auto p-4 space-y-4">
                {chatMessages.map((msg) => (
                  <div 
                    key={msg.id} 
                    className={`group flex flex-col max-w-[85%] ${msg.sender === 'user' ? 'ml-auto items-end' : 'mr-auto items-start'}`}
                  >
                    {/* Speaker Header */}
                    <span className="text-[10px] text-gray-400 mb-1 px-1">
                      {msg.sender === 'user' ? 'Alex R.' : 'Compose AI'}
                    </span>

                    {/* Chat Bubble / Cards */}
                    <div className={`p-3 rounded-2xl text-sm leading-relaxed ${
                      msg.sender === 'user' 
                        ? 'bg-violet-600 text-white rounded-tr-xs shadow-sm' 
                        : 'bg-[#FAFAFC] text-gray-700 border border-gray-100 rounded-tl-xs shadow-xs'
                    }`}>
                      {msg.text}

                      {/* Render suggestions block inline */}
                      {msg.type === 'suggestions' && (
                        <div className="mt-3 flex flex-col gap-1.5">
                          {msg.suggestions.map((sug, sIdx) => (
                            <button
                              key={sIdx}
                              onClick={() => {
                                if (productMode === 'compose') {
                                  handleAISubmit(sug.label, {
                                    source: 'compose',
                                    forceDocBuild: true,
                                    composeFormat: 'Plain Text',
                                    tone: promptTone,
                                    lengthMode: promptLengthMode,
                                    lengthValue: promptLengthValue,
                                  });
                                  return;
                                }
                                handleAISubmit(sug.label);
                              }}
                              className="w-full text-left bg-white hover:bg-violet-50 text-xs font-medium text-gray-700 hover:text-violet-700 p-2.5 rounded-lg border border-gray-200/60 hover:border-violet-200 transition-all flex items-center justify-between group/sug"
                            >
                              <span>{sug.label}</span>
                              <ArrowRight size={12} className="text-gray-400 group-hover/sug:translate-x-1 transition-transform" />
                            </button>
                          ))}
                        </div>
                      )}

                      {/* Action confirmation pill */}
                      {msg.type === 'action_completed' && (
                        <div className="mt-2.5 flex items-center gap-1 text-[11px] font-semibold text-emerald-600 bg-emerald-50 px-2 py-1 rounded border border-emerald-100">
                          <Check size={12} />
                          <span>Successfully injected into document</span>
                        </div>
                      )}
                    </div>

                    <div className="mt-1.5 flex items-center gap-1.5 opacity-0 group-hover:opacity-100 transition-opacity">
                      <button
                        type="button"
                        onClick={() => retryMessageAction(msg)}
                        className="p-1 rounded-md text-gray-400 hover:text-violet-600 hover:bg-violet-50"
                        title="Retry"
                      >
                        <RefreshCcw size={12} />
                      </button>
                      <button
                        type="button"
                        onClick={() => undoMessageAction(msg)}
                        className="p-1 rounded-md text-gray-400 hover:text-violet-600 hover:bg-violet-50"
                        title="Undo AI action"
                      >
                        <Undo2 size={12} />
                      </button>
                      <button
                        type="button"
                        onClick={() => deleteMessageAction(msg)}
                        className="p-1 rounded-md text-gray-400 hover:text-rose-600 hover:bg-rose-50"
                        title="Delete message"
                      >
                        <Trash2 size={12} />
                      </button>
                      <button
                        type="button"
                        onClick={() => recordChatFeedback(msg, 'thumbs_up')}
                        className="p-1 rounded-md text-gray-400 hover:text-emerald-600 hover:bg-emerald-50"
                        title="Helpful"
                      >
                        <ThumbsUp size={12} />
                      </button>
                      <button
                        type="button"
                        onClick={() => recordChatFeedback(msg, 'thumbs_down')}
                        className="p-1 rounded-md text-gray-400 hover:text-amber-600 hover:bg-amber-50"
                        title="Needs improvement"
                      >
                        <ThumbsDown size={12} />
                      </button>
                      <button
                        type="button"
                        onClick={() => {
                          setChatFeedbackDrafts((prev) => ({
                            ...prev,
                            [msg.id]: {
                              ...(prev[msg.id] || { text: '' }),
                              open: !(prev[msg.id]?.open),
                            },
                          }));
                        }}
                        className="p-1 rounded-md text-gray-400 hover:text-sky-600 hover:bg-sky-50"
                        title="Add feedback comment"
                      >
                        <MessageSquarePlus size={12} />
                      </button>
                    </div>

                    {chatFeedbackDrafts[msg.id]?.open && (
                      <div className="mt-1.5 w-full">
                        <div className="relative flex items-center bg-white border border-gray-200 rounded-full px-2 py-1 hover:border-violet-200 focus-within:border-violet-400 transition-colors">
                          <input
                            type="text"
                            value={chatFeedbackDrafts[msg.id]?.text || ''}
                            onChange={(event) => {
                              const value = event.target.value;
                              setChatFeedbackDrafts((prev) => ({
                                ...prev,
                                [msg.id]: {
                                  ...(prev[msg.id] || { open: true }),
                                  open: true,
                                  text: value,
                                },
                              }));
                            }}
                            placeholder="Tell AI how to improve this response..."
                            className="w-full min-w-0 bg-transparent border-none focus:outline-none text-[11px] text-gray-700 py-1 pl-1 pr-14"
                          />
                          <button
                            type="button"
                            onClick={() => {
                              const comment = chatFeedbackDrafts[msg.id]?.text?.trim() || '';
                              if (!comment) {
                                return;
                              }
                              recordChatFeedback(msg, 'comment', comment);
                              setChatFeedbackDrafts((prev) => ({
                                ...prev,
                                [msg.id]: { open: false, text: '' },
                              }));
                              showToast('Feedback saved to memory');
                            }}
                            className="absolute right-1 top-1/2 -translate-y-1/2 px-2.5 py-1 rounded-full text-[11px] bg-violet-600 text-white hover:bg-violet-700"
                          >
                            Save
                          </button>
                        </div>
                      </div>
                    )}
                  </div>
                ))}
                
                {/* Loader animation when AI is processing */}
                {isComposing && (
                  <div className="flex items-center gap-2 text-xs text-gray-400 p-2 animate-pulse">
                    <Loader2 className="animate-spin text-violet-500" size={14} />
                    <span>{productMode === 'deck' ? 'Deck AI is designing your slides...' : 'Compose AI is writing...'}</span>
                  </div>
                )}
                <div ref={chatEndRef} />
              </div>

              {/* Chat Input Bar */}
              <form onSubmit={handleSidebarSend} className="p-3 border-t border-gray-100 bg-[#FAFAFC]">
                {chatAttachments.length > 0 && (
                  <div className="mb-2 flex flex-wrap gap-1.5">
                    {chatAttachments.map((attachment) => (
                      <span key={attachment.id} className="text-[10px] px-2 py-0.5 rounded-full border border-gray-200 bg-white text-gray-600">
                        {attachment.name}
                      </span>
                    ))}
                  </div>
                )}
                <div className="relative flex items-end bg-white border border-gray-200 rounded-xl focus-within:border-violet-400 transition-colors">
                  <input
                    ref={chatFileInputRef}
                    type="file"
                    multiple
                    className="hidden"
                    onChange={async (event) => {
                      await ingestChatAttachments(event.target.files);
                      event.target.value = '';
                    }}
                  />
                  <textarea
                    ref={chatInputRef}
                    value={chatInput}
                    onChange={(e) => setChatInput(e.target.value)}
                    onInput={(e) => autoResizeTextarea(e.currentTarget, 120)}
                    onPaste={handleChatPaste}
                    onKeyDown={(e) => {
                      if (e.key === 'Enter' && !e.shiftKey) {
                        e.preventDefault();
                        handleSidebarSend(e);
                      }
                    }}
                    placeholder="Ask, summarize, or instruct..."
                    rows={1}
                    className="w-full bg-transparent border-none focus:outline-none text-sm py-2.5 pl-10 pr-10 text-gray-700 placeholder-gray-400 resize-none"
                  />
                  <button
                    type="button"
                    onClick={() => chatFileInputRef.current?.click()}
                    className="absolute left-1.5 bottom-1.5 p-1.5 rounded-lg bg-gray-50 hover:bg-gray-100 text-gray-500 transition-colors"
                    title="Attach files"
                  >
                    <Upload size={14} />
                  </button>
                  <button 
                    type="submit" 
                    className="absolute right-1.5 bottom-1.5 p-1.5 rounded-lg bg-violet-50 hover:bg-violet-100 text-violet-600 transition-colors"
                  >
                    <Send size={14} />
                  </button>
                </div>
              </form>
            </div>
          )}

          {/* B. ACTIVE TAB: AI ASSISTANT CO-WRITER */}
          {activeRightTab === 'assistant' && (
            <div className="flex-1 overflow-y-auto p-5 space-y-6">
              <div>
                <h3 className="text-sm font-bold text-gray-900 mb-2">Smart Assist Options</h3>
                <p className="text-xs text-gray-500">{smartAssistIntro}</p>
                {!isLiveAiReady && (
                  <p className="mt-2 text-[11px] text-rose-600">{smartAssistDisabledReason}</p>
                )}
              </div>

              {/* Action Buttons Grid */}
              <div className="space-y-2">
                {smartAssistOptions.map((option) => {
                  const Icon = option.icon;
                  return (
                    <div key={option.key} className="space-y-1">
                      <button
                        type="button"
                        disabled={!isLiveAiReady}
                        onClick={() => {
                          if (!isLiveAiReady) {
                            showToast(smartAssistDisabledReason);
                            return;
                          }
                          if (option.key === 'create-outline') {
                            setOutlineLevelMenuOpen((prev) => !prev);
                            return;
                          }
                          if (option.key === 'insert-page-cover') {
                                      setPageCoverModalOpen(true);
                                      return;
                                    }
                                    if (option.key === 'insert-page-cover') { setPageCoverModalOpen(true); return; }
                                    if (option.key === 'insert-shapes') {
                            setShapesModalOpen(true);
                            return;
                          }
                          if (option.key === 'insert-chart') {
                            setChartsModalOpen(true);
                            return;
                          }
                          setOpenDropdown(null);
                          runSmartAssistAction(option.prompt, { actionKey: option.key });
                        }}
                        className={`w-full flex items-center gap-3 px-4 py-3 border rounded-lg text-sm transition-colors text-left ${isLiveAiReady ? `${selectedEditorText ? 'assist-option-snake border-transparent' : 'border-gray-100'} text-gray-700 hover:border-violet-200 hover:bg-violet-50` : 'text-gray-400 border-gray-200 cursor-not-allowed bg-gray-50'}`}
                      >
                        <Icon size={16} className={option.color} />
                        <div>
                          <div className="font-semibold text-xs">{option.label}</div>
                          <p className="text-[10px] text-gray-400">{option.detail}</p>
                        </div>
                      </button>
                      {option.key === 'create-outline' && outlineLevelMenuOpen && isLiveAiReady && (
                        <div className="ml-7 rounded-lg border border-violet-100 bg-violet-50/40 p-2">
                          <div className="text-[10px] font-semibold text-violet-700 mb-1">Choose depth</div>
                          <div className="flex items-center gap-1.5">
                            {[2, 3, 4].map((level) => (
                              <button
                                key={level}
                                type="button"
                                onClick={() => {
                                  if (!isLiveAiReady) {
                                    showToast(smartAssistDisabledReason);
                                    return;
                                  }
                                  setOutlineLevels(level);
                                  setOutlineLevelMenuOpen(false);
                                  runSmartAssistAction(option.prompt, { actionKey: option.key, outlineLevels: level });
                                }}
                                className={`px-2 py-1 rounded text-[10px] border ${outlineLevels === level ? 'bg-violet-600 text-white border-violet-600' : 'bg-white text-gray-600 border-gray-200 hover:border-violet-300'}`}
                              >
                                {level} levels
                              </button>
                            ))}
                          </div>
                        </div>
                      )}
                    </div>
                  );
                })}
              </div>

              <div>
                <h4 className="text-[11px] font-bold text-gray-400 uppercase tracking-wider mb-2">AI Prompt Box</h4>
                <form onSubmit={handleAssistantQuickPromptSend} className="rounded-xl p-3 border border-violet-100/70 bg-gradient-to-br from-violet-50/60 via-white to-white space-y-2 shadow-[0_10px_25px_-20px_rgba(109,40,217,0.55)]">
                  <textarea
                    value={assistantQuickPrompt}
                    onChange={(e) => setAssistantQuickPrompt(e.target.value)}
                    placeholder="Ask AI Assistant from here..."
                    rows={2}
                    className="w-full bg-white/95 border border-violet-100 rounded-lg px-2.5 py-2 text-xs text-gray-700 outline-none focus:border-violet-400 resize-y min-h-[64px]"
                  />
                  <div className="flex items-center justify-end">
                    <button
                      type="submit"
                      disabled={isComposing || !assistantQuickPrompt.trim() || !isLiveAiReady}
                      className={`px-3 py-1.5 rounded-lg text-xs font-semibold transition-all ${isComposing || !assistantQuickPrompt.trim() || !isLiveAiReady ? 'bg-violet-200 text-white cursor-not-allowed' : 'bg-violet-600 text-white hover:bg-violet-700 shadow-[0_8px_16px_-10px_rgba(124,58,237,0.7)]'}`}
                    >
                      Send to AI
                    </button>
                  </div>
                </form>
              </div>
            </div>
          )}

          {/* C. ACTIVE TAB: WHITEBOARD ASSISTANT */}
          {activeRightTab === 'whiteboard' && (
            <div className="flex-1 overflow-y-auto p-4 space-y-4 bg-[#fcfcff]">
              <div className="rounded-2xl border border-[#ece8ff] bg-white shadow-[0_18px_34px_-28px_rgba(109,40,217,0.45)] overflow-hidden">
                <div className="px-4 pt-4 pb-2 border-b border-gray-100">
                  <div className="text-[14px] font-semibold text-[#1f2537] inline-flex items-center gap-1.5">
                    <Sparkles size={13} className="text-violet-500" />
                    AI Assistant
                  </div>
                </div>
                <div className="px-2 pt-2">
                  <div className="grid grid-cols-3 gap-1 rounded-xl bg-[#f7f5ff] p-1">
                    {['ask', 'generate', 'insights'].map((tabKey) => (
                      <button
                        key={tabKey}
                        type="button"
                        onClick={() => {
                          setWhiteboardAssistantTab(tabKey);
                          showToast(`Whiteboard ${tabKey} mode active`);
                        }}
                        className={`h-8 rounded-lg text-[11px] font-semibold transition-colors ${whiteboardAssistantTab === tabKey ? 'bg-white text-violet-700 shadow-sm' : 'text-slate-500 hover:text-violet-600'}`}
                      >
                        {tabKey.charAt(0).toUpperCase() + tabKey.slice(1)}
                      </button>
                    ))}
                  </div>
                </div>
                <div className="px-4 py-3">
                  <div className="text-[12px] text-slate-600 mb-2">What would you like to do?</div>
                  <div className="flex flex-wrap gap-1.5">
                    {(whiteboardAssistantActions[whiteboardAssistantTab] || []).map((action) => (
                      <button
                        key={action.key}
                        type="button"
                        onClick={() => handleWhiteboardAssistantAction(action)}
                        className="rounded-full border border-violet-200 bg-violet-50 px-3 py-1.5 text-[11px] font-medium text-violet-700 hover:bg-violet-100 hover:border-violet-300 transition-colors"
                      >
                        {action.label}
                      </button>
                    ))}
                  </div>
                </div>
              </div>

              <div className="rounded-2xl border border-gray-200 bg-white p-4">
                <div className="flex items-center justify-between">
                  <div className="text-[12px] font-semibold text-[#1f2537]">Board insights</div>
                  <button
                    type="button"
                    onClick={() => {
                      setWhiteboardAssistantTab('insights');
                      setActiveRightTab('whiteboard');
                      showToast('Insights refreshed');
                    }}
                    className="text-[10px] font-semibold text-violet-600 hover:text-violet-700"
                  >
                    Refresh
                  </button>
                </div>
                <div className="mt-2.5 space-y-2 text-[11px]">
                  {[
                    { key: 'notes', label: '12 sticky notes', icon: FileText },
                    { key: 'links', label: '8 connections', icon: LinkIcon },
                    { key: 'collabs', label: '5 collaborators', icon: Users },
                    { key: 'edited', label: 'Last edited 2m ago', icon: Clock },
                  ].map((item) => {
                    const Icon = item.icon;
                    return (
                      <button
                        key={item.key}
                        type="button"
                        onClick={() => showToast(`${item.label} opened`)}
                        className="w-full rounded-lg border border-gray-100 bg-[#fafaff] px-2.5 py-2 text-left text-slate-600 hover:bg-violet-50 hover:border-violet-200 inline-flex items-center gap-2 transition-colors"
                      >
                        <Icon size={12} className="text-violet-500" />
                        <span>{item.label}</span>
                      </button>
                    );
                  })}
                </div>
              </div>

              <div className="rounded-2xl border border-gray-200 bg-white p-4">
                <div className="text-[12px] font-semibold text-[#1f2537]">Connected to</div>
                <div className="mt-2 space-y-1.5">
                  <button
                    type="button"
                    onClick={() => handleWhiteboardConnectionAction('orb-brief')}
                    className="w-full rounded-lg border border-gray-100 px-2.5 py-2 text-left text-[11px] text-slate-700 hover:bg-violet-50 hover:border-violet-200 inline-flex items-center gap-2"
                  >
                    <FileText size={12} className="text-violet-500" />
                    Q2 Launch Brief (Orb)
                  </button>
                  <button
                    type="button"
                    onClick={() => handleWhiteboardConnectionAction('tasks')}
                    className="w-full rounded-lg border border-gray-100 px-2.5 py-2 text-left text-[11px] text-slate-700 hover:bg-violet-50 hover:border-violet-200 inline-flex items-center gap-2"
                  >
                    <CheckSquare size={12} className="text-violet-500" />
                    Launch Tasks
                  </button>
                  <button
                    type="button"
                    onClick={() => handleWhiteboardConnectionAction('compose')}
                    className="w-full rounded-lg border border-gray-100 px-2.5 py-2 text-left text-[11px] text-slate-700 hover:bg-violet-50 hover:border-violet-200 inline-flex items-center gap-2"
                  >
                    <Sparkles size={12} className="text-violet-500" />
                    Go-to-Market Plan
                  </button>
                </div>
                <button
                  type="button"
                  onClick={() => showToast('Add connection menu opened')}
                  className="mt-2.5 inline-flex items-center gap-1.5 text-[11px] font-medium text-violet-600 hover:text-violet-700"
                >
                  <Plus size={12} />
                  Add connection
                </button>
              </div>

              <div className="rounded-2xl border border-gray-200 bg-white p-4">
                <div className="flex items-center justify-between">
                  <div className="text-[12px] font-semibold text-[#1f2537]">Participants</div>
                  <button
                    type="button"
                    onClick={() => {
                      setActiveRightTab('room');
                      setIsRoomInviteModalOpen(true);
                      showToast('Invite panel opened');
                    }}
                    className="text-[10px] font-semibold text-violet-600 hover:text-violet-700"
                  >
                    Invite
                  </button>
                </div>
                <div className="mt-2 flex items-center -space-x-2">
                  {meetingParticipants.slice(0, 4).map((participant) => (
                    <img
                      key={`whiteboard-participant-${participant.name}`}
                      src={participant.img}
                      alt={participant.name}
                      title={participant.name}
                      className="w-7 h-7 rounded-full border-2 border-white object-cover"
                    />
                  ))}
                  <button
                    type="button"
                    onClick={() => showToast('Participant list opened')}
                    className="ml-2 h-7 px-2 rounded-full border border-violet-200 bg-violet-50 text-[10px] font-semibold text-violet-700 hover:bg-violet-100"
                  >
                    +{meetingOverflowParticipants.length}
                  </button>
                </div>
              </div>
            </div>
          )}

          {/* D. ACTIVE TAB: TASKS WORKLIST */}
          {activeRightTab === 'tasks' && (
            <div className="flex-1 overflow-y-auto thin-scrollbar p-5 flex flex-col space-y-6 bg-white dark:bg-[#18181b]">
              {/* Single Clean Surface for Add Task & Filters */}
              <div className="rounded-2xl bg-slate-50/50 dark:bg-zinc-800/25 p-3 space-y-2.5">
              {/* Filter Tabs & Clean Surface */}
              <div className="space-y-3.5">
                {/* Segmented Filter Track (Your Tasks, Agent Tasks, Team Tasks, All) */}
                <div className="flex items-center gap-1 p-0.5 bg-slate-100/70 dark:bg-zinc-800/50 rounded-lg self-start overflow-x-auto no-scrollbar w-full">
                  <button
                    type="button"
                    onClick={() => {
                      setNewTaskOwner('user');
                      setTaskOwnerFilter('user');
                    }}
                    onDragOver={(e) => { e.preventDefault(); setTaskDragOverCategory && setTaskDragOverCategory('user'); }}
                    onDragLeave={() => setTaskDragOverCategory && setTaskDragOverCategory(null)}
                    onDrop={(e) => handleTaskDropOnCategory && handleTaskDropOnCategory(e, 'user')}
                    className={`px-2.5 py-1 rounded-md text-[10.5px] font-medium transition-all cursor-pointer whitespace-nowrap ${
                      taskOwnerFilter === 'user'
                        ? 'bg-violet-600/90 text-white shadow-2xs font-medium'
                        : taskDragOverCategory === 'user'
                        ? 'bg-violet-100 text-violet-700 dark:bg-violet-950/40'
                        : 'text-slate-500 dark:text-zinc-400 hover:text-slate-800 dark:hover:text-zinc-200'
                    }`}
                  >
                    Your Tasks
                  </button>
                  <button
                    type="button"
                    onClick={() => {
                      setNewTaskOwner('agent');
                      setTaskOwnerFilter('agent');
                    }}
                    onDragOver={(e) => { e.preventDefault(); setTaskDragOverCategory && setTaskDragOverCategory('agent'); }}
                    onDragLeave={() => setTaskDragOverCategory && setTaskDragOverCategory(null)}
                    onDrop={(e) => handleTaskDropOnCategory && handleTaskDropOnCategory(e, 'agent')}
                    className={`px-2.5 py-1 rounded-md text-[10.5px] font-medium transition-all cursor-pointer whitespace-nowrap ${
                      taskOwnerFilter === 'agent'
                        ? 'bg-violet-600/90 text-white shadow-2xs font-medium'
                        : taskDragOverCategory === 'agent'
                        ? 'bg-violet-100 text-violet-700 dark:bg-violet-950/40'
                        : 'text-slate-500 dark:text-zinc-400 hover:text-slate-800 dark:hover:text-zinc-200'
                    }`}
                  >
                    Agent Tasks
                  </button>
                  <button
                    type="button"
                    onClick={() => {
                      setNewTaskOwner('team');
                      setTaskOwnerFilter('team');
                    }}
                    onDragOver={(e) => { e.preventDefault(); setTaskDragOverCategory && setTaskDragOverCategory('team'); }}
                    onDragLeave={() => setTaskDragOverCategory && setTaskDragOverCategory(null)}
                    onDrop={(e) => handleTaskDropOnCategory && handleTaskDropOnCategory(e, 'team')}
                    className={`px-2.5 py-1 rounded-md text-[10.5px] font-medium transition-all cursor-pointer whitespace-nowrap ${
                      taskOwnerFilter === 'team'
                        ? 'bg-violet-600/90 text-white shadow-2xs font-medium'
                        : taskDragOverCategory === 'team'
                        ? 'bg-violet-100 text-violet-700 dark:bg-violet-950/40'
                        : 'text-slate-500 dark:text-zinc-400 hover:text-slate-800 dark:hover:text-zinc-200'
                    }`}
                  >
                    Team Tasks
                  </button>
                  <button
                    type="button"
                    onClick={() => setTaskOwnerFilter('all')}
                    className={`px-2.5 py-1 rounded-md text-[10.5px] font-medium transition-all cursor-pointer whitespace-nowrap ${
                      taskOwnerFilter === 'all'
                        ? 'bg-violet-600/90 text-white shadow-2xs font-medium'
                        : 'text-slate-500 dark:text-zinc-400 hover:text-slate-800 dark:hover:text-zinc-200'
                    }`}
                  >
                    All
                  </button>
                </div>

                {/* Refined 42px Input Surface with Leading '+' Icon */}
                <div className="flex items-center gap-2">
                  <div className="relative flex-1 flex items-center">
                    <Plus size={14} className="absolute left-3 text-slate-400 dark:text-zinc-500 pointer-events-none" />
                    <input
                      type="text"
                      value={newTaskInput}
                      onChange={(e) => setNewTaskInput(e.target.value)}
                      onKeyDown={(e) => {
                        if (e.key === 'Enter') {
                          e.preventDefault();
                          e.stopPropagation();
                          addTaskFromInput();
                        }
                      }}
                      placeholder=""
                      className="w-full bg-slate-50/60 dark:bg-zinc-800/30 border border-slate-200/60 dark:border-zinc-700/60 rounded-lg pl-8 pr-3 h-[42px] text-xs text-slate-800 dark:text-zinc-100 focus:outline-none focus:border-violet-500/80 focus:bg-white dark:focus:bg-zinc-900 transition-all shadow-2xs"
                    />
                  </div>
                  <button
                    type="button"
                    onClick={addTaskFromInput}
                    className="h-[42px] px-3.5 rounded-lg text-xs font-medium bg-violet-600/90 hover:bg-violet-700 active:bg-violet-800 text-white shadow-2xs transition-colors shrink-0 cursor-pointer"
                  >
                    Save
                  </button>
                </div>
              </div>

              {/* Task Items List - Quiet Density & Faint Separators */}
              <div className="divide-y divide-slate-100/60 dark:divide-zinc-800/40">
                {visibleTasks.map(task => (
                  <div 
                    key={task.id}
                    draggable
                    onDragStart={(e) => handleTaskDragStart && handleTaskDragStart(e, task.id)}
                    onClick={() => {
                      setTasks(prev => prev.map(t => t.id === task.id ? { ...t, completed: !t.completed } : t));
                      showToast(task.completed ? "Task uncompleted" : "Task marked completed");
                    }}
                    className={`group flex items-start gap-2.5 py-2.5 px-2 rounded-lg transition-all cursor-pointer relative ${
                      task.completed 
                        ? 'opacity-30 text-slate-400 dark:text-zinc-500' 
                        : 'hover:bg-slate-50/70 dark:hover:bg-zinc-800/30 text-slate-800 dark:text-zinc-200 opacity-100'
                    }`}
                  >
                    {/* Compact Checkbox */}
                    <div className={`mt-0.5 w-3.5 h-3.5 rounded border flex items-center justify-center transition-all shrink-0 ${
                      task.completed 
                        ? 'bg-violet-600 border-violet-600 text-white' 
                        : 'border-slate-300 dark:border-zinc-600 bg-white dark:bg-zinc-900 group-hover:border-violet-400'
                    }`}>
                      {task.completed && <Check size={9} strokeWidth={3} />}
                    </div>

                    <div className="flex-1 min-w-0">
                      <div className="flex items-start justify-between gap-2">
                        <div className="min-w-0 flex-1">
                          {/* Top Badges (AI / Project Tag) */}
                          <div className="flex items-center gap-1.5 mb-0.5">
                            {(task.isAiCreated || task.owner === 'agent') && (
                              <span className="inline-flex items-center px-1.5 py-0.2 rounded text-[8.5px] font-semibold bg-slate-100/80 text-slate-500 dark:bg-zinc-800 dark:text-zinc-400 border border-slate-200/50 dark:border-zinc-700/50">
                                AI
                              </span>
                            )}
                            {task.project && (
                              <span className="inline-flex items-center text-[10px] font-normal text-slate-400 dark:text-zinc-500">
                                {task.project}
                              </span>
                            )}
                          </div>

                          {/* Editable Title */}
                          {editingTaskId === task.id ? (
                            <textarea
                              autoFocus
                              rows={Math.max(2, Math.ceil((editingTaskText || '').length / 28))}
                              value={editingTaskText}
                              onChange={(event) => setEditingTaskText(event.target.value)}
                              onClick={(event) => event.stopPropagation()}
                              onBlur={() => commitTaskEdit(task.id)}
                              onKeyDown={(event) => {
                                if (event.key === 'Enter' && !event.shiftKey) {
                                  event.preventDefault();
                                  commitTaskEdit(task.id);
                                }
                                if (event.key === 'Escape') {
                                  setEditingTaskId(null);
                                  setEditingTaskText('');
                                }
                              }}
                              className="w-full bg-white dark:bg-zinc-900 border border-violet-400 dark:border-violet-500 rounded-lg px-3 py-1.5 text-[13px] font-normal leading-relaxed text-slate-900 dark:text-zinc-100 focus:outline-none shadow-xs resize-none min-h-[52px]"
                            />
                          ) : (
                            <p
                              onDoubleClick={(event) => {
                                event.stopPropagation();
                                beginTaskEdit(task);
                              }}
                              className={`text-[13px] font-normal leading-snug break-words ${
                                task.completed ? 'line-through text-slate-400/60 dark:text-zinc-500/60' : 'text-slate-800 dark:text-zinc-100'
                              }`}
                            >
                              {task.text}
                            </p>
                          )}

                          {/* Muted Metadata Row (Due Date • Priority • Assignees) */}
                          <div className="mt-1 flex flex-wrap items-center gap-2 text-[10.5px] text-slate-400 dark:text-zinc-500 font-normal">
                            {/* Floating Due Date Popover Anchor */}
                            <div className="relative">
                              <button
                                type="button"
                                onClick={(e) => {
                                  e.stopPropagation();
                                  setDueDatePickerTaskId && setDueDatePickerTaskId(dueDatePickerTaskId === task.id ? null : task.id);
                                  setPriorityPickerTaskId && setPriorityPickerTaskId(null);
                                  setAssigneePickerTaskId && setAssigneePickerTaskId(null);
                                }}
                                className="inline-flex items-center gap-1 hover:text-slate-700 dark:hover:text-zinc-200 transition-colors cursor-pointer"
                              >
                                <Clock size={10} className="text-slate-400" />
                                <span>{task.dueDate || 'No Date'}</span>
                              </button>

                              {/* Floating Mini Calendar Popover */}
                              {dueDatePickerTaskId === task.id && (
                                <div 
                                  onClick={(e) => e.stopPropagation()}
                                  className="absolute left-0 top-full mt-1.5 w-60 bg-white dark:bg-zinc-900 border border-slate-200/80 dark:border-zinc-700/80 rounded-xl shadow-lg p-2 z-50 animate-in fade-in zoom-in-95 duration-100"
                                >
                                  <div className="flex items-center gap-1 mb-2 pb-1.5 border-b border-slate-100 dark:border-zinc-800 overflow-x-auto thin-scrollbar">
                                    {['Today', 'Tomorrow', 'Next Week', 'No Date'].map(shortcut => (
                                      <button
                                        key={shortcut}
                                        type="button"
                                        onClick={() => setTaskDueDate && setTaskDueDate(task.id, shortcut === 'No Date' ? null : shortcut)}
                                        className={`px-2 py-0.5 rounded text-[10px] font-medium transition-colors whitespace-nowrap cursor-pointer ${
                                          task.dueDate === shortcut 
                                            ? 'bg-violet-600/90 text-white font-semibold' 
                                            : 'bg-slate-100/80 dark:bg-zinc-800 text-slate-600 dark:text-zinc-300 hover:bg-slate-200/80'
                                        }`}
                                      >
                                        {shortcut}
                                      </button>
                                    ))}
                                  </div>
                                  <div className="flex items-center justify-between px-1 mb-1.5">
                                    <span className="text-[11px] font-semibold text-slate-700 dark:text-zinc-200">July 2026</span>
                                    <div className="flex items-center gap-0.5">
                                      <button type="button" className="p-0.5 rounded text-slate-400 hover:text-slate-700 dark:hover:text-zinc-200">
                                        <ChevronLeft size={12} />
                                      </button>
                                      <button type="button" className="p-0.5 rounded text-slate-400 hover:text-slate-700 dark:hover:text-zinc-200">
                                        <ChevronRight size={12} />
                                      </button>
                                    </div>
                                  </div>
                                  <div className="grid grid-cols-7 gap-1 text-center text-[9.5px] font-medium text-slate-400 dark:text-zinc-500 mb-1">
                                    <span>S</span><span>M</span><span>T</span><span>W</span><span>T</span><span>F</span><span>S</span>
                                  </div>
                                  <div className="grid grid-cols-7 gap-1 text-center">
                                    {Array.from({ length: 31 }, (_, i) => i + 1).map(day => (
                                      <button
                                        key={day}
                                        type="button"
                                        onClick={() => setTaskDueDate && setTaskDueDate(task.id, `Jul ${day}`)}
                                        className={`h-5 w-full rounded text-[10px] font-medium flex items-center justify-center cursor-pointer transition-colors ${
                                          task.dueDate === `Jul ${day}`
                                            ? 'bg-violet-600 text-white font-semibold'
                                            : 'text-slate-700 dark:text-zinc-300 hover:bg-slate-100 dark:hover:bg-zinc-800'
                                        }`}
                                      >
                                        {day}
                                      </button>
                                    ))}
                                  </div>
                                </div>
                              )}
                            </div>

                            {/* Floating Priority Dropdown Anchor */}
                            <div className="relative">
                              <button
                                type="button"
                                onClick={(e) => {
                                  e.stopPropagation();
                                  setPriorityPickerTaskId && setPriorityPickerTaskId(priorityPickerTaskId === task.id ? null : task.id);
                                  setDueDatePickerTaskId && setDueDatePickerTaskId(null);
                                  setAssigneePickerTaskId && setAssigneePickerTaskId(null);
                                }}
                                className="px-1.5 py-0.2 rounded text-[9px] font-medium bg-slate-100/70 text-slate-500 dark:bg-zinc-800/80 dark:text-zinc-400 border border-slate-200/40 dark:border-zinc-700/40 hover:bg-slate-200/70 cursor-pointer"
                              >
                                {task.priority || 'Priority'}
                              </button>

                              {/* Compact Priority Dropdown */}
                              {priorityPickerTaskId === task.id && (
                                <div 
                                  onClick={(e) => e.stopPropagation()}
                                  className="absolute left-0 top-full mt-1.5 w-36 bg-white dark:bg-zinc-900 border border-slate-200/80 dark:border-zinc-700/80 rounded-xl shadow-lg p-1 z-50 animate-in fade-in zoom-in-95 duration-100"
                                >
                                  {[
                                    { label: 'Urgent', color: 'bg-rose-500' },
                                    { label: 'High', color: 'bg-amber-500' },
                                    { label: 'Medium', color: 'bg-blue-500' },
                                    { label: 'Low', color: 'bg-slate-400' },
                                    { label: 'No Priority', color: 'bg-transparent border border-slate-300' }
                                  ].map(p => (
                                    <button
                                      key={p.label}
                                      type="button"
                                      onPointerDown={(e) => {
                                        e.preventDefault();
                                        setTaskPriority && setTaskPriority(task.id, p.label === 'No Priority' ? null : p.label);
                                      }}
                                      className={`w-full flex items-center gap-2 px-2 py-1.5 rounded-lg text-[10.5px] font-medium transition-colors cursor-pointer ${
                                        task.priority === p.label || (p.label === 'No Priority' && !task.priority)
                                          ? 'bg-violet-50 text-violet-700 dark:bg-violet-950/40 dark:text-violet-300'
                                          : 'hover:bg-slate-100/70 dark:hover:bg-zinc-800 text-slate-700 dark:text-zinc-300'
                                      }`}
                                    >
                                      <span className={`w-2 h-2 rounded-full ${p.color}`} />
                                      <span className="flex-1 text-left">{p.label}</span>
                                      {(task.priority === p.label || (p.label === 'No Priority' && !task.priority)) && (
                                        <Check size={11} className="text-violet-600 dark:text-violet-400" />
                                      )}
                                    </button>
                                  ))}
                                </div>
                              )}
                            </div>

                            {/* Assignee / Stacked Avatars with Searchable Assign Popover */}
                            <div className="inline-flex items-center gap-1 relative">
                              {task.assignees && task.assignees.length > 0 ? (
                                task.owner === 'team' || task.assignees.length > 1 ? (
                                  /* Natural Stacked Avatars */
                                  <div 
                                    onClick={(e) => {
                                      e.stopPropagation();
                                      setAssigneePickerTaskId && setAssigneePickerTaskId(assigneePickerTaskId === task.id ? null : task.id);
                                      setDueDatePickerTaskId && setDueDatePickerTaskId(null);
                                      setPriorityPickerTaskId && setPriorityPickerTaskId(null);
                                    }}
                                    className="flex items-center -space-x-2 cursor-pointer hover:opacity-80 transition-opacity"
                                    title="Click to assign teammates"
                                  >
                                    {task.assignees.slice(0, 3).map((person, idx) => (
                                      person.avatar ? (
                                        <img 
                                          key={person.id || idx} 
                                          src={person.avatar} 
                                          alt={person.name} 
                                          className="w-4 h-4 rounded-full border border-white dark:border-zinc-900 object-cover" 
                                        />
                                      ) : (
                                        <div key={person.id || idx} className="w-4 h-4 rounded-full border border-white dark:border-zinc-900 bg-violet-600/90 text-[8px] font-bold text-white flex items-center justify-center">
                                          AI
                                        </div>
                                      )
                                    ))}
                                    {task.assignees.length > 3 && (
                                      <span className="text-[9px] text-slate-400 pl-1 font-medium">+{task.assignees.length - 3}</span>
                                    )}
                                  </div>
                                ) : (
                                  /* Single Assignee Chip */
                                  <button
                                    type="button"
                                    onClick={(e) => {
                                      e.stopPropagation();
                                      setAssigneePickerTaskId && setAssigneePickerTaskId(assigneePickerTaskId === task.id ? null : task.id);
                                      setDueDatePickerTaskId && setDueDatePickerTaskId(null);
                                      setPriorityPickerTaskId && setPriorityPickerTaskId(null);
                                    }}
                                    className="inline-flex items-center gap-1 px-1.5 py-0.2 rounded bg-slate-100/60 dark:bg-zinc-800 text-slate-600 dark:text-zinc-300 text-[10px] font-normal hover:bg-slate-200/60 dark:hover:bg-zinc-700 transition-colors cursor-pointer"
                                  >
                                    {task.assignees[0].avatar ? (
                                      <img src={task.assignees[0].avatar} alt={task.assignees[0].name} className="w-3.5 h-3.5 rounded-full object-cover" />
                                    ) : (
                                      <span className="w-3.5 h-3.5 rounded-full bg-violet-600/90 text-[8px] font-bold text-white flex items-center justify-center">AI</span>
                                    )}
                                    <span>{task.assignees[0].name}</span>
                                  </button>
                                )
                              ) : (
                                /* Assign Chip when no assignee exists */
                                <button
                                  type="button"
                                  onClick={(e) => {
                                    e.stopPropagation();
                                    setAssigneePickerTaskId && setAssigneePickerTaskId(assigneePickerTaskId === task.id ? null : task.id);
                                    setDueDatePickerTaskId && setDueDatePickerTaskId(null);
                                    setPriorityPickerTaskId && setPriorityPickerTaskId(null);
                                  }}
                                  className="inline-flex items-center gap-1 px-1.5 py-0.2 rounded border border-dashed border-slate-300 dark:border-zinc-700 text-[9.5px] font-normal text-slate-400 dark:text-zinc-500 hover:text-slate-700 dark:hover:text-zinc-200 transition-colors cursor-pointer"
                                >
                                  <UserPlus size={9} />
                                  <span>Assign</span>
                                </button>
                              )}

                              {/* Refined Assign To Popover with Search & AI Grouping */}
                              {assigneePickerTaskId === task.id && (
                                <div 
                                  onClick={(e) => e.stopPropagation()}
                                  className="absolute left-0 top-full mt-1.5 w-56 bg-white dark:bg-zinc-900 border border-slate-200/80 dark:border-zinc-700/80 rounded-xl shadow-lg p-1.5 z-50 animate-in fade-in zoom-in-95 duration-100"
                                >
                                  {/* Pinned Search Input */}
                                  <div className="p-1 mb-1 border-b border-slate-100 dark:border-zinc-800">
                                    <div className="relative flex items-center">
                                      <Search size={11} className="absolute left-2 text-slate-400 dark:text-zinc-500 pointer-events-none" />
                                      <input 
                                        type="text"
                                        value={assigneeSearchQuery}
                                        onChange={(e) => setAssigneeSearchQuery && setAssigneeSearchQuery(e.target.value)}
                                        placeholder="Search teammates..."
                                        className="w-full bg-slate-50/80 dark:bg-zinc-800/50 border border-slate-200/60 dark:border-zinc-700/60 rounded-md pl-6 pr-2 py-1 text-[10.5px] text-slate-800 dark:text-zinc-100 placeholder-slate-400 focus:outline-none focus:border-violet-500/80"
                                      />
                                    </div>
                                  </div>

                                  <div className="space-y-0.5 max-h-52 overflow-y-auto thin-scrollbar">
                                    {/* Human Collaborators */}
                                    {WORKSPACE_TEAMMATES
                                      .filter(p => p.type !== 'agent')
                                      .filter(p => !assigneeSearchQuery || p.name.toLowerCase().includes(assigneeSearchQuery.toLowerCase()))
                                      .map((person) => {
                                        const isSelected = (task.assignees || []).some(a => a.id === person.id);
                                        return (
                                          <button
                                            key={person.id}
                                            type="button"
                                            onPointerDown={(e) => {
                                              e.preventDefault();
                                              toggleAssignee && toggleAssignee(task.id, person);
                                            }}
                                            className={`w-full flex items-center gap-2 px-2 py-1.5 rounded-lg text-xs font-medium transition-colors text-left cursor-pointer ${
                                              isSelected 
                                                ? 'bg-violet-50 text-violet-700 dark:bg-violet-950/40 dark:text-violet-300' 
                                                : 'hover:bg-slate-100/70 dark:hover:bg-zinc-800 text-slate-700 dark:text-zinc-300'
                                            }`}
                                          >
                                            <img src={person.avatar} alt={person.name} className="w-4 h-4 rounded-full object-cover shrink-0" />
                                            <div className="flex-1 min-w-0 flex items-center justify-between">
                                              <span className="truncate text-[11px] font-medium">{person.name}</span>
                                              {person.role && <span className="text-[9.5px] text-slate-400 dark:text-zinc-500 ml-1 font-normal">{person.role}</span>}
                                            </div>
                                            {isSelected && <Check size={11} className="text-violet-600 dark:text-violet-400 shrink-0" />}
                                          </button>
                                        );
                                      })}

                                    {/* AI Collaborators Grouped Separately */}
                                    <div className="pt-1.5 mt-1 border-t border-slate-100 dark:border-zinc-800">
                                      <div className="px-2 py-0.5 text-[9.5px] font-semibold uppercase tracking-wider text-slate-400 dark:text-zinc-500">
                                        AI Collaborators
                                      </div>
                                      {WORKSPACE_TEAMMATES
                                        .filter(p => p.type === 'agent')
                                        .filter(p => !assigneeSearchQuery || p.name.toLowerCase().includes(assigneeSearchQuery.toLowerCase()))
                                        .map((person) => {
                                          const isSelected = (task.assignees || []).some(a => a.id === person.id);
                                          return (
                                            <button
                                              key={person.id}
                                              type="button"
                                              onPointerDown={(e) => {
                                                e.preventDefault();
                                                toggleAssignee && toggleAssignee(task.id, person);
                                              }}
                                              className={`w-full flex items-center gap-2 px-2 py-1.5 rounded-lg text-xs font-medium transition-colors text-left cursor-pointer ${
                                                isSelected 
                                                  ? 'bg-violet-50 text-violet-700 dark:bg-violet-950/40 dark:text-violet-300' 
                                                  : 'hover:bg-slate-100/70 dark:hover:bg-zinc-800 text-slate-700 dark:text-zinc-300'
                                              }`}
                                            >
                                              <div className="w-4 h-4 rounded-full bg-violet-600/90 text-[8px] font-bold text-white flex items-center justify-center shrink-0">
                                                AI
                                              </div>
                                              <div className="flex-1 min-w-0 flex items-center justify-between">
                                                <span className="truncate text-[11px] font-medium">{person.name}</span>
                                                <span className="text-[9.5px] text-violet-600 dark:text-violet-400 ml-1 font-medium">AI Agent</span>
                                              </div>
                                              {isSelected && <Check size={11} className="text-violet-600 dark:text-violet-400 shrink-0" />}
                                            </button>
                                          );
                                        })}
                                    </div>
                                  </div>
                                </div>
                              )}
                            </div>
                          </div>
                        </div>

                        {/* Hover Pen & Delete Action Buttons */}
                        <div className="opacity-0 group-hover:opacity-100 transition-opacity duration-150 flex items-center gap-0.5 shrink-0">
                          <button
                            type="button"
                            onClick={(event) => {
                              event.stopPropagation();
                              beginTaskEdit(task);
                            }}
                            className="p-1 rounded-md text-slate-400 dark:text-zinc-500 hover:text-violet-600 dark:hover:text-violet-400 hover:bg-violet-50 dark:hover:bg-violet-950/30 cursor-pointer"
                            title="Edit task"
                          >
                            <Pen size={12} strokeWidth={1.5} />
                          </button>
                          <button
                            type="button"
                            onClick={(event) => {
                              event.stopPropagation();
                              removeTask(task.id);
                            }}
                            className="p-1 -mr-1 rounded-md text-slate-400 dark:text-zinc-500 hover:text-rose-600 dark:hover:text-rose-400 hover:bg-rose-50 dark:hover:bg-rose-950/30 shrink-0 cursor-pointer"
                            title="Delete task"
                          >
                            <Trash2 size={12} strokeWidth={1.5} />
                          </button>
                        </div>
                      </div>

                      {/* Subtle Action Row: Schedule • Delegate • Open */}
                      <div className="mt-2 flex items-center gap-3 pt-1 border-t border-slate-100/40 dark:border-zinc-800/30 text-[11px] text-slate-400/80 dark:text-zinc-500">
                        <button
                          type="button"
                          onClick={(event) => {
                            event.stopPropagation();
                            convertTaskToSchedule(task);
                          }}
                          className="inline-flex items-center gap-1 hover:text-slate-700 dark:hover:text-zinc-200 transition-colors font-medium cursor-pointer"
                        >
                          <Calendar size={11} strokeWidth={1.5} />
                          <span>Schedule</span>
                        </button>
                        <button
                          type="button"
                          onClick={(event) => {
                            event.stopPropagation();
                            setAssigneePickerTaskId && setAssigneePickerTaskId(assigneePickerTaskId === task.id ? null : task.id);
                          }}
                          className="inline-flex items-center gap-1 hover:text-slate-700 dark:hover:text-zinc-200 transition-colors font-medium cursor-pointer"
                        >
                          <UserPlus size={11} strokeWidth={1.5} />
                          <span>Delegate</span>
                        </button>
                        <button
                          type="button"
                          onClick={(event) => {
                            event.stopPropagation();
                            showToast(`Opening context: ${task.sourceContext?.title || docTitle || 'Workspace'}`);
                          }}
                          className="inline-flex items-center gap-1 hover:text-slate-700 dark:hover:text-zinc-200 transition-colors font-medium cursor-pointer ml-auto"
                        >
                          <ExternalLink size={11} strokeWidth={1.5} />
                          <span>Open</span>
                        </button>
                      </div>
                    </div>
                  </div>
                ))}
                {visibleTasks.length === 0 && (
                  <div className="py-12 text-center space-y-1">
                    <div className="text-xs text-slate-400 dark:text-zinc-500 font-medium">No tasks in this view</div>
                    <div className="text-[11px] text-slate-300 dark:text-zinc-600">Drag or create tasks to organize</div>
                  </div>
                )}
              </div>
            </div>
          )}

          {activeRightTab === 'manageen' && (
            <div className="flex-1 overflow-y-auto thin-scrollbar p-4 bg-[#fbfbfe]">
              <div className="rounded-2xl border border-violet-100 bg-white p-4 shadow-[0_14px_32px_-30px_rgba(109,40,217,0.6)]">
                <div className="flex items-center justify-between gap-2">
                  <div>
                    <div className="text-[10px] uppercase tracking-[0.14em] text-violet-500 font-semibold">Manageen</div>
                    <h3 className="mt-1 text-[18px] leading-tight font-semibold text-slate-900">Project clarity without Jira complexity</h3>
                  </div>
                  <button
                    type="button"
                    onClick={() => showToast('Manageen project templates opening soon')}
                    className="h-8 px-3 rounded-lg bg-violet-600 text-white text-[11px] font-semibold hover:bg-violet-700"
                  >
                    New plan
                  </button>
                </div>
                <p className="mt-2 text-[12px] leading-5 text-slate-600">
                  Beginner-friendly planning for marketing, finance, healthcare, and software teams. Keep everyone aligned on what to do next and how work is progressing.
                </p>

                <div className="mt-3 grid grid-cols-3 gap-2">
                  <div className="rounded-xl border border-slate-200 bg-slate-50 px-2.5 py-2">
                    <div className="text-[10px] uppercase tracking-wide text-slate-400">In Progress</div>
                    <div className="mt-0.5 text-lg font-semibold text-slate-900">{tasks.filter((task) => !task.completed).length}</div>
                  </div>
                  <div className="rounded-xl border border-slate-200 bg-slate-50 px-2.5 py-2">
                    <div className="text-[10px] uppercase tracking-wide text-slate-400">Completed</div>
                    <div className="mt-0.5 text-lg font-semibold text-slate-900">{tasks.filter((task) => task.completed).length}</div>
                  </div>
                  <div className="rounded-xl border border-slate-200 bg-slate-50 px-2.5 py-2">
                    <div className="text-[10px] uppercase tracking-wide text-slate-400">On Track</div>
                    <div className="mt-0.5 text-lg font-semibold text-emerald-600">82%</div>
                  </div>
                </div>
              </div>

              <div className="mt-3 rounded-2xl border border-slate-200 bg-white p-3">
                <div className="flex items-center justify-between">
                  <div className="text-xs font-semibold text-slate-800">Focus Streams</div>
                  <button
                    type="button"
                    onClick={() => showToast('Stream settings opened')}
                    className="text-[11px] font-medium text-violet-600 hover:text-violet-700"
                  >
                    Manage
                  </button>
                </div>
                <div className="mt-2 space-y-1.5">
                  {[
                    { name: 'Marketing Launch', owner: 'Priya', progress: '6/8 milestones' },
                    { name: 'Finance Planning', owner: 'Maya', progress: '4/6 milestones' },
                    { name: 'Healthcare Onboarding', owner: 'Rami', progress: '3/5 milestones' },
                    { name: 'Engineering Delivery', owner: 'Alex', progress: '11/14 milestones' },
                  ].map((stream) => (
                    <button
                      key={stream.name}
                      type="button"
                      onClick={() => showToast(`${stream.name} opened in Manageen`) }
                      className="w-full rounded-xl border border-slate-200 bg-slate-50/70 px-3 py-2 text-left hover:border-violet-200 hover:bg-violet-50/40"
                    >
                      <div className="flex items-center justify-between gap-2">
                        <span className="text-xs font-semibold text-slate-800 truncate">{stream.name}</span>
                        <span className="text-[10px] text-slate-500">Owner: {stream.owner}</span>
                      </div>
                      <div className="mt-0.5 text-[11px] text-slate-500">{stream.progress}</div>
                    </button>
                  ))}
                </div>
              </div>

              <div className="mt-3 rounded-2xl border border-slate-200 bg-white p-3">
                <div className="text-xs font-semibold text-slate-800">Simple Board</div>
                <div className="mt-2 grid grid-cols-3 gap-2 text-[11px]">
                  {[
                    { title: 'Todo', items: ['Define scope', 'Assign owners'] },
                    { title: 'Doing', items: ['Prepare campaign deck', 'Review budget'] },
                    { title: 'Done', items: ['Kickoff complete', 'Stakeholders aligned'] },
                  ].map((column) => (
                    <div key={column.title} className="rounded-xl border border-slate-200 bg-slate-50 p-2">
                      <div className="text-[10px] font-semibold uppercase tracking-wide text-slate-500">{column.title}</div>
                      <div className="mt-1.5 space-y-1.5">
                        {column.items.map((item) => (
                          <button
                            key={item}
                            type="button"
                            onClick={() => showToast(`${item} opened`) }
                            className="w-full rounded-md border border-slate-200 bg-white px-2 py-1.5 text-left text-[11px] text-slate-700 hover:border-violet-200"
                          >
                            {item}
                          </button>
                        ))}
                      </div>
                    </div>
                  ))}
                </div>
              </div>
            </div>
          )}

          {/* E. ACTIVE TAB: INTEGRATED CALENDAR & TIMELINE SCHEDULE */}
          {activeRightTab === 'calendar' && (
            <div className="flex-1 min-h-0 flex flex-col relative">
              <div className="flex-1 overflow-y-auto thin-scrollbar px-4 pt-1 pb-3 bg-[linear-gradient(180deg,#f6f7fb_0%,#f4f5f9_100%)]">
                <div className="rounded-2xl border border-[#e8eaf2] bg-[#f5f6fa] p-3 space-y-3">
                  <div className="rounded-2xl border border-[#ececf5] bg-white px-3.5 py-3 shadow-[0_14px_32px_-28px_rgba(15,23,42,0.35)]">
                    <div className="flex items-center justify-between text-[12px]">
                      <div className="text-slate-800 font-medium inline-flex items-center gap-1.5">
                        <Calendar size={12} className="text-violet-500" />
                        Today <span className="text-violet-600 font-semibold">- {selectedCalendarDate.toLocaleDateString(undefined, { month: 'short', day: 'numeric', year: 'numeric' })}</span>
                      </div>
                      <div className="inline-flex items-center gap-1.5">
                        <button
                          type="button"
                          onClick={() => {
                            closeTransientMenus();
                            setIsScheduleCalendarExpanded(true);
                          }}
                          className="text-slate-400 hover:text-slate-600"
                          title="Toggle calendar"
                        >
                          <ChevronDown size={14} />
                        </button>
                      </div>
                    </div>

                    <div className="mt-3 border-t border-[#ececf5] pt-2.5">
                      <div className="flex items-center justify-between">
                        <div className="text-[11px] font-medium text-slate-600">Upcoming</div>
                        <button
                          type="button"
                          onClick={() => {
                            closeTransientMenus();
                            setIsScheduleCalendarExpanded(true);
                          }}
                          className="text-[10px] font-medium text-violet-600 hover:text-violet-700"
                        >
                          See full calendar
                        </button>
                      </div>
                      <div className="relative mt-2 space-y-0">
                        <div className="absolute left-[6px] top-[12px] bottom-[16px] w-px bg-[#d1d5db]" />
                        {scheduleAgendaItems.slice(0, 2).map((event, index) => (
                          <div key={`timeline-${event.id}`} className={`relative grid grid-cols-[62px_1fr] gap-3 ${index > 0 ? 'border-t border-[#ececf5]' : ''}`}>
                            <div className="relative pl-3 text-[11.5px] leading-4 text-slate-700 pt-[8px] pb-[8px]">
                              <span className="absolute left-[0px] top-[13px] h-1.5 w-1.5 rounded-full bg-violet-500 ring-2 ring-white" />
                              <div className="whitespace-nowrap">{event.slot || '10:00 AM'}</div>
                              <div className="text-[10px] text-slate-400">{Math.max(15, Number(event.durationMinutes || 60))}m</div>
                            </div>
                            <div className="relative rounded-lg px-2 py-[8px]">
                              <div className="text-[12.5px] font-medium text-slate-800 leading-snug">{event.title}</div>
                              <span className="mt-0.5 inline-flex rounded-full border border-violet-100 bg-violet-50 px-1.5 py-[1px] text-[10px] text-violet-500">{event.category || 'General'}</span>
                            </div>
                          </div>
                        ))}
                      </div>
                    </div>
                    <div className="mt-3 rounded-2xl border border-[#e9e0ff] bg-[#f6f1ff] px-3.5 py-3">
                      <div className="text-[12px] font-medium text-slate-800 inline-flex items-center gap-1.5">
                        <Sparkles size={12} className="text-violet-500" /> AI Schedule Insight
                      </div>
                      <div className="mt-2 text-[12px] text-slate-700 leading-relaxed">{scheduleAiInsights[0] || 'Schedule balance looks healthy. Keep one flexible slot open for AI-assisted revisions.'}</div>
                      <button
                        type="button"
                        onClick={() => {
                          setRightSidebarOpen(true);
                          setActiveRightTab('assistant');
                          setAssistantQuickPrompt('Optimize my next three schedule blocks for focus and momentum.');
                        }}
                        className="mt-3 w-full rounded-lg border border-violet-200 bg-violet-100 px-3 py-1.5 text-[12px] font-medium text-violet-700 hover:bg-violet-200/70"
                      >
                        Optimize Schedule
                      </button>
                    </div>

                    <div className="mt-3 rounded-2xl border border-[#ede7ff] bg-[#faf7ff] px-3.5 py-3">
                      <div className="text-[12px] font-medium text-slate-700 mb-2">Quick Add</div>
                      <div className="flex items-center gap-1.5 min-w-0 overflow-hidden">
                        <div className="relative" ref={quickAddSourceMenuRef}>
                          <button
                            type="button"
                            onClick={() => setIsQuickAddSourceMenuOpen((prev) => !prev)}
                            className="inline-flex h-8 items-center gap-1 rounded-lg border border-violet-200 bg-white px-2 text-[10px] font-medium text-violet-700 hover:border-violet-300 hover:bg-violet-50"
                            title="Add context source"
                          >
                            <Plus size={11} />
                            <ChevronDown size={11} />
                          </button>
                          {isQuickAddSourceMenuOpen && (
                            <div className="absolute left-0 top-full z-20 mt-1.5 w-44 rounded-lg border border-[#e5e7f1] bg-white p-1 shadow-[0_12px_28px_-18px_rgba(15,23,42,0.45)]">
                              {QUICK_ADD_SOURCE_OPTIONS.map((source) => (
                                <button
                                  key={source.id}
                                  type="button"
                                  onClick={() => handleQuickAddSourceAction(source.id)}
                                  className="w-full rounded-md px-2.5 py-1.5 text-left text-[11px] text-slate-700 hover:bg-violet-50 inline-flex items-center gap-2"
                                >
                                  <span className="text-slate-500">{getQuickAddSourceIcon(source.id)}</span>
                                  {source.label}
                                </button>
                              ))}
                            </div>
                          )}
                        </div>

                        <input
                          value={scheduleInput}
                          onChange={(event) => setScheduleInput(event.target.value)}
                          onPaste={handleSchedulePaste}
                          onKeyDown={(event) => {
                            if (event.key === 'Enter') {
                              event.preventDefault();
                              convertMessyScheduleToPlan();
                            }
                          }}
                          placeholder="What do you want to schedule?"
                          className="h-8 min-w-0 flex-1 rounded-lg border border-slate-200 bg-[#fcfcff] px-2.5 text-[11px] text-slate-700 placeholder:text-[10px] placeholder:text-slate-400 focus:outline-none focus:border-violet-300"
                        />

                        <button
                          type="button"
                          onClick={convertMessyScheduleToPlan}
                          className="h-8 shrink-0 rounded-lg bg-violet-600 px-2.5 text-[10px] font-semibold text-white hover:bg-violet-700"
                        >
                          Add
                        </button>
                      </div>
                      <input
                        ref={scheduleFileInputRef}
                        type="file"
                        className="hidden"
                        onChange={async (event) => {
                          await ingestScheduleAttachments(event.target.files);
                          event.target.value = '';
                          showToast('Attachment added to schedule input');
                        }}
                      />
                    </div>

                    <div className="mt-3 rounded-2xl border border-[#e9ebf2] bg-[#f8f9fc] px-3.5 py-3">
                      <div className="text-[12px] font-medium text-slate-700 mb-2 inline-flex items-center gap-1.5"><Link size={11} className="text-slate-500" />Related to this document</div>
                      <div className="flex items-start justify-between gap-2">
                        <div className="min-w-0">
                          <div className="flex items-center gap-1.5 text-[12px] font-medium text-slate-800">
                            <span className="inline-flex h-4.5 w-4.5 items-center justify-center rounded bg-amber-100 text-amber-600">
                              <Calendar size={10} />
                            </span>
                            <span className="truncate">Product Hunt Launch Plan</span>
                          </div>
                          <div className="mt-1 text-[11px] text-slate-500">Milestone - Due {selectedCalendarDate.toLocaleDateString(undefined, { month: 'short', day: 'numeric' })}</div>
                        </div>
                        <span className="shrink-0 rounded-full border border-emerald-200 bg-emerald-50 px-2 py-0.5 text-[10px] font-medium text-emerald-700">On Track</span>
                      </div>
                    </div>
                  </div>

                {isScheduleCalendarExpanded && (
                  <div className="absolute inset-0 z-20 bg-[#f4f5fa] p-3" ref={calendarMenuRef}>
                    <div className="h-full rounded-2xl border border-[#dfe3ef] bg-white p-3 shadow-[0_18px_36px_-24px_rgba(15,23,42,0.35)] overflow-y-auto thin-scrollbar">
                    <div className="flex items-center justify-between">
                      <div>
                        <div className="text-[20px] font-semibold text-slate-900 leading-none">Launch Timeline</div>
                        <div className="text-[11px] text-slate-500 mt-1">Intelligent schedule optimized around your work</div>
                      </div>
                      <button
                        type="button"
                        onClick={() => setIsScheduleCalendarExpanded(false)}
                        className="rounded-md p-1 text-slate-400 hover:text-slate-600 hover:bg-slate-100"
                        aria-label="Close full calendar"
                      >
                        <X size={14} />
                      </button>
                    </div>

                    <div className="mt-3 rounded-xl border border-violet-100 bg-violet-50/70 px-2.5 py-2 flex items-center justify-between gap-2">
                      <div className="min-w-0">
                        <div className="text-[11px] font-medium text-violet-700">AI Planning Insight</div>
                        <div className="text-[10px] text-violet-600 truncate">You have two focus blocks back-to-back today.</div>
                      </div>
                      <button className="shrink-0 rounded-md border border-violet-200 bg-white px-2 py-1 text-[10px] font-medium text-violet-700">Optimize Day</button>
                    </div>

                    <div className="mt-3 rounded-xl border border-[#ececf5] bg-white px-2.5 py-2">
                      <div className="flex items-center justify-between text-[11px] font-semibold text-slate-600 mb-2">
                        <button
                          type="button"
                          onClick={() => {
                            if (calendarYear === 2026 && calendarMonth === 0) return;
                            if (calendarMonth === 0) {
                              setCalendarView(11, calendarYear - 1);
                            } else {
                              setCalendarView(calendarMonth - 1, calendarYear);
                            }
                          }}
                          className="rounded p-1 hover:bg-slate-100"
                          disabled={calendarYear === 2026 && calendarMonth === 0}
                        >
                          <ChevronLeft size={13} />
                        </button>
                        <span>{monthNames[calendarMonth]} {calendarYear}</span>
                        <button
                          type="button"
                          onClick={() => {
                            if (calendarMonth === 11) {
                              setCalendarView(0, calendarYear + 1);
                            } else {
                              setCalendarView(calendarMonth + 1, calendarYear);
                            }
                          }}
                          className="rounded p-1 hover:bg-slate-100"
                          disabled={calendarYear === 2029 && calendarMonth === 11}
                        >
                          <ChevronRight size={13} />
                        </button>
                      </div>
                      <div className="grid grid-cols-7 gap-1 text-center text-[10px] text-slate-400 mb-1">
                        <span>S</span><span>M</span><span>T</span><span>W</span><span>T</span><span>F</span><span>S</span>
                      </div>
                      <div className="grid grid-cols-7 gap-1 text-center text-[11px] font-medium text-slate-700">
                        {generateCalendarDays(calendarMonth, calendarYear).map((dayObj, idx) => (
                          <button
                            key={idx}
                            type="button"
                            onClick={() => {
                              if (!dayObj.isCurrentMonth) return;
                              setSelectedCalendarDate(new Date(calendarYear, calendarMonth, dayObj.day));
                            }}
                            className={`py-1.5 rounded ${dayObj.isCurrentMonth ? ((selectedCalendarDate && selectedCalendarDate.getFullYear() === calendarYear && selectedCalendarDate.getMonth() === calendarMonth && selectedCalendarDate.getDate() === dayObj.day) ? 'bg-violet-600 text-white' : dayObj.isToday ? 'bg-violet-100 text-violet-700' : 'hover:bg-slate-100') : 'text-slate-300'}`}
                            disabled={!dayObj.isCurrentMonth}
                          >
                            {dayObj.day}
                          </button>
                        ))}
                      </div>
                    </div>

                    <div className="mt-3">
                      <div className="flex items-center justify-between mb-2">
                        <span className="text-[11px] font-medium text-slate-700">{selectedCalendarDate.toLocaleDateString(undefined, { weekday: 'long', month: 'short', day: 'numeric' })}</span>
                        <button
                          type="button"
                          onClick={() => setIsScheduleCalendarExpanded(false)}
                          className="rounded-md border border-violet-200 bg-violet-50 px-2 py-1 text-[10px] font-medium text-violet-700 hover:bg-violet-100"
                        >
                          View Day
                        </button>
                      </div>
                      <div className="space-y-2">
                        {scheduleAgendaItems.slice(0, 2).map((event) => (
                          <div key={`expanded-${event.id}`} className="rounded-xl border border-[#ececf5] bg-[#fbfbff] px-2.5 py-2">
                            <div className="grid grid-cols-[56px_1fr] gap-2">
                              <div>
                                <div className="text-[10px] font-medium text-slate-700">{event.slot || '10:00 AM'}</div>
                                <div className="text-[10px] text-slate-400">{Math.max(15, Number(event.durationMinutes || 60))}m</div>
                              </div>
                              <div>
                                <div className="text-[11.5px] font-medium text-slate-800 leading-snug">{event.title}</div>
                                <span className="mt-1 inline-flex rounded-full border border-violet-100 bg-violet-50 px-1.5 py-[1px] text-[9px] text-violet-500">{event.category || 'General'}</span>
                              </div>
                            </div>
                          </div>
                        ))}
                      </div>
                    </div>
                    </div>
                  </div>
                )}

                </div>
              </div>
            </div>
          )}

          {shapesModalOpen && (
            <div className="fixed inset-0 z-[1400] flex items-center justify-center bg-slate-900/40 backdrop-blur-sm">
              <div className="w-[420px] rounded-2xl bg-white p-6 shadow-2xl animate-in fade-in zoom-in-95">
                <h2 className="mb-4 text-xl font-bold text-slate-800">Insert Shape</h2>
                <div className="grid grid-cols-2 gap-3 mb-6">
                  {[
                    { type: 'Flowchart', icon: 'M4 4h16v16H4z', label: 'Process Box' },
                    { type: 'Decision', icon: 'M12 2l10 10-10 10L2 12z', label: 'Decision Diamond' },
                    { type: 'Database', icon: 'M12 2C6.48 2 2 4.24 2 7v10c0 2.76 4.48 5 10 5s10-2.24 10-5V7c0-2.76-4.48-5-10-5zm0 8c-4.42 0-8-1.79-8-4s3.58-4 8-4 8 1.79 8 4-3.58 4-8 4z', label: 'Database Storage' },
                    { type: 'Cloud', icon: 'M19.35 10.04C18.67 6.59 15.64 4 12 4 9.11 4 6.6 5.64 5.36 8.04 2.34 8.36 0 10.91 0 14c0 3.31 2.69 6 6 6h13c2.76 0 5-2.24 5-5 0-2.64-2.05-4.78-4.65-4.96z', label: 'Cloud System' }
                  ].map((item) => (
                    <button
                      key={item.type}
                      onClick={() => insertInlineShapeBoxWithType(item.type)}
                      className="flex flex-col items-center gap-2 rounded-xl border border-slate-200 p-4 hover:border-violet-300 hover:bg-violet-50 transition-colors"
                    >
                      <svg viewBox="0 0 24 24" className="h-8 w-8 fill-slate-500" stroke="currentColor" strokeWidth="1"><path d={item.icon}/></svg>
                      <span className="text-xs font-semibold text-slate-700">{item.label}</span>
                    </button>
                  ))}
                </div>
                <div className="flex justify-end gap-3">
                  <button
                    type="button"
                    onClick={() => setShapesModalOpen(false)}
                    className="rounded-lg px-4 py-2 text-sm font-medium text-slate-600 hover:bg-slate-100"
                  >
                    Cancel
                  </button>
                </div>
              </div>
            </div>
          )}

          {pageCoverModalOpen && (
            <div className="fixed inset-0 z-[1400] flex items-center justify-center bg-slate-900/40 backdrop-blur-sm">
              <div className="w-[500px] rounded-2xl bg-white p-6 shadow-2xl animate-in fade-in zoom-in-95">
                <div className="flex items-center justify-between mb-6">
                  <h3 className="text-lg font-semibold text-slate-800 flex items-center gap-2">
                    <BookOpen className="text-indigo-500" size={20} />
                    Insert Page Cover
                  </h3>
                  <button onClick={() => setPageCoverModalOpen(false)} className="text-slate-400 hover:text-slate-600 rounded-full hover:bg-slate-100 p-1">
                    <X size={20} />
                  </button>
                </div>
                <div className="grid grid-cols-2 gap-4 mb-6">
                  {[
                    { id: 'academic', name: 'Academic', desc: 'Formal, centered serif typography' },
                    { id: 'writer', name: 'Writer', desc: 'Creative, elegant, spacious' },
                    { id: 'enterprise', name: 'Enterprise', desc: 'Modern, brand-focused layout' }
                  ].map(template => (
                    <button
                      key={template.id}
                      onClick={() => {
                        const title = docTitle || 'Untitled Document';
                        let coverHtml = '';
                        if (template.id === 'academic') {
                          coverHtml = `<div contenteditable="false" style="min-height: 80vh; display: flex; flex-direction: column; justify-content: center; align-items: center; text-align: center; font-family: 'Times New Roman', serif; padding: 40px; border: 4px double #cbd5e1; margin-bottom: 40px; page-break-after: always;"><h1 style="font-size: 42px; margin-bottom: 20px; color: #1e293b;">${title}</h1><h3 style="font-size: 24px; color: #475569; font-weight: normal;">Author Name</h3><p style="margin-top: 60px; font-style: italic; color: #64748b;">${new Date().toLocaleDateString()}</p></div>`;
                        } else if (template.id === 'writer') {
                          coverHtml = `<div contenteditable="false" style="min-height: 80vh; display: flex; flex-direction: column; justify-content: center; align-items: flex-start; text-align: left; font-family: Georgia, serif; padding: 60px; background-color: #fdfbf7; margin-bottom: 40px; page-break-after: always; border-left: 8px solid #d4a373;"><h1 style="font-size: 48px; margin-bottom: 16px; color: #283618; letter-spacing: -1px;">${title}</h1><div style="width: 60px; height: 4px; background-color: #dda15e; margin-bottom: 30px;"></div><h3 style="font-size: 20px; color: #606c38; font-weight: normal; font-style: italic;">A Novel Approach</h3></div>`;
                        } else if (template.id === 'enterprise') {
                          coverHtml = `<div contenteditable="false" style="min-height: 80vh; display: flex; flex-direction: column; justify-content: space-between; align-items: flex-start; text-align: left; font-family: 'Inter', sans-serif; padding: 60px; background: linear-gradient(135deg, #1e293b 0%, #0f172a 100%); color: white; margin-bottom: 40px; page-break-after: always;"><div style="font-size: 24px; font-weight: bold; color: #38bdf8;">Enterprise Inc.</div><div style="margin-top: auto; margin-bottom: auto;"><h1 style="font-size: 56px; margin-bottom: 20px; font-weight: 800; line-height: 1.1;">${title}</h1><h3 style="font-size: 24px; color: #94a3b8; font-weight: 400;">Q3 Executive Summary</h3></div><div style="width: 100%; border-top: 1px solid #334155; padding-top: 20px; display: flex; justify-content: space-between; color: #64748b; font-size: 14px;"><span>CONFIDENTIAL</span><span>${new Date().toLocaleDateString()}</span></div></div>`;
                        }
                        
                        // Insert at top
                        if (blankBodyRef.current) {
                          blankBodyRef.current.innerHTML = coverHtml + blankBodyRef.current.innerHTML;
                          setDocBodyHtml(blankBodyRef.current.innerHTML);
                        }
                        setPageCoverModalOpen(false);
                        setOpenDropdown(null);
                      }}
                      className="p-4 border border-slate-200 rounded-xl hover:border-indigo-300 hover:bg-indigo-50 transition-colors text-left"
                    >
                      <div className="font-semibold text-slate-800 mb-1">{template.name}</div>
                      <div className="text-xs text-slate-500">{template.desc}</div>
                    </button>
                  ))}
                  <button
                    onClick={() => {
                      const prmpt = prompt("Describe your custom cover page:");
                      if (prmpt) {
                        const boxId = 'cover-' + Date.now();
                        const htmlText = `<div id="${boxId}" class="inline-ai-block ai-block-loading" contenteditable="false" style="min-height:50vh; display:flex; align-items:center; justify-content:center;"><div class="ai-block-shimmer"></div><div class="ai-block-content" style="color:#6b7280;">Generating custom cover...</div></div>`;
                        if (blankBodyRef.current) {
                          blankBodyRef.current.innerHTML = htmlText + blankBodyRef.current.innerHTML;
                          setDocBodyHtml(blankBodyRef.current.innerHTML);
                        }
                        handleAIBlockSubmit(`Generate an inline styled HTML cover page based on: ${prmpt}. Make it min-height 80vh and visually striking.`, 'html', boxId);
                      }
                      setPageCoverModalOpen(false);
                      setOpenDropdown(null);
                    }}
                    className="p-4 border border-violet-200 bg-violet-50 rounded-xl hover:border-violet-400 hover:bg-violet-100 transition-colors text-left flex flex-col justify-center"
                  >
                    <div className="font-semibold text-violet-800 mb-1 flex items-center gap-1"><Sparkles size={14}/> Custom AI Cover</div>
                    <div className="text-xs text-violet-600">Prompt Gemini to design it</div>
                  </button>
                </div>
              </div>
            </div>
          )}
          {chartsModalOpen && (
            <div className="fixed inset-0 z-[1400] flex items-center justify-center bg-slate-900/40 backdrop-blur-sm">
              <div className="w-[420px] rounded-2xl bg-white p-6 shadow-2xl animate-in fade-in zoom-in-95">
                <h2 className="mb-4 text-xl font-bold text-slate-800">Insert Chart</h2>
                <div className="grid grid-cols-2 gap-3 mb-6">
                  {[
                    { type: 'Bar Chart', icon: 'M4 20h16V4H4v16zm2-14h3v12H6V6zm5 4h3v8h-3v-8zm5-7h3v15h-3V3z', label: 'Bar Graph' },
                    { type: 'Line Chart', icon: 'M3 3v18h18M16 8l4-4M10 14l6-6M4 18l6-4', label: 'Line Graph', isStroke: true },
                    { type: 'Pie Chart', icon: 'M12 2C6.48 2 2 6.48 2 12s4.48 10 10 10 10-4.48 10-10S17.52 2 12 2zm-1 3.09C7.61 5.56 5.09 8.08 4.6 11.5h6.4V5.09zM12 20c-4.41 0-8-3.59-8-8h9V4c4.41 0 8 3.59 8 8s-3.59 8-8 8z', label: 'Pie Graph' },
                    { type: 'Scatter Plot', icon: 'M4 4v16h16M8 16a2 2 0 100-4 2 2 0 000 4zm4-6a2 2 0 100-4 2 2 0 000 4zm4 2a2 2 0 100-4 2 2 0 000 4zm4-8a2 2 0 100-4 2 2 0 000 4z', label: 'Scatter Plot', isStroke: true }
                  ].map((item) => (
                    <button
                      key={item.type}
                      onClick={() => insertInlineChartBoxWithType(item.type)}
                      className="flex flex-col items-center gap-2 rounded-xl border border-slate-200 p-4 hover:border-orange-300 hover:bg-orange-50 transition-colors"
                    >
                      <svg viewBox="0 0 24 24" className="h-8 w-8 fill-slate-500" stroke={item.isStroke ? "currentColor" : "none"} strokeWidth={item.isStroke ? "2" : "0"} fill={item.isStroke ? "none" : "currentColor"}><path d={item.icon}/></svg>
                      <span className="text-xs font-semibold text-slate-700">{item.label}</span>
                    </button>
                  ))}
                </div>
                <div className="flex justify-end gap-3">
                  <button
                    type="button"
                    onClick={() => setChartsModalOpen(false)}
                    className="rounded-lg px-4 py-2 text-sm font-medium text-slate-600 hover:bg-slate-100"
                  >
                    Cancel
                  </button>
                </div>
              </div>
            </div>
          )}

          {isScheduleSessionModalOpen && (
            <div
              className="fixed inset-0 z-[1350] bg-black/70 flex items-center justify-center p-4"
              onClick={closeScheduleSessionModal}
            >
              <div
                className="w-[min(90vw,1100px)] h-[min(90vh,860px)] rounded-xl border border-[#ececf7] bg-white shadow-[0_24px_80px_-32px_rgba(15,23,42,0.45)] overflow-hidden flex flex-col"
                onClick={(event) => event.stopPropagation()}
              >
                <div className="h-16 px-5 border-b border-[#ececf5] bg-white flex items-center justify-between">
                  <div>
                    <div className="text-[24px] font-semibold text-slate-900 leading-tight">Schedule a session</div>
                    <div className="text-[11px] text-slate-500 mt-1">Plan ahead and invite others to collaborate.</div>
                  </div>
                  <div className="flex items-center">
                    <button
                      type="button"
                      onClick={handleScheduleSessionSave}
                      className="h-10 px-5 rounded-xl bg-violet-600 text-white text-sm font-semibold hover:bg-violet-700"
                    >
                      Save
                    </button>
                  </div>
                </div>
                <div className="flex-1 grid grid-cols-[2fr_1fr] gap-0 overflow-hidden">
                  <div className="p-5 overflow-hidden">
                    <div className="h-full overflow-y-auto thin-scrollbar rounded-lg border border-[#ececf5] bg-white p-4 flex flex-col">
                      <div className="grid grid-cols-[1fr_1fr_auto_1fr_auto] gap-2 text-[12px]">
                        <div className="relative">
                          <select
                            value={scheduleForm.startDate}
                            onChange={(event) => setScheduleForm((prev) => ({ ...prev, startDate: event.target.value }))}
                            className="brand-select h-9 w-full rounded-lg border border-violet-100 bg-violet-50/30 px-2.5 pr-7 text-slate-700 focus:outline-none focus:border-violet-300"
                          >
                            {!scheduleDateOptions.some((option) => option.value === scheduleForm.startDate) && (
                              <option value={scheduleForm.startDate}>{new Date(`${scheduleForm.startDate}T00:00:00`).toLocaleDateString(undefined, { month: '2-digit', day: '2-digit', year: 'numeric' })}</option>
                            )}
                            {scheduleDateOptions.map((option) => (
                              <option key={option.value} value={option.value}>{option.label}</option>
                            ))}
                          </select>
                          <Calendar size={12} className="pointer-events-none absolute right-2 top-1/2 -translate-y-1/2 text-slate-500" />
                        </div>
                        <div className="relative">
                          <select
                            value={scheduleForm.startTime}
                            onChange={(event) => setScheduleForm((prev) => ({ ...prev, startTime: event.target.value }))}
                            className="brand-select h-9 w-full rounded-lg border border-violet-100 bg-violet-50/30 px-2.5 pr-7 text-slate-700 focus:outline-none focus:border-violet-300"
                          >
                            {scheduleTimeOptions.map((option) => (
                              <option key={`start-${option.value}`} value={option.value}>{option.label}</option>
                            ))}
                          </select>
                          <Clock size={12} className="pointer-events-none absolute right-2 top-1/2 -translate-y-1/2 text-slate-500" />
                        </div>
                        <span className="self-center text-slate-500 text-center">to</span>
                        <div className="relative">
                          <select
                            value={scheduleForm.endTime}
                            onChange={(event) => setScheduleForm((prev) => ({ ...prev, endTime: event.target.value }))}
                            className="brand-select h-9 w-full rounded-lg border border-violet-100 bg-violet-50/30 px-2.5 pr-7 text-slate-700 focus:outline-none focus:border-violet-300"
                          >
                            {scheduleTimeOptions.map((option) => (
                              <option key={`end-${option.value}`} value={option.value}>{option.label}</option>
                            ))}
                          </select>
                          <Clock size={12} className="pointer-events-none absolute right-2 top-1/2 -translate-y-1/2 text-slate-500" />
                        </div>
                        <select
                          value={scheduleForm.timezone}
                          onChange={(event) => setScheduleForm((prev) => ({ ...prev, timezone: event.target.value }))}
                          className="brand-select h-9 rounded-lg border border-violet-100 bg-violet-50/30 px-2.5 pr-7 text-slate-700 focus:outline-none focus:border-violet-300"
                        >
                          {SCHEDULE_TIMEZONE_OPTIONS.map((timezone) => (
                            <option key={timezone} value={timezone}>{timezone}</option>
                          ))}
                        </select>
                      </div>

                      <div className="mt-3">
                        <label className="text-[11px] font-semibold text-slate-600">Title</label>
                        <div className="mt-1 h-10 rounded-lg border border-[#e8eaf2] bg-white px-3 flex items-center justify-between">
                          <input
                            value={scheduleForm.title}
                            onChange={(event) => setScheduleForm((prev) => ({ ...prev, title: event.target.value.slice(0, 200) }))}
                            className="w-full bg-transparent text-[14px] text-slate-800 focus:outline-none"
                          />
                          <span className="text-[11px] text-slate-400">{scheduleForm.title.length}/200</span>
                        </div>
                      </div>

                      <div className="mt-3">
                        <label className="text-[11px] font-semibold text-slate-600">Room link</label>
                        <div className="mt-1 h-10 rounded-lg border border-[#e8eaf2] bg-[#f8f9fd] px-3 flex items-center justify-between">
                          <input
                            value={scheduleForm.roomLink}
                            onChange={(event) => setScheduleForm((prev) => ({ ...prev, roomLink: event.target.value }))}
                            className="w-full bg-transparent text-[12px] text-slate-600 focus:outline-none"
                          />
                          <div className="flex items-center gap-2 text-slate-400">
                            <button
                              type="button"
                              onClick={() => {
                                if (scheduleForm.roomLink) {
                                  navigator.clipboard?.writeText(scheduleForm.roomLink);
                                  showToast('Room link copied');
                                }
                              }}
                            >
                              <File size={14} />
                            </button>
                            <button type="button" onClick={() => showToast('Room link settings opened')}>
                              <Settings size={14} />
                            </button>
                          </div>
                        </div>
                      </div>

                      <div className="mt-3">
                        <label className="text-[11px] font-semibold text-slate-600">Description (optional)</label>
                        <div className="mt-1 rounded-lg border border-[#e8eaf2] bg-white min-h-[150px] flex flex-col">
                          <textarea
                            ref={scheduleInputRef}
                            value={scheduleInput}
                            onChange={(e) => setScheduleInput(e.target.value)}
                            onPaste={handleSchedulePaste}
                            placeholder="Strategic review of distribution moat, go-to-market plan, and launch milestones."
                            className="w-full min-h-[110px] resize-y rounded-t-lg px-3 py-2 text-[12px] leading-5 text-slate-700 focus:outline-none"
                          />
                          <div className="h-9 border-t border-[#ececf5] px-3 flex items-center gap-3 text-slate-500">
                            <Bold size={13} />
                            <Italic size={13} />
                            <Underline size={13} />
                            <List size={13} />
                            <Link size={13} />
                          </div>
                        </div>
                      </div>

                      <div className="mt-3 grid grid-cols-2 gap-3">
                        <div className="space-y-2">
                          <select
                            value={scheduleForm.notification}
                            onChange={(event) => setScheduleForm((prev) => ({ ...prev, notification: event.target.value }))}
                            className="brand-select h-10 w-full rounded-lg border border-violet-100 bg-violet-50/30 px-3 text-[12px] text-slate-700 focus:outline-none focus:border-violet-300"
                          >
                            {SCHEDULE_NOTIFICATION_OPTIONS.map((option) => (
                              <option key={option} value={option}>{`Notification - ${option}`}</option>
                            ))}
                          </select>
                          <select
                            value={scheduleForm.addToCalendar}
                            onChange={(event) => setScheduleForm((prev) => ({ ...prev, addToCalendar: event.target.value }))}
                            className="brand-select h-10 w-full rounded-lg border border-violet-100 bg-violet-50/30 px-3 text-[12px] text-slate-700 focus:outline-none focus:border-violet-300"
                          >
                            <option value="Joshua's Calendar">Add to calendar - Joshua&apos;s Calendar</option>
                            <option value="Team Calendar">Add to calendar - Team Calendar</option>
                          </select>
                          <select
                            value={scheduleForm.repeat}
                            onChange={(event) => setScheduleForm((prev) => ({ ...prev, repeat: event.target.value }))}
                            className="brand-select h-10 w-full rounded-lg border border-violet-100 bg-violet-50/30 px-3 text-[12px] text-slate-700 focus:outline-none focus:border-violet-300"
                          >
                            {SCHEDULE_REPEAT_OPTIONS.map((option) => (
                              <option key={option} value={option}>{`Repeat - ${option}`}</option>
                            ))}
                          </select>
                        </div>
                        <div className="space-y-2">
                          <select
                            value={scheduleForm.whoCanJoin}
                            onChange={(event) => setScheduleForm((prev) => ({ ...prev, whoCanJoin: event.target.value }))}
                            className="brand-select h-10 w-full rounded-lg border border-violet-100 bg-violet-50/30 px-3 text-[12px] text-slate-700 focus:outline-none focus:border-violet-300"
                          >
                            {SCHEDULE_JOIN_OPTIONS.map((option) => (
                              <option key={option} value={option}>{`Who can join - ${option}`}</option>
                            ))}
                          </select>
                          <div className="h-10 rounded-lg border border-[#e8eaf2] px-3 flex items-center justify-between text-[12px] text-slate-700">
                            <span>Allow recording</span>
                            <button
                              type="button"
                              onClick={() => setScheduleForm((prev) => ({ ...prev, allowRecording: !prev.allowRecording }))}
                              className={`w-9 h-5 rounded-full relative transition-colors ${scheduleForm.allowRecording ? 'bg-violet-600' : 'bg-slate-300'}`}
                            >
                              <span className={`absolute top-0.5 w-4 h-4 rounded-full bg-white transition-all ${scheduleForm.allowRecording ? 'right-0.5' : 'left-0.5'}`} />
                            </button>
                          </div>
                        </div>
                      </div>
                    </div>
                  </div>
                  <div className="border-l border-[#ececf5] p-5 overflow-hidden">
                    <div className="h-full overflow-y-auto thin-scrollbar flex flex-col gap-3 pr-1">
                      <div className="rounded-lg border border-[#ececf5] bg-white p-3">
                        <div className="flex items-center justify-between mb-2">
                          <div className="text-[14px] font-semibold text-slate-900">Participants</div>
                          <div className="relative" ref={schedulePeopleMenuRef}>
                            <button
                              className="text-[12px] text-violet-600 font-semibold"
                              type="button"
                              onClick={() => setIsSchedulePeopleMenuOpen((prev) => !prev)}
                            >
                              + Add people
                            </button>
                            {isSchedulePeopleMenuOpen && (
                              <div className="absolute right-0 top-full z-10 mt-1 w-52 rounded-lg border border-[#e6e8f1] bg-white p-1 shadow-[0_12px_28px_-20px_rgba(15,23,42,0.45)]">
                                {platformContacts
                                  .filter((person) => !scheduleParticipants.some((participant) => participant.name === person.name))
                                  .map((person) => (
                                    <button
                                      key={`participant-option-${person.id}`}
                                      type="button"
                                      onClick={() => {
                                        setScheduleParticipants((prev) => [
                                          ...prev,
                                          { id: `contact-${person.id}`, name: person.name, img: `https://i.pravatar.cc/80?u=${person.id}` },
                                        ]);
                                        setIsSchedulePeopleMenuOpen(false);
                                      }}
                                      className="w-full rounded-md px-2.5 py-1.5 text-left text-[11px] text-slate-700 hover:bg-violet-50"
                                    >
                                      <div className="font-medium">{person.name}</div>
                                      <div className="text-[10px] text-slate-500">{person.title}</div>
                                    </button>
                                  ))}
                                {platformContacts.filter((person) => !scheduleParticipants.some((participant) => participant.name === person.name)).length === 0 && (
                                  <div className="px-2.5 py-2 text-[11px] text-slate-500">No more contacts to add.</div>
                                )}
                              </div>
                            )}
                          </div>
                        </div>
                        <div className="space-y-2">
                          {scheduleParticipants.map((participant) => (
                            <div key={`modal-participant-${participant.name}`} className="h-10 rounded-lg border border-[#ececf5] px-2.5 flex items-center justify-between">
                              <div className="flex items-center gap-2 min-w-0">
                                <img src={participant.img} alt={participant.name} className="w-6 h-6 rounded-full object-cover" />
                                <span className="text-[12px] text-slate-700 truncate">{participant.name}</span>
                              </div>
                              <button
                                type="button"
                                onClick={() => setScheduleParticipants((prev) => prev.filter((person) => person.id !== participant.id))}
                              >
                                <X size={13} className="text-slate-400" />
                              </button>
                            </div>
                          ))}
                        </div>
                      </div>

                      <div className="rounded-lg border border-[#ececf5] bg-white p-3">
                        <div className="text-[14px] font-semibold text-slate-900 mb-2">Options</div>
                        <div className="space-y-2 text-[12px] text-slate-700">
                          <label className="flex items-start gap-2"><input type="checkbox" checked={scheduleOptionsState.aiNotes} onChange={(event) => setScheduleOptionsState((prev) => ({ ...prev, aiNotes: event.target.checked }))} className="mt-0.5 accent-violet-600" /><span>Enable AI notes &amp; summary</span></label>
                          <label className="flex items-start gap-2"><input type="checkbox" checked={scheduleOptionsState.screenSharing} onChange={(event) => setScheduleOptionsState((prev) => ({ ...prev, screenSharing: event.target.checked }))} className="mt-0.5 accent-violet-600" /><span>Allow screen sharing</span></label>
                          <label className="flex items-start gap-2"><input type="checkbox" checked={scheduleOptionsState.whiteboard} onChange={(event) => setScheduleOptionsState((prev) => ({ ...prev, whiteboard: event.target.checked }))} className="mt-0.5 accent-violet-600" /><span>Allow whiteboard</span></label>
                          <label className="flex items-start gap-2"><input type="checkbox" checked={scheduleOptionsState.waitingRoom} onChange={(event) => setScheduleOptionsState((prev) => ({ ...prev, waitingRoom: event.target.checked }))} className="mt-0.5 accent-violet-600" /><span>Enable waiting room</span></label>
                        </div>
                      </div>

                      <div className="rounded-lg border border-violet-100 bg-violet-50/50 p-3 mt-auto">
                        <div className="text-[14px] font-semibold text-slate-900">AI Assistant <span className="text-[10px] text-violet-600 font-semibold ml-1">BETA</span></div>
                        <div className="text-[12px] text-slate-600 mt-1">I can help prepare for this session.</div>
                        <div className="mt-2 text-[12px] text-violet-700 space-y-1">
                          <div>- Create an agenda</div>
                          <div>- Add discussion topics</div>
                          <div>- Share relevant docs</div>
                        </div>
                        <button
                          type="button"
                          onClick={() => {
                            setRightSidebarOpen(true);
                            setActiveRightTab('assistant');
                            setAssistantQuickPrompt('Generate agenda');
                          }}
                          className="mt-3 h-9 px-3 rounded-lg border border-violet-200 bg-white text-violet-700 text-[12px] font-medium hover:bg-violet-50"
                        >
                          Generate agenda
                        </button>
                      </div>
                    </div>
                  </div>
                </div>
              </div>
            </div>
          )}

          {/* REGAARDER ROOM TAB */}
          {activeRightTab === 'room' && (
            <div className="flex-1 flex flex-col min-h-0 bg-white animate-fade-in min-w-[340px] relative">

              {/* STATE: LOBBY */}
              {roomState === 'lobby' && (
                <div className="flex-1 min-h-0 bg-[#f7f8fd] animate-fade-in flex flex-col relative">
                  <div className="h-12 px-4 border-b border-gray-200 bg-white flex items-center justify-between">
                    <div className="flex items-center gap-2 text-slate-900">
                      <span className="w-5 h-5 rounded-md bg-violet-100 text-violet-600 flex items-center justify-center">
                        <MonitorPlay size={12} />
                      </span>
                      <span className="text-[16px] font-semibold leading-none">Room</span>
                    </div>
                    <div className="flex items-center gap-2">
                      <button
                        type="button"
                        title={rightPanelMaximized ? 'Restore panel' : 'Expand panel'}
                        onClick={() => { setRightPanelMaximized((p) => !p); if (!rightSidebarOpen) setRightSidebarOpen(true); }}
                        className="p-1 rounded-md text-slate-400 hover:text-slate-600 hover:bg-slate-100"
                      >
                        {rightPanelMaximized ? <Minimize2 size={14} /> : <Maximize2 size={14} />}
                      </button>
                      <button
                        type="button"
                        onClick={() => { setRightSidebarOpen(false); setRightPanelMaximized(false); }}
                        className="p-1 rounded-md text-slate-400 hover:text-slate-600 hover:bg-slate-100"
                        aria-label="Close Room panel"
                      >
                        <X size={14} />
                      </button>
                    </div>
                  </div>

                  <div className="flex-1 overflow-y-auto thin-scrollbar px-3 py-3 space-y-3">
                    <div className="rounded-2xl border border-[#eceef7] bg-white px-4 py-5 text-center">
                      <h3 className="text-[12px] font-semibold text-[#1a1f36] tracking-tight">No active sharing</h3>
                      <p className="text-[11px] text-[#6b7280] mt-1.5">Start a call or invite others to collaborate.</p>
                      <div className="mt-4 w-[110px] h-[110px] rounded-full border border-dashed border-violet-200 mx-auto flex items-center justify-center">
                        <div className="w-14 h-14 rounded-2xl bg-violet-50 border border-violet-200 text-violet-500 flex items-center justify-center">
                          <MonitorPlay size={24} />
                        </div>
                      </div>
                      <div className="mt-4 space-y-2 text-left">
                        <div className="grid grid-cols-2 gap-2">
                          <div className="relative">
                            <button
                              type="button"
                              onClick={() => setIsRoomStartMenuOpen((prev) => !prev)}
                              className="w-full rounded-xl border border-violet-200 bg-violet-50 text-violet-700 py-2 px-1 text-[10px] font-semibold inline-flex items-center justify-center gap-1 whitespace-nowrap leading-none hover:bg-violet-100"
                            >
                              <Plus size={13} /> Start room <ChevronDown size={11} />
                            </button>
                            {isRoomStartMenuOpen && (
                              <div className="absolute z-30 left-0 mt-1 w-[220px] rounded-xl border border-gray-200 bg-white shadow-[0_18px_40px_-20px_rgba(15,23,42,0.45)] p-2 text-left">
                                <div className="text-[9px] uppercase tracking-wide text-gray-400 font-semibold px-2 py-1">Quick start</div>
                                <button
                                  type="button"
                                  onClick={() => {
                                    setIsRoomStartMenuOpen(false);
                                    startMeetingNow(generateRoomCode());
                                  }}
                                  className="w-full rounded-lg px-2 py-1.5 hover:bg-violet-50 inline-flex items-start gap-2.5"
                                >
                                  <Sparkles size={12} className="text-violet-500 mt-0.5 shrink-0" />
                                  <div className="min-w-0 text-left">
                                    <div className="text-[10px] font-semibold leading-none text-slate-800">Start instant room</div>
                                    <div className="mt-1 text-[9px] leading-tight text-slate-500">Start collaborating immediately</div>
                                  </div>
                                </button>
                                <button
                                  type="button"
                                  onClick={() => {
                                    setIsRoomStartMenuOpen(false);
                                    setIsScheduleSessionModalOpen(true);
                                  }}
                                  className="w-full rounded-lg px-2 py-1.5 hover:bg-violet-50 inline-flex items-start gap-2.5"
                                >
                                  <Calendar size={12} className="text-slate-500 mt-0.5 shrink-0" />
                                  <div className="min-w-0 text-left">
                                    <div className="text-[10px] font-semibold leading-none text-slate-800">Schedule session</div>
                                    <div className="mt-1 text-[9px] leading-tight text-slate-500">Plan with Google Calendar</div>
                                  </div>
                                </button>
                                <button
                                  type="button"
                                  onClick={() => {
                                    setIsRoomStartMenuOpen(false);
                                    roomJoinInputRef.current?.focus();
                                  }}
                                  className="w-full rounded-lg px-2 py-1.5 hover:bg-violet-50 inline-flex items-start gap-2.5"
                                >
                                  <LinkIcon size={12} className="text-slate-500 mt-0.5 shrink-0" />
                                  <div className="min-w-0 text-left">
                                    <div className="text-[10px] font-semibold leading-none text-slate-800">Join with code or link</div>
                                    <div className="mt-1 text-[9px] leading-tight text-slate-500">Enter a code to join instantly</div>
                                  </div>
                                </button>
                              </div>
                            )}
                          </div>
                          <button
                            onClick={() => {
                              setIsRoomInviteModalOpen(true);
                              setIsRoomStartMenuOpen(false);
                            }}
                            className="rounded-xl border border-gray-200 bg-white text-slate-700 py-2 px-1 text-[10px] font-semibold inline-flex items-center justify-center gap-1 whitespace-nowrap leading-none hover:bg-slate-50"
                          >
                            <UserPlus size={12} /> Invite people
                          </button>
                        </div>

                        <input
                          ref={roomJoinInputRef}
                          type="text"
                          value={joinCode}
                          onChange={(e) => setJoinCode(e.target.value)}
                          onFocus={() => setIsRoomStartMenuOpen(false)}
                          placeholder="Join with code"
                          className="w-full rounded-xl border border-gray-200 bg-white py-2 px-3 text-[10px] text-slate-700 placeholder:text-slate-400 focus:outline-none focus:border-violet-300"
                        />
                        <button
                          onClick={() => {
                            if (joinCode.trim()) {
                              openMeetingSetup(joinCode.trim());
                            } else {
                              showToast('Please enter a room code');
                            }
                          }}
                          className="w-full rounded-xl border border-gray-200 bg-white text-slate-700 py-2 px-1 text-[10px] font-semibold inline-flex items-center justify-center gap-1 whitespace-nowrap leading-none hover:bg-slate-50"
                        >
                          <LinkIcon size={12} /> Join
                        </button>
                      </div>
                    </div>

                    <div className="rounded-2xl border border-[#eceef7] bg-white px-4 py-3 text-left">
                      <div className="flex items-center justify-between mb-2.5">
                        <span className="text-[12px] font-semibold text-[#23283b] tracking-tight">Upcoming</span>
                        <button type="button" className="text-[10px] font-semibold text-violet-600 hover:text-violet-700">View calendar</button>
                      </div>
                      {upcomingEvents.slice(0, 1).map((event) => {
                        const eventDate = event?.dueDate ? new Date(event.dueDate) : null;
                        const hasDate = eventDate && !Number.isNaN(eventDate.getTime());
                        const dateLabel = hasDate
                          ? eventDate.toLocaleDateString(undefined, { month: 'short', day: 'numeric' })
                          : 'Upcoming';
                        return (
                          <button
                            key={`room-upcoming-${event.id}`}
                            onClick={() => openMeetingSetup(normalizeRoomCode(event.title) || generateRoomCode())}
                            className="w-full rounded-xl border border-gray-200 bg-white p-3 hover:border-violet-200 hover:bg-violet-50/20 transition-colors text-left"
                          >
                            <div className="flex items-start gap-2.5">
                              <div className="w-7 h-7 rounded-lg bg-violet-50 text-violet-600 flex items-center justify-center shrink-0">
                                <Calendar size={14} />
                              </div>
                              <div className="min-w-0 flex-1">
                                <div className="text-[12px] font-semibold text-slate-800">{dateLabel}</div>
                                <div className="text-[10px] font-semibold text-slate-900 mt-1 leading-tight">{event.title}</div>
                                <div className="text-[10px] text-slate-500 mt-1">{event.slotLabel || `${scheduleForm.startDate} - ${event.slot || scheduleForm.startTime}`}</div>
                                <div className="mt-2 flex items-center justify-between">
                                  <div className="flex items-center -space-x-1.5">
                                    {meetingParticipants.slice(0, 3).map((participant) => (
                                      <img key={`upcoming-${event.id}-${participant.name}`} src={participant.img} alt={participant.name} className="w-5 h-5 rounded-full border border-white object-cover" />
                                    ))}
                                    <span className="ml-2 text-[10px] font-semibold text-slate-500">+{Math.max(1, (event.participants || []).length)}</span>
                                  </div>
                                  <span className="px-2 py-1 rounded-lg border border-violet-200 text-violet-600 text-[10px] font-semibold">Join</span>
                                </div>
                              </div>
                            </div>
                          </button>
                        );
                      })}
                      {upcomingEvents.length === 0 && (
                        <div className="rounded-xl border border-dashed border-gray-200 bg-white p-3 text-[11px] text-slate-500">
                          No upcoming meetings yet. Use Schedule session to add one.
                        </div>
                      )}
                    </div>

                    <div className="rounded-2xl border border-[#eceef7] bg-white px-4 py-3 text-left">
                      <div className="flex items-center justify-between mb-2.5">
                        <span className="text-[12px] font-semibold text-[#23283b] tracking-tight">Recent rooms</span>
                        <button type="button" className="text-[10px] font-semibold text-violet-600 hover:text-violet-700">See all</button>
                      </div>
                      <div className="space-y-1">
                        <button onClick={() => openMeetingSetup('q2-launch')} className="w-full flex items-center justify-between gap-2 p-2.5 rounded-xl hover:bg-violet-50/30 transition-colors text-left">
                          <div className="flex items-center gap-2.5 min-w-0">
                            <div className="w-6 h-6 rounded-md bg-violet-50 text-violet-600 flex items-center justify-center shrink-0"><Clock size={13} /></div>
                            <div className="min-w-0">
                              <div className="text-[10px] font-semibold text-slate-800 truncate">Q2 Launch Strategy</div>
                              <div className="text-[10px] text-slate-500">Active yesterday</div>
                            </div>
                          </div>
                          <div className="flex items-center -space-x-1.5">
                            {meetingParticipants.slice(0, 3).map((participant) => (
                              <img key={`recent-a-${participant.name}`} src={participant.img} alt={participant.name} className="w-5 h-5 rounded-full border border-white object-cover" />
                            ))}
                            <span className="ml-2 text-[10px] font-semibold text-slate-500">+3</span>
                          </div>
                        </button>
                        <button onClick={() => openMeetingSetup('product-hunt-planning')} className="w-full flex items-center justify-between gap-2 p-2.5 rounded-xl hover:bg-violet-50/30 transition-colors text-left">
                          <div className="flex items-center gap-2.5 min-w-0">
                            <div className="w-6 h-6 rounded-md bg-violet-50 text-violet-600 flex items-center justify-center shrink-0"><Clock size={13} /></div>
                            <div className="min-w-0">
                              <div className="text-[10px] font-semibold text-slate-800 truncate">Product Hunt Planning</div>
                              <div className="text-[10px] text-slate-500">Active May 12</div>
                            </div>
                          </div>
                          <div className="flex items-center -space-x-1.5">
                            {meetingParticipants.slice(1, 3).map((participant) => (
                              <img key={`recent-b-${participant.name}`} src={participant.img} alt={participant.name} className="w-5 h-5 rounded-full border border-white object-cover" />
                            ))}
                            <span className="ml-2 text-[10px] font-semibold text-slate-500">+2</span>
                          </div>
                        </button>
                        <button onClick={() => openMeetingSetup('design-review-room')} className="w-full flex items-center justify-between gap-2 p-2.5 rounded-xl hover:bg-violet-50/30 transition-colors text-left">
                          <div className="flex items-center gap-2.5 min-w-0">
                            <div className="w-6 h-6 rounded-md bg-violet-50 text-violet-600 flex items-center justify-center shrink-0"><Clock size={13} /></div>
                            <div className="min-w-0">
                              <div className="text-[10px] font-semibold text-slate-800 truncate">Design Review Room</div>
                              <div className="text-[10px] text-slate-500">Active May 8</div>
                            </div>
                          </div>
                          <div className="flex items-center -space-x-1.5">
                            {meetingParticipants.slice(0, 3).map((participant) => (
                              <img key={`recent-c-${participant.name}`} src={participant.img} alt={participant.name} className="w-5 h-5 rounded-full border border-white object-cover" />
                            ))}
                            <span className="ml-2 text-[10px] font-semibold text-slate-500">+4</span>
                          </div>
                        </button>
                      </div>
                    </div>

                    <div className="rounded-2xl border border-violet-100 bg-[#f6f2ff] px-4 py-3 text-left flex items-start justify-between gap-3">
                      <div>
                        <div className="flex items-center gap-2">
                          <span className="text-[12px] font-semibold text-[#1f2537]">AI Assistant</span>
                          <span className="px-1.5 py-0.5 rounded-full bg-violet-200 text-violet-700 text-[9px] font-semibold">BETA</span>
                        </div>
                        <p className="text-[10px] text-slate-600 mt-2">I can capture key points, decisions, and action items during your call.</p>
                        <button type="button" className="mt-3 text-[10px] font-semibold text-violet-600 hover:text-violet-700 inline-flex items-center gap-1">
                          View how it works <ArrowRight size={12} />
                        </button>
                      </div>
                      <div className="w-10 h-10 rounded-xl bg-white/70 border border-violet-200 text-violet-500 flex items-center justify-center shrink-0">
                        <Sparkles size={16} />
                      </div>
                    </div>
                  </div>
                </div>
              )}
              {roomState === 'lobby' && isRoomInviteModalOpen && (
                <div className="absolute z-40 top-[182px] left-4 right-4 flex justify-center">
                  <div className="w-full max-w-[280px] rounded-2xl border border-gray-200 bg-white shadow-[0_24px_48px_-24px_rgba(15,23,42,0.5)] p-3">
                    <div className="flex items-center justify-between mb-2">
                      <div className="text-[10px] font-semibold text-slate-900">People in the room</div>
                      <button type="button" className="text-[10px] font-semibold text-violet-600 hover:text-violet-700">View all</button>
                    </div>
                    <div className="space-y-2.5">
                      <div className="flex items-center justify-between">
                        <div className="flex items-center gap-2">
                          <img src={meetingParticipants[0]?.img} alt="You" className="w-6 h-6 rounded-full object-cover border border-white" />
                          <div>
                            <div className="text-[10px] font-semibold text-slate-800">You (Joshua)</div>
                          </div>
                        </div>
                        <Mic size={12} className="text-violet-500" />
                      </div>
                      {meetingParticipants.slice(1).map((participant, index) => (
                        <div key={`invite-${participant.name}`} className="flex items-center justify-between">
                          <div className="flex items-center gap-2">
                            <img src={participant.img} alt={participant.name} className="w-6 h-6 rounded-full object-cover border border-white" />
                            <div>
                              <div className="text-[10px] font-semibold text-slate-800">{participant.name}</div>
                              <div className="text-[9px] text-slate-400">{index === 0 ? '1m ago' : 'Active'}</div>
                            </div>
                          </div>
                        </div>
                      ))}
                    </div>
                    <button
                      type="button"
                      onClick={async () => {
                        await handleShareMeeting();
                        setIsRoomInviteModalOpen(false);
                      }}
                      className="mt-3 w-full rounded-lg border border-violet-200 bg-violet-50 text-violet-700 text-[10px] font-semibold py-2 inline-flex items-center justify-center gap-1.5 hover:bg-violet-100"
                    >
                      <Sparkles size={12} /> Invite from team
                    </button>
                    <button
                      type="button"
                      onClick={() => setIsRoomInviteModalOpen(false)}
                      className="mt-2 w-full rounded-lg border border-gray-200 bg-white text-slate-600 text-[10px] font-semibold py-2 hover:bg-slate-50"
                    >
                      Close
                    </button>
                  </div>
                </div>
              )}

              {roomState === 'ready' && (
                <div className="flex-1 flex flex-col p-4 gap-4 animate-fade-in">
                  <div className="rounded-2xl border border-gray-200 bg-white p-3 flex items-center justify-between gap-3">
                    <div className="min-w-0">
                      <div className="text-[10px] font-semibold uppercase tracking-wide text-violet-600">Ready to join</div>
                      <div className="text-xs text-gray-700 font-mono truncate">{roomId}</div>
                    </div>
                    <button
                      onClick={handleShareMeeting}
                      className="px-2.5 py-1.5 rounded-lg text-xs border border-violet-200 text-violet-700 hover:bg-violet-50"
                    >
                      Share Link
                    </button>
                  </div>

                  {mediaError && (
                    <div className="bg-amber-50 border border-amber-200 rounded-xl p-3 text-xs text-amber-800 flex items-center justify-between gap-3">
                      <span>Camera or microphone access is blocked. Allow permissions to join with media.</span>
                      <button onClick={requestMediaPermissions} className="shrink-0 px-2.5 py-1.5 rounded-lg bg-amber-100 hover:bg-amber-200 text-amber-900 font-semibold">Allow</button>
                    </div>
                  )}

                  <div className="rounded-2xl overflow-hidden border border-gray-200 bg-slate-900 h-[220px] relative">
                    <RoomStageFeed stream={localStream} placeholder="Camera preview" />
                    <div className="absolute bottom-3 left-3 px-2 py-1 rounded-lg bg-black/45 text-white text-[11px]">You</div>
                  </div>

                  <div className="rounded-2xl border border-gray-200 bg-white p-3">
                    <div className="text-[11px] font-semibold uppercase tracking-wide text-gray-500 mb-2">Participants</div>
                    <div className="flex items-center gap-2 overflow-x-auto no-scrollbar">
                      <div className="relative w-14 h-14 rounded-[10px] overflow-hidden border border-violet-200 shadow-sm flex-shrink-0 bg-gray-900">
                        <LocalVideoFeed stream={localStream} isCameraOn={isRoomCameraOn} />
                        {!isRoomMicOn && <div className="absolute bottom-1 right-1 bg-black/60 p-0.5 rounded-full"><MicOff size={8} className="text-red-400" /></div>}
                      </div>
                      {meetingParticipants.map((participant) => (
                        <div key={participant.name} className="relative w-14 h-14 rounded-[10px] overflow-hidden border border-gray-200 shadow-sm flex-shrink-0">
                          <img src={participant.img} alt={participant.name} className="object-cover w-full h-full" />
                        </div>
                      ))}
                    </div>
                  </div>

                  <div className="mt-auto rounded-2xl border border-gray-200 bg-white/90 backdrop-blur-xl px-3 py-2 flex items-center justify-between gap-2">
                    <div className="flex items-center gap-1.5">
                      <button onClick={toggleRoomMic} className={`p-2 rounded-xl transition-all ${isRoomMicOn ? 'bg-white text-gray-700 hover:bg-gray-100 shadow-sm border border-gray-100' : 'bg-red-50 text-red-600 border border-red-100'}`} title="Toggle microphone">
                        {isRoomMicOn ? <Mic size={16} /> : <MicOff size={16} />}
                      </button>
                      <button onClick={toggleRoomCamera} className={`p-2 rounded-xl transition-all ${isRoomCameraOn ? 'bg-white text-gray-700 hover:bg-gray-100 shadow-sm border border-gray-100' : 'bg-red-50 text-red-600 border border-red-100'}`} title="Toggle camera">
                        {isRoomCameraOn ? <Video size={16} /> : <VideoOff size={16} />}
                      </button>
                      <button onClick={toggleScreenShare} className={`p-2 rounded-xl transition-all ${isScreenSharing ? 'bg-emerald-500 text-white' : 'bg-white text-gray-700 hover:bg-gray-100 shadow-sm border border-gray-100'}`} title="Toggle screen share">
                        <MonitorPlay size={16} />
                      </button>
                    </div>
                    <div className="flex items-center gap-2">
                      <button
                        onClick={() => setRoomState('lobby')}
                        className="px-2.5 py-1.5 rounded-lg text-[11px] border border-gray-200 text-gray-700 hover:bg-gray-50"
                      >
                        Cancel
                      </button>
                      <button
                        onClick={startMeetingNow}
                        className="px-3 py-1.5 rounded-lg text-[11px] font-semibold bg-violet-600 text-white hover:bg-violet-700"
                      >
                        Join Now
                      </button>
                    </div>
                  </div>
                </div>
              )}

              {/* STATE: ACTIVE ROOM (Sidebar Panel View) */}
              {roomState === 'active' && (
                <div className="flex-1 flex flex-col h-full animate-fade-in relative">

                  {mediaError && (
                    <div className="mx-4 mt-4 mb-1 bg-amber-50 border border-amber-200 rounded-xl p-3 text-xs text-amber-800 flex items-center justify-between gap-3">
                      <span>Camera and microphone are blocked. Allow permissions to fully join.</span>
                      <button onClick={requestMediaPermissions} className="shrink-0 px-2.5 py-1.5 rounded-lg bg-amber-100 hover:bg-amber-200 text-amber-900 font-semibold">Allow</button>
                    </div>
                  )}

                  <div className="mx-4 mt-4 rounded-xl border border-gray-200 bg-white px-3 py-2 flex items-center gap-2">
                    <span className="text-[10px] font-semibold uppercase tracking-wide text-emerald-600">Live</span>
                    <span className="text-xs text-gray-600 font-mono">{meetingDurationLabel}</span>
                    <div className="w-px h-4 bg-gray-200"></div>
                    <input
                      value={collaboratorInvite}
                      onChange={(e) => setCollaboratorInvite(e.target.value)}
                      placeholder="Invite collaborator"
                      className="flex-1 min-w-0 text-xs text-gray-700 border-none focus:outline-none"
                    />
                    <button onClick={inviteCollaborator} className="px-2 py-1 text-[11px] rounded bg-violet-600 text-white hover:bg-violet-700">Invite</button>
                    <button onClick={handleCopyLink} className="px-2 py-1 text-[11px] rounded border border-gray-200 text-gray-700 hover:bg-gray-50">Copy Link</button>
                  </div>

                  {mainView === 'document' && (
                    <div className="flex flex-col border-b border-gray-100 bg-white">
                      <div className="p-3 pb-2 flex justify-between items-center">
                        <div>
                          <div className="text-xs font-bold text-gray-900 truncate">Q2 Launch Strategy</div>
                          <div className="text-[10px] text-gray-400 font-mono mt-0.5">{roomId}</div>
                        </div>
                        <button onClick={() => { setMainView('room'); setRoomPanelMode('expanded'); }} className="p-1.5 bg-violet-50 text-violet-600 rounded hover:bg-violet-100 transition-colors" title="Expand to Main View">
                          <Maximize2 size={14} />
                        </button>
                      </div>
                      <div className="flex items-center gap-2 px-3 pb-3 overflow-x-auto no-scrollbar shrink-0">
                        <div className="relative w-14 h-14 rounded-[10px] overflow-hidden border border-gray-200 shadow-sm flex-shrink-0 bg-gray-900">
                          <LocalVideoFeed stream={localStream} isCameraOn={isRoomCameraOn} />
                          {!isRoomMicOn && <div className="absolute bottom-1 right-1 bg-black/60 p-0.5 rounded-full"><MicOff size={8} className="text-red-400" /></div>}
                        </div>
                        <div className="relative w-14 h-14 rounded-[10px] overflow-hidden ring-2 ring-emerald-500 shadow-sm flex-shrink-0">
                          <img src="https://images.unsplash.com/photo-1534528741775-53994a69daeb?auto=format&fit=crop&w=100&q=80" alt="Sarah" className="object-cover w-full h-full" />
                        </div>
                        <div className="relative w-14 h-14 rounded-[10px] overflow-hidden border border-gray-200 shadow-sm flex-shrink-0">
                          <img src="https://images.unsplash.com/photo-1500648767791-00dcc994a43e?auto=format&fit=crop&w=100&q=80" alt="Mike" className="object-cover w-full h-full grayscale-[20%]" />
                        </div>
                      </div>
                    </div>
                  )}

                  <div className="flex-1 overflow-y-auto pb-24 space-y-5 px-4 pt-4 relative z-0">

                    {mainView === 'room' && (
                      <div className="bg-violet-50 text-violet-700 text-xs px-3 py-2 rounded-lg flex items-center justify-between border border-violet-100 mb-2">
                        <span>Room is expanded</span>
                        <Maximize2 size={12} className="opacity-50" />
                      </div>
                    )}

                    <div className="space-y-2">
                      <div className="flex items-center gap-1.5 text-[10px] font-bold text-violet-600 uppercase tracking-wider">
                        <Sparkles size={10} /> Live Context
                      </div>
                      <div className="bg-white border border-gray-100 rounded-xl p-3 text-xs text-gray-700 leading-relaxed shadow-sm">
                        Discussing the Q2 launch timelines. Sarah is presenting the new branding assets for final review before deployment.
                      </div>
                    </div>

                    <div className="space-y-2">
                      <div className="text-[10px] font-bold text-gray-400 uppercase tracking-wider">Decisions</div>
                      <div className="bg-white border border-gray-100 rounded-xl p-2.5 shadow-sm flex items-start gap-2.5 hover:border-violet-200 transition-colors cursor-default">
                        <div className="mt-0.5 bg-emerald-100 p-0.5 rounded text-emerald-600"><Check size={10} strokeWidth={3} /></div>
                        <span className="text-xs text-gray-700">Beta launch officially locked for May 15th.</span>
                      </div>
                    </div>

                    <div className="space-y-2">
                      <div className="text-[10px] font-bold text-gray-400 uppercase tracking-wider flex items-center justify-between">
                        Action Items <button className="text-violet-600 hover:text-violet-700 normal-case tracking-normal">Add</button>
                      </div>
                      <div className="bg-white border border-gray-100 rounded-xl p-2.5 shadow-sm flex items-start gap-2.5 hover:border-violet-200 transition-colors cursor-pointer group">
                        <div className="mt-0.5 border border-gray-300 w-3.5 h-3.5 rounded flex items-center justify-center group-hover:border-violet-400 transition-colors"></div>
                        <span className="text-xs text-gray-700 group-hover:text-violet-800 transition-colors">Sarah to upload final assets to the shared drive by Friday.</span>
                      </div>
                      <div className="bg-white border border-gray-100 rounded-xl p-2.5 shadow-sm flex items-start gap-2.5 hover:border-violet-200 transition-colors cursor-pointer group">
                        <div className="mt-0.5 border border-gray-300 w-3.5 h-3.5 rounded flex items-center justify-center group-hover:border-violet-400 transition-colors"></div>
                        <span className="text-xs text-gray-700 group-hover:text-violet-800 transition-colors">Alex to update the Compose AI prompt templates.</span>
                      </div>
                    </div>
                  </div>

                  {mainView === 'document' && (
                    <div className="absolute bottom-6 left-1/2 transform -translate-x-1/2 flex items-center gap-1.5 p-1.5 bg-white/80 backdrop-blur-xl border border-gray-200/60 rounded-2xl shadow-[0_8px_30px_rgba(0,0,0,0.12)] z-10 w-max">
                      <button onClick={toggleRoomMic} className={`p-2 rounded-xl transition-all ${isRoomMicOn ? 'bg-white text-gray-700 hover:bg-gray-100 shadow-sm border border-gray-100' : 'bg-red-50 text-red-600 border border-red-100'}`}>
                        {isRoomMicOn ? <Mic size={16} /> : <MicOff size={16} />}
                      </button>
                      <button onClick={toggleRoomCamera} className={`p-2 rounded-xl transition-all ${isRoomCameraOn ? 'bg-white text-gray-700 hover:bg-gray-100 shadow-sm border border-gray-100' : 'bg-red-50 text-red-600 border border-red-100'}`}>
                        {isRoomCameraOn ? <Video size={16} /> : <VideoOff size={16} />}
                      </button>
                      <button onClick={toggleScreenShare} className={`p-2 rounded-xl transition-all ${isScreenSharing ? 'bg-emerald-500 text-white' : 'bg-white text-gray-700 hover:bg-gray-100 shadow-sm border border-gray-100'}`}>
                        <MonitorPlay size={16} />
                      </button>
                      <div className="w-px h-5 bg-gray-200 mx-1"></div>
                      <button onClick={leaveRoom} className="px-2.5 py-1.5 rounded-xl bg-red-500 hover:bg-red-600 text-white transition-all shadow-sm flex items-center gap-1.5 font-medium text-[11px] border border-red-600 active:scale-95">
                        <PhoneOff size={14} /> Leave
                      </button>
                    </div>
                  )}
                </div>
              )}

              {/* STATE: MEETING SUMMARY */}
              {roomState === 'summary' && (
                <div className="flex-1 overflow-y-auto p-6 space-y-6 bg-white animate-fade-in relative">
                  <div className="text-center pb-6 border-b border-gray-100">
                    <div className="w-12 h-12 bg-gray-50 border border-gray-100 rounded-full flex items-center justify-center mx-auto mb-3 text-gray-400">
                      <PhoneOff size={20} />
                    </div>
                    <h3 className="text-lg font-bold text-gray-900 tracking-tight">Room Ended</h3>
                    <p className="text-xs text-gray-500 mt-1">{meetingSummary?.roomCode || 'q2-launch'} - {meetingSummary?.durationLabel || meetingDurationLabel} duration</p>
                  </div>

                  <div className="space-y-4">
                    <div className="flex items-center gap-2 text-[10px] font-bold text-violet-600 uppercase tracking-wider">
                      <Sparkles size={14} /> AI Session Recap
                    </div>

                    <div className="bg-[#FAFAFC] border border-gray-100 rounded-2xl p-4 space-y-4">
                      <div>
                        <h4 className="text-xs font-bold text-gray-800 mb-1">Key Decisions</h4>
                        <ul className="text-xs text-gray-600 space-y-1.5 pl-4 list-disc marker:text-emerald-500">
                          {(meetingSummary?.decisions || ['Beta launch officially locked for May 15th.', 'Marketing budget increased by 15% for initial push.']).map((decision) => (
                            <li key={decision}>{decision}</li>
                          ))}
                        </ul>
                      </div>
                      <div className="h-px w-full bg-gray-200/60"></div>
                      <div>
                        <h4 className="text-xs font-bold text-gray-800 mb-1">Action Items</h4>
                        <ul className="text-xs text-gray-600 space-y-1.5 pl-4 list-disc marker:text-violet-400">
                          {(meetingSummary?.actionItems || ['Sarah to upload final assets by Friday.', 'Alex to update Compose AI prompts.']).map((actionItem) => (
                            <li key={actionItem}>{actionItem}</li>
                          ))}
                        </ul>
                      </div>
                    </div>
                  </div>

                  <div className="pt-4">
                    <button
                      onClick={() => setRoomState('lobby')}
                      className="w-full bg-gray-100 text-gray-700 border border-gray-200 rounded-xl py-3 text-sm font-bold hover:bg-gray-200 transition-all active:scale-[0.98]"
                    >
                      Back to Lobby
                    </button>
                  </div>
                </div>
              )}

            </div>
          )}

          {activeRightTab === 'people' && (
            <div className="flex-1 overflow-y-auto p-5 space-y-4 bg-white animate-fade-in">
              <div className="rounded-2xl border border-violet-100 bg-gradient-to-br from-violet-50 to-white p-4">
                <h3 className="text-sm font-bold text-gray-900">Platform Contacts</h3>
                <p className="text-xs text-gray-500 mt-1">Everyone currently available to collaborate in Regaarder Compose.</p>
              </div>

              <div className="space-y-3">
                {platformContacts.map((person) => (
                  <div key={person.id} className="rounded-xl border border-gray-100 bg-white p-3 flex items-center justify-between gap-3 hover:border-violet-200 hover:shadow-sm transition-all">
                    <div className="flex items-center gap-3 min-w-0">
                      <div className="w-10 h-10 rounded-full bg-violet-100 text-violet-700 text-xs font-bold flex items-center justify-center shrink-0">
                        {person.name.split(' ').map((token) => token[0]).join('').slice(0, 2)}
                      </div>
                      <div className="min-w-0">
                        <div className="text-sm font-semibold text-gray-800 truncate">{person.name}</div>
                        <div className="text-xs text-gray-500 truncate">{person.title}</div>
                        <div className={`inline-flex items-center gap-1 mt-1 text-[10px] font-semibold rounded-full px-2 py-0.5 ${person.status === 'active' ? 'text-emerald-700 bg-emerald-50 border border-emerald-200' : 'text-amber-700 bg-amber-50 border border-amber-200'}`}>
                          <span className={`h-1.5 w-1.5 rounded-full ${person.status === 'active' ? 'bg-emerald-500 animate-pulse' : 'bg-amber-500'}`}></span>
                          {person.status === 'active' ? 'Active' : 'Away'}
                        </div>
                      </div>
                    </div>
                    <div className="flex items-center gap-2 shrink-0">
                      <button
                        onClick={() => {
                          setRoomMode('calls');
                          openMeetingSetup(`call-${person.name.toLowerCase().replace(/\s+/g, '-')}`);
                          setActiveRightTab('room');
                        }}
                        className="px-2.5 py-1.5 rounded-lg bg-violet-600 text-white text-[11px] font-semibold hover:bg-violet-700 transition-colors"
                      >
                        Call
                      </button>
                      <button
                        onClick={() => {
                          setRoomMode('meetings');
                          setActiveRightTab('room');
                        }}
                        className="px-2.5 py-1.5 rounded-lg border border-gray-200 text-[11px] font-semibold text-gray-700 hover:bg-gray-50 transition-colors"
                      >
                        Invite
                      </button>
                    </div>
                  </div>
                ))}
              </div>
            </div>
          )}

          {activeRightTab === 'memory' && (
            <div className="flex-1 overflow-y-auto p-5 space-y-5">
              <div>
                <h3 className="text-sm font-bold text-gray-900 mb-1">AI Access + Memory</h3>
                <p className="text-xs text-gray-500">Secure mode: AI calls run through your Vercel server function.</p>
              </div>

              <div className="rounded-xl border border-gray-100 bg-[#FAFAFC] p-3 space-y-3">
                <div className="text-[11px] font-semibold text-gray-500 uppercase tracking-wide">API Security</div>
                <div className="text-[11px] text-gray-500 flex items-center gap-2">
                  <KeyRound size={12} />
                  Server-managed key expected: set `GEMINI_API_KEY` or `VITE_GEMINI_DEMO_API_KEY` in Vercel project env.
                </div>
                <div className="rounded-lg border border-gray-200 bg-white px-3 py-2 text-xs text-gray-600 leading-relaxed">
                  Keep API keys out of client code. This app now sends prompts to `/api/gemini`, and only that server route reads `GEMINI_API_KEY` or `VITE_GEMINI_DEMO_API_KEY`. The checker validates both presence and provider usability.
                </div>
                <div className="flex items-center gap-2">
                  <button
                    onClick={checkAiBackendStatus}
                    className="inline-flex items-center gap-2 rounded-lg border border-gray-200 bg-white px-3 py-1.5 text-xs font-medium text-gray-700 hover:bg-gray-50"
                  >
                    <RefreshCcw size={12} className={aiBackendStatus.state === 'checking' ? 'animate-spin' : ''} />
                    Check AI Backend
                  </button>
                  <div className={`text-[11px] ${aiBackendStatus.state === 'ok' ? 'text-emerald-600' : aiBackendStatus.state === 'error' ? 'text-rose-600' : 'text-gray-500'}`}>
                    {aiBackendStatus.message}
                  </div>
                </div>
              </div>

              <div className="rounded-xl border border-gray-100 bg-[#FAFAFC] p-3 space-y-3">
                <div className="flex items-center justify-between">
                  <div className="text-[11px] font-semibold text-gray-500 uppercase tracking-wide">Memory Controls</div>
                  <label className="text-xs text-gray-600 flex items-center gap-2">
                    <input
                      type="checkbox"
                      checked={memoryCaptureEnabled}
                      onChange={(e) => setMemoryCaptureEnabled(e.target.checked)}
                    />
                    Capture events
                  </label>
                </div>

                <div className="grid grid-cols-2 gap-2 text-xs text-gray-600">
                  <div className="rounded-lg border border-gray-200 bg-white p-2">Total: <span className="font-semibold">{memoryStats.total}</span></div>
                  <div className="rounded-lg border border-gray-200 bg-white p-2">AI: <span className="font-semibold">{memoryStats.aiCalls}</span></div>
                  <div className="rounded-lg border border-gray-200 bg-white p-2">Uploads: <span className="font-semibold">{memoryStats.uploads}</span></div>
                  <div className="rounded-lg border border-gray-200 bg-white p-2">Exports: <span className="font-semibold">{memoryStats.exports}</span></div>
                </div>

                <div className="flex items-center gap-2 flex-wrap">
                  <label className="text-xs text-gray-600">Retention days</label>
                  <input
                    type="number"
                    min={1}
                    max={3650}
                    value={memoryRetentionDays}
                    onChange={(e) => setMemoryRetentionDays(Math.min(3650, Math.max(1, Number(e.target.value) || 90)))}
                    className="w-24 bg-white border border-gray-200 rounded-lg px-2 py-1.5 text-xs text-gray-700 focus:outline-none focus:border-violet-400"
                  />
                  <button
                    onClick={() => setMemoryEntries([])}
                    className="ml-auto shrink-0 px-2.5 py-1.5 rounded-lg text-xs border border-rose-200 text-rose-600 hover:bg-rose-50"
                  >
                    Clear all
                  </button>
                </div>
              </div>

              <div className="rounded-xl border border-gray-100 bg-[#FAFAFC] p-3 space-y-2">
                <div className="text-[11px] font-semibold text-gray-500 uppercase tracking-wide">Memory Browser</div>
                <div className="flex gap-2 min-w-0">
                  <input
                    type="text"
                    value={memorySearch}
                    onChange={(e) => setMemorySearch(e.target.value)}
                    placeholder="Search memory entries..."
                    className="flex-1 min-w-0 bg-white border border-gray-200 rounded-lg px-3 py-2 text-xs text-gray-700 focus:outline-none focus:border-violet-400"
                  />
                  <select
                    value={memoryFilter}
                    onChange={(e) => setMemoryFilter(e.target.value)}
                    className="shrink-0 bg-white border border-gray-200 rounded-lg px-2 py-2 text-xs text-gray-700"
                  >
                    <option value="all">All</option>
                    <option value="ai">AI</option>
                    <option value="upload">Uploads</option>
                    <option value="export">Exports</option>
                    <option value="automation">Automation</option>
                    <option value="task">Tasks</option>
                    <option value="share">Sharing</option>
                    <option value="feedback">Feedback</option>
                    <option value="document">Documents</option>
                  </select>
                </div>

                <div className="max-h-72 overflow-y-auto space-y-2 pr-1">
                  {filteredMemoryEntries.length === 0 && (
                    <div className="text-xs text-gray-500 py-3 text-center">No memory entries yet.</div>
                  )}
                  {filteredMemoryEntries.map((entry) => (
                    <div key={entry.id} className="rounded-lg border border-gray-200 bg-white p-2.5 text-xs">
                      <div className="flex items-center justify-between gap-2">
                        <span className="font-semibold text-gray-800">{entry.summary}</span>
                        <span className="text-[10px] uppercase text-violet-600 font-semibold">{entry.type}</span>
                      </div>
                      <div className="text-[10px] text-gray-500 mt-1">{new Date(entry.timestamp).toLocaleString()}</div>
                      {Object.keys(entry.details || {}).length > 0 && (
                        <div className="mt-1.5 text-[10px] text-gray-600 break-all">{Object.entries(entry.details).map(([key, value]) => `${key}: ${value}`).join(' | ')}</div>
                      )}
                    </div>
                  ))}
                </div>
              </div>
            </div>
          )}

          {activeRightTab === 'orb' && (
            <div className="flex-1 min-h-0 animate-fade-in flex flex-col bg-white">
              <div className="flex-1 overflow-y-auto thin-scrollbar">

                {/* Header */}
                <div className="flex items-center justify-between px-4 pt-4 pb-3">
                  <div className="flex items-center gap-2">
                    <span className="inline-flex h-6 w-6 items-center justify-center rounded-full bg-violet-600 text-white text-[11px] font-bold">O</span>
                    <span className="text-[22px] leading-none font-bold tracking-tight text-slate-900">Orb</span>
                  </div>
                  <div className="flex items-center gap-1">
                    <button type="button" className="p-1.5 rounded-md text-slate-400 hover:text-slate-600 hover:bg-slate-100"><Search size={14} /></button>
                    <button type="button" className="p-1.5 rounded-full text-violet-600 hover:text-violet-700 hover:bg-violet-50 border border-violet-200"><Plus size={14} /></button>
                    <button type="button" onClick={() => setRightSidebarOpen(false)} className="p-1.5 rounded-md text-slate-400 hover:text-slate-600 hover:bg-slate-100"><X size={14} /></button>
                  </div>
                </div>

                {/* Search */}
                <div className="px-4 pb-3">
                  <div className="relative">
                    <Search size={13} className="absolute left-3 top-2.5 text-gray-400" />
                    <input
                      type="text"
                      placeholder="Search Orb..."
                      className="w-full rounded-xl bg-gray-100 py-2 pl-8 pr-14 text-[13px] text-slate-700 placeholder:text-slate-400 focus:outline-none focus:ring-1 focus:ring-violet-300 border-0"
                    />
                    <span className="absolute right-3 top-[7px] text-[10px] font-semibold text-gray-400 border border-gray-300 rounded px-1.5 py-0.5 bg-white">?謅?/span>
                  </div>
                </div>
                <div className="flex items-center gap-5 px-4 text-xs font-semibold border-b border-gray-100">
                  <button 
                    type="button"
                    onClick={() => setOrbActiveTab('context')}
                    className={`pb-2.5 border-b-2 transition-all ${orbActiveTab === 'context' ? 'border-violet-500 text-violet-600 font-bold' : 'border-transparent text-slate-400 hover:text-slate-600'}`}
                  >
                    Context
                  </button>
                  <button 
                    type="button"
                    onClick={() => setOrbActiveTab('memory')}
                    className={`pb-2.5 border-b-2 transition-all ${orbActiveTab === 'memory' ? 'border-violet-500 text-violet-600 font-bold' : 'border-transparent text-slate-400 hover:text-slate-600'}`}
                  >
                    Workspace Memory
                  </button>
                </div>

                {orbActiveTab === 'memory' ? (
                  <div className="px-4 pt-4 pb-3 space-y-3">
                    <div className="flex items-center gap-2 mb-1">
                      <Database size={13} className="text-violet-500" />
                      <span className="text-[13px] font-semibold text-slate-900">Workspace Decision Graph</span>
                    </div>
                    <p className="text-[10px] text-slate-400 leading-relaxed">
                      Orb maps decisions, whiteboard cards, spreadsheet values, and meeting transcripts to keep team workspace context completely unified.
                    </p>
                    
                    <div className="relative border-l border-violet-100 pl-4 ml-2 space-y-3 mt-2">
                      {workspaceMemory.length === 0 ? (
                        <div className="text-xs text-slate-400 py-4 text-center">No decisions recorded yet.</div>
                      ) : (
                        workspaceMemory.map((item) => (
                          <div key={item.id} className="relative">
                            <span className="absolute -left-[21px] top-1.5 w-2 h-2 rounded-full border border-white bg-violet-600 shadow-[0_0_6px_rgba(124,58,237,0.5)]"></span>
                            <div className="rounded-xl border border-gray-100 bg-gray-50 p-2.5 hover:bg-white hover:border-violet-200 transition-all duration-300">
                              <div className="text-[9px] text-slate-400 flex items-center justify-between">
                                <span className="font-semibold text-violet-600">{item.source}</span>
                                <span>{new Date(item.timestamp).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })}</span>
                              </div>
                              <div className="text-[11px] text-slate-700 mt-1 leading-relaxed">
                                {item.event}
                              </div>
                              {item.links && item.links.length > 0 && (
                                <div className="flex flex-wrap gap-1 mt-1.5">
                                  {item.links.map((link) => (
                                    <span key={link} className="inline-flex items-center gap-0.5 rounded bg-violet-50 px-1 py-0.2 text-[8px] font-medium text-violet-700 border border-violet-100">
                                      <Link size={8} /> {link}
                                    </span>
                                  ))}
                                </div>
                              )}
                            </div>
                          </div>
                        ))
                      )}
                    </div>
                  </div>
                ) : (
                  <>
                    {/* Related to this document */}
                    <div className="px-4 pt-4 pb-3">
                      <div className="flex items-center justify-between mb-1">
                        <div className="flex items-center gap-2">
                          <Sparkles size={12} className="text-violet-500" />
                          <span className="text-[13px] font-semibold text-slate-900">Related to this document</span>
                          <span className="text-[9px] font-semibold text-violet-600 bg-violet-50 border border-violet-100 rounded-full px-1.5 py-0.5">AI</span>
                        </div>
                        <button className="text-[11px] font-semibold text-violet-600 hover:text-violet-700">View all</button>
                      </div>
                      <p className="text-[10px] text-slate-400 mb-3">Based on content and workspace context</p>
                      <div className="space-y-2">
                        {[
                          { name: 'Competitive Analysis.pdf', ext: 'PDF', iconBg: 'bg-red-100', iconText: 'text-red-600', meta: 'Mentioned: pricing, positioning, bundling', ago: '2h ago' },
                          { name: 'Creator Pricing Model.xlsx', ext: 'XLS', iconBg: 'bg-green-100', iconText: 'text-green-700', meta: 'Related to: monetization strategy', ago: '4h ago' },
                          { name: 'Market Entry Strategy.docx', ext: 'DOC', iconBg: 'bg-blue-100', iconText: 'text-blue-600', meta: 'Related to: go-to-market, verticals', ago: '1d ago' },
                          { name: 'Strategy Call Recording.mp4', ext: '?', iconBg: 'bg-violet-100', iconText: 'text-violet-600', meta: 'From: Strategy Sync ??May 10', ago: '2d ago' },
                        ].map((asset) => (
                          <div key={asset.name} className="rounded-xl border border-gray-100 bg-gray-50 px-3 py-2.5 hover:bg-white hover:border-gray-200 transition-colors cursor-pointer">
                            <div className="flex items-start gap-2.5">
                              <span className={`inline-flex items-center justify-center w-7 h-7 rounded-lg ${asset.iconBg} ${asset.iconText} text-[9px] font-bold flex-shrink-0 mt-0.5`}>{asset.ext}</span>
                              <div className="min-w-0 flex-1">
                                <div className="flex items-start justify-between gap-2">
                                  <div className="text-[12px] font-semibold text-slate-800 truncate">{asset.name}</div>
                                  <div className="text-[10px] text-slate-400 whitespace-nowrap">{asset.ago}</div>
                                </div>
                                <div className="text-[10px] text-slate-500 mt-0.5">{asset.meta}</div>
                              </div>
                            </div>
                          </div>
                        ))}
                      </div>
                    </div>

                    <div className="mx-4 border-t border-gray-100" />

                    {/* AI Suggestions */}
                    <div className="px-4 pt-3 pb-3">
                      <div className="flex items-center justify-between mb-3">
                        <div className="flex items-center gap-2">
                          <Sparkles size={12} className="text-violet-500" />
                          <span className="text-[13px] font-semibold text-slate-900">AI Suggestions</span>
                          <span className="text-[9px] font-semibold text-violet-600 bg-violet-50 border border-violet-100 rounded-full px-1.5 py-0.5">New</span>
                        </div>
                        <button className="text-slate-400 hover:text-slate-600"><RefreshCcw size={12} /></button>
                      </div>
                      <div className="space-y-2">
                        {[
                          { icon: Sparkles, text: 'This document mentions "creator monetization". Found 8 related assets.' },
                          { icon: Sparkles, text: 'Extracted 6 potential tasks from related assets.' },
                          { icon: Sparkles, text: 'Investor deck v5.pdf is often referenced in this context.' },
                        ].map(({ icon: Icon, text }) => (
                          <div key={text} className="flex items-start gap-2.5 py-1">
                            <Icon size={11} className="text-violet-400 mt-0.5 flex-shrink-0" />
                            <span className="text-[11px] text-slate-600 leading-relaxed">{text}</span>
                          </div>
                        ))}
                      </div>
                      <button className="mt-2 text-[11px] font-semibold text-violet-600 hover:text-violet-700">Show more</button>
                    </div>
                  </>
                )}

                <div className="mx-4 border-t border-gray-100" />

                {/* Quick Actions */}
                <div className="px-4 pt-3 pb-3">
                  <span className="text-[13px] font-semibold text-slate-900 block mb-2.5">Quick Actions</span>
                  <div className="grid grid-cols-2 gap-2">
                    {[
                      { label: 'Upload file', Icon: Upload },
                      { label: 'Link from...', Icon: LinkIcon },
                      { label: 'Record meeting', Icon: Mic },
                      { label: 'Create folder', Icon: File },
                    ].map(({ label, Icon }) => (
                      <button key={label} className="rounded-xl border border-gray-100 bg-gray-50 hover:bg-white hover:border-gray-200 px-2.5 py-2 text-[11px] font-semibold text-slate-700 inline-flex items-center gap-1.5 transition-colors">
                        <Icon size={12} className="text-violet-500" />
                        {label}
                      </button>
                    ))}
                  </div>
                </div>

                <div className="mx-4 border-t border-gray-100" />

                {/* Orb Storage */}
                <div className="px-4 pt-3 pb-5">
                  <div className="flex items-center justify-between text-[11px] mb-2">
                    <span className="font-semibold text-slate-700">Orb Storage</span>
                    <span className="text-slate-400">256 GB of 1 TB used</span>
                  </div>
                  <div className="h-2 rounded-full bg-gray-100 overflow-hidden">
                    <div className="h-full w-[25%] rounded-full bg-violet-500" />
                  </div>
                  <div className="mt-1.5 text-right text-[11px] font-semibold text-slate-500">25%</div>
                </div>

              </div>
            </div>
          )}
        </div>
      </div>

      {/* 4. Far Right Mini Sidebar (Icons only / Navigation controller) */}
      <div className={`${productMode === 'landing' ? 'hidden' : 'flex'} w-[74px] border-l border-gray-100 bg-[#FAFAFC] flex-col items-center py-4 gap-6 shrink-0 select-none overflow-y-auto overflow-x-visible thin-scrollbar`}>
        <div className="relative">
          <div
            className="group flex flex-col items-center gap-1 cursor-pointer transition-colors text-gray-400 hover:text-gray-600"
            onClick={() => {
              setProductMode('landing');
            }}
          >
            <Home className="transition-all" size={20} strokeWidth={2} />
            <span className="text-[9px] font-semibold">Home</span>
          </div>

          {workspaceLauncherOpen && (
            <div className="absolute right-full top-0 mr-4 z-[9999] w-[180px] bg-white rounded-2xl shadow-2xl border border-slate-100 p-2 overflow-hidden origin-right animate-in fade-in zoom-in-95 duration-200">
              <div className="flex items-center justify-between px-3 py-2 mb-1 border-b border-slate-50">
                <span className="text-xs font-bold text-slate-400 uppercase tracking-wider">Create New</span>
                <button onClick={() => setWorkspaceLauncherOpen(false)} className="text-slate-400 hover:text-slate-700 transition-colors">
                  <X size={14} />
                </button>
              </div>
              <div className="space-y-0.5">
                {[
                  { key: 'compose', label: 'Compose', icon: FileText },
                  { key: 'deck', label: 'Deck', icon: MonitorPlay },
                  { key: 'sheet', label: 'Sheet', icon: Table },
                  { key: 'room', label: 'Room', icon: Video },
                  { key: 'whiteboard', label: 'Whiteboard', icon: PenTool },
                ].map(({ key, label, icon: Icon }) => (
                  <button
                    key={key}
                    type="button"
                    onClick={() => launchWorkspaceFromMiniPlus(key)}
                    className="w-full flex items-center gap-3 px-3 py-2 text-sm text-slate-700 hover:bg-violet-50 hover:text-violet-700 rounded-lg transition-colors text-left font-medium group"
                  >
                    <Icon size={16} strokeWidth={2} className="text-slate-400 group-hover:text-violet-500 transition-colors" />
                    {label}
                  </button>
                ))}
              </div>
            </div>
          )}
        </div>
        
        <div 
          onClick={() => handleMiniSidebarClick('chat')}
          className={`flex flex-col items-center gap-1 cursor-pointer transition-colors ${
            activeRightTab === 'chat' && rightSidebarOpen ? 'text-violet-600' : 'text-gray-400 hover:text-violet-600'
          }`}
        >
          <div className={`p-2 rounded-xl transition-all ${activeRightTab === 'chat' && rightSidebarOpen ? 'bg-violet-100' : ''}`}>
            <MessageCircle size={20} />
          </div>
          <span className="text-[9px] font-semibold">Chat</span>
        </div>

        <div
          onClick={() => handleMiniSidebarClick('dm')}
          className={`flex flex-col items-center gap-1 cursor-pointer transition-colors ${
            productMode === 'dm' ? 'text-violet-600' : 'text-gray-400 hover:text-violet-600'
          }`}
        >
          <div className={`p-2 rounded-xl transition-all ${productMode === 'dm' ? 'bg-violet-100' : ''}`}>
            <MessageSquare size={20} />
          </div>
          <span className="text-[9px] font-semibold">DMs</span>
        </div>

        <div 
          onClick={() => handleMiniSidebarClick('assistant')}
          className={`flex flex-col items-center gap-1 cursor-pointer transition-colors ${
            activeRightTab === 'assistant' && rightSidebarOpen ? 'text-violet-600' : 'text-gray-400 hover:text-violet-600'
          }`}
        >
          <div className={`p-2 rounded-xl transition-all relative ${activeRightTab === 'assistant' && rightSidebarOpen ? 'bg-violet-100' : ''} ${selectedEditorText ? 'ring-2 ring-violet-300 ring-offset-2 ring-offset-[#FAFAFC]' : ''}`}>
            <PenTool size={20} />
            {selectedEditorText && <span className="absolute -top-1 -right-1 w-2.5 h-2.5 rounded-full bg-violet-500 animate-pulse" />}
          </div>
          <span className="text-[9px] font-semibold">Assist</span>
        </div>

        <div
          onClick={() => handleMiniSidebarClick('whiteboard')}
          className={`flex flex-col items-center gap-1 cursor-pointer transition-colors ${
            activeRightTab === 'whiteboard' && rightSidebarOpen ? 'text-violet-600' : 'text-gray-400 hover:text-violet-600'
          }`}
        >
          <div className={`p-2 rounded-xl transition-all ${activeRightTab === 'whiteboard' && rightSidebarOpen ? 'bg-violet-100' : ''}`}>
            <LayoutGrid size={20} />
          </div>
          <span className="text-[9px] font-semibold">Whiteboard</span>
        </div>

        <div 
          onClick={() => handleMiniSidebarClick('tasks')}
          className={`flex flex-col items-center gap-1 cursor-pointer transition-colors ${
            activeRightTab === 'tasks' && rightSidebarOpen ? 'text-violet-600' : 'text-gray-400 hover:text-violet-600'
          }`}
        >
          <div className={`p-2 rounded-xl transition-all ${activeRightTab === 'tasks' && rightSidebarOpen ? 'bg-violet-100' : ''}`}>
            <CheckSquare size={20} />
          </div>
          <span className="text-[9px] font-semibold">Tasks</span>
        </div>

        <div 
          onClick={() => handleMiniSidebarClick('calendar')}
          className={`flex flex-col items-center gap-1 cursor-pointer transition-colors ${
            activeRightTab === 'calendar' && rightSidebarOpen ? 'text-violet-600' : 'text-gray-400 hover:text-violet-600'
          }`}
        >
          <div className={`p-2 rounded-xl transition-all ${activeRightTab === 'calendar' && rightSidebarOpen ? 'bg-violet-100' : ''}`}>
            <Calendar size={20} />
          </div>
          <span className="text-[9px] font-semibold">Schedule</span>
        </div>

        <div
          onClick={() => handleMiniSidebarClick('people')}
          className={`flex flex-col items-center gap-1 cursor-pointer transition-colors ${
            activeRightTab === 'people' && rightSidebarOpen ? 'text-violet-600' : 'text-gray-400 hover:text-violet-600'
          }`}
        >
          <div className={`p-2 rounded-xl transition-all ${activeRightTab === 'people' && rightSidebarOpen ? 'bg-violet-100' : ''}`}>
            <Users size={20} />
          </div>
          <span className="text-[9px] font-semibold">People</span>
        </div>

        <div
          onClick={() => handleMiniSidebarClick('memory')}
          className={`flex flex-col items-center gap-1 cursor-pointer transition-colors ${
            activeRightTab === 'memory' && rightSidebarOpen ? 'text-violet-600' : 'text-gray-400 hover:text-violet-600'
          }`}
        >
          <div className={`p-2 rounded-xl transition-all ${activeRightTab === 'memory' && rightSidebarOpen ? 'bg-violet-100' : ''}`}>
            <Database size={20} />
          </div>
          <span className="text-[9px] font-semibold">Memory</span>
        </div>

        <div
          onClick={() => handleMiniSidebarClick('orb')}
          className={`flex flex-col items-center gap-1 cursor-pointer transition-colors ${
            activeRightTab === 'orb' && rightSidebarOpen ? 'text-violet-600' : 'text-gray-400 hover:text-violet-600'
          }`}
        >
          <div className={`p-2 rounded-xl transition-all ${activeRightTab === 'orb' && rightSidebarOpen ? 'bg-violet-100' : ''}`}><Cloud size={20} /></div>
          <span className="text-[9px] font-semibold">Orb</span>
        </div>

        <div
          onClick={() => handleMiniSidebarClick('manageen')}
          className={`flex flex-col items-center gap-1 cursor-pointer transition-colors ${
            activeRightTab === 'manageen' && rightSidebarOpen ? 'text-violet-600' : 'text-gray-400 hover:text-violet-600'
          }`}
        >
          <div className={`p-2 rounded-xl transition-all ${activeRightTab === 'manageen' && rightSidebarOpen ? 'bg-violet-100' : ''}`}>
            <ListTodo size={20} />
          </div>
          <span className="text-[9px] font-semibold">Manageen</span>
        </div>

        <div
          onClick={() => handleMiniSidebarClick('room')}
          className={`flex flex-col items-center gap-1 cursor-pointer transition-colors ${
            activeRightTab === 'room' && rightSidebarOpen ? 'text-violet-600' : 'text-gray-400 hover:text-violet-600'
          }`}
        >
          <div className={`p-2 rounded-xl transition-all ${activeRightTab === 'room' && rightSidebarOpen ? 'bg-violet-100' : ''}`}>
            <MonitorPlay size={20} />
          </div>
          <span className="text-[9px] font-semibold">Room</span>
        </div>

        <div
          onClick={() => {
            handleMiniSidebarClick('room');
            setActiveMeetingStageTab('files');
          }}
          className="flex flex-col items-center gap-1 text-gray-400 hover:text-violet-600 cursor-pointer"
        >
          <div className="p-2">
            <File size={20} />
          </div>
          <span className="text-[9px] font-semibold">Files</span>
        </div>

        <div className="flex flex-col items-center gap-1 text-gray-400 hover:text-gray-600 cursor-pointer mt-auto">
          <div className="p-2">
            <MoreHorizontal size={20} />
          </div>
          <span className="text-[9px] font-semibold">More</span>
        </div>
      </div>

      {roomState === 'active' && roomPanelMode === 'expanded' && mainView === 'room' && (
