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
    <form onSubmit={handleSubmit} className="group w-full">
      <div className="relative">
        <div className="pointer-events-none absolute inset-y-0 left-0 flex items-center pl-3.5">
          <SearchIcon className="text-aura-muted h-4 w-4 transition-colors group-focus-within:text-aura-primary" />
        </div>

        <input
          ref={inputRef}
          type="text"
          value={value}
          onChange={handleChange}
          className="placeholder-aura-muted h-9 w-full rounded-xl border border-white/[0.06] bg-white/[0.04] py-2 pr-9 pl-9 text-[13px] font-medium text-white transition-all hover:bg-white/[0.07] focus:bg-white/[0.07] focus:border-aura-primary/30 focus:outline-none focus:ring-1 focus:ring-aura-primary/20"
          placeholder="Search artist, album..."
          autoComplete="off"
        />

        <div className="absolute inset-y-0 right-0 flex items-center pr-3">
          {isLoading ? (
            <Loader2 className="text-aura-primary h-4 w-4 animate-spin" />
          ) : value.length > 0 ? (
            <button
              type="button"
              onClick={handleClear}
              className="text-aura-muted rounded-full p-0.5 transition-all hover:bg-white/10 hover:text-white"
            >
              <X className="h-3.5 w-3.5" />
            </button>
          ) : null}
        </div>
      </div>
    </form>
  )
}
