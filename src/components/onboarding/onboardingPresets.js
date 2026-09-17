export const ONBOARDING_INTENT_PRESETS = {
  new: {
    id: 'intent-preset-new',
    title: 'Product Launch Initiative 2026',
    subtitle: 'Strategic execution plan for the next-generation workspace rollout',
    mode: 'compose',
    initiatives: [
      { id: 1, name: 'Core Architecture Review', owner: 'Executive Engineering', timeline: 'Week 1 - 2', status: 'Completed' },
      { id: 2, name: 'Private Preview Deployment', owner: 'Product & Design', timeline: 'Week 3 - 4', status: 'In Progress' },
      { id: 3, name: 'Customer Feedback Synthesis', owner: 'Operations Team', timeline: 'Week 5', status: 'Planned' },
      { id: 4, name: 'Public Enterprise Release', owner: 'Go-to-Market', timeline: 'Week 6 - 8', status: 'Planned' }
    ],
    bodyHtml: `<h2>Executive Summary</h2><p>This initiative outlines the core objectives, deliverables, and operational timelines for rolling out the next generation of our product. Our core metric is achieving a <strong>45% reduction in time-to-first-value</strong> for all incoming team members.</p><h2>Core Objectives</h2><ul><li><strong>Intent-Centric Workflow:</strong> Automate document configuration based on project context rather than manual setup.</li><li><strong>Unified Collaborative Intelligence:</strong> Integrate contextual reasoning directly into the editing canvas via Regaarder AI.</li><li><strong>Performance Benchmarks:</strong> Maintain sub-16ms interactive latency across all editing modes.</li></ul><h2>Key Milestones & Deliverables</h2><p>Review the active initiatives table above to track ongoing status and lead owners. Type <code>/</code> anywhere below to add team notes or ask Regaarder AI to draft operational procedures.</p>`,
    suggestedNextAction: 'Want me to draft the customer announcement letter for this initiative?'
  },
  analyze: {
    id: 'intent-preset-analyze',
    title: 'Market Analysis & Performance Metrics',
    subtitle: 'Consolidated performance overview, growth cohorts, and financial trajectory',
    mode: 'compose',
    initiatives: [
      { id: 1, name: 'Q1 Cohort Retention', owner: 'Data Intelligence', timeline: 'Quarter 1', status: 'Completed' },
      { id: 2, name: 'CAC to LTV Optimization', owner: 'Growth & Strategy', timeline: 'Quarter 2', status: 'In Progress' },
      { id: 3, name: 'Competitive Matrix Audit', owner: 'Market Research', timeline: 'Quarter 2', status: 'In Progress' },
      { id: 4, name: 'Annual Forecasting Model', owner: 'Finance Ops', timeline: 'Quarter 3', status: 'Planned' }
    ],
    bodyHtml: `<h2>Strategic Market Overview</h2><p>Recent benchmarking demonstrates accelerated retention and higher engagement across teams utilizing AI-assisted collaborative surfaces. The current trajectory projects sustained <strong>18% month-over-month expansion</strong>.</p><h2>Key Performance Indicators (Q1 - Q2)</h2><table style='width: 100%; border-collapse: collapse; margin: 16px 0; font-size: 13px;'><thead><tr style='border-bottom: 2px solid rgba(0,0,0,0.08); text-align: left;'><th style='padding: 8px 12px;'>Metric / Pillar</th><th style='padding: 8px 12px;'>Current Baseline</th><th style='padding: 8px 12px;'>Q2 Target</th><th style='padding: 8px 12px;'>Pacing</th></tr></thead><tbody><tr style='border-bottom: 1px solid rgba(0,0,0,0.05);'><td style='padding: 8px 12px; font-weight: 500;'>Active User Retention</td><td style='padding: 8px 12px;'>68.4%</td><td style='padding: 8px 12px; font-weight: 600;'>80.0%</td><td style='padding: 8px 12px; color: #16a34a; font-weight: 600;'>+11.6%</td></tr><tr style='border-bottom: 1px solid rgba(0,0,0,0.05);'><td style='padding: 8px 12px; font-weight: 500;'>Time-to-First-Outcome</td><td style='padding: 8px 12px;'>4.2 min</td><td style='padding: 8px 12px; font-weight: 600;'>&lt; 1.0 min</td><td style='padding: 8px 12px; color: #16a34a; font-weight: 600;'>On Track</td></tr><tr style='border-bottom: 1px solid rgba(0,0,0,0.05);'><td style='padding: 8px 12px; font-weight: 500;'>Net Revenue Expansion</td><td style='padding: 8px 12px;'>118%</td><td style='padding: 8px 12px; font-weight: 600;'>135%</td><td style='padding: 8px 12px; color: #2563eb; font-weight: 600;'>In Progress</td></tr></tbody></table><h2>Executive Observations</h2><p>Data indicates that users who activate with a pre-configured template retain at twice the rate of those encountering blank workspaces.</p>`,
    suggestedNextAction: 'Want me to run a comparative risk analysis on these growth cohorts?'
  },
  plan: {
    id: 'intent-preset-plan',
    title: 'Operational Execution Sprint',
    subtitle: 'Cross-functional deliverables, owner assignments, and sprint milestones',
    mode: 'compose',
    initiatives: [
      { id: 1, name: 'Sprint Goal Alignment', owner: 'Team Lead', timeline: 'Monday 09:00', status: 'Completed' },
      { id: 2, name: 'Interface Polishing & HIG Pass', owner: 'Design Lead', timeline: 'Wednesday 17:00', status: 'In Progress' },
      { id: 3, name: 'End-to-End Test Suite Pass', owner: 'QA & Platform', timeline: 'Thursday 15:00', status: 'Planned' },
      { id: 4, name: 'Release Tag & Staging Smoke', owner: 'DevOps Ops', timeline: 'Friday 12:00', status: 'Planned' }
    ],
    bodyHtml: `<h2>Sprint Focus & Ground Rules</h2><p>The goal of this execution cycle is absolute delivery discipline: zero blockers, immediate escalation of regressions, and continuous progress validation.</p><h2>Sprint Scope</h2><ul><li><strong>Scope Locked:</strong> No feature creep after Wednesday standup.</li><li><strong>Design Fidelity:</strong> All modal corners, outlines, and spacing must conform strictly to Apple HIG standards.</li><li><strong>Live Testing:</strong> Validate all changes with real data in both dark and light modes.</li></ul><h2>Blocker Triage & Escalations</h2><p>Log any emerging risks directly below. You can assign owners by highlighting their name and selecting <em>Assign Task</em> or typing <code>/task</code>.</p>`,
    suggestedNextAction: 'Want me to generate a daily standup checklist based on these sprint items?'
  },
  organize: {
    id: 'intent-preset-organize',
    title: 'Workspace Knowledge & Project Directory',
    subtitle: 'Central repository of active team documentation, briefs, and team guidelines',
    mode: 'compose',
    initiatives: [
      { id: 1, name: 'Workspace Architecture Index', owner: 'Architecture', timeline: 'Ongoing', status: 'Completed' },
      { id: 2, name: 'Design System & Token Library', owner: 'Brand & UX', timeline: 'Active', status: 'In Progress' },
      { id: 3, name: 'Engineering Runbooks', owner: 'Systems Team', timeline: 'Updated Weekly', status: 'In Progress' },
      { id: 4, name: 'Onboarding Playbook', owner: 'People & Culture', timeline: 'Next Cycle', status: 'Planned' }
    ],
    bodyHtml: `<h2>Welcome to your Central Workspace</h2><p>This directory serves as the single source of truth for our teams active initiatives, project briefs, and reference materials. Everything is interconnected and searchable in real time.</p><h2>Active Workstreams</h2><ul><li><strong>Product & Design:</strong> Interface standards, user research repositories, and Figma prototypes.</li><li><strong>Engineering:</strong> Architecture directives, API bindings, and deployment verification.</li><li><strong>Operations:</strong> Strategic agendas, executive briefings, and meeting notes.</li></ul><h2>Quick Shortcuts</h2><p>Use <code>Cmd+K</code> or the global search to find any document instantly. Press <code>/</code> to insert new sub-sections, embed tables, or organize ideas with collapsible lists.</p>`,
    suggestedNextAction: 'Want me to synthesize an organizational index for your existing team documents?'
  }
};

