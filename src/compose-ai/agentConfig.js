/**
 * agentConfig.js
 *
 * Single source of truth for the Compose AI Writing System.
 * Defines the 11 agent identities, their visual metadata, and their
 * specialized system prompt builders. Each prompt shapes a distinct
 * AI "personality" layered on the same underlying model.
 */

// ── Agent ID constants ─────────────────────────────────────────────
export const AGENT_IDS = {
  HEALTH:        'health',
  WRITING:       'writing',
  EDITOR:        'editor',
  DESIGNER:      'designer',
  LOGIC:         'logic',
  RESEARCH:      'research',
  REVIEWER:      'reviewer',
  AUDIENCE:      'audience',
  CONSISTENCY:   'consistency',
  COMPLIANCE:    'compliance',
  KNOWLEDGE_GAP: 'knowledge-gap',
  DNA:           'dna',
};

// Maps agent ID → CSS highlight category class suffix (for editor ink colours)
export const AGENT_HIGHLIGHT_CATEGORY = {
  [AGENT_IDS.EDITOR]:        'editor',
  [AGENT_IDS.LOGIC]:         'logic',
  [AGENT_IDS.CONSISTENCY]:   'consistency',
  [AGENT_IDS.COMPLIANCE]:    'compliance',
  [AGENT_IDS.KNOWLEDGE_GAP]: 'gap',
  [AGENT_IDS.RESEARCH]:      'research',
  [AGENT_IDS.DESIGNER]:      'designer',
};

// ── Agent registry ─────────────────────────────────────────────────
export const AGENT_REGISTRY = [
  {
    id: AGENT_IDS.HEALTH,
    label: 'Health',
    icon: 'Activity',
    description: 'Full document quality analysis across all 6 dimensions',
    accentClass: 'text-indigo-600',
    bgClass: 'bg-indigo-50',
  },
  {
    id: AGENT_IDS.WRITING,
    label: 'Writing',
    icon: 'Pen',
    description: 'Tone, expansion, brainstorm, generation',
    accentClass: 'text-violet-600',
    bgClass: 'bg-violet-50',
  },
  {
    id: AGENT_IDS.EDITOR,
    label: 'Editor',
    icon: 'CheckCircle2',
    description: 'Grammar, clarity, passive voice, style',
    accentClass: 'text-amber-700',
    bgClass: 'bg-amber-50',
  },
  {
    id: AGENT_IDS.DESIGNER,
    label: 'Designer',
    icon: 'Layout',
    description: 'Document type detection and formatting',
    accentClass: 'text-teal-700',
    bgClass: 'bg-teal-50',
  },
  {
    id: AGENT_IDS.LOGIC,
    label: 'Logic',
    icon: 'Bot',
    description: 'Reasoning, contradictions, fallacies',
    accentClass: 'text-rose-600',
    bgClass: 'bg-rose-50',
  },
  {
    id: AGENT_IDS.RESEARCH,
    label: 'Research',
    icon: 'BookOpen',
    description: 'Citations, sources, bibliography',
    accentClass: 'text-emerald-700',
    bgClass: 'bg-emerald-50',
  },
  {
    id: AGENT_IDS.REVIEWER,
    label: 'Reviewer',
    icon: 'Star',
    description: 'Holistic document score and editorial feedback',
    accentClass: 'text-sky-700',
    bgClass: 'bg-sky-50',
  },
  {
    id: AGENT_IDS.AUDIENCE,
    label: 'Audience',
    icon: 'Users',
    description: 'Audience-adaptive rewriting',
    accentClass: 'text-purple-700',
    bgClass: 'bg-purple-50',
  },
  {
    id: AGENT_IDS.CONSISTENCY,
    label: 'Consistency',
    icon: 'Link',
    description: 'Terminology, naming, tense alignment',
    accentClass: 'text-orange-700',
    bgClass: 'bg-orange-50',
  },
  {
    id: AGENT_IDS.COMPLIANCE,
    label: 'Compliance',
    icon: 'Shield',
    description: 'APA, MLA, IEEE and style guide validation',
    accentClass: 'text-violet-700',
    bgClass: 'bg-violet-50',
  },
  {
    id: AGENT_IDS.KNOWLEDGE_GAP,
    label: 'Gaps',
    icon: 'Lightbulb',
    description: 'Missing context and undefined concepts',
    accentClass: 'text-sky-700',
    bgClass: 'bg-sky-50',
  },
  {
    id: AGENT_IDS.DNA,
    label: 'DNA',
    icon: 'RegaarderAi',
    description: 'Your unique writing identity and evolution',
    accentClass: 'text-indigo-600',
    bgClass: 'bg-indigo-50',
  },
];

