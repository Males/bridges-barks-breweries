import { NextRequest, NextResponse } from 'next/server'
import { createHash } from 'crypto'
import { InMemoryCache } from '@/lib/cache'
import type { OverpassResponse } from '@/types'

// Allow room for retries across mirrors within the serverless budget.
export const maxDuration = 60

const cache = new InMemoryCache<OverpassResponse>()
const CACHE_TTL_MS = 5 * 60 * 1000 // 5 minutes

// Mirrors tried in order — first success wins. Ordered by observed reliability;
// the canonical overpass-api.de and osm.ch are healthiest, mail.ru is a flaky
// last resort. (kumi.systems removed — consistently unavailable.)
const OVERPASS_ENDPOINTS = [
  'https://overpass-api.de/api/interpreter',
  'https://overpass.osm.ch/api/interpreter',
  'https://maps.mail.ru/osm/tools/overpass/api/interpreter',
]

// A descriptive User-Agent is required by the OSM/Overpass usage policy, and
// some mirrors (notably overpass-api.de) reject requests without one (HTTP 406).
const USER_AGENT = 'BridgesBarksBreweries/1.0 (+https://github.com/ dog-walk finder)'

// Per-attempt timeout. Kept short so a single hanging mirror can't consume the
// whole request budget — we'd rather move on and retry another mirror.
const ATTEMPT_TIMEOUT_MS = 25_000

// Stop starting new attempts after this long so we stay inside maxDuration.
// Some healthy mirrors (maps.mail.ru) routinely take 11-14s.
const DEADLINE_MS = 55_000

// Number of full passes over the mirror list. A second pass recovers from
// transient failures (e.g. an occasional 406/504 on an otherwise-healthy host).
const MAX_PASSES = 2

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
        'User-Agent': USER_AGENT,
      },
      body: encodedBody,
    })

    if (!res.ok) return null

    const text = await res.text()
    if (text.trim().startsWith('<')) return null // HTML error page

    const json = JSON.parse(text) as OverpassResponse
    // Validate it looks like an Overpass response
    if (!Array.isArray(json.elements)) return null

    // A mirror with a broken database still answers 200 with valid JSON but
    // zero elements and a non-date timestamp (e.g. overpass.osm.ch returned
    // "117940"). Treat that as a failure so we fall through to a healthy mirror.
    const stamp = (json as { osm3s?: { timestamp_osm_base?: string } }).osm3s
      ?.timestamp_osm_base
    if (!stamp || !/^\d{4}-\d{2}-\d{2}T/.test(stamp)) return null

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
  // Retry across the mirror list: a transient failure on one host in the first
  // pass is often recoverable on a second pass or from another mirror.
  const startedAt = Date.now()
  outer: for (let pass = 0; pass < MAX_PASSES; pass++) {
    for (const endpoint of OVERPASS_ENDPOINTS) {
      const remaining = DEADLINE_MS - (Date.now() - startedAt)
      if (remaining < 5_000) break outer
      data = await tryOverpass(endpoint, encoded, Math.min(ATTEMPT_TIMEOUT_MS, remaining))
      if (data) break outer
    }
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
