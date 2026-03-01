"use client"

import { motion } from "framer-motion"
import { cn } from "@/lib/utils"

interface ProgressRingProps {
  value: number // 0-100
  size?: number
  strokeWidth?: number
  className?: string
  label?: string
  color?: "amber" | "green" | "cyan" | "purple" | "magenta"
}

const COLOR_MAP = {
  amber: { start: "#f59e0b", end: "#d97706" },
  green: { start: "#34d399", end: "#059669" },
  cyan: { start: "#22d3ee", end: "#0891b2" },
  purple: { start: "#a855f7", end: "#7c3aed" },
  magenta: { start: "#ec4899", end: "#db2777" },
}

export function ProgressRing({
  value,
  size = 60,
  strokeWidth = 4,
  className,
  label,
  color = "amber",
}: ProgressRingProps) {
  const radius = (size - strokeWidth) / 2
  const circumference = 2 * Math.PI * radius
  const offset = circumference * (1 - Math.min(value, 100) / 100)
  const colors = COLOR_MAP[color]
  const gradientId = `ring-${color}-${size}`

  return (
    <div className={cn("relative inline-flex items-center justify-center", className)}>
      <svg width={size} height={size} className="-rotate-90">
        {/* Background ring */}
        <circle
          cx={size / 2}
          cy={size / 2}
          r={radius}
          fill="none"
          stroke="currentColor"
          className="text-space-600"
          strokeWidth={strokeWidth}
        />
        {/* Progress ring */}
        <motion.circle
          cx={size / 2}
          cy={size / 2}
          r={radius}
          fill="none"
          stroke={`url(#${gradientId})`}
          strokeWidth={strokeWidth}
          strokeLinecap="round"
          strokeDasharray={circumference}
          initial={{ strokeDashoffset: circumference }}
          animate={{ strokeDashoffset: offset }}
          transition={{ duration: 1, ease: "easeOut" }}
        />
        <defs>
          <linearGradient id={gradientId} x1="0%" y1="0%" x2="100%" y2="0%">
            <stop offset="0%" stopColor={colors.start} />
            <stop offset="100%" stopColor={colors.end} />
          </linearGradient>
        </defs>
      </svg>
      {/* Center text */}
      <div className="absolute inset-0 flex flex-col items-center justify-center">
        <span className="text-xs font-bold font-mono text-star-white leading-none">
          {Math.round(value)}
        </span>
        {label && (
          <span className="text-[8px] text-star-faint leading-none mt-0.5">{label}</span>
        )}
      </div>
    </div>
  )
}
