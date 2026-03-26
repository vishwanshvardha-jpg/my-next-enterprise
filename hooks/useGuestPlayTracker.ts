import { useEffect, useRef } from "react"
import { useGuestStore } from "lib/store/guest"
import { usePlaybackStore } from "lib/store"

export function useGuestPlayTracker() {
  const { isGuest, incrementSongsPlayed } = useGuestStore()
  const { currentTrack, isPlaying } = usePlaybackStore()
  const lastTrackedId = useRef<number | null>(null)

  useEffect(() => {
    if (!isGuest || !isPlaying || !currentTrack) return
    if (currentTrack.trackId === lastTrackedId.current) return
    lastTrackedId.current = currentTrack.trackId
    incrementSongsPlayed()
  }, [isGuest, isPlaying, currentTrack?.trackId])
}
