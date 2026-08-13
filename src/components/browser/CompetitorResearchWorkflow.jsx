import React, { useState } from 'react';
import { BrowserCompetitorsIcon, BrowserCloseIcon, BrowserCheckIcon, BrowserForwardIcon } from './RegaarderBrowserIcons';
import { SheetIcon, AssistIcon } from '../RegaarderProductIcons';

/**
 * CompetitorResearchWorkflow: Class C Intelligent Workflow setup & execution surface.
 * Minimal configuration, progressive setup, deterministic execution, and immediate export actions.
 */
export const CompetitorResearchWorkflow = ({ onClose, onSendToSheets, onNavigate, showToast }) => {
  // Workflow state: 'setup', 'executing', 'complete'
  const [workflowState, setWorkflowState] = useState('setup');
  
  // Setup inputs
  const [companiesInput, setCompaniesInput] = useState('Salesforce, HubSpot, Notion, Linear');
  const [focusArea, setFocusArea] = useState('Pricing'); // Pricing, Features, Positioning, Funding, Customers, All
  const [outputType, setOutputType] = useState('table'); // 'table', 'report', 'both'

  // Execution progress state
  const [progressStep, setProgressStep] = useState(0);
  const steps = [
    'Initializing competitive intelligence agent...',
    'Searching global tech stack indices & market benchmarks...',
    'Extracting pricing tiers, feature vectors & customer ratings...',
    'Deduplicating sources & normalizing financial metrics...',
    'Generating structured matrix output...'
  ];

  // Completed research metrics
  const [results, setResults] = useState(null);

  const handleStartResearch = () => {
    if (!companiesInput.trim()) return;
    setWorkflowState('executing');
    setProgressStep(0);

    let currentStep = 0;
    const interval = setInterval(() => {
      currentStep++;
      if (currentStep < steps.length) {
        setProgressStep(currentStep);
      } else {
        clearInterval(interval);
        setResults({
          sourcesCount: 14,
          companiesCount: companiesInput.split(',').filter(Boolean).length || 4,
          metricsCount: 38,
          tableData: {
            title: `Competitor Analysis Matrix — ${companiesInput.slice(0, 30)}`,
            headers: ['Company', 'Core Focus', 'Entry Pricing', 'Enterprise Tier', 'Key Differentiation'],
            rows: [
              ['Salesforce', 'Enterprise CRM', '$25/mo', '$300/mo', 'Extensive ecosystem & AppExchange'],
              ['HubSpot', 'Inbound & Sales', '$20/mo', '$1,200/mo', 'All-in-one marketing suite'],
              ['Notion', 'Workspace & AI', '$8/mo', '$18/mo', 'Flexible modular block architecture'],
              ['Linear', 'Issue Tracking', '$8/mo', '$14/mo', 'Keyboard-first ultra-fast UI']
            ]
          }
        });
        setWorkflowState('complete');
        if (showToast) showToast('Competitor research complete. 14 sources analyzed.');
      }
    }, 450);
  };

  const handleExportToSheets = () => {
    if (onSendToSheets && results?.tableData) {
      onSendToSheets(results.tableData);
      onClose();
    }
  };

  return (
    <div 
      onPointerDown={(e) => {
        if (e.target === e.currentTarget) {
          onClose();
        }
      }}
      className="fixed inset-0 z-50 bg-slate-950/70 backdrop-blur-sm flex items-center justify-center p-4 font-sans select-none animate-in fade-in duration-200"
    >
      <div 
        onPointerDown={(e) => e.stopPropagation()}
        className="w-full max-w-lg bg-slate-900 border border-slate-800 rounded-2xl shadow-2xl overflow-hidden text-slate-100 flex flex-col"
      >
        {/* Modal Header */}
        <div className="flex items-center justify-between px-5 py-4 bg-slate-950/80 border-b border-slate-800">
          <div className="flex items-center gap-3">
            <div className="p-2 rounded-xl bg-violet-500/15 border border-violet-500/30 text-violet-400">
              <BrowserCompetitorsIcon size={20} />
            </div>
            <div>
              <h2 className="text-sm font-semibold tracking-tight text-slate-100">Research Competitors</h2>
              <p className="text-xs text-slate-400">Multi-step agentic market analysis</p>
            </div>
          </div>
        </div>

        {/* Content Body */}
        <div className="p-5 space-y-5">
          {workflowState === 'setup' && (
            <>
              {/* Companies Field */}
              <div className="space-y-1.5">
                <label className="text-xs font-semibold text-slate-300">
                  Target Companies or Market Segment <span className="text-violet-400">*</span>
                </label>
                <input
                  type="text"
                  value={companiesInput}
                  onChange={(e) => setCompaniesInput(e.target.value)}
                  placeholder="e.g. Salesforce, HubSpot, Notion or 'AI Code Editors'"
                  className="w-full px-3.5 py-2.5 rounded-xl bg-slate-950 border border-slate-800 text-xs text-slate-100 placeholder-slate-500 focus:outline-hidden focus:border-violet-500/80 font-mono tracking-tight"
                  autoFocus
                />
              </div>

              {/* Research Focus */}
              <div className="space-y-1.5">
                <label className="text-xs font-medium text-slate-300 block">Research Focus</label>
                <div className="grid grid-cols-3 gap-2">
                  {['Pricing', 'Features', 'Positioning', 'Funding', 'Customers', 'All'].map((f) => (
                    <button
                      key={f}
                      type="button"
                      onPointerDown={() => setFocusArea(f)}
                      className={`px-3 py-2 rounded-lg text-xs font-medium border transition-all cursor-pointer ${
                        focusArea === f
                          ? 'bg-violet-600/20 text-violet-300 border-violet-500/80 shadow-sm backdrop-blur-md ring-1 ring-violet-500/30'
                          : 'bg-white/[0.03] border-white/[0.08] text-slate-400 hover:text-white hover:bg-white/[0.07] hover:border-white/[0.15]'
                      }`}
                    >
                      {f}
                    </button>
                  ))}
                </div>
              </div>

              {/* Output Target */}
              <div className="space-y-1.5">
                <label className="text-xs font-medium text-slate-300 block">Output Format</label>
                <div className="grid grid-cols-3 gap-2">
                  {[
                    { id: 'table', label: 'Comparison Table' },
                    { id: 'report', label: 'Research Report' },
                    { id: 'both', label: 'Matrix & Report' }
                  ].map((o) => (
                    <button
                      key={o.id}
                      type="button"
                      onPointerDown={() => setOutputType(o.id)}
                      className={`px-3 py-2 rounded-lg text-xs font-medium border transition-all cursor-pointer ${
                        outputType === o.id
                          ? 'bg-violet-600/20 text-violet-300 border-violet-500/80 shadow-sm backdrop-blur-md ring-1 ring-violet-500/30'
                          : 'bg-white/[0.03] border-white/[0.08] text-slate-400 hover:text-white hover:bg-white/[0.07] hover:border-white/[0.15]'
                      }`}
                    >
                      {o.label}
                    </button>
                  ))}
                </div>
              </div>
            </>
          )}

          {workflowState === 'executing' && (
            <div className="flex flex-col items-center justify-center py-10 space-y-4 text-center">
              <div className="w-12 h-12 rounded-xl bg-violet-500/10 border border-violet-500/30 flex items-center justify-center text-violet-400 shadow-sm">
                <AssistIcon size={24} className="animate-spin" />
              </div>
              <div className="space-y-1">
                <h3 className="text-sm font-semibold text-slate-200">Analyzing Competitors...</h3>
                <p className="text-xs text-violet-400 font-mono animate-pulse">
                  {steps[progressStep]}
                </p>
              </div>

              {/* Progress bar */}
              <div className="w-full bg-white/[0.04] h-1.5 rounded-md overflow-hidden border border-white/[0.08]">
                <div
                  className="bg-violet-500 h-full transition-all duration-300 rounded-md"
                  style={{ width: `${((progressStep + 1) / steps.length) * 100}%` }}
                />
              </div>
            </div>
          )}

          {workflowState === 'complete' && results && (
            <div className="space-y-4">
              {/* Success Badge */}
              <div className="p-4 rounded-xl bg-violet-500/10 border border-violet-500/30 space-y-2">
                <div className="flex items-center gap-2 text-xs font-semibold text-violet-300">
                  <BrowserCheckIcon size={16} className="text-violet-400" />
                  <span>Competitor Research Complete</span>
                </div>
                <div className="grid grid-cols-3 gap-2 text-center pt-1 font-mono text-[11px] text-slate-300">
                  <div className="p-2 rounded-lg bg-white/[0.03] border border-white/[0.08]">
                    <span className="block text-violet-400 font-bold text-sm">{results.sourcesCount}</span>
                    <span className="text-[10px] text-slate-500">Sources</span>
                  </div>
                  <div className="p-2 rounded-lg bg-white/[0.03] border border-white/[0.08]">
                    <span className="block text-emerald-400 font-bold text-sm">{results.companiesCount}</span>
                    <span className="text-[10px] text-slate-500">Companies</span>
                  </div>
                  <div className="p-2 rounded-lg bg-white/[0.03] border border-white/[0.08]">
                    <span className="block text-sky-400 font-bold text-sm">{results.metricsCount}</span>
                    <span className="text-[10px] text-slate-500">Metrics</span>
                  </div>
                </div>
              </div>

              {/* Matrix Snippet */}
              <div className="overflow-x-auto border border-white/[0.08] rounded-xl bg-white/[0.02] p-2">
                <table className="w-full text-left text-[11px] border-collapse font-sans">
                  <thead>
                    <tr className="border-b border-white/[0.08] text-slate-400">
                      {results.tableData.headers.map((h, i) => (
                        <th key={i} className="pb-1.5 px-2 font-semibold">{h}</th>
                      ))}
                    </tr>
                  </thead>
                  <tbody className="divide-y divide-white/[0.06] text-slate-300">
                    {results.tableData.rows.map((r, i) => (
                      <tr key={i}>
                        {r.map((c, cIdx) => (
                          <td key={cIdx} className="py-1 px-2">{c}</td>
                        ))}
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>
            </div>
          )}
        </div>

        {/* Footer Actions */}
        <div className="flex items-center justify-between px-5 py-4 bg-white/[0.02] border-t border-white/[0.08]">
          {workflowState === 'setup' ? (
            <>
              <button
                type="button"
                onPointerDown={(e) => {
                  e.preventDefault();
                  onClose();
                }}
                className="px-3.5 py-2 rounded-lg text-xs font-medium text-slate-400 hover:text-white hover:bg-white/[0.06] transition-colors cursor-pointer"
              >
                Cancel
              </button>

              <button
                type="button"
                onPointerDown={(e) => {
                  e.preventDefault();
                  handleStartResearch();
                }}
                disabled={!companiesInput.trim()}
                className="flex items-center gap-2 px-4 py-2 rounded-lg bg-violet-600 hover:bg-violet-500 disabled:opacity-40 text-white text-xs font-medium shadow-sm transition-all cursor-pointer"
              >
                <span>Start Research</span>
                <BrowserForwardIcon size={14} />
              </button>
            </>
          ) : workflowState === 'complete' ? (
            <>
              <button
                type="button"
                onPointerDown={(e) => {
                  e.preventDefault();
                  onClose();
                }}
                className="px-3.5 py-2 rounded-xl text-xs font-medium text-slate-400 hover:text-slate-200 hover:bg-slate-800 transition-colors cursor-pointer"
              >
                Close
              </button>

              <div className="flex items-center gap-2">
                <button
                  type="button"
                  onPointerDown={(e) => {
                    e.preventDefault();
                    handleExportToSheets();
                  }}
                  className="flex items-center gap-1.5 px-4 py-2 rounded-xl bg-emerald-600 hover:bg-emerald-500 text-white text-xs font-semibold shadow-md transition-all cursor-pointer"
                >
                  <SheetIcon size={14} />
                  <span>Send to Sheets</span>
                </button>
              </div>
            </>
          ) : (
            <div className="w-full text-center text-xs text-slate-500 font-mono">
              Processing multi-source research pipeline...
            </div>
          )}
        </div>
      </div>
    </div>
  );
};

export default CompetitorResearchWorkflow;
