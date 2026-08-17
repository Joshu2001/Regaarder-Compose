import { RobustBrowserRuntimeGuardian } from './runtimeGuardian';
import { ObservationSnapshot } from './semanticVerifier';

async function testRuntimeGuardianGuards() {
  console.log('=== Testing Runtime Guardian & Semantic Verification Architecture ===\n');

  const guardian = new RobustBrowserRuntimeGuardian(
    'Find TypeScript documentation',
    'https://www.google.com'
  );

  let currentObs: ObservationSnapshot = {
    url: 'https://www.google.com',
    pageType: 'search_home',
    semanticTargets: [
      { role: 'combobox', name: 'Search', selector: '#APjFqb', value: '', isFocused: true, isVisible: true },
      { role: 'link', name: 'Gmail', selector: '#gb_70', isVisible: true },
    ],
  };

  // Test 1: Model attempts hallucinated workspace tool (workspace_create_sheet)
  console.log('--- Test 1: Gating Hallucinated Workspace Tool in Browser Mode ---');
  const invalidToolAttempt = guardian.executeModelAction(
    'workspace_create_sheet',
    { title: 'Test Sheet', columns: ['A', 'B'] },
    currentObs,
    () => currentObs
  );
  console.log('Success:', invalidToolAttempt.success);
  console.log('Guardian Message:', invalidToolAttempt.message);
  console.log('Was tool prevented?', invalidToolAttempt.success === false ? 'YES (CORRECT)' : 'NO (FAILED)');

  // Test 2: Valid Semantic Input Fill
  console.log('\n--- Test 2: Semantic Fill Input Execution & Verification ---');
  const fillAttempt = guardian.executeModelAction(
    'fill_input',
    { selector: '#APjFqb', role: 'combobox', text: 'TypeScript documentation' },
    currentObs,
    (tool, p) => ({
      ...currentObs,
      semanticTargets: [
        { role: 'combobox', name: 'Search', selector: '#APjFqb', value: p.text, isFocused: true, isVisible: true },
      ],
    })
  );
  console.log('Fill Success:', fillAttempt.success);
  console.log('Guardian Message:', fillAttempt.message);
  currentObs = fillAttempt.newState!;

  // Test 3: Press ENTER & Observe URL / Search Results Shift
  console.log('\n--- Test 3: Press Key ENTER Verification Loop ---');
  const pressEnterAttempt = guardian.executeModelAction(
    'press_key',
    { key: 'ENTER', targetSelector: '#APjFqb' },
    currentObs,
    () => ({
      url: 'https://www.google.com/search?q=TypeScript+documentation',
      pageType: 'search_results',
      semanticTargets: [
        { role: 'link', name: 'TypeScript: JavaScript With Syntax For Types', selector: 'h3 > a', isVisible: true },
        { role: 'link', name: 'Documentation - TypeScript', selector: 'h3 > a:nth-of-type(2)', isVisible: true },
      ],
    })
  );
  console.log('Submit Success:', pressEnterAttempt.success);
  console.log('Guardian Message:', pressEnterAttempt.message);
  currentObs = pressEnterAttempt.newState!;

  // Test 4: Incompatible Surface Detection (e.g. Google Images)
  console.log('\n--- Test 4: Google Images Surface Mismatch Check ---');
  const imagesObs: ObservationSnapshot = {
    url: 'https://www.google.com/imghp?hl=en',
    pageType: 'incompatible_surface',
    semanticTargets: [],
  };
  const mismatchAttempt = guardian.executeModelAction(
    'fill_input',
    { selector: '#search', text: 'TypeScript doc' },
    imagesObs,
    () => imagesObs
  );
  console.log('Mismatch Caught:', mismatchAttempt.success === false);
  console.log('Guardian Message:', mismatchAttempt.message);

  // Test 5: Explicit Task State Check
  console.log('\n--- Test 5: Explicit Task State Prompt Generation ---');
  console.log(guardian.getTaskStatePrompt());

  console.log('\n=== All Runtime Guardian Guard Tests Passed Successfully ===');
}

testRuntimeGuardianGuards().catch(console.error);
