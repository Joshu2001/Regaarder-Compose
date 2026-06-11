        {replayPanelOpen && (
          <div className="absolute right-6 top-16 z-[260] w-[430px] overflow-visible rounded-[22px] border border-[#e8e6f2] bg-white shadow-[0_30px_70px_-34px_rgba(15,23,42,0.42)]">
            <div className="flex items-start justify-between gap-3 border-b border-[#efedf6] px-5 py-4">
              <div>
                <div className="text-[13px] font-semibold text-slate-900">Edit replay</div>
                <div className="mt-1 text-[12px] text-slate-500">
                  {replayTimeline.length
                    ? `${replayIndex === null ? replayTimeline.length : replayIndex + 1} of ${replayTimeline.length} steps 蝜?${formatReplayDuration((replayTimeline[replayTimeline.length - 1]?.timestamp || 0) - (replayTimeline[0]?.timestamp || 0))} worked`
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

            <div className="space-y-4 px-5 py-4">
              <input
                type="range"
                min="0"
                max={Math.max(0, replayTimeline.length - 1)}
                value={Math.max(0, replayIndex ?? Math.max(0, replayTimeline.length - 1))}
                onChange={(event) => applyReplayIndex(Number(event.target.value))}
                disabled={!replayTimeline.length}
                className="w-full accent-violet-600"
                title="Scrub through edit steps"
              />

              <div className="flex items-center justify-between text-[12px] text-slate-500">
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
                  className="flex-1 inline-flex items-center justify-center gap-2 whitespace-nowrap rounded-xl border border-[#e5e7eb] bg-white px-3 py-3 text-[13px] font-medium text-slate-700 hover:bg-slate-50 disabled:cursor-not-allowed disabled:opacity-50"
                  title="Move one step backward"
                >
                  <Undo2 size={13} />
                  Step Back
                </button>
                <button
                  type="button"
                  onClick={toggleSmartReplayPlayback}
                  disabled={!replayTimeline.length}
                  className={`flex-1 inline-flex items-center justify-center gap-2 whitespace-nowrap rounded-xl px-4 py-3 text-[13px] font-medium text-white disabled:cursor-not-allowed disabled:opacity-50 ${isReplayPlaying ? 'bg-[#5b21b6] hover:bg-[#4c1d95]' : 'bg-violet-600 hover:bg-violet-700'}`}
                  title={isReplayPlaying ? 'Pause replay' : (getSmartReplayDirection() < 0 ? 'Play backward toward earlier edits' : 'Play forward toward latest edits')}
                >
                  {isReplayPlaying ? <Pause size={13} /> : <Play size={13} />}
                  Rewind
                </button>
                <button
                  type="button"
                  onClick={() => applyReplayIndex((replayIndex ?? 0) + 1)}
                  disabled={!replayTimeline.length || (replayIndex ?? 0) >= replayTimeline.length - 1}
                  className="flex-1 inline-flex items-center justify-center gap-2 whitespace-nowrap rounded-xl border border-[#e5e7eb] bg-white px-3 py-3 text-[13px] font-medium text-slate-700 hover:bg-slate-50 disabled:cursor-not-allowed disabled:opacity-50"
                  title="Move one step forward"
                >
                  <Redo2 size={13} />
                  Step Forward
                </button>
              </div>

              <div className="flex items-center justify-between gap-2 pt-1" ref={replaySpeedMenuRef}>
                <label className="text-[12px] font-medium text-slate-500">Speed</label>
                <div className="relative">
                  <button
                    type="button"
                    onClick={() => {
                      setNotificationsOpen(false);
                      setReplaySpeedMenuOpen((prev) => !prev);
                    }}
                    className="inline-flex items-center gap-2 rounded-xl border border-violet-200 bg-violet-50 px-3 py-2 text-[12px] font-semibold text-violet-700 hover:bg-violet-100"
                    title="Playback speed"
                  >
                    <span>{replaySpeed}x</span>
                    <ChevronDown size={13} className={`transition-transform ${replaySpeedMenuOpen ? 'rotate-180' : ''}`} />
                  </button>
                  {replaySpeedMenuOpen && (
                    <div className="absolute right-0 top-[42px] z-[320] w-[110px] rounded-xl border border-violet-100 bg-white shadow-[0_18px_40px_-22px_rgba(76,29,149,0.45)] p-1">
                      {[0.25, 0.5, 1, 1.5, 2].map((speedOption) => (
                        <button
                          key={speedOption}
                          type="button"
                          onClick={() => {
                            setReplaySpeed(speedOption);
