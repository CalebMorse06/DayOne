/**
 * Client-side video frame extraction.
 * Uses a hidden <video> + <canvas> to capture frames at specific timestamps.
 */

/**
 * Parse a timestamp string like "1:23" or "01:23" into seconds.
 */
function parseTimestamp(ts: string): number | null {
  const parts = ts.replace(/[^0-9:]/g, "").split(":")
  if (parts.length === 2) {
    const [min, sec] = parts.map(Number)
    if (!isNaN(min) && !isNaN(sec)) return min * 60 + sec
  }
  if (parts.length === 3) {
    const [hr, min, sec] = parts.map(Number)
    if (!isNaN(hr) && !isNaN(min) && !isNaN(sec)) return hr * 3600 + min * 60 + sec
  }
  return null
}

/**
 * Extract a single frame from a video at a given time (seconds).
 * Returns a base64 data URL (JPEG).
 */
function extractFrame(video: HTMLVideoElement, timeSec: number): Promise<string | null> {
  return new Promise((resolve) => {
    if (timeSec > video.duration) {
      resolve(null)
      return
    }

    const canvas = document.createElement("canvas")
    canvas.width = video.videoWidth
    canvas.height = video.videoHeight
    const ctx = canvas.getContext("2d")
    if (!ctx) {
      resolve(null)
      return
    }

    const onSeeked = () => {
      video.removeEventListener("seeked", onSeeked)
      ctx.drawImage(video, 0, 0, canvas.width, canvas.height)
      try {
        const dataUrl = canvas.toDataURL("image/jpeg", 0.85)
        resolve(dataUrl)
      } catch {
        resolve(null)
      }
    }

    video.addEventListener("seeked", onSeeked)
    video.currentTime = timeSec
  })
}

/**
 * Given a File (video) and an array of cards with videoTimestamp strings,
 * extract a frame for each card and return a map of cardId → base64 dataUrl.
 */
export async function extractFramesForCards(
  videoFile: File,
  cards: Array<{ id: string; videoTimestamp?: string }>
): Promise<Map<string, string>> {
  const frameMap = new Map<string, string>()

  // Create object URL for the video
  const objectUrl = URL.createObjectURL(videoFile)

  try {
    // Create a hidden video element
    const video = document.createElement("video")
    video.src = objectUrl
    video.crossOrigin = "anonymous"
    video.muted = true
    video.preload = "auto"

    // Wait for metadata to load
    await new Promise<void>((resolve, reject) => {
      video.onloadedmetadata = () => resolve()
      video.onerror = () => reject(new Error("Failed to load video"))
      // Timeout after 10s
      setTimeout(() => reject(new Error("Video load timeout")), 10000)
    })

    // Wait for enough data to seek
    await new Promise<void>((resolve) => {
      if (video.readyState >= 2) {
        resolve()
        return
      }
      video.oncanplay = () => resolve()
      setTimeout(() => resolve(), 3000)
    })

    // Extract frames for each card that has a timestamp
    for (const card of cards) {
      if (!card.videoTimestamp) continue

      const timeSec = parseTimestamp(card.videoTimestamp)
      if (timeSec === null) continue

      const frame = await extractFrame(video, timeSec)
      if (frame) {
        frameMap.set(card.id, frame)
      }
    }

    // Also extract evenly-spaced frames for cards without timestamps
    const cardsWithoutTimestamp = cards.filter((c) => !c.videoTimestamp)
    if (cardsWithoutTimestamp.length > 0 && video.duration > 0) {
      const interval = video.duration / (cardsWithoutTimestamp.length + 1)
      for (let i = 0; i < cardsWithoutTimestamp.length; i++) {
        const timeSec = interval * (i + 1)
        const frame = await extractFrame(video, timeSec)
        if (frame) {
          frameMap.set(cardsWithoutTimestamp[i].id, frame)
        }
      }
    }
  } finally {
    URL.revokeObjectURL(objectUrl)
  }

  return frameMap
}

