# E2E Test Infra: Regaarder Omni-Import

## Test Philosophy
- Opaque-box, requirement-driven. We test the application in a headless browser via Puppeteer, checking the DOM elements, CSS classes, interactive states, and simulated file imports.
- Methodology: Category-Partition, Boundary Value Analysis, Pairwise Combinations, and Real-world Workloads.

## Feature Inventory
| # | Feature | Source | Tier 1 | Tier 2 | Tier 3 |
|---|---|---|:---:|:---:|:---:|
| 1 | Core Layout (Three-Zone Structure) | ORIGINAL_REQUEST §R1 | 5 | 5 | ✓ |
| 2 | Context-Aware AI Sidebar States | ORIGINAL_REQUEST §R2 | 5 | 5 | ✓ |
| 3 | Premium Empty State Hub | ORIGINAL_REQUEST §R3 | 5 | 5 | ✓ |
| 4 | Data Relationships Flow | ORIGINAL_REQUEST §R4 | 5 | 5 | ✓ |
| 5 | Rounded Tab & Outline Styling | ORIGINAL_REQUEST §R5 | 5 | 5 | ✓ |

## Test Architecture
- **Test Runner**: Node script (`run_tests.mjs`) using Puppeteer to launch the application, click tabs, select columns, drag-and-drop or upload mock files, and assert elements.
- **Directory Layout**:
  - Tests will be located in `c:\Users\user\Downloads\Project MOAT\Regaarder Compose\tests\e2e.test.mjs`
  - Runner script at `c:\Users\user\Downloads\Project MOAT\Regaarder Compose\run_tests.mjs`
- **Output format**: Clean console outputs with test-by-test breakdown and pass/fail summary.

## Real-World Application Scenarios (Tier 4)
| # | Scenario | Features Exercised | Complexity |
|---|---|---|---|
| 1 | Single CRM Generation | F1, F3, F5 | Low |
| 2 | Multi-source ID matching (relational connection) | F1, F2, F3, F4, F5 | High |
| 3 | Empty workspace to populated sheet transition | F1, F2, F3, F5 | Medium |
| 4 | Grid interactive selection updating sidebar | F2, F5 | Medium |
| 5 | Multi-step upload with invalid format rejection | F1, F3, F4 | Medium |

## Coverage Thresholds
- Tier 1: 5 tests per feature (total 25)
- Tier 2: 5 tests per feature (total 25)
- Tier 3: Pairwise combination of major states (total 5)
- Tier 4: Real-world user scenario flows (total 5)
- **Total Minimum Expected**: 60 test cases
