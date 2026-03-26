"use client"

import { Loader2, Lock, Mail, X } from "lucide-react"
import posthog from "posthog-js"
import { useEffect, useState } from "react"

import { createClient } from "lib/supabase/client"

interface AuthOverlayProps {
  isOpen: boolean
  onClose: () => void
  defaultSignUp?: boolean
}

export function AuthOverlay({ isOpen, onClose, defaultSignUp = false }: AuthOverlayProps) {
  const [isSignUp, setIsSignUp] = useState(defaultSignUp)
  const [email, setEmail] = useState("")
  const [password, setPassword] = useState("")
  const [loading, setLoading] = useState(false)
  const [error, setError] = useState<string | null>(null)
  const [message, setMessage] = useState<string | null>(null)

  const supabase = createClient()

  useEffect(() => {
    if (isOpen) setIsSignUp(defaultSignUp)
  }, [isOpen, defaultSignUp])

  if (!isOpen) return null

  const handleAuth = async (e: React.FormEvent) => {
    e.preventDefault()
    setLoading(true)
    setError(null)
    setMessage(null)

    try {
      if (isSignUp) {
        const { data, error } = await supabase.auth.signUp({
          email,
          password,
        })
        if (error) throw error
        if (data.user) {
          posthog.identify(data.user.id, { email: data.user.email })
          posthog.capture("user_signed_up", { method: "email" })
        }
        setMessage("Check your email for the confirmation link!")
      } else {
        const { data, error } = await supabase.auth.signInWithPassword({
          email,
          password,
        })
        if (error) throw error
        if (data.user) {
          posthog.identify(data.user.id, { email: data.user.email })
          posthog.capture("user_logged_in", { method: "email" })
        }
        onClose()
      }
    } catch (err) {
      posthog.captureException(err)
      const errorMessage = err instanceof Error ? err.message : "An error occurred during authentication"
      setError(errorMessage)
    } finally {
      setLoading(false)
    }
  }

  return (
    <div className="fixed inset-0 z-[200] flex items-center justify-center p-4">
      {/* Backdrop */}
      <div
        className="absolute inset-0 bg-black/70 backdrop-blur-md transition-opacity duration-300"
        onClick={onClose}
      />

      {/* Modal */}
      <div
        className="relative w-full max-w-md overflow-hidden rounded-2xl border border-white/[0.08] p-8 shadow-2xl"
        style={{
          background: "linear-gradient(180deg, rgba(17, 24, 39, 0.98) 0%, rgba(10, 14, 23, 0.99) 100%)",
          boxShadow: "0 0 60px rgba(0, 212, 170, 0.08), 0 25px 50px rgba(0, 0, 0, 0.5)",
        }}
      >
        {/* Ambient glow */}
        <div className="absolute -top-20 left-1/2 -translate-x-1/2 h-40 w-40 rounded-full bg-aura-primary/[0.08] blur-[60px]" />

        <button
          onClick={onClose}
          className="absolute top-4 right-4 text-aura-muted rounded-lg p-1.5 transition-all hover:bg-white/[0.06] hover:text-white"
        >
          <X size={18} />
        </button>

        <div className="relative mb-8 text-center">
          <h2 className="font-display mb-2 text-2xl font-bold tracking-tight text-white">
            {isSignUp ? "Create Account" : "Welcome Back"}
          </h2>
          <p className="text-sm text-aura-muted">
            {isSignUp ? "Join RepoMusic for full access" : "Log in to your account"}
          </p>
        </div>

        {error && (
          <div className="mb-5 rounded-xl border border-red-500/15 bg-red-500/10 px-4 py-3 text-[13px] text-red-400">
            {error}
          </div>
        )}

        {message && (
          <div className="mb-5 rounded-xl border border-aura-primary/15 bg-aura-primary/10 px-4 py-3 text-[13px] text-aura-primary">
            {message}
          </div>
        )}

        <form onSubmit={handleAuth} className="relative space-y-4">
          <div className="space-y-1.5">
            <label className="ml-1 text-[12px] font-semibold text-white/50">Email</label>
            <div className="relative">
              <Mail className="absolute top-1/2 left-3.5 -translate-y-1/2 text-aura-muted" size={16} />
              <input
                type="email"
                required
                value={email}
                onChange={(e) => setEmail(e.target.value)}
                placeholder="you@example.com"
                className="w-full rounded-xl border border-white/[0.08] bg-white/[0.04] py-3 pr-4 pl-10 text-[13px] font-medium text-white transition-all placeholder:text-aura-muted focus:border-aura-primary/30 focus:bg-white/[0.06] focus:ring-1 focus:ring-aura-primary/20 focus:outline-none"
              />
            </div>
          </div>

          <div className="space-y-1.5">
            <label className="ml-1 text-[12px] font-semibold text-white/50">Password</label>
            <div className="relative">
              <Lock className="absolute top-1/2 left-3.5 -translate-y-1/2 text-aura-muted" size={16} />
              <input
                type="password"
                required
                value={password}
                onChange={(e) => setPassword(e.target.value)}
                placeholder="••••••••"
                className="w-full rounded-xl border border-white/[0.08] bg-white/[0.04] py-3 pr-4 pl-10 text-[13px] font-medium text-white transition-all placeholder:text-aura-muted focus:border-aura-primary/30 focus:bg-white/[0.06] focus:ring-1 focus:ring-aura-primary/20 focus:outline-none"
              />
            </div>
          </div>

          <button
            type="submit"
            disabled={loading}
            className="btn-primary flex w-full items-center justify-center gap-2 rounded-xl py-3 text-[13px] font-bold tracking-wider uppercase disabled:opacity-50 disabled:hover:scale-100"
          >
            {loading ? <Loader2 className="animate-spin" size={18} /> : isSignUp ? "Sign Up" : "Sign In"}
          </button>
        </form>

        <div className="relative mt-6 text-center">
          <button
            onClick={() => setIsSignUp(!isSignUp)}
            className="text-[13px] text-aura-muted transition-colors hover:text-aura-primary"
          >
            {isSignUp ? "Already have an account? Sign In" : "Don't have an account? Sign Up"}
          </button>
        </div>
      </div>
    </div>
  )
}
