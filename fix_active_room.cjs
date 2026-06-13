const fs = require('fs');
const file = 'c:\\Users\\user\\Downloads\\Project MOAT\\Regaarder Compose\\src\\App.jsx';
let content = fs.readFileSync(file, 'utf8');

// Replace auto join
content = content.replace(`    didAutoJoinRoomRef.current = true;
    setActiveRightTab('room');
    joinRoom(meetingCode);`, `    didAutoJoinRoomRef.current = true;
    createRoomExperience();
    joinRoom(meetingCode);`);

// Replace invite button
content = content.replace(`                      setActiveRightTab('room');
                      setIsRoomInviteModalOpen(true);`, `                      createRoomExperience();
                      setIsRoomInviteModalOpen(true);`);

// For the switch statement, we can just remove the case 'room' or let the early return handle it. Let's just replace it.
content = content.replace(`      case 'room':
        setActivePrimaryNav('home');
        setRoomState('lobby');
        setActiveRightTab('room');
        break;`, `      case 'room':
        setActivePrimaryNav('home');
        setRoomState('lobby');
        createRoomExperience();
        break;`);

fs.writeFileSync(file, content, 'utf8');
console.log('Fixed setActiveRightTab calls');
