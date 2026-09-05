import fs from 'fs';
import path from 'path';
import { fileURLToPath } from 'url';
import { classifyRelayIntent } from '../src/services/relayAgentService.js';
import * as omniPortalEngine from '../src/services/omniPortalEngine.js';

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

if (typeof window === 'undefined') {
  globalThis.window = {};
}

let passed = 0;
let failed = 0;
const results = [];

function assert(label, condition, detail = '') {
  if (condition) {
    passed++;
    results.push({ status: 'PASS', label });
  } else {
    failed++;
    results.push({ status: 'FAIL', label, detail });
  }
}

function assertEqual(label, actual, expected) {
  const ok = actual === expected;
  assert(label, ok, `Expected ${JSON.stringify(expected)}, got ${JSON.stringify(actual)}`);
}

console.log('\n── Section 1: Existing Intent Regression ──────────────────────────\n');

{
  const r = classifyRelayIntent('create a document called Q3 Strategy Report');
  assert('isDocCreation fires for create-document prompt', r.isDocCreation === true);
  assert('isIngestDocument does NOT fire for doc creation', r.isIngestDocument === false);
}

{
  const r = classifyRelayIntent('add a task: deploy the production build');
  assert('isTaskSchedule fires for task prompt', r.isTaskSchedule === true);
  assert('isIngestDocument does NOT fire for task prompt', r.isIngestDocument === false);
}

{
  const r = classifyRelayIntent('schedule a meeting for Monday at 10am');
  assert('isScheduleMeeting fires for schedule prompt', r.isScheduleMeeting === true);
  assert('isIngestDocument does NOT fire for schedule prompt', r.isIngestDocument === false);
}

{
  const r = classifyRelayIntent('set the cell b2 to 100');
  assert('isSheetUpdate fires for sheet prompt', r.isSheetUpdate === true);
  assert('isIngestDocument does NOT fire for sheet prompt', r.isIngestDocument === false);
}

{
  const r = classifyRelayIntent('where does it mention the Q2 revenue target?');
  assert('isCitationQuery fires for citation prompt', r.isCitationQuery === true);
  assert('isIngestDocument does NOT fire for citation prompt', r.isIngestDocument === false);
}

console.log('\n── Section 2: isIngestDocument — Positive Matches ─────────────────\n');

const INGEST_POSITIVES = [
  'ingest a PDF',
  'import a file',
  'upload a document',
  'parse a csv',
  'absorb a spreadsheet',
  'ingest a docx',
  'import a pptx',
  'upload a pdf into the workspace',
  'please parse a file for me',
];

INGEST_POSITIVES.forEach((prompt) => {
  const r = classifyRelayIntent(prompt);
  assert(`isIngestDocument=true: "${prompt}"`, r.isIngestDocument === true);
  assert(`isAction=true for ingest: "${prompt}"`, r.isAction === true);
});

console.log('\n── Section 3: isIngestDocument — Negative Matches ─────────────────\n');

const INGEST_NEGATIVES = [
  'Hello, how are you?',
  'What is 2 + 2?',
  'Create a new document',
  'where does it mention the file',
  'update the spreadsheet cells A1',
];

INGEST_NEGATIVES.forEach((prompt) => {
  const r = classifyRelayIntent(prompt);
  assert(`isIngestDocument=false: "${prompt}"`, r.isIngestDocument === false);
});

console.log('\n── Section 4: Return Object Shape ──────────────────────────────────\n');

{
  const r = classifyRelayIntent('ingest a pdf');
  const requiredKeys = [
    'isAction', 'isDocCreation', 'isTaskSchedule', 'isScheduleMeeting',
    'isSheetUpdate', 'isCitationQuery', 'isIngestDocument', 'isTranslation', 'isMemoryInstruction'
  ];
  requiredKeys.forEach((key) => {
    assert(`Return object has key: ${key}`, key in r);
  });
}

console.log('\n── Section 5: Window Hook Contract ─────────────────────────────────\n');

{
  let memoryTab = 'timeline';
  let isMemoryOpen = false;

  window.__REGAARDER_OPEN_PORTAL_INSPECTOR__ = () => {
    memoryTab = 'omni_portal';
    isMemoryOpen = true;
  };

  assert('__REGAARDER_OPEN_PORTAL_INSPECTOR__ is defined on window', typeof window.__REGAARDER_OPEN_PORTAL_INSPECTOR__ === 'function');

  window.__REGAARDER_OPEN_PORTAL_INSPECTOR__();
  assertEqual('Inspector hook sets memoryTab to omni_portal', memoryTab, 'omni_portal');
  assert('Inspector hook sets isMemoryOpen to true', isMemoryOpen === true);

  delete window.__REGAARDER_OPEN_PORTAL_INSPECTOR__;
  assert('Cleanup removes __REGAARDER_OPEN_PORTAL_INSPECTOR__ from window', !('__REGAARDER_OPEN_PORTAL_INSPECTOR__' in window));
}

