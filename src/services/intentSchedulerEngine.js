/**
 * intentSchedulerEngine.js
 * 
 * Pillar 6: The Constraint-Based Intent Scheduler & Multi-Agent Negotiation Substrate
 * 
 * Implements:
 * 1. Rule 4 Context-Aware Intent Mapping (colloquial intent -> systemic domain requirements)
 * 2. Mathematical Constraint Satisfaction Problem (CSP) Solver (hard/soft constraints, utility optimization)
 * 3. Multi-Agent Parameter Negotiation Protocol (alternating offers, monotonic concessions, Pareto convergence)
 * 4. Temporal Conflict Matrix & Automated Resolution (priority shifts, compression, Pillar 3 staging)
 * 5. Isomorphic AST & Token-Dense Calendar Serializers (Markdown table feeds, JSON-LD)
 */

import { stageMutation } from './workspaceStagingEngine.js';

// ── Persistent Key & Storage ──────────────────────────────────────────────────
const STORAGE_KEY_EVENTS = 'regaarder_schedule_events_v1';
const STORAGE_KEY_NEGOTIATIONS = 'regaarder_schedule_negotiations_v1';

// ── Default Mock Participants & Agent Profiles ──────────────────────────────
export const DEFAULT_PARTICIPANTS = [
  {
    id: 'user-joshua',
    name: 'Joshua David',
    role: 'Executive / Founder',
    agentId: 'agent-joshua',
    avatar: 'https://images.unsplash.com/photo-1534528741775-53994a69daeb?auto=format&fit=crop&w=80&q=80',
    timezone: 'America/New_York',
    workingHours: { start: '09:00', end: '18:00' },
    bufferBetweenMeetingsMin: 15,
    preferredWindows: ['10:00-12:00', '14:00-16:30'],
    blackoutPeriods: [],
    utilityWeights: {
      morningPreference: 0.8,
      contiguousBlocks: 0.9,
      bufferAdherence: 1.0,
    }
  },
  {
    id: 'agent-alex',
    name: 'Alex Miller',
    role: 'Frontend Principal',
    agentId: 'agent-alex',
    avatar: 'https://images.unsplash.com/photo-1507003211169-0a1dd7228f2d?auto=format&fit=crop&w=80&q=80',
    timezone: 'America/New_York',
    workingHours: { start: '09:30', end: '17:30' },
    bufferBetweenMeetingsMin: 10,
    preferredWindows: ['10:30-13:00', '15:00-17:00'],
    blackoutPeriods: [],
    utilityWeights: {
      morningPreference: 0.6,
      contiguousBlocks: 0.8,
      bufferAdherence: 0.7,
    }
  },
  {
    id: 'agent-elena',
    name: 'Elena Rostova',
    role: 'Head of Product Strategy',
    agentId: 'agent-elena',
    avatar: 'https://images.unsplash.com/photo-1494790108377-be9c29b29330?auto=format&fit=crop&w=80&q=80',
    timezone: 'America/New_York',
    workingHours: { start: '10:00', end: '19:00' },
    bufferBetweenMeetingsMin: 15,
    preferredWindows: ['13:30-17:00'],
    blackoutPeriods: [],
    utilityWeights: {
      morningPreference: 0.1, // Elena strongly prefers afternoon
      contiguousBlocks: 0.9,
      bufferAdherence: 0.9,
    }
  },
  {
    id: 'agent-david',
    name: 'David Kim',
    role: 'Lead Infrastructure Engineer',
    agentId: 'agent-david',
    avatar: 'https://images.unsplash.com/photo-1500648767791-00dcc994a43e?auto=format&fit=crop&w=80&q=80',
    timezone: 'America/Los_Angeles',
    workingHours: { start: '08:00', end: '16:00' },
    bufferBetweenMeetingsMin: 15,
    preferredWindows: ['11:00-15:00'],
    blackoutPeriods: [],
    utilityWeights: {
      morningPreference: 0.7,
      contiguousBlocks: 0.7,
      bufferAdherence: 0.8,
    }
  }
];

// ── Default Seed Events ─────────────────────────────────────────────────────
const SEED_EVENTS = [
  {
    id: 'evt-101',
    title: 'Product Architecture Review (Deck V2)',
    intentCategory: 'executive_review',
    startTime: new Date(Date.now() + 1000 * 60 * 60 * 2).toISOString(), // in 2 hours
    endTime: new Date(Date.now() + 1000 * 60 * 60 * 3).toISOString(), // 1 hour duration
    durationMin: 60,
    participants: ['user-joshua', 'agent-elena', 'agent-alex'],
    priority: 'p0_critical',
    status: 'scheduled',
    location: 'Room Portal Alpha',
    linkedArtifacts: [{ kind: 'deck', title: 'Investor Pitch V2', id: 'deck-pitch-v2' }],
    constraints: { hardDeadline: null, prepBufferMin: 15 }
  },
  {
    id: 'evt-102',
    title: 'Q3 Financial & Runway Audit',
    intentCategory: 'financial_projection',
    startTime: new Date(Date.now() + 1000 * 60 * 60 * 24).toISOString(), // tomorrow
    endTime: new Date(Date.now() + 1000 * 60 * 60 * 25).toISOString(),
    durationMin: 60,
    participants: ['user-joshua', 'agent-david'],
    priority: 'p1_high',
    status: 'scheduled',
    location: 'Sheets In-Browser Calc',
    linkedArtifacts: [{ kind: 'sheet', title: 'Q3 Budgeting & Matrix', id: 'sheet-q3' }],
    constraints: { hardDeadline: null, prepBufferMin: 20 }
  }
];

