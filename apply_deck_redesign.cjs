const fs = require('fs');

const appPath = 'src/App.jsx';
let content = fs.readFileSync(appPath, 'utf8');

// 1. Add createTitleSlide and createTemplateSlide functions
const createTitleSlideFn = `
function createTitleSlide(id, theme = 'light') {
  const isDark = theme === 'dark';
  return {
    id: \`slide-\${id}\`,
    layout: 'title',
    background: isDark ? '#111827' : '#ffffff',
    elements: [
      { id: \`title-\${id}\`, type: 'text', content: 'Presentation Title', x: 100, y: 300, w: 800, h: 100, style: { fontSize: 64, fontWeight: 700, color: isDark ? '#ffffff' : '#111827', textAlign: 'center' } },
      { id: \`subtitle-\${id}\`, type: 'text', content: 'Subtitle goes here', x: 200, y: 420, w: 600, h: 60, style: { fontSize: 32, fontWeight: 400, color: isDark ? '#9CA3AF' : '#4B5563', textAlign: 'center' } }
    ]
  };
}
`;

if (!content.includes('function createTitleSlide(')) {
    const blankFnIndex = content.indexOf('function createBlankDeckSlide(id) {');
    if (blankFnIndex !== -1) {
        content = content.substring(0, blankFnIndex) + createTitleSlideFn + content.substring(blankFnIndex);
    }
}

// 2. Add isTemplateModalOpen state
const stateInsertIdx = content.indexOf('const [shareModalOpen, setShareModalOpen] = useState(false);');
if (stateInsertIdx !== -1 && !content.includes('isTemplateModalOpen')) {
    content = content.substring(0, stateInsertIdx) + 'const [isTemplateModalOpen, setIsTemplateModalOpen] = useState(true);\n  ' + content.substring(stateInsertIdx);
}

// 3. Update deckSlidesData initial state to just be the title slide
const searchState = 'const [deckSlidesData, setDeckSlidesData] = useState([';
const stateIdx = content.indexOf(searchState);
if (stateIdx !== -1) {
    const endStateIdx = content.indexOf(']);', stateIdx);
    const newState = `const [deckSlidesData, setDeckSlidesData] = useState([\n    { ...createTitleSlide(1), section: 'Opening', title: 'Title Slide', headline: 'Presentation Title', blurb: 'Subtitle goes here', presetKey: 'blank', footer: '' }\n  ]);`;
    content = content.substring(0, stateIdx) + newState + content.substring(endStateIdx + 3);
}

// 4. Update Deck Toolbar to include "Templates" button
const presentBtnHTML = `<button type="button" onClick={handlePresentDeck} className="flex items-center gap-1.5 px-4 py-2 rounded-xl bg-white shadow-sm border border-gray-100 text-gray-700 hover:bg-gray-50 transition-colors font-semibold">
                            <MonitorPlay size={14} />
                            <span>Present</span>
                          </button>`;

const insertTemplatesBtn = `<button type="button" onClick={() => setIsTemplateModalOpen(true)} className="flex items-center gap-1.5 px-4 py-2 rounded-xl bg-white shadow-sm border border-gray-100 text-gray-700 hover:bg-gray-50 transition-colors font-semibold">
                            <Layout size={14} />
                            <span>Templates</span>
                          </button>
                          ` + presentBtnHTML;

if (!content.includes('>Templates</span>')) {
    content = content.replace(presentBtnHTML, insertTemplatesBtn);
}

// 5. Inject TemplatePickerModal component near ShareModal
const modalCode = fs.readFileSync('modal_code.txt', 'utf8');

if (!content.includes('Presentation Templates')) {
    const shareModalInsert = content.lastIndexOf('{shareModalOpen && (');
    if (shareModalInsert !== -1) {
        content = content.substring(0, shareModalInsert) + modalCode + '\\n      ' + content.substring(shareModalInsert);
    }
}

fs.writeFileSync(appPath, content, 'utf8');
console.log('Deck redesign applied safely.');
