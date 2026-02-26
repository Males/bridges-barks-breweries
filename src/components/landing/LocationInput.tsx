'use client'

import { useState, useEffect, useRef, useCallback, useId } from 'react'
import { useRouter } from 'next/navigation'
import { MapPin, Loader2, Search } from 'lucide-react'
import { searchLocations } from '@/lib/geocoding'
import { useWalkStore } from '@/store/useWalkStore'
import type { Location } from '@/types'

export default function LocationInput() {
  const router = useRouter()
  const setLocation = useWalkStore((s) => s.setLocation)

  const [query, setQuery] = useState('')
  const [suggestions, setSuggestions] = useState<Location[]>([])
  const [isOpen, setIsOpen] = useState(false)
  const [isSearching, setIsSearching] = useState(false)
  const [activeIndex, setActiveIndex] = useState(-1)
  const [selected, setSelected] = useState<Location | null>(null)

  const listId = useId()
  const inputRef = useRef<HTMLInputElement>(null)
  const containerRef = useRef<HTMLDivElement>(null)
  const abortRef = useRef<AbortController | null>(null)
  const debounceRef = useRef<ReturnType<typeof setTimeout> | null>(null)

  // Debounced search
  useEffect(() => {
    if (debounceRef.current) clearTimeout(debounceRef.current)
    if (selected) return

    if (query.trim().length < 3) {
      setSuggestions([])
      setIsOpen(false)
      return
    }

    debounceRef.current = setTimeout(async () => {
      if (abortRef.current) abortRef.current.abort()
      abortRef.current = new AbortController()

      setIsSearching(true)
      const results = await searchLocations(query, abortRef.current.signal)
      setIsSearching(false)

      if (results.length > 0) {
        setSuggestions(results)
        setIsOpen(true)
        setActiveIndex(-1)
      } else {
        setSuggestions([])
        setIsOpen(false)
      }
    }, 300)

    return () => {
      if (debounceRef.current) clearTimeout(debounceRef.current)
    }
  }, [query, selected])

  // Close on outside click
  useEffect(() => {
    function handleClickOutside(e: MouseEvent) {
      if (containerRef.current && !containerRef.current.contains(e.target as Node)) {
        setIsOpen(false)
      }
    }
    document.addEventListener('mousedown', handleClickOutside)
    return () => document.removeEventListener('mousedown', handleClickOutside)
  }, [])

  const handleSelect = useCallback(
    (location: Location) => {
      setSelected(location)
      setQuery(location.name)
      setSuggestions([])
      setIsOpen(false)
      setLocation(location)
    },
    [setLocation]
  )

  const handleSubmit = useCallback(
    (e: React.FormEvent) => {
      e.preventDefault()
      if (selected) {
        setLocation(selected)
        router.push('/walk')
      } else if (suggestions.length > 0) {
        const first = activeIndex >= 0 ? suggestions[activeIndex] : suggestions[0]
        handleSelect(first)
        router.push('/walk')
      }
    },
    [selected, suggestions, activeIndex, setLocation, router, handleSelect]
  )

  const handleKeyDown = (e: React.KeyboardEvent) => {
    if (!isOpen || suggestions.length === 0) return

    if (e.key === 'ArrowDown') {
      e.preventDefault()
      setActiveIndex((i) => Math.min(i + 1, suggestions.length - 1))
    } else if (e.key === 'ArrowUp') {
      e.preventDefault()
      setActiveIndex((i) => Math.max(i - 1, -1))
    } else if (e.key === 'Enter' && activeIndex >= 0) {
      e.preventDefault()
      handleSelect(suggestions[activeIndex])
      router.push('/walk')
    } else if (e.key === 'Escape') {
      setIsOpen(false)
      setActiveIndex(-1)
    }
  }

  const handleFindWalks = () => {
    if (selected) {
      router.push('/walk')
    } else if (suggestions.length > 0) {
      handleSelect(suggestions[0])
      router.push('/walk')
    }
  }

  return (
    <div ref={containerRef} className={`w-full ${isOpen ? 'relative z-[100]' : ''}`}>
      <form onSubmit={handleSubmit} noValidate>
        <div className="relative">
          {/* Input — no focus ring inside, border stays navy */}
          <div
            className="flex items-center gap-3 bg-white rounded-xl border-2 border-navy px-4 py-3.5 transition-colors shadow-[3px_3px_0px_#1A1344]"
            role="combobox"
            aria-expanded={isOpen}
            aria-haspopup="listbox"
            aria-owns={listId}
          >
            {isSearching ? (
              <Loader2
                size={18}
                className="text-cobalt flex-shrink-0 animate-spin"
                aria-hidden="true"
              />
            ) : (
              <MapPin size={18} className="text-navy/40 flex-shrink-0" aria-hidden="true" />
            )}
            <input
              ref={inputRef}
              type="text"
              value={query}
              onChange={(e) => {
                setQuery(e.target.value)
                setSelected(null)
              }}
              onKeyDown={handleKeyDown}
              placeholder="Reading, Henley, York…"
              aria-label="Enter a town or city"
              aria-autocomplete="list"
              aria-controls={listId}
              aria-activedescendant={
                activeIndex >= 0 ? `suggestion-${activeIndex}` : undefined
              }
              className="flex-1 bg-transparent text-navy placeholder-navy/30 text-base font-medium min-w-0 outline-none focus:outline-none focus:ring-0 focus:border-0 border-0"
              autoComplete="off"
              spellCheck="false"
            />
          </div>

          {/* Suggestions dropdown — above feature blocks */}
          {isOpen && suggestions.length > 0 && (
            <ul
              id={listId}
              role="listbox"
              aria-label="Location suggestions"
              className="absolute z-[100] left-0 right-0 mt-2 bg-white rounded-xl border-2 border-navy shadow-[3px_3px_0px_#1A1344] overflow-hidden animate-pop"
            >
              {suggestions.map((s, i) => (
                <li
                  key={`${s.lat}-${s.lon}`}
                  id={`suggestion-${i}`}
                  role="option"
                  aria-selected={i === activeIndex}
                  className={`flex items-start gap-3 px-4 py-3 cursor-pointer min-h-[52px] transition-colors border-b-2 border-navy/10 last:border-0 ${
                    i === activeIndex ? 'bg-golden/30' : 'hover:bg-cobalt/5'
                  }`}
                  onMouseDown={(e) => {
                    e.preventDefault()
                    handleSelect(s)
                    router.push('/walk')
                  }}
                  onMouseEnter={() => setActiveIndex(i)}
                >
                  <MapPin size={15} className="text-cobalt flex-shrink-0 mt-0.5" aria-hidden="true" />
                  <div className="min-w-0">
                    <p className="text-sm font-bold text-navy truncate">{s.name}</p>
                    <p className="text-xs text-navy/40 truncate">{s.displayName}</p>
                  </div>
                </li>
              ))}
            </ul>
          )}
        </div>

        {/* Find walks CTA */}
        <button
          type="button"
          onClick={handleFindWalks}
          disabled={!selected && suggestions.length === 0}
          className="mt-3 w-full bg-cobalt text-white font-bold text-base rounded-xl py-4 flex items-center justify-center gap-2.5 min-h-[56px] border-2 border-navy shadow-[3px_3px_0px_#1A1344] transition-all active:scale-[0.97] active:shadow-none hover:-translate-y-0.5 disabled:opacity-40 disabled:cursor-not-allowed disabled:hover:translate-y-0"
        >
          <Search size={18} strokeWidth={2.5} aria-hidden="true" />
          Find walks
        </button>
      </form>
    </div>
  )
}
