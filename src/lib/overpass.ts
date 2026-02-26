import type { Bridge, Venue, OverpassElement, OverpassResponse } from '@/types'

// ─── Query Builders ───────────────────────────────────────────────────────────

export function buildBridgeQuery(lat: number, lon: number, radiusMeters: number): string {
  return `[out:json][timeout:25];
(
  way["man_made"="bridge"](around:${radiusMeters},${lat},${lon});
  way["bridge"="yes"](around:${radiusMeters},${lat},${lon});
  node["man_made"="bridge"](around:${radiusMeters},${lat},${lon});
  node["bridge"="yes"](around:${radiusMeters},${lat},${lon});
);
out center tags;`
}

export function buildVenueQuery(lat: number, lon: number, radiusMeters: number): string {
  return `[out:json][timeout:25];
(
  node["amenity"="pub"](around:${radiusMeters},${lat},${lon});
  node["amenity"="bar"](around:${radiusMeters},${lat},${lon});
  node["craft"="brewery"](around:${radiusMeters},${lat},${lon});
  node["amenity"="restaurant"]["brewery"](around:${radiusMeters},${lat},${lon});
  way["amenity"="pub"](around:${radiusMeters},${lat},${lon});
  way["craft"="brewery"](around:${radiusMeters},${lat},${lon});
);
out center tags;`
}

// ─── Venue Classification ─────────────────────────────────────────────────────

const TAPROOM_NAME_PATTERNS = [
  'taproom',
  'tap room',
  'brewing',
  'microbrewery',
  'micro brewery',
  'brew co',
  'brewery',
  'brewhouse',
  'brasserie',
  'ale house',
  'alehouse',
]

export function classifyVenue(tags: Record<string, string>): {
  type: Venue['type']
  isTaproom: boolean
} {
  const name = (tags.name || '').toLowerCase()

  const isTaproom =
    tags.craft === 'brewery' ||
    tags.microbrewery === 'yes' ||
    tags['brewery'] === 'taproom' ||
    tags.industrial === 'brewery' ||
    TAPROOM_NAME_PATTERNS.some((p) => name.includes(p))

  let type: Venue['type']
  if (isTaproom && (tags.craft === 'brewery' || tags.microbrewery === 'yes')) {
    type = 'taproom'
  } else if (tags.craft === 'brewery' || tags.industrial === 'brewery') {
    type = 'brewery'
  } else if (tags.amenity === 'bar') {
    type = 'bar'
  } else {
    type = 'pub'
  }

  return { type, isTaproom }
}

// ─── Parsers ──────────────────────────────────────────────────────────────────

function getCoords(el: OverpassElement): { lat: number; lon: number } | null {
  if (el.lat !== undefined && el.lon !== undefined) {
    return { lat: el.lat, lon: el.lon }
  }
  if (el.center) {
    return { lat: el.center.lat, lon: el.center.lon }
  }
  return null
}

export function parseOverpassBridges(response: OverpassResponse): Bridge[] {
  return response.elements
    .map((el): Bridge | null => {
      const coords = getCoords(el)
      if (!coords) return null

      const tags = el.tags || {}
      // Skip motorway/major road bridges — not pleasant for dog walks
      if (tags.highway && ['motorway', 'trunk', 'primary'].includes(tags.highway)) {
        return null
      }

      return {
        id: `${el.type}/${el.id}`,
        lat: coords.lat,
        lon: coords.lon,
        name: tags.name || null,
        tags,
      }
    })
    .filter((b): b is Bridge => b !== null)
}

export function parseOverpassVenues(response: OverpassResponse): Venue[] {
  return response.elements
    .map((el): Venue | null => {
      const coords = getCoords(el)
      if (!coords) return null

      const tags = el.tags || {}
      const name = tags.name
      if (!name) return null

      const { type, isTaproom } = classifyVenue(tags)

      return {
        id: `${el.type}/${el.id}`,
        lat: coords.lat,
        lon: coords.lon,
        name,
        type,
        isTaproom,
        osmTags: tags,
      }
    })
    .filter((v): v is Venue => v !== null)
}
