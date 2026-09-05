/**
 * test-staging-security-gates.mjs
 * 
 * Phase 4 Verification Suite: Security Clearance Gates, Destructive Tool Sandboxing,
 * and Cherry-Pick Staging Redlines.
 * 
 * Tests:
 * 1. Clearance levels & destructive tool identification
 * 2. Automatic staging diversion for unconfirmed destructive tools in executeTool
 * 3. Granular staged mutation rejection (cherry-pick discard)
 * 4. Cherry-picked mutation commits with state bus synchronization
 * 5. Full branch rejection with state bus notification
 * 6. UI contract compliance (touch-safe pointer handlers, non-pill tabs, outline active states)
 */

import {
  SECURITY_CLEARANCE_LEVELS,
  DESTRUCTIVE_TOOLS,
  isDestructiveTool,
  evaluateSecurityGate,
  computeVisualDiff,
  createStagingBranch,
  stageMutation,
  getActiveBranches,
  getAllBranches,
  getBranchById,
  toggleMutationSelection,
  rejectStagedMutation,
  commitCherryPickedMutations,
  approveAndCommitBranch,
  rejectBranch,
  resetStagingForTesting
} from '../src/services/workspaceStagingEngine.js';

import {
  executeTool,
  clearExecutionLogs,
  getTransactionHistory
} from '../src/services/docsToolExecutor.js';

import {
  subscribeToWorkspaceApp,
  subscribeToAllMutations,
  resetWorkspaceStateBusForTesting,
  WORKSPACE_APP_CHANNELS
} from '../src/services/workspaceStateBus.js';

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
    console.error(`  ✗ [FAIL] ${description} ${extraInfo ? `— ${extraInfo}` : ''}`);
    failed++;
  }
}

function assertEqual(description, actual, expected) {
  assert(description, actual === expected, `Expected: "${expected}", Received: "${actual}"`);
}

console.log('\n================================================================');
console.log(' PHASE 4: SECURITY GATES & STAGING REDLINES TEST SUITE');
console.log('================================================================');

// ── Section 1: Security Clearance Levels & Taxonomy ──────────────────────────
console.log('\n── Section 1: Security Clearance Levels & Taxonomy ───────────');

{
  assertEqual('Clearance STANDARD defined', SECURITY_CLEARANCE_LEVELS.STANDARD, 'STANDARD');
  assertEqual('Clearance HIGH_RISK defined', SECURITY_CLEARANCE_LEVELS.HIGH_RISK, 'HIGH_RISK');
  assertEqual('Clearance CONFIRMATION_REQUIRED defined', SECURITY_CLEARANCE_LEVELS.CONFIRMATION_REQUIRED, 'CONFIRMATION_REQUIRED');
  assertEqual('Clearance STRICT defined', SECURITY_CLEARANCE_LEVELS.STRICT, 'STRICT');

  assert('delete_block is classified as destructive', isDestructiveTool('delete_block'));
  assert('clear_content is classified as destructive', isDestructiveTool('clear_content'));
  assert('clear_document is classified as destructive', isDestructiveTool('clear_document'));
  assert('delete_task is classified as destructive', isDestructiveTool('delete_task'));
  assert('delete_deck_slide is classified as destructive', isDestructiveTool('delete_deck_slide'));
  assert('drop_column is classified as destructive', isDestructiveTool('drop_column'));
  assert('reset_memory is classified as destructive', isDestructiveTool('reset_memory'));
  assert('write_text is NOT classified as destructive', !isDestructiveTool('write_text'));
  assert('format_selection is NOT classified as destructive', !isDestructiveTool('format_selection'));
}

// ── Section 2: Gate Evaluation Logic ─────────────────────────────────────────
console.log('\n── Section 2: Gate Evaluation Logic ──────────────────────────');

