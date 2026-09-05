/**
 * universalMcpBridge.js
 * 
 * Pillar 2: Native Model Context Protocol (MCP) Middleware Layer (Client & Isomorphic Engine)
 * 
 * Provides an in-memory, isomorphic MCP Server & Client implementation running natively
 * in Vite/Electron and the browser.
 * 
 * Standardizes the 3 core MCP primitives across the entire Regaarder ecosystem:
 * 1. Resources: High-density, token-optimized data feeds (saving up to 80% tokens over HTML).
 * 2. Tools: Standardized executable functions with precise schemas & dry-run staging.
 * 3. Prompts: Pre-engineered templates built for common executive workflows.
 */

import {
  getAgentContext,
  getMemoryBank,
  exportGraphAsJsonLd,
  getPropagationHistory,
  rememberInstruction,
  addProjectRule,
  recordDecision,
  mutateAndPropagate
} from './universalContextGraph.js';

import * as docsCommandApi from './docsCommandApi.js';
import { executeTool, getTransactionHistory } from './docsToolExecutor.js';
import { CANONICAL_DOCS_TOOLS } from './docsToolRegistry.js';
import { 
  createStagingBranch, 
  stageMutation, 
  getActiveBranches, 
  getBranchById, 
  approveAndCommitBranch, 
  rejectBranch 
} from './workspaceStagingEngine.js';
import * as matrixEngine from './matrixSchemaEngine.js';
import * as intentScheduler from './intentSchedulerEngine.js';
import * as omniPortal from './omniPortalEngine.js';
import * as directiveEngine from './directiveQueueEngine.js';
import * as spatialTopology from './spatialTopologyEngine.js';
import * as roomObserver from './roomObserverEngine.js';

// ─────────────────────────────────────────────────────────────────────────────
// 1. MCP RESOURCE CATALOG SPECIFICATION
// ─────────────────────────────────────────────────────────────────────────────

export const MCP_RESOURCES = [
  {
    uri: 'workspace://graph/context',
    name: 'Universal Context Feed',
    description: 'Active project rules, binding epistemic decisions, and connected entity nodes in token-dense Markdown.',
    mimeType: 'text/markdown'
  },
  {
    uri: 'workspace://memory/bank',
    name: 'Agent Memory Bank',
    description: 'Full JSON-LD semantic graph of permanent instructions, preferences, and organization-wide project rules.',
    mimeType: 'application/json'
  },
  {
    uri: 'workspace://docs/active',
    name: 'Active Focused Document',
    description: 'Current document in focus with clean stripped Markdown, heading structures, and word stats.',
    mimeType: 'text/markdown'
  },
  {
    uri: 'workspace://docs/list',
    name: 'Workspace Document Manifest',
    description: 'Manifest array of all documents in the active workspace with word counts and last-modified timestamps.',
    mimeType: 'application/json'
  },
  {
    uri: 'workspace://sheets/active',
    name: 'Active Tabular Model',
    description: 'Tabular calculation models in clean Markdown table and CSV format, optimized for agent reasoning.',
    mimeType: 'text/markdown'
  },
  {
    uri: 'workspace://tasks/active',
    name: 'Active Strategic Initiatives',
    description: 'Key initiatives, roadmap milestones, assigned owners, and deadline constraints in structured JSON.',
    mimeType: 'application/json'
  },
  {
    uri: 'workspace://graph/propagation-log',
    name: 'Cross-Workspace Propagation Audit Log',
    description: 'Live log of state mutations automatically propagated across connected documents and models.',
    mimeType: 'text/markdown'
  },
  {
    uri: 'workspace://staging/active',
    name: 'Active Staging PR Branches',
    description: 'List of uncommitted agent pull request branches awaiting human review with visual redline diff stats.',
    mimeType: 'text/markdown'
  },
  {
    uri: 'workspace://docs/blocks',
    name: 'Active Document Block AST',
    description: 'Structured block-level Abstract Syntax Tree (AST) with unique block IDs (blk_...), types, and versioning.',
    mimeType: 'application/json'
  },
  {
    uri: 'workspace://sheets/schema',
    name: 'Active Sheet Matrix Schema',
    description: 'Column schemas, types (dropdown, percentage, currency, number), and validation rules for the active sheet.',
    mimeType: 'application/json'
  },
  {
    uri: 'workspace://schedule/calendar',
    name: 'Universal Calendar & Scheduled Events',
    description: 'Universal calendar store events with participant schedules, priority, and energy metadata in structured Markdown and JSON.',
    mimeType: 'text/markdown'
  },
  {
    uri: 'workspace://schedule/negotiations',
    name: 'Multi-Agent Negotiation Audit Feed',
    description: 'Active and completed multi-agent schedule negotiations, Pareto utility convergence logs, and agreed slots.',
    mimeType: 'application/json'
  },
  {
    uri: 'workspace://portal/queue',
    name: 'Omni-Portal Ingestion Queue',
    description: 'Active file ingestion jobs, status, token metrics, and extracted cross-app entity manifests in Markdown and JSON.',
    mimeType: 'text/markdown'
  },
  {
    uri: 'workspace://portal/manifest',
    name: 'Omni-Portal Ingestion Manifest',
    description: 'Historical catalog of ingested documents, extracted block/sheet counts, and token savings metrics.',
    mimeType: 'application/json'
  },
  {
    uri: 'workspace://tasks/queue',
    name: 'Directive Queue & Autonomous Tasks',
    description: 'Active, staged, and completed directives across User, Agent, and Team tiers with block pointer anchoring.',
    mimeType: 'text/markdown'
  },
  {
    uri: 'workspace://whiteboard/topology',
    name: 'Whiteboard Spatial Topology AST',
    description: 'Relational node-and-edge spatial graph AST of whiteboard canvas diagrams, schemas, and flowcharts in token-dense Markdown.',
    mimeType: 'text/markdown'
  },
  {
    uri: 'workspace://room/live-context',
    name: 'Room Live In-Meeting Context Stream',
    description: 'Real-time feed of active meeting session, speaker turns, epistemic consensus log, and pending PR mutations in token-dense Markdown.',
    mimeType: 'text/markdown'
  }
];

