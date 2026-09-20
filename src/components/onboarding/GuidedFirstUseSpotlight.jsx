import React, { useState, useEffect, useCallback } from 'react';
import { createPortal } from 'react-dom';
import { ArrowRight, Check, X, Sparkles, FolderOpen, Video, Plus, Search, Upload } from 'lucide-react';
import { RegaarderAiIcon } from '../RegaarderProductIcons';

/**
 * GuidedFirstUseSpotlight
 * 
 * Implements the core onboarding directive:
 * "Transition the user into the ACTUAL Regaarder UI and guide them through a small,
 * meaningful first task using the real interface and real components."
 * 
 * Features:
 * - Real DOM element anchoring via getBoundingClientRect()
 * - Apple-style subtle purple/violet outline & spotlight aura
 * - Non-blocking pointer events on target element so user can directly click the REAL button
 * - Automatic step progression on target click or interaction
 * - Contextual instruction callout anchored dynamically to target element
 */
export default function GuidedFirstUseSpotlight({
  intent = 'create', // 'create' | 'organize' | 'plan' | 'research' | 'collaborate'
  stepIndex = 0,
  onComplete,
  onDismiss,
  customTitle = ''
}) {
  const [targetRect, setTargetRect] = useState(null);
  const [isDismissed, setIsDismissed] = useState(false);

  // Configuration for each guided intent flow
  const intentConfig = {
    create: {
      title: 'Create something',
      badge: 'Step 1 of 2',
      headline: 'Start with Docs',
      instruction: 'Click Docs to open your clean composition workspace.',
      targetSelector: '[data-onboarding-target="quick-create-compose"]',
      fallbackSelector: '[data-onboarding-target="quick-create-compose"], button:has(div:contains("Docs"))',
      nextActionNote: 'Next: Summon AI agents anywhere with / or start writing directly.'
    },
    organize: {
      title: 'Bring my work together',
      badge: 'Step 1 of 2',
      headline: 'Universal Ingestion',
      instruction: 'Drag files here or click to import documents into Universal Memory.',
      targetSelector: '[data-onboarding-target="omni-dropzone"]',
      nextActionNote: 'Regaarder automatically indexes and cross-references your files.'
    },
    plan: {
      title: 'Plan and execute a project',
      badge: 'Step 1 of 2',
      headline: 'Create your first project',
      instruction: 'Click "New project" to set up deliverables, milestones, and goals.',
      targetSelector: '[data-onboarding-target="new-project-button"]',
      nextActionNote: 'Track milestones, tasks, and deadlines in one cohesive roadmap.'
    },
    research: {
      title: 'Research or understand something',
      badge: 'Step 1 of 2',
      headline: 'Deep Research with Orb',
      instruction: 'Type your research question to investigate sources across web and memory.',
      targetSelector: '[data-onboarding-target="orb-search-input"]',
      nextActionNote: 'Orb synthesizes citations and writes structured briefings.'
    },
    collaborate: {
      title: 'Work with others',
      badge: 'Step 1 of 2',
      headline: 'Start a collaborative room',
      instruction: 'Click "Start now" to launch an instant room with live AI transcription.',
      targetSelector: '[data-onboarding-target="room-start-now"]',
      nextActionNote: 'Collaborate with video, shared canvas, and live meeting notes.'
    }
  };

  const currentConfig = intentConfig[intent] || intentConfig.create;

  // Track target element position dynamically
  const updateTargetRect = useCallback(() => {
    if (!currentConfig.targetSelector) return;
    const el = document.querySelector(currentConfig.targetSelector);
    if (el) {
      const rect = el.getBoundingClientRect();
      if (rect.width > 0 && rect.height > 0) {
        setTargetRect(rect);
      }
    }
  }, [currentConfig.targetSelector]);

  useEffect(() => {
    updateTargetRect();
    const interval = setInterval(updateTargetRect, 250);
    window.addEventListener('resize', updateTargetRect);
    window.addEventListener('scroll', updateTargetRect, true);

    return () => {
      clearInterval(interval);
      window.removeEventListener('resize', updateTargetRect);
      window.removeEventListener('scroll', updateTargetRect, true);
    };
  }, [updateTargetRect]);

  // Listen for interaction on the target element
  useEffect(() => {
    if (!currentConfig.targetSelector) return;
    const el = document.querySelector(currentConfig.targetSelector);
    if (!el) return;

    const handleTargetClick = () => {
      // User clicked the real element! Progress after short natural transition
      setTimeout(() => {
        if (typeof onComplete === 'function') {
          onComplete();
        }
      }, 400);
    };

    el.addEventListener('click', handleTargetClick, { once: true });
    return () => {
      el.removeEventListener('click', handleTargetClick);
    };
  }, [currentConfig.targetSelector, onComplete, targetRect]);

  if (isDismissed || !targetRect) return null;

  // Compute callout positioning avoiding viewport overflow
  const calloutWidth = 320;
  const padding = 16;
  const viewportWidth = window.innerWidth;
  const viewportHeight = window.innerHeight;

  // Default placement: below target
  let calloutTop = targetRect.bottom + 12;
  let calloutLeft = Math.max(padding, Math.min(viewportWidth - calloutWidth - padding, targetRect.left + (targetRect.width / 2) - (calloutWidth / 2)));
  let placement = 'bottom';

  // If bottom overflows, place above
  if (calloutTop + 140 > viewportHeight) {
    calloutTop = Math.max(padding, targetRect.top - 140 - 12);
    placement = 'top';
  }

  return createPortal(
    <div className="fixed inset-0 z-[299999] pointer-events-none select-none animate-in fade-in duration-300">
      {/* Target Element Outline Ring (Apple-style subtle violet aura) */}
      <div
        style={{
          top: `${Math.max(0, targetRect.top - 4)}px`,
          left: `${Math.max(0, targetRect.left - 4)}px`,
          width: `${targetRect.width + 8}px`,
          height: `${targetRect.height + 8}px`,
        }}
        className="fixed rounded-2xl ring-2 ring-violet-500/80 dark:ring-violet-400 shadow-[0_0_24px_rgba(139,92,246,0.35)] pointer-events-none transition-all duration-200 animate-pulse"
      />

      {/* Floating Guidance Callout */}
      <div
        style={{
          top: `${calloutTop}px`,
          left: `${calloutLeft}px`,
          width: `${calloutWidth}px`,
        }}
        className="pointer-events-auto fixed rounded-2xl bg-white/95 dark:bg-[#18181b]/95 backdrop-blur-2xl border border-slate-200/90 dark:border-white/15 p-4 shadow-[0_20px_50px_rgba(0,0,0,0.18)] dark:shadow-[0_24px_60px_rgba(0,0,0,0.75)] animate-in fade-in zoom-in-95 duration-200"
      >
        {/* Header: Regaarder Brand Icon + Step Tag + Close button */}
        <div className="flex items-center justify-between mb-2">
          <div className="flex items-center gap-1.5 text-violet-600 dark:text-violet-400">
            <div className="w-5 h-5 rounded-md bg-violet-50 dark:bg-violet-950/60 border border-violet-200/60 dark:border-violet-800/60 flex items-center justify-center">
              <RegaarderAiIcon size={13} />
            </div>
            <span className="text-[10.5px] font-bold uppercase tracking-wider">
              {currentConfig.badge}
            </span>
          </div>

          <button
            type="button"
            onClick={() => {
              setIsDismissed(true);
              if (typeof onDismiss === 'function') onDismiss();
            }}
            className="text-slate-400 hover:text-slate-600 dark:hover:text-zinc-200 p-1 rounded-md transition-colors cursor-pointer"
            title="Dismiss guidance"
          >
            <X size={13} />
          </button>
        </div>

        {/* Content */}
        <h4 className="text-[13.5px] font-bold text-slate-900 dark:text-zinc-100 tracking-tight leading-snug mb-1">
          {currentConfig.headline}
        </h4>
        <p className="text-[12px] text-slate-600 dark:text-zinc-300 leading-relaxed mb-3">
          {currentConfig.instruction}
        </p>

        {/* Footer Subtext */}
        <div className="flex items-center justify-between pt-2 border-t border-slate-100 dark:border-white/10 text-[11px] text-slate-400 dark:text-zinc-500">
          <span className="truncate max-w-[200px]">
            {currentConfig.nextActionNote}
          </span>
          <button
            type="button"
            onClick={() => {
              // Trigger target click programmatically if user clicks "Go"
              const el = document.querySelector(currentConfig.targetSelector);
              if (el) el.click();
              if (typeof onComplete === 'function') onComplete();
            }}
            className="inline-flex items-center gap-1 text-[11.5px] font-semibold text-violet-600 dark:text-violet-400 hover:underline cursor-pointer"
          >
            <span>Proceed</span>
            <ArrowRight size={11} strokeWidth={2.5} />
          </button>
        </div>
      </div>
    </div>,
    document.body
  );
}
