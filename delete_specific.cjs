const fs = require('fs');
const file = 'c:\\Users\\user\\Downloads\\Project MOAT\\Regaarder Compose\\src\\App.jsx';
let content = fs.readFileSync(file, 'utf8');

const roomUpperTab = "                { key: 'room', label: 'Room' },\n";
content = content.replace(roomUpperTab, '');

const plusMenuItem = "                  { key: 'room', label: 'Room', icon: Video },\n";
content = content.replace(plusMenuItem, '');

const miniSidebarRoom = `        <div
          onClick={() => handleMiniSidebarClick('room')}
          className={\`flex flex-col items-center gap-1 cursor-pointer transition-colors \${
            activeRightTab === 'room' && rightSidebarOpen ? 'text-violet-600' : 'text-gray-400 hover:text-violet-600'
          }\`}
        >
          <div className={\`p-2 rounded-xl transition-all \${activeRightTab === 'room' && rightSidebarOpen ? 'bg-violet-100' : ''}\`}>
            <MonitorPlay size={20} />
          </div>
          <span className="text-[9px] font-semibold">Room</span>
        </div>

`;
content = content.replace(miniSidebarRoom, '');

const miniSidebarFiles = `        <div
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

`;
content = content.replace(miniSidebarFiles, '');

fs.writeFileSync(file, content, 'utf8');
console.log('Removed specific blocks safely');
