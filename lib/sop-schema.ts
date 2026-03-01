import { z } from "zod"
import { MicroCardSchema, QuizQuestionSchema, TacitCueSchema, ToolReferenceSchema, SafetyHazardSchema } from "./schemas"

export const SOPSchema = z.object({
  id: z.string(),
  title: z.string(),
  lastUpdated: z.string(),
  version: z.string().default("1.0.0"),
  objective: z.string(),
  prerequisites: z.array(z.string()),
  ppeRequired: z.array(z.string()),
  toolsRequired: z.array(z.string()),
  procedureSteps: z.array(z.object({
    stepNumber: z.number(),
    title: z.string(),
    action: z.string(),
    checkpoint: z.string().optional(),
    hazardNote: z.string().optional(),
    proTip: z.string().optional()
  })),
  troubleshooting: z.array(z.object({
    symptom: z.string(),
    cause: z.string(),
    remedy: z.string()
  })),
  qualityChecks: z.array(z.string())
})

export type SOP = z.infer<typeof SOPSchema>
