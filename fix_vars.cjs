const fs = require('fs');
const file = 'c:\\Users\\user\\Downloads\\Project MOAT\\Regaarder Compose\\src\\App.jsx';
let content = fs.readFileSync(file, 'utf8');

const dummyParticipants = `
  const meetingParticipants = [
    { name: "Joshua Sajous", img: "https://images.unsplash.com/photo-1531384441138-2736e62e0919?ixlib=rb-4.0.3&auto=format&fit=crop&w=256&q=80" },
    { name: "Michelle Lee", img: "https://images.unsplash.com/photo-1494790108377-be9c29b29330?ixlib=rb-4.0.3&auto=format&fit=crop&w=256&q=80" },
    { name: "Alex Morgan", img: "https://images.unsplash.com/photo-1500648767791-00dcc994a43e?ixlib=rb-4.0.3&auto=format&fit=crop&w=256&q=80" },
    { name: "Sarah Chen", img: "https://images.unsplash.com/photo-1438761681033-6461ffad8d80?ixlib=rb-4.0.3&auto=format&fit=crop&w=256&q=80" }
  ];
`;

// Inject meetingParticipants if not already present
if (!content.includes('const meetingParticipants =')) {
  const insertIndex = content.indexOf('const renderRoomTopHeader = () =>');
  if (insertIndex !== -1) {
    content = content.slice(0, insertIndex) + dummyParticipants + '\n' + content.slice(insertIndex);
  }
}

// Replace toggleRoomMic with correct logic if toggleRoomMic is undefined?
// Actually toggleRoomMic IS defined! Wait, let's check toggleRoomMic definition!
// The previous output said toggleRoomMic defined: true
// What about toggleRoomCamera? defined: true.
// But isRoomMicOn and isRoomCameraOn are NOT defined.

content = content.replace(/isRoomMicOn/g, '!isMicMuted');
content = content.replace(/isRoomCameraOn/g, '!isVideoOff');

fs.writeFileSync(file, content, 'utf8');
console.log('Fixed undefined variables in App.jsx');
