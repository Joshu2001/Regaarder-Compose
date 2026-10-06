import React from 'react';
import { AppNativeSvgIcon } from './home/AppNativeSvgIcon';

/**
 * FileTypeIcon.jsx
 *
 * Executive-tier semantic file-type badge system for Regaarder Workspace.
 * Distinguishes File/Object Identity (Layer 2) from UI/Navigation/Action Icons (Layer 1).
 *
 * Semantic color standards:
 * - Spreadsheets (XLSX, XLS, CSV, ODS): Green (#059669)
 * - PDF documents: Red (#DC2626)
 * - Word documents (DOCX, DOC): Blue (#2563EB)
 * - Presentations (PPTX, PPT, KEY): Orange/Amber (#D97706)
 * - Regaarder Native Documents (RGD / Compose): Regaarder Signature Purple (#7C3AED)
 * - Images (PNG, JPG, SVG, WEBP, GIF): Indigo (#4F46E5)
 * - Audio (MP3, WAV, M4A): Rose (#E11D48)
 * - Video (MP4, MOV, WEBM): Purple (#7C3AED)
 * - Code & Data (JSON, XML, TS, JS, PY): Teal (#0D9488)
 * - Plain Text / Markdown (TXT, MD): Slate (#64748B)
 */

export function getFileTypeDetails(fileOrEntity) {
  if (!fileOrEntity) {
    return {
      category: 'generic',
      label: 'FILE',
      bgHex: '#64748B',
      iconColor: 'text-slate-500 dark:text-zinc-400',
      isSpreadsheet: false,
      isPdf: false,
      isWord: false,
      isPresentation: false,
      isImage: false,
      isAudio: false,
      isVideo: false,
      isCode: false,
      isText: false,
      isRegaarderDoc: false
    };
  }

  // Handle string input (e.g. filename or extension)
  const name = typeof fileOrEntity === 'string'
    ? fileOrEntity
    : (fileOrEntity.name || fileOrEntity.title || fileOrEntity.filename || '').trim();

  const type = typeof fileOrEntity === 'object'
    ? (fileOrEntity.type || fileOrEntity.resourceType || fileOrEntity.workspace || fileOrEntity.category || '').toLowerCase()
    : '';

  const editorTarget = typeof fileOrEntity === 'object'
    ? (fileOrEntity.editorTarget || fileOrEntity.mode || '').toLowerCase()
    : '';

  const isRegaarderDocExplicit = typeof fileOrEntity === 'object' && Boolean(fileOrEntity.isRegaarderDoc);
  const isRegaarderSheetExplicit = typeof fileOrEntity === 'object' && Boolean(fileOrEntity.isRegaarderSheet);
  const isRegaarderDeckExplicit = typeof fileOrEntity === 'object' && Boolean(fileOrEntity.isRegaarderDeck);

  const nameLower = name.toLowerCase();
  const rawExt = nameLower.includes('.') ? nameLower.split('.').pop() : '';
  const ext = (rawExt || type || editorTarget || '').toLowerCase();

  // 1. Spreadsheets: XLSX, XLS, CSV, ODS, Sheets
  if (['xlsx', 'xls', 'csv', 'ods'].includes(ext) || type === 'sheet' || type === 'sheets' || editorTarget === 'sheets' || isRegaarderSheetExplicit) {
    const label = ext === 'csv' ? 'CSV' : (['xlsx', 'xls'].includes(ext) ? ext.toUpperCase() : 'XLSX');
    return {
      category: 'spreadsheet',
      label,
      bgHex: '#059669', // Emerald/Green
      iconColor: 'text-emerald-600 dark:text-emerald-400',
      isSpreadsheet: true,
      isPdf: false,
      isWord: false,
      isPresentation: false,
      isImage: false,
      isAudio: false,
      isVideo: false,
      isCode: false,
      isText: false,
      isRegaarderDoc: false
    };
  }

  // 2. PDF Documents: PDF
  if (ext === 'pdf' || type === 'pdf') {
    return {
      category: 'pdf',
      label: 'PDF',
      bgHex: '#DC2626', // Red
      iconColor: 'text-red-600 dark:text-red-400',
      isSpreadsheet: false,
      isPdf: true,
      isWord: false,
      isPresentation: false,
      isImage: false,
      isAudio: false,
      isVideo: false,
      isCode: false,
      isText: false,
      isRegaarderDoc: false
    };
  }

  // 3. Word Documents: DOC, DOCX
  if (['docx', 'doc', 'word'].includes(ext) || type === 'word' || type === 'docx' || type === 'doc') {
    return {
      category: 'word',
      label: ext === 'doc' ? 'DOC' : 'DOCX',
      bgHex: '#2563EB', // Blue
      iconColor: 'text-blue-600 dark:text-blue-400',
      isSpreadsheet: false,
      isPdf: false,
      isWord: true,
      isPresentation: false,
      isImage: false,
      isAudio: false,
      isVideo: false,
      isCode: false,
      isText: false,
      isRegaarderDoc: false
    };
  }

  // 4. Presentations: PPT, PPTX, KEY, Deck
  if (['pptx', 'ppt', 'key'].includes(ext) || type === 'deck' || type === 'decks' || type === 'presentation' || editorTarget === 'deck' || isRegaarderDeckExplicit) {
    const label = ['pptx', 'ppt'].includes(ext) ? ext.toUpperCase() : 'PPTX';
    return {
      category: 'presentation',
      label,
      bgHex: '#D97706', // Orange / Amber
      iconColor: 'text-amber-600 dark:text-amber-400',
      isSpreadsheet: false,
      isPdf: false,
      isWord: false,
      isPresentation: true,
      isImage: false,
      isAudio: false,
      isVideo: false,
      isCode: false,
      isText: false,
      isRegaarderDoc: false
    };
  }

  // 4b. Whiteboards / Canvases: Whiteboard
  if (type === 'whiteboard' || editorTarget === 'whiteboard' || ext === 'whiteboard' || type === 'canvas') {
    return {
      category: 'whiteboard',
      label: 'CANVAS',
      bgHex: '#4F46E5', // Indigo
      iconColor: 'text-indigo-600 dark:text-indigo-400',
      isSpreadsheet: false,
      isPdf: false,
      isWord: false,
      isPresentation: false,
      isImage: false,
      isAudio: false,
      isVideo: false,
      isCode: false,
      isText: false,
      isRegaarderDoc: false,
      isWhiteboard: true
    };
  }

  // 5. Images: PNG, JPG, JPEG, SVG, WEBP, GIF, BMP, TIFF
  if (['png', 'jpg', 'jpeg', 'svg', 'webp', 'gif', 'bmp', 'tiff'].includes(ext) || type.includes('image')) {
    const label = ['png', 'jpg', 'svg', 'gif'].includes(ext) ? ext.toUpperCase() : 'IMG';
    return {
      category: 'image',
      label,
      bgHex: '#4F46E5', // Indigo
      iconColor: 'text-indigo-600 dark:text-indigo-400',
      isSpreadsheet: false,
      isPdf: false,
      isWord: false,
      isPresentation: false,
      isImage: true,
      isAudio: false,
      isVideo: false,
      isCode: false,
      isText: false,
      isRegaarderDoc: false
    };
  }

  // 6. Audio: MP3, WAV, M4A, OGG, AAC, FLAC
  if (['mp3', 'wav', 'm4a', 'ogg', 'aac', 'flac'].includes(ext) || type.includes('audio')) {
    return {
      category: 'audio',
      label: 'AUDIO',
      bgHex: '#E11D48', // Rose
      iconColor: 'text-rose-600 dark:text-rose-400',
      isSpreadsheet: false,
      isPdf: false,
      isWord: false,
      isPresentation: false,
      isImage: false,
      isAudio: true,
      isVideo: false,
      isCode: false,
      isText: false,
      isRegaarderDoc: false
    };
  }

  // 7. Video: MP4, MOV, WEBM, MKV, AVI
  if (['mp4', 'mov', 'webm', 'mkv', 'avi'].includes(ext) || type.includes('video')) {
    return {
      category: 'video',
      label: 'VIDEO',
      bgHex: '#7C3AED', // Regaarder Purple
      iconColor: 'text-violet-600 dark:text-violet-400',
      isSpreadsheet: false,
      isPdf: false,
      isWord: false,
      isPresentation: false,
      isImage: false,
      isAudio: false,
      isVideo: true,
      isCode: false,
      isText: false,
      isRegaarderDoc: false
    };
  }

  // 8. Code & Data: JSON, XML, JS, TS, JSX, TSX, HTML, CSS, PY, RS, GO, SH
  if (['json', 'xml', 'yaml', 'yml', 'js', 'ts', 'jsx', 'tsx', 'html', 'css', 'py', 'rs', 'go', 'sh', 'sql'].includes(ext) || type.includes('code')) {
    return {
      category: 'code',
      label: ext.toUpperCase().slice(0, 4) || 'CODE',
      bgHex: '#0D9488', // Teal
      iconColor: 'text-teal-600 dark:text-teal-400',
      isSpreadsheet: false,
      isPdf: false,
      isWord: false,
      isPresentation: false,
      isImage: false,
      isAudio: false,
      isVideo: false,
      isCode: true,
      isText: false,
      isRegaarderDoc: false
    };
  }

  // 9. Plain Text / Markdown: TXT, MD, LOG
  if (['txt', 'md', 'log', 'text', 'markdown'].includes(ext) || type === 'text') {
    return {
      category: 'text',
      label: ext === 'md' ? 'MD' : 'TXT',
      bgHex: '#64748B', // Slate
      iconColor: 'text-slate-600 dark:text-zinc-400',
      isSpreadsheet: false,
      isPdf: false,
      isWord: false,
      isPresentation: false,
      isImage: false,
      isAudio: false,
      isVideo: false,
      isCode: false,
      isText: true,
      isRegaarderDoc: false
    };
  }

  // 10. Native Regaarder Compose Document (DOC / RGD) -> Signature Purple
  if (
    type === 'compose' ||
    type === 'document' ||
    type === 'documents' ||
    editorTarget === 'compose' ||
    isRegaarderDocExplicit ||
    ext === 'rgdoc' ||
    ext === 'compose'
  ) {
    return {
      category: 'regaarder_doc',
      label: 'DOC',
      bgHex: '#7C3AED', // Regaarder Signature Purple
      iconColor: 'text-violet-600 dark:text-violet-400',
      isSpreadsheet: false,
      isPdf: false,
      isWord: false,
      isPresentation: false,
      isImage: false,
      isAudio: false,
      isVideo: false,
      isCode: false,
      isText: false,
      isRegaarderDoc: true
    };
  }

  // 11. Generic fallback
  return {
    category: 'generic',
    label: (rawExt ? rawExt.slice(0, 4).toUpperCase() : 'FILE'),
    bgHex: '#64748B',
    iconColor: 'text-slate-600 dark:text-zinc-400',
    isSpreadsheet: false,
    isPdf: false,
    isWord: false,
    isPresentation: false,
    isImage: false,
    isAudio: false,
    isVideo: false,
    isCode: false,
    isText: false,
    isRegaarderDoc: false
  };
}

