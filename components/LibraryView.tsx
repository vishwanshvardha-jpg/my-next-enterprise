"use client"

import { motion } from "framer-motion"
import { Heart, Music, Play } from "lucide-react"
import { useLibraryStore } from "lib/store"

export function LibraryView() {
  const { playlists, likedSongs, selectPlaylist } = useLibraryStore()

  const likedSongIds = likedSongs.map((s) => s.trackId)

  return (
    <div className="animate-in fade-in slide-in-from-bottom-4 space-y-10 duration-700">
      <header className="flex items-end justify-between border-b border-white/5 pb-6">
        <div>
          <h1 className="font-display mb-1 text-4xl font-black tracking-tight text-white uppercase">My Collection</h1>
          <p className="text-aura-muted text-[11px] leading-none font-bold tracking-widest uppercase">
            {playlists.length} playlists <span className="mx-2 text-white/10">|</span> {likedSongIds.length} liked songs
          </p>
        </div>
      </header>

      <div className="grid grid-cols-2 gap-4 sm:grid-cols-3 md:grid-cols-4 lg:grid-cols-5 xl:grid-cols-6 2xl:grid-cols-8">
        {/* Liked Songs Tile */}
        <motion.div
          whileHover={{ y: -4 }}
          onClick={() => selectPlaylist("liked")}
          className="group from-aura-primary to-aura-accent relative flex aspect-square cursor-pointer flex-col justify-end overflow-hidden rounded-[1.5rem] bg-gradient-to-br p-4 shadow-xl"
        >
          <div className="absolute top-4 right-4 flex h-10 w-10 items-center justify-center rounded-xl border border-white/20 bg-white/20 backdrop-blur-xl">
            <Heart size={20} className="fill-current text-white" />
          </div>
          <div className="relative z-10">
            <h3 className="font-display mb-0.5 text-sm font-black tracking-tight text-white uppercase">Liked Songs</h3>
            <p className="text-[7px] font-bold tracking-[0.2em] text-white/80 uppercase">
              {likedSongIds.length} Tracks
            </p>
          </div>
          <button className="absolute right-4 bottom-4 flex h-8 w-8 translate-y-2 transform items-center justify-center rounded-full bg-white text-black opacity-0 shadow-xl transition-all duration-300 group-hover:translate-y-0 group-hover:opacity-100">
            <Play size={12} fill="currentColor" className="ml-0.5" />
          </button>
        </motion.div>

        {/* Playlists Tiles */}
        {playlists.map((p) => (
          <motion.div
            key={p.id}
            whileHover={{ y: -4 }}
            onClick={() => selectPlaylist(p.id)}
            className="group bg-aura-surface relative flex aspect-square cursor-pointer flex-col justify-end overflow-hidden rounded-[1.5rem] border border-white/5 p-4 shadow-lg transition-all hover:bg-white/10"
          >
            <div className="group-hover:border-aura-primary/30 absolute top-4 right-4 flex h-10 w-10 items-center justify-center rounded-xl border border-white/5 bg-white/5 backdrop-blur-xl transition-colors">
              <Music size={20} className="text-aura-muted group-hover:text-aura-primary transition-colors" />
            </div>
            <div className="relative z-10">
              <h3 className="font-display mb-0.5 truncate text-sm font-black tracking-tight text-white uppercase">
                {p.name}
              </h3>
              <p className="text-aura-muted text-[7px] font-bold tracking-[0.2em] uppercase">
                {p.trackCount ?? 0} Tracks
              </p>
            </div>
            <button className="bg-aura-primary absolute right-4 bottom-4 flex h-8 w-8 translate-y-2 transform items-center justify-center rounded-full text-white opacity-0 shadow-xl transition-all duration-300 group-hover:translate-y-0 group-hover:opacity-100">
              <Play size={12} fill="currentColor" className="ml-0.5" />
            </button>
          </motion.div>
        ))}
      </div>
    </div>
  )
}
