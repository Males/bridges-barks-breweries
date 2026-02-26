import type { OsrmRoute, RouteStep } from '@/types'
import { haversineDistance } from './utils'

type Waypoint = { lat: number; lon: number }

// ─── OSRM Client ─────────────────────────────────────────────────────────────

export async function getOsrmRoute(waypoints: Waypoint[]): Promise<OsrmRoute | null> {
  // OSRM uses lon,lat order
  const waypointStr = waypoints.map((w) => `${w.lon},${w.lat}`).join(';')

  try {
    const res = await fetch(`/api/osrm?waypoints=${encodeURIComponent(waypointStr)}`)
    if (!res.ok) return null

    const data = await res.json()
    if (data.fallback || !data.routes?.length) return null

    return data.routes[0] as OsrmRoute
  } catch {
    return null
  }
}

// ─── Coordinate Conversion ────────────────────────────────────────────────────

/** Convert OSRM GeoJSON [lon, lat] to Leaflet [lat, lon] */
export function osrmRouteToPolyline(route: OsrmRoute): [number, number][] {
  return route.geometry.coordinates.map(([lon, lat]) => [lat, lon])
}

// ─── Step Parsing ─────────────────────────────────────────────────────────────

function formatManeuver(type: string, modifier?: string): string {
  if (type === 'arrive') return 'Arrive at destination'
  if (type === 'depart') return 'Head'

  const direction: Record<string, string> = {
    left: 'left',
    right: 'right',
    'slight left': 'slight left',
    'slight right': 'slight right',
    'sharp left': 'sharp left',
    'sharp right': 'sharp right',
    straight: 'straight ahead',
    uturn: 'U-turn',
  }

  const dir = modifier ? direction[modifier] || modifier : ''

  if (type === 'turn') return `Turn ${dir}`
  if (type === 'continue') return `Continue ${dir}`
  if (type === 'merge') return `Merge ${dir}`
  if (type === 'roundabout') return `Take the roundabout`
  if (type === 'fork') return `Keep ${dir}`

  return dir ? `Go ${dir}` : 'Continue'
}

export function osrmRouteToSteps(route: OsrmRoute): RouteStep[] {
  const steps: RouteStep[] = []

  for (const leg of route.legs) {
    for (const step of leg.steps) {
      const maneuver = step.maneuver.type
      const instruction = step.name
        ? `${formatManeuver(step.maneuver.type, step.maneuver.modifier)} onto ${step.name}`
        : formatManeuver(step.maneuver.type, step.maneuver.modifier)

      steps.push({
        instruction,
        distanceMeters: Math.round(step.distance),
        durationSeconds: Math.round(step.duration),
        maneuver,
      })
    }
  }

  // Remove zero-distance final step duplicates
  return steps.filter((s, i) => !(i > 0 && s.distanceMeters === 0 && s.maneuver === 'arrive') || i === steps.length - 1)
}

// ─── Fallback Arc Polyline ────────────────────────────────────────────────────

/** Generate a smooth arc polyline through waypoints when OSRM is unavailable */
export function buildFallbackRoute(waypoints: Waypoint[]): [number, number][] {
  if (waypoints.length < 2) return waypoints.map((w) => [w.lat, w.lon])

  const points: [number, number][] = []

  for (let i = 0; i < waypoints.length - 1; i++) {
    const a = waypoints[i]
    const b = waypoints[i + 1]
    const steps = 12

    // Add a slight perpendicular arc
    const midLat = (a.lat + b.lat) / 2
    const midLon = (a.lon + b.lon) / 2

    // Perpendicular offset
    const dLat = b.lat - a.lat
    const dLon = b.lon - a.lon
    const len = Math.sqrt(dLat * dLat + dLon * dLon)
    const offsetScale = len * 0.15
    const perpLat = midLat + (-dLon / len) * offsetScale
    const perpLon = midLon + (dLat / len) * offsetScale

    for (let t = 0; t <= steps; t++) {
      const u = t / steps
      // Quadratic bezier
      const lat =
        (1 - u) * (1 - u) * a.lat + 2 * (1 - u) * u * perpLat + u * u * b.lat
      const lon =
        (1 - u) * (1 - u) * a.lon + 2 * (1 - u) * u * perpLon + u * u * b.lon
      points.push([lat, lon])
    }
  }

  return points
}

// ─── Distance & Duration ──────────────────────────────────────────────────────

export function calculateRouteDistance(polyline: [number, number][]): number {
  let total = 0
  for (let i = 0; i < polyline.length - 1; i++) {
    total += haversineDistance(
      { lat: polyline[i][0], lon: polyline[i][1] },
      { lat: polyline[i + 1][0], lon: polyline[i + 1][1] }
    )
  }
  return total
}

/** Estimate walk duration at ~5 km/h */
export function estimateDuration(distanceMeters: number): number {
  return Math.round(distanceMeters / 1.389 / 60)
}
