import { NextRequest, NextResponse } from 'next/server'

export async function GET(request: NextRequest) {
  const { searchParams } = request.nextUrl
  const waypoints = searchParams.get('waypoints')

  if (!waypoints) {
    return NextResponse.json({ error: 'waypoints is required' }, { status: 400 })
  }

  // Validate format: expect semicolon-separated lon,lat pairs
  const pairs = waypoints.split(';')
  if (pairs.length < 2) {
    return NextResponse.json({ error: 'At least 2 waypoints required' }, { status: 400 })
  }

  for (const pair of pairs) {
    const parts = pair.split(',')
    if (parts.length !== 2 || isNaN(parseFloat(parts[0])) || isNaN(parseFloat(parts[1]))) {
      return NextResponse.json(
        { error: `Invalid waypoint format: ${pair}` },
        { status: 400 }
      )
    }
  }

  const controller = new AbortController()
  const timeout = setTimeout(() => controller.abort(), 20000)

  try {
    const osrmUrl = `https://router.project-osrm.org/route/v1/foot/${waypoints}?steps=true&geometries=geojson&overview=full`

    const res = await fetch(osrmUrl, {
      signal: controller.signal,
      headers: { Accept: 'application/json' },
    })

    if (!res.ok) {
      return NextResponse.json(
        { error: 'Routing unavailable', fallback: true },
        { status: 502 }
      )
    }

    const data = await res.json()

    if (data.code !== 'Ok' || !data.routes?.length) {
      return NextResponse.json(
        { error: 'No route found', fallback: true },
        { status: 502 }
      )
    }

    return NextResponse.json(data)
  } catch (err) {
    if ((err as Error).name === 'AbortError') {
      return NextResponse.json(
        { error: 'Routing timed out', fallback: true },
        { status: 504 }
      )
    }
    return NextResponse.json(
      { error: 'Routing request failed', fallback: true },
      { status: 500 }
    )
  } finally {
    clearTimeout(timeout)
  }
}
