"use client"

import { motion } from "framer-motion"
import { debounce } from "lodash"
import { Grid, Heart, List, Music, Play, Plus, Search, User as UserIcon, UserPlus } from "lucide-react"
import { useMemo, useState } from "react"
import { useAuth } from "components/Providers/AuthProvider"
import { CollaboratorsModal } from "components/Playlist/CollaboratorsModal"
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
  const [isCollaboratorsOpen, setIsCollaboratorsOpen] = useState(false)

  const activePlaylist = playlists.find((p) => p.id === activePlaylistId)

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
    <div className="space-y-10 pb-20">
      {/* Header */}
      <header className="relative overflow-hidden rounded-3xl bg-gradient-to-br from-white/[0.03] to-transparent border border-white/[0.05] p-8 lg:p-10">
        {/* Ambient glow */}
        <div className="absolute -top-20 -right-20 h-60 w-60 rounded-full bg-aura-primary/[0.06] blur-[80px]" />

        <div className="relative flex flex-col items-end gap-6 md:flex-row">
          {/* Playlist artwork */}
          <motion.div
            initial={{ opacity: 0, scale: 0.9 }}
            animate={{ opacity: 1, scale: 1 }}
            transition={{ duration: 0.4 }}
            className={`group relative h-36 w-36 flex-shrink-0 overflow-hidden rounded-2xl shadow-2xl md:h-40 md:w-40 ${
              activePlaylistId === "liked"
                ? "bg-gradient-to-br from-aura-primary to-aura-secondary"
                : "bg-aura-surface border border-white/[0.06]"
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
              className="absolute right-3 bottom-3 flex h-10 w-10 items-center justify-center rounded-full bg-aura-primary text-black opacity-0 shadow-lg transition-all duration-300 group-hover:opacity-100"
              style={{ boxShadow: "0 0 20px rgba(0, 212, 170, 0.3)" }}
            >
              <Play size={16} fill="currentColor" className="ml-0.5" />
            </motion.button>
          </motion.div>

          {/* Playlist info */}
          <div className="flex-1 space-y-2 pb-2">
            <div className="text-aura-primary inline-block rounded-full bg-aura-primary/10 px-3 py-1 text-[9px] font-semibold tracking-wider uppercase">
              {activePlaylistId === "liked" ? "Collection" : "Playlist"}
            </div>
            <h1 className="font-display line-clamp-1 text-3xl font-bold tracking-tight text-white md:text-4xl lg:text-5xl">
              {currentPlaylistName || "Your Vibes"}
            </h1>
            <div className="text-aura-muted flex items-center gap-3 text-[11px] font-medium">
              <span className="flex items-center gap-1.5 text-white/70">
                <UserIcon size={12} className="text-aura-primary" /> {user?.email?.split("@")[0]}
              </span>
              <span className="h-1 w-1 rounded-full bg-white/10" />
              <span>{playlistTracks.length} tracks</span>
            </div>
          </div>
        </div>
      </header>

      {/* Controls Bar */}
      <div className="flex items-center justify-between">
        <div className="flex items-center gap-4">
          <motion.button
            whileHover={{ scale: 1.02 }}
            whileTap={{ scale: 0.98 }}
            onClick={handlePlayAll}
            className="btn-primary flex items-center gap-2.5 text-[11px] font-bold tracking-wider uppercase"
          >
            <Play fill="currentColor" size={15} /> Play All
          </motion.button>

          <button
            onClick={() => setAddingSongs(!isAddingSongs)}
            className={`flex items-center gap-2 rounded-full px-5 py-2.5 text-[11px] font-bold tracking-wider uppercase transition-all ${
              isAddingSongs
                ? "bg-white text-black"
                : "btn-outline"
            }`}
          >
            <Plus size={14} />
            Add Track
          </button>

          {activePlaylist && activePlaylist.user_id === user?.id && (
            <button
              onClick={() => setIsCollaboratorsOpen(true)}
              className="btn-outline flex items-center gap-2 rounded-full px-5 py-2.5 text-[11px] font-bold tracking-wider uppercase transition-all"
            >
              <UserPlus size={14} />
              Share
            </button>
          )}
        </div>

        <div className="hidden items-center gap-1 rounded-xl bg-white/[0.04] p-1 lg:flex">
          <button
            onClick={() => setViewMode("list")}
            className={`rounded-lg p-2.5 transition-all ${
              viewMode === "list" ? "bg-white/[0.08] text-white" : "text-aura-muted hover:text-white"
            }`}
          >
            <List size={17} />
          </button>
          <button
            onClick={() => setViewMode("grid")}
            className={`rounded-lg p-2.5 transition-all ${
              viewMode === "grid" ? "bg-white/[0.08] text-white" : "text-aura-muted hover:text-white"
            }`}
          >
            <Grid size={17} />
          </button>
        </div>
      </div>

      {/* Content */}
      <div className="min-h-[400px]">
        {isAddingSongs && (
          <div className="mb-10 space-y-6">
            <div className="relative max-w-xl">
              <Search className="text-aura-muted absolute top-1/2 left-4 h-4 w-4 -translate-y-1/2" />
              <input
                autoFocus
                placeholder="Find tracks to add..."
                onChange={(e) => debouncedSearch(e.target.value)}
                className="h-11 w-full rounded-xl border border-white/[0.06] bg-white/[0.04] py-3 pr-4 pl-11 text-[13px] font-medium text-white transition-all focus:bg-white/[0.07] focus:border-aura-primary/30 focus:outline-none focus:ring-1 focus:ring-aura-primary/20 placeholder-aura-muted"
              />
            </div>
            {playlistSearchTracks.length > 0 && (
              <div className="space-y-4">
                <h3 className="text-[10px] font-semibold tracking-wider text-aura-muted uppercase px-1">
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
                <div className="my-6 h-px bg-white/[0.04]" />
              </div>
            )}
          </div>
        )}

        <div className="space-y-3">
          {isAddingSongs && (
            <h3 className="text-[10px] font-semibold tracking-wider text-aura-muted uppercase px-1">Playlist Tracks</h3>
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

      {activePlaylist && (
        <CollaboratorsModal
          isOpen={isCollaboratorsOpen}
          onClose={() => setIsCollaboratorsOpen(false)}
          playlistId={activePlaylist.id}
          playlistName={activePlaylist.name}
        />
      )}
    </div>
  )
}
