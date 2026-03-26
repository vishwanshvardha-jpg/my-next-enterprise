"use client"

import { motion, AnimatePresence } from "framer-motion"
import { Lock } from "lucide-react"

interface SongLimitModalProps {
  isOpen: boolean
  onClose: () => void
  onSignUp: () => void
}

export function SongLimitModal({ isOpen, onClose, onSignUp }: SongLimitModalProps) {
  return (
    <AnimatePresence>
      {isOpen && (
        <motion.div
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          exit={{ opacity: 0 }}
          className="fixed inset-0 z-[200] flex items-center justify-center bg-black/70 backdrop-blur-sm"
        >
          <motion.div
            initial={{ scale: 0.92, opacity: 0 }}
            animate={{ scale: 1, opacity: 1 }}
            exit={{ scale: 0.92, opacity: 0 }}
            transition={{ type: "spring", stiffness: 300, damping: 28 }}
            className="mx-4 w-full max-w-sm rounded-2xl border border-white/10 bg-[#1a1a2e] p-8 text-center shadow-2xl"
          >
            <div className="mb-4 flex justify-center">
              <div className="flex h-14 w-14 items-center justify-center rounded-full bg-aura-primary/15">
                <Lock size={24} className="text-aura-primary" />
              </div>
            </div>

            <h2 className="mb-2 text-xl font-bold text-white">Enjoying the music?</h2>
            <p className="mb-6 text-sm leading-relaxed text-white/60">
              You&apos;ve hit the guest limit. Create a free account to keep listening, build playlists, and collaborate with friends.
            </p>

            <button
              onClick={onSignUp}
              className="btn-primary mb-3 w-full py-3 text-sm font-bold"
            >
              Sign up free
            </button>
            <button
              onClick={onClose}
              className="w-full py-2 text-sm text-white/40 transition-colors hover:text-white/70"
            >
              Maybe later
            </button>
          </motion.div>
        </motion.div>
      )}
    </AnimatePresence>
  )
}
