import type { Walk, Bridge, Venue, WalkPreferences, OverpassResponse } from '@/types'
import {
  buildBridgeQuery,
  buildVenueQuery,
  parseOverpassBridges,
  parseOverpassVenues,
} from './overpass'
import {
  getOsrmRoute,
  osrmRouteToPolyline,
  osrmRouteToSteps,
  buildFallbackRoute,
  calculateRouteDistance,
  estimateDuration,
} from './routing'
import { scoreWalk, generateWalkSummary, venueScore } from './scoring'
import { haversineDistance, offsetLatLon } from './utils'

// Distance targets in metres
const RADIUS_MAP: Record<number, number> = { 3: 3000, 5: 4500, 8: 6500 }

// ─── Overpass Fetch Helper ────────────────────────────────────────────────────

async function fetchOverpass(query: string): Promise<OverpassResponse> {
  const res = await fetch('/api/overpass', {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify({ query }),
  })

  if (!res.ok) {
    const err = await res.json().catch(() => ({}))
    throw new Error(err.error || 'Overpass request failed')
  }

  return res.json()
}

// ─── Bridge Selection ─────────────────────────────────────────────────────────

/**
 * Dot product of vectors: how much bridge lies "between" start and end
 * Returns value in [0, 1] for bridges along the route corridor, negative outside
 */
function bridgeProgress(
  start: { lat: number; lon: number },
  end: { lat: number; lon: number },
  bridge: { lat: number; lon: number }
): number {
  const dxTotal = end.lat - start.lat
  const dyTotal = end.lon - start.lon
  const lenSq = dxTotal * dxTotal + dyTotal * dyTotal
  if (lenSq === 0) return 0.5

  const dxBridge = bridge.lat - start.lat
  const dyBridge = bridge.lon - start.lon
  const dot = dxBridge * dxTotal + dyBridge * dyTotal
  return dot / lenSq
}

function selectBridges(
  bridges: Bridge[],
  start: { lat: number; lon: number },
  end: { lat: number; lon: number },
  targetCount: number,
  excludedIds: Set<string>
): Bridge[] {
  // Filter to bridges roughly "between" start and end (progress 0.1 to 0.9)
  const candidates = bridges
    .filter((b) => !excludedIds.has(b.id))
    .map((b) => ({
      bridge: b,
      progress: bridgeProgress(start, end, b),
      distFromMidpoint: haversineDistance(
        { lat: (start.lat + end.lat) / 2, lon: (start.lon + end.lon) / 2 },
        { lat: b.lat, lon: b.lon }
      ),
    }))
    .filter((c) => c.progress > 0.05 && c.progress < 0.95)
    .sort((a, b) => a.distFromMidpoint - b.distFromMidpoint)

  if (candidates.length === 0) return []

  if (targetCount === 1) return [candidates[0].bridge]

  // For 2 bridges: pick one from the first half of the route, one from the second
  const firstHalf = candidates.filter((c) => c.progress < 0.5)
  const secondHalf = candidates.filter((c) => c.progress >= 0.5)

  if (firstHalf.length && secondHalf.length) {
    return [firstHalf[0].bridge, secondHalf[0].bridge]
  }

  // Fallback: just take the first two
  return candidates.slice(0, Math.min(targetCount, candidates.length)).map((c) => c.bridge)
}

// ─── Venue Selection ──────────────────────────────────────────────────────────

function selectVenue(
  venues: Venue[],
  start: { lat: number; lon: number },
  excludedIds: Set<string>,
  targetDistanceKm: number
): Venue | null {
  if (venues.length === 0) return null

  // For loop walks the venue is visited on the way out, then you loop back to start.
  // Prefer venues at ~20–65% of the target distance so the full loop hits the target.
  const targetDistance = targetDistanceKm * 1000
  const minDist = targetDistance * 0.2
  const maxDist = targetDistance * 0.65

  const scored = venues
    .filter((v) => !excludedIds.has(v.id))
    .map((v) => {
      const dist = haversineDistance(start, { lat: v.lat, lon: v.lon })
      const typeScore = venueScore(v.isTaproom, v.type)
      // Strong preference for loop-friendly distance range
      const inRange = dist >= minDist && dist <= maxDist ? 15 : 0
      return { venue: v, dist, score: typeScore * 10 + inRange }
    })
    .sort((a, b) => b.score - a.score || a.dist - b.dist)

  return scored[0]?.venue || null
}

// ─── Main Generator ───────────────────────────────────────────────────────────

export class NoVenuesError extends Error {
  constructor() {
    super(
      'No pubs or breweries found nearby. Try a different location or widen your search.'
    )
    this.name = 'NoVenuesError'
  }
}

