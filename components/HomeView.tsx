"use client"

import { Grid, List, Play, Plus, Search, Shuffle, User as UserIcon, Heart, Music } from "lucide-react"
import { iTunesTrack } from "lib/itunes"
import { useLibraryStore, usePlaybackStore } from "lib/store"
import { TrackCard } from "components/TrackCard/TrackCard"
import { TrackList } from "components/TrackList/TrackList"
import { useAuth } from "components/Providers/AuthProvider"
import { motion, AnimatePresence } from "framer-motion"

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
  playlists: any[]
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
  playlists
}: HomeViewProps) {
  const { activePlaylistId } = useLibraryStore()
  
  const { currentTrack, isPlaying, pause: handlePause, togglePlay } = usePlaybackStore()
  const { user } = useAuth()

  const SUGGESTED_SEARCHES = ["Chill", "Workout", "Focus", "Party", "Pop", "Electronic"]

  if (activePlaylistId === "home") {
    return (
      <div className="space-y-12 animate-in">
        {/* Vibe Selectors */}
        {!isSearching && (
          <div className="flex items-center gap-3 overflow-x-auto pb-4 no-scrollbar pt-2">
            {SUGGESTED_SEARCHES.map(vibe => (
              <button
                key={vibe}
                onClick={() => onSearch(vibe)}
                className="px-6 py-2 rounded-full bg-white/5 border border-white/5 hover:bg-aura-primary/20 hover:border-aura-primary/30 text-[10px] font-bold uppercase tracking-widest text-white transition-all whitespace-nowrap"
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
            className="relative w-full rounded-[2.5rem] overflow-hidden group shadow-2xl h-[400px]"
          >
            <div className="absolute inset-0 bg-gradient-to-t from-black via-black/20 to-transparent z-10" />
            <img 
              src={featuredTrack.artworkUrl100.replace('100x100', '1000x1000')} 
              alt={featuredTrack.trackName}
              className="absolute inset-0 w-full h-full object-cover scale-105 group-hover:scale-100 transition-transform duration-1000 ease-out"
            />
            <div className="absolute inset-0 bg-aura-primary/5 mix-blend-overlay z-0" />
            
            <div className="relative z-20 h-full flex flex-col justify-end p-10 max-w-2xl">
              <motion.div 
                initial={{ opacity: 0, x: -20 }}
                animate={{ opacity: 1, x: 0 }}
                transition={{ delay: 0.2 }}
                className="mb-3 inline-block px-3 py-1 bg-white/10 backdrop-blur-xl border border-white/10 rounded-full text-[9px] font-black uppercase tracking-[0.2em] text-white self-start"
              >
                Featured Track
              </motion.div>

              <h1 className="text-4xl md:text-6xl font-display font-black tracking-tight text-white mb-2 line-clamp-2 leading-tight">
                {featuredTrack.trackName}
              </h1>
              
              <div className="flex items-center gap-3 text-aura-muted mb-6">
                <span className="text-xs font-bold uppercase tracking-widest text-aura-primary">{featuredTrack.artistName}</span>
                <span className="w-1 h-1 rounded-full bg-white/20" />
                <span className="text-xs font-medium">{featuredTrack.collectionName}</span>
              </div>
              
              <div className="flex items-center gap-4">
                <button 
                  onClick={() => onPlayFromCard(featuredTrack, "search")}
                  className="px-8 py-3.5 bg-white text-black hover:bg-aura-primary hover:text-white font-black uppercase tracking-widest text-[10px] rounded-2xl transition-all shadow-xl active:scale-95 flex items-center gap-2.5"
                >
                   <Play fill="currentColor" size={14} /> Play Now
                </button>
                <button 
                  onClick={() => handleToggleLike(featuredTrack)}
                  className="p-3.5 bg-white/10 hover:bg-white/20 backdrop-blur-md border border-white/10 text-white rounded-2xl transition-all active:scale-95"
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
              <h2 className="text-[10px] font-black uppercase tracking-[0.3em] text-aura-muted">Recently Played</h2>
              <button className="text-[9px] font-black uppercase tracking-widest text-aura-muted hover:text-white transition-colors">View All</button>
            </div>
            <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 lg:grid-cols-5 xl:grid-cols-6 2xl:grid-cols-8 gap-6">
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
            <h2 className="text-[10px] font-black uppercase tracking-[0.3em] text-aura-muted">
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
