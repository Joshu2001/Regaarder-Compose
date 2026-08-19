/**
 * videoAgentEngine.js
 *
 * Universal Autonomous Video Recording & DOM Takeover Engine for Regaarder Compose
 *
 * Connects directly to the Canonical UI Sitemap (REGAARDER_UI_SITEMAP) and provides:
 * 1. Universal Semantic DOM Element Discovery (resolves any button/menu by selector, text, aria, or sitemap entry).
 * 2. Dynamic multi-waypoint Video Generation from real DOM snapshots.
 * 3. Live interactive UI takeovers with Apple-style smooth cursor transitions, click ripples, and state execution.
 */

import html2canvas from 'html2canvas';
import { findExactUiMatch, REGAARDER_UI_SITEMAP } from './tourAndVideoAgentService.js';

const wait = (ms) => new Promise((r) => setTimeout(r, ms));

/**
 * Finds a mode tab button in the top Apple Segmented Control track.
 */
export function findToolbarTabButton(tabName) {
  if (typeof document === 'undefined') return null;
  const targeted = document.querySelector(`[data-toolbar-tab="${tabName}"]`);
  if (targeted) return targeted;

  const buttons = Array.from(document.querySelectorAll('button'));
  return (
    buttons.find((b) => {
      const text = (b.textContent || '').trim();
      if (text !== tabName) return false;
      const rect = b.getBoundingClientRect();
      return rect.width > 20 && rect.height > 15 && rect.top > 20 && rect.top < 160;
    }) ?? null
  );
}

/**
 * Finds the Document Outline toggle button in the View sub-toolbar.
 */
export function findOutlineToggleButton() {
  if (typeof document === 'undefined') return null;
  const targeted = document.querySelector('[data-toolbar-action="outline-toggle"]');
  if (targeted) return targeted;

  const buttons = Array.from(document.querySelectorAll('button'));
  return (
    buttons.find((b) => {
      const text = (b.textContent || '').toLowerCase();
      if (!text.includes('outline')) return false;
      const rect = b.getBoundingClientRect();
      return rect.width > 30 && rect.height > 15 && rect.top > 30 && rect.top < 200;
    }) ?? null
  );
}

/**
 * Finds any interactive element matching a selector, text, title, or aria-label.
 */
export function findButton(label, mode = 'includes') {
  if (typeof document === 'undefined') return null;
  const lower = String(label || '').toLowerCase().trim();
  if (!lower) return null;

  return (
    Array.from(document.querySelectorAll('button, [role="button"], a, input, select')).find((b) => {
      const text = (b.textContent || '').trim().toLowerCase();
      const title = (b.getAttribute('title') || '').toLowerCase().trim();
      const aria = (b.getAttribute('aria-label') || '').toLowerCase().trim();
      return mode === 'exact' ? text === lower : (text.includes(lower) || title.includes(lower) || aria.includes(lower));
    }) ?? null
  );
}

/**
 * Universal DOM Element Resolver
 * Resolves any step, action, or selector to a real live DOM element & coordinates.
 */
export function resolveTargetElement(step) {
  if (typeof document === 'undefined') return null;

  // 1. Check tab buttons
  if (step?.tab) {
    const tabBtn = findToolbarTabButton(step.tab);
    if (tabBtn) return tabBtn;
  }

  // 2. Check explicit CSS selectors
  const selectorCandidates = [step?.highlightSelector, step?.selector].filter(Boolean);
  for (const rawSel of selectorCandidates) {
    for (const subSel of rawSel.split(',')) {
      const clean = subSel.trim();
      if (!clean) continue;
      // Handle :has-text("...") pseudo
      const hasTextMatch = clean.match(/:has-text\("([^"]+)"\)/i);
      if (hasTextMatch) {
        const textTarget = hasTextMatch[1];
        const btn = findButton(textTarget, 'includes');
        if (btn) return btn;
      } else {
        try {
          const el = document.querySelector(clean);
          if (el) return el;
        } catch (_e) {}
      }
    }
  }

  // 3. Known Action Types
  if (step?.type === 'outline_toggle' || step?.actionType === 'outline_toggle') {
    return findOutlineToggleButton();
  }

  // 4. Semantic Text Matching
  const label = step?.label || step?.title || step?.desc || step?.text;
  if (label) {
    const btn = findButton(label, 'includes');
    if (btn) return btn;
  }

  return null;
}