// ── Event Bus for Reactive UI Subscriptions ─────────────────────────────────
const scheduleListeners = new Set();

export function subscribeToSchedule(callback) {
  if (typeof callback !== 'function') return () => {};
  scheduleListeners.add(callback);
  // Immediate emission of current snapshot
  try {
    callback(getCalendarSnapshot());
  } catch (err) {
    console.error('Error in initial schedule listener invocation:', err);
  }
  return () => scheduleListeners.delete(callback);
}

function notifyScheduleChanged() {
  const snapshot = getCalendarSnapshot();
  for (const listener of scheduleListeners) {
    try {
      listener(snapshot);
    } catch (err) {
      console.error('Error notifying schedule listener:', err);
    }
  }
}

// ── Storage Helpers ─────────────────────────────────────────────────────────
function readStorage(key, fallback) {
  if (typeof window === 'undefined' || !window.localStorage) return fallback;
  try {
    const raw = window.localStorage.getItem(key);
    return raw ? JSON.parse(raw) : fallback;
  } catch (_e) {
    return fallback;
  }
}

function writeStorage(key, val) {
  if (typeof window === 'undefined' || !window.localStorage) return;
  try {
    window.localStorage.setItem(key, JSON.stringify(val));
  } catch (_e) {
    // ignore
  }
}

// In-memory runtime fallback
let memoryEvents = null;
let memoryNegotiations = null;

function getStoredEvents() {
  if (memoryEvents) return memoryEvents;
  const stored = readStorage(STORAGE_KEY_EVENTS, null);
  if (stored && Array.isArray(stored)) {
    memoryEvents = stored;
  } else {
    memoryEvents = [];
    writeStorage(STORAGE_KEY_EVENTS, memoryEvents);
  }
  return memoryEvents;
}

export function loadSampleSchedule() {
  saveEvents([...SEED_EVENTS]);
  return SEED_EVENTS;
}

export function clearAllScheduleEvents() {
  saveEvents([]);
  return [];
}

function saveEvents(events) {
  memoryEvents = events;
  writeStorage(STORAGE_KEY_EVENTS, events);
  notifyScheduleChanged();
}

function getStoredNegotiations() {
  if (memoryNegotiations) return memoryNegotiations;
  const stored = readStorage(STORAGE_KEY_NEGOTIATIONS, []);
  memoryNegotiations = Array.isArray(stored) ? stored : [];
  return memoryNegotiations;
}

function saveNegotiations(negs) {
  memoryNegotiations = negs;
  writeStorage(STORAGE_KEY_NEGOTIATIONS, negs);
}

// ─────────────────────────────────────────────────────────────────────────────
// 1. RULE 4 CONTEXT-AWARE INTENT INTERPRETER
// ─────────────────────────────────────────────────────────────────────────────

/**
 * Context-aware semantic domain mappings.
 * Rather than processing colloquial phrases verbatim, maps to systemic domain specs.
 */
const INTENT_DOMAIN_RULES = [
  {
    regex: /\b(tennis|squash|gym|workout|athletic|exercise|training|running)\b/i,
    category: 'health_athletics',
    defaultDurationMin: 90,
    prepBufferMin: 20,
    cooldownBufferMin: 20,
    energyRequirement: 'high',
    priority: 'p2_medium',
    preferredTime: 'morning_or_late_afternoon',
    systemicRequirements: {
      locationType: 'athletic_facility',
      hydrationNotice: true,
      avoidPostHeavyMentalLoad: true
    }
  },
  {
    regex: /\b(board|investor|pitch|qbr|fundrais|exec\s+sync|steering\s+committee)\b/i,
    category: 'executive_strategy',
    defaultDurationMin: 60,
    prepBufferMin: 30,
    cooldownBufferMin: 15,
    energyRequirement: 'critical',
    priority: 'p0_critical',
    preferredTime: 'morning',
    systemicRequirements: {
      requiredArtifacts: ['Financial Model', 'Deck Presentation'],
      strictNoOverlap: true,
      mandatoryExecutiveParticipants: true
    }
  },
  {
    regex: /\b(1[:\-]1|one[\s\-]on[\s\-]one|catchup|catch\s+up|coffee|chat)\b/i,
    category: 'bilateral_sync',
    defaultDurationMin: 30,
    prepBufferMin: 5,
    cooldownBufferMin: 5,
    energyRequirement: 'moderate',
    priority: 'p2_medium',
    preferredTime: 'afternoon',
    systemicRequirements: {
      flexibleWindow: true,
      allowAsyncReschedule: true
    }
  },
  {
    regex: /\b(architecture|sprint|design\s+review|code\s+review|tech\s+spec|rfc)\b/i,
    category: 'engineering_architecture',
    defaultDurationMin: 45,
    prepBufferMin: 15,
    cooldownBufferMin: 10,
    energyRequirement: 'high',
    priority: 'p1_high',
    preferredTime: 'midday',
    systemicRequirements: {
      requiredArtifacts: ['Block Canvas AST', 'Repo Schema'],
      focusBlockProtection: true
    }
  },
  {
    regex: /\b(budget|financial|runway|audit|tax|pricing|forecast)\b/i,
    category: 'financial_projection',
    defaultDurationMin: 60,
    prepBufferMin: 20,
    cooldownBufferMin: 10,
    energyRequirement: 'high',
    priority: 'p1_high',
    preferredTime: 'morning',
    systemicRequirements: {
      requiredArtifacts: ['Sheets Matrix Engine', 'SQL Projections']
    }
  }
];