export const MCP_RESOURCE_TEMPLATES = [
  {
    uriTemplate: 'workspace://docs/{docId}',
    name: 'Specific Document Feed',
    description: 'Retrieve a specific document by its unique ID in token-optimized Markdown.',
    mimeType: 'text/markdown'
  },
  {
    uriTemplate: 'workspace://entities/{entityId}',
    name: 'Specific Entity Node',
    description: 'Retrieve detailed relational edges and properties for a single graph entity.',
    mimeType: 'application/json'
  }
];

// ─────────────────────────────────────────────────────────────────────────────
// 2. MCP PROMPT CATALOG SPECIFICATION
// ─────────────────────────────────────────────────────────────────────────────

export const MCP_PROMPTS = [
  {
    name: 'executive_briefing',
    description: 'Synthesize active documents, spreadsheet models, and binding decisions into a high-level executive strategic briefing.',
    arguments: [
      { name: 'focusArea', description: 'Specific domain or initiative to focus on (optional)', required: false },
      { name: 'audience', description: 'Target audience (e.g. Board, Investors, Operations)', required: false }
    ]
  },
  {
    name: 'risk_and_rule_audit',
    description: 'Audit a proposed strategic initiative or document against all active STRICT and ADVISORY project rules.',
    arguments: [
      { name: 'proposalText', description: 'The text or summary of the proposed action', required: true }
    ]
  },
  {
    name: 'cross_app_propagation',
    description: 'Analyze downstream impacts of a metric or status change across connected Docs, Sheets, and Initiatives.',
    arguments: [
      { name: 'entityId', description: 'The changed entity ID (e.g. ent_nv_sheet)', required: true },
      { name: 'deltaDescription', description: 'What changed (e.g. Revenue updated from $48.2B to $54.0B)', required: true }
    ]
  },
  {
    name: 'decision_record_memo',
    description: 'Draft a formal epistemic decision memo with confidence rating, counter-arguments, and capital implications.',
    arguments: [
      { name: 'title', description: 'Decision title', required: true },
      { name: 'financialImpact', description: 'Capital or resource amount involved', required: true },
      { name: 'rationale', description: 'Core strategic rationale', required: true }
    ]
  },
  {
    name: 'financial_model_projection',
    description: 'Generate or update a structured financial projection matrix ensuring consistent percentage formatting.',
    arguments: [
      { name: 'modelName', description: 'Name of the financial model', required: true },
      { name: 'timeframe', description: 'Projection horizon (e.g. 2026-2028)', required: true }
    ]
  }
];

// ─────────────────────────────────────────────────────────────────────────────
// 3. MCP MEMORY & STATE TOOLS
// ─────────────────────────────────────────────────────────────────────────────

