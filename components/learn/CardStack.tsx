"use client"

import { useState, useCallback, useRef, useEffect, useMemo } from "react"
import { motion, AnimatePresence, PanInfo } from "framer-motion"
import { ChevronLeft, ChevronRight, Layers, Zap, HelpCircle, ListOrdered, Search, Timer, Cable, Box, Film } from "lucide-react"
import type { LearningModule, MicroCard as MicroCardType } from "@/lib/types"
import {
  toggleBookmark,
  recordCardTime,
  recordConfidence,
  recordEvent,
  getWeakCards,
  getCourseProgress,
  addXp,
  updateProgress,
} from "@/lib/store"
import { MicroCard } from "./MicroCard"
import { QuizCard } from "./QuizCard"
import { TacitCueCard } from "./TacitCueCard"
import { SequenceCard } from "./SequenceCard"
import { SpotDetailCard } from "./SpotDetailCard"
import { FlashCard } from "./FlashCard"
import { SimulationCard } from "./SimulationCard"
import { AnimatedVideoCard } from "./AnimatedVideoCard"
import { Model3DCard } from "./Model3DCard"
import { SmartReview } from "./SmartReview"
import { XPBar } from "./XPBar"
import { CompletionBadge } from "./CompletionBadge"

interface CardStackProps {
  module: LearningModule
  onComplete: () => void
  quickLearn?: boolean
  videoObjectUrl?: string | null
}

type StackItem =
  | { type: "card"; index: number }
  | { type: "quiz"; index: number }
  | { type: "tacit"; index: number }
  | { type: "sequence"; index: number }
  | { type: "spotDetail"; index: number }
  | { type: "flash"; index: number }
  | { type: "simulation"; index: number }
  | { type: "video"; index: number }
  | { type: "model3d"; index: number }

