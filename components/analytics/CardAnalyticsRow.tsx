"use client"

import { Clock, RotateCcw, Bookmark } from "lucide-react"
import type { CardAnalytics } from "@/lib/types"
import { cn } from "@/lib/utils"

interface CardAnalyticsRowProps {
  cardId: string
  title: string
  type: string
  analytics: CardAnalytics
}

const TYPE_COLORS: Record<string, string> = {
  step: "bg-neon-cyan/10 text-neon-cyan",
  hazard: "bg-neon-magenta/10 text-neon-magenta",
  tip: "bg-neon-orange/10 text-neon-orange",
  quality: "bg-neon-green/10 text-neon-green",
  tool: "bg-space-600 text-star-dim",
}

export function CardAnalyticsRow({ title, type, analytics }: CardAnalyticsRowProps) {
  const formatTime = (ms: number) => {
    if (ms < 1000) return "<1s"
    const s = Math.round(ms / 1000)
    if (s < 60) return `${s}s`
    return `${Math.floor(s / 60)}m ${s % 60}s`
  }

  return (
    <div className="flex items-center gap-3 p-2.5 rounded-lg hover:bg-space-700/50 transition-colors">
      {/* Title + type */}
      <div className="flex-1 min-w-0">
        <p className="text-xs font-semibold text-star-white truncate">{title}</p>
        <span className={cn("text-[9px] px-1.5 py-0.5 rounded-full font-medium", TYPE_COLORS[type] || TYPE_COLORS.step)}>
          {type}
        </span>
      </div>

      {/* Avg time */}
      <div className="flex items-center gap-1 text-[10px] text-star-dim" title="Avg time spent">
        <Clock className="w-3 h-3" />
        <span className="font-mono">{formatTime(analytics.avgTimeMs)}</span>
      </div>

      {/* Replay count */}
      {analytics.replayCount > 0 && (
        <div className="flex items-center gap-1 text-[10px] text-warm-amber" title="Replays">
          <RotateCcw className="w-3 h-3" />
          <span className="font-mono">{analytics.replayCount}</span>
        </div>
      )}

      {/* Quiz score */}
      {analytics.relatedQuizScore !== null && (
        <div
          className={cn(
            "text-[10px] font-mono font-bold px-1.5 py-0.5 rounded-full",
            analytics.relatedQuizScore >= 70
              ? "bg-neon-green/10 text-neon-green"
              : analytics.relatedQuizScore >= 40
              ? "bg-warm-amber/10 text-warm-amber"
              : "bg-retro-coral/10 text-retro-coral"
          )}
        >
          {analytics.relatedQuizScore}%
        </div>
      )}

      {/* Bookmark */}
      {analytics.bookmarked && (
        <Bookmark className="w-3.5 h-3.5 text-warm-amber fill-warm-amber flex-shrink-0" />
      )}
    </div>
  )
}
