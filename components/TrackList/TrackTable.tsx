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
      <table className="w-full border-separate border-spacing-y-1 text-left">
        <thead>
          <tr className="text-aura-muted text-[10px] font-semibold tracking-[0.15em] uppercase">
            <th className="w-14 px-4 py-3 text-center">#</th>
            <th className="px-4 py-3">Title</th>
            <th className="hidden px-4 py-3 md:table-cell">Album</th>
            <th className="hidden px-4 py-3 lg:table-cell">Added</th>
            <th className="w-20 px-4 py-3 text-center">
              <Clock size={13} className="mx-auto" />
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
                className={`group cursor-pointer transition-all duration-200 ${
                  isCurrent
                    ? "bg-aura-primary/[0.08]"
                    : "hover:bg-white/[0.04]"
                }`}
                onClick={() => (isTrackPlaying ? onPause() : onPlay(track))}
              >
                <td className="rounded-l-xl px-4 py-3 text-center">
                  <div className="relative mx-auto flex h-4 w-4 items-center justify-center">
                    {isTrackPlaying ? (
                      <Volume2 size={14} className="text-aura-primary animate-pulse" />
                    ) : (
                      <>
                        <span
                          className={`font-mono text-[11px] transition-opacity group-hover:opacity-0 ${
                            isCurrent ? "text-aura-primary font-semibold" : "text-aura-muted"
                          }`}
                        >
                          {index + 1}
                        </span>
                        <Play
                          size={12}
                          className="absolute inset-0 text-white opacity-0 transition-opacity group-hover:opacity-100"
                          fill="currentColor"
                        />
                      </>
                    )}
                  </div>
                </td>

                <td className="px-4 py-2.5">
                  <div className="flex items-center gap-3">
                    <div className="h-9 w-9 flex-shrink-0 overflow-hidden rounded-lg bg-aura-surface border border-white/[0.06]">
                      <Image
                        src={track.artworkUrl100}
                        alt={track.trackName}
                        width={36}
                        height={36}
                        className="object-cover"
                      />
                    </div>
                    <div className="min-w-0">
                      <div
                        className={`truncate text-[13px] font-medium ${
                          isCurrent ? "text-aura-primary" : "text-white/90"
                        }`}
                      >
                        {track.trackName}
                      </div>
                      <div className="text-aura-muted truncate text-[11px]">
                        {track.artistName}
                      </div>
                    </div>
                  </div>
                </td>

                <td className="text-aura-muted hidden max-w-[200px] truncate px-4 py-3 text-[12px] md:table-cell">
                  {track.collectionName}
                </td>

                <td className="text-aura-muted hidden px-4 py-3 text-[11px] lg:table-cell">
                  {track.addedAt ? formatDistanceToNow(new Date(track.addedAt), { addSuffix: true }) : "Recent"}
                </td>

                <td className="rounded-r-xl px-4 py-3 text-center">
                  <div className="flex items-center justify-center gap-3">
                    <button
                      onClick={(e) => {
                        e.stopPropagation()
                        onToggleLike?.(track)
                      }}
                      className={`transition-all hover:scale-110 ${
                        likedSongIds.includes(track.trackId)
                          ? "text-aura-primary"
                          : "text-aura-muted opacity-0 group-hover:opacity-100 hover:text-white"
                      }`}
                    >
                      <Heart size={14} fill={likedSongIds.includes(track.trackId) ? "currentColor" : "none"} />
                    </button>

                    {onAddToPlaylist && playlists.length > 0 && (
                      <DropdownMenu.Root>
                        <DropdownMenu.Trigger asChild>
                          <button
                            onClick={(e) => e.stopPropagation()}
                            className="text-aura-muted opacity-0 transition-all group-hover:opacity-100 hover:text-white hover:scale-110"
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
                                onSelect={() => onAddToPlaylist(track, playlist.id)}
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
                </td>
              </tr>
            )
          })}
        </tbody>
      </table>
    </div>
  )
}