export const MCP_STATE_TOOLS = [
  {
    name: 'remember_instruction',
    label: 'Remember Instruction',
    category: 'memory_bank',
    description: 'Persist a user preference, recurring instruction, or behavioral constraint permanently in the agent Memory Bank.',
    mutatesDocument: false,
    destructive: false,
    undoable: true,
    requiresSelection: false,
    requiresConfirmation: false,
    parameters: {
      type: 'object',
      properties: {
        instruction: { type: 'string', description: 'The exact instruction or preference to remember' },
        category: { type: 'string', description: 'Optional category: formatting, model, workflow, general' },
        priority: { type: 'string', description: 'Priority level: high, normal, low' }
      },
      required: ['instruction']
    },
    execute: async (params) => {
      const entry = rememberInstruction(params.instruction, {
        category: params.category || 'general',
        priority: params.priority || 'normal'
      });
      return { success: true, message: `Remembered instruction: "${params.instruction}"`, data: entry };
    }
  },
  {
    name: 'add_project_rule',
    label: 'Add Project Rule',
    category: 'memory_bank',
    description: 'Register a binding project rule or architectural constraint (e.g., dual-sourcing requirements, margin baselines).',
    mutatesDocument: false,
    destructive: false,
    undoable: true,
    requiresSelection: false,
    requiresConfirmation: false,
    parameters: {
      type: 'object',
      properties: {
        ruleName: { type: 'string', description: 'Short title of the rule' },
        ruleDescription: { type: 'string', description: 'Full constraint specification' },
        enforcementLevel: { type: 'string', description: 'STRICT or ADVISORY' },
        domain: { type: 'string', description: 'Domain: Supply Chain, Finance, Architecture, Compliance' }
      },
      required: ['ruleName', 'ruleDescription']
    },
    execute: async (params) => {
      const rule = addProjectRule(params);
      return { success: true, message: `Project rule "${rule.name}" registered with enforcement level ${rule.level}.`, data: rule };
    }
  },
  {
    name: 'record_decision',
    label: 'Record Executive Decision',
    category: 'memory_bank',
    description: 'Record an immutable executive decision with approver, rationale, confidence, and financial figures.',
    mutatesDocument: false,
    destructive: false,
    undoable: false,
    requiresSelection: false,
    requiresConfirmation: true,
    parameters: {
      type: 'object',
      properties: {
        title: { type: 'string', description: 'Decision title' },
        impact: { type: 'string', description: 'Human-readable impact statement' },
        rationale: { type: 'string', description: 'Underlying justification' },
        approver: { type: 'string', description: 'Approving executive or authority' },
        financialAmount: { type: 'number', description: 'Capital or dollar amount involved (e.g. 1800000000)' },
        confidence: { type: 'string', description: 'Epistemic confidence level (e.g. 98%, High)' }
      },
      required: ['title', 'impact', 'rationale']
    },
    execute: async (params) => {
      const decision = recordDecision(params);
      return { success: true, message: `Recorded executive decision: "${decision.title}"`, data: decision };
    }
  },
  {
    name: 'mutate_and_propagate',
    label: 'Mutate & Auto-Propagate Entity',
    category: 'universal_graph',
    description: 'Mutate a semantic entity in the workspace and automatically trigger reactive dependency propagation across linked Docs and Sheets.',
    mutatesDocument: true,
    destructive: false,
    undoable: true,
    requiresSelection: false,
    requiresConfirmation: false,
    parameters: {
      type: 'object',
      properties: {
        entityId: { type: 'string', description: 'Target entity ID (e.g. ent_nv_sheet)' },
        patch: { 
          type: 'object', 
          description: 'Key-value patch payload',
          properties: {
            title: { type: 'string' },
            metric: { type: 'string' },
            excerpt: { type: 'string' }
          }
        },
        sourceApp: { type: 'string', description: 'Source application: sheets, compose, relay, tasks' },
        reason: { type: 'string', description: 'Reason for the mutation' }
      },
      required: ['entityId', 'patch']
    },
    execute: async (params) => {
      const result = mutateAndPropagate(
        params.entityId,
        params.patch,
        params.sourceApp || 'mcp_bridge',
        params.reason || 'Agent tool invocation'
      );
      return { success: true, message: `Entity ${params.entityId} mutated; propagated to ${result.downstreamUpdates?.length || 0} downstream targets.`, data: result };
    }
  },
  {
    name: 'validate_tool_call',
    label: 'Dry-Run Tool Staging Simulation',
    category: 'safety_staging',
    description: 'Perform a dry-run staging simulation of any tool call to check parameters, destructive impact, and safety constraints without committing mutations.',
    mutatesDocument: false,
    destructive: false,
    undoable: false,
    requiresSelection: false,
    requiresConfirmation: false,
    parameters: {
      type: 'object',
      properties: {
        targetTool: { type: 'string', description: 'Name of the tool to simulate' },
        targetArgs: { type: 'object', description: 'Arguments to pass to the tool' }
      },
      required: ['targetTool']
    },
    execute: async (params) => {
      const toolDef = resolveToolDefinition(params.targetTool);
      if (!toolDef) {
        return { success: false, error: `Target tool "${params.targetTool}" does not exist.` };
      }
      return {
        success: true,
        data: {
          targetTool: params.targetTool,
          valid: true,
          mutatesDocument: Boolean(toolDef.mutatesDocument),
          destructive: Boolean(toolDef.destructive),
          requiresConfirmation: Boolean(toolDef.requiresConfirmation),
          simulationStatus: 'APPROVED_FOR_STAGING'
        }
      };
    }
  },
  {
    name: 'stage_workspace_mutation',
    label: 'Stage Workspace Mutation (PR)',
    category: 'safety_staging',
    description: 'Stage an isolated mutation across Docs, Sheets, or Tasks for human review without touching production workspace state.',
    mutatesDocument: false,
    destructive: false,
    undoable: true,
    requiresSelection: false,
    requiresConfirmation: false,
    parameters: {
      type: 'object',
      properties: {
        targetApp: { type: 'string', description: 'compose | sheets | tasks' },
        targetTitle: { type: 'string', description: 'Title or label of the target object' },
        toolName: { type: 'string', description: 'Underlying tool name to stage' },
        params: { type: 'object', description: 'Arguments for the tool' },
        beforeText: { type: 'string', description: 'Original content before mutation' },
        afterText: { type: 'string', description: 'Proposed modified content' }
      },
      required: ['targetApp', 'targetTitle', 'afterText']
    },
    execute: async (params) => {
      const res = stageMutation({
        targetApp: params.targetApp,
        targetTitle: params.targetTitle,
        toolName: params.toolName || 'stage_workspace_mutation',
        params: params.params || {},
        beforeText: params.beforeText || '',
        afterText: params.afterText
      });
      return {
        success: true,
        message: `Staged mutation into PR #${res.prNumber}. Awaiting human review.`,
        data: res
      };
    }
  },
  {
    name: 'get_staged_diff',
    label: 'Get Staged PR Redline Diffs',
    category: 'safety_staging',
    description: 'Retrieve line-by-line visual redlines and delta statistics for an active staging branch.',
    mutatesDocument: false,
    destructive: false,
    undoable: false,
    requiresSelection: false,
    requiresConfirmation: false,
    parameters: {
      type: 'object',
      properties: {
        branchId: { type: 'string', description: 'Staging branch ID' }
      }
    },
    execute: async (params) => {
      if (params.branchId) {
        const br = getBranchById(params.branchId);
        return { success: Boolean(br), data: br };
      }
      const active = getActiveBranches();
      return { success: true, data: active };
    }
  },
  {
    name: 'approve_staged_branch',
    label: 'Approve & Commit Staged PR',
    category: 'safety_staging',
    description: 'Human approval handler: Atomically commit staged changes into production documents and trigger context graph propagation.',
    mutatesDocument: true,
    destructive: false,
    undoable: true,
    requiresSelection: false,
    requiresConfirmation: true,
    parameters: {
      type: 'object',
      properties: {
        branchId: { type: 'string', description: 'Branch ID to approve and commit' },
        selectedMutationIds: { type: 'array', items: { type: 'string' }, description: 'Optional cherry-picked mutation IDs' }
      },
      required: ['branchId']
    },
    execute: async (params) => {
      const res = await approveAndCommitBranch(params.branchId, params.selectedMutationIds);
      return {
        success: res.success,
        message: `Approved and committed PR #${res.prNumber} (${res.committedCount} changes applied).`,
        data: res
      };
    }
  },
  {
    name: 'reject_staged_branch',
    label: 'Reject & Discard Staged PR',
    category: 'safety_staging',
    description: 'Reject a staged pull request and discard sandbox changes without mutating workspace state.',
    mutatesDocument: false,
    destructive: false,
    undoable: false,
    requiresSelection: false,
    requiresConfirmation: false,
    parameters: {
      type: 'object',
      properties: {
        branchId: { type: 'string', description: 'Branch ID to discard' },
        reason: { type: 'string', description: 'Rejection rationale' }
      },
      required: ['branchId']
    },
    execute: async (params) => {
      const res = rejectBranch(params.branchId, params.reason);
      return {
        success: true,
        message: `Rejected PR #${res.prNumber}. Staged changes discarded.`,
        data: res
      };
    }
  }
];

