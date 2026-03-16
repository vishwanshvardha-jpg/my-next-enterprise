"use client"

import { Play, Plus, Search, Shuffle, List, Grid, Music, Heart, User as UserIcon } from "lucide-react"
import { useLibraryStore, usePlaybackStore } from "lib/store"
import { useAuth } from "components/Providers/AuthProvider"
import { TrackList } from "components/TrackList/TrackList"
import { iTunesTrack } from "lib/itunes"
import { motion } from "framer-motion"
import { useState, useCallback, useMemo } from "react"
import { debounce } from "lodash"

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
  likedSongIds
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
    handlePlaylistSearch
  } = useLibraryStore()

  const { isPlaying, currentTrack, pause: handlePause } = usePlaybackStore()
  const [viewMode, setViewMode] = useState<'grid' | 'list'>('list')

  const debouncedSearch = useMemo(
    () => debounce((query: string) => handlePlaylistSearch(query), 400),
    [handlePlaylistSearch]
  )

  const handlePlayAll = () => {
    if (playlistTracks.length > 0) {
      const track = playlistTracks[0];
      if (track) {
        const context = activePlaylistId === 'liked' ? 'library' : 'playlist'
        onPlayFromCard(track, context)
      }
    }
  }

  return (
    <div className="space-y-12 animate-in fade-in slide-in-from-bottom-4 duration-700 pb-20">
      {/* Dynamic Header */}
      <header className="flex flex-col md:flex-row items-end gap-6 pb-2">
        <div className={`relative h-36 w-36 md:h-44 md:w-44 rounded-[2rem] shadow-xl overflow-hidden group flex-shrink-0 ${
          activePlaylistId === 'liked' ? 'bg-gradient-to-br from-aura-primary to-aura-accent' : 'bg-aura-surface border border-white/5'
        }`}>
          <div className="absolute inset-0 flex items-center justify-center">
            {activePlaylistId === 'liked' ? (
              <Heart className="h-14 w-14 text-white fill-current" />
            ) : (
              <Music className="h-14 w-14 text-aura-muted group-hover:text-aura-primary transition-colors duration-500" />
            )}
          </div>
          <motion.button 
            whileHover={{ scale: 1.1 }}
            whileTap={{ scale: 0.95 }}
            onClick={handlePlayAll}
            className="absolute bottom-3 right-3 h-10 w-10 rounded-full bg-white text-black flex items-center justify-center shadow-2xl opacity-0 group-hover:opacity-100 transition-opacity duration-300"
          >
            <Play size={16} fill="currentColor" className="ml-0.5" />
          </motion.button>
        </div>

        <div className="flex-1 space-y-2.5 pb-2">
          <div className="inline-block px-2.5 py-0.5 bg-white/5 rounded-full text-[8px] font-black uppercase tracking-[0.2em] text-aura-primary border border-white/10">
            {activePlaylistId === 'liked' ? 'Public' : 'Playlist'}
          </div>
          <h1 className="text-3xl md:text-5xl font-display font-black tracking-tight text-white mb-1 line-clamp-1 leading-tight">
            {currentPlaylistName || "Your Vibes"}
          </h1>
          <div className="flex items-center gap-3 text-aura-muted text-[10px] font-bold uppercase tracking-widest leading-none">
            <span className="flex items-center gap-1.5 text-white">
              <UserIcon size={11} className="text-aura-primary" /> {user?.email?.split('@')[0]}
            </span>
            <span className="w-1 h-1 rounded-full bg-white/10" />
            <span>{playlistTracks.length} tracks</span>
          </div>
        </div>
      </header>

      {/* Controls Bar */}
      <div className="flex items-center justify-between pb-6 border-b border-white/5">
        <div className="flex items-center gap-8">
          <motion.button 
            whileHover={{ scale: 1.05 }}
            whileTap={{ scale: 0.95 }}
            onClick={handlePlayAll}
            className="px-10 py-4 bg-aura-primary rounded-2xl text-white font-black uppercase tracking-widest text-xs shadow-xl shadow-aura-primary/30 flex items-center gap-3"
          >
            <Play fill="currentColor" size={18} /> Play All
          </motion.button>
          
          <button 
            onClick={() => setAddingSongs(!isAddingSongs)}
            className={`flex items-center gap-2 px-6 py-4 rounded-2xl text-xs font-black uppercase tracking-widest transition-all border ${
              isAddingSongs ? 'bg-white text-black border-white' : 'bg-white/5 text-white border-white/10 hover:bg-white/10'
            }`}
          >
            <Plus size={16} />
            Add Track
          </button>
        </div>

        <div className="hidden lg:flex items-center gap-4 bg-white/5 p-1 rounded-2xl border border-white/5">
          <button 
            onClick={() => setViewMode('list')}
            className={`p-3 rounded-xl transition-all ${viewMode === 'list' ? 'text-white bg-white/10 shadow-lg' : 'text-aura-muted hover:text-white'}`}
          >
            <List size={20} />
          </button>
          <button 
            onClick={() => setViewMode('grid')}
            className={`p-3 rounded-xl transition-all ${viewMode === 'grid' ? 'text-white bg-white/10 shadow-lg' : 'text-aura-muted hover:text-white'}`}
          >
            <Grid size={20} />
          </button>
        </div>
      </div>

      <div className="min-h-[400px]">
        {isAddingSongs && (
          <div className="space-y-8 animate-in slide-in-from-top-4 duration-500 mb-12">
            <div className="max-w-2xl relative">
              <Search className="absolute left-5 top-1/2 -translate-y-1/2 text-aura-muted h-5 w-5" />
              <input 
                autoFocus
                placeholder="Find tracks to add to your collection..."
                onChange={(e) => debouncedSearch(e.target.value)}
                className="w-full h-14 bg-white/5 border border-white/5 rounded-2xl py-4 pl-14 pr-4 text-white placeholder-aura-muted focus:outline-none focus:bg-white/10 transition-all font-medium text-sm"
              />
            </div>
            {playlistSearchTracks.length > 0 && (
              <div className="space-y-4">
                <h3 className="text-[9px] font-black uppercase tracking-[0.3em] text-aura-muted px-2">Search Results</h3>
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
                <div className="h-px bg-white/5 my-8" />
              </div>
            )}
          </div>
        )}

        <div className="space-y-4">
          {isAddingSongs && <h3 className="text-[9px] font-black uppercase tracking-[0.3em] text-aura-muted px-2">Playlist Tracks</h3>}
          <TrackList
            tracks={playlistTracks}
            currentTrackId={currentTrack?.trackId ?? null}
            isPlaying={isPlaying}
            onPlay={(t) => onPlayFromCard(t, activePlaylistId === 'liked' ? 'library' : 'playlist')}
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
