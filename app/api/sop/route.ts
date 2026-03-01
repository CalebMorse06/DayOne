import { NextRequest, NextResponse } from "next/server"
import { generateSOP } from "@/lib/sop-generator"

export async function POST(request: NextRequest) {
  try {
    const { module } = await request.json()
    const sop = await generateSOP(JSON.stringify(module))
    return NextResponse.json(sop)
  } catch (error) {
    console.error("SOP generation failed:", error)
    return NextResponse.json({ error: "Failed to generate SOP" }, { status: 500 })
  }
}
