/**
 * test-matrix-engine.js
 *
 * Pillar 5: The Matrix Engine Test Suite
 *
 * Exhaustively validates:
 * 1. Rule 7: Intersection Isolation Heuristic ((0,0) text cell with numeric data axis).
 * 2. Rule 9: Categorical Dropdown validation & Native '%' enforcement.
 * 3. Protocol-Level Data Validation & Auto-Fix coercions.
 * 4. In-Browser Formula Engine (SUM, AVERAGE, MIN, MAX, COUNT, COUNTA, IF, VLOOKUP, arithmetic).
 * 5. Cycle Detection (#CYCLE! on circular dependencies).
 * 6. In-Browser Relational SQL Query Engine (SELECT, WHERE, GROUP BY, ORDER BY, LIMIT).
 * 7. Isomorphic AST Serializers (Grid <-> AST <-> Markdown <-> JSON).
 * 8. Surgical Patch Engine (batch patches & Pillar 3 staging PR integration).
 * 9. MCP Protocol Resources (workspace://sheets/active & workspace://sheets/schema).
 */

import assert from 'assert';
import * as matrixEngine from '../src/services/matrixSchemaEngine.js';
import { readWorkspaceResource } from '../src/services/universalMcpBridge.js';
import { createStagingBranch, getBranchById } from '../src/services/workspaceStagingEngine.js';

let passedTests = 0;
let totalTests = 0;

async function test(name, fn) {
  totalTests++;
  try {
    await fn();
    console.log(`  ✓ ${name}`);
    passedTests++;
  } catch (err) {
    console.error(`  ✗ ${name}`);
    console.error(`    ${err.message}`);
    throw err;
  }
}

