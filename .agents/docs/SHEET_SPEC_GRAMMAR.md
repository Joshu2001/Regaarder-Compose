# Sheet Specification Grammar

> **Enforced by:** `sheetEngineService.js` → `validateSheetSpec()` + Gemini `responseSchema`
> **Purpose:** Defines the "presentation language" for sheets. The AI can only propose values declared here.

---

## Overview

The Sheet Specification (SheetSpec) is the structured JSON/DSL the AI produces when a user requests a sheet. It is **not** a template — it is a constrained vocabulary the AI uses to communicate intent to the rendering engine.

Analogy: the same way a type system prevents runtime errors, the grammar prevents the AI from producing layouts that break visual hierarchy, use invalid palettes, or contain structurally malformed data.

---

## Top-Level Fields

| Field | Type | Required | Description |
|---|---|---|---|
| `layout` | `string` | ✅ | The sheet category. Must be one of `ALLOWED_LAYOUTS`. |
| `palette` | `string` | ✅ | The colour palette. Must be one of `ALLOWED_PALETTES`. |
| `typography` | `string` | ✅ | The typography scale. Must be one of `ALLOWED_TYPOGRAPHY`. |
| `title` | `string` | ✅ | Human-readable sheet title. Max 60 characters. |
| `summaryCards` | `boolean` | ✅ | `true` renders KPI metric cards above the table. |
| `charts` | `boolean` | ✅ | `true` requests chart visualizations (future feature). |
| `columns` | `Column[]` | ✅ | Ordered column definitions. Minimum 2. |
| `rows` | `Row[]` | ✅ | Data rows. 1–200 entries. |

---

## Allowed Values

### `layout`
```
budgeting       → Budgeting and expense tracking
cash_flow       → Cash flow with period-based inflow/outflow
sales_tracking  → Sales pipeline with deal stages and rep performance
inventory       → SKU management with stock levels and reorder alerts
```

### `palette`
```
slate-dark     → Indigo-slate dark theme (maps to 'indigo' tokens)
emerald-glow   → Emerald green theme
aurora-indigo  → Violet-aurora theme
amber-warm     → Amber-gold warm theme
```

### `typography`
```
modern     → Inter, clean proportional spacing
compact    → Tighter line heights for data-dense sheets
executive  → Larger type, boardroom-ready
```

---

## Column Schema

```json
{
  "key":     "revenue",        // camelCase, unique within the spec
  "label":   "Revenue ($)",   // Display header, any string
  "type":    "currency",      // One of COLUMN_TYPES (see below)
  "width":   140,             // Optional. Integer, 60–400 pixels
  "formula": "actual - budgeted"  // Optional. References other column keys
}
```

### `type` Values (`COLUMN_TYPES`)
| Type | Rendered As |
|---|---|
| `text` | Left-aligned plain string |
| `currency` | Right-aligned `$` formatted number |
| `number` | Right-aligned locale-formatted number |
| `percentage` | Progress bar + `%` label |
| `date` | Muted grey string |
| `status` | Colour-coded pill badge (green/red/indigo by keyword) |
| `progress` | Alias for percentage (future) |

**Status pill keyword detection:**
- **Green** — matches: `ok`, `active`, `complete`, `won`, `healthy`, `on track`
- **Red** — matches: `over`, `fail`, `reorder`, `blocked`, `low`, `warn`
- **Indigo** — all other values

---

## Row Schema

Each row is a flat object. Keys must exactly match a `column.key` declared in the same spec. No extra keys are permitted.

```json
{
  "category": "Revenue",
  "budgeted": 85000,
  "actual": 91200,
  "variance": 6200,
  "status": "On Track"
}
```

**Constraint:** `Row keys ⊆ Column keys`. Any key in a row not declared as a column will fail validation.

---

## Formula Expressions

A column may declare a `formula` string referencing other column keys by their `key` identifier. Formulas are metadata — they describe intent for future formula-execution engine integration and are stored in `_meta` on the validated spec.

```json
{ "key": "variance", "label": "Variance ($)", "type": "currency", "formula": "actual - budgeted" }
```

---

## Full Example

```json
{
  "layout": "budgeting",
  "palette": "aurora-indigo",
  "typography": "modern",
  "title": "Q3 2026 Budget Tracker",
  "summaryCards": true,
  "charts": false,
  "columns": [
    { "key": "category", "label": "Category",      "type": "text",     "width": 180 },
    { "key": "budgeted",  "label": "Budgeted ($)",  "type": "currency", "width": 140 },
    { "key": "actual",    "label": "Actual ($)",    "type": "currency", "width": 140 },
    { "key": "variance",  "label": "Variance ($)",  "type": "currency", "width": 140, "formula": "actual - budgeted" },
    { "key": "status",    "label": "Status",        "type": "status",   "width": 120 }
  ],
  "rows": [
    { "category": "Revenue",          "budgeted": 120000, "actual": 134500, "variance": 14500,  "status": "On Track" },
    { "category": "Cost of Goods",    "budgeted": 45000,  "actual": 48200,  "variance": -3200,  "status": "Over Budget" },
    { "category": "Gross Profit",     "budgeted": 75000,  "actual": 86300,  "variance": 11300,  "status": "On Track" },
    { "category": "Salaries",         "budgeted": 32000,  "actual": 31500,  "variance": 500,    "status": "On Track" },
    { "category": "Marketing",        "budgeted": 12000,  "actual": 14800,  "variance": -2800,  "status": "Over Budget" },
    { "category": "Software & Tools", "budgeted": 3600,   "actual": 3200,   "variance": 400,    "status": "On Track" }
  ]
}
```

---

## Validation Rules Summary

| Rule | Consequence |
|---|---|
| `layout` not in `ALLOWED_LAYOUTS` | `ok: false` — spec rejected |
| `palette` not in `ALLOWED_PALETTES` | `ok: false` — spec rejected |
| `typography` not in `ALLOWED_TYPOGRAPHY` | `ok: false` — spec rejected |
| `title` empty or > 60 chars | `ok: false` — spec rejected |
| `columns` has < 2 entries | `ok: false` — spec rejected |
| Duplicate column `key` | `ok: false` — spec rejected |
| Column `type` not in `COLUMN_TYPES` | `ok: false` — spec rejected |
| Column `width` outside 60–400 | `ok: false` — spec rejected |
| `rows` empty or > 200 | `ok: false` — spec rejected |
| Row contains key not in `columns` | `ok: false` — spec rejected |

All validation errors are collected and returned as `validationErrors: string[]` — the AI receives the full error list and can propose a corrected spec.

---

## Extension Points

To add a new layout (e.g. `project_tracker`):

1. Add `'project_tracker'` to `ALLOWED_LAYOUTS` in `sheetEngineService.js`.
2. Update the `SHEET_ENGINE_SYSTEM_PROMPT` layout description table.
3. Add a static fallback schema to `SHEET_ENGINE_LAYOUTS` in `SheetRenderingEngine.jsx`.
4. Add a `computeMetrics` case if custom KPI aggregations are needed.
5. Update this document.
