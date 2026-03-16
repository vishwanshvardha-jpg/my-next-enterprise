"use client"

import { Music, ChevronLeft, ChevronRight, User as UserIcon, Bell } from "lucide-react"
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
      <nav className="sticky top-0 z-[60] w-full px-6 py-4 flex items-center justify-between gap-8 bg-transparent transition-all duration-300">
        <div className="flex items-center gap-4">
          {/* Mobile Back Button */}
          <button 
            onClick={() => onHome?.()} 
            className="lg:hidden h-10 w-10 bg-aura-primary rounded-xl flex items-center justify-center shadow-lg shadow-aura-primary/30"
          >
            <Music size={20} className="text-white" />
          </button>


        </div>

        <div className="flex-1 max-w-2xl">
          <SearchBar 
            onSearch={onSearch || (() => {})} 
            onClear={onClearSearch} 
            isLoading={isSearchLoading}
          />
        </div>

        <div className="flex items-center gap-4">
          {user ? (
            <div className="flex items-center gap-3">
              <button className="h-10 w-10 rounded-full bg-white/5 text-aura-muted hover:text-white transition-all flex items-center justify-center border border-white/5">
                <Bell size={18} />
              </button>
              <div className="flex items-center gap-3 bg-white/5 hover:bg-white/10 p-1 pr-4 rounded-full border border-white/5 transition-all group cursor-pointer relative">
                <div className="h-8 w-8 rounded-full bg-aura-primary flex items-center justify-center border border-white/10 shadow-lg">
                  <UserIcon size={16} className="text-white" />
                </div>
                <div className="flex flex-col">
                  <span className="text-xs font-bold text-white leading-none">{user.email?.split("@")[0]}</span>
                  <button 
                    onClick={() => signOut()}
                    className="text-[10px] font-medium text-aura-muted hover:text-white transition-colors text-left"
                  >
                    Sign out
                  </button>
                </div>
              </div>
            </div>
          ) : (
            <button
              onClick={() => setIsAuthOpen(true)}
              className="bg-white text-black text-xs font-bold px-6 py-2.5 rounded-full transition-all hover:scale-105 active:scale-95 shadow-xl"
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
