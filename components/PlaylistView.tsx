"use client"

import { motion } from "framer-motion"
import { debounce } from "lodash"
import { Grid, Heart, ImagePlus, List, LogOut, Music, Play, Plus, Search, User as UserIcon, UserPlus, X } from "lucide-react"
import Image from "next/image"
import { useMemo, useRef, useState } from "react"
import { CollaboratorsModal } from "components/Playlist/CollaboratorsModal"
import { useAuth } from "components/Providers/AuthProvider"
import { TrackList } from "components/TrackList/TrackList"
import { iTunesTrack } from "lib/itunes"
import { useLibraryStore, usePlaybackStore } from "lib/store"
import { createClient } from "lib/supabase/client"

interface PlaylistViewProps {
  onPlayFromCard: (track: iTunesTrack, context: "search" | "recent" | "playlist" | "library") => void
  handleToggleLike: (track: iTunesTrack) => void
  handleAddToPlaylist: (track: iTunesTrack, playlistId: string) => void
  likedSongIds: number[]
}

export function PlaylistView({
  onPlayFromCard,
  handleToggleLike,
  handleAddToPlaylist,
  likedSongIds,
}: PlaylistViewProps) {
  const { user } = useAuth()
  const {
    playlists,
    activePlaylistId,
    playlistTracks,
    currentPlaylistName,
    isAddingSongs,
    setAddingSongs,
    playlistSearchTracks,
    handlePlaylistSearch,
    updatePlaylistImage,
    leavePlaylist,
  } = useLibraryStore()

  const { isPlaying, currentTrack, pause: handlePause } = usePlaybackStore()
  const [viewMode, setViewMode] = useState<"grid" | "list">("list")
  const [isCollaboratorsOpen, setIsCollaboratorsOpen] = useState(false)
  const [isUploadingImage, setIsUploadingImage] = useState(false)
  const [searchValue, setSearchValue] = useState("")
  const fileInputRef = useRef<HTMLInputElement>(null)
  const searchInputRef = useRef<HTMLInputElement>(null)
  const supabase = createClient()

  const activePlaylist = playlists.find((p) => p.id === activePlaylistId)
  const isOwner = activePlaylist?.user_id === user?.id

  const playlistTrackIds = useMemo(
    () => new Set(playlistTracks.map((t) => Number(t.trackId))),
    [playlistTracks]
  )

  const handleCoverImageClick = () => {
    if (!isOwner) return
    fileInputRef.current?.click()
  }

  const handleCoverFileChange = async (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0]
    if (!file || !activePlaylist) return

    // Extract existing storage key before overwriting, so we can clean it up on success
    const oldKey = activePlaylist.image_url
      ? activePlaylist.image_url.split("/storage/v1/object/public/playlist-images/")[1]
      : null

    setIsUploadingImage(true)
    const ext = file.name.split(".").pop()
    const fileName = `playlist-covers/${activePlaylist.id}-${Date.now()}.${ext}`
    try {
      const { error: uploadError } = await supabase.storage
        .from("playlist-images")
        .upload(fileName, file, { cacheControl: "3600", upsert: false })
      if (uploadError) throw uploadError

      const { data } = supabase.storage.from("playlist-images").getPublicUrl(fileName)

      try {
        await updatePlaylistImage(activePlaylist.id, data.publicUrl)
      } catch (patchErr) {
        // PATCH failed — remove the newly uploaded file so it doesn't become orphaned
        await supabase.storage.from("playlist-images").remove([fileName])
        throw patchErr
      }

      // Update succeeded — remove the old cover if there was one
      if (oldKey) {
        await supabase.storage.from("playlist-images").remove([oldKey])
      }
    } catch (err) {
      console.error("Cover image upload failed:", err)
    } finally {
      setIsUploadingImage(false)
      if (fileInputRef.current) fileInputRef.current.value = ""
    }
  }

  const debouncedSearch = useMemo(
    () => debounce((query: string) => handlePlaylistSearch(query), 400),
    [handlePlaylistSearch]
  )

  const handlePlayAll = () => {
    if (playlistTracks.length > 0) {
      const track = playlistTracks[0]
      if (track) {
        const context = activePlaylistId === "liked" ? "library" : "playlist"
        onPlayFromCard(track, context)
      }
    }
  }

  return (
    <div className="space-y-10 pb-20">
      {/* Header */}
      <header className="relative overflow-hidden rounded-3xl bg-gradient-to-br from-white/[0.03] to-transparent border border-white/[0.05] p-8 lg:p-10">
        {/* Ambient glow */}
        <div className="absolute -top-20 -right-20 h-60 w-60 rounded-full bg-aura-primary/[0.06] blur-[80px]" />

        <div className="relative flex flex-col items-end gap-6 md:flex-row">
          {/* Playlist artwork */}
          <motion.div
            initial={{ opacity: 0, scale: 0.9 }}
            animate={{ opacity: 1, scale: 1 }}
            transition={{ duration: 0.4 }}
            className={`group relative h-36 w-36 flex-shrink-0 overflow-hidden rounded-2xl shadow-2xl md:h-40 md:w-40 ${
              activePlaylistId === "liked"
                ? "bg-gradient-to-br from-aura-primary to-aura-secondary"
                : "bg-aura-surface border border-white/[0.06]"
            }`}
          >
            {/* Background image or default icon */}
            {activePlaylist?.image_url ? (
              <Image
                src={activePlaylist.image_url}
                alt={activePlaylist.name}
                fill
                sizes="160px"
                className="object-cover"
              />
            ) : (
              <div className="absolute inset-0 flex items-center justify-center">
                {activePlaylistId === "liked" ? (
                  <Heart className="h-14 w-14 fill-current text-white" />
                ) : (
                  <Music className="text-aura-muted group-hover:text-aura-primary h-14 w-14 transition-colors duration-500" />
                )}
              </div>
            )}

            {/* Upload overlay — only for owned playlists, not liked */}
            {isOwner && activePlaylistId !== "liked" && (
              <>
                <input
                  ref={fileInputRef}
                  type="file"
                  accept="image/*"
                  className="hidden"
                  onChange={handleCoverFileChange}
                />
                <button
                  onClick={handleCoverImageClick}
                  disabled={isUploadingImage}
                  className="absolute inset-0 flex flex-col items-center justify-center gap-1.5 bg-black/50 opacity-100 backdrop-blur-sm transition-opacity duration-300 focus-visible:opacity-100 sm:opacity-0 sm:group-hover:opacity-100 disabled:cursor-wait"
                >
                  <ImagePlus size={22} className="text-white" />
                  <span className="text-[10px] font-bold tracking-widest text-white uppercase">
                    {isUploadingImage ? "Uploading..." : activePlaylist?.image_url ? "Change Photo" : "Add Photo"}
                  </span>
                </button>
              </>
            )}
          </motion.div>

          {/* Playlist info */}
          <div className="flex-1 space-y-2 pb-2">
            <div className="text-aura-primary inline-block rounded-full bg-aura-primary/10 px-3 py-1 text-[9px] font-semibold tracking-wider uppercase">
              {activePlaylistId === "liked" ? "Collection" : "Playlist"}
            </div>
            <h1 className="font-display line-clamp-1 text-3xl font-bold tracking-tight text-white md:text-4xl lg:text-5xl">
              {currentPlaylistName || "Your Vibes"}
            </h1>
            <div className="text-aura-muted flex items-center gap-3 text-[11px] font-medium">
              <span className="flex items-center gap-1.5 text-white/70">
                <UserIcon size={12} className="text-aura-primary" /> {user?.email?.split("@")[0]}
              </span>
              <span className="h-1 w-1 rounded-full bg-white/10" />
              <span>{playlistTracks.length} tracks</span>
            </div>
          </div>
        </div>
      </header>

      {/* Controls Bar */}
      <div className="flex items-center justify-between">
        <div className="flex items-center gap-4">
          <motion.button
            whileHover={{ scale: 1.02 }}
            whileTap={{ scale: 0.98 }}
            onClick={handlePlayAll}
            className="btn-primary flex items-center gap-2.5 text-[11px] font-bold tracking-wider uppercase"
          >
            <Play fill="currentColor" size={15} /> Play All
          </motion.button>

          <button
            onClick={() => setAddingSongs(!isAddingSongs)}
            className={`flex items-center gap-2 rounded-full px-5 py-2.5 text-[11px] font-bold tracking-wider uppercase transition-all ${
              isAddingSongs
                ? "bg-white text-black"
                : "btn-outline"
            }`}
          >
            <Plus size={14} />
            Add Track
          </button>

          {activePlaylist && activePlaylist.user_id === user?.id && (
            <button
              onClick={() => setIsCollaboratorsOpen(true)}
              className="btn-outline flex items-center gap-2 rounded-full px-5 py-2.5 text-[11px] font-bold tracking-wider uppercase transition-all"
            >
              <UserPlus size={14} />
              Share
            </button>
          )}

          {activePlaylist?.isShared && (
            <button
              onClick={async () => {
                if (!confirm(`Leave "${activePlaylist.name}"? You will no longer have access to this playlist.`)) return
                await leavePlaylist(activePlaylist.id)
              }}
              className="btn-outline flex items-center gap-2 rounded-full px-5 py-2.5 text-[11px] font-bold tracking-wider uppercase transition-all hover:border-red-400/50 hover:text-red-400"
            >
              <LogOut size={14} />
              Leave
            </button>
          )}
        </div>

        <div className="hidden items-center gap-1 rounded-xl bg-white/[0.04] p-1 lg:flex">
          <button
            onClick={() => setViewMode("list")}
            className={`rounded-lg p-2.5 transition-all ${
              viewMode === "list" ? "bg-white/[0.08] text-white" : "text-aura-muted hover:text-white"
            }`}
          >
            <List size={17} />
          </button>
          <button
            onClick={() => setViewMode("grid")}
            className={`rounded-lg p-2.5 transition-all ${
              viewMode === "grid" ? "bg-white/[0.08] text-white" : "text-aura-muted hover:text-white"
            }`}
          >
            <Grid size={17} />
          </button>
        </div>
      </div>

      {/* Content */}
      <div className="min-h-[400px]">
        {isAddingSongs && (
          <div className="mb-10 space-y-6">
            <div className="relative max-w-xl">
              <Search className="text-aura-muted absolute top-1/2 left-4 h-4 w-4 -translate-y-1/2" />
              <input
                ref={searchInputRef}
                autoFocus
                value={searchValue}
                placeholder="Find tracks to add..."
                onChange={(e) => {
                  setSearchValue(e.target.value)
                  debouncedSearch(e.target.value)
                }}
                className="h-11 w-full rounded-xl border border-white/[0.06] bg-white/[0.04] py-3 pr-10 pl-11 text-[13px] font-medium text-white transition-all focus:bg-white/[0.07] focus:border-aura-primary/30 focus:outline-none focus:ring-1 focus:ring-aura-primary/20 placeholder-aura-muted"
              />
              {searchValue.length > 0 && (
                <button
                  type="button"
                  onClick={() => {
                    setSearchValue("")
                    debouncedSearch.cancel()
                    handlePlaylistSearch("")
                    searchInputRef.current?.focus()
                  }}
                  className="absolute top-1/2 right-3 -translate-y-1/2 text-aura-muted rounded-full p-0.5 transition-all hover:bg-white/10 hover:text-white"
                >
                  <X className="h-3.5 w-3.5" />
                </button>
              )}
            </div>
            {playlistSearchTracks.length > 0 && (
              <div className="space-y-4">
                <h3 className="text-[10px] font-semibold tracking-wider text-aura-muted uppercase px-1">
                  Search Results
                </h3>
                <TrackList
                  tracks={playlistSearchTracks}
                  currentTrackId={currentTrack?.trackId ?? null}
                  isPlaying={isPlaying}
                  onPlay={(t) => onPlayFromCard(t, "search")}
                  onPause={handlePause}
                  isLoading={false}
                  likedSongIds={likedSongIds}
                  onToggleLike={handleToggleLike}
                  onAddToPlaylist={handleAddToPlaylist}
                  playlists={playlists}
                  activePlaylistId={typeof activePlaylistId === "string" && activePlaylistId !== "liked" && activePlaylistId !== "library" && activePlaylistId !== "home" ? activePlaylistId : undefined}
                  playlistTrackIds={playlistTrackIds}
                  viewMode={viewMode}
                />
                <div className="my-6 h-px bg-white/[0.04]" />
              </div>
            )}
          </div>
        )}

        <div className="space-y-3">
          {isAddingSongs && (
            <h3 className="text-[10px] font-semibold tracking-wider text-aura-muted uppercase px-1">Playlist Tracks</h3>
          )}
          <TrackList
            tracks={playlistTracks}
            currentTrackId={currentTrack?.trackId ?? null}
            isPlaying={isPlaying}
            onPlay={(t) => onPlayFromCard(t, activePlaylistId === "liked" ? "library" : "playlist")}
            onPause={handlePause}
            isLoading={false}
            likedSongIds={likedSongIds}
            onToggleLike={handleToggleLike}
            viewMode={viewMode}
          />
        </div>
      </div>

      {activePlaylist && (
        <CollaboratorsModal
          isOpen={isCollaboratorsOpen}
          onClose={() => setIsCollaboratorsOpen(false)}
          playlistId={activePlaylist.id}
          playlistName={activePlaylist.name}
        />
      )}
    </div>
  )
}
