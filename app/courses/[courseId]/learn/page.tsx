"use client"

import { useState, useEffect, Suspense } from "react"
import { useParams, useRouter, useSearchParams } from "next/navigation"
import { ArrowLeft, BookOpen, Video } from "lucide-react"
import { CardStack } from "@/components/learn/CardStack"
import { Sidebar } from "@/components/shared/Sidebar"
import type { LearningModule } from "@/lib/types"
import { getCourseById, loadState, addModule } from "@/lib/store"
import { getVideoObjectUrl, resolveVideoUrl } from "@/lib/video-store"

function LearnContent() {
  const params = useParams()
  const router = useRouter()
  const searchParams = useSearchParams()
  const courseId = params.courseId as string
  const quickLearn = searchParams.get("quick") === "true"
  const [module, setModule] = useState<LearningModule | null>(null)
  const [loading, setLoading] = useState(true)
  const [videoObjectUrl, setVideoObjectUrl] = useState<string | null>(null)

  useEffect(() => {
    const course = getCourseById(courseId)
    if (course) {
      setModule(course)
    } else {
      // Fallback to demo module
      const state = loadState()
      if (state.demoMode || state.modules.length === 0) {
        import("@/demo_assets/sample_module.json").then((data) => {
          const mod = data.default as unknown as LearningModule
          addModule(mod)
          setModule(mod)
        })
      }
    }
    // Try in-memory cache first (instant), then hydrate from IndexedDB
    const url = getVideoObjectUrl(courseId) || getVideoObjectUrl("")
    if (url) {
      setVideoObjectUrl(url)
    } else {
      resolveVideoUrl(courseId).then((resolved) => {
        if (resolved) setVideoObjectUrl(resolved)
      })
    }
    setLoading(false)
  }, [courseId])

  const handleComplete = () => {
    router.push(`/courses/${courseId}/ask`)
  }

  if (loading) {
    return (
      <div className="flex items-center justify-center min-h-screen">
        <div className="w-8 h-8 border-4 border-neon-purple/20 border-t-neon-purple rounded-full animate-spin" />
      </div>
    )
  }

  if (!module) {
    return (
      <div className="flex min-h-screen">
        <Sidebar />
        <main className="flex-1 flex flex-col items-center justify-center px-6 text-center">
          <div className="w-16 h-16 rounded-2xl bg-neon-purple/10 flex items-center justify-center mb-4">
            <BookOpen className="w-8 h-8 text-neon-purple/60" />
          </div>
          <h2 className="font-semibold text-star-white mb-2">No Module Found</h2>
          <p className="text-sm text-star-dim mb-6">
            Upload a training video first to generate your learning module
          </p>
          <button
            onClick={() => router.push("/courses/builder")}
            className="flex items-center gap-2 px-6 py-3 bg-neon-purple text-white rounded-xl font-medium active:scale-95 transition-transform"
          >
            <Video className="w-4 h-4" />
            Build a Course
          </button>
        </main>
      </div>
    )
  }

  return (
    <div className="flex min-h-screen">
      <Sidebar />

      <main className="flex-1 flex flex-col h-screen lg:pl-0">
        {/* Header */}
        <div className="flex items-center gap-3 px-6 pt-16 lg:pt-6 pb-2">
          <button
            onClick={() => router.push(`/courses/${courseId}`)}
            className="p-2 rounded-lg hover:bg-space-700 transition-colors"
          >
            <ArrowLeft className="w-5 h-5 text-star-dim" />
          </button>
          <div className="flex-1 min-w-0">
            <h1 className="text-lg font-bold text-star-white truncate font-display">
              {quickLearn ? `${module.title} — Quick Preview` : module.title}
            </h1>
            <p className="text-xs text-star-faint">
              {quickLearn ? "60-second highlights · 5 items" : `${module.estimatedDuration} · ${module.cards.length} cards`}
            </p>
          </div>
        </div>

        {/* Card stack - centered with max width */}
        <div className="flex-1 overflow-y-auto flex justify-center">
          <div className="w-full max-w-xl">
            <CardStack module={module} onComplete={handleComplete} quickLearn={quickLearn} videoObjectUrl={videoObjectUrl} />
          </div>
        </div>
      </main>
    </div>
  )
}

export default function LearnPage() {
  return (
    <Suspense
      fallback={
        <div className="flex items-center justify-center min-h-screen">
          <div className="w-8 h-8 border-4 border-neon-purple/20 border-t-neon-purple rounded-full animate-spin" />
        </div>
      }
    >
      <LearnContent />
    </Suspense>
  )
}
