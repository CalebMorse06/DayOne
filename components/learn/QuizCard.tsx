"use client"

import { useState, useEffect, useRef } from "react"
import { motion, AnimatePresence } from "framer-motion"
import { HelpCircle, CheckCircle2, XCircle, Lightbulb, ChevronRight } from "lucide-react"
import type { QuizQuestion } from "@/lib/types"
import { ConfidenceMeter } from "./ConfidenceMeter"
import { BookmarkButton } from "./BookmarkButton"
import { cn } from "@/lib/utils"

interface QuizCardProps {
  question: QuizQuestion
  onAnswer: (correct: boolean) => void
  onConfidence?: (confidence: number, correct: boolean) => void
  isBookmarked?: boolean
  onToggleBookmark?: () => void
}

export function QuizCard({ question, onAnswer, onConfidence, isBookmarked, onToggleBookmark }: QuizCardProps) {
  const [selectedIndex, setSelectedIndex] = useState<number | null>(null)
  const [showFeedback, setShowFeedback] = useState(false)
  const [confidenceGiven, setConfidenceGiven] = useState(false)
  const [readyToContinue, setReadyToContinue] = useState(false)

  // Auto-skip confidence after 3s so the user is never stuck
  const autoSkipTimer = useRef<ReturnType<typeof setTimeout> | null>(null)
  useEffect(() => {
    if (selectedIndex !== null && !confidenceGiven) {
      autoSkipTimer.current = setTimeout(() => {
        handleConfidence(3) // default to neutral confidence
      }, 3000)
    }
    return () => {
      if (autoSkipTimer.current) clearTimeout(autoSkipTimer.current)
    }
  }, [selectedIndex, confidenceGiven])

  const handleSelect = (index: number) => {
    if (showFeedback) return
    setSelectedIndex(index)
    // Show confidence meter first
  }

  const handleConfidence = (confidence: number) => {
    if (selectedIndex === null) return
    const correct = selectedIndex === question.correctIndex
    setConfidenceGiven(true)
    setShowFeedback(true)
    onConfidence?.(confidence, correct)
    setTimeout(() => setReadyToContinue(true), 500)
  }

  const handleContinue = () => {
    if (selectedIndex === null) return
    onAnswer(selectedIndex === question.correctIndex)
  }

  const isCorrect = selectedIndex === question.correctIndex

  return (
    <motion.div
      initial={{ opacity: 0, y: 12 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ duration: 0.35, ease: [0.25, 0.46, 0.45, 0.94] }}
      className="p-5 rounded-2xl bg-space-700 border border-neon-purple/30 border-l-4 border-l-neon-purple min-h-[300px] flex flex-col backdrop-blur-sm shadow-[0_4px_24px_rgba(0,0,0,0.3)]"
    >
      {/* Header */}
      <div className="flex items-center justify-between mb-4">
        <div className="flex items-center gap-2">
          <HelpCircle className="w-5 h-5 text-neon-purple" />
          <span className="text-xs font-semibold text-neon-purple bg-neon-purple/10 px-2.5 py-1 rounded-full">
            Knowledge Check
          </span>
          {question.difficulty && (
            <span className="text-[10px] text-star-faint bg-space-600 px-2 py-0.5 rounded-full">
              Lv.{question.difficulty}
            </span>
          )}
        </div>
        {onToggleBookmark && (
          <BookmarkButton isBookmarked={isBookmarked || false} onToggle={onToggleBookmark} />
        )}
      </div>

      {/* Question */}
      <h3 className="text-base font-bold text-star-white mb-4 font-display">
        {question.question}
      </h3>

      {/* Options */}
      <div className="space-y-2 flex-1">
        {question.options.map((option, index) => {
          const isSelected = selectedIndex === index
          const isRight = index === question.correctIndex

          return (
            <button
              key={index}
              onClick={() => handleSelect(index)}
              disabled={selectedIndex !== null}
              className={cn(
                "w-full text-left p-3 rounded-lg text-sm transition-all border",
                selectedIndex === null &&
                  "border-space-600 bg-space-800 text-star-dim hover:border-neon-purple/40 active:scale-[0.98]",
                isSelected && !showFeedback &&
                  "border-neon-purple bg-neon-purple/10 text-neon-purple",
                showFeedback && isRight && "border-neon-green bg-neon-green/10 text-neon-green shadow-glow-green/30",
                showFeedback && isSelected && !isRight && "border-neon-magenta bg-neon-magenta/10 text-neon-magenta shadow-glow-magenta/30",
                showFeedback && !isSelected && !isRight && "border-space-600 opacity-30",
                !isSelected && selectedIndex !== null && !showFeedback && "border-space-600 opacity-50"
              )}
            >
              <div className="flex items-center gap-2">
                <span className="w-6 h-6 rounded-full border-2 border-current flex items-center justify-center text-xs font-semibold flex-shrink-0">
                  {String.fromCharCode(65 + index)}
                </span>
                <span className="flex-1">{option}</span>
                {showFeedback && isRight && (
                  <CheckCircle2 className="w-5 h-5 text-neon-green flex-shrink-0" />
                )}
                {showFeedback && isSelected && !isRight && (
                  <XCircle className="w-5 h-5 text-neon-magenta flex-shrink-0" />
                )}
              </div>
            </button>
          )
        })}
      </div>

      {/* Confidence meter - shown after selection, before feedback */}
      <AnimatePresence>
        {selectedIndex !== null && !confidenceGiven && (
          <ConfidenceMeter onRate={handleConfidence} />
        )}
      </AnimatePresence>

      {/* Feedback */}
      <AnimatePresence>
        {showFeedback && (
          <motion.div
            initial={{ opacity: 0, y: 10 }}
            animate={{ opacity: 1, y: 0 }}
            className={cn(
              "mt-3 p-3 rounded-lg text-xs border",
              isCorrect
                ? "bg-neon-green/10 border-neon-green/20"
                : "bg-neon-orange/10 border-neon-orange/20"
            )}
          >
            <div className="flex items-start gap-2">
              <Lightbulb
                className={cn(
                  "w-4 h-4 flex-shrink-0 mt-0.5",
                  isCorrect ? "text-neon-green" : "text-neon-orange"
                )}
              />
              <div>
                <p
                  className={cn(
                    "font-semibold mb-0.5",
                    isCorrect ? "text-neon-green" : "text-neon-orange"
                  )}
                >
                  {isCorrect ? "Correct! +25 XP" : "Not quite — review this card"}
                </p>
                <p className="text-star-dim">
                  {question.explanation}
                </p>
                {!isCorrect && question.whyStudentsMiss && (
                  <p className="text-star-faint mt-1 italic">
                    Why students miss this: {question.whyStudentsMiss}
                  </p>
                )}
              </div>
            </div>
          </motion.div>
        )}
      </AnimatePresence>

      {/* Continue button replaces auto-advance */}
      {readyToContinue && (
        <motion.button
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          onClick={handleContinue}
          className="mt-3 w-full p-3 bg-neon-purple hover:bg-neon-purple/90 text-white font-semibold rounded-lg transition-colors text-sm flex items-center justify-center gap-2"
        >
          Continue <ChevronRight className="w-4 h-4" />
        </motion.button>
      )}
    </motion.div>
  )
}