{
  const standardEval = evaluateSecurityGate('write_text', { text: 'Hello World' });
  assertEqual('Standard tool clearance is STANDARD', standardEval.clearanceLevel, SECURITY_CLEARANCE_LEVELS.STANDARD);
  assert('Standard tool does not require confirmation', !standardEval.requiresConfirmation);
  assert('Standard tool is not destructive', !standardEval.isDestructive);

  const destructiveEval = evaluateSecurityGate('delete_block', { blockId: 'b_123' });
  assertEqual('Destructive tool clearance is HIGH_RISK', destructiveEval.clearanceLevel, SECURITY_CLEARANCE_LEVELS.HIGH_RISK);
  assert('Destructive tool requires confirmation', destructiveEval.requiresConfirmation);
  assert('Destructive tool is destructive', destructiveEval.isDestructive);

  const strictEval = evaluateSecurityGate('write_text', {}, { isStrictRuleViolation: true });
  assertEqual('Strict rule violation clearance is STRICT', strictEval.clearanceLevel, SECURITY_CLEARANCE_LEVELS.STRICT);
  assert('Strict rule violation requires confirmation', strictEval.requiresConfirmation);
}

// ── Section 3: Automatic Staging Diversion in docsToolExecutor ────────────────
console.log('\n── Section 3: Automatic Staging Diversion in docsToolExecutor ──');

{
  resetStagingForTesting();
  clearExecutionLogs();

  // Test 1: Destructive tool WITHOUT explicit confirmation should be safely diverted to staging
  const unconfirmedDestructive = await executeTool('delete_block', { blockId: 'blk_sec_test' });
  assert('Unconfirmed destructive tool succeeded execution output', unconfirmedDestructive.success);
  assert('Unconfirmed destructive tool was intercepted into staging', unconfirmedDestructive.isStaged);
  assert('Unconfirmed destructive tool has forcedStaging=true', unconfirmedDestructive.forcedStaging);
  assert('Unconfirmed destructive tool requires confirmation', unconfirmedDestructive.requiresConfirmation);
  assertEqual('Clearance is HIGH_RISK', unconfirmedDestructive.securityClearance, SECURITY_CLEARANCE_LEVELS.HIGH_RISK);
  assert('A staging PR was automatically generated', typeof unconfirmedDestructive.prNumber === 'number');

  // Verify staging branch contains the mutation
  const activeBranches = getActiveBranches();
  assert('At least 1 active staging branch exists', activeBranches.length > 0);
  const prBranch = activeBranches.find(b => b.id === unconfirmedDestructive.branchId);
  assert('Staging branch has the staged mutation', prBranch && prBranch.mutations.length === 1);
  assertEqual('Mutation toolName is delete_block', prBranch.mutations[0].toolName, 'delete_block');
  assertEqual('Mutation securityGate clearance is HIGH_RISK', prBranch.mutations[0].securityGate.clearanceLevel, 'HIGH_RISK');

  // Test 2: Destructive tool WITH explicit confirmation passes the gate
  const confirmedDestructive = await executeTool(
    'delete_block', 
    { blockId: 'blk_sec_test_2' }, 
    { confirmed: true }
  );
  assert('Confirmed destructive tool was not diverted to staging', !confirmedDestructive.isStaged);
}

// ── Section 4: Granular Staged Mutation Rejection (Cherry-Pick Discard) ───────
console.log('\n── Section 4: Granular Staged Mutation Rejection ─────────────');

