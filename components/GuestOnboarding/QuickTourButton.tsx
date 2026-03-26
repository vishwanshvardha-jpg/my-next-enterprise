"use client"

import { Map } from "lucide-react"
import { useGuestStore } from "lib/store/guest"

export function QuickTourButton() {
  const { isTourActive, startTour } = useGuestStore()

  return (
    <button
      onClick={startTour}
      className={`fixed bottom-28 right-6 z-40 flex items-center gap-2 rounded-full bg-aura-primary px-4 py-2.5 text-[12px] font-bold text-black shadow-lg transition-all duration-300 hover:opacity-90 ${
        isTourActive ? "pointer-events-none opacity-0" : "opacity-100"
      }`}
    >
      <Map size={14} />
      Quick Tour
    </button>
  )
}