/**
 * Checks if an entity represents an external file or document artifact
 * (as opposed to a UI object like a Task, Person, Meeting, or Browser History).
 */
export function isFileTypeEntity(entity) {
  if (!entity) return false;
  const type = (entity.type || entity.resourceType || '').toLowerCase();
  const editorTarget = (entity.editorTarget || entity.mode || '').toLowerCase();
  const workspace = (entity.workspace || '').toLowerCase();
  const title = (entity.title || entity.name || '').toLowerCase();

  // Specific non-file UI objects that have their own dedicated icons
  if (
    type === 'task' ||
    workspace === 'tasks' ||
    type === 'person' ||
    workspace === 'people' ||
    type === 'meeting' ||
    workspace === 'room' ||
    type === 'room_note' ||
    type === 'message' ||
    workspace === 'relay' ||
    type === 'chat' ||
    workspace === 'chat' ||
    type === 'browser_history' ||
    workspace === 'browser-history' ||
    type === 'schedule_event' ||
    workspace === 'schedule'
  ) {
    return false;
  }

  // If title has a known file extension, it's definitely a file
  if (/\.(xlsx?|csv|ods|pdf|docx?|pptx?|key|txt|md|png|jpe?g|svg|webp|mp[34]|mov|json|html)$/i.test(title)) {
    return true;
  }

  // Explicit document / sheet / deck / whiteboard editors or workspaces
  if (['compose', 'sheets', 'deck', 'whiteboard', 'document', 'sheet'].includes(editorTarget) || ['compose', 'sheets', 'deck', 'whiteboard'].includes(workspace)) {
    return true;
  }
  if (['document', 'sheet', 'deck', 'whiteboard', 'pdf', 'word', 'file', 'attachment', 'compose'].includes(type)) {
    return true;
  }
  if (entity.isRegaarderDoc || entity.isRegaarderSheet || entity.isRegaarderDeck || entity.isUploadedFile) {
    return true;
  }

  // Specific non-file types that use UI icons
  if (['task', 'person', 'meeting', 'room', 'room_note', 'message', 'relay', 'chat', 'browser_history', 'schedule_event'].includes(type)) {
    return false;
  }

  return false;
}

