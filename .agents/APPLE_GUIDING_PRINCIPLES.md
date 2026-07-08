# Apple & Regaarder UI/UX Guiding Principles

This document defines the core desktop UI/UX philosophy of the Regaarder application. Every agent working on this codebase must read, internalize, and strictly follow these principles before designing, coding, or refactoring interface elements.

## Core Philosophy: The Regaarder Difference
We do not build traditional, cluttered, ribbon-heavy enterprise software. We do not mimic the visual clutter of Microsoft Word, Excel, or WPS Office. 

Instead, we reinvent office productivity with a **premium, minimalist aesthetic** (similar to Notion AI, Linear, Figma, and Arc Browser) where interface chrome recedes and user content is the hero.

---

## 1. Simplicity over Clutter (Rethinking Conventions)
*   **The Dropdown & Overlay Paradigm:** Instead of dense toolbars, endless ribbons, or massive persistent sidebars, we prefer progressive disclosure. For example, instead of a bloated toolbar like MS Word/WPS, we leverage clean contextual dropdowns, floating menus, and dynamic slash commands (`/`).
*   **Minimal Surface Noise:** Avoid heavy borders, thick dividers, and excessive text labels. Use whitespace, padding, and soft shadow levels to group and structure content.

## 2. Executive-Tier Aesthetics ("Wow" Effect)
*   **Visual Appeal:** The user should be wowed at first glance. Use beautiful, curated color palettes, elegant dark modes, high-contrast typography, and smooth micro-interactions.
*   **Depth through Layers:** Create spatial hierarchy using translucency (`backdrop-blur`), soft shadows, and layered panels instead of raw boxes and borders.
*   **Typography:** Maintain strict typographical hierarchy using refined fonts like *Manrope*, *Outfit*, and *Inter*.

## 3. Clarity Above Everything
*   Every element must communicate its purpose instantly. Avoid ambiguous icon-only buttons without clear hover tooltips.
*   Ask: *"Can a user understand this action without thinking?"* If not, it is too complex.

## 4. Content is the Hero
*   The application UI should disappear, placing the focus entirely on the document, slide, or spreadsheet cell the user is editing. 
*   Avoid adding buttons, banners, or decorative panels that do not directly help the user interact with their content.

## 5. Reducing Cognitive Load
*   Good software minimizes active thinking.
*   Provide smart defaults, anticipate actions, and show instructions contextually. Never make the user remember state information across views.

## 6. Progressive Disclosure
*   Beginners see a clean, actionable interface. Advanced options (e.g. formula builders, slide configurations) are hidden behind lightweight, contextual overlays or inspectors and revealed only when needed.

## 7. Direct Manipulation
*   Ensure interactive assets (shapes, charts, comments) behave like physical objects. Support smooth dragging, resizing, rotation, and direct click-to-edit interactions rather than forcing users to navigate modals.

## 8. Predictability and Conventions
*   Interactive items must look clickable (using hover transformations). 
*   Use native macOS/Windows keyboard shortcuts (⌘C/Ctrl+C, ⌘V/Ctrl+V, ⌘S/Ctrl+S, etc.) consistently across all workspaces.

## 9. Immediate Feedback
*   Every click, hover, drag, or keystroke must produce visible feedback (e.g. subtle spring animations, pointer transitions, state outlines). No action should happen silently.

## 10. Forgiveness (Mistake Recovery)
*   Make actions reversible. Implement robust undo/redo, auto-recovery, and version tracking rather than presenting annoying confirmation dialogs repeatedly.

## 11. Consistency
*   Ensure tabs, sidebars, fonts, active states, and event handlers are completely uniform.
*   **Active Tab Styling:** All active tabs and filters across Sheets, Compose, Whiteboard, and Room must be styled as slightly rounded rectangles with clean, border-only **outlines** rather than solid color blocks/pill shapes.

## 12. Spacious Layouts
*   Utilize generous padding and margins. Whitespace is a first-class design element that signifies premium build quality and improves scannability.

## 13. Motion with Meaning
*   Animations must not be decorative. Every slide transition, panel slide-in, or popover fade-in must explain the spatial movement and status change of the application.

## 14. Performance as a UX Core
*   Latency kills quality. Keep startups, scroll cycles, and drag renders snappy (sub-16ms frames).

---

## Workspace-Specific UI Conventions

| Workspace | Apple HIG & Regaarder Convention |
| :--- | :--- |
| **Compose Editor** | Clean page layout with side margins, progressive slash commands (`/`), and inline review banners that can be easily dismissed. |
| **Sheets** | Clean data grid without heavy ribbons; tab actions (`Data`, `Analyze`, `Visualize`) styled as rectangular outlines. |
| **Whiteboard** | Free-form canvas with infinite space, clean tool dock, and drag-and-resize widgets. |
| **Deck** | Minimalist slides focused on visual design, layout preview grid, and a floating assistant chat. |
| **Room** | Translucent meeting overlays, clean participant grid, and hover-safe call controls. |
