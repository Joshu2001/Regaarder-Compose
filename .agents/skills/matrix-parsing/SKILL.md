---
name: matrix-parsing
description: Guidelines and post-mortem references for extracting data from un-typed matrices and spreadsheet grids
---

When building or debugging logic that iterates over a spreadsheet grid or 2D matrix to dynamically infer rows, columns, and data series, you MUST reference the post-mortem analysis to avoid swallowing data.

- See `references/intersection_flaw_postmortem.md` for the exact details on how to handle ambiguous `(0,0)` grid intersections.
