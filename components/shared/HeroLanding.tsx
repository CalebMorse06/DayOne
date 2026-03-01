"use client"

import { motion } from "framer-motion"
import {
  Play,
  Upload,
  Brain,
  Gamepad2,
  BarChart3,
  Sparkles,
  AlertTriangle,
  Clock,
} from "lucide-react"

interface HeroLandingProps {
  onTryDemo: () => void
  onUploadVideo: () => void
}

const HEADLINE_WORDS = ["Capture", "Veteran", "Knowledge", "Before", "It", "Walks", "Out"]

const CARD_PREVIEWS = [
  { type: "step", title: "Review Job Traveler", color: "from-retro-teal/20 to-retro-teal/5", border: "border-retro-teal/30" },
  { type: "hazard", title: "Chuck Jaw Clearance", color: "from-neon-magenta/20 to-neon-magenta/5", border: "border-neon-magenta/30" },
  { type: "tip", title: "Listen to the Cut", color: "from-neon-orange/20 to-neon-orange/5", border: "border-neon-orange/30" },
  { type: "quality", title: "First-Piece Inspection", color: "from-neon-green/20 to-neon-green/5", border: "border-neon-green/30" },
]

const PROBLEM_STATS = [
  { icon: AlertTriangle, value: "10,000", label: "baby boomers retire daily from skilled trades", color: "text-retro-coral" },
  { icon: Clock, value: "6-12 mo", label: "typical new-hire ramp time with shadowing alone", color: "text-warm-amber" },
  { icon: Brain, value: "1 video", label: "→ 10 cards, 6 quizzes, 4 tacit cues, 5 challenges", color: "text-retro-teal" },
]

const FEATURES = [
  {
    icon: Brain,
    title: "AI Video Analysis",
    desc: "Upload a training video and AI extracts procedures, safety hazards, tacit knowledge, environmental cues, and measurements — the expertise that lives only in veterans' heads.",
    color: "text-neon-purple",
    bg: "bg-neon-purple/10",
  },
  {
    icon: Gamepad2,
    title: "Active Recall Training",
    desc: "Not passive video watching. Quizzes, drag-to-order sequences, timed recall, confidence self-rating, and smart review that targets where each learner actually struggles.",
    color: "text-retro-teal",
    bg: "bg-retro-teal/10",
  },
  {
    icon: BarChart3,
    title: "Mastery Analytics",
    desc: "Composite mastery scores, difficulty heatmaps, accuracy trends, and AI-identified pitfalls show exactly when a new hire is ready — no guesswork.",
    color: "text-warm-amber",
    bg: "bg-warm-amber/10",
  },
]

export function HeroLanding({ onTryDemo, onUploadVideo }: HeroLandingProps) {
  return (
    <div className="max-w-4xl mx-auto px-6 py-12 space-y-16">
      {/* Hero heading */}
      <div className="text-center space-y-6">
        <h1 className="text-4xl md:text-5xl font-bold text-star-white leading-tight font-display">
          {HEADLINE_WORDS.map((word, i) => (
            <motion.span
              key={`${word}-${i}`}
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: i * 0.1, duration: 0.5 }}
              className={`inline-block mr-3 ${i >= 3 ? "text-warm-amber" : ""}`}
            >
              {word}
            </motion.span>
          ))}
        </h1>

        <motion.p
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          transition={{ delay: 0.8, duration: 0.5 }}
          className="text-lg text-star-dim max-w-2xl mx-auto leading-relaxed"
        >
          Skilled workers are retiring faster than companies can replace them.
          DayOne turns a single expert training video into structured micro-learning
          with AI — so new hires absorb decades of know-how in days, not months.
        </motion.p>

        {/* CTAs */}
        <motion.div
          initial={{ opacity: 0, y: 10 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 1.0, duration: 0.5 }}
          className="flex flex-col sm:flex-row items-center justify-center gap-4"
        >
          <button
            onClick={onTryDemo}
            className="flex items-center gap-2 px-8 py-3.5 bg-warm-amber hover:bg-warm-amber/90 text-space-900 font-semibold rounded-xl transition-colors shadow-glow-warm text-base"
          >
            <Play className="w-5 h-5" />
            Try Demo
          </button>
          <button
            onClick={onUploadVideo}
            className="flex items-center gap-2 px-8 py-3.5 glass-card hover:border-warm-amber/30 text-star-white font-semibold rounded-xl transition-all text-base"
          >
            <Upload className="w-5 h-5" />
            Upload Your Video
          </button>
        </motion.div>
      </div>

      {/* Animated card fan */}
      <motion.div
        initial={{ opacity: 0 }}
        animate={{ opacity: 1 }}
        transition={{ delay: 1.2, duration: 0.6 }}
        className="relative h-48 flex items-center justify-center overflow-hidden"
      >
        {CARD_PREVIEWS.map((card, i) => {
          const rotation = (i - 1.5) * 8
          const xOffset = (i - 1.5) * 60
          return (
            <motion.div
              key={card.type}
              initial={{ opacity: 0, y: 40, rotate: 0 }}
              animate={{ opacity: 1, y: 0, rotate: rotation }}
              transition={{ delay: 1.3 + i * 0.1, duration: 0.5, type: "spring" }}
              whileHover={{ y: -12, scale: 1.05, zIndex: 10 }}
              className={`absolute w-44 p-4 rounded-xl bg-gradient-to-br ${card.color} border ${card.border} backdrop-blur-sm cursor-default`}
              style={{ transform: `translateX(${xOffset}px) rotate(${rotation}deg)` }}
            >
              <div className="flex items-center gap-2 mb-2">
                <Sparkles className="w-3.5 h-3.5 text-star-dim" />
                <span className="text-[10px] uppercase tracking-wider text-star-faint font-medium">
                  {card.type}
                </span>
              </div>
              <p className="text-sm font-semibold text-star-white">{card.title}</p>
            </motion.div>
          )
        })}
      </motion.div>

      {/* The problem: knowledge loss */}
      <motion.div
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ delay: 1.6, duration: 0.5 }}
        className="space-y-4"
      >
        <h2 className="text-center text-sm font-semibold uppercase tracking-wider text-star-faint">
          The Knowledge Crisis
        </h2>
        <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
          {PROBLEM_STATS.map((stat) => {
            const Icon = stat.icon
            return (
              <div
                key={stat.label}
                className="p-5 glass-warm rounded-xl text-center"
              >
                <Icon className={`w-5 h-5 ${stat.color} mx-auto mb-2`} />
                <p className={`text-2xl font-bold font-mono ${stat.color}`}>{stat.value}</p>
                <p className="text-xs text-star-dim mt-1 leading-relaxed">{stat.label}</p>
              </div>
            )
          })}
        </div>
      </motion.div>

      {/* Feature highlights */}
      <motion.div
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ delay: 1.8, duration: 0.5 }}
        className="grid grid-cols-1 md:grid-cols-3 gap-4"
      >
        {FEATURES.map((feat) => {
          const Icon = feat.icon
          return (
            <div
              key={feat.title}
              className="p-5 glass-card rounded-xl hover:border-warm-amber/20 transition-all group"
            >
              <div className={`w-10 h-10 rounded-lg ${feat.bg} flex items-center justify-center mb-3 group-hover:scale-110 transition-transform`}>
                <Icon className={`w-5 h-5 ${feat.color}`} />
              </div>
              <h3 className="text-sm font-semibold text-star-white mb-1 font-display">{feat.title}</h3>
              <p className="text-xs text-star-dim leading-relaxed">{feat.desc}</p>
            </div>
          )
        })}
      </motion.div>
    </div>
  )
}
