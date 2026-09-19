import React, { useState, useEffect, useRef } from "react";
import {
  X,
  Folder,
  Briefcase,
  Compass,
  Rocket,
  Target,
  Layers,
  Code2,
  Globe,
  Shield,
  Terminal,
  Sparkles,
  Kanban,
  Check
} from "lucide-react";
import { RegaarderAiIcon } from "../RegaarderProductIcons";

export const PROJECT_ICON_OPTIONS = [
  { id: "folder", label: "Folder", icon: Folder },
  { id: "briefcase", label: "Briefcase", icon: Briefcase },
  { id: "compass", label: "Compass", icon: Compass },
  { id: "rocket", label: "Rocket", icon: Rocket },
  { id: "target", label: "Target", icon: Target },
  { id: "layers", label: "Layers", icon: Layers },
  { id: "code", label: "Code", icon: Code2 },
  { id: "globe", label: "Globe", icon: Globe },
  { id: "shield", label: "Shield", icon: Shield },
  { id: "terminal", label: "Terminal", icon: Terminal },
  { id: "kanban", label: "Board", icon: Kanban }
];

export const getProjectIconComponent = (iconId) => {
  const found = PROJECT_ICON_OPTIONS.find((item) => item.id === iconId);
  return found ? found.icon : Folder;
};

const COLOR_OPTIONS = [
  { label: "Purple", value: "#7C3AED" },
  { label: "Blue", value: "#2563EB" },
  { label: "Emerald", value: "#059669" },
  { label: "Amber", value: "#D97706" },
  { label: "Rose", value: "#E11D48" },
  { label: "Indigo", value: "#4F46E5" },
  { label: "Slate", value: "#475569" }
];

