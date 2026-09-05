/**
 * mcpBrowserClient.js
 * 
 * Browser Runtime MCP WebSocket Bridge Client
 * 
 * Runs in the user's active browser window. Connects to the server's Socket.IO
 * endpoint, registers the browser window as an active workspace runtime,
 * and executes incoming MCP tool calls and resource reads directly against the live DOM
 * and client-side AST engines.
 * 
 * This completes the closed-loop execution: external MCP clients (Cursor, Claude Desktop)
 * can now trigger REAL mutations in the user's active browser session!
 */

import { executeTool } from './docsToolExecutor.js';
import { readResource } from './universalMcpBridge.js';
import { dispatchWorkspaceMutation, getWorkspaceLiveState } from './workspaceStateBus.js';

let activeSocket = null;
let isRegistered = false;
let onExecuteToolHandler = null;
let onReadResourceHandler = null;
let onConnectHandler = null;

/**
 * Initialize the browser-side MCP bridge listener with an active Socket.IO connection.
 *
 * @param {object} socket - Socket.IO client instance
 * @param {object} metadata - Workspace session metadata { activeProduct, workspaceId, docId }
 */
export function initMcpBrowserBridge(socket, metadata = {}) {
  if (!socket) return false;

  // Detach previous listeners if re-initializing
  stopMcpBrowserBridge();
  activeSocket = socket;

  const registerPayload = {
    activeProduct: metadata.activeProduct || 'compose',
    workspaceId: metadata.workspaceId || 'ws_default',
    userAgent: typeof navigator !== 'undefined' ? navigator.userAgent : 'Node-Test-Runtime',
    capabilities: {
      tools: true,
      resources: true,
      staging: true,
      domMutation: true
    }
  };

  // Register with server
  socket.emit('mcp_register_workspace', registerPayload);
  isRegistered = true;
  console.log('[MCP Browser Client] Registered workspace runtime with server bridge');

  // Re-register on socket reconnect
  onConnectHandler = () => {
    socket.emit('mcp_register_workspace', registerPayload);
    isRegistered = true;
  };
  socket.on('connect', onConnectHandler);

  // 1. Handle incoming tool execution from external MCP clients
  onExecuteToolHandler = async (data = {}) => {
    const { callId, name, arguments: args, context = {}, options = {} } = data;
    if (!callId || !name) return;

    try {
      console.log(`[MCP Browser Client] Executing tool '${name}' via live client engine...`);
      
      // Execute through Canonical Docs Tool Executor with full runtime validation and staging
      const execOptions = options.stage !== undefined ? options : { stage: true, ...options };
      const executionResult = await executeTool(name, args || {}, context, execOptions);

      // Disseminate through Workspace State Bus so active React views immediately update
      dispatchWorkspaceMutation(executionResult.targetApp || 'compose', {
        action: name,
        description: executionResult.message || `MCP remote execution of ${name}`,
        before: executionResult.beforeText || '',
        after: executionResult.afterText || '',
        isStaged: Boolean(executionResult.isStaged),
        branchId: executionResult.branchId || null,
        prNumber: executionResult.prNumber || null,
        origin: 'mcp_remote_client',
        data: executionResult.data || {}
      });

      // Return real execution result back to the server bridge
      socket.emit('mcp_tool_result', {
        callId,
        success: true,
        result: {
          success: executionResult.success !== false,
          toolName: name,
          isStaged: executionResult.isStaged,
          prNumber: executionResult.prNumber,
          branchId: executionResult.branchId,
          message: executionResult.message,
          data: executionResult.data || executionResult,
          timestamp: new Date().toISOString()
        }
      });
    } catch (err) {
      console.error(`[MCP Browser Client] Failed to execute tool '${name}':`, err);
      socket.emit('mcp_tool_result', {
        callId,
        success: false,
        error: err.message
      });
    }
  };
  socket.on('mcp_execute_tool', onExecuteToolHandler);

  // 2. Handle incoming live resource read from external MCP clients
  onReadResourceHandler = async (data = {}) => {
    const { callId, uri } = data;
    if (!callId || !uri) return;

    try {
      // First attempt to read via isomorphic MCP bridge
      let resourceContent = await readResource(uri);

      // If not handled by universalMcpBridge, synthesize from Workspace State Bus
      if (!resourceContent) {
        const liveSnapshot = getWorkspaceLiveState();
        resourceContent = {
          uri,
          mimeType: 'application/json',
          text: JSON.stringify(liveSnapshot, null, 2)
        };
      }

      socket.emit('mcp_resource_result', {
        callId,
        success: true,
        content: resourceContent
      });
    } catch (err) {
      console.error(`[MCP Browser Client] Failed to read resource '${uri}':`, err);
      socket.emit('mcp_resource_result', {
        callId,
        success: false,
        error: err.message
      });
    }
  };
  socket.on('mcp_read_resource', onReadResourceHandler);

  return true;
}

/**
 * Stop the browser-side MCP bridge and remove socket listeners.
 */
export function stopMcpBrowserBridge() {
  if (activeSocket) {
    if (onExecuteToolHandler && typeof activeSocket.off === 'function') {
      try { activeSocket.off('mcp_execute_tool', onExecuteToolHandler); } catch (_) {}
    }
    if (onReadResourceHandler && typeof activeSocket.off === 'function') {
      try { activeSocket.off('mcp_read_resource', onReadResourceHandler); } catch (_) {}
    }
    if (onConnectHandler && typeof activeSocket.off === 'function') {
      try { activeSocket.off('connect', onConnectHandler); } catch (_) {}
    }
    activeSocket = null;
    isRegistered = false;
    onExecuteToolHandler = null;
    onReadResourceHandler = null;
    onConnectHandler = null;
  }
}

/**
 * Check if the browser bridge is actively registered.
 */
export function isMcpBridgeConnected() {
  return Boolean(activeSocket && isRegistered);
}

/**
 * Get current browser bridge client state.
 */
export function getMcpBrowserClientState() {
  return {
    isRegistered,
    isConnected: Boolean(activeSocket && isRegistered),
    socketId: activeSocket ? activeSocket.id : null
  };
}
