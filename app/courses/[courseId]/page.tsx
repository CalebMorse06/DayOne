"use client"

import { useEffect, useState } from "react"
import { useParams, useRouter } from "next/navigation"
import { motion } from "framer-motion"
import {
  ArrowLeft,
  BookOpen,
  MessageCircle,
  Layers,
  Target,
  Shield,
  Eye,
  Clock,
  Zap as ZapIcon,
} from "lucide-react"
import { Sidebar } from "@/components/shared/Sidebar"
import { ProgressRing } from "@/components/shared/ProgressRing"
import { MasteryScore } from "@/components/analytics/MasteryScore"
import { DifficultyHeatmap } from "@/components/analytics/DifficultyHeatmap"
import { VelocityChart } from "@/components/analytics/VelocityChart"
import { AccuracyTrend } from "@/components/analytics/AccuracyTrend"
import { CommonlyMissedSection } from "@/components/analytics/CommonlyMissedSection"
import { CardAnalyticsRow } from "@/components/analytics/CardAnalyticsRow"
import { SOPGenerator } from "@/components/shared/SOPGenerator"
import { getCourseById, getCourseProgress, computeModuleAnalytics, computeCardAnalytics } from "@/lib/store"
import type { LearningModule, ModuleProgress, ModuleAnalytics } from "@/lib/types"

