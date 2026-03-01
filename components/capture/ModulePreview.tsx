"use client"

import { motion } from "framer-motion"
import {
  BookOpen,
  HelpCircle,
  Eye,
  Wrench,
  AlertTriangle,
  ChevronRight,
  Sparkles,
  Timer,
} from "lucide-react"
import type { LearningModule } from "@/lib/types"
import { cn } from "@/lib/utils"

interface ModulePreviewProps {
  module: LearningModule
  fallback?: boolean
  onStartLearning: () => void
}

export function ModulePreview({
  module,
  fallback,
  onStartLearning,
}: ModulePreviewProps) {
  const stats = [
    { icon: BookOpen, label: "Cards", value: module.cards?.length ?? 0, color: "text-neon-cyan", bg: "bg-neon-cyan/10" },
    { icon: HelpCircle, label: "Quizzes", value: module.quizQuestions?.length ?? 0, color: "text-neon-purple", bg: "bg-neon-purple/10" },
    { icon: Eye, label: "Tacit Cues", value: module.tacitCues?.length ?? 0, color: "text-neon-orange", bg: "bg-neon-orange/10" },
    { icon: Wrench, label: "Tools", value: module.tools?.length ?? 0, color: "text-star-dim", bg: "bg-space-700" },
  ]

  return (
    <motion.div
      initial={{ opacity: 0, y: 20 }}
      animate={{ opacity: 1, y: 0 }}
      className="space-y-4"
    >
      {/* Module header */}
      <div className="p-4 bg-space-800 border border-neon-purple/20 rounded-xl">
        <div className="flex items-start gap-2 mb-2">
          <Sparkles className="w-5 h-5 text-neon-purple flex-shrink-0 mt-0.5" />
          <div>
            <h3 className="font-bold text-star-white">{module.title}</h3>
            <p className="text-sm text-star-dim mt-1">{module.description}</p>
          </div>
        </div>
        {fallback && (
          <p className="text-xs text-neon-orange bg-neon-orange/10 border border-neon-orange/20 rounded-lg px-3 py-1.5 mt-3">
            Using demo content — connect Gemini API for live analysis
          </p>
        )}
      </div>

      {/* Stats grid */}
      <div className="grid grid-cols-4 gap-2">
        {stats.map((stat) => {
          const Icon = stat.icon
          return (
            <div
              key={stat.label}
              className="flex flex-col items-center p-3 bg-space-800 border border-space-600 rounded-xl"
            >
              <Icon className={cn("w-4 h-4 mb-1", stat.color)} />
              <p className="text-lg font-bold font-mono text-star-white">{stat.value}</p>
              <p className="text-[10px] text-star-faint">{stat.label}</p>
            </div>
          )
        })}
      </div>

      {/* Time saved ROI */}
      <div className="p-4 bg-neon-green/5 border border-neon-green/20 rounded-xl">
        <div className="flex items-center gap-3">
          <div className="w-10 h-10 rounded-xl bg-neon-green/10 flex items-center justify-center flex-shrink-0">
            <Timer className="w-5 h-5 text-neon-green" />
          </div>
          <div>
            <p className="text-sm font-bold text-neon-green">
              Replaces ~{Math.round((module.cards?.length ?? 0) * 0.25 * 10) / 10} hours of shadowing
            </p>
            <p className="text-xs text-star-dim">
              {module.cards?.length ?? 0} lessons + {module.tacitCues?.length ?? 0} expert insights captured in seconds
            </p>
          </div>
        </div>
      </div>

      {/* Safety hazards */}
      {(module.safetyHazards?.length ?? 0) > 0 && (
        <div className="p-3 bg-neon-magenta/5 border border-neon-magenta/20 rounded-xl">
          <div className="flex items-center gap-2 mb-2">
            <AlertTriangle className="w-4 h-4 text-neon-magenta" />
            <p className="text-xs font-semibold text-neon-magenta">
              {module.safetyHazards?.length ?? 0} Safety Hazard{(module.safetyHazards?.length ?? 0) > 1 ? "s" : ""} Identified
            </p>
          </div>
          <ul className="space-y-1">
            {(module.safetyHazards ?? []).slice(0, 3).map((hazard, i) => (
              <li key={i} className="text-xs text-star-dim flex items-start gap-1.5">
                <span
                  className={cn(
                    "w-1.5 h-1.5 rounded-full mt-1.5 flex-shrink-0",
                    hazard.severity === "high" ? "bg-neon-magenta" : "bg-neon-orange"
                  )}
                />
                {hazard.description}
              </li>
            ))}
          </ul>
        </div>
      )}

      {/* Tacit knowledge */}
      {(module.tacitCues?.length ?? 0) > 0 && (
        <div className="p-3 bg-neon-orange/5 border border-neon-orange/20 rounded-xl">
          <div className="flex items-center gap-2 mb-2">
            <Eye className="w-4 h-4 text-neon-orange" />
            <p className="text-xs font-semibold text-neon-orange">
              {module.tacitCues?.length ?? 0} Expert-Only Insight{(module.tacitCues?.length ?? 0) > 1 ? "s" : ""} Captured
            </p>
          </div>
          <ul className="space-y-1.5">
            {(module.tacitCues ?? []).slice(0, 3).map((cue, i) => (
              <li key={i} className="text-xs text-star-dim italic flex items-start gap-1.5">
                <span
                  className={cn(
                    "w-1.5 h-1.5 rounded-full mt-1.5 flex-shrink-0",
                    cue.importance === "critical" ? "bg-neon-orange" : "bg-neon-orange/50"
                  )}
                />
                &ldquo;{cue.description}&rdquo;
              </li>
            ))}
          </ul>
        </div>
      )}

      {/* Start learning CTA */}
      <button
        onClick={onStartLearning}
        className="w-full flex items-center justify-center gap-2 p-4 bg-neon-purple hover:bg-neon-purple/90 text-white font-semibold rounded-xl transition-colors active:scale-[0.98]"
      >
        <BookOpen className="w-5 h-5" />
        Start Learning
        <ChevronRight className="w-4 h-4" />
      </button>
    </motion.div>
  )
}
