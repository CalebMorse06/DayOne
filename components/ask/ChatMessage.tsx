"use client"

import { Bot, User } from "lucide-react"
import type { ChatMessage as ChatMessageType } from "@/lib/types"
import { VideoTimestamp } from "./VideoTimestamp"
import { cn } from "@/lib/utils"

interface ChatMessageProps {
  message: ChatMessageType
  videoUrl?: string | null
}

export function ChatMessage({ message, videoUrl }: ChatMessageProps) {
  const isUser = message.role === "user"

  const renderContent = (text: string) => {
    const parts = text.split(/(\[Video:\s*[\d:]+\])/g)
    return parts.map((part, i) => {
      const match = part.match(/\[Video:\s*([\d:]+)\]/)
      if (match) {
        return <VideoTimestamp key={i} timestamp={match[1]} videoUrl={videoUrl} />
      }
      return <span key={i}>{part}</span>
    })
  }

  return (
    <div
      className={cn(
        "flex gap-2.5 animate-slide-up",
        isUser ? "flex-row-reverse" : "flex-row"
      )}
    >
      {/* Avatar */}
      <div
        className={cn(
          "w-8 h-8 rounded-full flex items-center justify-center flex-shrink-0",
          isUser ? "bg-neon-purple" : "bg-space-700 border border-space-600"
        )}
      >
        {isUser ? (
          <User className="w-4 h-4 text-white" />
        ) : (
          <Bot className="w-4 h-4 text-neon-cyan" />
        )}
      </div>

      {/* Message bubble */}
      <div
        className={cn(
          "max-w-[80%] p-3 rounded-xl text-sm leading-relaxed",
          isUser
            ? "bg-neon-purple text-white rounded-tr-sm"
            : "bg-space-700 border border-space-600 text-star-white rounded-tl-sm"
        )}
      >
        <div className="whitespace-pre-wrap">{renderContent(message.content)}</div>

        {/* Citations */}
        {message.citations && message.citations.length > 0 && (
          <div className="mt-2 pt-2 border-t border-space-600/50 space-y-1">
            {message.citations.map((cite, i) => (
              <div key={i} className="flex items-start gap-1.5 text-xs opacity-80">
                <span className="font-medium text-neon-cyan">Source:</span>
                <span className="italic text-star-dim">{cite.text}</span>
                {cite.videoTimestamp && (
                  <VideoTimestamp timestamp={cite.videoTimestamp} videoUrl={videoUrl} />
                )}
              </div>
            ))}
          </div>
        )}
      </div>
    </div>
  )
}
