"use client"

import { useEffect, useState } from "react"
import { motion, AnimatePresence } from "framer-motion"

interface ConfettiPiece {
  id: number
  x: number
  y: number
  rotation: number
  color: string
  size: number
  shape: "circle" | "rect" | "triangle"
}

const COLORS = ["#f59e0b", "#d97706", "#5eead4", "#fb7185", "#a855f7", "#fef3c7", "#34d399"]

function randomPiece(id: number): ConfettiPiece {
  return {
    id,
    x: Math.random() * 100,
    y: -10 - Math.random() * 20,
    rotation: Math.random() * 360,
    color: COLORS[Math.floor(Math.random() * COLORS.length)],
    size: 4 + Math.random() * 6,
    shape: (["circle", "rect", "triangle"] as const)[Math.floor(Math.random() * 3)],
  }
}

interface ConfettiProps {
  active?: boolean
  count?: number
}

export function Confetti({ active = true, count = 40 }: ConfettiProps) {
  const [pieces, setPieces] = useState<ConfettiPiece[]>([])
  const [visible, setVisible] = useState(active)

  useEffect(() => {
    if (active) {
      setPieces(Array.from({ length: count }, (_, i) => randomPiece(i)))
      setVisible(true)
      const timer = setTimeout(() => setVisible(false), 1500)
      return () => clearTimeout(timer)
    }
  }, [active, count])

  return (
    <AnimatePresence>
      {visible && (
        <div className="fixed inset-0 pointer-events-none z-50 overflow-hidden">
          {pieces.map((piece) => (
            <motion.div
              key={piece.id}
              initial={{
                left: `${piece.x}%`,
                top: `${piece.y}%`,
                rotate: 0,
                opacity: 1,
                scale: 1,
              }}
              animate={{
                top: `${100 + Math.random() * 20}%`,
                left: `${piece.x + (Math.random() - 0.5) * 30}%`,
                rotate: piece.rotation + 360 * (Math.random() > 0.5 ? 1 : -1),
                opacity: 0,
                scale: 0.5,
              }}
              exit={{ opacity: 0 }}
              transition={{
                duration: 1.2 + Math.random() * 0.5,
                ease: "easeOut",
              }}
              className="absolute"
            >
              {piece.shape === "circle" ? (
                <div
                  className="rounded-full"
                  style={{
                    width: piece.size,
                    height: piece.size,
                    backgroundColor: piece.color,
                  }}
                />
              ) : piece.shape === "rect" ? (
                <div
                  className="rounded-sm"
                  style={{
                    width: piece.size,
                    height: piece.size * 0.6,
                    backgroundColor: piece.color,
                  }}
                />
              ) : (
                <div
                  style={{
                    width: 0,
                    height: 0,
                    borderLeft: `${piece.size / 2}px solid transparent`,
                    borderRight: `${piece.size / 2}px solid transparent`,
                    borderBottom: `${piece.size}px solid ${piece.color}`,
                  }}
                />
              )}
            </motion.div>
          ))}
        </div>
      )}
    </AnimatePresence>
  )
}
