/**
 * test-intent-scheduler.js
 * 
 * Pillar 6: The Constraint-Based Intent Scheduler & Multi-Agent Negotiation Test Suite
 * 
 * Exhaustively validates:
 * 1. Rule 4: Context-Aware Intent Interpretation (colloquial intent -> systemic domain specifications).
 * 2. Mathematical Constraint Satisfaction Problem (CSP) Solver (hard constraints, utility function U(slot)).
 * 3. Multi-Agent Parameter Negotiation Protocol (alternating offers, monotonic concessions, Pareto convergence).
 * 4. Temporal Conflict Matrix & Automated Resolution (priority bump, compression, Pillar 3 staging).
 * 5. 5 Canonical Tools & docsToolRegistry / docsToolExecutor Runtime (direct execution + isolated staging).
 * 6. Native Model Context Protocol (MCP) Feeds (workspace://schedule/calendar & workspace://schedule/negotiations).
 * 7. Universal Context Graph Propagation & Memory Logging.
 */

import assert from 'assert';
import * as intentScheduler from '../src/services/intentSchedulerEngine.js';
import { executeTool } from '../src/services/docsToolExecutor.js';
import { getToolByName, DOCS_TOOL_CATEGORIES } from '../src/services/docsToolRegistry.js';
import { readWorkspaceResource } from '../src/services/universalMcpBridge.js';
import { processMcpRequest } from '../server/mcpTools.js';
import { recordScheduledEventGraphNode, recordNegotiationGraphNode, getMemoryBank } from '../src/services/universalContextGraph.js';
import { getBranchById } from '../src/services/workspaceStagingEngine.js';

let passedTests = 0;
let totalTests = 0;

async function test(name, fn) {
  totalTests++;
  try {
    await fn();
    console.log(`  ✓ ${name}`);
    passedTests++;
  } catch (err) {
    console.error(`  ✗ ${name}`);
    console.error(`    ${err.message}`);
    throw err;
  }
}

