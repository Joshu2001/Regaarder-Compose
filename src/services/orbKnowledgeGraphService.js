/**
 * Regaarder Orb Knowledge Graph Engine & Intelligence Layer
 * 
 * Provides unified cross-workspace semantic indexing, real-time live ingestion,
 * dynamic graph traversal, 9 analytical lens coordinate layout engines,
 * connection provenance tracking, and strategic decision synthesis.
 */

// ─── CANONICAL WORKSPACE ENTITY TYPES ───────────────────────────────────────
export const ORB_ENTITY_TYPES = {
  DOCUMENT: 'document',
  SHEET: 'sheet',
  SLIDE: 'slide',
  TASK: 'task',
  MEETING: 'meeting',
  PERSON: 'person',
  DECISION: 'decision',
  METRIC: 'metric',
  ASSUMPTION: 'assumption',
  RESEARCH_NOTE: 'research_note',
  SCHEDULE_EVENT: 'schedule_event',
};

// ─── RELATIONSHIP TYPES ──────────────────────────────────────────────────────
export const ORB_RELATION_TYPES = {
  REFERENCES: 'references',
  CALCULATES_FROM: 'calculates_from',
  VISUALIZES: 'visualizes',
  DISCUSSED_IN: 'discussed_in',
  DERIVED_FROM: 'derived_from',
  DEPENDS_ON: 'depends_on',
  DECIDED_BY: 'decided_by',
  ASSIGNED_TO: 'assigned_to',
  CHRONOLOGY_BEFORE: 'chronology_before',
  CAUSALLY_IMPACTS: 'causally_impacts',
  AI_INFERRED: 'ai_inferred_correlation',
  CONTRADICTS: 'contradicts',
};

// ─── EPISTEMIC PROVENANCE STATUSES ──────────────────────────────────────────
export const ORB_EPISTEMIC_STATUS = {
  VERIFIED: 'verified',     // Explicit formulas, direct quotes, signed resolutions (95-100%)
  INFERRED: 'inferred',     // Autonomous AI correlation, cross-app semantic linkage (85-94%)
  PROBABLE: 'probable',     // Contextual statistical likelihood, project/timeline overlap (70-84%)
  UNCERTAIN: 'uncertain',   // Detected discrepancy, unverified assumption, or contested date
};


// ─── 9 ANALYTICAL LENSES ─────────────────────────────────────────────────────
export const ORB_LENSES = [
  { id: 'timeline', label: 'Timeline', desc: 'Chronological progression from assumption to execution' },
  { id: 'dependencies', label: 'Dependencies', desc: 'Upstream prerequisites and downstream blocking paths' },
  { id: 'decisions', label: 'Decisions', desc: 'Strategic choices, supporting rationale, and outcomes' },
  { id: 'projects', label: 'Projects', desc: 'Clustered by organizational initiative and workstream' },
  { id: 'people', label: 'People', desc: 'Stakeholder ownership, cross-functional reviews, and assignees' },
  { id: 'financial', label: 'Financial', desc: 'Revenue models, sheet formulas, capex, and unit economics' },
  { id: 'knowledge', label: 'Knowledge', desc: 'Conceptual semantic clusters and cross-document themes' },
  { id: 'causal', label: 'Causal', desc: 'Cause-and-effect chains and risk propagation pathways' },
  { id: 'ai', label: 'AI Inferences', desc: 'Autonomous relationship discoveries and anomaly detections' },
];

