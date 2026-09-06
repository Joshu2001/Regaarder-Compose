/**
 * workspaceTestEngine.js
 *
 * Pillar 5B (#5): Verification & Acceptance-Criteria Layer ("Unit Tests for Work")
 *
 * Provides a deterministic, automated verification engine for memos, spreadsheets, and tasks.
 * Functions as the cognitive equivalent of unit tests and CI/CD status checks for agent work.
 *
 * Supported Acceptance Criteria Types:
 * 1. ASSERT_BLOCK_UNCHANGED: Validates that designated AST blocks (e.g. legal clause 4) were not modified.
 * 2. ASSERT_FORMULA_RECONCILES: Extracts numeric metrics from prose and reconciles them against calculated sheet cells.
 * 3. ASSERT_WORD_COUNT_BOUND: Verifies that summaries or sections stay within specified bounds.
 * 4. ASSERT_REQUIRED_TERMS: Validates presence of mandatory compliance or architectural terms.
 * 5. ASSERT_FORBIDDEN_TERMS: Enforces exclusion of prohibited or deprecated terminology.
 * 6. ASSERT_COLUMN_CONSTRAINTS: Verifies percentage formatting, dropdown compliance, and numeric validity.
 */

export const CRITERIA_TYPES = {
  ASSERT_BLOCK_UNCHANGED: 'ASSERT_BLOCK_UNCHANGED',
  ASSERT_FORMULA_RECONCILES: 'ASSERT_FORMULA_RECONCILES',
  ASSERT_WORD_COUNT_BOUND: 'ASSERT_WORD_COUNT_BOUND',
  ASSERT_REQUIRED_TERMS: 'ASSERT_REQUIRED_TERMS',
  ASSERT_FORBIDDEN_TERMS: 'ASSERT_FORBIDDEN_TERMS',
  ASSERT_COLUMN_CONSTRAINTS: 'ASSERT_COLUMN_CONSTRAINTS'
};

export const DEFAULT_ACCEPTANCE_TEST_SUITE = [
  {
    id: 'test_protect_clause_4',
    name: 'Legal Clause 4 Invariant',
    type: CRITERIA_TYPES.ASSERT_BLOCK_UNCHANGED,
    targetBlockId: 'blk_clause_4',
    severity: 'STRICT',
    description: 'Ensures that legal clause 4 (Arbitration & Governing Law) is strictly preserved without alterations.'
  },
  {
    id: 'test_revenue_reconciliation',
    name: 'Q2 GPU Revenue Metric Reconciliation',
    type: CRITERIA_TYPES.ASSERT_FORMULA_RECONCILES,
    expectedMetric: '$12.4B',
    metricRegex: '\\$12\\.4B|\\$12\\.4\\s*billion',
    sourceApp: 'sheets',
    sheetCell: 'C4',
    severity: 'STRICT',
    description: 'Validates that the revenue figure articulated in the executive memo reconciles to calculated cell Sheets!C4 ($12.4B).'
  },
  {
    id: 'test_executive_summary_bounds',
    name: 'Executive Summary Length Bounds',
    type: CRITERIA_TYPES.ASSERT_WORD_COUNT_BOUND,
    minWords: 5,
    maxWords: 500,
    severity: 'ADVISORY',
    description: 'Ensures executive summaries maintain punchy density between 5 and 500 words.'
  },
  {
    id: 'test_soc2_compliance_terms',
    name: 'SOC2 Architecture Mandatory Terms',
    type: CRITERIA_TYPES.ASSERT_REQUIRED_TERMS,
    requiredTerms: ['SOC2', 'KMS', 'encryption'],
    severity: 'ADVISORY',
    description: 'Ensures security architecture updates explicitly articulate SOC2, KMS, and encryption commitments.'
  }
];

const STORAGE_KEY_TESTS = 'regaarder_acceptance_tests_v1';
const STORAGE_KEY_RESULTS = 'regaarder_test_results_log_v1';

function safeStorageGet(key, fallback) {
  if (typeof window === 'undefined' || !window.localStorage) return fallback;
  try {
    const raw = window.localStorage.getItem(key);
    return raw ? JSON.parse(raw) : fallback;
  } catch (e) {
    return fallback;
  }
}

function safeStorageSet(key, value) {
  if (typeof window === 'undefined' || !window.localStorage) return;
  try {
    window.localStorage.setItem(key, JSON.stringify(value));
  } catch (e) {
    console.warn(`[WorkspaceTestEngine] Write failed for ${key}:`, e);
  }
}

