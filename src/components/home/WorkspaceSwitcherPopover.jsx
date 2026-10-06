import React, { useEffect, useRef } from "react";
import { Check, Plus, Users, Briefcase, Globe, Shield } from "lucide-react";

export const getWorkspaceIcon = (iconId) => {
  switch (iconId) {
    case "briefcase":
      return Briefcase;
    case "globe":
      return Globe;
    case "shield":
      return Shield;
    case "building":
    default:
      return Users;
  }
};

export default function WorkspaceSwitcherPopover({
  isOpen,
  onClose,
  anchorRect,
  workspaces = [],
  currentWorkspace = null,
  onSelectWorkspace,
  onNewWorkspace
}) {
  const popoverRef = useRef(null);

  useEffect(() => {
    if (!isOpen) return;
    const handleOutsideClick = (e) => {
      if (popoverRef.current && !popoverRef.current.contains(e.target)) {
        onClose();
      }
    };
    const handleKeyDown = (e) => {
      if (e.key === "Escape") onClose();
    };
    document.addEventListener("pointerdown", handleOutsideClick);
    document.addEventListener("keydown", handleKeyDown);
    return () => {
      document.removeEventListener("pointerdown", handleOutsideClick);
      document.removeEventListener("keydown", handleKeyDown);
    };
  }, [isOpen, onClose]);

  if (!isOpen || !anchorRect) return null;

  const top = anchorRect.bottom + 6;
  const left = Math.max(12, anchorRect.left);
  const width = Math.max(220, anchorRect.width);

  return (
    <div
      ref={popoverRef}
      style={{
        position: "fixed",
        top: `${top}px`,
        left: `${left}px`,
        width: `${width}px`,
        zIndex: 999999
      }}
      className="bg-white dark:bg-[#1c1c1f] rounded-xl border border-zinc-200/90 dark:border-zinc-800 shadow-xl p-1.5 font-sans select-none animate-in fade-in zoom-in-95 duration-100 ease-out"
    >
      <div className="px-2 py-1.5 text-[10.5px] font-semibold text-zinc-400 dark:text-zinc-500 uppercase tracking-wider">
        Workspaces
      </div>

      <div className="space-y-0.5 max-h-[220px] overflow-y-auto no-scrollbar">
        {workspaces.map((ws) => {
          const isSelected = String(ws.id) === String(currentWorkspace?.id);
          const IconComponent = getWorkspaceIcon(ws.icon);

          return (
            <button
              key={ws.id}
              type="button"
              onClick={() => {
                onSelectWorkspace(ws);
                onClose();
              }}
              className={`w-full flex items-center justify-between px-2.5 py-1.5 rounded-lg text-[13px] font-medium transition-colors cursor-pointer border-none text-left ${
                isSelected
                  ? "bg-zinc-100 dark:bg-zinc-800 text-zinc-950 dark:text-white"
                  : "text-zinc-700 dark:text-zinc-300 hover:bg-zinc-50 dark:hover:bg-zinc-800/60"
              }`}
            >
              <div className="flex items-center gap-2 min-w-0">
                <div
                  className="w-5 h-5 rounded-md flex items-center justify-center text-white shrink-0 text-[10px]"
                  style={{ backgroundColor: ws.color || "#7C3AED" }}
                >
                  <IconComponent size={12} strokeWidth={2.2} />
                </div>
                <span className="truncate">{ws.name}</span>
              </div>
              {isSelected && (
                <Check size={14} className="text-zinc-900 dark:text-white shrink-0 ml-1.5" />
              )}
            </button>
          );
        })}
      </div>

      <div className="pt-1 mt-1 border-t border-zinc-100 dark:border-zinc-800/80">
        <button
          type="button"
          onClick={() => {
            onClose();
            if (onNewWorkspace) onNewWorkspace();
          }}
          className="w-full flex items-center gap-2 px-2.5 py-1.5 rounded-lg text-[12.5px] font-medium text-zinc-600 dark:text-zinc-400 hover:text-zinc-900 dark:hover:text-white hover:bg-zinc-100 dark:hover:bg-zinc-800/70 transition-colors cursor-pointer border-none bg-transparent text-left"
        >
          <div className="w-5 h-5 rounded-md border border-dashed border-zinc-300 dark:border-zinc-700 flex items-center justify-center shrink-0 text-zinc-500">
            <Plus size={12} strokeWidth={2.2} />
          </div>
          <span>Create workspace...</span>
        </button>
      </div>
    </div>
  );
}
