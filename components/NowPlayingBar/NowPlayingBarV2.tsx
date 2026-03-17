"use client"

import { ListMusic, Pause, Play, Repeat, Shuffle, SkipBack, SkipForward, Volume2, VolumeX } from "lucide-react"
import Image from "next/image"
import posthog from "posthog-js"
import { useEffect, useRef, useState } from "react"
import { usePlaybackStore, useUIStore } from "lib/store"

export function NowPlayingBarV2() {
  const {
    currentTrack: track,
    isPlaying,
    audio,
    togglePlay,
    next: onNext,
    prev: onPrev,
    currentList,
  } = usePlaybackStore()

  const { isNowPlayingPanelOpen, toggleNowPlayingPanel } = useUIStore()

  const [progress, setProgress] = useState(0)
  const [duration, setDuration] = useState(0)
  const [volume, setVolume] = useState(1)
  const [isMuted, setIsMuted] = useState(false)
  const progressBarRef = useRef<HTMLDivElement>(null)

  const currentIndex = track ? currentList.findIndex((t) => t.trackId === track.trackId) : -1
  const hasNext = currentIndex !== -1 && currentIndex < currentList.length - 1
  const hasPrev = currentIndex > 0

  useEffect(() => {
    if (!audio) return

    const handleTimeUpdate = () => setProgress(audio.currentTime)
    const handleLoadedMetadata = () => setDuration(audio.duration)
    const handleEnded = () => {
      setProgress(0)
      if (hasNext) onNext()
    }

    audio.addEventListener("timeupdate", handleTimeUpdate)
    audio.addEventListener("loadedmetadata", handleLoadedMetadata)
    audio.addEventListener("ended", handleEnded)

    return () => {
      audio.removeEventListener("timeupdate", handleTimeUpdate)
      audio.removeEventListener("loadedmetadata", handleLoadedMetadata)
      audio.removeEventListener("ended", handleEnded)
    }
  }, [audio, hasNext, onNext])

  useEffect(() => {
    if (audio) {
      audio.volume = isMuted ? 0 : volume
    }
  }, [volume, isMuted, audio])

  if (!track) return null

  const progressPercent = duration > 0 ? (progress / duration) * 100 : 0

  const formatTime = (seconds: number) => {
    const s = Math.floor(seconds || 0)
    const mins = Math.floor(s / 60)
    const secs = s % 60
    return `${mins}:${secs.toString().padStart(2, "0")}`
  }

  const handleSeek = (e: React.MouseEvent<HTMLDivElement>) => {
    if (!progressBarRef.current || !audio || !duration) return
    const rect = progressBarRef.current.getBoundingClientRect()
    const percent = (e.clientX - rect.left) / rect.width
    const targetTime = Math.max(0, Math.min(percent * duration, duration))
    audio.currentTime = targetTime
    setProgress(targetTime)
  }

  const handleTogglePanel = () => {
    const willOpen = !isNowPlayingPanelOpen
    toggleNowPlayingPanel()
    posthog.capture(willOpen ? "right_panel_opened" : "right_panel_closed", {
      track_id: track.trackId,
      track_name: track.trackName,
    })
  }

  return (
    <div className="fixed right-0 bottom-0 left-0 z-[100] border-t border-white/10 bg-black/95 backdrop-blur-2xl">
      {/* Progress bar — flush to top of bar, full width */}
      <div
        ref={progressBarRef}
        onClick={handleSeek}
        className="group relative h-1 w-full cursor-pointer bg-white/10 hover:h-1.5 transition-all duration-150"
      >
        <div
          className="group-hover:bg-aura-primary absolute inset-y-0 left-0 bg-white/70 transition-colors"
          style={{ width: `${progressPercent}%` }}
        />
      </div>

      <div className="flex h-20 items-center justify-between gap-4 px-4 lg:px-8">

        {/* Track Info */}
        <div className="flex min-w-0 w-[30%] flex-shrink-0 items-center gap-3">
          <div className="group relative h-14 w-14 flex-shrink-0 overflow-hidden rounded-md border border-white/10 shadow-lg">
            <Image
              src={track.artworkUrl100.replace("100x100bb.jpg", "400x400bb.jpg")}
              alt={track.trackName}
              fill
              className="object-cover transition-transform duration-500 group-hover:scale-110"
            />
          </div>
          <div className="min-w-0">
            <h4 className="hover:text-aura-primary mb-0.5 cursor-pointer truncate text-sm font-bold text-white transition-colors">
              {track.trackName}
            </h4>
            <p className="text-aura-muted truncate text-xs font-medium">
              {track.artistName}
            </p>
          </div>
        </div>

        {/* Player Controls — center */}
        <div className="flex flex-1 max-w-2xl flex-col items-center gap-2">
          <div className="flex items-center gap-6">
            <button className="text-aura-muted transition-colors hover:text-white">
              <Shuffle size={16} />
            </button>
            <button
              onClick={() => {
                posthog.capture("playback_skipped_prev", {
                  track_id: track.trackId,
                  track_name: track.trackName,
                  artist_name: track.artistName,
                })
                onPrev()
              }}
              disabled={!hasPrev}
              className="hover:text-aura-primary text-white transition-colors disabled:opacity-20"
            >
              <SkipBack className="h-5 w-5 fill-current" />
            </button>
            <button
              onClick={togglePlay}
              className="flex h-10 w-10 items-center justify-center rounded-full bg-white text-black shadow-xl transition-all hover:scale-105 active:scale-95"
            >
              {isPlaying ? (
                <Pause size={18} fill="currentColor" />
              ) : (
                <Play size={18} fill="currentColor" className="ml-0.5" />
              )}
            </button>
            <button
              onClick={() => {
                posthog.capture("playback_skipped_next", {
                  track_id: track.trackId,
                  track_name: track.trackName,
                  artist_name: track.artistName,
                })
                onNext()
              }}
              disabled={!hasNext}
              className="hover:text-aura-primary text-white transition-colors disabled:opacity-20"
            >
              <SkipForward className="h-5 w-5 fill-current" />
            </button>
            <button className="text-aura-muted transition-colors hover:text-white">
              <Repeat size={16} />
            </button>
          </div>

          {/* Time */}
          <div className="flex w-full items-center justify-center gap-2">
            <span className="text-aura-muted w-8 text-right font-mono text-[10px]">{formatTime(progress)}</span>
            <span className="text-aura-muted font-mono text-[10px]">/</span>
            <span className="text-aura-muted w-8 font-mono text-[10px]">{formatTime(duration)}</span>
          </div>
        </div>

        {/* Right: Volume + Panel Toggle */}
        <div className="hidden w-[30%] items-center justify-end gap-5 lg:flex">
          <div className="group flex w-28 items-center gap-2 rounded-lg border border-white/5 bg-white/5 px-3 py-1.5">
            <button
              onClick={() => setIsMuted(!isMuted)}
              className="text-aura-muted transition-colors group-hover:text-white"
            >
              {isMuted || volume === 0 ? <VolumeX size={16} /> : <Volume2 size={16} />}
            </button>
            <input
              type="range"
              min="0"
              max="1"
              step="0.01"
              value={isMuted ? 0 : volume}
              onChange={(e) => setVolume(parseFloat(e.target.value))}
              className="h-1 w-full cursor-pointer accent-white"
            />
          </div>

          {/* Panel toggle */}
          <button
            onClick={handleTogglePanel}
            title="Now Playing view"
            className={`rounded-md p-2 transition-all ${
              isNowPlayingPanelOpen
                ? "bg-aura-primary/20 text-aura-primary"
                : "text-aura-muted hover:text-white hover:bg-white/10"
            }`}
          >
            <ListMusic size={18} />
          </button>
        </div>

      </div>
    </div>
  )
}
