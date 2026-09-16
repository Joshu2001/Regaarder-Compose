/**
 * Regaarder Onboarding Preset Data Generator
 * Provides realistic, populated workspace data tailored to user intent.
 */

export const ONBOARDING_INTENT_PRESETS = {
  new: {
    id: 'intent-preset-new',
    intentId: 'new',
    intentLabel: 'Start something new',
    title: 'Product Launch Plan',
    type: 'Project',
    subtitle: 'Everything you need to plan, research, and execute your product launch.',
    mode: 'compose',
    projectBrief: {
      title: 'Product Launch Plan',
      description: 'A comprehensive plan for our Q4 product launch, including market research, positioning, and go-to-market strategy.',
      docSnippet: `# Launch Strategy Draft

## 1. Market Opportunity
The global market for productivity tools continues to grow, driven by remote work and digital transformation. Our research shows a strong demand for integrated workspace solutions that combine AI with traditional productivity tools.

## 2. Key Differentiators
- **AI-powered context understanding:** Seamless workspace reasoning that adapts to user intent.
- **Seamless integration across apps:** Docs, Sheets, Decks, and Whiteboards unified.
- **Designed for individuals and teams:** Frictionless single-player and multiplayer modes.

## 3. Go-to-Market Milestones
1. Private Beta Launch (Week 1–2)
2. Community Feedback Synthesis (Week 3)
3. Global Public Availability (Week 4)`
    },
    tasks: [
      { id: 't-1', title: 'Finalize product positioning', dueDate: 'Sep 18', completed: true },
      { id: 't-2', title: 'Complete market research', dueDate: 'Sep 20', completed: false },
      { id: 't-3', title: 'Design launch campaign', dueDate: 'Sep 22', completed: false },
      { id: 't-4', title: 'Prepare investor update', dueDate: 'Sep 25', completed: false }
    ],
    marketResearch: {
      title: 'Competitive Analysis',
      updatedText: 'Updated 2h ago',
      metrics: [
        { label: 'TAM Growth', value: '+34%' },
        { label: 'Target Win Rate', value: '42%' }
      ],
      chartData: [20, 35, 48, 65, 82, 95]
    },
    launchTimeline: {
      period: 'Q4 2026',
      milestonesCount: '12 key milestones',
      nextMilestone: 'Beta Tag Release'
    },
    relatedDocs: [
      { id: 'rd-1', title: 'Go-to-Market Strategy', type: 'doc', updated: 'Yesterday' },
      { id: 'rd-2', title: 'Competitive Analysis', type: 'sheet', updated: '3 days ago' },
      { id: 'rd-3', title: 'Executive Pitch Deck', type: 'deck', updated: 'Sep 12' }
    ],
    initiatives: [
      { id: 1, name: 'Finalize product positioning', owner: 'Product Marketing', timeline: 'Sep 18', status: 'Completed' },
      { id: 2, name: 'Complete market research', owner: 'Research & Strategy', timeline: 'Sep 20', status: 'In Progress' },
      { id: 3, name: 'Design launch campaign', owner: 'Brand & Creative', timeline: 'Sep 22', status: 'Planned' },
      { id: 4, name: 'Prepare investor update', owner: 'Executive Team', timeline: 'Sep 25', status: 'Planned' }
    ],
    bodyHtml: `<h1>Launch Strategy</h1><h2>1. Market Opportunity</h2><p>The global market for productivity tools continues to grow, driven by remote work and digital transformation. Our research shows a strong demand for integrated workspace solutions that combine AI with traditional productivity tools.</p><h2>2. Key Differentiators</h2><ul><li><strong>AI-powered context understanding</strong></li><li><strong>Seamless integration across apps</strong></li><li><strong>Designed for individuals and teams</strong></li></ul><h2>3. Execution Plan</h2><p>Collaborate with the go-to-market team to align on messaging, press distribution, and enterprise rollout tiers.</p>`,
    suggestedNextAction: 'Want me to draft the investor press release for this launch?'
  },

  organize: {
    id: 'intent-preset-organize',
    intentId: 'organize',
    intentLabel: 'Organize existing work',
    title: 'Workspace Knowledge & Team Directory',
    type: 'Workspace',
    subtitle: 'Central hub bringing your docs, team files, directories, and ideas together.',
    mode: 'compose',
    projectBrief: {
      title: 'Workspace Knowledge Hub',
      description: 'Single source of truth for active team initiatives, engineering runbooks, and design system resources.',
      docSnippet: `# Team Knowledge Base & Directory

## 1. Structure & Indexing
Every active initiative is cataloged with direct bi-directional links to documents, spreadsheets, and whiteboard assets.

## 2. Core Repositories
- **Engineering Guidelines:** Architecture directives and code standards.
- **Design System:** Apple HIG component specifications and token library.
- **Operations:** Meeting cadences, sprint agendas, and quarterly roadmaps.`
    },
    tasks: [
      { id: 't-1', title: 'Consolidate Q3 team runbooks', dueDate: 'Sep 19', completed: true },
      { id: 't-2', title: 'Archive deprecated specs', dueDate: 'Sep 21', completed: false },
      { id: 't-3', title: 'Verify token library sync', dueDate: 'Sep 24', completed: false },
      { id: 't-4', title: 'Publish onboarding guide', dueDate: 'Sep 28', completed: false }
    ],
    marketResearch: {
      title: 'Knowledge Utilization',
      updatedText: 'Updated 1h ago',
      metrics: [
        { label: 'Active Docs', value: '48' },
        { label: 'Coverage', value: '92%' }
      ],
      chartData: [30, 45, 60, 75, 88, 92]
    },
    launchTimeline: {
      period: 'Annual Cadence',
      milestonesCount: '8 structured hubs',
      nextMilestone: 'Quarterly Knowledge Review'
    },
    relatedDocs: [
      { id: 'rd-1', title: 'Design System Guidelines', type: 'doc', updated: 'Today' },
      { id: 'rd-2', title: 'API & Infrastructure Index', type: 'doc', updated: 'Yesterday' },
      { id: 'rd-3', title: 'Team Directory & Onboarding', type: 'sheet', updated: '3 days ago' }
    ],
    initiatives: [
      { id: 1, name: 'Consolidate team runbooks', owner: 'Operations', timeline: 'Sep 19', status: 'Completed' },
      { id: 2, name: 'Archive deprecated specs', owner: 'Engineering', timeline: 'Sep 21', status: 'In Progress' },
      { id: 3, name: 'Verify token library sync', owner: 'Design', timeline: 'Sep 24', status: 'Planned' }
    ],
    bodyHtml: `<h1>Workspace Knowledge Hub</h1><h2>1. Purpose & Standards</h2><p>This workspace centralizes all critical team documentation, operational workflows, and active directory indexes.</p><h2>2. Active Workstreams</h2><ul><li><strong>Architecture & APIs:</strong> Core engine and data structures.</li><li><strong>Design Principles:</strong> Clean minimalist Apple-tier interface components.</li></ul>`,
    suggestedNextAction: 'Want me to synthesize an organizational index for your existing team documents?'
  },

  analyze: {
    id: 'intent-preset-analyze',
    intentId: 'analyze',
    intentLabel: 'Research or analyze',
    title: 'Market Intelligence & Performance Analysis',
    type: 'Research',
    subtitle: 'Find information, uncover market insights, and compare strategic options.',
    mode: 'compose',
    projectBrief: {
      title: 'Market Intelligence Report',
      description: 'In-depth market synthesis comparing sector trends, competitive positioning, and growth indicators.',
      docSnippet: `# Market Intelligence & Competitive Report

## 1. Executive Summary
Recent cross-platform benchmarking demonstrates accelerated user retention and 38% higher engagement across collaborative surfaces.

## 2. Competitive Matrix
- **Key Competitor A:** Legacy interface, high cognitive load.
- **Key Competitor B:** Strong feature set, lack of integrated AI intelligence.
- **Regaarder Advantage:** Apple-minimalist design, sub-16ms interactive speed, local inference.`
    },
    tasks: [
      { id: 't-1', title: 'Complete competitor pricing audit', dueDate: 'Sep 17', completed: true },
      { id: 't-2', title: 'Synthesize cohort retention data', dueDate: 'Sep 21', completed: false },
      { id: 't-3', title: 'Model CAC to LTV projections', dueDate: 'Sep 23', completed: false },
      { id: 't-4', title: 'Publish executive summary', dueDate: 'Sep 26', completed: false }
    ],
    marketResearch: {
      title: 'Market Growth Vector',
      updatedText: 'Updated 30m ago',
      metrics: [
        { label: 'YoY Growth', value: '+46%' },
        { label: 'Retention', value: '78%' }
      ],
      chartData: [15, 28, 42, 59, 74, 88]
    },
    launchTimeline: {
      period: 'Q3 - Q4 2026',
      milestonesCount: '6 research phases',
      nextMilestone: 'Cohort Deep Dive'
    },
    relatedDocs: [
      { id: 'rd-1', title: 'Competitive Matrix 2026', type: 'sheet', updated: 'Today' },
      { id: 'rd-2', title: 'Cohort Retention Analysis', type: 'sheet', updated: 'Yesterday' },
      { id: 'rd-3', title: 'Strategic Recommendations', type: 'doc', updated: 'Sep 14' }
    ],
    initiatives: [
      { id: 1, name: 'Competitor pricing audit', owner: 'Growth Team', timeline: 'Sep 17', status: 'Completed' },
      { id: 2, name: 'Cohort retention synthesis', owner: 'Data Analytics', timeline: 'Sep 21', status: 'In Progress' },
      { id: 3, name: 'CAC / LTV financial model', owner: 'Finance Ops', timeline: 'Sep 23', status: 'Planned' }
    ],
    bodyHtml: `<h1>Market Intelligence Report</h1><h2>1. Strategic Overview</h2><p>Data indicates significant tailwinds in workspace consolidation. Users demand unified surfaces where context flows seamlessly between documents and analytics.</p><h2>2. Key Findings</h2><ul><li>45% faster time-to-value when guided by intent presets.</li><li>Substantial reduction in context-switching penalties.</li></ul>`,
    suggestedNextAction: 'Want me to run a comparative risk analysis on these growth cohorts?'
  },

  plan: {
    id: 'intent-preset-plan',
    intentId: 'plan',
    intentLabel: 'Plan and execute',
    title: 'Operational Execution Sprint',
    type: 'Execution',
    subtitle: 'Manage tasks, milestones, schedules, and cross-functional team progress.',
    mode: 'compose',
    projectBrief: {
      title: 'Operational Sprint Brief',
      description: 'Sprint delivery plan prioritizing critical path features, quality verification, and milestone deadlines.',
      docSnippet: `# Operational Execution Sprint

## 1. Sprint Objectives
Maintain absolute delivery discipline: zero regressions, immediate escalation of blockers, and continuous validation.

## 2. Core Workstreams
- **Frontend Polish:** Apple HIG compliance, sub-16ms UI responsiveness.
- **System Hardening:** Multi-model inference resilience and IPC optimization.
- **Release Verification:** Staging build validation and smoke testing.`
    },
    tasks: [
      { id: 't-1', title: 'Lock sprint scope & deliverables', dueDate: 'Sep 18', completed: true },
      { id: 't-2', title: 'Execute UI polish & typography pass', dueDate: 'Sep 21', completed: false },
      { id: 't-3', title: 'Run full regression test suite', dueDate: 'Sep 23', completed: false },
      { id: 't-4', title: 'Deploy staging release candidate', dueDate: 'Sep 25', completed: false }
    ],
    marketResearch: {
      title: 'Sprint Velocity',
      updatedText: 'Updated 10m ago',
      metrics: [
        { label: 'Velocity', value: '94%' },
        { label: 'Burn-down', value: 'On Track' }
      ],
      chartData: [10, 30, 50, 70, 85, 96]
    },
    launchTimeline: {
      period: 'Sprint 24',
      milestonesCount: '10 sprint deliverables',
      nextMilestone: 'Code Freeze'
    },
    relatedDocs: [
      { id: 'rd-1', title: 'Sprint Backlog & Burndown', type: 'sheet', updated: 'Today' },
      { id: 'rd-2', title: 'QA Verification Checklist', type: 'doc', updated: 'Today' },
      { id: 'rd-3', title: 'Release Notes Draft', type: 'doc', updated: 'Yesterday' }
    ],
    initiatives: [
      { id: 1, name: 'Scope locking', owner: 'Team Lead', timeline: 'Sep 18', status: 'Completed' },
      { id: 2, name: 'UI polish pass', owner: 'Design Lead', timeline: 'Sep 21', status: 'In Progress' },
      { id: 3, name: 'Regression testing', owner: 'QA Lead', timeline: 'Sep 23', status: 'Planned' }
    ],
    bodyHtml: `<h1>Operational Sprint Plan</h1><h2>1. Focus & Ground Rules</h2><p>This cycle focuses on polish and reliability. All interactive elements must provide immediate sensory feedback with zero layout shifts.</p><h2>2. Ground Rules</h2><ul><li>Zero blocker tolerance.</li><li>Continuous verification in light and dark modes.</li></ul>`,
    suggestedNextAction: 'Want me to generate a daily standup checklist based on these sprint items?'
  }
};

