/**
 * test-mcp-bridge-live.mjs
 *
 * Phase 2: Live Bi-Directional WebSocket Bridge for MCP Automated Verification Suite
 *
 * Tests:
 * 1. Server bridge client registration, unregistration, and metrics.
 * 2. Remote tool forwarding over WebSocket bridge with simulated client completion.
 * 3. Remote resource reading over WebSocket bridge with live client responses.
 * 4. Fallback handling when browser client is offline or times out.
 * 5. Browser client (mcpBrowserClient.js) receiving remote calls, executing via docsToolExecutor,
 *    and dispatching events to the Workspace State Bus.
 * 6. End-to-end JSON-RPC 2.0 async processor (processMcpRequestAsync) with live bridge.
 */

import { EventEmitter } from 'events';
import {
  registerWorkspaceClient,
  unregisterWorkspaceClient,
  hasActiveWorkspaceClient,
  handleClientToolResult,
  handleClientResourceResult,
  executeToolOverBridge,
  readResourceOverBridge,
  getBridgeStats,
  resetBridgeForTesting
} from '../server/mcpBridgeServer.js';

import {
  processMcpRequestAsync,
  processMcpRequest
} from '../server/mcpTools.js';

import {
  initMcpBrowserBridge,
  stopMcpBrowserBridge,
  getMcpBrowserClientState
} from '../src/services/mcpBrowserClient.js';

import {
  subscribeToAllMutations,
  resetWorkspaceStateBusForTesting
} from '../src/services/workspaceStateBus.js';

let passed = 0;
let failed = 0;

function assert(condition, message) {
  if (condition) {
    console.log(`  ✓ [PASS] ${message}`);
    passed++;
  } else {
    console.error(`  ✗ [FAIL] ${message}`);
    failed++;
  }
}

/**
 * Mock Socket implementation for testing bi-directional communication.
 */
class MockSocket extends EventEmitter {
  constructor(id) {
    super();
    this.id = id;
    this.emittedEvents = [];
  }

  emit(eventName, data) {
    this.emittedEvents.push({ eventName, data });
    super.emit(eventName, data);
    return true;
  }

  getLastEvent(eventName) {
    for (let i = this.emittedEvents.length - 1; i >= 0; i--) {
      if (this.emittedEvents[i].eventName === eventName) {
        return this.emittedEvents[i].data;
      }
    }
    return null;
  }
}

