const fs = require('fs');
const file = 'c:\\Users\\user\\Downloads\\Project MOAT\\Regaarder Compose\\src\\App.jsx';
const content = fs.readFileSync(file, 'utf8');

const count = (content.match(/meetingParticipants/g) || []).length;
console.log(`meetingParticipants found ${count} times`);

const match = content.match(/const meetingParticipants\s*=/);
if (match) {
  console.log("Definition found!");
} else {
  console.log("Definition NOT found!");
}
