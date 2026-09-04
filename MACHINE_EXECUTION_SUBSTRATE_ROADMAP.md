# Machine Execution Substrate & Universal Context Graph Roadmap

> **Status:** Active Living Architecture Specification & Implementation Roadmap  
> **Repository:** Regaarder Compose / Project MOAT  
> **Core Philosophy:** Human visual ergonomics (Apple-tier minimalism, progressive disclosure) layered seamlessly on top of an AI-native machine execution substrate (token efficiency, structured state, reactive graph propagation, and tool schemas).

---

## 1. The Core Architecture Thesis

Traditional productivity apps (Google Docs, Microsoft Word, Excel) were optimized strictly for **human visual consumption** (pixels, ribbons, nested dialogs, and manual mouse clicks). Bolting an AI chat drawer or "sparkle button" onto human-first apps fails because models waste massive token budgets re-reading unstructured files and break when interacting across application silos.

An **AI-Native Workspace** must be engineered as an execution engine:

```
┌─────────────────────────────────────────────────────────────────────────────┐
│                              HUMAN DIRECTOR                                 │
│        (Sets Intent, Defines Constraints, Visualizes with Apple Ergonomics) │
└──────────────────────────────────────┬──────────────────────────────────────┘
                                       │
┌──────────────────────────────────────▼──────────────────────────────────────┐
│                  UNIVERSAL CONTEXT GRAPH & MEMORY BANK                      │
│             (Persistent State Engine & Reactive Propagation Bus)             │
│                                                                             │
│  • Memory Bank: Instructions, Preferences, Project Rules, Epistemic Decisions│
│  • Reactive Bus: Dependency Tree Traversal (CalculatesFrom, Impacts, Depends)│
│  • Token-Dense Serialization: JSON-LD & Stripped Semantic Feeds for LLMs     │
└──────────────┬───────────────────────┬───────────────────────┬──────────────┘
               │                       │                       │
┌──────────────▼────────┐ ┌────────────▼─────────┐ ┌───────────▼──────────────┐
│  Compose Docs Engine  │ │ Sheets Matrix Engine │ │ Initiatives & Tasks      │
│  (Semantic Content)   │ │ (Calculated Model)   │ │ (Scheduling & Execution) │
└───────────────────────┘ └──────────────────────┘ └──────────────────────────┘
```

---

## 2. Pillar Progress Tracker: From Hybrid to 100% Machine Substrate

