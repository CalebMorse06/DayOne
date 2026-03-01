"use client"

import { motion } from "framer-motion"
import { Eye, Clock, AlertCircle, Star, Info } from "lucide-react"
import type { TacitCue } from "@/lib/types"
import { cn } from "@/lib/utils"

const IMPORTANCE_CONFIG = {
  critical: {
    border: "border-l-neon-orange",
    icon: AlertCircle,
    iconColor: "text-neon-orange",
    badge: "bg-neon-orange/10 text-neon-orange",
    label: "Critical Insight",
  },
  important: {
    border: "border-l-neon-cyan",
    icon: Star,
    iconColor: "text-neon-cyan",
    badge: "bg-neon-cyan/10 text-neon-cyan",
    label: "Expert Insight",
  },
  "nice-to-know": {
    border: "border-l-star-dim",
    icon: Info,
    iconColor: "text-star-dim",
    badge: "bg-space-600 text-star-dim",
    label: "Good to Know",
  },
}

interface TacitCueCardProps {
  cue: TacitCue
  index: number
  total: number
}

export function TacitCueCard({ cue, index, total }: TacitCueCardProps) {
  const config = IMPORTANCE_CONFIG[cue.importance]
  const Icon = config.icon

  return (
    <motion.div
      initial={{ opacity: 0, scale: 0.95 }}
      animate={{ opacity: 1, scale: 1 }}
      exit={{ opacity: 0, y: -8 }}
      transition={{ duration: 0.35, ease: [0.25, 0.46, 0.45, 0.94] }}
      className={cn(
        "p-5 rounded-2xl bg-space-700 border border-space-600 border-l-4 min-h-[300px] flex flex-col backdrop-blur-sm shadow-[0_4px_24px_rgba(0,0,0,0.3)]",
        config.border
      )}
    >
      {/* Header */}
      <div className="flex items-center justify-between mb-4">
        <span
          className={cn(
            "text-xs font-semibold px-2.5 py-1 rounded-full flex items-center gap-1",
            config.badge
          )}
        >
          <Eye className="w-3 h-3" />
          {config.label}
        </span>
        <span className="text-xs text-star-faint">
          Insight {index + 1} / {total}
        </span>
      </div>

      {/* Icon + Title */}
      <div className="flex items-start gap-3 mb-3">
        <div className="w-10 h-10 rounded-lg bg-space-600 flex items-center justify-center flex-shrink-0">
          <Icon className={cn("w-5 h-5", config.iconColor)} />
        </div>
        <h3 className="text-lg font-bold text-star-white leading-snug">
          Veteran Secret
        </h3>
      </div>

      {/* Body */}
      <p className="text-sm text-star-dim leading-relaxed flex-1 italic">
        &ldquo;{cue.description}&rdquo;
      </p>

      {/* Footer */}
      <div className="flex items-center gap-3 mt-4 pt-3 border-t border-space-600">
        {cue.videoTimestamp && (
          <div className="flex items-center gap-1.5">
            <Clock className="w-3.5 h-3.5 text-star-faint" />
            <span className="text-xs text-star-faint font-mono">
              {cue.videoTimestamp}
            </span>
          </div>
        )}
        <div className="flex items-center gap-1.5 ml-auto">
          <Eye className="w-3.5 h-3.5 text-neon-orange" />
          <span className="text-xs text-neon-orange font-medium">
            Not in any manual
          </span>
        </div>
      </div>
    </motion.div>
  )
}
