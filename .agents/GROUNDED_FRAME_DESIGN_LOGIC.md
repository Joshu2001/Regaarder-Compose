# Architectural Design Note: Grounded Frame Chrome & Contrast Stratification

## 1. The Core Problem: Layer Stacking Fatigue & Contrast Bleed
Before this refinement, the Sheets workspace suffered from two visual defects:
1. **Unbounded White-on-White Bleed**: The window top bar (`bg-white/85`), the toolbar card (`bg-white/90`), and the spreadsheet canvas (`bg-white`) shared almost identical color values. Active tabs felt like cut-out fragments floating without a stable base.
2. **Layer Stacking Fatigue**: Sheets requires dense vertical tool tiers (Window Bar → View Switcher → Formatting Ribbon → Formula Bar → Grid). When every layer shares the exact same tonal temperature, users experience cognitive fatigue because the eye cannot discern where the application frame ends and where the editable canvas begins.

---

## 2. The Logic Behind the Solution
Following the **Beauty First, Then Remarkable** and Apple-tier executive UI principles:

### A. Grounded Outer Frame (`bg-[#f8f9fb]/95` / Dark: `bg-[#121214]/95`)
* **macOS Safari / Keynote Metaphor**: The outermost chrome of an application is a physical window casing. By tinting the top bar with a cool, subtle neutral tone (`#f8f9fb`), we immediately separate the window controls and document switcher from the active workspace.
* **Backdrop Blur (`backdrop-blur-xl`)**: Keeps the frame translucent and light without feeling dense or opaque.

### B. Raised Active Card Outline (`bg-white` + Crisp Border + Diffused Micro-Shadow)
* The active document tab acts as an anchor: it is rendered in clean pure white (`bg-white`), with a hairline border (`border-slate-200/90 ring-1 ring-black/[0.02]`) and a soft layered shadow (`shadow-[0_1px_3px_rgba(0,0,0,0.06),0_1px_2px_rgba(0,0,0,0.04)]`).
* Visually, the active document tab literally "plugs into" the white workspace below it, while inactive tabs remain muted and transparent against the frame.

### C. Muted Inactive Tab Noise
* Inactive document tabs drop to `opacity-70` on icons and neutral `text-slate-500`, rising to full opacity only on hover. This directs 100% of the user's primary attention toward their working sheet.

---

## 3. How to Apply This System Elsewhere
This exact pattern (Grounded Container + Stratified Raised Children) should be applied whenever multi-level toolbars or canvas tools compete for focus:
1. **Split-Screen Pane Headers**: When comparing two documents or viewing side-by-side data, tint the inactive pane's top header to `#f8f9fb` and illuminate the focused pane with pure white.
2. **Modal Header Bars**: Give modal titlebars this subtle tinted grounding so modal content cards sit on top cleanly.
3. **Multi-Tab Sidebars**: In secondary inspection sidebars (e.g., Inspector tabs: Style / Cell / Arrange), use a `#f8f9fb` segmented track with crisp white elevated active tabs.

---

## 4. Evaluation: The Floating Export/Share Capsule (Bottom Right)
### Should the Bottom-Right Export Capsule Use This Same Look?
* **Current State**: The bottom-right capsule (`Export` + `Share`) is an **independent floating HUD** (`fixed bottom-5 right-5 z-[500] bg-white/90 shadow-[0_12px_36px_rgba(0,0,0,0.12)]`).
* **Recommendation**: **No, do not give the entire capsule a grey tinted casing.** It is not an outer window frame—it is a floating glass action capsule on top of the grid. 
* **However, the Export button *within* the capsule** can adopt the refined outline style:
  - Keep the capsule itself in crisp floating glass (`bg-white/95 backdrop-blur-2xl border border-slate-200/90`).
  - Style the `Export` button inside it with a subtle neutral outline when idle (`border border-slate-200/70 hover:bg-slate-50 hover:border-slate-300`), paired with the primary purple `Share` button. This maintains a clean primary/secondary button hierarchy.
