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
    </React.Fragment>
  );

  const sharedReplayPanel = (
    <React.Fragment>
        {replayPanelOpen && (
          <div className="absolute right-6 top-16 z-[260] w-[430px] overflow-visible rounded-[22px] border border-[#e8e6f2] bg-white shadow-[0_30px_70px_-34px_rgba(15,23,42,0.42)]">
            <div className="flex items-start justify-between gap-3 border-b border-[#efedf6] px-5 py-4">
              <div>
                <div className="text-[13px] font-semibold text-slate-900">Edit replay</div>
                <div className="mt-1 text-[12px] text-slate-500">
                  {replayTimeline.length
                    ? `${replayIndex === null ? replayTimeline.length : replayIndex + 1} of ${replayTimeline.length} steps 繚 ${formatReplayDuration((replayTimeline[replayTimeline.length - 1]?.timestamp || 0) - (replayTimeline[0]?.timestamp || 0))} worked`
                    : 'Start typing or editing to build a replay history'}
                </div>
              </div>
              <button
                type="button"
                onClick={() => {
                  setReplayPanelOpen(false);
                  setIsReplayPlaying(false);
                }}
                className="rounded-full p-1.5 text-slate-400 hover:bg-slate-100 hover:text-slate-600"
                title="Close replay"
              >
                <X size={14} />
              </button>
            </div>
