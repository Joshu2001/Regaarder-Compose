/**
 * videoAgentEngine.js
 *
 * Universal Autonomous Video Recording & Live UI Takeover Engine for Regaarder Workspace
 * Multi-Product Support: Compose, Sheets, Deck, Whiteboard, Schedule, Tasks, Room, Memory
 */

import html2canvas from 'html2canvas';
import { findExactUiMatch, REGAARDER_UI_SITEMAP } from './tourAndVideoAgentService.js';

const wait = (ms) => new Promise((r) => setTimeout(r, ms));

/**
 * Simulates a full human pointer sequence so React pointer-down listeners,
 * dropdown toggles, and buttons fire properly.
 */
export function simulateHumanPointerClick(el) {
  if (!el) return;
  const rect = el.getBoundingClientRect();
  const clientX = rect.left + rect.width / 2;
  const clientY = rect.top + rect.height / 2;

  const eventInit = {
    bubbles: true,
    cancelable: true,
    view: window,
    clientX,
    clientY,
    buttons: 1
  };

  try {
    el.dispatchEvent(new PointerEvent('pointerdown', eventInit));
    el.dispatchEvent(new MouseEvent('mousedown', eventInit));
    el.dispatchEvent(new PointerEvent('pointerup', eventInit));
    el.dispatchEvent(new MouseEvent('mouseup', eventInit));
    el.click();
  } catch (err) {
    el.click();
  }
}

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
      return mode === 'exact' ? (text === lower || title === lower) : (text.includes(lower) || title.includes(lower) || aria.includes(lower));
    }) ?? null
  );
}

/**
 * Universal DOM Element Resolver Across All 8 Products:
 * Global, Compose, Sheets, Deck, Whiteboard, Schedule, Tasks, Room, Memory.
 */
