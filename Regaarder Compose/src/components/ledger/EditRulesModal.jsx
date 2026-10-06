import React, { useState } from "react";
import {
  X,
  Plus,
  Trash2,
  Check,
  ShieldCheck,
  Sliders,
  DollarSign
} from "lucide-react";

export default function EditRulesModal({
  isOpen = false,
  onClose = () => {},
  rules = [],
  onSaveRules = () => {},
  showToast = () => {}
}) {
  const [localRules, setLocalRules] = useState(rules);
  const [newRuleName, setNewRuleName] = useState("");
  const [newRuleType, setNewRuleType] = useState("check");

  if (!isOpen) return null;

  const handleToggle = (id) => {
    setLocalRules(prev => prev.map(r => r.id === id ? { ...r, enabled: !r.enabled } : r));
  };

  const handleDelete = (id) => {
    setLocalRules(prev => prev.filter(r => r.id !== id));
  };

  const handleAddRule = (e) => {
    e.preventDefault();
    if (!newRuleName.trim()) return;
    const newRule = {
      id: `rule-${Date.now()}`,
      label: newRuleName.trim(),
      status: 'Active',
      enabled: true,
      description: 'Custom compliance rule'
    };
    setLocalRules(prev => [...prev, newRule]);
    setNewRuleName("");
    showToast("Added custom rule");
  };

  const handleSave = () => {
    onSaveRules(localRules);
    onClose();
    showToast("Rules updated successfully");
  };

  return (
    <>
      {/* Backdrop */}
      <div
        className="fixed inset-0 z-[380] bg-slate-900/20 dark:bg-black/50 backdrop-blur-[3px] transition-opacity animate-in fade-in"
        onClick={onClose}
      />

      {/* Modal Dialog */}
      <div className="fixed top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 z-[390] w-full max-w-lg bg-white dark:bg-zinc-900 border border-slate-200/80 dark:border-zinc-800 rounded-3xl shadow-[0_24px_50px_rgba(0,0,0,0.15)] p-6 flex flex-col gap-5 select-none animate-in fade-in zoom-in-95 duration-200">
        
        {/* Header */}
        <div className="flex items-center justify-between pb-3 border-b border-slate-100 dark:border-zinc-800">
          <div className="flex items-center gap-2.5">
            <div className="w-8 h-8 rounded-xl bg-slate-100 dark:bg-zinc-800 text-slate-700 dark:text-zinc-300 flex items-center justify-center">
              <Sliders size={16} strokeWidth={2} />
            </div>
            <div>
              <h3 className="text-sm font-bold text-slate-900 dark:text-zinc-100">
                Rules to follow
              </h3>
              <p className="text-xs text-slate-400 dark:text-zinc-500">
                Configure deterministic integrity & compliance guards
              </p>
            </div>
          </div>
          <button
            type="button"
            onClick={onClose}
            className="w-7 h-7 rounded-lg text-slate-400 hover:text-slate-700 dark:hover:text-zinc-200 hover:bg-slate-100 dark:hover:bg-zinc-800 flex items-center justify-center transition-colors cursor-pointer"
          >
            <X size={15} />
          </button>
        </div>

        {/* Rules List */}
        <div className="flex flex-col gap-2.5 max-h-72 overflow-y-auto pr-1">
          {localRules.map((rule) => (
            <div
              key={rule.id}
              className="flex items-center justify-between p-3 rounded-2xl bg-slate-50/70 dark:bg-zinc-800/40 border border-slate-100 dark:border-zinc-800 hover:border-slate-200 transition-colors"
            >
              <div className="flex items-center gap-3 min-w-0 flex-1">
                {/* Custom Apple-style switch */}
                <button
                  type="button"
                  onClick={() => handleToggle(rule.id)}
                  className={`w-9 h-5 rounded-full p-0.5 transition-colors cursor-pointer shrink-0 ${
                    rule.enabled ? "bg-slate-900 dark:bg-white" : "bg-slate-300 dark:bg-zinc-700"
                  }`}
                >
                  <div
                    className={`w-4 h-4 rounded-full bg-white dark:bg-zinc-900 transition-transform ${
                      rule.enabled ? "translate-x-4" : "translate-x-0"
                    }`}
                  />
                </button>
                <div className="min-w-0 flex-1">
                  <span className={`text-xs font-semibold block truncate ${
                    rule.enabled ? "text-slate-800 dark:text-zinc-200" : "text-slate-400 line-through"
                  }`}>
                    {rule.label}
                  </span>
                  <span className="text-[10.5px] text-slate-400 dark:text-zinc-500 font-normal">
                    {rule.description || "Strict mathematical invariant"}
                  </span>
                </div>
              </div>

              <button
                type="button"
                onClick={() => handleDelete(rule.id)}
                className="text-slate-300 hover:text-red-500 p-1 rounded-lg transition-colors cursor-pointer shrink-0 ml-2"
                title="Remove rule"
              >
                <Trash2 size={13} />
              </button>
            </div>
          ))}
        </div>

        {/* Add Rule Form */}
        <form onSubmit={handleAddRule} className="flex items-center gap-2 pt-2 border-t border-slate-100 dark:border-zinc-800">
          <input
            type="text"
            value={newRuleName}
            onChange={(e) => setNewRuleName(e.target.value)}
            placeholder="Add new accounting rule or threshold..."
            className="flex-1 bg-slate-50 dark:bg-zinc-800 border border-slate-200 dark:border-zinc-700 rounded-xl px-3 py-1.5 text-xs text-slate-800 dark:text-zinc-200 placeholder-slate-400 focus:outline-none focus:border-slate-400"
          />
          <button
            type="submit"
            disabled={!newRuleName.trim()}
            className="px-3 py-1.5 rounded-xl bg-slate-900 dark:bg-white text-white dark:text-slate-900 text-xs font-semibold cursor-pointer disabled:opacity-40 disabled:cursor-not-allowed hover:opacity-90 transition-opacity shrink-0 flex items-center gap-1"
          >
            <Plus size={13} />
            <span>Add</span>
          </button>
        </form>

        {/* Footer Actions */}
        <div className="flex items-center justify-end gap-2 pt-3 border-t border-slate-100 dark:border-zinc-800">
          <button
            type="button"
            onClick={onClose}
            className="px-4 py-1.5 rounded-xl border border-slate-200 dark:border-zinc-700 text-xs font-medium text-slate-600 dark:text-zinc-300 hover:bg-slate-100 dark:hover:bg-zinc-800 cursor-pointer"
          >
            Cancel
          </button>
          <button
            type="button"
            onClick={handleSave}
            className="px-4 py-1.5 rounded-xl bg-slate-900 dark:bg-white text-white dark:text-slate-900 text-xs font-semibold hover:opacity-90 cursor-pointer shadow-xs"
          >
            Save Rules
          </button>
        </div>

      </div>
    </>
  );
}
