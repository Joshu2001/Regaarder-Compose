# AI Generation Loading State Architectural Specification

This document defines the unified, executive-tier visual and architectural standards for AI generation states across Regaarder (Notes, Docs, Decks, and Sheets).

---

## Core Principles

### 1. Match Expected Result Footprint (Prevent Layout Jumps)
- **Zero Shrink Loading:** An AI loading state must **never** be rendered as a generic 120px empty card or an unanchored mini-spinner.
- **Footprint Reservation:** The loading state must occupy the approximate dimensions (full width and multi-row height) of the eventual artifact.
- **Visual Stability:** When generation finishes, replacing the skeleton with the real artifact must result in smooth zero-shift placement.

### 2. Live Active Shimmer for Perceived Speed
- **Dynamic Shimmer Waves:** Skeletons must never look static, frozen, or plain grey.
- **Perception of Speed:** A fluid, continuous left-to-right highlight shimmer wave (`@keyframes ai-shimmer`) signals ongoing computation, eliminates the perception of lag, and makes long generations feel instantaneous.
- **Neutral Fill:** Placeholder bars use neutral, semi-transparent slate gradients—never fake text or pseudo-content.

### 3. Regaarder AI Identity Mandate
- **Circular AI Signature:** All AI generation loading states must use the official circular `RegaarderAiIcon` spiral glyph. Generic sparkle or star icons are strictly prohibited.
- **Contextual Micro-Copy:**
  - Header: `AI is composing…`
  - Subtitle: Dynamic, contextual statement of work (e.g. *"Building your table from the data"*, *"Constructing chart metrics"*).
- **Subtle Violet Accents:** Keep purple restrained to the signature glyph and subtle header highlights.

---

## Artifact Patterns

| Artifact Type | Reserved Footprint | Skeleton Structure |
| :--- | :--- | :--- |
| **Table (`/table`)** | 100% width, ~280px height | 3-column grid, prominent header bar, 5 alternating data rows with staggered shimmer bars. |
| **Chart / Graph (`/graph`)** | 100% width, ~240px height | Chart card outline, axis baseline guides, 4-5 staggered vertical bar or wave shimmer placeholders. |
| **Schedule (`/schedule`)** | Max 420px card width, ~180px height | Timeline card outline, event badge placeholder, 4 staggered meta field shimmer lines. |
| **Text / Proofread / Summary** | 100% width, 3-4 text line heights | Multi-line paragraph skeleton with alternating line lengths (100%, 90%, 75%, 45%). |

---

## Transition Contract

```
[ User triggers generation ]
            ↓
[ Pre-allocate container with exact artifact footprint ]
            ↓
[ Mount skeleton + active @keyframes ai-shimmer wave ]
            ↓
[ AI generation resolves ]
            ↓
[ 150-200ms cubic-bezier transition seamlessly swaps skeleton with real DOM ]
```
