/**
 * POST /api/analyze — Video analysis endpoint.
 * Accepts a video file upload, sends it to Gemini 2.0 Flash for analysis,
 * validates the response with Zod, and returns a structured learning module.
 * Falls back to sample_module.json on any failure.
 */

import { NextRequest, NextResponse } from "next/server"
import { uploadVideo, analyzeVideo, generateCardImage } from "@/lib/gemini"
import { validateModule } from "@/lib/schemas"
import { VIDEO_ANALYSIS_PROMPT } from "@/lib/prompts"
import { checkUsageLimit, incrementUsage } from "@/lib/paywall"
import sampleModule from "@/demo_assets/sample_module.json"

/**
 * Generate images for cards in parallel with concurrency limit.
 */
async function generateImagesForCards(
  cards: Array<{ imageDescription?: string; imageUrl?: string }>
) {
  const CONCURRENCY = 4
  const queue = cards
    .map((card, i) => ({ card, i }))
    .filter(({ card }) => card.imageDescription && !card.imageUrl)

  for (let i = 0; i < queue.length; i += CONCURRENCY) {
    const batch = queue.slice(i, i + CONCURRENCY)
    const results = await Promise.allSettled(
      batch.map(({ card }) => generateCardImage(card.imageDescription!))
    )
    results.forEach((result, j) => {
      if (result.status === "fulfilled" && result.value) {
        batch[j].card.imageUrl = result.value
      }
    })
  }
}

export const maxDuration = 120

export async function POST(request: NextRequest) {
  try {
    const formData = await request.formData()
    const file = formData.get("video") as File | null

    if (!file) {
      return NextResponse.json({ error: "No video file provided" }, { status: 400 })
    }

    // 2. Check Paywall / Usage Limits
    // Note: In production, we'd get the Org ID from the user's session
    const { allowed, reason } = await checkUsageLimit("demo_org", "course")
    if (!allowed) {
      return NextResponse.json({ 
        error: reason,
        paywallTriggered: true 
      }, { status: 402 })
    }

    // Check for API key
    if (!process.env.GEMINI_API_KEY) {
      console.warn("No GEMINI_API_KEY set, returning fallback module")
      return NextResponse.json({
        module: {
          ...sampleModule,
          id: `mod_${Date.now()}`,
          sourceVideoName: file.name,
          createdAt: new Date().toISOString(),
        },
        fallback: true,
        message: "Using demo content (no API key configured)",
      })
    }

    // Convert File to Buffer
    const arrayBuffer = await file.arrayBuffer()
    const buffer = Buffer.from(arrayBuffer)

    // Upload to Gemini File API
    const uploadedFile = await uploadVideo(buffer, file.type, file.name)

    // Analyze with Gemini
    const rawResponse = await analyzeVideo(
      uploadedFile.uri,
      file.type,
      VIDEO_ANALYSIS_PROMPT
    )

    // Parse JSON from response (handle markdown code blocks)
    let jsonStr = rawResponse.trim()
    if (jsonStr.startsWith("```")) {
      jsonStr = jsonStr.replace(/^```(?:json)?\n?/, "").replace(/\n?```$/, "")
    }

    const parsed = JSON.parse(jsonStr)

    // Validate with Zod
    const validation = validateModule(parsed)
    if (!validation.success) {
      console.error("Zod validation failed:", validation.error.issues)
      // Use the parsed data as-is, filling only missing scalar fields
      const moduleId = parsed.id || `mod_${Date.now()}`
      const fallbackModule = {
        id: moduleId,
        title: parsed.title || file.name.replace(/\.[^.]+$/, ""),
        description: parsed.description || "AI-generated course from video analysis",
        intent: parsed.intent || "",
        estimatedDuration: parsed.estimatedDuration || "",
        sourceVideoName: parsed.sourceVideoName || file.name,
        cards: parsed.cards || [],
        quizQuestions: parsed.quizQuestions || [],
        tacitCues: parsed.tacitCues || [],
        tools: parsed.tools || parsed.toolsEquipment || [],
        safetyHazards: parsed.safetyHazards || [],
        sequenceChallenges: parsed.sequenceChallenges || [],
        spotDetailChallenges: parsed.spotDetailChallenges || [],
        flashChallenges: parsed.flashChallenges || [],
        simulationChallenges: parsed.simulationChallenges || [],
        videoCards: parsed.videoCards || [],
        interactiveModels: parsed.interactiveModels || [],
        createdAt: parsed.createdAt || new Date().toISOString(),
      }

      // Still generate images even on validation failure
      try {
        await generateImagesForCards(fallbackModule.cards)
      } catch (imgErr) {
        console.warn("Image generation pass failed (non-fatal):", imgErr)
      }

      return NextResponse.json({
        module: fallbackModule,
        fallback: false,
        validationWarnings: validation.error.issues.map((i) => i.message),
      })
    }

    const moduleData = validation.data

    // 4. Increment Usage on Success
    await incrementUsage("demo_org", "course")
    // Assuming we can calculate duration or use a flat increment for now
    await incrementUsage("demo_org", "video", 5) 

    try {
      await generateImagesForCards(moduleData.cards)
    } catch (imgErr) {
      console.warn("Image generation pass failed (non-fatal):", imgErr)
    }

    return NextResponse.json({
      module: moduleData,
      fallback: false,
    })
  } catch (error) {
    console.error("Analysis failed, returning fallback:", error)
    return NextResponse.json({
      module: {
        ...sampleModule,
        id: `mod_${Date.now()}`,
        sourceVideoName: "Uploaded Video",
        createdAt: new Date().toISOString(),
      },
      fallback: true,
      message:
        error instanceof Error
          ? `Analysis failed: ${error.message}. Using demo content.`
          : "Analysis failed. Using demo content.",
    })
  }
}