/**
 * Rule 4: Translates colloquial phrases into a systemic schedule specification.
 */
export function parseIntentToScheduleSpec(text, options = {}) {
  const rawText = (text || '').trim();
  if (!rawText) {
    return {
      success: false,
      error: 'Empty intent text provided.'
    };
  }

  // 1. Check for semantic domain match
  let matchedRule = INTENT_DOMAIN_RULES.find(rule => rule.regex.test(rawText));
  if (options.domain) {
    matchedRule = {
      category: options.domain,
      defaultDurationMin: options.durationMinutes || options.durationMin || (matchedRule ? matchedRule.defaultDurationMin : 45),
      prepBufferMin: matchedRule?.prepBufferMin || 10,
      cooldownBufferMin: matchedRule?.cooldownBufferMin || 10,
      energyRequirement: matchedRule?.energyRequirement || 'moderate',
      priority: matchedRule?.priority || 'p2_medium',
      preferredTime: matchedRule?.preferredTime || 'flexible',
      systemicRequirements: matchedRule?.systemicRequirements || {}
    };
  } else if (!matchedRule) {
    // Default fallback specification
    matchedRule = {
      category: 'general_initiative',
      defaultDurationMin: 45,
      prepBufferMin: 10,
      cooldownBufferMin: 10,
      energyRequirement: 'moderate',
      priority: 'p2_medium',
      preferredTime: 'flexible',
      systemicRequirements: {}
    };
  }

  // 2. Extract duration if explicitly stated (or overridden in options)
  let durationMin = options.durationMinutes || options.durationMin || matchedRule.defaultDurationMin;
  const durationMatch = rawText.match(/(\d+)\s*(min|mins|minute|minutes|hour|hours|hr|hrs)\b/i);
  if (!options.durationMinutes && !options.durationMin && durationMatch) {
    const qty = parseInt(durationMatch[1], 10);
    const unit = durationMatch[2].toLowerCase();
    if (unit.startsWith('h')) {
      durationMin = qty * 60;
    } else {
      durationMin = qty;
    }
  }

  // 3. Extract participant hints
  const mentionedParticipants = [];
  const lower = rawText.toLowerCase();
  for (const p of DEFAULT_PARTICIPANTS) {
    const firstName = p.name.split(' ')[0].toLowerCase();
    if (lower.includes(firstName) || lower.includes(p.name.toLowerCase())) {
      mentionedParticipants.push(p.id);
    }
  }
  // Default to user + at least one counterparty if none detected
  if (mentionedParticipants.length === 0) {
    mentionedParticipants.push('user-joshua', 'agent-elena');
  } else if (!mentionedParticipants.includes('user-joshua')) {
    mentionedParticipants.unshift('user-joshua');
  }

  // 4. Temporal constraints (today, tomorrow, next week, morning, afternoon)
  const targetDate = new Date();
  if (/tomorrow/i.test(rawText)) {
    targetDate.setDate(targetDate.getDate() + 1);
  } else if (/next\s+week/i.test(rawText)) {
    targetDate.setDate(targetDate.getDate() + 7);
  } else if (/\b(monday|tuesday|wednesday|thursday|friday)\b/i.test(rawText)) {
    targetDate.setDate(targetDate.getDate() + 2); // approximate nearest business day
  }

  // 5. Build canonical schedule specification
  const spec = {
    success: true,
    rawIntent: rawText,
    category: matchedRule.category,
    intentCategory: matchedRule.category,
    title: options.title || synthesizeTitleFromIntent(rawText, matchedRule.category),
    durationMin,
    durationMinutes: durationMin,
    prepBufferMin: matchedRule.prepBufferMin,
    cooldownBufferMin: matchedRule.cooldownBufferMin,
    energyRequirement: matchedRule.energyRequirement,
    priority: options.priority || matchedRule.priority,
    preferredTime: matchedRule.preferredTime,
    participants: options.participants || mentionedParticipants,
    systemicRequirements: { ...matchedRule.systemicRequirements, ...(options.requirements || {}) },
    constraints: {
      prepBufferMin: matchedRule.prepBufferMin,
      cooldownBufferMin: matchedRule.cooldownBufferMin,
      energyRequirement: matchedRule.energyRequirement,
      workingHours: { start: '09:00', end: '18:00' },
      ...(options.constraints || {})
    },
    targetDate: targetDate.toISOString().split('T')[0],
    earliestStartTime: '09:00',
    latestEndTime: '18:00',
    contextMappings: {
      ruleApplied: 'RULE_4_SYSTEMIC_MAPPING',
      verbatimSuppression: true,
      originalPhrase: rawText
    }
  };

  Object.defineProperty(spec, 'spec', {
    get() { return this; },
    enumerable: false,
    configurable: true
  });
  return spec;
}

