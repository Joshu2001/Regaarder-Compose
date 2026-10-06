import React, { useState, useMemo } from "react";
import { X, Search, UserPlus, Check, Users } from "lucide-react";
import { getRegistryUsers } from "../../services/relayAccountService";

/**
 * InviteProjectMemberModal
 *
 * Apple-style minimalist dialog to invite team members to a Project with specific roles.
 */
export default function InviteProjectMemberModal({
  isOpen,
  project,
  existingMembers = [],
  onClose,
  onInviteMember
}) {
  const [searchQuery, setSearchQuery] = useState("");
  const [selectedUser, setSelectedUser] = useState(null);
  const [emailInput, setEmailInput] = useState("");
  const [selectedRole, setSelectedRole] = useState("editor"); // 'editor' | 'viewer'

  // Discoverable workspace users from Relay directory
  const availableUsers = useMemo(() => {
    try {
      const all = getRegistryUsers() || [];
      const memberIds = new Set(existingMembers.map((m) => m.id || m.email));
      return all.filter((u) => !memberIds.has(u.id) && !memberIds.has(u.email));
    } catch {
      return [];
    }
  }, [existingMembers]);

  const filteredUsers = useMemo(() => {
    if (!searchQuery.trim()) return availableUsers.slice(0, 8);
    const q = searchQuery.toLowerCase().trim();
    return availableUsers.filter(
      (u) =>
        u.displayName?.toLowerCase().includes(q) ||
        u.email?.toLowerCase().includes(q) ||
        u.handle?.toLowerCase().includes(q)
    );
  }, [availableUsers, searchQuery]);

  if (!isOpen || !project) return null;

  const handleSubmit = (e) => {
    e?.preventDefault();
    if (selectedUser) {
      onInviteMember({
        id: selectedUser.id || `member_${Date.now()}`,
        name: selectedUser.displayName || selectedUser.name || selectedUser.email,
        email: selectedUser.email || "",
        role: selectedRole,
        avatarColor: selectedUser.avatarColor || project.color || "#7C3AED"
      });
      onClose();
      return;
    }

    if (emailInput.trim()) {
      const cleanEmail = emailInput.trim();
      const derivedName = cleanEmail.split("@")[0];
      onInviteMember({
        id: `member_${Date.now()}`,
        name: derivedName.charAt(0).toUpperCase() + derivedName.slice(1),
        email: cleanEmail,
        role: selectedRole,
        avatarColor: project.color || "#7C3AED"
      });
      onClose();
    }
  };

  return (
    <div
      className="fixed inset-0 z-[1300] bg-black/40 backdrop-blur-xs flex items-center justify-center p-4 animate-in fade-in duration-150 select-none font-sans"
      onPointerDown={(e) => {
        if (e.target === e.currentTarget) onClose();
      }}
    >
      <div
        className="w-full max-w-md bg-white dark:bg-zinc-850 rounded-2xl shadow-2xl border border-black/[0.08] dark:border-white/[0.1] overflow-hidden flex flex-col animate-in zoom-in-95 duration-150"
        onPointerDown={(e) => e.stopPropagation()}
      >
        {/* Header */}
        <div className="px-5 py-4 border-b border-black/[0.06] dark:border-white/[0.08] flex items-center justify-between">
          <div className="flex items-center gap-2">
            <div
              className="w-7 h-7 rounded-lg flex items-center justify-center text-white shrink-0 shadow-2xs"
              style={{ backgroundColor: project.color || "#7C3AED" }}
            >
              <UserPlus size={14} />
            </div>
            <div>
              <h3 className="text-sm font-bold text-slate-900 dark:text-zinc-100">
                Invite to {project.name}
              </h3>
              <p className="text-[11px] text-slate-500 dark:text-zinc-400">
                Add collaborators and configure project access
              </p>
            </div>
          </div>
          <button
            type="button"
            onClick={onClose}
            className="p-1.5 rounded-lg text-slate-400 hover:text-slate-600 dark:hover:text-zinc-200 hover:bg-black/[0.04] transition-colors cursor-pointer border-none bg-transparent"
          >
            <X size={15} />
          </button>
        </div>

        <form onSubmit={handleSubmit} className="p-4 space-y-4">
          {/* User / Email Search */}
          <div className="space-y-1.5">
            <label className="text-[12px] font-medium text-slate-700 dark:text-zinc-300">
              Invite teammate or email
            </label>
            <div className="relative flex items-center">
              <Search size={13} className="absolute left-3 text-slate-400 pointer-events-none" />
              <input
                type="text"
                value={selectedUser ? (selectedUser.displayName || selectedUser.email) : emailInput}
                onChange={(e) => {
                  if (selectedUser) setSelectedUser(null);
                  setEmailInput(e.target.value);
                  setSearchQuery(e.target.value);
                }}
                placeholder="Name or teammate@company.com..."
                className="w-full h-9 pl-9 pr-3 rounded-xl bg-slate-100/80 dark:bg-zinc-800 text-xs text-slate-800 dark:text-zinc-100 placeholder:text-slate-400 focus:outline-none focus:ring-2 focus:ring-violet-500/20 border border-transparent focus:border-slate-200 dark:focus:border-zinc-700 transition-all"
                autoFocus
              />
            </div>
          </div>

          {/* Directory Suggestions */}
          {!selectedUser && filteredUsers.length > 0 && (
            <div className="space-y-1 max-h-36 overflow-y-auto thin-scrollbar p-1 rounded-xl bg-slate-50 dark:bg-zinc-900/60 border border-slate-200/60 dark:border-white/[0.06]">
              <div className="text-[10px] font-semibold text-slate-400 dark:text-zinc-500 uppercase tracking-wider px-2 py-1">
                Workspace Contacts
              </div>
              {filteredUsers.map((user) => (
                <button
                  key={user.id}
                  type="button"
                  onClick={() => {
                    setSelectedUser(user);
                    setEmailInput(user.email || "");
                  }}
                  className="w-full text-left flex items-center justify-between px-2.5 py-1.5 rounded-lg hover:bg-violet-50 dark:hover:bg-violet-950/40 hover:text-violet-700 transition-colors cursor-pointer border-none bg-transparent"
                >
                  <div className="flex items-center gap-2 min-w-0">
                    <span
                      className="w-6 h-6 rounded-full flex items-center justify-center text-[10px] font-bold text-white shrink-0"
                      style={{ backgroundColor: user.avatarColor || "#7C3AED" }}
                    >
                      {(user.displayName || user.name || "U").slice(0, 1).toUpperCase()}
                    </span>
                    <span className="text-[12px] font-medium text-slate-800 dark:text-zinc-200 truncate">
                      {user.displayName || user.name || user.email}
                    </span>
                  </div>
                  <span className="text-[10.5px] text-slate-400 truncate">
                    {user.handle || user.role || user.email}
                  </span>
                </button>
              ))}
            </div>
          )}

          {/* Role Selection */}
          <div className="space-y-1.5">
            <label className="text-[12px] font-medium text-slate-700 dark:text-zinc-300">
              Project permission
            </label>
            <div className="grid grid-cols-2 gap-2">
              <button
                type="button"
                onClick={() => setSelectedRole("editor")}
                className={`p-2.5 rounded-xl border text-left transition-all cursor-pointer ${
                  selectedRole === "editor"
                    ? "border-[#7C3AED] bg-violet-50/70 dark:bg-violet-950/40 text-violet-900 dark:text-violet-200"
                    : "border-slate-200/70 dark:border-zinc-700 bg-white dark:bg-zinc-800 text-slate-700 dark:text-zinc-300 hover:bg-slate-50 dark:hover:bg-zinc-700/50"
                }`}
              >
                <div className="text-[12px] font-semibold flex items-center justify-between">
                  <span>Editor</span>
                  {selectedRole === "editor" && <Check size={12} className="text-[#7C3AED]" />}
                </div>
                <div className="text-[10.5px] text-slate-400 mt-0.5 leading-snug">
                  Can create files, edit roadmap, and manage tasks.
                </div>
              </button>

              <button
                type="button"
                onClick={() => setSelectedRole("viewer")}
                className={`p-2.5 rounded-xl border text-left transition-all cursor-pointer ${
                  selectedRole === "viewer"
                    ? "border-[#7C3AED] bg-violet-50/70 dark:bg-violet-950/40 text-violet-900 dark:text-violet-200"
                    : "border-slate-200/70 dark:border-zinc-700 bg-white dark:bg-zinc-800 text-slate-700 dark:text-zinc-300 hover:bg-slate-50 dark:hover:bg-zinc-700/50"
                }`}
              >
                <div className="text-[12px] font-semibold flex items-center justify-between">
                  <span>Viewer</span>
                  {selectedRole === "viewer" && <Check size={12} className="text-[#7C3AED]" />}
                </div>
                <div className="text-[10.5px] text-slate-400 mt-0.5 leading-snug">
                  Can read project files, milestones, and memory.
                </div>
              </button>
            </div>
          </div>

          {/* Actions */}
          <div className="pt-2 flex items-center justify-end gap-2 border-t border-slate-100 dark:border-white/[0.06]">
            <button
              type="button"
              onClick={onClose}
              className="px-3.5 py-1.5 rounded-xl text-xs font-medium text-slate-600 dark:text-zinc-400 hover:bg-black/[0.05] transition-colors cursor-pointer border-none bg-transparent"
            >
              Cancel
            </button>
            <button
              type="submit"
              disabled={!selectedUser && !emailInput.trim()}
              className="px-4 py-1.5 rounded-xl text-xs font-semibold bg-slate-900 hover:bg-slate-800 dark:bg-zinc-100 dark:hover:bg-white text-white dark:text-slate-900 disabled:opacity-40 disabled:cursor-not-allowed shadow-xs transition-all cursor-pointer border-none flex items-center gap-1.5"
            >
              <UserPlus size={13} />
              <span>Invite member</span>
            </button>
          </div>
        </form>
      </div>
    </div>
  );
}