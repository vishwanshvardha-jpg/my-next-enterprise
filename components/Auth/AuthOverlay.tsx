"use client"

import { Loader2, Lock, Mail, X } from "lucide-react"
import posthog from "posthog-js"
import { useState } from "react"

import { createClient } from "lib/supabase/client"

interface AuthOverlayProps {
  isOpen: boolean
  onClose: () => void
}

export function AuthOverlay({ isOpen, onClose }: AuthOverlayProps) {
  const [isSignUp, setIsSignUp] = useState(false)
  const [email, setEmail] = useState("")
  const [password, setPassword] = useState("")
  const [loading, setLoading] = useState(false)
  const [error, setError] = useState<string | null>(null)
  const [message, setMessage] = useState<string | null>(null)

  const supabase = createClient()

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
    <div className="fixed inset-0 z-[100] flex items-center justify-center p-4">
      {/* Backdrop */}
      <div
        className="absolute inset-0 bg-black/60 backdrop-blur-sm transition-opacity duration-300"
        onClick={onClose}
      />

      {/* Modal */}
      <div className="bg-aura-darker relative w-full max-w-md scale-100 transform overflow-hidden rounded-2xl border border-white/10 bg-gradient-to-b from-slate-900 to-black p-8 opacity-100 shadow-2xl transition-all duration-300">
        <button onClick={onClose} className="absolute top-4 right-4 text-slate-400 transition-colors hover:text-white">
          <X size={20} />
        </button>

        <div className="mb-8 text-center">
          <h2 className="mb-2 text-3xl font-bold text-white">{isSignUp ? "Create Account" : "Welcome Back"}</h2>
          <p className="text-slate-400">{isSignUp ? "Join the music revolution" : "Log in to your account"}</p>
        </div>

        {error && (
          <div className="mb-6 rounded-lg border border-red-500/20 bg-red-500/10 p-4 text-sm text-red-500">{error}</div>
        )}

        {message && (
          <div className="mb-6 rounded-lg border border-green-500/20 bg-green-500/10 p-4 text-sm text-green-500">
            {message}
          </div>
        )}

        <form onSubmit={handleAuth} className="space-y-4">
          <div className="space-y-2">
            <label className="ml-1 text-sm font-medium text-slate-300">Email</label>
            <div className="relative">
              <Mail className="absolute top-1/2 left-3 -translate-y-1/2 text-slate-500" size={18} />
              <input
                type="email"
                required
                value={email}
                onChange={(e) => setEmail(e.target.value)}
                placeholder="you@example.com"
                className="focus:ring-aura-primary/50 focus:border-aura-primary w-full rounded-xl border border-white/10 bg-white/5 py-3 pr-4 pl-10 text-white transition-all placeholder:text-slate-600 focus:ring-2 focus:outline-none"
              />
            </div>
          </div>

          <div className="space-y-2">
            <label className="ml-1 text-sm font-medium text-slate-300">Password</label>
            <div className="relative">
              <Lock className="absolute top-1/2 left-3 -translate-y-1/2 text-slate-500" size={18} />
              <input
                type="password"
                required
                value={password}
                onChange={(e) => setPassword(e.target.value)}
                placeholder="••••••••"
                className="focus:ring-aura-primary/50 focus:border-aura-primary w-full rounded-xl border border-white/10 bg-white/5 py-3 pr-4 pl-10 text-white transition-all placeholder:text-slate-600 focus:ring-2 focus:outline-none"
              />
            </div>
          </div>

          <button
            type="submit"
            disabled={loading}
            className="from-aura-primary to-aura-secondary shadow-aura-primary/20 hover:shadow-aura-primary/40 flex w-full items-center justify-center gap-2 rounded-xl bg-gradient-to-r py-3 font-bold text-white shadow-lg transition-all hover:scale-[1.02] active:scale-[0.98] disabled:opacity-50 disabled:hover:scale-100"
          >
            {loading ? <Loader2 className="animate-spin" size={20} /> : isSignUp ? "Sign Up" : "Sign In"}
          </button>
        </form>

        <div className="mt-8 text-center">
          <button
            onClick={() => setIsSignUp(!isSignUp)}
            className="text-sm text-slate-400 transition-colors hover:text-white"
          >
            {isSignUp ? "Already have an account? Sign In" : "Don't have an account? Sign Up"}
          </button>
        </div>
      </div>
    </div>
  )
}