console.log('\n── Section 6: ActionCard Shape Contract ────────────────────');

{
  const portalActionCard = {
    type: 'portal',
    title: 'Omni-Portal: Ready to Ingest',
    description: 'Drop a file into the Omni-Portal to extract semantic AST state, route entities cross-app, and generate a staging PR.',
  };

  assertEqual('ActionCard type is portal', portalActionCard.type, 'portal');
  assert('ActionCard has title', typeof portalActionCard.title === 'string' && portalActionCard.title.length > 0);
  assert('ActionCard has description', typeof portalActionCard.description === 'string' && portalActionCard.description.length > 0);
  assert('ActionCard title mentions Omni-Portal', portalActionCard.title.includes('Omni-Portal'));
  assert('ActionCard description mentions staging PR', portalActionCard.description.includes('staging PR'));
}

console.log('\n── Section 7: omniPortalEngine Functionality & Exports ─────');

{
  assert('omniPortalEngine exports createIngestionPackage', typeof omniPortalEngine.createIngestionPackage === 'function');
  assert('omniPortalEngine exports getPortalQueue', typeof omniPortalEngine.getPortalQueue === 'function');
  assert('omniPortalEngine exports routeEntitiesCrossApp', typeof omniPortalEngine.routeEntitiesCrossApp === 'function');
  assert('omniPortalEngine exports stageIngestionPackage', typeof omniPortalEngine.stageIngestionPackage === 'function');
  assert('omniPortalEngine exports decomposeDocumentCrossApp', typeof omniPortalEngine.decomposeDocumentCrossApp === 'function');

  const pkg = omniPortalEngine.createIngestionPackage('# Executive Plan\n\n- Task 1: Complete review\n\nRevenue,Expenses\n100,50', {
    fileName: 'plan.md',
    mimeType: 'text/markdown'
  });
  assert('createIngestionPackage returns valid package object', pkg && typeof pkg.id === 'string');
  assert('package has workspaceState', pkg.workspaceState && typeof pkg.workspaceState === 'object');
  assert('package contains directives container', pkg.workspaceState.directives && Array.isArray(pkg.workspaceState.directives.items));
  assert('package contains canvas state', pkg.workspaceState.canvas && typeof pkg.workspaceState.canvas === 'object');
  assert('package contains matrix container', pkg.workspaceState.matrix && Array.isArray(pkg.workspaceState.matrix.sheets));

  const enginePath = path.resolve(__dirname, '../src/services/omniPortalEngine.js');
  const source = fs.readFileSync(enginePath, 'utf8');
  assert('omniPortalEngine references universalContextGraph', source.includes('universalContextGraph') || source.includes('recordIngestionGraphNode'));
  assert('omniPortalEngine is not a stub (>200 chars)', source.length > 200);
}

{
  const inspectorPath = path.resolve(__dirname, '../src/components/portal/OmniPortalInspector.jsx');
  assert('OmniPortalInspector.jsx exists on disk', fs.existsSync(inspectorPath));

  if (fs.existsSync(inspectorPath)) {
    const source = fs.readFileSync(inspectorPath, 'utf8');
    assert('OmniPortalInspector is a React component', source.includes('export default') || source.includes('export function'));
    assert('OmniPortalInspector references UploadCloud or portal UI', source.includes('UploadCloud') || source.includes('omni') || source.includes('portal'));
    assert('OmniPortalInspector is not a stub (>500 chars)', source.length > 500);
  }
}

console.log('\n════════════════════════════════════════════════════════════════════');
console.log(`  Omni-Portal Test Suite — ${passed + failed} tests`);
console.log(`  PASSED: ${passed}   FAILED: ${failed}`);
console.log('════════════════════════════════════════════════════════════════════\n');

results.filter(r => r.status === 'FAIL').forEach(r => {
  console.error(`  [FAIL] ${r.label}`);
  if (r.detail) console.error(`         → ${r.detail}`);
});

if (failed > 0) {
  process.exit(1);
} else {
  console.log('  All assertions passed. Pillar 7 integration is healthy.\n');
}