| Pillar | Focus Area | Status | Implementation Source Files |
| :--- | :--- | :---: | :--- |
| **Pillar 1** | **Universal Context Graph & Memory Bank** | **100% COMPLETED** | [`universalContextGraph.js`](file:///c:/Users/user/Downloads/Project%20MOAT/Regaarder%20Compose/src/services/universalContextGraph.js), [`orbKnowledgeGraphService.js`](file:///c:/Users/user/Downloads/Project%20MOAT/Regaarder%20Compose/src/services/orbKnowledgeGraphService.js), [`MemoryDashboard.jsx`](file:///c:/Users/user/Downloads/Project%20MOAT/Regaarder%20Compose/src/MemoryDashboard.jsx) |
| **Pillar 2** | Native Model Context Protocol (MCP) Layer | `50%` (Custom JSON Schema) | [`docsToolRegistry.js`](file:///c:/Users/user/Downloads/Project%20MOAT/Regaarder%20Compose/src/services/docsToolRegistry.js), [`docsToolExecutor.js`](file:///c:/Users/user/Downloads/Project%20MOAT/Regaarder%20Compose/src/services/docsToolExecutor.js) |
| **Pillar 3** | Human-in-the-Loop "Approval & Sandbox" Engine | `40%` (Runtime Ready) | [`docsToolExecutor.js`](file:///c:/Users/user/Downloads/Project%20MOAT/Regaarder%20Compose/src/services/docsToolExecutor.js) (`isDryRun`, transaction history, rollback) |
| **Pillar 4** | The Canvas (Block-Level State IDs) | `30%` (Command API) | [`docsCommandApi.js`](file:///c:/Users/user/Downloads/Project%20MOAT/Regaarder%20Compose/src/services/docsCommandApi.js) |
| **Pillar 5** | The Matrix Engine (Code Execution & Schema) | `25%` (Visual Grid) | [`SheetRenderingEngine.jsx`](file:///c:/Users/user/Downloads/Project%20MOAT/Regaarder%20Compose/src/components/SheetRenderingEngine.jsx) |
| **Pillar 6** | The Intent Scheduler (Constraint Engine) | `20%` (Specified) | [`VERTICAL_INTEGRATIONS.md`](file:///c:/Users/user/Downloads/Project%20MOAT/VERTICAL_INTEGRATIONS.md) |

---

## 3. Pillar 1 Deep Dive: Universal Context Graph & Memory Bank (Completed)

The **30% architectural gap** has been completely resolved. The workspace no longer treats files as isolated islands.

### 3.1. Persistent Agent Memory Bank
- **Storage Backing:** `localStorage.getItem('regaarder_memory_bank_v1')` + in-memory reactive cache.
- **Core Entities Tracked:**
  1. **Instructions & Directives:** Natural user instructions remembered permanently (e.g. *"For small local models, prune history to 2 turns"*).
  2. **Project Rules & Constraints:** Strict organizational rules (e.g. *"Dual-Sourcing: No single fab location may exceed 60% compute supply"*).
  3. **Executive Decisions:** Formally recorded resolutions with approver, financial figure, rationale, and epistemic confidence.
  4. **User Preferences:** Cross-session preferences (dark mode, default model, auto-propagate flags).
- **Agent Integration:** When talking to an assistant in Relay (`relayAgentService.js`), natural language prompts like *"Remember that our rule is..."* or *"From now on, never..."* are automatically parsed and committed into the persistent store.

### 3.2. Reactive Cross-Workspace Event Bus & Auto-Propagation
- **Subscription Bus (`subscribeToGraph`):** Components and background agents subscribe to entity IDs (`ent_nv_sheet`), entity types (`document`), or wildcards (`*`).
- **Dependency Graph Traversal (`mutateAndPropagate`):**
  - When an entity changes (e.g. Sheet revenue metric updates from `$48.2B` $\rightarrow$ `$54.0B`):
    1. Traverses relational edges: `CALCULATES_FROM`, `REFERENCES`, `CAUSALLY_IMPACTS`, `DEPENDS_ON`.
    2. Identifies downstream nodes in Docs (`ent_nv_memo`), Decks (`ent_nv_deck`), and Decisions (`ent_nv_decision`).
    3. Auto-propagates deltas into target node metadata, excerpt summaries, and persisted documents (`regaarder_documents_v1`).
    4. Records an immutable audit entry in `propagationHistory`.
    5. Dispatches real-time events to all active subscriber listeners.

### 3.3. Token-Dense Machine Serialization
- **Function:** `getAgentContext({ maxEntities, maxRules, maxDecisions })`
- **Output:** Strips away DOM, HTML tags, styles, and chrome, producing a concentrated semantic markdown feed ($\le 500$ tokens) injected directly into LLM system prompts:
  ```markdown
  ### WORKSPACE CONTEXT GRAPH & AGENT MEMORY BANK
  **Active Project Rules & Constraints:**
  - [STRICT] Dual-Sourcing Requirement: No single fab location may exceed 60% supply.
  **Binding Historical Decisions:**
  - Authorize $1.8B advanced inventory commitment [Status: Executed | Impact: $1.80 Billion]
  **Connected Semantic Entities (State Engine):**
  - [SHEET] 2026 Datacenter GPU Revenue Model | Metric: $48.2B Market Expansion
  ```
- **JSON-LD Export:** `exportGraphAsJsonLd()` provides a standardized semantic web representation for external agents, vector databases, and MCP tools.

### 3.4. Dual-Mode Visualization in Memory Dashboard
- **Component:** [`MemoryDashboard.jsx`](file:///c:/Users/user/Downloads/Project%20MOAT/Regaarder%20Compose/src/MemoryDashboard.jsx)
- **Features:**
  - **Decisions Tab:** Merges static catalog decisions with live dynamically recorded decisions.
  - **Rules & Propagation Tab:** Displays active project rules with enforcement pills (`STRICT`, `ADVISORY`) alongside a live stream of cross-workspace auto-propagations.
  - **Interactive Simulation:** Includes an interactive simulation trigger to test live Sheet $\rightarrow$ Doc propagation in real time.

---

## 4. Upstream Roadmap: Steps to Complete Pillars 2 Through 6

### Milestone 2: Native Model Context Protocol (MCP) Layer
- [ ] Implement open-standard JSON-RPC server transport (`@modelcontextprotocol/sdk`).
- [ ] Expose `resources/` for Docs, Sheets, and Memory feeds.
- [ ] Expose `tools/` mapping to [`docsToolRegistry.js`](file:///c:/Users/user/Downloads/Project%20MOAT/Regaarder%20Compose/src/services/docsToolRegistry.js).
- [ ] Expose `prompts/` for executive workflows (Briefing Synthesis, Risk Audit).

### Milestone 3: Universal Staging & Diff Engine
- [ ] Connect [`docsToolExecutor.js`](file:///c:/Users/user/Downloads/Project%20MOAT/Regaarder%20Compose/src/services/docsToolExecutor.js) `dryRun` mode to a visible GitHub-style "Review Agent Changes" pull-request drawer.
- [ ] Render side-by-side visual redlines across Docs, Sheets, and Tasks before committing mutations.

### Milestone 4: Block-Level State Canvas
- [ ] Migrate raw `contentEditable` HTML strings to a block tree schema (`[{ id: 'block_a1', type: 'h2', content: '...' }]`).
- [ ] Allow agents to patch individual block IDs without re-streaming complete document bodies.

### Milestone 5: Code-Execution Matrix Engine
- [ ] Integrate Pyodide (WebAssembly Python) or SQLite in-browser sandbox for Sheets.
- [ ] Add protocol-level column data validation (rejects invalid data at schema level).

### Milestone 6: Constraint-Based Intent Scheduler
- [ ] Implement constraint-satisfaction negotiation algorithm for meetings and deadlines.
- [ ] Allow multi-agent parameter negotiation (e.g. Alex Agent $\leftrightarrow$ Elena Agent).

---

## 5. Live Changelog

- **2026-09-04:**
  - **Closed 30% Gap in Pillar 1:** Created `universalContextGraph.js` with persistent memory bank (`regaarder_memory_bank_v1`), reactive graph subscription bus, automated cross-workspace mutation propagation (`mutateAndPropagate`), and token-dense context extraction (`getAgentContext`).
  - **Integrated with Relay Agent:** Added natural memory instruction detection (`isMemoryInstruction`) and automatic graph propagation on document/task creation.
  - **Integrated with Docs Command API:** Wired `notifyDocumentMutated` to keep the context graph continuously synchronized with human typing and range replacements.
  - **Integrated with Memory Dashboard:** Added live `allDecisions` rendering, reactive state subscriptions, and the "Rules & Propagation" tab with live auto-propagation audit logging.
  - **Created Master Roadmap:** Authored `MACHINE_EXECUTION_SUBSTRATE_ROADMAP.md` tracking the dual-mode evolution toward the machine execution substrate.
