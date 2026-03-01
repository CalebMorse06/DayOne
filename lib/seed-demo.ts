/**
 * Seeds realistic demo data so judges see populated analytics, mastery scores,
 * and learning stats without needing to complete a full learning flow.
 */

import type { LearningModule, AppState, AnalyticsEvent, ConfidenceRating } from "./types"
import { loadState, saveState } from "./store"
import sampleModule from "@/demo_assets/sample_module.json"

const MODULE_2: LearningModule = {
  id: "mod_demo_002",
  title: "Welding Joint Preparation & Visual Inspection",
  description:
    "Master the fundamentals of weld joint preparation — from beveling and fit-up to visual inspection criteria that catch defects before NDT.",
  intent: "Prepare welding joints correctly and perform initial visual inspection",
  estimatedDuration: "12 min",
  overallDifficulty: 3,
  totalVideoSeconds: 480,
  criticalCheckpoints: ["card_w003"],
  sequenceDependencies: [],
  cards: [
    {
      id: "card_w001",
      type: "step",
      title: "Read the Welding Procedure Specification (WPS)",
      body: "Before striking an arc, review the WPS for joint type, filler metal, preheat requirements, and interpass temperature limits. The WPS is your contract with the code — deviating without engineering approval is a rejection.",
      videoTimestamp: "00:20",
      difficulty: 2,
      estimatedSeconds: 90,
      commonMistakes: ["Using the wrong filler metal grade", "Skipping preheat on thick sections"],
      isCriticalCheckpoint: false,
    },
    {
      id: "card_w002",
      type: "tool",
      title: "Bevel & Fit-Up Tools",
      body: "Use a grinder with a flap disc for beveling, and hi-lo gauges plus tack welding fixtures for fit-up. Root gap should be verified with feeler gauges — too tight starves the root, too wide causes burn-through.",
      videoTimestamp: "01:10",
      difficulty: 2,
      estimatedSeconds: 120,
      commonMistakes: ["Using a cutting wheel instead of flap disc (too aggressive)"],
      isCriticalCheckpoint: false,
    },
    {
      id: "card_w003",
      type: "hazard",
      title: "Arc Flash & UV Exposure",
      body: "CRITICAL: Always use a minimum shade 10 lens for SMAW, shade 12 for GMAW on steel. A single unprotected flash can cause arc eye (photokeratitis) — feels like sand in your eyes 6-8 hours later. Bystanders within 15 feet also need protection.",
      videoTimestamp: "02:30",
      difficulty: 3,
      estimatedSeconds: 60,
      commonMistakes: ["Lifting the hood too soon to inspect the bead", "Not warning nearby workers before striking"],
      watchFor: "Arc eye symptoms are delayed — you won't know until hours later",
      isCriticalCheckpoint: true,
    },
    {
      id: "card_w004",
      type: "quality",
      title: "Visual Inspection Criteria",
      body: "Check for undercut (>1/32\" is reject), porosity (surface pores indicate gas issues), incomplete fusion (cold lap), and crack indications. Use a fillet weld gauge for leg size verification. Document everything on the inspection report.",
      videoTimestamp: "04:00",
      difficulty: 4,
      estimatedSeconds: 180,
      commonMistakes: ["Missing undercut on the toe of the weld", "Confusing spatter with porosity"],
      isCriticalCheckpoint: false,
    },
    {
      id: "card_w005",
      type: "tip",
      title: "Reading the Puddle",
      body: "Watch the leading edge of the weld puddle — it should be a consistent crescent shape. If it goes concave, you're moving too fast. If it pools wide, slow down the wire feed. The puddle tells you everything the instrument can't.",
      videoTimestamp: "05:15",
      difficulty: 4,
      estimatedSeconds: 60,
      commonMistakes: ["Watching the arc instead of the puddle edge"],
      isCriticalCheckpoint: false,
    },
    {
      id: "card_w006",
      type: "step",
      title: "Interpass Temperature Check",
      body: "Use a contact pyrometer or temp stick between passes. Exceeding the interpass temperature limit (typically 350-500°F depending on material) can degrade the heat-affected zone properties. Let the weldment cool naturally — never quench with water.",
      videoTimestamp: "06:30",
      difficulty: 3,
      estimatedSeconds: 120,
      commonMistakes: ["Quenching hot welds with water", "Skipping temperature checks on thin material"],
      isCriticalCheckpoint: false,
    },
    {
      id: "card_w007",
      type: "step",
      title: "Post-Weld Cleanup & Documentation",
      body: "Remove slag, spatter, and anti-spatter spray residue. Wire brush the completed weld for visual inspection. Complete the weld log with welder ID, WPS number, date, and visual inspection results. This traceability is required by code.",
      videoTimestamp: "08:00",
      difficulty: 2,
      estimatedSeconds: 90,
      commonMistakes: ["Not recording the WPS number on the log", "Incomplete slag removal before inspection"],
      isCriticalCheckpoint: false,
    },
    {
      id: "card_w008",
      type: "tip",
      title: "The Sound of a Good Weld",
      body: "A proper MIG weld sounds like bacon frying — a steady, consistent sizzle. Popping or crackling means wire stick-out is too long or voltage is off. A quiet hiss means you're running too cold. Train your ear alongside your eye.",
      videoTimestamp: "09:00",
      difficulty: 3,
      estimatedSeconds: 45,
      commonMistakes: ["Wearing hearing protection that blocks the cutting sound cues"],
      environmentalCues: [
        { type: "sound", description: "Steady bacon-frying sizzle", significance: "Good parameters — consistent deposition" },
        { type: "sound", description: "Popping or crackling", significance: "Wire stick-out too long or voltage too high" },
      ],
      isCriticalCheckpoint: false,
    },
  ],
  quizQuestions: [
    {
      id: "quiz_w001",
      question: "What minimum lens shade should you use for SMAW?",
      options: ["Shade 5", "Shade 8", "Shade 10", "Shade 14"],
      correctIndex: 2,
      explanation: "SMAW requires a minimum shade 10 to protect against UV radiation from the arc.",
      relatedCardId: "card_w003",
      difficulty: 2,
    },
    {
      id: "quiz_w002",
      question: "What does a concave leading edge on the weld puddle indicate?",
      options: ["Perfect travel speed", "Moving too fast", "Moving too slow", "Wrong filler metal"],
      correctIndex: 1,
      explanation: "A concave leading edge means you're outrunning the puddle — slow down to maintain proper fusion.",
      relatedCardId: "card_w005",
      difficulty: 3,
    },
    {
      id: "quiz_w003",
      question: "Why should you never quench a hot weld with water?",
      options: [
        "It makes cleanup harder",
        "It can crack the heat-affected zone",
        "It wastes water",
        "It creates steam that obscures vision",
      ],
      correctIndex: 1,
      explanation: "Rapid cooling (quenching) can create brittle microstructures and cracking in the HAZ. Always let weldments cool naturally.",
      relatedCardId: "card_w006",
      difficulty: 2,
    },
  ],
  tacitCues: [
    {
      description: "The welder pauses to feel the heat radiating from the joint with the back of a gloved hand before starting the next pass",
      videoTimestamp: "06:45",
      importance: "important",
    },
    {
      description: "An experienced welder adjusts wire speed mid-bead based on sound changes — they're using audio feedback in real-time",
      videoTimestamp: "05:30",
      importance: "critical",
    },
  ],
  tools: [
    { name: "Fillet Weld Gauge", purpose: "Measuring weld leg size and throat thickness", safetyNotes: "Clean before use" },
    { name: "Contact Pyrometer", purpose: "Measuring interpass temperature on the weldment surface" },
    { name: "Hi-Lo Gauge", purpose: "Checking internal alignment (mismatch) at pipe joints" },
  ],
  safetyHazards: [
    {
      description: "Arc flash causing photokeratitis (arc eye)",
      severity: "high",
      mitigation: "Use proper shade lens, warn bystanders, use welding screens",
    },
    {
      description: "Hot metal and slag burns",
      severity: "high",
      mitigation: "Wear leather welding jacket, gloves, and boots. Let parts cool before handling.",
    },
  ],
  sequenceChallenges: [],
  spotDetailChallenges: [],
  flashChallenges: [],
  createdAt: "2026-02-28T14:00:00.000Z",
}