export function CardStack({ module, onComplete, quickLearn, videoObjectUrl }: CardStackProps) {
  const [currentIndex, setCurrentIndex] = useState(0)
  const [xp, setXp] = useState(0)
  const [recentGain, setRecentGain] = useState(0)
  const [quizCorrect, setQuizCorrect] = useState(0)
  const [quizTotal, setQuizTotal] = useState(0)
  const [completed, setCompleted] = useState(false)
  const [showReview, setShowReview] = useState(false)
  const [reviewDone, setReviewDone] = useState(false)
  const [direction, setDirection] = useState(0)
  const [bookmarks, setBookmarks] = useState<string[]>([])
  const cardMountTime = useRef<number>(Date.now())
  const completedCardsRef = useRef<Set<string>>(new Set())

  // Load bookmarks from progress
  useEffect(() => {
    const progress = getCourseProgress(module.id)
    if (progress?.bookmarkedCardIds) {
      setBookmarks(progress.bookmarkedCardIds)
    }
    // Restore completed cards from existing progress
    if (progress?.completedCardIds) {
      completedCardsRef.current = new Set(progress.completedCardIds)
    }
  }, [module.id])

  // Track card mount time
  useEffect(() => {
    cardMountTime.current = Date.now()
  }, [currentIndex])

  const seqChallenges = module.sequenceChallenges || []
  const spotChallenges = module.spotDetailChallenges || []
  const flashChallenges = module.flashChallenges || []
  const simChallenges = module.simulationChallenges || []
  const videoCards = module.videoCards || []
  const models3d = module.interactiveModels || []

  // Memoize sequence to prevent rebuilds on every render
  const sequence = useMemo<StackItem[]>(() => {
    const seq: StackItem[] = []

    if (quickLearn) {
      // Quick-learn: pick first 3 cards, first quiz, first flash by position
      const cardCount = Math.min(3, module.cards.length)
      for (let i = 0; i < cardCount; i++) {
        seq.push({ type: "card", index: i })
      }
      if (module.quizQuestions.length > 0) {
        seq.push({ type: "quiz", index: 0 })
      }
      if (flashChallenges.length > 0) {
        seq.push({ type: "flash", index: 0 })
      }
    } else {
      let quizIdx = 0
      let tacitIdx = 0
      let seqIdx = 0
      let spotIdx = 0
      let flashIdx = 0
      let simIdx = 0
      let videoIdx = 0
      let modelIdx = 0
      const halfPoint = Math.floor(module.cards.length / 2)

      module.cards.forEach((_, i) => {
        seq.push({ type: "card", index: i })

        if ((i + 1) % 2 === 0 && flashIdx < flashChallenges.length) {
          seq.push({ type: "flash", index: flashIdx++ })
        }
        if ((i + 1) % 3 === 0 && quizIdx < module.quizQuestions.length) {
          seq.push({ type: "quiz", index: quizIdx++ })
        }
        if ((i + 1) % 4 === 0 && tacitIdx < module.tacitCues.length) {
          seq.push({ type: "tacit", index: tacitIdx++ })
        }
        if ((i + 1) % 5 === 0 && seqIdx < seqChallenges.length) {
          seq.push({ type: "sequence", index: seqIdx++ })
        }
        // Video card after every 5th card
        if ((i + 1) % 5 === 0 && videoIdx < videoCards.length) {
          seq.push({ type: "video", index: videoIdx++ })
        }
        if ((i + 1) % 6 === 0 && spotIdx < spotChallenges.length) {
          seq.push({ type: "spotDetail", index: spotIdx++ })
        }
        // Simulation at every 7th card
        if ((i + 1) % 7 === 0 && simIdx < simChallenges.length) {
          seq.push({ type: "simulation", index: simIdx++ })
        }
        // 3D model after the halfway point
        if (i === halfPoint && modelIdx < models3d.length) {
          seq.push({ type: "model3d", index: modelIdx++ })
        }
      })

      while (tacitIdx < module.tacitCues.length) seq.push({ type: "tacit", index: tacitIdx++ })
      while (quizIdx < module.quizQuestions.length) seq.push({ type: "quiz", index: quizIdx++ })
      while (seqIdx < seqChallenges.length) seq.push({ type: "sequence", index: seqIdx++ })
      while (spotIdx < spotChallenges.length) seq.push({ type: "spotDetail", index: spotIdx++ })
      while (flashIdx < flashChallenges.length) seq.push({ type: "flash", index: flashIdx++ })
      while (simIdx < simChallenges.length) seq.push({ type: "simulation", index: simIdx++ })
      while (videoIdx < videoCards.length) seq.push({ type: "video", index: videoIdx++ })
      while (modelIdx < models3d.length) seq.push({ type: "model3d", index: modelIdx++ })
    }

    return seq
  }, [module, quickLearn, seqChallenges, spotChallenges, flashChallenges, simChallenges, videoCards, models3d])

  const totalItems = sequence.length
  const maxXp = quickLearn
    ? Math.min(3, module.cards.length) * 10 +
      (module.quizQuestions.length > 0 ? 25 : 0) +
      (flashChallenges.length > 0 ? 15 : 0)
    : module.cards.length * 10 +
      module.quizQuestions.length * 25 +
      module.tacitCues.length * 15 +
      seqChallenges.length * 30 +
      spotChallenges.length * 20 +
      flashChallenges.length * 15 +
      simChallenges.length * 30 +
      videoCards.length * 15 +
      models3d.length * 20
  const progressPercent = totalItems > 0 ? ((currentIndex + 1) / totalItems) * 100 : 0

  // Persist XP and completion to store when completed
  const persistedRef = useRef(false)
  useEffect(() => {
    if (completed && !persistedRef.current) {
      persistedRef.current = true
      if (xp > 0) addXp(xp)
      updateProgress({
        completedCardIds: Array.from(completedCardsRef.current),
        completed: true,
        completedAt: new Date().toISOString(),
        currentCardIndex: totalItems - 1,
      })
    }
  }, [completed, xp, totalItems])

  const recordCardDuration = useCallback(() => {
    const elapsed = Date.now() - cardMountTime.current
    const item = sequence[currentIndex]
    if (item?.type === "card") {
      const cardId = module.cards[item.index]?.id
      if (cardId) {
        recordCardTime(module.id, cardId, elapsed)
        recordEvent(module.id, {
          type: "card_view",
          cardId,
          timestamp: new Date().toISOString(),
          durationMs: elapsed,
        })
      }
    }
  }, [currentIndex, module, sequence])

  const advance = useCallback(() => {
    recordCardDuration()

    // Track card completion
    const currentItem = sequence[currentIndex]
    if (currentItem?.type === "card") {
      const cardId = module.cards[currentItem.index]?.id
      if (cardId) completedCardsRef.current.add(cardId)
    }

    if (currentIndex >= totalItems - 1) {
      // Check for weak cards to show SmartReview (skip in quick mode)
      const weakCardIds = quickLearn ? [] : getWeakCards(module.id)
      if (weakCardIds.length > 0 && !reviewDone) {
        setShowReview(true)
      } else {
        setCompleted(true)
      }
      return
    }
    setDirection(1)
    const nextItem = sequence[currentIndex + 1]
    if (nextItem?.type === "card") {
      setXp((prev) => prev + 10)
      setRecentGain(10)
    } else if (nextItem?.type === "tacit") {
      setXp((prev) => prev + 15)
      setRecentGain(15)
    }
    setCurrentIndex((prev) => prev + 1)

    // Persist progress incrementally
    updateProgress({
      completedCardIds: Array.from(completedCardsRef.current),
      currentCardIndex: currentIndex + 1,
    })
  }, [currentIndex, totalItems, sequence, recordCardDuration, module, reviewDone, quickLearn])

  const goBack = useCallback(() => {
    if (currentIndex <= 0) return
    recordCardDuration()
    setDirection(-1)
    setCurrentIndex((prev) => prev - 1)
  }, [currentIndex, recordCardDuration])

  const jumpTo = useCallback((type: StackItem["type"]) => {
    const idx = sequence.findIndex((item, i) => item.type === type && i !== currentIndex)
    if (idx !== -1) {
      setDirection(idx > currentIndex ? 1 : -1)
      setCurrentIndex(idx)
    }
  }, [sequence, currentIndex])

  // Check if current item is interactive (should block swipe-to-skip)
  const currentItem = sequence[currentIndex]
  const isInteractiveItem = currentItem && currentItem.type !== "card" && currentItem.type !== "tacit" && currentItem.type !== "video"

  const handleQuizAnswer = useCallback(
    (correct: boolean) => {
      setQuizTotal((prev) => prev + 1)
      if (correct) {
        setQuizCorrect((prev) => prev + 1)
        setXp((prev) => prev + 25)
        setRecentGain(25)
      }
      const item = sequence[currentIndex]
      if (item?.type === "quiz") {
        const quizId = module.quizQuestions[item.index]?.id
        recordEvent(module.id, {
          type: "quiz_answer",
          cardId: quizId,
          timestamp: new Date().toISOString(),
          correct,
        })
      }
      setTimeout(() => advance(), 300)
    },
    [advance, currentIndex, module, sequence]
  )

  const handleQuizConfidence = useCallback(
    (confidence: number, correct: boolean) => {
      const item = sequence[currentIndex]
      if (item?.type === "quiz") {
        const quizId = module.quizQuestions[item.index]?.id
        if (quizId) {
          recordConfidence(module.id, {
            questionId: quizId,
            confidence,
            correct,
            timestamp: new Date().toISOString(),
          })
        }
      }
    },
    [currentIndex, module, sequence]
  )

  const handleToggleBookmark = useCallback(
    (cardId: string) => {
      toggleBookmark(module.id, cardId)
      setBookmarks((prev) =>
        prev.includes(cardId) ? prev.filter((id) => id !== cardId) : [...prev, cardId]
      )
      recordEvent(module.id, {
        type: "bookmark",
        cardId,
        timestamp: new Date().toISOString(),
      })
    },
    [module.id]
  )

  const handleSequenceComplete = useCallback(
    (correct: boolean, perfect: boolean) => {
      const gain = perfect ? 30 : correct ? 15 : 0
      if (gain > 0) {
        setXp((prev) => prev + gain)
        setRecentGain(gain)
      }
      recordEvent(module.id, {
        type: "challenge_complete",
        timestamp: new Date().toISOString(),
        correct,
      })
      setTimeout(() => advance(), 500)
    },
    [advance, module.id]
  )

  const handleSpotComplete = useCallback(
    (correct: boolean) => {
      const gain = correct ? 20 : 5
      setXp((prev) => prev + gain)
      setRecentGain(gain)
      recordEvent(module.id, {
        type: "challenge_complete",
        timestamp: new Date().toISOString(),
        correct,
      })
      setTimeout(() => advance(), 500)
    },
    [advance, module.id]
  )

  const handleFlashComplete = useCallback(
    (recalled: boolean, timeMs: number) => {
      setXp((prev) => prev + 15)
      setRecentGain(15)
      recordEvent(module.id, {
        type: "challenge_complete",
        timestamp: new Date().toISOString(),
        correct: recalled,
        durationMs: timeMs,
      })
      setTimeout(() => advance(), 500)
    },
    [advance, module.id]
  )

  const handleSimulationComplete = useCallback(
    (correct: boolean) => {
      const gain = correct ? 30 : 10
      setXp((prev) => prev + gain)
      setRecentGain(gain)
      recordEvent(module.id, {
        type: "challenge_complete",
        timestamp: new Date().toISOString(),
        correct,
      })
      setTimeout(() => advance(), 500)
    },
    [advance, module.id]
  )

  const handleVideoComplete = useCallback(() => {
    setXp((prev) => prev + 15)
    setRecentGain(15)
    recordEvent(module.id, {
      type: "card_view",
      timestamp: new Date().toISOString(),
    })
  }, [module.id])

  const handleModel3DComplete = useCallback(() => {
    setXp((prev) => prev + 20)
    setRecentGain(20)
    recordEvent(module.id, {
      type: "challenge_complete",
      timestamp: new Date().toISOString(),
      correct: true,
    })
    setTimeout(() => advance(), 500)
  }, [advance, module.id])

  const handleDragEnd = useCallback(
    (_: MouseEvent | TouchEvent | PointerEvent, info: PanInfo) => {
      // Block swipe navigation on interactive items (quiz, challenges)
      if (isInteractiveItem) return
      if (info.offset.x < -80) {
        advance()
      } else if (info.offset.x > 80) {
        goBack()
      }
    },
    [advance, goBack, isInteractiveItem]
  )

  // Smart Review screen
  if (showReview && !reviewDone) {
    const weakCardIds = getWeakCards(module.id)
    const weakCards = weakCardIds
      .map((cardId) => {
        const card = module.cards.find((c) => c.id === cardId)
        if (!card) return null
        const reasons: string[] = []
        if (bookmarks.includes(cardId)) reasons.push("Bookmarked")
        const progress = getCourseProgress(module.id)
        if (progress) {
          const relatedQuiz = module.quizQuestions.find((q) => q.relatedCardId === cardId)
          if (relatedQuiz && progress.quizResults[relatedQuiz.id] === false) {
            reasons.push("Quiz incorrect")
          }
          const confRating = progress.confidenceRatings?.find((r) => {
            const quiz = module.quizQuestions.find((q) => q.id === r.questionId)
            return quiz?.relatedCardId === cardId
          })
          if (confRating && confRating.confidence <= 2) {
            reasons.push("Low confidence")
          }
          if (progress.cardTimeSpent?.[cardId]) {
            const times = Object.values(progress.cardTimeSpent)
            const avg = times.reduce((a, b) => a + b, 0) / times.length
            if (progress.cardTimeSpent[cardId] >= avg * 2) {
              reasons.push("Took extra time")
            }
          }
        }
        if (reasons.length === 0) reasons.push("Needs review")
        return { card, reasons }
      })
      .filter(Boolean) as { card: MicroCardType; reasons: string[] }[]

    return (
      <div className="flex flex-col h-full">
        <div className="px-4 py-3">
          <XPBar currentXp={xp} maxXp={maxXp} recentGain={recentGain} />
        </div>
        <div className="flex-1 px-4 py-2">
          <SmartReview
            weakCards={weakCards}
            onContinue={() => {
              setReviewDone(true)
              setShowReview(false)
              setCompleted(true)
            }}
          />
        </div>
      </div>
    )
  }

  if (completed) {
    const quizScore = quizTotal > 0 ? Math.round((quizCorrect / quizTotal) * 100) : 100
    return (
      <CompletionBadge
        moduleTitle={module.title}
        xpEarned={xp}
        cardsCompleted={quickLearn ? Math.min(3, module.cards.length) : module.cards.length}
        quizScore={quizScore}
        onContinue={onComplete}
      />
    )
  }

  return (
    <div className="flex flex-col h-full">
      {/* Progress */}
      <div className="px-4 py-3 space-y-2">
        <XPBar currentXp={xp} maxXp={maxXp} recentGain={recentGain} />
        <div className="h-1.5 bg-space-600 rounded-full overflow-hidden">
          <motion.div
            className="h-full bg-gradient-to-r from-warm-amber via-warm-gold to-warm-copper rounded-full shadow-[0_0_8px_rgba(245,158,11,0.3)]"
            animate={{ width: `${progressPercent}%` }}
            transition={{ duration: 0.5, ease: "easeOut" }}
          />
        </div>
      </div>

      {/* Jump-to-challenge nav */}
      {!quickLearn && (
        <div className="px-4 pb-1 flex gap-1.5 overflow-x-auto no-scrollbar">
          {([
            { type: "card" as const, icon: Layers, label: "Cards" },
            { type: "quiz" as const, icon: HelpCircle, label: "Quiz" },
            { type: "flash" as const, icon: Timer, label: "Flash" },
            { type: "sequence" as const, icon: ListOrdered, label: "Sequence" },
            { type: "spotDetail" as const, icon: Search, label: "Spot" },
            { type: "simulation" as const, icon: Cable, label: "Wiring" },
            { type: "model3d" as const, icon: Box, label: "3D" },
            { type: "video" as const, icon: Film, label: "Video" },
          ]).filter(t => sequence.some(s => s.type === t.type)).map(({ type, icon: NavIcon, label }) => (
            <button
              key={type}
              onClick={() => jumpTo(type)}
              className={`flex items-center gap-1 px-2.5 py-1 rounded-full text-[10px] font-medium whitespace-nowrap transition-all border ${
                currentItem?.type === type
                  ? "bg-neon-purple/20 border-neon-purple/40 text-neon-purple"
                  : "bg-space-700/50 border-space-600/50 text-star-faint hover:border-star-faint/40"
              }`}
            >
              <NavIcon className="w-3 h-3" />
              {label}
            </button>
          ))}
        </div>
      )}

      {/* Card area */}
      <div className="flex-1 px-4 py-2 relative overflow-hidden flex items-start justify-center">
        <AnimatePresence mode="wait" custom={direction}>
          <motion.div
            key={currentIndex}
            custom={direction}
            initial={{ opacity: 0, x: direction >= 0 ? 60 : -60, scale: 0.97 }}
            animate={{ opacity: 1, x: 0, scale: 1 }}
            exit={{ opacity: 0, x: direction >= 0 ? -60 : 60, scale: 0.97 }}
            transition={{ duration: 0.35, ease: [0.25, 0.46, 0.45, 0.94] }}
            drag={isInteractiveItem ? false : "x"}
            dragConstraints={{ left: 0, right: 0 }}
            dragElastic={0.2}
            onDragEnd={isInteractiveItem ? undefined : handleDragEnd}
            className={isInteractiveItem ? "" : "cursor-grab active:cursor-grabbing"}
          >
            {currentItem.type === "card" ? (
              <MicroCard
                card={module.cards[currentItem.index]}
                index={currentItem.index}
                total={module.cards.length}
                isBookmarked={bookmarks.includes(module.cards[currentItem.index]?.id)}
                onToggleBookmark={() => handleToggleBookmark(module.cards[currentItem.index]?.id)}
                videoObjectUrl={videoObjectUrl}
              />
            ) : currentItem.type === "tacit" ? (
              <TacitCueCard
                cue={module.tacitCues[currentItem.index]}
                index={currentItem.index}
                total={module.tacitCues.length}
              />
            ) : currentItem.type === "quiz" ? (
              <QuizCard
                question={module.quizQuestions[currentItem.index]}
                onAnswer={handleQuizAnswer}
                onConfidence={handleQuizConfidence}
                isBookmarked={bookmarks.includes(module.quizQuestions[currentItem.index]?.relatedCardId || "")}
                onToggleBookmark={() => {
                  const relId = module.quizQuestions[currentItem.index]?.relatedCardId
                  if (relId) handleToggleBookmark(relId)
                }}
              />
            ) : currentItem.type === "sequence" ? (
              <SequenceCard
                challenge={seqChallenges[currentItem.index]}
                onComplete={handleSequenceComplete}
              />
            ) : currentItem.type === "spotDetail" ? (
              <SpotDetailCard
                challenge={spotChallenges[currentItem.index]}
                onComplete={handleSpotComplete}
              />
            ) : currentItem.type === "flash" ? (
              <FlashCard
                challenge={flashChallenges[currentItem.index]}
                onComplete={handleFlashComplete}
              />
            ) : currentItem.type === "simulation" ? (
              <SimulationCard
                challenge={simChallenges[currentItem.index]}
                onComplete={handleSimulationComplete}
              />
            ) : currentItem.type === "video" ? (
              <AnimatedVideoCard
                card={videoCards[currentItem.index]}
                onComplete={handleVideoComplete}
              />
            ) : currentItem.type === "model3d" ? (
              <Model3DCard
                model={models3d[currentItem.index]}
                onComplete={handleModel3DComplete}
              />
            ) : null}
          </motion.div>
        </AnimatePresence>
      </div>

      {/* Navigation buttons */}
      <div className="flex items-center justify-between px-4 py-4 pb-[max(1rem,env(safe-area-inset-bottom))]">
        <button
          onClick={goBack}
          disabled={currentIndex <= 0}
          aria-label="Previous card"
          className="p-3 rounded-xl bg-space-700 border border-space-600 text-star-dim disabled:opacity-30 transition-all hover:border-star-faint active:scale-95"
        >
          <ChevronLeft className="w-5 h-5" />
        </button>

        <p className="text-xs text-star-faint font-display">
          {isInteractiveItem ? "Complete to continue" : "Swipe or tap to navigate"}
        </p>

        <button
          onClick={advance}
          disabled={isInteractiveItem}
          aria-label="Next card"
          className="p-3 rounded-xl bg-warm-amber text-space-900 active:scale-95 transition-all hover:shadow-glow-warm disabled:opacity-30"
        >
          <ChevronRight className="w-5 h-5" />
        </button>
      </div>
    </div>
  )
}