async function runAllTests() {
  console.log('\n===============================================================');
  console.log('🧪 RUNNING PILLAR 5: THE MATRIX ENGINE SUBSTRATE TEST SUITE');
  console.log('===============================================================\n');

  // ── 1. RULE 7: INTERSECTION ISOLATION HEURISTIC ──────────────────────────────
  console.log('--- Suite 1: Rule 7: Intersection Isolation Heuristic ---');

  await test('Isolates (0,0) intersection cell so text label does not swallow vertical numerical axis', () => {
    // Incident Post-Mortem reproduction:
    // (0,0) is "Apple" (text), row0 remainders are "Oranges", "Banana" (text)
    // col0 remainders are "50%", "36%" (percentages/data)
    const cells = [
      ['Apple', 'Oranges', 'Banana'],
      ['50%', '36%', '14%'],
      ['40%', '45%', '15%'],
    ];

    const schema = matrixEngine.inferMatrixSchema(cells);
    assert.strictEqual(schema.orientation, 'horizontal');
    assert.strictEqual(schema.columns.length, 3);
    assert.strictEqual(schema.columns[0].label, 'Apple');
    assert.strictEqual(schema.columns[1].label, 'Oranges');
    assert.strictEqual(schema.columns[2].label, 'Banana');
    assert.strictEqual(schema.columns[0].type, 'percentage');
    assert.strictEqual(schema.columns[1].type, 'percentage');
    assert.strictEqual(schema.columns[2].type, 'percentage');
  });

  await test('Correctly identifies vertical header orientation when Col 0 remainders are text', () => {
    const cells = [
      ['Metric', 'Jan', 'Feb', 'Mar'],
      ['Revenue', 1000, 1200, 1400],
      ['Expenses', 600, 700, 800],
      ['Net Profit', 400, 500, 600],
    ];

    const schema = matrixEngine.inferMatrixSchema(cells);
    assert.strictEqual(schema.columns.length, 4);
    assert.strictEqual(schema.columns[0].label, 'Metric');
    assert.strictEqual(schema.columns[1].label, 'Jan');
  });

  // ── 2. RULE 9: CATEGORICAL DROPDOWNS & NATIVE '%' VALIDATION ─────────────────
  console.log('\n--- Suite 2: Rule 9: Column Schema & Validation ---');

  await test('Infers dropdown schema with explicit options for categorical fields', () => {
    const cells = [
      ['Deal Name', 'Stage', 'Priority', 'Status'],
      ['Acme Corp', 'Qualified', 'High', 'Active'],
      ['Nova Systems', 'Proposal', 'Medium', 'Pending'],
      ['Zephyr Media', 'Closed Won', 'Urgent', 'Completed'],
    ];

    const schema = matrixEngine.inferMatrixSchema(cells);
    const stageCol = schema.columns.find(c => c.key === 'stage');
    const priorityCol = schema.columns.find(c => c.key === 'priority');
    const statusCol = schema.columns.find(c => c.key === 'status');

    assert.strictEqual(stageCol.type, 'dropdown');
    assert.ok(Array.isArray(stageCol.options));
    assert.ok(stageCol.options.includes('Qualified'));
    assert.ok(stageCol.options.includes('Proposal'));

    assert.strictEqual(priorityCol.type, 'dropdown');
    assert.ok(priorityCol.options.includes('High'));

    assert.strictEqual(statusCol.type, 'dropdown');
    assert.ok(statusCol.options.includes('Active'));
  });

  await test('Validates dropdown cell values against allowed options', () => {
    const schema = { type: 'dropdown', options: ['Active', 'Pending', 'Completed'], label: 'Status' };
    
    const validCheck = matrixEngine.validateCellAgainstSchema('Active', schema);
    assert.strictEqual(validCheck.valid, true);

    const invalidCheck = matrixEngine.validateCellAgainstSchema('UnknownStatus', schema);
    assert.strictEqual(invalidCheck.valid, false);
    assert.strictEqual(invalidCheck.code, 'INVALID_DROPDOWN_VALUE');
    assert.strictEqual(invalidCheck.autoFix, 'Active');
  });

  await test('Enforces native % formatting on percentage columns (rejects raw decimals)', () => {
    const schema = { type: 'percentage', label: 'Gross Margin' };

    const valid = matrixEngine.validateCellAgainstSchema('65%', schema);
    assert.strictEqual(valid.valid, true);

    const unformatted = matrixEngine.validateCellAgainstSchema('0.65', schema);
    assert.strictEqual(unformatted.valid, false);
    assert.strictEqual(unformatted.code, 'UNFORMATTED_PERCENTAGE');
    assert.strictEqual(unformatted.autoFix, '65%');

    const nonNum = matrixEngine.validateCellAgainstSchema('high%', schema);
    assert.strictEqual(nonNum.valid, false);
    assert.strictEqual(nonNum.code, 'INVALID_PERCENTAGE');
  });

  await test('Validates and coerces currency and numeric columns', () => {
    const currSchema = { type: 'currency', label: 'Revenue' };
    const numSchema = { type: 'number', label: 'Headcount' };

    assert.strictEqual(matrixEngine.validateCellAgainstSchema('$1,500.00', currSchema).valid, true);
    
    const needsDollar = matrixEngine.validateCellAgainstSchema('1500', currSchema);
    assert.strictEqual(needsDollar.valid, true);
    assert.strictEqual(needsDollar.needsCoercion, true);
    assert.ok(needsDollar.autoFix.includes('$'));

    assert.strictEqual(matrixEngine.validateCellAgainstSchema('42', numSchema).valid, true);
    assert.strictEqual(matrixEngine.validateCellAgainstSchema('FortyTwo', numSchema).valid, false);
  });

  await test('Full matrix validation returns precise cell coordinate violations', () => {
    const columns = [
      { index: 0, key: 'item', label: 'Item', type: 'text' },
      { index: 1, key: 'margin', label: 'Margin', type: 'percentage' },
      { index: 2, key: 'status', label: 'Status', type: 'dropdown', options: ['Active', 'Archived'] },
    ];
    const cells = [
      ['Item', 'Margin', 'Status'],
      ['Widget A', '45%', 'Active'],
      ['Widget B', '0.80', 'InvalidChoice'],
    ];

    const report = matrixEngine.validateMatrixData(cells, columns);
    assert.strictEqual(report.valid, false);
    assert.strictEqual(report.violationCount, 2);
    assert.strictEqual(report.violations[0].cellRef, 'B3');
    assert.strictEqual(report.violations[0].code, 'UNFORMATTED_PERCENTAGE');
    assert.strictEqual(report.violations[0].autoFix, '80%');
    assert.strictEqual(report.violations[1].cellRef, 'C3');
    assert.strictEqual(report.violations[1].code, 'INVALID_DROPDOWN_VALUE');
  });

  // ── 3. IN-BROWSER FORMULA ENGINE & TOPOLOGICAL CALCULATION ───────────────────
  console.log('\n--- Suite 3: In-Browser Formula Engine & Cycle Detection ---');

  await test('Evaluates SUM, AVERAGE, MIN, MAX, COUNT, and COUNTA formulas', () => {
    const cellStore = {
      'A1': 10, 'A2': 20, 'A3': 30,
      'B1': 100, 'B2': 200, 'B3': 300,
    };
    const resolver = (ref) => cellStore[ref.toUpperCase()] || 0;

    assert.strictEqual(matrixEngine.evaluateFormula('=SUM(A1:A3)', resolver), 60);
    assert.strictEqual(matrixEngine.evaluateFormula('=AVERAGE(A1:A3)', resolver), 20);
    assert.strictEqual(matrixEngine.evaluateFormula('=MIN(A1:A3)', resolver), 10);
    assert.strictEqual(matrixEngine.evaluateFormula('=MAX(A1:A3)', resolver), 30);
    assert.strictEqual(matrixEngine.evaluateFormula('=COUNT(A1:A3)', resolver), 3);
    assert.strictEqual(matrixEngine.evaluateFormula('=COUNTA(A1:A3)', resolver), 3);
  });

  await test('Evaluates IF conditional logic', () => {
    const cellStore = { 'A1': 75, 'A2': 30 };
    const resolver = (ref) => cellStore[ref.toUpperCase()] || 0;

    assert.strictEqual(matrixEngine.evaluateFormula('=IF(A1 > 50, "Pass", "Fail")', resolver), 'Pass');
    assert.strictEqual(matrixEngine.evaluateFormula('=IF(A2 > 50, "Pass", "Fail")', resolver), 'Fail');
    assert.strictEqual(matrixEngine.evaluateFormula('=IF(A1 = 75, 100, 0)', resolver), 100);
  });

  await test('Evaluates VLOOKUP horizontal & vertical lookup logic', () => {
    const grid = [
      ['ID', 'Product', 'Price'],
      ['P01', 'Keyboard', 50],
      ['P02', 'Mouse', 30],
      ['P03', 'Monitor', 200],
    ];
    const resolver = (_ref, r, c) => grid[r]?.[c];

    const res1 = matrixEngine.evaluateFormula('=VLOOKUP("P02", A2:C4, 2)', resolver);
    assert.strictEqual(res1, 'Mouse');

    const res2 = matrixEngine.evaluateFormula('=VLOOKUP("P03", A2:C4, 3)', resolver);
    assert.strictEqual(res2, 200);

    const resMissing = matrixEngine.evaluateFormula('=VLOOKUP("P99", A2:C4, 2)', resolver);
    assert.strictEqual(resMissing, '#N/A');
  });

  await test('Evaluates arithmetic cell expressions with precedence', () => {
    const cellStore = { 'A1': 100, 'B1': 20, 'C1': 5 };
    const resolver = (ref) => cellStore[ref.toUpperCase()] || 0;

    assert.strictEqual(matrixEngine.evaluateFormula('=A1 + B1 * C1', resolver), 200);
    assert.strictEqual(matrixEngine.evaluateFormula('=(A1 + B1) / C1', resolver), 24);
  });

  await test('Detects circular dependencies and returns #CYCLE! without crashing', () => {
    const cells = [
      ['=B1 + 1', '=A1 + 1'],
    ];

    const evalRes = matrixEngine.evaluateMatrixFormulas(cells);
    assert.strictEqual(evalRes.formulaCount, 2);
    assert.ok(evalRes.cyclesFound.length > 0);
    assert.strictEqual(evalRes.evaluatedCells[0][0], '#CYCLE!');
    assert.strictEqual(evalRes.evaluatedCells[0][1], '#CYCLE!');
  });

  // ── 4. IN-BROWSER RELATIONAL SQL QUERY ENGINE ────────────────────────────────
  console.log('\n--- Suite 4: In-Browser Relational SQL Query Engine ---');

  const testGrid = [
    ['Category', 'Actual', 'Budget', 'Status'],
    ['Revenue', 95000, 90000, 'Active'],
    ['COGS', 32000, 30000, 'Active'],
    ['Salaries', 24000, 25000, 'Active'],
    ['Marketing', 12000, 10000, 'Review'],
    ['Software', 3500, 3000, 'Active'],
  ];

  await test('Executes SELECT * projection', () => {
    const res = matrixEngine.queryMatrixSql(testGrid, 'SELECT *');
    assert.strictEqual(res.success, true);
    assert.strictEqual(res.rowCount, 5);
    assert.strictEqual(res.columns.length, 4);
    assert.strictEqual(res.rows[0][0], 'Revenue');
  });

  await test('Executes WHERE condition filtering', () => {
    const res = matrixEngine.queryMatrixSql(testGrid, 'SELECT Category, Actual WHERE Actual > 20000');
    assert.strictEqual(res.success, true);
    assert.strictEqual(res.rowCount, 3);
    assert.strictEqual(res.rows[0][0], 'Revenue');
    assert.strictEqual(res.rows[1][0], 'COGS');
    assert.strictEqual(res.rows[2][0], 'Salaries');
  });

  await test('Executes WHERE string equality & LIKE patterns', () => {
    const resExact = matrixEngine.queryMatrixSql(testGrid, "SELECT Category WHERE Status = 'Review'");
    assert.strictEqual(resExact.rowCount, 1);
    assert.strictEqual(resExact.rows[0][0], 'Marketing');

    const resLike = matrixEngine.queryMatrixSql(testGrid, "SELECT Category WHERE Category LIKE 'Sal%'");
    assert.strictEqual(resLike.rowCount, 1);
    assert.strictEqual(resLike.rows[0][0], 'Salaries');
  });

  await test('Executes GROUP BY with SUM and AVG aggregations', () => {
    const groupGrid = [
      ['Department', 'Role', 'Cost'],
      ['Engineering', 'Dev', 120000],
      ['Engineering', 'QA', 80000],
      ['Marketing', 'Lead', 90000],
      ['Marketing', 'Writer', 60000],
    ];

    const res = matrixEngine.queryMatrixSql(groupGrid, 'SELECT Department, SUM(Cost), AVG(Cost) GROUP BY Department');
    assert.strictEqual(res.success, true);
    assert.strictEqual(res.rowCount, 2);
    assert.strictEqual(res.columns[0], 'Department');
    assert.strictEqual(res.columns[1], 'SUM(Cost)');

    const engRow = res.rows.find(r => r[0] === 'Engineering');
    assert.strictEqual(engRow[1], 200000);
    assert.strictEqual(engRow[2], 100000);

    const mktRow = res.rows.find(r => r[0] === 'Marketing');
    assert.strictEqual(mktRow[1], 150000);
    assert.strictEqual(mktRow[2], 75000);
  });

  await test('Executes ORDER BY and LIMIT clauses', () => {
    const res = matrixEngine.queryMatrixSql(testGrid, 'SELECT Category, Actual ORDER BY Actual DESC LIMIT 2');
    assert.strictEqual(res.success, true);
    assert.strictEqual(res.rowCount, 2);
    assert.strictEqual(res.rows[0][0], 'Revenue');
    assert.strictEqual(res.rows[1][0], 'COGS');
  });

  // ── 5. ISOMORPHIC AST SERIALIZERS ────────────────────────────────────────────
  console.log('\n--- Suite 5: Isomorphic AST Serializers ---');

  await test('Converts 2D Grid to Matrix AST and back to Grid seamlessly', () => {
    const ast = matrixEngine.gridToMatrixAst({ id: 'test_mat', cells: testGrid });
    assert.strictEqual(ast.matrixId, 'test_mat');
    assert.strictEqual(ast.columns.length, 4);
    assert.strictEqual(ast.rowCount, 5);
    assert.strictEqual(ast.rows[0].category, 'Revenue');

    const restored = matrixEngine.matrixAstToGrid(ast);
    assert.strictEqual(restored.cells[0][0], 'Category');
    assert.strictEqual(restored.cells[1][0], 'Revenue');
    assert.strictEqual(restored.formats[0][0].fontWeight, 'bold');
  });

  await test('Serializes Matrix to token-dense Markdown table (saves context tokens)', () => {
    const md = matrixEngine.matrixAstToMarkdown({ cells: testGrid });
    assert.ok(md.includes('| Category | Actual | Budget | Status |'));
    assert.ok(md.includes('| Revenue | 95000 | 90000 | Active |'));
    assert.ok(md.includes('---:'));
  });

  await test('Serializes Matrix to JSON records', () => {
    const jsonStr = matrixEngine.matrixAstToJson({ cells: testGrid });
    const parsed = JSON.parse(jsonStr);
    assert.strictEqual(parsed.rowCount, 5);
    assert.strictEqual(parsed.columns[0].label, 'Category');
  });

  // ── 6. SURGICAL PATCH ENGINE & PILLAR 3 STAGING ──────────────────────────────
  console.log('\n--- Suite 6: Surgical Patch Engine & Pillar 3 Staging ---');

  await test('Direct patch returns success when window globals are mockable', async () => {
    const patches = [
      { row: 1, col: 1, value: 98000 },
      { row: 1, col: 3, value: 'Archived' },
    ];
    const res = await matrixEngine.patchMatrixCells({ sheetId: 'sheet1', patches });
    assert.strictEqual(res.success, true);
  });

  await test('Stages cell patches into isolated Pillar 3 PR sandbox when stage: true', async () => {
    const mockStaging = {
      createStagingBranch: (meta) => createStagingBranch(meta),
      stageMutation: (params) => {
        return { mutationId: 'mut_staged_1', ...params };
      },
    };
    global.window = { __REGAARDER_STAGING_ENGINE__: mockStaging };

    const patches = [{ row: 1, col: 1, value: 105000 }];
    const res = await matrixEngine.patchMatrixCells({
      sheetId: 'fin_model_1',
      patches,
      stage: true,
    });

    assert.strictEqual(res.success, true);
    assert.strictEqual(res.staged, true);
    assert.ok(res.branchId && res.branchId.startsWith('pr_'));
    assert.ok(res.message.includes('Staged 1 cell update'));

    delete global.window;
  });

  await test('Adds column with explicit schema and options', async () => {
    const res = await matrixEngine.addColumnWithSchema({
      sheetId: 'sheet1',
      column: {
        label: 'Department Priority',
        type: 'dropdown',
        options: ['Urgent', 'Normal', 'Low'],
      },
    });

    assert.strictEqual(res.success, true);
    assert.strictEqual(res.column.type, 'dropdown');
    assert.deepStrictEqual(res.column.options, ['Urgent', 'Normal', 'Low']);
  });

  // ── 7. MCP PROTOCOL INTEGRATION ──────────────────────────────────────────────
  console.log('\n--- Suite 7: MCP Protocol Resources & Feeds ---');

  await test('Reads workspace://sheets/active returning token-dense Markdown', async () => {
    const res = await readWorkspaceResource('workspace://sheets/active');
    assert.strictEqual(res.uri, 'workspace://sheets/active');
    assert.strictEqual(res.mimeType, 'text/markdown');
    assert.ok(res.text.includes('| Quarter |') || res.text.includes('| Column |'));
  });

  await test('Reads workspace://sheets/schema returning column definitions JSON', async () => {
    const res = await readWorkspaceResource('workspace://sheets/schema');
    assert.strictEqual(res.uri, 'workspace://sheets/schema');
    assert.strictEqual(res.mimeType, 'application/json');
    const parsed = JSON.parse(res.text);
    assert.ok(Array.isArray(parsed.columns));
  });

  // ── SUMMARY REPORT ───────────────────────────────────────────────────────────
  console.log('\n===============================================================');
  console.log(`✅ PILLAR 5 TEST SUITE COMPLETE: ${passedTests}/${totalTests} TESTS PASSED`);
  console.log('===============================================================\n');
}

runAllTests().catch((err) => {
  console.error('Fatal test error:', err);
  process.exit(1);
});
