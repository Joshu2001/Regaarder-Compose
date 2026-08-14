import React from "react";

/**
 * Regaarder Product Icon Grammar:
 * - 24x24 viewBox
 * - 1.6px consistent optical stroke weight
 * - strokeLinecap="round", strokeLinejoin="round"
 * - Monochrome by default (currentColor)
 * - Clean geometric primitives (3-5 per icon)
 */

export const ComposeIcon = ({ size = 24, className = "", strokeWidth = 1.6, ...props }) => (
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
    {/* Document outline with crisp corner fold */}
    <path d="M14 3H7a2 2 0 0 0-2 2v14a2 2 0 0 0 2 2h10a2 2 0 0 0 2-2V8l-5-5z" />
    <polyline points="14 3 14 8 19 8" />
    {/* Clean composition lines */}
    <line x1="9" y1="13" x2="15" y2="13" />
    <line x1="9" y1="17" x2="13" y2="17" />
  </svg>
);

export const DeckIcon = ({ size = 24, className = "", strokeWidth = 1.6, ...props }) => (
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
    {/* Stacked background slide frame */}
    <path d="M9 4.5h9.5A1.5 1.5 0 0 1 20 6v7.5" opacity="0.55" />
    {/* Front primary slide frame */}
    <rect x="3.5" y="8" width="13.5" height="11.5" rx="1.75" />
    {/* Internal slide graphic primitive */}
    <line x1="6.5" y1="15" x2="6.5" y2="12" />
    <line x1="9.5" y1="15" x2="9.5" y2="13.5" />
    <line x1="12.5" y1="15" x2="12.5" y2="11" />
  </svg>
);

export const SheetIcon = ({ size = 24, className = "", strokeWidth = 1.6, ...props }) => (
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
    {/* Rounded spreadsheet outer frame */}
    <rect x="3.5" y="3.5" width="17" height="17" rx="2" />
    {/* Horizontal grid rows */}
    <line x1="3.5" y1="9.5" x2="20.5" y2="9.5" />
    <line x1="3.5" y1="15" x2="20.5" y2="15" />
    {/* Vertical grid column divider */}
    <line x1="10" y1="3.5" x2="10" y2="20.5" />
  </svg>
);

export const RoomIcon = ({ size = 24, className = "", strokeWidth = 1.6, ...props }) => (
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
    {/* Primary spatial viewport frame */}
    <rect x="3.5" y="4" width="12.5" height="10.5" rx="2" />
    {/* Secondary overlapping collaborative frame */}
    <rect x="8" y="9.5" width="12.5" height="10.5" rx="2" />
    {/* Presence / connection focal point */}
    <circle cx="16.5" cy="12" r="0.75" fill="currentColor" stroke="none" />
    <circle cx="7.5" cy="6.5" r="0.75" fill="currentColor" stroke="none" />
  </svg>
);

export const WhiteboardIcon = ({ size = 24, className = "", strokeWidth = 1.6, ...props }) => (
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
    {/* Canvas board frame */}
    <rect x="3.5" y="3.5" width="17" height="13.5" rx="2" />
    {/* Stand / easel feet */}
    <path d="M7.5 17L6 20.5M16.5 17L18 20.5" />
    {/* Creative mark: angled stroke to focal node */}
    <path d="M7.5 12.5L12.5 7.5" />
    <circle cx="15.5" cy="7.5" r="1.25" fill="currentColor" stroke="none" />
  </svg>
);

export const ScheduleIcon = ({ size = 24, className = "", strokeWidth = 1.6, ...props }) => (
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
    {/* Calendar container frame */}
    <rect x="3.5" y="4.5" width="17" height="16" rx="2" />
    {/* Top binder pins */}
    <line x1="8" y1="2.5" x2="8" y2="5" />
    <line x1="16" y1="2.5" x2="16" y2="5" />
    {/* Header line */}
    <line x1="3.5" y1="9.5" x2="20.5" y2="9.5" />
    {/* Date focal indicator */}
    <circle cx="12" cy="15" r="1.25" fill="currentColor" stroke="none" />
    <line x1="7.5" y1="15" x2="8.5" y2="15" />
    <line x1="15.5" y1="15" x2="16.5" y2="15" />
  </svg>
);

export const MemoryIcon = ({ size = 24, className = "", strokeWidth = 1.6, ...props }) => (
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
    {/* Knowledge loop path connecting context nodes */}
    <path d="M12 4.5L19.5 12L12 19.5L4.5 12Z" />
    {/* Inner cross-context link */}
    <path d="M8.5 8.5L15.5 15.5" opacity="0.45" />
    {/* 4 Connected network nodes */}
    <circle cx="12" cy="4.5" r="1.5" fill="currentColor" stroke="none" />
    <circle cx="19.5" cy="12" r="1.5" fill="currentColor" stroke="none" />
    <circle cx="12" cy="19.5" r="1.5" fill="currentColor" stroke="none" />
    <circle cx="4.5" cy="12" r="1.5" fill="currentColor" stroke="none" />
  </svg>
);

export const TasksIcon = ({ size = 24, className = "", strokeWidth = 1.6, ...props }) => (
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
    {/* Rounded task checkbox frame */}
    <rect x="3.5" y="3.5" width="17" height="17" rx="3.5" />
    {/* Precise checkmark stroke */}
    <polyline points="8 12.5 11 15.5 16.5 8.5" />
  </svg>
);

