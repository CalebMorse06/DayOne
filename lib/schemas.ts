/**
 * Zod validation schemas for the Gemini API response.
 * Ensures the AI-generated module JSON conforms to our expected structure.
 */

import { z } from "zod"

export const EnvironmentalCueSchema = z.object({
  type: z.enum(["sound", "visual", "feel", "smell"]),
  description: z.string().min(1),
  significance: z.string().min(1),
})

export const MeasurementDataSchema = z.object({
  parameter: z.string().min(1),
  nominal: z.string().min(1),
  tolerance: z.string().min(1),
  instrument: z.string().min(1),
})

export const MicroCardSchema = z.object({
  id: z.string(),
  type: z.enum(["step", "hazard", "tip", "quality", "tool"]),
  title: z.string().min(1),
  body: z.string().min(1),
  videoTimestamp: z.string().optional(),
  imageDescription: z.string().optional(),
  imageUrl: z.string().optional(),
  audioUrl: z.string().optional(),
  difficulty: z.number().int().min(1).max(5).optional(),
  estimatedSeconds: z.number().optional(),
  commonMistakes: z.array(z.string()).optional(),
  watchFor: z.string().optional(),
  relatedCardIds: z.array(z.string()).optional(),
  environmentalCues: z.array(EnvironmentalCueSchema).optional(),
  measurements: MeasurementDataSchema.optional(),
  isCriticalCheckpoint: z.boolean().optional(),
})

export const QuizQuestionSchema = z.object({
  id: z.string(),
  question: z.string().min(1),
  options: z.array(z.string()).min(2).max(4),
  correctIndex: z.number().int().min(0),
  explanation: z.string().min(1),
  relatedCardId: z.string().optional(),
  difficulty: z.number().int().min(1).max(5).optional(),
  commonWrongAnswer: z.string().optional(),
  whyStudentsMiss: z.string().optional(),
})

export const TacitCueSchema = z.object({
  description: z.string().min(1),
  videoTimestamp: z.string().optional(),
  importance: z.enum(["critical", "important", "nice-to-know"]),
})

export const ToolReferenceSchema = z.object({
  name: z.string().min(1),
  purpose: z.string().min(1),
  safetyNotes: z.string().optional(),
})

export const SafetyHazardSchema = z.object({
  description: z.string().min(1),
  severity: z.enum(["high", "medium", "low"]),
  mitigation: z.string().min(1),
})

export const SequenceChallengeSchema = z.object({
  id: z.string(),
  title: z.string().min(1),
  instructions: z.string().min(1),
  steps: z.array(z.string()).min(2),
  correctOrder: z.array(z.number()),
  relatedCardIds: z.array(z.string()).optional(),
})

export const SpotDetailChallengeSchema = z.object({
  id: z.string(),
  question: z.string().min(1),
  acceptableAnswers: z.array(z.string()).min(1),
  hint: z.string().min(1),
  relatedCardId: z.string().optional(),
})

export const FlashChallengeSchema = z.object({
  id: z.string(),
  question: z.string().min(1),
  answer: z.string().min(1),
  timeoutSeconds: z.number().default(15),
  relatedCardId: z.string().optional(),
})

export const SimulationChallengeSchema = z.object({
  id: z.string(),
  type: z.enum(["wire-connect", "dial-set"]),
  title: z.string().min(1),
  instructions: z.string().min(1),
  pins: z.array(z.object({
    id: z.string(),
    label: z.string(),
    color: z.string(),
    targetId: z.string(),
  })).optional(),
  dialTarget: z.object({
    value: z.number(),
    tolerance: z.number(),
    unit: z.string(),
  }).optional(),
  relatedCardId: z.string().optional(),
})

export const VideoCardSchema = z.object({
  id: z.string(),
  title: z.string().min(1),
  frames: z.array(z.string()),
  caption: z.string().min(1),
  durationMs: z.number(),
  startTimestamp: z.string().optional(),
  endTimestamp: z.string().optional(),
  relatedCardIds: z.array(z.string()).optional(),
})

export const InteractiveModelSchema = z.object({
  id: z.string(),
  title: z.string().min(1),
  description: z.string().min(1),
  modelType: z.enum(["lathe-chuck", "circuit-board", "valve-assembly", "generic-machine"]),
  hotspots: z.array(z.object({
    position: z.tuple([z.number(), z.number(), z.number()]),
    label: z.string(),
    description: z.string(),
  })),
  relatedCardId: z.string().optional(),
})

export const LearningModuleSchema = z.object({
  id: z.string(),
  title: z.string().min(1),
  description: z.string().min(1),
  intent: z.string().min(1),
  estimatedDuration: z.string(),
  cards: z.array(MicroCardSchema).min(1),
  quizQuestions: z.array(QuizQuestionSchema).min(1),
  tacitCues: z.array(TacitCueSchema),
  tools: z.array(ToolReferenceSchema),
  safetyHazards: z.array(SafetyHazardSchema),
  transcript: z.string().optional(),
  sourceVideoName: z.string().optional(),
  createdAt: z.string(),
  criticalCheckpoints: z.array(z.string()).optional(),
  sequenceDependencies: z.array(z.string()).optional(),
  overallDifficulty: z.number().min(1).max(5).optional(),
  totalVideoSeconds: z.number().optional(),
  sequenceChallenges: z.array(SequenceChallengeSchema).optional(),
  spotDetailChallenges: z.array(SpotDetailChallengeSchema).optional(),
  flashChallenges: z.array(FlashChallengeSchema).optional(),
  simulationChallenges: z.array(SimulationChallengeSchema).optional(),
  videoCards: z.array(VideoCardSchema).optional(),
  interactiveModels: z.array(InteractiveModelSchema).optional(),
})

/** Validates a raw JSON object against the LearningModule schema */
export function validateModule(data: unknown) {
  return LearningModuleSchema.safeParse(data)
}
