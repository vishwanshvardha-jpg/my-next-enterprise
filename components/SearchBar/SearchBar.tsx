"use client"

import { Clock, Loader2, Search as SearchIcon, X } from "lucide-react"
import posthog from "posthog-js"
import { useCallback, useEffect, useRef, useState } from "react"

const HISTORY_KEY = "aura_search_history"
const MAX_HISTORY = 8

interface SearchBarProps {
  onSearch: (query: string) => void
  onClear?: () => void
  isLoading?: boolean
}

export function SearchBar({ onSearch, onClear, isLoading = false }: SearchBarProps) {
  const [value, setValue] = useState("")
  const [isFocused, setIsFocused] = useState(false)
  const [history, setHistory] = useState<string[]>([])
  const inputRef = useRef<HTMLInputElement>(null)
  const containerRef = useRef<HTMLDivElement>(null)
  const debounceRef = useRef<ReturnType<typeof setTimeout> | null>(null)

  useEffect(() => {
    try {
      const stored = localStorage.getItem(HISTORY_KEY)
      if (stored) setHistory(JSON.parse(stored) as string[])
    } catch (e) {
      console.error(e)
    }
  }, [])

  useEffect(() => {
    const handleClickOutside = (e: MouseEvent) => {
      if (containerRef.current && !containerRef.current.contains(e.target as Node)) {
        setIsFocused(false)
      }
    }
    document.addEventListener("mousedown", handleClickOutside)
    return () => document.removeEventListener("mousedown", handleClickOutside)
  }, [])

  const saveToHistory = useCallback((query: string) => {
    setHistory((prev) => {
      const filtered = prev.filter((q) => q.toLowerCase() !== query.toLowerCase())
      const next = [query, ...filtered].slice(0, MAX_HISTORY)
      try {
        localStorage.setItem(HISTORY_KEY, JSON.stringify(next))
      } catch (e) {
        console.error(e)
      }
      return next
    })
  }, [])

  const removeFromHistory = useCallback((query: string, e: React.MouseEvent) => {
    e.stopPropagation()
    setHistory((prev) => {
      const next = prev.filter((q) => q !== query)
      try {
        localStorage.setItem(HISTORY_KEY, JSON.stringify(next))
      } catch (e) {
        console.error(e)
      }
      return next
    })
  }, [])

  const handleChange = useCallback(
    (e: React.ChangeEvent<HTMLInputElement>) => {
      const newValue = e.target.value
      setValue(newValue)

      if (debounceRef.current) clearTimeout(debounceRef.current)

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
      if (debounceRef.current) clearTimeout(debounceRef.current)
      if (value.trim().length > 0) {
        posthog.capture("track_searched", { query: value.trim() })
        onSearch(value.trim())
        saveToHistory(value.trim())
        setIsFocused(false)
      }
    },
    [onSearch, value, saveToHistory]
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

  const handleHistorySelect = useCallback(
    (query: string) => {
      setValue(query)
      onSearch(query)
      saveToHistory(query)
      setIsFocused(false)
    },
    [onSearch, saveToHistory]
  )

  const showDropdown = isFocused && value.length === 0 && history.length > 0

  return (
    <div ref={containerRef} className="group relative w-full">
      <form onSubmit={handleSubmit}>
        <div className="relative">
          <div className="pointer-events-none absolute inset-y-0 left-0 flex items-center pl-3.5">
            <SearchIcon className="text-aura-muted h-4 w-4 transition-colors group-focus-within:text-aura-primary" />
          </div>

          <input
            ref={inputRef}
            type="text"
            value={value}
            onChange={handleChange}
            onFocus={() => setIsFocused(true)}
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

      {/* History Dropdown */}
      {showDropdown && (
        <div className="absolute top-full left-0 right-0 z-[200] mt-1.5 overflow-hidden rounded-xl border border-white/[0.08] bg-[#0d1117] shadow-2xl">
          <div className="border-b border-white/[0.05] px-3 py-2">
            <span className="text-[10px] font-semibold tracking-wider text-white/30 uppercase">
              Recent Searches
            </span>
          </div>
          <ul className="py-1">
            {history.map((query) => (
              <li key={query}>
                <button
                  type="button"
                  onClick={() => handleHistorySelect(query)}
                  className="group/item flex w-full items-center gap-3 px-3 py-2.5 text-left transition-colors hover:bg-white/[0.05]"
                >
                  <Clock className="h-3.5 w-3.5 flex-shrink-0 text-white/20" />
                  <span className="flex-1 truncate text-[13px] text-white/60 transition-colors group-hover/item:text-white/90">
                    {query}
                  </span>
                  <span
                    role="button"
                    onClick={(e) => removeFromHistory(query, e)}
                    className="flex-shrink-0 rounded-full p-1 text-white/20 transition-all hover:bg-white/10 hover:text-white/60"
                  >
                    <X className="h-3 w-3" />
                  </span>
                </button>
              </li>
            ))}
          </ul>
        </div>
      )}
    </div>
  )
}
