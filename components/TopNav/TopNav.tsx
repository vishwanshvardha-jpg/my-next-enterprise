"use client"

import { Bell, Menu, Search, User as UserIcon } from "lucide-react"
import { useEffect, useState } from "react"
import { AuthOverlay } from "components/Auth/AuthOverlay"
import { InvitesModal } from "components/Playlist/InvitesModal"
import { useAuth } from "components/Providers/AuthProvider"
import { SearchBar } from "components/SearchBar/SearchBar"
import { getPendingInvites } from "lib/actions/playlists"
import { useLibraryStore, useUIStore } from "lib/store"

interface TopNavProps {
  onHome?: () => void
  onSearch?: (query: string) => void
  onClearSearch?: () => void
  isSearchLoading?: boolean
  onRequestSignUp?: () => void
}

export function TopNav({ onHome, onSearch, onClearSearch, isSearchLoading, onRequestSignUp }: TopNavProps) {
  const { user, signOut } = useAuth()
  const [isAuthOpen, setIsAuthOpen] = useState(false)
  const [isInvitesOpen, setIsInvitesOpen] = useState(false)
  const [pendingCount, setPendingCount] = useState(0)
  const [isMobileSearchOpen, setIsMobileSearchOpen] = useState(false)
  const { activePlaylistId, selectPlaylist, refreshPlaylists } = useLibraryStore()
  const { toggleMobileSidebar } = useUIStore()

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
      if (!user) {
        if (onRequestSignUp) { onRequestSignUp(); return }
        setIsAuthOpen(true); return
      }
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
      {/* ── Main nav bar ── */}
      <nav className="glass-nav sticky top-0 z-[60] w-full border-b border-white/[0.04] mb-4">
        <div className="flex h-[72px] items-center gap-4 px-4 lg:px-10">
          {/* Left: Hamburger (mobile only) + Tabs */}
          <div className="flex flex-shrink-0 items-center gap-1">
            <button
              onClick={toggleMobileSidebar}
              className="mr-1 flex h-9 w-9 items-center justify-center rounded-xl text-aura-muted transition-all hover:bg-white/5 hover:text-white lg:hidden"
              aria-label="Open menu"
            >
              <Menu size={20} />
            </button>

            {tabs.map((tab) => {
              const isActive = getActiveTab() === tab.id
              return (
                <button
                  key={tab.id}
                  data-coachmark={tab.id === "home" ? "discover-tab" : "library-tab"}
                  onClick={() => handleTabClick(tab.id)}
                  className={`relative whitespace-nowrap px-4 py-2.5 text-[11px] font-bold tracking-[0.15em] transition-all duration-300 ${
                    tab.id === "library" ? "hidden sm:block" : ""
                  } ${
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

          {/* Right: Search + Actions */}
          <div className="ml-auto flex min-w-0 items-center gap-2 sm:gap-3">
            {/* Search bar — desktop (shrinks before user button does) */}
            <div className="hidden min-w-0 flex-1 sm:block" style={{ maxWidth: "18rem" }} data-coachmark="search">
              <SearchBar
                onSearch={!user && onRequestSignUp ? () => onRequestSignUp() : onSearch || (() => {})}
                onClear={onClearSearch}
                isLoading={isSearchLoading}
              />
            </div>

            {/* Search icon — mobile */}
            <button
              data-coachmark="mobile-search"
              onClick={() => { if (!user && onRequestSignUp) { onRequestSignUp(); return } setIsMobileSearchOpen((v) => !v) }}
              className={`flex h-9 w-9 items-center justify-center rounded-xl transition-all sm:hidden ${
                isMobileSearchOpen
                  ? "bg-aura-primary/15 text-aura-primary"
                  : "text-aura-muted hover:bg-white/5 hover:text-white"
              }`}
              aria-label="Search"
            >
              <Search size={18} />
            </button>

            {user ? (
              <div className="flex flex-shrink-0 items-center gap-2 sm:gap-3">
                {/* Bell — hidden on mobile */}
                <button
                  data-coachmark="notification-bell"
                  onClick={() => setIsInvitesOpen(true)}
                  className="relative hidden h-10 w-10 items-center justify-center rounded-full border border-white/10 bg-white/5 transition-all hover:bg-white/10 hover:border-white/20 sm:flex"
                  title={pendingCount > 0 ? `${pendingCount} pending invite${pendingCount !== 1 ? "s" : ""}` : "No pending invites"}
                >
                  <Bell size={16} className={pendingCount > 0 ? "text-aura-primary" : "text-aura-muted"} />
                  {pendingCount > 0 && (
                    <span className="absolute -top-0.5 -right-0.5 flex h-4 w-4 items-center justify-center rounded-full bg-red-500 text-[9px] font-bold text-white">
                      {pendingCount}
                    </span>
                  )}
                </button>
              </div>
            ) : onRequestSignUp ? (
              <button
                data-coachmark="notification-bell"
                onClick={onRequestSignUp}
                className="relative hidden h-10 w-10 items-center justify-center rounded-full border border-white/10 bg-white/5 transition-all hover:bg-white/10 hover:border-white/20 sm:flex"
                title="Sign up to receive invites"
              >
                <Bell size={16} className="text-aura-muted" />
              </button>
            ) : null}

            {user ? (
              <div className="flex flex-shrink-0 items-center gap-2 sm:gap-3">

                {/* Full user button — desktop */}
                <button
                  onClick={() => signOut()}
                  className="hidden h-10 items-center justify-center gap-2 rounded-full border border-white/10 bg-white/5 pr-4 pl-3 transition-all hover:bg-white/10 hover:border-white/20 sm:flex"
                >
                  <div className="flex h-6 w-6 items-center justify-center rounded-full bg-aura-primary text-black">
                    <UserIcon size={14} />
                  </div>
                  <div className="flex flex-col items-start pr-1">
                    <span className="text-[12px] font-bold text-white tracking-wide">
                      {user.user_metadata?.username || user.email?.split("@")[0] || "User"}
                    </span>
                    <span className="text-[9px] text-aura-muted">Sign Out</span>
                  </div>
                </button>

                {/* Avatar only — mobile */}
                <button
                  onClick={() => signOut()}
                  className="flex h-9 w-9 items-center justify-center rounded-full bg-aura-primary text-black transition-all hover:opacity-80 sm:hidden"
                  title="Sign Out"
                >
                  <UserIcon size={16} />
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
        </div>

        {/* Mobile search row */}
        {isMobileSearchOpen && (
          <div className="px-4 pb-3 sm:hidden">
            <SearchBar
              onSearch={(q) => { onSearch?.(q); setIsMobileSearchOpen(false) }}
              onClear={onClearSearch}
              isLoading={isSearchLoading}
            />
          </div>
        )}
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
