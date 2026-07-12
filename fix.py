import sys

filepath = r'C:\Users\user\.gemini\antigravity\worktrees\Project MOAT\swift-axis-dips-23h46\Regaarder Compose\src\App.jsx'

with open(filepath, 'r', encoding='utf-8') as f:
    lines = f.readlines()

new_content = """};

const SummaryModal = ({ isOpen, onClose }) => {
  if (!isOpen) return null;
  return (
    <div className="fixed inset-0 z-[100000] bg-black/10 backdrop-blur-[2px] flex items-center justify-center p-4 animate-in fade-in" onClick={onClose}>
      <div className="bg-white rounded-3xl shadow-2xl w-full max-w-lg overflow-hidden" onClick={e => e.stopPropagation()}>
        <div className="flex items-center justify-between p-6 border-b border-gray-100">
          <h2 className="text-xl font-semibold text-gray-800 flex items-center gap-2"><Sparkles className="text-violet-500" size={24} /> AI Summary</h2>
        </div>
        <div className="p-6">
          <div className="bg-violet-50 text-violet-700 text-sm p-4 rounded-xl mb-4 flex gap-3">
            <Sparkles size={20} className="shrink-0 mt-0.5" />
            <p>Here is a quick summary of what was discussed so far. The AI is still listening and will update this summary.</p>
          </div>
          <ul className="list-disc pl-5 text-gray-600 space-y-2">
            <li>Reviewed last week's metrics and agreed on the next steps for the Q3 campaign.</li>
            <li>Sarah to prepare the slides for tomorrow's all-hands.</li>
            <li>Engineering team is blocked on the new API endpoints, awaiting backend deployment.</li>
          </ul>
        </div>
      </div>
    </div>
  );
};

const MeetingsModal = ({ isOpen, onClose }) => {
  const [meetings, setMeetings] = useState([
    { id: 1, title: 'Design Sync', time: 'Today, 2:00 PM - 3:00 PM' },
    { id: 2, title: 'Weekly Engineering Standup', time: 'Tomorrow, 10:00 AM - 10:30 AM' }
  ]);
  const [editingId, setEditingId] = useState(null);
  const [editTitle, setEditTitle] = useState('');
  const [editTime, setEditTime] = useState('');

  if (!isOpen) return null;

  const handleSave = (id) => {
    if (!editTitle.trim()) return;
    if (id === 'new') {
      setMeetings([...meetings, { id: Date.now(), title: editTitle, time: editTime || 'Time TBD' }]);
    } else {
      setMeetings(meetings.map(m => m.id === id ? { ...m, title: editTitle, time: editTime } : m));
    }
    setEditingId(null);
  };

  const startEdit = (meeting) => {
    setEditingId(meeting.id);
    setEditTitle(meeting.title);
    setEditTime(meeting.time);
  };

  const startAdd = () => {
    setEditingId('new');
    setEditTitle('');
    setEditTime('');
  };

  return (
    <div className="fixed inset-0 z-[100000] bg-black/10 backdrop-blur-[2px] flex items-center justify-center p-4 animate-in fade-in" onClick={onClose}>
      <div className="bg-white rounded-3xl shadow-2xl w-full max-w-md overflow-hidden" onClick={e => e.stopPropagation()}>
        <div className="flex items-center justify-between p-6 border-b border-gray-100">
          <h2 className="text-xl font-semibold text-gray-800 flex items-center gap-2"><Users className="text-violet-500" size={24} /> Upcoming Meetings</h2>
          <button onClick={startAdd} className="p-2 rounded-full hover:bg-gray-100 text-gray-500 transition-colors" disabled={editingId !== null}>
            <Plus size={20} />
          </button>
        </div>
        <div className="p-4 space-y-2 max-h-[60vh] overflow-y-auto thin-scrollbar">
          {editingId === 'new' && (
            <div className="p-4 border border-violet-200 bg-violet-50/50 rounded-2xl mb-4 animate-in fade-in slide-in-from-top-2">
              <input type="text" placeholder="Meeting Title" className="w-full text-sm font-medium text-gray-800 bg-transparent outline-none mb-2 placeholder:text-gray-400" value={editTitle} onChange={e => setEditTitle(e.target.value)} autoFocus />
              <input type="text" placeholder="Time (e.g. Tomorrow, 10:00 AM)" className="w-full text-sm text-gray-500 bg-transparent outline-none mb-3 placeholder:text-gray-400" value={editTime} onChange={e => setEditTime(e.target.value)} onKeyDown={e => e.key === 'Enter' && handleSave('new')} />
              <div className="flex gap-2">
                <button onClick={() => handleSave('new')} className="flex-1 py-1.5 bg-violet-500 text-white text-xs font-medium rounded-lg hover:bg-violet-600 transition-colors">Add Meeting</button>
                <button onClick={() => setEditingId(null)} className="flex-1 py-1.5 bg-white text-gray-600 text-xs font-medium rounded-lg border border-gray-200 hover:bg-gray-50 transition-colors">Cancel</button>
              </div>
            </div>
          )}
          {meetings.map(meeting => (
            editingId === meeting.id ? (
              <div key={meeting.id} className="p-4 border border-violet-200 bg-violet-50/50 rounded-2xl transition-colors">
                <input type="text" className="w-full text-sm font-medium text-gray-800 bg-transparent outline-none mb-2" value={editTitle} onChange={e => setEditTitle(e.target.value)} autoFocus />
                <input type="text" className="w-full text-sm text-gray-500 bg-transparent outline-none mb-3" value={editTime} onChange={e => setEditTime(e.target.value)} onKeyDown={e => e.key === 'Enter' && handleSave(meeting.id)} />
                <div className="flex gap-2">
                  <button onClick={() => handleSave(meeting.id)} className="flex-1 py-1.5 bg-violet-500 text-white text-xs font-medium rounded-lg hover:bg-violet-600 transition-colors">Save</button>
                  <button onClick={() => setEditingId(null)} className="flex-1 py-1.5 bg-white text-gray-600 text-xs font-medium rounded-lg border border-gray-200 hover:bg-gray-50 transition-colors">Cancel</button>
                </div>
              </div>
            ) : (
              <div key={meeting.id} className="group p-4 border border-gray-100 rounded-2xl hover:bg-gray-50 transition-colors flex justify-between items-start cursor-pointer" onClick={() => startEdit(meeting)}>
                <div>
                  <div className="font-medium text-gray-800">{meeting.title}</div>
                  <div className="text-sm text-gray-500 mt-1">{meeting.time}</div>
                </div>
                <button 
                  onClick={(e) => { e.stopPropagation(); setMeetings(meetings.filter(m => m.id !== meeting.id)); }} 
                  className="p-1.5 text-gray-400 hover:text-red-500 hover:bg-red-50 rounded-lg opacity-0 group-hover:opacity-100 transition-all"
                >
                  <Trash2 size={16} />
                </button>
              </div>
            )
          ))}
          {meetings.length === 0 && editingId !== 'new' && (
            <div className="text-center py-8 text-gray-400 text-sm">No upcoming meetings</div>
          )}
        </div>
      </div>
    </div>
  );
};

const RecordingModal = ({ isOpen, onClose }) => {
  if (!isOpen) return null;
  return (
    <div className="fixed inset-0 z-[100000] bg-black/10 backdrop-blur-[2px] flex items-center justify-center p-4 animate-in fade-in" onClick={onClose}>
      <div className="bg-white rounded-3xl shadow-2xl w-full max-w-md overflow-hidden" onClick={e => e.stopPropagation()}>
        <div className="flex items-center justify-between p-6 border-b border-gray-100">
          <h2 className="text-xl font-semibold text-gray-800 flex items-center gap-2"><Disc className="text-red-500" size={24} /> Recording Settings</h2>
        </div>
        <div className="p-6">
          <div className="space-y-4">
            <div className="flex items-center justify-between">
              <div>
                <div className="font-medium text-gray-800">Record Video & Audio</div>
                <div className="text-sm text-gray-500">Capture the main stage and all participants</div>
              </div>
              <div onClick={onClose} className="w-12 h-6 bg-violet-500 rounded-full relative cursor-pointer">
                <div className="absolute right-1 top-1 bg-white w-4 h-4 rounded-full"></div>
              </div>
            </div>
            <div className="flex items-center justify-between">
              <div>
                <div className="font-medium text-gray-800">Include Transcriptions</div>
                <div className="text-sm text-gray-500">Save AI generated transcript with the recording</div>
              </div>
              <div onClick={onClose} className="w-12 h-6 bg-violet-500 rounded-full relative cursor-pointer">
                <div className="absolute right-1 top-1 bg-white w-4 h-4 rounded-full"></div>
              </div>
            </div>
          </div>
          <button onClick={onClose} className="w-full mt-8 py-3 bg-red-50 text-red-600 hover:bg-red-100 rounded-xl font-medium transition-colors">
            Start Recording
          </button>
        </div>
      </div>
    </div>
  );
};

const CalendarModal = ({ isOpen, onClose }) => {
  const [currentDate, setCurrentDate] = useState(new Date(2026, 9, 1)); // October 2026
  const [events, setEvents] = useState({ '2026-10-15': ['Product Launch'] });
  const [selectedDate, setSelectedDate] = useState(null);
  const [newEventTitle, setNewEventTitle] = useState('');

  if (!isOpen) return null;
  
  const days = ['Su', 'Mo', 'Tu', 'We', 'Th', 'Fr', 'Sa'];
  const monthNames = ["January", "February", "March", "April", "May", "June", "July", "August", "September", "October", "November", "December"];
  
  const getDaysInMonth = (year, month) => new Date(year, month + 1, 0).getDate();
  const getFirstDayOfMonth = (year, month) => new Date(year, month, 1).getDay();

  const handlePrevMonth = () => {
    setCurrentDate(new Date(currentDate.getFullYear(), currentDate.getMonth() - 1, 1));
  };

  const handleNextMonth = () => {
    setCurrentDate(new Date(currentDate.getFullYear(), currentDate.getMonth() + 1, 1));
  };

  const daysInMonth = getDaysInMonth(currentDate.getFullYear(), currentDate.getMonth());
  const firstDay = getFirstDayOfMonth(currentDate.getFullYear(), currentDate.getMonth());
  const blanks = Array.from({ length: firstDay }, (_, i) => i);
  const dates = Array.from({ length: daysInMonth }, (_, i) => i + 1);

  const addEvent = () => {
    if (!newEventTitle.trim() || !selectedDate) return;
    const dateStr = `${currentDate.getFullYear()}-${currentDate.getMonth() + 1}-${selectedDate}`;
    setEvents(prev => ({
      ...prev,
      [dateStr]: [...(prev[dateStr] || []), newEventTitle]
    }));
    setNewEventTitle('');
    setSelectedDate(null);
  };

  return (
    <div className="fixed inset-0 z-[100000] bg-black/10 backdrop-blur-[2px] flex items-center justify-center p-4 animate-in fade-in" onClick={onClose}>
      <div className="bg-white rounded-3xl shadow-2xl w-full max-w-sm overflow-hidden p-6" onClick={e => e.stopPropagation()}>
        <div className="flex items-center justify-between mb-6">
          <h2 className="text-xl font-semibold text-gray-800 flex items-center gap-2"><Calendar className="text-violet-500" size={24} /> Calendar</h2>
        </div>
        <div className="flex items-center justify-between mb-4">
          <button onClick={handlePrevMonth} className="p-1 hover:bg-gray-100 rounded-full text-gray-500"><ChevronLeft size={20} /></button>
          <div className="font-medium text-gray-700">{monthNames[currentDate.getMonth()]} {currentDate.getFullYear()}</div>
          <button onClick={handleNextMonth} className="p-1 hover:bg-gray-100 rounded-full text-gray-500"><ChevronRight size={20} /></button>
        </div>
        <div className="grid grid-cols-7 gap-2 mb-2">
          {days.map(day => (
            <div key={day} className="text-center text-xs font-medium text-gray-400">{day}</div>
          ))}
        </div>
        <div className="grid grid-cols-7 gap-2">
          {blanks.map(blank => (
            <div key={`blank-${blank}`} className="text-center p-2 text-sm text-gray-300"></div>
          ))}
          {dates.map(date => {
            const dateStr = `${currentDate.getFullYear()}-${currentDate.getMonth() + 1}-${date}`;
            const hasEvents = events[dateStr] && events[dateStr].length > 0;
            const isSelected = selectedDate === date;
            return (
              <div 
                key={date} 
                onClick={() => setSelectedDate(isSelected ? null : date)}
                className={`relative text-center p-2 text-sm rounded-full cursor-pointer transition-colors flex items-center justify-center
                  ${isSelected ? 'bg-violet-500 text-white font-medium shadow-md hover:bg-violet-600' : 'text-gray-700 hover:bg-gray-100'}`}
              >
                {date}
                {hasEvents && !isSelected && (
                  <div className="absolute bottom-1 w-1 h-1 bg-violet-500 rounded-full"></div>
                )}
              </div>
            );
          })}
        </div>
        {selectedDate && (
          <div className="mt-6 pt-4 border-t border-gray-100 animate-in fade-in slide-in-from-bottom-2">
            <div className="text-sm font-medium text-gray-700 mb-2">
              Events for {monthNames[currentDate.getMonth()]} {selectedDate}
            </div>
            <div className="space-y-2 mb-3">
              {events[`${currentDate.getFullYear()}-${currentDate.getMonth() + 1}-${selectedDate}`]?.map((ev, i) => (
                <div key={i} className="text-xs bg-violet-50 text-violet-700 px-3 py-1.5 rounded-lg flex items-center gap-2">
                  <div className="w-1.5 h-1.5 rounded-full bg-violet-500"></div>
                  {ev}
                </div>
              ))}
              {(!events[`${currentDate.getFullYear()}-${currentDate.getMonth() + 1}-${selectedDate}`] || events[`${currentDate.getFullYear()}-${currentDate.getMonth() + 1}-${selectedDate}`].length === 0) && (
                <div className="text-xs text-gray-400 italic">No events</div>
              )}
            </div>
            <div className="flex gap-2">
              <input 
                type="text" 
                placeholder="Add new event..." 
                className="flex-1 text-xs border border-gray-200 rounded-xl px-3 py-2 outline-none focus:border-violet-500 transition-colors"
                value={newEventTitle}
                onChange={e => setNewEventTitle(e.target.value)}
                onKeyDown={e => e.key === 'Enter' && addEvent()}
              />
              <button onClick={addEvent} className="p-2 bg-violet-50 text-violet-600 rounded-xl hover:bg-violet-100 transition-colors">
                <Plus size={16} />
              </button>
            </div>
          </div>
        )}
      </div>
    </div>
  );
};
"""

out_lines = []
for idx, line in enumerate(lines):
    if idx >= 2415 and idx <= 2418:
        continue
    out_lines.append(line)
    if idx == 2414: # after </>
        out_lines.append(new_content + '\n')

with open(filepath, 'w', encoding='utf-8') as f:
    f.writelines(out_lines)
