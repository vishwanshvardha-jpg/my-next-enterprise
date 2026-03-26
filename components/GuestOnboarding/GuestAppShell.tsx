"use client"

import { AnimatePresence, motion } from "framer-motion"
import Link from "next/link"
import { useCallback, useEffect, useState } from "react"
import { AuthOverlay } from "components/Auth/AuthOverlay"
import { HomeView } from "components/HomeView"
import { NowPlayingBar } from "components/NowPlayingBar/NowPlayingBar"
import { NowPlayingBarV2 } from "components/NowPlayingBar/NowPlayingBarV2"
import { PlaylistView } from "components/PlaylistView"
import { Sidebar } from "components/Sidebar/Sidebar"
import { TopNav } from "components/TopNav/TopNav"
import { getPublicSharedPlaylist } from "lib/actions/playlists"
import { iTunesTrack } from "lib/itunes"
import { useLibraryStore, usePlaybackStore, useUIStore } from "lib/store"
import { useGuestStore } from "lib/store/guest"
import { CoachmarkTour } from "./CoachmarkTour"
import { GuestIndicator } from "./GuestIndicator"
import { QuickTourButton } from "./QuickTourButton"
import { SongLimitModal } from "./SongLimitModal"
import { useFeatureFlagEnabled } from "posthog-js/react"

interface GuestAppShellProps {
  token: string
}