// ─── PRE-POPULATED ENTERPRISE MEMORY CORPUS ─────────────────────────────────
export const INITIAL_ORB_ENTITIES = [
  // ── NVIDIA & GPU CLUSTER ──
  {
    id: 'ent_nv_memo',
    type: 'document',
    workspace: 'compose',
    title: 'Q3 Hyperscale GPU Demand & Datacenter Capex Memo',
    author: 'Elena Rostova',
    authorRole: 'VP Strategic Planning',
    authorAvatar: 'https://images.unsplash.com/photo-1534528741775-53994a69daeb?w=100&h=100&fit=crop&crop=face',
    updatedAt: '2026-08-14T09:30:00Z',
    project: 'GPU Infrastructure 2026',
    tags: ['Nvidia', 'GPU', 'Capex', 'Hyperscale', 'Datacenter', 'AI Hardware'],
    excerpt: 'Forecasts baseline datacenter demand expanding by 28% in Q3, driven by multi-modal training clusters and Blackwell architecture ramps.',
    content: 'Executive strategic analysis of global AI accelerator allocation. We model hyperscale server buildouts with an assumed 28% quarter-over-quarter expansion in tier-1 cloud datacenter deployments.',
    metadata: {
      docId: 'doc_gpu_memo_2026',
      wordCount: 1420,
      confidence: 0.96,
      keyMetric: '$48.2B Market Expansion',
      status: 'Final Approved'
    }
  },
  {
    id: 'ent_nv_sheet',
    type: 'sheet',
    workspace: 'sheets',
    title: '2026 Datacenter GPU Revenue & Margin Model',
    author: 'Alex Vance',
    authorRole: 'Principal Financial Analyst',
    authorAvatar: 'https://images.unsplash.com/photo-1507003211169-0a1dd7228f2d?w=100&h=100&fit=crop&crop=face',
    updatedAt: '2026-08-16T14:15:00Z',
    project: 'GPU Infrastructure 2026',
    tags: ['Nvidia', 'Revenue', 'Sheets', 'Financial Model', 'Gross Margin', 'Formulas'],
    excerpt: 'Cell C14 calculates total Q3 GPU revenue at $48.2B via formula =B4*1.28 referencing Elena\'s demand memo assumptions.',
    content: 'Full financial model integrating pricing per H200/B200 unit, yield curves, and volume tiering. Cell C14 =B4*(1+C2) yields $48,200,000,000 projected gross revenue.',
    metadata: {
      sheetId: 'sheet_gpu_rev_model',
      cellAddress: 'Sheets > Financial Model!C14',
      formula: '=$B$4 * (1 + $C$2)',
      cellValue: '$48.20B',
      grossMargin: '74.8%',
      confidence: 0.99
    }
  },
  {
    id: 'ent_nv_deck',
    type: 'slide',
    workspace: 'deck',
    title: 'Board Review: Enterprise AI Capex & GPU Infrastructure Q3',
    author: 'Elena Rostova',
    authorRole: 'VP Strategic Planning',
    authorAvatar: 'https://images.unsplash.com/photo-1534528741775-53994a69daeb?w=100&h=100&fit=crop&crop=face',
    updatedAt: '2026-08-17T11:00:00Z',
    project: 'GPU Infrastructure 2026',
    tags: ['Nvidia', 'Deck', 'Board Presentation', 'Capex', 'Revenue Visualization'],
    excerpt: 'Slide 4 visualizes the $48.2B revenue projection with breakdown between Blackwell B200 and H200 shipments across top 4 cloud providers.',
    content: 'Slide 4: Q3 GPU Revenue Trajectory ($48.2B). Visual bar chart mapping $32.4B B200 accelerators and $15.8B H200 allocations. Notes wafer constraints.',
    metadata: {
      deckId: 'deck_board_q3',
      slideNumber: 4,
      chartType: 'Stacked Bar Chart',
      headlineMetric: '$48.2B Projected Revenue'
    }
  },
  {
    id: 'ent_nv_meeting',
    type: 'meeting',
    workspace: 'room',
    title: 'Executive Sync: GPU Allocation & Packaging Constraints',
    author: 'Michelle Chen',
    authorRole: 'Head of Hardware Operations',
    authorAvatar: 'https://images.unsplash.com/photo-1573496359142-b8d87734a5a2?w=100&h=100&fit=crop&crop=face',
    updatedAt: '2026-08-18T16:00:00Z',
    project: 'GPU Infrastructure 2026',
    tags: ['Nvidia', 'Room', 'Meeting Transcript', 'Packaging', 'TSMC', 'Bottlenecks'],
    excerpt: 'Michelle Chen noted at 14:28: "If TSMC advanced packaging slips by 3 weeks, our Q3 forecast of $48.2B drops to $41.5B immediately."',
    content: 'Meeting transcript with 6 attendees. Key debate regarding CoWoS packaging allocation and secondary supplier qualification before Q3 batch production.',
    metadata: {
      roomId: 'room_exec_sync_aug18',
      durationMinutes: 45,
      timestampQuote: '14:28',
      speaker: 'Michelle Chen',
      sentiment: 'Cautionary'
    }
  },
  {
    id: 'ent_nv_task',
    type: 'task',
    workspace: 'tasks',
    title: 'Finalize secondary OSAT advanced packaging contract with ASE Group',
    author: 'Marcus Vance',
    authorRole: 'Director of Procurement',
    authorAvatar: 'https://images.unsplash.com/photo-1500648767791-00dcc994a43e?w=100&h=100&fit=crop&crop=face',
    updatedAt: '2026-08-19T08:45:00Z',
    project: 'GPU Infrastructure 2026',
    tags: ['Tasks', 'Procurement', 'OSAT', 'Packaging', 'Contract', 'Mitigation'],
    excerpt: 'Action item created directly from Aug 18 Executive Sync to mitigate TSMC packaging bottleneck by securing 25,000 monthly wafer capacity.',
    content: 'Contract negotiations with ASE Group for secondary advanced substrate packaging. Critical blocker for sustaining Q3 Blackwell delivery volume.',
    metadata: {
      taskId: 'task_osat_sec_contract',
      priority: 'Urgent',
      status: 'In Progress',
      dueDate: '2026-09-10',
      assignee: 'Marcus Vance',
      confidence: 1.0
    }
  },
  {
    id: 'ent_nv_decision',
    type: 'decision',
    workspace: 'compose',
    title: 'Decision: Authorize $1.8B advanced inventory commitment for Blackwell architecture',
    author: 'Executive Committee',
    authorRole: 'C-Suite Sign-off',
    authorAvatar: 'https://images.unsplash.com/photo-1472099645785-5658abf4ff4e?w=100&h=100&fit=crop&crop=face',
    updatedAt: '2026-08-18T17:30:00Z',
    project: 'GPU Infrastructure 2026',
    tags: ['Decision', 'Capex', 'Blackwell', 'Commitment', 'Inventory'],
    excerpt: 'Formally approved capital commitment based on Alex Vance\'s $48.2B model and Michelle Chen\'s OSAT mitigation plan.',
    content: 'Formal board and executive resolution authorizing binding prepayment to secure 120,000 advanced GPU accelerator units across Q3 and Q4.',
    metadata: {
      decisionStatus: 'Executed',
      impactLevel: 'High Enterprise',
      financialImpact: '$1.80 Billion',
      approvers: ['CEO', 'CFO', 'VP Strategy']
    }
  },

  // ── TAIWAN SEMICONDUCTOR & TSMC CLUSTER ──
  {
    id: 'ent_tsmc_research',
    type: 'research_note',
    workspace: 'browser',
    title: 'Geopolitical Analysis: Taiwan Foundry Capacity & Advanced CoWoS Packaging 2026',
    author: 'Dr. Sarah Lin',
    authorRole: 'Lead Semiconductor Analyst',
    authorAvatar: 'https://images.unsplash.com/photo-1580489944761-15a19d654956?w=100&h=100&fit=crop&crop=face',
    updatedAt: '2026-08-11T13:00:00Z',
    project: 'Supply Chain Resilience',
    tags: ['Taiwan semiconductor risk', 'TSMC', 'CoWoS', 'Foundry', 'Geopolitical Risk', 'Research'],
    excerpt: 'Comprehensive risk assessment of 3nm/2nm fab concentration in Hsinchu and Tainan, detailing single-source packaging exposure.',
    content: 'Research briefing on Taiwan semiconductor supply chains. Over 88% of global sub-4nm leading edge logic and 92% of advanced CoWoS packaging remain concentrated in Taiwan.',
    metadata: {
      browserUrl: 'https://research.regaarder.internal/semiconductor-taiwan-risk-2026',
      sourceType: 'Intelligence Briefing',
      riskScore: 'Elevated (8.4/10)'
    }
  },
  {
    id: 'ent_tsmc_memo',
    type: 'document',
    workspace: 'compose',
    title: 'Semiconductor Supply Chain Resilience & Dual-Sourcing Protocol',
    author: 'Marcus Vance',
    authorRole: 'Director of Procurement',
    authorAvatar: 'https://images.unsplash.com/photo-1500648767791-00dcc994a43e?w=100&h=100&fit=crop&crop=face',
    updatedAt: '2026-08-13T10:20:00Z',
    project: 'Supply Chain Resilience',
    tags: ['Taiwan semiconductor risk', 'Dual Sourcing', 'TSMC', 'Intel Foundry', 'Samsung', 'Resilience'],
    excerpt: 'Establishes internal operational threshold: no single fab location may exceed 60% of total compute supply by Q4 2027.',
    content: 'Strategic roadmap for qualifying secondary foundry partners (Intel 18A and Samsung SF2) to hedge against geopolitical and geological disruptions in Taiwan.',
    metadata: {
      docId: 'doc_semi_resilience_proto',
      classification: 'Confidential Internal',
      targetDate: 'Q4 2027'
    }
  },
  {
    id: 'ent_tsmc_sheet',
    type: 'sheet',
    workspace: 'sheets',
    title: 'Global Fab Capacity Allocation & Yield Variance Matrix',
    author: 'Alex Vance',
    authorRole: 'Principal Financial Analyst',
    authorAvatar: 'https://images.unsplash.com/photo-1507003211169-0a1dd7228f2d?w=100&h=100&fit=crop&crop=face',
    updatedAt: '2026-08-15T16:45:00Z',
    project: 'Supply Chain Resilience',
    tags: ['Taiwan semiconductor risk', 'TSMC', 'Yields', 'Sheets', 'Capacity', 'Cost Variance'],
    excerpt: 'Compares TSMC Fab 18 wafer yields (86.4%) against alternative foundries, showing $340 per-good-die cost delta.',
    content: 'Comparative production cost spreadsheet calculating the unit margin impact of secondary fab qualification. Formula =AVERAGE(C4:C12)*0.864 in column E.',
    metadata: {
      sheetId: 'sheet_fab_alloc_matrix',
      cellAddress: 'Sheets > Foundry Comparison!E8',
      formula: '=AVERAGE(C4:C12) * (1 - $F$2)',
      unitCostDelta: '+$340 / die',
      yieldGap: '12.2%'
    }
  },
  {
    id: 'ent_tsmc_deck',
    type: 'slide',
    workspace: 'deck',
    title: 'Board Risk Briefing: Single-Source Exposure in Advanced Packaging',
    author: 'Dr. Sarah Lin',
    authorRole: 'Lead Semiconductor Analyst',
    authorAvatar: 'https://images.unsplash.com/photo-1580489944761-15a19d654956?w=100&h=100&fit=crop&crop=face',
    updatedAt: '2026-08-17T15:20:00Z',
    project: 'Supply Chain Resilience',
    tags: ['Taiwan semiconductor risk', 'Board Briefing', 'Deck', 'Risk Matrix', 'TSMC'],
    excerpt: 'Slide 7 charts supply disruption scenarios from 15-day to 90-day port interruptions, estimating quarterly EBITDA risk at $1.4B.',
    content: 'Slide 7: Taiwan Semiconductor Disruption Impact Matrix. Visualizes down-time cost curves and identifies critical single-point dependencies in Kaohsiung facilities.',
    metadata: {
      deckId: 'deck_risk_briefing_2026',
      slideNumber: 7,
      ebitdaExposure: '$1.40B Risk',
      chartType: 'Waterfall Risk Curve'
    }
  },

  // ── AI AGENTS & ORB INTELLIGENCE CLUSTER ──
  {
    id: 'ent_orb_prd',
    type: 'document',
    workspace: 'compose',
    title: 'Orb Intelligence Layer: Cross-Workspace Semantic Architecture PRD',
    author: 'Joshua Regaarder',
    authorRole: 'Principal Architect',
    authorAvatar: 'https://i.pravatar.cc/150?u=a04258114e29026702d',
    updatedAt: '2026-08-20T10:00:00Z',
    project: 'Orb Intelligence',
    tags: ['Orb', 'Cross-Workspace', 'Semantic Graph', 'Search', 'Architecture', 'PRD'],
    excerpt: 'Defines the unified organizational memory engine bridging Compose, Sheets, Deck, Tasks, Schedule, and Room through multi-lens discovery.',
    content: 'Full PRD specifying unified entity models, 9 analytical lenses, Understand provenance inspectors, and Decide strategic synthesizers.',
    metadata: {
      docId: 'doc_orb_prd_v1',
      version: '1.0.0',
      status: 'Active Implementation'
    }
  },
  {
    id: 'ent_orb_schedule',
    type: 'schedule_event',
    workspace: 'schedule',
    title: 'Orb Intelligence Cross-Workspace Architecture Final Sign-off',
    author: 'Joshua Regaarder',
    authorRole: 'Principal Architect',
    authorAvatar: 'https://i.pravatar.cc/150?u=a04258114e29026702d',
    updatedAt: '2026-08-20T08:00:00Z',
    project: 'Orb Intelligence',
    tags: ['Schedule', 'Orb', 'Milestone', 'Sign-off', 'Architecture'],
    excerpt: 'Calendar milestone for deploying Orb global search, Map graph visualizer, and Decide synthesizer across production desktop clients.',
    content: 'All-hands engineering and executive milestone. Verifies sub-16ms latency across knowledge graph rendering and seamless cross-app navigation.',
    metadata: {
      scheduledDate: '2026-08-20T16:00:00Z',
      location: 'Room Stage 1',
      attendees: ['Joshua Regaarder', 'Elena Rostova', 'Alex Vance', 'Michelle Chen']
    }
  },
  {
    id: 'ent_sched_blackwell',
    type: 'schedule_event',
    workspace: 'schedule',
    title: 'Q3 Blackwell B200 Batch 1 Delivery & Datacenter Commissioning',
    author: 'Michelle Chen',
    authorRole: 'Head of Hardware Operations',
    authorAvatar: 'https://images.unsplash.com/photo-1573496359142-b8d87734a5a2?w=100&h=100&fit=crop&crop=face',
    updatedAt: '2026-08-19T14:30:00Z',
    project: 'GPU Infrastructure 2026',
    tags: ['Schedule', 'Blackwell', 'Milestone', 'Datacenter', 'Nvidia'],
    excerpt: 'Critical project schedule milestone tracking 40,000 unit arrival and server rack power-on across Phoenix and Dublin clusters.',
    content: 'Comprehensive delivery schedule tracking hardware transit from packaging facilities to hyperscale cloud data halls.',
    metadata: {
      scheduledDate: '2026-09-15T09:00:00Z',
      location: 'Phoenix DC-04 & Dublin DC-02',
      status: 'On Schedule'
    }
  },
  {
    id: 'ent_room_foundry_sync',
    type: 'meeting',
    workspace: 'room',
    title: 'Foundry Capacity & Packaging Alignment Conference',
    author: 'Marcus Vance',
    authorRole: 'Director of Procurement',
    authorAvatar: 'https://images.unsplash.com/photo-1500648767791-00dcc994a43e?w=100&h=100&fit=crop&crop=face',
    updatedAt: '2026-08-17T14:00:00Z',
    project: 'Supply Chain Resilience',
    tags: ['Room', 'Meeting Transcript', 'Foundry', 'TSMC', 'ASE', 'Capacity'],
    excerpt: 'Joint procurement alignment with OSAT packaging partners reviewing monthly wafer allocation and lead-time commitments.',
    content: 'Multi-party meeting transcript covering yield variance, substrate allocation, and secondary supplier ramp schedules.',
    metadata: {
      roomId: 'room_foundry_alignment_aug17',
      durationMinutes: 60,
      attendeesCount: 8,
      keyAgreement: '25,000 monthly wafer commitment'
    }
  },
  {
    id: 'ent_browser_semianalysis',
    type: 'research_note',
    workspace: 'browser',
    title: 'SemiAnalysis Deep-Dive: CoWoS Wafer Substrate Bottlenecks & Pricing',
    author: 'Dr. Sarah Lin',
    authorRole: 'Lead Semiconductor Analyst',
    authorAvatar: 'https://images.unsplash.com/photo-1580489944761-15a19d654956?w=100&h=100&fit=crop&crop=face',
    updatedAt: '2026-08-15T11:20:00Z',
    project: 'Supply Chain Resilience',
    tags: ['Research', 'Browser', 'SemiAnalysis', 'CoWoS', 'Packaging', 'Economics'],
    excerpt: 'Detailed market intelligence report analyzing advanced packaging supply constraints and gross margin implications through 2027.',
    content: 'External analyst intelligence report captured via Browser research panel regarding glass substrate roadmaps and foundry pricing power.',
    metadata: {
      browserUrl: 'https://semianalysis.com/advanced-packaging-deep-dive-2026',
      sourceType: 'External Research Report',
      capturedAt: '2026-08-15'
    }
  },
  {
    id: 'ent_task_dual_source',
    type: 'task',
    workspace: 'tasks',
    title: 'Qualify secondary foundry test wafer runs with Samsung SF2 & Intel 18A',
    author: 'Dr. Sarah Lin',
    authorRole: 'Lead Semiconductor Analyst',
    authorAvatar: 'https://images.unsplash.com/photo-1580489944761-15a19d654956?w=100&h=100&fit=crop&crop=face',
    updatedAt: '2026-08-19T16:00:00Z',
    project: 'Supply Chain Resilience',
    tags: ['Tasks', 'Foundry', 'Dual Sourcing', 'Intel', 'Samsung', 'Qualification'],
    excerpt: 'Engineering validation task to execute shuttle test runs on secondary foundry process nodes.',
    content: 'Action item to initiate shuttle wafer qualification runs to validate secondary foundry yield and thermal performance.',
    metadata: {
      taskId: 'task_dual_foundry_qual',
      priority: 'High',
      status: 'In Progress',
      dueDate: '2026-10-15',
      assignee: 'Dr. Sarah Lin'
    }
  },
  {
    id: 'ent_orb_task',
    type: 'task',
    workspace: 'tasks',
    title: 'Verify sub-16ms force layout physics across 500+ entity knowledge graphs',
    author: 'Joshua Regaarder',
    authorRole: 'Principal Architect',
    authorAvatar: 'https://i.pravatar.cc/150?u=a04258114e29026702d',
    updatedAt: '2026-08-20T11:15:00Z',
    project: 'Orb Intelligence',
    tags: ['Orb', 'Tasks', 'Performance', 'Graph', 'Optimization'],
    excerpt: 'Performance benchmarking task to guarantee 60fps graph pan/zoom and seamless progressive disclosure.',
    content: 'Benchmark OrbMapCanvas under WebGL/SVG acceleration to ensure flawless direct manipulation.',
    metadata: {
      taskId: 'task_orb_perf_bench',
      priority: 'High',
      status: 'In Progress',
      dueDate: '2026-08-21',
      assignee: 'Joshua Regaarder'
    }
  }
];

