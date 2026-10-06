import React, { useState, useEffect } from "react";
import { X, Paperclip, FileText, Check } from "lucide-react";
import { RegaarderAiIcon } from "../RegaarderProductIcons";
import { getProjectIconComponent } from "./CreateProjectModal";

/**
 * EditProjectMemoryModal
 *
 * A focused, distraction-free modal specifically for viewing and refining
 * persistent AI Memory & Directives for projects.
 * Excludes metadata (name, icon, color, description) which belongs to Edit Project.
 */
export default function EditProjectMemoryModal({
  isOpen,
  project,
  projects = [],
  documents = [],
  onClose,
  onSave
}) {
  const [targetProjectId, setTargetProjectId] = useState(project ? project.id : "");
  const [memoryDirectives, setMemoryDirectives] = useState(
    project ? project.customInstructions || "" : ""
  );
  const [attachedDocIds, setAttachedDocIds] = useState([]);
  const [showDocPicker, setShowDocPicker] = useState(false);

  useEffect(() => {
    if (project) {
      setTargetProjectId(project.id);
      setMemoryDirectives(project.customInstructions || "");
      setAttachedDocIds(project.memoryDocIds || []);
    }
  }, [project, isOpen]);

  if (!isOpen || !project) return null;

  const currentSelectedProject =
    projects.find((p) => p.id === targetProjectId) || project;

  const handleToggleDoc = (docId) => {
    setAttachedDocIds((prev) =>
      prev.includes(docId) ? prev.filter((id) => id !== docId) : [...prev, id]
    );
  };

  const handleSave = (e) => {
    e.preventDefault();
    if (onSave) {
      onSave({
        projectId: targetProjectId,
        customInstructions: memoryDirectives.trim(),
        memoryDocIds: attachedDocIds
      });
    }
    onClose();
  };

  const attachedDocs = documents.filter((d) => attachedDocIds.includes(d.id));

  return (
    <div
      className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/40 backdrop-blur-xs animate-in fade-in duration-150"
      onClick={onClose}
    >
      <div
        role="dialog"
        aria-modal="true"
        className="w-full max-w-[540px] bg-white dark:bg-[#1C1C1F] rounded-2xl shadow-2xl border border-slate-200/80 dark:border-white/10 overflow-hidden flex flex-col p-6 space-y-4 animate-in zoom-in-95 duration-150"
        onClick={(e) => e.stopPropagation()}
      >
        {/* Modal Header */}
        <div className="flex items-center justify-between">
          <div className="flex items-center gap-2">
            <RegaarderAiIcon size={18} strokeWidth={1.8} className="text-[#7C3AED] dark:text-violet-400" />
            <div>
              <h3 className="text-[15px] font-semibold text-slate-900 dark:text-zinc-100 tracking-tight">
                Project Memory & Directives
              </h3>
            </div>
          </div>
          <button
            type="button"
            onClick={onClose}
            className="w-7 h-7 flex items-center justify-center rounded-lg text-slate-400 hover:text-slate-600 dark:hover:text-zinc-200 cursor-pointer border-none bg-transparent transition-colors"
          >
            <X size={15} />
          </button>
        </div>

        <form onSubmit={handleSave} className="space-y-4">
          {/* Scope Selector */}
          <div className="space-y-1.5">
            <label className="text-[11.5px] font-medium text-slate-500 dark:text-zinc-400 block">
              Scope
            </label>
            <div className="flex items-center gap-2">
              <select
                value={targetProjectId}
                onChange={(e) => {
                  const newId = e.target.value;
                  setTargetProjectId(newId);
                  const matched = projects.find((p) => p.id === newId);
                  if (matched) {
                    setMemoryDirectives(matched.customInstructions || "");
                    setAttachedDocIds(matched.memoryDocIds || []);
                  }
                }}
                className="h-8 px-2.5 rounded-lg border border-slate-200/90 dark:border-zinc-700 bg-slate-50/70 dark:bg-zinc-800 text-[12px] font-medium text-slate-800 dark:text-zinc-200 outline-none cursor-pointer focus:border-slate-400"
              >
                {projects.map((p) => (
                  <option key={p.id} value={p.id}>
                    {p.name}
                  </option>
                ))}
              </select>
              <span className="text-[11px] text-slate-400 dark:text-zinc-500">
                Directives apply when Regaarder AI acts within this project
              </span>
            </div>
          </div>

          {/* Primary Memory Input */}
          <div className="space-y-1.5">
            <label className="text-[11.5px] font-medium text-slate-700 dark:text-zinc-300 block">
              Directives & Context
            </label>
            <textarea
              value={memoryDirectives}
              onChange={(e) => setMemoryDirectives(e.target.value)}
              placeholder="e.g. Prioritize clean, Apple-tier UI. Use executive tone. Follow repository architectural standards..."
              rows={5}
              className="w-full p-3 rounded-xl border border-slate-200/90 dark:border-zinc-700 bg-slate-50/50 dark:bg-zinc-850/50 text-[12px] text-slate-900 dark:text-zinc-100 outline-none focus:border-slate-400 dark:focus:border-zinc-500 placeholder:text-slate-400 resize-none transition-colors leading-relaxed"
              autoFocus
            />
          </div>

          {/* Supporting Documents (Future-Ready Attachment Affordance) */}
          <div className="space-y-2 pt-0.5">
            <div className="flex items-center justify-between">
              <span className="text-[11.5px] font-medium text-slate-500 dark:text-zinc-400">
                Supporting Files ({attachedDocIds.length})
              </span>
              <button
                type="button"
                onClick={() => setShowDocPicker((prev) => !prev)}
                className="text-[11px] text-slate-500 hover:text-slate-800 dark:text-zinc-400 dark:hover:text-zinc-200 flex items-center gap-1 cursor-pointer border-none bg-transparent"
              >
                <Paperclip size={11} />
                <span>{showDocPicker ? "Hide files" : "Attach files"}</span>
              </button>
            </div>

            {/* Attached Chips */}
            {attachedDocs.length > 0 && (
              <div className="flex items-center gap-1.5 flex-wrap">
                {attachedDocs.map((doc) => (
                  <span
                    key={doc.id}
                    className="inline-flex items-center gap-1 px-2 py-0.5 rounded-md bg-slate-100 dark:bg-zinc-800 text-[11px] text-slate-700 dark:text-zinc-300"
                  >
                    <FileText size={10} className="text-slate-400" />
                    <span className="truncate max-w-[140px]">{doc.name || doc.title}</span>
                    <button
                      type="button"
                      onClick={() => handleToggleDoc(doc.id)}
                      className="p-0.5 hover:text-rose-500 cursor-pointer border-none bg-transparent"
                    >
                      <X size={10} />
                    </button>
                  </span>
                ))}
              </div>
            )}

            {/* Doc Picker List (Progressively Disclosed) */}
            {showDocPicker && (
              <div className="p-2 rounded-xl border border-slate-200/80 dark:border-zinc-750 bg-slate-50/60 dark:bg-zinc-850/40 max-h-32 overflow-y-auto space-y-1 animate-in fade-in duration-100">
                {documents.length === 0 ? (
                  <p className="text-[11px] text-slate-400 text-center py-2 m-0">
                    No documents available in workspace.
                  </p>
                ) : (
                  documents.map((doc) => {
                    const isAttached = attachedDocIds.includes(doc.id);
                    return (
                      <div
                        key={doc.id}
                        onClick={() => handleToggleDoc(doc.id)}
                        className={`p-1.5 rounded-lg text-[11.5px] flex items-center justify-between cursor-pointer transition-colors ${
                          isAttached
                            ? "bg-white dark:bg-zinc-800 font-medium text-slate-800 dark:text-zinc-200 shadow-2xs"
                            : "hover:bg-slate-200/50 dark:hover:bg-zinc-800/40 text-slate-600 dark:text-zinc-400"
                        }`}
                      >
                        <div className="flex items-center gap-1.5 truncate">
                          <FileText size={11} className="text-slate-400 shrink-0" />
                          <span className="truncate">{doc.name || doc.title || "Untitled"}</span>
                        </div>
                        {isAttached && <Check size={11} className="text-[#7C3AED] shrink-0" />}
                      </div>
                    );
                  })
                )}
              </div>
            )}
          </div>

          {/* Modal Footer */}
          <div className="pt-2 flex items-center justify-between border-t border-slate-100 dark:border-white/[0.04]">
            <span className="text-[11px] text-slate-400 dark:text-zinc-500">
              {memoryDirectives.length > 0 ? `${memoryDirectives.length} characters` : "No memory set"}
            </span>

            <div className="flex items-center gap-2">
              <button
                type="button"
                onClick={onClose}
                className="px-3.5 h-8 rounded-lg text-xs font-medium text-slate-500 hover:text-slate-800 dark:text-zinc-400 dark:hover:text-zinc-200 cursor-pointer border-none bg-transparent transition-colors"
              >
                Cancel
              </button>
              <button
                type="submit"
                className="px-4 h-8 rounded-lg bg-slate-900 hover:bg-slate-800 dark:bg-zinc-100 dark:hover:bg-white dark:text-zinc-900 text-white text-xs font-semibold cursor-pointer border-none shadow-xs transition-all"
              >
                Save Memory
              </button>
            </div>
          </div>
        </form>
      </div>
    </div>
  );
}