/**
 * Captures a real screenshot of the application workspace using html2canvas.
 */
async function captureRealUiSnapshot() {
  if (typeof document === 'undefined') return null;

  try {
    const rootEl = document.getElementById('root') || document.body;

    const canvas = await Promise.race([
      html2canvas(rootEl, {
        logging: false,
        useCORS: true,
        allowTaint: true,
        scale: 1,
        ignoreElements: (el) => {
          const isChat = el.getAttribute?.('data-role') === 'ai-chat' || el.classList?.contains('ai-chat-container');
          const isOverlay = el.style?.zIndex === '999999' || el.style?.zIndex === '99999';
          return Boolean(isChat || isOverlay);
        }
      }),
      new Promise((_, reject) => setTimeout(() => reject(new Error('html2canvas timeout')), 1800))
    ]);

    return canvas;
  } catch (err) {
    console.warn('[videoAgentEngine] html2canvas snapshot fallback:', err.message);
    return null;
  }
}

/**
 * Universal Action Planner: Resolves intent against REGAARDER_UI_SITEMAP
 */
export function planAutonomousActions(intent, productMode = 'compose') {
  const clean = String(intent || '').toLowerCase().trim();

  // 1. Match against verified UI Sitemap
  const sitemapMatch = findExactUiMatch(clean);
  if (sitemapMatch) {
    const steps = [];

    // Step A: Switch tab if required
    if (sitemapMatch.targetTab) {
      steps.push({
        type: 'click_tab',
        tab: sitemapMatch.targetTab,
        desc: `Switching to ${sitemapMatch.targetTab} tab`
      });
    }

    // Step B: Target Action
    if (sitemapMatch.actionType === 'outline_toggle') {
      const isOff = clean.includes('off') || clean.includes('disable') || clean.includes('hide');
      steps.push({
        type: 'outline_toggle',
        turnOff: isOff,
        desc: `Toggling Outline ${isOff ? 'Off' : 'On'}`,
        highlightSelector: sitemapMatch.highlightSelector
      });
    } else if (sitemapMatch.actionType === 'toggle_focus') {
      steps.push({
        type: 'focus_toggle',
        desc: 'Toggling Focus Mode',
        highlightSelector: sitemapMatch.highlightSelector
      });
    } else if (sitemapMatch.actionType === 'theme_toggle') {
      steps.push({
        type: 'theme_toggle',
        desc: 'Toggling Light/Dark mode',
        highlightSelector: sitemapMatch.highlightSelector
      });
    } else if (sitemapMatch.actionType === 'open_export') {
      steps.push({
        type: 'click_header_btn',
        label: 'Export',
        desc: 'Opening Export options',
        highlightSelector: sitemapMatch.highlightSelector
      });
    } else if (sitemapMatch.actionType === 'open_image_modal') {
      steps.push({
        type: 'open_modal',
        modal: 'image',
        desc: 'Launching Image Upload modal',
        highlightSelector: sitemapMatch.highlightSelector
      });
    } else if (sitemapMatch.actionType === 'insert_table') {
      steps.push({
        type: 'insert_table',
        desc: 'Inserting interactive 3x3 data table',
        highlightSelector: sitemapMatch.highlightSelector
      });
    } else if (sitemapMatch.actionType === 'find_checklist') {
      steps.push({
        type: 'insert_checklist',
        desc: 'Inserting interactive checklist checkboxes',
        highlightSelector: sitemapMatch.highlightSelector
      });
    } else if (sitemapMatch.actionType === 'open_equation') {
      steps.push({
        type: 'insert_equation',
        desc: 'Inserting LaTeX math formula',
        highlightSelector: sitemapMatch.highlightSelector
      });
    } else {
      steps.push({
        type: 'highlight_element',
        selector: sitemapMatch.highlightSelector,
        desc: sitemapMatch.title
      });
    }

    steps.push({
      type: 'complete',
      text: `${sitemapMatch.title} executed successfully.`
    });

    return {
      title: sitemapMatch.title,
      targetTab: sitemapMatch.targetTab || 'Write',
      steps
    };
  }

  // 2. Generic fallback plan
  return {
    title: `Demonstrate: ${intent || 'Workflow'}`,
    targetTab: 'Write',
    steps: [
      { type: 'message', text: `Scanning workspace for: "${intent || 'Action'}"...` },
      { type: 'click_tab', tab: 'Write', desc: 'Focusing active canvas' },
      { type: 'complete', text: 'Workflow executed.' }
    ]
  };
}

