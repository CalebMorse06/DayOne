/**
 * Client-side state management backed by localStorage.
 * Provides a synchronous API for persisting modules, progress, and chat history.
 * Supabase sync happens in the background (fire-and-forget).
 */

import type {
  AppState,
  LearningModule,
  ModuleProgress,
  ChatMessage,
  ConfidenceRating,
  AnalyticsEvent,
  CardAnalytics,
  ModuleAnalytics,
} from "./types"

const STORAGE_KEY = "dayone-state"

const DEFAULT_STATE: AppState = {
  modules: [],
  progress: {},
  chatHistory: [],
  activeModuleId: null,
  totalXp: 0,
  demoMode: false,
  analyticsEvents: {},
}

// --------------- Supabase background sync ---------------

// eslint-disable-next-line @typescript-eslint/no-explicit-any
let _supabase: any = null

function getSupabase() {
  if (!_supabase) {
    try {
      // Dynamic import to avoid SSR issues; supabase.ts exports a client singleton
      // eslint-disable-next-line @typescript-eslint/no-require-imports
      const mod = require("./supabase")
      _supabase = mod.supabase
    } catch {
      // Supabase not configured — that's fine, just skip sync
    }
  }
  return _supabase
}

/** Fire-and-forget background sync to Supabase */
function backgroundSyncToSupabase(state: AppState) {
  const sb = getSupabase()
  if (!sb) return

  sb.auth.getSession().then(({ data: { session } }: { data: { session: any } }) => {
    if (!session?.user) return
    const userId = session.user.id

    // Sync modules
    for (const mod of state.modules) {
      sb.from("courses")
        .upsert({ id: mod.id, user_id: userId, title: mod.title, data: mod })
        .then(() => {})
    }
    // Sync progress
    for (const [courseId, prog] of Object.entries(state.progress)) {
      sb.from("progress")
        .upsert({ user_id: userId, course_id: courseId, data: prog })
        .then(() => {})
    }
  }).catch(() => {})
}

/** One-time pull from Supabase to merge with local state */
export async function syncFromSupabase(): Promise<void> {
  const sb = getSupabase()
  if (!sb) return

  try {
    const { data: { session } } = await sb.auth.getSession()
    if (!session?.user) return

    const state = loadState()
    const { data: dbCourses } = await sb.from("courses").select("data")
    const { data: dbProgress } = await sb.from("progress").select("course_id, data")

    if (dbCourses) {
      const remoteModules = dbCourses.map((c: { data: unknown }) => c.data as LearningModule)
      state.modules = [
        ...remoteModules,
        ...state.modules.filter((lm) => !remoteModules.some((rm: LearningModule) => rm.id === lm.id)),
      ]
    }
    if (dbProgress) {
      dbProgress.forEach((p: { course_id: string; data: unknown }) => {
        state.progress[p.course_id] = p.data as ModuleProgress
      })
    }
    saveState(state)
  } catch {
    // Non-fatal — local data is still available
  }
}

// --------------- Core synchronous API ---------------

/** Loads the full app state from localStorage */
export function loadState(): AppState {
  if (typeof window === "undefined") return DEFAULT_STATE
  try {
    const raw = localStorage.getItem(STORAGE_KEY)
    return raw ? { ...DEFAULT_STATE, ...JSON.parse(raw) } : DEFAULT_STATE
  } catch {
    return DEFAULT_STATE
  }
}

/** Saves the full app state to localStorage and triggers background Supabase sync */
export function saveState(state: AppState): void {
  if (typeof window === "undefined") return
  localStorage.setItem(STORAGE_KEY, JSON.stringify(state))
  backgroundSyncToSupabase(state)
}

