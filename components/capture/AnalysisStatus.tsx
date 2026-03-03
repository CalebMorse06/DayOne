"use client"

import { useState, useEffect } from "react"
import { motion, AnimatePresence } from "framer-motion"
import { 
  CheckCircle2, 
  Clock, 
  Loader2, 
  Sparkles, 
  Video, 
  ArrowRight,
  ShieldCheck,
  Zap
} from "lucide-react"

interface AnalysisStatusProps {
  jobId: string | null
  onComplete: (module: any) => void
}

export function AnalysisStatus({ jobId, onComplete }: AnalysisStatusProps) {
  const [progress, setProgress] = useState(0)
  const [status, setStatus] = useState("Initializing analysis...")
  const [stage, setStage] = useState(0)

  const stages = [
    { label: "Uploading Source Video", icon: Video, color: "text-cyan-400" },
    { label: "Gemini: Multimodal Analysis", icon: Sparkles, color: "text-neon-purple" },
    { label: "Extracting Tacit Documentation", icon: Zap, color: "text-warm-amber" },
    { label: "Generating Spatial Digital Twin", icon: LayoutGrid, color: "text-retro-teal" },
    { label: "Finalizing SOP and Certification", icon: ShieldCheck, color: "text-green-400" },
  ]

  // Mock stage progression for demo
  useEffect(() => {
    if (!jobId) return
    const interval = setInterval(() => {
      setProgress((prev) => {
        if (prev >= 100) {
          clearInterval(interval)
          return 100
        }
        const next = prev + 1
        if (next === 20) setStage(1)
        if (next === 50) setStage(2)
        if (next === 75) setStage(3)
        if (next === 90) setStage(4)
        return next
      })
    }, 200)
    return () => clearInterval(interval)
  }, [jobId])

  return (
    <div className="p-8 glass-card rounded-3xl border border-neon-purple/20 relative overflow-hidden">
      <div className="absolute top-0 right-0 p-4 opacity-10">
        <Loader2 className="w-24 h-24 text-neon-purple animate-spin" />
      </div>

      <div className="mb-10 text-center">
        <h2 className="text-xl font-black text-star-white font-display uppercase italic tracking-tight mb-2">
          Knowledge Extraction Engine
        </h2>
        <p className="text-xs text-star-faint uppercase tracking-[0.2em]">Deep Multimodal Ingestion Active</p>
      </div>

      {/* Progress Bar */}
      <div className="mb-12 relative">
        <div className="h-2 w-full bg-space-800 rounded-full overflow-hidden border border-space-700">
          <motion.div 
            className="h-full bg-gradient-to-r from-neon-purple via-cyan-400 to-green-400 shadow-glow-purple"
            animate={{ width: `${progress}%` }}
          />
        </div>
        <span className="absolute -top-6 right-0 text-xs font-mono font-bold text-neon-purple">{progress}%</span>
      </div>

      {/* Stage Indicators */}
      <div className="space-y-4">
        {stages.map((s, i) => {
          const Icon = s.icon
          const isActive = i === stage
          const isDone = i < stage
          return (
            <motion.div 
              key={i}
              animate={{ opacity: isActive || isDone ? 1 : 0.3, x: isActive ? 10 : 0 }}
              className={cn(
                "flex items-center gap-4 p-3 rounded-xl border transition-all",
                isActive ? "bg-space-800 border-neon-purple/30 shadow-glow-purple/5" : "bg-transparent border-transparent"
              )}
            >
              <div className={cn("p-2 rounded-lg bg-space-900", isDone ? "text-green-400" : isActive ? s.color : "text-star-faint")}>
                {isDone ? <CheckCircle2 className="w-5 h-5" /> : <Icon className="w-5 h-5" />}
              </div>
              <div className="flex-1">
                <p className={cn("text-sm font-bold", isActive ? "text-star-white" : "text-star-dim")}>{s.label}</p>
                {isActive && <p className="text-[10px] text-star-faint mt-0.5 animate-pulse">Processing metadata...</p>}
              </div>
              {isActive && <Loader2 className="w-4 h-4 text-neon-purple animate-spin" />}
            </motion.div>
          )
        })}
      </div>

      <AnimatePresence>
        {progress === 100 && (
          <motion.button
            initial={{ opacity: 0, y: 10 }}
            animate={{ opacity: 1, y: 0 }}
            className="w-full mt-10 py-4 bg-green-400 text-space-900 font-black rounded-xl uppercase tracking-widest flex items-center justify-center gap-2 shadow-glow-green"
          >
            Enter Mission Control <ArrowRight className="w-5 h-5" />
          </motion.button>
        )}
      </AnimatePresence>
    </div>
  )
}

import { cn } from "@/lib/utils"
import { LayoutGrid } from "lucide-react"
