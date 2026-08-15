import React, { useState } from 'react';
import { Copy, Check } from 'lucide-react';

/**
 * Parses inline formatting: **bold**, *italic*, `code`
 */
const renderInlineFormatting = (text) => {
  if (!text) return null;

  const parts = [];
  let keyIdx = 0;

  const inlineRegex = /(`[^`]+`|\*\*[^*]+\*\*|__[^_]+__|\*[^*]+\*|_[^_]+_)/g;
  let match;
  let lastIndex = 0;

  while ((match = inlineRegex.exec(text)) !== null) {
    const pre = text.substring(lastIndex, match.index);
    if (pre) {
      parts.push(<span key={`txt-${keyIdx++}`}>{pre}</span>);
    }

    const token = match[0];
    if (token.startsWith('`') && token.endsWith('`')) {
      parts.push(
        <code
          key={`code-${keyIdx++}`}
          className="px-1.5 py-0.5 mx-0.5 rounded bg-black/40 border border-white/10 text-[11px] font-mono text-violet-300 select-text"
        >
          {token.slice(1, -1)}
        </code>
      );
    } else if ((token.startsWith('**') && token.endsWith('**')) || (token.startsWith('__') && token.endsWith('__'))) {
      parts.push(
        <strong key={`bold-${keyIdx++}`} className="font-semibold text-slate-100">
          {token.slice(2, -2)}
        </strong>
      );
    } else if ((token.startsWith('*') && token.endsWith('*')) || (token.startsWith('_') && token.endsWith('_'))) {
      parts.push(
        <em key={`em-${keyIdx++}`} className="italic text-slate-300">
          {token.slice(1, -1)}
        </em>
      );
    }
    lastIndex = match.index + token.length;
  }

  const trailing = text.substring(lastIndex);
  if (trailing) {
    parts.push(<span key={`txt-${keyIdx++}`}>{trailing}</span>);
  }

  return parts.length > 0 ? parts : text;
};

/**
 * Formats and separates concatenated list items like " 1. " or " 2- " into individual blocks
 */
const normalizeTextStructure = (rawText) => {
  if (!rawText) return '';
  let str = rawText;
  
  // Separate inlined numbered items e.g. "takeaways: 1. **Item**" -> "takeaways:\n\n1. **Item**"
  str = str.replace(/([^\n])\s+(\d+)[\.\-]\s+/g, '$1\n\n$2. ');
  // Separate inlined bullet items e.g. "points: • Item" -> "points:\n\n• Item"
  str = str.replace(/([^\n])\s+([•\-\*])\s+/g, '$1\n\n- ');
  
  return str;
};

export const BrowserMarkdownRenderer = ({ content }) => {
  const [copiedBlockId, setCopiedBlockId] = useState(null);

  if (!content) return null;

  const normalized = normalizeTextStructure(content);
  const blocks = [];
  const lines = normalized.split(/\r?\n/);
  
  let currentCodeBlock = null;
  let currentList = null;
  let currentParagraph = [];

  const flushParagraph = () => {
    if (currentParagraph.length > 0) {
      blocks.push({ type: 'paragraph', text: currentParagraph.join(' ') });
      currentParagraph = [];
    }
  };

  const flushList = () => {
    if (currentList) {
      blocks.push(currentList);
      currentList = null;
    }
  };

  for (let i = 0; i < lines.length; i++) {
    const line = lines[i];
    const trimmed = line.trim();

    // Code block toggle
    if (trimmed.startsWith('```')) {
      if (currentCodeBlock) {
        blocks.push(currentCodeBlock);
        currentCodeBlock = null;
      } else {
        flushParagraph();
        flushList();
        const lang = trimmed.replace(/^```/, '').trim() || 'text';
        currentCodeBlock = { type: 'code', lang, lines: [] };
      }
      continue;
    }

    if (currentCodeBlock) {
      currentCodeBlock.lines.push(line);
      continue;
    }

    // Blank line
    if (!trimmed) {
      flushParagraph();
      flushList();
      continue;
    }

    // Headings
    if (trimmed.startsWith('### ')) {
      flushParagraph();
      flushList();
      blocks.push({ type: 'h3', text: trimmed.replace(/^###\s+/, '') });
      continue;
    }
    if (trimmed.startsWith('## ')) {
      flushParagraph();
      flushList();
      blocks.push({ type: 'h2', text: trimmed.replace(/^##\s+/, '') });
      continue;
    }
    if (trimmed.startsWith('# ')) {
      flushParagraph();
      flushList();
      blocks.push({ type: 'h1', text: trimmed.replace(/^#\s+/, '') });
      continue;
    }

    // Numbered list item: e.g. "1. ", "2- ", "1) "
    const numMatch = trimmed.match(/^(\d+)[\.\-\)]\s+(.*)/);
    if (numMatch) {
      flushParagraph();
      if (!currentList || currentList.listType !== 'numbered') {
        flushList();
        currentList = { type: 'list', listType: 'numbered', items: [] };
      }
      currentList.items.push({ num: numMatch[1], text: numMatch[2] });
      continue;
    }

    // Bullet list item: e.g. "- ", "* ", "• "
    const bulletMatch = trimmed.match(/^[\*\-•]\s+(.*)/);
    if (bulletMatch) {
      flushParagraph();
      if (!currentList || currentList.listType !== 'bullet') {
        flushList();
        currentList = { type: 'list', listType: 'bullet', items: [] };
      }
      currentList.items.push({ text: bulletMatch[1] });
      continue;
    }

    // Regular text line
    flushList();
    currentParagraph.push(trimmed);
  }

  flushParagraph();
  flushList();
  if (currentCodeBlock) {
    blocks.push(currentCodeBlock);
  }

  const handleCopyCode = (codeStr, blockIdx) => {
    navigator.clipboard.writeText(codeStr);
    setCopiedBlockId(blockIdx);
    setTimeout(() => setCopiedBlockId(null), 2000);
  };

  return (
    <div className="space-y-3 text-[12.5px] leading-relaxed text-slate-200 tracking-normal font-sans">
      {blocks.map((b, idx) => {
        if (b.type === 'h1') {
          return (
            <h4 key={idx} className="text-sm font-semibold text-white mt-3 mb-1.5 tracking-tight border-b border-white/10 pb-1">
              {renderInlineFormatting(b.text)}
            </h4>
          );
        }
        if (b.type === 'h2' || b.type === 'h3') {
          return (
            <h5 key={idx} className="text-[13px] font-semibold text-slate-100 mt-2.5 mb-1 tracking-tight">
              {renderInlineFormatting(b.text)}
            </h5>
          );
        }
        if (b.type === 'code') {
          const codeText = b.lines.join('\n');
          const isCopied = copiedBlockId === idx;
          return (
            <div key={idx} className="my-2.5 rounded-lg overflow-hidden bg-black/60 border border-white/10 shadow-inner">
              <div className="flex items-center justify-between px-3 py-1 bg-white/[0.04] border-b border-white/[0.06] text-[10px] font-mono text-slate-400">
                <span>{b.lang}</span>
                <button
                  type="button"
                  onClick={() => handleCopyCode(codeText, idx)}
                  className="flex items-center gap-1 text-slate-400 hover:text-slate-200 transition-colors cursor-pointer"
                >
                  {isCopied ? <Check size={11} className="text-emerald-400" /> : <Copy size={11} />}
                  <span>{isCopied ? 'Copied' : 'Copy'}</span>
                </button>
              </div>
              <pre className="p-3 text-[11px] font-mono text-slate-200 overflow-x-auto regaarder-scrollbar">
                <code>{codeText}</code>
              </pre>
            </div>
          );
        }
        if (b.type === 'list') {
          return (
            <div key={idx} className="my-2.5 space-y-2 pl-0.5">
              {b.items.map((item, itemIdx) => (
                <div key={itemIdx} className="flex items-start gap-2.5 text-[12px] leading-relaxed">
                  {b.listType === 'numbered' ? (
                    <span className="shrink-0 w-4 h-4 rounded-md bg-white/[0.08] text-violet-300 font-mono text-[10px] font-semibold flex items-center justify-center mt-0.5 select-none">
                      {item.num}
                    </span>
                  ) : (
                    <span className="shrink-0 w-1.5 h-1.5 rounded-full bg-violet-400 mt-2 ml-1" />
                  )}
                  <div className="flex-1 text-slate-200">
                    {renderInlineFormatting(item.text)}
                  </div>
                </div>
              ))}
            </div>
          );
        }
        return (
          <p key={idx} className="text-slate-200 font-normal leading-[1.65] my-1">
            {renderInlineFormatting(b.text)}
          </p>
        );
      })}
    </div>
  );
};

export default BrowserMarkdownRenderer;
