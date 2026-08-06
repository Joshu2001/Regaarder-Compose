---
name: monolith-jsx-editing
description: Guidelines and post-mortem references for refactoring, wrapping, or modifying ultra-large React components (>10,000 lines) without introducing syntax breakage, JSX tag mismatches, or IIFE scope corruption.
---

When editing, refactoring, or inserting IIFEs/sub-components inside ultra-large single-file React components (such as `src/App.jsx`), you MUST reference the post-mortem analysis to avoid JSX syntax tree corruption and component state shadowing.

- See `references/jsx_monolith_editing_postmortem.md` for exact details on managing IIFE scopes, bracket alignment, and build-time verification protocols.