/** Adds a new learning module and sets it as active */
export function addModule(module: LearningModule): AppState {
  const state = loadState()
  state.modules = [module, ...state.modules.filter((m) => m.id !== module.id)]
  state.activeModuleId = module.id
  if (!state.progress[module.id]) {
    state.progress[module.id] = {
      moduleId: module.id,
      currentCardIndex: 0,
      completedCardIds: [],
      quizResults: {},
      xp: 0,
      completed: false,
      startedAt: new Date().toISOString(),
      bookmarkedCardIds: [],
      confidenceRatings: [],
      sequenceResults: {},
      spotDetailResults: {},
      flashResults: {},
      cardTimeSpent: {},
      cardViewCount: {},
    }
  }
  if (!state.analyticsEvents) state.analyticsEvents = {}
  if (!state.analyticsEvents[module.id]) state.analyticsEvents[module.id] = []
  saveState(state)
  return state
}

/** Deletes a course and its progress/analytics */
export function deleteCourse(courseId: string): AppState {
  const state = loadState()
  state.modules = state.modules.filter((m) => m.id !== courseId)
  delete state.progress[courseId]
  if (state.analyticsEvents) delete state.analyticsEvents[courseId]
  if (state.activeModuleId === courseId) {
    state.activeModuleId = state.modules[0]?.id || null
  }

  // Also delete from Supabase in background
  const sb = getSupabase()
  if (sb) {
    sb.auth.getSession().then(({ data: { session } }: { data: { session: any } }) => {
      if (!session?.user) return
      sb.from("courses").delete().match({ id: courseId, user_id: session.user.id }).then(() => {})
      sb.from("progress").delete().match({ course_id: courseId, user_id: session.user.id }).then(() => {})
    }).catch(() => {})
  }

  saveState(state)
  return state
}

/** Resets all data — clean slate */
export function resetAllData(): void {
  if (typeof window === "undefined") return
  localStorage.removeItem(STORAGE_KEY)
}

/** Gets the currently active module */
export function getActiveModule(): LearningModule | null {
  const state = loadState()
  if (!state.activeModuleId) return null
  return state.modules.find((m) => m.id === state.activeModuleId) ?? null
}

/** Gets progress for the active module */
export function getActiveProgress(): ModuleProgress | null {
  const state = loadState()
  if (!state.activeModuleId) return null
  return state.progress[state.activeModuleId] ?? null
}

/** Updates progress for the active module */
export function updateProgress(updates: Partial<ModuleProgress>): AppState {
  const state = loadState()
  if (!state.activeModuleId) return state
  const progress = state.progress[state.activeModuleId]
  if (!progress) return state
  state.progress[state.activeModuleId] = { ...progress, ...updates }
  saveState(state)
  return state
}

/** Adds XP and updates total */
export function addXp(amount: number): AppState {
  const state = loadState()
  state.totalXp += amount
  if (state.activeModuleId && state.progress[state.activeModuleId]) {
    state.progress[state.activeModuleId].xp += amount
  }
  saveState(state)
  return state
}

/** Adds a chat message to history */
export function addChatMessage(message: ChatMessage): AppState {
  const state = loadState()
  state.chatHistory = [...state.chatHistory, message]
  saveState(state)
  return state
}

/** Clears chat history */
export function clearChat(): AppState {
  const state = loadState()
  state.chatHistory = []
  saveState(state)
  return state
}

/** Toggles demo mode */
export function toggleDemoMode(): AppState {
  const state = loadState()
  state.demoMode = !state.demoMode
  saveState(state)
  return state
}

/** Gets a course (module) by its ID */
export function getCourseById(id: string): LearningModule | null {
  const state = loadState()
  return state.modules.find((m) => m.id === id) ?? null
}

/** Lists all courses (modules) ordered by most recent first */
export function listCourses(): LearningModule[] {
  const state = loadState()
  return state.modules
}

/** Gets progress for a specific course by ID */
export function getCourseProgress(courseId: string): ModuleProgress | null {
  const state = loadState()
  return state.progress[courseId] ?? null
}