async function runPhase2Tests() {
  console.log('\n================================================================');
  console.log(' PHASE 2: LIVE BI-DIRECTIONAL WEBSOCKET BRIDGE TEST SUITE');
  console.log('================================================================\n');

  // ─────────────────────────────────────────────────────────────
  // Section 1: Server Bridge Client Registry & Metrics
  // ─────────────────────────────────────────────────────────────
  console.log('── Section 1: Server Bridge Client Registry & Metrics ────────');
  resetBridgeForTesting();

  assert(!hasActiveWorkspaceClient(), 'Initially no active workspace client connected');
  const initialStats = getBridgeStats();
  assert(initialStats.connectedClients === 0, 'Bridge stats reports 0 connected clients');

  const mockServerSideSocket1 = new MockSocket('ws_browser_tab_1');
  const regOk = registerWorkspaceClient(mockServerSideSocket1, {
    userAgent: 'Mozilla/5.0 (Windows NT 10.0; Win64; x64) TestBrowser',
    activeProduct: 'compose',
    workspaceId: 'ws_board_room_alpha'
  });

  assert(regOk === true, 'registerWorkspaceClient succeeds');
  assert(hasActiveWorkspaceClient(), 'hasActiveWorkspaceClient returns true after registration');
  assert(getBridgeStats().connectedClients === 1, 'Bridge stats reports 1 connected client');

  const mockServerSideSocket2 = new MockSocket('ws_browser_tab_2');
  registerWorkspaceClient(mockServerSideSocket2, {
    activeProduct: 'whiteboard',
    workspaceId: 'ws_board_room_alpha'
  });
  assert(getBridgeStats().connectedClients === 2, 'Bridge stats reports 2 connected clients');

  unregisterWorkspaceClient('ws_browser_tab_1');
  assert(getBridgeStats().connectedClients === 1, 'Unregistering 1 client leaves 1 active client');

  unregisterWorkspaceClient('ws_browser_tab_2');
  assert(!hasActiveWorkspaceClient(), 'All clients unregistered, hasActiveWorkspaceClient is false');
  assert(getBridgeStats().connectedClients === 0, 'Connected clients count is 0');

  // ─────────────────────────────────────────────────────────────
  // Section 2: Remote Tool Forwarding over Bridge
  // ─────────────────────────────────────────────────────────────
  console.log('\n── Section 2: Remote Tool Forwarding over Bridge ─────────────');
  resetBridgeForTesting();

  // Test offline fallback
  const offlineResult = await executeToolOverBridge('patch_block', { blockId: 'blk_1', text: 'Hello' });
  assert(offlineResult.success === true, 'Offline tool execution succeeds via fallback');
  assert(offlineResult.bridged === false, 'Offline tool execution indicates bridged: false');
  assert(offlineResult.source === 'server_offline_fallback', 'Offline tool execution reports source fallback');

  // Connect a mock browser socket to the server bridge
  const browserSocket = new MockSocket('browser_session_live');
  registerWorkspaceClient(browserSocket, { activeProduct: 'compose' });

  // When server emits 'mcp_execute_tool' to browser, simulate browser replying with 'mcp_tool_result'
  browserSocket.on('mcp_execute_tool', (payload) => {
    // Immediate simulated response
    handleClientToolResult({
      callId: payload.callId,
      success: true,
      result: {
        success: true,
        toolName: payload.name,
        isStaged: true,
        prNumber: 42,
        branchId: 'ai-patch-42',
        message: `Simulated browser execution of ${payload.name}`,
        data: { targetBlockId: payload.arguments.blockId }
      }
    });
  });

  const bridgedResult = await executeToolOverBridge('patch_block', { blockId: 'blk_99', text: 'Live remote patch' }, 2000);
  assert(bridgedResult.success === true, 'Bridged tool execution resolves successfully');
  assert(bridgedResult.prNumber === 42, 'Bridged result contains browser staging PR number');
  assert(bridgedResult.branchId === 'ai-patch-42', 'Bridged result contains browser branch ID');
  assert(getBridgeStats().bridgedExecutionCount === 1, 'Bridge stats tracks bridgedExecutionCount = 1');

  // Test timeout fallback with unresponsive client
  const slowSocket = new MockSocket('browser_session_slow');
  resetBridgeForTesting();
  registerWorkspaceClient(slowSocket, { activeProduct: 'compose' });
  // Do NOT reply to mcp_execute_tool
  const timeoutResult = await executeToolOverBridge('insert_block', { content: 'Slow data' }, 100);
  assert(timeoutResult.success === true, 'Timed out tool call falls back gracefully');
  assert(timeoutResult.timedOut === true, 'Timed out result flags timedOut: true');
  assert(timeoutResult.source === 'server_timeout_fallback', 'Source is server_timeout_fallback');

  // ─────────────────────────────────────────────────────────────
  // Section 3: Remote Resource Reading over Bridge
  // ─────────────────────────────────────────────────────────────
  console.log('\n── Section 3: Remote Resource Reading over Bridge ────────────');
  resetBridgeForTesting();

  // Test offline resource read (returns null to signal static fallback)
  const offlineResource = await readResourceOverBridge('workspace://graph/context');
  assert(offlineResource === null, 'Offline resource read returns null for server fallback');

  // Connect client and reply with live content
  const resourceSocket = new MockSocket('browser_session_res');
  registerWorkspaceClient(resourceSocket, { activeProduct: 'compose' });

  resourceSocket.on('mcp_read_resource', (payload) => {
    handleClientResourceResult({
      callId: payload.callId,
      success: true,
      content: {
        uri: payload.uri,
        mimeType: 'text/markdown',
        text: '# Live Graph from Active Browser Window\n- Node: Executive Decision\n- Active Doc: Strategic Plan'
      }
    });
  });

  const liveResource = await readResourceOverBridge('workspace://graph/context', 2000);
  assert(liveResource !== null, 'Live resource read succeeds over bridge');
  assert(liveResource.mimeType === 'text/markdown', 'Live resource has markdown mimeType');
  assert(liveResource.text.includes('Executive Decision'), 'Live resource contains browser-side graph node');
  assert(getBridgeStats().bridgedReadCount === 1, 'Bridge stats tracks bridgedReadCount = 1');

  // ─────────────────────────────────────────────────────────────
  // Section 4: Browser Client Engine (mcpBrowserClient.js)
  // ─────────────────────────────────────────────────────────────
  console.log('\n── Section 4: Browser Client Engine (mcpBrowserClient.js) ───');
  resetWorkspaceStateBusForTesting();

  const clientSideSocket = new MockSocket('client_side_socket_01');
  const initOk = initMcpBrowserBridge(clientSideSocket, {
    activeProduct: 'compose',
    workspaceId: 'ws_test_42'
  });

  assert(initOk === true, 'initMcpBrowserBridge initializes client');
  const clientState = getMcpBrowserClientState();
  assert(clientState.isRegistered === true, 'Browser client state isRegistered is true');

  const regEvent = clientSideSocket.getLastEvent('mcp_register_workspace');
  assert(regEvent !== null, 'Client emitted mcp_register_workspace on init');
  assert(regEvent.activeProduct === 'compose', 'Registration payload has activeProduct = compose');
  assert(regEvent.capabilities.staging === true, 'Registration payload has staging capability');
  assert(regEvent.capabilities.tools === true, 'Registration payload has tools capability');

  // Listen on Workspace State Bus to verify local reactive dispatch
  let busEventReceived = null;
  const busUnsub = subscribeToAllMutations((event) => {
    busEventReceived = event;
  });

  // Simulate server sending 'mcp_execute_tool' down to client
  clientSideSocket.emit('mcp_execute_tool', {
    callId: 'call_test_88',
    name: 'patch_block',
    arguments: {
      blockId: 'blk_test_target',
      content: 'Updated content from remote MCP client'
    }
  });

  // Wait a microtask tick for async tool execution
  await new Promise(r => setTimeout(r, 50));

  const clientToolResult = clientSideSocket.getLastEvent('mcp_tool_result');
  assert(clientToolResult !== null, 'Client replied with mcp_tool_result');
  assert(clientToolResult.callId === 'call_test_88', 'Result callId matches incoming callId');
  assert(clientToolResult.success === true, 'Tool result success is true');
  assert(clientToolResult.result.toolName === 'patch_block', 'Result toolName is patch_block');

  // Verify Workspace State Bus received the mutation from the browser MCP client
  assert(busEventReceived !== null, 'Workspace State Bus received mutation from browser MCP bridge');
  assert(busEventReceived.origin === 'mcp_remote_client', 'Mutation event origin is mcp_remote_client');
  assert(busEventReceived.action === 'patch_block', 'Mutation action is patch_block');

  busUnsub();

  // Test clean teardown
  stopMcpBrowserBridge();
  assert(getMcpBrowserClientState().isRegistered === false, 'stopMcpBrowserBridge resets isRegistered to false');

  // ─────────────────────────────────────────────────────────────
  // Section 5: End-to-End JSON-RPC 2.0 Async Bridge Dispatch
  // ─────────────────────────────────────────────────────────────
  console.log('\n── Section 5: End-to-End JSON-RPC 2.0 Async Bridge Dispatch ──');
  resetBridgeForTesting();

  // Pair server bridge and browser client through a linked mock duplex pair
  const serverEnd = new MockSocket('duplex_server_side');
  const clientEnd = new MockSocket('duplex_client_side');

  // Pipe serverEnd emissions to clientEnd listeners, and vice versa
  serverEnd.on('mcp_execute_tool', (data) => clientEnd.emit('mcp_execute_tool', data));
  serverEnd.on('mcp_read_resource', (data) => clientEnd.emit('mcp_read_resource', data));
  clientEnd.on('mcp_tool_result', (data) => handleClientToolResult(data));
  clientEnd.on('mcp_resource_result', (data) => handleClientResourceResult(data));

  registerWorkspaceClient(serverEnd, { activeProduct: 'compose' });
  initMcpBrowserBridge(clientEnd, { activeProduct: 'compose' });

  // 1. tools/call over full JSON-RPC async
  const toolRpcRequest = {
    jsonrpc: '2.0',
    id: 101,
    method: 'tools/call',
    params: {
      name: 'patch_block',
      arguments: {
        blockId: 'blk_production_executive',
        content: 'Validated MCP Pipeline Integration'
      }
    }
  };

  const rpcToolResponse = await processMcpRequestAsync(toolRpcRequest);
  assert(rpcToolResponse.id === 101, 'JSON-RPC response id matches request id');
  assert(rpcToolResponse.result !== undefined, 'JSON-RPC response contains result');
  assert(rpcToolResponse.result.bridgeResult !== undefined, 'JSON-RPC response contains bridgeResult');
  assert(rpcToolResponse.result.bridgeResult.success === true, 'Bridge result success is true');
  assert(rpcToolResponse.result.editorAction !== undefined, 'JSON-RPC response contains editorAction for UI sync');

  // 2. resources/read over full JSON-RPC async
  const resourceRpcRequest = {
    jsonrpc: '2.0',
    id: 102,
    method: 'resources/read',
    params: {
      uri: 'workspace://graph/context'
    }
  };

  const rpcResourceResponse = await processMcpRequestAsync(resourceRpcRequest);
  assert(rpcResourceResponse.id === 102, 'JSON-RPC resource response id is 102');
  assert(Array.isArray(rpcResourceResponse.result?.contents), 'Response contains contents array');
  assert(rpcResourceResponse.result.contents[0].uri === 'workspace://graph/context', 'Content uri matches');

  // 3. Backward compatibility: verify processMcpRequest (sync) continues to work
  const syncResponse = processMcpRequest({
    jsonrpc: '2.0',
    id: 103,
    method: 'tools/list'
  });
  assert(syncResponse.id === 103, 'Synchronous processMcpRequest remains fully functional');
  assert(syncResponse.result.tools.length > 0, 'Synchronous tools list returned tools');

  stopMcpBrowserBridge();
  resetBridgeForTesting();

  // ─────────────────────────────────────────────────────────────
  // Summary
  // ─────────────────────────────────────────────────────────────
  console.log('\n================================================================');
  console.log(` PHASE 2 TEST SUMMARY: ${passed} Passed, ${failed} Failed`);
  console.log('================================================================\n');

  if (failed > 0) {
    process.exit(1);
  }
}

runPhase2Tests().catch(err => {
  console.error('Fatal error in Phase 2 tests:', err);
  process.exit(1);
});
