"use client"

import { ChevronLeft, Clock, Heart, LayoutGrid, Music, Plus, Trash2, Users, X } from "lucide-react"
import { useFeatureFlagEnabled } from "posthog-js/react"
import { useEffect, useState } from "react"
import { AuthOverlay } from "components/Auth/AuthOverlay"
import { CreatePlaylistModal } from "components/Playlist/CreatePlaylistModal"
import { useAuth } from "components/Providers/AuthProvider"
import { Tooltip } from "components/Tooltip/Tooltip"
import { useLibraryStore, useUIStore } from "lib/store"
import { Playlist } from "lib/types"

function WaveformLogo({ className }: { className?: string }) {
  return (
    <svg viewBox="0 0 20 16" className={className} fill="currentColor" aria-hidden="true">
      <rect x="0" y="6" width="3" height="10" rx="1.5" opacity="0.45" />
      <rect x="4.25" y="3" width="3" height="13" rx="1.5" opacity="0.7" />
      <rect x="8.5" y="0" width="3" height="16" rx="1.5" />
      <rect x="12.75" y="3" width="3" height="13" rx="1.5" opacity="0.7" />
      <rect x="17" y="6" width="3" height="10" rx="1.5" opacity="0.45" />
    </svg>
  )
}

interface SidebarProps {
  onRequestSignUp?: () => void
}

