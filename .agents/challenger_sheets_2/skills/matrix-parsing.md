# matrix-parsing skill copy
When building or debugging logic that iterates over a spreadsheet grid or 2D matrix to dynamically infer rows, columns, and data series, you MUST reference the post-mortem analysis to avoid swallowing data.
- See references/intersection_flaw_postmortem.md for details on handling ambiguous (0,0) grid intersections:
  1. Isolate the Intersection: Extract and evaluate (0,0) completely independently (intersectionIsText).
  2. Scan the Remainders: Scan Row 0 from index 1 to n. Scan Col 0 from index 1 to n.
  3. Resolve Ambiguity: Only infer axis mappings based on the remainders. If only Row 0 (index 1..n) contains text, then Col 0 index 1..n is pure data, regardless of what the intersection cell contains.
