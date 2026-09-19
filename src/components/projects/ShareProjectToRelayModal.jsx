import React, { useState, useMemo } from 'react';
import { Search, X, Send, Check, Users, Folder } from 'lucide-react';
import { getRegistryUsers } from '../../services/relayAccountService';
import { RegaarderAiIcon } from '../RegaarderProductIcons';
import { getProjectIconComponent } from './CreateProjectModal';

/**
 * ShareProjectToRelayModal
 *
 * An executive, Apple-style modal dialog that allows the user to share a project
 * directly to a contact, team channel, or AI assistant thread in Regaarder Relay.
 */
export default function ShareProjectToRelayModal({
  isOpen,
  project,
  conversations = [],
  threads = [],
  onClose,
  onSendShare
}) {
  const [searchQuery, setSearchQuery] = useState('');
  const [selectedRecipientIds, setSelectedRecipientIds] = useState([]);
  const [shareNote, setShareNote] = useState('');

  // Read available contacts from Relay state and persistent registry
  const recipientList = useMemo(() => {
    const map = new Map();

    // 1. Current Relay conversations
    (conversations || []).forEach((c) => {
      map.set(c.id, {
        id: c.id,
        name: c.name || 'Conversation',
        avatar: c.avatar || (c.name ? c.name.slice(0, 2).toUpperCase() : 'DM'),
        isGroup: c.isGroup || false,
        isAi: c.isAi || false,
        role: c.isAi ? 'AI Assistant' : c.isGroup ? 'Group' : 'Direct Contact',
        color: c.avatarColor || null
      });
    });

    // 2. Relay threads / channels
    (threads || []).forEach((t) => {
      if (!map.has(t.id)) {
        map.set(t.id, {
          id: t.id,
          name: t.name || t.title || 'Conversation',
          avatar: t.avatar || (t.name ? t.name.slice(0, 2).toUpperCase() : 'TH'),
          isGroup: t.isGroup || t.type === 'channel' || false,
          isAi: t.isAi || false,
          role: t.type === 'channel' ? 'Team Channel' : 'Thread',
          color: null
        });
      }
    });

    // 3. Registered Relay directory users
    try {
      const registryUsers = getRegistryUsers();
      (registryUsers || []).forEach((u) => {
        if (!map.has(u.id)) {
          map.set(u.id, {
            id: u.id,
            name: u.displayName || u.email || 'Teammate',
            avatar: (u.displayName || 'U').slice(0, 2).toUpperCase(),
            isGroup: false,
            isAi: false,
            role: u.handle || 'Teammate',
            color: u.avatarColor || null
          });
        }
      });
    } catch (_) {}

    // Fallback: Default AI Assistant if empty
    if (map.size === 0) {
      map.set('chat-assistant', {
        id: 'chat-assistant',
        name: 'Assistant',
        avatar: 'AI',
        isGroup: false,
        isAi: true,
        role: 'AI Assistant',
        color: '#7C3AED'
      });
    }

    const list = Array.from(map.values());
    if (!searchQuery.trim()) return list;
    const q = searchQuery.trim().toLowerCase();
    return list.filter(
      (item) =>
        item.name.toLowerCase().includes(q) ||
        item.role.toLowerCase().includes(q)
    );
  }, [conversations, threads, searchQuery]);

  // Pre-select first recipient if none selected yet and modal opens
  React.useEffect(() => {
    if (isOpen) {
      if (recipientList.length > 0 && selectedRecipientIds.length === 0) {
        setSelectedRecipientIds([recipientList[0].id]);
      }
    } else {
      setSelectedRecipientIds([]);
      setSearchQuery('');
      setShareNote('');
    }
  }, [isOpen, recipientList]);

  if (!isOpen || !project) return null;

  const toggleRecipient = (id) => {
    setSelectedRecipientIds((prev) =>
      prev.includes(id) ? prev.filter((item) => item !== id) : [...prev, id]
    );
  };

  const handleSend = () => {
    if (selectedRecipientIds.length === 0) return;
    const selectedRecipients = recipientList.filter((r) =>
      selectedRecipientIds.includes(r.id)
    );
    if (onSendShare) {
      onSendShare({
        recipientIds: selectedRecipientIds,
        recipients: selectedRecipients,
        project,
        note: shareNote.trim()
      });
    }
  };

  return (
    <div
      className="fixed inset-0 z-[1200] bg-black/40 backdrop-blur-xs flex items-center justify-center p-4 animate-in fade-in duration-150 select-none font-sans"
      onPointerDown={(e) => {
        if (e.target === e.currentTarget) {
          onClose();
        }
      }}
    >
      <div
        className="w-full max-w-md bg-white dark:bg-zinc-850 rounded-2xl shadow-2xl border border-black/[0.08] dark:border-white/[0.1] overflow-hidden flex flex-col max-h-[88vh] animate-in zoom-in-95 duration-150"
        onPointerDown={(e) => e.stopPropagation()}
      >
        {/* Modal Header */}
        <div className="px-5 py-4 border-b border-black/[0.06] dark:border-white/[0.08] flex items-center justify-between">
          <div>
            <h3 className="text-sm font-bold text-slate-900 dark:text-zinc-100">
              Share project to Relay
            </h3>
            <p className="text-[11px] text-slate-500 dark:text-zinc-400">
              Select who you want to share this project with
            </p>
          </div>
          <button
            type="button"
            onClick={onClose}
            className="p-1.5 rounded-lg text-slate-400 hover:text-slate-600 dark:hover:text-zinc-200 hover:bg-black/[0.04] transition-colors cursor-pointer border-none bg-transparent"
          >
            <X size={16} />
          </button>
        </div>

        {/* Project Preview Snippet */}
        <div className="p-3 mx-4 mt-3 rounded-xl bg-slate-50 dark:bg-zinc-800/60 border border-slate-200/80 dark:border-white/[0.06] flex items-center gap-3">
          {(() => {
            const IconComp = getProjectIconComponent(project.icon);
            return (
              <div className="w-8 h-8 rounded-lg flex items-center justify-center shrink-0">
                <IconComp
                  size={20}
                  strokeWidth={1.6}
                  style={{
                    color: project.color || '#7C3AED',
                    fill: project.color || '#7C3AED'
                  }}
                />
              </div>
            );
          })()}
          <div className="min-w-0 flex-1">
            <div className="flex items-center gap-2">
              <h4 className="text-xs font-semibold text-slate-900 dark:text-zinc-100 truncate">
                {project.name}
              </h4>
              <span className="text-[10px] font-medium px-1.5 py-0.5 rounded bg-slate-200/70 dark:bg-zinc-700 text-slate-600 dark:text-zinc-300">
                Project
              </span>
            </div>
            <p className="text-[11px] text-slate-500 dark:text-zinc-400 truncate mt-0.5">
              {project.description || project.customInstructions || 'Workspace project container'}
            </p>
          </div>
        </div>

        {/* Search Recipients */}
        <div className="px-4 py-2.5 border-b border-black/[0.04] dark:border-white/[0.06]">
          <div className="relative flex items-center">
            <Search
              size={14}
              className="absolute left-3.5 text-slate-400 pointer-events-none"
            />
            <input
              type="text"
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              placeholder="Search contacts, channels, or AI assistants..."
              className="w-full h-9 pl-10 pr-3.5 rounded-xl bg-slate-100/80 dark:bg-zinc-800/80 text-xs text-slate-800 dark:text-zinc-100 placeholder:text-slate-400/90 focus:outline-none focus:ring-2 focus:ring-slate-300 dark:focus:ring-zinc-600 border border-transparent focus:border-slate-200 dark:focus:border-zinc-700 transition-all"
            />
          </div>
        </div>

        {/* Recipient Picker List */}
        <div className="flex-1 overflow-y-auto px-4 py-2 space-y-1 max-h-56 thin-scrollbar">
          {recipientList.length === 0 ? (
            <div className="py-8 text-center text-slate-400 dark:text-zinc-500">
              <Users size={22} className="mx-auto mb-1.5 opacity-30" />
              <p className="text-xs font-semibold">No recipients found</p>
              <p className="text-[11px]">Try searching with a different name</p>
            </div>
          ) : (
            recipientList.map((recipient) => {
              const isSelected = selectedRecipientIds.includes(recipient.id);
              return (
                <div
                  key={recipient.id}
                  onClick={() => toggleRecipient(recipient.id)}
                  className={`flex items-center justify-between p-2 rounded-xl cursor-pointer transition-colors ${
                    isSelected
                      ? 'bg-slate-100/90 dark:bg-zinc-800 text-slate-900 dark:text-zinc-100'
                      : 'hover:bg-black/[0.03] dark:hover:bg-white/[0.04] text-slate-700 dark:text-zinc-300'
                  }`}
                >
                  <div className="flex items-center gap-2.5 min-w-0">
                    <div
                      className={`w-7 h-7 rounded-full flex items-center justify-center font-bold text-[11px] shrink-0 ${
                        recipient.isAi
                          ? 'bg-slate-900 dark:bg-zinc-100 text-white dark:text-zinc-900'
                          : recipient.color
                          ? 'text-white'
                          : 'bg-slate-200 dark:bg-zinc-700 text-slate-700 dark:text-zinc-200'
                      }`}
                      style={
                        !recipient.isAi && recipient.color
                          ? { backgroundColor: recipient.color }
                          : undefined
                      }
                    >
                      {recipient.isAi ? (
                        <RegaarderAiIcon size={13} strokeWidth={1.8} />
                      ) : (
                        recipient.avatar
                      )}
                    </div>
                    <div className="min-w-0">
                      <p className="text-xs font-medium truncate leading-tight">
                        {recipient.name}
                      </p>
                      <p className="text-[10px] text-slate-400 dark:text-zinc-500 truncate">
                        {recipient.role}
                      </p>
                    </div>
                  </div>

                  <div
                    className={`w-4 h-4 rounded-md border flex items-center justify-center transition-colors ${
                      isSelected
                        ? 'bg-slate-900 dark:bg-zinc-100 border-slate-900 dark:border-zinc-100 text-white dark:text-zinc-900'
                        : 'border-slate-300 dark:border-zinc-600 bg-white dark:bg-zinc-800'
                    }`}
                  >
                    {isSelected && <Check size={10} strokeWidth={3} />}
                  </div>
                </div>
              );
            })
          )}
        </div>

        {/* Optional Note / Message Input */}
        <div className="px-4 py-2.5 border-t border-black/[0.04] dark:border-white/[0.06]">
          <input
            type="text"
            value={shareNote}
            onChange={(e) => setShareNote(e.target.value)}
            placeholder="Add an optional message..."
            className="w-full px-3 py-1.5 rounded-xl bg-slate-100 dark:bg-zinc-800 text-xs text-slate-800 dark:text-zinc-100 placeholder:text-slate-400 focus:outline-none focus:ring-2 focus:ring-slate-300 dark:focus:ring-zinc-600"
          />
        </div>

        {/* Footer Actions */}
        <div className="p-3.5 border-t border-black/[0.06] dark:border-white/[0.08] bg-slate-50/50 dark:bg-zinc-800/40 flex items-center justify-between gap-3">
          <div className="text-[11px] text-slate-500 dark:text-zinc-400 truncate max-w-[200px]">
            {selectedRecipientIds.length === 0 ? (
              <span>Select who to send to</span>
            ) : (
              <span className="font-medium text-slate-700 dark:text-zinc-300">
                {selectedRecipientIds.length} recipient
                {selectedRecipientIds.length > 1 ? 's' : ''} selected
              </span>
            )}
          </div>

          <div className="flex items-center gap-2">
            <button
              type="button"
              onClick={onClose}
              className="px-3 py-1.5 rounded-xl text-xs font-medium text-slate-600 dark:text-zinc-400 hover:bg-black/[0.05] transition-colors cursor-pointer border-none bg-transparent"
            >
              Cancel
            </button>
            <button
              type="button"
              disabled={selectedRecipientIds.length === 0}
              onClick={handleSend}
              className="flex items-center gap-1.5 px-4 py-1.5 rounded-xl text-xs font-semibold bg-slate-900 hover:bg-slate-800 dark:bg-zinc-100 dark:hover:bg-white dark:text-zinc-900 disabled:opacity-40 disabled:cursor-not-allowed text-white shadow-xs transition-all cursor-pointer border-none"
            >
              <Send size={12} />
              <span>Share</span>
            </button>
          </div>
        </div>
      </div>
    </div>
  );
}