export class NoBridgesError extends Error {
  constructor() {
    super(
      'No bridges found in this area. Try a location near a river or canal.'
    )
    this.name = 'NoBridgesError'
  }
}

export async function generateWalk(prefs: WalkPreferences): Promise<Walk> {
  const { location, targetDistanceKm, excludedVenueIds, excludedBridgeIds, maxStartOffsetKm } =
    prefs

  // Step 1: Compute search radius
  const radiusMeters = RADIUS_MAP[targetDistanceKm] || 4500

  // Step 2: Random start point offset from location
  const bearing = Math.random() * 360
  const offsetKm = maxStartOffsetKm * 0.3 + Math.random() * maxStartOffsetKm * 0.7
  const startPoint = offsetLatLon(location, Math.min(offsetKm, maxStartOffsetKm), bearing)

  // Step 3: Parallel Overpass queries
  const [bridgeResponse, venueResponse] = await Promise.all([
    fetchOverpass(buildBridgeQuery(location.lat, location.lon, radiusMeters)),
    fetchOverpass(buildVenueQuery(location.lat, location.lon, radiusMeters)),
  ])

  // Step 4: Parse OSM elements
  let bridges = parseOverpassBridges(bridgeResponse)
  let venues = parseOverpassVenues(venueResponse)

  // Step 5: If no bridges, try expanding radius once
  if (bridges.length === 0) {
    const expandedRadius = radiusMeters * 1.5
    const expanded = await fetchOverpass(
      buildBridgeQuery(location.lat, location.lon, expandedRadius)
    )
    bridges = parseOverpassBridges(expanded)
  }

  if (bridges.length === 0) throw new NoBridgesError()

  // Filter excluded
  const excludedVenueSet = new Set(excludedVenueIds)
  const excludedBridgeSet = new Set(excludedBridgeIds)
  venues = venues.filter((v) => !excludedVenueSet.has(v.id))
  bridges = bridges.filter((b) => !excludedBridgeSet.has(b.id))

  if (bridges.length === 0) {
    throw new NoBridgesError()
  }

  // Step 6: Select venue
  const selectedVenue = selectVenue(venues, startPoint, excludedVenueSet, targetDistanceKm)
  if (!selectedVenue) throw new NoVenuesError()

  // Step 7: Select bridges (prefer 2 for longer walks)
  const targetBridgeCount = targetDistanceKm >= 5 ? 2 : 1
  const selectedBridges = selectBridges(
    bridges,
    startPoint,
    { lat: selectedVenue.lat, lon: selectedVenue.lon },
    targetBridgeCount,
    excludedBridgeSet
  )

  if (selectedBridges.length === 0) {
    // Try with all available bridges ignoring progress filter
    const fallbackBridge = bridges
      .filter((b) => !excludedBridgeSet.has(b.id))
      .sort(
        (a, b) =>
          haversineDistance(startPoint, { lat: a.lat, lon: a.lon }) -
          haversineDistance(startPoint, { lat: b.lat, lon: b.lon })
      )[0]

    if (!fallbackBridge) throw new NoBridgesError()
    selectedBridges.push(fallbackBridge)
  }

  // Step 8: Build loop waypoints — start → bridges → venue → back to start.
  // Route starts and ends at the same place; OSRM may choose a different path on the return leg.
  const waypoints = [
    startPoint,
    ...selectedBridges.map((b) => ({ lat: b.lat, lon: b.lon })),
    { lat: selectedVenue.lat, lon: selectedVenue.lon },
    startPoint,
  ]

  const osrmRoute = await getOsrmRoute(waypoints)

  // Step 9: Build polyline
  const route = osrmRoute ? osrmRouteToPolyline(osrmRoute) : buildFallbackRoute(waypoints)
  const steps = osrmRoute ? osrmRouteToSteps(osrmRoute) : []
  const distanceMeters = osrmRoute ? osrmRoute.distance : calculateRouteDistance(route)
  const durationMinutes = estimateDuration(distanceMeters)
  const distanceFromLocationMeters = haversineDistance(location, startPoint)

  const walkBase: Omit<Walk, 'score' | 'summary'> = {
    id: crypto.randomUUID(),
    startPoint,
    bridges: selectedBridges,
    venue: selectedVenue,
    route,
    distanceMeters,
    durationMinutes,
    distanceFromLocationMeters,
    steps,
  }

  const { total: score } = scoreWalk(walkBase, prefs)
  const summary = generateWalkSummary(walkBase)

  return { ...walkBase, score, summary }
}