async function runAllTests() {
  console.log('\n===============================================================');
  console.log('🧪 RUNNING PILLAR 6: THE CONSTRAINT-BASED INTENT SCHEDULER TEST SUITE');
  console.log('===============================================================\n');

  // ── 1. RULE 4: CONTEXT-AWARE INTENT INTERPRETER ─────────────────────────────
  console.log('--- Suite 1: Rule 4: Context-Aware Intent Interpretation ---');

  await test('Maps colloquial "Tennis practice" to systemic health_athletics domain specifications', () => {
    const spec = intentScheduler.parseIntentToScheduleSpec('Tennis practice');
    assert.strictEqual(spec.title, 'Tennis Practice');
    assert.strictEqual(spec.intentCategory, 'health_athletics');
    assert.strictEqual(spec.durationMin, 90, 'Athletics duration must default to 90 min');
    assert.strictEqual(spec.constraints.prepBufferMin, 20, 'Must include 20m prep buffer');
    assert.strictEqual(spec.constraints.cooldownBufferMin, 20, 'Must include 20m cooldown buffer');
    assert.strictEqual(spec.constraints.energyRequirement, 'high');
  });

  await test('Maps "Board prep sync" to executive_strategy with high priority and prep buffer', () => {
    const spec = intentScheduler.parseIntentToScheduleSpec('Board prep sync with Alex');
    assert.strictEqual(spec.intentCategory, 'executive_strategy');
    assert.strictEqual(spec.priority, 'p0_critical');
    assert.strictEqual(spec.constraints.prepBufferMin, 30);
    assert.strictEqual(spec.durationMin, 60);
  });

  await test('Maps "Q3 Financial Audit" to financial_projection with linked sheet expectations', () => {
    const spec = intentScheduler.parseIntentToScheduleSpec('Q3 financial audit session');
    assert.strictEqual(spec.intentCategory, 'financial_projection');
    assert.strictEqual(spec.priority, 'p1_high');
    assert.strictEqual(spec.durationMin, 60);
  });

  await test('Preserves manual overrides over colloquial defaults when provided', () => {
    const spec = intentScheduler.parseIntentToScheduleSpec('Tennis practice', {
      durationMinutes: 45,
      domain: 'personal_fitness'
    });
    assert.strictEqual(spec.durationMin, 45);
    assert.strictEqual(spec.intentCategory, 'personal_fitness');
  });

  // ── 2. MATHEMATICAL CSP SOLVER & UTILITY EVALUATION ─────────────────────────
  console.log('\n--- Suite 2: Mathematical CSP Solver & Slot Utility Optimization ---');

  await test('Solves CSP forward checking across participant working windows and buffers', () => {
    const spec = intentScheduler.parseIntentToScheduleSpec('Architecture Review', {
      participants: ['user-joshua', 'agent-alex'],
      durationMinutes: 45
    });
    const solution = intentScheduler.solveScheduleConstraints(spec);
    assert.strictEqual(solution.success, true);
    assert.ok(solution.candidateSlots.length > 0, 'Must identify feasible candidate slots');

    // Verify slots respect working hours boundary (9:00 - 18:00)
    for (const slot of solution.candidateSlots) {
      assert.ok(slot.startMinutes >= 9 * 60, 'Slot start must be >= 09:00');
      assert.ok(slot.endMinutes <= 18 * 60, 'Slot end must be <= 18:00');
      assert.strictEqual(slot.durationMin, 45);
      assert.ok(slot.utilityScore >= 0 && slot.utilityScore <= 1, 'Utility must be bounded in [0, 1]');
    }
  });

  await test('Utility function penalizes slots colliding with lunch buffer (12:00 - 13:00)', () => {
    const morningSlot = { startMinutes: 10 * 60, endMinutes: 11 * 60 };
    const lunchSlot = { startMinutes: 12 * 60, endMinutes: 13 * 60 };
    const participants = ['user-joshua'];

    const uMorning = intentScheduler.evaluateSlotUtility(morningSlot, participants);
    const uLunch = intentScheduler.evaluateSlotUtility(lunchSlot, participants);

    assert.ok(uMorning > uLunch, `Morning utility (${uMorning}) must exceed lunch utility (${uLunch})`);
  });

  await test('Ranks feasible candidate slots monotonically by composite utility score', () => {
    const spec = intentScheduler.parseIntentToScheduleSpec('Team Sync', {
      participants: ['user-joshua', 'agent-alex', 'agent-elena'],
      durationMinutes: 30
    });
    const solution = intentScheduler.solveScheduleConstraints(spec, { limit: 5 });
    assert.strictEqual(solution.success, true);

    const slots = solution.candidateSlots;
    for (let i = 1; i < slots.length; i++) {
      assert.ok(slots[i - 1].utilityScore >= slots[i].utilityScore, 'Slots must be ranked in descending utility order');
    }
  });

  // ── 3. MULTI-AGENT PARAMETER NEGOTIATION PROTOCOL ───────────────────────────
  console.log('\n--- Suite 3: Multi-Agent Parameter Negotiation Protocol ---');

  await test('Conducts alternating-offer negotiation rounds between Alex and Elena with Pareto convergence', () => {
    const spec = intentScheduler.parseIntentToScheduleSpec('Product Architecture Alignment', {
      participants: ['agent-alex', 'agent-elena'],
      durationMinutes: 45
    });

    const result = intentScheduler.negotiateScheduleBetweenAgents(spec, {
      maxRounds: 4,
      convergenceThreshold: 0.65
    });

    assert.strictEqual(result.success, true);
    assert.strictEqual(result.status, 'AGREEMENT_REACHED');
    assert.ok(result.agreedSlot !== null, 'Negotiation must converge on an agreed slot');
    assert.ok(result.negotiationRecord.roundsCount >= 1, 'At least 1 round must be logged');
    assert.ok(result.negotiationRecord.transcript.length >= 1, 'Transcript must contain round data');

    const firstRound = result.negotiationRecord.transcript[0];
    assert.strictEqual(firstRound.proposer.id, 'agent-alex');
    assert.strictEqual(firstRound.receiver.id, 'agent-elena');
    assert.ok(typeof firstRound.compositeUtility === 'number');
    assert.ok(firstRound.rationale.length > 0);
  });

  await test('Persists negotiation audit log into reactive memory cache', () => {
    const auditLog = intentScheduler.getNegotiationAuditLog();
    assert.ok(Array.isArray(auditLog));
    assert.ok(auditLog.length > 0, 'Audit log must record active negotiations');
    assert.ok(auditLog[0].id.startsWith('neg_'));
  });

  // ── 4. TEMPORAL CONFLICT MATRIX & RESOLUTION ────────────────────────────────
  console.log('\n--- Suite 4: Temporal Conflict Matrix & Resolution Engine ---');

  await test('Detects temporal and participant collisions between overlapping events', () => {
    const baseTime = Date.now() + 1000 * 60 * 60 * 48; // in 2 days
    const mockEvents = [
      {
        id: 'evt-test-1',
        title: 'Executive Sync',
        startTime: new Date(baseTime).toISOString(),
        endTime: new Date(baseTime + 1000 * 60 * 60).toISOString(), // 1 hr
        participants: ['user-joshua', 'agent-alex'],
        priority: 'p1_high'
      },
      {
        id: 'evt-test-2',
        title: 'Conflicting Design Review',
        startTime: new Date(baseTime + 1000 * 60 * 30).toISOString(), // starts 30m in
        endTime: new Date(baseTime + 1000 * 60 * 90).toISOString(),
        participants: ['agent-alex', 'agent-elena'],
        priority: 'p2_medium'
      }
    ];

    const diag = intentScheduler.detectScheduleConflicts(mockEvents);
    assert.strictEqual(diag.hasConflicts, true);
    assert.strictEqual(diag.conflictCount, 1);
    assert.strictEqual(diag.conflicts[0].overlapMinutes, 30);
    assert.deepStrictEqual(diag.conflicts[0].sharedParticipants, ['agent-alex']);
  });

  await test('Resolves conflict via priority_bump strategy by auto-shifting lower priority event', () => {
    const baseTime = Date.now() + 1000 * 60 * 60 * 72;
    const eHigh = {
      id: 'evt-high-1',
      title: 'P0 Critical Board Meeting',
      startTime: new Date(baseTime).toISOString(),
      endTime: new Date(baseTime + 1000 * 60 * 60).toISOString(),
      participants: ['user-joshua', 'agent-alex'],
      priority: 'p0_critical'
    };
    const eLow = {
      id: 'evt-low-1',
      title: 'P2 Design Chat',
      startTime: new Date(baseTime + 1000 * 60 * 15).toISOString(),
      endTime: new Date(baseTime + 1000 * 60 * 60).toISOString(),
      participants: ['agent-alex'],
      priority: 'p2_medium'
    };

    intentScheduler.createScheduledEvent(eHigh);
    intentScheduler.createScheduledEvent(eLow);

    const diag = intentScheduler.detectScheduleConflicts();
    const conflict = diag.conflicts.find(c => c.primaryEvent?.id === eHigh.id || c.secondaryEvent?.id === eHigh.id);
    assert.ok(conflict, 'Conflict between eHigh and eLow must be detected');

    const resolution = intentScheduler.resolveScheduleConflict({
      conflictId: conflict.id,
      strategy: 'priority_bump',
      stage: false
    });

    assert.strictEqual(resolution.success, true);
    assert.strictEqual(resolution.isStaged, false);
    // Verified shifted event now starts after high priority event
    const shiftedTime = new Date(resolution.updatedEvent.startTime).getTime();
    const highEndTime = new Date(eHigh.endTime).getTime();
    assert.ok(shiftedTime >= highEndTime, 'Lower priority event must be pushed past high priority end');
  });

  await test('Stages conflict resolution into isolated Pillar 3 PR branch when stage: true', () => {
    const baseTime = Date.now() + 1000 * 60 * 60 * 96;
    const e1 = {
      id: 'evt-stage-1',
      title: 'Roadmap Planning',
      startTime: new Date(baseTime).toISOString(),
      endTime: new Date(baseTime + 1000 * 60 * 60).toISOString(),
      participants: ['user-joshua', 'agent-david'],
      priority: 'p1_high'
    };
    const e2 = {
      id: 'evt-stage-2',
      title: 'Infra Sync',
      startTime: new Date(baseTime + 1000 * 60 * 20).toISOString(),
      endTime: new Date(baseTime + 1000 * 60 * 60).toISOString(),
      participants: ['agent-david'],
      priority: 'p2_medium'
    };

    intentScheduler.createScheduledEvent(e1);
    intentScheduler.createScheduledEvent(e2);

    const diag = intentScheduler.detectScheduleConflicts();
    const conflict = diag.conflicts.find(c => c.primaryEvent?.id === e1.id || c.secondaryEvent?.id === e1.id);
    assert.ok(conflict);

    const stagedResolution = intentScheduler.resolveScheduleConflict({
      conflictId: conflict.id,
      strategy: 'duration_compression',
      stage: true
    });

    assert.strictEqual(stagedResolution.success, true);
    assert.strictEqual(stagedResolution.isStaged, true);
    assert.ok(stagedResolution.branchId, 'Must generate staging branch ID');

    const branch = getBranchById(stagedResolution.branchId);
    assert.ok(branch, 'Staged branch must exist in staging sandbox');
    assert.strictEqual(branch.targetApps[0], 'schedule');
  });

  // ── 5. CANONICAL TOOLS REGISTRY & EXECUTOR RUNTIME ──────────────────────────
  console.log('\n--- Suite 5: Canonical Schedule Tools & docsToolExecutor ---');

  await test('Verifies all 5 canonical schedule tools are registered with rich safety metadata', () => {
    const requiredTools = [
      'solve_schedule_constraints',
      'negotiate_multi_agent_schedule',
      'detect_schedule_conflicts',
      'resolve_schedule_conflict',
      'commit_scheduled_event'
    ];

    for (const toolName of requiredTools) {
      const toolDef = getToolByName(toolName);
      assert.ok(toolDef, `Tool "${toolName}" must be registered`);
      assert.strictEqual(toolDef.category, DOCS_TOOL_CATEGORIES.SCHEDULE_TOOLS);
      assert.ok(typeof toolDef.description === 'string');
      assert.ok(typeof toolDef.execute === 'function');
      assert.strictEqual(typeof toolDef.mutatesDocument, 'boolean');
    }
  });

  await test('Executes "solve_schedule_constraints" via docsToolExecutor runtime', async () => {
    const res = await executeTool('solve_schedule_constraints', {
      intent: 'Board meeting sync',
      domain: 'executive_strategy',
      durationMinutes: 60
    });

    assert.strictEqual(res.success, true);
    assert.strictEqual(res.toolName, 'solve_schedule_constraints');
    assert.ok(res.data.candidateSlots.length > 0);
  });

  await test('Executes "commit_scheduled_event" in staging mode via docsToolExecutor', async () => {
    const res = await executeTool('commit_scheduled_event', {
      event: {
        title: 'Investor Dinner Prep',
        start: new Date().toISOString(),
        end: new Date(Date.now() + 3600000).toISOString(),
        participants: ['user-joshua', 'agent-alex']
      }
    }, {}, { stage: true });

    assert.strictEqual(res.success, true);
    assert.strictEqual(res.isStaged, true);
    assert.ok(res.prNumber > 0);
  });

  // ── 6. NATIVE MCP PROTOCOL RESOURCES ─────────────────────────────────────────
  console.log('\n--- Suite 6: Model Context Protocol (MCP) Integration ---');

  await test('Reads "workspace://schedule/calendar" as token-optimized Markdown feed', async () => {
    const resource = await readWorkspaceResource('workspace://schedule/calendar');
    assert.strictEqual(resource.uri, 'workspace://schedule/calendar');
    assert.strictEqual(resource.mimeType, 'text/markdown');
    assert.ok(resource.text.includes('# Workspace Schedule & Intent Calendar'));
    assert.ok(resource.text.includes('| Time Window | Title | Category | Priority | Participants | Status |'));
  });

  await test('Reads "workspace://schedule/negotiations" as JSON audit feed', async () => {
    const resource = await readWorkspaceResource('workspace://schedule/negotiations');
    assert.strictEqual(resource.uri, 'workspace://schedule/negotiations');
    assert.strictEqual(resource.mimeType, 'application/json');
    const parsed = JSON.parse(resource.text);
    assert.ok(Array.isArray(parsed));
  });

  await test('Server-side processMcpRequest dispatches schedule tools and resources', () => {
    // 1. Resource read via JSON-RPC
    const rpcRes = processMcpRequest({
      jsonrpc: '2.0',
      id: 101,
      method: 'resources/read',
      params: { uri: 'workspace://schedule/calendar' }
    });
    assert.strictEqual(rpcRes.id, 101);
    assert.strictEqual(rpcRes.result.contents[0].uri, 'workspace://schedule/calendar');

    // 2. Tool call via JSON-RPC
    const rpcTool = processMcpRequest({
      jsonrpc: '2.0',
      id: 102,
      method: 'tools/call',
      params: {
        name: 'solve_schedule_constraints',
        arguments: { intent: 'Q4 Strategy Session' }
      }
    });
    assert.strictEqual(rpcTool.id, 102);
    assert.strictEqual(rpcTool.result.isError, false);
  });

  // ── 7. UNIVERSAL CONTEXT GRAPH PROPAGATION ──────────────────────────────────
  console.log('\n--- Suite 7: Universal Context Graph Propagation ---');

  await test('Records scheduled event into Universal Context Graph with participant edges', () => {
    const event = {
      id: 'evt-graph-test',
      title: 'AI Steering Committee',
      startTime: new Date().toISOString(),
      endTime: new Date(Date.now() + 3600000).toISOString(),
      intentCategory: 'executive_review',
      priority: 'p0_critical',
      participants: ['user-joshua', 'agent-alex']
    };

    const node = recordScheduledEventGraphNode(event);
    assert.strictEqual(node.workspace, 'schedule');
    assert.strictEqual(node.title, 'AI Steering Committee');
    assert.strictEqual(node.metadata.scheduleEventId, 'evt-graph-test');
  });

  await test('Records multi-agent negotiation into Universal Context Graph as decision node', () => {
    const neg = {
      id: 'neg_test_999',
      title: 'Steering Committee Convergence',
      status: 'AGREEMENT_REACHED',
      roundsCount: 3,
      agreedSlot: { formattedTime: 'Tomorrow 10:00 - 11:00', start: new Date().toISOString() }
    };

    const node = recordNegotiationGraphNode(neg);
    assert.strictEqual(node.type, 'DECISION');
    assert.strictEqual(node.workspace, 'schedule');
    assert.strictEqual(node.metadata.negotiationId, 'neg_test_999');
  });

  console.log('\n===============================================================');
  console.log(`✅ ALL PILLAR 6 TESTS PASSED: ${passedTests}/${totalTests} assertions`);
  console.log('===============================================================\n');
}

runAllTests().catch((err) => {
  console.error('\n❌ Test Suite Failed:', err);
  process.exit(1);
});
