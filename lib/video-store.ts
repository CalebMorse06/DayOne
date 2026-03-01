/**
 * Persistent video store using IndexedDB + in-memory cache.
 *
 * Stores uploaded video Files in IndexedDB so they survive page
 * refreshes and HMR. An in-memory blob URL cache avoids creating
 * duplicate blob URLs on every access.
 */

const DB_NAME = "dayone-videos"
const STORE_NAME = "files"
const DB_VERSION = 1

// In-memory caches (survive HMR via window)
interface VideoStoreWindow {
  __dayoneBlobUrls?: Map<string, string>
}

function getBlobCache(): Map<string, string> {
  if (typeof window === "undefined") return new Map()
  const w = window as unknown as VideoStoreWindow
  if (!w.__dayoneBlobUrls) w.__dayoneBlobUrls = new Map()
  return w.__dayoneBlobUrls
}

function openDB(): Promise<IDBDatabase> {
  return new Promise((resolve, reject) => {
    const req = indexedDB.open(DB_NAME, DB_VERSION)
    req.onupgradeneeded = () => {
      const db = req.result
      if (!db.objectStoreNames.contains(STORE_NAME)) {
        db.createObjectStore(STORE_NAME)
      }
    }
    req.onsuccess = () => resolve(req.result)
    req.onerror = () => reject(req.error)
  })
}

/** Store a video File keyed by module ID (persists to IndexedDB) */
export async function storeVideoFile(moduleId: string, file: File) {
  // Create and cache blob URL immediately
  const url = URL.createObjectURL(file)
  getBlobCache().set(moduleId, url)

  // Persist to IndexedDB
  try {
    const db = await openDB()
    const tx = db.transaction(STORE_NAME, "readwrite")
    tx.objectStore(STORE_NAME).put(file, moduleId)
    // Also store under a "latest" key for easy fallback
    tx.objectStore(STORE_NAME).put(file, "__latest__")
  } catch {
    // IndexedDB failure is non-fatal — in-memory still works
  }
}

/** Retrieve a stored video File */
export async function getVideoFile(moduleId: string): Promise<File | null> {
  try {
    const db = await openDB()
    return new Promise((resolve) => {
      const tx = db.transaction(STORE_NAME, "readonly")
      const req = tx.objectStore(STORE_NAME).get(moduleId)
      req.onsuccess = () => resolve(req.result || null)
      req.onerror = () => resolve(null)
    })
  } catch {
    return null
  }
}

/**
 * Get a stable blob URL for a stored video.
 * Checks in-memory cache first, then loads from IndexedDB.
 * If moduleId is empty, returns the latest available video.
 */
export function getVideoObjectUrl(moduleId: string): string | null {
  const cache = getBlobCache()

  // Check cache with specific key
  if (moduleId) {
    const cached = cache.get(moduleId)
    if (cached) return cached
  }

  // Check cache for any entry
  const firstCached = moduleId ? null : (cache.values().next().value as string | undefined)
  if (firstCached) return firstCached

  return null
}

/**
 * Async version that falls back to IndexedDB if in-memory cache is empty.
 * Call this on page load to hydrate the cache.
 */
export async function resolveVideoUrl(moduleId: string): Promise<string | null> {
  // Try in-memory first
  const cached = getVideoObjectUrl(moduleId)
  if (cached) return cached

  // Try IndexedDB
  try {
    const key = moduleId || "__latest__"
    const file = await getVideoFile(key)
    if (!file) {
      // Try latest as fallback
      if (moduleId) {
        const latest = await getVideoFile("__latest__")
        if (latest) {
          const url = URL.createObjectURL(latest)
          getBlobCache().set(moduleId || "__latest__", url)
          return url
        }
      }
      return null
    }
    const url = URL.createObjectURL(file)
    getBlobCache().set(moduleId || "__latest__", url)
    return url
  } catch {
    return null
  }
}