export function Sidebar({ onRequestSignUp }: SidebarProps = {}) {
  const { user } = useAuth()
  const flagEnabled = useFeatureFlagEnabled("new-playlist-button-style")
  const [mounted, setMounted] = useState(false)
  useEffect(() => { setMounted(true) }, [])
  const isProminent = mounted && flagEnabled === true

  const {
    playlists,
    likedSongs,
    activePlaylistId: activeId,
    selectPlaylist,
    deletePlaylist,
    leavePlaylist,
    refreshPlaylists,
  } = useLibraryStore()

  const { isSidebarCollapsed, toggleSidebar, setMobileSidebarOpen } = useUIStore()
  const [isModalOpen, setIsModalOpen] = useState(false)
  const [isAuthOpen, setIsAuthOpen] = useState(false)

  const handleCreateClick = () => {
    if (!user) { setIsAuthOpen(true); return }
    setIsModalOpen(true)
  }

  const handleDeletePlaylist = async (e: React.MouseEvent, playlist: Playlist) => {
    e.stopPropagation()
    if (playlist.isShared) {
      if (!confirm(`Leave "${playlist.name}"? You will no longer have access to this playlist.`)) return
      await leavePlaylist(playlist.id)
    } else {
      if (!confirm("Are you sure you want to delete this playlist?")) return
      await deletePlaylist(playlist.id)
    }
  }

  const handleNavClick = (id: string) => {
    if (!user && (id === "recent" || id === "liked" || id === "playlist")) {
      onRequestSignUp?.()
      return
    }
    if (id === "recent") {
      selectPlaylist("recent")
      setMobileSidebarOpen(false)
    } else if (id === "liked") {
      selectPlaylist("liked")
      setMobileSidebarOpen(false)
    } else {
      // My Playlists — navigate home if we're on a special page
      if (activeId === "recent" || activeId === "liked") {
        selectPlaylist("home")
        window.dispatchEvent(new CustomEvent("aura-home-reset"))
      }
    }
  }

  const getNavActive = (id: string) => {
    if (id === "recent") return activeId === "recent"
    if (id === "liked") return activeId === "liked"
    return activeId !== "recent" && activeId !== "liked"
  }

  const ownPlaylists = playlists.filter((p) => !p.isShared)
  const sharedPlaylists = playlists.filter((p) => p.isShared)

  const navItems = [
    { id: "playlist", label: "My Playlists", Icon: LayoutGrid, count: undefined },
    { id: "liked", label: "Liked Songs", Icon: Heart, count: likedSongs.length > 0 ? likedSongs.length : undefined },
    { id: "recent", label: "Recently Played", Icon: Clock, count: undefined },
  ]

  return (
    <>
      <aside
        className={`glass-sidebar relative flex h-full flex-col font-sans transition-all duration-300 ${
          isSidebarCollapsed ? "w-20" : "w-72"
        }`}
      >
        {/* ── Header ── */}
        <div className="flex h-[72px] flex-shrink-0 items-center justify-between border-b border-white/[0.06] px-5">
          <div
            onClick={() => {
              if (isSidebarCollapsed) {
                toggleSidebar()
              } else {
                selectPlaylist("home")
                window.dispatchEvent(new CustomEvent("aura-home-reset"))
                setMobileSidebarOpen(false)
              }
            }}
            className={`group flex cursor-pointer items-center gap-3 ${
              isSidebarCollapsed ? "w-full justify-center" : ""
            }`}
            title={isSidebarCollapsed ? "Expand sidebar" : "Go home"}
          >
            <div className="relative flex h-10 w-10 flex-shrink-0 items-center justify-center rounded-xl bg-gradient-to-br from-aura-primary/20 to-aura-primary/5">
              <WaveformLogo className="h-4 w-5 text-aura-primary" />
              <div className="absolute inset-0 rounded-xl bg-aura-primary/10 animate-glow-pulse" />
            </div>
            {!isSidebarCollapsed && (
              <span className="font-display text-xl font-bold tracking-tight text-white">
                Repose Music
              </span>
            )}
          </div>

          {!isSidebarCollapsed && (
            <div className="flex items-center gap-1">
              <button
                onClick={() => setMobileSidebarOpen(false)}
                className="text-aura-muted rounded-lg p-1.5 transition-all hover:bg-white/5 hover:text-white lg:hidden"
                aria-label="Close menu"
              >
                <X size={18} />
              </button>
              <button
                onClick={toggleSidebar}
                className="text-aura-muted hidden rounded-lg p-1.5 transition-all hover:bg-white/5 hover:text-white lg:flex"
              >
                <ChevronLeft size={18} />
              </button>
            </div>
          )}
        </div>

        {/* ── Nav Items ── */}
        <div className="flex-shrink-0 px-3 pt-3 pb-1">
          {isSidebarCollapsed ? (
            <nav className="space-y-1">
              {navItems.map(({ id, label, Icon }) => (
                <Tooltip key={id} side="right" sideOffset={20} explainer={label} open={undefined}>
                  <button
                    onClick={() => handleNavClick(id)}
                    className={`flex w-full items-center justify-center rounded-xl p-3 transition-all ${
                      getNavActive(id)
                        ? "bg-aura-primary/10 text-aura-primary"
                        : "text-aura-muted hover:bg-white/5 hover:text-white"
                    }`}
                  >
                    <Icon className="h-5 w-5 flex-shrink-0" />
                  </button>
                </Tooltip>
              ))}
            </nav>
          ) : (
            <nav className="space-y-0.5">
              {navItems.map(({ id, label, Icon, count }) => {
                const isActive = getNavActive(id)
                return (
                  <button
                    key={id}
                    onClick={() => handleNavClick(id)}
                    className={`relative flex w-full items-center gap-3 rounded-xl px-3 py-2.5 transition-all ${
                      isActive ? "text-white" : "text-aura-muted hover:bg-white/[0.04] hover:text-white"
                    }`}
                  >
                    {isActive && (
                      <span className="absolute left-0 top-1/2 -translate-y-1/2 h-8 w-[3px] rounded-r-full bg-aura-primary" />
                    )}
                    <div className={`flex h-9 w-9 flex-shrink-0 items-center justify-center rounded-xl transition-colors ${
                      isActive ? "bg-aura-primary/15 text-aura-primary" : "bg-white/[0.06] text-aura-muted"
                    }`}>
                      <Icon size={15} />
                    </div>
                    <div className="min-w-0 flex-1 text-left">
                      <p className="text-sm font-medium leading-snug">{label}</p>
                      {count !== undefined && (
                        <p className="text-[11px] text-aura-muted">{count} songs</p>
                      )}
                    </div>
                  </button>
                )
              })}
            </nav>
          )}
        </div>

        {/* ── Scrollable Playlists ── */}
        <div className="no-scrollbar min-h-0 flex-1 overflow-y-auto px-3 py-2" data-coachmark="playlists-section">

          {/* Expanded: Your Playlists + Shared Playlists */}
          {!isSidebarCollapsed && (
            <>
              <div className="mt-3">
                <div className="mb-2 flex items-center justify-between px-3">
                  <span className="text-[10px] font-bold tracking-[0.15em] text-aura-muted uppercase">
                    Your Playlists
                  </span>
                  <Tooltip side="right" sideOffset={8} explainer="New Playlist">
                    <button
                      onClick={handleCreateClick}
                      className={`flex items-center gap-1.5 rounded-full px-3 py-1 text-[11px] font-semibold transition-all ${
                        isProminent
                          ? "bg-aura-primary/15 text-aura-primary hover:bg-aura-primary/25"
                          : "bg-white/[0.06] text-white/60 hover:bg-white/[0.10] hover:text-white"
                      }`}
                    >
                      <Plus size={11} />
                      New
                    </button>
                  </Tooltip>
                </div>

                {ownPlaylists.length === 0 ? (
                  <p className="px-3 py-3 text-[12px] text-aura-muted">No playlists yet. Create one!</p>
                ) : (
                  <div className="space-y-0.5">
                    {ownPlaylists.map((playlist) => (
                      <PlaylistRow
                        key={playlist.id}
                        playlist={playlist}
                        isActive={activeId === playlist.id}
                        onSelect={() => { selectPlaylist(playlist.id); setMobileSidebarOpen(false) }}
                        onDelete={(e) => handleDeletePlaylist(e, playlist)}
                      />
                    ))}
                  </div>
                )}
              </div>

              {sharedPlaylists.length > 0 && (
                <div className="mt-5">
                  <div className="mb-2 px-3">
                    <span className="text-[10px] font-bold tracking-[0.15em] text-aura-muted uppercase">
                      Shared Playlists
                    </span>
                  </div>
                  <div className="space-y-0.5">
                    {sharedPlaylists.map((playlist) => (
                      <PlaylistRow
                        key={playlist.id}
                        playlist={playlist}
                        isActive={activeId === playlist.id}
                        onSelect={() => { selectPlaylist(playlist.id); setMobileSidebarOpen(false) }}
                        onDelete={(e) => handleDeletePlaylist(e, playlist)}
                      />
                    ))}
                  </div>
                </div>
              )}
            </>
          )}

          {/* Collapsed: all playlists as icons */}
          {isSidebarCollapsed && (
            <div className="mt-2 space-y-0.5">
              {playlists.map((playlist) => (
                <Tooltip
                  key={playlist.id}
                  side="right"
                  sideOffset={20}
                  explainer={playlist.name}
                  open={undefined}
                >
                  <button
                    onClick={() => { selectPlaylist(playlist.id); setMobileSidebarOpen(false) }}
                    className={`relative flex w-full items-center justify-center rounded-xl p-3 transition-all ${
                      activeId === playlist.id
                        ? "bg-white/[0.06] text-white"
                        : "text-aura-muted hover:bg-white/[0.04] hover:text-white"
                    }`}
                  >
                    <div className="flex h-6 w-6 items-center justify-center rounded-lg bg-white/[0.06] text-aura-muted">
                      <Music size={12} />
                    </div>
                  </button>
                </Tooltip>
              ))}
              <Tooltip side="right" sideOffset={20} explainer="New Playlist" open={undefined}>
                <button
                  onClick={handleCreateClick}
                  className="flex w-full items-center justify-center rounded-xl p-3 text-aura-muted transition-all hover:bg-white/[0.04] hover:text-white"
                >
                  <div className="flex h-6 w-6 items-center justify-center rounded-lg border border-dashed border-white/15">
                    <Plus size={12} />
                  </div>
                </button>
              </Tooltip>
            </div>
          )}
        </div>

        <CreatePlaylistModal
          isOpen={isModalOpen}
          onClose={() => setIsModalOpen(false)}
          onSuccess={async (p: Playlist) => {
            await refreshPlaylists()
            selectPlaylist(p.id)
          }}
        />
      </aside>

      <AuthOverlay isOpen={isAuthOpen} onClose={() => setIsAuthOpen(false)} />
    </>
  )
}

