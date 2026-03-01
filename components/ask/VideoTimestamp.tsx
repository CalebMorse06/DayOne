"use client"

import { useState, useRef, useCallback } from "react"
import { Play, X } from "lucide-react"
import { motion, AnimatePresence } from "framer-motion"

interface VideoTimestampProps {
  timestamp: string
  videoUrl?: string | null
}

function parseTimestamp(ts: string): number {
  const parts = ts.replace(/[^0-9:]/g, "").split(":").map(Number)
  if (parts.length === 3) return parts[0] * 3600 + parts[1] * 60 + parts[2]
  if (parts.length === 2) return parts[0] * 60 + parts[1]
  return 0
}

export function VideoTimestamp({ timestamp, videoUrl }: VideoTimestampProps) {
  const [showVideo, setShowVideo] = useState(false)
  const videoRef = useRef<HTMLVideoElement>(null)

  const handleClick = useCallback(() => {
    if (!videoUrl) return
    setShowVideo(true)
    setTimeout(() => {
      if (videoRef.current) {
        videoRef.current.currentTime = parseTimestamp(timestamp)
        videoRef.current.play().catch(() => {})
      }
    }, 100)
  }, [videoUrl, timestamp])

  return (
    <>
      <button
        onClick={handleClick}
        className={`inline-flex items-center gap-1 px-2 py-0.5 bg-space-600 rounded-md text-xs font-mono transition-colors ${
          videoUrl
            ? "text-neon-cyan hover:bg-neon-cyan/20 cursor-pointer"
            : "text-neon-cyan/60 cursor-default"
        }`}
      >
        <Play className="w-3 h-3" />
        {timestamp}
      </button>

      <AnimatePresence>
        {showVideo && videoUrl && (
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            className="fixed inset-0 z-50 flex items-center justify-center bg-space-900/90 backdrop-blur-sm"
            onClick={() => setShowVideo(false)}
          >
            <motion.div
              initial={{ scale: 0.9, opacity: 0 }}
              animate={{ scale: 1, opacity: 1 }}
              exit={{ scale: 0.9, opacity: 0 }}
              className="relative w-full max-w-2xl mx-4"
              onClick={(e) => e.stopPropagation()}
            >
              <button
                onClick={() => setShowVideo(false)}
                className="absolute -top-10 right-0 p-1.5 rounded-lg bg-space-700 hover:bg-space-600 text-star-dim transition-colors"
              >
                <X className="w-4 h-4" />
              </button>
              <video
                ref={videoRef}
                src={videoUrl}
                controls
                className="w-full rounded-xl shadow-2xl"
                style={{ maxHeight: "70vh" }}
              />
              <p className="text-center text-xs text-star-faint mt-2">
                Playing from {timestamp}
              </p>
            </motion.div>
          </motion.div>
        )}
      </AnimatePresence>
    </>
  )
}
