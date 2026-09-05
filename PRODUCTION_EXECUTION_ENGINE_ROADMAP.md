# Production Execution Engine: From Protocol Scaffold to Live Runtime

**Status:** IN PROGRESS  
**Objective:** Transition Regaarder from an architectural protocol scaffold into a production-grade, closed-loop machine execution operating system where live workspace state, real LLM reasoning, and external MCP clients interact in real time.

---

## 1. Executive Summary & Problem Statement

While the 10 substrate pillars established clean mathematical models, AST schemas, and client-side engines (Block AST, Matrix SQL, Spatial DAG, Directive Queue, Room Harvester), two critical architectural gaps remain:

1. **Disconnected MCP Server:** The standalone Node MCP server (`server/mcpTools.js` & `server/index.js`) returns simulated text strings and static mock schemas because it lacks a live bi-directional bridge to the active browser workspace session.
2. **Heuristic Agent Harness:** Relay agents currently rely on regex intent classifiers and mocked scenario arrays rather than live multi-turn function calling against frontier LLMs (Gemini, Claude, OpenAI, Ollama) and real audio input.

This roadmap details the 5 prioritized phases required to deliver full, production-grade closed-loop execution.

---

## 2. Prioritized Implementation Phases

```
┌─────────────────────────────────────────────────────────────────────────────┐
│                   PRODUCTION EXECUTION ENGINE PIPELINE                      │
├──────────────────────────────┬──────────────────────────────┬───────────────┤
│  PHASE 1: LIVE STATE BUS     │  PHASE 2: MCP WS BRIDGE      │  PHASE 3: LLM │
│  (Cross-App Reactive UI)     │  (Server <-> Browser Bridge) │  (Tool-Calling│
├──────────────────────────────┼──────────────────────────────┼───────────────┤
│ • Cross-app event bus        │ • Socket.IO /ws/mcp-bridge   │ • Gemini/GPT/ │
│ • Room -> Whiteboard ->      │ • Server forwards MCP tools  │   Claude/Ollma│
│   Sheets -> Compose live DOM │   to live React DOM runtime  │ • True agentic│
│ • No page reload required    │ • Real before/after diffs    │   tool loop   │
├──────────────────────────────┴──────────────────────────────┴───────────────┤
│  PHASE 4: STAGING GATES & SECURITY │  PHASE 5: LIVE MICROPHONE STREAM       │
├────────────────────────────────────┼────────────────────────────────────────┤
│ • Destructive tool call approvals  │ • Browser Web Speech API continuous STT│
│ • Cherry-pickable PR review modal  │ • Real-time speaker turn ingestion     │
│ • Full cryptographic audit trail   │ • Live epistemic intent extraction     │
└────────────────────────────────────┴────────────────────────────────────────┘
```

---

## 3. Phase Details

### Phase 1: End-to-End Browser State Bus & Multi-App Reactivity — **[100% COMPLETED]**
- **File:** `src/services/workspaceStateBus.js`
- Connects all disparate application states into a reactive pub/sub event bus:
  - Spoken consensus emitted by `roomObserverEngine` triggers:
    1. Document block addition in `blockCanvasEngine` and updates active Compose editor.
    2. Spatial node insertion in `spatialTopologyEngine` and re-renders Whiteboard canvas.
    3. Cell value patch in `matrixSchemaEngine` and updates active Sheet table.
    4. Action item queued in `directiveQueueEngine` and displays in Tasks queue.
- Verified by automated test suite `scripts/test-workspace-state-bus.mjs`: **45/45 Passed (100%)**.
- Clean production Vite build verified (`npm run build`).

### Phase 2: Live Bi-Directional WebSocket Bridge for MCP — **[100% COMPLETED]**
- **Files:** `server/mcpBridgeServer.js`, `src/services/mcpBrowserClient.js`, `server/mcpTools.js`, `server/index.js`, `src/App.jsx`
- Replaces static responses in `server/mcpTools.js` with live browser execution:
  - When an external client (Claude Desktop, Cursor, or CLI) sends `resources/read` to `/api/mcp` or `/mcp/sse`:
    - Server requests live state from connected browser client over WebSocket bridge.
    - Browser returns real AST document, active sheets grid, whiteboard DAG, or memory bank.
  - When an external client sends `tools/call` (`patch_block`, `mutate_workspace_from_audio`, `append_content`, etc.):
    - Server forwards payload to active browser over WebSocket.
    - Browser executes tool via `docsToolExecutor.js`, updates DOM, and stages/commits PR.
    - Real before/after diff and transaction ID are returned to the MCP client.
  - Graceful fallback to offline server execution and SQLite if no browser window is connected.
- Verified by automated test suite `scripts/test-mcp-bridge-live.mjs`: **48/48 Passed (100%)**.
- Clean production Vite build verified (`npm run build`).

### Phase 3: Production LLM Provider Abstraction & Dynamic Tool Calling — **[100% COMPLETED]**
- **Files:** `src/services/llmProviderService.js`, `src/services/relayAgentService.js`, `src/App.jsx`
- Connects frontier models with native tool-calling capabilities:
  - Providers supported: Google Gemini (`gemini-2.0-flash`, `gemini-1.5-pro`), OpenAI (`gpt-4o`), Anthropic (`claude-3-5-sonnet`), and Local Ollama.
  - Maps all canonical tools from `docsToolRegistry.js` into standard JSON tool schemas.
  - Implements multi-turn agent execution loop: Model reasons $\rightarrow$ Calls tools $\rightarrow$ Client executes $\rightarrow$ State bus updates $\rightarrow$ Model returns final synthesis.
