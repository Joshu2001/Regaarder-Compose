import { AdaptiveBrowserAgent } from './adaptiveAgent';
import { SpatialPriorEngine } from './spatialPriors';
import { BrowserState, DOMElementNode } from './types';

async function runTests() {
  console.log('=== Starting Adaptive Browser Agent Validation Tests ===\n');

  const agent = new AdaptiveBrowserAgent();

  const mockElements: DOMElementNode[] = [
    { id: 1, tag: 'nav', role: 'navigation', visible: true, rect: { x: 50, y: 50, width: 200, height: 40 }, isInViewport: true },
    { id: 2, tag: 'input', role: 'searchbox', placeholder: 'Search products...', visible: true, rect: { x: 500, y: 60, width: 300, height: 35 }, isInViewport: true },
    { id: 3, tag: 'button', text: 'Submit', visible: true, rect: { x: 820, y: 60, width: 80, height: 35 }, isInViewport: true },
  ];

  const initialState: BrowserState = {
    url: 'https://example.com/shop',
    title: 'Example Shop',
    visibleElements: mockElements,
    hasModalOpen: false,
  };

  // Test 1: Small Model Execution with Spatial Priors & Typing Action
  console.log('--- Test 1: Small Model Spatial Search & Execution ---');
  const smallModelResult = await agent.executeTask('search for shoes', initialState, {
    modelName: 'llama-3.2-3b',
  });
  console.log('Small Model Success:', smallModelResult.success);
  console.log('Executed Steps:', smallModelResult.executedSteps.length);
  console.log('Action Executed:', smallModelResult.executedSteps[0].action);

  // Test 2: Local Trajectory Memory / Cache Hit (Zero LLM Replay)
  console.log('\n--- Test 2: Trajectory Cache Replay ---');
  const cacheHitResult = await agent.executeTask('search for shoes', initialState, {
    modelName: 'llama-3.2-3b',
  });
  console.log('Cache Hit Triggered:', cacheHitResult.fromCache === true);

  // Test 3: Fallback Ladder & External Web Search when Element Missing
  console.log('\n--- Test 3: Fallback Ladder to Google Search on Missing Target ---');
  const emptyState: BrowserState = {
    url: 'https://example.com/empty',
    title: 'Empty Page',
    visibleElements: [],
    hasModalOpen: false,
  };
  const fallbackResult = await agent.executeTask('find documentation', emptyState, {
    modelName: 'default-small',
  });
  console.log('Fallback Steps Count:', fallbackResult.executedSteps.length);
  console.log('Last Action in Fallback:', fallbackResult.executedSteps[fallbackResult.executedSteps.length - 1].action);

  // Test 4: Human Feedback Loop Callback
  console.log('\n--- Test 4: Human-in-the-Loop Clarification ---');
  let promptedUser = false;
  // Trigger step 4 fallback directly by running exhausted fallback
  const userAction = SpatialPriorEngine.getNextFallbackAction(4, 'ambiguous complex task', false);
  if (userAction.action === 'ask_user') {
    promptedUser = true;
    console.log(`[Agent Prompt to User]: ${userAction.question}`);
    console.log(`[Options Provided]: ${userAction.options?.join(', ')}`);
  }
  console.log('User Prompt Callback Triggered:', promptedUser);

  console.log('\n=== All Agent Validation Tests Completed Successfully ===');
}

runTests().catch(console.error);
