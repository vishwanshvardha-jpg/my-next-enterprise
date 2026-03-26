"use client"

import { iTunesTrack } from "lib/itunes"

const BACKEND_URL = process.env.NEXT_PUBLIC_API_BASE || "http://localhost:4000"

const CACHE_TTL_MS = 7 * 24 * 60 * 60 * 1000 // 7 days
const CACHE_PREFIX = "itunes_track_"

function getCached(id: number): iTunesTrack | null {
  try {
    const raw = localStorage.getItem(CACHE_PREFIX + id)
    if (!raw) return null
    const { data, cachedAt } = JSON.parse(raw) as { data: iTunesTrack; cachedAt: number }
    if (Date.now() - cachedAt > CACHE_TTL_MS) {
      localStorage.removeItem(CACHE_PREFIX + id)
      return null
    }
    return data
  } catch {
    return null
  }
}

function setCached(track: iTunesTrack): void {
  try {
    localStorage.setItem(
      CACHE_PREFIX + track.trackId,
      JSON.stringify({ data: track, cachedAt: Date.now() })
    )
  } catch {
    // localStorage quota exceeded — fail silently
  }
}

export async function lookupTracks(trackIds: number[]): Promise<Map<number, iTunesTrack>> {
  if (trackIds.length === 0) return new Map()

  const result = new Map<number, iTunesTrack>()
  const missing: number[] = []

  for (const id of trackIds) {
    const hit = getCached(id)
    if (hit) result.set(id, hit)
    else missing.push(id)
  }

  if (missing.length > 0) {
    try {
      const res = await fetch(`${BACKEND_URL}/v1/tracks/lookup?ids=${missing.join(",")}`)
      if (!res.ok) throw new Error("Track lookup failed")
      const data = (await res.json()) as {
        tracks: iTunesTrack[]
      }
      data.tracks.forEach((t) => {
        result.set(t.trackId, t)
        setCached(t)
      })
    } catch (err) {
      console.error("Track lookup failed:", err)
    }
  }

  return result
}
