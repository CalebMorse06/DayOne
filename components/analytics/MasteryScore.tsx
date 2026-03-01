"use client"

import { ProgressRing } from "@/components/shared/ProgressRing"

interface MasteryScoreProps {
  score: number // 0-100
  quizAccuracy: number
  avgConfidence: number
  completionPct: number
}

export function MasteryScore({ score, quizAccuracy, avgConfidence, completionPct }: MasteryScoreProps) {
  const color = score >= 70 ? "green" : score >= 40 ? "amber" : "magenta"

  return (
    <div className="flex flex-col items-center">
      <ProgressRing value={score} size={120} strokeWidth={6} color={color} label="mastery" />
      <div className="grid grid-cols-3 gap-4 mt-4 w-full text-center">
        <div>
          <p className="text-xs font-mono font-bold text-star-white">{Math.round(completionPct)}%</p>
          <p className="text-[9px] text-star-faint">Completion</p>
        </div>
        <div>
          <p className="text-xs font-mono font-bold text-star-white">{Math.round(quizAccuracy)}%</p>
          <p className="text-[9px] text-star-faint">Quiz Accuracy</p>
        </div>
        <div>
          <p className="text-xs font-mono font-bold text-star-white">{avgConfidence.toFixed(1)}/5</p>
          <p className="text-[9px] text-star-faint">Confidence</p>
        </div>
      </div>
    </div>
  )
}
