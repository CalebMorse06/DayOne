"use client"

import { useState, useRef, useCallback, useEffect } from "react"
import { motion, AnimatePresence } from "framer-motion"
import { Zap, RotateCcw, Check, X } from "lucide-react"
import type { SimulationChallenge } from "@/lib/types"
import { cn } from "@/lib/utils"

interface SimulationCardProps {
  challenge: SimulationChallenge
  onComplete: (correct: boolean) => void
}

interface Connection {
  sourceId: string
  targetId: string
}

export function SimulationCard({ challenge, onComplete }: SimulationCardProps) {
  if (challenge.type === "dial-set") {
    return <DialSetSimulation challenge={challenge} onComplete={onComplete} />
  }
  return <WireConnectSimulation challenge={challenge} onComplete={onComplete} />
}

function WireConnectSimulation({
  challenge,
  onComplete,
}: SimulationCardProps) {
  const pins = challenge.pins || []
  const [connections, setConnections] = useState<Connection[]>([])
  const [dragging, setDragging] = useState<{
    sourceId: string
    x: number
    y: number
  } | null>(null)
  const [feedback, setFeedback] = useState<Record<string, "correct" | "wrong">>({})
  const [allCorrect, setAllCorrect] = useState(false)
  const containerRef = useRef<HTMLDivElement>(null)
  const sourceRefs = useRef<Record<string, HTMLDivElement | null>>({})
  const targetRefs = useRef<Record<string, HTMLDivElement | null>>({})

  // Shuffled targets for display — use targetId as display label
  const [shuffledTargets] = useState(() => {
    const seen = new Set<string>()
    const targets = pins
      .filter((p) => {
        if (seen.has(p.targetId)) return false
        seen.add(p.targetId)
        return true
      })
      .map((p) => ({
        id: p.targetId,
        label: p.targetId
          .replace(/^target_/, "")
          .replace(/_/g, " ")
          .replace(/\b\w/g, (c) => c.toUpperCase()),
      }))
    // Fisher-Yates shuffle
    const arr = [...targets]
    for (let i = arr.length - 1; i > 0; i--) {
      const j = Math.floor(Math.random() * (i + 1))
      ;[arr[i], arr[j]] = [arr[j], arr[i]]
    }
    return arr
  })

  const getRelativePos = useCallback(
    (el: HTMLElement) => {
      if (!containerRef.current) return { x: 0, y: 0 }
      const containerRect = containerRef.current.getBoundingClientRect()
      const elRect = el.getBoundingClientRect()
      return {
        x: elRect.left - containerRect.left + elRect.width / 2,
        y: elRect.top - containerRect.top + elRect.height / 2,
      }
    },
    []
  )

  const handlePointerDown = useCallback(
    (sourceId: string, e: React.PointerEvent) => {
      // Don't start a new drag if this source is already connected
      if (connections.find((c) => c.sourceId === sourceId)) return
      const rect = containerRef.current?.getBoundingClientRect()
      if (!rect) return
      setDragging({
        sourceId,
        x: e.clientX - rect.left,
        y: e.clientY - rect.top,
      })
    },
    [connections]
  )

  const handlePointerMove = useCallback(
    (e: React.PointerEvent) => {
      if (!dragging || !containerRef.current) return
      const rect = containerRef.current.getBoundingClientRect()
      setDragging((prev) =>
        prev
          ? { ...prev, x: e.clientX - rect.left, y: e.clientY - rect.top }
          : null
      )
    },
    [dragging]
  )

  const handlePointerUp = useCallback(
    (e: React.PointerEvent) => {
      if (!dragging) return
      // Check if pointer is over a target
      const elements = document.elementsFromPoint(e.clientX, e.clientY)
      let targetId: string | null = null
      for (const el of elements) {
        const tid = (el as HTMLElement).dataset?.targetId
        if (tid) {
          targetId = tid
          break
        }
      }

      if (targetId && !connections.find((c) => c.targetId === targetId)) {
        const pin = pins.find((p) => p.id === dragging.sourceId)
        const isCorrect = pin?.targetId === targetId

        const newConn: Connection = {
          sourceId: dragging.sourceId,
          targetId,
        }
        const newConnections = [...connections, newConn]
        setConnections(newConnections)

        setFeedback((prev) => ({
          ...prev,
          [dragging.sourceId]: isCorrect ? "correct" : "wrong",
        }))

        if (!isCorrect) {
          // Reset wrong connection after delay
          setTimeout(() => {
            setConnections((prev) =>
              prev.filter((c) => c.sourceId !== dragging.sourceId)
            )
            setFeedback((prev) => {
              const next = { ...prev }
              delete next[dragging.sourceId]
              return next
            })
          }, 800)
        } else {
          // Check if all correct
          const correctCount =
            newConnections.filter((c) => {
              const p = pins.find((pp) => pp.id === c.sourceId)
              return p?.targetId === c.targetId
            }).length
          if (correctCount === pins.length) {
            setAllCorrect(true)
            setTimeout(() => onComplete(true), 1200)
          }
        }
      }
      setDragging(null)
    },
    [dragging, connections, pins, onComplete]
  )

  const handleReset = () => {
    setConnections([])
    setFeedback({})
    setAllCorrect(false)
  }

  return (
    <motion.div
      initial={{ opacity: 0, scale: 0.95 }}
      animate={{ opacity: 1, scale: 1 }}
      className="p-5 rounded-2xl border border-neon-cyan/30 bg-space-700 min-h-[360px] flex flex-col backdrop-blur-sm shadow-[0_4px_24px_rgba(0,0,0,0.3)]"
    >
      {/* Header */}
      <div className="flex items-center gap-2 mb-2">
        <span className="text-xs font-semibold px-2.5 py-1 rounded-full bg-neon-cyan/10 text-neon-cyan">
          Simulation
        </span>
        <Zap className="w-4 h-4 text-neon-cyan" />
      </div>
      <h3 className="text-lg font-bold text-star-white mb-1 font-display">
        {challenge.title}
      </h3>
      <p className="text-xs text-star-dim mb-4">{challenge.instructions}</p>

      {/* Wire connection area */}
      <div
        ref={containerRef}
        className="relative flex-1 select-none touch-none"
        onPointerMove={handlePointerMove}
        onPointerUp={handlePointerUp}
      >
        {/* SVG overlay for wires */}
        <svg className="absolute inset-0 w-full h-full pointer-events-none z-10">
          {/* Existing connections */}
          {connections.map((conn) => {
            const srcEl = sourceRefs.current[conn.sourceId]
            const tgtEl = targetRefs.current[conn.targetId]
            if (!srcEl || !tgtEl) return null
            const src = getRelativePos(srcEl)
            const tgt = getRelativePos(tgtEl)
            const pin = pins.find((p) => p.id === conn.sourceId)
            const isCorrect = pin?.targetId === conn.targetId
            const midX = (src.x + tgt.x) / 2
            return (
              <path
                key={conn.sourceId}
                d={`M ${src.x} ${src.y} C ${midX} ${src.y}, ${midX} ${tgt.y}, ${tgt.x} ${tgt.y}`}
                stroke={
                  isCorrect ? "#34d399" : "#ec4899"
                }
                strokeWidth={3}
                fill="none"
                strokeLinecap="round"
                className={isCorrect ? "drop-shadow-[0_0_6px_#34d399]" : ""}
              />
            )
          })}
          {/* Dragging wire */}
          {dragging && (() => {
            const srcEl = sourceRefs.current[dragging.sourceId]
            if (!srcEl) return null
            const src = getRelativePos(srcEl)
            const midX = (src.x + dragging.x) / 2
            return (
              <path
                d={`M ${src.x} ${src.y} C ${midX} ${src.y}, ${midX} ${dragging.y}, ${dragging.x} ${dragging.y}`}
                stroke="#22d3ee"
                strokeWidth={2}
                fill="none"
                strokeDasharray="6 4"
                strokeLinecap="round"
                className="drop-shadow-[0_0_4px_#22d3ee]"
              />
            )
          })()}
        </svg>

        <div className="flex justify-between h-full items-stretch">
          {/* Source pins */}
          <div className="flex flex-col gap-3 justify-center">
            {pins.map((pin) => (
              <div
                key={pin.id}
                ref={(el) => { sourceRefs.current[pin.id] = el }}
                onPointerDown={(e) => handlePointerDown(pin.id, e)}
                className={cn(
                  "flex items-center gap-2 px-3 py-2 rounded-lg border cursor-grab active:cursor-grabbing transition-all z-20",
                  feedback[pin.id] === "correct"
                    ? "border-neon-green/50 bg-neon-green/10"
                    : feedback[pin.id] === "wrong"
                    ? "border-neon-magenta/50 bg-neon-magenta/10 animate-pulse"
                    : "border-space-600 bg-space-800 hover:border-neon-cyan/40"
                )}
              >
                <div
                  className="w-3 h-3 rounded-full flex-shrink-0"
                  style={{ backgroundColor: pin.color }}
                />
                <span className="text-xs text-star-white font-medium">
                  {pin.label}
                </span>
              </div>
            ))}
          </div>

          {/* Target sockets */}
          <div className="flex flex-col gap-3 justify-center">
            {shuffledTargets.map((target) => {
              const connected = connections.find(
                (c) => c.targetId === target.id
              )
              const pin = connected
                ? pins.find((p) => p.id === connected.sourceId)
                : null
              const isCorrect =
                connected && pin?.targetId === target.id

              return (
                <div
                  key={target.id}
                  data-target-id={target.id}
                  ref={(el) => { targetRefs.current[target.id] = el }}
                  className={cn(
                    "flex items-center gap-2 px-3 py-2 rounded-lg border transition-all z-20",
                    isCorrect
                      ? "border-neon-green/50 bg-neon-green/10"
                      : connected
                      ? "border-neon-magenta/50 bg-neon-magenta/10"
                      : dragging
                      ? "border-neon-cyan/30 bg-space-800 ring-1 ring-neon-cyan/20"
                      : "border-space-600 bg-space-800"
                  )}
                >
                  <div className="w-3 h-3 rounded-full border-2 border-star-faint flex-shrink-0" />
                  <span className="text-xs text-star-dim">{target.label}</span>
                </div>
              )
            })}
          </div>
        </div>
      </div>

      {/* Footer */}
      <div className="flex items-center justify-between mt-4 pt-3 border-t border-space-600">
        <button
          onClick={handleReset}
          className="flex items-center gap-1.5 text-xs text-star-dim hover:text-star-white transition-colors"
        >
          <RotateCcw className="w-3.5 h-3.5" />
          Reset
        </button>
        <AnimatePresence>
          {allCorrect && (
            <motion.div
              initial={{ scale: 0, opacity: 0 }}
              animate={{ scale: 1, opacity: 1 }}
              className="flex items-center gap-1.5 text-neon-green"
            >
              <Check className="w-4 h-4" />
              <span className="text-xs font-bold">+30 XP</span>
            </motion.div>
          )}
        </AnimatePresence>
        <span className="text-[10px] text-star-faint">
          {connections.filter((c) => {
            const p = pins.find((pp) => pp.id === c.sourceId)
            return p?.targetId === c.targetId
          }).length}
          /{pins.length} connected
        </span>
      </div>
    </motion.div>
  )
}

