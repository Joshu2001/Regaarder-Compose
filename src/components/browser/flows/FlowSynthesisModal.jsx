import React, { useState } from 'react';
import { BrowserFlowIcon, BrowserCloseIcon, BrowserCheckIcon } from '../RegaarderBrowserIcons';
import { saveFlow } from '../../../services/flowEngine';

/**
 * FlowSynthesisModal: Compact Review Flow interface matching Apple executive design principles.
 * Allows users to rename the flow, inspect/reorder steps, remove individual steps, and Save Flow.
 */
export const FlowSynthesisModal = ({
  synthesizedFlow,
  onClose,
  onSaveSuccess,
  showToast
}) => {
  const [flowData, setFlowData] = useState(synthesizedFlow);
  const [title, setTitle] = useState(synthesizedFlow?.name || 'Competitor Pricing Research');
  const [steps, setSteps] = useState(synthesizedFlow?.steps || []);

  const [companyInputs, setCompanyInputs] = useState(
    synthesizedFlow?.inputs?.find((i) => i.name === 'companies')?.defaultValue?.join(', ') || 'HubSpot, Salesforce, Zendesk, Linear'
  );
  const [destinationSheet, setDestinationSheet] = useState(
    synthesizedFlow?.inputs?.find((i) => i.name === 'destination')?.defaultValue || 'Competitor Analysis'
  );

  const [outputs, setOutputs] = useState(
    synthesizedFlow?.outputs || [
      { id: 'out-1', label: 'Pricing Matrix Table', selected: true },
      { id: 'out-2', label: 'Comparison Chart', selected: true },
      { id: 'out-3', label: 'Executive Brief', selected: false }
    ]
  );

  const handleRemoveStep = (indexToRemove) => {
    setSteps((prev) => prev.filter((_, idx) => idx !== indexToRemove));
  };

  const handleMoveStep = (index, direction) => {
    const targetIdx = index + direction;
    if (targetIdx < 0 || targetIdx >= steps.length) return;
    const newSteps = [...steps];
    const temp = newSteps[index];
    newSteps[index] = newSteps[targetIdx];
    newSteps[targetIdx] = temp;
    setSteps(newSteps);
  };

  const handleToggleOutput = (id) => {
    setOutputs((prev) =>
      prev.map((o) => (o.id === id ? { ...o, selected: !o.selected } : o))
    );
  };

  const handleSave = () => {
    const finalFlow = {
      ...flowData,
      name: title.trim() || 'Custom Flow',
      steps,
      inputs: [
        { id: 'companies', name: 'companies', label: 'Target Companies', type: 'list', defaultValue: companyInputs.split(',').map((s) => s.trim()).filter(Boolean) },
        { id: 'destination', name: 'destination', label: 'Destination Sheet', type: 'text', defaultValue: destinationSheet.trim() }
      ],
      outputs
    };

    const updated = saveFlow(finalFlow);
    if (showToast) {
      showToast(`Saved Flow "${finalFlow.name}" to My Flows`);
    }
    if (onSaveSuccess) {
      onSaveSuccess(updated, finalFlow);
    }
    onClose();
  };

  if (!flowData) return null;

  return (
    <div className="fixed inset-0 z-50 bg-slate-900/40 dark:bg-black/60 backdrop-blur-md flex items-center justify-center p-4 font-sans select-none animate-in fade-in duration-200">
      <div className="w-full max-w-xl bg-white dark:bg-[#1c1c1e] border border-slate-200/90 dark:border-zinc-800/90 rounded-2xl shadow-2xl overflow-hidden text-slate-800 dark:text-zinc-100 flex flex-col max-h-[90vh]">
        {/* Header */}
        <div className="flex items-center justify-between px-5 py-3.5 bg-slate-50/80 dark:bg-zinc-900/80 border-b border-slate-200/80 dark:border-zinc-800/80">
          <div className="flex items-center gap-3">
            <div className="p-2 rounded-xl bg-violet-500/10 dark:bg-violet-500/20 text-violet-600 dark:text-violet-400 border border-violet-500/20">
              <BrowserFlowIcon size={18} />
            </div>
            <div>
              <div className="flex items-center gap-2">
                <span className="text-[10px] font-bold text-violet-600 dark:text-violet-400 uppercase tracking-wider">
                  ✦ Flow Review
                </span>
                <span className="text-[10px] bg-emerald-500/10 dark:bg-emerald-500/20 text-emerald-600 dark:text-emerald-400 px-2 py-0.5 rounded-full border border-emerald-500/30 font-medium">
                  Workflow Synthesized
                </span>
              </div>
              <h2 className="text-sm font-bold tracking-tight text-slate-900 dark:text-zinc-100">
                Review & Save Flow
              </h2>
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
        <div className="p-5 space-y-4 overflow-y-auto thin-scrollbar">
          {/* Title Editing */}
          <div className="space-y-1">
            <label className="text-xs font-semibold text-slate-700 dark:text-zinc-300">Flow Name</label>
            <input
              type="text"
              value={title}
              onChange={(e) => setTitle(e.target.value)}
              placeholder="Give your flow a name..."
              className="w-full px-3.5 py-2 rounded-xl bg-slate-50 dark:bg-zinc-900 border border-slate-200 dark:border-zinc-700/80 text-xs font-medium text-slate-900 dark:text-zinc-100 focus:outline-none focus:ring-1 focus:ring-violet-500 transition-all"
            />
          </div>

          {/* Action Sequence Inspection & Reordering */}
          <div className="space-y-1.5">
            <div className="flex items-center justify-between">
              <span className="text-xs font-semibold text-slate-700 dark:text-zinc-300">
                Action Steps ({steps.length})
              </span>
              <span className="text-[10px] text-slate-400 dark:text-zinc-500 font-mono">Inspect / Reorder / Remove</span>
            </div>

            <div className="p-2 rounded-2xl bg-slate-50/70 dark:bg-zinc-900/60 border border-slate-200/80 dark:border-zinc-800/80 space-y-1.5 max-h-52 overflow-y-auto thin-scrollbar">
              {steps.length === 0 ? (
                <div className="py-4 text-center text-xs text-slate-400 dark:text-zinc-500">No steps in this workflow.</div>
              ) : (
                steps.map((step, index) => (
                  <div
                    key={step.id || index}
                    className="flex items-center justify-between p-2 rounded-xl bg-white dark:bg-[#18181b] border border-slate-200/80 dark:border-zinc-800 text-xs shadow-2xs group"
                  >
                    <div className="flex items-center gap-2.5 min-w-0 pr-2">
                      <div className="w-5 h-5 rounded-full bg-violet-500/10 dark:bg-violet-500/20 text-violet-600 dark:text-violet-400 text-[10px] font-bold flex items-center justify-center shrink-0">
                        {index + 1}
                      </div>
                      <div className="flex flex-col min-w-0">
                        <span className="font-semibold text-slate-800 dark:text-zinc-200 truncate leading-tight">
                          {step.intent}
                        </span>
                        <span className="text-[10px] text-slate-400 dark:text-zinc-500 font-mono truncate leading-tight mt-0.5">
                          Target: {step.target || 'Web Element'}
                        </span>
                      </div>
                    </div>

                    <div className="flex items-center gap-1 shrink-0">
                      {/* Move Up */}
                      <button
                        type="button"
                        disabled={index === 0}
                        onPointerDown={(e) => {
                          e.preventDefault();
                          handleMoveStep(index, -1);
                        }}
                        className="w-6 h-6 rounded-lg flex items-center justify-center text-slate-400 hover:text-slate-700 dark:hover:text-zinc-200 hover:bg-slate-100 dark:hover:bg-zinc-800 disabled:opacity-30 cursor-pointer"
                        title="Move step up"
                      >
                        ↑
                      </button>

                      {/* Move Down */}
                      <button
                        type="button"
                        disabled={index === steps.length - 1}
                        onPointerDown={(e) => {
                          e.preventDefault();
                          handleMoveStep(index, 1);
                        }}
                        className="w-6 h-6 rounded-lg flex items-center justify-center text-slate-400 hover:text-slate-700 dark:hover:text-zinc-200 hover:bg-slate-100 dark:hover:bg-zinc-800 disabled:opacity-30 cursor-pointer"
                        title="Move step down"
                      >
                        ↓
                      </button>

                      {/* Delete Step */}
                      <button
                        type="button"
                        onPointerDown={(e) => {
                          e.preventDefault();
                          handleRemoveStep(index);
                        }}
                        className="w-6 h-6 rounded-lg flex items-center justify-center text-slate-400 hover:text-rose-500 hover:bg-rose-500/10 cursor-pointer"
                        title="Remove step"
                      >
                        ✕
                      </button>
                    </div>
                  </div>
                ))
              )}
            </div>
          </div>

          {/* Inferred Flow Variables */}
          <div className="space-y-1.5">
            <span className="text-xs font-semibold text-slate-700 dark:text-zinc-300 block">Flow Parameters</span>
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-2.5 p-3 rounded-2xl bg-slate-50/70 dark:bg-zinc-900/60 border border-slate-200/80 dark:border-zinc-800/80 text-xs">
              <div className="space-y-1">
                <label className="text-[11px] text-slate-500 dark:text-zinc-400 font-medium">Target Entities (List)</label>
                <input
                  type="text"
                  value={companyInputs}
                  onChange={(e) => setCompanyInputs(e.target.value)}
                  className="w-full px-2.5 py-1.5 rounded-lg bg-white dark:bg-zinc-800 border border-slate-200 dark:border-zinc-700 text-xs font-mono text-slate-800 dark:text-zinc-200"
                />
              </div>

              <div className="space-y-1">
                <label className="text-[11px] text-slate-500 dark:text-zinc-400 font-medium">Destination Target</label>
                <input
                  type="text"
                  value={destinationSheet}
                  onChange={(e) => setDestinationSheet(e.target.value)}
                  className="w-full px-2.5 py-1.5 rounded-lg bg-white dark:bg-zinc-800 border border-slate-200 dark:border-zinc-700 text-xs font-mono text-slate-800 dark:text-zinc-200"
                />
              </div>
            </div>
          </div>

          {/* Inferred Outputs */}
          <div className="space-y-1.5">
            <span className="text-xs font-semibold text-slate-700 dark:text-zinc-300 block">Flow Outputs</span>
            <div className="flex flex-wrap gap-2">
              {outputs.map((out) => (
                <button
                  key={out.id}
                  type="button"
                  onPointerDown={() => handleToggleOutput(out.id)}
                  className={`flex items-center gap-2 px-3 py-1.5 rounded-xl text-xs font-medium border transition-all cursor-pointer ${
                    out.selected
                      ? 'bg-violet-500/10 dark:bg-violet-500/20 text-violet-600 dark:text-violet-300 border-violet-500/40'
                      : 'bg-slate-50 dark:bg-zinc-900 text-slate-500 dark:text-zinc-400 border-slate-200 dark:border-zinc-800'
                  }`}
                >
                  <div className={`w-3.5 h-3.5 rounded border flex items-center justify-center ${out.selected ? 'bg-violet-600 border-violet-500 text-white' : 'border-slate-300 dark:border-zinc-600'}`}>
                    {out.selected && <BrowserCheckIcon size={10} />}
                  </div>
                  <span>{out.label}</span>
                </button>
              ))}
            </div>
          </div>
        </div>

        {/* Footer Actions */}
        <div className="flex items-center justify-between px-5 py-3.5 bg-slate-50/80 dark:bg-zinc-900/80 border-t border-slate-200/80 dark:border-zinc-800/80">
          <button
            type="button"
            onPointerDown={(e) => {
              e.preventDefault();
              onClose();
            }}
            className="px-4 py-2 rounded-xl text-xs font-medium text-slate-500 dark:text-zinc-400 hover:text-slate-800 dark:hover:text-zinc-200 hover:bg-slate-200/60 dark:hover:bg-zinc-800 transition-colors cursor-pointer"
          >
            Discard
          </button>

          <button
            type="button"
            onPointerDown={(e) => {
              e.preventDefault();
              handleSave();
            }}
            className="flex items-center gap-2 px-5 py-2 rounded-xl bg-violet-600 hover:bg-violet-500 text-white text-xs font-semibold shadow-sm transition-all cursor-pointer"
          >
            <BrowserCheckIcon size={14} />
            <span>Save Flow</span>
          </button>
        </div>
      </div>
    </div>
  );
};

export default FlowSynthesisModal;
