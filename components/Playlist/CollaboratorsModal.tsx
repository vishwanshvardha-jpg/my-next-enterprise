import * as Dialog from "@radix-ui/react-dialog"
import { Check, Copy, Link, Loader2, Mail, Send, UserMinus, UserPlus, X } from "lucide-react"
import { useEffect, useState } from "react"

import { addCollaborator, generateShareToken, getCollaborators, removeCollaborator, sendShareEmail } from "lib/actions/playlists"
import { Collaborator } from "lib/types"

interface CollaboratorsModalProps {
  isOpen: boolean
  onClose: () => void
  playlistId: string
  playlistName: string
}

export function CollaboratorsModal({ isOpen, onClose, playlistId, playlistName }: CollaboratorsModalProps) {
  const [collaborators, setCollaborators] = useState<Collaborator[]>([])
  const [email, setEmail] = useState("")
  const [isLoading, setIsLoading] = useState(false)
  const [isInviting, setIsInviting] = useState(false)
  const [error, setError] = useState<string | null>(null)

  // Share link state
  const [shareToken, setShareToken] = useState<string | null>(null)
  const [isCopying, setIsCopying] = useState(false)
  const [copySuccess, setCopySuccess] = useState(false)
  const [shareEmailInput, setShareEmailInput] = useState("")
  const [isSendingEmail, setIsSendingEmail] = useState(false)
  const [emailSent, setEmailSent] = useState(false)
  const [shareError, setShareError] = useState<string | null>(null)

  const fetchCollaborators = async () => {
    setIsLoading(true)
    const data = await getCollaborators(playlistId)
    setCollaborators(data)
    setIsLoading(false)
  }

  useEffect(() => {
    if (isOpen) {
      fetchCollaborators()
      setEmail("")
      setError(null)
      setShareToken(null)
      setShareEmailInput("")
      setEmailSent(false)
      setShareError(null)
    }
  }, [isOpen, playlistId])

  const getOrCreateShareToken = async (): Promise<string> => {
    if (shareToken) return shareToken
    const token = await generateShareToken(playlistId)
    setShareToken(token)
    return token
  }

  const handleCopyLink = async () => {
    setIsCopying(true)
    setShareError(null)
    try {
      const token = await getOrCreateShareToken()
      const baseUrl = process.env.NEXT_PUBLIC_APP_URL || window.location.origin
      const url = `${baseUrl}/share/${token}`
      await navigator.clipboard.writeText(url)
      setCopySuccess(true)
      setTimeout(() => setCopySuccess(false), 2000)
    } catch {
      setShareError("Failed to copy link")
    } finally {
      setIsCopying(false)
    }
  }

  const handleSendShareEmail = async (e: React.FormEvent) => {
    e.preventDefault()
    if (!shareEmailInput.trim()) return
    setIsSendingEmail(true)
    setShareError(null)
    try {
      await sendShareEmail(playlistId, shareEmailInput.trim())
      setShareEmailInput("")
      setEmailSent(true)
      setTimeout(() => setEmailSent(false), 3000)
    } catch {
      setShareError("Failed to send email")
    } finally {
      setIsSendingEmail(false)
    }
  }

  const handleInvite = async (e: React.FormEvent) => {
    e.preventDefault()
    if (!email.trim()) return
    setIsInviting(true)
    setError(null)
    try {
      await addCollaborator(playlistId, email.trim())
      setEmail("")
      await fetchCollaborators()
    } catch (err) {
      setError(err instanceof Error ? err.message : "Failed to add collaborator")
    } finally {
      setIsInviting(false)
    }
  }

  const handleRemove = async (userId: string) => {
    try {
      await removeCollaborator(playlistId, userId)
      setCollaborators((prev) => prev.filter((c) => c.user_id !== userId))
    } catch (err) {
      setError(err instanceof Error ? err.message : "Failed to remove collaborator")
    }
  }

  return (
    <Dialog.Root open={isOpen} onOpenChange={onClose}>
      <Dialog.Portal>
        <Dialog.Overlay className="animate-in fade-in fixed inset-0 z-[150] bg-black/80 backdrop-blur-xl duration-300" />
        <Dialog.Content className="bg-aura-bg animate-in zoom-in-95 fade-in fixed top-1/2 left-1/2 z-[151] w-full max-w-lg -translate-x-1/2 -translate-y-1/2 overflow-hidden rounded-2xl border border-white/10 shadow-2xl duration-300">
          <div className="flex items-center justify-between border-b border-white/5 bg-white/[0.02] p-6">
            <div>
              <Dialog.Title className="font-display text-xl font-black tracking-tight text-white">
                Collaborators
              </Dialog.Title>
              <p className="text-aura-muted mt-0.5 text-xs">{playlistName}</p>
            </div>
            <Dialog.Close className="text-aura-muted rounded-lg p-1.5 transition-colors hover:bg-white/5 hover:text-white">
              <X size={20} />
            </Dialog.Close>
          </div>

          <div className="space-y-6 p-6">
            {/* Share link section */}
            <div className="space-y-3 rounded-xl border border-white/[0.06] bg-white/[0.02] p-4">
              <div className="flex items-center gap-2">
                <Link size={13} className="text-aura-primary" />
                <p className="text-[11px] font-black tracking-[0.15em] text-white/70 uppercase">Share with anyone</p>
              </div>

              <button
                onClick={handleCopyLink}
                disabled={isCopying}
                className="flex w-full items-center justify-between gap-3 rounded-lg border border-white/10 bg-white/5 px-3 py-2.5 text-left transition-colors hover:bg-white/[0.08] disabled:opacity-50"
              >
                <span className="text-aura-muted truncate text-xs">
                  {shareToken
                    ? `${process.env.NEXT_PUBLIC_APP_URL || window.location.origin}/share/${shareToken}`
                    : `${process.env.NEXT_PUBLIC_APP_URL || window.location.origin}/share/...`}
                </span>
                <span className="text-aura-primary flex shrink-0 items-center gap-1.5 text-[11px] font-bold">
                  {isCopying ? (
                    <Loader2 size={12} className="animate-spin" />
                  ) : copySuccess ? (
                    <><Check size={12} /> Copied</>
                  ) : (
                    <><Copy size={12} /> Copy link</>
                  )}
                </span>
              </button>

              <div className="flex items-center gap-2">
                <div className="h-px flex-1 bg-white/[0.06]" />
                <span className="text-aura-muted text-[10px]">or send via email</span>
                <div className="h-px flex-1 bg-white/[0.06]" />
              </div>

              <form onSubmit={handleSendShareEmail} className="flex gap-2">
                <input
                  type="email"
                  placeholder="Email address..."
                  value={shareEmailInput}
                  onChange={(e) => setShareEmailInput(e.target.value)}
                  className="focus:border-aura-primary flex-1 rounded-lg border border-white/10 bg-white/5 px-3 py-2 text-xs text-white transition-all focus:outline-none placeholder:text-white/30"
                />
                <button
                  type="submit"
                  disabled={isSendingEmail || !shareEmailInput.trim()}
                  className="flex shrink-0 items-center gap-1.5 rounded-lg border border-white/10 bg-white/5 px-3 py-2 text-xs font-bold text-white transition-all hover:bg-white/10 disabled:opacity-50"
                >
                  {isSendingEmail ? (
                    <Loader2 size={12} className="animate-spin" />
                  ) : emailSent ? (
                    <><Check size={12} className="text-green-400" /> Sent</>
                  ) : (
                    <><Send size={12} /> Send</>
                  )}
                </button>
              </form>

              {shareError && <p className="text-xs text-red-400">{shareError}</p>}
            </div>

            {/* Collaborator invite form */}
            <div className="space-y-3">
              <p className="text-[11px] font-black tracking-[0.15em] text-white/70 uppercase">Add collaborator</p>
              <form onSubmit={handleInvite} className="flex gap-3">
                <input
                  type="email"
                  placeholder="Invite by email..."
                  value={email}
                  onChange={(e) => setEmail(e.target.value)}
                  className="focus:border-aura-primary flex-1 rounded-xl border border-white/10 bg-white/5 px-4 py-2.5 text-sm text-white transition-all focus:outline-none placeholder:text-white/30"
                />
                <button
                  type="submit"
                  disabled={isInviting || !email.trim()}
                  className="flex items-center gap-2 rounded-full bg-white px-5 py-2.5 text-xs font-black tracking-widest text-black uppercase shadow-lg transition-all hover:scale-105 active:scale-95 disabled:opacity-50 disabled:hover:scale-100"
                >
                  {isInviting ? <Loader2 size={14} className="animate-spin" /> : <UserPlus size={14} />}
                  Invite
                </button>
              </form>
            </div>

            {error && <p className="text-xs text-red-400">{error}</p>}

            {/* Collaborator list */}
            <div className="space-y-2">
              <p className="text-aura-muted text-[10px] font-black tracking-[0.2em] uppercase">
                {collaborators.length} collaborator{collaborators.length !== 1 ? "s" : ""}
              </p>

              {isLoading ? (
                <div className="flex items-center justify-center py-8">
                  <Loader2 size={20} className="text-aura-muted animate-spin" />
                </div>
              ) : collaborators.length === 0 ? (
                <p className="text-aura-muted py-6 text-center text-sm">No collaborators yet. Invite someone above.</p>
              ) : (
                <ul className="space-y-2">
                  {collaborators.map((c) => (
                    <li
                      key={c.id}
                      className="flex items-center justify-between rounded-xl border border-white/5 bg-white/[0.03] px-4 py-3"
                    >
                      <div className="flex items-center gap-3">
                        <div className="bg-aura-primary/10 flex h-8 w-8 items-center justify-center rounded-full text-xs font-bold text-white">
                          {c.email.charAt(0).toUpperCase()}
                        </div>
                        <div>
                          <p className="text-sm font-medium text-white">{c.email}</p>
                          <p className="text-aura-muted text-[10px] capitalize">
                            {c.role}
                            {c.status !== "accepted" && (
                              <span className="ml-1 opacity-60">({c.status})</span>
                            )}
                          </p>
                        </div>
                      </div>
                      <button
                        onClick={() => handleRemove(c.user_id)}
                        className="text-aura-muted rounded-lg p-1.5 transition-colors hover:bg-white/5 hover:text-red-400"
                        title="Remove collaborator"
                      >
                        <UserMinus size={16} />
                      </button>
                    </li>
                  ))}
                </ul>
              )}
            </div>
          </div>
        </Dialog.Content>
      </Dialog.Portal>
    </Dialog.Root>
  )
}
