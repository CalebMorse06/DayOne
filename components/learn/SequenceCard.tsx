"use client"

import { useState, useCallback } from "react"
import { motion, Reorder } from "framer-motion"
import { ListOrdered, Check, X, RotateCcw } from "lucide-react"
import type { SequenceChallenge } from "@/lib/types"
import { cn } from "@/lib/utils"

interface SequenceCardProps {
  challenge: SequenceChallenge
  onComplete: (correct: boolean, perfect: boolean) => void
}

function shuffle<T>(arr: T[]): T[] {
  const a = [...arr]
  for (let i = a.length - 1; i > 0; i--) {
    const j = Math.floor(Math.random() * (i + 1))
    ;[a[i], a[j]] = [a[j], a[i]]
  }
  return a
}

export function SequenceCard({ challenge, onComplete }: SequenceCardProps) {
  const [items, setItems] = useState(() => {
    const indexed = challenge.steps.map((step, i) => ({ step, originalIndex: i }))
    return shuffle(indexed)
  })
  const [checked, setChecked] = useState(false)
  const [result, setResult] = useState<"perfect" | "partial" | "wrong" | null>(null)

  const handleCheck = useCallback(() => {
    const userOrder = items.map((item) => item.originalIndex)
    const isPerfect = userOrder.every((v, i) => v === challenge.correctOrder[i])

    // Partial: at least 50% in correct position
    let correctCount = 0
    userOrder.forEach((v, i) => {
      if (v === challenge.correctOrder[i]) correctCount++
    })
    const isPartial = correctCount >= Math.ceil(challenge.correctOrder.length / 2)

    setChecked(true)
    if (isPerfect) {
      setResult("perfect")
    } else if (isPartial) {
      setResult("partial")
    } else {
      setResult("wrong")
    }

    setTimeout(() => {
      onComplete(isPerfect || isPartial, isPerfect)
    }, 2000)
  }, [items, challenge.correctOrder, onComplete])

  const handleReset = useCallback(() => {
    setItems(shuffle(challenge.steps.map((step, i) => ({ step, originalIndex: i }))))
    setChecked(false)
    setResult(null)
  }, [challenge.steps])

  return (
    <motion.div
      initial={{ opacity: 0, y: 12 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ duration: 0.35, ease: [0.25, 0.46, 0.45, 0.94] }}
      className="p-5 rounded-2xl bg-space-700 border border-warm-amber/30 border-l-4 border-l-warm-amber min-h-[300px] flex flex-col backdrop-blur-sm shadow-[0_4px_24px_rgba(0,0,0,0.3)]"
    >
      <div className="flex items-center gap-2 mb-3">
        <ListOrdered className="w-5 h-5 text-warm-amber" />
        <span className="text-xs font-semibold text-warm-amber bg-warm-amber/10 px-2.5 py-1 rounded-full">
          Sequence Challenge
        </span>
      </div>

      <h3 className="text-base font-bold text-star-white mb-1 font-display">{challenge.title}</h3>
      <p className="text-xs text-star-dim mb-4">{challenge.instructions}</p>

      <Reorder.Group
        axis="y"
        values={items}
        onReorder={checked ? () => {} : setItems}
        className="space-y-2 flex-1"
      >
        {items.map((item, idx) => {
          const isCorrectPosition = checked && item.originalIndex === challenge.correctOrder[idx]
          const isWrongPosition = checked && item.originalIndex !== challenge.correctOrder[idx]

          return (
            <Reorder.Item
              key={item.step}
              value={item}
              className={cn(
                "flex items-center gap-3 p-3 rounded-lg text-sm border cursor-grab active:cursor-grabbing",
                !checked && "bg-space-800 border-space-600 hover:border-warm-amber/40",
                isCorrectPosition && "bg-neon-green/10 border-neon-green/40",
                isWrongPosition && "bg-neon-magenta/10 border-neon-magenta/40"
              )}
              drag={!checked ? "y" : false}
            >
              <span className="w-6 h-6 rounded-full bg-space-600 flex items-center justify-center text-xs font-bold text-star-dim flex-shrink-0">
                {idx + 1}
              </span>
              <span className="flex-1 text-star-dim">{item.step}</span>
              {isCorrectPosition && <Check className="w-4 h-4 text-neon-green flex-shrink-0" />}
              {isWrongPosition && <X className="w-4 h-4 text-neon-magenta flex-shrink-0" />}
            </Reorder.Item>
          )
        })}
      </Reorder.Group>

      {/* Result feedback */}
      {result && (
        <motion.div
          initial={{ opacity: 0, y: 10 }}
          animate={{ opacity: 1, y: 0 }}
          className={cn(
            "mt-3 p-3 rounded-lg text-xs font-semibold text-center",
            result === "perfect" && "bg-neon-green/10 text-neon-green",
            result === "partial" && "bg-warm-amber/10 text-warm-amber",
            result === "wrong" && "bg-neon-magenta/10 text-neon-magenta"
          )}
        >
          {result === "perfect" && "Perfect order! +30 XP"}
          {result === "partial" && "Partially correct! +15 XP"}
          {result === "wrong" && "Not quite — review the steps"}
        </motion.div>
      )}

      {/* Actions */}
      {!checked ? (
        <button
          onClick={handleCheck}
          className="mt-3 w-full p-3 bg-warm-amber hover:bg-warm-amber/90 text-space-900 font-semibold rounded-lg transition-colors text-sm"
        >
          Check Order
        </button>
      ) : (
        !result && (
          <button
            onClick={handleReset}
            className="mt-3 w-full p-3 bg-space-600 hover:bg-space-600/80 text-star-dim font-semibold rounded-lg transition-colors text-sm flex items-center justify-center gap-2"
          >
            <RotateCcw className="w-4 h-4" /> Try Again
          </button>
        )
      )}
    </motion.div>
  )
}