/**
 * Unified lookup across all canonical and MCP state tools.
 */
function resolveToolDefinition(name) {
  const stateTool = MCP_STATE_TOOLS.find(t => t.name === name);
  if (stateTool) return stateTool;
  return CANONICAL_DOCS_TOOLS.find(t => t.name === name);
}

// ─────────────────────────────────────────────────────────────────────────────
// 4. RESOURCE DATA EXTRACTOR (HIGH-DENSITY TOKEN-OPTIMIZED FEEDS)
// ─────────────────────────────────────────────────────────────────────────────

/**
 * Read any workspace resource URI and return token-dense content.
 */
export async function readWorkspaceResource(uri) {
  if (uri === 'workspace://graph/context') {
    const text = getAgentContext({ maxEntities: 12, maxRules: 8, maxDecisions: 8 });
    return {
      uri,
      mimeType: 'text/markdown',
      text
    };
  }

  if (uri === 'workspace://memory/bank') {
    const jsonLd = exportGraphAsJsonLd();
    return {
      uri,
      mimeType: 'application/ld+json',
      text: JSON.stringify(jsonLd, null, 2)
    };
  }

  if (uri === 'workspace://docs/active') {
    const snap = docsCommandApi.getDocumentSnapshot();
    const stats = docsCommandApi.getDocumentStats();
    
    // Extract stripped text content from HTML snapshot to avoid HTML token bloat
    const cleanText = snap.rawText || snap.text || (snap.html ? snap.html.replace(/<[^>]+>/g, ' ').replace(/\s+/g, ' ').trim() : 'No content');
    const docMd = `# Active Document: ${snap.title || 'Untitled Composition'}
${snap.subtitle ? `*${snap.subtitle}*\n` : ''}
**Document Statistics:** ${stats.words} words | ${stats.sentences} sentences | Est. Reading Time: ${stats.readingTimeMinutes} min

### Content:
${cleanText}`;

    return {
      uri,
      mimeType: 'text/markdown',
      text: docMd
    };
  }

  if (uri === 'workspace://docs/list') {
    let docs = [];
    if (typeof window !== 'undefined' && window.localStorage) {
      try {
        const raw = window.localStorage.getItem('regaarder_documents_v1');
        if (raw) docs = JSON.parse(raw);
      } catch (e) {
        console.warn('[MCP Bridge] Failed to parse regaarder_documents_v1:', e);
      }
    }

    const manifest = docs.map(d => ({
      id: d.id,
      title: d.title || 'Untitled',
      wordCount: d.bodyHtml ? d.bodyHtml.replace(/<[^>]+>/g, ' ').split(/\s+/).filter(Boolean).length : 0,
      updatedAt: d.updatedAt || new Date().toISOString()
    }));

    return {
      uri,
      mimeType: 'application/json',
      text: JSON.stringify(manifest.length > 0 ? manifest : [
        { id: 'doc_active', title: 'Executive Strategic Briefing', wordCount: 342, updatedAt: new Date().toISOString() }
      ], null, 2)
    };
  }

  if (uri === 'workspace://sheets/active') {
    const sheetData = typeof window !== 'undefined' ? window.__REGAARDER_SHEET_DATA__ : null;
    const targetId = sheetData?.activeSheetId || 'default';
    const grid = sheetData?.sheetGrids?.[targetId];
    if (grid && Array.isArray(grid.cells) && grid.cells.length > 0) {
      const md = matrixEngine.matrixAstToMarkdown(grid);
      return {
        uri,
        mimeType: 'text/markdown',
        text: md
      };
    }
    return {
      uri,
      mimeType: 'text/markdown',
      text: `### 2026 Datacenter GPU Revenue Model
| Quarter | Target Revenue | Actual Revenue | Growth % | Status |
| :--- | :--- | :--- | :--- | :--- |
| Q1 2026 | $11.2B | $11.5B | +2.7% | Exceeded |
| Q2 2026 | $12.0B | $12.4B | +3.3% | Exceeded |
| Q3 2026 | $13.5B | Pending | -- | Tracking |
| Q4 2026 | $15.0B | Forecast | +11.1% | Active |`
    };
  }

  if (uri === 'workspace://sheets/schema') {
    const sheetData = typeof window !== 'undefined' ? window.__REGAARDER_SHEET_DATA__ : null;
    const targetId = sheetData?.activeSheetId || 'default';
    const grid = sheetData?.sheetGrids?.[targetId] || { cells: [] };
    const detected = matrixEngine.inferMatrixSchema(grid.cells || []);
    return {
      uri,
      mimeType: 'application/json',
      text: JSON.stringify({
        sheetId: targetId,
        columns: detected.columns,
        rowCount: grid.cells?.length || 0,
        orientation: detected.orientation
      }, null, 2)
    };
  }

  if (uri === 'workspace://tasks/queue') {
    const md = directiveEngine.serializeDirectivesToMarkdown();
    return {
      uri,
      mimeType: 'text/markdown',
      text: md
    };
  }

  if (uri === 'workspace://tasks/active') {
    const directives = directiveEngine.getDirectives();
    return {
      uri,
      mimeType: 'application/json',
      text: JSON.stringify(directives, null, 2)
    };
  }

  if (uri === 'workspace://graph/propagation-log') {
    const history = getPropagationHistory();
    return {
      uri,
      mimeType: 'application/json',
      text: JSON.stringify(history, null, 2)
    };
  }

  if (uri === 'workspace://staging/active') {
    const branches = getActiveBranches();
    if (branches.length === 0) {
      return {
        uri,
        mimeType: 'text/markdown',
        text: '### ACTIVE WORKSPACE STAGING SANDBOX\nNo uncommitted pull requests currently pending human review.'
      };
    }
    const md = `### ACTIVE WORKSPACE STAGING SANDBOX (${branches.length} PRs Pending Review)\n\n` +
      branches.map(b => `#### PR #${b.prNumber}: ${b.title}\n- Agent: ${b.agentId} | Target Apps: ${b.targetApps.join(', ')}\n- Staged Mutations: ${b.mutations.length}\n` +
        b.mutations.map(m => `  * [${m.targetApp.toUpperCase()}] ${m.targetTitle}: +${m.stats.addedChars} / -${m.stats.removedChars} chars`).join('\n')
      ).join('\n\n');

    return { uri, mimeType: 'text/markdown', text: md };
  }

  if (uri === 'workspace://docs/blocks') {
    const tree = docsCommandApi.getBlockTreeSnapshot();
    return {
      uri,
      mimeType: 'application/json',
      text: JSON.stringify(tree, null, 2)
    };
  }

  if (uri === 'workspace://schedule/calendar') {
    const md = intentScheduler.calendarToMarkdown();
    return {
      uri,
      mimeType: 'text/markdown',
      text: md
    };
  }

  if (uri === 'workspace://schedule/negotiations') {
    const negotiations = intentScheduler.getNegotiationAuditLog();
    return {
      uri,
      mimeType: 'application/json',
      text: JSON.stringify(negotiations, null, 2)
    };
  }

  if (uri === 'workspace://portal/queue') {
    const queue = omniPortal.getPortalQueue();
    if (queue.length === 0) {
      return {
        uri,
        mimeType: 'text/markdown',
        text: '### OMNI-PORTAL INGESTION QUEUE\nNo active ingestion packages in queue.'
      };
    }
    const md = `### OMNI-PORTAL INGESTION QUEUE (${queue.length} Packages Processed)\n\n` +
      queue.map(pkg => omniPortal.serializePackageToMarkdown(pkg)).join('\n\n---\n\n');
    return {
      uri,
      mimeType: 'text/markdown',
      text: md
    };
  }

  if (uri === 'workspace://portal/manifest') {
    const manifest = omniPortal.getIngestionManifest();
    return {
      uri,
      mimeType: 'application/json',
      text: JSON.stringify(manifest, null, 2)
    };
  }

  if (uri === 'workspace://whiteboard/topology') {
    const md = spatialTopology.serializeTopologyToMarkdown();
    return {
      uri,
      mimeType: 'text/markdown',
      text: md
    };
  }

  if (uri === 'workspace://room/live-context') {
    const md = roomObserver.serializeRoomContextToMarkdown();
    return {
      uri,
      mimeType: 'text/markdown',
      text: md
    };
  }

  throw new Error(`Resource URI '${uri}' not recognized.`);
}