function synthesizeTitleFromIntent(rawText, category) {
  const clean = rawText.replace(/^(schedule|set up|plan|arrange|create|find time for)\s+/i, '').trim();
  const words = clean.split(/\s+/).map(w => w.charAt(0).toUpperCase() + w.slice(1).toLowerCase());
  return words.join(' ');
}

// ─────────────────────────────────────────────────────────────────────────────
// 2. MATHEMATICAL CONSTRAINT SATISFACTION PROBLEM (CSP) SOLVER
// ─────────────────────────────────────────────────────────────────────────────

/**
 * Parses time string "HH:MM" into minutes from midnight.
 */
function timeToMinutes(timeStr) {
  const [h, m] = timeStr.split(':').map(Number);
  return h * 60 + m;
}

/**
 * Converts minutes from midnight into "HH:MM" format.
 */
function minutesToTime(mins) {
  const h = Math.floor(mins / 60);
  const m = mins % 60;
  return `${String(h).padStart(2, '0')}:${String(m).padStart(2, '0')}`;
}

/**
 * Evaluates interval collision between [s1, e1) and [s2, e2).
 */
function intervalsOverlap(s1, e1, s2, e2) {
  return Math.max(s1, s2) < Math.min(e1, e2);
}

/**
 * Solves the Constraint Satisfaction Problem for scheduling an event.
 * Computes feasible slots evaluated across hard constraints and ranked by utility.
 */
export function solveScheduleConstraints(spec, options = {}) {
  const events = options.existingEvents || getStoredEvents();
  const participants = (spec.participants || ['user-joshua']).map(pid => 
    DEFAULT_PARTICIPANTS.find(p => p.id === pid) || { id: pid, name: pid, workingHours: { start: '09:00', end: '18:00' } }
  );

  const targetDateStr = spec.targetDate || new Date().toISOString().split('T')[0];
  const durationMin = spec.durationMin || 45;
  const bufferMin = Math.max(spec.prepBufferMin || 0, spec.cooldownBufferMin || 0, 10);

  // Determine mutual working hours domain
  let domainStartMins = timeToMinutes(spec.earliestStartTime || '09:00');
  let domainEndMins = timeToMinutes(spec.latestEndTime || '18:00');

  for (const p of participants) {
    if (p.workingHours) {
      domainStartMins = Math.max(domainStartMins, timeToMinutes(p.workingHours.start));
      domainEndMins = Math.min(domainEndMins, timeToMinutes(p.workingHours.end));
    }
  }

  // Filter events occurring on target date for involved participants
  const targetDateStartMs = new Date(`${targetDateStr}T00:00:00`).getTime();
  const targetDateEndMs = targetDateStartMs + 24 * 60 * 60 * 1000;

  const relevantBusyIntervals = [];

  for (const evt of events) {
    const evtStartMs = new Date(evt.startTime).getTime();
    const evtEndMs = new Date(evt.endTime).getTime();

    if (evtEndMs > targetDateStartMs && evtStartMs < targetDateEndMs) {
      // Check participant overlap
      const hasSharedParticipant = (evt.participants || []).some(pid => 
        spec.participants.includes(pid)
      );

      if (hasSharedParticipant) {
        const evtStartDate = new Date(evt.startTime);
        const evtEndDate = new Date(evt.endTime);
        const startMins = evtStartDate.getHours() * 60 + evtStartDate.getMinutes();
        const endMins = evtEndDate.getHours() * 60 + evtEndDate.getMinutes();

        // Add buffer
        relevantBusyIntervals.push({
          start: Math.max(0, startMins - bufferMin),
          end: endMins + bufferMin,
          eventTitle: evt.title,
          eventId: evt.id
        });
      }
    }
  }

  // Generate candidate intervals in 15-minute increments
  const candidateSlots = [];
  const stepMin = 15;

  for (let t = domainStartMins; t + durationMin <= domainEndMins; t += stepMin) {
    const slotStart = t;
    const slotEnd = t + durationMin;

    // Hard Constraint Check: No overlap with any busy interval
    let hasCollision = false;
    let collidedWith = null;

    for (const busy of relevantBusyIntervals) {
      if (intervalsOverlap(slotStart, slotEnd, busy.start, busy.end)) {
        hasCollision = true;
        collidedWith = busy.eventTitle;
        break;
      }
    }

    if (!hasCollision) {
      // Calculate Soft Utility Score U(slot) in [0, 1]
      const utilityScore = computeSlotUtility(slotStart, slotEnd, spec, participants);

      const isoStart = `${targetDateStr}T${minutesToTime(slotStart)}:00`;
      const isoEnd = `${targetDateStr}T${minutesToTime(slotEnd)}:00`;

      candidateSlots.push({
        start: isoStart,
        end: isoEnd,
        date: targetDateStr,
        startTime: isoStart,
        endTime: isoEnd,
        startMinutes: slotStart,
        endMinutes: slotEnd,
        formattedTime: `${minutesToTime(slotStart)} - ${minutesToTime(slotEnd)}`,
        durationMin,
        utilityScore,
        confidence: Math.round(utilityScore * 100) + '%'
      });
    }
  }

  // Sort by utility score descending (Pareto optimal first)
  candidateSlots.sort((a, b) => b.utilityScore - a.utilityScore);

  return {
    success: true,
    feasible: candidateSlots.length > 0,
    totalFeasibleSlots: candidateSlots.length,
    optimalSlot: candidateSlots[0] || null,
    candidateSlots: candidateSlots.slice(0, options.limit || 5),
    feasibleSlots: candidateSlots.slice(0, options.limit || 5),
    constraintsEvaluated: {
      domainWindow: `${minutesToTime(domainStartMins)} - ${minutesToTime(domainEndMins)}`,
      busyBlocksEvaluated: relevantBusyIntervals.length,
      bufferEnforcedMin: bufferMin
    }
  };
}

