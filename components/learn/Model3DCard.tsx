"use client"

import { useState, Suspense, useRef } from "react"
import { motion, AnimatePresence } from "framer-motion"
import { Box, Eye, X, Check, Loader2 } from "lucide-react"
import type { InteractiveModel } from "@/lib/types"
import { cn } from "@/lib/utils"
import dynamic from "next/dynamic"

// Dynamically import the Three.js scene to avoid SSR issues
const ThreeScene = dynamic(() => import("./Model3DScene"), {
  ssr: false,
  loading: () => (
    <div className="w-full h-full flex items-center justify-center">
      <Loader2 className="w-8 h-8 text-neon-purple animate-spin" />
    </div>
  ),
})

interface Model3DCardProps {
  model: InteractiveModel
  onComplete: () => void
}

export function Model3DCard({ model, onComplete }: Model3DCardProps) {
  const [inspectedHotspots, setInspectedHotspots] = useState<Set<string>>(
    new Set()
  )
  const [activeHotspot, setActiveHotspot] = useState<string | null>(null)
  const [completed, setCompleted] = useState(false)

  const handleHotspotClick = (label: string) => {
    setActiveHotspot(label)
    const newSet = new Set(inspectedHotspots)
    newSet.add(label)
    setInspectedHotspots(newSet)

    if (newSet.size >= model.hotspots.length && !completed) {
      setCompleted(true)
      setTimeout(() => onComplete(), 1500)
    }
  }

  const activeHotspotData = model.hotspots.find(
    (h) => h.label === activeHotspot
  )

  return (
    <motion.div
      initial={{ opacity: 0, scale: 0.95 }}
      animate={{ opacity: 1, scale: 1 }}
      className="rounded-2xl border border-neon-purple/30 bg-space-700 overflow-hidden min-h-[400px] flex flex-col backdrop-blur-sm shadow-[0_4px_24px_rgba(0,0,0,0.3)]"
    >
      {/* Header */}
      <div className="px-5 pt-4 pb-2">
        <div className="flex items-center gap-2 mb-2">
          <span className="text-xs font-semibold px-2.5 py-1 rounded-full bg-neon-purple/10 text-neon-purple">
            3D Model
          </span>
          <Box className="w-4 h-4 text-neon-purple" />
        </div>
        <h3 className="text-lg font-bold text-star-white font-display">{model.title}</h3>
        <p className="text-xs text-star-dim mt-1">{model.description}</p>
      </div>

      {/* 3D Scene */}
      <div className="relative mx-5 rounded-lg overflow-hidden bg-space-900 h-64">
        <ThreeScene
          modelType={model.modelType}
          hotspots={model.hotspots}
          inspectedHotspots={inspectedHotspots}
          onHotspotClick={handleHotspotClick}
        />

        {/* Orbit hint */}
        <div className="absolute bottom-2 left-2 text-[10px] text-star-faint bg-space-900/70 px-2 py-1 rounded-full">
          Drag to rotate • Scroll to zoom
        </div>
      </div>

      {/* Hotspot info overlay */}
      <AnimatePresence>
        {activeHotspot && activeHotspotData && (
          <motion.div
            initial={{ opacity: 0, y: 10 }}
            animate={{ opacity: 1, y: 0 }}
            exit={{ opacity: 0, y: 10 }}
            className="mx-5 mt-3 p-3 rounded-lg bg-neon-purple/10 border border-neon-purple/20"
          >
            <div className="flex items-start justify-between">
              <div>
                <p className="text-sm font-bold text-neon-purple">
                  {activeHotspotData.label}
                </p>
                <p className="text-xs text-star-dim mt-1">
                  {activeHotspotData.description}
                </p>
              </div>
              <button
                onClick={() => setActiveHotspot(null)}
                className="text-star-faint hover:text-star-dim"
              >
                <X className="w-4 h-4" />
              </button>
            </div>
          </motion.div>
        )}
      </AnimatePresence>

      {/* Progress */}
      <div className="px-5 py-3 mt-auto border-t border-space-600">
        <div className="flex items-center justify-between">
          <div className="flex items-center gap-2">
            <Eye className="w-3.5 h-3.5 text-star-faint" />
            <span className="text-xs text-star-dim">
              {inspectedHotspots.size}/{model.hotspots.length} inspected
            </span>
          </div>
          <div className="flex gap-1">
            {model.hotspots.map((h) => (
              <div
                key={h.label}
                className={cn(
                  "w-2 h-2 rounded-full transition-all",
                  inspectedHotspots.has(h.label)
                    ? "bg-neon-green"
                    : "bg-space-600"
                )}
              />
            ))}
          </div>
          <AnimatePresence>
            {completed && (
              <motion.div
                initial={{ scale: 0 }}
                animate={{ scale: 1 }}
                className="flex items-center gap-1 text-neon-green text-xs font-bold"
              >
                <Check className="w-3.5 h-3.5" />
                +20 XP
              </motion.div>
            )}
          </AnimatePresence>
        </div>
      </div>
    </motion.div>
  )
}
