"use client"

import { AnimatePresence, motion } from "framer-motion"
import { ChevronLeft, ChevronRight, RotateCcw, X } from "lucide-react"
import { useCallback, useEffect, useRef, useState } from "react"
import { useGuestStore } from "lib/store/guest"

interface TourStep {
  step: number
  target: string
  mobileTarget?: string   // fallback when primary element is off-screen / zero-size
  side: "top" | "bottom" | "left" | "right"
  title: string
  body: string
}

const TOUR_STEPS: TourStep[] = [
  { step: 1, target: "search",            mobileTarget: "mobile-search",   side: "bottom", title: "Discover music",              body: "Search millions of tracks and find something you love instantly." },
  { step: 2, target: "discover-tab",                                        side: "bottom", title: "Explore the Discover page",   body: "Browse curated picks, trending songs, and featured artists." },
  { step: 3, target: "library-tab",                                         side: "bottom", title: "Build your library",          body: "Sign up to save liked songs and organise everything in one place." },
  { step: 4, target: "playlists-section",                                   side: "right",  title: "Playlists & shared ones",     body: "Create your own playlists or collaborate on shared ones with friends." },
  { step: 5, target: "notification-bell", mobileTarget: "mobile-search",   side: "bottom", title: "Invites & shares",            body: "Get notified when someone shares a playlist or invites you to collaborate." },
]

const PAD = 12   // spotlight padding around the target
const R   = 14   // corner radius

interface SpotlightRect { x: number; y: number; w: number; h: number }

function buildClipPath(vw: number, vh: number, rect: SpotlightRect | null): string {
  if (!rect) {
    return `M0 0 H${vw} V${vh} H0 Z`
  }
  const { x, y, w, h } = rect
  return [
    `M0 0 H${vw} V${vh} H0 Z`,
    `M${x + R} ${y}`,
    `H${x + w - R} Q${x + w} ${y} ${x + w} ${y + R}`,
    `V${y + h - R} Q${x + w} ${y + h} ${x + w - R} ${y + h}`,
    `H${x + R} Q${x} ${y + h} ${x} ${y + h - R}`,
    `V${y + R} Q${x} ${y} ${x + R} ${y}`,
    "Z",
  ].join(" ")
}

function tooltipPosition(
  side: TourStep["side"],
  rect: SpotlightRect | null,
  vw: number,
  vh: number
): React.CSSProperties {
  if (!rect) return { position: "fixed", top: "50%", left: "50%", transform: "translate(-50%, -50%)" }

  const TOOLTIP_W = 288 // w-72
  const TOOLTIP_H = 180
  const GAP = 16

  switch (side) {
    case "bottom": {
      const left = Math.min(Math.max(rect.x + rect.w / 2 - TOOLTIP_W / 2, 8), vw - TOOLTIP_W - 8)
      const top = Math.min(rect.y + rect.h + GAP, vh - TOOLTIP_H - 8)
      return { position: "fixed", top, left }
    }
    case "top": {
      const left = Math.min(Math.max(rect.x + rect.w / 2 - TOOLTIP_W / 2, 8), vw - TOOLTIP_W - 8)
      const top = Math.max(rect.y - TOOLTIP_H - GAP, 8)
      return { position: "fixed", top, left }
    }
    case "right": {
      const left = Math.min(rect.x + rect.w + GAP, vw - TOOLTIP_W - 8)
      const top = Math.min(Math.max(rect.y + rect.h / 2 - TOOLTIP_H / 2, 8), vh - TOOLTIP_H - 8)
      return { position: "fixed", top, left }
    }
    case "left": {
      const left = Math.max(rect.x - TOOLTIP_W - GAP, 8)
      const top = Math.min(Math.max(rect.y + rect.h / 2 - TOOLTIP_H / 2, 8), vh - TOOLTIP_H - 8)
      return { position: "fixed", top, left }
    }
  }
}

interface CoachmarkTourProps {
  onRequestSignUp: () => void
}

