# Sheet Engine Architecture

> **Module:** `src/utils/sheetEngineService.js` + `src/components/SheetRenderingEngine.jsx`
> **Role:** AI → Tool-Call → Backend Validator → Rendering Engine

---

## 1. The Core Principle

The AI **proposes**. The backend **decides**.

The Sheet Rendering Engine follows the same architectural contract as the Deck Presentation Rendering Engine: the AI never manipulates the canvas directly. Instead, it outputs a **Sheet Specification (JSON/DSL)** — a structured, grammar-constrained object — which is validated by the backend before the renderer ever touches the UI.

```
User Prompt
    ↓
AI (Gemini — structured schema mode)
    ↓
Sheet Specification JSON
    ↓
createSheet(spec)              ← backend gatekeeper
    ↓
validateSheetSpec(spec)        ← returns { ok: true } or { ok: false, errors[] }
    ↓
if ok → SheetRenderingEngine(validatedSpec)
if !ok → Error surfaced to User via AI chat
    ↓
Result reported back to User
```

---

## 2. Why the Tool-Call Layer Exists

Without this separation:
- The AI could render arbitrary layouts, pick invalid palettes, or produce broken column types.
- There is no single source of truth for what constitutes a valid sheet.
- Undo/redo, versioning, and permissions checks have no natural insertion point.

**With `createSheet()`:**
| Concern | Owner |
|---|---|
| Layout correctness | `validateSheetSpec()` in `sheetEngineService.js` |
| Palette / typography grammar | `ALLOWED_*` constant sets |
| Column type safety | `COLUMN_TYPES` allow-list |
| Row key consistency | Validator cross-checks row keys against declared columns |
| Undo snapshot | `options.onUndoPush` callback in `createSheet()` |
| Error surfacing | `createSheet()` returns `{ success: false, error, validationErrors[] }` |

---

## 3. Module Responsibilities

### `src/utils/sheetEngineService.js`

| Export | Type | Description |
|---|---|---|
| `ALLOWED_LAYOUTS` | `string[]` | The 4 valid layout types |
| `ALLOWED_PALETTES` | `string[]` | The 4 valid palette names |
| `ALLOWED_TYPOGRAPHY` | `string[]` | The 3 valid typography modes |
| `COLUMN_TYPES` | `string[]` | The 7 valid column type identifiers |
| `SHEET_SPEC_GEMINI_SCHEMA` | `object` | Gemini API `responseSchema` — enforces JSON shape at the model level |
| `SHEET_ENGINE_SYSTEM_PROMPT` | `string` | The "grammar rulebook" given to Gemini — constrains what the AI may propose |
| `validateSheetSpec(spec)` | `function` | Pure validator. Returns `{ ok: true }` or `{ ok: false, errors[] }`. No side effects. |
| `createSheet(spec, options?)` | `function` | The AI-callable tool. Calls `validateSheetSpec`, normalises the spec, triggers undo snapshot, returns `{ success, validatedSpec?, error?, validationErrors? }`. |
| `invokeSheetEngineTool(prompt, callGemini)` | `async function` | Orchestrates the full pipeline: Gemini call → parse → `createSheet()` → normalised result. |

### `src/components/SheetRenderingEngine.jsx`

Accepts **two** prop modes:

| Prop | Mode | Path |
|---|---|---|
| `layoutKey: string` | Static preset | Uses `SHEET_ENGINE_LAYOUTS` hardcoded schema (picker buttons, no AI call) |
| `validatedSpec: object` | AI tool-call | Uses backend-validated spec from `createSheet()`. `validatedSpec` always wins when present. |

### `src/App.jsx` — `handleRenderSheetEngine(layoutKey)`

```
Button click
    ↓
isLiveAiReady?
    ├─ YES → invokeSheetEngineTool(prompt, callGemini)
    │           → result.success → setActiveSheetEngineSpec(result.validatedSpec)
    │           → result.failure → showToast(error), fallback to static preset
    └─ NO  → Static preset (setActiveSheetEngineSpec stays null)
```

---

## 4. Data Flow Diagram

```
┌─────────────┐      userPrompt + schema      ┌──────────────────┐
│  App.jsx    │ ─────────────────────────────▶ │   /api/gemini    │
│  handleRender│                                │  (Vercel route)  │
│  SheetEngine │ ◀───────── parsed JSON ──────── │  Gemini 2.5     │
└─────┬───────┘                                └──────────────────┘
      │ rawSpec
      ▼
┌─────────────────────────────┐
│  invokeSheetEngineTool()    │  sheetEngineService.js
│    └─ createSheet(rawSpec)  │
│        └─ validateSheetSpec │  ✓ ok: true  → validatedSpec
│                             │  ✗ ok: false → errors[]
└─────┬───────────────────────┘
      │ { success, validatedSpec }
      ▼
┌─────────────────────────────┐
│  SheetRenderingEngine       │  isAiSpec = true
│  (validatedSpec prop)       │  → dynamic column renderer
│                             │  → AI-derived KPI cards
└─────────────────────────────┘
```

---

## 5. Fallback Strategy

When `isLiveAiReady === false` (no API key, local dev):
- `handleRenderSheetEngine` skips the AI call entirely.
- `activeSheetEngineSpec` stays `null`.
- `SheetRenderingEngine` receives only `layoutKey` and renders the static `SHEET_ENGINE_LAYOUTS` preset.
- A toast notifies: `"budgeting preset loaded (AI unavailable)"`.

This ensures the picker UI remains fully functional without any AI backend configured.

---

## 6. Undo / Versioning Hook

`createSheet()` accepts an optional `options.onUndoPush` callback:

```js
createSheet(rawSpec, {
  onUndoPush: (validatedSpec) => {
    // Push current sheet state to undo stack before applying the new spec.
    undoStackRef.current.push(validatedSpec);
  },
});
```

This is the designed integration point for undo/redo and version history — the backend is the source of truth, so every write goes through this function.
