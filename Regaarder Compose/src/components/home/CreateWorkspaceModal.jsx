import React, { useState, useEffect, useRef } from "react";
import { X, Building2, Briefcase, Sparkles, Check, Globe, Shield, Users } from "lucide-react";

export const WORKSPACE_COLOR_OPTIONS = [
  { label: "Purple", value: "#7C3AED", bg: "bg-purple-500" },
  { label: "Blue", value: "#2563EB", bg: "bg-blue-500" },
  { label: "Emerald", value: "#059669", bg: "bg-emerald-500" },
  { label: "Amber", value: "#D97706", bg: "bg-amber-500" },
  { label: "Rose", value: "#E11D48", bg: "bg-rose-500" },
  { label: "Indigo", value: "#4F46E5", bg: "bg-indigo-500" },
  { label: "Slate", value: "#475569", bg: "bg-slate-500" }
];

export const WORKSPACE_ICON_OPTIONS = [
  { id: "building", label: "Team Space", icon: Users },
  { id: "briefcase", label: "Company", icon: Briefcase },
  { id: "globe", label: "Global", icon: Globe },
  { id: "shield", label: "Private", icon: Shield }
];

export default function CreateWorkspaceModal({
  isOpen,
  onClose,
  onCreate
}) {
  const [workspaceName, setWorkspaceName] = useState("");
  const [selectedColor, setSelectedColor] = useState(WORKSPACE_COLOR_OPTIONS[0].value);
  const [selectedIcon, setSelectedIcon] = useState("building");
  const inputRef = useRef(null);

  useEffect(() => {
    if (isOpen) {
      setWorkspaceName("");
      setSelectedColor(WORKSPACE_COLOR_OPTIONS[0].value);
      setSelectedIcon("building");
      setTimeout(() => inputRef.current?.focus(), 50);
    }
  }, [isOpen]);

  if (!isOpen) return null;

  const handleSubmit = (e) => {
    e?.preventDefault();
    const trimmed = workspaceName.trim();
    if (!trimmed) return;

    if (onCreate) {
      onCreate({
        id: `ws_${Date.now()}`,
        name: trimmed,
        color: selectedColor,
        icon: selectedIcon,
        createdAt: new Date().toISOString()
      });
    }
    onClose();
  };

  const IconComp = WORKSPACE_ICON_OPTIONS.find((i) => i.id === selectedIcon)?.icon || Users;

  return (
    <div
      className="fixed inset-0 z-[10000000] flex items-center justify-center p-4 bg-black/50 backdrop-blur-xs animate-in fade-in duration-150"
      onClick={onClose}
    >
      <div
        className="w-full max-w-[440px] bg-white dark:bg-[#18181b] rounded-2xl border border-zinc-200/90 dark:border-zinc-800 shadow-2xl overflow-hidden animate-in zoom-in-95 duration-150"
        onClick={(e) => e.stopPropagation()}
      >
        {/* Modal Header */}
        <div className="flex items-center justify-between px-5 pt-5 pb-3 border-b border-zinc-100 dark:border-zinc-800/80">
          <div className="flex items-center gap-2.5">
            <div
              className="w-8 h-8 rounded-lg flex items-center justify-center text-white shadow-xs"
              style={{ backgroundColor: selectedColor }}
            >
              <IconComp size={16} strokeWidth={2.2} />
            </div>
            <div>
              <h3 className="text-[15px] font-semibold text-zinc-900 dark:text-white leading-tight">
                Create workspace
              </h3>
              <p className="text-[12px] text-zinc-500 dark:text-zinc-400">
                A dedicated space for your team, projects, and apps.
              </p>
            </div>
          </div>
          <button
            type="button"
            onClick={onClose}
            className="w-7 h-7 rounded-lg text-zinc-400 hover:text-zinc-700 dark:hover:text-zinc-200 hover:bg-zinc-100 dark:hover:bg-zinc-800 flex items-center justify-center transition-colors cursor-pointer border-none bg-transparent"
          >
            <X size={15} />
          </button>
        </div>

        {/* Modal Form */}
        <form onSubmit={handleSubmit} className="p-5 space-y-4">
          <div className="space-y-1.5">
            <label className="text-[12px] font-medium text-zinc-700 dark:text-zinc-300">
              Workspace name
            </label>
            <input
              ref={inputRef}
              type="text"
              value={workspaceName}
              onChange={(e) => setWorkspaceName(e.target.value)}
              placeholder="e.g. Acme Corp, Growth Lab, Design System"
              className="w-full px-3 py-2 rounded-lg border border-zinc-200 dark:border-zinc-700/80 bg-zinc-50/50 dark:bg-zinc-900/50 text-[13px] text-zinc-900 dark:text-white placeholder:text-zinc-400 focus:outline-none focus:border-zinc-400 dark:focus:border-zinc-500 focus:bg-white dark:focus:bg-zinc-900 transition-all"
            />
          </div>

          {/* Color accent */}
          <div className="space-y-1.5">
            <label className="text-[12px] font-medium text-zinc-700 dark:text-zinc-300">
              Color accent
            </label>
            <div className="flex items-center gap-2">
              {WORKSPACE_COLOR_OPTIONS.map((c) => (
                <button
                  key={c.value}
                  type="button"
                  onClick={() => setSelectedColor(c.value)}
                  className={`w-6 h-6 rounded-full border-2 transition-transform cursor-pointer flex items-center justify-center ${
                    selectedColor === c.value
                      ? "scale-110 border-zinc-900 dark:border-white shadow-xs"
                      : "border-transparent hover:scale-105"
                  }`}
                  style={{ backgroundColor: c.value }}
                  title={c.label}
                />
              ))}
            </div>
          </div>

          {/* Actions */}
          <div className="pt-2 flex items-center justify-end gap-2 border-t border-zinc-100 dark:border-zinc-800/80">
            <button
              type="button"
              onClick={onClose}
              className="px-3.5 h-8 rounded-lg text-[13px] font-medium text-zinc-600 dark:text-zinc-400 hover:bg-zinc-100 dark:hover:bg-zinc-800 transition-colors cursor-pointer border-none bg-transparent"
            >
              Cancel
            </button>
            <button
              type="submit"
              disabled={!workspaceName.trim()}
              className={`px-4 h-8 rounded-lg text-[13px] font-medium transition-all cursor-pointer border-none ${
                workspaceName.trim()
                  ? "bg-zinc-900 hover:bg-zinc-800 dark:bg-white dark:hover:bg-zinc-100 text-white dark:text-zinc-950 shadow-xs active:scale-[0.98]"
                  : "bg-zinc-100 dark:bg-zinc-800 text-zinc-400 dark:text-zinc-500 cursor-not-allowed"
              }`}
            >
              Create workspace
            </button>
          </div>
        </form>
      </div>
    </div>
  );
}
