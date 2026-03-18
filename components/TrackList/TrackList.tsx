"use client"

import { SearchX } from "lucide-react"

import { TrackCard } from "components/TrackCard/TrackCard"
import { TrackCardSkeleton } from "components/TrackCardSkeleton/TrackCardSkeleton"
import { iTunesTrack } from "lib/itunes"
import { Playlist } from "lib/types"

import { TrackTable } from "./TrackTable"

interface TrackListProps {
  tracks: (iTunesTrack & { addedAt?: string })[]
  currentTrackId: number | null
  viewMode?: "grid" | "list"
  isPlaying: boolean
  onPlay: (track: iTunesTrack) => void
  onPause: () => void
  isLoading: boolean
  likedSongIds?: number[]
  onToggleLike?: (track: iTunesTrack) => void
  onAddToPlaylist?: (track: iTunesTrack, playlistId: string) => void
  playlists?: Playlist[]
}

export function TrackList({
  tracks,
  currentTrackId,
  viewMode = "grid",
  isPlaying,
  onPlay,
  onPause,
  isLoading,
  likedSongIds = [],
  onToggleLike,
  onAddToPlaylist,
  playlists = [],
}: TrackListProps) {
  if (isLoading) {
    return (
      <div className="grid grid-cols-[repeat(auto-fill,minmax(140px,1fr))] gap-5">
        {Array.from({ length: 14 }).map((_, i) => (
          <TrackCardSkeleton key={i} />
        ))}
      </div>
    )
  }

  if (tracks.length === 0) {
    return (
      <div
        id="no-results"
        className="flex flex-col items-center justify-center py-32 text-center"
      >
        <div className="mb-5 flex h-16 w-16 items-center justify-center rounded-2xl bg-white/[0.04] border border-white/[0.06]">
          <SearchX className="h-7 w-7 text-aura-muted" />
        </div>
        <h2 className="mb-2 font-display text-lg font-bold text-white">No tracks found</h2>
        <p className="text-sm text-aura-muted">Try a different search to find your vibe.</p>
      </div>
    )
  }

  if (viewMode === "list") {
    return (
      <TrackTable
        tracks={tracks}
        currentTrackId={currentTrackId}
        isPlaying={isPlaying}
        onPlay={onPlay}
        onPause={onPause}
        likedSongIds={likedSongIds}
        onToggleLike={onToggleLike}
        onAddToPlaylist={onAddToPlaylist}
        playlists={playlists}
      />
    )
  }

  return (
    <div
      id="track-list"
      className="grid grid-cols-[repeat(auto-fill,minmax(140px,1fr))] gap-5"
    >
      {tracks.map((track) => {
        if (!track) return null
        return (
          <TrackCard
            key={track.trackId}
            track={track}
            isPlaying={isPlaying && currentTrackId === track.trackId}
            isCurrentTrack={currentTrackId === track.trackId}
            onPlay={onPlay}
            onPause={onPause}
            isLiked={likedSongIds.includes(track.trackId)}
            onToggleLike={onToggleLike}
            onAddToPlaylist={onAddToPlaylist}
            playlists={playlists}
          />
        )
      })}
    </div>
  )
}
