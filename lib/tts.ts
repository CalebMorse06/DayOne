/**
 * Text-to-Speech utilities.
 * Server-side: Uses ElevenLabs API if key is available.
 * Client-side: Falls back to Web Speech API.
 */

/**
 * Generate voiceover audio from text using ElevenLabs API.
 * @param text - The text to convert to speech
 * @param voice - Optional voice ID (defaults to a professional male voice)
 * @returns Base64 audio data URL, or null on failure
 */
export async function generateVoiceover(
  text: string,
  voice?: string
): Promise<string | null> {
  const apiKey = process.env.ELEVENLABS_API_KEY
  if (!apiKey) return null

  try {
    const voiceId = voice || "pNInz6obpgDQGcFmaJgB" // "Adam" - professional male voice
    const response = await fetch(
      `https://api.elevenlabs.io/v1/text-to-speech/${voiceId}`,
      {
        method: "POST",
        headers: {
          "xi-api-key": apiKey,
          "Content-Type": "application/json",
        },
        body: JSON.stringify({
          text,
          model_id: "eleven_turbo_v2_5",
          voice_settings: {
            stability: 0.6,
            similarity_boost: 0.75,
            style: 0.2,
          },
        }),
      }
    )

    if (!response.ok) {
      console.error("ElevenLabs API error:", response.status)
      return null
    }

    const audioBuffer = await response.arrayBuffer()
    const base64 = Buffer.from(audioBuffer).toString("base64")
    return `data:audio/mpeg;base64,${base64}`
  } catch (error) {
    console.error("TTS generation failed:", error)
    return null
  }
}
