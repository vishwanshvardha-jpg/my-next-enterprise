"use client"

import { motion } from "framer-motion"
import { ChevronLeft, ChevronRight, Grid, Heart, List, Play, UserPlus } from "lucide-react"
import Image from "next/image"
import { useRef, useState } from "react"
import { TrackCard } from "components/TrackCard/TrackCard"
import { TrackList } from "components/TrackList/TrackList"
import { iTunesTrack } from "lib/itunes"
import { useLibraryStore, usePlaybackStore } from "lib/store"
import { Playlist } from "lib/types"

interface HomeViewProps {
  tracks: (iTunesTrack & { addedAt?: string })[]
  featuredTrack: iTunesTrack | null
  recentlyPlayed: iTunesTrack[]
  isSearching: boolean
  searchQuery: string
  isLoading: boolean
  onSearch: (vibe: string) => void
  onPlayFromCard: (track: iTunesTrack, context: "search" | "recent" | "playlist" | "library") => void
  handleToggleLike: (track: iTunesTrack) => void
  handleAddToPlaylist: (track: iTunesTrack, playlistId: string) => void
  likedSongIds: number[]
  playlists: Playlist[]
}

export function HomeView({
  tracks,
  featuredTrack,
  recentlyPlayed,
  isSearching,
  searchQuery,
  isLoading,
  onSearch,
  onPlayFromCard,
  handleToggleLike,
  handleAddToPlaylist,
  likedSongIds,
  playlists,
}: HomeViewProps) {
  const { activePlaylistId } = useLibraryStore()
  const { currentTrack, isPlaying, pause: handlePause } = usePlaybackStore()

  const [viewMode, setViewMode] = useState<"grid" | "list">("list")

  const albumsScrollRef = useRef<HTMLDivElement>(null)
  const artistsScrollRef = useRef<HTMLDivElement>(null)

  const scrollContainer = (ref: React.RefObject<HTMLDivElement | null>, direction: "left" | "right") => {
    if (ref.current) {
      const scrollAmount = direction === "left" ? -320 : 320
      ref.current.scrollBy({ left: scrollAmount, behavior: "smooth" })
    }
  }

  // Derive unique artists from tracks for "Popular Artists" section
  const uniqueArtists = tracks.reduce<{ name: string; artwork: string }[]>((acc, track) => {
    if (!acc.find((a) => a.name === track.artistName) && acc.length < 10) {
      acc.push({
        name: track.artistName,
        artwork: track.artworkUrl100.replace("100x100bb.jpg", "400x400bb.jpg"),
      })
    }
    return acc
  }, [])

  if (activePlaylistId === "home") {
    return (
      <div className="relative space-y-10">
        {/* Ambient background gradients for Home View */}
        <div className="pointer-events-none absolute -top-40 right-0 h-[600px] w-[600px] rounded-full bg-aura-primary/[0.03] blur-[120px]" />
        <div className="pointer-events-none absolute top-[40%] -left-20 h-[500px] w-[500px] rounded-full bg-cyan-900/[0.05] blur-[120px]" />
        {/* ─── Hero Section ─── */}
        {!isSearching && searchQuery === "Top Hits" && featuredTrack && (
          <motion.section
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            transition={{ duration: 0.8 }}
            className="relative h-[420px] w-full overflow-hidden rounded-3xl"
          >
            {/* Background artwork */}
            <div className="absolute inset-0">
              <Image
                src={featuredTrack.artworkUrl100.replace("100x100", "1000x1000")}
                alt={featuredTrack.trackName}
                fill
                className="object-cover scale-110 blur-[2px]"
                priority
              />
              {/* Gradient overlays for depth */}
              <div className="absolute inset-0 bg-gradient-to-r from-aura-bg via-aura-bg/80 to-transparent" />
              <div className="absolute inset-0 bg-gradient-to-t from-aura-bg/60 via-transparent to-aura-bg/40" />
              {/* Teal spotlight glow */}
              <div className="absolute -left-20 top-1/2 -translate-y-1/2 h-[500px] w-[500px] rounded-full bg-aura-primary/[0.06] blur-[100px]" />
            </div>

            {/* Content */}
            <div className="relative z-10 flex h-full items-center px-10 lg:px-14">
              <div className="max-w-lg space-y-5">
                <motion.div
                  initial={{ opacity: 0, y: 20 }}
                  animate={{ opacity: 1, y: 0 }}
                  transition={{ delay: 0.2, duration: 0.6 }}
                >
                  <h1 className="font-display text-3xl font-bold leading-[1.15] tracking-tight text-white lg:text-4xl xl:text-5xl line-clamp-2">
                    <span className="text-white">{featuredTrack.artistName}:</span>{" "}
                    <span className="text-white/80">{featuredTrack.trackName}</span>
                  </h1>
                </motion.div>

                <motion.p
                  initial={{ opacity: 0, y: 15 }}
                  animate={{ opacity: 1, y: 0 }}
                  transition={{ delay: 0.4, duration: 0.6 }}
                  className="text-sm leading-relaxed text-white/50 max-w-md"
                >
                  Discover the latest from {featuredTrack.artistName}. 
                  {featuredTrack.primaryGenreName && ` Genre: ${featuredTrack.primaryGenreName}.`}
                  {" "}Explore their discography and find your next favorite track.
                </motion.p>

                <motion.div
                  initial={{ opacity: 0, y: 15 }}
                  animate={{ opacity: 1, y: 0 }}
                  transition={{ delay: 0.6, duration: 0.6 }}
                  className="flex items-center gap-3 pt-2"
                >
                  <button
                    onClick={() => onPlayFromCard(featuredTrack, "search")}
                    className="btn-primary flex items-center gap-2 text-[12px] font-bold tracking-wider uppercase"
                  >
                    <Play fill="currentColor" size={14} /> Play
                  </button>
                  <button
                    onClick={() => handleToggleLike(featuredTrack)}
                    className="btn-outline flex items-center gap-2 text-[12px] font-bold tracking-wider uppercase"
                  >
                    <UserPlus size={14} /> Follow
                  </button>
                </motion.div>
              </div>
            </div>

            {/* Hero artwork on right (visible on larger screens) */}
            <div className="absolute right-0 top-0 bottom-0 w-[45%] hidden lg:block">
              <Image
                src={featuredTrack.artworkUrl100.replace("100x100", "1000x1000")}
                alt={featuredTrack.trackName}
                fill
                className="object-cover object-center"
                priority
              />
              <div className="absolute inset-0 bg-gradient-to-r from-aura-bg via-aura-bg/40 to-transparent" />
              <div className="absolute inset-0 bg-gradient-to-t from-aura-bg/50 to-transparent" />
            </div>
          </motion.section>
        )}

        {/* ─── Popular Albums ─── */}
        {!isSearching && searchQuery === "Top Hits" && tracks.length > 0 && (
          <section className="space-y-5">
            <div className="flex items-center justify-between px-1">
              <h2 className="font-display text-xl font-bold text-white">Popular Albums</h2>
              <div className="flex items-center gap-2">
                <button
                  onClick={() => scrollContainer(albumsScrollRef, "left")}
                  className="flex h-8 w-8 items-center justify-center rounded-full bg-white/[0.06] text-white/60 transition-all hover:bg-white/[0.12] hover:text-white"
                >
                  <ChevronLeft size={16} />
                </button>
                <button
                  onClick={() => scrollContainer(albumsScrollRef, "right")}
                  className="flex h-8 w-8 items-center justify-center rounded-full bg-white/[0.06] text-white/60 transition-all hover:bg-white/[0.12] hover:text-white"
                >
                  <ChevronRight size={16} />
                </button>
              </div>
            </div>

            <div
              ref={albumsScrollRef}
              className="no-scrollbar flex gap-5 overflow-x-auto pb-2"
            >
              {tracks.slice(0, 12).map((track, i) => (
                <motion.div
                  key={`album-${track.trackId}-${i}`}
                  initial={{ opacity: 0, y: 20 }}
                  animate={{ opacity: 1, y: 0 }}
                  transition={{ delay: i * 0.05, duration: 0.4 }}
                  className="group flex-shrink-0 w-[160px] cursor-pointer"
                  onClick={() => onPlayFromCard(track, "search")}
                >
                  <div className="relative aspect-square w-full overflow-hidden rounded-2xl bg-aura-surface mb-3">
                    <Image
                      src={track.artworkUrl100.replace("100x100bb.jpg", "400x400bb.jpg")}
                      alt={track.trackName}
                      fill
                      sizes="160px"
                      className="object-cover transition-transform duration-500 group-hover:scale-110"
                    />
                    {/* Hover play overlay */}
                    <div className="absolute inset-0 flex items-center justify-center bg-black/0 transition-all duration-300 group-hover:bg-black/40">
                      <div className="flex h-10 w-10 items-center justify-center rounded-full bg-aura-primary text-black opacity-0 shadow-lg transition-all duration-300 group-hover:opacity-100 group-hover:scale-100 scale-75">
                        <Play size={16} fill="currentColor" className="ml-0.5" />
                      </div>
                    </div>
                    {/* Like button */}
                    <button
                      onClick={(e) => {
                        e.stopPropagation()
                        handleToggleLike(track)
                      }}
                      className={`absolute top-2.5 right-2.5 rounded-full p-1.5 transition-all ${
                        likedSongIds.includes(track.trackId)
                          ? "bg-aura-primary/20 text-aura-primary"
                          : "bg-black/30 text-white/70 opacity-0 group-hover:opacity-100 hover:text-white"
                      }`}
                    >
                      <Heart size={12} fill={likedSongIds.includes(track.trackId) ? "currentColor" : "none"} />
                    </button>
                  </div>
                  <h3 className="truncate text-[13px] font-semibold text-white group-hover:text-aura-primary transition-colors">
                    {track.collectionName || track.trackName}
                  </h3>
                  <p className="truncate text-[11px] text-aura-muted mt-0.5">
                    {track.artistName}
                  </p>
                </motion.div>
              ))}
            </div>
          </section>
        )}

        {/* ─── Popular Artists ─── */}
        {!isSearching && searchQuery === "Top Hits" && uniqueArtists.length > 0 && (
          <section className="space-y-5">
            <div className="flex items-center justify-between px-1">
              <h2 className="font-display text-xl font-bold text-white">Popular Artists</h2>
              <div className="flex items-center gap-2">
                <button
                  onClick={() => scrollContainer(artistsScrollRef, "left")}
                  className="flex h-8 w-8 items-center justify-center rounded-full bg-white/[0.06] text-white/60 transition-all hover:bg-white/[0.12] hover:text-white"
                >
                  <ChevronLeft size={16} />
                </button>
                <button
                  onClick={() => scrollContainer(artistsScrollRef, "right")}
                  className="flex h-8 w-8 items-center justify-center rounded-full bg-white/[0.06] text-white/60 transition-all hover:bg-white/[0.12] hover:text-white"
                >
                  <ChevronRight size={16} />
                </button>
              </div>
            </div>

            <div
              ref={artistsScrollRef}
              className="no-scrollbar flex gap-6 overflow-x-auto pb-2"
            >
              {uniqueArtists.map((artist, i) => (
                <motion.div
                  key={`artist-${artist.name}-${i}`}
                  initial={{ opacity: 0, scale: 0.9 }}
                  animate={{ opacity: 1, scale: 1 }}
                  transition={{ delay: i * 0.05, duration: 0.4 }}
                  className="group flex-shrink-0 flex flex-col items-center cursor-pointer"
                  onClick={() => onSearch(artist.name)}
                >
                  <div className="relative h-24 w-24 overflow-hidden rounded-full bg-aura-surface mb-3 ring-2 ring-transparent transition-all duration-300 group-hover:ring-aura-primary/40">
                    <Image
                      src={artist.artwork}
                      alt={artist.name}
                      fill
                      sizes="96px"
                      className="object-cover transition-transform duration-500 group-hover:scale-110"
                    />
                  </div>
                  <p className="text-[12px] font-semibold text-white/80 group-hover:text-white transition-colors text-center max-w-[96px] truncate">
                    {artist.name}
                  </p>
                </motion.div>
              ))}
            </div>
          </section>
        )}

        {/* ─── Recently Played ─── */}
        {recentlyPlayed.length > 0 && searchQuery === "Top Hits" && !isSearching && (
          <section className="space-y-5">
            <div className="flex items-center justify-between px-1">
              <h2 className="font-display text-xl font-bold text-white">Recently Played</h2>
              <button className="text-[11px] font-semibold text-aura-muted tracking-wider transition-colors hover:text-aura-primary">
                View All
              </button>
            </div>
            <div className="grid grid-cols-[repeat(auto-fill,minmax(140px,1fr))] gap-5">
              {recentlyPlayed.map((track, i) => (
                <TrackCard
                  key={`recent-${track.trackId}-${i}`}
                  track={track}
                  isCurrentTrack={currentTrack?.trackId === track.trackId}
                  isPlaying={currentTrack?.trackId === track.trackId && isPlaying}
                  onPlay={(t) => onPlayFromCard(t, "recent")}
                  onPause={handlePause}
                  isLiked={likedSongIds.includes(track.trackId)}
                  onToggleLike={handleToggleLike}
                  onAddToPlaylist={handleAddToPlaylist}
                  playlists={playlists}
                />
              ))}
            </div>
          </section>
        )}

        {/* ─── Search Results / Trending ─── */}
        <section className="space-y-5">
          <div className="flex items-center justify-between px-1">
            <h2 className="font-display text-xl font-bold text-white">
              {searchQuery === "Top Hits" ? "Trending Now" : `Results for "${searchQuery}"`}
            </h2>
            
            <div className="flex items-center gap-1 rounded-lg bg-white/[0.03] p-1">
              <button
                onClick={() => setViewMode("list")}
                className={`flex h-8 w-8 items-center justify-center rounded-md transition-all ${
                  viewMode === "list"
                    ? "bg-white/[0.08] text-white shadow-sm"
                    : "text-aura-muted hover:text-white/70"
                }`}
              >
                <List size={16} />
              </button>
              <button
                onClick={() => setViewMode("grid")}
                className={`flex h-8 w-8 items-center justify-center rounded-md transition-all ${
                  viewMode === "grid"
                    ? "bg-white/[0.08] text-white shadow-sm"
                    : "text-aura-muted hover:text-white/70"
                }`}
              >
                <Grid size={16} />
              </button>
            </div>
          </div>
          <TrackList
            tracks={tracks}
            viewMode={viewMode}
            currentTrackId={currentTrack?.trackId ?? null}
            isPlaying={isPlaying}
            onPlay={(t) => onPlayFromCard(t, "search")}
            onPause={handlePause}
            isLoading={isLoading}
            likedSongIds={likedSongIds}
            onToggleLike={handleToggleLike}
            onAddToPlaylist={handleAddToPlaylist}
            playlists={playlists}
          />
        </section>
      </div>
    )
  }

  return <div className="text-aura-muted p-12 text-center">Loading section...</div>
}
