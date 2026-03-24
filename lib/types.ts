import { iTunesTrack } from "./itunes"

export interface Playlist {
  id: string
  name: string
  description?: string
  image_url?: string
  user_id: string
  created_at: string
  trackCount?: number
  isShared?: boolean
}

export interface Collaborator {
  id: string
  user_id: string
  email: string
  role: string
  status: "pending" | "accepted" | "declined"
  created_at: string
}

export interface PendingInvite {
  id: string
  playlist_id: string
  playlist_name: string
  owner_user_id: string
  owner_email: string
  role: string
  created_at: string
}

export interface LikedSong {
  trackId: number
  createdAt: string
  trackData: iTunesTrack | null
}

export interface PlaylistSong {
  trackId: number
  position: number
  addedAt: string
}
