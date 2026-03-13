"use client"

import { useState, useCallback, useEffect, useRef } from "react"
import { useRouter } from "next/navigation"
import { motion } from "framer-motion"
import { ArrowLeft, Sparkles, Loader2 } from "lucide-react"
import { VideoUploader } from "@/components/capture/VideoUploader"
import { AnalysisProgress } from "@/components/capture/AnalysisProgress"
import { ModulePreview } from "@/components/capture/ModulePreview"
import { Sidebar } from "@/components/shared/Sidebar"
import type { LearningModule } from "@/lib/types"
import { addModule } from "@/lib/store"
import { extractFramesForCards, extractFramesForVideoCards } from "@/lib/video-frames"
import { storeVideoFile } from "@/lib/video-store"

type BuilderState = "upload" | "analyzing" | "preview"

export default function CourseBuilderPage() {
  const router = useRouter()
  const [state, setState] = useState<BuilderState>("upload")
  const [module, setModule] = useState<LearningModule | null>(null)
  const [isFallback, setIsFallback] = useState(false)
  const [selectedFile, setSelectedFile] = useState<File | null>(null)
  const [animationDone, setAnimationDone] = useState(false)
  const moduleRef = useRef<LearningModule | null>(null)

  const handleFileSelected = useCallback((file: File) => {
    setSelectedFile(file)
  }, [])

  const handleAnalyze = useCallback(async () => {
    if (!selectedFile) return

    setState("analyzing")
    setAnimationDone(false)
    setModule(null)
    moduleRef.current = null

    try {
      const formData = new FormData()
      formData.append("video", selectedFile)

      const response = await fetch("/api/analyze", {
        method: "POST",
        body: formData,
      })

      const data = await response.json()

      if (!response.ok || !data.module) {
        throw new Error(data.error || "Analysis returned no module")
      }

      // Extract real video frames for each card
      const mod = data.module as LearningModule
      try {
        const frameMap = await extractFramesForCards(selectedFile, mod.cards || [])
        if (frameMap.size > 0) {
          mod.cards = mod.cards.map((card: LearningModule["cards"][0]) => {
            const frame = frameMap.get(card.id)
            if (frame && !card.imageUrl) {
              return { ...card, imageUrl: frame }
            }
            return card
          })
        }
      } catch (frameErr) {
        console.warn("Frame extraction failed (non-fatal):", frameErr)
      }

      // Extract frames for animated video cards
      try {
        const videoFrameMap = await extractFramesForVideoCards(selectedFile, mod.videoCards || [], mod.cards || [])
        if (videoFrameMap.size > 0) {
          mod.videoCards = (mod.videoCards || []).map(vc => {
            const frames = videoFrameMap.get(vc.id)
            return frames ? { ...vc, frames } : vc
          })
        }
      } catch (vcFrameErr) {
        console.warn("VideoCard frame extraction failed (non-fatal):", vcFrameErr)
      }

      moduleRef.current = mod
      setModule(mod)
      setIsFallback(data.fallback ?? false)
    } catch {
      const fallback = await import("@/demo_assets/sample_module.json")
      const mod = {
        ...(fallback.default as unknown as LearningModule),
        id: `mod_${Date.now()}`,
        sourceVideoName: selectedFile.name,
        createdAt: new Date().toISOString(),
      }
      moduleRef.current = mod
      setModule(mod)
      setIsFallback(true)
    }
  }, [selectedFile])

  useEffect(() => {
    if (animationDone && module) {
      setState("preview")
    }
  }, [animationDone, module])

  const handleAnimationComplete = useCallback(() => {
    setAnimationDone(true)
  }, [])

  const handleStartLearning = useCallback(() => {
    if (module) {
      addModule(module)
      // Store raw video file so the learn page can create a fresh blob URL
      if (selectedFile) {
        storeVideoFile(module.id, selectedFile)
      }
      router.push(`/courses/${module.id}/learn`)
    }
  }, [module, router, selectedFile])

  return (
    <div className="flex min-h-screen">
      <Sidebar />

      <main className="flex-1 min-h-screen lg:pl-0 min-w-0">
        <div className="max-w-2xl mx-auto px-4 md:px-6 py-8 pt-16 lg:pt-8">
          {/* Header */}
          <div className="flex items-center gap-3 mb-8">
            <button
              onClick={() => router.push("/courses")}
              className="p-2 rounded-lg hover:bg-space-700 transition-colors"
            >
              <ArrowLeft className="w-5 h-5 text-star-dim" />
            </button>
            <div>
              <h1 className="text-xl font-bold text-star-white font-display">Course Builder</h1>
              <p className="text-xs text-star-faint">Upload a training resource for AI analysis</p>
            </div>
          </div>

          {/* Content */}
          <div className="space-y-4">
            {state === "upload" && (
              <motion.div
                initial={{ opacity: 0, y: 10 }}
                animate={{ opacity: 1, y: 0 }}
                className="space-y-4"
              >
                <VideoUploader onFileSelected={handleFileSelected} />

                {selectedFile && (
                  <motion.button
                    initial={{ opacity: 0, y: 10 }}
                    animate={{ opacity: 1, y: 0 }}
                    onClick={handleAnalyze}
                    className="w-full flex items-center justify-center gap-2 p-4 bg-neon-purple hover:bg-neon-purple/90 text-white font-semibold rounded-xl transition-colors active:scale-[0.98]"
                  >
                    <Sparkles className="w-5 h-5" />
                    Analyze with Gemini AI
                  </motion.button>
                )}

                <div className="p-4 bg-space-800 border border-space-600 rounded-xl">
                  <p className="text-xs text-star-dim leading-relaxed">
                    <strong className="text-star-white">How it works:</strong> Our AI analyzes your
                    training resources — videos, PDFs, or audio recordings — and identifies expert
                    techniques, tools, safety hazards, and tacit knowledge that experienced workers
                    use instinctively but never write down. It then generates a complete
                    micro-learning course with interactive challenges and quizzes.
                  </p>
                </div>
              </motion.div>
            )}

            {state === "analyzing" && (
              <>
                <AnalysisProgress
                  isAnalyzing={true}
                  onSimulationComplete={handleAnimationComplete}
                />
                {animationDone && !module && (
                  <motion.div
                    initial={{ opacity: 0, y: 10 }}
                    animate={{ opacity: 1, y: 0 }}
                    className="flex items-center gap-3 p-4 bg-neon-purple/10 border border-neon-purple/20 rounded-xl"
                  >
                    <Loader2 className="w-5 h-5 text-neon-purple animate-spin flex-shrink-0" />
                    <div>
                      <p className="text-sm font-medium text-neon-purple">
                        AI is finalizing your course...
                      </p>
                      <p className="text-xs text-star-faint mt-0.5">
                        Longer videos take more time to analyze
                      </p>
                    </div>
                  </motion.div>
                )}
              </>
            )}

            {state === "preview" && module && (
              <ModulePreview
                module={module}
                fallback={isFallback}
                onStartLearning={handleStartLearning}
              />
            )}
          </div>
        </div>
      </main>
    </div>
  )
}
