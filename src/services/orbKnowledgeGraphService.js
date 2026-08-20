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

// ─── LIVE WORKSPACE INGESTION HELPER ─────────────────────────────────────────
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
  meetings = []
}) {
  const liveEntities = [];
  const liveEdges = [];

  // 1. Ingest current Compose Document
  if (docTitle?.trim()) {
    const cleanText = (docBodyHtml || '').replace(/<[^>]*>?/gm, ' ').trim();
    const docEntityId = `live_doc_${activeDocId || 'current'}`;
    
    liveEntities.push({
      id: docEntityId,
      type: 'document',
      workspace: 'compose',
      title: docTitle.trim(),
      author: 'You (Active Session)',
      authorRole: 'Author',
      updatedAt: new Date().toISOString(),
      project: 'Active Session',
      tags: ['Live', 'Compose', 'Document', ...extractKeywords(docTitle + ' ' + cleanText)],
      excerpt: cleanText.slice(0, 180) || (docSubtitle || 'Active live document in editor...'),
      content: cleanText || docTitle,
      metadata: {
        isLive: true,
        docId: activeDocId,
        length: cleanText.length
      }
    });

    // Ingest other saved documents
    documents.forEach((doc, idx) => {
      if (doc.id && doc.id !== activeDocId && doc.title?.trim()) {
        const otherDocId = `live_doc_${doc.id}`;
        liveEntities.push({
          id: otherDocId,
          type: 'document',
          workspace: 'compose',
          title: doc.title,
          author: 'Workspace Member',
          authorRole: 'Collaborator',
          updatedAt: doc.updatedAt || new Date(Date.now() - (idx + 1) * 3600000).toISOString(),
          project: 'Workspace Documents',
          tags: ['Compose', 'Document', ...extractKeywords(doc.title)],
          excerpt: doc.excerpt || `Saved document in workspace: ${doc.title}`,
          content: doc.content || doc.title,
          metadata: { isLive: true, docId: doc.id }
        });
      }
    });
  }

  // 2. Ingest current Sheets Model
  if (sheetsTitle?.trim() || sheetGrids) {
    const sheetEntityId = `live_sheet_${activeSheetId || 'current'}`;
    const title = sheetsTitle?.trim() || 'Active Financial Sheet';
    
    liveEntities.push({
      id: sheetEntityId,
      type: 'sheet',
      workspace: 'sheets',
      title: title,
      author: 'You (Active Session)',
      authorRole: 'Analyst',
      updatedAt: new Date().toISOString(),
      project: 'Active Session',
      tags: ['Live', 'Sheets', 'Grid', 'Formulas', ...extractKeywords(title)],
      excerpt: `Active spreadsheet containing formulas, calculation tables, and metrics.`,
      content: `Spreadsheet ${title} with calculation grid.`,
      metadata: {
        isLive: true,
        sheetId: activeSheetId,
        hasFormulas: true
      }
    });
  }

  // 3. Ingest current Deck
  if (deckTitle?.trim() || deckSlidesData?.length) {
    const deckEntityId = `live_deck_active`;
    const title = deckTitle?.trim() || 'Active Presentation Deck';
    
    liveEntities.push({
      id: deckEntityId,
      type: 'slide',
      workspace: 'deck',
      title: title,
      author: 'You (Active Session)',
      authorRole: 'Presenter',
      updatedAt: new Date().toISOString(),
      project: 'Active Session',
      tags: ['Live', 'Deck', 'Presentation', ...extractKeywords(title)],
      excerpt: `Active presentation deck with ${deckSlidesData?.length || 1} slides.`,
      content: `Presentation deck ${title}.`,
      metadata: {
        isLive: true,
        slideCount: deckSlidesData?.length || 1
      }
    });
  }

  return { liveEntities, liveEdges };
}

