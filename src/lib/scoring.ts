import type { Walk, WalkPreferences } from '@/types'

export interface WalkScore {
  total: number
  breakdown: {
    bridgeCount: number
    taproomBonus: number
    distanceMatch: number
    proximityBonus: number
  }
}

export function scoreWalk(
  walk: Omit<Walk, 'score' | 'summary'>,
  prefs: WalkPreferences
): WalkScore {
  // Bridge count: 20 pts each, max 60
  const bridgeCount = Math.min(walk.bridges.length * 20, 60)

  // Taproom bonus
  const taproomBonus =
    walk.venue.type === 'taproom'
      ? 30
      : walk.venue.isTaproom
      ? 25
      : walk.venue.type === 'brewery'
      ? 15
      : 0

  // Distance match: penalise deviation from target
  const targetMeters = prefs.targetDistanceKm * 1000
  const deviation = Math.abs(walk.distanceMeters - targetMeters)
  const distanceMatch = Math.max(0, 40 - Math.floor(deviation / 100))

  // Proximity: closer start to location = better
  const proximityBonus = Math.max(
    0,
    30 - Math.floor(walk.distanceFromLocationMeters / 100)
  )

  const total = bridgeCount + taproomBonus + distanceMatch + proximityBonus

  return {
    total,
    breakdown: { bridgeCount, taproomBonus, distanceMatch, proximityBonus },
  }
}

export function generateWalkSummary(
  walk: Omit<Walk, 'score' | 'summary'>
): string {
  const distKm = (walk.distanceMeters / 1000).toFixed(1)
  const bridgeText =
    walk.bridges.length === 1
      ? walk.bridges[0].name
        ? `via ${walk.bridges[0].name}`
        : 'crossing 1 bridge'
      : `crossing ${walk.bridges.length} bridges`

  const venueType =
    walk.venue.type === 'taproom' || walk.venue.isTaproom
      ? 'taproom stop'
      : walk.venue.type === 'brewery'
      ? 'brewery stop'
      : 'pub stop'

  return `~${distKm} km loop, ${bridgeText}, ${venueType} at ${walk.venue.name}`
}

/** Score a venue for placement preference (higher = better for end of route) */
export function venueScore(isTaproom: boolean, type: string): number {
  if (type === 'taproom') return 3
  if (isTaproom) return 2
  if (type === 'brewery') return 2
  if (type === 'pub') return 1
  return 0
}
