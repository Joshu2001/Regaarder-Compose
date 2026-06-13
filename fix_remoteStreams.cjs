const fs = require('fs');
const file = 'c:\\Users\\user\\Downloads\\Project MOAT\\Regaarder Compose\\src\\App.jsx';
let content = fs.readFileSync(file, 'utf8');

content = content.replace(/remoteStreams\.length > 0 \? \(/g, 'meetingParticipants.length > 0 ? (');
content = content.replace(/\{remoteStreams\.map\(\(s, i\) => \(/g, '{meetingParticipants.map((participant, i) => (');

// Also update the empty state grid to show participant names
content = content.replace(
  /<div className="w-24 h-24 rounded-full bg-emerald-500 flex items-center justify-center text-white text-3xl font-bold">P\{i\+1\}<\/div>/g,
  '<div className="w-24 h-24 rounded-full bg-emerald-500 flex items-center justify-center text-white text-3xl font-bold overflow-hidden"><img src={participant.img} className="w-full h-full object-cover" alt="" /></div>'
);

content = content.replace(
  /<div className="absolute bottom-4 left-4 text-sm font-medium text-white px-2\.5 py-1 bg-black\/40 rounded-lg backdrop-blur-sm">Participant \{i\+1\}<\/div>/g,
  '<div className="absolute bottom-4 left-4 text-sm font-medium text-white px-2.5 py-1 bg-black/40 rounded-lg backdrop-blur-sm">{participant.name}</div>'
);

fs.writeFileSync(file, content, 'utf8');
console.log('Fixed remoteStreams undefined error');
