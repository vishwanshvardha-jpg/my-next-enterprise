import "styles/tailwind.css"
import { Metadata } from "next"
import { DM_Sans, Sora } from "next/font/google"

const sora = Sora({
  subsets: ["latin"],
  variable: "--font-sora",
  display: "swap",
  weight: ["300", "400", "500", "600", "700", "800"],
})

const dmSans = DM_Sans({
  subsets: ["latin"],
  variable: "--font-dm-sans",
  display: "swap",
  weight: ["300", "400", "500", "600", "700"],
})

export const metadata: Metadata = {
  title: "AuraMusic Preview Player",
  description: "Search for tracks and play 30-second preview clips powered by the iTunes Search API",
}

import { AuthProvider } from "../components/Providers/AuthProvider"
import { PostHogProvider } from "../components/Providers/PostHogProvider"

export default function RootLayout({ children }: { children: React.ReactNode }) {
  return (
    <html lang="en" className={`dark ${sora.variable} ${dmSans.variable}`}>
      <body className="bg-aura-bg text-aura-text selection:bg-aura-primary/30 font-sans antialiased">
        <PostHogProvider>
          <AuthProvider>{children}</AuthProvider>
        </PostHogProvider>
      </body>
    </html>
  )
}
