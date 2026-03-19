import * as Dialog from "@radix-ui/react-dialog"
import { Loader2, Users, X } from "lucide-react"
import { useEffect, useState } from "react"

import { getPendingInvites, respondToInvite } from "lib/actions/playlists"
import { PendingInvite } from "lib/types"

interface InvitesModalProps {
  isOpen: boolean
  onClose: () => void
  onInviteResponded: () => void
}

export function InvitesModal({ isOpen, onClose, onInviteResponded }: InvitesModalProps) {
  const [invites, setInvites] = useState<PendingInvite[]>([])
  const [isLoading, setIsLoading] = useState(false)
  const [respondingId, setRespondingId] = useState<string | null>(null)
  const [error, setError] = useState<string | null>(null)

  useEffect(() => {
    if (!isOpen) return
    setIsLoading(true)
    setError(null)
    getPendingInvites().then((data) => {
      setInvites(data)
      setIsLoading(false)
    })
  }, [isOpen])

  const handleRespond = async (invite: PendingInvite, status: "accepted" | "declined") => {
    setRespondingId(invite.id)
    setError(null)
    try {
      await respondToInvite(invite.playlist_id, status)
      setInvites((prev) => prev.filter((i) => i.id !== invite.id))
      onInviteResponded()
    } catch (err: any) {
      setError(err?.message ?? "Failed to respond to invite")
    } finally {
      setRespondingId(null)
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
                Pending Invites
              </Dialog.Title>
              <p className="text-aura-muted mt-0.5 text-xs">Playlists shared with you</p>
            </div>
            <Dialog.Close className="text-aura-muted rounded-lg p-1.5 transition-colors hover:bg-white/5 hover:text-white">
              <X size={20} />
            </Dialog.Close>
          </div>

          <div className="space-y-4 p-6">
            {error && <p className="text-xs text-red-400">{error}</p>}

            {isLoading ? (
              <div className="flex items-center justify-center py-8">
                <Loader2 size={20} className="text-aura-muted animate-spin" />
              </div>
            ) : invites.length === 0 ? (
              <div className="flex flex-col items-center justify-center py-10 text-center">
                <Users size={28} className="text-aura-muted/40 mb-3" />
                <p className="text-aura-muted text-sm">No pending invites</p>
              </div>
            ) : (
              <ul className="space-y-2">
                {invites.map((invite) => (
                  <li
                    key={invite.id}
                    className="flex items-center justify-between rounded-xl border border-white/5 bg-white/[0.03] px-4 py-3"
                  >
                    <div className="flex items-center gap-3 min-w-0">
                      <div className="bg-aura-primary/10 flex h-8 w-8 flex-shrink-0 items-center justify-center rounded-full text-xs font-bold text-white">
                        {invite.playlist_name.charAt(0).toUpperCase()}
                      </div>
                      <div className="min-w-0">
                        <p className="truncate text-sm font-medium text-white">{invite.playlist_name}</p>
                        <p className="text-aura-muted truncate text-[10px]">{invite.owner_email}</p>
                      </div>
                    </div>
                    <div className="flex items-center gap-2 ml-3 flex-shrink-0">
                      <button
                        onClick={() => handleRespond(invite, "accepted")}
                        disabled={respondingId === invite.id}
                        className="flex items-center gap-1.5 rounded-full bg-white px-3 py-1.5 text-[10px] font-black tracking-widest text-black uppercase transition-all hover:scale-105 active:scale-95 disabled:opacity-50 disabled:hover:scale-100"
                      >
                        {respondingId === invite.id ? <Loader2 size={10} className="animate-spin" /> : null}
                        Accept
                      </button>
                      <button
                        onClick={() => handleRespond(invite, "declined")}
                        disabled={respondingId === invite.id}
                        className="text-aura-muted rounded-full border border-white/10 px-3 py-1.5 text-[10px] font-semibold tracking-wide uppercase transition-all hover:bg-white/5 hover:text-white disabled:opacity-50"
                      >
                        Decline
                      </button>
                    </div>
                  </li>
                ))}
              </ul>
            )}
          </div>
        </Dialog.Content>
      </Dialog.Portal>
    </Dialog.Root>
  )
}