export function createCustomIntentPreset(freeTextQuery) {
  const queryClean = (freeTextQuery || '').trim();
  const title = queryClean.length > 0 
    ? queryClean.charAt(0).toUpperCase() + queryClean.slice(1)
    : 'New Focused Project';

  return {
    id: 'intent-preset-custom-' + Date.now(),
    intentId: 'custom',
    intentLabel: title,
    title: title,
    type: 'Project',
    subtitle: `AI-prepared workspace tailored for: "${title}"`,
    mode: 'compose',
    projectBrief: {
      title: `${title} Overview`,
      description: `Tailored workspace structure, documentation, and milestones designed to execute "${title}".`,
      docSnippet: `# ${title}

## 1. Project Objective
This workspace has been tailored to execute **${title}**. All contextual aids and relevant tool structures are ready for immediate use.

## 2. Key Action Items
- **Define Deliverables:** Set initial constraints and measurable benchmarks.
- **Track Milestones:** Monitor progress across connected documents and tasks.
- **Collaborate with AI:** Use Regaarder AI to draft, analyze, or synthesize details as you work.`
    },
    tasks: [
      { id: 't-1', title: `Scope initial ${title} milestones`, dueDate: 'Sep 19', completed: true },
      { id: 't-2', title: `Draft core ${title} strategy`, dueDate: 'Sep 22', completed: false },
      { id: 't-3', title: 'Review with stakeholders', dueDate: 'Sep 25', completed: false }
    ],
    marketResearch: {
      title: 'Project Momentum',
      updatedText: 'Just created',
      metrics: [
        { label: 'Readiness', value: '100%' },
        { label: 'Status', value: 'Active' }
      ],
      chartData: [20, 40, 60, 80, 95]
    },
    launchTimeline: {
      period: 'Phase 1',
      milestonesCount: '5 key milestones',
      nextMilestone: 'Strategy Kickoff'
    },
    relatedDocs: [
      { id: 'rd-1', title: `${title} Brief`, type: 'doc', updated: 'Just now' },
      { id: 'rd-2', title: `${title} Timeline`, type: 'sheet', updated: 'Just now' }
    ],
    initiatives: [
      { id: 1, name: 'Project Scoping & Discovery', owner: 'Project Lead', timeline: 'Phase 1', status: 'Completed' },
      { id: 2, name: 'Execute ' + title, owner: 'Core Team', timeline: 'Phase 2', status: 'In Progress' },
      { id: 3, name: 'Review & Polish', owner: 'Leadership', timeline: 'Phase 3', status: 'Planned' }
    ],
    bodyHtml: `<h1>${title}</h1><h2>1. Objective</h2><p>This workspace has been configured specifically for <strong>${title}</strong>.</p><h2>2. Next Actions</h2><ul><li>Collaborate on deliverables.</li><li>Press <code>/</code> to invoke contextual AI tools.</li></ul>`,
    suggestedNextAction: `Want me to outline a step-by-step action plan for "${title}"?`
  };
}
