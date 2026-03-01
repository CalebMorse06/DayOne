"use client"

import { AlertTriangle } from "lucide-react"

interface MissedPitfall {
  cardId: string
  mistake: string
}

interface CommonlyMissedSectionProps {
  pitfalls: MissedPitfall[]
  cardTitles?: Record<string, string>
}

export function CommonlyMissedSection({ pitfalls, cardTitles }: CommonlyMissedSectionProps) {
  if (pitfalls.length === 0) return null

  return (
    <div>
      <h3 className="text-sm font-semibold text-star-white mb-2 flex items-center gap-2">
        <AlertTriangle className="w-4 h-4 text-retro-coral" />
        Areas to Review
      </h3>
      <div className="space-y-2">
        {pitfalls.map((p, i) => (
          <div
            key={i}
            className="p-3 glass-card rounded-lg border-l-2 border-l-retro-coral/50"
          >
            <p className="text-xs font-semibold text-star-white mb-0.5">
              {cardTitles?.[p.cardId] || p.cardId}
            </p>
            <p className="text-[11px] text-star-dim">{p.mistake}</p>
          </div>
        ))}
      </div>
    </div>
  )
}