export function createCustomIntentPreset(freeTextQuery) {
  const queryClean = (freeTextQuery || '').trim();
  const title = queryClean.length > 0 
    ? queryClean.charAt(0).toUpperCase() + queryClean.slice(1)
    : 'New Focused Project';

  return {
    id: 'intent-preset-custom-' + Date.now(),
    title: title,
    subtitle: 'AI-prepared workspace tailored for: "' + (queryClean || 'Focused Execution') + '"',
    mode: 'compose',
    initiatives: [
      { id: 1, name: 'Project Scoping & Discovery', owner: 'Project Lead', timeline: 'Phase 1', status: 'Completed' },
      { id: 2, name: 'Execute ' + title, owner: 'Core Team', timeline: 'Phase 2', status: 'In Progress' },
      { id: 3, name: 'Review & Polish', owner: 'Leadership', timeline: 'Phase 3', status: 'Planned' }
    ],
    bodyHtml: `<h2>Objective</h2><p>This workspace has been tailored to help you accomplish: <strong>` + (queryClean || 'your goal') + `</strong>; All relevant tools and contextual aids are prepared for immediate execution.</p><h2>Initial Structure</h2><ul><li><strong>Defined Scope:</strong>; Identify primary constraints and high-impact deliverables.</li><li><strong>Action Plan:</strong> Assign key deadlines and track progress in real time.</li><li><strong>Next Steps:</strong>; Leverage Regaarder AI to expand, analyze, or synthesize details as you write.</li></ul><h2>Notes & Drafts</h2><p>Start writing here. Press <code>/</code> to access AI commands, formatting tools, and tables.</p>`,
    suggestedNextAction: 'Want me to outline a step-by-step action plan for "' + title + '"?'
  };
}