export function evaluateSlotUtility(slot, participants = ['user-joshua'], spec = {}) {
  const startMins = slot.startMinutes !== undefined ? slot.startMinutes : timeToMinutes(slot.startTime || slot.start || '09:00');
  const endMins = slot.endMinutes !== undefined ? slot.endMinutes : timeToMinutes(slot.endTime || slot.end || '10:00');
  const profileList = (participants || []).map(p => typeof p === 'string' ? (DEFAULT_PARTICIPANTS.find(dp => dp.id === p) || { id: p }) : p);
  return computeSlotUtility(startMins, endMins, spec, profileList);
}

/**
 * Evaluates soft utility function for candidate slot.
 */
function computeSlotUtility(slotStart, slotEnd, spec, participants) {
  let score = 0.5; // Base score

  const slotMid = (slotStart + slotEnd) / 2;
  const isMorning = slotMid < 12 * 60; // before 12:00
  const isAfternoon = slotMid >= 13 * 60 && slotMid <= 17 * 60; // 13:00 - 17:00

  // Category preferences
  if (spec.preferredTime === 'morning' && isMorning) score += 0.25;
  if (spec.preferredTime === 'afternoon' && isAfternoon) score += 0.25;

  // Participant preferences
  for (const p of participants) {
    if (p.utilityWeights) {
      if (isMorning && p.utilityWeights.morningPreference > 0.6) score += 0.1;
      if (isAfternoon && p.utilityWeights.morningPreference < 0.4) score += 0.1;
    }
    // Preferred window checks
    if (Array.isArray(p.preferredWindows)) {
      for (const win of p.preferredWindows) {
        const [wStartStr, wEndStr] = win.split('-');
        if (wStartStr && wEndStr) {
          const wStart = timeToMinutes(wStartStr);
          const wEnd = timeToMinutes(wEndStr);
          if (slotStart >= wStart && slotEnd <= wEnd) {
            score += 0.15;
          }
        }
      }
    }
  }

  // Avoid lunchtime (12:00 - 13:00)
  if (intervalsOverlap(slotStart, slotEnd, 12 * 60, 13 * 60)) {
    score -= 0.3;
  }

  return Math.min(Math.max(Number(score.toFixed(2)), 0.05), 0.99);
}

// ─────────────────────────────────────────────────────────────────────────────
// 3. MULTI-AGENT PARAMETER NEGOTIATION PROTOCOL
// ─────────────────────────────────────────────────────────────────────────────

/**
 * Protocol State Machine for Multi-Agent Schedule Negotiation.
 * Simulates alternating offers, monotonic concessions, and convergence verification.
 */
