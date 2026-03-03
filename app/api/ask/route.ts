/**
 * POST /api/ask — AI Mentor Q&A endpoint.
 * Takes a user question and module context, sends to Gemini,
 * and returns an answer with evidence citations.
 */

import { NextRequest, NextResponse } from "next/server"
import { askExpert } from "@/lib/gemini"
import { ASK_EXPERT_PROMPT } from "@/lib/prompts"
import { checkUsageLimit, incrementUsage } from "@/lib/paywall"
import type { LearningModule, Citation } from "@/lib/types"

interface AskRequest {
  question: string
  module: LearningModule
}

interface AskResponse {
  answer: string
  citations: Citation[]
}

/** Helper to build a Citation from a card */
function cite(cardId: string, text: string, videoTimestamp?: string): Citation {
  return { text, cardId, videoTimestamp }
}

/** Generate a contextual demo response based on the question and module content */
function getDemoResponse(question: string, module: LearningModule): { answer: string; citations: Citation[] } {
  const q = question.toLowerCase()
  const cards = module.cards || []
  const hazards = module.safetyHazards || []
  const tools = module.tools || []
  const quizzes = module.quizQuestions || []

  // Find relevant cards by keyword matching
  const relevantCards = cards.filter((c) => {
    const combined = `${c.title} ${c.body}`.toLowerCase()
    return q.split(/\s+/).some((word) => word.length > 3 && combined.includes(word))
  })

  // Safety-related questions
  if (q.match(/safe|hazard|danger|protect|ppe|injury|risk|critical/)) {
    const hazardInfo = hazards.map((h) =>
      `- **${h.description}** (${h.severity} severity): ${h.mitigation}`
    ).join("\n")
    const safetyCards = cards.filter((c) => c.type === "hazard")
    const citations = safetyCards.map((c) => cite(c.id, c.title, c.videoTimestamp))

    return {
      answer: `Great safety question! Here's what the training covers:\n\n${hazardInfo || "This module covers proper safety protocols throughout each step."}\n\n${safetyCards.length > 0 ? `The key safety card "${safetyCards[0].title}" (at ${safetyCards[0].videoTimestamp}) explains: ${safetyCards[0].body.slice(0, 200)}...` : "Follow all posted safety procedures and wear required PPE."}\n\nAlways refer to your site-specific safety manual for additional requirements.`,
      citations,
    }
  }

  // Tool-related questions
  if (q.match(/tool|equipment|gauge|instrument|measure|calibrat/)) {
    const toolList = tools.map((t) =>
      `- **${t.name}**: ${t.purpose}${t.safetyNotes ? ` (${t.safetyNotes})` : ""}`
    ).join("\n")
    const toolCards = cards.filter((c) => c.type === "tool")
    const citations = toolCards.map((c) => cite(c.id, c.title, c.videoTimestamp))

    return {
      answer: `Here are the key tools referenced in "${module.title}":\n\n${toolList || "Check the learning cards for specific tool requirements."}\n\n${toolCards.length > 0 ? `The "${toolCards[0].title}" card (at ${toolCards[0].videoTimestamp}) goes into detail: ${toolCards[0].body.slice(0, 200)}...` : "Proper tool selection is critical for quality results."}`,
      citations,
    }
  }

  // Common mistakes / tips
  if (q.match(/mistake|error|wrong|avoid|tip|trick|advice|common/)) {
    const mistakeCards = cards
      .filter((c) => c.commonMistakes && c.commonMistakes.length > 0)
      .slice(0, 3)
    const mistakes = mistakeCards.map((c) => `**${c.title}**: ${c.commonMistakes![0]}`)
    const citations = mistakeCards.map((c) => cite(c.id, c.title, c.videoTimestamp))

    return {
      answer: `Here are the most common mistakes to watch for in "${module.title}":\n\n${mistakes.map((m, i) => `${i + 1}. ${m}`).join("\n")}\n\nVeteran operators develop instincts for these — review the flagged cards to build that awareness.`,
      citations,
    }
  }

  // Quiz / test prep questions
  if (q.match(/quiz|test|exam|assess|certif|pass|study/)) {
    const quizTopics = quizzes.slice(0, 3).map((quiz) => `- ${quiz.question}`).join("\n")
    return {
      answer: `To prepare for assessment on "${module.title}", focus on these key areas:\n\n${quizTopics || "Review all learning cards, especially those marked as critical checkpoints."}\n\nThe quiz covers ${quizzes.length} questions. Pay special attention to the hazard cards and critical checkpoints — they're weighted heavily in certification scoring.`,
      citations: quizzes.slice(0, 2).map((quiz) => {
        const relCard = cards.find((c) => c.id === quiz.relatedCardId)
        return cite(quiz.relatedCardId || "", relCard?.title || quiz.question, relCard?.videoTimestamp)
      }),
    }
  }

  // Steps / procedure / how-to questions
  if (q.match(/step|procedure|process|how|sequence|order|first|start|begin/)) {
    const steps = cards.filter((c) => c.type === "step").slice(0, 4)
    const stepList = steps.map((s, i) => `${i + 1}. **${s.title}** (${s.videoTimestamp}) — ${s.body.slice(0, 100)}...`).join("\n")
    const citations = steps.map((c) => cite(c.id, c.title, c.videoTimestamp))

    return {
      answer: `Here's the procedure outlined in "${module.title}":\n\n${stepList}\n\nThe sequence matters — ${module.sequenceDependencies?.length ? module.sequenceDependencies[0] : "follow the cards in order for best results"}. Critical checkpoints are marked and must be verified before proceeding.`,
      citations,
    }
  }

  // Fallback: use relevant cards if found, otherwise give a rich general answer
  if (relevantCards.length > 0) {
    const card = relevantCards[0]
    return {
      answer: `Based on "${module.title}", the "${card.title}" card (at ${card.videoTimestamp}) covers this:\n\n${card.body}\n\n${card.commonMistakes?.length ? `**Watch out for:** ${card.commonMistakes[0]}` : ""}`,
      citations: [cite(card.id, card.title, card.videoTimestamp)],
    }
  }

  // Generic but module-aware fallback
  return {
    answer: `Great question! "${module.title}" covers ${cards.length} learning cards across topics like ${cards.slice(0, 3).map((c) => c.title).join(", ")}.\n\nThe module has ${hazards.length} safety hazard${hazards.length !== 1 ? "s" : ""} flagged, ${quizzes.length} quiz questions for assessment, and ${tools.length} tool${tools.length !== 1 ? "s" : ""} referenced.\n\nTry asking about specific steps, safety procedures, common mistakes, or tools — I can give you detailed information from the training content.`,
    citations: cards.slice(0, 2).map((c) => cite(c.id, c.title, c.videoTimestamp)),
  }
}

