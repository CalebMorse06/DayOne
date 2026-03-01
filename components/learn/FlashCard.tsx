"use client"

import { useState, useEffect, useRef, useCallback } from "react"
import { motion } from "framer-motion"
import { Zap, Check, X } from "lucide-react"
import type { FlashChallenge } from "@/lib/types"
import { cn } from "@/lib/utils"

interface FlashCardProps {
  challenge: FlashChallenge
  onComplete: (recalled: boolean, timeMs: number) => void
}

export function FlashCard({ challenge, onComplete }: FlashCardProps) {
  const [revealed, setRevealed] = useState(false)
  const [elapsed, setElapsed] = useState(0)
  const [answered, setAnswered] = useState(false)
  const startRef = useRef(Date.now())
  const intervalRef = useRef<ReturnType<typeof setInterval> | null>(null)
  const timeoutMs = challenge.timeoutSeconds * 1000

  useEffect(() => {
    startRef.current = Date.now()
    intervalRef.current = setInterval(() => {
      const now = Date.now()
      const e = now - startRef.current
      setElapsed(e)
      if (e >= timeoutMs) {
        if (intervalRef.current) clearInterval(intervalRef.current)
        setRevealed(true)
      }
    }, 50)
    return () => {
      if (intervalRef.current) clearInterval(intervalRef.current)
    }
  }, [timeoutMs])

  const handleReveal = useCallback(() => {
    if (intervalRef.current) clearInterval(intervalRef.current)
    setRevealed(true)
  }, [])

  const handleAnswer = useCallback(
    (recalled: boolean) => {
      setAnswered(true)
      const timeMs = Date.now() - startRef.current
      setTimeout(() => {
        onComplete(recalled, timeMs)
      }, 1000)
    },
    [onComplete]
  )

  const progress = Math.min(elapsed / timeoutMs, 1)
  const timedOut = elapsed >= timeoutMs
  const circumference = 2 * Math.PI * 36
  const dashOffset = circumference * (1 - progress)

  return (
    <motion.div
      initial={{ opacity: 0, y: 12 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ duration: 0.35, ease: [0.25, 0.46, 0.45, 0.94] }}
      className="p-5 rounded-2xl bg-space-700 border border-neon-orange/30 border-l-4 border-l-neon-orange min-h-[300px] flex flex-col items-center backdrop-blur-sm shadow-[0_4px_24px_rgba(0,0,0,0.3)]"
    >
      <div className="flex items-center gap-2 mb-3 self-start">
        <Zap className="w-5 h-5 text-neon-orange" />
        <span className="text-xs font-semibold text-neon-orange bg-neon-orange/10 px-2.5 py-1 rounded-full">
          Flash Recall
        </span>
      </div>

      {/* Countdown ring */}
      <div className="relative w-20 h-20 my-4">
        <svg className="w-full h-full -rotate-90" viewBox="0 0 80 80">
          <circle
            cx="40"
            cy="40"
            r="36"
            fill="none"
            stroke="currentColor"
            className="text-space-600"
            strokeWidth="4"
          />
          <circle
            cx="40"
            cy="40"
            r="36"
            fill="none"
            stroke="url(#flash-gradient)"
            strokeWidth="4"
            strokeLinecap="round"
            strokeDasharray={circumference}
            strokeDashoffset={dashOffset}
            className="transition-[stroke-dashoffset] duration-100"
          />
          <defs>
            <linearGradient id="flash-gradient" x1="0%" y1="0%" x2="100%" y2="0%">
              <stop offset="0%" stopColor="#f59e0b" />
              <stop offset="100%" stopColor="#f97316" />
            </linearGradient>
          </defs>
        </svg>
        <div className="absolute inset-0 flex items-center justify-center">
          <span className={cn(
            "text-lg font-bold font-mono",
            timedOut ? "text-neon-magenta" : "text-star-white"
          )}>
            {Math.max(0, Math.ceil((timeoutMs - elapsed) / 1000))}s
          </span>
        </div>
      </div>

      {/* Question */}
      <h3 className="text-base font-bold text-star-white text-center mb-4 font-display">
        {challenge.question}
      </h3>

      {!revealed ? (
        <button
          onClick={handleReveal}
          className="mt-auto w-full p-3 bg-neon-orange hover:bg-neon-orange/90 text-space-900 font-semibold rounded-lg transition-colors text-sm"
        >
          Reveal Answer
        </button>
      ) : !answered ? (
        <div className="mt-auto w-full space-y-3">
          <div className="p-3 bg-space-800 border border-space-600 rounded-lg text-center">
            <p className="text-xs text-star-faint mb-1">Answer</p>
            <p className="text-sm font-bold text-star-white">{challenge.answer}</p>
          </div>
          <p className="text-xs text-center text-star-faint">Did you recall it?</p>
          <div className="flex gap-3">
            <button
              onClick={() => handleAnswer(true)}
              className="flex-1 p-3 bg-neon-green/20 border border-neon-green/30 text-neon-green font-semibold rounded-lg text-sm flex items-center justify-center gap-2 hover:bg-neon-green/30 transition-colors"
            >
              <Check className="w-4 h-4" /> Yes
            </button>
            <button
              onClick={() => handleAnswer(false)}
              className="flex-1 p-3 bg-neon-magenta/20 border border-neon-magenta/30 text-neon-magenta font-semibold rounded-lg text-sm flex items-center justify-center gap-2 hover:bg-neon-magenta/30 transition-colors"
            >
              <X className="w-4 h-4" /> No
            </button>
          </div>
        </div>
      ) : (
        <motion.div
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          className="mt-auto text-center"
        >
          <p className="text-sm font-bold text-warm-amber">+15 XP</p>
        </motion.div>
      )}
    </motion.div>
  )
}
