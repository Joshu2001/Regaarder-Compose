import React, { useState, useEffect } from 'react';
import { BrowserFlowIcon, BrowserCloseIcon, BrowserCheckIcon, BrowserForwardIcon } from '../RegaarderBrowserIcons';
import { SheetIcon, AssistIcon } from '../../RegaarderProductIcons';

/**
 * FlowExecutionModal: Adaptive execution modal & live step tracker matching HIG aesthetics.
 */
export const FlowExecutionModal = ({
  flow,
  initialInputs,
  onClose,
  onNavigate,
  onSendToSheets,
  showToast
}) => {
  // State: 'config', 'running', 'recovery', 'complete'
  const [executionState, setExecutionState] = useState(initialInputs ? 'running' : 'config');
  
  // Parameter state
  const [companiesInput, setCompaniesInput] = useState(
    initialInputs?.companies || flow?.inputs?.find((i) => i.name === 'companies')?.defaultValue?.join(', ') || 'Notion, Asana, Monday, ClickUp'
  );
  const [destinationSheet, setDestinationSheet] = useState(
    flow?.inputs?.find((i) => i.name === 'destination')?.defaultValue || 'Competitor Analysis Matrix'
  );

  // Live item steps progress
  const parsedItems = companiesInput.split(',').map((s) => s.trim()).filter(Boolean);
  const [currentItemIndex, setCurrentItemIndex] = useState(0);
  const [completedItems, setCompletedItems] = useState([]);
  const [currentStepText, setCurrentStepText] = useState('Initializing semantic workflow graph...');
  const [isPaused, setIsPaused] = useState(false);

  // Results
  const [executionResults, setExecutionResults] = useState(null);

  // Run flow execution simulator
  useEffect(() => {
    if (executionState !== 'running' || isPaused) return;

    let idx = 0;
    const targetItems = parsedItems.length > 0 ? parsedItems : ['Notion', 'Asana', 'Monday', 'ClickUp'];

    const stepTimer = setInterval(() => {
      if (idx < targetItems.length) {
        const item = targetItems[idx];
        setCurrentItemIndex(idx);
        setCurrentStepText(`Extracting pricing information for ${item}...`);
        
        // Perform simulated browser navigation to demonstrate visible activity
        if (onNavigate) {
          onNavigate(`https://duckduckgo.com/?q=${encodeURIComponent(item + ' pricing tiers')}`);
        }

        setCompletedItems((prev) => Array.from(new Set([...prev, item])));
        idx++;
      } else {
        clearInterval(stepTimer);
        // Complete execution
        setExecutionResults({
          processedCount: targetItems.length,
          sheetName: destinationSheet,
          tableData: {
            title: destinationSheet,
            headers: ['Company', 'Free Tier', 'Pro / Team Tier', 'Enterprise Tier', 'Key Features'],
            rows: targetItems.map((c) => [
              c,
              '$0 / mo',
              `$${Math.floor(Math.random() * 12) + 8}/mo`,
              'Custom Quote',
              'Collaborative workspace & AI integration'
            ])
          }
        });
        setExecutionState('complete');
        if (showToast) {
          showToast(`Flow "${flow?.name || 'Competitor Research'}" executed successfully!`);
        }
      }
    }, 1200);

    return () => clearInterval(stepTimer);
  }, [executionState, isPaused]);

  const handleStartRun = () => {
    setCompletedItems([]);
    setCurrentItemIndex(0);
    setExecutionState('running');
  };

  const handleExportSheets = () => {
    if (onSendToSheets && executionResults?.tableData) {
      onSendToSheets(executionResults.tableData);
      onClose();
    }
  };

  if (!flow) return null;

  return (
    <div
      onPointerDown={(e) => {
        // Backdrop tap to dismiss
        if (e.target === e.currentTarget) {
          onClose();
        }
      }}
      className="fixed inset-0 z-50 bg-black/60 backdrop-blur-xl flex items-center justify-center p-4 font-sans select-none animate-in fade-in duration-200"
    >
      <div
        onPointerDown={(e) => e.stopPropagation()}
        className="w-full max-w-xl bg-[#161822]/95 backdrop-blur-2xl border border-white/10 rounded-2xl shadow-2xl overflow-hidden text-slate-100 flex flex-col font-sans"
      >
        {/* Header (No X exit button per Apple HIG modal directive) */}
        <div className="flex items-center justify-between px-5 py-4 bg-white/[0.03] border-b border-white/[0.08]">
          <div className="flex items-center gap-3">
            <div className="p-2 rounded-xl bg-indigo-500/10 border border-indigo-500/20 text-indigo-400">
              <BrowserFlowIcon size={20} />
            </div>
            <div>
              <h2 className="text-sm font-medium tracking-tight text-slate-100">
                {flow.name}
              </h2>
              <p className="text-xs text-slate-400 font-normal">
                {executionState === 'config' ? 'Configure Flow parameters' : executionState === 'running' ? 'Executing semantic steps...' : 'Flow Complete'}
              </p>
            </div>
          </div>
        </div>

        {/* Content Body */}
        <div className="p-5 space-y-5">
          {executionState === 'config' && (
            <>
              <div className="space-y-1.5">
                <label className="text-xs font-medium text-slate-300">
                  Target Entities (Comma separated) <span className="text-indigo-400">*</span>
                </label>
                <input
                  type="text"
                  value={companiesInput}
                  onChange={(e) => setCompaniesInput(e.target.value)}
                  className="w-full px-3.5 py-2.5 rounded-xl bg-white/[0.04] border border-white/10 text-xs text-slate-100 placeholder-slate-500 focus:outline-none focus:border-indigo-500/60 font-mono tracking-tight transition-all"
                />
              </div>

              <div className="space-y-1.5">
                <label className="text-xs font-medium text-slate-300">Destination Sheet</label>
                <input
                  type="text"
                  value={destinationSheet}
                  onChange={(e) => setDestinationSheet(e.target.value)}
                  className="w-full px-3.5 py-2.5 rounded-xl bg-white/[0.04] border border-white/10 text-xs text-slate-100 placeholder-slate-500 focus:outline-none focus:border-indigo-500/60 font-mono tracking-tight transition-all"
                />
              </div>
            </>
          )}

          {executionState === 'running' && (
            <div className="space-y-4">
              {/* Item Progress Tracker */}
              <div className="p-4 rounded-xl bg-white/[0.03] border border-white/[0.08] space-y-3">
                <div className="flex items-center justify-between text-xs">
                  <span className="font-medium text-indigo-400 uppercase tracking-wider flex items-center gap-1.5">
                    <AssistIcon size={14} className="animate-spin text-indigo-400" />
                    Executing Reusable Flow
                  </span>
                  <span className="font-mono text-slate-400 text-[11px]">
                    {completedItems.length} of {parsedItems.length} completed
                  </span>
                </div>

                {/* Progress Item List */}
                <div className="grid grid-cols-2 gap-2">
                  {parsedItems.map((item, idx) => {
                    const isDone = completedItems.includes(item);
                    const isCurrent = idx === currentItemIndex && !isDone;
                    return (
                      <div
                        key={item}
                        className={`flex items-center gap-2 p-2.5 rounded-lg text-xs font-mono transition-all border ${
                          isDone
                            ? 'bg-emerald-500/10 border-emerald-500/30 text-emerald-300'
                            : isCurrent
                            ? 'bg-indigo-500/15 border-indigo-500/40 text-indigo-200 animate-pulse'
                            : 'bg-white/[0.02] border-white/[0.06] text-slate-400'
                        }`}
                      >
                        {isDone ? (
                          <BrowserCheckIcon size={14} className="text-emerald-400 shrink-0" />
                        ) : isCurrent ? (
                          <span className="text-indigo-400 font-bold shrink-0">◌</span>
                        ) : (
                          <span className="text-slate-600 shrink-0">○</span>
                        )}
                        <span className="truncate">{item}</span>
                      </div>
                    );
                  })}
                </div>

                <p className="text-xs text-slate-300 font-mono pt-1 text-center animate-pulse">
                  {currentStepText}
                </p>
              </div>
            </div>
          )}

          {executionState === 'complete' && executionResults && (
            <div className="space-y-4">
              <div className="p-4 rounded-xl bg-indigo-500/10 border border-indigo-500/20 space-y-2">
                <div className="flex items-center gap-2 text-xs font-medium text-indigo-300">
                  <BrowserCheckIcon size={16} className="text-indigo-400" />
                  <span>Flow Execution Complete</span>
                </div>
                <p className="text-xs text-slate-300 leading-relaxed">
                  Extracted pricing metrics for {executionResults.processedCount} companies. Consolidated into matrix for {executionResults.sheetName}.
                </p>
              </div>

              {/* Data Preview */}
              <div className="overflow-x-auto border border-white/[0.08] rounded-xl bg-white/[0.02] p-2 max-h-40 regaarder-scrollbar">
                <table className="w-full text-left text-[11px] border-collapse font-sans">
                  <thead>
                    <tr className="border-b border-white/[0.08] text-slate-400">
                      {executionResults.tableData.headers.map((h, i) => (
                        <th key={i} className="pb-1.5 px-2 font-medium">{h}</th>
                      ))}
                    </tr>
                  </thead>
                  <tbody className="divide-y divide-white/[0.04] text-slate-200 font-mono">
                    {executionResults.tableData.rows.map((r, i) => (
                      <tr key={i}>
                        {r.map((c, cIdx) => (
                          <td key={cIdx} className="py-1.5 px-2">{c}</td>
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
        <div className="flex items-center justify-between px-5 py-3.5 bg-white/[0.02] border-t border-white/[0.08]">
          {executionState === 'config' ? (
            <>
              <button
                type="button"
                onPointerDown={(e) => {
                  e.preventDefault();
                  onClose();
                }}
                className="px-4 py-2 rounded-lg text-xs font-medium text-slate-400 hover:text-slate-200 hover:bg-white/[0.06] transition-all cursor-pointer"
              >
                Cancel
              </button>

              <button
                type="button"
                onPointerDown={(e) => {
                  e.preventDefault();
                  handleStartRun();
                }}
                className="flex items-center gap-2 px-5 py-2 rounded-lg bg-indigo-600 hover:bg-indigo-500 text-white text-xs font-medium transition-all cursor-pointer"
              >
                <span>Run Flow</span>
                <BrowserForwardIcon size={14} />
              </button>
            </>
          ) : executionState === 'running' ? (
            <div className="flex items-center justify-between w-full">
              <button
                type="button"
                onPointerDown={(e) => {
                  e.preventDefault();
                  setIsPaused((prev) => !prev);
                }}
                className="px-4 py-2 rounded-lg bg-white/[0.06] hover:bg-white/10 text-slate-200 border border-white/10 text-xs font-medium cursor-pointer transition-all"
              >
                {isPaused ? 'Resume' : 'Pause'}
              </button>

              <button
                type="button"
                onPointerDown={(e) => {
                  e.preventDefault();
                  onClose();
                }}
                className="px-4 py-2 rounded-lg bg-rose-500/10 border border-rose-500/20 text-rose-300 hover:bg-rose-500/20 text-xs font-medium cursor-pointer transition-all"
              >
                Stop Execution
              </button>
            </div>
          ) : (
            <div className="flex items-center justify-between w-full">
              <button
                type="button"
                onPointerDown={(e) => {
                  e.preventDefault();
                  onClose();
                }}
                className="px-4 py-2 rounded-lg text-xs font-medium text-slate-400 hover:text-slate-200 hover:bg-white/[0.06] transition-all cursor-pointer"
              >
                Close
              </button>

              <button
                type="button"
                onPointerDown={(e) => {
                  e.preventDefault();
                  handleExportSheets();
                }}
                className="flex items-center gap-2 px-5 py-2 rounded-lg bg-emerald-600 hover:bg-emerald-500 text-white text-xs font-medium transition-all cursor-pointer"
              >
                <SheetIcon size={14} />
                <span>Send to Sheets</span>
              </button>
            </div>
          )}
        </div>
      </div>
    </div>
  );
};

export default FlowExecutionModal;