// ── Playlist Row sub-component ────────────────────────────────────────────────
function PlaylistRow({
  playlist,
  isActive,
  onSelect,
  onDelete,
}: {
  playlist: Playlist
  isActive: boolean
  onSelect: () => void
  onDelete: (e: React.MouseEvent) => void
}) {
  return (
    <div className="group relative">
      <button
        onClick={onSelect}
        className={`relative flex w-full items-center gap-3 rounded-xl px-3 py-2.5 transition-all ${
          isActive
            ? "bg-white/[0.06] text-white"
            : "text-aura-muted hover:bg-white/[0.04] hover:text-white"
        }`}
      >
        {isActive && (
          <span className="absolute left-0 top-1/2 -translate-y-1/2 h-8 w-[3px] rounded-r-full bg-aura-primary" />
        )}
        <div className={`flex h-9 w-9 flex-shrink-0 items-center justify-center rounded-xl transition-colors ${
          playlist.isShared
            ? "bg-aura-primary/10 text-aura-primary"
            : "bg-white/[0.06] text-aura-muted group-hover:text-aura-primary"
        }`}>
          {playlist.isShared ? <Users size={14} /> : <Music size={13} />}
        </div>
        <div className="min-w-0 flex-1 text-left">
          <p className="truncate text-sm font-medium">{playlist.name}</p>
          {playlist.trackCount !== undefined && playlist.trackCount > 0 && (
            <p className="text-[11px] text-aura-muted">{playlist.trackCount} songs</p>
          )}
        </div>
      </button>

      <button
        onClick={onDelete}
        title={playlist.isShared ? "Leave playlist" : "Delete playlist"}
        className={`text-aura-muted absolute top-1/2 right-3 -translate-y-1/2 p-1 opacity-0 transition-all group-hover:opacity-100 ${
          playlist.isShared ? "hover:text-yellow-400" : "hover:text-red-400"
        }`}
      >
        <Trash2 size={11} />
      </button>
    </div>
  )
}
