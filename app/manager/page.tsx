"use client"

import { useState, useEffect, useMemo } from "react"
import { motion } from "framer-motion"
import {
  Users,
  TrendingUp,
  AlertOctagon,
  Award,
  ArrowUpRight,
  Search,
  CheckCircle2,
  Clock,
  ShieldAlert,
  Globe
} from "lucide-react"
import { Sidebar } from "@/components/shared/Sidebar"
import { listCourses, loadState } from "@/lib/store"
import type { LearningModule, ModuleProgress } from "@/lib/types"

export default function ManagerDashboard() {
  const [courses, setCourses] = useState<LearningModule[]>([])
  const [progressMap, setProgressMap] = useState<Record<string, ModuleProgress>>({})
  const [loading, setLoading] = useState(true)

  useEffect(() => {
    const state = loadState()
    setCourses(state.modules)
    setProgressMap(state.progress)
    setLoading(false)
  }, [])

  // Compute real stats from store data
  const computedStats = useMemo(() => {
    const totalCourses = courses.length
    const completedCourses = Object.values(progressMap).filter((p) => p.completed).length
    const completionRate = totalCourses > 0
      ? Math.round((completedCourses / totalCourses) * 100)
      : 0

    // Count safety hazards across all modules
    const safetyAlerts = courses.reduce(
      (sum, c) => sum + (c.safetyHazards?.filter((h) => h.severity === "high").length || 0),
      0
    )

    // Count completed certifications (modules where completed === true)
    const certifications = completedCourses

    return { totalCourses, completionRate, safetyAlerts, certifications }
  }, [courses, progressMap])

  // Compute per-course stats
  function getCourseCompletion(course: LearningModule): number {
    const progress = progressMap[course.id]
    if (!progress) return 0
    const totalCards = course.cards.length
    if (totalCards === 0) return 0
    return Math.round((progress.completedCardIds.length / totalCards) * 100)
  }

  function getCourseQuizScore(course: LearningModule): number | null {
    const progress = progressMap[course.id]
    if (!progress) return null
    const results = Object.values(progress.quizResults)
    if (results.length === 0) return null
    const correct = results.filter(Boolean).length
    return Math.round((correct / results.length) * 100)
  }

  // Build recent certifications from actual completed modules
  const recentCertifications = useMemo(() => {
    return courses
      .filter((c) => progressMap[c.id]?.completed)
      .map((c) => ({
        name: "Operator",
        course: c.title,
        time: progressMap[c.id]?.completedAt
          ? formatTimeAgo(progressMap[c.id].completedAt!)
          : "recently",
      }))
  }, [courses, progressMap])

  // Build safety watchlist from actual hazard data
  const safetyWatchItems = useMemo(() => {
    const items: { title: string; description: string }[] = []
    courses.forEach((c) => {
      c.safetyHazards
        ?.filter((h) => h.severity === "high")
        .forEach((h) => {
          items.push({
            title: h.description,
            description: `Mitigation: ${h.mitigation}`,
          })
        })
    })
    return items
  }, [courses])

  const stats = [
    { label: "Training Modules", value: String(computedStats.totalCourses), change: computedStats.totalCourses > 0 ? `${computedStats.totalCourses} active` : "none", icon: Users, color: "text-cyan-400" },
    { label: "Completion Rate", value: `${computedStats.completionRate}%`, change: computedStats.completionRate > 0 ? "on track" : "0 completed", icon: TrendingUp, color: "text-green-400" },
    { label: "Safety Hazards", value: String(computedStats.safetyAlerts), change: computedStats.safetyAlerts > 0 ? "high severity" : "none flagged", icon: AlertOctagon, color: "text-rose-500" },
    { label: "Certifications", value: String(computedStats.certifications), change: computedStats.certifications > 0 ? "earned" : "none yet", icon: Award, color: "text-warm-amber" },
  ]

  return (
    <div className="flex min-h-screen">
      <Sidebar />
      <main className="flex-1 lg:pl-0">
        <div className="max-w-6xl mx-auto px-6 py-8 pt-16 lg:pt-8">
          {/* Header */}
          <div className="flex flex-col md:flex-row md:items-center justify-between gap-4 mb-8">
            <div>
              <h1 className="text-2xl font-bold text-star-white font-display uppercase tracking-tight italic">
                Manager Control Tower
              </h1>
              <p className="text-sm text-star-faint">Real-time oversight of factory floor competence and safety compliance.</p>
            </div>

            <div className="flex items-center gap-3">
              <div className="relative group">
                <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-star-faint group-focus-within:text-cyan-400 transition-colors" />
                <input
                  type="text"
                  placeholder="Search workers or skills..."
                  className="bg-space-800 border border-space-600 rounded-xl py-2 pl-9 pr-4 text-sm text-star-bright outline-none focus:border-cyan-400/50 transition-all w-64"
                />
              </div>
            </div>
          </div>

          {/* Stats Grid */}
          <div className="grid grid-cols-2 md:grid-cols-4 gap-4 mb-8">
            {stats.map((stat, i) => (
              <motion.div
                key={stat.label}
                initial={{ opacity: 0, y: 10 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ delay: i * 0.1 }}
                className="p-4 glass-card rounded-2xl relative overflow-hidden group"
              >
                <div className="absolute top-0 right-0 p-3 opacity-10 group-hover:opacity-20 transition-opacity">
                  <stat.icon className="w-12 h-12" />
                </div>
                <p className="text-[10px] font-bold text-star-faint uppercase tracking-wider mb-1">{stat.label}</p>
                <div className="flex items-baseline gap-2">
                  <p className="text-2xl font-black text-star-white">{stat.value}</p>
                  <span className="text-[10px] font-bold px-1.5 py-0.5 rounded bg-space-900/50 text-star-faint">
                    {stat.change}
                  </span>
                </div>
              </motion.div>
            ))}
          </div>

          <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
            {/* Main Course Progress Table */}
            <div className="lg:col-span-2 space-y-6">
              <div className="glass-card rounded-2xl overflow-hidden">
                <div className="px-6 py-4 border-b border-space-700/50 flex items-center justify-between">
                  <h3 className="font-bold text-star-bright">Training Module Performance</h3>
                  <button className="text-xs text-cyan-400 hover:underline flex items-center gap-1">
                    View All <ArrowUpRight className="w-3 h-3" />
                  </button>
                </div>
                <div className="overflow-x-auto">
                  <table className="w-full text-left">
                    <thead>
                      <tr className="bg-space-900/50 text-[10px] text-star-faint uppercase tracking-widest">
                        <th className="px-6 py-3 font-bold">Module Title</th>
                        <th className="px-6 py-3 font-bold">Cards</th>
                        <th className="px-6 py-3 font-bold">Completion</th>
                        <th className="px-6 py-3 font-bold">Quiz Score</th>
                      </tr>
                    </thead>
                    <tbody className="divide-y divide-space-700/30">
                      {courses.length === 0 && !loading && (
                        <tr>
                          <td colSpan={4} className="px-6 py-8 text-center text-sm text-star-faint">
                            No training modules yet. Seed demo data or upload a video to get started.
                          </td>
                        </tr>
                      )}
                      {courses.map((course) => {
                        const completion = getCourseCompletion(course)
                        const quizScore = getCourseQuizScore(course)
                        return (
                          <tr key={course.id} className="hover:bg-space-800/50 transition-colors group cursor-pointer">
                            <td className="px-6 py-4">
                              <p className="text-sm font-bold text-star-bright group-hover:text-cyan-400 transition-colors">{course.title}</p>
                              <p className="text-[10px] text-star-faint">{course.estimatedDuration} module</p>
                            </td>
                            <td className="px-6 py-4 text-sm text-star-dim">{course.cards.length}</td>
                            <td className="px-6 py-4">
                              <div className="flex items-center gap-2">
                                <div className="w-16 h-1.5 bg-space-900 rounded-full overflow-hidden">
                                  <div
                                    className={cn(
                                      "h-full rounded-full",
                                      completion === 100 ? "bg-green-400" : "bg-cyan-400"
                                    )}
                                    style={{ width: `${completion}%` }}
                                  />
                                </div>
                                <span className="text-xs font-mono text-star-dim">{completion}%</span>
                              </div>
                            </td>
                            <td className="px-6 py-4">
                              {quizScore !== null ? (
                                <span className={cn(
                                  "px-2 py-0.5 rounded-full text-[10px] font-bold",
                                  quizScore >= 80 ? "bg-green-400/10 text-green-400" :
                                  quizScore >= 50 ? "bg-yellow-400/10 text-yellow-400" :
                                  "bg-rose-400/10 text-rose-400"
                                )}>
                                  {quizScore}%
                                </span>
                              ) : (
                                <span className="text-[10px] text-star-faint">—</span>
                              )}
                            </td>
                          </tr>
                        )
                      })}
                    </tbody>
                  </table>
                </div>
              </div>

              {/* Critical Hazards Watchlist */}
              <div className="glass-card rounded-2xl p-6 border border-rose-500/20">
                <div className="flex items-center gap-2 mb-4">
                  <ShieldAlert className="w-5 h-5 text-rose-500" />
                  <h3 className="font-bold text-star-bright">Critical Safety Watchlist</h3>
                </div>
                <div className="space-y-4">
                  {safetyWatchItems.length === 0 ? (
                    <p className="text-sm text-star-faint">No high-severity hazards flagged in current modules.</p>
                  ) : (
                    safetyWatchItems.map((item, i) => (
                      <div key={i} className="flex items-start gap-4 p-3 rounded-xl bg-rose-500/5 border border-rose-500/10">
                        <div className="w-10 h-10 rounded-lg bg-rose-500/10 flex items-center justify-center flex-shrink-0 text-rose-500 font-bold">
                          !
                        </div>
                        <div>
                          <p className="text-sm font-bold text-star-bright">{item.title}</p>
                          <p className="text-xs text-star-faint">{item.description}</p>
                          <button className="mt-2 text-[10px] font-bold text-rose-500 uppercase tracking-wider hover:underline">Flag for Re-training</button>
                        </div>
                      </div>
                    ))
                  )}
                </div>
              </div>
            </div>

            {/* Recent Certifications Sidebar */}
            <div className="space-y-6">
              <div className="glass-card rounded-2xl p-6">
                <h3 className="font-bold text-star-bright mb-4 flex items-center gap-2">
                  <CheckCircle2 className="w-4 h-4 text-warm-amber" />
                  Recent Certifications
                </h3>
                <div className="space-y-4">
                  {recentCertifications.length === 0 ? (
                    <p className="text-sm text-star-faint">No certifications earned yet. Complete a module to earn your first.</p>
                  ) : (
                    recentCertifications.map((cert, i) => (
                      <div key={i} className="flex items-center gap-3 group cursor-pointer">
                        <div className="w-10 h-10 rounded-full bg-space-800 border border-space-700 flex items-center justify-center text-star-faint group-hover:border-warm-amber transition-all">
                          <Award className="w-5 h-5 group-hover:text-warm-amber transition-all" />
                        </div>
                        <div className="flex-1 min-w-0">
                          <p className="text-sm font-bold text-star-bright truncate">{cert.name}</p>
                          <p className="text-[10px] text-star-faint truncate">{cert.course}</p>
                        </div>
                        <div className="text-[10px] text-star-faint flex items-center gap-1">
                          <Clock className="w-3 h-3" />
                          {cert.time}
                        </div>
                      </div>
                    ))
                  )}
                </div>
                <button className="w-full mt-6 py-3 border border-space-700 rounded-xl text-xs font-bold text-star-faint hover:text-star-bright hover:bg-space-800 transition-all">
                  Audit All Records
                </button>
              </div>

              {/* System Integrity */}
              <div className="glass-card rounded-2xl p-6 bg-gradient-to-br from-cyan-500/5 to-transparent border-cyan-500/10">
                <div className="flex items-center gap-2 mb-2 text-cyan-400">
                  <Globe className="w-4 h-4" />
                  <p className="text-[10px] font-bold uppercase tracking-widest">System Integrity</p>
                </div>
                <p className="text-xs text-star-dim mb-4 leading-relaxed">All certifications are cryptographically hashed and synced to the secure enterprise ledger.</p>
                <div className="flex items-center gap-2">
                  <div className="w-2 h-2 rounded-full bg-green-400 animate-pulse" />
                  <span className="text-[10px] font-mono text-green-400 uppercase font-bold">Network Online</span>
                </div>
              </div>
            </div>
          </div>
        </div>
      </main>
    </div>
  )
}

function cn(...classes: (string | false | null | undefined)[]) {
  return classes.filter(Boolean).join(" ")
}

function formatTimeAgo(isoDate: string): string {
  const diff = Date.now() - new Date(isoDate).getTime()
  const minutes = Math.floor(diff / 60000)
  if (minutes < 1) return "just now"
  if (minutes < 60) return `${minutes}m ago`
  const hours = Math.floor(minutes / 60)
  if (hours < 24) return `${hours}h ago`
  const days = Math.floor(hours / 24)
  return `${days}d ago`
}
