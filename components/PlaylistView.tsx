"use client"

import { motion } from "framer-motion"
import { debounce } from "lodash"
import { Grid, Heart, List, Music, Play, Plus, Search, User as UserIcon } from "lucide-react"
import { useMemo, useState } from "react"
import { useAuth } from "components/Providers/AuthProvider"
import { TrackList } from "components/TrackList/TrackList"
import { iTunesTrack } from "lib/itunes"
import { useLibraryStore, usePlaybackStore } from "lib/store"

interface PlaylistViewProps {
  onPlayFromCard: (track: iTunesTrack, context: "search" | "recent" | "playlist" | "library") => void
  handleToggleLike: (track: iTunesTrack) => void
  handleAddToPlaylist: (track: iTunesTrack, playlistId: string) => void
  likedSongIds: number[]
}

export function PlaylistView({
  onPlayFromCard,
  handleToggleLike,
  handleAddToPlaylist,
  likedSongIds,
}: PlaylistViewProps) {
  const { user } = useAuth()
  const {
    playlists,
    activePlaylistId,
    playlistTracks,
    currentPlaylistName,
    isAddingSongs,
    setAddingSongs,
    playlistSearchTracks,
    handlePlaylistSearch,
  } = useLibraryStore()

  const { isPlaying, currentTrack, pause: handlePause } = usePlaybackStore()
  const [viewMode, setViewMode] = useState<"grid" | "list">("list")

  const debouncedSearch = useMemo(
    () => debounce((query: string) => handlePlaylistSearch(query), 400),
    [handlePlaylistSearch]
  )

  const handlePlayAll = () => {
    if (playlistTracks.length > 0) {
      const track = playlistTracks[0]
      if (track) {
        const context = activePlaylistId === "liked" ? "library" : "playlist"
        onPlayFromCard(track, context)
      }
    }
  }

  return (
    <div className="animate-in fade-in slide-in-from-bottom-4 space-y-12 pb-20 duration-700">
      {/* Dynamic Header */}
      <header className="flex flex-col items-end gap-6 pb-2 md:flex-row">
        <div
          className={`group relative h-36 w-36 flex-shrink-0 overflow-hidden rounded-[2rem] shadow-xl md:h-44 md:w-44 ${
            activePlaylistId === "liked"
              ? "from-aura-primary to-aura-accent bg-gradient-to-br"
              : "bg-aura-surface border border-white/5"
          }`}
        >
          <div className="absolute inset-0 flex items-center justify-center">
            {activePlaylistId === "liked" ? (
              <Heart className="h-14 w-14 fill-current text-white" />
            ) : (
              <Music className="text-aura-muted group-hover:text-aura-primary h-14 w-14 transition-colors duration-500" />
            )}
          </div>
          <motion.button
            whileHover={{ scale: 1.1 }}
            whileTap={{ scale: 0.95 }}
            onClick={handlePlayAll}
            className="absolute right-3 bottom-3 flex h-10 w-10 items-center justify-center rounded-full bg-white text-black opacity-0 shadow-2xl transition-opacity duration-300 group-hover:opacity-100"
          >
            <Play size={16} fill="currentColor" className="ml-0.5" />
          </motion.button>
        </div>

        <div className="flex-1 space-y-2.5 pb-2">
          <div className="text-aura-primary inline-block rounded-full border border-white/10 bg-white/5 px-2.5 py-0.5 text-[8px] font-black tracking-[0.2em] uppercase">
            {activePlaylistId === "liked" ? "Public" : "Playlist"}
          </div>
          <h1 className="font-display mb-1 line-clamp-1 text-3xl leading-tight font-black tracking-tight text-white md:text-5xl">
            {currentPlaylistName || "Your Vibes"}
          </h1>
          <div className="text-aura-muted flex items-center gap-3 text-[10px] leading-none font-bold tracking-widest uppercase">
            <span className="flex items-center gap-1.5 text-white">
              <UserIcon size={11} className="text-aura-primary" /> {user?.email?.split("@")[0]}
            </span>
            <span className="h-1 w-1 rounded-full bg-white/10" />
            <span>{playlistTracks.length} tracks</span>
          </div>
        </div>
      </header>

      {/* Controls Bar */}
      <div className="flex items-center justify-between border-b border-white/5 pb-6">
        <div className="flex items-center gap-8">
          <motion.button
            whileHover={{ scale: 1.05 }}
            whileTap={{ scale: 0.95 }}
            onClick={handlePlayAll}
            className="bg-aura-primary shadow-aura-primary/30 flex items-center gap-3 rounded-2xl px-10 py-4 text-xs font-black tracking-widest text-white uppercase shadow-xl"
          >
            <Play fill="currentColor" size={18} /> Play All
          </motion.button>

          <button
            onClick={() => setAddingSongs(!isAddingSongs)}
            className={`flex items-center gap-2 rounded-2xl border px-6 py-4 text-xs font-black tracking-widest uppercase transition-all ${
              isAddingSongs
                ? "border-white bg-white text-black"
                : "border-white/10 bg-white/5 text-white hover:bg-white/10"
            }`}
          >
            <Plus size={16} />
            Add Track
          </button>
        </div>

        <div className="hidden items-center gap-4 rounded-2xl border border-white/5 bg-white/5 p-1 lg:flex">
          <button
            onClick={() => setViewMode("list")}
            className={`rounded-xl p-3 transition-all ${
              viewMode === "list" ? "bg-white/10 text-white shadow-lg" : "text-aura-muted hover:text-white"
            }`}
          >
            <List size={20} />
          </button>
          <button
            onClick={() => setViewMode("grid")}
            className={`rounded-xl p-3 transition-all ${
              viewMode === "grid" ? "bg-white/10 text-white shadow-lg" : "text-aura-muted hover:text-white"
            }`}
          >
            <Grid size={20} />
          </button>
        </div>
      </div>

      <div className="min-h-[400px]">
        {isAddingSongs && (
          <div className="animate-in slide-in-from-top-4 mb-12 space-y-8 duration-500">
            <div className="relative max-w-2xl">
              <Search className="text-aura-muted absolute top-1/2 left-5 h-5 w-5 -translate-y-1/2" />
              <input
                autoFocus
                placeholder="Find tracks to add to your collection..."
                onChange={(e) => debouncedSearch(e.target.value)}
                className="placeholder-aura-muted h-14 w-full rounded-2xl border border-white/5 bg-white/5 py-4 pr-4 pl-14 text-sm font-medium text-white transition-all focus:bg-white/10 focus:outline-none"
              />
            </div>
            {playlistSearchTracks.length > 0 && (
              <div className="space-y-4">
                <h3 className="text-aura-muted px-2 text-[9px] font-black tracking-[0.3em] uppercase">
                  Search Results
                </h3>
                <TrackList
                  tracks={playlistSearchTracks}
                  currentTrackId={currentTrack?.trackId ?? null}
                  isPlaying={isPlaying}
                  onPlay={(t) => onPlayFromCard(t, "search")}
                  onPause={handlePause}
                  isLoading={false}
                  likedSongIds={likedSongIds}
                  onToggleLike={handleToggleLike}
                  onAddToPlaylist={handleAddToPlaylist}
                  playlists={playlists}
                  viewMode={viewMode}
                />
                <div className="my-8 h-px bg-white/5" />
              </div>
            )}
          </div>
        )}

        <div className="space-y-4">
          {isAddingSongs && (
            <h3 className="text-aura-muted px-2 text-[9px] font-black tracking-[0.3em] uppercase">Playlist Tracks</h3>
          )}
          <TrackList
            tracks={playlistTracks}
            currentTrackId={currentTrack?.trackId ?? null}
            isPlaying={isPlaying}
            onPlay={(t) => onPlayFromCard(t, activePlaylistId === "liked" ? "library" : "playlist")}
            onPause={handlePause}
            isLoading={false}
            likedSongIds={likedSongIds}
            onToggleLike={handleToggleLike}
            onAddToPlaylist={handleAddToPlaylist}
            playlists={playlists}
            viewMode={viewMode}
          />
        </div>
      </div>
    </div>
  )
}
