"use client"

import { motion } from "framer-motion"
import {
  AlertTriangle,
  Bookmark,
  Clock,
  TrendingDown,
  ChevronRight,
} from "lucide-react"
import type { MicroCard } from "@/lib/types"
import { cn } from "@/lib/utils"

interface WeakCardInfo {
  card: MicroCard
  reasons: string[]
}

interface SmartReviewProps {
  weakCards: WeakCardInfo[]
  onContinue: () => void
}

function getReasonIcon(reason: string) {
  if (reason.includes("bookmark")) return Bookmark
  if (reason.includes("wrong") || reason.includes("incorrect")) return AlertTriangle
  if (reason.includes("slow") || reason.includes("time")) return Clock
  return TrendingDown
}

export function SmartReview({ weakCards, onContinue }: SmartReviewProps) {
  if (weakCards.length === 0) {
    return null
  }

  return (
    <motion.div
      initial={{ opacity: 0, y: 12 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ duration: 0.35, ease: [0.25, 0.46, 0.45, 0.94] }}
      className="p-5 rounded-2xl bg-space-700 border border-warm-amber/30 border-l-4 border-l-warm-amber min-h-[280px] flex flex-col backdrop-blur-sm shadow-[0_4px_24px_rgba(0,0,0,0.3)]"
    >
      <div className="flex items-center gap-2 mb-1">
        <AlertTriangle className="w-5 h-5 text-warm-amber" />
        <h3 className="text-lg font-bold text-star-white font-display">Review Before You Go</h3>
      </div>
      <p className="text-xs text-star-dim mb-4">
        These cards need another look based on your performance
      </p>

      <div className="space-y-3 flex-1 overflow-y-auto max-h-[400px]">
        {weakCards.map((item, idx) => {
          return (
            <motion.div
              key={item.card.id}
              initial={{ opacity: 0, x: -20 }}
              animate={{ opacity: 1, x: 0 }}
              transition={{ delay: idx * 0.1 }}
              className="p-3 bg-space-800 border border-space-600 rounded-lg"
            >
              <h4 className="text-sm font-semibold text-star-white mb-1">
                {item.card.title}
              </h4>
              <p className="text-xs text-star-dim mb-2 line-clamp-2">
                {item.card.body}
              </p>
              <div className="flex flex-wrap gap-1.5">
                {item.reasons.map((reason) => {
                  const Icon = getReasonIcon(reason)
                  return (
                    <span
                      key={reason}
                      className={cn(
                        "inline-flex items-center gap-1 text-[10px] px-2 py-0.5 rounded-full",
                        "bg-warm-amber/10 text-warm-amber"
                      )}
                    >
                      <Icon className="w-3 h-3" />
                      {reason}
                    </span>
                  )
                })}
              </div>
              {item.card.commonMistakes && item.card.commonMistakes.length > 0 && (
                <div className="mt-2 p-2 bg-neon-magenta/5 rounded border border-neon-magenta/10">
                  <p className="text-[10px] text-neon-magenta font-semibold mb-0.5">Common Mistake:</p>
                  <p className="text-[10px] text-star-dim">{item.card.commonMistakes[0]}</p>
                </div>
              )}
            </motion.div>
          )
        })}
      </div>

      <button
        onClick={onContinue}
        className="mt-4 w-full p-3 bg-warm-amber hover:bg-warm-amber/90 text-space-900 font-semibold rounded-lg transition-colors text-sm flex items-center justify-center gap-2"
      >
        I&apos;ve Reviewed — Continue
        <ChevronRight className="w-4 h-4" />
      </button>
    </motion.div>
  )
}
