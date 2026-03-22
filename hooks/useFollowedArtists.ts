import { useCallback, useEffect, useState } from "react"
import { useAuth } from "components/Providers/AuthProvider"
import { getFollowedArtists, toggleFollowArtist } from "lib/actions/artists"

export interface FollowedArtist {
  name: string
  artwork: string
}

const STORAGE_KEY = "aura_followed_artists"

function readLocalStorage(): FollowedArtist[] {
  try {
    const stored = localStorage.getItem(STORAGE_KEY)
    return stored ? (JSON.parse(stored) as FollowedArtist[]) : []
  } catch {
    return []
  }
}

function writeLocalStorage(artists: FollowedArtist[]) {
  try {
    localStorage.setItem(STORAGE_KEY, JSON.stringify(artists))
  } catch {
    // Ignore storage quota errors
  }
}

export function useFollowedArtists() {
  const { user } = useAuth()
  const [followedArtists, setFollowedArtists] = useState<FollowedArtist[]>([])

  // Load on mount and whenever auth state changes
  useEffect(() => {
    const load = async () => {
      if (user) {
        // Authenticated: fetch from backend (source of truth)
        const records = await getFollowedArtists()
        const mapped = records.map((r) => ({
          name: r.artist_name,
          artwork: r.artwork_url,
        }))
        setFollowedArtists(mapped)
        // Keep localStorage as an offline cache
        writeLocalStorage(mapped)
      } else {
        // Guest: use localStorage
        setFollowedArtists(readLocalStorage())
      }
    }

    load()
  }, [user])

  const toggleFollow = useCallback(
    async (name: string, artwork: string) => {
      // Capture state before update for rollback
      let snapshot: FollowedArtist[] = []

      // Optimistic update — instant UI response
      setFollowedArtists((prev) => {
        snapshot = prev
        const isFollowing = prev.some((a) => a.name === name)
        const next = isFollowing
          ? prev.filter((a) => a.name !== name)
          : [{ name, artwork }, ...prev]
        writeLocalStorage(next)
        return next
      })

      if (user) {
        try {
          await toggleFollowArtist(name, artwork)
        } catch (err) {
          // API failed — roll back the optimistic update
          console.error("Failed to sync follow state:", err)
          setFollowedArtists(snapshot)
          writeLocalStorage(snapshot)
        }
      }
    },
    [user]
  )

  const isFollowing = useCallback(
    (name: string) => followedArtists.some((a) => a.name === name),
    [followedArtists]
  )

  return { followedArtists, toggleFollow, isFollowing }
}
