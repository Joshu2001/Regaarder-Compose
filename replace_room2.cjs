const fs = require('fs');
const path = require('path');
const file = 'c:\\Users\\user\\Downloads\\Project MOAT\\Regaarder Compose\\src\\App.jsx';
let content = fs.readFileSync(file, 'utf8');

const startMarker = '<div className="flex-1 overflow-y-auto thin-scrollbar px-5 py-6 bg-white space-y-8">';
const endMarker = '{roomState === \'lobby\' && isRoomInviteModalOpen && (';

const startIdx = content.indexOf(startMarker);
const endIdx = content.indexOf(endMarker, startIdx);

if (startIdx !== -1 && endIdx !== -1) {
  const preEndText = content.substring(0, endIdx);
  const lastClosingTags = preEndText.lastIndexOf('                </div>\n              )}');
  
  const replacement = `                  <div className="flex-1 overflow-y-auto thin-scrollbar px-4 py-5 space-y-6 bg-white">
                    <div className="text-left">
                      <h3 className="text-[14px] font-semibold text-slate-900 tracking-tight">No active meeting</h3>
                      <p className="text-[12px] text-slate-500 mt-1">Start a meeting or join a room to collaborate.</p>
                    </div>

                    <div className="space-y-2.5">
                      <button
                        type="button"
                        onClick={() => startMeetingNow(generateRoomCode())}
                        className="w-full text-left px-4 py-2.5 rounded-xl bg-violet-600 text-white text-[13px] font-medium hover:bg-violet-700 transition-colors flex items-center justify-center gap-2"
                      >
                        <MonitorPlay size={15} />
                        Start meeting
                      </button>
                      
                      {isRoomStartMenuOpen ? (
                        <div className="flex gap-2">
                          <input
                            ref={roomJoinInputRef}
                            type="text"
                            value={joinCode}
                            onChange={(e) => setJoinCode(e.target.value)}
                            placeholder="Enter code"
                            className="flex-1 rounded-xl border border-slate-200 px-3 py-2 text-[13px] focus:outline-none focus:border-violet-500 focus:ring-1 focus:ring-violet-500"
                            onKeyDown={(e) => {
                              if (e.key === 'Enter' && joinCode.trim()) openMeetingSetup(joinCode.trim());
                            }}
                          />
                          <button onClick={() => joinCode.trim() && openMeetingSetup(joinCode.trim())} className="px-4 py-2 rounded-xl bg-violet-50 text-violet-700 text-[13px] font-medium hover:bg-violet-100 transition-colors">Join</button>
                        </div>
                      ) : (
                        <button
                          type="button"
                          onClick={() => setIsRoomStartMenuOpen(true)}
                          className="w-full text-left px-4 py-2.5 rounded-xl border border-slate-200 bg-white text-slate-700 text-[13px] font-medium hover:bg-slate-50 transition-colors flex items-center justify-center gap-2"
                        >
                          <LinkIcon size={15} />
                          Join meeting
                        </button>
                      )}

                      <button
                        type="button"
                        onClick={() => setIsRoomInviteModalOpen(true)}
                        className="w-full text-left px-4 py-2.5 rounded-xl border border-slate-200 bg-white text-slate-700 text-[13px] font-medium hover:bg-slate-50 transition-colors flex items-center justify-center gap-2"
                      >
                        <UserPlus size={15} />
                        Invite people
                      </button>
                    </div>

                    <div>
                      <div className="flex items-center justify-between mb-3">
                        <h3 className="text-[13px] font-semibold text-slate-900">Upcoming</h3>
                        <button type="button" className="text-[11px] font-medium text-violet-600 hover:text-violet-700">View calendar</button>
                      </div>
                      <div className="space-y-2">
                        {upcomingEvents.slice(0, 1).map((event) => {
                          const eventDate = event?.dueDate ? new Date(event.dueDate) : null;
                          return (
                            <div key={event.id} className="rounded-xl border border-slate-200 p-3 bg-white">
                              <div className="flex items-start gap-3">
                                <div className="w-8 h-8 rounded-lg bg-violet-50 text-violet-600 flex items-center justify-center shrink-0">
                                  <Calendar size={15} />
                                </div>
                                <div className="flex-1 min-w-0">
                                  <div className="text-[13px] font-semibold text-slate-900 truncate">{event.title}</div>
                                  <div className="text-[11px] text-slate-500 mt-0.5">May 15 ¡E 10:00 AM</div>
                                  <div className="flex items-center justify-between mt-3">
                                    <div className="flex items-center -space-x-1.5">
                                      <img src="https://i.pravatar.cc/150?u=a042581f4e29026024d" className="w-5 h-5 rounded-full border border-white" alt="Avatar" />
                                      <img src="https://i.pravatar.cc/150?u=a042581f4e29026704d" className="w-5 h-5 rounded-full border border-white" alt="Avatar" />
                                      <img src="https://i.pravatar.cc/150?u=a04258114e29026702d" className="w-5 h-5 rounded-full border border-white" alt="Avatar" />
                                      <span className="ml-2 text-[10px] font-medium text-slate-500">+1</span>
                                    </div>
                                    <button onClick={() => startMeetingNow(generateRoomCode())} className="px-3 py-1.5 bg-violet-50 hover:bg-violet-100 text-violet-700 rounded-lg text-[11px] font-semibold transition-colors">Join</button>
                                  </div>
                                </div>
                              </div>
                            </div>
                          );
                        })}
                      </div>
                    </div>

                    <div>
                      <div className="flex items-center justify-between mb-3">
                        <h3 className="text-[13px] font-semibold text-slate-900">Recent rooms</h3>
                        <button type="button" className="text-[11px] font-medium text-violet-600 hover:text-violet-700">See all</button>
                      </div>
                      <div className="space-y-1">
                        {[
                          { id: 1, title: 'Q2 Launch Strategy', date: 'May 12 ¡E 2:30 PM', avatars: ['https://i.pravatar.cc/150?u=a042581f4e29026024d', 'https://i.pravatar.cc/150?u=a042581f4e29026704d'], extra: '+2' },
                          { id: 2, title: 'Product Review', date: 'May 9 ¡E 11:00 AM', avatars: ['https://i.pravatar.cc/150?u=a04258114e29026702d', 'https://i.pravatar.cc/150?u=a04258a2462d826712d'], extra: '+1' },
                          { id: 3, title: 'Investor Update', date: 'May 7 ¡E 4:00 PM', avatars: ['https://i.pravatar.cc/150?u=a042581f4e29026024d', 'https://i.pravatar.cc/150?u=a042581f4e29026704d'] }
                        ].map((recent) => (
                          <div key={recent.id} className="group flex items-center justify-between p-2 -mx-2 rounded-xl hover:bg-slate-50 cursor-pointer transition-colors" onClick={() => openMeetingSetup('recent-room')}>
                            <div className="flex items-center gap-3 min-w-0">
                              <div className="w-8 h-8 rounded-lg bg-violet-50 text-violet-600 flex items-center justify-center shrink-0">
                                <MonitorPlay size={15} />
                              </div>
                              <div className="flex flex-col min-w-0">
                                <span className="text-[13px] font-semibold text-slate-900 truncate">{recent.title}</span>
                                <span className="text-[11px] text-slate-500 mt-0.5">{recent.date}</span>
                              </div>
                            </div>
                            <div className="flex items-center ml-2 shrink-0">
                              <div className="flex -space-x-1.5">
                                {recent.avatars.map((src, i) => (
                                  <img key={i} src={src} className="w-5 h-5 rounded-full border border-white" alt="Avatar" />
                                ))}
                              </div>
                              {recent.extra && <span className="ml-1 text-[10px] font-medium text-slate-500">{recent.extra}</span>}
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
