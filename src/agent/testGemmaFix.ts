import { AdaptiveBrowserAgent } from './adaptiveAgent';
import { BrowserState, DOMElementNode } from './types';

async function testGemmaGoogleSearchBug() {
  console.log('=== Reproducing & Verifying the Gemma 4B Google Search Case ===\n');

  const agent = new AdaptiveBrowserAgent();

  // Recreate the exact google.com DOM where Gmail appears first in top-right header (token 1 & 2)
  // and the main search input is in the center (token 3)
  const googleDOM: DOMElementNode[] = [
    {
      id: 1,
      tag: 'a',
      role: 'link',
      text: 'Gmail',
      visible: true,
      rect: { x: 1100, y: 15, width: 40, height: 20 }, // Top-Right header
      isInViewport: true,
    },
    {
      id: 2,
      tag: 'a',
      role: 'link',
      text: 'Images',
      visible: true,
      rect: { x: 1160, y: 15, width: 40, height: 20 }, // Top-Right header
      isInViewport: true,
    },
    {
      id: 3,
      tag: 'textarea',
      role: 'combobox',
      placeholder: 'Search Google or type a URL',
      visible: true,
      rect: { x: 350, y: 320, width: 580, height: 45 }, // Center-screen search bar
      isInViewport: true,
    },
  ];

  const googleState: BrowserState = {
    url: 'https://www.google.com',
    title: 'Google',
    visibleElements: googleDOM,
    hasModalOpen: false,
  };

  const result = await agent.executeTask('search TypeScript in Google', googleState, {
    modelName: 'gemma-4b',
  });

  const executedAction = result.executedSteps[0].action;

  console.log('Executed Action:', executedAction);
  console.log('Target ID Chosen:', executedAction.target_id);
  console.log('Did it click Gmail (ID 1)?', executedAction.target_id === 1 ? 'YES (FAILED)' : 'NO (FIXED)');
  console.log('Did it correctly target Search Combobox (ID 3)?', executedAction.target_id === 3 ? 'YES (SUCCESS)' : 'NO');
}

testGemmaGoogleSearchBug().catch(console.error);
