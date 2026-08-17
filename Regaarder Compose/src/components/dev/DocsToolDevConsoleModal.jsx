/**
 * DocsToolDevConsoleModal.jsx
 * 
 * Layer 6: Developer-Only Tool Inspection Harness
 * 
 * Hidden developer console modal for testing, auditing, inspecting LLM schemas,
 * simulating dry-run calls, and managing transactions.
 * 
 * Styled following Apple executive-tier aesthetics with rounded-rectangle tabs.
 */

import React, { useState } from 'react';
import {
  CANONICAL_DOCS_TOOLS,
  DOCS_TOOL_CATEGORIES,
} from '../../services/docsToolRegistry';
import {
  executeTool,
  getTransactionHistory,
  getExecutionLogs,
  undoTransaction,
  clearExecutionLogs
} from '../../services/docsToolExecutor';
import {
  toOpenAITools,
  toGeminiTools,
  toAnthropicTools,
  getDocsToolSystemPrompt
} from '../../services/docsLlmAdapters';

export const DocsToolDevConsoleModal = ({ isOpen, onClose }) => {
  const [activeTab, setActiveTab] = useState('catalog'); // 'catalog' | 'schemas' | 'tester' | 'logs'
  const [selectedToolName, setSelectedToolName] = useState(CANONICAL_DOCS_TOOLS[0]?.name || '');
  const [testParamsJson, setTestParamsJson] = useState('{\n  "rows": 3,\n  "cols": 3\n}');
  const [dryRun, setDryRun] = useState(true);
  const [lastResult, setLastResult] = useState(null);
  const [activeProvider, setActiveProvider] = useState('openai'); // 'openai' | 'gemini' | 'anthropic' | 'prompt'
  const [copied, setCopied] = useState(false);

  if (!isOpen) return null;

  const selectedTool = CANONICAL_DOCS_TOOLS.find(t => t.name === selectedToolName) || CANONICAL_DOCS_TOOLS[0];

  const handleToolSelect = (tool) => {
    setSelectedToolName(tool.name);
    // Generate default sample JSON params
    const props = tool.parameters?.properties || {};
    const sample = {};
    Object.keys(props).forEach(k => {
      if (props[k].type === 'number') sample[k] = 3;
      else if (props[k].type === 'boolean') sample[k] = true;
      else if (props[k].enum) sample[k] = props[k].enum[0];
      else sample[k] = `Sample ${k}`;
    });
    setTestParamsJson(JSON.stringify(sample, null, 2));
  };

  const handleRunExecution = async () => {
    let parsedParams = {};
    try {
      if (testParamsJson.trim()) {
        parsedParams = JSON.parse(testParamsJson);
      }
    } catch (err) {
      setLastResult({
        success: false,
        error: { code: 'INVALID_JSON', details: 'Failed to parse parameters JSON string.' }
      });
      return;
    }

    const res = await executeTool(selectedToolName, parsedParams, {}, { dryRun });
    setLastResult(res);
  };

  const handleUndoTx = async (txId) => {
    const res = await undoTransaction(txId);
    setLastResult(res);
  };

  const getProviderSchemaText = () => {
    switch (activeProvider) {
      case 'openai':
        return JSON.stringify(toOpenAITools(), null, 2);
      case 'gemini':
        return JSON.stringify(toGeminiTools(), null, 2);
      case 'anthropic':
        return JSON.stringify(toAnthropicTools(), null, 2);
      case 'prompt':
        return getDocsToolSystemPrompt();
      default:
        return '';
    }
  };

  const handleCopySchema = () => {
    navigator.clipboard.writeText(getProviderSchemaText());
    setCopied(true);
    setTimeout(() => setCopied(false), 2000);
  };

  const logs = getExecutionLogs();
  const txHistory = getTransactionHistory();

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-slate-900/60 backdrop-blur-md p-4 animate-in fade-in duration-200">
      <div className="w-full max-w-5xl h-[85vh] bg-white dark:bg-slate-900 rounded-2xl shadow-2xl border border-slate-200/80 dark:border-slate-800 flex flex-col overflow-hidden text-slate-800 dark:text-slate-100">
        
        {/* Header */}
        <div className="px-6 py-4 border-b border-slate-100 dark:border-slate-800/80 flex items-center justify-between bg-slate-50/50 dark:bg-slate-900/50">
          <div className="flex items-center gap-3">
            <div className="w-8 h-8 rounded-lg bg-violet-600/10 dark:bg-violet-500/20 text-violet-600 dark:text-violet-400 flex items-center justify-center font-bold text-xs">
              DEV
            </div>
            <div>
              <h2 className="text-base font-semibold tracking-tight text-slate-900 dark:text-slate-100">
                Docs Tool Inspector & Developer Console
              </h2>
              <p className="text-xs text-slate-500 dark:text-slate-400">
                6-Layer Tool Architecture & LLM API Runtime
              </p>
            </div>
          </div>

          <button
            onPointerDown={(e) => { e.preventDefault(); onClose(); }}
            className="w-8 h-8 rounded-lg text-slate-400 hover:text-slate-600 dark:hover:text-slate-200 hover:bg-slate-100 dark:hover:bg-slate-800 flex items-center justify-center transition-colors text-sm"
          >
            ✕
          </button>
        </div>

        {/* Navigation Tabs - Strict requirement: rounded rectangles, never pill-shaped */}
        <div className="px-6 pt-3 pb-2 border-b border-slate-100 dark:border-slate-800/80 bg-slate-50/30 dark:bg-slate-900/30 flex items-center gap-2">
          {[
            { id: 'catalog', label: 'Canonical Registry' },
            { id: 'schemas', label: 'LLM Provider Adapters' },
            { id: 'tester', label: 'Interactive Tester' },
            { id: 'logs', label: `Execution & Transactions (${logs.length})` }
          ].map(tab => (
            <button
              key={tab.id}
              onPointerDown={(e) => { e.preventDefault(); setActiveTab(tab.id); }}
              className={`px-4 py-2 text-xs font-semibold rounded-lg transition-all ${
                activeTab === tab.id
                  ? 'bg-violet-600 text-white shadow-sm outline outline-1 outline-violet-500'
                  : 'text-slate-600 dark:text-slate-400 hover:bg-slate-100 dark:hover:bg-slate-800'
              }`}
            >
              {tab.label}
            </button>
          ))}
        </div>

        {/* Modal Body Content */}
        <div className="flex-1 overflow-y-auto p-6">
          
          {/* TAB 1: CATALOG */}
          {activeTab === 'catalog' && (
            <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
              <div className="md:col-span-1 space-y-2 border-r border-slate-100 dark:border-slate-800 pr-4">
                <div className="text-xs font-bold text-slate-400 uppercase tracking-wider mb-2">
                  Registered Capabilities ({CANONICAL_DOCS_TOOLS.length})
                </div>
                {CANONICAL_DOCS_TOOLS.map(t => (
                  <button
                    key={t.name}
                    onPointerDown={(e) => { e.preventDefault(); handleToolSelect(t); }}
                    className={`w-full text-left p-3 rounded-lg border text-xs transition-all ${
                      selectedToolName === t.name
                        ? 'border-violet-500 bg-violet-50/50 dark:bg-violet-950/20 text-violet-900 dark:text-violet-200 outline outline-1 outline-violet-400'
                        : 'border-slate-200/80 dark:border-slate-800 hover:border-slate-300 dark:hover:border-slate-700 bg-white dark:bg-slate-900'
                    }`}
                  >
                    <div className="font-semibold text-slate-800 dark:text-slate-200">{t.label}</div>
                    <div className="text-[11px] font-mono text-slate-400 truncate mt-0.5">{t.name}</div>
                  </button>
                ))}
              </div>

              <div className="md:col-span-2 space-y-4">
                <div className="p-4 rounded-xl border border-slate-200/80 dark:border-slate-800 bg-slate-50/50 dark:bg-slate-900/50">
                  <div className="flex items-center justify-between mb-2">
                    <h3 className="text-sm font-bold text-slate-900 dark:text-slate-100">{selectedTool.label}</h3>
                    <span className="text-[10px] font-bold px-2.5 py-0.5 rounded-lg bg-slate-200 dark:bg-slate-800 text-slate-700 dark:text-slate-300 uppercase">
                      {selectedTool.category}
                    </span>
                  </div>
                  <p className="text-xs text-slate-600 dark:text-slate-400 mb-4">{selectedTool.description}</p>

                  <div className="text-xs font-bold text-slate-500 mb-2">Safety Metadata</div>
                  <div className="grid grid-cols-2 gap-2 text-xs mb-4">
                    <div className="p-2 rounded-lg bg-white dark:bg-slate-800 border border-slate-100 dark:border-slate-700">
                      <span className="text-slate-400">Mutates Document:</span> <strong className={selectedTool.mutatesDocument ? 'text-amber-600' : 'text-emerald-600'}>{String(selectedTool.mutatesDocument)}</strong>
                    </div>
                    <div className="p-2 rounded-lg bg-white dark:bg-slate-800 border border-slate-100 dark:border-slate-700">
                      <span className="text-slate-400">Destructive:</span> <strong className={selectedTool.destructive ? 'text-rose-600' : 'text-emerald-600'}>{String(selectedTool.destructive)}</strong>
                    </div>
                    <div className="p-2 rounded-lg bg-white dark:bg-slate-800 border border-slate-100 dark:border-slate-700">
                      <span className="text-slate-400">Undoable:</span> <strong className="text-violet-600">{String(selectedTool.undoable)}</strong>
                    </div>
                    <div className="p-2 rounded-lg bg-white dark:bg-slate-800 border border-slate-100 dark:border-slate-700">
                      <span className="text-slate-400">Requires Selection:</span> <strong>{String(selectedTool.requiresSelection)}</strong>
                    </div>
                  </div>

                  <div className="text-xs font-bold text-slate-500 mb-2">JSON Parameter Schema</div>
                  <pre className="p-3 rounded-lg bg-slate-900 text-slate-100 text-xs font-mono overflow-x-auto">
                    {JSON.stringify(selectedTool.parameters, null, 2)}
                  </pre>
                </div>
              </div>
            </div>
          )}

          {/* TAB 2: LLM SCHEMAS */}
          {activeTab === 'schemas' && (
            <div className="space-y-4">
              <div className="flex items-center justify-between">
                <div className="flex items-center gap-2">
                  {[
                    { id: 'openai', label: 'OpenAI Tools' },
                    { id: 'gemini', label: 'Gemini Declarations' },
                    { id: 'anthropic', label: 'Anthropic Tools' },
                    { id: 'prompt', label: 'LLM System Prompt' }
                  ].map(prov => (
                    <button
                      key={prov.id}
                      onPointerDown={(e) => { e.preventDefault(); setActiveProvider(prov.id); }}
                      className={`px-3 py-1.5 text-xs font-semibold rounded-lg transition-all ${
                        activeProvider === prov.id
                          ? 'bg-slate-900 dark:bg-white text-white dark:text-slate-900 outline outline-1 outline-slate-700 dark:outline-slate-300'
                          : 'bg-slate-100 dark:bg-slate-800 text-slate-600 dark:text-slate-400'
                      }`}
                    >
                      {prov.label}
                    </button>
                  ))}
                </div>

                <button
                  onPointerDown={(e) => { e.preventDefault(); handleCopySchema(); }}
                  className="px-3 py-1.5 text-xs font-semibold bg-violet-600 hover:bg-violet-700 text-white rounded-lg transition-colors flex items-center gap-1.5"
                >
                  {copied ? '✓ Copied!' : 'Copy Definition'}
                </button>
              </div>

              <pre className="p-4 rounded-xl bg-slate-950 text-slate-200 text-xs font-mono overflow-x-auto max-h-[55vh] leading-relaxed">
                {getProviderSchemaText()}
              </pre>
            </div>
          )}

          {/* TAB 3: INTERACTIVE TESTER */}
          {activeTab === 'tester' && (
            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
              <div className="space-y-4">
                <div>
                  <label className="block text-xs font-bold text-slate-500 uppercase tracking-wider mb-2">Select Tool</label>
                  <select
                    value={selectedToolName}
                    onChange={(e) => {
                      const t = CANONICAL_DOCS_TOOLS.find(item => item.name === e.target.value);
                      if (t) handleToolSelect(t);
                    }}
                    className="w-full p-2.5 rounded-lg border border-slate-200 dark:border-slate-700 bg-white dark:bg-slate-800 text-xs font-semibold"
                  >
                    {CANONICAL_DOCS_TOOLS.map(t => (
                      <option key={t.name} value={t.name}>{t.label} ({t.name})</option>
                    ))}
                  </select>
                </div>

                <div>
                  <label className="block text-xs font-bold text-slate-500 uppercase tracking-wider mb-2">Input Parameters (JSON)</label>
                  <textarea
                    rows={6}
                    value={testParamsJson}
                    onChange={(e) => setTestParamsJson(e.target.value)}
                    className="w-full p-3 rounded-lg border border-slate-200 dark:border-slate-700 bg-slate-900 text-slate-100 text-xs font-mono focus:outline-none focus:border-violet-500"
                  />
                </div>

                <div className="flex items-center justify-between pt-2">
                  <label className="flex items-center gap-2 cursor-pointer text-xs font-semibold text-slate-700 dark:text-slate-300">
                    <input
                      type="checkbox"
                      checked={dryRun}
                      onChange={(e) => setDryRun(e.target.checked)}
                      className="rounded border-slate-300 text-violet-600 focus:ring-violet-500"
                    />
                    Enable Dry-Run Mode (Simulation only)
                  </label>

                  <button
                    onPointerDown={(e) => { e.preventDefault(); handleRunExecution(); }}
                    className="px-4 py-2 bg-violet-600 hover:bg-violet-700 text-white font-semibold text-xs rounded-lg transition-all shadow-sm"
                  >
                    Execute Tool
                  </button>
                </div>
              </div>

              <div>
                <label className="block text-xs font-bold text-slate-500 uppercase tracking-wider mb-2">Execution Return Result</label>
                {lastResult ? (
                  <div className="p-4 rounded-xl border border-slate-200 dark:border-slate-800 bg-slate-950 text-slate-100 space-y-3">
                    <div className="flex items-center justify-between border-b border-slate-800 pb-2">
                      <span className={`text-xs font-bold px-2 py-0.5 rounded-lg ${lastResult.success ? 'bg-emerald-950 text-emerald-400 border border-emerald-800' : 'bg-rose-950 text-rose-400 border border-rose-800'}`}>
                        Status: {lastResult.success ? 'TRUE (SUCCESS)' : 'FALSE (FAILED)'}
                      </span>
                      <span className="text-[11px] font-mono text-slate-500">{lastResult.requestId}</span>
                    </div>

                    {lastResult.transactionId && (
                      <div className="text-xs text-violet-400 font-mono">
                        Transaction ID: {lastResult.transactionId}
                      </div>
                    )}

                    <div className="text-xs text-slate-300 font-sans">{lastResult.message}</div>

                    <pre className="p-3 rounded-lg bg-slate-900 text-[11px] font-mono text-slate-300 overflow-x-auto max-h-48">
                      {JSON.stringify(lastResult.data || lastResult.error, null, 2)}
                    </pre>

                    {lastResult.transactionId && (
                      <button
                        onPointerDown={(e) => { e.preventDefault(); handleUndoTx(lastResult.transactionId); }}
                        className="w-full py-2 bg-slate-800 hover:bg-slate-700 text-amber-300 font-semibold text-xs rounded-lg transition-colors border border-amber-500/30"
                      >
                        ↺ Undo This Transaction ({lastResult.transactionId})
                      </button>
                    )}
                  </div>
                ) : (
                  <div className="h-64 rounded-xl border border-dashed border-slate-200 dark:border-slate-800 flex items-center justify-center text-xs text-slate-400">
                    No tool executed yet. Click "Execute Tool" to see result.
                  </div>
                )}
              </div>
            </div>
          )}

          {/* TAB 4: LOGS & TRANSACTIONS */}
          {activeTab === 'logs' && (
            <div className="space-y-6">
              <div className="flex items-center justify-between">
                <h3 className="text-xs font-bold text-slate-400 uppercase tracking-wider">
                  Active Transaction Stack ({txHistory.length})
                </h3>
                <button
                  onPointerDown={(e) => { e.preventDefault(); clearExecutionLogs(); }}
                  className="px-3 py-1 text-xs font-semibold text-rose-600 hover:bg-rose-50 dark:hover:bg-rose-950/30 rounded-lg transition-colors"
                >
                  Clear History
                </button>
              </div>

              {txHistory.length > 0 ? (
                <div className="space-y-3">
                  {txHistory.map(tx => (
                    <div key={tx.transactionId} className="p-3 rounded-xl border border-slate-200 dark:border-slate-800 bg-white dark:bg-slate-900 flex items-center justify-between text-xs">
                      <div>
                        <div className="font-semibold text-slate-900 dark:text-slate-100 flex items-center gap-2">
                          <span>{tx.toolName}</span>
                          <span className="font-mono text-[10px] text-violet-500">{tx.transactionId}</span>
                          {tx.undone && <span className="px-2 py-0.5 rounded bg-rose-100 text-rose-700 dark:bg-rose-950 dark:text-rose-300 font-bold text-[10px]">UNDONE</span>}
                        </div>
                        <div className="text-[11px] text-slate-500 dark:text-slate-400 mt-0.5">
                          {tx.timestamp}
                        </div>
                      </div>

                      {!tx.undone && (
                        <button
                          onPointerDown={(e) => { e.preventDefault(); handleUndoTx(tx.transactionId); }}
                          className="px-3 py-1.5 bg-amber-50 dark:bg-amber-950/40 text-amber-700 dark:text-amber-300 hover:bg-amber-100 border border-amber-200 dark:border-amber-800 rounded-lg text-xs font-semibold transition-colors"
                        >
                          Undo Transaction
                        </button>
                      )}
                    </div>
                  ))}
                </div>
              ) : (
                <div className="text-xs text-slate-400 py-6 text-center border border-dashed border-slate-200 dark:border-slate-800 rounded-xl">
                  No mutating transactions recorded yet.
                </div>
              )}

              <h3 className="text-xs font-bold text-slate-400 uppercase tracking-wider pt-2">
                Execution Trace Logs ({logs.length})
              </h3>

              <div className="p-4 rounded-xl bg-slate-950 text-slate-300 text-xs font-mono space-y-2 max-h-60 overflow-y-auto">
                {logs.map((log, idx) => (
                  <div key={idx} className="border-b border-slate-800 pb-2">
                    <span className="text-slate-500">[{log.timestamp}]</span>{' '}
                    <strong className={log.success ? 'text-emerald-400' : 'text-rose-400'}>
                      {log.toolName}
                    </strong>{' '}
                    — {log.message} <span className="text-slate-500">({log.durationMs}ms)</span>
                  </div>
                ))}
              </div>
            </div>
          )}

        </div>

        {/* Footer */}
        <div className="px-6 py-3 border-t border-slate-100 dark:border-slate-800 bg-slate-50/50 dark:bg-slate-900/50 flex items-center justify-between text-xs text-slate-500 dark:text-slate-400">
          <span>Exposed Runtime: <code className="font-mono text-violet-600 dark:text-violet-400">window.__DOCS_TOOL_HARNESS__</code></span>
          <button
            onPointerDown={(e) => { e.preventDefault(); onClose(); }}
            className="px-4 py-1.5 bg-slate-200 dark:bg-slate-800 hover:bg-slate-300 dark:hover:bg-slate-700 text-slate-700 dark:text-slate-200 font-semibold rounded-lg transition-colors"
          >
            Close
          </button>
        </div>

      </div>
    </div>
  );
};
