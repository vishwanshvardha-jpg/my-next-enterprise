"use client"

import { Music, Pause, Play, SkipBack, SkipForward, Volume2, VolumeX, ListMusic, Repeat, Shuffle } from "lucide-react"
import Image from "next/image"
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
  } = usePlaybackStore()

  const [progress, setProgress] = useState(0)
  const [duration, setDuration] = useState(0)
  const [volume, setVolume] = useState(1)
  const [isMuted, setIsMuted] = useState(false)
  const progressBarRef = useRef<HTMLDivElement>(null)

  const currentIndex = track ? currentList.findIndex(t => t.trackId === track.trackId) : -1
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

  return (
    <div className="fixed bottom-0 left-0 right-0 z-[100] p-4 lg:px-8">
      <div className="mx-auto max-w-7xl glass-dark rounded-[2.5rem] p-4 lg:p-6 shadow-2xl flex items-center justify-between gap-8 h-24 lg:h-28">
        
        {/* Track Info */}
        <div className="flex items-center gap-4 min-w-0 flex-1 lg:flex-none lg:w-[30%]">
          <div className="relative h-16 w-16 flex-shrink-0 overflow-hidden rounded-2xl shadow-lg border border-white/10 group">
            <Image
              src={track.artworkUrl100.replace("100x100bb.jpg", "400x400bb.jpg")}
              alt={track.trackName}
              fill
              className="object-cover group-hover:scale-110 transition-transform duration-500"
            />
          </div>
          <div className="min-w-0">
            <h4 className="font-display font-bold text-white truncate text-base mb-1 hover:text-aura-primary transition-colors cursor-pointer">
              {track.trackName}
            </h4>
            <p className="text-xs font-medium text-aura-muted truncate uppercase tracking-widest leading-none">
              {track.artistName}
            </p>
          </div>
        </div>

        {/* Player Controls */}
        <div className="flex-1 flex flex-col items-center max-w-2xl">
          <div className="flex items-center gap-6 mb-3">
            <button className="text-aura-muted hover:text-white transition-colors">
              <Shuffle size={16} />
            </button>
            <button
              onClick={onPrev}
              disabled={!hasPrev}
              className="text-white transition-colors hover:text-aura-primary disabled:opacity-20"
            >
              <SkipBack className="h-6 w-6 fill-current" />
            </button>
            <button
              onClick={togglePlay}
              className="h-12 w-12 rounded-full bg-white text-black flex items-center justify-center hover:scale-105 active:scale-95 transition-all shadow-xl"
            >
              {isPlaying ? <Pause size={20} fill="currentColor" /> : <Play size={20} fill="currentColor" className="ml-1" />}
            </button>
            <button
              onClick={onNext}
              disabled={!hasNext}
              className="text-white transition-colors hover:text-aura-primary disabled:opacity-20"
            >
              <SkipForward className="h-6 w-6 fill-current" />
            </button>
            <button className="text-aura-muted hover:text-white transition-colors">
              <Repeat size={16} />
            </button>
          </div>
          
          <div className="w-full flex items-center gap-3">
            <span className="text-[10px] font-mono text-aura-muted w-8 text-right">{formatTime(progress)}</span>
            <div 
              ref={progressBarRef}
              onClick={handleSeek}
              className="flex-1 h-1.5 bg-white/10 rounded-full cursor-pointer group relative overflow-hidden"
            >
              <div 
                className="absolute inset-y-0 left-0 bg-white group-hover:bg-aura-primary transition-colors"
                style={{ width: `${progressPercent}%` }}
              />
            </div>
            <span className="text-[10px] font-mono text-aura-muted w-8">{formatTime(duration)}</span>
          </div>
        </div>

        {/* Volume & Queue */}
        <div className="hidden lg:flex items-center justify-end gap-6 w-[30%]">
          <button className="text-aura-muted hover:text-white transition-colors">
            <ListMusic size={20} />
          </button>
          <div className="flex items-center gap-3 bg-white/5 px-4 py-2 rounded-2xl border border-white/5 w-32 group">
            <button onClick={() => setIsMuted(!isMuted)} className="text-aura-muted group-hover:text-white transition-colors">
              {isMuted || volume === 0 ? <VolumeX size={18} /> : <Volume2 size={18} />}
            </button>
            <input
              type="range"
              min="0"
              max="1"
              step="0.01"
              value={isMuted ? 0 : volume}
              onChange={(e) => setVolume(parseFloat(e.target.value))}
              className="w-full h-1 accent-white cursor-pointer"
            />
          </div>
        </div>
      </div>
    </div>
  )
}
