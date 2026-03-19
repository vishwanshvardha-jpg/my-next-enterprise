"use client"

import { usePathname, useSearchParams } from "next/navigation"
import posthog from "posthog-js"
import { PostHogProvider as PHProvider } from "posthog-js/react"
import { Suspense, useEffect } from "react"

if (typeof window !== "undefined") {
  const token = process.env.NEXT_PUBLIC_POSTHOG_PROJECT_TOKEN
  const host = process.env.NEXT_PUBLIC_POSTHOG_HOST || "/ingest"

  if (token) {
    posthog.init(token, {
      api_host: host,
      ui_host: "https://us.posthog.com",
      person_profiles: "always", // Ensure profiles are created
      capture_exceptions: true,
      debug: true, // Keep debug on for easier troubleshooting
      loaded: (ph) => {
        console.log("PostHog: Global instance loaded", ph.get_distinct_id())
        if (process.env.NODE_ENV === "development") ph.debug()
      },
      capture_pageview: false, // We'll handle this manually for App Router
    })
    
    // Attach to window for debugging
    ;(window as { posthog?: typeof posthog }).posthog = posthog
  } else {
    console.error("PostHog: No project token found in environment variables!")
  }
}



function PostHogPageView() {
  const pathname = usePathname()
  const searchParams = useSearchParams()

  useEffect(() => {
    if (pathname && posthog) {
      let url = window.origin + pathname
      if (searchParams.toString()) {
        url = url + "?" + searchParams.toString()
      }
      posthog.capture("$pageview", {
        $current_url: url,
      })
    }
  }, [pathname, searchParams])

  return null
}

export function PostHogProvider({ children }: { children: React.ReactNode }) {
  useEffect(() => {
    // This will run on mount and confirm flags are loading
    posthog.onFeatureFlags(() => {
      console.log("PostHog: Feature flags loaded/updated:", posthog.featureFlags.getFlags())
    })
  }, [])

  return (
    <PHProvider client={posthog}>
      <Suspense fallback={null}><PostHogPageView /></Suspense>
      {children}
    </PHProvider>
  )
}
