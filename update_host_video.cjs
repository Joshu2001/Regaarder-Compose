const fs = require('fs');
const file = 'c:\\Users\\user\\Downloads\\Project MOAT\\Regaarder Compose\\src\\App.jsx';
let content = fs.readFileSync(file, 'utf8');

const target = `<img src={meetingParticipants[0]?.img || "https://images.unsplash.com/photo-1534528741775-53994a69daeb"} className="w-full h-full object-cover" alt="Host" />`;
const replacement = `{isRoomCameraOn && localStream ? (
          <LocalVideoFeed stream={localStream} isCameraOn={isRoomCameraOn} />
        ) : (
          <img src={meetingParticipants[0]?.img || "https://images.unsplash.com/photo-1534528741775-53994a69daeb"} className="w-full h-full object-cover" alt="Host" />
        )}`;

content = content.replace(target, replacement);

fs.writeFileSync(file, content, 'utf8');
console.log('Replaced Host img with LocalVideoFeed');