function extractKeywords(text) {
  if (!text) return [];
  const words = text.toLowerCase()
    .replace(/[^\w\s]/g, '')
    .split(/\s+/)
    .filter(w => w.length > 3 && !['this', 'that', 'with', 'from', 'have', 'were', 'which', 'your', 'about'].includes(w));
  return Array.from(new Set(words)).slice(0, 6);
}

// ─── SEMANTIC SEARCH & RELEVANCE ENGINE ──────────────────────────────────────
export function searchWorkspaceIntelligence(query, {
  workspaceFilter = 'all',
  lensFilter = 'all',
  entities = INITIAL_ORB_ENTITIES,
  edges = INITIAL_ORB_EDGES
} = {}) {
  if (!query || !query.trim()) {
    return {
      query: '',
      results: entities.slice(0, 8).map(e => ({
        entity: e,
        relevanceScore: 1.0,
        relevanceRationale: 'Recent high-impact workspace entity in your organizational memory.',
        connectedCount: edges.filter(edge => edge.sourceId === e.id || edge.targetId === e.id).length
      })),
      matchedEdges: edges,
      suggestedQuestions: [
        'What should I know before expanding Nvidia GPU commitments?',
        'What evidence supports our Q3 revenue forecast of $48.2B?',
        'What are the primary risks associated with Taiwan semiconductor single-sourcing?',
        'What decisions resulted from the Executive Sync on packaging bottlenecks?'
      ]
    };
  }

  const cleanQuery = query.toLowerCase().trim();
  const queryTokens = cleanQuery.split(/\s+/).filter(t => t.length > 1);

  // Score each entity
  const scored = entities.map(entity => {
    let score = 0;
    const rationaleParts = [];

    const titleLower = (entity.title || '').toLowerCase();
    const contentLower = (entity.content || '').toLowerCase();
    const excerptLower = (entity.excerpt || '').toLowerCase();
    const tagsLower = (entity.tags || []).join(' ').toLowerCase();
    const authorLower = (entity.author || '').toLowerCase();
    const projectLower = (entity.project || '').toLowerCase();

    // Exact phrase match in title
    if (titleLower.includes(cleanQuery)) {
      score += 60;
      rationaleParts.push(`Direct title match for "${query}"`);
    }

    // Exact phrase in content / excerpt
    if (contentLower.includes(cleanQuery) || excerptLower.includes(cleanQuery)) {
      score += 35;
      rationaleParts.push(`Explicit mention in content and excerpt`);
    }

    // Tag matches
    if (tagsLower.includes(cleanQuery)) {
      score += 25;
      rationaleParts.push(`Categorized under ${query} topics`);
    }

    // Token overlap matches
    queryTokens.forEach(token => {
      if (titleLower.includes(token)) score += 18;
      if (tagsLower.includes(token)) score += 12;
      if (contentLower.includes(token)) score += 8;
      if (authorLower.includes(token)) score += 15;
      if (projectLower.includes(token)) score += 14;
    });

    // Special concept heuristics
    if (/nvidia|gpu|capex|revenue|h200|b200|blackwell/i.test(cleanQuery) && entity.project === 'GPU Infrastructure 2026') {
      score += 30;
      if (!rationaleParts.length) rationaleParts.push(`Part of GPU Infrastructure & Capex workspace cluster`);
    }
    if (/taiwan|tsmc|semiconductor|cowos|packaging|fab/i.test(cleanQuery) && entity.project === 'Supply Chain Resilience') {
      score += 30;
      if (!rationaleParts.length) rationaleParts.push(`Connected to Taiwan Foundry Resilience & Packaging assessment`);
    }

    // Apply Workspace filter
    if (workspaceFilter !== 'all' && entity.workspace !== workspaceFilter) {
      score = 0;
    }

    // Calculate connected edges
    const connectedEdges = edges.filter(e => e.sourceId === entity.id || e.targetId === entity.id);

    // Formulate intelligent explanation
    let rationale = rationaleParts.join(' • ');
    if (!rationale) {
      if (connectedEdges.length > 0) {
        rationale = `Semantically linked to ${connectedEdges.length} related workspace artifact${connectedEdges.length > 1 ? 's' : ''}`;
      } else {
        rationale = `Matches semantic context around "${query}"`;
      }
    }

    return {
      entity,
      relevanceScore: Math.min(100, score),
      relevanceRationale: rationale,
      connectedCount: connectedEdges.length
    };
  });

  // Filter & sort
  const results = scored
    .filter(item => item.relevanceScore > 10)
    .sort((a, b) => b.relevanceScore - a.relevanceScore);

  // Find all matched edges between top results
  const resultEntityIds = new Set(results.map(r => r.entity.id));
  const matchedEdges = edges.filter(e => resultEntityIds.has(e.sourceId) || resultEntityIds.has(e.targetId));

  // Dynamic suggested strategic questions
  const suggestedQuestions = generateSuggestedQuestions(cleanQuery);

  return {
    query,
    results,
    matchedEdges,
    suggestedQuestions
  };
}

