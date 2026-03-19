"use client"

import { apiFetch } from "lib/api-client"
import { iTunesTrack } from "lib/itunes"
import { Collaborator, PendingInvite, Playlist } from "lib/types"

export async function getPlaylists(): Promise<Playlist[]> {
  try {
    const data = await apiFetch("/playlists")
    return data as Playlist[]
  } catch (err) {
    console.error("Error fetching playlists:", err)
    return []
  }
}

export async function createPlaylist(name: string, _description: string): Promise<Playlist> {
  try {
    const data = await apiFetch("/playlists", {
      method: "POST",
      body: JSON.stringify({ name }),
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

export async function getPlaylistSongs(playlistId: string): Promise<iTunesTrack[]> {
  try {
    const data = await apiFetch(`/playlists/${playlistId}/songs`)
    return data as iTunesTrack[]
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
