import { z } from "zod"

export const CertificationSchema = z.object({
  id: z.string(),
  userName: z.string(),
  courseId: z.string(),
  courseTitle: z.string(),
  issuedAt: z.string(),
  masteryScore: z.number(),
  quizAccuracy: z.number(),
  verifiedSkills: z.array(z.string()),
  safetyCompliance: z.enum(["Exemplary", "Standard", "Review Required"]),
  certificationHash: z.string(), // Mock blockchain/integrity hash
})

export type Certification = z.infer<typeof CertificationSchema>