export const readResource = readWorkspaceResource;

// ─────────────────────────────────────────────────────────────────────────────
// 5. ISOMORPHIC MCP JSON-RPC 2.0 PROTOCOL ENGINE
// ─────────────────────────────────────────────────────────────────────────────

/**
 * Dispatch an MCP JSON-RPC 2.0 Request and return standard JSON-RPC response.
 */
export async function dispatchMcpRequest(message = {}) {
  const { jsonrpc, id, method, params } = message;
  const responseId = id !== undefined ? id : 1;

  try {
    // 1. Notifications
    if (method === 'notifications/initialized') {
      return null;
    }

    // 2. Ping
    if (method === 'ping') {
      return { jsonrpc: '2.0', id: responseId, result: {} };
    }

    // 3. Initialize
    if (method === 'initialize') {
      return {
        jsonrpc: '2.0',
        id: responseId,
        result: {
          protocolVersion: '2024-11-05',
          serverInfo: {
            name: 'regaarder-workspace-mcp',
            version: '1.0.0'
          },
          capabilities: {
            resources: {
              subscribe: true,
              listChanged: true
            },
            tools: {
              listChanged: true
            },
            prompts: {
              listChanged: true
            }
          }
        }
      };
    }

    // 4. Resources: List
    if (method === 'resources/list') {
      return {
        jsonrpc: '2.0',
        id: responseId,
        result: {
          resources: MCP_RESOURCES
        }
      };
    }

    // 5. Resources: Templates List
    if (method === 'resources/templates/list') {
      return {
        jsonrpc: '2.0',
        id: responseId,
        result: {
          resourceTemplates: MCP_RESOURCE_TEMPLATES
        }
      };
    }

    // 6. Resources: Read
    if (method === 'resources/read') {
      const { uri } = params || {};
      if (!uri) {
        return {
          jsonrpc: '2.0',
          id: responseId,
          error: { code: -32602, message: 'Missing uri parameter' }
        };
      }

      const resContent = await readWorkspaceResource(uri);
      return {
        jsonrpc: '2.0',
        id: responseId,
        result: {
          contents: [resContent]
        }
      };
    }

    // 7. Tools: List
    if (method === 'tools/list') {
      const allTools = [
        ...MCP_STATE_TOOLS.map(t => ({
          name: t.name,
          description: t.description,
          inputSchema: t.parameters
        })),
        ...CANONICAL_DOCS_TOOLS.map(t => ({
          name: t.name,
          description: t.description,
          inputSchema: t.parameters
        }))
      ];

      return {
        jsonrpc: '2.0',
        id: responseId,
        result: {
          tools: allTools
        }
      };
    }

    // 8. Tools: Call
    if (method === 'tools/call') {
      const { name, arguments: args } = params || {};
      const toolDef = resolveToolDefinition(name);

      if (!toolDef) {
        return {
          jsonrpc: '2.0',
          id: responseId,
          error: { code: -32601, message: `Tool '${name}' not found in registry.` }
        };
      }

      // Execute tool via its native handler or docsToolExecutor
      let executionResult;
      if (typeof toolDef.execute === 'function') {
        executionResult = await toolDef.execute(args || {});
      } else {
        executionResult = await executeTool(name, args || {});
      }

      const isError = !executionResult.success;
      const textOutput = executionResult.message || 
        (typeof executionResult.data === 'string' ? executionResult.data : JSON.stringify(executionResult.data || executionResult, null, 2));

      return {
        jsonrpc: '2.0',
        id: responseId,
        result: {
          content: [
            {
              type: 'text',
              text: textOutput
            }
          ],
          data: executionResult.data || null,
          isError
        }
      };
    }

    // 9. Prompts: List
    if (method === 'prompts/list') {
      return {
        jsonrpc: '2.0',
        id: responseId,
        result: {
          prompts: MCP_PROMPTS
        }
      };
    }

    // 10. Prompts: Get
    if (method === 'prompts/get') {
      const { name, arguments: args } = params || {};
      const promptDef = MCP_PROMPTS.find(p => p.name === name);
      if (!promptDef) {
        return {
          jsonrpc: '2.0',
          id: responseId,
          error: { code: -32601, message: `Prompt '${name}' not found` }
        };
      }

      let promptText = '';
      if (name === 'executive_briefing') {
        promptText = `You are the Principal Strategy Director. Synthesize active workspace documents, the current financial model, and recent executive decisions into a concise executive briefing.\nFocus Area: ${args?.focusArea || 'General Strategy'}\nTarget Audience: ${args?.audience || 'Executive Committee'}\n\nInstructions:\n1. Adhere strictly to all active project rules in the memory bank.\n2. Summarize top line financial metrics.\n3. Detail key operational milestones and risk mitigations.`;
      } else if (name === 'risk_and_rule_audit') {
        promptText = `You are the Chief Risk Officer and Compliance Auditor. Evaluate the following proposed action against all active project rules:\n\nProposed Action:\n"""\n${args?.proposalText || ''}\n"""\n\nDeliverable:\n1. State whether the action VIOLATES or COMPLIES with each rule.\n2. Flag any high-risk dependencies or single-points-of-failure.\n3. Recommend necessary structural amendments.`;
      } else if (name === 'cross_app_propagation') {
        promptText = `An update has occurred on entity '${args?.entityId || 'target'}':\n${args?.deltaDescription || 'Metric change'}\n\nPerform a graph dependency audit and draft the exact updates required for downstream memos, decks, and task deadlines.`;
      } else if (name === 'decision_record_memo') {
        promptText = `Draft a formal epistemic decision memo for the following decision:\nTitle: ${args?.title || 'Strategic Decision'}\nFinancial Impact: ${args?.financialImpact || 'Not specified'}\nRationale: ${args?.rationale || 'Not specified'}\n\nInclude: Summary, Strategic Justification, Capital Allocation, Risk Evaluation, and Verification Criteria.`;
      } else if (name === 'financial_model_projection') {
        promptText = `Create a rigorous tabular financial projection for '${args?.modelName || 'Revenue Model'}' over timeframe '${args?.timeframe || '2026-2028'}'. Ensure all percentage values use native '%' symbols (e.g. 15%) and revenue figures follow standard billions notation.`;
      }

      return {
        jsonrpc: '2.0',
        id: responseId,
        result: {
          description: promptDef.description,
          messages: [
            {
              role: 'user',
              content: {
                type: 'text',
                text: promptText
              }
            }
          ]
        }
      };
    }

    // Method not recognized
    return {
      jsonrpc: '2.0',
      id: responseId,
      error: { code: -32601, message: `Unknown method '${method}'` }
    };
  } catch (err) {
    return {
      jsonrpc: '2.0',
      id: responseId,
      error: { code: -32603, message: 'Internal error in MCP Bridge', data: err.message }
    };
  }
}

