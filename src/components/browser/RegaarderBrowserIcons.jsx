import React from 'react';

/**
 * Regaarder Browser Icon System Specifications:
 * - 24x24 viewBox
 * - 1.5px consistent optical stroke weight (strokeWidth = 1.5)
 * - strokeLinecap="round", strokeLinejoin="round"
 * - Monochrome by default (currentColor), tinted via Tailwind CSS classes
 * - Clean geometric primitives matching Regaarder design language
 * - Core Principle: Regaarder customizes visual language (stroke & geometry), NOT universal affordances.
 */

// 1. HOME: Simplified geometric house with architectural doorway frame & Regaarder focal node
export const BrowserHomeIcon = ({ size = 16, className = '', strokeWidth = 1.5, ...props }) => (
  <svg
    width={size}
    height={size}
    viewBox="0 0 24 24"
    fill="none"
    stroke="currentColor"
    strokeWidth={strokeWidth}
    strokeLinecap="round"
    strokeLinejoin="round"
    className={className}
    {...props}
  >
    {/* Architectural outer house shell */}
    <path d="M3.5 10.5L12 3.5L20.5 10.5V19.5A1.5 1.5 0 0 1 19 21H5A1.5 1.5 0 0 1 3.5 19.5Z" />
    {/* Regaarder inner architectural doorway frame */}
    <rect x="9.5" y="13" width="5" height="8" rx="0.75" />
    {/* Distinctive Regaarder focal node */}
    <circle cx="12" cy="9" r="0.85" fill="currentColor" stroke="none" />
  </svg>
);

// 2. REFRESH / RELOAD: Clean, balanced 300-degree circular arrow with precision arrowhead
export const BrowserReloadIcon = ({ size = 16, className = '', strokeWidth = 1.5, ...props }) => (
  <svg
    width={size}
    height={size}
    viewBox="0 0 24 24"
    fill="none"
    stroke="currentColor"
    strokeWidth={strokeWidth}
    strokeLinecap="round"
    strokeLinejoin="round"
    className={className}
    {...props}
  >
    {/* Smooth circular arc */}
    <path d="M21 12a9 9 0 1 1-9-9c2.52 0 4.85.83 6.72 2.24" />
    {/* Precision aligned arrowhead */}
    <polyline points="21 3 21 9 15 9" />
  </svg>
);

// 3. BACK: Standardized left directional chevron arrow
export const BrowserBackIcon = ({ size = 16, className = '', strokeWidth = 1.5, ...props }) => (
  <svg
    width={size}
    height={size}
    viewBox="0 0 24 24"
    fill="none"
    stroke="currentColor"
    strokeWidth={strokeWidth}
    strokeLinecap="round"
    strokeLinejoin="round"
    className={className}
    {...props}
  >
    <polyline points="15 19 8 12 15 5" />
  </svg>
);

// 4. FORWARD: Standardized right directional chevron arrow
export const BrowserForwardIcon = ({ size = 16, className = '', strokeWidth = 1.5, ...props }) => (
  <svg
    width={size}
    height={size}
    viewBox="0 0 24 24"
    fill="none"
    stroke="currentColor"
    strokeWidth={strokeWidth}
    strokeLinecap="round"
    strokeLinejoin="round"
    className={className}
    {...props}
  >
    <polyline points="9 19 16 12 9 5" />
  </svg>
);

// 5. NEW TAB / PLUS: Precision "+" metaphor with rounded caps and balanced geometry
export const BrowserPlusIcon = ({ size = 16, className = '', strokeWidth = 1.5, ...props }) => (
  <svg
    width={size}
    height={size}
    viewBox="0 0 24 24"
    fill="none"
    stroke="currentColor"
    strokeWidth={strokeWidth}
    strokeLinecap="round"
    strokeLinejoin="round"
    className={className}
    {...props}
  >
    <line x1="12" y1="5" x2="12" y2="19" />
    <line x1="5" y1="12" x2="19" y2="12" />
  </svg>
);

