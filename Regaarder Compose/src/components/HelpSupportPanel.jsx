import React, { useState, useMemo, useRef, useEffect } from 'react';
import {
  Search, Keyboard, ChevronDown, ChevronUp, Check,
  X, Paperclip, LifeBuoy, ArrowRight, MessageSquare, FileText, BookOpen, FileQuestion
} from 'lucide-react';
import { RegaarderAiIcon } from './RegaarderProductIcons';

const DOC_CATEGORIES = [
  { id: 'faqs', label: 'FAQs' },
  { id: 'documentation', label: 'Documentation' },
  { id: 'guides', label: 'Guides' },
  { id: 'getting-started', label: 'Getting Started' },
  { id: 'features', label: 'Key Features' },
  { id: 'shortcuts', label: 'Shortcuts' },
  { id: 'ai', label: 'AI Capabilities' },
  { id: 'troubleshooting', label: 'Troubleshooting' },
  { id: 'changelog', label: 'Updates' },
  { id: 'all', label: 'All' },
];

const CATEGORY_OPTIONS = [
  { value: 'General', label: 'General Question' },
  { value: 'Bug Report', label: 'Bug Report' },
  { value: 'Billing', label: 'Billing & Plan' },
  { value: 'Feature Request', label: 'Feature Request' },
];

const PRIORITY_OPTIONS = [
  { value: 'Low', label: 'Low' },
  { value: 'Normal', label: 'Normal' },
  { value: 'High', label: 'High' },
  { value: 'Urgent', label: 'Urgent' },
];

// Real workspace FAQs
const FAQS = [
  {
    id: 'faq-1',
    category: 'getting-started',
    question: 'How do I invite team members to my workspace?',
    answer: 'Navigate to the Collaborators panel in the right sidebar or tap the Share button in the header menu. You can send email invites or generate shareable access links with custom View, Comment, or Edit permissions.',
  },
  {
    id: 'faq-2',
    category: 'shortcuts',
    question: 'What are the primary keyboard shortcuts for quick navigation?',
    answer: 'Press Command/Ctrl + K to launch the global Command Palette. Type "/" inside any document block to open the Slash Menu for inserting callouts, tables, code blocks, or AI widgets.',
  },
  {
    id: 'faq-3',
    category: 'ai',
    question: 'How does Regaarder AI process document data safely?',
    answer: 'Regaarder AI operates with strict privacy controls. Your document data is processed transiently for active prompts, summaries, and agent tasks, and is never used to train global public models without your explicit opt-in.',
  },
  {
    id: 'faq-4',
    category: 'features',
    question: 'Can I export my documents to PDF or Markdown?',
    answer: 'Yes! Click the Export button in the top navigation header to export your work as clean formatted PDF, Markdown (.md), JSON matrix schema, or high-resolution PNG image.',
  },
  {
    id: 'faq-5',
    category: 'troubleshooting',
    question: 'What should I do if real-time collaborative sync gets interrupted?',
    answer: 'Regaarder Compose uses state-of-the-art Yjs CRDT local caching. If network connectivity drops, your changes are saved locally in your browser storage and automatically merged seamlessly when reconnected.',
  },
  {
    id: 'faq-6',
    category: 'features',
    question: 'How do I switch between Document, Data Grid, and Canvas modes?',
    answer: 'Use the mode switcher in the top navigation bar or left rail to dynamically switch between structured Document view, Spreadsheet Data Grid, and Infinite Whiteboard Canvas.',
  },
];

const CHANGELOG = [
  {
    version: 'v2.4.0',
    date: 'July 2026',
    title: 'Help & Support Center & Performance',
    changes: [
      'Integrated executive-tier Help & Support side panel.',
      'Refined matrix parsing heuristics for multi-axis spreadsheet grids.',
      'Touch-safe dropdown focus handling across mobile devices.',
    ],
  },
  {
    version: 'v2.3.0',
    date: 'June 2026',
    title: 'Infinite Whiteboard Canvas & Live Audio/Video Sync',
    changes: [
      'Multi-cursor canvas drawing tools with shape snapping.',
      'Embedded spatial Meeting Room stage view.',
    ],
  },
];