/**
 * Internal Vector Glyphs for File-Type Badges
 */
function FileBadgeSvg({ details, sizeVariant }) {
  const iconClass = sizeVariant === 'lg'
    ? 'w-3.5 h-3.5 text-white'
    : sizeVariant === 'md'
      ? 'w-3 h-3 text-white'
      : sizeVariant === 'sm'
        ? 'w-2.5 h-2.5 text-white'
        : 'w-2 h-2 text-white';

  if (details.isSpreadsheet) {
    return (
      <svg className={iconClass} viewBox="0 0 16 16" fill="none" xmlns="http://www.w3.org/2000/svg">
        <rect x="2" y="2" width="12" height="12" rx="2" stroke="currentColor" strokeWidth="1.5" />
        <path d="M2 6H14" stroke="currentColor" strokeWidth="1.2" />
        <path d="M2 10H14" stroke="currentColor" strokeWidth="1.2" />
        <path d="M6 6V14" stroke="currentColor" strokeWidth="1.2" />
      </svg>
    );
  }

  if (details.isPdf) {
    return (
      <svg className={iconClass} viewBox="0 0 16 16" fill="none" xmlns="http://www.w3.org/2000/svg">
        <path d="M3.5 2H10L13.5 5.5V13.5C13.5 14.05 13.05 14.5 12.5 14.5H3.5C2.95 14.5 2.5 14.05 2.5 13.5V3C2.5 2.45 2.95 2 3.5 2Z" stroke="currentColor" strokeWidth="1.5" />
        <path d="M9.5 2V5.5H13.5" stroke="currentColor" strokeWidth="1.2" />
        <path d="M5 10H11" stroke="currentColor" strokeWidth="1.2" strokeLinecap="round" />
      </svg>
    );
  }

  if (details.isPresentation) {
    return (
      <svg className={iconClass} viewBox="0 0 16 16" fill="none" xmlns="http://www.w3.org/2000/svg">
        <rect x="2" y="2.5" width="12" height="8.5" rx="1.8" stroke="currentColor" strokeWidth="1.5" />
        <path d="M5.5 14L8 11L10.5 14" stroke="currentColor" strokeWidth="1.2" strokeLinecap="round" strokeLinejoin="round" />
        <path d="M5 6.5H11" stroke="currentColor" strokeWidth="1.2" strokeLinecap="round" />
      </svg>
    );
  }

  if (details.isWhiteboard) {
    return (
      <svg className={iconClass} viewBox="0 0 16 16" fill="none" xmlns="http://www.w3.org/2000/svg">
        <rect x="2" y="2.5" width="12" height="9" rx="2" stroke="currentColor" strokeWidth="1.5" />
        <path d="M5 14L4.2 11.5M11 14L11.8 11.5" stroke="currentColor" strokeWidth="1.2" strokeLinecap="round" />
        <path d="M4.5 8.5L7 6L9.5 8.5L11.5 6.5" stroke="currentColor" strokeWidth="1.2" strokeLinecap="round" strokeLinejoin="round" />
      </svg>
    );
  }

  if (details.isImage) {
    return (
      <svg className={iconClass} viewBox="0 0 16 16" fill="none" xmlns="http://www.w3.org/2000/svg">
        <rect x="2" y="2.5" width="12" height="11" rx="1.8" stroke="currentColor" strokeWidth="1.5" />
        <circle cx="5.5" cy="6" r="1.2" fill="currentColor" />
        <path d="M2.5 12L6.5 8L10 11.5L11.5 10L13.5 12" stroke="currentColor" strokeWidth="1.2" strokeLinecap="round" strokeLinejoin="round" />
      </svg>
    );
  }

  if (details.isAudio) {
    return (
      <svg className={iconClass} viewBox="0 0 16 16" fill="none" xmlns="http://www.w3.org/2000/svg">
        <line x1="3" y1="8" x2="3" y2="8.01" stroke="currentColor" strokeWidth="2" strokeLinecap="round" />
        <line x1="6" y1="5" x2="6" y2="11" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round" />
        <line x1="9" y1="3" x2="9" y2="13" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round" />
        <line x1="12" y1="6" x2="12" y2="10" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round" />
      </svg>
    );
  }

  if (details.isVideo) {
    return (
      <svg className={iconClass} viewBox="0 0 16 16" fill="none" xmlns="http://www.w3.org/2000/svg">
        <rect x="2" y="3.5" width="9.5" height="9" rx="1.5" stroke="currentColor" strokeWidth="1.5" />
        <polygon points="11.5,6.5 14.5,4.5 14.5,11.5 11.5,9.5" fill="currentColor" />
      </svg>
    );
  }

  if (details.isCode) {
    return (
      <svg className={iconClass} viewBox="0 0 16 16" fill="none" xmlns="http://www.w3.org/2000/svg">
        <polyline points="5.5 5 2.5 8 5.5 11" stroke="currentColor" strokeWidth="1.4" strokeLinecap="round" strokeLinejoin="round" />
        <polyline points="10.5 5 13.5 8 10.5 11" stroke="currentColor" strokeWidth="1.4" strokeLinecap="round" strokeLinejoin="round" />
      </svg>
    );
  }

  // Document (Word, Native Doc, or generic file)
  return (
    <svg className={iconClass} viewBox="0 0 16 16" fill="none" xmlns="http://www.w3.org/2000/svg">
      <path d="M3.5 2H10.5L13.5 5V13.5C13.5 14.05 13.05 14.5 12.5 14.5H3.5C2.95 14.5 2.5 14.05 2.5 13.5V3C2.5 2.45 2.95 2 3.5 2Z" stroke="currentColor" strokeWidth="1.5" />
      <path d="M10 2V5.5H13.5" stroke="currentColor" strokeWidth="1.2" />
      <line x1="5" y1="8" x2="11" y2="8" stroke="currentColor" strokeWidth="1.2" strokeLinecap="round" />
      <line x1="5" y1="11" x2="9" y2="11" stroke="currentColor" strokeWidth="1.2" strokeLinecap="round" />
    </svg>
  );
}

