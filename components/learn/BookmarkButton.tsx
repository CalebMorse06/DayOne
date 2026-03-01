"use client"

import { motion } from "framer-motion"
import { Bookmark } from "lucide-react"
import { cn } from "@/lib/utils"

interface BookmarkButtonProps {
  isBookmarked: boolean
  onToggle: () => void
}

export function BookmarkButton({ isBookmarked, onToggle }: BookmarkButtonProps) {
  return (
    <motion.button
      whileTap={{ scale: 0.85 }}
      onClick={(e) => {
        e.stopPropagation()
        onToggle()
      }}
      className="p-1.5 rounded-lg hover:bg-space-600/50 transition-colors"
      aria-label={isBookmarked ? "Remove bookmark" : "Bookmark this card"}
      title={isBookmarked ? "Remove bookmark" : "Bookmark this card"}
    >
      <Bookmark
        className={cn(
          "w-4 h-4 transition-colors",
          isBookmarked ? "text-warm-amber fill-warm-amber" : "text-star-faint"
        )}
      />
    </motion.button>
  )
}