export default function CreateProjectModal({ isOpen, onClose, onCreate, project = null }) {
  const isEditing = Boolean(project);
  const [name, setName] = useState("");
  const [description, setDescription] = useState("");
  const [customInstructions, setCustomInstructions] = useState("");
  const [selectedColor, setSelectedColor] = useState(COLOR_OPTIONS[0].value);
  const [selectedIcon, setSelectedIcon] = useState("folder");
  const inputRef = useRef(null);

  useEffect(() => {
    if (isOpen) {
      if (project) {
        setName(project.name || "");
        setDescription(project.description || "");
        setCustomInstructions(project.customInstructions || "");
        setSelectedColor(project.color || COLOR_OPTIONS[0].value);
        setSelectedIcon(project.icon || "folder");
      } else {
        setName("");
        setDescription("");
        setCustomInstructions("");
        setSelectedColor(COLOR_OPTIONS[0].value);
        setSelectedIcon("folder");
      }
      setTimeout(() => inputRef.current?.focus(), 50);
    }
  }, [isOpen, project]);

  if (!isOpen) return null;

  const handleSubmit = (e) => {
    e?.preventDefault();
    if (!name.trim()) return;
    onCreate({
      ...(project ? { id: project.id } : {}),
      name: name.trim(),
      description: description.trim(),
      customInstructions: customInstructions.trim(),
      color: selectedColor,
      icon: selectedIcon
    });
    onClose();
  };

  const handleKeyDown = (e) => {
    if (e.key === "Escape") {
      onClose();
    }
  };

  return (
    <div
      className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/40 backdrop-blur-xs transition-opacity animate-in fade-in duration-150"
      onClick={onClose}
      onKeyDown={handleKeyDown}
    >
      <div
        role="dialog"
        aria-modal="true"
        aria-labelledby="create-project-title"
        className="w-full max-w-[480px] bg-white dark:bg-[#1C1C1F] rounded-2xl shadow-2xl border border-slate-200/80 dark:border-white/10 overflow-hidden flex flex-col transition-all transform scale-100"
        onClick={(e) => e.stopPropagation()}
      >
        {/* Header */}
        <div className="flex items-center justify-between px-6 pt-5 pb-3">
          <h2 id="create-project-title" className="text-[17px] font-semibold text-slate-900 dark:text-zinc-100">
            {isEditing ? "Edit project" : "Create project"}
          </h2>
          <button
            type="button"
            onClick={onClose}
            className="w-7 h-7 flex items-center justify-center rounded-lg text-slate-400 hover:text-slate-600 dark:hover:text-zinc-200 hover:bg-slate-100 dark:hover:bg-zinc-800 transition-colors cursor-pointer border-none bg-transparent"
          >
            <X size={16} />
          </button>
        </div>

        <form onSubmit={handleSubmit} className="px-6 pb-6 space-y-4">
          {/* Project Name Input with live icon preview */}
          <div className="space-y-1.5">
            <div className="flex items-center justify-between">
              <label className="text-[12px] font-medium text-slate-700 dark:text-zinc-300">
                Project name
              </label>
              <div className="flex items-center gap-1.5 text-[11px] text-slate-400">
                <span>Preview:</span>
                {(() => {
                  const PreviewGlyph = getProjectIconComponent(selectedIcon);
                  return (
                    <PreviewGlyph
                      size={18}
                      strokeWidth={1.8}
                      style={{ color: selectedColor }}
                    />
                  );
                })()}
              </div>
            </div>
            <div className="relative flex items-center">
              <input
                ref={inputRef}
                type="text"
                value={name}
                onChange={(e) => setName(e.target.value)}
                placeholder="e.g. Copenhagen Trip, Q4 Marketing Strategy"
                className="w-full h-10 px-3.5 rounded-xl border border-slate-200 dark:border-zinc-700/80 bg-white dark:bg-zinc-900/50 text-[13px] text-slate-900 dark:text-zinc-100 placeholder:text-slate-400 dark:placeholder:text-zinc-500 focus:outline-none focus:border-slate-400 dark:focus:border-zinc-500 transition-all"
                required
              />
            </div>
          </div>

          {/* Project Description Input */}
          <div className="space-y-1.5">
            <label className="text-[12px] font-medium text-slate-700 dark:text-zinc-300">
              Description (optional)
            </label>
            <input
              type="text"
              value={description}
              onChange={(e) => setDescription(e.target.value)}
              placeholder="Brief description of the project..."
              className="w-full h-10 px-3.5 rounded-xl border border-slate-200 dark:border-zinc-700/80 bg-white dark:bg-zinc-900/50 text-[13px] text-slate-900 dark:text-zinc-100 placeholder:text-slate-400 dark:placeholder:text-zinc-500 focus:outline-none focus:border-slate-400 dark:focus:border-zinc-500 transition-all"
            />
          </div>

          {/* Project Icon Glyph Selector */}
          <div className="space-y-1.5">
            <label className="text-[12px] font-medium text-slate-700 dark:text-zinc-300">
              Project icon
            </label>
            <div className="flex items-center gap-1.5 flex-wrap">
              {PROJECT_ICON_OPTIONS.map((item) => {
                const IconComponent = item.icon;
                const isSelected = selectedIcon === item.id;
                return (
                  <button
                    key={item.id}
                    type="button"
                    onClick={() => setSelectedIcon(item.id)}
                    className={`w-8 h-8 rounded-xl flex items-center justify-center transition-all cursor-pointer border ${
                      isSelected
                        ? "border-slate-300 dark:border-zinc-600 bg-slate-50 dark:bg-zinc-800 shadow-2xs scale-105"
                        : "border-slate-200/80 dark:border-zinc-800 bg-white dark:bg-zinc-900 text-slate-400 hover:border-slate-300 dark:hover:border-zinc-700 hover:text-slate-600 dark:hover:text-zinc-200"
                    }`}
                    style={isSelected ? { color: selectedColor } : {}}
                    title={item.label}
                  >
                    <IconComponent size={16} strokeWidth={isSelected ? 2.2 : 1.7} />
                  </button>
                );
              })}
            </div>
          </div>

          {/* Color Tag Picker */}
          <div className="space-y-1.5">
            <label className="text-[12px] font-medium text-slate-700 dark:text-zinc-300">
              Color accent
            </label>
            <div className="flex items-center gap-2">
              {COLOR_OPTIONS.map((c) => (
                <button
                  key={c.value}
                  type="button"
                  onClick={() => setSelectedColor(c.value)}
                  className={`w-6 h-6 rounded-full border-2 transition-transform cursor-pointer flex items-center justify-center ${
                    selectedColor === c.value
                      ? "scale-110 border-slate-900 dark:border-white shadow-xs"
                      : "border-transparent hover:scale-105"
                  }`}
                  style={{ backgroundColor: c.value }}
                  title={c.label}
                />
              ))}
            </div>
          </div>

          {/* Context Explainer Box (matching ChatGPT UX) */}
          <div className="p-3 bg-slate-50 dark:bg-zinc-900/60 rounded-xl border border-slate-200/60 dark:border-white/[0.06] flex items-start gap-2.5">
            <div className="mt-0.5 text-slate-600 dark:text-zinc-300 shrink-0">
              <RegaarderAiIcon size={16} strokeWidth={1.8} />
            </div>
            <p className="text-[12px] text-slate-500 dark:text-zinc-400 leading-relaxed m-0">
              Projects keep docs, sheets, decks, and custom instructions unified in one place. AI automatically leverages project knowledge across all workspace tools.
            </p>
          </div>

          {/* Optional Project Instructions / Memory */}
          <div className="space-y-1.5">
            <label className="text-[12px] font-medium text-slate-700 dark:text-zinc-300 flex items-center justify-between">
              <span>Project instructions & memory (optional)</span>
            </label>
            <textarea
              rows={2}
              value={customInstructions}
              onChange={(e) => setCustomInstructions(e.target.value)}
              placeholder="Provide background context, tone guidelines, or specific goals for Regaarder AI..."
              className="w-full p-3 rounded-xl border border-slate-200 dark:border-zinc-700/80 bg-white dark:bg-zinc-900/50 text-[13px] text-slate-900 dark:text-zinc-100 placeholder:text-slate-400 dark:placeholder:text-zinc-500 focus:outline-none focus:border-slate-400 dark:focus:border-zinc-500 transition-all resize-none"
            />
          </div>

          {/* Actions */}
          <div className="pt-2 flex items-center justify-end gap-2.5">
            <button
              type="button"
              onClick={onClose}
              className="px-4 h-9 rounded-xl text-[13px] font-medium text-slate-600 dark:text-zinc-400 hover:bg-slate-100 dark:hover:bg-zinc-800 transition-colors cursor-pointer border-none bg-transparent"
            >
              Cancel
            </button>
            <button
              type="submit"
              disabled={!name.trim()}
              className={`px-4 h-9 rounded-xl text-[13px] font-medium transition-all cursor-pointer border-none flex items-center gap-1.5 ${
                name.trim()
                  ? "bg-slate-900 hover:bg-slate-800 dark:bg-zinc-100 dark:hover:bg-white text-white dark:text-slate-900 shadow-xs active:scale-[0.98]"
                  : "bg-slate-100 dark:bg-zinc-800 text-slate-400 dark:text-zinc-500 cursor-not-allowed"
              }`}
            >
              {isEditing ? "Save changes" : "Create project"}
            </button>
          </div>
        </form>
      </div>
    </div>
  );
}