/**
 * FileTypeIcon
 *
 * Props:
 * - `file`: file object, entity, or filename string
 * - `size`: 'xs' (24x28), 'sm' (28x34), 'md' (32x38), 'lg' (40x48)
 * - `className`: additional CSS classes
 */
export function FileTypeIcon({
  file,
  size = 'sm',
  className = '',
  overrideBgHex = null,
  title = null
}) {
  const details = getFileTypeDetails(file);

  // Map size prop to numerical pixel size for the dimensional 2D icon
  const pixelSize = typeof size === 'number'
    ? size
    : size === 'lg'
      ? 36
      : size === 'md'
        ? 28
        : size === 'xs'
          ? 20
          : 24;

  // Determine if this file maps directly to one of Regaarder's dimensional 2D product icons
  const mappedProductType = details.isSpreadsheet
    ? 'sheet'
    : details.isPdf
      ? 'pdf'
      : details.isPresentation
        ? 'deck'
        : details.isWhiteboard
          ? 'whiteboard'
          : details.isRegaarderDoc || details.isWord
            ? 'compose'
            : null;

  if (mappedProductType && !overrideBgHex) {
    return (
      <div className={`inline-flex items-center justify-center shrink-0 ${className}`} title={title || `${details.label || 'Document'}`}>
        <AppNativeSvgIcon type={mappedProductType} size={pixelSize} />
      </div>
    );
  }

  const bgColor = overrideBgHex || details.bgHex;
  const displayLabel = details.label || 'FILE';
  const isLongLabel = displayLabel.length > 4;

  // Size configurations: calibrated proportions with slightly elevated height for breathing room
  let containerStyles = 'w-[28px] h-[34px] rounded-[6px] shadow-2xs';
  let labelStyles = `${isLongLabel ? 'text-[5.5px] tracking-tighter' : 'text-[6.5px] tracking-tight'} font-bold uppercase mb-[1px] leading-none`;

  if (size === 'lg') {
    containerStyles = 'w-10 h-12 rounded-xl shadow-xs';
    labelStyles = `${isLongLabel ? 'text-[8.5px] tracking-tight' : 'text-[9.5px] tracking-tight'} font-black uppercase mb-1 leading-none`;
  } else if (size === 'md') {
    containerStyles = 'w-[32px] h-[38px] rounded-lg shadow-2xs';
    labelStyles = `${isLongLabel ? 'text-[7px] tracking-tighter' : 'text-[8px] tracking-tight'} font-bold uppercase mb-[1.5px] leading-none`;
  } else if (size === 'xs') {
    containerStyles = 'w-[24px] h-[28px] rounded-[5px] shadow-2xs';
    labelStyles = `${isLongLabel ? 'text-[4.5px] tracking-tighter' : 'text-[5.5px] tracking-tight'} font-bold uppercase mb-[0.5px] leading-none`;
  }

  return (
    <div
      className={`flex flex-col items-center justify-center text-white shrink-0 relative overflow-hidden select-none transition-transform ${containerStyles} ${className}`}
      style={{ backgroundColor: bgColor }}
      title={title || `${displayLabel} Document`}
    >
      <span className={`text-white select-none pointer-events-none ${labelStyles}`}>
        {displayLabel}
      </span>
      <FileBadgeSvg details={details} sizeVariant={size} />
    </div>
  );
}

export default FileTypeIcon;
