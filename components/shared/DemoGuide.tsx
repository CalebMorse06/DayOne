"use client"

import { useState, useEffect, useRef } from "react"
import { usePathname } from "next/navigation"
import { motion, AnimatePresence } from "framer-motion"
import { Info, X } from "lucide-react"
import { useDemoGuide } from "./DemoGuideProvider"

const GUIDE_CONTENT: { pattern: RegExp; text: string }[] = [
  {
    pattern: /^\/$/,
    text: "DayOne solves the skilled-labor knowledge crisis. When veteran workers retire, decades of expertise vanish. AI transforms their training videos into structured micro-learning that gets new hires production-ready in days.",
  },
  {
    pattern: /^\/courses\/builder/,
    text: "Upload any training video — a veteran demonstrating a procedure, a safety walkthrough, a quality inspection. AI extracts steps, hazards, tacit knowledge, measurements, and generates interactive challenges automatically. One video becomes a complete course.",
  },
  {
    pattern: /^\/courses\/[^/]+\/learn/,
    text: "This is active recall, not passive video watching. Cards surface the environmental cues experts notice (sounds, smells, visual patterns), common mistakes new hires make, and critical checkpoints. Quizzes, timed recall, and confidence tracking reinforce retention.",
  },
  {
    pattern: /^\/courses\/[^/]+\/ask/,
    text: "AI mentor answers questions using only the training video content — with cited timestamps, card references, and safety warnings. Like having the veteran expert available 24/7 for follow-up questions.",
  },
  {
    pattern: /^\/courses\/[^/]+$/,
    text: "Mastery analytics show exactly where each learner struggles. Difficulty heatmaps, accuracy trends, and AI-identified pitfalls tell supervisors when someone is ready for the floor — replacing gut-feel sign-offs with data.",
  },
]

function getGuideText(pathname: string): string | null {
  for (const entry of GUIDE_CONTENT) {
    if (entry.pattern.test(pathname)) return entry.text
  }
  return null
}

export function DemoGuide() {
  const { isDemoMode } = useDemoGuide()
  const pathname = usePathname()
  const [open, setOpen] = useState(false)
  const prevPathname = useRef(pathname)
  const timerRef = useRef<ReturnType<typeof setTimeout>>()

  // Auto-open on navigation
  useEffect(() => {
    if (!isDemoMode) return
    if (pathname !== prevPathname.current) {
      prevPathname.current = pathname
      setOpen(false)
      timerRef.current = setTimeout(() => setOpen(true), 500)
    } else {
      // First mount
      timerRef.current = setTimeout(() => setOpen(true), 500)
    }
    return () => {
      if (timerRef.current) clearTimeout(timerRef.current)
    }
  }, [pathname, isDemoMode])

  if (!isDemoMode) return null

  const text = getGuideText(pathname)
  if (!text) return null

  return (
    <div className="fixed bottom-6 right-6 z-50 flex flex-col items-end gap-2">
      <AnimatePresence>
        {open && (
          <motion.div
            initial={{ opacity: 0, y: 10, scale: 0.95 }}
            animate={{ opacity: 1, y: 0, scale: 1 }}
            exit={{ opacity: 0, y: 10, scale: 0.95 }}
            transition={{ duration: 0.2 }}
            className="max-w-sm p-4 glass-warm rounded-xl shadow-glow-warm/30"
          >
            <div className="flex items-start gap-2">
              <Info className="w-4 h-4 text-warm-amber flex-shrink-0 mt-0.5" />
              <p className="text-sm text-star-white leading-relaxed">{text}</p>
              <button
                onClick={() => setOpen(false)}
                aria-label="Close demo guide"
                className="p-0.5 rounded hover:bg-white/10 transition-colors flex-shrink-0"
              >
                <X className="w-3.5 h-3.5 text-star-faint" />
              </button>
            </div>
          </motion.div>
        )}
      </AnimatePresence>

      <button
        onClick={() => setOpen((v) => !v)}
        aria-label="Toggle demo guide"
        className="flex items-center gap-2 px-4 py-2 glass-warm rounded-full text-sm font-medium text-warm-amber hover:shadow-glow-warm/30 transition-all"
      >
        <Info className="w-4 h-4" />
        Demo Guide
      </button>
    </div>
  )
}