export default function CourseDetailPage() {
  const params = useParams()
  const router = useRouter()
  const courseId = params.courseId as string
  const [course, setCourse] = useState<LearningModule | null>(null)
  const [progress, setProgress] = useState<ModuleProgress | null>(null)
  const [analytics, setAnalytics] = useState<ModuleAnalytics | null>(null)

  useEffect(() => {
    const c = getCourseById(courseId)
    setCourse(c)
    if (c) {
      setProgress(getCourseProgress(c.id))
      setAnalytics(computeModuleAnalytics(c.id))
    }
  }, [courseId])

  if (!course) {
    return (
      <div className="flex min-h-screen">
        <Sidebar />
        <main className="flex-1 flex items-center justify-center">
          <div className="text-center">
            <p className="text-star-dim mb-4">Course not found</p>
            <button
              onClick={() => router.push("/courses")}
              className="text-warm-amber text-sm hover:underline"
            >
              Back to courses
            </button>
          </div>
        </main>
      </div>
    )
  }

  const progressPct = progress
    ? Math.round((progress.completedCardIds.length / Math.max(course.cards.length, 1)) * 100)
    : 0

  const totalTimeMs = analytics?.totalTimeMs || 0
  const formatTime = (ms: number) => {
    const min = Math.floor(ms / 60000)
    if (min < 1) return "<1m"
    if (min < 60) return `${min}m`
    const hr = Math.floor(min / 60)
    return `${hr}h ${min % 60}m`
  }

  const cardTitles: Record<string, string> = {}
  course.cards.forEach((c) => { cardTitles[c.id] = c.title })

  return (
    <div className="flex min-h-screen">
      <Sidebar />

      <main className="flex-1 min-h-screen lg:pl-0">
        <div className="max-w-3xl mx-auto px-6 py-8 pt-16 lg:pt-8">
          {/* Header */}
          <div className="flex items-center gap-3 mb-6">
            <button
              onClick={() => router.push("/courses")}
              className="p-2 rounded-lg hover:bg-space-700 transition-colors"
            >
              <ArrowLeft className="w-5 h-5 text-star-dim" />
            </button>
            <div className="flex-1 min-w-0">
              <h1 className="text-xl font-bold text-star-white truncate font-display">{course.title}</h1>
              <p className="text-xs text-star-faint">{course.estimatedDuration}</p>
            </div>
          </div>

          {/* Description */}
          <div className="p-4 glass-card rounded-xl mb-2">
            <p className="text-sm text-star-dim leading-relaxed">{course.description}</p>
          </div>

          <SOPGenerator module={course} />

          <div className="h-4" />

          {/* Mastery Score Gauge */}
          {analytics && (
            <motion.div
              initial={{ opacity: 0, y: 10 }}
              animate={{ opacity: 1, y: 0 }}
              className="p-6 glass-warm rounded-xl mb-6"
            >
              <MasteryScore
                score={analytics.masteryScore}
                quizAccuracy={analytics.quizAccuracy}
                avgConfidence={analytics.avgConfidence}
                completionPct={progressPct}
              />
            </motion.div>
          )}

          {/* Stats - 6 items */}
          <div className="grid grid-cols-3 md:grid-cols-6 gap-3 mb-6">
            <div className="p-3 glass-card rounded-xl text-center">
              <Layers className="w-4 h-4 text-retro-teal mx-auto mb-1" />
              <p className="text-lg font-bold font-mono text-star-white">{course.cards.length}</p>
              <p className="text-[10px] text-star-faint">Cards</p>
            </div>
            <div className="p-3 glass-card rounded-xl text-center">
              <Target className="w-4 h-4 text-neon-purple mx-auto mb-1" />
              <p className="text-lg font-bold font-mono text-star-white">{course.quizQuestions.length}</p>
              <p className="text-[10px] text-star-faint">Quizzes</p>
            </div>
            <div className="p-3 glass-card rounded-xl text-center">
              <Shield className="w-4 h-4 text-neon-magenta mx-auto mb-1" />
              <p className="text-lg font-bold font-mono text-star-white">{course.safetyHazards.length}</p>
              <p className="text-[10px] text-star-faint">Hazards</p>
            </div>
            <div className="p-3 glass-card rounded-xl text-center">
              <Eye className="w-4 h-4 text-neon-orange mx-auto mb-1" />
              <p className="text-lg font-bold font-mono text-star-white">{course.tacitCues.length}</p>
              <p className="text-[10px] text-star-faint">Insights</p>
            </div>
            <div className="p-3 glass-card rounded-xl text-center">
              <Clock className="w-4 h-4 text-warm-amber mx-auto mb-1" />
              <p className="text-lg font-bold font-mono text-star-white">{formatTime(totalTimeMs)}</p>
              <p className="text-[10px] text-star-faint">Time Spent</p>
            </div>
            <div className="p-3 glass-card rounded-xl text-center">
              <ZapIcon className="w-4 h-4 text-warm-amber mx-auto mb-1" />
              <p className="text-lg font-bold font-mono text-star-white">{analytics?.quizAccuracy ?? 0}%</p>
              <p className="text-[10px] text-star-faint">Accuracy</p>
            </div>
          </div>

          {/* Analytics Charts */}
          {analytics && (
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4 mb-6">
              {/* Difficulty Heatmap */}
              <div className="p-4 glass-card rounded-xl">
                <DifficultyHeatmap data={analytics.difficultyHeatmap} cardTitles={cardTitles} />
              </div>

              {/* Velocity Chart */}
              <div className="p-4 glass-card rounded-xl">
                {analytics.learningVelocity.length >= 2 ? (
                  <VelocityChart data={analytics.learningVelocity} />
                ) : (
                  <div className="text-center py-4">
                    <p className="text-xs text-star-faint">Start learning to see velocity data</p>
                  </div>
                )}
              </div>

              {/* Accuracy Trend */}
              <div className="p-4 glass-card rounded-xl">
                {analytics.accuracyTrend.length >= 2 ? (
                  <AccuracyTrend data={analytics.accuracyTrend} />
                ) : (
                  <div className="text-center py-4">
                    <p className="text-xs text-star-faint">Answer quizzes to see accuracy trends</p>
                  </div>
                )}
              </div>

              {/* Commonly Missed */}
              <div className="p-4 glass-card rounded-xl">
                {analytics.commonlyMissedPitfalls.length > 0 ? (
                  <CommonlyMissedSection pitfalls={analytics.commonlyMissedPitfalls} cardTitles={cardTitles} />
                ) : (
                  <div className="text-center py-4">
                    <p className="text-xs text-star-faint">No missed pitfalls yet — keep learning!</p>
                  </div>
                )}
              </div>
            </div>
          )}

          {/* Per-Card Analytics */}
          <div className="p-4 glass-card rounded-xl mb-6">
            <h3 className="text-sm font-semibold text-star-white mb-3">Card Analytics</h3>
            <div className="space-y-1">
              {course.cards.map((card) => {
                const cardAnalytics = computeCardAnalytics(course.id, card.id)
                return (
                  <CardAnalyticsRow
                    key={card.id}
                    cardId={card.id}
                    title={card.title}
                    type={card.type}
                    analytics={cardAnalytics}
                  />
                )
              })}
            </div>
          </div>

          {/* Progress */}
          <div className="p-4 glass-warm rounded-xl mb-6">
            <div className="flex items-center justify-between mb-2">
              <span className="text-sm text-star-dim">Progress</span>
              <span className="text-sm font-mono text-warm-amber">{progress?.xp ?? 0} XP</span>
            </div>
            <div className="h-2 bg-space-600 rounded-full overflow-hidden">
              <div
                className="h-full bg-gradient-to-r from-warm-amber to-warm-copper rounded-full transition-all"
                style={{ width: `${progressPct}%` }}
              />
            </div>
            <p className="text-xs text-star-faint mt-1">{progressPct}% complete</p>
          </div>

          {/* Actions */}
          <div className="grid grid-cols-1 md:grid-cols-3 gap-3">
            <motion.button
              initial={{ opacity: 0, y: 10 }}
              animate={{ opacity: 1, y: 0 }}
              onClick={() => router.push(`/courses/${course.id}/learn`)}
              className="flex items-center gap-3 p-4 bg-warm-amber hover:bg-warm-amber/90 text-space-900 rounded-xl transition-colors"
            >
              <BookOpen className="w-5 h-5" />
              <div className="text-left">
                <p className="font-semibold">{progressPct > 0 ? "Continue Learning" : "Start Learning"}</p>
                <p className="text-xs opacity-80">Swipe through cards & earn XP</p>
              </div>
            </motion.button>

            <motion.button
              initial={{ opacity: 0, y: 10 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: 0.05 }}
              onClick={() => router.push(`/courses/${course.id}/learn?quick=true`)}
              className="flex items-center gap-3 p-4 glass-card hover:border-warm-amber/30 text-star-white rounded-xl transition-all"
            >
              <ZapIcon className="w-5 h-5 text-warm-amber" />
              <div className="text-left">
                <p className="font-semibold">Quick Preview</p>
                <p className="text-xs text-star-faint">60-second highlights</p>
              </div>
            </motion.button>

            <motion.button
              initial={{ opacity: 0, y: 10 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: 0.1 }}
              onClick={() => router.push(`/courses/${course.id}/ask`)}
              className="flex items-center gap-3 p-4 glass-card hover:border-retro-teal/30 text-star-white rounded-xl transition-all"
            >
              <MessageCircle className="w-5 h-5 text-retro-teal" />
              <div className="text-left">
                <p className="font-semibold">Ask the Expert</p>
                <p className="text-xs text-star-faint">Get AI answers with citations</p>
              </div>
            </motion.button>
          </div>
        </div>
      </main>
    </div>
  )
}
