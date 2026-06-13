const fs = require('fs');
const path = require('path');
const file = 'c:\\Users\\user\\Downloads\\Project MOAT\\Regaarder Compose\\src\\App.jsx';
let content = fs.readFileSync(file, 'utf8');

const startMarker = '<div className="flex-1 overflow-y-auto thin-scrollbar px-3 py-3 space-y-3">';
const endMarker = '{roomState === \'lobby\' && isRoomInviteModalOpen && (';

const startIdx = content.indexOf(startMarker);
const endIdx = content.indexOf(endMarker, startIdx);

if (startIdx !== -1 && endIdx !== -1) {
  // Find the exact closing tags before the endMarker
  const preEndText = content.substring(0, endIdx);
  const lastClosingTags = preEndText.lastIndexOf('                </div>\n              )}');
  
  const replacement = `                  <div className="flex-1 overflow-y-auto thin-scrollbar px-5 py-6 bg-white space-y-8">
                    <div>
                      <div className="flex items-center gap-2 mb-4">
                        <div className="w-2 h-2 rounded-full bg-slate-300"></div>
                        <span className="text-[13px] font-semibold text-slate-800">Offline</span>
                      </div>
                      <div className="space-y-2">
                        <button
                          type="button"
                          onClick={() => startMeetingNow(generateRoomCode())}
                          className="w-full text-left px-3 py-2.5 rounded-xl bg-slate-900 text-white text-[13px] font-medium hover:bg-slate-800 transition-colors flex items-center justify-between"
                        >
                          Start meeting
                          <Plus size={16} className="opacity-70" />
                        </button>
                        {isRoomStartMenuOpen ? (
                          <div className="flex gap-2">
                            <input
                              ref={roomJoinInputRef}
                              type="text"
                              value={joinCode}
                              onChange={(e) => setJoinCode(e.target.value)}
                              placeholder="Enter code"
                              className="flex-1 rounded-xl border border-slate-200 px-3 py-2.5 text-[13px] focus:outline-none focus:border-violet-500 focus:ring-1 focus:ring-violet-500"
                              onKeyDown={(e) => {
                                if (e.key === 'Enter' && joinCode.trim()) openMeetingSetup(joinCode.trim());
                              }}
                            />
                            <button onClick={() => joinCode.trim() && openMeetingSetup(joinCode.trim())} className="px-4 py-2.5 rounded-xl bg-slate-100 text-slate-700 text-[13px] font-medium hover:bg-slate-200">Join</button>
                          </div>
                        ) : (
                          <button
                            type="button"
                            onClick={() => setIsRoomStartMenuOpen(true)}
                            className="w-full text-left px-3 py-2.5 rounded-xl border border-slate-200 bg-white text-slate-800 text-[13px] font-medium hover:bg-slate-50 transition-colors flex items-center justify-between"
                          >
                            Join meeting
                            <LinkIcon size={16} className="opacity-50" />
                          </button>
                        )}
                      </div>
                    </div>

                    <div>
                      <h3 className="text-[11px] font-bold text-slate-400 uppercase tracking-wider mb-2">Upcoming ({upcomingEvents.length})</h3>
                      <div className="space-y-1">
                        {upcomingEvents.slice(0, 2).map((event) => {
                          const eventDate = event?.dueDate ? new Date(event.dueDate) : null;
                          const hasDate = eventDate && !Number.isNaN(eventDate.getTime());
                          const dateLabel = hasDate ? eventDate.toLocaleDateString(undefined, { month: 'short', day: 'numeric' }) : 'Upcoming';
                          return (
                            <div key={event.id} className="group flex items-center justify-between p-2 -mx-2 rounded-lg hover:bg-slate-50 cursor-pointer">
                              <div className="flex flex-col">
                                <span className="text-[13px] font-medium text-slate-800">{event.title}</span>
                                <span className="text-[11px] text-slate-500 mt-0.5">{dateLabel}</span>
                              </div>
                              <button onClick={() => startMeetingNow(generateRoomCode())} className="opacity-0 group-hover:opacity-100 px-2.5 py-1 bg-violet-50 text-violet-600 rounded-md text-[11px] font-semibold transition-opacity">Start</button>
                            </div>
                          );
                        })}
                      </div>
                    </div>

                    <div>
                      <h3 className="text-[11px] font-bold text-slate-400 uppercase tracking-wider mb-2">Recent (3)</h3>
                      <div className="space-y-1">
                        {[
                          { id: 1, title: 'Weekly Sync', date: 'Yesterday', avatars: ['https://i.pravatar.cc/150?u=a042581f4e29026024d', 'https://i.pravatar.cc/150?u=a042581f4e29026704d'] },
                          { id: 2, title: 'Design Review', date: 'Mon', avatars: ['https://i.pravatar.cc/150?u=a04258114e29026702d'] },
                          { id: 3, title: 'Planning', date: 'Last week', avatars: ['https://i.pravatar.cc/150?u=a042581f4e29026024d', 'https://i.pravatar.cc/150?u=a04258a2462d826712d'] }
                        ].map((recent) => (
                          <div key={recent.id} className="group flex items-center justify-between p-2 -mx-2 rounded-lg hover:bg-slate-50 cursor-pointer" onClick={() => openMeetingSetup('recent-room')}>
                            <div className="flex flex-col">
                              <span className="text-[13px] font-medium text-slate-800">{recent.title}</span>
                              <span className="text-[11px] text-slate-500 mt-0.5">{recent.date}</span>
                            </div>
                            <div className="flex -space-x-1.5 opacity-60 group-hover:opacity-100 transition-opacity">
                              {recent.avatars.map((src, i) => (
                                <img key={i} src={src} className="w-5 h-5 rounded-full border border-white" alt="Avatar" />
                              ))}
                            </div>
                          </div>
                        ))}
                      </div>
                    </div>
                  </div>
`;
  
  const newContent = content.substring(0, startIdx) + replacement + content.substring(lastClosingTags);
  fs.writeFileSync(file, newContent, 'utf8');
  console.log('Replacement successful');
} else {
  console.log('Markers not found');
}