- Verified by automated test suite `scripts/test-llm-provider-loop.mjs`: **46/46 Passed (100%)**.
- Clean production Vite build verified (`npm run build`).

### Phase 4: Security, Permission Gates & Staging Redlines — **[100% COMPLETED]**
- **Files:** `src/services/workspaceStagingEngine.js`, `src/services/docsToolExecutor.js`, `src/components/staging/WorkspaceStagingReviewModal.jsx`
- Guarantees human-in-the-loop control:
  - Destructive tools (`delete_block`, `clear_content`, `clear_document`, `delete_task`, `delete_deck_slide`, `drop_column`, `reset_memory`) require explicit user confirmation.
  - Automatic sandbox staging diversion (`forcedStaging: true`) intercepts unconfirmed destructive tools before production state mutation.
  - Granular cherry-pick discard (`rejectStagedMutation`) and selective commit (`commitCherryPickedMutations`) with state bus events (`STAGING_MUTATION_REJECTED`, `STAGING_PR_COMMITTED`, `STAGING_PR_REJECTED`).
  - Executive review modal with security clearance badges (`ShieldAlert`, `ShieldCheck`), non-pill rectangular tabs, and touch-safe `onPointerDown` handlers.
- Verified by automated test suite `scripts/test-staging-security-gates.mjs`: **63/63 Passed (100%)**.
- Clean production Vite build verified (`npm run build`).

### Phase 5: Live Microphone Audio Stream (Speech-to-Intent Pipeline) — **[100% COMPLETED]**
- **Files:** `src/services/roomAudioStreamService.js`, `src/services/roomObserverEngine.js`, `src/components/room/RoomContextHarvesterInspector.jsx`, `src/App.jsx`
- Continuous acoustic capture and speech-to-intent pipeline:
  - Physical microphone capture via `navigator.mediaDevices.getUserMedia`.
  - Web Audio API real-time decibel energy analysis (`AnalyserNode`, RMS volume tracking) powering smooth reactive visualizers.
  - Continuous Web Speech API recognition with auto-reconnect and pipeline ingestion into `ingestSpeechTurn`.
  - Deterministic turn simulation (`simulateLiveAudioTurn`) for headless/test environments.
  - Global registration `window.__REGAARDER_AUDIO_STREAM__` with clean unmount teardown.
- Verified by automated test suite `scripts/test-room-audio-stream.mjs`: **74/74 Passed (100%)**.
- Clean production Vite build verified (`npm run build`).

---

### Phase 6 / Pillar 11: AI-Native Browser Execution Gateway & Meneur Web Extension Engine — **[IN PROGRESS]**

Transforms the browser from a passive viewing canvas into an **Autonomous Execution Engine & Web Action API Bridge**, paired with the **Meneur Executive Command Deck**:

1. **Semantic DOM Translation (Token-Optimized Web View):**
   - Strips visual bloat (CSS, ads, trackers, styling) and generates clean accessibility trees with deterministic node references (`Button @e14: Submit Form`, `Input @e15: Search`).
   - Slashes LLM token consumption by >90% compared to raw HTML/DOM payloads.
   - Declarative intent executor (`executeDeclarativeWebIntent`) translates high-level prompts into discrete node interactions.

2. **Headless Action Sandbox & Structural Data Conversion:**
   - Background multi-step external task runner (checking vendor portals, form processing).
   - Structural Data Conversion: Automatically translates scraped HTML/JS tables directly into typed Matrix ASTs or Canvas block trees.

3. **Vaulted Identity State (Headless OAuth & Session Store):**
   - Securely stores and inherits authenticated session cookies, bearer tokens, and OAuth keys per domain (`storeVaultedSession`, `getVaultedSession`) without manual re-entry.

4. **Meneur Command Deck Subsystem:**
   - **Sidebar Command Deck:** Slide-over persistent dock displaying daily timetable, priority directives, and active time-blocks without tab disruption.
   - **Contextual Focus & Site Blocking:** Domain filter synchronized with active tasks/schedule; automatically suppresses distracting feeds/domains during deep-work blocks.
   - **Instant Directive Capture:** Highlight text on any page to immediately create calendar directives/tasks via keyboard shortcut (`Cmd/Ctrl+Shift+D`).
   - **Tab & Context Archiving:** Automatically groups and archives tab sessions linked to specific schedule blocks with 1-click restore.

---

## 4. Verification & Definition of Done
1. **Live Cross-App Mutation:** Spoken or typed command in Room instantly mutates Whiteboard, Sheets, and Compose live on screen without page reload.
2. **MCP Live Bridge:** External `curl` or MCP client calls `tools/call` on `http://localhost:3001/api/mcp` and the active browser window visibly changes.
3. **Real LLM Function Calling:** Querying Relay triggers true multi-step tool calls with Gemini/OpenAI/Claude API keys.
4. **Live Microphone Ingestion:** Speaking into the microphone yields real transcribed turns and categorized intent cards.
5. **Web Execution Gateway & Command Deck:** Semantic DOM translation produces >90% token reduction, vaulted identity safely stores credentials, site blocking intercepts distraction domains during focus blocks, and instant directive capture creates verified tasks.
6. **Zero Test Regressions:** All 788+ automated tests continue to pass with 100% success rate.
