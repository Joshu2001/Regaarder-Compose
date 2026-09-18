import React, { useState, useMemo } from "react";
import {
  Folder,
  Plus,
  Search,
  ArrowUpDown,
  MoreHorizontal,
  Calendar,
  Pin,
  PinOff,
  Trash2,
  ExternalLink,
  FileText,
  Clock,
  ChevronRight,
  Filter,
  Share2,
  Download,
  Check,
  Send,
  Edit2,
  X
} from "lucide-react";
import { AppNativeSvgIcon } from "../home/AppNativeSvgIcon";
import { RegaarderAiIcon } from "../RegaarderProductIcons";
import { deleteProject, updateProject } from "../../services/workspaceProjectStore";
import { updateWorkspaceDocument } from "../../services/workspaceDocumentStore";
import CreateProjectModal from "./CreateProjectModal";
import ShareProjectToRelayModal from "./ShareProjectToRelayModal";
import AddExistingFilesToProjectModal from "./AddExistingFilesToProjectModal";

export default function ProjectsWorkspace({
  projects = [],
  documents = [],
  onOpenCreateModal,
  onLaunchApp,
  onSelectProject,
  initialProjectId = null
}) {
  const [searchQuery, setSearchQuery] = useState("");
  const [sortBy, setSortBy] = useState("updated"); // 'updated' | 'created' | 'alpha'
  const [selectedProjectId, setSelectedProjectId] = useState(initialProjectId);
  const [menuOpenId, setMenuOpenId] = useState(null);
  const [editingProject, setEditingProject] = useState(null);
  const [shareToRelayProject, setShareToRelayProject] = useState(null);
  const [isAddFilesModalOpen, setIsAddFilesModalOpen] = useState(false);

  React.useEffect(() => {
    if (initialProjectId) {
      setSelectedProjectId(initialProjectId);
    }
  }, [initialProjectId]);

  // Active project if drilling down
  const activeProject = useMemo(() => {
    return projects.find((p) => p.id === selectedProjectId) || null;
  }, [projects, selectedProjectId]);

  // Filtered & sorted projects
  const filteredProjects = useMemo(() => {
    let result = [...projects];

    if (searchQuery.trim()) {
      const q = searchQuery.toLowerCase();
      result = result.filter(
        (p) =>
          p.name.toLowerCase().includes(q) ||
          p.description?.toLowerCase().includes(q) ||
          p.customInstructions?.toLowerCase().includes(q)
      );
    }

    result.sort((a, b) => {
      // Pinned first
      if (a.pinned && !b.pinned) return -1;
      if (!a.pinned && b.pinned) return 1;

      if (sortBy === "alpha") {
        return a.name.localeCompare(b.name);
      } else if (sortBy === "created") {
        return new Date(b.createdAt) - new Date(a.createdAt);
      }
      // default: updated
      return new Date(b.updatedAt) - new Date(a.updatedAt);
    });

    return result;
  }, [projects, searchQuery, sortBy]);

  // Documents belonging to active project (or mock documents for demo)
  const projectDocuments = useMemo(() => {
    if (!activeProject) return [];
    return documents.filter((d) => d.projectId === activeProject.id);
  }, [activeProject, documents]);

  const [shareSuccessId, setShareSuccessId] = useState(null);

  const togglePin = (e, project) => {
    e.stopPropagation();
    updateProject(project.id, { pinned: !project.pinned });
    setMenuOpenId(null);
  };

  const handleDelete = (e, project) => {
    e.stopPropagation();
    deleteProject(project.id);
    if (selectedProjectId === project.id) {
      setSelectedProjectId(null);
    }
    setMenuOpenId(null);
  };

  const handleShare = (e, project) => {
    e.stopPropagation();
    const shareUrl = `${window.location.origin}?project=${project.id}`;
    if (navigator.clipboard) {
      navigator.clipboard.writeText(shareUrl).then(() => {
        setShareSuccessId(project.id);
        setTimeout(() => setShareSuccessId(null), 2500);
      }).catch(() => {});
    }
    setMenuOpenId(null);
  };

  const handleShareToRelay = (e, project) => {
    e.stopPropagation();
    setMenuOpenId(null);
    setShareToRelayProject(project);
  };

  const handleCompleteShareToRelay = ({ recipientIds, recipients, project, note }) => {
    setShareToRelayProject(null);

    // 1. Dispatch custom event with full payload for Relay to ingest immediately
    try {
      window.dispatchEvent(
        new CustomEvent("regaarder:relay-share-project", {
          detail: {
            project,
            recipientIds,
            recipients,
            note: note || ""
          }
        })
      );
    } catch (err) {}

    // 2. Navigate / launch Relay app seamlessly
    if (onLaunchApp) {
      onLaunchApp("relay", {
        shareProject: project,
        recipientId: recipientIds[0] || null,
        recipientIds,
        note: note || ""
      });
    }
  };

  const handleExport = (e, project) => {
    e.stopPropagation();
    const projectDocs = documents.filter((d) => d.projectId === project.id);
    const bundle = {
      project,
      exportedAt: new Date().toISOString(),
      documents: projectDocs,
      systemContext: {
        regaarderVersion: "1.0.0",
        memoryDirectives: project.customInstructions || ""
      }
    };
    const dataStr = "data:text/json;charset=utf-8," + encodeURIComponent(JSON.stringify(bundle, null, 2));
    const downloadAnchor = document.createElement("a");
    downloadAnchor.setAttribute("href", dataStr);
    downloadAnchor.setAttribute("download", `${project.name.toLowerCase().replace(/\s+/g, "-")}-regaarder-export.json`);
    document.body.appendChild(downloadAnchor);
    downloadAnchor.click();
    downloadAnchor.remove();
    setMenuOpenId(null);
  };

  const handleAddFilesToProject = (docIds) => {
    if (!activeProject || !Array.isArray(docIds)) return;
    docIds.forEach((docId) => {
      updateWorkspaceDocument(docId, { projectId: activeProject.id });
    });
  };

  const handleRemoveDocFromProject = (e, docId) => {
    e.stopPropagation();
    updateWorkspaceDocument(docId, { projectId: null });
  };

  // Close 3-dot menus on outside click
  React.useEffect(() => {
    const handleOutside = () => setMenuOpenId(null);
    if (menuOpenId) {
      window.addEventListener("click", handleOutside);
      return () => window.removeEventListener("click", handleOutside);
    }
  }, [menuOpenId]);

  return (
    <main className="flex-1 flex flex-col h-full bg-white dark:bg-[#151518] overflow-hidden">
      {/* Share Toast Notification */}
      {shareSuccessId && (
        <div className="fixed top-16 right-8 z-50 flex items-center gap-2 px-4 py-2.5 rounded-xl bg-slate-900 text-white text-[12.5px] font-medium shadow-lg animate-in fade-in slide-in-from-top-2 duration-200">
          <Check size={14} className="text-emerald-400" />
          <span>Project share link copied to clipboard!</span>
        </div>
      )}

      {/* 1. Header Toolbar */}
      <div className="px-10 pt-6 pb-4 border-b border-slate-200/60 dark:border-white/[0.06] flex items-center justify-between">
        <div className="flex items-center gap-3">
          {activeProject ? (
            <div className="flex items-center gap-2">
              <button
                type="button"
                onClick={() => setSelectedProjectId(null)}
                className="text-[13px] text-slate-500 hover:text-slate-900 dark:hover:text-zinc-100 font-medium transition-colors cursor-pointer border-none bg-transparent flex items-center gap-1"
              >
                Projects
              </button>
              <ChevronRight size={13} className="text-slate-400" />
              <div className="flex items-center gap-2">
                <span
                  className="w-2.5 h-2.5 rounded-full"
                  style={{ backgroundColor: activeProject.color || "#7C3AED" }}
                />
                <h1 className="text-[16px] font-semibold text-slate-900 dark:text-zinc-100">
                  {activeProject.name}
                </h1>
              </div>
            </div>
          ) : (
            <div>
              <h1 className="text-[20px] font-bold tracking-tight text-slate-900 dark:text-zinc-100">
                Projects
              </h1>
              <p className="text-[12px] text-slate-400 dark:text-zinc-400 mt-0.5">
                Organize documents, data grids, decks, notes, and AI memory into focused workspaces.
              </p>
            </div>
          )}
        </div>

        {/* Right Actions */}
        <div className="flex items-center gap-2">
          {!activeProject && (
            <div className="relative">
              <Search size={13} className="absolute left-2.5 top-1/2 -translate-y-1/2 text-slate-400 dark:text-zinc-500 pointer-events-none" />
              <input
                type="text"
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
                placeholder="Search projects..."
                className="w-48 h-8 pl-7 pr-2.5 rounded-lg border border-slate-200/80 dark:border-zinc-700/60 bg-slate-100/60 dark:bg-zinc-800/50 text-[12px] text-slate-800 dark:text-zinc-200 placeholder:text-slate-400 focus:outline-none focus:border-slate-300 dark:focus:border-zinc-600 transition-all"
              />
            </div>
          )}

          <button
            type="button"
            onClick={onOpenCreateModal}
            className="h-8 px-3 rounded-lg bg-slate-900 hover:bg-slate-800 dark:bg-zinc-100 dark:hover:bg-white text-white dark:text-slate-900 text-[12px] font-medium flex items-center gap-1.5 transition-all cursor-pointer border-none shadow-xs active:scale-98"
          >
            <Plus size={13} />
            <span>New project</span>
          </button>
        </div>
      </div>

      {/* 2. Main Content Stage with generous Apple-tier layout */}
      <div className="flex-1 overflow-y-auto px-10 py-8 custom-scrollbar">
        {activeProject ? (
          /* Active Project Detail View */
          <div className="max-w-6xl mx-auto space-y-7">
            {/* Project Context & Memory Card */}
            <div className="p-6 rounded-2xl bg-[#F8F9FB] dark:bg-zinc-900/50 border border-slate-200/70 dark:border-white/[0.06] space-y-3">
              <div className="flex items-center justify-between">
                <div className="flex items-center gap-2 text-[13.5px] font-semibold text-slate-900 dark:text-zinc-100">
                  <RegaarderAiIcon size={17} strokeWidth={1.8} className="text-[#7C3AED] dark:text-violet-400" />
                  <span>Project Memory & System Directives</span>
                </div>
                <div className="flex items-center gap-3">
                  <button
                    type="button"
                    onClick={(e) => handleShareToRelay(e, activeProject)}
                    className="flex items-center gap-1.5 text-[12px] text-[#4F46E5] hover:text-[#4338CA] dark:text-indigo-400 dark:hover:text-indigo-300 font-medium cursor-pointer border-none bg-transparent"
                    title="Share project to Relay chat"
                  >
                    <Send size={12.5} />
                    <span>Share to Relay</span>
                  </button>
                  <button
                    type="button"
                    onClick={(e) => handleShare(e, activeProject)}
                    className="flex items-center gap-1.5 text-[12px] text-slate-500 hover:text-slate-800 dark:hover:text-zinc-200 cursor-pointer border-none bg-transparent"
                  >
                    <Share2 size={13} />
                    <span>Share link</span>
                  </button>
                  <button
                    type="button"
                    onClick={(e) => handleExport(e, activeProject)}
                    className="flex items-center gap-1.5 text-[12px] text-slate-500 hover:text-slate-800 dark:hover:text-zinc-200 cursor-pointer border-none bg-transparent"
                  >
                    <Download size={13} />
                    <span>Export</span>
                  </button>
                  <span className="text-[11px] text-slate-400">
                    Updated {new Date(activeProject.updatedAt).toLocaleDateString()}
                  </span>
                </div>
              </div>
              <p className="text-[13px] text-slate-600 dark:text-zinc-300 leading-relaxed m-0">
                {activeProject.customInstructions || activeProject.description || "No custom instructions defined yet. Regaarder AI uses standard workspace conventions for files in this project."}
              </p>
            </div>

            {/* Quick Actions / Create Inside Project */}
            <div>
              <div className="text-[12px] font-semibold text-slate-400 dark:text-zinc-500 uppercase tracking-wider mb-3">
                Create In Project
              </div>
              <div className="grid grid-cols-2 sm:grid-cols-5 gap-3.5">
                {[
                  { id: "compose", label: "New Doc", desc: "Compose document" },
                  { id: "sheet", label: "New Sheet", desc: "Interactive grid" },
                  { id: "deck", label: "New Deck", desc: "Slide presentation" },
                  { id: "notes", label: "New Note", desc: "Quick notes & scratchpad" },
                  { id: "whiteboard", label: "New Whiteboard", desc: "Infinite canvas" }
                ].map((item) => (
                  <button
                    key={item.id}
                    type="button"
                    onClick={() => onLaunchApp && onLaunchApp(item.id, { projectId: activeProject.id })}
                    className="p-3.5 rounded-2xl border border-slate-200/70 dark:border-zinc-800 bg-white dark:bg-zinc-900 hover:border-slate-300 dark:hover:border-zinc-600 hover:shadow-xs transition-all text-left cursor-pointer flex items-center gap-3 group"
                  >
                    <div className="w-8 h-8 rounded-xl bg-slate-100 dark:bg-zinc-800 flex items-center justify-center group-hover:scale-105 transition-transform shrink-0">
                      <AppNativeSvgIcon type={item.id} size={18} />
                    </div>
                    <div className="min-w-0">
                      <div className="text-[12.5px] font-semibold text-slate-800 dark:text-zinc-200 truncate">
                        {item.label}
                      </div>
                      <div className="text-[11px] text-slate-400 truncate">
                        {item.desc}
                      </div>
                    </div>
                  </button>
                ))}
              </div>
            </div>

            {/* Project Documents / Artifacts */}
            <div className="pt-2">
              <div className="flex items-center justify-between mb-3">
                <div className="text-[12px] font-semibold text-slate-400 dark:text-zinc-500 uppercase tracking-wider">
                  Project Files & Artifacts ({projectDocuments.length})
                </div>
                <button
                  type="button"
                  onClick={() => setIsAddFilesModalOpen(true)}
                  className="flex items-center gap-1.5 text-[12px] font-medium text-slate-700 dark:text-zinc-200 hover:text-slate-900 dark:hover:text-white px-2.5 py-1 rounded-lg hover:bg-slate-100 dark:hover:bg-zinc-800 transition-colors cursor-pointer border-none bg-transparent"
                >
                  <Plus size={13} />
                  <span>Add existing files</span>
                </button>
              </div>

              {projectDocuments.length === 0 ? (
                <div className="py-14 border border-dashed border-slate-200 dark:border-zinc-800 rounded-2xl flex flex-col items-center justify-center text-center p-6 bg-slate-50/50 dark:bg-zinc-900/20">
                  <div className="w-11 h-11 rounded-full bg-slate-100 dark:bg-zinc-800 flex items-center justify-center text-slate-400 mb-2.5">
                    <FileText size={20} />
                  </div>
                  <p className="text-[13.5px] font-medium text-slate-700 dark:text-zinc-300">
                    No files linked to {activeProject.name} yet
                  </p>
                  <p className="text-[12px] text-slate-400 max-w-sm mt-0.5 mb-4">
                    Create a new document above, or attach existing files from your workspace.
                  </p>
                  <button
                    type="button"
                    onClick={() => setIsAddFilesModalOpen(true)}
                    className="flex items-center gap-1.5 px-3.5 py-1.5 rounded-xl bg-white dark:bg-zinc-800 hover:bg-slate-50 dark:hover:bg-zinc-700/60 text-slate-800 dark:text-zinc-200 border border-slate-200/90 dark:border-zinc-700 text-xs font-medium shadow-2xs transition-all cursor-pointer"
                  >
                    <Plus size={13} />
                    <span>Add existing files</span>
                  </button>
                </div>
              ) : (
                <div className="space-y-2.5">
                  {projectDocuments.map((doc) => (
                    <div
                      key={doc.id}
                      onClick={() => onLaunchApp && onLaunchApp(doc.mode, { documentId: doc.id })}
                      className="flex items-center justify-between p-3.5 rounded-xl border border-slate-200/60 dark:border-white/[0.06] hover:bg-slate-50 dark:hover:bg-zinc-900 transition-colors cursor-pointer group"
                    >
                      <div className="flex items-center gap-3 min-w-0">
                        <AppNativeSvgIcon type={doc.mode} size={18} />
                        <span className="text-[13px] font-medium text-slate-800 dark:text-zinc-200 truncate">
                          {doc.title || "Untitled"}
                        </span>
                      </div>
                      <div className="flex items-center gap-3 shrink-0">
                        <span className="text-[11px] text-slate-400">
                          {new Date(doc.updatedAt).toLocaleDateString()}
                        </span>
                        <button
                          type="button"
                          onClick={(e) => handleRemoveDocFromProject(e, doc.id)}
                          className="opacity-0 group-hover:opacity-100 p-1 rounded-md text-slate-400 hover:text-rose-500 hover:bg-rose-50 dark:hover:bg-rose-950/40 transition-all cursor-pointer border-none bg-transparent"
                          title="Remove from project"
                        >
                          <X size={13} />
                        </button>
                      </div>
                    </div>
                  ))}
                </div>
              )}
            </div>
          </div>
        ) : filteredProjects.length === 0 ? (
          /* Empty State (Claude Style) */
          <div className="h-[70vh] flex flex-col items-center justify-center text-center p-6">
            <div className="w-16 h-16 rounded-2xl bg-slate-100 dark:bg-zinc-800/60 border border-slate-200/80 dark:border-white/10 flex items-center justify-center text-slate-500 dark:text-zinc-400 mb-4 shadow-2xs">
              <Folder size={28} strokeWidth={1.5} />
            </div>
            <h2 className="text-[18px] font-bold text-slate-900 dark:text-zinc-100 mb-1.5">
              Looking to start a project?
            </h2>
            <p className="text-[13px] text-slate-400 dark:text-zinc-400 max-w-md mb-6 leading-relaxed">
              Upload materials, set custom AI instructions, and organize conversations, docs, and grids in one unified space.
            </p>
            <button
              type="button"
              onClick={onOpenCreateModal}
              className="h-9 px-5 rounded-xl bg-slate-900 hover:bg-slate-800 dark:bg-white dark:hover:bg-zinc-100 dark:text-zinc-900 text-white text-[13px] font-medium transition-all cursor-pointer border-none shadow-xs active:scale-98"
            >
              New project
            </button>
          </div>
        ) : (
          /* Projects Directory Grid with relaxed spacing and breathing room */
          <div className="max-w-6xl mx-auto">
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-5">
              {filteredProjects.map((proj) => {
                const docCount = documents.filter((d) => d.projectId === proj.id).length;
                return (
                  <div
                    key={proj.id}
                    onClick={() => setSelectedProjectId(proj.id)}
                    className="p-5 rounded-2xl border border-slate-200/80 dark:border-zinc-800/80 bg-white dark:bg-zinc-900/70 hover:border-slate-300 dark:hover:border-zinc-700 hover:shadow-xs transition-all cursor-pointer flex flex-col justify-between group relative min-h-[170px]"
                  >
                    <div>
                      <div className="flex items-start justify-between gap-3 mb-2.5">
                        <div className="flex items-center gap-2.5 min-w-0">
                          <span
                            className="w-2.5 h-2.5 rounded-full shrink-0"
                            style={{ backgroundColor: proj.color || "#7C3AED" }}
                          />
                          <h3 className="text-[14.5px] font-semibold text-slate-900 dark:text-zinc-100 group-hover:text-[#7C3AED] dark:group-hover:text-violet-300 transition-colors truncate">
                            {proj.name}
                          </h3>
                        </div>

                        {/* Menu Actions (3 dots) */}
                        <div className="relative shrink-0">
                          <button
                            type="button"
                            onClick={(e) => {
                              e.stopPropagation();
                              setMenuOpenId(menuOpenId === proj.id ? null : proj.id);
                            }}
                            className="w-7 h-7 flex items-center justify-center rounded-lg text-slate-400 hover:text-slate-600 dark:hover:text-zinc-200 hover:bg-slate-100 dark:hover:bg-zinc-800 border-none bg-transparent cursor-pointer opacity-0 group-hover:opacity-100 transition-opacity"
                            title="Project options"
                          >
                            <MoreHorizontal size={16} />
                          </button>

                          {menuOpenId === proj.id && (
                            <div
                              className="absolute right-0 top-8 w-44 bg-white dark:bg-zinc-850 rounded-xl shadow-xl border border-slate-200/90 dark:border-zinc-700 py-1.5 z-30 animate-in fade-in zoom-in-95 duration-100"
                              onClick={(e) => e.stopPropagation()}
                            >
                              <button
                                type="button"
                                onClick={(e) => handleShareToRelay(e, proj)}
                                className="w-full px-3.5 py-1.5 text-left text-[12px] text-[#4F46E5] dark:text-indigo-400 hover:bg-slate-50 dark:hover:bg-zinc-700/50 flex items-center gap-2.5 cursor-pointer border-none bg-transparent transition-colors font-medium"
                              >
                                <Send size={13.5} className="text-[#4F46E5] dark:text-indigo-400" />
                                <span>Share to Relay</span>
                              </button>

                              <button
                                type="button"
                                onClick={(e) => handleShare(e, proj)}
                                className="w-full px-3.5 py-1.5 text-left text-[12px] text-slate-700 dark:text-zinc-200 hover:bg-slate-50 dark:hover:bg-zinc-700/50 flex items-center gap-2.5 cursor-pointer border-none bg-transparent transition-colors"
                              >
                                <Share2 size={13.5} className="text-slate-400" />
                                <span>Share link</span>
                              </button>

                              <button
                                type="button"
                                onClick={(e) => handleExport(e, proj)}
                                className="w-full px-3.5 py-1.5 text-left text-[12px] text-slate-700 dark:text-zinc-200 hover:bg-slate-50 dark:hover:bg-zinc-700/50 flex items-center gap-2.5 cursor-pointer border-none bg-transparent transition-colors"
                              >
                                <Download size={13.5} className="text-slate-400" />
                                <span>Export / Download</span>
                              </button>

                              <button
                                type="button"
                                onClick={(e) => {
                                  e.stopPropagation();
                                  setMenuOpenId(null);
                                  setEditingProject(proj);
                                }}
                                className="w-full px-3.5 py-1.5 text-left text-[12px] text-slate-700 dark:text-zinc-200 hover:bg-slate-50 dark:hover:bg-zinc-700/50 flex items-center gap-2.5 cursor-pointer border-none bg-transparent transition-colors"
                              >
                                <Edit2 size={13.5} className="text-slate-400" />
                                <span>Edit project</span>
                              </button>

                              <div className="my-1 border-t border-slate-100 dark:border-white/[0.06]" />

                              <button
                                type="button"
                                onClick={(e) => togglePin(e, proj)}
                                className="w-full px-3.5 py-1.5 text-left text-[12px] text-slate-700 dark:text-zinc-200 hover:bg-slate-50 dark:hover:bg-zinc-700/50 flex items-center gap-2.5 cursor-pointer border-none bg-transparent transition-colors"
                              >
                                {proj.pinned ? <PinOff size={13.5} className="text-slate-400" /> : <Pin size={13.5} className="text-slate-400" />}
                                <span>{proj.pinned ? "Unpin from top" : "Pin to top"}</span>
                              </button>

                              <button
                                type="button"
                                onClick={(e) => handleDelete(e, proj)}
                                className="w-full px-3.5 py-1.5 text-left text-[12px] text-rose-600 dark:text-rose-400 hover:bg-rose-50 dark:hover:bg-rose-950/40 flex items-center gap-2.5 cursor-pointer border-none bg-transparent transition-colors"
                              >
                                <Trash2 size={13.5} />
                                <span>Delete project</span>
                              </button>
                            </div>
                          )}
                        </div>
                      </div>

                      {proj.description ? (
                        <p className="text-[12.5px] text-slate-500 dark:text-zinc-400 line-clamp-2 leading-relaxed mb-4">
                          {proj.description}
                        </p>
                      ) : (
                        <p className="text-[12px] text-slate-400 dark:text-zinc-500 italic mb-4">
                          No description provided
                        </p>
                      )}
                    </div>

                    <div className="pt-3 border-t border-slate-100 dark:border-white/[0.04] flex items-center justify-between text-[11.5px] text-slate-400 dark:text-zinc-500">
                      <span>{docCount} {docCount === 1 ? "file" : "files"}</span>
                      <span>Updated {new Date(proj.updatedAt).toLocaleDateString(undefined, { month: "short", day: "numeric" })}</span>
                    </div>
                  </div>
                );
              })}
            </div>
          </div>
        )}
      </div>

      {/* Edit Project Modal */}
      {editingProject && (
        <CreateProjectModal
          isOpen={Boolean(editingProject)}
          project={editingProject}
          onClose={() => setEditingProject(null)}
          onCreate={(updatedFields) => {
            updateProject(editingProject.id, {
              name: updatedFields.name,
              description: updatedFields.description,
              customInstructions: updatedFields.customInstructions,
              color: updatedFields.color
            });
            setEditingProject(null);
          }}
        />
      )}

      {/* Share to Relay Modal */}
      {shareToRelayProject && (
        <ShareProjectToRelayModal
          isOpen={Boolean(shareToRelayProject)}
          project={shareToRelayProject}
          onClose={() => setShareToRelayProject(null)}
          onSendShare={handleCompleteShareToRelay}
        />
      )}

      {/* Add Existing Files Modal */}
      {isAddFilesModalOpen && activeProject && (
        <AddExistingFilesToProjectModal
          isOpen={isAddFilesModalOpen}
          project={activeProject}
          allDocuments={documents}
          onClose={() => setIsAddFilesModalOpen(false)}
          onAddFiles={handleAddFilesToProject}
        />
      )}
    </main>
  );
}
