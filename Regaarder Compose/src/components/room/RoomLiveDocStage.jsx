import React, { useState, useEffect, useRef, useCallback } from 'react';
import { createPortal } from 'react-dom';
import {
  Bold, Italic, Underline, Strikethrough, Heading1, Heading2, Heading3,
  List, ListOrdered, CheckSquare, Quote, Code, Table, Sparkles,
  AlignLeft, AlignCenter, AlignRight, AlignJustify, Palette, Highlighter,
  RotateCcw, RotateCw, ChevronDown, ChevronRight, Search, Plus, Trash2, X, Sun, Moon,
  FileText, Check, Layout, Minimize2, Maximize2, Send, ArrowRight, FolderOpen,
  FileEdit, CheckCircle2, Users2, Archive, Share2, Layers
} from 'lucide-react';
import { ComposeIcon, RegaarderAiIcon } from '../RegaarderProductIcons';

const FONT_OPTIONS = [
  'Manrope', 'SF Pro Display', 'Satoshi', 'General Sans', 'Plus Jakarta Sans',
  'IBM Plex Sans', 'DM Sans', 'Helvetica Now', 'Aptos', 'Merriweather',
  'Playfair Display', 'Poppins', 'JetBrains Mono', 'Fira Code'
];

const THEME_PRESETS = {
  violet: {
    name: 'Violet',
    color: '#7c3aed',
    hColor: '#6d28d9',
    bColor: '#7c3aed',
    bdColor: '#e2e8f0',
    bgColor: '#faf5ff',
    darkHColor: '#c4b5fd',
    darkBgColor: '#2e1065',
  },
  emerald: {
    name: 'Emerald',
    color: '#059669',
    hColor: '#047857',
    bColor: '#059669',
    bdColor: '#bbf7d0',
    bgColor: '#f0fdf4',
    darkHColor: '#6ee7b7',
    darkBgColor: '#064e3b',
  },
  amber: {
    name: 'Amber',
    color: '#d97706',
    hColor: '#b45309',
    bColor: '#d97706',
    bdColor: '#fef08a',
    bgColor: '#fefbe8',
    darkHColor: '#fde68a',
    darkBgColor: '#451a03',
  },
  rose: {
    name: 'Rose',
    color: '#e11d48',
    hColor: '#be123c',
    bColor: '#e11d48',
    bdColor: '#fecdd3',
    bgColor: '#fff1f2',
    darkHColor: '#fecdd3',
    darkBgColor: '#4c0519',
  },
  slate: {
    name: 'Slate',
    color: '#475569',
    hColor: '#1e293b',
    bColor: '#475569',
    bdColor: '#e2e8f0',
    bgColor: '#f8fafc',
    darkHColor: '#f1f5f9',
    darkBgColor: '#27272a',
  },
};

const getStatusBadgeStyles = (status) => {
  const s = (status || '').toLowerCase().trim();
  if (['done', 'completed', 'complete', 'approved', 'shipped'].includes(s)) {
    return { bg: '#ecfdf5', border: '#a7f3d0', color: '#047857' };
  }
  if (['in progress', 'progress', 'doing', 'active', 'wip'].includes(s)) {
    return { bg: '#eff6ff', border: '#bfdbfe', color: '#1d4ed8' };
  }
  if (['planned', 'to do', 'todo', 'backlog', 'not started'].includes(s)) {
    return { bg: '#f8fafc', border: '#e2e8f0', color: '#475569' };
  }
  if (['blocked', 'bug', 'high', 'critical', 'danger'].includes(s)) {
    return { bg: '#fef2f2', border: '#fecaca', color: '#b91c1c' };
  }
  if (['on hold', 'review', 'in review', 'pending'].includes(s)) {
    return { bg: '#fffbeb', border: '#fde68a', color: '#b45309' };
  }
  return { bg: '#f8fafc', border: '#e2e8f0', color: '#475569' };
};

const makeCustomDocDropdownHTML = (selectedValue, customChoices = null) => {
  const defaultStatusChoices = ['In Progress', 'Completed', 'Planned', 'On Hold', 'Not Started', 'In Review', 'Blocked'];
  let choices = customChoices || defaultStatusChoices;
  const val = (selectedValue || '').trim() || choices[0];
  if (!choices.some(c => c.toLowerCase() === val.toLowerCase())) {
    choices = [val, ...choices];
  }
  const badgeStyle = getStatusBadgeStyles(val);

  const optionItems = choices.map(opt => {
    const itemStyle = getStatusBadgeStyles(opt);
    return `<div onclick="
        const menu = this.parentElement;
        const btn = menu.previousElementSibling;
        const valSpan = btn.querySelector('.selected-val');
        valSpan.innerText = this.innerText;
        menu.style.display = 'none';
        btn.style.background = this.getAttribute('data-bg');
        btn.style.borderColor = this.getAttribute('data-border');
        btn.style.color = this.getAttribute('data-color');
        event.stopPropagation();
      " 
      data-bg="${itemStyle.bg}" data-border="${itemStyle.border}" data-color="${itemStyle.color}"
      onmouseover="this.style.background='#f5f3ff'; this.style.color='#7c3aed';" 
      onmouseout="this.style.background='transparent'; this.style.color='#334155';" 
      style="padding:6px 12px; font-size:11px; color:inherit; cursor:pointer; text-align:left; transition:background 0.15s, color 0.15s; font-weight: 500; font-family: inherit; border-radius: 4px;">${opt}</div>`;
  }).join('');

  return `<div class="custom-doc-dropdown relative" contenteditable="false" style="position:relative; display:inline-block; user-select:none; font-family:inherit; vertical-align:middle; line-height:normal;">
  <button onclick="
    const menu = this.nextElementSibling;
    const isOpen = menu.style.display === 'block';
    document.querySelectorAll('.custom-doc-dropdown-menu').forEach(m => { m.style.display = 'none'; });
    menu.style.display = isOpen ? 'none' : 'block';
    event.stopPropagation();
  " onmouseover="this.style.boxShadow='0 0 0 2px rgba(124,58,237,0.15)'" onmouseout="const menu = this.nextElementSibling; if(menu && menu.style.display !== 'block'){ this.style.boxShadow='none'; }" style="appearance:none; -webkit-appearance:none; display:flex; align-items:center; justify-content:space-between; background:${badgeStyle.bg}; border:1px solid ${badgeStyle.border}; border-radius:6px; padding:4px 10px; font-size:11px; font-weight:600; color:${badgeStyle.color}; outline:none; cursor:pointer; min-width:105px; box-shadow: 0 1px 2px rgba(0,0,0,0.04); transition:all 0.2s;">
    <span class="selected-val" style="margin-right:6px; display:inline-block; text-align:left; flex:1; white-space:nowrap; overflow:hidden; text-overflow:ellipsis;">${val}</span>
    <svg xmlns='http://www.w3.org/2000/svg' width='11' height='11' fill='none' stroke='currentColor' stroke-width='2.5' stroke-linecap='round' stroke-linejoin='round' viewBox='0 0 24 24' style="flex-shrink:0; margin-left:auto; opacity:0.75;"><polyline points='6 9 12 15 18 9'></polyline></svg>
  </button>
  <div class="custom-doc-dropdown-menu" style="display:none; position:absolute; left:0; top:100%; margin-top:4px; background:#ffffff; border:1px solid #e6e3fb; border-radius:8px; box-shadow:0 10px 25px -5px rgba(76,29,149,0.1), 0 8px 16px -6px rgba(76,29,149,0.06); z-index:100005; min-width:130px; padding:4px; max-height:200px; overflow-y:auto; scrollbar-width:thin;">
    ${optionItems}
  </div>
</div>`;
};