function DialSetSimulation({
  challenge,
  onComplete,
}: SimulationCardProps) {
  const target = challenge.dialTarget || { value: 50, tolerance: 5, unit: "%" }
  const [angle, setAngle] = useState(0)
  const [isCorrect, setIsCorrect] = useState(false)
  const [submitted, setSubmitted] = useState(false)
  const dialRef = useRef<HTMLDivElement>(null)

  // Convert angle (0-360) to value (0-100 scale)
  const currentValue = Math.round((angle / 360) * 100)
  const targetAngle = (target.value / 100) * 360

  const handlePointerMove = useCallback(
    (e: PointerEvent) => {
      if (!dialRef.current) return
      const rect = dialRef.current.getBoundingClientRect()
      const cx = rect.left + rect.width / 2
      const cy = rect.top + rect.height / 2
      const rad = Math.atan2(e.clientY - cy, e.clientX - cx)
      let deg = (rad * 180) / Math.PI + 90
      if (deg < 0) deg += 360
      setAngle(deg)
    },
    []
  )

  const handlePointerDown = useCallback(() => {
    const onMove = (e: PointerEvent) => handlePointerMove(e)
    const onUp = () => {
      window.removeEventListener("pointermove", onMove)
      window.removeEventListener("pointerup", onUp)
    }
    window.addEventListener("pointermove", onMove)
    window.addEventListener("pointerup", onUp)
  }, [handlePointerMove])

  const handleSubmit = () => {
    const diff = Math.abs(currentValue - target.value)
    const correct = diff <= target.tolerance
    setIsCorrect(correct)
    setSubmitted(true)
    setTimeout(() => onComplete(correct), 1200)
  }

  return (
    <motion.div
      initial={{ opacity: 0, scale: 0.95 }}
      animate={{ opacity: 1, scale: 1 }}
      className="p-5 rounded-2xl border border-neon-orange/30 bg-space-700 min-h-[360px] flex flex-col items-center backdrop-blur-sm shadow-[0_4px_24px_rgba(0,0,0,0.3)]"
    >
      <div className="flex items-center gap-2 mb-2 self-start">
        <span className="text-xs font-semibold px-2.5 py-1 rounded-full bg-neon-orange/10 text-neon-orange">
          Simulation
        </span>
      </div>
      <h3 className="text-lg font-bold text-star-white mb-1 self-start">
        {challenge.title}
      </h3>
      <p className="text-xs text-star-dim mb-6 self-start">
        {challenge.instructions}
      </p>

      {/* Dial */}
      <div
        ref={dialRef}
        className="relative w-48 h-48 rounded-full border-4 border-space-600 bg-space-800 cursor-pointer mb-4"
        onPointerDown={handlePointerDown}
      >
        {/* Target zone arc */}
        <div
          className="absolute inset-2 rounded-full"
          style={{
            background: `conic-gradient(transparent ${
              ((target.value - target.tolerance) / 100) * 360
            }deg, rgba(52,211,153,0.15) ${
              ((target.value - target.tolerance) / 100) * 360
            }deg ${
              ((target.value + target.tolerance) / 100) * 360
            }deg, transparent ${
              ((target.value + target.tolerance) / 100) * 360
            }deg)`,
          }}
        />
        {/* Needle */}
        <div
          className="absolute top-1/2 left-1/2 origin-bottom -translate-x-1/2 -translate-y-full"
          style={{
            transform: `translateX(-50%) rotate(${angle}deg)`,
            transformOrigin: "bottom center",
          }}
        >
          <div
            className={cn(
              "w-1 h-20 rounded-full",
              submitted
                ? isCorrect
                  ? "bg-neon-green shadow-glow-green"
                  : "bg-neon-magenta"
                : "bg-neon-cyan shadow-glow-cyan"
            )}
          />
        </div>
        {/* Center dot */}
        <div className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 w-4 h-4 rounded-full bg-space-600 border-2 border-star-dim" />
      </div>

      {/* Readout */}
      <div className="text-center mb-4">
        <p className="text-2xl font-mono font-bold text-star-white">
          {currentValue} {target.unit}
        </p>
        <p className="text-xs text-star-faint">
          Target: {target.value} {target.unit} (±{target.tolerance})
        </p>
      </div>

      {!submitted ? (
        <button
          onClick={handleSubmit}
          className="px-6 py-2 rounded-lg bg-neon-orange text-space-900 font-semibold text-sm hover:bg-neon-orange/90 transition-colors"
        >
          Lock In Reading
        </button>
      ) : (
        <motion.div
          initial={{ scale: 0 }}
          animate={{ scale: 1 }}
          className={cn(
            "flex items-center gap-2 text-sm font-bold",
            isCorrect ? "text-neon-green" : "text-neon-magenta"
          )}
        >
          {isCorrect ? (
            <>
              <Check className="w-5 h-5" />
              Perfect reading! +30 XP
            </>
          ) : (
            <>
              <X className="w-5 h-5" />
              Off target — try again next time
            </>
          )}
        </motion.div>
      )}
    </motion.div>
  )
}