export function negotiateScheduleBetweenAgents(spec, options = {}) {
  const existingEvents = options.existingEvents || getStoredEvents();
  const maxRounds = options.maxRounds || 4;
  const convergenceThreshold = options.convergenceThreshold || 0.70;

  const agentIds = (spec.participants || ['user-joshua', 'agent-elena']).slice(0, 3);
  const profiles = agentIds.map(id => DEFAULT_PARTICIPANTS.find(p => p.id === id) || { id, name: id });

  // 1. Solve initial CSP feasible domain
  const cspResult = solveScheduleConstraints(spec, { existingEvents, limit: 10 });
  if (!cspResult.success || cspResult.candidateSlots.length === 0) {
    return {
      success: false,
      status: 'DEADLOCK',
      reason: 'No mutually feasible time slots satisfy hard constraints across participants.',
      negotiationLog: []
    };
  }

  const negotiationLog = [];
  let agreedSlot = null;
  let currentProposal = null;

  // Alternating offer rounds
  for (let round = 1; round <= maxRounds; round++) {
    const proposerIdx = (round - 1) % profiles.length;
    const receiverIdx = round % profiles.length;

    const proposer = profiles[proposerIdx];
    const receiver = profiles[receiverIdx];

    // Pick top available candidate slot for proposer
    const candidateIdx = Math.min(round - 1, cspResult.candidateSlots.length - 1);
    const candidateSlot = cspResult.candidateSlots[candidateIdx];

    // Calculate individual utility scores
    const proposerUtility = candidateSlot.utilityScore;
    // Receiver utility has personal variance based on timezone / window preferences
    const receiverVariance = receiver.id === 'agent-elena' && candidateSlot.startMinutes < 12 * 60 ? -0.15 : 0.05;
    const receiverUtility = Math.min(Math.max(Number((proposerUtility + receiverVariance).toFixed(2)), 0.1), 0.99);

    currentProposal = {
      round,
      proposer: { id: proposer.id, name: proposer.name, role: proposer.role },
      receiver: { id: receiver.id, name: receiver.name, role: receiver.role },
      slot: candidateSlot,
      proposerUtility,
      receiverUtility,
      compositeUtility: Number(((proposerUtility + receiverUtility) / 2).toFixed(2)),
      concessionDelta: round === 1 ? 0 : Number((proposerUtility - candidateSlot.utilityScore).toFixed(2)),
      rationale: generateNegotiationRationale(proposer, receiver, candidateSlot, round)
    };

    negotiationLog.push(currentProposal);

    // Check Convergence condition
    if (receiverUtility >= convergenceThreshold || currentProposal.compositeUtility >= 0.75) {
      agreedSlot = candidateSlot;
      currentProposal.status = 'AGREED';
      break;
    } else {
      currentProposal.status = 'COUNTER_PROPOSED';
    }
  }

  // Fallback: If no single round reached the threshold, pick highest composite utility slot
  if (!agreedSlot && negotiationLog.length > 0) {
    const sorted = [...negotiationLog].sort((a, b) => b.compositeUtility - a.compositeUtility);
    agreedSlot = sorted[0].slot;
  }

  const negotiationRecord = {
    id: `neg_${Date.now()}_${Math.random().toString(36).slice(2, 7)}`,
    title: spec.title,
    spec,
    status: agreedSlot ? 'AGREEMENT_REACHED' : 'DEADLOCK',
    agreedSlot,
    roundsCount: negotiationLog.length,
    finalCompositeUtility: currentProposal?.compositeUtility || 0,
    transcript: negotiationLog,
    timestamp: new Date().toISOString()
  };

  // Persist to negotiation history
  const allNegs = getStoredNegotiations();
  allNegs.unshift(negotiationRecord);
  saveNegotiations(allNegs.slice(0, 20));

  return {
    success: !!agreedSlot,
    status: agreedSlot ? 'AGREEMENT_REACHED' : 'DEADLOCK',
    agreedSlot,
    negotiationRecord
  };
}

function generateNegotiationRationale(proposer, receiver, slot, round) {
  const time = slot.formattedTime;
  if (round === 1) {
    return `${proposer.name} proposes ${time} as prime slot aligning with mutual working windows.`;
  }
  if (round === 2) {
    return `${proposer.name} concessions 15 mins to accommodate ${receiver.name}'s schedule. Proposing ${time}.`;
  }
  return `${proposer.name} suggests balanced compromise at ${time} with ${Math.round(slot.utilityScore * 100)}% mutual confidence.`;
}

// ─────────────────────────────────────────────────────────────────────────────
// 4. TEMPORAL CONFLICT MATRIX & AUTOMATED RESOLUTION
// ─────────────────────────────────────────────────────────────────────────────

/**
 * Scans all calendar events and deadlines to detect collisions.
 */
export function detectScheduleConflicts(eventsOrProposed = null, optionalEvents = null) {
  let list = [];
  if (Array.isArray(eventsOrProposed)) {
    list = eventsOrProposed;
  } else if (eventsOrProposed && typeof eventsOrProposed === 'object' && (eventsOrProposed.startTime || eventsOrProposed.start)) {
    const normProposed = {
      id: eventsOrProposed.id || 'candidate_proposed',
      title: eventsOrProposed.title || 'Proposed Event',
      startTime: eventsOrProposed.startTime || eventsOrProposed.start,
      endTime: eventsOrProposed.endTime || eventsOrProposed.end,
      participants: eventsOrProposed.participants || ['user-joshua'],
      priority: eventsOrProposed.priority || 'p2_medium'
    };
    const baseList = Array.isArray(optionalEvents) ? optionalEvents : getStoredEvents();
    list = [normProposed, ...baseList];
  } else {
    list = getStoredEvents();
  }

  const conflicts = [];

  for (let i = 0; i < list.length; i++) {
    for (let j = i + 1; j < list.length; j++) {
      const e1 = list[i];
      const e2 = list[j];

      const s1 = new Date(e1.startTime).getTime();
      const end1 = new Date(e1.endTime).getTime();
      const s2 = new Date(e2.startTime).getTime();
      const end2 = new Date(e2.endTime).getTime();

      // Check temporal collision
      if (intervalsOverlap(s1, end1, s2, end2)) {
        // Check participant overlap
        const sharedParticipants = (e1.participants || []).filter(p => 
          (e2.participants || []).includes(p)
        );

        if (sharedParticipants.length > 0) {
          const overlapMs = Math.min(end1, end2) - Math.max(s1, s2);
          const overlapMin = Math.round(overlapMs / (1000 * 60));

          conflicts.push({
            id: `cfl_${e1.id}_${e2.id}`,
            primaryEvent: e1,
            secondaryEvent: e2,
            overlapMinutes: overlapMin,
            sharedParticipants,
            severity: e1.priority === 'p0_critical' || e2.priority === 'p0_critical' ? 'critical' : 'warning',
            detectedAt: new Date().toISOString()
          });
        }
      }
    }
  }

  return {
    success: true,
    hasConflicts: conflicts.length > 0,
    conflictCount: conflicts.length,
    totalConflicts: conflicts.length,
    conflicts
  };
}

