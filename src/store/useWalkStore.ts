'use client'

import { create } from 'zustand'
import type { Location, Walk, WalkPreferences } from '@/types'
import { generateWalk, NoVenuesError, NoBridgesError } from '@/lib/walkGenerator'

const DEFAULT_TARGET_DISTANCE: 3 | 5 | 8 = 5
const DEFAULT_MAX_START_OFFSET_KM = 1.0

function defaultPrefs(location: Location): WalkPreferences {
  return {
    location,
    targetDistanceKm: DEFAULT_TARGET_DISTANCE,
    excludedVenueIds: [],
    excludedBridgeIds: [],
    maxStartOffsetKm: DEFAULT_MAX_START_OFFSET_KM,
  }
}

function friendlyError(err: unknown): string {
  if (err instanceof NoVenuesError || err instanceof NoBridgesError) {
    return (err as Error).message
  }
  if (err instanceof Error) {
    if (err.message.includes('fetch') || err.message.includes('network')) {
      return 'Network error — check your connection and try again.'
    }
    return err.message
  }
  return 'Something went wrong. Please try again.'
}

interface WalkStore {
  location: Location | null
  currentWalk: Walk | null
  isLoading: boolean
  error: string | null
  preferences: WalkPreferences | null
  view: 'card' | 'detail'

  setLocation: (location: Location) => void
  setView: (view: 'card' | 'detail') => void
  generateWalk: (locationOverride?: Location) => Promise<void>
  adjustLength: (direction: 'shorter' | 'longer') => Promise<void>
  adjustProximity: () => Promise<void>
  rerollVenue: () => Promise<void>
  rerollBridges: () => Promise<void>
  rerollFull: () => Promise<void>
}

export const useWalkStore = create<WalkStore>((set, get) => ({
  location: null,
  currentWalk: null,
  isLoading: false,
  error: null,
  preferences: null,
  view: 'card',

  setLocation: (location) => {
    set({
      location,
      preferences: defaultPrefs(location),
      currentWalk: null,
      error: null,
      view: 'card',
    })
  },

  setView: (view) => set({ view }),

  generateWalk: async (locationOverride) => {
    const state = get()
    const location = locationOverride || state.location
    if (!location) return

    let prefs = state.preferences || defaultPrefs(location)
    if (locationOverride) {
      prefs = defaultPrefs(locationOverride)
    }

    set({ isLoading: true, error: null })

    try {
      const walk = await generateWalk(prefs)
      set({ currentWalk: walk, isLoading: false, preferences: prefs })
    } catch (err) {
      set({ error: friendlyError(err), isLoading: false })
    }
  },

  adjustLength: async (direction) => {
    const state = get()
    if (!state.preferences) return

    const targetDistanceKm: 3 | 5 | 8 = direction === 'shorter' ? 3 : 8
    const prefs: WalkPreferences = { ...state.preferences, targetDistanceKm }
    set({ preferences: prefs, isLoading: true, error: null })

    try {
      const walk = await generateWalk(prefs)
      set({ currentWalk: walk, isLoading: false })
    } catch (err) {
      set({ error: friendlyError(err), isLoading: false })
    }
  },

  adjustProximity: async () => {
    const state = get()
    if (!state.preferences) return

    const current = state.preferences.maxStartOffsetKm
    const maxStartOffsetKm = Math.max(0.3, current - 0.4)
    const prefs: WalkPreferences = { ...state.preferences, maxStartOffsetKm }
    set({ preferences: prefs, isLoading: true, error: null })

    try {
      const walk = await generateWalk(prefs)
      set({ currentWalk: walk, isLoading: false })
    } catch (err) {
      set({ error: friendlyError(err), isLoading: false })
    }
  },

  rerollVenue: async () => {
    const state = get()
    if (!state.preferences || !state.currentWalk) return

    const excludedVenueIds = [
      ...state.preferences.excludedVenueIds,
      state.currentWalk.venue.id,
    ]
    const prefs: WalkPreferences = { ...state.preferences, excludedVenueIds }
    set({ preferences: prefs, isLoading: true, error: null })

    try {
      const walk = await generateWalk(prefs)
      set({ currentWalk: walk, isLoading: false })
    } catch (err) {
      // If all venues excluded, reset and retry
      if (err instanceof NoVenuesError) {
        const resetPrefs: WalkPreferences = {
          ...state.preferences,
          excludedVenueIds: [],
        }
        set({ preferences: resetPrefs })
        try {
          const walk = await generateWalk(resetPrefs)
          set({ currentWalk: walk, isLoading: false })
          return
        } catch {}
      }
      set({ error: friendlyError(err), isLoading: false })
    }
  },

  rerollBridges: async () => {
    const state = get()
    if (!state.preferences || !state.currentWalk) return

    const excludedBridgeIds = [
      ...state.preferences.excludedBridgeIds,
      ...state.currentWalk.bridges.map((b) => b.id),
    ]
    const prefs: WalkPreferences = { ...state.preferences, excludedBridgeIds }
    set({ preferences: prefs, isLoading: true, error: null })

    try {
      const walk = await generateWalk(prefs)
      set({ currentWalk: walk, isLoading: false })
    } catch (err) {
      // Reset bridge exclusions and retry if all excluded
      if (err instanceof Error && err.message.includes('bridge')) {
        const resetPrefs: WalkPreferences = {
          ...state.preferences,
          excludedBridgeIds: [],
        }
        set({ preferences: resetPrefs })
        try {
          const walk = await generateWalk(resetPrefs)
          set({ currentWalk: walk, isLoading: false })
          return
        } catch {}
      }
      set({ error: friendlyError(err), isLoading: false })
    }
  },

  rerollFull: async () => {
    const state = get()
    if (!state.location) return

    const prefs = defaultPrefs(state.location)
    set({ preferences: prefs, isLoading: true, error: null })

    try {
      const walk = await generateWalk(prefs)
      set({ currentWalk: walk, isLoading: false })
    } catch (err) {
      set({ error: friendlyError(err), isLoading: false })
    }
  },
}))