function generateSuggestedQuestions(query) {
  if (/nvidia|revenue|gpu|capex/i.test(query)) {
    return [
      'What evidence supports the $48.2B Q3 Nvidia revenue forecast?',
      'What dependencies could delay our Blackwell GPU deployment?',
      'What decision resulted from the packaging bottleneck meeting?',
      'Who are the key stakeholders on the GPU Infrastructure initiative?'
    ];
  }
  if (/taiwan|tsmc|semiconductor|risk|packaging/i.test(query)) {
    return [
      'What should I know before making a dual-sourcing decision for TSMC?',
      'What are the EBITDA implications of a 30-day Taiwan port disruption?',
      'Which tasks are currently in progress to qualify secondary OSAT packaging?',
      'What contradictions exist between our sheet yield matrix and board deck?'
    ];
  }
  return [
    `What decisions have been made regarding "${query}"?`,
    `What downstream tasks or dependencies rely on "${query}"?`,
    `Which team members have authored content connected to "${query}"?`,
    `What are the financial or timeline impacts of "${query}"?`
  ];
}

// ─── 9 ANALYTICAL LENS COORDINATE LAYOUT ENGINES ─────────────────────────────
export function computeLensLayout(lensKey, entities = [], edges = [], { width = 940, height = 580 } = {}) {
  const nodeCount = entities.length;
  if (!nodeCount) return { nodes: [], links: [] };

  const padding = 70;
  const usableWidth = width - padding * 2;
  const usableHeight = height - padding * 2;

  let positionedNodes = [];

  switch (lensKey) {
    // ── 1. TIMELINE LENS (Horizontal temporal sequence) ──
    case 'timeline': {
      const sorted = [...entities].sort((a, b) => new Date(a.updatedAt) - new Date(b.updatedAt));
      const minTime = new Date(sorted[0]?.updatedAt || '2026-08-10').getTime();
      const maxTime = new Date(sorted[sorted.length - 1]?.updatedAt || '2026-08-20').getTime();
      const timeSpan = Math.max(1, maxTime - minTime);

      positionedNodes = sorted.map((entity, i) => {
        const t = new Date(entity.updatedAt).getTime();
        const progress = (t - minTime) / timeSpan;
        const x = padding + progress * usableWidth;
        // Stagger y to prevent horizontal overlap
        const laneIndex = i % 4;
        const y = padding + 60 + laneIndex * (usableHeight / 4.2);
        return { ...entity, x, y, lensRole: 'Chronological Step' };
      });
      break;
    }

    // ── 2. DEPENDENCIES LENS (Directional DAG: Upstream -> Midstream -> Downstream) ──
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

    // ── 3. DECISIONS LENS (Radial star centered on Decision nodes) ──
    case 'decisions': {
      const decisionNodes = entities.filter(e => e.type === 'decision');
      const nonDecisionNodes = entities.filter(e => e.type !== 'decision');

      const primaryCenter = { x: width / 2, y: height / 2 };

      positionedNodes = entities.map(entity => {
        if (entity.type === 'decision') {
          return { ...entity, x: primaryCenter.x, y: primaryCenter.y, isCentral: true, lensRole: 'Core Decision' };
        }
        const idx = nonDecisionNodes.indexOf(entity);
        const total = Math.max(1, nonDecisionNodes.length);
        const angle = (idx / total) * 2 * Math.PI - Math.PI / 2;
        const radius = Math.min(usableWidth, usableHeight) * 0.40;

        const x = primaryCenter.x + Math.cos(angle) * radius;
        const y = primaryCenter.y + Math.sin(angle) * radius;
        return { ...entity, x, y, isCentral: false, lensRole: 'Supporting Evidence / Context' };
      });
      break;
    }

    // ── 4. PROJECTS LENS (Clustered by project initiative) ──
    case 'projects': {
      const projectNames = Array.from(new Set(entities.map(e => e.project || 'General Workspace')));
      const clusterCenters = {};

      projectNames.forEach((pName, pIdx) => {
        const angle = (pIdx / Math.max(1, projectNames.length)) * 2 * Math.PI - Math.PI / 2;
        const dist = Math.min(usableWidth, usableHeight) * 0.32;
        clusterCenters[pName] = {
          x: width / 2 + Math.cos(angle) * dist,
          y: height / 2 + Math.sin(angle) * dist
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
        const center = clusterCenters[p] || { x: width / 2, y: height / 2 };
        const bucket = projectBuckets[p];
        const itemIdx = bucket.indexOf(entity);
        const bucketCount = Math.max(1, bucket.length);

        const subAngle = (itemIdx / bucketCount) * 2 * Math.PI;
        const subRadius = 85;

        const x = center.x + Math.cos(subAngle) * subRadius;
        const y = center.y + Math.sin(subAngle) * subRadius;
        return { ...entity, x, y, clusterName: p, lensRole: `Project: ${p}` };
      });
      break;
    }

    // ── 5. PEOPLE LENS (Radial grouping around key authors / stakeholders) ──
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
        const spread = (bIdx - (bucket.length - 1) / 2) * 0.22;

        const finalAngle = baseAngle + spread;
        const radius = Math.min(usableWidth, usableHeight) * 0.38;

        const x = width / 2 + Math.cos(finalAngle) * radius;
        const y = height / 2 + Math.sin(finalAngle) * radius;
        return { ...entity, x, y, stakeholder: auth, lensRole: `Author: ${auth}` };
      });
      break;
    }

    // ── 6. FINANCIAL LENS (Emphasizes Sheets, Revenue, Metrics & Formulas) ──
    case 'financial': {
      const isFin = e => e.workspace === 'sheets' || e.type === 'metric' || /revenue|capex|margin|cost|\$/i.test(e.title + e.excerpt);

      const finNodes = entities.filter(isFin);
      const otherNodes = entities.filter(e => !isFin(e));

      positionedNodes = entities.map(entity => {
        if (isFin(entity)) {
          const idx = finNodes.indexOf(entity);
          const count = Math.max(1, finNodes.length);
          const x = width / 2 + (idx - (count - 1) / 2) * 160;
          const y = height / 2 + (idx % 2 === 0 ? -40 : 40);
          return { ...entity, x, y, isFinancialHighlight: true, lensRole: 'Financial Core / Formula Model' };
        } else {
          const idx = otherNodes.indexOf(entity);
          const count = Math.max(1, otherNodes.length);
          const angle = (idx / count) * 2 * Math.PI;
          const r = Math.min(usableWidth, usableHeight) * 0.42;
          const x = width / 2 + Math.cos(angle) * r;
          const y = height / 2 + Math.sin(angle) * r;
          return { ...entity, x, y, isFinancialHighlight: false, lensRole: 'Contextual Driver' };
        }
      });
      break;
    }

    // ── 7. KNOWLEDGE / CONCEPTS LENS (Force topology) ──
    case 'knowledge': {
      positionedNodes = entities.map((entity, i) => {
        const phi = (i / Math.max(1, nodeCount)) * 2 * Math.PI;
        const spiralR = 60 + (i / Math.max(1, nodeCount)) * (Math.min(usableWidth, usableHeight) * 0.38);
        const x = width / 2 + Math.cos(phi) * spiralR;
        const y = height / 2 + Math.sin(phi) * spiralR;
        return { ...entity, x, y, lensRole: 'Knowledge Node' };
      });
      break;
    }

    // ── 8. CAUSAL LENS (Cause -> Intermediate Impact -> Final Consequence) ──
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

    // ── 9. AI INFERENCES LENS (Highlights latent bridges and anomalous links) ──
    case 'ai':
    default: {
      const aiEdgeNodeIds = new Set();
      edges.forEach(e => {
        if (e.isAiInferred) {
          aiEdgeNodeIds.add(e.sourceId);
          aiEdgeNodeIds.add(e.targetId);
        }
      });

      positionedNodes = entities.map((entity, i) => {
        const isAiFocal = aiEdgeNodeIds.has(entity.id);
        const angle = (i / Math.max(1, nodeCount)) * 2 * Math.PI - Math.PI / 2;
        const radius = isAiFocal ? 140 : Math.min(usableWidth, usableHeight) * 0.40;

        const x = width / 2 + Math.cos(angle) * radius;
        const y = height / 2 + Math.sin(angle) * radius;
        return { ...entity, x, y, isAiFocal, lensRole: isAiFocal ? 'AI Latent Bridge Node' : 'Corroborating Node' };
      });
      break;
    }
  }

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
        source: sourceNode || { x: width / 2, y: height / 2 },
        target: targetNode || { x: width / 2, y: height / 2 }
      };
    });

  return { nodes: positionedNodes, links };
}

