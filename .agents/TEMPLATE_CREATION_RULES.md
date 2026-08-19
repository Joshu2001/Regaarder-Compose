# Regaarder Deck & Template Creation Architecture Directives

This document establishes the official architectural standards, design principles, spatial geometry rules, and interaction patterns for building executive-tier presentation templates within the Regaarder ecosystem.

---

## 1. Canvas Proportions & Spatial Geometry

### 16:9 Viewport & Safe Margins
- **Aspect Ratio:** All slides are built on a standard `16:9` widescreen canvas (`aspect-[16/9]`), designed to scale gracefully from mobile previews to 4K executive boardroom displays.
- **Outer Padding:** Slides must enforce generous outer padding:
  - Mobile/Compact: `px-6 pt-4 pb-3.5`
  - Desktop/Standard: `px-8 pt-5 pb-4 md:px-9 md:pt-6 md:pb-4`
- **Internal Safe Zone:** Interactive elements, text blocks, and bento cards must remain strictly within the inner 90% boundary of the canvas to avoid bezel clipping.

---

## 2. Vertical Distribution & Header Clearance

### Preventing Title-Card & Toolbar Collisions
- **Header Margin:** The slide header (Tagline + Headline) must always declare an explicit bottom clearance margin (`mb-2` to `mb-4`).
- **Headline Scaling:** Slide headlines that wrap across two lines must use constrained, balanced font sizes:
  - Single-line: `text-[26px] md:text-[32px] font-[900] leading-tight tracking-tight`
  - Multi-line: `text-[22px] md:text-[26px] leading-[1.05] font-[900] tracking-tight`
- **Avoid Content Sinking:** Never push center content too low against the slide footer. Use centered flex bounds (`flex-1 flex flex-col justify-center my-auto min-h-0`) with card heights constrained between `min-h-[140px]` and `min-h-[160px]`.
- **Footer Separation:** The slide footer must sit on an isolated `mt-auto pt-1.5 border-t border-white/15` boundary, ensuring cards and footer text never touch or overlap.

---

## 3. High-Contrast Obsidian Glass & Color Hierarchy

### Contrast Standards
- **Background Base:** Slides utilize an ultra-deep Obsidian base (`#05070B` or `#000000`).
- **Bento Card Surfaces:** Card containers must use high-opacity dark glassmorphism:
  - Surface: `bg-zinc-950/80 backdrop-blur-xl` or `bg-zinc-900/85`
  - Borders: `border border-white/20 hover:border-white/40 shadow-2xl`
- **Typography Contrast:**
  - Titles / Metrics: Pure `#ffffff` (`text-white font-[900]`)
  - Subtitles / Category Chips: Vibrant Neon Accents (`#00f0ff` Cyan, `#a855f7` Purple, `#10b981` Emerald, `#ec4899` Pink)
  - Body Text: High-contrast Slate `#cbd5e1` / `#e2e8f0` (`text-slate-300 font-normal leading-relaxed`)
  - Caret Colors: Glowing Cyan (`caretColor: "#00f0ff"`) with cyan focus rings on inline edit.

---

## 4. Icon Container & Glyph Luminescence Standards

### Pure White Glyph Rule
- **Never Render Dark or Dim Icons:** Icons inside dark badge containers must **never** inherit browser default or dark text colors.
- **Explicit Glyph Contrast:** All vector icons inside badges must explicitly render as **`#ffffff` (Pure White)** or dedicated high-saturation neon accents (`#00f0ff`, `#a855f7`).
- **Badge Container Styling:**
  - Background: 25%–35% opacity colored wash (e.g., `backgroundColor: ${accentColor}35`)
  - Border: Solid or semi-transparent accent halo (`border: 1.5px solid ${accentColor}`)
  - Glow Ambient Drop-Shadow: `boxShadow: 0 0 10px ${accentColor}50`
  - Dimensions: Standard `32px × 32px` or `36px × 36px` with subtle hover zoom (`hover:scale-110 transition-transform`).

---

## 5. 100% Inline Element Customization Pattern

### Universal Editable Text
Every single text element across all slides (headlines, taglines, card titles, descriptions, metrics, footer notes) must support instant, non-destructive inline editing:

```jsx
<h3
  contentEditable={currentAccessLevel !== 'viewer' && currentAccessLevel !== 'commenter'}
  suppressContentEditableWarning
  onBlur={(e) => updateDeckSlideField(activeDeckSlide?.id, fieldKey, e.currentTarget.textContent || '')}
  style={{ color: "#ffffff", caretColor: "#00f0ff" }}
  className="text-[13.5px] font-bold text-white outline-none hover:ring-1 hover:ring-cyan-400/40 rounded px-0.5 cursor-text select-text"
>
  {activeDeckSlide?.[fieldKey] || defaultText}
</h3>
```

