"use client"

import { cn } from "@/lib/utils"

interface IllustrationProps {
  className?: string
  size?: number
}

export function StepIllustration({ className, size = 40 }: IllustrationProps) {
  return (
    <svg width={size} height={size} viewBox="0 0 40 40" fill="none" className={cn(className)}>
      <circle cx="20" cy="20" r="18" stroke="#f59e0b" strokeWidth="2" strokeLinecap="round" strokeDasharray="4 3" opacity="0.3" />
      <path d="M14 20L18 24L26 16" stroke="#f59e0b" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round" />
      <path d="M12 12C13.5 10.5 16 9 20 9" stroke="#d97706" strokeWidth="1.5" strokeLinecap="round" opacity="0.5" />
    </svg>
  )
}

export function HazardIllustration({ className, size = 40 }: IllustrationProps) {
  return (
    <svg width={size} height={size} viewBox="0 0 40 40" fill="none" className={cn(className)}>
      <path d="M20 8L34 32H6L20 8Z" stroke="#fb7185" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" fill="#fb718510" />
      <path d="M20 18V24" stroke="#fb7185" strokeWidth="2.5" strokeLinecap="round" />
      <circle cx="20" cy="28" r="1.5" fill="#fb7185" />
    </svg>
  )
}

export function TipIllustration({ className, size = 40 }: IllustrationProps) {
  return (
    <svg width={size} height={size} viewBox="0 0 40 40" fill="none" className={cn(className)}>
      <path d="M20 6C14 6 10 10.5 10 16C10 20 12 22 14 24C15 25 16 26 16 28H24C24 26 25 25 26 24C28 22 30 20 30 16C30 10.5 26 6 20 6Z" stroke="#f59e0b" strokeWidth="2" strokeLinecap="round" fill="#f59e0b10" />
      <path d="M16 32H24" stroke="#f59e0b" strokeWidth="2" strokeLinecap="round" />
      <path d="M18 36H22" stroke="#d97706" strokeWidth="1.5" strokeLinecap="round" />
      <path d="M20 12V18M17 15H23" stroke="#fef3c7" strokeWidth="1.5" strokeLinecap="round" opacity="0.6" />
    </svg>
  )
}

export function QualityIllustration({ className, size = 40 }: IllustrationProps) {
  return (
    <svg width={size} height={size} viewBox="0 0 40 40" fill="none" className={cn(className)}>
      <circle cx="18" cy="18" r="10" stroke="#5eead4" strokeWidth="2" strokeLinecap="round" fill="#5eead410" />
      <path d="M26 26L34 34" stroke="#5eead4" strokeWidth="2.5" strokeLinecap="round" />
      <path d="M14 18L17 21L22 15" stroke="#5eead4" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round" opacity="0.7" />
    </svg>
  )
}

export function ToolIllustration({ className, size = 40 }: IllustrationProps) {
  return (
    <svg width={size} height={size} viewBox="0 0 40 40" fill="none" className={cn(className)}>
      <rect x="8" y="14" width="24" height="16" rx="3" stroke="#94a3b8" strokeWidth="2" strokeLinecap="round" fill="#94a3b810" />
      <path d="M14 14V10C14 8.9 14.9 8 16 8H24C25.1 8 26 8.9 26 10V14" stroke="#94a3b8" strokeWidth="1.5" strokeLinecap="round" />
      <circle cx="20" cy="22" r="3" stroke="#f59e0b" strokeWidth="1.5" fill="#f59e0b15" />
    </svg>
  )
}

export function EmptyStateIllustration({ className, size = 120 }: IllustrationProps) {
  return (
    <svg width={size} height={size} viewBox="0 0 120 120" fill="none" className={cn(className)}>
      {/* Rocket body */}
      <path d="M60 20C60 20 45 40 45 70C45 80 50 90 60 95C70 90 75 80 75 70C75 40 60 20 60 20Z" stroke="#f59e0b" strokeWidth="2" strokeLinecap="round" fill="#f59e0b08" />
      {/* Window */}
      <circle cx="60" cy="55" r="6" stroke="#5eead4" strokeWidth="1.5" fill="#5eead410" />
      {/* Fins */}
      <path d="M45 75L35 85L45 80" stroke="#d97706" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round" />
      <path d="M75 75L85 85L75 80" stroke="#d97706" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round" />
      {/* Flame */}
      <path d="M55 95C55 95 58 105 60 110C62 105 65 95 65 95" stroke="#fb7185" strokeWidth="2" strokeLinecap="round" fill="#fb718515" />
      {/* Stars */}
      <circle cx="25" cy="30" r="1.5" fill="#fef3c7" opacity="0.6" />
      <circle cx="90" cy="25" r="1" fill="#fef3c7" opacity="0.4" />
      <circle cx="15" cy="60" r="1" fill="#f59e0b" opacity="0.5" />
      <circle cx="100" cy="55" r="1.5" fill="#f59e0b" opacity="0.3" />
      <circle cx="30" cy="90" r="1" fill="#fef3c7" opacity="0.4" />
      <circle cx="95" cy="80" r="1" fill="#5eead4" opacity="0.3" />
      {/* Workshop bench */}
      <path d="M20 100H100" stroke="#475569" strokeWidth="1.5" strokeLinecap="round" opacity="0.3" />
      <path d="M30 100V95H40V100" stroke="#475569" strokeWidth="1" strokeLinecap="round" opacity="0.2" />
      <path d="M80 100V95H90V100" stroke="#475569" strokeWidth="1" strokeLinecap="round" opacity="0.2" />
    </svg>
  )
}

export function CompletionIllustration({ className, size = 80 }: IllustrationProps) {
  return (
    <svg width={size} height={size} viewBox="0 0 80 80" fill="none" className={cn(className)}>
      {/* Trophy body */}
      <path d="M28 20H52V40C52 50 46 56 40 56C34 56 28 50 28 40V20Z" stroke="#f59e0b" strokeWidth="2" strokeLinecap="round" fill="#f59e0b10" />
      {/* Handles */}
      <path d="M28 24C22 24 18 28 18 32C18 36 22 40 28 40" stroke="#d97706" strokeWidth="1.5" strokeLinecap="round" />
      <path d="M52 24C58 24 62 28 62 32C62 36 58 40 52 40" stroke="#d97706" strokeWidth="1.5" strokeLinecap="round" />
      {/* Base */}
      <path d="M36 56V60H44V56" stroke="#f59e0b" strokeWidth="1.5" strokeLinecap="round" />
      <path d="M32 60H48V64H32V60Z" stroke="#f59e0b" strokeWidth="1.5" strokeLinecap="round" fill="#f59e0b08" />
      {/* Star */}
      <path d="M40 28L42 34L48 34L43 38L45 44L40 40L35 44L37 38L32 34L38 34L40 28Z" stroke="#fef3c7" strokeWidth="1" fill="#fef3c730" />
      {/* Confetti dots */}
      <circle cx="18" cy="16" r="2" fill="#5eead4" opacity="0.6" />
      <circle cx="62" cy="12" r="2" fill="#fb7185" opacity="0.6" />
      <circle cx="12" cy="40" r="1.5" fill="#f59e0b" opacity="0.5" />
      <circle cx="68" cy="44" r="1.5" fill="#a855f7" opacity="0.5" />
      <rect x="22" y="10" width="4" height="2" rx="1" fill="#f59e0b" opacity="0.4" transform="rotate(30 22 10)" />
      <rect x="56" y="18" width="4" height="2" rx="1" fill="#5eead4" opacity="0.4" transform="rotate(-20 56 18)" />
    </svg>
  )
}