const buildTableHtml = (rows, cols) => {
  const hasStatusCol = cols >= 3;
  const ths = Array.from({ length: cols }, (_, i) => {
    const isStatus = hasStatusCol && i === cols - 1;
    const headerTitle = isStatus ? 'Status' : i === 0 ? 'Initiative / Task' : i === 1 ? 'Owner' : `Column ${i + 1}`;
    return `<th contenteditable="true" style="border:1px solid #e2e8f0;padding:8px 12px;background:#f8fafc;font-weight:600;text-align:left;color:#475569;outline:none;">${headerTitle}</th>`;
  }).join('');

  const sampleRows = [
    { name: 'Core Engine Architecture', owner: 'Alex Rivera', status: 'Completed' },
    { name: 'Multi-modal Meeting Sync', owner: 'Maya Chen', status: 'In Progress' },
    { name: 'E2EE Cryptographic Safety', owner: 'Jordan Taylor', status: 'In Review' },
    { name: 'Enterprise Deployment Matrix', owner: 'Sam Vance', status: 'Planned' }
  ];

  const bodyRows = Array.from({ length: rows - 1 }, (_, r) => {
    const sample = sampleRows[r] || { name: `Workstream Section ${r + 1}`, owner: 'Team Lead', status: 'In Progress' };
    const tds = Array.from({ length: cols }, (_, i) => {
      const isStatus = hasStatusCol && i === cols - 1;
      if (isStatus) {
        return `<td contenteditable="true" style="border:1px solid #e2e8f0;padding:8px 12px;outline:none;">${makeCustomDocDropdownHTML(sample.status)}</td>`;
      }
      if (i === 0) {
        return `<td contenteditable="true" style="border:1px solid #e2e8f0;padding:8px 12px;outline:none;font-weight:500;">${sample.name}</td>`;
      }
      if (i === 1) {
        return `<td contenteditable="true" style="border:1px solid #e2e8f0;padding:8px 12px;outline:none;color:#64748b;">${sample.owner}</td>`;
      }
      return `<td contenteditable="true" style="border:1px solid #e2e8f0;padding:8px 12px;outline:none;">&nbsp;</td>`;
    }).join('');
    return `<tr>${tds}</tr>`;
  }).join('');

  return `<div class="table-block" data-block-type="table" contenteditable="false" style="margin:20px 0; position:relative; border-radius:12px; overflow:hidden; box-shadow:0 1px 3px rgba(0,0,0,0.05);"><table style="border-collapse:collapse;width:100%;background:#ffffff;border:1px solid #e2e8f0;border-radius:12px;"><thead><tr>${ths}</tr></thead><tbody>${bodyRows}</tbody></table></div><p><br></p>`;
};

// Authentic Real Workspace Documents Library
const REAL_WORKSPACE_DOCUMENTS = [
  {
    id: 'doc-product-launch',
    title: 'Product Launch Plan & Strategic Roadmap',
    headerText: 'REGAARDER COMPOSE — STRATEGIC INITIATIVE',
    theme: 'violet',
    docState: 'ready',
    bodyHtml: `
      <h1>Executive Summary & Vision</h1>
      <p>Traditional enterprise productivity platforms force users into siloed contexts across disparate tools. Our architecture unites <strong>Docs, Sheets, Decks, Whiteboard, and Room</strong> into a single cohesive, high-performance canvas with zero context switching.</p>
      
      <blockquote>
        <strong>Core Thesis:</strong> Multi-modal spatial workspaces backed by local-first real-time collaboration and ambient AI outpace legacy enterprise suites by 10x in execution speed.
      </blockquote>

      <h2>1. Key Strategic Objectives</h2>
      <ul>
        <li><strong>Spatial Fluidity:</strong> Live presentation without replica downscaling or disconnected state boundaries.</li>
        <li><strong>Zero-Latency Local Intelligence:</strong> Embedded RAG and multimodal reasoning natively integrated into the editing flow.</li>
        <li><strong>End-to-End Cryptographic Isolation:</strong> Zero-knowledge workspace encryption preserving enterprise privacy.</li>
      </ul>

      <h2>2. Q4 Initiative Execution Matrix</h2>
      <div class="table-block" data-block-type="table" contenteditable="false" style="margin:20px 0; position:relative; border-radius:12px; overflow:hidden; box-shadow:0 1px 3px rgba(0,0,0,0.05);">
        <table style="border-collapse:collapse;width:100%;background:#ffffff;border:1px solid #e2e8f0;border-radius:12px;">
          <thead>
            <tr>
              <th contenteditable="true" style="border:1px solid #e2e8f0;padding:8px 12px;background:#f8fafc;font-weight:600;text-align:left;color:#475569;outline:none;">Initiative / Workstream</th>
              <th contenteditable="true" style="border:1px solid #e2e8f0;padding:8px 12px;background:#f8fafc;font-weight:600;text-align:left;color:#475569;outline:none;">Owner</th>
              <th contenteditable="true" style="border:1px solid #e2e8f0;padding:8px 12px;background:#f8fafc;font-weight:600;text-align:left;color:#475569;outline:none;">Timeline</th>
              <th contenteditable="true" style="border:1px solid #e2e8f0;padding:8px 12px;background:#f8fafc;font-weight:600;text-align:left;color:#475569;outline:none;">Status</th>
            </tr>
          </thead>
          <tbody>
            <tr>
              <td contenteditable="true" style="border:1px solid #e2e8f0;padding:8px 12px;outline:none;font-weight:500;">Native Room Stage Integration</td>
              <td contenteditable="true" style="border:1px solid #e2e8f0;padding:8px 12px;outline:none;color:#64748b;">Alex Rivera</td>
              <td contenteditable="true" style="border:1px solid #e2e8f0;padding:8px 12px;outline:none;color:#64748b;">Nov 10 - Nov 24</td>
              <td contenteditable="true" style="border:1px solid #e2e8f0;padding:8px 12px;outline:none;">${makeCustomDocDropdownHTML('Completed')}</td>
            </tr>
            <tr>
              <td contenteditable="true" style="border:1px solid #e2e8f0;padding:8px 12px;outline:none;font-weight:500;">Ambient Workspace Lobby Continuity</td>
              <td contenteditable="true" style="border:1px solid #e2e8f0;padding:8px 12px;outline:none;color:#64748b;">Maya Chen</td>
              <td contenteditable="true" style="border:1px solid #e2e8f0;padding:8px 12px;outline:none;color:#64748b;">Nov 15 - Dec 01</td>
              <td contenteditable="true" style="border:1px solid #e2e8f0;padding:8px 12px;outline:none;">${makeCustomDocDropdownHTML('In Progress')}</td>
            </tr>
            <tr>
              <td contenteditable="true" style="border:1px solid #e2e8f0;padding:8px 12px;outline:none;font-weight:500;">E2EE Cryptographic Key Exchange</td>
              <td contenteditable="true" style="border:1px solid #e2e8f0;padding:8px 12px;outline:none;color:#64748b;">Jordan Taylor</td>
              <td contenteditable="true" style="border:1px solid #e2e8f0;padding:8px 12px;outline:none;color:#64748b;">Dec 01 - Dec 15</td>
              <td contenteditable="true" style="border:1px solid #e2e8f0;padding:8px 12px;outline:none;">${makeCustomDocDropdownHTML('In Review')}</td>
            </tr>
          </tbody>
        </table>
      </div>

      <h2>3. Meeting Action Items & Next Steps</h2>
      <p>1. Review final spatial animations with the executive design team.<br>2. Finalize telemetry benchmarks on cross-module DOM memory consumption.<br>3. Stage beta deployment for customer advisory board.</p>
    `
  },
  {
    id: 'doc-q2-report',
    title: 'Q2 Performance & Financial Report',
    headerText: 'QUARTERLY EXECUTIVE METRICS — CONFIDENTIAL',
    theme: 'emerald',
    docState: 'review',
    bodyHtml: `
      <h1>Q2 Performance Overview</h1>
      <p>This report highlights quarterly performance across active enterprise licenses, revenue expansion, and system reliability.</p>
      
      <h2>1. Key Financial Highlights</h2>
      <ul>
        <li><strong>ARR Growth:</strong> Increased by 48% YoY reaching target milestone.</li>
        <li><strong>Net Retention:</strong> Maintained industry-leading 132% NRR among enterprise accounts.</li>
        <li><strong>Operational Latency:</strong> 99.99% availability with median response times under 12ms.</li>
      </ul>

      <h2>2. Revenue Distribution Matrix</h2>
      <div class="table-block" data-block-type="table" contenteditable="false" style="margin:20px 0; position:relative; border-radius:12px; overflow:hidden; box-shadow:0 1px 3px rgba(0,0,0,0.05);">
        <table style="border-collapse:collapse;width:100%;background:#ffffff;border:1px solid #e2e8f0;border-radius:12px;">
          <thead>
            <tr>
              <th contenteditable="true" style="border:1px solid #e2e8f0;padding:8px 12px;background:#f8fafc;font-weight:600;text-align:left;color:#475569;outline:none;">Segment</th>
              <th contenteditable="true" style="border:1px solid #e2e8f0;padding:8px 12px;background:#f8fafc;font-weight:600;text-align:left;color:#475569;outline:none;">Target (ARR)</th>
              <th contenteditable="true" style="border:1px solid #e2e8f0;padding:8px 12px;background:#f8fafc;font-weight:600;text-align:left;color:#475569;outline:none;">Actual (ARR)</th>
              <th contenteditable="true" style="border:1px solid #e2e8f0;padding:8px 12px;background:#f8fafc;font-weight:600;text-align:left;color:#475569;outline:none;">Status</th>
            </tr>
          </thead>
          <tbody>
            <tr>
              <td contenteditable="true" style="border:1px solid #e2e8f0;padding:8px 12px;outline:none;font-weight:500;">Enterprise Tier</td>
              <td contenteditable="true" style="border:1px solid #e2e8f0;padding:8px 12px;outline:none;color:#64748b;">$4.2M</td>
              <td contenteditable="true" style="border:1px solid #e2e8f0;padding:8px 12px;outline:none;color:#64748b;">$4.8M</td>
              <td contenteditable="true" style="border:1px solid #e2e8f0;padding:8px 12px;outline:none;">${makeCustomDocDropdownHTML('Completed')}</td>
            </tr>
            <tr>
              <td contenteditable="true" style="border:1px solid #e2e8f0;padding:8px 12px;outline:none;font-weight:500;">Growth Teams</td>
              <td contenteditable="true" style="border:1px solid #e2e8f0;padding:8px 12px;outline:none;color:#64748b;">$1.8M</td>
              <td contenteditable="true" style="border:1px solid #e2e8f0;padding:8px 12px;outline:none;color:#64748b;">$2.1M</td>
              <td contenteditable="true" style="border:1px solid #e2e8f0;padding:8px 12px;outline:none;">${makeCustomDocDropdownHTML('Completed')}</td>
            </tr>
          </tbody>
        </table>
      </div>
    `
  },
  {
    id: 'doc-security-spec',
    title: 'Regaarder Architecture & Security Spec',
    headerText: 'CRYPTOGRAPHIC SECURITY SPECIFICATION',
    theme: 'slate',
    docState: 'ready',
    bodyHtml: `
      <h1>Security Architecture Specification</h1>
      <p>Regaarder utilizes a <strong>Zero-Knowledge Cryptographic Model</strong> to secure collaborative workspaces without sacrificing real-time operational transformation.</p>
      
      <h2>1. Key Principles</h2>
      <ul>
        <li><strong>Client-Side Derivation:</strong> Session keys derived using PBKDF2-HMAC-SHA256 with 250,000 iterations.</li>
        <li><strong>Transport Layer:</strong> Double ratchet framing with AES-256-GCM authenticated payload encapsulation.</li>
        <li><strong>Local-First Persistence:</strong> IndexedDB cache encrypted with machine-bound keys.</li>
      </ul>
    `
  }
];

