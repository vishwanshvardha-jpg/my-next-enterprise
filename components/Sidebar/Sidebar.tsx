"use client"

import { Heart, Home, Library, Music, Plus, Search, Trash2, User } from "lucide-react"
import { useEffect, useState } from "react"
import { CreatePlaylistModal } from "components/Playlist/CreatePlaylistModal"
import { useAuth } from "components/Providers/AuthProvider"
import { useLibraryStore } from "lib/store"
import { Playlist } from "lib/types"

export function Sidebar() {
  const { user } = useAuth()
  const { 
    playlists, 
    activePlaylistId: activeId, 
    selectPlaylist,
    fetchInitialData,
    deletePlaylist,
    refreshPlaylists
  } = useLibraryStore()
  
  const [isModalOpen, setIsModalOpen] = useState(false)

  useEffect(() => {
    fetchInitialData(user)
  }, [user, fetchInitialData])

  const handleDeletePlaylist = async (e: React.MouseEvent, id: string) => {
    e.stopPropagation()
    if (!confirm("Are you sure you want to delete this playlist?")) return
    await deletePlaylist(id)
  }

  return (
    <aside className="w-72 flex-shrink-0 bg-aura-bg border-r border-white font-sans flex flex-col h-full overflow-hidden">
      <div className="p-8 space-y-10 flex-1 overflow-y-auto no-scrollbar">
        {/* Branding */}
        <div 
          onClick={() => {
            selectPlaylist("home")
            window.dispatchEvent(new CustomEvent('aura-home-reset'))
          }}
          className="flex items-center gap-3 px-2 cursor-pointer group"
        >
          <div className="h-10 w-10 bg-aura-primary rounded-2xl flex items-center justify-center shadow-lg shadow-aura-primary/30 transform transition-transform group-hover:scale-110">
            <Music className="text-white h-5 w-5" />
          </div>
          <h1 className="text-xl font-display font-black tracking-tighter text-white">
            AURA<span className="text-aura-primary">MUSIC</span>
          </h1>
        </div>

        {/* Navigation */}
        <nav className="space-y-1">
          <button 
            onClick={() => {
              selectPlaylist("home")
              window.dispatchEvent(new CustomEvent('aura-home-reset'))
            }}
            className={`w-full flex items-center gap-4 px-4 py-3 rounded-2xl transition-all duration-300 group ${
              !activeId || activeId === "home" 
                ? "bg-aura-surface text-white shadow-sm" 
                : "text-aura-muted hover:text-white hover:bg-white/5"
            }`}
          >
            <Home className={`h-5 w-5 ${(!activeId || activeId === "home") ? "text-aura-primary" : "text-aura-muted group-hover:text-white"}`} />
            <span className="font-bold tracking-tight">Home</span>
          </button>
          
          <button 
            onClick={() => selectPlaylist("library")}
            className={`w-full flex items-center gap-4 px-4 py-3 rounded-2xl transition-all duration-300 group ${
              activeId === "library"
                ? "bg-aura-surface text-white shadow-sm" 
                : "text-aura-muted hover:text-white hover:bg-white/5"
            }`}
          >
            <Library className={`h-5 w-5 ${activeId === "library" ? "text-aura-primary" : "text-aura-muted group-hover:text-white"}`} />
            <span className="font-bold tracking-tight">My Library</span>
          </button>
        </nav>

        {/* Playlists */}
        <div className="space-y-6">
          <div className="flex items-center justify-between px-4">
            <h3 className="text-[10px] font-black uppercase tracking-[0.2em] text-aura-muted">Playlists</h3>
            <button 
              onClick={() => setIsModalOpen(true)}
              className="text-aura-muted hover:text-aura-primary transition-colors"
            >
              <Plus size={16} />
            </button>
          </div>

          <div className="space-y-1">
            <button 
              onClick={() => selectPlaylist("liked")}
              className={`w-full flex items-center gap-4 px-4 py-3 rounded-xl transition-all group ${
                activeId === "liked" ? "bg-aura-primary/10 text-white" : "text-aura-muted hover:text-white hover:bg-white/5"
              }`}
            >
              <div className="h-8 w-8 rounded-lg bg-gradient-to-br from-aura-primary to-aura-secondary flex items-center justify-center text-white shadow-md">
                <Heart size={14} fill="currentColor" />
              </div>
              <span className="text-sm font-bold tracking-tight">Liked Songs</span>
            </button>

            {playlists.map((playlist) => (
              <div key={playlist.id} className="group relative">
                <button 
                  onClick={() => selectPlaylist(playlist.id)}
                  className={`w-full flex items-center gap-4 px-4 py-3 rounded-xl transition-all ${
                    activeId === playlist.id ? "bg-white/5 text-white" : "text-aura-muted hover:text-white hover:bg-white/5"
                  }`}
                >
                  <div className="h-8 w-8 rounded-lg bg-aura-surface flex items-center justify-center text-aura-muted group-hover:text-aura-primary transition-colors">
                    <Music size={14} />
                  </div>
                  <span className="text-sm font-medium tracking-tight truncate pr-6">{playlist.name}</span>
                </button>
                <button 
                  onClick={(e) => handleDeletePlaylist(e, playlist.id)}
                  className="absolute right-4 top-1/2 -translate-y-1/2 p-1.5 text-aura-muted hover:text-red-500 opacity-0 group-hover:opacity-100 transition-all"
                >
                  <Trash2 size={12} />
                </button>
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
