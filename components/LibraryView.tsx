"use client"

import { motion } from "framer-motion"
import { Heart, Music, Play } from "lucide-react"
import { useLibraryStore } from "lib/store"

export function LibraryView() {
  const { playlists, likedSongs, selectPlaylist } = useLibraryStore()

  const likedSongIds = likedSongs.map((s) => s.trackId)

  return (
    <div className="space-y-10 pb-20">
      {/* Header */}
      <header className="relative overflow-hidden rounded-3xl bg-gradient-to-br from-white/[0.03] to-transparent border border-white/[0.05] p-8 lg:p-10">
        <div className="absolute -top-20 -left-20 h-60 w-60 rounded-full bg-aura-primary/[0.06] blur-[80px]" />
        <div className="absolute -bottom-20 -right-20 h-40 w-40 rounded-full bg-aura-secondary/[0.04] blur-[60px]" />

        <div className="relative">
          <h1 className="font-display mb-2 text-3xl font-bold tracking-tight text-white md:text-4xl">
            My Collection
          </h1>
          <p className="text-aura-muted text-[12px] font-medium">
            {playlists.length} playlists
            <span className="mx-2 text-white/10">·</span>
            {likedSongIds.length} liked songs
          </p>
        </div>
      </header>

      {/* Grid */}
      <div className="grid grid-cols-[repeat(auto-fill,minmax(140px,1fr))] gap-5">
        {/* Liked Songs Tile */}
        <motion.div
          whileHover={{ y: -4, scale: 1.02 }}
          transition={{ type: "spring", stiffness: 300, damping: 20 }}
          onClick={() => selectPlaylist("liked")}
          className="group relative flex aspect-square cursor-pointer flex-col justify-end overflow-hidden rounded-2xl bg-gradient-to-br from-aura-primary to-aura-secondary p-4 shadow-lg"
          style={{ boxShadow: "0 8px 30px rgba(0, 212, 170, 0.15)" }}
        >
          <div className="absolute top-3.5 right-3.5 flex h-9 w-9 items-center justify-center rounded-xl bg-white/20 backdrop-blur-sm">
            <Heart size={16} className="fill-current text-white" />
          </div>
          <div className="relative z-10">
            <h3 className="font-display mb-0.5 text-[13px] font-bold text-white">Liked Songs</h3>
            <p className="text-[10px] font-medium text-white/70">
              {likedSongIds.length} Tracks
            </p>
          </div>
          <button className="absolute right-3.5 bottom-3.5 flex h-8 w-8 translate-y-3 items-center justify-center rounded-full bg-white text-black opacity-0 shadow-lg transition-all duration-300 group-hover:translate-y-0 group-hover:opacity-100">
            <Play size={12} fill="currentColor" className="ml-0.5" />
          </button>
        </motion.div>

        {/* Playlists Tiles */}
        {playlists.map((p, i) => (
          <motion.div
            key={p.id}
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: i * 0.05, duration: 0.4 }}
            whileHover={{ y: -4, scale: 1.02 }}
            onClick={() => selectPlaylist(p.id)}
            className="group relative flex aspect-square cursor-pointer flex-col justify-end overflow-hidden rounded-2xl bg-white/[0.03] border border-white/[0.06] p-4 transition-all hover:bg-white/[0.06] hover:border-white/[0.1]"
          >
            <div className="absolute top-3.5 right-3.5 flex h-9 w-9 items-center justify-center rounded-xl bg-white/[0.06] border border-white/[0.06] transition-colors group-hover:border-aura-primary/20">
              <Music size={16} className="text-aura-muted group-hover:text-aura-primary transition-colors" />
            </div>
            <div className="relative z-10">
              <h3 className="font-display mb-0.5 truncate text-[13px] font-bold text-white">
                {p.name}
              </h3>
              <p className="text-aura-muted text-[10px] font-medium">
                {p.trackCount ?? 0} Tracks
              </p>
            </div>
            <button className="absolute right-3.5 bottom-3.5 flex h-8 w-8 translate-y-3 items-center justify-center rounded-full bg-aura-primary text-black opacity-0 shadow-lg transition-all duration-300 group-hover:translate-y-0 group-hover:opacity-100"
              style={{ boxShadow: "0 0 15px rgba(0, 212, 170, 0.3)" }}
            >
              <Play size={12} fill="currentColor" className="ml-0.5" />
            </button>
          </motion.div>
        ))}
      </div>
    </div>
  )
}