// 6. LOCK / SECURE: Clean geometric padlock with rounded shackle
export const BrowserLockIcon = ({ size = 15, className = '', strokeWidth = 1.5, ...props }) => (
  <svg
    width={size}
    height={size}
    viewBox="0 0 24 24"
    fill="none"
    stroke="currentColor"
    strokeWidth={strokeWidth}
    strokeLinecap="round"
    strokeLinejoin="round"
    className={className}
    {...props}
  >
    <rect x="5" y="11" width="14" height="10" rx="2" />
    <path d="M8 11V7a4 4 0 0 1 8 0v4" />
    <circle cx="12" cy="16" r="0.9" fill="currentColor" stroke="none" />
  </svg>
);

// 7. INSECURE: Shield outline with warning focal node
export const BrowserInsecureIcon = ({ size = 15, className = '', strokeWidth = 1.5, ...props }) => (
  <svg
    width={size}
    height={size}
    viewBox="0 0 24 24"
    fill="none"
    stroke="currentColor"
    strokeWidth={strokeWidth}
    strokeLinecap="round"
    strokeLinejoin="round"
    className={className}
    {...props}
  >
    <path d="M12 3L4 7v6c0 5.5 3.8 10.1 8 11 4.2-.9 8-5.5 8-11V7l-8-4z" />
    <line x1="12" y1="9" x2="12" y2="13" />
    <circle cx="12" cy="16.5" r="0.85" fill="currentColor" stroke="none" />
  </svg>
);

// 8. EXTERNAL LINK: Precision diagonal arrow + container frame
export const BrowserExternalIcon = ({ size = 16, className = '', strokeWidth = 1.5, ...props }) => (
  <svg
    width={size}
    height={size}
    viewBox="0 0 24 24"
    fill="none"
    stroke="currentColor"
    strokeWidth={strokeWidth}
    strokeLinecap="round"
    strokeLinejoin="round"
    className={className}
    {...props}
  >
    <path d="M18 13v6a2 2 0 0 1-2 2H5a2 2 0 0 1-2-2V8a2 2 0 0 1 2-2h6" />
    <polyline points="15 3 21 3 21 9" />
    <line x1="10" y1="14" x2="21" y2="3" />
  </svg>
);

// 9. BOOKMARK: Geometric ribbon node
export const BrowserBookmarkIcon = ({ size = 16, className = '', strokeWidth = 1.5, filled = false, ...props }) => (
  <svg
    width={size}
    height={size}
    viewBox="0 0 24 24"
    fill="none"
    stroke="currentColor"
    strokeWidth={strokeWidth}
    strokeLinecap="round"
    strokeLinejoin="round"
    className={className}
    {...props}
  >
    <path d="M6 3.5h12a1.5 1.5 0 0 1 1.5 1.5v16l-7.5-4-7.5 4V5a1.5 1.5 0 0 1 1.5-1.5z" fill={filled ? 'currentColor' : 'none'} />
  </svg>
);

// 10. CLOSE / DISMISS: Precision 'x' icon
export const BrowserCloseIcon = ({ size = 14, className = '', strokeWidth = 1.5, ...props }) => (
  <svg
    width={size}
    height={size}
    viewBox="0 0 24 24"
    fill="none"
    stroke="currentColor"
    strokeWidth={strokeWidth}
    strokeLinecap="round"
    strokeLinejoin="round"
    className={className}
    {...props}
  >
    <line x1="18" y1="6" x2="6" y2="18" />
    <line x1="6" y1="6" x2="18" y2="18" />
  </svg>
);

// 11. SEARCH OMNIBOX: Geometric magnifying glass with crisp handle angle
export const BrowserSearchIcon = ({ size = 16, className = '', strokeWidth = 1.5, ...props }) => (
  <svg
    width={size}
    height={size}
    viewBox="0 0 24 24"
    fill="none"
    stroke="currentColor"
    strokeWidth={strokeWidth}
    strokeLinecap="round"
    strokeLinejoin="round"
    className={className}
    {...props}
  >
    <circle cx="11" cy="11" r="7" />
    <line x1="16" y1="16" x2="21.5" y2="21.5" />
  </svg>
);

