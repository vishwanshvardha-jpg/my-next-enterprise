import { ChevronLeft, Heart, Home, Library, Music, Plus, Trash2 } from "lucide-react"
import Image from "next/image"
import posthog from "posthog-js"
import { useFeatureFlagEnabled } from "posthog-js/react"
import { useEffect, useState } from "react"
import { CreatePlaylistModal } from "components/Playlist/CreatePlaylistModal"
import { useAuth } from "components/Providers/AuthProvider"
import { Tooltip } from "components/Tooltip/Tooltip"
import { iTunesTrack } from "lib/itunes"
import { useLibraryStore, usePlaybackStore, useUIStore } from "lib/store"
import { Playlist } from "lib/types"

export function Sidebar() {
  const { user } = useAuth()
  const flagEnabled = useFeatureFlagEnabled("new-playlist-button-style")
  const isProminent = flagEnabled === true
  const {
    playlists,
    activePlaylistId: activeId,
    selectPlaylist,
    fetchInitialData,
    deletePlaylist,
    refreshPlaylists,
  } = useLibraryStore()

  const { currentTrack, isPlaying } = usePlaybackStore()
  const { isSidebarCollapsed, toggleSidebar } = useUIStore()
  const [isModalOpen, setIsModalOpen] = useState(false)
  const [activeTab, setActiveTab] = useState<"playlist" | "recent" | "recommended">("playlist")
  const [recentTracks, setRecentTracks] = useState<iTunesTrack[]>([])

  useEffect(() => {
    fetchInitialData(user)
  }, [user, fetchInitialData])

  // Read recently played from localStorage (same source as HomeView)
  useEffect(() => {
    const loadRecent = () => {
      try {
        const stored = localStorage.getItem("aura_recent_tracks")
        if (stored) setRecentTracks(JSON.parse(stored) as iTunesTrack[])
      } catch (e) {
        console.error(e)
      }
    }
    loadRecent()
    // Listen for storage changes so sidebar updates when a track is played
    const handleStorage = (e: StorageEvent) => {
      if (e.key === "aura_recent_tracks") loadRecent()
    }
    // Also poll periodically since same-tab localStorage writes don't fire StorageEvent
    const interval = setInterval(loadRecent, 2000)
    window.addEventListener("storage", handleStorage)
    return () => {
      window.removeEventListener("storage", handleStorage)
      clearInterval(interval)
    }
  }, [])

  const handleDeletePlaylist = async (e: React.MouseEvent, id: string) => {
    e.stopPropagation()
    if (!confirm("Are you sure you want to delete this playlist?")) return
    const playlist = playlists.find((p) => p.id === id)
    posthog.capture("playlist_deleted", {
      playlist_id: id,
      playlist_name: playlist?.name,
    })
    await deletePlaylist(id)
  }

  return (
    <aside
      className={`glass-sidebar relative flex h-full flex-col font-sans transition-all duration-300 ${
        isSidebarCollapsed ? "w-20" : "w-72"
      }`}
    >
      {/* Header */}
      <div className="flex-shrink-0 p-5">
        {/* Branding & Toggle */}
        <div className="mb-8 flex items-center justify-between">
          <div
            onClick={() => {
              if (isSidebarCollapsed) {
                toggleSidebar()
              } else {
                selectPlaylist("home")
                window.dispatchEvent(new CustomEvent("aura-home-reset"))
              }
            }}
            className={`group flex cursor-pointer items-center gap-3 ${
              isSidebarCollapsed ? "w-full justify-center" : ""
            }`}
            title={isSidebarCollapsed ? "Expand sidebar" : "Go home"}
          >
            <div className="relative flex h-9 w-9 flex-shrink-0 items-center justify-center rounded-xl bg-aura-primary/15">
              <Music className="h-4 w-4 text-aura-primary" />
              <div className="absolute inset-0 rounded-xl bg-aura-primary/10 animate-glow-pulse" />
            </div>
            {!isSidebarCollapsed && (
              <span className="font-display text-lg font-bold tracking-tight text-white">
                Aura Music
              </span>
            )}
          </div>

          {!isSidebarCollapsed && (
            <button
              onClick={toggleSidebar}
              className="text-aura-muted rounded-lg p-1.5 transition-all hover:bg-white/5 hover:text-white"
            >
              <ChevronLeft size={18} />
            </button>
          )}
        </div>

        {/* Sidebar Tabs */}
        {!isSidebarCollapsed && (
          <div className="mb-6 flex items-center gap-1 rounded-xl bg-white/[0.03] p-1">
            {[
              { id: "playlist" as const, label: "My Playlist" },
              { id: "recent" as const, label: "Last Listening" },
              { id: "recommended" as const, label: "Recommended" },
            ].map((tab) => (
              <button
                key={tab.id}
                onClick={() => setActiveTab(tab.id)}
                className={`flex-1 rounded-lg px-2 py-2 text-[10px] font-semibold tracking-wide transition-all ${
                  activeTab === tab.id
                    ? "bg-white/[0.08] text-white shadow-sm"
                    : "text-aura-muted hover:text-white/70"
                }`}
              >
                {tab.label}
              </button>
            ))}
          </div>
        )}

        {/* Navigation */}
        {isSidebarCollapsed && (
          <nav className="space-y-1">
            <Tooltip side="right" sideOffset={20} explainer="Home" open={undefined}>
              <button
                onClick={() => {
                  selectPlaylist("home")
                  window.dispatchEvent(new CustomEvent("aura-home-reset"))
                }}
                className={`group relative flex w-full items-center justify-center rounded-xl p-3 transition-all ${
                  !activeId || activeId === "home"
                    ? "bg-aura-primary/10 text-aura-primary"
                    : "text-aura-muted hover:bg-white/5 hover:text-white"
                }`}
              >
                <Home className="h-5 w-5 flex-shrink-0" />
              </button>
            </Tooltip>

            <Tooltip side="right" sideOffset={20} explainer="My Library" open={undefined}>
              <button
                onClick={() => selectPlaylist("library")}
                className={`group relative flex w-full items-center justify-center rounded-xl p-3 transition-all ${
                  activeId === "library"
                    ? "bg-aura-primary/10 text-aura-primary"
                    : "text-aura-muted hover:bg-white/5 hover:text-white"
                }`}
              >
                <Library className="h-5 w-5 flex-shrink-0" />
              </button>
            </Tooltip>
          </nav>
        )}
      </div>

      {/* Queue / Track List */}
      <div className="no-scrollbar flex-1 overflow-y-auto px-3 pb-6">
        {activeTab === "playlist" && (
          <div className="space-y-0.5">
            {/* Liked Songs */}
            <Tooltip side="right" sideOffset={20} explainer="Liked Songs" open={isSidebarCollapsed ? undefined : false}>
              <button
                onClick={() => selectPlaylist("liked")}
                className={`group relative flex w-full items-center ${isSidebarCollapsed ? 'justify-center p-3' : 'gap-3 px-3 py-2.5'} rounded-xl transition-all ${
                  activeId === "liked"
                    ? "bg-aura-primary/10 text-white"
                    : "text-aura-muted hover:bg-white/[0.04] hover:text-white"
                }`}
              >
                <div className={`${isSidebarCollapsed ? 'h-5 w-5' : 'h-7 w-7'} flex flex-shrink-0 items-center justify-center rounded-lg bg-gradient-to-br from-aura-primary/30 to-aura-secondary/30`}>
                  <Heart size={isSidebarCollapsed ? 14 : 12} fill="currentColor" className="text-aura-primary" />
                </div>
                {!isSidebarCollapsed && <span className="text-sm font-medium truncate">Liked Songs</span>}
              </button>
            </Tooltip>

            {/* Playlists */}
            {playlists.map((playlist) => (
              <div key={playlist.id} className="group relative">
                <Tooltip side="right" sideOffset={20} explainer={playlist.name} open={isSidebarCollapsed ? undefined : false}>
                  <button
                    onClick={() => selectPlaylist(playlist.id)}
                    className={`relative flex w-full items-center ${isSidebarCollapsed ? 'justify-center p-3' : 'gap-3 px-3 py-2.5'} rounded-xl transition-all ${
                      activeId === playlist.id
                        ? "bg-white/[0.06] text-white"
                        : "text-aura-muted hover:bg-white/[0.04] hover:text-white"
                    }`}
                  >
                    <div className={`bg-white/[0.06] text-aura-muted group-hover:text-aura-primary flex flex-shrink-0 items-center justify-center rounded-lg transition-colors ${isSidebarCollapsed ? 'h-6 w-6' : 'h-7 w-7'}`}>
                      <Music size={isSidebarCollapsed ? 14 : 12} />
                    </div>
                    {!isSidebarCollapsed && <span className="truncate text-sm font-medium">{playlist.name}</span>}
                  </button>
                </Tooltip>
                {!isSidebarCollapsed && (
                  <button
                    onClick={(e) => handleDeletePlaylist(e, playlist.id)}
                    className="text-aura-muted absolute top-1/2 right-3 -translate-y-1/2 p-1 opacity-0 transition-all group-hover:opacity-100 hover:text-red-400"
                  >
                    <Trash2 size={11} />
                  </button>
                )}
              </div>
            ))}

            {/* Create Playlist */}
            <Tooltip side="right" sideOffset={20} explainer={isProminent ? "New Playlist" : "Create"} open={isSidebarCollapsed ? undefined : false}>
              <button
                onClick={() => setIsModalOpen(true)}
                className={`mt-2 flex w-full items-center ${isSidebarCollapsed ? 'justify-center p-3' : 'gap-3 px-3 py-2.5'} rounded-xl transition-all ${
                  isProminent
                    ? "bg-aura-primary/10 text-aura-primary hover:bg-aura-primary/15"
                    : "text-aura-muted hover:bg-white/[0.04] hover:text-white"
                }`}
              >
                <div className={`flex flex-shrink-0 items-center justify-center rounded-lg border border-dashed border-white/15 ${isSidebarCollapsed ? 'h-6 w-6' : 'h-7 w-7'}`}>
                  <Plus size={isSidebarCollapsed ? 14 : 12} />
                </div>
                {!isSidebarCollapsed && (
                  <span className="text-sm font-medium">
                    {isProminent ? "New Playlist" : "Create"}
                  </span>
                )}
              </button>
            </Tooltip>
          </div>
        )}

        {/* Recently played tracks in sidebar */}
        {(activeTab === "recent" || activeTab === "recommended") && !isSidebarCollapsed && (
          <div className="space-y-0.5">
            {recentTracks.length > 0 ? (
              recentTracks.map((track: iTunesTrack, index: number) => {
                const isActive = currentTrack?.trackId === track.trackId
                return (
                  <div
                    key={`${track.trackId}-${index}`}
                    className={`group relative flex items-center gap-3 rounded-xl px-3 py-2.5 cursor-pointer transition-all ${
                      isActive
                        ? "bg-aura-primary/10 active-track-indicator"
                        : "hover:bg-white/[0.04]"
                    }`}
                  >
                    {/* Track Number */}
                    <span className={`w-5 text-right text-xs font-medium tabular-nums ${
                      isActive ? "text-aura-primary" : "text-aura-muted"
                    }`}>
                      {String(index + 1).padStart(2, "0")}
                    </span>

                    {/* Track Artwork (small) */}
                    {track.artworkUrl100 && (
                      <div className="relative h-8 w-8 flex-shrink-0 overflow-hidden rounded-lg">
                        <Image
                          src={track.artworkUrl100}
                          alt={track.trackName}
                          fill
                          sizes="32px"
                          className="object-cover"
                        />
                        {isActive && isPlaying && (
                          <div className="absolute inset-0 flex items-center justify-center bg-black/40">
                            <div className="flex items-end gap-[2px] h-3">
                              <span className="w-[2px] h-full bg-aura-primary animate-pulse rounded-full" />
                              <span className="w-[2px] h-2/3 bg-aura-primary animate-pulse rounded-full [animation-delay:0.2s]" />
                              <span className="w-[2px] h-full bg-aura-primary animate-pulse rounded-full [animation-delay:0.4s]" />
                            </div>
                          </div>
                        )}
                      </div>
                    )}

                    {/* Track Info */}
                    <div className="min-w-0 flex-1">
                      <p className={`truncate text-[13px] font-medium leading-tight ${
                        isActive ? "text-white" : "text-white/80"
                      }`}>
                        {track.trackName}
                      </p>
                      <p className="truncate text-[11px] text-aura-muted">
                        {track.artistName}
                      </p>
                    </div>
                  </div>
                )
              })
            ) : (
              <div className="py-12 text-center">
                <Music className="mx-auto mb-3 h-8 w-8 text-aura-muted/40" />
                <p className="text-xs text-aura-muted">
                  {activeTab === "recent" ? "Play some tracks to see them here" : "Suggestions coming soon"}
                </p>
              </div>
            )}
          </div>
        )}


      </div>

      <CreatePlaylistModal
        isOpen={isModalOpen}
        onClose={() => setIsModalOpen(false)}
        onSuccess={(p: Playlist) => {
          refreshPlaylists()
          selectPlaylist(p.id)
        }}
      />
    </aside>
  )
}
