# Postmortem: Workspace "Ask Memory" AI Synthesis Failure & Engine Architecture

## Incident Summary

In September 2026, users reported a critical failure when querying Workspace Memory via the Spotlight / Omni-Search interface (`GlobalWorkspaceSearchModal`). Whenever questions were submitted in "Ask Memory" mode (e.g., *"who is denko ?"*, *"what is benko's signature outfits?"*), the engine immediately returned a generic failure message:

> *"Unable to synthesize workspace data at this moment. Please check your query and try again."*

Simultaneously, two related systemic issues were uncovered:
1. **Document Classification Drift**: Compose documents were misclassified as Whiteboards (displayed as `Whiteboard > Untitled Document 1` instead of `Docs > Untitled Document 1`), skewing category filters and source prioritization.
2. **Hardcoded Model Detection & String Artifacts**: The system displayed static fallback strings (`Gemini 2.0 Flash` or `.0 Flash`) rather than accurately detecting and routing to active local LLM engines (e.g., `gemma3:1b` via Ollama), and lacked a dedicated model selection control in the Workspace Memory interface.

Following the fix, the synthesis engine successfully grounds against indexed documents and brand guidelines using local Ollama models (`gemma3:1b`), user-selectable model switching is fully functional and persisted, and document categorization is strictly accurate.

---

## Impact

- **End-User AI Ingestion Blocked**: The core RAG (Retrieval-Augmented Generation) capability of the application was completely unusable, dropping all incoming memory queries to the fallback error response.
- **Search Category Inaccuracy**: Users attempting to filter workspace items by `Docs` received zero results for new or untitled documents because they were wrongly routed to `Whiteboard`.
- **Relay Chat Polish Degradation**: AI greetings in Relay conversations rendered with corrupted model names (e.g. `gemma3:1b.5:latest.0 Flash.`).
- **Absence of User Model Control**: Users running offline local LLMs had no visual feedback or selection control within the Workspace Memory settings to choose between local engines or configured cloud models.

---

## Detection & Symptoms

1. **User Inquiry**: "same issue, when i ask memory it display like in image 2 and docs as in image 3, so i memory ettings could asdd a model picker, and ensure modal runs perfectly"
2. **Observed Error in Logs/Console**:
   - `ReferenceError: matched is not defined` inside `synthesizeWorkspaceKnowledge` (`GlobalWorkspaceSearchEngine.js:1570`).
   - The outer `catch (err)` block caught this runtime exception and returned the fallback error object:
     ```js
     {
       answer: "Unable to synthesize workspace data at this moment. Please check your query and try again.",
       sources: []
     }
     ```
3. **Whiteboard Classification**: In `GlobalWorkspaceSearchEngine.js`, `buildWorkspaceIndex()` checked:
   ```js
   const isWhiteboard = Array.isArray(doc.whiteboardWidgets);
   ```
   Because compose documents initialize with `whiteboardWidgets: []`, `Array.isArray([])` evaluates to `true`, causing every standard document to be indexed with `type: 'whiteboard'` and `workspace: 'whiteboard'`.

---

## Root-Cause Analysis

### 1. Scope Variable Dropout (`matched`)
During a prior refactoring of `synthesizeWorkspaceKnowledge`, the declaration line that queries the workspace index was accidentally dropped or decoupled:
```javascript
// Missing declaration:
const matched = (workspaceIndex && workspaceIndex.length > 0)
  ? queryWorkspace(workspaceIndex, query, activeFilter).slice(0, 8)
  : [];
```
When lines further down attempted to iterate `matched.map(...)` to construct `contextBlocks`, Javascript threw an uncaught `ReferenceError: matched is not defined`. Because the function was wrapped in a global `try/catch`, it was swallowed and presented as an AI generation failure.

### 2. Flawed Array Truthiness Heuristic
In `GlobalWorkspaceSearchEngine.js:527`:
```javascript
// Defective check:
const isWhiteboard = Array.isArray(doc.whiteboardWidgets);
```
In JavaScript, an empty array `[]` is a truthy object and satisfies `Array.isArray`. Since every blank Compose document defines `whiteboardWidgets: []`, this condition matched 100% of Compose documents, misclassifying them as whiteboards and isolating them from the `Docs` filter.

### 3. Model Engine Decoupling & Brittle Greeting Formatting
- The search modal was receiving `detectedModels` and `selectedModel` props from `App.jsx`, but did not independently verify live local endpoints or provide a user-facing switcher.
- When an active local model ID (e.g. `gemma3:1b`) was synchronized to Relay chat, a naive regex replacement in `ExecutiveDirectMessages.jsx` matched the word `Gemini` or parts of `Gemini 2.0 Flash`, leaving `.0 Flash` appended to the end of the newly substituted model name.

---

## Chronology & Detailed Fix Process

### Step 1: Repairing RAG Pipeline Scope & Guard Clauses
**File Modified**: `src/services/GlobalWorkspaceSearchEngine.js`
1. Re-established the query matching definition:
   ```javascript
   const matched = (workspaceIndex && workspaceIndex.length > 0)
     ? queryWorkspace(workspaceIndex, query, activeFilter).slice(0, 8)
     : [];
   ```