/**
 * Premium Apple Minimalist Empty State Component
 */
function AppleEmptyState({ icon: Icon, title, description, actionText, onAction }) {
  return (
    <div className="py-10 px-4 text-center flex flex-col items-center justify-center animate-in fade-in duration-200">
      <div className="w-11 h-11 rounded-2xl bg-slate-100/80 dark:bg-zinc-900/80 border border-slate-200/60 dark:border-zinc-800 flex items-center justify-center text-slate-400 dark:text-zinc-500 mb-3 shadow-2xs">
        <Icon size={19} strokeWidth={1.5} />
      </div>
      <h4 className="text-xs font-semibold text-slate-800 dark:text-zinc-200 tracking-tight">
        {title}
      </h4>
      <p className="text-[11px] text-slate-400 dark:text-zinc-500 mt-1 max-w-[210px] leading-relaxed">
        {description}
      </p>
      {actionText && onAction && (
        <button
          onClick={onAction}
          className="mt-3.5 px-3 py-1.5 bg-slate-100 dark:bg-zinc-800 hover:bg-slate-200/80 dark:hover:bg-zinc-700 text-slate-700 dark:text-zinc-300 text-xs font-medium rounded-xl transition-colors active:scale-95"
        >
          {actionText}
        </button>
      )}
    </div>
  );
}

/**
 * Touch-Safe Apple Custom Select Dropdown
 */
function CustomSelect({ label, value, onChange, options }) {
  const [isOpen, setIsOpen] = useState(false);
  const containerRef = useRef(null);

  useEffect(() => {
    const handleOutsideClick = (e) => {
      if (containerRef.current && !containerRef.current.contains(e.target)) {
        setIsOpen(false);
      }
    };
    if (isOpen) {
      document.addEventListener('pointerdown', handleOutsideClick);
    }
    return () => {
      document.removeEventListener('pointerdown', handleOutsideClick);
    };
  }, [isOpen]);

  const selectedOption = options.find((o) => o.value === value) || options[0];

  return (
    <div className="relative w-full" ref={containerRef}>
      {label && (
        <label className="block text-xs font-medium text-slate-700 dark:text-zinc-300 mb-1 select-none">
          {label}
        </label>
      )}
      <button
        type="button"
        onPointerDown={(e) => {
          e.preventDefault();
          setIsOpen((prev) => !prev);
        }}
        className="w-full px-3 py-2 bg-slate-50 dark:bg-zinc-800/60 border border-slate-200 dark:border-zinc-700/80 rounded-xl text-xs text-slate-800 dark:text-zinc-200 flex items-center justify-between hover:bg-slate-100/70 dark:hover:bg-zinc-800 transition-colors focus:outline-none focus:ring-1 focus:ring-slate-400"
      >
        <span className="truncate">{selectedOption ? selectedOption.label : value}</span>
        <ChevronDown size={14} className={`text-slate-400 shrink-0 ml-1 transition-transform duration-200 ${isOpen ? 'rotate-180 text-slate-700 dark:text-zinc-200' : ''}`} />
      </button>

      {isOpen && (
        <div className="absolute left-0 right-0 top-full mt-1.5 z-[1500] bg-white dark:bg-zinc-900 border border-slate-200 dark:border-zinc-700/90 rounded-xl shadow-xl py-1 animate-in fade-in zoom-in-95 duration-150 overflow-hidden">
          {options.map((opt) => {
            const isSelected = opt.value === value;
            return (
              <div
                key={opt.value}
                onPointerDown={(e) => {
                  e.preventDefault();
                  onChange(opt.value);
                  setIsOpen(false);
                }}
                className={`px-3 py-2 text-xs font-medium cursor-pointer flex items-center justify-between transition-colors ${
                  isSelected
                    ? 'bg-slate-100 dark:bg-zinc-800 text-slate-900 dark:text-zinc-100 font-semibold'
                    : 'text-slate-600 dark:text-zinc-300 hover:bg-slate-50 dark:hover:bg-zinc-800/60'
                }`}
              >
                <span>{opt.label}</span>
                {isSelected && <Check size={13} className="text-slate-800 dark:text-zinc-100 shrink-0 ml-2" />}
              </div>
            );
          })}
        </div>
      )}
    </div>
  );
}

