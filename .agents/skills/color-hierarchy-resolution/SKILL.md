---
name: color-hierarchy-resolution
description: Rules and architectural principles for resolving UI color saturation, preventing accent conflicts, and establishing Apple-style visual hierarchy.
---

# UI Color Hierarchy & Saturation Resolution Guide

Use this skill when resolving UI color clashes, design regressions where primary accent colors are overused, or when establishing cohesive light/dark color mappings.

## Core Rules

1. **The Single-Accent Constraint**:
   * A single view/page should feature exactly one prominent brand accent color (e.g., violet/purple) reserved strictly for the **primary call to action (CTA)** (e.g., "Share" or "Submit").
   * Secondary indicators, user identities, non-primary navigation tabs, and background dropzones must be de-escalated to high-contrast neutrals (`slate`/`zinc`).

2. **Decoupling Identity from State**:
   * User avatars, guest circles, and monograms must use neutral or soft palette backdrops (e.g., `bg-slate-100`/`dark:bg-zinc-800` and `text-slate-600`/`dark:text-zinc-350`), never matching the main brand accent color. This prevents confusing user presence with workspace actions.

3. **Neutral Container Conventions**:
   * Layout boundaries, panels, inactive tabs, and dropzones should avoid using colored outlines or colored background fills unless actively selected.
   * Light Mode: Use `#f1f5f9` (slate-100) or `#f8fafc` (slate-50).
   * Dark Mode: Use `#27272a` (zinc-800) or `#18181b` (zinc-900).

## Diagnostic Workflow
* When a visual layout feels cluttered or lacks priority, count the number of elements using the primary accent color.
* If the count is > 1, de-escalate elements starting from the outermost structural boundaries (borders, dropzones) working inward to content elements (avatars, tabs).