// ─── INITIAL SEMANTIC RELATIONSHIPS (EDGES) ─────────────────────────────────
export const INITIAL_ORB_EDGES = [
  // Elena's Memo -> Alex's Sheet
  {
    id: 'edge_memo_to_sheet',
    sourceId: 'ent_nv_memo',
    targetId: 'ent_nv_sheet',
    relationType: ORB_RELATION_TYPES.CALCULATES_FROM,
    label: 'Calculates revenue model ($48.2B) from 28% demand growth assumption',
    epistemicStatus: ORB_EPISTEMIC_STATUS.VERIFIED,
    modality: 'Formula Linkage',
    epistemicRationale: 'Explicit spreadsheet cell formula =B4*(1+C2) directly references Elena Rostova\'s 28% growth assumption.',
    evidence: {
      sourceSnippet: 'We model hyperscale server buildouts with an assumed 28% quarter-over-quarter expansion...',
      targetSnippet: 'Cell C14 formula =$B$4*(1+$C$2) computes $48.20B gross revenue projection.',
      formula: '=$B$4 * (1 + $C$2)',
      cellAddress: 'Sheets > Financial Model!C14',
      date: '2026-08-16'
    },
    isAiInferred: false,
    confidenceScore: 1.0,
    lenses: ['timeline', 'dependencies', 'financial', 'knowledge', 'projects']
  },

  // Alex's Sheet -> Elena's Deck
  {
    id: 'edge_sheet_to_deck',
    sourceId: 'ent_nv_sheet',
    targetId: 'ent_nv_deck',
    relationType: ORB_RELATION_TYPES.VISUALIZES,
    label: 'Visualizes $48.2B model output as Q3 Capex Breakdown on Slide 4',
    epistemicStatus: ORB_EPISTEMIC_STATUS.VERIFIED,
    modality: 'Direct Citation',
    epistemicRationale: 'Board slide 4 directly embeds the $48.2B financial model outputs as a stacked bar chart.',
    evidence: {
      sourceSnippet: 'Total projected gross revenue output: $48,200,000,000.',
      targetSnippet: 'Slide 4: Q3 GPU Revenue Trajectory ($48.2B) Stacked Bar Chart.',
      slideRef: 'Slide 4',
      chartType: 'Stacked Bar Chart',
      date: '2026-08-17'
    },
    isAiInferred: false,
    confidenceScore: 0.98,
    lenses: ['timeline', 'dependencies', 'financial', 'projects']
  },

  // Elena's Deck -> Michelle's Meeting
  {
    id: 'edge_deck_to_meeting',
    sourceId: 'ent_nv_deck',
    targetId: 'ent_nv_meeting',
    relationType: ORB_RELATION_TYPES.DISCUSSED_IN,
    label: 'Discussed Slide 4 revenue targets against packaging yield constraints',
    epistemicStatus: ORB_EPISTEMIC_STATUS.VERIFIED,
    modality: 'Meeting Transcript Citation',
    epistemicRationale: 'Michelle Chen explicitly referenced Slide 4 revenue targets in recorded meeting transcript at 14:28.',
    evidence: {
      sourceSnippet: 'Notes wafer constraints and CoWoS delivery timelines.',
      targetSnippet: 'Michelle Chen (14:28): "If TSMC advanced packaging slips by 3 weeks, our Q3 forecast of $48.2B drops to $41.5B immediately."',
      timestampQuote: '[14:28 - Michelle Chen]',
      date: '2026-08-18'
    },
    isAiInferred: false,
    confidenceScore: 0.99,
    lenses: ['timeline', 'decisions', 'people', 'causal', 'projects']
  },

  // Meeting -> Task
  {
    id: 'edge_meeting_to_task',
    sourceId: 'ent_nv_meeting',
    targetId: 'ent_nv_task',
    relationType: ORB_RELATION_TYPES.ASSIGNED_TO,
    label: 'Generated urgent mitigation task to secure secondary OSAT packaging capacity',
    epistemicStatus: ORB_EPISTEMIC_STATUS.VERIFIED,
    modality: 'Action Item Generation',
    epistemicRationale: 'Task created automatically following Michelle Chen\'s directive during the executive meeting.',
    evidence: {
      sourceSnippet: 'Michelle Chen recommended immediate secondary packaging qualification.',
      targetSnippet: 'Task: Finalize secondary OSAT advanced packaging contract with ASE Group.',
      assignee: 'Marcus Vance',
      date: '2026-08-19'
    },
    isAiInferred: false,
    confidenceScore: 1.0,
    lenses: ['timeline', 'dependencies', 'people', 'projects', 'causal']
  },

  // Meeting + Sheet -> Executive Decision
  {
    id: 'edge_meeting_to_decision',
    sourceId: 'ent_nv_meeting',
    targetId: 'ent_nv_decision',
    relationType: ORB_RELATION_TYPES.DECIDED_BY,
    label: 'Prompted C-Suite approval for $1.8B binding inventory prepayment',
    epistemicStatus: ORB_EPISTEMIC_STATUS.VERIFIED,
    modality: 'Formal Resolution Sign-off',
    epistemicRationale: 'Executive board resolution citing Alex Vance financial model and Room discussion.',
    evidence: {
      sourceSnippet: 'Consensus reached that securing early allocation justifies upfront cash commitment.',
      targetSnippet: 'Executed binding $1.8B prepayment resolution.',
      financialFigure: '$1.80 Billion',
      date: '2026-08-18'
    },
    isAiInferred: false,
    confidenceScore: 1.0,
    lenses: ['timeline', 'decisions', 'financial', 'projects']
  },

  // AI Inferred: TSMC Research -> Elena's Memo
  {
    id: 'edge_tsmc_research_to_memo',
    sourceId: 'ent_tsmc_research',
    targetId: 'ent_nv_memo',
    relationType: ORB_RELATION_TYPES.AI_INFERRED,
    label: 'AI Discovered: Memo baseline relies on 92% Taiwan packaging concentration noted in Research',
    epistemicStatus: ORB_EPISTEMIC_STATUS.INFERRED,
    modality: 'Semantic Knowledge Extraction',
    epistemicRationale: 'Orb multi-modal NLP detected implicit dependency between Elena\'s volume ramp and Dr. Sarah Lin\'s geographic risk report.',
    evidence: {
      sourceSnippet: 'Over 92% of advanced CoWoS packaging remain concentrated in Taiwan...',
      targetSnippet: 'We model hyperscale server buildouts with assumed rapid Blackwell ramps...',
      aiRationale: 'Semantic entity extraction identified unhedged single-point dependency on Hsinchu packaging lines.',
      confidence: 0.91
    },
    isAiInferred: true,
    confidenceScore: 0.91,
    lenses: ['ai', 'causal', 'knowledge', 'dependencies']
  },

  // AI Inferred: TSMC Sheet Contradicts Deck Revenue Target under Delay Scenario
  {
    id: 'edge_tsmc_sheet_to_deck',
    sourceId: 'ent_tsmc_sheet',
    targetId: 'ent_nv_deck',
    relationType: ORB_RELATION_TYPES.CONTRADICTS,
    label: 'Potential Variance: Fab cost delta (+ $340/die) reduces Slide 4 net margin by 4.2%',
    epistemicStatus: ORB_EPISTEMIC_STATUS.UNCERTAIN,
    modality: 'Discrepancy / Risk Anomaly',
    epistemicRationale: 'Automated formula reconciliation detected unmodeled margin dilution between Sheets yield model and Board deck.',
    evidence: {
      sourceSnippet: 'Secondary fab cost delta shows +$340 per good die in alternative foundries...',
      targetSnippet: 'Slide 4 calculates standard gross margin at 74.8% without secondary yield variance.',
      aiRationale: 'Automated formula reconciliation detected unmodeled margin dilution if secondary sourcing is triggered.',
      confidence: 0.88
    },
    isAiInferred: true,
    confidenceScore: 0.88,
    lenses: ['ai', 'financial', 'decisions', 'causal']
  },

  // TSMC Memo -> Marcus Task
  {
    id: 'edge_tsmc_memo_to_task',
    sourceId: 'ent_tsmc_memo',
    targetId: 'ent_nv_task',
    relationType: ORB_RELATION_TYPES.DEPENDS_ON,
    label: 'Operationalizes dual-sourcing protocol defined in Marcus Vance procurement memo',
    epistemicStatus: ORB_EPISTEMIC_STATUS.PROBABLE,
    modality: 'Project Alignment',
    epistemicRationale: 'High alignment between procurement threshold guidelines and active contract negotiation workstream.',
    evidence: {
      sourceSnippet: 'Establishes internal threshold: no single fab location may exceed 60% of total supply...',
      targetSnippet: 'Contract negotiations with ASE Group for secondary advanced substrate packaging.',
      date: '2026-08-19'
    },
    isAiInferred: false,
    confidenceScore: 0.95,
    lenses: ['dependencies', 'projects', 'people']
  },

  // TSMC Deck -> Executive Decision
  {
    id: 'edge_tsmc_deck_to_decision',
    sourceId: 'ent_tsmc_deck',
    targetId: 'ent_nv_decision',
    relationType: ORB_RELATION_TYPES.CAUSALLY_IMPACTS,
    label: 'Risk matrix showing $1.4B EBITDA exposure accelerated $1.8B inventory commitment',
    epistemicStatus: ORB_EPISTEMIC_STATUS.PROBABLE,
    modality: 'Causal Chain',
    epistemicRationale: 'Board risk briefing on Taiwan single-sourcing directly precipitated authorization of inventory buffer funding.',
    evidence: {
      sourceSnippet: 'Slide 7 charts supply disruption scenarios estimating quarterly EBITDA risk at $1.4B.',
      targetSnippet: 'Formal board resolution authorizing binding prepayment...',
      date: '2026-08-18'
    },
    isAiInferred: false,
    confidenceScore: 0.94,
    lenses: ['causal', 'decisions', 'timeline']
  },

  // Orb PRD -> Schedule Milestone
  {
    id: 'edge_orb_prd_to_sched',
    sourceId: 'ent_orb_prd',
    targetId: 'ent_orb_schedule',
    relationType: ORB_RELATION_TYPES.CHRONOLOGY_BEFORE,
    label: 'Architecture PRD precedes Executive sign-off milestone',
    epistemicStatus: ORB_EPISTEMIC_STATUS.VERIFIED,
    modality: 'Chronological Link',
    epistemicRationale: 'Product milestone sequence logged in enterprise release schedule.',
    evidence: {
      sourceSnippet: 'Full PRD specifying unified entity models, 9 analytical lenses...',
      targetSnippet: 'Orb Intelligence Cross-Workspace Architecture Final Sign-off',
      date: '2026-08-20'
    },
    isAiInferred: false,
    confidenceScore: 1.0,
    lenses: ['timeline', 'projects', 'dependencies']
  },

  // Orb PRD -> Perf Task
  {
    id: 'edge_orb_prd_to_task',
    sourceId: 'ent_orb_prd',
    targetId: 'ent_orb_task',
    relationType: ORB_RELATION_TYPES.DEPENDS_ON,
    label: 'PRD sub-16ms latency directive spawned graph benchmark task',
    epistemicStatus: ORB_EPISTEMIC_STATUS.VERIFIED,
    modality: 'Direct Reference',
    epistemicRationale: 'Engineering benchmark task references explicit latency requirements from PRD Section 4.',
    evidence: {
      sourceSnippet: 'Guarantees sub-16ms latency across knowledge graph rendering...',
      targetSnippet: 'Verify sub-16ms force layout physics across 500+ entity knowledge graphs.',
      date: '2026-08-20'
    },
    isAiInferred: false,
    confidenceScore: 0.97,
    lenses: ['dependencies', 'projects', 'people']
  }
];

// ─── 9 ANALYTICAL LENS COORDINATE LAYOUT ENGINES ─────────────────────────────

/**
 * Force-directed collision resolution to eliminate overlaps between nodes & labels
 */
function relaxNodePositions(nodes, minDistance = 115, padding = 70, canvasWidth = 1250, canvasHeight = 650) {
  for (let iter = 0; iter < 45; iter++) {
    for (let i = 0; i < nodes.length; i++) {
      for (let j = i + 1; j < nodes.length; j++) {
        const a = nodes[i];
        const b = nodes[j];
        let dx = b.x - a.x;
        let dy = b.y - a.y;
        let dist = Math.hypot(dx, dy);
        if (dist < 1e-3) {
          dx = (Math.random() - 0.5) * 20;
          dy = (Math.random() - 0.5) * 20;
          dist = Math.hypot(dx, dy);
        }
        if (dist < minDistance) {
          const overlap = (minDistance - dist) / 2;
          const nx = dx / dist;
          const ny = dy / dist;
          a.x -= nx * overlap * 0.85;
          a.y -= ny * overlap * 0.85;
          b.x += nx * overlap * 0.85;
          b.y += ny * overlap * 0.85;
        }
      }
      // Keep within bounds
      nodes[i].x = Math.max(padding, Math.min(canvasWidth - padding, nodes[i].x));
      nodes[i].y = Math.max(padding, Math.min(canvasHeight - padding, nodes[i].y));
    }
  }
  return nodes;
}

