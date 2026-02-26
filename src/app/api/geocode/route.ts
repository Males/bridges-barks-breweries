import { NextRequest, NextResponse } from 'next/server'
import type { Location } from '@/types'

// Photon (by Komoot) — OSM-based geocoding, no API key required
// Response is GeoJSON FeatureCollection

interface PhotonFeature {
  type: 'Feature'
  geometry: {
    type: 'Point'
    coordinates: [number, number] // [lon, lat]
  }
  properties: {
    name?: string
    city?: string
    district?: string
    county?: string
    state?: string
    country?: string
    countrycode?: string
    postcode?: string
    osm_type?: string
    osm_id?: number
    osm_key?: string
    osm_value?: string
    street?: string
    housenumber?: string
  }
}

interface PhotonResponse {
  type: 'FeatureCollection'
  features: PhotonFeature[]
}

function extractName(p: PhotonFeature['properties']): string {
  return p.name || p.city || p.district || p.county || p.state || 'Unknown'
}

function buildDisplayName(p: PhotonFeature['properties']): string {
  const parts: string[] = []
  if (p.name) parts.push(p.name)
  if (p.city && p.city !== p.name) parts.push(p.city)
  if (p.county) parts.push(p.county)
  if (p.state) parts.push(p.state)
  if (p.country) parts.push(p.country)
  return parts.join(', ')
}

export async function GET(request: NextRequest) {
  const { searchParams } = request.nextUrl
  const q = searchParams.get('q')?.trim()
  const limit = parseInt(searchParams.get('limit') || '6', 10)

  if (!q || q.length < 2) {
    return NextResponse.json([], { status: 200 })
  }

  const controller = new AbortController()
  const timeout = setTimeout(() => controller.abort(), 10000)

  try {
    // Photon geocoding API — bias towards UK (51.5, -0.1 = London)
    const url = new URL('https://photon.komoot.io/api/')
    url.searchParams.set('q', q)
    url.searchParams.set('limit', String(limit))
    url.searchParams.set('lang', 'en')
    // Location bias towards UK centre to surface UK results first
    url.searchParams.set('lat', '52.5')
    url.searchParams.set('lon', '-1.5')

    const res = await fetch(url.toString(), {
      signal: controller.signal,
      headers: {
        Accept: 'application/json',
        'User-Agent': 'BridgesBarksBreweries/1.0',
      },
    })

    if (!res.ok) {
      return NextResponse.json({ error: 'Geocoding unavailable' }, { status: 502 })
    }

    const data: PhotonResponse = await res.json()

    const locations: Location[] = data.features
      .filter((f) => f.geometry?.coordinates?.length === 2)
      .map((f) => {
        const [lon, lat] = f.geometry.coordinates
        const p = f.properties
        return {
          lat,
          lon,
          name: extractName(p),
          displayName: buildDisplayName(p),
        }
      })
      // Deduplicate by approximate location
      .filter((loc, i, arr) =>
        arr.findIndex(
          (l) => Math.abs(l.lat - loc.lat) < 0.001 && Math.abs(l.lon - loc.lon) < 0.001
        ) === i
      )

    return NextResponse.json(locations)
  } catch (err) {
    if ((err as Error).name === 'AbortError') {
      return NextResponse.json({ error: 'Geocoding timed out' }, { status: 504 })
    }
    return NextResponse.json({ error: 'Geocoding failed' }, { status: 500 })
  } finally {
    clearTimeout(timeout)
  }
}
