import React, { useState } from 'react';
import { BrowserFlowIcon, BrowserCloseIcon, BrowserCheckIcon, BrowserForwardIcon } from '../RegaarderBrowserIcons';
import { SheetIcon, AssistIcon } from '../../RegaarderProductIcons';
import { saveFlow } from '../../../services/flowEngine';

/**
 * FlowSynthesisModal: Zero-configuration Flow synthesis review modal.
 * Regaarder synthesizes raw browser actions into an intelligent Flow graph.
 */
export const FlowSynthesisModal = ({
  synthesizedFlow,
  onClose,
  onSaveSuccess,
  showToast
}) => {
  const [flowData, setFlowData] = useState(synthesizedFlow);
  const [title, setTitle] = useState(synthesizedFlow?.name || 'Competitor Pricing Research');
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
      { id: 'out-3', label: 'Executive Summary Brief', selected: false }
    ]
  );

  const handleToggleOutput = (id) => {
    setOutputs((prev) =>
      prev.map((o) => (o.id === id ? { ...o, selected: !o.selected } : o))
    );
  };

  const handleSave = () => {
    const finalFlow = {
      ...flowData,
      name: title.trim() || 'Custom Flow',
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
    <div className="fixed inset-0 z-50 bg-slate-950/75 backdrop-blur-md flex items-center justify-center p-4 font-sans select-none animate-in fade-in duration-200">
      <div className="w-full max-w-xl bg-slate-900 border border-slate-800 rounded-2xl shadow-2xl overflow-hidden text-slate-100 flex flex-col max-h-[90vh]">
        {/* Header */}
        <div className="flex items-center justify-between px-5 py-4 bg-slate-950/90 border-b border-slate-800">
          <div className="flex items-center gap-3">
            <div className="p-2 rounded-xl bg-violet-500/20 border border-violet-500/40 text-violet-400">
              <BrowserFlowIcon size={20} />
            </div>
            <div>
              <div className="flex items-center gap-2">
                <span className="text-xs font-semibold text-violet-400 uppercase tracking-wide">
                  ✦ Flow Learned
                </span>
                <span className="text-[10px] bg-emerald-500/10 text-emerald-400 px-2 py-0.5 rounded-full border border-emerald-500/30">
                  Semantic Graph Inferred
                </span>
              </div>
              <h2 className="text-sm font-semibold tracking-tight text-slate-100">
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
            className="p-1.5 rounded-lg text-slate-400 hover:text-slate-200 hover:bg-slate-800 transition-colors cursor-pointer"
          >
            <BrowserCloseIcon size={16} />
          </button>
        </div>

        {/* Content Body */}
        <div className="p-5 space-y-5 overflow-y-auto no-scrollbar">
          {/* Title Editing */}
          <div className="space-y-1.5">
            <label className="text-xs font-semibold text-slate-300">Flow Name</label>
            <input
              type="text"
              value={title}
              onChange={(e) => setTitle(e.target.value)}
              className="w-full px-3.5 py-2.5 rounded-xl bg-slate-950 border border-slate-800 text-xs text-slate-100 placeholder-slate-500 focus:outline-hidden focus:border-violet-500/80 font-mono"
            />
          </div>

          {/* Synthesized Semantic Task Graph */}
          <div className="space-y-2">
            <div className="flex items-center justify-between">
              <span className="text-xs font-semibold text-slate-300">
                Synthesized Action Sequence ({flowData.steps?.length || 0} steps)
              </span>
              <span className="text-[10px] text-slate-500 font-mono">Semantic Intent Model</span>
            </div>

            <div className="p-3 rounded-2xl bg-slate-950/70 border border-slate-800 space-y-2 max-h-48 overflow-y-auto no-scrollbar">
              {flowData.steps?.map((step, index) => (
                <div
                  key={step.id || index}
                  className="flex items-center gap-3 p-2 rounded-xl bg-slate-900/80 border border-slate-800/80 text-xs"
                >
                  <div className="w-5 h-5 rounded-full bg-violet-500/20 text-violet-400 text-[10px] font-mono font-bold flex items-center justify-center shrink-0">
                    {index + 1}
                  </div>
                  <div className="flex-1 min-w-0">
                    <span className="font-semibold text-slate-200 block truncate">
                      {step.intent}
                    </span>
                    <span className="text-[10px] text-slate-400 font-mono truncate">
                      Target: {step.target || 'Browser Element'}
                    </span>
                  </div>
                  <span className="text-[10px] text-violet-400 font-mono shrink-0">
                    {Math.round((step.confidence || 0.95) * 100)}% match
                  </span>
                </div>
              ))}
            </div>
          </div>

          {/* Inferred Input Parameters */}
          <div className="space-y-2">
            <span className="text-xs font-semibold text-slate-300 block">Inferred Flow Variables</span>
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-3 p-3.5 rounded-2xl bg-slate-950/60 border border-slate-800 text-xs">
              <div className="space-y-1">
                <label className="text-[11px] text-slate-400 font-medium">Target Entities (List)</label>
                <input
                  type="text"
                  value={companyInputs}
                  onChange={(e) => setCompanyInputs(e.target.value)}
                  className="w-full px-2.5 py-1.5 rounded-lg bg-slate-900 border border-slate-700 text-xs font-mono text-slate-200"
                />
              </div>

              <div className="space-y-1">
                <label className="text-[11px] text-slate-400 font-medium">Destination Target</label>
                <input
                  type="text"
                  value={destinationSheet}
                  onChange={(e) => setDestinationSheet(e.target.value)}
                  className="w-full px-2.5 py-1.5 rounded-lg bg-slate-900 border border-slate-700 text-xs font-mono text-slate-200"
                />
              </div>
            </div>
          </div>

          {/* Inferred Output Selection */}
          <div className="space-y-2">
            <span className="text-xs font-semibold text-slate-300 block">Inferred Outputs</span>
            <div className="flex flex-wrap gap-2">
              {outputs.map((out) => (
                <button
                  key={out.id}
                  type="button"
                  onPointerDown={() => handleToggleOutput(out.id)}
                  className={`flex items-center gap-2 px-3 py-1.5 rounded-xl text-xs font-medium border transition-all cursor-pointer ${
                    out.selected
                      ? 'bg-violet-600/20 text-violet-300 border-violet-500/50'
                      : 'bg-slate-950/40 text-slate-400 border-slate-800'
                  }`}
                >
                  <div className={`w-4 h-4 rounded border flex items-center justify-center ${out.selected ? 'bg-violet-600 border-violet-500 text-white' : 'border-slate-700'}`}>
                    {out.selected && <BrowserCheckIcon size={12} />}
                  </div>
                  <span>{out.label}</span>
                </button>
              ))}
            </div>
          </div>
        </div>

        {/* Footer Actions */}
        <div className="flex items-center justify-between px-5 py-4 bg-slate-950/90 border-t border-slate-800">
          <button
            type="button"
            onPointerDown={(e) => {
              e.preventDefault();
              onClose();
            }}
            className="px-4 py-2 rounded-xl text-xs font-medium text-slate-400 hover:text-slate-200 hover:bg-slate-800 transition-colors cursor-pointer"
          >
            Discard
          </button>

          <button
            type="button"
            onPointerDown={(e) => {
              e.preventDefault();
              handleSave();
            }}
            className="flex items-center gap-2 px-5 py-2 rounded-xl bg-violet-600 hover:bg-violet-500 text-white text-xs font-semibold shadow-md transition-all cursor-pointer"
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
