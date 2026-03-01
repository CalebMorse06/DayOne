"use client"

import { useState, useEffect, useRef, useCallback } from "react"
import { motion, AnimatePresence } from "framer-motion"
import { Play, Pause, Film } from "lucide-react"
import type { VideoCard } from "@/lib/types"
import { cn } from "@/lib/utils"

interface AnimatedVideoCardProps {
  card: VideoCard
  onComplete: () => void
}

export function AnimatedVideoCard({ card, onComplete }: AnimatedVideoCardProps) {
  const [currentFrame, setCurrentFrame] = useState(0)
  const [isPlaying, setIsPlaying] = useState(true)
  const [hasCompleted, setHasCompleted] = useState(false)
  const intervalRef = useRef<NodeJS.Timeout | null>(null)
  const containerRef = useRef<HTMLDivElement>(null)

  const frameCount = card.frames.length
  const frameDuration = card.durationMs / Math.max(frameCount, 1)

  const startPlayback = useCallback(() => {
    if (intervalRef.current) clearInterval(intervalRef.current)
    intervalRef.current = setInterval(() => {
      setCurrentFrame((prev) => {
        const next = prev + 1
        if (next >= frameCount) {
          if (!hasCompleted) {
            setHasCompleted(true)
            onComplete()
          }
          return 0 // loop
        }
        return next
      })
    }, frameDuration)
  }, [frameCount, frameDuration, hasCompleted, onComplete])

  const stopPlayback = useCallback(() => {
    if (intervalRef.current) {
      clearInterval(intervalRef.current)
      intervalRef.current = null
    }
  }, [])

  useEffect(() => {
    if (isPlaying) {
      startPlayback()
    } else {
      stopPlayback()
    }
    return stopPlayback
  }, [isPlaying, startPlayback, stopPlayback])

  // Auto-pause when card leaves viewport
  useEffect(() => {
    const observer = new IntersectionObserver(
      ([entry]) => {
        if (!entry.isIntersecting) {
          setIsPlaying(false)
        }
      },
      { threshold: 0.3 }
    )
    if (containerRef.current) {
      observer.observe(containerRef.current)
    }
    return () => observer.disconnect()
  }, [])

  const togglePlay = () => setIsPlaying((prev) => !prev)

  return (
    <motion.div
      ref={containerRef}
      initial={{ opacity: 0, scale: 0.95 }}
      animate={{ opacity: 1, scale: 1 }}
      className="rounded-2xl border border-neon-purple/30 bg-space-700 overflow-hidden min-h-[320px] flex flex-col backdrop-blur-sm shadow-[0_4px_24px_rgba(0,0,0,0.3)]"
    >
      {/* Header */}
      <div className="flex items-center gap-2 px-5 pt-4 pb-2">
        <span className="text-xs font-semibold px-2.5 py-1 rounded-full bg-neon-purple/10 text-neon-purple">
          Video Walkthrough
        </span>
        <Film className="w-4 h-4 text-neon-purple" />
      </div>
      <h3 className="text-lg font-bold text-star-white px-5 mb-3 font-display">
        {card.title}
      </h3>

      {/* Frame area */}
      <div className="relative mx-5 rounded-lg overflow-hidden bg-space-900 aspect-video">
        <AnimatePresence mode="wait">
          <motion.div
            key={currentFrame}
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            transition={{ duration: 0.6 }}
            className="absolute inset-0"
          >
            {card.frames[currentFrame] ? (
              <img
                src={card.frames[currentFrame]}
                alt={`Frame ${currentFrame + 1}`}
                className="w-full h-full object-cover"
              />
            ) : (
              <div className="w-full h-full flex items-center justify-center text-star-faint">
                <Film className="w-12 h-12 opacity-30" />
              </div>
            )}
          </motion.div>
        </AnimatePresence>

        {/* Gradient overlay */}
        <div className="absolute inset-0 bg-gradient-to-t from-space-900/60 to-transparent pointer-events-none" />

        {/* Play/Pause button */}
        <button
          onClick={togglePlay}
          className="absolute bottom-3 left-3 p-2 rounded-full bg-space-900/70 backdrop-blur-sm border border-space-600 hover:bg-space-800 transition-colors z-10"
        >
          {isPlaying ? (
            <Pause className="w-4 h-4 text-star-white" />
          ) : (
            <Play className="w-4 h-4 text-star-white" />
          )}
        </button>

        {/* Frame counter */}
        <span className="absolute bottom-3 right-3 text-[10px] text-star-faint bg-space-900/70 px-2 py-1 rounded-full z-10">
          {currentFrame + 1} / {frameCount}
        </span>
      </div>

      {/* Progress dots */}
      <div className="flex items-center justify-center gap-1.5 py-3 px-5">
        {card.frames.map((_, i) => (
          <button
            key={i}
            onClick={() => setCurrentFrame(i)}
            className={cn(
              "w-2 h-2 rounded-full transition-all",
              i === currentFrame
                ? "bg-neon-purple w-4 shadow-[0_0_6px_rgba(168,85,247,0.5)]"
                : i < currentFrame
                ? "bg-neon-purple/40"
                : "bg-space-600"
            )}
          />
        ))}
      </div>

      {/* Caption */}
      <p className="text-xs text-star-dim px-5 pb-4 leading-relaxed">
        {card.caption}
      </p>

      {/* Completion badge */}
      <AnimatePresence>
        {hasCompleted && (
          <motion.div
            initial={{ opacity: 0, y: 10 }}
            animate={{ opacity: 1, y: 0 }}
            className="px-5 pb-4 flex items-center gap-1.5 text-neon-green text-xs font-bold"
          >
            <span>+15 XP</span>
          </motion.div>
        )}
      </AnimatePresence>
    </motion.div>
  )
}
