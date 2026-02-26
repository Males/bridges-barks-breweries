import { NextRequest, NextResponse } from 'next/server'
import { createHash } from 'crypto'
import { InMemoryCache } from '@/lib/cache'
import type { OverpassResponse } from '@/types'

const cache = new InMemoryCache<OverpassResponse>()
const CACHE_TTL_MS = 5 * 60 * 1000 // 5 minutes

// Mirrors tried in order — first success wins
const OVERPASS_ENDPOINTS = [
  'https://maps.mail.ru/osm/tools/overpass/api/interpreter',
  'https://overpass-api.de/api/interpreter',
  'https://overpass.kumi.systems/api/interpreter',
]

async function tryOverpass(
  endpoint: string,
  encodedBody: string,
  timeoutMs: number
): Promise<OverpassResponse | null> {
  const ctrl = new AbortController()
  const t = setTimeout(() => ctrl.abort(), timeoutMs)

  try {
    const res = await fetch(endpoint, {
      method: 'POST',
      signal: ctrl.signal,
      headers: {
        'Content-Type': 'application/x-www-form-urlencoded',
        Accept: 'application/json',
      },
      body: encodedBody,
    })

    if (!res.ok) return null

    const text = await res.text()
    if (text.trim().startsWith('<')) return null // HTML error page

    const json = JSON.parse(text) as OverpassResponse
    // Validate it looks like an Overpass response
    if (!Array.isArray(json.elements)) return null

    return json
  } catch {
    return null
  } finally {
    clearTimeout(t)
  }
}

export async function POST(request: NextRequest) {
  let body: { query?: string }
  try {
    body = await request.json()
  } catch {
    return NextResponse.json({ error: 'Invalid JSON body' }, { status: 400 })
  }

  const { query } = body
  if (!query || typeof query !== 'string') {
    return NextResponse.json({ error: 'query is required' }, { status: 400 })
  }

  const cacheKey = createHash('sha256').update(query).digest('hex')
  const cached = cache.get(cacheKey)
  if (cached) {
    return NextResponse.json(cached, { headers: { 'X-Cache': 'HIT' } })
  }

  const encoded = `data=${encodeURIComponent(query)}`

  let data: OverpassResponse | null = null
  for (const endpoint of OVERPASS_ENDPOINTS) {
    data = await tryOverpass(endpoint, encoded, 20000)
    if (data) break
  }

  if (!data) {
    return NextResponse.json(
      { error: 'Overpass unavailable — all mirrors failed' },
      { status: 502 }
    )
  }

  cache.set(cacheKey, data, CACHE_TTL_MS)

  return NextResponse.json(data, {
    headers: {
      'X-Cache': 'MISS',
      'Cache-Control': 's-maxage=300, stale-while-revalidate=60',
    },
  })
}