/** Toggle bookmark on a card */
export function toggleBookmark(moduleId: string, cardId: string): AppState {
  const state = loadState()
  const progress = state.progress[moduleId]
  if (!progress) return state
  if (!progress.bookmarkedCardIds) progress.bookmarkedCardIds = []
  const idx = progress.bookmarkedCardIds.indexOf(cardId)
  if (idx >= 0) {
    progress.bookmarkedCardIds.splice(idx, 1)
  } else {
    progress.bookmarkedCardIds.push(cardId)
  }
  saveState(state)
  return state
}

/** Record time spent on a card */
export function recordCardTime(moduleId: string, cardId: string, timeMs: number): AppState {
  const state = loadState()
  const progress = state.progress[moduleId]
  if (!progress) return state
  if (!progress.cardTimeSpent) progress.cardTimeSpent = {}
  if (!progress.cardViewCount) progress.cardViewCount = {}
  progress.cardTimeSpent[cardId] = (progress.cardTimeSpent[cardId] || 0) + timeMs
  progress.cardViewCount[cardId] = (progress.cardViewCount[cardId] || 0) + 1
  saveState(state)
  return state
}

/** Record confidence rating for a quiz answer */
export function recordConfidence(moduleId: string, rating: ConfidenceRating): AppState {
  const state = loadState()
  const progress = state.progress[moduleId]
  if (!progress) return state
  if (!progress.confidenceRatings) progress.confidenceRatings = []
  progress.confidenceRatings.push(rating)
  saveState(state)
  return state
}

/** Get weak cards — low confidence, wrong answers, slow, or bookmarked */
export function getWeakCards(moduleId: string): string[] {
  const state = loadState()
  const progress = state.progress[moduleId]
  if (!progress) return []

  const weakSet = new Set<string>()

  // Bookmarked cards
  progress.bookmarkedCardIds?.forEach((id) => weakSet.add(id))

  // Wrong quiz answers
  Object.entries(progress.quizResults).forEach(([qId, correct]) => {
    if (!correct) {
      const mod = state.modules.find((m) => m.id === moduleId)
      const quiz = mod?.quizQuestions.find((q) => q.id === qId)
      if (quiz?.relatedCardId) weakSet.add(quiz.relatedCardId)
    }
  })

  // Low confidence ratings
  progress.confidenceRatings?.forEach((r) => {
    if (r.confidence <= 2 || !r.correct) {
      const mod = state.modules.find((m) => m.id === moduleId)
      const quiz = mod?.quizQuestions.find((q) => q.id === r.questionId)
      if (quiz?.relatedCardId) weakSet.add(quiz.relatedCardId)
    }
  })

  // Cards that took 2x+ average time
  if (progress.cardTimeSpent) {
    const times = Object.values(progress.cardTimeSpent)
    if (times.length > 0) {
      const avg = times.reduce((a, b) => a + b, 0) / times.length
      Object.entries(progress.cardTimeSpent).forEach(([cardId, time]) => {
        if (time >= avg * 2) weakSet.add(cardId)
      })
    }
  }

  return Array.from(weakSet)
}

/** Record an analytics event */
export function recordEvent(moduleId: string, event: AnalyticsEvent): AppState {
  const state = loadState()
  if (!state.analyticsEvents) state.analyticsEvents = {}
  if (!state.analyticsEvents[moduleId]) state.analyticsEvents[moduleId] = []
  state.analyticsEvents[moduleId].push(event)
  saveState(state)
  return state
}

