"use client"

import { apiFetch } from "lib/api-client"
import { iTunesTrack } from "lib/itunes"
import { Playlist } from "lib/types"

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