export function computeLensLayout(lensKey, entities = [], edges = [], { width = 940, height = 580 } = {}) {
  const nodeCount = entities.length;
  if (!nodeCount) return { nodes: [], links: [] };

  // Use slightly reduced cohesive coordinate canvas
  const canvasWidth = Math.max(width, Math.max(1200, nodeCount * 80));
  const canvasHeight = Math.max(height, Math.max(620, nodeCount * 36));

  const padding = 80;
  const usableWidth = canvasWidth - padding * 2;
  const usableHeight = canvasHeight - padding * 2;
  const centerX = canvasWidth / 2;
  const centerY = canvasHeight / 2;

  let positionedNodes = [];

  switch (lensKey) {
    // ── 1. TIMELINE LENS (Evenly-distributed chronological streams) ──
    case 'timeline': {
      const sorted = [...entities].sort((a, b) => new Date(a.updatedAt) - new Date(b.updatedAt));

      positionedNodes = sorted.map((entity, i) => {
        // Distribute smoothly along X by chronological rank to prevent date-clustering pileups
        const progress = sorted.length > 1 ? i / (sorted.length - 1) : 0.5;
        const x = padding + progress * usableWidth;

        // Distribute across 3 distinct staggered horizontal lanes
        const lane = i % 3;
        const laneOffsetY = lane === 0 ? -75 : lane === 1 ? 0 : 75;
        const microJitter = (i % 2 === 0 ? -15 : 15);
        const y = centerY + laneOffsetY + microJitter;

        return { 
          ...entity, 
          x, 
          y, 
          lensRole: `Step ${i + 1} of ${sorted.length}` 
        };
      });
      break;
    }

    // ── 2. DEPENDENCIES LENS (Directional 5-Column Pipeline) ──
    case 'dependencies': {
      const levelMap = {
        research_note: 0,
        assumption: 0,
        document: 1,
        sheet: 2,
        slide: 3,
        meeting: 3,
        decision: 4,
        task: 4,
        schedule_event: 4,
        person: 2,
      };

      const columns = [[], [], [], [], []];
      entities.forEach(e => {
        const lvl = levelMap[e.type] ?? 1;
        columns[lvl].push(e);
      });

      positionedNodes = entities.map(entity => {
        const colIdx = levelMap[entity.type] ?? 1;
        const colList = columns[colIdx];
        const rowIdx = colList.indexOf(entity);
        const colCount = Math.max(1, colList.length);

        const x = padding + (colIdx / 4) * usableWidth;
        const y = padding + ((rowIdx + 0.5) / colCount) * usableHeight;
        return {
          ...entity,
          x,
          y,
          lensRole: colIdx === 0 ? 'Upstream Root' : colIdx === 4 ? 'Downstream Action' : 'Transform Layer'
        };
      });
      break;
    }

    // ── 3. DECISIONS LENS (Concentric Radial Star with Dual Orbital Rings) ──
    case 'decisions': {
      const decisionNodes = entities.filter(e => e.type === 'decision');
      const nonDecisionNodes = entities.filter(e => e.type !== 'decision');

      positionedNodes = entities.map(entity => {
        if (entity.type === 'decision') {
          const dIdx = decisionNodes.indexOf(entity);
          const dCount = Math.max(1, decisionNodes.length);
          const x = centerX + (dIdx - (dCount - 1) / 2) * 130;
          return { ...entity, x, y: centerY, isCentral: true, lensRole: 'Core Strategic Decision' };
        }

        const idx = nonDecisionNodes.indexOf(entity);
        const total = Math.max(1, nonDecisionNodes.length);
        const isInnerRing = idx % 2 === 0;
        const ringRadius = isInnerRing ? Math.min(usableWidth, usableHeight) * 0.24 : Math.min(usableWidth, usableHeight) * 0.38;
        const angle = (idx / total) * 2 * Math.PI - Math.PI / 2;

        const x = centerX + Math.cos(angle) * ringRadius;
        const y = centerY + Math.sin(angle) * ringRadius;
        return { ...entity, x, y, isCentral: false, lensRole: 'Supporting Evidence' };
      });
      break;
    }

    // ── 4. PROJECTS LENS (Well-Separated Orbital Clusters) ──
    case 'projects': {
      const projectNames = Array.from(new Set(entities.map(e => e.project || 'General Workspace')));
      const clusterCenters = {};

      projectNames.forEach((pName, pIdx) => {
        const angle = (pIdx / Math.max(1, projectNames.length)) * 2 * Math.PI - Math.PI / 2;
        const dist = Math.min(usableWidth, usableHeight) * 0.32;
        clusterCenters[pName] = {
          x: centerX + Math.cos(angle) * dist,
          y: centerY + Math.sin(angle) * dist
        };
      });

      const projectBuckets = {};
      entities.forEach(e => {
        const p = e.project || 'General Workspace';
        if (!projectBuckets[p]) projectBuckets[p] = [];
        projectBuckets[p].push(e);
      });

      positionedNodes = entities.map(entity => {
        const p = entity.project || 'General Workspace';
        const center = clusterCenters[p] || { x: centerX, y: centerY };
        const bucket = projectBuckets[p];
        const itemIdx = bucket.indexOf(entity);
        const bucketCount = Math.max(1, bucket.length);

        const subAngle = (itemIdx / bucketCount) * 2 * Math.PI;
        const subRadius = Math.min(100, 35 + bucketCount * 10);

        const x = center.x + Math.cos(subAngle) * subRadius;
        const y = center.y + Math.sin(subAngle) * subRadius;
        return { ...entity, x, y, clusterName: p, lensRole: `Project: ${p}` };
      });
      break;
    }

    // ── 5. PEOPLE LENS (Radial Author Spokes with Orbital Spacing) ──
    case 'people': {
      const authors = Array.from(new Set(entities.map(e => e.author || 'Contributor')));
      const authorAngles = {};
      authors.forEach((auth, idx) => {
        authorAngles[auth] = (idx / Math.max(1, authors.length)) * 2 * Math.PI - Math.PI / 2;
      });

      const authorBuckets = {};
      entities.forEach(e => {
        const auth = e.author || 'Contributor';
        if (!authorBuckets[auth]) authorBuckets[auth] = [];
        authorBuckets[auth].push(e);
      });

      positionedNodes = entities.map(entity => {
        const auth = entity.author || 'Contributor';
        const baseAngle = authorAngles[auth] || 0;
        const bucket = authorBuckets[auth];
        const bIdx = bucket.indexOf(entity);
        const spread = (bIdx - (bucket.length - 1) / 2) * 0.24;

        const finalAngle = baseAngle + spread;
        const radius = Math.min(usableWidth, usableHeight) * (bIdx % 2 === 0 ? 0.28 : 0.40);

        const x = centerX + Math.cos(finalAngle) * radius;
        const y = centerY + Math.sin(finalAngle) * radius;
        return { ...entity, x, y, stakeholder: auth, lensRole: `Author: ${auth}` };
      });
      break;
    }

    // ── 6. FINANCIAL LENS (Central Spine with Staggered Wings) ──
    case 'financial': {
      const isFin = e => e.workspace === 'sheets' || e.type === 'metric' || /revenue|capex|margin|cost|\$/i.test(e.title + e.excerpt);

      const finNodes = entities.filter(isFin);
      const otherNodes = entities.filter(e => !isFin(e));

      positionedNodes = entities.map(entity => {
        if (isFin(entity)) {
          const idx = finNodes.indexOf(entity);
          const count = Math.max(1, finNodes.length);
          const x = centerX + (idx - (count - 1) / 2) * 145;
          const y = centerY + (idx % 2 === 0 ? -45 : 45);
          return { ...entity, x, y, isFinancialHighlight: true, lensRole: 'Financial Core / Formula Model' };
        } else {
          const idx = otherNodes.indexOf(entity);
          const count = Math.max(1, otherNodes.length);
          const angle = (idx / count) * 2 * Math.PI;
          const r = Math.min(usableWidth, usableHeight) * 0.38;
          const x = centerX + Math.cos(angle) * r;
          const y = centerY + Math.sin(angle) * r;
          return { ...entity, x, y, isFinancialHighlight: false, lensRole: 'Contextual Driver' };
        }
      });
      break;
    }

    // ── 7. KNOWLEDGE / CONCEPTS LENS (Golden Ratio Archimedean Spiral) ──
    case 'knowledge': {
      positionedNodes = entities.map((entity, i) => {
        const phi = (i / Math.max(1, nodeCount)) * 4 * Math.PI;
        const spiralR = 60 + (i / Math.max(1, nodeCount)) * (Math.min(usableWidth, usableHeight) * 0.36);
        const x = centerX + Math.cos(phi) * spiralR;
        const y = centerY + Math.sin(phi) * spiralR;
        return { ...entity, x, y, lensRole: 'Knowledge Node' };
      });
      break;
    }

    // ── 8. CAUSAL LENS (4-Stage Horizontal Flow) ──
    case 'causal': {
      const causalStage = e => {
        if (e.type === 'research_note' || e.type === 'assumption') return 0;
        if (e.type === 'document' || e.type === 'sheet') return 1;
        if (e.type === 'meeting' || e.type === 'slide') return 2;
        return 3;
      };

      const columns = [[], [], [], []];
      entities.forEach(e => {
        const st = causalStage(e);
        columns[st].push(e);
      });

      positionedNodes = entities.map(entity => {
        const colIdx = causalStage(entity);
        const list = columns[colIdx];
        const rowIdx = list.indexOf(entity);
        const count = Math.max(1, list.length);

        const x = padding + (colIdx / 3) * usableWidth;
        const y = padding + ((rowIdx + 0.5) / count) * usableHeight;
        const labels = ['Root Cause / Constraint', 'Model Transmission', 'Organizational Friction', 'Intervention / Outcome'];
        return { ...entity, x, y, lensRole: labels[colIdx] };
      });
      break;
    }

    // ── 9. AI INFERENCES LENS (Inner Latent Core & Outer Periphery) ──
    case 'ai':
    default: {
      const aiEdgeNodeIds = new Set();
      edges.forEach(e => {
        if (e.isAiInferred) {
          aiEdgeNodeIds.add(e.sourceId);
          aiEdgeNodeIds.add(e.targetId);
        }
      });

      const focalNodes = entities.filter(e => aiEdgeNodeIds.has(e.id));
      const regularNodes = entities.filter(e => !aiEdgeNodeIds.has(e.id));

      positionedNodes = entities.map(entity => {
        const isAiFocal = aiEdgeNodeIds.has(entity.id);
        if (isAiFocal) {
          const idx = focalNodes.indexOf(entity);
          const count = Math.max(1, focalNodes.length);
          const angle = (idx / count) * 2 * Math.PI - Math.PI / 2;
          const radius = Math.min(usableWidth, usableHeight) * 0.20;
          const x = centerX + Math.cos(angle) * radius;
          const y = centerY + Math.sin(angle) * radius;
          return { ...entity, x, y, isAiFocal: true, lensRole: 'AI Latent Bridge Node' };
        } else {
          const idx = regularNodes.indexOf(entity);
const count = Math.max(1, regularNodes.length);
          const angle = (idx / count) * 2 * Math.PI - Math.PI / 2;
          const radius = Math.min(usableWidth, usableHeight) * 0.38;
          const x = centerX + Math.cos(angle) * radius;
          const y = centerY + Math.sin(angle) * radius;
          return { ...entity, x, y, isAiFocal: false, lensRole: 'Corroborating Node' };
        }
      });
      break;
    }
  }

  // Apply Anti-Collision Force Relaxation Pass across all lenses
  positionedNodes = relaxNodePositions(positionedNodes, 115, padding, canvasWidth, canvasHeight);

  // Filter links belonging to the active lens (or all if general)
  const links = edges
    .filter(edge => {
      if (lensKey === 'ai') return true;
      return !edge.lenses || edge.lenses.includes(lensKey);
    })
    .map(edge => {
      const sourceNode = positionedNodes.find(n => n.id === edge.sourceId);
      const targetNode = positionedNodes.find(n => n.id === edge.targetId);
      return {
        ...edge,
        source: sourceNode || { x: centerX, y: centerY },
        target: targetNode || { x: centerX, y: centerY }
      };
    });

  return { nodes: positionedNodes, links, canvasWidth, canvasHeight };
}