---

## 6. Bento Card Interactivity & 8-Point Resize Handles

### Full Bento Container Controls
Every bento card and grid module must support complete user agency:
1. **Pointer Dragging:** `onPointerDown` initializes `setDeckBentoDrag` with client coordinate tracking and bounding safety.
2. **Selection State:** `onClick` triggers `setDeckSelection({ type: 'bento', id })` with an outline visual state (`outline outline-2 outline-[#7C4DFF] ring-4 ring-[#7C4DFF]/30`).
3. **8-Point Resize Handles:** Four corner handles (`top-left`, `top-right`, `bottom-left`, `bottom-right`) and four edge handles (`top`, `bottom`, `left`, `right`) driven by `setDeckResizeDrag`.
4. **Contextual Floating Toolbar:**
   - Drag indicator
   - Card title label
   - Reset position button (`RotateCcw`)
   - **Delete Button (`Trash2`)** that soft-deletes via `{cardId}_hidden: true`.

---

## 7. Independent Badge Morphing & Customization

### The 5-Axis Badge Customizer
Every icon container badge on every card must be independently selectable (`setDeckSelection({ type: 'badge', id })`), opening an executive floating toolbar with:
1. **Shape Morpher (`activeBadgeShapePicker`):**
   - Circle (`rounded-full`)
   - Rounded Square (`rounded-xl`)
   - Sharp Square (`rounded-none`)
   - Diamond (`clipPath: polygon(50% 0%, 100% 50%, 50% 100%, 0% 50%)`)
   - Hexagon (`clipPath: polygon(25% 0%, 75% 0%, 100% 50%, 75% 100%, 25% 100%, 0% 50%)`)
   - Star (`clipPath: polygon(50% 0%, 61% 35%, 98% 35%, 68% 57%, 79% 91%, 50% 70%, 21% 91%, 32% 57%, 2% 35%, 39% 35%)`)
2. **Color Palette (`activeBadgeColorPicker`):** 13 curated Apple/Neon color swatches.
3. **Vector Icon Switcher (`activeBadgeIconPicker`):** 12 executive vector glyphs (Globe, Mail, MapPin, Phone, Sparkles, Zap, Star, Rocket, Shield, Target, Award, Flame).
4. **Size Controls:** Stepper controls from 12px to 24px.
5. **Delete Badge:** Soft-deletion toggle for minimalist text-only cards.

---

## 8. Bespoke Vector Mesh Allocation & Visual Identity

### The "No-Duplicate Waves" Rule
- **Never Repeat Artwork:** Every slide in a deck suite must have its own distinct, thematic vector artwork.
- **Thematic Artwork Mapping:**
  - **Cover / Title:** `toroid-ring` (Luminous dual-orbit neon torus)
  - **Executive Summary:** `dna-double-helix` (Dual-helix fiber wave with floating nodes)
  - **Organization / Structure:** `isometric-grid` (3D neon matrix lattice)
  - **Market Analysis / TAM:** `market-tam-concentric` (Concentric orbital energy rings)
  - **Product Ecosystem:** `geodesic-icosahedron` (3D multi-faceted vector crystal cage)
  - **Go-To-Market / Sales:** `growth-venture-hockey` (Ascending laser trajectory with stage beacons)
  - **Competitive Moat:** `magnetic-dipole` (Dual shielded magnetic vector flux)
  - **Milestones Roadmap:** `stepped-neon-vortex` (Phased laser wave timeline)
  - **Financial Projections:** `toroid-ring` (Luminous financial loop)
  - **Funding Ask:** `funding-syndicate-node` (Central glowing capital node with orbiting particles)

---

## 9. Executive Restraint & Progressive Disclosure

### Elimination of Unnecessary Clutter
- **Remove Redundant Pills:** Avoid decorative secondary presenter pills (e.g. "PREPARED FOR BOARD & INVESTORS") when they clutter the title slide.
- **Clean Footer Signatures:** Keep slide footers minimal: single company entity on the left, confidentiality or stage note on the right.
- **Progressive Controls:** Floating toolbars, resize handles, and morphing pickers appear **only** upon active selection, keeping the canvas 100% clean during normal reading and presentation modes.

---

## 10. Universal Tool API Compliance

### Programmatic Creation & LLM Interoperability
All templates, slides, and bento cards must be constructible and editable programmatically via the canonical `CANONICAL_DOCS_TOOLS` and `CANONICAL_DECK_TOOLS` API schemas. Every visual property (`headline`, `tagline`, `card1Title`, `card1Desc`, `vectorWaveStyle`, `color`, `shape`) must map 1:1 to callable tool parameters.
