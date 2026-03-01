"use client"

import { useEffect, useState } from "react"
import { motion, AnimatePresence } from "framer-motion"
import { Check, Loader2, Brain, Eye, Wrench, Shield, BookOpen } from "lucide-react"
import { cn } from "@/lib/utils"

const ANALYSIS_STEPS = [
  { icon: Eye, label: "Analyzing video frames...", duration: 3000 },
  { icon: Wrench, label: "Detecting tools & equipment...", duration: 2500 },
  { icon: Brain, label: "Extracting tacit knowledge...", duration: 3000 },
  { icon: Shield, label: "Identifying safety hazards...", duration: 2000 },
  { icon: BookOpen, label: "Generating micro-learning cards...", duration: 2500 },
]

interface AnalysisProgressProps {
  isAnalyzing: boolean
  onSimulationComplete?: () => void
}

export function AnalysisProgress({
  isAnalyzing,
  onSimulationComplete,
}: AnalysisProgressProps) {
  const [currentStep, setCurrentStep] = useState(0)
  const [completedSteps, setCompletedSteps] = useState<number[]>([])

  useEffect(() => {
    if (!isAnalyzing) {
      setCurrentStep(0)
      setCompletedSteps([])
      return
    }

    let stepIndex = 0
    const advanceStep = () => {
      if (stepIndex < ANALYSIS_STEPS.length) {
        setCompletedSteps((prev) => [...prev, stepIndex])
        stepIndex++
        if (stepIndex < ANALYSIS_STEPS.length) {
          setCurrentStep(stepIndex)
          setTimeout(advanceStep, ANALYSIS_STEPS[stepIndex].duration)
        } else {
          onSimulationComplete?.()
        }
      }
    }

    setCurrentStep(0)
    setTimeout(advanceStep, ANALYSIS_STEPS[0].duration)
  }, [isAnalyzing, onSimulationComplete])

  if (!isAnalyzing) return null

  return (
    <motion.div
      initial={{ opacity: 0, y: 20 }}
      animate={{ opacity: 1, y: 0 }}
      className="space-y-3"
    >
      <div className="flex items-center gap-2 mb-4">
        <div className="w-8 h-8 rounded-lg bg-neon-cyan/10 flex items-center justify-center">
          <Brain className="w-4 h-4 text-neon-cyan" />
        </div>
        <div>
          <p className="text-sm font-semibold text-star-white">AI Analysis in Progress</p>
          <p className="text-xs text-star-faint">Gemini 2.0 Flash processing your video</p>
        </div>
      </div>

      <div className="space-y-2">
        <AnimatePresence>
          {ANALYSIS_STEPS.map((step, index) => {
            const Icon = step.icon
            const isCompleted = completedSteps.includes(index)
            const isCurrent = currentStep === index && !isCompleted
            const isPending = index > currentStep

            return (
              <motion.div
                key={index}
                initial={{ opacity: 0, x: -10 }}
                animate={{ opacity: 1, x: 0 }}
                transition={{ delay: index * 0.1 }}
                className={cn(
                  "flex items-center gap-3 p-3 rounded-xl transition-colors",
                  isCompleted && "bg-neon-green/10",
                  isCurrent && "bg-neon-cyan/10",
                  isPending && "opacity-40"
                )}
              >
                <div
                  className={cn(
                    "w-8 h-8 rounded-lg flex items-center justify-center flex-shrink-0",
                    isCompleted && "bg-neon-green/20",
                    isCurrent && "bg-neon-cyan/20",
                    isPending && "bg-space-700"
                  )}
                >
                  {isCompleted ? (
                    <Check className="w-4 h-4 text-neon-green" />
                  ) : isCurrent ? (
                    <Loader2 className="w-4 h-4 text-neon-cyan animate-spin" />
                  ) : (
                    <Icon className="w-4 h-4 text-star-faint" />
                  )}
                </div>
                <span
                  className={cn(
                    "text-sm",
                    isCompleted && "text-neon-green font-medium",
                    isCurrent && "text-neon-cyan font-medium",
                    isPending && "text-star-faint"
                  )}
                >
                  {isCompleted
                    ? step.label.replace("...", " ✓")
                    : step.label}
                </span>
              </motion.div>
            )
          })}
        </AnimatePresence>
      </div>
    </motion.div>
  )
}