// 12. SEARCH WEB ACTION: Standardized web globe with latitude & longitude curves
export const BrowserSearchWebIcon = ({ size = 16, className = '', strokeWidth = 1.5, ...props }) => (
  <svg
    width={size}
    height={size}
    viewBox="0 0 24 24"
    fill="none"
    stroke="currentColor"
    strokeWidth={strokeWidth}
    strokeLinecap="round"
    strokeLinejoin="round"
    className={className}
    {...props}
  >
    <circle cx="12" cy="12" r="8.5" />
    <line x1="3.5" y1="12" x2="20.5" y2="12" />
    <ellipse cx="12" cy="12" rx="4" ry="8.5" />
  </svg>
);

// 13. RESEARCH COMPETITORS ACTION: Metric matrix & competitive chart glyph
export const BrowserCompetitorsIcon = ({ size = 16, className = '', strokeWidth = 1.5, ...props }) => (
  <svg
    width={size}
    height={size}
    viewBox="0 0 24 24"
    fill="none"
    stroke="currentColor"
    strokeWidth={strokeWidth}
    strokeLinecap="round"
    strokeLinejoin="round"
    className={className}
    {...props}
  >
    <rect x="3.5" y="4" width="17" height="16" rx="2" />
    <line x1="3.5" y1="10" x2="20.5" y2="10" />
    <line x1="8" y1="14" x2="8" y2="17" />
    <line x1="12" y1="12" x2="12" y2="17" />
    <line x1="16" y1="13" x2="16" y2="17" />
  </svg>
);

// 14. CHECKMARK: Precision check icon for confirmation & context badges
export const BrowserCheckIcon = ({ size = 15, className = '', strokeWidth = 1.5, ...props }) => (
  <svg
    width={size}
    height={size}
    viewBox="0 0 24 24"
    fill="none"
    stroke="currentColor"
    strokeWidth={strokeWidth}
    strokeLinecap="round"
    strokeLinejoin="round"
    className={className}
    {...props}
  >
    <polyline points="20 6 9 17 4 12" />
  </svg>
);

// 15. FLOW / WORKFLOW: Regaarder custom glyph
export const BrowserFlowIcon = ({ size = 16, mode = 'idle', className = '', strokeWidth = 1.5, ...props }) => (
  <svg
    width={size}
    height={size}
    viewBox="0 0 24 24"
    fill="none"
    stroke="currentColor"
    strokeWidth={strokeWidth}
    strokeLinecap="round"
    strokeLinejoin="round"
    className={className}
    {...props}
  >
    <circle cx="4" cy="12" r="2.2" />
    <path d="M6.2 12h3.3" />
    <polyline points="8.2 10.5 9.7 12 8.2 13.5" />
    <polygon points="13.2 8.8 16.4 12 13.2 15.2 10 12" />
    <path d="M16.4 12h1.6a2.5 2.5 0 0 1 2.5 2.5v.5a2.5 2.5 0 0 1-2.5 2.5H16" />
    <polyline points="17.5 16 16 17.5 17.5 19" />

    {mode === 'recording' || mode === 'capture' ? (
      <circle cx="4" cy="12" r="1.1" fill="currentColor" stroke="none" />
    ) : mode === 'run' || mode === 'replay' ? (
      <polygon points="12.2 10.6 14.2 12 12.2 13.4" fill="currentColor" stroke="none" />
    ) : (
      <circle cx="4" cy="12" r="0.75" fill="currentColor" stroke="none" />
    )}
  </svg>
);

