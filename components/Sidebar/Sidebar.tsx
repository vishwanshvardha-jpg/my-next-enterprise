import { ChevronLeft, ChevronRight, Heart, Home, Library, Music, Plus, Trash2 } from "lucide-react"
import posthog from "posthog-js"
import { useFeatureFlagEnabled } from "posthog-js/react"
import { useEffect, useState } from "react"
import { CreatePlaylistModal } from "components/Playlist/CreatePlaylistModal"
import { useAuth } from "components/Providers/AuthProvider"
import { Tooltip } from "components/Tooltip/Tooltip"
import { useLibraryStore, useUIStore } from "lib/store"
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

  const { isSidebarCollapsed, toggleSidebar } = useUIStore()
  const [isModalOpen, setIsModalOpen] = useState(false)

  useEffect(() => {
    fetchInitialData(user)
  }, [user, fetchInitialData])

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
      className={`bg-aura-bg relative flex h-full flex-col border-r border-white/10 font-sans transition-all duration-300 ${
        isSidebarCollapsed ? "w-20" : "w-72"
      }`}
    >
      {/* Top Section: Fixed (Tooltips won't be clipped) */}
      <div className="flex-shrink-0 space-y-10 p-4 lg:p-6">
        {/* Branding & Toggle */}
        <div className="flex items-center justify-between">
          <div
            onClick={() => {
              selectPlaylist("home")
              window.dispatchEvent(new CustomEvent("aura-home-reset"))
            }}
            className={`group flex cursor-pointer items-center gap-3 px-2 ${
              isSidebarCollapsed ? "w-full justify-center" : ""
            }`}
          >
            <div className="bg-aura-primary shadow-aura-primary/30 flex h-10 w-10 flex-shrink-0 transform items-center justify-center rounded-2xl shadow-lg transition-transform group-hover:scale-110">
              <Music className="h-5 w-5 text-white" />
            </div>
            {!isSidebarCollapsed && (
              <h1 className="font-display text-xl font-black tracking-tighter whitespace-nowrap text-white">
                AURA<span className="text-aura-primary">MUSIC</span>
              </h1>
            )}
          </div>

          {!isSidebarCollapsed && (
            <button
              onClick={toggleSidebar}
              className="text-aura-muted rounded-xl p-2 transition-all hover:bg-white/5 hover:text-white"
            >
              <ChevronLeft size={20} />
            </button>
          )}
        </div>

        {isSidebarCollapsed && (
          <div className="flex justify-center">
            <button
              onClick={toggleSidebar}
              className="text-aura-muted rounded-xl p-2 transition-all hover:bg-white/5 hover:text-white"
            >
              <ChevronRight size={20} />
            </button>
          </div>
        )}

        {/* Navigation */}
        <nav className="space-y-2">
          <Tooltip side="right" sideOffset={20} explainer="Home" open={isSidebarCollapsed ? undefined : false}>
            <button
              onClick={() => {
                selectPlaylist("home")
                window.dispatchEvent(new CustomEvent("aura-home-reset"))
              }}
              className={`group relative flex w-full items-center gap-4 rounded-2xl px-4 py-3 transition-all duration-300 ${
                !activeId || activeId === "home"
                  ? "bg-aura-surface text-white shadow-sm"
                  : "text-aura-muted hover:bg-white/5 hover:text-white"
              } ${isSidebarCollapsed ? "justify-center px-0" : ""}`}
            >
              <Home
                className={`h-5 w-5 flex-shrink-0 ${
                  !activeId || activeId === "home" ? "text-aura-primary" : "text-aura-muted group-hover:text-white"
                }`}
              />
              {!isSidebarCollapsed && <span className="font-bold tracking-tight whitespace-nowrap">Home</span>}
            </button>
          </Tooltip>

          <Tooltip side="right" sideOffset={20} explainer="My Library" open={isSidebarCollapsed ? undefined : false}>
            <button
              onClick={() => selectPlaylist("library")}
              className={`group relative flex w-full items-center gap-4 rounded-2xl px-4 py-3 transition-all duration-300 ${
                activeId === "library"
                  ? "bg-aura-surface text-white shadow-sm"
                  : "text-aura-muted hover:bg-white/5 hover:text-white"
              } ${isSidebarCollapsed ? "justify-center px-0" : ""}`}
            >
              <Library
                className={`h-5 w-5 flex-shrink-0 ${
                  activeId === "library" ? "text-aura-primary" : "text-aura-muted group-hover:text-white"
                }`}
              />
              {!isSidebarCollapsed && <span className="font-bold tracking-tight whitespace-nowrap">My Library</span>}
            </button>
          </Tooltip>
        </nav>
      </div>

      {/* Bottom Section: Scrollable (Playlists) */}
      <div className="no-scrollbar flex-1 space-y-6 overflow-y-auto px-4 pb-6 lg:px-6">
        <div className="space-y-6">
          <div className={`flex items-center px-4 ${isSidebarCollapsed ? "justify-center" : "justify-between"}`}>
            {!isSidebarCollapsed && (
              <h3 className="text-aura-muted text-[12px] font-black tracking-[0.2em] uppercase">Playlists</h3>
            )}
            <button
              onClick={() => setIsModalOpen(true)}
              className={`transition-all ${
                isProminent
                  ? "bg-aura-primary/10 text-aura-primary hover:bg-aura-primary/20 rounded-lg px-2 py-1 flex items-center gap-1.5 text-[9px] font-bold uppercase tracking-wider"
                  : "text-aura-muted hover:text-aura-primary p-1"
              }`}
            >
              <Plus size={isSidebarCollapsed ? 20 : 16} />
              {!isSidebarCollapsed && isProminent && <span>New</span>}
            </button>
          </div>

          <div className="space-y-2">
            <Tooltip side="right" sideOffset={20} explainer="Liked Songs" open={isSidebarCollapsed ? undefined : false}>
              <button
                onClick={() => selectPlaylist("liked")}
                className={`group relative flex w-full items-center gap-4 rounded-xl px-4 py-3 transition-all ${
                  activeId === "liked"
                    ? "bg-aura-primary/10 text-white"
                    : "text-aura-muted hover:bg-white/5 hover:text-white"
                } ${isSidebarCollapsed ? "justify-center px-0" : ""}`}
              >
                <div className="from-aura-primary to-aura-secondary flex h-8 w-8 flex-shrink-0 items-center justify-center rounded-lg bg-gradient-to-br text-white shadow-md">
                  <Heart size={14} fill="currentColor" />
                </div>
                {!isSidebarCollapsed && (
                  <span className="font-bold tracking-tight whitespace-nowrap">Liked Songs</span>
                )}
              </button>
            </Tooltip>

            {playlists.map((playlist) => (
              <div key={playlist.id} className="group relative">
                <Tooltip side="right" sideOffset={20} explainer={playlist.name} open={isSidebarCollapsed ? undefined : false}>
                  <button
                    onClick={() => selectPlaylist(playlist.id)}
                    className={`relative flex w-full items-center gap-4 rounded-xl px-4 py-3 transition-all ${
                      activeId === playlist.id
                        ? "bg-white/5 text-white"
                        : "text-aura-muted hover:bg-white/5 hover:text-white"
                    } ${isSidebarCollapsed ? "justify-center px-0" : ""}`}
                  >
                    <div className="bg-aura-surface text-aura-muted group-hover:text-aura-primary flex h-8 w-8 flex-shrink-0 items-center justify-center rounded-lg transition-colors">
                      <Music size={14} />
                    </div>
                    {!isSidebarCollapsed && (
                      <span className="truncate pr-6 font-bold tracking-tight">{playlist.name}</span>
                    )}
                  </button>
                </Tooltip>
                {!isSidebarCollapsed && (
                  <button
                    onClick={(e) => handleDeletePlaylist(e, playlist.id)}
                    className="text-aura-muted absolute top-1/2 right-4 -translate-y-1/2 p-1.5 opacity-0 transition-all group-hover:opacity-100 hover:text-red-500"
                  >
                    <Trash2 size={12} />
                  </button>
                )}
              </div>
            ))}
          </div>
        </div>
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
