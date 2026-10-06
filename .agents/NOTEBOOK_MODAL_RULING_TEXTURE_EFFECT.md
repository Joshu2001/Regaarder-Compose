# Architecture Reference: Notebook Modal Background Texture & Ruling Lines Alignment

## 1. Overview & Problem Definition

In **Regaarder Compose Notebook Viewer**, floating contextual popovers (`+ Add`, `Ruling`, `AI`, `... More`) open upwards from the bottom capsule dock (`NotesFloatingDock`).

Prior implementations suffered from two distinct flaws:
1. **Opaque / Solid Popover Backdrop:** The popovers rendered with an opaque white (`bg-white/98`) background or excessive blur (`backdrop-blur-3xl`), completely occluding the notebook paper background beneath them.
2. **DOM Portal & Backdrop-Filter Isolation:** When floating menus are rendered via React `createPortal` to `#regaarder-notebook-root` or `document.body` (to escape parent bounding boxes and support native fullscreen), CSS `backdrop-filter: blur(...)` only samples rendered elements within the same stacking context physically positioned under the element. Because the notebook background rulings are rendered in a separate canvas element with subtle line contrast (`rgba(147, 197, 253, 0.18)`), backdrop blur blended the faint lines into the solid cream canvas color, destroying the illusion of transparency.

---

## 2. Technical Solution: Native Micro-Ruling Underlay Pattern

Rather than relying purely on passive CSS backdrop sampling, `ToolbarPopover` actively renders an exact, synchronized paper ruling pattern directly inside its internal layout shell, layered below the interactive menu items.

### Core Mathematical & Preset Mapping
The popover resolves the exact current note ruling geometry from `RULING_PRESETS`:

```javascript
const preset = RULING_PRESETS[rulingType] || RULING_PRESETS.ruled;
const baselinePx = preset[rulingThickness]?.baseline || preset.baseline || 32;
```

Depending on `rulingType`, it generates matching procedural CSS backgrounds:
- **`ruled`:** Single-axis horizontal rule lines matching notebook line height (`linear-gradient(${ruleCol} 1px, transparent 1px)` with `backgroundSize: '100% ${baselinePx}px'`).
- **`grid`:** Dual-axis orthogonal grid (`linear-gradient(to right, ...)`, `linear-gradient(to bottom, ...)`, `backgroundSize: '${baselinePx}px ${baselinePx}px'`).
- **`dot`:** Radial dots spaced to the baseline pitch (`radial-gradient(${dotCol} 1.2px, transparent 1.2px)`, `backgroundSize: '${baselinePx}px ${baselinePx}px'`).
- **`plain`:** Returns empty `{}` for unlined warm paper.

### Contrast Calibration
To maintain legibility of menu typography while making ruling lines clearly visible:
- **Light mode paper:** `bg-[#FCFAF7]/85` with `backdrop-blur-xl` and `border-slate-300/80`.
- **Ruling line contrast:** Light mode uses `rgba(147, 197, 253, 0.32)` (or `0.28` for grid), dark mode uses `rgba(255, 255, 255, 0.12)`.
- **Z-Index Layering:**
  ```jsx
  <div className="fixed z-[10000] ... bg-[#FCFAF7]/85 dark:bg-[#18181A]/85 backdrop-blur-xl overflow-hidden">
    {/* 1. Underlying Ruling Paper Grid */}
    {rulingType !== "plain" && (
      <div
        className="absolute inset-0 pointer-events-none transition-all duration-150"
        style={rulingBgStyle}
      />
    )}

    {/* 2. Interactive Menu Content on Top */}
    <div className="relative z-10 overflow-y-auto max-h-[inherit]">
      {children}
    </div>
  </div>
  ```

---

## 3. Propagation Pipeline
To ensure complete synchronization:
1. `RegaarderNotebookViewer` resolves `rulingType` and `rulingThickness` with `localStorage` fallbacks.
2. Both values and `isDarkMode` are passed as props to `<NotesFloatingDock />`.
3. `NotesFloatingDock` passes `rulingType`, `rulingThickness`, and `isDarkMode` down to every `<ToolbarPopover />` instance (`pen`, `ruling`, `add`, `ai`, `more`).

This guarantees that whether in normal view, sidebar opened, or native fullscreen mode, every floating popover faithfully mirrors the notebook canvas texture.