/**
 * Proprietary Regaarder Conversation Glyph
 * Metaphor: Speech bubble with an offset secondary dialogue curve and central Regaarder pulse node.
 */
export const ChatIcon = ({ size = 24, className = "", strokeWidth = 1.6, ...props }) => (
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
    {/* Secondary background dialogue echo curve */}
    <path d="M16 6.5A7.5 7.5 0 0 1 19.5 13c0 1.8-.7 3.4-1.8 4.6l.8 2.9-2.9-.8A7.5 7.5 0 0 1 12 20.5" opacity="0.4" />
    {/* Primary Regaarder speech bubble with refined tail */}
    <path d="M12 4.5A7.5 7.5 0 0 0 4.5 12c0 1.8.6 3.4 1.7 4.6l-.7 2.9 2.9-.7A7.4 7.4 0 0 0 12 19.5a7.5 7.5 0 0 0 7.5-7.5A7.5 7.5 0 0 0 12 4.5Z" />
    {/* Regaarder conversation focal node */}
    <circle cx="12" cy="12" r="0.85" fill="currentColor" stroke="none" />
  </svg>
);

/**
 * Proprietary Regaarder AI Assistance & Action Glyph
 * Metaphor: Compact intelligence spark lens + action execution arrow ("intelligence → action").
 * Concept: AI helping the user accomplish an action.
 */
export const AssistIcon = ({ size = 24, className = "", strokeWidth = 1.6, ...props }) => (
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
    {/* Compact curved 4-point intelligence spark lens */}
    <path d="M10.5 3.5C10.5 7 12 8.5 15.5 8.5C12 8.5 10.5 10 10.5 13.5C10.5 10 9 8.5 5.5 8.5C9 8.5 10.5 7 10.5 3.5Z" />
    {/* Focal intelligence core node */}
    <circle cx="10.5" cy="8.5" r="1" fill="currentColor" stroke="none" />
    {/* Action execution vector (intelligence guiding user action) */}
    <path d="M14 14L19.5 19.5" />
    <path d="M16 19.5H19.5V16" />
  </svg>
);

/**
 * Proprietary Regaarder Autonomous Agent Constellation Network Glyph
 * Metaphor: Central coordinator node linked to an orbital constellation of autonomous sub-agent nodes.
 * Reusable visual language for Regaarder AI Workflows and agentic execution (replacing generic sparkles).
 */
export const AgentsIcon = ({ size = 24, className = "", strokeWidth = 1.2, ...props }) => (
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
    {/* Apple-style primary 4-point AI spark diamond */}
    <path
      d="M12 3.5C12 7.5 13.5 9 17.5 9C13.5 9 12 10.5 12 14.5C12 10.5 10.5 9 6.5 9C10.5 9 12 7.5 12 3.5Z"
      fill="currentColor"
      fillOpacity="0.15"
    />
    {/* Micro satellite intelligence node */}
    <path
      d="M18.5 15.5C18.5 17 19.2 17.7 20.7 17.7C19.2 17.7 18.5 18.4 18.5 19.9C18.5 18.4 17.8 17.7 16.3 17.7C17.8 17.7 18.5 17 18.5 15.5Z"
      fill="currentColor"
      fillOpacity="0.25"
    />
    {/* Focal core center node */}
    <circle cx="12" cy="9" r="0.9" fill="currentColor" stroke="none" />
  </svg>
);

export const BrowserIcon = ({ size = 24, className = "", strokeWidth = 1.6, ...props }) => (
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
    {/* Global compass/web globe outer frame */}
    <circle cx="12" cy="12" r="8.5" />
    {/* Latitude equator divider */}
    <line x1="3.5" y1="12" x2="20.5" y2="12" />
    {/* Longitude meridian curve */}
    <path d="M12 3.5a12.5 12.5 0 0 1 0 17a12.5 12.5 0 0 1 0-17z" />
  </svg>
);

export const RegaarderProductIconMap = {
  Compose: ComposeIcon,
  Deck: DeckIcon,
  Sheet: SheetIcon,
  Room: RoomIcon,
  Whiteboard: WhiteboardIcon,
  Schedule: ScheduleIcon,
  Memory: MemoryIcon,
  Tasks: TasksIcon,
  Chat: ChatIcon,
  Assist: AssistIcon,
  Agents: AgentsIcon,
  Browser: BrowserIcon,
  compose: ComposeIcon,
  deck: DeckIcon,
  sheet: SheetIcon,
  sheets: SheetIcon,
  room: RoomIcon,
  whiteboard: WhiteboardIcon,
  schedule: ScheduleIcon,
  memory: MemoryIcon,
  tasks: TasksIcon,
  chat: ChatIcon,
  assist: AssistIcon,
  assistant: AssistIcon,
  agents: AgentsIcon,
  'ai-studio': AgentsIcon,
  browser: BrowserIcon,
};

export const RegaarderProductIcon = ({ name, size = 24, className = "", strokeWidth = 1.6, ...props }) => {
  const IconComponent = RegaarderProductIconMap[name] || ComposeIcon;
  return <IconComponent size={size} className={className} strokeWidth={strokeWidth} {...props} />;
};

export default RegaarderProductIcon;
