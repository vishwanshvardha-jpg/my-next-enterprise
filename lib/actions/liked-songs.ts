"use client"

import { apiFetch } from "lib/api-client"
import { iTunesTrack } from "lib/itunes"
import { LikedSong } from "lib/types"

export async function getLikedSongs(): Promise<LikedSong[]> {
  try {
    const data = await apiFetch("/library/liked")
    return (data as { track_id: number; created_at: string }[]).map(
      (item): LikedSong => ({
        trackId: item.track_id,
        createdAt: item.created_at,
        trackData: null,
      })
    )
  } catch (err) {
    console.error("Error fetching liked songs:", err)
    return []
  }
}

export async function toggleLikeSong(track: iTunesTrack, isCurrentlyLiked: boolean) {
  try {
    const result = (await apiFetch("/library/toggle-like", {
      method: "POST",
      body: JSON.stringify({ track, isLiked: isCurrentlyLiked }),
    })) as { status: string }
    return result.status === "liked"
  } catch (error) {
    console.error("Toggle Like Error:", error)
    throw error
  }
}
