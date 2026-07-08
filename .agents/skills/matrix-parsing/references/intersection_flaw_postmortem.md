# Incident Post-Mortem: The Intersection Cell Data Swallowing Flaw
*Author: Senior Systems Architect*

## Executive Summary
A naive loop within our dynamic chart heuristic (`detectChartStructure`) triggered a severe data mangling bug. A standard 2x3 grid containing labels horizontally and percentages vertically collapsed into a single column because the `(0,0)` cell caused a false-positive header detection along the vertical axis, stripping data from the payload.

## Anatomy of the Failure
When presented with the following subset:
| (0,0) Apple | (0,1) Oranges | (0,2) Banana |
| (1,0) 50%   | (1,1) 36%     | (1,2) 14%    |

The legacy heuristic attempted to determine if `Col 0` contained row headers by checking if any cell in `Col 0` was `isNaN()`. Because `(0,0)` was "Apple" (text), the engine flagged the *entire* `Col 0` as headers.
Simultaneously, it checked `Row 0` and correctly identified text.
Because it evaluated both the first row and first column as headers, it stripped both from the data loop, leaving only `(1,1) 36%` and `(1,2) 14%` as parsable data. 

## The Architectural Fix
To build an infinitely robust heuristic:
1. **Isolate the Intersection**: Extract and evaluate `(0,0)` completely independently (`intersectionIsText`).
2. **Scan the Remainders**: Scan `Row 0` from index `1` to `n`. Scan `Col 0` from index `1` to `n`. 
3. **Resolve Ambiguity**: Only infer axis mappings based on the remainders. If only `Row 0` (index `1..n`) contains text, then `Col 0` index `1..n` is pure data, regardless of what the intersection cell contains.

## Prevention Directive
Whenever constructing logic to traverse a generic spreadsheet grid, JSON matrix, or un-typed array: **Never conflate the structural identity of the intersection node with the structural identity of the vector axes.**
