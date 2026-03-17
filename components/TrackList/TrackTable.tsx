"use client"

import * as DropdownMenu from "@radix-ui/react-dropdown-menu"
import { formatDistanceToNow } from "date-fns"
import { Clock, Heart, ListMusic, Play, Plus, Volume2 } from "lucide-react"
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
      <table className="w-full border-separate border-spacing-y-2 text-left">
        <thead>
          <tr className="text-aura-muted text-[10px] font-black tracking-[0.2em] uppercase">
            <th className="w-16 px-6 py-4 text-center">#</th>
            <th className="px-4 py-4">Title</th>
            <th className="hidden px-4 py-4 md:table-cell">Album</th>
            <th className="hidden px-4 py-4 lg:table-cell">Added</th>
            <th className="w-20 px-6 py-4 text-center">
              <Clock size={14} className="mx-auto" />
            </th>
          </tr>
        </thead>
        <tbody>
          {tracks.map((track, index) => {
            if (!track) return null
            const isCurrent = currentTrackId === track.trackId
            const isTrackPlaying = isCurrent && isPlaying

            return (
              <tr
                key={`${track.trackId}-${index}`}
                className={`group cursor-pointer transition-all duration-300 ${
                  isCurrent ? "bg-white/10" : "hover:bg-white/5"
                }`}
                onClick={() => (isTrackPlaying ? onPause() : onPlay(track))}
              >
                <td className="rounded-l-2xl px-6 py-4 text-center">
                  <div className="relative mx-auto flex h-4 w-4 items-center justify-center">
                    {isTrackPlaying ? (
                      <Volume2 size={16} className="text-aura-primary animate-pulse" />
                    ) : (
                      <>
                        <span
                          className={`font-mono text-[11px] font-bold transition-opacity group-hover:opacity-0 ${
                            isCurrent ? "text-aura-primary" : "text-aura-muted"
                          }`}
                        >
                          {index + 1}
                        </span>
                        <Play
                          size={14}
                          className="absolute inset-0 text-white opacity-0 transition-opacity group-hover:opacity-100"
                          fill="currentColor"
                        />
                      </>
                    )}
                  </div>
                </td>

                <td className="px-4 py-3">
                  <div className="flex items-center gap-4">
                    <div className="bg-aura-elevated h-10 w-10 flex-shrink-0 overflow-hidden rounded-lg border border-white/5 shadow-md">
                      <Image
                        src={track.artworkUrl100}
                        alt={track.trackName}
                        width={40}
                        height={40}
                        className="object-cover"
                      />
                    </div>
                    <div className="min-w-0">
                      <div
                        className={`truncate text-sm font-bold ${
                          isCurrent ? "text-aura-primary font-black" : "text-white"
                        }`}
                      >
                        {track.trackName}
                      </div>
                      <div className="text-aura-muted truncate text-[10px] font-medium tracking-widest uppercase">
                        {track.artistName}
                      </div>
                    </div>
                  </div>
                </td>

                <td className="text-aura-muted hidden max-w-[200px] truncate px-4 py-4 text-xs font-medium md:table-cell">
                  {track.collectionName}
                </td>

                <td className="text-aura-muted hidden px-4 py-4 text-[10px] font-bold tracking-widest uppercase lg:table-cell">
                  {track.addedAt ? formatDistanceToNow(new Date(track.addedAt), { addSuffix: true }) : "Recent"}
                </td>

                <td className="rounded-r-2xl px-6 py-4 text-center">
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
                            className="text-aura-muted transition-all hover:scale-125 hover:text-white active:scale-95"
                          >
                            <Plus size={16} />
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
