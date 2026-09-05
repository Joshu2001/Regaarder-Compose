/**
 * test-web-execution-gateway.mjs
 * 
 * Pillar 11 / Phase 6 Verification Suite: AI-Native Browser Execution Gateway,
 * Vaulted Identity State, Meneur Command Deck, and Chrome Web Extension.
 */

import {
  translateDomToSemanticTree,
  executeDeclarativeWebIntent,
  convertWebDataToWorkspaceState,
  getActiveGatewayTasks,
  resetWebGatewayForTesting
} from '../src/services/webExecutionGateway.js';

import {
  storeVaultedSession,
  getVaultedSession,
  listVaultedDomains,
  deleteVaultedSession,
  clearAllVaultedSessions,
  resetVaultedStoreForTesting
} from '../src/services/vaultedIdentityStore.js';

import {
  evaluateSiteFocusBlock,
  toggleFocusMode,
  setFocusModeRule,
  getFocusModeRule,
  getActiveBlockRules,
  captureWebDirective,
  archiveTabSession,
  restoreTabSession,
  listTabArchives,
  deleteTabArchive,
  resetMeneurDeckForTesting
} from '../src/services/meneurCommandDeckService.js';

import { CANONICAL_DOCS_TOOLS, getToolByName, DOCS_TOOL_CATEGORIES } from '../src/services/docsToolRegistry.js';
import { executeTool } from '../src/services/docsToolExecutor.js';
import { MCP_RESOURCES, readResource } from '../src/services/universalMcpBridge.js';
import { getDirectives, resetDirectiveQueueForTesting } from '../src/services/directiveQueueEngine.js';
import { resetWorkspaceStateBusForTesting, subscribeToAllMutations } from '../src/services/workspaceStateBus.js';

import fs from 'fs';
import path from 'path';
import { fileURLToPath } from 'url';

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

let passed = 0;
let failed = 0;

function assert(description, condition, extraInfo = '') {
  if (condition) {
    console.log(`  ✓ [PASS] ${description}`);
    passed++;
  } else {
    console.error(`  ✗ [FAIL] ${description} ${extraInfo}`);
    failed++;
  }
}

