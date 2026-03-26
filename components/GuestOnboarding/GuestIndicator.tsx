"use client"

import { motion } from "framer-motion"

export function GuestIndicator() {
  return (
    <motion.div
      initial={{ opacity: 0, y: -8 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ duration: 0.4, delay: 0.5 }}
      className="fixed top-4 right-4 z-40 rounded-full border border-aura-primary/30 bg-aura-primary/10 px-3 py-1.5 text-[11px] font-semibold tracking-wide text-aura-primary backdrop-blur-sm"
    >
      Exploring as guest
    </motion.div>
  )
}
