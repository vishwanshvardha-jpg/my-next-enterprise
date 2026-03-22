"use client"

import { Pause, Play, Repeat, Shuffle, SkipBack, SkipForward, Volume2, VolumeX } from "lucide-react"
import Image from "next/image"
import posthog from "posthog-js"
import { useEffect, useRef, useState } from "react"
import { usePlaybackStore } from "lib/store"

export function NowPlayingBar() {
  const {
    currentTrack: track,
    isPlaying,
    audio,
    togglePlay,
    next: onNext,
    prev: onPrev,
    currentList,
    isShuffle,
    repeatMode,
    toggleShuffle,
    toggleRepeat,
  } = usePlaybackStore()

  const [progress, setProgress] = useState(0)
  const [duration, setDuration] = useState(0)
  const [volume, setVolume] = useState(1)
  const [isMuted, setIsMuted] = useState(false)
  const progressBarRef = useRef<HTMLDivElement>(null)

  const currentIndex = track ? currentList.findIndex((t) => t.trackId === track.trackId) : -1
  const hasNext = isShuffle || repeatMode !== "off" || (currentIndex !== -1 && currentIndex < currentList.length - 1)
  const hasPrev = isShuffle || repeatMode !== "off" || currentIndex > 0

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

  return (
    <div className="fixed right-0 bottom-0 left-0 z-[100] glass-player">
      <div className="flex h-[72px] items-center justify-between gap-6 px-5 lg:px-8">

        {/* Track Info — Left */}
        <div className="flex min-w-0 w-[28%] flex-shrink-0 items-center gap-3">
          <div className="group relative h-12 w-12 flex-shrink-0 overflow-hidden rounded-lg border border-white/[0.08] shadow-lg">
            <Image
              src={track.artworkUrl100.replace("100x100bb.jpg", "400x400bb.jpg")}
              alt={track.trackName}
              fill
              className="object-cover transition-transform duration-500 group-hover:scale-110"
            />
          </div>
          <div className="min-w-0">
            <h4 className="hover:text-aura-primary mb-0.5 cursor-pointer truncate text-[13px] font-semibold text-white transition-colors">
              {track.trackName}
            </h4>
            <p className="text-aura-muted truncate text-[11px]">
              {track.artistName}
            </p>
          </div>
        </div>

        {/* Player Controls + Progress — Center */}
        <div className="flex w-64 flex-col items-center gap-1">
          {/* Controls */}
          <div className="flex items-center gap-5">
            <button 
              onClick={toggleShuffle}
              className={`transition-colors ${isShuffle ? 'text-aura-primary' : 'text-aura-muted hover:text-white'}`}
            >
              <Shuffle size={15} />
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
              className="text-white transition-colors hover:text-aura-primary disabled:opacity-20"
            >
              <SkipBack className="h-4.5 w-4.5 fill-current" />
            </button>
            <button
              onClick={togglePlay}
              className="flex h-9 w-9 items-center justify-center rounded-full bg-white text-black shadow-lg transition-all hover:scale-105 active:scale-95"
            >
              {isPlaying ? (
                <Pause size={16} fill="currentColor" />
              ) : (
                <Play size={16} fill="currentColor" className="ml-0.5" />
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
              className="text-white transition-colors hover:text-aura-primary disabled:opacity-20"
            >
              <SkipForward className="h-4.5 w-4.5 fill-current" />
            </button>
            <button 
              onClick={toggleRepeat}
              className={`relative transition-colors ${repeatMode !== "off" ? 'text-aura-primary' : 'text-aura-muted hover:text-white'}`}
            >
              <Repeat size={15} />
              {repeatMode === "one" && (
                <span className="absolute -top-[4px] -right-[4px] flex h-[10px] w-[10px] items-center justify-center rounded-full bg-aura-primary text-[7px] font-bold text-black border border-black">
                  1
                </span>
              )}
            </button>
          </div>

          {/* Progress Bar */}
          <div className="flex w-full items-center gap-2.5">
            <span className="text-aura-muted w-9 text-right font-mono text-[10px]">{formatTime(progress)}</span>
            <div
              ref={progressBarRef}
              onClick={handleSeek}
              className="group relative h-1 flex-1 cursor-pointer overflow-hidden rounded-full bg-white/[0.08]"
            >
              <div
                className="absolute inset-y-0 left-0 rounded-full bg-white/60 transition-colors group-hover:bg-aura-primary"
                style={{ width: `${progressPercent}%` }}
              />
              {/* Seek thumb */}
              <div
                className="absolute top-1/2 -translate-y-1/2 h-3 w-3 rounded-full bg-white shadow-lg opacity-0 transition-opacity group-hover:opacity-100"
                style={{ left: `calc(${progressPercent}% - 6px)` }}
              />
            </div>
            <span className="text-aura-muted w-9 font-mono text-[10px]">{formatTime(duration)}</span>
          </div>
        </div>

        {/* Volume — Right */}
        <div className="hidden w-[28%] items-center justify-end gap-4 lg:flex">
          <div className="group flex w-28 items-center gap-2 rounded-lg bg-white/[0.04] px-2.5 py-1.5">
            <button
              onClick={() => setIsMuted(!isMuted)}
              className="text-aura-muted transition-colors group-hover:text-white"
            >
              {isMuted || volume === 0 ? <VolumeX size={15} /> : <Volume2 size={15} />}
            </button>
            <input
              type="range"
              min="0"
              max="1"
              step="0.01"
              value={isMuted ? 0 : volume}
              onChange={(e) => setVolume(parseFloat(e.target.value))}
              className="h-1 w-full cursor-pointer accent-aura-primary"
            />
          </div>
        </div>
      </div>
    </div>
  )
}
