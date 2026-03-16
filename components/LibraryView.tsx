"use client"

import { Heart, Music, Play, User as UserIcon } from "lucide-react"
import { useLibraryStore, usePlaybackStore } from "lib/store"
import { useAuth } from "components/Providers/AuthProvider"
import { motion } from "framer-motion"

export function LibraryView() {
  const { user } = useAuth()
  const { playlists, likedSongs, selectPlaylist } = useLibraryStore()
  
  const likedSongIds = likedSongs.map(s => s.trackId)

  return (
    <div className="space-y-10 animate-in fade-in slide-in-from-bottom-4 duration-700">
      <header className="flex items-end justify-between border-b border-white/5 pb-6">
        <div>
          <h1 className="text-4xl font-display font-black tracking-tight text-white mb-1 uppercase">My Collection</h1>
          <p className="text-aura-muted text-[11px] font-bold uppercase tracking-widest leading-none">
            {playlists.length} playlists <span className="mx-2 text-white/10">|</span> {likedSongIds.length} liked songs
          </p>
        </div>
      </header>

      <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 lg:grid-cols-5 xl:grid-cols-6 2xl:grid-cols-8 gap-4">
        {/* Liked Songs Tile */}
        <motion.div 
          whileHover={{ y: -4 }}
          onClick={() => selectPlaylist("liked")}
          className="group relative aspect-square rounded-[1.5rem] bg-gradient-to-br from-aura-primary to-aura-accent p-4 cursor-pointer overflow-hidden shadow-xl flex flex-col justify-end"
        >
          <div className="absolute top-4 right-4 h-10 w-10 bg-white/20 backdrop-blur-xl rounded-xl flex items-center justify-center border border-white/20">
            <Heart size={20} className="text-white fill-current" />
          </div>
          <div className="relative z-10">
            <h3 className="text-sm font-display font-black text-white mb-0.5 uppercase tracking-tight">Liked Songs</h3>
            <p className="text-white/80 font-bold uppercase tracking-[0.2em] text-[7px]">{likedSongIds.length} Tracks</p>
          </div>
          <button className="absolute bottom-4 right-4 h-8 w-8 rounded-full bg-white text-black flex items-center justify-center opacity-0 group-hover:opacity-100 transform translate-y-2 group-hover:translate-y-0 transition-all duration-300 shadow-xl">
            <Play size={12} fill="currentColor" className="ml-0.5" />
          </button>
        </motion.div>

        {/* Playlists Tiles */}
        {playlists.map((p) => (
          <motion.div 
            key={p.id}
            whileHover={{ y: -4 }}
            onClick={() => selectPlaylist(p.id)}
            className="group relative aspect-square rounded-[1.5rem] bg-aura-surface border border-white/5 p-4 cursor-pointer overflow-hidden shadow-lg flex flex-col justify-end transition-all hover:bg-white/10"
          >
            <div className="absolute top-4 right-4 h-10 w-10 bg-white/5 backdrop-blur-xl rounded-xl flex items-center justify-center border border-white/5 transition-colors group-hover:border-aura-primary/30">
              <Music size={20} className="text-aura-muted group-hover:text-aura-primary transition-colors" />
            </div>
            <div className="relative z-10">
              <h3 className="text-sm font-display font-black text-white mb-0.5 uppercase tracking-tight truncate">{p.name}</h3>
              <p className="text-aura-muted font-bold uppercase tracking-[0.2em] text-[7px]">{(p.trackCount ?? 0)} Tracks</p>
            </div>
            <button className="absolute bottom-4 right-4 h-8 w-8 rounded-full bg-aura-primary text-white flex items-center justify-center opacity-0 group-hover:opacity-100 transform translate-y-2 group-hover:translate-y-0 transition-all duration-300 shadow-xl">
              <Play size={12} fill="currentColor" className="ml-0.5" />
            </button>
          </motion.div>
        ))}
      </div>
    </div>
  )
}
