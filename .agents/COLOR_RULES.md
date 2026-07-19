# Color Hierarchy & Accent Color Constraint Rules

This document outlines the strict guidelines for the use of accent and brand colors throughout the Regaarder application workspaces (Compose, Sheets, Deck, Whiteboard, and Room).

## 1. The Single-Accent Color Constraint
To prevent visual fatigue and clutter, any given view/page must feature exactly **one prominent brand accent color** (e.g., Violet-600) reserved exclusively for the **primary Call-to-Action (CTA)** (such as "Share", "Submit", or "Connect Datasets").

All other interactive components, status tags, borders, checkbox indicators, and structural framing elements must be styled with high-contrast neutral colors (`slate`, `zinc`, or neutral grays) or soft secondary tints.

## 2. Decoupling Identity from State (User Avatars)
User avatars, monograms (e.g., "U", "O", "You"), presence markers, and initials must **never** match the main brand accent color.
- **Rule:** Use neutral backdrops (such as `bg-slate-100` / `dark:bg-zinc-800` and `text-slate-600` / `dark:text-zinc-300`) or standard color-coding for guest monograms, avoiding the primary brand violet.
- **Rationale:** Prevents the user from confusing user presence and status indicators with primary workspace actions.

## 3. Allowed Exceptions
The brand accent color is permitted outside of primary CTAs only in these specific scenarios:
1. **Active UI States (Outlines Only):** Active toolbar dropdown boundaries, active text formatting buttons (such as Align Left), or selected sidebar tabs can use a thin accent color outline (`border-violet-200`) or subtle tint background (`bg-violet-50/50`) to denote focus and selection.
2. **Success/Active Interactive Controls:** Checkboxes (checked states), active toggle switches, or active radio controls when turned on may use the accent color to indicate positive selection/state.
3. **Data Rendering / Data Grid Visuals:** Inside a document body, slide template, whiteboard canvas, or spreadsheet grid, accent colors may highlight data points, selected cell ranges, chart bars, or custom shapes.
