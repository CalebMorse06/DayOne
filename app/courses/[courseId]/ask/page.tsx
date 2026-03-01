"use client"

import { useState, useEffect } from "react"
import { useParams, useRouter } from "next/navigation"
import { ArrowLeft } from "lucide-react"
import { ChatInterface } from "@/components/ask/ChatInterface"
import { Sidebar } from "@/components/shared/Sidebar"
import type { LearningModule } from "@/lib/types"
import { getCourseById, loadState, addModule } from "@/lib/store"
import { getVideoObjectUrl, resolveVideoUrl } from "@/lib/video-store"

export default function AskPage() {
  const params = useParams()
  const router = useRouter()
  const courseId = params.courseId as string
  const [module, setModule] = useState<LearningModule | null>(null)
  const [loading, setLoading] = useState(true)
  const [videoUrl, setVideoUrl] = useState<string | null>(null)

  useEffect(() => {
    const course = getCourseById(courseId)
    const url = getVideoObjectUrl(courseId) || getVideoObjectUrl("")
    if (url) {
      setVideoUrl(url)
    } else {
      resolveVideoUrl(courseId).then((resolved) => {
        if (resolved) setVideoUrl(resolved)
      })
    }

    if (course) {
      setModule(course)
      setLoading(false)
    } else {
      const state = loadState()
      if (state.demoMode || state.modules.length === 0) {
        import("@/demo_assets/sample_module.json").then((data) => {
          const mod = data.default as unknown as LearningModule
          addModule(mod)
          setModule(mod)
          setLoading(false)
        })
      } else {
        setLoading(false)
      }
    }
  }, [courseId])

  if (loading) {
    return (
      <div className="flex items-center justify-center min-h-screen">
        <div className="w-8 h-8 border-4 border-neon-purple/20 border-t-neon-purple rounded-full animate-spin" />
      </div>
    )
  }

  return (
    <div className="flex min-h-screen">
      <Sidebar />

      <main className="flex-1 flex flex-col h-screen lg:pl-0">
        {/* Header */}
        <div className="flex items-center gap-3 px-6 pt-16 lg:pt-6 pb-3 border-b border-space-600">
          <button
            onClick={() => router.push(`/courses/${courseId}`)}
            className="p-2 rounded-lg hover:bg-space-700 transition-colors"
          >
            <ArrowLeft className="w-5 h-5 text-star-dim" />
          </button>
          <div>
            <h1 className="text-lg font-bold text-star-white">Ask the Expert</h1>
            <p className="text-xs text-star-faint">
              {module ? module.title : "AI-powered mentor"}
            </p>
          </div>
        </div>

        {/* Chat - centered with max width */}
        <div className="flex-1 overflow-hidden flex justify-center">
          <div className="w-full max-w-2xl">
            <ChatInterface module={module} videoUrl={videoUrl} />
          </div>
        </div>
      </main>
    </div>
  )
}
