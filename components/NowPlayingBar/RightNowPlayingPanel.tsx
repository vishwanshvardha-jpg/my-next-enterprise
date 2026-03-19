"use client"

import { AnimatePresence, motion } from "framer-motion"
import { Calendar, Disc3, ExternalLink, Music2, X } from "lucide-react"
import Image from "next/image"
import { usePlaybackStore, useUIStore } from "lib/store"

function InfoRow({ label, value }: { label: string; value: string | number | undefined }) {
  if (!value) return null
  return (
    <div className="flex items-start justify-between gap-4 py-2.5 border-b border-white/[0.04] last:border-0">
      <span className="text-aura-muted text-[10px] font-semibold tracking-wider uppercase flex-shrink-0 pt-0.5">
        {label}
      </span>
      <span className="text-white/70 text-[12px] font-medium text-right leading-relaxed">{value}</span>
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
          className="fixed top-0 right-0 bottom-[72px] z-[90] hidden w-80 flex-col lg:flex"
          style={{
            background: "linear-gradient(180deg, rgba(10, 14, 23, 0.97) 0%, rgba(17, 24, 39, 0.98) 100%)",
            backdropFilter: "blur(40px)",
            borderLeft: "1px solid rgba(255, 255, 255, 0.06)",
          }}
        >
          {/* Header */}
          <div className="flex items-center justify-between px-5 py-4 border-b border-white/[0.06]">
            <span className="text-[11px] font-semibold tracking-wider text-white/40 uppercase">
              Now Playing
            </span>
            <button
              onClick={() => setNowPlayingPanelOpen(false)}
              className="text-aura-muted rounded-lg p-1.5 transition-all hover:bg-white/[0.06] hover:text-white"
            >
              <X size={15} />
            </button>
          </div>

          {/* Scrollable content */}
          <div className="no-scrollbar flex-1 overflow-y-auto px-5 py-5 space-y-5">

            {/* Large Album Art */}
            <motion.div
              initial={{ opacity: 0, scale: 0.95 }}
              animate={{ opacity: 1, scale: 1 }}
              transition={{ duration: 0.4 }}
              className="relative mx-auto aspect-square w-full overflow-hidden rounded-2xl shadow-2xl"
            >
              <Image
                src={track.artworkUrl100.replace("100x100bb.jpg", "600x600bb.jpg")}
                alt={track.trackName}
                fill
                className="object-cover"
                priority
              />
              <div className="absolute inset-0 bg-gradient-to-t from-black/20 to-transparent" />
              {/* Glow effect */}
              <div className="absolute -inset-4 -z-10 rounded-3xl bg-aura-primary/[0.06] blur-2xl" />
            </motion.div>

            {/* Track Title & Artist */}
            <div className="space-y-1">
              <h2 className="font-display text-lg font-bold tracking-tight text-white leading-tight line-clamp-2">
                {track.trackName}
              </h2>
              <p className="text-aura-primary text-[13px] font-semibold">
                {track.artistName}
              </p>
              <p className="text-aura-muted text-[12px]">
                {track.collectionName}
              </p>
            </div>

            {/* Details */}
            <div className="rounded-xl border border-white/[0.05] bg-white/[0.02] px-4 py-1">
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
              <h3 className="text-[10px] font-semibold tracking-wider text-white/30 uppercase">Credits</h3>
              <div className="space-y-2">
                <div className="flex items-center gap-3 rounded-xl bg-white/[0.03] border border-white/[0.05] px-3.5 py-2.5">
                  <div className="bg-aura-primary/10 flex h-7 w-7 flex-shrink-0 items-center justify-center rounded-lg">
                    <Music2 size={13} className="text-aura-primary" />
                  </div>
                  <div className="min-w-0">
                    <p className="text-[9px] font-semibold tracking-wider text-white/30 uppercase">Artist</p>
                    <p className="truncate text-[13px] font-medium text-white/80">{track.artistName}</p>
                  </div>
                </div>

                <div className="flex items-center gap-3 rounded-xl bg-white/[0.03] border border-white/[0.05] px-3.5 py-2.5">
                  <div className="bg-aura-secondary/10 flex h-7 w-7 flex-shrink-0 items-center justify-center rounded-lg">
                    <Disc3 size={13} className="text-aura-secondary" />
                  </div>
                  <div className="min-w-0">
                    <p className="text-[9px] font-semibold tracking-wider text-white/30 uppercase">Album</p>
                    <p className="truncate text-[13px] font-medium text-white/80">{track.collectionName}</p>
                  </div>
                </div>

                {releaseYear && (
                  <div className="flex items-center gap-3 rounded-xl bg-white/[0.03] border border-white/[0.05] px-3.5 py-2.5">
                    <div className="flex h-7 w-7 flex-shrink-0 items-center justify-center rounded-lg bg-white/[0.05]">
                      <Calendar size={13} className="text-white/50" />
                    </div>
                    <div className="min-w-0">
                      <p className="text-[9px] font-semibold tracking-wider text-white/30 uppercase">Year</p>
                      <p className="truncate text-[13px] font-medium text-white/80">{releaseYear}</p>
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
              className="flex w-full items-center justify-center gap-2 rounded-xl border border-white/[0.06] bg-white/[0.03] px-4 py-2.5 text-[11px] font-semibold tracking-wider text-white/40 uppercase transition-all hover:bg-white/[0.06] hover:text-white/70"
            >
              Open in Apple Music <ExternalLink size={12} />
            </a>
          </div>
        </motion.aside>
      )}
    </AnimatePresence>
  )
}
