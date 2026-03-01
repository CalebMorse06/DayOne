"use client"

import { useState, useRef, useEffect, useCallback } from "react"
import { Send, Loader2, Sparkles, MessageCircle } from "lucide-react"
import type { ChatMessage as ChatMessageType, LearningModule, Citation } from "@/lib/types"
import { ChatMessage } from "./ChatMessage"
import { cn } from "@/lib/utils"
import { getVideoObjectUrl } from "@/lib/video-store"

interface ChatInterfaceProps {
  module: LearningModule | null
  videoUrl?: string | null
}

const SUGGESTED_QUESTIONS = [
  "What's the most common mistake new operators make?",
  "What safety hazards should I watch out for?",
  "How do I know if my first piece is within tolerance?",
  "What tacit knowledge should I pay attention to?",
]

export function ChatInterface({ module, videoUrl: videoUrlProp }: ChatInterfaceProps) {
  const [messages, setMessages] = useState<ChatMessageType[]>([])
  const [input, setInput] = useState("")
  const [isLoading, setIsLoading] = useState(false)
  const scrollRef = useRef<HTMLDivElement>(null)
  const inputRef = useRef<HTMLInputElement>(null)

  // Resolve video URL: prop → in-memory store → sessionStorage
  const videoUrl = videoUrlProp || getVideoObjectUrl("") || (() => {
    if (typeof window === "undefined") return null
    for (let i = 0; i < sessionStorage.length; i++) {
      const key = sessionStorage.key(i)
      if (key?.startsWith("video-url-")) return sessionStorage.getItem(key)
    }
    return null
  })()

  useEffect(() => {
    scrollRef.current?.scrollTo({
      top: scrollRef.current.scrollHeight,
      behavior: "smooth",
    })
  }, [messages])

  const sendMessage = useCallback(
    async (text: string) => {
      if (!text.trim() || isLoading) return

      const userMessage: ChatMessageType = {
        id: `msg_${Date.now()}`,
        role: "user",
        content: text.trim(),
        timestamp: new Date().toISOString(),
      }

      setMessages((prev) => [...prev, userMessage])
      setInput("")
      setIsLoading(true)

      try {
        // Strip base64 image data to keep the payload small — the API
        // only needs text metadata (titles, timestamps, bodies) for Q&A.
        const liteModule = module ? {
          ...module,
          cards: module.cards.map(({ imageUrl, ...c }) => ({ ...c, imageUrl: imageUrl ? "[image]" : undefined })),
          videoCards: (module.videoCards || []).map(({ frames, ...vc }) => ({ ...vc, frames: frames.length ? [`[${frames.length} frames]`] : [] })),
        } : module

        const response = await fetch("/api/ask", {
          method: "POST",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify({
            question: text.trim(),
            module: liteModule,
          }),
        })

        const data = await response.json()

        const assistantMessage: ChatMessageType = {
          id: `msg_${Date.now()}_resp`,
          role: "assistant",
          content: data.answer,
          citations: data.citations as Citation[],
          timestamp: new Date().toISOString(),
        }

        setMessages((prev) => [...prev, assistantMessage])
      } catch {
        const errorMessage: ChatMessageType = {
          id: `msg_${Date.now()}_err`,
          role: "assistant",
          content:
            "I'm having trouble connecting right now. Try again in a moment, or review the learning cards for detailed information.",
          timestamp: new Date().toISOString(),
        }
        setMessages((prev) => [...prev, errorMessage])
      } finally {
        setIsLoading(false)
      }
    },
    [isLoading, module]
  )

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault()
    sendMessage(input)
  }

  return (
    <div className="flex flex-col h-full">
      {/* Messages */}
      <div
        ref={scrollRef}
        className="flex-1 overflow-y-auto px-4 py-4 space-y-4 chat-scroll"
      >
        {messages.length === 0 ? (
          <div className="flex flex-col items-center justify-center h-full text-center px-4">
            <div className="w-16 h-16 rounded-2xl bg-neon-purple/10 flex items-center justify-center mb-4">
              <Sparkles className="w-8 h-8 text-neon-purple" />
            </div>
            <h3 className="font-semibold text-star-white mb-1">Ask the Expert</h3>
            <p className="text-sm text-star-dim mb-6">
              {module
                ? "Ask anything about the training content"
                : "Upload a video first to enable AI-powered Q&A"}
            </p>

            {module && (
              <div className="w-full space-y-2">
                <p className="text-xs text-star-faint mb-2">Try asking:</p>
                {SUGGESTED_QUESTIONS.map((q) => (
                  <button
                    key={q}
                    onClick={() => sendMessage(q)}
                    className="w-full text-left p-3 text-sm bg-space-700 hover:bg-space-600 border border-space-600 rounded-lg transition-colors text-star-dim"
                  >
                    <MessageCircle className="w-3.5 h-3.5 inline mr-2 text-neon-purple" />
                    {q}
                  </button>
                ))}
              </div>
            )}
          </div>
        ) : (
          messages.map((msg) => <ChatMessage key={msg.id} message={msg} videoUrl={videoUrl} />)
        )}

        {isLoading && (
          <div className="flex items-center gap-2 text-star-faint text-sm animate-fade-in">
            <Loader2 className="w-4 h-4 animate-spin text-neon-cyan" />
            Thinking...
          </div>
        )}
      </div>

      {/* Input */}
      <form
        onSubmit={handleSubmit}
        className="px-4 py-3 border-t border-space-600 bg-space-800"
      >
        <div className="flex items-center gap-2">
          <input
            ref={inputRef}
            type="text"
            value={input}
            onChange={(e) => setInput(e.target.value)}
            placeholder={
              module ? "Ask about the procedure..." : "Upload a video first"
            }
            disabled={!module || isLoading}
            className={cn(
              "flex-1 p-3 bg-space-700 border border-space-600 rounded-lg text-base text-star-white outline-none transition-colors",
              "placeholder:text-star-faint focus:border-neon-purple focus:ring-1 focus:ring-neon-purple/30",
              (!module || isLoading) && "opacity-50"
            )}
          />
          <button
            type="submit"
            disabled={!input.trim() || !module || isLoading}
            aria-label="Send message"
            className="p-3 bg-neon-purple text-white rounded-lg disabled:opacity-30 transition-opacity active:scale-95"
          >
            <Send className="w-4 h-4" />
          </button>
        </div>
      </form>
    </div>
  )
}