// ── Shared instruction ─────────────────────────────────────────────
const JSON_ONLY = 'Return ONLY valid JSON — no markdown fences, no extra text before or after the JSON object.';

// ── Prompt builders ────────────────────────────────────────────────

export const buildHealthPrompt = (docText) =>
  `You are Compose AI's Document Health Orchestrator. Analyze this document and rate 6 quality dimensions on a 0–100 scale. Each score must reflect genuine analysis, not a default value.

${JSON_ONLY}

Output format (fill real scores and up to 3 brief issues each):
{"overall":91,"grammar":{"score":100,"issues":[]},"logic":{"score":84,"issues":["Paragraph 4 makes an unsupported claim"]},"formatting":{"score":98,"issues":[]},"evidence":{"score":79,"issues":["§3 statistic lacks a citation"]},"readability":{"score":94,"issues":[]},"consistency":{"score":96,"issues":[]}}

Document:
"""
${docText.slice(0, 3500)}
"""`;

export const buildEditorPrompt = (text, dnaStyleJson) =>
  `You are an expert Editor Agent trained on the highest standards of academic and professional writing. Analyze the following text for grammar, spelling, punctuation, readability, passive voice, wordiness, repetition, and clarity. Be specific and concise — cite exact phrases from the text.

${JSON_ONLY}

Output format:
{"suggestions":[{"id":"e1","excerpt":"exact 5–15 word phrase from the text","issue":"Passive Voice","fix":"active-voice replacement","explanation":"Active voice is more direct and authoritative.","severity":"warning","category":"style"},{"id":"e2","excerpt":"another short exact phrase","issue":"Wordiness","fix":"concise replacement","explanation":"Removes redundancy without losing meaning.","severity":"info","category":"clarity"}]}

${dnaStyleJson ? `User Writing DNA (match this voice when suggesting fixes): ${dnaStyleJson}` : ''}

Text:
"""
${text.slice(0, 3000)}
"""`;

export const buildDesignerPrompt = (text) =>
  `You are a Document Designer Agent. First detect the document type with a confidence score, then suggest structural and formatting improvements.

${JSON_ONLY}

Output format:
{"detectedType":"Research Paper","confidence":87,"suggestions":[{"id":"d1","excerpt":"Introduction","issue":"Missing Abstract","fix":"Add a 150–250 word abstract before the Introduction summarizing purpose, methods, findings, and conclusions.","explanation":"Academic papers require an abstract for discoverability and reader orientation.","severity":"critical"},{"id":"d2","excerpt":"the heading structure","issue":"Inconsistent Heading Hierarchy","fix":"Use H1 for the title, H2 for major sections, H3 for subsections. Do not skip levels.","explanation":"Consistent hierarchy improves navigation and accessibility.","severity":"warning"}]}

Document:
"""
${text.slice(0, 3000)}
"""`;

export const buildLogicPrompt = (text) =>
  `You are a Logic Agent — a rigorous academic reviewer who analyzes reasoning quality, not grammar. Think like a professor reviewing a thesis.

Detect: unsupported claims, contradictions, circular reasoning, missing assumptions, logical fallacies (name the fallacy type), weak argument progression, missing transitions, inconsistent conclusions.

${JSON_ONLY}

Output format:
{"suggestions":[{"id":"l1","excerpt":"exact short phrase from the document","issue":"Unsupported Claim","fallacy":"Hasty Generalization","explanation":"This assertion treats a limited sample as universal without statistical backing.","fix":"Add qualifying language: 'In some cases...' or support with a citation.","severity":"critical"},{"id":"l2","excerpt":"another phrase","issue":"Missing Transition","explanation":"The argument jumps from X to Y without connecting logic, leaving a gap the reader must fill.","fix":"Add a bridging sentence that acknowledges the logical shift.","severity":"warning"}]}

Text:
"""
${text.slice(0, 3000)}
"""`;