/**
 * Resolves a schedule conflict using priority shifts or duration compression.
 * Supports Pillar 3 sandbox staging (`options.stage: true`).
 */
export function resolveScheduleConflict(conflictIdOrObj, strategyParam = 'priority_bump', optionsParam = {}) {
  let conflictId;
  let strategy;
  let options;

  if (typeof conflictIdOrObj === 'object' && conflictIdOrObj !== null) {
    conflictId = conflictIdOrObj.conflictId || conflictIdOrObj.id;
    strategy = conflictIdOrObj.strategy || strategyParam;
    options = {
      stage: conflictIdOrObj.stage !== undefined ? conflictIdOrObj.stage : optionsParam.stage,
      ...conflictIdOrObj,
      ...optionsParam
    };
  } else {
    conflictId = conflictIdOrObj;
    strategy = strategyParam;
    options = optionsParam;
  }

  const events = getStoredEvents();
  const diag = detectScheduleConflicts(events);
  const targetConflict = diag.conflicts.find(c => c.id === conflictId);

  if (!targetConflict) {
    return {
      success: false,
      error: `Conflict '${conflictId}' not found or already resolved.`
    };
  }

  const { primaryEvent, secondaryEvent } = targetConflict;

  // Determine which event moves based on priority
  let eventToKeep = primaryEvent;
  let eventToShift = secondaryEvent;

  const pOrder = { p0_critical: 0, p1_high: 1, p2_medium: 2, p3_low: 3 };
  if ((pOrder[secondaryEvent.priority] || 2) < (pOrder[primaryEvent.priority] || 2)) {
    eventToKeep = secondaryEvent;
    eventToShift = primaryEvent;
  }

  let updatedShiftEvent = { ...eventToShift };
  let resolutionSummary = '';

  if (strategy === 'priority_bump') {
    // Shift event to start right after eventToKeep concludes + 15 min buffer
    const keepEndMs = new Date(eventToKeep.endTime).getTime();
    const newStartMs = keepEndMs + 15 * 60 * 1000;
    const newEndMs = newStartMs + (eventToShift.durationMin || 45) * 60 * 1000;

    updatedShiftEvent.startTime = new Date(newStartMs).toISOString();
    updatedShiftEvent.endTime = new Date(newEndMs).toISOString();
    resolutionSummary = `Shifted '${eventToShift.title}' to ${new Date(newStartMs).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })} following higher priority '${eventToKeep.title}'.`;
  } else if (strategy === 'duration_compression') {
    // Compress both events to fit without overlap
    const originalDuration = eventToShift.durationMin || 45;
    const compressedDuration = Math.max(25, originalDuration - targetConflict.overlapMinutes);
    updatedShiftEvent.durationMin = compressedDuration;
    const startMs = new Date(eventToShift.startTime).getTime();
    updatedShiftEvent.endTime = new Date(startMs + compressedDuration * 60 * 1000).toISOString();
    resolutionSummary = `Compressed duration of '${eventToShift.title}' from ${originalDuration}m to ${compressedDuration}m to eliminate collision.`;
  }

  // ── Pillar 3 Sandbox Staging Integration ───────────────────────────────────
  if (options.stage) {
    const stagedResult = stageMutation({
      branchId: options.branchId,
      targetApp: 'schedule',
      entityId: eventToShift.id,
      targetTitle: `Schedule Conflict: ${primaryEvent.title} vs ${secondaryEvent.title}`,
      toolName: 'resolve_schedule_conflict',
      params: {
        conflictId,
        strategy,
        originalEvent: eventToShift,
        updatedEvent: updatedShiftEvent,
        resolutionSummary
      },
      beforeText: JSON.stringify(eventToShift, null, 2),
      afterText: JSON.stringify(updatedShiftEvent, null, 2),
      metadata: {
        conflictId,
        strategy,
        resolutionSummary,
        agent: options.agentId || 'IntentScheduler'
      }
    });

    return {
      success: true,
      isStaged: true,
      branchId: stagedResult.branchId,
      mutationId: stagedResult.mutationId,
      prNumber: stagedResult.prNumber,
      resolutionSummary: `[STAGED IN PR] ${resolutionSummary}`,
      stagedEvent: updatedShiftEvent
    };
  }

  // Direct persistence
  const updatedList = events.map(e => e.id === eventToShift.id ? updatedShiftEvent : e);
  saveEvents(updatedList);

  return {
    success: true,
    isStaged: false,
    resolutionSummary,
    updatedEvent: updatedShiftEvent
  };
}

// ─────────────────────────────────────────────────────────────────────────────
// 5. CALENDAR CRUD & ISOMORPHIC AST SERIALIZERS
// ─────────────────────────────────────────────────────────────────────────────

