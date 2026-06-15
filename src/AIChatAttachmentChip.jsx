import React from 'react';

/**
 * Renders a small chip representing an attached file.
 * Props:
 *  - file: { name: string, type: string, url?: string }
 *  - onRemove: () => void
 */
export default function AttachmentChip({ file, onRemove }) {
  return (
    <div className="attachment-chip" style={styles.chip}>
      <span style={styles.name}>{file.name}</span>
      <button
        type="button"
        aria-label="Remove attachment"
        onClick={onRemove}
        style={styles.removeButton}
      >
        ×
      </button>
    </div>
  );
}

const styles = {
  chip: {
    display: 'inline-flex',
    alignItems: 'center',
    background: 'rgba(255,255,255,0.9)',
    borderRadius: '4px',
    padding: '2px 6px',
    margin: '2px',
    boxShadow: '0 1px 3px rgba(0,0,0,0.1)',
    fontSize: '0.85rem',
  },
  name: {
    marginRight: '4px',
    maxWidth: '120px',
    overflow: 'hidden',
    textOverflow: 'ellipsis',
    whiteSpace: 'nowrap',
  },
  removeButton: {
    background: 'transparent',
    border: 'none',
    cursor: 'pointer',
    fontSize: '1rem',
    lineHeight: 1,
    color: '#888',
  },
};
