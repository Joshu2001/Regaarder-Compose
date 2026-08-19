/**
 * browserAgentService.js
 * 
 * Regaarder Autonomous Browser & Web Research Agent
 * Connects to live Google News RSS, DuckDuckGo Web Indices, Wikipedia,
 * and extracts real-time breaking news, articles, and hyperlinked citations.
 */

// Multi-CORS proxy fallbacks for reliable web fetching in browser environments
const PROXIES = [
  (url) => `https://api.allorigins.win/get?url=${encodeURIComponent(url)}`,
  (url) => `https://corsproxy.io/?${encodeURIComponent(url)}`,
  (url) => `https://api.codetabs.com/v1/proxy?quest=${encodeURIComponent(url)}`
];

async function fetchWithProxy(targetUrl) {
  for (const proxyGen of PROXIES) {
    try {
      const pUrl = proxyGen(targetUrl);
      const res = await fetch(pUrl, { headers: { 'Accept': 'application/xml, text/xml, text/html, application/json' } });
      if (res.ok) {
        // allorigins returns JSON with { contents: "..." }
        if (pUrl.includes('allorigins.win')) {
          const data = await res.json();
          if (data && data.contents) return data.contents;
        } else {
          const text = await res.text();
          if (text) return text;
        }
      }
    } catch (e) {
      console.warn('[BrowserAgent] Proxy attempt failed:', e);
    }
  }
  return null;
}

/**
 * Live Google News RSS Search - Returns up-to-the-minute breaking news & articles
 */
export async function searchGoogleNews(query) {
  const cleanQuery = encodeURIComponent(query.trim());
  const rssUrl = `https://news.google.com/rss/search?q=${cleanQuery}&hl=en-US&gl=US&ceid=US:en`;
  const items = [];

  try {
    const xmlText = await fetchWithProxy(rssUrl);
    if (xmlText) {
      const parser = new DOMParser();
      const xmlDoc = parser.parseFromString(xmlText, 'text/xml');
      const itemNodes = xmlDoc.querySelectorAll('item');

      itemNodes.forEach((node, idx) => {
        if (idx < 8) {
          const title = node.querySelector('title')?.textContent || '';
          const link = node.querySelector('link')?.textContent || '';
          const pubDate = node.querySelector('pubDate')?.textContent || '';
          const source = node.querySelector('source')?.textContent || 'Google News';
          const description = node.querySelector('description')?.textContent || '';
          
          // Clean HTML from description
          const cleanDesc = description.replace(/<[^>]+>/g, ' ').replace(/\s+/g, ' ').trim();

          if (title) {
            items.push({
              title: title.replace(/ - [^-]+$/, '').trim(),
              url: link || `https://news.google.com/search?q=${cleanQuery}`,
              pubDate: pubDate ? new Date(pubDate).toLocaleDateString('en-US', { month: 'short', day: 'numeric', year: 'numeric', hour: '2-digit', minute: '2-digit' }) : 'Today',
              source: source || 'News Source',
              snippet: cleanDesc || title
            });
          }
        }
      });
    }
  } catch (err) {
    console.warn('[BrowserAgent] Google News RSS error:', err);
  }

  return items;
}

/**
 * Wikipedia Live Article Search
 */
export async function searchWikipedia(query) {
  const cleanQuery = encodeURIComponent(query.trim());
  const wikiUrl = `https://en.wikipedia.org/w/api.php?action=query&list=search&srsearch=${cleanQuery}&utf8=&format=json&origin=*`;
  const items = [];

  try {
    const res = await fetch(wikiUrl);
    if (res.ok) {
      const data = await res.json();
      if (data.query && Array.isArray(data.query.search)) {
        data.query.search.slice(0, 3).forEach(item => {
          const cleanSnippet = item.snippet.replace(/<[^>]+>/g, '');
          items.push({
            title: item.title,
            url: `https://en.wikipedia.org/wiki/${encodeURIComponent(item.title.replace(/ /g, '_'))}`,
            pubDate: 'Encyclopedia',
            source: 'Wikipedia',
            snippet: cleanSnippet
          });
        });
      }
    }
  } catch (err) {
    console.warn('[BrowserAgent] Wikipedia search error:', err);
  }

  return items;
}

/**
 * DuckDuckGo Instant Answers & Topics
 */
export async function searchDuckDuckGo(query) {
  const cleanQuery = encodeURIComponent(query.trim());
  const ddgUrl = `https://api.duckduckgo.com/?q=${cleanQuery}&format=json&no_html=1&skip_disambig=1`;
  const items = [];

  try {
    const res = await fetch(ddgUrl);
    if (res.ok) {
      const data = await res.json();
      if (data.AbstractText) {
        items.push({
          title: data.Heading || query,
          url: data.AbstractURL || `https://duckduckgo.com/?q=${cleanQuery}`,
          pubDate: 'Knowledge Graph',
          source: data.AbstractSource || 'DuckDuckGo',
          snippet: data.AbstractText
        });
      }
      if (Array.isArray(data.RelatedTopics)) {
        data.RelatedTopics.slice(0, 3).forEach(topic => {
          if (topic.Text && topic.FirstURL) {
            items.push({
              title: topic.Text.slice(0, 60) + '...',
              url: topic.FirstURL,
              pubDate: 'Web',
              source: 'DuckDuckGo Index',
              snippet: topic.Text
            });
          }
        });
      }
    }
  } catch (err) {
    console.warn('[BrowserAgent] DDG search error:', err);
  }

  return items;
}

