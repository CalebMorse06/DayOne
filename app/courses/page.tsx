"use client"

import { useEffect, useState } from "react"
import { useRouter } from "next/navigation"
import { motion } from "framer-motion"
import { BookOpen, PlusCircle, Zap, Layers, ChevronRight, Trash2, RotateCcw } from "lucide-react"
import { Sidebar } from "@/components/shared/Sidebar"
import { listCourses, loadState, deleteCourse, resetAllData } from "@/lib/store"
import type { LearningModule, ModuleProgress } from "@/lib/types"

export default function CoursesPage() {
  const router = useRouter()
  const [courses, setCourses] = useState<LearningModule[]>([])
  const [progress, setProgress] = useState<Record<string, ModuleProgress>>({})

  const refreshCourses = () => {
    setCourses(listCourses())
    setProgress(loadState().progress)
  }

  useEffect(() => {
    refreshCourses()
  }, [])

  const handleDelete = (e: React.MouseEvent, courseId: string) => {
    e.stopPropagation()
    deleteCourse(courseId)
    refreshCourses()
  }

  const handleResetAll = () => {
    resetAllData()
    refreshCourses()
  }

  return (
    <div className="flex min-h-screen">
      <Sidebar />

      <main className="flex-1 min-h-screen lg:pl-0">
        <div className="max-w-5xl mx-auto px-6 py-8 pt-16 lg:pt-8">
          {/* Header */}
          <div className="flex items-center justify-between mb-8">
            <div>
              <h1 className="text-2xl font-bold text-star-white font-display">My Courses</h1>
              <p className="text-star-dim text-sm mt-1">
                {courses.length} course{courses.length !== 1 ? "s" : ""} in your library
              </p>
            </div>
            <div className="flex items-center gap-2">
              {courses.length > 0 && (
                <button
                  onClick={handleResetAll}
                  className="flex items-center gap-2 px-3 py-2.5 bg-space-700 border border-space-600 hover:border-neon-magenta/40 text-star-faint hover:text-neon-magenta text-sm font-medium rounded-lg transition-colors"
                >
                  <RotateCcw className="w-4 h-4" />
                  Reset All
                </button>
              )}
              <button
                onClick={() => router.push("/courses/builder")}
                className="flex items-center gap-2 px-4 py-2.5 bg-neon-purple hover:bg-neon-purple/90 text-white text-sm font-medium rounded-lg transition-colors"
              >
                <PlusCircle className="w-4 h-4" />
                New Course
              </button>
            </div>
          </div>

          {/* Course grid */}
          {courses.length === 0 ? (
            <div className="p-12 glass-card rounded-xl text-center">
              <div className="w-16 h-16 rounded-2xl bg-neon-purple/10 flex items-center justify-center mx-auto mb-4">
                <BookOpen className="w-8 h-8 text-neon-purple/60" />
              </div>
              <h2 className="text-lg font-semibold text-star-white mb-2 font-display">No courses yet</h2>
              <p className="text-star-dim text-sm mb-6">
                Upload a training video to create your first course
              </p>
              <button
                onClick={() => router.push("/courses/builder")}
                className="inline-flex items-center gap-2 px-6 py-3 bg-neon-purple hover:bg-neon-purple/90 text-white font-medium rounded-lg transition-colors"
              >
                <PlusCircle className="w-4 h-4" />
                Create Course
              </button>
            </div>
          ) : (
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
              {courses.map((course, index) => {
                const prog = progress[course.id]
                const progressPct = prog
                  ? Math.round(
                      (prog.completedCardIds.length /
                        Math.max(course.cards.length, 1)) *
                        100
                    )
                  : 0

                return (
                  <motion.button
                    key={course.id}
                    initial={{ opacity: 0, y: 10 }}
                    animate={{ opacity: 1, y: 0 }}
                    transition={{ delay: index * 0.05 }}
                    onClick={() => router.push(`/courses/${course.id}`)}
                    className="p-5 glass-card rounded-xl hover:border-warm-amber/30 transition-all text-left group"
                  >
                    <div className="flex items-start justify-between mb-3">
                      <div className="w-10 h-10 rounded-lg bg-neon-cyan/10 flex items-center justify-center">
                        <BookOpen className="w-5 h-5 text-neon-cyan" />
                      </div>
                      <div className="flex items-center gap-2">
                        {prog?.completed && (
                          <span className="text-[10px] font-bold px-2 py-0.5 bg-neon-green/10 text-neon-green rounded-full">
                            Complete
                          </span>
                        )}
                        <button
                          onClick={(e) => handleDelete(e, course.id)}
                          className="p-1.5 rounded-lg opacity-0 group-hover:opacity-100 hover:bg-neon-magenta/10 text-star-faint hover:text-neon-magenta transition-all"
                          title="Delete course"
                        >
                          <Trash2 className="w-3.5 h-3.5" />
                        </button>
                      </div>
                    </div>

                    <h3 className="font-semibold text-star-white mb-1 truncate font-display">
                      {course.title}
                    </h3>
                    <p className="text-xs text-star-faint mb-3 line-clamp-2">
                      {course.description}
                    </p>

                    <div className="flex items-center gap-3 text-xs text-star-faint mb-3">
                      <span className="flex items-center gap-1">
                        <Layers className="w-3 h-3" />
                        {course.cards.length} cards
                      </span>
                      {prog && prog.xp > 0 && (
                        <span className="flex items-center gap-1 text-neon-orange">
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

                    <div className="flex items-center justify-between mt-2">
                      <span className="text-[10px] text-star-faint">{progressPct}% complete</span>
                      <ChevronRight className="w-3 h-3 text-star-faint group-hover:text-neon-purple transition-colors" />
                    </div>
                  </motion.button>
                )
              })}
            </div>
          )}
        </div>
      </main>
    </div>
  )
}
