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
      className={`group relative flex w-full flex-col overflow-hidden rounded-[2rem] p-4 text-left transition-all duration-500 hover:bg-white/5 ${
        isCurrentTrack ? "bg-white/5" : "bg-transparent"
      }`}
    >
      <div className="bg-aura-surface relative mb-5 aspect-square w-full overflow-hidden rounded-[1.5rem] shadow-2xl">
        <Image
          src={track.artworkUrl100.replace("100x100bb.jpg", "400x400bb.jpg")}
          alt={track.trackName}
          fill
          sizes="(max-width: 640px) 50vw, (max-width: 1024px) 33vw, 200px"
          className="object-cover transition-transform duration-700 group-hover:scale-110"
        />

        {/* Play Overlay */}
        <div
          onClick={handleClick}
          className={`absolute inset-0 flex cursor-pointer items-center justify-center transition-all duration-500 ${
            isCurrentTrack && isPlaying ? "bg-black/40" : "bg-black/0 group-hover:bg-black/40"
          }`}
        >
          <div
            className={`flex h-14 w-14 transform items-center justify-center rounded-full bg-white text-black shadow-xl transition-all duration-500 ${
              isCurrentTrack && isPlaying
                ? "scale-100 opacity-100"
                : "scale-75 opacity-0 group-hover:scale-100 group-hover:opacity-100"
            }`}
          >
            {isCurrentTrack && isPlaying ? (
              <Pause size={24} fill="currentColor" />
            ) : (
              <Play size={24} fill="currentColor" className="ml-1" />
            )}
          </div>
        </div>

        {/* Action Badges */}
        <div className="absolute top-3 right-3 flex flex-col gap-2">
          {onAddToPlaylist && playlists.length > 0 && (
            <DropdownMenu.Root>
              <DropdownMenu.Trigger asChild>
                <button
                  onClick={(e) => e.stopPropagation()}
                  className="glass flex h-10 w-10 items-center justify-center rounded-full text-white opacity-0 transition-all duration-300 group-hover:opacity-100 hover:scale-110 active:scale-95"
                >
                  <Plus size={18} />
                </button>
              </DropdownMenu.Trigger>
              <DropdownMenu.Portal>
                <DropdownMenu.Content
                  className="glass-dark animate-in fade-in slide-in-from-top-1 z-[100] min-w-[180px] rounded-2xl p-2 shadow-2xl"
                  sideOffset={5}
                  align="end"
                >
                  {playlists.map((playlist) => (
                    <DropdownMenu.Item
                      key={playlist.id}
                      className="flex cursor-pointer items-center gap-3 rounded-xl px-3 py-2 text-sm font-bold text-white transition-colors outline-none hover:bg-white/10"
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
                      <ListMusic size={16} className="text-aura-primary" />
                      <span className="truncate">{playlist.name}</span>
                    </DropdownMenu.Item>
                  ))}
                </DropdownMenu.Content>
              </DropdownMenu.Portal>
            </DropdownMenu.Root>
          )}
        </div>
      </div>

      <div className="flex items-start justify-between gap-2 px-2">
        <div className="min-w-0 flex-1">
          <h4
            className={`font-display mb-1 truncate text-base font-bold transition-colors ${
              isCurrentTrack ? "text-aura-primary" : "group-hover:text-aura-primary text-white"
            }`}
          >
            {track.trackName}
          </h4>
          <p className="text-aura-muted truncate text-[10px] font-black tracking-[0.15em] uppercase">
            {track.artistName}
          </p>
        </div>
        <button
          onClick={handleLikeClick}
          className={`mt-1 transition-all duration-300 ${
            isLiked
              ? "text-aura-primary scale-110"
              : "text-aura-muted opacity-0 group-hover:opacity-100 hover:text-white"
          }`}
        >
          <Heart size={18} fill={isLiked ? "currentColor" : "none"} />
        </button>
      </div>
    </div>
  )
}