/**
 * Comprehensive Live Web Search
 */
export async function searchLiveWeb(query) {
  // Execute parallel searches
  const [newsResults, wikiResults, ddgResults] = await Promise.all([
    searchGoogleNews(query),
    searchWikipedia(query),
    searchDuckDuckGo(query)
  ]);

  const all = [...newsResults, ...wikiResults, ...ddgResults];

  // Deduplicate by URL or Title
  const seen = new Set();
  const deduped = [];
  for (const item of all) {
    const key = item.title.toLowerCase();
    if (!seen.has(key)) {
      seen.add(key);
      deduped.push(item);
    }
  }

  return deduped.slice(0, 10);
}

/**
 * Extract readable article text from any target URL
 */
export async function fetchWebPageText(targetUrl) {
  try {
    const html = await fetchWithProxy(targetUrl);
    if (html) {
      const doc = new DOMParser().parseFromString(html, 'text/html');
      doc.querySelectorAll('script, style, nav, footer, noscript, svg, iframe, header').forEach(el => el.remove());
      const bodyText = doc.body ? (doc.body.innerText || doc.body.textContent || '') : '';
      return bodyText.replace(/\s+/g, ' ').trim().slice(0, 4000);
    }
  } catch (err) {
    console.warn('[BrowserAgent] Page text fetch error:', err);
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
  onProgress = () => {},
}) {
  const steps = [];

  // Step 1: Navigating
  const step1 = { id: 1, title: 'Connecting to Live Web Engine', status: 'running' };
  steps.push(step1);
  onProgress({ step: 'connecting', message: 'Connecting to live search indices...', steps: [...steps] });

  let sources = [];
  let fetchedContent = '';

  if (targetUrl) {
    step1.status = 'done';
    const step2 = { id: 2, title: `Fetching URL: ${targetUrl}`, status: 'running' };
    steps.push(step2);
    onProgress({ step: 'fetching', message: `Navigating directly to ${targetUrl}...`, steps: [...steps] });

    fetchedContent = await fetchWebPageText(targetUrl);
    sources.push({ title: targetUrl, url: targetUrl, source: 'Direct URL', snippet: fetchedContent?.slice(0, 300) || '' });
    step2.status = 'done';
  } else {
    step1.status = 'done';
    const step2 = { id: 2, title: `Searching Live Web for "${query}"`, status: 'running' };
    steps.push(step2);
    onProgress({ step: 'searching', message: `Searching live web indices for "${query}"...`, steps: [...steps] });

    sources = await searchLiveWeb(query);
    step2.title = `Retrieved ${sources.length} live sources from Google News & Web`;
    step2.status = 'done';

    fetchedContent = sources.map((s, idx) => `[Source ${idx + 1}: ${s.title}] (${s.url})\nPublisher: ${s.source} | Date: ${s.pubDate || 'Recent'}\n${s.snippet}`).join('\n\n');
  }

  // Step 3: Synthesizing
  const step3 = { id: 3, title: 'Synthesizing Real-Time Findings & Citations', status: 'running' };
  steps.push(step3);
  onProgress({ step: 'synthesizing', message: `Synthesizing ${sources.length} sources and drafting research report...`, steps: [...steps] });

  const aiPrompt = `You are the Regaarder Autonomous Browser Agent. The user asked for real-time web research on:
"${query}"

TODAY'S LIVE RETRIEVED WEB ARTICLES & HEADLINES:
---
${fetchedContent || 'No live articles returned; synthesize latest verified facts.'}
---

CRITICAL REAL-TIME GROUNDING RULES:
1. Ground your entire answer in the LIVE WEB ARTICLES provided above.
2. Report the actual current headlines, verified transfers/news, dates, and club names from the retrieved sources.
3. NEVER make up fictional or outdated events (e.g. do not invent outdated Cristiano Ronaldo to Juventus transfers).
4. Organize into clean, executive Markdown sections:
   # [Main Headline / Overview]
   ## Key Developments & Breaking Updates
   ## Detailed Analysis & Transfer Figures
   ## Verified Sources & Citations
5. For every fact, include real hyperlinked citations using Markdown: [Source Name](URL).
6. Do NOT include conversational greetings (like "Sure!", "Here is...") or code fences around the whole document.`;

  try {
    let responseText = '';
    if (typeof callGemini === 'function') {
      const aiResponse = await callGemini({
        userPrompt: aiPrompt,
        systemPrompt: 'You are the Senior Browser & Live Web Research Agent for Regaarder Compose. Deliver verified, up-to-the-minute research with hyperlinked citations directly grounded in the retrieved live search results.',
      });
      responseText = aiResponse?.text || '';
    } else {
      responseText = `### Live Web Research: ${query}\n\n${fetchedContent}\n\n**Sources:**\n` + sources.map((s, i) => `${i + 1}. [${s.title}](${s.url}) — *${s.source}* (${s.pubDate || 'Recent'})`).join('\n');
    }

    step3.status = 'done';
    const step4 = { id: 4, title: 'Web Research Ready', status: 'done' };
    steps.push(step4);
    onProgress({ step: 'completed', message: 'Web research complete.', steps: [...steps] });

    return {
      success: true,
      text: responseText,
      sources,
      query,
      steps
    };
  } catch (err) {
    console.error('[BrowserAgent] Synthesis error:', err);
    return {
      success: false,
      error: err.message || 'Browser agent execution failed',
      sources,
      steps
    };
  }
}
