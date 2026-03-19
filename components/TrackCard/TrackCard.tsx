"use client"

import * as DropdownMenu from "@radix-ui/react-dropdown-menu"
import { Heart, ListMusic, Pause, Play, Plus } from "lucide-react"
import Image from "next/image"
import posthog from "posthog-js"
import { iTunesTrack } from "lib/itunes"
import { Playlist } from "lib/types"

interface TrackCardProps {
  track: iTunesTrack
  isPlaying: boolean
  isCurrentTrack: boolean
  onPlay: (track: iTunesTrack) => void
  onPause: () => void
  isLiked?: boolean
  onToggleLike?: (track: iTunesTrack) => void
  onAddToPlaylist?: (track: iTunesTrack, playlistId: string) => void
  playlists?: Playlist[]
}

export function TrackCard({
  track,
  isPlaying,
  isCurrentTrack,
  onPlay,
  onPause,
  isLiked = false,
  onToggleLike,
  onAddToPlaylist,
  playlists = [],
}: TrackCardProps) {
  const hasPreview = Boolean(track.previewUrl)

  const handleClick = () => {
    if (!hasPreview) return
    if (isCurrentTrack && isPlaying) {
      onPause()
    } else {
      posthog.capture("track_played", {
        track_id: track.trackId,
        track_name: track.trackName,
        artist_name: track.artistName,
        collection_name: track.collectionName,
      })
      onPlay(track)
    }
  }

  const handleLikeClick = (e: React.MouseEvent) => {
    e.stopPropagation()
    if (onToggleLike) {
      posthog.capture(isLiked ? "track_unliked" : "track_liked", {
        track_id: track.trackId,
        track_name: track.trackName,
        artist_name: track.artistName,
      })
      onToggleLike(track)
    }
  }

  return (
    <div
      className={`group relative flex w-full flex-col overflow-hidden rounded-2xl p-3 text-left transition-all duration-300 ${
        isCurrentTrack
          ? "bg-aura-primary/[0.06] glow-border"
          : "bg-white/[0.02] hover:bg-white/[0.05]"
      }`}
    >
      {/* Album Art */}
      <div className="bg-aura-surface relative mb-3.5 aspect-square w-full overflow-hidden rounded-xl">
        <Image
          src={track.artworkUrl100.replace("100x100bb.jpg", "400x400bb.jpg")}
          alt={track.trackName}
          fill
          sizes="(max-width: 640px) 50vw, (max-width: 1024px) 33vw, 200px"
          className="object-cover transition-transform duration-500 group-hover:scale-105"
        />

        {/* Play Overlay */}
        <div
          onClick={handleClick}
          className={`absolute inset-0 flex cursor-pointer items-center justify-center transition-all duration-400 ${
            isCurrentTrack && isPlaying ? "bg-black/40" : "bg-black/0 group-hover:bg-black/40"
          }`}
        >
          <div
            className={`flex h-11 w-11 transform items-center justify-center rounded-full bg-aura-primary text-black shadow-lg transition-all duration-400 ${
              isCurrentTrack && isPlaying
                ? "scale-100 opacity-100"
                : "scale-75 opacity-0 group-hover:scale-100 group-hover:opacity-100"
            }`}
            style={{ boxShadow: "0 0 20px rgba(0, 212, 170, 0.3)" }}
          >
            {isCurrentTrack && isPlaying ? (
              <Pause size={18} fill="currentColor" />
            ) : (
              <Play size={18} fill="currentColor" className="ml-0.5" />
            )}
          </div>
        </div>

        {/* Action Badges */}
        <div className="absolute top-2.5 right-2.5 flex flex-col gap-1.5">
          {onAddToPlaylist && playlists.length > 0 && (
            <DropdownMenu.Root>
              <DropdownMenu.Trigger asChild>
                <button
                  onClick={(e) => e.stopPropagation()}
                  className="flex h-8 w-8 items-center justify-center rounded-full bg-black/40 text-white backdrop-blur-sm opacity-0 transition-all duration-300 group-hover:opacity-100 hover:bg-black/60 hover:scale-110"
                >
                  <Plus size={14} />
                </button>
              </DropdownMenu.Trigger>
              <DropdownMenu.Portal>
                <DropdownMenu.Content
                  className="glass-dark z-[100] min-w-[180px] rounded-xl p-1.5 shadow-2xl animate-in fade-in slide-in-from-top-1"
                  sideOffset={5}
                  align="end"
                >
                  {playlists.map((playlist) => (
                    <DropdownMenu.Item
                      key={playlist.id}
                      className="flex cursor-pointer items-center gap-2.5 rounded-lg px-3 py-2 text-[13px] font-medium text-white transition-colors outline-none hover:bg-white/10"
                      onSelect={() => {
                        posthog.capture("track_added_to_playlist", {
                          track_id: track.trackId,
                          track_name: track.trackName,
                          artist_name: track.artistName,
                          playlist_id: playlist.id,
                          playlist_name: playlist.name,
                        })
                        onAddToPlaylist(track, playlist.id)
                      }}
                    >
                      <ListMusic size={14} className="text-aura-primary" />
                      <span className="truncate">{playlist.name}</span>
                    </DropdownMenu.Item>
                  ))}
                </DropdownMenu.Content>
              </DropdownMenu.Portal>
            </DropdownMenu.Root>
          )}
        </div>
      </div>

      {/* Track Info */}
      <div className="flex items-start justify-between gap-2 px-1">
        <div className="min-w-0 flex-1">
          <h4
            className={`mb-0.5 truncate text-[13px] font-semibold leading-tight transition-colors ${
              isCurrentTrack ? "text-aura-primary" : "group-hover:text-white text-white/90"
            }`}
          >
            {track.trackName}
          </h4>
          <p className="text-aura-muted truncate text-[11px] font-medium">
            {track.artistName}
          </p>
        </div>
        <button
          onClick={handleLikeClick}
          className={`mt-0.5 transition-all duration-300 ${
            isLiked
              ? "text-aura-primary scale-110"
              : "text-aura-muted opacity-0 group-hover:opacity-100 hover:text-white"
          }`}
        >
          <Heart size={14} fill={isLiked ? "currentColor" : "none"} />
        </button>
      </div>
    </div>
  )
}