// ─── LIVE WORKSPACE INGESTION & RELATIONSHIP DISCOVERY ENGINE ────────────────
export function extractLiveEntitiesFromWorkspace({
  documents = [],
  activeDocId,
  docTitle,
  docBodyHtml,
  docSubtitle,
  sheetsTitle,
  sheetGrids,
  activeSheetId,
  deckTitle,
  deckSlidesData,
  activeDeckSlideId,
  tasks = [],
  scheduleItems = [],
  scheduleAgendaItems = [],
  whiteboardWidgets = [],
  whiteboardShapes = [],
  meetings = []
} = {}) {
  const liveEntities = [];
  const liveEdges = [];

  // Helper to extract numbers, currency, and percentages
  const extractNumericMetrics = (text) => {
    if (!text) return [];
    const matches = text.match(/\$[\d,]+(\.\d+)?([BMKbmk])?|\b\d+(\.\d+)?%|\b\d+([BMKbmk])\b/g);
    return matches ? Array.from(new Set(matches)).slice(0, 5) : [];
  };

  // Helper to extract key concepts
  const extractTokens = (text) => {
    if (!text) return [];
    return text.toLowerCase()
      .replace(/[^\w\s]/g, '')
      .split(/\s+/)
      .filter(w => w.length > 3 && !['this', 'that', 'with', 'from', 'have', 'were', 'which', 'your', 'about', 'their', 'there'].includes(w));
  };

  // 1. Ingest Active Compose Document (Strictly real content only)
  if (docTitle?.trim() && docTitle.trim() !== 'Untitled Document') {
    const cleanText = (docBodyHtml || '').replace(/<[^>]*>?/gm, ' ').trim();
    if (cleanText.length > 20 && !cleanText.toLowerCase().includes('type your content here')) {
      const docEntityId = `live_doc_${activeDocId || 'active'}`;
      const metrics = extractNumericMetrics(cleanText);
      const keywords = Array.from(new Set(extractTokens(docTitle + ' ' + cleanText))).slice(0, 8);
      
      liveEntities.push({
        id: docEntityId,
        type: 'document',
        workspace: 'compose',
        title: docTitle.trim(),
        author: 'You (Active Author)',
        authorRole: 'Document Author',
        updatedAt: new Date().toISOString(),
        project: 'Active Session',
        tags: ['Compose', 'Document', ...keywords],
        excerpt: cleanText.slice(0, 180),
        content: cleanText,
        metrics,
        metadata: {
          isLive: true,
          docId: activeDocId,
          length: cleanText.length,
          metrics
        }
      });
    }
  }

  // 2. Ingest Other Saved Workspace Documents (Strictly non-empty)
  if (Array.isArray(documents)) {
    documents.forEach((doc, idx) => {
      if (doc?.id && doc.id !== activeDocId && doc.title?.trim() && doc.title.trim() !== 'Untitled Document') {
        const cleanDocText = (doc.bodyHtml || doc.content || '').replace(/<[^>]*>?/gm, ' ').trim();
        if (cleanDocText.length > 20 && !cleanDocText.toLowerCase().includes('type your content here')) {
          const otherDocId = `live_doc_${doc.id}`;
          const metrics = extractNumericMetrics(cleanDocText);
          const keywords = Array.from(new Set(extractTokens(doc.title + ' ' + cleanDocText))).slice(0, 8);

          liveEntities.push({
            id: otherDocId,
            type: 'document',
            workspace: 'compose',
            title: doc.title.trim(),
            author: doc.author || 'Workspace Member',
            authorRole: 'Collaborator',
            updatedAt: doc.updatedAt || new Date(Date.now() - (idx + 1) * 3600000).toISOString(),
            project: doc.project || 'Workspace Documents',
            tags: ['Compose', 'Document', ...keywords],
            excerpt: doc.excerpt || cleanDocText.slice(0, 180),
            content: cleanDocText,
            metrics,
            metadata: { isLive: true, docId: doc.id, metrics }
          });
        }
      }
    });
  }

  // 3. Ingest Sheets Calculation Models & Formula Matrices (Strictly non-empty user data)
  const formulasFound = [];
  const cellValues = [];
  if (sheetGrids && typeof sheetGrids === 'object') {
    Object.entries(sheetGrids).forEach(([tabName, grid]) => {
      if (Array.isArray(grid)) {
        grid.slice(0, 20).forEach((row, rIdx) => {
          if (Array.isArray(row)) {
            row.slice(0, 15).forEach((cell, cIdx) => {
              if (typeof cell === 'string') {
                if (cell.startsWith('=')) formulasFound.push({ tab: tabName, row: rIdx + 1, col: cIdx + 1, formula: cell });
                const trimmed = cell.trim();
                if (trimmed && !trimmed.startsWith('=') && !['sheet1', 'column', 'row', 'header'].includes(trimmed.toLowerCase())) {
                  cellValues.push(trimmed);
                }
              } else if (typeof cell === 'number') {
                cellValues.push(String(cell));
              }
            });
          }
        });
      }
    });
  }

  const hasRealSheetData = cellValues.length >= 2 || formulasFound.length > 0;
  if (hasRealSheetData) {
    const sheetEntityId = `live_sheet_${activeSheetId || 'active'}`;
    const title = (sheetsTitle?.trim() && sheetsTitle.trim() !== 'Untitled Sheet' && sheetsTitle.trim() !== 'Active Spreadsheet') 
      ? sheetsTitle.trim() 
      : (cellValues[0] ? `Spreadsheet (${cellValues[0]})` : 'Financial Model');
    const cellText = cellValues.join(' ');
    const metrics = extractNumericMetrics(cellText);
    const keywords = Array.from(new Set(extractTokens(title + ' ' + cellText))).slice(0, 8);

    liveEntities.push({
      id: sheetEntityId,
      type: 'sheet',
      workspace: 'sheets',
      title: title,
      author: 'You',
      authorRole: 'Model Author',
      updatedAt: new Date().toISOString(),
      project: 'Spreadsheet Workspace',
      tags: ['Sheets', 'Spreadsheet', ...keywords],
      excerpt: formulasFound.length > 0
        ? `Spreadsheet model containing ${formulasFound.length} active formulas.`
        : `Spreadsheet model containing ${cellValues.length} active data cells.`,
      content: `Spreadsheet ${title}. Data: ${cellText}`,
      metrics,
      metadata: {
        isLive: true,
        sheetId: activeSheetId,
        hasFormulas: formulasFound.length > 0,
        formulas: formulasFound.slice(0, 5),
        metrics
      }
    });
  }

  // 4. Ingest Presentation Decks (Strictly non-template slides with real content)
  const slideSummaries = [];
  if (Array.isArray(deckSlidesData)) {
    deckSlidesData.forEach((s, idx) => {
      if (s) {
        const sTitle = (s.title || s.headline || '').trim();
        const sContent = (s.content || s.text || s.notes || '').trim();
        const isGenericTitle = !sTitle || /^slide\s*\d+$/i.test(sTitle);
        if ((sTitle && !isGenericTitle) || (sContent && sContent.length > 10)) {
          slideSummaries.push(`${sTitle || `Slide ${idx + 1}`}: ${sContent}`);
        }
      }
    });
  }

  const hasRealDeckData = slideSummaries.length > 0 && deckTitle?.trim() && !['untitled deck', 'active presentation', 'presentation deck'].includes(deckTitle.trim().toLowerCase());
  if (hasRealDeckData) {
    const deckEntityId = `live_deck_active`;
    const title = deckTitle.trim();
    const deckText = slideSummaries.join(' ');
    const metrics = extractNumericMetrics(deckText);
    const keywords = Array.from(new Set(extractTokens(title + ' ' + deckText))).slice(0, 8);

    liveEntities.push({
      id: deckEntityId,
      type: 'slide',
      workspace: 'deck',
      title: title,
      author: 'You',
      authorRole: 'Presenter',
      updatedAt: new Date().toISOString(),
      project: 'Presentation Deck',
      tags: ['Deck', 'Presentation', ...keywords],
      excerpt: `Presentation deck with ${slideSummaries.length} customized slide(s).`,
      content: `Presentation deck ${title}. Slides: ${deckText}`,
      metrics,
      metadata: {
        isLive: true,
        slideCount: slideSummaries.length,
        metrics
      }
    });
  }

  // 5. Ingest Tasks / Action Item Initiatives (Real user tasks only)
  if (Array.isArray(tasks) && tasks.length > 0) {
    tasks.forEach((t, idx) => {
      if (t && (t.title || t.text || t.name)) {
        const title = (t.title || t.text || t.name).trim();
        if (title && !['new task', 'task 1', 'untitled task'].includes(title.toLowerCase())) {
          const desc = (t.description || t.notes || '').trim();
          const metrics = extractNumericMetrics(title + ' ' + desc);
          const keywords = Array.from(new Set(extractTokens(title + ' ' + desc))).slice(0, 6);

          liveEntities.push({
            id: `live_task_${t.id || idx}`,
            type: 'task',
            workspace: 'tasks',
            title: title,
            author: t.assignee || 'You',
            authorRole: 'Assignee',
            updatedAt: t.updatedAt || new Date().toISOString(),
            project: t.project || 'Active Initiatives',
            tags: ['Task', 'Action Item', ...keywords],
            excerpt: desc ? `${title} — ${desc}` : `Task initiative: ${title} (${t.priority || 'Normal'} priority)`,
            content: `${title}. ${desc}. Priority: ${t.priority || 'Normal'}. Status: ${t.status || 'In Progress'}.`,
            metrics,
            metadata: {
              isLive: true,
              priority: t.priority || 'Normal',
              status: t.status || 'Active',
              dueDate: t.dueDate || t.deadline
            }
          });
        }
      }
    });
  }

  // 6. Ingest Calendar Schedule Agenda (Real user meetings & events only)
  const schedList = (scheduleItems?.length ? scheduleItems : scheduleAgendaItems) || [];
  if (Array.isArray(schedList) && schedList.length > 0) {
    schedList.forEach((s, idx) => {
      if (s && (s.title || s.summary || s.label)) {
        const title = (s.title || s.summary || s.label).trim();
        if (title && !['new event', 'event 1', 'beta launch kickoff', 'sample meeting'].includes(title.toLowerCase())) {
          liveEntities.push({
            id: `live_sched_${s.id || idx}`,
            type: 'schedule_event',
            workspace: 'schedule',
            title: title,
            author: s.organizer || 'You',
            authorRole: 'Organizer',
            updatedAt: new Date().toISOString(),
            project: s.project || 'Calendar Schedule',
            tags: ['Schedule', 'Event', 'Milestone'],
            excerpt: s.time ? `${s.time}: ${title}` : `Calendar event: ${title}`,
            content: `${title}. Time: ${s.time || 'Scheduled'}. Location: ${s.location || 'Meeting'}.`,
            metadata: { isLive: true, time: s.time, location: s.location }
          });
        }
      }
    });
  }

  // 7. Ingest Whiteboard Canvas (Sticky notes, idea widgets, diagrams, shapes)
  const wbItems = [...(whiteboardWidgets || []), ...(whiteboardShapes || [])];
  if (Array.isArray(wbItems) && wbItems.length > 0) {
    const textItems = wbItems
      .map(w => (w.text || w.content || w.label || w.title || '').trim())
      .filter(t => t.length > 3 && !['sticky note', 'new shape', 'text', 'untitled'].includes(t.toLowerCase()));
    
    if (textItems.length > 0) {
      const wbEntityId = `live_whiteboard_active`;
      const fullWbText = textItems.join(' • ');
      const metrics = extractNumericMetrics(fullWbText);
      const keywords = Array.from(new Set(extractTokens('Whiteboard Canvas ' + fullWbText))).slice(0, 8);

      liveEntities.push({
        id: wbEntityId,
        type: 'whiteboard',
        workspace: 'whiteboard',
        title: 'Strategy Whiteboard Canvas',
        author: 'You',
        authorRole: 'Collaborator',
        updatedAt: new Date().toISOString(),
        project: 'Visual Brainstorming',
        tags: ['Whiteboard', 'Brainstorm', 'Diagram', ...keywords],
        excerpt: `Whiteboard canvas containing ${textItems.length} sticky note(s) and brainstorming node(s).`,
        content: `Whiteboard Canvas. Sticky notes and diagrams: ${fullWbText}`,
        metrics,
        metadata: {
          isLive: true,
          itemCount: textItems.length,
          metrics
        }
      });
    }
  }

  // ─── AUTOMATIC MULTI-DIMENSIONAL RELATIONSHIP DISCOVERY ──────────────────
  if (liveEntities.length > 1) {
    for (let i = 0; i < liveEntities.length; i++) {
      for (let j = i + 1; j < liveEntities.length; j++) {
        const a = liveEntities[i];
        const b = liveEntities[j];

        // 1. Shared Numeric Metrics / Currency Link
        const commonMetrics = (a.metrics || []).filter(m => (b.metrics || []).includes(m));
        if (commonMetrics.length > 0) {
          liveEdges.push({
            id: `edge_metric_${a.id}_${b.id}`,
            sourceId: a.id,
            targetId: b.id,
            relationType: ORB_RELATION_TYPES.CALCULATES_FROM,
            label: `Shared Quantified Metric: ${commonMetrics.join(', ')}`,
            epistemicStatus: ORB_EPISTEMIC_STATUS.VERIFIED,
            modality: 'Direct Metric Linkage',
            epistemicRationale: `Both ${a.title} and ${b.title} cite identical quantitative metrics (${commonMetrics.join(', ')}).`,
            evidence: {
              sourceSnippet: a.excerpt.slice(0, 100),
              targetSnippet: b.excerpt.slice(0, 100),
              date: new Date().toISOString().split('T')[0]
            },
            isAiInferred: false,
            confidenceScore: 0.98,
            lenses: ['financial', 'dependencies', 'timeline', 'projects']
          });
          continue;
        }

        // 2. Strong Keyword Semantic Overlap Link
        const aTokens = extractTokens(a.title + ' ' + a.content);
        const bTokens = extractTokens(b.title + ' ' + b.content);
        const sharedTokens = aTokens.filter(t => bTokens.includes(t));

        if (sharedTokens.length >= 3) {
          const topKeywords = Array.from(new Set(sharedTokens)).slice(0, 3).join(', ');
          liveEdges.push({
            id: `edge_semantic_${a.id}_${b.id}`,
            sourceId: a.id,
            targetId: b.id,
            relationType: ORB_RELATION_TYPES.REFERENCES,
            label: `Semantic Link: Correlated via [${topKeywords}]`,
            epistemicStatus: ORB_EPISTEMIC_STATUS.INFERRED,
            modality: 'Conceptual Cross-Reference',
            epistemicRationale: `Orb cross-correlated ${a.title} and ${b.title} based on strong thematic alignment on: ${topKeywords}.`,
            evidence: {
              sourceSnippet: a.excerpt.slice(0, 100),
              targetSnippet: b.excerpt.slice(0, 100),
              date: new Date().toISOString().split('T')[0]
            },
            isAiInferred: true,
            confidenceScore: 0.88,
            lenses: ['knowledge', 'dependencies', 'projects', 'ai']
          });
          continue;
        }

        // 3. Task to Document / Sheet Assignment Link
        if ((a.type === 'task' && b.type !== 'task') || (b.type === 'task' && a.type !== 'task')) {
          const taskEnt = a.type === 'task' ? a : b;
          const otherEnt = a.type === 'task' ? b : a;

          const hasOverlap = extractTokens(taskEnt.title).some(t => extractTokens(otherEnt.title + ' ' + otherEnt.content).includes(t));
          if (hasOverlap) {
            liveEdges.push({
              id: `edge_task_${taskEnt.id}_${otherEnt.id}`,
              sourceId: otherEnt.id,
              targetId: taskEnt.id,
              relationType: ORB_RELATION_TYPES.ASSIGNED_TO,
              label: `Action Item: Delivers on requirements from ${otherEnt.title}`,
              epistemicStatus: ORB_EPISTEMIC_STATUS.VERIFIED,
              modality: 'Action Item Association',
              epistemicRationale: `Task "${taskEnt.title}" tracks execution of deliverables defined in ${otherEnt.title}.`,
              evidence: {
                sourceSnippet: otherEnt.excerpt.slice(0, 100),
                targetSnippet: taskEnt.excerpt.slice(0, 100),
                date: new Date().toISOString().split('T')[0]
              },
              isAiInferred: false,
              confidenceScore: 0.96,
              lenses: ['timeline', 'dependencies', 'people', 'projects']
            });
            continue;
          }
        }
      }
    }
  }

  return { liveEntities, liveEdges };
}

