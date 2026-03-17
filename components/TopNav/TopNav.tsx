"use client"

import { Bell, Music, User as UserIcon } from "lucide-react"
import { useState } from "react"
import { AuthOverlay } from "components/Auth/AuthOverlay"
import { useAuth } from "components/Providers/AuthProvider"
import { SearchBar } from "components/SearchBar/SearchBar"

interface TopNavProps {
  onHome?: () => void
  onSearch?: (query: string) => void
  onClearSearch?: () => void
  isSearchLoading?: boolean
}

export function TopNav({ onHome, onSearch, onClearSearch, isSearchLoading }: TopNavProps) {
  const { user, signOut } = useAuth()
  const [isAuthOpen, setIsAuthOpen] = useState(false)

  return (
    <>
      <nav className="sticky top-0 z-[60] flex w-full items-center justify-between gap-8 bg-transparent px-6 py-4 transition-all duration-300">
        <div className="flex items-center gap-4">
          {/* Mobile Back Button */}
          <button
            onClick={() => onHome?.()}
            className="bg-aura-primary shadow-aura-primary/30 flex h-10 w-10 items-center justify-center rounded-xl shadow-lg lg:hidden"
          >
            <Music size={20} className="text-white" />
          </button>
        </div>

        <div className="max-w-2xl flex-1">
          <SearchBar onSearch={onSearch || (() => {})} onClear={onClearSearch} isLoading={isSearchLoading} />
        </div>

        <div className="flex items-center gap-4">
          {user ? (
            <div className="flex items-center gap-3">
              <button className="text-aura-muted flex h-10 w-10 items-center justify-center rounded-full border border-white/5 bg-white/5 transition-all hover:text-white">
                <Bell size={18} />
              </button>
              <div className="group relative flex cursor-pointer items-center gap-3 rounded-full border border-white/5 bg-white/5 p-1 pr-4 transition-all hover:bg-white/10">
                <div className="bg-aura-primary flex h-8 w-8 items-center justify-center rounded-full border border-white/10 shadow-lg">
                  <UserIcon size={16} className="text-white" />
                </div>
                <div className="flex flex-col">
                  <span className="text-xs leading-none font-bold text-white">{user.email?.split("@")[0]}</span>
                  <button
                    onClick={() => signOut()}
                    className="text-aura-muted text-left text-[10px] font-medium transition-colors hover:text-white"
                  >
                    Sign out
                  </button>
                </div>
              </div>
            </div>
          ) : (
            <button
              onClick={() => setIsAuthOpen(true)}
              className="rounded-full bg-white px-6 py-2.5 text-xs font-bold text-black shadow-xl transition-all hover:scale-105 active:scale-95"
            >
              Sign In
            </button>
          )}
        </div>
      </nav>

      <AuthOverlay isOpen={isAuthOpen} onClose={() => setIsAuthOpen(false)} />
    </>
  )
}