// ─── DECIDE MODE STRATEGIC SYNTHESIZER ───────────────────────────────────────
export function synthesizeStrategicDecision(topicOrQuestion, {
  entities = INITIAL_ORB_ENTITIES,
  edges = INITIAL_ORB_EDGES
} = {}) {
  const clean = (topicOrQuestion || '').toLowerCase();

  // Scenario 1: Nvidia GPU / Capex / Revenue Decision
  if (/nvidia|gpu|capex|revenue|blackwell|h200|\$48/i.test(clean)) {
    return {
      topic: 'Q3 Nvidia GPU Allocation & Capex Authorization ($48.2B Forecast)',
      executiveSummary: 'Cross-workspace intelligence validates strong hyperscale demand (+28% QoQ), supporting the $48.2B gross revenue target in Sheets. However, single-source packaging bottlenecks at TSMC create a critical delivery slippage risk of $6.7B if secondary packaging is not locked immediately.',
      status: 'Decision Executed • Execution Phase',
      confidenceScore: 0.94,
      keyEvidence: [
        {
          source: 'Compose Strategic Memo (Elena Rostova)',
          type: 'document',
          detail: 'Hyperscale datacenter expansion models 28% quarter-over-quarter accelerator demand growth across top 4 CSPs.'
        },
        {
          source: 'Sheets Model Cell C14 (Alex Vance)',
          type: 'sheet',
          detail: 'Calculates $48.20B gross revenue based on formula =$B$4*(1+$C$2) at 74.8% projected gross margin.'
        },
        {
          source: 'Deck Slide 4 (Board Review)',
          type: 'slide',
          detail: 'Visualizes $32.4B Blackwell B200 and $15.8B H200 revenue distribution across server configurations.'
        },
        {
          source: 'Executive Sync Room Transcript',
          type: 'meeting',
          detail: 'Michelle Chen confirmed 120k wafer baseline but warned that 3-week packaging slippage reduces realized revenue to $41.5B.'
        }
      ],
      contradictions: [
        {
          id: 'contra_1',
          severity: 'High',
          title: 'Packaging Delay Revenue Mismatch',
          description: 'Deck Slide 4 reports an unhedged $48.2B forecast, while the Room transcript audio flags a $6.7B downside risk under TSMC packaging delays.',
          resolution: 'Task assigned to Marcus Vance to finalize ASE Group secondary packaging contract.'
        },
        {
          id: 'contra_2',
          severity: 'Medium',
          title: 'Secondary Sourcing Gross Margin Delta',
          description: 'Sheets model uses 74.8% gross margin based solely on TSMC yields; alternative OSAT packaging adds +$340/die, compressing net margin to 70.6%.',
          resolution: 'Alex Vance to update cell F18 with blend margin formula.'
        }
      ],
      dependencies: [
        {
          item: 'Secondary OSAT wafer agreement with ASE Group',
          status: 'In Progress (Due Sep 10)',
          owner: 'Marcus Vance',
          criticality: 'Blocking Q3 Blackwell Mass Shipping'
        },
        {
          item: '$1.8B binding inventory advance commitment execution',
          status: 'Completed (Board Approved Aug 18)',
          owner: 'Executive Committee',
          criticality: 'Prerequisite for Tier-1 Allocation Priority'
        }
      ],
      emergingTrends: [
        'Tier-1 cloud hyperscalers are transitioning 40% of planned H200 cluster orders to Blackwell B200 configurations.',
        'Secondary advanced packaging qualification cycle times have dropped from 6 months to 75 days across OSAT vendors.'
      ],
      missingInformation: [
        'Confirmed yield rates on 2.5D packaging lines at ASE Kaohsiung facility.',
        'Final power supply unit (PSU) lead times for liquid-cooled rack integrations.'
      ],
      recommendedActions: [
        {
          id: 'rec_act_1',
          title: 'Lock secondary OSAT wafer contract with ASE Group before Sep 10',
          assignee: 'Marcus Vance',
          workspace: 'tasks',
          priority: 'Urgent'
        },
        {
          id: 'rec_act_2',
          title: 'Update Sheets model (cell F18) to reflect blended secondary packaging cost structure',
          assignee: 'Alex Vance',
          workspace: 'sheets',
          priority: 'High'
        },
        {
          id: 'rec_act_3',
          title: 'Schedule Stage 2 supply risk review in Room with Hardware Operations',
          assignee: 'Elena Rostova',
          workspace: 'room',
          priority: 'Medium'
        }
      ]
    };
  }

  // Scenario 2: Taiwan Semiconductor Risk / Dual-Sourcing Decision
  if (/taiwan|tsmc|semiconductor|risk|foundry|fab/i.test(clean)) {
    return {
      topic: 'Taiwan Semiconductor Supply Chain Resilience & Dual-Sourcing Strategy',
      executiveSummary: 'Concentration of 88% leading-edge logic and 92% advanced packaging in Taiwan exposes the enterprise to a $1.4B quarterly EBITDA disruption risk. Sourcing from Intel 18A or Samsung SF2 mitigates geographic exposure but introduces a 12.2% yield gap and +$340/die cost delta.',
      status: 'Under Review • Strategic Decision Required',
      confidenceScore: 0.91,
      keyEvidence: [
        {
          source: 'Browser Geopolitical Briefing (Dr. Sarah Lin)',
          type: 'research_note',
          detail: 'Documents that 92% of world advanced CoWoS packaging capacity is within a 45-mile radius in Western Taiwan.'
        },
        {
          source: 'Procurement Protocol Memo (Marcus Vance)',
          type: 'document',
          detail: 'Mandates an operational ceiling of maximum 60% single-source foundry concentration by Q4 2027.'
        },
        {
          source: 'Sheets Fab Capacity Matrix (Alex Vance)',
          type: 'sheet',
          detail: 'Calculates TSMC Fab 18 yield at 86.4% vs secondary foundries averaging 74.2%, creating a +$340 cost delta per good die.'
        },
        {
          source: 'Deck Risk Briefing Slide 7 (Dr. Sarah Lin)',
          type: 'slide',
          detail: 'Shows 30-day port stoppage scenario generates $1.4B EBITDA disruption across core product lines.'
        }
      ],
      contradictions: [
        {
          id: 'contra_tsmc_1',
          severity: 'High',
          title: 'Target Date vs Qualification Velocity',
          description: 'Procurement Memo targets 60% ceiling by Q4 2027, but current secondary foundry qualification milestones are running 4 months behind schedule.',
          resolution: 'Accelerate engineering wafer test runs at Intel Foundry Services.'
        }
      ],
      dependencies: [
        {
          item: 'Secondary packaging pilot run validation',
          status: 'In Progress',
          owner: 'Hardware Operations',
          criticality: 'Required before board dual-source ratification'
        }
      ],
      emergingTrends: [
        'Arizona Fab 21 tooling installation has reached 78% completion, reducing reliance on Taiwan-only wafer transport.',
        'Customer willingness to absorb 3-5% dual-source resilience premium in multi-year service contracts.'
      ],
      missingInformation: [
        'Definitive wafer pricing contracts for 2nm process nodes beyond 2027.',
        'Thermal dissipation benchmarks on secondary foundry packaging prototypes.'
      ],
      recommendedActions: [
        {
          id: 'rec_tsmc_1',
          title: 'Authorize $45M pilot qualification run with secondary foundry partner',
          assignee: 'Executive Committee',
          workspace: 'compose',
          priority: 'Urgent'
        },
        {
          id: 'rec_tsmc_2',
          title: 'Incorporate blended packaging cost curve into 2027 Long-Range Plan in Sheets',
          assignee: 'Alex Vance',
          workspace: 'sheets',
          priority: 'High'
        }
      ]
    };
  }

  // Default Universal Workspace Synthesis
  return {
    topic: `Strategic Decision Synthesis: "${topicOrQuestion || 'Cross-Workspace Assessment'}"`,
    executiveSummary: `Orb has synthesized relevant intelligence across ${entities.length} workspace artifacts in Compose, Sheets, Deck, Tasks, and Room. Key relationships have been traced across upstream assumptions, quantitative models, and downstream task commitments.`,
    status: 'Synthesized Intelligence • Active',
    confidenceScore: 0.89,
    keyEvidence: entities.slice(0, 4).map(e => ({
      source: `${e.title} (${e.author})`,
      type: e.type,
      detail: e.excerpt || e.content.slice(0, 140)
    })),
    contradictions: [
      {
        id: 'contra_gen_1',
        severity: 'Medium',
        title: 'Cross-App Assumption Alignment',
        description: 'Ensure quantitative models in Sheets dynamically mirror the qualitative targets outlined in the latest Compose memos.',
        resolution: 'Orb real-time sync verified active references.'
      }
    ],
    dependencies: [
      {
        item: 'Cross-functional sign-off across all active workspace owners',
        status: 'Active',
        owner: 'Project Leads',
        criticality: 'Standard Operational Alignment'
      }
    ],
    emergingTrends: [
      'High velocity cross-workspace collaboration between Strategy, Finance, and Engineering.'
    ],
    missingInformation: [
      'External market benchmark validations for long-range 2027 projections.'
    ],
    recommendedActions: [
      {
        id: 'rec_gen_1',
        title: `Review connected knowledge graph in Orb Map mode for "${topicOrQuestion || 'Active Topic'}"`,
        assignee: 'You',
        workspace: 'compose',
        priority: 'High'
      }
    ]
  };
}