export async function POST(request: NextRequest) {
  try {
    const body: AskRequest = await request.json()

    if (!body.question?.trim()) {
      return NextResponse.json({ error: "No question provided" }, { status: 400 })
    }

    if (!body.module) {
      return NextResponse.json({ error: "No module context provided" }, { status: 400 })
    }

    // 2. Check Paywall / Usage Limits
    const orgId = body.module.id // Using moduleId as placeholder for orgId in demo
    const { allowed, reason } = await checkUsageLimit(orgId, "question")
    if (!allowed) {
      return NextResponse.json({ 
        answer: `⚠️ ${reason}`,
        citations: [],
        paywallTriggered: true 
      })
    }

    // Check for API key — use smart demo responses when missing
    if (!process.env.GEMINI_API_KEY) {
      const demo = getDemoResponse(body.question, body.module)
      return NextResponse.json({
        answer: demo.answer,
        citations: demo.citations,
        fallback: true,
      })
    }

    // Build the prompt with module context
    const prompt = ASK_EXPERT_PROMPT.replace(
      "{moduleJson}",
      JSON.stringify({
        ...body.module,
        transcript: body.module.transcript || "No transcript available",
        tacitCues: body.module.tacitCues || []
      }, null, 2)
    )

    const fullPrompt = `${prompt}\n\nUser question: ${body.question}`

    const rawResponse = await askExpert(fullPrompt)

    // Parse JSON response
    let jsonStr = rawResponse.trim()
    if (jsonStr.startsWith("```")) {
      jsonStr = jsonStr.replace(/^```(?:json)?\n?/, "").replace(/\n?```$/, "")
    }

    const parsed: AskResponse = JSON.parse(jsonStr)

    // 4. Increment Usage on Success
    await incrementUsage(orgId, "question")

    return NextResponse.json({
      answer: parsed.answer,
      citations: parsed.citations || [],
      fallback: false,
    })
  } catch (error) {
    console.error("Ask expert failed:", error)
    return NextResponse.json({
      answer:
        "I had trouble processing that question. This can happen with complex queries. Could you try rephrasing it? In the meantime, you can review the learning cards for detailed information about the procedure.",
      citations: [],
      fallback: true,
    })
  }
}
