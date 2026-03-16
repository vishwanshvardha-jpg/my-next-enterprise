import "styles/tailwind.css"
import { Metadata } from "next"
import { Outfit, Geist } from "next/font/google"

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

export default function RootLayout({ children }: { children: React.ReactNode }) {
  return (
    <html lang="en" className={`dark ${outfit.variable} ${geist.variable}`}>
      <body className="bg-aura-bg font-sans text-aura-text antialiased selection:bg-aura-primary/30">
        <AuthProvider>{children}</AuthProvider>
      </body>
    </html>
  )
}