/**
 * Dynamically extracts waypoints by evaluating real DOM elements for any plan.
 */
function getPlanWaypoints(plan, winW, winH) {
  const waypoints = [{ x: winW * 0.45, y: winH * 0.45, label: 'Start' }];

  const steps = plan?.steps || [];
  for (const step of steps) {
    const el = resolveTargetElement(step);
    if (el) {
      const rect = el.getBoundingClientRect();
      if (rect && rect.width > 0 && rect.height > 0) {
        waypoints.push({
          x: rect.left + rect.width / 2,
          y: rect.top + rect.height / 2,
          label: step.desc || step.tab || step.label || 'Target',
          isClick: true
        });
        continue;
      }
    }

    // Fallback relative estimations if element is not currently in viewport
    if (step.type === 'click_tab') {
      const tabIdx = ['Context', 'Templates', 'Write', 'Review', 'View'].indexOf(step.tab);
      const tx = winW * 0.08 + (tabIdx >= 0 ? tabIdx : 2) * 75;
      waypoints.push({ x: tx, y: 72, label: step.tab, isClick: true });
    } else if (step.type === 'outline_toggle') {
      waypoints.push({ x: winW * 0.52, y: 112, label: 'Outline', isClick: true });
    } else if (step.type === 'focus_toggle') {
      waypoints.push({ x: winW * 0.28, y: winH - 30, label: 'Focus Mode', isClick: true });
    } else if (step.type === 'click_header_btn') {
      waypoints.push({ x: winW * 0.70, y: 35, label: step.label || 'Export', isClick: true });
    } else {
      waypoints.push({ x: winW * 0.45, y: 112, label: step.desc || 'Action', isClick: true });
    }
  }

  if (waypoints.length === 1) {
    waypoints.push({ x: winW * 0.45, y: winH * 0.40, label: 'Canvas', isClick: true });
  }

  return waypoints;
}

/**
 * Generates an animated video clip from real DOM snapshots and dynamic waypoints.
 */
