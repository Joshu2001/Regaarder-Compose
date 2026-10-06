import React from 'react';
import { X, ExternalLink } from 'lucide-react';

export default function MediaLightboxModal({
  isOpen,
  media, // { type: 'image' | 'video', url, name, size }
  onClose,
}) {
  if (!isOpen || !media) return null;

  return (
    <div
      role="dialog"
      aria-modal="true"
      aria-label="Media preview"
      className="fixed inset-0 z-[999999] flex items-center justify-center p-4 bg-black/80 backdrop-blur-sm select-none animate-in fade-in duration-150 font-sans"
      onClick={onClose}
    >
      <div
        className="relative max-w-4xl max-h-[88vh] w-full flex flex-col items-center justify-center bg-[#18181c] rounded-2xl border border-white/10 shadow-2xl overflow-hidden p-3 animate-in zoom-in-95 duration-150"
        onClick={(e) => e.stopPropagation()}
      >
        {/* Header bar */}
        <div className="w-full flex items-center justify-between pb-2 px-2 text-xs text-zinc-300 border-b border-white/10">
          <span className="font-medium truncate max-w-xs">{media.name}</span>
          <div className="flex items-center gap-2">
            {media.size && <span className="text-[11px] text-zinc-500">{media.size}</span>}
            <button
              type="button"
              onClick={onClose}
              className="p-1 rounded-lg text-zinc-400 hover:text-white hover:bg-white/10 transition-colors cursor-pointer border-none bg-transparent"
              aria-label="Close preview"
            >
              <X size={16} />
            </button>
          </div>
        </div>

        {/* Content container */}
        <div className="w-full flex items-center justify-center p-2 min-h-[250px] max-h-[75vh] overflow-auto">
          {media.type === 'video' ? (
            <video
              src={media.url}
              controls
              autoPlay
              className="max-h-[70vh] max-w-full rounded-lg shadow-md outline-none bg-black"
            />
          ) : (
            <img
              src={media.url}
              alt={media.name || 'Screenshot'}
              className="max-h-[70vh] max-w-full object-contain rounded-lg shadow-md"
            />
          )}
        </div>
      </div>
    </div>
  );
}
