/**
 * Core TypeScript types for the DayOne micro-learning platform.
 * Defines the data structures for modules, cards, quizzes, and chat.
 */

/** Environmental cue observed during expert work */
export interface EnvironmentalCue {
  type: "sound" | "visual" | "feel" | "smell"
  description: string
  significance: string
}

/** Measurement data with tolerances */
export interface MeasurementData {
  parameter: string
  nominal: string
  tolerance: string
  instrument: string
}

/** A single micro-learning card extracted from video analysis */
export interface MicroCard {
  id: string
  type: "step" | "hazard" | "tip" | "quality" | "tool"
  title: string
  body: string
  videoTimestamp?: string
  imageDescription?: string
  imageUrl?: string
  audioUrl?: string
  difficulty?: number // 1-5
  estimatedSeconds?: number
  commonMistakes?: string[]
  watchFor?: string
  relatedCardIds?: string[]
  environmentalCues?: EnvironmentalCue[]
  measurements?: MeasurementData
  isCriticalCheckpoint?: boolean
}

/** Simulation challenge - wire connect or dial set */
export interface SimulationChallenge {
  id: string
  type: "wire-connect" | "dial-set"
  title: string
  instructions: string
  pins?: Array<{ id: string; label: string; color: string; targetId: string }>
  dialTarget?: { value: number; tolerance: number; unit: string }
  relatedCardId?: string
}

/** Video card - animated frame cross-fade walkthrough */
export interface VideoCard {
  id: string
  title: string
  frames: string[] // array of base64 image URLs
  caption: string
  durationMs: number
  startTimestamp?: string
  endTimestamp?: string
  relatedCardIds?: string[]
}

/** 3D interactive model with clickable hotspots */
export interface InteractiveModel {
  id: string
  title: string
  description: string
  modelType: "lathe-chuck" | "circuit-board" | "valve-assembly" | "generic-machine"
  hotspots: Array<{ position: [number, number, number]; label: string; description: string }>
  relatedCardId?: string
}

/** A multiple-choice knowledge check question */
export interface QuizQuestion {
  id: string
  question: string
  options: string[]
  correctIndex: number
  explanation: string
  relatedCardId?: string
  difficulty?: number // 1-5
  commonWrongAnswer?: string
  whyStudentsMiss?: string
}

/** A tacit knowledge cue observed in the video */
export interface TacitCue {
  description: string
  videoTimestamp?: string
  importance: "critical" | "important" | "nice-to-know"
}

/** A tool or piece of equipment identified in the video */
export interface ToolReference {
  name: string
  purpose: string
  safetyNotes?: string
}

/** A safety hazard identified in the video */
export interface SafetyHazard {
  description: string
  severity: "high" | "medium" | "low"
  mitigation: string
}

/** Sequence challenge - drag steps into correct order */
export interface SequenceChallenge {
  id: string
  title: string
  instructions: string
  steps: string[]
  correctOrder: number[]
  relatedCardIds?: string[]
}

/** Spot-the-detail challenge - text input knowledge check */
export interface SpotDetailChallenge {
  id: string
  question: string
  acceptableAnswers: string[]
  hint: string
  relatedCardId?: string
}

/** Flash recall challenge - timed memory check */
export interface FlashChallenge {
  id: string
  question: string
  answer: string
  timeoutSeconds: number
  relatedCardId?: string
}

/** Confidence rating for a quiz answer */
export interface ConfidenceRating {
  questionId: string
  confidence: number // 1-5
  correct: boolean
  timestamp: string
}

/** A bookmarked card */
export interface CardBookmark {
  cardId: string
  timestamp: string
}

/** The complete module generated from video analysis */
export interface LearningModule {
  id: string
  title: string
  description: string
  intent: string
  estimatedDuration: string
  cards: MicroCard[]
  quizQuestions: QuizQuestion[]
  tacitCues: TacitCue[]
  tools: ToolReference[]
  safetyHazards: SafetyHazard[]
  transcript?: string
  sourceVideoName?: string
  createdAt: string
  criticalCheckpoints?: string[]
  sequenceDependencies?: string[]
  overallDifficulty?: number
  totalVideoSeconds?: number
  sequenceChallenges?: SequenceChallenge[]
  spotDetailChallenges?: SpotDetailChallenge[]
  flashChallenges?: FlashChallenge[]
  simulationChallenges?: SimulationChallenge[]
  videoCards?: VideoCard[]
  interactiveModels?: InteractiveModel[]
}

/** User progress for a specific module */
export interface ModuleProgress {
  moduleId: string
  currentCardIndex: number
  completedCardIds: string[]
  quizResults: Record<string, boolean>
  xp: number
  completed: boolean
  startedAt: string
  completedAt?: string
  bookmarkedCardIds?: string[]
  confidenceRatings?: ConfidenceRating[]
  sequenceResults?: Record<string, { correct: boolean; attempts: number }>
  spotDetailResults?: Record<string, { correct: boolean; attempts: number }>
  flashResults?: Record<string, { recalled: boolean; timeMs: number }>
  cardTimeSpent?: Record<string, number>
  cardViewCount?: Record<string, number>
}

/** A single chat message in Ask mode */
export interface ChatMessage {
  id: string
  role: "user" | "assistant"
  content: string
  citations?: Citation[]
  timestamp: string
}

/** An evidence citation linking an answer to video content */
export interface Citation {
  text: string
  videoTimestamp?: string
  cardId?: string
}

/** Analytics event for tracking learner behavior */
export interface AnalyticsEvent {
  type: "card_view" | "quiz_answer" | "bookmark" | "challenge_complete"
  cardId?: string
  timestamp: string
  durationMs?: number
  correct?: boolean
  confidence?: number
}

/** Per-card analytics computed from events */
export interface CardAnalytics {
  avgTimeMs: number
  viewCount: number
  replayCount: number
  relatedQuizScore: number | null
  bookmarked: boolean
  difficulty: number
}

/** Module-level analytics computed from events */
export interface ModuleAnalytics {
  totalTimeMs: number
  quizAccuracy: number
  avgConfidence: number
  masteryScore: number // composite 0-100
  weakCards: string[]
  learningVelocity: number[] // cards-per-minute per segment
  difficultyHeatmap: { cardId: string; difficulty: number; performance: number }[]
  accuracyTrend: number[] // running quiz accuracy
  commonlyMissedPitfalls: { cardId: string; mistake: string }[]
}

/** App-level state stored in localStorage */
export interface AppState {
  modules: LearningModule[]
  progress: Record<string, ModuleProgress>
  chatHistory: ChatMessage[]
  activeModuleId: string | null
  totalXp: number
  demoMode: boolean
  analyticsEvents: Record<string, AnalyticsEvent[]>
}