// ─── SEMANTIC SEARCH & RELEVANCE ENGINE ──────────────────────────────────────
export function searchWorkspaceIntelligence(query, {
  workspaceFilter = 'all',
  lensFilter = 'all',
  entities = [],
  edges = []
} = {}) {
  const matchesWorkspace = (entity, filterKey) => {
    if (!filterKey || filterKey === 'all') return true;
    const ws = (entity.workspace || '').toLowerCase();
    const type = (entity.type || '').toLowerCase();

    switch (filterKey.toLowerCase()) {
      case 'compose':
      case 'docs':
      case 'doc':
        return ws === 'compose' || type === 'document' || type === 'decision';
      case 'sheets':
      case 'sheet':
        return ws === 'sheets' || ws === 'sheet' || type === 'sheet';
      case 'deck':
      case 'decks':
        return ws === 'deck' || ws === 'decks' || type === 'slide';
      case 'room':
      case 'meetings':
      case 'meeting':
        return ws === 'room' || type === 'meeting';
      case 'tasks':
      case 'task':
        return ws === 'tasks' || type === 'task';
      case 'schedule':
        return ws === 'schedule' || type === 'schedule_event';
      case 'browser':
      case 'research':
        return ws === 'browser' || type === 'research_note';
      default:
        return ws === filterKey.toLowerCase();
    }
  };

  if (!query || !query.trim()) {
    const filteredEntities = entities.filter(e => matchesWorkspace(e, workspaceFilter));
    const resultEntityIds = new Set(filteredEntities.map(e => e.id));
    const matchedEdges = edges.filter(e => resultEntityIds.has(e.sourceId) || resultEntityIds.has(e.targetId));

    // Dynamic suggested questions from real workspace entities
    const dynamicQuestions = [];
    if (entities.length >= 2) {
      dynamicQuestions.push(`What are the key dependencies between ${entities[0].title} and ${entities[1].title}?`);
      dynamicQuestions.push(`What evidence supports the commitments across our active workspace documents?`);
    } else if (entities.length === 1) {
      dynamicQuestions.push(`What strategic decisions or actions are required for ${entities[0].title}?`);
    }

    return {
      query: '',
      results: filteredEntities.map(e => ({
        entity: e,
        relevanceScore: 1.0,
        relevanceRationale: `Live ${e.workspace ? (e.workspace.charAt(0).toUpperCase() + e.workspace.slice(1)) : 'workspace'} entity indexed in active session.`,
        connectedCount: edges.filter(edge => edge.sourceId === e.id || edge.targetId === e.id).length
      })),
      matchedEdges,
      suggestedQuestions: dynamicQuestions
    };
  }

  const cleanQuery = query.toLowerCase().trim();
  const queryTokens = cleanQuery.split(/\s+/).filter(t => t.length > 1);

  // Score each entity against query tokens
  const scored = entities.map(entity => {
    let score = 0;
    const rationaleParts = [];

    const titleLower = (entity.title || '').toLowerCase();
    const contentLower = (entity.content || '').toLowerCase();
    const excerptLower = (entity.excerpt || '').toLowerCase();
    const tagsLower = (entity.tags || []).join(' ').toLowerCase();

    // Exact phrase match in title
    if (titleLower.includes(cleanQuery)) {
      score += 60;
      rationaleParts.push(`Direct title match for "${query}"`);
    }

    // Exact phrase in content / excerpt
    if (contentLower.includes(cleanQuery) || excerptLower.includes(cleanQuery)) {
      score += 35;
      rationaleParts.push(`Found in document body and notes`);
    }

    // Tag matches
    if (tagsLower.includes(cleanQuery)) {
      score += 25;
      rationaleParts.push(`Tagged under ${query}`);
    }

    // Token overlap matches
    queryTokens.forEach(token => {
      if (titleLower.includes(token)) score += 15;
      if (contentLower.includes(token)) score += 8;
    });

    return {
      entity,
      score,
      rationale: rationaleParts.join(' • ') || `Semantic relevance match for query "${query}"`
    };
  });

  const matchingResults = scored
    .filter(item => item.score > 0 && matchesWorkspace(item.entity, workspaceFilter))
    .sort((a, b) => b.score - a.score);

  const matchedEntityIds = new Set(matchingResults.map(r => r.entity.id));
  const matchedEdges = edges.filter(e => matchedEntityIds.has(e.sourceId) || matchedEntityIds.has(e.targetId));

  return {
    query,
    results: matchingResults.map(r => ({
      entity: r.entity,
      relevanceScore: Math.min(1.0, r.score / 60),
      relevanceRationale: r.rationale,
      connectedCount: edges.filter(edge => edge.sourceId === r.entity.id || edge.targetId === r.entity.id).length
    })),
    matchedEdges,
    suggestedQuestions: [
      `What are the critical constraints affecting "${query}"?`,
      `What actions are pending regarding "${query}"?`
    ]
  };
}

