"use client"

import { motion } from "framer-motion"
import { Heart, Play } from "lucide-react"
import Image from "next/image"
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

  const SUGGESTED_SEARCHES = ["Chill", "Workout", "Focus", "Party", "Pop", "Electronic"]

  if (activePlaylistId === "home") {
    return (
      <div className="animate-in space-y-12">
        {/* Vibe Selectors */}
        {!isSearching && (
          <div className="no-scrollbar flex items-center gap-3 overflow-x-auto pt-2 pb-4">
            {SUGGESTED_SEARCHES.map((vibe) => (
              <button
                key={vibe}
                onClick={() => onSearch(vibe)}
                className="hover:bg-aura-primary/20 hover:border-aura-primary/30 rounded-full border border-white/5 bg-white/5 px-6 py-2 text-[10px] font-bold tracking-widest whitespace-nowrap text-white uppercase transition-all"
              >
                {vibe}
              </button>
            ))}
          </div>
        )}

        {/* Hero Section */}
        {!isSearching && searchQuery === "Top Hits" && featuredTrack && (
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            className="group relative h-[400px] w-full overflow-hidden rounded-[2.5rem] shadow-2xl"
          >
            <div className="absolute inset-0 z-10 bg-gradient-to-t from-black via-black/20 to-transparent" />
            <Image
              src={featuredTrack.artworkUrl100.replace("100x100", "1000x1000")}
              alt={featuredTrack.trackName}
              fill
              className="absolute inset-0 h-full w-full scale-105 object-cover transition-transform duration-1000 ease-out group-hover:scale-100"
              priority
            />
            <div className="bg-aura-primary/5 absolute inset-0 z-0 mix-blend-overlay" />

            <div className="relative z-20 flex h-full max-w-2xl flex-col justify-end p-10">
              <motion.div
                initial={{ opacity: 0, x: -20 }}
                animate={{ opacity: 1, x: 0 }}
                transition={{ delay: 0.2 }}
                className="mb-3 inline-block self-start rounded-full border border-white/10 bg-white/10 px-3 py-1 text-[9px] font-black tracking-[0.2em] text-white uppercase backdrop-blur-xl"
              >
                Featured Track
              </motion.div>

              <h1 className="font-display mb-2 line-clamp-2 text-4xl leading-tight font-black tracking-tight text-white md:text-6xl">
                {featuredTrack.trackName}
              </h1>

              <div className="text-aura-muted mb-6 flex items-center gap-3">
                <span className="text-aura-primary text-xs font-bold tracking-widest uppercase">
                  {featuredTrack.artistName}
                </span>
                <span className="h-1 w-1 rounded-full bg-white/20" />
                <span className="text-xs font-medium">{featuredTrack.collectionName}</span>
              </div>

              <div className="flex items-center gap-4">
                <button
                  onClick={() => onPlayFromCard(featuredTrack, "search")}
                  className="hover:bg-aura-primary flex items-center gap-2.5 rounded-2xl bg-white px-8 py-3.5 text-[10px] font-black tracking-widest text-black uppercase shadow-xl transition-all hover:text-white active:scale-95"
                >
                  <Play fill="currentColor" size={14} /> Play Now
                </button>
                <button
                  onClick={() => handleToggleLike(featuredTrack)}
                  className="rounded-2xl border border-white/10 bg-white/10 p-3.5 text-white backdrop-blur-md transition-all hover:bg-white/20 active:scale-95"
                >
                  <Heart size={18} fill={likedSongIds.includes(featuredTrack.trackId) ? "currentColor" : "none"} />
                </button>
              </div>
            </div>
          </motion.div>
        )}

        {/* Recently Played */}
        {recentlyPlayed.length > 0 && searchQuery === "Top Hits" && !isSearching && (
          <section className="space-y-6">
            <div className="flex items-center justify-between px-2">
              <h2 className="text-aura-muted text-[10px] font-black tracking-[0.3em] uppercase">Recently Played</h2>
              <button className="text-aura-muted text-[9px] font-black tracking-widest uppercase transition-colors hover:text-white">
                View All
              </button>
            </div>
            <div className="grid grid-cols-2 gap-6 sm:grid-cols-3 md:grid-cols-4 lg:grid-cols-5 xl:grid-cols-6 2xl:grid-cols-8">
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

        <section className="space-y-6">
          <div className="flex items-center justify-between px-2">
            <h2 className="text-aura-muted text-[10px] font-black tracking-[0.3em] uppercase">
              {searchQuery === "Top Hits" ? "Trending" : `Results for "${searchQuery}"`}
            </h2>
          </div>
          <TrackList
            tracks={tracks}
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

  // Library/Playlist views would go here or in separate components
  return <div className="text-aura-muted p-12 text-center">Loading section...</div>
}
