/**
 * POST /api/tts — Text-to-Speech endpoint.
 * Converts text to audio using ElevenLabs API.
 * Falls back gracefully if no API key is configured.
 */

import { NextRequest, NextResponse } from "next/server"
import { generateVoiceover } from "@/lib/tts"

// Simple in-memory cache for generated audio
const audioCache = new Map<string, string>()
const MAX_CACHE_SIZE = 50

export async function POST(request: NextRequest) {
  try {
    const { text, voice } = await request.json()

    if (!text || typeof text !== "string") {
      return NextResponse.json(
        { error: "Text is required" },
        { status: 400 }
      )
    }

    // Truncate very long text
    const truncated = text.slice(0, 2000)

    // Check cache
    const cacheKey = `${truncated.slice(0, 100)}_${voice || "default"}`
    if (audioCache.has(cacheKey)) {
      return NextResponse.json({ audioUrl: audioCache.get(cacheKey) })
    }

    if (!process.env.ELEVENLABS_API_KEY) {
      return NextResponse.json({
        audioUrl: null,
        fallback: true,
        message: "No TTS API key configured. Use browser speech synthesis.",
      })
    }

    const audioUrl = await generateVoiceover(truncated, voice)

    if (audioUrl) {
      // Cache result (evict oldest if full)
      if (audioCache.size >= MAX_CACHE_SIZE) {
        const firstKey = audioCache.keys().next().value
        if (firstKey) audioCache.delete(firstKey)
      }
      audioCache.set(cacheKey, audioUrl)
    }

    return NextResponse.json({ audioUrl })
  } catch (error) {
    console.error("TTS endpoint error:", error)
    return NextResponse.json(
      {
        audioUrl: null,
        fallback: true,
        message: "TTS generation failed. Use browser speech synthesis.",
      },
      { status: 200 }
    )
  }
}