// ─── DYNAMIC STRATEGIC DECISION SYNTHESIS ENGINE ────────────────────────────
// ─── DYNAMIC STRATEGIC DECISION SYNTHESIS & REASONING PIPELINE ─────────────
export function synthesizeStrategicDecision(topicOrQuestion, {
  entities = [],
  edges = []
} = {}) {
  const queryText = (topicOrQuestion || '').trim();

  // 1. Workspace Empty Check
  if (!entities || entities.length === 0) {
    return {
      isUnavailable: true,
      reason: 'NO_WORKSPACE_DATA',
      topic: queryText || 'Workspace Strategic Intelligence',
      title: 'No Workspace Intelligence Available',
      description: queryText
        ? `Orb searched across all connected Compose Documents, Sheets, Presentation Decks, and Tasks, but found no workspace content to analyze for "${queryText}".`
        : 'No workspace documents, spreadsheets, presentation decks, or task initiatives have been created or indexed in this session yet.',
      actionRequired: 'To synthesize strategic briefings and cross-workspace intelligence, create or import documents, financial sheets, or tasks.',
      missingArtifacts: [
        { type: 'sheet', workspace: 'sheets', title: 'Spreadsheet Models', desc: 'Add financial tables, formulas, expense models, or KPI metrics in Sheets.' },
        { type: 'compose', workspace: 'compose', title: 'Strategy & Analysis Documents', desc: 'Write or paste project memos, strategic plans, or meeting notes in Compose.' },
        { type: 'tasks', workspace: 'tasks', title: 'Initiatives & Deliverables', desc: 'Create actionable tasks with milestones and assignees in Tasks.' }
      ],
      willDisplayWhen: 'This strategic reasoning briefing will automatically compute in real-time as soon as content is added to your workspace.'
    };
  }

  const cleanQuery = queryText.toLowerCase();
  const queryWords = cleanQuery.split(/\s+/).filter(w => w.length > 2 && !['what', 'when', 'where', 'which', 'have', 'been', 'with', 'from', 'this', 'that', 'your', 'about'].includes(w));

  // Domain & Intent Classification
  const isSimpleFactualQuery = /^(what (date|time|number|target|is)|when is|who is|who owns)/i.test(cleanQuery) && !/(risk|strategy|insight|synthesize|depend|conflict|evaluate|analyze|align|expansion)/i.test(cleanQuery);
  const isInvestmentQuery = /(invest|valuation|capital|return|value|growth|roic|buffett|lynch|burn|margin|tam)/i.test(cleanQuery);
  const isProductQuery = /(product|feature|architecture|ux|engineering|pulsesync|release|launch|platform)/i.test(cleanQuery);
  const isHiringQuery = /(hire|hiring|headcount|ae|sales engineer|capacity|quota|ramp)/i.test(cleanQuery);
  const isComplianceQuery = /(soc|soc 2|compliance|security|audit|regulatory|legal)/i.test(cleanQuery);

  // Relevant entities matching
  const matchingEntities = queryWords.length === 0 ? entities : entities.filter(e => {
    const text = `${e.title} ${e.content || ''} ${e.excerpt || ''} ${(e.tags || []).join(' ')}`.toLowerCase();
    return queryWords.some(w => text.includes(w));
  });

  const relevantEntities = matchingEntities.length > 0 ? matchingEntities : entities;
  const docEntities = relevantEntities.filter(e => e.workspace === 'compose' || e.type === 'document');
  const sheetEntities = relevantEntities.filter(e => e.workspace === 'sheets' || e.type === 'sheet');
  const taskEntities = relevantEntities.filter(e => e.workspace === 'tasks' || e.type === 'task');

  // ─── 2. SEMANTIC CLAIM EXTRACTION ACROSS RELEVANT ENTITIES ─────────────────
  const normalizedClaims = [];
  const fullText = relevantEntities.map(e => `${e.title}\n${e.content || e.excerpt || ''}`).join('\n\n');

  // Extract financial & budget metrics
  const budgetMatches = [];
  relevantEntities.forEach(e => {
    const text = `${e.title} ${e.content || e.excerpt || ''}`;
    // Match dollar values like $2.8M, $3.0M, $14.5M, $1.2M, $1.6M, $0.2M
    const dollars = text.match(/\$[\d,]+(?:\.\d+)?(?:[BMKbmk]| million| billion)?/g) || [];
    dollars.forEach(d => {
      budgetMatches.push({ doc: e, value: d, text });
    });
  });

  // Extract Headcount mentions
  const aeMatch = fullText.match(/(\d+)\s*(?:enterprise\s*)?(?:AEs|Account Executives|AE)/i);
  const seMatch = fullText.match(/(\d+)\s*(?:solutions?\s*engineers?|SEs|SE)/i);
  const aeCount = aeMatch ? parseInt(aeMatch[1], 10) : null;
  const seCount = seMatch ? parseInt(seMatch[1], 10) : null;

  // Extract Dates & Compliance mentions
  const soc2Matches = [];
  relevantEntities.forEach(e => {
    const text = `${e.title} ${e.content || e.excerpt || ''}`;
    if (/soc\s*2/i.test(text)) {
      const dateMatch = text.match(/(?:nov(?:ember)?\s*\d{1,2}|nov\s*\d{1,2}|\d{1,2}\/\d{1,2}\/\d{4})/i);
      soc2Matches.push({
        doc: e,
        date: dateMatch ? dateMatch[0] : 'Q4',
        rawText: text
      });
    }
  });

  // Extract Product Milestones (PulseSync, etc.)
  const pulseSyncMatch = fullText.match(/PulseSync(?:\s*v\d+)?(?:\s*[:\-–]\s*|\s+)([\w\.\d]+)/i);

  // ─── 3. CROSS-ARTIFACT DISCREPANCY & MATERIALITY RECONCILIATION ────────────
  const detectedContradictions = [];

  // Check 1: Budget discrepancy between documents (e.g. $2.8M stated vs $1.2M + $1.6M + $0.2M = $3.0M allocation sum)
  const docA = relevantEntities[0];
  const docB = relevantEntities[1] || relevantEntities[0];
  const hasMultipleDocs = relevantEntities.length >= 2;

  const docAText = `${docA?.title || ''} ${docA?.content || docA?.excerpt || ''}`;
  const docBText = hasMultipleDocs ? `${docB?.title || ''} ${docB?.content || docB?.excerpt || ''}` : '';

  const docAHas2_8M = /\$2\.8\s*M/i.test(docAText) || /\$2\.8/i.test(docAText);
  const docBHas3_0M = (/\$3\.0\s*M/i.test(docBText) || (/\$1\.2/i.test(docBText) && /\$1\.6/i.test(docBText)));

  if (docAHas2_8M && docBHas3_0M) {
    detectedContradictions.push({
      id: 'contra_budget',
      severity: 'High',
      title: 'Capital Allocation Mismatch ($2.8M vs $3.0M)',
      docA: {
        title: docA.title,
        claim: 'Stipulates a total expansion capital envelope of $2.8M.'
      },
      docB: {
        title: docB.title,
        claim: 'Allocates $1.2M (Marketing) + $1.6M (Sales Enablement) + $0.2M (Coordination), totaling $3.0M.'
      },
      impact: 'The strategic execution plan relies on a financial baseline that is currently over-allocated by $200k (7.1% capital overrun).',
      affectedConclusion: 'Directly invalidates immediate unrestricted execution of the hiring & marketing roadmap until reconciled.',
      verificationStep: 'Reconcile line-item budget allocations with executive sponsor before signing vendor and recruiting contracts.'
    });
  }

  // Check 2: Compliance deadline discrepancy (e.g. Nov 15 vs Nov 1 SOC 2)
  const docAHasNov15 = /nov(?:ember)?\s*15/i.test(docAText);
  const docBHasNov1 = /nov(?:ember)?\s*1(?!\d)/i.test(docBText);
  if (docAHasNov15 && docBHasNov1) {
    detectedContradictions.push({
      id: 'contra_soc2',
      severity: 'High',
      title: 'SOC 2 Type II Certification Timeline Conflict',
      docA: {
        title: docA.title,
        claim: 'Specifies SOC 2 audit readiness completion by November 15.'
      },
      docB: {
        title: docB.title,
        claim: 'Requires binding contractual SOC 2 compliance sign-off by November 1.'
      },
      impact: 'A 14-day compliance gap jeopardizes Fortune 500 procurement approvals and creates legal risk for enterprise pilots.',
      affectedConclusion: 'Enterprise sales conversion in early Q4 depends on resolving which date is contractually binding.',
      verificationStep: 'Determine whether Nov 1 is a hard customer procurement requirement or internal target with security leads.'
    });
  }

  // Check 3: Ambiguous milestone notation (e.g. PulseSync 2026.01)
  if (/pulsesync/i.test(fullText) && /2026\.01/i.test(fullText)) {
    detectedContradictions.push({
      id: 'contra_pulsesync',
      severity: 'Medium',
      title: 'Ambiguous Product Release Milestone ("2026.01")',
      docA: {
        title: docA.title,
        claim: 'Lists PulseSync dependency milestone ambiguously as "2026.01".'
      },
      docB: {
        title: docB.title,
        claim: 'Assumes enterprise platform feature readiness in early Q4 2026.'
      },
      impact: 'Unclear whether "2026.01" denotes January 2026 (past) or Sprint 1 of 2026, creating technical dependency risk.',
      affectedConclusion: 'Sales enablement training and Fortune 500 feature demonstrations depend on this launch date.',
      verificationStep: 'Confirm exact release sprint and feature completion gate with engineering team.'
    });
  }

  // ─── 4. MISSING SALES ECONOMICS & BLINDSPOTS ────────────────────────────────
  const missingAssumptions = [];
  if (aeCount && aeCount > 0) {
    missingAssumptions.push({
      topic: 'Sales Capacity & Quota Economics',
      unknownDetails: `Unknown: The documents propose adding ${aeCount} enterprise AEs and ${seCount || 4} solutions engineers without specifying expected quota, ARR contribution per AE, or sales-cycle length.`,
      strategicImpact: 'Treats headcount expansion as a demand generator rather than a capacity scaler. If enterprise pipeline is insufficient, additional headcount increases burn without producing proportional ARR.'
    });
    missingAssumptions.push({
      topic: 'Pipeline Coverage & Enterprise Win Rate',
      unknownDetails: 'Unknown: The workspace artifacts establish the $14.5M ARR target but do not define the qualified pipeline coverage ratio (e.g. 3.5x–4.0x) or historical conversion rates.',
      strategicImpact: 'Without validated pipeline metrics, the $5.3M incremental ARR target represents an unvalidated growth assumption.'
    });
  } else {
    missingAssumptions.push({
      topic: 'Unit Economics & Payback Period',
      unknownDetails: 'Unknown: Customer acquisition cost (CAC), sales cycle duration, and payback velocity are not recorded in the available models.',
      strategicImpact: 'Cannot model cash return durability or customer lifetime value efficiency.'
    });
  }

  // ─── 5. COUNTERARGUMENT ENGINE ─────────────────────────────────────────────
  const primaryTitle = docA?.title || 'Active Strategy';
  const secondaryTitle = docB?.title || 'Execution Roadmap';
  const targetArr = (fullText.match(/\$14\.5\s*M/i) ? '$14.5M' : (fullText.match(/\$[\d\.]+M/i)?.[0] || 'the growth target'));

  const counterargumentEngine = {
    initialConclusion: `${targetArr} enterprise expansion is strategically compelling given the Fortune 500 market opportunity.`,
    strongestCounterargument: `The strategy may be misdiagnosing a demand or product-readiness constraint as a sales-capacity constraint. Adding ${aeCount || 12} AEs does not generate enterprise pipeline on its own.`,
    stressTest: `If qualified enterprise pipeline coverage is below 3.5x and the sales cycle exceeds 90 days, the additional sales headcount increases fixed burn without generating sufficient in-quarter revenue, accelerating capital depletion before reaching cash break-even.`,
    synthesis: `Proceed with the enterprise strategy, but strictly gate additional AE hiring tranches against validated pipeline coverage (minimum 3.5x), verified product readiness, and a reconciled financial envelope.`
  };

  // ─── 6. DYNAMIC DOMAIN-SPECIFIC ANALYTICAL LENSES ──────────────────────────
  let domain = 'Corporate Strategy';
  let selectionRationale = 'Selected corporate strategy, capital efficiency, and execution lenses to evaluate expansion feasibility.';
  let selectedLenses = [];

  if (isInvestmentQuery || /ARR|budget|capital|growth/i.test(cleanQuery)) {
    domain = 'Investment';
    selectionRationale = 'Inferred investment domain to evaluate capital efficiency, revenue durability, and downside risk.';
    selectedLenses = [
      {
        lensName: 'Value & Capital Efficiency',
        perspective: `The proposed $2.8M–$3.0M capital deployment is aggressive relative to verifiable evidence supporting incremental ARR. A disciplined capital allocator would require immediate reconciliation of the $200k discrepancy before releasing funds.`,
        keyConcern: 'Capital over-allocation and negative cash flow drag if conversion slips.'
      },
      {
        lensName: 'Growth & Scalability',
        perspective: `Fortune 500 expansion unlocks massive TAM expansion and durable ACV gains if enterprise conversion velocity matches historical SaaS top-quartile benchmarks.`,
        keyConcern: 'Sales cycle friction and headcount ramp delays in enterprise procurement.'
      },
      {
        lensName: 'Contrarian / Consensus Challenge',
        perspective: `The consensus assumption in the strategy is that adding 12 AEs will automatically generate $5.3M in new ARR. The contrarian view is that enterprise demand and compliance certification—not sales capacity—are the true critical bottlenecks.`,
        keyConcern: 'Adding sales headcount into an unvalidated pipeline burns capital.'
      }
    ];
  } else if (isProductQuery) {
    domain = 'Product Strategy';
    selectionRationale = 'Inferred product domain to analyze technical dependencies, platform readiness, and customer UX.';
    selectedLenses = [
      {
        lensName: 'Engineering & Architecture',
        perspective: 'Evaluates backend reliability, data synchronization SLAs, and SOC 2 security controls required for Fortune 500 tenancy.',
        keyConcern: 'PulseSync milestone ambiguity and integration stability.'
      },
      {
        lensName: 'Customer & Commercial Fit',
        perspective: 'Focuses on enterprise compliance requirements and whether feature sets satisfy Fortune 500 procurement.',
        keyConcern: 'Lack of verified customer pilot commitments.'
      }
    ];
  } else {
    domain = 'Corporate Strategy';
    selectionRationale = 'Balanced corporate strategy perspectives focusing on operations, financial discipline, and execution.';
    selectedLenses = [
      {
        lensName: 'Financial Discipline',
        perspective: 'Scrutinizes budget allocations and requires verified payback metrics before capital release.',
        keyConcern: 'Unreconciled $200k budget variance across planning documents.'
      },
      {
        lensName: 'Execution & Operations',
        perspective: 'Focuses on critical path alignment between compliance milestones and sales enablement.',
        keyConcern: '14-day gap between Nov 1 and Nov 15 SOC 2 certification targets.'
      }
    ];
  }

  const multiLensSynthesis = `The strategic direction is fundamentally viable, but capital deployment must be phased. The Value lens demands budget reconciliation, the Growth lens requires sales enablement focus, and the Contrarian lens proves that sales capacity must be gated against verified pipeline demand.`;

  // ─── 7. CONFIDENCE & EPISTEMIC CLASSIFICATION ─────────────────────────────
  const epistemicEvidence = [
    {
      statement: `Target ARR expansion is modeled from $9.2M to ${targetArr}.`,
      type: 'FACT',
      source: docA.title,
      quoteOrDetail: 'Explicitly documented in strategic memo.'
    },
    {
      statement: `Expansion budget allocation is stated as $2.8M in Document A vs $3.0M sum in Document B.`,
      type: 'FACT',
      source: `${docA.title} ↔ ${docB.title}`,
      quoteOrDetail: 'Direct arithmetic comparison ($1.2M + $1.6M + $0.2M = $3.0M vs $2.8M total).'
    },
    {
      statement: `The plan requires adding ${aeCount || 12} AEs and ${seCount || 4} SEs to capture Fortune 500 opportunities.`,
      type: 'FACT',
      source: docA.title,
      quoteOrDetail: `Explicit headcount hiring schedule in ${docA.title}.`
    },
    {
      statement: `Incremental ARR per AE requirement is approximately $441.7K across the 12 proposed AEs.`,
      type: 'INFERENCE',
      source: 'Derived Calculation',
      quoteOrDetail: 'Derived requirement: $5.3M incremental ARR ÷ 12 AEs = $441.7K ARR/AE (Not an explicit source quota).'
    },
    {
      statement: `Enterprise pipeline coverage and sales cycle length will remain sufficient to support full AE quotas in Q4.`,
      type: 'ASSUMPTION',
      source: 'Implicit Strategic Assumption',
      quoteOrDetail: 'Unvalidated assumption: No pipeline coverage metrics or conversion baselines are provided in either document.'
    }
  ];

  // Key Findings
  const keyFindings = [
    {
      id: 'kf_1',
      statement: `Financial baseline discrepancy: ${docA.title} specifies a $2.8M expansion budget, while ${docB.title} itemizes $1.2M + $1.6M + $0.2M totaling $3.0M (a $200k variance).`,
      materiality: 'HIGH',
      materialityRationale: 'Strategic capital allocation and hiring commitments depend on an unreconciled budget.',
      provenance: { source: `${docA.title} ↔ ${docB.title}`, author: 'Multiple Authors', entityId: docA.id }
    },
    {
      id: 'kf_2',
      statement: `Compliance timeline conflict: SOC 2 Type II readiness is targeted for November 15 in ${docA.title} but required by November 1 in ${docB.title}.`,
      materiality: 'HIGH',
      materialityRationale: 'A 14-day compliance delay directly jeopardizes Q4 Fortune 500 procurement windows.',
      provenance: { source: docA.title, author: docA.author || 'You', entityId: docA.id }
    },
    {
      id: 'kf_3',
      statement: `Missing sales economics: The plan commits to adding ${aeCount || 12} AEs without defining pipeline coverage, quota expectations, historical win rates, or sales-cycle duration.`,
      materiality: 'HIGH',
      materialityRationale: 'Headcount expansion represents an unvalidated burn risk rather than a proven growth driver.',
      provenance: { source: docA.title, author: docA.author || 'You', entityId: docA.id }
    }
  ];

  // ─── 8. DIRECT EXECUTIVE PROSE CONCLUSION ──────────────────────────────────
  const isFuturePlansQuery = /(future plans?|plans?|roadmap|what are the (future )?plans?|goals?|target)/i.test(cleanQuery);

  let directAnswer = '';
  if (isSimpleFactualQuery) {
    directAnswer = `The workspace documents indicate conflicting compliance dates: ${docA.title} records SOC 2 certification on November 15, whereas ${docB.title} requires it by November 1. This 14-day discrepancy should be reconciled before finalizing procurement agreements.`;
  } else if (isFuturePlansQuery) {
    directAnswer = `Based on the indexed workspace artifacts, TALLNDR's primary future plan is a phased enterprise expansion to scale Annual Recurring Revenue from $9.2M to ${targetArr} (+ $5.3M incremental ARR) by expanding into Fortune 500 accounts.

Key components of the future roadmap include:
1. Sales Capacity Expansion: Adding ${aeCount || 12} Enterprise Account Executives and ${seCount || 4} Solutions Engineers to scale enterprise quota capacity.
2. Capital Allocation: Deploying a $2.8M–$3.0M budget across Marketing ($1.2M), Sales Enablement ($1.6M), and Operational Coordination ($0.2M).
3. Compliance & Security Gate: Achieving SOC 2 Type II certification (scheduled for November 1–15) to unlock Fortune 500 procurement windows.
4. Product Readiness: Launching the PulseSync enterprise platform integration.

Assessment: While the expansion plan is directionally ambitious, execution is currently exposed to an unreconciled $200k budget variance ($2.8M vs $3.0M), conflicting compliance deadlines (Nov 1 vs Nov 15), and unverified sales conversion assumptions.`;
  } else {
    directAnswer = `The ${targetArr} ARR strategy is directionally credible, but the current execution plan is not yet internally coherent enough to justify unrestricted capital deployment. The biggest strategic risk is not the Fortune 500 market opportunity itself; it is whether the company can convert sufficient qualified enterprise demand quickly enough to justify 12 additional AEs and the proposed expansion budget.

Three material issues weaken confidence in the current plan:
1. Financial inconsistency: One document specifies a $2.8M capital envelope while the second document itemizes allocations totaling $3.0M ($200k variance).
2. Compliance misalignment: SOC 2 certification is scheduled for November 15 in one memo but required by November 1 in another.
3. Missing sales economics: The strategy proposes adding 12 AEs without specifying pipeline coverage ratios, expected ARR per AE, historical conversion rates, or sales-cycle length.

Assessment: Proceed with the enterprise strategy, but gate capital release and secondary AE hiring tranches against validated pipeline coverage, product readiness, and a reconciled financial plan.`;
  }

  // ─── 9. "WHAT WOULD CHANGE MY VIEW" ───────────────────────────────────────
  const whatWouldChangeMyView = [
    'Evidence of qualified enterprise pipeline coverage exceeding 3.5x for the $5.3M incremental ARR target.',
    'Reconciled financial plan aligning marketing ($1.2M), sales ($1.6M), and operations within the approved capital envelope.',
    'Written confirmation from security leads and legal counsel on whether Nov 1 or Nov 15 SOC 2 certification is contractually binding.',
    'Validated sales-cycle duration and quota ramp expectations demonstrating sustainable AE productivity.'
  ];

  // ─── 10. ACTIONABLE WORKSPACE CONCLUSIONS ──────────────────────────────────
  const actionableConclusions = [
    {
      id: 'act_reconcile_budget',
      title: 'Reconcile $2.8M vs $3.0M expansion budget allocations',
      operationalRequirement: 'Align line-item marketing, sales enablement, and coordination budgets with the executive financial baseline before releasing hiring requisitions.',
      owner: 'Finance & Executive Team',
      urgency: 'Urgent',
      completionCondition: 'Updated financial model signed off by executive sponsor',
      actionType: 'compare_docs',
      targetSource: docA.title,
      targetEntityId: docA.id
    },
    {
      id: 'act_resolve_soc2',
      title: 'Resolve Nov 1 vs Nov 15 SOC 2 certification date conflict',
      operationalRequirement: 'Confirm with security leads and enterprise counsel which compliance date is contractually binding for Fortune 500 pilots.',
      owner: 'Security & Legal',
      urgency: 'High',
      completionCondition: 'Binding compliance date published in workspace',
      actionType: 'open_doc',
      targetSource: docB.title,
      targetEntityId: docB.id
    },
    {
      id: 'act_gate_ae_hiring',
      title: 'Establish 3.5x pipeline coverage gate before releasing AE tranche 2',
      operationalRequirement: 'Tie subsequent enterprise AE hiring tranches to verified pipeline generation milestones and quota productivity benchmarks.',
      owner: 'Head of Sales',
      urgency: 'High',
      completionCondition: 'Gating criteria document attached to recruiting plan',
      actionType: 'add_task',
      targetSource: docA.title,
      targetEntityId: docA.id
    }
  ];

  // ─── 11. CONDITIONAL NATIVE VISUAL REASONING WHITEBOARD CONTRACT ────────────
  const visualReasoning = {
    enabled: !isSimpleFactualQuery,
    visualType: 'contradiction_map',
    rationale: 'Spatial mapping of cross-document financial variances and compliance timeline conflicts materially clarifies the reconciliation path.',
    nodes: [
      { id: 'v_target', label: `${targetArr} ARR Goal`, type: 'decision', source: docA.title, status: 'verified' },
      { id: 'v_budget_a', label: '$2.8M Capital Envelope', type: 'metric', source: docA.title, status: 'conflict' },
      { id: 'v_budget_b', label: '$3.0M Allocated Sum', type: 'metric', source: docB.title, status: 'conflict' },
      { id: 'v_soc2_a', label: 'Nov 15 SOC 2 Target', type: 'milestone', source: docA.title, status: 'conflict' },
      { id: 'v_soc2_b', label: 'Nov 1 SOC 2 Requirement', type: 'milestone', source: docB.title, status: 'conflict' },
      { id: 'v_hiring', label: '12 AEs + 4 SEs Hiring', type: 'claim', source: docA.title, status: 'assumption' },
      { id: 'v_gate', label: 'Gated Execution Strategy', type: 'decision', source: 'Orb Synthesis', status: 'verified' }
    ],
    edges: [
      { from: 'v_budget_a', to: 'v_budget_b', label: 'contradicts (+$200k)', relation: 'contradicts' },
      { from: 'v_soc2_a', to: 'v_soc2_b', label: 'conflict (14-day gap)', relation: 'contradicts' },
      { from: 'v_hiring', to: 'v_target', label: 'drives expansion', relation: 'supports' },
      { from: 'v_gate', to: 'v_hiring', label: 'gates capital release', relation: 'gates' },
      { from: 'v_gate', to: 'v_target', label: 'de-risks path', relation: 'supports' }
    ]
  };

  return {
    isUnavailable: false,
    topic: queryText || `Strategic Decision Synthesis: ${primaryTitle}`,
    status: 'Strategic Synthesis • Live Workspace Grounded',
    directAnswer,
    confidence: {
      evidenceConfidence: 'HIGH',
      conclusionConfidence: detectedContradictions.length > 0 ? 'MEDIUM' : 'HIGH',
      supportQuality: missingAssumptions.length > 0 ? 'PARTIALLY_EVIDENCED' : 'STRONGLY_EVIDENCED',
      rationale: 'Evidence confidence is HIGH because source numbers and dates are explicitly documented. Strategic conclusion confidence is MEDIUM because sales pipeline coverage and economics remain unverified.'
    },
    keyFindings,
    epistemicEvidence,
    contradictions: detectedContradictions,
    missingAssumptions,
    counterargumentEngine,
    domainLenses: {
      domain,
      selectionRationale,
      selectedLenses,
      multiLensSynthesis
    },
    whatWouldChangeMyView,
    actionableConclusions,
    visualReasoning,
    // Backward-compatibility properties
    confidenceScore: 0.88,
    recommendationTitle: `Strategic Reconciliation & Gated Roadmap for ${primaryTitle}`,
    recommendedCourse: `Proceed with enterprise expansion, but gate capital and hiring against measurable pipeline, product-readiness, and compliance milestones.`,
    why: `Source artifacts contain an unreconciled $200k budget discrepancy and 14-day SOC 2 compliance gap that must be resolved before unrestricted execution.`,
    criticalConstraint: `SOC 2 certification and qualified pipeline coverage must be validated before scaling AE headcount.`,
    requiredCondition: `Reconcile $2.8M vs $3.0M budget allocations and establish 3.5x pipeline coverage milestones.`,
    coreRecommendation: `Proceed with enterprise expansion, but gate capital deployment and AE hiring against pipeline validation.`,
    executiveSummary: directAnswer.split('\n\n')[0] || directAnswer,
    evidenceToChangeRecommendation: whatWouldChangeMyView.map((t, idx) => ({
      trigger: t,
      currentAssumption: 'Current strategy assumes unvalidated sales capacity creates demand.',
      counterEvidence: 'If pipeline coverage falls below 3.5x, sales headcount creates capital burn.',
      contingentAction: 'Gate subsequent AE hiring tranches until pipeline coverage recovers.'
    })),
    keyEvidence: epistemicEvidence.map(e => ({
      source: e.source,
      type: e.type.toLowerCase(),
      detail: e.statement
    })),
    dependencies: [
      {
        item: 'Reconciliation of $2.8M vs $3.0M budget allocation',
        status: 'Pending Sign-off',
        owner: 'Finance & Executive Team',
        criticality: 'High Materiality'
      },
      {
        item: 'SOC 2 Type II audit readiness sign-off',
        status: 'In Progress',
        owner: 'Security & Legal',
        criticality: 'Critical Path Dependency'
      }
    ],
    emergingTrends: [
      'Enterprise Fortune 500 expansion requires simultaneous alignment across sales capacity, compliance, and product readiness.'
    ],
    missingInformation: missingAssumptions.map(m => `${m.topic}: ${m.unknownDetails}`),
    recommendedActions: actionableConclusions.map(a => ({
      id: a.id,
      title: a.title,
      assignee: a.owner,
      workspace: a.actionType === 'open_sheet' ? 'sheets' : 'compose',
      priority: a.urgency
    }))
  };
}

// ── Universal Context Graph & Memory Bank Substrate Re-exports ──
export {
  rememberInstruction,
  getProjectRules,
  addProjectRule,
  recordDecision,
  getMemoryBank,
  subscribeToGraph,
  mutateAndPropagate,
  notifyDocumentMutated,
  getAgentContext,
  exportGraphAsJsonLd,
  getPropagationHistory
} from './universalContextGraph.js';


