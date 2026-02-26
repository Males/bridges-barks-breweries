export interface Location {
  lat: number
  lon: number
  name: string
  displayName: string
}

export interface Bridge {
  id: string // e.g. "way/12345"
  lat: number
  lon: number
  name: string | null
  tags: Record<string, string>
}

export interface Venue {
  id: string // e.g. "node/67890"
  lat: number
  lon: number
  name: string
  type: 'taproom' | 'brewery' | 'pub' | 'bar'
  isTaproom: boolean
  osmTags: Record<string, string>
}

export interface RouteStep {
  instruction: string
  distanceMeters: number
  durationSeconds: number
  maneuver: string
}

export interface Walk {
  id: string
  startPoint: { lat: number; lon: number }
  bridges: Bridge[]
  venue: Venue
  route: [number, number][] // [lat, lon][] — Leaflet order
  distanceMeters: number
  durationMinutes: number
  distanceFromLocationMeters: number
  summary: string
  steps: RouteStep[]
  score: number
}

export interface WalkPreferences {
  location: Location
  targetDistanceKm: 3 | 5 | 8
  excludedVenueIds: string[]
  excludedBridgeIds: string[]
  maxStartOffsetKm: number
}

// Internal API shapes
export interface OverpassElement {
  type: 'node' | 'way' | 'relation'
  id: number
  lat?: number
  lon?: number
  center?: { lat: number; lon: number }
  tags?: Record<string, string>
}

export interface OverpassResponse {
  elements: OverpassElement[]
}

export interface OsrmStep {
  maneuver: { type: string; modifier?: string }
  name: string
  distance: number
  duration: number
}

export interface OsrmLeg {
  steps: OsrmStep[]
  distance: number
  duration: number
}

export interface OsrmRoute {
  geometry: { coordinates: [number, number][] } // GeoJSON [lon, lat]
  legs: OsrmLeg[]
  distance: number
  duration: number
}