{
  resetStagingForTesting();
  resetWorkspaceStateBusForTesting();

  const stateBusEvents = [];
  const unsubscribe = subscribeToAllMutations((evt) => {
    stateBusEvents.push(evt);
  });

  const branch = createStagingBranch({
    title: 'Multi-step Agent Proposal',
    description: 'Refactoring chapter 1 and deleting deprecated block'
  });

  const mut1 = stageMutation({
    branchId: branch.id,
    targetApp: 'compose',
    targetTitle: 'Introduction Block',
    toolName: 'patch_block',
    params: { blockId: 'b_intro', content: 'Updated Executive Summary' },
    beforeText: 'Draft Executive Summary',
    afterText: 'Updated Executive Summary'
  });

  const mut2 = stageMutation({
    branchId: branch.id,
    targetApp: 'compose',
    targetTitle: 'Deprecated Appendix',
    toolName: 'delete_block',
    params: { blockId: 'b_appendix' },
    beforeText: 'Old Appendix Notes',
    afterText: ''
  });

  const currentBranch = getBranchById(branch.id);
  assertEqual('Branch initially has 2 mutations', currentBranch.mutations.length, 2);

  // Discard only mut2 (the delete mutation)
  const discardResult = rejectStagedMutation(branch.id, mut2.mutationId, 'Director wants to keep appendix');
  assert('Individual mutation discard was successful', discardResult.success);
  assertEqual('Discarded mutation ID matches', discardResult.discardedMutationId, mut2.mutationId);
  assertEqual('Branch now has 1 mutation remaining', discardResult.remainingMutations, 1);
  assertEqual('Branch status is still pending_review', discardResult.branchStatus, 'pending_review');

  // Verify State Bus received STAGING_MUTATION_REJECTED
  const mutationRejectEvent = stateBusEvents.find(e => e.action === 'STAGING_MUTATION_REJECTED');
  assert('State bus received STAGING_MUTATION_REJECTED', Boolean(mutationRejectEvent));
  assertEqual('State bus event has correct mutationId', mutationRejectEvent?.delta?.mutationId, mut2.mutationId);

  // Discard the last remaining mutation (mut1)
  const discardLastResult = rejectStagedMutation(branch.id, mut1.mutationId, 'Discarding all');
  assert('Discarding last mutation succeeds', discardLastResult.success);
  assertEqual('Branch now has 0 mutations', discardLastResult.remainingMutations, 0);
  assertEqual('Branch status automatically becomes rejected', discardLastResult.branchStatus, 'rejected');

  // Verify State Bus received STAGING_PR_REJECTED
  const prRejectEvent = stateBusEvents.find(e => e.action === 'STAGING_PR_REJECTED');
  assert('State bus received STAGING_PR_REJECTED when all mutations discarded', Boolean(prRejectEvent));

  unsubscribe();
}

// ── Section 5: Cherry-Picked Mutation Commits & State Bus Synchronization ─────
console.log('\n── Section 5: Cherry-Picked Commits & State Bus Sync ──────────');

{
  resetStagingForTesting();
  resetWorkspaceStateBusForTesting();

  const committedEvents = [];
  const unsubscribe = subscribeToAllMutations((evt) => {
    if (evt.action === 'STAGING_PR_COMMITTED') {
      committedEvents.push(evt);
    }
  });

  const branch = createStagingBranch({
    title: 'Financial Model Proposal',
    sourceApp: 'sheets',
    targetApps: ['sheets', 'compose']
  });

  const mutA = stageMutation({
    branchId: branch.id,
    targetApp: 'sheets',
    targetTitle: 'Q3 Financials',
    toolName: 'update_cells',
    params: { updates: [{ cell: 'B4', value: '$45,000' }] },
    beforeText: '$30,000',
    afterText: '$45,000'
  });

  const mutB = stageMutation({
    branchId: branch.id,
    targetApp: 'compose',
    targetTitle: 'Budget Summary',
    toolName: 'write_text',
    params: { text: 'Quarterly Revenue jumped 50%' },
    beforeText: 'Quarterly Revenue flat',
    afterText: 'Quarterly Revenue jumped 50%'
  });

  // Cherry-pick only mutA
  const commitResult = await commitCherryPickedMutations(branch.id, [mutA.mutationId]);
  assert('Cherry-picked commit succeeded', commitResult.success);
  assertEqual('Only 1 mutation committed', commitResult.committedCount, 1);
  assertEqual('Branch status changed to approved', getBranchById(branch.id).status, 'approved');

  // Verify state bus received STAGING_PR_COMMITTED event
  assertEqual('State bus received exactly 1 STAGING_PR_COMMITTED event', committedEvents.length, 1);
  assertEqual('State bus event recorded 1 committed mutation', committedEvents[0]?.delta?.committedCount, 1);
  assertEqual('State bus event recorded correct mutationId', committedEvents[0]?.delta?.committedMutationIds[0], mutA.mutationId);

  unsubscribe();
}