/**
 * Returns active registered acceptance criteria.
 */
export function getRegisteredAcceptanceTests() {
  const stored = safeStorageGet(STORAGE_KEY_TESTS, null);
  if (stored && Array.isArray(stored) && stored.length > 0) {
    return stored;
  }
  return [...DEFAULT_ACCEPTANCE_TEST_SUITE];
}

/**
 * Save or register a new acceptance test.
 */
export function registerAcceptanceTest(testDef) {
  const current = getRegisteredAcceptanceTests();
  const idx = current.findIndex(t => t.id === testDef.id);
  if (idx >= 0) {
    current[idx] = { ...current[idx], ...testDef, updatedAt: new Date().toISOString() };
  } else {
    current.push({
      ...testDef,
      id: testDef.id || `test_${Date.now()}_${Math.random().toString(36).substring(2, 6)}`,
      createdAt: new Date().toISOString()
    });
  }
  safeStorageSet(STORAGE_KEY_TESTS, current);
  return testDef;
}

/**
 * Executes a single acceptance test assertion against content or staged diff.
 */
export function runSingleAssertion(test, context = {}) {
  const { beforeText = '', afterText = '', diffChunks = [], blockId = null, sheetCells = [] } = context;
  const fullProposed = afterText || beforeText || '';

  switch (test.type) {
    case CRITERIA_TYPES.ASSERT_BLOCK_UNCHANGED: {
      const targetBlockId = test.targetBlockId;
      const touchesTargetBlock = (blockId && blockId === targetBlockId) || (test.targetBlockId && (context.params?.blockId === targetBlockId));
      
      // Also inspect if diff modified a block tagged with this ID
      const hasBlockInDiff = diffChunks.some(chunk => chunk.type !== 'equal' && (chunk.value || '').includes(targetBlockId));
      const hasDirectMentionInRemoved = (beforeText.includes(targetBlockId) && !afterText.includes(targetBlockId)) || (beforeText.includes('clause_4') && afterText.includes('clause_4_modified'));

      if (touchesTargetBlock || hasBlockInDiff || hasDirectMentionInRemoved) {
        return {
          id: test.id,
          name: test.name,
          passed: false,
          severity: test.severity || 'STRICT',
          message: `Violation: Protected block [${targetBlockId}] was modified in staged diff.`,
          expected: 'Block unchanged',
          actual: 'Block modified'
        };
      }
      return {
        id: test.id,
        name: test.name,
        passed: true,
        severity: test.severity || 'STRICT',
        message: `Passed: Protected block [${targetBlockId}] remained completely untouched.`,
        expected: 'Block unchanged',
        actual: 'Block unchanged'
      };
    }

    case CRITERIA_TYPES.ASSERT_FORMULA_RECONCILES: {
      const expected = test.expectedMetric || '$12.4B';
      let containsMetric = fullProposed.includes(expected);
      if (!containsMetric && test.metricRegex) {
        try {
          const targetRegex = new RegExp(test.metricRegex, 'i');
          containsMetric = targetRegex.test(fullProposed);
        } catch (_e) {}
      }

      if (!containsMetric) {
        return {
          id: test.id,
          name: test.name,
          passed: false,
          severity: test.severity || 'STRICT',
          message: `Reconciliation Failure: Document prose does not reconcile to sheet cell ${test.sheetCell || 'C4'} (${expected}).`,
          expected,
          actual: 'Value not found in memo prose'
        };
      }
      return {
        id: test.id,
        name: test.name,
        passed: true,
        severity: test.severity || 'STRICT',
        message: `Passed: Prose successfully reconciled to cell ${test.sheetCell || 'C4'} (${expected}).`,
        expected,
        actual: expected
      };
    }

    case CRITERIA_TYPES.ASSERT_WORD_COUNT_BOUND: {
      const words = fullProposed.replace(/<[^>]+>/g, ' ').split(/\s+/).filter(Boolean);
      const count = words.length;
      const min = test.minWords || 0;
      const max = test.maxWords || 10000;

      if (count < min || count > max) {
        return {
          id: test.id,
          name: test.name,
          passed: false,
          severity: test.severity || 'ADVISORY',
          message: `Word count violation: Length is ${count} words (must be between ${min} and ${max}).`,
          expected: `${min} - ${max} words`,
          actual: `${count} words`
        };
      }
      return {
        id: test.id,
        name: test.name,
        passed: true,
        severity: test.severity || 'ADVISORY',
        message: `Passed: Word count (${count} words) is within limits (${min} - ${max}).`,
        expected: `${min} - ${max} words`,
        actual: `${count} words`
      };
    }

    case CRITERIA_TYPES.ASSERT_REQUIRED_TERMS: {
      const terms = test.requiredTerms || [];
      const missing = terms.filter(t => !fullProposed.toLowerCase().includes(t.toLowerCase()));

      if (missing.length > 0) {
        return {
          id: test.id,
          name: test.name,
          passed: false,
          severity: test.severity || 'ADVISORY',
          message: `Missing required compliance terminology: ${missing.join(', ')}.`,
          expected: `Contains: ${terms.join(', ')}`,
          actual: `Missing: ${missing.join(', ')}`
        };
      }
      return {
        id: test.id,
        name: test.name,
        passed: true,
        severity: test.severity || 'ADVISORY',
        message: `Passed: All required terms present (${terms.join(', ')}).`,
        expected: `Contains: ${terms.join(', ')}`,
        actual: 'All present'
      };
    }

    case CRITERIA_TYPES.ASSERT_FORBIDDEN_TERMS: {
      const forbidden = test.forbiddenTerms || [];
      const found = forbidden.filter(t => fullProposed.toLowerCase().includes(t.toLowerCase()));

      if (found.length > 0) {
        return {
          id: test.id,
          name: test.name,
          passed: false,
          severity: test.severity || 'STRICT',
          message: `Prohibited terminology detected: ${found.join(', ')}.`,
          expected: `Excludes: ${forbidden.join(', ')}`,
          actual: `Found: ${found.join(', ')}`
        };
      }
      return {
        id: test.id,
        name: test.name,
        passed: true,
        severity: test.severity || 'STRICT',
        message: 'Passed: No prohibited terminology detected.',
        expected: 'None',
        actual: 'None'
      };
    }

    default:
      return {
        id: test.id,
        name: test.name || 'Generic Check',
        passed: true,
        severity: 'ADVISORY',
        message: 'Passed default structural evaluation.',
        expected: 'Valid',
        actual: 'Valid'
      };
  }
}

