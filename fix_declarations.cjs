const fs = require('fs');
const file = 'c:\\Users\\user\\Downloads\\Project MOAT\\Regaarder Compose\\src\\App.jsx';
let content = fs.readFileSync(file, 'utf8');

content = content.replace('const [!isMicMuted, setIsRoomMicOn] = useState(true);', 'const [isRoomMicOn, setIsRoomMicOn] = useState(true);');
content = content.replace('const [!isVideoOff, setIsRoomCameraOn] = useState(true);', 'const [isRoomCameraOn, setIsRoomCameraOn] = useState(true);');

fs.writeFileSync(file, content, 'utf8');
console.log('Fixed broken useState declarations');
