# Regaarder Browser Icon System Specification

This document defines the formal visual grammar, stroke geometry, state behaviors, and color guidelines for the Regaarder Chromium-based Browser UI.

> [!IMPORTANT]
> **Core Design Principle**: Regaarder customizes visual language (stroke weight & clean geometric lines), **NOT** universal browser affordances. Universal browser conventions (Back, Forward, Reload, Home, Bookmark, URL/Search) remain immediately recognizable. Regaarder-specific functions (AI, research, memory, workflows, knowledge) receive the distinctive custom SVG language.

---

## 1. Core Geometric Rules

All Regaarder Browser icons adhere strictly to the following geometric standards:

| Property | Rule | Description |
| :--- | :--- | :--- |
| **ViewBox** | `0 0 24 24` | Universal 24px grid coordinate frame. |
| **Optical Stroke Weight** | `1.5px` (`strokeWidth={1.5}`) | Consistent, lightweight engineered stroke weight across controls. |
| **Stroke Endings** | `strokeLinecap="round"` | Clean rounded stroke terminals. |
| **Stroke Joins** | `strokeLinejoin="round"` | Precise rounded corner joins. |
| **Color Model** | `currentColor` | Monochrome vector paths tinted via parent CSS / Tailwind classes. |
| **Corner Radius** | `rx="0.75"` - `rx="2.0"` | Subtly rounded architectural geometry. Never sharp 0px or full circle/ellipse unless representing a sphere or dot node. |

---

## 2. Standardized Priority Icons

### A. Navigation Controls

1. **`BrowserHomeIcon`**
   - **Metaphor**: Simplified architectural house with an inner doorway frame and a centered Regaarder focal node (`circle cx="12" cy="9" r="0.85"`).
   - **Optical Size**: 16px (Toolbar), 18px (Standalone button).

2. **`BrowserReloadIcon`**
   - **Metaphor**: Clean 270-degree circular arc with a 90-degree precision arrowhead.
   - **Visual Weight**: Lightweight engineered vector (1.6px stroke), avoiding Chromium default heavy visual weight.

3. **`BrowserBackIcon` & `BrowserForwardIcon`**
   - **Metaphor**: Single-line directional chevrons (`polyline points="15 19 8 12 15 5"`).
   - **Rationale**: Preserves high-frequency navigation familiarity with clean Regaarder stroke weight.

4. **`BrowserPlusIcon`**
   - **Metaphor**: Precision "+" cross with rounded linecaps (`line x1="12" y1="5" x2="12" y2="19"`).

### B. Security & Address Bar

1. **`BrowserLockIcon` (HTTPS)**
   - Minimalist padlock with rounded shackle (`path d="M8 11V7a4 4 0 0 1 8 0v4"`) and centered keyhole node.
   - Tinted `text-emerald-600 dark:text-emerald-400`.

2. **`BrowserInsecureIcon` (HTTP)**
   - Shield outline with central warning node.
   - Tinted `text-amber-500`.

### C. Research & Agent Icons

1. **`AgentsIcon` (Regaarder AI / Assistant)**
   - **Metaphor**: Inter-agent orbital constellation network (central coordinator node connected to orbital sub-agent nodes).
   - **Active State**: Regaarder purple fill (`bg-violet-600 text-white border-violet-500`).
   - **Inactive State**: Subtle outline (`bg-violet-500/10 text-violet-600 dark:text-violet-300`).

2. **`BrowserSearchWebIcon`**
   - **Metaphor**: Global compass/web globe with latitude equator line and longitude meridian curve.

3. **`BrowserCompetitorsIcon`**
   - **Metaphor**: Executive metric matrix frame with vertical comparison bars.

---

## 3. Color & State Behavior System

Do **not** apply random or decorative colors to standard browser controls. Follow these rules:

| Control Type | State | Styling / Color |
| :--- | :--- | :--- |
| **Standard Control** | Inactive / Rest | `text-slate-600 dark:text-zinc-400` |
| **Standard Control** | Hover | `hover:bg-slate-100 dark:hover:bg-zinc-800 text-slate-900 dark:text-zinc-100` |
| **Standard Control** | Disabled | `opacity-30 cursor-not-allowed` |
| **Reload / Stop** | Loading | Spin animation tinted `text-violet-500` (**NEVER red**). |
| **AI Assistant** | Inactive | `bg-violet-500/10 text-violet-600 dark:text-violet-300 border-violet-500/30` |
| **AI Assistant** | Active | `bg-violet-600 text-white border-violet-500 shadow-md ring-2 ring-violet-500/30` |
| **Knowledge Ingestion** | Specialized | - Memory: `text-sky-500`<br/>- Compose: `text-emerald-500`<br/>- Sheets: `text-emerald-500`<br/>- Whiteboard: `text-amber-500` |

---

## 4. Tab Bar Design Directives

- **Shape Rule**: Tabs must be **slightly rounded rectangles** (`rounded-md` / 6px radius).
- **Prohibited Shapes**: Under no circumstances should tabs be rendered as pill-shaped or elliptical elements.
- **Active Tab Indicator**: Uses an "outline" visual indicator (`w-0.5 bg-violet-600` on the left edge).

---

## 5. Homepage Visual Hierarchy

The Regaarder Research homepage enforces a 4-level visual hierarchy:

1. **LEVEL 1 — SEARCH (Hero Omnibox)**: Central hero search bar with prominent `BrowserSearchIcon` and high focus ring glow (`ring-violet-500/20`).
2. **LEVEL 2 — RESEARCH ACTIONS**: Standardized cards for high-frequency workflows (Search Web, Research Competitors, Open Saved Pages, Ask Regaarder AI).
3. **LEVEL 3 — SAVED KNOWLEDGE & MEMORIES**: Secondary cards previewing clipped knowledge nodes, saved matrices, and memory briefings.
4. **LEVEL 4 — TOPICS**: Minimal topic tags at the bottom with restrained border outlines.
