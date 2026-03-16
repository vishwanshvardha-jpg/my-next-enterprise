"use client"

import { formatDistanceToNow } from "date-fns"
import * as DropdownMenu from "@radix-ui/react-dropdown-menu"
import { Clock, Heart, Music, Play, Pause, Volume2, Plus, ListMusic } from "lucide-react"
import Image from "next/image"
import { iTunesTrack } from "lib/itunes"
import { Playlist } from "lib/types"

interface TrackTableProps {
  tracks: (iTunesTrack & { addedAt?: string })[]
  currentTrackId: number | null
  isPlaying: boolean
  onPlay: (track: iTunesTrack) => void
  onPause: () => void
  likedSongIds: number[]
  onToggleLike?: (track: iTunesTrack) => void
  onAddToPlaylist?: (track: iTunesTrack, playlistId: string) => void
  playlists?: Playlist[]
}

export function TrackTable({
  tracks,
  currentTrackId,
  isPlaying,
  onPlay,
  onPause,
  likedSongIds,
  onToggleLike,
  onAddToPlaylist,
  playlists = [],
}: TrackTableProps) {
  return (
    <div className="w-full">
      <table className="w-full text-left border-separate border-spacing-y-2">
        <thead>
          <tr className="text-aura-muted text-[10px] font-black uppercase tracking-[0.2em]">
            <th className="px-6 py-4 w-16 text-center">#</th>
            <th className="px-4 py-4">Title</th>
            <th className="px-4 py-4 hidden md:table-cell">Album</th>
            <th className="px-4 py-4 hidden lg:table-cell">Added</th>
            <th className="px-6 py-4 w-20 text-center">
              <Clock size={14} className="mx-auto" />
            </th>
          </tr>
        </thead>
        <tbody>
          {tracks.map((track, index) => {
            const isCurrent = currentTrackId === track.trackId
            const isTrackPlaying = isCurrent && isPlaying

            return (
              <tr 
                key={`${track.trackId}-${index}`}
                className={`group transition-all duration-300 cursor-pointer ${
                  isCurrent ? "bg-white/10" : "hover:bg-white/5"
                }`}
                onClick={() => isTrackPlaying ? onPause() : onPlay(track)}
              >
                <td className="px-6 py-4 rounded-l-2xl text-center">
                  <div className="relative h-4 w-4 mx-auto flex items-center justify-center">
                    {isTrackPlaying ? (
                       <Volume2 size={16} className="text-aura-primary animate-pulse" />
                    ) : (
                      <>
                        <span className={`text-[11px] font-mono font-bold group-hover:opacity-0 transition-opacity ${isCurrent ? "text-aura-primary" : "text-aura-muted"}`}>
                          {index + 1}
                        </span>
                        <Play size={14} className="absolute inset-0 opacity-0 group-hover:opacity-100 transition-opacity text-white" fill="currentColor" />
                      </>
                    )}
                  </div>
                </td>
                
                <td className="px-4 py-3">
                  <div className="flex items-center gap-4">
                    <div className="h-10 w-10 flex-shrink-0 rounded-lg overflow-hidden bg-aura-elevated border border-white/5 shadow-md">
                      <Image 
                        src={track.artworkUrl100} 
                        alt={track.trackName} 
                        width={40} 
                        height={40} 
                        className="object-cover"
                      />
                    </div>
                    <div className="min-w-0">
                      <div className={`text-sm font-bold truncate ${isCurrent ? "text-aura-primary font-black" : "text-white"}`}>
                        {track.trackName}
                      </div>
                      <div className="text-[10px] font-medium text-aura-muted uppercase tracking-widest truncate">{track.artistName}</div>
                    </div>
                  </div>
                </td>

                <td className="px-4 py-4 text-aura-muted text-xs font-medium hidden md:table-cell truncate max-w-[200px]">
                  {track.collectionName}
                </td>

                <td className="px-4 py-4 text-aura-muted text-[10px] font-bold uppercase tracking-widest hidden lg:table-cell">
                  {track.addedAt ? formatDistanceToNow(new Date(track.addedAt), { addSuffix: true }) : "Recent"}
                </td>

                <td className="px-6 py-4 rounded-r-2xl text-center">
                  <div className="flex items-center justify-center gap-4">
                    <button
                      onClick={(e) => {
                        e.stopPropagation()
                        onToggleLike?.(track)
                      }}
                      className={`transition-all hover:scale-125 active:scale-95 ${
                        likedSongIds.includes(track.trackId) ? "text-aura-primary" : "text-aura-muted hover:text-white"
                      }`}
                    >
                      <Heart size={16} fill={likedSongIds.includes(track.trackId) ? "currentColor" : "none"} />
                    </button>

                    {onAddToPlaylist && playlists.length > 0 && (
                      <DropdownMenu.Root>
                        <DropdownMenu.Trigger asChild>
                          <button 
                            onClick={(e) => e.stopPropagation()}
                            className="text-aura-muted hover:text-white transition-all hover:scale-125 active:scale-95"
                          >
                            <Plus size={16} />
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
                </td>
              </tr>
            )
          })}
        </tbody>
      </table>
    </div>
  )
}