/**
 * Given a File (video) and an array of videoCards (with optional startTimestamp/endTimestamp),
 * extract 8 evenly-spaced frames per videoCard and return a map of videoCardId → base64 dataUrl[].
 */
export async function extractFramesForVideoCards(
  videoFile: File,
  videoCards: Array<{ id: string; startTimestamp?: string; endTimestamp?: string; relatedCardIds?: string[] }>,
  allCards: Array<{ id: string; videoTimestamp?: string }>
): Promise<Map<string, string[]>> {
  const result = new Map<string, string[]>()
  if (!videoCards.length) return result

  const objectUrl = URL.createObjectURL(videoFile)

  try {
    const video = document.createElement("video")
    video.src = objectUrl
    video.crossOrigin = "anonymous"
    video.muted = true
    video.preload = "auto"

    await new Promise<void>((resolve, reject) => {
      video.onloadedmetadata = () => resolve()
      video.onerror = () => reject(new Error("Failed to load video"))
      setTimeout(() => reject(new Error("Video load timeout")), 10000)
    })

    await new Promise<void>((resolve) => {
      if (video.readyState >= 2) { resolve(); return }
      video.oncanplay = () => resolve()
      setTimeout(() => resolve(), 3000)
    })

    const duration = video.duration
    const framesPerCard = 8

    for (let i = 0; i < videoCards.length; i++) {
      const vc = videoCards[i]
      let startSec: number | null = null
      let endSec: number | null = null

      // Strategy 1: Use explicit timestamps
      if (vc.startTimestamp) startSec = parseTimestamp(vc.startTimestamp)
      if (vc.endTimestamp) endSec = parseTimestamp(vc.endTimestamp)

      // Strategy 2: Derive from relatedCardIds timestamps
      if ((startSec === null || endSec === null) && vc.relatedCardIds?.length) {
        const relatedTimes: number[] = []
        for (const cid of vc.relatedCardIds) {
          const card = allCards.find((c) => c.id === cid)
          if (card?.videoTimestamp) {
            const t = parseTimestamp(card.videoTimestamp)
            if (t !== null) relatedTimes.push(t)
          }
        }
        if (relatedTimes.length > 0) {
          if (startSec === null) startSec = Math.min(...relatedTimes)
          if (endSec === null) endSec = Math.max(...relatedTimes) + 10 // pad 10s after last card
        }
      }

      // Strategy 3: Evenly distribute across video
      if (startSec === null || endSec === null) {
        const segmentLen = duration / videoCards.length
        startSec = segmentLen * i
        endSec = segmentLen * (i + 1)
      }

      // Clamp to video duration
      startSec = Math.max(0, Math.min(startSec, duration - 1))
      endSec = Math.max(startSec + 1, Math.min(endSec, duration))

      const frames: string[] = []
      const interval = (endSec - startSec) / (framesPerCard + 1)
      for (let f = 1; f <= framesPerCard; f++) {
        const timeSec = startSec + interval * f
        const frame = await extractFrame(video, timeSec)
        if (frame) frames.push(frame)
      }

      if (frames.length > 0) {
        result.set(vc.id, frames)
      }
    }
  } finally {
    URL.revokeObjectURL(objectUrl)
  }

  return result
}

/**
 * Extract a thumbnail from the video at 10% duration for course cover.
 */
export async function extractVideoThumbnail(videoFile: File): Promise<string | null> {
  const objectUrl = URL.createObjectURL(videoFile)

  try {
    const video = document.createElement("video")
    video.src = objectUrl
    video.muted = true
    video.preload = "auto"

    await new Promise<void>((resolve, reject) => {
      video.onloadedmetadata = () => resolve()
      video.onerror = () => reject(new Error("Failed to load video"))
      setTimeout(() => reject(new Error("Video load timeout")), 10000)
    })

    await new Promise<void>((resolve) => {
      if (video.readyState >= 2) {
        resolve()
        return
      }
      video.oncanplay = () => resolve()
      setTimeout(() => resolve(), 3000)
    })

    return await extractFrame(video, video.duration * 0.1)
  } finally {
    URL.revokeObjectURL(objectUrl)
  }
}