export async function generateDemoVideoBlob(plan) {
  if (typeof document === 'undefined') return null;

  try {
    const snapshotCanvas = await captureRealUiSnapshot();

    const winW = window.innerWidth || 1440;
    const winH = window.innerHeight || 900;

    const waypoints = getPlanWaypoints(plan, winW, winH);

    const canvas = document.createElement('canvas');
    canvas.width = 960;
    canvas.height = 540;
    const ctx = canvas.getContext('2d');

    const stream = canvas.captureStream(30);
    let recorder;
    try {
      recorder = new MediaRecorder(stream, { mimeType: 'video/webm' });
    } catch {
      recorder = new MediaRecorder(stream);
    }

    const chunks = [];
    recorder.ondataavailable = (e) => {
      if (e.data && e.data.size > 0) chunks.push(e.data);
    };

    recorder.start();

    const durationMs = 3200;
    const startTime = performance.now();

    return new Promise((resolve) => {
      let isEnded = false;

      const finish = () => {
        if (isEnded) return;
        isEnded = true;
        try {
          if (recorder.state === 'recording') recorder.stop();
        } catch (_e) {
          resolve(null);
        }
      };

      recorder.onstop = () => {
        const blob = new Blob(chunks, { type: 'video/webm' });
        const videoUrl = URL.createObjectURL(blob);
        resolve({ blob, videoUrl });
      };

      setTimeout(finish, durationMs + 800);

      const drawFrame = (currentTime) => {
        if (isEnded) return;
        const elapsed = currentTime - startTime;
        const progress = Math.min(1, elapsed / durationMs);

        // A. Draw the Real UI snapshot
        if (snapshotCanvas) {
          ctx.drawImage(snapshotCanvas, 0, 0, canvas.width, canvas.height);
        } else {
          ctx.fillStyle = '#f8fafc';
          ctx.fillRect(0, 0, canvas.width, canvas.height);
          ctx.fillStyle = '#ffffff';
          ctx.fillRect(0, 0, canvas.width, 44);
          ctx.strokeStyle = '#e2e8f0';
          ctx.strokeRect(0, 0, canvas.width, 44);
          ctx.fillStyle = '#f1f5f9';
          ctx.fillRect(16, 52, canvas.width - 32, 40);
          ctx.fillStyle = '#ffffff';
          ctx.beginPath();
          ctx.roundRect(48, 104, canvas.width - 96, canvas.height - 120, 8);
          ctx.fill();
        }

        // B. Interpolate cursor position across dynamic waypoints
        const scaleX = canvas.width / winW;
        const scaleY = canvas.height / winH;

        const numSegments = waypoints.length - 1;
        const segIdx = Math.min(numSegments - 1, Math.floor(progress * numSegments));
        const segProgress = (progress * numSegments) - segIdx;

        const pStart = waypoints[segIdx];
        const pEnd = waypoints[segIdx + 1];

        const ease = segProgress < 0.5 ? 2 * segProgress * segProgress : -1 + (4 - 2 * segProgress) * segProgress;
        const curX = (pStart.x + (pEnd.x - pStart.x) * ease) * scaleX;
        const curY = (pStart.y + (pEnd.y - pStart.y) * ease) * scaleY;

        const isClicking = Boolean(pEnd.isClick && segProgress > 0.75);

        // C. Target Button Pulse Spotlight
        if (isClicking) {
          ctx.strokeStyle = 'rgba(99, 102, 241, 0.9)';
          ctx.lineWidth = 2.5;
          ctx.beginPath();
          ctx.roundRect((pEnd.x * scaleX) - 30, (pEnd.y * scaleY) - 14, 60, 28, 6);
          ctx.stroke();
        }

        // D. Draw Apple-Style Mouse Cursor
        ctx.save();
        ctx.fillStyle = '#0f172a';
        ctx.strokeStyle = '#ffffff';
        ctx.lineWidth = 1.5;
        ctx.beginPath();
        ctx.moveTo(curX, curY);
        ctx.lineTo(curX + 13, curY + 17);
        ctx.lineTo(curX + 6, curY + 17);
        ctx.closePath();
        ctx.fill();
        ctx.stroke();

        if (isClicking) {
          ctx.strokeStyle = 'rgba(99, 102, 241, 0.8)';
          ctx.lineWidth = 2.5;
          ctx.beginPath();
          ctx.arc(curX, curY, 14, 0, Math.PI * 2);
          ctx.stroke();
        }
        ctx.restore();

        // E. Floating Glass Caption Pill at bottom
        ctx.save();
        const pillW = canvas.width - 64;
        const pillH = 38;
        const pillX = 32;
        const pillY = canvas.height - 48;

        ctx.fillStyle = 'rgba(15, 23, 42, 0.92)';
        ctx.beginPath();
        ctx.roundRect(pillX, pillY, pillW, pillH, 10);
        ctx.fill();
        ctx.strokeStyle = 'rgba(99, 102, 241, 0.5)';
        ctx.lineWidth = 1;
        ctx.stroke();

        ctx.fillStyle = '#ffffff';
        ctx.font = 'bold 12px -apple-system, BlinkMacSystemFont, "Segoe UI", sans-serif';
        ctx.fillText(`Autonomous Takeover: ${plan?.title || 'Action'}`, pillX + 16, pillY + 24);

        ctx.fillStyle = '#6366f1';
        ctx.fillRect(pillX + pillW - 120, pillY + 16, 100 * progress, 5);
        ctx.restore();

        if (progress < 1) {
          requestAnimationFrame(drawFrame);
        } else {
          finish();
        }
      };

      requestAnimationFrame(drawFrame);
    });
  } catch (err) {
    console.warn('[videoAgentEngine] Video generation fallback:', err);
    return null;
  }
}

