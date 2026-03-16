"use client"

import { Search as SearchIcon, X, Loader2 } from "lucide-react"
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
    <form onSubmit={handleSubmit} className="w-full max-w-xl group">
      <div className="relative">
        <div className="pointer-events-none absolute inset-y-0 left-0 flex items-center pl-5">
          <SearchIcon className="h-5 w-5 text-aura-muted group-focus-within:text-white transition-colors" />
        </div>

        <input
          ref={inputRef}
          type="text"
          value={value}
          onChange={handleChange}
          className="w-full h-12 rounded-2xl bg-white/5 border border-white/5 py-3 pr-12 pl-12 text-white placeholder-aura-muted transition-all hover:bg-white/10 focus:bg-white/10 focus:ring-1 focus:ring-white/20 focus:outline-none font-medium"
          placeholder="Search what you feel..."
          autoComplete="off"
        />

        <div className="absolute inset-y-0 right-0 flex items-center pr-4">
          {isLoading ? (
            <Loader2 className="h-5 w-5 animate-spin text-aura-primary" />
          ) : value.length > 0 ? (
            <button
              type="button"
              onClick={handleClear}
              className="rounded-full p-1.5 text-aura-muted hover:bg-white/10 hover:text-white transition-all"
            >
              <X className="h-4 w-4" />
            </button>
          ) : (
            <div className="hidden sm:flex items-center gap-1.5 px-2 py-1 rounded-lg border border-white/10 text-[10px] font-bold text-aura-muted">
              <span className="text-xs">⌘</span> K
            </div>
          )}
        </div>
      </div>
    </form>
  )
}
