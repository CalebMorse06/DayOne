"use client"

import { useState } from "react"
import { motion } from "framer-motion"
import { Star } from "lucide-react"
import { cn } from "@/lib/utils"

interface ConfidenceMeterProps {
  onRate: (confidence: number) => void
}

export function ConfidenceMeter({ onRate }: ConfidenceMeterProps) {
  const [hovered, setHovered] = useState(0)
  const [selected, setSelected] = useState(0)

  const labels = ["", "Guessing", "Unsure", "Somewhat", "Confident", "Certain"]

  const handleSelect = (rating: number) => {
    setSelected(rating)
    setTimeout(() => onRate(rating), 300)
  }

  return (
    <motion.div
      initial={{ opacity: 0, y: 10 }}
      animate={{ opacity: 1, y: 0 }}
      className="flex flex-col items-center gap-2 py-3"
    >
      <p className="text-xs text-star-faint">How confident are you?</p>
      <div className="flex gap-1">
        {[1, 2, 3, 4, 5].map((level) => (
          <button
            key={level}
            onMouseEnter={() => setHovered(level)}
            onMouseLeave={() => setHovered(0)}
            onClick={() => handleSelect(level)}
            disabled={selected > 0}
            className="p-1 transition-transform hover:scale-110"
          >
            <Star
              className={cn(
                "w-6 h-6 transition-colors",
                (hovered >= level || selected >= level)
                  ? "text-warm-amber fill-warm-amber"
                  : "text-star-faint"
              )}
            />
          </button>
        ))}
      </div>
      {(hovered > 0 || selected > 0) && (
        <p className="text-xs text-warm-amber font-medium">
          {labels[selected || hovered]}
        </p>
      )}
    </motion.div>
  )
}