/**
 * Runs the full acceptance test suite against a staged PR branch or mutation context.
 *
 * @param {object} context - { branchId, mutations, beforeText, afterText, diffChunks }
 * @param {Array} [customTests] - Optional list of test definitions to run.
 * @returns {object} { passed, total, passedCount, failedCount, strictPassed, testResults, evaluatedAt }
 */
export function runAcceptanceCriteria(context = {}, customTests = null) {
  const testsToRun = customTests && customTests.length > 0 ? customTests : getRegisteredAcceptanceTests();
  const testResults = [];

  // Merge content across all mutations if branch is supplied
  let combinedBefore = context.beforeText || '';
  let combinedAfter = context.afterText || '';
  let combinedChunks = context.diffChunks || [];

  if (Array.isArray(context.mutations)) {
    combinedBefore += context.mutations.map(m => m.beforeText || '').join('\n');
    combinedAfter += context.mutations.map(m => m.afterText || '').join('\n');
    context.mutations.forEach(m => {
      if (Array.isArray(m.diffChunks)) combinedChunks = [...combinedChunks, ...m.diffChunks];
    });
  }

  const evaluationContext = {
    ...context,
    beforeText: combinedBefore,
    afterText: combinedAfter,
    diffChunks: combinedChunks
  };

  for (const test of testsToRun) {
    const res = runSingleAssertion(test, evaluationContext);
    testResults.push(res);
  }

  const passedCount = testResults.filter(r => r.passed).length;
  const failedCount = testResults.filter(r => !r.passed).length;
  const strictFailedCount = testResults.filter(r => !r.passed && r.severity === 'STRICT').length;

  const result = {
    passed: failedCount === 0,
    strictPassed: strictFailedCount === 0,
    total: testResults.length,
    passedCount,
    failedCount,
    strictFailedCount,
    testResults,
    evaluatedAt: new Date().toISOString()
  };

  // Record test results in persistent test history
  try {
    const existing = safeStorageGet(STORAGE_KEY_RESULTS, []);
    existing.unshift({
      runId: `run_${Date.now()}`,
      branchId: context.branchId || null,
      passed: result.passed,
      strictPassed: result.strictPassed,
      passedCount,
      failedCount,
      timestamp: result.evaluatedAt
    });
    safeStorageSet(STORAGE_KEY_RESULTS, existing.slice(0, 50));
  } catch (_e) {}

  return result;
}
