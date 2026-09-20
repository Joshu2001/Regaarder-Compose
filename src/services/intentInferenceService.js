/**
 * intentInferenceService.js
 * 
 * Regaarder Intent Inference Engine
 * Implements: Intent -> Regaarder infers capability -> Prepares workspace -> First outcome delivered.
 * 
 * Interprets natural language user queries and outcome selections, mapping them directly
 * to concrete project templates, task matrices, research queries, or canvas creation.
 */

import { createProject } from './workspaceProjectStore';
import { updateWorkspaceDocument, readWorkspaceDocuments } from './workspaceDocumentStore';

/**
 * Outcome category definitions for the redesigned first onboarding screen
 */
export const OUTCOME_PATHS = [
  {
    id: 'create',
    title: 'Create something',
    description: 'Write an executive doc, calculate data models, design slides, or draw on a canvas.',
    badge: 'Draft & Build',
    iconName: 'ComposeIcon',
    color: 'text-violet-600 dark:text-violet-400 bg-violet-50 dark:bg-violet-950/50 border-violet-200/60 dark:border-violet-800/40'
  },
  {
    id: 'organize',
    title: 'Make sense of my information',
    description: 'Bring together existing files, notes, and research into a searchable, connected memory bank.',
    badge: 'Connect Knowledge',
    iconName: 'FolderGit2',
    color: 'text-emerald-600 dark:text-emerald-400 bg-emerald-50 dark:bg-emerald-950/50 border-emerald-200/60 dark:border-emerald-800/40'
  },
  {
    id: 'plan',
    title: 'Plan and execute a project',
    description: 'Organize deliverables, track milestones, align team calendars, and deliver on schedule.',
    badge: 'Milestones & Tasks',
    iconName: 'CheckSquare',
    color: 'text-indigo-600 dark:text-indigo-400 bg-indigo-50 dark:bg-indigo-950/50 border-indigo-200/60 dark:border-indigo-800/40'
  },
  {
    id: 'research',
    title: 'Research or decide',
    description: 'Investigate a topic, audit competitors, compare alternatives, and synthesize answers with AI.',
    badge: 'Investigate & Decide',
    iconName: 'Search',
    color: 'text-sky-600 dark:text-sky-400 bg-sky-50 dark:bg-sky-950/50 border-sky-200/60 dark:border-sky-800/40'
  },
  {
    id: 'collaborate',
    title: 'Meet or collaborate',
    description: 'Work with your team through spatial video rooms, live shared canvases, or team channels.',
    badge: 'Live Collaboration',
    iconName: 'RoomIcon',
    color: 'text-rose-600 dark:text-rose-400 bg-rose-50 dark:bg-rose-950/50 border-rose-200/60 dark:border-rose-800/40'
  }
];

/**
 * Infer intent and destination payload from free-form natural language query
 * @param {string} text - User's stated goal in their own words
 * @returns {object} Action payload for AppCore to prepare and launch
 */