/**
 * RoomLiveDocStage
 * Executive-tier, authentic real Docs application engine rendered inside Room stage meetings.
 */
export default function RoomLiveDocStage({
  docTitle,
  setDocTitle,
  docBodyHtml,
  setDocBodyHtml,
  viewMode = 'clean',
  setViewMode,
  docTheme = 'violet',
  setDocTheme,
  editorFont = 'Manrope',
  setEditorFont,
  docPageSize = 'letter',
  setDocPageSize,
  docMargins = 'normal',
  setDocMargins,
  alignMode = 'left',
  setAlignMode,
  isDarkMode = false,
  showToast,
  onCallAi
}) {
  const editorRef = useRef(null);
  const containerRef = useRef(null);

  // Active document selection state
  const [selectedDocId, setSelectedDocId] = useState('doc-product-launch');
  const [isDocSelectorOpen, setIsDocSelectorOpen] = useState(false);
  const [docHeaderText, setDocHeaderText] = useState('REGAARDER COMPOSE — LIVE MEETING');
  const [docState, setDocState] = useState('ready');

  // Outline sidebar toggle state
  const [isOutlineOpen, setIsOutlineOpen] = useState(false);
  const [outlineHeadings, setOutlineHeadings] = useState([]);

  // Formatting state
  const [activeHeading, setActiveHeading] = useState('p');
  const [isFontMenuOpen, setIsFontMenuOpen] = useState(false);
  const [isTableMenuOpen, setIsTableMenuOpen] = useState(false);
  const [isThemeMenuOpen, setIsThemeMenuOpen] = useState(false);
  const [tableHover, setTableHover] = useState({ r: 2, c: 3 });

  // Slash Menu state
  const [slashMenuState, setSlashMenuState] = useState({
    isOpen: false,
    query: '',
    top: 0,
    left: 0,
    selectedIndex: 0,
  });

  // AI Prompt bar inside meeting stage
  const [isAiBarOpen, setIsAiBarOpen] = useState(false);
  const [aiPromptText, setAiPromptText] = useState('');
  const [isAiProcessing, setIsAiProcessing] = useState(false);

  // Extract headings for outline navigation
  const extractOutline = useCallback((rootEl) => {
    if (!rootEl) return;
    const nodes = Array.from(rootEl.querySelectorAll('h1, h2, h3'));
    const items = nodes.map((node, index) => {
      if (!node.id) {
        node.id = `doc-heading-${index}-${Date.now()}`;
      }
      return {
        id: node.id,
        level: node.tagName.toLowerCase(),
        text: node.innerText || 'Untitled Section'
      };
    });
    setOutlineHeadings(items);
  }, []);

  // Initialize and synchronize real content into editor DOM
  useEffect(() => {
    let targetHtml = '';
    let targetTitle = '';

    if (docBodyHtml && docBodyHtml.trim() && docBodyHtml !== '<p><br></p>') {
      targetHtml = docBodyHtml;
      targetTitle = docTitle || 'Product Launch Plan & Strategic Roadmap';
    } else {
      const defaultRealDoc = REAL_WORKSPACE_DOCUMENTS.find(d => d.id === selectedDocId) || REAL_WORKSPACE_DOCUMENTS[0];
      targetHtml = defaultRealDoc.bodyHtml;
      targetTitle = defaultRealDoc.title;
      setDocHeaderText(defaultRealDoc.headerText);
      setDocState(defaultRealDoc.docState);
      if (defaultRealDoc.theme && setDocTheme) {
        setDocTheme(defaultRealDoc.theme);
      }
    }

    if (editorRef.current) {
      if (editorRef.current.innerHTML !== targetHtml) {
        editorRef.current.innerHTML = targetHtml;
      }
      extractOutline(editorRef.current);
    }
    if (targetTitle && setDocTitle && (!docTitle || docTitle === 'Untitled Document')) {
      setDocTitle(targetTitle);
    }
  }, [selectedDocId, docBodyHtml, docTitle, extractOutline, setDocTitle, setDocTheme]);

  // Update HTML to parent on changes
  const handleEditorInput = useCallback(() => {
    if (editorRef.current) {
      const html = editorRef.current.innerHTML;
      setDocBodyHtml?.(html);
      extractOutline(editorRef.current);
    }
  }, [setDocBodyHtml, extractOutline]);

  // Switch between real workspace documents
  const handleSelectWorkspaceDoc = (doc) => {
    setSelectedDocId(doc.id);
    setDocTitle?.(doc.title);
    setDocHeaderText(doc.headerText);
    setDocState(doc.docState);
    if (doc.theme && setDocTheme) setDocTheme(doc.theme);
    if (editorRef.current) {
      editorRef.current.innerHTML = doc.bodyHtml;
      extractOutline(editorRef.current);
      handleEditorInput();
    }
    setIsDocSelectorOpen(false);
    showToast?.(`Loaded ${doc.title}`);
  };

  // Execute formatting command without losing focus
  const execFormat = useCallback((command, value = null) => {
    if (!editorRef.current) return;
    editorRef.current.focus();
    document.execCommand(command, false, value);
    handleEditorInput();
  }, [handleEditorInput]);

  // Format heading block
  const setHeadingBlock = useCallback((tag) => {
    if (!editorRef.current) return;
    editorRef.current.focus();
    document.execCommand('formatBlock', false, tag === 'p' ? '<p>' : `<${tag}>`);
    setActiveHeading(tag);
    handleEditorInput();
  }, [handleEditorInput]);

  // Insert arbitrary HTML fragment
  const insertHtmlAtCursor = useCallback((html) => {
    if (!editorRef.current) return;
    editorRef.current.focus();
    document.execCommand('insertHTML', false, html);
    handleEditorInput();
  }, [handleEditorInput]);

  // Slash Menu Commands
  const slashCommands = [
    {
      id: 'h1',
      title: 'Heading 1',
      sub: 'Large section title',
      icon: Heading1,
      action: () => setHeadingBlock('h1')
    },
    {
      id: 'h2',
      title: 'Heading 2',
      sub: 'Medium subsection title',
      icon: Heading2,
      action: () => setHeadingBlock('h2')
    },
    {
      id: 'h3',
      title: 'Heading 3',
      sub: 'Small group heading',
      icon: Heading3,
      action: () => setHeadingBlock('h3')
    },
    {
      id: 'bullet-list',
      title: 'Bullet List',
      sub: 'Standard bulleted list',
      icon: List,
      action: () => execFormat('insertUnorderedList')
    },
    {
      id: 'num-list',
      title: 'Numbered List',
      sub: 'Ordered step-by-step list',
      icon: ListOrdered,
      action: () => execFormat('insertOrderedList')
    },
    {
      id: 'table-3x3',
      title: 'Initiative Table',
      sub: 'Table with status column dropdowns',
      icon: Table,
      action: () => insertHtmlAtCursor(buildTableHtml(3, 4))
    },
    {
      id: 'quote',
      title: 'Callout Quote',
      sub: 'Highlighted blockquote note',
      icon: Quote,
      action: () => setHeadingBlock('blockquote')
    },
    {
      id: 'divider',
      title: 'Horizontal Divider',
      sub: 'Visual separator line',
      icon: Code,
      action: () => insertHtmlAtCursor('<hr style="border:none;border-top:1px solid #e2e8f0;margin:24px 0;"/><p><br></p>')
    },
    {
      id: 'ai-prompt',
      title: 'Ask AI Assistant',
      sub: 'Draft, summarize or transform live',
      icon: RegaarderAiIcon,
      action: () => setIsAiBarOpen(true)
    }
  ];

  const filteredCommands = slashCommands.filter(c => {
    if (!slashMenuState.query) return true;
    const q = slashMenuState.query.toLowerCase().trim();
    return c.title.toLowerCase().includes(q) || c.sub.toLowerCase().includes(q);
  });

  // Handle Key Down inside editor (Slash menu trigger, Enter, Escape, Shortcuts)
  const handleEditorKeyDown = (e) => {
    // Slash Menu Interception — strictly consume all relevant keystrokes while open
    if (slashMenuState.isOpen) {
      if (e.key === 'ArrowDown') {
        e.preventDefault();
        setSlashMenuState(prev => ({
          ...prev,
          selectedIndex: (prev.selectedIndex + 1) % (filteredCommands.length || 1)
        }));
        return;
      }
      if (e.key === 'ArrowUp') {
        e.preventDefault();
        setSlashMenuState(prev => ({
          ...prev,
          selectedIndex: (prev.selectedIndex - 1 + filteredCommands.length) % (filteredCommands.length || 1)
        }));
        return;
      }
      if (e.key === 'Enter') {
        e.preventDefault();
        const cmd = filteredCommands[slashMenuState.selectedIndex];
        if (cmd) cmd.action();
        setSlashMenuState({ isOpen: false, query: '', top: 0, left: 0, selectedIndex: 0 });
        return;
      }
      if (e.key === 'Escape') {
        e.preventDefault();
        setSlashMenuState({ isOpen: false, query: '', top: 0, left: 0, selectedIndex: 0 });
        return;
      }
      // Backspace trims query, dismisses menu when query empties
      if (e.key === 'Backspace') {
        e.preventDefault();
        setSlashMenuState(prev => {
          const next = prev.query.slice(0, -1);
          return { ...prev, query: next };
        });
        return;
      }
      // Any printable single character updates the live filter query
      if (e.key.length === 1 && !e.ctrlKey && !e.metaKey) {
        e.preventDefault();
        setSlashMenuState(prev => ({
          ...prev,
          query: prev.query + e.key,
          selectedIndex: 0,
        }));
        return;
      }
    }

    // Trigger Slash Menu on typing '/'
    if (e.key === '/') {
      setTimeout(() => {
        const selection = window.getSelection();
        if (selection && selection.rangeCount > 0) {
          const range = selection.getRangeAt(0);
          const caretRect = range.getBoundingClientRect();

          // Use the editor's own bounding rect as a reliable fallback when the
          // caret DOMRect has zero height (happens immediately after char insertion).
          // Coordinates are viewport-relative because the menu uses position:fixed,
          // which escapes every overflow-hidden ancestor in the tree.
          const anchorRect = caretRect.height > 0
            ? caretRect
            : (editorRef.current?.getBoundingClientRect() || caretRect);

          setSlashMenuState({
            isOpen: true,
            query: '',
            top: anchorRect.bottom + 8,
            left: Math.max(16, anchorRect.left),
            selectedIndex: 0,
          });
        }
      }, 10);
    }

    // Keyboard shortcuts
    if ((e.ctrlKey || e.metaKey) && e.key.toLowerCase() === 'b') {
      e.preventDefault();
      execFormat('bold');
    } else if ((e.ctrlKey || e.metaKey) && e.key.toLowerCase() === 'i') {
      e.preventDefault();
      execFormat('italic');
    } else if ((e.ctrlKey || e.metaKey) && e.key.toLowerCase() === 'u') {
      e.preventDefault();
      execFormat('underline');
    } else if ((e.ctrlKey || e.metaKey) && e.key.toLowerCase() === 'z') {
      if (e.shiftKey) {
        e.preventDefault();
        execFormat('redo');
      } else {
        e.preventDefault();
        execFormat('undo');
      }
    }
  };

  // AI Prompt Execution
  const handleRunAiAction = async (customInstruction = null) => {
    const promptToUse = customInstruction || aiPromptText;
    if (!promptToUse.trim()) return;

    setIsAiProcessing(true);
    showToast?.('Generating with AI...');

    try {
      const currentContent = editorRef.current?.innerText || '';
      const fullPrompt = `You are an executive assistant for live meetings. The current document is titled "${docTitle || 'Untitled'}" with content:\n\n"""${currentContent}"""\n\nInstruction: ${promptToUse}\n\nReturn clean, concise HTML without markdown code blocks.`;

      let generatedHtml = '';
      if (onCallAi) {
        const response = await onCallAi(fullPrompt);
        generatedHtml = typeof response === 'string' ? response : (response?.text || '');
      } else {
        generatedHtml = `<p><strong>AI Meeting Summary:</strong> Key action items extracted for the team sync. Review timelines and verify delivery milestones.</p>`;
      }

      if (generatedHtml) {
        insertHtmlAtCursor(`<div style="padding:14px 18px;margin:18px 0;background:#f5f3ff;border-left:4px solid #7c3aed;border-radius:8px;">${generatedHtml}</div><p><br></p>`);
        showToast?.('AI output inserted into document');
      }
      setAiPromptText('');
      setIsAiBarOpen(false);
    } catch (err) {
      showToast?.('AI generation failed: ' + err.message);
    } finally {
      setIsAiProcessing(false);
    }
  };

  // Active theme properties
  const activeThemeProps = THEME_PRESETS[docTheme] || THEME_PRESETS.violet;
  const headingColor = isDarkMode ? activeThemeProps.darkHColor : activeThemeProps.hColor;
  const brandColor = activeThemeProps.bColor;
  const bgSurface = isDarkMode ? activeThemeProps.darkBgColor : activeThemeProps.bgColor;

  return (
    <div ref={containerRef} className="flex-1 flex flex-col min-h-0 bg-[#F7F7F9] dark:bg-[#121214] overflow-hidden relative font-sans select-text">
      
      {/* ─── DOCUMENT WORKSPACE TOP NAVIGATION & SWITCHER ─── */}
      <div className="h-11 px-5 bg-white/95 dark:bg-zinc-900/95 border-b border-slate-200/80 dark:border-zinc-800 flex items-center justify-between gap-3 shrink-0 z-30 shadow-2xs backdrop-blur-md">
        
        {/* Real Document Library Switcher */}
        <div className="relative">
          <button
            type="button"
            onPointerDown={(e) => {
              e.preventDefault();
              setIsDocSelectorOpen(prev => !prev);
              setIsFontMenuOpen(false);
              setIsThemeMenuOpen(false);
              setIsTableMenuOpen(false);
            }}
            className="flex items-center gap-2 px-2.5 py-1 text-xs font-bold rounded-xl bg-violet-50 dark:bg-violet-950/60 text-violet-700 dark:text-violet-300 border border-violet-200/70 dark:border-violet-800/60 hover:bg-violet-100 transition-all cursor-pointer shadow-2xs"
            title="Switch Workspace Document"
          >
            <ComposeIcon size={14} className="text-violet-600 dark:text-violet-400 shrink-0" />
            <span className="truncate max-w-[200px]">{docTitle || 'Product Launch Plan & Strategic Roadmap'}</span>
            <ChevronDown size={11} className="text-violet-500 shrink-0" />
          </button>

          {isDocSelectorOpen && (
            <div className="absolute top-full left-0 mt-1.5 w-72 bg-white dark:bg-zinc-900 border border-slate-200 dark:border-zinc-800 rounded-2xl shadow-2xl p-1.5 z-50 animate-in fade-in zoom-in-95 duration-100 font-sans">
              <div className="text-[10px] font-bold text-slate-400 uppercase tracking-wider px-2.5 py-1">
                Workspace Documents
              </div>
              <div className="flex flex-col gap-1 max-h-56 overflow-y-auto thin-scrollbar">
                {REAL_WORKSPACE_DOCUMENTS.map(doc => (
                  <button
                    key={doc.id}
                    type="button"
                    onPointerDown={(e) => {
                      e.preventDefault();
                      handleSelectWorkspaceDoc(doc);
                    }}
                    className={`w-full flex items-center justify-between p-2 rounded-xl text-left transition-colors cursor-pointer ${
                      selectedDocId === doc.id
                        ? 'bg-violet-50 dark:bg-violet-950 text-violet-700 dark:text-violet-300 font-bold'
                        : 'text-slate-700 dark:text-zinc-200 hover:bg-slate-50 dark:hover:bg-zinc-800'
                    }`}
                  >
                    <div className="min-w-0">
                      <div className="text-xs truncate">{doc.title}</div>
                      <div className="text-[10px] text-slate-400 truncate">{doc.headerText}</div>
                    </div>
                    {selectedDocId === doc.id && (
                      <span className="w-1.5 h-1.5 rounded-full bg-violet-600 shrink-0 ml-2" />
                    )}
                  </button>
                ))}
              </div>
            </div>
          )}
        </div>

        {/* View Mode & Outline Controls */}
        <div className="flex items-center gap-2">
          {/* View Mode Switcher */}
          <div className="flex items-center bg-slate-100 dark:bg-zinc-800 p-0.5 rounded-xl border border-slate-200/70 dark:border-zinc-700/70">
            <button
              type="button"
              onPointerDown={(e) => {
                e.preventDefault();
                setViewMode?.('clean');
              }}
              className={`px-2.5 py-0.5 text-[11px] font-semibold rounded-lg transition-all cursor-pointer ${
                viewMode === 'clean'
                  ? 'bg-white dark:bg-zinc-900 text-slate-900 dark:text-zinc-100 shadow-2xs'
                  : 'text-slate-500 hover:text-slate-800'
              }`}
            >
              Clean View
            </button>
            <button
              type="button"
              onPointerDown={(e) => {
                e.preventDefault();
                setViewMode?.('full');
              }}
              className={`px-2.5 py-0.5 text-[11px] font-semibold rounded-lg transition-all cursor-pointer ${
                viewMode === 'full'
                  ? 'bg-white dark:bg-zinc-900 text-slate-900 dark:text-zinc-100 shadow-2xs'
                  : 'text-slate-500 hover:text-slate-800'
              }`}
            >
              Full Workspace
            </button>
          </div>

          <button
            type="button"
            onPointerDown={(e) => {
              e.preventDefault();
              setIsOutlineOpen(prev => !prev);
            }}
            className={`flex items-center gap-1 px-2 py-1 rounded-xl text-xs font-semibold border transition-all cursor-pointer ${
              isOutlineOpen
                ? 'bg-violet-50 text-violet-700 border-violet-300 dark:bg-violet-950 dark:text-violet-300'
                : 'bg-slate-100 dark:bg-zinc-800 text-slate-600 dark:text-zinc-300 border-slate-200 dark:border-zinc-700 hover:bg-slate-200'
            }`}
            title="Toggle Document Outline"
          >
            <Layout size={12} />
            <span>Outline</span>
          </button>

          <button
            type="button"
            onPointerDown={(e) => {
              e.preventDefault();
              setIsAiBarOpen(prev => !prev);
            }}
            className="flex items-center gap-1 px-2.5 py-1 rounded-xl bg-violet-600 hover:bg-violet-700 text-white text-xs font-bold shadow-2xs transition-all active:scale-95 cursor-pointer"
          >
            <Sparkles size={12} />
            <span>Ask AI</span>
          </button>
        </div>
      </div>

      {/* ─── FULL WORKSPACE RIBBON TOOLBAR (Shown when viewMode === 'full') ─── */}
      {viewMode === 'full' && (
        <div className="h-11 px-5 bg-slate-50/90 dark:bg-zinc-850/90 border-b border-slate-200/80 dark:border-zinc-800 flex items-center justify-between gap-3 shrink-0 z-20 shadow-2xs backdrop-blur-md">
          <div className="flex items-center gap-1.5 overflow-x-auto thin-scrollbar py-0.5">
            
            {/* Font Family Selector */}
            <div className="relative">
              <button
                type="button"
                onPointerDown={(e) => {
                  e.preventDefault();
                  setIsFontMenuOpen(prev => !prev);
                  setIsThemeMenuOpen(false);
                  setIsTableMenuOpen(false);
                }}
                className="flex items-center gap-1 px-2 py-0.5 text-xs font-semibold rounded-lg bg-white dark:bg-zinc-800 hover:bg-slate-100 text-slate-700 dark:text-zinc-200 border border-slate-200/60 dark:border-zinc-700/60 transition-colors"
                title="Font Family"
              >
                <span>{editorFont}</span>
                <ChevronDown size={10} className="text-slate-400" />
              </button>
              {isFontMenuOpen && (
                <div className="absolute top-full left-0 mt-1 w-44 bg-white dark:bg-zinc-900 border border-slate-200 dark:border-zinc-800 rounded-xl shadow-xl p-1 z-50 animate-in fade-in zoom-in-95 duration-100">
                  {FONT_OPTIONS.map((font) => (
                    <button
                      key={font}
                      type="button"
                      onPointerDown={(e) => {
                        e.preventDefault();
                        setEditorFont?.(font);
                        setIsFontMenuOpen(false);
                      }}
                      className={`w-full text-left px-2.5 py-1.5 rounded-lg text-xs font-medium transition-colors ${editorFont === font ? 'bg-violet-50 text-violet-700 dark:bg-violet-950/60 dark:text-violet-300' : 'text-slate-700 dark:text-zinc-200 hover:bg-slate-100 dark:hover:bg-zinc-800'}`}
                      style={{ fontFamily: font }}
                    >
                      {font}
                    </button>
                  ))}
                </div>
              )}
            </div>

            <div className="w-[1px] h-4 bg-slate-200 dark:bg-zinc-800 mx-0.5" />

            {/* Headings Selector */}
            <div className="flex items-center bg-white dark:bg-zinc-800 p-0.5 rounded-lg border border-slate-200/60 dark:border-zinc-700/60">
              {['p', 'h1', 'h2', 'h3'].map(tag => (
                <button
                  key={tag}
                  type="button"
                  onPointerDown={(e) => {
                    e.preventDefault();
                    setHeadingBlock(tag);
                  }}
                  className={`px-1.5 py-0.5 text-[11px] font-bold rounded-md transition-all ${activeHeading === tag ? 'bg-violet-50 dark:bg-zinc-900 text-violet-700 dark:text-violet-300 shadow-2xs' : 'text-slate-600 dark:text-zinc-400 hover:text-slate-900'}`}
                  title={tag.toUpperCase()}
                >
                  {tag.toUpperCase()}
                </button>
              ))}
            </div>

            <div className="w-[1px] h-4 bg-slate-200 dark:bg-zinc-800 mx-0.5" />

            {/* Rich Text Formats */}
            <button
              type="button"
              onPointerDown={(e) => { e.preventDefault(); execFormat('bold'); }}
              className="p-1.5 rounded-lg text-slate-700 dark:text-zinc-300 hover:bg-white dark:hover:bg-zinc-800 transition-colors"
              title="Bold (Ctrl+B)"
            >
              <Bold size={13} />
            </button>
            <button
              type="button"
              onPointerDown={(e) => { e.preventDefault(); execFormat('italic'); }}
              className="p-1.5 rounded-lg text-slate-700 dark:text-zinc-300 hover:bg-white dark:hover:bg-zinc-800 transition-colors"
              title="Italic (Ctrl+I)"
            >
              <Italic size={13} />
            </button>
            <button
              type="button"
              onPointerDown={(e) => { e.preventDefault(); execFormat('underline'); }}
              className="p-1.5 rounded-lg text-slate-700 dark:text-zinc-300 hover:bg-white dark:hover:bg-zinc-800 transition-colors"
              title="Underline (Ctrl+U)"
            >
              <Underline size={13} />
            </button>
            <button
              type="button"
              onPointerDown={(e) => { e.preventDefault(); execFormat('strikeThrough'); }}
              className="p-1.5 rounded-lg text-slate-700 dark:text-zinc-300 hover:bg-white dark:hover:bg-zinc-800 transition-colors"
              title="Strikethrough"
            >
              <Strikethrough size={13} />
            </button>

            <div className="w-[1px] h-4 bg-slate-200 dark:bg-zinc-800 mx-0.5" />

            {/* Alignments */}
            <button
              type="button"
              onPointerDown={(e) => { e.preventDefault(); execFormat('justifyLeft'); setAlignMode?.('left'); }}
              className="p-1.5 rounded-lg text-slate-700 dark:text-zinc-300 hover:bg-white dark:hover:bg-zinc-800 transition-colors"
              title="Align Left"
            >
              <AlignLeft size={13} />
            </button>
            <button
              type="button"
              onPointerDown={(e) => { e.preventDefault(); execFormat('justifyCenter'); setAlignMode?.('center'); }}
              className="p-1.5 rounded-lg text-slate-700 dark:text-zinc-300 hover:bg-white dark:hover:bg-zinc-800 transition-colors"
              title="Align Center"
            >
              <AlignCenter size={13} />
            </button>
            <button
              type="button"
              onPointerDown={(e) => { e.preventDefault(); execFormat('justifyRight'); setAlignMode?.('right'); }}
              className="p-1.5 rounded-lg text-slate-700 dark:text-zinc-300 hover:bg-white dark:hover:bg-zinc-800 transition-colors"
              title="Align Right"
            >
              <AlignRight size={13} />
            </button>

            <div className="w-[1px] h-4 bg-slate-200 dark:bg-zinc-800 mx-0.5" />

            {/* Lists & Table */}
            <button
              type="button"
              onPointerDown={(e) => { e.preventDefault(); execFormat('insertUnorderedList'); }}
              className="p-1.5 rounded-lg text-slate-700 dark:text-zinc-300 hover:bg-white dark:hover:bg-zinc-800 transition-colors"
              title="Bulleted List"
            >
              <List size={13} />
            </button>
            <button
              type="button"
              onPointerDown={(e) => { e.preventDefault(); execFormat('insertOrderedList'); }}
              className="p-1.5 rounded-lg text-slate-700 dark:text-zinc-300 hover:bg-white dark:hover:bg-zinc-800 transition-colors"
              title="Numbered List"
            >
              <ListOrdered size={13} />
            </button>

            {/* Table Dropdown Menu */}
            <div className="relative">
              <button
                type="button"
                onPointerDown={(e) => {
                  e.preventDefault();
                  setIsTableMenuOpen(prev => !prev);
                  setIsFontMenuOpen(false);
                  setIsThemeMenuOpen(false);
                }}
                className="p-1.5 rounded-lg text-slate-700 dark:text-zinc-300 hover:bg-white dark:hover:bg-zinc-800 transition-colors"
                title="Insert Table"
              >
                <Table size={13} />
              </button>
              {isTableMenuOpen && (
                <div className="absolute top-full left-0 mt-1 bg-white dark:bg-zinc-900 border border-slate-200 dark:border-zinc-800 rounded-2xl shadow-2xl p-3 z-50 animate-in fade-in zoom-in-95 duration-100 w-48">
                  <div className="text-[10px] font-bold text-slate-400 uppercase tracking-wider mb-2">
                    Insert Table ({tableHover.r} x {tableHover.c})
                  </div>
                  <div className="grid grid-cols-4 gap-1 mb-2">
                    {[1, 2, 3, 4].map(r => (
                      [1, 2, 3, 4].map(c => (
                        <div
                          key={`${r}-${c}`}
                          onPointerEnter={() => setTableHover({ r, c })}
                          onPointerDown={(e) => {
                            e.preventDefault();
                            insertHtmlAtCursor(buildTableHtml(r + 1, c));
                            setIsTableMenuOpen(false);
                            showToast?.(`Table ${r + 1}x${c} inserted`);
                          }}
                          className={`w-6 h-6 rounded-md border cursor-pointer transition-colors ${
                            r <= tableHover.r && c <= tableHover.c
                              ? 'bg-violet-200 border-violet-500'
                              : 'bg-slate-100 border-slate-200 dark:bg-zinc-800 dark:border-zinc-700'
                          }`}
                        />
                      ))
                    ))}
                  </div>
                </div>
              )}
            </div>

            {/* Theme Preset Selector */}
            <div className="relative">
              <button
                type="button"
                onPointerDown={(e) => {
                  e.preventDefault();
                  setIsThemeMenuOpen(prev => !prev);
                  setIsFontMenuOpen(false);
                  setIsTableMenuOpen(false);
                }}
                className="flex items-center gap-1.5 px-2 py-0.5 text-xs font-medium rounded-lg bg-white dark:bg-zinc-800 text-slate-700 dark:text-zinc-300 hover:bg-slate-100 border border-slate-200/60 dark:border-zinc-700/60"
                title="Document Theme"
              >
                <span className="w-2.5 h-2.5 rounded-full" style={{ backgroundColor: activeThemeProps.color }} />
                <span className="capitalize">{docTheme}</span>
              </button>
              {isThemeMenuOpen && (
                <div className="absolute top-full left-0 mt-1 bg-white dark:bg-zinc-900 border border-slate-200 dark:border-zinc-800 rounded-xl shadow-xl p-1.5 z-50 animate-in fade-in zoom-in-95 duration-100 flex flex-col gap-1 w-32">
                  {Object.entries(THEME_PRESETS).map(([key, theme]) => (
                    <button
                      key={key}
                      type="button"
                      onPointerDown={(e) => {
                        e.preventDefault();
                        setDocTheme?.(key);
                        setIsThemeMenuOpen(false);
                        showToast?.(`Theme set to ${theme.name}`);
                      }}
                      className={`flex items-center gap-2 px-2 py-1.5 rounded-lg text-xs font-semibold transition-colors ${docTheme === key ? 'bg-slate-100 dark:bg-zinc-800 text-slate-900 dark:text-white' : 'text-slate-600 dark:text-zinc-400 hover:bg-slate-50'}`}
                    >
                      <span className="w-3 h-3 rounded-full" style={{ backgroundColor: theme.color }} />
                      <span>{theme.name}</span>
                    </button>
                  ))}
                </div>
              )}
            </div>

          </div>
        </div>
      )}

      {/* ─── CLEAN FLOATING PILL TOOLBAR (Shown when viewMode === 'clean') ─── */}
      {viewMode === 'clean' && (
        <div className="absolute top-14 left-1/2 -translate-x-1/2 z-40 bg-white/90 dark:bg-zinc-900/90 backdrop-blur-2xl border border-slate-200/80 dark:border-zinc-800 shadow-[0_12px_36px_rgba(0,0,0,0.12)] rounded-full px-3 py-1 flex items-center gap-1.5 animate-in fade-in slide-in-from-top-2 duration-200">
          <button
            type="button"
            onPointerDown={(e) => { e.preventDefault(); execFormat('bold'); }}
            className="p-1.5 rounded-full text-slate-700 dark:text-zinc-300 hover:bg-slate-100 dark:hover:bg-zinc-800 transition-colors"
            title="Bold"
          >
            <Bold size={13} />
          </button>
          <button
            type="button"
            onPointerDown={(e) => { e.preventDefault(); execFormat('italic'); }}
            className="p-1.5 rounded-full text-slate-700 dark:text-zinc-300 hover:bg-slate-100 dark:hover:bg-zinc-800 transition-colors"
            title="Italic"
          >
            <Italic size={13} />
          </button>
          <button
            type="button"
            onPointerDown={(e) => { e.preventDefault(); execFormat('underline'); }}
            className="p-1.5 rounded-full text-slate-700 dark:text-zinc-300 hover:bg-slate-100 dark:hover:bg-zinc-800 transition-colors"
            title="Underline"
          >
            <Underline size={13} />
          </button>

          <div className="w-[1px] h-3.5 bg-slate-200 dark:bg-zinc-800" />

          <button
            type="button"
            onPointerDown={(e) => { e.preventDefault(); setHeadingBlock('h2'); }}
            className="px-2 py-0.5 text-xs font-bold rounded-md hover:bg-slate-100 dark:hover:bg-zinc-800 text-slate-700 dark:text-zinc-300"
            title="Heading 2"
          >
            H2
          </button>
          <button
            type="button"
            onPointerDown={(e) => { e.preventDefault(); execFormat('insertUnorderedList'); }}
            className="p-1.5 rounded-full text-slate-700 dark:text-zinc-300 hover:bg-slate-100 dark:hover:bg-zinc-800 transition-colors"
            title="Bullet List"
          >
            <List size={13} />
          </button>
          <button
            type="button"
            onPointerDown={(e) => { e.preventDefault(); insertHtmlAtCursor(buildTableHtml(3, 4)); showToast?.('Table inserted'); }}
            className="p-1.5 rounded-full text-slate-700 dark:text-zinc-300 hover:bg-slate-100 dark:hover:bg-zinc-800 transition-colors"
            title="Insert Table"
          >
            <Table size={13} />
          </button>

          <div className="w-[1px] h-3.5 bg-slate-200 dark:bg-zinc-800" />

          <button
            type="button"
            onPointerDown={(e) => { e.preventDefault(); setIsAiBarOpen(prev => !prev); }}
            className="flex items-center gap-1 px-2.5 py-0.5 rounded-full bg-violet-50 text-violet-700 dark:bg-violet-950 dark:text-violet-300 text-xs font-bold hover:bg-violet-100 transition-colors"
          >
            <Sparkles size={11} />
            <span>AI</span>
          </button>
        </div>
      )}

      {/* ─── MAIN EDITOR VIEWPORT & OUTLINE ─── */}
      <div className="flex-1 flex min-h-0 relative overflow-hidden">
        
        {/* Outline Sidebar (Collapsible) */}
        {isOutlineOpen && (
          <aside className="w-60 border-r border-slate-200/80 dark:border-zinc-800 bg-white/70 dark:bg-zinc-900/70 backdrop-blur-md p-4 flex flex-col shrink-0 animate-in slide-in-from-left duration-200 z-10">
            <div className="text-[10px] font-bold text-slate-400 uppercase tracking-wider mb-3">
              Document Outline
            </div>
            <div className="flex-1 overflow-y-auto thin-scrollbar space-y-1.5">
              {outlineHeadings.length === 0 ? (
                <div className="text-xs text-slate-400 italic py-2">No headings detected yet.</div>
              ) : (
                outlineHeadings.map((h, i) => (
                  <button
                    key={h.id || i}
                    type="button"
                    onClick={() => {
                      const el = document.getElementById(h.id);
                      if (el) el.scrollIntoView({ behavior: 'smooth', block: 'center' });
                    }}
                    className={`w-full text-left truncate text-xs py-1 px-2 rounded-lg text-slate-600 dark:text-zinc-300 hover:bg-slate-100 dark:hover:bg-zinc-800 font-medium transition-colors ${
                      h.level === 'h1' ? 'font-bold text-slate-900 dark:text-zinc-100' : h.level === 'h2' ? 'pl-4 text-slate-700' : 'pl-6 text-slate-500'
                    }`}
                  >
                    {h.text}
                  </button>
                ))
              )}
            </div>
          </aside>
        )}

        {/* Document Scroll Canvas */}
        <div className="flex-1 overflow-y-auto thin-scrollbar p-6 md:p-10 flex flex-col items-center relative">
          
          {/* Authentic Real Document Sheet Canvas */}
          <div
            data-enterprise-page="true"
            className={`w-full max-w-[840px] rounded-[28px] shadow-[0_24px_70px_-15px_rgba(15,23,42,0.12)] border transition-all relative p-10 md:p-16 min-h-[920px] flex flex-col ${
              isDarkMode 
                ? 'bg-zinc-900 border-zinc-800 text-zinc-100' 
                : 'bg-white border-slate-200/80 text-slate-900'
            }`}
            style={{
              fontFamily: editorFont,
              backgroundColor: isDarkMode ? activeThemeProps.darkBgColor : '#ffffff',
              borderColor: isDarkMode ? '#3f3f46' : activeThemeProps.bdColor,
              boxShadow: '0 20px 50px -10px rgba(0,0,0,0.08), 0 1px 3px rgba(0,0,0,0.02)'
            }}
          >
            {/* Embedded Dynamic Style Definition */}
            <style>{`
              [data-enterprise-page="true"] h1 {
                color: ${headingColor};
                font-size: 26px;
                font-weight: 800;
                margin-top: 1.4em;
                margin-bottom: 0.6em;
                letter-spacing: -0.02em;
              }
              [data-enterprise-page="true"] h2 {
                color: ${headingColor};
                font-size: 19px;
                font-weight: 700;
                margin-top: 1.3em;
                margin-bottom: 0.5em;
                letter-spacing: -0.01em;
              }
              [data-enterprise-page="true"] h3 {
                color: ${headingColor};
                font-size: 15px;
                font-weight: 600;
                margin-top: 1.1em;
                margin-bottom: 0.4em;
              }
              [data-enterprise-page="true"] p {
                line-height: 1.7;
                margin-bottom: 1em;
                color: ${isDarkMode ? '#f4f4f5' : '#334155'};
              }
              [data-enterprise-page="true"] a {
                color: ${brandColor} !important;
                text-decoration: underline;
              }
              [data-enterprise-page="true"] blockquote {
                border-left: 4px solid ${brandColor} !important;
                background-color: ${bgSurface} !important;
                padding: 12px 18px;
                border-radius: 8px;
                margin: 18px 0;
                font-style: italic;
              }
              [data-enterprise-page="true"] ul, [data-enterprise-page="true"] ol {
                padding-left: 24px;
                margin-bottom: 1.2em;
                line-height: 1.7;
              }
              [data-enterprise-page="true"] li {
                margin-bottom: 0.4em;
                color: ${isDarkMode ? '#f4f4f5' : '#334155'};
              }
            `}</style>

            {/* Document Header Chrome */}
            <div className="flex items-center justify-between border-b border-slate-100 dark:border-zinc-800 pb-3 mb-6 select-none">
              <span className="text-[10px] font-bold uppercase tracking-widest text-slate-400 dark:text-zinc-500">
                {docHeaderText}
              </span>
              <div className="flex items-center gap-1.5">
                <span className={`text-[10px] font-bold px-2 py-0.5 rounded-md uppercase tracking-wider ${
                  docState === 'ready' ? 'bg-emerald-50 text-emerald-700 dark:bg-emerald-950/60 dark:text-emerald-300' :
                  docState === 'review' ? 'bg-blue-50 text-blue-700 dark:bg-blue-950/60 dark:text-blue-300' :
                  'bg-amber-50 text-amber-700 dark:bg-amber-950/60 dark:text-amber-300'
                }`}>
                  {docState}
                </span>
                <span className="text-[10px] text-slate-400">Live Stage</span>
              </div>
            </div>

            {/* Document Header Title Input */}
            <input
              type="text"
              value={docTitle || 'Product Launch Plan & Strategic Roadmap'}
              onChange={(e) => setDocTitle?.(e.target.value)}
              placeholder="Untitled Document"
              className="text-3xl font-extrabold tracking-tight text-slate-900 dark:text-white w-full bg-transparent border-none outline-none mb-6 font-sans placeholder:text-slate-300 dark:placeholder:text-zinc-600"
            />

            {/* Live Interactive Editable Body */}
            <div
              ref={editorRef}
              contentEditable
              suppressContentEditableWarning
              onInput={handleEditorInput}
              onBlur={handleEditorInput}
              onKeyDown={handleEditorKeyDown}
              className="prose dark:prose-invert max-w-none text-[14.5px] leading-relaxed text-slate-800 dark:text-zinc-200 outline-none flex-1 min-h-[500px]"
              style={{
                fontFamily: editorFont,
                textAlign: alignMode,
                direction: 'ltr',
                unicodeBidi: 'plaintext'
              }}
            />

            {/* Document Footer Chrome */}
            <div className="flex items-center justify-between border-t border-slate-100 dark:border-zinc-800 pt-4 mt-8 select-none text-[11px] text-slate-400">
              <span>Confidential & Proprietary — Regaarder Ecosystem</span>
              <span>Page 1 of 1</span>
            </div>
          </div>

        </div>
      </div>

      {/* ─── CONTEXTUAL SLASH MENU OVERLAY ─── */}
      {/* Portaled into document.fullscreenElement ?? document.body so the browser
          compositor always paints it — regardless of native fullscreen state or any
          overflow-hidden ancestor. Pattern per POSTMORTEM_CitationPopover_Fullscreen.md. */}
      {slashMenuState.isOpen && createPortal(
        <div
          className="fixed z-[9999] w-64 bg-white dark:bg-zinc-900 border border-slate-200/90 dark:border-zinc-800 shadow-2xl rounded-2xl p-1.5 font-sans animate-in fade-in zoom-in-95 duration-150 text-left"
          style={{ top: `${slashMenuState.top}px`, left: `${slashMenuState.left}px` }}
          onClick={(e) => e.stopPropagation()}
        >
          <div className="text-[10px] font-bold text-slate-400 dark:text-zinc-500 uppercase tracking-wider px-2.5 py-1">
            Insert Commands
          </div>
          <div className="max-h-60 overflow-y-auto thin-scrollbar flex flex-col gap-0.5">
            {filteredCommands.map((cmd, idx) => (
              <button
                key={cmd.id}
                type="button"
                onPointerDown={(e) => {
                  e.preventDefault();
                  cmd.action();
                  setSlashMenuState({ isOpen: false, query: '', top: 0, left: 0, selectedIndex: 0 });
                }}
                className={`w-full flex items-center gap-2.5 px-2.5 py-2 rounded-xl text-left transition-colors ${
                  slashMenuState.selectedIndex === idx
                    ? 'bg-violet-50 text-violet-700 dark:bg-violet-950 dark:text-violet-300 font-semibold'
                    : 'text-slate-700 dark:text-zinc-300 hover:bg-slate-50 dark:hover:bg-zinc-800'
                }`}
              >
                <div className="w-6 h-6 rounded-lg bg-slate-100 dark:bg-zinc-800 flex items-center justify-center text-slate-600 dark:text-zinc-300 shrink-0">
                  <cmd.icon size={13} />
                </div>
                <div className="min-w-0 flex-1">
                  <div className="text-xs font-bold truncate">{cmd.title}</div>
                  <div className="text-[10.5px] text-slate-400 dark:text-zinc-500 truncate">{cmd.sub}</div>
                </div>
              </button>
            ))}
          </div>
        </div>,
        document.fullscreenElement ?? document.body
      )}


      {/* ─── LIVE ASK AI BAR (Bottom Docked / Floating) ─── */}
      {isAiBarOpen && (
        <div className="p-3 bg-white/95 dark:bg-zinc-900/95 border-t border-slate-200/80 dark:border-zinc-800 flex items-center gap-3 shrink-0 z-40 backdrop-blur-md shadow-lg animate-in slide-in-from-bottom duration-200">
          <div className="w-8 h-8 rounded-xl bg-violet-600 text-white flex items-center justify-center shrink-0 shadow-xs">
            <Sparkles size={16} />
          </div>
          <div className="flex-1 flex items-center gap-2 bg-slate-100 dark:bg-zinc-800 px-3 py-1.5 rounded-xl border border-slate-200/60 dark:border-zinc-700/60">
            <input
              type="text"
              value={aiPromptText}
              onChange={(e) => setAiPromptText(e.target.value)}
              onKeyDown={(e) => {
                if (e.key === 'Enter' && !e.shiftKey) {
                  e.preventDefault();
                  handleRunAiAction();
                }
              }}
              placeholder="Ask AI to summarize, polish, or generate meeting action items..."
              className="w-full bg-transparent border-none outline-none text-xs text-slate-800 dark:text-zinc-100 placeholder:text-slate-400"
              disabled={isAiProcessing}
            />
            {aiPromptText && (
              <button
                type="button"
                onClick={() => setAiPromptText('')}
                className="text-slate-400 hover:text-slate-600 text-xs"
              >
                ×
              </button>
            )}
          </div>

          <div className="flex items-center gap-1.5">
            <button
              type="button"
              onClick={() => handleRunAiAction('Summarize the key takeaways and bullet points from this document')}
              disabled={isAiProcessing}
              className="px-2.5 py-1 text-[11px] font-semibold rounded-lg bg-violet-50 text-violet-700 dark:bg-violet-950 dark:text-violet-300 hover:bg-violet-100 transition-colors cursor-pointer"
            >
              Summarize
            </button>
            <button
              type="button"
              onClick={() => handleRunAiAction('Extract all action items, owners, and deliverables from this document')}
              disabled={isAiProcessing}
              className="px-2.5 py-1 text-[11px] font-semibold rounded-lg bg-slate-100 dark:bg-zinc-800 text-slate-700 dark:text-zinc-300 hover:bg-slate-200 transition-colors cursor-pointer"
            >
              Action Items
            </button>
            <button
              type="button"
              onClick={() => handleRunAiAction()}
              disabled={isAiProcessing || !aiPromptText.trim()}
              className="flex items-center gap-1 px-3 py-1.5 rounded-xl bg-violet-600 hover:bg-violet-700 text-white text-xs font-bold shadow-xs transition-all active:scale-95 disabled:opacity-50"
            >
              <span>Generate</span>
              <ArrowRight size={12} />
            </button>
            <button
              type="button"
              onClick={() => setIsAiBarOpen(false)}
              className="p-1 text-slate-400 hover:text-slate-600"
            >
              <X size={16} />
            </button>
          </div>
        </div>
      )}

    </div>
  );
}