2. Added defensive null-checking in `itemMatchesWorkspaceFilter`:
   ```javascript
   function itemMatchesWorkspaceFilter(item, filter) {
     if (!item) return false;
     ...
   }
   ```
3. Ensured `isErrorOrEmpty` does not discard valid negative or concise LLM answers.
4. Embedded `customModel` and `customProvider` into the `resolvedConfig` object passed into `callAiWithTools`, ensuring downstream tool executors respect the caller's chosen model.

### Step 2: Correcting Document Classification Heuristics
**File Modified**: `src/services/GlobalWorkspaceSearchEngine.js`
Refactored the whiteboard detection logic from array presence to non-empty array length:
```javascript
const isWhiteboard = Array.isArray(doc.whiteboardWidgets) && doc.whiteboardWidgets.length > 0;
```
This restored Compose documents to their proper namespace (`type: 'document'`, `workspace: 'compose'`), mapping them cleanly under the **Docs** tab.

### Step 3: Engineering the Dual-Surface AI Model Picker
**File Modified**: `src/components/search/GlobalWorkspaceSearchModal.jsx`
1. **Direct Ollama Discovery Probe**:
   Integrated `detectLocalLLMServers({ timeoutMs: 2500 })` from `orbAiService.js` on mount to discover online Ollama and LM Studio endpoints without relying solely on parent component propagation.
2. **Unified Model Registry**:
   Constructed `availableModels` via `useMemo`, merging probed local models, `detectedModels` from `App.jsx`, and configured cloud providers (Gemini, Claude, OpenAI).
3. **Session & LocalStorage Persistence**:
   Initialized `activeMemoryModelId` from `localStorage.getItem('regaarder_memory_selected_model')`, persisting user selections immediately upon change.
4. **Primary Navigation Chip**:
   Positioned an executive-style selector badge next to the Cognitive Lens (`activePersona`) in the search modal toolbar, featuring a live pulsing green dot for local engines, model name truncation, and a quick dropdown.
5. **Settings 4-Card Expansion**:
   Updated the `Workspace Memory & Brand Controls` modal layout from `grid md:grid-cols-3` to `grid sm:grid-cols-2 lg:grid-cols-4 gap-3.5`, adding the **AI Model Engine** card:
   - Displays real-time connection status (`Local Offline • Zero Cloud Egress`)
   - Highlights the active engine with model name and provider badge
   - Lists all detected engines with memory sizes and single-click switching
   - Includes a live `rescan` button to re-probe local daemons on demand.

### Step 4: Hardening Chat Welcome Greetings
**File Modified**: `src/components/chat/ExecutiveDirectMessages.jsx`
Replaced multi-step regex string replacements with a deterministic template string generator:
```javascript
const updateAiWelcomeGreeting = (oldText, newModelName) => {
  if (!oldText || typeof oldText !== 'string') return oldText;
  const cleanModel = (newModelName || 'gemma3:1b').replace(/\.0\s*Flash/gi, '').trim() || 'gemma3:1b';
  if (oldText.includes('All communications are end-to-end encrypted') || oldText.includes('Welcome to a new chat session with') || oldText.includes('.0 Flash')) {
    return `Welcome to a new chat session with ${cleanModel}. All communications are end-to-end encrypted with zero-knowledge keys.\n\nReady for strategy briefings, document synthesis, or workspace questions.`;
  }
  return oldText;
};
```

---

## Verification & Results

1. **Local Synthesis Live Verification**:
   - Tested query: `"what is benko's signature outfits?"`
   - Local Ollama `gemma3:1b` synthesized a grounded response citing Document Resource 2 (*"Benko Vance, a 42-year-old hydro-geologist based in the Atacama, typically designs with a faded copper-toned canvas jacket, heavy leather boots, and strategically-placed blue stains..."*).
2. **UI Model Switcher Verification**:
   - Secondary toolbar accurately renders `[● gemma3:1b v]`.
   - Settings modal reflects the 4th card with available engines and persistence in `localStorage`.
3. **Compilation & Build**:
   - Executed `npm run build` with Vite 8.2.1: **0 errors, all 2092 modules transformed cleanly**.

---

## Lessons Learned & Future Prevention

1. **Zero Silent Fallbacks in Development**:
   Top-level `catch (err)` blocks in synthesis services must log detailed error stacks with `console.error` rather than returning friendly fallbacks silently, preventing syntax/reference regressions from masquerading as LLM timeouts.
2. **Defensive Array Semantics**:
   Never use `Array.isArray(x)` alone to determine if a schema represents a specialized document subtype. Always verify `Array.isArray(x) && x.length > 0` or check an explicit `type` enum property.
3. **Template Composition Over Mutation**:
   Avoid applying regex transforms onto user-facing localized or generated greeting strings. Reconstruct the message from atomic state variables (`modelName`, `sessionKey`) using a unified generator function.
4. **Local AI Observability**:
   When supporting local LLMs, always expose an active model indicator and switcher directly adjacent to the input surface, giving the user immediate confirmation of privacy guarantees and engine readiness.
