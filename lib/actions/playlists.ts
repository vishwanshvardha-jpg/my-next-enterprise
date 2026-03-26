"use client"

import { apiFetch } from "lib/api-client"
import { iTunesTrack } from "lib/itunes"
import { Collaborator, PendingInvite, Playlist, PlaylistSong } from "lib/types"
import { lookupTracks } from "lib/actions/tracks"

export async function getPlaylists(): Promise<Playlist[]> {
  try {
    const data = await apiFetch("/playlists")
    return data as Playlist[]
  } catch (err) {
    console.error("Error fetching playlists:", err)
    return []
  }
}

export async function createPlaylist(name: string, description: string, imageUrl?: string): Promise<Playlist> {
  try {
    const data = await apiFetch("/playlists", {
      method: "POST",
      body: JSON.stringify({ name, description, image_url: imageUrl }),
    })
    return data as Playlist
  } catch (err) {
    console.error("Error creating playlist:", err)
    throw err
  }
}

export async function deletePlaylist(id: string): Promise<void> {
  try {
    await apiFetch(`/playlists/${id}`, {
      method: "DELETE",
    })
  } catch (err) {
    console.error("Error deleting playlist:", err)
    throw err
  }
}

export async function getPlaylistSongs(playlistId: string): Promise<PlaylistSong[]> {
  try {
    const data = await apiFetch(`/playlists/${playlistId}/songs`)
    return (data as { track_id: number; position: number; added_at: string }[]).map(row => ({
      trackId: row.track_id,
      position: row.position,
      addedAt: row.added_at,
    }))
  } catch (err) {
    console.error("Error fetching playlist songs:", err)
    return []
  }
}

export async function addSongToPlaylist(playlistId: string, track: iTunesTrack): Promise<void> {
  try {
    await apiFetch(`/playlists/add-song`, {
      method: "POST",
      body: JSON.stringify({ playlistId, track }),
    })
  } catch (err) {
    console.error("Error adding song to playlist:", err)
    throw err
  }
}

export async function getCollaborators(playlistId: string): Promise<Collaborator[]> {
  try {
    const data = await apiFetch(`/playlists/${playlistId}/collaborators`)
    return data as Collaborator[]
  } catch (err) {
    console.error("Error fetching collaborators:", err)
    return []
  }
}

export async function addCollaborator(playlistId: string, email: string): Promise<void> {
  try {
    await apiFetch(`/playlists/${playlistId}/collaborators`, {
      method: "POST",
      body: JSON.stringify({ email }),
    })
  } catch (err) {
    console.error("Error adding collaborator:", err)
    throw err
  }
}

export async function removeCollaborator(playlistId: string, userId: string): Promise<void> {
  try {
    await apiFetch(`/playlists/${playlistId}/collaborators/${userId}`, {
      method: "DELETE",
    })
  } catch (err) {
    console.error("Error removing collaborator:", err)
    throw err
  }
}

export async function getPendingInvites(): Promise<PendingInvite[]> {
  try {
    const data = await apiFetch("/playlists/invites/pending")
    return data as PendingInvite[]
  } catch (err) {
    console.error("Error fetching pending invites:", err)
    return []
  }
}

export async function updatePlaylist(id: string, imageUrl: string): Promise<void> {
  try {
    await apiFetch(`/playlists/${id}`, {
      method: "PATCH",
      body: JSON.stringify({ image_url: imageUrl }),
    })
  } catch (err) {
    console.error("Error updating playlist:", err)
    throw err
  }
}

export async function leavePlaylist(id: string): Promise<void> {
  try {
    await apiFetch(`/playlists/${id}/leave`, {
      method: "DELETE",
    })
  } catch (err) {
    console.error("Error leaving playlist:", err)
    throw err
  }
}

export async function respondToInvite(playlistId: string, status: "accepted" | "declined"): Promise<void> {
  try {
    await apiFetch(`/playlists/${playlistId}/collaborators/respond`, {
      method: "PATCH",
      body: JSON.stringify({ status }),
    })
  } catch (err) {
    console.error("Error responding to invite:", err)
    throw err
  }
}

export async function generateShareToken(playlistId: string): Promise<string> {
  const data = await apiFetch(`/playlists/${playlistId}/share-token`, { method: "POST" })
  return (data as { token: string }).token
}

export async function sendShareEmail(playlistId: string, email: string): Promise<void> {
  await apiFetch(`/playlists/${playlistId}/share-email`, {
    method: "POST",
    body: JSON.stringify({ email }),
  })
}

export async function getPublicSharedPlaylist(token: string): Promise<{ playlist: Playlist; tracks: iTunesTrack[] } | null> {
  const BACKEND_URL = `${process.env.NEXT_PUBLIC_API_BASE || "http://localhost:4000"}/v1`
  try {
    const res = await fetch(`${BACKEND_URL}/playlists/share/${token}`)
    if (!res.ok) return null
    const data = await res.json() as {
      playlist: Playlist
      tracks: { track_id: number; position: number; added_at: string }[]
    }
    if (!data.tracks.length) return { playlist: data.playlist, tracks: [] }
    const trackMap = await lookupTracks(data.tracks.map((s) => s.track_id))
    const tracks = data.tracks
      .filter((s) => trackMap.has(s.track_id))
      .map((s) => ({ ...trackMap.get(s.track_id)!, addedAt: s.added_at }))
    return { playlist: data.playlist, tracks }
  } catch {
    return null
  }
}
