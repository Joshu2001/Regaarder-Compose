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
| **Pillar 3** | Human-in-the-Loop "Approval & Sandbox" Engine | `40%` (Runtime Ready) | [`docsToolExecutor.js`](file:///c:/Users/user/Downloads/Project%20MOAT/Regaarder%20Compose/src/services/docsToolExecutor.js) (`isDryRun`, transaction history, rollback) |
| **Pillar 4** | The Canvas (Block-Level State IDs) | `30%` (Command API) | [`docsCommandApi.js`](file:///c:/Users/user/Downloads/Project%20MOAT/Regaarder%20Compose/src/services/docsCommandApi.js) |
| **Pillar 5** | The Matrix Engine (Code Execution & Schema) | `25%` (Visual Grid) | [`SheetRenderingEngine.jsx`](file:///c:/Users/user/Downloads/Project%20MOAT/Regaarder%20Compose/src/components/SheetRenderingEngine.jsx) |
| **Pillar 6** | The Intent Scheduler (Constraint Engine) | `20%` (Specified) | [`VERTICAL_INTEGRATIONS.md`](file:///c:/Users/user/Downloads/Project%20MOAT/VERTICAL_INTEGRATIONS.md) |

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

## 5. Upstream Roadmap: Steps to Complete Pillars 3 Through 6

### Milestone 2: Native Model Context Protocol (MCP) Layer
- [x] Implement open-standard JSON-RPC server transport (`protocolVersion: "2024-11-05"`).
- [x] Expose `resources/` for Docs, Sheets, and Memory feeds (7 token-dense URIs).
- [x] Expose `tools/` mapping to canonical registry & state engine (58 tools).
- [x] Expose `prompts/` for executive workflows (5 pre-engineered templates).
- [x] Expose SSE transport (`/mcp/sse`) and client-side isomorphic bridge (`universalMcpBridge.js`).
- [x] Apple-tier interactive MCP Protocol Inspector in Memory Dashboard.

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

## 6. Live Changelog

- **2026-09-04:**
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
