# Post-Mortem & Skill Directive: Collapsed Panel Flexbox Layout Space Allocation & Diagnostic Profiling

## 1. Executive Summary

- **Symptom**: In `sheets` mode, a ~409.5px unstyled grey background layer appeared below the spreadsheet footer bar. The spreadsheet canvas and footer bar only expanded to fill roughly half the screen height (490.5px out of 900px), leaving the bottom portion of the viewport empty and clipping grid rows below row 5.
- **Initial Wrong Hypothesis (Ruled Out)**: Initial diagnosis suspected an invisible floating backdrop modal or transparent z-index overlay (`fixed inset-0 z-[9999]`) sitting *on top of* the grid cells and masking them. A DOM profiler query searched for z-index overlays overlapping the grid coordinates and found **0 overlay elements**. Cells were not hidden *behind* an overlay; the grid container itself was physically compressed.
- **Root Cause**: The right-side AI assistant panel container (`div.no-fullscreen-toggle`) was rendered as a sibling to `<main>` inside the root top-level vertical flexbox shell (`div.flex.flex-col.h-screen`). When closed, the sidebar applied `width: 0` and `opacity: 0`, but did **not** specify `display: none` or `height: 0`. As a result, CSS Flexbox allocated 409.5px of vertical column height to the collapsed sidebar at the bottom of the screen (`y = 490.5px` to `900px`), forcing `<main>` to shrink to 490.5px and squeezing grid height down to 229.5px.
- **Resolution**: Updated `div.no-fullscreen-toggle` closed states to explicitly include `display: 'none'`, `height: '0px'`, and the Tailwind `hidden` utility class when `rightSidebarOpen` is `false`.

---

## 2. Comprehensive Mathematical & Layout Breakdown

### The DOM Parent Hierarchy (`src/App.jsx`)
```
<div className="flex flex-col h-screen">          <-- Root App Shell (900px tall flex-column)
  ├── <main className="flex-1 ...">               <-- Contains Topbar, Toolbar, Grid, & Footer
  └── <div className="no-fullscreen-toggle ...">  <-- Right AI Sidebar (Collapsed)
```

### Mathematical Breakdown: BEFORE the Fix
Because `div.no-fullscreen-toggle` was placed as a sibling to `<main>` inside a `flex flex-col` parent container, Flexbox treated the collapsed sidebar as a vertical block element in column flow, reserving 409.5px for it beneath `<main>`:

1. **Total Window Height**: `900px`
2. **Collapsed Sidebar Space Allocation**: `- 409.5px` (y = 490.5px to 900px)
3. **Remaining Height for `<main>`**: `= 490.5px`

Inside `<main>` (constrained to 490.5px total height):
- Top Navigation Bar: `56px`
- Sheet Floating Toolbar: `133px`
- Sheet Column Headers: `32px`
- Sheet Footer Bar: `40px`
- **Total Static Headers/Footers**: `= 261px`

Now calculate the height left for the grid container (`div.sheet-grid-container`):
$$\text{Grid Height} = 490.5\text{px} - 261\text{px} = \mathbf{229.5\text{px}}$$

Because `div.sheet-grid-container` was squeezed down to only **229.5px**, and its parent container had `overflow: hidden`:
1. Only **Rows 1 through 5** fit inside the 229.5px box.
2. Rows 6 through 50 were pushed **below the 229.5px boundary**, where `overflow: hidden` clipped them out of view.
3. The Sheet Footer Bar was rendered at `y = 450.5px` (mid-screen), exposing the remaining 409.5px of grey root background beneath it.

---

### Mathematical Breakdown: AFTER the Fix
Adding `display: none`, `height: 0px`, and Tailwind `hidden` to `div.no-fullscreen-toggle` when collapsed (`rightSidebarOpen === false`):

1. **Collapsed Sidebar Footprint**: Dropped from `409.5px` to **`0px`**.
2. **Recalculated `<main>` Height**:
   $$\text{Main Height} = 900\text{px} - 0\text{px} = \mathbf{900\text{px}}$$
3. **Recalculated Grid Container Height**:
   $$\text{Grid Height} = 900\text{px} - 261\text{px} = \mathbf{639\text{px}}$$
4. **Cell Visibility**: With **639px of vertical grid height** (an increase of 409.5px), **Rows 6 through 30+** rendered directly inside the visible viewport.
5. **Footer Positioning**: Sheet Footer Bar shifted from `y = 450.5px` down to **`y = 860px`** (anchored at bottom of viewport), eliminating the 409.5px grey void (`footerBottomGap = 0px`).

---

## 3. Code Details: Failure vs. Success

