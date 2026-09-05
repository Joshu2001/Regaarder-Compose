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
└──────────────────────────────────────┬──────────────────────────────────────┘
                                       │
┌──────────────────────────────────────▼──────────────────────────────────────┐
│             NATIVE MODEL CONTEXT PROTOCOL (MCP) MIDDLEWARE LAYER             │
│              (Open Standard JSON-RPC 2.0 / MCP Specification)               │
│                                                                             │
│  • Resources: 7 Token-Dense URIs (Markdown, JSON-LD, CSV — saving 80% tokens)│
│  • Tools: 58 Standardized Executable Functions with Precise Input Schemas   │
│  • Prompts: 5 Executive Workflow Templates Built Directly into the Protocol │
│  • Transports: SSE (/mcp/sse), HTTP (/api/mcp), & In-Memory Client Bridge   │
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
| **Pillar 2** | **Native Model Context Protocol (MCP) Layer** | **100% COMPLETED** | [`mcpTools.js`](file:///c:/Users/user/Downloads/Project%20MOAT/Regaarder%20Compose/server/mcpTools.js), [`universalMcpBridge.js`](file:///c:/Users/user/Downloads/Project%20MOAT/Regaarder%20Compose/src/services/universalMcpBridge.js), [`MemoryDashboard.jsx`](file:///c:/Users/user/Downloads/Project%20MOAT/Regaarder%20Compose/src/MemoryDashboard.jsx) |
| **Pillar 3** | **Human-in-the-Loop "Approval & Sandbox" Engine** | **100% COMPLETED** | [`workspaceStagingEngine.js`](file:///c:/Users/user/Downloads/Project%20MOAT/Regaarder%20Compose/src/services/workspaceStagingEngine.js), [`WorkspaceStagingReviewModal.jsx`](file:///c:/Users/user/Downloads/Project%20MOAT/Regaarder%20Compose/src/components/staging/WorkspaceStagingReviewModal.jsx), [`docsToolExecutor.js`](file:///c:/Users/user/Downloads/Project%20MOAT/Regaarder%20Compose/src/services/docsToolExecutor.js), [`universalMcpBridge.js`](file:///c:/Users/user/Downloads/Project%20MOAT/Regaarder%20Compose/src/services/universalMcpBridge.js) |
| **Pillar 4** | **The Canvas (Block-Level State IDs & Patch Engine)** | **100% COMPLETED** | [`blockCanvasEngine.js`](file:///c:/Users/user/Downloads/Project%20MOAT/Regaarder%20Compose/src/services/blockCanvasEngine.js), [`BlockCanvasInspector.jsx`](file:///c:/Users/user/Downloads/Project%20MOAT/Regaarder%20Compose/src/components/dev/BlockCanvasInspector.jsx), [`docsCommandApi.js`](file:///c:/Users/user/Downloads/Project%20MOAT/Regaarder%20Compose/src/services/docsCommandApi.js), [`docsToolRegistry.js`](file:///c:/Users/user/Downloads/Project%20MOAT/Regaarder%20Compose/src/services/docsToolRegistry.js), [`universalMcpBridge.js`](file:///c:/Users/user/Downloads/Project%20MOAT/Regaarder%20Compose/src/services/universalMcpBridge.js) |
| **Pillar 5** | **The Matrix Engine (Code Execution & Schema)** | **100% COMPLETED** | [`matrixSchemaEngine.js`](file:///c:/Users/user/Downloads/Project%20MOAT/Regaarder%20Compose/src/services/matrixSchemaEngine.js), [`MatrixSchemaInspector.jsx`](file:///c:/Users/user/Downloads/Project%20MOAT/Regaarder%20Compose/src/components/sheets/MatrixSchemaInspector.jsx), [`docsToolRegistry.js`](file:///c:/Users/user/Downloads/Project%20MOAT/Regaarder%20Compose/src/services/docsToolRegistry.js), [`universalMcpBridge.js`](file:///c:/Users/user/Downloads/Project%20MOAT/Regaarder%20Compose/src/services/universalMcpBridge.js) |
| **Pillar 6** | **The Intent Scheduler (Constraint & Multi-Agent Negotiation)** | **100% COMPLETED** | [`intentSchedulerEngine.js`](file:///c:/Users/user/Downloads/Project%20MOAT/Regaarder%20Compose/src/services/intentSchedulerEngine.js), [`IntentSchedulerInspector.jsx`](file:///c:/Users/user/Downloads/Project%20MOAT/Regaarder%20Compose/src/components/schedule/IntentSchedulerInspector.jsx), [`docsToolRegistry.js`](file:///c:/Users/user/Downloads/Project%20MOAT/Regaarder%20Compose/src/services/docsToolRegistry.js), [`universalMcpBridge.js`](file:///c:/Users/user/Downloads/Project%20MOAT/Regaarder%20Compose/src/services/universalMcpBridge.js), [`relayAgentService.js`](file:///c:/Users/user/Downloads/Project%20MOAT/Regaarder%20Compose/src/services/relayAgentService.js) |
| **Pillar 7** | **Universal Ingestion & Schema Translator (Omni-Portal)** | **100% COMPLETED** | [`omniPortalEngine.js`](file:///c:/Users/user/Downloads/Project%20MOAT/Regaarder%20Compose/src/services/omniPortalEngine.js), [`OmniPortalInspector.jsx`](file:///c:/Users/user/Downloads/Project%20MOAT/Regaarder%20Compose/src/components/portal/OmniPortalInspector.jsx), [`docsToolRegistry.js`](file:///c:/Users/user/Downloads/Project%20MOAT/Regaarder%20Compose/src/services/docsToolRegistry.js), [`universalMcpBridge.js`](file:///c:/Users/user/Downloads/Project%20MOAT/Regaarder%20Compose/src/services/universalMcpBridge.js) |
| **Pillar 8** | **Directive Queue & Autonomous Execution Loop (Tasks)** | **100% COMPLETED** | [`directiveQueueEngine.js`](file:///c:/Users/user/Downloads/Project%20MOAT/Regaarder%20Compose/src/services/directiveQueueEngine.js), [`DirectiveQueueInspector.jsx`](file:///c:/Users/user/Downloads/Project%20MOAT/Regaarder%20Compose/src/components/tasks/DirectiveQueueInspector.jsx), [`docsToolRegistry.js`](file:///c:/Users/user/Downloads/Project%20MOAT/Regaarder%20Compose/src/services/docsToolRegistry.js), [`universalMcpBridge.js`](file:///c:/Users/user/Downloads/Project%20MOAT/Regaarder%20Compose/src/services/universalMcpBridge.js) |
| **Pillar 9** | **Spatial Topology & Visual Context Graph (Whiteboard)** | **100% COMPLETED** | [`spatialTopologyEngine.js`](file:///c:/Users/user/Downloads/Project%20MOAT/Regaarder%20Compose/src/services/spatialTopologyEngine.js), [`SpatialTopologyInspector.jsx`](file:///c:/Users/user/Downloads/Project%20MOAT/Regaarder%20Compose/src/components/whiteboard/SpatialTopologyInspector.jsx), [`docsToolRegistry.js`](file:///c:/Users/user/Downloads/Project%20MOAT/Regaarder%20Compose/src/services/docsToolRegistry.js), [`universalMcpBridge.js`](file:///c:/Users/user/Downloads/Project%20MOAT/Regaarder%20Compose/src/services/universalMcpBridge.js) |
| **Pillar 10** | **Real-Time Context Harvester & Multi-Agent Observer (Room)** | **100% COMPLETED** | [`roomObserverEngine.js`](file:///c:/Users/user/Downloads/Project%20MOAT/Regaarder%20Compose/src/services/roomObserverEngine.js), [`RoomContextHarvesterInspector.jsx`](file:///c:/Users/user/Downloads/Project%20MOAT/Regaarder%20Compose/src/components/room/RoomContextHarvesterInspector.jsx), [`RoomLandingPage.jsx`](file:///c:/Users/user/Downloads/Project%20MOAT/Regaarder%20Compose/src/RoomLandingPage.jsx), [`docsToolRegistry.js`](file:///c:/Users/user/Downloads/Project%20MOAT/Regaarder%20Compose/src/services/docsToolRegistry.js), [`universalMcpBridge.js`](file:///c:/Users/user/Downloads/Project%20MOAT/Regaarder%20Compose/src/services/universalMcpBridge.js) |

---

## 3. Pillar 1 Deep Dive: Universal Context Graph & Memory Bank (Completed)

The **30% architectural gap** in workspace state unification has been completely resolved. The workspace no longer treats files as isolated islands.

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
- **Output:** Strips away DOM, HTML tags, styles, and chrome, producing a concentrated semantic markdown feed ($\le 500$ tokens) injected directly into LLM system prompts.
- **JSON-LD Export:** `exportGraphAsJsonLd()` provides a standardized semantic web representation for external agents, vector databases, and MCP tools.

### 3.4. Dual-Mode Visualization in Memory Dashboard
- **Component:** [`MemoryDashboard.jsx`](file:///c:/Users/user/Downloads/Project%20MOAT/Regaarder%20Compose/src/MemoryDashboard.jsx)
- **Features:**
  - **Decisions Tab:** Merges static catalog decisions with live dynamically recorded decisions.
  - **Rules & Propagation Tab:** Displays active project rules with enforcement pills (`STRICT`, `ADVISORY`) alongside a live stream of cross-workspace auto-propagations.
  - **Interactive Simulation:** Includes an interactive simulation trigger to test live Sheet $\rightarrow$ Doc propagation in real time.

---

## 4. Pillar 2 Deep Dive: Native Model Context Protocol (MCP) Layer (Completed)

Instead of fragile, bespoke SaaS REST endpoints that break when schemas change or waste massive context windows on bloated HTML payloads, the workspace natively exposes the open **Model Context Protocol (MCP)** specification (`protocolVersion: "2024-11-05"`).

Every workspace object natively exposes the three core MCP primitives:

```
┌─────────────────────────────────────────────────────────────────────────────┐
│                       THREE STANDARDIZED MCP PRIMITIVES                     │
├──────────────────────────────┬──────────────────────────────┬───────────────┤
│          RESOURCES           │            TOOLS             │    PROMPTS    │
│  (Token-Dense Data Feeds)    │     (Executable Functions)   │ (Workflows)   │
├──────────────────────────────┼──────────────────────────────┼───────────────┤
│ • workspace://graph/context  │ • remember_instruction       │ • executive_  │
│ • workspace://memory/bank    │ • add_project_rule           │   briefing    │
│ • workspace://docs/active    │ • record_decision            │ • risk_rule_  │
│ • workspace://docs/list      │ • mutate_and_propagate       │   audit       │
│ • workspace://sheets/active  │ • validate_tool_call (dryrun)│ • cross_app_  │
│ • workspace://tasks/active   │ • create_document            │   propagation │
│ • workspace://graph/prop-log │ • 52 canonical doc/matrix ops│ • decision_   │
│                              │                              │   memo        │
└──────────────────────────────┴──────────────────────────────┴───────────────┘
```

### 4.1. Standardized MCP Resources (Saving up to 80% Context Tokens)
Raw HTML documents easily consume 5,000–20,000 tokens of DOM tags, inline CSS, and formatting chrome. The MCP Resources layer strips all noise, returning high-density Markdown or JSON-LD:
1. `workspace://graph/context` — Markdown feed of active project rules, binding decisions, and connected entity nodes (< 500 tokens).
2. `workspace://memory/bank` — Complete JSON-LD semantic graph of instructions, preferences, and project rules.
3. `workspace://docs/active` — Clean Markdown representation of the focused Compose document with structure and stats.
4. `workspace://docs/list` — Workspace document manifest array (id, title, word count, updatedAt).
5. `workspace://sheets/active` — Structured tabular matrices in token-efficient Markdown/CSV format.
6. `workspace://tasks/active` — Strategic initiatives, owners, deadlines, and dependencies.
7. `workspace://graph/propagation-log` — Live cross-workspace auto-propagation audit trail.

### 4.2. Standardized MCP Tools with Dry-Run Staging
Exposes 58 executable tools strictly validated against standard JSON Schema:
- **Memory & State:** `remember_instruction`, `add_project_rule`, `record_decision`, `mutate_and_propagate`, `query_context_graph`.
- **Safety & Dry-Run Staging:** `validate_tool_call` allows any agent or human to simulate tool execution, inspecting destructive impact and schema validity before committing mutations.
- **Document & Matrix Operations:** Full suite of canonical tools (`set_title_subtitle`, `set_full_content`, `replace_selection`, `insert_table`, `insert_chart`, `update_sheet_cell`, etc.).

### 4.3. Standardized MCP Prompts (Pre-Engineered Executive Templates)
1. `executive_briefing`: Synthesizes active docs, models, and decisions into a high-level strategic briefing.
2. `risk_and_rule_audit`: Audits proposed initiatives against active STRICT and ADVISORY project rules.
3. `cross_app_propagation`: Analyzes downstream impacts and drafts required cross-app diffs.
4. `decision_record_memo`: Pre-formats an epistemic decision memo with confidence rating and capital implications.
5. `financial_model_projection`: Generates rigorous tabular financial projections with guaranteed percentage formatting.

### 4.4. Dual Transports: Server SSE & Isomorphic Client Bridge
- **Backend Server Transports:**
  - `GET /mcp/sse`: Official Server-Sent Events stream for external agents (Claude Desktop, Cursor IDE, Windsurf).
  - `POST /mcp/message`: Receives JSON-RPC messages routed to active SSE clients.
  - `POST /api/mcp`: Standard JSON-RPC 2.0 HTTP endpoint.
- **Isomorphic Client Bridge ([`universalMcpBridge.js`](file:///c:/Users/user/Downloads/Project%20MOAT/Regaarder%20Compose/src/services/universalMcpBridge.js)):
  - In-memory protocol dispatcher running inside Vite and Electron.
  - Enables Relay Agent and local Ollama models to query resources and execute tools without network round-trips.

### 4.5. Apple-Tier MCP Protocol Inspector UI in Memory Dashboard
- Added dedicated **MCP Protocol** tab in [`MemoryDashboard.jsx`](file:///c:/Users/user/Downloads/Project%20MOAT/Regaarder%20Compose/src/MemoryDashboard.jsx):
  - **Live Protocol Status:** Shows MCP 2024-11-05 compliance, endpoint address, and server heartbeat.
  - **Resources Explorer:** Inspect any of the 7 workspace feeds with live token counter (~tokens & chars) and 1-click clipboard copy.
  - **Tools Sandbox:** Searchable catalog of 58 tools with JSON Schema parameters and an interactive "Run Tool Staging Call" sandbox runner.
  - **Prompts Library:** Live argument input forms and real-time template preview.
  - **Connect External Agents:** 1-Click copy of ready-to-paste configurations for `claude_desktop_config.json` and `.cursor/mcp.json`.

---

## 5. Pillar 3 Deep Dive: Human-in-the-Loop "Approval & Sandbox" Engine (Completed)

Autonomous AI agents executing multi-step complex workflows (e.g. updating financial projections, editing strategy decks, modifying shared tasks) must never silently corrupt production workspace state or interrupt human operators with intrusive, blocking modal dialogues every 5 seconds.

To resolve this, the workspace implements the **Universal Staging & Sandbox Engine**, providing an asynchronous GitHub Pull Request-style paradigm for all human-in-the-loop agent workflows.

```
┌─────────────────────────────────────────────────────────────────────────────┐
│                 PILLAR 3: WORKSPACE STAGING & DIFF ENGINE                   │
├──────────────────────────────┬──────────────────────────────┬───────────────┤
│       SANDBOX STAGING        │      SEMANTIC REDLINE        │ CHERRY-PICK & │
│       (Isolated Buffer)      │      (diff-match-patch)      │ ATOMIC COMMIT │
├──────────────────────────────┼──────────────────────────────┼───────────────┤
│ • Branch: pr_<time>_<hash>   │ • Deletions: -Crimson strike │ • Granular CBs│
│ • Zero Production Pollution  │ • Additions: +Emerald green  │ • Atomic Tx   │
│ • Cross-App (Doc/Sheet/Task) │ • Side-by-Side & Inline Diff │ • Graph Sync  │
│ • docsToolExecutor routing   │ • Word & Token Granularity   │ • Rollback Log│
└──────────────────────────────┴──────────────────────────────┴───────────────┘
```

### 5.1. The Staging Engine Architecture ([`workspaceStagingEngine.js`](file:///c:/Users/user/Downloads/Project%20MOAT/Regaarder%20Compose/src/services/workspaceStagingEngine.js))
All mutative agent actions across Docs, Sheets, and Tasks can be routed into an isolated sandbox branch (`pr_<timestamp>_<hash>`):
- **Zero Production Pollution:** Staged modifications are held in an isolated reactive buffer (`regaarder_staging_branches_v1`). Production documents remain untouched until approved.
- **Heterogeneous Workspace Support:** A single Pull Request branch can contain multi-app mutations (e.g. 1 Compose Doc edit + 1 Sheet cell formula update + 1 Task creation).
- **Reactive Subscriptions:** `subscribeToStaging` broadcasts state updates to the UI, floating indicators, and MCP resources whenever branches or mutations change.

### 5.2. Semantic Redline Diffing (`diff-match-patch`)
Powered by Google's semantic `diff-match-patch` algorithm, changes are visualized with token-level precision:
- **Deletions (`-1`):** Highlighted with subtle crimson background, border, and strikethrough text.
- **Additions (`+1`):** Highlighted with emerald green background, border, and bolded text.
- **Unchanged Equality (`0`):** Preserved for context surrounding modifications.
- **Side-by-Side & Unified View:** Directors can toggle between split baseline vs. proposed comparison and consolidated inline redlines.

### 5.3. Cherry-Picking & Atomic Commit
Rather than an all-or-nothing approval wall, human directors have granular authority:
- **Per-Mutation Checkboxes:** Directors can uncheck specific speculative edits while approving validated ones.
- **Atomic Execution:** `approveAndCommitBranch` commits all selected mutations in a single transaction, applies document range replacements via `docsCommandApi`, and fires `mutateAndPropagate` to update the Universal Context Graph.
- **Full Rollback Support:** Every committed staged change generates a snapshot transaction, allowing instant one-click rollback if needed.
- **Explicit Rejection:** `rejectBranch` archives the branch and purges sandbox state with zero residual side effects.

### 5.4. Human-in-the-Loop UI Surfaces
1. **Workspace Staging Review Modal ([`WorkspaceStagingReviewModal.jsx`](file:///c:/Users/user/Downloads/Project%20MOAT/Regaarder%20Compose/src/components/staging/WorkspaceStagingReviewModal.jsx)):**
   - Executive Apple-style layout with PR number, agent origin badge, and app pills.
   - Live diff summary statistics (`+addedChars` / `-removedChars`).
   - Granular cherry-pick toggles for every staged mutation.
   - Side-by-side vs. Unified redline diff switcher.
   - 1-Click "Approve & Merge Selected" and "Reject All Changes" actions.
2. **Global Floating PR Quick-Review Badge ([`App.jsx`](file:///c:/Users/user/Downloads/Project%20MOAT/Regaarder%20Compose/src/App.jsx)):**
   - Non-intrusive floating indicator positioned at bottom-right whenever uncommitted PRs are pending review.
   - Pulsing violet notification with PR count and 1-click shortcut to launch the review modal.
3. **Relay Agent Staging PR Action Card ([`ExecutiveDirectMessages.jsx`](file:///c:/Users/user/Downloads/Project%20MOAT/Regaarder%20Compose/src/components/chat/ExecutiveDirectMessages.jsx)):**
   - Renders a dedicated PR action card with `<GitPullRequest />` icon, "⏳ Pending Review" status badge, and "Review Redline Diff & Merge" button directly in chat threads.

### 5.5. MCP Protocol Staging Tools & Resources
External agents (Claude Desktop, Cursor, local LLMs) can programmatically participate in the staging lifecycle:
- **Resource `workspace://staging/active`:** Token-dense Markdown feed of all active pending PRs and staged diff summaries.
- **Tool `stage_workspace_mutation`:** Stage an isolated modification into a sandbox branch.
- **Tool `get_staged_diff`:** Query visual redline chunks and delta stats for any branch.
- **Tool `approve_staged_branch`:** Programmatically approve and merge cherry-picked mutations.
- **Tool `reject_staged_branch`:** Safely close and discard a staging branch.

---

## 6. Pillar 4 Deep Dive: The Canvas (Block-Level State IDs & Surgical Patch Engine) (Completed)

Traditional document processors represent documents as opaque monolithic strings or raw unstructured HTML. When an AI agent needs to modify a single paragraph in a 10,000-word document, it either re-generates the entire document from scratch (wasting thousands of context tokens and creating human-AI edit race conditions) or executes brittle regex search/replace passes that break on minor whitespace variations.

Pillar 4 transforms the document model into a **Structured Abstract Syntax Tree (AST) Canvas**:

```
┌─────────────────────────────────────────────────────────────────────────────┐
│                 PILLAR 4: BLOCK CANVAS AST & SURGICAL PATCH                 │
├──────────────────────────────┬──────────────────────────────┬───────────────┤
│       STRUCTURED AST         │     SURGICAL PATCH ENGINE    │  BI-DIRECTIONAL│
│   (Persistent Node IDs)      │   (Zero Re-Stream Latency)   │   SERIALIZER   │
├──────────────────────────────┼──────────────────────────────┼───────────────┤
│ • blk_<timestamp>_<uuid>     │ • patch_block(id, content)   │ • HTML <-> AST│
│ • Types: h1..h3, p, callout, │ • insert_block(target, pos)  │ • Markdown AST│
│   code, table, list_item     │ • delete_block(id)           │ • data-block-id│
│ • Monotonic block versions   │ • move_block(id, target, pos)│ • Reactive DOM│
│ • Semantic properties        │ • batch_patch_blocks(patches)│   Sync & Graph│
└──────────────────────────────┴──────────────────────────────┴───────────────┘
```

### 6.1. The Block AST Schema ([`blockCanvasEngine.js`](file:///c:/Users/user/Downloads/Project%20MOAT/Regaarder%20Compose/src/services/blockCanvasEngine.js))
Every document node possesses a structured schema:
- **`id`:** Permanent unique identifier (e.g. `blk_1725450000_a8f2`), preserved across edits.
- **`type`:** Explicit node classification (`h1`, `h2`, `h3`, `paragraph`, `callout`, `code`, `table`, `quote`, `divider`, `bullet_list`, `numbered_list`).
- **`content`:** Clean inner text/HTML.
- **`properties`:** Type-specific metadata (`theme` for callouts, `language` for code blocks, `headers` & `rows` for tables).
- **`version`:** Monotonic version counter incremented on every discrete mutation for concurrency safety.
- **`lastModifiedBy`:** Identity of the author (`'human'` or `agentId`).

### 6.2. Isomorphic Bi-Directional Serializers
- **`htmlToBlockTree(html)`:** Intelligently breaks down incoming DOM/HTML trees into typed AST blocks. Extracts existing `data-block-id` attributes or generates deterministic IDs.
- **`blockTreeToHtml(tree)`:** Renders production-clean HTML where every root node is stamped with `data-block-id="${block.id}"` and `data-block-type="${block.type}"`.
- **`blockTreeToMarkdown(tree)`:** Produces high-density Markdown with embedded block ID comments (`<!-- id:blk_... -->`) for token-efficient LLM prompts.

### 6.3. Surgical Patch Engine Operations
Autonomous agents can execute discrete atomic mutations without touching the rest of the canvas:
- **`patch_block`:** In-place update of an existing block's content, properties, or type. Increments the target block's version while leaving the rest of the AST untouched.
- **`insert_block`:** Inserts a new block adjacent to an existing target block (`'before'` or `'after'`).
- **`delete_block`:** Safely excises a block from the document tree.
- **`move_block`:** Reorders nodes within the tree.
- **`batch_patch_blocks`:** Atomically applies multiple patch operations in a single pass.

### 6.4. Pillar 3 Staging Sandbox Integration
When an agent calls `patch_block` with `options.stage: true`, the patch is automatically intercepted by the Staging Engine (`workspaceStagingEngine.js`). Instead of computing a document-wide diff, it computes a **surgical block redline diff** strictly comparing the targeted block's before/after text.

### 6.5. Apple-Tier Visual Block Canvas Inspector ([`BlockCanvasInspector.jsx`](file:///c:/Users/user/Downloads/Project%20MOAT/Regaarder%20Compose/src/components/dev/BlockCanvasInspector.jsx))
Mounted inside the `MemoryDashboard.jsx` under a dedicated **Canvas AST** tab:
- **Visual Block Stream:** Cards for every block displaying type badge, block ID, character count, and version.
- **1-Click Copy:** Instant clipboard copy of any block ID.
- **Interactive Patch Console:** Allows human directors to test surgical patches directly in the UI.
- **AST JSON & Markdown Viewers:** Raw views for developer and agent inspection.

### 6.6. Native Model Context Protocol (MCP) Integration
- **Resource `workspace://docs/blocks`:** Returns the full JSON-LD / JSON AST of active document blocks.
- **Tools:** `get_block_tree`, `get_block`, `patch_block`, `insert_block`, `delete_block`, `move_block`, `batch_patch_blocks`.

### 6.6. Native Model Context Protocol (MCP) Integration
- **Resource `workspace://docs/blocks`:** Returns the full JSON-LD / JSON AST of active document blocks.
- **Tools:** `get_block_tree`, `get_block`, `patch_block`, `insert_block`, `delete_block`, `move_block`, `batch_patch_blocks`.

---

## 7. Pillar 5 Deep Dive: The Matrix Engine (Code Execution & Schema Validation Substrate) (Completed)

Traditional spreadsheets represent data as untyped 2D grids of loose strings. AI models struggle with fragile lookups, treat categorical states (e.g. `Status`, `Priority`, `Stage`) as arbitrary free text instead of validated enums, omit native percentage formatting (`0.65` instead of `65%`), and lack code execution substrates to verify numerical models without full-sheet streaming.

Pillar 5 transforms the spreadsheet into an **AI-Native Matrix Engine and In-Browser Calculation Substrate**:

```
┌─────────────────────────────────────────────────────────────────────────────┐
│                 PILLAR 5: THE MATRIX ENGINE & CODE SUBSTRATE                │
├──────────────────────────────┬──────────────────────────────┬───────────────┤
│    STRICT COLUMN SCHEMA      │    IN-BROWSER CODE & SQL     │  ISOMORPHIC   │
│    & PROTOCOL VALIDATION     │    CALCULATION SUBSTRATE     │  AST & PATCH  │
├──────────────────────────────┼──────────────────────────────┼───────────────┤
│ • Types: number, percentage, │ • Topological Formula Graph  │ • Grid <-> AST│
│   currency, dropdown, date   │ • SUM, AVG, VLOOKUP, IF, etc.│ • Markdown &  │
│ • Rule 7: Intersection-Safe  │ • In-Browser SQL Evaluator   │   JSON-LD AST │
│ • Rule 9: Native Dropdown & %│   (SELECT..WHERE..GROUP BY)  │ • Surgical    │
│ • Violation Diagnostics      │ • Cycle Detection (#CYCLE!)  │   Cell Patch  │
└──────────────────────────────┴──────────────────────────────┴───────────────┘
```

### 7.1. Rule 7: Intersection-Safe Schema Inference
- **Intersection Isolation:** As mandated in the architectural incident post-mortem (`intersection_flaw_postmortem.md`), `inferMatrixSchema` strictly isolates the `(0,0)` cell from axis evaluation.
- **Axis Overlap Prevention:** Row 0 (`1..n`) and Col 0 (`1..n`) remainders are evaluated independently to determine vector header orientation, preventing a text string at `(0,0)` from collapsing numerical columns into false-positive headers.

### 7.2. Rule 9: Protocol-Level Data Validation & Dropdown Enums
- **Categorical Dropdowns:** Categorical fields (`Status`, `Priority`, `Stage`, `Category`, `Assignee`) automatically configure as `dropdown` column schemas with explicit `options` lists.
- **Native Percentage Formatting:** Percentage columns strictly mandate native `%` symbols (e.g. `65%`), flagging raw floats (`0.65`) as `UNFORMATTED_PERCENTAGE` with automatic 1-click coercion.
- **Deep Violation Diagnostics:** `validateMatrixData` returns exact cell coordinate errors (`B3`, `C4`) and deterministic `autoFix` suggestions.

### 7.3. In-Browser Formula Engine & Cycle Detection
- **Comprehensive Function Library:** Evaluates `SUM`, `AVERAGE`, `MIN`, `MAX`, `COUNT`, `COUNTA`, `IF`, `VLOOKUP`, `CONCATENATE`, and multi-operand arithmetic expressions with operator precedence.
- **Topological Recalculation:** Resolves cell dependencies in topological order.
- **Circular Reference Safety:** Catches cyclic formula references (e.g. `A1 = B1 + 1`, `B1 = A1 + 1`) and stamps `#CYCLE!` without stack overflow or application hang.

### 7.4. In-Browser Relational SQL Query Engine (`queryMatrixSql`)
- Executes relational queries directly over spreadsheet matrices:
  - `SELECT Category, SUM(Actual) WHERE Actual > 20000 GROUP BY Category ORDER BY Actual DESC LIMIT 10`
- Provides autonomous agents with an in-process SQL substrate to filter, slice, aggregate, and inspect multi-thousand cell matrices in microseconds (`~2ms`).

### 7.5. Isomorphic AST Serializers & Surgical Patching
- **Grid <-> AST <-> Markdown <-> JSON:** Bi-directional lossless conversion.
- **Token Density:** `matrixAstToMarkdown` trims DOM overhead, cutting token consumption by up to 80% for LLMs.
- **Pillar 3 Sandbox Staging Integration:** `patchMatrixCells` supports `stage: true`, routing speculative cell edits into isolated PR branches with redline delta diffs.

### 7.6. Apple-Tier Matrix Schema & Query Inspector UI ([`MatrixSchemaInspector.jsx`](file:///c:/Users/user/Downloads/Project%20MOAT/Regaarder%20Compose/src/components/sheets/MatrixSchemaInspector.jsx))
- Mounted under the dedicated **Matrix Engine** tab in [`MemoryDashboard.jsx`](file:///c:/Users/user/Downloads/Project%20MOAT/Regaarder%20Compose/src/MemoryDashboard.jsx):
  - **Schema Blueprint:** Live cards for all columns with type badges, allowed options tags, and "Add Typed Column" controls.
  - **Validation Diagnostics:** Alert stream displaying violation cards with cell coordinates and 1-click "Auto-Fix All Violations".
  - **Relational SQL Console:** Interactive query runner with sample queries and live tabular output.
  - **Formula Dependency Viewer:** Tree view of active dynamic formula cells and cycle safety badges.
  - **Token-Dense Exporter:** 1-Click copy of Markdown and JSON representations.

### 7.7. Native Model Context Protocol (MCP) Integration
- **Resource `workspace://sheets/active`:** Serializes the live active matrix to token-dense Markdown dynamically.
- **Resource `workspace://sheets/schema`:** Returns JSON Schema definitions of active matrix columns and constraints.
- **Tools:** `validate_matrix_schema`, `patch_matrix_cells`, `query_matrix_sql`, `add_column_with_schema`, `evaluate_matrix_formulas`.

---

## 8. Pillar 6 Deep Dive: The Intent Scheduler & Multi-Agent Negotiation Substrate (Completed)

Traditional calendar systems are passive silos: human users engage in exhausting manual email ping-pong ("Does 3 PM work? No, how about 4 PM?") while software blindly overlays conflicting events. AI assistants cannot autonomously lock meetings because they lack mathematical constraint models, multi-agent negotiation protocols, and sandbox staging safeguards.

Pillar 6 delivers an **AI-Native Intent Scheduler and Multi-Agent Negotiation Engine**:

```
┌─────────────────────────────────────────────────────────────────────────────┐
│             PILLAR 6: INTENT SCHEDULER & MULTI-AGENT NEGOTIATION            │
├──────────────────────────────┬──────────────────────────────┬───────────────┤
│    RULE 4 CONTEXT MAPPING    │    MATHEMATICAL CSP SOLVER   │  MULTI-AGENT  │
│    & SYSTEMIC SPECS          │    & TEMPORAL CONFLICT MATRIX│  NEGOTIATION  │
├──────────────────────────────┼──────────────────────────────┼───────────────┤
│ • "Tennis practice" ->       │ • Utility: U(slot) in [0, 1] │ • Alternating │
│   health_athletics (90m,     │ • Interval Forward Checking  │   Offers      │
│   buffers, energy load)      │ • Conflict Resolution:       │ • Monotonic   │
│ • "Board prep sync" ->       │   priority_bump, duration_   │   Concessions │
│   executive_strategy         │   compression, cooldown      │ • Pareto      │
│ • Bilateral / Financial specs│ • Pillar 3 Staging Sandbox   │   Convergence │
└──────────────────────────────┴──────────────────────────────┴───────────────┘
```

### 8.1. Rule 4 Context-Aware Intent Interpretation
- **Anti-Literal Domain Mapping:** Mandated by Rule 4, colloquial user requests are never processed naively. A prompt like "Tennis practice" is systematically mapped to `health_athletics` (duration: 90 min, prep: 20 min, cooldown: 20 min, energy load: `high`, preferred: `late_afternoon` / `early_morning`).
- **Standardized Domain Specs:** Built-in systemic specifications for `health_athletics`, `executive_strategy`, `financial_projection`, `engineering_architecture`, and `bilateral_sync`.
- **Constraint Overrides:** Allows explicit user overrides (e.g., custom duration, urgency, participants) while maintaining systemic defaults.

### 8.2. Mathematical CSP Solver & Multi-Objective Slot Utility
- **Hard Constraints:** Strictly enforces calendar working windows (e.g. 08:00–18:00), blackout intervals, participant availability, and pre/post buffers.
- **Forward Checking:** Prunes infeasible domains across discrete 15-minute intervals.
- **Multi-Objective Slot Utility Function:**
  $$U(\text{slot}) = w_{\text{pref}} \cdot S_{\text{time}} + w_{\text{priority}} \cdot S_{\text{priority}} - w_{\text{buffer}} \cdot P_{\text{buffer}} - w_{\text{fatigue}} \cdot P_{\text{fatigue}}$$
  Optimizes for circadian energy alignment, prevents back-to-back cognitive overload, and applies lunch-hour buffer penalties.

### 8.3. Multi-Agent Alternating-Offer Negotiation Protocol
- **Autonomous Peer Consensus:** Facilitates bilateral consensus between autonomous AI agents (e.g. Alex Agent $\leftrightarrow$ Elena Agent) without human email friction.
- **Monotonic Concessions & Pareto Convergence:** Agents submit proposals with explicit utility ratings ($U_A, U_B$). If non-overlapping, concession rates expand candidate domains until Pareto optimality is achieved ($U_A \times U_B \ge \text{threshold}$).
- **State Machine:** Governed by deterministic lifecycle states: `PROPOSED` $\rightarrow$ `COUNTER_OFFERED` $\rightarrow$ `AGREED` $\rightarrow$ `COMMITTED` (or `REJECTED`).

### 8.4. Temporal Conflict Matrix & Automated Resolution
- **Surgical Conflict Detection:** Evaluates overlapping intervals, participant collisions, and buffer violations across active schedules.
- **Three Resolution Strategies:**
  1. `priority_bump`: Automatically shifts lower-priority events to the next optimal slot when an urgent executive conflict arises.
  2. `duration_compression`: Dynamically compresses non-essential meetings to fit tight calendar windows.
  3. `cooldown_compression`: Adjusts post-event cooldown buffers while maintaining minimum safety margins.
- **Pillar 3 Sandbox Staging Integration:** Speculative schedule modifications execute via `stage: true`, routing proposed shifts into isolated PR sandboxes for executive visual approval.

### 8.5. Apple-Tier Intent Scheduler Inspector UI ([`IntentSchedulerInspector.jsx`](file:///c:/Users/user/Downloads/Project%20MOAT/Regaarder%20Compose/src/components/schedule/IntentSchedulerInspector.jsx))
- Mounted under the dedicated **Meetings & Scheduler** tab in [`MemoryDashboard.jsx`](file:///c:/Users/user/Downloads/Project%20MOAT/Regaarder%20Compose/src/MemoryDashboard.jsx):
  - **Calendar & Timeline View:** Apple-minimalist horizontal/vertical timeline showing scheduled blocks, buffer envelopes, and active selection outlines (strictly non-pill tabs).
  - **Multi-Agent Negotiation Studio:** Live protocol feed visualizing alternating agent proposals, concession rounds, and mutual utility scores with 1-click test negotiations.
  - **Constraint Solver Playground:** Interactive form to test Rule 4 colloquial intent phrases ("Tennis practice", "Quarterly board sync"), solve optimal slots, and inspect utility ranking.
  - **Conflict Resolution Center:** Active collision cards with automated resolution recommendations and 1-click "Stage Shift PR" sandbox triggers.

### 8.6. Native Model Context Protocol (MCP) Integration
- **Resource `workspace://schedule/calendar`:** Token-dense JSON-LD / Markdown stream of scheduled events, working windows, and blackout blocks.
- **Resource `workspace://schedule/negotiations`:** Live feed of active and completed multi-agent negotiation threads.
- **Tools:** `solve_schedule_constraints`, `negotiate_multi_agent_schedule`, `detect_schedule_conflicts`, `resolve_schedule_conflict`, `commit_scheduled_event`.

### 8.7. Relay Agent & Universal Context Graph Wiring
- **Relay Agent Integration:** `relayAgentService.js` automatically classifies scheduling intents (`isScheduleMeeting`), executes multi-agent negotiations in the background, and emits interactive schedule action cards into `ExecutiveDirectMessages.jsx`.
- **Universal Context Graph:** `universalContextGraph.js` records persistent `scheduled_event` and `schedule_negotiation` nodes with participant edges and reactive notification propagation.

---

## 9. Pillar 7 Deep Dive: Universal Ingestion & Schema Translator (Omni-Portal)

In legacy software, importing a file is merely a visual file conversion (e.g. converting a `.docx` to a `.pdf` while fighting with page breaks, margin offsets, and font discrepancies). In an agentic workspace, **Import is the gateway where unstructured legacy files are converted into machine-computable semantic state.**

```
┌─────────────────────────────────────────────────────────────────────────────┐
│                 PILLAR 7: OMNI-PORTAL UNIVERSAL INGESTION                   │
├──────────────────────────────┬──────────────────────────────┬───────────────┤
│      DUAL-VIEW INGESTION     │    LOSSLESS TRANSLATION      │   CROSS-APP   │
│      (HUMAN & AGENT)         │    (AST EXTRACTION)          │   HYDRATION   │
├──────────────────────────────┼──────────────────────────────┼───────────────┤
│ • Original View: Native PDF/ │ • DOCX: Headings, tables     │ • Tables ->   │
│   Word preview (pdfjs/iframe)│   via JSZip + DOMParser      │   Matrix AST  │
│ • State View: Clean JSON-LD  │ • PPTX: Slide layouts        │ • Prose ->    │
│   and Markdown block AST     │ • XLSX: ExcelJS data matrix  │   Canvas AST  │
│ • 80%+ Context Token Savings │ • PDF: Chunked text streams  │ • Actionables │
│                              │   without binary FlateDecode │   -> Tasks    │
└──────────────────────────────┴──────────────────────────────┴───────────────┘
```

### 9.1. Dual-View Ingestion Architecture
- **Human Ergonomics:** The human retains the "Original View" (the native PDF/Word layout via `pdfjs-dist` or high-fidelity viewer), preserving page-level visual trust and spatial formatting.
- **Agent Execution Substrate:** Simultaneously, the engine strips all layout noise, inline CSS, and formatting chrome, exposing the **Workspace State View** (clean JSON-LD/Markdown blocks).
- **Token Efficiency:** Drops document token payload from 15,000–30,000 raw DOM tokens down to < 2,500 semantic tokens.

### 9.2. Multi-Format Semantic Extraction Substrate ([`OmniPortalModal.jsx`](file:///c:/Users/user/Downloads/Project%20MOAT/Regaarder%20Compose/src/components/OmniPortalModal.jsx))
- **Word / DOCX:** `JSZip` loads the archive and parses `word/document.xml` using `DOMParser`, systematically extracting `w:p` paragraphs, hierarchical headings (`h1`–`h3`), and `w:tbl` tables without XML artifacts.
- **PowerPoint / PPTX:** Extracts slide XML frames (`ppt/slides/slide*.xml`), classifies slide layouts (`title`, `bento`, `split`), and structures text into bullet-tree hierarchies.
- **Excel / XLSX & CSV:** `ExcelJS` loads multi-sheet workbooks, extracting raw values, formulas, and dimensions into structured 2D cell grids while preserving multi-tab indices.
- **Adobe PDF:** Legacy `pdfjs-dist` parses multi-page text streams page-by-page, isolating uppercase section headers from body blocks and rejecting raw binary streams.

### 9.3. Cross-App Hydration & Entity Routing Pipeline
- When an enterprise report (e.g. a 40-page quarterly business review) is dropped into the Omni-Portal:
  1. **Tabular Data Routing:** Extracted financial matrices and data tables route directly to the **Matrix Engine** ([`matrixSchemaEngine.js`](file:///c:/Users/user/Downloads/Project%20MOAT/Regaarder%20Compose/src/services/matrixSchemaEngine.js)), where columns are automatically assigned schemas, dropdowns, and percentage validators.
  2. **Narrative Block Routing:** Executive narratives and meeting summaries route to the **Canvas AST** ([`blockCanvasEngine.js`](file:///c:/Users/user/Downloads/Project%20MOAT/Regaarder%20Compose/src/services/blockCanvasEngine.js)) with persistent `blk_...` block IDs.
  3. **Action Item Routing:** Operational commitments and action items route directly to the **Directive Queue** ([`App.jsx`](file:///c:/Users/user/Downloads/Project%20MOAT/Regaarder%20Compose/src/App.jsx)) as `agent` or `team` tasks.

### 9.4. Native Model Context Protocol (MCP) Integration
- **Resource `workspace://portal/queue`:** Active file ingestion queue and extracted semantic entity feeds.
- **Tools:** `ingest_file_stream`, `translate_schema_to_ast`, `route_entities_cross_app`.

---

## 10. Pillar 8 Deep Dive: Directive Queue & Autonomous Agent Execution Loop (Tasks)

In traditional productivity suites, a Task app is merely a static checklist for humans (`[ ] Send weekly email`). In an agentic workspace, **Tasks are active execution scripts with programmatic lifecycle states, dependency graphs, and agent ownership.**

```
┌─────────────────────────────────────────────────────────────────────────────┐
│                 PILLAR 8: DIRECTIVE QUEUE & EXECUTION LOOP                  │
├──────────────────────────────┬──────────────────────────────┬───────────────┤
│     THREE-TIER TAXONOMY      │     BLOCK-LINKED POINTERS    │   AUTONOMOUS  │
│     & TRIAGE ENGINE          │     (PERSISTENT AST IDS)     │   RUNNER LOOP │
├──────────────────────────────┼──────────────────────────────┼───────────────┤
│ • Your Tasks: Direct human   │ • Canvas & Whiteboard text   │ • Background  │
│   to-dos                     │   highlighting instantiates  │   Directive   │
│ • Agent Tasks: Autonomous    │   task with `blk_...` pointer│   Checkout    │
│   LLM execution scripts      │ • Zero context drift:        │ • MCP Tool    │
│ • Team Tasks: Hybrid human-  │   agent navigates directly   │   Execution   │
│   in-the-loop approvals      │   to target node             │ • Staging PR  │
│ • Drag-and-drop category bus │ • Bidirectional backlinks    │   Generation  │
└──────────────────────────────┴──────────────────────────────┴───────────────┘
```

### 10.1. Three-Tier Task Triage Architecture ([`App.jsx`](file:///c:/Users/user/Downloads/Project%20MOAT/Regaarder%20Compose/src/App.jsx#L42782-L42960))
- **`Your Tasks` (`owner: 'user'`):** Traditional human to-dos.
- **`Agent Tasks` (`owner: 'agent'`):** Autonomous directives assigned to background LLM agents (e.g., *"Reconcile vendor invoices from Omni-Portal"*, *"Refactor Section 4 to match Rule 2 aesthetics"*).
- **`Team Tasks` (`owner: 'team'`):** Hybrid workflows requiring human approval at designated checkpoints before the agent proceeds.
- **Triage Interactions:** Drag-and-drop between categories (`handleTaskDropOnCategory`), visual `AI` tagging, editable titles, priority levels, and due-date popovers.

### 10.2. Block-Linked Actionables (`blk_...` Pointers)
- **Direct Pointer Linking:** Highlighting text anywhere in Canvas or Whiteboard automatically instantiates an **Agent Task** with direct pointer links to those specific block IDs (`data-block-id="blk_..."`).
- **Context Pinpointing:** The executing agent does not waste tokens scanning entire documents; it resolves the `blockId`, queries `docsCommandApi.getBlockTreeSnapshot()`, and applies surgical updates via `patchBlockById`.

### 10.3. Autonomous Agent Execution Loop
- **Checkout & Execution Lifecycle:** Background agent runner queries `workspace://tasks/queue`, transitions task state (`PENDING` $\rightarrow$ `RUNNING` $\rightarrow$ `STAGED` $\rightarrow$ `COMPLETED`), and invokes canonical MCP tools.
- **Pillar 3 Sandbox Integration:** Any destructive action or document modification generated by an `Agent Task` is staged into an isolated PR branch (`pr_<timestamp>_<hash>`) with token-level redline diffs.
- **Human Approval:** Posts an interactive PR review card into Chat and the Task list for 1-click human merge.

### 10.4. Native Model Context Protocol (MCP) Integration
- **Resource `workspace://tasks/active`:** High-density JSON-LD feed of active directives, categories, and linked block pointers.
- **Tools:** `queue_agent_directive`, `link_task_to_block`, `checkout_task_directive`, `complete_task_execution`.

---

## 11. Pillar 9 Deep Dive: Spatial Topology & Visual Context Graph (Whiteboard)

Traditional whiteboards (Miro, FigJam) are visual playgrounds where humans drag freeform shapes around. AI models struggle with raw canvas pixels because rendering or processing images wastes huge vision token budgets without conveying semantic relationships.

Pillar 9 transforms the whiteboard into a **Spatial Topology and Visual Context Graph**:

```
┌─────────────────────────────────────────────────────────────────────────────┐
│                 PILLAR 9: SPATIAL TOPOLOGY & CONTEXT GRAPH                  │
├──────────────────────────────┬──────────────────────────────┬───────────────┤
│     VISUAL GRAPH PROTOCOL    │   BI-DIRECTIONAL COMPILATION │  HUMAN-AGENT  │
│     (SEMANTIC RELATIONS)     │   (SKETCH <-> CODE / AST)    │  ALIGNMENT    │
├──────────────────────────────┼──────────────────────────────┼───────────────┤
│ • Nodes, shapes, post-its    │ • Human flowchart compiles   │ • Agent plans │
│   stored as relational edges:│   live to JSON / SQL schema  │   rendered as │
│   (A) --[DEPENDS_ON]--> (B)  │ • Code / state compiles to   │   visual graph│
│ • Persistent IDs: `node_...` │   spatial visual layout      │ • Interactive │
│ • Unified Context Graph sync │ • Zero vision-token overhead │   zoom & edit │
└──────────────────────────────┴──────────────────────────────┴───────────────┘
```

### 11.1. Visual Graph Protocol Substrate
- **Relational Representation:** Every shape, sticky note, connector arrow, and group is indexed not merely by 2D coordinates `(x, y)`, but by its topological meaning:
  ```json
  {
    "id": "node_auth_service",
    "type": "architecture_component",
    "label": "Authentication Microservice",
    "edges": [
      { "target": "node_postgres_db", "relation": "READS_WRITES_TO" },
      { "target": "node_redis_cache", "relation": "DEPENDS_ON" }
    ]
  }
  ```
- **Universal Context Graph Integration:** Node relations sync continuously with `universalContextGraph.js`.

### 11.2. Bi-Directional Compilation Substrate
- **Human $\rightarrow$ Machine Compilation:** When a user sketches a system architecture or business process flowchart on the whiteboard, the spatial compiler evaluates node types, connector directions, and text labels, generating structured JSON, database schemas, or code models.
- **Machine $\rightarrow$ Human Visual Synthesis:** When an autonomous agent devises a multi-step strategic initiative or software architecture, it emits a spatial layout that renders directly onto the whiteboard canvas for human visual review.

### 11.3. Native Model Context Protocol (MCP) Integration
- **Resource `workspace://whiteboard/topology`:** Token-dense graph representation of active whiteboard nodes and relational edges.
- **Tools:** `get_whiteboard_topology`, `compile_diagram_to_schema`, `render_agent_plan_to_canvas`.

---

## 12. Pillar 10 Deep Dive: Real-Time Context Harvester & Multi-Agent Observer (Room)

Traditional video conferencing tools (Zoom, Google Meet) focus purely on media streaming and produce static post-call text transcripts that still require human labor to parse. In an agentic workspace, **Room is the live ingestion engine for organizational intent.**

```
┌─────────────────────────────────────────────────────────────────────────────┐
│                 PILLAR 10: ROOM CONTEXT HARVESTER & OBSERVER                │
├──────────────────────────────┬──────────────────────────────┬───────────────┤
│    ACTIVE IN-ROOM AGENTS     │   LIVE STATE MUTATION        │  ZERO POST-   │
│    (BACKGROUND OBSERVERS)    │   (CONCURRENT EXECUTION)     │  CALL LAG     │
├──────────────────────────────┼──────────────────────────────┼───────────────┤
│ • Silent AI observer nodes   │ • Spoken consensus mutates   │ • Staged PRs  │
│   in WebRTC / E2EE sessions  │   Whiteboard live            │   ready upon  │
│ • Real-time intent & decision│ • Drafts sections in Canvas  │   call hangup │
│   extraction from audio      │ • Queues Agent Directives    │ • No manual   │
│ • Screen share OCR stream    │ • Updates financial matrix   │   follow-ups  │
└──────────────────────────────┴──────────────────────────────┴───────────────┘
```

### 12.1. In-Room Active Background Agents
- **Autonomous Observers:** AI agents join Room video calls as silent background participants, processing audio streams in real time via lightweight speech-to-text models.
- **Epistemic Intent Extraction:** Identifies consensus points, formal decisions, budget agreements, and dissenting opinions as they are articulated.

### 12.2. Live Workspace State Mutation During Calls
- Rather than waiting for the meeting to conclude, in-room agents execute concurrent workspace mutations:
  1. **Whiteboard Updates:** Live-draws architecture diagrams or workflow steps agreed upon during discussion.
  2. **Canvas Documentation:** Continuously drafts meeting minutes and strategic memos inside [`RoomLiveDocStage.jsx`](file:///c:/Users/user/Downloads/Project%20MOAT/Regaarder%20Compose/src/components/room/RoomLiveDocStage.jsx).
  3. **Task Queueing:** Extracts action items, tags owners, and queues them into the **Directive Queue**.
  4. **Matrix Modeling:** Adjusts spreadsheet financial assumptions when targets are verbally revised.
- **Pillar 3 Sandbox Safety:** All mutations are bundled into an isolated, reviewable meeting PR (`pr_room_<meetingId>`) that participants can review and approve with 1 click before hanging up.

### 12.3. Native Model Context Protocol (MCP) Integration
- **Resource `workspace://room/live-context`:** Live stream of speaker turns, consensus tags, and pending meeting mutations.
- **Tools:** `harvest_meeting_intent`, `mutate_workspace_from_audio`, `dispatch_in_room_directive`.

---

## 13. Upstream Roadmap: Execution Milestones (Pillars 2 to 10)

### Milestone 2: Native Model Context Protocol (MCP) Layer
- [x] Implement open-standard JSON-RPC server transport (`protocolVersion: "2024-11-05"`).
- [x] Expose `resources/` for Docs, Sheets, and Memory feeds (8 token-dense URIs).
- [x] Expose `tools/` mapping to canonical registry & state engine (63 tools).
- [x] Expose `prompts/` for executive workflows (5 pre-engineered templates).
- [x] Expose SSE transport (`/mcp/sse`) and client-side isomorphic bridge (`universalMcpBridge.js`).
- [x] Apple-tier interactive MCP Protocol Inspector in Memory Dashboard.

### Milestone 3: Universal Staging & Diff Engine
- [x] Connect [`docsToolExecutor.js`](file:///c:/Users/user/Downloads/Project%20MOAT/Regaarder%20Compose/src/services/docsToolExecutor.js) `options.stage` mode to an isolated sandbox staging engine.
- [x] Render side-by-side visual redlines across Docs, Sheets, and Tasks powered by `diff-match-patch`.
- [x] Implement granular cherry-picking checkboxes allowing selective approval of staged mutations.
- [x] Wire atomic commits into `docsCommandApi` and the Universal Context Graph (`mutateAndPropagate`).
- [x] Add global floating PR quick-review badge and Relay chat action card integration.
- [x] Expose staging operations via standard MCP Tools and Resource (`workspace://staging/active`).

### Milestone 4: Block-Level State Canvas
- [x] Migrate raw `contentEditable` HTML strings to a structured Block Tree AST schema.
- [x] Stamp every document block with persistent unique IDs (`data-block-id`).
- [x] Implement surgical in-place block patch operators (`patch_block`, `insert_block`, `delete_block`, `move_block`).
- [x] Integrate block staging diffs into Pillar 3 sandbox PR branches.
- [x] Build Apple-tier interactive Block Canvas Inspector UI in Memory Dashboard.
- [x] Expose block AST via MCP Resource `workspace://docs/blocks` and canonical tools.

### Milestone 5: Code-Execution Matrix Engine
- [x] Build in-browser calculation substrate supporting Excel formulas (`SUM`, `AVERAGE`, `MIN`, `MAX`, `COUNT`, `IF`, `VLOOKUP`, arithmetic) with cycle detection (`#CYCLE!`).
- [x] Implement in-browser relational SQL query engine (`SELECT..WHERE..GROUP BY..ORDER BY..LIMIT`).
- [x] Enforce Rule 7 (Intersection Isolation Heuristic) and Rule 9 (Categorical Dropdown enums & Native `%` formatting).
- [x] Build isomorphic AST serializers (Grid <-> AST <-> Markdown <-> JSON).
- [x] Integrate surgical cell patch engine with Pillar 3 sandbox PR staging.
- [x] Expose MCP Resource `workspace://sheets/schema` and canonical matrix tools.
- [x] Build Apple-tier interactive Matrix Schema & Query Inspector in Memory Dashboard.

### Milestone 6: Constraint-Based Intent Scheduler
- [x] Implement constraint-satisfaction negotiation algorithm for meetings and deadlines.
- [x] Allow multi-agent parameter negotiation (e.g. Alex Agent $\leftrightarrow$ Elena Agent).
- [x] Rule 4 context-aware intent interpretation ("Tennis practice" -> `health_athletics`).
- [x] Temporal conflict matrix & automated resolution (`priority_bump`, `duration_compression`, `cooldown_compression`).
- [x] Expose MCP Resources (`workspace://schedule/calendar`, `workspace://schedule/negotiations`) and 5 canonical tools.
- [x] Build Apple-tier Intent Scheduler Inspector UI in Memory Dashboard.
- [x] Relay autonomous agent integration with interactive chat action cards.

### Milestone 7: Universal Ingestion & Schema Translator (Omni-Portal)
- [x] Connect Omni-Portal extraction outputs directly to `matrixSchemaEngine` (tables $\rightarrow$ typed columns).
- [x] Connect narrative extractions directly to `blockCanvasEngine` AST (paragraphs $\rightarrow$ block IDs).
- [x] Build multi-app entity decomposition pipeline routing single files across Sheets, Docs, and Tasks.
- [x] Expose MCP Resource `workspace://portal/queue` and canonical ingestion tools.

### Milestone 8: Directive Queue & Autonomous Agent Execution Loop (Tasks)
- [x] Implement block-linked pointer anchoring (`blk_...`) when creating tasks from Canvas or Whiteboard selections.
- [x] Build background autonomous agent runner for `agent` category directives.
- [x] Wire execution loop into Pillar 3 sandbox staging engine (`stage: true`) for redline review.
- [x] Expose MCP Resource `workspace://tasks/queue` and directive execution tools.

### Milestone 9: Spatial Topology & Visual Context Graph (Whiteboard)
- [x] Migrate 2D pixel coordinates to relational graph AST `(Node A) --[RELATION]--> (Node B)`.
- [x] Synchronize whiteboard graph nodes with `universalContextGraph.js`.
- [x] Implement bi-directional compiler (sketches $\rightarrow$ structured schema; agent plans $\rightarrow$ visual layout).
- [x] Expose MCP Resource `workspace://whiteboard/topology` and whiteboard diagram tools.

### Milestone 10: Real-Time Context Harvester & Multi-Agent In-Meeting Observer (Room)
- [x] Integrate lightweight real-time speech-to-intent pipeline for active Room audio streams.
- [x] Connect spoken consensus triggers to concurrent live state mutation in Canvas, Whiteboard, and Tasks.
- [x] Generate bundled post-meeting sandbox PR branches with atomic approval workflows.
- [x] Expose MCP Resource `workspace://room/live-context` and in-meeting harvester tools.

---

## 14. Live Changelog

- **2026-09-05:**
  - **Pillar 10 Completed (Real-Time Context Harvester & Multi-Agent Observer — Room):**
    - Created `roomObserverEngine.js` establishing an active in-room multi-agent observer substrate with three specialized background agents (Alex Agent: Systems/Whiteboard, Elena Agent: Finance/Matrix, Marcus Agent: Operations/Directives).
    - Built an isomorphic epistemic intent classification pipeline processing real-time speech turns into 5 categories: `DECISION_CONSENSUS`, `ACTION_DIRECTIVE`, `ARCHITECTURE_MUTATION`, `FINANCIAL_METRIC_UPDATE`, and `DOCUMENTATION_NOTE`, extracting monetary figures, sponsors, priorities, assignees, whiteboard relations, and financial metrics.
    - Implemented concurrent cross-app state mutators routing spoken intent to Canvas Docs (`blockCanvasEngine.js`), Whiteboard Topology (`spatialTopologyEngine.js`), Tasks Directive Queue (`directiveQueueEngine.js`), and Matrix Sheets (`matrixSchemaEngine.js`).
    - Integrated Pillar 3 sandbox staging safety: all in-meeting mutations bundle into an isolated PR branch (`pr_room_<meetingId>_<ts>`) for 1-click atomic approval or rejection upon call conclusion.
    - Registered 4 canonical tools in `docsToolRegistry.js`: `harvest_meeting_intent`, `mutate_workspace_from_audio`, `dispatch_in_room_directive`, and `get_room_live_context`, with staging diff handler in `docsToolExecutor.js`.
    - Exposed MCP Resource `workspace://room/live-context` with token-dense Markdown serialization (< 420 tokens = 97.6% savings over raw 18k transcripts) and registered in `universalMcpBridge.js` & `server/mcpTools.js`.
    - Built Apple-tier `RoomContextHarvesterInspector.jsx` with frosted glass, non-pill rectangular tabs (Rule 3), active state strictly termed "outline" (Rule 2), and touch-safe `onPointerDown` handling (Rule 6). Mounted in `MemoryDashboard.jsx` under `'room'`.
    - Integrated top-bar AI Observer active pill in `RoomLandingPage.jsx`.
    - Wired Relay agent intent classification (`isRoomHarvester`) and interactive action cards with touch-safe CTAs in `ExecutiveDirectMessages.jsx`.
    - Automated test suite `scripts/test-room-harvester.mjs`: **92/92 Tests Passed (100%)**.
    - Full regression suites across Pillars 2 through 9 verified: **100% Pass Rate**.
    - Production Vite build verified: **✓ built in 12.82s**.

- **2026-09-05:**
  - **Pillar 9 Completed (Spatial Topology & Visual Context Graph — Whiteboard):**
    - Created `spatialTopologyEngine.js` implementing a canonical Relational Graph AST (`nodes`, `edges`, `metadata`) with persistent typed IDs (`node_...`), explicit relation tags (`CALLS`, `READS_FROM`, `WRITES_TO`, `DEPENDS_ON`, `TRANSITIONS_TO`), in/out degree analytics, density calculation, and DFS topological cycle detection.
    - Built bi-directional code compilers: ANSI SQL DDL schema generator with foreign keys, OpenAPI 3.0.3 YAML spec compiler, executable XState state machine JSON generator, and token-dense Markdown architecture reporter.
    - Implemented multi-step agent plan visual synthesizer (`renderAgentPlanToTopology`) with automated 2D coordinates layout, and lossless bi-directional canvas object adapters (`whiteboardObjectsToTopology`, `topologyToWhiteboardObjects`).
    - Added 4 canonical tools to `docsToolRegistry.js` (`get_whiteboard_topology`, `compile_diagram_to_schema`, `render_agent_plan_to_canvas`, `patch_whiteboard_node`) and wired staging executor into `docsToolExecutor.js` (`targetApp: 'whiteboard'`).
    - Exposed MCP Resource `workspace://whiteboard/topology` and synchronized topological nodes into `universalContextGraph.js`.
    - Built Apple-tier `SpatialTopologyInspector.jsx` with 4 non-pill tab views (Spatial Graph, Compiler Studio, Synthesis Studio, Universal Context Sync) and mounted in `MemoryDashboard.jsx`.
    - Integrated Relay agent with `isWhiteboardTopology` intent classifier and touch-safe `onPointerDown` action cards in `ExecutiveDirectMessages.jsx`.
    - Automated test suite `scripts/test-spatial-topology.mjs`: **93/93 Tests Passed (100%)**.
    - Production Vite build verified: **✓ built in 29.75s**.

- **2026-09-05:**
  - **Pillar 8 Completed (Directive Queue & Autonomous Agent Execution Loop — Tasks):**
    - Created `directiveQueueEngine.js` featuring three-tier ownership taxonomy (`user`, `agent`, `team`), priority architecture (`P0`..`P3`), deterministic lifecycle states (`PENDING`, `RUNNING`, `STAGED`, `COMPLETED`), and bidirectional block-linked AST pointer anchoring (`blk_...`).
    - Implemented atomic checkout locking (`checkoutNextAgentDirective`) and autonomous background runner loop (`executeAgentDirective`) with Pillar 3 sandbox staging PR isolation (`pr_directive_...`).
    - Added 4 canonical tools to `docsToolRegistry.js` (`queue_agent_directive`, `link_directive_to_block`, `checkout_agent_directive`, `complete_agent_directive`) and exposed MCP Resources (`workspace://tasks/queue`, `workspace://tasks/active`).
    - Built Apple-tier `DirectiveQueueInspector.jsx` with 4 tab views (Three-Tier Matrix, Block AST Pointers, Runner Console, Staged PR Sandboxes) and mounted in `MemoryDashboard.jsx`.
    - Integrated Relay agent with `isDirectiveQueue` intent classifier and touch-safe action cards.
    - Automated test suite `scripts/test-directive-queue.mjs`: **97/97 Tests Passed (100%)**.

- **2026-09-05:**
  - **Pillar 7 Completed (Universal Ingestion & Schema Translator — Omni-Portal):**
    - Created `omniPortalEngine.js` featuring multi-format detection (DOCX, PPTX, XLSX, PDF, CSV, MD, TXT, JSON), Dual-View Ingestion architecture (Human Original vs. Clean AST), and cross-app entity decomposition across Canvas blocks, Matrix tables, Directive Queue tasks, and Universal Context Graph.
    - Built lossless schema translator complying with Rule 7 intersection cell isolation and Rule 9 categorical dropdown validations.
    - Integrated with Pillar 3 sandbox PR staging (`stageIngestionPackage`) and exposed MCP Resources (`workspace://portal/queue`, `workspace://portal/manifest`).
    - Added 3 canonical tools to `docsToolRegistry.js` (`ingest_file_portal`, `query_portal_manifest`, `translate_schema_portal`).
    - Built Apple-tier `OmniPortalInspector.jsx` with 4 tab views and mounted in `MemoryDashboard.jsx`.
    - Integrated Relay agent with `isIngestDocument` intent classifier and touch-safe action cards.
    - Automated test suite `scripts/test-omni-portal.mjs`: **67/67 Tests Passed (100%)**.

- **2026-09-04:**
  - **Pillar 6 Completed (The Constraint-Based Intent Scheduler & Multi-Agent Negotiation Substrate):**
    - Created `intentSchedulerEngine.js` featuring CSP solver with forward checking, multi-objective utility scoring $U(\text{slot}) \in [0, 1]$, and Rule 4 context-aware intent interpretation mapping colloquial prompts ("Tennis practice", "Board prep sync") to systemic specs.
    - Implemented multi-agent alternating-offer parameter negotiation protocol with Pareto convergence and state machine (`PROPOSED`, `COUNTER_OFFERED`, `AGREED`, `COMMITTED`).
    - Implemented temporal conflict detection and automated resolution strategies (`priority_bump`, `duration_compression`, `cooldown_compression`) with seamless Pillar 3 sandbox staging (`stage: true`).
    - Added 5 canonical tools to `docsToolRegistry.js` (`solve_schedule_constraints`, `negotiate_multi_agent_schedule`, `detect_schedule_conflicts`, `resolve_schedule_conflict`, `commit_scheduled_event`) and wired staging execution into `docsToolExecutor.js`.
    - Exposed MCP Resources `workspace://schedule/calendar` and `workspace://schedule/negotiations` alongside tool declarations in `universalMcpBridge.js` and `server/mcpTools.js`.
    - Integrated Relay Autonomous Agent (`relayAgentService.js`) to classify scheduling intents, run negotiations, and render interactive action cards in `ExecutiveDirectMessages.jsx` with 1-click confirmation and inspector navigation.
    - Recorded scheduling nodes and participant edges in `universalContextGraph.js`.
    - Built Apple-tier `IntentSchedulerInspector.jsx` featuring 4 non-pill tab views (Calendar & Timeline, Multi-Agent Studio, Constraint Playground, Conflict Center) and mounted in `MemoryDashboard.jsx`.
    - Automated test suite `scripts/test-intent-scheduler.js`: **20/20 Tests Passed** (163 total substrate tests passing across all 6 Pillars).
    - Production Vite build verified: **✓ built in 24.55s**.

- **2026-09-04:**
  - **Pillar 5 Completed (The Matrix Engine: Code Execution & Schema Validation Substrate):**
    - Created `matrixSchemaEngine.js` featuring strict column schema definitions, protocol-level data validation (Rule 9 dropdown enums and native `%` formatting), and Rule 7 intersection-safe schema inference.
    - Implemented in-browser formula evaluation substrate supporting `SUM`, `AVERAGE`, `MIN`, `MAX`, `COUNT`, `COUNTA`, `IF`, `VLOOKUP`, and arithmetic expressions with topological recalculation and circular reference cycle detection (`#CYCLE!`).
    - Built in-browser relational SQL query engine (`queryMatrixSql`) supporting `SELECT`, `WHERE`, `GROUP BY`, `ORDER BY`, and `LIMIT` directly over spreadsheet grid data in `~2ms`.
    - Created isomorphic bi-directional serializers: `gridToMatrixAst`, `matrixAstToGrid`, `matrixAstToMarkdown` (token savings up to 80%), and `matrixAstToJson`.
    - Integrated surgical patch engine `patchMatrixCells` with Pillar 3 staging engine (`options.stage: true`), generating cell-level redline diffs in sandbox PR branches.
    - Added 5 canonical tools to `docsToolRegistry.js` (`validate_matrix_schema`, `patch_matrix_cells`, `query_matrix_sql`, `add_column_with_schema`, `evaluate_matrix_formulas`).
    - Exposed MCP Resource `workspace://sheets/schema` and updated `workspace://sheets/active` to serialize live active matrices dynamically.
    - Built `MatrixSchemaInspector.jsx` and mounted the "Matrix Engine" tab in `MemoryDashboard.jsx`.
    - Automated test suite `scripts/test-matrix-engine.js`: **25/25 Tests Passed** (143 total substrate tests passing across Pillars 2, 3, 4, and 5).
    - Production Vite build verified: **✓ built in 37.16s**.
  - **Pillar 4 Completed (The Canvas: Block-Level State IDs & Surgical Patch Engine):**
    - Created `blockCanvasEngine.js` implementing a canonical Abstract Syntax Tree (AST) Document Model with unique block IDs (`blk_...`), monotonic versioning, and type tagging.
    - Built bi-directional isomorphic serializers: `htmlToBlockTree`, `blockTreeToHtml`, and `blockTreeToMarkdown`.
    - Implemented surgical patch operations: `patchBlock`, `insertBlock`, `deleteBlock`, `moveBlock`, and `batchPatchBlocks`, eliminating full-document re-streaming and human-agent edit race conditions.
    - Integrated with `docsCommandApi.js` (`getBlockTreeSnapshot`, `patchBlockById`, `insertBlockAdjacent`, `deleteBlockById`).
    - Registered 7 canonical block tools in `docsToolRegistry.js` and wired surgical block redline diffs into `docsToolExecutor.js`.
    - Exposed MCP Resource `workspace://docs/blocks` and block tools via `universalMcpBridge.js`.
    - Built `BlockCanvasInspector.jsx` and mounted the "Canvas AST" tab in `MemoryDashboard.jsx`.
    - Automated test suite `scripts/test-block-canvas.js`: **59/59 Tests Passed** (118 total substrate tests passing).
    - Production Vite build verified: **✓ built in 43.01s**.
  - **Pillar 3 Completed (Human-in-the-Loop "Approval & Sandbox" Engine):**
    - Created `workspaceStagingEngine.js` featuring isolated multi-app sandbox branches (`pr_<timestamp>_<hash>`), reactive event subscriptions (`subscribeToStaging`), and full lifecycle management (`createStagingBranch`, `stageMutation`, `toggleMutationSelection`, `approveAndCommitBranch`, `rejectBranch`).
    - Integrated Google `diff-match-patch` semantic diff algorithm in `computeVisualDiff` generating token-level redline additions (`+1`), deletions (`-1`), and equality chunks (`0`) with character delta statistics.
    - Updated `docsToolExecutor.js` with `options.stage: true`, seamlessly intercepting mutating tool calls and routing them into isolated staging branches rather than modifying production documents.
    - Built `WorkspaceStagingReviewModal.jsx` featuring Apple-tier minimalism, unified & side-by-side split diff views, per-mutation cherry-pick checkboxes, and 1-click atomic commit / rejection.
    - Mounted staging review modal in `App.jsx` with global hook `window.__REGAARDER_OPEN_STAGING_MODAL__` and floating executive PR quick-review badge.
    - Enhanced `ExecutiveDirectMessages.jsx` with dedicated Staging PR Action Card displaying `<GitPullRequest />` icon, "⏳ Pending Review" badge, and "Review Redline Diff & Merge" action button.
    - Exposed MCP Resource `workspace://staging/active` and 4 staging Tools (`stage_workspace_mutation`, `get_staged_diff`, `approve_staged_branch`, `reject_staged_branch`).
    - Automated test suite `scripts/test-staging-engine.js`: **41/41 Tests Passed**.
    - Production Vite build verified: **✓ built in 1m 1s**.
  - **Pillar 2 Completed (Native Model Context Protocol Layer):**
    - Implemented full MCP specification (`protocolVersion: "2024-11-05"`) in `server/mcpTools.js` and `server/index.js`.
    - Added standard Server-Sent Events (`/mcp/sse`) and JSON-RPC HTTP (`/api/mcp`) transports.
    - Created `universalMcpBridge.js` providing isomorphic in-memory MCP Server & Client for in-browser and desktop agents.
    - Standardized 7 token-dense Resources (`workspace://graph/context`, `workspace://memory/bank`, `workspace://docs/active`, etc.), cutting context token consumption by up to 80% over raw HTML.
    - Standardized 58 canonical Tools with JSON Schema inputs and dry-run staging (`validate_tool_call`).
    - Standardized 5 executive Prompts (`executive_briefing`, `risk_and_rule_audit`, `cross_app_propagation`, `decision_record_memo`, `financial_model_projection`).
    - Built Apple-tier interactive MCP Protocol Inspector in `MemoryDashboard.jsx` with live token counters, sandbox execution console, and 1-click Claude Desktop & Cursor config exporter.
    - Integrated Relay Agent (`relayAgentService.js`) to consume MCP tools and resources.
    - Automated test suite `scripts/test-mcp-full-protocol.js`: **18/18 Tests Passed**.
  - **Pillar 1 Completed (Universal Context Graph & Memory Bank):**
    - Created `universalContextGraph.js` with persistent memory bank (`regaarder_memory_bank_v1`), reactive graph subscription bus, automated cross-workspace mutation propagation (`mutateAndPropagate`), and token-dense context extraction (`getAgentContext`).
    - Integrated with Relay Agent: Added natural memory instruction detection (`isMemoryInstruction`) and automatic graph propagation on document/task creation.
    - Integrated with Docs Command API: Wired `notifyDocumentMutated` to keep the context graph continuously synchronized with human typing and range replacements.
    - Integrated with Memory Dashboard: Added live `allDecisions` rendering, reactive state subscriptions, and the "Rules & Propagation" tab with live auto-propagation audit logging.
    - Created Master Roadmap: Authored `MACHINE_EXECUTION_SUBSTRATE_ROADMAP.md` tracking the dual-mode evolution toward the machine execution substrate.


