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
export const BrowserHomeIcon = ({ size = 18, className = '', strokeWidth = 1.5, ...props }) => (
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

// 2. REFRESH / RELOAD: Clean, engineered 270-degree circular arc with precision arrowhead
export const BrowserReloadIcon = ({ size = 18, className = '', strokeWidth = 1.5, ...props }) => (
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
    {/* Engineered circular reload vector */}
    <path d="M19.5 12A7.5 7.5 0 1 1 17.2 6.8" />
    {/* Precision arrowhead */}
    <polyline points="17 3.5 17 7.2 20.7 7.2" />
  </svg>
);

// 3. BACK: Standardized left directional chevron arrow
export const BrowserBackIcon = ({ size = 18, className = '', strokeWidth = 1.5, ...props }) => (
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
export const BrowserForwardIcon = ({ size = 18, className = '', strokeWidth = 1.5, ...props }) => (
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
export const BrowserPlusIcon = ({ size = 18, className = '', strokeWidth = 1.5, ...props }) => (
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
export const BrowserLockIcon = ({ size = 16, className = '', strokeWidth = 1.5, ...props }) => (
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
export const BrowserInsecureIcon = ({ size = 16, className = '', strokeWidth = 1.5, ...props }) => (
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
export const BrowserExternalIcon = ({ size = 18, className = '', strokeWidth = 1.5, ...props }) => (
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
export const BrowserBookmarkIcon = ({ size = 18, className = '', strokeWidth = 1.5, ...props }) => (
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
    <path d="M6 3.5h12a1.5 1.5 0 0 1 1.5 1.5v16l-7.5-4-7.5 4V5a1.5 1.5 0 0 1 1.5-1.5z" />
  </svg>
);

// 10. CLOSE / DISMISS: Precision 'x' icon
export const BrowserCloseIcon = ({ size = 16, className = '', strokeWidth = 1.5, ...props }) => (
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
export const BrowserSearchIcon = ({ size = 18, className = '', strokeWidth = 1.5, ...props }) => (
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
export const BrowserSearchWebIcon = ({ size = 20, className = '', strokeWidth = 1.5, ...props }) => (
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
    <path d="M12 3.5a12.5 12.5 0 0 1 0 17a12.5 12.5 0 0 1 0-17z" />
  </svg>
);

// 13. RESEARCH COMPETITORS ACTION: Metric matrix & competitive chart glyph
export const BrowserCompetitorsIcon = ({ size = 20, className = '', strokeWidth = 1.5, ...props }) => (
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
export const BrowserCheckIcon = ({ size = 16, className = '', strokeWidth = 1.5, ...props }) => (
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

// 15. FLOW / WORKFLOW: Regaarder node loop graph with central focal node
export const BrowserFlowIcon = ({ size = 18, className = '', strokeWidth = 1.5, ...props }) => (
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
    <path d="M4.5 12A7.5 7.5 0 0 1 12 4.5h5.5" />
    <polyline points="15 2 18.5 4.5 15 7" />
    <path d="M19.5 12A7.5 7.5 0 0 1 12 19.5H6.5" />
    <polyline points="9 22 5.5 19.5 9 17" />
    <circle cx="12" cy="12" r="2" fill="currentColor" stroke="none" />
  </svg>
);

// 16. RECORDING: Active flow recording indicator (recording dot + spark node)
export const BrowserRecordIcon = ({ size = 18, className = '', strokeWidth = 1.5, ...props }) => (
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
    <circle cx="8" cy="12" r="4.5" fill="#ef4444" stroke="#ef4444" />
    <path d="M15.5 8.5L16.5 12L15.5 15.5L19 12L15.5 8.5Z" fill="currentColor" stroke="none" />
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
  Record: BrowserRecordIcon
};

export default RegaarderBrowserIconMap;

