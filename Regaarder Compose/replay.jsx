        {replayPanelOpen && (
          <div className="absolute right-6 top-16 z-[260] w-[430px] overflow-visible rounded-2xl border border-slate-200/60 bg-white/95 backdrop-blur-md shadow-[0_24px_50px_-15px_rgba(15,23,42,0.15),0_0_1px_rgba(0,0,0,0.06)]">
            <div className="flex items-start justify-between gap-3 border-b border-slate-100/80 px-5 py-4">
              <div>
                <div className="text-[13px] font-semibold text-slate-900 tracking-tight">Edit replay</div>
                <div className="mt-0.5 text-[11px] font-medium text-slate-400">
                  {replayTimeline.length
                    ? `${replayIndex === null ? replayTimeline.length : replayIndex + 1} of ${replayTimeline.length} steps • ${formatReplayDuration((replayTimeline[replayTimeline.length - 1]?.timestamp || 0) - (replayTimeline[0]?.timestamp || 0))} worked`
                    : 'Start typing or editing to build a replay history'}
                </div>
              </div>
              <button
                type="button"
                onClick={() => {
                  setReplayPanelOpen(false);
                  setIsReplayPlaying(false);
                }}
                className="rounded-xl p-1 text-slate-400 hover:bg-slate-50 hover:text-slate-700 transition-all duration-150 active:scale-95 border border-transparent hover:border-slate-100"
                title="Close replay"
              >
                <X size={15} />
              </button>
            </div>

            <div className="space-y-4 px-5 py-4">
              <input
                type="range"
                min="0"
                max={Math.max(0, replayTimeline.length - 1)}
                value={Math.max(0, replayIndex ?? Math.max(0, replayTimeline.length - 1))}
                onChange={(event) => applyReplayIndex(Number(event.target.value))}
                disabled={!replayTimeline.length}
                className="w-full accent-violet-600 cursor-pointer h-1.5 bg-slate-150 rounded-lg appearance-none outline-none"
                title="Scrub through edit steps"
              />

              <div className="flex items-center justify-between text-[11px] font-medium text-slate-400">
                <span>
                  {replayTimeline.length && replayTimeline[0]?.timestamp && replayTimeline[Math.max(0, replayIndex ?? replayTimeline.length - 1)]?.timestamp
                    ? formatReplayDuration(replayTimeline[Math.max(0, replayIndex ?? replayTimeline.length - 1)].timestamp - replayTimeline[0].timestamp)
                    : '0:00'}
                </span>
                <span>{replayTimeline.length ? `Step ${Math.max(0, replayIndex ?? replayTimeline.length - 1) + 1}` : 'No steps yet'}</span>
              </div>

              <div className="flex items-center gap-2">
                <button
                  type="button"
                  onClick={() => applyReplayIndex((replayIndex ?? replayTimeline.length - 1) - 1)}
                  disabled={!replayTimeline.length || (replayIndex ?? replayTimeline.length - 1) <= 0}
                  className="flex-1 inline-flex items-center justify-center gap-1.5 whitespace-nowrap rounded-xl border border-slate-200/70 bg-white px-3 py-2.5 text-[12px] font-medium text-slate-700 hover:bg-slate-50 hover:text-slate-900 transition-all duration-200 active:scale-95 disabled:cursor-not-allowed disabled:opacity-40 shadow-sm"
                  title="Move one step backward"
                >
                  <Undo2 size={13} />
                  Step Back
                </button>
                <button
                  type="button"
                  onClick={toggleSmartReplayPlayback}
                  disabled={!replayTimeline.length}
                  className={`flex-1 inline-flex items-center justify-center gap-1.5 whitespace-nowrap rounded-xl px-4 py-2.5 text-[12px] font-semibold disabled:cursor-not-allowed disabled:opacity-40 transition-all duration-200 active:scale-95 shadow-sm ${
                    isReplayPlaying 
                      ? 'border border-violet-500 bg-violet-50/30 text-violet-900 ring-1 ring-violet-500/20 outline-violet-500' 
                      : 'bg-violet-600 text-white hover:bg-violet-750'
                  }`}
                  title={isReplayPlaying ? 'Pause replay' : (getSmartReplayDirection() < 0 ? 'Play backward toward earlier edits' : 'Play forward toward latest edits')}
                >
                  {isReplayPlaying ? <Pause size={13} /> : <Play size={13} />}
                  Rewind
                </button>
                <button
                  type="button"
                  onClick={() => applyReplayIndex((replayIndex ?? 0) + 1)}
                  disabled={!replayTimeline.length || (replayIndex ?? 0) >= replayTimeline.length - 1}
                  className="flex-1 inline-flex items-center justify-center gap-1.5 whitespace-nowrap rounded-xl border border-slate-200/70 bg-white px-3 py-2.5 text-[12px] font-medium text-slate-700 hover:bg-slate-50 hover:text-slate-900 transition-all duration-200 active:scale-95 disabled:cursor-not-allowed disabled:opacity-40 shadow-sm"
                  title="Move one step forward"
                >
                  <Redo2 size={13} />
                  Step Forward
                </button>
              </div>

              <div className="flex items-center justify-between gap-2 pt-1" ref={replaySpeedMenuRef}>
                <label className="text-[12px] font-semibold text-slate-400 uppercase tracking-wider">Playback Speed</label>
                <div className="relative">
                  <button
                    type="button"
                    onClick={() => {
                      setNotificationsOpen(false);
                      setReplaySpeedMenuOpen((prev) => !prev);
                    }}
                    className="inline-flex items-center gap-1.5 rounded-xl border border-slate-200 bg-white px-3 py-1.5 text-[11px] font-semibold text-slate-700 hover:bg-slate-50 transition-all duration-200 active:scale-95 shadow-sm"
                    title="Playback speed"
                  >
                    <span>{replaySpeed}x</span>
                    <ChevronDown size={13} className={`transition-transform ${replaySpeedMenuOpen ? 'rotate-180' : ''}`} />
                  </button>
                  {replaySpeedMenuOpen && (
                    <div className="absolute right-0 top-[34px] z-[320] w-[110px] rounded-xl border border-slate-200 bg-white shadow-[0_12px_24px_-8px_rgba(0,0,0,0.1),0_0_1px_rgba(0,0,0,0.08)] p-1 animate-in fade-in slide-in-from-top-1 duration-150">
                      {[0.5, 1, 1.5, 2, 3, 4, 5].map((speedOption) => (
                        <button
                          key={speedOption}
                          type="button"
                          onClick={() => {
                            setReplaySpeed(speedOption);
                            setReplaySpeedMenuOpen(false);
                          }}
                          className={`w-full flex items-center justify-between rounded-lg px-2.5 py-1.5 text-[11px] ${replaySpeed === speedOption ? 'bg-violet-50/50 text-violet-700 font-semibold' : 'text-slate-650 hover:bg-slate-50/80'}`}
                        >
                          <span>{speedOption}x</span>
                          {replaySpeed === speedOption && <Check size={11} className="text-violet-600 stroke-[3]" />}
                        </button>
                      ))}
                    </div>
                  )}
                </div>
              </div>

              <button
                type="button"
                onClick={shareReplayTimeline}
                disabled={!replayTimeline.length || replaySharing}
                className="w-full inline-flex items-center justify-center gap-1.5 rounded-xl border border-slate-200 bg-white hover:bg-slate-50 px-3 py-2.5 text-[12px] font-semibold text-slate-700 transition-all duration-200 active:scale-95 shadow-sm disabled:cursor-not-allowed disabled:opacity-40"
                title="Copy a replay link that other users can open and play"
              >
                <LinkIcon size={14} />
                {replaySharing ? 'Preparing Link...' : 'Share Replay'}
              </button>
            </div>
          </div>
        )}
