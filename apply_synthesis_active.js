import fs from 'fs';
import path from 'path';

const filePath = path.resolve('C:/Users/user/Downloads/Project MOAT/Regaarder Compose/src/App.jsx');
let content = fs.readFileSync(filePath, 'utf-8');
const isCRLF = content.includes('\r\n');

function replaceNormalized(fullText, target, replacement) {
  const normFull = fullText.replace(/\r\n/g, '\n');
  const normTarget = target.replace(/\r\n/g, '\n');
  
  if (!normFull.includes(normTarget)) {
    return { success: false, text: fullText };
  }
  
  const newNorm = normFull.replace(normTarget, replacement.replace(/\r\n/g, '\n'));
  return { success: true, text: isCRLF ? newNorm.replace(/\n/g, '\r\n') : newNorm };
}

const targetDeck = `                                <button
                                  type="button"
                                  onClick={() => showToast('Synthesized context sources into presentation outline')}
                                  className="px-2.5 py-1 text-xs font-semibold rounded-lg bg-violet-600 hover:bg-violet-700 text-white flex items-center gap-1.5 shrink-0 shadow-xs cursor-pointer"
                                >
                                  <Sparkles size={13} /> Synthesize Context
                                </button>`;

const replaceDeck = `                                <button
                                  type="button"
                                  onClick={handleSynthesizeContextSources}
                                  disabled={isComposing}
                                  className={\`px-2.5 py-1 text-xs font-semibold rounded-lg bg-violet-600 hover:bg-violet-700 active:scale-95 text-white flex items-center gap-1.5 shrink-0 shadow-xs cursor-pointer \${isComposing ? 'opacity-70 cursor-wait' : ''}\`}
                                >
                                  {isComposing ? <Loader2 size={13} className="animate-spin" /> : <Sparkles size={13} />} Synthesize Context
                                </button>`;

const res = replaceNormalized(content, targetDeck, replaceDeck);
if (res.success) {
  content = res.text;
  console.log('4. Updated Deck Synthesize Context button successfully.');
  fs.writeFileSync(filePath, content, 'utf-8');
} else {
  console.error('4. Target Deck Synthesize button not found!');
}
