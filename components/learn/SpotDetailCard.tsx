"use client"

import { useState, useEffect, useRef } from "react"
import { motion, AnimatePresence } from "framer-motion"
import { Search, Lightbulb, Check, X } from "lucide-react"
import type { SpotDetailChallenge } from "@/lib/types"
import { cn } from "@/lib/utils"

interface SpotDetailCardProps {
  challenge: SpotDetailChallenge
  onComplete: (correct: boolean) => void
}

export function SpotDetailCard({ challenge, onComplete }: SpotDetailCardProps) {
  const [answer, setAnswer] = useState("")
  const [submitted, setSubmitted] = useState(false)
  const [correct, setCorrect] = useState(false)
  const [showHint, setShowHint] = useState(false)
  const timerRef = useRef<ReturnType<typeof setTimeout> | null>(null)

  useEffect(() => {
    timerRef.current = setTimeout(() => {
      setShowHint(true)
    }, 15000)
    return () => {
      if (timerRef.current) clearTimeout(timerRef.current)
    }
  }, [])

  const handleSubmit = () => {
    if (!answer.trim() || submitted) return
    const lower = answer.toLowerCase()
    const isCorrect = challenge.acceptableAnswers.some((a) =>
      lower.includes(a.toLowerCase())
    )
    setCorrect(isCorrect)
    setSubmitted(true)
    setTimeout(() => {
      onComplete(isCorrect)
    }, 2000)
  }

  return (
    <motion.div
      initial={{ opacity: 0, y: 12 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ duration: 0.35, ease: [0.25, 0.46, 0.45, 0.94] }}
      className="p-5 rounded-2xl bg-space-700 border border-retro-teal/30 border-l-4 border-l-retro-teal min-h-[300px] flex flex-col backdrop-blur-sm shadow-[0_4px_24px_rgba(0,0,0,0.3)]"
    >
      <div className="flex items-center gap-2 mb-3">
        <Search className="w-5 h-5 text-retro-teal" />
        <span className="text-xs font-semibold text-retro-teal bg-retro-teal/10 px-2.5 py-1 rounded-full">
          Spot the Detail
        </span>
      </div>

      <h3 className="text-base font-bold text-star-white mb-4 font-display">
        {challenge.question}
      </h3>

      {!submitted ? (
        <>
          <div className="flex-1">
            <input
              type="text"
              value={answer}
              onChange={(e) => setAnswer(e.target.value)}
              onKeyDown={(e) => e.key === "Enter" && handleSubmit()}
              placeholder="Type your answer..."
              className="w-full p-3 bg-space-800 border border-space-600 rounded-lg text-sm text-star-white placeholder-star-faint focus:outline-none focus:border-retro-teal/50 transition-colors"
              autoFocus
            />
          </div>

          <AnimatePresence>
            {showHint && (
              <motion.div
                initial={{ opacity: 0, y: 10 }}
                animate={{ opacity: 1, y: 0 }}
                className="mt-3 p-3 rounded-lg bg-warm-amber/10 border border-warm-amber/20 text-xs"
              >
                <div className="flex items-start gap-2">
                  <Lightbulb className="w-4 h-4 text-warm-amber flex-shrink-0 mt-0.5" />
                  <p className="text-warm-amber">{challenge.hint}</p>
                </div>
              </motion.div>
            )}
          </AnimatePresence>

          <button
            onClick={handleSubmit}
            disabled={!answer.trim()}
            className="mt-3 w-full p-3 bg-retro-teal hover:bg-retro-teal/90 text-space-900 font-semibold rounded-lg transition-colors text-sm disabled:opacity-40 disabled:cursor-not-allowed"
          >
            Submit Answer
          </button>
        </>
      ) : (
        <motion.div
          initial={{ opacity: 0, y: 10 }}
          animate={{ opacity: 1, y: 0 }}
          className={cn(
            "flex-1 flex flex-col items-center justify-center text-center p-4 rounded-lg",
            correct ? "bg-neon-green/10" : "bg-neon-magenta/10"
          )}
        >
          {correct ? (
            <>
              <Check className="w-10 h-10 text-neon-green mb-2" />
              <p className="text-neon-green font-bold">Correct! +20 XP</p>
            </>
          ) : (
            <>
              <X className="w-10 h-10 text-neon-magenta mb-2" />
              <p className="text-neon-magenta font-bold mb-1">Not quite — +5 XP for trying</p>
              <p className="text-xs text-star-dim">
                Key words: {challenge.acceptableAnswers.join(", ")}
              </p>
            </>
          )}
        </motion.div>
      )}
    </motion.div>
  )
}
