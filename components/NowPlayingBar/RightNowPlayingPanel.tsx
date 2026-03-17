"use client"

import { AnimatePresence, motion } from "framer-motion"
import { Calendar, Disc3, Music2, X } from "lucide-react"
import Image from "next/image"
import { usePlaybackStore, useUIStore } from "lib/store"

function InfoRow({ label, value }: { label: string; value: string | number | undefined }) {
  if (!value) return null
  return (
    <div className="flex items-start justify-between gap-4 py-2.5 border-b border-white/5 last:border-0">
      <span className="text-aura-muted text-[10px] font-black tracking-[0.15em] uppercase flex-shrink-0 pt-0.5">
        {label}
      </span>
      <span className="text-white/80 text-xs font-medium text-right leading-relaxed">{value}</span>
    </div>
  )
}

export function RightNowPlayingPanel() {
  const { currentTrack: track } = usePlaybackStore()
  const { isNowPlayingPanelOpen, setNowPlayingPanelOpen } = useUIStore()

  const formatDuration = (ms: number) => {
    const total = Math.floor(ms / 1000)
    const mins = Math.floor(total / 60)
    const secs = total % 60
    return `${mins}:${secs.toString().padStart(2, "0")}`
  }

  const releaseYear = track?.releaseDate
    ? new Date(track.releaseDate).getFullYear()
    : undefined

  return (
    <AnimatePresence>
      {isNowPlayingPanelOpen && track && (
        <motion.aside
          initial={{ x: 320, opacity: 0 }}
          animate={{ x: 0, opacity: 1 }}
          exit={{ x: 320, opacity: 0 }}
          transition={{ type: "spring", stiffness: 300, damping: 30 }}
          className="fixed top-0 right-0 bottom-20 z-[90] hidden w-80 flex-col border-l border-white/10 bg-black/95 backdrop-blur-2xl lg:flex"
        >
          {/* Header */}
          <div className="flex items-center justify-between border-b border-white/10 px-5 py-4">
            <span className="text-[10px] font-black tracking-[0.2em] text-white/60 uppercase">Now Playing</span>
            <button
              onClick={() => setNowPlayingPanelOpen(false)}
              className="text-aura-muted rounded-md p-1.5 transition-all hover:bg-white/10 hover:text-white"
            >
              <X size={16} />
            </button>
          </div>

          {/* Scrollable content */}
          <div className="no-scrollbar flex-1 overflow-y-auto px-5 py-6 space-y-6">

            {/* Large Album Art */}
            <div className="relative mx-auto aspect-square w-full overflow-hidden rounded-2xl shadow-2xl">
              <Image
                src={track.artworkUrl100.replace("100x100bb.jpg", "600x600bb.jpg")}
                alt={track.trackName}
                fill
                className="object-cover"
                priority
              />
              <div className="absolute inset-0 bg-gradient-to-t from-black/30 to-transparent" />
            </div>

            {/* Track Title & Artist */}
            <div className="space-y-1.5">
              <h2 className="font-display text-xl font-black tracking-tight text-white leading-tight line-clamp-2">
                {track.trackName}
              </h2>
              <p className="text-aura-primary text-sm font-bold tracking-wide">
                {track.artistName}
              </p>
              <p className="text-aura-muted text-xs font-medium">
                {track.collectionName}
              </p>
            </div>

            {/* Details */}
            <div className="rounded-2xl border border-white/5 bg-white/3 px-4 py-1">
              <InfoRow label="Genre" value={track.primaryGenreName} />
              <InfoRow label="Released" value={releaseYear} />
              <InfoRow
                label="Track"
                value={
                  track.trackNumber && track.trackCount
                    ? `${track.trackNumber} of ${track.trackCount}`
                    : track.trackNumber
                }
              />
              <InfoRow
                label="Disc"
                value={
                  track.discCount && track.discCount > 1
                    ? `${track.discNumber} of ${track.discCount}`
                    : undefined
                }
              />
              <InfoRow
                label="Duration"
                value={track.trackTimeMillis ? formatDuration(track.trackTimeMillis) : undefined}
              />
              <InfoRow label="Country" value={track.country} />
            </div>

            {/* Credits */}
            <div className="space-y-3">
              <h3 className="text-[10px] font-black tracking-[0.2em] text-white/40 uppercase">Credits</h3>
              <div className="space-y-2">
                <div className="flex items-center gap-3 rounded-xl border border-white/5 bg-white/3 px-4 py-3">
                  <div className="bg-aura-primary/10 flex h-8 w-8 flex-shrink-0 items-center justify-center rounded-lg">
                    <Music2 size={14} className="text-aura-primary" />
                  </div>
                  <div className="min-w-0">
                    <p className="text-[10px] font-bold tracking-widest text-white/40 uppercase">Artist</p>
                    <p className="truncate text-sm font-semibold text-white/90">{track.artistName}</p>
                  </div>
                </div>

                <div className="flex items-center gap-3 rounded-xl border border-white/5 bg-white/3 px-4 py-3">
                  <div className="bg-aura-secondary/10 flex h-8 w-8 flex-shrink-0 items-center justify-center rounded-lg">
                    <Disc3 size={14} className="text-aura-secondary" />
                  </div>
                  <div className="min-w-0">
                    <p className="text-[10px] font-bold tracking-widest text-white/40 uppercase">Album</p>
                    <p className="truncate text-sm font-semibold text-white/90">{track.collectionName}</p>
                  </div>
                </div>

                {releaseYear && (
                  <div className="flex items-center gap-3 rounded-xl border border-white/5 bg-white/3 px-4 py-3">
                    <div className="flex h-8 w-8 flex-shrink-0 items-center justify-center rounded-lg bg-white/5">
                      <Calendar size={14} className="text-white/60" />
                    </div>
                    <div className="min-w-0">
                      <p className="text-[10px] font-bold tracking-widest text-white/40 uppercase">Year</p>
                      <p className="truncate text-sm font-semibold text-white/90">{releaseYear}</p>
                    </div>
                  </div>
                )}
              </div>
            </div>

            {/* iTunes link */}
            <a
              href={track.trackViewUrl}
              target="_blank"
              rel="noopener noreferrer"
              className="block w-full rounded-2xl border border-white/10 bg-white/5 px-4 py-3 text-center text-[10px] font-black tracking-[0.15em] text-white/60 uppercase transition-all hover:bg-white/10 hover:text-white"
            >
              Open in Apple Music ↗
            </a>
          </div>
        </motion.aside>
      )}
    </AnimatePresence>
  )
}