export const buildResearchPrompt = (text) =>
  `You are a Research Agent. Identify claims requiring citations, detect outdated references, and suggest credible sources. Explain WHY each source would strengthen the argument.

${JSON_ONLY}

Output format:
{"suggestions":[{"id":"r1","excerpt":"exact claim from the document","issue":"Citation Needed","recommendation":"Search: 'McKinsey Global AI Index 2024' or 'Stanford HAI AI Report 2024' for authoritative current data.","explanation":"This statistical claim requires a primary source to withstand academic or professional scrutiny.","severity":"warning"},{"id":"r2","excerpt":"another phrase","issue":"Potentially Outdated Reference","recommendation":"Verify if newer studies from 2022–2024 have updated this finding.","explanation":"Data from pre-2020 on this topic has been significantly revised.","severity":"info"}]}

Text:
"""
${text.slice(0, 3000)}
"""`;

export const buildReviewerPrompt = (text) =>
  `You are a senior editorial reviewer with 20 years of experience reviewing academic papers, business reports, and professional documents. Provide a rigorous, structured review.

${JSON_ONLY}

Output format (score is X.X out of 10):
{"score":8.7,"strengths":["Clear and compelling introduction","Strong evidence in §2","Consistent professional tone throughout"],"weaknesses":["Conclusion repeats §3 without new synthesis","Claim 4 in §5 lacks supporting data","Section ordering reduces logical flow"],"summary":"A well-structured document with a strong opening that loses momentum in the second half. The argument would benefit from stronger evidence and a more synthesizing conclusion."}

Document:
"""
${text.slice(0, 3000)}
"""`;

export const buildAudiencePrompt = (text, audience) =>
  `You are an Audience Adaptation Agent. Rewrite the following text optimized for a "${audience}" audience. Adjust vocabulary depth, technical jargon, example types, sentence complexity, tone, and formality. Match what a ${audience} would find immediately useful and credible.

Return only the rewritten text. No preamble, no explanation, no JSON.

Text:
"""
${text.slice(0, 2000)}
"""`;

export const buildConsistencyPrompt = (text) =>
  `You are a Consistency Agent. Scan the entire document for inconsistent terminology, naming conventions, capitalization, verb tense, abbreviation usage, and formatting patterns. Be precise — cite exact variants found.

${JSON_ONLY}

Output format:
{"suggestions":[{"id":"c1","excerpt":"AI system","issue":"Terminology Inconsistency","canonical":"AI system","variants":["AI platform","AI tool","the AI"],"explanation":"'AI system', 'AI platform', and 'AI tool' are all used. Standardizing to one term improves professionalism.","severity":"warning"},{"id":"c2","excerpt":"United States","issue":"Abbreviation Inconsistency","canonical":"United States","variants":["US","U.S.","the States"],"explanation":"Three forms of the same name appear. Standardize to 'United States' throughout.","severity":"info"}]}

Text:
"""
${text.slice(0, 3000)}
"""`;

export const buildCompliancePrompt = (text, standard) =>
  `You are a Compliance Agent and an expert in ${standard} standards. Validate this document against ${standard} formatting and citation requirements. Be specific and actionable.

${JSON_ONLY}

Output format:
{"standard":"${standard}","suggestions":[{"id":"cp1","excerpt":"section description or phrase","issue":"Missing Abstract","explanation":"${standard} requires a structured abstract of 150–250 words before the introduction.","fix":"Add an abstract summarizing: purpose, methods, key findings, and conclusions.","severity":"critical"},{"id":"cp2","excerpt":"Smith 2021","issue":"Incorrect In-Text Citation Format","explanation":"${standard} requires parenthetical format: (Smith, 2021). Found 'Smith 2021' without parentheses.","fix":"Change to (Smith, 2021).","severity":"warning"}]}

Document:
"""
${text.slice(0, 3000)}
"""`;