export function resolveTargetElement(step) {
  if (typeof document === 'undefined') return null;

  // 1. Direct Tab Navigation
  if (step?.tab) {
    const tabBtn = findToolbarTabButton(step.tab);
    if (tabBtn) return tabBtn;
  }

  // 2. Global Header Resolvers
  if (step?.type === 'open_workspace_switcher' || step?.actionType === 'open_workspace_switcher') {
    return (
      document.querySelector('button[title*="Switch Workspace App" i]') ||
      document.querySelector('button:has(svg.lucide-layout-grid)') ||
      findButton('Switch Workspace App', 'includes')
    );
  }

  if (step?.type === 'open_history' || step?.actionType === 'open_history') {
    return (
      document.querySelector('button[title*="replay" i]') ||
      document.querySelector('button[title*="history" i]') ||
      findButton('History', 'includes')
    );
  }

  if (step?.type === 'open_search' || step?.actionType === 'open_search') {
    return (
      document.querySelector('button[title*="Find & Replace" i]') ||
      document.querySelector('button[title*="Search" i]') ||
      document.querySelector('input[placeholder*="Search" i]') ||
      findButton('Search', 'includes')
    );
  }

  if (step?.type === 'open_export' || step?.actionType === 'open_export') {
    return (
      document.querySelector('button[title*="Export" i]') ||
      findButton('Export', 'includes') ||
      document.querySelector('.export-menu-container button')
    );
  }

  if (step?.type === 'undo_action' || step?.actionType === 'undo_action') {
    return document.querySelector('button[title*="Undo" i]');
  }

  if (step?.type === 'redo_action' || step?.actionType === 'redo_action') {
    return document.querySelector('button[title*="Redo" i]');
  }

  if (step?.type === 'open_share' || step?.actionType === 'open_share') {
    return findButton('Share', 'includes');
  }

  if (step?.type === 'open_properties' || step?.actionType === 'open_properties') {
    return findButton('Properties', 'includes');
  }

  if (step?.type === 'select_model' || step?.actionType === 'select_model') {
    return findButton('gemma', 'includes') || findButton('gemini', 'includes');
  }

  // 3. Compose (Documents) Resolvers
  if (step?.type === 'outline_toggle' || step?.actionType === 'outline_toggle') {
    return findOutlineToggleButton();
  }

  if (step?.type === 'focus_toggle' || step?.actionType === 'toggle_focus') {
    return findButton('Focus Mode', 'includes');
  }

  // 4. Sheets Resolvers
  if (step?.type === 'sheets_formula' || step?.actionType === 'sheets_formula') {
    return document.querySelector('input[placeholder*="Formula" i]') || document.querySelector('.formula-bar-input');
  }

  if (step?.type === 'sheets_format' || step?.actionType === 'sheets_format') {
    return findButton('%', 'includes') || findButton('$', 'includes') || document.querySelector('[data-tour="sheets-number-format"]');
  }

  if (step?.type === 'sheets_grid_modify' || step?.actionType === 'sheets_grid_modify') {
    return findButton('+ Row', 'includes') || findButton('+ Col', 'includes') || document.querySelector('[data-tour="sheets-rows-cols"]');
  }

  if (step?.type === 'sheets_chart' || step?.actionType === 'sheets_chart') {
    return findButton('Chart', 'includes') || document.querySelector('button[title*="Chart" i]');
  }

  // 5. Deck Resolvers
  if (step?.type === 'deck_add_slide' || step?.actionType === 'deck_add_slide') {
    return findButton('+ Slide', 'includes') || document.querySelector('button[title*="Add Slide" i]');
  }

  if (step?.type === 'deck_present' || step?.actionType === 'deck_present') {
    return findButton('Present', 'includes') || document.querySelector('button[title*="Present" i]');
  }

  if (step?.type === 'deck_insert_element' || step?.actionType === 'deck_insert_element') {
    return findButton('Text', 'includes') || findButton('Shape', 'includes');
  }

  // 6. Whiteboard Resolvers
  if (step?.type === 'whiteboard_tool' || step?.actionType === 'whiteboard_tool') {
    return document.querySelector('button[title*="Pen" i]') || document.querySelector('button[title*="Highlighter" i]');
  }

  if (step?.type === 'whiteboard_sticky' || step?.actionType === 'whiteboard_sticky') {
    return document.querySelector('button[title*="Sticky" i]') || findButton('Sticky', 'includes');
  }

  if (step?.type === 'whiteboard_shapes' || step?.actionType === 'whiteboard_shapes') {
    return document.querySelector('button[title*="Shapes" i]') || document.querySelector('button[title*="Zoom" i]');
  }

  // 7. Schedule Resolvers
  if (step?.type === 'schedule_create' || step?.actionType === 'schedule_create') {
    return findButton('+ New Event', 'includes') || findButton('New Event', 'includes');
  }

  if (step?.type === 'schedule_views' || step?.actionType === 'schedule_views') {
    return findButton('Week', 'includes') || findButton('Month', 'includes') || findButton('Day', 'includes');
  }

  // 8. Tasks Resolvers
  if (step?.type === 'tasks_kanban' || step?.actionType === 'tasks_kanban') {
    return findButton('+ Add Task', 'includes') || findButton('Add Task', 'includes');
  }

  // 9. Room Resolvers
  if (step?.type === 'room_controls' || step?.actionType === 'room_controls') {
    return document.querySelector('button[title*="Mic" i]') || document.querySelector('button[title*="Camera" i]');
  }

  // 10. Memory Resolvers
  if (step?.type === 'memory_explore' || step?.actionType === 'memory_explore') {
    return document.querySelector('input[placeholder*="Search memory" i]');
  }

  // 11. Highlight Selectors fallback
  const selectorCandidates = [step?.highlightSelector, step?.selector].filter(Boolean);
  for (const rawSel of selectorCandidates) {
    for (const subSel of rawSel.split(',')) {
      const clean = subSel.trim();
      if (!clean) continue;
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

  // 12. Semantic Text Matching
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
 * Universal Action Planner: Resolves intent against REGAARDER_UI_SITEMAP across all 8 products
 */
export function planAutonomousActions(intent, productMode = 'compose') {
  // If a pre-planned structured action object is passed directly from LLM / sitemap
  const sitemapMatch = (typeof intent === 'object' && intent !== null && intent.actionType)
    ? intent
    : findExactUiMatch(String(intent || ''), productMode);

  if (sitemapMatch) {
    const steps = [];

    // Header, Sheets, Deck, Whiteboard, Schedule, Tasks, Room actions do not need Compose toolbar tab switches
    const isNonComposeToolbarAction = [
      'open_workspace_switcher', 'open_history', 'open_search', 'open_export', 'open_share',
      'undo_action', 'open_properties', 'select_model', 'trigger_slash',
      'rename_title', 'manage_tabs', 'sheets_formula', 'sheets_format', 'sheets_grid_modify',
      'sheets_chart', 'sheets_slash', 'deck_add_slide', 'deck_present', 'deck_insert_element',
      'whiteboard_tool', 'whiteboard_sticky', 'whiteboard_shapes', 'schedule_create',
      'schedule_views', 'tasks_kanban', 'room_controls', 'memory_explore'
    ].includes(sitemapMatch.actionType);

    // Step A: Switch tab if required in Compose mode
    if (sitemapMatch.targetTab && !isNonComposeToolbarAction && productMode === 'compose') {
      steps.push({
        type: 'click_tab',
        tab: sitemapMatch.targetTab,
        desc: `Switching to ${sitemapMatch.targetTab} tab`
      });
    }

    // Step B: Target Action
    steps.push({
      type: sitemapMatch.actionType,
      desc: sitemapMatch.title || 'Executing action',
      highlightSelector: sitemapMatch.highlightSelector
    });

    steps.push({
      type: 'complete',
      text: `${sitemapMatch.title || 'Action'} executed successfully.`
    });

    return {
      title: sitemapMatch.title || 'Action Demo',
      targetTab: sitemapMatch.targetTab || 'Write',
      steps
    };
  }

  // Generic fallback plan
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
 * Compiles a real video WebM blob from genuine captured UI snapshots and mouse waypoints.
 */
export async function buildVideoClipFromFrames({ frames = [], waypoints = [], plan }) {
  if (typeof document === 'undefined') return null;

  try {
    const winW = window.innerWidth || 1440;
    const winH = window.innerHeight || 900;

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

    recorder.start(100);

    const durationMs = 3000;
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

        const numSegments = Math.max(1, waypoints.length - 1);
        const segIdx = Math.min(numSegments - 1, Math.floor(progress * numSegments));
        const segProgress = (progress * numSegments) - segIdx;

        // A. Draw genuine captured window frame
        const frameIdx = Math.min(frames.length - 1, segIdx + (segProgress > 0.75 ? 1 : 0));
        const activeFrame = frames[frameIdx] || frames[0];

        if (activeFrame) {
          ctx.drawImage(activeFrame, 0, 0, canvas.width, canvas.height);
        } else {
          ctx.fillStyle = '#f8fafc';
          ctx.fillRect(0, 0, canvas.width, canvas.height);
        }

        // B. Cursor Trajectory
        const scaleX = canvas.width / winW;
        const scaleY = canvas.height / winH;

        const pStart = waypoints[segIdx] || { x: winW * 0.5, y: winH * 0.5 };
        const pEnd = waypoints[segIdx + 1] || pStart;

        const ease = segProgress < 0.5 ? 2 * segProgress * segProgress : -1 + (4 - 2 * segProgress) * segProgress;
        const curX = (pStart.x + (pEnd.x - pStart.x) * ease) * scaleX;
        const curY = (pStart.y + (pEnd.y - pStart.y) * ease) * scaleY;

        const isClicking = Boolean(pEnd.isClick && segProgress > 0.75);

        // C. Target Spotlight Outline
        if (isClicking) {
          ctx.strokeStyle = 'rgba(99, 102, 241, 0.9)';
          ctx.lineWidth = 2.5;
          ctx.beginPath();
          ctx.roundRect((pEnd.x * scaleX) - 30, (pEnd.y * scaleY) - 14, 60, 28, 6);
          ctx.stroke();
        }

        // D. Draw Apple Mouse Cursor
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

        // E. Floating Glass Caption Pill
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
        ctx.fillText(`Action Demo: ${plan?.title || 'Takeover'}`, pillX + 16, pillY + 24);

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
    console.warn('[videoAgentEngine] buildVideoClipFromFrames error:', err);
    return null;
  }
}

/**
 * Universal Autonomous UI Takeover Executor & Screen Recorder Across All 8 Products
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

  const winW = window.innerWidth || 1440;
  const winH = window.innerHeight || 900;

  const capturedFrames = [];
  const waypoints = [{ x: winW * 0.45, y: winH * 0.45, label: 'Start' }];

  // 1. Initial snapshot
  const frame0 = await captureRealUiSnapshot();
  if (frame0) capturedFrames.push(frame0);

  for (let i = 0; i < plan.steps.length; i++) {
    const step = plan.steps[i];
    if (onProgressUpdate) {
      onProgressUpdate({
        currentStep: i + 1,
        totalSteps: plan.steps.length,
        text: step.text || step.desc || ''
      });
    }

    // ── Compose Tab Switching Action ──
    if (step.type === 'click_tab' && step.tab) {
      if (setDocToolbarTab) setDocToolbarTab(step.tab);
      if (setIsDocumentSubToolbarCollapsed) setIsDocumentSubToolbarCollapsed(false);

      const tabBtn = findToolbarTabButton(step.tab);
      if (tabBtn) {
        const rect = tabBtn.getBoundingClientRect();
        const cx = rect.left + rect.width / 2;
        const cy = rect.top + rect.height / 2;

        waypoints.push({ x: cx, y: cy, label: step.tab, isClick: true });

        const prevOutline = tabBtn.style.outline;
        tabBtn.style.outline = '3px solid #6366f1';
        tabBtn.style.borderRadius = '8px';

        if (onCursorMove) onCursorMove(cx, cy);
        await wait(700);

        if (onCursorClick) onCursorClick();
        await wait(200);

        tabBtn.style.outline = prevOutline;
        simulateHumanPointerClick(tabBtn);
      }

      await wait(700);
      const frameTab = await captureRealUiSnapshot();
      if (frameTab) capturedFrames.push(frameTab);
      continue;
    }

    // ── Compose Outline Toggle Action ──
    if (step.type === 'outline_toggle') {
      if (setDocToolbarTab) setDocToolbarTab('View');
      if (setIsDocumentSubToolbarCollapsed) setIsDocumentSubToolbarCollapsed(false);

      const viewBtn = findToolbarTabButton('View');
      if (viewBtn) {
        const vRect = viewBtn.getBoundingClientRect();
        const vcx = vRect.left + vRect.width / 2;
        const vcy = vRect.top + vRect.height / 2;
        waypoints.push({ x: vcx, y: vcy, label: 'View Tab', isClick: true });

        if (onCursorMove) onCursorMove(vcx, vcy);
        await wait(650);
        if (onCursorClick) onCursorClick();
        simulateHumanPointerClick(viewBtn);
        await wait(700);

        const frameView = await captureRealUiSnapshot();
        if (frameView) capturedFrames.push(frameView);
      }

      const outlineBtn = findOutlineToggleButton();
      if (outlineBtn) {
        const oRect = outlineBtn.getBoundingClientRect();
        const cx = oRect.left + oRect.width / 2;
        const cy = oRect.top + oRect.height / 2;

        waypoints.push({ x: cx, y: cy, label: 'Outline Toggle', isClick: true });

        const prevOutline = outlineBtn.style.outline;
        outlineBtn.style.outline = '3px solid #6366f1';
        outlineBtn.style.borderRadius = '8px';

        if (onCursorMove) onCursorMove(cx, cy);
        await wait(750);

        if (onCursorClick) onCursorClick();
        await wait(200);

        outlineBtn.style.outline = prevOutline;
        simulateHumanPointerClick(outlineBtn);

        if (setDocOutlineEnabled) {
          setDocOutlineEnabled(!step.turnOff);
        }
      } else if (setDocOutlineEnabled) {
        setDocOutlineEnabled(!step.turnOff);
      }

      await wait(700);
      const frameOutline = await captureRealUiSnapshot();
      if (frameOutline) capturedFrames.push(frameOutline);
      continue;
    }

    // ── Compose Injections ──
    if (step.type === 'insert_equation' && insertHtmlToCanvas) {
      insertHtmlToCanvas(
        '<p><span class="katex-inline" style="background:rgba(99,102,241,0.08);padding:4px 8px;border-radius:6px;font-family:serif;font-size:16px;">$$\\int_{a}^{b} f(x)\\,dx = F(b) - F(a)$$</span></p>'
      );
      await wait(500);
      continue;
    }

    if (step.type === 'insert_table' && insertHtmlToCanvas) {
      insertHtmlToCanvas(
        '<table style="width:100%;border-collapse:collapse;margin:16px 0;font-size:14px;"><tr style="background:#f8fafc;"><th style="border:1px solid #cbd5e1;padding:8px 12px;text-align:left;">Task</th><th style="border:1px solid #cbd5e1;padding:8px 12px;text-align:left;">Status</th><th style="border:1px solid #cbd5e1;padding:8px 12px;text-align:left;">Budget</th></tr><tr><td style="border:1px solid #cbd5e1;padding:8px 12px;">Architecture Review</td><td style="border:1px solid #cbd5e1;padding:8px 12px;">Active</td><td style="border:1px solid #cbd5e1;padding:8px 12px;">$2,400</td></tr></table>'
      );
      await wait(500);
      continue;
    }

    if (step.type === 'insert_checklist' && insertHtmlToCanvas) {
      insertHtmlToCanvas(
        '<ul style="list-style-type:none;padding-left:0;font-size:14px;"><li style="margin-bottom:8px;"><label style="display:inline-flex;align-items:center;gap:8px;cursor:pointer;"><input type="checkbox" style="width:16px;height:16px;accent-color:#6366f1;"> <span>Finalize project specification</span></label></li><li style="margin-bottom:8px;"><label style="display:inline-flex;align-items:center;gap:8px;cursor:pointer;"><input type="checkbox" style="width:16px;height:16px;accent-color:#6366f1;"> <span>Review typography and layout</span></label></li></ul>'
      );
      await wait(500);
      continue;
    }

    if (step.type === 'open_modal' && step.modal === 'image' && setIsInsertImagesModalOpen) {
      setIsInsertImagesModalOpen(true);
      await wait(500);
      continue;
    }

    // ── Universal Element Resolution & Click Takeover Across All 8 Products ──
    const targetEl = resolveTargetElement(step);
    if (targetEl) {
      const rect = targetEl.getBoundingClientRect();
      const cx = rect.left + rect.width / 2;
      const cy = rect.top + rect.height / 2;

      waypoints.push({ x: cx, y: cy, label: step.desc || 'Action', isClick: true });

      const prevOutline = targetEl.style.outline;
      targetEl.style.outline = '3px solid #6366f1';
      targetEl.style.borderRadius = '8px';

      if (onCursorMove) onCursorMove(cx, cy);
      await wait(750);

      if (onCursorClick) onCursorClick();
      await wait(250);

      targetEl.style.outline = prevOutline;
      simulateHumanPointerClick(targetEl);
      await wait(700);

      const frameAction = await captureRealUiSnapshot();
      if (frameAction) capturedFrames.push(frameAction);
    } else {
      await wait(400);
    }
  }

  // Compile final video from genuine window snapshots
  const videoResult = await buildVideoClipFromFrames({
    frames: capturedFrames,
    waypoints,
    plan
  });

  return {
    plan,
    blob: videoResult?.blob || null,
    videoUrl: videoResult?.videoUrl || null
  };
}

export async function generateDemoVideoBlob(plan) {
  if (typeof document === 'undefined') return null;

  try {
    const winW = window.innerWidth || 1440;
    const winH = window.innerHeight || 900;

    const initialFrame = await captureRealUiSnapshot();
    const frames = initialFrame ? [initialFrame] : [];

    const waypoints = [{ x: winW * 0.45, y: winH * 0.45, label: 'Start' }];

    if (plan?.steps) {
      for (const step of plan.steps) {
        const targetEl = resolveTargetElement(step);
        if (targetEl) {
          const rect = targetEl.getBoundingClientRect();
          waypoints.push({
            x: rect.left + rect.width / 2,
            y: rect.top + rect.height / 2,
            label: step.desc || step.title || 'Action',
            isClick: true
          });
        }
      }
    }

    if (waypoints.length <= 1) {
      waypoints.push({ x: winW * 0.5, y: winH * 0.35, label: 'Action', isClick: true });
    }

    return await buildVideoClipFromFrames({ frames, waypoints, plan });
  } catch (err) {
    console.warn('[videoAgentEngine] generateDemoVideoBlob error:', err);
    return null;
  }
}

export const generateFallbackDemoBlob = async (plan) => generateDemoVideoBlob(plan);
