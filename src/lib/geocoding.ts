import type { Location } from '@/types'

export async function searchLocations(
  query: string,
  signal?: AbortSignal
): Promise<Location[]> {
  if (!query || query.trim().length < 3) return []

  try {
    const url = `/api/geocode?q=${encodeURIComponent(query.trim())}&limit=6`
    const res = await fetch(url, { signal })

    if (!res.ok) return []

    const data = await res.json()
    if (!Array.isArray(data)) return []

    return data as Location[]
  } catch (err) {
    if ((err as Error).name === 'AbortError') return []
    console.error('Geocoding error:', err)
    return []
  }
}