// 16. RECORDING: Active flow recording indicator
export const BrowserRecordIcon = ({ size = 16, className = '', strokeWidth = 1.5, ...props }) => (
  <svg
    width={size}
    height={size}
    viewBox="0 0 24 24"
    fill="none"
    stroke="currentColor"
    strokeWidth={strokeWidth}
    strokeLinecap="round"
    strokeLinejoin="round"
    className={className}
    {...props}
  >
    <circle cx="8" cy="12" r="4.5" fill="currentColor" stroke="currentColor" />
    <path d="M15.5 8.5L16.5 12L15.5 15.5L19 12L15.5 8.5Z" fill="currentColor" stroke="none" />
  </svg>
);

// 17. ELLIPSIS / MORE OPTIONS: Precision horizontal 3-dot menu icon
export const BrowserEllipsisIcon = ({ size = 16, className = '', strokeWidth = 1.5, ...props }) => (
  <svg
    width={size}
    height={size}
    viewBox="0 0 24 24"
    fill="none"
    stroke="currentColor"
    strokeWidth={strokeWidth}
    strokeLinecap="round"
    strokeLinejoin="round"
    className={className}
    {...props}
  >
    <circle cx="12" cy="12" r="1.25" fill="currentColor" stroke="none" />
    <circle cx="18" cy="12" r="1.25" fill="currentColor" stroke="none" />
    <circle cx="6" cy="12" r="1.25" fill="currentColor" stroke="none" />
  </svg>
);

// 18. UTILITIES / TOOLS: Custom minimal Regaarder toolbox glyph
export const BrowserUtilitiesIcon = ({ size = 16, className = '', strokeWidth = 1.5, ...props }) => (
  <svg
    width={size}
    height={size}
    viewBox="0 0 24 24"
    fill="none"
    stroke="currentColor"
    strokeWidth={strokeWidth}
    strokeLinecap="round"
    strokeLinejoin="round"
    className={className}
    {...props}
  >
    <rect x="3" y="7" width="18" height="13" rx="2" />
    <path d="M8 7V5a2 2 0 0 1 2-2h4a2 2 0 0 1 2 2v2" />
    <line x1="3" y1="12" x2="21" y2="12" />
    <rect x="10.5" y="10.5" width="3" height="3" rx="0.5" fill="currentColor" stroke="none" />
  </svg>
);

// 19. PRINT: Precision printer icon
export const BrowserPrintIcon = ({ size = 16, className = '', strokeWidth = 1.5, ...props }) => (
  <svg
    width={size}
    height={size}
    viewBox="0 0 24 24"
    fill="none"
    stroke="currentColor"
    strokeWidth={strokeWidth}
    strokeLinecap="round"
    strokeLinejoin="round"
    className={className}
    {...props}
  >
    <polyline points="6 9 6 2 18 2 18 9" />
    <path d="M6 18H4a2 2 0 0 1-2-2v-5a2 2 0 0 1 2-2h16a2 2 0 0 1 2 2v5a2 2 0 0 1-2 2h-2" />
    <rect x="6" y="14" width="12" height="8" rx="1" />
  </svg>
);

// Export map for easy lookup
export const RegaarderBrowserIconMap = {
  Home: BrowserHomeIcon,
  Reload: BrowserReloadIcon,
  Back: BrowserBackIcon,
  Forward: BrowserForwardIcon,
  Plus: BrowserPlusIcon,
  Lock: BrowserLockIcon,
  Insecure: BrowserInsecureIcon,
  External: BrowserExternalIcon,
  Bookmark: BrowserBookmarkIcon,
  Close: BrowserCloseIcon,
  Search: BrowserSearchIcon,
  SearchWeb: BrowserSearchWebIcon,
  Competitors: BrowserCompetitorsIcon,
  Check: BrowserCheckIcon,
  Flow: BrowserFlowIcon,
  Record: BrowserRecordIcon,
  Ellipsis: BrowserEllipsisIcon,
  Utilities: BrowserUtilitiesIcon,
  Print: BrowserPrintIcon
};

export default RegaarderBrowserIconMap;