export default function HelpSupportPanel({ onClose, onOpenKeyboardShortcuts, onNavigateTab }) {
  const [searchQuery, setSearchQuery] = useState('');
  const [selectedCategory, setSelectedCategory] = useState('faqs');
  const [expandedFaqId, setExpandedFaqId] = useState(null);
  const [helpfulFeedback, setHelpfulFeedback] = useState({});
  const [isTicketModalOpen, setIsTicketModalOpen] = useState(false);
  const [ticketToast, setTicketToast] = useState(null);

  // Ticket Form State
  const [ticketSubject, setTicketSubject] = useState('');
  const [ticketCategory, setTicketCategory] = useState('General');
  const [ticketPriority, setTicketPriority] = useState('Normal');
  const [ticketMessage, setTicketMessage] = useState('');
  const [ticketEmail, setTicketEmail] = useState('');
  const [ticketAttachments, setTicketAttachments] = useState([]);

  const filteredFaqs = useMemo(() => {
    return FAQS.filter((f) => {
      const matchCat = selectedCategory === 'faqs' || selectedCategory === 'all' || f.category === selectedCategory;
      const matchQuery =
        !searchQuery.trim() ||
        f.question.toLowerCase().includes(searchQuery.toLowerCase()) ||
        f.answer.toLowerCase().includes(searchQuery.toLowerCase());
      return matchCat && matchQuery;
    });
  }, [selectedCategory, searchQuery]);

  const handleHelpfulClick = (faqId, isHelpful) => {
    setHelpfulFeedback((prev) => ({ ...prev, [faqId]: isHelpful }));
  };

  const handleAttachmentUpload = (e) => {
    const files = Array.from(e.target.files || []);
    setTicketAttachments((prev) => [...prev, ...files]);
  };

  const handleRemoveAttachment = (index) => {
    setTicketAttachments((prev) => prev.filter((_, i) => i !== index));
  };

  const handleSubmitTicket = (e) => {
    e.preventDefault();
    if (!ticketSubject.trim() || !ticketMessage.trim()) return;

    setTicketToast('Ticket submitted (#TK-' + Math.floor(100000 + Math.random() * 900000) + ')');
    setIsTicketModalOpen(false);

    setTicketSubject('');
    setTicketCategory('General');
    setTicketPriority('Normal');
    setTicketMessage('');
    setTicketEmail('');
    setTicketAttachments([]);

    setTimeout(() => {
      setTicketToast(null);
    }, 5000);
  };

  const showFaqs = selectedCategory === 'faqs' || selectedCategory === 'all' || (selectedCategory !== 'documentation' && selectedCategory !== 'guides' && selectedCategory !== 'changelog');
  const showDocs = selectedCategory === 'documentation';
  const showGuides = selectedCategory === 'guides';
  const showChangelog = selectedCategory === 'changelog' || selectedCategory === 'all';

  return (
    <div className="flex-1 min-h-0 flex flex-col bg-white dark:bg-zinc-950 text-slate-900 dark:text-zinc-100 select-none animate-fade-in thin-scrollbar overflow-y-auto font-sans">
      
      {/* Apple-Style Minimal Header */}
      <div className="px-5 pt-5 pb-3.5 border-b border-slate-100 dark:border-zinc-800/60">
        <div className="flex items-center justify-between mb-3">
          <div>
            <h2 className="text-base font-semibold tracking-tight text-slate-900 dark:text-zinc-100">
              Help & Support
            </h2>
            <p className="text-xs text-slate-400 dark:text-zinc-500 mt-0.5">
              Instant answers and documentation
            </p>
          </div>
          {onClose && (
            <button
              onClick={onClose}
              className="w-7 h-7 rounded-lg text-slate-400 hover:text-slate-700 dark:hover:text-zinc-200 hover:bg-slate-100 dark:hover:bg-zinc-800 flex items-center justify-center transition-colors"
              aria-label="Close Help Panel"
            >
              <X size={15} />
            </button>
          )}
        </div>

        {/* Integrated Minimal Search Input */}
        <div className="relative mt-2">
          <Search size={14} className="absolute left-3 top-1/2 -translate-y-1/2 text-slate-400" />
          <input
            type="text"
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
            placeholder="Search help topics..."
            className="w-full pl-9 pr-8 py-2 bg-slate-100/70 dark:bg-zinc-900 border-0 rounded-xl text-xs text-slate-800 dark:text-zinc-200 placeholder-slate-400 focus:outline-none focus:ring-1 focus:ring-slate-300 dark:focus:ring-zinc-700 transition-all"
          />
          {searchQuery && (
            <button
              onClick={() => setSearchQuery('')}
              className="absolute right-2.5 top-1/2 -translate-y-1/2 text-slate-400 hover:text-slate-600 dark:hover:text-zinc-200"
            >
              <X size={13} />
            </button>
          )}
        </div>

        {/* Apple Segmented Tab Track */}
        <div className="flex items-center gap-1 overflow-x-auto thin-scrollbar mt-3 pt-1">
          {DOC_CATEGORIES.map((cat) => (
            <button
              key={cat.id}
              onClick={() => setSelectedCategory(cat.id)}
              className={`px-3 py-1 rounded-lg text-xs font-medium whitespace-nowrap transition-all ${
                selectedCategory === cat.id
                  ? 'bg-slate-900 text-white dark:bg-zinc-100 dark:text-zinc-900 shadow-xs'
                  : 'text-slate-500 dark:text-zinc-400 hover:text-slate-900 dark:hover:text-zinc-100 hover:bg-slate-100/60 dark:hover:bg-zinc-800/50'
              }`}
            >
              {cat.label}
            </button>
          ))}
        </div>
      </div>

      {/* Toast Notification */}
      {ticketToast && (
        <div className="mx-5 mt-3 px-3.5 py-2.5 bg-slate-100 dark:bg-zinc-900 border border-slate-200 dark:border-zinc-800 rounded-xl flex items-center gap-2 text-xs font-medium text-slate-800 dark:text-zinc-200 animate-in fade-in">
          <Check size={14} className="text-emerald-500 shrink-0" />
          <div className="flex-1">{ticketToast}</div>
        </div>
      )}

      {/* Main Content Body */}
      <div className="px-5 py-4 space-y-6">

        {/* Minimal Quick Actions */}
        <div className="flex items-center gap-2">
          <button
            onClick={() => onOpenKeyboardShortcuts && onOpenKeyboardShortcuts()}
            className="flex-1 px-3 py-2 bg-slate-50 dark:bg-zinc-900/60 hover:bg-slate-100 dark:hover:bg-zinc-800/80 rounded-xl text-left transition-colors flex items-center justify-between group"
          >
            <div className="flex items-center gap-2">
              <Keyboard size={14} className="text-slate-500 dark:text-zinc-400 group-hover:text-slate-800 dark:group-hover:text-zinc-200 transition-colors" />
              <span className="text-xs font-medium text-slate-700 dark:text-zinc-300">Shortcuts</span>
            </div>
            <ArrowRight size={12} className="text-slate-300 dark:text-zinc-600 group-hover:text-slate-600 dark:group-hover:text-zinc-400 transition-colors" />
          </button>

          <button
            onClick={() => onNavigateTab && onNavigateTab('assistant')}
            className="flex-1 px-3 py-2 bg-slate-50 dark:bg-zinc-900/60 hover:bg-slate-100 dark:hover:bg-zinc-800/80 rounded-xl text-left transition-colors flex items-center justify-between group"
          >
            <div className="flex items-center gap-2">
              <RegaarderAiIcon size={14} className="text-slate-500 dark:text-zinc-400 group-hover:text-slate-800 dark:group-hover:text-zinc-200 transition-colors shrink-0" />
              <span className="text-xs font-medium text-slate-700 dark:text-zinc-300">Ask AI</span>
            </div>
            <ArrowRight size={12} className="text-slate-300 dark:text-zinc-600 group-hover:text-slate-600 dark:group-hover:text-zinc-400 transition-colors" />
          </button>
        </div>

        {/* 1. FREQUENTLY ASKED QUESTIONS */}
        {showFaqs && (
          <div>
            <div className="flex items-center justify-between mb-2">
              <h3 className="text-[11px] font-semibold text-slate-400 dark:text-zinc-500 tracking-wider uppercase">
                Frequently Asked Questions
              </h3>
              <span className="text-[11px] text-slate-400 dark:text-zinc-500">{filteredFaqs.length} items</span>
            </div>

            <div className="divide-y divide-slate-100 dark:divide-zinc-800/60">
              {filteredFaqs.length > 0 ? (
                filteredFaqs.map((faq) => {
                  const isExpanded = expandedFaqId === faq.id;
                  const feedback = helpfulFeedback[faq.id];

                  return (
                    <div key={faq.id} className="py-2.5">
                      <button
                        onClick={() => setExpandedFaqId(isExpanded ? null : faq.id)}
                        className="w-full text-left flex items-start justify-between gap-3 group py-1"
                      >
                        <span className="text-xs font-semibold text-slate-800 dark:text-zinc-200 group-hover:text-slate-900 dark:group-hover:text-white leading-relaxed">
                          {faq.question}
                        </span>
                        {isExpanded ? (
                          <ChevronUp size={14} className="text-slate-400 shrink-0 mt-0.5" />
                        ) : (
                          <ChevronDown size={14} className="text-slate-400 shrink-0 mt-0.5" />
                        )}
                      </button>

                      {isExpanded && (
                        <div className="pt-2 pb-1 pl-0.5 space-y-3">
                          <p className="text-xs text-slate-500 dark:text-zinc-400 leading-relaxed font-normal">
                            {faq.answer}
                          </p>

                          <div className="flex items-center justify-between pt-1">
                            <span className="text-[11px] text-slate-400 dark:text-zinc-500">Helpful?</span>
                            {feedback === undefined ? (
                              <div className="flex items-center gap-1.5">
                                <button
                                  onClick={() => handleHelpfulClick(faq.id, true)}
                                  className="px-2 py-0.5 text-[11px] font-medium text-slate-600 dark:text-zinc-400 hover:bg-slate-100 dark:hover:bg-zinc-800 rounded transition-colors"
                                >
                                  Yes
                                </button>
                                <button
                                  onClick={() => handleHelpfulClick(faq.id, false)}
                                  className="px-2 py-0.5 text-[11px] font-medium text-slate-600 dark:text-zinc-400 hover:bg-slate-100 dark:hover:bg-zinc-800 rounded transition-colors"
                                >
                                  No
                                </button>
                              </div>
                            ) : (
                              <span className="text-[11px] text-emerald-600 dark:text-emerald-400 flex items-center gap-1">
                                <Check size={12} /> Feedback saved
                              </span>
                            )}
                          </div>
                        </div>
                      )}
                    </div>
                  );
                })
              ) : (
                <AppleEmptyState
                  icon={Search}
                  title="No Matching Topics"
                  description={searchQuery ? `No FAQs found matching "${searchQuery}".` : 'No help topics found.'}
                  actionText="Ask AI Assistant"
                  onAction={() => onNavigateTab && onNavigateTab('assistant')}
                />
              )}
            </div>
          </div>
        )}

        {/* 2. DOCUMENTATION TAB & APPLE EMPTY STATE */}
        {showDocs && (
          <AppleEmptyState
            icon={FileText}
            title="No Documentation Published"
            description="Technical documentation articles and API references will appear here once synced to your workspace."
            actionText="Ask AI Assistant"
            onAction={() => onNavigateTab && onNavigateTab('assistant')}
          />
        )}

        {/* 3. GUIDES TAB & APPLE EMPTY STATE */}
        {showGuides && (
          <AppleEmptyState
            icon={BookOpen}
            title="No Interactive Guides"
            description="Step-by-step onboarding walkthroughs and guides will be displayed here when published."
            actionText="Ask AI Assistant"
            onAction={() => onNavigateTab && onNavigateTab('assistant')}
          />
        )}

        {/* 4. RELEASE NOTES & UPDATES */}
        {showChangelog && (
          <div>
            <div className="flex items-center justify-between mb-2">
              <h3 className="text-[11px] font-semibold text-slate-400 dark:text-zinc-500 tracking-wider uppercase">
                Release Notes
              </h3>
            </div>

            <div className="divide-y divide-slate-100 dark:divide-zinc-800/60">
              {CHANGELOG.map((log) => (
                <div key={log.version} className="py-3">
                  <div className="flex items-center justify-between mb-1">
                    <span className="px-2 py-0.5 bg-slate-100 dark:bg-zinc-800 text-slate-800 dark:text-zinc-200 text-[10px] font-bold rounded">
                      {log.version}
                    </span>
                    <span className="text-[11px] text-slate-400 dark:text-zinc-500">{log.date}</span>
                  </div>
                  <h4 className="text-xs font-semibold text-slate-800 dark:text-zinc-200 mt-1">
                    {log.title}
                  </h4>
                  <ul className="mt-2 space-y-1">
                    {log.changes.map((item, idx) => (
                      <li key={idx} className="text-xs text-slate-500 dark:text-zinc-400 flex items-start gap-1.5 leading-relaxed">
                        <span className="text-slate-400 font-bold">•</span>
                        <span>{item}</span>
                      </li>
                    ))}
                  </ul>
                </div>
              ))}
            </div>
          </div>
        )}

        {/* Minimal Contact Action */}
        <div className="pt-4 border-t border-slate-100 dark:border-zinc-800/60 flex items-center justify-between">
          <div className="text-xs text-slate-500 dark:text-zinc-400 font-medium">
            Still need support?
          </div>
          <button
            onClick={() => setIsTicketModalOpen(true)}
            className="px-3.5 py-1.5 text-xs font-semibold text-slate-800 dark:text-zinc-200 bg-slate-100 dark:bg-zinc-800 hover:bg-slate-200 dark:hover:bg-zinc-700 rounded-xl transition-colors flex items-center gap-1.5"
          >
            <MessageSquare size={13} /> Contact Support
          </button>
        </div>
      </div>

      {/* Support Ticket Submission Modal */}
      {isTicketModalOpen && (
        <div className="fixed inset-0 z-[1400] flex items-center justify-center p-4 bg-black/30 backdrop-blur-xs animate-in fade-in">
          <div
            className="bg-white dark:bg-zinc-900 border border-slate-200 dark:border-zinc-800 rounded-2xl max-w-md w-full shadow-2xl overflow-hidden"
            onClick={(e) => e.stopPropagation()}
          >
            {/* Modal Header */}
            <div className="px-5 py-4 border-b border-slate-100 dark:border-zinc-800 flex items-center justify-between">
              <h3 className="text-sm font-semibold text-slate-900 dark:text-zinc-100">
                Submit Support Ticket
              </h3>
              <button
                onClick={() => setIsTicketModalOpen(false)}
                className="w-7 h-7 rounded-lg text-slate-400 hover:text-slate-600 dark:hover:text-zinc-200 flex items-center justify-center"
              >
                <X size={15} />
              </button>
            </div>

            {/* Modal Form */}
            <form onSubmit={handleSubmitTicket} className="p-5 space-y-4">
              <div>
                <label className="block text-xs font-medium text-slate-700 dark:text-zinc-300 mb-1">
                  Subject *
                </label>
                <input
                  type="text"
                  required
                  value={ticketSubject}
                  onChange={(e) => setTicketSubject(e.target.value)}
                  placeholder="Short description of your inquiry"
                  className="w-full px-3 py-2 bg-slate-50 dark:bg-zinc-800/60 border border-slate-200 dark:border-zinc-700 rounded-xl text-xs text-slate-800 dark:text-zinc-200 focus:outline-none focus:ring-1 focus:ring-slate-400"
                />
              </div>

              <div className="grid grid-cols-2 gap-3">
                <CustomSelect
                  label="Category"
                  value={ticketCategory}
                  onChange={setTicketCategory}
                  options={CATEGORY_OPTIONS}
                />

                <CustomSelect
                  label="Priority"
                  value={ticketPriority}
                  onChange={setTicketPriority}
                  options={PRIORITY_OPTIONS}
                />
              </div>

              <div>
                <label className="block text-xs font-medium text-slate-700 dark:text-zinc-300 mb-1">
                  Contact Email
                </label>
                <input
                  type="email"
                  value={ticketEmail}
                  onChange={(e) => setTicketEmail(e.target.value)}
                  placeholder="name@company.com"
                  className="w-full px-3 py-2 bg-slate-50 dark:bg-zinc-800/60 border border-slate-200 dark:border-zinc-700 rounded-xl text-xs text-slate-800 dark:text-zinc-200 focus:outline-none"
                />
              </div>

              <div>
                <label className="block text-xs font-medium text-slate-700 dark:text-zinc-300 mb-1">
                  Description *
                </label>
                <textarea
                  rows={4}
                  required
                  value={ticketMessage}
                  onChange={(e) => setTicketMessage(e.target.value)}
                  placeholder="Provide details or steps to reproduce..."
                  className="w-full px-3 py-2 bg-slate-50 dark:bg-zinc-800/60 border border-slate-200 dark:border-zinc-700 rounded-xl text-xs text-slate-800 dark:text-zinc-200 focus:outline-none"
                />
              </div>

              {/* Attachments */}
              <div>
                <div className="flex flex-wrap items-center gap-2">
                  <label className="px-3 py-1.5 bg-slate-100 dark:bg-zinc-800 text-slate-700 dark:text-zinc-300 text-xs font-medium rounded-xl cursor-pointer inline-flex items-center gap-1.5 hover:bg-slate-200 transition-colors">
                    <Paperclip size={13} /> Attach File
                    <input type="file" multiple onChange={handleAttachmentUpload} className="hidden" />
                  </label>
                  {ticketAttachments.map((f, i) => (
                    <span key={i} className="inline-flex items-center gap-1 px-2 py-1 bg-slate-100 dark:bg-zinc-800 text-slate-700 dark:text-zinc-300 text-[11px] rounded-lg">
                      {f.name}
                      <button type="button" onClick={() => handleRemoveAttachment(i)} className="hover:text-rose-500">
                        <X size={12} />
                      </button>
                    </span>
                  ))}
                </div>
              </div>

              {/* Action Buttons */}
              <div className="pt-3 border-t border-slate-100 dark:border-zinc-800 flex items-center justify-end gap-2">
                <button
                  type="button"
                  onClick={() => setIsTicketModalOpen(false)}
                  className="px-4 py-2 text-xs font-medium text-slate-500 hover:bg-slate-100 dark:hover:bg-zinc-800 rounded-xl transition-colors"
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  className="px-4 py-2 text-xs font-semibold text-white bg-slate-900 dark:bg-zinc-100 dark:text-zinc-900 hover:bg-slate-800 rounded-xl transition-colors flex items-center gap-1.5"
                >
                  Submit Ticket
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

    </div>
  );
}
