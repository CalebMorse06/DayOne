import { NextRequest, NextResponse } from "next/server"
import { askExpert } from "@/lib/gemini"
import { ASK_EXPERT_PROMPT } from "@/lib/prompts"
import type { LearningModule } from "@/lib/types"

const TRANSLATION_PROMPT = `You are a professional industrial translator. 
Translate the following training module content into {targetLanguage}. 
Maintain the technical accuracy, the "expert vibe," and the specific industry terminology.
Ensure all card titles, bodies, and quiz questions are naturally translated.

MODULE CONTENT (JSON):
{moduleJson}

Return the COMPLETE translated JSON object. Return ONLY the JSON.`

export async function POST(request: NextRequest) {
  try {
    const { module, targetLanguage } = await request.json()

    if (!module || !targetLanguage) {
      return NextResponse.json({ error: "Module and Target Language required" }, { status: 400 })
    }

    // Check for API key
    if (!process.env.GEMINI_API_KEY) {
      return NextResponse.json({ error: "Gemini API key not configured" }, { status: 500 })
    }

    const prompt = TRANSLATION_PROMPT
      .replace("{targetLanguage}", targetLanguage)
      .replace("{moduleJson}", JSON.stringify(module))

    const rawResponse = await askExpert(prompt)

    // Parse JSON response
    let jsonStr = rawResponse.trim()
    if (jsonStr.startsWith("```")) {
      jsonStr = jsonStr.replace(/^```(?:json)?\n?/, "").replace(/\n?```$/, "")
    }

    const translatedModule = JSON.parse(jsonStr)

    return NextResponse.json({ translatedModule })
  } catch (error: any) {
    console.error("Translation failed:", error)
    return NextResponse.json({ error: error.message }, { status: 500 })
  }
}
