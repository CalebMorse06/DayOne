"use client"

import { useEffect, useState } from "react"
import { useRouter } from "next/navigation"
import { motion } from "framer-motion"
import {
  Zap,
  BookOpen,
  Layers,
  Target,
  ChevronRight,
  Rocket,
  PlusCircle,
  Clock,
  TrendingUp,
  Upload,
  Play,
  Trash2,
  AlertTriangle,
  Gamepad2,
  Brain,
  Eye,
} from "lucide-react"
import { Sidebar } from "@/components/shared/Sidebar"
import { ProgressRing } from "@/components/shared/ProgressRing"
import { HeroLanding } from "@/components/shared/HeroLanding"
import { loadState, listCourses, resetAllData } from "@/lib/store"
import { seedDemoData } from "@/lib/seed-demo"
import { DEMO_MODE_CHANGED } from "@/components/shared/DemoGuideProvider"
import type { LearningModule, ModuleProgress } from "@/lib/types"

export default function DashboardPage() {
  const router = useRouter()
  const [totalXp, setTotalXp] = useState(0)
  const [courses, setCourses] = useState<LearningModule[]>([])
  const [progress, setProgress] = useState<Record<string, ModuleProgress>>({})
  const [totalCards, setTotalCards] = useState(0)
  const [accuracy, setAccuracy] = useState(0)
  const [totalTimeMs, setTotalTimeMs] = useState(0)
  const [coursesCompleted, setCoursesCompleted] = useState(0)
  const [showHero, setShowHero] = useState(false)

  const refreshData = () => {
    const state = loadState()
    setTotalXp(state.totalXp)
    const allCourses = listCourses()
    setCourses(allCourses)
    setProgress(state.progress)
    setTotalCards(allCourses.reduce((sum, c) => sum + (c.cards?.length || 0), 0))

    const progressValues = Object.values(state.progress)
    let correct = 0
    let total = 0
    let timeTotal = 0
    let completed = 0
    progressValues.forEach((p) => {
      Object.values(p.quizResults).forEach((r) => {
        total++
        if (r) correct++
      })
      if (p.completed) completed++
      if (p.cardTimeSpent) {
        timeTotal += Object.values(p.cardTimeSpent).reduce((a, b) => a + b, 0)
      }
    })
    setAccuracy(total > 0 ? Math.round((correct / total) * 100) : 0)
    setTotalTimeMs(timeTotal)
    setCoursesCompleted(completed)

    setShowHero(allCourses.length === 0 && state.totalXp === 0)
  }

  useEffect(() => {
    refreshData()
  }, [])

  const handleTryDemo = () => {
    seedDemoData()
    window.dispatchEvent(new Event(DEMO_MODE_CHANGED))
    router.push("/courses/mod_demo_001")
  }

  const handleUploadVideo = () => {
    router.push("/courses/builder")
  }

  const handleResetAll = () => {
    resetAllData()
    refreshData()
  }

  if (showHero) {
    return <HeroLanding onTryDemo={handleTryDemo} onUploadVideo={handleUploadVideo} />
  }

  const formatTime = (ms: number) => {
    const min = Math.floor(ms / 60000)
    if (min < 60) return `${min}m`
    const hr = Math.floor(min / 60)
    return `${hr}h ${min % 60}m`
  }

  const totalQuizzes = courses.reduce((sum, c) => sum + (c.quizQuestions?.length || 0), 0)
  const totalChallenges = courses.reduce((sum, c) => {
    return sum +
      (c.sequenceChallenges?.length || 0) +
      (c.spotDetailChallenges?.length || 0) +
      (c.flashChallenges?.length || 0) +
      (c.simulationChallenges?.length || 0)
  }, 0)
  const totalInsights = courses.reduce((sum, c) => sum + (c.tacitCues?.length || 0), 0)

  return (
    <div className="flex min-h-screen">
      <Sidebar />

      <main className="flex-1 min-h-screen lg:pl-0">
        <div className="max-w-5xl mx-auto px-6 py-8 pt-16 lg:pt-8">
          {/* Header */}
          <motion.div
            initial={{ opacity: 0, y: -20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.5 }}
            className="flex items-start justify-between mb-8"
          >
            <div>
              <div className="flex items-center gap-3 mb-2">
                <div className="w-10 h-10 rounded-xl bg-warm-amber/20 flex items-center justify-center">
                  <Rocket className="w-6 h-6 text-warm-amber" />
                </div>
                <h1 className="text-2xl font-bold text-star-white font-display">Mission Control</h1>
              </div>
              <p className="text-star-dim text-sm mt-1">
                {courses.length === 0
                  ? "Upload a training video to capture veteran expertise"
                  : `${courses.length} course${courses.length !== 1 ? "s" : ""} · ${totalCards} cards generated from video`
                }
              </p>
            </div>
            <div className="flex items-center gap-2">
              {courses.length > 0 && (
                <button
                  onClick={handleResetAll}
                  className="flex items-center gap-1.5 px-3 py-2 bg-space-700 border border-space-600 hover:border-neon-magenta/40 text-star-faint hover:text-neon-magenta text-xs font-medium rounded-lg transition-colors"
                  title="Clear all data for a clean start"
                >
                  <Trash2 className="w-3.5 h-3.5" />
                  Reset
                </button>
              )}
              <button
                onClick={() => router.push("/courses/builder")}
                className="flex items-center gap-2 px-4 py-2 bg-warm-amber hover:bg-warm-amber/90 text-space-900 text-sm font-semibold rounded-lg transition-colors shadow-glow-warm"
              >
                <Upload className="w-4 h-4" />
                Upload Video
              </button>
            </div>
          </motion.div>

          {/* Stats row */}
          <motion.div
            initial={{ opacity: 0, y: 10 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.1, duration: 0.5 }}
            className="grid grid-cols-2 md:grid-cols-4 gap-3 mb-8"
          >
            {[
              { icon: Zap, label: "XP Earned", value: totalXp, color: "text-warm-amber", bg: "bg-warm-amber/10" },
              { icon: Layers, label: "Cards", value: totalCards, color: "text-neon-cyan", bg: "bg-neon-cyan/10" },
              { icon: Target, label: "Quiz Accuracy", value: `${accuracy}%`, color: "text-neon-green", bg: "bg-neon-green/10", ring: true },
              { icon: Clock, label: "Time Invested", value: formatTime(totalTimeMs), color: "text-neon-purple", bg: "bg-neon-purple/10" },
            ].map((stat) => {
              const Icon = stat.icon
              return (
                <div key={stat.label} className="p-4 glass-warm rounded-xl">
                  <div className="flex items-center gap-2 mb-2">
                    <div className={`w-8 h-8 rounded-lg ${stat.bg} flex items-center justify-center`}>
                      <Icon className={`w-4 h-4 ${stat.color}`} />
                    </div>
                    <p className="text-[10px] text-star-faint uppercase tracking-wider">{stat.label}</p>
                  </div>
                  {stat.ring ? (
                    <div className="flex items-center gap-2">
                      <ProgressRing value={accuracy} size={32} strokeWidth={3} color="green" />
                      <p className="text-xl font-bold font-mono text-star-white">{stat.value}</p>
                    </div>
                  ) : (
                    <p className="text-xl font-bold font-mono text-star-white">{stat.value}</p>
                  )}
                </div>
              )
            })}
          </motion.div>

          {/* Content generated summary */}
          {courses.length > 0 && (
            <motion.div
              initial={{ opacity: 0, y: 10 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: 0.15, duration: 0.5 }}
              className="mb-8 p-5 glass-card rounded-xl border-l-4 border-l-neon-purple"
            >
              <h2 className="text-sm font-semibold text-star-white mb-3 font-display">AI-Generated Content</h2>
              <div className="grid grid-cols-2 md:grid-cols-4 gap-3">
                <div className="flex items-center gap-2">
                  <Brain className="w-4 h-4 text-neon-cyan" />
                  <div>
                    <p className="text-sm font-bold font-mono text-star-white">{totalCards}</p>
                    <p className="text-[10px] text-star-faint">Micro-lessons</p>
                  </div>
                </div>
                <div className="flex items-center gap-2">
                  <Target className="w-4 h-4 text-neon-purple" />
                  <div>
                    <p className="text-sm font-bold font-mono text-star-white">{totalQuizzes}</p>
                    <p className="text-[10px] text-star-faint">Quiz questions</p>
                  </div>
                </div>
                <div className="flex items-center gap-2">
                  <Gamepad2 className="w-4 h-4 text-retro-teal" />
                  <div>
                    <p className="text-sm font-bold font-mono text-star-white">{totalChallenges}</p>
                    <p className="text-[10px] text-star-faint">Challenges</p>
                  </div>
                </div>
                <div className="flex items-center gap-2">
                  <Eye className="w-4 h-4 text-neon-orange" />
                  <div>
                    <p className="text-sm font-bold font-mono text-star-white">{totalInsights}</p>
                    <p className="text-[10px] text-star-faint">Expert insights</p>
                  </div>
                </div>
              </div>
            </motion.div>
          )}

          {/* Courses */}
          <motion.div
            initial={{ opacity: 0, y: 10 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.2, duration: 0.5 }}
          >
            <div className="flex items-center justify-between mb-4">
              <h2 className="text-lg font-semibold text-star-white font-display">Your Courses</h2>
              {courses.length > 0 && (
                <button
                  onClick={() => router.push("/courses")}
                  className="text-xs text-warm-amber hover:underline"
                >
                  View all
                </button>
              )}
            </div>

            {courses.length === 0 ? (
              <div className="p-10 glass-card rounded-xl text-center">
                <div className="w-16 h-16 rounded-2xl bg-warm-amber/10 flex items-center justify-center mx-auto mb-4">
                  <Upload className="w-8 h-8 text-warm-amber/60" />
                </div>
                <h3 className="text-lg font-semibold text-star-white mb-2 font-display">
                  No courses yet
                </h3>
                <p className="text-star-dim text-sm mb-6 max-w-md mx-auto">
                  Upload a training video and AI will extract procedures, safety hazards,
                  tacit knowledge, and create interactive micro-learning in seconds.
                </p>
                <div className="flex flex-col sm:flex-row items-center justify-center gap-3">
                  <button
                    onClick={() => router.push("/courses/builder")}
                    className="flex items-center gap-2 px-6 py-3 bg-warm-amber hover:bg-warm-amber/90 text-space-900 font-semibold rounded-xl transition-colors shadow-glow-warm"
                  >
                    <Upload className="w-5 h-5" />
                    Upload Video
                  </button>
                  <button
                    onClick={handleTryDemo}
                    className="flex items-center gap-2 px-6 py-3 glass-card hover:border-warm-amber/30 text-star-white font-semibold rounded-xl transition-all"
                  >
                    <Play className="w-5 h-5" />
                    Try Demo
                  </button>
                </div>
              </div>
            ) : (
              <div className="space-y-3">
                {courses.map((course, index) => {
                  const prog = progress[course.id]
                  const progressPct = prog
                    ? Math.round((prog.completedCardIds.length / Math.max(course.cards?.length || 1, 1)) * 100)
                    : 0
                  const hazardCount = course.safetyHazards?.length || 0
                  const cardCount = course.cards?.length || 0
                  const quizCount = course.quizQuestions?.length || 0

                  return (
                    <motion.button
                      key={course.id}
                      initial={{ opacity: 0, y: 12 }}
                      animate={{ opacity: 1, y: 0 }}
                      transition={{ delay: 0.25 + index * 0.05, ease: [0.25, 0.46, 0.45, 0.94] }}
                      onClick={() => router.push(`/courses/${course.id}`)}
                      className="w-full p-5 glass-card rounded-xl hover:border-warm-amber/30 transition-all text-left group"
                    >
                      <div className="flex items-start gap-4">
                        <div className="w-12 h-12 rounded-xl bg-neon-cyan/10 flex items-center justify-center flex-shrink-0">
                          <BookOpen className="w-6 h-6 text-neon-cyan" />
                        </div>
                        <div className="flex-1 min-w-0">
                          <div className="flex items-start justify-between mb-1">
                            <h3 className="text-base font-semibold text-star-white truncate font-display pr-2">
                              {course.title}
                            </h3>
                            <div className="flex items-center gap-2 flex-shrink-0">
                              {prog?.completed && (
                                <span className="text-[10px] font-bold px-2 py-0.5 bg-neon-green/10 text-neon-green rounded-full">
                                  Complete
                                </span>
                              )}
                              <ChevronRight className="w-4 h-4 text-star-faint group-hover:text-warm-amber transition-colors" />
                            </div>
                          </div>

                          <p className="text-xs text-star-faint mb-3 line-clamp-1">
                            {course.description}
                          </p>

                          {/* Inline stats */}
                          <div className="flex items-center gap-4 text-[10px] text-star-faint mb-3">
                            <span className="flex items-center gap-1">
                              <Layers className="w-3 h-3 text-neon-cyan" />
                              {cardCount} cards
                            </span>
                            <span className="flex items-center gap-1">
                              <Target className="w-3 h-3 text-neon-purple" />
                              {quizCount} quizzes
                            </span>
                            {hazardCount > 0 && (
                              <span className="flex items-center gap-1 text-neon-magenta">
                                <AlertTriangle className="w-3 h-3" />
                                {hazardCount} hazards
                              </span>
                            )}
                            {prog && prog.xp > 0 && (
                              <span className="flex items-center gap-1 text-warm-amber">
                                <Zap className="w-3 h-3" />
                                {prog.xp} XP
                              </span>
                            )}
                          </div>

                          {/* Progress bar */}
                          <div className="h-1.5 bg-space-600 rounded-full overflow-hidden">
                            <div
                              className="h-full bg-gradient-to-r from-warm-amber via-warm-gold to-warm-copper rounded-full transition-all"
                              style={{ width: `${progressPct}%` }}
                            />
                          </div>
                          <p className="text-[10px] text-star-faint mt-1">{progressPct}% complete</p>
                        </div>
                      </div>
                    </motion.button>
                  )
                })}

                {/* Add another course CTA */}
                <motion.button
                  initial={{ opacity: 0, y: 12 }}
                  animate={{ opacity: 1, y: 0 }}
                  transition={{ delay: 0.3 + courses.length * 0.05 }}
                  onClick={() => router.push("/courses/builder")}
                  className="w-full p-4 border-2 border-dashed border-space-600 hover:border-warm-amber/30 rounded-xl transition-all text-center group"
                >
                  <div className="flex items-center justify-center gap-2 text-star-faint group-hover:text-warm-amber transition-colors">
                    <PlusCircle className="w-5 h-5" />
                    <span className="text-sm font-medium">Upload another video</span>
                  </div>
                </motion.button>
              </div>
            )}
          </motion.div>
        </div>
      </main>
    </div>
  )
}
