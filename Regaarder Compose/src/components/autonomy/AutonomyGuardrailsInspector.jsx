import React, { useState, useEffect } from 'react';
import { 
  ShieldCheck, ShieldAlert, CheckCircle2, AlertTriangle, 
  Plus, Play, RefreshCcw, DollarSign, Lock, FileText, 
  Trash2, ToggleLeft, ToggleRight, Check, X, Sliders 
} from 'lucide-react';
import { 
  getActivePolicies, 
  savePolicy, 
  deletePolicy, 
  resetPoliciesToDefault, 
  subscribeToPolicies, 
  evaluateActionAutonomy 
} from '../../services/actionPolicyEngine.js';
import { 
  getRegisteredAcceptanceTests, 
  registerAcceptanceTest, 
  runAcceptanceCriteria 
} from '../../services/workspaceTestEngine.js';

export default function AutonomyGuardrailsInspector() {
  const [policies, setPolicies] = useState(() => getActivePolicies());
  const [tests, setTests] = useState(() => getRegisteredAcceptanceTests());
  const [activeTab, setActiveTab] = useState('policies'); // 'policies' | 'tests' | 'simulator'

  // Policy editing state
  const [editingPolicy, setEditingPolicy] = useState(null);
  const [newPolicyName, setNewPolicyName] = useState('');
  const [newPattern, setNewPattern] = useState('');
  const [newMaxDelta, setNewMaxDelta] = useState('500');

  // Simulator state
  const [simToolName, setSimToolName] = useState('update_sheet_cell');
  const [simDelta, setSimDelta] = useState('650');
  const [simBlockId, setSimBlockId] = useState('');
  const [simResult, setSimResult] = useState(null);

  // Test Runner Simulation State
  const [testSampleText, setTestSampleText] = useState(
    'Executive Q2 summary: The datacenter GPU revenue model reached $12.4B, meeting SOC2 compliance with KMS envelopes and regional boundaries.'
  );
  const [testRunOutput, setTestRunOutput] = useState(null);

  useEffect(() => {
    const unsub = subscribeToPolicies(updated => {
      setPolicies(updated);
    });
    return unsub;
  }, []);

  const handleTogglePolicy = (policy) => {
    savePolicy({
      ...policy,
      enabled: !policy.enabled
    });
  };

  const handleAddPolicy = (e) => {
    e.preventDefault();
    if (!newPolicyName || !newPattern) return;

    savePolicy({
      name: newPolicyName,
      actionPattern: newPattern,
      description: `Custom policy for ${newPattern}`,
      category: 'custom',
      severity: 'STRICT',
      enabled: true,
      rules: {
        type: 'numeric_threshold',
        field: 'deltaAmount',
        maxAllowedAuto: parseFloat(newMaxDelta) || 500,
        currency: 'USD'
      },
      defaultDecision: 'REQUIRE_STAGING_PR'
    });

    setNewPolicyName('');
    setNewPattern('');
    setNewMaxDelta('500');
  };

  const handleRunSimulation = () => {
    const params = {
      deltaAmount: parseFloat(simDelta) || 0,
      blockId: simBlockId || undefined
    };
    const res = evaluateActionAutonomy(simToolName, params);
    setSimResult(res);
  };

  const handleRunAcceptanceTests = () => {
    const res = runAcceptanceCriteria({
      afterText: testSampleText,
      beforeText: 'Baseline text'
    });
    setTestRunOutput(res);
  };

  return (
    <div className="flex flex-col h-full bg-transparent text-slate-800 dark:text-zinc-100 p-4 space-y-4 select-text">
      {/* Top Header */}
      <div className="flex items-center justify-between border-b border-black/[0.06] dark:border-white/[0.08] pb-3">
        <div>
          <div className="flex items-center gap-2">
            <h2 className="text-base font-bold tracking-tight text-slate-900 dark:text-white">
              Autonomy Guardrails & Verification Engine
            </h2>
            <span className="text-[10px] font-mono font-bold uppercase px-2 py-0.5 rounded bg-violet-500/10 text-violet-700 dark:text-violet-300 border border-violet-500/20">
              Pillars 4B & 5B
            </span>
          </div>
          <p className="text-xs text-slate-500 dark:text-zinc-400 mt-0.5">
            Programmable per-action permissions, monetary thresholds, and deterministic workspace acceptance tests.
          </p>
        </div>

        {/* Tab Controls (Apple-style rounded rectangles) */}
        <div className="flex items-center gap-1.5 bg-black/[0.04] dark:bg-white/[0.05] p-1 rounded-xl">
          <button
            type="button"
            onClick={() => setActiveTab('policies')}
            className={`px-3 py-1 text-xs font-semibold rounded-lg transition-colors cursor-pointer ${
              activeTab === 'policies'
                ? 'bg-white dark:bg-zinc-800 text-slate-900 dark:text-white shadow-2xs border border-slate-200/80 dark:border-zinc-700'
                : 'text-slate-500 dark:text-zinc-400 hover:text-slate-900 dark:hover:text-white'
            }`}
          >
            Autonomy Policies ({policies.length})
          </button>
          <button
            type="button"
            onClick={() => setActiveTab('tests')}
            className={`px-3 py-1 text-xs font-semibold rounded-lg transition-colors cursor-pointer ${
              activeTab === 'tests'
                ? 'bg-white dark:bg-zinc-800 text-slate-900 dark:text-white shadow-2xs border border-slate-200/80 dark:border-zinc-700'
                : 'text-slate-500 dark:text-zinc-400 hover:text-slate-900 dark:hover:text-white'
            }`}
          >
            Acceptance Criteria ({tests.length})
          </button>
          <button
            type="button"
            onClick={() => setActiveTab('simulator')}
            className={`px-3 py-1 text-xs font-semibold rounded-lg transition-colors cursor-pointer ${
              activeTab === 'simulator'
                ? 'bg-white dark:bg-zinc-800 text-slate-900 dark:text-white shadow-2xs border border-slate-200/80 dark:border-zinc-700'
                : 'text-slate-500 dark:text-zinc-400 hover:text-slate-900 dark:hover:text-white'
            }`}
          >
            Live Simulator
          </button>
        </div>
      </div>

      {/* ── Sub-Tab 1: Policies Catalog ── */}
      {activeTab === 'policies' && (
        <div className="space-y-4">
          <div className="grid grid-cols-1 md:grid-cols-2 gap-3">
            {policies.map(p => (
              <div
                key={p.id}
                className={`p-3.5 rounded-xl border transition-all ${
                  p.enabled
                    ? 'bg-white/80 dark:bg-zinc-900/80 border-black/[0.08] dark:border-white/[0.1] shadow-2xs'
                    : 'bg-slate-100/50 dark:bg-zinc-950/40 border-slate-200/60 dark:border-zinc-800/60 opacity-60'
                }`}
              >
                <div className="flex items-start justify-between gap-2 mb-1.5">
                  <div className="flex items-center gap-2">
                    <span className="font-bold text-xs text-slate-900 dark:text-white">{p.name}</span>
                    <span className="text-[9px] font-mono uppercase px-1.5 py-0.2 rounded bg-slate-100 dark:bg-zinc-800 text-slate-600 dark:text-zinc-400 border border-slate-200 dark:border-zinc-700">
                      {p.category}
                    </span>
                  </div>
                  <button
                    type="button"
                    onClick={() => handleTogglePolicy(p)}
                    className="text-slate-400 hover:text-violet-600 dark:hover:text-violet-400 cursor-pointer"
                    title={p.enabled ? 'Disable policy' : 'Enable policy'}
                  >
                    {p.enabled ? <ToggleRight size={20} className="text-emerald-500" /> : <ToggleLeft size={20} />}
                  </button>
                </div>

                <p className="text-[11px] text-slate-500 dark:text-zinc-400 leading-relaxed mb-2.5">
                  {p.description}
                </p>

                <div className="flex items-center justify-between text-[10px] font-mono text-slate-400 pt-2 border-t border-black/[0.04] dark:border-white/[0.05]">
                  <span>Pattern: <code className="text-violet-600 dark:text-violet-300 font-bold">{p.actionPattern}</code></span>
                  {p.rules?.maxAllowedAuto !== undefined && (
                    <span className="font-semibold text-emerald-600 dark:text-emerald-400">
                      Auto Limit: ${p.rules.maxAllowedAuto}
                    </span>
                  )}
                </div>
              </div>
            ))}
          </div>

          {/* Add New Custom Policy Form */}
          <form onSubmit={handleAddPolicy} className="p-4 rounded-xl border border-violet-500/20 bg-violet-50/20 dark:bg-violet-950/10 space-y-3">
            <h3 className="text-xs font-bold text-slate-900 dark:text-white flex items-center gap-1.5">
              <Plus size={14} className="text-violet-600" /> Add Custom Autonomy Policy
            </h3>
            <div className="grid grid-cols-1 sm:grid-cols-3 gap-2 text-xs">
              <input
                type="text"
                value={newPolicyName}
                onChange={e => setNewPolicyName(e.target.value)}
                placeholder="Policy Name (e.g. GPU Budget Cap)"
                className="px-3 py-1.5 rounded-lg border border-black/[0.08] dark:border-white/[0.1] bg-white dark:bg-zinc-900"
              />
              <input
                type="text"
                value={newPattern}
                onChange={e => setNewPattern(e.target.value)}
                placeholder="Action Pattern (e.g. sheets:*)"
                className="px-3 py-1.5 rounded-lg border border-black/[0.08] dark:border-white/[0.1] bg-white dark:bg-zinc-900"
              />
              <div className="flex items-center gap-2">
                <input
                  type="number"
                  value={newMaxDelta}
                  onChange={e => setNewMaxDelta(e.target.value)}
                  placeholder="Max Auto ($)"
                  className="w-full px-3 py-1.5 rounded-lg border border-black/[0.08] dark:border-white/[0.1] bg-white dark:bg-zinc-900"
                />
                <button
                  type="submit"
                  className="px-3 py-1.5 rounded-lg bg-violet-600 text-white font-semibold hover:bg-violet-700 transition-colors shrink-0 cursor-pointer"
                >
                  Save
                </button>
              </div>
            </div>
          </form>
        </div>
      )}

      {/* ── Sub-Tab 2: Acceptance Criteria Test Suite ── */}
      {activeTab === 'tests' && (
        <div className="space-y-4">
          <div className="grid grid-cols-1 gap-2.5">
            {tests.map(t => (
              <div
                key={t.id}
                className="p-3 rounded-xl border border-black/[0.06] dark:border-white/[0.08] bg-white/70 dark:bg-zinc-900/60 flex items-start justify-between gap-3 shadow-2xs"
              >
                <div className="space-y-1">
                  <div className="flex items-center gap-2">
                    <span className="font-bold text-xs text-slate-900 dark:text-white">{t.name}</span>
                    <span className={`text-[9px] font-mono font-bold uppercase px-1.5 py-0.2 rounded border ${
                      t.severity === 'STRICT'
                        ? 'bg-rose-500/10 text-rose-700 dark:text-rose-300 border-rose-500/20'
                        : 'bg-amber-500/10 text-amber-700 dark:text-amber-300 border-amber-500/20'
                    }`}>
                      {t.severity}
                    </span>
                    <span className="text-[9.5px] font-mono text-slate-400">({t.type})</span>
                  </div>
                  <p className="text-[11px] text-slate-500 dark:text-zinc-400 leading-relaxed">
                    {t.description}
                  </p>
                </div>
                <div className="shrink-0 flex items-center gap-1.5">
                  <span className="text-[10px] font-mono px-2 py-0.5 rounded bg-emerald-500/10 text-emerald-600 border border-emerald-500/15">
                    Ready
                  </span>
                </div>
              </div>
            ))}
          </div>

          {/* Test Runner Simulator */}
          <div className="p-4 rounded-xl border border-black/[0.06] dark:border-white/[0.08] bg-slate-50/50 dark:bg-zinc-900/40 space-y-3">
            <div className="flex items-center justify-between">
              <h3 className="text-xs font-bold text-slate-900 dark:text-white flex items-center gap-1.5">
                <Play size={13} className="text-emerald-600" /> Run Acceptance Test Suite on Sample Content
              </h3>
              <button
                type="button"
                onClick={handleRunAcceptanceTests}
                className="px-3 py-1 rounded-lg bg-emerald-600 text-white text-xs font-semibold hover:bg-emerald-700 cursor-pointer"
              >
                Execute All Tests
              </button>
            </div>

            <textarea
              rows={3}
              value={testSampleText}
              onChange={e => setTestSampleText(e.target.value)}
              className="w-full p-2.5 rounded-lg border border-black/[0.08] dark:border-white/[0.1] bg-white dark:bg-zinc-950 text-xs font-mono"
            />

            {testRunOutput && (
              <div className="mt-3 p-3 rounded-lg border border-black/[0.06] dark:border-white/[0.08] bg-white dark:bg-zinc-900 space-y-2">
                <div className="flex items-center justify-between text-xs font-bold">
                  <span className={testRunOutput.passed ? 'text-emerald-600' : 'text-rose-600'}>
                    {testRunOutput.passed ? '✓ ALL TESTS PASSED' : `⚠️ ${testRunOutput.failedCount} TESTS FAILED`}
                  </span>
                  <span className="text-[10px] font-mono text-slate-400">
                    {testRunOutput.passedCount}/{testRunOutput.total} Passing
                  </span>
                </div>
                <div className="space-y-1 text-[11px] font-mono">
                  {testRunOutput.testResults.map(r => (
                    <div key={r.id} className="flex items-center gap-2">
                      <span>{r.passed ? '✓' : '❌'}</span>
                      <span className="font-semibold text-slate-800 dark:text-zinc-200">{r.name}:</span>
                      <span className="text-slate-500 dark:text-zinc-400">{r.message}</span>
                    </div>
                  ))}
                </div>
              </div>
            )}
          </div>
        </div>
      )}

      {/* ── Sub-Tab 3: Autonomy Simulator ── */}
      {activeTab === 'simulator' && (
        <div className="p-4 rounded-xl border border-black/[0.06] dark:border-white/[0.08] bg-white/80 dark:bg-zinc-900/60 space-y-4 shadow-2xs">
          <h3 className="text-xs font-bold text-slate-900 dark:text-white">
            Simulate Tool Call Autonomy Clearance
          </h3>
          <div className="grid grid-cols-1 sm:grid-cols-3 gap-3 text-xs">
            <div>
              <label className="block text-[10px] font-bold text-slate-400 mb-1 uppercase font-mono">Tool Name</label>
              <input
                type="text"
                value={simToolName}
                onChange={e => setSimToolName(e.target.value)}
                className="w-full px-3 py-1.5 rounded-lg border border-black/[0.08] dark:border-white/[0.1] bg-white dark:bg-zinc-950 font-mono"
              />
            </div>
            <div>
              <label className="block text-[10px] font-bold text-slate-400 mb-1 uppercase font-mono">Simulated Delta Amount ($)</label>
              <input
                type="number"
                value={simDelta}
                onChange={e => setSimDelta(e.target.value)}
                className="w-full px-3 py-1.5 rounded-lg border border-black/[0.08] dark:border-white/[0.1] bg-white dark:bg-zinc-950 font-mono"
              />
            </div>
            <div>
              <label className="block text-[10px] font-bold text-slate-400 mb-1 uppercase font-mono">Target Block ID</label>
              <input
                type="text"
                value={simBlockId}
                onChange={e => setSimBlockId(e.target.value)}
                placeholder="Optional (e.g. blk_clause_4)"
                className="w-full px-3 py-1.5 rounded-lg border border-black/[0.08] dark:border-white/[0.1] bg-white dark:bg-zinc-950 font-mono"
              />
            </div>
          </div>

          <button
            type="button"
            onClick={handleRunSimulation}
            className="px-4 py-1.5 rounded-lg bg-violet-600 text-white text-xs font-semibold hover:bg-violet-700 transition-all cursor-pointer"
          >
            Evaluate Autonomy Tier
          </button>

          {simResult && (
            <div className={`p-3.5 rounded-xl border ${
              simResult.decision === 'AUTO_EXECUTE'
                ? 'bg-emerald-500/10 border-emerald-500/20 text-emerald-800 dark:text-emerald-200'
                : 'bg-amber-500/10 border-amber-500/20 text-amber-800 dark:text-amber-200'
            }`}>
              <div className="flex items-center gap-2 font-bold text-xs mb-1">
                {simResult.decision === 'AUTO_EXECUTE' ? <CheckCircle2 size={16} /> : <AlertTriangle size={16} />}
                <span>DECISION: {simResult.decision}</span>
              </div>
              <p className="text-xs leading-relaxed">{simResult.reason}</p>
              {simResult.matchedPolicies?.length > 0 && (
                <div className="mt-2 text-[10px] font-mono space-y-1">
                  {simResult.matchedPolicies.map(m => (
                    <div key={m.policyId} className="opacity-90">• Matched: {m.name} ({m.reason})</div>
                  ))}
                </div>
              )}
            </div>
          )}
        </div>
      )}
    </div>
  );
}
