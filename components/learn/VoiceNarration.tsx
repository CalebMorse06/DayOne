"use client"

import { useState, useRef, useCallback, useEffect } from "react"
import { Volume2, VolumeX, Loader2 } from "lucide-react"
import { cn } from "@/lib/utils"

interface VoiceNarrationProps {
  text: string
  audioUrl?: string
}

export function VoiceNarration({ text, audioUrl }: VoiceNarrationProps) {
  const [isPlaying, setIsPlaying] = useState(false)
  const [isLoading, setIsLoading] = useState(false)
  const audioRef = useRef<HTMLAudioElement | null>(null)
  const synthUtteranceRef = useRef<SpeechSynthesisUtterance | null>(null)
  const [useBrowserTTS, setUseBrowserTTS] = useState(!audioUrl)

  // Cleanup on unmount
  useEffect(() => {
    return () => {
      if (audioRef.current) {
        audioRef.current.pause()
        audioRef.current = null
      }
      if (typeof window !== "undefined" && window.speechSynthesis) {
        window.speechSynthesis.cancel()
      }
    }
  }, [])

  const playWithAudioElement = useCallback(
    (url: string) => {
      if (audioRef.current) {
        audioRef.current.pause()
      }
      const audio = new Audio(url)
      audioRef.current = audio
      audio.onended = () => setIsPlaying(false)
      audio.onerror = () => {
        setIsPlaying(false)
        // Fallback to browser TTS on audio error
        setUseBrowserTTS(true)
      }
      audio.play().catch(() => {
        setIsPlaying(false)
        setUseBrowserTTS(true)
      })
    },
    []
  )

  const playWithBrowserTTS = useCallback(() => {
    if (typeof window === "undefined" || !window.speechSynthesis) {
      setIsPlaying(false)
      return
    }
    window.speechSynthesis.cancel()
    const utterance = new SpeechSynthesisUtterance(text)
    utterance.rate = 0.9
    utterance.pitch = 1.0
    utterance.onend = () => setIsPlaying(false)
    utterance.onerror = () => setIsPlaying(false)
    synthUtteranceRef.current = utterance
    window.speechSynthesis.speak(utterance)
  }, [text])

  const fetchAndPlay = useCallback(async () => {
    setIsLoading(true)
    try {
      const res = await fetch("/api/tts", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ text }),
      })
      const data = await res.json()
      if (data.audioUrl) {
        playWithAudioElement(data.audioUrl)
      } else {
        // Fallback to browser TTS
        playWithBrowserTTS()
      }
    } catch {
      playWithBrowserTTS()
    } finally {
      setIsLoading(false)
    }
  }, [text, playWithAudioElement, playWithBrowserTTS])

  const handleToggle = useCallback(() => {
    if (isPlaying) {
      // Stop
      if (audioRef.current) audioRef.current.pause()
      if (typeof window !== "undefined" && window.speechSynthesis) {
        window.speechSynthesis.cancel()
      }
      setIsPlaying(false)
      return
    }

    setIsPlaying(true)

    if (audioUrl && !useBrowserTTS) {
      playWithAudioElement(audioUrl)
    } else if (useBrowserTTS) {
      playWithBrowserTTS()
    } else {
      fetchAndPlay()
    }
  }, [isPlaying, audioUrl, useBrowserTTS, playWithAudioElement, playWithBrowserTTS, fetchAndPlay])

  return (
    <button
      onClick={handleToggle}
      disabled={isLoading}
      title={isPlaying ? "Stop narration" : "Play narration"}
      className={cn(
        "relative p-1.5 rounded-lg transition-all",
        isPlaying
          ? "bg-neon-cyan/15 text-neon-cyan"
          : "text-star-faint hover:text-star-dim hover:bg-space-600"
      )}
    >
      {isLoading ? (
        <Loader2 className="w-4 h-4 animate-spin" />
      ) : isPlaying ? (
        <>
          <VolumeX className="w-4 h-4" />
          {/* Equalizer bars animation */}
          <div className="absolute -top-1 -right-1 flex items-end gap-[1px]">
            <div className="w-[2px] bg-neon-cyan rounded-full animate-pulse" style={{ height: 6, animationDelay: "0ms" }} />
            <div className="w-[2px] bg-neon-cyan rounded-full animate-pulse" style={{ height: 8, animationDelay: "150ms" }} />
            <div className="w-[2px] bg-neon-cyan rounded-full animate-pulse" style={{ height: 5, animationDelay: "300ms" }} />
          </div>
        </>
      ) : (
        <Volume2 className="w-4 h-4" />
      )}
    </button>
  )
}
