/**
 * Comprehensive Automated Verification for Pillar 2: Native Model Context Protocol (MCP) Layer
 */

import { processMcpRequest, REGAARDER_MCP_RESOURCES, REGAARDER_MCP_PROMPTS, REGAARDER_MCP_TOOLS } from '../server/mcpTools.js';
import { dispatchMcpRequest, mcpClient, MCP_RESOURCES, MCP_PROMPTS } from '../src/services/universalMcpBridge.js';

async function runMcpVerification() {
  console.log('═══════════════════════════════════════════════════════════════');
  console.log('  PILLAR 2: MODEL CONTEXT PROTOCOL (MCP) VERIFICATION SUITE   ');
  console.log('═══════════════════════════════════════════════════════════════\n');

  let passed = 0;
  let failed = 0;

  function assert(condition, message) {
    if (condition) {
      console.log(`  ✓ PASS: ${message}`);
      passed++;
    } else {
      console.error(`  ✗ FAIL: ${message}`);
      failed++;
    }
  }

  // 1. Server MCP Protocol Handshake
  console.log('1. Server JSON-RPC 2.0 Handshake & Protocol Negotiation');
  const initRes = processMcpRequest({ jsonrpc: '2.0', id: 101, method: 'initialize' });
  assert(initRes?.result?.protocolVersion === '2024-11-05', 'Protocol version is 2024-11-05');
  assert(initRes?.result?.serverInfo?.name === 'regaarder-workspace-mcp', 'Server name identified');
  assert(Boolean(initRes?.result?.capabilities?.resources), 'Exposes resources capability');
  assert(Boolean(initRes?.result?.capabilities?.tools), 'Exposes tools capability');
  assert(Boolean(initRes?.result?.capabilities?.prompts), 'Exposes prompts capability');

  // 2. Server Resources List & Read
  console.log('\n2. Server Resources Primitives (Token-Dense Feeds)');
  const resList = processMcpRequest({ jsonrpc: '2.0', id: 102, method: 'resources/list' });
  assert(Array.isArray(resList?.result?.resources) && resList.result.resources.length >= 7, `${resList?.result?.resources?.length} standardized workspace resources listed`);
  
  const readContext = processMcpRequest({ jsonrpc: '2.0', id: 103, method: 'resources/read', params: { uri: 'workspace://graph/context' } });
  assert(readContext?.result?.contents?.[0]?.mimeType === 'text/markdown', 'workspace://graph/context returns text/markdown');
  assert(readContext?.result?.contents?.[0]?.text?.includes('WORKSPACE CONTEXT GRAPH'), 'Context graph feed content contains semantic entities');

  const readMemory = processMcpRequest({ jsonrpc: '2.0', id: 104, method: 'resources/read', params: { uri: 'workspace://memory/bank' } });
  assert(readMemory?.result?.contents?.[0]?.mimeType === 'application/ld+json', 'workspace://memory/bank returns application/ld+json');

  // 3. Server Prompts Primitives (Executive Workflow Templates)
  console.log('\n3. Server Prompts Primitives');
  const promptList = processMcpRequest({ jsonrpc: '2.0', id: 105, method: 'prompts/list' });
  assert(Array.isArray(promptList?.result?.prompts) && promptList.result.prompts.length === 5, '5 executive workflow prompts listed');
  
  const getPrompt = processMcpRequest({ 
    jsonrpc: '2.0', 
    id: 106, 
    method: 'prompts/get', 
    params: { name: 'risk_and_rule_audit', arguments: { proposalText: 'Deploy Single Fab Cluster' } } 
  });
  assert(getPrompt?.result?.messages?.[0]?.content?.text?.includes('Deploy Single Fab Cluster'), 'Prompt template instantiates with arguments');

  // 4. Server Tools Primitives & Dry-Run Staging
  console.log('\n4. Server Tools Primitives & Dry-Run Staging');
  const toolList = processMcpRequest({ jsonrpc: '2.0', id: 107, method: 'tools/list' });
  assert(toolList?.result?.tools?.length >= 30, `Server tools registry exposes ${toolList?.result?.tools?.length} tools`);

  const dryRun = processMcpRequest({
    jsonrpc: '2.0',
    id: 108,
    method: 'tools/call',
    params: { name: 'validate_tool_call', arguments: { targetTool: 'remember_instruction' } }
  });
  assert(dryRun?.result?.content?.[0]?.text?.includes('APPROVED_FOR_STAGING'), 'Dry-run staging validation returns APPROVED_FOR_STAGING');

  // 5. Client Isomorphic MCP Bridge
  console.log('\n5. Client Isomorphic MCP Bridge (In-Memory Engine)');
  const clientInit = await dispatchMcpRequest({ jsonrpc: '2.0', id: 201, method: 'initialize' });
  assert(clientInit?.result?.protocolVersion === '2024-11-05', 'Client bridge protocol version 2024-11-05');

  const clientTools = await mcpClient.listTools();
  assert(clientTools.length >= 50, `Client bridge lists ${clientTools.length} total tools (Docs + State + Canvas)`);

  const clientContextFeed = await mcpClient.readResource('workspace://graph/context');
  assert(clientContextFeed?.mimeType === 'text/markdown', 'Client bridge reads workspace://graph/context as markdown');
  assert(clientContextFeed?.text?.length > 100, `Context feed payload is token-dense (${clientContextFeed?.text?.length} chars)`);

  const toolExec = await mcpClient.callTool('remember_instruction', {
    instruction: 'For executive memos, format numbers with billions suffix.',
    category: 'formatting',
    priority: 'high'
  });
  assert(toolExec?.content?.[0]?.text?.includes('Remembered instruction'), 'Client bridge executed remember_instruction tool call successfully');

  console.log('\n═══════════════════════════════════════════════════════════════');
  console.log(`  VERIFICATION COMPLETE: ${passed} PASSED, ${failed} FAILED  `);
  console.log('═══════════════════════════════════════════════════════════════\n');

  if (failed > 0) {
    process.exit(1);
  }
}

runMcpVerification().catch(err => {
  console.error('Fatal test exception:', err);
  process.exit(1);
});
