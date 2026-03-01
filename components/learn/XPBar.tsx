"use client"

import { AnimatePresence, motion } from "framer-motion"
import { Zap } from "lucide-react"
import { ProgressRing } from "@/components/shared/ProgressRing"

interface XPBarProps {
  currentXp: number
  maxXp: number
  recentGain?: number
}

export function XPBar({ currentXp, maxXp, recentGain }: XPBarProps) {
  const percentage = Math.min((currentXp / maxXp) * 100, 100)

  return (
    <div className="flex items-center gap-3 relative">
      <ProgressRing value={percentage} size={44} strokeWidth={3.5} color="amber" />

      <div className="flex items-center gap-1.5">
        <Zap className="w-4 h-4 text-warm-amber" />
        <span className="text-sm font-bold font-mono text-warm-amber">{currentXp}</span>
        <span className="text-xs text-star-faint">/ {maxXp} XP</span>
      </div>

      <AnimatePresence>
        {recentGain && recentGain > 0 && (
          <motion.span
            key={currentXp}
            initial={{ opacity: 1, y: 0 }}
            animate={{ opacity: 0, y: -20 }}
            transition={{ duration: 1.5 }}
            className="text-xs font-bold font-mono text-warm-amber absolute right-0"
          >
            +{recentGain}
          </motion.span>
        )}
      </AnimatePresence>
    </div>
  )
}
