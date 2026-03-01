"use client"

import { useState, useRef, useCallback } from "react"
import { motion, AnimatePresence } from "framer-motion"
import {
  ArrowRight,
  AlertTriangle,
  Lightbulb,
  CheckCircle2,
  Wrench,
  Clock,
  ChevronDown,
  ChevronUp,
  Ear,
  Eye,
  Hand,
  Wind,
  Gauge,
  ShieldAlert,
  Film,
  Play,
  X,
} from "lucide-react"
import type { MicroCard as MicroCardType } from "@/lib/types"
import { BookmarkButton } from "./BookmarkButton"
import { VoiceNarration } from "./VoiceNarration"
import { cn } from "@/lib/utils"
import { getVideoObjectUrl, resolveVideoUrl } from "@/lib/video-store"

const TYPE_CONFIG = {
  step: {
    bg: "bg-space-700",
    border: "border-l-4 border-l-neon-cyan",
    outerBorder: "border-space-600",
    icon: ArrowRight,
    iconColor: "text-neon-cyan",
    badge: "bg-neon-cyan/10 text-neon-cyan",
    label: "Step",
    gradient: "from-neon-cyan/5 to-transparent"
  },
  hazard: {
    bg: "bg-space-700",
    border: "border-l-4 border-l-neon-magenta",
    outerBorder: "border-space-600",
    icon: AlertTriangle,
    iconColor: "text-neon-magenta",
    badge: "bg-neon-magenta/10 text-neon-magenta",
    label: "Safety",
    gradient: "from-neon-magenta/5 to-transparent"
  },
  tip: {
    bg: "bg-space-700",
    border: "border-l-4 border-l-neon-orange",
    outerBorder: "border-space-600",
    icon: Lightbulb,
    iconColor: "text-neon-orange",
    badge: "bg-neon-orange/10 text-neon-orange",
    label: "Pro Tip",
    gradient: "from-neon-orange/5 to-transparent"
  },
  quality: {
    bg: "bg-space-700",
    border: "border-l-4 border-l-neon-green",
    outerBorder: "border-space-600",
    icon: CheckCircle2,
    iconColor: "text-neon-green",
    badge: "bg-neon-green/10 text-neon-green",
    label: "Quality",
    gradient: "from-neon-green/5 to-transparent"
  },
  tool: {
    bg: "bg-space-700",
    border: "border-l-4 border-l-star-dim",
    outerBorder: "border-space-600",
    icon: Wrench,
    iconColor: "text-star-dim",
    badge: "bg-space-600 text-star-dim",
    label: "Tool",
    gradient: "from-star-dim/5 to-transparent"
  },
}

const CUE_ICONS = {
  sound: Ear,
  visual: Eye,
  feel: Hand,
  smell: Wind,
}

interface MicroCardProps {
  card: MicroCardType
  index: number
  total: number
  isBookmarked?: boolean
  onToggleBookmark?: () => void
  videoObjectUrl?: string | null
}

/** Parse "MM:SS" or "HH:MM:SS" to seconds */
function parseTimestamp(ts: string): number {
  const parts = ts.replace(/[^0-9:]/g, "").split(":").map(Number)
  if (parts.length === 3) return parts[0] * 3600 + parts[1] * 60 + parts[2]
  if (parts.length === 2) return parts[0] * 60 + parts[1]
  return 0
}