export function CoachmarkTour({ onRequestSignUp }: CoachmarkTourProps) {
  const { tourStep, isTourActive, nextStep, prevStep, skipTour, startTour, completeTour, dismissEndCard } = useGuestStore()
  const [spotRect, setSpotRect] = useState<SpotlightRect | null>(null)
  const [vw, setVw] = useState(0)
  const [vh, setVh] = useState(0)
  const observerRef = useRef<ResizeObserver | null>(null)

  const currentConfig = TOUR_STEPS.find((s) => s.step === tourStep) ?? null

  const handleFinish = useCallback(() => completeTour(), [completeTour])
  const handleDismissEndCard = useCallback(() => dismissEndCard(), [dismissEndCard])

  const measure = useCallback(() => {
    setVw(window.innerWidth)
    setVh(window.innerHeight)

    if (!currentConfig) { setSpotRect(null); return }

    // Try primary target; fall back to mobileTarget when element is hidden / zero-size
    const tryTarget = (key: string) => {
      const el = document.querySelector<HTMLElement>(`[data-coachmark="${key}"]`)
      if (!el) return null
      const r = el.getBoundingClientRect()
      if (r.width === 0 && r.height === 0) return null
      return r
    }

    const r = tryTarget(currentConfig.target) ?? (currentConfig.mobileTarget ? tryTarget(currentConfig.mobileTarget) : null)
    if (!r) { setSpotRect(null); return }

    setSpotRect({ x: r.left - PAD, y: r.top - PAD, w: r.width + PAD * 2, h: r.height + PAD * 2 })
  }, [currentConfig])

  useEffect(() => {
    if (!isTourActive) { setSpotRect(null); return }

    measure()
    window.addEventListener("resize", measure)
    window.addEventListener("scroll", measure, true)

    const ro = new ResizeObserver(measure)
    observerRef.current = ro
    if (currentConfig) {
      const el = document.querySelector<HTMLElement>(`[data-coachmark="${currentConfig.target}"]`)
      if (el) ro.observe(el)
    }

    return () => {
      window.removeEventListener("resize", measure)
      window.removeEventListener("scroll", measure, true)
      ro.disconnect()
    }
  }, [isTourActive, measure, currentConfig])

  // End card (step 6)
  if (tourStep === 6) {
    return (
      <motion.div
        initial={{ opacity: 0 }}
        animate={{ opacity: 1 }}
        exit={{ opacity: 0 }}
        className="fixed inset-0 z-[209] flex items-center justify-center bg-black/75 backdrop-blur-sm"
      >
        <motion.div
          initial={{ scale: 0.9, opacity: 0 }}
          animate={{ scale: 1, opacity: 1 }}
          transition={{ type: "spring", stiffness: 300, damping: 28 }}
          className="mx-4 w-full max-w-sm rounded-2xl border border-white/10 bg-[#1a1a2e] p-8 text-center shadow-2xl"
        >
          <div className="mb-2 text-4xl">🎵</div>
          <h2 className="mb-2 text-xl font-bold text-white">You&apos;ve seen it all!</h2>
          <p className="mb-6 text-sm leading-relaxed text-white/60">
            Ready to make it yours? Create a free account to like songs, build playlists, and collaborate with friends.
          </p>
          <button onClick={onRequestSignUp} className="btn-primary mb-3 w-full py-3 text-sm font-bold">
            Sign up free
          </button>
          <button
            onClick={handleDismissEndCard}
            className="w-full py-2 text-sm text-white/40 transition-colors hover:text-white/70"
          >
            Maybe later
          </button>
        </motion.div>
      </motion.div>
    )
  }

  if (!isTourActive || !currentConfig) return null

  const clipPath = buildClipPath(vw, vh, spotRect)
  const tooltipStyle = tooltipPosition(currentConfig.side, spotRect, vw, vh)
  const isLast = tourStep === 5

  return (
    <>
      {/* Blocking overlay — four panels surrounding the spotlight so clicks
          on the spotlight area genuinely pass through (no full-screen div). */}
      {spotRect ? (
        <>
          {/* top panel */}
          <div className="fixed z-[209] left-0 top-0 w-full" style={{ height: spotRect.y }} onClick={(e) => e.stopPropagation()} />
          {/* bottom panel */}
          <div className="fixed z-[209] left-0 w-full" style={{ top: spotRect.y + spotRect.h, bottom: 0 }} onClick={(e) => e.stopPropagation()} />
          {/* left panel */}
          <div className="fixed z-[209] left-0" style={{ top: spotRect.y, width: spotRect.x, height: spotRect.h }} onClick={(e) => e.stopPropagation()} />
          {/* right panel */}
          <div className="fixed z-[209]" style={{ top: spotRect.y, left: spotRect.x + spotRect.w, right: 0, height: spotRect.h }} onClick={(e) => e.stopPropagation()} />
        </>
      ) : (
        /* No visible target — block everything */
        <div className="fixed inset-0 z-[209]" onClick={(e) => e.stopPropagation()} />
      )}

      {/* SVG dim overlay with spotlight hole */}
      <svg
        className="pointer-events-none fixed inset-0 z-[210]"
        width={vw}
        height={vh}
        viewBox={`0 0 ${vw} ${vh}`}
        xmlns="http://www.w3.org/2000/svg"
      >
        <path d={clipPath} fill="rgba(0,0,0,0.65)" fillRule="evenodd" />
      </svg>

      {/* Tooltip card */}
      <AnimatePresence mode="wait">
        <motion.div
          key={tourStep}
          initial={{ opacity: 0, y: 6 }}
          animate={{ opacity: 1, y: 0 }}
          exit={{ opacity: 0, y: -6 }}
          transition={{ duration: 0.2 }}
          className="z-[211] w-72 overflow-hidden rounded-2xl border border-white/10 bg-[#1a1a2e] shadow-2xl"
          style={tooltipStyle}
        >
          {/* Header */}
          <div className="flex items-center justify-between border-b border-white/[0.06] px-4 py-3">
            <span className="text-[11px] text-white/40">
              Step {tourStep} of 5
            </span>
            <div className="flex items-center gap-2">
              <button
                onClick={startTour}
                className="flex items-center gap-1 text-[11px] text-white/40 transition-colors hover:text-white/70"
                title="Restart tour"
              >
                <RotateCcw size={11} />
                Restart
              </button>
              <button
                onClick={skipTour}
                className="flex h-6 w-6 items-center justify-center rounded-full text-white/40 transition-colors hover:bg-white/10 hover:text-white"
                title="Skip tour"
              >
                <X size={13} />
              </button>
            </div>
          </div>

          {/* Body */}
          <div className="px-4 py-4">
            <h3 className="mb-1.5 text-[15px] font-bold text-white">{currentConfig.title}</h3>
            <p className="text-[13px] leading-relaxed text-white/60">{currentConfig.body}</p>
          </div>

          {/* Footer */}
          <div className="flex items-center justify-between border-t border-white/[0.06] px-4 py-3">
            <button
              onClick={prevStep}
              disabled={tourStep <= 1}
              className="flex items-center gap-1 text-[12px] text-white/50 transition-colors hover:text-white disabled:opacity-0"
            >
              <ChevronLeft size={14} />
              Prev
            </button>

            {/* Step dots */}
            <div className="flex gap-1.5">
              {TOUR_STEPS.map((s) => (
                <div
                  key={s.step}
                  className={`h-1.5 rounded-full transition-all duration-300 ${
                    s.step === tourStep ? "w-4 bg-aura-primary" : "w-1.5 bg-white/20"
                  }`}
                />
              ))}
            </div>

            <button
              onClick={isLast ? handleFinish : nextStep}
              className="flex items-center gap-1 text-[12px] font-semibold text-aura-primary transition-colors hover:text-aura-primary/80"
            >
              {isLast ? "Finish" : "Next"}
              {!isLast && <ChevronRight size={14} />}
            </button>
          </div>
        </motion.div>
      </AnimatePresence>
    </>
  )
}
