import React, { useState, useMemo, useEffect } from "react";
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
  X,
  Users,
  CheckCircle2,
  Circle,
  Flag,
  Target,
  UserPlus,
  Layers,
  ArrowRight,
  ListTodo,
  Kanban,
  GanttChartSquare,
  LayoutGrid,
  ChevronDown,
  ArrowUp,
  ArrowDown,
  AlertCircle,
  Wand2,
  RefreshCw,
  SlidersHorizontal,
  Workflow,
  MapPin
} from "lucide-react";
import { AppNativeSvgIcon } from "../home/AppNativeSvgIcon";
import { RegaarderAiIcon } from "../RegaarderProductIcons";
import { deleteProject, updateProject, DEFAULT_ROADMAP_PHASES } from "../../services/workspaceProjectStore";
import { updateWorkspaceDocument } from "../../services/workspaceDocumentStore";
import { callAiProvider, getSavedAiConfig } from "../../services/orbAiService";
import CreateProjectModal, { getProjectIconComponent } from "./CreateProjectModal";
import ShareProjectToRelayModal from "./ShareProjectToRelayModal";
import AddExistingFilesToProjectModal from "./AddExistingFilesToProjectModal";
import InviteProjectMemberModal from "./InviteProjectMemberModal";

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
  const [activeProjectTab, setActiveProjectTab] = useState("overview"); // 'overview' | 'files' | 'tasks' | 'members'
  const [menuOpenId, setMenuOpenId] = useState(null);
  const [editingProject, setEditingProject] = useState(null);
  const [shareToRelayProject, setShareToRelayProject] = useState(null);
  const [isAddFilesModalOpen, setIsAddFilesModalOpen] = useState(false);
  const [isInviteMemberModalOpen, setIsInviteMemberModalOpen] = useState(false);

  // New goal inline state
  const [newGoalText, setNewGoalText] = useState("");
  const [isAddingGoal, setIsAddingGoal] = useState(false);

  // New task inline state
  const [newTaskTitle, setNewTaskTitle] = useState("");
  const [newTaskAssignee, setNewTaskAssignee] = useState("");
  const [isAddingTask, setIsAddingTask] = useState(false);
  // Workspace tasks from localStorage
  const [workspaceTasks, setWorkspaceTasks] = useState(() => {
    try {
      const stored = localStorage.getItem("rc.workspaceTasks");
      if (stored) return JSON.parse(stored);
    } catch {}
    return [];
  });

  const saveWorkspaceTasks = (updated) => {
    setWorkspaceTasks(updated);
    try {
      localStorage.setItem("rc.workspaceTasks", JSON.stringify(updated));
    } catch {}
  };

  useEffect(() => {
    if (initialProjectId) {
      setSelectedProjectId(initialProjectId);
    }
  }, [initialProjectId]);

  // Active project if drilling down
  const activeProject = useMemo(() => {
    return projects.find((p) => p.id === selectedProjectId) || null;
  }, [projects, selectedProjectId]);

  // Project phases with fallback
  const projectPhases = useMemo(() => {
    if (!activeProject) return [];
    return Array.isArray(activeProject.phases) ? activeProject.phases : [];
  }, [activeProject]);

  // Roadmap presentation view mode ('roadmap' | 'timeline' | 'board')
  const [roadmapViewMode, setRoadmapViewMode] = useState("roadmap");
  // Phase selected for inspection/editing drawer
  const [selectedPhaseId, setSelectedPhaseId] = useState(null);
  // Add phase dropdown menu (Manual vs AI synthesis)
  const [isAddPhaseMenuOpen, setIsAddPhaseMenuOpen] = useState(false);
  // Modal states for user-owned roadmap editing
  const [isAddPhaseModalOpen, setIsAddPhaseModalOpen] = useState(false);
  const [isAiRoadmapModalOpen, setIsAiRoadmapModalOpen] = useState(false);
  const [aiRoadmapProposal, setAiRoadmapProposal] = useState(null);
  const [isGeneratingAiRoadmap, setIsGeneratingAiRoadmap] = useState(false);
  const [aiPromptInput, setAiPromptInput] = useState("");
  const [newPhaseLabel, setNewPhaseLabel] = useState("");
  const [newPhaseDesc, setNewPhaseDesc] = useState("");
  const [newPhaseStart, setNewPhaseStart] = useState("");
  const [newPhaseEnd, setNewPhaseEnd] = useState("");

  // Milestone inline draft inside drawer
  const [newMilestoneTitle, setNewMilestoneTitle] = useState("");
  const [newMilestoneDate, setNewMilestoneDate] = useState("");
  const [isAddingMilestone, setIsAddingMilestone] = useState(false);

  // Project goals with fallback
  const projectGoals = useMemo(() => {
    if (!activeProject) return [];
    return activeProject.goals || [];
  }, [activeProject]);

  // Project members with fallback
  const projectMembers = useMemo(() => {
    if (!activeProject) return [];
    if (activeProject.members && activeProject.members.length > 0) {
      return activeProject.members;
    }
    return [
      { id: "owner_1", name: "You", email: "you@regaarder.com", role: "owner", avatarColor: activeProject.color || "#7C3AED" }
    ];
  }, [activeProject]);

  // Tasks belonging to this project
  const projectTasks = useMemo(() => {
    if (!activeProject) return [];
    return workspaceTasks.filter((t) => t.projectId === activeProject.id);
  }, [workspaceTasks, activeProject]);

  // Documents belonging to active project
  const projectDocuments = useMemo(() => {
    if (!activeProject) return [];
    return documents.filter((d) => d.projectId === activeProject.id);
  }, [activeProject, documents]);

  // Filtered & sorted projects for main grid
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
      tasks: workspaceTasks.filter((t) => t.projectId === project.id),
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

  // Phase Status Progression
  const handleTogglePhaseStatus = (phaseId, e) => {
    e?.stopPropagation();
    if (!activeProject) return;
    const currentPhases = projectPhases;
    const statusCycle = {
      upcoming: "in-progress",
      "in-progress": "completed",
      completed: "upcoming"
    };
    const updated = currentPhases.map((p) => {
      if (p.id === phaseId) {
        return { ...p, status: statusCycle[p.status] || "in-progress" };
      }
      return p;
    });
    updateProject(activeProject.id, { phases: updated });
  };

  // Phase Reordering (Up/Down)
  const handleMovePhase = (idx, direction, e) => {
    e?.stopPropagation();
    if (!activeProject) return;
    const targetIdx = idx + direction;
    if (targetIdx < 0 || targetIdx >= projectPhases.length) return;
    const reordered = [...projectPhases];
    const [moved] = reordered.splice(idx, 1);
    reordered.splice(targetIdx, 0, moved);
    updateProject(activeProject.id, { phases: reordered });
  };

  // User Phase Addition
  const handleAddPhaseSubmit = (e) => {
    e?.preventDefault();
    if (!newPhaseLabel.trim() || !activeProject) return;
    const newPhase = {
      id: `phase_${Date.now()}`,
      label: newPhaseLabel.trim(),
      description: newPhaseDesc.trim() || "User defined roadmap milestone phase.",
      status: "upcoming",
      startDate: newPhaseStart || new Date().toISOString().slice(0, 10),
      endDate: newPhaseEnd || "",
      milestones: []
    };
    const updated = [...projectPhases, newPhase];
    updateProject(activeProject.id, { phases: updated });
    setNewPhaseLabel("");
    setNewPhaseDesc("");
    setNewPhaseStart("");
    setNewPhaseEnd("");
    setIsAddPhaseModalOpen(false);
  };

  // Phase Deletion
  const handleDeletePhase = (phaseId, e) => {
    e?.stopPropagation();
    if (!activeProject || projectPhases.length <= 1) return;
    const updated = projectPhases.filter((p) => p.id !== phaseId);
    updateProject(activeProject.id, { phases: updated });
    if (selectedPhaseId === phaseId) setSelectedPhaseId(null);
  };

  // Milestone Toggling in Active Phase
  const handleToggleMilestone = (phaseId, milestoneId) => {
    if (!activeProject) return;
    const updated = projectPhases.map((phase) => {
      if (phase.id === phaseId) {
        const milestones = (phase.milestones || []).map((m) => {
          if (m.id === milestoneId) return { ...m, completed: !m.completed };
          return m;
        });
        return { ...phase, milestones };
      }
      return phase;
    });
    updateProject(activeProject.id, { phases: updated });
  };

  // Add Milestone to Phase
  const handleAddMilestone = (phaseId, e) => {
    e?.preventDefault();
    if (!newMilestoneTitle.trim() || !activeProject) return;
    const newMilestone = {
      id: `m_${Date.now()}`,
      title: newMilestoneTitle.trim(),
      completed: false,
      dueDate: newMilestoneDate || ""
    };
    const updated = projectPhases.map((phase) => {
      if (phase.id === phaseId) {
        return {
          ...phase,
          milestones: [...(phase.milestones || []), newMilestone]
        };
      }
      return phase;
    });
    updateProject(activeProject.id, { phases: updated });
    setNewMilestoneTitle("");
    setNewMilestoneDate("");
    setIsAddingMilestone(false);
  };

  // Delete Milestone from Phase
  const handleDeleteMilestone = (phaseId, milestoneId) => {
    if (!activeProject) return;
    const updated = projectPhases.map((phase) => {
      if (phase.id === phaseId) {
        return {
          ...phase,
          milestones: (phase.milestones || []).filter((m) => m.id !== milestoneId)
        };
      }
      return phase;
    });
    updateProject(activeProject.id, { phases: updated });
  };

  // AI Roadmap Generation / Revision
  const handleGenerateAiRoadmap = async (customGoalPrompt = "") => {
    if (!activeProject) return;
    setIsGeneratingAiRoadmap(true);

    try {
      const aiConfig = getSavedAiConfig();
      const userGoalSection = (customGoalPrompt || aiPromptInput || "").trim();
      const prompt = `You are the Regaarder Executive Project Architect.
Propose a practical, modern 4 to 5-phase structured roadmap for this workspace project:
Project Name: "${activeProject.name}"
Description: "${activeProject.description || "General strategic workspace project"}"
Directives / Memory: "${activeProject.customInstructions || "High aesthetic quality, executive execution"}"
${userGoalSection ? `User Strategic Goals & Instructions: "${userGoalSection}"` : ""}

Return ONLY a valid JSON array of 4-5 phase objects with these exact keys:
[
  {
    "id": "phase-ai-1",
    "label": "Short Phase Title",
    "status": "in-progress",
    "startDate": "YYYY-MM-DD",
    "endDate": "YYYY-MM-DD",
    "description": "Crisp 1-sentence description of the phase deliverables",
    "milestones": [
      { "id": "m-ai-1", "title": "Milestone title", "completed": false, "dueDate": "YYYY-MM-DD" },
      { "id": "m-ai-2", "title": "Second milestone", "completed": false, "dueDate": "YYYY-MM-DD" }
    ]
  }
]`;

      const res = await callAiProvider(
        [
          { role: "system", content: "You are a professional project manager. Return ONLY valid JSON array with no extra markdown or commentary." },
          { role: "user", content: prompt }
        ],
        aiConfig
      );

      let parsedPhases = null;
      if (res && res.content) {
        try {
          const cleaned = res.content.replace(/```json/g, "").replace(/```/g, "").trim();
          parsedPhases = JSON.parse(cleaned);
        } catch (_) {}
      }

      // Intelligent fallback if provider is offline or returns invalid format
      if (!Array.isArray(parsedPhases) || parsedPhases.length === 0) {
        const today = new Date();
        const fmt = (d) => d.toISOString().slice(0, 10);
        const addDays = (d, n) => new Date(d.getTime() + n * 86400000);

        parsedPhases = [
          {
            id: `ai_p1_${Date.now()}`,
            label: "Discovery & Scope",
            status: "completed",
            startDate: fmt(today),
            endDate: fmt(addDays(today, 5)),
            description: `Audit requirements and outline foundational deliverables for ${activeProject.name}.`,
            milestones: [
              { id: `m1_${Date.now()}`, title: "Finalize core project objectives & boundaries", completed: true, dueDate: fmt(addDays(today, 2)) },
              { id: `m2_${Date.now()}`, title: "Compile preliminary design and workspace assets", completed: true, dueDate: fmt(addDays(today, 5)) }
            ]
          },
          {
            id: `ai_p2_${Date.now()}`,
            label: "Execution & Build",
            status: "in-progress",
            startDate: fmt(addDays(today, 6)),
            endDate: fmt(addDays(today, 20)),
            description: `Active sprint implementing key specifications and collaborative artifacts.`,
            milestones: [
              { id: `m3_${Date.now()}`, title: "Author primary documentation and data sheets", completed: false, dueDate: fmt(addDays(today, 12)) },
              { id: `m4_${Date.now()}`, title: "Review interactive prototypes with collaborators", completed: false, dueDate: fmt(addDays(today, 20)) }
            ]
          },
          {
            id: `ai_p3_${Date.now()}`,
            label: "Validation & QA",
            status: "upcoming",
            startDate: fmt(addDays(today, 21)),
            endDate: fmt(addDays(today, 30)),
            description: `Perform rigorous smoke testing, cross-checking, and polish.`,
            milestones: [
              { id: `m5_${Date.now()}`, title: "Execute user journey validation walkthrough", completed: false, dueDate: fmt(addDays(today, 25)) }
            ]
          },
          {
            id: `ai_p4_${Date.now()}`,
            label: "Delivery & Launch",
            status: "upcoming",
            startDate: fmt(addDays(today, 31)),
            endDate: fmt(addDays(today, 40)),
            description: `Publish final artifacts and share out to Relay team contacts.`,
            milestones: [
              { id: `m6_${Date.now()}`, title: "Share finalized project package with stakeholders", completed: false, dueDate: fmt(addDays(today, 38)) }
            ]
          }
        ];
      }

      setAiRoadmapProposal(parsedPhases);
    } catch (err) {
      console.warn("AI roadmap generation error:", err);
    } finally {
      setIsGeneratingAiRoadmap(false);
    }
  };

  const handleApplyAiRoadmapProposal = () => {
    if (!aiRoadmapProposal || !activeProject) return;
    updateProject(activeProject.id, { phases: aiRoadmapProposal });
    setAiRoadmapProposal(null);
    setIsAiRoadmapModalOpen(false);
  };

  // Goals Toggling & Creation
  const handleToggleGoal = (goalId) => {
    if (!activeProject) return;
    const updated = projectGoals.map((g) => {
      if (g.id === goalId) return { ...g, completed: !g.completed };
      return g;
    });
    updateProject(activeProject.id, { goals: updated });
  };

  const handleAddGoal = (e) => {
    e?.preventDefault();
    if (!newGoalText.trim() || !activeProject) return;
    const newGoal = {
      id: `goal_${Date.now()}`,
      text: newGoalText.trim(),
      completed: false
    };
    const updated = [...projectGoals, newGoal];
    updateProject(activeProject.id, { goals: updated });
    setNewGoalText("");
    setIsAddingGoal(false);
  };

  const handleDeleteGoal = (goalId) => {
    if (!activeProject) return;
    const updated = projectGoals.filter((g) => g.id !== goalId);
    updateProject(activeProject.id, { goals: updated });
  };

  // Member Management
  const handleInviteMember = (newMember) => {
    if (!activeProject) return;
    const current = projectMembers;
    const updated = [...current, newMember];
    updateProject(activeProject.id, { members: updated });
  };

  const handleRemoveMember = (memberId) => {
    if (!activeProject) return;
    const updated = projectMembers.filter((m) => m.id !== memberId);
    updateProject(activeProject.id, { members: updated });
  };

  // Project Tasks Management
  const handleCreateProjectTask = (e) => {
    e?.preventDefault();
    if (!newTaskTitle.trim() || !activeProject) return;
    const newTask = {
      id: `task_${Date.now()}`,
      title: newTaskTitle.trim(),
      completed: false,
      category: "project",
      priority: "medium",
      dueDate: "Upcoming",
      location: `Project / ${activeProject.name}`,
      projectId: activeProject.id,
      assignee: newTaskAssignee || "You"
    };
    saveWorkspaceTasks([newTask, ...workspaceTasks]);
    setNewTaskTitle("");
    setNewTaskAssignee("");
    setIsAddingTask(false);
  };

  const handleToggleTask = (taskId) => {
    const updated = workspaceTasks.map((t) => {
      if (t.id === taskId) return { ...t, completed: !t.completed };
      return t;
    });
    saveWorkspaceTasks(updated);
  };

  const handleDeleteTask = (taskId) => {
    const updated = workspaceTasks.filter((t) => t.id !== taskId);
    saveWorkspaceTasks(updated);
  };

  // Calculate Roadmap Progress %
  const roadmapProgressPercent = useMemo(() => {
    if (!projectPhases || projectPhases.length === 0) return 0;
    const completed = projectPhases.filter((p) => p.status === "completed").length;
    const inProgress = projectPhases.filter((p) => p.status === "in-progress").length;
    const score = (completed * 100 + inProgress * 50) / projectPhases.length;
    return Math.round(score);
  }, [projectPhases]);

  // Close 3-dot menus and dropdowns on outside click
  useEffect(() => {
    const handleOutside = () => {
      setMenuOpenId(null);
      setIsAddPhaseMenuOpen(false);
    };
    if (menuOpenId || isAddPhaseMenuOpen) {
      window.addEventListener("click", handleOutside);
      return () => window.removeEventListener("click", handleOutside);
    }
  }, [menuOpenId, isAddPhaseMenuOpen]);

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
            <div className="flex items-center gap-2.5">
              <button
                type="button"
                onClick={() => {
                  setSelectedProjectId(null);
                  setActiveProjectTab("overview");
                }}
                className="text-[13px] text-slate-500 hover:text-slate-900 dark:hover:text-zinc-100 font-medium transition-colors cursor-pointer border-none bg-transparent flex items-center gap-1"
              >
                Projects
              </button>
              <ChevronRight size={13} className="text-slate-400" />
              <div className="flex items-center gap-2">
                {(() => {
                  const ProjectIconComp = getProjectIconComponent(activeProject.icon);
                  return (
                    <ProjectIconComp
                      size={18}
                      strokeWidth={1.6}
                      style={{
                        color: activeProject.color || "#7C3AED",
                        fill: `${activeProject.color || "#7C3AED"}`,
                      }}
                      className="shrink-0"
                    />
                  );
                })()}
                <h1 className="text-[16px] font-semibold text-slate-900 dark:text-zinc-100 tracking-tight">
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
                Organize documents, milestones, tasks, team collaboration, and AI memory into focused workspaces.
              </p>
            </div>
          )}
        </div>

        {/* Right Actions */}
        <div className="flex items-center gap-2">
          {!activeProject ? (
            <>
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

              <button
                type="button"
                onClick={onOpenCreateModal}
                className="h-8 px-3 rounded-lg bg-slate-900 hover:bg-slate-800 dark:bg-zinc-100 dark:hover:bg-white text-white dark:text-slate-900 text-[12px] font-medium flex items-center gap-1.5 transition-all cursor-pointer border-none shadow-xs active:scale-98"
              >
                <Plus size={13} />
                <span>New project</span>
              </button>
            </>
          ) : (
            <div className="flex items-center gap-2">
              <button
                type="button"
                onClick={() => setIsInviteMemberModalOpen(true)}
                className="h-8 px-3 rounded-lg border border-slate-200/80 dark:border-zinc-700 bg-white dark:bg-zinc-800 text-slate-700 dark:text-zinc-200 hover:bg-slate-50 dark:hover:bg-zinc-700/60 text-[12px] font-medium flex items-center gap-1.5 transition-all cursor-pointer shadow-2xs"
              >
                <UserPlus size={13} />
                <span>Invite</span>
              </button>

              <button
                type="button"
                onClick={(e) => handleShareToRelay(e, activeProject)}
                className="h-8 px-3 rounded-lg bg-violet-50 dark:bg-violet-950/50 border border-violet-200/70 dark:border-violet-800/60 text-[#7C3AED] dark:text-violet-300 hover:bg-violet-100 text-[12px] font-medium flex items-center gap-1.5 transition-all cursor-pointer shadow-2xs"
              >
                <Send size={12} />
                <span>Share to Relay</span>
              </button>

              <button
                type="button"
                onClick={(e) => {
                  setEditingProject(activeProject);
                }}
                className="h-8 w-8 rounded-lg border border-slate-200/80 dark:border-zinc-700 bg-white dark:bg-zinc-800 text-slate-600 dark:text-zinc-300 hover:bg-slate-50 dark:hover:bg-zinc-700 flex items-center justify-center cursor-pointer transition-colors shadow-2xs"
                title="Edit project"
              >
                <Edit2 size={13} />
              </button>
            </div>
          )}
        </div>
      </div>

      {/* Project Sub-navigation Tabs (When activeProject is selected) */}
      {activeProject && (
        <div className="px-10 border-b border-slate-200/60 dark:border-white/[0.06] flex items-center justify-between bg-[#FAFAFC] dark:bg-[#18181B]/50">
          <div className="flex items-center gap-1 py-2">
            {[
              { id: "overview", label: "Overview & Roadmap", count: null },
              { id: "files", label: "Files & Artifacts", count: projectDocuments.length },
              { id: "tasks", label: "Tasks", count: projectTasks.length },
              { id: "members", label: "Members", count: projectMembers.length }
            ].map((tab) => {
              const isActive = activeProjectTab === tab.id;
              return (
                <button
                  key={tab.id}
                  type="button"
                  onClick={() => setActiveProjectTab(tab.id)}
                  className={`px-3 py-1.5 rounded-lg text-[12px] font-medium transition-all cursor-pointer border-none select-none flex items-center gap-1.5 ${
                    isActive
                      ? "bg-white dark:bg-zinc-800 text-[#7C3AED] dark:text-violet-300 shadow-2xs border border-slate-200/70 dark:border-zinc-700 font-semibold"
                      : "bg-transparent text-slate-500 dark:text-zinc-400 hover:text-slate-900 dark:hover:text-zinc-200 hover:bg-slate-100/60 dark:hover:bg-zinc-800/40"
                  }`}
                >
                  <span>{tab.label}</span>
                  {tab.count !== null && (
                    <span
                      className={`px-1.5 py-0.5 rounded text-[10.5px] font-medium transition-colors ${
                        isActive
                          ? "bg-violet-50 dark:bg-violet-950/60 text-[#7C3AED] dark:text-violet-300"
                          : "bg-slate-100 dark:bg-zinc-800 text-slate-500 dark:text-zinc-400"
                      }`}
                    >
                      {tab.count}
                    </span>
                  )}
                </button>
              );
            })}
          </div>

          <div className="flex items-center gap-3 text-[11.5px] text-slate-400 dark:text-zinc-500 py-2">
            <span>Overall Progress:</span>
            <span className="font-semibold text-slate-700 dark:text-zinc-300">
              {roadmapProgressPercent}%
            </span>
            <div className="w-16 h-1.5 rounded-full bg-slate-200 dark:bg-zinc-800 overflow-hidden">
              <div
                className="h-full rounded-full transition-all duration-300"
                style={{
                  width: `${roadmapProgressPercent}%`,
                  backgroundColor: activeProject.color || "#7C3AED"
                }}
              />
            </div>
          </div>
        </div>
      )}

      {/* 2. Main Content Stage with generous Apple-tier layout */}
      <div className="flex-1 overflow-y-auto px-10 py-8 custom-scrollbar">
        {activeProject ? (
          /* Active Project Detail View */
          <div className="max-w-6xl mx-auto space-y-7">
            {/* TAB 1: OVERVIEW & ROADMAP */}
            {activeProjectTab === "overview" && (
              <div className="space-y-7 animate-in fade-in duration-150">
                {/* Visual Roadmap & Interactive Progression */}
                <div className="p-5 sm:p-5.5 rounded-2xl bg-[#F8F9FB] dark:bg-zinc-900/50 border border-slate-200/70 dark:border-white/[0.06] space-y-2.5">
                  {/* Top Bar: Title, View Mode Switcher, and Roadmap Actions (Progressively Disclosed) */}
                  <div className="flex items-center justify-between gap-3 min-h-[26px]">
                    <div className="flex items-center gap-2">
                      <span className="text-[13px] font-semibold text-slate-800 dark:text-zinc-200 tracking-tight">
                        Roadmap
                      </span>
                      {projectPhases.length > 0 && (
                        <>
                          <span className="text-[11px] text-slate-300 dark:text-zinc-600">•</span>
                          <span className="text-[11px] font-medium text-slate-500 dark:text-zinc-400">
                            {projectPhases.filter((p) => p.status === "completed").length} of {projectPhases.length} complete
                          </span>
                        </>
                      )}
                    </div>

                    {/* View Switcher & Actions — Progressively revealed only once phases exist */}
                    {projectPhases.length > 0 && (
                      <div className="flex items-center gap-2 flex-wrap animate-in fade-in duration-150">
                        {/* Quiet Segmented View Switcher */}
                        <div className="flex items-center p-0.5 rounded-lg bg-slate-100/80 dark:bg-zinc-800/40 border border-slate-200/50 dark:border-zinc-750/40">
                          {[
                            { id: "roadmap", label: "Roadmap" },
                            { id: "timeline", label: "Timeline" },
                            { id: "board", label: "Board" }
                          ].map((mode) => {
                            const isCurrent = roadmapViewMode === mode.id;
                            return (
                              <button
                                key={mode.id}
                                type="button"
                                onClick={() => setRoadmapViewMode(mode.id)}
                                className={`h-6 px-2.5 rounded-md text-[11.5px] font-medium transition-all cursor-pointer border-none ${
                                  isCurrent
                                    ? "bg-white dark:bg-zinc-900 text-slate-900 dark:text-zinc-100 shadow-2xs font-semibold"
                                    : "bg-transparent text-slate-400 dark:text-zinc-400 hover:text-slate-700 dark:hover:text-zinc-200"
                                }`}
                              >
                                {mode.label}
                              </button>
                            );
                          })}
                        </div>

                        {/* Top-Right Add Phase Action */}
                        <div className="relative">
                          <button
                            type="button"
                            onClick={(e) => {
                              e.stopPropagation();
                              setIsAddPhaseMenuOpen((prev) => !prev);
                            }}
                            className="h-7 px-2.5 rounded-lg border border-slate-200/80 dark:border-zinc-750 bg-white dark:bg-zinc-800 hover:bg-slate-50 dark:hover:bg-zinc-700/60 text-slate-700 dark:text-zinc-200 text-[11.5px] font-medium flex items-center gap-1.5 cursor-pointer shadow-2xs transition-colors"
                            title="Add phase options"
                          >
                            <Plus size={12} />
                            <span>Add phase</span>
                            <ChevronDown size={11} className={`text-slate-400 transition-transform duration-150 ${isAddPhaseMenuOpen ? "rotate-180" : ""}`} />
                          </button>

                          {/* Dropdown Options */}
                          {isAddPhaseMenuOpen && (
                            <div
                              className="absolute right-0 top-8.5 w-60 bg-white dark:bg-zinc-850 rounded-xl shadow-xl border border-slate-200/90 dark:border-zinc-700 py-1.5 z-40 animate-in fade-in zoom-in-95 duration-100"
                              onClick={(e) => e.stopPropagation()}
                            >
                              <button
                                type="button"
                                onPointerDown={(e) => {
                                  e.preventDefault();
                                  setIsAddPhaseMenuOpen(false);
                                  setIsAddPhaseModalOpen(true);
                                }}
                                className="w-full px-3 py-2 text-left hover:bg-slate-50 dark:hover:bg-zinc-700/50 flex items-start gap-2.5 cursor-pointer border-none bg-transparent transition-colors group"
                              >
                                <div className="w-6 h-6 rounded-md bg-slate-100 dark:bg-zinc-800 flex items-center justify-center text-slate-600 dark:text-zinc-300 group-hover:bg-slate-200 dark:group-hover:bg-zinc-700 shrink-0 mt-0.5">
                                  <Plus size={13} />
                                </div>
                                <div className="min-w-0">
                                  <div className="text-[12px] font-medium text-slate-800 dark:text-zinc-200 leading-tight">
                                    Add Phase Manually
                                  </div>
                                  <div className="text-[10.5px] text-slate-400 dark:text-zinc-500 leading-normal mt-0.5">
                                    Define title, duration, and target milestones
                                  </div>
                                </div>
                              </button>

                              <div className="my-1 border-t border-slate-100 dark:border-white/[0.06]" />

                              <button
                                type="button"
                                onPointerDown={(e) => {
                                  e.preventDefault();
                                  setIsAddPhaseMenuOpen(false);
                                  setIsAiRoadmapModalOpen(true);
                                }}
                                className="w-full px-3 py-2 text-left hover:bg-violet-50/60 dark:hover:bg-violet-950/30 flex items-start gap-2.5 cursor-pointer border-none bg-transparent transition-colors group"
                              >
                                <div className="w-6 h-6 rounded-md bg-violet-100 dark:bg-violet-950/60 flex items-center justify-center text-[#7C3AED] dark:text-violet-300 group-hover:bg-violet-200 dark:group-hover:bg-violet-900/60 shrink-0 mt-0.5">
                                  <RegaarderAiIcon size={13} strokeWidth={1.7} />
                                </div>
                                <div className="min-w-0">
                                  <div className="text-[12px] font-medium text-[#7C3AED] dark:text-violet-300 flex items-center gap-1.5 leading-tight">
                                    <span>AI Planner</span>
                                  </div>
                                  <div className="text-[10.5px] text-slate-400 dark:text-zinc-500 leading-normal mt-0.5">
                                    Synthesize milestones from project goals & docs
                                  </div>
                                </div>
                              </button>
                            </div>
                          )}
                        </div>
                      </div>
                    )}
                  </div>

                  {/* VIEW 1: PROGRESSION ROADMAP */}
                  {roadmapViewMode === "roadmap" && (
                    <div className="space-y-3">
                      {projectPhases.length === 0 ? (
                        <div className="py-3.5 px-4 flex flex-col items-center justify-center text-center animate-in fade-in duration-200">
                          <div className="w-7 h-7 rounded-lg bg-slate-200/50 dark:bg-zinc-800/60 flex items-center justify-center text-slate-400/80 dark:text-zinc-500 mb-1.5">
                            <Workflow size={14} strokeWidth={1.5} />
                          </div>
                          <h3 className="text-[13px] font-semibold text-slate-800 dark:text-zinc-200 mb-0.5">
                            No roadmap planned yet
                          </h3>
                          <p className="text-[11px] text-slate-400 dark:text-zinc-500 max-w-xs mb-2.5 leading-relaxed">
                            Add phases and milestones to structure the project.
                          </p>
                          <div className="flex items-center gap-2.5">
                            <button
                              type="button"
                              onClick={() => setIsAddPhaseModalOpen(true)}
                              className="h-7 px-3 rounded-lg bg-white dark:bg-zinc-800 border border-slate-200/90 dark:border-zinc-700 hover:bg-slate-50 dark:hover:bg-zinc-750 text-slate-700 dark:text-zinc-200 text-[11px] font-medium flex items-center gap-1.5 transition-all cursor-pointer shadow-2xs"
                            >
                              <Plus size={11} />
                              <span>Add phase</span>
                            </button>
                            <span className="text-[10px] text-slate-300 dark:text-zinc-600">•</span>
                            <button
                              type="button"
                              onClick={() => setIsAiRoadmapModalOpen(true)}
                              className="text-[11px] text-slate-500 dark:text-zinc-400 hover:text-slate-800 dark:hover:text-zinc-200 flex items-center gap-1.5 cursor-pointer border-none bg-transparent transition-colors py-0.5"
                            >
                              <RegaarderAiIcon size={11} strokeWidth={1.7} className="text-slate-400 dark:text-zinc-500" />
                              <span>Plan with Regaarder AI</span>
                            </button>
                          </div>
                        </div>
                      ) : (
                        <>
                          {/* Horizontally scrollable phase flow — connected river of progression */}
                          <div className="flex items-stretch gap-0 overflow-x-auto pb-1 -mx-1 px-1" style={{ scrollbarWidth: "none" }}>
                            {projectPhases.map((phase, idx) => {
                              const isCompleted = phase.status === "completed";
                              const isInProgress = phase.status === "in-progress";
                              const isSelected = selectedPhaseId === phase.id;
                              const milestoneCount = phase.milestones ? phase.milestones.length : 0;
                              const completedMilestones = phase.milestones ? phase.milestones.filter((m) => m.completed).length : 0;
                              const prevPhase = idx > 0 ? projectPhases[idx - 1] : null;
                              const isBlocked = !isCompleted && !isInProgress && prevPhase && prevPhase.status !== "completed";
                              const isLast = idx === projectPhases.length - 1;

                              return (
                                <React.Fragment key={phase.id}>
                                  {/* Phase Card */}
                                  <div
                                    onClick={() => setSelectedPhaseId(isSelected ? null : phase.id)}
                                    className={`flex-shrink-0 w-[160px] p-3.5 rounded-xl border transition-all cursor-pointer flex flex-col justify-between min-h-[148px] group relative ${
                                      isSelected
                                        ? "bg-white dark:bg-zinc-900 ring-2 ring-[#7C3AED] dark:ring-violet-500 border-transparent shadow-xs"
                                        : isCompleted || isInProgress
                                        ? "bg-white dark:bg-zinc-900 border-slate-200/80 dark:border-zinc-800 shadow-2xs hover:border-slate-300 dark:hover:border-zinc-700"
                                        : "bg-slate-50/60 dark:bg-zinc-850/40 border-slate-200/60 dark:border-zinc-800 hover:bg-white dark:hover:bg-zinc-850 hover:border-slate-300"
                                    }`}
                                  >
                                    <div>
                                      {/* Header row: step index + status toggle */}
                                      <div className="flex items-center justify-between gap-1 mb-2.5">
                                        <div className="flex items-center gap-1.5">
                                          <span className="text-[10px] font-bold uppercase tracking-wider text-slate-400">
                                            {String(idx + 1).padStart(2, "0")}
                                          </span>
                                          {isBlocked && (
                                            <span
                                              className="w-2 h-2 rounded-full bg-amber-400 block shrink-0"
                                              title={`Blocked: Depends on Phase ${String(idx).padStart(2, "0")} (${prevPhase.label}) completion`}
                                            />
                                          )}
                                        </div>
                                        <button
                                          type="button"
                                          onClick={(e) => handleTogglePhaseStatus(phase.id, e)}
                                          className="p-1 rounded-md hover:bg-slate-100 dark:hover:bg-zinc-800 transition-colors cursor-pointer border-none bg-transparent"
                                          title="Advance phase status"
                                        >
                                          {isCompleted ? (
                                            <CheckCircle2 size={14} className="text-emerald-600 dark:text-emerald-500" />
                                          ) : isInProgress ? (
                                            <span className="w-2 h-2 rounded-full bg-[#7C3AED] dark:bg-violet-400 block" />
                                          ) : (
                                            <Circle size={13} className="text-slate-300 dark:text-zinc-600" />
                                          )}
                                        </button>
                                      </div>

                                      {/* Phase name & description */}
                                      <div className="space-y-1">
                                        <h3 className={`text-[13px] font-semibold leading-tight ${
                                          isSelected
                                            ? "text-[#7C3AED] dark:text-violet-300 font-bold"
                                            : isCompleted || isInProgress
                                            ? "text-slate-900 dark:text-zinc-100"
                                            : "text-slate-600 dark:text-zinc-400"
                                        }`}>
                                          {phase.label}
                                        </h3>
                                        {phase.description && (
                                          <p className="text-[10.5px] text-slate-400 dark:text-zinc-500 leading-relaxed line-clamp-2 m-0">
                                            {phase.description}
                                          </p>
                                        )}
                                      </div>
                                    </div>

                                    {/* Footer: milestones + reorder controls */}
                                    <div className="pt-2.5 mt-auto border-t border-slate-100 dark:border-white/[0.04] flex items-center justify-between text-[10.5px] text-slate-400">
                                      <span>
                                        {milestoneCount > 0 ? `${completedMilestones}/${milestoneCount}` : "—"}
                                      </span>
                                      <div className="flex items-center gap-0.5 opacity-0 group-hover:opacity-100 transition-opacity">
                                        {idx > 0 && (
                                          <button
                                            type="button"
                                            onClick={(e) => handleMovePhase(idx, -1, e)}
                                            className="p-0.5 text-slate-400 hover:text-slate-700 dark:hover:text-zinc-200 cursor-pointer border-none bg-transparent"
                                            title="Move earlier"
                                          >
                                            <ArrowUp size={10} />
                                          </button>
                                        )}
                                        {idx < projectPhases.length - 1 && (
                                          <button
                                            type="button"
                                            onClick={(e) => handleMovePhase(idx, 1, e)}
                                            className="p-0.5 text-slate-400 hover:text-slate-700 dark:hover:text-zinc-200 cursor-pointer border-none bg-transparent"
                                            title="Move later"
                                          >
                                            <ArrowDown size={10} />
                                          </button>
                                        )}
                                      </div>
                                    </div>
                                  </div>

                                  {/* Connector arrow between phases (not after last) */}
                                  {!isLast && (
                                    <div className="flex items-center self-center flex-shrink-0 px-1">
                                      <ChevronRight
                                        size={14}
                                        className={isCompleted ? "text-emerald-500 dark:text-emerald-400" : "text-slate-300 dark:text-zinc-700"}
                                      />
                                    </div>
                                  )}
                                </React.Fragment>
                              );
                            })}
                          </div>

                          <div className="text-[11px] text-slate-400 flex items-center justify-between px-1 pt-1">
                            <span>Click any phase to inspect milestones, deliverables, and dates.</span>
                          </div>
                        </>

                      )}
                    </div>
                  )}

                  {/* VIEW 2: TIMELINE (CHRONOLOGICAL / GANTT) */}
                  {roadmapViewMode === "timeline" && (
                    <div className="space-y-3 pt-1">
                      {projectPhases.length === 0 ? (
                        <div className="py-12 border border-dashed border-slate-200 dark:border-zinc-800 rounded-2xl flex flex-col items-center justify-center text-center p-6 bg-white/60 dark:bg-zinc-900/30">
                          <GanttChartSquare size={22} className="text-slate-400 mb-2" />
                          <p className="text-[13.5px] font-medium text-slate-700 dark:text-zinc-300">
                            No timeline milestones to display
                          </p>
                          <p className="text-[12px] text-slate-400 max-w-sm mt-0.5 mb-4">
                            Timeline tracks dates across sequential delivery phases. Add phases to build your schedule.
                          </p>
                          <button
                            type="button"
                            onClick={() => setIsAiRoadmapModalOpen(true)}
                            className="h-8 px-3.5 rounded-lg bg-slate-900 hover:bg-slate-800 dark:bg-zinc-100 dark:hover:bg-white dark:text-zinc-900 text-white text-xs font-medium flex items-center gap-1.5 transition-all cursor-pointer border-none shadow-xs"
                          >
                            <RegaarderAiIcon size={12} strokeWidth={1.8} />
                            <span>Plan with AI Planner</span>
                          </button>
                        </div>
                      ) : (
                        <div className="rounded-xl border border-slate-200/80 dark:border-zinc-800 bg-white dark:bg-zinc-900 overflow-hidden divide-y divide-slate-100 dark:divide-zinc-800/80">
                          {projectPhases.map((phase, idx) => (
                            <div
                              key={phase.id}
                              onClick={() => setSelectedPhaseId(phase.id)}
                              className="p-3 flex items-center justify-between hover:bg-slate-50/70 dark:hover:bg-zinc-850/50 cursor-pointer transition-colors"
                            >
                              <div className="flex items-center gap-3 min-w-[200px]">
                                <span className="text-[11px] font-mono text-slate-400">Phase 0{idx + 1}</span>
                                <div className="min-w-0">
                                  <div className="text-[13px] font-medium text-slate-800 dark:text-zinc-200 truncate">
                                    {phase.label}
                                  </div>
                                  <div className="text-[10.5px] text-slate-400">
                                    {phase.startDate || "TBD"} → {phase.endDate || "TBD"}
                                  </div>
                                </div>
                              </div>

                              {/* Chronological Track Bar */}
                              <div className="flex-1 max-w-md mx-6 hidden sm:block">
                                <div className="w-full h-2.5 rounded-full bg-slate-100 dark:bg-zinc-800 overflow-hidden">
                                  <div
                                    className="h-full rounded-full transition-all"
                                    style={{
                                      width: phase.status === "completed" ? "100%" : phase.status === "in-progress" ? "55%" : "10%",
                                      backgroundColor: phase.status === "completed" ? "#10B981" : phase.status === "in-progress" ? (activeProject.color || "#7C3AED") : "#94A3B8"
                                    }}
                                  />
                                </div>
                              </div>

                              <div className="flex items-center gap-2">
                                <span className={`text-[10.5px] font-medium capitalize px-2 py-0.5 rounded-md ${
                                  phase.status === "completed"
                                    ? "bg-emerald-50 dark:bg-emerald-950/60 text-emerald-600 dark:text-emerald-400"
                                    : phase.status === "in-progress"
                                    ? "bg-violet-50 dark:bg-violet-950/60 text-[#7C3AED] dark:text-violet-300"
                                    : "bg-slate-100 dark:bg-zinc-800 text-slate-500"
                                }`}>
                                  {phase.status.replace("-", " ")}
                                </span>
                              </div>
                            </div>
                          ))}
                        </div>
                      )}
                    </div>
                  )}

                  {/* VIEW 3: BOARD (KANBAN-STYLE COLUMNS) */}
                  {roadmapViewMode === "board" && (
                    <div className="space-y-3 pt-1">
                      {projectPhases.length === 0 ? (
                        <div className="py-12 border border-dashed border-slate-200 dark:border-zinc-800 rounded-2xl flex flex-col items-center justify-center text-center p-6 bg-white/60 dark:bg-zinc-900/30">
                          <Kanban size={22} className="text-slate-400 mb-2" />
                          <p className="text-[13.5px] font-medium text-slate-700 dark:text-zinc-300">
                            No phases on the board
                          </p>
                          <p className="text-[12px] text-slate-400 max-w-sm mt-0.5 mb-4">
                            Phases are organized across Completed, In Progress, and Upcoming status lanes.
                          </p>
                          <button
                            type="button"
                            onClick={() => setIsAiRoadmapModalOpen(true)}
                            className="h-8 px-3.5 rounded-lg bg-slate-900 hover:bg-slate-800 dark:bg-zinc-100 dark:hover:bg-white dark:text-zinc-900 text-white text-xs font-medium flex items-center gap-1.5 transition-all cursor-pointer border-none shadow-xs"
                          >
                            <RegaarderAiIcon size={12} strokeWidth={1.8} />
                            <span>Plan with AI Planner</span>
                          </button>
                        </div>
                      ) : (
                        <div className="grid grid-cols-1 sm:grid-cols-3 gap-3.5">
                          {[
                            { id: "completed", label: "Completed", color: "text-emerald-500" },
                            { id: "in-progress", label: "In Progress", color: "text-[#7C3AED]" },
                            { id: "upcoming", label: "Upcoming", color: "text-slate-400" }
                          ].map((col) => {
                            const colPhases = projectPhases.filter((p) => p.status === col.id);
                            return (
                              <div
                                key={col.id}
                                className="p-3.5 rounded-xl border border-slate-200/80 dark:border-zinc-800 bg-white dark:bg-zinc-900 space-y-3"
                              >
                                <div className="flex items-center justify-between pb-1 border-b border-slate-100 dark:border-white/[0.04]">
                                  <span className="text-[12px] font-semibold text-slate-700 dark:text-zinc-300 flex items-center gap-1.5">
                                    <span className={`w-2 h-2 rounded-full ${col.id === 'completed' ? 'bg-emerald-500' : col.id === 'in-progress' ? 'bg-[#7C3AED]' : 'bg-slate-400'}`} />
                                    {col.label}
                                  </span>
                                  <span className="text-[11px] font-medium text-slate-400">
                                    {colPhases.length}
                                  </span>
                                </div>

                                <div className="space-y-2">
                                  {colPhases.length === 0 ? (
                                    <div className="py-6 text-center text-[11px] text-slate-400 italic">
                                      No phases in this column
                                    </div>
                                  ) : (
                                    colPhases.map((phase) => (
                                      <div
                                        key={phase.id}
                                        onClick={() => setSelectedPhaseId(phase.id)}
                                        className="p-3 rounded-xl border border-slate-100 dark:border-zinc-800 bg-slate-50/60 dark:bg-zinc-850 hover:bg-white dark:hover:bg-zinc-800 shadow-2xs cursor-pointer transition-all space-y-1.5"
                                      >
                                        <div className="flex items-center justify-between">
                                          <span className="text-[12.5px] font-semibold text-slate-800 dark:text-zinc-200 truncate">
                                            {phase.label}
                                          </span>
                                          <button
                                            type="button"
                                            onClick={(e) => handleTogglePhaseStatus(phase.id, e)}
                                            className="text-[10px] text-slate-400 hover:text-slate-700 cursor-pointer border-none bg-transparent"
                                          >
                                            Advance
                                          </button>
                                        </div>
                                        {phase.description && (
                                          <p className="text-[11px] text-slate-400 line-clamp-2 m-0">
                                            {phase.description}
                                          </p>
                                        )}
                                        <div className="text-[10.5px] text-slate-400 pt-1">
                                          {phase.milestones?.length || 0} milestones
                                        </div>
                                      </div>
                                    ))
                                  )}
                                </div>
                              </div>
                            );
                          })}
                        </div>
                      )}
                    </div>
                  )}

                  {/* PHASE DETAIL INSPECTOR DRAWER */}
                  {selectedPhaseId && (() => {
                    const activePhase = projectPhases.find((p) => p.id === selectedPhaseId);
                    if (!activePhase) return null;
                    const milestones = activePhase.milestones || [];
                    const isCompleted = activePhase.status === "completed";
                    const isInProgress = activePhase.status === "in-progress";

                    return (
                      <div className="p-4 rounded-xl border border-slate-200 dark:border-zinc-700 bg-white dark:bg-zinc-900 shadow-xs space-y-4 animate-in fade-in duration-150">
                        <div className="flex items-start justify-between gap-3">
                          <div>
                            <div className="flex items-center gap-2">
                              <span className="text-[11px] font-bold uppercase tracking-wider text-slate-400">
                                Phase Inspector
                              </span>
                              <span className={`text-[10px] font-semibold capitalize px-2 py-0.5 rounded ${
                                isCompleted
                                  ? "bg-emerald-50 text-emerald-600 dark:bg-emerald-950/60 dark:text-emerald-400"
                                  : isInProgress
                                  ? "bg-violet-50 text-[#7C3AED] dark:bg-violet-950/60 dark:text-violet-300"
                                  : "bg-slate-100 text-slate-500"
                              }`}>
                                {activePhase.status.replace("-", " ")}
                              </span>
                            </div>
                            <h3 className="text-[15px] font-bold text-slate-900 dark:text-zinc-100 mt-0.5">
                              {activePhase.label}
                            </h3>
                            {activePhase.description && (
                              <p className="text-[12px] text-slate-500 dark:text-zinc-400 m-0 mt-0.5">
                                {activePhase.description}
                              </p>
                            )}
                          </div>

                          <div className="flex items-center gap-2">
                            <button
                              type="button"
                              onClick={(e) => handleTogglePhaseStatus(activePhase.id, e)}
                              className="h-7 px-2.5 rounded-lg border border-slate-200 dark:border-zinc-700 bg-slate-50 dark:bg-zinc-800 text-[11px] font-medium text-slate-700 dark:text-zinc-200 cursor-pointer hover:bg-slate-100"
                            >
                              Cycle Status
                            </button>
                            <button
                              type="button"
                              onClick={(e) => handleDeletePhase(activePhase.id, e)}
                              className="h-7 px-2.5 rounded-lg text-[11px] font-medium text-rose-500 hover:bg-rose-50 dark:hover:bg-rose-950/40 cursor-pointer border-none bg-transparent"
                              title="Delete phase"
                            >
                              Delete
                            </button>
                            <button
                              type="button"
                              onClick={() => setSelectedPhaseId(null)}
                              className="w-7 h-7 rounded-lg text-slate-400 hover:text-slate-600 flex items-center justify-center cursor-pointer border-none bg-transparent"
                            >
                              <X size={14} />
                            </button>
                          </div>
                        </div>

                        {/* Date Range Settings */}
                        <div className="flex items-center gap-4 text-[11.5px] text-slate-500 dark:text-zinc-400 pt-1">
                          <div className="flex items-center gap-1.5">
                            <Calendar size={13} className="text-slate-400" />
                            <span>Duration: {activePhase.startDate || "Start TBD"} to {activePhase.endDate || "End TBD"}</span>
                          </div>
                        </div>

                        {/* Milestones Checklist in this Phase */}
                        <div className="space-y-2 pt-2 border-t border-slate-100 dark:border-white/[0.04]">
                          <div className="flex items-center justify-between">
                            <span className="text-[12px] font-semibold text-slate-800 dark:text-zinc-200">
                              Phase Milestones & Deliverables ({milestones.length})
                            </span>
                            <button
                              type="button"
                              onClick={() => setIsAddingMilestone(true)}
                              className="text-[11.5px] font-medium text-slate-500 hover:text-slate-900 dark:hover:text-zinc-100 flex items-center gap-1 cursor-pointer border-none bg-transparent"
                            >
                              <Plus size={11} />
                              <span>Add milestone</span>
                            </button>
                          </div>

                          {milestones.length === 0 && !isAddingMilestone ? (
                            <div className="p-3 text-center text-[11.5px] text-slate-400 italic">
                              No milestones added to this phase yet. Add one to track concrete deliverables.
                            </div>
                          ) : (
                            <div className="space-y-1.5">
                              {milestones.map((m) => (
                                <div
                                  key={m.id}
                                  className="flex items-center justify-between p-2 rounded-lg border border-slate-100 dark:border-zinc-800 hover:bg-slate-50/60 dark:hover:bg-zinc-850 group"
                                >
                                  <div
                                    onClick={() => handleToggleMilestone(activePhase.id, m.id)}
                                    className="flex items-center gap-2.5 cursor-pointer min-w-0 flex-1"
                                  >
                                    <button
                                      type="button"
                                      className={`w-3.5 h-3.5 rounded border flex items-center justify-center transition-colors cursor-pointer border-none ${
                                        m.completed
                                          ? "bg-emerald-500 text-white"
                                          : "border-slate-300 dark:border-zinc-600 bg-white dark:bg-zinc-800 text-transparent"
                                      }`}
                                    >
                                      <Check size={10} strokeWidth={3} />
                                    </button>
                                    <span className={`text-[12px] truncate ${
                                      m.completed ? "line-through text-slate-400" : "text-slate-700 dark:text-zinc-200"
                                    }`}>
                                      {m.title}
                                    </span>
                                  </div>

                                  <div className="flex items-center gap-2">
                                    {m.dueDate && (
                                      <span className="text-[10.5px] text-slate-400">
                                        Due {m.dueDate}
                                      </span>
                                    )}
                                    <button
                                      type="button"
                                      onClick={() => handleDeleteMilestone(activePhase.id, m.id)}
                                      className="opacity-0 group-hover:opacity-100 p-1 text-slate-400 hover:text-rose-500 cursor-pointer border-none bg-transparent"
                                      title="Delete milestone"
                                    >
                                      <X size={11} />
                                    </button>
                                  </div>
                                </div>
                              ))}

                              {isAddingMilestone && (
                                <form
                                  onSubmit={(e) => handleAddMilestone(activePhase.id, e)}
                                  className="flex items-center gap-2 pt-1"
                                >
                                  <input
                                    type="text"
                                    value={newMilestoneTitle}
                                    onChange={(e) => setNewMilestoneTitle(e.target.value)}
                                    placeholder="Milestone title..."
                                    className="flex-1 h-7 px-2.5 rounded-lg border border-slate-200 dark:border-zinc-700 bg-slate-50 dark:bg-zinc-800 text-[12px] text-slate-800 dark:text-zinc-100 outline-none"
                                    autoFocus
                                  />
                                  <input
                                    type="date"
                                    value={newMilestoneDate}
                                    onChange={(e) => setNewMilestoneDate(e.target.value)}
                                    className="h-7 px-2 rounded-lg border border-slate-200 dark:border-zinc-700 bg-slate-50 dark:bg-zinc-800 text-[11px] text-slate-600 dark:text-zinc-300 outline-none"
                                  />
                                  <button
                                    type="submit"
                                    disabled={!newMilestoneTitle.trim()}
                                    className="h-7 px-3 rounded-lg bg-slate-900 text-white text-[11px] font-medium disabled:opacity-40 cursor-pointer border-none"
                                  >
                                    Add
                                  </button>
                                  <button
                                    type="button"
                                    onClick={() => {
                                      setIsAddingMilestone(false);
                                      setNewMilestoneTitle("");
                                    }}
                                    className="h-7 px-2 text-slate-400 text-[11px] cursor-pointer border-none bg-transparent"
                                  >
                                    Cancel
                                  </button>
                                </form>
                              )}
                            </div>
                          )}
                        </div>
                      </div>
                    );
                  })()}
                </div>

                {/* Grid: Project Goals & Project Memory */}
                <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
                  {/* Goals Checklist */}
                  <div className="p-6 rounded-2xl bg-white dark:bg-zinc-900 border border-slate-200/70 dark:border-white/[0.06] space-y-4 shadow-2xs">
                    <div className="flex items-center justify-between">
                      <div className="flex items-center gap-2">
                        <Target size={16} className="text-[#7C3AED] dark:text-violet-400" />
                        <h3 className="text-[14px] font-semibold text-slate-900 dark:text-zinc-100">
                          Milestone Goals
                        </h3>
                      </div>
                      <button
                        type="button"
                        onClick={() => setIsAddingGoal(true)}
                        className="text-[11.5px] font-medium text-slate-500 hover:text-slate-900 dark:hover:text-zinc-100 flex items-center gap-1 cursor-pointer border-none bg-transparent"
                      >
                        <Plus size={12} />
                        <span>Add goal</span>
                      </button>
                    </div>

                    <div className="space-y-2">
                      {projectGoals.length === 0 && !isAddingGoal ? (
                        <div className="py-4 px-3 rounded-xl border border-dashed border-slate-200 dark:border-zinc-800 text-center">
                          <p className="text-[12px] text-slate-400 dark:text-zinc-500 m-0">
                            No milestone goals defined yet.
                          </p>
                          <button
                            type="button"
                            onClick={() => setIsAddingGoal(true)}
                            className="mt-1.5 text-[11.5px] text-[#7C3AED] dark:text-violet-400 font-medium hover:underline cursor-pointer border-none bg-transparent"
                          >
                            + Add initial goal
                          </button>
                        </div>
                      ) : (
                        projectGoals.map((goal) => (
                          <div
                            key={goal.id}
                            className="flex items-center justify-between p-2.5 rounded-xl border border-slate-100 dark:border-zinc-800/80 hover:bg-slate-50/80 dark:hover:bg-zinc-800/50 transition-colors group"
                          >
                            <div
                              onClick={() => handleToggleGoal(goal.id)}
                              className="flex items-center gap-2.5 cursor-pointer min-w-0 flex-1"
                            >
                              <button
                                type="button"
                                className={`w-4 h-4 rounded-md border flex items-center justify-center transition-colors cursor-pointer border-none ${
                                  goal.completed
                                    ? "bg-emerald-500/90 text-white shadow-2xs"
                                    : "border-slate-300 dark:border-zinc-600 bg-white dark:bg-zinc-800 text-transparent"
                                }`}
                              >
                                <Check size={10} strokeWidth={2.2} />
                              </button>
                              <span className={`text-[12.5px] truncate ${
                                goal.completed
                                  ? "line-through text-slate-400 dark:text-zinc-500"
                                  : "text-slate-700 dark:text-zinc-200 font-medium"
                              }`}>
                                {goal.text}
                              </span>
                            </div>

                            <button
                              type="button"
                              onClick={() => handleDeleteGoal(goal.id)}
                              className="opacity-0 group-hover:opacity-100 p-1 text-slate-400 hover:text-rose-500 transition-opacity cursor-pointer border-none bg-transparent"
                              title="Remove goal"
                            >
                              <X size={12} />
                            </button>
                          </div>
                        ))
                      )}

                      {isAddingGoal && (
                        <form onSubmit={handleAddGoal} className="flex items-center gap-2 pt-1">
                          <input
                            type="text"
                            value={newGoalText}
                            onChange={(e) => setNewGoalText(e.target.value)}
                            placeholder="Type new milestone objective..."
                            className="flex-1 h-8 px-3 rounded-lg border border-slate-200 dark:border-zinc-700 bg-slate-50 dark:bg-zinc-800 text-[12px] text-slate-800 dark:text-zinc-100 placeholder:text-slate-400 focus:outline-none focus:border-slate-400"
                            autoFocus
                          />
                          <button
                            type="submit"
                            disabled={!newGoalText.trim()}
                            className="h-8 px-3 rounded-lg bg-slate-900 hover:bg-slate-800 text-white text-[11.5px] font-medium disabled:opacity-40 cursor-pointer border-none"
                          >
                            Add
                          </button>
                          <button
                            type="button"
                            onClick={() => {
                              setIsAddingGoal(false);
                              setNewGoalText("");
                            }}
                            className="h-8 px-2.5 text-slate-400 hover:text-slate-600 text-[11.5px] cursor-pointer border-none bg-transparent"
                          >
                            Cancel
                          </button>
                        </form>
                      )}
                    </div>
                  </div>

                  {/* Project Memory & Directives */}
                  <div className="p-6 rounded-2xl bg-white dark:bg-zinc-900 border border-slate-200/70 dark:border-white/[0.06] space-y-4 shadow-2xs flex flex-col justify-between">
                    <div className="space-y-3">
                      <div className="flex items-center justify-between">
                        <div className="flex items-center gap-2 text-[13.5px] font-semibold text-slate-900 dark:text-zinc-100">
                          <RegaarderAiIcon size={16} strokeWidth={1.8} className="text-[#7C3AED] dark:text-violet-400" />
                          <span>AI Memory Directives</span>
                        </div>
                        <button
                          type="button"
                          onClick={() => setEditingProject(activeProject)}
                          className="text-[11.5px] font-medium text-slate-400 hover:text-slate-700 dark:hover:text-zinc-200 cursor-pointer border-none bg-transparent"
                        >
                          Edit
                        </button>
                      </div>
                      <p className="text-[12px] text-slate-600 dark:text-zinc-300 leading-relaxed m-0 bg-slate-50/80 dark:bg-zinc-850/60 p-3.5 rounded-xl border border-slate-100 dark:border-white/[0.04]">
                        {activeProject.customInstructions || activeProject.description || "No custom instructions defined yet. Regaarder AI leverages standard workspace conventions for files in this project."}
                      </p>
                    </div>

                    <div className="pt-3 border-t border-slate-100 dark:border-zinc-800 flex items-center justify-between text-[11.5px] text-slate-400">
                      <span>Collaborators: {projectMembers.length}</span>
                      <span>Updated {new Date(activeProject.updatedAt).toLocaleDateString(undefined, { month: "short", day: "numeric" })}</span>
                    </div>
                  </div>
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
              </div>
            )}

            {/* TAB 2: FILES & ARTIFACTS */}
            {activeProjectTab === "files" && (
              <div className="space-y-5 animate-in fade-in duration-150">
                <div className="flex items-center justify-between">
                  <div className="text-[12px] font-semibold text-slate-400 dark:text-zinc-500 uppercase tracking-wider">
                    Project Files ({projectDocuments.length})
                  </div>
                  <div className="flex items-center gap-2">
                    <button
                      type="button"
                      onClick={() => setIsAddFilesModalOpen(true)}
                      className="flex items-center gap-1.5 text-[12px] font-medium text-slate-700 dark:text-zinc-200 hover:text-slate-900 dark:hover:text-white px-2.5 py-1 rounded-lg hover:bg-slate-100 dark:hover:bg-zinc-800 transition-colors cursor-pointer border-none bg-transparent"
                    >
                      <Plus size={13} />
                      <span>Add existing files</span>
                    </button>
                  </div>
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
                      Create documents or link existing workspace artifacts directly into this project.
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
                  <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                    {projectDocuments.map((doc) => (
                      <div
                        key={doc.id}
                        onClick={() => onLaunchApp && onLaunchApp(doc.mode, { documentId: doc.id })}
                        className="flex items-center justify-between p-3.5 rounded-xl border border-slate-200/70 dark:border-white/[0.06] bg-white dark:bg-zinc-900 hover:border-slate-300 dark:hover:border-zinc-700 transition-all cursor-pointer group shadow-2xs"
                      >
                        <div className="flex items-center gap-3 min-w-0">
                          <div className="w-8 h-8 rounded-lg bg-slate-100 dark:bg-zinc-800 flex items-center justify-center shrink-0">
                            <AppNativeSvgIcon type={doc.mode} size={17} />
                          </div>
                          <div className="min-w-0">
                            <span className="text-[13px] font-semibold text-slate-800 dark:text-zinc-200 truncate block">
                              {doc.title || "Untitled"}
                            </span>
                            <span className="text-[11px] text-slate-400 capitalize">
                              {doc.mode || "document"} • {new Date(doc.updatedAt || Date.now()).toLocaleDateString()}
                            </span>
                          </div>
                        </div>

                        <button
                          type="button"
                          onClick={(e) => handleRemoveDocFromProject(e, doc.id)}
                          className="opacity-0 group-hover:opacity-100 p-1.5 rounded-md text-slate-400 hover:text-rose-500 hover:bg-rose-50 dark:hover:bg-rose-950/40 transition-all cursor-pointer border-none bg-transparent"
                          title="Remove from project"
                        >
                          <X size={13} />
                        </button>
                      </div>
                    ))}
                  </div>
                )}
              </div>
            )}

            {/* TAB 3: TASKS */}
            {activeProjectTab === "tasks" && (
              <div className="space-y-5 animate-in fade-in duration-150">
                <div className="flex items-center justify-between">
                  <div>
                    <h3 className="text-[14px] font-semibold text-slate-900 dark:text-zinc-100">
                      Project Tasks ({projectTasks.length})
                    </h3>
                    <p className="text-[11.5px] text-slate-400 mt-0.5">
                      Assign and track work specific to {activeProject.name}.
                    </p>
                  </div>
                  <button
                    type="button"
                    onClick={() => setIsAddingTask(true)}
                    className="h-8 px-3 rounded-lg bg-slate-900 hover:bg-slate-800 dark:bg-zinc-100 dark:hover:bg-white text-white dark:text-slate-900 text-[12px] font-medium flex items-center gap-1.5 transition-all cursor-pointer border-none shadow-xs"
                  >
                    <Plus size={13} />
                    <span>New task</span>
                  </button>
                </div>

                {isAddingTask && (
                  <form onSubmit={handleCreateProjectTask} className="p-4 rounded-xl border border-slate-200 dark:border-zinc-700 bg-slate-50 dark:bg-zinc-900 space-y-3">
                    <input
                      type="text"
                      value={newTaskTitle}
                      onChange={(e) => setNewTaskTitle(e.target.value)}
                      placeholder="What needs to be done?"
                      className="w-full h-9 px-3 rounded-lg border border-slate-200 dark:border-zinc-700 bg-white dark:bg-zinc-800 text-xs text-slate-800 dark:text-zinc-100 focus:outline-none focus:border-slate-400"
                      autoFocus
                    />
                    <div className="flex items-center justify-between gap-2">
                      <select
                        value={newTaskAssignee}
                        onChange={(e) => setNewTaskAssignee(e.target.value)}
                        className="h-8 px-2.5 rounded-lg border border-slate-200 dark:border-zinc-700 bg-white dark:bg-zinc-800 text-xs text-slate-700 dark:text-zinc-300 outline-none"
                      >
                        <option value="">Assign to member...</option>
                        {projectMembers.map((m) => (
                          <option key={m.id} value={m.name}>{m.name}</option>
                        ))}
                      </select>

                      <div className="flex items-center gap-2">
                        <button
                          type="button"
                          onClick={() => setIsAddingTask(false)}
                          className="h-8 px-3 text-xs text-slate-500 hover:text-slate-800 cursor-pointer border-none bg-transparent"
                        >
                          Cancel
                        </button>
                        <button
                          type="submit"
                          disabled={!newTaskTitle.trim()}
                          className="h-8 px-3.5 rounded-lg bg-slate-900 hover:bg-slate-800 text-white text-xs font-semibold disabled:opacity-40 cursor-pointer border-none"
                        >
                          Create task
                        </button>
                      </div>
                    </div>
                  </form>
                )}

                {projectTasks.length === 0 ? (
                  <div className="py-12 border border-dashed border-slate-200 dark:border-zinc-800 rounded-2xl flex flex-col items-center justify-center text-center p-6 bg-slate-50/50 dark:bg-zinc-900/20">
                    <ListTodo size={24} className="text-slate-400 mb-2" />
                    <p className="text-[13.5px] font-medium text-slate-700 dark:text-zinc-300">
                      No tasks created for this project yet
                    </p>
                    <p className="text-[11.5px] text-slate-400 mt-0.5">
                      Create a task to assign action items to teammates.
                    </p>
                  </div>
                ) : (
                  <div className="space-y-2">
                    {projectTasks.map((t) => (
                      <div
                        key={t.id}
                        className="flex items-center justify-between p-3 rounded-xl border border-slate-200/70 dark:border-zinc-800 bg-white dark:bg-zinc-900 shadow-2xs group"
                      >
                        <div className="flex items-center gap-3 min-w-0 flex-1">
                          <button
                            type="button"
                            onClick={() => handleToggleTask(t.id)}
                            className={`w-4 h-4 rounded-md border flex items-center justify-center transition-colors cursor-pointer border-none ${
                              t.completed
                                ? "bg-emerald-500 text-white"
                                : "border-slate-300 dark:border-zinc-600 bg-white dark:bg-zinc-800 text-transparent"
                            }`}
                          >
                            <Check size={11} strokeWidth={3} />
                          </button>
                          <span className={`text-xs font-medium truncate ${
                            t.completed ? "line-through text-slate-400" : "text-slate-800 dark:text-zinc-200"
                          }`}>
                            {t.title}
                          </span>
                        </div>

                        <div className="flex items-center gap-3 shrink-0">
                          {t.assignee && (
                            <span className="text-[10.5px] font-medium px-2 py-0.5 rounded-full bg-slate-100 dark:bg-zinc-800 text-slate-600 dark:text-zinc-300">
                              {t.assignee}
                            </span>
                          )}
                          <button
                            type="button"
                            onClick={() => handleDeleteTask(t.id)}
                            className="opacity-0 group-hover:opacity-100 p-1 text-slate-400 hover:text-rose-500 transition-opacity cursor-pointer border-none bg-transparent"
                          >
                            <Trash2 size={13} />
                          </button>
                        </div>
                      </div>
                    ))}
                  </div>
                )}
              </div>
            )}

            {/* TAB 4: MEMBERS */}
            {activeProjectTab === "members" && (
              <div className="space-y-5 animate-in fade-in duration-150">
                <div className="flex items-center justify-between">
                  <div>
                    <h3 className="text-[14px] font-semibold text-slate-900 dark:text-zinc-100">
                      Project Members & Permissions
                    </h3>
                    <p className="text-[11.5px] text-slate-400 mt-0.5">
                      Collaborators with access to this project workspace.
                    </p>
                  </div>
                  <button
                    type="button"
                    onClick={() => setIsInviteMemberModalOpen(true)}
                    className="h-8 px-3 rounded-lg bg-slate-900 hover:bg-slate-800 dark:bg-zinc-100 dark:hover:bg-white text-white dark:text-slate-900 text-[12px] font-medium flex items-center gap-1.5 transition-all cursor-pointer border-none shadow-xs"
                  >
                    <UserPlus size={13} />
                    <span>Invite member</span>
                  </button>
                </div>

                {projectMembers.length === 0 ? (
                  <div className="py-12 border border-dashed border-slate-200 dark:border-zinc-800 rounded-2xl flex flex-col items-center justify-center text-center p-6 bg-slate-50/50 dark:bg-zinc-900/20">
                    <Users size={24} className="text-slate-400 mb-2" />
                    <p className="text-[13.5px] font-medium text-slate-700 dark:text-zinc-300">
                      No members assigned to this project yet
                    </p>
                    <p className="text-[11.5px] text-slate-400 max-w-sm mt-0.5 mb-4">
                      Invite team members to collaborate on tasks, roadmaps, and documents.
                    </p>
                    <button
                      type="button"
                      onClick={() => setIsInviteMemberModalOpen(true)}
                      className="h-8 px-3.5 rounded-lg bg-slate-900 hover:bg-slate-800 dark:bg-zinc-100 dark:hover:bg-white text-white dark:text-slate-900 text-[12px] font-medium flex items-center gap-1.5 transition-all cursor-pointer border-none shadow-xs"
                    >
                      <UserPlus size={13} />
                      <span>Invite first member</span>
                    </button>
                  </div>
                ) : (
                  <div className="rounded-2xl border border-slate-200/70 dark:border-white/[0.06] bg-white dark:bg-zinc-900 overflow-hidden divide-y divide-slate-100 dark:divide-zinc-800 shadow-2xs">
                    {projectMembers.map((m) => (
                      <div key={m.id} className="p-3.5 flex items-center justify-between">
                        <div className="flex items-center gap-3 min-w-0">
                          <span
                            className="w-8 h-8 rounded-full flex items-center justify-center font-bold text-xs text-white shrink-0"
                            style={{ backgroundColor: m.avatarColor || activeProject.color || "#7C3AED" }}
                          >
                            {(m.name || "U").slice(0, 1).toUpperCase()}
                          </span>
                          <div className="min-w-0">
                            <div className="text-[13px] font-semibold text-slate-800 dark:text-zinc-200 truncate">
                              {m.name}
                            </div>
                            <div className="text-[11px] text-slate-400 truncate">
                              {m.email || "Workspace User"}
                            </div>
                          </div>
                        </div>

                        <div className="flex items-center gap-3 shrink-0">
                          <span className={`text-[11px] font-semibold capitalize px-2 py-0.5 rounded-lg ${
                            m.role === "owner"
                              ? "bg-violet-100 dark:bg-violet-950/60 text-[#7C3AED] dark:text-violet-300"
                              : m.role === "editor"
                              ? "bg-slate-100 dark:bg-zinc-800 text-slate-700 dark:text-zinc-300"
                              : "bg-slate-50 dark:bg-zinc-850 text-slate-500"
                          }`}>
                            {m.role}
                          </span>

                          {m.role !== "owner" && (
                            <button
                              type="button"
                              onClick={() => handleRemoveMember(m.id)}
                              className="p-1 text-slate-400 hover:text-rose-500 transition-colors cursor-pointer border-none bg-transparent"
                              title="Remove member"
                            >
                              <X size={13} />
                            </button>
                          )}
                        </div>
                      </div>
                    ))}
                  </div>
                )}
              </div>
            )}
          </div>
        ) : filteredProjects.length === 0 ? (
          /* Empty State */
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
          /* Projects Directory Grid with refined identity glyphs */
          <div className="max-w-6xl mx-auto">
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-5">
              {filteredProjects.map((proj) => {
                const docCount = documents.filter((d) => d.projectId === proj.id).length;
                const Glyph = getProjectIconComponent(proj.icon);
                const phases = proj.phases || DEFAULT_ROADMAP_PHASES;
                const activePhase = phases.find((p) => p.status === "in-progress") || phases[0];
                const members = proj.members || [{ name: "You" }];

                return (
                  <div
                    key={proj.id}
                    onClick={() => {
                      setSelectedProjectId(proj.id);
                      setActiveProjectTab("overview");
                    }}
                    className="p-5 rounded-2xl border border-slate-200/80 dark:border-zinc-800/80 bg-white dark:bg-zinc-900/70 hover:border-slate-300 dark:hover:border-zinc-700 hover:shadow-xs transition-all cursor-pointer flex flex-col justify-between group relative min-h-[175px]"
                  >
                    <div>
                      <div className="flex items-start justify-between gap-3 mb-3">
                        <div className="flex items-center gap-3 min-w-0">
                          {/* Restrained Purple Outline Folder Icon */}
                          <div className="w-7 h-7 flex items-center justify-center shrink-0">
                            <Folder
                              size={24}
                              strokeWidth={1.8}
                              className="text-[#7C3AED] dark:text-violet-400 group-hover:scale-105 transition-transform"
                            />
                          </div>
                          <div className="min-w-0">
                            <h3 className="text-[14.5px] font-semibold text-slate-900 dark:text-zinc-100 group-hover:text-[#7C3AED] dark:group-hover:text-violet-300 transition-colors truncate">
                              {proj.name}
                            </h3>
                            <div className="text-[11px] text-slate-400 flex items-center gap-1.5 mt-0.5">
                              <span className={`w-1.5 h-1.5 rounded-full ${
                                activePhase?.status === "completed"
                                  ? "bg-emerald-500"
                                  : activePhase?.status === "in-progress"
                                  ? "bg-[#7C3AED] dark:bg-violet-400"
                                  : "bg-slate-300 dark:bg-zinc-600"
                              }`} />
                              <span>{activePhase?.label || "Discovery"}</span>
                            </div>
                          </div>
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
                      <div className="flex items-center gap-2">
                        <span>{docCount} {docCount === 1 ? "file" : "files"}</span>
                        <span>•</span>
                        <span>{members.length} {members.length === 1 ? "member" : "members"}</span>
                      </div>
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
              color: updatedFields.color,
              icon: updatedFields.icon
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

      {/* Invite Member Modal */}
      {isInviteMemberModalOpen && activeProject && (
        <InviteProjectMemberModal
          isOpen={isInviteMemberModalOpen}
          project={activeProject}
          existingMembers={projectMembers}
          onClose={() => setIsInviteMemberModalOpen(false)}
          onInviteMember={handleInviteMember}
        />
      )}

      {/* Add Phase Modal (User-Owned) */}
      {isAddPhaseModalOpen && (
        <div
          className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/40 backdrop-blur-xs animate-in fade-in duration-150"
          onClick={() => setIsAddPhaseModalOpen(false)}
        >
          <div
            role="dialog"
            aria-modal="true"
            className="w-full max-w-[440px] bg-white dark:bg-[#1C1C1F] rounded-2xl shadow-2xl border border-slate-200/80 dark:border-white/10 overflow-hidden flex flex-col p-6 space-y-4"
            onClick={(e) => e.stopPropagation()}
          >
            <div className="flex items-center justify-between">
              <h3 className="text-[16px] font-semibold text-slate-900 dark:text-zinc-100">
                Add Roadmap Phase
              </h3>
              <button
                type="button"
                onClick={() => setIsAddPhaseModalOpen(false)}
                className="w-7 h-7 flex items-center justify-center rounded-lg text-slate-400 hover:text-slate-600 dark:hover:text-zinc-200 cursor-pointer border-none bg-transparent"
              >
                <X size={15} />
              </button>
            </div>

            <form onSubmit={handleAddPhaseSubmit} className="space-y-3.5">
              <div className="space-y-1">
                <label className="text-[12px] font-medium text-slate-700 dark:text-zinc-300">
                  Phase Title
                </label>
                <input
                  type="text"
                  value={newPhaseLabel}
                  onChange={(e) => setNewPhaseLabel(e.target.value)}
                  placeholder="e.g. Architecture & API Specs"
                  className="w-full h-9 px-3 rounded-xl border border-slate-200 dark:border-zinc-700 bg-slate-50/50 dark:bg-zinc-850 text-xs text-slate-900 dark:text-zinc-100 outline-none focus:border-slate-400"
                  autoFocus
                  required
                />
              </div>

              <div className="space-y-1">
                <label className="text-[12px] font-medium text-slate-700 dark:text-zinc-300">
                  Description
                </label>
                <input
                  type="text"
                  value={newPhaseDesc}
                  onChange={(e) => setNewPhaseDesc(e.target.value)}
                  placeholder="Key deliverables or outcomes for this phase..."
                  className="w-full h-9 px-3 rounded-xl border border-slate-200 dark:border-zinc-700 bg-slate-50/50 dark:bg-zinc-850 text-xs text-slate-900 dark:text-zinc-100 outline-none focus:border-slate-400"
                />
              </div>

              <div className="grid grid-cols-2 gap-2.5">
                <div className="space-y-1">
                  <label className="text-[11.5px] font-medium text-slate-600 dark:text-zinc-400">
                    Start Date
                  </label>
                  <input
                    type="date"
                    value={newPhaseStart}
                    onChange={(e) => setNewPhaseStart(e.target.value)}
                    className="w-full h-8 px-2.5 rounded-lg border border-slate-200 dark:border-zinc-700 bg-slate-50/50 dark:bg-zinc-850 text-xs text-slate-700 dark:text-zinc-300 outline-none"
                  />
                </div>
                <div className="space-y-1">
                  <label className="text-[11.5px] font-medium text-slate-600 dark:text-zinc-400">
                    Target End Date
                  </label>
                  <input
                    type="date"
                    value={newPhaseEnd}
                    onChange={(e) => setNewPhaseEnd(e.target.value)}
                    className="w-full h-8 px-2.5 rounded-lg border border-slate-200 dark:border-zinc-700 bg-slate-50/50 dark:bg-zinc-850 text-xs text-slate-700 dark:text-zinc-300 outline-none"
                  />
                </div>
              </div>

              <div className="pt-2 flex items-center justify-end gap-2">
                <button
                  type="button"
                  onClick={() => setIsAddPhaseModalOpen(false)}
                  className="px-3.5 h-8 rounded-lg text-xs font-medium text-slate-500 hover:text-slate-800 cursor-pointer border-none bg-transparent"
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  disabled={!newPhaseLabel.trim()}
                  className="px-4 h-8 rounded-lg bg-slate-900 hover:bg-slate-800 text-white text-xs font-semibold disabled:opacity-40 cursor-pointer border-none"
                >
                  Create Phase
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

      {/* AI Roadmap Proposal Modal (Preview Before Applying) */}
      {isAiRoadmapModalOpen && (
        <div
          className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/40 backdrop-blur-xs animate-in fade-in duration-150"
          onClick={() => setIsAiRoadmapModalOpen(false)}
        >
          <div
            role="dialog"
            aria-modal="true"
            className="w-full max-w-[580px] bg-white dark:bg-[#1C1C1F] rounded-2xl shadow-2xl border border-slate-200/80 dark:border-white/10 overflow-hidden flex flex-col p-6 space-y-5"
            onClick={(e) => e.stopPropagation()}
          >
            {/* Modal Header */}
            <div className="flex items-center justify-between">
              <div className="flex items-center gap-2">
                <RegaarderAiIcon size={18} strokeWidth={1.8} className="text-[#7C3AED] dark:text-violet-400" />
                <h3 className="text-[16px] font-semibold text-slate-900 dark:text-zinc-100 tracking-tight">
                  AI Planner
                </h3>
              </div>
              <button
                type="button"
                onClick={() => setIsAiRoadmapModalOpen(false)}
                className="w-7 h-7 flex items-center justify-center rounded-lg text-slate-400 hover:text-slate-600 dark:hover:text-zinc-200 cursor-pointer border-none bg-transparent transition-colors"
              >
                <X size={15} />
              </button>
            </div>

            {/* Step 1: Input & Context Prompt (Progressive Disclosure) */}
            <div className="space-y-2">
              <label className="text-[12px] font-medium text-slate-700 dark:text-zinc-300 block">
                What do you want to achieve with <span className="font-semibold text-slate-900 dark:text-zinc-100">{activeProject.name}</span>?
              </label>
              <div className="relative">
                <textarea
                  value={aiPromptInput}
                  onChange={(e) => setAiPromptInput(e.target.value)}
                  placeholder="Describe your primary goals, timeline constraints, or target deliverables..."
                  rows={3}
                  className="w-full p-3 rounded-xl border border-slate-200 dark:border-zinc-700 bg-slate-50/60 dark:bg-zinc-850/60 text-xs text-slate-900 dark:text-zinc-100 outline-none focus:border-slate-400 dark:focus:border-zinc-500 placeholder:text-slate-400 resize-none transition-colors leading-relaxed"
                />
              </div>
              {/* Quick Prompt Starters */}
              <div className="flex items-center gap-1.5 flex-wrap pt-0.5">
                {[
                  "4-week MVP launch",
                  "Iterative design & user feedback",
                  "Production hardening & security"
                ].map((tag) => (
                  <button
                    key={tag}
                    type="button"
                    onClick={() => setAiPromptInput(tag)}
                    className="px-2.5 py-1 rounded-md text-[11px] font-normal text-slate-500 hover:text-slate-800 dark:text-zinc-400 dark:hover:text-zinc-200 bg-slate-100/70 hover:bg-slate-200/70 dark:bg-zinc-800/60 dark:hover:bg-zinc-750 transition-colors cursor-pointer border-none"
                  >
                    + {tag}
                  </button>
                ))}
              </div>
            </div>

            {/* Step 2 & 3: Loading or Generated Proposal Preview */}
            {isGeneratingAiRoadmap ? (
              <div className="py-10 flex flex-col items-center justify-center text-center space-y-2.5 bg-slate-50/50 dark:bg-zinc-850/30 rounded-xl border border-slate-100 dark:border-zinc-800">
                <RefreshCw size={22} className="text-[#7C3AED] animate-spin" />
                <span className="text-[12.5px] font-medium text-slate-700 dark:text-zinc-300">
                  Synthesizing phased execution plan...
                </span>
                <span className="text-[11px] text-slate-400 max-w-xs">
                  Analyzing project directives, scope boundaries, and milestones
                </span>
              </div>
            ) : aiRoadmapProposal ? (
              <div className="space-y-2">
                <div className="flex items-center justify-between text-[11px] font-medium text-slate-400">
                  <span>Proposed Phased Roadmap ({aiRoadmapProposal.length} phases)</span>
                  <button
                    type="button"
                    onClick={() => handleGenerateAiRoadmap(aiPromptInput)}
                    className="text-[#7C3AED] dark:text-violet-400 hover:underline flex items-center gap-1 cursor-pointer border-none bg-transparent font-medium"
                  >
                    <RefreshCw size={11} />
                    <span>Regenerate</span>
                  </button>
                </div>
                <div className="space-y-2 max-h-[260px] overflow-y-auto pr-1 custom-scrollbar">
                  {aiRoadmapProposal.map((phase, idx) => (
                    <div
                      key={phase.id || idx}
                      className="p-3 rounded-xl border border-slate-200/80 dark:border-zinc-800 bg-slate-50/60 dark:bg-zinc-850/60 space-y-1"
                    >
                      <div className="flex items-center justify-between">
                        <span className="text-[12.5px] font-semibold text-slate-800 dark:text-zinc-200 flex items-center gap-1.5">
                          <span className="text-[10px] font-mono font-bold text-slate-400">0{idx + 1}</span>
                          <span>{phase.label}</span>
                        </span>
                        <span className="text-[10.5px] text-slate-400 capitalize">
                          {phase.status || "upcoming"}
                        </span>
                      </div>
                      {phase.description && (
                        <p className="text-[11px] text-slate-500 dark:text-zinc-400 m-0 leading-normal">
                          {phase.description}
                        </p>
                      )}
                      {phase.milestones && phase.milestones.length > 0 && (
                        <div className="pt-1 text-[10.5px] text-slate-400 truncate">
                          <span className="font-medium text-slate-500 dark:text-zinc-400">Milestones: </span>
                          {phase.milestones.map((m) => m.title).join(" • ")}
                        </div>
                      )}
                    </div>
                  ))}
                </div>
              </div>
            ) : null}

            {/* Modal Actions Footer */}
            <div className="pt-2 flex items-center justify-between border-t border-slate-100 dark:border-white/[0.04]">
              <button
                type="button"
                onClick={() => setIsAiRoadmapModalOpen(false)}
                className="px-3 h-8 rounded-lg text-xs font-medium text-slate-500 hover:text-slate-800 dark:text-zinc-400 dark:hover:text-zinc-200 cursor-pointer border-none bg-transparent transition-colors"
              >
                Cancel
              </button>

              <div className="flex items-center gap-2">
                {!aiRoadmapProposal ? (
                  <button
                    type="button"
                    disabled={isGeneratingAiRoadmap}
                    onClick={() => handleGenerateAiRoadmap(aiPromptInput)}
                    className="px-4 h-8 rounded-lg bg-slate-900 hover:bg-slate-800 dark:bg-zinc-100 dark:hover:bg-white dark:text-zinc-900 text-white text-xs font-semibold flex items-center gap-1.5 cursor-pointer border-none shadow-xs disabled:opacity-40 transition-all"
                  >
                    <RegaarderAiIcon size={13} strokeWidth={1.8} className="text-[#7C3AED] dark:text-violet-500" />
                    <span>Generate Roadmap</span>
                  </button>
                ) : (
                  <button
                    type="button"
                    disabled={isGeneratingAiRoadmap}
                    onClick={handleApplyAiRoadmapProposal}
                    className="px-4 h-8 rounded-lg bg-[#7C3AED] hover:bg-violet-700 text-white text-xs font-semibold flex items-center gap-1.5 cursor-pointer border-none shadow-xs disabled:opacity-40 transition-all"
                  >
                    <span>Apply Roadmap</span>
                  </button>
                )}
              </div>
            </div>
          </div>
        </div>
      )}
    </main>
  );
}