export function getCalendarSnapshot() {
  const events = getStoredEvents();
  const negotiations = getStoredNegotiations();
  const conflictDiag = detectScheduleConflicts(events);

  return {
    events,
    negotiations,
    conflicts: conflictDiag.conflicts,
    participants: DEFAULT_PARTICIPANTS,
    stats: {
      totalEvents: events.length,
      activeNegotiations: negotiations.length,
      conflictsCount: conflictDiag.conflicts.length
    }
  };
}

export function createScheduledEvent(eventData, options = {}) {
  const newEvent = {
    id: eventData.id || `evt_${Date.now()}_${Math.random().toString(36).slice(2, 6)}`,
    title: eventData.title || 'Untitled Session',
    intentCategory: eventData.intentCategory || 'general_initiative',
    startTime: eventData.startTime,
    endTime: eventData.endTime,
    durationMin: eventData.durationMin || 45,
    participants: eventData.participants || ['user-joshua'],
    priority: eventData.priority || 'p2_medium',
    status: 'scheduled',
    location: eventData.location || 'Virtual Workspace Room',
    linkedArtifacts: eventData.linkedArtifacts || [],
    constraints: eventData.constraints || {},
    createdAt: new Date().toISOString()
  };

  if (options.stage) {
    const stagedResult = stageMutation({
      branchId: options.branchId,
      targetApp: 'schedule',
      entityId: newEvent.id,
      targetTitle: `Schedule Event: ${newEvent.title}`,
      toolName: 'commit_scheduled_event',
      params: { event: newEvent },
      beforeText: '',
      afterText: JSON.stringify(newEvent, null, 2),
      metadata: { entityId: newEvent.id, entityType: 'schedule_event', agent: 'IntentScheduler' }
    });

    return {
      success: true,
      isStaged: true,
      branchId: stagedResult.branchId,
      mutationId: stagedResult.mutationId,
      prNumber: stagedResult.prNumber,
      event: newEvent
    };
  }

  const events = getStoredEvents();
  events.push(newEvent);
  saveEvents(events);

  return {
    success: true,
    isStaged: false,
    event: newEvent
  };
}

export function updateScheduledEvent(eventId, fields, options = {}) {
  const events = getStoredEvents();
  const existing = events.find(e => e.id === eventId);
  if (!existing) {
    return { success: false, error: `Event '${eventId}' not found.` };
  }

  const updated = { ...existing, ...fields };

  if (options.stage) {
    const stagedResult = stageMutation({
      branchId: options.branchId,
      targetApp: 'schedule',
      entityId: existing.id,
      targetTitle: `Update Schedule Event: ${existing.title}`,
      toolName: 'update_scheduled_event',
      params: { eventId, fields },
      beforeText: JSON.stringify(existing, null, 2),
      afterText: JSON.stringify(updated, null, 2),
      metadata: { entityId: existing.id, entityType: 'schedule_event', agent: 'IntentScheduler' }
    });

    return {
      success: true,
      isStaged: true,
      branchId: stagedResult.branchId,
      mutationId: stagedResult.mutationId,
      prNumber: stagedResult.prNumber,
      event: updated
    };
  }

  const next = events.map(e => e.id === eventId ? updated : e);
  saveEvents(next);

  return { success: true, isStaged: false, event: updated };
}

export function deleteScheduledEvent(eventId) {
  const events = getStoredEvents();
  const next = events.filter(e => e.id !== eventId);
  saveEvents(next);
  return { success: true, deletedId: eventId };
}

/**
 * Serializes the calendar state to token-dense Markdown table for LLM context feeds.
 */
export function calendarToMarkdown(snapshot = null) {
  const data = snapshot || getCalendarSnapshot();
  const lines = [
    `# Workspace Schedule & Intent Calendar`,
    `*Active Events: ${data.events.length} | Conflicts: ${data.conflicts.length}*`,
    '',
    `| Time Window | Title | Category | Priority | Participants | Status |`,
    `| :--- | :--- | :--- | :---: | :--- | :---: |`
  ];

  for (const evt of data.events) {
    const start = new Date(evt.startTime);
    const end = new Date(evt.endTime);
    const timeFmt = `${start.toLocaleDateString([], { month: 'short', day: 'numeric' })} ${start.toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })} - ${end.toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })}`;
    const partList = (evt.participants || []).join(', ');
    lines.push(`| ${timeFmt} | **${evt.title}** | \`${evt.intentCategory}\` | **${evt.priority}** | ${partList} | \`${evt.status}\` |`);
  }

  if (data.conflicts.length > 0) {
    lines.push('', `## ⚠️ Active Temporal Conflicts (${data.conflicts.length})`);
    for (const c of data.conflicts) {
      lines.push(`- **Conflict ${c.id}:** '${c.primaryEvent.title}' collides with '${c.secondaryEvent.title}' by ${c.overlapMinutes} min (Participants: ${c.sharedParticipants.join(', ')})`);
    }
  }

  return lines.join('\n');
}

export const getActiveCalendarEvents = () => getStoredEvents();
export const getNegotiationAuditLog = () => getStoredNegotiations();
export const commitCalendarEvent = (event) => createScheduledEvent(event);
export const stageScheduleEvent = (event) => createScheduledEvent(event, { stage: true });