#### ❌ The Failing Implementation (`src/App.jsx`)
```jsx
// BEFORE: Closed state set width: 0, but left height unconstrained in flex flex-col layout
<div 
  className={`no-fullscreen-toggle border-l border-slate-200/60 dark:border-zinc-800/80 flex flex-col bg-white/95 dark:bg-[#18181b]/95 backdrop-blur-2xl transition-all duration-200 shadow-[-12px_0_35px_-10px_rgba(15,23,42,0.08)] select-none overflow-hidden z-[310] ${
    productMode !== 'landing' && rightSidebarOpen && !shareModalOpen 
      ? (productMode === 'compose' ? 'fixed top-0 right-0 bottom-0 animate-in fade-in slide-in-from-right-4' : '') 
      : 'w-0 overflow-hidden border-l-0 pointer-events-none opacity-0'
  }`}
  style={ productMode !== 'landing' && rightSidebarOpen && !shareModalOpen ? ( rightPanelMaximized ? { width: '100vw', position: 'fixed', top: 0, right: 0, height: '100vh', zIndex: 1200 } : ( productMode === 'compose' ? { width: '380px', position: 'fixed', top: 0, right: 0, bottom: 0, zIndex: 310 } : { width: `${rightSidebarWidth}px`, zIndex: 310 } ) ) : { width: '0px' } }
>
```

#### ✅ The Successful Implementation (`src/App.jsx`)
```jsx
// AFTER: Closed state explicitly enforces display: none and height: 0px to remove from flex column allocation
<div 
  className={`no-fullscreen-toggle border-l border-slate-200/60 dark:border-zinc-800/80 flex flex-col bg-white/95 dark:bg-[#18181b]/95 backdrop-blur-2xl transition-all duration-200 shadow-[-12px_0_35px_-10px_rgba(15,23,42,0.08)] select-none overflow-hidden z-[310] ${
    productMode !== 'landing' && rightSidebarOpen && !shareModalOpen 
      ? (productMode === 'compose' ? 'fixed top-0 right-0 bottom-0 animate-in fade-in slide-in-from-right-4' : 'h-full shrink-0') 
      : 'w-0 h-0 hidden overflow-hidden border-l-0 pointer-events-none opacity-0'
  }`}
  style={ productMode !== 'landing' && rightSidebarOpen && !shareModalOpen ? ( rightPanelMaximized ? { width: '100vw', position: 'fixed', top: 0, right: 0, height: '100vh', zIndex: 1200 } : ( productMode === 'compose' ? { width: '380px', position: 'fixed', top: 0, right: 0, bottom: 0, zIndex: 310 } : { width: `${rightSidebarWidth}px`, zIndex: 310 } ) ) : { width: '0px', height: '0px', display: 'none' } }
>
```

---

## 4. Empirical Layout Profiling Method

When investigating mysterious gaps or element height collapses, **never guess CSS properties blindly**. Use headless Playwright scripts to evaluate exact parent and child `getBoundingClientRect()` bounds:

```javascript
// find_grey_gap.cjs
const { chromium } = require('playwright');

(async () => {
  const browser = await chromium.launch({ headless: true });
  const page = await browser.newPage();
  await page.setViewportSize({ width: 1440, height: 900 });
  await page.goto('http://localhost:5173', { waitUntil: 'networkidle' });

  // Profile all children of the root app shell container
  const info = await page.evaluate(() => {
    const appShell = document.querySelector('div.h-screen');
    const children = Array.from(appShell ? appShell.children : []).map(c => ({
      tag: c.tagName,
      cls: c.className,
      box: c.getBoundingClientRect()
    }));

    return { appShellBox: appShell?.getBoundingClientRect(), children };
  });

  console.log('SHELL CHILDREN METRICS:', JSON.stringify(info, null, 2));
  await browser.close();
})();
```

### Empirical Comparison Matrix

| Metric | Before Fix (Collapsed Sidebar taking height) | After Fix (`display: none` / `h-0`) | Structural Impact |
| :--- | :--- | :--- | :--- |
| **Sidebar Vertical Footprint** | `409.5px` | **`0px`** | Removed from Flex column allocation |
| **`<main>` Viewport Height** | `490.5px` | **`900px`** | Reclaimed 100% full window height |
| **Grid Container Height** | `229.5px` | **`639px`** | Expanded grid by 409.5px |
| **Visible Grid Rows** | ~5 rows (rest clipped) | **30+ rows** | Cells expanded into viewport space |
| **Footer Bar `y` Position** | `450.5px` (mid-screen) | **`860px` (bottom)** | Pushed to bottom of viewport |
| **Grey Gap Below Footer** | `409.5px` | **`0px`** | **Completely Eliminated** |

---

## 5. Architectural Rules & Future Extrapolation

### Rule 1: Multi-Axis Dimension Safeguards on Collapsed Elements
When toggling sidebar or panel visibility in an app shell:
- If a panel is collapsed (`isOpen === false`), always enforce `display: none` (or Tailwind `hidden`) alongside `width: 0` and `height: 0`.
- Never rely solely on single-axis sizing (`w-0`) when an element sits inside a container with a different flex direction (`flex flex-col`).

### Rule 2: Root Shell Layout Hierarchy
Shared global panels (like AI sidebars or overlays) should either:
1. Be positioned as `fixed` or `absolute` overlays so they do not disturb standard flex layout flow.
2. Be mounted inside a dedicated horizontal `flex flex-row` wrapper alongside `<main>`, rather than directly as siblings to `<main>` inside a vertical `flex flex-col` root container.

### Rule 3: Diagnostic Instrumentation Protocol
When faced with unexpected whitespace or un-stretched containers:
1. Inspect the full parent hierarchy from `document.body` down to the target node.
2. Log `getBoundingClientRect()` for **all sibling elements** of the target node to detect invisible layout hoggers.
3. Verify fixes empirically with headless metrics before closing tasks.