export const buildKnowledgeGapPrompt = (text) =>
  `You are a Knowledge Gap Agent. Read this document as a reader unfamiliar with the subject — like a first-year student. Identify every place where the writer assumes knowledge that has not yet been established in the document. Think like an expert teacher.

${JSON_ONLY}

Output format:
{"suggestions":[{"id":"k1","excerpt":"using Bayesian inference","issue":"Undefined Concept","explanation":"'Bayesian inference' is referenced here but never introduced or explained. A reader without a statistics background would not follow this argument.","severity":"critical"},{"id":"k2","excerpt":"as mentioned in Model B","issue":"Forward Reference","explanation":"'Model B' is referenced before it is introduced in §4. Readers encounter this reference without context.","severity":"warning"},{"id":"k3","excerpt":"TL;DR","issue":"Undefined Abbreviation","explanation":"'TL;DR' is used without being defined. Readers unfamiliar with internet shorthand would be confused.","severity":"info"}]}

Text:
"""
${text.slice(0, 3000)}
"""`;

export const buildWritingAgentPrompt = (action, text, tone, dnaStyleJson) => {
  const dna = dnaStyleJson ? `\n\nUser Writing DNA — match this voice and style:\n${dnaStyleJson}` : '';

  const instructions = {
    rewrite:      `Rewrite the following text in a ${tone || 'professional'} tone. Return only the rewritten content.`,
    expand:       `Expand the following text with more depth, specific examples, and nuance. Maintain the original tone and intent. Return only the expanded content.`,
    shorten:      `Condense the following text to its essential points. Preserve every key idea. Return only the shortened content.`,
    continue:     `Continue writing from exactly where this text ends. Match the established tone, style, rhythm, and voice seamlessly. Return only the continuation.`,
    brainstorm:   `Generate 5 creative, substantive ideas or alternative angles related to this topic. Format as a numbered list with a 2–3 sentence description for each.`,
    introduction: `Write a compelling, well-crafted introduction for a document on this topic. Return only the introduction paragraph(s).`,
    conclusion:   `Write a strong, synthesizing conclusion for a document with this content. Tie together the key themes rather than just repeating them. Return only the conclusion.`,
    abstract:     `Write a concise academic abstract (150–250 words) for this document. Include: purpose, methods, key findings, and conclusions. Return only the abstract.`,
    summary:      `Summarize the key points of this document in 4–6 clear bullet points. Return only the bullet-point summary.`,
    title:        `Generate 5 compelling, specific title options for this document. Format as a numbered list. Make each distinct in approach (e.g. question, declarative, provocative).`,
    explain:      `Explain the following text in simple, clear language accessible to a general audience with no prior knowledge of this topic. Return only the explanation.`,
    translate:    `Translate the following text while preserving the original meaning, nuance, and style. Return only the translated content.`,
  };

  const instruction = instructions[action] || instructions.rewrite;
  return `${instruction}${dna}\n\nText:\n"""\n${text.slice(0, 2500)}\n"""`;
};

export const buildDNAAnalysisPrompt = (documentSamples) =>
  `You are a Writing DNA Analyzer — an expert linguist and rhetorical analyst. Study the following document samples and build a comprehensive writing identity profile. This profile will be used to personalize future AI writing assistance.

${JSON_ONLY}

Output format:
{"vocabulary":{"technicalDepth":0.72,"lexicalDiversity":0.65,"preferredRegisters":["academic","analytical"]},"rhythm":{"avgSentenceWords":18,"avgParagraphSentences":4,"cadence":"measured","complexity":"moderate"},"style":{"formality":0.8,"confidence":0.75,"useOfAnalogy":"occasional","hedging":"low","persuasionStyle":"evidence-based"},"reasoning":"analytical","readingLevel":14,"overallVoice":"Precise, analytical, and measured. Favours evidence-based arguments with structured formality and minimal hedging."}

Documents:
"""
${documentSamples.slice(0, 4000)}
"""`;
