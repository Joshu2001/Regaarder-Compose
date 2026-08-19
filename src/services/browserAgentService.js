/**
 * browserAgentService.js
 * 
 * Regaarder Autonomous Browser & Web Research Agent
 * Enables real-time web browsing, search querying, page content extraction,
 * and citation synthesis directly within Docs, Sheets, Decks, and Assistant Chat.
 */

// Safe proxy / public endpoints for real-time web retrieval
const CORS_PROXIES = [
  'https://api.allorigins.win/get?url=',
  'https://corsproxy.io/?',
];

/**
 * Perform live web search using DuckDuckGo & Wikipedia APIs
 */
export async function searchLiveWeb(query) {
  const cleanQuery = encodeURIComponent(query.trim());
  const results = [];

  // 1. DuckDuckGo Instant Answer API
  try {
    const ddgUrl = `https://api.duckduckgo.com/?q=${cleanQuery}&format=json&no_html=1&skip_disambig=1`;
    const response = await fetch(ddgUrl);
    if (response.ok) {
      const data = await response.json();
      if (data.AbstractText) {
        results.push({
          title: data.Heading || query,
          url: data.AbstractURL || `https://duckduckgo.com/?q=${cleanQuery}`,
          snippet: data.AbstractText,
          source: data.AbstractSource || 'DuckDuckGo Knowledge'
        });
      }
      if (Array.isArray(data.RelatedTopics)) {
        for (const topic of data.RelatedTopics.slice(0, 4)) {
          if (topic.Text && topic.FirstURL) {
            results.push({
              title: topic.Text.slice(0, 60) + '...',
              url: topic.FirstURL,
              snippet: topic.Text,
              source: 'Web Source'
            });
          }
        }
      }
    }
  } catch (err) {
    console.warn('[BrowserAgent] DDG search fallback:', err);
  }

  // 2. Wikipedia Live Article Search
  try {
    const wikiUrl = `https://en.wikipedia.org/w/api.php?action=query&list=search&srsearch=${cleanQuery}&utf8=&format=json&origin=*`;
    const wikiRes = await fetch(wikiUrl);
    if (wikiRes.ok) {
      const wikiData = await wikiRes.json();
      if (wikiData.query && Array.isArray(wikiData.query.search)) {
        for (const item of wikiData.query.search.slice(0, 3)) {
          const cleanSnippet = item.snippet.replace(/<[^>]+>/g, '');
          results.push({
            title: item.title,
            url: `https://en.wikipedia.org/wiki/${encodeURIComponent(item.title.replace(/ /g, '_'))}`,
            snippet: cleanSnippet,
            source: 'Wikipedia'
          });
        }
      }
    }
  } catch (err) {
    console.warn('[BrowserAgent] Wikipedia search fallback:', err);
  }

  // 3. If no direct API results, create synthesized web query fallback
  if (results.length === 0) {
    results.push({
      title: `Search results for "${query}"`,
      url: `https://www.google.com/search?q=${cleanQuery}`,
      snippet: `Live web index query for: ${query}. Comprehensive knowledge base synthesis enabled.`,
      source: 'Global Web Index'
    });
  }

  return results;
}

/**
 * Fetch and extract text content from any target URL
 */
export async function fetchWebPageText(targetUrl) {
  try {
    const encoded = encodeURIComponent(targetUrl);
    const proxyUrl = `https://api.allorigins.win/get?url=${encoded}`;
    const response = await fetch(proxyUrl);
    if (response.ok) {
      const data = await response.json();
      const html = data.contents || '';
      
      const doc = new DOMParser().parseFromString(html, 'text/html');
      doc.querySelectorAll('script, style, nav, footer, noscript, svg, iframe').forEach(el => el.remove());
      
      const bodyText = doc.body ? (doc.body.innerText || doc.body.textContent || '') : '';
      const clean = bodyText.replace(/\s+/g, ' ').trim().slice(0, 4000);
      return clean;
    }
  } catch (err) {
    console.warn('[BrowserAgent] Page fetch error:', err);
  }
  return null;
}

/**
 * Main Autonomous Browser Agent Runner
 */
export async function runBrowserAgent({
  query,
  targetUrl = null,
  callGemini = null,
  systemPrompt = '',
  onProgress = () => {},
}) {
  onProgress({ step: 'navigating', message: `Navigating web for: "${query}"...` });

  let fetchedContent = '';
  let sources = [];

  if (targetUrl) {
    onProgress({ step: 'fetching', message: `Visiting URL: ${targetUrl}...` });
    fetchedContent = await fetchWebPageText(targetUrl);
    sources.push({ title: targetUrl, url: targetUrl, source: 'Direct URL' });
  } else {
    onProgress({ step: 'searching', message: `Searching live web indices...` });
    sources = await searchLiveWeb(query);
    fetchedContent = sources.map(s => `[Source: ${s.title}] (${s.url})\n${s.snippet}`).join('\n\n');
  }

  onProgress({ step: 'synthesizing', message: `Synthesizing ${sources.length} sources and drafting insights...` });

  const aiPrompt = `You are the Regaarder Autonomous Browser Agent. The user wants up-to-date web research on:
"${query}"

Here are the real-time retrieved web search results and webpage excerpts:
---
${fetchedContent || 'No direct text extracted; synthesize from latest domain knowledge.'}
---

Instructions:
1. Provide a comprehensive, executive-tier research brief answering the user query.
2. Ground all facts and insights in the web sources above.
3. Include real hyperlinked citations using Markdown format: [Source Name](URL).
4. Organize into clear sections: Key Findings, Real-Time Data & Insights, Citations.
5. Do NOT include code fences around the whole response or conversational greetings.`;

  try {
    let responseText = '';
    if (typeof callGemini === 'function') {
      const aiResponse = await callGemini({
        userPrompt: aiPrompt,
        systemPrompt: systemPrompt || 'You are the Senior Web Research and Browser Agent for Regaarder Compose. Deliver clear, verified, hyperlinked executive research.',
      });
      responseText = aiResponse?.text || '';
    } else {
      // Direct fallback summary
      responseText = `### Live Web Research: ${query}\n\n${fetchedContent}\n\n**Sources:**\n` + sources.map((s, i) => `${i + 1}. [${s.title}](${s.url}) (${s.source})`).join('\n');
    }

    onProgress({ step: 'completed', message: 'Web research complete.' });

    return {
      success: true,
      text: responseText,
      sources,
      query
    };
  } catch (err) {
    console.error('[BrowserAgent] Synthesis error:', err);
    return {
      success: false,
      error: err.message || 'Browser agent execution failed',
      sources
    };
  }
}
