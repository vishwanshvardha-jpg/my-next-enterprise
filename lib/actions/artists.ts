"use client"

import { apiFetch } from "lib/api-client"

export interface FollowedArtistRecord {
  id: string
  artist_name: string
  artwork_url: string
  created_at: string
}

export async function getFollowedArtists(): Promise<FollowedArtistRecord[]> {
  try {
    const data = await apiFetch("/artists")
    return data as FollowedArtistRecord[]
  } catch (err) {
    console.error("Error fetching followed artists:", err)
    return []
  }
}

export async function toggleFollowArtist(
  artistName: string,
  artworkUrl: string
): Promise<{ status: "followed" | "unfollowed" }> {
  const data = await apiFetch("/artists/toggle", {
    method: "POST",
    body: JSON.stringify({ artistName, artworkUrl }),
  })
  return data as { status: "followed" | "unfollowed" }
}
