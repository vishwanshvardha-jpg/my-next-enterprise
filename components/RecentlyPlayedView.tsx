"use client"

import { Clock, Play, Search, X } from "lucide-react"
import Image from "next/image"
import { useEffect, useRef, useState } from "react"
import { useAuth } from "components/Providers/AuthProvider"
import { iTunesTrack } from "lib/itunes"
import { usePlaybackStore } from "lib/store"

export type RecentTrack = iTunesTrack & { playedAt?: number }

function getDateGroup(playedAt?: number): "today" | "yesterday" | "thisweek" {
  if (!playedAt) return "thisweek"
  const now = new Date()
  const played = new Date(playedAt)
  if (played.toDateString() === now.toDateString()) return "today"
  const yesterday = new Date(now)
  yesterday.setDate(now.getDate() - 1)
  if (played.toDateString() === yesterday.toDateString()) return "yesterday"
  return "thisweek"
}

function formatTimeAgo(playedAt?: number): string {
  if (!playedAt) return ""
  const diff = Date.now() - playedAt
  const mins = Math.floor(diff / 60000)
  const hours = Math.floor(diff / 3600000)
  if (mins < 1) return "Just now"
  if (mins < 60) return `${mins} min ago`
  if (hours < 24) return `${hours} hr ago`
  const d = new Date(playedAt)
  const yesterday = new Date()
  yesterday.setDate(yesterday.getDate() - 1)
  if (d.toDateString() === yesterday.toDateString()) {
    return `Yesterday, ${d.toLocaleTimeString([], { hour: "2-digit", minute: "2-digit" })}`
  }
  return d.toLocaleString([], { weekday: "short", hour: "2-digit", minute: "2-digit" })
}

interface RecentlyPlayedViewProps {
  recentlyPlayed: RecentTrack[]
  onPlayFromCard: (track: iTunesTrack, context: "recent") => void
  handleToggleLike: (track: iTunesTrack) => Promise<void>
  likedSongIds: number[]
}