export const generateFallbackDemoBlob = generateDemoVideoBlob;

/**
 * Universal Autonomous UI Takeover Executor
 * Dynamically resolves any step, switches tabs, glides cursor, and executes action.
 */
export async function executeAutonomousVideoSequence({
  intent,
  productMode = 'compose',
  setDocToolbarTab,
  setIsDocumentSubToolbarCollapsed,
  setIsInsertImagesModalOpen,
  setDocOutlineEnabled,
  insertHtmlToCanvas,
  onProgressUpdate,
  onCursorMove,
  onCursorClick
}) {
  const plan = planAutonomousActions(intent, productMode);

  for (let i = 0; i < plan.steps.length; i++) {
    const step = plan.steps[i];
    if (onProgressUpdate) {
      onProgressUpdate({
        currentStep: i + 1,
        totalSteps: plan.steps.length,
        text: step.text || step.desc || ''
      });
    }

    // 1. Auto-switch toolbar tab if step specifies a different tab
    if (step.type === 'click_tab' && step.tab) {
      const tabBtn = findToolbarTabButton(step.tab);
      if (tabBtn) {
        const rect = tabBtn.getBoundingClientRect();
        const cx = rect.left + rect.width / 2;
        const cy = rect.top + rect.height / 2;

        const prevOutline = tabBtn.style.outline;
        tabBtn.style.outline = '3px solid #6366f1';
        tabBtn.style.borderRadius = '8px';

        if (onCursorMove) onCursorMove(cx, cy);
        await wait(750);

        if (onCursorClick) onCursorClick();
        await wait(200);

        tabBtn.style.outline = prevOutline;
        tabBtn.click();
        if (setDocToolbarTab) setDocToolbarTab(step.tab);
        if (setIsDocumentSubToolbarCollapsed) setIsDocumentSubToolbarCollapsed(false);
      } else {
        if (setDocToolbarTab) setDocToolbarTab(step.tab);
        if (setIsDocumentSubToolbarCollapsed) setIsDocumentSubToolbarCollapsed(false);
      }
      await wait(700);
      continue;
    }

    // 2. Outline toggle action
    if (step.type === 'outline_toggle') {
      // Ensure View tab is open
      const viewBtn = findToolbarTabButton('View');
      if (viewBtn) {
        const vRect = viewBtn.getBoundingClientRect();
        if (onCursorMove) onCursorMove(vRect.left + vRect.width / 2, vRect.top + vRect.height / 2);
        await wait(700);
        if (onCursorClick) onCursorClick();
        viewBtn.click();
        if (setDocToolbarTab) setDocToolbarTab('View');
        if (setIsDocumentSubToolbarCollapsed) setIsDocumentSubToolbarCollapsed(false);
        await wait(700);
      }

      const outlineBtn = findOutlineToggleButton();
      if (outlineBtn) {
        const oRect = outlineBtn.getBoundingClientRect();
        const cx = oRect.left + oRect.width / 2;
        const cy = oRect.top + oRect.height / 2;

        const prevOutline = outlineBtn.style.outline;
        outlineBtn.style.outline = '3px solid #6366f1';
        outlineBtn.style.borderRadius = '8px';

        if (onCursorMove) onCursorMove(cx, cy);
        await wait(800);

        if (onCursorClick) onCursorClick();
        await wait(250);

        outlineBtn.style.outline = prevOutline;
        outlineBtn.click();

        if (setDocOutlineEnabled) {
          setDocOutlineEnabled(!step.turnOff);
        }
      } else if (setDocOutlineEnabled) {
        setDocOutlineEnabled(!step.turnOff);
      }
      await wait(800);
      continue;
    }

    // 3. Document Content Injections
    if (step.type === 'insert_equation' && insertHtmlToCanvas) {
      insertHtmlToCanvas(
        '<p><span class="katex-inline" style="background:rgba(99,102,241,0.08);padding:4px 8px;border-radius:6px;font-family:serif;font-size:16px;">$$\\int_{a}^{b} f(x)\\,dx = F(b) - F(a)$$</span></p>'
      );
      await wait(600);
      continue;
    }

    if (step.type === 'insert_table' && insertHtmlToCanvas) {
      insertHtmlToCanvas(
        '<table style="width:100%;border-collapse:collapse;margin:16px 0;font-size:14px;"><tr style="background:#f8fafc;"><th style="border:1px solid #cbd5e1;padding:8px 12px;text-align:left;">Task</th><th style="border:1px solid #cbd5e1;padding:8px 12px;text-align:left;">Status</th><th style="border:1px solid #cbd5e1;padding:8px 12px;text-align:left;">Budget</th></tr><tr><td style="border:1px solid #cbd5e1;padding:8px 12px;">Architecture Review</td><td style="border:1px solid #cbd5e1;padding:8px 12px;">Active</td><td style="border:1px solid #cbd5e1;padding:8px 12px;">$2,400</td></tr></table>'
      );
      await wait(600);
      continue;
    }

    if (step.type === 'insert_checklist' && insertHtmlToCanvas) {
      insertHtmlToCanvas(
        '<ul style="list-style-type:none;padding-left:0;font-size:14px;"><li style="margin-bottom:8px;"><label style="display:inline-flex;align-items:center;gap:8px;cursor:pointer;"><input type="checkbox" style="width:16px;height:16px;accent-color:#6366f1;"> <span>Finalize project specification</span></label></li><li style="margin-bottom:8px;"><label style="display:inline-flex;align-items:center;gap:8px;cursor:pointer;"><input type="checkbox" style="width:16px;height:16px;accent-color:#6366f1;"> <span>Review typography and layout</span></label></li></ul>'
      );
      await wait(600);
      continue;
    }

    if (step.type === 'open_modal' && step.modal === 'image' && setIsInsertImagesModalOpen) {
      setIsInsertImagesModalOpen(true);
      await wait(600);
      continue;
    }

    // 4. Universal Element Resolution & Click Takeover
    const targetEl = resolveTargetElement(step);
    if (targetEl) {
      const rect = targetEl.getBoundingClientRect();
      const cx = rect.left + rect.width / 2;
      const cy = rect.top + rect.height / 2;

      const prevOutline = targetEl.style.outline;
      targetEl.style.outline = '3px solid #6366f1';
      targetEl.style.borderRadius = '8px';

      if (onCursorMove) onCursorMove(cx, cy);
      await wait(750);

      if (onCursorClick) onCursorClick();
      await wait(250);

      targetEl.style.outline = prevOutline;
      targetEl.click();
      await wait(600);
    } else {
      await wait(500);
    }
  }

  return plan;
}