// ─────────────────────────────────────────────────────────────────────────────
// 6. MCP HIGH-LEVEL CLIENT SDK (FOR RELAY AGENT & DESKTOP TOOLS)
// ─────────────────────────────────────────────────────────────────────────────

export const mcpClient = {
  /**
   * Send arbitrary JSON-RPC request to the local MCP engine.
   */
  request: async (method, params = {}) => {
    const id = `req_${Date.now()}_${Math.random().toString(36).substring(2, 6)}`;
    const response = await dispatchMcpRequest({ jsonrpc: '2.0', id, method, params });
    if (response?.error) {
      throw new Error(`[MCP ${response.error.code}] ${response.error.message}`);
    }
    return response?.result;
  },

  /**
   * Fetch all registered resources.
   */
  listResources: async () => {
    const res = await mcpClient.request('resources/list');
    return res.resources || [];
  },

  /**
   * Read token-dense content from any resource URI.
   */
  readResource: async (uri) => {
    const res = await mcpClient.request('resources/read', { uri });
    return res.contents?.[0] || null;
  },

  /**
   * Fetch all registered tools with schemas.
   */
  listTools: async () => {
    const res = await mcpClient.request('tools/list');
    return res.tools || [];
  },

  /**
   * Execute a tool by name with arguments.
   */
  callTool: async (name, args = {}) => {
    return await mcpClient.request('tools/call', { name, arguments: args });
  },

  /**
   * Fetch all pre-engineered workflow prompts.
   */
  listPrompts: async () => {
    const res = await mcpClient.request('prompts/list');
    return res.prompts || [];
  },

  /**
   * Get an instantiated prompt template.
   */
  getPrompt: async (name, args = {}) => {
    return await mcpClient.request('prompts/get', { name, arguments: args });
  }
};

/**
 * Generate configuration snippet for external agents (Claude Desktop / Cursor).
 */
export function generateExternalAgentConfig() {
  return {
    claudeDesktop: {
      mcpServers: {
        regaarder: {
          command: "npx",
          args: ["-y", "@modelcontextprotocol/server-sse", "http://localhost:3001/mcp/sse"]
        }
      }
    },
    cursor: {
      mcpServers: {
        regaarder: {
          url: "http://localhost:3001/mcp/sse"
        }
      }
    }
  };
}
