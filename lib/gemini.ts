/**
 * Gemini API client for video analysis and Q&A.
 * Handles video file upload to Gemini File API and structured prompting.
 */

import { GoogleGenerativeAI } from "@google/generative-ai"
import { GoogleAIFileManager } from "@google/generative-ai/server"

const API_KEY = process.env.GEMINI_API_KEY || ""

// Lazy-init: only create clients when API key is available
let _genAI: GoogleGenerativeAI | null = null
let _fileManager: GoogleAIFileManager | null = null

function getGenAI(): GoogleGenerativeAI {
  if (!API_KEY) throw new Error("GEMINI_API_KEY is not configured")
  if (!_genAI) _genAI = new GoogleGenerativeAI(API_KEY)
  return _genAI
}

function getFileManager(): GoogleAIFileManager {
  if (!API_KEY) throw new Error("GEMINI_API_KEY is not configured")
  if (!_fileManager) _fileManager = new GoogleAIFileManager(API_KEY)
  return _fileManager
}

/**
 * Uploads a video file to the Gemini File API and waits for processing.
 * @param buffer - The video file as a Buffer
 * @param mimeType - The MIME type of the video (e.g., "video/mp4")
 * @param displayName - A display name for the uploaded file
 * @returns The uploaded file metadata including URI
 */
export async function uploadVideo(
  buffer: Buffer,
  mimeType: string,
  displayName: string
) {
  const fs = await import("fs")
  const path = await import("path")
  const os = await import("os")
  const tempPath = path.join(os.tmpdir(), `dayone-upload-${Date.now()}`)
  fs.writeFileSync(tempPath, buffer)

  try {
    const uploadResult = await getFileManager().uploadFile(tempPath, {
      mimeType,
      displayName,
    })

    // Poll until file is ACTIVE
    let file = uploadResult.file
    while (file.state === "PROCESSING") {
      await new Promise((resolve) => setTimeout(resolve, 2000))
      file = await getFileManager().getFile(file.name)
    }

    if (file.state === "FAILED") {
      throw new Error("Gemini file processing failed")
    }

    return file
  } finally {
    fs.unlinkSync(tempPath)
  }
}

/**
 * Sends a video to Gemini for analysis with a structured prompt.
 * @param fileUri - The Gemini File API URI for the uploaded video
 * @param mimeType - The MIME type of the video
 * @param prompt - The analysis prompt
 * @returns The raw text response from Gemini
 */
export async function analyzeVideo(
  fileUri: string,
  mimeType: string,
  prompt: string
): Promise<string> {
  const model = getGenAI().getGenerativeModel({ model: "gemini-2.0-flash" })

  const result = await model.generateContent([
    {
      fileData: {
        mimeType,
        fileUri,
      },
    },
    { text: prompt },
  ])

  return result.response.text()
}

/**
 * Sends a Q&A query to Gemini with module context.
 * @param prompt - The full prompt including module context and user question
 * @returns The raw text response from Gemini
 */
export async function askExpert(prompt: string): Promise<string> {
  const model = getGenAI().getGenerativeModel({ model: "gemini-2.0-flash" })

  const result = await model.generateContent([{ text: prompt }])

  return result.response.text()
}

/**
 * Generates an AI illustration from an image description using Gemini's image output mode.
 * @param imageDescription - The description of what to illustrate
 * @returns A base64 data URL string, or null on failure
 */
export async function generateCardImage(
  imageDescription: string
): Promise<string | null> {
  try {
    const model = getGenAI().getGenerativeModel({
      model: "gemini-2.0-flash-preview-image-generation",
      generationConfig: {
        // @ts-expect-error - responseModalities is supported by image generation models
        responseModalities: ["Text", "Image"],
      },
    })

    const prompt = `Generate a technical training illustration in clean line art style with a dark background (#0a0a1a) and neon accent colors (cyan #22d3ee, purple #a855f7, green #34d399). The illustration should be simple, clear, and educational.

Subject: ${imageDescription}

Style requirements:
- Clean vector-like line art
- Dark space background
- Neon glow accents on key elements
- No text or labels in the image
- Professional technical illustration feel
- 16:9 aspect ratio`

    const result = await model.generateContent([{ text: prompt }])
    const response = result.response
    const candidates = response.candidates

    if (!candidates || candidates.length === 0) return null

    const parts = candidates[0].content?.parts
    if (!parts) return null

    for (const part of parts) {
      if (part.inlineData) {
        const { mimeType, data } = part.inlineData
        return `data:${mimeType};base64,${data}`
      }
    }

    return null
  } catch (error) {
    const desc = imageDescription.slice(0, 80)
    console.error(`[generateCardImage] Failed for "${desc}...":`, error instanceof Error ? error.message : error)
    return null
  }
}
