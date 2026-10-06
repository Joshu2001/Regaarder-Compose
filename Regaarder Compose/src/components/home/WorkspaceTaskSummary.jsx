import React, { useState, useEffect } from "react";
import { CheckCircle2, Circle, ArrowRight } from "lucide-react";

export default function WorkspaceTaskSummary({ onOpenTasks }) {
  const [tasks, setTasks] = useState([]);

  useEffect(() => {
    try {
      const activeTasks = [];
      for (let i = 0; i < localStorage.length; i++) {
        const key = localStorage.key(i);
        if (key && key.startsWith("rc.savedDoc.")) {
          const raw = localStorage.getItem(key);
          if (raw) {
            const data = JSON.parse(raw);
            if (Array.isArray(data.tasks)) {
              data.tasks.forEach((t) => {
                const title = t.title || t.text;
                if (title && !t.completed) {
                  activeTasks.push({
                    id: t.id || Math.random().toString(),
                    title,
                    docTitle: data.docTitle || data.title || "Document",
                    docId: Number(key.replace("rc.savedDoc.", ""))
                  });
                }
              });
            }
          }
        }
      }
      setTasks(activeTasks.slice(0, 3));
    } catch {
      // Ignore task indexing failures
    }
  }, []);

  if (tasks.length === 0) return null;

  return (
    <div className="mb-6 p-4 rounded-xl bg-slate-50/80 dark:bg-zinc-800/40 border border-slate-200/60 dark:border-white/[0.06] select-none">
      <div className="flex items-center justify-between mb-2.5">
        <span className="text-[11px] font-semibold text-slate-500 dark:text-zinc-400 uppercase tracking-wider">
          Action Items & Tasks
        </span>
        {onOpenTasks && (
          <button
            type="button"
            onClick={onOpenTasks}
            className="text-xs text-blue-600 dark:text-blue-400 hover:underline flex items-center gap-1 cursor-pointer font-medium"
          >
            <span>View all</span>
            <ArrowRight size={12} />
          </button>
        )}
      </div>

      <div className="space-y-2">
        {tasks.map((task) => (
          <div
            key={task.id}
            className="flex items-center justify-between p-2 rounded-lg bg-white dark:bg-zinc-800/80 border border-slate-200/50 dark:border-white/[0.06] text-xs"
          >
            <div className="flex items-center gap-2 truncate">
              <Circle size={13} className="text-slate-400 shrink-0" />
              <span className="text-slate-800 dark:text-zinc-200 truncate font-medium">
                {task.title}
              </span>
            </div>
            <span className="text-[11px] text-slate-400 dark:text-zinc-500 shrink-0 ml-2">
              {task.docTitle}
            </span>
          </div>
        ))}
      </div>
    </div>
  );
}