// ── Section 6: Full Branch Rejection & State Bus Notification ────────────────
console.log('\n── Section 6: Full Branch Rejection & State Bus Notification ─');

{
  resetStagingForTesting();
  resetWorkspaceStateBusForTesting();

  const rejectEvents = [];
  const unsubscribe = subscribeToAllMutations((evt) => {
    if (evt.action === 'STAGING_PR_REJECTED') {
      rejectEvents.push(evt);
    }
  });

  const branch = createStagingBranch({
    title: 'Experimental Outline Refactor'
  });

  stageMutation({
    branchId: branch.id,
    targetApp: 'compose',
    targetTitle: 'Draft Outline',
    toolName: 'patch_block',
    params: { blockId: 'blk_draft' },
    beforeText: 'Outline 1',
    afterText: 'Outline 2'
  });

  const rejectRes = rejectBranch(branch.id, 'Director rejected full PR');
  assert('Branch rejection succeeded', rejectRes.success);
  assertEqual('Branch status is rejected', rejectRes.status, 'rejected');

  assertEqual('State bus received STAGING_PR_REJECTED', rejectEvents.length, 1);
  assertEqual('Rejection reason recorded', rejectEvents[0]?.delta?.reason, 'Director rejected full PR');

  unsubscribe();
}

// ── Section 7: UI Contract & Architectural Directives Compliance ─────────────
console.log('\n── Section 7: UI Contract Compliance ─────────────────────────');

{
  const modalPath = path.resolve(__dirname, '../src/components/staging/WorkspaceStagingReviewModal.jsx');
  assert('WorkspaceStagingReviewModal.jsx exists', fs.existsSync(modalPath));

  const modalSource = fs.readFileSync(modalPath, 'utf8');

  // Rule 6: Touch-safe React dropdowns / buttons via onPointerDown
  assert(
    'Modal uses touch-safe onPointerDown for view mode toggling',
    modalSource.includes('onPointerDown') && modalSource.includes("setDiffViewMode('unified')")
  );
  assert(
    'Modal uses onPointerDown for Approve action',
    modalSource.includes('onPointerDown={handleApprove}')
  );
  assert(
    'Modal uses onPointerDown for Reject action',
    modalSource.includes('onPointerDown={handleReject}')
  );

  // Rule 2: Active states use "outline", NOT "highlight"
  assert(
    'Active states use "outline" styling keyword',
    modalSource.includes('outline')
  );
  assert(
    'Modal does not use "highlight" for active status',
    !modalSource.toLowerCase().includes('highlight')
  );

  // Rule 3: Navigation tabs are slightly rounded rectangles, NOT pill-shaped
  assert(
    'Tabs do not use rounded-full (pill shape)',
    !modalSource.includes('rounded-full')
  );
  assert(
    'Tabs use executive rounded-md / rounded-lg rectangles',
    modalSource.includes('rounded-md') || modalSource.includes('rounded-lg')
  );

  // Security Clearance Badge integration
  assert(
    'Modal renders security clearance badge with ShieldAlert',
    modalSource.includes('ShieldAlert') && modalSource.includes('clearance')
  );

  // Individual mutation discard
  assert(
    'Modal integrates rejectStagedMutation for cherry-pick discard',
    modalSource.includes('rejectStagedMutation') && modalSource.includes('handleRejectMutation')
  );
}

// ── Summary ──────────────────────────────────────────────────────────────────
console.log('\n================================================================');
console.log(` PHASE 4 TEST RESULTS: ${passed} Passed, ${failed} Failed`);
console.log('================================================================\n');

if (failed > 0) {
  process.exit(1);
} else {
  process.exit(0);
}