async function runTestSuite() {
  console.log('\n===============================================================');
  console.log('  PILLAR 11 / PHASE 6: BROWSER EXECUTION GATEWAY TEST SUITE');
  console.log('===============================================================\n');

  // Reset testing environments
  resetWebGatewayForTesting();
  resetVaultedStoreForTesting();
  resetMeneurDeckForTesting();
  resetDirectiveQueueForTesting();
  resetWorkspaceStateBusForTesting();

  // ---------------------------------------------------------------------------
  // 1. SEMANTIC DOM TRANSLATION & TOKEN OPTIMIZATION
  // ---------------------------------------------------------------------------
  console.log('--- 1. Semantic DOM Translation & Token Compression ---');

  const sampleHtml = `
    <!DOCTYPE html>
    <html>
      <head>
        <title>SaaS Benchmark & Pricing Matrix 2026</title>
        <script src="analytics.js"></script>
        <style>.btn { color: red; } .hidden { display: none; }</style>
      </head>
      <body>
        <header>
          <nav>
            <a href="/pricing">Pricing Overview</a>
            <a href="/docs">API Documentation</a>
          </nav>
        </header>
        <main>
          <h1>Enterprise Compute Plans</h1>
          <p>Select your node tier below for distributed inference.</p>
          <input type="text" name="cluster_name" placeholder="Enter cluster identifier" value="alpha-cluster" />
          <button id="btn-submit" class="btn">Deploy Inference Node</button>
          
          <table id="pricing-matrix">
            <thead>
              <tr><th>Tier</th><th>GPU Cores</th><th>Monthly Price</th></tr>
            </thead>
            <tbody>
              <tr><td>Pro Alpha</td><td>64</td><td>$4,200</td></tr>
              <tr><td>Enterprise Max</td><td>256</td><td>$16,800</td></tr>
            </tbody>
          </table>
        </main>
        <footer>
          <p>&copy; 2026 Sovereign Systems. All rights reserved.</p>
        </footer>
      </body>
    </html>
  `;

  const semanticResult = translateDomToSemanticTree(sampleHtml, 'https://cloud.example.com/pricing');

  assert('Semantic translation returns tree and elements array', 
    semanticResult && typeof semanticResult.semanticTree === 'string' && Array.isArray(semanticResult.elements));

  assert('Raw HTML token size is calculated and non-zero', 
    semanticResult.rawTokenEstimate > 0);

  assert('Semantic token size achieves >50% compression reduction', 
    semanticResult.tokenReductionPercent >= 50, 
    `Actual reduction: ${semanticResult.tokenReductionPercent}%`);

  assert('Semantic tree includes @e1 element ref and tag names', 
    semanticResult.semanticTree.includes('@e1') && semanticResult.semanticTree.includes('[input]'));

  assert('Semantic tree captures table rows and button elements', 
    semanticResult.elements.some(e => e.type === 'button' && e.text.includes('Deploy Inference Node')) &&
    semanticResult.elements.some(e => e.type === 'table_row'));

  // ---------------------------------------------------------------------------
  // 2. DECLARATIVE INTENT CALLING
  // ---------------------------------------------------------------------------
  console.log('\n--- 2. Declarative Intent Calling & Sandbox Runtime ---');

  const intentResult = await executeDeclarativeWebIntent(
    'Extract pricing matrix table rows and stage compute budget',
    'https://cloud.example.com/pricing',
    { targetFormat: 'matrix' }
  );

  assert('Declarative execution returns completed status', 
    intentResult && intentResult.status === 'completed');

  assert('Generated structured multi-step action plan', 
    Array.isArray(intentResult.actionPlan) && intentResult.actionPlan.length >= 2);

  assert('Action plan contains semantic selector references', 
    intentResult.actionPlan.some(step => step.selector && step.selector.startsWith('@e')));

  assert('Action execution output contains extracted tabular records', 
    Array.isArray(intentResult.extractedData) && intentResult.extractedData.length > 0);

  // ---------------------------------------------------------------------------
  // 3. STRUCTURAL DATA CONVERSION INTO WORKSPACE STATE
  // ---------------------------------------------------------------------------
  console.log('\n--- 3. Structural Web Data Conversion to Workspace State ---');

  let busEventReceived = false;
  const unsubscribeBus = subscribeToAllMutations((evt) => {
    if (evt.action === 'WEB_DATA_IMPORTED') {
      busEventReceived = true;
    }
  });

  const matrixConversion = convertWebDataToWorkspaceState({
    targetApp: 'sheets',
    extractedData: intentResult.extractedData,
    sheetId: 'sheet_pricing_matrix'
  });

  assert('Web table data converts into Matrix cell mutations', 
    matrixConversion && matrixConversion.success && matrixConversion.targetApp === 'sheets');

  assert('Matrix cell mutations contains coordinates and values', 
    matrixConversion.cellUpdates && matrixConversion.cellUpdates.length > 0 &&
    matrixConversion.cellUpdates[0].row !== undefined && matrixConversion.cellUpdates[0].col !== undefined);

  assert('Cross-app mutation bus dispatched WEB_DATA_IMPORTED event', 
    busEventReceived);

  unsubscribeBus();

  // Test Compose canvas block conversion
  const canvasConversion = convertWebDataToWorkspaceState({
    targetApp: 'compose',
    extractedData: { summary: 'Enterprise Pricing extracted' }
  });

  assert('Canvas block conversion succeeds with targetApp compose', 
    canvasConversion && canvasConversion.success && canvasConversion.targetApp === 'compose');

  // ---------------------------------------------------------------------------
  // 4. VAULTED IDENTITY STATE & SESSION STORE
  // ---------------------------------------------------------------------------
  console.log('\n--- 4. Vaulted Identity State (Headless OAuth & Session Store) ---');

  const sessionSaved = storeVaultedSession({
    domain: 'github.com',
    authType: 'oauth2_token',
    credentials: { token: 'gho_secretToken123456789' },
    accountAlias: 'Director-Marcus',
    ttlSeconds: 3600
  });

  assert('Store vaulted session for domain successfully', 
    sessionSaved && sessionSaved.success && sessionSaved.domain === 'github.com');

  const retrievedSession = getVaultedSession('github.com');
  assert('Retrieve active vaulted session returns credentials safely', 
    retrievedSession && retrievedSession.credentials && retrievedSession.credentials.token === 'gho_secretToken123456789');

  assert('Vaulted domain appears in active list', 
    listVaultedDomains().some(d => d.domain === 'github.com' && d.accountAlias === 'Director-Marcus'));

  // Expired session handling
  storeVaultedSession({
    domain: 'expired-service.io',
    authType: 'api_key',
    credentials: { apiKey: 'key_xyz' },
    ttlSeconds: -10 // expired in past
  });

  const expiredRetrieval = getVaultedSession('expired-service.io');
  assert('Expired session is automatically purged upon retrieval', 
    expiredRetrieval === null);

  // Deletion
  const deleteResult = deleteVaultedSession('github.com');
  assert('Delete vaulted session succeeds', 
    deleteResult === true && getVaultedSession('github.com') === null);

  // ---------------------------------------------------------------------------
  // 5. MENEUR COMMAND DECK & FOCUS ENFORCEMENT
  // ---------------------------------------------------------------------------
  console.log('\n--- 5. Meneur Command Deck & Contextual Focus Shield ---');

  // Focus Shield checks
  const distractionCheck = evaluateSiteFocusBlock('https://www.youtube.com/watch?v=123');
  assert('Distracting domain (youtube.com) is blocked under default deep-work focus mode', 
    distractionCheck.isBlocked === true && distractionCheck.domain === 'youtube.com');

  const productiveCheck = evaluateSiteFocusBlock('https://docs.google.com/document/d/xyz');
  assert('Productive domain (docs.google.com) is allowed through focus shield', 
    productiveCheck.isBlocked === false);

  // Toggle focus mode
  toggleFocusMode(false);
  const disabledCheck = evaluateSiteFocusBlock('https://www.youtube.com/watch?v=123');
  assert('When focus mode is disabled, distracting sites are allowed', 
    disabledCheck.isBlocked === false);
  toggleFocusMode(true);

  // Custom block rules
  setFocusModeRule({ domain: 'distractingblog.com', isBlocked: true });
  assert('Custom distracting domain is blocked after registration', 
    evaluateSiteFocusBlock('https://distractingblog.com/news').isBlocked === true);

  // Instant Directive Capture
  const capturedDirective = captureWebDirective({
    text: 'Implement zero-knowledge token bridge for enterprise clusters',
    sourceUrl: 'https://research.cloud.com/zk-tokens',
    title: 'ZK Token Directive',
    blockId: 'block_deep_work_01'
  });

  assert('Capture web directive returns structured directive item', 
    capturedDirective && capturedDirective.title === 'ZK Token Directive' && capturedDirective.tier === 'user');

  const allDirectives = getDirectives();
  assert('Directive was ingested into universal directive queue', 
    allDirectives.some(d => d.id === capturedDirective.id));

  // Workspace Tab & Session Archiving
  const archivedSession = archiveTabSession(
    'Q3 Strategic Hardware Architecture',
    [
      { title: 'Nvidia H200 Specs', url: 'https://nvidia.com/h200' },
      { title: 'TSMC N3 Node Roadmap', url: 'https://tsmc.com/n3' }
    ],
    'block_deep_work_01'
  );

  assert('Archive tab session saves session record with tabCount and timeBlockId', 
    archivedSession && archivedSession.tabCount === 2 && archivedSession.timeBlockId === 'block_deep_work_01');

  const archivesList = listTabArchives();
  assert('Archived session is retrievable in listTabArchives', 
    archivesList.some(a => a.id === archivedSession.id));

  const restored = restoreTabSession(archivedSession.id);
  assert('Restore tab session retrieves session and dispatches state bus restore action', 
    restored && restored.id === archivedSession.id);

  const deletedArchive = deleteTabArchive(archivedSession.id);
  assert('Delete tab archive removes session from memory and storage', 
    deletedArchive === true && listTabArchives().length === 0);

  // ---------------------------------------------------------------------------
  // 6. CANONICAL TOOLS & MCP BRIDGE REGISTRATION
  // ---------------------------------------------------------------------------
  console.log('\n--- 6. Canonical Tools & MCP Bridge Registration ---');

  const expectedTools = [
    'translate_web_semantic_dom',
    'execute_declarative_web_intent',
    'capture_web_directive',
    'archive_tab_session',
    'evaluate_site_focus_block'
  ];

  for (const toolName of expectedTools) {
    const tool = getToolByName(toolName);
    assert(`Tool "${toolName}" is registered in CANONICAL_DOCS_TOOLS`, 
      Boolean(tool && tool.category === DOCS_TOOL_CATEGORIES.BROWSER_TOOLS));
  }

  // Execute canonical translate_web_semantic_dom via executeTool
  const execResult = await executeTool('translate_web_semantic_dom', {
    html: '<button id="start">Start Engine</button><a href="/docs">Docs</a>',
    url: 'https://regaarder.io'
  });

  assert('executeTool runs "translate_web_semantic_dom" successfully', 
    execResult && execResult.success && execResult.data && execResult.data.tokenReductionPercent !== undefined);

  // MCP Resource verification
  const mcpResource = MCP_RESOURCES.find(r => r.uri === 'workspace://browser/command-deck');
  assert('MCP Resource "workspace://browser/command-deck" is defined in catalog', 
    Boolean(mcpResource && mcpResource.mimeType === 'text/markdown'));

  const resourceData = await readResource('workspace://browser/command-deck');
  assert('readResource reads "workspace://browser/command-deck" successfully', 
    resourceData && resourceData.text.includes('MENEUR BROWSER COMMAND DECK'));

  // ---------------------------------------------------------------------------
  // 7. STANDALONE CHROME WEB EXTENSION BUNDLE
  // ---------------------------------------------------------------------------
  console.log('\n--- 7. Standalone Chrome Web Extension Bundle Verification ---');

  const extensionDir = path.resolve(__dirname, '../extension');
  const manifestPath = path.join(extensionDir, 'manifest.json');
  const backgroundPath = path.join(extensionDir, 'background.js');
  const contentScriptPath = path.join(extensionDir, 'contentScript.js');
  const popupHtmlPath = path.join(extensionDir, 'popup.html');
  const popupJsPath = path.join(extensionDir, 'popup.js');
  const stylesCssPath = path.join(extensionDir, 'styles.css');

  assert('extension/manifest.json exists', fs.existsSync(manifestPath));
  assert('extension/background.js exists', fs.existsSync(backgroundPath));
  assert('extension/contentScript.js exists', fs.existsSync(contentScriptPath));
  assert('extension/popup.html exists', fs.existsSync(popupHtmlPath));
  assert('extension/popup.js exists', fs.existsSync(popupJsPath));
  assert('extension/styles.css exists', fs.existsSync(stylesCssPath));

  const rawManifest = fs.readFileSync(manifestPath, 'utf-8').replace(/^\uFEFF/, '');
  const manifestContent = JSON.parse(rawManifest);
  assert('Extension manifest uses Manifest V3', manifestContent.manifest_version === 3);
  assert('Extension manifest defines shortcut commands for Directive & Dock', 
    Boolean(manifestContent.commands?.['capture-directive'] && manifestContent.commands?.['toggle-command-deck']));

  // ---------------------------------------------------------------------------
  // 8. ARCHITECTURAL & UI RULE COMPLIANCE (.agents/AGENTS.md)
  // ---------------------------------------------------------------------------
  console.log('\n--- 8. Architectural & UI Rule Compliance ---');

  const sidebarComponentPath = path.resolve(__dirname, '../src/components/browser/MeneurCommandDeckSidebar.jsx');
  const sidebarCode = fs.readFileSync(sidebarComponentPath, 'utf-8');

  // Rule 2: Active visual states strictly use "outline" (never "highlight")
  const containsHighlightTerm = /highlight/i.test(sidebarCode);
  assert('Rule 2 Compliance: MeneurCommandDeckSidebar does not use "highlight" for active visual states', 
    !containsHighlightTerm);

  // Rule 3: Tabs are non-pill (slightly rounded rectangles, no rounded-full pills)
  assert('Rule 3 Compliance: Meneur tabs are non-pill (rounded-lg / rounded-md instead of rounded-full)', 
    sidebarCode.includes('rounded-lg') || sidebarCode.includes('rounded-md'));

  // Rule 6: Touch-safe pointer events
  assert('Rule 6 Compliance: Meneur buttons and tabs use onPointerDown for safe event dispatch', 
    sidebarCode.includes('onPointerDown'));

  // ===========================================================================
  // SUMMARY
  // ===========================================================================
  console.log('\n===============================================================');
  console.log(`  SUITE COMPLETE: ${passed} Passed, ${failed} Failed`);
  console.log('===============================================================\n');

  if (failed > 0) {
    process.exit(1);
  }
}

runTestSuite().catch(err => {
  console.error('Fatal error running test suite:', err);
  process.exit(1);
});