/** Compute analytics for a specific card */
export function computeCardAnalytics(moduleId: string, cardId: string): CardAnalytics {
  const state = loadState()
  const progress = state.progress[moduleId]
  const mod = state.modules.find((m) => m.id === moduleId)
  const card = mod?.cards.find((c) => c.id === cardId)
  const events = (state.analyticsEvents?.[moduleId] || []).filter((e) => e.cardId === cardId)

  const viewEvents = events.filter((e) => e.type === "card_view")
  const totalTime = viewEvents.reduce((sum, e) => sum + (e.durationMs || 0), 0)
  const viewCount = progress?.cardViewCount?.[cardId] || viewEvents.length || 0

  // Find related quiz score
  let relatedQuizScore: number | null = null
  if (mod && progress) {
    const relatedQuizzes = mod.quizQuestions.filter((q) => q.relatedCardId === cardId)
    if (relatedQuizzes.length > 0) {
      const answered = relatedQuizzes.filter((q) => q.id in progress.quizResults)
      if (answered.length > 0) {
        const correct = answered.filter((q) => progress.quizResults[q.id]).length
        relatedQuizScore = Math.round((correct / answered.length) * 100)
      }
    }
  }

  return {
    avgTimeMs: viewCount > 0 ? totalTime / viewCount : 0,
    viewCount,
    replayCount: Math.max(0, viewCount - 1),
    relatedQuizScore,
    bookmarked: progress?.bookmarkedCardIds?.includes(cardId) || false,
    difficulty: card?.difficulty || 3,
  }
}

/** Compute module-level analytics */
export function computeModuleAnalytics(moduleId: string): ModuleAnalytics {
  const state = loadState()
  const progress = state.progress[moduleId]
  const mod = state.modules.find((m) => m.id === moduleId)
  const events = state.analyticsEvents?.[moduleId] || []

  // Total time
  const totalTimeMs = events.reduce((sum, e) => sum + (e.durationMs || 0), 0)

  // Quiz accuracy
  const quizEvents = events.filter((e) => e.type === "quiz_answer")
  const quizCorrect = quizEvents.filter((e) => e.correct).length
  const quizAccuracy = quizEvents.length > 0 ? Math.round((quizCorrect / quizEvents.length) * 100) : 0

  // Average confidence
  const confRatings = progress?.confidenceRatings || []
  const avgConfidence = confRatings.length > 0
    ? confRatings.reduce((sum, r) => sum + r.confidence, 0) / confRatings.length
    : 0

  // Mastery score (composite)
  const completionPct = progress
    ? (progress.completedCardIds.length / Math.max(mod?.cards.length || 1, 1)) * 100
    : 0
  const masteryScore = Math.round(
    completionPct * 0.3 + quizAccuracy * 0.4 + (avgConfidence / 5) * 100 * 0.3
  )

  // Weak cards
  const weakCards = getWeakCards(moduleId)

  // Learning velocity (cards per segment of 5 events)
  const cardViewEvents = events.filter((e) => e.type === "card_view")
  const learningVelocity: number[] = []
  for (let i = 0; i < cardViewEvents.length; i += 5) {
    const segment = cardViewEvents.slice(i, i + 5)
    const segTime = segment.reduce((sum, e) => sum + (e.durationMs || 1000), 0)
    learningVelocity.push(segment.length / (segTime / 60000))
  }

  // Difficulty heatmap
  const difficultyHeatmap = (mod?.cards || []).map((card) => {
    const cardAnalytics = computeCardAnalytics(moduleId, card.id)
    return {
      cardId: card.id,
      difficulty: card.difficulty || 3,
      performance: cardAnalytics.relatedQuizScore ?? 50,
    }
  })

  // Accuracy trend (running quiz accuracy)
  const accuracyTrend: number[] = []
  let runningCorrect = 0
  let runningTotal = 0
  quizEvents.forEach((e) => {
    runningTotal++
    if (e.correct) runningCorrect++
    accuracyTrend.push(Math.round((runningCorrect / runningTotal) * 100))
  })

  // Commonly missed pitfalls
  const commonlyMissedPitfalls: { cardId: string; mistake: string }[] = []
  weakCards.forEach((cardId) => {
    const card = mod?.cards.find((c) => c.id === cardId)
    if (card?.commonMistakes?.length) {
      commonlyMissedPitfalls.push({ cardId, mistake: card.commonMistakes[0] })
    }
  })

  return {
    totalTimeMs,
    quizAccuracy,
    avgConfidence,
    masteryScore,
    weakCards,
    learningVelocity,
    difficultyHeatmap,
    accuracyTrend,
    commonlyMissedPitfalls,
  }
}
