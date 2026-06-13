const fs = require('fs');
const file = 'c:\\Users\\user\\Downloads\\Project MOAT\\Regaarder Compose\\src\\App.jsx';
let content = fs.readFileSync(file, 'utf8');

// Replace:
//      const renderRoomStage = () => {
//      return (
//        {roomState === 'active' && roomPanelMode === 'expanded' && mainView === 'room' && (

// With:
//      const renderRoomStage = () => {
//      return roomState === 'active' && roomPanelMode === 'expanded' && mainView === 'room' && (

content = content.replace(
  "      const renderRoomStage = () => {\n      return (\n        {roomState === 'active' && roomPanelMode === 'expanded' && mainView === 'room' && (",
  "      const renderRoomStage = () => {\n      return roomState === 'active' && roomPanelMode === 'expanded' && mainView === 'room' && ("
);

// We also need to remove the closing `)}` from the end of renderRoomStage!
// The end looks like:
//              title="Resize meeting panel"
//            />
//          )}
//        </div>
//      )}
//          );
//        };

content = content.replace(
  "          )}\n        </div>\n      )}\n    );\n  };",
  "          )}\n        </div>\n      );\n  };"
);

fs.writeFileSync(file, content, 'utf8');
console.log('Fixed syntax in renderRoomStage');
