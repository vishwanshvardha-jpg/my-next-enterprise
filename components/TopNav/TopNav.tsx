"use client"

import { Bell, User as UserIcon } from "lucide-react"
import { useEffect, useState } from "react"
import { AuthOverlay } from "components/Auth/AuthOverlay"
import { InvitesModal } from "components/Playlist/InvitesModal"
import { useAuth } from "components/Providers/AuthProvider"
import { SearchBar } from "components/SearchBar/SearchBar"
import { getPendingInvites } from "lib/actions/playlists"
import { useLibraryStore } from "lib/store"

interface TopNavProps {
  onHome?: () => void
  onSearch?: (query: string) => void
  onClearSearch?: () => void
  isSearchLoading?: boolean
}

export function TopNav({ onHome, onSearch, onClearSearch, isSearchLoading }: TopNavProps) {
  const { user, signOut } = useAuth()
  const [isAuthOpen, setIsAuthOpen] = useState(false)
  const [isInvitesOpen, setIsInvitesOpen] = useState(false)
  const [pendingCount, setPendingCount] = useState(0)
  const { activePlaylistId, selectPlaylist, refreshPlaylists } = useLibraryStore()

  useEffect(() => {
    if (!user) return
    getPendingInvites().then((invites) => setPendingCount(invites.length))
  }, [user])

  const handleInviteResponded = async () => {
    await refreshPlaylists()
    const fresh = await getPendingInvites()
    setPendingCount(fresh.length)
  }

  const tabs = [
    { id: "home", label: "DISCOVER" },
    { id: "library", label: "MY LIBRARY" },
  ]

  const handleTabClick = (tabId: string) => {
    if (tabId === "home") {
      selectPlaylist("home")
      onHome?.()
    } else if (tabId === "library") {
      selectPlaylist("library")
    }
  }

  const getActiveTab = () => {
    if (!activePlaylistId || activePlaylistId === "home") return "home"
    if (activePlaylistId === "library") return "library"
    return "home"
  }

  return (
    <>
      <nav className="glass-nav sticky top-0 z-[60] flex w-full items-center justify-between gap-6 px-6 py-4 lg:px-10 border-b border-white/[0.04] mb-4">
        {/* Left: Tab Navigation */}
        <div className="flex items-center gap-1">
          {tabs.map((tab) => {
            const isActive = getActiveTab() === tab.id
            return (
              <button
                key={tab.id}
                onClick={() => handleTabClick(tab.id)}
                className={`relative px-5 py-2.5 text-[11px] font-bold tracking-[0.15em] transition-all duration-300 ${
                  isActive
                    ? "text-aura-primary"
                    : "text-aura-muted hover:text-white/80"
                }`}
              >
                {tab.label}
                {isActive && (
                  <span className="absolute bottom-0 left-1/2 -translate-x-1/2 h-[2px] w-8 rounded-full bg-aura-primary" />
                )}
              </button>
            )
          })}
        </div>

        {/* Center/Right: Search + Actions */}
        <div className="flex items-center gap-4">
          <div className="w-72">
            <SearchBar
              onSearch={onSearch || (() => {})}
              onClear={onClearSearch}
              isLoading={isSearchLoading}
            />
          </div>

          {user ? (
            <div className="flex items-center gap-3">
              <button
                onClick={() => setIsInvitesOpen(true)}
                className="relative flex h-10 w-10 items-center justify-center rounded-full border border-white/10 bg-white/5 transition-all hover:bg-white/10 hover:border-white/20"
                title={pendingCount > 0 ? `${pendingCount} pending invite${pendingCount !== 1 ? "s" : ""}` : "No pending invites"}
              >
                <Bell size={16} className={pendingCount > 0 ? "text-aura-primary" : "text-aura-muted"} />
                {pendingCount > 0 && (
                  <span className="absolute -top-0.5 -right-0.5 flex h-4 w-4 items-center justify-center rounded-full bg-red-500 text-[9px] font-bold text-white">
                    {pendingCount}
                  </span>
                )}
              </button>
              <button
                onClick={() => signOut()}
                className="flex h-10 items-center justify-center gap-2 rounded-full border border-white/10 bg-white/5 pr-4 pl-3 transition-all hover:bg-white/10 hover:border-white/20"
              >
                <div className="flex h-6 w-6 items-center justify-center rounded-full bg-aura-primary text-black">
                  <UserIcon size={14} />
                </div>
                <div className="flex flex-col items-start pr-1">
                  <span className="text-[12px] font-bold text-white tracking-wide">
                    {user.user_metadata?.username || user.email?.split("@")[0] || "User"}
                  </span>
                  <span className="text-[9px] text-aura-muted group-hover:text-white transition-colors">Sign Out</span>
                </div>
              </button>
            </div>
          ) : (
            <button
              onClick={() => setIsAuthOpen(true)}
              className="btn-primary text-[11px] tracking-wider"
            >
              Sign In
            </button>
          )}
        </div>
      </nav>

      <AuthOverlay isOpen={isAuthOpen} onClose={() => setIsAuthOpen(false)} />
      <InvitesModal
        isOpen={isInvitesOpen}
        onClose={() => setIsInvitesOpen(false)}
        onInviteResponded={handleInviteResponded}
      />
    </>
  )
}
