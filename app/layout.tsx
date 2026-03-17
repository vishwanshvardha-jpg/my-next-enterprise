import "styles/tailwind.css"
import { Metadata } from "next"
import { Geist, Outfit } from "next/font/google"

const outfit = Outfit({
  subsets: ["latin"],
  variable: "--font-outfit",
  display: "swap",
})

const geist = Geist({
  subsets: ["latin"],
  variable: "--font-geist",
  display: "swap",
})

export const metadata: Metadata = {
  title: "AuraMusic Preview Player",
  description: "Search for tracks and play 30-second preview clips powered by the iTunes Search API",
}

import { AuthProvider } from "../components/Providers/AuthProvider"
import { PostHogProvider } from "../components/Providers/PostHogProvider"

export default function RootLayout({ children }: { children: React.ReactNode }) {
  return (
    <html lang="en" className={`dark ${outfit.variable} ${geist.variable}`}>
      <body className="bg-aura-bg text-aura-text selection:bg-aura-primary/30 font-sans antialiased">
        <PostHogProvider>
          <AuthProvider>{children}</AuthProvider>
        </PostHogProvider>
      </body>
    </html>
  )
}
