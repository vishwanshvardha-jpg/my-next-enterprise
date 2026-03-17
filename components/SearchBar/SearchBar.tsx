"use client"

import { Loader2, Search as SearchIcon, X } from "lucide-react"
import posthog from "posthog-js"
import { useCallback, useRef, useState } from "react"

interface SearchBarProps {
  onSearch: (query: string) => void
  onClear?: () => void
  isLoading?: boolean
}

export function SearchBar({ onSearch, onClear, isLoading = false }: SearchBarProps) {
  const [value, setValue] = useState("")
  const inputRef = useRef<HTMLInputElement>(null)
  const debounceRef = useRef<ReturnType<typeof setTimeout> | null>(null)

  const handleChange = useCallback(
    (e: React.ChangeEvent<HTMLInputElement>) => {
      const newValue = e.target.value
      setValue(newValue)

      if (debounceRef.current) {
        clearTimeout(debounceRef.current)
      }

      debounceRef.current = setTimeout(() => {
        if (newValue.trim().length > 0) {
          onSearch(newValue.trim())
        }
      }, 500)
    },
    [onSearch]
  )

  const handleSubmit = useCallback(
    (e: React.FormEvent) => {
      e.preventDefault()
      if (debounceRef.current) {
        clearTimeout(debounceRef.current)
      }
      if (value.trim().length > 0) {
        posthog.capture("track_searched", { query: value.trim() })
        onSearch(value.trim())
      }
    },
    [onSearch, value]
  )

  const handleClear = useCallback(() => {
    if (debounceRef.current) {
      clearTimeout(debounceRef.current)
      debounceRef.current = null
    }
    setValue("")
    if (onClear) onClear()
    inputRef.current?.focus()
  }, [onClear])

  return (
    <form onSubmit={handleSubmit} className="group w-full max-w-xl">
      <div className="relative">
        <div className="pointer-events-none absolute inset-y-0 left-0 flex items-center pl-5">
          <SearchIcon className="text-aura-muted h-5 w-5 transition-colors group-focus-within:text-white" />
        </div>

        <input
          ref={inputRef}
          type="text"
          value={value}
          onChange={handleChange}
          className="placeholder-aura-muted h-12 w-full rounded-2xl border border-white/5 bg-white/5 py-3 pr-12 pl-12 font-medium text-white transition-all hover:bg-white/10 focus:bg-white/10 focus:ring-1 focus:ring-white/20 focus:outline-none"
          placeholder="Search what you feel..."
          autoComplete="off"
        />

        <div className="absolute inset-y-0 right-0 flex items-center pr-4">
          {isLoading ? (
            <Loader2 className="text-aura-primary h-5 w-5 animate-spin" />
          ) : value.length > 0 ? (
            <button
              type="button"
              onClick={handleClear}
              className="text-aura-muted rounded-full p-1.5 transition-all hover:bg-white/10 hover:text-white"
            >
              <X className="h-4 w-4" />
            </button>
          ) : (
            <div className="text-aura-muted hidden items-center gap-1.5 rounded-lg border border-white/10 px-2 py-1 text-[10px] font-bold sm:flex">
              <span className="text-xs">⌘</span> K
            </div>
          )}
        </div>
      </div>
    </form>
  )
}
