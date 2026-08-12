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
    <div className="fixed inset-0 z-50 bg-slate-900/40 dark:bg-black/60 backdrop-blur-md flex items-center justify-center p-4 font-sans select-none animate-in fade-in duration-200">
      <div className="w-full max-w-xl bg-white dark:bg-[#1c1c1e] border border-slate-200/90 dark:border-zinc-800/90 rounded-2xl shadow-2xl overflow-hidden text-slate-800 dark:text-zinc-100 flex flex-col font-sans">
        {/* Header */}
        <div className="flex items-center justify-between px-5 py-3.5 bg-slate-50/80 dark:bg-zinc-900/80 border-b border-slate-200/80 dark:border-zinc-800/80">
          <div className="flex items-center gap-3">
            <div className="p-2 rounded-xl bg-violet-500/10 dark:bg-violet-500/20 border border-violet-500/20 text-violet-600 dark:text-violet-400">
              <BrowserFlowIcon size={20} />
            </div>
            <div>
              <h2 className="text-sm font-bold tracking-tight text-slate-900 dark:text-zinc-100">
                {flow.name}
              </h2>
              <p className="text-xs text-slate-500 dark:text-zinc-400 font-medium">
                {executionState === 'config' ? 'Configure Flow parameters' : executionState === 'running' ? 'Executing semantic steps...' : 'Flow Complete'}
              </p>
            </div>
          </div>

          <button
            type="button"
            onPointerDown={(e) => {
              e.preventDefault();
              onClose();
            }}
            className="p-1.5 rounded-lg text-slate-400 hover:text-slate-600 dark:hover:text-zinc-200 hover:bg-slate-100 dark:hover:bg-zinc-800 transition-colors cursor-pointer"
          >
            <BrowserCloseIcon size={16} />
          </button>
        </div>

        {/* Content Body */}
        <div className="p-5 space-y-5">
          {executionState === 'config' && (
            <>
              <div className="space-y-1.5">
                <label className="text-xs font-semibold text-slate-700 dark:text-zinc-300">
                  Target Entities (Comma separated) <span className="text-violet-500">*</span>
                </label>
                <input
                  type="text"
                  value={companiesInput}
                  onChange={(e) => setCompaniesInput(e.target.value)}
                  className="w-full px-3.5 py-2.5 rounded-xl bg-slate-50 dark:bg-zinc-900 border border-slate-200 dark:border-zinc-700/80 text-xs text-slate-900 dark:text-zinc-100 placeholder-slate-400 dark:placeholder-zinc-500 focus:outline-none focus:ring-1 focus:ring-violet-500 font-mono tracking-tight"
                />
              </div>

              <div className="space-y-1.5">
                <label className="text-xs font-semibold text-slate-700 dark:text-zinc-300">Destination Sheet</label>
                <input
                  type="text"
                  value={destinationSheet}
                  onChange={(e) => setDestinationSheet(e.target.value)}
                  className="w-full px-3.5 py-2.5 rounded-xl bg-slate-50 dark:bg-zinc-900 border border-slate-200 dark:border-zinc-700/80 text-xs text-slate-900 dark:text-zinc-100 placeholder-slate-400 dark:placeholder-zinc-500 focus:outline-none focus:ring-1 focus:ring-violet-500 font-mono tracking-tight"
                />
              </div>
            </>
          )}

          {executionState === 'running' && (
            <div className="space-y-4">
              {/* Item Progress Tracker */}
              <div className="p-4 rounded-2xl bg-slate-50/70 dark:bg-zinc-900/60 border border-slate-200/80 dark:border-zinc-800/80 space-y-3">
                <div className="flex items-center justify-between text-xs">
                  <span className="font-semibold text-violet-600 dark:text-violet-400 uppercase tracking-wide flex items-center gap-1.5">
                    <AssistIcon size={14} className="animate-spin text-violet-500" />
                    Executing Reusable Flow
                  </span>
                  <span className="font-mono text-slate-500 dark:text-zinc-400 text-[11px]">
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
                        className={`flex items-center gap-2 p-2 rounded-xl text-xs font-mono transition-all border ${
                          isDone
                            ? 'bg-emerald-500/10 border-emerald-500/30 text-emerald-600 dark:text-emerald-300'
                            : isCurrent
                            ? 'bg-violet-500/10 border-violet-500/40 text-violet-700 dark:text-violet-200 animate-pulse'
                            : 'bg-white dark:bg-zinc-800 border-slate-200 dark:border-zinc-700 text-slate-400 dark:text-zinc-500'
                        }`}
                      >
                        {isDone ? (
                          <BrowserCheckIcon size={14} className="text-emerald-500 dark:text-emerald-400 shrink-0" />
                        ) : isCurrent ? (
                          <span className="text-violet-500 font-bold shrink-0">◌</span>
                        ) : (
                          <span className="text-slate-400 dark:text-zinc-600 shrink-0">○</span>
                        )}
                        <span className="truncate">{item}</span>
                      </div>
                    );
                  })}
                </div>

                <p className="text-xs text-slate-600 dark:text-zinc-300 font-mono pt-1 text-center animate-pulse">
                  {currentStepText}
                </p>
              </div>
            </div>
          )}

          {executionState === 'complete' && executionResults && (
            <div className="space-y-4">
              <div className="p-4 rounded-xl bg-violet-500/10 border border-violet-500/30 space-y-2">
                <div className="flex items-center gap-2 text-xs font-semibold text-violet-600 dark:text-violet-300">
                  <BrowserCheckIcon size={16} className="text-violet-500 dark:text-violet-400" />
                  <span>Flow Execution Complete</span>
                </div>
                <p className="text-xs text-slate-600 dark:text-zinc-300">
                  Extracted pricing metrics for {executionResults.processedCount} companies. Consolidated into matrix for {executionResults.sheetName}.
                </p>
              </div>

              {/* Data Preview */}
              <div className="overflow-x-auto border border-slate-200 dark:border-zinc-800 rounded-xl bg-slate-50 dark:bg-zinc-900 p-2 max-h-40">
                <table className="w-full text-left text-[11px] border-collapse font-sans">
                  <thead>
                    <tr className="border-b border-slate-200 dark:border-zinc-800 text-slate-500 dark:text-zinc-400">
                      {executionResults.tableData.headers.map((h, i) => (
                        <th key={i} className="pb-1 px-2 font-semibold">{h}</th>
                      ))}
                    </tr>
                  </thead>
                  <tbody className="divide-y divide-slate-200 dark:divide-zinc-800 text-slate-700 dark:text-zinc-300 font-mono">
                    {executionResults.tableData.rows.map((r, i) => (
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
        <div className="flex items-center justify-between px-5 py-3.5 bg-slate-50/80 dark:bg-zinc-900/80 border-t border-slate-200/80 dark:border-zinc-800/80">
          {executionState === 'config' ? (
            <>
              <button
                type="button"
                onPointerDown={(e) => {
                  e.preventDefault();
                  onClose();
                }}
                className="px-4 py-2 rounded-xl text-xs font-medium text-slate-500 dark:text-zinc-400 hover:text-slate-800 dark:hover:text-zinc-200 hover:bg-slate-200/60 dark:hover:bg-zinc-800 transition-colors cursor-pointer"
              >
                Cancel
              </button>

              <button
                type="button"
                onPointerDown={(e) => {
                  e.preventDefault();
                  handleStartRun();
                }}
                className="flex items-center gap-2 px-5 py-2 rounded-xl bg-violet-600 hover:bg-violet-500 text-white text-xs font-semibold shadow-xs transition-all cursor-pointer"
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
                className="px-3.5 py-1.5 rounded-xl bg-slate-100 dark:bg-zinc-800 hover:bg-slate-200 dark:hover:bg-zinc-700 text-slate-700 dark:text-zinc-200 text-xs font-medium cursor-pointer"
              >
                {isPaused ? 'Resume' : 'Pause'}
              </button>

              <button
                type="button"
                onPointerDown={(e) => {
                  e.preventDefault();
                  onClose();
                }}
                className="px-3.5 py-1.5 rounded-xl bg-rose-500/10 dark:bg-rose-500/20 text-rose-600 dark:text-rose-300 hover:bg-rose-500/20 text-xs font-medium cursor-pointer"
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
                className="px-4 py-2 rounded-xl text-xs font-medium text-slate-500 dark:text-zinc-400 hover:text-slate-800 dark:hover:text-zinc-200 hover:bg-slate-200/60 dark:hover:bg-zinc-800 transition-colors cursor-pointer"
              >
                Close
              </button>

              <button
                type="button"
                onPointerDown={(e) => {
                  e.preventDefault();
                  handleExportSheets();
                }}
                className="flex items-center gap-2 px-5 py-2 rounded-xl bg-emerald-600 hover:bg-emerald-500 text-white text-xs font-semibold shadow-xs transition-all cursor-pointer"
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