export function GuestAppShell({ token }: GuestAppShellProps) {
  const [error, setError] = useState(false)
  const [isAuthOpen, setIsAuthOpen] = useState(false)
  const [searchTracks, setSearchTracks] = useState<iTunesTrack[]>([])
  const [isSearchLoading, setIsSearchLoading] = useState(false)
  const [searchQuery, setSearchQuery] = useState("Top Hits")
  const [isSearching, setIsSearching] = useState(false)

  const { enterGuestMode, skipTour, songsPlayed, limitModalDismissed, dismissLimitModal, isGuest } = useGuestStore()
  const { loadGuestPlaylist, activePlaylistId, selectPlaylist } = useLibraryStore()
  const { isSidebarCollapsed, isMobileSidebarOpen, setMobileSidebarOpen } = useUIStore()
  const { setList } = usePlaybackStore()
  const rightPanelFlagEnabled = useFeatureFlagEnabled("right-panel-now-playing")

  const handleRequestSignUp = useCallback(() => {
    skipTour()
    setIsAuthOpen(true)
  }, [skipTour])

  const handleSearch = useCallback(async (query: string) => {
    if (!query.trim()) return
    setIsSearchLoading(true)
    setIsSearching(query !== "Top Hits")
    setSearchQuery(query)
    selectPlaylist("home")
    try {
      const apiBase = process.env.NEXT_PUBLIC_API_BASE || "http://localhost:4000"
      const res = await fetch(`${apiBase}/v1/music/search?q=${encodeURIComponent(query)}`)
      if (!res.ok) throw new Error("Search failed")
      const data = (await res.json()) as { tracks: iTunesTrack[] }
      setSearchTracks(data.tracks)
      setList(data.tracks)
    } catch {
      setSearchTracks([])
    } finally {
      setIsSearchLoading(false)
    }
  }, [selectPlaylist, setList])

  const handleClearSearch = useCallback(() => {
    setIsSearching(false)
    setSearchQuery("Top Hits")
    handleSearch("Top Hits")
  }, [handleSearch])

  useEffect(() => {
    let cancelled = false

    getPublicSharedPlaylist(token).then((result) => {
      if (cancelled) return

      if (!result) {
        setError(true)
        return
      }

      enterGuestMode(result.playlist.id, token)
      loadGuestPlaylist(result.playlist, result.tracks)
      handleSearch("Top Hits")
    })

    return () => { cancelled = true }
  }, [token, enterGuestMode, loadGuestPlaylist, handleSearch])

  if (error) {
    return (
      <div className="bg-aura-bg flex h-screen flex-col items-center justify-center gap-4 font-sans text-white">
        <div className="text-5xl">🔗</div>
        <h1 className="text-2xl font-bold">Link invalid or expired</h1>
        <p className="text-sm text-white/50">This share link no longer works.</p>
        <Link
          href="/"
          className="btn-primary mt-2 px-6 py-3 text-sm font-bold"
        >
          Create your own playlists — Sign up free
        </Link>
      </div>
    )
  }

  if (!isGuest) {
    return (
      <div className="bg-aura-bg flex h-screen items-center justify-center font-sans text-white">
        <div className="flex flex-col items-center gap-3">
          <div className="h-8 w-8 animate-spin rounded-full border-2 border-aura-primary border-t-transparent" />
          <span className="text-sm text-white/40">Loading playlist…</span>
        </div>
      </div>
    )
  }

  return (
    <div className="bg-aura-bg flex h-screen overflow-hidden font-sans text-white">
      {/* Desktop Sidebar */}
      <div
        className={`fixed top-0 left-0 z-50 hidden h-screen transition-all duration-300 lg:block ${
          isSidebarCollapsed ? "w-20" : "w-72"
        }`}
      >
        <Sidebar onRequestSignUp={handleRequestSignUp} />
      </div>

      {/* Mobile Sidebar Overlay */}
      {isMobileSidebarOpen && (
        <div className="fixed inset-0 z-50 lg:hidden">
          <div
            className="absolute inset-0 bg-black/60 backdrop-blur-sm"
            onClick={() => setMobileSidebarOpen(false)}
          />
          <div className="absolute top-0 left-0 h-full w-72">
            <Sidebar onRequestSignUp={handleRequestSignUp} />
          </div>
        </div>
      )}

      {/* Main Content */}
      <main
        className={`no-scrollbar relative flex flex-1 flex-col overflow-y-auto pb-28 transition-all duration-300 ${
          isSidebarCollapsed ? "lg:ml-20" : "lg:ml-72"
        }`}
      >
        <TopNav
          onHome={handleClearSearch}
          onSearch={handleSearch}
          onClearSearch={handleClearSearch}
          isSearchLoading={isSearchLoading}
          onRequestSignUp={handleRequestSignUp}
        />

        <div className="mx-auto w-full max-w-[2000px] flex-1 px-6 py-4 lg:px-10">
          <AnimatePresence mode="wait">
            <motion.div
              key={activePlaylistId}
              initial={{ opacity: 0, y: 10 }}
              animate={{ opacity: 1, y: 0 }}
              exit={{ opacity: 0, y: -10 }}
              transition={{ duration: 0.3 }}
            >
              {activePlaylistId === "home" ? (
                <HomeView
                  key="home"
                  tracks={searchTracks}
                  featuredTrack={searchTracks[0] ?? null}
                  recentlyPlayed={[]}
                  isSearching={isSearching}
                  searchQuery={searchQuery}
                  isLoading={isSearchLoading}
                  onSearch={handleSearch}
                  onPlayFromCard={() => handleRequestSignUp()}
                  handleToggleLike={() => handleRequestSignUp()}
                  handleAddToPlaylist={() => handleRequestSignUp()}
                  likedSongIds={[]}
                  playlists={[]}
                  followedArtists={[]}
                  toggleFollow={() => handleRequestSignUp()}
                  isFollowing={() => false}
                />
              ) : (
                <PlaylistView
                  onPlayFromCard={() => handleRequestSignUp()}
                  handleToggleLike={() => handleRequestSignUp()}
                  handleAddToPlaylist={() => handleRequestSignUp()}
                  likedSongIds={[]}
                />
              )}
            </motion.div>
          </AnimatePresence>
        </div>
      </main>

      {rightPanelFlagEnabled ? <NowPlayingBarV2 /> : <NowPlayingBar />}

      {/* Guest-only overlays */}
      <GuestIndicator />
      <CoachmarkTour onRequestSignUp={handleRequestSignUp} />
      <QuickTourButton />
      <SongLimitModal
        isOpen={songsPlayed >= 1 && !limitModalDismissed}
        onClose={dismissLimitModal}
        onSignUp={handleRequestSignUp}
      />
      <AuthOverlay isOpen={isAuthOpen} onClose={() => setIsAuthOpen(false)} defaultSignUp />
    </div>
  )
}
