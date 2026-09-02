# Apple Modal & Overlay Design Standards

This document codifies the design, interaction, and component architecture for modals, sheets, popovers, and overlay menus across the Regaarder platform (Sheets, Docs/Compose, Deck, Whiteboard, and Research Browser).

---

## 1. Architectural Philosophy

### The "Apple-Style" Grouped Inset Card Pattern
* **No Vertical "Tower of Blocks":** Avoid stacking 5 or 6 separate disconnected rectangular inputs on top of each other with all-caps micro-labels.
* **Grouped Inset Cards (macOS & iOS HIG):** Group logically related controls into unified inset cards (`bg-slate-50/80 dark:bg-zinc-800/60 border border-slate-200/60 dark:border-zinc-700/60 rounded-xl p-1.5`).
* **Divided Rows:** Inside grouped cards, rows are separated by hairline dividers (`border-b border-slate-200/50 dark:border-zinc-700/50`). Each row pairs a clear, sentence-case label on the left with its contextual trigger (dropdown, switch, or value) on the right.

---

## 2. Geometry & Motion Standards

### Shell Geometry
* **Outer Container Radius:** Strictly **`rounded-2xl` (16px)** for modals and floating sheets. Avoid bulbous squircles (`rounded-3xl` or `rounded-[24px]`+).
* **Inner Card / Control Radius:** **`rounded-xl` (12px)** for grouped cards; **`rounded-lg` (8-10px)** for buttons, input fields, and select options.
* **Backdrop Blur & Glassmorphism:**
  * Background: `bg-white/90 dark:bg-[#1c1c1e]/90 backdrop-blur-2xl`
  * Border: `border border-black/[0.08] dark:border-white/[0.12] ring-1 ring-slate-900/5 dark:ring-black/40`
  * Shadow: `shadow-[0_16px_40px_rgba(0,0,0,0.14)]`

### Microsecond Motion & Zero Latency
* **Entrance Transition:** `animate-in fade-in zoom-in-[0.98] duration-100 ease-[cubic-bezier(0.16,1,0.3,1)]`
* **Exit Transition:** Instantaneous unmount or 75ms fade. Never use heavy zoom-ins (e.g. `zoom-in-95` or `duration-150`+), which create the perception of sluggishness.
* **Input Latency:** Always trigger modal openings, switches, and dropdown options via **`onPointerDown`** rather than waiting for `mouseup` / `onClick` release (~120ms latency eliminated).

---

## 3. Form Controls & Progressive Disclosure

### Toggle Switches vs. Raw Checkboxes
* **Prohibit Raw Checkboxes:** Never render bare HTML `<input type="checkbox">` in primary modal configurations.
* **Apple Toggle Switches:** Use fluid, pill-shaped toggle switches (`w-9 h-5 rounded-full p-0.5 transition-colors` with a `w-4 h-4 rounded-full bg-white shadow-sm transition-transform`).
* **Progressive Disclosure:** Sub-options (such as password fields or expiration date pickers) must only reveal themselves smoothly when their parent toggle switch is active.

### Link Sharing & URL Preview
* **Unified Link Pill:** The shareable URL preview must be housed in an integrated pill container with a monospace URL snippet, a prominent `Copy` button, and tactile feedback (green check + "Copied!").

---

## 4. Component Implementation Checklist

1. **`DropdownModalShell.jsx`**:
   - `rounded-2xl` outer shell.
   - `animate-in zoom-in-[0.98] duration-100 ease-out`.
   - `onPointerDown` backdrop dismissal with event capture.
2. **`ShareModal.jsx`**:
   - Apple grouped inset cards for General Access, Format, and Security.
   - Fluid toggle switches for Password Protection and Expiring Access.
   - One-click copy link with instant clipboard feedback.
3. **Browser Transfer Popovers** (`SendToComposePopover`, `SendToSheetsPopover`, `BrowserUtilitiesPopover`, `BrowserFontPopover`):
   - Aligned to `rounded-xl`, 100ms entrance, and `onPointerDown` triggers.