export function RecentlyPlayedView({
  recentlyPlayed,
  onPlayFromCard,
  handleToggleLike,
  likedSongIds,
}: RecentlyPlayedViewProps) {
  const { user } = useAuth()
  const { currentTrack, isPlaying, setList } = usePlaybackStore()
  const [search, setSearch] = useState("")
  const [tracks, setTracks] = useState<RecentTrack[]>([])
  const filterInputRef = useRef<HTMLInputElement>(null)

  const username = user?.user_metadata?.username || user?.email?.split("@")[0] || "You"

  // Sync with prop and also read from localStorage for freshness
  useEffect(() => {
    if (recentlyPlayed.length > 0) {
      setTracks(recentlyPlayed)
    } else {
      try {
        const stored = localStorage.getItem("aura_recent_tracks")
        if (stored) setTracks(JSON.parse(stored) as RecentTrack[])
      } catch {}
    }
  }, [recentlyPlayed])

  const filtered = tracks.filter(
    (t) =>
      t.trackName.toLowerCase().includes(search.toLowerCase()) ||
      t.artistName.toLowerCase().includes(search.toLowerCase()) ||
      (t.collectionName || "").toLowerCase().includes(search.toLowerCase())
  )

  const buckets: { today: RecentTrack[]; yesterday: RecentTrack[]; thisweek: RecentTrack[] } = {
    today: [], yesterday: [], thisweek: [],
  }
  for (const t of filtered) {
    buckets[getDateGroup(t.playedAt)].push(t)
  }
  const groups: { key: string; label: string; items: RecentTrack[] }[] = [
    { key: "today", label: "Today", items: buckets.today },
    { key: "yesterday", label: "Yesterday", items: buckets.yesterday },
    { key: "thisweek", label: "This Week", items: buckets.thisweek },
  ].filter((g) => g.items.length > 0)

  const handlePlayAll = () => {
    const first = tracks[0]
    if (!first) return
    setList(tracks)
    onPlayFromCard(first, "recent")
  }

  return (
    <div className="pb-6">
      {/* ── Hero ── */}
      <div className="mb-8 flex flex-col gap-5 sm:flex-row sm:items-end">
        {/* Artwork */}
        <div className="flex h-36 w-36 flex-shrink-0 items-center justify-center rounded-2xl bg-gradient-to-br from-aura-primary/50 to-aura-primary/10 shadow-lg shadow-aura-primary/10">
          <Clock className="h-14 w-14 text-aura-primary" strokeWidth={1.5} />
        </div>

        {/* Meta */}
        <div>
          <span className="mb-2 inline-block rounded-full bg-aura-primary/20 px-3 py-1 text-[10px] font-bold tracking-[0.15em] text-aura-primary uppercase">
            History
          </span>
          <h1 className="mb-2 text-4xl font-bold text-white">Recently Played</h1>
          <div className="flex items-center gap-2 text-sm text-aura-muted">
            <Clock size={13} />
            <span>{username}</span>
            <span className="text-white/20">•</span>
            <span>{tracks.length} tracks</span>
          </div>
        </div>
      </div>

      {/* ── Controls ── */}
      <div className="mb-6 flex flex-wrap items-center gap-3">
        <button
          onClick={handlePlayAll}
          disabled={tracks.length === 0}
          className="btn-primary flex items-center gap-2.5 px-7 py-3 text-[13px] font-bold tracking-widest disabled:opacity-40"
        >
          <Play size={14} fill="currentColor" />
          PLAY ALL
        </button>

        <div className="flex min-w-0 flex-1 items-center gap-2 rounded-xl border border-white/[0.08] bg-white/[0.04] px-4 py-2.5 sm:max-w-xs">
          <Search size={14} className="flex-shrink-0 text-aura-muted" />
          <input
            ref={filterInputRef}
            value={search}
            onChange={(e) => setSearch(e.target.value)}
            placeholder="Filter recently played..."
            className="min-w-0 flex-1 bg-transparent text-sm text-white placeholder:text-aura-muted outline-none"
          />
          {search.length > 0 && (
            <button
              type="button"
              aria-label="Clear filter"
              onClick={() => {
                setSearch("")
                filterInputRef.current?.focus()
              }}
              className="flex-shrink-0 text-aura-muted rounded-full p-0.5 transition-all hover:bg-white/10 hover:text-white"
            >
              <X className="h-3.5 w-3.5" />
            </button>
          )}
        </div>
      </div>

      {/* ── Track List ── */}
      {tracks.length === 0 ? (
        <div className="flex flex-col items-center py-24 text-center">
          <Clock className="mb-4 h-14 w-14 text-aura-muted/30" strokeWidth={1} />
          <p className="mb-1 text-lg font-semibold text-white/60">No tracks played yet</p>
          <p className="text-sm text-aura-muted">Start listening to build your history</p>
        </div>
      ) : (
        <>
          {/* Column headers */}
          <div className="mb-2 hidden grid-cols-[2rem_1fr_1fr_auto_2rem] items-center gap-4 border-b border-white/[0.06] px-4 pb-2 md:grid">
            <span className="text-[11px] font-bold tracking-[0.12em] text-aura-muted">#</span>
            <span className="text-[11px] font-bold tracking-[0.12em] text-aura-muted">TITLE</span>
            <span className="text-[11px] font-bold tracking-[0.12em] text-aura-muted">ALBUM</span>
            <span className="text-[11px] font-bold tracking-[0.12em] text-aura-muted text-right">PLAYED</span>
            <span />
          </div>

          {filtered.length === 0 && search.length > 0 ? (
            <div className="flex flex-col items-center py-24 text-center">
              <Search className="mb-4 h-7 w-7 text-aura-muted/30" />
              <p className="mb-1 text-lg font-semibold text-white/60">No matching tracks</p>
              <p className="text-sm text-aura-muted">Try a different search term</p>
            </div>
          ) : null}

          {groups.map(({ key, label, items }, groupIndex) => {
            const offset = groups.slice(0, groupIndex).reduce((sum, g) => sum + g.items.length, 0)
            return (
            <div key={key} className="mb-4">
              {/* Date group header */}
              <p className="mb-1 px-4 py-1 text-[11px] font-bold tracking-[0.12em] text-aura-muted uppercase">
                {label}
              </p>

              <div className="space-y-0.5">
                {items.map((track, itemIndex) => {
                  const idx = offset + itemIndex + 1
                  const isActive = currentTrack?.trackId === track.trackId
                  const isLiked = likedSongIds.includes(track.trackId)

                  return (
                    <div
                      key={`${track.trackId}-${idx}`}
                      onClick={() => onPlayFromCard(track, "recent")}
                      className={`group grid cursor-pointer grid-cols-[2rem_auto_1fr_auto_2rem] items-center gap-3 rounded-xl px-4 py-2.5 transition-all md:grid-cols-[2rem_auto_1fr_1fr_auto_2rem] ${
                        isActive ? "bg-aura-primary/10" : "hover:bg-white/[0.04]"
                      }`}
                    >
                      {/* # / Playing indicator */}
                      <div className="flex w-5 items-center justify-center">
                        {isActive && isPlaying ? (
                          <div className="flex items-end gap-[2px] h-4">
                            <span className="w-[2px] h-full bg-aura-primary animate-pulse rounded-full" />
                            <span className="w-[2px] h-2/3 bg-aura-primary animate-pulse rounded-full [animation-delay:0.2s]" />
                            <span className="w-[2px] h-full bg-aura-primary animate-pulse rounded-full [animation-delay:0.4s]" />
                          </div>
                        ) : (
                          <span className={`text-[12px] font-medium tabular-nums ${isActive ? "text-aura-primary" : "text-aura-muted group-hover:hidden"}`}>
                            {idx}
                          </span>
                        )}
                        {!isActive && (
                          <Play
                            size={13}
                            fill="currentColor"
                            className="hidden text-white group-hover:block"
                          />
                        )}
                      </div>

                      {/* Artwork */}
                      <div className="relative h-10 w-10 flex-shrink-0 overflow-hidden rounded-lg">
                        {track.artworkUrl100 ? (
                          <Image
                            src={track.artworkUrl100}
                            alt={track.trackName}
                            fill
                            sizes="40px"
                            className="object-cover"
                          />
                        ) : (
                          <div className="flex h-full w-full items-center justify-center bg-white/[0.06]">
                            <Play size={12} className="text-aura-muted" />
                          </div>
                        )}
                      </div>

                      {/* Title + Artist */}
                      <div className="min-w-0">
                        <p className={`truncate text-[13px] font-medium leading-tight ${isActive ? "text-aura-primary" : "text-white"}`}>
                          {track.trackName}
                        </p>
                        <p className="truncate text-[11px] text-aura-muted">{track.artistName}</p>
                      </div>

                      {/* Album (hidden on mobile) */}
                      <p className="hidden truncate text-[12px] text-aura-muted md:block">
                        {track.collectionName || "—"}
                      </p>

                      {/* Played time */}
                      <p className="whitespace-nowrap text-right text-[11px] text-aura-muted">
                        {formatTimeAgo(track.playedAt)}
                      </p>

                      {/* Like button */}
                      <button
                        onClick={(e) => { e.stopPropagation(); handleToggleLike(track) }}
                        className={`flex items-center justify-center transition-all ${
                          isLiked ? "text-aura-primary opacity-100" : "text-aura-muted opacity-0 group-hover:opacity-100 hover:text-aura-primary"
                        }`}
                      >
                        <svg width="15" height="15" viewBox="0 0 24 24" fill={isLiked ? "currentColor" : "none"} stroke="currentColor" strokeWidth="2">
                          <path d="M20.84 4.61a5.5 5.5 0 0 0-7.78 0L12 5.67l-1.06-1.06a5.5 5.5 0 0 0-7.78 7.78l1.06 1.06L12 21.23l7.78-7.78 1.06-1.06a5.5 5.5 0 0 0 0-7.78z" />
                        </svg>
                      </button>
                    </div>
                  )
                })}
              </div>
            </div>
          )})}
        </>
      )}
    </div>
  )
}