export function MicroCard({ card, index, total, isBookmarked, onToggleBookmark, videoObjectUrl }: MicroCardProps) {
  const config = TYPE_CONFIG[card.type]
  const Icon = config.icon
  const [showMistakes, setShowMistakes] = useState(false)
  const [activeVideoUrl, setActiveVideoUrl] = useState<string | null>(null)
  const videoRef = useRef<HTMLVideoElement>(null)

  const seekAndPlay = useCallback((url: string) => {
    setActiveVideoUrl(url)
    setTimeout(() => {
      if (videoRef.current && card.videoTimestamp) {
        videoRef.current.currentTime = parseTimestamp(card.videoTimestamp)
        videoRef.current.play().catch(() => {})
      }
    }, 200)
  }, [card.videoTimestamp])

  const openVideoAtTimestamp = useCallback(() => {
    // Try prop first, then in-memory cache
    const url = videoObjectUrl || getVideoObjectUrl("")
    if (url) {
      seekAndPlay(url)
      return
    }
    // Fall back to IndexedDB (async)
    resolveVideoUrl("").then((resolved) => {
      if (resolved) seekAndPlay(resolved)
    })
  }, [videoObjectUrl, seekAndPlay])

  return (
    <motion.div
      initial={{ opacity: 0, y: 12 }}
      animate={{ opacity: 1, y: 0 }}
      exit={{ opacity: 0, y: -8 }}
      transition={{ duration: 0.35, ease: [0.25, 0.46, 0.45, 0.94] }}
      className={cn(
        "p-5 rounded-2xl border min-h-[300px] flex flex-col backdrop-blur-sm",
        "shadow-[0_4px_24px_rgba(0,0,0,0.3)] hover:shadow-[0_8px_40px_rgba(0,0,0,0.4)]",
        "transition-shadow duration-300 relative overflow-hidden",
        config.bg,
        config.border,
        config.outerBorder
      )}
    >
      <div className={cn("absolute inset-0 bg-gradient-to-br opacity-50 pointer-events-none", config.gradient)} />

      {/* Critical checkpoint banner */}
      {card.isCriticalCheckpoint && (
        <div className="flex items-center gap-1.5 px-3 py-1.5 -mx-5 -mt-5 mb-3 bg-neon-magenta/10 border-b border-neon-magenta/20 rounded-t-xl">
          <ShieldAlert className="w-3.5 h-3.5 text-neon-magenta" />
          <span className="text-[10px] font-bold text-neon-magenta uppercase tracking-wider">
            Critical Checkpoint
          </span>
        </div>
      )}

      {/* Header */}
      <div className="flex items-center justify-between mb-4">
        <div className="flex items-center gap-2">
          <span
            className={cn(
              "text-xs font-semibold px-2.5 py-1 rounded-full",
              config.badge
            )}
          >
            {config.label}
          </span>
          {card.difficulty && (
            <span className="text-[10px] text-star-faint bg-space-600 px-2 py-0.5 rounded-full">
              Lv.{card.difficulty}
            </span>
          )}
        </div>
        <div className="flex items-center gap-1" onPointerDownCapture={(e) => e.stopPropagation()}>
          {(card.audioUrl || card.body) && (
            <VoiceNarration
              text={[card.body, card.watchFor && `Watch for: ${card.watchFor}`, ...(card.environmentalCues?.map(c => `${c.type}: ${c.description}`) || [])].filter(Boolean).join(". ")}
              audioUrl={card.audioUrl}
            />
          )}
          {onToggleBookmark && (
            <BookmarkButton isBookmarked={isBookmarked || false} onToggle={onToggleBookmark} />
          )}
          <span className="text-xs text-star-faint">
            {index + 1} / {total}
          </span>
        </div>
      </div>

      {/* Icon + Title */}
      <div className="flex items-start gap-3 mb-3">
        <div className="w-10 h-10 rounded-lg bg-space-600 flex items-center justify-center flex-shrink-0">
          <Icon className={cn("w-5 h-5", config.iconColor)} />
        </div>
        <h3 className="text-xl font-bold text-star-white leading-snug tracking-tight font-display">
          {card.title}
        </h3>
      </div>

      {/* Video Frame / AI Illustration */}
      {card.imageUrl && (
        <div className="relative mb-3 rounded-lg overflow-hidden h-44 group">
          <img
            src={card.imageUrl}
            alt={card.imageDescription || card.title}
            className="w-full h-full object-cover transition-transform duration-500 group-hover:scale-105"
          />
          <div className="absolute inset-0 bg-gradient-to-t from-space-700 via-space-700/20 to-transparent" />
          {card.videoTimestamp && (
            <div className="absolute bottom-2 left-2 flex items-center gap-1.5 px-2 py-1 rounded-md bg-space-900/80 backdrop-blur-sm">
              <Clock className="w-3 h-3 text-warm-amber" />
              <span className="text-[10px] font-mono text-warm-amber font-semibold">
                {card.videoTimestamp}
              </span>
            </div>
          )}
        </div>
      )}

      {/* Body */}
      <p className="text-sm text-star-dim leading-relaxed flex-1">{card.body}</p>

      {/* Watch For callout */}
      {card.watchFor && (
        <div className="mt-3 p-2.5 rounded-lg bg-warm-amber/5 border border-warm-amber/15">
          <div className="flex items-start gap-2">
            <Eye className="w-3.5 h-3.5 text-warm-amber flex-shrink-0 mt-0.5" />
            <div>
              <p className="text-[10px] font-bold text-warm-amber uppercase tracking-wider mb-0.5">Watch For</p>
              <p className="text-xs text-star-dim">{card.watchFor}</p>
            </div>
          </div>
        </div>
      )}

      {/* Environmental Cues */}
      {card.environmentalCues && card.environmentalCues.length > 0 && (
        <div className="flex gap-2 mt-3 flex-wrap">
          {card.environmentalCues.map((cue, i) => {
            const CueIcon = CUE_ICONS[cue.type]
            return (
              <div
                key={i}
                className="flex items-center gap-1.5 px-2 py-1 rounded-full bg-space-600/50 text-[10px] text-star-dim"
                title={`${cue.description} — ${cue.significance}`}
              >
                <CueIcon className="w-3 h-3 text-retro-teal" />
                <span className="capitalize">{cue.type}</span>
              </div>
            )
          })}
        </div>
      )}

      {/* Measurement badge */}
      {card.measurements && (
        <div className="mt-3 flex items-center gap-2 px-2.5 py-1.5 rounded-lg bg-neon-cyan/5 border border-neon-cyan/15">
          <Gauge className="w-3.5 h-3.5 text-neon-cyan" />
          <span className="text-[10px] text-neon-cyan font-mono">
            {card.measurements.parameter}: {card.measurements.nominal} {card.measurements.tolerance}
          </span>
        </div>
      )}

      {/* Common Mistakes - collapsible */}
      {card.commonMistakes && card.commonMistakes.length > 0 && (
        <div className="mt-3">
          <button
            onClick={() => setShowMistakes(!showMistakes)}
            className="flex items-center gap-1.5 text-xs text-neon-magenta/70 hover:text-neon-magenta transition-colors"
          >
            <AlertTriangle className="w-3 h-3" />
            <span className="font-semibold">Common Mistakes ({card.commonMistakes.length})</span>
            {showMistakes ? <ChevronUp className="w-3 h-3" /> : <ChevronDown className="w-3 h-3" />}
          </button>
          <AnimatePresence>
            {showMistakes && (
              <motion.div
                initial={{ height: 0, opacity: 0 }}
                animate={{ height: "auto", opacity: 1 }}
                exit={{ height: 0, opacity: 0 }}
                className="overflow-hidden"
              >
                <ul className="mt-2 space-y-1.5">
                  {card.commonMistakes.map((mistake, i) => (
                    <li key={i} className="flex items-start gap-2 text-xs text-star-dim">
                      <span className="text-neon-magenta/60 mt-0.5">•</span>
                      {mistake}
                    </li>
                  ))}
                </ul>
              </motion.div>
            )}
          </AnimatePresence>
        </div>
      )}

      {/* Video source citation */}
      {card.videoTimestamp && (
        <div
          className="flex items-center gap-2 mt-4 pt-3 border-t border-space-600"
          onPointerDownCapture={(e) => e.stopPropagation()}
        >
          <button
            onClick={openVideoAtTimestamp}
            className="flex items-center gap-1.5 px-2.5 py-1.5 rounded-lg bg-warm-amber/10 hover:bg-warm-amber/20 border border-warm-amber/20 transition-colors group"
          >
            <Play className="w-3.5 h-3.5 text-warm-amber group-hover:scale-110 transition-transform" />
            <span className="text-[10px] text-warm-amber font-mono font-semibold">
              {card.videoTimestamp}
            </span>
          </button>
          <div className="flex items-center gap-1 text-[10px] text-star-faint">
            <Film className="w-3 h-3" />
            <span>play from source</span>
          </div>
        </div>
      )}

      {/* Video playback modal */}
      <AnimatePresence>
        {activeVideoUrl && (
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            className="fixed inset-0 z-50 flex items-center justify-center bg-space-900/90 backdrop-blur-sm"
            onClick={() => setActiveVideoUrl(null)}
          >
            <motion.div
              initial={{ scale: 0.9, opacity: 0 }}
              animate={{ scale: 1, opacity: 1 }}
              exit={{ scale: 0.9, opacity: 0 }}
              className="relative w-full max-w-2xl mx-4"
              onClick={(e) => e.stopPropagation()}
            >
              <button
                onClick={() => setActiveVideoUrl(null)}
                className="absolute -top-10 right-0 p-1.5 rounded-lg bg-space-700 hover:bg-space-600 text-star-dim transition-colors"
              >
                <X className="w-4 h-4" />
              </button>
              <video
                ref={videoRef}
                src={activeVideoUrl}
                controls
                className="w-full rounded-xl shadow-2xl"
                style={{ maxHeight: "70vh" }}
              />
              <p className="text-center text-xs text-star-faint mt-2">
                {card.title} — {card.videoTimestamp}
              </p>
            </motion.div>
          </motion.div>
        )}
      </AnimatePresence>
    </motion.div>
  )
}
