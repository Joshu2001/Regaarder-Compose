/**
 * scripts/test-block-canvas.js
 * 
 * Comprehensive automated verification for Pillar 4:
 * The Canvas (Block-Level State IDs & Surgical Patch Engine)
 */

import {
  generateBlockId,
  htmlToBlockTree,
  blockTreeToHtml,
  blockTreeToMarkdown,
  getBlock,
  patchBlock,
  insertBlock,
  deleteBlock,
  moveBlock,
  batchPatchBlocks,
  subscribeToBlockTree,
  resetBlockTreeForTesting
} from '../src/services/blockCanvasEngine.js';

import { executeTool } from '../src/services/docsToolExecutor.js';
import { dispatchMcpRequest } from '../src/services/universalMcpBridge.js';
import { resetStagingForTesting } from '../src/services/workspaceStagingEngine.js';

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
  console.log('  PILLAR 4: BLOCK CANVAS AST & SURGICAL PATCH ENGINE TEST SUITE');
  console.log('═══════════════════════════════════════════════════════════════════════════\n');

  resetBlockTreeForTesting();
  resetStagingForTesting();

  // Test 1: generateBlockId formatting
  console.log('--- Test 1: Block ID Generation ---');
  const id1 = generateBlockId('blk_p');
  const id2 = generateBlockId('blk_h1');
  assert(id1.startsWith('blk_p_'), 'Block ID must start with prefix blk_p_');
  assert(id2.startsWith('blk_h1_'), 'Block ID must start with prefix blk_h1_');
  assert(id1 !== id2, 'Generated block IDs must be globally unique');

  // Test 2: htmlToBlockTree Parser
  console.log('\n--- Test 2: htmlToBlockTree AST Parser ---');
  const sampleHtml = `
    <h1>Executive Q3 Strategy Memo</h1>
    <p>Target revenue for the enterprise tier is $12.5M ARR.</p>
    <blockquote>Core directive: Ship fast with zero architectural regressions.</blockquote>
    <pre><code class="language-python">def calculate_arr(mrr): return mrr * 12</code></pre>
    <div class="callout-block" data-theme="warning"><strong>Notice</strong>Review regulatory disclosures before publishing.</div>
    <hr />
    <h2>Next Operational Steps</h2>
    <p>Schedule legal compliance audit.</p>
  `;

  const tree = htmlToBlockTree(sampleHtml, {
    documentId: 'doc_strategy_q3',
    title: 'Executive Q3 Strategy Memo'
  });

  assert(tree !== null, 'tree must not be null');
  assert(tree.documentId === 'doc_strategy_q3', 'tree must record documentId');
  assert(Array.isArray(tree.blocks), 'tree.blocks must be an array');
  console.log('Parsed blocks:', tree.blocks.map(b => ({ type: b.type, content: b.content })));
  assert(tree.blocks.length >= 7, `tree must parse at least 7 blocks, found: ${tree.blocks.length}`);

  const h1Block = tree.blocks.find(b => b.type === 'h1');
  assert(h1Block && h1Block.content.includes('Executive Q3 Strategy Memo'), 'h1 block must be parsed');
  assert(h1Block.id && h1Block.id.startsWith('blk_'), 'h1 block must have unique block ID');

  const pBlock = tree.blocks.find(b => b.type === 'paragraph');
  assert(pBlock && pBlock.content.includes('$12.5M ARR'), 'paragraph block must be parsed');

  const codeBlock = tree.blocks.find(b => b.type === 'code');
  assert(codeBlock && codeBlock.content.includes('calculate_arr'), 'code block must be parsed');

  const calloutBlock = tree.blocks.find(b => b.type === 'callout');
  assert(calloutBlock && calloutBlock.properties.theme === 'warning', 'callout block theme must be preserved');

  // Test 3: blockTreeToHtml Re-Serialization
  console.log('\n--- Test 3: blockTreeToHtml Re-Serialization ---');
  const serializedHtml = blockTreeToHtml(tree);
  assert(typeof serializedHtml === 'string', 'serializedHtml must be a string');
  assert(serializedHtml.includes('data-block-id='), 'serialized HTML must contain data-block-id attributes');
  assert(serializedHtml.includes('data-block-type="h1"'), 'serialized HTML must contain data-block-type="h1"');
  assert(serializedHtml.includes(h1Block.id), 'serialized HTML must retain exact block ID of h1');
  assert(serializedHtml.includes(pBlock.id), 'serialized HTML must retain exact block ID of p');

  // Test 4: blockTreeToMarkdown Token-Dense Feed
  console.log('\n--- Test 4: blockTreeToMarkdown Token Feed ---');
  const markdownFeed = blockTreeToMarkdown(tree);
  assert(typeof markdownFeed === 'string', 'markdownFeed must be a string');
  assert(markdownFeed.includes('# Executive Q3 Strategy Memo'), 'Markdown contains h1 markdown syntax');
  assert(markdownFeed.includes(`<!-- id:${h1Block.id} -->`), 'Markdown contains embedded block ID tags for LLMs');

  // Test 5: getBlock $O(1)$ Lookup
  console.log('\n--- Test 5: getBlock by Unique ID ---');
  const foundBlock = getBlock(tree, pBlock.id);
  assert(foundBlock !== null, 'getBlock must find existing block');
  assert(foundBlock.id === pBlock.id, 'foundBlock ID must match query');
  assert(foundBlock.content === pBlock.content, 'foundBlock content must match');

  const notFoundBlock = getBlock(tree, 'blk_nonexistent_xyz');
  assert(notFoundBlock === null, 'getBlock must return null for nonexistent ID');

  // Test 6: patchBlock Surgical In-Place Mutation
  console.log('\n--- Test 6: patchBlock Surgical In-Place Mutation ---');
  let notifiedTree = null;
  let lastChangeDetails = null;

  const unsubscribe = subscribeToBlockTree((t, details) => {
    notifiedTree = t;
    lastChangeDetails = details;
  });

  const initialVersion = pBlock.version || 1;
  const initialTreeVersion = tree.version || 1;

  const patchResult = patchBlock(tree, {
    blockId: pBlock.id,
    content: 'Target revenue for the enterprise tier is $15.0M ARR (exceeding initial forecast by 20%).',
    agentId: 'relay-revenue-optimizer'
  });

  assert(patchResult.success === true, 'patchBlock must succeed');
  assert(patchResult.updatedBlock.version === initialVersion + 1, 'Block version must monotonically increment');
  assert(tree.version === initialTreeVersion + 1, 'Tree version must increment');
  assert(patchResult.updatedBlock.content.includes('$15.0M ARR'), 'Block content must reflect surgical patch');
  assert(patchResult.updatedBlock.lastModifiedBy === 'relay-revenue-optimizer', 'lastModifiedBy must record agent ID');
  
  // Verify other blocks were NOT touched
  assert(h1Block.content === 'Executive Q3 Strategy Memo', 'Unrelated h1 block content must remain untouched');
  assert(h1Block.version === 1, 'Unrelated h1 block version must remain untouched');
  assert(notifiedTree !== null, 'subscribeToBlockTree must be notified of patch');
  assert(lastChangeDetails.action === 'patch', 'changeDetails action must be "patch"');

  // Test 7: insertBlock Adjacent
  console.log('\n--- Test 7: insertBlock Adjacent ---');
  const initialBlockCount = tree.blocks.length;

  const insertResult = insertBlock(tree, {
    targetBlockId: pBlock.id,
    position: 'after',
    block: {
      type: 'callout',
      content: 'Key Metric: Enterprise gross margin expanded to 84%.',
      properties: { theme: 'success' }
    },
    agentId: 'financial-analyst'
  });

  assert(insertResult.success === true, 'insertBlock must succeed');
  assert(tree.blocks.length === initialBlockCount + 1, 'Tree block count must increase by 1');
  assert(insertResult.newBlock.type === 'callout', 'New block type must be callout');
  assert(insertResult.newBlock.properties.theme === 'success', 'New block properties must be set');

  const insertedIndex = tree.blocks.findIndex(b => b.id === insertResult.blockId);
  const pIndex = tree.blocks.findIndex(b => b.id === pBlock.id);
  assert(insertedIndex === pIndex + 1, 'Inserted block must immediately follow target block');

  // Test 8: deleteBlock
  console.log('\n--- Test 8: deleteBlock ---');
  const blockToDeleteId = insertResult.blockId;
  const countBeforeDelete = tree.blocks.length;

  const deleteResult = deleteBlock(tree, {
    blockId: blockToDeleteId,
    agentId: 'human_director'
  });

  assert(deleteResult.success === true, 'deleteBlock must succeed');
  assert(tree.blocks.length === countBeforeDelete - 1, 'Tree block count must decrease by 1');
  assert(getBlock(tree, blockToDeleteId) === null, 'Deleted block must no longer exist in tree');

  // Test 9: moveBlock Reordering
  console.log('\n--- Test 9: moveBlock Reordering ---');
  const blockToMove = tree.blocks[1];
  const targetAnchor = tree.blocks[tree.blocks.length - 1];

  const moveResult = moveBlock(tree, {
    blockId: blockToMove.id,
    targetBlockId: targetAnchor.id,
    position: 'after'
  });

  assert(moveResult.success === true, 'moveBlock must succeed');
  const newIndex = tree.blocks.findIndex(b => b.id === blockToMove.id);
  assert(newIndex === tree.blocks.length - 1, 'Moved block must now be at the end of the tree');

  // Test 10: batchPatchBlocks
  console.log('\n--- Test 10: batchPatchBlocks Atomic Pass ---');
  const firstBlock = tree.blocks[0];
  const secondBlock = tree.blocks[1];

  const batchResult = batchPatchBlocks(tree, [
    { op: 'patch', blockId: firstBlock.id, content: 'Updated Strategy Header v2' },
    { op: 'patch', blockId: secondBlock.id, content: 'Updated Sub-content Section' }
  ], 'batch-agent');

  assert(batchResult.success === true, 'batchPatchBlocks must succeed');
  assert(batchResult.appliedCount === 2, 'batchPatchBlocks must apply both operations');
  assert(getBlock(tree, firstBlock.id).content === 'Updated Strategy Header v2', 'First block patched');
  assert(getBlock(tree, secondBlock.id).content === 'Updated Sub-content Section', 'Second block patched');

  // Test 11: Pillar 3 Staging Sandbox Integration
  console.log('\n--- Test 11: Staging Sandbox Block Patch ---');
  const stagedPatchResult = patchBlock(tree, {
    blockId: firstBlock.id,
    content: 'Speculative Header Proposing $50M ARR'
  }, { stage: true, branchId: null });

  assert(stagedPatchResult.isStaged === true, 'Staged patch must return isStaged: true');
  assert(stagedPatchResult.branchId !== undefined, 'Staged patch must return branchId');
  assert(stagedPatchResult.mutationId !== undefined, 'Staged patch must return mutationId');
  
  // Verify production AST block was NOT modified yet!
  assert(getBlock(tree, firstBlock.id).content === 'Updated Strategy Header v2', 'Production block must NOT change when staged');

  // Test 12: docsToolExecutor Block Tools Integration
  console.log('\n--- Test 12: docsToolExecutor Block Tools Integration ---');
  const toolExecTreeResult = await executeTool('get_block_tree', {}, {});
  assert(toolExecTreeResult.success === true, 'get_block_tree tool must succeed');
  assert(toolExecTreeResult.data && Array.isArray(toolExecTreeResult.data.blocks), 'Tool returns block tree data');

  const toolExecPatchResult = await executeTool('patch_block', {
    blockId: firstBlock.id,
    content: 'Final Strategic Charter 2026'
  }, {});

  assert(toolExecPatchResult.success === true, 'patch_block tool must succeed');

  // Test 13: Native MCP Protocol Resource & Tools
  console.log('\n--- Test 13: Native MCP Protocol Resource & Tools ---');
  
  // Test MCP Resource workspace://docs/blocks
  const mcpResourceResp = await dispatchMcpRequest({
    jsonrpc: '2.0',
    id: 'mcp-ast-1',
    method: 'resources/read',
    params: { uri: 'workspace://docs/blocks' }
  });

  assert(mcpResourceResp.result && mcpResourceResp.result.contents, 'MCP resource read must succeed');
  const mcpAstData = JSON.parse(mcpResourceResp.result.contents[0].text);
  assert(Array.isArray(mcpAstData.blocks), 'MCP resource returns blocks array');
  assert(mcpAstData.blocks.length > 0, 'MCP resource contains parsed blocks');

  // Test MCP Tool patch_block
  const targetBlk = mcpAstData.blocks[0];
  const mcpPatchToolResp = await dispatchMcpRequest({
    jsonrpc: '2.0',
    id: 'mcp-ast-2',
    method: 'tools/call',
    params: {
      name: 'patch_block',
      arguments: {
        blockId: targetBlk.id,
        content: 'MCP Remote Agent Surgical Patch'
      }
    }
  });

  assert(!mcpPatchToolResp.error, 'MCP patch_block tool must succeed');
  assert(mcpPatchToolResp.result && !mcpPatchToolResp.result.isError, 'MCP tool must not flag error');

  unsubscribe();

  console.log('\n═══════════════════════════════════════════════════════════════════════════');
  console.log(`  ALL ${testsPassed}/${testsTotal} PILLAR 4 TESTS COMPLETED SUCCESSFULLY!`);
  console.log('═══════════════════════════════════════════════════════════════════════════\n');
}

runTests().catch((err) => {
  console.error('Fatal test error:', err);
  process.exit(1);
});
