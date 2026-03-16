"use client"

import * as DropdownMenu from "@radix-ui/react-dropdown-menu"
import { Heart, ListMusic, Plus, Play, Pause } from "lucide-react"
import Image from "next/image"
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
  playlists = []
}: TrackCardProps) {
  const hasPreview = Boolean(track.previewUrl)

  const handleClick = () => {
    if (!hasPreview) return
    if (isCurrentTrack && isPlaying) {
      onPause()
    } else {
      onPlay(track)
    }
  }

  const handleLikeClick = (e: React.MouseEvent) => {
    e.stopPropagation()
    if (onToggleLike) {
      onToggleLike(track)
    }
  }

  return (
    <div
      className={`group relative flex w-full flex-col overflow-hidden rounded-[2rem] p-4 text-left transition-all duration-500 hover:bg-white/5 ${
        isCurrentTrack ? "bg-white/5" : "bg-transparent"
      }`}
    >
      <div className="relative mb-5 aspect-square w-full overflow-hidden rounded-[1.5rem] bg-aura-surface shadow-2xl">
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
          className={`absolute inset-0 flex items-center justify-center transition-all duration-500 cursor-pointer ${
            isCurrentTrack && isPlaying ? "bg-black/40" : "bg-black/0 group-hover:bg-black/40"
          }`}
        >
          <div className={`h-14 w-14 rounded-full bg-white text-black flex items-center justify-center transform transition-all duration-500 shadow-xl ${
            isCurrentTrack && isPlaying 
              ? "opacity-100 scale-100" 
              : "opacity-0 scale-75 group-hover:opacity-100 group-hover:scale-100"
          }`}>
            {isCurrentTrack && isPlaying ? <Pause size={24} fill="currentColor" /> : <Play size={24} fill="currentColor" className="ml-1" />}
          </div>
        </div>

        {/* Action Badges */}
        <div className="absolute top-3 right-3 flex flex-col gap-2">
          {onAddToPlaylist && playlists.length > 0 && (
            <DropdownMenu.Root>
              <DropdownMenu.Trigger asChild>
                <button 
                  onClick={(e) => e.stopPropagation()}
                  className="h-10 w-10 rounded-full glass flex items-center justify-center opacity-0 group-hover:opacity-100 transition-all duration-300 hover:scale-110 active:scale-95 text-white"
                >
                  <Plus size={18} />
                </button>
              </DropdownMenu.Trigger>
              <DropdownMenu.Portal>
                <DropdownMenu.Content
                  className="min-w-[180px] glass-dark rounded-2xl p-2 shadow-2xl animate-in fade-in slide-in-from-top-1 z-[100]"
                  sideOffset={5}
                  align="end"
                >
                  {playlists.map((playlist) => (
                    <DropdownMenu.Item
                      key={playlist.id}
                      className="flex items-center gap-3 px-3 py-2 rounded-xl text-sm font-bold text-white hover:bg-white/10 outline-none cursor-pointer transition-colors"
                      onSelect={() => onAddToPlaylist(track, playlist.id)}
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
          <h4 className={`font-display font-bold truncate text-base mb-1 transition-colors ${isCurrentTrack ? "text-aura-primary" : "text-white group-hover:text-aura-primary"}`}>
            {track.trackName}
          </h4>
          <p className="text-[10px] font-black text-aura-muted uppercase tracking-[0.15em] truncate">
            {track.artistName}
          </p>
        </div>
        <button
          onClick={handleLikeClick}
          className={`mt-1 transition-all duration-300 ${isLiked ? "text-aura-primary scale-110" : "text-aura-muted hover:text-white opacity-0 group-hover:opacity-100"}`}
        >
          <Heart size={18} fill={isLiked ? "currentColor" : "none"} />
        </button>
      </div>
    </div>
  )
}
