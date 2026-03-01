"use client"

import { cn } from "@/lib/utils"

interface HeatmapCell {
  cardId: string
  difficulty: number
  performance: number
}

interface DifficultyHeatmapProps {
  data: HeatmapCell[]
  cardTitles?: Record<string, string>
}

function getColor(difficulty: number, performance: number): string {
  // High difficulty + low performance = red
  // Low difficulty + high performance = green
  // Middle = amber
  const score = performance - difficulty * 20
  if (score >= 40) return "bg-neon-green/60"
  if (score >= 10) return "bg-neon-green/30"
  if (score >= -10) return "bg-warm-amber/40"
  if (score >= -30) return "bg-warm-amber/60"
  return "bg-retro-coral/50"
}

export function DifficultyHeatmap({ data, cardTitles }: DifficultyHeatmapProps) {
  if (data.length === 0) return null

  return (
    <div>
      <h3 className="text-sm font-semibold text-star-white mb-2">Difficulty Heatmap</h3>
      <div className="flex gap-1 overflow-x-auto pb-2">
        {data.map((cell) => (
          <div
            key={cell.cardId}
            className={cn(
              "flex-shrink-0 w-8 h-8 rounded-md flex items-center justify-center text-[9px] font-mono font-bold text-star-white cursor-default transition-transform hover:scale-110",
              getColor(cell.difficulty, cell.performance)
            )}
            title={`${cardTitles?.[cell.cardId] || cell.cardId}\nDifficulty: ${cell.difficulty}/5\nPerformance: ${cell.performance}%`}
          >
            {cell.difficulty}
          </div>
        ))}
      </div>
      <div className="flex items-center gap-3 mt-1.5">
        <div className="flex items-center gap-1">
          <div className="w-3 h-3 rounded-sm bg-neon-green/60" />
          <span className="text-[9px] text-star-faint">Easy</span>
        </div>
        <div className="flex items-center gap-1">
          <div className="w-3 h-3 rounded-sm bg-warm-amber/50" />
          <span className="text-[9px] text-star-faint">Medium</span>
        </div>
        <div className="flex items-center gap-1">
          <div className="w-3 h-3 rounded-sm bg-retro-coral/50" />
          <span className="text-[9px] text-star-faint">Hard</span>
        </div>
      </div>
    </div>
  )
}
