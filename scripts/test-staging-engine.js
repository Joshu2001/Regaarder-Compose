/**
 * scripts/test-staging-engine.js
 * Comprehensive automated verification for Pillar 3:
 * Human-in-the-Loop "Approval & Sandbox" Engine (Workspace Staging & Diff Engine)
 */

import {
  createStagingBranch,
  stageMutation,
  toggleMutationSelection,
  approveAndCommitBranch,
  rejectBranch,
  getActiveBranches,
  getBranchById,
  computeVisualDiff,
  subscribeToStaging,
  resetStagingForTesting
} from '../src/services/workspaceStagingEngine.js';

import { executeTool } from '../src/services/docsToolExecutor.js';
import { dispatchMcpRequest } from '../src/services/universalMcpBridge.js';

let testsPassed = 0;
let testsTotal = 0;

function assert(condition, message) {
  testsTotal++;
  if (!condition) {
    console.error(`❌ FAIL: ${message}`);
    throw new Error(`Assertion failed: ${message}`);
  }
  console.log(`✅ PASS: ${message}`);
  testsPassed++;
}

async function runTests() {
  console.log('═══════════════════════════════════════════════════════════════════════════');
  console.log('  PILLAR 3: WORKSPACE STAGING & DIFF ENGINE AUTOMATED TEST SUITE');
  console.log('═══════════════════════════════════════════════════════════════════════════\n');

  resetStagingForTesting();

  // Test 1: computeVisualDiff for plain text
  console.log('--- Test 1: computeVisualDiff Redline Text Diff ---');
  const originalText = 'The quarterly revenue reached $5 million in Q3.';
  const updatedText = 'The quarterly revenue reached $12 billion in Q3, exceeding forecasts.';
  const diffResult = computeVisualDiff(originalText, updatedText);

  assert(diffResult !== null, 'diffResult must not be null');
  assert(Array.isArray(diffResult.chunks), 'diffResult.chunks must be an array');
  assert(diffResult.stats.addedChars > 0, 'diffResult must detect added characters');
  assert(diffResult.stats.removedChars > 0, 'diffResult must detect removed characters');
  assert(diffResult.stats.isModified === true, 'diffResult must be marked isModified');

  // Test 2: createStagingBranch
  console.log('\n--- Test 2: createStagingBranch Lifecycle ---');
  let notifiedBranches = [];
  const unsubscribe = subscribeToStaging((branches) => {
    notifiedBranches = branches;
  });

  const branch = createStagingBranch({
    title: 'Q3 Financials Update',
    description: 'Autonomous financial analyst updating Q3 projections across Docs & Sheets',
    agentId: 'relay-financial-analyst-1'
  });

  assert(branch.id && branch.id.startsWith('pr_'), 'Branch ID must be generated with prefix pr_');
  assert(branch.status === 'pending_review', 'Branch status must initially be "pending_review"');
  assert(branch.mutations.length === 0, 'Initial branch must have 0 mutations');
  assert(notifiedBranches.length === 1, 'subscribeToStaging must notify when branch is created');

  // Test 3: stageMutation across Docs, Sheets, and Tasks
  console.log('\n--- Test 3: stageMutation Across Heterogeneous Workspaces ---');
  
  // Doc mutation
  const docMutationRes = stageMutation({
    branchId: branch.id,
    targetApp: 'compose',
    entityId: 'doc-101',
    targetTitle: '2026 Executive Strategy Document',
    toolName: 'replace_text',
    beforeText: 'Target ARR is $10M.',
    afterText: 'Target ARR is $12.5M with 85% gross retention.'
  });

  assert(docMutationRes.mutationId && docMutationRes.mutationId.startsWith('mut_'), 'docMutation ID must start with mut_');
  assert(docMutationRes.mutation.selected === true, 'docMutation must default to selected');
  assert(docMutationRes.mutation.stats && docMutationRes.mutation.stats.addedChars > 0, 'docMutation must have computed diff');

  // Sheet mutation
  const sheetMutationRes = stageMutation({
    branchId: branch.id,
    targetApp: 'sheets',
    entityId: 'sheet-202',
    targetTitle: 'Q3 Financial Projections',
    toolName: 'update_cell',
    beforeText: 'B12: =SUM(B2:B10) -> $450,000',
    afterText: 'B12: =SUM(B2:B11) -> $525,000'
  });

  assert(sheetMutationRes.mutation.targetApp === 'sheets', 'sheetMutation targetApp must be sheets');
  assert(sheetMutationRes.mutation.stats.addedChars > 0, 'sheetMutation diff must be computed');

  // Task mutation
  const taskMutationRes = stageMutation({
    branchId: branch.id,
    targetApp: 'tasks',
    entityId: 'task-303',
    targetTitle: 'Audit Q3 Regulatory Filings',
    toolName: 'create_task',
    beforeText: '',
    afterText: 'Audit Q3 Regulatory Filings | Priority: High | Assignee: Director of Legal'
  });

  assert(taskMutationRes.mutation.targetApp === 'tasks', 'taskMutation targetApp must be tasks');

  const refreshedBranch = getBranchById(branch.id);
  assert(refreshedBranch.mutations.length === 3, 'refreshedBranch must contain 3 staged mutations');
  assert(refreshedBranch.mutations.every(m => m.selected === true), 'all 3 mutations must be selected by default');

  // Test 4: toggleMutationSelection (Cherry-picking)
  console.log('\n--- Test 4: Cherry-picking / Selective Approval ---');
  const toggleResult = toggleMutationSelection(branch.id, sheetMutationRes.mutationId, false);
  assert(toggleResult === true, 'toggleMutationSelection must return true');
  
  const branchAfterToggle = getBranchById(branch.id);
  const selectedCount = branchAfterToggle.mutations.filter(m => m.selected).length;
  assert(selectedCount === 2, 'Only 2 mutations must remain selected after deselecting sheetMutation');

  // Test 5: approveAndCommitBranch
  console.log('\n--- Test 5: Atomic Commit of Approved Mutations ---');
  const commitResult = await approveAndCommitBranch(branch.id);

  assert(commitResult.committedCount === 2, 'Only 2 selected mutations must be committed');
  assert(commitResult.totalMutations === 3, 'Total mutations recorded as 3');
  
  const committedBranch = getBranchById(branch.id);
  assert(committedBranch.status === 'approved', 'Branch status must transition to "approved"');

  const activeAfterCommit = getActiveBranches();
  assert(activeAfterCommit.length === 0, 'Committed branches must not appear in active pending branches');

  // Test 6: rejectBranch
  console.log('\n--- Test 6: Branch Rejection Lifecycle ---');
  const rejectableBranch = createStagingBranch({
    title: 'Speculative Architecture Refactor',
    description: 'Agent proposing unverified changes',
    agentId: 'rogue-subagent'
  });

  stageMutation({
    branchId: rejectableBranch.id,
    targetApp: 'compose',
    entityId: 'doc-999',
    targetTitle: 'Core Architecture',
    toolName: 'delete_section',
    beforeText: 'Section 4: High Reliability Architecture',
    afterText: ''
  });

  assert(getActiveBranches().length === 1, 'Active staged branches must have 1 branch before reject');
  const rejected = rejectBranch(rejectableBranch.id, 'Human rejected speculative deletion');
  assert(rejected.status === 'rejected', 'Branch status must transition to "rejected"');
  assert(getActiveBranches().length === 0, 'Active staged branches must be 0 after reject');

  // Test 7: docsToolExecutor staging integration
  console.log('\n--- Test 7: docsToolExecutor Staged Tool Execution ---');
  const mockDocContext = {
    entityId: 'doc-555',
    targetTitle: 'Production Roadmap',
    currentDocumentSnapshot: {
      title: 'Production Roadmap',
      text: 'Initial roadmap content.'
    }
  };

  const stagedToolResult = await executeTool(
    'insert_text',
    { text: ' Automated agent addition.', position: 'end' },
    mockDocContext,
    { stage: true, agentId: 'relay-agent-test' }
  );

  assert(stagedToolResult.isStaged === true, 'Tool result must indicate isStaged: true');
  assert(stagedToolResult.branchId !== undefined, 'Tool result must return branchId');
  assert(stagedToolResult.mutationId !== undefined, 'Tool result must return mutationId');

  const stagedBranchFromTool = getBranchById(stagedToolResult.branchId);
  assert(stagedBranchFromTool !== null, 'Staging branch created by docsToolExecutor must exist');
  assert(stagedBranchFromTool.mutations.length === 1, 'Staged branch must contain 1 mutation');

  // Test 8: MCP Protocol Staging Tools & Resources
  console.log('\n--- Test 8: MCP Protocol Staging Tools & Resources ---');
  
  // Test MCP Resource workspace://staging/active
  const resourceResp = await dispatchMcpRequest({
    jsonrpc: '2.0',
    id: 'mcp-1',
    method: 'resources/read',
    params: { uri: 'workspace://staging/active' }
  });

  assert(resourceResp.result && resourceResp.result.contents, 'MCP resource read must return contents');
  assert(resourceResp.result.contents[0].text.includes('ACTIVE WORKSPACE STAGING SANDBOX'), 'Resource text contains header');

  // Test MCP Tool stage_workspace_mutation
  const mcpStageToolResp = await dispatchMcpRequest({
    jsonrpc: '2.0',
    id: 'mcp-2',
    method: 'tools/call',
    params: {
      name: 'stage_workspace_mutation',
      arguments: {
        targetApp: 'sheets',
        targetTitle: 'Marketing Performance Matrix',
        toolName: 'update_cell',
        params: { cell: 'C4', value: 39.8 },
        beforeText: 'C4: 45.2',
        afterText: 'C4: 39.8'
      }
    }
  });

  assert(!mcpStageToolResp.error, 'MCP stage_workspace_mutation must succeed without error');
  const mcpData = mcpStageToolResp.result.data;
  assert(mcpData && mcpData.branchId, 'MCP stage tool response must include branchId');
  assert(mcpData && mcpData.mutationId, 'MCP stage tool response must include mutationId');

  // Test MCP Tool get_staged_diff
  const mcpGetDiffResp = await dispatchMcpRequest({
    jsonrpc: '2.0',
    id: 'mcp-3',
    method: 'tools/call',
    params: {
      name: 'get_staged_diff',
      arguments: {
        branchId: mcpData.branchId
      }
    }
  });

  assert(!mcpGetDiffResp.error, 'MCP get_staged_diff must succeed without error');
  const diffBranch = mcpGetDiffResp.result.data;
  assert(diffBranch.id === mcpData.branchId, 'get_staged_diff must return matching branch');
  assert(diffBranch.mutations.length === 1, 'get_staged_diff branch must have 1 mutation');

  // Test MCP Tool approve_staged_branch
  const mcpApproveResp = await dispatchMcpRequest({
    jsonrpc: '2.0',
    id: 'mcp-4',
    method: 'tools/call',
    params: {
      name: 'approve_staged_branch',
      arguments: {
        branchId: mcpData.branchId,
        actor: 'MCP Director'
      }
    }
  });

  assert(!mcpApproveResp.error, 'MCP approve_staged_branch must succeed without error');
  const approveData = mcpApproveResp.result.data;
  assert(approveData.committedCount >= 1, 'MCP approve must commit at least 1 mutation');

  unsubscribe();

  console.log('\n═══════════════════════════════════════════════════════════════════════════');
  console.log(`  ALL ${testsPassed}/${testsTotal} PILLAR 3 TESTS COMPLETED SUCCESSFULLY!`);
  console.log('═══════════════════════════════════════════════════════════════════════════\n');
}

runTests().catch((err) => {
  console.error('Fatal test error:', err);
  process.exit(1);
});
