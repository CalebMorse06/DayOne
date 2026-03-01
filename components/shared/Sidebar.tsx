"use client"

import { useState, useEffect } from "react"
import { usePathname } from "next/navigation"
import Link from "next/link"
import {
  LayoutDashboard,
  BookOpen,
  PlusCircle,
  Zap,
  Menu,
  X,
  Rocket,
  Award,
} from "lucide-react"
import { cn } from "@/lib/utils"
import { loadState } from "@/lib/store"

const navItems = [
  { icon: LayoutDashboard, label: "Dashboard", href: "/" },
  { icon: BookOpen, label: "My Courses", href: "/courses" },
  { icon: PlusCircle, label: "Course Builder", href: "/courses/builder" },
  { icon: Award, label: "Manager Mode", href: "/manager" },
]

export function Sidebar() {
  const pathname = usePathname()
  const [expanded, setExpanded] = useState(false)
  const [mobileOpen, setMobileOpen] = useState(false)
  const [totalXp, setTotalXp] = useState(0)

  useEffect(() => {
    const state = loadState()
    setTotalXp(state.totalXp)
  }, [pathname])

  // Close mobile nav on route change
  useEffect(() => {
    setMobileOpen(false)
  }, [pathname])

  const isActive = (href: string) => {
    if (href === "/") return pathname === "/"
    // Exact match for /courses, prefix match for /courses/builder
    if (href === "/courses") return pathname === "/courses"
    return pathname.startsWith(href)
  }

  const sidebarContent = (
    <div className="flex flex-col h-full">
      {/* Logo — links to welcome/landing page */}
      <Link href="/welcome" className="flex items-center gap-3 px-4 py-5 border-b border-space-600 hover:bg-space-700/50 transition-colors">
        <div className="w-9 h-9 rounded-lg bg-neon-purple/20 flex items-center justify-center flex-shrink-0">
          <Rocket className="w-5 h-5 text-neon-purple" />
        </div>
        <span
          className={cn(
            "text-lg font-bold text-star-white whitespace-nowrap transition-opacity duration-200 font-display",
            !expanded && "lg:opacity-0 lg:w-0 lg:overflow-hidden"
          )}
        >
          DayOne
        </span>
      </Link>

      {/* Nav items */}
      <nav className="flex-1 py-4 space-y-1 px-2">
        {navItems.map((item) => {
          const Icon = item.icon
          const active = isActive(item.href)
          return (
            <Link
              key={item.href}
              href={item.href}
              className={cn(
                "w-full flex items-center gap-3 px-3 py-2.5 rounded-lg transition-all group relative",
                active
                  ? "bg-neon-purple/10 text-neon-purple"
                  : "text-star-dim hover:text-star-white hover:bg-space-700"
              )}
            >
              {active && (
                <div className="absolute left-0 top-1/2 -translate-y-1/2 w-0.5 h-6 bg-neon-purple rounded-r" />
              )}
              <Icon className={cn("w-5 h-5 flex-shrink-0", active && "text-neon-purple")} />
              <span
                className={cn(
                  "text-sm font-medium whitespace-nowrap transition-opacity duration-200",
                  !expanded && "lg:opacity-0 lg:w-0 lg:overflow-hidden"
                )}
              >
                {item.label}
              </span>
            </Link>
          )
        })}
      </nav>

      {/* XP display */}
      <div className="px-4 py-4 border-t border-space-600">
        <div className="flex items-center gap-2">
          <Zap className="w-4 h-4 text-neon-orange flex-shrink-0" />
          <span
            className={cn(
              "font-mono text-sm font-bold text-neon-orange whitespace-nowrap transition-opacity duration-200",
              !expanded && "lg:opacity-0 lg:w-0 lg:overflow-hidden"
            )}
          >
            {totalXp} XP
          </span>
        </div>
      </div>
    </div>
  )

  return (
    <>
      {/* Mobile hamburger */}
      <button
        onClick={() => setMobileOpen(true)}
        aria-label="Open navigation menu"
        className="lg:hidden fixed top-4 left-4 z-50 p-2 rounded-lg bg-space-800 border border-space-600 text-star-white"
      >
        <Menu className="w-5 h-5" />
      </button>

      {/* Mobile overlay */}
      {mobileOpen && (
        <div
          className="lg:hidden fixed inset-0 bg-black/60 z-50"
          onClick={() => setMobileOpen(false)}
        >
          <div
            className="w-60 h-full bg-space-800 border-r border-space-600"
            onClick={(e) => e.stopPropagation()}
          >
            <button
              onClick={() => setMobileOpen(false)}
              aria-label="Close navigation menu"
              className="absolute top-4 right-4 p-1 text-star-dim hover:text-star-white"
            >
              <X className="w-5 h-5" />
            </button>
            {sidebarContent}
          </div>
        </div>
      )}

      {/* Desktop sidebar */}
      <aside
        onMouseEnter={() => setExpanded(true)}
        onMouseLeave={() => setExpanded(false)}
        className={cn(
          "hidden lg:flex flex-col fixed left-0 top-0 h-screen bg-space-800 border-r border-space-600 z-40 transition-all duration-200",
          expanded ? "w-60" : "w-16"
        )}
      >
        {sidebarContent}
      </aside>

      {/* Spacer for desktop content offset */}
      <div className="hidden lg:block w-16 flex-shrink-0" />
    </>
  )
}