/** Seeds two demo modules with rich progress data and analytics events */
export function seedDemoData(): void {
  const state = loadState()
  const mod1 = sampleModule as unknown as LearningModule

  // Add Module 1 (completed)
  state.modules = [mod1, ...state.modules.filter((m) => m.id !== mod1.id && m.id !== MODULE_2.id)]
  state.modules.push(MODULE_2)
  state.activeModuleId = mod1.id

  // ----- Module 1 progress: fully completed, 67% quiz accuracy -----
  const now = new Date()
  const startTime = new Date(now.getTime() - 25 * 60 * 1000) // started 25 min ago

  state.progress[mod1.id] = {
    moduleId: mod1.id,
    currentCardIndex: 9,
    completedCardIds: mod1.cards.map((c) => c.id),
    quizResults: {
      quiz_001: true,
      quiz_002: true,
      quiz_003: true,
      quiz_004: true,
      quiz_005: false, // wrong
      quiz_006: false, // wrong
    },
    xp: 285,
    completed: true,
    startedAt: startTime.toISOString(),
    completedAt: now.toISOString(),
    bookmarkedCardIds: ["card_004", "card_006", "card_007"],
    confidenceRatings: [
      { questionId: "quiz_001", confidence: 4, correct: true, timestamp: ts(startTime, 3) },
      { questionId: "quiz_002", confidence: 3, correct: true, timestamp: ts(startTime, 6) },
      { questionId: "quiz_003", confidence: 5, correct: true, timestamp: ts(startTime, 8) },
      { questionId: "quiz_004", confidence: 4, correct: true, timestamp: ts(startTime, 12) },
      { questionId: "quiz_005", confidence: 2, correct: false, timestamp: ts(startTime, 16) },
      { questionId: "quiz_006", confidence: 1, correct: false, timestamp: ts(startTime, 20) },
    ],
    sequenceResults: {},
    spotDetailResults: {},
    flashResults: {},
    cardTimeSpent: {
      card_001: 8000,
      card_002: 12000,
      card_003: 10000,
      card_004: 25000, // hazard — 2x+ average
      card_005: 7000,
      card_006: 18000,
      card_007: 15000,
      card_008: 5000,
      card_009: 9000,
      card_010: 6000,
    },
    cardViewCount: {
      card_001: 1,
      card_002: 1,
      card_003: 2,
      card_004: 3,
      card_005: 1,
      card_006: 2,
      card_007: 2,
      card_008: 1,
      card_009: 1,
      card_010: 1,
    },
  }

  // Module 1 analytics events
  const mod1Events: AnalyticsEvent[] = []
  // Card view events
  mod1.cards.forEach((card, i) => {
    const time = state.progress[mod1.id].cardTimeSpent?.[card.id] || 10000
    mod1Events.push({
      type: "card_view",
      cardId: card.id,
      timestamp: ts(startTime, i * 2),
      durationMs: time,
    })
  })
  // Extra views for replayed cards
  ;["card_003", "card_004", "card_006", "card_007"].forEach((cardId, i) => {
    mod1Events.push({
      type: "card_view",
      cardId,
      timestamp: ts(startTime, 20 + i),
      durationMs: 8000,
    })
  })
  // Quiz events
  const quizResults: [string, boolean][] = [
    ["quiz_001", true],
    ["quiz_002", true],
    ["quiz_003", true],
    ["quiz_004", true],
    ["quiz_005", false],
    ["quiz_006", false],
  ]
  quizResults.forEach(([qId, correct], i) => {
    mod1Events.push({
      type: "quiz_answer",
      cardId: qId,
      timestamp: ts(startTime, 3 + i * 3),
      correct,
    })
  })
  // Bookmark events
  ;["card_004", "card_006", "card_007"].forEach((cardId, i) => {
    mod1Events.push({
      type: "bookmark",
      cardId,
      timestamp: ts(startTime, 5 + i * 4),
    })
  })
  // Challenge events
  mod1Events.push(
    { type: "challenge_complete", timestamp: ts(startTime, 10), correct: true, durationMs: 4500 },
    { type: "challenge_complete", timestamp: ts(startTime, 14), correct: true, durationMs: 6200 },
    { type: "challenge_complete", timestamp: ts(startTime, 18), correct: false, durationMs: 12000 },
  )

  if (!state.analyticsEvents) state.analyticsEvents = {}
  state.analyticsEvents[mod1.id] = mod1Events

  // ----- Module 2 progress: 30% complete, in progress -----
  state.progress[MODULE_2.id] = {
    moduleId: MODULE_2.id,
    currentCardIndex: 2,
    completedCardIds: ["card_w001", "card_w002", "card_w003"],
    quizResults: { quiz_w001: true },
    xp: 65,
    completed: false,
    startedAt: ts(startTime, -10),
    bookmarkedCardIds: [],
    confidenceRatings: [
      { questionId: "quiz_w001", confidence: 4, correct: true, timestamp: ts(startTime, -8) },
    ],
    sequenceResults: {},
    spotDetailResults: {},
    flashResults: {},
    cardTimeSpent: {
      card_w001: 7000,
      card_w002: 11000,
      card_w003: 9000,
    },
    cardViewCount: {
      card_w001: 1,
      card_w002: 1,
      card_w003: 1,
    },
  }

  // Module 2 analytics events
  state.analyticsEvents[MODULE_2.id] = [
    { type: "card_view", cardId: "card_w001", timestamp: ts(startTime, -10), durationMs: 7000 },
    { type: "card_view", cardId: "card_w002", timestamp: ts(startTime, -9), durationMs: 11000 },
    { type: "card_view", cardId: "card_w003", timestamp: ts(startTime, -8), durationMs: 9000 },
    { type: "quiz_answer", cardId: "quiz_w001", timestamp: ts(startTime, -7), correct: true },
  ]

  // Set totals
  state.totalXp = 350
  state.demoMode = true

  saveState(state)
}

/** Clears all demo data, resetting to default state */
export function clearDemoData(): void {
  const DEFAULT_STATE: AppState = {
    modules: [],
    progress: {},
    chatHistory: [],
    activeModuleId: null,
    totalXp: 0,
    demoMode: false,
    analyticsEvents: {},
  }
  saveState(DEFAULT_STATE)
}

/** Helper: create ISO timestamp offset by minutes from a base date */
function ts(base: Date, minuteOffset: number): string {
  return new Date(base.getTime() + minuteOffset * 60 * 1000).toISOString()
}
