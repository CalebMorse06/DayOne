import { LearningModuleSchema } from "./schemas"
import { SOPSchema } from "./sop-schema"
import { GoogleGenerativeAI } from "@google/generative-ai"

const genAI = new GoogleGenerativeAI(process.env.GEMINI_API_KEY!)

export async function generateSOP(moduleJson: string) {
  const model = genAI.getGenerativeModel({ model: "gemini-2.0-flash" })

  const prompt = `You are an industrial engineer. Based on the following training module data extracted from a video, generate a formal Standard Operating Procedure (SOP).
  
  MODULE DATA:
  ${moduleJson}
  
  Return a JSON object matching this schema:
  {
    "title": "Formal Process Title",
    "objective": "Clear description of what this process achieves",
    "prerequisites": ["List of things needed before starting"],
    "ppeRequired": ["Required safety gear"],
    "toolsRequired": ["List of tools"],
    "procedureSteps": [
      {
        "stepNumber": 1,
        "title": "Brief Step Title",
        "action": "Detailed action description",
        "checkpoint": "Quality check for this step",
        "hazardNote": "Specific safety warning",
        "proTip": "Expert advice"
      }
    ],
    "troubleshooting": [
      { "symptom": "Issue", "cause": "Why", "remedy": "How to fix" }
    ],
    "qualityChecks": ["Key things to verify at the end"]
  }
  
  Return ONLY the JSON object.`

  const result = await model.generateContent([{ text: prompt }])
  const response = result.response.text().trim()
  
  let jsonStr = response
  if (jsonStr.startsWith("```")) {
    jsonStr = jsonStr.replace(/^```(?:json)?\n?/, "").replace(/\n?```$/, "")
  }
  
  const parsed = JSON.parse(jsonStr)
  return SOPSchema.parse({
    ...parsed,
    id: `sop_${Date.now()}`,
    lastUpdated: new Date().toISOString()
  })
}