export function inferWorkflowFromText(text = '') {
  const query = text.trim().toLowerCase();
  const rawTitle = text.trim();
  const capitalizedTitle = rawTitle.charAt(0).toUpperCase() + rawTitle.slice(1);

  // 1. Presentation / Slides / Pitch Deck
  if (
    query.includes('presentation') ||
    query.includes('pitch deck') ||
    query.includes('slides') ||
    query.includes('keynote') ||
    query.includes('deck')
  ) {
    return {
      type: 'create_canvas',
      mode: 'deck',
      title: capitalizedTitle || 'Executive Presentation',
      toast: `Prepared presentation canvas for: "${rawTitle}"`
    };
  }

  // 2. Spreadsheet / Data Analysis / Financial Model / Metrics
  if (
    query.includes('dataset') ||
    query.includes('spreadsheet') ||
    query.includes('sheets') ||
    query.includes('excel') ||
    query.includes('financial model') ||
    query.includes('metrics') ||
    query.includes('csv') ||
    query.includes('analyze data') ||
    query.includes('calculation')
  ) {
    return {
      type: 'create_canvas',
      mode: 'sheets',
      title: capitalizedTitle || 'Financial & Metric Analysis',
      toast: `Prepared data spreadsheet for: "${rawTitle}"`
    };
  }

  // 3. Document / Writing / Proposal / Memo / Draft
  if (
    query.includes('write') ||
    query.includes('proposal') ||
    query.includes('draft') ||
    query.includes('article') ||
    query.includes('essay') ||
    query.includes('memo') ||
    query.includes('doc') ||
    query.includes('strategy brief')
  ) {
    return {
      type: 'create_canvas',
      mode: 'compose',
      title: capitalizedTitle || 'Strategy Proposal Draft',
      bodyHtml: `<h1>${capitalizedTitle || 'Strategy Proposal'}</h1><p>Initialized by Regaarder based on: <em>"${rawTitle}"</em>.</p><h2>1. Executive Summary</h2><p>Provide the strategic context and primary objectives here. Press <code>/</code> for intelligent editing tools.</p>`,
      toast: `Prepared composition draft for: "${rawTitle}"`
    };
  }

  // 4. Whiteboard / Diagram / Brainstorm / Canvas
  if (
    query.includes('whiteboard') ||
    query.includes('brainstorm') ||
    query.includes('diagram') ||
    query.includes('canvas') ||
    query.includes('map')
  ) {
    return {
      type: 'create_canvas',
      mode: 'whiteboard',
      title: capitalizedTitle || 'Ideation Whiteboard',
      toast: `Prepared infinite whiteboard for: "${rawTitle}"`
    };
  }

  // 5. Research / Competitors / Market / Audit / Investigate
  if (
    query.includes('research') ||
    query.includes('competitor') ||
    query.includes('investigate') ||
    query.includes('find out') ||
    query.includes('audit') ||
    query.includes('market analysis') ||
    query.includes('benchmark')
  ) {
    return {
      type: 'action',
      destination: 'browser',
      query: rawTitle,
      toast: `Launched deep research for: "${rawTitle}"`
    };
  }

  // 6. Meeting / Team Call / Video / Standup
  if (
    query.includes('meet') ||
    query.includes('call') ||
    query.includes('video') ||
    query.includes('standup') ||
    query.includes('sync with team') ||
    query.includes('room')
  ) {
    return {
      type: 'action',
      destination: 'room',
      meetingTopic: capitalizedTitle || 'Team Strategy Sync',
      enableAiTranscription: true,
      toast: `Prepared collaborative room for: "${rawTitle}"`
    };
  }

  // 7. Organize Files / Ingest / 30 documents / Connect notes
  if (
    query.includes('document') ||
    query.includes('file') ||
    query.includes('notes') ||
    query.includes('organize') ||
    query.includes('bring together') ||
    query.includes('understand them') ||
    query.includes('import') ||
    query.includes('pdf')
  ) {
    return {
      type: 'action',
      destination: 'omni-portal',
      toast: `Universal Memory activated for: "${rawTitle}"`
    };
  }

  // 8. Complex Project / Startup Launch / Sprint / Milestones (e.g. "I need to launch my startup")
  // Automatically prepare a cohesive project workspace with real milestones, tasks, and brief
  const projectPhases = [
    {
      id: `phase-${Date.now()}-1`,
      label: 'Strategy & Scoping',
      status: 'completed',
      startDate: new Date().toISOString().split('T')[0],
      endDate: new Date(Date.now() + 7 * 86400000).toISOString().split('T')[0],
      description: `Initial planning and milestone alignment for ${capitalizedTitle}.`,
      milestones: [
        { id: `m-${Date.now()}-1`, title: `Scope delivery requirements for ${capitalizedTitle}`, completed: true, dueDate: 'Phase 1' },
        { id: `m-${Date.now()}-2`, title: 'Align cross-functional resources & timeline', completed: true, dueDate: 'Phase 1' }
      ]
    },
    {
      id: `phase-${Date.now()}-2`,
      label: 'Core Execution',
      status: 'in-progress',
      startDate: new Date(Date.now() + 8 * 86400000).toISOString().split('T')[0],
      endDate: new Date(Date.now() + 21 * 86400000).toISOString().split('T')[0],
      description: `Active production phase for ${capitalizedTitle}.`,
      milestones: [
        { id: `m-${Date.now()}-3`, title: `Build & validate ${capitalizedTitle} deliverables`, completed: false, dueDate: 'Phase 2' },
        { id: `m-${Date.now()}-4`, title: 'Review quality standards and verification', completed: false, dueDate: 'Phase 2' }
      ]
    }
  ];

  const projectGoals = [
    { id: `g-${Date.now()}-1`, text: `Execute ${capitalizedTitle} on schedule`, completed: false },
    { id: `g-${Date.now()}-2`, text: 'Maintain executive quality and documentation integrity', completed: false }
  ];

  const createdProject = createProject({
    name: capitalizedTitle || 'New Venture Project',
    description: `AI-prepared workspace to accomplish: "${rawTitle}".`,
    color: '#7C3AED',
    phases: projectPhases,
    goals: projectGoals
  });

  const projectTasks = [
    {
      id: `task-${Date.now()}-1`,
      title: `Finalize initial roadmap for ${capitalizedTitle}`,
      projectId: createdProject.id,
      priority: 'high',
      dueDate: 'Today',
      completed: false
    },
    {
      id: `task-${Date.now()}-2`,
      title: `Assemble documentation & assets for ${capitalizedTitle}`,
      projectId: createdProject.id,
      priority: 'medium',
      dueDate: 'This Week',
      completed: false
    }
  ];

  return {
    type: 'project_prepared',
    projectId: createdProject.id,
    project: createdProject,
    createdTasks: projectTasks,
    title: capitalizedTitle,
    toast: `Workspace prepared for: "${capitalizedTitle}"`
  };
}
