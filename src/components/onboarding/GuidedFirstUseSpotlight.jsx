import React, { useState, useEffect, useCallback } from 'react';
import { createPortal } from 'react-dom';
import { X } from 'lucide-react';
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
      badge: 'Quick Start',
      headline: 'Start with Docs',
      instruction: 'Click Docs to open your composition workspace.',
      targetSelector: '[data-onboarding-target="quick-create-compose"]',
      fallbackSelector: '[data-onboarding-target="quick-create-compose"], button:has(div:contains("Docs"))',
      nextActionNote: 'Summon AI agents anywhere with / or start writing directly.'
    },
    organize: {
      title: 'Bring my work together',
      badge: 'Quick Start',
      headline: 'Universal Ingestion',
      instruction: 'Drag files here or click to import documents into Universal Memory.',
      targetSelector: '[data-onboarding-target="omni-dropzone"]',
      nextActionNote: 'Regaarder automatically indexes and cross-references your files.'
    },
    plan: {
      title: 'Plan and execute a project',
      badge: 'Quick Start',
      headline: 'Create your first project',
      instruction: 'Click "New project" to set up deliverables, milestones, and goals.',
      targetSelector: '[data-onboarding-target="new-project-button"]',
      nextActionNote: 'Track milestones, tasks, and deadlines in one cohesive roadmap.'
    },
    research: {
      title: 'Research or understand something',
      badge: 'Quick Start',
      headline: 'Deep Research with Orb',
      instruction: 'Type your research question to investigate sources across web and memory.',
      targetSelector: '[data-onboarding-target="orb-search-input"]',
      nextActionNote: 'Orb synthesizes citations and writes structured briefings.'
    },
    collaborate: {
      title: 'Work with others',
      badge: 'Quick Start',
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
        return;
      }
    }
    // Clear rect immediately if element is no longer in the DOM (prevents lingering on navigation)
    setTargetRect(null);
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
      // User clicked the real element: instantly dismiss overlay so it never lingers during navigation
      setIsDismissed(true);
      setTargetRect(null);
      if (typeof onComplete === 'function') {
        onComplete();
      }
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

  // Target coordinates for cutout
  const targetX = Math.max(0, targetRect.left - 2);
  const targetY = Math.max(0, targetRect.top - 2);
  const targetW = targetRect.width + 4;
  const targetH = targetRect.height + 4;
  const targetRadius = 14;

  return createPortal(
    <div className="fixed inset-0 z-[299999] pointer-events-none select-none animate-in fade-in duration-200">
      {/* 1. Subtle 10-12% neutral dim overlay with target cutout via large box-shadow */}
      <div
        style={{
          top: `${targetY}px`,
          left: `${targetX}px`,
          width: `${targetW}px`,
          height: `${targetH}px`,
          borderRadius: `${targetRadius}px`,
          boxShadow: '0 0 0 9999px rgba(15, 23, 42, 0.10)'
        }}
        className="fixed pointer-events-none transition-all duration-200"
      />

      {/* 2. Target Element Outline & Apple-style Glow Ring */}
      <div
        style={{
          top: `${targetY}px`,
          left: `${targetX}px`,
          width: `${targetW}px`,
          height: `${targetH}px`,
          borderRadius: `${targetRadius}px`
        }}
        className="fixed ring-2 ring-violet-500/85 dark:ring-violet-400/90 shadow-[0_0_0_1px_rgba(255,255,255,0.8),0_0_20px_rgba(139,92,246,0.3)] dark:shadow-[0_0_0_1px_rgba(255,255,255,0.12),0_0_24px_rgba(167,139,250,0.3)] pointer-events-none transition-all duration-200"
      />

      {/* 3. Floating Instruction Callout (Native Apple-style white card) */}
      <div
        style={{
          top: `${calloutTop}px`,
          left: `${calloutLeft}px`,
          width: `${calloutWidth}px`,
        }}
        className="pointer-events-auto fixed rounded-2xl bg-white dark:bg-[#18181b] border border-slate-200/90 dark:border-white/12 p-4 shadow-[0_16px_36px_rgba(0,0,0,0.12),0_2px_8px_rgba(0,0,0,0.04)] dark:shadow-[0_20px_48px_rgba(0,0,0,0.6)] animate-in fade-in zoom-in-95 duration-200"
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

        {/* Headline */}
        <h4 className="text-[13.5px] font-bold text-slate-900 dark:text-zinc-100 tracking-tight leading-snug mb-1">
          {currentConfig.headline}
        </h4>

        {/* Instruction */}
        <p className="text-[12px] text-slate-600 dark:text-zinc-300 leading-relaxed">
          {currentConfig.instruction}
        </p>

        {/* Contextual subtext without competing Proceed button */}
        {currentConfig.nextActionNote && (
          <div className="pt-2 mt-2.5 border-t border-slate-100 dark:border-white/10 text-[11px] text-slate-400 dark:text-zinc-500 leading-relaxed">
            {currentConfig.nextActionNote}
          </div>
        )}
      </div>
    </div>,
    document.body
  );
}
