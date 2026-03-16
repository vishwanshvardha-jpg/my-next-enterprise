"use client"

import { useCallback, useEffect, useState } from "react"
import { AuthOverlay } from "components/Auth/AuthOverlay"
import { NowPlayingBar } from "components/NowPlayingBar/NowPlayingBar"
import { useAuth } from "components/Providers/AuthProvider"
import { Sidebar } from "components/Sidebar/Sidebar"
import { TopNav } from "components/TopNav/TopNav"
import { HomeView } from "components/HomeView"
import { LibraryView } from "components/LibraryView"
import { PlaylistView } from "components/PlaylistView"
import { iTunesTrack } from "lib/itunes"
import { useLibraryStore, usePlaybackStore } from "lib/store"
import { AnimatePresence, motion } from "framer-motion"

export default function AuraMusicPage() {
  const { user } = useAuth()
  
  // ─── State ──────────────────────────────────────────────────────
  const [tracks, setTracks] = useState<(iTunesTrack & { addedAt?: string })[]>([])
  const [recentlyPlayed, setRecentlyPlayed] = useState<iTunesTrack[]>([])
  const [isLoading, setIsLoading] = useState(false)
  const [searchQuery, setSearchQuery] = useState("Top Hits")
  const [isAuthOpen, setIsAuthOpen] = useState(false)
  const [isSearching, setIsSearching] = useState(false)
  const [featuredTrack, setFeaturedTrack] = useState<iTunesTrack | null>(null)

  // Library / Navigation State (Global)
  const {
    playlists,
    likedSongs,
    activePlaylistId,
    playlistTracks,
    fetchInitialData: fetchLibraryData,
    selectPlaylist,
    toggleLike: handleToggleLikeStore,
    addToPlaylist: handleAddToPlaylistStore,
  } = useLibraryStore()

  // Playback Store
  const { 
    currentTrack, 
    isPlaying, 
    pause: handlePause, 
    setTrack,
    setList
  } = usePlaybackStore()

  // ─── Search Logic ───────────────────────────────────────────────
  const handleSearch = useCallback(async (query: string) => {
    if (!query.trim()) return

    setIsLoading(true)
    setIsSearching(query !== "Top Hits")
    setSearchQuery(query)
    
    if (activePlaylistId !== "home" && query !== "Top Hits") {
      selectPlaylist("home")
    }

    try {
      const res = await fetch(`http://localhost:4000/v1/music/search?q=${encodeURIComponent(query)}`)
      if (!res.ok) throw new Error("Search failed")
      const data = (await res.json()) as { tracks: iTunesTrack[] }
      setTracks(data.tracks)
      setList(data.tracks)
    } catch (err) {
      console.error("Search error:", err)
      setTracks([])
    } finally {
      setIsLoading(false)
    }
  }, [activePlaylistId, setList, selectPlaylist])

  const handleClearSearch = useCallback(() => {
    setIsSearching(false)
    setSearchQuery("Top Hits")
    handleSearch("Top Hits")
  }, [handleSearch])

  useEffect(() => {
    fetchLibraryData(user)
    handleSearch("Top Hits")

    const handleHomeReset = () => handleClearSearch()
    window.addEventListener('aura-home-reset', handleHomeReset)
    return () => window.removeEventListener('aura-home-reset', handleHomeReset)
  }, [user, fetchLibraryData, handleSearch, handleClearSearch])

  useEffect(() => {
    if (tracks.length > 0 && !featuredTrack) {
      const random = tracks[Math.floor(Math.random() * tracks.length)]
      if (random) setFeaturedTrack(random)
    }
  }, [tracks, featuredTrack])

  const likedSongIds = likedSongs.map(s => s.trackId)

  const handleToggleLike = useCallback(async (track: iTunesTrack) => {
    if (!user) {
      setIsAuthOpen(true)
      return
    }
    await handleToggleLikeStore(track, user)
  }, [user, handleToggleLikeStore])

  const handleAddToPlaylist = useCallback(async (track: iTunesTrack, playlistId: string) => {
    await handleAddToPlaylistStore(track, playlistId)
    // No need to fetch all data again if store handles it, but keeps sync
    // fetchLibraryData(user)
  }, [handleAddToPlaylistStore, user])

  // LocalStorage for Recent Tracks
  useEffect(() => {
    try {
      const stored = localStorage.getItem("aura_recent_tracks")
      if (stored) setRecentlyPlayed(JSON.parse(stored) as iTunesTrack[])
    } catch (e) {
      console.error(e)
    }
  }, [])

  const saveToRecent = useCallback((track: iTunesTrack) => {
    setRecentlyPlayed(prev => {
      const filtered = prev.filter(t => t.trackId !== track.trackId)
      const next = [track, ...filtered].slice(0, 8)
      try { localStorage.setItem("aura_recent_tracks", JSON.stringify(next)) } catch (e) { console.error(e) }
      return next
    })
  }, [])

  const handlePlayFromCard = useCallback((track: iTunesTrack, context: "search" | "recent" | "playlist" | "library") => {
    let list: iTunesTrack[] = []
    if (context === "search") list = tracks
    else if (context === "recent") list = recentlyPlayed
    else if (context === "playlist" || context === "library") list = playlistTracks

    setTrack(track, context, list)
    saveToRecent(track)
  }, [tracks, recentlyPlayed, playlistTracks, setTrack, saveToRecent])

  const renderContent = () => {
    if (activePlaylistId === "home") {
      return (
        <HomeView 
          key="home"
          tracks={tracks}
          featuredTrack={featuredTrack}
          recentlyPlayed={recentlyPlayed}
          isSearching={isSearching}
          searchQuery={searchQuery}
          isLoading={isLoading}
          onSearch={handleSearch}
          onPlayFromCard={handlePlayFromCard}
          handleToggleLike={handleToggleLike}
          handleAddToPlaylist={handleAddToPlaylist}
          likedSongIds={likedSongIds}
          playlists={playlists}
        />
      )
    }

    if (activePlaylistId === "library") {
      return <LibraryView key="library" />
    }

    return (
      <PlaylistView 
        key={`playlist-${activePlaylistId}`}
        onPlayFromCard={handlePlayFromCard}
        handleToggleLike={handleToggleLike}
        handleAddToPlaylist={handleAddToPlaylist}
        likedSongIds={likedSongIds}
      />
    )
  }

  return (
    <div className="flex bg-aura-bg min-h-screen text-white font-sans overflow-hidden">
      {/* Sidebar - Desktop Only */}
      <div className="hidden lg:block h-screen sticky top-0 z-50">
        <Sidebar />
      </div>

      {/* Main Content */}
      <main className="flex-1 min-h-screen pb-40 overflow-y-auto no-scrollbar relative flex flex-col">
        <TopNav 
          onHome={handleClearSearch} 
          onSearch={handleSearch} 
          onClearSearch={handleClearSearch} 
          isSearchLoading={isLoading}
        />
        
        <div className="flex-1 px-8 py-4 lg:px-12 max-w-[2000px] mx-auto w-full">
          <AnimatePresence mode="wait">
            <motion.div
              key={activePlaylistId}
              initial={{ opacity: 0, y: 10 }}
              animate={{ opacity: 1, y: 0 }}
              exit={{ opacity: 0, y: -10 }}
              transition={{ duration: 0.3 }}
            >
              {renderContent()}
            </motion.div>
          </AnimatePresence>
        </div>
      </main>

      {/* Player Bar */}
      <NowPlayingBar />

      <AuthOverlay isOpen={isAuthOpen} onClose={() => setIsAuthOpen(false)} />
    </div>
  )
}
