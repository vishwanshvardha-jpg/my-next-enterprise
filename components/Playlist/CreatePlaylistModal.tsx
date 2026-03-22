"use client"

import * as Dialog from "@radix-ui/react-dialog"
import { Image as ImageIcon, Music, X } from "lucide-react"
import Image from "next/image"
import posthog from "posthog-js"
import { useRef, useState } from "react"

import { createPlaylist } from "lib/actions/playlists"
import { createClient } from "lib/supabase/client"
import { Playlist } from "lib/types"

interface CreatePlaylistModalProps {
  isOpen: boolean
  onClose: () => void
  onSuccess: (playlist: Playlist) => void
}

export function CreatePlaylistModal({ isOpen, onClose, onSuccess }: CreatePlaylistModalProps) {
  const [name, setName] = useState("")
  const [description, setDescription] = useState("")
  const [imageUrl, setImageUrl] = useState<string | null>(null)
  const [isUploading, setIsUploading] = useState(false)
  const [isSubmitting, setIsSubmitting] = useState(false)
  const fileInputRef = useRef<HTMLInputElement>(null)

  const supabase = createClient()

  const handleImageClick = () => {
    fileInputRef.current?.click()
  }

  const handleFileChange = async (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0]
    if (!file) return

    setIsUploading(true)
    try {
      const ext = file.name.split(".").pop()
      const fileName = `playlist-covers/${Date.now()}.${ext}`
      const { error } = await supabase.storage.from("playlist-images").upload(fileName, file, {
        cacheControl: "3600",
        upsert: false,
      })
      if (error) throw error

      const { data } = supabase.storage.from("playlist-images").getPublicUrl(fileName)
      setImageUrl(data.publicUrl)
    } catch (err) {
      console.error("Image upload failed:", err)
    } finally {
      setIsUploading(false)
      // Reset input so the same file can be re-selected
      if (fileInputRef.current) fileInputRef.current.value = ""
    }
  }

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    if (!name.trim()) return

    setIsSubmitting(true)
    try {
      const playlist = (await createPlaylist(name, description, imageUrl ?? undefined)) as Playlist
      posthog.capture("playlist_created", {
        playlist_id: playlist.id,
        playlist_name: name,
        has_description: description.trim().length > 0,
        has_image: Boolean(imageUrl),
      })
      onSuccess(playlist)
      setName("")
      setDescription("")
      setImageUrl(null)
      onClose()
    } catch (err) {
      posthog.captureException(err)
      console.error("Failed to create playlist:", err)
    } finally {
      setIsSubmitting(false)
    }
  }

  return (
    <Dialog.Root open={isOpen} onOpenChange={onClose}>
      <Dialog.Portal>
        <Dialog.Overlay className="animate-in fade-in fixed inset-0 z-[150] bg-black/80 backdrop-blur-xl duration-300" />
        <Dialog.Content className="bg-aura-bg animate-in zoom-in-95 fade-in fixed top-1/2 left-1/2 z-[151] w-full max-w-xl -translate-x-1/2 -translate-y-1/2 overflow-hidden rounded-2xl border border-white/10 shadow-2xl duration-300">
          <div className="flex items-center justify-between border-b border-white/5 bg-white/[0.02] p-6">
            <Dialog.Title className="font-display text-xl font-black tracking-tight text-white">
              Edit playlist details
            </Dialog.Title>
            <Dialog.Close className="text-aura-muted rounded-lg p-1.5 transition-colors hover:bg-white/5 hover:text-white">
              <X size={20} />
            </Dialog.Close>
          </div>

          <form onSubmit={handleSubmit} className="space-y-8 p-8">
            <div className="grid grid-cols-1 gap-8 md:grid-cols-[200px_1fr]">
              {/* Left Column: Image Area */}
              <div className="space-y-4">
                <input
                  ref={fileInputRef}
                  type="file"
                  accept="image/*"
                  className="hidden"
                  onChange={handleFileChange}
                />
                <button
                  type="button"
                  onClick={handleImageClick}
                  disabled={isUploading}
                  className="text-aura-muted group relative flex aspect-square w-full cursor-pointer flex-col items-center justify-center overflow-hidden rounded-xl border border-white/10 bg-white/5 shadow-inner transition-all hover:bg-white/[0.08] disabled:cursor-wait"
                >
                  {imageUrl ? (
                    <Image
                      src={imageUrl}
                      alt="Playlist cover"
                      fill
                      sizes="200px"
                      className="object-cover"
                    />
                  ) : (
                    <>
                      <Music size={48} className="opacity-20 transition-transform duration-500 group-hover:scale-110" />
                      <div className="absolute right-4 bottom-4 text-white opacity-20">
                        <ImageIcon size={20} />
                      </div>
                    </>
                  )}
                  <div className="absolute inset-0 z-10 flex items-center justify-center bg-black/40 opacity-0 backdrop-blur-sm transition-opacity group-hover:opacity-100">
                    <span className="text-xs font-bold tracking-widest text-white uppercase">
                      {isUploading ? "Uploading..." : "Choose Photo"}
                    </span>
                  </div>
                </button>
              </div>

              {/* Right Column: Inputs */}
              <div className="flex h-[200px] flex-col justify-between">
                <div className="group relative">
                  <input
                    id="name"
                    autoFocus
                    placeholder=" "
                    value={name}
                    onChange={(e) => setName(e.target.value)}
                    className="peek-input focus:border-aura-primary peer w-full rounded-xl border border-white/10 bg-white/5 px-4 pt-6 pb-2 text-white transition-all focus:outline-none"
                  />
                  <label
                    htmlFor="name"
                    className="text-aura-muted pointer-events-none absolute top-2 left-4 text-[10px] font-black tracking-[0.2em] uppercase transition-all peer-placeholder-shown:top-4 peer-placeholder-shown:text-base peer-placeholder-shown:tracking-normal peer-placeholder-shown:normal-case peer-focus:top-2 peer-focus:text-[10px] peer-focus:font-black peer-focus:tracking-[0.2em] peer-focus:uppercase"
                  >
                    Name
                  </label>
                </div>

                <div className="group relative mt-4 flex-1">
                  <textarea
                    id="description"
                    placeholder=" "
                    value={description}
                    onChange={(e) => setDescription(e.target.value)}
                    className="focus:border-aura-primary peer h-full w-full resize-none rounded-xl border border-white/10 bg-white/5 px-4 pt-6 pb-2 text-white transition-all focus:outline-none"
                  />
                  <label
                    htmlFor="description"
                    className="text-aura-muted pointer-events-none absolute top-2 left-4 text-[10px] font-black tracking-[0.2em] uppercase transition-all peer-placeholder-shown:top-4 peer-placeholder-shown:text-base peer-placeholder-shown:tracking-normal peer-placeholder-shown:normal-case peer-focus:top-2 peer-focus:text-[10px] peer-focus:font-black peer-focus:tracking-[0.2em] peer-focus:uppercase"
                  >
                    Add an optional description
                  </label>
                </div>
              </div>
            </div>

            <div className="flex items-center justify-end border-t border-white/5 pt-4">
              <button
                disabled={isSubmitting || isUploading || !name.trim()}
                className="w-full rounded-full bg-white px-10 py-3.5 font-black tracking-widest text-black uppercase shadow-xl transition-all hover:scale-105 active:scale-95 disabled:opacity-50 disabled:hover:scale-100 disabled:active:scale-100 md:w-auto"
              >
                {isSubmitting ? "Saving..." : "Save"}
              </button>
            </div>

            <p className="text-aura-muted text-[10px] leading-relaxed font-medium">
              By proceeding, you agree to give Aura Music access to the data you provide. Please make sure you have the
              right to content you upload.
            </p>
          </form>
        </Dialog.Content>
      </Dialog.Portal>
    </Dialog.Root>
  )
}
